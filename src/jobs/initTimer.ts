import cron from 'node-cron'
import { Server } from 'socket.io'
import { DateTime } from 'luxon'; 
import updateGame from '../gameLogic/updateGame';

export default function initTimer(io : Server, gameId : string, nextPhase : string) {
    let deadline = DateTime.fromISO(nextPhase);
    cron.schedule('*/2 * * * *', () => {
        deadline = deadline.plus({minutes: 2});
        const isoString = deadline.toISO();
        if (isoString) {
            
            // update game function also updates nextPhase field  
            // updateGame(gameId, isoString);
            io.sockets.in(`${gameId}:all`).emit('next phase', isoString);
        }
    })
}