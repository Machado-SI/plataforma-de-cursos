const request = require('supertest');
const app = require('./server');

const dotenv = require('dotenv');
dotenv.config();

describe('API Endpoints', () => {
    it('Deve responder com 201 no endpoint register', async () => {
        const response = await request(app).post('/register').send({
            nome: 'testuser2',
            senha: 'password1234'
        })
        expect(response.statusCode).toBe(201);
    }, 10000)

    // it('Deve responder com 200 no endpoint login', async () => {
    //     const response = await request(app).post('/login').send({
    //         nome: 'testuser2',
    //         senha: 'password1234'
    //     })
    //     expect(response.statusCode).toBe(200);
    // })

    //    it('Deve responder com 200 no endpoint login', async () => {
    //         const response = await request(app).get('/cursos').set('Authorization', 'Bearer token_aqui')
    //         expect(response.statusCode).toBe(200);
    //     })

    // it('Deve responder com 200 no endpoint profile', async () => {
    //     const response = await request(app).get('/profile').set('Authorization', 'Bearer token_aqui')
    //     expect(response.statusCode).toBe(200);
    // })

    // it('Deve responder com 201 no ednpoint cursos/post', async () => {
    //     const response = await request(app).post('/cursos').set('Authorization', 'Bearer token_aqui')
    //     .send({
    //         titulo: 'Curso de teste',
    //         descricao: 'Descrição do curso de teste',
    //         criador: 'Instrutor de teste',
    //         conclusao: 10
    //     })
    //     expect(response.statusCode).toBe(201);
    // })
})