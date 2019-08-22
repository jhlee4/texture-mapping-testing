"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const three_1 = require("three");
const vector_helper_1 = require("./helper/vector-helper");
const WindowGenerator_1 = require("./WindowGenerator");
const GetOutlines_1 = require("./GetOutlines");
const OrbitControls = require('three-orbit-controls')(THREE);
let scene;
const initScene = () => {
    scene = new three_1.Scene();
};
let axesHelper;
const initAxisHelper = () => {
    axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
};
let camera;
const initCamera = (position = null) => {
    camera = new THREE.OrthographicCamera(window.innerWidth / -100, window.innerWidth / 100, window.innerHeight / 100, window.innerHeight / -100, 1, 1000);
    //	camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1500)
    if (position) {
        camera.position.x = position.x;
        camera.position.y = position.y;
        camera.position.z = position.z;
    }
    scene.add(camera);
};
let renderer;
const initRenderer = () => {
    renderer = new three_1.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xEEEEEE);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = three_1.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
};
let controls;
const initOrbitControls = () => {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0;
    controls.maxDistance = Infinity;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;
};
let ambLight, dirLight, helper;
const initLights = (isHelper = null) => {
    ambLight = new three_1.AmbientLight(0xffffff, 1);
    scene.add(ambLight);
    dirLight = new three_1.DirectionalLight(0xffffbb, 1);
    dirLight.castShadow = true;
    dirLight.translateY(100);
    scene.add(dirLight);
    if (isHelper) {
        helper = new three_1.CameraHelper(dirLight.shadow.camera);
        scene.add(helper);
    }
};
let cube;
const initCube = () => {
    const cubeGeo = new three_1.BoxGeometry(1, 1, 1);
    const cubeMat = new three_1.MeshLambertMaterial({ color: 0xffffff });
    cube = new three_1.Mesh(new three_1.BufferGeometry().fromGeometry(cubeGeo), cubeMat);
    cube.receiveShadow = true;
    cube.castShadow = true;
    const rotVec3 = new three_1.Vector3(0, 0.5, 0.1);
    const angle = 0.5;
    cube.rotateOnAxis(rotVec3, angle);
    renderCubeOutline(rotVec3, angle);
    scene.add(cube);
};
const renderCubeOutline = (rotVec3, angle) => {
    const lineMat = new three_1.LineBasicMaterial({ color: 0x000000 });
    const edgeGeo = new three_1.EdgesGeometry(cube.geometry);
    const wireframe = new three_1.LineSegments(edgeGeo, lineMat);
    wireframe.rotateOnAxis(rotVec3, angle);
    scene.add(wireframe);
};
const initialize = () => __awaiter(this, void 0, void 0, function* () {
    initScene();
    initAxisHelper();
    initCamera({ x: 0, y: 0, z: 20 });
    initRenderer();
    initOrbitControls();
    initLights(true);
    processInsightPro();
    animate();
});
let insightProSample = require('./static/insight-pro-sample.json');
const processInsightPro = () => {
    const fvs = getFloorVertices(insightProSample.buildings[0]);
    const floors = fvs.map(n => getFloor(n));
    scene.add(floors[0]);
    floors.map((n, i) => {
        n.translateZ(i * 3);
        vector_helper_1.rotateAboutPoint(n, new three_1.Vector3(0, 0, 0), new three_1.Vector3(1, 0, 0), -Math.PI / 2, false);
        scene.add(n);
        console.log(n);
        const clone = n.clone();
        clone.translateZ(3);
        console.log(clone);
        scene.add(clone);
    });
    const vs = floors.map(n => n.geometry.vertices);
    // const testVertices = floors[1].geometry.vertices
    // getWall([testVertices[1], testVertices[2]])
    const pairs = vs.map(n => pairing(n));
    const result = pairs.map((n, i) => {
        const walls = n.map(m => {
            const wall = getWall(m);
            const obj = new three_1.Object3D();
            obj.add(wall.mesh);
            obj.add(wall.outline);
            obj.translateZ(i * 3);
            return obj;
        });
        return walls;
    });
    result.forEach(n => n.map(m => {
        vector_helper_1.rotateAboutPoint(m, new three_1.Vector3(0, 0, 0), new three_1.Vector3(1, 0, 0), -Math.PI / 2, false);
        scene.add(m);
    }));
    console.log(result);
};
const pairing = (vertices) => {
    let pairs = [];
    vertices.forEach((n, i) => {
        let pair = [];
        if (i < vertices.length) {
            pair.push(n);
            pair.push(vertices[(i + 1) % vertices.length]);
            pairs.push(pair);
        }
    });
    return pairs;
};
const getFloor = (vertices) => {
    const geo = new three_1.ShapeGeometry(new three_1.Shape(vertices.map(n => new three_1.Vector2(n.x, n.y))));
    const mesh = new three_1.Mesh(geo, new three_1.MeshLambertMaterial({ color: 0xffff00, side: three_1.DoubleSide }));
    return mesh;
};
const getVector3FromPoint3d = (point) => {
    return new three_1.Vector3(point.X, point.Y, point.Z);
};
const rotateVector3 = (v, r) => {
    const x = v.x * Math.cos(r) - v.y * Math.sin(r);
    const y = v.y * Math.cos(r) + v.x * Math.sin(r);
    return new three_1.Vector3(x, y);
};
const getWall = (vertices) => {
    const p0 = vertices[0];
    const p1 = vertices[1];
    const width = new three_1.Vector2().subVectors(p0, p1).length();
    const height = 3;
    const av = new three_1.Vector2().subVectors(p1, p0).normalize();
    const pv = new three_1.Vector2(av.x, av.y).rotateAround(new three_1.Vector2(0, 0), -Math.PI / 2).normalize();
    pv.multiplyScalar(height);
    const p2 = new three_1.Vector2().addVectors(p1, pv);
    const p3 = new three_1.Vector2().addVectors(p0, pv);
    const shape = new three_1.Shape([p0, p1, p2, p3]);
    const holesVertices = WindowGenerator_1.getWindowHoles([p0, p1, p2, p3], scene);
    if (holesVertices) {
        const holesPathes = holesVertices.map(n => {
            const path = new three_1.Path(n);
            path.autoClose = true;
            path.arcLengthDivisions = 1;
            path.updateArcLengths();
            return path;
        });
        holesPathes.map(n => shape.holes.push(n));
    }
    const extSetting = {
        steps: 2,
        depth: 0.2,
        bevelEnabled: false,
        bevelThickness: 0,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 0
    };
    const ext = new three_1.ExtrudeGeometry(shape, extSetting);
    const test = new three_1.ShapeGeometry(shape);
    const mesh = new three_1.Mesh(ext, new three_1.MeshLambertMaterial({ color: 0xd3d3d3 }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.translateZ(-0.2);
    mesh.geometry.computeBoundingSphere();
    const axis = new three_1.Vector3().subVectors(new three_1.Vector3(p1.x, p1.y, 0), new three_1.Vector3(p0.x, p0.y, 0)).normalize();
    vector_helper_1.rotateAboutPoint(mesh, new three_1.Vector3(p0.x, p0.y, 0), axis, -Math.PI / 2, false);
    const outline = new three_1.LineSegments(new three_1.WireframeGeometry(mesh.geometry));
    const testing = GetOutlines_1.getOutlines(mesh.geometry, 90);
    console.log(testing);
    const testLines = new three_1.LineSegments(testing, new three_1.LineBasicMaterial({ color: 0x000000 }));
    testLines.translateZ(-0.2);
    outline.translateZ(-0.2);
    scene.add(testLines);
    vector_helper_1.rotateAboutPoint(testLines, new three_1.Vector3(p0.x, p0.y, 0), axis, -Math.PI / 2, false);
    scene.add(mesh);
    return { mesh: mesh, outline: testLines };
};
const getFloorVertices = (buildings) => {
    const floors = buildings.floors;
    const vertices = floors.map(n => {
        const temp = n.floorOutlines.map(m => getVector3FromPoint3d(m));
        return temp;
    });
    return vertices;
};
// const testingHoles = () => {
// 	const s1v = [
// 		new Vector3(0,0),
// 		new Vector3(0,1),
// 		new Vector3(1,1),
// 		new Vector3(1,0)
// 	]
// 	const s2v = [
// 		new Vector3(0.25, 0.25),
// 		new Vector3(0.25, 0.75),
// 		new Vector3(0.75, 0.75),
// 		new Vector3(0.75, 0.25)
// 	]
// 	const p2 = new Path(s2v)
// 	const s1 = new Shape(s1v)
// 	s1.holes.push(p2)
// 	const g1 = new ShapeGeometry(s1)
// 	const m1 = new Mesh(g1, new MeshLambertMaterial({ color: 0xffffff, side: DoubleSide}))
// 	m1.rotation.set(Math.PI/2, 0, 0)
// 	const s2 = new Shape(s2v)
// 	const g2 = new ShapeGeometry(s2)
// 	const extSet1 = {
// 		steps: 2,
// 		depth: 0.2,
// 		bevelEnabled: false,
// 		bevelThickness: 0,
// 		bevelSize: 0,
// 		bevelOffset: 0,
// 		bevelSegments: 0
// 	}
// 	const ext1 = new ExtrudeGeometry(s1, extSet1)
// 	const m2 = new Mesh(ext1, new MeshLambertMaterial({ color: 0xffffff, side: DoubleSide}))
// 	const edge1 = new EdgesGeometry(m2.geometry)
// 	const l1 = new LineSegments(edge1)
// 	scene.add(l1)
// 	scene.add(m2)
// 	// console.log(insightProSample.plotOutline)
// 	// const plotVertices = insightProSample.plotOutline.map(n => new Vector3(n.X, n.Y))
// 	// console.log(plotVertices)
// 	// const plotGeo = new Geometry()
// 	// const plotMat = new MeshLambertMaterial({ color: 0xffffff})
// 	// const plotShape = new Shape(plotVertices)
// 	// console.log(plotShape)
// 	// const plotMesh = new Mesh(plotGeo, plotMat)
// 	// scene.add(plotMesh)
// }
const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
};
initialize();
