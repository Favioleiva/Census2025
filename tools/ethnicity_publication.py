"""Verify the minimal ethnicity runtime using only the Python standard library."""
import hashlib,json,zipfile
from fractions import Fraction
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
EXPECTED={'index.html','deck.css','deck.js','deck-data.js','assets/district_geometry.js',
          'assets/district_values.js','downloads/atlas_etnico_datos.xlsx','netlify.toml',
          '_headers','provenance/publication.json','assets/country_outline.js'}

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
    slides=data['slides'];assert len(slides)==142 and len({s['id'] for s in slides})==142
    assert len(data['categories'])==64 and len(data['geometry_codes'])==1892
    assert sum(s['kind']=='map' for s in slides)==128
    assert sum(s['kind']=='maxima' for s in slides)==2
    assert sum(s['kind']=='presence' for s in slides)==2
    assert sum(s['kind']=='diversity' for s in slides)==2
    assert sum(s['kind']=='correlation' for s in slides)==1
    correlation=next(s for s in slides if s['kind']=='correlation')
    assert slides.index(correlation)==8
    assert len(correlation['groups'])==60 and correlation['districts']==1892
    assert correlation['default_metric']=='phi' and correlation['default_group_count']==20
    assert not {'ETH_03','ETH_04','ETH_10','ETH_64'} & {c['id'] for c in correlation['groups']}
    for metric in ['phi','spearman','joint']:
        matrix=correlation[metric]
        assert len(matrix)==60 and all(len(row)==60 for row in matrix)
        for i in range(60):
            for j in range(60):
                assert abs(matrix[i][j]-matrix[j][i])<1e-12
                if metric=='joint':assert isinstance(matrix[i][j],int) and 0<=matrix[i][j]<=1892
                else:assert -1-1e-12<=matrix[i][j]<=1+1e-12
            if metric!='joint':assert abs(matrix[i][i]-1)<1e-12
    observations=assignment(site/'assets/district_values.js','window.ATLAS_DISTRICTS=')
    expected=[sum(observations['counts'][f'ETH_{j:02}'][i]>0 for j in range(1,64)) for i in range(1892)]
    assert observations['positive_identity_categories']==expected
    presence=next(s for s in slides if s['kind']=='presence')
    assert presence['included_categories']==63 and presence['observed_max']==max(expected)
    assert all(r['positive_identity_categories']==expected[observations['codes'].index(r['geometry_code'])] for r in presence['table'])
    scores=[]
    for i in range(1892):
        counts=[observations['counts'][f'ETH_{j:02}'][i] for j in range(1,64)];n=sum(counts)
        scores.append(Fraction(n*n-sum(v*v for v in counts),n*n) if n else None)
    for bottom_id,parent_id,values,field in [('diversity-bottom','diversity-map',scores,'diversity_1_minus_hhi'),('ethnic-presence-bottom','ethnic-presence',expected,'positive_identity_categories')]:
        bottom=next(s for s in slides if s['id']==bottom_id);parent=next(s for s in slides if s['id']==parent_id)
        assert slides.index(bottom)==slides.index(parent)+1
        assert bottom['classes']==parent['classes'] and bottom['district_bins']==parent['district_bins']
        assert bottom['ranking_order']=='ascending' and bottom['ranking_includes_zero']
        assert len(bottom['table'])==len({r['geometry_code'] for r in bottom['table']})==20
        selected=[values[observations['codes'].index(r['geometry_code'])] for r in bottom['table']]
        assert selected==sorted(v for v in values if v is not None)[:20]
        assert all(abs(r[field]-float(v))<1e-14 for r,v in zip(bottom['table'],selected))
    outline=assignment(site/'assets/country_outline.js','window.ATLAS_OUTLINE=')
    assert set(outline)=={'national','inset'} and all(outline.values())
    assert 'assets/country_outline.js' in (site/'index.html').read_text(encoding='utf-8')
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
    return dict(status='PASS',files=len(EXPECTED),bytes=sum((site/n).stat().st_size for n in EXPECTED),slides=142,categories=64,mapped_units=1892,workbook_sheets=2,presence_values_verified=True,bottom_rankings_verified=True,country_outline=True)

if __name__=='__main__':print(json.dumps(verify(),indent=2))
