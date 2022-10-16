<script>
    import { Column, Grid, Row, Tag } from 'carbon-components-svelte'

    import ChatIcon from 'carbon-icons-svelte/lib/Chat.svelte'
    import AttachmentIcon from 'carbon-icons-svelte/lib/Attachment.svelte'

    import 'dayjs/locale/fr'
    import dayjs from 'dayjs'
    import { calculateTimestampsDuration } from '../util/durationCalculator'

    export let session

    const calculateCommentsPerHour = (session) => {
        const comments = session.comments.filter(c => c.type === 'comment').length 
        const hours = dayjs.unix(session.timestampEnd).diff(dayjs.unix(session.timestampStart), 'hour', true)

        if (hours === 0) {
            return 0
        }

        return (comments / hours).toFixed(1).replace('.', ',')
    }

    const calculateCoefficient = (session) => {
        const seconds = dayjs.unix(session.timestampEnd).diff(dayjs.unix(session.timestampStart), 'second')
        const comments = session.comments.filter(c => c.type === 'comment').length

        let coefficient = comments / seconds / (5 / 9000)

        coefficient = coefficient > 1 ? 1 : coefficient

        return Math.round(coefficient * 100)
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
            <Tag type="purple" size="sm">{session.task.number}</Tag>
        </Column>
        <Column>
            <span>
                {dayjs.unix(session.timestampStart).locale('fr').format('dddd D MMMM YYYY')}
            </span>
        </Column>
        <Column>
            <span>
                {dayjs.unix(session.timestampStart).locale('fr').format('HH:mm')} -
                {dayjs.unix(session.timestampEnd).locale('fr').format('HH:mm')}
            </span>
        </Column>
        <Column>
            <span>
                {calculateTimestampsDuration(session.timestampStart, session.timestampEnd)}
                <span class="gray-stat">({calculateCoefficient(session)}%)</span>
            </span>
        </Column>
        <Column>
            <span>
                <span class="comment-icons"><ChatIcon /></span>
                {session.comments.filter(c => c.type === 'comment').length}
                <span class="gray-stat">({calculateCommentsPerHour(session)}/h)</span> •
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

    .gray-stat {
        color: #666;
    }
    
    :global(.bx--tag) {
        cursor: pointer;
    }
</style>