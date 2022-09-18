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
    import { loginInfo, userInfo } from '../stores'

    const { VITE_API_URL } = import.meta.env

    let _currentSession = null
    let _pastSessions = []
    let currentSession = null
    let pastSessions = []
    let expandedSessions = {}

    const updateJournal = async () => {
        _currentSession = null
        _pastSessions = []

        await getSessions()
        await getComments()
        await getFiles()

        // @ts-ignore
        _currentSession?.comments.sort((a, b) => b.timestamp - a.timestamp)

        for (const session of _pastSessions) {
            session.comments.sort((a, b) => b.timestamp - a.timestamp)
        }

        currentSession = _currentSession
        pastSessions = _pastSessions

        console.log(currentSession)
        console.log(pastSessions)
    }

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
                _currentSession = newSession

                continue;
            }

            _pastSessions = [..._pastSessions, newSession]
        }
    }

    const getComments = async () => {
        const req = await axios.post(`${VITE_API_URL}/getCommentaires.php?devId=${get(userInfo).id}`, stringify({
            acces: get(loginInfo).token
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

            if (sessionId === _currentSession?.id) {
                _currentSession.comments = [..._currentSession.comments, newComment]

                continue;
            }

            const session = _pastSessions.find(s => s.id === sessionId)

            session.comments = [...session.comments, newComment]
        }
    }

    const getFiles = async () => {
        const req = await axios.post(`${VITE_API_URL}/getTeleversements.php?devId=${get(userInfo).id}`, stringify({
            acces: get(loginInfo).token
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

            if (newFile.timestamp >= _currentSession?.timestampStart) {
                _currentSession.comments = [..._currentSession.comments, newFile]

                continue;
            }

            const session = _pastSessions.find(s => s.timestampStart <= newFile.timestamp && s.timestampEnd >= newFile.timestamp)

            session.comments = [...session.comments, newFile]
        }
    }

    onMount(updateJournal)
</script>

<Base>
    <h1>Journal</h1>

    <h2>Session active</h2>

    {#if currentSession}
        <div class="current-session">
            <CurrentSession session={currentSession} on:updatejournal={updateJournal} />
        </div>
        
    {:else}
        <div class="no-active-session-info">
            <InlineNotification
                lowContrast
                hideCloseButton
                kind="info"
                title="Vous n'avez pas de session active."
            >
                <svelte:fragment slot="subtitle">
                    Consultez vos <a href="#/tasks">tâches</a> pour démarrer une session.
                </svelte:fragment>
            </InlineNotification>
        </div>
    {/if}

    {#if pastSessions.length > 0}
        <h2>Sessions précédentes</h2>
        <Accordion align="start">
            {#each pastSessions as session}
                <AccordionItem iconDescription="" bind:open={expandedSessions[session.id]}>
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