'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)

    const payload = {
      sku: form.get('sku'),
      nameFr: form.get('nameFr'),
      nameEn: form.get('nameEn'),
      descriptionFr: form.get('descriptionFr'),
      descriptionEn: form.get('descriptionEn'),
      brand: form.get('brand'),
      category: form.get('category'),
      skinTypes: String(form.get('skinTypes') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      inci: form.get('inci'),
      warnings: String(form.get('warnings') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      usageFr: form.get('usageFr'),
      usageEn: form.get('usageEn'),
      pao: form.get('pao'),
      importerFr: form.get('importerFr'),
      importerEn: form.get('importerEn'),
      price: Number(form.get('price')),
      compareAtPrice: form.get('compareAtPrice')
        ? Number(form.get('compareAtPrice'))
        : undefined,
      tags: String(form.get('tags') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      images: [],
      variants: [],
      isActive: true,
      isFeatured: form.get('isFeatured') === 'on',
      healthCanadaCnf: form.get('healthCanadaCnf'),
      weight: Number(form.get('weight')),
      reorderPoint: Number(form.get('reorderPoint')),
      safetyStock: Number(form.get('safetyStock')),
      leadTimeDays: Number(form.get('leadTimeDays')),
    }

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setLoading(false)

    if (!res.ok) {
      toast.error('Erreur lors de la création du produit')
      return
    }

    toast.success('Produit créé avec succès')
    router.push('/admin/products')
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-brand-500"
        >
          <ArrowLeft size={16} />
          Retour aux produits
        </Link>

        <h1 className="font-display text-3xl font-bold text-neutral-950">
          Nouveau produit
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Ajouter un produit cosmétique avec ses informations commerciales et réglementaires.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-8 p-6">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Informations générales
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input name="sku" required placeholder="SKU *" className="input-field" />
            <input name="brand" required placeholder="Marque *" className="input-field" />
            <input name="nameFr" required placeholder="Nom français *" className="input-field" />
            <input name="nameEn" required placeholder="Nom anglais *" className="input-field" />

            <select name="category" required className="input-field">
              <option value="">Catégorie *</option>
              <option value="soin-visage">Soin visage</option>
              <option value="soin-corps">Soin corps</option>
              <option value="maquillage">Maquillage</option>
              <option value="soin-cheveux">Soin cheveux</option>
              <option value="parfumerie">Parfumerie</option>
              <option value="solaire">Solaire</option>
            </select>

            <input
              name="skinTypes"
              placeholder="Types de peau : normal, sec, sensible"
              className="input-field"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <textarea
              name="descriptionFr"
              required
              placeholder="Description française *"
              className="input-field min-h-28"
            />
            <textarea
              name="descriptionEn"
              required
              placeholder="Description anglaise *"
              className="input-field min-h-28"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Prix & logistique
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <input name="price" required type="number" step="0.01" placeholder="Prix *" className="input-field" />
            <input name="compareAtPrice" type="number" step="0.01" placeholder="Prix barré" className="input-field" />
            <input name="weight" required type="number" placeholder="Poids en g *" className="input-field" />
            <input name="pao" required placeholder="PAO ex: 12M *" className="input-field" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <input name="reorderPoint" required type="number" defaultValue={10} placeholder="Point de commande" className="input-field" />
            <input name="safetyStock" required type="number" defaultValue={5} placeholder="Stock sécurité" className="input-field" />
            <input name="leadTimeDays" required type="number" defaultValue={14} placeholder="Lead time jours" className="input-field" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Conformité cosmétique
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              name="healthCanadaCnf"
              placeholder="Numéro CNF Santé Canada"
              className="input-field"
            />
            <input
              name="warnings"
              placeholder="Avertissements séparés par virgules"
              className="input-field"
            />
          </div>

          <textarea
            name="inci"
            required
            placeholder="Liste INCI des ingrédients *"
            className="input-field mt-4 min-h-28"
          />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <textarea
              name="usageFr"
              required
              placeholder="Mode d'emploi français *"
              className="input-field min-h-24"
            />
            <textarea
              name="usageEn"
              required
              placeholder="Mode d'emploi anglais *"
              className="input-field min-h-24"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <textarea
              name="importerFr"
              required
              placeholder="Importateur FR *"
              className="input-field min-h-20"
            />
            <textarea
              name="importerEn"
              required
              placeholder="Importateur EN *"
              className="input-field min-h-20"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Marketing
          </h2>

          <input
            name="tags"
            placeholder="Tags séparés par virgules : serum, vitamine-c, hydratant"
            className="input-field"
          />

          <label className="mt-4 flex items-center gap-3 text-sm text-neutral-700">
            <input type="checkbox" name="isFeatured" className="h-4 w-4" />
            Mettre en produit vedette
          </label>
        </section>

        <div className="flex justify-end gap-3 border-t border-neutral-100 pt-6">
          <Link href="/admin/products" className="btn-outline">
            Annuler
          </Link>

          <button type="submit" disabled={loading} className="btn-primary">
            <Save size={17} className="mr-2" />
            {loading ? 'Création...' : 'Créer le produit'}
          </button>
        </div>
      </form>
    </div>
  )
}