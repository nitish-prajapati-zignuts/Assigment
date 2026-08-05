import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 text-center dark:bg-zinc-950">
      <div className="absolute top-6 right-6">
        <ModeToggle />
      </div>

      <div className="max-w-xl space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Welcome to Our App
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Get started by signing in to your existing account or creating a new one.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Go to Login
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
