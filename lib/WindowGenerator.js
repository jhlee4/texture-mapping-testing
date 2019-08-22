"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const three_1 = require("three");
const vector_helper_1 = require("./helper/vector-helper");
function getWindowHoles(wall, scene) {
    const wallWidth = wall[0].distanceTo(wall[1]);
    const heightOffset = 1.2;
    const minWallWidth = 2.3;
    if (wallWidth >= minWallWidth) {
        const numOfSegment = Math.floor(wallWidth / minWallWidth);
        const segmentWidth = wallWidth / numOfSegment;
        const av = new three_1.Vector2().subVectors(wall[1], wall[0]).normalize();
        const pv = new three_1.Vector2().subVectors(wall[3], wall[0]).normalize();
        let origins = [];
        for (let i = 0; i < numOfSegment; i++) {
            const tempOrigin = new three_1.Vector2(wall[0].x, wall[0].y);
            const tempAV = new three_1.Vector2(av.x, av.y);
            tempAV.multiplyScalar(i * segmentWidth);
            tempOrigin.add(tempAV);
            origins.push(tempOrigin);
        }
        const holes = origins.map(n => getWindowHole(n, pv, av, segmentWidth, heightOffset, scene));
        return holes;
    }
    else {
        return null;
    }
}
exports.getWindowHoles = getWindowHoles;
function getWindowHole(origin, pv, av, width, heightOffset, scene) {
    const windowDimension = [1, 1];
    const tempAV = new three_1.Vector2(av.x, av.y);
    const tempPV = new three_1.Vector2(pv.x, pv.y);
    tempAV.multiplyScalar((width / 2) - (windowDimension[0] / 2));
    tempPV.multiplyScalar(heightOffset);
    const originV = new three_1.Vector2(av.x, av.y).add(pv);
    const windowOrigin = new three_1.Vector2(origin.x, origin.y).add(originV);
    tempAV.normalize();
    tempPV.normalize();
    const p1 = new three_1.Vector2(windowOrigin.x, windowOrigin.y).add(tempPV);
    const p2 = new three_1.Vector2(p1.x, p1.y).add(tempAV);
    const p3 = new three_1.Vector2(windowOrigin.x, windowOrigin.y).add(tempAV);
    const vertices = [windowOrigin, p1, p2, p3, windowOrigin];
    return vertices;
}
