import request from 'request';
import fs from 'fs';
import getConnection from './database.js';

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

// 데이터베이스에서 성격에 맞는 목소리 조회
async function getVoiceByPersonality(personality, age, gender) {
  return new Promise((resolve, reject) => {
    const connection = getConnection();
    console.log(`personality, age, gender : ${personality}, ${age}, ${gender}`);
    const query = `SELECT s.en_name
                   FROM speaker s
                   JOIN mood m ON JSON_CONTAINS(s.mood, JSON_ARRAY(m.id))
                   WHERE m.name = ? and s.age = ? and s.gender = ? and s.lang = "Korean"`;

    connection.query(query, [personality, age, gender], (err, results) => {
      if (err) {
        reject(err);
      } else {
        console.log(`(query)results :  ${results}`)
        resolve(results[0]);  // 첫 번째 결과를 반환
      }
      connection.end();  // 연결 종료
    });
  });
}

export async function sendToServer(content, character) {
  console.log('음성변환 시작!!');
  const removeBrackets = (text) => text.replace(/\[.*?\]/g, '');
  const cleanedContent = removeBrackets(content);
  console.log(`cleanedContent : ${cleanedContent}`);

  const jsonString = await fs.promises.readFile('./characters/characters.json', 'utf8');
  const data = JSON.parse(jsonString);

  let inputForms = []; // 여러 inputForm 객체를 저장하기 위한 배열
  let inputForm;

  // JSON 데이터에 있는 모든 등장인물에 대해 반복
  for (let user of data.users) {
    if (character === user.name) {
      console.log(`character === user.name : ${character} === ${user.name}`);
      const voiceSettings = await getVoiceByPersonality(user.personality, user.age, user.gender);
      
      if (voiceSettings) {
        const voiceName = voiceSettings.en_name;
        console.log(`voice name : ${voiceName}`);
        inputForm = {
          speaker: voiceName,
          volume: 0,
          speed: 0,
          pitch: 0,
          text: cleanedContent,
          format: 'mp3'
        };
        break;
      } else {
        inputForm = {
          speaker: 'nmovie',
          volume: '0',
          speed: '1',
          pitch: '0',
          text: cleanedContent,
          format: 'mp3'
        };
        // break;
      }
    } else {
      console.log(`character !== user.name : ${character} !== ${user.name}`);
      inputForm = {
        speaker: 'nmovie',
        volume: '0',
        speed: '1',
        pitch: '0',
        text: cleanedContent,
        format: 'mp3'
      };
      // break;
    }
  }

  inputForms.push(inputForm);

  // TTS 요청을 처리 (단일 캐릭터의 inputForm만 사용)
  const results = await Promise.all(inputForms.map(inputForm => {
    return new Promise((resolve, reject) => {
      const api_url = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
      console.log(`inputForm : ${inputForm.speaker}`);
      const options = {
        url: api_url,
        form: inputForm,
        headers: {
          'X-NCP-APIGW-API-KEY-ID': client_id,
          'X-NCP-APIGW-API-KEY': client_secret
        },
        encoding: null // Ensures the response body is returned as a Buffer
      };

      request.post(options, (error, response, body) => {
        if (error) {
          return reject(error);
        }
        if (response.statusCode !== 200) {
          console.log(`Response Status Code: ${response.statusCode}`);
          console.log('Response Body:', body.toString('utf8'));
          return reject(new Error('Failed to generate TTS'));
        }

        if (!(body instanceof Buffer)) {
          body = Buffer.from(body);
        }

        resolve(body);
      });
    });
  }));

  // 모든 결과가 Buffer인지 확인하고 변환
  return results.map(result => (result instanceof Buffer ? result : Buffer.from(result)));
}
