import {UIObject} from './UIObject';

export class SpriteAnimation extends UIObject {
    protected readonly id: string;
    private readonly imagePath! : string;
    protected readonly cols : number;
    protected readonly rows : number;
    private readonly loadingPromise: Promise<any>;

    private loaded: boolean = false;
    protected textureWidth!: number;
    protected textureHeight!: number;

    constructor(imagePath: string, cols: number = 1, rows:number = 1) {
        super();

        this.id = `animation_${generateUUID()}`;
        this.imagePath = imagePath;
        this.cols = cols;
        this.rows = rows;


        this.element = document.createElement('div');
        this.element.id = this.id;

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
        this.createCssRules();

        // this.style.border = '1px dashed grey';
        this.style.width = `${this.frameWidth}px`;
        this.style.height = `${this.frameHeight}px`;
        this.style.backgroundImage = `url(${imagePath})`;
    }

    public stop(){
        this.style.animation = '';
    }

    public play(animationClassName? : string){
        if (!animationClassName) animationClassName = 'animation';
        this.element.classList.add(animationClassName);
    }

    createCssRules(){
        document.head.insertAdjacentHTML('beforeend', `<style>${this.getKeyframesCss()}${this.getAnimationCss()}</style>`);
    }

    getAnimationCss(){
        const frameRate = 30;
        const timeX = 1 / frameRate * this.cols;
        const timeY = timeX * this.rows;

        return `
        #${this.id}.animation{
             animation:  ${this.id}_move-x ${timeX}s steps(${this.cols}) infinite, ${this.id}_move-y ${timeY}s steps(${this.rows}) infinite  
        }
        `
    }


    getKeyframesCss(){
        return `
           @keyframes ${this.id}_move-x {
              from {background-position-x: 0px;}
              to {background-position-x: -${this.textureWidth}px;}
            }
                
            @keyframes ${this.id}_move-y {
              from {background-position-y: 0px;}
              to {background-position-y: -${this.textureHeight}px;}
            }
        `
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


