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
        triggers: [/\bipv4\b/i, /\bip\s?v4\b/i, /\bip\s?address\b/i, /^\s*ip\s*$/i],
        pattern: '(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)',
        flags: 'g',
        description: 'Matches valid IPv4 addresses',
        example: '192.168.1.1',
    },
    // IPv6
    {
        triggers: [/\bipv6\b/i, /\bip\s?v6\b/i, /ipv6\s?address/i],
        pattern: '(?:(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,7}:|(?:[a-fA-F0-9]{1,4}:){1,6}:[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,5}(?::[a-fA-F0-9]{1,4}){1,2}|(?:[a-fA-F0-9]{1,4}:){1,4}(?::[a-fA-F0-9]{1,4}){1,3}|(?:[a-fA-F0-9]{1,4}:){1,3}(?::[a-fA-F0-9]{1,4}){1,4}|(?:[a-fA-F0-9]{1,4}:){1,2}(?::[a-fA-F0-9]{1,4}){1,5}|[a-fA-F0-9]{1,4}:(?:(?::[a-fA-F0-9]{1,4}){1,6})|:(?:(?::[a-fA-F0-9]{1,4}){1,7}|:))',
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
    // Date — generic ISO fallback (yyyy-mm-dd)
    {
        triggers: [/\biso.?date\b/i],
        pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])',
        flags: 'g',
        description: 'Matches ISO 8601 dates in YYYY-MM-DD format',
        example: '2024-01-15',
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
        pattern: '\\b(?:(?:4\\d{3}|5[1-5]\\d{2}|6(?:011|5\\d{2})|2[2-7]\\d{2})[\\s\\-]?\\d{4}[\\s\\-]?\\d{4}[\\s\\-]?\\d{4}|3[47]\\d{2}[\\s\\-]?\\d{6}[\\s\\-]?\\d{5})\\b',
        flags: 'g',
        description: 'Matches major credit cards (Visa, MC, Amex, Discover)',
        example: '4242 4242 4242 4242 or 3782 822463 10005',
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
    // Currency / money
    {
        triggers: [/\bcurrenc(?:y|ies)\b/i, /\bmoney\b/i, /\bcash\b/i],
        pattern: '[$€£¥₹]\\s?\\d{1,3}(?:[,.]\\d{3})*(?:\\.\\d{2})?',
        flags: 'g',
        description: 'Matches currency amounts ($, €, £, ¥, ₹)',
        example: '$1,234.56 or €99.00',
    },
    // Unix file path
    {
        triggers: [/\bunix.?path\b/i, /\blinux.?path\b/i, /\babsolute.?path\b/i, /\bfile.?path\b/i],
        pattern: '\\/(?:[^\\/\\s]+\\/)*[^\\/\\s]*',
        flags: 'g',
        description: 'Matches Unix/Linux absolute file paths',
        example: '/usr/local/bin/node',
    },
    // Windows file path
    {
        triggers: [/\bwindows.?path\b/i, /\bwin.?path\b/i, /\bdos.?path\b/i],
        pattern: '[A-Za-z]:\\\\(?:[^\\\\\/:*?"<>|\\r\\n]+\\\\)*[^\\\\\/:*?"<>|\\r\\n]*',
        flags: 'g',
        description: 'Matches Windows file paths',
        example: 'C:\\Users\\Harsh\\file.txt',
    },
    // Domain name
    {
        triggers: [/\bdomain\b/i, /\bhostname\b/i],
        pattern: '(?:[a-zA-Z0-9](?:[a-zA-Z0-9\\-]{0,61}[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}',
        flags: 'g',
        description: 'Matches domain names and hostnames',
        example: 'example.com, sub.domain.org',
    },
    // IBAN
    {
        triggers: [/\biban\b/i, /\bbank.?account\b/i],
        pattern: '[A-Z]{2}\\d{2}[A-Z0-9]{4}\\d{7}(?:[A-Z0-9]{0,16})?',
        flags: 'g',
        description: 'Matches International Bank Account Numbers (IBAN)',
        example: 'GB29NWBK60161331926819',
    },
    // Git commit hash
    {
        triggers: [/\bgit.?(?:commit|hash|sha)\b/i, /\bcommit.?hash\b/i, /\bsha.?hash\b/i],
        pattern: '\\b[0-9a-f]{7,40}\\b',
        flags: 'g',
        description: 'Matches Git commit hashes (7–40 hex chars)',
        example: 'a3f5c1d',
    },
    // Base64
    {
        triggers: [/\bbase.?64\b/i],
        pattern: '(?:[A-Za-z0-9+\\/]{4})*(?:[A-Za-z0-9+\\/]{2}==|[A-Za-z0-9+\\/]{3}=|[A-Za-z0-9+\\/]{4})',
        flags: 'g',
        description: 'Matches Base64 encoded strings',
        example: 'SGVsbG8gV29ybGQ=',
    },
    // Hex string (raw)
    {
        triggers: [/\bhex\s+string\b/i, /\bhex\s+value\b/i, /\bhex\s+data\b/i, /\braw\s+hex\b/i],
        pattern: '\\b[0-9a-fA-F]+\\b',
        flags: 'g',
        description: 'Matches raw hexadecimal strings (without #)',
        example: 'deadbeef, 0A1B2C',
    },
    // RGB / RGBA color
    {
        triggers: [/\brgba?\b/i, /\brgb.?color\b/i],
        pattern: 'rgba?\\(\\s*(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\s*,\\s*(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\s*,\\s*(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)(?:\\s*,\\s*(?:0|1|0?\\.\\d+))?\\s*\\)',
        flags: 'g',
        description: 'Matches RGB and RGBA color values',
        example: 'rgb(255, 99, 71) or rgba(0,0,0,0.5)',
    },
    // HSL / HSLA color
    {
        triggers: [/\bhsla?\b/i, /\bhsl.?color\b/i],
        pattern: 'hsla?\\(\\s*(?:360|3[0-5]\\d|[12]?\\d{1,2})\\s*,\\s*(?:100|\\d{1,2})%\\s*,\\s*(?:100|\\d{1,2})%(?:\\s*,\\s*(?:0|1|0?\\.\\d+))?\\s*\\)',
        flags: 'g',
        description: 'Matches HSL and HSLA color values',
        example: 'hsl(120, 100%, 50%)',
    },
    // CSS class name
    {
        triggers: [/\bcss.?class\b/i, /\bclass.?name\b/i],
        pattern: '\\.[\\-_a-zA-Z][\\-_a-zA-Z0-9]*',
        flags: 'g',
        description: 'Matches CSS class name selectors',
        example: '.btn-primary, .nav_item',
    },
    // Environment variable
    {
        triggers: [/\benv(?:ironment)?.?var(?:iable)?\b/i, /\benv.?var\b/i],
        pattern: '\\b[A-Z_][A-Z0-9_]*\\b',
        flags: 'g',
        description: 'Matches environment variable names (UPPER_SNAKE_CASE)',
        example: 'DATABASE_URL, API_KEY',
    },
    // Port number
    {
        triggers: [/\bport\s*number\b/i, /\bport\b/i],
        pattern: '\\b(?:6553[0-5]|655[0-2]\\d|65[0-4]\\d{2}|6[0-4]\\d{3}|[1-5]\\d{4}|[1-9]\\d{0,3}|0)\\b',
        flags: 'g',
        description: 'Matches valid port numbers (0–65535)',
        example: '8080, 443, 3000',
    },
    // CIDR notation
    {
        triggers: [/\bcidr\b/i, /\bsubnet\b/i, /\bip.?range\b/i],
        pattern: '(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\/(?:3[0-2]|[12]?\\d)',
        flags: 'g',
        description: 'Matches IPv4 CIDR notation',
        example: '192.168.1.0/24',
    },
    // camelCase
    {
        triggers: [/\bcamel.?case\b/i],
        pattern: '\\b[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*\\b',
        flags: 'g',
        description: 'Matches camelCase identifiers',
        example: 'myVariableName, getUserById',
    },
    // PascalCase
    {
        triggers: [/\bpascal.?case\b/i, /\bupper.?camel.?case\b/i],
        pattern: '\\b[A-Z][a-z][a-zA-Z0-9]*\\b',
        flags: 'g',
        description: 'Matches PascalCase / UpperCamelCase identifiers',
        example: 'MyClassName, UserProfile',
    },
    // snake_case
    {
        triggers: [/\bsnake.?case\b/i],
        pattern: '\\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\\b',
        flags: 'g',
        description: 'Matches snake_case identifiers',
        example: 'my_variable_name, user_id',
    },
    // Docker image tag
    {
        triggers: [/\bdocker.?image\b/i, /\bcontainer.?image\b/i, /\bdocker.?tag\b/i],
        pattern: '[a-z0-9]+(?:[.\\-_][a-z0-9]+)*(?:\\/[a-z0-9]+(?:[.\\-_][a-z0-9]+)*)?(?::[a-zA-Z0-9.\\-_]+)?',
        flags: 'g',
        description: 'Matches Docker image references with optional tag',
        example: 'nginx:1.21-alpine, user/repo:latest',
    },
    // ISBN-13
    {
        triggers: [/\bisbn.?13\b/i, /\bnewer\s+isbn\b/i, /\beis?bn\b/i],
        pattern: '(?:978|979)[\\- ]?\\d{1,5}[\\- ]?\\d{1,7}[\\- ]?\\d{1,7}[\\- ]?\\d',
        flags: 'g',
        description: 'Matches ISBN-13 book numbers (978/979 prefix)',
        example: '978-3-16-148410-0 or 9780306406157',
    },
    // ISBN-10
    {
        triggers: [/\bisbn.?10\b/i, /\bisbn\b/i],
        pattern: '\\d{9}[0-9Xx]',
        flags: 'g',
        description: 'Matches ISBN-10 book numbers (9 digits + check digit)',
        example: '0306406152 or 030640615X',
    },
    // Latitude / Longitude
    {
        triggers: [/\bcoordinates?\b/i, /\bgps\b/i, /\blat(?:itude)?.{0,5}lon(?:gitude)?\b/i],
        pattern: '[-+]?(?:[1-8]?\\d(?:\\.\\d+)?|90(?:\\.0+)?)\\s*,\\s*[-+]?(?:1[0-7]\\d(?:\\.\\d+)?|180(?:\\.0+)?|\\d{1,2}(?:\\.\\d+)?)',
        flags: 'g',
        description: 'Matches latitude, longitude coordinate pairs',
        example: '40.7128, -74.0060',
    },
    // Country code (ISO 3166-1 alpha-2)
    {
        triggers: [/\bcountry.?code\b/i, /\biso.?3166\b/i],
        pattern: '\\b[A-Z]{2}\\b',
        flags: 'g',
        description: 'Matches ISO 3166-1 alpha-2 country codes',
        example: 'US, IN, GB',
    },
    // SSN (US Social Security Number)
    {
        triggers: [/\bssn\b/i, /\bsocial.?security\b/i],
        pattern: '\\b(?!000|666|9\\d{2})\\d{3}[\\- ]?(?!00)\\d{2}[\\- ]?(?!0000)\\d{4}\\b',
        flags: 'g',
        description: 'Matches US Social Security Numbers',
        example: '123-45-6789',
    },
    // PAN card (India)
    {
        triggers: [/\bpan.?card\b/i, /\bpan.?number\b/i],
        pattern: '\\b[A-Z]{5}[0-9]{4}[A-Z]\\b',
        flags: 'g',
        description: 'Matches Indian PAN card numbers',
        example: 'ABCDE1234F',
    },
    // Emoji
    {
        triggers: [/\bemoji\b/i, /\bemojis\b/i],
        pattern: '\\p{Emoji_Presentation}',
        flags: 'gu',
        description: 'Matches emoji characters',
        example: '🎉 🔥 ✅',
    },
    // Letters only
    {
        triggers: [/\bletters?\b/i, /\balphabets?\b/i, /\bonly\s+letters?\b/i, /\balpha\s+only\b/i],
        pattern: '[a-zA-Z]+',
        flags: 'g',
        description: 'Matches sequences of letters only (a–z, A–Z)',
        example: 'Hello, World',
    },

    // Lowercase letters
    {
        triggers: [/\blowercase\b/i, /\blower.?case\b/i, /\blower\s+letters?\b/i],
        pattern: '[a-z]+',
        flags: 'g',
        description: 'Matches lowercase letter sequences',
        example: 'hello, world',
    },

    // Uppercase letters
    {
        triggers: [/\buppercase\b/i, /\bupper.?case\b/i, /\bupper\s+letters?\b/i],
        pattern: '[A-Z]+',
        flags: 'g',
        description: 'Matches uppercase letter sequences',
        example: 'HELLO, WORLD',
    },

    // Digits only
    {
        triggers: [/\bdigits?\s+only\b/i, /\bonly\s+digits?\b/i, /\bnumbers?\s+only\b/i, /\bonly\s+numbers?\b/i],
        pattern: '\\d+',
        flags: 'g',
        description: 'Matches digit-only sequences (0–9)',
        example: '12345, 007',
    },

    // Special characters
    {
        triggers: [/\bspecial.?char(?:acter)?s?\b/i, /\bpunctuation\b/i, /\bsymbols?\b/i],
        pattern: '[^a-zA-Z0-9\\s]+',
        flags: 'g',
        description: 'Matches sequences of special characters / symbols',
        example: '!@#$%^&*()',
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
]

// ── Dynamic date-format parser ──────────────────────────────────────────────
// Recognises format tokens inside the description string and builds a regex.
// Supported tokens: YYYY, YY, MM, DD
// Supported separators: - / .
// Examples that match:
//   "Date in DD-MM-YYYY"  →  (?:0[1-9]|[12]\d|3[01])-(?:0[1-9]|1[0-2])-\d{4}
//   "date format MM/DD/YYYY"  →  (?:0[1-9]|1[0-2])/(?:0[1-9]|[12]\d|3[01])/\d{4}
//   "YYYY.MM.DD date"  →  \d{4}\.(?:0[1-9]|1[0-2])\.(?:0[1-9]|[12]\d|3[01])

const DATE_TOKEN_REGEX = /\b((?:YYYY|YY|MM|DD)(?:[\-\/.](YYYY|YY|MM|DD)){1,2})\b/

const DATE_PART_PATTERNS: Record<string, string> = {
    YYYY: '\\d{4}',
    YY: '\\d{2}',
    MM: '(?:0[1-9]|1[0-2])',
    DD: '(?:0[1-9]|[12]\\d|3[01])',
}

function escapeSeparator(sep: string): string {
    if (sep === '.') return '\\.'
    if (sep === '-') return '\\-'
    return sep // '/' needs no escaping in a character class
}

function parseDateFormat(description: string): GeneratedRegex | null {
    const match = DATE_TOKEN_REGEX.exec(description)
    if (!match) return null

    const formatStr = match[1]                          // e.g. "DD-MM-YYYY"
    // Extract the separator (the non-alphanumeric char between tokens)
    const sepMatch = /[^A-Z]/.exec(formatStr)
    const sep = sepMatch ? sepMatch[0] : '-'
    const escapedSep = escapeSeparator(sep)

    const tokens = formatStr.split(sep)                // ["DD", "MM", "YYYY"]
    const valid = tokens.every(t => t in DATE_PART_PATTERNS)
    if (!valid) return null

    const patternParts = tokens.map(t => DATE_PART_PATTERNS[t])
    const pattern = patternParts.join(escapedSep)

    // Build a human-readable example
    const exampleMap: Record<string, string> = { YYYY: '2024', YY: '24', MM: '01', DD: '15' }
    const example = tokens.map(t => exampleMap[t]).join(sep)

    return {
        pattern,
        flags: 'g',
        description: `Matches dates in ${formatStr} format`,
        example,
    }
}
// ────────────────────────────────────────────────────────────────────────────

export function generateRegex(description: string): GeneratedRegex | null {
    const desc = description.trim()
    if (!desc) return null

    // 1. Try to extract an explicit date format from the description first
    const dateResult = parseDateFormat(desc)
    if (dateResult) return dateResult

    // 2. Fall back to keyword-based rules
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
    'Date in DD-MM-YYYY',
    'Hex color code',
    'UUID / GUID',
    'Credit card number',
    'Strong password',
    'ISBN-13',
    'ISBN-10',
]
