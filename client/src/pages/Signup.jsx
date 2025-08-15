import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router';

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
  @keyframes smokePop {
    0% { opacity: 0; transform: scale(0);}
    20% { opacity: 0.8; transform: scale(1.08);}
    40% { opacity: 0.85; transform: scale(0.92);}
    60% { opacity: 0.6; transform: scale(1.04);}
    80% { opacity: 0.3; transform: scale(1);}
    100% { opacity: 0; transform: scale(1.2);}
  }
  .smoke-pop { animation: smokePop 1.2s cubic-bezier(.79,-0.11,.61,1.13) forwards; }
`;

function RocketSVG() {
  return (
    <svg width="320" height="320" viewBox="0 0 90 130">
      <defs>
        <radialGradient id="bodyGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="40%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="80%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#1E293B" />
        </radialGradient>
        <linearGradient id="windowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#dbdefe" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <ellipse cx="45" cy="65" rx="30" ry="60" fill="url(#bodyGradient)" />
      <ellipse cx="45" cy="45" rx="12" ry="12" fill="url(#windowGradient)" stroke="#8B5CF6" strokeWidth="2" />
      <polygon points="18,95 32,100 25,130" fill="#818CF8" />
      <polygon points="72,95 58,100 65,130" fill="#818CF8" />
      <polygon points="45,5 35,30 55,30" fill="#E0E7FF" />
    </svg>
  );
}

function FlameSVG({ takeoff }) {
  return (
    <svg width="110" height="70" viewBox="0 0 110 70" style={{ position: "absolute", left: "50%", bottom: "-38px", transform: "translateX(-50%)" }}>
      <ellipse cx="55" cy="45" rx="18" ry="27" fill="#FFA726" className={takeoff ? "flame-takeoff" : "flame-flicker"} />
      <ellipse cx="55" cy="64" rx="11" ry="19" fill="#FB8C00" className={takeoff ? "flame-takeoff" : "flame-flicker"} />
      <ellipse cx="43" cy="59" rx="7" ry="15" fill="#FFD54F" className={takeoff ? "flame-takeoff" : "flame-flicker"} />
      <ellipse cx="67" cy="56" rx="7" ry="14" fill="#FFD54F" className={takeoff ? "flame-takeoff" : "flame-flicker"} />
    </svg>
  );
}

function SmokeSVG({ animate }) {
  return (
    <svg width="200" height="92" viewBox="0 0 200 92" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '-9px' }}>
      <circle cx="60" cy="60" r="32" fill="#E5E7EB" opacity="0.54" className={animate ? 'smoke-pop' : ''} />
      <circle cx="105" cy="72" r="23" fill="#BDBDBD" opacity="0.36" className={animate ? 'smoke-pop' : ''} />
      <circle cx="136" cy="60" r="35" fill="#ECEEFF" opacity="0.46" className={animate ? 'smoke-pop' : ''} />
    </svg>
  );
}

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTakeoff, setIsTakeoff] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/signup`, { name, email, password });
      setMessage('Signup successful! Redirecting...');
      setIsTakeoff(true);
      setTimeout(() => { window.location.href = '/'; }, 1300);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{rocketStyles}</style>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-800 flex items-center justify-center text-white overflow-hidden">
        <div className="flex w-full max-w-6xl items-center justify-center flex-wrap">
          {/* Rocket Section */}
          <div className="flex flex-col items-center flex-1 p-6">
            <div className={`relative ${isTakeoff ? 'rocket-takeoff' : isLoading ? 'rocket-shake' : ''}`}>
              <RocketSVG />
              {(isLoading || isTakeoff) && <FlameSVG takeoff={isTakeoff} />}
              {(isLoading || isTakeoff) && <SmokeSVG animate />}
            </div>
            <h1 className="mt-6 text-4xl font-bold text-indigo-400">Product Tracking Dashboard</h1>
            <p className="mt-2 text-gray-400">Create your account and unlock exclusive features.</p>
          </div>

          {/* Signup Form */}
          <div className="flex flex-1 justify-center">
            <form onSubmit={handleSignup} className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
              <h2 className="text-3xl font-extrabold">Create Your Account</h2>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-700 rounded-lg" />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-700 rounded-lg" />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-700 rounded-lg" />
              <button type="submit" className="w-full bg-indigo-600 py-3 rounded-lg hover:bg-indigo-700 transition" disabled={isLoading}>
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
              {message && <p className="text-center mt-2">{message}</p>}
              <p className="text-sm text-center text-gray-400">Already have an account? <Link to="/" className="text-indigo-400">Login</Link></p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
