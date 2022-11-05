// @ts-nocheck

import { currentSession } from '../stores'

const favicon = document.querySelector('link[rel="icon"]')
const basePath = favicon.href.substring(0, favicon.href.lastIndexOf('/'))

currentSession.subscribe(session => {  
    favicon.href = basePath + (session ? '/jourvie-active.png' : '/jourvie-inactive.png')
})
