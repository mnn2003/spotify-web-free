import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Music2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, register, isLoading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };
  
  const handleSkip = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Music2 size={40} className="text-green-500" />
            <span className="text-3xl font-bold text-white">Musicify</span>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            {isRegister ? 'Create an account' : 'Log in to Musicify'}
          </h1>
          
          {error && (
            <div className="bg-red-900/20 border border-red-900 text-red-200 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Your name"
                  required={isRegister}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Email address"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-green-500 text-black font-medium py-3 rounded-full hover:bg-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isRegister ? 'Sign up' : 'Log in'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              className="text-green-500 hover:underline focus:outline-none"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button
              className="text-gray-400 hover:underline focus:outline-none"
              onClick={handleSkip}
            >
              Continue without logging in
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>This is a demo application. No real authentication is implemented.</p>
            <p className="mt-1">Use any email and password to log in.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;