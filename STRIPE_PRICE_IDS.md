# Price IDs Stripe - À compléter

Remplissez ce fichier au fur et à mesure que vous créez les produits dans Stripe.

## Produits (Œuvres)

Créez chaque œuvre dans Stripe Dashboard > Products > Add product

| Œuvre | Price (EUR) | Price ID Stripe |
|-------|-------------|-----------------|
| Œuvre 1 | 450.00 | price_______________ |
| Œuvre 2 | 450.00 | price_______________ |
| Œuvre 3 | 450.00 | price_______________ |
| Œuvre 4 | 450.00 | price_______________ |
| Œuvre 5 | 450.00 | price_______________ |
| Œuvre 6 | 450.00 | price_______________ |
| Œuvre 7 | 450.00 | price_______________ |
| Œuvre 8 | 450.00 | price_______________ |
| Œuvre 9 | 450.00 | price_______________ |
| Œuvre 10 | 450.00 | price_______________ |

## Livraison

| Zone | Price (EUR) | Price ID Stripe |
|------|-------------|-----------------|
| France | 15.00 | price_______________ |
| Europe | 25.00 | price_______________ |
| Reste du monde | 40.00 | price_______________ |

---

## Comment obtenir un Price ID dans Stripe:

1. Dashboard Stripe > **Product catalog** > **Products**
2. Cliquez sur **"+ Add product"**
3. Remplissez:
   - Name: (ex: "Œuvre 1")
   - Price: (ex: 450 EUR)
   - Description: (optionnel)
4. Cliquez **"Save product"**
5. Dans la page du produit, cliquez sur le prix
6. Copiez le **Price ID** (commence par `price_...`)
7. Collez-le dans le tableau ci-dessus

---

## Une fois tous les Price IDs obtenus:

Revenez vers Claude qui vous aidera à mettre à jour automatiquement les fichiers:
- `src/data/products.js` (pour les 10 œuvres)
- `src/utils/shipping.js` (pour les 3 options de livraison)
