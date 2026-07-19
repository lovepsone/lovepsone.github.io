/*
* @author lovepsone 2026
* @ver - 0.0.1 
*/
let _BodysVolume = new Map();

export class DeformableVolumeBody {

    constructor(physics, scene, cookingParams) {

        this.physics = physics;
        this.scene = scene;
        this.cookingParams = cookingParams;
    }

    Add(mesh, option = {}) {

        console.log(mesh);
        const points = mesh.geometry.attributes.position.array;
        const CollisionPoints = new PhysX.PxArray_PxVec3();
        const SimulationPoints = new PhysX.PxArray_PxVec3();
        const index = mesh.geometry.index.array;
        const CollisionIndex = new PhysX.PxArray_PxU32();
        const SimulationIndex = new PhysX.PxArray_PxU32();

        for (let i = 0; i < points.length; i += 3) {

            const tmpVec3 = new PhysX.PxVec3(
                points[i + 0],
                points[i + 1],
                points[i + 2],
            );

            CollisionPoints.pushBack(tmpVec3);
            SimulationPoints.pushBack(tmpVec3);
            PhysX.destroy(tmpVec3);
        }

        for (let i = 0; i < index.length; i++) {

            CollisionIndex.pushBack(index[i]);
            SimulationIndex.pushBack(index[i]);
        }

        //Compute collision mesh
        const SimpleTriangleMesh = new PhysX.PxSimpleTriangleMesh();
        SimpleTriangleMesh.points.count = CollisionPoints.size();
        SimpleTriangleMesh.points.stride = 12;
        SimpleTriangleMesh.points.data = CollisionPoints.begin();

        SimpleTriangleMesh.triangles.count = CollisionIndex.size() / 3;
        SimpleTriangleMesh.triangles.stride = 12;
        SimpleTriangleMesh.triangles.data = CollisionIndex.begin();

        const ConformingTetrahedronMesh = PhysX.PxTetMaker.prototype.createConformingTetrahedronMesh(SimpleTriangleMesh, CollisionPoints, CollisionIndex);
        const TMDescCollision = new PhysX.PxTetrahedronMeshDesc(CollisionPoints, CollisionIndex);

        //Compute simulation mesh
        const numVoxelsAlongLongestAABBAxis = 20;
        const vertexToTet = new PhysX.PxArray_PxU32(TMDescCollision.points.count);

        const VoxelTetrahedronMesh = PhysX.PxTetMaker.prototype.createVoxelTetrahedronMesh(TetrahedronMeshDesc, numVoxelsAlongLongestAABBAxis, SimulationPoints, SimulationIndex, vertexToTet.begin());
        const TMDescSim = new PhysX.PxTetrahedronMeshDesc(SimulationPoints, SimulationIndex);

        //const mesh = 
    }
}