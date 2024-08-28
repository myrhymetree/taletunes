import React from 'react';
import Logo from '../../assets/images/icon.png'

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-100">
      <div className="flex items-center">
        <img src={Logo} alt="TaleTunes Logo" className="h-10 w-10 mr-2" />
        <span className="text-2xl font-bold">TaleTunes</span>
      </div>
      <div className="space-x-4">
        <button className="py-2 px-4 bg-blue-500 text-white rounded">Log in</button>
        <button className="py-2 px-4 bg-blue-700 text-white rounded">Sign up</button>
      </div>
    </header>
  );
};

export default Header;
