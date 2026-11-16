"""Verify the minimal ethnicity runtime using only the Python standard library."""
import hashlib,json,zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
EXPECTED={'index.html','deck.css','deck.js','deck-data.js','assets/district_geometry.js',
          'assets/district_values.js','downloads/atlas_etnico_datos.xlsx','netlify.toml',
          '_headers','provenance/publication.json'}

def assignment(path,prefix):
    raw=path.read_text(encoding='utf-8')
    assert raw.startswith(prefix) and raw.endswith(';'),path
    return json.loads(raw[len(prefix):-1])

def verify():
    site=ROOT/'atlases/ethnicity/site'
    approved=json.loads((ROOT/'publication_files.json').read_text(encoding='utf-8'))['files']
    listed={n.removeprefix('atlases/ethnicity/site/') for n in approved if n.startswith('atlases/ethnicity/site/')}
    assert listed==EXPECTED,'Unexpected published runtime files'
    actual={p.relative_to(site).as_posix() for p in site.rglob('*') if p.is_file()}
    assert actual==EXPECTED,'Missing or additional packaged files'
    provenance=json.loads((site/'provenance/publication.json').read_text(encoding='utf-8'))
    assert {a['path'] for a in provenance['files']}==EXPECTED-{'provenance/publication.json'}
    for item in provenance['files']:
        p=site/item['path'];assert p.stat().st_size==item['bytes']
        assert hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256'],item['path']
    data=assignment(site/'deck-data.js','window.ATLAS=')
    slides=data['slides'];assert len(slides)==138 and len({s['id'] for s in slides})==138
    assert len(data['categories'])==64 and len(data['geometry_codes'])==1892
    assert sum(s['kind']=='map' for s in slides)==128
    assert sum(s['kind']=='maxima' for s in slides)==2
    assert all(not any(k in s for k in ['images','previews','csv']) for s in slides)
    assert set(data['geometry_codes'])=={r[0] for r in assignment(site/'assets/district_geometry.js','window.ATLAS_GEOMETRY=')['national']['paths']}
    for s in slides:
        if 'district_bins' in s:assert len(s['district_bins'])==1892
    with zipfile.ZipFile(site/'downloads/atlas_etnico_datos.xlsx') as z:
        assert z.testzip() is None
        ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        sheets=ET.fromstring(z.read('xl/workbook.xml')).find('s:sheets',ns)
        assert [a.attrib['name'] for a in sheets]==['Datos_Data','Diccionario_Dictionary']
        sheet=ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        assert len(sheet.find('s:sheetData',ns))==1893
    return dict(status='PASS',files=len(EXPECTED),bytes=sum((site/n).stat().st_size for n in EXPECTED),slides=138,categories=64,mapped_units=1892,workbook_sheets=2)

if __name__=='__main__':print(json.dumps(verify(),indent=2))
