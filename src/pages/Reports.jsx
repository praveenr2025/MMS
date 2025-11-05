import React from 'react';
import { Link } from 'react-router-dom';

const reportData = [
    { title: 'Stock on Hand Report', description: 'Current inventory levels, value, and location for all materials.', link: '/inventory.html#stock-on-hand' },
    { title: 'Low Stock Report', description: 'Lists all items at or below their specified re-order level.', link: '/inventory.html#low-stock' },
    { title: 'PO Aging Report', description: 'Tracks open Purchase Orders and time since approval.', link: '/purchase-orders.html#aging' },
    { title: 'Supplier Performance', description: 'Analyzes delivery times, quality, and pricing by supplier.', link: '/suppliers.html#performance' },
    { title: 'Material Consumption Report', description: 'Details material usage by department or project over time.', link: '/issue.html#consumption' },
    { title: 'Invoice Payment Status', description: 'Summary of paid, pending, and overdue invoices.', link: '/invoices.html#status' },
];

function Reports() {
    return (
        <div className="page-content">
            <div id="page-reports">
                <div className="page-header">
                    <h1>Reports</h1>
                </div>
                
                <div className="report-grid">
                    {reportData.map((report, index) => {
                        // Use Link for internal navigation, splitting the path from the hash
                        const [pathname, hash] = report.link.split('#');
                        
                        return (
                            <Link key={index} to={report.link} className="report-card">
                                <h3>{report.title}</h3>
                                <p>{report.description}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Reports;