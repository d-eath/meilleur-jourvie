<script>
    import Router, { location } from "svelte-spa-router";
    import routes from "./routes";

    import Navigation from './components/Navigation.svelte'
</script>

{#if $location !== "/login"}
    <Navigation />
{/if}

<Router {routes} />
