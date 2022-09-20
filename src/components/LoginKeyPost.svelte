<script>
    import { Button, Checkbox, InlineNotification, Modal, TextArea } from 'carbon-components-svelte'

    import { stayLoggedIn, loginInfo } from '../stores'
    
    import { push } from 'svelte-spa-router'
    import { loadUserInfo } from '../util/userInfoLoader'

    let canLogin = true
    let isLoginErrorShown = false
    let loginKey

    $: if (!open) {
        isLoginErrorShown = false
        loginKey = ''
    }

    const login = async () => {
        if (!canLogin) {
            return
        }

        const key = loginKey.trim()

        canLogin = false
        loginKey = ''

        let login = {}

        try {
            const decodedKey = window.atob(key).split(';')

            login.id = parseInt(decodedKey[0])
            login.username = decodedKey[1]
            login.projectId = parseInt(decodedKey[2])
            login.token = decodedKey[3]
        } catch {
            isLoginErrorShown = true
            canLogin = true

            return
        }

        loginInfo.set(login)

        const success = await loadUserInfo(login.username, true)

        if (!success) {
            isLoginErrorShown = true
            canLogin = true

            return
        }

        push('/journal')
    }

    export let open = false
</script>

<Modal
    size="sm"
    modalHeading="Clé de connexion"
    primaryButtonText="Connexion"
    secondaryButtonText="Annuler"
    primaryButtonDisabled={!canLogin}
    on:click:button--primary={login}
    on:click:button--secondary={() => open = false}
    bind:open
>
    {#if isLoginErrorShown}
        <InlineNotification
            lowContrast
            kind="error"
            title="Connexion échouée"
            subtitle="La clé de connexion semble être invalide."
            on:close={e => {
                e.preventDefault()
                isLoginErrorShown = false
            }}
        />
    {/if}
    <p>
        Le serveur Jourvie ne permet normalement pas d'avoir plusieurs connexion actives.
        Pour contourner cette restriction, vous pouvez vous connecter en utilisant une clé de connexion acquise sur une connexion prédédente:
    </p>

    <div class="textarea-no-resize">
        <TextArea
            rows={3}
            placeholder="Collez votre clé de connexion ici..."
            bind:value={loginKey}
            on:keydown={e => { if (e.key === 'Enter') { e.preventDefault(); login() } }}
        />
    </div>
    
    <p><span class="bold">Important:</span> N'utilisez pas plusieurs instances de Jourvie simultanément.</p>

    <Checkbox labelText="Rester connecté" bind:checked={$stayLoggedIn} />
</Modal>

<style>
    p, div {
        margin-bottom: 1rem;
    }

    .textarea-no-resize :global(textarea) {
        resize: none;
    }

    .bold {
        font-weight: bold;
    }

    :global(.bx--inline-notification__title) {
        font-weight: bold !important;
    }
</style>