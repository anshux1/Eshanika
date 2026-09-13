import { Button } from "@eshanika/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-6 text-center text-zinc-950">
      <div className="max-w-xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Eshanika
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">Storefront</h1>
        <p className="text-zinc-600">
          The store app is wired to the shared Eshanika packages and ready for
          your customer experience.
        </p>
      </div>
      <Button
        appName="store"
        className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
      >
        Test shared UI
      </Button>
    </main>
  );
}
