// App.js

import React from 'react';
import { BrowserRouter as Router, Route, Link,  Routes } from 'react-router-dom';
import Home from './Home';
import Profile from './Profile';
import CustomLink from './Components/CustomLink'
function App() {

 const linkStyle = {
    color: '#007bff', /* Link color */
    textDecoration: 'none', /* Remove underline */
    fontWeight: 'bold', /* Bold text */
    transition: 'color 0.3s' /* Smooth color transition */
  };

  const hoverStyle = {
    color: '#0056b3' /* Change color on hover */
  };

  return (
    <Router>
      <div style={{display: 'flex'}}>
        <div style={{ minHeight: '100vh' }}>
            <nav style={{ width: '200px',  position: 'absolute', top: 80, right: 0, margin: '20px' }}>
              <CustomLink to="/" >Home</CustomLink>
              <CustomLink to="/profile">Profile</CustomLink>
            </nav>
        </div>
         <Routes>
        <Route exact path="/" element={<Home/>} />
        <Route path="/profile" element={<Profile/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
