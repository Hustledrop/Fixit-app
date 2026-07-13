// src/useAuth.js — React hook for auth state
// Returns: user, profile, isPro, authLoading, login, signup, logout, refreshProfile
// Works in guest mode (user=null) when AUTH_AVAILABLE=false

import { useState, useEffect, useCallback } from 'react';
import { AUTH_AVAILABLE, getSession, signIn, signUp, signOut, onAuthStateChange, getProfile } from './auth.js';

export function useAuth() {
  const [user, setUser]         = useState(null);
  const [profile, setProfile]   = useState(null);
  const [authLoading, setLoading] = useState(AUTH_AVAILABLE); // false immediately if no Supabase

  useEffect(() => {
    if (!AUTH_AVAILABLE) { setLoading(false); return; }
    let unsub = () => {};
    getSession().then(session => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) getProfile(u.id).then(setProfile);
      setLoading(false);
    });
    onAuthStateChange(u => {
      setUser(u);
      if (u) getProfile(u.id).then(setProfile);
      else   setProfile(null);
    }).then(fn => { unsub = fn; });
    return () => unsub();
  }, []);

  const isPro = profile?.is_pro === true;

  const login = useCallback(async (email, password) => {
    const data = await signIn(email, password);
    if (data?.user) { setUser(data.user); const p = await getProfile(data.user.id); setProfile(p); }
    return data;
  }, []);

  const signup = useCallback(async (email, password) => {
    const data = await signUp(email, password);
    if (data?.user) { setUser(data.user); const p = await getProfile(data.user.id); setProfile(p); }
    return data;
  }, []);

  const logout = useCallback(async () => {
    await signOut(); setUser(null); setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) { const p = await getProfile(user.id); setProfile(p); }
  }, [user]);

  return { user, profile, isPro, authLoading, login, signup, logout, refreshProfile };
}
