import AppGuard from "../components/AppGuard";
import AppShell from "./components/AppShell";

export default function AppLayout({ children }) {
  return (
    <AppGuard>
      <AppShell>{children}</AppShell>
    </AppGuard>
  );
}
