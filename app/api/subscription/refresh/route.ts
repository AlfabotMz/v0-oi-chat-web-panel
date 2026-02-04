export async function GET() {
    return new Response(JSON.stringify({ test: "atomic_ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    })
}

export async function POST() {
    return new Response(JSON.stringify({ test: "atomic_post_ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    })
}
