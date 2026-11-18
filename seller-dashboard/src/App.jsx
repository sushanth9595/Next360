import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SellerLogin from "./pages/SellerLogin";
import Dashboard from "./pages/Dashboard";
import SellerProfile from "./pages/SellerProfile";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Earnings from "./pages/Earnings";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Seller Login */}
                <Route
                    path="/login"
                    element={<SellerLogin />}
                />

                {/* Seller Dashboard */}
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                {/* Default */}
                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />
                <Route
    path="/profile"
    element={<SellerProfile />}
/>
<Route
    path="/products"
    element={<Products />}
/>
<Route path="/orders" element={<Orders />} />

<Route path="/earnings" element={<Earnings />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;