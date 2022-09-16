<script>
    import { Button, Column, Grid, Row, Tag, TextArea, Tile } from 'carbon-components-svelte'

    import ChatIcon from 'carbon-icons-svelte/lib/Chat.svelte'
    import AttachmentIcon from 'carbon-icons-svelte/lib/Attachment.svelte'
    import StopIcon from 'carbon-icons-svelte/lib/Stop.svelte'

    import JournalComments from '../components/JournalComments.svelte'

    import axios from 'axios'
    import 'dayjs/locale/fr'
    import dayjs from 'dayjs'
    import { createEventDispatcher } from 'svelte'
    import { get } from 'svelte/store'
    import { stringify } from 'query-string'
    import { userInfo } from '../stores'

    const dispatch = createEventDispatcher()

    let secondsElapsed = 0
    let timeElapsed
    let commentsPerHour

    const { VITE_API_URL } = import.meta.env

    setInterval(() => {
        secondsElapsed = dayjs().diff(dayjs(session.timestampStart), 'second')
    }, 500)

    $: {
        const hours = Math.floor(secondsElapsed / 3600)
        const minutes = Math.floor(secondsElapsed % 3600 / 60)
        const seconds = secondsElapsed % 60

        let result = ''

        if (hours > 0) {
            result += hours + 'h '
        }

        if (minutes > 0) {
            result += minutes + 'm '
        }

        result += seconds + 's'

        timeElapsed = result
    }

    $: {
        const comments = session.comments.filter(c => c.type === 'comment').length 
        const hours = dayjs().diff(dayjs(session.timestampStart), 'hour', true)

        if (hours === 0) {
            commentsPerHour = 0
        } else {
            commentsPerHour = (comments / hours).toFixed(1).replace('.', ',')
        }
    }

    const stopSession = async () => {
        const req = await axios.post(`${VITE_API_URL}/putSessionTravail.php?sessionTravailId=${session.id}`, stringify({
            devId: get(userInfo).id,
            acces: get(userInfo).loginToken
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
        })
        
        dispatch('updatejournal')
    }

    export let session
</script>

<div class="session-stop">
    <Button kind="danger" icon={StopIcon} on:click={stopSession}>Arrêter la session</Button>
</div>

<Tile light>
    <Grid narrow>
        <Row>
            <Column>
                <h6>Tâche</h6>
            </Column>
            <Column>
                <h6>Date et heure de début</h6>
            </Column>
            <Column>
                <h6>Temps écoulé</h6>
            </Column>
            <Column>
                <h6>Commentaires</h6>
            </Column>
        </Row>
        <Row>
            <Column>
                <Tag type="green" size="sm">{session.task.number}</Tag>
            </Column>
            <Column>
                <span class="session-data">
                    {dayjs(session.timestampStart).locale('fr').format('dddd D MMMM YYYY à HH:mm')}
                </span>
            </Column>
            <Column>
                <span class="session-data">
                    {timeElapsed}
                </span>
            </Column>
            <Column>
                <span class="session-data">
                    <span class="comment-icons"><ChatIcon /></span>
                    {session.comments.filter(c => c.type === 'comment').length}
                    <span class="comment-ratio">({commentsPerHour}/h)</span> •
                    <span class="comment-icons"><AttachmentIcon /></span>
                    {session.comments.filter(c => c.type === 'file').length}
                </span>
            </Column>
        </Row>
        <Row>
            <Column sm={{ span: 4, offset: 0 }}>
                <Tile light>
                    <div class="session-actions">
                        <div class="comment-box">
                            <TextArea maxCount={500} placeholder="Écrivez votre commentaire..." />
                        </div>
                        <div class="comment-buttons">
                            <Button icon={ChatIcon}>Commenter</Button>
                            <Button kind="tertiary" iconDescription="Joindre un fichier" icon={AttachmentIcon} />
                        </div>
                    </div>
                </Tile>
            </Column>
        </Row>
        <Row>
            <Column sm={{ span: 4, offset: 0 }}>
                <div class="comments-section">
                    <JournalComments comments={session.comments} />
                </div>
            </Column>
        </Row>
    </Grid>
</Tile>

<style>
    .comment-icons {
        vertical-align: middle;
    }

    .comment-ratio {
        color: #666;
    }

    .comment-box {
        width: 500px;
    }

    .comment-buttons {
        margin-top: 4px;
    }

    .session-actions {
        margin-top: 24px;
    }

    .session-stop {
        margin-bottom: 24px;
    }

    .session-data {
        vertical-align: bottom;
        line-height: normal;
    }
</style>