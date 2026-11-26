# WEBZLY — direction « Encre »

De l'encre orange et or qui bouge dans le noir, derrière de grands titres en capitales.
Sobre partout ailleurs : beaucoup de noir, du texte ivoire, l'or réservé à ce qui compte.

## Couleurs (60 / 30 / 10)

| Rôle | Valeur | Usage |
|---|---|---|
| Nuit (60 %) | `#0A0908` | fond de toutes les pages |
| Nuit relevée | `#141210`, `#1F1B17` | panneaux (formulaire, audit), barre d'appel mobile |
| Ivoire (30 %) | `#F3EEE6` | texte, boutons principaux, une section claire par page (configurateur, besoins) |
| Ivoire secondaire | `#B9AFA2` sur nuit, `#5C544A` sur ivoire | textes d'appui |
| Or (10 %) | `#F2A541` | Z du logo, dernière ligne du titre d'accueil, prix choisi, étapes, bouton « Me faire rappeler », focus |

L'or n'est jamais utilisé en texte sur fond ivoire (contraste trop faible) : sur ivoire, il sert de fond (pastille « Le plus demandé »).

## Typographie

- Titres : Bricolage Grotesque, graisse 700, largeur 78 %, en capitales (`.d-xl`, `.d-l`, `.d-m`, `.d-s`).
- Citation, questions de la FAQ : Bricolage Grotesque 500, largeur normale.
- Texte : Geist, 17 px, interligne 1,6.
- Polices hébergées sur le site (`assets/fonts`), licence OFL.

## L'image : l'encre

- `assets/js/encre.js` : shader WebGL (bruit fractal déformé deux fois), attiré par la souris, qui se promène seul sur téléphone.
- Rendu à demi-résolution, seulement quand il est à l'écran, une image sur deux au téléphone.
- Sans WebGL ou avec « réduire les animations » : image fixe `assets/img/encre.jpg`.
- Accueil : plein écran. Autres pages : bandeau assombri vers le bas (`.encre--calm`). Appel final : `.encre--top`.

## Composants

Boutons en pilule (ivoire, contour, or). Cartes à coins de 10–16 px. Filets de 1 px.
Configurateur de budget, avant / après, maquettes en grand, recherche dans la FAQ,
formulaire de devis en 3 étapes, audit gratuit (adresse du site → formulaire prérempli),
rappel rapide dans l'appel final de chaque page, barre « Appeler / Devis gratuit » sur téléphone.

## À éviter

Dégradés décoratifs, halos, flou derrière la navigation, surtitres en petites capitales,
flèches dans des ronds, curseur personnalisé, compteur de chargement, chiffres inventés, faux avis.
