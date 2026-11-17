# Atlas de autoidentificación étnica / Ethnic Self-Identification Atlas

**Autor / Author: Favio Leiva.** 142 diapositivas bilingües, 64 categorías y 1.892 unidades cartográficas. Incluye máximos distritales, diversidad (1 − HHI), rankings nacionales y mapas absolutos y relativos, con detalle de Lima y Callao, hover y zoom manual.

**Datos:** `site/downloads/atlas_etnico_datos.xlsx`, un único Excel con las hojas `Datos_Data` y `Diccionario_Dictionary`. La identidad étnica es independiente de la lengua aprendida en la niñez.

## Netlify

Crear un sitio desde este repositorio, rama `main`, con:

- **Base directory:** `atlases/ethnicity/site`
- **Build command:** vacío
- **Publish directory:** `.` (relativo a Base directory)

El archivo `site/netlify.toml` define `publish = "."`. No requiere Node, instalación de paquetes, variables de entorno ni servidor de aplicación. Para una configuración con base en la raíz del repositorio, usar `web/netlify.toml`, que publica `atlases/ethnicity/site`.

Para una carga manual, generar una carpeta independiente desde la raíz del repositorio:

```sh
python -B tools/publication.py verify
python -B tools/publication.py package work/ethnicity-release --atlas ethnicity
```

Subir el contenido de la carpeta generada a Netlify. `index.html` también puede abrirse localmente. El sitio carga exclusivamente archivos locales y no consulta servicios externos.

## Alcance

Fuente: INEI, Censos Nacionales 2025; libro censal compilado y cartografía suministrada. Edición exploratoria: el universo oficial de la pregunta y la exclusividad de respuestas siguen pendientes de confirmación documental. Los porcentajes utilizan población de todas las edades. Sangani se agrega a Perené en la cartografía; los 64 totales nacionales se conservan. Persisten 182 diferencias de población respecto de atributos cartográficos. El índice usa ETH_01–ETH_63 y excluye la no respuesta ETH_64. Los códigos ETH son identificadores locales.

## English

142 bilingual slides with national/district rankings, ethnic diversity, absolute counts and exploratory percentages. Includes Lima–Callao insets, district hover, Top 20 selection, manual zoom and pan. Download one XLSX containing data and a bilingual dictionary.

For Netlify, connect branch `main`, set **Base directory** to `atlases/ethnicity/site`, leave **Build command** empty, and set **Publish directory** to `.`. The site requires no installation, secrets, backend or remote data requests. The commands above verify the repository and package a standalone upload folder.

This is an exploratory edition: official question universe and response exclusivity remain unconfirmed; percentages use an all-age denominator. Only the mapped derivative aggregates Sangani into Perené. Territorial limitations remain documented in the deck and workbook. Public files include only the interactive runtime, final workbook, checksums and hosting configuration. Historical PNGs, original workbooks, contracts, diagnostics and intermediate data remain outside this publication.

## Actualización / Update

El mapa de grupos presentes cuenta las 63 categorías de identidad con población mayor que cero, incluidas las residuales y excluida la no respuesta. El hover y la ficha muestran todos los grupos presentes por población descendente. Las listas largas permiten desplazamiento. Los mapas de máximos conservan la tabla numerada, pero muestran los distritos sin números superpuestos. Al seleccionar una fila se resalta el distrito. Todos los mapas incorporan un contorno nacional negro de 0,75 px y conservan transparentes los límites distritales.

The presence map counts the 63 identity categories with population greater than zero, including residual categories and excluding nonresponse. Hover and selected-district details list all present groups by descending population, with scrolling for long lists. Maxima maps retain numbered tables without numeric map labels; row selection highlights the district. A thin black national outline marks the country while district boundaries remain transparent.

Los slides 5 y 7 muestran los Bottom 20 de diversidad y cantidad de grupos presentes. Reutilizan los mapas y escalas de los Top 20 anteriores, con orden ascendente antes de redondear, ceros válidos incluidos, datos faltantes excluidos y desempate por código distrital fuente.

Slides 5 and 7 show the Bottom 20 for diversity and number of present groups. They reuse the previous Top 20 maps and scales, ranking before rounding, including valid zeros, excluding missing values and breaking ties by source district code.

El slide 9 incorpora un mapa de calor de asociación territorial entre 60 grupos identificados: presencia compartida (phi) y porcentajes distritales (Spearman). Permite alternar entre los 20 grupos de mayor población y los 60 grupos. La escala fija va de azul (negativo) a blanco (cero) y rojo (positivo); cada celda muestra el coeficiente y el número de distritos con ambos grupos. No mide identidad individual compartida ni causalidad. Excluye las tres categorías residuales y la no respuesta. En los slides 2 y 3, el clic sobre los mapas de Perú y Lima–Callao abre el explorador con zoom y desplazamiento; las tablas conservan el ordenamiento y resaltado del distrito.

Slide 9 adds a territorial association heatmap for 60 named groups, switching between shared presence (phi) and district shares (Spearman), and between the 20 largest populations and all 60 groups. The fixed scale runs from blue (negative) through white (zero) to red (positive). Cells show coefficients and joint district counts, not individual shared identity or causation. The three residual categories and nonresponse are excluded. On slides 2 and 3, clicking either map opens the zoom/pan explorer; tables retain sorting and district highlighting.
