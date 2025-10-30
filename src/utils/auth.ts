// utils/auth.ts
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  if (!token) {
    console.error('No token found in localStorage');
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};