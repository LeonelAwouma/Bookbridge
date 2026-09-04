'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { signUpAction } from '@/lib/actions/auth'
import { signupUserTypes } from '@/lib/data/user-types'
import { useI18n } from '@/lib/i18n/provider'

type FormValues = {
  fullName: string
  email: string
  password: string
  userType: 'individual' | 'school' | 'university' | 'library' | 'ngo' | 'association' | 'company'
}

export function SignupForm() {
  const { t, dict } = useI18n()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const schema = z.object({
    fullName: z.string().min(2, t('auth.fullNameError')),
    email: z.string().email(t('auth.emailError')),
    password: z.string().min(8, t('auth.passwordMinError')),
    userType: z.enum(['individual', 'school', 'university', 'library', 'ngo', 'association', 'company']),
  })

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { userType: 'individual' },
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const result = await signUpAction(values)
    if (result.error) {
      setServerError(result.error)
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('auth.signupTitle')}</CardTitle>
          <CardDescription>{t('auth.checkEmail')}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-2xl">{t('auth.signupTitle')}</CardTitle>
        <CardDescription>{t('auth.signupSubtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">{t('auth.fullName')}</Label>
            <Input id="fullName" autoComplete="name" {...register('fullName')} aria-invalid={!!errors.fullName} />
            {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} aria-invalid={!!errors.email} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} aria-invalid={!!errors.password} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="userType">{t('auth.iAm')}</Label>
            <Controller
              control={control}
              name="userType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="userType" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {signupUserTypes(dict).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" size={16} />}
            {t('nav.signup')}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          {t('auth.orDivider')}
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleAuthButton />

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t('nav.login')}
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
