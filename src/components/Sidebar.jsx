// src/components/Sidebar.jsx (Updated to use Link and useLocation)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navSections = [
    { heading: null, links: [{ name: 'Dashboard', href: '/', icon: '#icon-dashboard' }] },
    { heading: 'Procurement', links: [
       { name: 'Purchase Requisitions', href: '/requisitions', icon: '#icon-requisition' } ,
        { name: 'Suppliers', href: '/suppliers', icon: '#icon-suppliers' },
        { name: 'Purchase Orders', href: '/purchase-orders', icon: '#icon-po' },
    ]},
    { heading: 'Inventory', links: [
        { name: 'Materials Master', href: '/materials', icon: '#icon-materials' },
        { name: 'Goods Received (GRN)', href: '/grn', icon: '#icon-grn' },
        { name: 'Quality Inspection', href: '/quality', icon: '#icon-quality' },
        { name: 'Stock Levels', href: '/inventory', icon: '#icon-inventory' },
        { name: 'Stock Issuance (MIV)', href: '/issue', icon: '#icon-issue' },
    ]},
    { heading: 'Finance', links: [
        { name: 'Invoices', href: '/invoices', icon: '#icon-invoice' },
    ]},
    { heading: 'Reporting', links: [
        { name: 'All Reports', href: '/reports', icon: '#icon-reports' },
    ]},
    { heading: 'Administration', links: [
        { name: 'User Management', href: '/admin', icon: '#icon-admin' },
        { name: 'Warehouses', href: '/warehouses', icon: '#icon-warehouse' },
        { name: 'Material Categories', href: '/categories', icon: '#icon-category' },
    ]},
];

export function Sidebar() {
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <nav className="sidebar">
            <div>
                <div className="sidebar-header">Enterprise MMS</div>
                <div className="sidebar-nav">
                    {navSections.map((section, index) => (
                        <React.Fragment key={index}>
                            {section.heading && <div className="sidebar-nav-heading">{section.heading}</div>}
                            {section.links.map(link => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    // The active link class logic is crucial
                                    className={currentPath === link.href || (link.href === '/' && currentPath === '/index') ? 'active-link' : ''}
                                >
                                    {/* The SVG structure must exactly match the HTML */}
                                    <svg><use href={link.icon} /></svg>
                                    <span>{link.name}</span>
                                </Link>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', padding: '0 14px 10px' }}>
                User: admin@company.com
            </div>
        </nav>
    );
}