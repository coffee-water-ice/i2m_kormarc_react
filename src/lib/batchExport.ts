/**
 * "일괄 저장" — 이번 배치로 만들어진 레코드 전체를 MRC 파일 1개(레코드 여러 개가
 * 이어붙은 표준 다중 레코드 MARC 파일) + ISBN 개수만큼의 MRK 파일로 내보낸다.
 *
 * MRC 1개로 합치는 방법: 새 백엔드 엔드포인트를 만들지 않고, 기존 /api/mrk-to-marc를
 * 레코드마다 호출해서 받은 바이트(pymarc.Record.as_marc() 결과 — 레코드 하나짜리
 * 완전히 독립적인 바이트열로 자체 리더·디렉터리·0x1D 종단을 갖는다)를 그대로 이어
 * 붙인다. pymarc 자신도 여러 레코드를 파일로 쓸 때 이렇게 이어 붙이므로(각 레코드가
 * 자기 완결적이라 별도 구분자가 필요 없음) 안전하다.
 *
 * 저장 방식은 두 갈래: Chromium 계열의 File System Access API(showDirectoryPicker)가
 * 있으면 실제로 폴더를 골라 그 안에 파일들을 쓴다("저장소를 선택하면 폴더에 저장"
 * 요구사항 그대로). 없는 브라우저(Firefox/Safari 등)는 같은 파일들을 zip 하나로
 * 묶어 기존 Blob+앵커 다운로드 패턴으로 대체한다 — 아무 브라우저에서도 최소한
 * "파일은 받을 수 있게" 보장하기 위함.
 */
import JSZip from 'jszip'
import { mrkToMarc } from '../api/client'
import { serializeRecord, serializeRecordForMarcExport } from './mrk'
import type { HistoryRecord } from '../types/history'

export interface BatchExportResult {
  ok: boolean
  mode: 'directory' | 'zip' | 'cancelled' | 'error'
  savedCount: number
  failedIsbns: string[]
  error?: string
}

function timestampLabel(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

interface BuiltFiles {
  mrcName: string
  mrcBytes: Uint8Array
  mrkFiles: { name: string; text: string }[]
  failedIsbns: string[]
}

async function buildFiles(records: HistoryRecord[]): Promise<BuiltFiles> {
  const mrcChunks: Uint8Array[] = []
  const mrkFiles: { name: string; text: string }[] = []
  const failedIsbns: string[] = []

  for (const rec of records) {
    const result = await mrkToMarc(serializeRecordForMarcExport(rec.fields))
    if (!result.marcBytesB64) {
      failedIsbns.push(rec.isbn)
      continue
    }
    mrcChunks.push(base64ToBytes(result.marcBytesB64))
    mrkFiles.push({ name: `${rec.isbn}.mrk`, text: serializeRecord(rec.fields) })
  }

  const totalLen = mrcChunks.reduce((sum, c) => sum + c.length, 0)
  const mrcBytes = new Uint8Array(totalLen)
  let offset = 0
  for (const chunk of mrcChunks) {
    mrcBytes.set(chunk, offset)
    offset += chunk.length
  }

  return { mrcName: `일괄변환_${timestampLabel()}.mrc`, mrcBytes, mrkFiles, failedIsbns }
}

async function saveViaDirectoryPicker(files: BuiltFiles): Promise<BatchExportResult> {
  // showDirectoryPicker는 표준 lib.dom.d.ts에 아직 없어서(브라우저별 지원차) any로 접근.
  const picker = (window as unknown as { showDirectoryPicker?: () => Promise<FileSystemDirectoryHandleLike> })
    .showDirectoryPicker
  if (!picker) throw new Error('showDirectoryPicker 미지원')

  const dirHandle = await picker()

  const mrcHandle = await dirHandle.getFileHandle(files.mrcName, { create: true })
  const mrcWritable = await mrcHandle.createWritable()
  await mrcWritable.write(files.mrcBytes)
  await mrcWritable.close()

  for (const f of files.mrkFiles) {
    const handle = await dirHandle.getFileHandle(f.name, { create: true })
    const writable = await handle.createWritable()
    await writable.write(f.text)
    await writable.close()
  }

  return { ok: true, mode: 'directory', savedCount: files.mrkFiles.length, failedIsbns: files.failedIsbns }
}

async function saveViaZipDownload(files: BuiltFiles): Promise<BatchExportResult> {
  const zip = new JSZip()
  zip.file(files.mrcName, files.mrcBytes)
  for (const f of files.mrkFiles) zip.file(f.name, f.text)
  const blob = await zip.generateAsync({ type: 'blob' })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `일괄변환_${timestampLabel()}.zip`
  a.click()
  URL.revokeObjectURL(url)

  return { ok: true, mode: 'zip', savedCount: files.mrkFiles.length, failedIsbns: files.failedIsbns }
}

export async function saveBatchAsFiles(records: HistoryRecord[]): Promise<BatchExportResult> {
  if (records.length === 0) {
    return { ok: false, mode: 'error', savedCount: 0, failedIsbns: [], error: '저장할 레코드가 없어요.' }
  }

  const files = await buildFiles(records)
  if (files.mrkFiles.length === 0) {
    return { ok: false, mode: 'error', savedCount: 0, failedIsbns: files.failedIsbns, error: '모든 레코드의 MARC 인코딩에 실패했어요.' }
  }

  const hasDirectoryPicker = typeof (window as unknown as { showDirectoryPicker?: unknown }).showDirectoryPicker === 'function'

  if (hasDirectoryPicker) {
    try {
      return await saveViaDirectoryPicker(files)
    } catch (e) {
      // 사용자가 폴더 선택 창에서 취소하면 AbortError — 오류가 아니라 취소로 취급.
      if (e instanceof DOMException && e.name === 'AbortError') {
        return { ok: false, mode: 'cancelled', savedCount: 0, failedIsbns: files.failedIsbns }
      }
      // 그 외 실패(권한 거부 등)는 zip 다운로드로 대체.
      return await saveViaZipDownload(files)
    }
  }

  return await saveViaZipDownload(files)
}

// File System Access API의 최소 타입 — 표준 DOM lib에 아직 없어 여기서만 필요한
// 만큼만 선언한다(전역 타입 오염을 피하려고 파일 스코프에 둠).
interface FileSystemWritableFileStreamLike {
  write(data: Uint8Array | Blob | string): Promise<void>
  close(): Promise<void>
}
interface FileSystemFileHandleLike {
  createWritable(): Promise<FileSystemWritableFileStreamLike>
}
interface FileSystemDirectoryHandleLike {
  getFileHandle(name: string, opts?: { create?: boolean }): Promise<FileSystemFileHandleLike>
}
