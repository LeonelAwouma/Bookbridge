'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { requestPasswordResetAction, verifyPasswordResetAction } from '@/lib/actions/auth'
import { useI18n } from '@/lib/i18n/provider'

type EmailFormValues = { email: string }
type OtpFormValues = { token: string; password: string; confirmPassword: string }

export function ForgotPasswordForm() {
  const { t } = useI18n()
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const emailSchema = z.object({ email: z.string().email(t('auth.emailError')) })
  const emailForm = useForm<EmailFormValues>({ resolver: zodResolver(emailSchema) })

  const otpSchema = z
    .object({
      token: z.string().min(6, t('auth.otpRequiredError')),
      password: z.string().min(8, t('auth.passwordMinError')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.resetPasswordMismatchError'),
      path: ['confirmPassword'],
    })
  const otpForm = useForm<OtpFormValues>({ resolver: zodResolver(otpSchema) })

  async function onSubmitEmail(values: EmailFormValues) {
    setServerError(null)
    const result = await requestPasswordResetAction(values)
    if (result.error) {
      setServerError(result.error)
      return
    }
    setEmail(values.email)
    setStep('otp')
  }

  async function onSubmitOtp(values: OtpFormValues) {
    setServerError(null)
    const result = await verifyPasswordResetAction({ email, token: values.token, password: values.password })
    if (result.error) {
      setServerError(result.error)
      return
    }
    router.push('/dashboard')
  }

  async function onResend() {
    setServerError(null)
    setResendMessage(null)
    const result = await requestPasswordResetAction({ email })
    if (result.error) {
      setServerError(result.error)
      return
    }
    setResendMessage(t('auth.resendCodeSent'))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-2xl">{t('auth.forgotTitle')}</CardTitle>
        <CardDescription>{step === 'email' ? t('auth.forgotSubtitle') : t('auth.forgotOtpSent', { email })}</CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'email' ? (
          <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...emailForm.register('email')}
                aria-invalid={!!emailForm.formState.errors.email}
              />
              {emailForm.formState.errors.email && (
                <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={emailForm.formState.isSubmitting}>
              {emailForm.formState.isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {t('auth.forgotSubmit')}
            </Button>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="token">{t('auth.otpLabel')}</Label>
              <Input
                id="token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                {...otpForm.register('token')}
                aria-invalid={!!otpForm.formState.errors.token}
              />
              {otpForm.formState.errors.token && (
                <p className="text-xs text-destructive">{otpForm.formState.errors.token.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">{t('auth.resetNewPassword')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...otpForm.register('password')}
                aria-invalid={!!otpForm.formState.errors.password}
              />
              {otpForm.formState.errors.password && (
                <p className="text-xs text-destructive">{otpForm.formState.errors.password.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword">{t('auth.resetConfirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...otpForm.register('confirmPassword')}
                aria-invalid={!!otpForm.formState.errors.confirmPassword}
              />
              {otpForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{otpForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            {resendMessage && <p className="text-sm text-muted-foreground">{resendMessage}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={otpForm.formState.isSubmitting}>
              {otpForm.formState.isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {t('auth.resetSubmit')}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onResend}>
              {t('auth.resendCode')}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
