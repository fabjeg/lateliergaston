# ⚠️ Système de paiement temporairement désactivé

## 📋 État actuel

Le site fonctionne comme une **boutique vitrine** avec panier fonctionnel mais **sans paiement en ligne**.

### ✅ Fonctionnalités actives

**Navigation:**
- Page d'accueil avec galerie
- Boutique avec tous les produits
- Pages de détail des produits
- Page À propos
- Page Contact

**Panier:**
- ✅ Ajouter des produits au panier
- ✅ Modifier les quantités
- ✅ Supprimer des produits
- ✅ Voir le sous-total
- ✅ Sélectionner la zone de livraison
- ✅ Voir les frais de livraison
- ✅ Voir le total

### ❌ Fonctionnalités désactivées

- ❌ Bouton "Procéder au paiement" (grisé et désactivé)
- ❌ Redirection vers Stripe
- ❌ Paiement en ligne

---

## 👁️ Ce que voient les visiteurs

Quand un visiteur accède à son panier avec des produits:

1. Il voit tous ses articles
2. Il peut modifier les quantités
3. Il voit le total avec frais de livraison
4. Il voit un **message jaune** :
   ```
   💳 Paiements temporairement désactivés

   Le système de paiement en ligne sera bientôt disponible.
   Pour toute commande, veuillez nous contacter directement.
   ```
5. Le bouton "Procéder au paiement" est **grisé et désactivé**

---

## 🔧 Pour réactiver le paiement plus tard

Quand vous serez prêt à activer les paiements:

### Étape 1: Modifier Cart.jsx

Ouvrez `src/pages/Cart.jsx` et:

1. **Décommenter le code du handleCheckout** (lignes 26-44):
   ```javascript
   const handleCheckout = async () => {
     setError(null)
     setIsProcessing(true)
     // ... décommenter tout le code
   }
   ```

2. **Supprimer ou commenter le message de désactivation** (lignes 147-153):
   ```javascript
   // Supprimer ou commenter ce bloc:
   // <div className="checkout-disabled-notice">
   //   ...
   // </div>
   ```

3. **Réactiver le bouton** (ligne 158):
   ```javascript
   disabled={isProcessing}  // Au lieu de disabled={true}
   ```

### Étape 2: Finir la configuration Stripe

1. Créer les 8 produits restants (Œuvre 3-10)
2. Créer les 3 produits de livraison (France, Europe, Monde)
3. Mettre à jour `src/data/products.js` avec les Price IDs
4. Mettre à jour `src/utils/shipping.js` avec les Price IDs de livraison

### Étape 3: Tester

1. Tester le checkout avec carte de test: `4242 4242 4242 4242`
2. Vérifier la redirection vers `/success`
3. Vérifier dans Stripe Dashboard que les paiements apparaissent

### Étape 4: (Optionnel) Ajouter Firebase

Pour gérer l'inventaire et marquer les produits vendus:
1. Configurer Firebase
2. Réactiver InventoryContext avec Firebase
3. Créer les webhooks Stripe

---

## 📝 Résumé technique

**Fichiers modifiés:**
- `src/pages/Cart.jsx` - Code checkout commenté, bouton désactivé
- `src/pages/Cart.css` - Styles pour le message de désactivation

**Code Stripe:**
- ✅ Toujours présent et fonctionnel
- ✅ Prêt à être réactivé
- ✅ 2 produits configurés (Œuvre 1 et 2)

**Firebase:**
- ❌ Supprimé (sera ajouté à la fin)

---

## 🎯 État du projet

Le site est maintenant:
- ✅ Rapide et performant (images WebP optimisées)
- ✅ Responsive (mobile, tablette, desktop)
- ✅ Avec panier fonctionnel
- ✅ Sans paiement en ligne (temporairement)
- ✅ Prêt pour déploiement comme vitrine

**Parfait pour montrer le site aux visiteurs sans qu'ils puissent payer!** 🎉
