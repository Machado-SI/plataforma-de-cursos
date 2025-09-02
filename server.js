const express = require('express')
const app = express();
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs') 
const yup = require('yup')

// Middleware para proteger rotas
const protect = require('./middleware')

// Importa o arquivo db.js onde ocorre a conexão com o banco de dados
const db = require('./db');

app.use(express.json())
dotenv.config()

// Validação de campos para registro com Yup
const JWT_SECRET = process.env.JWT_SECRET
const registerSchema = yup.object().shape({
    nome: yup.string().required(),
    senha: yup.string().required().min(6)
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
        const {nome, senha} = await registerSchema.validate(req.body, {
            abortEarly: false
        }) 

        // Faz o hash da senha antes de salvar no banco
        const hashedPassword = await bcrypt.hash(senha, 10)

        // Verifica se existe usuários no banco de dados
        const totalUsuarios = await db.one('SELECT COUNT(*) as count FROM usuarios')

        // Verefica se é o primeiro usuário
        if(totalUsuarios.count == 0) {
            const type = 'admin'

            // Se não houver usuários, o primeiro será admin
            const primeiroUsuario = await db.one('INSERT INTO usuarios (name, senha, type) VALUES ($1, $2, $3) RETURNING id, name, type', [nome, hashedPassword, type])
            
            if(!primeiroUsuario) {
                return res.status(500).json({message: 'Erro ao registrar o primeiro usuário'})
            }
            console.log('Novo usuário registrado:', primeiroUsuario)
            res.status(201).json(primeiroUsuario)
        } else {
            // Se já houver usuários, os próximos serão do tipo 'user'
            const novoUsuario = await db.oneOrNone(
                'INSERT INTO usuarios (name, senha, type) VALUES ($1, $2, $3) RETURNING id, name', [nome, hashedPassword, 'user']
            )
            if(!novoUsuario) {
                return res.status(500).json({message: 'Erro ao registrar usuário'})
            }
            console.log('Novo usuário registrado:', novoUsuario)
            res.status(201).json(novoUsuario)
        }
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

        // Configurações do token
        const options = {expiresIn: process.env.NODE_ENV === 'test' ? '1h' : '30d'}

        // Gerar o token JWT
        const token = jwt.sign({id: user.id, nome: user.name, type: user.type}, JWT_SECRET, options)
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

// Rota protegida para criar um novo curso (apenas para admins)
app.post('/cursos', protect, async (req, res) => {
    try {
        const usuario = req.user

        // Verifica se o usuário é admin
        if(usuario.type !== 'admin') {
            console.log('Acesso negado. Usuário não é admin:', usuario)
            return res.status(403).json({message: 'Acesso negado. Apenas administradores podem criar cursos.'})
        }
        const {titulo, descricao, criador, conclusao} = req.body
        const novoCurso = await db.one(
            'INSERT INTO cursos (name, description, creator, averagetimeinhours) VALUES ($1, $2, $3, $4) RETURNING id, name, description, creator', [titulo, descricao, criador, conclusao]
        )
        if(!novoCurso) {
            return res.status(500).json({message: 'Erro ao criar curso'})
        }
        console.log('Novo curso criado:', novoCurso)
        res.status(201).json(novoCurso)
    } catch (error) {
        console.error('Erro ao criar curso:', error)
        res.status(500).json({message: 'Erro ao criar curso'})
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

// Rota protegida para deletar um curso (apenas para admins)
app.delete('/cursos/:id', protect, async (req, res) => {
    try {
        const deletarCurso = await db.result('DELETE FROM cursos WHERE id = $1 RETURNING *', [req.params.id])

        // Verifica se o curso foi encontrado ou já foi deletado
        if(deletarCurso.rowCount === 0) {
            return res.status(500).json({message: 'Curso não encontrado ou já deletado'})
        }

        // Exibe o curso deletado no console para verificação
        // [0] porque o RETURNING retorna um array de objetos que contem os dados do curso deletado, e 0 porque é um array de objetos e queremos só a primeira parte onde contém os dados do curso
        console.log('Curso deletado:', deletarCurso.rows[0])
        res.status(200).json({message: 'Curso deletado com sucesso'})
    } catch (error) {
        console.error('Erro ao deletar curso:', error)
        res.status(500).json({message: 'Erro ao deletar curso'})
    }
})

app.delete('/inscricoes/:id', async (req, res) => {
    try {
        
    } catch (error) {
        
    }
})

// Inicia o servidor na porta 3000
// Adiciona uma verificação para não iniciar o servidor durante os testes
if(process.env.NODE_ENV !== 'test') {
    app.listen(3000, () => console.log('Server running on port 3000'));
}

module.exports = app; // Exporta o app para testes