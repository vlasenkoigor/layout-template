/**
 * abstract class for general user-interface HTML objects
 * contains service methods
 */
import {HandlerRegistration} from '../events/HandlerRegistration';

export abstract class UIObject {
    /**
     * a general HTML element that may be replaced later by another, more specific, type of element
     */
    private _element!: HTMLElement;

    /**
     * this object can track DOM mutations on the element (attach \ detach from the HTML document)
     */
    private attachmentObserver: MutationObserver | null = null;

    private static readonly EMPTY_STYLENAME_MSG: string = 'Style names cannot be empty';

    /**
     * for internal use only. to get the element casted as the correct type use getElement() implementation of the specific class
     */
    protected get element(): HTMLElement {
        return this._element;
    }

    protected set element(value: HTMLElement) {
        this._element = value;
    }

    public get style(): CSSStyleDeclaration {
        return this.getElement().style;
    }

    /**
     * each subclass needs to implement this method to get the element casted as the appropriate HTML element type (e.g.: div, image, table, ...)
     */
    public abstract getElement(): HTMLElement;

    /**
     * Sets the object's width. This width does not include decorations such as
     * border, margin, and padding.
     *
     * @param width the object's new width, in CSS units (e.g. "10px", "1em")
     */
    public setWidth(width: string): void {
        this.style.width = width;
    }

    /**
     * Sets the object's height. This height does not include decorations such as
     * border, margin, and padding.
     *
     * @param height the object's new height, in CSS units (e.g. "10px", "1em")
     */
    public setHeight(height: string): void {
        this.style.height = height;
    }

    /**
     * Sets the object's primary style name and updates all dependent style names.
     *
     * @param style the new primary style name
     */
    public setStylePrimaryName(style: string): void {
        // Style names cannot contain leading or trailing whitespace, and cannot legally be empty.
        style = style.trim();
        if (style.length === 0) {
            throw new TypeError(UIObject.EMPTY_STYLENAME_MSG);
        }

        UIObject.updatePrimaryAndDependentStyleNames(this.element, style);
    }

    /**
     * Replaces all instances of the primary style name with newPrimaryStyleName.
     */
    private static updatePrimaryAndDependentStyleNames(elem: Element, newPrimaryStyle: string): void {
        let classes = elem.className.split(/\s+/);
        if (!classes) {
            return;
        }

        const oldPrimaryStyle = classes[0];
        const oldPrimaryStyleLen = oldPrimaryStyle.length;

        classes[0] = newPrimaryStyle;
        for (let i = 1, n = classes.length; i < n; i++) {
            const name = classes[i];
            if (
                name.length > oldPrimaryStyleLen &&
                name.charAt(oldPrimaryStyleLen) == '-' &&
                name.indexOf(oldPrimaryStyle) == 0
            ) {
                classes[i] = newPrimaryStyle + name.substring(oldPrimaryStyleLen);
            }
        }
        elem.className = classes.join(' ');
    }

    /*private static updatePrimaryAndDependentStyleNames(element: UIObject | HTMLElement, newPrimaryStyle: string): void {
        if (element instanceof UIObject) {
            element = element.getElement();
        }
        let classes: DOMTokenList = element.classList;
        if (!classes.length) {
            return;
        }

        const oldPrimaryStyle: string = classes[0];
        const oldPrimaryStyleLen: number = oldPrimaryStyle.length;

        //replace the old primary style with the new primary style
        classes.replace(classes[0], newPrimaryStyle);

        for (let i: number = 1, n: number = classes.length; i < n; i++) {
            const name: string = classes[i];

            //search and replace all instances of the old primary style with the new style
            if (
                name.indexOf(oldPrimaryStyle) == 0 &&
                name.charAt(oldPrimaryStyleLen) == '-' &&
                name.length > oldPrimaryStyleLen
            ) {
                classes.replace(classes[i], newPrimaryStyle + name.substring(oldPrimaryStyleLen));
            }
        }
    }*/

    /**
     * Adds or removes a dependent style name by specifying the style name's
     * suffix. The actual form of the style name that is added is:
     *
     * <pre class="code">
     * getStylePrimaryName() + '-' + styleSuffix
     * </pre>
     *
     * @param styleSuffix the suffix of the dependent style to be added or removed
     * @param add <code>true</code> to add the given style, <code>false</code> to
     *          remove it
     */
    public setStyleDependentName(styleSuffix: string, add: boolean): void {
        this.setStyleName(this.getStylePrimaryName() + '-' + styleSuffix, add);
    }

    /**
     * Gets the primary style name associated with the object.
     *
     * @return the element's primary style name
     */
    public getStylePrimaryName(): string {
        return this.element.classList[0];
    }

    /**
     * Adds or removes a style name. This method is typically used to remove
     * secondary style names, but it can be used to remove primary stylenames as
     * well. That use is not recommended.
     *
     * @param style the style name to be added or removed
     * @param add <code>true</code> to add the given style, <code>false</code> to
     *          remove it
     */
    public setStyleName(style: string, add?: boolean): void {
        if (add === undefined) {
            this.getElement().className = style;
        } else {
            style = style.trim();
            if (style.length === 0) {
                throw new TypeError(UIObject.EMPTY_STYLENAME_MSG);
            }

            if (add) {
                this.getElement().classList.add(style);
            } else {
                this.getElement().classList.remove(style);
            }
        }
    }

    /**
     * set the width and height of an object in pixels
     * @param width
     * @param height
     */
    public setPixelSize(width: number, height: number): void {
        const elementStyle: CSSStyleDeclaration = this.style;

        if (width >= 0) {
            elementStyle.width = width + 'px';
        }
        if (height >= 0) {
            elementStyle.height = height + 'px';
        }
    }

    /**
     * attach the provided handler to the element
     * @param handler - a named function for handling the event specified
     * @param eventType - the type of the event that is handled
     */
    public addDomHandler = (handler: EventHandlerNonNull, eventType: string): HandlerRegistration => {
        if (!handler) {
            throw new TypeError('handler must not be null');
        }

        if (handler.name === '' || handler.name === 'anonymous') {
            throw new TypeError('handler function must be named, it cannot be anonymous');
        }

        if (!eventType) {
            throw new TypeError('eventType must not be null');
        }

        const element: HTMLElement = this.getElement();

        element.addEventListener(eventType, handler as EventListenerOrEventListenerObject);

        return new HandlerRegistration(element, handler, eventType);
    };

    /**
     * wrap an HTML element as a UIObject to gain access to the added functionality
     * @param wrappedElement
     */
    public static wrapElement(wrappedElement: HTMLElement): UIObject {
        const wrapper: UIObject = new (class extends UIObject {
            getElement(): HTMLElement {
                return wrappedElement;
            }
        })();

        wrapper.element = wrappedElement;

        return wrapper;
    }

    /**
     * add an event handler to the element that invokes the supplied callback when the element is attached to the DOM or detached from the DOM
     * @param callback
     */
    public addAttachHandler(callback: MutationCallback): void {
        if (this.attachmentObserver) {
            throw new Error(
                'An AttachHandler was already added to this element, cannot have more than 1. call removeAttachHandler() first.'
            );
        }

        this.attachmentObserver = new MutationObserver(callback);
        const observerOptions = {
            childList: true
        };
        this.attachmentObserver.observe(this.getElement(), observerOptions);
    }

    public removeAttachHandler() {
        if (this.attachmentObserver) {
            this.attachmentObserver.disconnect();
            this.attachmentObserver = null;
        }
    }

    /**
     * Gets the object's offset height in pixels. This is the total height of the
     * object, including decorations such as border, margin, and padding.
     *
     * @return the object's offset height
     */
    public getOffsetHeight(): number {
        return this.getElement().offsetHeight;
    }

    /**
     * Gets the object's offset width in pixels. This is the total width of the
     * object, including decorations such as border, margin, and padding.
     *
     * @return the object's offset width
     */
    public getOffsetWidth(): number {
        return this.getElement().offsetWidth;
    }

    public setVisible(visible: boolean): void {
        this.style.display = visible ? '' : 'none';
    }

    /**
     * Adds a secondary or dependent style name to this object.
     */
    public addStyleName(style: string): void {
        this.setStyleName(style, true);
    }

    /**
     * Sets the title associated with this object. The title is the 'tool-tip'
     * displayed to users when they hover over the object.
     *
     * @param title the object's new title
     */
    public setTitle(title: string): void {
        if (!title || title.length === 0) {
            this.getElement().removeAttribute('title');
        } else {
            this.getElement().setAttribute('title', title);
        }
    }
}
