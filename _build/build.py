#!/usr/bin/env python3
"""Assemble les pages du site WEBZLY.

Chaque fichier de _build/pages/ commence par un en-tête (title, description, nav...)
entre deux lignes « --- », suivi du contenu HTML de la page. Le script l'insère dans
_build/layout.html et écrit le résultat à la racine du site.

Raccourcis utilisables dans les pages :
  {{ill:nom}}   insère l'illustration _build/ill/nom.svg
  {{part:nom}}  insère le bloc _build/parts/nom.html

Usage : python3 _build/build.py   (depuis n'importe quel dossier)
"""
import hashlib
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "_build"
NAV = ["offres", "realisations", "methode", "apropos", "faq"]


def read(p):
    return p.read_text(encoding="utf-8")


def front_matter(text):
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta, text[m.end():]


def expand(html, depth=0):
    if depth > 4:
        return html
    html = re.sub(r"\{\{ill:([\w-]+)\}\}", lambda m: read(SRC / "ill" / f"{m.group(1)}.svg").strip(), html)
    html = re.sub(r"\{\{part:([\w-]+)\}\}", lambda m: expand(read(SRC / "parts" / f"{m.group(1)}.html"), depth + 1), html)
    return html


def legal(meta, body):
    return f"""    <section class="legal">
      <div class="wrap legal__in">
        <header class="legal__head" data-reveal>
          <p class="mono kicker">Informations légales</p>
          <h1 class="h1">{meta['h1']}</h1>
          <p class="legal__updated">{meta['updated']}</p>
        </header>
        <div class="prose" data-reveal>
{body}
        </div>
      </div>
    </section>"""


def main():
    layout = expand(read(SRC / "layout.html"))
    assets = [ROOT / "assets/css/site.css", ROOT / "assets/js/site.js"]
    v = hashlib.sha1(b"".join(p.read_bytes() for p in assets if p.exists())).hexdigest()[:8]
    for page in sorted((SRC / "pages").glob("*.html")):
        meta, body = front_matter(read(page))
        if meta.get("layout") == "legal":
            body = legal(meta, body)
        name = page.stem
        path = "" if name == "index" else f"{name}.html"
        html = layout
        for key in NAV:
            html = html.replace("{{cur_%s}}" % key, ' aria-current="page"' if meta.get("nav") == key else "")
        repl = {
            "title": meta.get("title", "WEBZLY"),
            "description": meta.get("description", ""),
            "path": path,
            "bodyclass": meta.get("bodyclass", ""),
            "head": expand(read(SRC / "parts" / meta["head"]) if meta.get("head") else ""),
            "scripts": expand(read(SRC / "parts" / meta["scripts"]) if meta.get("scripts") else ""),
            "v": v,
            "content": expand(body),
        }
        # le contenu en dernier : il ne doit pas être réinterprété
        for k in ["title", "description", "path", "bodyclass", "head", "scripts", "v"]:
            html = html.replace("{{%s}}" % k, repl[k])
        html = html.replace("{{content}}", repl["content"])
        if meta.get("base"):
            html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <base href="/">', 1)
        left = re.findall(r"\{\{[^}]+\}\}", html)
        if left:
            raise SystemExit(f"{page.name}: balises non remplacées {left}")
        (ROOT / f"{name}.html").write_text(html, encoding="utf-8")
        print(f"  {name}.html")


if __name__ == "__main__":
    main()
