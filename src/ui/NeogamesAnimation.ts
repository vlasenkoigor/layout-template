import {SpriteAnimation} from "./SpriteAnimation";

export class IconAnimation extends SpriteAnimation{


    getAnimationCss(){
        const showAnimationRows = 3; // 45 frames within 15 frames per row
        const idleAnimationRows = this.rows - showAnimationRows;
        const frameRate = 24;
        const showTimeX = 1 / frameRate * this.cols;
        const showTimeY = showTimeX * showAnimationRows;


        const idleTimeX = showTimeX;
        const idleTimeY = idleTimeX * idleAnimationRows;

        const delayBeforeIdle = showTimeY;

//$
        return `
        #${this.id}.show{
             animation:  ${this.id}-show_x ${showTimeX}s steps(${this.cols}) ${showAnimationRows},  ${this.id}-show_y ${showTimeY}s steps(${showAnimationRows}),
${this.id}_idle-x ${idleTimeX}s steps(${this.cols}) ${delayBeforeIdle}s infinite, ${this.id}_idle-y ${idleTimeY}s steps(${idleAnimationRows}) ${delayBeforeIdle}s infinite
        }
        `
    }


    getKeyframesCss(){
        const showAnimationRows = 3; // 45 frames within 15 frames per row



        return `
        
            @keyframes ${this.id}-show_x {
              from {background-position-x: 0px;}
              to {background-position-x: -${this.textureWidth}px;}
            }
            
            @keyframes ${this.id}-show_y {
              from {background-position-y: 0px;}
              to {background-position-y: -${showAnimationRows * this.frameHeight}px;}
            }
        
           @keyframes ${this.id}_idle-x {
              from {background-position-x: 0px;}
              to {background-position-x: -${this.textureWidth}px;}
            }
                
            @keyframes ${this.id}_idle-y {
              from {background-position-y: -${showAnimationRows * this.frameHeight}px;}
              to {background-position-y: -${this.textureHeight}px;}
            }
        `
    }
}
