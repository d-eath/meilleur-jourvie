<script>
    import {
        StructuredList,
        StructuredListBody,
        StructuredListCell,
        StructuredListRow,
    } from 'carbon-components-svelte'

    import TaskAssetViewIcon from 'carbon-icons-svelte/lib/TaskAssetView.svelte'
    import ChatIcon from 'carbon-icons-svelte/lib/Chat.svelte'
    import AttachmentIcon from 'carbon-icons-svelte/lib/Attachment.svelte'

    import dayjs from 'dayjs'
    import { calculateSecondsDuration } from '../util/durationCalculator'

    const sumSeconds = () => {
        let seconds = 0

        sessions.forEach(s => {
            seconds += dayjs.unix(s.end).diff(dayjs.unix(s.start), 'second')
        })

        return seconds
    }

    const sumNetSeconds = () => {
        let netSeconds = 0

        sessions.forEach(s => {
            const seconds = dayjs.unix(s.end).diff(dayjs.unix(s.start), 'second')
            const sessionComments = comments.filter(c => c >= s.start && c <= s.end).length
            
            netSeconds += seconds * calculateCoefficient(seconds, sessionComments)
        })

        return Math.round(netSeconds)
    }

    const calculateCoefficient = (seconds, comments) => {
        const coefficient = comments / seconds / (5 / 9000)

        return coefficient > 1 ? 1 : coefficient
    }

    let totalDuration
    let netDuration

    $: sessionsCount = sessions.length
    $: commentsCount = comments.length
    $: uploadsCount = uploads.length

    $: {
        sessionsCount || commentsCount || uploadsCount
        totalDuration = calculateSecondsDuration(sumSeconds())
        netDuration = calculateSecondsDuration(sumNetSeconds())
    }

    export let sessions
    export let comments
    export let uploads
</script>

<div class="personal-stats">
    <StructuredList condensed>
        <StructuredListBody>
            <StructuredListRow>
                <StructuredListCell head>Nombre de sessions</StructuredListCell>
                <StructuredListCell><span class="icons"><TaskAssetViewIcon /></span> {sessionsCount}</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
                <StructuredListCell head>Dur??e totale des sessions</StructuredListCell>
                <StructuredListCell>{totalDuration}</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
                <StructuredListCell head>Dur??e ?? net ?? des sessions</StructuredListCell>
                <StructuredListCell>{netDuration}</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
                <StructuredListCell head>Nombre de commentaires</StructuredListCell>
                <StructuredListCell><span class="icons"><ChatIcon /></span> {commentsCount}</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
                <StructuredListCell head>Nombre de t??l??versements</StructuredListCell>
                <StructuredListCell><span class="icons"><AttachmentIcon /></span> {uploadsCount}</StructuredListCell>
            </StructuredListRow>
        </StructuredListBody>
    </StructuredList>
</div>

<style>
    .personal-stats :global(.bx--structured-list) {
        width: auto;
    }

    .personal-stats :global(.bx--structured-list-th),
    .personal-stats :global(.bx--structured-list-td) {
        padding-right: 32px;
    }

    .icons {
        vertical-align: middle;
        margin-right: 2px;
    }
</style>