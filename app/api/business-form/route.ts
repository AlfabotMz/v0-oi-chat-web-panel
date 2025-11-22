import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Forward to n8n
        const n8nUrl = process.env.N8N_WEBHOOK_URL ? `${process.env.N8N_WEBHOOK_URL}/business-form` : null

        if (n8nUrl) {
            try {
                await fetch(n8nUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                })
            } catch (error) {
                console.error("Failed to send to n8n:", error)
                // Don't fail the request if n8n fails, just log it
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error processing business form:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
