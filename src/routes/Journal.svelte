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

    const statusTooltips = {
        sessionStart: { icon: PlayIcon, text: 'Début d\'une session', color: 'green' },
        sessionEnd: { icon: StopIcon, text: 'Fin d\'une session', color: 'red' },
        comment: { icon: ChatIcon, text: 'Commentaire', color: 'blue' },
        file: { icon: AttachmentIcon, text: 'Fichier', color: 'gray' }
    }

    let entries = []

    onMount(async () => {
        await getSessions()
        await getComments()

        entries.sort((x, y) => y.timestamp - x.timestamp)
        entries = entries
    })

    async function getSessions() {
        const req = await axios.get(`${VITE_API_URL}/getSessionsTravail.php?devId=${get(userInfo).userId}`)

        for (const session of req.data) {
            entries = [...entries, {
                type: 'sessionStart',
                id: session.Id,
                timestamp: new Date(session.Debut).valueOf(),
                task: {
                    id: session.TacheId,
                    number: session.TacheNumero
                }
            }]

            entries = [...entries, {
                type: 'sessionEnd',
                id: session.Id,
                timestamp: new Date(session.Fin).valueOf(),
                task: {
                    id: session.TacheId,
                    number: session.TacheNumero
                }
            }]
        }
    }

    async function getComments() {
        const commentsReq = await axios.post(`${VITE_API_URL}/getCommentaires.php?devId=${get(userInfo).userId}`, stringify({
            acces: get(userInfo).loginToken,
        }, { encode: true }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        })

        for (const comment of commentsReq.data) {

            entries = [...entries, {
                type: 'comment',
                id: comment.Id,
                timestamp: new Date(comment.Horodateur).valueOf(),
                sessionId: comment.Session_Id,
                content: comment.Contenu
            }]
        }

        const filesReq = await axios.post(`${VITE_API_URL}/getTeleversements.php?devId=${get(userInfo).userId}`, stringify({
            acces: get(userInfo).loginToken,
        }, { encode: true }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        })

        for (const file of filesReq.data) {
            entries = [...entries, {
                type: 'file',
                id: file.Id,
                timestamp: new Date(file.DateTele).valueOf(),
                filename: file.NomFichier,
                extension: file.Extension
            }]
        }
    }
</script>

<Base>
    <h1>Journal</h1>
    <StructuredList condensed flush>
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
    </StructuredList>
</Base>