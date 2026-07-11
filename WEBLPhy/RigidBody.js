/*
* @author lovepsone 2026
* @ver - 0.0.1 
*/

import { RigidDynamic } from './RigidDynamic.js';
import { RigidStatic } from './RigidStatic.js';

let _BodysDynamic = new Map(), _BodysStatic = new Map(); 

export class RigidBody {

    constructor(physics, scene, cookingParams) {

        this.physics = physics;
        this.scene = scene;
        this.cookingParams = cookingParams;
    }

    step() {

        _BodysDynamic.forEach((value, key, map) => {

            value.mesh.position.fromArray(value.body.getPosition());
            value.mesh.quaternion.fromArray(value.body.getQuat());
        });
    }

    add(mesh, 
        option = {
            mass: 0,
            isDynamic:
            false,
            isKinematic: false,
            type_geometry: '',
            static_friction: 0.1,
            dynamic_friction: 0.5,
            restitution: 0.1,
            FLAG_SHAPE_eSIMULATION: true,
            FLAG_SHAPE_eSCENE_QUERY: true,
            FLAG_SHAPE_eVISUALIZATION: true
        }) {

        let type = 'BoxGeometry', shape, geometry, rigid;

        if (mesh.isMesh) {

           type = mesh.geometry.type;
        } else {

            console.log('WEBLPhy:[RigidBody:add] Is not add Mesh');
            return;
        }

        if (option.type_geometry === 'TriangleGeometry' /*|| option.type_geometry === 'ConvexGeometry'*/) {

            type = option.type_geometry;
        }

        const collisionLayer = 1;
        const collisionMask = 1;
        const FilterData = new PhysX.PxFilterData(collisionLayer, collisionMask, 0, 0);
        const material = this.physics.createMaterial(option.static_friction, option.dynamic_friction, option.restitution);
        const flags = new PhysX.PxShapeFlags(PhysX.PxShapeFlagEnum.eSCENE_QUERY_SHAPE | PhysX.PxShapeFlagEnum.eSIMULATION_SHAPE |  PhysX.PxShapeFlagEnum.eVISUALIZATION);
        
        const Transform = new PhysX.PxTransform(PhysX.PxIDENTITYEnum.PxIdentity);
        const Vec3 = new PhysX.PxVec3(mesh.position.x, mesh.position.y, mesh.position.z);
        const Quat = new PhysX.PxQuat(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w);
        Transform.set_p(Vec3);
        Transform.set_q(Quat);

        if (option.isDynamic && type !== 'PlaneGeometry') {

            rigid = new RigidDynamic(this.physics, Transform)

            if (option.isKinematic) {

                rigid.setRigidBodyFlag(PhysX.PxRigidBodyFlagEnum.eKINEMATIC, true);
                rigid.setKinematic(true);
            }
        } else {

            option.isDynamic = false;
            rigid = new RigidStatic(this.physics, Transform);
        }

        switch(type) {

            case 'PlaneGeometry': {
                let w = mesh.geometry.parameters.width * 0.5;
                let h = mesh.geometry.parameters.height * 0.5;
                geometry = new PhysX.PxBoxGeometry(w, 1, h);
                //geometry = PhysX.PxPlaneGeometry();
                shape = PhysX.PxRigidActorExt.prototype.createExclusiveShape(rigid.toBody(), geometry, material, flags);
                
            }
            break;

            case 'BoxGeometry': {
                let w = mesh.geometry.parameters.width * 0.5;
                let h = mesh.geometry.parameters.height * 0.5;
                let d = mesh.geometry.parameters.depth * 0.5;
                geometry = new PhysX.PxBoxGeometry(w, h, d);
                shape = PhysX.PxRigidActorExt.prototype.createExclusiveShape(rigid.toBody(), geometry, material, flags);
            }
            break;

            case 'SphereGeometry': {
                let r = mesh.geometry.parameters.radius;
                geometry = new PhysX.PxSphereGeometry(r);
                shape = PhysX.PxRigidActorExt.prototype.createExclusiveShape(rigid.toBody(), geometry, material, flags);
            }
            break;

            case 'CapsuleGeometry': {

                let r = mesh.geometry.parameters.radius;
                let h = mesh.geometry.parameters.height;
                geometry = new PhysX.PxCapsuleGeometry(r, h / 2);

                const Vec3_z = new PhysX.PxVec3(0, 0, 1);
                const Quat_relative = new PhysX.PxQuat(Math.PI / 2, Vec3_z);
                
                const relativePose = new PhysX.PxTransform(PhysX.PxIDENTITYEnum.PxIdentity);
                relativePose.set_q(Quat_relative);

                shape = PhysX.PxRigidActorExt.prototype.createExclusiveShape(rigid.toBody(), geometry, material, flags);
                shape.setLocalPose(relativePose);
                PhysX.destroy(Vec3_z);
                PhysX.destroy(Quat_relative);
                PhysX.destroy(relativePose);
            }
            break;

            /*case 'ConvexGeometry': {

                console.log(mesh);
                let convexVerts = [];

                const points = mesh.geometry.attributes.position.array;
                const pointsVector = new PhysX.PxArray_PxVec3();

                for (let i = 0; i < points.length; i += 3) {

                    const tmpVec3 = new PhysX.PxVec3(
                        points[i + 0],
                        points[i + 1],
                        points[i + 2],
                    );

                    pointsVector.pushBack(tmpVec3);
                    PhysX.destroy(tmpVec3);
                }


                const ConvexDesc = new PhysX.PxConvexMeshDesc();
                ConvexDesc.points.count = pointsVector.size();
                ConvexDesc.points.stride = 12;
                ConvexDesc.points.data = pointsVector.begin();
                ConvexDesc.points.flags = PhysX.PxConvexFlagEnum.eCOMPUTE_CONVEX;

                const pxConvexMesh = PhysX.CreateConvexMesh(this.cookingParams, ConvexDesc);

                const s = new PhysX.PxVec3().fromArray(mesh.scale.toArray());
                const r = new PhysX.PxQuat(0, 0, 0, 1);
                const scale = new PhysX.PxMeshScale(s, r);

                geometry = new PhysX.PxConvexMeshGeometry(pxConvexMesh, scale);
                shape = PhysX.PxRigidActorExt.prototype.createExclusiveShape(rigid.toBody(), geometry, material, flags);

                PhysX.destroy(pointsVector);
                PhysX.destroy(s);
                PhysX.destroy(r);
            }
            break;*/

            case 'TriangleGeometry': {

                const points = mesh.geometry.attributes.position.array;
                const pointsVector = new PhysX.PxArray_PxVec3();
                const index = mesh.geometry.index.array;
                const indexVector = new PhysX.PxArray_PxU32();

                for (let i = 0; i < points.length; i += 3) {

                    const tmpVec3 = new PhysX.PxVec3(
                        points[i + 0],
                        points[i + 1],
                        points[i + 2],
                    );

                    pointsVector.pushBack(tmpVec3);
                    PhysX.destroy(tmpVec3);
                }

                for (let i = 0; i < index.length; i++) {

                    indexVector.pushBack(index[i]);
                }

                //const nDataBytes = points.length * points.BYTES_PER_ELEMENT;
                //const ptr = PhysX._malloc(nDataBytes);

                const TriangleDesc = new PhysX.PxTriangleMeshDesc();
                TriangleDesc.points.count = pointsVector.size();
                TriangleDesc.points.stride = 12;
                TriangleDesc.points.data = pointsVector.begin();

                TriangleDesc.triangles.count = indexVector.size() / 3;
                TriangleDesc.triangles.stride = 12;
                TriangleDesc.triangles.data = indexVector.begin();

                // cook mesh
                const pxTriangleMesh = PhysX.CreateTriangleMesh(this.cookingParams, TriangleDesc);

                const s = new PhysX.PxVec3().fromArray(mesh.scale.toArray());
                const r = new PhysX.PxQuat(0, 0, 0, 1);
                const scale = new PhysX.PxMeshScale(s, r);
                geometry = new PhysX.PxTriangleMeshGeometry(pxTriangleMesh, scale);

                if (pxTriangleMesh.releaseWithGeometry) {

                    if (pxTriangleMesh.refCnt > 0) pxTriangleMesh.acquireReference();
                    pxTriangleMesh.refCnt++;
                }

                shape = PhysX.PxRigidActorExt.prototype.createExclusiveShape(rigid.toBody(), geometry, material, flags);

                PhysX.destroy(indexVector);
                PhysX.destroy(pointsVector);
                PhysX.destroy(s);
                PhysX.destroy(r);
            }
            break;

            case 'HeightField': {
                let sampleArray = new PhysX.PxArray_PxHeightFieldSample();
                let heightFieldDesc = new PhysX.PxHeightFieldDesc();
                ///heightFieldDesc.nbColumns = numberOfColumns
                //heightFieldDesc.nbRows = numberOfRows
                heightFieldDesc.format = PhysX.PxHeightFieldFormatEnum.eS16_TM;

                heightFieldDesc.samples.stride = 0
            }
        }

        if (shape) {

            shape.setFlag(PhysX.PxShapeFlagEnum.eSCENE_QUERY_SHAPE, option.FLAG_SHAPE_eSCENE_QUERY);
            shape.setFlag(PhysX.PxShapeFlagEnum.eSIMULATION_SHAPE, option.FLAG_SHAPE_eSIMULATION);
            shape.setFlag(PhysX.PxShapeFlagEnum.eVISUALIZATION, option.FLAG_SHAPE_eVISUALIZATION);

            shape.setSimulationFilterData(this.FilterData);
            shape.setQueryFilterData(this.FilterData);
        }

        if (option.isDynamic && shape) {

            rigid.setMass(option.mass);
            rigid.updateMassAndInertia();
    
            mesh.PhysX = {
                id: rigid.getPtr(),
                isDynamic: true,
                isKinematic: option.isKinematic
            };
            _BodysDynamic.set(rigid.getPtr(), {body:rigid, mesh: mesh, isKinematic: option.isKinematic});
            this.scene.addActor(rigid.toBody());

        } else if (shape) {

            mesh.PhysX = {
                id: rigid.getPtr(),
                isDynamic: false,
            };
            _BodysStatic.set(rigid.getPtr(), {body:rigid, mesh: mesh});
            this.scene.addActor(rigid.toBody());
        } else {

            console.warn('WEBLPhy: This type of geometry is not supported!:', type);
        }

        PhysX.destroy(FilterData);
        PhysX.destroy(flags);
        PhysX.destroy(Transform);
        PhysX.destroy(Vec3);

        if (mesh.PhysX.id) return mesh.PhysX.id;
    }

    remove(mesh) {

        if (mesh.PhysX && mesh.isMesh) {

            if (mesh.PhysX.isDynamic) {

                this.scene.removeActor(_BodysDynamic.get(mesh.PhysX.id).body.toBody());
                _BodysDynamic.delete(mesh.PhysX.id); 

            } else if (!mesh.PhysX.isDynamic) {

                this.scene.removeActor(_BodysStatic.get(mesh.PhysX.id).body.toBody());
                _BodysStatic.delete(mesh.PhysX.id);
            } else {

                console.warn('WEBLPhy: This mesh does not exist', mesh);
            }
        } else {

            console.log('');
        }
    }
}