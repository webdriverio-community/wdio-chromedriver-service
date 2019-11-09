export default {
    start: jest.fn(() => new Promise((resolve) => { 
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