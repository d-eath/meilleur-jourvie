<script>
    import { Button, CodeSnippet, PasswordInput, Modal } from 'carbon-components-svelte'

    import VirtualColumnKey from 'carbon-icons-svelte/lib/VirtualColumnKey.svelte'

    import { loginInfo } from '../stores'
    import { get } from 'svelte/store'

    const getLoginKey = () => {
        const { id, projectId, token } = get(loginInfo)

        return window.btoa(`${id};${projectId};${token}`)
    }

    export let open
</script>

<Modal size="sm" passiveModal modalHeading="Clé de connexion" bind:open>
    <p>
        Le serveur Jourvie ne permet normalement pas d'avoir plusieurs connexion actives.
        Pour contourner cette restriction, vous pouvez utiliser la clé de connexion suivante à votre prochaine connexion:
    </p>
    <CodeSnippet code={getLoginKey()} type="multi" wrapText />
    <p class="margin-bottom"><span class="bold">Important:</span> N'utilisez pas plusieurs instances de Jourvie simultanément.</p>
    <h5>Régénénation de clé de connexion</h5>
    <p>
        Vous pouvez régénérer votre clé de connexion en entrant votre mot de passe Jourvie.
        Cette opération invalidera toute clé de connexion précédente associée à votre compte Jourvie.
        À utiliser si votre clé de connexion est volée.
    </p>
    <div>
        <PasswordInput labelText="Votre mot de passe" />
    </div>
    <Button kind="danger" icon={VirtualColumnKey} on:click={() => open = false}>Régénérer la clé de connexion</Button>
</Modal>

<style>
    p, div {
        margin-bottom: 1rem;
    }

    .margin-bottom {
        margin-bottom: 2rem;
    }

    .bold {
        font-weight: bold;
    }
</style>