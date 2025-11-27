import React, { useState } from "react";
import { AuthCredentials } from "../../core/domain/auth/AuthCredentials";
import { useAuth } from "../../infrastructure/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const credentials = new AuthCredentials(username, password);
    const user = await login(credentials);

    if (user) {
      navigate('/');
    } else {
      setErrorMsg('Credenciales incorrectas. Intenta de nuevo.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-indigo-900 to-emerald-900 overflow-hidden">
      {/* Glassmorphism shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-700 opacity-30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600 opacity-30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white opacity-10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 -z-10"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-black/70 backdrop-blur-lg shadow-2xl rounded-3xl px-10 py-12 w-full max-w-md flex flex-col items-center space-y-6 border border-white/10"
      >
        <FaUserCircle className="text-emerald-400 text-6xl mb-2 drop-shadow-lg" />
        <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Iniciar sesión</h2>
        <p className="text-gray-400 mb-4 text-center">Bienvenido a <span className="font-bold text-emerald-400">KPIs Management</span></p>

        <div className="w-full flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">Usuario</label>
          <input
            type="text"
            className="border border-gray-700 bg-black/60 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            placeholder="Tu usuario"
          />
        </div>

        <div className="w-full flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">Contraseña</label>
          <input
            type="password"
            className="border border-gray-700 bg-black/60 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        {errorMsg && (
          <div className="w-full text-center text-red-400 bg-red-900/30 border border-red-700 rounded-lg py-2 px-3 text-sm">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-2 bg-gradient-to-r from-emerald-500 to-indigo-700 hover:from-indigo-700 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-700"
        >
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
        <div className="text-xs text-gray-500 mt-2">© {new Date().getFullYear()} KPIs Management</div>
      </form>
    </div>
  );
};