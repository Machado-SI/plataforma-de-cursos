const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

const protect = (req, res, next) => {
    try {
        let token
        if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            return res.status(401).json({message: 'Token não fornecido'})
        }
        token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, JWT_SECRET)

        // Adiciona os dados do usuário decodificados ao objeto req
        req.user = decoded
        
        next()
    } catch (error) {
        return res.status(401).json({message: 'Token inválido ou expirado'})
    }
}

module.exports = protect