// Natural Language → SQL parser (pattern-based, offline)
export interface NLResult {
  sql: string
  notes: string[]
  confidence: 'high' | 'medium' | 'low'
}

// Filler words that should be ignored when parsing identifiers
const FILLERS = new Set(['me', 'my', 'the', 'a', 'an', 'all', 'some'])

/** Strip leading filler words from a raw token string */
function stripLeadingFillers(raw: string): string {
  return raw
    .split(/\s+/)
    .reduce((acc, word, i, arr) => {
      if (acc.length === 0 && FILLERS.has(word.toLowerCase())) return acc
      acc.push(word)
      return acc
    }, [] as string[])
    .join(' ')
    .trim()
}

// Generic words that signal "give me everything" → map to SELECT *
const WILDCARD_WORDS = new Set([
  'information', 'info', 'details', 'detail', 'data',
  'records', 'record', 'everything', 'all', 'fields'
])

// Prepositions that indicate a column segment is a context qualifier, not a real column list
const CONTEXT_PREPS = /\b(?:for|about|regarding|on|of)\b/i

/**
 * Parse a natural-language column list like:
 *   "me the first name and email"       → "first_name, email"
 *   "all information for products"      → "*"  (wildcard)
 *   "id, name and age"                  → "id, name, age"
 *   "first_name, last_name, email"      → "first_name, last_name, email"
 */
function parseColumns(raw: string): string {
  const stripped = stripLeadingFillers(raw)

  // If a context preposition appears, take only the portion BEFORE it.
  // e.g. "title and publication year of the 5 oldest books" → "title and publication year"
  // e.g. "information for products" → "information" → wildcard
  let effective = stripped
  if (CONTEXT_PREPS.test(stripped)) {
    effective = stripped.split(CONTEXT_PREPS)[0].trim()
    if (!effective) return '*'
  }

  // Strip trailing filler/noise words (each, every, the)
  effective = effective.replace(/\b(?:each|every|the)\s+/gi, '').trim()

  // Split on commas or the word "and"
  const parts = effective.split(/\s*,\s*|\s+and\s+/i).map(p => p.trim()).filter(Boolean)

  // If any part is a generic wildcard word, return *
  if (!parts.length || parts.some(p => WILDCARD_WORDS.has(p.toLowerCase()))) return '*'

  // For each part: if it contains spaces it's a multi-word name → join with underscores
  const cols = parts.map(p => {
    const words = p.split(/\s+/)
    return words.length > 1 ? words.join('_').toLowerCase() : p
  })

  return cols.join(', ')
}

/** Strip currency symbols and normalise a numeric value token */
function normNum(v: string): string {
  return v.replace(/^[$£€¥]/, '')
}

/** Month name → zero-padded number */
const MONTHS: Record<string, string> = {
  january:'01', february:'02', march:'03', april:'04', may:'05', june:'06',
  july:'07', august:'08', september:'09', october:'10', november:'11', december:'12',
  jan:'01', feb:'02', mar:'03', apr:'04', jun:'06', jul:'07',
  aug:'08', sep:'09', oct:'10', nov:'11', dec:'12'
}

/**
 * Convert a natural-language date string to SQL 'YYYY-MM-DD'.
 * Handles:
 *   "January 1st, 2026"  →  '2026-01-01'
 *   "1 Jan 2026"         →  '2026-01-01'
 *   "2026-01-01"         →  '2026-01-01'  (pass-through)
 *   "01/01/2026"         →  '2026-01-01'
 */
function parseNLDate(raw: string): string {
  const s = raw.trim().replace(/[.,]+$/, '') // strip trailing punctuation
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `'${s}'`
  // MM/DD/YYYY
  const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slash) return `'${slash[3]}-${slash[1].padStart(2,'0')}-${slash[2].padStart(2,'0')}'`
  // "Month Day, Year"  e.g. January 1st, 2026
  const mdy = s.match(/^([a-zA-Z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/i)
  if (mdy) {
    const mo = MONTHS[mdy[1].toLowerCase()]
    if (mo) return `'${mdy[3]}-${mo}-${mdy[2].padStart(2,'0')}'`
  }
  // "Day Month Year"  e.g. 1st January 2026
  const dmy = s.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+),?\s+(\d{4})$/i)
  if (dmy) {
    const mo = MONTHS[dmy[2].toLowerCase()]
    if (mo) return `'${dmy[3]}-${mo}-${dmy[1].padStart(2,'0')}'`
  }
  // "Month Year" e.g. May 2026
  const my = s.match(/^([a-zA-Z]+)\s+(\d{4})$/i)
  if (my) {
    const mo = MONTHS[my[1].toLowerCase()]
    if (mo) return `'${my[2]}-${mo}-01'`
  }
  // Fallback: wrap as-is
  return `'${s}'`
}

// SQL keywords that must NOT be joined into multi-word column names
const WHERE_KEYWORDS = new Set([
  'the','a','an','where','and','or','not','is','in','between','like','null','true','false'
])

/** Date-like pattern: captures "Month Day Year", "Day Month Year", ISO, or MM/DD/YYYY */
const DATE_PAT = /[\w]+(?:\s+[\w,]+){1,3}/

function parseWhere(w: string): string {
  return w
    // Strip trailing punctuation from the whole clause first
    .replace(/[.!?]+$/, '')
    // Strip leading "the " before a column reference
    .replace(/\bthe\s+([a-zA-Z_]\w*)/g, '$1')
    // Join adjacent words that form a multi-word column name before a comparison
    // e.g. "stock level is" → "stock_level is"
    .replace(/\b([a-zA-Z_]\w*)\s+([a-zA-Z_]\w*)\s+(is\b|>=|<=|>|<|=|!=)/gi, (full, w1, w2, op) =>
      WHERE_KEYWORDS.has(w1.toLowerCase()) || WHERE_KEYWORDS.has(w2.toLowerCase())
        ? full
        : `${w1}_${w2} ${op}`
    )
    // "N or less" / "N or more" — must come BEFORE the generic or→OR replacement
    .replace(/\bis\s+[$£€¥]?(\d+(?:\.\d+)?)\s+or\s+less\b/gi, '<= $1')
    .replace(/\bis\s+[$£€¥]?(\d+(?:\.\d+)?)\s+or\s+more\b/gi, '>= $1')
    .replace(/\b[$£€¥]?(\d+(?:\.\d+)?)\s+or\s+less\b/gi, '<= $1')
    .replace(/\b[$£€¥]?(\d+(?:\.\d+)?)\s+or\s+more\b/gi, '>= $1')
    // Date comparison operators (before numeric comparisons to avoid interference)
    .replace(/\bis\s+(?:on\s+or\s+after|after\s+or\s+on)\s+([\w][\w\s,.\/\-]+?)(?=\s+(?:AND|OR)\b|$)/gi,
      (_, d) => `>= ${parseNLDate(d)}`)
    .replace(/\bis\s+(?:on\s+or\s+before|before\s+or\s+on)\s+([\w][\w\s,.\/\-]+?)(?=\s+(?:AND|OR)\b|$)/gi,
      (_, d) => `<= ${parseNLDate(d)}`)
    .replace(/\bis\s+after\s+([\w][\w\s,.\/\-]+?)(?=\s+(?:AND|OR)\b|$)/gi,
      (_, d) => `> ${parseNLDate(d)}`)
    .replace(/\bis\s+before\s+([\w][\w\s,.\/\-]+?)(?=\s+(?:AND|OR)\b|$)/gi,
      (_, d) => `< ${parseNLDate(d)}`)
    .replace(/\bis\s+on\s+([\w][\w\s,.\/\-]+?)(?=\s+(?:AND|OR)\b|$)/gi,
      (_, d) => `= ${parseNLDate(d)}`)
    .replace(/\bis\s+(?:greater\s+than\s+or\s+equal\s+to|at\s+least)\s+[$£€¥]?(\d+(?:\.\d+)?)/gi, '>= $1')
    .replace(/\bis\s+(?:less\s+than\s+or\s+equal\s+to|at\s+most|no\s+more\s+than)\s+[$£€¥]?(\d+(?:\.\d+)?)/gi, '<= $1')
    .replace(/\bis\s+(?:greater\s+than|more\s+than)\s+[$£€¥]?(\d+(?:\.\d+)?)/gi, '> $1')
    .replace(/\bis\s+less\s+than\s+[$£€¥]?(\d+(?:\.\d+)?)/gi, '< $1')
    .replace(/\bis\s+(?:not\s+equal\s+to|not)\s+[$£€¥]?(\d+(?:\.\d+)?)/gi, '!= $1')
    .replace(/\bis\s+(?:equal\s+to|exactly)\s+[$£€¥]?(\d+(?:\.\d+)?)/gi, '= $1')
    // Bare comparison phrases without leading 'is'
    .replace(/\bgreater\s+than\s+or\s+equal\s+to\s+[$£€¥]?(\d+(?:\.\d+)?)/gi, '>= $1')
    .replace(/\bless\s+than\s+or\s+equal\s+to\s+[$£€¥]?(\d+(?:\.\d+)?)/gi, '<= $1')
    .replace(/\b(?:greater\s+than|more\s+than)\s+[$£€¥]?(\d+(?:\.\d+)?)/gi, '> $1')
    .replace(/\bless\s+than\s+[$£€¥]?(\d+(?:\.\d+)?)/gi, '< $1')
    .replace(/\bnot\s+equal\s+to\s+[$£€¥]?(\d+(?:\.\d+)?)/gi, '!= $1')
    .replace(/\b([a-zA-Z_]\w*)\s+in\s+([a-zA-Z]+\s+\d{4})\b/i, (_, col, d) => `${col} = ${parseNLDate(d)}`)
    // "is 'value'" or `is "value"` → = 'value'
    .replace(/\bis\s+('([^']*)'|"([^"]*)")/gi, (_, quoted) => `= ${quoted}`)
    // "is not 'value'" → != 'value'
    .replace(/\bis\s+not\s+('([^']*)'|"([^"]*)")/gi, (_, quoted) => `!= ${quoted}`)
    .replace(/\bis true\b/gi, '= TRUE')
    .replace(/\bis false\b/gi, '= FALSE')
    .replace(/\bis null\b/gi, 'IS NULL')
    .replace(/\bis not null\b/gi, 'IS NOT NULL')
    .replace(/contains?\s+['"]?([^'"]+)['"]?/gi, "LIKE '%$1%'")
    .replace(/starts? with\s+['"]?([^'"]+)['"]?/gi, "LIKE '$1%'")
    .replace(/ends? with\s+['"]?([^'"]+)['"]?/gi, "LIKE '%$1'")
    .replace(/\band\b/gi, 'AND').replace(/\bor\b/gi, 'OR')
    .replace(/(\w+)\s*(=|!=)\s*([a-zA-Z]\w*)(?!\s*['"])/g, (_, f, op, val) =>
      ['true','false','null'].includes(val.toLowerCase()) ? `${f} ${op} ${val.toUpperCase()}` : `${f} ${op} '${val}'`
    )
}

/**
 * Extract the primary table name.
 * Handles:
 *   "from customers"              → "customers"
 *   "from the customers table"    → "customers"
 *   "in the library table"        → "library"   (no FROM keyword)
 */
function extractTable(s: string): string {
  // Primary: "from [the] X [table]"
  const fromM = s.match(/\bfrom\s+(?:(?:the|a|an)\s+)?([a-zA-Z_][\w.]*)\s*(?:table\b)?/i)
  if (fromM && !FILLERS.has(fromM[1].toLowerCase())) return fromM[1]
  // Fallback: "in [the] X table" (queries without FROM keyword)
  const inM = s.match(/\bin\s+(?:(?:the|a|an)\s+)?([a-zA-Z_][\w.]*)\s+table\b/i)
  if (inM && !FILLERS.has(inM[1].toLowerCase())) return inM[1]
  return ''
}

export function nlToSQL(input: string): NLResult {
  const s = input.trim()
  const lower = s.toLowerCase()
  const notes: string[] = []

  // ── Table ────────────────────────────────────────────────────────────────
  let table = extractTable(s)
  let afterTable = ''
  if (!table) {
    // Fallback: verb at start, then (optional fillers), then identifier
    const m = s.match(/(?:get|show|list|find|fetch|select|count)\s+(?:(?:how\s+many|all|the|a|an|me|my|distinct)\s+)*([a-zA-Z_]\w*)(.*)/i)
    if (m && !FILLERS.has(m[1].toLowerCase()) && !['distinct'].includes(m[1].toLowerCase())) {
      table = m[1]
      afterTable = m[2].trim()
      notes.push(`Inferred table: "${table}"`)
    }
  }
  if (!table) return { sql: '', notes: ['Could not detect table name. Try: "show all users" or "select id from orders"'], confidence: 'low' }

  // ── Aggregate ────────────────────────────────────────────────────────────
  // Only treat as aggregate when there is clear aggregation intent:
  //   • explicit "sum of X" / "count of X" (has "of")
  //   • OR the keyword stands alone, not sandwiched between column-list words
  //     (i.e., not followed immediately by another noun that is part of a column list)
  //   • "total" alone at end-of-clause (e.g. "show total") is OK, but
  //     "total amount" inside a column list is NOT.
  let aggFunc = '', aggCol = '*', groupBy = ''

  // "count/find the (total) number/amount/quantity of X" → COUNT(x)
  // Must run FIRST so it can override the more generic matchers below
  // Captures the noun phrase after "number/count/amount/quantity of", stopping before "from"/"where"
  const AGG_NUMBER_OF = /\b(?:count|find|get|show)\s+(?:how\s+many|(?:the\s+)?(?:total\s+)?(?:number|count|amount|quantity)\s+of)\s+(\w[\w ]*?)(?=\s+(?:from|where|that|who|which|were|was|are|is)\b|$)/i
  const numOfM = s.match(AGG_NUMBER_OF)
  if (numOfM) {
    aggFunc = 'COUNT'
    // Normalize the captured noun phrase: lowercase, underscore-join, simple de-pluralize last word
    const words = numOfM[1].trim().toLowerCase().split(/\s+/)
    const last = words[words.length - 1]
    if (last.endsWith('s') && !last.endsWith('ss') && last.length > 2) words[words.length - 1] = last.slice(0, -1)
    aggCol = words.join('_')
  }
  
  if (aggCol === table) aggCol = '*'

  // "each X and the avg/sum/count/min/max (of) Y" → GROUP BY X, AGG(Y)
  // Must run BEFORE AGG_STANDALONE so "average" isn't claimed as AVG(*) first
  // e.g. "each product category and the average price of items" → GROUP BY product_category, AVG(price)
  if (!aggFunc) {
    const eachM = s.match(/\beach\s+([\w][\w\s]*?)\s+and(?:\s+the)?\s+(average|avg|sum|count|min|max)\s+(?:of\s+)?([a-zA-Z_]\w*)/i)
    if (eachM) {
      groupBy = eachM[1].trim().toLowerCase().split(/\s+/).join('_')
      const fn = eachM[2].toLowerCase()
      aggFunc = fn === 'average' || fn === 'avg' ? 'AVG' : fn === 'sum' ? 'SUM' : fn.toUpperCase()
      aggCol = eachM[3]
    }
  }

  const AGG_EXPLICIT = /\b(count|sum|average|avg|min|max)\s+of\s+([a-zA-Z_]\w*)/i
  const AGG_STANDALONE = /\b(count|sum|average|avg|min|max)\b(?!\s+\w+\s+(?:and|,|from))/i
  const AGG_TOTAL = /\btotal\s+of\s+([a-zA-Z_]\w*)/i  // "total of revenue"
  let aggM = !aggFunc ? s.match(AGG_EXPLICIT) : null
  if (!aggM && !aggFunc) aggM = s.match(AGG_STANDALONE)
  const totalM = !aggFunc ? s.match(AGG_TOTAL) : null
  if (totalM) {
    aggFunc = 'SUM'; aggCol = totalM[1]
  } else if (aggM) {
    const fn = aggM[1].toLowerCase()
    aggFunc = fn === 'average' || fn === 'avg' ? 'AVG' : fn === 'sum' ? 'SUM' : fn.toUpperCase()
    aggCol = aggM[2] || '*'
  }

  // ── GROUP BY ─────────────────────────────────────────────────────────────
  const gbM = s.match(/\bgroup(?:ed)?\s+by\s+([a-zA-Z_][\w,\s]*?)(?:\s+(?:having|order|limit|where)|$)/i)
  if (gbM) {
    groupBy = gbM[1].trim()
    if (!aggFunc) { aggFunc = 'COUNT'; aggCol = '*' }
  }
  // "count X by Y" shorthand
  const cbM = s.match(/\bcount\s+([a-zA-Z_]\w*)\s+by\s+([a-zA-Z_]\w*)/i)
  if (cbM) { if (!table || table === cbM[1]) table = cbM[1]; groupBy = cbM[2]; aggFunc = 'COUNT'; aggCol = '*' }

  // ── Columns (explicit) ───────────────────────────────────────────────────
  let columns = ''
  // Try "VERB cols FROM" first, then fall back to "VERB cols in the X table"
  const colM = s.match(/(?:select|get|show|fetch)\s+([\w,\s.'"-]+?)\s+(?:from|in)\b/i)
  if (colM) {
    const raw = colM[1].trim()
    const cleaned = parseColumns(raw)
    if (cleaned && !['*', 'everything'].includes(cleaned.toLowerCase())) {
      columns = cleaned
    }
  }

  // ── DISTINCT ─────────────────────────────────────────────────────────────
  const distinct = /\bdistinct\b|\bunique\b/i.test(lower)

  // ── WHERE ────────────────────────────────────────────────────────────────
  let whereRaw = (s.match(/\b(?:where|that|who|which)\s+(.+?)(?:\s+(?:order\s+by|group\s+by|having|limit)|$)/i) || [])[1] || ''
  
  if (!whereRaw && afterTable) {
    let trailing = afterTable.split(/\b(?:order\s+by|group\s+by|having|limit)\b/i)[0].trim()
    if (trailing) {
        whereRaw = trailing
    }
  }
  whereRaw = whereRaw.replace(/^(?:were|was|are|is)\s+/i, '')
  
  const whereClause = whereRaw ? parseWhere(whereRaw) : ''

  // ── HAVING ───────────────────────────────────────────────────────────────
  const havingRaw = (s.match(/\bhaving\s+(.+?)(?:\s+(?:order\s+by|limit)|$)/i) || [])[1] || ''

  // ── ORDER BY ─────────────────────────────────────────────────────────────
  // Standard "order by X" or "sort by X"
  const ordM = s.match(/\b(?:order(?:ed)?|sort(?:ed)?)\s+by\s+([a-zA-Z_]\w*)\s*(asc|desc)?/i)
  // "from highest X to lowest" / "from lowest X to highest"
  const highLowM = s.match(/\b(?:highest|largest|biggest)\s+([a-zA-Z_]\w*)\s+to\s+(?:the\s+)?(?:lowest|smallest)/i)
  const lowHighM = s.match(/\b(?:lowest|smallest)\s+([a-zA-Z_]\w*)\s+to\s+(?:the\s+)?(?:highest|largest)/i)
  // "sort (them) from (the) highest X to (the) lowest"
  const sortHighM = s.match(/\bsort(?:\s+\w+)?\s+from\s+(?:the\s+)?(?:highest|largest)\s+([a-zA-Z_]\w*)\s+to\s+(?:the\s+)?(?:lowest|smallest)/i)
  const sortLowM  = s.match(/\bsort(?:\s+\w+)?\s+from\s+(?:the\s+)?(?:lowest|smallest)\s+([a-zA-Z_]\w*)\s+to\s+(?:the\s+)?(?:highest|largest)/i)

  let orderBy = ''
  if (sortHighM)     orderBy = `${sortHighM[1]} DESC`
  else if (sortLowM) orderBy = `${sortLowM[1]} ASC`
  else if (highLowM) orderBy = `${highLowM[1]} DESC`
  else if (lowHighM) orderBy = `${lowHighM[1]} ASC`
  else if (ordM)     orderBy = `${ordM[1]} ${(ordM[2] || 'ASC').toUpperCase()}`

  // "N oldest/earliest" → ORDER BY <date-col> ASC  LIMIT N
  // "N newest/latest"   → ORDER BY <date-col> DESC LIMIT N
  const oldestM = s.match(/\b(\d+)\s+(?:oldest|earliest|first)\b/i)
  const newestM = s.match(/\b(\d+)\s+(?:newest|latest|most\s+recent)\b/i)

  // "top N by field" → LIMIT + ORDER
  const topByM = s.match(/\btop\s+(\d+)\s+(?:by\s+([a-zA-Z_]\w*)\s*(asc|desc)?)?/i)
  const limitM = s.match(/\blimit\s+(\d+)\b/i) || s.match(/\bfirst\s+(\d+)\b/i)
  let limit = topByM?.[1] || limitM?.[1] || ''
  const topOrder = topByM?.[2] ? `${topByM[2]} ${(topByM[3] || 'DESC').toUpperCase()}` : ''

  if (oldestM && !orderBy) {
    limit = limit || oldestM[1]
    // Pick the most date-like column from the extracted column list, or fallback note
    const dateLike = (columns || '').split(',').map(c => c.trim())
      .find(c => /year|date|time|created|updated|since|at$/i.test(c))
    orderBy = dateLike ? `${dateLike} ASC` : ''
    if (!dateLike) notes.push('Add ORDER BY <date_column> ASC for oldest-first ordering')
  }
  if (newestM && !orderBy) {
    limit = limit || newestM[1]
    const dateLike = (columns || '').split(',').map(c => c.trim())
      .find(c => /year|date|time|created|updated|since|at$/i.test(c))
    orderBy = dateLike ? `${dateLike} DESC` : ''
    if (!dateLike) notes.push('Add ORDER BY <date_column> DESC for newest-first ordering')
  }

  // ── Build SELECT clause ───────────────────────────────────────────────────
  let sel: string
  if (aggFunc) {
    // Alias: COUNT(*) → total, COUNT(col) → col_count, SUM(col) → sum_col, etc.
    const alias = aggFunc === 'COUNT'
      ? (aggCol === '*' ? 'total' : `${aggCol}_count`)
      : `${aggFunc.toLowerCase()}_${aggCol === '*' ? 'total' : aggCol}`
    const agg = `${aggFunc}(${aggCol}) AS ${alias}`
    sel = groupBy ? `${groupBy}, ${agg}` : agg
  } else {
    sel = columns || (distinct ? 'DISTINCT *' : '*')
    if (distinct && columns) sel = 'DISTINCT ' + sel
  }

  const finalOrder = orderBy || topOrder

  // ── JOIN detection ───────────────────────────────────────────────────────
  // "from TABLE1 ... from TABLE2 ... matching/joined on (shared) FIELD"
  const joinM = s.match(
    /from\s+(?:the\s+)?(\w+)(?:\s+table)?(?:.|\n)+?from\s+(?:the\s+)?(\w+)(?:\s+table)?(?:.|\n)*?(?:matching|joining|joined?|by\s+matching)\s+(?:(?:them|it|results?)\s+)?on\s+(?:their\s+shared\s+|the\s+shared\s+|their\s+|the\s+)?([\w][\w\s]*?)(?:\s+column|\s*[.,]|\s*$)/i
  )
  let joinClause = ''
  if (joinM && joinM[2] && joinM[2].toLowerCase() !== table.toLowerCase()) {
    const t2 = joinM[2]
    const joinField = joinM[3].trim().toLowerCase().split(/\s+/).join('_')
    joinClause = ` JOIN ${t2} ON ${table}.${joinField} = ${t2}.${joinField}`
  }

  let sql = `SELECT ${sel} FROM ${table}${joinClause}`
  if (whereClause) sql += ` WHERE ${whereClause}`
  if (groupBy) sql += ` GROUP BY ${groupBy}`
  if (havingRaw) sql += ` HAVING ${parseWhere(havingRaw)}`
  if (finalOrder) sql += ` ORDER BY ${finalOrder}`
  if (limit) sql += ` LIMIT ${limit}`

  const confidence: NLResult['confidence'] = (whereClause || groupBy || finalOrder || aggFunc || joinClause) ? 'high' : 'medium'
  return { sql, notes, confidence }
}
