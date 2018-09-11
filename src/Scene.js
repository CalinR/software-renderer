import { updateTime } from './utils'

export default class Scene {
    constructor(world = {}){
        this.objects = [];
        this.world = world;
    }

    addWorld(world){
        this.world = world;
    }

    add(object){
        object.onMove = (prevState, currentState, object) => this.objectMoved(prevState, currentState, object);
        this.objects.push(object);
    }

    objectMoved(prevState, currentState, object){
        // if(object.x < 10){
        //     object.x = 10;
        //     object.velocity.x = 0;
        // }
        // console.log('moved', prevState, currentState, object);
    }

    update(){
        updateTime();
        for(const object of this.objects){
            object.queueUpdate();
        }
    }
}