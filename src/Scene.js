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
        object.onMove = (prevState, currentState) => this.objectMoved(prevState, currentState);
        this.objects.push(object);
    }

    objectMoved(prevState, currentState){
        // console.log('moved', prevState, currentState);
    }

    update(){
        updateTime();
        for(const object of this.objects){
            object.queueUpdate();
        }
    }
}