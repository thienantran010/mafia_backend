const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config()

const verifyJwt = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401); //unauthorized (we don't know who they are)
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_KEY,
        (err, decoded) => {
            if (err) return res.sendStatus(403); //forbidden (their access token expired)
            req.id = decoded.id;
            next();
        }
    )
}

exports.verifyJwt = verifyJwt;