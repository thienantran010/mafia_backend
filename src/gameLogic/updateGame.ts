import cron from 'node-cron'
import { Server } from 'socket.io'
import { DateTime } from 'luxon'; 
import { ActiveGame, action, PlayerInterface } from '../models/activeGameModel';
import { Role, MafiaRole } from '../rolesConfig';
import { Counter, event, RunningDayState, RunningState} from './gameLogicTypes';
import updateGame_day from './updateGame_day';
import updateGame_night from './updateGame_night';

export default async function updateGame(gameId : string, nextPhase: string) {
    const game = await ActiveGame.findById(gameId).exec();
    if (game) {

        const isDay = game.library.length % 2 === 1;

        if (isDay) {
            updateGame_day(game, nextPhase);
        }

        else {
            updateGame_night(game, nextPhase);
        }
    }
}