<script>
    import Base from '../components/Base.svelte'

    import axios from 'axios'
    import { onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { stringify } from 'query-string'
    import { userInfo } from '../stores'

    const { VITE_API_URL } = import.meta.env

    let entries = []

    onMount(async () => {
        await getSessions()
        await getComments()

        entries.sort((x, y) => y.timestamp - x.timestamp)
    })

    async function getSessions() {
        const req = await axios.get(`${VITE_API_URL}/getSessionsTravail.php?devId=${get(userInfo).userId}`)

        for (const session of req.data) {
            entries = [...entries, {
                type: 'sessionStart',
                id: session.Id,
                timestamp: new Date(session.Debut).valueOf(),
                task: {
                    id: session.TacheId,
                    number: session.TacheNumero
                }
            }]

            entries = [...entries, {
                type: 'sessionEnd',
                id: session.Id,
                timestamp: new Date(session.Fin).valueOf(),
                task: {
                    id: session.TacheId,
                    number: session.TacheNumero
                }
            }]
        }
    }

    async function getComments() {
        const commentsReq = await axios.post(`${VITE_API_URL}/getCommentaires.php?devId=${get(userInfo).userId}`, stringify({
            acces: get(userInfo).loginToken,
        }, { encode: true }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        })

        for (const comment of commentsReq.data) {

            entries = [...entries, {
                type: 'comment',
                id: comment.Id,
                timestamp: new Date(comment.Horodateur).valueOf(),
                sessionId: comment.Session_Id,
                content: comment.Contenu
            }]
        }

        const filesReq = await axios.post(`${VITE_API_URL}/getTeleversements.php?devId=${get(userInfo).userId}`, stringify({
            acces: get(userInfo).loginToken,
        }, { encode: true }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
        })

        for (const file of filesReq.data) {
            entries = [...entries, {
                type: 'file',
                id: file.Id,
                timestamp: new Date(file.DateTele).valueOf(),
                filename: file.NomFichier,
                extension: file.Extension
            }]
        }

        // const commentsReq = await axios.get(`${VITE_API_URL}/getCommentaires.php?devId=${get(userInfo).userId}`)

        // for (const comment of commentsReq.data) {
        //     const session = sessions.find(s => s.id === comment.Session_Id)

        //     session.comments = [...session.comments, {
        //         type: 'comment',
        //         id: comment.Id,
        //         timestamp: new Date(comment.Horodateur).valueOf()
        //     }]
        // }

        // const filesReq = await axios.get(`${VITE_API_URL}/getTeleversements.php?devId=${get(userInfo).userId}`)

        // // TODO
        // for (const file of filesReq.data) {
        //     const session = sessions.find(s => s.id === file.Session_Id)
        // }
    }
</script>

<Base>
    <h1>Journal</h1>
</Base>