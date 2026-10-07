import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import Navbar from '../components/Navbar';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async ({ email, password, fullName }) => {
    setLoading(true);
    setError('');
    try {
      await register(email, password, fullName);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.error || err.message || 'Registration failed. Please check inputs.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <AuthForm
          mode="register"
          onSubmit={handleRegister}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
