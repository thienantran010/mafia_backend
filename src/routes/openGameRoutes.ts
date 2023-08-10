import { Router } from 'express';
import bodyParser from 'body-parser';
import { createOpenGame, getAllOpenGames, addPlayerToGame, removePlayerFromGame } from '../controllers/openGameController';

const openGameRouter = Router();
openGameRouter.use(bodyParser.json());
openGameRouter.use(bodyParser.urlencoded({extended: false}));

openGameRouter.post('/createOpenGame', createOpenGame);

openGameRouter.get('/getAllOpenGames', getAllOpenGames);

// openGameRouter.delete('/deleteOpenGame', deleteOpenGame);

openGameRouter.post('/addPlayerToGame', addPlayerToGame);

openGameRouter.post('/removePlayerFromGame', removePlayerFromGame);

export default openGameRouter;