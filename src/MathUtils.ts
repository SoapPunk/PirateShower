function VectorSubstraction (a: Vector3, b: Vector3) {
    let result = new Vector3(0, 0, 0)
    result.x = a.x - b.x
    result.y = a.y - b.y
    result.z = a.z - b.z
    return result
}

function VectorScale(a: Vector3, b: number) {
    let result = new Vector3(0, 0, 0)
    result.x = a.x * b
    result.y = a.y * b
    result.z = a.z * b
    return result
}

function dot(v1: Vector3, v2: Vector3) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
}

function planeRayIntersection(rayVector: Vector3, rayPoint: Vector3, planeNormal: Vector3, planePoint: Vector3) {
    var diff = VectorSubstraction(rayPoint, planePoint)
    const prod1 = dot(diff, planeNormal)
    const prod2 = dot(rayVector, planeNormal)
    if (prod2 < 0) return null
    const prod3 = prod1 / prod2
    const intersection = VectorSubstraction(rayPoint, VectorScale(rayVector, prod3))
    return intersection
}

export {
    planeRayIntersection
}
