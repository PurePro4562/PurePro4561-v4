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
            <h2 className="text-xl font-bold text-white mb-4">2. COOKIES AND LOCAL STORAGE</h2>
            <p>We use local storage and cookies to maintain your session, preferences, and authentication state. No third-party tracking cookies are used for advertising or cross-site tracking.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. THIRD PARTIES</h2>
            <p>Your data is never sold to third parties. We use Google Firebase for secure data storage and authentication. Please refer to Google's Privacy Policy for more information on how they handle data.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. SECURITY</h2>
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
