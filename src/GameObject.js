let id = 0;

export default class GameObject {
    constructor({ x = 0, y = 0, z = 0, rotation = 0 }){
        this.id = id++;
        this.x = x;
        this.y = y;
        this.z = z;
        this.rotation = rotation;
        this.sector = null;
    }
}