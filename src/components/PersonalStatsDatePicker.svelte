<script>
    import { DatePicker, DatePickerInput, Toggle } from 'carbon-components-svelte'

    import dayjs from 'dayjs'
    import { French } from 'flatpickr/dist/l10n/fr.js'
    import { createEventDispatcher, onMount } from 'svelte'

    French.firstDayOfWeek = 0

    const dispatch = createEventDispatcher()

    const getLatestDateFromDay = (day) => {
        const today = dayjs()
        const defaultDay = dayjs().day(day)

        if (defaultDay > today) {
            return dayjs().day(day - 7).format('YYYY-MM-DD')
        }

        return defaultDay.format('YYYY-MM-DD')
    }

    let valueFrom = getLatestDateFromDay(4)
    let valueTo = dayjs().format('YYYY-MM-DD')

    export let range = false
    export let startDate = dayjs(valueFrom + ' 00:00:00').unix()
    export let endDate = dayjs(valueTo + ' 23:59:59').unix()

    const updateDates = () => {
        startDate = dayjs(valueFrom + ' 00:00:00').unix()
        endDate = dayjs(valueTo + ' 23:59:59').unix()

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