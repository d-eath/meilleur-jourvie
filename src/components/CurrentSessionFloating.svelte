<script>
    import { Button, Tag, Tooltip } from 'carbon-components-svelte'

    import StopIcon from 'carbon-icons-svelte/lib/Stop.svelte'
    import TaskAssetViewIcon from 'carbon-icons-svelte/lib/TaskAssetView.svelte'

    import dayjs from 'dayjs'
    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { currentSession, loginInfo } from '../stores'
    import { setCurrentSession } from '../util/currentSessionSetter'
    import { calculateSecondsDuration } from '../util/durationCalculator'
    import { httpPost } from '../util/httpRequest'

    let timestampStart
    let secondsElapsed
    let timeElapsed

    currentSession.subscribe(session => {
        if (session) {
            timestampStart = session.session.timestampStart
        }
    })

    const updateLiveStats = () => {
        secondsElapsed = dayjs().diff(dayjs.unix(timestampStart), 'second')
        timeElapsed = calculateSecondsDuration(secondsElapsed)
    }

    const endSession = async () => {
        await httpPost(`/putSessionTravail.php?sessionTravailId=${get(currentSession).session.id}`, {
            devId: get(loginInfo).id,
            acces: get(loginInfo).token
        })

        setCurrentSession(null)
    }

    setInterval(updateLiveStats, 500)
    onMount(updateLiveStats)
</script>

{#if $currentSession}
    <div class="outer">
        <Tooltip direction="top" align="end">
            <Button size="xl" slot="icon" kind="secondary" icon={TaskAssetViewIcon} tooltipPosition="left" />
            <h4>Session en cours</h4>
            <h5>Tâche <Tag type="purple" size="sm">{$currentSession.task.number}</Tag></h5>
            <p>{$currentSession.task.title}</p>
            <h5>Temps écoulé</h5>
            <p class="last-item">{timeElapsed}</p>
            <Button size="small" kind="danger" icon={StopIcon} on:click={endSession}>Terminer la session</Button>
        </Tooltip>
    </div>
{/if}

<style>
    .outer {
        position: fixed;
        bottom: 36px;
        right: 36px;
        z-index: 69420;
        animation: pulse 2s infinite;
    }

    .outer :global(.bx--btn-secondary), .outer :global(.bx--tooltip__trigger) {
        color: white;
        background-color: rgba(59, 165, 93);
        margin: 0;
    }

    .outer :global(.bx--assistive-text), .outer :global(.bx--btn::before) {
        display: none !important;
    }

    .outer :global(.bx--tooltip) {
        max-width: 250px;
        width: 250px;
    }

    .outer :global(.bx--tooltip) :global(.bx--btn) {
        padding-right: 50px;
    }

    p {
        margin-bottom: 12px;
    }
    
    h4 {
        margin-bottom: 12px;
    }

    h5 {
        vertical-align: middle;
    }

    h5 :global(.bx--tag) {
        vertical-align: middle;
        margin-top: -0.05em;
        
    }

    .last-item {
        margin-bottom: 24px;
    }

    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(59, 165, 93, 0.7);
        }
        50% {
            box-shadow: 0 0 0 16px rgba(59, 165, 93, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(59, 165, 93, 0);
        }
    }
</style>