/*
* @author lovepsone 2026
* @ver - 0.0.1 
*/

import * as THREE from './../examples/libs/three.module.js';

const maxBufferSize = 1000000;
let _mesh;

export class Debug {

    constructor(scene, THREEScene) {

        this.index = 0;
        this.scene = scene;
        this.scene.setVisualizationParameter(PhysX.eSCALE, 1);
        this.scene.setVisualizationParameter(PhysX.eWORLD_AXES, 1);
        this.scene.setVisualizationParameter(PhysX.eACTOR_AXES, 1);
        this.scene.setVisualizationParameter(PhysX.eCOLLISION_SHAPES, 1);
        this.scene.setVisualizationParameter(PhysX.eBODY_AXES, 1);

        this.colors = {
            [PhysX.PxDebugColorEnum.eARGB_BLACK]:     [  0,   0,   0],
            [PhysX.PxDebugColorEnum.eARGB_RED]:       [  1,   0,   0],
            [PhysX.PxDebugColorEnum.eARGB_GREEN]:     [  0,   1,   0],
            [PhysX.PxDebugColorEnum.eARGB_BLUE]:      [  0,   0,   1],
            [PhysX.PxDebugColorEnum.eARGB_YELLOW]:    [  1,   1,   0],
            [PhysX.PxDebugColorEnum.eARGB_MAGENTA]:   [  1,   0,   1],
            [PhysX.PxDebugColorEnum.eARGB_CYAN]:      [  0,   1,   1],
            [PhysX.PxDebugColorEnum.eARGB_WHITE]:     [  1,   1,   1],
            [PhysX.PxDebugColorEnum.eARGB_GREY]:      [0.5, 0.5, 0.5],
            [PhysX.PxDebugColorEnum.eARGB_DARKRED]:   [0.5,   0,   0],
            [PhysX.PxDebugColorEnum.eARGB_DARKGREEN]: [  0, 0.5,   0],
            [PhysX.PxDebugColorEnum.eARGB_DARKBLUE]:  [  0,   0, 0.5],
        };

        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(maxBufferSize * 3);
        const colors = new Float32Array(maxBufferSize * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3).setUsage(THREE.DynamicDrawUsage));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));
        _mesh = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({vertexColors: true, depthTest: true}));
        _mesh.frustumCulled = false;
        THREEScene.add(_mesh);
    }

    DrawLine(from, to, color) {

        if (color != undefined) {

        const [r, g, b] = color;

        _mesh.geometry.attributes.position.setXYZ(this.index, from[0], from[1], from[2]);
        _mesh.geometry.attributes.color.setXYZ(this.index++, r, g, b);
 
        _mesh.geometry.attributes.position.setXYZ(this.index, to[0], to[1], to[2]);
        _mesh.geometry.attributes.color.setXYZ(this.index++, r, g, b);
        }
    }

    Draw() {

        const rb = this.scene.getRenderBuffer();

        for (let i = 0; i < rb.getNbLines(); i++) {

            const line = PhysX.NativeArrayHelpers.prototype.getDebugLineAt(rb.getLines(), i);
            const from = [line.pos0.get_x(), line.pos0.get_y(), line.pos0.get_z()];
            const to = [line.pos1.get_x(), line.pos1.get_y(), line.pos1.get_z()];

            this.DrawLine(from, to, this.colors[line.get_color0()]);
        }

        if (this.index != 0) {

            _mesh.geometry.attributes.position.needsUpdate = true;
            _mesh.geometry.attributes.color.needsUpdate = true;
        }

        _mesh.geometry.setDrawRange(0, this.index);
        this.index = 0;
    }
};