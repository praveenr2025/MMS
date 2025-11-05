// src/data/supplierData.js

const storeKey = 'mms_suppliers_page_v1';

// Normalized Initial Data
const initialData = {
    suppliers: [
        { id: 's1', name: 'Global Steel Ltd.', contact: 'John Smith', email: 'sales@globalsteel.com', phone: '+1 555-1234', categories: ['Raw Material - Steel'], status: 'Active', poValue: 25250, taxId: 'GST12345', terms: 'Net 60', bank: '**** **** 1234', address: '123 Main St, Steel City, USA',
            kpis: { otd: '99.2%', quality: '100%', po: 25250 },
            contacts: [{ type: 'Primary', name: 'John Smith', email: 'sales@globalsteel.com', phone: '+1 555-1234' }, { type: 'Accounts', name: 'Jane Doe', email: 'accounts@globalsteel.com', phone: '+1 555-1235' }],
            poHistory: [{ no: 'PO-2025-0145', date: '2025-10-28', amount: 15450, status: 'Received' }, { no: 'PO-2025-0141', date: '2025-10-24', amount: 9800, status: 'Closed' }],
            docs: [{ type: 'Contract', file: 'Global_Steel_Contract_2025.pdf', uploaded: '2025-10-20', expiry: '2026-10-19', status: 'Valid' }, { type: 'ISO 9001', file: 'ISO_9001_Certificate.pdf', uploaded: '2025-10-20', expiry: '2028-10-20', status: 'Valid' }]
        },
        { id: 's2', name: 'Apex Office Supplies', contact: 'Mary Jane', email: 'mary@apex.com', phone: '+1 555-5678', categories: ['Office Supplies'], status: 'Active', poValue: 1200.5, taxId: 'GST67890', terms: 'Net 30', bank: '**** **** 5678', address: '45 Paper Rd, Station City',
            kpis: { otd: '98.5%', quality: '100%', po: 1200.5 },
            contacts: [{ type: 'Primary', name: 'Mary Jane', email: 'mary@apex.com', phone: '+1 555-5678' }], poHistory: [{ no: 'PO-2025-0101', date: '2025-10-10', amount: 1200.5, status: 'Closed' }], docs: [{ type: 'ISO 27001', file: 'Apex_ISO27001.pdf', uploaded: '2025-09-15', expiry: '2026-09-14', status: 'Valid' }]
        },
        { id: 's3', name: 'Techtronics Inc.', contact: 'Robert Chen', email: 'robert.c@techtronics.io', phone: '+65 555-9012', categories: ['Electronics', 'Services (e.g., Maint.)'], status: 'Pending Review', poValue: 8300, taxId: 'SG-TAX-55', terms: 'Net 30', bank: '**** **** 9012', address: '8 Circuit Ave, SG',
            kpis: { otd: '92.0%', quality: '98%', po: 8300 },
            contacts: [{ type: 'Primary', name: 'Robert Chen', email: 'robert.c@techtronics.io', phone: '+65 555-9012' }], poHistory: [{ no: 'PO-2025-0111', date: '2025-10-18', amount: 8300, status: 'Open' }], docs: [{ type: 'Contract', file: 'Techtronics_Rate_2025.pdf', uploaded: '2025-10-28', expiry: '2026-10-27', status: 'Under Review' }]
        },
        { id: 's4', name: 'National Polymers', contact: 'Sunita Rao', email: 's.rao@natpol.in', phone: '+91 555-3456', categories: ['Raw Material - Polymer'], status: 'On Hold', poValue: 22000, taxId: 'GSTIN98765', terms: 'Net 30', bank: '**** **** 3456', address: '22 Poly Park, IN',
            kpis: { otd: '75.4%', quality: '90%', po: 22000 },
            contacts: [{ type: 'Primary', name: 'Sunita Rao', email: 's.rao@natpol.in', phone: '+91 555-3456' }], poHistory: [{ no: 'PO-2025-0130', date: '2025-10-25', amount: 22000, status: 'Partial' }], docs: [{ type: 'Insurance', file: 'NatPol_Insurance.pdf', uploaded: '2025-08-01', expiry: '2025-12-01', status: 'Expiring' }]
        }
    ],
    pending: [
        { name: 'Techtronics Inc.', contact: 'Robert Chen', email: 'robert.c@techtronics.io', cats: 'Electronics, Services', submitted: '2025-10-28' }
    ],
    catalog: [
        { supplier: 'Global Steel Ltd.', item: 'Hot Rolled Coil HR-101', uom: 'MT', price: 720, vf: '2025-10-01', vt: '2026-09-30', alt: 'HR-101A' },
        { supplier: 'Apex Office Supplies', item: 'A4 Copier Paper 80gsm', uom: 'Ream', price: 4.5, vf: '2025-09-01', vt: '2026-08-31', alt: '' }
    ],
    // Scores, Orders, Quality, Invoices, Docs tables are omitted here but assumed to be mapped in DB object.
    orders: [{po:'PO-2025-0145', supplier:'Global Steel Ltd.', value:15450, status:'Awaiting ACK'}] // Simplified
};

function getSupplierDB() {
    const s = localStorage.getItem(storeKey);
    if (s) return JSON.parse(s);
    localStorage.setItem(storeKey, JSON.stringify(initialData));
    return initialData;
}

function setSupplierDB(data) {
    localStorage.setItem(storeKey, JSON.stringify(data));
}

// Utility to generate a unique supplier ID
export const generateSupplierId = (currentLength) => 's' + (currentLength + 1);

export { getSupplierDB, setSupplierDB };