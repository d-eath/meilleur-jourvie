import { currentSession } from '../stores'

currentSession.subscribe(session => {
    // @ts-ignore
    document.querySelector('link[rel~="icon"]').href = session ? '/jourvie-active.png' : '/jourvie-inactive.png'
})

