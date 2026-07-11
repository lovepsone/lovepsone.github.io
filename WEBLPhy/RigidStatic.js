/*
* @author lovepsone 2026
* @ver - 0.0.1 
*/

export class RigidStatic {

    constructor(phy, Transform) {

        this.rigid = phy.createRigidStatic(Transform);
    }

    getPtr() {

        return this.rigid.ptr;
    }

    toBody() {

        return this.rigid;
    }
}