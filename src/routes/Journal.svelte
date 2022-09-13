<script>
    import {
        StructuredList,
        StructuredListBody,
        StructuredListCell,
        StructuredListHead,
        StructuredListRow,
        TooltipIcon,
    } from 'carbon-components-svelte'

    import ChatIcon from 'carbon-icons-svelte/lib/Chat.svelte'
    import AttachmentIcon from 'carbon-icons-svelte/lib/Attachment.svelte'
    import PlayIcon from 'carbon-icons-svelte/lib/Play.svelte'
    import StopIcon from 'carbon-icons-svelte/lib/Stop.svelte'

    import Base from '../components/Base.svelte'

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
            session.comments = session.comments
        }

        console.log(sessions)
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
</script>

<Base>
    <h1>Journal</h1>


    <!-- <StructuredList condensed flush>
        <StructuredListHead>
            <StructuredListRow head>
                <StructuredListCell head>Date</StructuredListCell>
                <StructuredListCell head>Statut</StructuredListCell>
                <StructuredListCell head>Tâche</StructuredListCell>
                <StructuredListCell head>Commentaires</StructuredListCell>
            </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
            {#each entries as entry}
                <StructuredListRow>
                    <StructuredListCell>{dayjs(entry.timestamp).format('YYYY-MM-DD HH:mm:ss')}</StructuredListCell>
                    <StructuredListCell>
                        <TooltipIcon tooltipText={statusTooltips[entry.type].text}>
                            <svelte:component this={statusTooltips[entry.type].icon} fill="red" />
                        </TooltipIcon>
                    </StructuredListCell>
                    <StructuredListCell>
                        {#if entry.task}
                            {entry.task.number}
                        {:else}
                            -
                        {/if}
                    </StructuredListCell>
                    <StructuredListCell>
                        {entry.content}
                    </StructuredListCell>
                </StructuredListRow>
            {/each}
        </StructuredListBody>
    </StructuredList> -->
</Base>