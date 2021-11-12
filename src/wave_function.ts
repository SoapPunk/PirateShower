const pX = 0
const pY = 1
const nX = 2
const nY = 3
const pZ = 4
const nZ = 5

/*interface Neighbours {
    [id: string]: Array<string>
}*/

interface Prototype {
    "mesh_name": string,
    "mesh_rotation": number,
    "top": boolean,
    "floor": boolean,
    "weight": number,
    "hashes": {
        "up": string,
        "down": string,
        "left": string,
        "right": string,
        "forward": string,
        "backward": string
    }
    "valid_neighbours": {
        "up": Array<string>,
        "down": Array<string>,
        "left": Array<string>,
        "right": Array<string>,
        "forward": Array<string>,
        "backward": Array<string>
    }
}

export interface AllPrototypes { [id: string]: Prototype; }

export class WaveFunction {
    size: Vector3
    grid: Array< Array< Array<AllPrototypes> > > = []
    stack: Array<Vector3> = []

    MESH_NAME: string = "mesh_name"
    MESH_ROT = "mesh_rotation"
    NEIGHBOURS = "valid_neighbours"
    CONSTRAIN_TO = "constrain_to"
    CONSTRAIN_FROM = "constrain_from"
    CONSTRAINT_BOTTOM = "bot"
    CONSTRAINT_TOP = "top"
    WEIGHT = "weight"

    constructor (size: Vector3, all_prototypes: AllPrototypes) {
        this.size = size
        for (let _x=0; _x<size.x; _x++) {
            let x = []
            for (let _y=0; _y<size.y; _y++) {
                let y = []
                for (let _z=0; _z<size.z; _z++) {
                    y.push({ ...all_prototypes })
                }
                x.push(y)
            }
            this.grid.push(x)
        }
    }

    is_collapsed() {
        for (let x=0; x<this.grid.length; x++) {
            for (let y=0; y<this.grid[x].length; y++) {
                for (let z=0; z<this.grid[x][y].length; z++) {
                    if (this.get_entropy(new Vector3(x, y, z)) > 1) return false
                }
            }
        }
        return true
    }

    get_possibilities(coords: Vector3): AllPrototypes {
        return this.grid[coords.x][coords.y][coords.z]
    }

    get_possible_neighbours(coords: Vector3, dir: Vector3) {
        let valid_neighbours = []
        let prototypes = this.get_possibilities(coords)
        let dir_idx = this.direction_to_index(dir)
        for (let prototype in prototypes) {
            // var neighbours = prototypes[prototype][this.NEIGHBOURS][dir_idx]
            var neighbours = prototypes[prototype]["valid_neighbours"][dir_idx]
            for (let n=0; n<neighbours.length; n++) {
                if (valid_neighbours.indexOf(neighbours[n])<0) {
                    valid_neighbours.push(neighbours[n])
                }
            }
        }
        return valid_neighbours
    }

    collapse_coords_to(coords: Vector3, prototype_name: string) {
        let prototype = { ... this.grid[coords.x][coords.y][coords.z][prototype_name]}
        this.grid[coords.x][coords.y][coords.z] = {}
        this.grid[coords.x][coords.y][coords.z][prototype_name] = prototype
    }

    collapse_at(coords: Vector3) {
        let possible_prototypes = { ... this.grid[coords.x][coords.y][coords.z]}
        let selection = this.weighted_choice(possible_prototypes)
        this.grid[coords.x][coords.y][coords.z] = {}
        this.grid[coords.x][coords.y][coords.z][selection] = possible_prototypes[selection]
    }

    weighted_choice(prototypes: AllPrototypes): string {
        /*
        let proto_weights = {}
        for (let p in prototypes) {
            let w: number = prototypes[p][WEIGHT]
            w += Math.random() //TODO
            proto_weights[w] = p
        }
        // Translate to typescript
        var weight_list = proto_weights.keys()
    	weight_list.sort()
    	return proto_weights[weight_list[-1]]
        */
        return Object.keys(prototypes)[Math.floor(Math.random()*Object.keys(prototypes).length)]
    }

    constrain(coords: Vector3, prototype_name: string) {
        delete this.grid[coords.x][coords.y][coords.z][prototype_name]
    }

    get_entropy(coords: Vector3) {
        return Object.keys(this.grid[coords.x][coords.y][coords.z]).length
    }

    get_min_entropy_coords(): Vector3 {
        let min_entropy
        let coords: Vector3 = new Vector3()
        for (let x=0; x<this.grid.length; x++) {
            for (let y=0; y<this.grid[x].length; y++) {
                for (let z=0; z<this.grid[x][y].length; z++) {
                    let entropy = this.get_entropy(new Vector3(x, y, z))
                    if (entropy > 1) {
                        entropy += Math.random()
                        if (!min_entropy || entropy < min_entropy) {
                            min_entropy = entropy
						    coords = new Vector3(x, y, z)
                        }
                    }
                }
            }
        }
        return coords
    }

    iterate(single_iteration=false) {
        let coords: Vector3 = this.get_min_entropy_coords()
        //log("collapse", coords)
        this.collapse_at(coords)
        this.propagate(coords, single_iteration)
        //log("iteration")
    }

    propagate(co_ords: Vector3, single_iteration=false) {
        //if (co_ords) {
        //    this.stack.push(co_ords)
        //}
        this.stack = []
        this.stack.push(co_ords)
        while (this.stack.length > 0) {
            let cur_coords: Vector3 = this.stack.shift()
            //log("checking", cur_coords)

            // Iterate over each adjacent cell to this one
            const valid_dirs = this.valid_dirs(cur_coords)
            for (let d=0; d<valid_dirs.length; d++) {
                let other_coords = new Vector3(
                    cur_coords.x + valid_dirs[d].x,
                    cur_coords.y + valid_dirs[d].y,
                    cur_coords.z + valid_dirs[d].z
                )
                // Get allowed neighbours on that direction
                let allowed_neighbours = this.get_possible_neighbours(cur_coords, valid_dirs[d])
                // Get current superposition on that cell
                let other_possible_prototypes = { ...this.get_possibilities(other_coords) }

                // If already collapsed skip
                if (Object.keys(other_possible_prototypes).length == 0) continue

                // For each supperposition on that cell
                for (let other_prototype in other_possible_prototypes) {
                    // If a prototype is not an allowed neighbour
                    // delete it from the superposition in that cell
                    if (allowed_neighbours.indexOf(other_prototype) < 0) {
                        //log(cur_coords, other_prototype, " is not allowed at ", this.direction_to_index(valid_dirs[d]), " for ", Object.keys(this.grid[cur_coords.x][cur_coords.y][cur_coords.z]))
                        this.constrain(other_coords, other_prototype)
                        if (this.stack.indexOf(other_coords) < 0) {
                            this.stack.push(other_coords)
                        }
                    }
                }
                if (single_iteration) break
            }
        }
    }

    valid_dirs(coords: Vector3): Array<Vector3> {
        const {x, y, z} = coords

        let width = this.size.x
    	let height = this.size.y
    	let length = this.size.z
    	let dirs = []

        if (x > 0) dirs.push(Vector3.Left())
    	if (x < width-1) dirs.push(Vector3.Right())
    	if (y > 0) dirs.push(Vector3.Down())
    	if (y < height-1) dirs.push(Vector3.Up())
    	if (z > 0) dirs.push(Vector3.Backward())
    	if (z < length-1) dirs.push(Vector3.Forward())

    	return dirs
    }

    // Switch left/right and formward/backward
    direction_to_index(dir: Vector3): string {
        if (Vector3.Left().equals(dir)) return "left"
        else if (Vector3.Right().equals(dir)) return "right"
        else if (Vector3.Forward().equals(dir)) return "forward"
        else if (Vector3.Backward().equals(dir)) return "backward"
        else if (Vector3.Up().equals(dir)) return "up"
        else if (Vector3.Down().equals(dir)) return "down"
        else return "down."
    }
}
