// GPA calculation utilities
export interface Course {
  id: string
  name: string
  grade: string
  credits: number
}

export type GradeSystem = '4point' | '10point' | 'percentage'

export const gradePoints = {
  '4point': {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  },
  '10point': {
    'A+': 10, 'A': 9, 'A-': 8,
    'B+': 7, 'B': 6, 'B-': 5,
    'C+': 4, 'C': 3, 'D': 2, 'F': 0
  }
}

export const calculateGPA = (courses: Course[], gradeSystem: GradeSystem): number => {
  let totalPoints = 0
  let totalCredits = 0

  courses.forEach(course => {
    if (course.grade && course.credits > 0) {
      let points = 0
      
      if (gradeSystem === 'percentage') {
        const percentage = parseFloat(course.grade)
        if (percentage >= 90) points = 4.0
        else if (percentage >= 80) points = 3.0
        else if (percentage >= 70) points = 2.0
        else if (percentage >= 60) points = 1.0
        else points = 0
      } else {
        points = gradePoints[gradeSystem][course.grade as keyof typeof gradePoints[typeof gradeSystem]] || 0
      }
      
      totalPoints += points * course.credits
      totalCredits += course.credits
    }
  })

  return totalCredits > 0 ? totalPoints / totalCredits : 0
}

export const getGradeFromGPA = (gpa: number, gradeSystem: GradeSystem): string => {
  if (gradeSystem === '4point') {
    if (gpa >= 3.7) return 'A'
    if (gpa >= 3.3) return 'B+'
    if (gpa >= 3.0) return 'B'
    if (gpa >= 2.7) return 'B-'
    if (gpa >= 2.3) return 'C+'
    if (gpa >= 2.0) return 'C'
    if (gpa >= 1.0) return 'D'
    return 'F'
  } else if (gradeSystem === '10point') {
    if (gpa >= 9) return 'A+'
    if (gpa >= 8) return 'A'
    if (gpa >= 7) return 'B+'
    if (gpa >= 6) return 'B'
    if (gpa >= 5) return 'B-'
    if (gpa >= 4) return 'C+'
    if (gpa >= 3) return 'C'
    if (gpa >= 2) return 'D'
    return 'F'
  }
  return 'N/A'
}
