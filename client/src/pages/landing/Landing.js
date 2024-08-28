import React from 'react';
import Header from '../../components/common/Header'
import MainContent from '../../components/landing/MainContent';
import UserReviews from '../../components/landing/UserReviews';

const Landing = () => {
  return (
    <main className="flex-1 p-4">
      <Header />
      <MainContent />
      <UserReviews />
    </main>
  );
};

export default Landing;
