import { ObjectTypes, GameState } from 'contract_state'
import { DCL_State } from 'dcl_state'

const state: GameState = {
    amount_of_objects: 2, // 0 to 65535
    objects: [
        {
            type: ObjectTypes.CUBE,     // 0 to 65535
            x_pos: 70,   // 0 to 255
            y_pos: 80,   // 0 to 255
            z_pos: 90,   // 0 to 255
            rotation: 3  // 0 to 255
        },
        {
            type: ObjectTypes.CUBE,     // 0 to 65535
            x_pos: 30,   // 0 to 255
            y_pos: 40,   // 0 to 255
            z_pos: 50,   // 0 to 255
            rotation: 4  // 0 to 255
        }
    ]
}

const dcl_state = new DCL_State()

//dcl_state.buildFromState(state)

import { underConstruction } from "under_construction"

new underConstruction()
