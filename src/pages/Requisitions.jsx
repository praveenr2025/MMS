import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PRForm from '../components/Procurement/PRForm';
import { getPrState, setPrState } from '../data/prData'; // Assumed data layer
import { fmtMoney, pillColor } from '../utils/formatters'; // Assumed utility functions

// Helper constants (replicated from original JS logic)
const daysBetween = (d1, d2) => Math.round((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));
const nextSLA = (hours) => { const d = new Date(); d.setHours(d.getHours() + hours); return d.toISOString(); };

const PR_TABS = [
    { key: 't1', label: 'My Dashboard' },
    { key: 't2', label: 'Create PR' },
    { key: 't3', label: 'Pending My Approval' },
    { key: 't4', label: 'My Submissions' },
    { key: 't5', label: 'All Open' },
    { key: 't6', label: 'Search' },
    { key: 't7', label: 'Settings' },
];

const DEPARTMENTS = ['IT', 'Operations', 'Finance', 'R&D', 'Marketing'];
const PR_STATUSES = ['Draft', 'Submitted', 'In Approval', 'Approved', 'Rejected', 'PO Created'];

// --- MOCK DATA FOR DASHBOARD LISTS ---
const openTasksMock = [
    { id: 'PR-8F03XY', title: '25 Developer Laptops', dept: 'Procurement', stage: 'Procurement' },
    { id: 'PR-AJ9R06', title: 'Office Chairs Replacement', dept: 'Operations', stage: 'Dept Head' },
    { id: 'PR-N16B04', title: 'Lab Instruments', dept: 'R&D', stage: 'Dept Head' },
];
const recentActivityMock = [
    { id: 'PR-8F03XY', time: '11/4/2025', status: 'In Approval' },
    { id: 'PR-AJ9R06', time: '11/4/2025', status: 'In Approval' },
    { id: 'PR-X7Y6VU', time: '11/4/2025', status: 'Approved' },
    { id: 'PR-N16B04', time: '11/4/2025', status: 'Submitted' },
];

function Requisitions() {
    const [prState, setPrState] = useState(getPrState());
    const [activeTab, setActiveTab] = useState('t1');
    const [role, setRole] = useState('requester');
    const [openFilters, setOpenFilters] = useState({ status: '', dept: '' });
    const [searchFilters, setSearchFilters] = useState({ title: '', requester: '', fromDate: '', toDate: '' });

    const refreshData = () => {
        const newState = getPrState();
        setPrState(newState);
    };

    useEffect(() => {
        refreshData();
        if (window.lucide) window.lucide.createIcons();
    }, []);
    
    const handleRoleChange = (e) => setRole(e.target.value);
    
    const handlePRAction = (prId, action) => {
        if (!window.confirm(`Confirm action: ${action} for PR ${prId}?`)) return;
        // Mock action logic would go here
        refreshData();
    };

    const dataViews = useMemo(() => {
        const mySubmissions = prState.prs.filter(p => p.requester.includes('shailendra.chauhan'));
        const openApprovals = prState.approvals.filter(pr => {
            const canAct = (
                (role === 'admin') || (role === 'dept_head' && pr.stage === 'Dept Head') ||
                (role === 'procurement' && pr.stage === 'Procurement') ||
                (role === 'finance' && pr.stage === 'Finance')
            );
            return canAct;
        });

        // T5 - All Open Requisitions Filtering (Base logic)
        let allOpen = prState.prs.filter(p => p.status !== 'Closed' && p.status !== 'Rejected' && p.status !== 'Approved' && p.status !== 'PO Created' && p.status !== 'Draft');
        if (openFilters.status) allOpen = allOpen.filter(p => p.status === openFilters.status || (openFilters.status === 'In Approval' && p.status.includes('Approval')));
        if (openFilters.dept) allOpen = allOpen.filter(p => p.dept === openFilters.dept);

        let searchResults = prState.prs.slice(); // Simplified search results

        return { 
            mySubmissions, openApprovals, allOpen, searchResults,
            draftsCount: prState.prs.filter(p => p.status === 'Draft').length,
            submittedCount: prState.prs.filter(p => p.status === 'In Approval').length,
            approvedCount: prState.prs.filter(p => p.status === 'Approved').length,
            budgetUsed: prState.budgetUsed,
        };
    }, [prState, role, openFilters]);


    // --- Helper Component to render Detail Grid KPIs (used in Dashboard conversion) ---
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
    
    // --- 1. RENDERER FOR T1: Dashboard (Simple KPIs) ---
    const RenderDashboard = () => (
        <section id="t1" className="card p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold">Your PR Overview</h2>
                <div className="flex gap-2">
                    <button className="btn ghost" onClick={() => setActiveTab('t2')}>New PR</button>
                    <button className="btn subtle" onClick={() => alert('Exporting all data...')}>Export</button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
                <div className="card p-4 shadow-soft"><div className="text-sm text-[var(--muted)]">Pending My Approval</div><div className="text-3xl font-extrabold">{dataViews.openApprovals.length}</div></div>
                <div className="card p-4 shadow-soft"><div className="text-sm text-[var(--muted)]">My Drafts</div><div className="text-3xl font-extrabold">{dataViews.draftsCount}</div></div>
                <div className="card p-4 shadow-soft"><div className="text-sm text-[var(--muted)]">Submitted</div><div className="text-3xl font-extrabold">{dataViews.submittedCount}</div></div>
                <div className="card p-4 shadow-soft"><div className="text-sm text-[var(--muted)]">Approved</div><div className="text-3xl font-extrabold">{dataViews.approvedCount}</div></div>
                <div className="card p-4 shadow-soft"><div className="text-sm text-[var(--muted)]">Budget Used</div><div className="text-3xl font-extrabold">{fmtMoney(prState.budgetUsed, 'INR')}</div></div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="card p-4">
                    <div className="font-bold mb-2">Open Tasks</div>
                    <ul id="openTasks" className="list-disc pl-6 text-sm text-[var(--muted)]">
                        {openTasksMock.map(task => <li key={task.id} className="mb-1">
                            <span className="font-bold">{task.id}</span> - {task.title} <span className="tag">{task.stage}</span>
                        </li>)}
                    </ul>
                </div>
                <div className="card p-4">
                    <div className="font-bold mb-2">Recent Activity</div>
                    <ul id="recentActivity" className="list-disc pl-6 text-sm text-[var(--muted)]">
                        {recentActivityMock.map(activity => <li key={activity.id} className="mb-1">
                            {activity.time}: <span className="font-bold">{activity.id}</span> - {activity.status}
                        </li>)}
                    </ul>
                </div>
            </div>
        </section>
    );

    // --- 2. RENDERER FOR T3: Pending My Approval ---
    const RenderApprovalQueue = () => (
        <section id="t3" className="card p-4">
            <h2 className="text-xl font-extrabold">Pending My Approval ({dataViews.openApprovals.length})</h2>
            <div className="overflow-auto mt-3 border border-[var(--border)] rounded-xl">
                <table className="table" id="approvalsTable">
                    <thead><tr><th>PR #</th><th>Title</th><th>Dept</th><th>Amount</th><th>Stage</th><th>SLA (h)</th><th>Actions</th></tr></thead>
                    <tbody>
                        {dataViews.openApprovals.map(pr => {
                            const slaLeftHrs = pr.slaDue ? Math.max(0, Math.round((new Date(pr.slaDue).getTime() - new Date().getTime()) / 36e5)) : '—';
                            return (
                                <tr key={pr.id}>
                                    <td className="font-bold">{pr.id}</td><td>{pr.title}</td><td>{pr.dept}</td><td>{fmtMoney(pr.amount, 'INR')}</td>
                                    <td><span className={`pill warn`}>{pr.stage}</span></td><td>{slaLeftHrs}h</td>
                                    <td className="flex gap-2">
                                        <button className="btn ok" onClick={() => handlePRAction(pr.id, 'Approve')}>Approve</button>
                                        <button className="btn bad" onClick={() => handlePRAction(pr.id, 'Reject')}>Reject</button>
                                        <button className="btn subtle" onClick={() => alert(`View Details for ${pr.id}`)}>View</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
    
    // --- 3. RENDERER FOR T4: My Submissions ---
    const RenderMySubmissions = () => (
        <section id="t4" className="card p-4">
            <h2 className="text-xl font-extrabold">My Submissions ({dataViews.mySubmissions.length})</h2>
            <div className="overflow-auto mt-3 border border-[var(--border)] rounded-xl">
                <table className="table" id="mineTable">
                    <thead><tr><th>PR #</th><th>Title</th><th>Status</th><th>Amount</th><th>Updated</th><th>Actions</th></tr></thead>
                    <tbody>
                        {dataViews.mySubmissions.map(pr => (
                            <tr key={pr.id}>
                                <td className="font-bold">{pr.id}</td><td>{pr.title}</td>
                                <td dangerouslySetInnerHTML={{ __html: `<span className="pill ${pillColor(pr.status)}">${pr.status}</span>` }}></td>
                                <td>{fmtMoney(pr.amount, 'INR')}</td><td>{new Date(pr.updated).toLocaleDateString()}</td>
                                <td className="flex gap-2">
                                    <button className="btn subtle">View</button>
                                    {pr.status.includes('Approval') && <button className="btn warn" onClick={() => handlePRAction(pr.id, 'Recall')}>Recall</button>}
                                    {pr.status === 'Approved' && <button className="btn" onClick={() => handlePRAction(pr.id, 'Create PO')}>PO</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );

    // --- 4. RENDERER FOR T5: All Open Requisitions ---
    const RenderAllOpen = () => (
        <section id="t5" className="card p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold">All Open Requisitions ({dataViews.allOpen.length})</h2>
                <div className="flex gap-2">
                    <select id="fltStatus" className="input w-44" value={openFilters.status} onChange={e => setOpenFilters(p => ({ ...p, status: e.target.value }))}>
                        <option value="">All Status</option>
                        {PR_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select id="fltDept" className="input w-40" value={openFilters.dept} onChange={e => setOpenFilters(p => ({ ...p, dept: e.target.value }))}>
                        <option value="">All Depts</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button className="btn subtle" onClick={() => alert('Filter Applied')}> Apply</button>
                </div>
            </div>
            <div className="overflow-auto mt-3 border border-[var(--border)] rounded-xl">
                <table className="table" id="openTable">
                    <thead><tr><th>PR #</th><th>Title</th><th>Dept</th><th>Requester</th><th>Status</th><th>Amount</th><th>Age (d)</th><th>Actions</th></tr></thead>
                    <tbody>
                        {dataViews.allOpen.map(pr => (
                            <tr key={pr.id}>
                                <td className="font-bold">{pr.id}</td><td>{pr.title}</td><td>{pr.dept}</td><td>{pr.requester}</td>
                                <td dangerouslySetInnerHTML={{ __html: `<span className="pill ${pillColor(pr.status)}">${pr.status}</span>` }}></td>
                                <td>{fmtMoney(pr.amount, 'INR')}</td><td>{daysBetween(new Date(pr.history[0]?.ts || pr.updated), new Date())}</td>
                                <td className="flex gap-2">
                                    <button className="btn subtle" onClick={() => alert(`View Details for ${pr.id}`)}>View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );

    // --- 5. RENDERER FOR T6: Search (Static Layout) ---
const RenderSearch = () => {
    // This logic performs a manual filter/refresh check on searchFilters 
    // In a final app, dataViews.searchResults would handle filtering automatically.
    const searchData = dataViews.searchResults.slice(0, 5); // Use a slice for demo visibility

    return (
        <section id="t6" className="card p-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold">Search</h2>
                <div className="flex gap-2">
                    <button className="btn subtle" onClick={() => alert('Reset Search (Demo)')}>Reset</button>
                    <button className="btn ghost" onClick={() => alert('Download CSV (Demo)')}>CSV</button>
                </div>
            </div>
            <div className="grid md:grid-cols-4 gap-3 mt-3">
                <input id="sByTitle" className="input" placeholder="Title contains..." />
                <input id="sByRequester" className="input" placeholder="Requester..." />
                <input id="sFromDate" className="input" type="date" />
                <input id="sToDate" className="input" type="date" />
                {/* Note: In a real app, you would add a button here to trigger the search */}
            </div>
            
            <div className="overflow-auto mt-3 border border-[var(--border)] rounded-xl">
                <table className="table" id="searchTable">
                    <thead><tr><th>PR #</th><th>Title</th><th>Dept</th><th>Requester</th><th>Status</th><th>Amount</th><th>Updated</th><th>Actions</th></tr></thead>
                    <tbody>
                        {searchData.map(pr => (
                            <tr key={pr.id}>
                                <td className="font-bold">{pr.id}</td>
                                <td>{pr.title}</td>
                                <td>{pr.dept}</td>
                                <td>{pr.requester}</td>
                                <td dangerouslySetInnerHTML={{ __html: `<span class="pill ${pillColor(pr.status)}">${pr.status}</span>` }}></td>
                                <td>{fmtMoney(pr.amount, 'INR')}</td>
                                <td>{new Date(pr.updated).toLocaleDateString()}</td>
                                <td className="flex gap-2"><button className="btn subtle" onClick={() => alert(`View ${pr.id}`)}>View</button></td>
                            </tr>
                        ))}
                        {searchData.length === 0 && <tr><td colSpan="8">No results available. Start your search.</td></tr>}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
    // --- 6. RENDERER FOR T7: Settings (Static Layout) ---
    const RenderSettings = () => (
        <section id="t7" className="card p-4">
            <h2 className="text-xl font-extrabold">Requisition Settings</h2>
            <div className="grid md:grid-cols-3 gap-3 mt-3">
                 <div className="card p-4">
                     <div className="font-bold mb-2">Approval Matrix</div>
                     <p className="text-sm text-[var(--muted)] mb-3">Stage-wise approvers by dept & amount slab.</p>
                     <button className="btn subtle" onClick={() => alert('Open Matrix Modal (Demo)')}> Edit Matrix</button>
                 </div>
                 <div className="card p-4">
                     <div className="font-bold mb-2">Validation Rules</div>
                     <label className="flex items-center gap-2 text-sm"><input type="checkbox" id="ruleJust" defaultChecked /> Require Business Justification</label>
                     <label className="flex items-center gap-2 text-sm mt-2"><input type="checkbox" id="ruleBudget" defaultChecked /> Block if Budget Exceeded</label>
                     <label className="flex items-center gap-2 text-sm mt-2"><input type="checkbox" id="ruleDate" defaultChecked /> Required By must be ≥ today</label>
                     <label className="flex items-center gap-2 text-sm mt-2"><input type="checkbox" id="ruleQuotes" defaultChecked /> Require min 2 quotes ≥ ₹1L</label>
                 </div>
                 <div className="card p-4">
                     <div className="font-bold mb-2">SLA (hours)</div>
                     <label className="text-sm">Dept Head</label><input className="input" type="number" defaultValue="24" />
                     <label className="text-sm mt-2">Procurement</label><input className="input" type="number" defaultValue="24" />
                     <label className="text-sm mt-2">Finance</label><input className="input" type="number" defaultValue="24" />
                     <button className="btn subtle mt-3" onClick={() => alert('SLA Saved')}> Save</button>
                 </div>
            </div>
        </section>
    );

    return (
        <div className="page-content">
            <div className="main-content">
                {/* Header (Role Selector) - Must be here to match the image structure */}
                <header className="sticky-head">
                    <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--brand)] text-white font-extrabold">PR</span>
                            <div className="text-xl font-extrabold">Purchase Requisitions</div>
                        </div>
                        <select id="roleSelect" className="input w-[220px]" value={role} onChange={handleRoleChange}>
                            <option value="requester">Role: Requester</option><option value="dept_head">Role: Dept Head</option><option value="procurement">Role: Procurement</option><option value="finance">Role: Finance</option><option value="admin">Role: Admin</option>
                        </select>
                    </div>
                </header>
                
                <div className="max-w-[1400px] mx-auto px-4 py-4">
                    <main className="flex-1 flex flex-col gap-4">
                        {/* Tab Navigation */}
                        <div className="card p-2">
                            <div className="flex flex-wrap gap-2">
                                {PR_TABS.map(tab => (
                                    <button key={tab.key} className={`pill ${activeTab === tab.key ? 'ok' : 'gray'}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
                                ))}
                                <span className="ml-auto text-[13px] text-[var(--muted)]">Press <span className="kbd">/</span> to search • <span className="kbd">Ctrl</span> + <span className="kbd">Enter</span> to submit</span>
                            </div>
                        </div>

                        {/* Render Active Section */}
                        {activeTab === 't1' && <RenderDashboard />}
                        {activeTab === 't2' && <section id="t2" className="card p-4"><PRForm prState={prState} setPrState={setPrState} refreshAll={refreshData} /></section>}
                        {activeTab === 't3' && <RenderApprovalQueue />}
                        {activeTab === 't4' && <RenderMySubmissions />}
                        {activeTab === 't5' && <RenderAllOpen />}
                        {activeTab === 't6' && <RenderSearch />}
                        {activeTab === 't7' && <RenderSettings />}
                        
                    </main>
                </div>
            </div>
        </div>
    );
}

export default Requisitions;