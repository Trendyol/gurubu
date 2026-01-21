const request = require('supertest');
// Gurubu's main file is likely src/index.ts or src/app.ts
// Make sure that file exports 'app'
const app = require('../../server');

describe('Room API Integration', () => {
  it('POST /room/create should return a valid roomId', async () => {
    const payload = {
      groomingType: "0",
      nickName: 'testUser1'
    };
    const response = await request(app)
      .post('/room/create')
      .send(payload);


    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('roomID');
    console.log(response.body);
  });
});