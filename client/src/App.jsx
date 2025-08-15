import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
// import Track from "./pages/Track"; 


import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        {/* <Route path="/track" element={<Track />} /> Add this */}
      </Routes>
    </Router>
  );
}