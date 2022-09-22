<script>
    import { onMount } from 'svelte'
    import { loadUserInfo } from './util/userInfoLoader'

    import './util/httpRequest'

    let ready = false

    onMount(async () => {
        await loadUserInfo()
        ready = true
    })

    import Router, { location, replace } from 'svelte-spa-router'
    import routes from './routes'

    import Navigation from './components/Navigation.svelte'

    const conditionsFailed = () => {
        replace('/')
    }
</script>

{#if ready}
    {#if $location !== "/login"}
        <Navigation />
    {/if}

    <Router {routes} on:conditionsFailed={conditionsFailed} />
{/if}

