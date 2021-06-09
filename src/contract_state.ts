export const ObjectTypes = {
    CUBE: 0
}

export interface ObjectState {
    type: number,    // 0 to 65535
    x_pos: number,   // 0 to 255
    y_pos: number,   // 0 to 255
    z_pos: number,   // 0 to 255
    rotation: number // 0 to 255
}

export interface GameState {
    amount_of_objects: number,
    objects: Array<ObjectState>
}


export function encode(state: GameState) {

    const buffer = new ArrayBuffer((state.amount_of_objects*6)+1)

    const amount_of_objects = new Uint16Array(buffer, 0, 1) // 1

    const types = new Uint16Array(buffer, 2, state.amount_of_objects) // 2
    const x_pos = new Uint8Array(buffer, (state.amount_of_objects*2)+1, 2) // 2
    const y_pos = new Uint8Array(buffer, (state.amount_of_objects*3)+1, 2) // 2
    const z_pos = new Uint8Array(buffer, (state.amount_of_objects*4)+1, 2) // 2
    const rotations = new Uint8Array(buffer, (state.amount_of_objects*5)+1, 2) // 2


    amount_of_objects[0] = state.amount_of_objects
    for (let n=0; n<state.objects.length; n++) {
        types[n] = state.objects[n].type
        x_pos[n] = state.objects[n].x_pos
        y_pos[n] = state.objects[n].y_pos
        z_pos[n] = state.objects[n].z_pos
        rotations[n] = state.objects[n].rotation
    }


    log(amount_of_objects[0])

    return buffer
}
