// src/data/adminData.js

export const adminData = {
    // RBAC
    roles: [
        { name: 'Procurement Manager', scope: 'Org » All Warehouses', inheritance: 'Base: Requester + Approver', status: 'Active' },
        { name: 'Warehouse Supervisor', scope: 'WH-A, WH-B', inheritance: 'Base: Stock User', status: 'Active' },
        { name: 'Finance AP', scope: 'Finance » Invoices', inheritance: 'Base: Viewer', status: 'Active' },
    ],
    permissionSets: [
        { name: 'PR-Create-Approve', entities: 'Purchase Requisitions', actions: 'Create, View, Approve, Comment', constraints: 'Dept in {ENG, OPS}' },
        { name: 'PO-Full', entities: 'Purchase Orders', actions: 'Create, View, Edit, Approve, Close', constraints: 'PO Amount ≤ 10L for Managers' },
        { name: 'Stock-Issue-Control', entities: 'Issue (MIV), Stock', actions: 'Create, Issue, Reverse', constraints: 'Warehouse ∈ Assigned' },
    ],
    
    // Workflows
    workflowStages: [
        { id: 1, text: 'Draft → validations (budget, vendor whitelist)', type: 'System' },
        { id: 2, text: 'Line Manager Approval → amount ≤ ₹1L', type: 'Rule' },
        { id: 3, text: 'Dept Head Approval → ₹1L–₹10L', type: 'Rule' },
        { id: 4, text: 'Finance Approval → tax/TDS policy check', type: 'Rule' },
        { id: 5, text: 'Procurement Finalize → convert to PO', type: 'System' },
    ],
    workflowCatalog: [
        { name: 'PR Default', appliesTo: 'PR', scope: 'Org', status: 'Active' },
        { name: 'PO > ₹10L', appliesTo: 'PO', scope: 'Org', status: 'Draft' },
        { name: 'GRN QC Required', appliesTo: 'GRN', scope: 'WH-A', status: 'Active' },
    ],

    // Policies
    policies: [
        { name: 'PR-Dept-Only', entity: 'Purchase Requisitions', rule: 'user.dept == row.dept', masking: '—' },
        { name: 'Invoice-PII-Mask', entity: 'Invoices', rule: "role != 'Finance AP'", masking: 'mask(vendor_bank_acct)' },
        { name: 'Stock-Warehouse-Scope', entity: 'Stock', rule: 'row.wh in user.assigned_wh', masking: '—' },
    ],

    // SoD
    sodRules: [
        { rule: 'PR Create vs Approve', conflicts: 'PR.Create ↔ PR.Approve', scope: 'Org', mitigation: 'Exception by Internal Audit (90 days)' },
        { rule: 'PO Approve vs Vendor Master Edit', conflicts: 'PO.Approve ↔ Vendor.Edit', scope: 'Org', mitigation: 'None' },
        { rule: 'Issue vs Reverse', conflicts: 'Issue.Create ↔ Issue.Reverse', scope: 'Warehouse', mitigation: 'Two-person rule' },
    ],

    // Delegation
    delegations: [
        { user: 'jane.doe@company.com', delegatesTo: 'robert.chen@company.com', period: '01 Nov → 08 Nov', scope: 'PR Approvals' },
        { user: 'ap.finance@company.com', delegatesTo: 'mark.smith@company.com', period: '03 Nov → 05 Nov', scope: 'Invoice Approvals ≤ ₹5L' },
    ],

    // Access Requests
    accessRequests: [
        { requestedBy: 'sam.k@company.com', role: 'PO-Full', scope: 'Org', reason: 'Project X procurement', status: 'Pending' },
        { requestedBy: 'ria.b@company.com', role: 'Stock-Issue-Control', scope: 'WH-B', reason: 'Shift lead', status: 'Pending' },
    ],

    // Audit
    auditLog: [
        { time: '2025‑11‑02 09:05', actor: 'jane.doe@company.com', action: 'Approve', target: 'PR‑2025‑0018', result: 'Success' },
        { time: '2025‑11‑02 09:12', actor: 'mark.smith@company.com', action: 'Reverse Issue', target: 'MIV‑2025‑0041', result: 'Blocked (SoD)' },
        { time: '2025‑11‑02 10:02', actor: 'ap.finance@company.com', action: 'Break‑Glass Granted', target: 'Role: Finance AP (60m)', result: 'Review' },
    ],
    activeSessions: [
        { user: 'jane.doe@company.com', ip: '10.20.33.18', location: 'IN', trust: 'Trusted' },
        { user: 'mark.smith@company.com', ip: '10.20.33.57', location: 'IN', trust: 'Unverified' },
    ],

    // Integrations
    apiTokens: [
        { token: 'tok_2f1a…9cd', role: 'Warehouse Supervisor', scope: 'WH‑A', created: '2025‑10‑02', status: 'Active' },
        { token: 'tok_e91b…12a', role: 'Finance AP', scope: 'Org', created: '2025‑08‑11', status: 'Expiring' },
    ]
};