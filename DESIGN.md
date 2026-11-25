# WEBZLY — Design system · « Blanc studio »

Blanc pur, typographie géante et condensée, un seul bleu électrique, beaucoup d'espace.
Style studio suisse : chaque élément a une place, rien n'est décoratif sans raison.
Illustrations au trait dessinées à la main (encre + aplats bleus) et une scène 3D douce
en haut de l'accueil. Logo conservé : « webzly », Z en éclair (bleu dans cette direction).
Pas de mode sombre ; les sections fortes sont en encre (presque noir).

> Direction choisie par Thibault parmi 3 propositions. Pas de comparaison avec des sites
> réels : l'outil UXKIN n'était pas connecté.

## Couleurs

| Token | Valeur | Rôle |
|---|---|---|
| `--white` | `#FFFFFF` | Fond principal |
| `--gray` | `#F3F3F1` | Fond secondaire : blocs, cartes, bandes |
| `--gray-2` | `#E7E7E4` | Bordures fortes, séparateurs de blocs gris |
| `--ink` | `#0A0A0A` | Texte, traits des illustrations, sections sombres |
| `--ink-2` | `#5C5C5C` | Texte secondaire (6,7:1 sur blanc, 6,0:1 sur gris) |
| `--line` | `#E5E5E2` | Bordures fines |
| `--blue` | `#1F3BFF` | **Unique accent** : boutons principaux, liens, Z du logo, mots-clés des titres |
| `--blue-deep` | `#1529C9` | Survol des boutons bleus |
| `--blue-tint` | `#E9ECFF` | Fond léger : étiquettes, surlignages, encadrés |
| `--blue-light` | `#8FA0FF` | Bleu lisible sur encre (8,2:1) — jamais `--blue` en texte sur noir |
| `--on-ink-2` | `#A3A3A3` | Texte secondaire sur encre |
| `--success` | `#1E7A46` | Confirmation |
| `--error` | `#B42318` | Erreurs |

## Typographie

- **Titres** : Bricolage Grotesque 800, largeur 78 % (`font-stretch`), interlettrage −0,05em,
  interligne 0,9. Mots-clés en bleu, jamais en dégradé.
- **Texte** : Geist 400/500/600, 17px desktop / 16px mobile, interligne 1,6, 62 caractères max.
- **Étiquettes, numéros** : Geist Mono 500, 12,5px, majuscules, +0,06em.

Échelle : display 52→136px · h1 44→96 · h2 34→68 · h3 22→28 · lead 18→22 · body 16→17 · small 14 · mono 12,5.

## Espacement

Base 8px. Sections 96px (mobile) → 168px (desktop). Contenu max 1280px, gouttière 20→48px.
Grille 12 colonnes sur desktop ; textes alignés à gauche (jamais tout centré).

## Formes et profondeur

Rayons : 12px (champs), 20px (cartes), 32px (grands blocs), 999px (boutons, étiquettes).
Une seule ombre, pour ce qui flotte (menu, aperçu) : `0 30px 60px -30px rgba(10,10,10,.25)`.
Pas de verre dépoli, pas de dégradé.

## Composants

- **Bouton principal** : bleu, texte blanc, 56px, pilule ; survol bleu profond + flèche qui glisse ; focus anneau encre 3px décalé.
- **Bouton secondaire** : fond gris, texte encre ; survol encre / texte blanc.
- **Lien** : souligné 1,5px, la couleur passe au bleu au survol.
- **Champ** : fond gris, sans bordure, rayon 12px, 56px ; focus anneau bleu 2px.
- **Carte** : fond gris, rayon 20px, sans ombre ; carte mise en avant = fond bleu ou encre.
- **En-tête** : blanc, logo à gauche, liens au centre, bouton « Devis gratuit » ; se cache en descendant, revient en remontant. Menu plein écran sur mobile.
- **Pied de page** : encre, grand mot-symbole, téléphone en très grand, liens.

## Illustrations et images

- Illustrations SVG au trait : trait encre 2,2px à bouts ronds, aplats bleus ou gris décalés.
  Elles se dessinent quand on arrive dessus. Une par idée.
- 3D douce (three.js) seulement en haut de l'accueil : un Z en éclair bleu en relief et
  des formes arrondies mates qui suivent la souris. Illustration fixe si WebGL est absent
  ou si l'utilisateur réduit les animations.
- Captures de sites dans un cadre navigateur/téléphone, toujours étiquetées « Client » ou « Concept ».

## Mouvement

Lenis (défilement fluide), GSAP + ScrollTrigger : apparition = montée 40px + fondu, 1s, `expo.out`.
Titres : mots qui montent un par un. Rien de ce qui se clique ne bouge de plus de 4px.
Tout est coupé avec `prefers-reduced-motion`.
