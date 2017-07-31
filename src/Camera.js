import { toRadians, intersectBox, pointSide, clamp } from './utils/'
import GameObject from './GameObject'

function CameraException(message) {
   this.message = message;
   this.name = 'CameraException';
}

export default class Camera {
    constructor({ x = 0, y = 0, z = 0, parent = null, world = null, rotation = 0, element = null} = {}){
        if(!element){
            throw new CameraException('DOM element needs to be defined');
        }
        if(!parent){
            throw new CameraException('No parent assigned');
        }
        if(parent instanceof GameObject == false){
            throw new CameraException('Parent must be an instance of GameObject');
        }

        this.width = element.width;
        this.height = element.height;
        this.x = x;
        this.y = y;
        this.z = z;
        this.parent = parent;
        this.world = world;
        this.rotation = rotation;
        this.hfov = (1.0 * 0.73 * this.height / this.width);
        this.vfov = (1.0 * .2);
        this.context = element.getContext('2d');
        this.lastPosition = {
            x: parent.x,
            y: parent.y
        }
        this.sector = this.getActiveSector();

        Camera.optimizeCanvas(element);
    }

    static optimizeCanvas(canvas){
        // canvas.style.imageRendering = 'optimizeSpeed'; // Older versions of FF
        // canvas.style.imageRendering = '-moz-crisp-edges'; // FF 6.0+
        // canvas.style.imageRendering = '-webkit-optimize-contrast'; // Safari
        // canvas.style.imageRendering = '-o-crisp-edges'; // Opera 12+
        canvas.style.imageRendering = 'pixelated'; // Modern Browsers
        // canvas.style['-ms-interpolation-mode'] = 'nearest-neighor'; // IE
    }

    getActiveSector(){
        if(!this.world){
            throw new CameraException('No world to assigned to camera');
        }

        for(let sector of this.world.sectors){
            let wallMatches = 0;
            for(let i = 0; i<sector.vertices.length; i++){
                const vx1 = sector.vertices[i].x;
                const vy1 = sector.vertices[i].y;
                const vx2 = (i >= sector.vertices.length-1 ? sector.vertices[0].x : sector.vertices[i+1].x);
                const vy2 = (i >= sector.vertices.length-1 ? sector.vertices[0].y : sector.vertices[i+1].y);
                if(pointSide(this.currentPosition.x, this.currentPosition.y, vx1, vy1, vx2, vy2) > 0){
                    wallMatches++;
                }
            }

            if(wallMatches == sector.vertices.length){
                this.parent.sector = sector;
                return sector.id;
                break;
            }
        }
    }

    get currentPosition(){
        return {
            x: this.parent.x,
            y: this.parent.y
        }
    }

    isMoving(){
        return JSON.stringify(this.currentPosition) !== JSON.stringify(this.lastPosition);
    }

    clear(){
        this.context.clearRect(0,0, this.width, this.height);
    }

    yaw(y, z){
        return y + z*0; // 0 is placeholder. Should be player yaw, based on if the player is looking up or down.
    }

    changeSector(){
        for(const sector of this.world.sectors){
            for(let i = 0; i<sector.vertices.length; i++){
                const vx1 = sector.vertices[i].x;
                const vy1 = sector.vertices[i].y;
                const vx2 = (i >= sector.vertices.length-1 ? sector.vertices[0].x : sector.vertices[i+1].x);
                const vy2 = (i >= sector.vertices.length-1 ? sector.vertices[0].y : sector.vertices[i+1].y);
                
                if(intersectBox(this.currentPosition.x, this.currentPosition.y, this.lastPosition.x, this.lastPosition.y, vx1, vy1, vx2, vy2)){
                    if(pointSide(this.currentPosition.x, this.currentPosition.y, vx1, vy1, vx2, vy2) > 0){
                        this.sector = sector.id;
                        this.parent.sector = sector;
                        console.log('you are now in sector ', sector.id);
                    }
                    break;
                }
            }
        } 
    }

    renderSector(sector, sx1, sx2, ytop, ybottom){
        if(!sector){
            return false;
        }

        for(let i = 0; i<sector.vertices.length; i++){
            const vx1 = sector.vertices[i].x - this.parent.x;
            const vy1 = sector.vertices[i].y - this.parent.y;
            const vx2 = (i >= sector.vertices.length-1 ? sector.vertices[0].x : sector.vertices[i+1].x) - this.parent.x;
            const vy2 = (i >= sector.vertices.length-1 ? sector.vertices[0].y : sector.vertices[i+1].y) - this.parent.y;

            // rotate points around player
            const angle = toRadians(this.parent.rotation);
            const pcos = Math.cos(angle);
            const psin = Math.sin(angle);
            let tx1 = vx1 * psin - vy1 * pcos;
            let tz1 = vx1 * pcos + vy1 * psin;
            let tx2 = vx2 * psin - vy2 * pcos;
            let tz2 = vx2 * pcos + vy2 * psin;

            /* Is the wall at least partially in front of the player? */
            if(tz1 <= 0 && tz2 <= 0) continue;

            /* Is any part of the wall behind the player */
            if(tz1 <= 0){
                tx1 = (0.01 - tz1) * (tx2 - tx1) / (tz2 - tz1) + tx1;
                tz1 = 0.01;
            }
            if(tz2 <= 0){
                tx2 = (0.01 - tz2) * (tx1 - tx2) / (tz1 - tz2) + tx2;
                tz2 = 0.01;
            }

            /* Do perspective transformation */
            const xscale1 = (this.width * this.hfov) / tz1;
            const yscale1 = (this.height * this.vfov) / tz1;
            const xscale2 = (this.width * this.hfov) / tz2;
            const yscale2 = (this.height * this.vfov) / tz2;
            const x1 = this.width / 2 + (-tx1 * xscale1);
            const x2 = this.width / 2 + (-tx2 * xscale2);

            if(x1 >= x2) continue;

            const yceil = sector.ceiling - (this.parent.z + this.z);
            const yfloor = sector.floor - (this.parent.z + this.z);

            const y1a = this.height / 2 + (-this.yaw(yceil, tz1) * yscale1);
            const y1b = this.height / 2 + (-this.yaw(yfloor, tz1) * yscale1);
            const y2a = this.height / 2 + (-this.yaw(yceil, tz2) * yscale2);
            const y2b = this.height / 2 + (-this.yaw(yfloor, tz2) * yscale2);

            let nyceil = 0;
            let nyfloor = 0;
            const neighbour = sector.vertices[i].neighbour;

            if(neighbour > -1){
                nyceil = this.world.sectors[neighbour].ceiling - (this.parent.z + this.z);
                nyfloor = this.world.sectors[neighbour].floor - (this.parent.z + this.z); 
            }

            let ny1a = this.height / 2 + (-this.yaw(nyceil, tz1) * yscale1);
            let ny1b = this.height / 2 + (-this.yaw(nyfloor, tz1) * yscale1);
            let ny2a = this.height / 2 + (-this.yaw(nyceil, tz2) * yscale2);
            let ny2b = this.height / 2 + (-this.yaw(nyfloor, tz2) * yscale2);

            const beginX = parseInt(Math.max(x1, sx1));
            const endX = parseInt(Math.min(x2, sx2));

            // Is the wall on screen
            if(endX < 0 || beginX > this.width){
                continue;
            }

            let nytop = [];
            let nybottom = [];

            for(let x = beginX; x < endX; x++){
                /* Acquire the Y coordinates for our floor & ceiling for this X coordinate */
                const ya = (x-x1) * (y2a-y1a) / (x2-x1) + y1a;
                const yb = (x-x1) * (y2b-y1b) / (x2-x1) + y1b;
                
                /* Clamp the ya & yb */
                const cya = clamp(ya, ytop[x], ybottom[x]);
                const cyb = clamp(yb, ytop[x],ybottom[x]);

                nytop[x] = cya+1;
                nybottom[x] = cyb;

                /* Render ceiling: everything above this sector's ceiling height. */
                this.vline(x, ytop[x], cya+1, '#34495e');
                /* Render floor: everything below this sector's floor height. */
                this.vline(x,cyb,  ybottom[x], '#3498db');

                if(neighbour<0){
                    this.vline(x, cya+1, cyb+1, x == beginX || x == endX ? '#000000' : '#ecf0f1');
                }
                else {
                    /* Aquire the Y coordinates for our neighbour's floor and ceiling for this X coordinate */
                    const nya  = (x - x1) * (ny2a-ny1a) / (x2 - x1) + ny1a;
                    const nyb = (x - x1) * (ny2b - ny1b) / (x2 - x1) + ny1b;

                    const cnya = clamp(nya, ytop[x], ybottom[x]);
                    const cnyb = clamp(nyb, ytop[x], ybottom[x]);

                    // If our ceiling is higher than the neighours ceiling, render it
                    if(cnya > cya){
                        this.vline(x, cya, cnya+1, x == beginX || x == endX ? '#000000' : '#ecf0f1');
                        nytop[x] = clamp(cnya, nytop[x], this.height); // 199 is likely not correct
                    }
                    else {
                        nytop[x] = clamp(cya, nytop[x], this.height);
                    }

                    // If our floor is lower than the neighbours floor, render it
                    if(cyb > cnyb){
                        this.vline(x, cnyb - 1, cyb, x == beginX || x == endX ? '#000000' : '#2980b9');
                        nybottom[x] = clamp(cnyb, 0, ybottom[x]);
                    }
                    else {
                        nybottom[x] = clamp(cyb, 0, ybottom[x]);
                    }
                }
            }


            if(neighbour>-1){
                this.renderSector(this.world.sectors[neighbour], beginX, endX, nytop, nybottom);
            }

        }
    }

    renderSprites(){
        for(const sprite of this.world.enemies){
            const vx1 = sprite.x - this.parent.x;
            const vy1 = sprite.y - this.parent.y;

            // rotate sprite around player
            const angle = toRadians(this.parent.rotation);
            const pcos = Math.cos(angle);
            const psin = Math.sin(angle);
            const otx1 = vx1 * psin - vy1 * pcos;
            const tz1 = vx1 * pcos + vy1 * psin;

            /* Is the wall at least partially in front of the player? */
            if(tz1 <= 0) continue;

            /* Do perspective transformation */
            const tx1 = otx1 - 5; // 5 needs to be sprite size / 2
            const tx2 = otx1 + 5; // 5 needs to be sprite size / 2
            const xscale1 = (this.width * this.hfov) / tz1;
            const yscale1 = (this.height * this.vfov) / tz1;
            const x1 = this.width / 2 + (-tx1 * xscale1);
            const x2 = this.width / 2 + (-tx2 * xscale1);
            const ox1 = this.width / 2 + (-otx1 * xscale1);
            const diff = Math.max(x1, x2) - Math.min(x1, x2);
            const yfloor = 0 - (this.z + this.parent.z); // 0 needs to be sprite's z coordinate

            const y1b = this.height / 2 + (-this.yaw(yfloor, tz1) * yscale1);
            const y1a = y1b - diff;

            // #TODO
            //    * Log all ytop's and ybottom's for each visibile sector. Then cross reference for masking sprite.
            //    * Draw sprite 1 column at a time.

            // Draw sprite outline
            this.context.beginPath();
            this.context.strokeStyle = '#000000';
            this.context.fillStyle = '#2ecc71';
            this.context.rect(x1 - diff, y1a, diff, diff);
            this.context.fill();
            this.context.stroke();
            this.context.closePath();

            // Draw centre line of sprite
            this.context.beginPath();
            this.context.strokeStyle = '#000000';
            this.context.moveTo(ox1, y1a);
            this.context.lineTo(ox1, y1b);
            this.context.stroke();
            this.context.closePath();

        }
    }

    vline(x, y1, y2, color){
        this.context.beginPath();
        this.context.strokeStyle = color;
        this.context.moveTo(x-0.5, y1);
        this.context.lineTo(x-0.5, y2);
        this.context.stroke();
        this.context.closePath();
    }

    render(){
        if(!this.world){
            throw new CameraException('No world to render');
        }

        if(this.isMoving()){
            this.changeSector();
        }

        this.clear();

        const sector = this.world.sectors[this.sector];

        let ytop = [];
        let ybottom = [];

        for(var x=0; x<this.width-1; x++){
            ytop[x] = 0;
            ybottom[x] = this.height - 1;
        }

        this.renderSector(sector, 0, this.width-1, ytop, ybottom);
        this.renderSprites();
        this.lastPosition = this.currentPosition;
    }
}