const { Router } = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { createOpenGame, getAllOpenGames, deleteOpenGame, addPlayerToGame, removePlayerFromGame } = require('../controllers/openGameController');

// configuration
dotenv.config();
const authRouter = Router();
authRouter.use(bodyParser.json());
authRouter.use(bodyParser.urlencoded({extended: false}));

const openGameRouter = Router();
openGameRouter.use(bodyParser.json());
openGameRouter.use(bodyParser.urlencoded({extended: false}));

openGameRouter.post('/createOpenGame', createOpenGame);

openGameRouter.get('/getAllOpenGames', getAllOpenGames);

openGameRouter.delete('/deleteOpenGame', deleteOpenGame);

openGameRouter.post('/addPlayerToGame', addPlayerToGame);

openGameRouter.post('/removePlayerFromGame', removePlayerFromGame);

exports.openGameRouter = openGameRouter;