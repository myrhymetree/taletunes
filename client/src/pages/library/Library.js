import React from 'react';
import Search from '../../components/library/Search';
import ContentCard from '../../components/library/ContentCard';
import Sidebar from '../../components/common/Sidebar';

const MainContent = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-full">
        <Search/>
        <ContentCard />
      </div>
    </div>
  );
};

export default MainContent;
