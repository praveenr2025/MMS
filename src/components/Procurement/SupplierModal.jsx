// src/components/Procurement/SupplierModal.jsx

import React, { useState, useEffect } from 'react';
import { generateSupplierId } from '../../data/supplierData';

// Reusable Sub-Component for Add/Edit Form
function SupplierForm({ initialData, mode, onSubmit, onClear }) {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        // Reset/Load form data based on mode change
        setFormData(initialData || {});
    }, [initialData, mode]);

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
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            alert('Name and Email are required.');
            return;
        }
        
        // Finalize data structure before passing to parent
        const finalData = {
            ...formData,
            id: formData.id || generateSupplierId(99), // Mock ID gen
            status: formData.status || 'Pending Review',
            // Simple mapping for primary contact field integrity
            contact: formData.contact || '', 
            poValue: formData.poValue || 0
        };
        onSubmit(finalData, mode);
    };

    return (
        <form id="supplier-form" onSubmit={handleSubmit}>
            <input type="hidden" id="supplier-id" value={formData.id || ''} />
            <div className="modal-body">
                <div className="form-section">
                    <h3>Basic Information & Status</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                        <div className="form-group"><label>Supplier Name</label><input type="text" id="supplier-name" value={formData.name || ''} onChange={handleChange} required /></div>
                        <div className="form-group"><label>Status</label>
                            <select id="supplier-status" value={formData.status || 'Pending Review'} onChange={handleChange}><option>Pending Review</option><option>Active</option><option>On Hold</option></select></div>
                    </div>
                    <div className="form-group"><label>Address</label><textarea id="supplier-address" rows="3" value={formData.address || ''} onChange={handleChange}></textarea></div>
                </div>
                
                {/* Primary Contact */}
                <div className="form-section">
                    <h3>Primary Contact</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="form-group"><label>Contact Name</label><input type="text" id="supplier-contact" value={formData.contact || ''} onChange={handleChange} /></div>
                        <div className="form-group"><label>Email</label><input type="email" id="supplier-email" value={formData.email || ''} onChange={handleChange} /></div>
                        <div className="form-group"><label>Phone</label><input type="tel" id="supplier-phone" value={formData.phone || ''} onChange={handleChange} /></div>
                    </div>
                </div>
                
                {/* Categories */}
                <div className="form-section">
                    <h3>Supplier Categories</h3>
                    <div className="checkbox-group" id="checkbox-categories">
                        {['Raw Material - Steel', 'Raw Material - Polymer', 'Office Supplies', 'Electronics', 'Services (e.g., Maint.)'].map(cat => (
                            <label key={cat}><input type="checkbox" value={cat} checked={formData.categories?.includes(cat) || false} onChange={handleChange} /> {cat}</label>
                        ))}
                    </div>
                </div>
                
                {/* Footer Actions */}
            </div>
            <div className="modal-footer">
                <button type="button" className="btn ghost" onClick={onClear}>Clear Form</button>
                <button type="submit" className="btn" id="supplier-form-submit-btn">{mode === 'edit' ? 'Save Changes' : 'Submit for Approval'}</button>
            </div>
        </form>
    );
}

// Reusable Component for Viewing Supplier Details (Multi-Tabbed)
function ViewSupplierModal({ isOpen, onClose, supplier, onEdit }) {
    const [activeTab, setActiveTab] = useState('modal-tab-details');
    if (!supplier) return null;

    const ViewDetails = () => (
        <div className="detail-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
                <h4>Basic Information</h4>
                <div className="detail-item"><div className="label">Status</div><div className="value"><span className={`pill ${pillColor(supplier.status)}`}>{supplier.status}</span></div></div>
                <div className="detail-item"><div className="label">Address</div><div className="value" style={{ fontSize: '1rem', fontWeight: 500 }}>{supplier.address || '-'}</div></div>
                <div className="detail-item"><div className="label">Categories</div><div className="value" style={{ fontSize: '1rem', fontWeight: 500 }}>{supplier.categories?.map(c => <span key={c} className={`pill ${c.includes('Raw') ? 'blue' : ''}`}>{c}</span>)}</div></div>
            </div>
            <div>
                <h4>Financial Information</h4>
                <div className="detail-item"><div className="label">Tax ID</div><div className="value">{supplier.taxId || '-'}</div></div>
                <div className="detail-item"><div className="label">Payment Terms</div><div className="value">{supplier.terms || '-'}</div></div>
                <div className="detail-item"><div className="label">Bank Account</div><div className="value">{supplier.bank || '-'}</div></div>
            </div>
        </div>
    );
    
    const ViewContacts = () => (
        <div className="card">
            <div className="table-container">
                <table className="table" style={{ border: 0 }}>
                    <thead><tr><th>Type</th><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
                    <tbody>
                        {supplier.contacts.map((c, i) => <tr key={i}><td>{c.type}</td><td><strong>{c.name}</strong></td><td>{c.email}</td><td>{c.phone || '-'}</td></tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const ViewPOHistory = () => (
        <div className="card">
            <div className="table-container">
                <table className="table" style={{ border: 0 }}>
                    <thead><tr><th>PO Number</th><th>Date</th><th style={{ textAlign: 'right' }}>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                        {supplier.poHistory.map((p, i) => (
                            <tr key={i}><td><strong>{p.no}</strong></td><td>{p.date}</td><td style={{ textAlign: 'right' }}>{fmtMoney(p.amount, 'USD')}</td><td><span className={`pill ${pillColor(p.status)}`}>{p.status}</span></td></tr>
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
                    <button className="btn ghost" style={{ padding: 4, borderColor: 'transparent' }} onClick={onClose}><svg style={{ width: 24, height: 24 }}><use href="#icon-close" /></svg></button>
                </div>
                
                <div className="modal-tab-nav">
                    {['details', 'contacts', 'po', 'performance', 'documents'].map(tab => (
                        <a key={tab} href="#" className={activeTab === `modal-tab-${tab}` ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab(`modal-tab-${tab}`); }}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </a>
                    ))}
                </div>

                <div className="modal-body">
                    <div className={`modal-tab-pane ${activeTab === 'modal-tab-details' ? 'active' : ''}`} id="modal-tab-details"><ViewDetails /></div>
                    <div className={`modal-tab-pane ${activeTab === 'modal-tab-contacts' ? 'active' : ''}`} id="modal-tab-contacts"><ViewContacts /></div>
                    <div className={`modal-tab-pane ${activeTab === 'modal-tab-po' ? 'active' : ''}`} id="modal-tab-po"><ViewPOHistory /></div>
                    {/* Simplified tab content for brevity */}
                    <div className={`modal-tab-pane ${activeTab === 'modal-tab-performance' ? 'active' : ''}`} id="modal-tab-performance"><div className="detail-grid"><h4>Performance KPIs...</h4></div></div>
                    <div className={`modal-tab-pane ${activeTab === 'modal-tab-documents' ? 'active' : ''}`} id="modal-tab-documents"><h4>Documents List...</h4></div>
                </div>

                <div className="modal-footer">
                    <button className="btn ghost" onClick={onClose}>Close</button>
                    <button className="btn" onClick={onEdit}>Edit This Supplier</button>
                </div>
            </div>
        </div>
    );
}

export { SupplierForm, ViewSupplierModal };