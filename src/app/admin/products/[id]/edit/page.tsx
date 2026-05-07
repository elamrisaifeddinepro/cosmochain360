'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setProduct(data)
      } catch {
        toast.error('Erreur chargement produit')
      }
    }

    fetchProduct()
  }, [id])

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
      isFeatured: form.get('isFeatured') === 'on',
      healthCanadaCnf: form.get('healthCanadaCnf'),
      batchNumber: form.get('batchNumber'),
      expiryDate: form.get('expiryDate') || undefined,
      weight: Number(form.get('weight')),
      reorderPoint: Number(form.get('reorderPoint')),
      safetyStock: Number(form.get('safetyStock')),
      leadTimeDays: Number(form.get('leadTimeDays')),
    }

    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setLoading(false)

    if (!res.ok) {
      toast.error('Erreur mise à jour')
      return
    }

    toast.success('Produit mis à jour')
    router.push('/admin/products')
  }

  if (!product) return <div className="p-10">Chargement...</div>

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
          Modifier produit
        </h1>

        <p className="mt-1 text-sm text-neutral-500">
          Modifier les informations commerciales, logistiques et réglementaires du produit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-8 p-6">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Informations générales
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input name="sku" required defaultValue={product.sku} className="input-field" />
            <input name="brand" required defaultValue={product.brand} className="input-field" />
            <input name="nameFr" required defaultValue={product.nameFr} className="input-field" />
            <input name="nameEn" required defaultValue={product.nameEn} className="input-field" />

            <select name="category" required defaultValue={product.category} className="input-field">
              <option value="soin-visage">Soin visage</option>
              <option value="soin-corps">Soin corps</option>
              <option value="maquillage">Maquillage</option>
              <option value="soin-cheveux">Soin cheveux</option>
              <option value="parfumerie">Parfumerie</option>
              <option value="solaire">Solaire</option>
            </select>

            <input
              name="skinTypes"
              defaultValue={(product.skinTypes || []).join(', ')}
              placeholder="Types de peau : normal, sec, sensible"
              className="input-field"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <textarea
              name="descriptionFr"
              required
              defaultValue={product.descriptionFr}
              className="input-field min-h-28"
            />
            <textarea
              name="descriptionEn"
              required
              defaultValue={product.descriptionEn}
              className="input-field min-h-28"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Prix & logistique
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <input name="price" required type="number" step="0.01" defaultValue={product.price} className="input-field" />
            <input name="compareAtPrice" type="number" step="0.01" defaultValue={product.compareAtPrice || ''} className="input-field" />
            <input name="weight" required type="number" defaultValue={product.weight} className="input-field" />
            <input name="pao" required defaultValue={product.pao} className="input-field" />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <input name="reorderPoint" required type="number" defaultValue={product.reorderPoint || 10} className="input-field" />
            <input name="safetyStock" required type="number" defaultValue={product.safetyStock || 5} className="input-field" />
            <input name="leadTimeDays" required type="number" defaultValue={product.leadTimeDays || 14} className="input-field" />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">
            Conformité cosmétique
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              name="healthCanadaCnf"
              defaultValue={product.healthCanadaCnf || ''}
              placeholder="Numéro CNF Santé Canada"
              className="input-field"
            />

            <input
              name="batchNumber"
              defaultValue={product.batchNumber || ''}
              placeholder="Numéro de lot"
              className="input-field"
            />

            <input
              name="expiryDate"
              type="date"
              defaultValue={product.expiryDate ? product.expiryDate.slice(0, 10) : ''}
              className="input-field"
            />

            <input
              name="warnings"
              defaultValue={(product.warnings || []).join(', ')}
              placeholder="Avertissements séparés par virgules"
              className="input-field"
            />
          </div>

          <textarea
            name="inci"
            required
            defaultValue={product.inci}
            placeholder="Liste INCI des ingrédients *"
            className="input-field mt-4 min-h-28"
          />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <textarea
              name="usageFr"
              required
              defaultValue={product.usageFr}
              className="input-field min-h-24"
            />
            <textarea
              name="usageEn"
              required
              defaultValue={product.usageEn}
              className="input-field min-h-24"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <textarea
              name="importerFr"
              required
              defaultValue={product.importerFr}
              className="input-field min-h-20"
            />
            <textarea
              name="importerEn"
              required
              defaultValue={product.importerEn}
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
            defaultValue={(product.tags || []).join(', ')}
            placeholder="Tags séparés par virgules"
            className="input-field"
          />

          <label className="mt-4 flex items-center gap-3 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={product.isFeatured}
              className="h-4 w-4"
            />
            Mettre en produit vedette
          </label>
        </section>

        <div className="flex justify-end gap-3 border-t border-neutral-100 pt-6">
          <Link href="/admin/products" className="btn-outline">
            Annuler
          </Link>

          <button type="submit" disabled={loading} className="btn-primary">
            <Save size={17} className="mr-2" />
            {loading ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </div>
      </form>
    </div>
  )
}