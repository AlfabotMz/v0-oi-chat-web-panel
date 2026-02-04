import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
    return NextResponse.json({
        message: "API Route is working!",
        time: new Date().toISOString()
    })
}

export async function POST() {
    return NextResponse.json({
        message: "POST is also working!",
        time: new Date().toISOString()
    })
}
