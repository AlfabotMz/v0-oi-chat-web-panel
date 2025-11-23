import * as React from 'react';

interface ExpiringSoonEmailProps {
    userName: string;
    daysLeft: number;
    checkoutUrl: string;
}

export const ExpiringSoonEmail: React.FC<ExpiringSoonEmailProps> = ({
    userName,
    daysLeft,
    checkoutUrl,
}) => (
    <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
        <h1>Olá, {userName}!</h1>
        <p>Sua assinatura do OiChat vai expirar em <strong>{daysLeft} dias</strong>.</p>
        <p>Não deixe seu atendimento parar! Renove agora para garantir que seus agentes continuem funcionando sem interrupções.</p>
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <a
                href={checkoutUrl}
                style={{
                    backgroundColor: '#7c3aed',
                    color: 'white',
                    padding: '12px 24px',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontWeight: 'bold'
                }}
            >
                Renovar Assinatura
            </a>
        </div>
        <p style={{ fontSize: '14px', color: '#666' }}>
            Se precisar de ajuda, entre em contato com nosso suporte.
        </p>
    </div>
);
