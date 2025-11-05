// src/pages/Materials.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MaterialModal from '../components/Materials/MaterialModal';
import ViewMaterialModal from '../components/Materials/ViewMaterialModal'; // Assuming a view modal component

import { getDB, setDB, initialDB } from '../data/materialData';

const PAGE_SIZE = 10;
const defaultFilters = {
    search: '',
    category: '',
    uom: '',
    track: '',
    status: ''
};

function Materials() {
    const [db, setLocalDB] = useState(getDB());
    const [filters, setFilters] = useState(defaultFilters);
    const [currentPage, setCurrentPage] = useState(1);
    const [sort, setSort] = useState({ key: 'code', direction: 'asc' });
    const [modal, setModal] = useState({ isOpen: false, mode: 'add', data: null });
    const [viewModalData, setViewModalData] = useState(null);

    // Load data on mount
    useEffect(() => {
        // Ensure data exists in localStorage for initial loads
        getDB(); 
        setLocalDB(getDB());
    }, []);

    const allCategories = useMemo(() => db.categories, [db.categories]);
    const allUOM = useMemo(() => Array.from(new Set(db.materials.map(m => m.uom))).sort(), [db.materials]);

    // --- Data Filtering, Sorting, and Pagination ---
    const filteredMaterials = useMemo(() => {
        let list = db.materials.filter(m => {
            const t = (m.code + ' ' + m.desc + ' ' + m.cat).toLowerCase();
            const okQ = !filters.search || t.includes(filters.search.toLowerCase());
            const okC = !filters.category || m.cat === filters.category;
            const okU = !filters.uom || m.uom === filters.uom;
            const okT = !filters.track || m.track === filters.track;
            const okS = !filters.status || m.status === filters.status;
            return okQ && okC && okU && okT && okS;
        });

        // Sorting
        list.sort((a, b) => {
            let aVal = a[sort.key] || '';
            let bVal = b[sort.key] || '';

            if (typeof aVal === 'string') {
                return aVal.localeCompare(bVal) * (sort.direction === 'asc' ? 1 : -1);
            }
            // For numeric fields like rol, onhand
            return (aVal - bVal) * (sort.direction === 'asc' ? 1 : -1);
        });

        return list;
    }, [db.materials, filters, sort]);

    const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / PAGE_SIZE));
    const paginatedMaterials = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return filteredMaterials.slice(start, end);
    }, [filteredMaterials, currentPage]);


    // --- Handlers ---
    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.id.replace('filter-', '')]: e.target.value }));
        setCurrentPage(1); // Reset pagination on filter change
    };

    const handleSort = (key) => {
        setSort(prev => ({
            key,
            direction: prev.key === key ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
        }));
    };

    const handleOpenModal = (mode, material = null) => {
        setModal({ isOpen: true, mode, data: material });
    };

    const handleCloseModal = () => {
        setModal({ isOpen: false, mode: 'add', data: null });
    };

    const handleSaveMaterial = (newMaterial, mode) => {
        let updatedMaterials;

        if (mode === 'edit') {
            updatedMaterials = db.materials.map(m =>
                m.code === newMaterial.code ? { ...m, ...newMaterial } : m
            );
        } else {
            updatedMaterials = [newMaterial, ...db.materials];
        }

        const newDB = { ...db, materials: updatedMaterials };
        setDB(newDB);
        setLocalDB(newDB);
    };

    const handleDeleteMaterial = (code) => {
        if (window.confirm(`Are you sure you want to delete material ${code}?`)) {
            const updatedMaterials = db.materials.filter(m => m.code !== code);
            const newDB = { ...db, materials: updatedMaterials };
            setDB(newDB);
            setLocalDB(newDB);
        }
    };

    const handleViewMaterial = (material) => {
        setViewModalData(material);
    }
    
    // --- KPI Calculation (From original HTML logic) ---
    const kpiData = useMemo(() => ({
        items: db.materials.length,
        reorder: db.materials.filter(m => m.onhand <= m.rol).length,
        batch: db.materials.filter(m => m.track === 'Batch').length,
        haz: db.materials.filter(m => m.flags?.haz).length
    }), [db.materials]);
    
    // --- Utility Functions (from original script) ---
    function pillForStatus(s) {
        const m = { 'Active': 'ok', 'Inactive': 'bad' };
        const k = m[s] || 'blue';
        return `<span class="pill ${k}">${s}</span>`;
    }

    // --- Renderers ---
    const renderPagination = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        pages.push(<a key="prev" href="#" className={currentPage === 1 ? 'disabled' : ''} onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}>« Prev</a>);
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(<a key={i} href="#" className={currentPage === i ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage(i); }}>{i}</a>);
        }
        pages.push(<a key="next" href="#" className={currentPage === totalPages ? 'disabled' : ''} onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}>Next »</a>);
        return pages;
    };


    return (
        <div className="page-content">
            <nav className="tab-nav">
                <a href="#dashboard" className="active" onClick={(e) => e.preventDefault()} data-target="tab-dashboard">Inventory KPIs</a>
                <a href="#all" onClick={(e) => e.preventDefault()} data-target="tab-all">All Materials</a>
                <a href="#import" onClick={(e) => e.preventDefault()} data-target="tab-import">Bulk Import</a>
                <a href="#setup" onClick={(e) => e.preventDefault()} data-target="tab-setup">Attributes & Rules</a>
            </nav>

            {/* DASHBOARD */}
            <section className="tab-pane active" id="tab-dashboard">
                <div className="kpi-grid">
                    <div className="kpi-card">
                        <div className="kpi-card-icon blue"><svg><use href="#icon-materials" /></svg></div>
                        <div className="value">{kpiData.items}</div>
                        <div className="label">Active SKUs</div>
                        <a className="link" href="#all" onClick={(e) => { e.preventDefault(); /* Logic to switch tab */ }}>Go to list →</a>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-card-icon warn"><svg><use href="#icon-warehouse" /></svg></div>
                        <div className="value">{kpiData.reorder}</div>
                        <div className="label">At / Below Re-order</div>
                        <a className="link" href="#all" onClick={(e) => { e.preventDefault(); /* Logic to switch tab */ }}>Restock →</a>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-card-icon ok"><svg><use href="#icon-quality" /></svg></div>
                        <div className="value">{kpiData.batch}</div>
                        <div className="label">Batch/Lot Tracked</div>
                        <a className="link" href="#all" onClick={(e) => { e.preventDefault(); /* Logic to switch tab */ }}>Traceability →</a>
                    </div>
                    <div className="kpi-card">
                        <div className="kpi-card-icon bad"><svg><use href="#icon-invoice" /></svg></div>
                        <div className="value">{kpiData.haz}</div>
                        <div className="label">Hazardous Items</div>
                        <a className="link" href="#all" onClick={(e) => { e.preventDefault(); /* Logic to switch tab */ }}>Compliance →</a>
                    </div>
                </div>
            </section>

            {/* ALL MATERIALS */}
            <section className="tab-pane" id="tab-all">
                <div className="table-controls">
                    <div className="table-filters">
                        <input type="text" className="search-bar" id="filter-search" placeholder="Search code, description, category…" value={filters.search} onChange={handleFilterChange} />
                        <select id="filter-category" value={filters.category} onChange={handleFilterChange}>
                            <option value="">Category: All</option>
                            {allCategories.map(c => <option key={c}>{c}</option>)}
                        </select>
                        <select id="filter-uom" value={filters.uom} onChange={handleFilterChange}>
                            <option value="">UoM: All</option>
                            {allUOM.map(u => <option key={u}>{u}</option>)}
                        </select>
                        <select id="filter-track" value={filters.track} onChange={handleFilterChange}>
                            <option value="">Tracking: All</option>
                            <option value="Batch">Batch</option><option value="Serial">Serial</option><option value="None">None</option>
                        </select>
                        <select id="filter-status" value={filters.status} onChange={handleFilterChange}>
                            <option value="">Status: All</option>
                            <option>Active</option><option>Inactive</option>
                        </select>
                        <button className="btn ghost" id="btn-filter" style={{ padding: '8px 12px' }} onClick={() => setCurrentPage(1)}>Filter</button>
                    </div>
                </div>
                <div className="card">
                    <div className="table-container">
                        <table className="table" id="mat-table">
                            <thead>
                                <tr>
                                    <th className="sortable" onClick={() => handleSort('code')}>Item Code</th>
                                    <th className="sortable" onClick={() => handleSort('desc')}>Description</th>
                                    <th>Category</th>
                                    <th>UoM</th>
                                    <th style={{ textAlign: 'right' }} className="sortable" onClick={() => handleSort('rol')}>ROL</th>
                                    <th style={{ textAlign: 'right' }} className="sortable" onClick={() => handleSort('onhand')}>On Hand</th>
                                    <th style={{ textAlign: 'right' }} className="sortable" onClick={() => handleSort('intransit')}>In Transit</th>
                                    <th>Tracking</th>
                                    <th>Status</th>
                                    <th className="actions-cell">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="mat-tbody">
                                {paginatedMaterials.map(m => (
                                    <tr key={m.code}>
                                        <td><b>{m.code}</b></td>
                                        <td>{m.desc}</td>
                                        <td>{m.cat}</td>
                                        <td>{m.uom}</td>
                                        <td style={{ textAlign: 'right' }}>{m.rol}</td>
                                        <td style={{ textAlign: 'right' }}>{m.onhand}</td>
                                        <td style={{ textAlign: 'right' }}>{m.intransit || 0}</td>
                                        <td>{m.track}</td>
                                        <td dangerouslySetInnerHTML={{ __html: pillForStatus(m.status) }}></td>
                                        <td className="actions-cell">
                                            <button className="btn ghost" style={{ padding: '5px 10px' }} data-action="view" onClick={() => handleViewMaterial(m)}>View</button>
                                            <button className="btn ghost" style={{ padding: '5px 10px' }} data-action="edit" onClick={() => handleOpenModal('edit', m)}>Edit</button>
                                            <button className="btn ghost bad" style={{ padding: '5px 10px' }} data-action="delete" onClick={() => handleDeleteMaterial(m.code)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px' }}>
                        <span id="mat-count">
                            Showing {paginatedMaterials.length ? ((currentPage - 1) * PAGE_SIZE + 1) : 0} to {Math.min(currentPage * PAGE_SIZE, filteredMaterials.length)} of {filteredMaterials.length} results
                        </span>
                        <div className="pagination" id="mat-pager">
                            {renderPagination()}
                        </div>
                    </div>
                </div>
            </section>

            {/* BULK IMPORT */}
            <section className="tab-pane" id="tab-import">
                <div className="card" style={{ padding: 16 }}>
                    <h3 style={{ marginTop: 0 }}>Bulk Import (CSV)</h3>
                    <p>Use the template to prepare your data. Supports upsert by <b>Item Code</b>.</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn ghost" id="btn-download-template" onClick={() => alert('Download template feature (demo).')}>Download Template</button>
                        <input type="file" id="file-import" accept=".csv" />
                        <button className="btn" id="btn-run-import" onClick={() => alert('Import running (demo).')}>Run Import</button>
                    </div>
                    <div id="import-status" style={{ marginTop: 10, color: 'var(--muted)' }}></div>
                </div>
            </section>

            {/* ATTRIBUTES & RULES */}
            <section className="tab-pane" id="tab-setup">
                <div className="page-header"><h1>Attributes & Business Rules</h1></div>
                <div className="card" style={{ padding: 16 }}>
                    <div className="detail-grid">
                        <div className="detail-item"><div className="label">Valuation Method</div><div className="value">FIFO (per warehouse)</div></div>
                        <div className="detail-item"><div className="label">Default Re-Order Policy</div><div className="value">Min/Max with EOQ</div></div>
                        <div className="detail-item"><div className="label">QC Required</div><div className="value">By Category: Raw Material & Chemicals</div></div>
                        <div className="detail-item"><div className="label">Batch/Lot Expiry</div><div className="value">Enabled (Chemicals & Pharma)</div></div>
                        <div className="detail-item"><div className="label">Tolerance</div><div className="value">Receiving ±3%, Issue ±2%</div></div>
                        <div className="detail-item"><div className="label">Compliance</div><div className="value">HSN/GST; MSDS for hazardous</div></div>
                    </div>
                </div>
            </section>

            {/* Modals */}
            <MaterialModal
                isOpen={modal.isOpen}
                onClose={handleCloseModal}
                materialData={modal.data}
                mode={modal.mode}
                onSave={handleSaveMaterial}
                allMaterials={db.materials}
                allCategories={db.categories}
                allSuppliers={db.suppliers}
            />
            
            {/* View Modal Placeholder */}
            {viewModalData && (
                <ViewMaterialModal 
                    material={viewModalData} 
                    isOpen={!!viewModalData} 
                    onClose={() => setViewModalData(null)}
                />
            )}
        </div>
    );
}

export default Materials;