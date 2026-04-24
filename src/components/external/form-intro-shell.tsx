"use client";

import { useState, type ReactNode } from "react";
import { ExternalSectionCard } from "@/components/external/external-section-card";
import { FormHeader } from "@/components/external/form-header";
import {
  FORM_INTRO_SLIDES,
  type FormIntroSlide,
} from "@/lib/external/form-intro-slides";

function SlideContent({ slide }: { slide: FormIntroSlide }) {
  const hasTitle = slide.title.trim().length > 0;

  return (
    <div
      className="min-h-[12rem] space-y-4 px-4 py-5 sm:min-h-[10rem] sm:px-5 sm:py-6"
      aria-live="polite"
    >
      {hasTitle ? (
        <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {slide.title}
        </h3>
      ) : null}
      {slide.subtitle ? (
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {slide.subtitle}
        </p>
      ) : null}
      {slide.body ? (
        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {slide.body}
        </p>
      ) : null}
    </div>
  );
}

type FormIntroShellProps = {
  headerTitle: string;
  children: ReactNode;
};

/**
 * Carrusel introductorio antes del cuestionario; al terminar o al elegir
 * «Ir al formulario» muestra `children`.
 */
export function FormIntroShell({ headerTitle, children }: FormIntroShellProps) {
  const [introDone, setIntroDone] = useState(false);
  const [index, setIndex] = useState(0);
  const last = FORM_INTRO_SLIDES.length - 1;

  if (introDone) {
    return children;
  }

  const slide = FORM_INTRO_SLIDES[index]!;

  return (
    <div className="relative isolate min-h-[100dvh] w-full pt-[5.75rem] sm:pt-20">
      <FormHeader title={headerTitle} />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/patronsemillas.svg')] bg-[length:480px_720px] bg-repeat opacity-15"
        aria-hidden
      />
      <div className="relative mx-auto max-w-2xl px-4 py-8">
        <ExternalSectionCard title="Introducción">
          <SlideContent slide={slide} />
          <div className="border-t border-neutral-200 px-4 py-4 dark:border-neutral-800">
            <p className="mb-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
              {index + 1} / {FORM_INTRO_SLIDES.length}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-between sm:gap-2">
              <button
                type="button"
                className="rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 sm:min-w-[7rem]"
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
              >
                Atrás
              </button>
              <button
                type="button"
                className="rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800 sm:min-w-[7rem]"
                disabled={index >= last}
                onClick={() => setIndex((i) => Math.min(last, i + 1))}
              >
                Siguiente
              </button>
              <button
                type="button"
                className="rounded-md bg-palette-brand px-4 py-2.5 text-sm font-medium text-palette-white hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-palette-brand focus-visible:ring-offset-2 sm:min-w-[11rem]"
                onClick={() => setIntroDone(true)}
              >
                Ir al formulario
              </button>
            </div>
          </div>
        </ExternalSectionCard>
      </div>
    </div>
  );
}
