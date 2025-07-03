import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const GuestRoute = ({ children }) => {
  const { authUser } = useAuthStore();

  if (authUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
