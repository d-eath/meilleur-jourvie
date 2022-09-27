<script>
    import { Button, DataTable, Loading, TooltipIcon } from 'carbon-components-svelte'

    import ChatIcon from 'carbon-icons-svelte/lib/Chat.svelte'
    import IdManagementIcon from 'carbon-icons-svelte/lib/IdManagement.svelte'
    import ResetIcon from 'carbon-icons-svelte/lib/Reset.svelte'

    import Base from '../components/Base.svelte'
    import PersonalStats from '../components/PersonalStats.svelte'
    import PersonalStatsDatePicker from '../components/PersonalStatsDatePicker.svelte'

    import dayjs from 'dayjs'
    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { loginInfo, userInfo } from '../stores'
    import { calculateSecondsDuration } from '../util/durationCalculator'
    import { httpGet, httpPost } from '../util/httpRequest'

    const devStatsHeaders = [
        { key: 'developer', value: 'Développeur' },
        { key: 'hours', value: 'Temps cumulé' },
        { key: 'comments', value: 'Commentaires' }
    ]

    let isLoaded = false
    let devStats = []
    let personalStatsRange = false
    let personalStatsStartDate
    let personalStatsEndDate
    let personalSessions
    let personalComments
    let personalUploads

    const getDevStats = async () => {
        const req = await httpPost(`/getDevStats.php?projetId=${get(loginInfo).projectId}`, {
            devId: get(loginInfo).id,
            acces: get(loginInfo).token
        })

        if (req.sessionError) {
            return
        }

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

    const getSessions = async () => {
        const req = await httpGet(`/getSessionsTravail.php?devId=${get(userInfo).id}`)

        if (req.sessionError) {
            return
        }

        personalSessions = req.data
            .map(s => {
                return {
                    start: dayjs(s.Debut).unix(),
                    end: s.Fin ? dayjs(s.Fin).unix() : dayjs().unix(),
                }
            })
            .filter(s => s.start >= personalStatsStartDate && s.start <= personalStatsEndDate || !personalStatsRange)
    }

    const getComments = async () => {
        const req = await httpPost(`/getCommentaires.php?devId=${get(userInfo).id}`, {
            acces: get(loginInfo).token
        })

        if (req.sessionError) {
            return 
        }

        personalComments = req.data
            .map(c => dayjs(c.Horodateur).unix())
            .filter(c => c >= personalStatsStartDate && c <= personalStatsEndDate || !personalStatsRange)
    }

    const getUploads = async () => {
        const req = await httpPost(`/getTeleversements.php?devId=${get(userInfo).id}`, {
            acces: get(loginInfo).token
        })

        if (req.sessionError) {
            return 
        }

        personalUploads = req.data
            .map(u => dayjs(u.DateTele).unix())
            .filter(u => u >= personalStatsStartDate && u <= personalStatsEndDate || !personalStatsRange)
    }

    const updatePersonalStats = async () => {
        await Promise.all([
            getSessions(),
            getComments(),
            getUploads()
        ])
    }

    const updateStats = async () => {
        isLoaded = false

        await getDevStats()
        await updatePersonalStats()

        isLoaded = true
    }

    onMount(updateStats)
</script>

<Base>
    <h1>
        Statistiques
        <span class="reload-button">
            <Button
                icon={ResetIcon}
                iconDescription="Recharger les statistiques"
                selected={false}
                kind="secondary"
                on:click={updateStats}
            />
        </span>
        
    </h1>

    {#if isLoaded}
        <h2>Statistiques personnelles</h2>
        <div class="date-picker">
            <PersonalStatsDatePicker
                bind:range={personalStatsRange}
                bind:startDate={personalStatsStartDate}
                bind:endDate={personalStatsEndDate}
                on:updatedates={updatePersonalStats}
            />
        </div>       
        <PersonalStats bind:sessions={personalSessions} bind:comments={personalComments} bind:uploads={personalUploads} />
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
                    {calculateSecondsDuration(cell.value)}
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

    .date-picker {
        margin-bottom: 1.5rem;
    }

    .reload-button {
        margin-left: 1.25rem;
    }
</style>