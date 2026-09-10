#!/usr/bin/env node
/**
 * scripts/marc-source/Tag.utf8.txt + Indicator.utf8.txt(국립중앙도서관 KORMARC
 * 지시기호·식별기호 정의, I2M 0910에서 받은 원본을 UTF-8로 옮긴 것)를 파싱해
 * src/data/marcSchema.ts를 생성한다.
 *
 * 실행: node scripts/generate-marc-schema.mjs
 *
 * 원본을 갱신했을 때 다시 실행해서 재생성하면 된다 — src/data/marcSchema.ts는
 * 생성물이지만 diff 가능한 텍스트라 그대로 커밋 대상이다(빌드 시 재생성 불필요).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')

function readUtf8(path) {
  // BOM 제거
  return readFileSync(path, 'utf-8').replace(/^﻿/, '')
}

// ── Tag.txt 파싱 ──────────────────────────────────────────────────────────
function parseTagFile(text) {
  // 원본 데이터에 줄바꿈이 빠진 줄이 하나 있다(066: "...¶2$a 도서관부호¶X") —
  // "$글자(:|공백|-)" 모양(=진짜 서브필드 코드 시작)일 때만 그 앞에서 줄을 가른다.
  // "책$권차"처럼 이름 설명 안에 그냥 "$"가 섞여 있는 경우(100 $n 등)는 코드 자리에
  // 한글이 오므로 이 패턴에 안 걸려 건드리지 않는다.
  const subfieldStartRe = /\$(?=[a-zA-Z0-9][:\s-])/g
  const rawLines = text.split(/\r?\n/).flatMap((line) => {
    const cuts = [...line.matchAll(subfieldStartRe)].map((m) => m.index).filter((i) => i > 0)
    if (cuts.length === 0) return [line]
    const bounds = [0, ...cuts, line.length]
    const parts = []
    for (let i = 0; i < bounds.length - 1; i++) parts.push(line.slice(bounds[i], bounds[i + 1]))
    return parts
  })

  const tagLineRe = /^(\d{3})\s+(.+?)¶([OX])¶([123])\s*$/
  // 코드는 항상 영숫자 한 글자, 또는 범위 표기 "a-z"/"0-9"(886 외국 MARC
  // 식별기호) 뿐이다 — \S+로 넓게 잡으면 "$a:외국 MARC..."처럼 콜론 뒤에 공백이
  // 없는 줄에서 "a:외국"까지 코드로 먹어버리는 문제가 있어 정확히 이 모양만 매치한다.
  const subfieldLineRe = /^\$([a-zA-Z0-9](?:-[a-zA-Z0-9])?)[:\s]+(.+?)¶([OX])\s*$/

  /** @type {Map<string, {tag:string,name:string,repeatable:boolean,mandatory:number,subfields:Array<{code:string,name:string,repeatable:boolean}>}>} */
  const tags = new Map()
  let current = null
  const warnings = []

  for (const rawLine of rawLines) {
    const line = rawLine.trim()
    if (!line) continue
    if (line.startsWith('.')) continue // 헤더 설명줄(". TAG 설명...")

    const tagMatch = line.match(tagLineRe)
    if (tagMatch) {
      const [, tag, name, repFlag, mandFlag] = tagMatch
      current = { tag, name: name.trim(), repeatable: repFlag === 'O', mandatory: Number(mandFlag), subfields: [] }
      tags.set(tag, current)
      continue
    }

    const sfMatch = line.match(subfieldLineRe)
    if (sfMatch && current) {
      const [, codeToken, name, repFlag] = sfMatch
      const repeatable = repFlag === 'O'
      for (const code of expandCodeToken(codeToken)) {
        current.subfields.push({ code, name: name.trim(), repeatable })
      }
      continue
    }

    warnings.push(`Tag.txt: 인식 못한 줄 — "${line}"`)
  }

  return { tags, warnings }
}

/** "a" → ["a"], "a-z" → ["a",...,"z"], "0-9" → ["0",...,"9"] */
function expandCodeToken(token) {
  const rangeMatch = token.match(/^([a-z0-9])-([a-z0-9])$/i)
  if (!rangeMatch) return [token]
  const [, from, to] = rangeMatch
  const out = []
  for (let c = from.charCodeAt(0); c <= to.charCodeAt(0); c++) out.push(String.fromCharCode(c))
  return out
}

// ── Indicator.txt 파싱 ────────────────────────────────────────────────────
function parseIndicatorFile(text) {
  const lineRe = /^(\d{3})([12])\s+(.+)$/
  /** @type {Map<string, {1?:{name:string,values:Record<string,string>},2?:{name:string,values:Record<string,string>}}>} */
  const indicators = new Map()
  const warnings = []

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue
    const m = line.match(lineRe)
    if (!m) {
      warnings.push(`Indicator.txt: 인식 못한 줄 — "${line}"`)
      continue
    }
    const [, tag, pos, rest] = m
    const parts = rest.split('¶')
    const name = parts[0].trim()
    /** @type {Record<string,string>} */
    const values = {}
    for (const part of parts.slice(1)) {
      const idx = part.indexOf(':')
      if (idx === -1) {
        warnings.push(`Indicator.txt: 값 항목 형식 이상 — "${part}" (${tag}${pos})`)
        continue
      }
      const code = part.slice(0, idx).trim()
      const meaning = part.slice(idx + 1).trim()
      values[code] = meaning
    }
    if (!indicators.has(tag)) indicators.set(tag, {})
    indicators.get(tag)[pos] = { name, values }
  }

  return { indicators, warnings }
}

// ── 실행 ──────────────────────────────────────────────────────────────────
const tagText = readUtf8(join(repoRoot, 'scripts/marc-source/Tag.utf8.txt'))
const indicatorText = readUtf8(join(repoRoot, 'scripts/marc-source/Indicator.utf8.txt'))

const { tags, warnings: tagWarnings } = parseTagFile(tagText)
const { indicators, warnings: indWarnings } = parseIndicatorFile(indicatorText)

for (const w of [...tagWarnings, ...indWarnings]) console.warn('[generate-marc-schema]', w)

const schema = {}
for (const [tag, entry] of tags) {
  schema[tag] = {
    ...entry,
    indicators: indicators.get(tag) ?? {},
  }
}

const generatedAt = new Date().toISOString().slice(0, 10)
const body = `/**
 * 자동 생성 파일 — 직접 고치지 말 것.
 * scripts/generate-marc-schema.mjs가 scripts/marc-source/Tag.utf8.txt +
 * Indicator.utf8.txt(국립중앙도서관 KORMARC 지시기호·식별기호 정의)로부터 생성했다.
 * 원본이 바뀌면 "node scripts/generate-marc-schema.mjs"로 재생성한다.
 * (생성일: ${generatedAt})
 */

export interface MarcSubfieldMeta {
  code: string
  name: string
  repeatable: boolean
}

export interface MarcIndicatorMeta {
  /** 지시기호 이름(예: "발행사항의 순차"). */
  name: string
  /** 값 문자('0'-'9' 또는 공백을 뜻하는 'b') → 의미. */
  values: Record<string, string>
}

export interface MarcTagMeta {
  tag: string
  name: string
  repeatable: boolean
  mandatory: 1 | 2 | 3
  subfields: MarcSubfieldMeta[]
  indicators: Partial<Record<1 | 2, MarcIndicatorMeta>>
}

export const MARC_SCHEMA: Record<string, MarcTagMeta> = ${JSON.stringify(schema, null, 2)}
`

const outPath = join(repoRoot, 'src/data/marcSchema.ts')
writeFileSync(outPath, body, 'utf-8')
console.log(`written: ${outPath} (${Object.keys(schema).length} tags, ${tagWarnings.length + indWarnings.length} warnings)`)
