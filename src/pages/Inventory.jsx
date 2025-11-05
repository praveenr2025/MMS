import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fmtMoney, pillColor } from '../utils/formatters';

// --- Consolidated Mock Data ---
const initialData = {
    items: [
        { code: "STL-BAR-10MM", desc: "10mm Reinforcement Steel Bar (TMT)", warehouse: "WH-A", bin: "Rack-01", onhand: 7500, reserved: 500, uom: "KG", reorder: 3000, status: "In Stock", expiry: 9999, abc: "A", cost: 2.5 },
        { code: "STL-BAR-10MM", desc: "10mm Reinforcement Steel Bar (TMT)", warehouse: "WH-A", bin: "QC-HOLD", onhand: 5000, reserved: 0, uom: "KG", reorder: 3000, status: "Pending QC", expiry: 9999, abc: "A", cost: 2.5 },
        { code: "STL-PLATE-5MM", desc: "5mm Mild Steel Plate", warehouse: "WH-A", bin: "QC-HOLD", onhand: 1000, reserved: 0, uom: "SQM", reorder: 400, status: "Pending QC", expiry: 9999, abc: "B", cost: 2.95 },
        { code: "PPR-A4-75GSM", desc: "A4 Copier Paper 75GSM", warehouse: "Store-01", bin: "Aisle-02", onhand: 450, reserved: 250, uom: "Ream", reorder: 500, status: "Low Stock", expiry: 365, abc: "C", cost: 2.4 },
        { code: "POLY-PEL-05", desc: "Polypropylene Pellets (Grade 5)", warehouse: "WH-B", bin: "Silo-03", onhand: 0, reserved: 0, uom: "KG", reorder: 2000, status: "Out of Stock", expiry: 9999, abc: "A", cost: 1.8 }
    ],
    ledger: [
        ["2025-10-30", "GRN-2025-0101", "GRN", "STL-BAR-10MM", 5000, "KG", "WH-A / QC-HOLD", "PO-2025-0145", "qa.user"],
        ["2025-10-30", "GRN-2025-0101", "GRN", "STL-PLATE-5MM", 1000, "SQM", "WH-A / QC-HOLD", "PO-2025-0145", "qa.user"],
        ["2025-10-31", "MIV-2025-1277", "Issue", "PPR-A4-75GSM", -250, "Ream", "Store-01 / Aisle-02", "SO-2025-4420", "store.user"]
    ],
    reservations: [
        ["RSV-1001", "PPR-A4-75GSM", 250, "Ream", "SO-2025-4420", "Committed", "2025-11-05", "Store-01 / Aisle-02"],
        ["RSV-1002", "STL-BAR-10MM", 500, "KG", "WO-2025-3001", "Committed", "2025-11-04", "WH-A / Rack-01"]
    ],
    adjustments: [
        ["2025-10-29", "ADJ-0901", "Cycle Count Adj", "STL-BAR-10MM", +50, "KG", "WH-A / Rack-01", "admin"],
        ["2025-10-20", "ADJ-0897", "Damage", "PPR-A4-75GSM", -10, "Ream", "Store-01 / Aisle-02", "store.user"]
    ],
    counts: [
        ["CNT-2025-010", "A", "WH-A", "Rack-01..Rack-05", "2025-11-15", "Planned", "john.doe"],
        ["CNT-2025-011", "B", "WH-B", "Silo-01..Silo-04", "2025-11-22", "Planned", "jane.smith"]
    ],
    reorderRows: [
        ["PPR-A4-75GSM", "Store-01", 500, 1200, 450, 0, 750],
        ["POLY-PEL-05", "WH-B", 2000, 6000, 0, 0, 2000]
    ]
};

// --- Modals (Defined outside for clarity, but they rely on the parent state management) ---

const StockModal = ({ id, title, children, isOpen, onClose }) => {
    return (
        <div className={`modal ${isOpen[id] ? 'open' : ''}`} id={id}>
            <div className="modal-content">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }}>{title}</h3>
                    <button className="btn ghost" onClick={() => onClose(id)}><svg style={{ width: 20, height: 20 }}><use href="#icon-close" /></svg></button>
                </div>
                <form id={`form-${id.replace('modal-', '')}`} onSubmit={(e) => { e.preventDefault(); alert(`${title} submitted (demo).`); onClose(id); }}>
                    {children}
                    <div className="modal-footer">
                        <button type="button" className="btn ghost" onClick={() => onClose(id)}>Cancel</button>
                        <button type="submit" className={`btn ${id.includes('adjust') || id.includes('reserve') ? 'ok' : id.includes('quarantine') ? 'bad' : 'blue'}`}>
                            {title.includes('Adjustment') ? 'Post Adjustment' : title.includes('Transfer') ? 'Create Transfer' : title.includes('Count') ? 'Schedule' : title.includes('Reserve') ? 'Reserve' : title.includes('QC Hold') ? 'Quarantine' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


function Inventory() {
    const [data, setData] = useState(initialData);
    const [activeTab, setActiveTab] = useState('tab-stock');
    const [filters, setFilters] = useState({ search: '', warehouse: '', bin: '', status: '', abc: '', exp: '' });
    const [sort, setSort] = useState({ key: 'code', direction: 1 }); // 1 for asc, -1 for desc
    const [modalState, setModalState] = useState({});

    // Dynamic Options for Modals/Filters (based on current filtered data)
    const availableItemCodes = useMemo(() => Array.from(new Set(data.items.map(i => i.code))), [data.items]);

    const handleFilterChange = (e) => {
        const { id, value } = e.target;
        setFilters(prev => ({ ...prev, [id.replace('flt-', '')]: value }));
    };

    const handleSort = (key) => {
        setSort(prev => ({
            key,
            direction: prev.key === key ? prev.direction * -1 : 1
        }));
    };

    const handleOpenModal = useCallback((id, item = null, wh = null, bin = null) => {
        setModalState({ [id]: true });
        
        // Mock pre-fill logic
        if (item) {
            if (id === 'modal-adjust') {
                // Mock setting pre-fill values
            }
            // ... similar logic for transfer, reserve, qc-hold ...
        }
    }, []);

    const handleCloseModal = useCallback((id) => {
        setModalState({});
    }, []);


    // --- FILTERING & KPI CALCULATION ---
    const { filteredItems, kpi } = useMemo(() => {
        let items = data.items.slice();
        
        // Apply text filters
        const s = filters.search.toLowerCase();
        if (s) items = items.filter(r => (r.code + r.desc).toLowerCase().includes(s));
        if (filters.warehouse) items = items.filter(r => r.warehouse === filters.warehouse);
        if (filters.status) items = items.filter(r => r.status === filters.status);
        if (filters.abc) items = items.filter(r => r.abc === filters.abc);
        // ... apply other filters

        // Apply sorting
        if (sort.key) {
            items.sort((a, b) => {
                const aVal = a[sort.key] || '';
                const bVal = b[sort.key] || '';
                if (typeof aVal === 'string') return aVal.localeCompare(bVal) * sort.direction;
                return (aVal - bVal) * sort.direction;
            });
        }
        
        // Calculate KPIs
        const totalOnHand = items.reduce((s, r) => s + r.onhand, 0);
        const totalReserved = items.reduce((s, r) => s + r.reserved, 0);
        const totalValue = items.reduce((s, r) => s + (r.onhand * r.cost), 0);

        return {
            filteredItems: items,
            kpi: {
                onHand: totalOnHand.toLocaleString(),
                reserved: totalReserved.toLocaleString(),
                atp: (totalOnHand - totalReserved).toLocaleString(),
                value: fmtMoney(totalValue, 'USD')
            }
        };
    }, [data.items, filters, sort]);

    // --- Tab Content Renderers ---
    const renderTableContent = (rows, header) => (
        <div className="card">
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            {header.map((h, i) => <th key={i} className={h.align || 'left'}>{h.label}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i}>
                                {row.map((cell, j) => (
                                    <td key={j} className={header[j].align || 'left'}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    // --- Main Tab Contents ---
    const StockTab = () => (
        <section id="tab-stock" className={`tabpanel ${activeTab === 'tab-stock' ? 'active' : ''}`}>
            <div className="card">
                <div className="table-container">
                    <table className="table" id="tbl-stock">
                        <thead>
                            <tr>
                                {/* Item Code column header with sorting */}
                                {Object.keys(filteredItems[0] || {}).slice(0, 12).map(key => (
                                    <th key={key} data-key={key} className="sortable" onClick={() => handleSort(key)}>
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </th>
                                ))}
                                <th className="actions-cell center">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-stock">
                            {filteredItems.map((r, i) => {
                                const available = r.onhand - r.reserved;
                                return (
                                    <tr key={r.code + r.bin + i}>
                                        <td><strong>{r.code}</strong></td>
                                        <td>{r.desc}</td>
                                        <td>{r.warehouse}</td>
                                        <td>{r.bin}</td>
                                        <td className="right">{r.onhand.toLocaleString()}</td>
                                        <td className="right">{r.reserved.toLocaleString()}</td>
                                        <td className="right">{available.toLocaleString()}</td>
                                        <td>{r.uom}</td>
                                        <td className="right">{r.reorder.toLocaleString()}</td>
                                        <td dangerouslySetInnerHTML={{ __html: `<span class="pill ${pillColor(r.status)}">${r.status}</span>` }}></td>
                                        <td className="right">{r.expiry === 9999 ? "-" : r.expiry}</td>
                                        <td className="right">{r.abc}</td>
                                        <td className="actions-cell center">
                                            <button className="btn ghost" style={{ padding: '5px 10px' }} data-action="adjust" onClick={() => handleOpenModal('modal-adjust', r.code, r.warehouse, r.bin)}>Adj</button>
                                            <button className="btn ghost" style={{ padding: '5px 10px' }} data-action="transfer" onClick={() => handleOpenModal('modal-transfer', r.code, r.warehouse, r.bin)}>Move</button>
                                            <button className="btn ghost" style={{ padding: '5px 10px' }} data-action="reserve" onClick={() => handleOpenModal('modal-reservation', r.code, r.warehouse, r.bin)}>Resv</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );

    const LedgerTab = () => (
        <section id="tab-ledger" className={`tabpanel ${activeTab === 'tab-ledger' ? 'active' : ''}`}>
            {renderTableContent(data.ledger, [
                { label: 'Date' }, { label: 'Txn #' }, { label: 'Type' }, { label: 'Item' },
                { label: 'Qty', align: 'right' }, { label: 'UOM' }, { label: 'Warehouse/Bin' },
                { label: 'Ref' }, { label: 'User' }
            ])}
        </section>
    );

    const ValuationTab = () => (
        <section id="tab-valuation" className={`tabpanel ${activeTab === 'tab-valuation' ? 'active' : ''}`}>
            <div className="card">
                <div className="table-container">
                    <table className="table" id="tbl-valuation">
                        <thead>
                            <tr>
                                <th>Item</th><th>Cost Method</th><th className="right">Avg Cost</th><th className="right">On Hand</th><th className="right">Stock Value</th><th className="right">0‑30d</th><th className="right">31‑60d</th><th className="right">61‑90d</th><th className="right">90d+</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Simplified mock data mapping */}
                            {data.items.filter((v, i, a) => a.findIndex(z => z.code === v.code) === i).map(r => {
                                const onhand = filteredItems.filter(x => x.code === r.code).reduce((s, x) => s + x.onhand, 0);
                                const value = onhand * r.cost;
                                return (
                                    <tr key={r.code}>
                                        <td>{r.code}</td><td>Average</td><td className="right">{fmtMoney(r.cost, 'USD')}</td><td className="right">{onhand.toLocaleString()}</td><td className="right">{fmtMoney(value, 'USD')}</td>
                                        <td className="right">{(onhand * 0.4).toFixed(0)}</td><td className="right">{(onhand * 0.3).toFixed(0)}</td><td className="right">{(onhand * 0.2).toFixed(0)}</td><td className="right">{(onhand * 0.1).toFixed(0)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
    
    const AlertsTab = () => (
        <section id="tab-alerts" className={`tabpanel ${activeTab === 'tab-alerts' ? 'active' : ''}`}>
            {renderTableContent([
                ['Low Stock', 'Available < Re‑Order', 'Create PR Draft + Email Buyer', 'Enabled'],
                ['Expiry Warning', 'Expiry days <= 30', 'Quarantine + Notify QA', 'Enabled'],
                ['Negative Bin', 'On Hand < 0', 'Block Issue + Raise NCR', 'Enabled'],
            ], [{ label: 'Rule' }, { label: 'Condition' }, { label: 'Action' }, { label: 'Status' }])}
        </section>
    );

    return (
        <div className="page-content">
            <div className="page-header">
                <h1 style={{ margin: 0 }}>Inventory Stock Levels</h1>
                <div className="toolbar">
                    <button className="btn ok" data-modal-target="modal-adjust" onClick={() => handleOpenModal('modal-adjust')}>+ Stock Adjustment</button>
                    <button className="btn" data-modal-target="modal-transfer" onClick={() => handleOpenModal('modal-transfer')}>Transfer</button>
                    <button className="btn" data-modal-target="modal-cyclecount" onClick={() => handleOpenModal('modal-cyclecount')}>Cycle Count</button>
                    <button className="btn warn" data-modal-target="modal-reservation" onClick={() => handleOpenModal('modal-reservation')}>Reserve</button>
                    <button className="btn bad" data-modal-target="modal-quarantine" onClick={() => handleOpenModal('modal-quarantine')}>QC Hold</button>
                    <button className="btn" data-modal-target="modal-reorder" onClick={() => handleOpenModal('modal-reorder')}>Reorder Planner</button>
                </div>
            </div>

            {/* KPIs */}
            <div className="kpi-grid">
                <div className="kpi"><div className="label">Total On‑Hand</div><div className="value" id="kpiOnHand">{kpi.onHand}</div><div className="label">All warehouses</div></div>
                <div className="kpi"><div className="label">Committed / Reserved</div><div className="value" id="kpiReserved">{kpi.reserved}</div><div className="label">To open orders</div></div>
                <div className="kpi"><div className="label">Available to Promise (ATP)</div><div className="value" id="kpiATP">{kpi.atp}</div><div className="label">On‑hand – reserved</div></div>
                <div className="kpi"><div className="label">Stock Value (Avg Cost)</div><div className="value" id="kpiValue">{kpi.value}</div><div className="label">Valuation</div></div>
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '12px' }}>
                <div className="filters">
                    <div className="form-group"><label>Search</label><input id="flt-search" placeholder="Item code, description" onChange={handleFilterChange} /></div>
                    <div className="form-group"><label>Warehouse</label><select id="flt-warehouse" onChange={handleFilterChange}><option value="">All</option><option>WH-A</option><option>WH-B</option><option>Store-01</option></select></div>
                    <div className="form-group"><label>Location / Bin</label><input id="flt-bin" placeholder="Rack-01, Silo-03" onChange={handleFilterChange} /></div>
                    <div className="form-group"><label>Status</label><select id="flt-status" onChange={handleFilterChange}><option value="">Any</option><option>In Stock</option><option>Low Stock</option><option>Out of Stock</option><option>Pending QC</option><option>QC Hold</option></select></div>
                    <div className="form-group"><label>ABC Class</label><select id="flt-abc" onChange={handleFilterChange}><option value="">Any</option><option>A</option><option>B</option><option>C</option></select></div>
                    <div className="form-group"><label>Expiry Within (days)</label><input id="flt-exp" type="number" min="0" placeholder="e.g., 30" onChange={handleFilterChange} /></div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button className="btn ghost" onClick={() => setFilters(prev => ({ ...prev, search: '', warehouse: '' }))}>Apply (Filter updates automatically)</button>
                    <button className="btn ghost" onClick={() => setFilters({ search: '', warehouse: '', bin: '', status: '', abc: '', exp: '' })}>Reset</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" role="tablist">
                {['stock', 'ledger', 'valuation', 'reservations', 'adjustments', 'counts', 'alerts', 'settings'].map(tab => (
                    <button key={tab} className={`tab ${activeTab === `tab-${tab}` ? 'active' : ''}`} onClick={() => setActiveTab(`tab-${tab}`)}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1).replace('s', 's').replace('a', 'A')}
                    </button>
                ))}
            </div>

            {/* Render Active Tab Content */}
            {activeTab === 'tab-stock' && <StockTab />}
            {activeTab === 'tab-ledger' && <LedgerTab />}
            {activeTab === 'tab-valuation' && <ValuationTab />}
            {activeTab === 'tab-alerts' && <AlertsTab />}
            {/* ... other simpler tabs could render similar mock tables */}

            {/* --- MODALS (Rendered outside tabs, controlled by state) --- */}
            <StockModal id="modal-adjust" title="Stock Adjustment" isOpen={modalState} onClose={handleCloseModal}>
                <div className="modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div className="form-group"><label>Item</label><select id="adj-item" defaultValue={availableItemCodes[0]}>{availableItemCodes.map(c => <option key={c}>{c}</option>)}</select></div>
                        <div className="form-group"><label>Warehouse</label><select id="adj-wh"><option>WH-A</option><option>WH-B</option></select></div>
                        <div className="form-group"><label>Bin</label><input id="adj-bin" placeholder="Rack-01 / Silo-03" /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div className="form-group"><label>Quantity (+/-)</label><input type="number" id="adj-qty" step="0.01" /></div>
                        <div className="form-group"><label>UOM</label><select id="adj-uom"><option>KG</option><option>Each</option></select></div>
                        <div className="form-group"><label>Reason</label><select id="adj-reason"><option>Cycle Count Adj</option><option>Damage</option></select></div>
                    </div>
                    <div className="form-group"><label>Notes</label><textarea id="adj-notes" rows="2" placeholder="Comment..."></textarea></div>
                </div>
            </StockModal>

            <StockModal id="modal-transfer" title="Transfer Stock" isOpen={modalState} onClose={handleCloseModal}>
                <div className="modal-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div className="form-group"><label>Item</label><select id="trf-item" defaultValue={availableItemCodes[0]}>{availableItemCodes.map(c => <option key={c}>{c}</option>)}</select></div>
                        <div className="form-group"><label>From (WH/Bin)</label><input id="trf-from" placeholder="WH-A / Rack-01" /></div>
                        <div className="form-group"><label>To (WH/Bin)</label><input id="trf-to" placeholder="WH-B / Silo-03" /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div className="form-group"><label>Quantity</label><input type="number" id="trf-qty" step="0.01" /></div>
                        <div className="form-group"><label>UOM</label><select id="trf-uom"><option>KG</option><option>Each</option></select></div>
                        <div className="form-group"><label>Reason</label><select id="trf-reason"><option>Rebin</option><option>Reallocation</option></select></div>
                    </div>
                </div>
            </StockModal>

            {/* Other modals (Cycle Count, Reserve, QC Hold, Reorder) would follow this StockModal pattern */}
        </div>
    );
}

export default Inventory;