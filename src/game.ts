import { WaveFunction } from "wave_function"

import { prototypes } from "prototypes"

const size = new Vector3(16, 1, 16)   

const wfc = new WaveFunction(size, prototypes)

for (let x=0; x<wfc.grid.length; x++) {
    for (let y=0; y<wfc.grid[x].length; y++) {
        for (let z=0; z<wfc.grid[x][y].length; z++) {
            for (let prototype in wfc.grid[x][y][z]) {
                if (prototype == "empty") continue
                if (y == 0) {
                    if(!wfc.grid[x][y][z][prototype]["floor"]) {
                        delete wfc.grid[x][y][z][prototype]
                    }
                }
            }
        }
    }
}

log("initial grid", wfc.grid)

while (!wfc.is_collapsed()) {
	wfc.iterate()
}

log("final grid", wfc.grid)
// grid: side1, height, side2
// grid: x, y, z

// Forward -> z+1
// Backward -> z-1
// Right -> x+1
// Left -> x-1


const core = new Entity()
core.addComponent(new Transform({
    position: new Vector3(16, 0.2, 16),
    scale: new Vector3(0.1, 0.1, 0.1)
}))
engine.addEntity(core)

for (let x=0; x<wfc.grid.length; x++) {
    for (let y=0; y<wfc.grid[x].length; y++) {
        for (let z=0; z<wfc.grid[x][y].length; z++) {
            for (let prototype in wfc.grid[x][y][z]) {
                let dict = wfc.grid[x][y][z][prototype]
                let mesh_name = dict[wfc.MESH_NAME]
				// let mesh_rot = dict[wfc.MESH_ROT]
                if (mesh_name=="-1") continue

                let rotation = Quaternion.Euler(0, -180, 0)
                if (wfc.grid[x][y][z][prototype]["mesh_rotation"] == 1) {
                    rotation = Quaternion.Euler(0, -90, 0)
                } else if (wfc.grid[x][y][z][prototype]["mesh_rotation"] == 2) {
                    rotation = Quaternion.Euler(0, 0, 0)
                } else if (wfc.grid[x][y][z][prototype]["mesh_rotation"] == 3) {
                    rotation = Quaternion.Euler(0, -270, 0)
                }

                const part = new Entity()
                part.addComponent(new GLTFShape("models/"+mesh_name+".gltf"))
                part.addComponent(new Transform({
                    position: new Vector3(x*2, y*2, z*2),
                    rotation
                }))
                //engine.addEntity(part)
                part.setParent(core)
            }
        }
    }
}
