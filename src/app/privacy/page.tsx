import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <header className="mb-10">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-blue-600 font-medium hover:underline">
              &larr; Back to Home
            </Link>
            <Link href="/terms" className="text-blue-600 font-medium hover:underline">
              Terms of Service &rarr;
            </Link>
          </div>
          <h1 className="text-3xl font-bold mt-8 text-slate-800">Privacy Policy</h1>
          <p className="text-slate-500 mt-2">Effective Date: 14/04/2025</p>
        </header>
        
        <div className="prose prose-slate max-w-none">
          <p>This Privacy Policy describes how EazyDoc, developed by the team known as Cosmic Titans ("we," "us," or "our"), collects, uses, and protects the information you ("you" or "User") provide when using our platform ("the Platform").</p>
          
          <hr className="my-8" />
          
          <section>
            <h2 className="text-xl font-semibold text-slate-800">1. Information We Collect</h2>
            <p>EazyDoc does not collect or process any personal data beyond the information you voluntarily submit through the Platform.</p>
            <p>The information you submit may include, but is not limited to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Medical conditions and related health information.</li>
              <li>Appointment requests and preferences.</li>
              <li>Any additional text or data you input manually.</li>
            </ul>
            <p>This data is stored solely for the purpose of facilitating your interaction with the Platform.</p>
          </section>
          
          <hr className="my-8" />
          
          <section>
            <h2 className="text-xl font-semibold text-slate-800">2. Data Usage</h2>
            <p>All information submitted by you is used exclusively to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Process and display your input for appointment-related purposes.</li>
              <li>Assist with feature testing and platform improvements during development.</li>
            </ul>
            <p>We do not use your data for marketing, third-party advertising, or analytics.</p>
          </section>
          
          <hr className="my-8" />
          
          <section>
            <h2 className="text-xl font-semibold text-slate-800">3. Data Access</h2>
            <p>Due to the developmental nature of the Platform — including administrative testing environments — submitted data may be accessible to members of the Cosmic Titans development team and, in certain cases, to other users.</p>
            <p>You acknowledge and accept that the Platform is not designed for secure or confidential handling of personal or sensitive medical information.</p>
          </section>
          
          <hr className="my-8" />
          
          <section>
            <h2 className="text-xl font-semibold text-slate-800">4. Data Security</h2>
            <p>While we strive to maintain appropriate technical safeguards, the Platform is provided for demonstration purposes and is not intended for production use.</p>
            <p>We cannot guarantee the security or confidentiality of any data submitted to the Platform, and you acknowledge that you submit information at your own risk.</p>
          </section>
          
          <hr className="my-8" />
          
          <section>
            <h2 className="text-xl font-semibold text-slate-800">5. Data Retention</h2>
            <p>User-submitted information may be retained for as long as necessary to fulfill the intended purpose or until manually deleted.</p>
            <p>We reserve the right to remove data at any time, especially if it is deemed spammy, inappropriate, illegal, or irrelevant to the intended use of the Platform.</p>
          </section>
          
          <hr className="my-8" />
          
          <section>
            <h2 className="text-xl font-semibold text-slate-800">6. Third-Party Sharing</h2>
            <p>We do not sell, rent, or share your information with any third parties.</p>
            <p>Data may be visible to platform administrators and developers for monitoring, debugging, and quality assurance purposes.</p>
          </section>
          
          <hr className="my-8" />
          
          <section>
            <h2 className="text-xl font-semibold text-slate-800">7. User Responsibility</h2>
            <p>You are solely responsible for the accuracy, legality, and appropriateness of the information you submit. We advise against submitting any personally identifiable information or real medical data unless you understand and accept the public and unsecured nature of the Platform.</p>
          </section>
          
          <hr className="my-8" />
          
          <section>
            <h2 className="text-xl font-semibold text-slate-800">8. Changes to This Policy</h2>
            <p>We reserve the right to update or modify this Privacy Policy at any time. Continued use of the Platform after any changes constitutes acceptance of the updated policy.</p>
          </section>
          
          <hr className="my-8" />
          
          <section>
            <h2 className="text-xl font-semibold text-slate-800">9. Contact Information</h2>
            <p>For questions or concerns regarding this Privacy Policy, please contact us at:<br />
            <a href="mailto:eazydoc@gmail.com" className="text-blue-600 hover:underline">eazydoc@gmail.com</a></p>
          </section>
          
          <hr className="my-8" />
          
          <p className="font-semibold">By using EazyDoc, you acknowledge and agree to the terms outlined in this Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
}