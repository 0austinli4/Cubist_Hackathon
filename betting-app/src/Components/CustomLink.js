import React from 'react';
import { Link } from 'react-router-dom';

const CustomLink = ({ to, children }) => {
  const linkStyle = {
    color: '#007bff', /* Link color */
    textDecoration: 'none', /* Remove underline */
    fontWeight: 'bold', /* Bold text */
    transition: 'color 0.3s', /* Smooth color transition */
    margin: '20px'
  };

  const hoverStyle = {
    color: '#0056b3' /* Change color on hover */
  };

  return (
    <Link
      to={to}
      style={linkStyle}
      onMouseEnter={(e) => e.target.style.color = hoverStyle.color}
      onMouseLeave={(e) => e.target.style.color = linkStyle.color}
    >
      {children}
    </Link>
  );
};

export default CustomLink;
