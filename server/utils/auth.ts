/**
 * Robust server-side auth helper
 * Tries serverSupabaseUser (getClaims) first, falls back to getUser()
 */
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'
import type { H3Event } from 'h3'

export async function requireUser(event: H3Event): Promise<{ id: string; email?: string }> {
  // Method 1: Try getClaims (fast, no network call)
  try {
    const claims = await serverSupabaseUser(event)
    if (claims) {
      const id = (claims as any).id || (claims as any).sub
      if (id) {
        return { id, email: (claims as any).email }
      }
    }
  } catch (e: any) {
    console.warn('[auth] getClaims failed:', e?.message)
  }

  // Method 2: Fallback to getUser (network call to Supabase)
  try {
    const client = await serverSupabaseClient(event)
    const { data, error } = await client.auth.getUser()
    if (data?.user) {
      return { id: data.user.id, email: data.user.email }
    }
    if (error) {
      console.warn('[auth] getUser error:', error.message)
    }
  } catch (e: any) {
    console.warn('[auth] getUser failed:', e?.message)
  }

  // Neither method worked
  throw createError({ statusCode: 401, message: 'Not authenticated' })
}
