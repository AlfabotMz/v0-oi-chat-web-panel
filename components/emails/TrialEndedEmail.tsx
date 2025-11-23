import * as React from 'react';

interface TrialEndedEmailProps {
    userName: string;
    planName: string;
    checkoutUrl: string;
}

export const TrialEndedEmail: React.FC<TrialEndedEmailProps> = ({
    userName,
    planName,
    checkoutUrl,
}) => (
    <div style={{ fontFamily: 'sans-serif', color: '#333' }}>
        <h1>Olá, {userName}!</h1>
        <p>Seu período de teste gratuito de 7 dias no <strong>{planName}</strong> acabou.</p>
        <p>Esperamos que você tenha gostado de usar o OiChat para automatizar seu atendimento.</p>
        <p>Para continuar usando todos os recursos e não perder seus agentes configurados, ative sua assinatura agora.</p>
        <p>
            <strong>Oferta Especial:</strong> Pague agora e ganhe <strong>2 Meses</strong> de acesso pelo preço de 1!
        </p>
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
                Ativar Assinatura Agora
            </a>
        </div>
        <p style={{ fontSize: '14px', color: '#666' }}>
            Se você não ativar sua assinatura, seus agentes serão pausados em breve.
        </p>
    </div>
);
