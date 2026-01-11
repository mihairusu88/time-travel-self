import { Shield, Calendar, Lock, Eye } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background font-display">
      {/* Header */}
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Privacy Policy
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last updated: January 1, 2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-12">
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                At HeroTime, we take your privacy seriously. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                information when you use our service.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <Eye className="w-8 h-8 text-primary" />
                1. Information We Collect
              </h2>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                1.1 Information You Provide
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                When you create an account or use HeroTime, we collect:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                <li>
                  <strong>Account Information:</strong> Email address, name, and
                  authentication credentials
                </li>
                <li>
                  <strong>Profile Information:</strong> Avatar images and
                  display preferences
                </li>
                <li>
                  <strong>Payment Information:</strong> Processed securely
                  through Stripe (we do not store credit card details)
                </li>
                <li>
                  <strong>Content:</strong> Images you upload and generate using
                  our service
                </li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                1.2 Automatically Collected Information
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We automatically collect certain information when you use
                HeroTime:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>
                  <strong>Usage Data:</strong> Pages visited, features used,
                  generation history
                </li>
                <li>
                  <strong>Device Information:</strong> Browser type, operating
                  system, IP address
                </li>
                <li>
                  <strong>Cookies:</strong> To maintain sessions and improve
                  user experience
                </li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We use the collected information for the following purposes:
              </p>
              <div className="bg-card rounded-lg p-6 border border-gray-300 dark:border-gray-700 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong className="text-gray-900 dark:text-white">
                        Service Delivery:
                      </strong>{' '}
                      To provide, maintain, and improve HeroTime
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong className="text-gray-900 dark:text-white">
                        AI Generation:
                      </strong>{' '}
                      To process your images and create AI-generated content
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong className="text-gray-900 dark:text-white">
                        Account Management:
                      </strong>{' '}
                      To manage your subscription and billing
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong className="text-gray-900 dark:text-white">
                        Communication:
                      </strong>{' '}
                      To send service updates, security alerts, and support
                      messages
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      <strong className="text-gray-900 dark:text-white">
                        Analytics:
                      </strong>{' '}
                      To understand usage patterns and improve our service
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Storage and Security */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                <Lock className="w-8 h-8 text-primary" />
                3. Data Storage and Security
              </h2>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                3.1 Data Storage
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your data is stored securely using:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                <li>
                  <strong>Supabase:</strong> For user authentication and
                  database storage
                </li>
                <li>
                  <strong>Supabase Storage:</strong> For secure image storage
                  with encryption
                </li>
                <li>
                  <strong>Stripe:</strong> For secure payment processing
                </li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                3.2 Security Measures
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>End-to-end encryption for data transmission</li>
                <li>Secure authentication using OAuth 2.0</li>
                <li>Regular security audits and updates</li>
                <li>Row-level security policies in our database</li>
                <li>Automated backups and disaster recovery</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                4. Data Sharing and Disclosure
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We do not sell your personal information. We may share your data
                only in the following circumstances:
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    Service Providers
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    We share data with trusted service providers (Supabase,
                    Stripe, Replicate) who help us operate the service. These
                    providers are bound by confidentiality agreements.
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    Legal Requirements
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    We may disclose information if required by law or to protect
                    our rights and the safety of our users.
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    Business Transfers
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    In the event of a merger, acquisition, or sale of assets,
                    your information may be transferred to the new entity.
                  </p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                5. Your Rights and Choices
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You have the following rights regarding your personal data:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    Access
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Request a copy of your personal data
                  </p>
                </div>
                <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    Correction
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update or correct inaccurate information
                  </p>
                </div>
                <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    Deletion
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Request deletion of your account and data
                  </p>
                </div>
                <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                    Export
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download your generated images and data
                  </p>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                6. Data Retention
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We retain your information for as long as necessary to provide
                our services and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>
                  <strong>Active Accounts:</strong> Data retained while your
                  account is active
                </li>
                <li>
                  <strong>Deleted Accounts:</strong> Most data deleted within 30
                  days, some retained for legal compliance
                </li>
                <li>
                  <strong>Generated Images:</strong> Stored until you delete
                  them or close your account
                </li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                7. Children&apos;s Privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                HeroTime is not intended for children under 13 years of age. We
                do not knowingly collect personal information from children. If
                you believe we have collected information from a child, please
                contact us immediately.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                8. Changes to This Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                We may update this Privacy Policy from time to time. We will
                notify you of any material changes by email or through a
                prominent notice on our service. Your continued use after such
                modifications constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                9. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have questions or concerns about this Privacy Policy or
                our data practices, please contact us:
              </p>
              <div className="bg-card rounded-lg p-6 border border-gray-300 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white">
                    Email:
                  </strong>{' '}
                  privacy@herotime.com
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  <strong className="text-gray-900 dark:text-white">
                    Data Protection Officer:
                  </strong>{' '}
                  dpo@herotime.com
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  <strong className="text-gray-900 dark:text-white">
                    Address:
                  </strong>{' '}
                  HeroTime, Inc., 123 AI Street, San Francisco, CA 94103
                </p>
              </div>
            </section>
          </div>

          {/* Back to Top */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
            <a
              href="#"
              className="text-primary hover:underline font-semibold inline-flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Back to Top
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
