


/*
* @author lovepsone 2026
* @ver - 0.0.1 
*/

export class RigidDynamic {

    constructor(phy, Transform) {

        this.rigid = phy.createRigidDynamic(Transform);
    }

    setKinematic(val = false) {

        this.rigid.setRigidBodyFlag(PhysX.PxRigidBodyFlagEnum.eKINEMATIC, val);
    }

    getPosition() {

        return this.rigid.getGlobalPose().get_p().toArray();
    }

    getQuat() {

        return this.rigid.getGlobalPose().get_q().toArray();
    }

    getPtr() {

        return this.rigid.ptr;
    }

    toBody() {

        return this.rigid;
    }

    setMass(val = 0.0) {

        this.rigid.setMass(val);
    }

    updateMassAndInertia() {

        PhysX.PxRigidBodyExt.prototype.updateMassAndInertia(this.rigid, this.rigid.getMass());
    }

    setMassAndInertia(vec3 = [0, 0, 0]) {

        if (!Array.isArray(vec3)) return;

        const tmp = new PhysX.PxVec3().fromArray(vec3);
        this.rigid.massSpaceInertiaTensor = tmp;
        PhysX.destroy(tmp);
    }

    setLinearVelocity(vec3 = [0, 0, 0]) {
    
        if (!Array.isArray(vec3)) return;

        const tmp = new PhysX.PxVec3().fromArray(vec3);
        this.rigid.setLinearVelocity(tmp);
        PhysX.destroy(tmp);
    }

    setAngularVelocity(vec3 = [0, 0, 0]) {

        if (!Array.isArray(vec3)) return;

        const tmp = new PhysX.PxVec3().fromArray(vec3);
        this.rigid.setAngularVelocity(tmp);
        PhysX.destroy(tmp);
    }

    setMaxLinearVelocity(val) {

        this.rigid.maxLinearVelocity = val;
    }

    setMaxAngularVelocity(val) {

        this.rigid.maxAngularVelocity = val;
    }

    setLinearDamping(val) {

        this.rigid.linearDamping = val;
    }

    setAngularDamping(val) {

        this.rigid.angularDamping = val;
    }

    addForceAtPos(force = [0, 0, 0], pos = [0, 0, 0], isLocalForce = true, isLocalPos = true) {

        if (!Array.isArray(force) || !Array.isArray(pos)) return;

        const _Force = new PhysX.PxVec3().fromArray(force),  _Pos = new PhysX.PxVec3().fromArray(pos);

        if (isLocalForce && isLocalPos) PhysX.PxRigidBodyExt.prototype.addLocalForceAtLocalPos(this.rigid, _Force, _Pos);
        else if (isLocalForce && !isLocalPos) PhysX.PxRigidBodyExt.prototype.addLocalForceAtPos(this.rigid, _Force, _Pos);
        else if (!isLocalForce && isLocalPos) PhysX.PxRigidBodyExt.prototype.addForceAtLocalPos(this.rigid, _Force, _Pos);
        else PhysX.PxRigidBodyExt.prototype.addForceAtPos(this.rigid, _Force, _Pos);

        PhysX.destroy(_Force);
        PhysX.destroy(_Pos);
    }

    addImpulseAtPos(impulse = [0, 0, 0], pos = [0, 0, 0], isLocalImpulse = true, isLocalPos = true) {

        if (!Array.isArray(impulse) || !Array.isArray(pos)) return;

         const _Impulse = new PhysX.PxVec3().fromArray(impulse),  _Pos = new PhysX.PxVec3().fromArray(pos);

        if (isLocalImpulse && isLocalPos) PhysX.PxRigidBodyExt.prototype.addLocalForceAtLocalPos(this.rigid, _Impulse, _Pos, PhysX.PxForceModeEnum.eIMPULSE);
        else if (isLocalImpulse && !isLocalPos) PhysX.PxRigidBodyExt.prototype.addLocalForceAtPos(this.rigid, _Impulse, _Pos, PhysX.PxForceModeEnum.eIMPULSE);
        else if (!isLocalImpulse && isLocalPos) PhysX.PxRigidBodyExt.prototype.addForceAtLocalPos(this.rigid, _Impulse, _Pos, PhysX.PxForceModeEnum.eIMPULSE);
        else PhysX.PxRigidBodyExt.prototype.addForceAtPos(this.rigid, _Impulse, _Pos, PhysX.PxForceModeEnum.eIMPULSE)
    }

    addTorque(torque = [0, 0, 0]) {

        if (!Array.isArray(torque)) return;
        const tmpVec = new PhysX.PxVec3().fromArray(torque);
        this.rigid.addTorque(tmpVec);
    }
}