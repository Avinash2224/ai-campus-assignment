import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router';

const rocketStyles = `
  @keyframes rocketShake {
    0%, 100% { transform: translateY(0) rotate(-1deg);}
    20% { transform: translateY(-3px) rotate(2deg);}
    40% { transform: translateY(4px) rotate(-3deg);}
    60% { transform: translateY(-3px) rotate(3deg);}
    80% { transform: translateY(3px) rotate(0deg);}
  }
  .rocket-shake { animation: rocketShake 0.5s infinite; }
  
  @keyframes rocketTakeoff {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    70% { transform: translateY(-200px) scale(1.08); opacity: 1; }
    100% { transform: translateY(-1000px) scale(1.18); opacity: 0.5; }
  }
  .rocket-takeoff { animation: rocketTakeoff 1.2s cubic-bezier(.83,-0.11,.71,1.21) forwards; }

  @keyframes loginTakeoff {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    60% { transform: translateY(-150px) scale(1.06); opacity: 0.95; }
    100% { transform: translateY(-800px) scale(1.15); opacity: 0; }
  }
  .login-takeoff { animation: loginTakeoff 1.2s cubic-bezier(.83,-0.11,.71,1.21) forwards; }

  @keyframes smokePop {
    0% { opacity: 0; transform: scale(0);}
    20% { opacity: 0.8; transform: scale(1.08);}
    40% { opacity: 0.85; transform: scale(0.92);}
    60% { opacity: 0.6; transform: scale(1.04);}
    80% { opacity: 0.3; transform: scale(1);}
    100% { opacity: 0; transform: scale(1.2);}
  }
  .smoke-pop { animation: smokePop 1.2s cubic-bezier(.79,-0.11,.61,1.13) forwards; }

  @keyframes flameFlicker {
    0% { opacity: 0.9; transform: scaleY(1.08);}
    20% { opacity: 0.95; transform: scaleY(1.20);}
    45% { opacity: 0.70; transform: scaleY(0.92);}
    70% { opacity: 0.90; transform: scaleY(1.10);}
    100% { opacity: 0.88; transform: scaleY(1.16);}
  }
  .flame-flicker { animation: flameFlicker 1.1s infinite linear; }

  @keyframes flameTakeoff {
    0% { opacity: 1; transform: scaleY(1);}
    40% { opacity: 0.97; transform: scaleY(1.30);}
    60% { opacity: 0.85; transform: scaleY(1.55);}
    100% { opacity: 0; transform: scaleY(2);}
  }
  .flame-takeoff { animation: flameTakeoff 1.1s cubic-bezier(.83,-0.11,.71,1.21) forwards; }
`;

function RocketSVG({ className = '' }) {
  return (
    <svg className={className} width="350" height="350" viewBox="0 0 90 130" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bodyGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="40%">
          <stop offset="0%" stopColor="#fff"/>
          <stop offset="80%" stopColor="#4F46E5"/>
          <stop offset="100%" stopColor="#1E293B"/>
        </radialGradient>
        <linearGradient id="windowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#dbdefe"/>
          <stop offset="100%" stopColor="#6366f1"/>
        </linearGradient>
      </defs>
      <ellipse cx="45" cy="65" rx="30" ry="60" fill="url(#bodyGradient)" />
      <ellipse cx="45" cy="45" rx="12" ry="12" fill="url(#windowGradient)" stroke="#8B5CF6" strokeWidth="2"/>
      <polygon points="18,95 32,100 25,130" fill="#818CF8" />
      <polygon points="72,95 58,100 65,130" fill="#818CF8" />
      <polygon points="45,5 35,30 55,30" fill="#E0E7FF"/>
    </svg>
  );
}

function FlameSVG({ takeoff }) {
  return (
    <svg
      width="110"
      height="70"
      viewBox="0 0 110 70"
      style={{
        position: "absolute",
        left: "50%",
        bottom: "-38px",
        transform: "translateX(-50%)",
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      <ellipse
        cx="55"
        cy="45"
        rx="18"
        ry="27"
        fill="#FFA726"
        className={takeoff ? "flame-takeoff" : "flame-flicker"}
        style={{ opacity: 0.95 }}
      />
      <ellipse
        cx="55"
        cy="64"
        rx="11"
        ry="19"
        fill="#FB8C00"
        className={takeoff ? "flame-takeoff" : "flame-flicker"}
        style={{ opacity: 0.7 }}
      />
      <ellipse
        cx="43"
        cy="59"
        rx="7"
        ry="15"
        fill="#FFD54F"
        className={takeoff ? "flame-takeoff" : "flame-flicker"}
        style={{ opacity: 0.6 }}
      />
      <ellipse
        cx="67"
        cy="56"
        rx="7"
        ry="14"
        fill="#FFD54F"
        className={takeoff ? "flame-takeoff" : "flame-flicker"}
        style={{ opacity: 0.6 }}
      />
      <polygon
        points="55,36 58,70 52,70"
        fill="#FFB945"
        className={takeoff ? "flame-takeoff" : "flame-flicker"}
        style={{ opacity: 0.7 }}
      />
    </svg>
  );
}

function SmokeSVG({ animate }) {
  return (
    <svg width="200" height="92" viewBox="0 0 200 92" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '-30px', pointerEvents: 'none', zIndex: 1 }}>
      <circle cx="60" cy="60" r="32" fill="#E5E7EB" opacity="0.54" className={animate ? 'smoke-pop' : ''}/>
      <circle cx="105" cy="72" r="23" fill="#BDBDBD" opacity="0.36" className={animate ? 'smoke-pop' : ''}/>
      <circle cx="136" cy="60" r="35" fill="#ECEEFF" opacity="0.46" className={animate ? 'smoke-pop' : ''}/>
      <circle cx="90" cy="34" r="19" fill="#D8D8D8" opacity="0.39" className={animate ? 'smoke-pop' : ''}/>
      <circle cx="50" cy="40" r="13" fill="#E0E7FF" opacity="0.38" className={animate ? 'smoke-pop' : ''}/>
      <circle cx="170" cy="47" r="14" fill="#E1E4EC" opacity="0.28" className={animate ? 'smoke-pop' : ''}/>
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isTakeoff, setIsTakeoff] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, { email, password });
      if (res.data.token) localStorage.setItem('token', res.data.token);
      setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
      setIsTakeoff(true);
      setTimeout(() => {
        navigate('/home');
      }, 1300);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Login failed. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{rocketStyles}</style>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-800 text-white flex items-center justify-center p-4 font-sans overflow-hidden">
        <div className="w-full max-w-6xl mx-auto lg:grid lg:grid-cols-2 gap-12">
          
          {/* Left Side: Rocket Illustration & Welcome Text */}
          <div className="hidden lg:flex flex-col items-center justify-center text-center p-8">
            <div className="w-full max-w-lg flex flex-col items-center relative transition-transform duration-600">
              {/* Rocket + Flame animated together */}
              <div
                className={`transition-all duration-1000 ${isTakeoff ? 'rocket-takeoff scale-125' : isLoading ? 'rocket-shake' : ''}`}
                style={{ willChange: 'transform, opacity', zIndex: 4, position: 'relative' }}
              >
                <RocketSVG />
                <div style={{ width: '110px', height: '70px', position: 'absolute', left: '50%', bottom: '-38px', transform: 'translateX(-50%)', zIndex: 2 }}>
                  {(isTakeoff || isLoading) && <FlameSVG takeoff={isTakeoff} />}
                </div>
              </div>
              {/* Smoke stays at ground */}
              <div style={{ width: '200px', height: '92px', position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '-9px', zIndex: 2 }}>
                {(isTakeoff || isLoading) && <SmokeSVG animate={isTakeoff || isLoading} />}
              </div>
            </div>
            <h1 className="mt-8 text-5xl font-bold tracking-tight text-purple-400 drop-shadow-lg">Welcome Back!</h1>
            <p className="mt-5 text-xl text-gray-400"></p>
          </div>
          
          {/* Right Side: Login Form */}
          <div className="flex items-center justify-center">
            <div className={`w-full max-w-md p-10 space-y-8 bg-gray-800/70 backdrop-blur-2xl rounded-3xl shadow-2xl relative transition-all duration-700 ${isTakeoff ? "login-takeoff" : ""}`}>
              <div className="text-center transition-all duration-700">
                <h2 className="text-4xl font-extrabold text-white">Login to Your Account</h2>
                <p className="mt-3 text-md text-gray-400">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    Sign Up
                  </Link>
                </p>
              </div>
              <form onSubmit={handleLogin} className="space-y-7">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                  />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-4 px-5 border border-transparent rounded-lg shadow-sm text-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-all duration-300 ease-in-out disabled:bg-indigo-400 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : 'Login'}
                  </button>
                </div>
                {message.text && (
                  <p className={`text-md text-center font-medium transition-all duration-700 ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                    {message.text}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
