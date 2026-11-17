export interface SchoolPassFailResult {
  passed: boolean
  failedSubjects: string[]
  average: number | null
}

export function calculateSchoolPassFail(
  studentMarks: Record<string, number | null>, // subjectKey -> mark
  subjects: { key: string; label: string }[]
): SchoolPassFailResult {
  let total = 0
  let count = 0
  const failedSubjects: string[] = []

  for (const sub of subjects) {
    const mark = studentMarks[sub.key]
    if (typeof mark === 'number') {
      total += mark
      count++
      if (mark < 50) {
        failedSubjects.push(sub.label)
      }
    }
  }

  if (count === 0) {
    return { passed: false, failedSubjects: [], average: null }
  }

  const average = total / count
  let passed = false

  if (failedSubjects.length === 0 || failedSubjects.length === 1) {
    passed = average >= 50
  } else if (failedSubjects.length === 2) {
    passed = average >= 53
  } else {
    // 3 or more failed subjects
    passed = average >= 55
  }

  return { passed, failedSubjects, average }
}
