const grassPhysicsMaterial = new CANNON.Material("grassMaterial")
const grassPhysicsContactMaterial = new CANNON.ContactMaterial(grassPhysicsMaterial, grassPhysicsMaterial, {
  friction: 0.1,
  restitution: 0.3,
})
//
const boxPhysicsMaterial: CANNON.Material = new CANNON.Material("boxMaterial")
const boxPhysicsContactMaterial = new CANNON.ContactMaterial(grassPhysicsMaterial, boxPhysicsMaterial, {
  friction: 0.5,
  restitution: 0.3,
})

@Component("physicsBox")
export class PhysicsBox {
    loaded: boolean
    body: CANNON.Body
    timer: number

    constructor() {
        this.loaded = false
        this.body = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(new CANNON.Vec3(2, 2, 2)),
            position: new CANNON.Vec3(32-2+(Math.random()*4), 40, 32-2+(Math.random()*4)),
        })
        this.body.material = boxPhysicsMaterial
        this.timer = 0
    }
}

export class underConstruction {
    constructor() {

        const floor_e = new Entity()
        //floor_e.addComponent(new PlaneShape())
        floor_e.addComponent(new GLTFShape("models/floor.gltf"))
        floor_e.addComponent(new Transform({
            position: new Vector3(32, 0, 32),
            //rotation: Quaternion.Euler(90, 0, 0),
            //scale: new Vector3(64, 64, 1)
            scale: new Vector3(32, 1, 32)
        }))
        engine.addEntity(floor_e)



        engine.addSystem(new UpdateSystem())
    }
}

const physicsGroup = engine.getComponentGroup(PhysicsBox)
const underConstructionShape = new GLTFShape("models/UnderConstruction.gltf")

class UpdateSystem implements ISystem {
    world: CANNON.World = new CANNON.World();
    constructor() {
        this.world.gravity.set(0, -9.82, 0); // m/s²
        this.world.addContactMaterial(grassPhysicsContactMaterial)
        this.world.addContactMaterial(boxPhysicsContactMaterial)

        // Add floor
        // Create a ground plane and apply physics material
        const groundBody: CANNON.Body = new CANNON.Body({
          mass: 0, // mass == 0 makes the body static
        })
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2) // Reorient ground plane to be in the y-axis

        const groundShape: CANNON.Plane = new CANNON.Plane()
        groundBody.addShape(groundShape)
        groundBody.material = grassPhysicsMaterial
        this.world.addBody(groundBody)

    }

    timer: number = 0

    update(dt: number): void {
        const fixedTimeStep: number = 1.0 / 60.0 // seconds
        const maxSubSteps: number = 3000

        // Instruct the world to perform a single step of simulation.
        // It is generally best to keep the time step and iterations fixed.
        this.world.step(fixedTimeStep, dt, maxSubSteps)

        for (let entity of physicsGroup.entities) {
            if (!entity.getComponent(PhysicsBox).loaded) {
                this.world.addBody(entity.getComponent(PhysicsBox).body)
                entity.getComponent(PhysicsBox).loaded = true
            }
            entity.getComponent(Transform).position.copyFrom(entity.getComponent(PhysicsBox).body.position)
            entity.getComponent(Transform).rotation.copyFrom(entity.getComponent(PhysicsBox).body.quaternion)

            let overflowing = false
            if (entity.getComponent(PhysicsBox).body.position.x > 64) {
                overflowing = true
            } else if (entity.getComponent(PhysicsBox).body.position.x < 0) {
                overflowing = true
            }
            if (entity.getComponent(PhysicsBox).body.position.z > 64) {
                overflowing = true
            } else if (entity.getComponent(PhysicsBox).body.position.z < 0) {
                overflowing = true
            }

            entity.getComponent(PhysicsBox).timer += dt
            if (entity.getComponent(PhysicsBox).timer > 120 || overflowing) {
                this.world.removeBody(entity.getComponent(PhysicsBox).body)
                engine.removeEntity(entity)
            }
        }

        if (this.timer > 3) {
            this.timer = 0
            const newBox = new Entity()
            newBox.addComponent(new PhysicsBox())
            newBox.addComponent(underConstructionShape)
            newBox.addComponent(new Transform({
                scale: new Vector3(2, 2, 2)
            }))
            engine.addEntity(newBox)
        }
        this.timer += dt
    }
}
