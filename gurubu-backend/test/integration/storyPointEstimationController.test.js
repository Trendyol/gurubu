const request = require('supertest');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

app.use(bodyParser.json());
app.use(cors());

const storyPointRoutes = require('../../routes/storyPointRoutes');
app.use('/storypoint', storyPointRoutes);

describe('Story Point Estimation Controller', () => {
  jest.setTimeout(60000); // 60 saniye timeout
  
  // OpenAI API'ye erişim için gerekli ortam değişkenlerini kontrol et
  beforeAll(() => {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY ortam değişkeni ayarlanmamış. Test başarısız olabilir.');
    }
    
    if (!process.env.OPENAI_ASSISTANT_ID) {
      console.warn('OPENAI_ASSISTANT_ID ortam değişkeni ayarlanmamış. Test başarısız olabilir.');
    }
  });
  
  test('Bir issue için story point tahmini yapabilmeli', async () => {
    const testData = {
      boardName: 'Test board',
      issueSummary: 'Kullanıcı girişi sayfası oluşturulmalı',
      issueDescription: 'Kullanıcıların sisteme giriş yapabileceği bir sayfa oluşturulmalı. Sayfa email ve şifre alanı içermeli.'
    };
    
    const response = await request(app)
      .post('/storypoint/estimate')
      .send(testData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('response');
    expect(response.body).toHaveProperty('threadId');
    
    console.log('OpenAI yanıtı:', response.body.response);
    
    const responseStr = response.body.response.trim();
    const isNumeric = /^\d+$/.test(responseStr);
    expect(isNumeric).toBe(true);

    const validSPValues = [1, 2, 3, 5, 8, 13];
    const responseNum = parseInt(responseStr, 10);
    expect(validSPValues.includes(responseNum)).toBe(true);
    
    // Thread ID'yi sakla
    const threadId = response.body.threadId;
    console.log('Thread ID:', threadId);
    

    if (threadId) {
      const followUpData = {
        boardName: 'Test board',
        issueSummary: 'Kullanıcı girişi sayfası güncellenmeli',
        issueDescription: 'Mevcut giriş sayfasına şifre sıfırlama özelliği eklenmeli.',
        threadId: threadId
      };
      
      const followUpResponse = await request(app)
        .post('/storypoint/estimate')
        .send(followUpData);
      
      expect(followUpResponse.status).toBe(200);
      expect(followUpResponse.body).toHaveProperty('response');
      expect(followUpResponse.body).toHaveProperty('threadId');
      expect(followUpResponse.body.threadId).toBe(threadId); 
      
      console.log('Takip sorusu yanıtı:', followUpResponse.body.response);
      
      const followUpResponseStr = followUpResponse.body.response.trim();
      const isFollowUpNumeric = /^\d+$/.test(followUpResponseStr);
      expect(isFollowUpNumeric).toBe(true);

      const validSPValues = [1, 2, 3, 5, 8, 13];
      const followUpResponseNum = parseInt(followUpResponseStr, 10);
      expect(validSPValues.includes(followUpResponseNum)).toBe(true);
    }
  });
  
});
