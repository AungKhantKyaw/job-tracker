const test = require("node:test");
const assert = require("node:assert");

// Keep the test hermetic: don't depend on a local .env being present.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.NODE_ENV = process.env.NODE_ENV || "test";

const { app } = require("../server");

// Start the app on an ephemeral port so tests don't need a fixed one.
const withServer = async (fn) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  try {
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

test("GET / reports the server is up", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);
    assert.match(await res.text(), /Server is up and running!/);
  });
});

test("unknown routes return 404", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/does-not-exist`);
    assert.strictEqual(res.status, 404);
  });
});

test("protected routes reject requests without a token", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/user/profile`);
    assert.strictEqual(res.status, 401);
  });
});
