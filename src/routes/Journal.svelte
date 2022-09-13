<script>
    import Base from '../components/Base.svelte'

    import axios from 'axios'
    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { userInfo } from '../stores'

    const { VITE_API_URL } = import.meta.env

    let sessions = []

    onMount(() => {
        getSessions()
    })

    async function getSessions() {
        const req = await axios.get(`${VITE_API_URL}/getSessionsTravail.php?devId=${get(userInfo).userId}`)

        for (const session of req.data) {
            sessions = [...sessions, {
                id: session.Id,
                task: {
                    id: session.TacheId,
                    number: session.TacheNumero
                },
                start: new Date(session.Debut).valueOf(),
                end: new Date(session.Fin).valueOf(),
                comments: []
            }]
        }
    }

    async function getComments() {
        const commentsReq = await axios.get(`${VITE_API_URL}/getCommentaires.php?devId=${get(userInfo).userId}`)

        for (const comment of commentsReq.data) {
            const session = sessions.find(s => s.id === comment.Session_Id)

            session.comments = [...session.comments, {
                type: 'comment',
                id: comment.Id,
                timestamp: new Date(comment.Horodateur).valueOf()
            }]
        }

        const filesReq = await axios.get(`${VITE_API_URL}/getTeleversements.php?devId=${get(userInfo).userId}`)

        // TODO
        for (const file of filesReq.data) {
            const session = sessions.find(s => s.id === file.Session_Id)
        }
    }
</script>

<Base>
    <h1>Journal</h1>
</Base>