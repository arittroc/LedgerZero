import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Determine the correct base URL (handles Vercel's x-forwarded-host)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const baseUrl =
    isLocalEnv || !forwardedHost ? origin : `https://${forwardedHost}`

  if (!code) {
    console.error('[auth/callback] No code param received — possible CSRF or direct navigation.')
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] PKCE exchange failed:', error.message, error)
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error`)
  }

  // Exchange succeeded — check if new user needs onboarding
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)

    if (bizError) {
      console.warn('[auth/callback] Could not query businesses:', bizError.message)
    }

    if (!bizError && (!businesses || businesses.length === 0)) {
      // New user — send to onboarding
      return NextResponse.redirect(`${baseUrl}/onboarding`)
    }
  }

  return NextResponse.redirect(`${baseUrl}${next}`)
}
