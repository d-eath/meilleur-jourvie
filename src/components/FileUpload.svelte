<script>
    import { FileUploaderDropContainer, FileUploaderItem, Modal } from 'carbon-components-svelte'

    import { createEventDispatcher } from 'svelte'
    import { get } from 'svelte/store'
    import { loginInfo } from '../stores'
    import { httpPostFormData } from '../util/httpRequest'

    const ALLOWED_FILE_EXT = ['jpg', 'png', 'gif', 'pdf', 'txt']

    const dispatch = createEventDispatcher()

    export let open = false

    let readyToUpload = false
    let error = ''
    let files = []

    const upload = async () => {
        if (!file) {
            return
        }

        readyToUpload = false

        await httpPostFormData(`/televerseFichier.php`, {
            file,
            idProjet: get(loginInfo).projectId,
            devId: get(loginInfo).id,
            acces: get(loginInfo).token,
            extension: file.name.split('.').at(-1)
        })

        open = false

        dispatch('updatejournal')
    }

    $: if (!open) {
        setTimeout(() => {
            files = []
        }, 500)
    }

    $: file = files[0]

    $: {
        if (file) {
            if (file.size > 512000) {
                error = 'Taille de fichier trop lourde.'
            } else if (!ALLOWED_FILE_EXT.includes(file.name.split('.').at(-1))) {
                error = 'Extension de fichier non autorisé.'
            } else {
                error = ''
                readyToUpload = true
            }
        } else {
            error = ''
            readyToUpload = false
        }
    }
</script>

<Modal
    size="xs"
    modalHeading="Téléverser un fichier"
    primaryButtonText="Téléverser"
    secondaryButtonText="Annuler"
    primaryButtonDisabled={!readyToUpload}
    on:click:button--primary={upload}
    on:click:button--secondary={() => (open = false)}
    bind:open
>
    <div class="file-uploader">
        <p class="file-restrictions">Taille maximale de 500 Ko. Extensions JPG, PNG, GIF, PDF ou TXT.</p>
        <FileUploaderDropContainer
            bind:files
            labelText="Glissez et déposez le fichier ici ou cliquez pour choisir un fichier à téléverser."
        />
        {#if files.length > 0}
        <FileUploaderItem
            size="default"
            name={file.name}
            status={error ? 'edit' : 'complete'}
            invalid={!!error}
            errorSubject={error}
            errorBody="Veuillez choisir un autre fichier à téléverser."
        />
        {/if}
    </div>
</Modal>

<style>
    .file-uploader :global(.bx--file-browse-btn), :global(.bx--file__selected-file) {
        max-width: 100%;
    }

    .file-uploader :global(.bx--file__selected-file) {
        border: 1px solid #dfe3e6;
    }

    .file-uploader :global(.bx--file-close) {
        display: none;
    }

    .file-restrictions {
        margin-bottom: .75rem;
    }
</style>