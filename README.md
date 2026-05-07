# CosmoChain 360 — E-commerce Cosmétiques + BI/IA Supply Chain

Plateforme complète conforme aux exigences QC/Canada (Loi 25, OPC, Santé Canada, CASL, PCI DSS).

## Stack technique

- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Base de données** : MongoDB (Mongoose)
- **Auth** : NextAuth.js (JWT)
- **Paiements** : Stripe (tokenisation, PCI DSS compliant)
- **Analytics** : Recharts
- **Validation** : Zod + React Hook Form

## Structure du projet

```
cosmochain360/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage
│   │   ├── shop/
│   │   │   ├── products/               # Catalogue + fiche produit
│   │   │   ├── cart/                   # Panier
│   │   │   ├── checkout/               # Checkout Stripe + success
│   │   │   └── account/               # Compte client
│   │   ├── admin/
│   │   │   ├── page.tsx               # Dashboard KPIs
│   │   │   ├── orders/                # Gestion commandes
│   │   │   ├── inventory/             # Inventaire + alertes ROP
│   │   │   ├── suppliers/             # Score risque fournisseurs
│   │   │   ├── analytics/             # Tableaux de bord BI
│   │   │   └── forecast/              # Prévisions IA
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/              # Consentements Loi 25
│   │   └── api/
│   │       ├── products/              # CRUD produits (INCI)
│   │       ├── orders/                # Commandes + taxes QC
│   │       ├── inventory/             # Stocks + alertes ROP
│   │       ├── suppliers/             # Score risque A/B/C
│   │       ├── forecast/              # IA: moving average 12w
│   │       ├── auth/                  # NextAuth + register
│   │       └── stripe/                # Payment intent + webhook
│   ├── models/                        # Mongoose schemas
│   │   ├── User.ts                    # Utilisateurs + consentements
│   │   ├── Product.ts                 # Produits INCI + traçabilité
│   │   ├── Order.ts                   # Commandes + OPC compliance
│   │   ├── Inventory.ts               # Stocks par site
│   │   ├── Supplier.ts               # Fournisseurs + KPIs
│   │   └── Forecast.ts               # Prévisions IA
│   ├── lib/
│   │   ├── db.ts                      # Connexion MongoDB
│   │   ├── auth.ts                    # Config NextAuth
│   │   └── utils.ts                   # Taxes QC, ROP, MAPE, etc.
│   ├── context/
│   │   ├── CartContext.tsx            # Panier (localStorage)
│   │   └── LanguageContext.tsx        # Bilingue FR/EN
│   └── components/
│       ├── shop/                      # Header, Footer, ProductCard
│       ├── admin/                     # Composants back-office
│       └── ui/                        # Providers
└── scripts/
    └── seed.js                        # Données de démonstration
```

## Installation

### 1. Prérequis
- Node.js >= 18
- MongoDB (local ou Atlas)
- Compte Stripe (test mode)

### 2. Configuration

```bash
# Copier le fichier d'environnement
cp .env.local.example .env.local
```

Remplir `.env.local` :

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-32-caracteres-minimum

MONGODB_URI=mongodb://localhost:27017/cosmochain360

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Installation des dépendances

```bash
npm install
```

### 4. Seed de la base de données

```bash
npm run seed
```

Crée :
- Admin : `admin@cosmochain360.ca` / `Admin@2025!`
- 3 produits de démonstration avec INCI
- 3 fournisseurs avec scores de risque
- Inventaire initial par site

### 5. Lancer le projet

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### 6. Stripe Webhook (développement)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copier le `whsec_...` dans `.env.local`

## Accès

| URL | Description |
|-----|-------------|
| `/` | Homepage |
| `/shop/products` | Catalogue |
| `/auth/login` | Connexion |
| `/auth/register` | Inscription (consentements Loi 25) |
| `/shop/cart` | Panier |
| `/shop/checkout` | Paiement Stripe |
| `/admin` | Dashboard BI (admin requis) |
| `/admin/orders` | Gestion commandes |
| `/admin/inventory` | Inventaire + alertes ROP |
| `/admin/suppliers` | Scores risque fournisseurs A/B/C |
| `/admin/analytics` | Tableaux de bord opérationnels |

## Conformité implémentée

| Exigence | Implémentation |
|----------|---------------|
| **Loi 25 QC** | Consentements granulaires à l'inscription, date enregistrée |
| **OPC Québec** | Notice précontractuelle checkout, `contractSentAt` dans Order |
| **Santé Canada** | Champ `healthCanadaCnf` produit, INCI complet, bilingue FR/EN |
| **CASL** | Consentement marketing explicite, désabonnement prévu |
| **PCI DSS** | Tokenisation Stripe, pas de stockage PAN, TLS, MFA admin |
| **WCAG 2.1** | Contraste, sémantique HTML, navigation clavier |

## Calculs IA Supply Chain

### Prévision de la demande
- Modèle : Moyenne mobile 12 semaines (SKU × Site × Semaine)
- Métriques : MAPE/MAE avec backtest glissant
- Endpoint : `POST /api/forecast`

### Reorder Point (ROP)
```
ROP = Demande_quotidienne_moy × Délai_appro + Stock_sécurité
Stock_sécurité = z × σ_demande × √(délai_en_semaines)
z = 1.65 pour niveau de service 95%
```

### Score risque fournisseurs
```
Score = OTD(40%) + Qualité(35%) + Incidents(15%) + Écart_prix(10%)
Grade A: ≥ 80 | Grade B: 60-79 | Grade C: < 60
```

## Build production

```bash
npm run build
npm run start
```

## Variables d'environnement (production)

Ajouter sur Vercel/Railway/etc :
- `NEXTAUTH_URL` = URL de production
- `MONGODB_URI` = MongoDB Atlas URI
- `STRIPE_*` = Clés Stripe live
- `NEXTAUTH_SECRET` = Secret sécurisé
