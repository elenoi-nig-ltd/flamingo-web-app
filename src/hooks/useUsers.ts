import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASEURL } from '@/config/api/contants';
import { getCookie } from 'cookies-next';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  role: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getCookie('token');
      console.log("Token: ", token)
      const response = await axios.get(`${BASEURL}/users`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserDto): Promise<User> => {
    try {
      const token = getCookie('token');
      const response = await axios.post(`${BASEURL}/users`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => [...prev, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const updateUser = async (id: string, userData: Partial<CreateUserDto>): Promise<User> => {
    try {
      const token = getCookie('token');
      const response = await axios.put(`${BASEURL}/users/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) =>
        prev.map((user) => (user._id === id ? response.data : user))
      );
      setError(null);
      return response.data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      const token = getCookie('token');
      await axios.delete(`${BASEURL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((user) => user._id !== id));
      setError(null);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const getUserById = async (id: string): Promise<User> => {
    try {
      const token = getCookie('token');
      const response = await axios.get(`${BASEURL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setError(null);
      return response.data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
  };
};