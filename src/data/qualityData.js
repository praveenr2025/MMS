// src/data/qualityData.js

export const initialData = {
    kpis: { pending: 12, rejectRate: '2.3%', qcLeadTime: '8.6 hrs', openCapas: 4 },
    queue: [
        { id: 1, grn: 'GRN-2025-0101', item: 'STL-BAR-10MM', desc: '10mm Reinforcement Steel Bar', qty: '5000 KG', sampling: 'Level II / AQL 1.0', plan: 'TP-STEEL-01', prio: 'High', date: '2025-10-30' },
        { id: 2, grn: 'GRN-2025-0101', item: 'STL-PLATE-5MM', desc: '5mm Mild Steel Plate', qty: '1000 SQM', sampling: 'Level II / AQL 1.0', plan: 'TP-STEEL-02', prio: 'Medium', date: '2025-10-30' },
        { id: 3, grn: 'GRN-2025-0102', item: 'ELEC-RTR-55', desc: 'Router Model 55-B', qty: '100 EA', sampling: 'Level I / AQL 0.65', plan: 'TP-ELEC-01', prio: 'High', date: '2025-11-01' },
        { id: 4, grn: 'GRN-2025-0102', item: 'ELEC-SW-24', desc: '24-Port Switch', qty: '50 EA', sampling: 'Level I / AQL 0.65', plan: 'TP-ELEC-02', prio: 'Low', date: '2025-11-01' }
    ],
    testPlans: [
        { no: 'TP-STEEL-01', item: 'STL-BAR-10MM', params: [{ name: 'Diameter', uom: 'mm', lsl: 9.9, usl: 10.1 }, { name: 'Yield Strength', uom: 'MPa', lsl: 400, usl: 500 }, { name: 'Rust', uom: 'Visual', lsl: 0, usl: 0 }], rev: 'B', status: 'Active' },
        { no: 'TP-ELEC-01', item: 'ELEC-RTR-55', params: [{ name: 'Voltage', uom: 'V', lsl: 4.75, usl: 5.25 }, { name: 'Power-On Self Test', uom: 'Pass/Fail', lsl: 1, usl: 1 }], rev: 'A', status: 'Active' }
    ],
    samplingPlans: [
        { no: 'SP-001', level: 'Level II', aql: '1.0', lot: '320-500', size: '50' },
        { no: 'SP-002', level: 'Level I', aql: '0.65', lot: '51-150', size: '13' }
    ],
    ncrs: [
        { no: 'NCR-2025-004', date: '2025-10-15', source: 'Incoming', link: 'GRN-2025-0092 / STL-BAR-10MM', defect: 'Diameter Out of Spec', status: 'Open' },
        { no: 'NCR-2025-005', date: '2025-10-28', source: 'In-Process', link: 'JOB-104 / WLD-ASSY', defect: 'Weld Spatter', status: 'Under Review' }
    ],
    capas: [
        { no: 'CAPA-2025-002', ncr: 'NCR-2025-004', owner: 'qc.lead@company.com', due: '2025-11-10', stage: 'D4 Root Cause', status: 'Open' }
    ],
    vendors: [
        { name: 'Global Steel Ltd.', lots: 18, rej: 1, ppm: 55555, otd: '96%', score: 'A-' },
        { name: 'Techtronics Inc.', lots: 12, rej: 0, ppm: 0, otd: '98%', score: 'A+' }
    ],
    holds: [
        { link: 'GRN-2025-0101 / STL-BAR-10MM', qty: '5000 KG', reason: 'Awaiting chemical test', disp: '—', status: 'On Hold' }
    ],
    calib: [
        { inst: 'Vernier Caliper', serial: 'VC-5541', last: '2025-05-11', next: '2026-05-10', status: 'Valid' },
        { inst: 'UTM', serial: 'UTM-221', last: '2025-03-01', next: '2025-12-01', status: 'Due Soon' }
    ],
    audit: [
        { ts: '2025-11-01 10:11', user: 'admin', act: 'Create GRN', ent: 'GRN-2025-0102', det: '2 lines' },
        { ts: '2025-11-01 14:02', user: 'qc.lead', act: 'Accept Lot', ent: 'GRN-2025-0102 / ELEC-RTR-55', det: 'Moved to WH-A/R1' }
    ]
};