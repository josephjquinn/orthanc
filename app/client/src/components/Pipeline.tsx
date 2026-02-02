const STEPS = [
  { id: "upload", label: "Upload" },
  { id: "preprocess", label: "Preprocess" },
  { id: "model", label: "Model" },
  { id: "results", label: "Results" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

type PipelineProps = {
  currentStep?: StepId | null;
};

export function Pipeline({ currentStep = null }: PipelineProps) {
  return (
    <section
      className="rounded-[1.5rem] px-6 py-8 sm:px-10 sm:py-12"
      style={{ backgroundColor: "#C8A8E9" }}
    >
      <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
        App pipeline
      </h2>
      <h3 className="mb-4 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        How it works
      </h3>
      <p className="mb-10 max-w-xl font-serif text-base leading-relaxed text-foreground/90 sm:text-lg">
        After you upload an image, we preprocess it, run our damage classifier, and return a
        damage ratio.
      </p>

      <ol className="space-y-4 sm:space-y-5">
        {STEPS.map((step, i) => {
          const isActive = currentStep === step.id;
          const isPast = currentStep && STEPS.findIndex((s) => s.id === currentStep) > i;
          return (
            <li key={step.id} className="flex items-baseline gap-4">
              <span
                className={`text-sm tabular-nums ${
                  isActive ? "font-bold text-foreground" : "text-foreground/60"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`font-sans text-lg sm:text-xl ${
                  isActive
                    ? "font-bold text-foreground"
                    : isPast
                      ? "font-medium text-foreground/90"
                      : "text-foreground/70"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
