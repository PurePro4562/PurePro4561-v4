import React from 'react';
import { ArrowLeft, Gamepad2 } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <a href="#" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Casino
        </a>
        
        <div className="flex items-center gap-3 mb-12">
          <Gamepad2 className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Privacy Policy</h1>
        </div>

        <div className="space-y-8 font-mono text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. DATA COLLECTION</h2>
            <p>We collect minimal data necessary for gameplay, including your email address for authentication and game statistics for your personal history. We do not collect unnecessary personal identifiable information (PII).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. COOKIES AND ADVERTISING</h2>
            <p>PurePro4561 uses cookies to store information about visitors' preferences, to record user-specific information on which pages the site visitor accesses or visits, and to personalize or customize our web page content based upon visitors' browser type or other information that the visitor sends via their browser.</p>
            <p className="mt-4">Google, as a third-party vendor, uses cookies to serve ads on PurePro4561. Google's use of the advertising cookie enables it and its partners to serve ads to our users based on their visit to our site and other sites on the Internet. Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. ADVERTISING PARTNERS</h2>
            <p>Some of our advertising partners may use cookies and web beacons on our site. Our advertising partners include Google AdSense. These third-party ad servers or ad networks use technology in their respective advertisements and links that appear on PurePro4561 and which are sent directly to your browser. They automatically receive your IP address when this occurs.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. GDPR & CCPA RIGHTS</h2>
            <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights. PurePro4561 aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data. If you are a California resident, you have rights under the CCPA to control your personal data.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. DATA SECURITY</h2>
            <p>We implement industry-standard security measures to protect your digital assets and personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. DATA RETENTION AND DELETION</h2>
            <p>Your data is retained as long as your account is active. You may request account deletion at any time, which will permanently remove your game history and associated data from our servers.</p>
          </section>
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10 text-zinc-600 text-xs font-mono uppercase tracking-widest">
          Last Updated: April 2026<br/>
          © 2026 PUREPRO DIGITAL // ALL RIGHTS RESERVED
        </div>
      </div>
    </div>
  );
}
