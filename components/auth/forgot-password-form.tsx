'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { requestPasswordResetAction } from '@/lib/actions/auth'
import { useI18n } from '@/lib/i18n/provider'

type FormValues = { email: string }

export function ForgotPasswordForm() {
  const { t } = useI18n()
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const schema = z.object({ email: z.string().email(t('auth.emailError')) })
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const result = await requestPasswordResetAction(values)
    if (result.error) {
      setServerError(result.error)
      return
    }
    setSent(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-2xl">{t('auth.forgotTitle')}</CardTitle>
        <CardDescription>{t('auth.forgotSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 size={16} className="text-primary" /> {t('auth.forgotSent')}
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" size={16} />}
              {t('auth.forgotSubmit')}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
