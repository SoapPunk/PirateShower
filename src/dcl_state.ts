import { GameState } from 'contract_state'

export class DCL_State {
    constructor() {

    }

    buildFromState(state: GameState) {
        for (let n=0; n<state.objects.length; n++) {
            const tmp = new Entity()
            tmp.addComponent(new BoxShape())
            tmp.addComponent(new Transform({
                position: new Vector3(
                    state.objects[n].x_pos / 10,
                    state.objects[n].y_pos / 10,
                    state.objects[n].z_pos / 10
                )
            }))
            engine.addEntity(tmp)
        }
    }
}
