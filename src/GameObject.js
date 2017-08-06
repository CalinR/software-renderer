import { toRadians, toDegrees } from './utils'
let id = 0;

export default class GameObject {
    constructor({ x = 0, y = 0, z = 0, rotation = 0, sector = null }){
        this.id = id++;
        this.state = {
            x: x,
            y: y,
            z: z,
            rotation: rotation,
            sector: sector
        }
        this.onMove = null;
    }
    get x(){
        return this.state.x;
    }
    set x(x){
        this.state.x = x;
    }
    get y(){
        return this.state.y;
    }
    set y(y){
        this.state.y = y;
    }
    get z(){
        return this.state.z;
    }
    set z(z){
        this.state.z = z;
    }
    get rotation(){
        return this.state.rotation;
    }
    set rotation(rotation){
        this.state.rotation = rotation;
    }
    get sector(){
        return this.state.sector;
    }
    set sector(sector){
        this.state.sector = sector;
    }

    queueUpdate(){
        const oldState = Object.assign({}, this.state);
        this.update();
        if(JSON.stringify(this.state) !== JSON.stringify(oldState)){
            if(typeof this.onMove == 'function'){
                this.onMove(oldState, Object.assign({}, this.state));
            }
        }
    }

    update(){

    }
}