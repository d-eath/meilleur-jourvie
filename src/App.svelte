<script>
    import Router, { location, replace } from 'svelte-spa-router'
    import routes from "./routes";

    import Navigation from './components/Navigation.svelte'

    function conditionsFailed() {
        replace('/')
    }
</script>

{#if $location !== "/login"}
    <Navigation />
{/if}

<Router {routes} on:conditionsFailed={conditionsFailed} />
