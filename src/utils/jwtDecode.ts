export interface JWTHeader {
    alg?: string
    typ?: string
    [key: string]: unknown
}

export interface JWTPayload {
    sub?: string
    iss?: string
    aud?: string | string[]
    exp?: number
    iat?: number
    nbf?: number
    jti?: string
    [key: string]: unknown
}

export interface DecodedJWT {
    header: JWTHeader
    payload: JWTPayload
    signature: string
    isExpired: boolean
    expiresAt?: Date
    issuedAt?: Date
    notBefore?: Date
}

/**
 * Base64url decode a string (handles padding automatically).
 * Uses native atob — no external libraries needed.
 */
function base64UrlDecode(str: string): string {
    // Replace URL-safe chars and add padding
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    try {
        // Decode via atob + handle UTF-8
        const binary = atob(padded)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
        }
        return new TextDecoder('utf-8').decode(bytes)
    } catch {
        throw new Error('Failed to base64url decode segment')
    }
}

/**
 * Decode a JWT token into its header, payload, and signature parts.
 * Fully offline — uses only native browser APIs.
 */
export function decodeJWT(token: string): DecodedJWT {
    const trimmed = token.trim()
    if (!trimmed) {
        throw new Error('Token is empty')
    }

    const parts = trimmed.split('.')
    if (parts.length !== 3) {
        throw new Error(
            `Invalid JWT format: expected 3 parts separated by ".", got ${parts.length} part${parts.length === 1 ? '' : 's'}`
        )
    }

    const [headerB64, payloadB64, signature] = parts

    let header: JWTHeader
    let payload: JWTPayload

    try {
        header = JSON.parse(base64UrlDecode(headerB64))
    } catch (e) {
        throw new Error(`Failed to decode JWT header: ${(e as Error).message}`)
    }

    try {
        payload = JSON.parse(base64UrlDecode(payloadB64))
    } catch (e) {
        throw new Error(`Failed to decode JWT payload: ${(e as Error).message}`)
    }

    const now = Math.floor(Date.now() / 1000)
    const isExpired = typeof payload.exp === 'number' ? payload.exp < now : false

    const expiresAt =
        typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : undefined
    const issuedAt =
        typeof payload.iat === 'number' ? new Date(payload.iat * 1000) : undefined
    const notBefore =
        typeof payload.nbf === 'number' ? new Date(payload.nbf * 1000) : undefined

    if (!signature) {
        throw new Error('JWT signature segment is missing')
    }

    return {
        header,
        payload,
        signature,
        isExpired,
        expiresAt,
        issuedAt,
        notBefore,
    }
}

/**
 * Format a Date for display in the JWT decoder UI.
 */
export function formatDate(date: Date): string {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
    })
}

/**
 * Calculate relative time from now.
 */
export function timeFromNow(date: Date): string {
    const diffMs = date.getTime() - Date.now()
    const absDiffMs = Math.abs(diffMs)
    const isPast = diffMs < 0

    const seconds = Math.floor(absDiffMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    let label: string
    if (days > 0) label = `${days}d ${hours % 24}h`
    else if (hours > 0) label = `${hours}h ${minutes % 60}m`
    else if (minutes > 0) label = `${minutes}m ${seconds % 60}s`
    else label = `${seconds}s`

    return isPast ? `${label} ago` : `in ${label}`
}
