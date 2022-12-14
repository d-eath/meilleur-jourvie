<script>
    import { Accordion, AccordionItem, Button, InlineNotification, Loading } from 'carbon-components-svelte'

    import CollapseAllIcon from 'carbon-icons-svelte/lib/CollapseAll.svelte'
    import ExpandAllIcon from 'carbon-icons-svelte/lib/ExpandAll.svelte'

    import Base from '../components/Base.svelte'
    import CurrentSession from '../components/CurrentSession.svelte'
    import JournalComments from '../components/JournalComments.svelte'
    import PastSessionSummary from '../components/PastSessionSummary.svelte'

    import dayjs from 'dayjs'
    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { currentSession as storeCurrentSession, loginInfo, userInfo } from '../stores'
    import { httpGet, httpPost } from '../util/httpRequest'
    import { subscribeIgnoreFirst } from '../util/subscribeIgnoreFirst'

    let _currentSession = null
    let _pastSessions = []
    let currentSession = null
    let pastSessions = []
    let isLoaded = false
    let isUpdating = false
    const expandedSessions = {}

    $: allEntriesExpanded = !Object.values(expandedSessions).includes(false)

    const updateJournal = async () => {
        if (isUpdating) {
            return
        }

        isUpdating = true

        _currentSession = null
        _pastSessions = []

        if (!await getSessions()) {
            return
        }

        await Promise.all([getComments(), getFiles()])

        // @ts-ignore
        _currentSession?.comments.sort((a, b) => b.timestamp - a.timestamp)

        for (const session of _pastSessions) {
            session.comments.sort((a, b) => b.timestamp - a.timestamp)
        }

        currentSession = _currentSession
        pastSessions = _pastSessions

        for (const session of pastSessions) {
            if (!expandedSessions[session.id]) {
                expandedSessions[session.id] = false
            }
        }

        isLoaded = true
        isUpdating = false
    }

    const getSessions = async () => {
        const req = await httpGet(`/getSessionsTravail.php?devId=${get(userInfo).id}`)

        if (req.sessionError) {
            return false
        }

        for (const session of req.data) {
            const newSession = {
                id: parseInt(session.Id),
                timestampStart: dayjs(session.Debut).unix(),
                timestampEnd: session.Fin ? dayjs(session.Fin).unix() : null,
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
            const sessionId = parseInt(comment.SessionId)
            const newComment = {
                type: 'comment',
                id: parseInt(comment.Id),
                timestamp: dayjs(comment.Horodateur).unix(),
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
                timestamp: dayjs(file.DateTele).unix(),
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

    const toggleExpandCollapse = () => {
        const expand = !allEntriesExpanded

        for (const session in expandedSessions) {
            expandedSessions[session] = expand
        }
    }

    subscribeIgnoreFirst(storeCurrentSession, updateJournal)
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
                    title="Vous n'avez pas de session en cours."
                >
                    <svelte:fragment slot="subtitle">
                        Consultez vos <a href="#/tasks">t??ches</a> pour en d??marrer une.
                    </svelte:fragment>
                </InlineNotification>
            </div>
        {/if}

        {#if pastSessions.length > 0}
            <h2>Sessions pr??c??dentes</h2>
            <div class="expand-collapse-button">
                {#if allEntriesExpanded}
                    <Button kind="ghost" icon={CollapseAllIcon} on:click={toggleExpandCollapse}>R??duire tout</Button>
                {:else}
                    <Button kind="ghost" icon={ExpandAllIcon} on:click={toggleExpandCollapse}>D??velopper tout</Button>
                {/if} 
            </div> 
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

    .expand-collapse-button {
        margin-bottom: 1rem;
    }

    .current-session {
        margin-bottom: 72px;
    }

    :global(.bx--accordion__content) {
        padding-right: 16px;
    }
</style>