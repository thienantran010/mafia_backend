import { Cron } from "croner";
import updateGame from "./updateGame";
import { ActiveGame } from '../models/activeGameModel';

export default function runGame(gameId : string) {

    const job = Cron("*/2 * * * *", async () => {
        updateGame(gameId);
        const game = await ActiveGame.findById(gameId).exec();

        if (game && game.nextPhase === "GAME ENDED") {
            job.stop();
        }
    });
}