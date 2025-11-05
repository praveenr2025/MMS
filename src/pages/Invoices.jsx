import React, { useState, useMemo } from 'react';
import InvoiceModal, { ViewInvoiceModal } from '../components/Finance/InvoiceModal';
import { fmtMoney, pillColor } from '../utils/formatters';

// Mock Data
const mockInvoices = [
    { invNo: 'INV-9883', poNo: 'PO-2025-0145', supplier: 'Global Steel Ltd.', amount: 15450.00, date: 'Oct 31, 2025', status: 'Pending Payment' },
    { invNo: 'INV-A450', poNo: 'PO-2025-0144', supplier: 'Apex Office Supplies', amount: 1200.50, date: 'Oct 30, 2025', status: 'Paid' },
    { invNo: 'INV-9850', poNo: 'PO-2025-0141', supplier: 'Global Steel Ltd.', amount: 9800.00, date: 'Oct 28, 2025', status: 'Paid' },
];

function Invoices() {
    const [invoices, setInvoices] = useState(mockInvoices);
    const [registerModalOpen, setRegisterModalOpen] = useState(false);
    const [viewModalData, setViewModalData] = useState(null);

    // Memoized array of invoice rows for rendering
    const invoiceRows = useMemo(() => {
        return invoices.map(inv => ({
            ...inv,
            amountDisplay: fmtMoney(inv.amount, 'USD'),
            statusClass: pillColor(inv.status),
        }));
    }, [invoices]);

    const handleRegisterSubmit = (newInvoiceData) => {
        const newInvoice = {
            invNo: newInvoiceData.number,
            poNo: newInvoiceData.poNo,
            supplier: newInvoiceData.supplier,
            amount: Number(newInvoiceData.amount),
            date: newInvoiceData.date,
            status: 'Pending Payment', // New invoices always start here
        };
        setInvoices([newInvoice, ...invoices]);
        alert(`Invoice ${newInvoice.invNo} registered successfully.`);
    };

    const handleViewClick = (invoice) => {
        setViewModalData(invoice);
    };

    return (
        <div className="page-content">
            <div id="page-invoices">
                <div className="page-header">
                    <h1>Invoice Tracking</h1>
                    <button className="btn" onClick={() => setRegisterModalOpen(true)}>+ Register New Invoice</button>
                </div>
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th><th>PO #</th><th>Supplier</th><th style={{ textAlign: 'right' }}>Amount</th><th>Invoice Date</th><th>Status</th><th className="actions-cell">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceRows.map((inv, i) => (
                                    <tr key={i}>
                                        <td><strong>{inv.invNo}</strong></td>
                                        <td>{inv.poNo}</td>
                                        <td>{inv.supplier}</td>
                                        <td style={{ textAlign: 'right' }}>{inv.amountDisplay}</td>
                                        <td>{inv.date}</td>
                                        <td><span className={`pill ${inv.statusClass}`}>{inv.status}</span></td>
                                        <td className="actions-cell">
                                            <button className="btn ghost" style={{ padding: '5px 10px' }} onClick={() => handleViewClick(inv)}>View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <InvoiceModal 
                isOpen={registerModalOpen} 
                onClose={() => setRegisterModalOpen(false)} 
                onSubmit={handleRegisterSubmit} 
            />
            
            <ViewInvoiceModal 
                isOpen={!!viewModalData} 
                onClose={() => setViewModalData(null)} 
                invoice={viewModalData} 
            />
        </div>
    );
}

export default Invoices;