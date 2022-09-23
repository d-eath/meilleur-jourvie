export const subscribeIgnoreFirst = (store, callback) => {
    let initialFired = false

    return store.subscribe(value => {
        if (!initialFired) {
            initialFired = true
        } else {
            callback(value)
        }
    })
}