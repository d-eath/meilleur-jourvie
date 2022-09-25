<script>
    import { Column, Grid, Modal, Row, TextArea, TextInput, Toggle } from 'carbon-components-svelte'

    import { createEventDispatcher } from 'svelte'
    import { get } from 'svelte/store'
    import { loginInfo } from '../stores'
    import { httpPost } from '../util/httpRequest'

    const dispatch = createEventDispatcher()

    const submit = async () => {
        let resp

        if (taskData.id) {
            resp = await editTask()
        } else {
            resp = await createTask()
        }

        if (resp.sessionError) {
            return
        }

        dispatch('updatetasks')
        open = false
    }

    const createTask = async () => {
        const login = get(loginInfo)

        return await httpPost('/postNeoTache.php', {
            devId: login.id,
            acces: login.token,
            num: taskData.number,
            titre: taskData.title,
            desc: taskData.description,
            statut: 'active',
            projet: login.projectId
        })
    }

    const editTask = async () => {
        const login = get(loginInfo)

        return await httpPost('/putTache.php', {
            id: taskData.id,
            num: taskData.number,
            titre: taskData.title,
            desc: taskData.description,
            statut: taskData.active ? 'active' : 'inactive',
            devId: login.id,
            acces: login.token
        })
    }

    export let taskData
    export let open
</script>

<Modal
    bind:open
    size="sm"
    modalHeading={taskData.id ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
    primaryButtonText={taskData.id ? 'Modifier' : 'Créer'}
    secondaryButtonText="Annuler"
    on:click:button--primary={submit}
    on:click:button--secondary={() => open = false}
>
    <Grid noGutter>
        <Row>
            <Column sm={1} noGutterRight>
                <div class="form-margin">
                    <TextInput bind:value={taskData.number} labelText="Numéro" maxlength={12} />
                </div>
            </Column>
            <Column sm={3} noGutterLeft>
                <div class="form-margin margin-left">
                    <TextInput bind:value={taskData.title} labelText="Titre" maxlength={35} />
                </div>
            </Column>
        </Row>
        <Row>
            <Column sm={4}>
                <div class="form-margin">
                    <TextArea bind:value={taskData.description} labelText="Description" rows={5} maxlength={300} />
                </div>
            </Column>
        </Row>
        {#if taskData.id}
            <Row>
                <Column>
                    <div class="form-small-margin">
                        <Toggle labelText="Statut" labelA="Tâche inactive" labelB="Tâche active" bind:toggled={taskData.active} />
                    </div>
                </Column>
            </Row>
        {/if}
    </Grid>
</Modal>

<style>
    .form-margin {
        margin-bottom: 1rem;
    }

    .form-small-margin {
        margin-bottom: .2rem;
    }

    .margin-left {
        margin-left: 1.5rem;
    }
</style>