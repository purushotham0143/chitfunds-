import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import { toast } from 'react-toastify';
//Add a global session check that works across the app, not just inside ProtectedRoute.
const SessionManager = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/protected`, {
          credentials: 'include',
        });

        if (res.status === 401) {
          toast.info(' Session expired. Please log in again.');
          setUser(null);
          localStorage.removeItem('user');
          navigate('/Login');
        }
      } catch (err) {
        console.error('Global session check failed:', err);
      }
    };

    // const interval = setInterval(checkSession, 60 * 1000); // check every 1 min
    const interval = setInterval(checkSession, 20 * 60 * 1000); // check every 20 minutes
    return () => clearInterval(interval); // cleanup
  }, []);

  return null; // No UI
};

export default SessionManager;
