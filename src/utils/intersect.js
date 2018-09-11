const cross = (x0,y0, x1,y1) => {
    return (x0 * y1) - (x1 * y0)
}

const overlap = (a0, a1, b0, b1) => {
    return Math.min(a0,a1) <= Math.max(b0,b1) && Math.min(b0,b1) <= Math.max(a0,a1)
}

export const intersectBox = (x0,y0, x1,y1, x2,y2, x3,y3) => {
    return (overlap(x0,x1,x2,x3) && overlap(y0,y1,y2,y3))
}

export const pointSide = (px,py, x0,y0, x1,y1) => {
    return Math.sign(cross(x1-x0, y1-y0, px-x0, py-y0));
}

export const intersectLines = (x0,y0, x1,y1, x2,y2, x3,y3) => {
    // Go here to see demonstation https://jsfiddle.net/qc705skx/4/
    // Math from https://gamedev.stackexchange.com/questions/26004/how-to-detect-2d-line-on-line-collision

    // const denominator = ((x1 - x0) * (y3 - y2)) - ((y1 - y0) * (x3 - x2));
    // const numerator1  = ((y0 - y2) * (x3 - x2)) - ((x0 - x2) * (y3 - y2));
    // const numerator2  = ((y0 - y2) * (x1 - x0)) - ((x0 - x2) * (y1 - y0));
    const denominator = cross(x1-x0, x3-x2, y1-y0, y3-y2);
    const numerator1  = cross(y0-y2, y3-y2, x0-x2, x3-x2);
    const numerator2  = cross(y0-y2, y1-y0, x0-x2, x1-x0);

    if(denominator == 0){
        return numerator1 == 0 && numerator2 == 0;
    }

    const r = numerator1 / denominator;
    const s = numerator2 / denominator;

    return (r > 0 && r <= 1) && (s >= 0 && s <= 1);
}