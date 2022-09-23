import { writable } from 'svelte/store'

// Store: loginMessage
export const loginMessage = writable()

// Store: userInfo
export const userInfo = writable()

// Store: currentSession
export const currentSession = writable()

// Store: stayLoggedIn
export const stayLoggedIn = writable(localStorage.getItem('meilleurJourvie.stayLoggedIn') === 'true' || false)

stayLoggedIn.subscribe(value => localStorage.setItem('meilleurJourvie.stayLoggedIn', value.toString()))

// Store: loginInfo
let storage = sessionStorage
let otherStorage = localStorage
let firstTime = true

stayLoggedIn.subscribe(value => {
    if (value) {
        storage = localStorage
        otherStorage = sessionStorage
    } else {
        storage = sessionStorage
        otherStorage = localStorage
    }
    
    if (!firstTime) {
        storage.setItem('meilleurJourvie.loginInfo', otherStorage.getItem('meilleurJourvie.loginInfo') || '{}')
        otherStorage.removeItem('meilleurJourvie.loginInfo')
    } else {
        firstTime = false
    }
})

export const loginInfo = writable(JSON.parse(storage.getItem('meilleurJourvie.loginInfo')) || {})

loginInfo.subscribe(value => storage.setItem('meilleurJourvie.loginInfo', JSON.stringify(value)))