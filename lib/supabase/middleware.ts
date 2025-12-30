import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    })

    // [v0] Added console logs to debug which environment variables are being read
    console.log("[v0] Checking Supabase environment variables...")
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC__SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC__SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      // [v0] Improved error message to include which variables were checked
      console.error(
        `[v0] Middleware Error: Missing Supabase environment variables.
        NEXT_PUBLIC_SUPABASE_URL: ${!!process.env.NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC__SUPABASE_URL: ${!!process.env.NEXT_PUBLIC__SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
        NEXT_PUBLIC__SUPABASE_ANON_KEY: ${!!process.env.NEXT_PUBLIC__SUPABASE_ANON_KEY}`,
      )
      return supabaseResponse
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    // IMPORTANT: DO NOT REMOVE auth.getUser()
    // This will refresh the session if needed
    await supabase.auth.getUser()

    return supabaseResponse
  } catch (e) {
    console.error("Middleware Error:", e)
    // Return the original response (or a new one) to prevent the app from crashing
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}
