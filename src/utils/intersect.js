const cross = (x0,y0, x1,y1) => {
    return (x0 * y1) - (x1 * y0)
}

export const intersect = (x1,y1, x2,y2, x3,y3, x4,y4) => {

    let x = cross(x1,y1, x2,y2);
    let y = cross(x3,y3, x4,y4);
    let det = cross(x1-x2, y1-y2, x3-x4, y3-y4);
    x = cross(x, x1-x2, y, x3-x4) / det;
    y = cross(x, y1-y2, y, y3-y4) / det;

    return { x, y }
}

const sign = (v) => {
    return (v > 0) - (v < 0);
}

const min = (a,b) => {
    return ((a<b)?a:b);
}

const max = (a,b) => {
    return ((a>b)?a:b);
}

const overlap = (a0, a1, b0, b1) => {
    return min(a0,a1) <= max(b0,b1) && min(b0,b1) <= max(a0,a1)
}

export const intersectBox = (x0,y0, x1,y1, x2,y2, x3,y3) => {
    return (overlap(x0,x1,x2,x3) && overlap(y0,y1,y2,y3))
}

export const pointSide = (px,py, x0,y0, x1,y1) => {
    return sign(cross(x1-x0, y1-y0, px-x0, py-y0));
}