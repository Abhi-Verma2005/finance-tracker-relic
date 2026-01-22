// This layout file is intentionally empty
// The actual layout is conditionally applied in the ClientLayoutWrapper component
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
