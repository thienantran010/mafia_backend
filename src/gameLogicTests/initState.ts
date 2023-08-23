import { ActiveGameInterface, PlayerInterface, ActionInterface, PlayerEvents} from "../models/activeGameModel";
import { Role } from "../rolesConfig";

import mongoose from "mongoose";

interface initStateArgs {
    [username : string] : {
        playerId?: mongoose.Types.ObjectId;
        isAlive?: boolean;
        toastedBy?: string[];
        role?: Role;
        numActionsLeft?: number;
        events?: PlayerEvents;
    }
}

const strGenerator = (char: string) => {
    const arr = []
    for (let i = 0; i < 12; i++) {
        arr.push(char);
    }
    return arr.join('');
}
const playerIds = {
    "Mafia": new mongoose.Types.ObjectId(strGenerator("0")),
    "Godfather": new mongoose.Types.ObjectId(strGenerator("1")),
    "Kamikaze": new mongoose.Types.ObjectId(strGenerator("2")),
    "Toaster": new mongoose.Types.ObjectId(strGenerator("3")),
    "Cop": new mongoose.Types.ObjectId(strGenerator("4")),
    "Creeper": new mongoose.Types.ObjectId(strGenerator("5")),
    "Villager": new mongoose.Types.ObjectId(strGenerator("6")),
    "Bulletproof": new mongoose.Types.ObjectId(strGenerator("7")),
    "Doctor": new mongoose.Types.ObjectId(strGenerator("8")),
    "Sniper": new mongoose.Types.ObjectId(strGenerator("9")),
    "Gravedigger": new mongoose.Types.ObjectId(strGenerator("10")),
}
export const initState = (players : initStateArgs | undefined) => {
    const defaultGameState : PlayerInterface = {
        'Mafia': {
            playerId: playerIds["Mafia"],
            isAlive: true,
            toastedBy: [],
            role: "Mafia",
            numActionsLeft: Infinity,
            events: {}
        },
        'Godfather': {
            playerId: playerIds["Godfather"],
            isAlive: true,
            toastedBy: [],
            role: "Godfather",
            numActionsLeft: Infinity,
            events: {}
        },
        'Kamikaze': {
            playerId: playerIds["Kamikaze"],
            isAlive: true,
            toastedBy: [],
            role: "Kamikaze",
            numActionsLeft: 1,
            events: {}
        },
        'Toaster': {
            playerId: playerIds["Toaster"],
            isAlive: true,
            toastedBy: [],
            role: "Toaster",
            numActionsLeft: Infinity,
            events: {}
        },
        'Cop': {
            playerId: playerIds["Cop"],
            isAlive: true,
            toastedBy: [],
            role: "Cop",
            numActionsLeft: Infinity,
            events: {}
        },
        'Creeper': {
            playerId: playerIds["Creeper"],
            isAlive: true,
            toastedBy: [],
            role: "Creeper",
            numActionsLeft: Infinity,
            events: {}
        },
        'Villager': {
            playerId: playerIds["Villager"],
            isAlive: true,
            toastedBy: [],
            role: "Villager",
            numActionsLeft: 0,
            events: {}
        },
        'Bulletproof': {
            playerId: playerIds["Bulletproof"],
            isAlive: true,
            toastedBy: [],
            role: "Bulletproof",
            numActionsLeft: 1,
            events: {}
        },
        'Doctor': {
            playerId: playerIds["Doctor"],
            isAlive: true,
            toastedBy: [],
            role: "Doctor",
            numActionsLeft: Infinity,
            events: {}
        },
        'Sniper': {
            playerId: playerIds["Sniper"],
            isAlive: true,
            toastedBy: [],
            role: "Sniper",
            numActionsLeft: 1,
            events: {}
        },
        'Gravedigger': {
            playerId: playerIds["Gravedigger"],
            isAlive: true,
            toastedBy: [],
            role: "Gravedigger",
            numActionsLeft: 1,
            events: {}
        }
    }

    if (players) {
        for (const username in players) {
            defaultGameState[username] = {...defaultGameState[username], ...players[username]}
        }
    }

    return defaultGameState;
}