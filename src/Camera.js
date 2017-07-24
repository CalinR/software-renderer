function CameraException(message) {
   this.message = message;
   this.name = 'CameraException';
}

export default class Camera {
    constructor({ x = 0, y = 0, z = 0, world = null, rotation = 0, element = null} = {}){
        if(!element){
            throw new CameraException('DOM element needs to be defined');
        }

        this.width = element.width;
        this.height = element.height;
        this.x = x;
        this.y = y;
        this.z = z;
        this.sector = null;
        this.world = world;
        this.rotation = rotation;
        this.hfov = (1.0 * 0.73 * this.height / this.width);
        this.vfov = (1.0 * .2);

        console.log(this);
    }

    findActiveSector(){
        for(const sector of this.world){
            console.log(sector);
        }
    }

    render(){
        if(!this.world){
            throw new CameraException('No world to render');
        }

        this.findActiveSector();

        // for(const sector of this.world){
        //     console.log(sector);
        // }
    }
}