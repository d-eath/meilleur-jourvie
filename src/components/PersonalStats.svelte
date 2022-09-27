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

    import { calculateSecondsDuration } from '../util/durationCalculator'

    const sumSeconds = () => {
        let seconds = 0

        sessions.forEach(s => {
            seconds += s.end - s.start
        })

        return seconds
    }

    const sumNetSeconds = () => {
        let netSeconds = 0

        sessions.forEach(s => {
            const seconds = s.end - s.start
            const sessionComments = comments.filter(c => c >= s.start && c <= s.end).length
            
            netSeconds += seconds * calculateCoefficiency(seconds, sessionComments)
        })

        return netSeconds
    }

    const calculateCoefficiency = (seconds, comments) => {
        const coefficiency = comments / seconds / (5 / 9000)

        return coefficiency > 1 ? 1 : coefficiency
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
                <StructuredListCell head>Durée totale des sessions</StructuredListCell>
                <StructuredListCell>{totalDuration}</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
                <StructuredListCell head>Durée « net » des sessions</StructuredListCell>
                <StructuredListCell>{netDuration}</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
                <StructuredListCell head>Nombre de commentaires</StructuredListCell>
                <StructuredListCell><span class="icons"><ChatIcon /></span> {commentsCount}</StructuredListCell>
            </StructuredListRow>
            <StructuredListRow>
                <StructuredListCell head>Nombre de téléversements</StructuredListCell>
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