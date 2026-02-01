import { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './AdminHelpBot.css'

// ─── Contenu d'aide enrichi par page ─────────────────────────────────────
const helpContent = {
  '/admin/login': {
    greeting: 'Bienvenue ! Connectez-vous pour acceder a votre espace d\'administration.',
    icon: '🔐',
    topics: [
      {
        question: 'Comment me connecter ?',
        answer: 'Entrez votre identifiant et votre mot de passe administrateur, puis cliquez sur "Se connecter".\n\nSi vous avez oublie vos identifiants, contactez le developpeur du site pour une reinitialisation.',
        followUp: ['Ma session a expire, que faire ?']
      },
      {
        question: 'Ma session a expire, que faire ?',
        answer: 'Les sessions expirent apres un certain temps d\'inactivite pour des raisons de securite. Reconnectez-vous simplement avec vos identifiants.\n\nConseil : pensez a sauvegarder vos modifications regulierement pour ne rien perdre.'
      },
      {
        question: 'Le mot de passe ne fonctionne pas',
        answer: 'Verifiez que :\n\n1. La touche Majuscule n\'est pas activee\n2. Il n\'y a pas d\'espace en debut ou fin de mot de passe\n3. Vous utilisez bien le bon identifiant\n\nSi le probleme persiste, demandez une reinitialisation du mot de passe au developpeur.'
      }
    ]
  },
  '/admin/dashboard': {
    greeting: 'Bienvenue sur le tableau de bord ! Voici votre centre de commande pour gerer tout votre site.',
    icon: '📊',
    topics: [
      {
        question: 'A quoi sert le tableau de bord ?',
        answer: 'Le tableau de bord vous donne un apercu rapide de votre site :\n\n- Nombre d\'oeuvres publiees et masquees\n- Nombre de collections actives\n- Raccourcis vers les sections les plus utilisees\n\nC\'est votre point de depart pour toute gestion.',
        followUp: ['Comment naviguer dans l\'admin ?', 'Que signifient les statistiques ?']
      },
      {
        question: 'Comment naviguer dans l\'admin ?',
        answer: 'Vous avez plusieurs moyens de naviguer :\n\n1. Les cartes du tableau de bord — cliquez sur une section\n2. La barre de navigation en haut de page\n3. Les liens rapides dans chaque section\n\nToutes les pages admin sont accessibles depuis le tableau de bord.',
        followUp: ['A quoi sert le tableau de bord ?'],
        links: [
          { label: 'Gerer les oeuvres', path: '/admin/products' },
          { label: 'Page d\'accueil', path: '/admin/accueil' },
          { label: 'Couleurs', path: '/admin/colors' }
        ]
      },
      {
        question: 'Que signifient les statistiques ?',
        answer: 'Les chiffres affiches representent :\n\n- Oeuvres totales : toutes vos creations enregistrees\n- Publiees : celles visibles par les visiteurs\n- Collections : vos groupes thematiques\n\nCes indicateurs vous aident a suivre l\'etat de votre site en un coup d\'oeil.'
      },
      {
        question: 'Comment deconnecter mon compte ?',
        answer: 'Cliquez sur le bouton "Deconnexion" en haut a droite de la barre de navigation admin. Vous serez redirige vers la page de connexion.\n\nPensez a sauvegarder vos modifications en cours avant de vous deconnecter.'
      }
    ]
  },
  '/admin/products': {
    greeting: 'Gerez toutes vos oeuvres ici. Ajoutez, modifiez, masquez ou supprimez vos creations.',
    icon: '🎨',
    topics: [
      {
        question: 'Comment ajouter une oeuvre ?',
        answer: 'Pour ajouter une nouvelle oeuvre :\n\n1. Cliquez sur "Ajouter une oeuvre" en haut de la page\n2. Remplissez le formulaire (nom, prix, description)\n3. Ajoutez au moins une image\n4. Choisissez une collection (optionnel)\n5. Cliquez sur "Enregistrer"\n\nL\'oeuvre sera immediatement visible dans la boutique.',
        followUp: ['Comment ajouter des images ?', 'Comment assigner une collection ?'],
        links: [{ label: 'Creer une oeuvre', path: '/admin/products/new' }]
      },
      {
        question: 'Comment modifier une oeuvre ?',
        answer: 'Pour modifier une oeuvre :\n\n1. Trouvez l\'oeuvre dans la liste\n2. Cliquez sur l\'icone crayon (modifier)\n3. Modifiez les champs souhaites\n4. Cliquez sur "Enregistrer"\n\nLes modifications sont appliquees immediatement sur le site public.',
        followUp: ['Comment changer l\'image principale ?', 'Les modifications sont-elles immediates ?']
      },
      {
        question: 'Comment masquer une oeuvre sans la supprimer ?',
        answer: 'Utilisez le bouton de visibilite (icone oeil) a cote de l\'oeuvre.\n\n- Oeil ouvert = visible sur le site\n- Oeil barre = masquee (invisible pour les visiteurs)\n\nUne oeuvre masquee reste dans votre liste admin et peut etre re-affichee a tout moment. C\'est ideal pour les oeuvres vendues ou en cours de modification.',
        followUp: ['Comment supprimer une oeuvre ?']
      },
      {
        question: 'Comment supprimer une oeuvre ?',
        answer: 'Pour supprimer une oeuvre :\n\n1. Cliquez sur l\'icone corbeille\n2. Confirmez la suppression dans la fenetre qui apparait\n\n⚠️ Attention : la suppression est definitive ! Les images associees seront egalement supprimees. Si vous hesitez, masquez plutot l\'oeuvre.',
        followUp: ['Comment masquer une oeuvre sans la supprimer ?']
      },
      {
        question: 'Comment ajouter des images ?',
        answer: 'Dans le formulaire d\'oeuvre :\n\n1. Cliquez sur la zone d\'upload ou glissez-deposez vos fichiers\n2. Formats acceptes : JPG, PNG, WebP\n3. Taille max : 5 Mo par image\n4. Vous pouvez ajouter plusieurs images\n\nLa premiere image de la liste sera l\'image principale affichee dans la boutique et la galerie.',
        followUp: ['Comment changer l\'image principale ?']
      },
      {
        question: 'Comment changer l\'image principale ?',
        answer: 'L\'image principale est la premiere de la liste. Pour la changer :\n\n1. Allez dans le formulaire de modification de l\'oeuvre\n2. Utilisez les fleches pour reorganiser l\'ordre des images\n3. Placez l\'image souhaitee en premiere position\n4. Sauvegardez\n\nL\'image en premiere position sera utilisee comme vignette dans la boutique et la galerie.'
      },
      {
        question: 'Comment filtrer et rechercher des oeuvres ?',
        answer: 'Dans la liste des oeuvres :\n\n- Utilisez la barre de recherche pour trouver par nom\n- Filtrez par collection avec le menu deroulant\n- Les oeuvres masquees sont indiquees visuellement\n\nCela facilite la gestion quand vous avez beaucoup d\'oeuvres.'
      }
    ]
  },
  '/admin/products/new': {
    greeting: 'Creez une nouvelle oeuvre. Remplissez les champs et ajoutez de belles images !',
    icon: '✨',
    topics: [
      {
        question: 'Quels champs sont obligatoires ?',
        answer: 'Les champs obligatoires sont :\n\n- Nom de l\'oeuvre\n- Prix\n- Au moins une image\n\nLes champs recommandes (mais optionnels) :\n- Description detaillee\n- Collection\n- Dimensions\n- Materiaux utilises\n\nPlus vous remplissez d\'informations, mieux l\'oeuvre sera presentee aux visiteurs.',
        followUp: ['Comment ajouter des images ?', 'Comment assigner une collection ?']
      },
      {
        question: 'Comment ajouter des images ?',
        answer: 'Pour ajouter des images :\n\n1. Cliquez sur la zone d\'upload ou glissez-deposez vos fichiers\n2. Formats acceptes : JPG, PNG, WebP\n3. Taille max recommandee : 5 Mo par image\n4. Ajoutez plusieurs images pour montrer differents angles\n\nConseil : utilisez des photos bien eclairees avec un fond neutre pour mettre en valeur votre oeuvre.',
        followUp: ['Quels champs sont obligatoires ?']
      },
      {
        question: 'Comment assigner une collection ?',
        answer: 'Selectionnez une collection dans le menu deroulant du formulaire.\n\nSi la collection souhaitee n\'existe pas encore, vous devez d\'abord la creer dans la section Collections.',
        followUp: ['Quels champs sont obligatoires ?'],
        links: [{ label: 'Gerer les collections', path: '/admin/collections' }]
      },
      {
        question: 'Conseils pour une bonne fiche produit',
        answer: 'Pour une fiche produit attrayante :\n\n1. Titre clair et evocateur\n2. Description detaillee (technique, inspiration, dimensions)\n3. Plusieurs photos (vue d\'ensemble, details, mise en situation)\n4. Prix juste et visible\n5. Collection appropriee pour faciliter la navigation\n\nUne bonne fiche produit augmente l\'interet des visiteurs et facilite la vente.'
      }
    ]
  },
  '/admin/products/edit': {
    greeting: 'Modifiez les details de cette oeuvre. Tous les changements seront enregistres au clic sur "Enregistrer".',
    icon: '✏️',
    topics: [
      {
        question: 'Comment changer l\'image principale ?',
        answer: 'L\'image principale est la premiere de la liste. Pour la changer :\n\n1. Utilisez les fleches pour reorganiser l\'ordre\n2. Placez l\'image souhaitee en premiere position\n3. Sauvegardez\n\nL\'image en premiere position sera la vignette dans la boutique.',
        followUp: ['Les modifications sont-elles immediates ?']
      },
      {
        question: 'Puis-je changer la collection ?',
        answer: 'Oui ! Modifiez simplement la collection dans le menu deroulant. L\'oeuvre sera deplacee vers la nouvelle collection immediatement apres sauvegarde.\n\nVous pouvez aussi retirer l\'oeuvre de toute collection en selectionnant "Aucune collection".',
        followUp: ['Les modifications sont-elles immediates ?']
      },
      {
        question: 'Les modifications sont-elles immediates ?',
        answer: 'Oui, une fois que vous cliquez sur "Enregistrer" :\n\n- Les modifications sont appliquees instantanement\n- Le site public affiche les nouvelles informations immediatement\n- Les images sont mises a jour en temps reel\n\nConseil : verifiez votre oeuvre sur le site public apres modification pour vous assurer que tout est correct.',
        links: [{ label: 'Retour aux oeuvres', path: '/admin/products' }]
      },
      {
        question: 'Comment supprimer une image ?',
        answer: 'Dans le formulaire de modification :\n\n1. Survolez l\'image a supprimer\n2. Cliquez sur le bouton X (supprimer)\n3. L\'image sera retiree\n4. N\'oubliez pas de sauvegarder\n\n⚠️ Gardez toujours au moins une image par oeuvre.'
      }
    ]
  },
  '/admin/collections': {
    greeting: 'Gerez vos collections pour organiser vos oeuvres par themes ou categories.',
    icon: '📁',
    topics: [
      {
        question: 'A quoi servent les collections ?',
        answer: 'Les collections permettent de regrouper vos oeuvres par :\n\n- Theme (paysages, portraits, abstraits...)\n- Technique (huile, aquarelle, sculpture...)\n- Categorie personnalisee\n\nElles apparaissent comme filtres dans la boutique et la galerie, aidant les visiteurs a trouver ce qui les interesse.',
        followUp: ['Comment creer une collection ?']
      },
      {
        question: 'Comment creer une collection ?',
        answer: 'Pour creer une nouvelle collection :\n\n1. Cliquez sur "Ajouter une collection"\n2. Donnez-lui un nom clair et descriptif\n3. Ajoutez une description (optionnel)\n4. Sauvegardez\n\nVous pourrez ensuite assigner des oeuvres a cette collection depuis leur fiche produit.',
        followUp: ['A quoi servent les collections ?', 'Que se passe-t-il si je supprime une collection ?']
      },
      {
        question: 'Que se passe-t-il si je supprime une collection ?',
        answer: 'La suppression d\'une collection :\n\n- Ne supprime PAS les oeuvres qu\'elle contient\n- Les oeuvres deviennent "sans collection"\n- Elles restent visibles dans la boutique\n- Vous pourrez les reassigner a une autre collection\n\nC\'est une operation sans risque pour vos oeuvres.'
      },
      {
        question: 'Comment renommer une collection ?',
        answer: 'Pour renommer une collection :\n\n1. Cliquez sur l\'icone de modification (crayon)\n2. Changez le nom\n3. Sauvegardez\n\nLe nouveau nom sera applique partout sur le site (filtres, boutique, galerie).'
      }
    ]
  },
  '/admin/accueil': {
    greeting: 'Personnalisez votre page d\'accueil : annonces, blocs, sections et oeuvres a la une !',
    icon: '🏠',
    topics: [
      {
        question: 'Comment fonctionne la page d\'accueil ?',
        answer: 'La page d\'accueil est composee de plusieurs sections que vous pouvez personnaliser :\n\n- Banniere d\'annonce (message important en haut)\n- Blocs personnalises (texte, cartes, carousel)\n- Section oeuvres a la une\n\nChaque element est independant et peut etre active/desactive.',
        followUp: ['Comment ajouter un bloc ?', 'Comment gerer les annonces ?']
      },
      {
        question: 'Comment gerer les annonces ?',
        answer: 'La banniere d\'annonce s\'affiche en haut de la page d\'accueil :\n\n1. Activez/desactivez avec le toggle\n2. Ecrivez votre message\n3. Choisissez la couleur de fond\n4. Sauvegardez\n\nIdeal pour : expositions, promotions, evenements, informations temporaires.',
        followUp: ['Comment fonctionne la page d\'accueil ?']
      },
      {
        question: 'Comment ajouter un bloc ?',
        answer: 'Pour ajouter un bloc a la page d\'accueil :\n\n1. Cliquez sur "Ajouter un bloc"\n2. Choisissez le type : Texte, Cartes ou Carousel\n3. Remplissez le contenu\n4. Activez le bloc\n5. Sauvegardez\n\nVous pouvez reordonner les blocs en les glissant-deposant.',
        followUp: ['Comment fonctionne le bloc Texte ?', 'Comment fonctionne le bloc Cartes ?', 'Comment fonctionne le bloc Carousel ?']
      },
      {
        question: 'Comment fonctionne le bloc Texte ?',
        answer: 'Le bloc Texte permet d\'afficher :\n\n- Un titre (optionnel, peut etre encadre)\n- Un ou plusieurs paragraphes\n- Une image illustrative\n- Un bouton/lien vers une autre page\n\nIdeal pour : presenter votre demarche, annoncer un evenement, mettre en avant une information.',
        followUp: ['Comment ajouter un bloc ?', 'Comment fonctionne le bloc Cartes ?']
      },
      {
        question: 'Comment fonctionne le bloc Cartes ?',
        answer: 'Le bloc Cartes affiche une grille de cartes visuelles :\n\n- Chaque carte a une image, un titre, un texte et un lien\n- Vous pouvez ajouter/supprimer des cartes\n- Un bouton general sous la grille (optionnel)\n- Le titre peut etre encadre\n\nIdeal pour : presenter des collections, des techniques, des services.',
        followUp: ['Comment ajouter un bloc ?', 'Comment fonctionne le bloc Carousel ?']
      },
      {
        question: 'Comment fonctionne le bloc Carousel ?',
        answer: 'Le bloc Carousel affiche un diaporama 3D de vos images :\n\n- Ajoutez plusieurs images\n- Lecture automatique configurable\n- Les visiteurs peuvent naviguer avec les fleches\n- Clic sur une image = zoom en plein ecran\n\nIdeal pour : galerie de photos, ambiance atelier, oeuvres recentes.',
        followUp: ['Comment ajouter un bloc ?', 'Comment ajouter des images depuis la bibliotheque ?']
      },
      {
        question: 'Comment ajouter des images depuis la bibliotheque ?',
        answer: 'Dans les editeurs de blocs, vous avez deux options :\n\n1. "Uploader" — pour envoyer une nouvelle image depuis votre ordinateur\n2. "Bibliotheque" — pour reutiliser une image existante\n\nLa bibliotheque contient toutes les images de vos oeuvres et des blocs du site. C\'est plus rapide que de re-uploader !',
        followUp: ['Comment fonctionne le bloc Carousel ?', 'Comment fonctionne le bloc Cartes ?']
      },
      {
        question: 'Comment mettre une oeuvre a la une ?',
        answer: 'Dans la section "Oeuvres a la une" :\n\n1. Activez la section\n2. Selectionnez les oeuvres a mettre en avant\n3. Elles apparaitront sur la page d\'accueil\n\nC\'est un excellent moyen d\'attirer l\'attention sur vos nouvelles creations ou vos pieces favorites.',
        links: [{ label: 'Gerer les oeuvres', path: '/admin/products' }]
      },
      {
        question: 'Comment personnaliser les couleurs des blocs ?',
        answer: 'Chaque bloc a des options de style :\n\n- Couleur de fond du bloc\n- Couleur du titre\n- Taille et police du titre\n- Titre encadre (bordure decorative)\n\nUtilisez l\'editeur de style dans chaque bloc pour personnaliser l\'apparence. Pour les couleurs globales du site, utilisez la page Couleurs.',
        links: [{ label: 'Couleurs du site', path: '/admin/colors' }]
      }
    ]
  },
  '/admin/about': {
    greeting: 'Editez la page "A propos" pour presenter votre atelier et votre demarche artistique.',
    icon: '📝',
    topics: [
      {
        question: 'Que mettre dans la page A propos ?',
        answer: 'Une bonne page A propos contient :\n\n- Votre parcours artistique\n- Votre demarche et inspiration\n- Votre atelier et vos outils\n- Ce qui rend votre travail unique\n- Eventuellement, une photo de vous ou de votre atelier\n\nC\'est une page cle pour creer un lien avec vos visiteurs et leur donner envie d\'acheter.',
        followUp: ['Comment modifier le texte ?']
      },
      {
        question: 'Comment modifier le texte ?',
        answer: 'Pour modifier la page A propos :\n\n1. Editez directement les champs de texte affiches\n2. Ajoutez ou modifiez les images\n3. Cliquez sur "Enregistrer"\n\nLes modifications sont visibles immediatement sur le site public.',
        followUp: ['Que mettre dans la page A propos ?']
      },
      {
        question: 'Comment ajouter une photo ?',
        answer: 'Pour ajouter une photo a la page A propos :\n\n1. Cliquez sur la zone d\'upload d\'image\n2. Selectionnez votre photo\n3. Elle sera automatiquement dimensionnee\n4. Sauvegardez\n\nConseil : une photo de vous dans votre atelier personnalise votre page et cree de la confiance.'
      }
    ]
  },
  '/admin/colors': {
    greeting: 'Personnalisez les couleurs de votre site pour qu\'il reflette parfaitement votre identite.',
    icon: '🎨',
    topics: [
      {
        question: 'Quelles couleurs puis-je modifier ?',
        answer: 'Vous pouvez personnaliser :\n\n- Couleur primaire (boutons, accents)\n- Couleur des titres\n- Couleur du texte principal\n- Couleur de fond\n- Couleur des liens\n\nUn apercu en temps reel vous permet de visualiser les changements avant de sauvegarder.',
        followUp: ['Comment revenir aux couleurs par defaut ?', 'Conseils pour de bonnes couleurs']
      },
      {
        question: 'Comment revenir aux couleurs par defaut ?',
        answer: 'Pour reinitialiser les couleurs :\n\n1. Cliquez sur le bouton "Reinitialiser" ou "Couleurs par defaut"\n2. Confirmez la reinitialisation\n3. Les couleurs originales du site seront restaurees\n\nVous pourrez toujours les re-personnaliser ensuite.'
      },
      {
        question: 'Les changements sont-ils visibles immediatement ?',
        answer: 'Oui ! Apres avoir sauvegarde :\n\n- Les couleurs s\'appliquent instantanement sur tout le site public\n- Tous les visiteurs voient les nouvelles couleurs immediatement\n- L\'admin utilise aussi les nouvelles couleurs\n\nConseil : ouvrez le site public dans un autre onglet pour verifier le rendu.'
      },
      {
        question: 'Conseils pour de bonnes couleurs',
        answer: 'Pour un site harmonieux :\n\n- Utilisez 2-3 couleurs maximum\n- Assurez un bon contraste texte/fond pour la lisibilite\n- Restez coherent avec votre identite artistique\n- Evitez les couleurs trop vives qui fatiguent les yeux\n- Testez sur mobile aussi !\n\nEn cas de doute, les couleurs par defaut sont un bon point de depart.'
      }
    ]
  },
  '/admin/reorder': {
    greeting: 'Reorganisez l\'ordre de vos oeuvres par glisser-deposer. Simple et intuitif !',
    icon: '↕️',
    topics: [
      {
        question: 'Comment reordonner les oeuvres ?',
        answer: 'Pour reorganiser vos oeuvres :\n\n1. Cliquez et maintenez sur une oeuvre\n2. Glissez-la a la position souhaitee\n3. Relâchez\n4. Cliquez sur "Enregistrer l\'ordre" pour confirmer\n\nConseil : placez vos meilleures oeuvres ou les plus recentes en premier pour capter l\'attention des visiteurs.',
        followUp: ['Ou cet ordre est-il applique ?']
      },
      {
        question: 'Ou cet ordre est-il applique ?',
        answer: 'L\'ordre que vous definissez ici est utilise dans :\n\n- La boutique en ligne\n- La galerie\n- Les resultats de recherche\n\nC\'est l\'ordre dans lequel les visiteurs verront vos oeuvres. Mettez en avant vos nouvelles creations !',
        links: [{ label: 'Voir la boutique', path: '/boutique' }]
      },
      {
        question: 'L\'ordre ne se sauvegarde pas',
        answer: 'Si l\'ordre ne se sauvegarde pas :\n\n1. Verifiez que vous avez bien clique sur "Enregistrer l\'ordre"\n2. Attendez la confirmation (message de succes)\n3. Rechargez la page pour verifier\n\nSi le probleme persiste, essayez de vider le cache de votre navigateur ou contactez le developpeur.'
      }
    ]
  },
  '/admin/announcements': {
    greeting: 'Gerez vos annonces et la page d\'accueil depuis cette section.',
    icon: '📢',
    topics: [
      {
        question: 'Comment creer une annonce ?',
        answer: 'Pour creer une annonce :\n\n1. Activez la banniere d\'annonce\n2. Ecrivez votre message\n3. Personnalisez les couleurs si souhaite\n4. Sauvegardez\n\nL\'annonce apparaitra en haut de la page d\'accueil.',
        followUp: ['Comment ajouter un bloc ?']
      },
      {
        question: 'Comment ajouter un bloc ?',
        answer: 'Cliquez sur "Ajouter un bloc" et choisissez le type :\n\n- Bloc Texte : titre + paragraphes + image + bouton\n- Bloc Cartes : grille de cartes visuelles avec liens\n- Bloc Carousel : diaporama 3D d\'images\n\nChaque bloc peut etre active/desactive independamment.',
        followUp: ['Comment reordonner les blocs ?']
      },
      {
        question: 'Comment reordonner les blocs ?',
        answer: 'Utilisez les fleches haut/bas a cote de chaque bloc pour changer leur ordre d\'affichage sur la page d\'accueil.\n\nL\'ordre est mis a jour en temps reel dans l\'apercu.'
      }
    ]
  }
}

// ─── Recherche floue ──────────────────────────────────────────────────────
function fuzzyMatch(query, text) {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Exact substring match = high score
  if (t.includes(q)) return 1

  // Word matching
  const qWords = q.split(/\s+/).filter(w => w.length > 1)
  if (qWords.length === 0) return 0

  let matchCount = 0
  for (const word of qWords) {
    if (t.includes(word)) matchCount++
  }
  return matchCount / qWords.length
}

function searchAllTopics(query) {
  if (!query || query.trim().length < 2) return []

  const results = []

  for (const [path, content] of Object.entries(helpContent)) {
    for (const topic of content.topics) {
      const qScore = fuzzyMatch(query, topic.question)
      const aScore = fuzzyMatch(query, topic.answer) * 0.6
      const score = Math.max(qScore, aScore)

      if (score > 0.3) {
        results.push({ ...topic, score, sourcePath: path, sourceIcon: content.icon })
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 6)
}

// ─── Route matcher ────────────────────────────────────────────────────────
function getHelpForPath(pathname) {
  if (helpContent[pathname]) return helpContent[pathname]
  if (pathname.startsWith('/admin/products/edit/')) return helpContent['/admin/products/edit']
  if (pathname.startsWith('/admin/announcements') || pathname.startsWith('/admin/accueil')) {
    return helpContent['/admin/accueil'] || helpContent['/admin/announcements']
  }

  return {
    greeting: 'Bienvenue dans l\'espace d\'administration. Posez une question ou explorez les sujets ci-dessous.',
    icon: '💡',
    topics: [
      {
        question: 'Comment naviguer dans l\'admin ?',
        answer: 'Utilisez le tableau de bord pour acceder aux differentes sections : Oeuvres, Collections, Page d\'accueil, A propos, Couleurs, et Reordonner.\n\nChaque section a ses propres outils et son propre guide contextuel.',
        links: [{ label: 'Tableau de bord', path: '/admin/dashboard' }]
      }
    ]
  }
}

// ─── Page labels ──────────────────────────────────────────────────────────
const pageLabels = {
  '/admin/login': 'Connexion',
  '/admin/dashboard': 'Tableau de bord',
  '/admin/products': 'Oeuvres',
  '/admin/products/new': 'Nouvelle oeuvre',
  '/admin/products/edit': 'Modifier oeuvre',
  '/admin/collections': 'Collections',
  '/admin/accueil': 'Page d\'accueil',
  '/admin/announcements': 'Annonces',
  '/admin/about': 'A propos',
  '/admin/colors': 'Couleurs',
  '/admin/reorder': 'Reordonner'
}

function getPageLabel(pathname) {
  if (pageLabels[pathname]) return pageLabels[pathname]
  if (pathname.startsWith('/admin/products/edit/')) return 'Modifier oeuvre'
  return 'Admin'
}

// ─── Composant principal ──────────────────────────────────────────────────
export default function AdminHelpBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [showTopics, setShowTopics] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const searchInputRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  const currentHelp = useMemo(() => getHelpForPath(location.pathname), [location.pathname])
  const pageLabel = getPageLabel(location.pathname)

  // Reset on page change
  useEffect(() => {
    setMessages([{ type: 'bot', text: currentHelp.greeting }])
    setSearchQuery('')
    setSearchResults([])
    setShowTopics(true)
  }, [location.pathname])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      setShowTopics(true)
      return
    }

    searchTimeoutRef.current = setTimeout(() => {
      const results = searchAllTopics(searchQuery)
      setSearchResults(results)
      setShowTopics(false)
    }, 200)

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [searchQuery])

  function addBotMessage(text, extras) {
    setIsTyping(true)

    const delay = Math.min(300 + text.length * 1.5, 1200)
    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { type: 'bot', text, ...extras }])
    }, delay)
  }

  function handleTopicClick(topic) {
    setMessages(prev => [...prev, { type: 'user', text: topic.question }])
    addBotMessage(topic.answer, {
      followUp: topic.followUp,
      links: topic.links
    })
    setSearchQuery('')
    setSearchResults([])
    setShowTopics(true)
  }

  function handleSearchResultClick(result) {
    setMessages(prev => [...prev, { type: 'user', text: result.question }])
    addBotMessage(result.answer, {
      followUp: result.followUp,
      links: result.links
    })
    setSearchQuery('')
    setSearchResults([])
    setShowTopics(true)
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (searchQuery.trim().length < 2) return

    const results = searchAllTopics(searchQuery)
    if (results.length > 0) {
      handleSearchResultClick(results[0])
    } else {
      setMessages(prev => [...prev, { type: 'user', text: searchQuery }])
      addBotMessage('Desole, je n\'ai pas trouve de reponse pour cette question. Essayez avec d\'autres mots ou explorez les sujets ci-dessous.')
      setSearchQuery('')
      setSearchResults([])
      setShowTopics(true)
    }
  }

  function handleFollowUpClick(questionText) {
    // Search all topics to find matching answer
    for (const content of Object.values(helpContent)) {
      const found = content.topics.find(t => t.question === questionText)
      if (found) {
        handleTopicClick(found)
        return
      }
    }
  }

  function handleLinkClick(path) {
    navigate(path)
    setIsOpen(false)
  }

  function clearChat() {
    setMessages([{ type: 'bot', text: currentHelp.greeting }])
    setSearchQuery('')
    setSearchResults([])
    setShowTopics(true)
  }

  return (
    <>
      <motion.button
        className={`help-bot-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(o => !o)}
        aria-label="Ouvrir l'aide"
        title="Aide"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={isOpen ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? '✕' : '?'}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="help-bot-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="help-bot-panel"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {/* Header */}
              <div className="help-bot-header">
                <span className="help-bot-header-title">
                  <span className="help-bot-header-icon">{currentHelp.icon || '?'}</span>
                  Assistant Admin
                </span>
                <div className="help-bot-header-actions">
                  <span className="help-bot-page-badge">{pageLabel}</span>
                  <button
                    className="help-bot-close"
                    onClick={() => setIsOpen(false)}
                    aria-label="Fermer l'aide"
                  >
                    &#x2715;
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="help-bot-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`help-bot-message ${msg.type}`}>
                    <div className="help-bot-message-text">
                      {msg.text.split('\n').map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < msg.text.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>

                    {/* Follow-up suggestions */}
                    {msg.followUp && msg.followUp.length > 0 && (
                      <div className="help-bot-followups">
                        {msg.followUp.map((q, k) => (
                          <button
                            key={k}
                            className="help-bot-followup-btn"
                            onClick={() => handleFollowUpClick(q)}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick action links */}
                    {msg.links && msg.links.length > 0 && (
                      <div className="help-bot-links">
                        {msg.links.map((link, k) => (
                          <button
                            key={k}
                            className="help-bot-link-btn"
                            onClick={() => handleLinkClick(link.path)}
                          >
                            → {link.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="help-bot-message bot typing">
                    <div className="help-bot-typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Search + Topics */}
              <div className="help-bot-footer">
                <form className="help-bot-search" onSubmit={handleSearchSubmit}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Posez votre question..."
                    className="help-bot-search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="help-bot-search-clear"
                      onClick={() => { setSearchQuery(''); setSearchResults([]); setShowTopics(true) }}
                    >
                      &#x2715;
                    </button>
                  )}
                </form>

                {/* Search results */}
                {searchResults.length > 0 && (
                  <div className="help-bot-search-results">
                    {searchResults.map((result, i) => (
                      <button
                        key={i}
                        className="help-bot-search-result"
                        onClick={() => handleSearchResultClick(result)}
                      >
                        <span className="search-result-icon">{result.sourceIcon}</span>
                        {result.question}
                      </button>
                    ))}
                  </div>
                )}

                {/* Topic buttons */}
                {showTopics && searchResults.length === 0 && (
                  <div className="help-bot-topics">
                    <div className="help-bot-topics-header">
                      <span className="help-bot-topics-label">Sujets</span>
                      {messages.length > 1 && (
                        <button className="help-bot-clear-btn" onClick={clearChat}>
                          Effacer le chat
                        </button>
                      )}
                    </div>
                    <div className="help-bot-topics-list">
                      {currentHelp.topics.map((topic, i) => (
                        <button
                          key={i}
                          className="help-bot-topic-btn"
                          onClick={() => handleTopicClick(topic)}
                        >
                          {topic.question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
