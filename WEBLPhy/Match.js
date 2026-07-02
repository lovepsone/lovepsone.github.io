/*
* @author lovepsone 2026
* @ver - 0.0.1 
*/
export function ControllerShapeHitToPoint(hit) {

    return PhysX.wrapPointer(hit, PhysX.PxControllerShapeHit);
}

export const putIntoPhysXHeap = (heap, array) => {

    const ptr = PhysX._malloc(4 * array.length);
    let offset = 0;

    for (let i = 0; i < array.length; i++) {

        heap[(ptr + offset) >> 2] = array[i];
        offset += 4;
    }

    return ptr;
};

export const getFromPhysXHeap = (heap, address, count) => {

    const result = [];
    let offset = 0;

    for (let i = 0; i < count; i++) {

        result.push(heap[(address + offset) >> 2]);
        offset += 4;
    }

    return result;
};

export function mathExtend() {

    /*
    Vec3
    */
    PhysX.PxVec3.prototype.setXYZ = function(x, y, z) {

		this.set_x(x);
        this.set_y(y);
        this.set_z(z);
		return this;
	}

    PhysX.PxVec3.prototype.toArray = function(array, offset) {

        let direct = array !== undefined;
        offset = offset || 0;

        if(!direct) array = [];

        array[offset] = this.get_x();
		array[offset + 1] = this.get_y();
		array[offset + 2] = this.get_z();

        if(!direct) return array;
    }

    PhysX.PxVec3.prototype.fromArray = function(array, offset) {

        offset = offset || 0;

		this.set_x(array[offset]);
        this.set_y(array[offset + 1]);
        this.set_z(array[offset + 2]);

		return this;
    }

    PhysX.PxVec3.prototype.applyQuaternion = function(quat) {

        const vx = this.get_x(), vy = this.get_y(), vz = this.get_z();
        const qx = quat.get_x(), qy = quat.get_y(), qz = quat.get_z(), qw = quat.get_w();

        // t = 2 * cross( q.xyz, v );
        const tx = 2 * (qy * vz - qz * vy);
        const ty = 2 * (qz * vx - qx * vz);
        const tz = 2 * (qx * vy - qy * vx);

        // v + q.w * t + cross( q.xyz, t );
        this.set_x(vx + qw * tx + qy * tz - qz * ty);
        this.set_y(vy + qw * ty + qz * tx - qx * tz);
        this.set_z(vz + qw * tz + qx * ty - qy * tx);

        return this;
    }

    PhysX.PxVec3.prototype.direction = function(quat) {

        const qx = quat.get_x(), qy = quat.get_y(), qz = quat.get_z(), qw = quat.get_w();
        const x = this.get_x(), y = this.get_y(), z = this.get_z();

        // calculate quat * vector
	    const ix = qw * x + qy * z - qz * y;
	    const iy = qw * y + qz * x - qx * z;
	    const iz = qw * z + qx * y - qy * x;
	    const iw = - qx * x - qy * y - qz * z;

        // calculate result * inverse quat
	    const xx = ix * qw + iw * - qx + iy * - qz - iz * - qy;
	    const yy = iy * qw + iw * - qy + iz * - qx - ix * - qz;
	    const zz = iz * qw + iw * - qz + ix * - qy - iy * - qx;

        this.set_x(xx);
        this.set_y(yy);
        this.set_z(zz);
        return this;
    }

    PhysX.PxExtendedVec3.prototype.toArray = function(array, offset) {

        let direct = array !== undefined;
        offset = offset || 0;

        if(!direct) array = [];

        array[offset] = this.get_x();
		array[offset + 1] = this.get_y();
		array[offset + 2] = this.get_z();

        if(!direct) return array;
    }
    /*
    Quat
    */
    PhysX.PxQuat.prototype.setXYZW = function(x, y, z, w) {

		this.set_x(x);
        this.set_y(y);
        this.set_z(z);
        this.set_w(w);
		return this;
    }

    PhysX.PxQuat.prototype.toArray = function(array, offset) {

        let direct = array !== undefined;
        offset = offset || 0;

        if(!direct) array = [];

        array[offset] = this.get_x();
		array[offset + 1] = this.get_y();
		array[offset + 2] = this.get_z();
        array[offset + 3] = this.get_w();

        if(!direct) return array;
    }

    PhysX.PxQuat.prototype.fromArray = function(array, offset) {

        offset = offset || 0;

		this.set_x(array[offset]);
        this.set_y(array[offset + 1]);
        this.set_z(array[offset + 2]);
        this.set_w(array[offset + 3]);

		return this;
    }

    PhysX.PxQuat.prototype.fromAxisAngle = function(axis, angle) {

        const halfAngle = angle * 0.5;
        const s = Math.sin(halfAngle);

		this.set_x(axis[0] * s);
        this.set_y(axis[1] * s);
        this.set_z(axis[2] * s);
        this.set_w(Math.cos(halfAngle));

        return this;
    }

    /*
    * Transform
    */

    PhysX.PxTransform.prototype.getPosition = function() {

        return this.get_p().toArray();
    }

    PhysX.PxTransform.prototype.setQuat = function(quat) {


    }

    PhysX.PxTransform.prototype.getQuat = function() {

        return this.get_q().toArray();
    }  
}