const express = require('express')
const app = express();
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs') 
const yup = require('yup')

// Middleware para proteger rotas
const protect = require('./middleware')

// Importa o arquivo db.js onde ocorre a conexão com o banco de dados
const db = require('./db')

app.use(express.json())
dotenv.config()

// Validação de campos para registro com Yup
const JWT_SECRET = process.env.JWT_SECRET
const registerSchema = yup.object().shape({
    nome: yup.string().required(),
    senha: yup.string().required().min(6),
    type: yup.string().oneOf(['admin', 'user']).required()
})

// Validação de campos para login com Yup
const loginSchema = yup.object().shape({
    nome: yup.string().required(),
    senha: yup.string().required().min(6)
})

// Validação de campos para inscrição com Yup
const inscricoesSchema = yup.object().shape({
    curso_id: yup.number().required().integer().positive()
})

// Rota para registrar um novo usuário
app.post('/register', async (req,res) => {
    try {
        const {nome, senha, type} = await registerSchema.validate(req.body, {
            abortEarly: false
        }) 
        const hashedPassword = await bcrypt.hash(senha, 10)
        const novoUsuario = await db.oneOrNone(
            'INSERT INTO usuarios (name, senha, type) VALUES ($1, $2, $3) RETURNING id, name', [nome, hashedPassword, type]
        )
        if(!novoUsuario) {
            return res.status(500).json({message: 'Erro ao registrar usuário'})
        }
        console.log('Novo usuário registrado:', novoUsuario)
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

// Rota para login
app.post('/login', async (req, res) => {
    try {
        const {nome, senha} = await loginSchema.validate(req.body, {
            abortEarly: false
        })
        
        const user = await db.oneOrNone('SELECT * FROM usuarios WHERE name = $1', [nome])
        
        if(!user) {
            return res.status(401).json({message: 'Usuário não encontrado'})
        }
        
        const comparePassword = await bcrypt.compare(senha, user.senha)
        
        if(!comparePassword) {
            return res.status(400).json({message: 'Senha incorreta'})
        }

        // Gerar o token JWT
        const token = jwt.sign({id: user.id, nome: user.name, type: user.type}, JWT_SECRET, {expiresIn: '1h'})
        console.log('Usuário logado:', token)
        return res.status(200).json({ token })
    } catch (error) {
        if(error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Erro de validação',
                errors: error.errors
            })
        }
        console.error('Erro ao fazer login:', error)
        res.status(500).json({message: 'Erro ao fazer login'})
    }
})


// Rota protegida para buscar todos os cursos
app.get('/cursos', protect, async (req, res) => {
    try {
        console.log('Usuário autenticado:', req.user)
        
        const cursos = await db.any('SELECT * FROM cursos')
        if(cursos.length === 0) {
            return res.status(404).json({message: 'Nenhum curso encontrado'})
        }
        console.log(cursos)
        res.status(200).json(cursos)
    } catch (error) {
        console.error('Erro ao buscar cursos:', error)
        res.status(500).json({message: 'Erro ao buscar cursos'})
    }
})

// Rota protegida para criar uma nova inscrição
app.post('/inscricoes', protect, async (req,res) => {
    try {
        const {curso_id} = req.body
        const usuario_id = req.user.id

        await inscricoesSchema.validate(req.body, {
            abortEarly: false
        })

        const cursoExiste = await db.oneOrNone('SELECT * FROM cursos WHERE id = $1', [curso_id])
        if(!cursoExiste) {
            return res.status(404).json({message: 'Curso não encontrado'})
        }

        const inscricaoExiste = await db.oneOrNone(
            'SELECT * FROM inscricoes WHERE usuario_id = $1 AND curso_id = $2', [usuario_id, curso_id]
        )
        if(inscricaoExiste) {
            return res.status(400).json({message: 'Usuário já inscrito nesse curso'})
        }

        const novaInscricao = await db.one(
            'INSERT INTO inscricoes (usuario_id, curso_id) VALUES ($1, $2) RETURNING id, usuario_id, curso_id, data_inscricao',
            [usuario_id, curso_id]
        )
        if(!novaInscricao) {
            return res.status(500).json({message: 'Erro ao criar inscrição'})
        }

        console.log('Nova inscrição criada:', novaInscricao)
        res.status(201).json(novaInscricao)
    } catch (error) {
        if(error.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Erro de validação',
                errors: error.errors
            })
        }
        console.error('Erro ao criar inscrição:', error)
        res.status(500).json({message: 'Erro ao criar inscrição'})
    }
})

// Rota protegida para buscar o perfil do usuário autenticado
app.get('/profile', protect, async (req, res) => {
    try {
        const usuario = req.user

        console.log('Dados do usuário:', { usuario })
        res.status(200).json({usuario})
    } catch (error) {
        console.log('Erro ao buscar perfil do usuário:', error)
        res.status(500).json({message: 'Erro ao buscar perfil do usuário'})
    }
})

if(process.env.NODE_ENV !== 'test') {
    app.listen(3000, () => console.log('Server running on port 3000'));
}

module.exports = app; // Exporta o app para testes