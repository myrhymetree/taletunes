import React from 'react';

const Search = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      <div className="flex items-center w-full max-w-md"> {/* max-w-md로 최대 너비 설정 */}
        <input
          type="text"
          placeholder="Search"
          className="border rounded w-full p-2 mr-2"
        />
        <button className="bg-blue-600 text-white p-2 w-20 h-10 rounded">검색</button>
      </div>
    </header>
  );
};

export default Search;
