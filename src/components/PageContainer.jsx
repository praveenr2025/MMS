// src/components/PageContainer.jsx
import React from 'react';

export function PageContainer({ children }) {
    // Corresponds to the .page-content div
    return <div className="page-content">{children}</div>;
}