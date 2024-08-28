import React from 'react';
import Sidebar from '../../components/common/Sidebar';
import Form from '../../components/audiobook/Form';


const Landing = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col w-full">
        <Form />
      </div>
    </div>
  );
};

export default Landing;
