import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/signup">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Signup
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: November 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, including:</p>
            <ul>
              <li>Name and email address</li>
              <li>Student or Faculty ID</li>
              <li>Academic information (major, semester, department)</li>
              <li>AI awareness and literacy levels</li>
              <li>Submission content for AI detection analysis</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our educational platform</li>
              <li>Process and analyze submissions for AI detection</li>
              <li>Generate educational analytics and insights</li>
              <li>Communicate with you about your account and platform updates</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties. This does not include trusted third parties who assist us in operating our platform, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.
            </p>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your account information is protected by a password for your privacy and security.
            </p>

            <h2>5. Educational Use</h2>
            <p>
              This platform is designed for educational and research purposes. All data collected is used to improve AI detection capabilities and provide educational insights. No personal information is used for commercial purposes.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide you services. We may retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
            </p>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt out of certain communications</li>
            </ul>

            <h2>8. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience on our platform. These help us remember your preferences and analyze platform usage patterns.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our platform is intended for use by college students and faculty members. We do not knowingly collect personal information from children under 13.
            </p>

            <h2>10. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@aieducationdashboard.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
