// src/components/Quality/NCRModal.jsx
import React from 'react';
import { pillColor } from '../../utils/formatters';

function NCRModal({ isOpen, onClose, initialData = {} }) {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`NCR Submitted for GRN ${initialData.grn || '—'}. (Demo)`);
        onClose();
    };

    return (
        <div className={`modal open`} id="modal-ncr">
            <div className="modal-content">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }}>Raise NCR</h3>
                    <button className="btn ghost" onClick={onClose}><svg style={{ width: 24, height: 24 }}><use href="#icon-close" /></svg></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="form-group"><label>GRN</label><input id="ncr-grn" defaultValue={initialData.grn || ''} readOnly /></div>
                            <div className="form-group"><label>Item</label><input id="ncr-item" defaultValue={initialData.item || ''} readOnly /></div>
                            <div className="form-group"><label>Defect Type</label><select id="ncr-defect"><option>Dimensional</option><option>Surface</option><option>Chemical</option><option>Functional</option></select></div>
                            <div className="form-group"><label>Qty Affected</label><input id="ncr-qty" type="number" /></div>
                            <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Description</label><textarea id="ncr-desc" rows="2"></textarea></div>
                            <div className="form-group"><label>Proposed Disposition</label><select id="ncr-disp"><option>Return to Vendor</option><option>Rework</option><option>Use as is (Deviation)</option><option>Scrap</option></select></div>
                            <div className="form-group"><label>Attach Photos</label><input type="file" multiple /></div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn ok">Save NCR</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Component for CAPA (8D) Modal
const CAPAModal = ({ isOpen, onClose, initialData = {} }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`CAPA (8D) submitted/saved. (Demo)`);
        onClose();
    };
    
    // Mock NCRs for the dropdown
    const mockNCRs = initialData.ncrs || [{ no: 'NCR-2025-004' }, { no: 'NCR-2025-005' }]; 

    return (
        <div className={`modal open`} id="modal-capa">
            <div className="modal-content">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }}>Create CAPA (8D)</h3>
                    <button className="btn ghost" onClick={onClose}><svg style={{ width: 24, height: 24 }}><use href="#icon-close" /></svg></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div className="form-group"><label>Linked NCR</label><select id="capa-ncr" defaultValue={initialData.linkedNcr}><option value="">— Select NCR —</option>{mockNCRs.map(n => <option key={n.no}>{n.no}</option>)}</select></div>
                            <div className="form-group"><label>Owner</label><input id="capa-owner" defaultValue="qc.lead@company.com" /></div>
                            <div className="form-group"><label>Due Date</label><input id="capa-due" type="date" /></div>
                        </div>
                        {/* D1 through D8 fields (omitted for brevity, follow textarea pattern) */}
                        <div className="form-group"><label>D1 Team</label><textarea id="d1" rows="2" placeholder="Team members & roles"></textarea></div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn ok">Save CAPA</button>
                    </div>
                </form>
            </div>
        </div>
    );
};