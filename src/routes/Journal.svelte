<script>
    import { Accordion, AccordionItem, InlineNotification } from 'carbon-components-svelte'

    import Base from '../components/Base.svelte'
    import CurrentSession from '../components/CurrentSession.svelte'
    import JournalComments from '../components/JournalComments.svelte'
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

        // TEST
        currentSession = pastSessions[0]
    })

    const getSessions = async () => {
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

    const getComments = async () => {
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

    const getFiles = async () => {
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

    <h2>Session active</h2>

    {#if currentSession}
        <div class="current-session">
            <CurrentSession session={currentSession} />
        </div>
        
    {:else}
        <div class="no-active-session-info">
            <InlineNotification
                lowContrast
                hideCloseButton
                kind="info"
                title="Vous n'avez pas de session active."
                subtitle="Consultez vos tâches pour démarrer une session."
            />
        </div>
    {/if}

    {#if pastSessions.length > 0}
        <h2>Sessions précédentes</h2>
        <Accordion align="start">
            {#each pastSessions as session}
                <AccordionItem>
                    <PastSessionSummary session={session} slot="title" />
                    <JournalComments comments={session.comments} />
                </AccordionItem>
            {/each}
        </Accordion>
    {/if}
</Base>

<style>
    h1 {
        margin-bottom: 32px;
    }

    h2 {
        margin-top: 24px;
        margin-bottom: 24px;
    }

    .no-active-session-info :global(.bx--inline-notification) {
        max-width: 100%;
    }

    .current-session {
        margin-bottom: 72px;
    }

    :global(.bx--accordion__content) {
        padding-right: 16px;
    }
</style>