import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { generateTTS, uploadFile, list, download, removeTTS } from './controller/ttsController.js';

const app = express();
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(cors());

// Body parser 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/tts', uploadFile, generateTTS); // 파일 업로드를 처리하고 TTS 생성
app.get('/tts', list);
app.get('/download/:id', download);
app.delete('/tts/:id', removeTTS);

app.listen(8888, function() {
  console.log('http://127.0.0.1:8888/ app listening on port 8888!');
});
