export { toRadians, toDegrees } from './degreeConversion'
export { intersect, intersectBox, pointSide } from './intersect'

    // #define min(a,b) (((a) < (b)) ? (a) : (b)) // min: Choose smaller of two values.
    // #define max(a,b) (((a) > (b)) ? (a) : (b)) // max: Choose bigger of two values.

    // Overlap:  Determine whether the two number ranges overlap.
    // #define Overlap(a0,a1,b0,b1) (min(a0,a1) <= max(b0,b1) && min(b0,b1) <= max(a0,a1))
    // // IntersectBox: Determine whether two 2D-boxes intersect.
    // #define IntersectBox(x0,y0, x1,y1, x2,y2, x3,y3) (Overlap(x0,x1,x2,x3) && Overlap(y0,y1,y2,y3))