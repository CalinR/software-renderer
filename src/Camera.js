import { toRadians, intersect, intersectBox, pointSide } from './utils/'

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
    }

    getActiveSector(){
        if(!this.world){
            throw new CameraException('No world to assigned to camera');
        }

        for(let sector of this.world){
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
        // console.log('moved', this.lastPosition, this.currentPosition);
        for(const sector of this.world){
            for(let i = 0; i<sector.vertices.length; i++){
                const vx1 = sector.vertices[i].x;
                const vy1 = sector.vertices[i].y;
                const vx2 = (i >= sector.vertices.length-1 ? sector.vertices[0].x : sector.vertices[i+1].x);
                const vy2 = (i >= sector.vertices.length-1 ? sector.vertices[0].y : sector.vertices[i+1].y);
                
                if(intersectBox(this.currentPosition.x, this.currentPosition.y, this.lastPosition.x, this.lastPosition.y, vx1, vy1, vx2, vy2)){
                    if(pointSide(this.currentPosition.x, this.currentPosition.y, vx1, vy1, vx2, vy2) > 0){
                        this.sector = sector.id;
                        console.log('you are now in sector ', sector.id);
                    }
                    break;
                }
            }
        } 
    }

    render(){
        if(!this.world){
            throw new CameraException('No world to render');
        }

        if(this.isMoving()){
            this.changeSector();
        }

        this.clear();

        const sector = this.world[this.sector];

        if(!sector){
            return false;
        }

        for(let i = 0; i<sector.vertices.length; i++){
            /* Acquire the x,y coordinates of the two vertexes forming the edge of the sector */
            /* Transform the vertices into the player's view */
            const vx1 = sector.vertices[i].x - this.parent.x;
            const vy1 = sector.vertices[i].y - this.parent.y;
            const vx2 = (i >= sector.vertices.length-1 ? sector.vertices[0].x : sector.vertices[i+1].x) - this.parent.x;
            const vy2 = (i >= sector.vertices.length-1 ? sector.vertices[0].y : sector.vertices[i+1].y) - this.parent.y;

            /* Rotate them around the player's view */
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
            if(tz1 <= 0 || tz2 <= 0)
            {
                const nearz = 5; // Not sure why this needs to be this
                const farz = 5; // Not sure why this needs to be this
                const nearside = 0.00001; // Not sure why this needs to be this
                const farside = 20; // Not sure why this needs to be this

                // Find an intersection between the wall and the approximate edges of player's view
                const i1 = intersect(tx1,tz1,tx2,tz2, -nearside,nearz, -farside,farz);
                const i2 = intersect(tx1,tz1,tx2,tz2, nearside,nearz, farside,farz);

                if(tz1 < nearz) { if(i1.y > 0) { tx1 = i1.x; tz1 = i1.y; } else { tx1 = i2.x; tz1 = i2.y; } }
                if(tz2 < nearz) { if(i1.y > 0) { tx2 = i1.x; tz2 = i1.y; } else { tx2 = i2.x; tz2 = i2.y; } }
            }


            /* Do perspective transformation */
            const xscale1 = (this.width * this.hfov) / tz1;
            const yscale1 = (this.height * this.vfov) / tz1;
            const xscale2 = (this.width * this.hfov) / tz2;
            const yscale2 = (this.height * this.vfov) / tz2;
            const x1 = this.width / 2 + (-tx1 * xscale1);
            const x2 = this.width / 2 + (-tx2 * xscale2);

            if(x1 >= x2) continue;

            const yceil = sector.ceiling - this.parent.z;
            const yfloor = sector.floor - this.parent.z;

            const y1a = this.height / 2 + (-this.yaw(yceil, tz1) * yscale1);
            const y1b = this.height / 2 + (-this.yaw(yfloor, tz1) * yscale1);
            const y2a = this.height / 2 + (-this.yaw(yceil, tz2) * yscale2);
            const y2b = this.height / 2 + (-this.yaw(yfloor, tz2) * yscale2);

            /* Disable by default */
            /* Use the following to draw out rotated vectors */
            // this.context.save();
            // this.context.beginPath();
            // this.context.strokeStyle = 'black';
            // this.context.moveTo(tx1 + (this.width / 2), tz1 + (this.height / 2));
            // this.context.lineTo(tx2 + (this.width / 2), tz2 + (this.height / 2));
            // this.context.stroke();
            // this.context.closePath();
            // this.context.restore();  
            
            /* USe the following to draw perspective transformed vertices */
            this.context.save();
            // Draws lines between vertices
            this.context.beginPath();
            this.context.strokeStyle = 'black';
            this.context.moveTo(x1, y1a);
            this.context.lineTo(x2, y2a);
            this.context.lineTo(x2, y2b);
            this.context.lineTo(x1, y1b);
            this.context.lineTo(x1, y1a);
            this.context.stroke();
            if(sector.vertices[i].neighbour > -1){
                this.context.fillStyle = 'red';
            }
            else {
                this.context.fillStyle = '#ccc';
            }
            this.context.fill();
            // Draws vertices
            this.context.fillStyle = 'red';
            this.context.fillRect(x1, y1a, 2, 2);
            this.context.fillRect(x1, y1b, 2, 2);
            this.context.fillRect(x2, y2a, 2, 2);
            this.context.fillRect(x2, y2b, 2, 2);
            this.context.closePath();
            this.context.restore();   
        }
        

        /* Disable by default */
        /* Use the following to draw out player for rotated vectors */
        // this.context.beginPath();
        // this.context.fillStyle = 'red';
        // this.context.fillRect(this.width/2 - 4, this.height/2 - 4, 8, 8);
        // this.context.closePath();

        this.lastPosition = this.currentPosition;
    }
}