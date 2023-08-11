import cron from 'node-cron'
import { Server } from 'socket.io'
import { DateTime } from 'luxon'; 
import { ActiveGame, action, PlayerInterface } from '../models/activeGameModel';
import { Role, MafiaRole } from '../rolesConfig';
import { Counter, event, RunningDayState, RunningState} from './gameLogicTypes';
import { ActiveGameInterface } from '../models/activeGameModel';
import updateGame_day from './updateGame_day';
import updateGame_night from './updateGame_night';

export default async function updateGame(gameId : string | undefined, gameObj: ActiveGameInterface | undefined, isDay: boolean) {
    if (gameId) {
        const game = await ActiveGame.findById(gameId).exec();

        if (game && isDay) {
            const { newGame } = await updateGame_day(game);
            return {
                message: "Updated",
                newGame
            }
        }

        else if (game && !isDay){
            const { newGame } = await updateGame_night(game);
            return {
                message: "Updated",
                newGame
            }
        }

        else {
            return {
                message: "Game doesn't exist"
            }
        }
    }

    else if (gameObj) {
        if (isDay) {
            const {newGame} = await updateGame_day(gameObj);
            return {
                message: "Updated",
                newGame
            }
        }

        else {
            const { newGame } = await updateGame_night(gameObj);
            return {
                message: "Updated",
                newGame
            }
        }
    }

    else {
        return {
            message: "Enter game ID or game object"
        }
    }
}