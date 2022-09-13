<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    const close = () => dispatch('close');

    export let width;

    function handleKeydown(e) {
        if (e.key === 'Escape') {
            close()
        }
    }
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="background" on:click={close}></div>

<div class="modal" style="width: {width}px">
    <slot />
</div>

<style>
    .background {
        position: fixed;
        top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.3);
    }
    
    .modal {
        position: absolute;
		left: 50%;
		top: 50%;
        transform: translate(-50%, -50%);

		padding: 1em;
		background: white;

        width: 600px;
        max-width: 75rem;
    }
</style>