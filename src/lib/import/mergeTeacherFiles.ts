import * as XLSX from 'xlsx-js-style'
import type { RosterModel, RosterStudentBlock, RosterRow } from '../../export/roster/buildRoster'

// Helper to extract data from one sheet
function extractData(file: File): Promise<{ students: Map<string, Record<string, number>>, subjects: Set<string> }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

      const studentMap = new Map<string, Record<string, number>>()
      const allSubjects = new Set<string>()
      const reserved = ['no', 'students name', 'sex', 'age', 'sem', 'semester', 'total', 'average', 'rank', 'conduct', 'absents', 'remark', 'remarks']

      let headerRowIndex = -1
      for (let i = 0; i < Math.min(5, rows.length); i++) {
        if (rows[i] && rows[i].some((cell: any) => String(cell).toLowerCase().includes('students name') || String(cell).toLowerCase() === 'name')) {
          headerRowIndex = i
          break
        }
      }
      if (headerRowIndex === -1) return resolve({ students: studentMap, subjects: allSubjects })

      const headers = rows[headerRowIndex].map((h: any) => String(h || '').trim())
      const nameColIndex = headers.findIndex((h: string) => {
        const lower = h.toLowerCase()
        return (lower.includes('student') && lower.includes('name')) || lower === 'name' || lower === 'names'
      })
      if (nameColIndex === -1) return resolve({ students: studentMap, subjects: allSubjects })

      const subjectCols: { index: number, name: string }[] = []
      for (let i = 0; i < headers.length; i++) {
        const h = headers[i].toLowerCase()
        if (!h) continue
        if (!reserved.some(r => h.startsWith(r))) {
          const name = headers[i].replace(/\/\d+$/, '').trim()
          if (name) {
            subjectCols.push({ index: i, name })
            allSubjects.add(name)
          }
        }
      }

      for (let r = headerRowIndex + 1; r < rows.length; r++) {
        const row = rows[r]
        if (!row) continue
        const studentName = String(row[nameColIndex] || '').trim()
        if (!studentName || studentName === '0' || studentName.toLowerCase() === 'student') continue

        if (!studentMap.has(studentName)) studentMap.set(studentName, {})
        const studentData = studentMap.get(studentName)!

        for (const col of subjectCols) {
          const val = Number(row[col.index])
          if (!isNaN(val) && val > 0) {
            studentData[col.name] = val
          }
        }
      }
      resolve({ students: studentMap, subjects: allSubjects })
    }
    reader.readAsArrayBuffer(file)
  })
}

export async function parseAndMergeTwoFiles(sem1File: File, sem2File: File): Promise<RosterModel> {
  console.log('[MERGE] Reading Sem I:', sem1File.name)
  const sem1 = await extractData(sem1File)
  
  console.log('[MERGE] Reading Sem II:', sem2File.name)
  const sem2 = await extractData(sem2File)

  if (sem1.students.size === 0 || sem2.students.size === 0) {
    throw new Error('One or both files appear to be empty or invalid.')
  }

  // Check if students match
  const sem1Names = Array.from(sem1.students.keys()).sort()
  const sem2Names = Array.from(sem2.students.keys()).sort()
  const missingInSem2 = sem1Names.filter(n => !sem2.students.has(n))
  const missingInSem1 = sem2Names.filter(n => !sem1.students.has(n))

  if (missingInSem2.length > 0 || missingInSem1.length > 0) {
    console.warn('Student mismatch detected!', { missingInSem2, missingInSem1 })
    // We still proceed, but we might want to alert the user
    throw new Error(`Student mismatch! \nMissing in Sem II: ${missingInSem2.join(', ') || 'None'} \nMissing in Sem I: ${missingInSem1.join(', ') || 'None'}`)
  }

  const allSubjects = new Set([...sem1.subjects, ...sem2.subjects])
  const subjectList = Array.from(allSubjects).map((name) => ({ key: name, label: name, sem1SubjectId: null, sem2SubjectId: null }))

  const students: RosterStudentBlock[] = Array.from(sem1.students.keys()).map((name, index) => {
    const marks1 = sem1.students.get(name) || {}
    const marks2 = sem2.students.get(name) || {}

    const buildRow = (semester: 'I' | 'II' | 'AV'): RosterRow => {
      const subjectValues: Record<string, number | null> = {}
      let total = 0
      let hasMarks = false
      let count = 0

      for (const sub of subjectList) {
        const v1 = marks1[sub.label]
        const v2 = marks2[sub.label]
        let val: number | null = null

        if (semester === 'I') val = v1 || null
        else if (semester === 'II') val = v2 || null
        else if (semester === 'AV') {
          if (typeof v1 === 'number' && typeof v2 === 'number') val = (v1 + v2) / 2
        }

        if (val !== null && !isNaN(val)) {
          subjectValues[sub.key] = Math.round(val * 100) / 100
          total += val
          hasMarks = true
          count++
        } else {
          subjectValues[sub.key] = null
        }
      }

      return {
        semester,
        subjectValues,
        total: hasMarks ? total : null,
        average: hasMarks && count > 0 ? Math.round(total / count) : null,
        rank: null,
        conduct: null,
        absents: null,
        remark: null,
      }
    }

    return {
      no: index + 1,
      studentId: index + 1,
      name,
      sex: '',
      age: '',
      rows: [buildRow('I'), buildRow('II'), buildRow('AV')],
    }
  })

  // Calculate ranks for I, II, AV
  for (const type of ['I', 'II', 'AV'] as const) {
    const idx = type === 'I' ? 0 : type === 'II' ? 1 : 2
    const withMarks = students.filter(s => s.rows[idx].total !== null).sort((a, b) => b.rows[idx].total! - a.rows[idx].total!)
    let currentRank = 1
    for (let i = 0; i < withMarks.length; i++) {
      if (i > 0 && withMarks[i].rows[idx].total !== withMarks[i - 1].rows[idx].total) {
        currentRank = i + 1
      }
      withMarks[i].rows[idx].rank = currentRank
    }
  }

  return { subjects: subjectList, students }
}
