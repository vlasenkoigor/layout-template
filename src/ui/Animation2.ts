import {UIObject} from './UIObject';

/**
 * a class for HTML image elements
 */

type AnimationData = {
    name : string,  // animation name
    rows : number[], // rows to play
}

type KeyframesAxis = 'X' | 'Y';

export class SpriteAnimation extends UIObject {

    /**
     * uniq animation name to prevent css keyframes conflicts
     */
    private readonly animationName: string
    private readonly imagePath! : string;
    private readonly cols : number;
    private readonly rows : number;
    private readonly loadingPromise: Promise<any>;

    private  animations: AnimationData[] | undefined;
    private animationsPatterns!: Record<string, string>
    private loaded: boolean = false;
    private textureWidth!: number;
    private textureHeight!: number;

    private static DEFAULT_ANIMATION = 'default';


    constructor(imagePath: string, cols: number = 1, rows : number = 1, animations?: AnimationData[]) {
        super();

        this.animationName = SpriteAnimation.getUniqAnimationName();
        this.imagePath = imagePath;
        this.cols = cols;
        this.rows = rows;
        if (!animations){
            const animation: AnimationData = {name : SpriteAnimation.DEFAULT_ANIMATION, rows : [0,this.rows]}
            this.animations = [animation];
        }


        this.element = document.createElement('div');

        this.loadingPromise = this.loadImage();

        this.loadingPromise
            .then(()=>this.onResourceLoaded())
            .catch(console.log)
    }

    public didLoad(){
        return this.loadingPromise
    }

    public isLoaded(): boolean{
        return this.loaded;
    }

    private loadImage() : Promise<any>{
        const imagePath  = this.imagePath;

        return new Promise((resolve, reject)=>{
            const image = new Image();
            image.src = this.imagePath;

            image.addEventListener('load', (event)=>{
                const image:HTMLImageElement = event.target as HTMLImageElement;
                if (!image) return reject(`Image ${imagePath} has been loaded, event.target is empty!`)

                this.textureWidth = image.naturalWidth;
                this.textureHeight = image.naturalHeight;
                resolve();
            });

            image.addEventListener('error', (e)=>{
                reject(`Image ${imagePath} loading fail!`)
            })
        })
    }

    private onResourceLoaded(){
        this.loaded = true;
        this.initAnimation();
    }

    private initAnimation(){
        this.setAnimationStyle();
    }


    private setAnimationStyle(){
        const imagePath  = this.imagePath;
        this.createAnimationsKeyframesCss();

        this.style.border = '1px dashed grey';
        this.style.width = `${this.frameWidth}px`;
        this.style.height = `${this.frameHeight}px`;
        this.style.backgroundImage = `url(${imagePath})`;
    }

    public stop(){
        this.style.animation = '';
    }

    public play(animationName?:string){
        if (!animationName) animationName = SpriteAnimation.DEFAULT_ANIMATION;
        const animationData = this.animations?.find((ad)=>ad.name === animationName);

        if (!animationData) {
            return console.warn(`There is no ${animationName} data`)
        }

        const {name, rows} = animationData;
        const [rowFrom, rowTo] = rows;


        const columnsToPlay = this.cols;
        const rowsToPlay = Math.abs(rowTo - rowFrom);

        const moveXAnimationName: string = this.getKeyframeName(name, 'X');
        const moveYAnimationName = this.getKeyframeName(name, 'Y');

        // this.style.animation = `${moveXAnimationName} 1s steps(${columnsToPlay}) infinite, ${moveYAnimationName} 3s steps(${rowsToPlay}) infinite`;
        this.style.animation = `shout-x 2s steps(${this.cols}) 2s infinite`;
    }

    createAnimationsKeyframesCss(){
        document.head.insertAdjacentHTML('beforeend', this.getKeyframesCss());
    }

    getKeyframesCss(){
        return `
        <style>
            
             @keyframes shout-x {
                  from {background-position-x: 0px;background-position-y: -${2 * this.frameHeight}px;}
                  to {background-position-x: -${this.textureWidth}px; background-position-y: -${2 * this.frameHeight}px}
             }
                
                @keyframes shout-y {
                  from {background-position-y: 0px;}
                  to {background-position-y: 0px;}
                }
                
               @keyframes walk-x {
                  from {background-position-x: 0px;}
                  to {background-position-x: -${this.textureWidth}px;}
                }
                
                @keyframes walk-y {
                  from {background-position-y: 0px;}
                  to {background-position-y: ${-this.frameHeight * 2}px;}
                }
        </style>
        `
    }

    // createAnimationsKeyframesCss(){
    //     let keyframesCssString: string = '';
    //
    //     this.animations?.forEach((animation: AnimationData)=>{
    //         const {name, rows} = animation
    //         const [rowFrom, rowTo] = rows;
    //         const animationKeyframes = this.getAnimationKeyframes(name, rowFrom, rowTo);
    //
    //         keyframesCssString = `${keyframesCssString} ${animationKeyframes}`;
    //     })
    //     keyframesCssString = `<style>${keyframesCssString}</style>`
    //
    //     document.head.insertAdjacentHTML('beforeend', keyframesCssString);
    //     return keyframesCssString;
    // }


    getAnimationKeyframes(animationName: string, rowFrom: number, rowTo: number) : string{
        const startX = 0;
        const endX = this.cols * this.frameWidth;
        const startY = rowFrom * this.frameHeight;
        const endY = rowTo * this.frameHeight;

        return  `
                @keyframes ${this.getKeyframeName(animationName, 'X')} {
                  from {background-position-x: ${startX}px;}
                  to {background-position-x: -${endX}px;}
                }
                
                @keyframes ${this.getKeyframeName(animationName, 'Y')} {
                  from {background-position-y: ${startY}px;}
                  to {background-position-y: -${endY}px;}
                }
        `
    }

    public  getKeyframeName(animationName: string, axis : KeyframesAxis){
        return `${this.animationName}_${animationName}_move_${axis}`
        // return `move_${axis}`
    }


    /**
     * get the underlying HTML element cast as "img"
     */
    public getElement(): HTMLDivElement {
        return this.element as HTMLDivElement;
    }


    get frameWidth(): number{
        return  this.textureWidth / this.cols;
    }

    get frameHeight(): number{
        return   this.textureHeight / this.rows;
    }

    private static getUniqAnimationName() : string{
        return `animation_${generateUUID()}`;
    }
}


function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

