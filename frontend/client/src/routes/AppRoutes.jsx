import {
    lazy,
    Suspense
} from "react";

import {

    BrowserRouter,
    Routes,
    Route

} from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";

const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Reservations = lazy(() => import("../pages/Reservations"));
const Tours = lazy(() => import("../pages/Tours"));
const TourDetail = lazy(() => import("../pages/TourDetail"));
const Travelers = lazy(() => import("../pages/Travelers"));
const HotelSelection = lazy(() => import("../pages/HotelSelection"));
const TransportSelection = lazy(() => import("../pages/TransportSelection"));
const ReservationSummary = lazy(() => import("../pages/ReservationSummary"));
const PaymentWrapper = lazy(() => import("../pages/PaymentWrapper"));
const Confirm = lazy(() => import("../pages/Confirm"));
const Register = lazy(() => import("../pages/Register"));
const Profile = lazy(() => import("../pages/Profile"));
const AdminTours = lazy(() => import("../pages/AdminTours"));
const AdminHotels = lazy(() => import("../pages/AdminHotels"));
const AdminTransports = lazy(() => import("../pages/AdminTransports"));

const renderPage = (Page) => (
    <Suspense
        fallback={
            <div className="route-loading" role="status">
                Cargando...
            </div>
        }
    >
        <Page />
    </Suspense>
);

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
                    element={renderPage(Login)}
                />

                <Route
                    path="/home"
                    element={<Home />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>

                            {renderPage(Dashboard)}

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>

                            {renderPage(Profile)}

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/tours"
                    element={
                        <ProtectedRoute requireAdmin>

                            {renderPage(AdminTours)}

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/hotels"
                    element={
                        <ProtectedRoute requireAdmin>

                            {renderPage(AdminHotels)}

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/transports"
                    element={
                        <ProtectedRoute requireAdmin>

                            {renderPage(AdminTransports)}

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/reservations"
                    element={
                        <ProtectedRoute>

                            {renderPage(Reservations)}

                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/tours"
                    element={renderPage(Tours)}
                />

                <Route
                    path="/tours/:id"
                    element={renderPage(TourDetail)}
                />
                <Route
                    path="/travelers/:reservationId"
                    element={renderPage(Travelers)}
                />

                <Route
                    path="/payment/:reservationId"
                    element={renderPage(PaymentWrapper)}
                />

                <Route
                    path="/transport-selection"
                    element={renderPage(TransportSelection)}
                />

                <Route path="/hotel-selection"
                    element={renderPage(HotelSelection)}
                />

                <Route path="/reservation-summary"
                    element={renderPage(ReservationSummary)}
                />
                <Route
                    path="/confirm"
                    element={renderPage(Confirm)}
                />
                <Route
                    path="/register"
                    element={renderPage(Register)}
                />

            </Routes>

        </BrowserRouter>

    );

};

export default AppRoutes;
