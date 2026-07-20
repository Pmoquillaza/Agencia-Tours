import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requireAdmin = false }) => {

    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("usuario");
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (!token) {

        return <Navigate to="/login" />;

    }

    if (requireAdmin && user?.rol !== "admin") {

        return <Navigate to="/dashboard" />;

    }

    return children;

};

export default ProtectedRoute;
