type FormHeaderProps = {
  title: string;
};

export function FormHeader({ title }: FormHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-center bg-palette-warm-6 px-6">
      <h1 className="line-clamp-2 max-w-4xl text-center text-xl font-semibold leading-snug text-palette-white sm:text-2xl">
        {title}
      </h1>
    </header>
  );
}
