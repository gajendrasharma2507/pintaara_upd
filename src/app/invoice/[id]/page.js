import React, { Suspense } from 'react';
import InvoiceViewer from '../InvoiceViewer';

export const metadata = {
    title: 'Official Tax Invoice | Pintaara Atelier',
    description: 'Official verified Tax Invoice for bespoke jewellery pieces crafted by Pintaara.',
};

export default function InvoicePage({ params }) {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                background: '#141210',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D6D2C8',
                fontSize: '0.85rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
            }}>
                Loading Invoice...
            </div>
        }>
            <InvoiceViewer orderIdProp={params?.id} />
        </Suspense>
    );
}
