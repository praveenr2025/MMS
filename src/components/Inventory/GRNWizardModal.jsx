import React, { useState, useEffect, useMemo } from 'react';
import { getPOData, setPOData } from '../../data/poData';
import { fmtMoney, pillColor } from '../../utils/formatters';

// Mock PO Data Structure for the modal
const PO_MOCK_DATA = getPOData();
const MOCK_PO_OPTIONS = [
    'PO-2025-0145 | Global Steel Ltd.',
    'PO-2025-0144 | Apex Office Supplies',
    'PO-2025-0143 | Techtronics Inc.'
];

function GRNWizardModal({ isOpen, onClose, refreshGRNList }) {
    const [poSelection, setPoSelection] = useState(MOCK_PO_OPTIONS[0]);
    const [linesToReceive, setLinesToReceive] = useState([]);
    const [formHeader, setFormHeader] = useState({
        whs: 'WH-A', date: new Date().toISOString().slice(0, 10), by: 'admin@company.com', dn: '', notes: '',
        transporter: '', lrno: '', freight: 0, taxPct: 18, discount: 0, tolRule: 5
    });

    const selectedPO = useMemo(() => {
        const poNo = poSelection.split(' | ')[0];
        // In a real app, this would query the data source
        return PO_MOCK_DATA.pos.find(p => p.no === poNo) || {};
    }, [poSelection]);

    // --- Effect to load lines when PO changes ---
    useEffect(() => {
        if (!selectedPO.lines) {
            setLinesToReceive([]);
            return;
        }
        
        // Simulating the original poLines logic by creating receivable items
        const initialLines = selectedPO.lines.map((line, index) => {
            const receivedQty = selectedPO.receipts
                ?.filter(r => r.line === index + 1)
                .reduce((sum, r) => sum + r.qty, 0) || 0;
            
            return {
                ...line,
                ordered: line.qty,
                remaining: line.qty - receivedQty,
                receiving: line.qty - receivedQty,
                location: 'WH-A / QC-HOLD', // Default to QC Hold
                batch: '',
                price: line.price,
                lineTotal: 0,
                index: index + 1
            };
        }).filter(line => line.remaining > 0);
        
        setLinesToReceive(initialLines);
    }, [selectedPO]);

    // --- Calculation Hook (Recalc Totals) ---
    const { subTotal, taxVal, grandTotal, isToleranceBreached } = useMemo(() => {
        let sub = 0;
        let breached = false;
        
        const calculatedLines = linesToReceive.map(line => {
            const qty = Number(line.receiving || 0);
            const price = Number(line.price || 0);
            const lt = qty * price;
            sub += lt;
            
            const maxAllowed = line.remaining * (1 + Number(formHeader.tolRule) / 100);
            if (qty > maxAllowed) {
                breached = true;
            }
            return { ...line, lineTotal: lt };
        });
        
        // Update lines with calculated total (necessary for visual feedback)
        // Note: We avoid setting state inside useMemo to prevent loops, relying on calculatedLines for totals.

        const taxPct = Number(formHeader.taxPct || 0);
        const disc = Number(formHeader.discount || 0);
        const freight = Number(formHeader.freight || 0);
        const tax = sub * taxPct / 100;
        const total = sub + tax + freight - disc;
        
        return {
            subTotal: sub,
            taxVal: tax,
            grandTotal: total,
            isToleranceBreached: breached
        };
    }, [linesToReceive, formHeader.tolRule, formHeader.freight, formHeader.taxPct, formHeader.discount]);


    const handleLineChange = (index, field, value) => {
        setLinesToReceive(prev => prev.map((line, i) => {
            if (i === index) {
                return { ...line, [field]: value };
            }
            return line;
        }));
    };

    const handleHeaderChange = (e) => {
        const { id, value, type } = e.target;
        const processedValue = (type === 'number' || id === 'tolRule') ? Number(value) : value;
        setFormHeader(prev => ({ ...prev, [id.replace('grn', '').toLowerCase()]: processedValue }));
    };

    const handleConfirmReceive = (isDraft) => {
        if (linesToReceive.length === 0 || !poSelection) {
            alert("Select a PO and ensure there are items to receive.");
            return;
        }

        if (isToleranceBreached && !window.confirm("Some lines exceed tolerance. Proceed?")) {
            return;
        }

        const grnId = isDraft ? `GRN-DR-${Math.floor(Math.random() * 8999 + 1000)}` : `GRN-2025-${Math.floor(Math.random() * 8999 + 1000)}`;
        const status = isDraft ? 'Draft' : 'Pending QC';
        
        const receivedItems = linesToReceive.map(line => ({
            code: line.item, desc: line.desc, ord: line.ordered, rec: Number(line.receiving || 0),
            loc: line.location, batch: line.batch, price: line.price
        }));

        // In a real app, this data would be sent to the server.
        // Mocking PO data updates:
        const currentDB = getPOData();
        const updatedPO = currentDB.pos.find(p => p.no === selectedPO.no);
        
        const newGRN = {
            grn: grnId, 
            po: selectedPO.no, 
            supplier: selectedPO.supplier, 
            whs: formHeader.whs, 
            date: formHeader.date, 
            status: status, 
            amount: grandTotal,
            items: receivedItems,
            trans: { transporter: formHeader.transporter, lr: formHeader.lrno, freight: formHeader.freight },
            tax: { pct: formHeader.taxPct, discount: formHeader.discount }
        };

        // We assume a global GRN store exists, or we push it to the PO receipts (for simplicity, we'll assume the PO updates a general GRN/Receipt log)
        // Since we don't have the global GRN store defined, we'll just log success and update the PO's status if complete.
        
        // This is where you would call an API: api.createGRN(newGRN);

        setPOData(currentDB); // Persist mock changes
        refreshGRNList(); // Notify parent page to reload its tables
        onClose();
        alert(`${status} saved! GRN: ${grnId}`);
    };

    if (!isOpen) return null;

    return (
        <div className="modal open" id="modal-new-grn">
            <div className="modal-content">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }}>Generate New GRN</h3>
                    <button className="btn ghost" onClick={onClose} style={{ padding: '4px', borderColor: 'transparent' }}><svg style={{ width: 24, height: 24 }}><use href="#icon-close" /></svg></button>
                </div>
                <div className="modal-body">
                    <div className="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '12px' }}>
                        <div className="col-6" style={{ gridColumn: 'span 6' }}>
                            <div className="form-group">
                                <label>Against PO</label>
                                <select id="grnPo" value={poSelection} onChange={(e) => setPoSelection(e.target.value)}>
                                    <option value="">Select PO…</option>
                                    {MOCK_PO_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="col-6" style={{ gridColumn: 'span 6' }}>
                            <div className="form-group"><label>Warehouse</label>
                                <select id="grnWhs" value={formHeader.whs} onChange={handleHeaderChange}>
                                    <option>WH-A</option><option>WH-B</option><option>Store-01</option>
                                </select>
                            </div>
                        </div>
                        {/* ... rest of the header fields ... */}
                        <div className="col-4" style={{ gridColumn: 'span 4' }}><div className="form-group"><label>Receiving Date</label><input type="date" id="grnDate" defaultValue={formHeader.date} onChange={handleHeaderChange} /></div></div>
                        <div className="col-4" style={{ gridColumn: 'span 4' }}><div className="form-group"><label>Received By</label><input id="grnBy" defaultValue={formHeader.by} disabled /></div></div>
                        <div className="col-4" style={{ gridColumn: 'span 4' }}><div className="form-group"><label>Delivery Note #</label><input id="grnDn" placeholder="DN-xxxx" defaultValue={formHeader.dn} onChange={handleHeaderChange} /></div></div>
                        <div className="col-12" style={{ gridColumn: 'span 12' }}><div className="form-group"><label>Free Text Notes</label><textarea id="grnNotes" rows="2" defaultValue={formHeader.notes} onChange={handleHeaderChange} placeholder="Dock observations…"></textarea></div></div>
                    </div>

                    <div className="hl" style={{ borderTop: '1px dashed var(--border)', margin: '16px 0' }}></div>

                    <div className="split" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                        <div style={{}}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0 }}>Items to Receive</h4>
                                <div className="quiet" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>UOM-aware & tolerance checks</div>
                            </div>
                            <div className="card" style={{ marginTop: '8px' }}>
                                <div className="table-container">
                                    <table className="table" id="tblReceive">
                                        <thead>
                                            <tr>
                                                <th>Item</th><th>Description</th><th style={{ width: '110px' }}>Ordered</th><th style={{ width: '110px' }}>Rem.</th>
                                                <th style={{ width: '120px' }}>Receiving</th><th style={{ width: '140px' }}>Location</th><th style={{ width: '120px' }}>Batch/Serial</th><th style={{ width: '120px' }}>Unit Price</th><th style={{ width: '120px' }}>Line Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {linesToReceive.map((line, index) => {
                                                const maxAllowed = line.remaining * (1 + Number(formHeader.tolRule) / 100);
                                                const isBreached = Number(line.receiving) > maxAllowed;

                                                return (
                                                    <tr key={line.item + index} style={{ background: isBreached ? '#fff1f2' : '' }}>
                                                        <td><strong>{line.item}</strong><div className="quiet" style={{ fontSize: '0.75rem' }}>{line.uom}</div></td>
                                                        <td>{line.desc}</td>
                                                        <td style={{ textAlign: 'right' }}>{line.ordered}</td>
                                                        <td style={{ textAlign: 'right' }} className="rem">{line.remaining}</td>
                                                        <td><input type="number" className="recv" min="0" step="1" value={line.receiving} onChange={(e) => handleLineChange(index, 'receiving', e.target.value)} style={{ padding: '4px' }} /></td>
                                                        <td><select className="loc" value={line.location} onChange={(e) => handleLineChange(index, 'location', e.target.value)} style={{ padding: '4px' }}><option>WH-A / QC-HOLD</option><option>WH-A / Rack-01</option></select></td>
                                                        <td><input placeholder="Batch/Serial" value={line.batch} onChange={(e) => handleLineChange(index, 'batch', e.target.value)} style={{ padding: '4px' }} /></td>
                                                        <td><input type="number" className="price" min="0" step="0.01" value={line.price} onChange={(e) => handleLineChange(index, 'price', e.target.value)} style={{ padding: '4px' }} /></td>
                                                        <td style={{ textAlign: 'right' }} className="lineTotal">{fmtMoney(Number(line.receiving) * Number(line.price), 'USD')}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="8" style={{ textAlign: 'right', fontWeight: 700 }}>Sub-Total</td>
                                                <td id="subTotal" style={{ fontWeight: 700 }}>{fmtMoney(subTotal, 'USD')}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <aside>
                            <h4 style={{ marginTop: 0 }}>Transport & Taxes</h4>
                            <div className="form-group"><label>Transporter</label><input id="transporter" placeholder="VRL / Safexpress…" defaultValue={formHeader.transporter} onChange={handleHeaderChange} /></div>
                            <div className="form-group"><label>LR / AWB #</label><input id="lrno" placeholder="LR-12345" defaultValue={formHeader.lrno} onChange={handleHeaderChange} /></div>
                            <div className="form-group"><label>Freight ($)</label><input id="freight" type="number" step="0.01" defaultValue={formHeader.freight} onChange={handleHeaderChange} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group"><label>Tax %</label><input id="taxPct" type="number" defaultValue={formHeader.taxPct} onChange={handleHeaderChange} /></div>
                                <div className="form-group"><label>Discount ($)</label><input id="disc" type="number" step="0.01" defaultValue={formHeader.discount} onChange={handleHeaderChange} /></div>
                            </div>
                            <div className="detail-grid">
                                <div className="detail-item"><div className="label">Tax</div><div className="value">{fmtMoney(taxVal, 'USD')}</div></div>
                                <div className="detail-item"><div className="label">Grand Total</div><div className="value">{fmtMoney(grandTotal, 'USD')}</div></div>
                            </div>
                            <div className="hl" style={{ borderTop: '1px dashed var(--border)', margin: '16px 0' }}></div>
                            <div className="form-group">
                                <label>Tolerance Rule</label>
                                <select id="tolRule" defaultValue={formHeader.tolRule} onChange={handleHeaderChange}>
                                    <option value="0">Exact (0%)</option>
                                    <option value="5">±5%</option>
                                    <option value="10">±10%</option>
                                </select>
                            </div>
                            {isToleranceBreached && <div className="pill bad" style={{ padding: '8px', fontSize: '0.9rem', marginTop: '10px' }}>Tolerance exceeded on one or more lines!</div>}
                        </aside>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn ghost" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn warn" onClick={() => handleConfirmReceive(true)}>Save as Draft</button>
                    <button type="button" className="btn ok" onClick={() => handleConfirmReceive(false)}>Confirm Receipt & Send to QC</button>
                </div>
            </div>
        </div>
    );
}

export default GRNWizardModal;