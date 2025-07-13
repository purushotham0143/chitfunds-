// components/ProtectedRoute.tsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../Pagess/UserContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
