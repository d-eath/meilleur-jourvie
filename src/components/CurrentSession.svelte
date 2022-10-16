<script>
    import {
        Button,
        Column,
        Grid,
        Row,
        Tag,
        TextArea,
        Tile
    } from 'carbon-components-svelte'

    import ChatIcon from 'carbon-icons-svelte/lib/Chat.svelte'
    import AttachmentIcon from 'carbon-icons-svelte/lib/Attachment.svelte'

    import FileUpload from '../components/FileUpload.svelte'
    import JournalComments from '../components/JournalComments.svelte'

    import 'dayjs/locale/fr'
    import dayjs from 'dayjs'
    import { createEventDispatcher, onMount } from 'svelte'
    import { get } from 'svelte/store'
    import { loginInfo } from '../stores'
    import { calculateSecondsDuration } from '../util/durationCalculator'
    import { httpPost } from '../util/httpRequest'

    const dispatch = createEventDispatcher()

    let commentContent = ''
    let secondsElapsed = 0
    let timeElapsed
    let timeCoefficient
    let commentsPerHour
    let showFileUploadModal = false
    let canComment = true

    const calculateCommentsPerHour = (session) => {
        const comments = session.comments.filter(c => c.type === 'comment').length 
        const hours = dayjs().diff(dayjs.unix(session.timestampStart), 'hour', true)

        if (hours === 0) {
            return 0
        }

        return (comments / hours).toFixed(1).replace('.', ',')
    }

    const calculateCoefficient = (session) => {
        const seconds = dayjs().diff(dayjs.unix(session.timestampStart), 'second')
        const comments = session.comments.filter(c => c.type === 'comment').length

        let coefficient = comments / seconds / (5 / 9000)

        coefficient = coefficient > 1 ? 1 : coefficient

        return Math.round(coefficient * 100)
    }

    const updateLiveStats = () => {
        secondsElapsed = dayjs().diff(dayjs.unix(session.timestampStart), 'second')
        timeElapsed = calculateSecondsDuration(secondsElapsed)
        commentsPerHour = calculateCommentsPerHour(session)
        timeCoefficient = calculateCoefficient(session)
    }

    const postComment = async () => {
        if (commentContent.length === 0) {
            return
        }

        canComment = false

        await httpPost('/postCommentaire.php', {
            devId: get(loginInfo).id,
            sessId: session.id,
            comm: String.fromCharCode(0x1F) + commentContent,
            acces: get(loginInfo).token
        })

        commentContent = ''
        canComment = true

        updateLiveStats()
        dispatch('updatejournal')
    }

    setInterval(updateLiveStats, 500)
    onMount(updateLiveStats)

    export let session
</script>

<Tile light>
    <Grid narrow>
        <Row>
            <Column>
                <h6>Tâche</h6>
            </Column>
            <Column>
                <h6>Date et heure de début</h6>
            </Column>
            <Column>
                <h6>Temps écoulé</h6>
            </Column>
            <Column>
                <h6>Commentaires</h6>
            </Column>
        </Row>
        <Row>
            <Column>
                <Tag type="purple" size="sm">{session.task.number}</Tag>
            </Column>
            <Column>
                <span class="session-data">
                    {dayjs.unix(session.timestampStart).locale('fr').format('dddd D MMMM YYYY à HH:mm')}
                </span>
            </Column>
            <Column>
                <span class="session-data">
                    {timeElapsed} <span class="gray-data">({timeCoefficient}%)</span>
                </span>
            </Column>
            <Column>
                <span class="session-data">
                    <span class="comment-icons"><ChatIcon /></span>
                    {session.comments.filter(c => c.type === 'comment').length}
                    <span class="gray-data">({commentsPerHour}/h)</span> •
                    <span class="comment-icons"><AttachmentIcon /></span>
                    {session.comments.filter(c => c.type === 'file').length}
                </span>
            </Column>
        </Row>
        <Row>
            <Column sm={{ span: 4, offset: 0 }}>
                <Tile light>
                    <div class="session-actions">
                        <div class="comment-box">
                            <TextArea
                                maxCount={750}
                                placeholder="Écrivez votre commentaire..."
                                disabled={!canComment}
                                bind:value={commentContent}
                                on:keydown={e => {
                                    if (e.key === 'Enter' && e.ctrlKey) {
                                        postComment()
                                    }
                                }}
                            />
                        </div>
                        <div class="comment-buttons">
                            <Button disabled={commentContent.length === 0 || !canComment} icon={ChatIcon} on:click={postComment}>Commenter</Button>
                            <Button
                                kind="tertiary"
                                iconDescription="Téléverser un fichier"
                                icon={AttachmentIcon}
                                tooltipPosition="right"
                                on:click={() => showFileUploadModal = true}
                            />
                        </div>
                    </div>
                </Tile>
            </Column>
        </Row>
        <Row>
            <Column sm={{ span: 4, offset: 0 }}>
                <div class="comments-section">
                    <JournalComments comments={session.comments} />
                </div>
            </Column>
        </Row>
    </Grid>
</Tile>

<FileUpload bind:open={showFileUploadModal} on:updatejournal />

<style>
    .comment-icons {
        vertical-align: middle;
    }

    .gray-data {
        color: #666;
    }

    .comment-box {
        width: 500px;
    }

    .comment-buttons {
        margin-top: 4px;
    }

    .session-actions {
        margin-top: 24px;
    }

    .session-data {
        vertical-align: bottom;
        line-height: normal;
    }
</style>