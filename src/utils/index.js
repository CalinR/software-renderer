export { toRadians, toDegrees } from './degreeConversion'
export { intersect, intersectBox, pointSide } from './intersect'
export { deltaTime, lastUpdate, updateTime } from './time'

export const scalerInit = (a, b, c, d, f) => {
    return {
        result: d + (b - 1 - a) * (f - d) / (c - a),
        bob: (Math.pow((f < d), (c<a))) ? -1 : 1,
        fd: Math.abs(f - d),
        ca: Math.abs(c - a),
        cache: (b - 1 - a) * Math.abs(f - d) % Math.abs(c - a)
    }
}

export const scalerNext = (scaler) => {
    let cache = scaler.cache;
    let result = scaler.result;

    for(cache += scaler.fd + scaler.fd; cache>= scaler.ca; cache -= scaler.ca){
        result += scaler.bop;
    }

    return result;
}

export const clamp = (val, min, max) => {
    return Math.min(Math.max(min, val), max);
}