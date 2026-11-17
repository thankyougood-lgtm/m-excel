import type { ExportPayload } from './types'
import { getExportFileName } from './fileName'
import { exportTheme } from './exportTheme'

export async function exportXlsx(payload: ExportPayload): Promise<void> {
  const XLSX = await import('xlsx-js-style')

  const sheetName = payload.semester === 1 ? 'Sem I' : 'Sem II'
  const headerFillRgb = exportTheme.headerFill.replace('#', '')
  const headerTextRgb = exportTheme.headerText.replace('#', '')
  const altRowRgb = exportTheme.alternateRowFill.replace('#', '')
  const borderRgb = exportTheme.border.replace('#', '')
  const textRgb = exportTheme.text.replace('#', '')

  const headerStyle = {
    font: { bold: true, color: { rgb: headerTextRgb }, sz: 11 },
    fill: { fgColor: { rgb: headerFillRgb } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: borderRgb } },
      bottom: { style: 'thin', color: { rgb: borderRgb } },
      left: { style: 'thin', color: { rgb: borderRgb } },
      right: { style: 'thin', color: { rgb: borderRgb } },
    },
  }

  const dataStyle = {
    font: { color: { rgb: textRgb }, sz: 10 },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: borderRgb } },
      bottom: { style: 'thin', color: { rgb: borderRgb } },
      left: { style: 'thin', color: { rgb: borderRgb } },
      right: { style: 'thin', color: { rgb: borderRgb } },
    },
  }

  const altStyle = {
    ...dataStyle,
    fill: { fgColor: { rgb: altRowRgb } },
  }

  const titleStyle = {
    font: { name: 'Times New Roman', bold: true, sz: 12, color: { rgb: textRgb } },
    alignment: { horizontal: 'left', vertical: 'center' },
  }

  // 1. Title Row
  const titleParts = [payload.schoolName, payload.className, sheetName, payload.academicYear].filter(Boolean)
  const titleText = titleParts.join(' - ')
  const titleRow = payload.columns.map((_, idx) => 
    idx === 0 ? { v: titleText, t: 's', s: titleStyle } : { v: '', t: 's' }
  )

  // 2. Header Row
  const headerRow = payload.columns.map((col) => ({
    v: col.label,
    t: 's',
    s: headerStyle,
  }))

  // 3. Data Rows
  const dataRows: any[][] = [titleRow, new Array(payload.columns.length).fill({v: '', t: 's'}), headerRow]

  payload.rows.forEach((row, rowIndex) => {
    const rowStyle = rowIndex % 2 === 1 ? altStyle : dataStyle
    const cells = payload.columns.map((col) => {
      let val: string | number = ''
      let type: 'n' | 's' = 's'

      if (col.kind === 'no') {
        val = row.serialNo
        type = 'n'
      } else if (col.kind === 'name') {
        val = row.name
      } else if (col.kind === 'sex') {
        val = row.sex || ''
      } else if (col.kind === 'age') {
        val = row.age || ''
      } else if (col.kind === 'total') {
        val = row.total ?? ''
        type = row.total !== null ? 'n' : 's'
      } else if (col.kind === 'remark') {
        val = row.remark || ''
      } else {
        // Score or Extra column
        const scoreVal = row.scores[col.id]
        val = scoreVal !== null && scoreVal !== undefined ? scoreVal : ''
        type = typeof val === 'number' ? 'n' : 's'
      }

      return { v: val, t: type, s: rowStyle }
    })
    dataRows.push(cells)
  })

  const ws = XLSX.utils.aoa_to_sheet(dataRows)

  // Merges: Title spans all columns
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: payload.columns.length - 1 } }]

  // Column widths
  ws['!cols'] = payload.columns.map((col) => ({ wch: Math.round(col.widthPx / 7) }))

  // Row heights (tall title, normal rest)
  const rowHeights = [{ hpt: 24 }, { hpt: 10 }]
  for (let i = 0; i < payload.rows.length + 1; i++) {
    rowHeights.push({ hpt: 18 })
  }
  ws['!rows'] = rowHeights

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, getExportFileName(payload.className, payload.semester, 'xlsx'))
}
