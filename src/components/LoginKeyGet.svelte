<script>
    import { Button, CodeSnippet, InlineNotification, PasswordInput, Modal } from 'carbon-components-svelte'

    import VirtualColumnKey from 'carbon-icons-svelte/lib/VirtualColumnKey.svelte'

    import axios from 'axios'
    import { loginInfo } from '../stores'
    import { stringify } from 'query-string'
    import { get } from 'svelte/store'

    const { VITE_API_URL } = import.meta.env

    let isRegenErrorShown = false
    let password
    let loginKey = ''

    loginInfo.subscribe(info => {
        const { id, username, projectId, token } = info

        setTimeout(() => {
            loginKey = window.btoa(`${id};${username};${projectId};${token}`)
        }, 1000)
    })

    const regenKey = async () => {
        isRegenErrorShown = false

        const { username } = get(loginInfo)

        const req = await axios.post(`${VITE_API_URL}/getUnDeveloppeur.php`, stringify({
            matricule: username,
            motPasse: password
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
        })

        // if the api returns a string (even though it should return a json object,
        // because content-type is application/json), then it means the login failed
        // what the fuck martel?
        if (typeof req.data !== 'object') {
            isRegenErrorShown = true
            password = ''

            return
        }

        loginInfo.set({
            id: parseInt(req.data.Id),
            username: req.data.Matricule,
            projectId: parseInt(req.data.ProjetAssigne_Id),
            token: req.data.EtatConnexion
        })

        isRegenErrorShown = false
        password = ''
        open = false
    }

    export let open
</script>

<Modal size="sm" passiveModal modalHeading="Clé de connexion" bind:open>
    {#if isRegenErrorShown}
        <InlineNotification
            lowContrast
            kind="error"
            title="Régénération échouée"
            subtitle="Le mot de passe semble être invalide."
            on:close={e => {
                e.preventDefault()
                isRegenErrorShown = false
            }}
        />
    {/if}
    <p>
        Le serveur Jourvie ne permet normalement pas d'avoir plusieurs connexion actives.
        Pour contourner cette restriction, vous pouvez utiliser la clé de connexion suivante à votre prochaine connexion:
    </p>
    <CodeSnippet code={loginKey} type="multi" wrapText />
    <p class="margin-bottom"><span class="bold">Important:</span> N'utilisez pas plusieurs instances de Jourvie simultanément.</p>
    <h5>Régénénation de clé de connexion</h5>
    <p>
        Vous pouvez régénérer votre clé de connexion en entrant votre mot de passe Jourvie.
        Cette opération invalidera toute clé de connexion associée à votre compte Jourvie.
        À utiliser si votre clé de connexion actuelle est volée.
    </p>
    <div>
        <PasswordInput
            labelText="Votre mot de passe"
            hidePasswordLabel="Cacher le mot de passe"
            showPasswordLabel="Afficher le mot de passe"
            tooltipAlignment="end"
            bind:value={password}
            on:keydown={e => { if (e.key === 'Enter') regenKey() }}
        />
    </div>
    <Button kind="danger" icon={VirtualColumnKey} on:click={regenKey}>Régénérer la clé de connexion</Button>
</Modal>

<style>
    p, div {
        margin-bottom: 1rem;
    }

    h5 {
        margin-bottom: .5rem;
    }

    .margin-bottom {
        margin-bottom: 2rem;
    }

    .bold {
        font-weight: bold;
    }
</style>