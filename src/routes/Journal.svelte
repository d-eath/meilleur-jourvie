<script>
    import {
        Accordion,
        AccordionItem,
        Column,
        Grid,
        Row,
        Tag,
    } from 'carbon-components-svelte'

    import ChatIcon from 'carbon-icons-svelte/lib/Chat.svelte'
    import AttachmentIcon from 'carbon-icons-svelte/lib/Attachment.svelte'

    import Base from '../components/Base.svelte'

    import 'dayjs/locale/fr'
    import axios from 'axios'
    import dayjs from 'dayjs'
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

    function calculateDuration(timestampStart, timestampEnd) {
        const fullSeconds = dayjs(timestampEnd).diff(dayjs(timestampStart), 'second')

        const hours = Math.floor(fullSeconds / 3600)
        const minutes = Math.floor(fullSeconds % 3600 / 60)
        const seconds = fullSeconds % 60

        let result = ''

        if (hours > 0) {
            result += hours + 'h '
        }

        if (minutes > 0) {
            result += minutes + 'm '
        }

        result += seconds + 's'
        
        return result
    }

    function calculateCommentsPerHour(session) {
        const comments = session.comments.filter(c => c.type === 'comment').length 
        const hours = dayjs(session.timestampEnd).diff(dayjs(session.timestampStart), 'hour', true)

        if (hours === 0) {
            return 0
        }

        return (comments / hours).toFixed(1).replace('.', ',')
    }
</script>

<Base>
    <h1>Journal</h1>

    {#if pastSessions.length > 0}
        <h2>Sessions précédentes</h2>
        <Accordion align="start">
            {#each pastSessions as session}
                <AccordionItem>
                    <svelte:fragment slot="title">
                        <Grid narrow>
                            <Row>
                                <Column>
                                    <h6>Tâche</h6>
                                </Column>
                                <Column>
                                    <h6>Date de début</h6>
                                </Column>
                                <Column>
                                    <h6>Intervalle d'heure</h6>
                                </Column>
                                <Column>
                                    <h6>Durée</h6>
                                </Column>
                                <Column>
                                    <h6>Commentaires</h6>
                                </Column>
                            </Row>
                            <Row>
                                <Column>
                                    <Tag type="blue" size="sm">{session.task.number}</Tag>
                                </Column>
                                <Column>
                                    <span>
                                        {dayjs(session.timestampStart).locale('fr').format('dddd D MMMM YYYY')}
                                    </span>
                                </Column>
                                <Column>
                                    <span>
                                        {dayjs(session.timestampStart).locale('fr').format('HH:mm')} -
                                        {dayjs(session.timestampEnd).locale('fr').format('HH:mm')}
                                    </span>
                                </Column>
                                <Column>
                                    <span>
                                        {calculateDuration(session.timestampStart, session.timestampEnd)}
                                    </span>
                                </Column>
                                <Column>
                                    <span>
                                        <span class="comment-icons"><ChatIcon /></span>
                                        {session.comments.filter(c => c.type === 'comment').length}
                                        <span class="comment-ratio">({calculateCommentsPerHour(session)}/h)</span> •
                                        <span class="comment-icons"><AttachmentIcon /></span>
                                        {session.comments.filter(c => c.type === 'file').length}
                                    </span>
                                </Column>
                            </Row>
                        </Grid>
                    </svelte:fragment>
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

    .comment-icons {
        vertical-align: middle;
    }

    .comment-ratio {
        color: #666;
    }

    :global(.bx--tag) {
        cursor: pointer;
    }
</style>