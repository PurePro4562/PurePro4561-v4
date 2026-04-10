import React from 'react';
import { ArrowLeft, Gamepad2 } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <a href="#" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Casino
        </a>
        
        <div className="flex items-center gap-3 mb-12">
          <Gamepad2 className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Terms of Service</h1>
        </div>

        <div className="space-y-8 font-mono text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. ACCEPTANCE OF TERMS</h2>
            <p>By accessing and using PurePro Casino, you agree to be bound by these Terms of Service. This platform is a simulation game intended for entertainment purposes only.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. NO REAL MONEY GAMBLING</h2>
            <p>PurePro Casino does NOT offer real money gambling. "Chips" and "Tokens" used within the application have no real-world monetary value and cannot be exchanged, cashed out, or redeemed for real currency or prizes under any circumstances.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. USER CONDUCT</h2>
            <p>Users must interact with the platform fairly. Exploiting bugs, using automated scripts (bots), or employing unauthorized software to gain an unfair advantage is strictly prohibited. Accounts found in violation will be permanently suspended.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. VIRTUAL CURRENCY</h2>
            <p>We reserve the right to manage, regulate, control, modify, or eliminate virtual currency (Chips and Tokens) at our sole discretion, with or without notice. We shall have no liability to you or any third party in the event we exercise such rights.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. MODIFICATIONS TO SERVICE</h2>
            <p>We reserve the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice. We may also update these Terms of Service at any time.</p>
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
