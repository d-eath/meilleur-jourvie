<script>
    import {
        Button,
        Checkbox,
        InlineNotification,
        Modal,
        PasswordInput,
        TextInput
    } from 'carbon-components-svelte'

    import LoginIcon from 'carbon-icons-svelte/lib/Login.svelte'

    import LoginKeyPost from '../components/LoginKeyPost.svelte'

    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { push } from 'svelte-spa-router'
    import { stayLoggedIn, loginInfo, loginMessage, userInfo } from '../stores'
    import { httpPost } from '../util/httpRequest'
    import { setCurrentSession } from '../util/currentSessionSetter'

    let username
    let password
    let canLogin = true
    let isLoginNotificationShown = false
    let isSecurityModalOpen = false
    let isLoginKeyOpen = false
    let loginNotification = {
        title: undefined,
        subtitle: undefined,
        kind: undefined
    }

    const login = async () => {
        isLoginNotificationShown = false
        canLogin = false

        const req = await httpPost('/getUnDeveloppeur.php', {
            matricule: username,
            motPasse: password
        }, false)

        if (!req.returnedJson) {
            loginNotification.title = 'Connexion échouée'
            loginNotification.subtitle = 'Veuillez revérifier vos informations de connexion et réessayez.'
            loginNotification.kind = 'error'
            isLoginNotificationShown = true

            canLogin = true
            password = ''

            return
        }

        loginInfo.set({
            id: parseInt(req.data.Id),
            username: req.data.Matricule,
            projectId: parseInt(req.data.ProjetAssigne_Id),
            token: req.data.EtatConnexion
        })

        userInfo.set({
            id: parseInt(req.data.Id),
            lastName: req.data.Nom,
            firstName: req.data.Prenom,
            isCoordinator: req.data.EstCoordo === '1',
            projectId: parseInt(req.data.ProjetAssigne_Id),
            sessionId: req.data.SessionId !== 0 ? parseInt(req.data.SessionId) : null
        })

        setCurrentSession(req.data.SessionId !== 0 ? parseInt(req.data.SessionId) : null)

        push('/journal')
    }

    onMount(() => {
        const message = get(loginMessage)

        if (message?.kind) {
            loginNotification = message
            isLoginNotificationShown = true
        }

        loginMessage.set({})
    })
</script>

<div class="outer">
    <div class="inner">
        <div class="login-box">
            <h1 class="login-header">Meilleur Jourvie</h1>
            <p class="login-header">Connectez-vous avec votre compte Jourvie actuel</p>

            {#if isLoginNotificationShown}
                <InlineNotification
                    lowContrast
                    kind={loginNotification.kind}
                    title={loginNotification.title}
                    subtitle={loginNotification.subtitle}
                    on:close={e => {
                        e.preventDefault()
                        isLoginNotificationShown = false
                    }}
                />
            {/if}
    
            <div class="spacing">
                <TextInput labelText="Matricule" placeholder="0000000" bind:value={username} on:keydown={e => { if (e.key === 'Enter') login() }} />
            </div>
            <div class="spacing">
                <PasswordInput
                    labelText="Mot de passe"
                    hidePasswordLabel="Cacher le mot de passe"
                    showPasswordLabel="Afficher le mot de passe"
                    bind:value={password}
                    on:keydown={e => { if (e.key === 'Enter') login() }}
                />
            </div>
            <div class="spacing bottom-margin">
                <Checkbox labelText="Rester connecté" bind:checked={$stayLoggedIn} />
            </div>
            
            <Button icon={LoginIcon} on:click={login} disabled={!canLogin}>Connexion</Button>
            <Button kind="ghost" on:click={() => isLoginKeyOpen = true}>Utiliser une clé de connexion</Button>
        </div>
        <div class="footer">
            <a class="security-modal-link" href={null} on:click={() => isSecurityModalOpen = true}>
                Avis sur les risques de sécurité de Meilleur Jourvie
            </a>
            <div class="credit-footer">
                Créé par Davis Eath avec Svelte
            </div>
        </div>
    </div>
</div>

<Modal passiveModal modalHeading="Avis sur les risques de sécurité de Meilleur Jourvie" bind:open={isSecurityModalOpen}>
    <p class="modal-text">
        Cette application fait appel à un serveur « proxy » hébergé par le
        mainteneur de l'application pour contourner les
        <a href="https://developer.mozilla.org/fr/docs/Web/HTTP/CORS"
            target="_blank">restrictions CORS</a>
        du serveur original en agissant comme intermédiaire. Cette procédure
        est nécessaire au fonctionnement de l'application.
    </p>
    <p class="modal-text">
        Toute donnée échangée entre l'application et le serveur original est
        transmise à ce serveur intermédiaire, incluant les mots de passe et
        les jetons de connexion. Le mainteneur s'engage à ne pas lire ou
        enregistrer les données échangées.
    </p>
    <p class="modal-text">
        Toutefois, le mainteneur n'assume aucune responsabilité pour tout
        dommage causé par l'application ou le serveur « proxy ». <span class="bold">Utilisez
        l'application à vos risques et périls.</span>
    </p>
</Modal>

<LoginKeyPost bind:open={isLoginKeyOpen} />

<style>
    .outer {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;

        background-image: url("login_background.jpg");
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
    }

    .inner {
        width: 480px;
    }

    .login-box {
        background-color: #f4f4f4;
        padding: 24px;
    }

    .spacing {
        margin-top: 8px;
        margin-bottom: 8px;
    }

    .footer {
        padding-top: 1px;
        padding-bottom: 16px;
        background-color: #e4e4e4;
    }

    .security-modal-link {
        display: block;
        text-align: center;
        margin-top: 16px;
        cursor: pointer;
    }

    .credit-footer {
        text-align: center;
        margin-top: 16px;
        font-size: .9em;
        color: #555;
    }

    .bottom-margin {
        margin-bottom: 36px;
    }
    
    h1.login-header {
        margin-bottom: 4px;
    }

    p.login-header {
        margin-bottom: 24px;
    }

    p.modal-text {
        margin-bottom: 16px;
    }

    .bold {
        font-weight: bold;
    }
</style>