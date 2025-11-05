// src/data/materialData.js

const storeKey = 'mms_materials_v1';

const initialDB = {
    categories: ['Raw Material', 'Chemicals', 'Packaging', 'Consumables', 'Finished Goods'],
    suppliers: ['Global Steel Ltd.', 'Apex Office Supplies', 'Techtronics Inc.', 'National Polymers'],
    materials: [
        {
            code: 'HR-101', desc: 'Hot Rolled Coil', cat: 'Raw Material', uom: 'MT', rol: 5, onhand: 12, intransit: 3, track: 'None', status: 'Active',
            inv: { wh: [{ wh: 'Main WH - Jaipur', bin: 'A1', on: 8, res: 2 }, { wh: 'Plant WH - Pune', bin: 'B5', on: 4, res: 0 }], lead: 14, min: 5, max: 20 },
            sup: [{ name: 'Global Steel Ltd.', lead: 14, last: 700, cur: 'USD' }],
            pricing: { std: 680, last: 700, cur: 'USD', mrp: 0 },
            compliance: { hsn: '720839', gst: '18%', haz: '', msds: 'No', exp: 0 },
            flags: { haz: false, batch: false, serial: false }
        },
        {
            code: 'ZINC-PL', desc: 'Zinc Plating Chemical', cat: 'Chemicals', uom: 'KG', rol: 50, onhand: 40, intransit: 20, track: 'Batch', status: 'Active',
            inv: { wh: [{ wh: 'Chem Store - Pune', bin: 'C2', on: 40, res: 5 }], lead: 10, min: 50, max: 200 },
            sup: [{ name: 'National Polymers', lead: 10, last: 10, cur: 'USD' }],
            pricing: { std: 9.5, last: 10, cur: 'USD', mrp: 0 },
            compliance: { hsn: '281700', gst: '18%', haz: 'UN 3082', msds: 'Yes', exp: 365 },
            flags: { haz: true, batch: true, serial: false }
        },
        {
            code: 'PP-GRAN', desc: 'PP Granules', cat: 'Raw Material', uom: 'KG', rol: 500, onhand: 420, intransit: 0, track: 'None', status: 'Active',
            inv: { wh: [{ wh: 'Main WH - Jaipur', bin: 'A3', on: 420, res: 60 }], lead: 7, min: 400, max: 1200 },
            sup: [{ name: 'National Polymers', lead: 7, last: 15.254, cur: 'INR' }],
            pricing: { std: 15.0, last: 15.254, cur: 'INR', mrp: 0 },
            compliance: { hsn: '390210', gst: '18%', haz: '', msds: 'No', exp: 0 },
            flags: { haz: false, batch: false, serial: false }
        },
        {
            code: 'LABEL-4x6', desc: 'Thermal Label 4x6 inch', cat: 'Packaging', uom: 'BOX', rol: 10, onhand: 8, intransit: 0, track: 'None', status: 'Active',
            inv: { wh: [{ wh: 'Main WH - Jaipur', bin: 'PACK-01', on: 8, res: 0 }], lead: 5, min: 10, max: 40 },
            sup: [{ name: 'Apex Office Supplies', lead: 5, last: 350, cur: 'INR' }],
            pricing: { std: 340, last: 350, cur: 'INR', mrp: 0 },
            compliance: { hsn: '481141', gst: '12%', haz: '', msds: 'No', exp: 0 },
            flags: { haz: false, batch: false, serial: false }
        }
    ]
};

function getDB() {
    const s = localStorage.getItem(storeKey);
    if (s) return JSON.parse(s);
    localStorage.setItem(storeKey, JSON.stringify(initialDB));
    return initialDB;
}

function setDB(db) {
    localStorage.setItem(storeKey, JSON.stringify(db));
}

export { getDB, setDB, initialDB };