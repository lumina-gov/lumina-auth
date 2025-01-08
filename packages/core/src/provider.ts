
export abstract class Provider<P, I, O> {
    abstract handle(request: I): Promise<O>

    constructor() {
        
    }
}
