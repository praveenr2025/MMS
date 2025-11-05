// src/components/IconSprite.jsx
import React from 'react';

function IconSprite() {
  // NOTE: This large SVG block MUST contain ALL icons from your original HTML files.
  return (
    <svg width="0" height="0" style={{ display: 'none' }}>
        <symbol viewBox="0 0 24 24" id="icon-dashboard"><path fill="currentColor" d="M13 9V3h8v6h-8zM3 13V3h8v10H3zm10 8V11h8v10h-8zM3 21v-6h8v6H3z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-suppliers"><path fill="currentColor" d="M16 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-8-4c0 2.21 1.79 4 4 4s4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4zm16 4v-2c0-2.66-5.33-4-8-4s-8 1.34-8 4v2h16zm-8-4c0 2.21 1.79 4 4 4s4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-materials"><path fill="currentColor" d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.81.97H5.43l.81-.97zM5 19V8h14v11H5z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-po"><path fill="currentColor" d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 21c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v18zM5 5h14v14H5V5z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-grn"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17zM18 3h-2.29C15.21 1.25 13.43 0 11.5 0S7.79 1.25 7.29 3H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6.5 2c.83 0 1.5.67 1.5 1.5S12.33 8 11.5 8S10 7.33 10 6.5S10.67 5 11.5 5zM19 19H5V5h2v2h9V5h2v14z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-inventory"><path fill="currentColor" d="M3 15v3h3v-3H3zm0-4v3h3v-3H3zm0-4v3h3V7H3zm4 8v3h3v-3H7zm0-4v3h3v-3H7zm0-4v3h3V7H7zm11 11v-3h3v3h-3zm0-4v-3h3v3h-3zm0-4v-3h3v3h-3zm-4 4v-3h3v3h-3zm0-4v-3h3v3h-3zm0-4v-3h3v3h-3z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-invoice"><path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-3 16c-2.21 0-4-1.79-4-4s1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4zm-2-4c0 1.1.9 2 2 2s2-.9 2-2s-.9-2-2-2s-2 .9-2 2zM13 9V3.5L18.5 9H13z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-admin"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-close"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-requisition"><path fill="currentColor" d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-2 16H9v-2h6v2zm0-4H9v-2h6v2zm-4-4H9V9h2v2zm4-1h-4V5.5L16.5 9H15zM7 5h4v4H7V5z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-quality"><path fill="currentColor" d="M9 11.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25s1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25zm6 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25s1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8zm0-14c-1.79 0-3.4 1.17-3.86 2.84l.97.27C9.43 8.3 10.62 7.5 12 7.5s2.57.8 2.89 1.61l.97-.27C15.4 7.17 13.79 6 12 6zm-3.5 10c.67 1.2 1.99 2 3.5 2s2.83-.8 3.5-2H8.5z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-issue"><path fill="currentColor" d="M21 8c0-1.1-.9-2-2-2h-3V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v2H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8zM8 4h8v2H8V4zm13 16H3V8h3v2c0 .55.45 1 1 1s1-.45 1-1V8h8v2c0 .55.45 1 1 1s1-.45 1-1V8h3v12zM12 11l-4 4h3v3h2v-3h3l-4-4z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-reports"><path fill="currentColor" d="M4 11h6V5H4v6zm0 7h6v-6H4v6zm8 0h6v-6h-6v6zm0-7h6V5h-6v6zM3 21h18V3H3v18zM5 5h14v14H5V5z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-warehouse"><path fill="currentColor" d="M22 21V7L12 3L2 7v14h3v-7h3v7h3v-7h3v7h3v-7h3v7h2zM12 5.5l7 2.8v1.7H5v-1.7l7-2.8zM11 11H5v2h6v-2zm8 0h-6v2h6v-2z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-category"><path fill="currentColor" d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58c.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41c0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4S7 4.67 7 5.5S6.33 7 5.5 7z"/></symbol>
        {/* Icons specific to PO/GRN */}
        <symbol viewBox="0 0 24 24" id="icon-delete"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-edit"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-pdf"><path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm1 14h-2v2H9v-2H7v-4h2V8h2v4h2v4z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-csv"><path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-4 16l-3-4h2l1 1.33L13 14h2l-5 4zM13 9V3.5L18.5 9H13z"/></symbol>
        <symbol viewBox="0 0 24 24" id="icon-print"><path fill="currentColor" d="M19 8H5c-1.66 0-3 1.34-3 3v4h4v4h12v-4h4v-4c0-1.66-1.34-3-3-3zM7 19v-6h10v6H7zm10-10V3H7v6h10z"/></symbol>
    </svg>
  );
}

export { IconSprite };
