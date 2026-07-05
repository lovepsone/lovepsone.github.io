/*
* @author lovepsone 2026
* @ver - 0.0.1 
*/

let _manager, _ObstacleContext, _characters = [], _ControllerFilters;

const FREEFALL = - 9.8, SPEEDJUMP = 3.2;

export class CharacterControl {

    constructor(physics, scene) {

        this.scene = scene;
        this.physics = physics;
        this.tmpVec3 = new PhysX.PxVec3(0, -9.8, 0);
        this.tmpQuat = new PhysX.PxQuat();
       // this.defaultCCTQueryCallback = PhysX.getDefaultCCTQueryFilter();

        _manager = PhysX.PxTopLevelFunctions.prototype.CreateControllerManager(this.scene);
        _ObstacleContext = _manager.createObstacleContext();
        _manager.setOverlapRecoveryModule(true); // модуль восстановления наложений

        _ControllerFilters = new PhysX.PxControllerFilters();
    }

    add(radius = 4, height = 8, position = [0, 70, 0]) {

        const r_callback = new PhysX.PxUserControllerHitReportImpl();
        const b_callback = new PhysX.PxControllerBehaviorCallbackImpl();
        const ccd = new PhysX.PxCapsuleControllerDesc();
        ccd.height = height;
        ccd.radius = radius;
        ccd.stepOffset = 0.1 // Смещение шага
        ccd.contactOffset = 1.001; // доп.слой вокруг капсулы
        ccd.maxJumpHeight = 1.001; // размер ограничивающего объема вниз
        ccd.invisibleWallHeight = 0; // ?
        ccd.slopeLimit = Math.cos((45 * Math.PI) / 180); // предел наклона, при котором движение продалжается
        ccd.climbingModeEnum = PhysX.PxCapsuleClimbingModeEnum.eEASY;
        ccd.material = this.physics.createMaterial(0.1, 0.1, 0.1);
        ccd.reportCallback = r_callback;
        ccd.behaviorCallback = b_callback;
        ccd.nonWalkableMode = PhysX.PxControllerNonWalkableModeEnum.ePREVENT_CLIMBING; // PhysX.PxControllerNonWalkableModeEnum.ePREVENT_CLIMBING_AND_FORCE_SLIDING;

        const pos = new PhysX.PxExtendedVec3(position[0], position[1], position[2]);
        const controller = _manager.createController(ccd);
        controller.setPosition(pos);

        _characters.push({Character: controller,
            walkSpeed: 2.13,
            isDownCollision: false,
            isUpCollision: false,
            isSideCollision: false,
            velocityY: 0,
            maxJumpHeight: 40,
            isJump: false,
            mass: 15,
        });

        r_callback.onShapeHit = (hit) => {

            const point = PhysX.wrapPointer(hit, PhysX.PxControllerShapeHit);
            const worldNormal = point.worldNormal.toArray();
            const worldPos = point.worldPos.toArray();

            const event = new CustomEvent('CharacterOnShapeHit', {
                detail: {
                    point: point,
                    worldNormal: worldNormal,
                    worldPos: worldPos
                }
            });
        };

        r_callback.onControllerHit = (hit) => {

        };

        r_callback.onObstacleHit = (hit) => {

        };

        b_callback.getShapeBehaviorFlags = (shape, actor) => {

        };
    
        b_callback.getControllerBehaviorFlags = (controller) => {

        };

        b_callback.getObstacleBehaviorFlags = (obstacle) => {

        }

        PhysX.destroy(pos);
        return  _characters.length - 1;
    }

    getPosition(id, type = 'default', offsetY = 0) {

        if (_characters[id]) {

            let pos;

            switch(type) {

                case 'head':
                    pos = _characters[id].Character.getPosition().toArray();
                    pos[1] += _characters[id].Character.getPosition().toArray()[1] - _characters[id].Character.getFootPosition().toArray()[1];
                    break;

                case 'foot':
                    pos = _characters[id].Character.getFootPosition().toArray();
                    break;

                case 'offsetY':
                    pos = _characters[id].Character.getPosition().toArray();
                    pos[1] += offsetY;
                    break;
                default : pos = _characters[id].Character.getPosition().toArray();

            }

            return pos;
        }

        console.warn('WEBLPhy: There is no character with this id:', id);
        return;
    }

    getCollisionFlags(id) {

        if (_characters[id]) {

            return {
                isDawn: _characters[id].isDownCollision,
                isUp: _characters[id].isUpCollision,
                isSide: _characters[id].isSideCollision
            };
        }

        console.warn('WEBLPhy: There is no character with this id:', id);
        return;
    }

    step(id = 0, key = {w: 0, s: 0, a: 0, d: 0, spase: 0}, angle = 0, timeStep = 1/60) {

        let collisionFlags = null;

        if (_characters[id]) {

            const g_y = FREEFALL * timeStep * _characters[id].mass;
            const j_y = SPEEDJUMP;

            let x = 0, z = 0, y = g_y, tangle = 0;

            if (key.w) {

                z = -_characters[id].walkSpeed;
            } else if (key.s) {

                z = _characters[id].walkSpeed;
            }

            if (key.a) {

                x = -_characters[id].walkSpeed;
            } else if (key.d) {

                x = _characters[id].walkSpeed;
            }

            if (key.spase && _characters[id].isDownCollision) {

                _characters[id].isJump = true;
                y = j_y;
                _characters[id].velocityY += y;
            }

            if (_characters[id].isJump && _characters[id].velocityY > _characters[id].maxJumpHeight) {

                _characters[id].isJump = false;
                _characters[id].velocityY = 0;
                y = g_y;
            } else if (_characters[id].isJump) {

                y = j_y;
                _characters[id].velocityY += y;
            }

            this.tmpQuat.setXYZW(0, 0, 0, 1);
            tangle -= angle + 1.57;
            this.tmpQuat.fromAxisAngle([0, 1, 0], tangle);
            this.tmpVec3.setXYZ(x, y, z);
            this.tmpVec3.applyQuaternion(this.tmpQuat);

            collisionFlags = _characters[id].Character.move(this.tmpVec3, 0.001, timeStep, _ControllerFilters, _ObstacleContext);
            _characters[id].isDownCollision = collisionFlags.isSet(PhysX.PxControllerCollisionFlagEnum.eCOLLISION_DOWN);
            _characters[id].isUpCollision = collisionFlags.isSet(PhysX.PxControllerCollisionFlagEnum.eCOLLISION_UP);
            _characters[id].isSideCollision = collisionFlags.isSet(PhysX.PxControllerCollisionFlagEnum.eCOLLISION_SIDES);

        } else {

            console.error('WEBLPhy: There is no controller with this ID:', id);
        }
    }
}