'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getServerLocale, translateFor } from '@/lib/i18n/server'
import type { UserType } from '@/lib/supabase/types'

export interface ActionResult {
  error?: string
  success?: boolean
}

function mapAuthError(error: { message: string; code?: string }, locale: string): string {
  const msg = error.message.toLowerCase()
  if (error.code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
    return translateFor(locale, 'auth.emailRateLimitError')
  }
  if (error.code === 'user_already_exists' || msg.includes('already registered') || msg.includes('already exists')) {
    return translateFor(locale, 'auth.userAlreadyExistsError')
  }
  if (error.code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
    return translateFor(locale, 'auth.invalidCredentialsError')
  }
  if (msg.includes('email not confirmed')) {
    return translateFor(locale, 'auth.emailNotConfirmedError')
  }
  return error.message
}

export async function signUpAction(input: {
  fullName: string
  email: string
  password: string
  userType: UserType
}): Promise<ActionResult> {
  const supabase = await createClient()
  const locale = await getServerLocale()

  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        user_type: input.userType,
        locale,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/confirm`,
    },
  })

  if (error) return { error: mapAuthError(error, locale) }
  return { success: true }
}

export async function loginAction(input: { email: string; password: string }): Promise<ActionResult> {
  const supabase = await createClient()
  const locale = await getServerLocale()

  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })

  if (error) return { error: mapAuthError(error, locale) }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function requestPasswordResetAction(input: { email: string }): Promise<ActionResult> {
  const supabase = await createClient()
  const locale = await getServerLocale()
  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/confirm?next=/reset-password`,
  })
  if (error) return { error: mapAuthError(error, locale) }
  return { success: true }
}

export async function updatePasswordAction(input: { password: string }): Promise<ActionResult> {
  const supabase = await createClient()
  const locale = await getServerLocale()
  const { error } = await supabase.auth.updateUser({ password: input.password })
  if (error) return { error: mapAuthError(error, locale) }
  return { success: true }
}
