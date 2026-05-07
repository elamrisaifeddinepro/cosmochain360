export default function ConfidentialitePage() {
  return (
    <main className="page-container py-12">
      <h1 className="font-display text-4xl font-bold text-neutral-950">
        Politique de confidentialité
      </h1>

      <p className="mt-4 text-neutral-600">
        CosmoChain 360 respecte la Loi 25 du Québec et s’engage à protéger les
        renseignements personnels de ses utilisateurs.
      </p>

      <section className="mt-8 space-y-4 text-neutral-700">
        <h2 className="text-2xl font-semibold">Données collectées</h2>
        <p>
          Nous pouvons collecter votre nom, adresse courriel, adresse de livraison,
          historique de commandes, préférences de consentement et données nécessaires
          au traitement de vos achats.
        </p>

        <h2 className="text-2xl font-semibold">Utilisation des données</h2>
        <p>
          Les données sont utilisées pour gérer les commandes, améliorer l’expérience
          utilisateur, assurer le service client, respecter les obligations légales et,
          si vous y consentez, envoyer des communications marketing.
        </p>

        <h2 className="text-2xl font-semibold">Consentement</h2>
        <p>
          Vous pouvez accepter ou refuser les communications marketing et l’analyse
          d’utilisation. Vos choix peuvent être modifiés à tout moment depuis votre
          compte.
        </p>

        <h2 className="text-2xl font-semibold">Conservation</h2>
        <p>
          Les renseignements sont conservés uniquement pour la durée nécessaire aux
          finalités prévues, sauf obligation légale contraire.
        </p>

        <h2 className="text-2xl font-semibold">Responsable de la protection</h2>
        <p>
          Pour toute demande concernant vos données personnelles, vous pouvez contacter
          le responsable de la protection des renseignements personnels de CosmoChain 360.
        </p>
      </section>
    </main>
  )
}