import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
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
            <CardTitle className="text-2xl">Terms and Conditions</CardTitle>
            <p className="text-muted-foreground">Last updated: November 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the AI Education Dashboard platform, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily use the AI Education Dashboard for educational purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the platform</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2>3. Educational Purpose</h2>
            <p>
              This platform is designed for educational research and demonstration purposes. All AI detection results and analytics are for educational use only and should not be used as the sole basis for academic decisions.
            </p>

            <h2>4. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>

            <h2>5. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the platform, to understand our practices.
            </p>

            <h2>6. Prohibited Uses</h2>
            <p>You may not use our platform:</p>
            <ul>
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            </ul>

            <h2>7. Disclaimer</h2>
            <p>
              The information on this platform is provided on an 'as is' basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms.
            </p>

            <h2>8. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at support@aieducationdashboard.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
