import axios from 'axios'
import { replace } from 'svelte-spa-router'
import { loginInfo, loginMessage, userInfo } from '../stores'
import { get } from 'svelte/store'
import { stringify } from 'query-string'

const { VITE_API_URL } = import.meta.env

setInterval(async () => {
    const id = get(loginInfo)?.id
    const projectId = get(loginInfo)?.projectId
    const token = get(loginInfo)?.token

    if (token) {
        const req = await axios.post(`${VITE_API_URL}/getDevStats.php?projetId=${projectId}`, stringify({
            devId: id,
            acces: token
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
        })

        // if the api returns a string (even though it should return a json object,
        // because content-type is application/json), then it means the login failed
        // what the fuck martel?
        if (typeof req.data !== 'object') {
            loginMessage.set({
                kind: 'warning',
                title: 'Session invalide',
                message: 'Votre session a été invalidée. Veuillez vous reconnecter.'
            })

            loginInfo.set({})
            userInfo.set({})

            replace('/login')
        }
    }
}, 5000)