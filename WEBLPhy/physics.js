/*
* @author lovepsone 2026
* @ver - 0.0.1 
*/

import {loadPhysX} from './Loader.js';
import {RigidBody} from './RigidBody.js';
import {Debug} from './Debug.js';
import {CharacterControl} from './CharacterControl.js';
import {mathExtend} from './Match.js';

const isServer = false;
let _scope, _physics, _scene, _RigidBody, _CharacterControl, _Debug;
let _isDebug = true, _isStep = false;

globalThis.PhysX = loadPhysX;

export class WEBLPhy {

    constructor(option = {gravity: [0, -9.8, 0], THREEScene: null, isDebug: true}) {

        this.THREEScene = option.THREEScene;
        _scope = this;
        option.isDebug = option.isDebug || true;
        option.gravity = option.gravity || [0, -9.8, 0];
        _isDebug = option.isDebug;
        this.init(option.gravity);
    }

    init(gravity = [0, -9.8, 0]) {

        mathExtend();
        const version = PhysX.PHYSICS_VERSION;
        console.log(`PhysX loaded! Version: ${((version >> 24) & 0xff)}.${((version >> 16) & 0xff)}.${((version >> 8) & 0xff)}`);

        const SimulationCallback = new PhysX.PxSimulationEventCallbackImpl();
        const DefaultAllocator = new PhysX.PxDefaultAllocator();
        const DefaultErrorCallback = new PhysX.PxDefaultErrorCallback();
        const Foundation = PhysX.CreateFoundation(version, DefaultAllocator, DefaultErrorCallback);
    
        const Tolerances = new PhysX.PxTolerancesScale();
        const cookingParams = new PhysX.PxCookingParams(Tolerances);
        cookingParams.suppressTriangleMeshRemapTable = true;

        _physics = PhysX.CreatePhysics(version, Foundation, Tolerances);
    
        const Vec3 = new PhysX.PxVec3().fromArray(gravity);
        const SceneDesc = new PhysX.PxSceneDesc(Tolerances);
        //SceneDesc.set_gravity(Vec3);

        SceneDesc.set_cpuDispatcher(PhysX.DefaultCpuDispatcherCreate(0));
        SceneDesc.set_filterShader(PhysX.DefaultFilterShader());
        SceneDesc.flags.raise(PhysX.PxSceneFlagEnum.eENABLE_ACTIVE_ACTORS);
        SceneDesc.simulationEventCallback = SimulationCallback;
        _scene = _physics.createScene(SceneDesc);
        _scene.setBounceThresholdVelocity(0.001); //?
        _scene.setGravity(Vec3);
    
        _RigidBody = new RigidBody(_physics, _scene, cookingParams);
        _CharacterControl = new CharacterControl(_physics, _scene);

        if (_isDebug && _scope.THREEScene) {

            _Debug = new Debug(_scene, _scope.THREEScene);
        }

        PhysX.destroy(Vec3);

        SimulationCallback.onConstraintBreak = (constraints, count) => {

        };

        SimulationCallback.onWake = (actors, count) => {

        };

        SimulationCallback.onSleep = (actors, count) => {

        };

        SimulationCallback.onContact = (pairHeader, pairs, nbPairs) => {

        }

        SimulationCallback.onTrigger = (pairs, count) => {

            const pointer = PhysX.wrapPointer(pairs, PhysX.PxTriggerPair);

            for (let i = 0; i < count; i++) {

                const pair = PhysX.NativeArrayHelpers.getTriggerPairAt(pointer, i);
            }
        }
    }

    addMeshRigidBody(mesh,
        option = {
            mass: 0,
            isDynamic: false,
            isKinematic: false,
            type_geometry: '',
            static_friction: 0.1,
            dynamic_friction: 0.5,
            restitution: 0.1,
            FLAG_SHAPE_eSIMULATION: true,
            FLAG_SHAPE_eSCENE_QUERY: true,
            FLAG_SHAPE_eVISUALIZATION: true
        }
    ) {

        option.mass = option.mass || 0;
        option.isDynamic = option.isDynamic || false;
        option.isKinematic = option.isKinematic || false;
        option.type_geometry = option.type_geometry || '';
        option.static_friction = option.static_friction || 0.1;
        option.dynamic_friction = option.dynamic_friction || 0.5;
        option.restitution = option.restitution || 0.1;
        option.FLAG_SHAPE_eSIMULATION = option.FLAG_SHAPE_eSIMULATION || true;
        option.FLAG_SHAPE_eSCENE_QUERY =  option.FLAG_SHAPE_eSCENE_QUERY || true;
        option.FLAG_SHAPE_eVISUALIZATION = option.FLAG_SHAPE_eVISUALIZATION || true;
        
        return _RigidBody.add(mesh, option);
    }

    addCharacter(radius = 4, height = 8, position = [0, 70, 0]) {

        return _CharacterControl.add(radius, height, position);
    }

    getCharacterControl() {

        if (CharacterControl) return _CharacterControl;
    }

    stepSimulation(Delta, TimeStep = 1/60) {

        _isStep = false;
        if (_scene) {
            _scene.simulate(TimeStep);
            _scene.fetchResults(true);

            _isStep = true;
            _RigidBody.step();

            if (_isDebug && _scope.THREEScene && _Debug) _Debug.Draw();
        }
    }

    UpdateCharacterControl(id = 0, key = {w: 0, s: 0, a: 0, d: 0, spase: 0, ctrl: 0}, angle = 0, timeStep = 1/60) {

        if (_isStep) {

            _CharacterControl.step(id, key, angle, timeStep);
        }
    }
};