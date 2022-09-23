<script>
    import { Modal, TextArea, TextInput } from 'carbon-components-svelte'

    const save = () => {

    }

    export let taskData
    export let open
</script>

<Modal
    bind:open
    size="sm"
    modalHeading="Créer une nouvelle tâche"
    primaryButtonText="Sauvegarder"
    secondaryButtonText="Annuler"
    on:click:button--primary={save}
    on:click:button--secondary={() => open = false}
>
    <TextInput bind:value={taskData.number} labelText="Numéro" />
    <TextInput bind:value={taskData.title} labelText="Titre" />
    <TextArea bind:value={taskData.description} labelText="Description" />
</Modal>