<script>
    import { Button, DataTable, Tag, Toolbar, ToolbarContent, TooltipIcon, Loading, Toggle } from 'carbon-components-svelte'

    import AddIcon from 'carbon-icons-svelte/lib/Add.svelte'
    import EditIcon from 'carbon-icons-svelte/lib/Edit.svelte'
    import PlayIcon from 'carbon-icons-svelte/lib/Play.svelte'
    import StopIcon from 'carbon-icons-svelte/lib/Stop.svelte'

    import Base from '../components/Base.svelte'
    import TaskModal from '../components/TaskModal.svelte'

    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { push } from 'svelte-spa-router'
    import { currentSession, loginInfo, userInfo } from '../stores'
    import { setCurrentSession } from '../util/currentSessionSetter'
    import { httpGet, httpPost } from '../util/httpRequest'
    import { subscribeIgnoreFirst } from '../util/subscribeIgnoreFirst'

    const headers = [
        { key: 'active', value: '', width: '25px' },
        { key: 'number', value: 'Numéro', width: '150px' },
        { key: 'title', value: 'Titre', width: '25%' },
        { key: 'description', value: 'Description', width: '60%' },
        { key: 'actions', empty: true, width: '125px' }
    ]

    let tasks = []
    let filteredTasks = []
    let isLoaded = false
    let isModalOpen = false
    let canStartSession = true
    let onlyShowActiveTasks = true

    let modalData = {
        id: null,
        number: '',
        title: '',
        description: '',
        active: true
    }

    const createNewTaskData = {
        id: null,
        number: '',
        title: '',
        description: '',
        active: true
    }

    const getTasks = async () => {
        const req = await httpGet(`/getToutesTaches.php?projetId=${get(userInfo).projectId}`)
        
        if (req.sessionError) {
            return
        }

        tasks = req.data.map(t => ({
            id: parseInt(t.Id),
            number: t.Numero,
            title: t.Titre,
            description: t.Description,
            active: t.Statut === 'active'
        }))
    }

    const openNewTaskModal = () => {
        modalData = { ...createNewTaskData }

        setTimeout(() => {
            isModalOpen = true
        }, 100)
    }

    const openEditTaskModal = async (task) => {
        modalData = { ...task }

        setTimeout(() => {
            isModalOpen = true
        }, 100)
    }

    const startSession = async (task) => {
        canStartSession = false

        const req = await httpPost('/postSessionTravail.php', {
            tacheid: task.id,
            tachenumero: task.number,
            devid: get(loginInfo).id,
            acces: get(loginInfo).token
        })

        if (req.sessionError) {
            return
        }

        setCurrentSession(parseInt(req.data))
        push('/journal')

        setTimeout(() => {
            canStartSession = true
        }, 300)
    }

    const endSession = async () => {
        await httpPost(`/putSessionTravail.php?sessionTravailId=${get(currentSession).session.id}`, {
            devId: get(loginInfo).id,
            acces: get(loginInfo).token
        })

        setCurrentSession(null)
    }

    const updateTasks = async () => {
        await getTasks()
        filterTasks()

        isLoaded = true
    }

    const filterTasks = () => {
        filteredTasks = tasks.filter(t => {
            if (onlyShowActiveTasks) {
                return t.active
            }

            return true
        })
    }

    subscribeIgnoreFirst(currentSession, updateTasks)
    onMount(updateTasks)
</script>

<Base>
    <h1>Tâches</h1>

    {#if isLoaded}
    <div class="task-list">
        <DataTable
            {headers}
            rows={filteredTasks}
            title="Tâches du projet"
        >
            <div slot="description">
                {#if !get(userInfo).isCoordinator}
                    Seuls les coordonnateurs peuvent créer ou modifier les tâches du projet.
                {/if}
                <Toggle
                    labelA="Afficher uniquement les tâches actives"
                    labelB="Afficher uniquement les tâches actives"
                    bind:toggled={onlyShowActiveTasks}
                    on:toggle={filterTasks}
                />
            </div>
            {#if get(userInfo).isCoordinator}
                <Toolbar>
                    <ToolbarContent>
                        <Button icon={AddIcon} on:click={openNewTaskModal}>Créer une nouvelle tâche</Button>
                    </ToolbarContent>
                </Toolbar>
            {/if}
            <svelte:fragment slot="cell" let:row let:cell>
                {#if cell.key === 'actions'}
                    <div class="align-right">
                        {#if get(userInfo).isCoordinator}
                            <Button
                                size="small"
                                kind="secondary"
                                icon={EditIcon}
                                iconDescription="Modifier la tâche"
                                tooltipPosition="top"
                                on:click={() => openEditTaskModal(row)}
                            />
                        {/if}
                        {#if !$currentSession && canStartSession && row.active}
                            <span class="start-button">
                                <Button
                                    size="small"
                                    kind="primary"
                                    icon={PlayIcon}
                                    iconDescription="Démarrer une session"
                                    tooltipPosition="top"
                                    on:click={() => startSession(row)}
                                />
                            </span>
                        {:else if $currentSession?.task?.id === row.id}
                            <Button
                                size="small"
                                kind="danger"
                                icon={StopIcon}
                                iconDescription="Terminer la session"
                                tooltipPosition="top"
                                on:click={endSession}
                            />
                        {:else}
                            <Button
                                disabled
                                size="small"
                                kind="primary"
                                icon={PlayIcon}
                                iconDescription="Démarrer une session"
                                tooltipPosition="top"
                            />
                        {/if}
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

<TaskModal bind:open={isModalOpen} bind:taskData={modalData} on:updatetasks={updateTasks} />

<style>
    h1 {
        margin-bottom: 24px;
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