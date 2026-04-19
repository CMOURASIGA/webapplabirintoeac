export default function AppShell({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="min-h-screen w-full">
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-4">{children}</main>
    </div>
  );
}
