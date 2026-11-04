# Languages Atlas

The published atlas includes 118 bilingual slides, 108 PNG maps and final indicators for 54 childhood-language categories. The 1,893-district statistical version and 1,892-unit cartographic derivative remain separate in the data download. Sangani is aggregated into Perené only in the derivative.

`site/` is the complete, independently deployable website. Its HTML, CSS and JavaScript are editable source files. The approved PNG maps are preserved byte-for-byte and checked against `site/slide_manifest.json`. Geographic shapes are embedded in the PNGs, so deployment needs no external shapefile, GeoPackage, tile server or research directory.

From the repository root, run `python -B tools/publication.py verify`. To create a fresh standalone deployment folder, run `python -B tools/publication.py package work/languages-release`. No dependencies beyond Python 3.12 or later are needed for these maintenance commands. The website itself needs only a modern browser and static hosting.

The public download contains final district indicators and national ranking in CSV/Parquet, the district crosswalk, category dictionary and methodology. It contains no original REDATAM Excel files or internal reports. Statistical table and crosswalk bytes match the approved research outputs; dictionary labels and definitions are preserved while local paths are replaced with public source attribution.

Read [indicator definitions](site/provenance/indicators.json) and [methodology](site/provenance/approved_map_methodology.txt) before interpreting the figures. Territorial reconciliation remains pending for 182 population differences. The original official dictionary was unavailable. These limits remain visible in the atlas; publication preparation does not resolve them.

The original scientific processing pipeline and source data remain preserved locally, outside the public allowlist. Full scientific regeneration requires that research archive. Public maintenance packages the published static source and checks its integrity.
