import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto px-4 pt-12 pb-20">
        <header className="mb-10">
          <div className="flex justify-end">
            <Link
              href="/terms"
              className="text-blue-600 font-medium hover:underline"
            >
              Terms of Service &rarr;
            </Link>
          </div>
          <h1 className="text-3xl font-bold mt-8 text-slate-800">
            Privacy Policy
          </h1>
          <p className="text-slate-500 mt-2">Effective Date: 31 May 2026</p>
        </header>

        <div className="prose prose-slate max-w-none">
          <p>
            This Privacy Policy describes how FullHP, developed by Cosmic Titans
            ("we," "us," or "our"), collects, uses, and protects the information
            you ("you" or "User") provide when using our platform ("the
            Platform").
          </p>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              1. Information We Collect
            </h2>
            <p>
              We collect only the information necessary to operate and secure
              the Platform. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Account information you provide at registration, such as your
                name, email address, date of birth, gender, and phone number.
              </li>
              <li>
                Authentication data, including hashed passwords and secure
                session tokens.
              </li>
              <li>
                Health-related information you voluntarily submit, such as
                appointment details, prescriptions, and test records.
              </li>
            </ul>
            <p>
              We do not collect data beyond what is required for the Platform to
              function.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              2. Data Usage
            </h2>
            <p>Information collected is used exclusively to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Create and manage your account securely.</li>
              <li>Facilitate appointments between patients and doctors.</li>
              <li>Display relevant health records to authorized parties.</li>
              <li>Maintain the security and integrity of the Platform.</li>
            </ul>
            <p>
              We do not use your data for marketing, third-party advertising, or
              analytics beyond what is necessary to operate the Platform.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              3. Data Access
            </h2>
            <p>
              Access to your data is strictly controlled. Your information is
              visible only to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You, through your own account.</li>
              <li>
                Doctors with whom you have a shared appointment, limited to
                information relevant to that appointment.
              </li>
              <li>
                Authorized platform administrators, solely for operational and
                security purposes.
              </li>
            </ul>
            <p>
              Access controls are enforced through role-based permissions.
              Unauthorized access by other users is not permitted by design.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              4. Data Security
            </h2>
            <p>
              We implement reasonable technical safeguards to protect your data.
              These include bcrypt password hashing, secure JWT-based session
              management, and role-based access control (RBAC) across all API
              endpoints. Your information is not accessible to other users
              outside of the explicitly permitted relationships described above.
            </p>
            <p>
              While we take security seriously, no system can guarantee absolute
              security. You acknowledge that you submit information at your own
              risk.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              5. Data Retention
            </h2>
            <p>
              Your data is retained for as long as your account remains active
              or as needed to provide the services you have requested. You may
              request deletion of your account and associated data at any time
              by contacting us.
            </p>
            <p>
              We reserve the right to remove data that is deemed inappropriate,
              illegal, or in violation of our Terms of Service.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              6. Third-Party Sharing
            </h2>
            <p>
              We do not sell, rent, or share your information with any third
              parties. Data is not disclosed outside the Platform except as
              required by law or as described in this policy.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              7. User Responsibility
            </h2>
            <p>
              You are responsible for the accuracy and appropriateness of the
              information you submit to the Platform. Please ensure that any
              health or personal information you provide is accurate and kept up
              to date.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              8. Changes to This Policy
            </h2>
            <p>
              We reserve the right to update or modify this Privacy Policy at
              any time. Continued use of the Platform after any changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <hr className="my-8" />

          <section>
            <h2 className="text-base font-bold text-slate-800">
              9. Contact Information
            </h2>
            <p>
              For questions or concerns regarding this Privacy Policy, please
              contact us at:{" "}
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
            By using FullHP, you acknowledge and agree to the terms outlined in
            this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
