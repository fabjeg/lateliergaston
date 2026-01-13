# Configuration Stripe - L'Atelier de Gaston

Ce guide vous explique comment configurer Stripe pour accepter les paiements sur votre site e-commerce.

## Étape 1: Créer un compte Stripe

1. Allez sur [Stripe.com](https://stripe.com)
2. Cliquez sur "Start now" ou "S'inscrire"
3. Créez votre compte avec votre email
4. Remplissez les informations sur votre entreprise

⚠️ **Important**: Stripe est gratuit à l'installation. Vous ne payez que **2,9% + 0,25€ par transaction réussie**.

## Étape 2: Activer le mode Test

Par défaut, Stripe vous place en mode TEST. C'est parfait pour développer!

- **Mode Test**: Utilisez des cartes de crédit fictives pour tester
- **Mode Production**: Acceptez de vrais paiements (à activer plus tard)

Vous pouvez basculer entre les deux modes via le toggle en haut à droite.

## Étape 3: Obtenir votre clé publique

1. Dans le dashboard Stripe, allez dans **Developers** > **API keys**
2. Vous verrez deux clés en mode Test:
   - **Publishable key** (commence par `pk_test_...`) → ✅ À copier
   - **Secret key** (commence par `sk_test_...`) → ⚠️ Ne PAS mettre dans le code frontend!

3. Copiez la **Publishable key**
4. Ajoutez-la dans votre fichier `.env`:
   ```env
   VITE_STRIPE_PUBLIC_KEY=pk_test_51...
   ```

## Étape 4: Créer les produits dans Stripe

Vous devez créer 10 produits dans Stripe (un par œuvre) + 3 produits pour la livraison.

### A. Créer les 10 œuvres

1. Dans le dashboard, allez dans **Product catalog** > **Products**
2. Cliquez sur **+ Add product**
3. Pour chaque œuvre:
   - **Name**: Œuvre 1, Œuvre 2, etc.
   - **Description**: Broderie colorée sur photographie. Pièce reproductible.
   - **Pricing**:
     - One time
     - Price: 450 EUR
   - **Image**: Uploadez l'image correspondante (optionnel mais recommandé)
4. Cliquez sur **Save product**
5. **Copiez le Price ID** (commence par `price_...`)

Répétez pour les 10 œuvres.

### B. Créer les 3 options de livraison

Créez 3 produits séparés pour la livraison:

**Produit 1: Livraison France**
- Name: Livraison France
- Price: 15 EUR
- Copiez le Price ID → `price_shipping_fr`

**Produit 2: Livraison Europe**
- Name: Livraison Europe
- Price: 25 EUR
- Copiez le Price ID → `price_shipping_eu`

**Produit 3: Livraison Monde**
- Name: Livraison Reste du Monde
- Price: 40 EUR
- Copiez le Price ID → `price_shipping_world`

## Étape 5: Ajouter les Price IDs dans le code

### A. Mettre à jour src/data/products.js

Ouvrez `src/data/products.js` et ajoutez les Price IDs:

```javascript
export const products = [
  {
    id: 1,
    name: 'Œuvre 1',
    price: 450.00,
    image: img1,
    imageFilename: '561676007_17858710800524609_966159427435168161_n.jpg',
    description: 'Broderie colorée sur photographie noir et blanc. Pièce unique réalisée avec soin.',
    stripePriceId: 'price_xxxxxxxxxxxxx' // ← Collez ici le Price ID de Œuvre 1
  },
  // ... répétez pour les 10 œuvres
]
```

### B. Mettre à jour src/utils/shipping.js

Ouvrez `src/utils/shipping.js` et ajoutez les Price IDs de livraison:

```javascript
export const SHIPPING_RATES = {
  FR: {
    name: 'France',
    price: 15.00,
    stripePriceId: 'price_xxxxxxxxxxxxx' // ← Price ID Livraison France
  },
  EU: {
    name: 'Europe',
    price: 25.00,
    stripePriceId: 'price_xxxxxxxxxxxxx' // ← Price ID Livraison Europe
  },
  WORLD: {
    name: 'Reste du monde',
    price: 40.00,
    stripePriceId: 'price_xxxxxxxxxxxxx' // ← Price ID Livraison Monde
  }
}
```

## Étape 6: Tester le paiement

### Cartes de test Stripe

En mode Test, utilisez ces numéros de carte:

| Carte | Numéro | Résultat |
|-------|--------|----------|
| **Succès** | `4242 4242 4242 4242` | Paiement réussi |
| **Refusé** | `4000 0000 0000 0002` | Carte refusée |
| **3D Secure** | `4000 0025 0000 3155` | Requiert authentification |

Pour tous les tests:
- **Date d'expiration**: N'importe quelle date future (ex: 12/25)
- **CVC**: N'importe quel 3 chiffres (ex: 123)
- **Code postal**: N'importe lequel (ex: 75001)

### Faire un test d'achat

1. Lancez votre site: `npm run dev`
2. Allez sur `/shop`
3. Ajoutez une œuvre au panier
4. Allez au panier `/cart`
5. Sélectionnez une zone de livraison
6. Cliquez sur **"Procéder au paiement"**
7. Vous êtes redirigé vers Stripe Checkout
8. Utilisez la carte `4242 4242 4242 4242`
9. Validez le paiement
10. Vous êtes redirigé vers `/success`

### Vérifier le paiement dans Stripe

1. Allez dans **Payments** dans le dashboard Stripe
2. Vous devriez voir votre paiement de test
3. Cliquez dessus pour voir les détails

## Étape 7: Emails de confirmation

Stripe envoie automatiquement des emails de reçu aux clients.

### Activer les emails Stripe

1. Dans Stripe Dashboard, allez dans **Settings** > **Emails**
2. Activez **Successful payments**
3. Personnalisez le template si vous voulez

### Ajouter votre logo (optionnel)

1. Allez dans **Settings** > **Branding**
2. Uploadez votre logo
3. Il apparaîtra dans les emails et sur la page Stripe Checkout

## Étape 8: Passer en mode Production (quand prêt)

⚠️ **NE FAITES CECI QUE QUAND VOUS ÊTES PRÊT À ACCEPTER DE VRAIS PAIEMENTS!**

### Pré-requis

Stripe vous demandera de:
- Vérifier votre identité (pièce d'identité)
- Ajouter vos informations bancaires (pour recevoir les paiements)
- Confirmer l'adresse de votre entreprise

### Activation

1. Basculez vers le mode **Production** (toggle en haut à droite)
2. Récupérez votre **Publishable key de production** (commence par `pk_live_...`)
3. Mettez à jour votre `.env` en production:
   ```env
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
   ```
4. Redéployez votre site

5. **IMPORTANT**: Les Price IDs sont différents en production!
   - Recréez les 10 produits + 3 livraisons en mode Production
   - Copiez les nouveaux Price IDs
   - Mettez à jour `products.js` et `shipping.js` en production

## Dépannage

### Erreur: "Stripe n'a pas pu être chargé"
- Vérifiez que `VITE_STRIPE_PUBLIC_KEY` est bien dans `.env`
- Redémarrez le serveur de développement (`npm run dev`)
- Vérifiez que la clé commence par `pk_test_` (mode test) ou `pk_live_` (production)

### Erreur: "L'article n'a pas de prix Stripe configuré"
- Vérifiez que tous les `stripePriceId` sont remplis dans `products.js`
- Les Price IDs doivent commencer par `price_`

### Le paiement ne fonctionne pas
- Vérifiez que vous êtes en mode Test dans Stripe
- Utilisez la carte de test `4242 4242 4242 4242`
- Ouvrez la console du navigateur pour voir les erreurs

### La redirection après paiement ne fonctionne pas
- Vérifiez que la route `/success` existe dans App.jsx
- Vérifiez que l'URL de succès dans `checkoutService.js` est correcte

## Coûts et frais

### Frais Stripe
- **Pas de frais fixes**
- **Par transaction réussie**: 2,9% + 0,25€
- Exemple: Pour une vente de 450€ + 15€ livraison = 465€
  - Frais Stripe: (465 × 0.029) + 0.25 = **13,74€ + 0,25€ = 13,99€**
  - Vous recevez: **451,01€**

### Délais de paiement
- Les fonds sont transférés sur votre compte bancaire tous les **2-7 jours ouvrés**
- Configurable dans **Settings** > **Payouts**

## Prochaines étapes

Une fois Stripe configuré et testé:
- ✅ Les clients peuvent payer par carte bancaire
- ✅ Vous recevez l'argent sur votre compte bancaire
- ✅ Les emails de confirmation sont envoyés automatiquement
- ❌ L'inventaire n'est pas encore mis à jour automatiquement → **Phase 5: Webhooks**

Pour mettre à jour automatiquement Firebase quand une vente est faite, suivez la Phase 5 du plan d'implémentation.

---

## Support

Si vous avez des questions sur Stripe:
- Documentation: https://stripe.com/docs
- Support Stripe: Dans le dashboard, cliquez sur "?" en haut à droite
