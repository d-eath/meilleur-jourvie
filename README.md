# Meilleur Jourvie

Un client Jourvie alternatif plus convivial pour les étudiants n'ayant pas le choix d'utiliser Jourvie dans le contexte du cours « Projet de développement » au CSTJ.

Créé par Davis Eath avec Svelte.

## Utilisation

### Instance publique (recommandé)

Accédez à l'instance publique de Meilleur Jourvie à l'adresse suivante: https://cstj.d-eath.ca/jourvie

#### Avis sur les risques de sécurité de l'instance publique

L'instance publique de Meilleur Jourvie fait appel à un serveur « proxy » hébergé par le mainteneur de l'application pour contourner les [restrictions CORS](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS) du serveur original en agissant comme intermédiaire. Cette procédure est nécessaire pour utiliser le serveur officiel de Jourvie.

Toute donnée échangée entre l'application publique et le serveur original est transmise à ce serveur intermédiaire, incluant les mots de passe et les jetons de connexion. Le mainteneur s'engage à ne pas lire ou enregistrer les données échangées.

Toutefois, le mainteneur n'assume aucune responsabilité pour tout dommage causé par l'application ou le serveur « proxy ». Utilisez l'application à vos risques et périls.

Le code source du proxy est disponible sur [d-eath/meilleur-jourvie-proxy](https://github.com/d-eath/meilleur-jourvie-proxy).

### Rouler votre propre instance

Vous aurez besoin des logiciels suivantes :
* Git
* Node.js 16.17.1 LTS
* Un serveur API Jourvie

Clonez ce répertoire Git et installez les dépendances nécessaires en effectuant les commandes suivantes:

```
git clone https://github.com/d-eath/meilleur-jourvie.git
cd meilleur-jourvie
npm i
```

Après avoir effectué ces commandes, renommez `.env.example` dans le répertoire à `.env`, et éditez le fichier pour configurer le client.

Entrez les URLs de base pour l'API du serveur Jourvie et l'emplacement des téléversements, **sans inclure la barre oblique (`/`) à la fin**.

Voici ce que ressemble un fichier `.env` configuré:

```
VITE_API_URL=https://example.com:4200
VITE_FILE_URL=https://example.com/fichiers
```

#### Rouler en mode développement

Vous pouvez rouler l'application en mode développement en exécutant `npm run dev`.

Par défaut, le mode développement écoute à l'adresse suivante: http://127.0.0.1:5173/

#### Faire un build production

Vous pouvez faire un build production de l'application en exécutant `npm run build`.

Le build se retrouvera dans le dossier `dist` du répertoire.

*Il y a présentement un bogue où les images de l'application se retrouvent dans le mauvais dossier dans un build. Pour le moment, veuillez déplacer le dossier `dist/images` au dossier `dist/assets` après avoir effectué un build pour remédier ce problème.*