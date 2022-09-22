import { replace } from 'svelte-spa-router'
import { loginInfo, userInfo } from '../stores'
import { get } from 'svelte/store'
import { httpGet, httpPost } from './httpRequest'

export const loadUserInfo = async (username, noRedirect = false) => {
    const id = get(loginInfo)?.id
    const projectId = get(loginInfo)?.projectId
    const token = get(loginInfo)?.token

    if (id && !get(userInfo)?.id) {
        const req = await httpPost(`/getDevStats.php?projetId=${projectId}`, {
            devId: id,
            acces: token
        })

        if (!req.returnedJson) {
            return false
        }

        const user = req.data.find(u => parseInt(u.Id) === id)
        const sessionsReq = await httpGet(`/getSessionsTravail.php?devId=${id}`)
        const currentSession = sessionsReq.data.find(s => s.Fin === null)

        if (username && user.Matricule !== username) {
            loginInfo.set({})
            userInfo.set({})

            if (!noRedirect) {
                replace('/')
            }
            
            return false
        }

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