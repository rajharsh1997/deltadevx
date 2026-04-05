import * as jsondiffpatch from 'jsondiffpatch'

const differ = jsondiffpatch.create({
    objectHash: (obj: object, index?: number) => {
        const o = obj as Record<string, unknown>
        return String(o?.id ?? o?.name ?? o?.key ?? `$$index:${index ?? 0}`)
    },
    arrays: {
        detectMove: true,
    },
})

export interface DiffLine {
    lineNum: number
    content: string
    type: 'unchanged' | 'added' | 'removed' | 'empty'
}

export interface DiffResult {
    leftLines: DiffLine[]
    rightLines: DiffLine[]
    hasDiff: boolean
}

/**
 * Format raw JSON string to pretty-printed JSON.
 */
export function formatJSON(raw: string): { formatted: string; error?: string } {
    try {
        const parsed = JSON.parse(raw)
        return { formatted: JSON.stringify(parsed, null, 2) }
    } catch (e) {
        return { formatted: raw, error: (e as Error).message }
    }
}

/**
 * Parse a JSON string. Returns parsed object or throws with a friendly message.
 */
function parseJSON(raw: string): unknown {
    try {
        return JSON.parse(raw)
    } catch (e) {
        throw new Error(`Invalid JSON: ${(e as Error).message}`)
    }
}

/**
 * Build a side-by-side line diff from two formatted JSON strings.
 * Returns parallel arrays of DiffLine objects for A (left) and B (right).
 */
export function computeDiff(rawA: string, rawB: string): DiffResult {
    const parsedA = parseJSON(rawA)
    const parsedB = parseJSON(rawB)

    // Get formatted versions for line-by-line comparison
    const linesA = JSON.stringify(parsedA, null, 2).split('\n')
    const linesB = JSON.stringify(parsedB, null, 2).split('\n')

    // Use jsondiffpatch to detect structural differences
    const delta = differ.diff(parsedA, parsedB)
    const hasDiff = delta !== undefined

    // Build line-level diff using LCS approach
    const result = buildSideBySideDiff(linesA, linesB)

    return { ...result, hasDiff }
}

/**
 * Simple LCS-based line differ to produce side-by-side panels.
 */
function buildSideBySideDiff(
    linesA: string[],
    linesB: string[]
): { leftLines: DiffLine[]; rightLines: DiffLine[] } {
    // LCS table
    const m = linesA.length
    const n = linesB.length
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (linesA[i - 1] === linesB[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
            }
        }
    }

    // Trace back LCS
    type Op = { type: 'same' | 'removed' | 'added'; lineA?: string; lineB?: string }
    const ops: Op[] = []
    let i = m,
        j = n
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
            ops.push({ type: 'same', lineA: linesA[i - 1], lineB: linesB[j - 1] })
            i--
            j--
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            ops.push({ type: 'added', lineB: linesB[j - 1] })
            j--
        } else {
            ops.push({ type: 'removed', lineA: linesA[i - 1] })
            i--
        }
    }
    ops.reverse()

    const leftLines: DiffLine[] = []
    const rightLines: DiffLine[] = []

    let leftNum = 1
    let rightNum = 1

    for (const op of ops) {
        if (op.type === 'same') {
            leftLines.push({ lineNum: leftNum++, content: op.lineA!, type: 'unchanged' })
            rightLines.push({ lineNum: rightNum++, content: op.lineB!, type: 'unchanged' })
        } else if (op.type === 'removed') {
            leftLines.push({ lineNum: leftNum++, content: op.lineA!, type: 'removed' })
            rightLines.push({ lineNum: 0, content: '', type: 'empty' })
        } else {
            leftLines.push({ lineNum: 0, content: '', type: 'empty' })
            rightLines.push({ lineNum: rightNum++, content: op.lineB!, type: 'added' })
        }
    }

    return { leftLines, rightLines }
}
