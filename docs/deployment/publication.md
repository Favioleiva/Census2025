# Publication and maintenance

`publication_files.json` is the exact list of files approved as publication candidates. `.gitignore` excludes everything else by default and explicitly opens only these files and their parent directories. New files inside an existing atlas are excluded until reviewed and added to both lists. Never use force-add to bypass this policy.

Run `python -B tools/publication.py verify` before packaging. It requires all listed files, checks website-relative HTML/CSS resources, validates the 118-slide manifest and 108 approved map checksums, and verifies the download's explicit member list and checksums. It also checks both district versions, 54 category definitions and preservation of national category totals across aggregation.

The Languages Atlas is a static website maintained directly as HTML, CSS and JavaScript in `atlases/languages/site/`. No application compilation, credentials or remote data queries are required. To produce a standalone folder, use:

```sh
python -B tools/publication.py package work/languages-release
```

The destination must be a new directory under `work/`. The command copies only the allowlisted public site. It does not deploy, stage, commit or push. Do not upload historical site folders: their embedded archives contain original source downloads and internal documentation excluded from publication.

For standalone hosting, upload the generated directory and use its `netlify.toml` (`publish = "."`). For repository-root hosting, use `atlases/languages/web/netlify.toml` with publish directory `atlases/languages/site` and no build command. The website is also compatible with ordinary static HTTP hosting; `_headers` and `netlify.toml` are hosting-specific configuration.

For updates, edit the public HTML/CSS/JavaScript together with translations, check slide identifiers and rerun verification. Changes to statistical tables or approved map bytes require substantive review and corresponding checksum/metadata updates. The dataset ZIP is the single public distribution archive: retain its explicit member list, deterministic timestamps, member sizes and SHA-256 manifest. Never insert original downloads, internal diagnostics or validation reports. Full extraction, indicator recomputation and geometry rendering remain in the separately preserved research archive.

For each future theme, use `atlases/<theme>/site/` for its standalone website, a separate deployment configuration and a registry entry. Add only reviewed final files to the publication list and precise ignore exceptions. The current verification tool has explicit Languages checks; extend it with the new theme's requirements when that theme is implemented. Planned registry entries do not represent completed products.

The approved language maps retain unresolved territorial differences and the documented dictionary limitation. Confirm redistribution rights for external statistical and geographic material before public release; this repository does not supply or infer those permissions.
