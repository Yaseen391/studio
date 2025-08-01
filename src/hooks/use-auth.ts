"use client";

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';

const userProfileSchema = z.object({
  name: z.string(),
  designation: z.string(),
  pin: z.string(),
  cnic: z.string(),
});

type UserProfile = z.infer<typeof userProfileSchema>;

const PROFILE_KEY = 'sdc-user-profile';
const AUTH_KEY = 'sdc-auth-session';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(PROFILE_KEY);
      if (storedProfile) {
        setUser(JSON.parse(storedProfile));
      }
      const authSession = sessionStorage.getItem(AUTH_KEY);
      if(authSession === 'true'){
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to load user profile from local storage", error);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const setupUser = useCallback((profileData: Omit<UserProfile, 'id'>) => {
    try {
      const validatedProfile = userProfileSchema.parse(profileData);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(validatedProfile));
      setUser(validatedProfile);
      sessionStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error("Failed to save user profile", error);
      return false;
    }
  }, []);

  const updateUser = useCallback((updatedProfileData: UserProfile) => {
    try {
      const validatedProfile = userProfileSchema.parse(updatedProfileData);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(validatedProfile));
      setUser(validatedProfile);
      return true;
    } catch (error) {
      console.error("Failed to update user profile", error);
      return false;
    }
  }, []);

  const checkPin = useCallback((pin: string) => {
    if (user && user.pin === pin) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, [user]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    isAuthenticated,
    isAuthLoading,
    setupUser,
    updateUser,
    checkPin,
    logout,
  };
}
