export default function BottomActions({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="mt-4 grid grid-cols-2 gap-3">{children}</div>;
}
