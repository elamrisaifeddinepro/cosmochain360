export default function CookiesPage() {
  return (
    <main className="page-container py-12">
      <h1 className="font-display text-4xl font-bold text-neutral-950">
        Politique de cookies
      </h1>

      <p className="mt-4 text-neutral-600">
        CosmoChain 360 utilise certains témoins de navigation pour assurer le bon
        fonctionnement du site et améliorer l’expérience utilisateur.
      </p>

      <section className="mt-8 space-y-4 text-neutral-700">
        <h2 className="text-2xl font-semibold">Cookies nécessaires</h2>
        <p>
          Ces cookies permettent le fonctionnement essentiel du site : session,
          panier, sécurité et navigation.
        </p>

        <h2 className="text-2xl font-semibold">Cookies analytiques</h2>
        <p>
          Ces cookies peuvent être utilisés pour comprendre l’utilisation du site,
          mesurer les performances et améliorer les services, uniquement selon vos
          préférences de consentement.
        </p>

        <h2 className="text-2xl font-semibold">Cookies marketing</h2>
        <p>
          Les cookies marketing peuvent être utilisés pour personnaliser les
          communications ou mesurer l’efficacité de campagnes, si vous y consentez.
        </p>

        <h2 className="text-2xl font-semibold">Gestion des préférences</h2>
        <p>
          Vous pouvez modifier vos préférences de consentement depuis votre compte
          ou via les paramètres de votre navigateur.
        </p>
      </section>
    </main>
  )
}