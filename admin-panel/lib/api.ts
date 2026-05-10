export async function apiFetch(url: string, options?: RequestInit) {
  const mergedOptions = {
    ...options,
    credentials: (options?.credentials || 'include') as RequestCredentials,
  };

  const res = await fetch(url, mergedOptions);

  if (res.status === 401) {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});

    sessionStorage.removeItem('user');
    localStorage.removeItem('user');

    window.location.href = '/login?session=expired';
    
    throw new Error('Session expired');
  }

  return res;
}