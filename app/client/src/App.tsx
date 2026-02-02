import { useState } from "react";
import { Pipeline } from "./components/Pipeline";
import { UploadZone } from "./components/UploadZone";

type StepId = "upload" | "preprocess" | "model" | "results" | null;

function App() {
  const [currentStep, setCurrentStep] = useState<StepId>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentStep("upload");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fce5cf" }}>
      <header className="border-b border-black/[0.08] px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="logo-text text-2xl text-foreground sm:text-3xl">Hermes</span>
          <button type="button" className="btn-filled shrink-0">
            Subscribe
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-6 sm:py-16 md:px-20 md:pt-20 md:pb-12">
        <section className="pb-8 text-center md:pb-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-[120px] font-extrabold uppercase text-center mb-10 max-[700px]:mb-[30px] leading-[0.72] tracking-[-2px] max-[700px]:tracking-[-1px] text-foreground">
              HERMES
            </h1>
            <p className="text-lg md:text-xl leading-relaxed text-foreground/80 max-w-3xl mx-auto mb-8 font-serif">
              Upload a post-disaster satellite or aerial image to run our damage assessment pipeline.
              We analyze building damage and surface a single damage ratio so you can triage and
              prioritize response.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="heading-sm mb-3 text-foreground">Upload post-disaster image</h2>
          <UploadZone onFileSelect={handleFileSelect} />
          {selectedFile && (
            <p className="mt-2 text-sm text-muted-foreground">
              Selected: {selectedFile.name}
            </p>
          )}
        </section>

        <Pipeline currentStep={currentStep} />
      </main>
    </div>
  );
}

export default App;
