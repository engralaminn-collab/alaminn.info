import fs from 'fs'
import { createClient } from '@libsql/client'

const dbPath = 'prisma/dev.db'
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath)
}

const schema = fs.readFileSync('prisma/schema.prisma', 'utf8')
const lines = schema.split('\n')

const statements: string[] = []
let currentModel: string | null = null
let currentColumns: string[] = []
let currentIndices: string[][] = []

for (let rawLine of lines) {
  const line = rawLine.trim()
  if (!line || line.startsWith('//')) continue

  if (!currentModel) {
    const modelMatch = line.match(/^model\s+(\w+)\s*\{/)
    if (modelMatch) {
      currentModel = modelMatch[1]
      currentColumns = []
      currentIndices = []
    }
    continue
  }

  if (line === '}') {
    // Model ended
    const ddl = `CREATE TABLE IF NOT EXISTS "${currentModel}" (\n  ${currentColumns.join(',\n  ')}\n);`
    statements.push(ddl)
    for (const idx of currentIndices) {
      const fields = idx.map((f) => `"${f}"`).join(', ')
      const idxName = `idx_${currentModel}_${idx.join('_')}`
      statements.push(`CREATE INDEX IF NOT EXISTS "${idxName}" ON "${currentModel}" (${fields});`)
    }
    currentModel = null
    continue
  }

  if (line.startsWith('@@index')) {
    const idxFields = line.match(/@@index\(\[([^\]]+)\]\)/)
    if (idxFields) {
      currentIndices.push(idxFields[1].split(',').map((f) => f.trim()))
    }
    continue
  }
  if (line.startsWith('@@unique')) {
    const uqFields = line.match(/@@unique\(\[([^\]]+)\]\)/)
    if (uqFields) {
      currentIndices.push(uqFields[1].split(',').map((f) => f.trim()))
    }
    continue
  }

  // Column line
  // Strip inline comments first
  const cleanLine = line.replace(/\/\/.*$/, '').trim()
  const parts = cleanLine.split(/\s+/)
  if (parts.length < 2) continue

  const colName = parts[0]
  const colType = parts[1]

  const isOptional = colType.endsWith('?')
  const cleanType = colType.replace('?', '').replace('[]', '')

  const isRelation = /^[A-Z]/.test(cleanType) && !['String', 'Int', 'Float', 'Boolean', 'DateTime', 'Json'].includes(cleanType)
  if (isRelation || colType.endsWith('[]')) continue

  let sqlType = 'TEXT'
  if (cleanType === 'Int') sqlType = 'INTEGER'
  else if (cleanType === 'Float') sqlType = 'REAL'
  else if (cleanType === 'Boolean') sqlType = 'BOOLEAN'
  else if (cleanType === 'DateTime') sqlType = 'DATETIME'
  else if (cleanType === 'Json') sqlType = 'TEXT'

  const constraints: string[] = []
  if (cleanLine.includes('@id')) {
    constraints.push('PRIMARY KEY')
  }
  if (cleanLine.includes('@unique')) {
    constraints.push('UNIQUE')
  }
  if (!isOptional && !cleanLine.includes('@id')) {
    constraints.push('NOT NULL')
  }
  if (cleanLine.includes('@default(')) {
    const defMatch = cleanLine.match(/@default\(([^)]*)\)/)
    if (defMatch) {
      let defVal = defMatch[1].trim()
      if (defVal === 'now()') defVal = 'CURRENT_TIMESTAMP'
      else if (defVal === 'cuid()' || defVal === 'uuid()' || defVal === 'autoincrement()') defVal = ''
      else if (defVal.startsWith('"') || defVal.startsWith("'") || defVal === 'true' || defVal === 'false' || !isNaN(Number(defVal))) {
        // valid literal
      } else {
        defVal = ''
      }

      if (defVal) {
        constraints.push(`DEFAULT ${defVal}`)
      }
    }
  }

  currentColumns.push(`"${colName}" ${sqlType} ${constraints.join(' ')}`.trim())
}

const client = createClient({ url: 'file:prisma/dev.db' })

async function init() {
  for (const stmt of statements) {
    try {
      await client.execute(stmt)
    } catch (e: any) {
      console.error('DDL error:', e.message, stmt)
    }
  }
  console.log(`Created all ${statements.length} table and index statements successfully!`)
}

init().catch(console.error)
