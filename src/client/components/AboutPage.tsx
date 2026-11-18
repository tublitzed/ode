import { useEffect } from "react";

import AppHeader from "@/client/components/AppHeader";
import MosaicPanel from "@/client/components/mosaics/MosaicPanel";
import OdeTitle from "@/client/components/odes/OdeTitle";
import { Button } from "@/client/components/ui/button";
import { NIGHTINGALE } from "@/client/utils/nightingale";

const AUTHOR_URL = "https://tublitzed.com";
const REPO_URL = "https://github.com/tublitzed/ode";

const VERSE_LINE_CLASS = "block";
const VERSE_LINK_CLASS =
  "decoration-destructive rounded-sm underline decoration-2 underline-offset-[0.2em] hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-3";

const GitHubIcon = () => (
  <svg aria-hidden fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const AboutPage = () => {
  useEffect(() => {
    document.title = "About · Ode";
  }, []);

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader currentPath="/about" />
      <main className="flex w-full flex-1 flex-col items-center px-4 pt-4 pb-20 text-center md:pt-10">
        <MosaicPanel
          className="max-w-44"
          label="A mosaic of a nightingale singing on a branch"
          shapes={NIGHTINGALE}
          state="laid"
        />
        <OdeTitle className="mt-8">An ode to creating</OdeTitle>
        <div className="font-verse animate-rise mt-8 text-lg leading-[1.55] sm:text-xl">
          <p>
            <span className={VERSE_LINE_CLASS}>A toy app</span>
            <span className={VERSE_LINE_CLASS}>for making odes</span>
            <span className={VERSE_LINE_CLASS}>with Anthropic.</span>
          </p>
          <p className="mt-[1.1em]">
            <span className={VERSE_LINE_CLASS}>Built for fun,</span>
            <span className={VERSE_LINE_CLASS}>in the spirit</span>
            <span className={VERSE_LINE_CLASS}>of over-delivering,</span>
            <span className={VERSE_LINE_CLASS}>
              by{" "}
              <a
                className={VERSE_LINK_CLASS}
                href={AUTHOR_URL}
                rel="noreferrer"
                target="_blank"
              >
                Rachel Tublitz
              </a>
              .
            </span>
          </p>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <a href={REPO_URL} rel="noreferrer" target="_blank">
              <GitHubIcon />
              Read the source on GitHub
            </a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/">Write an ode</a>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
