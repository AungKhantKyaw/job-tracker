"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/user/login`, {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role);
      localStorage.setItem('userName', response.data.user.name);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      router.push('/admin/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.loginCard}>
        <div style={styles.headerArea}>
          <h2 style={styles.title}>Admin Login</h2>
          <p style={styles.subtitle}>Welcome back! Please enter your details.</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={isLoading ? {...styles.button, opacity: 0.7} : styles.button}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={styles.footer}>
          <p style={styles.footerText}>Secure Admin Access Only</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6', // Light gray background
    backgroundImage: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
  },
  loginCard: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
  headerArea: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #fecaca',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#f9fafb',
  },
  button: {
    marginTop: '10px',
    padding: '12px',
    backgroundColor: '#2563eb', // Modern blue
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '20px',
  },
  footerText: {
    fontSize: '12px',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }
};

export default Login;