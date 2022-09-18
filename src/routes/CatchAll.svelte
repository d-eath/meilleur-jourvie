<script>
    import { loginInfo } from '../stores'
    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { replace } from 'svelte-spa-router'

    onMount(() => {
        if (get(loginInfo)?.token) {
            replace('/journal')
        } else {
            replace('/login')
        }
    })
</script>