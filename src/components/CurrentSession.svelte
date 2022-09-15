<script>
    import { Column, Grid, Row, Tag, Tile } from 'carbon-components-svelte'

    import ChatIcon from 'carbon-icons-svelte/lib/Chat.svelte'
    import AttachmentIcon from 'carbon-icons-svelte/lib/Attachment.svelte'

    import JournalComments from '../components/JournalComments.svelte'

    import 'dayjs/locale/fr'
    import dayjs from 'dayjs'

    let secondsElapsed = 0
    let timeElapsed
    let commentsPerHour

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

    export let session
</script>

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
            <div class="comments-section">
                <Column sm={{ span: 4, offset: 0 }}>
                    <JournalComments comments={session.comments} />
                </Column>
            </div>
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

    .session-data {
        vertical-align: bottom;
        line-height: normal;
    }
</style>