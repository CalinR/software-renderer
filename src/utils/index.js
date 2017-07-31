export { toRadians, toDegrees } from './degreeConversion'
export { intersect, intersectBox, pointSide } from './intersect'
export { deltaTime, lastUpdate, updateTime } from './time'
export { clamp } from './math'

export const scalerInit = (a, b, c, d, f) => {
    return {
        result: d + (b-1-a) * (f-d) / (c-a),
        bob: ((f<d) ^ (c<a)) ? -1 : 1,
        fd: Math.abs(f - d),
        ca: Math.abs(c - a),
        cache: (b - 1 - a) * Math.abs(f - d) % Math.abs(c - a)
    }
}

export const scalerNext = (scaler) => {
    for(scaler.cache += scaler.fd; scaler.cache >= scaler.ca; scaler.cache -= scaler.ca){
        scaler.result += scaler.bob;
    }

    return scaler.result;
}