import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializar cliente do Supabase com Service Role Key para ignorar RLS
// É necessário para webhooks, já que eles não virão com o token de autorização do usuário
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
    try {
        const payload = await request.json();

        const { date, agentId, userNumber, form } = payload;

        if (!agentId || !userNumber || !form) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Inserir lead convertido na tabela leads
        const { data, error } = await supabase
            .from('leads')
            .insert([
                {
                    agent_id: agentId,
                    user_number: userNumber,
                    form: form,
                    date: date || new Date().toISOString().split('T')[0],
                }
            ])
            .select();

        if (error) {
            console.error('Error inserting webhook data into leads:', error);
            return NextResponse.json({ error: 'Failed to insert lead' }, { status: 500 });
        }

        console.log(`New lead notification received and saved for agent: ${agentId}`);

        // Pushcut Notification Logic
        try {
            const { data: agent } = await supabase
                .from('agents')
                .select('user_id, custom_message')
                .eq('id', agentId)
                .single();

            if (agent?.user_id) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('pushcut_url')
                    .eq('id', agent.user_id)
                    .single();

                if (profile?.pushcut_url) {
                    const fallbackMessage = "🚨 Nova Encomenda Recebida!\n\n💸 Produto: {{product}}\n\n💸 Quantidade: {{quantity}}\n\n💸 Valor: {{price}}\n\n💸 Número: {{phone}}\n\n💸 Local: {{location}}\n\n💸 Data: {{date}}";
                    const template = agent.custom_message || fallbackMessage;

                    const formattedText = template
                        .replace(/{{product}}/g, form.product || "N/A")
                        .replace(/{{quantity}}/g, form.quantity || "1")
                        .replace(/{{price}}/g, form.price || form.amount || "N/A")
                        .replace(/{{phone}}/g, form.phone || userNumber || "N/A")
                        .replace(/{{location}}/g, form.location || form.address || "N/A")
                        .replace(/{{date}}/g, date || new Date().toISOString().split('T')[0]);

                    await fetch(profile.pushcut_url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: "🚨 Nova encomenda recebida!",
                            text: formattedText,
                        })
                    });
                    console.log(`Pushcut notification triggered for user: ${agent.user_id}`);
                }
            }
        } catch (pushcutError) {
            console.error('Failed to trigger Pushcut notification:', pushcutError);
        }

        return NextResponse.json({ success: true, lead: data[0] });

    } catch (error) {
        console.error('Failed to process webhook:', error);
        return NextResponse.json({ error: 'Failed to process webhook' }, { status: 400 });
    }
}
