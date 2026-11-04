# Census2025

District-level thematic atlases of Peru's 2025 Population and Housing Census, with published indicators, methodological definitions and independently deployable websites.

The **Languages Atlas** presents 54 childhood-language categories through 108 approved choropleth maps and 118 slides in Spanish and English. Its download contains final indicators for 1,893 source districts and the separate 1,892-unit cartographic derivative, national rankings, a category dictionary and an explicit district correspondence table.

## Explore the atlas

Serve the static website from the repository root with Python 3:

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory atlases/languages/site
```

Open `http://127.0.0.1:8000/`. Use the language selector, searchable contents and full-resolution map viewer. The **Download published data** button provides CSV and Parquet tables. The website has no build step, package dependencies or runtime connection to REDATAM.

## Products and definitions

| Location | Contents |
| --- | --- |
| [Languages Atlas](atlases/languages/README.md) | Product scope and maintenance |
| [Website](atlases/languages/site/index.html) | Complete bilingual static atlas |
| [Published data](atlases/languages/site/downloads/peru_2025_languages.zip) | Final indicators, ranking, dictionary and district crosswalk |
| [Indicator definitions](atlases/languages/site/provenance/indicators.json) | Numerators, denominators, missing values and interpretation |
| [Methodology](atlases/languages/site/provenance/approved_map_methodology.txt) | Geographic treatment, map classes and limitations |
| [Thematic registry](atlases/registry.json) | Active atlas and planned themes |

Counts represent persons reporting each childhood-language category. Categories may overlap; their sum is not a count of unique people. Percentages use population aged three years and older and are not normalized across categories. Read district identifiers as text. Sangani is aggregated into Perené only in the mapped derivative; national counts remain unchanged.

The maps retain an unresolved source limitation: 182 district population differences between census tabulations and geographic attributes. National agreement does not establish district boundary equivalence. The original official dictionary was unavailable; category labels are preserved from query programs and Excel headers. Comparability with earlier censuses is not assumed.

## Maintain and deploy

```sh
python -B tools/publication.py verify
python -B tools/publication.py package work/languages-release
```

Verification checks the explicit file allowlist, local links, slide coverage, map checksums, download contents and district tables. Packaging creates a new standalone directory without modifying published files. The HTML, CSS and JavaScript in `atlases/languages/site/` are the maintained website source; no application framework is needed. See [publication guidance](docs/deployment/publication.md) for deployment contexts and future themes.

This public repository contains finalized publication products and their maintenance resources. Source REDATAM downloads, intermediate data, historical research bundles, contracts and internal reports remain in the separate local research archive. Re-extraction and re-rendering from source geometry require that archive; they are not prerequisites for using or deploying the published atlas.

Statistical source: INEI, Censos Nacionales 2025, [REDATAM](https://redatamcpv2025.inei.gob.pe/). External source and geographic redistribution licenses are not inferred. The approved maps and their source limitations are preserved.
