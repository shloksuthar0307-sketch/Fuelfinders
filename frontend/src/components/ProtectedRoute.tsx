import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../lib/api';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in ms

export const ProtectedRoute = () => {
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const logout = () => {
      setAuthToken(null);
      navigate('/admin/login', { replace: true });
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(logout, INACTIVITY_TIMEOUT);
    };

    // Initialize the timer
    resetTimer();

    // Throttle activity events to once per second for performance
    let throttled = false;
    const handleActivity = () => {
      if (!throttled) {
        resetTimer();
        throttled = true;
        setTimeout(() => { throttled = false; }, 1000);
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [token, navigate]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <Outlet />;
};
