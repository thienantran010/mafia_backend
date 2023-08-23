import { Role } from "../rolesConfig";
import { PlayerInterface, ActionInterface } from "../models/activeGameModel";

export interface Counter {
    [username : string] : number;
}

export interface event {
    user: {
        username: string;
        role: Role;
    },

    target: {
        username: string;
        role: Role;
    }
}

export interface RunningState {
    [username: string]: {
        toastedBy: string[];
        healedBy: string[];
        attackedBy: string[];
        checkedBy: string[];
        snipedBy: string[];
        copTarget: string;
        creeperTarget: string;
        gravediggerTarget: string;
    }
}

export interface RunningDayState {
    [username: string]: {
        blownBy: string[];
        executed: boolean;
    }
}

export type UpdateFunction = (state: PlayerInterface, actions: ActionInterface, libraryIndex: string, shuffleCreepVisits?: boolean) => {
    didUpdateState: boolean;
    didUpdateLibrary: boolean;
    updatedState: PlayerInterface;
    newLibEntry: string[];
}