// src/components/PurchaseOrders/POForm.jsx
import React, { useState, useEffect } from 'react';
import { getPOData, setPOData } from '../../data/poData';
import { fmtMoney } from '../../utils/formatters'; // Assuming you create this utility

// Mock Item Row Component
function LineItemRow({ index, line, onChange, onDelete, allMaterials }) {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onChange(index, name, value);
    };

    return (
        <tr>
            <td>
                <input
                    placeholder="Item Code"
                    value={line.item}
                    onChange={handleInputChange}
                    name="item"
                />
            </td>
            <td>
                <input 
                    placeholder="Description"
                    value={line.desc}
                    onChange={handleInputChange}
                    name="desc"
                />
            </td>
            <td>
                <input 
                    placeholder="UoM" 
                    style={{ width: '90px' }} 
                    value={line.uom}
                    onChange={handleInputChange}
                    name="uom"
                />
            </td>
            <td style={{ textAlign: 'right' }}>
                <input 
                    name="qty"
                    data-field="qty" 
                    type="number" 
                    min="0" 
                    value={line.qty} 
                    onChange={handleInputChange}
                    style={{ width: '100px', textAlign: 'right' }} 
                />
            </td>
            <td style={{ textAlign: 'right' }}>
                <input 
                    name="price"
                    data-field="price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={line.price} 
                    onChange={handleInputChange}
                    style={{ width: '120px', textAlign: 'right' }} 
                />
            </td>
            <td style={{ textAlign: 'right' }} data-field="linetotal">
                {fmtMoney(line.qty * line.price, 'USD')} {/* Mock currency for lines */}
            </td>
            <td className="actions-cell">
                <button type="button" className="btn bad ghost" style={{ padding: '4px 8px' }} onClick={() => onDelete(index)}>Remove</button>
            </td>
        </tr>
    );
}


function POForm({ updatePOList, allSuppliers, allMaterials }) {
    const [lines, setLines] = useState([{ item: '', desc: '', uom: 'EA', qty: 1, price: 0 }]);
    const [header, setHeader] = useState({
        no: '', date: new Date().toISOString().slice(0, 10), supplier: allSuppliers[0],
        currency: 'USD', terms: 'Net 30', incoterms: 'FOB',
        buyer: 'buyer@company.com', shipTo: 'Main Warehouse, Jaipur',
        pr: '', notes: '', freight: 0, tax: 18, total: 0
    });

    // --- Calculation Hook ---
    const { subtotal, total } = React.useMemo(() => {
        const currentSubtotal = lines.reduce((sum, line) => sum + (Number(line.qty || 0) * Number(line.price || 0)), 0);
        const freight = Number(header.freight || 0);
        const taxPct = Number(header.tax || 0);
        const calculatedTax = currentSubtotal * taxPct / 100;
        const calculatedTotal = currentSubtotal + freight + calculatedTax;
        
        return { subtotal: currentSubtotal, total: calculatedTotal };
    }, [lines, header.freight, header.tax]);

    useEffect(() => {
        setHeader(prev => ({ ...prev, total }));
    }, [total]);

    // --- Line Item Handlers ---
    const handleLineChange = (index, field, value) => {
        const newLines = lines.map((line, i) => {
            if (i === index) {
                return { ...line, [field]: value };
            }
            return line;
        });
        setLines(newLines);
    };

    const handleAddLine = () => {
        setLines([...lines, { item: '', desc: '', uom: 'EA', qty: 1, price: 0 }]);
    };

    const handleDeleteLine = (index) => {
        setLines(lines.filter((_, i) => i !== index));
    };
    
    // --- Header Handlers ---
    const handleHeaderChange = (e) => {
        const { id, value } = e.target;
        setHeader(prev => ({ ...prev, [id.replace('po-', '')]: value }));
    };

    // --- Submission ---
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!header.supplier || lines.length === 0 || lines.some(l => !l.item || Number(l.qty) <= 0)) {
            alert("Please complete the PO header and add valid line items.");
            return;
        }

        const newPO = {
            ...header,
            no: header.no || `PO-NEW-${Math.floor(Math.random() * 10000)}`,
            status: 'Pending Approval',
            subtotal,
            total,
            lines: lines.map(({ item, desc, uom, qty, price }) => ({ item, desc, uom, qty: Number(qty), price: Number(price) })),
            receipts: [],
            invoices: [],
            approvals: [{ step: 1, approver: header.buyer, action: 'Pending', date: header.date }],
            revisions: [],
            docs: []
        };
        
        const db = getPOData();
        db.pos.unshift(newPO);
        setPOData(db);
        updatePOList(); // Notify parent component to refresh
        
        alert(`PO ${newPO.no} submitted for approval!`);
        // Reset form to default blank
        setLines([{ item: '', desc: '', uom: 'EA', qty: 1, price: 0 }]);
        setHeader(prev => ({ ...prev, no: '', notes: '', pr: '' }));
    };

    return (
        <form id="po-form" onSubmit={handleSubmit}>
            <div className="card">
                <div className="modal-head"><h3 style={{ margin: 0 }}>Create Purchase Order</h3></div>
                <div className="modal-body">
                    <div className="detail-grid">
                        <div className="form-group"><label>PO Number</label><input id="po-no" placeholder="Auto or enter (e.g., PO-2025-0200)" value={header.no} onChange={handleHeaderChange} /></div>
                        <div className="form-group"><label>PO Date</label><input type="date" id="po-date" value={header.date} onChange={handleHeaderChange} /></div>
                        <div className="form-group"><label>Supplier</label>
                            <select id="po-supplier" value={header.supplier} onChange={handleHeaderChange}>
                                {allSuppliers.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group"><label>Buyer</label><input id="po-buyer" placeholder="buyer@company.com" defaultValue={header.buyer} disabled /></div>
                        <div className="form-group"><label>Currency</label>
                            <select id="po-currency" value={header.currency} onChange={handleHeaderChange}>
                                <option>INR</option><option>USD</option><option>EUR</option><option>SGD</option>
                            </select>
                        </div>
                        <div className="form-group"><label>Payment Terms</label>
                            <select id="po-terms" value={header.terms} onChange={handleHeaderChange}>
                                <option>Net 30</option><option>Net 60</option><option>On Receipt</option>
                            </select>
                        </div>
                        <div className="form-group"><label>Incoterms</label><input id="po-incoterms" placeholder="FOB, CIF, EXW…" value={header.incoterms} onChange={handleHeaderChange} /></div>
                        <div className="form-group"><label>Ship To (Address)</label><textarea id="po-shipto" rows="2" value={header.shipTo} onChange={handleHeaderChange}></textarea></div>
                    </div>

                    <div className="form-group">
                        <label>Link PR (optional)</label>
                        <input id="po-pr" placeholder="PR-2025-XXXX" value={header.pr} onChange={handleHeaderChange} />
                    </div>

                    <div className="form-group">
                        <label>Notes to Supplier</label>
                        <textarea id="po-notes" rows="2" placeholder="Delivery schedule, packaging, labeling requirements…" value={header.notes} onChange={handleHeaderChange}></textarea>
                    </div>

                    <div className="form-group" style={{ marginTop: '16px' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>Line Items</h3>
                        <div className="table-container">
                            <table className="table" id="po-lines-table">
                                <thead>
                                    <tr>
                                        <th>Item</th><th>Description</th><th>UoM</th><th style={{ textAlign: 'right' }}>Qty</th><th style={{ textAlign: 'right' }}>Unit Price</th><th style={{ textAlign: 'right' }}>Line Total</th>
                                        <th className="actions-cell">
                                            <button type="button" className="btn ghost" id="add-line" style={{ padding: '4px 8px' }} onClick={handleAddLine}>+ Line</button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lines.map((line, index) => (
                                        <LineItemRow
                                            key={index}
                                            index={index}
                                            line={line}
                                            onChange={handleLineChange}
                                            onDelete={handleDeleteLine}
                                            allMaterials={allMaterials}
                                        />
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr><td colSpan="5" style={{ textAlign: 'right' }}><b>Sub Total</b></td><td style={{ textAlign: 'right' }} id="po-subtotal">{fmtMoney(subtotal, header.currency)}</td><td></td></tr>
                                    <tr><td colSpan="5" style={{ textAlign: 'right' }}>Freight</td><td style={{ textAlign: 'right' }}><input id="po-freight" type="number" min="0" defaultValue={header.freight} onChange={handleHeaderChange} style={{ width: '120px', textAlign: 'right' }} /></td><td></td></tr>
                                    <tr><td colSpan="5" style={{ textAlign: 'right' }}>Tax %</td><td style={{ textAlign: 'right' }}><input id="po-tax" type="number" min="0" defaultValue={header.tax} onChange={handleHeaderChange} style={{ width: '120px', textAlign: 'right' }} /></td><td></td></tr>
                                    <tr><td colSpan="5" style={{ textAlign: 'right' }}><b>Total</b></td><td style={{ textAlign: 'right' }} id="po-total">{fmtMoney(total, header.currency)}</td><td></td></tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn ghost" id="btn-save-draft" onClick={() => alert('Draft saved (demo).')}>Save Draft</button>
                    <button type="submit" className="btn" id="btn-submit-approval">Submit for Approval</button>
                </div>
            </div>
        </form>
    );
}

export default POForm;