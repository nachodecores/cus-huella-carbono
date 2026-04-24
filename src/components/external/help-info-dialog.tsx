"use client";

import { useId, useRef, type ReactNode, type SyntheticEvent } from "react";

type HelpInfoDialogProps = {
  /** Texto para `aria-label` del botón (obligatorio para accesibilidad). */
  label: string;
  /** Título opcional encima del cuerpo; si se omite, el modal solo muestra el contenido. */
  title?: string;
  /** Contenido de la aclaración (texto, párrafos, listas, etc.). */
  children: ReactNode;
  /** Clases extra en el botón del icono (p. ej. alineación). */
  buttonClassName?: string;
};

/**
 * Botón con icono de información que abre un `<dialog>` nativo con texto de ayuda.
 * Usar junto a etiquetas de preguntas; el mensaje concreto va en `children`.
 */
export function HelpInfoDialog({
  label,
  title,
  children,
  buttonClassName = "",
}: HelpInfoDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const hasTitle = title != null && title.trim() !== "";

  const open = () => {
    dialogRef.current?.showModal();
  };

  const close = () => {
    dialogRef.current?.close();
  };

  const onDialogClose = () => {
    queueMicrotask(() => triggerRef.current?.focus());
  };

  const onDialogClick = (e: SyntheticEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      close();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`relative -top-[3px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 leading-none hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-palette-brand focus-visible:ring-offset-2 ${buttonClassName}`.trim()}
        aria-label={label}
        aria-haspopup="dialog"
        onClick={open}
      >
        <img
          src="/infoicon.svg"
          alt=""
          width={18}
          height={18}
          className="pointer-events-none h-[18px] w-[18px] select-none object-contain"
          aria-hidden
          draggable={false}
        />
      </button>

      <dialog
        ref={dialogRef}
        className="fixed left-1/2 top-1/2 z-50 m-0 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-neutral-200 bg-white p-4 text-neutral-900 shadow-xl backdrop:bg-neutral-900/40 open:backdrop:backdrop-blur-[1px]"
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-label={hasTitle ? undefined : label}
        onClick={onDialogClick}
        onClose={onDialogClose}
      >
        <div className="flex flex-col gap-3">
          {hasTitle ? (
            <h2
              id={titleId}
              className="text-base font-semibold text-neutral-900 pr-8"
            >
              {title}
            </h2>
          ) : null}
          <div className="text-sm leading-relaxed text-neutral-700">
            {children}
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-palette-brand focus-visible:ring-offset-2"
              onClick={close}
            >
              Cerrar
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
