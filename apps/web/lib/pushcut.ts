// lib/pushcut.ts
export async function sendPushcutNotification(
    webhookUrl: string,
    payload: { title: string; text: string; input?: string }
) {
    if (!webhookUrl) return;

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(`Pushcut notification failed with status ${response.status}`);
        } else {
            console.log(`Pushcut notification sent successfully`);
        }
    } catch (error) {
        console.error("Error sending Pushcut notification:", error);
    }
}
