import dayjs from 'dayjs'

export const calculateTimestampsDuration = (timestampStart, timestampEnd) => {
    if (!timestampEnd) {
        timestampEnd = dayjs().unix()
    }

    const seconds = dayjs.unix(timestampEnd).diff(dayjs.unix(timestampStart), 'second')

    return calculateSecondsDuration(seconds)
}

export const calculateSecondsDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor(totalSeconds % 3600 / 60)
    const seconds = totalSeconds % 60

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