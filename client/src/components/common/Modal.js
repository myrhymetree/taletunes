import React from 'react';

const Modal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null; // 모달이 열리지 않으면 아무것도 렌더링하지 않음

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <p className="text-lg text-gray-700">{message}</p>
        <button 
          onClick={onClose} 
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default Modal;
