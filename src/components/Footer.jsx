
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light-card dark:bg-dark-card py-6 text-center text-sm text-light-subtext dark:text-dark-subtext border-t border-ui-border">
      <p>&copy; {new Date().getFullYear()} Nick · All Rights Reserved</p>
    </footer>
  );
};

export default Footer;
