/**
 * Naive implementation of multiple dispatch
 */

export interface DispatchOptions<TDispatch> {
    name: string;
    params: Array<{ name: string, isa?: (special: TDispatch, general: TDispatch) => boolean }>;
}

export interface Dispatcher<TReturn, TDispatch> {
    name: string;
    override(types: TDispatch[], callback: (...types: TDispatch[]) => TReturn): boolean;
    dispatch(...types: TDispatch[]): TReturn;
}

export interface DispatchHandler<TReturn, TDispatch> {
    types: TDispatch[];
    handler: (...types: TDispatch[]) => TReturn;
}

export default function create<TReturn, TDispatch>(options: DispatchOptions<TDispatch>): Dispatcher<TReturn, TDispatch> {
    const dispatchers: Array<DispatchHandler<TReturn, TDispatch>> = [];

    const name = options.name;
    const override = (types: TDispatch[], handler: (...types: TDispatch[]) => TReturn) => {
        if (options.params.length !== types.length) {
            return false;
        }
        if (typeof handler !== 'function') {
            return false;
        }
        dispatchers.push({ types, handler });
        return true;
    }

    // Find the best match dispatcher and call its handler with the types provided 
    const dispatch = (...types: TDispatch[]): TReturn => {
        if (types.length !== options.params.length) {
            // Is this expected? Should we offer some default behaviour here?
            throw new Error('Invalid number of arguments');
        }

        const results: { matches: number, dispatcher: DispatchHandler<TReturn, TDispatch> }[] = [];
        for (const dispatcher of dispatchers) {
            let matches = 0;
            let typeIndex = 0;
            for (const type of types) {
                const isa = options.params[typeIndex].isa || (() => dispatchType === type);
                const dispatchType = dispatcher.types[typeIndex++];
                if (isa(type, dispatchType)) {
                    matches++;
                }
            }
            results.push({ matches, dispatcher });
        }

        const max = Math.max(...results.map(result => result.matches));
        const maxMatches = results.filter(result => result.matches === max);
        if (maxMatches.length === 0) {
            throw new Error('No match found');
        }
        if (maxMatches.length > 1) {
            console.log(maxMatches);
            throw new Error('Ambiguous call');
        }
        return maxMatches[0].dispatcher.handler(...types);
    }

    return {
        name,
        override,
        dispatch
    };
}
