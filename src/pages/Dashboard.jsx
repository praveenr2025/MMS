// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { pillColor } from '../utils/formatters'; // Assuming pillColor utility exists

// NOTE: Placeholder components for D3 charts are omitted here but assumed to be imported
// if actual D3 logic is implemented.

// --- 1. KPI Data Definitions (Extracted from HTML) ---
const kpiData = [
    { label: 'Pending PRs', value: '5', sub: '$12,400.00', colorVar: '--brand', link: '/requisitions.html' },
    { label: 'Pending POs', value: '8', sub: '$88,150.00', colorVar: '--warn', link: '/purchase-orders.html' },
    { label: 'OTIF (30d)', value: '96.8%', sub: <><span style={{ color: 'var(--ok)' }}>+1.2%</span> vs last</>, colorVar: null, link: '/suppliers.html' },
    { label: 'Inventory Value', value: '$1.2M', sub: 'DOS: 42 days', colorVar: null, link: '/inventory.html' },
    { label: 'Stockouts', value: '12', sub: 'Fill Rate: 98.1%', colorVar: '--bad', link: '/inventory.html' },
    { label: 'GR/IR Balance', value: '$45.2K', sub: '3 items > 30d', colorVar: null, link: '/invoices.html' },
    { label: '3-Way Match', value: '99.1%', sub: '4 blocked', colorVar: null, link: '/invoices.html' },
    { label: 'E&O Value', value: '$112K', sub: '8.9% of total', colorVar: null, link: '/inventory.html' },
];

const actionItems = [
    { heading: 'Approvals & Reviews', tasks: [
        { text: 'Approve PRs pending', meta: '(5 items, $12,400)', link: '/requisitions.html', action: 'View Queue' },
        { text: 'Approve POs pending', meta: '(8 items, $88,150)', link: '/purchase-orders.html', action: 'View Queue' },
        { text: 'Approve vendor onboarding', meta: '(2 new suppliers)', link: '/suppliers.html', action: 'View Queue' },
    ]},
    { heading: 'Exceptions & Alerts', tasks: [
        { text: 'PO past required date', meta: '(4 POs)', link: '/purchase-orders.html', action: 'Expedite' },
        { text: 'GRN discrepancies to resolve', meta: '(GRN-2025-0103, short qty)', link: '/grn.html', action: 'Resolve' },
        { text: '3-way match failures', meta: '(4 invoices, $2,100)', link: '/invoices.html', action: 'Resolve' },
        { text: 'GR/IR recon items to clear', meta: '(3 items > 30d)', link: '/invoices.html', action: 'Clear' },
    ]},
    { heading: 'Inventory & Quality Tasks', tasks: [
        { text: 'Low stock below safety', meta: '(12 items)', link: '/inventory.html', action: 'Reorder' },
        { text: 'Lots pending inspection', meta: '(2 lots > 24hrs)', link: '/quality.html', action: 'Inspect' },
        { text: 'NCRs to disposition', meta: '(1 open NCR)', link: '/quality.html', action: 'View' },
        { text: 'Cycle count variances', meta: '(3 variances to investigate)', link: '/inventory.html', action: 'Investigate' },
    ]},
];

const procurementKPIs = [
    { label: 'PRs Submitted', value: '22' }, { label: 'PRs Approved', value: '17' },
    { label: 'Avg PR → PO Cycle', value: '2.1 days' }, { label: 'PR Aging > 5d', value: '1' },
    { label: 'POs Open', value: '14' }, { label: 'POs Partially Rec\'d', value: '3' },
    { label: 'PO On-Time Release', value: '98%' }, { label: 'PO Change Rate', value: '4.2%' },
    { label: 'PO Price Variance', value: <span style={{ color: 'var(--bad)' }}>+1.8%</span> },
    { label: 'Contract Coverage', value: '82%' }, { label: 'Maverick Spend', value: '$14,200' },
    { label: 'Savings Realized', value: '$21,000' },
];

const supplierKPIs = [
    { label: 'Supplier Lead Time', value: '14.2 days' }, { label: 'RFQ Turnaround', value: '3.5 days' },
    { label: 'Avg Bids per RFQ', value: '3.1' }, { label: 'OTIF (30d)', value: '96.8%' },
];

const inventoryKPIs = [
    { label: 'On-Hand Value', value: '$1.2M' }, { label: 'Inventory Turns', value: '5.8' },
    { label: 'Days of Supply (DOS)', value: '42 days' }, { label: 'Fill Rate', value: '98.1%' },
    { label: 'Stockout Rate', value: '1.9%' }, { label: 'Low Stock Items', value: '12' },
    { label: 'E&O Value', value: '$112K' }, { label: 'Slow-Moving (>90d)', value: '$43K' },
    { label: 'Cycle Count Acc.', value: '99.7%' }, { label: 'ASN Compliance', value: '85%' },
    { label: 'Dock-to-Stock', value: '6.2 hrs' }, { label: 'Putaway Accuracy', value: '99.9%' },
];

const qualityKPIs = [
    { label: 'First Pass Yield', value: '99.2%' }, { label: 'Lot Acceptance Rate', value: '98.5%' },
    { label: 'Defect Rate (PPM)', value: '820' }, { label: 'Open NCRs', value: '1' },
    { label: 'NCR Aging > 5d', value: '0' }, { label: 'CAPA On-Time', value: '100%' },
    { label: 'QC Hold Value', value: '$15,450' }, { label: 'COA Compliance', value: '100%' },
];

const financeP2PKPIs = [
    { label: 'GR/IR Balance', value: '$45.2K' }, { label: 'GR/IR Aging > 30d', value: '$2,100' },
    { label: '3-Way Match Rate', value: '99.1%' }, { label: 'Invoice Cycle Time', value: '4.1 days' },
    { label: 'Blocked Invoices', value: '4' }, { label: 'Early Pay Discount', value: '$1,280' },
    { label: 'DPO Trend', value: '48 days' }, { label: 'Freight Cost %', value: '2.8%' },
];

const logisticsKPIs = [
    { label: 'In-Transit Value', value: '$34,000' }, { label: 'Freight Claims', value: '1' },
    { label: 'Contracts Expiring (90d)', value: '3' }, { label: 'WH Safety Incidents', value: '0' },
];

// --- 2. Dashboard Component ---
function Dashboard() {
    const [activeTab, setActiveTab] = useState('tab-overview');

    // D3 Chart Placeholder Component (for visibility)
    const RenderOverviewCharts = () => (
        <div className="main-chart-grid">
            <div className="card"><div className="chart-body">Chart 1: Monthly Spend Placeholder</div></div>
            <div className="card"><div className="chart-body">Chart 2: Stock Status Placeholder</div></div>
            <div className="card"><div className="chart-body">Chart 3: Spend by Category Placeholder</div></div>
            <div className="card"><div className="chart-body">Chart 4: OTIF Rate Placeholder</div></div>
        </div>
    );
    
    // Helper to render Detail Grid KPIs
    const renderDetailGrid = (kpis) => (
        <div className="detail-grid">
            {kpis.map((kpi, index) => (
                <div className="detail-item" key={kpi.label}>
                    <div className="label">{kpi.label}</div>
                    <div className="value">{kpi.value}</div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="page-content">
            <div id="page-dashboard" className="d3-charts">

                {/* Filters */}
                <div className="page-filters">
                    <div className="form-group"><label>Site / Warehouse</label><select><option>All Sites</option><option>WH-A (Main)</option><option>WH-B (Raw)</option></select></div>
                    <div className="form-group"><label>Material Category</label><select><option>All Categories</option><option>Raw Material - Steel</option><option>Electronics</option><option>Office Supplies</option></select></div>
                    <div className="form-group"><label>Time Window</label><select><option>Last 30 Days</option><option>Last 90 Days</option><option>This Quarter</option><option>This Year</option></select></div>
                </div>

                {/* KPI Summary Grid */}
                <div className="kpi-summary-grid">
                    {kpiData.map((kpi, index) => (
                        <Link to={kpi.link} className="kpi-summary-item" key={index}>
                            <div className="label">{kpi.label}</div>
                            <div className="value" style={kpi.colorVar ? { color: `var(${kpi.colorVar})` } : {}}>{kpi.value}</div>
                            <div className="sub">{kpi.sub}</div>
                        </Link>
                    ))}
                </div>

                {/* Tab Navigation */}
                <div className="tab-nav">
                    {['tab-overview', 'tab-actions', 'tab-procurement', 'tab-inventory', 'tab-quality', 'tab-finance'].map(tab => (
                        <button key={tab} className={`tab-link ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} data-tab={tab}>
                            {tab.replace('tab-', '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                        </button>
                    ))}
                </div>

                <div className="tab-content">
                    {/* Overview Tab (Charts) */}
                    <div className={`tab-pane ${activeTab === 'tab-overview' ? 'active' : ''}`} id="tab-overview">
                        <RenderOverviewCharts />
                    </div>

                    {/* Action Items Tab (List) */}
                    <div className={`tab-pane ${activeTab === 'tab-actions' ? 'active' : ''}`} id="tab-actions">
                        <div className="card">
                            <ul className="task-list">
                                {actionItems.map((section, sIndex) => (
                                    <React.Fragment key={sIndex}>
                                        <h3>{section.heading}</h3>
                                        {section.tasks.map((task, tIndex) => (
                                            <li key={`${sIndex}-${tIndex}`}>
                                                <div><Link to={task.link}>{task.text}</Link><span className="meta">{task.meta}</span></div>
                                                <Link to={task.link} className="btn ghost" style={{ padding: '5px 10px' }}>{task.action}</Link>
                                            </li>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    {/* Procurement Tab (KPIs) */}
                    <div className={`tab-pane ${activeTab === 'tab-procurement' ? 'active' : ''}`} id="tab-procurement">
                        <div className="card">
                            <div className="modal-body">
                                <h3 style={{ marginTop: 0 }}>Procurement & Sourcing KPIs</h3>
                                {renderDetailGrid(procurementKPIs)}
                                <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '20px 0' }} />
                                <h3 style={{ marginTop: 0 }}>Supplier KPIs</h3>
                                {renderDetailGrid(supplierKPIs)}
                            </div>
                        </div>
                    </div>
                    
                    {/* Inventory Tab (KPIs) */}
                    <div className={`tab-pane ${activeTab === 'tab-inventory' ? 'active' : ''}`} id="tab-inventory">
                        <div className="card">
                            <div className="modal-body">
                                <h3 style={{ marginTop: 0 }}>Inventory & GRN KPIs</h3>
                                {renderDetailGrid(inventoryKPIs)}
                            </div>
                        </div>
                    </div>
                    
                    {/* Quality Tab (KPIs) */}
                    <div className={`tab-pane ${activeTab === 'tab-quality' ? 'active' : ''}`} id="tab-quality">
                        <div className="card">
                            <div className="modal-body">
                                <h3 style={{ marginTop: 0 }}>Quality KPIs</h3>
                                {renderDetailGrid(qualityKPIs)}
                            </div>
                        </div>
                    </div>
                    
                    {/* Finance Tab (KPIs) */}
                    <div className={`tab-pane ${activeTab === 'tab-finance' ? 'active' : ''}`} id="tab-finance">
                        <div className="card">
                            <div className="modal-body">
                                <h3 style={{ marginTop: 0 }}>Finance & P2P KPIs</h3>
                                {renderDetailGrid(financeP2PKPIs)}
                                <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '20px 0' }} />
                                <h3 style={{ marginTop: 0 }}>Logistics & Compliance KPIs</h3>
                                {renderDetailGrid(logisticsKPIs)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;