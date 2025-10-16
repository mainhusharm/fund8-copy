import { supabase } from './db';
import { sendWelcomeEmail } from '../services/emailService';

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data, error: userError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, email_verified')
    .eq('id', user.id)
    .maybeSingle();

  if (userError || !data) return null;
  return data;
}

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error || !data.user) {
    return { success: false, error: error?.message || 'Signup failed' };
  }

  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: data.user.id,
      email: email,
      first_name: firstName,
      last_name: lastName,
      email_verified: false,
    });

  if (profileError) {
    return { success: false, error: 'Failed to create user profile' };
  }

  // Send welcome email
  try {
    await sendWelcomeEmail(email, firstName);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  return { success: true, user: data.user };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { success: false, error: error?.message || 'Login failed' };
  }

  return { success: true, user: data.user };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { success: !error, error: error?.message };
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
}
