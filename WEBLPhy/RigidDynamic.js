


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

    set(vec3 = [0, 0, 0]) {

        const tmp = new PhysX.PxVec3().fromArray(vec3);

        this.rigid.massSpaceInertiaTensor = tmp;
        PhysX.destroy(tmp);
    }
}