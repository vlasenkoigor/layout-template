import {UIObject} from './UIObject';

/**
 * a class for HTML image elements
 */
export class NGImage extends UIObject {
    constructor(imagePath: string) {
        super();

        this.element = document.createElement('img');
        this.getElement().src = imagePath;
    }

    /**
     * get the underlying HTML element cast as "img"
     */
    public getElement(): HTMLImageElement {
        return this.element as HTMLImageElement;
    }
}
