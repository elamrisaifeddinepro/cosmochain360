export default function ConditionsPage() {
  return (
    <main className="page-container py-12">
      <h1 className="font-display text-4xl font-bold text-neutral-950">
        Conditions de vente
      </h1>

      <p className="mt-4 text-neutral-600">
        Ces conditions encadrent les achats effectués sur CosmoChain 360,
        conformément aux exigences applicables au commerce en ligne au Québec.
      </p>

      <section className="mt-8 space-y-4 text-neutral-700">
        <h2 className="text-2xl font-semibold">Produits</h2>
        <p>
          Les informations affichées sur chaque fiche produit incluent le nom,
          le prix, la description, les ingrédients INCI, les avertissements,
          le PAO et les informations d’importation lorsque disponibles.
        </p>

        <h2 className="text-2xl font-semibold">Prix, taxes et paiement</h2>
        <p>
          Les prix sont affichés en dollars canadiens. Les taxes applicables et les
          frais de livraison sont calculés avant la confirmation de commande.
        </p>

        <h2 className="text-2xl font-semibold">Confirmation de commande</h2>
        <p>
          Après validation de l’achat, une confirmation de commande est fournie au
          client. Une preuve contractuelle peut être transmise par courriel.
        </p>

        <h2 className="text-2xl font-semibold">Livraison</h2>
        <p>
          Les délais de livraison sont estimés selon la zone desservie, la disponibilité
          du stock et le transporteur.
        </p>

        <h2 className="text-2xl font-semibold">Retours et remboursements</h2>
        <p>
          Les demandes de retour sont traitées selon l’état du produit, le délai depuis
          l’achat et les règles applicables aux produits cosmétiques.
        </p>
      </section>
    </main>
  )
}