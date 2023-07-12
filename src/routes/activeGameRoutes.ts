import { Router } from 'express';
import bodyParser from 'body-parser';
import { getUserActiveGames, getActiveGame } from '../controllers/activeGameController';

const activeGameRouter = Router();
activeGameRouter.use(bodyParser.json());
activeGameRouter.use(bodyParser.urlencoded({extended: false}));

activeGameRouter.get('/getUserActiveGames', getUserActiveGames);

activeGameRouter.get('/getActiveGame/:id', getActiveGame);


export default activeGameRouter;