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
    import PlayIcon from 'carbon-icons-svelte/lib/Play.svelte'
    import StopIcon from 'carbon-icons-svelte/lib/Stop.svelte'

    import Base from '../components/Base.svelte'

    import 'dayjs/locale/fr'
    import axios from 'axios'
    import dayjs from 'dayjs'
    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { stringify } from 'query-string'
    import { userInfo } from '../stores'

    const { VITE_API_URL } = import.meta.env

    let sessions = []

    const statusTooltips = {
        sessionStart: { icon: PlayIcon, text: 'Début d\'une session', color: 'green' },
        sessionEnd: { icon: StopIcon, text: 'Fin d\'une session', color: 'red' },
        comment: { icon: ChatIcon, text: 'Commentaire', color: 'blue' },
        file: { icon: AttachmentIcon, text: 'Fichier', color: 'gray' }
    }

    onMount(async () => {
        await getSessions()
        await getComments()
        await getFiles()

        for (const session of sessions) {
            session.comments.sort((a, b) => b.timestamp - a.timestamp)
        }

        sessions = sessions
    })

    async function getSessions() {
        const req = await axios.get(`${VITE_API_URL}/getSessionsTravail.php?devId=${get(userInfo).id}`)

        for (const session of req.data) {
            sessions = [...sessions, {
                id: parseInt(session.Id),
                timestampStart: new Date(session.Debut).valueOf(),
                timestampEnd: new Date(session.Fin).valueOf(),
                task: {
                    id: parseInt(session.TacheId),
                    number: session.TacheNumero
                },
                comments: []
            }]
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
            const session = sessions.find(s => s.id === parseInt(comment.Session_Id))

            session.comments = [...session.comments, {
                type: 'comment',
                id: parseInt(comment.Id),
                timestamp: new Date(comment.Horodateur).valueOf(),
                content: comment.Contenu
            }]
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
            const timestamp = new Date(file.DateTele).valueOf()
            const session = sessions.find(s => s.timestampStart <= timestamp && s.timestampEnd >= timestamp)

            session.comments = [...session.comments, {
                type: 'file',
                id: parseInt(file.Id),
                timestamp,
                filename: file.NomFichier,
                mimeType: file.Extension
            }]
        }
    }

    function calculateDuration(timestampStart, timestampEnd) {
        const fullSeconds = dayjs(timestampEnd).diff(dayjs(timestampStart), 'second')

        const hours = Math.floor(fullSeconds / 3600)
        const minutes = Math.floor(fullSeconds % 3600 / 60)
        const seconds = Math.floor(fullSeconds % 60)

        const hDisplay = hours > 0 ? hours + 'h ' : ''
        const mDisplay = minutes > 0 ? minutes + 'm ' : ''
        
        return `${hDisplay}${mDisplay}${seconds}s`
    }
</script>

<Base>
    <h1>Journal</h1>

    <h2>Sessions précédentes</h2>
    <Accordion align="start">
        {#each sessions as session}
            <AccordionItem>
                <svelte:fragment slot="title">
                    <Grid narrow>
                        <Row>
                            <Column>
                                <h6>№ tâche</h6>
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
                                    {session.comments.filter(c => c.type === 'comment').length} •
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
</Base>

<style>
    h2 {
        margin-bottom: 24px;
    }

    .comment-icons {
        vertical-align: middle;
    }

    :global(.bx--tag) {
        cursor: pointer;
    }
</style>