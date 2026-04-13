import Image from "next/image";

type FormHeaderProps = {
  title: string;
};

/**
 * Móvil: fila logo + título (sin solaparse). sm+: logo absoluto a la izquierda y título centrado en el ancho completo.
 */
export function FormHeader({ title }: FormHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex min-h-16 items-center gap-2 bg-palette-warm-6 px-3 py-2 sm:min-h-20 sm:justify-center sm:gap-0 sm:px-6 sm:py-0">
      <div className="shrink-0 sm:pointer-events-none sm:absolute sm:left-6 sm:top-1/2 sm:-translate-y-1/2">
        <Image
          src="/logocusblanco.svg"
          alt="CUS"
          width={440}
          height={84}
          className="h-6 w-auto sm:pointer-events-auto sm:h-9"
          priority
        />
      </div>
      <h1 className="line-clamp-3 min-w-0 flex-1 text-center text-[0.8125rem] font-semibold leading-tight text-palette-white [overflow-wrap:anywhere] sm:line-clamp-2 sm:w-full sm:max-w-5xl sm:flex-none sm:px-44 sm:text-2xl sm:leading-snug sm:[overflow-wrap:normal]">
        {title}
      </h1>
    </header>
  );
}
