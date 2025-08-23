const express = require('express');
const app = express();

// Importa o arquivo db.js onde ocorre a conexão com o banco de dados
const db = require('./db');

app.use(express.json());

app.listen(3000, () => console.log('Server running on port 3000'));