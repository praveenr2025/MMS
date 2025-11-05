// src/pages/PurchaseOrders.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getPOData } from '../data/poData';
import POForm from '../components/PurchaseOrders/POForm';
import { fmtMoney, pillColor } from '../utils/formatters'; // Assuming you define these utilities

// --- UTILITY COMPONENTS ---
const Pill = ({ status }) => <span className={`pill ${pillColor(status)}`}>{status}</span>;

// --- DUMMY MODAL ACTIONS (Will need to be implemented) ---
const mockOpenModal = (action, poNo = null) => {
    alert(`${action} triggered for PO: ${poNo || 'New'}`);
};

// --- DATA UTILITY (Temporary location for data needed by this file) ---
function getPurchaseOrderData() {
    const data = getPOData();
    // Calculate KPI values
    const openPOs = data.pos.filter(p => ['Approved', 'Pending Approval', 'Partially Received', 'Draft'].includes(p.status));
    const partiallyReceived = data.pos.filter(p => p.status === 'Partially Received').length;
    const awaitingQC = data.pos.filter(p => p.receipts && p.receipts.some(r => r.accepted === undefined)).length;
    const invoicesOnHold = data.pos.flatMap(p => p.invoices || []).filter(i => i.match && !i.match.startsWith('Matched')).length;

    return {
        ...data,
        kpis: {
            open: openPOs.length,
            partial: partiallyReceived,
            qc: awaitingQC,
            hold: invoicesOnHold,
        }
    };
}


function PurchaseOrders() {
    const [poData, setPoData] = useState(getPurchaseOrderData());
    const [activeTab, setActiveTab] = useState('tab-dashboard');
    const [filters, setFilters] = useState({ search: '', status: '', supplier: '', currency: '' });

    // Function to refresh data from local storage
    const refreshData = () => setPoData(getPurchaseOrderData());

    useEffect(() => {
        refreshData();
    }, []);

    // --- Filtered and Paginated Data ---
    const filteredPOs = useMemo(() => {
        let list = poData.pos;
        if (filters.search) {
            const q = filters.search.toLowerCase();
            list = list.filter(p => 
                (p.no + p.supplier + p.lines.map(l => l.item + l.desc).join(' ')).toLowerCase().includes(q)
            );
        }
        if (filters.status) list = list.filter(p => p.status === filters.status);
        if (filters.supplier) list = list.filter(p => p.supplier === filters.supplier);
        if (filters.currency) list = list.filter(p => p.currency === filters.currency);
        return list;
    }, [poData.pos, filters]);

    // Simple Pagination state (implementing page change is omitted for brevity)
    const paginatedPOs = filteredPOs;

    // --- Renderers for Tabs ---
    const RenderDashboard = () => (
        <section className="tab-pane active" id="tab-dashboard">
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-card-icon blue"><svg><use href="#icon-po" /></svg></div>
                    <div className="value">{poData.kpis.open}</div>
                    <div className="label">Open POs</div>
                    <a className="link" href="#all" onClick={(e) => { e.preventDefault(); setActiveTab('tab-all'); }}>Review →</a>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon warn"><svg><use href="#icon-grn" /></svg></div>
                    <div className="value">{poData.kpis.partial}</div>
                    <div className="label">Partially Received</div>
                    <a className="link" href="#receipts" onClick={(e) => { e.preventDefault(); setActiveTab('tab-receipts'); }}>Receive →</a>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon ok"><svg><use href="#icon-quality" /></svg></div>
                    <div className="value">{poData.kpis.qc}</div>
                    <div className="label">Awaiting QC</div>
                    <a className="link" href="#quality" onClick={(e) => { e.preventDefault(); setActiveTab('tab-quality'); }}>Inspect →</a>
                </div>
                <div className="kpi-card">
                    <div className="kpi-card-icon bad"><svg><use href="#icon-invoice" /></svg></div>
                    <div className="value">{poData.kpis.hold}</div>
                    <div className="label">Invoices On Hold</div>
                    <a className="link" href="#invoices" onClick={(e) => { e.preventDefault(); setActiveTab('tab-invoices'); }}>Fix →</a>
                </div>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}><h3 style={{ margin: 0, fontSize: '1.1rem' }}>Recent Activity</h3></div>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Event</th><th>PO</th><th>Supplier</th><th>Date</th></tr></thead>
                        <tbody id="activity-tbody">
                            {poData.activity.map((a, i) => (
                                <tr key={i}><td>{a.event}</td><td><b>{a.po}</b></td><td>{a.supplier}</td><td>{a.date}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );

    const RenderAllPOs = () => (
        <section className="tab-pane active" id="tab-all">
            <div className="table-controls">
                <div className="table-filters">
                    <input type="text" className="search-bar" id="search-po" placeholder="Search PO #, supplier, item…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                    <select id="filter-po-status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                        <option value="">Status: All</option>
                        <option>Draft</option><option>Pending Approval</option><option>Approved</option><option>Partially Received</option><option>Received</option><option>Closed</option><option>Rejected</option>
                    </select>
                    <select id="filter-supplier" value={filters.supplier} onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}>
                        <option value="">Supplier: All</option>
                        {poData.suppliers.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <select id="filter-currency" value={filters.currency} onChange={(e) => setFilters({ ...filters, currency: e.target.value })}>
                        <option value="">Currency: All</option>
                        <option>INR</option><option>USD</option><option>EUR</option><option>SGD</option>
                    </select>
                    <button className="btn ghost" style={{ padding: '8px 12px' }} onClick={refreshData}>Apply Filter</button>
                </div>
            </div>
            <div className="card">
                <div className="table-container">
                    <table className="table" id="po-table">
                        <thead>
                            <tr>
                                <th>PO #</th><th>Supplier</th><th>Date</th><th style={{ textAlign: 'right' }}>Total (Base)</th><th>Currency</th><th>Status</th><th className="actions-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPOs.map(p => (
                                <tr key={p.no}>
                                    <td><b>{p.no}</b></td>
                                    <td>{p.supplier}</td>
                                    <td>{p.date}</td>
                                    <td style={{ textAlign: 'right' }}>{fmtMoney(p.total, p.currency)}</td>
                                    <td>{p.currency}</td>
                                    <td><Pill status={p.status} /></td>
                                    <td className="actions-cell">
                                        <button className="btn ghost" style={{ padding: '5px 10px' }} onClick={() => mockOpenModal('View PO', p.no)}>View</button>
                                        <button className="btn ghost" style={{ padding: '5px 10px' }} onClick={() => mockOpenModal('Create GRN', p.no)}>Create GRN</button>
                                        <button className="btn ghost" style={{ padding: '5px 10px' }} onClick={() => mockOpenModal('Register Invoice', p.no)}>Register Invoice</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px' }}>
                    <span id="po-count">{paginatedPOs.length} of {filteredPOs.length} results</span>
                    <div className="pagination" id="po-pager">
                        {/* Pagination logic omitted for brevity */}
                    </div>
                </div>
            </div>
        </section>
    );

    return (
        <div className="page-content">
            <nav className="tab-nav">
                <a href="#dashboard" className={activeTab === 'tab-dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('tab-dashboard'); }}>PO Dashboard</a>
                <a href="#all" className={activeTab === 'tab-all' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('tab-all'); }}>All POs</a>
                <a href="#create" className={activeTab === 'tab-create' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('tab-create'); }}>Create PO</a>
                <a href="#receipts" className={activeTab === 'tab-receipts' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('tab-receipts'); }}>Receipts/GRN</a>
                <a href="#quality" className={activeTab === 'tab-quality' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('tab-quality'); }}>Quality</a>
                <a href="#invoices" className={activeTab === 'tab-invoices' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('tab-invoices'); }}>Invoices</a>
                <a href="#setup" className={activeTab === 'tab-setup' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('tab-setup'); }}>Terms & Setup</a>
            </nav>

            {activeTab === 'tab-dashboard' && <RenderDashboard />}
            {activeTab === 'tab-all' && <RenderAllPOs />}
            {activeTab === 'tab-create' && (
                <section className="tab-pane active" id="tab-create">
                    <POForm 
                        updatePOList={refreshData} 
                        allSuppliers={poData.suppliers} 
                        allMaterials={poData.materials}
                    />
                </section>
            )}
            
            {/* Placeholders for simpler tabs */}
            {activeTab === 'tab-receipts' && <section className="tab-pane active" id="tab-receipts"><div className="card" style={{padding: 16}}>Receipts table content here...</div></section>}
            {activeTab === 'tab-quality' && <section className="tab-pane active" id="tab-quality"><div className="card" style={{padding: 16}}>Quality inspection content here...</div></section>}
            {activeTab === 'tab-invoices' && <section className="tab-pane active" id="tab-invoices"><div className="card" style={{padding: 16}}>PO-linked invoices content here...</div></section>}
            {activeTab === 'tab-setup' && <section className="tab-pane active" id="tab-setup"><div className="card" style={{padding: 16}}>Terms and setup details here...</div></section>}

            {/* Note: The View PO Modal (modal-view-po) and generic modals need to be integrated
                into your global ModalContainer.jsx, matching the structure in purchase-orders.html. */}
        </div>
    );
}

export default PurchaseOrders;