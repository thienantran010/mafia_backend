const { Router } = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { login, logout, register, refresh, verifyEmail } = require('../controllers/authController');

// configuration
dotenv.config();
const authRouter = Router();
authRouter.use(bodyParser.json());
authRouter.use(bodyParser.urlencoded({extended: false}));

authRouter.post('/login', login);

authRouter.post('/logout', logout);

authRouter.post('/register', register);

authRouter.post('/refresh', refresh);

authRouter.post('/:recordId', verifyEmail);

exports.authRouter = authRouter;