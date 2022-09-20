import axios from 'axios'
import { replace } from 'svelte-spa-router'
import { loginInfo, userInfo } from '../stores'
import { get } from 'svelte/store'
import { stringify } from 'query-string'

const { VITE_API_URL } = import.meta.env

export const loadUserInfo = async (returnMode = false) => {
    const id = get(loginInfo)?.id
    const projectId = get(loginInfo)?.projectId
    const token = get(loginInfo)?.token

    if (id && !get(userInfo)?.id) {
        const req = await axios.post(`${VITE_API_URL}/getDevStats.php?projetId=${projectId}`, stringify({
            devId: id,
            acces: token
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
        })

        // if the api returns a string (even though it should return a json object,
        // because content-type is application/json), then it means the request failed
        // what the fuck martel?
        if (typeof req.data !== 'object') {
            loginInfo.set({})
            userInfo.set({})

            if (!returnMode) {
                replace('/')
            }
            
            return false
        }

        const user = req.data.find(u => parseInt(u.Id) === id)
        const sessionsReq = await axios.get(`${VITE_API_URL}/getSessionsTravail.php?devId=${id}`)
        const currentSession = sessionsReq.data.find(s => s.Fin === null)

        userInfo.set({
            id: id,
            lastName: user.Nom,
            firstName: user.Prenom,
            isCoordinator: user.EstCoordo === '1',
            projectId: parseInt(user.ProjetAssigne_Id),
            sessionId: currentSession?.Id || null
        })

        return true
    }
}