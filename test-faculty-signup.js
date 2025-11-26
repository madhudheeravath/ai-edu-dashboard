// Test to verify faculty signup API works (or fails as expected)
const testFacultySignup = async () => {
    const testFaculty = {
        name: "Test Faculty",
        email: "test.faculty.2@university.edu",
        password: "password123",
        confirmPassword: "password123",
        role: "faculty",
        facultyId: "FAC99998",
        department: "Computer Science",
        expYears: "10",
        aiLiteracy: "4",
        numCourses: "3"
    }

    try {
        console.log('Attempting to create faculty account...')
        const response = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testFaculty)
        })

        const data = await response.json()
        console.log('Signup test result:', data)

        if (response.ok) {
            console.log('✅ Faculty Signup API working correctly!')
        } else {
            console.log('❌ Faculty Signup failed:', data.error)
        }
    } catch (error) {
        console.log('❌ Network error:', error.message)
    }
}

console.log('🧪 Testing Faculty signup API...')
testFacultySignup()
