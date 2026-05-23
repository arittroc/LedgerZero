import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Logic to check if user needs onboarding
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: businesses, error: bizError } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1)

        if (!bizError && (!businesses || businesses.length === 0)) {
          // New user detected, redirect to onboarding
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
