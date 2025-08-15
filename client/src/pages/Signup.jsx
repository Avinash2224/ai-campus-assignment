import React, { useState } from 'react';
// In a real app, you would use 'axios'
// import axios from 'axios';
// In a real app, you would use 'react-router-dom' for navigation
// import { Link, useNavigate } from 'react-router-dom';

// Mock axios for demonstration purposes
const axios = {
  post: (url, data) => {
    return new Promise((resolve, reject) => {
      console.log('Mock POST request to:', url, data);
      if (data.email && data.password && data.name) {
        setTimeout(() => resolve({ data: { message: 'Signup successful!' } }), 1000);
      } else {
        setTimeout(() => reject({ response: { data: { message: 'Mock signup failed. Please fill all fields.' } } }), 1000);
      }
    });
  }
};


// --- SVG Icon Components ---
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);


export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  // In a real app, you would use the navigate function from react-router-dom
  // const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    try {
      // The VITE_SERVER_URL would be in your .env file
      // await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/signup`, { name, email, password });
      await axios.post(`/api/auth/signup`, { name, email, password });
      setMessage({ text: 'Signup successful! Redirecting...', type: 'success' });
      
      // Redirect after a short delay
      setTimeout(() => {
        // navigate('/'); // In a real app, you'd use this
        console.log("Redirecting to login page...");
        window.location.href = '/'; // Fallback for demonstration
      }, 2000);

    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Signup failed. Please try again.', type: 'error' });
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
                    src="https://placehold.co/600x600/1a202c/718096?text=Secure\nAuth" 
                    alt="Abstract illustration representing security and authentication" 
                    className="rounded-2xl shadow-2xl shadow-indigo-500/20 object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x600/1a202c/718096?text=Image+Error'; }}
                />
            </div>
            <h1 className="mt-8 text-4xl font-bold tracking-tight text-indigo-400">Join Our Community</h1>
            <p className="mt-4 text-lg text-gray-400">Unlock exclusive features by creating your account. It's fast, free, and secure.</p>
        </div>

        {/* Right Side: Signup Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-2xl shadow-2xl">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-white">Create Your Account</h2>
                <p className="mt-2 text-sm text-gray-400">
                    Already have an account?{' '}
                    {/* In a real app, this would be a Link component */}
                    {/* --- MODIFIED LINE --- */}
                    <a href="/" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                        Login
                    </a>
                </p>
            </div>
            
            <form onSubmit={handleSignup} className="space-y-6">
              
              {/* Name Input */}
              <div className="relative">
                <UserIcon />
                <input
                  id="name"
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <MailIcon />
                <input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <LockIcon />
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Submit Button */}
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
                  ) : 'Sign Up'}
                </button>
              </div>

              {/* Message Display */}
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