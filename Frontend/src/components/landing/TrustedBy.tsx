"use client";

export function TrustedBy() {
  const logos = ["TechFlow", "Nexus Labs", "Brightpath", "CloudPeak", "Synapse", "Quantex"];

  return (
    <section className="relative py-12 border-y border-zinc-200/40 dark:border-zinc-800/40 z-10">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-8">
          Trusted by forward-thinking teams worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-40 dark:opacity-30">
          {logos.map((name) => (
            <span key={name} className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
