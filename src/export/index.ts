import type { ExportPayload } from './types'

export type { ExportPayload, ExportColumn, ExportStudentRow } from './types'
export { exportTheme } from './exportTheme'
export { getExportFileName } from './fileName'

export async function exportData(
  format: 'csv' | 'xlsx',
  payload: ExportPayload,
  signal?: { aborted: boolean },
): Promise<void> {
  if (signal?.aborted) return

  if (format === 'csv') {
    const { exportCsv } = await import('./exportCsv')
    if (signal?.aborted) return
    exportCsv(payload)
    return
  }

  if (format === 'xlsx') {
    const { exportXlsx } = await import('./exportXlsx')
    if (signal?.aborted) return
    await exportXlsx(payload)
    return
  }


}

