import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      // Make API call to login endpoint
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, { 
        email, 
        password 
      });
      
      // Optional: Store authentication token in localStorage
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
      console.log(res.data);

      // Navigate to home page after successful login
      setTimeout(() => {
        navigate('/home');
      }, 2000);

    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Login failed. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-6xl mx-auto lg:grid lg:grid-cols-2 gap-10">
        
        {/* Left Side: Illustration & Welcome Text */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center p-8">
          <div className="w-full max-w-md transform transition-transform duration-500 hover:scale-105">
            <img 
              src="https://placehold.co/600x600/1a202c/718096?text=Welcome%0ABack" 
              alt="Abstract illustration representing security and authentication" 
              className="rounded-2xl shadow-2xl shadow-purple-500/20 object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x600/1a202c/718096?text=Image+Error'; }}
            />
          </div>
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-purple-400">Welcome Back!</h1>
          <p className="mt-4 text-lg text-gray-400">Log in to access your dashboard and continue where you left off.</p>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl shadow-2xl">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white">Login to Your Account</h2>
              <p className="mt-2 text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>
          
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-all duration-300 ease-in-out disabled:bg-indigo-400 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : 'Login'}
                </button>
              </div>
              {message.text && (
                <p className={`text-sm text-center font-medium ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                  {message.text}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
