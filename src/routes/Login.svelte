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

    import axios from 'axios'
    import { push } from 'svelte-spa-router'
    import { stringify } from 'query-string'
    import { userInfo } from '../stores/userInfo'

    const { VITE_API_URL } = import.meta.env

    let username
    let password
    let showSecurityModal = false
    let showLoginFailed = false

    async function login() {
        showLoginFailed = false

        const loginReq = await axios.post(`${VITE_API_URL}/getUnDeveloppeur.php`, stringify({
            matricule: username,
            motPasse: password,
        }, { encode: false }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        })

        // if the api returns a string (even though it should return a json object,
        // because content-type is application/json), then it means the login failed
        // what the fuck martel?
        if (typeof loginReq.data !== 'object') {
            showLoginFailed = true
            password = ''

            return
        }

        console.log(loginReq.data)
        userInfo.set({
            lastName: loginReq.data.Nom,
            firstName: loginReq.data.Prenom,
            isCoordinator: loginReq.data.EstCoordo === '1',
            projectId: loginReq.data.ProjetAssigne_Id,
            projectName: loginReq.data.NomProjet,
            loginToken: loginReq.data.EtatConnexion
        })

        push('/journal')
    }
</script>

<div class="outer">
    <div class="inner">
        <div class="login-box">
            <h1 class="login-header">Meilleur Jourvie</h1>
            <p class="login-header">Connectez-vous avec votre compte Jourvie actuel</p>

            {#if showLoginFailed}
                <InlineNotification
                    lowContrast
                    kind="error"
                    title="Connexion échouée."
                    on:close={e => {
                        e.preventDefault()
                        showLoginFailed = false
                    }}
                />
            {/if}
    
            <div class="spacing">
                <TextInput labelText="Matricule" placeholder="0000000" bind:value={username} />
            </div>
            <div class="spacing">
                <PasswordInput labelText="Mot de passe" bind:value={password} />
            </div>
            <div class="spacing bottom-margin">
                <Checkbox labelText="Rester connecté" />
            </div>
            
            <Button icon={LoginIcon} on:click={login}>Connexion</Button>
        </div>
        <a class="security-modal-link" href={null} on:click={() => showSecurityModal = true}>
            Avis sur les risques de sécurité de Meilleur Jourvie
        </a>
        <div class="credit-footer">
            Créé par Davis Eath avec Svelte
        </div>
    </div>
</div>

<Modal passiveModal modalHeading="Avis sur les risques de sécurité de Meilleur Jourvie" bind:open={showSecurityModal}>
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

<style>
    .outer {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;

        background-color: #d0d0d0;
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

    .security-modal-link {
        display: block;
        text-align: center;
        margin-top: 16px;
        cursor: pointer;
        text-decoration: underline;
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