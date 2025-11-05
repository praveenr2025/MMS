// src/data/mivData.js

// Mock Inventory Data (simulating Materials Master + Stock Levels)
export const mockInventory = {
    "STL-BAR-10MM": { desc: "10mm Reinforcement Steel Bar", uom: "KG", avail: 5000, locations: ["WH-A / Rack-01", "WH-A / Rack-02", "Store-01"], batch: true },
    "STL-PLATE-5MM": { desc: "5mm Mild Steel Plate", uom: "Each", avail: 1000, locations: ["WH-A / Rack-03", "Store-02"], batch: false },
    "ELEC-RTR-55": { desc: "Router Model 55-B", uom: "Each", avail: 120, locations: ["WH-A / Rack-01"], batch: true },
    "ELEC-SW-24": { desc: "24-Port Network Switch", uom: "Each", avail: 60, locations: ["WH-A / Rack-01", "Store-03"], batch: false },
    "PPR-A4-75GSM": { desc: "A4 Copier Paper 75GSM", uom: "Ream", avail: 180, locations: ["Store-Office"], batch: false }
};

// Mock MIV List
export const initialMIVS = [
    {
        no: "MIV-2025-0051", type: "Department", dept: "Workshop", to: "Mark Smith", date: "2025-10-31", status: "Issued",
        cc: "CC-2001", wbs: "", reason: "Routine tools", remarks: "Urgent",
        files: ["workshop_req.pdf"],
        items: [
            { code: "ELEC-RTR-55", desc: mockInventory["ELEC-RTR-55"].desc, avail: 120, qty: 2, uom: "Each", batch: "B-RT-221", loc: "WH-A / Rack-01" },
            { code: "ELEC-SW-24", desc: mockInventory["ELEC-SW-24"].desc, avail: 60, qty: 1, uom: "Each", batch: "", loc: "WH-A / Rack-01" }
        ],
        audit: ["Draft by admin@company.com on 2025-10-31 09:10", "Approved by manager@company.com on 2025-10-31 10:00", "Issued by store@company.com on 2025-10-31 10:15"]
    },
    {
        no: "MIV-2025-0050", type: "Department", dept: "Production", to: "Robert Chen", date: "2025-10-29", status: "Issued",
        cc: "CC-1002", wbs: "WO-7781", reason: "For WO-7781", remarks: "",
        files: [],
        items: [
            { code: "STL-BAR-10MM", desc: mockInventory["STL-BAR-10MM"].desc, avail: 5000, qty: 300, uom: "KG", batch: "Heat-HR-4432", loc: "WH-A / Rack-01" },
            { code: "STL-PLATE-5MM", desc: mockInventory["STL-PLATE-5MM"].desc, avail: 1000, qty: 20, uom: "Each", batch: "", loc: "WH-A / Rack-03" }
        ],
        audit: ["Draft by admin@company.com on 2025-10-28 16:40", "Approved by manager@company.com on 2025-10-28 17:30", "Issued by store@company.com on 2025-10-29 09:00"]
    }
];

// Utility to generate unique MIV number (simplified)
export const genMivNumber = (currentLength) => `MIV-2025-00${60 + currentLength + 1}`;

// Persistence functions (simplified)
const MIV_STORE_KEY = 'mms_mivs_v1';
export function getMIVS() {
    const s = localStorage.getItem(MIV_STORE_KEY);
    if (s) return JSON.parse(s);
    localStorage.setItem(MIV_STORE_KEY, JSON.stringify(initialMIVS));
    return initialMIVS;
}
export function setMIVS(mivs) {
    localStorage.setItem(MIV_STORE_KEY, JSON.stringify(mivs));
}