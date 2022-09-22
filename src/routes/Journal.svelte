<script>
    import { Accordion, AccordionItem, InlineNotification, Loading } from 'carbon-components-svelte'

    import Base from '../components/Base.svelte'
    import CurrentSession from '../components/CurrentSession.svelte'
    import JournalComments from '../components/JournalComments.svelte'
    import PastSessionSummary from '../components/PastSessionSummary.svelte'

    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { loginInfo, userInfo } from '../stores'
    import { httpGet, httpPost } from '../util/httpRequest'

    let _currentSession = null
    let _pastSessions = []
    let currentSession = null
    let pastSessions = []
    let isLoaded = false
    const expandedSessions = {}

    const updateJournal = async () => {
        _currentSession = null
        _pastSessions = []

        if (!await getSessions()) {
            return
        }

        if (!await getComments() || !await getFiles()) {
            return
        }

        // @ts-ignore
        _currentSession?.comments.sort((a, b) => b.timestamp - a.timestamp)

        for (const session of _pastSessions) {
            session.comments.sort((a, b) => b.timestamp - a.timestamp)
        }

        currentSession = _currentSession
        pastSessions = _pastSessions

        isLoaded = true
    }

    const getSessions = async () => {
        const req = await httpGet(`/getSessionsTravail.php?devId=${get(userInfo).id}`)

        if (req.sessionError) {
            return false
        }

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

                continue
            }

            _pastSessions = [..._pastSessions, newSession]
        }

        return true
    }

    const getComments = async () => {
        const req = await httpPost(`/getCommentaires.php?devId=${get(userInfo).id}`, {
            acces: get(loginInfo).token
        })

        if (req.sessionError) {
            return false
        }

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

                continue
            }

            const session = _pastSessions.find(s => s.id === sessionId)

            session.comments = [...session.comments, newComment]
        }

        return true
    }

    const getFiles = async () => {
        const req = await httpPost(`/getTeleversements.php?devId=${get(userInfo).id}`, {
            acces: get(loginInfo).token
        })

        if (req.sessionError) {
            return false
        }

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

                continue
            }

            const session = _pastSessions.find(s => s.timestampStart <= newFile.timestamp && s.timestampEnd >= newFile.timestamp)

            session.comments = [...session.comments, newFile]
        }

        return true
    }

    onMount(updateJournal)
</script>

<Base>
    <h1>Journal</h1>

    {#if isLoaded}
        <h2>Session en cours</h2>

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
    {:else}
        <Loading />
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