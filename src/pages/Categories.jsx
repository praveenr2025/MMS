import React, { useState, useMemo } from 'react';

// Mock Data for Categories (From original HTML)
const initialCategories = [
    { code: 'RAW-STL', name: 'Raw Material - Steel', glAccount: '1400-01' },
    { code: 'RAW-POLY', name: 'Raw Material - Polymer', glAccount: '1400-02' },
    { code: 'OFF-SUP', name: 'Office Supplies', glAccount: '7200-01' },
    { code: 'CON', name: 'Consumables - Workshop', glAccount: '7200-05' },
];

function Categories() {
    const [categories, setCategories] = useState(initialCategories);
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null); // Data for editing

    // Handlers for mock functionality
    const handleOpenModal = (data = null) => {
        setEditData(data);
        setModalOpen(true);
    };

    const handleSave = (formData) => {
        if (editData) {
            // Edit logic (Find and replace)
            setCategories(categories.map(c => 
                c.code === formData.code ? { ...c, ...formData } : c
            ));
        } else {
            // Add logic (Add new)
            setCategories([...categories, formData]);
        }
        setModalOpen(false);
    };

    const CategoryModal = ({ isOpen, onClose, data }) => {
        const [formData, setFormData] = useState(data || { code: '', name: '', glAccount: '' });
        
        const handleSubmit = (e) => {
            e.preventDefault();
            if (!formData.code || !formData.name) {
                alert('Code and Name are required!');
                return;
            }
            handleSave(formData);
        };

        const title = data ? `Edit Category: ${data.code}` : 'Add New Category';

        return (
            <div className={`modal ${isOpen ? 'open' : ''}`} id="modal-add-category">
                <div className="modal-content">
                    <div className="modal-head">
                        <h3 style={{ margin: 0 }}>{title}</h3>
                        <button className="btn ghost" style={{ padding: 4, borderColor: 'transparent' }} onClick={onClose}><svg style={{ width: 24, height: 24 }}><use href="#icon-close" /></svg></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Code</label>
                                <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} disabled={!!data} required />
                            </div>
                            <div className="form-group">
                                <label>Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>GL Account</label>
                                <input type="text" value={formData.glAccount} onChange={e => setFormData({ ...formData, glAccount: e.target.value })} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn ok">Save Category</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };


    return (
        <div className="page-content">
            <div id="page-categories">
                <div className="page-header">
                    <h1>Material Categories</h1>
                    {/* The original HTML disabled this button; we enable it for demo purposes */}
                    <button className="btn" onClick={() => handleOpenModal()}>+ New Category</button>
                </div>
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>GL Account</th>
                                    <th className="actions-cell">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((c, i) => (
                                    <tr key={i}>
                                        <td><strong>{c.code}</strong></td>
                                        <td>{c.name}</td>
                                        <td>{c.glAccount}</td>
                                        <td className="actions-cell">
                                            <button className="btn ghost" style={{ padding: '5px 10px' }} onClick={() => handleOpenModal(c)}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Render the modal */}
            <CategoryModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                data={editData}
            />

            {/* Note: Other unused modals from the original HTML (view-po-approved, view-po-partial, etc.) 
                would still need to be included in your global ModalContainer.jsx if you want those links to function. */}
        </div>
    );
}

// 🛑 This ensures App.jsx can import the component without error
export default Categories;