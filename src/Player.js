import { toRadians, deltaTime} from './utils'

export default class Player {
    constructor({x = 0, y = 0, z = 0, rotation = 0, controls = { forward: 'w', backward: 's', left: 'a', right: 'd'}, world = null} = {}){
        this.x = x;
        this.y = y;
        this.z = z;
        this.rotation = rotation;
        this.world = world;
        this.speed = 0;
        this.moveSpeed = 50;
        this.rotationSpeed = 90;
        this.direction = 0;
        this.controls = controls;
        this.bindControls();
    }

    bindControls(){
        document.onkeydown = (event) => {
            event.preventDefault();
            switch(event.key){
                case this.controls.forward:
                    this.speed = 1;
                    break;
                case this.controls.backward:
                    this.speed = -1;
                    break;
                case this.controls.left:
                    this.direction = -1;
                    break;
                case this.controls.right:
                    this.direction = 1;
                    break;
            }
        }

        document.onkeyup = (event) => {
            switch(event.key){
                case this.controls.forward:
                    this.speed = 0;
                    break;
                case this.controls.backward:
                    this.speed = 0;
                    break;
                case this.controls.left:
                    this.direction = 0;
                    break;
                case this.controls.right:
                    this.direction = 0;
                    break;
            }
        }
    }

    update(){
        let rotation = this.rotation + ((this.direction * this.rotationSpeed) * deltaTime);
        
        if(rotation > 360){
            rotation = 0;
        }
        else if(rotation < 0){
            rotation = rotation + 360;
        }

        const moveStep = (this.speed * this.moveSpeed);
        const radians = toRadians(rotation);
        const moveX = Math.cos(radians) * moveStep;
        const moveY = Math.sin(radians) * moveStep;
        const x = this.x + (moveX * deltaTime);
        const y = this.y + (moveY * deltaTime);

        this.x = x;
        this.y = y;
        this.rotation = rotation;
    }
}