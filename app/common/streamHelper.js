import highland from 'highland';

export async function runFunctionForStream(someStream, someFunction) {
    const highlandStream = highland(someStream)
        .consume(highlandFunctionPromiseToConsume(item => someFunction(item)));

    return highlandStreamToPromise(highlandStream);
}

export function highlandFunctionPromiseToConsume(functionPromise) {
    return (err, x, push, next) => {
        if (err) {
            // pass errors along the stream and consume next value
            push(err);
            next();
        } else if (x === highland.nil) {
            // pass nil (end event) along the stream
            push(null, x);
        } else {
            functionPromise(x).then((result) => {
                push(null, result);
                next();
            }).catch((error) => {
                push(error);
                next();
            });
        }
    };
}

export function streamToPromise(stream) {
    return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
            reject(error);
        });

        stream.on('finish', () => {
            resolve();
        });
    });
}

export function highlandStreamToPromise(stream) {
    return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
            reject(error);
        });

        stream.done(() => {
            resolve();
        });
    });
}
