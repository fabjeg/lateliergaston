# Comment tester le checkout Stripe

## ✅ Configuration actuelle

**Produits configurés avec Stripe:**
- ✅ Œuvre 1: `price_1SpCH8Fx9HGSvAHCsRuVYTIa`
- ✅ Œuvre 2: `price_1SpDziFx9HGSvAHCEeloW918`

**Produits restants (3-10):**
- ⏳ À configurer dans Stripe Dashboard

**Frais de livraison:**
- ⏳ Pas encore configurés dans Stripe
- Le checkout fonctionne SANS frais de livraison pour l'instant
- Total = Prix du produit uniquement (450€)

---

## 🧪 Tester le paiement (Mode Test)

### Étape 1: Démarrer le site
```bash
npm run dev
```

### Étape 2: Ajouter des produits au panier
1. Allez sur http://localhost:5173/shop
2. Cliquez sur **Œuvre 1** ou **Œuvre 2** (seules configurées)
3. Ajoutez la quantité souhaitée
4. Cliquez sur "Ajouter au panier"

### Étape 3: Aller au panier
1. Cliquez sur l'icône panier dans le header
2. Vérifiez les produits et quantités
3. Sélectionnez la zone de livraison (France, Europe, Monde)
4. Cliquez sur "Procéder au paiement"

### Étape 4: Page Stripe Checkout
Vous serez redirigé vers Stripe. Utilisez une **carte de test**:

**Carte de test qui fonctionne:**
- Numéro: `4242 4242 4242 4242`
- Date: N'importe quelle date future (ex: 12/25)
- CVC: N'importe quel 3 chiffres (ex: 123)
- Code postal: N'importe lequel

**Autres cartes de test:**
- Paiement décliné: `4000 0000 0000 0002`
- Authentification 3D Secure: `4000 0025 0000 3155`

### Étape 5: Confirmation
Après paiement réussi:
- Vous serez redirigé vers `/success`
- Le panier sera vidé automatiquement
- Vous verrez votre numéro de commande

---

## 🚨 Important: Erreurs possibles

### "L'article n'a pas de prix Stripe configuré"
**Cause:** Vous essayez d'acheter Œuvre 3-10 qui n'ont pas encore de Price ID

**Solution:** N'ajoutez au panier que Œuvre 1 ou Œuvre 2 pour l'instant

### Le checkout ne s'ouvre pas
**Cause:** Vérifiez la console pour les erreurs

**Solution:**
1. Vérifiez que `.env` contient la clé Stripe
2. Rechargez la page
3. Vérifiez la console navigateur (F12)

---

## 📋 TODO: Prochaines étapes

Pour compléter la configuration:

1. **Créer les 8 produits restants dans Stripe:**
   - Œuvre 3 à Œuvre 10
   - Prix: 450€ chacune

2. **Créer 3 produits "Livraison":**
   - Livraison France: 15€
   - Livraison Europe: 25€
   - Livraison Monde: 40€

3. **Mettre à jour `src/data/products.js`** avec les nouveaux Price IDs

4. **Mettre à jour `src/utils/shipping.js`** avec les Price IDs de livraison

---

## 🔍 Vérifier le paiement dans Stripe

Après un test de paiement:

1. Allez sur https://dashboard.stripe.com/test/payments
2. Vous verrez votre paiement de test
3. Statut: "Réussi" (Succeeded)
4. Montant: 450€ + frais de livraison

---

## 💡 Notes

- **Mode Test:** Aucun argent réel n'est débité
- **Firebase:** Désactivé pour l'instant (sera ajouté à la fin)
- **Inventaire:** Tous les produits sont disponibles
- **Emails:** Pas encore configurés (sera ajouté plus tard)

**Le checkout fonctionne pour Œuvre 1 et Œuvre 2!** 🎉
