export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-neutral-950">
          Paramètres
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Configuration générale de la plateforme CosmoChain 360.
        </p>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Boutique
          </h2>
          <p className="text-sm text-neutral-500">
            Nom, conformité, devise et préférences générales.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input className="input-field" defaultValue="CosmoChain 360" />
          <input className="input-field" defaultValue="CAD" />
          <input className="input-field" defaultValue="Québec, Canada" />
          <input className="input-field" defaultValue="Santé Canada · Loi 25 · OPC" />
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-neutral-900">
          Statut plateforme
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-green-50 p-4 text-green-700">
            API produits active
          </div>
          <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
            MongoDB connecté
          </div>
          <div className="rounded-2xl bg-pink-50 p-4 text-brand-600">
            Admin opérationnel
          </div>
        </div>
      </div>
    </div>
  )
}