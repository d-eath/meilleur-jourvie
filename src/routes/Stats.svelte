<script>
    import { DataTable, Loading, TooltipIcon } from 'carbon-components-svelte'

    import ChatIcon from 'carbon-icons-svelte/lib/Chat.svelte'
    import IdManagementIcon from 'carbon-icons-svelte/lib/IdManagement.svelte'

    import Base from '../components/Base.svelte'

    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { loginInfo } from '../stores'
    import { httpPost } from '../util/httpRequest'

    const devStatsHeaders = [
        { key: 'developer', value: 'Développeurs' },
        { key: 'hours', value: 'Temps cumulé' },
        { key: 'comments', value: 'Commentaires' }
    ]

    let isLoaded = false

    let devStats = []

    const calculateDuration = (fullSeconds) => {
        const hours = Math.floor(fullSeconds / 3600)
        const minutes = Math.floor(fullSeconds % 3600 / 60)
        const seconds = fullSeconds % 60

        let result = ''

        if (hours > 0) {
            result += hours + 'h '
        }

        if (minutes > 0) {
            result += minutes + 'm '
        }

        result += seconds + 's'
        
        return result
    }

    const getDevStats = async () => {
        const req = await httpPost(`/getDevStats.php?projetId=${get(loginInfo).projectId}`, {
            devId: get(loginInfo).id,
            acces: get(loginInfo).token
        })

        if (req.sessionError) {
            return
        }

        // console.log(req.data)
        devStats = req.data.map(s => {
            return {
                id: parseInt(s.Id),
                developer: `${s.Prenom} ${s.Nom}`,
                hours: s.CumTemps,
                comments: parseInt(s.CumCommentaires),
                isCoordinator: s.EstCoordo === '1'
            }
        })
    }

    const updateStats = async () => {
        await getDevStats()

        isLoaded = true
    }

    onMount(updateStats)
</script>

<Base>
    <h1>Statistiques</h1>

    {#if isLoaded}
        <h2>Statistiques des développeurs du projet</h2>
        <DataTable useStaticWidth headers={devStatsHeaders} rows={devStats}>
            <svelte:fragment slot="cell" let:row let:cell>
                {#if cell.key === 'developer'}
                    {cell.value}
                    {#if row.isCoordinator}
                        <span class="right icons">
                            <TooltipIcon tooltipText="Coordonnateur" icon={IdManagementIcon} direction="top" />
                        </span>
                    {/if}
                {:else if cell.key === 'hours'}
                    {calculateDuration(cell.value)}
                {:else if cell.key === 'comments'}
                    <span class="left icons"><ChatIcon /></span>
                    {cell.value}
                {/if}
            </svelte:fragment>
        </DataTable>
    {:else}
        <Loading />
    {/if}
</Base>

<style>
    h1 {
        margin-bottom: 32px;
    }

    h2 {
        margin-top: 24px;
        margin-bottom: 24px;
    }

    .icons {
        vertical-align: middle;
    }

    .left {
        margin-right: 2px;
    }

    .right {
        margin-left: 8px;
    }
</style>