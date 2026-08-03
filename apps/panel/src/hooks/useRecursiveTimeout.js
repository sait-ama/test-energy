import { useEffect, useRef } from 'react';

function useRecursiveTimeout(callback, delay) {
    const savedCallback = useRef(callback);
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

     
    useEffect(() => {
        let id;

        function tick() {
            const ret = savedCallback.current();

            if (ret instanceof Promise) {
                ret.then(() => {
                    if (delay !== null) {
                        id = setTimeout(tick, delay);
                    }
                });
            } else {
                if (delay !== null) {
                    id = setTimeout(tick, delay);
                }
            }
        }

        if (delay !== null) {
            id = setTimeout(tick, delay);
            return () => id && clearTimeout(id);
        }
    }, [delay]);
}

export default useRecursiveTimeout;
