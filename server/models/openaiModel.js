import { OpenAI } from "openai";
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function callGpt(filePath, title) {
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
            성별은 남성이면 0 | 여성이면 1로 해줘.
            연령은 아기 | 어린이 | 청소년 | 청년 | 중년 이상 중 하나로 분류해줘.
            속성은 name, gender, personality, age, analysis.
            personality는 반드시 매력적인 | 친절한 | 차분한 | 활기찬 | 사랑스러운 | 감미로운 | 설레는 | 저음의 | 신뢰가는 | 호기심많은 | 금쪽같은 | 싹싹한 | 열정적인 | 카리스마있는 | 구매유발하는 | 풍부한 | 장난기있는 | 개성있는 | 수줍은 | 새침한 | 속도감있는 | 느릿한 | 무뚝뚝한 | 조용한 | 중성적인 | 음성변조된 | 털털한 | 구수한 | 냉소적 중 하나로 분류해줘.
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

    let resultJson = responseJson.choices[0].message.content;
    resultJson = resultJson.replace(/```json/g, '').replace(/```/g, '').trim();   // ```json과 ``` 제거
    await fs.promises.writeFile('./characters/characters.json', resultJson, 'utf8');
    console.log('JSON output saved to characters.json');

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
            접두사([등장인물])를 기준으로 이전 문장은 반드시 줄바꿈(개행문자 \\n) 해줘.
            반드시 모든 대사를 출력할 것.
            ""이 없으면 나래이션으로 간주해줘.
            반드시 등장인물 json과 대괄호 안 접두사는 일치할 것.
            예시 : characters.json에서 "name": "조", output.txt는 [조]
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
