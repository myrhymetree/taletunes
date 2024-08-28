import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import icon from '../../assets/images/list_icon.png';

const ContentCard = () => {
  const navigate = useNavigate();
  const [ttsList, setTtsList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTtsList = async () => {
      try {
        const response = await fetch('http://localhost:8888/tts', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch TTS list');
        }

        const data = await response.json();
        console.log('Fetched TTS List:', data);

        if (Array.isArray(data.results)) {
          setTtsList(data.results);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        console.error('Error fetching TTS list:', error);
        setError(error.message);
      }
    };

    fetchTtsList();
  }, []);

  const handleDownload = async (id, title) => {
    try {
      // 서버에서 파일을 다운로드할 수 있는 API 호출
      const response = await fetch(`http://localhost:8888/download/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
  
      // Blob으로 응답 받기
      const blob = await response.blob();
      
      // 파일 이름을 서버에서 응답 헤더로 제공할 수 있으면 사용, 그렇지 않으면 기본값 사용
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] || `${title}.mp3`;
  
      // Blob 객체를 사용하여 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
  
      // 다운로드 후 URL과 링크 제거
      a.remove();
      window.URL.revokeObjectURL(url);
  
      console.log(`Download started for: ${id}`);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (id) => {
    console.log(`Delete: ${id}`);

    try {
      const response = await fetch(`http://localhost:8888/tts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete audiobook');
      }

      // 삭제 성공 시 상태 업데이트
      setTtsList(ttsList.filter(ttsItem => ttsItem.id !== id));
      console.log(`Deleted audiobook with id: ${id}`);
    } catch (error) {
      console.error('Error deleting audiobook:', error);
      setError('Failed to delete audiobook');
    }
  };

  return (
    <div className="flex flex-wrap justify-start p-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {ttsList.map((ttsItem) => (
        <div
          key={ttsItem.id}
          className="flex flex-col items-center justify-between bg-white shadow-lg rounded-lg p-5 m-4 w-60"
        >
          <div className="text-center mb-4">
            <img src={icon} alt="audiobook icon" className="w-20 h-20 mx-auto mb-2" />
            <div className="text-lg font-semibold">{ttsItem.title}</div>
          </div>
          <div className="flex justify-between w-full">
            <button
              onClick={() => handleDownload(ttsItem.id, ttsItem.title)}
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              다운로드
            </button>
            <button
              onClick={() => handleDelete(ttsItem.id)}
              className="bg-red-500 text-white py-2 px-4 rounded"
            >
              삭제하기
            </button>
          </div>
        </div>
      ))}

      <div
        onClick={() => navigate('/audiobook')}
        className="flex items-center justify-center bg-white shadow-lg rounded-lg p-10 m-4 w-60 cursor-pointer"
      >
        <div className="text-5xl">+</div>
      </div>
    </div>
  );
};

export default ContentCard;
