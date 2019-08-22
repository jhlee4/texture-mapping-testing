"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const three_1 = require("three");
function getOutlines(geometry, thresholdAngle) {
    //THREE.BufferGeometry.call( this )
    const bufferGeometry = new three_1.BufferGeometry();
    thresholdAngle = (thresholdAngle !== undefined) ? thresholdAngle : 1;
    const thresholdDot = Math.cos(Math.PI / 180 * thresholdAngle);
    let edge = [0, 0], hash = {}, i, j, l, face, key;
    function sortFunction(a, b) {
        return a - b;
    }
    const keys = ['a', 'b', 'c'];
    let geometry2;
    if (geometry.isBufferGeometry) {
        geometry2 = new THREE.Geometry();
        geometry2.fromBufferGeometry(geometry);
    }
    else {
        geometry2 = geometry.clone();
    }
    geometry2.mergeVertices();
    geometry2.computeFaceNormals();
    const vertices = geometry2.vertices;
    const faces = geometry2.faces;
    for (let i = 0; i < faces.length; i++) {
        const face = faces[i];
        for (let j = 0; j < 3; j++) {
            edge[0] = face[keys[j]];
            edge[1] = face[keys[(j + 1) % 3]];
            const line = new three_1.Line3(vertices[edge[0]], vertices[edge[1]]);
            // for each vertex checks if it lies in the edge
            for (let e = vertices.length - 1; e >= 0; e--) {
                if (e === edge[0] || e === edge[1])
                    continue;
                const v = vertices[e];
                let closestPoint;
                line.closestPointToPoint(v, true, closestPoint);
                if ((new THREE.Line3(closestPoint, v)).distance() < 1e-5) { //1e-5
                    // mark the current face as splitted so that his cords won't be considered
                    face.splitted = true;
                    // Add two new faces, created splitting the face in two
                    faces.push(new THREE.Face3(e, face[keys[(j + 2) % 3]], face[keys[(j) % 3]], face.normal, face.color, face.materialIndex));
                    faces.push(new THREE.Face3(e, face[keys[(j + 2) % 3]], face[keys[(j + 1) % 3]], face.normal, face.color, face.materialIndex));
                    break;
                }
            }
            if (face.splitted)
                break;
        }
    }
    for (i = faces.length - 1; i >= 0; i--) {
        face = faces[i];
        if (face.splitted)
            continue;
        for (j = 0; j < 3; j++) {
            edge[0] = face[keys[j]];
            edge[1] = face[keys[(j + 1) % 3]];
            edge.sort(sortFunction);
            key = edge.toString();
            if (hash[key] === undefined) {
                hash[key] = { vert1: edge[0], vert2: edge[1], face1: i, face2: undefined };
            }
            else {
                hash[key].face2 = i;
            }
        }
    }
    const coords = [];
    for (key in hash) {
        const h = hash[key];
        // An edge is only rendered if the angle (in degrees) between the face normals of the adjoining faces exceeds this value. default = 1 degree.
        if (h.face2 !== undefined && faces[h.face1].normal.dot(faces[h.face2].normal) <= thresholdDot) {
            let vertex = vertices[h.vert1];
            coords.push(vertex.x);
            coords.push(vertex.y);
            coords.push(vertex.z);
            vertex = vertices[h.vert2];
            coords.push(vertex.x);
            coords.push(vertex.y);
            coords.push(vertex.z);
        }
    }
    bufferGeometry.addAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
    return bufferGeometry;
}
exports.getOutlines = getOutlines;
