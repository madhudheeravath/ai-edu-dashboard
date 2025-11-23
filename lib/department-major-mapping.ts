// Mapping between Faculty Departments and Student Majors
// Based on faculty_dataset.csv and students_dataset.csv

export const FACULTY_DEPARTMENTS = [
  'CS',
  'Sciences',
  'Arts',
  'Business'
] as const

export const STUDENT_MAJORS = [
  'Biology',
  'Business',
  'Chemistry',
  'CS',
  'Economics',
  'English',
  'History',
  'Math',
  'Physics',
  'Psychology'
] as const

// Map faculty departments to student majors they can teach
export const DEPARTMENT_TO_MAJORS: Record<string, string[]> = {
  'CS': ['CS'],
  'Sciences': ['Biology', 'Chemistry', 'Math', 'Physics'],
  'Arts': ['English', 'History', 'Psychology'],
  'Business': ['Business', 'Economics']
}

// Reverse mapping: student major to faculty department
export const MAJOR_TO_DEPARTMENT: Record<string, string> = {
  'CS': 'CS',
  'Biology': 'Sciences',
  'Chemistry': 'Sciences',
  'Math': 'Sciences',
  'Physics': 'Sciences',
  'English': 'Arts',
  'History': 'Arts',
  'Psychology': 'Arts',
  'Business': 'Business',
  'Economics': 'Business'
}

// Get majors a faculty member can create assignments for
export function getMajorsForDepartment(department: string): string[] {
  return DEPARTMENT_TO_MAJORS[department] || []
}

// Get department for a student major
export function getDepartmentForMajor(major: string): string {
  return MAJOR_TO_DEPARTMENT[major] || ''
}

// Check if a faculty can teach a major
export function canTeachMajor(facultyDepartment: string, studentMajor: string): boolean {
  const allowedMajors = DEPARTMENT_TO_MAJORS[facultyDepartment] || []
  return allowedMajors.includes(studentMajor)
}

export type FacultyDepartment = typeof FACULTY_DEPARTMENTS[number]
export type StudentMajor = typeof STUDENT_MAJORS[number]
