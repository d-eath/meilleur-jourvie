import Login from './routes/Login.svelte'
import Journal from './routes/Journal.svelte'
import Tasks from './routes/Tasks.svelte'
import Stats from './routes/Stats.svelte'
import CatchAll from './routes/CatchAll.svelte'

import { userInfo } from './stores'
import { get } from 'svelte/store'
import { wrap } from 'svelte-spa-router/wrap'

const routes = {
    '/login': wrap({
        component: Login,
        conditions: [() => !get(userInfo)?.loginToken]
    }),
    '/journal': wrap({
        component: Journal,
        conditions: [() => get(userInfo)?.loginToken]
    }),
    '/tasks': wrap({
        component: Tasks,
        conditions: [() => get(userInfo)?.loginToken]
    }),
    '/stats': wrap({
        component: Stats,
        conditions: [() => get(userInfo)?.loginToken]
    }),
    '*': CatchAll
}

export default routes