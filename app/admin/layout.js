// Admin pages share the root layout — no separate html/body tags
// This prevents CSS conflicts that caused the white background bug
export const metadata = { title: 'Admin — Blush & Boujee Atelier' }
export default function AdminLayout({ children }) {
  return <>{children}</>
}
