const cross = (x0,y0, x1,y1) => {
    return (x0 * y1) - (x1 * y0)
}

const overlap = (a0, a1, b0, b1) => {
    return Math.min(a0,a1) <= Math.max(b0,b1) && Math.min(b0,b1) <= Math.max(a0,a1)
}

export const intersect = (x1,y1, x2,y2, x3,y3, x4,y4) => {
    let x = cross(x1,y1, x2,y2);
    let y = cross(x3,y3, x4,y4);
    let det = cross(x1-x2, y1-y2, x3-x4, y3-y4);
    x = cross(x, x1-x2, y, x3-x4) / det;
    y = cross(x, y1-y2, y, y3-y4) / det;

    return { x, y }
}

export const intersectBox = (x0,y0, x1,y1, x2,y2, x3,y3) => {
    return (overlap(x0,x1,x2,x3) && overlap(y0,y1,y2,y3))
}

export const pointSide = (px,py, x0,y0, x1,y1) => {
    return Math.sign(cross(x1-x0, y1-y0, px-x0, py-y0));
}