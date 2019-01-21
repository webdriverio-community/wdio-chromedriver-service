export default {
    start: jest.fn((args, returnPromise) => new Promise((resolve, reject) => { 
        process.nextTick(() => resolve({
            stdout: {
                pipe: jest.fn()
            },
            stderr: {
                pipe: jest.fn()
            }
        })) 
    })),
    stop: jest.fn(() => {}),
    path: 'chromedriver'
}