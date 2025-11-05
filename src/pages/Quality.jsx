// src/pages/Quality.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { initialData } from '../data/qualityData'; // Assuming this data file exists
import { pillColor } from '../utils/formatters'; // Assuming this utility exists

// --- Reusable Modal Definition: NCR Modal ---
function NCRModal({ isOpen, onClose, initialData = {} }) {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`NCR Submitted for GRN ${initialData.grn || '—'}. (Demo)`);
        onClose();
    };

    return (
        <div className={`modal open`} id="modal-ncr">
            <div className="modal-content">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }}>Raise NCR</h3>
                    <button className="btn ghost" onClick={onClose}><svg style={{ width: 24, height: 24 }}><use href="#icon-close" /></svg></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group"><label>GRN</label><input id="ncr-grn" defaultValue={initialData.grn || ''} readOnly /></div>
                            <div className="form-group"><label>Item</label><input id="ncr-item" defaultValue={initialData.item || ''} readOnly /></div>
                            <div className="form-group"><label>Defect Type</label><select id="ncr-defect"><option>Dimensional</option><option>Surface</option><option>Chemical</option><option>Functional</option></select></div>
                            <div className="form-group"><label>Qty Affected</label><input id="ncr-qty" type="number" /></div>
                            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Description</label><textarea id="ncr-desc" rows="2"></textarea></div>
                            <div className="form-group"><label>Proposed Disposition</label><select id="ncr-disp"><option>Return to Vendor</option><option>Rework</option><option>Use as is (Deviation)</option><option>Scrap</option></select></div>
                            <div className="form-group"><label>Attach Photos</label><input type="file" multiple /></div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn ok">Save NCR</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Reusable Modal Definition: CAPA Modal (8D) ---
function CAPAModal({ isOpen, onClose, initialData = {} }) {
    if (!isOpen) return null;
    
    // Mock NCRs for the dropdown
    const mockNCRs = initialData.ncrs || [{ no: 'NCR-2025-004' }, { no: 'NCR-2025-005' }]; 

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`CAPA (8D) submitted/saved. (Demo)`);
        onClose();
    };

    return (
        <div className={`modal open`} id="modal-capa">
            <div className="modal-content">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }}>Create CAPA (8D)</h3>
                    <button className="btn ghost" onClick={onClose}><svg style={{ width: 24, height: 24 }}><use href="#icon-close" /></svg></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div className="form-group"><label>Linked NCR</label><select id="capa-ncr" defaultValue={initialData.linkedNcr}><option value="">— Select NCR —</option>{mockNCRs.map(n => <option key={n.no}>{n.no}</option>)}</select></div>
                            <div className="form-group"><label>Owner</label><input id="capa-owner" defaultValue="qc.lead@company.com" /></div>
                            <div className="form-group"><label>Due Date</label><input id="capa-due" type="date" /></div>
                        </div>
                        {/* D1 through D8 fields (as per the original HTML structure) */}
                        <div className="form-group"><label>D1 Team</label><textarea id="d1" rows="2" placeholder="Team members & roles"></textarea></div>
                        <div className="form-group"><label>D2 Problem Statement</label><textarea id="d2" rows="2"></textarea></div>
                        <div className="form-group"><label>D3 Containment</label><textarea id="d3" rows="2"></textarea></div>
                        <div className="form-group"><label>D4 Root Cause (5-Why / Fishbone)</label><textarea id="d4" rows="2"></textarea></div>
                        <div className="form-group"><label>D5 Permanent Corrective Action</label><textarea id="d5" rows="2"></textarea></div>
                        <div className="form-group"><label>D6 Implement & Validate</label><textarea id="d6" rows="2"></textarea></div>
                        <div className="form-group"><label>D7 Prevent Recurrence</label><textarea id="d7" rows="2"></textarea></div>
                        <div className="form-group"><label>D8 Team Recognition</label><textarea id="d8" rows="2"></textarea></div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn ok">Save CAPA</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
const TAB_LINKS = [
    { href: 'queue', label: 'Inspection Queue' }, { href: 'execute', label: 'Perform Inspection' }, 
    { href: 'ncr', label: 'NCR (Non‑Conformance)' }, { href: 'capa', label: 'CAPA & 8D' }, 
    { href: 'plans', label: 'Test & Sampling Plans' }, { href: 'vendor', label: 'Vendor Quality Scorecard' }, 
    { href: 'hold', label: 'QC Hold & Disposition' }, { href: 'coa', label: 'COA / Attachments' }, 
    { href: 'calib', label: 'Calibration & Instruments' }, { href: 'audit', label: 'Audit Trail' }, 
    { href: 'settings', label: 'Settings' }
];


function Quality() {
    const [data, setData] = useState(initialData);
    const [activeTab, setActiveTab] = useState('queue');
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState({ type: null, data: null }); // Controls modal state

    // --- Hash-based Tab Switching Logic ---
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.substring(1) || 'queue';
            setActiveTab(hash);
        };
        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    const switchTab = (hash) => {
        window.location.hash = hash;
        setActiveTab(hash);
    };

    // --- Filtered Queue List ---
    const filteredQueue = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return data.queue.filter(r => (r.grn + r.item + r.desc).toLowerCase().includes(q));
    }, [data.queue, searchTerm]);
    
    const renderPill = (status) => <span className={`pill ${pillColor(status)}`}>{status}</span>;


    // --- Generic Table Renderer ---
const renderTable = (rows, headers, actions = true, customDataKey = 'id') => (
    <div className="card">
        <div className="table-container">
            <table className="table">
                {/* 1. Header Row (TH) */}
                <thead>
                    <tr>
                        {headers.map((h, i) => <th key={i} style={h.style}>{h.label}</th>)}
                        {/* Only render Actions TH if actions=true */}
                        {actions && <th className="actions-cell">Actions</th>} 
                    </tr>
                </thead>
                <tbody>
                    {/* 2. Data Rows (TR/TD) */}
                    {rows.map((r, i) => (
                        <tr key={r[customDataKey] || i}>
                            {headers.map((h, j) => (
                                // Use h (header object) and r (row data object) here
                                <td 
                                    key={j} 
                                    className={h.align || 'left'} 
                                    dangerouslySetInnerHTML={{ __html: h.render ? h.render(r) : (r[h.key] || '—') }}
                                />
                            ))}
                            {/* Actions TD */}
                            {actions && <td className="actions-cell">
                                <button className="btn ghost" style={{ padding: '5px 10px' }}>Action</button>
                            </td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

    // --- Tab Contents Data/Headers ---
    const InspectionQueueTab = () => (
        <section data-tab="queue" id="sec-queue" className={`card ${activeTab === 'queue' ? 'show' : ''}`} style={{ padding: '14px' }}>
            <div className="page-header">
                <h1 style={{ fontSize: '1.3rem' }}>Inspection Queue</h1>
                <div className="toolbar">
                    <a className="btn ghost" href="#bulkAccept">Bulk Accept</a>
                    <a className="btn warn" href="#bulkReject">Bulk Reject</a>
                    <span className="pill blue" id="queueCount">{filteredQueue.length} pending</span>
                </div>
            </div>
            {renderTable(filteredQueue, [
                { label: <input type="checkbox" id="chkAll" onClick={() => alert('Toggle all')} />, key: 'id', render: (r) => `<input type="checkbox" class="chkRow" data-id="${r.id}" />` },
                { label: 'GRN', key: 'grn', render: (r) => `<strong>${r.grn}</strong>` }, { label: 'Item', key: 'item' }, { label: 'Description', key: 'desc' },
                { label: 'Qty', key: 'qty', style: { textAlign: 'right' } }, { label: 'Sampling', key: 'sampling' }, { label: 'Test Plan', key: 'plan' },
                { label: 'Priority', key: 'prio', render: (r) => `<span class="pill ${pillColor(r.prio)}">${r.prio}</span>` }, { label: 'Received', key: 'date' },
            ],false)}
        </section>
    );

    const PerformInspectionTab = () => {
        const currentItem = filteredQueue[0] || { grn: 'GRN-000', item: '—', qty: '0', sampling: '—' };
        const inspectionPlan = data.testPlans.find(p => p.item === currentItem.item) || data.testPlans[0];

        return (
            <section data-tab="execute" id="sec-execute" className={`card ${activeTab === 'execute' ? 'show' : ''}`} style={{ padding: '14px' }}>
                <div className="page-header"><h1 style={{ fontSize: '1.3rem' }}>Perform Inspection: {currentItem.grn} / {currentItem.item}</h1></div>
                <div className="grid-2">
                    <div className="card" style={{ padding: '12px' }}>
                        <div className="detail-grid">
                            <div className="detail-item"><div className="label">GRN</div><div className="value">{currentItem.grn}</div></div>
                            <div className="detail-item"><div className="label">Item</div><div className="value">{currentItem.item}</div></div>
                            <div className="detail-item"><div className="label">Qty @ QC</div><div className="value">{currentItem.qty}</div></div>
                            <div className="detail-item"><div className="label">Sampling Plan</div><div className="value">{currentItem.sampling}</div></div>
                        </div>
                        <div className="form-group"><label>Attach Photos</label><input type="file" multiple /></div>
                        <div className="form-group"><label>Remarks</label><textarea rows="2" placeholder="Observations, visual checks, etc."></textarea></div>
                    </div>
                    <div className="card" style={{ padding: '12px' }}>
                        <h3 style={{ margin: '0 0 8px' }}>Measurements</h3>
                        <div id="measurements">
                            {inspectionPlan.params.map((p, i) => (
                                <div className="grid-3" key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                    <div className="form-group"><label>{p.name} ({p.uom})</label><input type="number" step="any" placeholder="Result" /></div>
                                    <div className="form-group"><label>LSL</label><input defaultValue={p.lsl} disabled /></div>
                                    <div className="form-group"><label>USL</label><input defaultValue={p.usl} disabled /></div>
                                </div>
                            ))}
                        </div>
                        <div className="hint">Limits auto-pulled from Test Plan.</div>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <a className="btn bad" href="#reject" onClick={() => alert('Reject (Demo)')}>Reject</a>
                            <a className="btn ok" href="#accept" onClick={() => alert('Accept & Move (Demo)')}>Accept & Move to Stock</a>
                            <a className="btn warn" href="#raiseNCR" onClick={() => setModal({ type: 'ncr', data: currentItem })}>Raise NCR</a>
                        </div>
                    </div>
                </div>
            </section>
        );
    };

    const CalibTab = () => (
        <section data-tab="calib" id="sec-calib" className={`card ${activeTab === 'calib' ? 'show' : ''}`} style={{ padding: '14px' }}>
            <div className="page-header"><h1 style={{ fontSize: '1.3rem' }}>Calibration & Instruments</h1></div>
            {renderTable(data.calib, [
                { label: 'Instrument', key: 'inst' }, { label: 'Serial', key: 'serial' }, { label: 'Last Calib', key: 'last' },
                { label: 'Next Due', key: 'next' }, { label: 'Status', key: 'status', render: (r) => `<span class="pill ${pillColor(r.status)}">${r.status}</span>` },
            ])}
        </section>
    );

    return (
        <div className="page-content">
            <div className="kpi-grid">
                <div className="card kpi"><div className="label">Pending Inspections</div><div className="value">{data.kpis.pending}</div></div>
                <div className="card kpi"><div className="label">Rejection Rate (MTD)</div><div className="value" style={{ color: 'var(--bad)' }}>{data.kpis.rejectRate}</div></div>
                <div className="card kpi"><div className="label">Avg. QC Lead Time</div><div className="value">{data.kpis.qcLeadTime}</div></div>
                <div className="card kpi"><div className="label">Open CAPAs</div><div className="value">{data.kpis.openCapas}</div></div>
            </div>

            <div className="tabbar" id="tabbar">
                {TAB_LINKS.map(link => (
                    <a key={link.href} href={`#${link.href}`} className={`tablink ${activeTab === link.href ? 'active' : ''}`} onClick={() => switchTab(link.href)}>
                        {link.label}
                    </a>
                ))}
            </div>

            {/* --- Render Active Section --- */}
            {activeTab === 'queue' && <InspectionQueueTab />}
            {activeTab === 'execute' && <PerformInspectionTab />}
            {activeTab === 'ncr' && <NCRTab />}
            {activeTab === 'capa' && <CAPAModal isOpen={modal.type === 'capa'} onClose={() => setModal({ type: null })} initialData={{ ncrs: data.ncrs }} />}
            {activeTab === 'calib' && <CalibTab />}

            {/* Placeholders for remaining static tabs (omit full rendering details) */}
            {['plans', 'vendor', 'hold', 'coa', 'audit', 'settings'].map(tab => (
                activeTab === tab && <section key={tab} data-tab={tab} id={`sec-${tab}`} className={`card ${activeTab === tab ? 'show' : ''}`} style={{ padding: '14px' }}>
                    <div className="page-header"><h1 style={{ fontSize: '1.3rem' }}>{TAB_LINKS.find(l => l.href === tab)?.label}</h1></div>
                    <p>Table data for this section is omitted for brevity, logic follows the same `renderTable` pattern.</p>
                </section>
            ))}

            {/* --- Modals --- */}
            <NCRModal 
                isOpen={modal.type === 'ncr'}
                onClose={() => setModal({ type: null })}
                initialData={modal.data}
            />
        </div>
    );
}

export default Quality;