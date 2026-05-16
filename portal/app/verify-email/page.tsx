import { Suspense } from "react";
import VerifyEmailContent from "./verify-email-content";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#0f0f1a] border border-[#1e1e2e] rounded-2xl p-8 text-center space-y-6">
        <p className="text-sm text-zinc-500 animate-pulse">Verifying email...</p>
      </div>
    </div>
  );
}
