const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Login() {
  function signInWithGitHub() {
    window.location.assign(`${API_URL}/auth/github`);
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-6">
      <section className="w-full max-w-md rounded-2xl border border-[#E8E4DA] bg-white p-8 shadow-sm">
        <p className="font-serif text-3xl text-[#1C1B19]">LeetRev</p>
        <p className="mt-3 text-sm leading-6 text-[#6B6659]">
          Connect GitHub to turn your submitted solutions into a personal
          revision queue.
        </p>
        <button
          type="button"
          onClick={signInWithGitHub}
          className="mt-7 w-full rounded-lg bg-[#2B3A55] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1C1B19]"
        >
          Continue with GitHub
        </button>
      </section>
    </main>
  );
}
