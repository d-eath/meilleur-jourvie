<script>
    import { createEventDispatcher } from 'svelte'

    export let src
    export let alt = ''

    const dispatch = createEventDispatcher()
</script>

<div class="overlay">
    <div class="outer" on:click|self={() => dispatch('close')}>
        <img src="{src}" alt="{alt}">
        <a href="{src}" target="_blank">Ouvrir la source</a>
    </div>
</div>

<style>
    .overlay {
        position: fixed;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.69);
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
    }

    .outer {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    img {
        display: block;
        max-height: 75vh;
    }

    a {
        display: block;
        margin-top: 12px;
        text-decoration: none;
        font-weight: bold;
        color: #ccc;
    }

    a:hover {
        color: #eee;
    }
</style>