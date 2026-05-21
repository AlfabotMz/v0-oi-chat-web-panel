import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Forward to backend
        const baseUrl = process.env.API_URL || process.env.N8N_WEBHOOK_URL || ""
        const backendUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}/business-form` : null

        if (backendUrl) {
            try {
                await fetch(backendUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                })
            } catch (error) {
                console.error("Failed to send to backend:", error)
                // Don't fail the request if it fails, just log it
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error processing business form:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
