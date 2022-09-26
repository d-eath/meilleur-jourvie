<script>
    import { DatePicker, DatePickerInput, Toggle } from 'carbon-components-svelte'

    import dayjs from 'dayjs'
    import { French } from 'flatpickr/dist/l10n/fr.js'
    import { createEventDispatcher, onMount } from 'svelte'

    const dispatch = createEventDispatcher()

    let valueFrom = dayjs().subtract(2, 'week').format('YYYY-MM-DD')
    let valueTo = dayjs().format('YYYY-MM-DD')

    export let range = false
    export let startDate = dayjs(valueFrom + ' 00:00:00').valueOf()
    export let endDate = dayjs(valueTo + ' 23:59:59').valueOf()

    French.firstDayOfWeek = 0

    const updateDates = () => {
        startDate = dayjs(valueFrom + ' 00:00:00').valueOf()
        endDate = dayjs(valueTo + ' 23:59:59').valueOf()

        dispatch('updatedates')
    }

    onMount(updateDates)
</script>

<div>
    <Toggle
        labelA="Voir les statistiques d'une intervalle de dates"
        labelB="Voir les statistiques d'une intervalle de dates"
        bind:toggled={range}
        on:toggle={() => dispatch('updatedates')}
    />
</div>
{#if range}
    <DatePicker datePickerType="range" on:change={updateDates} bind:valueFrom bind:valueTo locale={French} dateFormat="Y-m-d">
        <DatePickerInput labelText="Date de début" placeholder="yyyy-mm-dd" />
        <DatePickerInput labelText="Date de fin" placeholder="yyyy-mm-dd" />
    </DatePicker>
{/if}

<style>
    div {
        margin-bottom: 1rem;
    }
</style>