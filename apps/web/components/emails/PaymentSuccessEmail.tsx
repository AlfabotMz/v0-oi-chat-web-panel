import * as React from 'react';

interface PaymentSuccessEmailProps {
    userName: string;
    transactionId: string;
    date: string;
    amount: string;
    planName: string;
    duration: string;
    pdfLink?: string;
}

export const PaymentSuccessEmail: React.FC<PaymentSuccessEmailProps> = ({
    userName,
    transactionId,
    date,
    amount,
    planName,
    duration,
}) => (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: '#f9fafb' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ margin: 0, color: '#111827', fontSize: '24px', fontWeight: 'bold' }}>OiChat</h1>
                    <p style={{ margin: '5px 0 0', color: '#6b7280', fontSize: '14px' }}>Automação Inteligente</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ margin: 0, color: '#4f46e5', fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase' }}>INVOICE</h2>
                    <p style={{ margin: '5px 0 0', color: '#6b7280', fontSize: '14px' }}>#{transactionId.slice(0, 8).toUpperCase()}</p>
                </div>
            </div>

            {/* Billing Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                <div>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>Faturado Para:</p>
                    <p style={{ margin: '5px 0 0', color: '#111827', fontSize: '16px', fontWeight: 'bold' }}>{userName}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>Data do Pagamento:</p>
                    <p style={{ margin: '5px 0 0', color: '#111827', fontSize: '16px' }}>{date}</p>
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#4f46e5' }}>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ffffff', fontSize: '12px', textTransform: 'uppercase', borderTopLeftRadius: '4px' }}>Descrição</th>
                        <th style={{ padding: '12px', textAlign: 'right', color: '#ffffff', fontSize: '12px', textTransform: 'uppercase' }}>Duração</th>
                        <th style={{ padding: '12px', textAlign: 'right', color: '#ffffff', fontSize: '12px', textTransform: 'uppercase', borderTopRightRadius: '4px' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ padding: '16px 12px', borderBottom: '1px solid #e5e7eb', color: '#111827', fontSize: '14px' }}>
                            <strong>{planName}</strong>
                            <br />
                            <span style={{ color: '#6b7280', fontSize: '12px' }}>Acesso completo à plataforma OiChat</span>
                        </td>
                        <td style={{ padding: '16px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827', fontSize: '14px' }}>{duration}</td>
                        <td style={{ padding: '16px 12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#111827', fontSize: '14px', fontWeight: 'bold' }}>{amount}</td>
                    </tr>
                </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
                <div style={{ width: '200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Subtotal:</span>
                        <span style={{ color: '#111827', fontSize: '14px' }}>{amount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Taxas:</span>
                        <span style={{ color: '#111827', fontSize: '14px' }}>0.00 MT</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#4f46e5', padding: '10px', borderRadius: '4px', color: '#ffffff' }}>
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Total Pago:</span>
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{amount}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#111827', fontSize: '16px', fontWeight: 'bold' }}>Obrigado pela preferência!</p>
                <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '12px' }}>
                    Se tiver dúvidas sobre esta fatura, entre em contato com nosso suporte.
                </p>
                <p style={{ margin: '20px 0 0', color: '#9ca3af', fontSize: '12px' }}>
                    OiChat Inc. • Maputo, Moçambique
                </p>
            </div>
        </div>
    </div>
);
