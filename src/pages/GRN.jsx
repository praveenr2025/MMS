import React, { useState, useEffect, useMemo } from 'react';
import GRNWizardModal from '../components/Inventory/GRNWizardModal';
import { getPOData } from '../data/poData';
import { fmtMoney, pillColor } from '../utils/formatters';

// --- Functions to consolidate GRN data from PO receipts ---
function getAllGRNs(data) {
    const grnList = [];
    data.pos.forEach(po => {
        if (po.receipts) {
            po.receipts.forEach((receipt, index) => {
                // Mock GRN data since receipts are stored *under* POs in the mock DB
                // In a real system, GRNs are top-level documents.
                const totalAmount = po.total || po.subtotal + po.freight;
                
                grnList.push({
                    grn: receipt.grn,
                    po: po.no,
                    supplier: po.supplier,
                    whs: receipt.loc.split(' / ')[0],
                    date: receipt.date,
                    status: receipt.accepted !== undefined ? 'Accepted' : receipt.rejected !== undefined ? 'Rejected' : 'Pending QC',
                    amount: totalAmount, // Simplification: linking total PO amount to one receipt view
                    receipt: receipt,
                    isMocked: true,
                });
            });
        }
    });
    // Add one mock GRN that is fully accepted
    grnList.push({ grn: 'GRN-2025-0103', po: 'PO-2025-0141', supplier: 'Global Steel Ltd.', whs: 'WH-B', date: '2025-10-26', status: 'Accepted', amount: 9800, isMocked: false });

    return grnList.sort((a, b) => new Date(b.date) - new Date(a.date));
}


function GRN() {
    const [poData, setPoData] = useState(getPOData());
    const [allGRNs, setAllGRNs] = useState([]);
    const [filters, setFilters] = useState({ search: '', status: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to refresh all data
    const refreshData = () => {
        const data = getPOData();
        setPoData(data);
        setAllGRNs(getAllGRNs(data));
    };

    useEffect(() => {
        refreshData();
    }, []);

    // --- Filtered List and KPIs ---
    const filteredGRNs = useMemo(() => {
        return allGRNs.filter(g => {
            const q = filters.search.toLowerCase();
            const text = (g.grn + g.po + g.supplier).toLowerCase();
            const okQ = !q || text.includes(q);
            const okS = !filters.status || g.status === filters.status;
            return okQ && okS;
        });
    }, [allGRNs, filters]);
    
    const kpis = useMemo(() => {
        const pendingQC = filteredGRNs.filter(g => g.status === 'Pending QC').length;
        const acceptedLast7D = filteredGRNs.filter(g => g.status === 'Accepted' && (new Date() - new Date(g.date)) < 7 * 24 * 60 * 60 * 1000).length;
        return { pendingQC, acceptedLast7D };
    }, [filteredGRNs]);
    

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.id.replace('filter', '').toLowerCase()]: e.target.value }));
    };

    const handleViewGRN = (grn) => {
        alert(`Viewing GRN ${grn.grn} details. Status: ${grn.status}`);
        // In a full app, this would open a ViewGRNModal
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <h1>GRN Workspace</h1>
                <div className="searchbar" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div className="form-group"><label>Search</label><input id="search" placeholder="GRN/PO/Supplier/Item" onChange={handleFilterChange} /></div>
                    <div className="form-group"><label>Status</label>
                        <select id="statusFilter" onChange={handleFilterChange}>
                            <option value="">All</option>
                            <option>Draft</option><option>Pending QC</option><option>Accepted</option><option>Rejected</option><option>Reversed</option>
                        </select>
                    </div>
                    <button className="btn ghost" onClick={refreshData}>Apply</button>
                    <button className="btn" onClick={() => setIsModalOpen(true)}>+ Generate New GRN</button>
                </div>
            </div>

            {/* KPIs */}
            <div className="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                <div className="col-3" style={{ gridColumn: 'span 1' }}>
                    <div className="card" style={{ padding: '12px' }}>
                        <div classNamepi="kpi" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div className="num" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{kpis.pendingQC}</div>
                            <small style={{ color: 'var(--muted)' }}>Pending QC</small>
                        </div>
                    </div>
                </div>
                {/* ... other KPIs (Accepted, Rejected, Reversed) simplified or omitted for brevity ... */}
                <div className="col-3" style={{ gridColumn: 'span 1' }}>
                    <div className="card" style={{ padding: '12px' }}>
                        <div className="kpi" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div className="num" style={{ fontSize: '1.2rem', fontWeight: 800 }}>{kpis.acceptedLast7D}</div>
                            <small style={{ color: 'var(--muted)' }}>Accepted (Last 7d)</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRN LIST */}
            <div className="card" style={{ padding: '12px' }}>
                <div className="table-container">
                    <table className="table" id="tblGRN">
                        <thead>
                            <tr>
                                <th>GRN #</th><th>PO #</th><th>Supplier</th><th>Whs</th>
                                <th>Received On</th><th>Status</th><th>Amount ($)</th><th className="actions-cell">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGRNs.map(g => (
                                <tr key={g.grn + g.date}>
                                    <td><strong>{g.grn}</strong></td>
                                    <td>{g.po}</td>
                                    <td>{g.supplier}</td>
                                    <td>{g.whs}</td>
                                    <td>{new Date(g.date).toDateString().slice(4)}</td>
                                    <td><span className={`pill ${pillColor(g.status)}`}>{g.status}</span></td>
                                    <td style={{ textAlign: 'right' }}>{fmtMoney(g.amount, 'USD')}</td>
                                    <td className="actions-cell">
                                        <button className="btn ghost" style={{ padding: '5px 10px' }} onClick={() => handleViewGRN(g)}>View</button>
                                        <button className="btn ghost" style={{ padding: '5px 10px' }}>Print</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <GRNWizardModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                refreshGRNList={refreshData}
            />
        </div>
    );
}

export default GRN;