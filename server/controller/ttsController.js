import { callGpt } from '../models/openaiModel.js';
import { sendToServer } from '../models/ttsModel.js';
import fs from 'fs';
import getConnection from '../models/database.js';
import { insertAudiobook, selectAudioBook, selectOne, deleteOne }  from '../models/query.js';
import multer from 'multer';
import path from 'path';
import audiobookDTO from '../dto/audio-book-dto.js';
import HttpStatus from 'http-status';

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // 업로드된 파일이 저장될 디렉토리
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // 파일명
  }
});

const upload = multer({ storage: storage });

export const uploadFile = upload.single('file'); // 'file'은 클라이언트 요청에서 파일 필드의 이름

export async function list(req, res) {
  const connection = getConnection();
  connection.query(selectAudioBook(), (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Database Error');
      return;
    }

    console.log('Audiobook found into database:', results);

    const fileList = [];
    for(let i = 0; i < results.length; i++) {
      fileList.push(new audiobookDTO(results[i]));
    }

    connection.end();

    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'successfully selected audiobook list',
      results: results
    });
  });
} 

export async function generateTTS(req, res) {
  const title = req.body.title;
  const filePath = req.file.path;
  const speechFile = `C:\\dev\\taletunes\\server\\mp3\\${title}.mp3`;

  try {
    await callGpt(filePath, title);
    
    const sample = await fs.promises.readFile('./script/output.txt', 'utf8'); 
    const lines = sample.trim().split('\n');

    let buffer = [];
    let currentCharacter = '';
    let allAudioBuffers = [];

    // for (const line of lines) {
    //   const match = line.match(/\[(.*?)\]/);
    //   if (match) {
    //     const character = match[1];
    //     console.log(`1. character : ${character}`);
    //     if (currentCharacter && character !== currentCharacter) {
    //       console.log(`2. current character : ${currentCharacter}`);
    //       console.log(`3. line : ${line}`);
    //       const audioBuffer = await sendToServer(buffer.join('\n'), currentCharacter);

    //       // 반환된 audioBuffer가 배열인지 확인하고, 각 요소를 Buffer로 변환
    //       if (Array.isArray(audioBuffer)) {
    //         audioBuffer.forEach((buf, index) => {
    //           if (!(buf instanceof Buffer || buf instanceof Uint8Array)) {
    //             console.error(`Unexpected type for audioBuffer at index ${index}:`, typeof buf);
    //             return res.status(500).send('Internal Server Error - Invalid Audio Buffer');
    //           }
    //         });
    //         allAudioBuffers.push(...audioBuffer);
    //         buffer = [];
    //       } else {
    //         console.error('Unexpected result type:', typeof audioBuffer);
    //         return res.status(500).send('Internal Server Error - Invalid Audio Buffer');
    //       }

    //     }
    //     currentCharacter = character;
    //     console.log(`4. current character matched? : ${currentCharacter}`);
    //   }
    //   buffer.push(line);
    //   console.log(`4. current character matched? : ${currentCharacter}`);
    // }

    // if (buffer.length > 0) {
    //   const audioBuffer = await sendToServer(buffer.join('\n'), currentCharacter);

    //   if (Array.isArray(audioBuffer)) {
    //     audioBuffer.forEach((buf, index) => {
    //       if (!(buf instanceof Buffer || buf instanceof Uint8Array)) {
    //         console.error(`Unexpected type for audioBuffer at index ${index}:`, typeof buf);
    //         return res.status(500).send('Internal Server Error - Invalid Audio Buffer');
    //       }
    //     });
    //     allAudioBuffers.push(...audioBuffer);
    //   } else {
    //     console.error('Unexpected result type:', typeof audioBuffer);
    //     return res.status(500).send('Internal Server Error - Invalid Audio Buffer');
    //   }
    // }

    // console.log('버퍼 합치기 시작!!');
    // const combinedAudioBuffer = Buffer.concat(allAudioBuffers);
    // await fs.promises.writeFile(speechFile, combinedAudioBuffer);

    for (const line of lines) {
      const match = line.match(/\[(.*?)\]/);
      if (match) {
        // console.log(`match[0] : ${match[0]}`);
        // console.log(`match[1] : ${match[1]}`);
        const character = match[1];  // match[0] : [등장인물] match[1] : 등장인물
        if (currentCharacter && character !== currentCharacter) {
          const audioBuffer = await sendToServer(buffer.join('\n'), currentCharacter);
          allAudioBuffers.push(...audioBuffer);
          buffer = [];
        }
        currentCharacter = character;
        console.log('current character', currentCharacter);
      }
      buffer.push(line);
    }

    if (buffer.length > 0) {
      const audioBuffer = await sendToServer(buffer.join('\n'), currentCharacter);
      allAudioBuffers.push(...audioBuffer);
    }

    const combinedAudioBuffer = Buffer.concat(allAudioBuffers);
    await fs.promises.writeFile(speechFile, combinedAudioBuffer);

    const connection = getConnection();
    connection.query(insertAudiobook(), [title, "C:\\dev\\taletunes\\server\\mp3", `${title}.mp3`], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).send('Database Error');
        return;
      }

      console.log('Audiobook inserted into database:', result);
      connection.end();
      res.status(200).send('completed mp3 file');
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
}

export async function download(req, res) {
  const { id } = req.params;

// 데이터베이스에서 id에 해당하는 파일 경로 가져오기
const connection = getConnection();
connection.query(selectOne(), [id], (err, results) => {
  if (err) {
    console.error('Database error:', err);
    connection.end();
    res.status(500).send('Database Error');
    return;
  }

  if (results.length === 0) {
    connection.end();
    res.status(404).send('File not found');
    return;
  }

  const filePath = results[0].path + '\\' +results[0].file_name; // 데이터베이스에서 파일 경로 가져오기
  console.log(`filePath : ${filePath}`);
  console.log(`file_name : ${results[0].file_name}`)
  connection.end();

  // 파일을 클라이언트로 다운로드 전송
  res.download(filePath, results[0].file_name, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('Error downloading file');
    }
  });
});
}

export async function removeTTS(req, res) {
  const { id } = req.params;

  const connection = getConnection();

  // 데이터베이스에서 파일 경로 조회
  connection.query(selectOne(), [id], (err, results) => {
    if (err) {
      console.error('Error fetching audiobook:', err);
      connection.end();
      res.status(500).send('Database Error');
      return;
    }

    if (results.length === 0) {
      connection.end();
      res.status(404).send('Audiobook not found');
      return;
    }

    const filePath = results[0].path + '\\' +results[0].file_name; // 데이터베이스에서 가져온 파일 경로
    console.log(`filePath : ${filePath}`);

    // 파일 시스템에서 파일 삭제
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        res.status(500).send('Error deleting file');
        return;
      }

      // 파일 삭제가 성공하면 데이터베이스에서 레코드 삭제
      connection.query(deleteOne(), [id], (err, result) => {
        if (err) {
          console.error('Error deleting audiobook from database:', err);
          connection.end();
          res.status(500).send('Database Error');
          return;
        }

        if (result.affectedRows === 0) {
          connection.end();
          res.status(404).send('Audiobook not found in database');
          return;
        }

        console.log('Audiobook deleted from database and file system:', id);
        connection.end();
        res.status(200).send('Audiobook deleted successfully');
      });
    });
  });
}