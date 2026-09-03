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
import { updatePasswordAction } from '@/lib/actions/auth'
import { useI18n } from '@/lib/i18n/provider'

type FormValues = { password: string }

export function ResetPasswordForm() {
  const { t } = useI18n()
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const schema = z.object({ password: z.string().min(8, t('auth.passwordMinError')) })
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const result = await updatePasswordAction(values)
    if (result.error) {
      setServerError(result.error)
      return
    }
    router.push('/dashboard')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-2xl">{t('auth.resetTitle')}</CardTitle>
        <CardDescription>{t('auth.resetSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t('auth.resetNewPassword')}</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} aria-invalid={!!errors.password} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" size={16} />}
            {t('auth.resetSubmit')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
