require("dotenv").config({ path: ".env.local" })

async function testStatus() {
    const agentId = "0c0a4a82-1af3-4466-8633-1b6e71ff933e"
    const token = "EAAhybaU5uMsBReY7AIm5QKQZCeLvZBrvliZBxw2Yg6BpWZAXs1339q49p6fhpr4qXCO2WiZCc8ar1PzcYc8GKDNOLOrCY4UC9nnjk3d0BK6yXN3HZA8IH2Tt2bl3tfOpgqZCc6YZCIpclTEmSNC09wtyTEcof8802Cq1yEpCZAvC4hZCBQqtmpQYooNohmyeIpgTxhV7iocYCrglQC9vK2hS0NyPv9XXpWcMvC8ZC3S0hU5ttHc5qvuzn0ZCEyiDP7Og2OeuskmLKO9PxOYcFXPQqDBvneZCnZAxeIOdZBKuzxCgu1xFciAiQZDZD"
    const phoneId = "165310720006249"
    const wabaId = "186184314573250"

    console.log(`Testing Phone ID: ${phoneId}`)
    try {
        let res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}?fields=status,quality_rating`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        let data = await res.json()
        console.log(`Phone ID result: ${res.status}`, JSON.stringify(data, null, 2))

        if (!res.ok) {
            console.log(`Testing WABA ID: ${wabaId}`)
            res = await fetch(`https://graph.facebook.com/v19.0/${wabaId}?fields=name,status`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            data = await res.json()
            console.log(`WABA ID result: ${res.status}`, JSON.stringify(data, null, 2))
        }
    } catch (e) {
        console.error("Fetch error:", e)
    }
}

testStatus()
