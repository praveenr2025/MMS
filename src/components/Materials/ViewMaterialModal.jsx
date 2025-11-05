import React, { useMemo } from 'react';

// Utility function to format currency (from previous pages/context)
const fmtMoney = (n, cur) => {
    const v = Number(n || 0);
    const symbol = cur === 'INR' ? '₹' : cur === 'EUR' ? '€' : cur === 'SGD' ? 'S$' : '$';
    return symbol + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Renders a read-only modal displaying comprehensive details about a Material.
 * The data structure matches the objects stored in the in-memory materialData.js store.
 * * @param {object} props
 * @param {object} props.material The material object to display.
 * @param {boolean} props.isOpen Control flag for modal visibility.
 * @param {function} props.onClose Function to close the modal.
 */
function ViewMaterialModal({ material, isOpen, onClose }) {
    
    // Fallback to avoid errors if material is null while closing
    if (!material) return null;

    // --- Tab State (Internal to this modal for simplicity) ---
    const [activeTab, setActiveTab] = React.useState('po-tab-summary');

    // Calculate aggregated inventory values for the Summary tab
    const summaryData = useMemo(() => {
        const totalOnHand = material.inv?.wh?.reduce((sum, w) => sum + (w.on || 0), 0) || 0;
        const totalReserved = material.inv?.wh?.reduce((sum, w) => sum + (w.res || 0), 0) || 0;
        const available = totalOnHand - totalReserved;
        const leadTime = (material.inv?.lead || '-') + ' days';
        
        return {
            totalOnHand,
            totalReserved,
            available,
            leadTime
        };
    }, [material]);

    const getStatusPill = (status) => {
        const cls = status === 'Active' ? 'ok' : 'bad';
        return `<span class="pill ${cls}">${status}</span>`;
    }

    return (
        <div className={`modal ${isOpen ? 'open' : ''}`} id="modal-view">
            <div className="modal-content" style={{ maxWidth: '900px' }}>
                <div className="modal-head">
                    <h3 style={{ margin: 0 }} id="view-title">
                        {material.code} — {material.desc}
                    </h3>
                    <button className="btn ghost" onClick={onClose} data-modal-close>Close</button>
                </div>

                {/* Modal Tab Navigation */}
                <div className="modal-tab-nav">
                    <a href="#" className={activeTab === 'po-tab-summary' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('po-tab-summary'); }}>Summary</a>
                    <a href="#" className={activeTab === 'po-tab-inventory' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('po-tab-inventory'); }}>Inventory Breakdown</a>
                    <a href="#" className={activeTab === 'po-tab-suppliers' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('po-tab-suppliers'); }}>Suppliers & Pricing</a>
                    <a href="#" className={activeTab === 'po-tab-compliance' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('po-tab-compliance'); }}>Compliance</a>
                    <a href="#" className={activeTab === 'po-tab-docs' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('po-tab-docs'); }}>Documents</a>
                </div>

                <div className="modal-body">
                    {/* Summary Tab */}
                    <div className={`modal-tab-pane ${activeTab === 'po-tab-summary' ? 'active' : ''}`} id="po-tab-summary">
                        <div className="detail-grid" style={{ marginBottom: '16px' }}>
                            <div className="detail-item"><div className="label">Item Code</div><div className="value">{material.code}</div></div>
                            <div className="detail-item"><div className="label">Description</div><div className="value">{material.desc}</div></div>
                            <div className="detail-item"><div className="label">Category</div><div className="value">{material.cat}</div></div>
                            <div className="detail-item"><div className="label">UoM</div><div className="value">{material.uom}</div></div>
                            <div className="detail-item"><div className="label">Status</div><div className="value" dangerouslySetInnerHTML={{ __html: getStatusPill(material.status) }}></div></div>
                            <div className="detail-item"><div className="label">Tracking</div><div className="value">{material.track}</div></div>
                            
                            <div className="detail-item" style={{ marginTop: '16px' }}><div className="label">Total On Hand</div><div className="value">{summaryData.totalOnHand.toLocaleString()} {material.uom}</div></div>
                            <div className="detail-item" style={{ marginTop: '16px' }}><div className="label">Available</div><div className="value" style={{ color: 'var(--ok)' }}>{summaryData.available.toLocaleString()} {material.uom}</div></div>
                            <div className="detail-item" style={{ marginTop: '16px' }}><div className="label">Re-order Level</div><div className="value">{material.rol} {material.uom}</div></div>
                            <div className="detail-item" style={{ marginTop: '16px' }}><div className="label">Last Purchase Price</div><div className="value">{fmtMoney(material.pricing?.last, material.pricing?.cur)}</div></div>
                        </div>
                    </div>

                    {/* Inventory Breakdown Tab */}
                    <div className={`modal-tab-pane ${activeTab === 'po-tab-inventory' ? 'active' : ''}`} id="po-tab-inventory">
                        <h4 style={{ marginTop: 0 }}>Stock by Location</h4>
                        <div className="table-container">
                            <table className="table">
                                <thead><tr><th>Warehouse</th><th>Bin</th><th style={{ textAlign: 'right' }}>On Hand</th><th style={{ textAlign: 'right' }}>Reserved</th><th style={{ textAlign: 'right' }}>Available</th></tr></thead>
                                <tbody id="v-wh">
                                    {(material.inv?.wh || []).map((w, index) => (
                                        <tr key={index}>
                                            <td>{w.wh}</td>
                                            <td>{w.bin}</td>
                                            <td style={{ textAlign: 'right' }}>{w.on}</td>
                                            <td style={{ textAlign: 'right' }}>{w.res}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{w.on - w.res}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <h4 style={{ marginTop: '16px' }}>Inventory Planning Parameters</h4>
                        <div className="detail-grid">
                            <div className="detail-item"><div className="label">Lead Time</div><div className="value">{summaryData.leadTime}</div></div>
                            <div className="detail-item"><div className="label">Min Stock</div><div className="value">{material.inv?.min || 0}</div></div>
                            <div className="detail-item"><div className="label">Max Stock</div><div className="value">{material.inv?.max || 0}</div></div>
                            <div className="detail-item"><div className="label">ABC / VED Class</div><div className="value">{(material.abc || 'A') + ' / ' + (material.ved || 'E')}</div></div>
                        </div>
                    </div>

                    {/* Suppliers & Pricing Tab */}
                    <div className={`modal-tab-pane ${activeTab === 'po-tab-suppliers' ? 'active' : ''}`} id="po-tab-suppliers">
                        <h4 style={{ marginTop: 0 }}>Preferred & Alternate Suppliers</h4>
                        <div className="table-container" style={{ marginBottom: '16px' }}>
                            <table className="table">
                                <thead><tr><th>Supplier</th><th>Lead Time</th><th>Last Price</th></tr></thead>
                                <tbody id="v-sup">
                                    {(material.sup || []).map((s, index) => (
                                        <tr key={index}>
                                            <td>{s.name} {index === 0 && <span className="pill blue" style={{ padding: '2px 6px', fontSize: '.7rem', marginLeft: '6px' }}>Preferred</span>}</td>
                                            <td>{s.lead} days</td>
                                            <td>{fmtMoney(s.last, s.cur)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <h4 style={{ marginTop: '16px' }}>Pricing & Valuation</h4>
                        <div className="detail-grid">
                            <div className="detail-item"><div className="label">Standard Cost</div><div className="value">{fmtMoney(material.pricing?.std, material.pricing?.cur)}</div></div>
                            <div className="detail-item"><div className="label">Last Purchase Price</div><div className="value">{fmtMoney(material.pricing?.last, material.pricing?.cur)}</div></div>
                            <div className="detail-item"><div className="label">MRP / Sale Price</div><div className="value">{fmtMoney(material.pricing?.mrp, material.pricing?.cur)}</div></div>
                            <div className="detail-item"><div className="label">Alternate Items</div><div className="value">{material.alt?.join(', ') || 'None'}</div></div>
                        </div>
                    </div>
                    
                    {/* Compliance Tab */}
                    <div className={`modal-tab-pane ${activeTab === 'po-tab-compliance' ? 'active' : ''}`} id="po-tab-compliance">
                        <h4 style={{ marginTop: 0 }}>Regulatory Details</h4>
                        <div className="detail-grid">
                            <div className="detail-item"><div className="label">HSN / HS Code</div><div className="value">{material.compliance?.hsn || '—'}</div></div>
                            <div className="detail-item"><div className="label">GST Rate</div><div className="value">{material.compliance?.gst || '—'}</div></div>
                            <div className="detail-item"><div className="label">Hazard Class</div><div className="value">{material.compliance?.haz || 'None'}</div></div>
                            <div className="detail-item"><div className="label">MSDS Required</div><div className="value">{material.compliance?.msds || 'No'}</div></div>
                            <div className="detail-item"><div className="label">Batch Expiry Tracking</div><div className="value">{material.compliance?.exp > 0 ? `${material.compliance.exp} days` : 'No'}</div></div>
                            <div className="detail-item"><div className="label">QC Required on GRN</div><div className="value">{material.qc || (['Chemicals','Raw Material'].includes(material.cat)?'Yes':'No')}</div></div>
                        </div>
                    </div>

                    {/* Documents Tab */}
                    <div className={`modal-tab-pane ${activeTab === 'po-tab-docs' ? 'active' : ''}`} id="po-tab-docs">
                        <h4 style={{ marginTop: 0 }}>Attached Files</h4>
                        <div className="card" style={{ padding: '10px' }}>
                            <ul style={{ listStyleType: 'none', padding: 0 }}>
                                <li>No documents found (demo)</li>
                                {/* In a real app, this would iterate over material.docs */}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewMaterialModal;