import { writable } from 'svelte/store'

export const userInfo = writable(JSON.parse(localStorage.getItem('userInfo')) || {})

userInfo.subscribe(value => localStorage.setItem('meilleurJourvie.userInfo', JSON.stringify(value)))