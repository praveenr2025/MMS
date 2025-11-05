// src/data/poData.js

const storeKey = 'mms_po_page_v1';

const initialDB = {
    suppliers: ['Global Steel Ltd.', 'Apex Office Supplies', 'Techtronics Inc.', 'National Polymers'],
    materials: ['HR-101', 'ZINC-PL', 'PP-GRAN', 'LABEL-4x6', 'IC-7788'], // Mock Material Master for dropdowns
    pos: [
        {
            no: 'PO-2025-0145', date: '2025-10-28', supplier: 'Global Steel Ltd.', currency: 'USD', status: 'Approved', terms: 'Net 60', incoterms: 'FOB', shipTo: 'Main Warehouse, Jaipur', notes: 'Deliver in 2 lots', freight: 250, tax: 0, subtotal: 15200, total: 15450,
            lines: [
                { item: 'HR-101', desc: 'Hot Rolled Coil', uom: 'MT', qty: 10, price: 700 },
                { item: 'ZINC-PL', desc: 'Zinc plating chemical', uom: 'KG', qty: 20, price: 10 }
            ],
            receipts: [{ grn: 'GRN-2025-061', date: '2025-10-30', line: 1, qty: 5, loc: 'WH-A1', accepted: 5, rejected: 0 }],
            invoices: [{ inv: 'INV-2025-771', date: '2025-10-30', amount: 15450, match: 'Matched' }],
            approvals: [{ step: 1, approver: 'proc-head@company.com', action: 'Approved', date: '2025-10-28' }],
            revisions: [{ co: 'CO-001', date: '2025-10-29', change: 'Lot split & delivery date updated' }],
            docs: [{ file: 'PO_2025_0145.pdf', type: 'PO PDF', uploaded: '2025-10-28' }]
        },
        {
            no: 'PO-2025-0146', date: '2025-10-29', supplier: 'Techtronics Inc.', currency: 'USD', status: 'Partially Received', terms: 'Net 30', incoterms: 'CIF', shipTo: 'Electronics WH, Pune', notes: 'Fragile - handle with care', freight: 80, tax: 0, subtotal: 3120, total: 3200,
            lines: [{ item: 'IC-7788', desc: 'Control IC', uom: 'EA', qty: 400, price: 7.8 }],
            receipts: [{ grn: 'GRN-2025-064', date: '2025-10-31', line: 1, qty: 200, loc: 'E-WH-B2' }],
            invoices: [],
            approvals: [{ step: 1, approver: 'eng@company.com', action: 'Approved', date: '2025-10-29' }],
            revisions: [], docs: []
        },
        {
            no: 'PO-2025-0147', date: '2025-10-29', supplier: 'National Polymers', currency: 'INR', status: 'Pending Approval', terms: 'Net 30', incoterms: 'EXW', shipTo: 'Main Warehouse, Jaipur', notes: 'Urgent', freight: 0, tax: 18, subtotal: 15254, total: 18000,
            lines: [{ item: 'PP-GRAN', desc: 'PP Granules', uom: 'KG', qty: 1000, price: 15.254 }],
            receipts: [], invoices: [], approvals: [], revisions: [], docs: []
        }
    ],
    activity: [
        { event: 'Partial Receipt (GRN-2025-064)', po: 'PO-2025-0146', supplier: 'Techtronics Inc.', date: '2025-10-31' },
        { event: 'Invoice Matched', po: 'PO-2025-0145', supplier: 'Global Steel Ltd.', date: '2025-10-30' },
        { event: 'PO Approved', po: 'PO-2025-0147', supplier: 'National Polymers', date: '2025-10-29' }
    ]
};

function getPOData() {
    const s = localStorage.getItem(storeKey);
    if (s) return JSON.parse(s);
    localStorage.setItem(storeKey, JSON.stringify(initialDB));
    return initialDB;
}

function setPOData(db) {
    localStorage.setItem(storeKey, JSON.stringify(db));
}

export { getPOData, setPOData };