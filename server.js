const express = require('express')
const app = express();
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs') 
const yup = require('yup')

// Importa o arquivo db.js onde ocorre a conexão com o banco de dados
const db = require('./db')

app.use(express.json())
dotenv.config()

// Validação de campos para registro com Yup
const JWT_SECRET = process.env.JWT_SECRET
const registerSchema = yup.object().shape({
    nome: yup.string().required(),
    senha: yup.string().required().min(6)
})

// Rota para buscar todos os cursos
app.get('/cursos', async (req, res) => {
    try {
        const cursos = await db.any('SELECT * FROM cursos')
        if(cursos.length === 0) {
            return res.status(404).json({message: 'Nenhum curso encontrado'})
        }
        res.status(200).json(cursos)
    } catch (error) {
        console.error('Erro ao buscar cursos:', error)
        res.status(500).json({message: 'Erro ao buscar cursos'})
    }
})

// Rota para registrar um novo usuário
app.post('/register', async (req,res) => {
    try {
        const {nome, senha} = await registerSchema.validate(req.body, {
            abortEarly: false
        }) 
        const hashedPassword = await bcrypt.hash(senha, 10)
        const novoUsuario = await db.one(
            'INSERT INTO usuarios (nome, senha) VALUES ($1, $2) RETURNING id, nome', [nome, hashedPassword]
        )
        if(!novoUsuario) {
            return res.status(500).json({message: 'Erro ao registrar usuário'})
        }
        res.status(201).json(novoUsuario)
    } catch (error) {
        if(error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Erro de validação',
                errors: error.errors
            })
        }
        res.status(500).json(error.message)
    }
})

app.listen(3000, () => console.log('Server running on port 3000'));