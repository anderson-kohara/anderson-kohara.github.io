"""Build the public site using an explicit list of pages and their local assets."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re
import shutil

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / '_site'
PAGES = (
    'index.html', 'cv.html', 'publications.html', 'teaching.html',
    'booster-physique.html', 'mecanique-analytique.html',
    'mecanique-analytique-calcul-variationnel.html',
)
ALLOWED = {'.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico', '.woff', '.woff2'}

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        self.links.extend(value for key, value in attrs if key in ('src', 'href') and value)

pending = [ROOT / page for page in PAGES]
files = set()
while pending:
    file = pending.pop()
    if file.is_symlink():
        raise ValueError(f'Symlinks are not published: {file}')
    file = file.resolve()
    relative = file.relative_to(ROOT)
    if file in files:
        continue
    if file.suffix.lower() not in ALLOWED or not file.is_file():
        raise ValueError(f'Missing or non-public asset: {relative}')
    files.add(file)
    links = []
    if file.suffix == '.html':
        parser = Links()
        parser.feed(file.read_text(encoding='utf-8'))
        links = parser.links
    elif file.suffix == '.css':
        links = re.findall(r'url\([\s\'\"]*([^\)\'\"\s]+)', file.read_text(encoding='utf-8'))
    for link in links:
        url = urlsplit(link)
        if url.scheme or url.netloc or not url.path:
            continue
        if url.path.startswith('/'):
            raise ValueError(f'Use relative URLs for GitHub project Pages: {link}')
        pending.append(file.parent / unquote(url.path))

# Recreate only this fixed build directory inside the project.
if OUTPUT.is_symlink() or OUTPUT.resolve().parent != ROOT:
    raise ValueError('Unsafe build output path')
if OUTPUT.exists():
    shutil.rmtree(OUTPUT)
OUTPUT.mkdir()
for file in sorted(files):
    target = OUTPUT / file.relative_to(ROOT)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(file, target)
(OUTPUT / '.nojekyll').touch()
print(f'Public site prepared: {len(files)} files in {OUTPUT}')
print('No LaTeX, archives, private PDFs, or working files included.')
