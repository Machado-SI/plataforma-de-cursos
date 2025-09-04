const request = require('supertest');
const app = require('./server');

const dotenv = require('dotenv');
dotenv.config();

describe('API Endpoints', () => {
    
    // Teste de Registro de Usuário
    it('Deve responder com 201 no endpoint register', async () => {
        const response = await request(app).post('/register').send({
            nome: 'testuser',
            senha: 'password1234'
        })
        expect(response.statusCode).toBe(201);
    }, 10000)

    // Teste de Login de Usuário
    it('Deve responder com 200 no endpoint login', async () => {
        const response = await request(app).post('/login').send({
            nome: 'testuser',
            senha: 'password1234'
        })
        expect(response.statusCode).toBe(200);
    })

    // Teste de Perfil do Usuário
    it('Deve responder com 200 no endpoint profile', async () => {
        const response = await request(app).get('/profile').set('Authorization', 'Bearer token_aqui')
        expect(response.statusCode).toBe(200);
    })

    // Teste de Listagem de Cursos
    it('Deve responder com 200 na listagem de cursos', async () => {
        const response = await request(app).get('/cursos').set('Authorization', 'Bearer token_aqui')
        expect(response.statusCode).toBe(200);
    })

    // Teste de Criação de Curso
    it('Deve responder com 201 na criação de curso', async () => {
        const response = await request(app).post('/cursos').set('Authorization', 'Bearer token_aqui')
        .send({
            titulo: 'Curso de teste',
            descricao: 'Descrição do curso de teste',
            criador: 'Instrutor de teste',
            conclusao: 10
        })
        expect(response.statusCode).toBe(201);
    })

    // Teste de Inscrição em Curso
    it('Deve responder com 201 na inscrição em curso', async () => {
        const response = await request(app).post('/inscricao').set('Authorization', 'Bearer token_aqui').send({
            curso_id: 1
        })
        expect(response.statusCode).toBe(201);
    })

    // Teste de Cancelamento de Inscrição
    it('Deve responder com 200 no cancelamento de inscrição', async () => {
        const response = await request(app).delete('/inscricao/1').set('Authorization', 'Bearer token_aqui')
        expect(response.statusCode).toBe(200);
    })

    // Teste de Exclusão de Curso
    it('Deve responder com 200 na exclusão de curso', async () => {
        const response = await request(app).delete('/cursos/1').set('Authorization', 'Bearer token_aqui')
        expect(response.statusCode).toBe(200);
    })
})