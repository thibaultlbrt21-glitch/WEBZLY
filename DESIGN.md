# WEBZLY — le site

Sobre et professionnel : un fond blanc cassé, du texte noir, une seule police nette pour les titres,
de vraies réalisations à la place des illustrations. Le jaune moutarde reste la signature du logo.
Sept pages courtes plutôt qu'une longue page. Pensé d'abord pour le téléphone, écrit à la première personne.

Direction choisie sans bibliothèque de références (UXKIN non connecté) : elle part du site existant,
des retours de Thibault (« trop enfantin ») et du site de TDS Fermetures, sa réalisation.

## Pages

Accueil, Offres et tarifs, Réalisations, Méthode, À propos, Questions, Demande de devis,
plus les mentions légales, la confidentialité, les CGV et la page 404.
Les sources sont dans `_build/pages/`, les blocs communs dans `_build/parts/`.
`python3 _build/build.py` génère les pages à la racine.

## Couleurs

| Rôle | Valeur | Usage |
|---|---|---|
| Blanc cassé | `#F5F4F0` | fond des pages |
| Blanc | `#FFFFFF` | sections alternées, cartes, formulaire |
| Encre | `#12110F` | texte, boutons principaux, appel de fin de page, pied de page |
| Gris chaud | `#5E594F` sur fond clair, `#ABA597` sur encre | textes d'appui |
| Moutarde | `#E5B80B` | Z du logo ; boutons seulement sur fond sombre (appel de fin, barre du téléphone, menu) ; poignée de l'avant/après |

La moutarde ne sert jamais à surligner un mot dans un titre. Sur fond clair, les boutons sont noirs.

## Typographie

- Titres et texte : Geist. Titres en graisse 600 à 650, approche légèrement serrée.
- Bricolage Grotesque reste réservé au logo.
- Texte : 17 px (16,5 px sur téléphone), interligne 1,6.
- Boutons à coins de 10 px, cartes à coins de 12 à 18 px.
- Typographie française appliquée par `build.py` : espaces insécables avant « ? ! ; : »,
  apostrophes typographiques, numéros de téléphone et prix qui ne se coupent pas.

## Mouvement

- Aucune animation décorative. L'accueil montre une vraie réalisation (TDS Fermetures) dans un navigateur et un téléphone.
- Page Réalisations : avant / après au doigt ou à la souris, maquettes qui défilent au survol.
- Pas d'écran de chargement, pas de curseur personnalisé, pas d'apparitions au défilement.

## Téléphone

- Le haut de l'accueil tient en un écran.
- Formules et maquettes à faire glisser de côté.
- Barre « Appeler / Demander un devis » en bas d'écran pendant le défilement.
- Cibles tactiles d'au moins 44 px, champs en 17 px pour éviter le zoom d'iOS.

## À éviter

Animations « jouet », bandeaux inclinés, mots surlignés dans les titres, petites étiquettes en capitales, mosaïque de cartes,
gros numéros « 01 02 03 », flèches dans des ronds, halos et dégradés décoratifs,
logo géant en pied de page, émojis, chiffres ou avis inventés.
