// src/components/Administration/WarehouseModal.jsx
import React, { useState, useEffect } from 'react';

function WarehouseModal({ isOpen, onClose, initialData = null, onSubmit }) {
    const [formData, setFormData] = useState(initialData || { code: '', name: '', location: '', type: 'Pallet Racking' });
    
    useEffect(() => {
        setFormData(initialData || { code: '', name: '', location: '', type: 'Pallet Racking' });
    }, [initialData]);
    
    const isEdit = !!initialData;
    const title = isEdit ? `Edit Warehouse: ${formData.code}` : 'Add New Warehouse';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.code || !formData.name) {
            alert('Code and Name are required!');
            return;
        }
        onSubmit(formData, isEdit);
        onClose();
    };

    return (
        <div className={`modal ${isOpen ? 'open' : ''}`} id="modal-warehouse-form">
            <div className="modal-content">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }}>{title}</h3>
                    <button className="btn ghost" style={{ padding: 4, borderColor: 'transparent' }} onClick={onClose}><svg style={{ width: 24, height: 24 }}><use href="#icon-close" /></svg></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="detail-grid">
                            <div className="form-group"><label htmlFor="code">Code</label><input type="text" id="code" value={formData.code} onChange={handleChange} disabled={isEdit} required /></div>
                            <div className="form-group"><label htmlFor="name">Name</label><input type="text" id="name" value={formData.name} onChange={handleChange} required /></div>
                            <div className="form-group"><label htmlFor="location">Location</label><input type="text" id="location" value={formData.location} onChange={handleChange} /></div>
                            <div className="form-group"><label htmlFor="type">Type</label>
                                <select id="type" value={formData.type} onChange={handleChange}>
                                    <option>Pallet Racking</option><option>Silo</option><option>Shelving</option><option>Quarantine</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label htmlFor="description">Description/Notes</label><textarea id="description" rows="2"></textarea></div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn ok">Save Warehouse</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WarehouseModal;