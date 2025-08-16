import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useUrlParams } from './useUrlParams';

export function useUsers() {
  const { getUrlUsers } = useUrlParams();
  const [users, setUsers] = useLocalStorage<string[]>('users', ['bank']);

  // Initialize users from URL params if available
  useEffect(() => {
    const sharedUsers = getUrlUsers();
    
    if (sharedUsers) {
      try {
        const parsedUsers = JSON.parse(sharedUsers);
        setUsers(parsedUsers);
      } catch (error) {
        console.error('Error parsing users from URL', error);
      }
    }
  }, []);

  return [users, setUsers] as const;
}
