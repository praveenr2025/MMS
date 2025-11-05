// src/pages/Admin.jsx
import React, { useState } from 'react';
import { adminData } from '../data/adminData';

// --- Placeholder Modals (These should be separate components/functions in a real app) ---
// For brevity, using simple functions here to mimic modal behavior

const ModalRole = () => <p>Role Editor Form Content...</p>;
const ModalPermissionSet = () => <p>Permission Set Form Content...</p>;
const ModalWorkflow = () => <p>Workflow Editor Form Content...</p>;
const ModalPolicy = () => <p>Policy Editor Form Content...</p>;
const ModalSoD = () => <p>SoD Rule Form Content...</p>;
const ModalMap = () => <p>Map Permission Set to Role Form Content...</p>;
const ModalDelegate = () => <p>Delegation Form Content...</p>;
const ModalApprovalRules = () => <p>Approval Rules Table Content...</p>;
const ModalValidator = () => <p>Validator List Content...</p>;

// --- Utility Functions ---
const pillColor = (status) => {
    if (status === 'Active' || status === 'Success' || status === 'Trusted') return 'ok';
    if (status === 'Pending' || status === 'Under Review' || status === 'Draft' || status === 'Unverified' || status === 'Expiring' || status === 'Review') return 'warn';
    if (status === 'Blocked (SoD)' || status === 'Rejected') return 'bad';
    return 'blue';
};

const TAB_OPTIONS = [
    { key: 'rbac', label: 'Roles & Permission Sets', component: null },
    { key: 'workflows', label: 'Workflows & Approvals', component: null },
    { key: 'policies', label: 'Access Policies (RLS/CLS)', component: null },
    { key: 'sod', label: 'Segregation of Duties', component: null },
    { key: 'delegation', label: 'Delegation & Out-of-Office', component: null },
    { key: 'requests', label: 'Access Requests', component: null },
    { key: 'simulator', label: 'Simulate Effective Access', component: null },
    { key: 'audit', label: 'Audit & Sessions', component: null },
    { key: 'integrations', label: 'API & Directory Sync', component: null },
];

function Admin() {
    const [activeTab, setActiveTab] = useState('rbac');
    const [policyOutput, setPolicyOutput] = useState('// Results appear here…');
    const [simOutput, setSimOutput] = useState('// Simulation shows combined RBAC + ABAC + SoD outcome…');

    // Mock Modal Trigger (In a real app, this would use a global modal state)
    const mockOpenModal = (modalId, prefill = null) => {
        alert(`Opening Mock Modal: ${modalId}. Prefill: ${prefill ? prefill : 'None'}`);
    };

    // Mock Execution Handlers (Translates original JS alerts/updates)
    const runPolicyTest = () => {
        const user = document.getElementById('test-user').value;
        const entity = document.getElementById('test-entity').value;
        setPolicyOutput(`[Tester] As ${user} on ${entity}:\n- Applied: PR-Dept-Only, Invoice-PII-Mask, Stock-Warehouse-Scope\n- Rows filtered to your dept/warehouse. Masked sensitive columns if not Finance AP.`);
    };

    const runSimulator = () => {
        const user = document.getElementById('sim-user').value || 'jane.doe@company.com';
        const entity = document.getElementById('sim-entity').value;
        const scope = document.getElementById('sim-scope').value;
        setSimOutput(`[Simulation] User/Role: ${user}\nEntity: ${entity}\nScope: ${scope}\nResult: ALLOW (Actions: View, Create, Approve up to ₹10L)\nNotes: SoD clean; RLS filters applied.`);
    };

    const grantBreakGlass = () => {
        const why = (document.getElementById('bg-why').value || '—').trim();
        const role = document.getElementById('bg-role').value;
        const scope = document.getElementById('bg-scope').value;
        const mins = document.getElementById('bg-mins').value;
        alert(`Break‑glass granted for ${role} @ ${scope} for ${mins} min. Reason: ${why}`);
    };

    // Reusable component for rendering Pill/Badge
    const Pill = ({ status }) => <span className={`pill ${pillColor(status)}`}>{status}</span>;

    return (
        <div className="page-content">
            <div className="page-header">
                <h1>Controls</h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="btn" onClick={() => mockOpenModal('modal-role')}>+ New Role</button>
                    <button className="btn" onClick={() => mockOpenModal('modal-permission-set')}>+ Permission Set</button>
                    <button className="btn" onClick={() => mockOpenModal('modal-workflow')}>+ Workflow</button>
                    <button className="btn ghost" onClick={() => mockOpenModal('modal-policy')}>+ Access Policy</button>
                    <button className="btn ghost" onClick={() => mockOpenModal('modal-sod')}>+ SoD Rule</button>
                </div>
            </div>

            <div className="tabs" id="tabs">
                {TAB_OPTIONS.map(tab => (
                    <button
                        key={tab.key}
                        className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                        data-tab={tab.key}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* --- TAB PANELS START --- */}

            {/* 1. RBAC */}
            <section className={`tabpanel ${activeTab === 'rbac' ? 'active' : ''}`} id="rbac">
                <div className="grid cols-2">
                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>Roles</h3>
                        <div className="muted">Scoped by tenant, warehouse, category, or project. Supports inheritance & environment (DEV/UAT/PROD) scoping.</div>
                        <div className="matrix" style={{ marginTop: '10px' }}>
                            <table className="table">
                                <thead><tr><th>Role</th><th>Scope</th><th>Inheritance</th><th>Status</th><th className="actions-cell">Actions</th></tr></thead>
                                <tbody>
                                    {adminData.roles.map((role, i) => (
                                        <tr key={i}>
                                            <td><strong>{role.name}</strong></td>
                                            <td>{role.scope}</td>
                                            <td dangerouslySetInnerHTML={{ __html: role.inheritance.replace(/Requester|Approver|Stock User|Viewer/g, (m) => `<span class="pill blue">${m}</span>`) }}></td>
                                            <td><Pill status={role.status} /></td>
                                            <td className="actions-cell">
                                                <button className="btn ghost" onClick={() => mockOpenModal('modal-role', role.name)}>Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>Permission Sets</h3>
                        <div className="muted">Reusable bundles mapped to roles. Supports CRUD on entities, object-level rules, and action toggles.</div>
                        <div className="matrix" style={{ marginTop: '10px' }}>
                            <table className="table">
                                <thead><tr><th>Permission Set</th><th>Entities</th><th>Actions</th><th>Object-Level Constraints</th><th className="actions-cell">Assign</th></tr></thead>
                                <tbody>
                                    {adminData.permissionSets.map((ps, i) => (
                                        <tr key={i}>
                                            <td><strong>{ps.name}</strong></td>
                                            <td>{ps.entities}</td>
                                            <td>{ps.actions}</td>
                                            <td>{ps.constraints}</td>
                                            <td className="actions-cell">
                                                <button className="btn ghost" onClick={() => mockOpenModal('modal-map', ps.name)}>Map to Role</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Workflows */}
            <section className={`tabpanel ${activeTab === 'workflows' ? 'active' : ''}`} id="workflows">
                <div className="split">
                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>Workflow Designer</h3>
                        <div className="muted">Drag stages to define request → review → approve → post. Use rules for amount thresholds, vendor risk, item category, and SoD checks.</div>
                        <div className="grid cols-3" style={{ marginTop: '10px' }}>
                            <div className="detail-item"><div className="label">Object</div><div className="value">Purchase Requisition</div></div>
                            <div className="detail-item"><div className="label">Version</div><div className="value">v3 (Active)</div></div>
                            <div className="detail-item"><div className="label">Auto-Escalation</div><div className="value">48h</div></div>
                        </div>
                        <div className="card" style={{ padding: '10px', marginTop: '12px' }}>
                            <ol className="list" id="wf-stages">
                                {adminData.workflowStages.map((stage) => (
                                    <li key={stage.id}>
                                        <span><b>{stage.text.split('→')[0].trim()}</b> → {stage.text.split('→')[1].trim()}</span>
                                        <Pill status={stage.type === 'System' ? 'System' : 'Rule'} />
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <button className="btn" onClick={() => mockOpenModal('modal-workflow')}>Edit Stages</button>
                            <button className="btn ghost" onClick={() => mockOpenModal('modal-approval-rules')}>Approval Rules</button>
                            <button className="btn ghost" onClick={() => mockOpenModal('modal-validator')}>Pre‑Submission Validators</button>
                        </div>
                    </div>
                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>Workflow Catalog</h3>
                        <table className="table">
                            <thead><tr><th>Name</th><th>Applies To</th><th>Scope</th><th>Status</th><th className="actions-cell">Actions</th></tr></thead>
                            <tbody>
                                {adminData.workflowCatalog.map((wf, i) => (
                                    <tr key={i}>
                                        <td><strong>{wf.name}</strong></td>
                                        <td>{wf.appliesTo}</td>
                                        <td>{wf.scope}</td>
                                        <td><Pill status={wf.status} /></td>
                                        <td className="actions-cell"><button className="btn ghost" onClick={() => mockOpenModal('modal-workflow', wf.name)}>Edit</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* 3. Policies (RLS/CLS) */}
            <section className={`tabpanel ${activeTab === 'policies' ? 'active' : ''}`} id="policies">
                <div className="grid cols-2">
                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>Row/Column-Level Policies</h3>
                        <div className="muted">Define ABAC rules with user, role, dept, warehouse, and amount attributes. Mask sensitive columns for certain roles.</div>
                        <table className="table" style={{ marginTop: '10px' }}>
                            <thead><tr><th>Policy</th><th>Entity</th><th>Rule</th><th>Masking</th><th className="actions-cell">Actions</th></tr></thead>
                            <tbody>
                                {adminData.policies.map((p, i) => (
                                    <tr key={i}>
                                        <td><strong>{p.name}</strong></td>
                                        <td>{p.entity}</td>
                                        <td><span className="kbd">{p.rule}</span></td>
                                        <td><span className="kbd">{p.masking}</span></td>
                                        <td className="actions-cell"><button className="btn ghost" onClick={() => mockOpenModal('modal-policy', p.name)}>Edit</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>Policy Tester</h3>
                        <div className="muted">Run sample queries to preview RLS/CLS effects.</div>
                        <div className="grid">
                            <div className="form-group">
                                <label>Impersonate as</label>
                                <select id="test-user">
                                    <option>jane.doe@company.com (Procurement Manager)</option>
                                    <option>mark.smith@company.com (Warehouse Supervisor)</option>
                                    <option>ap.finance@company.com (Finance AP)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Entity</label>
                                <select id="test-entity">
                                    <option>Purchase Requisitions</option>
                                    <option>Invoices</option>
                                    <option>Stock</option>
                                </select>
                            </div>
                            <button className="btn" onClick={runPolicyTest}>Run Test</button>
                            <pre className="code" id="policy-output">{policyOutput}</pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. SoD */}
            <section className={`tabpanel ${activeTab === 'sod' ? 'active' : ''}`} id="sod">
                <div className="card" style={{ padding: '14px' }}>
                    <h3 style={{ margin: '6px 0 8px 0' }}>Segregation of Duties Rules</h3>
                    <div className="muted">Prevent incompatible access combos (e.g., Create & Approve). Use "mitigations" for exceptions with expiry.</div>
                    <table className="table" style={{ marginTop: '10px' }}>
                        <thead><tr><th>Rule</th><th>Conflicts</th><th>Scope</th><th>Mitigation</th><th className="actions-cell">Actions</th></tr></thead>
                        <tbody>
                            {adminData.sodRules.map((r, i) => (
                                <tr key={i}>
                                    <td><strong>{r.rule}</strong></td>
                                    <td>{r.conflicts}</td>
                                    <td>{r.scope}</td>
                                    <td>{r.mitigation}</td>
                                    <td className="actions-cell"><button className="btn ghost" onClick={() => mockOpenModal('modal-sod', r.rule)}>Edit</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 5. Delegation */}
            <section className={`tabpanel ${activeTab === 'delegation' ? 'active' : ''}`} id="delegation">
                <div className="grid cols-2">
                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>Delegation & Out-of-Office</h3>
                        <div className="muted">Temporary transfer of approvals/access with expiry and audit trail.</div>
                        <table className="table" style={{ marginTop: '10px' }}>
                            <thead><tr><th>User</th><th>Delegates To</th><th>From → To</th><th>Scope</th><th className="actions-cell">Actions</th></tr></thead>
                            <tbody>
                                {adminData.delegations.map((d, i) => (
                                    <tr key={i}>
                                        <td>{d.user}</td>
                                        <td>{d.delegatesTo}</td>
                                        <td>{d.period}</td>
                                        <td>{d.scope}</td>
                                        <td className="actions-cell"><button className="btn ghost" onClick={() => mockOpenModal('modal-delegate', d.user)}>Edit</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>Emergency Access (Break‑Glass)</h3>
                        <div className="muted">Time‑boxed elevated access with mandatory justification and auto‑revoke.</div>
                        <div className="grid">
                            <div className="form-group"><label>Justification</label><input id="bg-why" placeholder="e.g., Month-end closure blocked by policy" /></div>
                            <div className="grid cols-3">
                                <div className="form-group"><label>Role</label><select id="bg-role"><option>Finance AP</option><option>Procurement Manager</option></select></div>
                                <div className="form-group"><label>Scope</label><select id="bg-scope"><option>Org</option><option>WH-A</option></select></div>
                                <div className="form-group"><label>Duration (mins)</label><input id="bg-mins" type="number" defaultValue="60" /></div>
                            </div>
                            <button className="btn warn" onClick={grantBreakGlass}>Grant Break‑Glass</button>
                            <div className="muted">All actions are logged and routed to Security for review.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Access Requests */}
            <section className={`tabpanel ${activeTab === 'requests' ? 'active' : ''}`} id="requests">
                <div className="split">
                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>Pending Access Requests</h3>
                        <table className="table">
                            <thead><tr><th>Requested By</th><th>Role / Permission Set</th><th>Scope</th><th>Reason</th><th>Status</th><th className="actions-cell">Actions</th></tr></thead>
                            <tbody>
                                {adminData.accessRequests.map((r, i) => (
                                    <tr key={i}>
                                        <td>{r.requestedBy}</td><td>{r.role}</td><td>{r.scope}</td><td>{r.reason}</td>
                                        <td><Pill status={r.status} /></td>
                                        <td className="actions-cell">
                                            <button className="btn ok" style={{ marginRight: '8px' }}>Approve</button>
                                            <button className="btn bad">Reject</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>SLA & Auto‑Escalation</h3>
                        <ul className="list">
                            <li><span>Approver response time &le; 24h</span><span className="pill blue">Policy</span></li>
                            <li><span>Auto escalate to Dept Head after 24h</span><span className="pill blue">Policy</span></li>
                            <li><span>Auto close pending  7 days</span><span className="pill blue">Policy</span></li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* 7. Simulator */}
            <section className={`tabpanel ${activeTab === 'simulator' ? 'active' : ''}`} id="simulator">
                <div className="card" style={{ padding: '14px' }}>
                    <h3 style={{ margin: '6px 0 8px 0' }}>Effective Access Simulator</h3>
                    <div className="grid cols-3">
                        <div className="form-group"><label>User / Role</label><input id="sim-user" placeholder="e.g., jane.doe@company.com or Role: Warehouse Supervisor" /></div>
                        <div className="form-group"><label>Entity</label><select id="sim-entity"><option>Purchase Orders</option><option>Invoices</option><option>Stock</option></select></div>
                        <div className="form-group"><label>Scope</label><select id="sim-scope"><option>Org</option><option>WH-A</option><option>WH-B</option></select></div>
                    </div>
                    <button className="btn" onClick={runSimulator}>Simulate</button>
                    <pre className="code" id="sim-output">{simOutput}</pre>
                </div>
            </section>

            {/* 8. Audit */}
            <section className={`tabpanel ${activeTab === 'audit' ? 'active' : ''}`} id="audit">
                <div className="grid cols-2">
                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>Audit Log</h3>
                        <table className="table">
                            <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>Result</th></tr></thead>
                            <tbody>
                                {adminData.auditLog.map((log, i) => (
                                    <tr key={i}>
                                        <td>{log.time}</td><td>{log.actor}</td><td>{log.action}</td><td>{log.target}</td>
                                        <td><Pill status={log.result} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>Active Sessions & Policies</h3>
                        <table className="table">
                            <thead><tr><th>User</th><th>IP</th><th>Location</th><th>Device Trust</th><th>Actions</th></tr></thead>
                            <tbody>
                                {adminData.activeSessions.map((session, i) => (
                                    <tr key={i}>
                                        <td>{session.user}</td><td>{session.ip}</td><td>{session.location}</td>
                                        <td><Pill status={session.trust} /></td>
                                        <td className="actions-cell">
                                            <button className="btn ghost" style={{ marginRight: '8px' }}>Revoke</button>
                                            <button className="btn bad">Force Logout</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="detail-item" style={{ marginTop: '10px' }}>
                            <div className="label">Session Policies</div>
                            <div className="value">MFA required | Device posture check | Geo‑fencing (IN only)</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 9. Integrations */}
            <section className={`tabpanel ${activeTab === 'integrations' ? 'active' : ''}`} id="integrations">
                <div className="grid cols-2">
                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>Directory Sync</h3>
                        <div className="muted">Connect SSO & SCIM to import users and groups (Azure AD, Okta, Google Workspace). User provisioning is external to this page.</div>
                        <div className="grid cols-3" style={{ marginTop: '10px' }}>
                            <div className="detail-item"><div className="label">SSO</div><div className="value">SAML 2.0</div></div>
                            <div className="detail-item"><div className="label">SCIM</div><div className="value">Enabled (15m sync)</div></div>
                            <div className="detail-item"><div className="label">JIT</div><div className="value">On</div></div>
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                            <button className="btn ghost">Configure SSO</button>
                            <button className="btn ghost">Configure SCIM</button>
                        </div>
                    </div>
                    <div className="card" style={{ padding: '14px' }}>
                        <h3 style={{ margin: '6px 0 8px 0' }}>API Tokens</h3>
                        <div className="muted">Fine‑grained tokens bound to roles & scopes. Rotate automatically every 90 days.</div>
                        <table className="table" style={{ marginTop: '10px' }}>
                            <thead><tr><th>Token</th><th>Bound Role</th><th>Scope</th><th>Created</th><th>Status</th><th className="actions-cell">Actions</th></tr></thead>
                            <tbody>
                                {adminData.apiTokens.map((token, i) => (
                                    <tr key={i}>
                                        <td>{token.token}</td><td>{token.role}</td><td>{token.scope}</td><td>{token.created}</td>
                                        <td><Pill status={token.status} /></td>
                                        <td className="actions-cell">
                                            <button className="btn ghost" style={{ marginRight: '8px' }}>Rotate</button>
                                            {token.status !== 'Expiring' && <button className="btn bad">Revoke</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

        </div>
    );
}

export default Admin;