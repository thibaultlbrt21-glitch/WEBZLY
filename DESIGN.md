# WEBZLY — le site

Encre, crème et moutarde de Dijon. Sept pages courtes plutôt qu'une longue page.
Pensé d'abord pour le téléphone, écrit à la première personne, sans effets de mode.

## Pages

Accueil, Offres et tarifs, Réalisations, Méthode, À propos, Questions, Demande de devis,
plus les mentions légales, la confidentialité, les CGV et la page 404.
Les sources sont dans `_build/pages/`, les blocs communs dans `_build/parts/`.
`python3 _build/build.py` génère les pages à la racine.

## Couleurs

| Rôle | Valeur | Usage |
|---|---|---|
| Crème | `#F2EEE4` | fond des pages |
| Papier | `#FAF8F2` | sections alternées, cartes, formulaire |
| Encre | `#12110F` | texte, haut de l'accueil, appel de fin de page, pied de page |
| Gris chaud | `#5E594F` sur crème, `#ABA597` sur encre | textes d'appui |
| Moutarde | `#E5B80B` | Z du logo, bouton « Demander un devis », bandeau des métiers, poignée de l'avant/après |

La moutarde ne sert jamais à surligner un mot dans un titre.

## Typographie

- Titres : Bricolage Grotesque, graisse 700 à 800, approche serrée.
- Texte : Geist, 17 px (16,5 px sur téléphone), interligne 1,6.
- Typographie française appliquée par `build.py` : espaces insécables avant « ? ! ; : »,
  apostrophes typographiques, numéros de téléphone et prix qui ne se coupent pas.

## Mouvement

- Accueil : un ordinateur s'ouvre et des pages en sortent (`assets/js/hero3d.js`, three.js).
- Bandeau des métiers qui défile.
- Avant / après au doigt ou à la souris, maquettes qui défilent au survol.
- Rien d'autre : pas d'écran de chargement, pas de curseur personnalisé, pas d'apparitions au défilement.

## Téléphone

- Le haut de l'accueil tient en un écran.
- Formules et maquettes à faire glisser de côté.
- Barre « Appeler / Demander un devis » en bas d'écran pendant le défilement.
- Cibles tactiles d'au moins 44 px, champs en 17 px pour éviter le zoom d'iOS.

## À éviter

Mots surlignés dans les titres, petites étiquettes en capitales, mosaïque de cartes,
gros numéros « 01 02 03 », flèches dans des ronds, halos et dégradés décoratifs,
logo géant en pied de page, émojis, chiffres ou avis inventés.
