import { ActionInterface } from "../models/activeGameModel";

type VotesState = "none" | "random" | "landslide"
export const initDayVotes = (players : string[], state : VotesState, toExecute: string[]) => {
    const actions : ActionInterface = {}

    if(state === "random") {
        const numChunks = toExecute.length;

        if (numChunks === 0) {
            throw new Error("Missing person to execute");
        }

        else if (players.length % numChunks != 0) {
            throw new Error("Not enough votes for a complete random")
        }

        else {
            const chunkSize = players.length / numChunks;
            for (const [index, username] of toExecute.entries()) {
                const start = index * chunkSize;
                const end = start + chunkSize;
                const voters = players.slice(start, end);
                for (const voter of voters) {
                    actions[voter] = {
                        dayVote: username
                    }
                }
            }
        }
    }

    else if (state === "landslide") {
        if (toExecute.length === 0) {
            throw new Error("Missing person to execute");
        }

        else {
            for (const username of players) {
                actions[username] = {
                    dayVote: toExecute[0]
                }
            }
        }
    }

    return actions;
}