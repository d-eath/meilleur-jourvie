import axios from 'axios'
import { stringify } from 'query-string'
import { get } from 'svelte/store'
import { replace } from 'svelte-spa-router'
import { loginInfo, loginMessage, userInfo } from '../stores'

const { VITE_API_URL } = import.meta.env
const CHECK_INTERVAL = 5000

let lastCheck = 0

const hasValidSession = async () => {
    if (Date.now() <= lastCheck + CHECK_INTERVAL) {
        return
    }

    lastCheck = Date.now()

    const id = get(loginInfo)?.id
    const projectId = get(loginInfo)?.projectId
    const token = get(loginInfo)?.token

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
            title: 'État de connexion invalide',
            subtitle: 'Votre état de connexion a été invalidée. Veuillez vous reconnecter.'
        })
        loginInfo.set({})
        userInfo.set({})

        replace('/login')

        return false
    }

    return true
}

export const httpGet = async (url, checkSession = true) => {
    if (checkSession && await !hasValidSession()) {
        return { data: null, sessionError: true, returnedJson: false }
    }

    const { data } = await axios.get(VITE_API_URL + url)

    return { data, sessionError: false, returnedJson: typeof data === 'object' }
}

export const httpPost = async (url, body = {}, checkSession = true) => {
    if (checkSession && await !hasValidSession()) {
        return { data: null, sessionError: true, returnedJson: false }
    }

    const { data } = await axios.post(VITE_API_URL + url, stringify(body), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    })

    return { data, sessionError: false, returnedJson: typeof data === 'object' }
}

export const httpPostFormData = async (url, body = {}, checkSession = true) => {
    if (checkSession && await !hasValidSession()) {
        return { data: null, sessionError: true, returnedJson: false }
    }

    const form = new FormData()

    for (const [key, value] of Object.entries(body)) {
        form.append(key, value)
    }

    const { data } = await axios.post(VITE_API_URL + url, form, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })

    return { data, sessionError: false, returnedJson: typeof data === 'object' }
}