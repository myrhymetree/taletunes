import React from 'react';
import LandingImage from '../../assets/images/Landing image.png';

const MainContent = () => {
  return (
    <main className="flex flex-col lg:flex-row items-center justify-between p-10">
      <div className="text-center lg:text-left max-w-lg mb-8 lg:mb-0">
        <h1 className="text-3xl font-bold mb-4">AI와 함께 생동감 넘치는 소설을 오디오북으로 만나보세요</h1>
        <p className="text-lg mb-6">
          TaleTunes는 AI 기반 오디오북 제작 서비스로, 소설의 각 등장인물에 맞는 개별 음성을 자동으로 생성하여 몰입감을 극대화한 오디오북을 제공합니다.
        </p>
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <button className="py-2 px-6 bg-blue-500 text-white rounded">지금 시작하기</button>
          <button className="py-2 px-6 bg-gray-200 text-gray-700 rounded">무료로 체험하기</button>
          <button className="py-2 px-6 bg-gray-200 text-gray-700 rounded">더 알아보기</button>
        </div>
      </div>
      <div className="w-64 h-64">
        <img src={LandingImage} alt="Audiobook illustration" className="w-full h-full object-cover" />
      </div>
    </main>
  );
};

export default MainContent;