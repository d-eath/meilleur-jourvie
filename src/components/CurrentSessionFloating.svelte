<script>
    import { Button, Tag, Tooltip } from 'carbon-components-svelte'

    import PinIcon from 'carbon-icons-svelte/lib/Pin.svelte'
    import StopIcon from 'carbon-icons-svelte/lib/Stop.svelte'
</script>

<div class="outer">
    <Tooltip direction="top" align="end">
        <Button size="xl" slot="icon" kind="secondary" icon={PinIcon} iconDescription="penis" tooltipPosition="left" />
        <h4>Session en cours</h4>
        <h5>Tâche <Tag type="blue" size="sm">123456789012</Tag></h5>
        <p>12345678901234567890123456789012345</p>
        <h5>Temps écoulé</h5>
        <p class="last-item">1h 0m 0s</p>
        <Button size="small" kind="danger" icon={StopIcon}>Arrêter la session</Button>
    </Tooltip>
</div>

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

    .outer :global(.bx--btn-secondary:focus) {
        box-shadow: inset 0 0 0 1px rgba(59, 165, 93), inset 0 0 0 2px #f4f4f4;
        border-color: rgba(59, 165, 93);
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
            box-shadow: 0 0 0 10px rgba(59, 165, 93, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(59, 165, 93, 0);
        }
    }
</style>