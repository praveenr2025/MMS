// src/pages/Warehouses.jsx
import React, { useState } from 'react';
import WarehouseModal from '../components/Administration/WarehouseModal';

const warehouseData = [
    { id: 'w1', code: 'WH-A', name: 'Main Warehouse A', location: 'Building 1', type: 'Pallet Racking' },
    { id: 'w2', code: 'WH-B', name: 'Silo Storage B', location: 'Building 2', type: 'Silo' },
    { id: 'w3', code: 'Store-01', name: 'Office Storeroom', location: 'Admin Building', type: 'Shelving' },
    { id: 'w4', code: 'QC-HOLD', name: 'QC Hold Area', location: 'Building 1', type: 'Quarantine' },
];

function Warehouses() {
    const [warehouses, setWarehouses] = useState(warehouseData);
    const [modalState, setModalState] = useState({ isOpen: false, editData: null });
    
    const handleSave = (formData, isEdit) => {
        if (isEdit) {
            setWarehouses(warehouses.map(w => w.id === formData.id ? formData : w));
        } else {
            // Mock ID generation
            const newId = 'w' + (warehouses.length + 1);
            setWarehouses([...warehouses, { ...formData, id: newId }]);
        }
    };
    
    const handleOpenModal = (data = null) => {
        setModalState({ isOpen: true, editData: data });
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, editData: null });
    };

    return (
        <div className="page-content">
            <div id="page-warehouses">
                <div className="page-header">
                    <h1>Warehouses</h1>
                    {/* Button disabled in original HTML, enabling here for demo interaction */}
                    <button className="btn" onClick={() => handleOpenModal()}>+ New Warehouse</button>
                </div>
                <div className="card">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr><th>Code</th><th>Name</th><th>Location</th><th>Type</th><th className="actions-cell">Actions</th></tr>
                            </thead>
                            <tbody>
                                {warehouses.map(w => (
                                    <tr key={w.id}>
                                        <td><strong>{w.code}</strong></td>
                                        <td>{w.name}</td>
                                        <td>{w.location}</td>
                                        <td>{w.type}</td>
                                        <td className="actions-cell">
                                            <button className="btn ghost" style={{ padding: '5px 10px' }} onClick={() => handleOpenModal(w)}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <WarehouseModal 
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                initialData={modalState.editData}
                onSubmit={handleSave}
            />
            
            {/* The rest of the unnecessary PO modals from the original HTML are presumed to be handled in the global ModalContainer.jsx */}
        </div>
    );
}

export default Warehouses;