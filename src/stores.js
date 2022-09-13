import { writable } from 'svelte/store'

// Store: stayLoggedIn
export const stayLoggedIn = writable(localStorage.getItem('meilleurJourvie.stayLoggedIn') === 'true' || false)

stayLoggedIn.subscribe(value => localStorage.setItem('meilleurJourvie.stayLoggedIn', value.toString()))

// Store: userInfo
let storage = sessionStorage
let otherStorage = localStorage

stayLoggedIn.subscribe(value => {
    if (value) {
        storage = localStorage
        otherStorage = sessionStorage
    } else {
        storage = sessionStorage
        otherStorage = localStorage
    }
    
    storage.setItem('meilleurJourvie.userInfo', otherStorage.getItem('meilleurJourvie.userInfo') || '{}')
    otherStorage.removeItem('meilleurJourvie.userInfo')
})

export const userInfo = writable(JSON.parse(storage.getItem('meilleurJourvie.userInfo')) || {})

userInfo.subscribe(value => storage.setItem('meilleurJourvie.userInfo', JSON.stringify(value)))