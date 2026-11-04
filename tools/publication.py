"""Verify or package allowlisted static products with Python's standard library."""
import argparse
import csv
import hashlib
from html.parser import HTMLParser
import io
import json
from pathlib import Path
import re
import shutil
from urllib.parse import unquote, urlsplit
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DATA_MEMBERS = {
    'dataset_distrital_1892.csv', 'dataset_distrital_1892.parquet',
    'dataset_distrital_1893.csv', 'dataset_distrital_1893.parquet',
    'ranking_nacional.csv', 'ranking_nacional.parquet',
    'correspondencia_distrital.csv', 'diccionario_categorias.csv',
    'metodologia.txt', 'README.txt', 'MANIFEST.json',
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(path):
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = set()
        self.ids = set()
        self.slides = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            require(attrs['id'] not in self.ids, f'Duplicate HTML id: {attrs["id"]}')
            self.ids.add(attrs['id'])
        if 'slide' in attrs.get('class', '').split():
            self.slides += 1
        for key in ['href', 'src', 'data-src']:
            if attrs.get(key):
                self.links.add(attrs[key])


def candidates():
    names = json.loads((ROOT / 'publication_files.json').read_text(encoding='utf8'))['files']
    require(len(names) == len(set(names)), 'Duplicate publication paths')
    for name in names:
        path = ROOT / name
        require(not path.is_symlink() and path.resolve().is_relative_to(ROOT), f'Unsafe path: {name}')
        require(path.is_file(), f'Missing publication file: {name}')
    return names


def verify():
    names = candidates()
    registry = json.loads((ROOT / 'atlases/registry.json').read_text(encoding='utf8'))
    module = next(m for m in registry['modules'] if m['id'] == 'languages')
    site = ROOT / module['publication_directory']
    site_names = {Path(n).relative_to(site.relative_to(ROOT)).as_posix() for n in names if (ROOT / n).is_relative_to(site)}
    actual = {p.relative_to(site).as_posix() for p in site.rglob('*') if p.is_file()}
    require(site_names == actual, 'Site contains missing or non-allowlisted files')
    parser = Links()
    parser.feed((site / 'index.html').read_text(encoding='utf8'))
    require(parser.slides == 118, 'Expected 118 slides')
    for link in parser.links:
        parsed = urlsplit(link)
        if parsed.scheme or parsed.netloc:
            continue
        if parsed.path:
            require(unquote(parsed.path) in site_names, f'Missing local resource: {link}')
        elif parsed.fragment:
            require(unquote(parsed.fragment) in parser.ids, f'Broken slide link: {link}')
    for css in site.glob('*.css'):
        for url in re.findall(r'url\([\s\'"]*([^\)\'"\s]+)', css.read_text(encoding='utf8')):
            if not urlsplit(url).scheme and not url.startswith('#'):
                require(url in site_names, f'Missing CSS resource: {url}')
    slides = json.loads((site / 'slide_manifest.json').read_text(encoding='utf8'))
    require(len(slides) == 118 and all(s['id'] in parser.ids for s in slides), 'Slide manifest mismatch')
    maps = [s for s in slides if s['kind'] == 'map']
    require(len(maps) == 108, 'Expected 108 maps')
    require({s['variable'] for s in maps} == {f'S5_P16_{n}' for n in range(1, 55)}, 'Incomplete map categories')
    for item in maps:
        require(item['image'] in site_names, f'Missing map: {item["image"]}')
        require(sha(site / item['image']) == item['sha256'], f'Changed approved map: {item["image"]}')
    definitions = json.loads((site / 'provenance/indicators.json').read_text(encoding='utf8'))['indicators']
    require(len(definitions) == 54, 'Expected 54 definitions')
    with zipfile.ZipFile(site / 'downloads/peru_2025_languages.zip') as z:
        require(len(z.namelist()) == len(DATA_MEMBERS) and set(z.namelist()) == DATA_MEMBERS, 'Unexpected dataset members')
        require(z.testzip() is None, 'Corrupt dataset archive')
        manifest = json.loads(z.read('MANIFEST.json'))
        require(len(manifest) == len(DATA_MEMBERS) - 1 and {m['file'] for m in manifest} == DATA_MEMBERS - {'MANIFEST.json'}, 'Incomplete dataset manifest')
        for item in manifest:
            data = z.read(item['file'])
            require(len(data) == item['bytes'] and hashlib.sha256(data).hexdigest() == item['sha256'], f'Dataset checksum mismatch: {item["file"]}')
        tables = {}
        for count in [1892, 1893]:
            rows = list(csv.DictReader(io.StringIO(z.read(f'dataset_distrital_{count}.csv').decode('utf-8-sig'))))
            require(len(rows) == count and len({r['district_code'] for r in rows}) == count, f'Invalid district set: {count}')
            for n in range(1, 55):
                variable = f'S5_P16_{n}'
                require(variable in rows[0] and variable + '_pct' in rows[0], f'Missing column: {variable}')
                require(all(r[variable].isdigit() for r in rows), f'Invalid published counts: {variable}')
            tables[count] = rows
        ranking = list(csv.DictReader(io.StringIO(z.read('ranking_nacional.csv').decode('utf-8-sig'))))
        dictionary = list(csv.DictReader(io.StringIO(z.read('diccionario_categorias.csv').decode('utf-8-sig'))))
        require(len(ranking) == len(dictionary) == 54, 'Expected 54 ranking and dictionary rows')
        require({r['variable']: r['lengua_categoria'] for r in dictionary} == {r['variable']: r['category'] for r in definitions}, 'Dictionary labels differ from indicator definitions')
        for n in range(1, 55):
            variable = f'S5_P16_{n}'
            require(sum(int(r[variable]) for r in tables[1892]) == sum(int(r[variable]) for r in tables[1893]), f'National total differs: {variable}')
    return {'status': 'PASS', 'candidate_files': len(names), 'candidate_bytes': sum((ROOT / n).stat().st_size for n in names), 'site_files': len(site_names), 'slides': 118, 'maps': 108, 'categories': 54, 'archive_members': len(DATA_MEMBERS)}


def package(destination):
    verify()
    destination = destination.resolve()
    allowed = (ROOT / 'work').resolve()
    require(allowed.is_relative_to(ROOT) and destination.is_relative_to(allowed) and destination != allowed, 'Package must be a new directory below work/')
    require(not destination.exists(), 'Destination already exists; choose a new directory')
    destination.mkdir(parents=True)
    prefix = 'atlases/languages/site/'
    for name in candidates():
        if name.startswith(prefix):
            target = destination / name[len(prefix):]
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / name, target)
    return {'status': 'PASS', 'standalone_site': str(destination)}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('verify')
    pack = sub.add_parser('package')
    pack.add_argument('destination', type=Path)
    args = parser.parse_args()
    print(json.dumps(verify() if args.command == 'verify' else package(args.destination), indent=2))
