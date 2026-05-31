import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-4 pt-12 pb-20">
        <header className="mb-10">
          <div className="flex justify-end">
            <Link href="/privacy" className="text-blue-600 font-medium hover:underline">
              Privacy Policy &rarr;
            </Link>
          </div>
          <h1 className="text-3xl font-bold mt-8 text-slate-800">
            Terms of Service
          </h1>
          <p className="text-slate-500 mt-2">Effective Date: 31 May 2026</p>
        </header>

        <div className="prose prose-slate max-w-none">
          <p>
            Welcome to FullHP, a healthcare platform developed and maintained by
            Cosmic Titans ("we," "us," or "our"). By accessing or using FullHP
            ("the Platform"), you ("you" or "User") agree to be bound by these
            Terms of Service ("Terms"). If you do not agree to these Terms, you
            may not use the Platform.
          </p>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the Platform, you acknowledge that you have
              read, understood, and agree to be legally bound by these Terms. If
              you are using the Platform on behalf of an organization, you
              represent and warrant that you have the authority to bind that
              organization to these Terms.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              2. Platform Availability and Limitation of Liability
            </h2>
            <p>
              The Platform is provided on an "as is" and "as available" basis,
              without warranties of any kind, either express or implied,
              including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, or
              non-infringement.
            </p>
            <p>
              We do not warrant that the Platform will operate uninterrupted or
              error-free. Under no circumstances shall FullHP, its developers,
              or affiliates be liable for any direct, indirect, incidental,
              special, consequential, or exemplary damages arising from your use
              or inability to use the Platform.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              3. User-Generated Content
            </h2>
            <p>
              All information, text, or other content submitted by you to the
              Platform ("User Content") is your sole responsibility. You agree
              to provide accurate, lawful, and relevant information when using
              the Platform.
            </p>
            <p>You further acknowledge and agree that:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Any medical or personal information you submit is provided
                voluntarily and at your own discretion.
              </li>
              <li>
                You shall not submit any content that is false, misleading,
                offensive, inappropriate, illegal, or in violation of any
                applicable laws or regulations.
              </li>
            </ul>
            <p>
              We reserve the right, in our sole discretion, to remove any User
              Content that violates these Terms and to suspend or terminate
              access to the Platform without prior notice.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              4. Prohibited Conduct
            </h2>
            <p>
              You agree not to engage in any of the following prohibited
              activities:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Submitting spam, irrelevant, or misleading information.</li>
              <li>
                Submitting content that is defamatory, obscene, abusive,
                harassing, threatening, or otherwise objectionable.
              </li>
              <li>
                Engaging in automated or scripted submissions, or exhibiting
                bot-like behavior, including excessive or suspicious appointment
                requests.
              </li>
              <li>
                Attempting to interfere with the proper functioning of the
                Platform or bypass any security measures.
              </li>
            </ul>
            <p>
              Violation of these rules may result in immediate suspension or
              permanent termination of your access to the Platform.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              5. Data Collection and Privacy
            </h2>
            <p>
              We collect only the data necessary to operate and secure the
              Platform. This includes account information you provide at
              registration, authentication session data, and activity
              directly related to your use of Platform features. We do not
              collect data beyond what is required for the Platform to function,
              and we do not sell your data to third parties.
            </p>
            <p>
              For further information, please refer to our{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              6. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your access to the
              Platform at any time, without notice or liability, for conduct
              that we believe violates these Terms or is harmful to other users,
              us, or third parties.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              7. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of Guwahati, Assam, India, without regard to its conflict
              of law provisions. Any disputes arising out of or relating to
              these Terms or your use of the Platform shall be resolved
              exclusively in the competent courts located within Guwahati,
              Assam, India.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              8. Contact Information
            </h2>
            <p>
              For any inquiries regarding these Terms, you may contact us at:{" "}
              <a
                href="mailto:hello@poran.dev"
                className="text-blue-600 hover:underline"
              >
                hello@poran.dev
              </a>
            </p>
          </section>

          <hr className="my-8" />

          <p className="font-semibold">
            By accessing or using FullHP, you acknowledge that you have read,
            understood, and agreed to these Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
