const express = require('express')
const app = express();

// Importa o arquivo db.js onde ocorre a conexão com o banco de dados
const db = require('./db')

app.use(express.json())

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

app.listen(3000, () => console.log('Server running on port 3000'));