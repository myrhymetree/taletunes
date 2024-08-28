import React from 'react';

const reviews = [
  { id: 1, user: '만족한 사용자', text: '"TaleTunes 덕분에 소설의 모든 캐릭터가 생생하게 다가왔어요!"', date: '20.06.2024' },
  { id: 2, user: '작가', text: '"TaleTunes 덕분에 소설의 모든 캐릭터가 생생하게 다가왔어요!"', date: '18.06.2024' },
  { id: 3, user: '오디오북 애호가', text: '"다양한 목소리로 각 캐릭터를 표현할 수 있어 정말 흥미로웠습니다."', date: '14.06.2024' }
];

const UserReviews = () => {
  return (
    <section className="p-8 bg-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 border rounded shadow-md">
          <p className="mb-2">{review.text}</p>
          <span className="block text-gray-600 text-sm">{review.user}</span>
          <span className="block text-gray-500 text-xs">{review.date}</span>
        </div>
      ))}
    </section>
  );
};

export default UserReviews;
