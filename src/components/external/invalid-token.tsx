export function InvalidToken() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Acceso no válido
      </h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        El enlace no es válido o ha caducado. Pedí a la organización un enlace
        actualizado.
      </p>
    </div>
  );
}
