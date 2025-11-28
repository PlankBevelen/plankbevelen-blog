export function formatDate(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function formatTime(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date)
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    return `${hour}:${minute}`
}

export function formatDateTime(date: string | Date): string {
    const d = date instanceof Date ? date : new Date(date)
    return `${formatDate(d)} ${formatTime(d)}`
}
