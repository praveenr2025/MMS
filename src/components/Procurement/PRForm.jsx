// src/components/Procurement/PRForm.jsx

// 🛑 FIX: Ensure useEffect is imported here along with useState, useMemo, useCallback
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getPrState, setPrState} from '../../data/prData'; // Assuming helper functions
import { fmtMoney } from '../../utils/formatters'; // Assuming fmtMoney is available
import { uid, nextSLA, todayISO } from '../../data/prData'; // Replicate helper functions

// --- Line Item Row Component (Inner Helper) ---
function LineItemRow({ index, line, onUpdate, onDelete }) {
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const processedValue = type === 'number' ? parseFloat(value || 0) : value;
        onUpdate(index, name, processedValue);
    };

    const lineTotal = line.qty * line.price * (1 + line.tax / 100);

    return (
        <tr>
            <td className="font-bold">{index + 1}</td>
            <td><input className="input" name="code" value={line.code} onInput={handleInputChange} /></td>
            <td><input className="input" name="desc" value={line.desc} onInput={handleInputChange} /></td>
            <td><input className="input" name="uom" value={line.uom} onInput={handleInputChange} style={{ width: '90px' }} /></td>
            <td><input className="input" type="number" min="0" name="qty" value={line.qty} onInput={handleInputChange} /></td>
            <td><input className="input" type="number" min="0" step="0.01" name="price" value={line.price} onInput={handleInputChange} /></td>
            <td><input className="input" type="number" min="0" name="tax" value={line.tax} onInput={handleInputChange} /></td>
            <td className="font-bold">{fmtMoney(lineTotal, 'INR')}</td>
            <td className="flex gap-2">
                <button className="btn subtle" type="button" onClick={() => alert('Open Catalog (Demo)')}><i data-lucide="search"></i></button>
                <button className="btn bad" type="button" onClick={() => onDelete(index)}><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    );
}

// --- Main PR Form Component ---
function PRForm({ prState, setPrState, refreshAll }) {
    const [header, setHeader] = useState({
        prTitle: '', dept: 'IT', requester: 'shailendra.chauhan', reqBy: todayISO(),
        budget: 'IT-CAPEX-2025', priority: 'Normal', capex: 'OPEX',
        split: '', just: '', watchers: '', deliverTo: 'Main Warehouse', gstin: '',
    });
    const [draftLines, setDraftLines] = useState(prState.draftLines);
    const [currentQuotes, setCurrentQuotes] = useState(prState.quotes);

    // Calculations
    const { subTotal, taxTotal, grandTotal } = useMemo(() => {
        let sub = 0;
        let tax = 0;
        draftLines.forEach(ln => {
            const lineSub = (ln.qty || 0) * (ln.price || 0);
            sub += lineSub;
            tax += lineSub * (ln.tax / 100 || 0);
        });
        return { subTotal: sub, taxTotal: tax, grandTotal: sub + tax };
    }, [draftLines]);

    // Validation Rules (Mapped from the HTML form checkboxes/logic)
    const validationRules = {
        justification: true, // Assuming default is checked
        budget: true,
        date: true,
        quotes: false, // Start false, dynamically set by quotes attached
    };

    // --- Core Handlers ---
    const handleHeaderChange = (e) => {
        setHeader(prev => ({ ...prev, [e.target.id.replace('pr', '')]: e.target.value }));
    };

    const handleLineUpdate = (index, key, value) => {
        setDraftLines(prev => prev.map((line, i) => i === index ? { ...line, [key]: value } : line));
    };

    const handleDeleteRow = (index) => {
        setDraftLines(prev => prev.filter((_, i) => i !== index));
    };


    const validatePR = useCallback((isSubmit) => {
        const errs = [];
        if (!header.prTitle) errs.push('PR Title is required');
        if (validationRules.justification && !header.just) errs.push('Business Justification is required');
        if (draftLines.length === 0) errs.push('At least one line item is required');
        
        // Budget Check (Mock)
        if (validationRules.budget && (prState.budgetUsed + grandTotal) > prState.budgetLimit) {
            errs.push('Budget exceeded');
        }
        
        // Quotes Policy Check (Mock: >= ₹1,00,000 requires >= 2 quotes)
        if (grandTotal >= 100000 && validationRules.quotes && currentQuotes.length < 2) {
            errs.push('Attach at least 2 quotes (policy)');
        }

        if (isSubmit && errs.length > 0) {
            alert('Please fix:\n- ' + errs.join('\n- '));
            return false;
        }
        return { amount: grandTotal };
    }, [header, draftLines, grandTotal, prState.budgetUsed, prState.budgetLimit, currentQuotes, validationRules.justification, validationRules.budget, validationRules.quotes]);
    
    // Approval Route Preview (Mock logic replication)
    const buildApprovalPreview = useCallback(() => {
        const amount = grandTotal;
        let route = ['Dept Head'];
        if (amount >= 100000) route.push('Procurement');
        if (amount >= 500000) route.push('Finance');
        if (amount >= 1000000) route.push('C-Level'); 
        return route;
    }, [grandTotal]);


    const submitPR = (status) => {
        const validationResult = validatePR(true);
        if (!validationResult) return;
        
        // ... (PR build logic omitted for brevity)
        // ... (Update state and persistence logic omitted for brevity)
        
        alert(`${status === 'Draft' ? 'Draft saved' : 'Submitted'} successfully! (Demo)`);
    };
    
    // Line 138: Initialize required date with today + 7 days
    useEffect(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        setHeader(prev => ({ ...prev, reqBy: d.toISOString().slice(0, 10) }));
        
        // Initialize Lucide Icons after the component mounts/updates
        if (window.lucide) window.lucide.createIcons();
    }, []);


    // Simplified initial state of the form to match the component's needs
    const initialForm = {
        header: {
            prTitle: '', dept: 'IT', requester: 'shailendra.chauhan', reqBy: todayISO(),
            budget: 'IT-CAPEX-2025', priority: 'Normal', capex: 'OPEX',
            split: '', just: '', watchers: '', deliverTo: 'Main Warehouse', gstin: '',
        },
        draftLines: [{ code: 'LT-14-16GB', desc: 'Laptop 14" 16GB/512GB', uom: 'Nos', price: 78000, qty: 1, tax: 18 }],
    };
    
    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold">Create Requisition</h2>
                <div className="flex gap-2">
                    <button className="btn subtle" onClick={() => alert('Save as Template (Demo)')}><i data-lucide="save"></i> Save as Template</button>
                    <button className="btn subtle" onClick={() => alert('Load Template (Demo)')}><i data-lucide="folder-open"></i> Load Template</button>
                    <button className="btn subtle" onClick={() => submitPR('Draft')}><i data-lucide="file"></i> Save Draft</button>
                    <button className="btn" onClick={() => submitPR('Submit')}><i data-lucide="send"></i> Submit</button>
                </div>
            </div>

            <div className="mt-4 grid-auto">
                <div><label className="text-sm font-semibold">PR Title</label><input id="prTitle" className="input" placeholder="e.g., Laptops for Data Team" value={header.prTitle} onChange={handleHeaderChange} /></div>
                <div><label className="text-sm font-semibold">Department</label><select id="prDept" className="input" value={header.dept} onChange={handleHeaderChange}><option>IT</option><option>Operations</option><option>Finance</option></select></div>
                <div><label className="text-sm font-semibold">Requester</label><input id="prRequester" className="input" value="shailendra.chauhan" disabled /></div>
                <div><label className="text-sm font-semibold">Required By</label><input id="prReqDate" className="input" type="date" value={header.reqBy} onChange={handleHeaderChange} /></div>
                <div><label className="text-sm font-semibold">Budget Code</label><select id="prBudget" className="input" value={header.budget} onChange={handleHeaderChange}><option>IT-CAPEX-2025</option><option>OPS-OPEX-2025</option></select></div>
                <div><label className="text-sm font-semibold">Priority</label><select id="prPriority" className="input" value={header.priority} onChange={handleHeaderChange}><option>Normal</option><option>High</option><option>Urgent</option></select></div>
                <div><label className="text-sm font-semibold">CAPEX vs OPEX</label><select id="prCapex" className="input" value={header.capex} onChange={handleHeaderChange}><option>OPEX</option><option>CAPEX</option></select></div>
                <div><label className="text-sm font-semibold">Cost Center Split (%)</label><input id="prSplit" className="input" placeholder="e.g., CC-101:60, CC-205:40" value={header.split} onChange={handleHeaderChange} /></div>
                <div className="md:col-span-2"><label className="text-sm font-semibold">Business Justification</label><textarea id="prJust" className="input" rows="3" placeholder="Describe the need, ROI, and risks of not procuring." value={header.just} onChange={handleHeaderChange}></textarea></div>
                <div className="md:col-span-2"><label className="text-sm font-semibold">Watchers</label><input id="prWatchers" className="input" placeholder="Comma-separated emails (optional)" value={header.watchers} onChange={handleHeaderChange} /></div>
                <div><label className="text-sm font-semibold">Deliver To (Address)</label><input id="prDeliverTo" className="input" placeholder="Site/Plant & address" value={header.deliverTo} onChange={handleHeaderChange} /></div>
                <div><label className="text-sm font-semibold">GSTIN</label><input id="prGSTIN" className="input" placeholder="27ABCDE1234F1Z5" value={header.gstin} onChange={handleHeaderChange} /></div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn ghost" type="button" onClick={() => alert('Open Catalog (Demo)')}><i data-lucide="search"></i> Item Catalog</button>
                <button className="btn subtle" type="button" onClick={() => alert('Open RFQ Modal (Demo)')}><i data-lucide="file-search-2"></i> Vendor Quotes</button>
                <span className="hint">Use catalog to pick SKUs; attach & compare 3 quotes for policy compliance.</span>
            </div>

            <div className="mt-4">
                <div className="flex items-center justify-between">
                    <div className="font-bold text-lg">Line Items</div>
                    <div className="flex gap-2">
                        <button className="btn ghost" type="button" onClick={() => handleLineUpdate(draftLines.length, 'code', '')}><i data-lucide="plus"></i> Add Line</button>
                        <button className="btn subtle" type="button" onClick={() => alert('Import CSV (Demo)')}><i data-lucide="upload"></i> Import CSV</button>
                        <button className="btn subtle" type="button" onClick={() => alert('Export CSV (Demo)')}><i data-lucide="download"></i> Export CSV</button>
                    </div>
                </div>
                <div className="overflow-auto mt-3 border border-[var(--border)] rounded-xl">
                    <table className="table" id="linesTable">
                        <thead><tr><th>#</th><th>Item Code</th><th>Description</th><th>UoM</th><th>Qty</th><th>Unit Price</th><th>Tax %</th><th>Total</th><th></th></tr></thead>
                        <tbody>
                            {draftLines.map((line, index) => (
                                <LineItemRow
                                    key={index}
                                    index={index}
                                    line={line}
                                    onUpdate={handleLineUpdate}
                                    onDelete={handleDeleteRow}
                                />
                            ))}
                        </tbody>
                        <tfoot>
                            <tr><td colSpan="7" className="text-right font-bold">SubTotal</td><td id="subTotal">{fmtMoney(subTotal, 'INR')}</td><td></td></tr>
                            <tr><td colSpan="7" className="text-right font-bold">Tax</td><td id="taxTotal">{fmtMoney(taxTotal, 'INR')}</td><td></td></tr>
                            <tr><td colSpan="7" className="text-right font-extrabold">Grand Total</td><td id="grandTotal" className="font-extrabold">{fmtMoney(grandTotal, 'INR')}</td><td></td></tr>
                        </tfoot>
                    </table>
                </div>
                <div className="hint mt-2">Policy: ≥ ₹1,00,000 requires ≥ 2 quotes; ≥ ₹10,00,000 requires Finance review.</div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-3">
                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <div className="font-bold">Approval Route (Preview)</div>
                        <button className="btn subtle" type="button" onClick={() => alert('Open Matrix Modal (Demo)')}><i data-lucide="sliders"></i> Edit Matrix</button>
                    </div>
                    <ol id="approvalPreview" className="list-decimal pl-6 text-sm mt-2 text-[var(--muted)]">
                        {buildApprovalPreview().map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                </div>
                <div className="card p-4">
                    <div className="font-bold mb-1">Budget Check</div>
                    <div id="budgetMsg" className="text-sm text-[var(--muted)]">
                        {grandTotal > prState.budgetLimit ? 
                            <span className="pill bad">Budget Exceeded!</span> :
                            <span className="pill ok">Within Budget ({fmtMoney(prState.budgetLimit - prState.budgetUsed - grandTotal, 'INR')} remaining)</span>
                        }
                    </div>
                    <div className="mt-2"><span className="tag">Rules: justification required • future date • budget cannot exceed</span></div>
                </div>
            </div>
        </>
    );
}

export default PRForm;