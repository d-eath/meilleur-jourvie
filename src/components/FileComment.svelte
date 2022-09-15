<script>
    import { Button } from 'carbon-components-svelte'

    import AttachmentIcon from 'carbon-icons-svelte/lib/Attachment.svelte'

    const { VITE_FILE_URL } = import.meta.env

    import ImageView from './ImageView.svelte'

    export let comment

    let showImageView = false

    const src = `${VITE_FILE_URL}/${comment.filename}`
    
    const isImage = () => comment.mimeType.startsWith('image/')
</script>

<p>
    {#if isImage()}
        <img src={src} alt="" on:click={() => showImageView = true} />
    {:else}
        <Button kind="ghost" on:click={() => window.open(src, '_blank')}>
            <AttachmentIcon /> <div class="filename">{comment.filename}</div>
        </Button>
    {/if}
</p>
    
{#if isImage() && showImageView}
    <ImageView src={src} on:close={() => showImageView = false} />
{/if}

<style>
    img {
        max-width: 500px;
        max-height: 500px;
        cursor: pointer;
    }

    .filename {
        margin-left: 8px;
    }

    /* a {
        text-decoration: none;
    } */
</style>