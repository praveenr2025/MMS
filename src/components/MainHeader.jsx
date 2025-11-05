// src/components/MainHeader.jsx
import React from 'react';

export function MainHeader({ pageTitle }) {
    return (
        <div className="stickybar main-header">
            <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>{pageTitle}</h2>
            </div>
            <a href="#logout" className="btn ghost" style={{ padding: '8px 12px' }}>Log Out</a>
        </div>
    );
}