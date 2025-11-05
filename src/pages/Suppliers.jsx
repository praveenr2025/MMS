// src/pages/Suppliers.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
// The following three imports are now mocked below for self-containment
// import { getSupplierDB, setSupplierDB, generateSupplierId } from '../data/supplierData'; 
// import { fmtMoney, pillColor } from '../utils/formatters'; // Assuming these exist
// Assuming formatters are defined in utils/formatters.js or similar
const fmtMoney = (amount, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: amount % 1 !== 0 ? 2 : 0 }).format(amount);
const pillColor = (status) => {
    switch (status) {
        case 'Active': return 'ok';
        case 'Pending Review': return 'warn';
        case 'On Hold': return 'bad';
        case 'Open': return 'blue';
        case 'Received': return 'ok';
        case 'Closed': return 'gray';
        case 'Partial': return 'warn';
        case 'Matched': return 'ok';
        case 'Under Review': return 'warn';
        case 'Expiring': return 'bad';
        default: return 'gray';
    }
};

// --- MOCK DATA AND DATA MANAGEMENT (Replacing external imports) ---
const suppliersSeed = [
    { id:'s1', name:'Global Steel Ltd.', contact:'John Smith', email:'sales@globalsteel.com', phone:'+1 555-1234', categories:['Raw Material - Steel'], status:'Active', poValue:25250, taxId:'GST12345', terms:'Net 60', bank:'**** **** 1234', address:'123 Main St, Steel City, USA',
      kpis:{otd:'99.2%', quality:'100%', po:'$25,250.00'},
      contacts:[{type:'Primary',name:'John Smith',email:'sales@globalsteel.com',phone:'+1 555-1234'},{type:'Accounts',name:'Jane Doe',email:'accounts@globalsteel.com',phone:'+1 555-1235'}],
      poHistory:[{no:'PO-2025-0145',date:'2025-10-28',amount:15450,status:'Received'},{no:'PO-2025-0141',date:'2025-10-24',amount:9800,status:'Closed'}],
      docs:[{type:'Contract',file:'Global_Steel_Contract_2025.pdf',uploaded:'2025-10-20',expiry:'2026-10-19',status:'Valid'},{type:'ISO 9001',file:'ISO_9001_Certificate.pdf',uploaded:'2025-10-20',expiry:'2028-10-20',status:'Valid'}]
    },
    { id:'s2', name:'Apex Office Supplies', contact:'Mary Jane', email:'mary@apex.com', phone:'+1 555-5678', categories:['Office Supplies'], status:'Active', poValue:1200.5, taxId:'GST67890', terms:'Net 30', bank:'**** **** 5678', address:'45 Paper Rd, Station City',
      kpis:{otd:'98.5%', quality:'100%', po:'$1,200.50'},
      contacts:[{type:'Primary',name:'Mary Jane',email:'mary@apex.com',phone:'+1 555-5678'}],
      poHistory:[{no:'PO-2025-0101',date:'2025-10-10',amount:1200.5,status:'Closed'}],
      docs:[{type:'ISO 27001',file:'Apex_ISO27001.pdf',uploaded:'2025-09-15',expiry:'2026-09-14',status:'Valid'}]
    },
    { id:'s3', name:'Techtronics Inc.', contact:'Robert Chen', email:'robert.c@techtronics.io', phone:'+65 555-9012', categories:['Electronics','Services (e.g., Maint.)'], status:'Pending Review', poValue:8300, taxId:'SG-TAX-55', terms:'Net 30', bank:'**** **** 9012', address:'8 Circuit Ave, SG',
      kpis:{otd:'92.0%', quality:'98%', po:'$8,300.00'},
      contacts:[{type:'Primary',name:'Robert Chen',email:'robert.c@techtronics.io',phone:'+65 555-9012'}],
      poHistory:[{no:'PO-2025-0111',date:'2025-10-18',amount:8300,status:'Open'}],
      docs:[{type:'Contract',file:'Techtronics_Rate_2025.pdf',uploaded:'2025-10-28',expiry:'2026-10-27',status:'Under Review'}]
    },
    { id:'s4', name:'National Polymers', contact:'Sunita Rao', email:'s.rao@natpol.in', phone:'+91 555-3456', categories:['Raw Material - Polymer'], status:'On Hold', poValue:22000, taxId:'GSTIN98765', terms:'Net 30', bank:'**** **** 3456', address:'22 Poly Park, IN',
      kpis:{otd:'75.4%', quality:'90%', po:'$22,000.00'},
      contacts:[{type:'Primary',name:'Sunita Rao',email:'s.rao@natpol.in',phone:'+91 555-3456'}],
      poHistory:[{no:'PO-2025-0130',date:'2025-10-25',amount:22000,status:'Partial'}],
      docs:[{type:'Insurance',file:'NatPol_Insurance.pdf',uploaded:'2025-08-01',expiry:'2025-12-01',status:'Expiring'}]
    }
];

const pendingSeed = [
    {name:'Fasteners Corp.', contact:'Amy Lee', email:'a.lee@fastcorp.net', cats:'Raw Material - Steel', submitted:'2025-10-20'},
    {name:'Chem Solutions', contact:'Ben Khan', email:'b.khan@chem.co', cats:'Raw Material - Polymer', submitted:'2025-10-22'}
];

const catalogSeed = [
    {supplier:'Global Steel Ltd.', item:'Hot Rolled Coil HR-101', uom:'MT', price:720, vf:'2025-10-01', vt:'2026-09-30', alt:'HR-101A'},
    {supplier:'Apex Office Supplies', item:'A4 Copier Paper 80gsm', uom:'Ream', price:4.5, vf:'2025-09-01', vt:'2026-08-31', alt:''},
    {supplier:'National Polymers', item:'HDPE Resin Grade P-300', uom:'KG', price:1.2, vf:'2025-11-01', vt:'2026-10-31', alt:'P-300B'},
    {supplier:'Techtronics Inc.', item:'Maintenance Service Contract', uom:'Month', price:500, vf:'2025-10-01', vt:'2025-12-31', alt:''}
];

const ordersSeed = [
    {po:'PO-2025-0145', supplier:'Global Steel Ltd.', date:'2025-10-28', value:15450, status:'Received'},
    {po:'PO-2025-0146', supplier:'Techtronics Inc.', date:'2025-10-29', value:3200, status:'Open'},
    {po:'PO-2025-0147', supplier:'National Polymers', date:'2025-10-29', value:18000, status:'Partial'},
    {po:'PO-2025-0148', supplier:'Apex Office Supplies', date:'2025-10-30', value:500, status:'Awaiting ACK'}
];

const shipmentsSeed = [
    {asn:'ASN-2025-0007', po:'PO-2025-0145', supplier:'Global Steel Ltd.', carrier:'DHL', tracking:'DH123456', eta:'2025-11-04'},
    {asn:'ASN-2025-0008', po:'PO-2025-0146', supplier:'Techtronics Inc.', carrier:'FedEx', tracking:'FD987654', eta:'2025-11-05'},
    {asn:'ASN-2025-0009', po:'PO-2025-0147', supplier:'National Polymers', carrier:'Trucking Co', tracking:'TRK00123', eta:'2025-11-10'}
];

const qualitySeed = [
    {ncr:'NCR-2025-002', supplier:'National Polymers', reason:'Spec deviation (MFI)', owner:'Quality', status:'Open'},
    {ncr:'NCR-2025-003', supplier:'Techtronics Inc.', reason:'Missing COC', owner:'Buyer', status:'CAPA Submitted'},
    {ncr:'NCR-2025-004', supplier:'Global Steel Ltd.', reason:'Late Delivery', owner:'Logistics', status:'Closed'}
];

const invoicesSeed = [
    {inv:'INV-2025-771', supplier:'Global Steel Ltd.', po:'PO-2025-0145', amount:15450, match:'Matched'},
    {inv:'INV-2025-812', supplier:'National Polymers', po:'PO-2025-0130', amount:9000, match:'On Hold (Qty Variance)'},
    {inv:'INV-2025-820', supplier:'Techtronics Inc.', po:'PO-2025-0146', amount:3200, match:'Matched'}
];

const docsSeed = [
    {supplier:'Global Steel Ltd.', type:'Contract', file:'Global_Steel_Contract_2025.pdf', uploaded:'2025-10-20', expiry:'2026-10-19', status:'Valid'},
    {supplier:'Apex Office Supplies', type:'ISO 27001', file:'Apex_ISO27001.pdf', uploaded:'2025-09-15', expiry:'2026-09-14', status:'Valid'},
    {supplier:'National Polymers', type:'Insurance', file:'NatPol_Insurance.pdf', uploaded:'2025-08-01', expiry:'2025-12-01', status:'Expiring'},
    {supplier:'Techtronics Inc.', type:'NDA', file:'TT_NDA_2025.pdf', uploaded:'2025-05-01', expiry:'2027-05-01', status:'Valid'}
];

const scorecardsSeed = [
    {supplier:'Global Steel Ltd.', otd:'99.2%', quality:'100%', ltVar:'Low', contract:'99%', esg:'A+'},
    {supplier:'Apex Office Supplies', otd:'98.5%', quality:'100%', ltVar:'Low', contract:'97%', esg:'A'},
    {supplier:'Techtronics Inc.', otd:'92.0%', quality:'98%', ltVar:'Med', contract:'95%', esg:'B'},
    {supplier:'National Polymers', otd:'75.4%', quality:'90%', ltVar:'High', contract:'85%', esg:'C'}
];


// Local Storage Mock functions
const storeKey = 'mms_suppliers_page_v2';
function getStore(){
  const s = localStorage.getItem(storeKey);
  const initialData = {
    suppliers:[...suppliersSeed],
    pending:[...pendingSeed],
    catalog:[...catalogSeed],
    orders:[...ordersSeed],
    shipments:[...shipmentsSeed],
    quality:[...qualitySeed],
    invoices:[...invoicesSeed],
    docs:[...docsSeed],
    scorecards:[...scorecardsSeed]
  };
  return s ? JSON.parse(s) : initialData;
}
function setStore(data){ localStorage.setItem(storeKey, JSON.stringify(data)); }
const generateSupplierId = (length) => `s${length + 1}`; // Simple mock ID generation

const getSupplierDB = getStore;
const setSupplierDB = setStore;
// --- END MOCK DATA ---


// --- 1. Supplier Form/View Modals (Defined within this file for completeness) ---
const TABS = [
    { id: 'tab-dashboard', label: 'Supplier Dashboard' },
    { id: 'tab-all-suppliers', label: 'All Suppliers' },
    { id: 'tab-onboarding', label: 'Onboarding' },
    { id: 'tab-catalog', label: 'Catalog Manager' },
    { id: 'tab-orders-asn', label: 'Orders & ASNs' },
    { id: 'tab-shipments', label: 'Shipments' },
    { id: 'tab-quality', label: 'Quality & NCR' },
    { id: 'tab-invoices', label: 'Invoices & Payments' },
    { id: 'tab-compliance', label: 'Compliance & Docs' },
    { id: 'tab-scorecards', label: 'Scorecards' },
    { id: 'tab-playbook', label: 'Supplier Playbook' },
];
// Reusable Sub-Component for Add/Edit Form
function SupplierForm({ initialData, mode, onSubmit, onClear, onClose }) {
    const [formData, setFormData] = useState(initialData || {});

    useEffect(() => {
        // Reset/Load form data based on mode change
        setFormData(initialData || { name: '', status: 'Pending Review', categories: [] });
    }, [initialData, mode]);

    const isEdit = !!formData.id;
    // const title = isEdit ? `Edit Supplier: ${formData.name}` : 'Add New Supplier'; // Not used, but kept for context

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        const field = id.replace('supplier-', '');
        
        if (type === 'checkbox') {
            const currentCats = formData.categories || [];
            const updatedCats = checked
                ? [...currentCats, value]
                : currentCats.filter(c => c !== value);
            setFormData(prev => ({ ...prev, categories: updatedCats }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            alert('Name and Email are required.');
            return;
        }
        
        onSubmit(formData, mode);
        onClose();
    };

    return (
        <form id="supplier-form" onSubmit={handleFormSubmit}>
            <input type="hidden" id="supplier-id" value={formData.id || ''} />
            <div className="modal-body">
                {/* Form Sections replicated from HTML structure */}
                <div className="form-section">
                    <h3>Basic Information & Status</h3>
                    <div className="detail-grid">
                        <div className="form-group"><label>Supplier Name</label><input type="text" id="supplier-name" value={formData.name || ''} onChange={handleChange} required /></div>
                        <div className="form-group"><label>Status</label>
                            <select id="supplier-status" value={formData.status || 'Pending Review'} onChange={handleChange}><option>Pending Review</option><option>Active</option><option>On Hold</option></select></div>
                    </div>
                    <div className="form-group"><label>Address</label><textarea id="supplier-address" rows="3" value={formData.address || ''} onChange={handleChange}></textarea></div>
                </div>
                
                <div className="form-section">
                    <h3>Primary Contact</h3>
                    <div className="grid-3" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="form-group"><label>Contact Name</label><input type="text" id="supplier-contact" value={formData.contact || ''} onChange={handleChange} /></div>
                        <div className="form-group"><label>Email</label><input type="email" id="supplier-email" value={formData.email || ''} onChange={handleChange} /></div>
                        <div className="form-group"><label>Phone</label><input type="tel" id="supplier-phone" value={formData.phone || ''} onChange={handleChange} /></div>
                    </div>
                </div>
                
                <div className="form-section">
                    <h3>Supplier Categories</h3>
                    <div className="checkbox-group" id="checkbox-categories">
                        {['Raw Material - Steel', 'Raw Material - Polymer', 'Office Supplies', 'Electronics', 'Services (e.g., Maint.)'].map(cat => (
                            <label key={cat}><input type="checkbox" value={cat} checked={formData.categories?.includes(cat) || false} onChange={handleChange} /> {cat}</label>
                        ))}
                    </div>
                </div>
                
            </div>
            <div className="modal-footer">
                <button type="button" className="btn ghost" onClick={() => onClear({ name: '', status: 'Pending Review', categories: [] })}>Clear Form</button>
                <button type="submit" className="btn">{isEdit ? 'Save Changes' : 'Submit for Approval'}</button>
            </div>
        </form>
    );
}

// Reusable Component for Viewing Supplier Details (Multi-Tabbed)
function ViewSupplierModal({ isOpen, onClose, supplier, onEdit }) {
    const [activeTab, setActiveTab] = useState('modal-tab-details');
    if (!supplier) return null;
    
    // Helper to render PO history for the modal tab
    const ViewPOHistory = () => (
        <div className="card">
            <div className="table-container">
                <table className="table" style={{ border: 0 }} id="view-po-table">
                    <thead><tr><th>PO Number</th><th>Date</th><th style={{ textAlign: 'right' }}>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                        {supplier.poHistory?.map((p, i) => (
                            <tr key={i}><td><strong>{p.no}</strong></td><td>{p.date}</td><td style={{ textAlign: 'right' }}>{fmtMoney(p.amount, 'USD')}</td><td><span className={`pill ${pillColor(p.status)}`}>{p.status}</span></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    // Helper to render Contacts
    const ViewContacts = () => (
        <div className="detail-grid" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
            {supplier.contacts?.map((c, i) => (
                <div className="card p-3" key={i}>
                    <h4>{c.type} Contact</h4>
                    <div className="detail-item"><div className="label">Name</div><div className="value">{c.name}</div></div>
                    <div className="detail-item"><div className="label">Email</div><div className="value">{c.email}</div></div>
                    <div className="detail-item"><div className="label">Phone</div><div className="value">{c.phone}</div></div>
                </div>
            ))}
        </div>
    );
    
    // Helper to render Performance
    const ViewPerformance = () => (
        <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="kpi-card"><div className="value">{supplier.kpis?.otd}</div><div className="label">On-Time Delivery</div></div>
            <div className="kpi-card"><div className="value">{supplier.kpis?.quality}</div><div className="label">Quality Score</div></div>
            <div className="kpi-card"><div className="value">{supplier.kpis?.po}</div><div className="label">YTD PO Value</div></div>
        </div>
    );
    
    // Helper to render Documents
    const ViewDocuments = () => (
        <div className="card">
            <div className="table-container">
                <table className="table" style={{ border: 0 }} id="view-docs-table">
                    <thead><tr><th>Type</th><th>File</th><th>Expiry Date</th><th>Status</th></tr></thead>
                    <tbody>
                        {supplier.docs?.map((d, i) => (
                            <tr key={i}><td><strong>{d.type}</strong></td><td><a href="#" style={{ textDecoration: 'underline' }}>{d.file}</a></td><td>{d.expiry}</td><td><span className={`pill ${pillColor(d.status)}`}>{d.status}</span></td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className={`modal ${isOpen ? 'open' : ''}`} id="modal-view-supplier-details">
            <div className="modal-content">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }}>View Supplier: {supplier.name}</h3>
                    <button className="btn ghost" onClick={onClose}><svg style={{ width: 24, height: 24 }}><use href="#icon-close" /></svg></button>
                </div>
                
                <div className="modal-tab-nav">
                    {['details', 'contacts', 'po', 'performance', 'documents'].map(tab => (
                        <a key={tab} href="#" className={activeTab === `modal-tab-${tab}` ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab(`modal-tab-${tab}`); }}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </a>
                    ))}
                </div>

                <div className="modal-body">
                    {activeTab === 'modal-tab-details' && (
                        <div className="modal-tab-pane active" id="modal-tab-details">
                            <div className="detail-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {/* Basic Info */}
                                <div>
                                    <h4>Basic Information</h4>
                                    <div className="detail-item"><div className="label">Status</div><div className="value"><span className={`pill ${pillColor(supplier.status)}`}>{supplier.status}</span></div></div>
                                    <div className="detail-item"><div className="label">Categories</div><div className="value">{supplier.categories.join(', ')}</div></div>
                                    <div className="detail-item"><div className="label">Address</div><div className="value">{supplier.address}</div></div>
                                </div>
                                {/* Financial Info */}
                                <div>
                                    <h4>Financial Information</h4>
                                    <div className="detail-item"><div className="label">Tax ID</div><div className="value">{supplier.taxId || '-'}</div></div>
                                    <div className="detail-item"><div className="label">Payment Terms</div><div className="value">{supplier.terms || '-'}</div></div>
                                    <div className="detail-item"><div className="label">Bank Account</div><div className="value">{supplier.bank || '-'}</div></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'modal-tab-contacts' && <div className="modal-tab-pane active" id="modal-tab-contacts"><ViewContacts /></div>}
                    {activeTab === 'modal-tab-po' && <div className="modal-tab-pane active" id="modal-tab-po"><ViewPOHistory /></div>}
                    {activeTab === 'modal-tab-performance' && <div className="modal-tab-pane active" id="modal-tab-performance"><ViewPerformance /></div>}
                    {activeTab === 'modal-tab-documents' && <div className="modal-tab-pane active" id="modal-tab-documents"><ViewDocuments /></div>}
                </div>

                <div className="modal-footer">
                    <button className="btn ghost" onClick={onClose}>Close</button>
                    <button className="btn" onClick={onEdit}>Edit This Supplier</button>
                </div>
            </div>
        </div>
    );
}

// --- 2. Main Suppliers Component ---
function Suppliers() {
    const [db, setDb] = useState(getSupplierDB());
    const [activeTab, setActiveTab] = useState('tab-dashboard');
    const [filters, setFilters] = useState({ search: '', status: '', category: '' });
    const [modalState, setModalState] = useState({ isFormOpen: false, isViewOpen: false, formMode: 'add', viewData: null, editData: null });

    const refreshData = () => setDb(getSupplierDB());
    
    useEffect(() => {
        // Update local storage on every db change
        setSupplierDB(db);
    }, [db]);


    // --- Data Management Handlers ---
    const handleSaveSupplier = (data, mode) => {
        const newSuppliers = [...db.suppliers];
        
        if (mode === 'edit') {
            const index = newSuppliers.findIndex(s => s.id === data.id);
            if (index !== -1) newSuppliers[index] = data;
        } else {
            // New supplier always starts as Pending Review, and gets mock kpis/history
            const newId = generateSupplierId(newSuppliers.length);
            const newSupplierData = { 
                ...data, 
                id: newId, 
                status: 'Pending Review',
                poValue: 0,
                kpis: { otd: 'N/A', quality: 'N/A', po: '$0.00' },
                contacts: [{ type: 'Primary', name: data.contact, email: data.email, phone: data.phone }],
                poHistory: [],
                docs: []
            };
            newSuppliers.push(newSupplierData); 
            // Also remove from pending list if it was approved/edited
            const updatedPending = db.pending.filter(p => p.email !== data.email);
            setSupplierDB({ ...db, suppliers: newSuppliers, pending: updatedPending });
        }
        
        refreshData();
    };

    const handleOpenForm = (mode = 'add', supplier = null) => {
        setModalState({ isFormOpen: true, formMode: mode, viewData: null, editData: supplier });
    };

    const handleViewSupplier = (supplier) => {
        setModalState({ isFormOpen: false, isViewOpen: true, formMode: 'view', viewData: supplier, editData: null });
    };

    const handleEditFromView = () => {
        setModalState(prev => ({ ...prev, isViewOpen: false, isFormOpen: true, formMode: 'edit', editData: prev.viewData }));
    };
    
    // --- Filtered List (T-All Suppliers) ---
    const filteredSuppliers = useMemo(() => {
        let list = db.suppliers;
        if (filters.search) { 
            const searchLower = filters.search.toLowerCase();
            list = list.filter(s => 
                s.name.toLowerCase().includes(searchLower) || 
                s.contact.toLowerCase().includes(searchLower) ||
                s.email.toLowerCase().includes(searchLower)
            );
        }
        if (filters.status) { 
            list = list.filter(s => s.status === filters.status);
        }
        return list;
    }, [db.suppliers, filters]);

    // --- Tab Renderers ---
    const RenderDashboard = () => {
        const activeCount = db.suppliers.filter(s => s.status === 'Active').length;
        const awaitingAckCount = db.orders.filter(o => o.status === 'Awaiting ACK').length;
        const openNcrCount = db.quality.filter(q => q.status === 'Open' || q.status === 'CAPA Submitted').length;
        const invoiceHoldCount = db.invoices.filter(i => i.match.includes('On Hold')).length;

        const expiringDocs = db.docs.filter(d => d.status === 'Expiring');
        
        // Mock activity feed
        const activityFeed = [
            { type: 'Update', text: 'Global Steel Ltd. updated ISO 9001 certificate.', date: '3m ago' },
            { type: 'Alert', text: 'National Polymers insurance expiring soon.', date: '1h ago' },
            { type: 'New', text: 'Fasteners Corp. submitted new onboarding form.', date: '2d ago' },
            { type: 'PO', text: 'PO-2025-0148 issued to Apex Office Supplies.', date: '3d ago' },
        ];
        

        return (
            <section className="tab-pane active" id="tab-dashboard">
                <div className="split">
                    <div>
                        <div className="kpi-grid">
                            <div className="kpi-card"><div className="kpi-card-icon ok"><svg><use href="#icon-suppliers"/></svg></div><div className="value">{activeCount}</div><div className="label">Active Suppliers</div><a href="#" className="link" onClick={() => setActiveTab('tab-all-suppliers')}>View list →</a></div>
                            <div className="kpi-card"><div className="kpi-card-icon warn"><svg><use href="#icon-po"/></svg></div><div className="value">{awaitingAckCount}</div><div className="label">Open POs Awaiting ACK</div><a href="#" className="link" onClick={() => setActiveTab('tab-orders-asn')}>Review →</a></div>
                            <div className="kpi-card"><div className="kpi-card-icon bad"><svg><use href="#icon-quality"/></svg></div><div className="value">{openNcrCount}</div><div className="label">Open NCRs / CAPA</div><a href="#" className="link" onClick={() => setActiveTab('tab-quality')}>Resolve →</a></div>
                            <div className="kpi-card"><div className="kpi-card-icon blue"><svg><use href="#icon-invoice"/></svg></div><div className="value">{invoiceHoldCount}</div><div className="label">Invoices On Hold (3-way)</div><a href="#" className="link" onClick={() => setActiveTab('tab-invoices')}>Fix now →</a></div>
                        </div>
                        {/* Activity Feed */}
                        <div className="card" style={{ margin: '20px 0' }}>
                            <div style={{ padding: '16px' }}><h3 style={{ margin: 0 }}>Recent Activity</h3></div>
                            <ul className="activity-feed">
                                {activityFeed.map((a, i) => (
                                    <li key={i}><strong>[{a.type}]</strong> {a.text} <span className="date">{a.date}</span></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Alerts Aside */}
                    <aside className="card" style={{ flexBasis: '300px' }}>
                        <div style={{ padding: '16px' }}><h3 style={{ margin: 0 }}>Expiries & Alerts</h3></div>
                        <ul className="alert-list" style={{ padding: '16px' }}>
                            <li className="alert-item bad"><strong>{db.pending.length}</strong> Pending Supplier Approvals</li>
                            {expiringDocs.map((d, i) => (
                                <li className="alert-item warn" key={i}>**{d.supplier}**: {d.type} expiring on {d.expiry}.</li>
                            ))}
                        </ul>
                    </aside>
                </div>
            </section>
        );
    };

    const RenderAllSuppliers = () => (
        <section className="tab-pane active" id="tab-all-suppliers">
            <div className="table-controls">
                <div className="table-filters">
                    <input type="text" className="search-bar" placeholder="Search name, contact, email…" onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                    <select id="filter-status" onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">Status: All</option><option>Active</option><option>Pending Review</option><option>On Hold</option></select>
                    <button className="btn ghost" style={{ padding: '8px 12px' }} onClick={refreshData}>Filter</button>
                </div>
            </div>
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Supplier Name</th><th>Contact Person</th><th>Email / Phone</th><th>Categories</th><th>Status</th><th style={{ textAlign: 'right' }}>Total PO Value</th><th className="actions-cell">Actions</th></tr></thead>
                        <tbody>
                            {filteredSuppliers.map(s => (
                                <tr key={s.id}>
                                    <td><strong>{s.name}</strong></td><td>{s.contact}</td>
                                    <td>{s.email}<br /><span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{s.phone}</span></td>
                                    <td>{s.categories.map(c => <span key={c} className={`pill ${c.includes('Raw') ? 'blue' : ''}`}>{c}</span>)}</td>
                                    <td><span className={`pill ${pillColor(s.status)}`}>{s.status}</span></td>
                                    <td style={{ textAlign: 'right' }}>{fmtMoney(s.poValue, 'USD')}</td>
                                    <td className="actions-cell">
                                        <button className="btn ghost" style={{ padding: '5px 10px' }} onClick={() => handleViewSupplier(s)}>View</button>
                                        <button className="btn ghost" style={{ padding: '5px 10px' }} onClick={() => handleOpenForm('edit', s)}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );

    const RenderOnboarding = () => (
        <section className="tab-pane active" id="tab-onboarding">
            <div className="split">
                <div className="card" style={{ flex: '1' }}>
                    <div className="modal-head"><h3 style={{ margin: 0 }}>New Supplier Onboarding</h3></div>
                    <p>Use the Add New Supplier button above, or click on an entry in the Pending Approvals table to start the review process.</p>
                    <button className="btn" onClick={() => handleOpenForm('add')}>Start New Onboarding</button>
                </div>
                <div className="card" style={{ flex: '1.5' }}>
                    <div className="modal-head"><h3 style={{ margin: 0 }}>Pending Approvals ({db.pending.length})</h3></div>
                    <div className="table-container">
                        <table className="table">
                            <thead><tr><th>Name</th><th>Contact</th><th>Categories</th><th>Submitted</th><th className="actions-cell">Action</th></tr></thead>
                            <tbody>
                                {db.pending.map((p, i) => (
                                    <tr key={i}>
                                        <td><strong>{p.name}</strong></td>
                                        <td>{p.contact}<br /><span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{p.email}</span></td>
                                        <td>{p.cats}</td>
                                        <td>{p.submitted}</td>
                                        <td className="actions-cell">
                                            <button className="btn warn" style={{ padding: '5px 10px' }} onClick={() => {
                                                const mockSupplier = suppliersSeed.find(s => s.name === p.name) || { 
                                                    id: generateSupplierId(db.suppliers.length), name: p.name, contact: p.contact, email: p.email, phone: '', categories: p.cats.split(', '), 
                                                    status: 'Pending Review', poValue: 0 
                                                };
                                                handleOpenForm('edit', mockSupplier);
                                            }}>Approve/Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );

    const RenderForm = () => (
        <section className="tab-pane active" id="tab-add-supplier">
            <div className="card">
                <SupplierForm
                    initialData={modalState.editData || {}}
                    mode={modalState.formMode}
                    onSubmit={handleSaveSupplier}
                    onClear={(data) => setModalState(prev => ({ ...prev, editData: data }))}
                    onClose={() => setActiveTab('tab-all-suppliers')} // Redirect after form close/submit
                />
            </div>
        </section>
    );
    
    // --- New Renderers for Placeholder Tabs (using mock data) ---
    const RenderCatalog = () => (
        <section className="tab-pane active" id="tab-catalog">
            <div className="card">
                <h2>Catalog Manager</h2>
                <p>Catalog items currently maintained by suppliers in the system.</p>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Supplier</th><th>Item / Service</th><th>UOM</th><th style={{ textAlign: 'right' }}>Price</th><th>Valid From</th><th>Valid To</th></tr></thead>
                        <tbody>
                            {db.catalog.map((c, i) => (
                                <tr key={i}>
                                    <td><strong>{c.supplier}</strong></td><td>{c.item}</td><td>{c.uom}</td>
                                    <td style={{ textAlign: 'right' }}>{fmtMoney(c.price, 'USD')}</td><td>{c.vf}</td><td>{c.vt}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );

    const RenderOrdersAsn = () => {
        const activeOrders = db.orders.filter(o => o.status !== 'Received' && o.status !== 'Closed');
        
        return (
            <section className="tab-pane active" id="tab-orders-asn">
                <div className="card">
                    <h2>Orders & ASNs (Active POs)</h2>
                    <div className="table-container" style={{ marginBottom: '20px' }}>
                        <table className="table">
                            <thead><tr><th>PO Number</th><th>Supplier</th><th>Date</th><th style={{ textAlign: 'right' }}>Value</th><th>Status</th></tr></thead>
                            <tbody>
                                {activeOrders.map((o, i) => (
                                    <tr key={i}>
                                        <td><strong>{o.po}</strong></td><td>{o.supplier}</td><td>{o.date}</td>
                                        <td style={{ textAlign: 'right' }}>{fmtMoney(o.value, 'USD')}</td><td><span className={`pill ${pillColor(o.status)}`}>{o.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card">
                    <h2>Recent ASNs (Shipments)</h2>
                    <div className="table-container">
                        <table className="table">
                            <thead><tr><th>ASN</th><th>PO</th><th>Supplier</th><th>Carrier</th><th>Tracking</th><th>ETA</th></tr></thead>
                            <tbody>
                                {db.shipments.map((s, i) => (
                                    <tr key={i}>
                                        <td><strong>{s.asn}</strong></td><td>{s.po}</td><td>{s.supplier}</td>
                                        <td>{s.carrier}</td><td>{s.tracking}</td><td>{s.eta}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        );
    };
    
    const RenderQuality = () => (
        <section className="tab-pane active" id="tab-quality">
            <div className="card">
                <h2>Quality & NCR (Non-Conformance Reports)</h2>
                <p>Open and recent quality issues requiring attention.</p>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>NCR ID</th><th>Supplier</th><th>Reason</th><th>Owner</th><th>Status</th><th className="actions-cell">Action</th></tr></thead>
                        <tbody>
                            {db.quality.map((q, i) => (
                                <tr key={i}>
                                    <td><strong>{q.ncr}</strong></td><td>{q.supplier}</td><td>{q.reason}</td>
                                    <td>{q.owner}</td><td><span className={`pill ${pillColor(q.status)}`}>{q.status}</span></td>
                                    <td className="actions-cell"><button className="btn ghost" style={{ padding: '5px 10px' }}>View Detail</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );

    const RenderInvoices = () => (
        <section className="tab-pane active" id="tab-invoices">
            <div className="card">
                <h2>Invoices & Payments (Pending 3-Way Match)</h2>
                <p>Invoices awaiting approval or requiring intervention.</p>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Invoice ID</th><th>Supplier</th><th>PO Number</th><th style={{ textAlign: 'right' }}>Amount</th><th>3-Way Match Status</th></tr></thead>
                        <tbody>
                            {db.invoices.map((inv, i) => (
                                <tr key={i}>
                                    <td><strong>{inv.inv}</strong></td><td>{inv.supplier}</td><td>{inv.po}</td>
                                    <td style={{ textAlign: 'right' }}>{fmtMoney(inv.amount, 'USD')}</td><td><span className={`pill ${pillColor(inv.match.includes('On Hold') ? 'bad' : 'ok')}`}>{inv.match}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );

    const RenderCompliance = () => (
        <section className="tab-pane active" id="tab-compliance">
            <div className="card">
                <h2>Compliance & Documents</h2>
                <p>Review of critical supplier documents and their expiry dates.</p>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Supplier</th><th>Document Type</th><th>File</th><th>Uploaded</th><th>Expiry Date</th><th>Status</th></tr></thead>
                        <tbody>
                            {db.docs.map((d, i) => (
                                <tr key={i}>
                                    <td><strong>{d.supplier}</strong></td><td>{d.type}</td><td><a href="#">{d.file}</a></td>
                                    <td>{d.uploaded}</td><td>{d.expiry}</td><td><span className={`pill ${pillColor(d.status)}`}>{d.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );

    const RenderScorecards = () => (
        <section className="tab-pane active" id="tab-scorecards">
            <div className="card">
                <h2>Supplier Scorecards (Q4 2025)</h2>
                <p>Key Performance Indicators (KPIs) tracked by supplier.</p>
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Supplier</th><th>OTD</th><th>Quality Score</th><th>Lead Time Variance</th><th>Contract Compliance</th><th>ESG Rating</th></tr></thead>
                        <tbody>
                            {db.scorecards.map((s, i) => (
                                <tr key={i}>
                                    <td><strong>{s.supplier}</strong></td><td>{s.otd}</td><td>{s.quality}</td>
                                    <td><span className={`pill ${pillColor(s.ltVar === 'High' ? 'bad' : s.ltVar === 'Med' ? 'warn' : 'ok')}`}>{s.ltVar}</span></td>
                                    <td>{s.contract}</td><td>{s.esg}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );

    const RenderPlaybook = () => (
        <section className="tab-pane active" id="tab-playbook">
            <div className="card p-4">
                <h2>Supplier Playbook & Resources</h2>
                <p>This section would contain links to **onboarding documentation**, **quality manuals**, **code of conduct**, and other **governance materials** for internal use and supplier distribution.</p>
                <ul>
                    <li><Link to="#">Supplier Code of Conduct (PDF)</Link></li>
                    <li><Link to="#">Quality Assurance Manual v3.1</Link></li>
                    <li><Link to="#">Payment Terms and Invoicing Guide</Link></li>
                </ul>
            </div>
        </section>
    );


    return (
        <div className="page-content">
            <div className="page-header">
                <h1>Supplier Management</h1>
                <button className="btn" onClick={() => handleOpenForm('add')}>+ New Supplier</button>
            </div>
            
            <nav className="tab-nav">
                {TABS.map(tab => (
                    <a key={tab.id} href="#" className={activeTab === tab.id ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab(tab.id); }}>{tab.label}</a>
                ))}
                <a href="#" className={activeTab === 'tab-add-supplier' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('tab-add-supplier'); }} style={{ display: 'none' }}>Add/Edit Supplier</a>
            </nav>

            {/* Content Sections */}
            {activeTab === 'tab-dashboard' && <RenderDashboard />}
            {activeTab === 'tab-all-suppliers' && <RenderAllSuppliers />}
            {activeTab === 'tab-onboarding' && <RenderOnboarding />}
            {activeTab === 'tab-add-supplier' && <RenderForm />}
            
            {/* RENDERERS FOR NEWLY POPULATED TABS */}
            {activeTab === 'tab-catalog' && <RenderCatalog />}
            {activeTab === 'tab-orders-asn' && <RenderOrdersAsn />}
            {activeTab === 'tab-shipments' && <RenderOrdersAsn />} {/* Renders same data set for simplicity */}
            {activeTab === 'tab-quality' && <RenderQuality />}
            {activeTab === 'tab-invoices' && <RenderInvoices />}
            {activeTab === 'tab-compliance' && <RenderCompliance />}
            {activeTab === 'tab-scorecards' && <RenderScorecards />}
            {activeTab === 'tab-playbook' && <RenderPlaybook />}
            
            {/* Placeholder sections for old tabs - REMOVED AS THEY ARE NOW IMPLEMENTED */}
            {/* The original map function is replaced by the specific components above */}


            {/* --- Modals (Rendered outside tab content but inside main component) --- */}
            {modalState.isViewOpen && (
                <ViewSupplierModal
                    isOpen={modalState.isViewOpen}
                    onClose={() => setModalState({ isViewOpen: false })}
                    supplier={modalState.viewData}
                    onEdit={handleEditFromView}
                />
            )}
        </div>
    );
}

export default Suppliers;
