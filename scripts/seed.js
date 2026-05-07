const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cosmochain360'

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  await mongoose.connection.db.dropDatabase()
  console.log('🗑 Database cleared')

  const User = require('../src/models/User').default

  await User.create({
    email: 'admin@cosmochain360.ca',
    password: 'Admin@2025!',
    firstName: 'Admin',
    lastName: 'CosmoChain',
    role: 'admin',
    marketingConsent: false,
    analyticsConsent: true,
    consentDate: new Date(),
  })

  console.log('👤 Admin user created: admin@cosmochain360.ca / Admin@2025!')

  const Supplier = require('../src/models/Supplier').default

  const suppliers = await Supplier.insertMany([
    {
      code: 'SUP-001',
      name: 'BioActif Inc.',
      sapVendorCode: 'V10001',
      contact: {
        name: 'Marie Tremblay',
        email: 'marie@bioactif.ca',
        phone: '514-555-0101',
      },
      otd: 96,
      qualityScore: 94,
      incidents: 1,
      priceVariance: 2,
      riskScore: 92,
      riskGrade: 'A',
      leadTimeDays: 10,
      paymentTerms: 'Net30',
      currency: 'CAD',
    },
    {
      code: 'SUP-002',
      name: 'NaturaLab QC',
      sapVendorCode: 'V10002',
      contact: {
        name: 'Jean Côté',
        email: 'jean@naturalab.ca',
        phone: '514-555-0102',
      },
      otd: 89,
      qualityScore: 85,
      incidents: 4,
      priceVariance: 8,
      riskScore: 74,
      riskGrade: 'B',
      leadTimeDays: 14,
      paymentTerms: 'Net45',
      currency: 'CAD',
    },
    {
      code: 'SUP-003',
      name: 'PlantExtract EU',
      sapVendorCode: 'V10003',
      contact: {
        name: 'Sophie Martin',
        email: 'sophie@plantextract.fr',
        phone: '+33-1-555-0103',
      },
      otd: 78,
      qualityScore: 80,
      incidents: 6,
      priceVariance: 15,
      riskScore: 61,
      riskGrade: 'C',
      leadTimeDays: 21,
      paymentTerms: 'Net60',
      currency: 'EUR',
    },
  ])

  console.log('🏭 Suppliers created')

  const Product = require('../src/models/Product').default

  const products = await Product.insertMany([
    {
      sku: 'SKU-SERUM-001',
      slug: 'serum-vitamine-c-eclat',
      nameFr: 'Sérum Vitamine C Éclat',
      nameEn: 'Vitamin C Brightening Serum',
      descriptionFr:
        'Un sérum concentré à la vitamine C pure pour illuminer et unifier le teint. Formule antioxydante puissante pour un éclat naturel.',
      descriptionEn:
        'A concentrated serum with pure Vitamin C to brighten and even out skin tone. Powerful antioxidant formula for a natural glow.',
      brand: 'CosmoActif',
      category: 'soin-visage',
      skinTypes: ['tous'],
      inci:
        'Aqua, Ascorbic Acid (10%), Glycerin, Niacinamide, Hyaluronic Acid, Panthenol, Tocopherol, Citric Acid, Sodium Hydroxide, Phenoxyethanol, Ethylhexylglycerin',
      warnings: ['Éviter le contact avec les yeux', 'Peut sensibiliser au soleil'],
      usageFr:
        "Appliquer 2-3 gouttes matin et/ou soir sur le visage propre. Suivre d'une crème hydratante avec FPS le matin.",
      usageEn:
        'Apply 2-3 drops morning and/or evening on clean face. Follow with SPF moisturizer in the morning.',
      pao: '12M',
      importerFr:
        'CosmoChain 360 Inc., 1234 Rue de la Beauté, Montréal, QC H3A 1A1',
      importerEn:
        'CosmoChain 360 Inc., 1234 Beauty Street, Montreal, QC H3A 1A1',
      images: [],
      price: 42.99,
      compareAtPrice: 54.99,
      tags: ['vitamine-c', 'eclat', 'antioxydant', 'serum'],
      isActive: true,
      isFeatured: true,
      healthCanadaCnf: 'CNF-2024-00123',
      weight: 30,
      supplierId: suppliers[0]._id,
      reorderPoint: 15,
      safetyStock: 8,
      leadTimeDays: 10,
    },
    {
      sku: 'SKU-CREME-002',
      slug: 'creme-hydratante-quotidienne',
      nameFr: 'Crème Hydratante Quotidienne',
      nameEn: 'Daily Moisturizing Cream',
      descriptionFr:
        'Une crème légère et non comédogène pour hydrater la peau en profondeur. Convient à tous les types de peau.',
      descriptionEn:
        'A light, non-comedogenic cream for deep skin hydration. Suitable for all skin types.',
      brand: 'CosmoActif',
      category: 'soin-visage',
      skinTypes: ['normal', 'mixte', 'sec'],
      inci:
        'Aqua, Glycerin, Cetearyl Alcohol, Shea Butter, Jojoba Oil, Hyaluronic Acid, Allantoin, Panthenol, Carbomer, Phenoxyethanol',
      warnings: [],
      usageFr:
        'Appliquer le matin et/ou le soir sur le visage et le cou, après le sérum.',
      usageEn:
        'Apply morning and/or evening on face and neck, after serum.',
      pao: '12M',
      importerFr:
        'CosmoChain 360 Inc., 1234 Rue de la Beauté, Montréal, QC H3A 1A1',
      importerEn:
        'CosmoChain 360 Inc., 1234 Beauty Street, Montreal, QC H3A 1A1',
      images: [],
      price: 34.99,
      tags: ['hydratant', 'quotidien', 'tous-types'],
      isActive: true,
      isFeatured: true,
      weight: 50,
      supplierId: suppliers[0]._id,
      reorderPoint: 20,
      safetyStock: 10,
      leadTimeDays: 10,
    },
    {
      sku: 'SKU-HUILE-003',
      slug: 'huile-rosehip-bio',
      nameFr: 'Huile Rosehip Bio',
      nameEn: 'Organic Rosehip Oil',
      descriptionFr:
        'Huile de cynorhodon bio pure, riche en acides gras essentiels et en vitamine E. Régénérante et anti-âge.',
      descriptionEn:
        'Pure organic rosehip oil, rich in essential fatty acids and Vitamin E. Regenerating and anti-aging.',
      brand: 'NaturaEco',
      category: 'soin-visage',
      skinTypes: ['sec', 'normal', 'sensible'],
      inci: 'Rosa Canina Fruit Oil 100%',
      warnings: ['Ne pas utiliser sur les peaux grasses'],
      usageFr:
        'Appliquer 3-5 gouttes le soir sur le visage. Peut être mélangée à la crème.',
      usageEn:
        'Apply 3-5 drops in the evening on face. Can be mixed with moisturizer.',
      pao: '12M',
      importerFr:
        'CosmoChain 360 Inc., 1234 Rue de la Beauté, Montréal, QC H3A 1A1',
      importerEn:
        'CosmoChain 360 Inc., 1234 Beauty Street, Montreal, QC H3A 1A1',
      images: [],
      price: 28.99,
      tags: ['bio', 'rosehip', 'anti-age', 'huile'],
      isActive: true,
      weight: 30,
      supplierId: suppliers[1]._id,
      reorderPoint: 12,
      safetyStock: 6,
      leadTimeDays: 14,
    },
  ])

  console.log('💄 Products created')

  const Inventory = require('../src/models/Inventory').default

  for (const product of products) {
    await Inventory.create({
      productId: product._id,
      site: 'MTL-01',
      quantity: Math.floor(Math.random() * 100) + 20,
      reserved: Math.floor(Math.random() * 10),
      sapMaterialCode: `MAT-${product.sku}`,
    })
  }

  console.log('📦 Inventory created')

  console.log('\n🎉 Seed terminé avec succès !')
  console.log('📌 Admin: admin@cosmochain360.ca / Admin@2025!')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(async (err) => {
  console.error('❌ Seed error:', err)
  await mongoose.disconnect()
  process.exit(1)
})