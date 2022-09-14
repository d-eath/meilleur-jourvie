<script>
    import { Accordion, AccordionItem } from 'carbon-components-svelte'

    import Base from '../components/Base.svelte'
    import PastSessionSummary from '../components/PastSessionSummary.svelte'

    import axios from 'axios'
    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { stringify } from 'query-string'
    import { userInfo } from '../stores'

    const { VITE_API_URL } = import.meta.env

    let currentSession = null
    let pastSessions = []

    onMount(async () => {
        await getSessions()
        await getComments()
        await getFiles()

        currentSession?.comments.sort((a, b) => b.timestamp - a.timestamp)

        for (const session of pastSessions) {
            session.comments.sort((a, b) => b.timestamp - a.timestamp)
        }

        currentSession = currentSession
        pastSessions = pastSessions
    })

    async function getSessions() {
        const req = await axios.get(`${VITE_API_URL}/getSessionsTravail.php?devId=${get(userInfo).id}`)

        for (const session of req.data) {
            const newSession = {
                id: parseInt(session.Id),
                timestampStart: new Date(session.Debut).valueOf(),
                timestampEnd: session.Fin ? new Date(session.Fin).valueOf() : null,
                task: {
                    id: parseInt(session.TacheId),
                    number: session.TacheNumero
                },
                comments: []
            }

            if (newSession.timestampEnd === null) {
                currentSession = newSession

                continue;
            }

            pastSessions = [...pastSessions, newSession]
        }
    }

    async function getComments() {
        const req = await axios.post(`${VITE_API_URL}/getCommentaires.php?devId=${get(userInfo).id}`, stringify({
            acces: get(userInfo).loginToken
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
        })

        for (const comment of req.data) {
            const sessionId = parseInt(comment.Session_Id)
            const newComment = {
                type: 'comment',
                id: parseInt(comment.Id),
                timestamp: new Date(comment.Horodateur).valueOf(),
                content: comment.Contenu
            }

            if (sessionId === currentSession?.id) {
                currentSession.comments = [...currentSession.comments, newComment]

                continue;
            }

            const session = pastSessions.find(s => s.id === sessionId)

            session.comments = [...session.comments, newComment]
        }
    }

    async function getFiles() {
        const req = await axios.post(`${VITE_API_URL}/getTeleversements.php?devId=${get(userInfo).id}`, stringify({
            acces: get(userInfo).loginToken
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
        })

        for (const file of req.data) {
            const newFile = {
                type: 'file',
                id: parseInt(file.Id),
                timestamp: new Date(file.DateTele).valueOf(),
                filename: file.NomFichier,
                mimeType: file.Extension
            }

            if (newFile.timestamp >= currentSession?.timestampStart) {
                currentSession.comments = [...currentSession.comments, newFile]

                continue;
            }

            const session = pastSessions.find(s => s.timestampStart <= newFile.timestamp && s.timestampEnd >= newFile.timestamp)

            session.comments = [...session.comments, newFile]
        }
    }
</script>

<Base>
    <h1>Journal</h1>

    {#if pastSessions.length > 0}
        <h2>Sessions précédentes</h2>
        <Accordion align="start">
            {#each pastSessions as session}
                <AccordionItem>
                    <PastSessionSummary session={session} slot="title" />

                    {#each session.comments as comment}
                        <div>{comment.content}</div>
                    {/each}
                </AccordionItem>
            {/each}
        </Accordion>
    {/if}
</Base>

<style>
    h2 {
        margin-bottom: 24px;
    }
</style>