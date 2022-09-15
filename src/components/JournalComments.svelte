<script>
    import { Tile, TooltipIcon } from 'carbon-components-svelte'

    import InformationIcon from 'carbon-icons-svelte/lib/Information.svelte'

    import 'dayjs/locale/fr'
    import dayjs from 'dayjs'

    export let comments

    function processComment(content) {
        return content.substring(2)
    }

    function processLegacyComment(content) {
        return content.replace(/EOLEOL/g, '\n')
    }

    function isLegacyComment(comment) {
        return !comment.content.startsWith(String.fromCharCode(8204))
    }
</script>

{#if comments.length > 0}
    {#each comments as comment}
        <Tile light>
            <div>
                {#if comment.type === 'file'}
                    <p>Fichier</p>
                {:else if !isLegacyComment(comment)}
                    <p class="comment">{processComment(comment.content)}</p>
                {:else}
                    <p class="legacy-comment">{processLegacyComment(comment.content)}</p>
                {/if}
            </div>
            <div class="timestamp">
                {dayjs(comment.timestamp).locale('fr').format('dddd D MMMM YYYY à HH:mm')}
                <span class="legacy-icon">
                    {#if comment.type === 'comment' && isLegacyComment(comment)}
                        <TooltipIcon
                            icon={InformationIcon}
                            tooltipText="Commentaire écrit avec l'application originale"
                            direction="right"
                        />
                    {/if}
                </span>
                
            </div>
        </Tile>
    {/each}
{:else}
    <Tile light>
        <p class="no-comments">Aucun commentaire à afficher.</p>
    </Tile>
{/if}

<style>
    .timestamp {
        font-size: .9em;
        margin-top: 8px;
        color: #777;
    }

    .no-comments {
        color: #777;
        margin-top: 4px;
    }

    .comment {
        white-space: pre-line;
    }

    .legacy-comment {
        white-space: pre-line;
        padding: 8px;
        font-size: .95em;
        font-family: monospace;
        background-color: #fafafa;
        width: 495px;
    }

    .legacy-icon {
        position: relative;
        margin-left: 2px;
        top: 3px;
    }
</style>