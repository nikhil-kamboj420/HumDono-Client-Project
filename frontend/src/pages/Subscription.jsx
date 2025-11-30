import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Subscription() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect immediately to Lifetime Access page
    navigate('/subscription', { replace: true });
  }, [navigate]);

  return null;
}
