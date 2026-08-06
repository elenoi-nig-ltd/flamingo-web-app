import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BASEURL } from '@/config/api/contants';
import { clearAuthSession, isAuthTokenExpired } from '@/utils/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthResponse {
  access_token: string;
  user: User;
}

// Enhanced error message extraction
const extractErrorMessage = (errorData: any, status?: number): string => {
  console.log('Raw error data received:', errorData);

  // Handle 401 responses specifically
  if (status === 401) {
    return 'Invalid email or password';
  }

  // Handle string errors
  if (typeof errorData === 'string') {
    return errorData;
  }

  // Handle Error objects
  if (errorData instanceof Error) {
    return errorData.message;
  }

  // Handle NestJS error response structure
  if (errorData && typeof errorData === 'object') {
    // Check for common NestJS error response structures
    
    // Case 1: Direct message property
    if (errorData.message) {
      return Array.isArray(errorData.message)
        ? errorData.message.join(', ')
        : errorData.message;
    }

    // Case 2: NestJS HttpException format with error object
    if (errorData.error && typeof errorData.error === 'object') {
      if (errorData.error.message) {
        return Array.isArray(errorData.error.message)
          ? errorData.error.message.join(', ')
          : errorData.error.message;
      }
      
      // If error is a string in the error object
      if (typeof errorData.error === 'string') {
        return errorData.error;
      }
    }

    // Case 3: Response from fetch with status text
    if (errorData.statusText) {
      return errorData.statusText;
    }

    // Case 4: Try to stringify the entire object for debugging
    try {
      const stringified = JSON.stringify(errorData);
      if (stringified !== '{}' && stringified !== 'null') {
        return stringified;
      }
    } catch {
      // Fall through to default message
    }
  }

  // Default fallback message
  return 'An unexpected error occurred. Please try again.';
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // On initial load, check if token and user exist in localStorage
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token) {
        setLoading(false);
        localStorage.removeItem('user');
        return;
      }

      if (isAuthTokenExpired(token)) {
        clearAuthSession();
        setUser(null);
        setLoading(false);
        return;
      }

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setLoading(false);
          return;
        } catch (err) {
          console.error('Error parsing stored user:', err);
        }
      }

      try {
        const res = await fetch(`${BASEURL}/auth/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);



const login = async (email: string, password: string) => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch(`${BASEURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.log('Login error response:', { 
        status: response.status, 
        statusText: response.statusText,
        data: responseData 
      });
      
      const errorMessage = extractErrorMessage(responseData, response.status);
      throw new Error(errorMessage);
    }

    const data: AuthResponse = responseData;
    setUser(data.user);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));

    // Redirect based on user role
    if (data.user.role === 'landlord') {
      router.push('/landlord/dashboard');
    } else {
      router.push('/admin/dashboard');
    }
  } catch (err) {
    console.error('Login error:', err);
    const errorMessage = extractErrorMessage(err);
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const register = async (name: string, email: string, password: string, role: string = 'staff') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASEURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.log('Registration error response:', { status: response.status, data: responseData });

        // Handle 409 Conflict specifically
        if (response.status === 409) {
          throw new Error('Email already exists. Please use a different email address.');
        }

        const errorMessage = extractErrorMessage(responseData);
        throw new Error(errorMessage);
      }

      const data: AuthResponse = responseData;
      setUser(data.user);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on user role after registration
      if (data.user.role === 'landlord') {
        router.push('/landlord/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);

    // Redirect to appropriate login page based on current user role
    if (user?.role === 'landlord') {
      router.push('/landlord/login');
    } else {
      router.push('/admin/login');
    }
  };

  return { user, loading, error, login, register, logout };
};
