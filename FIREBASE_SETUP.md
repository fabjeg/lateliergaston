# Configuration Firebase - L'Atelier de Gaston

Ce guide vous explique comment configurer Firebase pour la gestion d'inventaire de votre site e-commerce.

## Étape 1: Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet" (Add project)
3. Nommez votre projet (ex: "lateliergaston")
4. Désactivez Google Analytics (optionnel pour ce projet)
5. Cliquez sur "Créer le projet"

## Étape 2: Activer Firestore Database

1. Dans la console Firebase, allez dans **Build** > **Firestore Database**
2. Cliquez sur **Create database**
3. Choisissez le mode **Production** (nous ajouterons des règles de sécurité plus tard)
4. Choisissez une région (ex: europe-west1 pour l'Europe)
5. Cliquez sur **Activer**

## Étape 3: Obtenir les clés de configuration

1. Dans la console Firebase, cliquez sur l'icône ⚙️ (Settings) > **Project settings**
2. Descendez jusqu'à "Your apps" et cliquez sur l'icône Web `</>`
3. Enregistrez votre app (ex: "lateliergaston-web")
4. Copiez les valeurs de configuration Firebase

## Étape 4: Créer le fichier .env

1. Créez un fichier `.env` à la racine du projet (à côté de package.json)
2. Copiez le contenu de `.env.example`
3. Remplacez les valeurs avec celles de votre configuration Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=lateliergaston.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lateliergaston
VITE_FIREBASE_STORAGE_BUCKET=lateliergaston.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

⚠️ **Important**: Ne commitez JAMAIS le fichier `.env` sur Git! Il est déjà dans `.gitignore`.

## Étape 5: Initialiser les produits dans Firestore

Une fois Firebase configuré, vous devez peupler la base de données avec vos 10 œuvres.

### Option A: Via la console web (temporaire)

1. Ouvrez `src/App.jsx`
2. Importez la fonction d'initialisation:
   ```javascript
   import { initializeProducts } from './utils/initializeProducts'
   ```
3. Ajoutez dans le composant App (temporairement):
   ```javascript
   useEffect(() => {
     initializeProducts()
       .then(() => console.log('Products initialized!'))
       .catch(err => console.error('Error:', err))
   }, [])
   ```
4. Lancez l'app: `npm run dev`
5. Ouvrez la console du navigateur - vous verrez les messages de confirmation
6. **IMPORTANT**: Retirez le code d'initialisation une fois terminé!

### Option B: Via la console Firebase (manuel)

1. Allez dans **Firestore Database** > **Data**
2. Créez une collection nommée **artworks**
3. Pour chaque œuvre (ID 1 à 10), créez un document avec:
   - Document ID: `1`, `2`, `3`, etc.
   - Champs:
     - `name` (string): "Œuvre 1"
     - `price` (number): 450
     - `imageFilename` (string): nom du fichier
     - `description` (string): description
     - `isSold` (boolean): false
     - `soldAt` (timestamp): null
     - `stripePaymentId` (string): null
     - `purchaserEmail` (string): null

## Étape 6: Configurer les règles de sécurité

Dans **Firestore Database** > **Rules**, remplacez les règles par:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artworks/{artworkId} {
      // Tout le monde peut lire les produits
      allow read: if true;

      // Seul le webhook peut écrire (on configurera l'authentification plus tard)
      allow write: if false;
    }
  }
}
```

Publiez les règles.

## Étape 7: Tester

1. Lancez votre app: `npm run dev`
2. Allez sur `/shop`
3. Les produits doivent se charger depuis Firestore
4. Si une erreur apparaît, vérifiez:
   - Les variables d'environnement dans `.env`
   - Les règles de sécurité Firestore
   - La console du navigateur pour les erreurs

## Tester le système de vente

Pour tester qu'une œuvre apparaît comme vendue:

1. Dans la console Firebase > Firestore
2. Sélectionnez un document (ex: artwork "1")
3. Changez le champ `isSold` de `false` à `true`
4. Retournez sur `/shop` - l'œuvre doit afficher "VENDU"
5. Essayez de cliquer dessus - le lien est désactivé
6. Changez `isSold` à `false` pour la rendre disponible à nouveau

## Prochaines étapes

Une fois Firebase configuré et testé, vous êtes prêt pour la **Phase 4: Stripe Integration** qui permettra d'accepter les paiements et de mettre à jour automatiquement l'inventaire quand une œuvre est vendue.

---

## Dépannage

### Erreur: "Firebase: Error (auth/operation-not-allowed)"
- Vérifiez que Firestore est bien activé dans votre projet

### Erreur: "Missing or insufficient permissions"
- Vérifiez vos règles de sécurité Firestore
- Assurez-vous que `allow read: if true;` est bien présent

### Les produits ne se chargent pas
- Vérifiez que les documents existent dans Firestore (collection "artworks")
- Vérifiez les noms de champs (isSold, name, price, etc.)
- Vérifiez la console du navigateur pour les erreurs

### Les variables d'environnement ne fonctionnent pas
- Redémarrez le serveur de développement (`npm run dev`)
- Vérifiez que les noms commencent par `VITE_`
- Vérifiez qu'il n'y a pas d'espaces autour du `=`
