import { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Sellers from "./pages/Sellers";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Disputes from "./pages/Disputes";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        Boolean(
            localStorage.getItem(
                "next360-token"
            )
        )
    );

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/login"
                    element={
                        isLoggedIn ? (
                            <Navigate to="/" replace />
                        ) : (
                            <AdminLogin
                                setIsLoggedIn={
                                    setIsLoggedIn
                                }
                            />
                        )
                    }
                />

                <Route
                    path="/"
                    element={
                        isLoggedIn ? (
                            <Dashboard />
                        ) : (
                            <Navigate
                                to="/login"
                                replace
                            />
                        )
                    }
                />

                <Route
                    path="/sellers"
                    element={
                        isLoggedIn ? (
                            <Sellers />
                        ) : (
                            <Navigate
                                to="/login"
                                replace
                            />
                        )
                    }
                />

                <Route
                    path="/products"
                    element={
                        isLoggedIn ? (
                            <Products />
                        ) : (
                            <Navigate
                                to="/login"
                                replace
                            />
                        )
                    }
                />

                <Route
                    path="/orders"
                    element={
                        isLoggedIn ? (
                            <Orders />
                        ) : (
                            <Navigate
                                to="/login"
                                replace
                            />
                        )
                    }
                />
                <Route
    path="/disputes"
    element={
        isLoggedIn ? (
            <Disputes />
        ) : (
            <Navigate
                to="/login"
                replace
            />
        )
    }
/>

                <Route
                    path="*"
                    element={
                        <Navigate
                            to={
                                isLoggedIn
                                    ? "/"
                                    : "/login"
                            }
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;