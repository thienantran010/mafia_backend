import { Cron } from "croner";
import updateGame from "./updateGame";
import { ActiveGame } from '../models/activeGameModel';
import { Duration } from "luxon";
import { Role } from "../rolesConfig";

export default function runGame(gameId : string) {

    const job = Cron("* * * * * *", async () => {
        const game = await ActiveGame.findById(gameId).exec();
        if (game) {
            const newTimeLeftDur = Duration.fromISO(game.timeLeft).minus({seconds: 1}).normalize();
            const newTimeLeft = newTimeLeftDur.toISO();

            if (newTimeLeft) {
                game.timeLeft = newTimeLeft;
                game.markModified("timeLeft");
                await game.save()
                if (newTimeLeftDur.minutes === 0 && newTimeLeftDur.seconds === 0) {
                    const {updatedGame} = await updateGame(gameId);

                    if (updatedGame && updatedGame.timeLeft === "GAME ENDED") {
                        job.stop();
                    }

                    else {
                        const timeLeft = Duration.fromObject({seconds: 10}).toISO();
                        if (timeLeft) {
                            game.timeLeft = timeLeft;
                            game.markModified("timeLeft");
                            await game.save();
                        }
                    }
        
                }
            }
        }
    });
}