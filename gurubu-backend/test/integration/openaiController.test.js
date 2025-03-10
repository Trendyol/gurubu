const request = require('supertest');
const express = require('express');
const openaiController = require('../../controllers/openaiController');

const app = express();
app.use(express.json());
app.post('/openai/ask', openaiController.askAssistant);

jest.setTimeout(60000);

describe('OpenAI Controller Testleri', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  test('askAssistant integration test', async () => {
    
    
    const testData = {
      boardName: 'Test board',
      issueSummary: 'Kullanıcı girişi sayfası oluşturulmalı',
      issueDescription: 'Kullanıcıların sisteme giriş yapabileceği bir sayfa oluşturulmalı. Sayfa email ve şifre alanı içermeli.'
    };
    
    const response = await request(app)
      .post('/openai/ask')
      .send(testData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('response');
    expect(response.body).toHaveProperty('threadId');
    console.log('OpenAI yanıtı:', response.body.response);
  })
});
