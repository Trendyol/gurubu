import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="copyright">
          &copy; 2023-{currentYear} GuruBu. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 