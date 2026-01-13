# Guide d'optimisation de la performance

## Problème: Chargement lent de la boutique

Les images des œuvres sont probablement très lourdes (plusieurs MB chacune), ce qui ralentit le chargement.

## ✅ Optimisations déjà appliquées:

1. **Lazy loading** - Les images ne chargent que quand elles deviennent visibles
2. **Menu hamburger responsive** - Navigation mobile améliorée
3. **Optimisations CSS** - Amélioration du rendu

## 🚀 Solutions pour optimiser les images:

### Option 1: Compression en ligne (Rapide - 5 min)

**Utilisez TinyPNG** (gratuit):
1. Allez sur https://tinypng.com
2. Uploadez vos 10 images d'œuvres
3. Téléchargez les versions compressées
4. Remplacez les fichiers dans `src/assets/`

**Résultat**: Images ~70% plus légères sans perte visible de qualité

---

### Option 2: Redimensionner les images (Recommandé)

Vos images sont probablement en haute résolution (4000x3000px ou plus).
Pour le web, c'est trop!

**Dimensions recommandées:**
- **Grille boutique**: 800x600px (max)
- **Page détail produit**: 1200x900px (max)

**Outils gratuits:**
- **Windows**: Paint, Photos, ou https://www.resizepixel.com/
- **Mac**: Preview (redimensionner)
- **En ligne**: https://imageresizer.com/

**Comment faire:**
1. Ouvrez chaque image
2. Redimensionnez à 800px de largeur (hauteur automatique)
3. Exportez en JPEG avec qualité 80-85%
4. Remplacez dans `src/assets/`

---

### Option 3: Script automatique (Technique - 10 min)

Installez un outil pour optimiser automatiquement:

```bash
# Installer sharp (outil d'optimisation)
npm install --save-dev sharp

# Créer un script
node optimize-images.js
```

Je peux vous créer ce script si vous voulez!

---

## 📊 Vérifier la taille actuelle des images

```bash
# Dans le terminal, à la racine du projet:
dir src\assets\*.jpg
```

**Tailles idéales:**
- Grille boutique: 100-300 KB par image
- Page détail: 200-500 KB par image

**Si vos images font plus de 1 MB chacune, elles doivent être optimisées!**

---

## 🎯 Autres optimisations possibles:

### 1. Utiliser WebP (meilleur format)
WebP est 25-35% plus léger que JPEG:
- Convertissez vos images en `.webp`
- Support navigateur: 97%+

### 2. Lazy loading agressif
Déjà implémenté! Les images chargent uniquement quand visibles.

### 3. CDN (si beaucoup de trafic)
Hébergez les images sur un CDN comme Cloudinary (gratuit jusqu'à 25GB).

---

## 💡 Quick Win - À faire maintenant:

**Étapes simples (5 minutes):**

1. Vérifiez la taille de vos images:
   - Clic droit sur une image dans `src/assets/`
   - Propriétés > Taille
   - Si > 500 KB → Optimiser!

2. Utilisez TinyPNG.com:
   - Glissez-déposez les 10 images
   - Téléchargez le ZIP
   - Remplacez dans `src/assets/`

3. Testez:
   ```bash
   npm run dev
   ```
   Le chargement devrait être BEAUCOUP plus rapide!

---

## 🔍 Mesurer l'amélioration:

**Avant / Après:**
- Ouvrez Chrome DevTools (F12)
- Onglet **Network**
- Rechargez la page `/shop`
- Regardez le **temps de chargement total** et **taille transférée**

**Objectif:**
- Temps de chargement: < 3 secondes
- Taille totale: < 5 MB

---

## ❓ Besoin d'aide?

Dites-moi:
1. Quelle est la taille actuelle de vos images? (faites `dir src\assets\*.jpg`)
2. Voulez-vous que je crée un script automatique d'optimisation?
3. Ou préférez-vous utiliser TinyPNG manuellement?

Une fois les images optimisées, votre site chargera **5-10x plus vite**! 🚀
