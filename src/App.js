import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Landing from './Pages/Landing';
import Login from './Pages/Auth/Login';
import Register from './Pages/Auth/Register';
import Home from './Pages/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />
            
            {/* Add routes for hamburger menu navigation */}
            <Route path="/documents" element={<Home />} />
            <Route path="/analysis" element={<Home />} />
            <Route path="/library" element={<Home />} />
            <Route path="/settings" element={<Home />} />
            <Route path="/help" element={<Home />} />
            <Route path="/profile" element={<Home />} />
          </Routes>
        </main>
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;