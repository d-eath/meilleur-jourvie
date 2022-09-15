<script>
    import { Column, Grid, Row, Tag } from 'carbon-components-svelte'

    import ChatIcon from 'carbon-icons-svelte/lib/Chat.svelte'
    import AttachmentIcon from 'carbon-icons-svelte/lib/Attachment.svelte'

    import 'dayjs/locale/fr'
    import dayjs from 'dayjs'

    export let session

    const calculateCommentsPerHour = (session) => {
        const comments = session.comments.filter(c => c.type === 'comment').length 
        const hours = dayjs(session.timestampEnd).diff(dayjs(session.timestampStart), 'hour', true)

        if (hours === 0) {
            return 0
        }

        return (comments / hours).toFixed(1).replace('.', ',')
    }

    const calculateDuration = (timestampStart, timestampEnd) => {
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
</script>

<Grid narrow>
    <Row>
        <Column>
            <h6>Tâche</h6>
        </Column>
        <Column>
            <h6>Date de début</h6>
        </Column>
        <Column>
            <h6>Heure</h6>
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

<style>
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