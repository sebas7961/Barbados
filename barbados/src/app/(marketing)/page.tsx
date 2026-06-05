export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight">Barbados</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          El mejor corte de la ciudad. Reserva tu cita en segundos.
        </p>
        <a
          href="/reservar"
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Reservar ahora
        </a>
      </section>
    </main>
  )
}
