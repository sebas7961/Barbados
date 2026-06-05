export default function AdminPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Panel de administración</h1>
      <nav className="flex gap-4">
        <a href="/admin/agenda" className="text-primary hover:underline">Agenda</a>
        <a href="/admin/servicios" className="text-primary hover:underline">Servicios</a>
        <a href="/admin/metricas" className="text-primary hover:underline">Métricas</a>
      </nav>
    </main>
  )
}
