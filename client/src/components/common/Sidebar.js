import React from 'react';
import Logo from '../../assets/images/icon.png'
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/library'); // '/form' 경로로 이동
  };

  return (
    <aside className="w-64 h-screen bg-gray-100 p-4">
      <div onClick={handleClick} className="flex items-center mb-8  cursor-pointer">
        <img src={Logo} alt="TaleTunes Logo" className="h-10 w-10 mr-2" />
        <span className="text-2xl font-bold">TaleTunes</span>
      </div>
      <nav className="space-y-4">
        <a href="/audiobook" className="block text-gray-700 hover:bg-gray-200 p-2 rounded">오디오북 생성하기</a>
        <a href="/library" className="block text-gray-700 hover:bg-gray-200 p-2 rounded">책장</a>
        <a href="#" className="block text-gray-700 hover:bg-gray-200 p-2 rounded">대시보드</a>
      </nav>
      <div className="absolute bottom-4 left-4">
        <button className="text-gray-700">로그아웃</button>
      </div>
    </aside>
  );
};

export default Sidebar;
