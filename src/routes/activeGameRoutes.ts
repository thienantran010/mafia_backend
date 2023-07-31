import { Router } from 'express';
import bodyParser from 'body-parser';
import { getUserActiveGames, getActiveGame, postAction, postMessage } from '../controllers/activeGameController';

const activeGameRouter = Router();
activeGameRouter.use(bodyParser.json());
activeGameRouter.use(bodyParser.urlencoded({extended: false}));

activeGameRouter.get('/getUserActiveGames', getUserActiveGames);

activeGameRouter.get('/getActiveGame/:id', getActiveGame);

activeGameRouter.post('/postAction/:gameId', postAction);

activeGameRouter.post('/postMessage/:gameId/:chat', postMessage);

export default activeGameRouter;