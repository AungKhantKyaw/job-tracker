"use client";
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={styles.hero}>
      <h1 style={styles.title}>Track Your Career Journey</h1>
      <p style={styles.subtitle}>The simple way to organize your job search, interviews, and offers.</p>
      
      <div style={styles.ctaGroup}>
        <Link href="/register" style={styles.primaryBtn}>Get Started for Free</Link>
        <Link href="/login" style={styles.secondaryBtn}>Sign In</Link>
      </div>
    </div>
  );
}

const styles = {
  hero: { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', background: '#fff' },
  title: { fontSize: '48px', fontWeight: '800', color: '#111827', marginBottom: '16px' },
  subtitle: { fontSize: '18px', color: '#6b7280', maxWidth: '600px', marginBottom: '32px' },
  ctaGroup: { display: 'flex', gap: '16px' },
  primaryBtn: { padding: '14px 28px', backgroundColor: '#2563eb', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: '600' },
  secondaryBtn: { padding: '14px 28px', backgroundColor: 'white', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '10px', textDecoration: 'none', fontWeight: '600' }
};