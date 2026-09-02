import path from 'node:path'
import { getUploadsBaseDir } from './uploads'

const TEMP_ID_PATTERN = /^[a-zA-Z0-9_-]{8,64}$/

/** 校验 tempId 是否安全（仅字母数字、连字符、下划线，8-64 位），防路径穿越 */
export function assertSafeTempId(tempId: string): boolean {
  return TEMP_ID_PATTERN.test(String(tempId || ''))
}

/** 解析临时目录，resolve 后必须位于 uploads/temp 之下 */
export function resolveTempDir(tempId: string): string {
  if (!assertSafeTempId(tempId)) {
    throw new Error('非法 tempId')
  }
  const base = getUploadsBaseDir()
  const tempRoot = path.resolve(base, 'temp')
  const resolved = path.resolve(tempRoot, tempId)
  if (resolved !== tempRoot && !resolved.startsWith(tempRoot + path.sep)) {
    throw new Error('非法 tempId 路径')
  }
  return resolved
}
