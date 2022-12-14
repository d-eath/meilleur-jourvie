import dayjs from 'dayjs'
import { get } from 'svelte/store'
import { currentSession, userInfo } from '../stores'
import { httpGet } from './httpRequest'

export const setCurrentSession = async (sessionId) => {
    if (sessionId === null) {
        currentSession.set(null)

        return
    }

    const sessionReq = await httpGet(`/getUneSessionEnCours.php?sessionId=${sessionId}&devId=${get(userInfo)?.id}`)

    if (!sessionReq.returnedJson) {
        currentSession.set(null)

        return
    }

    const taskId = parseInt(sessionReq.data.TacheId)
    const taskReq = await httpGet(`/getUneTache.php?tacId=${taskId}`)

    currentSession.set({
        session: {
            id: parseInt(sessionReq.data.Id),
            timestampStart: dayjs(sessionReq.data.Debut).unix()
        },
        task: {
            id: taskId,
            number: sessionReq.data.TacheNumero,
            title: taskReq.data.Titre
        }
    })
}