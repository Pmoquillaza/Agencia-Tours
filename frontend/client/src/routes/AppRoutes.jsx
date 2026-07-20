import {

    BrowserRouter,
    Routes,
    Route

} from "react-router-dom";

import Login from "../pages/Login";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Reservations from "../pages/Reservations";
import ProtectedRoute from "../components/ProtectedRoute";
import Tours from "../pages/Tours";
import TourDetail from "../pages/TourDetail";
import Travelers from "../pages/Travelers";
import HotelSelection from "../pages/HotelSelection";
import TransportSelection from "../pages/TransportSelection";
import ReservationSummary from "../pages/ReservationSummary";
import PaymentWrapper from "../pages/PaymentWrapper";
import Confirm from "../pages/Confirm";
import Register from "../pages/Register";
import Profile from "../pages/Profile";
import AdminTours from "../pages/AdminTours";
import AdminHotels from "../pages/AdminHotels";
import AdminTransports from "../pages/AdminTransports";

const AppRoutes = () => {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/home"
                    element={<Home />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>

                            <Dashboard />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>

                            <Profile />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/tours"
                    element={
                        <ProtectedRoute requireAdmin>

                            <AdminTours />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/hotels"
                    element={
                        <ProtectedRoute requireAdmin>

                            <AdminHotels />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/transports"
                    element={
                        <ProtectedRoute requireAdmin>

                            <AdminTransports />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/reservations"
                    element={
                        <ProtectedRoute>

                            <Reservations />

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/tours"
                    element={<Tours />}
                />

                <Route
                    path="/tours/:id"
                    element={<TourDetail />}
                />
                <Route
                    path="/travelers/:reservationId"
                    element={<Travelers />}
                />

                <Route
                    path="/payment/:reservationId"
                    element={<PaymentWrapper />}
                />

                <Route
                    path="/transport-selection"
                    element={<TransportSelection />}
                />

                <Route path="/hotel-selection"
                    element={<HotelSelection />}
                />

                <Route path="/reservation-summary"
                    element={<ReservationSummary />}
                />
                <Route
                    path="/confirm"
                    element={<Confirm />}
                />
                <Route
                    path="/register"
                    element={<Register />}
                />

            </Routes>

        </BrowserRouter>

    );

};

export default AppRoutes;
