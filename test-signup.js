// Simple test to verify signup API works
const testSignup = async () => {
  const testUser = {
    name: "Test Student",
    email: "test.student.2@university.edu",
    password: "password123",
    confirmPassword: "password123",
    role: "student",
    studentId: "STU99998",
    major: "Computer Science",
    semester: "3",
    aiAwareness: "3"
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    })

    const data = await response.json()
    console.log('Signup test result:', data)

    if (response.ok) {
      console.log('✅ Signup API working correctly!')
    } else {
      console.log('❌ Signup failed:', data.error)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

console.log('🧪 Testing signup API...')
testSignup()
