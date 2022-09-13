import Login from './routes/Login.svelte'
import Journal from './routes/Journal.svelte'
import Tasks from './routes/Tasks.svelte'
import Stats from './routes/Stats.svelte'
import CatchAll from './routes/CatchAll.svelte'

const routes = {
    '/login': Login,
    '/journal': Journal,
    '/tasks': Tasks,
    '/stats': Stats,
    '*': CatchAll
}

export default routes