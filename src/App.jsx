// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { MainHeader } from './components/MainHeader';
import { PageContainer } from './components/PageContainer';
import { IconSprite } from './components/IconSprite';

// Import all placeholder components
import Dashboard from './pages/Dashboard';
import Requisitions from './pages/Requisitions';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import Materials from './pages/Materials';
import GRN from './pages/GRN';
import Quality from './pages/Quality';
import Inventory from './pages/Inventory';
import Issue from './pages/Issue';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Warehouses from './pages/Warehouses';
import Categories from './pages/Categories';

// Utility component to wrap content with header/footer
function Layout({ children, pageTitle }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <MainHeader pageTitle={pageTitle} />
                <PageContainer>
                    {children}
                </PageContainer>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router basename="/mms">
          <IconSprite />
            <Routes>
                {/* 1. Procurement */}
               <Route path="/requisitions" element={<Layout pageTitle="Purchase Requisitions"><Requisitions /></Layout>} />
                <Route path="/suppliers" element={<Layout pageTitle="Suppliers"><Suppliers /></Layout>} />
                <Route path="/purchase-orders" element={<Layout pageTitle="Purchase Orders"><PurchaseOrders /></Layout>} />

                {/* 2. Inventory */}
                <Route path="/materials" element={<Layout pageTitle="Materials Master"><Materials /></Layout>} />
                <Route path="/grn" element={<Layout pageTitle="Goods Received (GRN)"><GRN /></Layout>} />
                <Route path="/quality" element={<Layout pageTitle="Quality Inspection"><Quality /></Layout>} />
                <Route path="/inventory" element={<Layout pageTitle="Stock Levels"><Inventory /></Layout>} />
                <Route path="/issue" element={<Layout pageTitle="Stock Issuance (MIV)"><Issue /></Layout>} />

                {/* 3. Finance / Reporting */}
                <Route path="/invoices" element={<Layout pageTitle="Invoices"><Invoices /></Layout>} />
                <Route path="/reports" element={<Layout pageTitle="All Reports"><Reports /></Layout>} />

                {/* 4. Administration */}
                <Route path="/admin" element={<Layout pageTitle="User Management"><Admin /></Layout>} />
                <Route path="/warehouses" element={<Layout pageTitle="Warehouses"><Warehouses /></Layout>} />
                <Route path="/categories" element={<Layout pageTitle="Material Categories"><Categories /></Layout>} />

                {/* Default/Dashboard Route */}
                <Route path="/" element={<Layout pageTitle="Dashboard"><Dashboard /></Layout>} />
                <Route path="/index" element={<Layout pageTitle="Dashboard"><Dashboard /></Layout>} />
            </Routes>
        </Router>
    );
}

export default App;
