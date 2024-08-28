import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/common/Modal';

const Form = ({ addItem }) => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const handleTitleInputChange = (event) => {
    setTitleInput(event.target.value);
  };

  const handleButtonClick = () => {
    if (textInput.trim()) {
      setShowModal(true);
    } else {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const fileName = event.target.files[0]?.name || '선택된 파일 없음';
    document.getElementById('file-name').textContent = fileName;
    setIsFileUploaded(!!event.target.files.length);
  };

  const handleTextInputChange = (event) => {
    setTextInput(event.target.value);
  };

  const handleCreateClick = async () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('title', titleInput);
    
    if (isFileUploaded) {
      formData.append('file', fileInputRef.current.files[0]);
    } else {
      formData.append('text', textInput);
    }

    try {
      // fetch를 사용해 localhost:8888에서 POST 요청
      const response = await fetch('http://localhost:8888/tts', {
        method: 'POST',
        body: formData,
      });

      console.log('response status : ', response.status);
      if (response.status === 200) {
        setIsLoading(false);
        // const newItem = { id: Date.now(), title: titleInput || '새로운 작업물' };
        // addItem(newItem);
        navigate('/library');
        alert('생성이 완료되었습니다!');
      } else {
        throw new Error('서버 응답에 문제가 있습니다.');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('오류 발생:', error);
      alert('생성 중 오류가 발생했습니다.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    if (titleInput.trim() && (textInput.trim() || isFileUploaded)) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [titleInput, textInput, isFileUploaded]);

  return (
    <div className="flex-1 p-8">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
          <span className="ml-4 text-gray-700">오디오 변환 작업 중...</span>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-bold mb-2">제목 설정</label>
            <input
              type="text"
              className="w-full border rounded p-2 shadow-sm"
              placeholder="제목을 입력하세요"
              value={titleInput}
              onChange={handleTitleInputChange}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-bold mb-2">파일 업로드</label>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleButtonClick} 
                className="bg-blue-600 text-white py-2 px-4 rounded"
              >
                파일 선택
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <span id="file-name" className="text-gray-600">선택된 파일 없음</span>
            </div>
          </div>

          {!isFileUploaded && (
            <div className="mb-6">
              <label className="block text-gray-700 text-lg font-bold mb-2">텍스트 입력</label>
              <textarea
                className="w-full border rounded p-4 shadow-sm h-64"
                placeholder="텍스트를 입력하세요"
                value={textInput}
                onChange={handleTextInputChange}
              ></textarea>
            </div>
          )}

          <div className="text-right">
            <button 
              onClick={handleCreateClick} 
              className="bg-blue-600 text-white py-2 px-6 rounded"
              disabled={isButtonDisabled}
            >
              생성
            </button>
          </div>
        </>
      )}

      <Modal 
        isOpen={showModal} 
        onClose={closeModal} 
        message="텍스트를 입력하시면 파일은 업로드할 수 없습니다." 
      />
    </div>
  );
};

export default Form;