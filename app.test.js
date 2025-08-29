const request = require('supertest');
const app = require('./server');

describe('API Endpoints', () => {
    // it('Deve responder com 201 no endpoint register', async () => {
    //     const response = await request(app).post('/register').send({
    //         nome: 'testuser',
    //         senha: 'password123',
    //         type: 'user'
    //     })
    //     expect(response.statusCode).toBe(201);
    // })

    // it('Deve responder com 200 no endpoint login', async () => {
    //     const response = await request(app).post('/login').send({
    //         nome: 'testuser',
    //         senha: 'password123'
    //     })
    //     expect(response.statusCode).toBe(200);
    // })

    //    it('Deve responder com 200 no endpoint login', async () => {
    //         const response = await request(app).get('/cursos').set('Authorization', 'Bearer token_aqui')
    //         expect(response.statusCode).toBe(200);
    //     })

    it('Deve responder com 200 no endpoint profile', async () => {
        const response = await request(app).get('/profile').set('Authorization', 'Bearer token_aqui')
        expect(response.statusCode).toBe(200);
    })
})