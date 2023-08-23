import { PlayerInterface, ActionInterface } from "../models/activeGameModel";
import updateGame_night from "../gameLogic/updateGame_night";
import { UpdateFunction } from "../gameLogic/gameLogicTypes";

export default function initTest(description: string, 
                                 updateFunction: UpdateFunction,
                                 curState: PlayerInterface, 
                                 curActions: ActionInterface,
                                 libIndex: string,
                                 expectedState: PlayerInterface,
                                 expectedLibEntry: string[],
                                 shouldLibUpdate: boolean,
                                 shouldStateUpdate: boolean,
                                 shuffleCreepVisits = true) {

    const { updatedState, newLibEntry, didUpdateLibrary, didUpdateState} = updateFunction(curState, curActions, libIndex, shuffleCreepVisits);
    test(description, () => {
        expect(updatedState).toEqual(expectedState);
        expect(newLibEntry).toEqual(expectedLibEntry);
        expect(didUpdateLibrary).toEqual(shouldLibUpdate);
        expect(didUpdateState).toEqual(shouldStateUpdate);
    });
}