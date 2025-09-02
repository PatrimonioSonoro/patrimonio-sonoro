import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientDashboard from './ClientDashboard';

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  // Intenta obtener el token de acceso de Supabase desde cookies (si existe)
  const access = cookieStore.get('sb-access-token')?.value;

  // Si no hay token en cookies (común cuando el cliente guarda sesión en localStorage),
  // no podemos validar en SSR. Dejamos que el guard del cliente haga la verificación.
  if (access) {
    const hdrs = await headers();
    const proto = hdrs.get('x-forwarded-proto') ?? 'http';
    const host = hdrs.get('host');
    const baseUrl = host ? `${proto}://${host}` : '';

    const res = await fetch(`${baseUrl}/api/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${access}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      redirect('/');
    }
    const data = await res.json();
    if (!data?.isAdmin) {
      redirect('/');
    }
  }

  return (
    <ClientDashboard>
      {children}
    </ClientDashboard>
  );
}
