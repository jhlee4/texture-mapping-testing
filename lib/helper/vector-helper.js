"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const three_1 = require("three");
function showVectorPosition(v, scene) {
    const geo = new three_1.SphereGeometry(0.05, 32, 32);
    const mat = new three_1.MeshBasicMaterial({ color: 0x3abeff });
    const sphere = new three_1.Mesh(geo, mat);
    sphere.position.set(v.x, v.y, v.z ? v.z : 0);
    scene.add(sphere);
}
exports.showVectorPosition = showVectorPosition;
function showVectorDirection(v, origin, scene) {
    const arrowHelper = new THREE.ArrowHelper(new three_1.Vector3(v.x, v.y, v.z ? v.z : 0), new three_1.Vector3(origin.x, origin.y, origin.z ? origin.z : 0), v.length(), 0x000000, 0.1, 0.1);
    arrowHelper.translateZ(0.1);
    scene.add(arrowHelper);
}
exports.showVectorDirection = showVectorDirection;
function rotateAboutPoint(obj, anchor, axis, radian, pointIsWorld) {
    pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld;
    if (pointIsWorld) {
        obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }
    obj.position.sub(anchor); // remove the offset
    obj.position.applyAxisAngle(axis, radian); // rotate the POSITION
    obj.position.add(anchor); // re-add the offset
    if (pointIsWorld) {
        obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }
    obj.rotateOnAxis(axis, radian); // rotate the OBJECT
}
exports.rotateAboutPoint = rotateAboutPoint;
exports.showVertexNormal = (geo, scene) => {
    var helper = new THREE.VertexNormalsHelper(geo, 2, 0x00ff00, 1);
    scene.add(helper);
};
