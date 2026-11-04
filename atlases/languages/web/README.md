# Languages deployment configuration

The public website is `atlases/languages/site/`. It contains every resource required for deployment.

For a repository-root deployment, this directory's `netlify.toml` specifies `atlases/languages/site` as the publish directory. Select this configuration explicitly in the hosting setup; there is no root configuration assigning a default theme. No build command is needed.

For a standalone upload, package the website with `python -B tools/publication.py package work/languages-release`. The packaged site's own `netlify.toml` uses `publish = "."` and its `_headers` applies download and security headers. These are different configuration contexts; do not use the standalone publish path from the repository root.

Future thematic atlases receive their own site directory and configuration. See [publication guidance](../../../docs/deployment/publication.md). Hosting configuration and deployment are performed by the repository owner.
