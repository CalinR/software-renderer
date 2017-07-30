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