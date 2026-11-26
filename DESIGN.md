# WEBZLY — Design system · « Lumière »

Un mur crème, la lumière d'une fenêtre qui glisse lentement, l'ombre d'un feuillage.
Le soir, la fenêtre s'éteint et une lampe éclaire le mur. Sobre, chaud, très lisible.
L'image du site est dessinée en CSS (aucune photo de banque d'images).

Règles : pas de dégradés décoratifs, pas de halos, pas de pilules floues, pas d'étiquettes
en majuscules, pas de mot de couleur dans les titres, pas d'icônes génériques, pas de
curseur personnalisé. Textes courts, concrets, sans formules toutes faites.

## Couleurs (jour / soir)

| Token | Jour | Soir | Rôle |
|---|---|---|---|
| `--wall` | `#ECE5D8` | `#1D1915` | Fond principal (le mur) |
| `--paper` | `#F6F1E7` | `#25201A` | Sections alternées, cadres, configurateur |
| `--ink` | `#2A2520` | `#EEE7DA` | Texte, boutons pleins |
| `--ink-2` | `#665D53` | `#ABA193` | Texte secondaire |
| `--line` | encre 16 % | crème 14 % | Filets |
| `--brass` | `#A97C2F` | `#D3A24E` | Laiton : Z du logo, filets d'accent, focus. Jamais en petit texte. |
| `--sun` | `#FBF5E8` | `#8A5A22` | Lumière de la fenêtre |

Le mode suit le réglage du téléphone ou de l'ordinateur, puis le bouton Jour/Soir
(mémorisé dans le navigateur).

## Typographie

- **Titres** : Instrument Serif, normal, interlettrage −0,02 à −0,03em. Échelle : 9,8 / 5,6 / 3,2 / 1,9 rem.
- **Texte** : Geist 400/500, 17px (16px sur téléphone), interligne 1,6, 38 à 65 caractères.
- **Logo** : Bricolage Grotesque 800, Z en laiton.

## Mise en page

Contenu max 1320px, gouttière 20→60px, sections 96→184px. Colonnes asymétriques (5/7),
filets fins plutôt que cartes, un seul cadre « passe-partout » pour les photos.

## Composants

- **Bouton** : rectangle encre (rayon 2px), 54px ; survol laiton. Variante filet.
- **Lien** : souligné 1px, décalé de 6px ; survol laiton.
- **Configurateur** : options en rectangles à filet, récapitulatif collant avec acompte 30 %, solde 70 %, mensuel, total première année.
- **FAQ** : recherche instantanée + questions dépliables.
- **Formulaire** : 3 étapes, champs soulignés, choix en rectangles ; rendez-vous (téléphone, visio, café, sur place) et moment souhaité.

## Mouvement

Lumière qui dérive (40 s), feuillage qui se balance (7 s), défilement fluide (Lenis),
apparitions douces (16px + fondu). Tout s'arrête avec `prefers-reduced-motion`.
