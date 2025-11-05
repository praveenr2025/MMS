// src/components/Finance/InvoiceModal.jsx
import React, { useState } from 'react';
import { fmtMoney } from '../../utils/formatters';

const mockPOs = [
    { value: 'PO-2025-0145', label: 'PO-2025-0145 (Global Steel)', supplier: 'Global Steel Ltd.' },
    { value: 'PO-2025-0144', label: 'PO-2025-0144 (Apex)', supplier: 'Apex Office Supplies' },
    { value: 'PO-2025-0143', label: 'PO-2025-0143 (Techtronics)', supplier: 'Techtronics Inc.' },
];

function InvoiceModal({ isOpen, onClose, onSubmit }) {
    const [selectedPO, setSelectedPO] = useState(mockPOs[0]);
    const [formData, setFormData] = useState({
        number: '', amount: '', dueDate: '', date: new Date().toISOString().slice(0, 10),
    });

    const handlePOSelChange = (e) => {
        const po = mockPOs.find(p => p.value === e.target.value);
        setSelectedPO(po);
    };
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id.replace('inv-', '')]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.number || !formData.amount) {
            alert('Invoice Number and Amount are required!');
            return;
        }
        onSubmit({ ...formData, poNo: selectedPO.value, supplier: selectedPO.supplier });
        onClose();
    };

    return (
        <div className={`modal ${isOpen ? 'open' : ''}`} id="modal-add-invoice">
            <div className="modal-content">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }}>Register New Invoice</h3>
                    <button className="btn ghost" style={{ padding: 4, borderColor: 'transparent' }} onClick={onClose}><svg style={{ width: 24, height: 24 }}><use href="#icon-close" /></svg></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group">
                                <label htmlFor="inv-po">Related PO</label>
                                <select id="inv-po" onChange={handlePOSelChange} defaultValue={selectedPO.value}>
                                    {mockPOs.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="inv-supplier">Supplier</label>
                                <input type="text" id="inv-supplier" value={selectedPO.supplier} disabled />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group"><label htmlFor="inv-number">Invoice Number</label><input type="text" id="inv-number" placeholder="e.g., INV-9883" onChange={handleChange} required /></div>
                            <div className="form-group"><label htmlFor="inv-date">Invoice Date</label><input type="date" id="inv-date" defaultValue={formData.date} onChange={handleChange} /></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group"><label htmlFor="inv-amount">Invoice Amount ($)</label><input type="number" id="inv-amount" placeholder="e.g., 15450.00" onChange={handleChange} required /></div>
                            <div className="form-group"><label htmlFor="inv-due-date">Payment Due Date</label><input type="date" id="inv-due-date" onChange={handleChange} /></div>
                        </div>
                        <div className="form-group"><label htmlFor="inv-attach">Attach Invoice PDF</label><input type="file" id="inv-attach" style={{ padding: 7 }} /></div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn ok">Submit for Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Create `src/components/Finance/ViewInvoiceModal.jsx`
export function ViewInvoiceModal({ isOpen, onClose, invoice }) {
    if (!invoice) return null;

    const amountDisplay = fmtMoney(invoice.amount, 'USD'); // Mock currency for display
    const statusPillClass = pillColor(invoice.status);

    return (
        <div className={`modal ${isOpen ? 'open' : ''}`} id="modal-view-invoice">
            <div className="modal-content">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }}>View Invoice: {invoice.invNo}</h3>
                    <button className="btn ghost" style={{ padding: 4, borderColor: 'transparent' }} onClick={onClose}><svg style={{ width: 24, height: 24 }}><use href="#icon-close" /></svg></button>
                </div>
                <div className="modal-body">
                    <div className="detail-grid" style={{ marginBottom: 24 }}>
                        <div className="detail-item"><div className="label">Supplier</div><div className="value">{invoice.supplier}</div></div>
                        <div className="detail-item"><div className="label">PO Number</div><div className="value">{invoice.poNo}</div></div>
                        <div className="detail-item"><div className="label">Invoice Date</div><div className="value">{invoice.date}</div></div>
                        <div className="detail-item"><div className="label">Status</div><div className="value"><span className={`pill ${statusPillClass}`}>{invoice.status}</span></div></div>
                        <div className="detail-item" style={{ gridColumn: '1 / -1' }}><div className="label">Amount</div><div className="value" style={{ color: 'var(--bad)' }}>{amountDisplay}</div></div>
                    </div>
                    <div className="form-group">
                        <label>Attached File</label>
                        <a href="#download" className="btn ghost" style={{ textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>{invoice.invNo}.pdf</a>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn ghost" onClick={onClose}>Close</button>
                    <button className="btn warn">Flag Issue</button>
                    <button className="btn ok">Approve for Payment</button>
                </div>
            </div>
        </div>
    );
}

export default InvoiceModal;