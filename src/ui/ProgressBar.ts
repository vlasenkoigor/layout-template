import {UIObject} from "./UIObject";

export class ProgressBar  extends UIObject{

    private fillerElement: HTMLDivElement;

    constructor(height: number = 10,  color: string = '#FF6100', fillerColor: string = '#FF6100' ) {
        super();

        this.element = document.createElement('div');
        this.element.style.position = 'relative';
        this.element.style.width = '90%';
        this.element.style.backgroundColor = `${color}`;
        this.element.style.height = `${height}px`;

        // this.element.style.border = `${borderSize}px solid ${color}`;
        // this.element.style.borderRadius = `${radius}px`;


        this.fillerElement = document.createElement('div');
        this.fillerElement.style.position = 'absolute';
        this.fillerElement.style.backgroundColor = `${fillerColor}`;
        this.fillerElement.style.width = '0px';
        this.fillerElement.style.height = `${height}px`;
        // this.fillerElement.style.borderRadius = `${radius}px`;
        this.fillerElement.style.transition = 'width 0.7s';
        this.element.appendChild(this.fillerElement);

    }

    public update(value: number){
        this.fillerElement.style.width = `${value}%`
    }



    public getElement(): HTMLDivElement {
        return this.element as HTMLDivElement;
    }

}
