// src/pages/Issue.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initialMIVS, mockInventory, getMIVS, setMIVS, genMivNumber } from '../data/mivData';
import { fmtMoney, pillColor } from '../utils/formatters';

// --- Sub-Components (MIV Modals) ---

// Component for New/Edit MIV Modal
const MIVFormModal = ({ isOpen, onClose, onSave, inventory }) => {
    // --- Inner Components for Modals ---
    const MIVRow = ({ index, item, onUpdate, onDelete, allItems }) => {
        const itemDetails = inventory[item.code] || { desc: '—', uom: '—', avail: 0, locations: [] };

        const handleChange = (e) => {
            const { name, value } = e.target;
            onUpdate(index, name, value);
        };
        
        // Update description and locations when item code changes
        useEffect(() => {
            if (item.code && itemDetails) {
                onUpdate(index, 'desc', itemDetails.desc);
                onUpdate(index, 'uom', itemDetails.uom);
                onUpdate(index, 'avail', itemDetails.avail);
            }
        }, [item.code]); // eslint-disable-line react-hooks/exhaustive-deps

        return (
            <tr>
                <td>{index + 1}</td>
                <td>
                    <select className="itemCode" style={{ padding: '6px' }} value={item.code} name="code" onChange={handleChange}>
                        <option value="">--Select--</option>
                        {allItems.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                </td>
                <td className="desc">{itemDetails.desc}</td>
                <td className="uom">{itemDetails.uom}</td>
                <td className="avail" style={{ textAlign: 'right' }}>{itemDetails.avail.toLocaleString()}</td>
                <td><input type="number" min="0" value={item.qty} name="qty" onChange={handleChange} style={{ width: '110px', padding: '6px' }} /></td>
                <td><input placeholder="Batch/Serial (if any)" value={item.batch} name="batch" onChange={handleChange} style={{ width: '160px', padding: '6px' }} /></td>
                <td>
                    <select className="loc" style={{ padding: '6px' }} value={item.loc} name="loc" onChange={handleChange}>
                        {itemDetails.locations.map(l => <option key={l}>{l}</option>)}
                    </select>
                </td>
                <td className="actions-cell">
                    <button type="button" className="btn bad" style={{ padding: '5px 10px' }} onClick={() => onDelete(index)}>Delete</button>
                </td>
            </tr>
        );
    };

    const initialForm = {
        type: 'Department', dept: '', to: '', date: new Date().toISOString().slice(0, 10),
        cc: '', wbs: '', reason: '', remarks: '', files: [], items: [{ code: '', qty: 0, batch: '', loc: '' }],
    };
    const [formData, setFormData] = useState(initialForm);

    const allItemCodes = useMemo(() => Object.keys(inventory), [inventory]);

    const updateSums = useMemo(() => {
        const lines = formData.items.length;
        let tqty = 0;
        let back = 0;
        
        formData.items.forEach(item => {
            const qty = Number(item.qty || 0);
            tqty += qty;
            const avail = inventory[item.code]?.avail || 0;
            if (qty > avail) back += (qty - avail);
        });

        return { lines, tqty: tqty.toLocaleString(), back: back.toLocaleString() };
    }, [formData.items, inventory]);
    
    // --- Item Line Management ---
    const handleLineUpdate = (index, name, value) => {
        const newItems = formData.items.map((item, i) => {
            if (i === index) {
                return { ...item, [name]: value };
            }
            return item;
        });
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleAddRow = () => {
        setFormData(prev => ({ ...prev, items: [...prev.items, { code: '', qty: 0, batch: '', loc: '' }] }));
    };

    const handleDeleteRow = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
    };
    
    const handleLoadReservation = () => {
        setFormData(prev => ({ 
            ...prev,
            items: [
                ...prev.items, 
                { code: "STL-BAR-10MM", qty: 200, batch: "Heat-HR-NEW", loc: "WH-A / Rack-01" },
                { code: "STL-PLATE-5MM", qty: 10, batch: "", loc: "WH-A / Rack-03" }
            ].filter(item => !!item.code)
        }));
    };

    const handleSave = (asDraft) => {
        if (!formData.dept || !formData.to || !formData.date || !formData.type) {
            alert("Please fill required header fields.");
            return;
        }

        const miv = {
            ...formData,
            no: genMivNumber(getMIVS().length),
            status: asDraft ? "Draft" : "Pending Approval",
            audit: [(asDraft ? "Saved draft" : "Submitted") + " by admin@company.com on " + new Date().toLocaleString()],
            // Finalize items by ensuring numbers are correct
            items: formData.items.map(i => ({ ...i, qty: Number(i.qty) }))
        };

        onSave(miv);
    };

    if (!isOpen) return null;

    return (
        <div className={`modal ${isOpen ? 'open' : ''}`} id="modal-add-issue">
            <div className="modal-content">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }}>New Material Issue Voucher (MIV)</h3>
                    <button className="btn ghost" style={{ padding: 4, borderColor: 'transparent' }} onClick={onClose}><svg style={{ width: 24, height: 24 }}><use href="#icon-close" /></svg></button>
                </div>
                <form id="mivForm" onSubmit={(e) => { e.preventDefault(); handleSave(false); }}>
                    <div className="modal-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            <div className="form-group"><label>Issue Type</label><select id="mivType" required value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}><option>Department</option><option>Work Order</option><option>Project/WBS</option><option>Asset Maintenance</option><option>Employee Tool Issue</option><option>Scrap/Write-off</option></select></div>
                            <div className="form-group"><label>Department</label><input id="mivDept" placeholder="e.g., Production" required value={formData.dept} onChange={e => setFormData({ ...formData, dept: e.target.value })} /></div>
                            <div className="form-group"><label>Issued To</label><input id="mivTo" placeholder="Person / WO / WBS" required value={formData.to} onChange={e => setFormData({ ...formData, to: e.target.value })} /></div>
                            <div className="form-group"><label>Issue Date</label><input type="date" id="mivDate" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
                            <div className="form-group"><label>Cost Center</label><input id="mivCC" placeholder="e.g., CC-1002" value={formData.cc} onChange={e => setFormData({ ...formData, cc: e.target.value })} /></div>
                            <div className="form-group"><label>WBS / Work Order #</label><input id="mivWBS" placeholder="e.g., WO-7781 / WBS-PRJ-01" value={formData.wbs} onChange={e => setFormData({ ...formData, wbs: e.target.value })} /></div>
                        </div>

                        <div className="form-group"><label>Reason</label><input id="mivReason" placeholder="e.g., Issue material for WO-7781" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} /></div>
                        <div className="form-group"><label>Remarks</label><textarea id="mivRemarks" rows="2" placeholder="Any additional notes" value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })}></textarea></div>
                        <div className="form-group"><label>Attachments</label><input type="file" id="mivFiles" multiple style={{ padding: 7 }} /></div>

                        <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '16px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h4 style={{ margin: 0 }}>Line Items</h4>
                            <div>
                                <button className="btn ghost" type="button" onClick={handleAddRow}>+ Add Row</button>
                                <button className="btn ghost" type="button" onClick={handleLoadReservation}>Load Reservation</button>
                            </div>
                        </div>

                        <div className="card">
                            <div className="table-container">
                                <table className="table" style={{ border: 0 }}>
                                    <thead>
                                        <tr><th>#</th><th style={{ minWidth: '180px' }}>Item</th><th>Description</th><th>UOM</th><th style={{ textAlign: 'right' }}>Avail</th><th style={{ width: '120px' }}>Qty</th><th>Batch/Serial</th><th style={{ width: '180px' }}>Location</th><th className="actions-cell">Actions</th></tr>
                                    </thead>
                                    <tbody id="itemRows">
                                        {formData.items.map((item, index) => (
                                            <MIVRow
                                                key={index}
                                                index={index}
                                                item={item}
                                                onUpdate={handleLineUpdate}
                                                onDelete={handleDeleteRow}
                                                allItems={allItemCodes}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="detail-grid" style={{ marginTop: '12px' }}>
                            <div className="detail-item"><div className="label">Lines</div><div className="value">{updateSums.lines}</div></div>
                            <div className="detail-item"><div className="label">Total Qty</div><div className="value">{updateSums.tqty}</div></div>
                            <div className="detail-item"><div className="label">Backorder (if any)</div><div className="value" style={{ color: updateSums.back !== '0' ? 'var(--warn)' : 'var(--ink)' }}>{updateSums.back}</div></div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn ghost" onClick={onClose}>Close</button>
                        <button type="button" className="btn" onClick={() => handleSave(true)}>Save Draft</button>
                        <button type="submit" className="btn ok">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Component for Viewing MIV Details
const ViewMIVModal = ({ isOpen, onClose, miv, inventory, onStatusChange }) => {
    if (!miv) return null;

    const issuedItemsTotalQty = miv.items.reduce((s, it) => s + (it.qty || 0), 0);

    // Dynamic button rendering based on MIV status
    const canCancel = miv.status === "Draft" || miv.status === "Pending Approval";
    const canSubmit = miv.status === "Draft";
    const canApprove = miv.status === "Pending Approval";
    const canIssue = miv.status === "Approved";
    const canReturn = miv.status === "Issued";

    return (
        <div className={`modal ${isOpen ? 'open' : ''}`} id="modal-view-miv">
            <div className="modal-content">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }}>Material Issue Voucher <span id="vmivNo">{miv.no}</span></h3>
                    <button className="btn ghost" style={{ padding: 4, borderColor: 'transparent' }} onClick={onClose}><svg style={{ width: 24, height: 24 }}><use href="#icon-close" /></svg></button>
                </div>
                <div className="modal-body">
                    {/* Header Details */}
                    <div className="detail-grid" style={{ marginBottom: 8 }}>
                        <div className="detail-item"><div className="label">MIV #</div><div className="value">{miv.no}</div></div>
                        <div className="detail-item"><div className="label">Status</div><div className="value" dangerouslySetInnerHTML={{ __html: `<span class="pill ${pillColor(miv.status)}">${miv.status}</span>` }}></div></div>
                        <div className="detail-item"><div className="label">Type</div><div className="value">{miv.type}</div></div>
                        <div className="detail-item"><div className="label">Department</div><div className="value">{miv.dept}</div></div>
                        <div className="detail-item"><div className="label">Issued To</div><div className="value">{miv.to}</div></div>
                        <div className="detail-item"><div className="label">Issue Date</div><div className="value">{new Date(miv.date).toLocaleDateString()}</div></div>
                        <div className="detail-item"><div className="label">Cost Center</div><div className="value">{miv.cc || "-"}</div></div>
                        <div className="detail-item"><div className="label">WBS/WO</div><div className="value">{miv.wbs || "-"}</div></div>
                    </div>
                    
                    {/* Line Items Table */}
                    <h4 style={{ margin: '12px 0 6px' }}>Line Items</h4>
                    <div className="card">
                        <div className="table-container">
                            <table className="table">
                                <thead><tr><th>#</th><th>Item</th><th>Description</th><th style={{ textAlign: 'right' }}>Avail</th><th style={{ textAlign: 'right' }}>Qty</th><th>UOM</th><th>Batch/Serial</th><th>Location</th></tr></thead>
                                <tbody>
                                    {miv.items.map((it, idx) => (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td><strong>{it.code}</strong></td>
                                            <td>{it.desc}</td>
                                            <td style={{ textAlign: 'right' }}>{it.avail}</td>
                                            <td style={{ textAlign: 'right' }}>{it.qty}</td>
                                            <td>{it.uom}</td>
                                            <td>{it.batch || ""}</td>
                                            <td>{it.loc || ""}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Notes & Ledger Preview */}
                    <h4 style={{ margin: '12px 0 6px' }}>Ledger Preview</h4>
                    <div className="card">
                        <div className="table-container">
                            <table className="table">
                                <thead><tr><th>GL</th><th>Description</th><th style={{ textAlign: 'right' }}>Debit</th><th style={{ textAlign: 'right' }}>Credit</th></tr></thead>
                                <tbody>
                                    <tr><td>500100</td><td>Consumption Expense / {miv.cc || miv.wbs || miv.dept}</td><td style={{ textAlign: 'right' }}>{fmtMoney(issuedItemsTotalQty, 'USD')}</td><td></td></tr>
                                    <tr><td>140000</td><td>Inventory</td><td></td><td style={{ textAlign: 'right' }}>{fmtMoney(issuedItemsTotalQty, 'USD')}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Audit Trail */}
                    <h4 style={{ margin: '12px 0 6px' }}>Audit Trail</h4>
                    <ul id="vmivAudit" className="task-list" style={{ listStyleType: 'none', paddingLeft: 0 }}>
                        {miv.audit.map((a, i) => <li key={i}><div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{a}</div></li>)}
                    </ul>
                </div>
                
                {/* Footer Actions */}
                <div className="modal-footer">
                    <button className="btn ghost" onClick={() => window.print()}>Print</button>
                    {canCancel && <button className="btn warn" onClick={() => onStatusChange(miv.no, "Cancelled")}>Cancel MIV</button>}
                    {canSubmit && <button className="btn" onClick={() => onStatusChange(miv.no, "Pending Approval")}>Submit for Approval</button>}
                    {canApprove && <button className="btn ok" onClick={() => onStatusChange(miv.no, "Approved")}>Approve</button>}
                    {canIssue && <button className="btn ok" onClick={() => onStatusChange(miv.no, "Issued")}>Issue Now</button>}
                    {canReturn && <button className="btn" onClick={() => onStatusChange(miv.no, "Return")}>Create Return (MRV)</button>}
                </div>
            </div>
        </div>
    );
};

function Issue() {
    const [mivs, setMivs] = useState(getMIVS());
    const [viewModalData, setViewModalData] = useState(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [filters, setFilters] = useState({ search: '', status: '' });
    
    // Memoized list based on filters
    const filteredMIVs = useMemo(() => {
        return mivs.filter(m => {
            const q = filters.search.toLowerCase();
            const text = [m.no, m.type, m.dept, m.to, m.status].join(" ").toLowerCase();
            const okQ = !q || text.includes(q);
            const okS = !filters.status || m.status === filters.status;
            return okQ && okS;
        });
    }, [mivs, filters]);
    
    // Handlers
    const refreshMivs = useCallback(() => setMivs(getMIVS()), []);

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.id.replace('searchMiv', 'search').replace('statusFilter', 'status')]: e.target.value }));
    };

    const handleSaveMIV = (newMIV) => {
        setMivs(prev => {
            const updated = [newMIV, ...prev];
            setMIVS(updated);
            return updated;
        });
        setCreateModalOpen(false);
        setViewModalData(newMIV); // Show the new MIV immediately
    };
    
    const handleStatusChange = (mivNo, newStatus) => {
        if (!window.confirm(`Confirm action: Change MIV ${mivNo} status to ${newStatus}?`)) return;

        setMivs(prev => {
            const updated = prev.map(m => {
                if (m.no === mivNo) {
                    // Mock stock deduction on 'Issued'
                    if (newStatus === "Issued") {
                        // This would be a server action, here we just update the status
                    }
                    
                    const updatedMIV = { 
                        ...m, 
                        status: newStatus,
                        audit: [...(m.audit || []), `${newStatus} by admin@company.com on ${new Date().toLocaleString()}`]
                    };
                    setViewModalData(updatedMIV); // Update view modal instance immediately
                    return updatedMIV;
                }
                return m;
            });
            setMIVS(updated);
            return updated;
        });
    };

    return (
        <div className="page-content">
            {/* Main Header / Toolbar */}
            <div className="page-header">
                <h1>MIV List</h1>
                <div className="toolbar">
                    <button className="btn" onClick={() => setCreateModalOpen(true)}>+ New Issue Voucher</button>
                    <button className="btn ghost" onClick={() => window.print()}><svg style={{ width: 18, height: 18, verticalAlign: 'middle', marginRight: 6 }}><use href="#icon-print" /></svg>Print</button>
                    <span className="badge">{filteredMIVs.length} records</span>
                </div>
            </div>

            {/* List Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table" id="mivTable">
                        <thead>
                            <tr>
                                <th>MIV #</th><th>Type</th><th>Department</th><th>Issued To</th><th>Issue Date</th><th>Status</th><th className="actions-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="mivBody">
                            {filteredMIVs.map(m => (
                                <tr key={m.no}>
                                    <td><strong>{m.no}</strong></td>
                                    <td>{m.type}</td>
                                    <td>{m.dept}</td>
                                    <td>{m.to}</td>
                                    <td>{new Date(m.date).toLocaleDateString()}</td>
                                    <td dangerouslySetInnerHTML={{ __html: `<span class="pill ${pillColor(m.status)}">${m.status}</span>` }}></td>
                                    <td className="actions-cell">
                                        <button className="btn ghost" style={{ padding: '5px 10px' }} onClick={() => setViewModalData(m)}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <MIVFormModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSave={handleSaveMIV}
                inventory={mockInventory}
            />
            
            <ViewMIVModal
                isOpen={!!viewModalData && viewModalData.no !== 'modal-return'}
                onClose={() => setViewModalData(null)}
                miv={viewModalData}
                inventory={mockInventory}
                onStatusChange={handleStatusChange}
            />

            {/* The Return (MRV) modal logic is mock handled via the ViewMIVModal's onStatusChange trigger */}
        </div>
    );
}

export default Issue;