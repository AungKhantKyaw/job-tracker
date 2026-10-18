/**
 * Migrate the old Django/PostgreSQL data into this project's MongoDB.
 *
 *   auth_user                    -> users
 *   applications_jobapplication  -> jobs
 *   applications_statushistory   -> jobs.statusHistory[]
 *   distinct status strings      -> statuses
 *
 * Usage:
 *   npm install
 *   npm run dry-run      # reads Postgres, prints what it would do, writes nothing
 *   npm run migrate      # writes to MongoDB
 *
 * Connection settings (env vars, defaults match your docker setup):
 *   PG_URL     postgres://postgres:postgres@localhost:5432/job_tracker
 *   MONGO_URL  mongodb://localhost:27018/jobtracker
 */
const { Client, types } = require("pg");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const PG_URL =
  process.env.PG_URL || "postgres://postgres:postgres@localhost:5432/job_tracker";
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27018/jobtracker";
const DRY_RUN = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");

// Postgres "date" columns: keep the calendar day, avoid timezone shifts.
types.setTypeParser(1082, (v) => new Date(`${v}T00:00:00.000Z`));

const STATUS_COLORS = {
  wishlist: "#6b7280",
  applied: "#2563eb",
  interview: "#d97706",
  interviewing: "#d97706",
  offer: "#16a34a",
  accepted: "#16a34a",
  rejected: "#dc2626",
  withdrawn: "#9ca3af",
};

const clean = (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined);
const prettify = (s) => {
  const t = s.replace(/[_-]+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

async function main() {
  const pg = new Client({ connectionString: PG_URL });
  const mongo = new MongoClient(MONGO_URL);
  await pg.connect();
  await mongo.connect();
  const db = mongo.db();
  const Users = db.collection("users");
  const Jobs = db.collection("jobs");
  const Statuses = db.collection("statuses");

  console.log(DRY_RUN ? "== DRY RUN (nothing will be written) ==" : "== MIGRATING ==");
  console.log(`Postgres: ${PG_URL.replace(/:[^:@/]*@/, ":***@")}`);
  console.log(`MongoDB : ${MONGO_URL}  (db: ${db.databaseName})\n`);

  // Safety: don't create duplicate jobs on a second run.
  const existingJobs = await Jobs.countDocuments();
  if (existingJobs > 0 && !FORCE && !DRY_RUN) {
    throw new Error(
      `The jobs collection already has ${existingJobs} documents. ` +
        `Run against an empty database, or pass --force if you really want to add more.`
    );
  }

  const pgUsers = (await pg.query("SELECT * FROM auth_user ORDER BY id")).rows;
  const pgJobs = (await pg.query("SELECT * FROM applications_jobapplication ORDER BY id")).rows;
  const pgHist = (
    await pg.query("SELECT * FROM applications_statushistory ORDER BY changed_at, id")
  ).rows;

  console.log(`Postgres rows: ${pgUsers.length} users, ${pgJobs.length} jobs, ${pgHist.length} status history`);

  // ---------- statuses ----------
  const labels = new Set();
  pgJobs.forEach((j) => j.status && labels.add(j.status.trim()));
  pgHist.forEach((h) => h.status && labels.add(h.status.trim()));

  const existingStatuses = await Statuses.find().toArray();
  const statusIdByRaw = new Map(); // raw django value -> Mongo _id
  const newStatuses = [];
  const now = new Date();

  for (const raw of labels) {
    const label = prettify(raw);
    const found = existingStatuses.find(
      (s) => s.label.toLowerCase() === label.toLowerCase() || s.label.toLowerCase() === raw.toLowerCase()
    );
    if (found) {
      statusIdByRaw.set(raw, found._id);
    } else {
      const _id = new ObjectId();
      statusIdByRaw.set(raw, _id);
      newStatuses.push({
        _id,
        label,
        color: STATUS_COLORS[raw.toLowerCase()] || "#888888",
        createdAt: now,
        updatedAt: now,
        __v: 0,
      });
    }
  }
  console.log(`Statuses: ${labels.size} distinct (${newStatuses.length} new, ${labels.size - newStatuses.length} already existed)`);

  // ---------- users ----------
  const userIdByPg = new Map();
  const userDocs = [];
  const seenEmails = new Set();
  const skippedUsers = [];
  let inactive = 0;

  for (const u of pgUsers) {
    const email = (clean(u.email) || `${u.username}@migrated.local`).toLowerCase();
    if (seenEmails.has(email)) {
      skippedUsers.push({ id: u.id, email, reason: "duplicate email" });
      continue;
    }
    seenEmails.add(email);
    if (!u.is_active) inactive++;

    // Passwords are NOT carried over (Django PBKDF2 != bcrypt). Random, unusable
    // placeholder: users must use "Forgot password".
    const placeholder = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);

    const name = clean(`${u.first_name || ""} ${u.last_name || ""}`) || u.username;
    const _id = new ObjectId();
    userIdByPg.set(u.id, _id);
    userDocs.push({
      _id,
      name,
      email,
      password: placeholder,
      role: u.is_superuser || u.is_staff ? "admin" : "user",
      isVerified: true,
      createdAt: u.date_joined,
      updatedAt: u.date_joined,
      __v: 0,
    });
  }

  // Skip users whose email already exists in Mongo (re-run safety)
  const existingEmails = new Set(
    (await Users.find({ email: { $in: userDocs.map((u) => u.email) } }, { projection: { email: 1 } }).toArray()).map(
      (u) => u.email
    )
  );
  const usersToInsert = userDocs.filter((u) => !existingEmails.has(u.email));
  if (existingEmails.size) {
    // Link jobs to the existing Mongo users instead
    const existing = await Users.find({ email: { $in: [...existingEmails] } }, { projection: { email: 1 } }).toArray();
    const idByEmail = new Map(existing.map((u) => [u.email, u._id]));
    for (const u of userDocs) {
      if (existingEmails.has(u.email)) {
        for (const [pgId, oid] of userIdByPg) {
          if (oid.equals(u._id)) userIdByPg.set(pgId, idByEmail.get(u.email));
        }
      }
    }
  }
  console.log(
    `Users: ${usersToInsert.length} to insert, ${existingEmails.size} already in Mongo, ` +
      `${skippedUsers.length} skipped, ${inactive} inactive in Django (migrated anyway)`
  );
  skippedUsers.forEach((s) => console.log(`  skipped user ${s.id} <${s.email}>: ${s.reason}`));

  // ---------- jobs ----------
  const histByJob = new Map();
  for (const h of pgHist) {
    if (!histByJob.has(h.job_application_id)) histByJob.set(h.job_application_id, []);
    histByJob.get(h.job_application_id).push(h);
  }

  const jobDocs = [];
  let orphanJobs = 0;
  for (const j of pgJobs) {
    const userId = userIdByPg.get(j.user_id);
    if (!userId) {
      orphanJobs++;
      continue;
    }
    const doc = {
      _id: new ObjectId(),
      user: userId,
      company: j.company,
      role: j.position,
      status: statusIdByRaw.get((j.status || "").trim()),
      statusHistory: (histByJob.get(j.id) || []).map((h) => ({
        _id: new ObjectId(),
        status: statusIdByRaw.get((h.status || "").trim()),
        date: h.changed_at,
      })),
      appliedDate: j.applied_date,
      createdAt: j.created_at,
      updatedAt: j.updated_at,
      __v: 0,
    };
    const optional = {
      location: clean(j.location),
      salaryRange: clean(j.salary_range),
      description: clean(j.description),
      notes: clean(j.notes),
      link: clean(j.job_url),
      followupDate: j.follow_up_date || undefined,
    };
    for (const [k, v] of Object.entries(optional)) if (v !== undefined) doc[k] = v;
    jobDocs.push(doc);
  }
  console.log(`Jobs: ${jobDocs.length} to insert, ${orphanJobs} skipped (user not migrated)`);

  if (DRY_RUN) {
    console.log("\nDry run finished. Nothing was written.");
  } else {
    if (newStatuses.length) await Statuses.insertMany(newStatuses);
    if (usersToInsert.length) await Users.insertMany(usersToInsert);
    if (jobDocs.length) await Jobs.insertMany(jobDocs);

    console.log("\n== VERIFY ==");
    console.log(`Mongo users   : ${await Users.countDocuments()}`);
    console.log(`Mongo jobs    : ${await Jobs.countDocuments()}  (Postgres: ${pgJobs.length})`);
    console.log(`Mongo statuses: ${await Statuses.countDocuments()}`);
    const histTotal = jobDocs.reduce((n, d) => n + d.statusHistory.length, 0);
    console.log(`History entries written: ${histTotal}  (Postgres: ${pgHist.length})`);
    console.log("\nDone. Users must use 'Forgot password' to set a new password.");
  }

  await pg.end();
  await mongo.close();
}

main().catch((err) => {
  console.error("\nMigration failed:", err.message);
  process.exit(1);
});
