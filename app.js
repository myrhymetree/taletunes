import express from 'express';
import 'dotenv/config';
import fs from 'fs';
import request from 'request';
import { OpenAI } from "openai";

const app = express();
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const speechFile = './mp3/audiobook.mp3';
const characters = './characters/characters.json';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const title = "작은아씨들";

// 대괄호와 그 안의 내용을 제거하는 함수
function removeBrackets(text) {
  return text.replace(/\[.*?\]/g, '');
}

const filePath = './sample/little_women.txt';

// Function to call GPT
async function callGpt(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');

    // JSON 분석
    const responseJson = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `
            Q1.
            이 글은 소설 '${title}'이야. 다음 소설에서 등장인물을 이름, 성별, 성격, 연령을 단계별로 분석해줘.
            구체적인 이름이 나오지 않았다면 소설에서 문맥 흐름대로 입력해줘.
            나래이션이 언급한 이름을 넣어도 괜찮아.
            성별은 남성 | 여성 중 하나로 분류해줘.
            성격은 냉소적 | 사교적 중 하나로 분류해줘.
            연령은 아기 | 어린이 | 청소년 | 청년 | 중년 | 노인 중 하나로 분류해줘.
            속성은 name, gender, personality, age, analysis.
            반드시 모든 등장인물을 빠짐 없이 설명해줘.
            결과는 그렇게 분석한 이유를 설명하고 확실히 분석한 것만 결과에 적어줘.
            출력형식은 { "users" : []}, .json
            API를 통해서 바로 파일로 가공할거야.`,
        },
        { 
          role: "user", 
          content: data 
        }
      ]
    });

    console.log('responseJson :: ', responseJson.choices[0].message.content);
    let resultJson = responseJson.choices[0].message.content;
    resultJson = resultJson.replace(/```json/g, '').replace(/```/g, '').trim();   // ```json과 ``` 제거
    await fs.promises.writeFile(characters, resultJson, 'utf8');
    console.log('JSON output saved to output.json');

    // TXT 가공
    const responseTxt = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `
            Q2.
            모든 나래이션과 대사는 생략되어서는 안됨!
            등장인물의 대사와 나래이션이 같은 줄에 혼재될 수 있으니 주의할 것.
            등장인물의 대사는 쌍따옴표로 앞뒤에 감싸져 있음.
            나래이션은 [나래이션]이라는 접두사를 붙여줘.
            각 등장인물에 맞게 접두사를 붙여줘.
            접두사를 기준으로 줄바꿈(개행문자 \\n)을 해줘.
            반드시 모든 대사를 출력할 것.
            ""이 없으면 나래이션으로 간주해줘.
            반드시 등장인물 json과 대괄호 안 접두사는 일치할 것.
            출력 형태는 plaintext로 만들어줘.
            예시 : [조] "선물도 없는데, 크리스마스가 다 무슨 소용이람." [나래이션] 조가 깔개에 엎드린 채 툴툴댔다.
          `,
        },
        { 
          role: "user", 
          content: data 
        }
      ]
    });

    const resultTxt = responseTxt.choices[0].message.content;
    await fs.promises.writeFile('./script/output.txt', resultTxt, 'utf8');
    console.log('Text output saved to output.txt');

  } catch (err) {
    console.error('File read error:', err);
  }
}

app.get('/tts', async (req, res) => {
  try {
    console.time('TTS Translate start');
    await callGpt(filePath);
    
    const sample = await fs.promises.readFile('./script/output.txt', 'utf8'); 
    const lines = sample.trim().split('\n');

    let buffer = [];
    let currentCharacter = '';
    let allAudioBuffers = [];

    for (const line of lines) {
      const match = line.match(/\[(.*?)\]/);
      if (match) {
        const character = match[1];
        if (currentCharacter && character !== currentCharacter) {
          const audioBuffer = await sendToServer(buffer.join('\n'), currentCharacter);
          allAudioBuffers.push(audioBuffer);
          buffer = [];
        }
        currentCharacter = character;
        console.log('current character', currentCharacter);
      }
      buffer.push(line);
    }

    if (buffer.length > 0) {
      const audioBuffer = await sendToServer(buffer.join('\n'), currentCharacter);
      allAudioBuffers.push(audioBuffer);
    }

    const combinedAudioBuffer = Buffer.concat(allAudioBuffers);
    await fs.promises.writeFile(speechFile, combinedAudioBuffer);

    res.send('Audio files combined successfully');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  } finally {
      console.timeEnd('TTS Translate End');
  }
});

async function sendToServer(content, character) {
  let inputForm;

  // 대괄호와 그 안의 내용을 제거
  const cleanedContent = removeBrackets(content);

  const jsonString = await fs.promises.readFile(characters, 'utf8');
  const data = JSON.parse(jsonString);
  let name;

  for (let user of data.users) {
    if (character === user.name) {
      name = user.name;
      break;
    }
  }

  if (name === "조") {
    inputForm = {
      speaker: 'nyuna',
      volume: '0',
      speed: '0',
      pitch: '0',
      text: cleanedContent,
      format: 'mp3'
    }
  } else if (name === "에이미") {
    inputForm = {
      speaker: 'nihyun',
      volume: '0',
      emotion: '0',
      speed: '0',
      pitch: '0',
      text: cleanedContent,
      format: 'mp3'
    }
  } else if (name === "베스") {
    inputForm = {
      speaker: 'njiyun',
      volume: '0',
      speed: '0',
      pitch: '0',
      text: cleanedContent,
      format: 'mp3'
    }
  } else if (name === "메그") {
    inputForm = {
      speaker: 'nyejin',
      volume: '0',
      speed: '2',
      pitch: '0',
      text: cleanedContent,
      format: 'mp3'
    }
  } else {
    inputForm = {
      speaker: 'nmovie',
      volume: '0',
      speed: '1',
      pitch: '0',
      text: cleanedContent,
      format: 'mp3'
    }
  }

  return new Promise((resolve, reject) => {
    const api_url = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
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
        return reject(new Error('Failed to generate TTS'));
      }
      resolve(body);
    });
  });
}

app.listen(3000, function() {
  console.log('http://127.0.0.1:3000/ app listening on port 3000!');
});