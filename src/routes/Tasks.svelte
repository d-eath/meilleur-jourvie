<script>
    import { Button, DataTable, Tag, Toolbar, ToolbarContent, TooltipIcon, Loading } from 'carbon-components-svelte'

    import AddIcon from 'carbon-icons-svelte/lib/Add.svelte'
    import EditIcon from 'carbon-icons-svelte/lib/Edit.svelte'
    import PlayIcon from 'carbon-icons-svelte/lib/Play.svelte'

    import Base from '../components/Base.svelte'
    import TaskModal from '../components/TaskModal.svelte'

    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { userInfo } from '../stores'
    import { httpGet } from '../util/httpRequest'

    const headers = [
        { key: 'active', value: '', width: '25px' },
        { key: 'number', value: 'Numéro', width: '150px' },
        { key: 'title', value: 'Titre', width: '25%' },
        { key: 'description', value: 'Description', width: '60%' },
        { key: 'actions', empty: true, width: '125px' }
    ]

    let tasks = []
    let isLoaded = false
    let isModalOpen = false

    let modalData = {
        id: null,
        number: '',
        title: '',
        description: '',
        active: true
    }

    const updateTasks = async () => {
        await getTasks()

        isLoaded = true
    }

    const getTasks = async () => {
        const req = await httpGet(`/getToutesTaches.php?projetId=${get(userInfo).projectId}`)
        
        if (req.sessionError) {
            return
        }

        tasks = req.data.map(t => {
            return {
                id: parseInt(t.Id),
                number: t.Numero,
                title: t.Titre,
                description: t.Description,
                active: t.Statut === 'active'
            }
        })
    }

    onMount(updateTasks)
</script>

<Base>
    <h1>Tâches</h1>

    {#if isLoaded}
    <div class="task-list">
        <DataTable {headers} rows={tasks} title="Tâches de l'équipe">
            <Toolbar>
                <ToolbarContent>
                    <Button icon={AddIcon} on:click={() => isModalOpen = true}>Créer une nouvelle tâche</Button>
                </ToolbarContent>
            </Toolbar>
            <svelte:fragment slot="cell" let:cell>
                {#if cell.key === 'actions'}
                    <div class="align-right">
                        <Button size="small" kind="secondary" icon={EditIcon} iconDescription="Modifier la tâche" tooltipPosition="top" />
                        <span class="start-button">
                            <Button size="small" kind="primary" icon={PlayIcon} iconDescription="Démarrer une session" tooltipPosition="top" />
                        </span>
                    </div>
                {:else if cell.key === 'number'}
                    <Tag type="purple">{cell.value}</Tag>
                {:else if cell.key === 'active'}
                <TooltipIcon tooltipText={cell.value ? 'Tâche active' : 'Tâche inactive'} direction="top">
                    <span class="status {cell.value ? 'active' : 'inactive'}"></span>
                </TooltipIcon>
                {:else}
                    {cell.value}
                {/if}
            </svelte:fragment>
        </DataTable>
    </div>
    {:else}
        <Loading />
    {/if}
</Base>

<TaskModal bind:open={isModalOpen} bind:taskData={modalData} />

<style>
    h1 {
        margin-bottom: 1rem;
    }

    .start-button :global(.bx--btn) {
        color: white;
        background-color: rgba(59, 165, 93);
    }

    .task-list :global(td) {
        word-wrap: break-word;
        padding-top: 8px;
        padding-bottom: 8px;
    }

    .align-right {
        text-align: right;
    }

    .status {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 100%;
    }

    .active {
        background-color: rgba(59, 165, 93);
    }
    
    .inactive {
        background-color: rgb(116, 127, 141);
    }
</style>