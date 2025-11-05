// src/components/Materials/MaterialModal.jsx
import React, { useState, useEffect } from 'react';
import { initialDB } from '../../data/materialData'; // Use initialDB for options

const allUoM = ['EA', 'KG', 'MT', 'LTR', 'MTR', 'BOX'];
const allCurrencies = ['INR', 'USD', 'EUR'];
const allABC = ['A', 'B', 'C'];
const allVED = ['V', 'E', 'D'];
const allGST = ['0%', '5%', '12%', '18%', '28%'];

function ModalTab({ id, title, isActive, onClick }) {
    return (
        <a href="#" 
           className={isActive ? 'active' : ''} 
           onClick={(e) => { e.preventDefault(); onClick(id); }}
           data-target={id}
        >
            {title}
        </a>
    );
}

function MaterialModal({ isOpen, onClose, materialData, mode, onSave, allMaterials, allCategories, allSuppliers }) {
    const initialFormState = {
        code: '', desc: '', cat: allCategories[0] || '', uom: 'EA', status: 'Active', track: 'None', rol: 0,
        inv: { lead: 7, min: 0, max: 0, wh: [{ wh: 'Main WH - Jaipur', bin: 'A1', on: 0, res: 0 }] },
        sup: [{ name: allSuppliers[0] || '', lead: 7, last: 0, cur: 'INR' }],
        alt: '', pricing: { std: 0, last: 0, cur: 'INR', mrp: 0 },
        compliance: { hsn: '', gst: '18%', haz: '', msds: 'No', exp: 0 },
        flags: { haz: false, batch: false, serial: false }
    };

    const [formData, setFormData] = useState(initialFormState);
    const [activeTab, setActiveTab] = useState('m-tab-general');

    useEffect(() => {
        if (isOpen) {
            setActiveTab('m-tab-general');
            if (mode === 'edit' && materialData) {
                // Deep merge logic to load data while ensuring all fields exist
                const mergedData = {
                    ...initialFormState,
                    ...materialData,
                    inv: { ...initialFormState.inv, ...materialData.inv },
                    pricing: { ...initialFormState.pricing, ...materialData.pricing },
                    compliance: { ...initialFormState.compliance, ...materialData.compliance },
                    sup: materialData.sup?.length > 0 ? materialData.sup : initialFormState.sup,
                    // Convert array to comma-separated string for input
                    alt: materialData.alt?.join(', ') || '', 
                };
                setFormData(mergedData);
            } else {
                setFormData(initialFormState);
            }
        }
    }, [isOpen, mode, materialData]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (e, field, subField = null) => {
        const { value, type, checked } = e.target;
        const processedValue = type === 'number' ? Number(value) : value;

        setFormData(prev => {
            let newState = { ...prev };

            if (subField) {
                // Handles nested objects (inv, pricing, compliance)
                newState[field] = { ...newState[field], [subField]: processedValue };
            } else {
                // Handles top-level fields (code, desc, uom, status)
                newState[field] = processedValue;
            }
            
            // Special handling for key fields affecting others
            if (field === 'track') {
                newState.flags.batch = processedValue === 'Batch';
                newState.flags.serial = processedValue === 'Serial';
            }
            if (field === 'compliance' && subField === 'haz') {
                newState.flags.haz = !!processedValue;
            }
            
            // Special handling for supplier data (simplification: only manage the preferred one)
            if (field === 'sup' && subField === 'name') {
                 newState.sup[0] = { ...newState.sup[0], name: processedValue };
            }

            return newState;
        });
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.code) { alert('Item Code is required'); return; }

        // Finalize data structure before saving
        const dataToSave = {
            ...formData,
            alt: formData.alt.split(',').map(x => x.trim()).filter(Boolean),
            // Re-map inv.wh[0] for default warehouse/bin
            inv: {
                ...formData.inv,
                wh: formData.inv.wh.length > 0 ? [{ ...formData.inv.wh[0], wh: formData.inv.wh.wh, bin: formData.inv.wh.wh.split('/')[1]?.trim() || 'A1' }] : [],
            }
        };

        onSave(dataToSave, mode);
        onClose();
    };


    const title = mode === 'edit' ? `Edit Material: ${materialData?.code}` : 'Add New Material';

    return (
        <div className={`modal ${isOpen ? 'open' : ''}`} id="modal-material">
            <div className="modal-content">
                <div className="modal-head">
                    <h3 style={{ margin: 0 }} id="mat-modal-title">{title}</h3>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn ghost" onClick={onClose} data-modal-close>Close</button>
                    </div>
                </div>

                <div className="modal-tab-nav">
                    <ModalTab id="m-tab-general" title="General" isActive={activeTab === 'm-tab-general'} onClick={setActiveTab} />
                    <ModalTab id="m-tab-inventory" title="Inventory" isActive={activeTab === 'm-tab-inventory'} onClick={setActiveTab} />
                    <ModalTab id="m-tab-suppliers" title="Suppliers" isActive={activeTab === 'm-tab-suppliers'} onClick={setActiveTab} />
                    <ModalTab id="m-tab-pricing" title="Pricing" isActive={activeTab === 'm-tab-pricing'} onClick={setActiveTab} />
                    <ModalTab id="m-tab-compliance" title="Compliance" isActive={activeTab === 'm-tab-compliance'} onClick={setActiveTab} />
                    <ModalTab id="m-tab-docs" title="Documents" isActive={activeTab === 'm-tab-docs'} onClick={setActiveTab} />
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* GENERAL */}
                        <div className={`modal-tab-pane ${activeTab === 'm-tab-general' ? 'active' : ''}`} id="m-tab-general">
                            <div className="detail-grid">
                                <div className="form-group">
                                    <label>Item Code</label>
                                    <input id="f-code" placeholder="PP-GRAN" value={formData.code} onChange={(e) => handleChange(e, 'code')} disabled={mode === 'edit'} />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input id="f-desc" placeholder="Polypropylene Granules" value={formData.desc} onChange={(e) => handleChange(e, 'desc')} />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select id="f-cat" value={formData.cat} onChange={(e) => handleChange(e, 'cat')}>
                                        {allCategories.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>UoM</label>
                                    <select id="f-uom" value={formData.uom} onChange={(e) => handleChange(e, 'uom')}>
                                        {allUoM.map(u => <option key={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select id="f-status" value={formData.status} onChange={(e) => handleChange(e, 'status')}>
                                        <option>Active</option><option>Inactive</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Tracking</label>
                                    <select id="f-track" value={formData.track} onChange={(e) => handleChange(e, 'track')}>
                                        <option>None</option><option>Batch</option><option>Serial</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* INVENTORY */}
                        <div className={`modal-tab-pane ${activeTab === 'm-tab-inventory' ? 'active' : ''}`} id="m-tab-inventory">
                            <div className="detail-grid">
                                <div className="form-group">
                                    <label>Default Warehouse</label>
                                    <input id="f-wh" placeholder="Main WH - Jaipur" value={formData.inv.wh?.[0]?.wh} onChange={(e) => handleChange(e, 'inv', 'wh')} />
                                </div>
                                <div className="form-group">
                                    <label>Re-order Level (ROL)</label>
                                    <input type="number" id="f-rol" value={formData.rol} onChange={(e) => handleChange(e, 'rol')} />
                                </div>
                                <div className="form-group">
                                    <label>Min Stock</label>
                                    <input type="number" id="f-min" value={formData.inv.min} onChange={(e) => handleChange(e, 'inv', 'min')} />
                                </div>
                                <div className="form-group">
                                    <label>Max Stock</label>
                                    <input type="number" id="f-max" value={formData.inv.max} onChange={(e) => handleChange(e, 'inv', 'max')} />
                                </div>
                                <div className="form-group">
                                    <label>Lead Time (days)</label>
                                    <input type="number" id="f-lead" value={formData.inv.lead} onChange={(e) => handleChange(e, 'inv', 'lead')} />
                                </div>
                                <div className="form-group">
                                    <label>ABC Class</label>
                                    <select id="f-abc" value={formData.abc} onChange={(e) => handleChange(e, 'abc')}>
                                        {allABC.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>VED Class</label>
                                    <select id="f-ved" value={formData.ved} onChange={(e) => handleChange(e, 'ved')}>
                                        {allVED.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label>Barcode/GTIN</label><input id="f-gtin" placeholder="8901234567890" value={formData.gtin} onChange={(e) => handleChange(e, 'gtin')} /></div>
                                <div className="form-group">
                                    <label>QC Required</label>
                                    <select id="f-qc" value={formData.qc} onChange={(e) => handleChange(e, 'qc')}>
                                        <option>No</option><option>Yes</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SUPPLIERS */}
                        <div className={`modal-tab-pane ${activeTab === 'm-tab-suppliers' ? 'active' : ''}`} id="m-tab-suppliers">
                            <div className="form-group">
                                <label>Preferred Supplier</label>
                                <select id="f-pref-sup" value={formData.sup[0]?.name || ''} onChange={(e) => handleChange(e, 'sup', 'name')}>
                                    {allSuppliers.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Alternate Items (Comma separated item codes)</label>
                                <input id="f-alt" placeholder="M-102, C-503" value={formData.alt} onChange={(e) => handleChange(e, 'alt')} />
                            </div>
                        </div>

                        {/* PRICING */}
                        <div className={`modal-tab-pane ${activeTab === 'm-tab-pricing' ? 'active' : ''}`} id="m-tab-pricing">
                            <div className="detail-grid">
                                <div className="form-group">
                                    <label>Standard Cost</label>
                                    <input type="number" id="f-std-cost" step="0.001" value={formData.pricing.std} onChange={(e) => handleChange(e, 'pricing', 'std')} />
                                </div>
                                <div className="form-group">
                                    <label>Last Purchase Price</label>
                                    <input type="number" id="f-last-price" step="0.001" value={formData.pricing.last} onChange={(e) => handleChange(e, 'pricing', 'last')} />
                                </div>
                                <div className="form-group">
                                    <label>Currency</label>
                                    <select id="f-cur" value={formData.pricing.cur} onChange={(e) => handleChange(e, 'pricing', 'cur')}>
                                        {allCurrencies.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>MRP (if applicable)</label>
                                    <input type="number" id="f-mrp" step="0.01" value={formData.pricing.mrp} onChange={(e) => handleChange(e, 'pricing', 'mrp')} />
                                </div>
                            </div>
                        </div>

                        {/* COMPLIANCE */}
                        <div className={`modal-tab-pane ${activeTab === 'm-tab-compliance' ? 'active' : ''}`} id="m-tab-compliance">
                            <div className="detail-grid">
                                <div className="form-group"><label>HSN/HS Code</label><input id="f-hsn" placeholder="390210" value={formData.compliance.hsn} onChange={(e) => handleChange(e, 'compliance', 'hsn')} /></div>
                                <div className="form-group">
                                    <label>GST</label>
                                    <select id="f-gst" value={formData.compliance.gst} onChange={(e) => handleChange(e, 'compliance', 'gst')}>
                                        {allGST.map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label>Hazard Class</label><input id="f-haz" placeholder="UN 1993" value={formData.compliance.haz} onChange={(e) => handleChange(e, 'compliance', 'haz')} /></div>
                                <div className="form-group">
                                    <label>MSDS Required</label>
                                    <select id="f-msds" value={formData.compliance.msds} onChange={(e) => handleChange(e, 'compliance', 'msds')}>
                                        <option>No</option><option>Yes</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Shelf Life/Expiry (days)</label>
                                    <input type="number" id="f-exp" value={formData.compliance.exp} onChange={(e) => handleChange(e, 'compliance', 'exp')} />
                                </div>
                            </div>
                        </div>

                        {/* DOCS */}
                        <div className={`modal-tab-pane ${activeTab === 'm-tab-docs' ? 'active' : ''}`} id="m-tab-docs">
                            <div className="form-group"><label>Attach Files</label><input type="file" multiple /></div>
                            <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>Demo: files are not uploaded in this static build.</div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn ghost" onClick={onClose} data-modal-close>Cancel</button>
                        <button type="submit" className="btn ok" id="btn-save-material">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MaterialModal;