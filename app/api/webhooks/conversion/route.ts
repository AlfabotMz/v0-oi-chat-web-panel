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

        return NextResponse.json({ success: true, lead: data[0] });

    } catch (error) {
        console.error('Failed to process webhook:', error);
        return NextResponse.json({ error: 'Failed to process webhook' }, { status: 400 });
    }
}
