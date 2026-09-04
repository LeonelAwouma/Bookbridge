import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'

// Fire-and-forget by design: a broken email must never break the action that
// triggered it (accepting a request, sending a message, etc), so every
// failure here is caught and logged instead of thrown.
export async function notifyByEmail(profileId: string, subject: string, body: string | null, link: string | null): Promise<void> {
  try {
    const supabase = await createAdminClient()

    const { data: profile } = await supabase.from('profiles').select('email_notifications_enabled').eq('id', profileId).maybeSingle()
    if (profile && !profile.email_notifications_enabled) return

    const { data } = await supabase.auth.admin.getUserById(profileId)
    const email = data.user?.email
    if (!email) return

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const url = link ? `${siteUrl}${link}` : siteUrl

    await sendEmail({
      to: email,
      subject,
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <p style="color: #e56b4c; font-weight: 800; font-size: 18px; margin-bottom: 24px;">BookBridge</p>
          <h2 style="font-size: 20px; margin: 0 0 12px;">${subject}</h2>
          ${body ? `<p style="color: #555; line-height: 1.6;">${body}</p>` : ''}
          <p style="margin-top: 24px;">
            <a href="${url}" style="display: inline-block; background: #e56b4c; color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 700;">
              Open BookBridge
            </a>
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('notifyByEmail failed for profile', profileId, err)
  }
}
