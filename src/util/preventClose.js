import { currentSession } from '../stores'

const preventClose = e => {
    e.returnValue = 'Vous avez une session en cours. Voulez-vous vraiment quitter la page?'
}

currentSession.subscribe(session => {
    if (session) {
        window.addEventListener('beforeunload', preventClose)
    } else {
        window.removeEventListener('beforeunload', preventClose)
    }
})