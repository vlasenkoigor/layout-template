//TODO: verify it is working, perhaps think of a better solution
/**
 * this class manages the pairing between an event handler for a specific event and the element it is attached to.
 * used to easily remove the handler from the element.
 */
export class HandlerRegistration {
    /**
     * a reference to the element the handler is attached to
     */
    private readonly element: HTMLElement | (Window & typeof globalThis);

    /**
     * the handler function that is registered to the element
     */
    private readonly handlerFunction: EventListenerOrEventListenerObject;

    /**
     * the event type that is handled by the handler function
     */
    private readonly eventType: string;

    constructor(
        element: HTMLElement | typeof window,
        handlerFunction: EventListenerOrEventListenerObject,
        eventType: string
    ) {
        this.element = element;
        this.handlerFunction = handlerFunction;
        this.eventType = eventType;
    }

    public static registerHandler(
        element: HTMLElement | typeof window,
        handler: EventListenerOrEventListenerObject,
        eventType: string
    ): HandlerRegistration {
        element.addEventListener(eventType, handler);

        return new HandlerRegistration(element, handler, eventType);
    }

    public removeHandler(): void {
        this.element.removeEventListener(this.eventType, this.handlerFunction);
    }
}
