/*
* @author lovepsone 2026
* @ver - 0.0.1 
*/

let _bodys = [], _static = [];

export class RigidBody {

    constructor(physics, scene, cookingParams) {

        this.physics = physics;
        this.scene = scene;
        this.cookingParams = cookingParams;
    }

    step() {

        if(_bodys.length === 0) return;

        for (let i = 0; i < _bodys.length; i ++) {

            const position = _bodys[i].body.getGlobalPose().get_p();
            const quat = _bodys[i].body.getGlobalPose().get_q();
            _bodys[i].mesh.position.fromArray(position.toArray());
            _bodys[i].mesh.quaternion.fromArray(quat.toArray());
            //_bodys[i].mesh.quaternion.set(quat.get_x(), quat.get_y(), quat.get_z(), quat.get_w());// упростить
        }
    }

    add(mesh, option = {mass: 0, isDynamic: false, isKinematic: false, type_geometry: '', static_friction: 0.1, dynamic_friction: 0.5, restitution: 0.1}) {

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

            rigid = this.physics.createRigidDynamic(Transform);

            if (option.isKinematic) {

                rigid.setRigidBodyFlag(PhysX.PxRigidBodyFlagEnum.eKINEMATIC, true);
            }
        } else {

            option.isDynamic = false;
            rigid = this.physics.createRigidStatic(Transform);
        }

        switch(type) {

            case 'PlaneGeometry': {
                let w = mesh.geometry.parameters.width * 0.5;
                let h = mesh.geometry.parameters.height * 0.5;
                geometry = new PhysX.PxBoxGeometry(w, 1, h);
                //geometry = PhysX.PxPlaneGeometry();
                shape = PhysX.PxRigidActorExt.prototype.createExclusiveShape(rigid, geometry, material, flags);
                
            }
            break;

            case 'BoxGeometry': {
                let w = mesh.geometry.parameters.width * 0.5;
                let h = mesh.geometry.parameters.height * 0.5;
                let d = mesh.geometry.parameters.depth * 0.5;
                geometry = new PhysX.PxBoxGeometry(w, h, d);
                shape = PhysX.PxRigidActorExt.prototype.createExclusiveShape(rigid, geometry, material, flags);
            }
            break;

            case 'SphereGeometry': {
                let r = mesh.geometry.parameters.radius;
                geometry = new PhysX.PxSphereGeometry(r);
                shape = PhysX.PxRigidActorExt.prototype.createExclusiveShape(rigid, geometry, material, flags);
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

                shape = PhysX.PxRigidActorExt.prototype.createExclusiveShape(rigid, geometry, material, flags);
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
                shape = PhysX.PxRigidActorExt.prototype.createExclusiveShape(rigid, geometry, material, flags);

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

                shape = PhysX.PxRigidActorExt.prototype.createExclusiveShape(rigid, geometry, material, flags);

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

            shape.setSimulationFilterData(this.FilterData);
            shape.setQueryFilterData(this.FilterData);
        }

        if (option.isDynamic && shape) {

            rigid.setMass(option.mass);
            PhysX.PxRigidBodyExt.prototype.updateMassAndInertia(rigid, option.mass);
            _bodys.push({body:rigid, mesh: mesh, isKinematic: isKinematic});
            this.scene.addActor(rigid);
            //shape.release();

        } else if (shape) {

            this.scene.addActor(rigid);
            _static.push({body:rigid, mesh: mesh});
            //shape.release();
        } else {

            console.warn('WEBLPhy: This type of geometry is not supported!:', type);
            console.log(mesh);
        }

        PhysX.destroy(FilterData);
        PhysX.destroy(flags);
        PhysX.destroy(Transform);
        PhysX.destroy(Vec3);

        if (option.isDynamic) {

            mesh.PhysX = {
                id: _bodys.length - 1,
                isDynamic: true,
                isKinematic: option.isKinematic
            }
            return _bodys.length - 1;
        } else {

            mesh.PhysX = {
                id: _bodys.length - 1,
                isDynamic: false
            }
            return _static.length - 1;
        }
    }

    disableShapeInContact(id) {

        //_bodys[id].body
        //shape->setFlag(PxShapeFlag::eSIMULATION_SHAPE, false);
    }

    enableShapeInContact(id) {

        //shape->setFlag(PxShapeFlag::eSIMULATION_SHAPE, true);
    }

    disableShapeInSceneQuery(id) {

        //shape->setFlag(PxShapeFlag::eSCENE_QUERY_SHAPE, false);
    }

    enableShapeInSceneQuery(id) {

        //shape->setFlag(PxShapeFlag::eSCENE_QUERY_SHAPE, true);
    }
}