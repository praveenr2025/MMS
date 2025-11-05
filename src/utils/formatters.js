// src/utils/formatters.js

/**
 * Formats a number as currency string with appropriate symbol.
 * Assumes USD default.
 */
export const fmtMoney = (n, cur) => {
    const v = Number(n || 0);
    const symbol = cur === 'INR' ? '₹' : cur === 'EUR' ? '€' : cur === 'SGD' ? 'S$' : '$';
    return symbol + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Returns the CSS class for status pills.
 */
export const pillColor = (status) => {
    if (status === 'Active' || status === 'Approved' || status === 'Received' || status === 'Matched' || status === 'Success' || status === 'Trusted' || status === 'Valid') return 'ok';
    if (status === 'Pending' || status === 'Partially Received' || status === 'Draft' || status === 'Pending Approval' || status === 'Expiring' || status === 'Review' || status === 'Unverified') return 'warn';
    if (status === 'Blocked (SoD)' || status === 'Rejected' || status === 'On Hold' || status === 'Cancelled' || status === 'Inactive') return 'bad';
    return 'blue'; // Default for system actions/information
};