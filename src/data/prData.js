// src/data/prData.js

const stateKey = 'mms_prs_v1';
const uid = p => p + Math.random().toString(36).slice(2, 8).toUpperCase();
const todayISO = () => new Date().toISOString().slice(0, 10);
const nextSLA = (hours) => { const d = new Date(); d.setHours(d.getHours() + hours); return d.toISOString(); };

const initialData = {
    prs: [], approvals: [], role: 'requester',
    sla: { dept: 24, proc: 24, fin: 24 }, budgetLimit: 5000000, budgetUsed: 0,
    draftLines: [{ code: 'LT-14-16GB', desc: 'Laptop 14" 16GB/512GB', uom: 'Nos', price: 78000, qty: 1, tax: 18 }],
    comments: [], files: [], quotes: [], templates: {},
    catalog: [
        { code: 'LT-14-16GB', desc: 'Laptop 14" 16GB/512GB', uom: 'Nos', price: 78000, tax: 18 },
        { code: 'MON-27IPS', desc: 'Monitor 27" IPS', uom: 'Nos', price: 21000, tax: 18 },
        { code: 'CHR-ERG', desc: 'Ergonomic Chair', uom: 'Nos', price: 12000, tax: 18 },
        { code: 'SVC-CLOUD', desc: 'Cloud Subscription (Annual)', uom: 'Lot', price: 250000, tax: 18 },
        { code: 'LAB-OSC', desc: 'Oscilloscope 100MHz', uom: 'Nos', price: 145000, tax: 18 }
    ]
};

// Seed sample PRs function (replicated from original JS)
function seedPRs(state) {
    const sample = [
        { title: '25 Developer Laptops', dept: 'IT', requester: 'shailendra.chauhan', amount: 1800000, status: 'In Approval', stage: 'Procurement' },
        { title: 'Office Chairs Replacement', dept: 'Operations', requester: 'ram.k', amount: 420000, status: 'In Approval', stage: 'Dept Head' },
        { title: 'Annual Cloud Credits', dept: 'Finance', requester: 'meera.s', amount: 750000, status: 'Approved', stage: 'Approved' },
        { title: 'Lab Instruments', dept: 'R&D', requester: 'ajay.p', amount: 1200000, status: 'Submitted', stage: 'Dept Head' }
    ];
    sample.forEach(s => {
        const pr = {
            id: uid('PR-'), title: s.title, dept: s.dept, requester: s.requester, reqBy: todayISO(), budget: 'OPS-OPEX-2025', priority: 'Normal', capex: 'OPEX', split: '', deliverTo: 'Main WH', gstin: '27ABCDE1234F1Z5', justification: '—', watchers: [],
            lines: [{ code: 'AUTO', desc: s.title, uom: 'Nos', qty: 1, price: s.amount, tax: 0 }], comments: [], files: [], quotes: [],
            status: s.status, amount: s.amount, stage: s.stage, updated: new Date().toLocaleString(),
            history: [{ ts: new Date().toLocaleString(), by: 'system', action: 'Seeded', note: '' }]
        };
        state.prs.push(pr); 
        if (pr.stage !== 'Approved') state.approvals.push(pr);
    });
    // Set budget used for approved items
    state.budgetUsed = state.prs.filter(p => p.status === 'Approved').reduce((sum, p) => sum + p.amount, 0);
}

// Function to fetch/initialize state from localStorage
export function getPrState() {
    const s = localStorage.getItem(stateKey);
    if (s) return JSON.parse(s);
    
    // Seed and save initial state if nothing is found
    const state = JSON.parse(JSON.stringify(initialData));
    seedPRs(state);
    localStorage.setItem(stateKey, JSON.stringify(state));
    return state;
}

export function setPrState(state) {
    localStorage.setItem(stateKey, JSON.stringify(state));
}
export { uid, todayISO, nextSLA };