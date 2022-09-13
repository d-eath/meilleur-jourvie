<script>
    import { userInfo } from '../stores'
    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { replace } from 'svelte-spa-router'

    onMount(() => {
        if (get(userInfo)?.loginToken) {
            replace('/journal')
        } else {
            replace('/login')
        }
    })
</script>