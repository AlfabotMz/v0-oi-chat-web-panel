import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { businessType, whatsapp, monthlyRevenue, market, source } = body

        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                business_type: businessType,
                whatsapp,
                monthly_revenue: monthlyRevenue,
                market,
                source,
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)

        if (updateError) {
            console.error("Error updating profile:", updateError)
            return NextResponse.json(
                { success: false, error: "Failed to update profile" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error in profile update:", error)
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        )
    }
}
