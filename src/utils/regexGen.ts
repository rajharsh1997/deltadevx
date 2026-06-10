export interface GeneratedRegex {
    pattern: string
    flags: string
    description: string
    example: string
}

interface Rule {
    triggers: RegExp[]
    pattern: string
    flags: string
    description: string
    example: string
}

const RULES: Rule[] = [
    // Email
    {
        triggers: [/email/i, /e-mail/i],
        pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}',
        flags: 'gi',
        description: 'Matches standard email addresses',
        example: 'user@example.com',
    },
    // URL / HTTP
    {
        triggers: [/\burl\b/i, /\blink\b/i, /https?/i, /website/i],
        pattern: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*',
        flags: 'gi',
        description: 'Matches HTTP/HTTPS URLs',
        example: 'https://example.com/path?q=1',
    },
    // IPv4
    {
        triggers: [/ip.?v?4?/i, /ip.?address/i],
        pattern: '(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)',
        flags: 'g',
        description: 'Matches valid IPv4 addresses',
        example: '192.168.1.1',
    },
    // IPv6
    {
        triggers: [/ip.?v?6?/i, /ipv6.?address/i],
        pattern: '(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,7}:|:(?::[a-fA-F0-9]{1,4}){1,7}|(?:[a-fA-F0-9]{1,4}:){1,6}:[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,5}(?::[a-fA-F0-9]{1,4}){1,2}|(?:[a-fA-F0-9]{1,4}:){1,4}(?::[a-fA-F0-9]{1,4}){1,3}|(?:[a-fA-F0-9]{1,4}:){1,3}(?::[a-fA-F0-9]{1,4}){1,4}|(?:[a-fA-F0-9]{1,4}:){1,2}(?::[a-fA-F0-9]{1,4}){1,5}|[a-fA-F0-9]{1,4}:(?:(?::[a-fA-F0-9]{1,4}){1,6})|:(?:(?::[a-fA-F0-9]{1,4}){1,7}|:)',
        flags: 'g',
        description: 'Matches valid IPv6 addresses',
        example: '2001:0db8:85a3:0000:0000:8a2e:0370:7334 or ::1',
    },
    // Phone number
    {
        triggers: [/phone/i, /mobile/i, /telephone/i],
        pattern: '[+]?[\\d\\s\\-().]{7,15}',
        flags: 'g',
        description: 'Matches international phone numbers',
        example: '+1 (555) 123-4567',
    },
    // Date YYYY-MM-DD
    {
        triggers: [/date/i, /yyyy.mm.dd/i, /iso.?date/i],
        pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])',
        flags: 'g',
        description: 'Matches dates in YYYY-MM-DD format',
        example: '2024-01-15',
    },
    // Date DD/MM/YYYY or MM/DD/YYYY
    {
        triggers: [/dd.mm.yyyy/i, /mm.dd.yyyy/i, /slash.?date/i],
        pattern: '(?:0[1-9]|[12]\\d|3[01])[/\\-.](?:0[1-9]|1[0-2])[/\\-.](\\d{4})',
        flags: 'g',
        description: 'Matches dates in DD/MM/YYYY or DD-MM-YYYY format',
        example: '15/01/2024',
    },
    // Time HH:MM
    {
        triggers: [/\btime\b/i, /hh:mm/i, /clock/i],
        pattern: '(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?',
        flags: 'g',
        description: 'Matches 24-hour time (HH:MM or HH:MM:SS)',
        example: '14:30:00',
    },
    // Hex color
    {
        triggers: [/hex.?color/i, /color.?code/i, /colour/i, /#[0-9a-f]/i],
        pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
        flags: 'g',
        description: 'Matches 3 or 6-digit hex color codes',
        example: '#ff6b6b or #fff',
    },
    // Integer / number
    {
        triggers: [/\binteger\b/i, /\bnumber\b/i, /\bdigit\b/i, /\bnumeric\b/i],
        pattern: '-?\\d+',
        flags: 'g',
        description: 'Matches integers (including negative)',
        example: '42, -7, 1000',
    },
    // Decimal / float
    {
        triggers: [/\bfloat\b/i, /\bdecimal\b/i, /\bprice\b/i, /\bamount\b/i],
        pattern: '-?\\d+(?:\\.\\d+)?',
        flags: 'g',
        description: 'Matches integers and decimal numbers',
        example: '3.14, -0.5, 100',
    },
    // UUID
    {
        triggers: [/uuid/i, /guid/i],
        pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
        flags: 'gi',
        description: 'Matches UUID/GUID strings',
        example: '550e8400-e29b-41d4-a716-446655440000',
    },
    // Hashtag
    {
        triggers: [/hashtag/i, /\btag\b/i],
        pattern: '#[\\w\\u0080-\\uFFFF]+',
        flags: 'g',
        description: 'Matches hashtags (including unicode)',
        example: '#hello #世界',
    },
    // Mention / @username
    {
        triggers: [/mention/i, /@.?username/i, /@.?user/i],
        pattern: '@[\\w.\\-]{1,30}',
        flags: 'g',
        description: 'Matches @mentions',
        example: '@john_doe',
    },
    // Postal / ZIP code
    {
        triggers: [/zip.?code/i, /postal.?code/i, /postcode/i],
        pattern: '\\b\\d{5}(?:-\\d{4})?\\b',
        flags: 'g',
        description: 'Matches US ZIP codes (5-digit or ZIP+4)',
        example: '90210, 10001-1234',
    },
    // Credit card
    {
        triggers: [/credit.?card/i, /card.?number/i],
        pattern: '\\b(?:\\d{4}[\\s\\-]?){3}\\d{4}\\b',
        flags: 'g',
        description: 'Matches 16-digit credit card numbers',
        example: '4111 1111 1111 1111',
    },
    // JWT
    {
        triggers: [/\bjwt\b/i, /json.?web.?token/i, /bearer.?token/i],
        pattern: '[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+',
        flags: 'g',
        description: 'Matches JWT tokens (3 base64url segments)',
        example: 'eyJ....eyJ....abc',
    },
    // Slug
    {
        triggers: [/\bslug\b/i, /url.?slug/i, /kebab.?case/i],
        pattern: '[a-z0-9]+(?:-[a-z0-9]+)*',
        flags: 'g',
        description: 'Matches URL slugs / kebab-case strings',
        example: 'my-blog-post-title',
    },
    // Semantic version
    {
        triggers: [/semver/i, /semantic.?version/i, /version.?number/i],
        pattern: '\\bv?(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)(?:[\\-+][\\w.]+)?\\b',
        flags: 'g',
        description: 'Matches semantic version numbers (SemVer)',
        example: '1.2.3, v2.0.0-beta.1',
    },
    // HTML tag
    {
        triggers: [/html.?tag/i, /xml.?tag/i, /\btag\b.*html/i],
        pattern: '<\\/? ?[a-zA-Z][^>]*>',
        flags: 'g',
        description: 'Matches HTML/XML tags',
        example: '<div class="foo">, </p>',
    },
    // Whitespace / spaces
    {
        triggers: [/whitespace/i, /blank.?line/i, /empty.?line/i],
        pattern: '^\\s*$',
        flags: 'gm',
        description: 'Matches blank / whitespace-only lines',
        example: '(lines with only spaces)',
    },
    // Word
    {
        triggers: [/\bword\b/i, /\bwords\b/i],
        pattern: '\\b[a-zA-Z]+\\b',
        flags: 'g',
        description: 'Matches whole words (alphabetic)',
        example: 'Hello world',
    },
    // Alphanumeric
    {
        triggers: [/alphanumeric/i, /alpha.?numeric/i],
        pattern: '[a-zA-Z0-9]+',
        flags: 'g',
        description: 'Matches alphanumeric sequences',
        example: 'abc123',
    },
    // Username
    {
        triggers: [/\busername\b/i, /\buser.?name\b/i, /\bhandle\b/i],
        pattern: '[a-zA-Z_][a-zA-Z0-9_.]{2,29}',
        flags: 'g',
        description: 'Matches typical usernames (3–30 chars)',
        example: 'john_doe_99',
    },
    // Strong password
    {
        triggers: [/password/i, /passphrase/i],
        pattern: '(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}',
        flags: '',
        description: 'Validates strong passwords (8+ chars, upper, lower, digit, special)',
        example: 'Tr0ub4dor&3',
    },
    // Mac address
    {
        triggers: [/mac.?address/i, /mac.?addr/i],
        pattern: '(?:[0-9A-Fa-f]{2}[:\\-]){5}[0-9A-Fa-f]{2}',
        flags: 'g',
        description: 'Matches MAC addresses',
        example: 'AA:BB:CC:DD:EE:FF',
    },
    // File extension
    {
        triggers: [/file.?ext/i, /extension/i, /filename/i],
        pattern: '\\b\\w+\\.(?:jpg|jpeg|png|gif|svg|pdf|docx?|xlsx?|zip|tar|gz|mp4|mp3|ts|tsx?|js|jsx?|py|java|go|rs)\\b',
        flags: 'gi',
        description: 'Matches common file extensions',
        example: 'image.png, report.pdf',
    },
]

export function generateRegex(description: string): GeneratedRegex | null {
    const desc = description.trim()
    if (!desc) return null

    for (const rule of RULES) {
        if (rule.triggers.some(t => t.test(desc))) {
            return {
                pattern: rule.pattern,
                flags: rule.flags,
                description: rule.description,
                example: rule.example,
            }
        }
    }

    return null
}

export const GENERATOR_EXAMPLES = [
    'Email address',
    'URL or website link',
    'IPv4 address',
    'IPv6 address',
    'Phone number',
    'Date in YYYY-MM-DD',
    'Hex color code',
    'UUID / GUID',
    'Semantic version',
    'Credit card number',
    'Strong password',
]
