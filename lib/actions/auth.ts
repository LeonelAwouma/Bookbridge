'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserType } from '@/lib/supabase/types'

export interface ActionResult {
  error?: string
  success?: boolean
}

export async function signUpAction(input: {
  fullName: string
  email: string
  password: string
  userType: UserType
}): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        user_type: input.userType,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/confirm`,
    },
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function loginAction(input: { email: string; password: string }): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })

  if (error) return { error: error.message }

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
  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/reset-password`,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePasswordAction(input: { password: string }): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: input.password })
  if (error) return { error: error.message }
  return { success: true }
}
