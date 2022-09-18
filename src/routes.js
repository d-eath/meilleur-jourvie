import Login from './routes/Login.svelte'
import Journal from './routes/Journal.svelte'
import Files from './routes/Files.svelte'
import Tasks from './routes/Tasks.svelte'
import Stats from './routes/Stats.svelte'
import CatchAll from './routes/CatchAll.svelte'

import { loginInfo } from './stores'
import { get } from 'svelte/store'
import { wrap } from 'svelte-spa-router/wrap'

const routes = {
    '/login': wrap({
        component: Login,
        conditions: [() => !get(loginInfo)?.token]
    }),
    '/journal': wrap({
        component: Journal,
        conditions: [() => get(loginInfo)?.token]
    }),
    '/files': wrap({
        component: Files,
        conditions: [() => get(loginInfo)?.token]
    }),
    '/tasks': wrap({
        component: Tasks,
        conditions: [() => get(loginInfo)?.token]
    }),
    '/stats': wrap({
        component: Stats,
        conditions: [() => get(loginInfo)?.token]
    }),
    '*': CatchAll
}

export default routes