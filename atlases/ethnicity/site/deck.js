/* Offline 16:9 atlas. Native text, tables and reusable district SVG geometry. */
(()=>{'use strict';
const data=window.ATLAS,geo=window.ATLAS_GEOMETRY,$=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let lang='es',current=0,selectedWinner=null;const codeIndex=new Map(data.geometry_codes.map((c,i)=>[c,i]));
const ui={
 es:{contents:'Índice',search:'Buscar categoría o diapositiva',empty:'Sin coincidencias',zoom:'Explorar mapa',details:'Datos',close:'Cerrar',original:'PNG de referencia',native:'Restablecer',fit:'Ajustar',district:'Distrito / provincia, región',persons:'Personas',percentage:'Porcentaje',index:'Índice',positive:'Distritos > 0',national:'Perú · mapa distrital',inset:'Lima Metropolitana y Callao',scope:'43 distritos de Lima y 7 del Callao',absolute:'Absoluto',relative:'Relativo',count:'Distribución absoluta · personas',share:'Distribución relativa · porcentaje exploratorio',total:'Total nacional',insettotal:'Lima y Callao',legend:'Escala común',districts:'distritos',missing:'Sin dato',legendnote:'Distritos por intervalo · total nacional',topcount:'personas',toprelative:'porcentaje distrital',topdiv:'mayor diversidad',ranknote:'Orden sin redondear; solo valores positivos.',nonresponse:'Completitud de respuesta · no es un grupo étnico',source:'Fuente: INEI, Censo 2025 · 1 892 unidades cartográficas.',pending:'Exploratorio · definiciones documentales pendientes.',caption:'Sangani agregado a Perené · límites suministrados',diversity:'Diversidad étnica del Perú',divsubtitle:'1 − índice de Herfindahl–Hirschman',nationalindex:'Índice nacional',divbasis:'63 categorías de identidad; no respuesta excluida.',identity:'Autoidentificación étnica',ranking:'Población por autoidentificación étnica',ranks:'Ranking nacional',positions:'posiciones',category:'Categoría',bars:'Población · escala logarítmica común',nonresnote:'No sabe / No responde: 127 114 personas · fuera del ranking de identidad.',rankingnote:'Barras claras: categorías residuales. Cada nombre abre sus mapas. Conteos sin transformar; barras en escala logarítmica de 1 a 100 000 000.',cover:'Atlas de autoidentificación<br>étnica del Perú',census:'Censo 2025',author:'Autor: Favio Leiva',coversub:'Identidad, población y diversidad<br>64 categorías · 1 892 unidades cartográficas',download:'Descargar Excel',start:'Explorar la diversidad →',covermap:'Quechuas · porcentaje distrital',covernote:'La identidad étnica es independiente de la lengua.',tie:'Empates: código fuente ascendente. Solo valores positivos.'},
 en:{contents:'Contents',search:'Search categories or slides',empty:'No matches',zoom:'Explore map',details:'Data',close:'Close',original:'Reference PNG',native:'Reset',fit:'Fit',district:'District / province, region',persons:'Persons',percentage:'Percentage',index:'Index',positive:'Districts > 0',national:'Peru · district map',inset:'Metropolitan Lima and Callao',scope:'43 Lima districts and 7 Callao districts',absolute:'Absolute',relative:'Relative',count:'Absolute distribution · persons',share:'Relative distribution · exploratory percentage',total:'National total',insettotal:'Lima and Callao',legend:'Common scale',districts:'districts',missing:'No data',legendnote:'Districts per interval · national total',topcount:'persons',toprelative:'district percentage',topdiv:'highest diversity',ranknote:'Ranked before rounding; positive values only.',nonresponse:'Response completeness · not an ethnic group',source:'Source: INEI, 2025 Census · 1,892 mapped units.',pending:'Exploratory · official definitions pending.',caption:'Sangani aggregated into Perené · supplied boundaries',diversity:'Ethnic diversity in Peru',divsubtitle:'1 − Herfindahl–Hirschman index',nationalindex:'National index',divbasis:'63 identity categories; nonresponse excluded.',identity:'Ethnic self-identification',ranking:'Population by ethnic self-identification',ranks:'National ranking',positions:'positions',category:'Category',bars:'Population · common logarithmic scale',nonresnote:'Does not know / Does not answer: 127,114 persons · outside the identity ranking.',rankingnote:'Lighter bars: residual categories. Select a name to open its maps. Untransformed counts; logarithmic bars from 1 to 100,000,000.',cover:'Atlas of Ethnic<br>Self-Identification<br>in Peru',census:'2025 Census',author:'Author: Favio Leiva',coversub:'Identity, population and diversity<br>64 categories · 1,892 mapped units',download:'Download Excel',start:'Explore diversity →',covermap:'Quechuas · district percentage',covernote:'Ethnic identity is independent of language.',tie:'Ties: ascending source code. Positive values only.'}
};
const num=n=>new Intl.NumberFormat(lang==='es'?'es-PE':'en-US').format(n),dec=n=>n>0&&n<.01?(lang==='es'?'<0,01':'<0.01'):(lang==='es'?Number(n).toFixed(2).replace('.',','):Number(n).toFixed(2));
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function svgMap(key){const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',geo[key].viewBox);svg.setAttribute('class','map-svg');svg.setAttribute('role','img');svg.dataset.scope=key;
 for(const [code,d] of geo[key].paths){const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('class','district');path.dataset.code=code;svg.appendChild(path)}
 const boundary=document.createElementNS(ns,'path');boundary.setAttribute('d',window.ATLAS_OUTLINE[key]);boundary.setAttribute('class','country-outline');boundary.setAttribute('aria-hidden','true');svg.appendChild(boundary);
 return svg}
const maps={national:svgMap('national'),inset:svgMap('inset')};
function mountMap(target,key,s){const svg=maps[key],classes=s.classes[lang];svg.classList.toggle('cover-relative',target==='cover-map');svg.classList.toggle('maxima-svg',s.kind==='maxima');svg.querySelector('.winner-markers')?.remove();svg.classList.remove('winner-selected');svg.setAttribute('aria-label',(key==='national'?ui[lang].national:ui[lang].inset)+' · '+s.title[lang]);for(const p of svg.querySelectorAll('.district')){const bin=s.district_bins[codeIndex.get(p.dataset.code)];p.setAttribute('fill',bin<0?'#b9b9b9':classes[bin].color);p.dataset.bin=bin;p.classList.toggle('winner',s.kind==='maxima'&&bin>0);p.classList.remove('chosen')}$(target).appendChild(svg);bindDistrictHover(svg,s)}
function legend(s,includeMissing=true){const t=ui[lang],classes=s.classes[lang].map(c=>({...c}));if(includeMissing)classes.push({label:t.missing,color:'#b9b9b9',districts:s.missing_districts,missing:true});return `<div class="legend-list">${classes.map(c=>`<div class="legend-item"><span class="swatch ${c.missing?'missing-swatch':''}" style="background-color:${c.color}"></span><span class="class-label">${esc(c.label)}</span><span class="district-count">${num(c.districts)} ${c.districts===1?(lang==='es'?'distrito':'district'):t.districts}</span></div>`).join('')}</div>`}
function region(r){return r.province_name+', '+r.department_name.replace('Prov. Constitucional del Callao','Callao').replace('Lima Metropolitana','Lima')}
function value(s,r){return s.kind==='presence'?num(r.positive_identity_categories):s.kind==='diversity'?dec(r.diversity_1_minus_hhi):s.mode==='relative'?dec(r.percentage)+' %':num(r.count)}
function topTable(s){const t=ui[lang],metric=s.kind==='presence'?presenceWords().unit:s.kind==='diversity'?t.index:s.mode==='relative'?t.percentage:t.persons;return `<table class="top-table"><thead><tr><th>#</th><th>${t.district}</th><th>${metric}</th></tr></thead><tbody>${s.table.map((r,i)=>`<tr data-code="${r.geometry_code}"><td>${i+1}</td><td title="${esc(r.district_name+' · '+region(r))}"><button type="button" aria-label="${t.zoom}: ${esc(r.district_name)}" class="district-link place ${r.district_name.length>39?'long-place':''}">${esc(r.district_name)}</button><small>${esc(region(r))}</small></td><td>${esc(value(s,r))}</td></tr>`).join('')}</tbody></table>`}
function mapSlide(s){const t=ui[lang],div=s.kind==='diversity',c=data.categories.find(c=>c.id===s.category_id),name=div?t.diversity:c[lang],subtitle=div?t.divsubtitle:s.mode==='relative'?t.share:t.count;return `<div class="map-head ${name.length>70?'long':''}"><p class="eyebrow">${t.identity} · Perú 2025${s.category_id==='ETH_64'?' · '+t.nonresponse:''}</p><h1>${esc(name)}</h1><div class="map-sub"><span>${subtitle}</span><div class="metric-links">${div?`<a href="#diversity-reading" data-go="diversity-reading">${lang==='es'?'Cómo interpretar el índice →':'Interpreting the index →'}</a>`:['absolute','relative'].map(m=>`<a class="${s.mode===m?'selected':''}" href="#${s.category_id}-${m}" data-go="${s.category_id}-${m}">${t[m]}</a>`).join('')}</div></div></div>
 <div class="map-grid ${s.mode==='relative'?'relative-map ':''}${s.classes[lang].length>8?'dense-legend':''}"><aside class="inset-panel"><h2>${t.inset}</h2><p class="scope">${t.scope}</p><div id="inset-map" class="inset-map"></div><div class="summary">${div?`<div><span>${t.nationalindex}</span><strong>${dec(s.national_index)}</strong></div><div class="secondary"><span>1 − HHI</span><strong>0 → 1</strong></div>`:`<div><span>${t.total}</span><strong>${num(s.national_count)}</strong></div><div class="secondary"><span>${t.insettotal}</span><strong>${num(s.inset_count)}</strong></div>`}</div><div class="legend-head"><h2>${t.legend}</h2><span>${div?t.index:s.mode==='relative'?'%':t.persons}</span></div>${legend(s)}<p class="legend-note">${t.legendnote}${div?'<br>'+t.divbasis:''}</p></aside>
 <section class="national-panel"><h2>${t.national}</h2><div id="national-map" class="national-map" tabindex="0" role="button" aria-label="${t.zoom}"></div><p class="national-caption">${t.caption}</p></section>
 <section class="ranking-panel ${s.table.length<10?'sparse':''}"><h2>Top ${s.table.length} · ${div?t.topdiv:s.mode==='relative'?t.toprelative:t.topcount}</h2>${topTable(s)}<p class="rank-note">${t.positive}: ${num(s.positive_districts)} · ${lang==='es'?'Solo valores positivos.':'Positive values only.'}</p></section></div>`}
function leaderCell(r,mode){const d=r['top_'+mode];return `<td class="district-leader" data-code="${d.geometry_code}" title="${esc(region(d))}">${esc(d.district_name)} <span class="leader-value">(${mode==='absolute'?num(d.count):esc(dec(d.percentage))+' %'})</span></td>`}
function rankingSlide(s){const t=ui[lang],rows=s.table;return `<article class="national-ranking"><p class="eyebrow">${t.ranks} · ${s.id.slice(-1)} / 3</p><h1>${t.ranking}</h1><p class="ranking-intro">${lang==='es'?'Puesto nacional conservado · categorías residuales al final':'Original national ranks retained · residual categories at the end'}</p><table class="national-table leaders"><thead><tr><th title="${t.ranks}">#</th><th>${t.category}</th><th>${lang==='es'?'Escala log.':'Log scale'}</th><th>${t.persons}</th><th>${t.positive}</th><th>${lang==='es'?'Mayor número · distrito':'Highest count · district'}</th><th>${lang==='es'?'Mayor porcentaje · distrito':'Highest share · district'}</th></tr></thead><tbody>${rows.map(r=>`<tr data-category="${r.category_id}" class="${['ETH_03','ETH_04','ETH_10'].includes(r.category_id)?'residual-row':''}"><td>${r.identity_rank}</td><td class="${r['label_'+lang].length>35?'long-label':''}"><a data-go="${r.category_id}-absolute" href="#${r.category_id}-absolute">${esc(r['label_'+lang])}</a></td><td class="barcell"><div class="bar-track"><div class="bar ${['ETH_03','ETH_04','ETH_10'].includes(r.category_id)?'residual':''}" style="width:${Math.log10(r.count)/8*100}%"></div></div></td><td>${num(r.count)}</td><td>${num(r.positive_districts)}</td>${leaderCell(r,'absolute')}${leaderCell(r,'relative')}</tr>`).join('')}</tbody></table><p class="ranking-note"><strong>${t.nonresnote}</strong><br>${lang==='es'?'Entre paréntesis: personas y porcentaje distrital, respectivamente. Porcentajes exploratorios; orden sin redondear.':'In parentheses: persons and district percentage, respectively. Exploratory percentages; ranked before rounding.'}<br>${lang==='es'?'Barras: escala logarítmica de 1 a 100 000 000. Residuales agrupadas al final; empates distritales por código fuente.':'Bars: logarithmic scale from 1 to 100,000,000. Residual categories grouped last; district ties use source code.'}</p></article>`}
function presenceWords(){return lang==='es'?{title:'Grupos étnicos presentes',subtitle:'Número de categorías de identidad con población mayor que cero',unit:'Grupos',range:'Rango distrital',included:'Categorías consideradas',top:'más grupos',basis:'Incluye las 3 categorías residuales.<br>Excluye «No sabe / No responde».',definition:'Se cuenta cada una de las 63 categorías de identidad con al menos una persona. Incluye las tres categorías residuales y excluye la no respuesta. Mide presencia, no el tamaño ni el equilibrio de los grupos.',tie:'Empates: código fuente ascendente.',compare:'Ver diversidad (1 − HHI) →'}:{title:'Ethnic groups present',subtitle:'Number of identity categories with a population greater than zero',unit:'Groups',range:'District range',included:'Categories considered',top:'most groups',basis:'Includes the 3 residual categories.<br>Excludes “Does not know / Does not answer”.',definition:'Counts each of the 63 identity categories with at least one person. Includes the three residual categories and excludes nonresponse. Measures presence, not group size or balance.',tie:'Ties: ascending source code.',compare:'View diversity (1 − HHI) →'}}
function presenceSlide(s){const t=ui[lang],w=presenceWords();return `<div class="map-head"><p class="eyebrow">${t.identity} · Perú 2025</p><h1>${w.title}</h1><div class="map-sub"><span>${w.subtitle}</span><div class="metric-links"><a href="#diversity-map" data-go="diversity-map">${w.compare}</a></div></div></div>
<div class="map-grid presence-map"><aside class="inset-panel"><h2>${t.inset}</h2><p class="scope">${t.scope}</p><div id="inset-map" class="inset-map"></div><div class="summary"><div><span>${w.range}</span><strong>${s.observed_min}–${s.observed_max}</strong></div><div class="secondary"><span>${w.included}</span><strong>${s.included_categories}</strong></div></div><div class="legend-head"><h2>${t.legend}</h2><span>${w.unit}</span></div>${legend(s)}<p class="legend-note">${w.basis}</p></aside>
<section class="national-panel"><h2>${t.national}</h2><div id="national-map" class="national-map" tabindex="0" role="button" aria-label="${t.zoom}"></div><p class="national-caption">${t.caption}</p></section>
<section class="ranking-panel"><h2>Top ${s.table.length} · ${w.top}</h2>${topTable(s)}<p class="rank-note">${w.tie}</p></section></div>`}

function maximaWords(){return lang==='es'?{absolute:'Dónde se concentra el mayor número de personas',relative:'Dónde alcanza su mayor porcentaje cada grupo',scope:'60 grupos identificados · todos los empates exactos',groups:'Grupos',districts:'Distritos',matches:'Registros',ties:'Grupos empatados',all:'Ver todos',table:'Grupo → distrito → máximo',hint:'Selecciona un distrito o una fila para consultar sus grupos.',scroll:'Pulsa Personas o Porcentaje para ordenar. Desplaza para ver todos.',group:'Grupo étnico',district:'Distrito',one:'Máximo de un grupo',many:'Máximo de varios grupos',none:'Sin máximo nacional',csv:'Descargar Excel y diccionario',unitAbs:'Personas',unitRel:'Porcentaje',selected:'Distrito seleccionado',filtered:'registros visibles',excluded:'Se excluyen las tres categorías residuales y la no respuesta.'}:{absolute:'Where each group has its largest population',relative:'Where each group reaches its highest percentage',scope:'60 named groups · all exact ties included',groups:'Groups',districts:'Districts',matches:'Records',ties:'Groups with ties',all:'Show all',table:'Group → district → maximum',hint:'Select a district or a table row to inspect its groups.',scroll:'Click Persons or Percentage to sort. Scroll to see all groups.',group:'Ethnic group',district:'District',one:'Maximum for one group',many:'Maximum for several groups',none:'No national maximum',csv:'Download Excel and dictionary',unitAbs:'Persons',unitRel:'Percentage',selected:'Selected district',filtered:'visible records',excluded:'The three residual categories and nonresponse are excluded.'}}
function maximaSlide(s){const w=maximaWords(),t=ui[lang];return `<div class="map-head"><p class="eyebrow">${t.identity} · ${w.scope}</p><h1>${w[s.mode]}</h1><div class="map-sub"><span>${w.hint}</span><div class="metric-links">${['absolute','relative'].map(m=>`<a href="#maxima-${m}" data-go="maxima-${m}" class="${s.mode===m?'selected':''}">${t[m]}</a>`).join('')}</div></div></div><div class="map-grid maxima-grid"><aside class="inset-panel"><h2>${t.inset}</h2><p class="scope">${t.scope}</p><div id="inset-map" class="inset-map"></div><div class="max-summary"><div><strong>60</strong><span>${w.groups}</span></div><div><strong>${s.unique_districts}</strong><span>${w.districts}</span></div><div><strong>${s.assignments}</strong><span>${w.matches}</span></div></div><h2 class="max-legend-heading">${t.legend}</h2><div class="max-legend">${s.classes[lang].map((c,i)=>`<div><span class="swatch" style="background-color:${c.color}"></span><span>${[w.none,w.one,w.many][i]}<small>${num(c.districts)} ${t.districts}</small></span></div>`).join('')}</div><p class="legend-note">${lang==='es'?'En Lima–Callao:':'Within Lima–Callao:'} ${s.inset_winners} ${t.districts}.<br>${w.ties}: ${s.tied_groups}.<br>${w.excluded}</p><div class="max-actions"><button id="max-inset-zoom">${lang==='es'?'Ampliar Lima':'Enlarge Lima'}</button><a class="max-download" href="downloads/atlas_etnico_datos.xlsx" download>Excel</a></div></aside><section class="national-panel"><h2>${t.national}</h2><div id="national-map" class="national-map"></div><p class="national-caption">${lang==='es'?'Pasa el cursor para consultar; selecciona una fila para resaltar.':'Hover to inspect; select a table row to highlight.'}</p></section><section class="maxima-panel"><div class="max-panel-head"><h2>${w.table}</h2><button id="clear-winner">${w.all}</button></div><p id="winner-status" class="winner-status"></p><div id="maxima-scroll" class="maxima-scroll" tabindex="0" aria-label="${w.table}"></div><p class="max-scroll-note">${w.scroll}</p></section></div>`}

/* Sortable tables and linked district selection; maps have no numeric labels. */
const maximaSortState=new Map();
function maximaSort(s){if(!maximaSortState.has(s.id))maximaSortState.set(s.id,{key:'count',direction:-1});return maximaSortState.get(s.id)}
function maximaRows(s){
 const order=maximaSort(s);
 return [...s.table].sort((a,b)=>{
  const difference=order.key==='count'?BigInt(a.count)-BigInt(b.count):BigInt(a.count)*BigInt(b.candidate_denominator)-BigInt(b.count)*BigInt(a.candidate_denominator);
  return (difference<0n?-1:difference>0n?1:0)*order.direction||a.category_id.localeCompare(b.category_id)||a.district_code.localeCompare(b.district_code);
 }).map((r,i)=>({...r,row_number:i+1}));
}
function maximaTable(s,rows=maximaRows(s)){
 const w=maximaWords(),sort=maximaSort(s);
 const header=(key,label)=>`<th aria-sort="${sort.key===key?(sort.direction<0?'descending':'ascending'):'none'}"><button data-sort="${key}" title="${lang==='es'?'Ordenar por':'Sort by'} ${label}">${label} <span aria-hidden="true">${sort.key===key?(sort.direction<0?'↓':'↑'):'↕'}</span></button></th>`;
 return `<table class="maxima-table"><thead><tr><th>#</th><th>${w.group}</th><th>${w.district}</th>${header('count',w.unitAbs)}${header('percentage',w.unitRel)}</tr></thead><tbody>${rows.map(r=>`<tr data-winner="${r.geometry_code}" data-category="${r.category_id}" data-number="${r.row_number}" tabindex="0"><td>${r.row_number}</td><td>${esc(r['label_'+lang])}${r.tied_districts>1?`<small>${lang==='es'?'Empate:':'Tie:'} ${r.tied_districts}</small>`:''}</td><td>${esc(r.district_name)}<small>${esc(region(r))}</small></td><td>${num(r.count)}</td><td>${esc(dec(r.percentage))} %</td></tr>`).join('')}</tbody></table>`;
}
function selectWinner(code){
 const s=data.slides[current];if(s.kind!=='maxima')return;selectedWinner=code;
 const all=maximaRows(s),rows=code?all.filter(r=>r.geometry_code===code):all,w=maximaWords();
 $('maxima-scroll').innerHTML=maximaTable(s,rows);$('maxima-scroll').scrollTop=0;
 $('winner-status').textContent=code?`${w.selected}: ${rows[0].district_name} · ${rows.length} ${w.filtered}`:`${s.named_groups} ${w.groups.toLowerCase()} · ${s.assignments} ${w.matches.toLowerCase()} · ${s.unique_districts} ${w.districts.toLowerCase()}`;
 $('clear-winner').disabled=!code;
 for(const svg of Object.values(maps))svg.classList.toggle('winner-selected',!!code);
 for(const svg of Object.values(maps))for(const e of svg.querySelectorAll('.district'))e.classList.toggle('chosen',!!code&&(e.dataset.code===code||e.dataset.winner===code));
}
function sortMaxima(key){
 const focusRoot=$('detail').open?'detail-body':'maxima-scroll';
 const s=data.slides[current],sort=maximaSort(s);sort.direction=sort.key===key?-sort.direction:-1;sort.key=key;
 selectWinner(selectedWinner);
 if($('detail').open)$('detail-body').innerHTML=maximaDetails(s);
 $(focusRoot).querySelector(`[data-sort="${key}"]`)?.focus({preventScroll:true});
}
function bindMaxima(){
 const s=data.slides[current];$('max-inset-zoom').onclick=()=>enlarge('inset');$('clear-winner').onclick=()=>selectWinner(null);
 const act=e=>{
  const sort=e.target.closest('[data-sort]');if(sort){e.preventDefault();e.stopPropagation();sortMaxima(sort.dataset.sort);return}
  const el=e.target.closest('[data-winner],.district.winner');if(el){e.preventDefault();e.stopPropagation();selectWinner(el.dataset.winner||el.dataset.code)}
 };
 for(const id of ['national-map','inset-map','maxima-scroll']){$(id).onclick=act;$(id).onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button'))act(e)}}
 $('detail-body').onclick=e=>{const button=e.target.closest('[data-sort]');if(button&&data.slides[current].kind==='maxima')sortMaxima(button.dataset.sort)};
 selectWinner(selectedWinner&&s.table.some(r=>r.geometry_code===selectedWinner)?selectedWinner:null);
}
function maximaDetails(s){return `<p>${maximaWords().scope}. ${maximaWords().excluded}</p>${maximaTable(s)}<p><a href="downloads/atlas_etnico_datos.xlsx" download>${maximaWords().csv}</a></p>`}

/* Local exploration: existing SVG geometry, one compact observation table. */
const observations=window.ATLAS_DISTRICTS;
const observationIndex=new Map(observations.codes.map((code,i)=>[code,i]));
const exploreState={svg:null,scope:'national',slide:null,home:null,view:null,rendered:null,selected:null,frame:0,settle:0,captureTimer:0,captureVersion:0,rasterReady:false,preview:false,drag:null,moved:false};
const hoverTip=document.createElement('div');hoverTip.id='district-tooltip';hoverTip.setAttribute('role','tooltip');hoverTip.hidden=true;document.body.append(hoverTip);
let hoverFrame=0,hoverCode=null,hoverSlide=null,hoverEvent=null,hoverHideTimer=0;
hoverTip.onpointerenter=()=>clearTimeout(hoverHideTimer);
hoverTip.onpointerleave=()=>hideDistrictTip();
function scheduleDistrictTipHide(){clearTimeout(hoverHideTimer);hoverHideTimer=setTimeout(hideDistrictTip,180)}
function presenceGroupList(i){
 const rows=data.categories.filter(c=>c.id!=='ETH_64').map(c=>({category:c,count:observations.counts[c.id][i]})).filter(r=>r.count>0).sort((a,b)=>b.count-a.count||a.category.id.localeCompare(b.category.id));
 return `<p class="presence-list-title">${lang==='es'?'De mayor a menor · personas':'Highest to lowest · persons'}</p><ol class="presence-group-list" aria-label="${lang==='es'?'Grupos presentes por población':'Present groups by population'}">${rows.map(r=>`<li data-category="${r.category.id}" data-count="${r.count}"><span>${esc(r.category[lang])}</span><b>${num(r.count)}</b></li>`).join('')}</ol>`;
}
function explorationWords(){return lang==='es'?{title:'Explorar mapa',reset:'Restablecer',in:'Acercar',out:'Alejar',focus:'Centrar distrito',hint:'Rueda: zoom · arrastrar: desplazar · clic: seleccionar',empty:'Pasa el cursor sobre un distrito para ver sus datos. Haz clic para mantener su ficha.',selected:'Distrito seleccionado',none:'Sin máximo nacional',group:'Grupo',count:'Personas',share:'Porcentaje distrital',index:'Diversidad · 1 − HHI',pending:'Porcentaje exploratorio',more:'Más grupos en la ficha',keyboard:'También puedes usar +, − y las flechas; Inicio restablece la vista.'}:{title:'Explore map',reset:'Reset',in:'Zoom in',out:'Zoom out',focus:'Center district',hint:'Wheel: zoom · drag: pan · click: select',empty:'Hover over a district to see its data. Click to keep its details.',selected:'Selected district',none:'No national maximum',group:'Group',count:'Persons',share:'District percentage',index:'Diversity · 1 − HHI',pending:'Exploratory percentage',more:'More groups in the details panel',keyboard:'You can also use +, − and arrow keys; Home resets the view.'}}
function effectiveMapSlide(s=data.slides[current]){return s.kind==='cover'?data.slides.find(s=>s.id==='ETH_01-relative'):s}
function districtCard(code,s=effectiveMapSlide(),compact=false){
 const i=observationIndex.get(code),w=explorationWords();if(i===undefined)return '';
 const [name,province,department]=observations.names[i],nameHtml=`<strong>${esc(name)}</strong><small>${esc(region({province_name:province,department_name:department}))}</small>`;
 let body='';
 if(s.kind==='maxima'){
  const records=maximaRows(s).filter(r=>r.geometry_code===code),shown=compact?records.slice(0,3):records;
  body=records.length?shown.map(r=>`<div class="district-value"><b>${r.row_number}. ${esc(r['label_'+lang])}</b><span>${num(r.count)} ${w.count.toLowerCase()} · ${esc(dec(r.percentage))} %</span></div>`).join(''):`<p>${w.none}</p>`;
  if(shown.length<records.length)body+=`<small>+${records.length-shown.length} · ${w.more}</small>`;
 }else if(s.kind==='presence'){
  const v=observations.positive_identity_categories[i];body=`<div class="district-value"><span>${presenceWords().title}</span><b>${v===null?ui[lang].missing:num(v)}</b></div>${v===null?'':presenceGroupList(i)}<small>${presenceWords().basis}</small>`;
 }else if(s.kind==='diversity'){
  const v=observations.diversity[i];body=`<div class="district-value"><span>${w.index}</span><b>${v===null?ui[lang].missing:dec(v)}</b></div>`;
 }else{
  const n=observations.counts[s.category_id]?.[i],den=observations.denominators[i],share=n===null||n===undefined||!den?null:100*n/den;
  const count=`<div class="district-value"><span>${w.count}</span><b>${n===null||n===undefined?ui[lang].missing:num(n)}</b></div>`,percent=`<div class="district-value"><span>${w.share}</span><b>${share===null?ui[lang].missing:esc(dec(share))+' %'}</b></div>`;
  body=s.mode==='relative'?percent+count:count+percent;
  body+=`<small>${w.pending}</small>`;
 }
 return nameHtml+body;
}
function hideDistrictTip(){clearTimeout(hoverHideTimer);if(hoverFrame)cancelAnimationFrame(hoverFrame);hoverFrame=0;hoverCode=null;hoverSlide=null;hoverTip.hidden=true}
function positionDistrictTip(e){
 const bounds=hoverTip.getBoundingClientRect(),gap=14;
 const x=e.clientX+bounds.width+gap<innerWidth?e.clientX+gap:e.clientX-bounds.width-gap;
 const y=e.clientY+bounds.height+gap<innerHeight?e.clientY+gap:e.clientY-bounds.height-gap;
 hoverTip.style.left=Math.max(8,x)+'px';hoverTip.style.top=Math.max(8,y)+'px';
}
function bindDistrictHover(svg,s){
 svg.onpointermove=e=>{
  clearTimeout(hoverHideTimer);
  if(exploreState.drag?.active){hideDistrictTip();return}
  const target=e.target.closest('.district,.max-marker'),code=target?.dataset.code||target?.dataset.winner;
  if(!code){if(hoverSlide?.kind==='presence')scheduleDistrictTipHide();else hideDistrictTip();return}
  hoverEvent=e;
  const changed=hoverCode!==code||hoverSlide!==s;
  if(changed){hoverCode=code;hoverSlide=s;hoverTip.classList.toggle('presence-hover',s.kind==='presence');hoverTip.innerHTML=districtCard(code,s,true);hoverTip.dataset.code=code;hoverTip.hidden=false}
  if((changed||s.kind!=='presence')&&!hoverFrame)hoverFrame=requestAnimationFrame(()=>{hoverFrame=0;if(!hoverTip.hidden)positionDistrictTip(hoverEvent)});
 };
 svg.onpointerleave=()=>{if(hoverSlide?.kind==='presence')scheduleDistrictTipHide();else hideDistrictTip()};
}
function explorerMarkup(){
 const w=explorationWords();
 $('figure-dialog').innerHTML=`<div class="dialoghead"><span id="figure-title"></span><button id="closeFigure">${ui[lang].close}</button></div><div class="explorer-toolbar"><div class="explorer-buttons"><button id="explore-minus" aria-label="${w.out}" title="${w.out}">−</button><button id="explore-plus" aria-label="${w.in}" title="${w.in}">+</button><button id="native">${w.reset}</button><button id="explore-focus" disabled>${w.focus}</button><output id="explore-scale"></output></div><span id="explore-help">${w.hint}</span><a id="original" target="_blank" rel="noopener">${ui[lang].original}</a></div><div class="explorer-body"><div id="figure-scroll" tabindex="0" role="region" aria-label="${w.title}. ${w.keyboard}"><div id="vector-viewer"></div></div><aside id="explorer-info" aria-live="polite"><h3>${w.selected}</h3><div id="explorer-district">${w.empty}</div></aside></div>`;
 $('closeFigure').onclick=()=>$('figure-dialog').close();
 $('native').onclick=resetExplorer;
 $('explore-plus').onclick=()=>zoomExplorer(1.6);
 $('explore-minus').onclick=()=>zoomExplorer(1/1.6);
 $('explore-focus').onclick=()=>focusExplorerDistrict(exploreState.selected);
 $('figure-dialog').onclose=()=>{hideDistrictTip();document.body.append(hoverTip);if(exploreState.frame)cancelAnimationFrame(exploreState.frame);clearTimeout(exploreState.settle);clearTimeout(exploreState.captureTimer);exploreState.captureVersion++;exploreState.frame=0;exploreState.drag=null;exploreState.svg=null;$('vector-viewer').replaceChildren()};
}
function fitExploreBox(box){
 const r=$('vector-viewer').getBoundingClientRect(),aspect=Math.max(.1,r.width/r.height),w=Math.max(box.w,box.h*aspect),h=w/aspect;
 return {x:box.x+(box.w-w)/2,y:box.y+(box.h-h)/2,w,h};
}
function clampExploreView(){
 const v=exploreState.view,h=exploreState.home;
 const factor=Math.max(1/4096,Math.min(1,v.w/h.w)),cx=v.x+v.w/2,cy=v.y+v.h/2;
 v.w=h.w*factor;v.h=h.h*factor;
 v.x=Math.max(h.x-v.w*.15,Math.min(h.x+h.w-v.w*.85,cx-v.w/2));
 v.y=Math.max(h.y-v.h*.15,Math.min(h.y+h.h-v.h*.85,cy-v.h/2));
}
function captureExploreRaster(){
 clearTimeout(exploreState.captureTimer);exploreState.rasterReady=false;
 if($('explore-raster'))$('explore-raster').dataset.ready='false';
 const version=++exploreState.captureVersion;
 exploreState.captureTimer=setTimeout(()=>{
  const svg=exploreState.svg;if(!svg||version!==exploreState.captureVersion)return;
  const clone=svg.cloneNode(true),ns='http://www.w3.org/2000/svg',style=document.createElementNS(ns,'style');
  // Snapshot only for gesture feedback. The live geometry and values remain exact.
  style.textContent='.country-outline{fill:none;stroke:#000;stroke-width:.75;vector-effect:non-scaling-stroke;pointer-events:none;stroke-linejoin:round;shape-rendering:geometricPrecision}.district{stroke:transparent;stroke-width:0;fill-rule:evenodd;shape-rendering:crispEdges}.district-selected .district:not(.explorer-selected){opacity:.28}.max-marker rect,.max-marker circle{fill:#fff;stroke:#632753;stroke-width:1}.max-marker text{fill:#4b1d70;text-anchor:middle;dominant-baseline:central;font-family:Arial;font-weight:bold}.max-marker.chosen rect{fill:#4b1d70}.max-marker.chosen text{fill:white}.marker-line{stroke:#6d5362;stroke-width:.7}.marker-anchor{fill:#632753}';
  clone.prepend(style);clone.style.visibility='';clone.classList.remove('map-svg');
  const viewport=$('vector-viewer'),dpr=Math.min(2,devicePixelRatio||1),w=Math.ceil(viewport.clientWidth*dpr),h=Math.ceil(viewport.clientHeight*dpr);
  clone.setAttribute('xmlns',ns);clone.setAttribute('width',w);clone.setAttribute('height',h);
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'})),img=new Image();
  img.onload=()=>{
   URL.revokeObjectURL(url);
   if(version!==exploreState.captureVersion||!exploreState.svg)return;
   const canvas=$('explore-raster');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);exploreState.rasterReady=true;canvas.dataset.ready='true';
  };
  img.onerror=()=>URL.revokeObjectURL(url);img.src=url;
 },50);
}
function drawExploreView(){
 exploreState.frame=0;if(!exploreState.svg)return;
 const v=exploreState.view,viewer=$('vector-viewer'),viewport=$('figure-scroll');
 viewport.dataset.viewBox=`${v.x} ${v.y} ${v.w} ${v.h}`;
 clearTimeout(exploreState.settle);
 if(exploreState.preview&&exploreState.rendered){
  // Reuse the browser's composited map during gestures; redraw exact vectors on idle.
  const base=exploreState.rendered,scale=base.w/v.w;
  const tx=(base.x-v.x)*viewport.clientWidth/v.w,ty=(base.y-v.y)*viewport.clientHeight/v.h;
  if(exploreState.rasterReady){$('explore-raster').hidden=false;exploreState.svg.style.visibility='hidden'}
  viewer.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;
  exploreState.settle=setTimeout(()=>{exploreState.preview=false;queueExploreView()},170);
 }else{
  viewer.style.transform='';$('explore-raster').hidden=true;exploreState.svg.style.visibility='';exploreState.svg.setAttribute('viewBox',viewport.dataset.viewBox);exploreState.rendered={...v};exploreState.preview=false;captureExploreRaster();
 }
 const zoom=exploreState.home.w/v.w;$('explore-scale').textContent=zoom.toFixed(2)+'×';
 $('explore-minus').disabled=zoom<=1.00001;$('explore-plus').disabled=zoom>=4095.99;
}
function queueExploreView(preview=false){clampExploreView();exploreState.preview=preview;if(!exploreState.frame)exploreState.frame=requestAnimationFrame(drawExploreView)}
function zoomExplorer(factor,point=null,preview=false){
 if(!exploreState.svg)return;hideDistrictTip();const v=exploreState.view;
 point=point||{x:v.x+v.w/2,y:v.y+v.h/2};
 const ratio=Math.max(exploreState.home.w/4096,Math.min(exploreState.home.w,v.w/factor))/v.w;
 exploreState.view={x:point.x+(v.x-point.x)*ratio,y:point.y+(v.y-point.y)*ratio,w:v.w*ratio,h:v.h*ratio};queueExploreView(preview);
}
function exploreWorldPoint(e){const p=exploreState.svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(exploreState.svg.getScreenCTM().inverse())}
function selectExploreDistrict(code){
 exploreState.selected=code;$('explore-focus').disabled=!code;
 $('explorer-district').innerHTML=code?districtCard(code,exploreState.slide):explorationWords().empty;
 $('explorer-district').dataset.code=code||'';
 exploreState.svg.classList.toggle('district-selected',!!code);
 for(const path of exploreState.svg.querySelectorAll('.district'))path.classList.toggle('explorer-selected',path.dataset.code===code);
 captureExploreRaster();
}
function focusExplorerDistrict(code){
 if(!code)return;const path=exploreState.svg.querySelector(`.district[data-code="${code}"]`);if(!path)return;
 selectExploreDistrict(code);const box=path.getBBox(),padding=.28;
 const w=Math.max(box.width,exploreState.home.w/4096),h=Math.max(box.height,exploreState.home.h/4096);
 exploreState.view=fitExploreBox({x:box.x-w*padding,y:box.y-h*padding,w:w*(1+2*padding),h:h*(1+2*padding)});queueExploreView();
}
function resetExplorer(){if(!exploreState.svg)return;hideDistrictTip();exploreState.view={...exploreState.home};selectExploreDistrict(null);queueExploreView()}
function openExplorer(scope='national',code=null){
 scope=typeof scope==='string'?scope:'national';hideDistrictTip();if($('detail').open)$('detail').close();
 const s=effectiveMapSlide();explorerMarkup();exploreState.scope=scope;exploreState.slide=s;exploreState.selected=null;exploreState.moved=false;exploreState.rendered=null;exploreState.preview=false;exploreState.rasterReady=false;
 $('figure-title').textContent=explorationWords().title+' · '+s.title[lang]+' / '+(scope==='inset'?ui[lang].inset:ui[lang].national);
 $('original').hidden=!s.images||data.slides[current].kind==='cover';if(s.images)$('original').href=s.images[lang];
 const svg=maps[scope].cloneNode(true);svg.classList.add('explorer-svg');svg.setAttribute('role','img');exploreState.svg=svg;
 const raster=document.createElement('canvas');raster.id='explore-raster';raster.hidden=true;raster.setAttribute('aria-hidden','true');
 $('vector-viewer').replaceChildren(svg,raster);$('figure-dialog').append(hoverTip);$('figure-dialog').showModal();
 const b=geo[scope].viewBox.split(' ').map(Number);exploreState.home=fitExploreBox({x:b[0],y:b[1],w:b[2],h:b[3]});exploreState.view={...exploreState.home};drawExploreView();
 bindDistrictHover(svg,s);
 const viewport=$('figure-scroll');
 viewport.onwheel=e=>{e.preventDefault();zoomExplorer(Math.exp(-Math.max(-240,Math.min(240,e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?500:1)))*.0025),exploreWorldPoint(e),true)};
 viewport.onpointerdown=e=>{
  if(e.button!==0)return;hideDistrictTip();const m=svg.getScreenCTM();
  exploreState.drag={id:e.pointerId,x:e.clientX,y:e.clientY,view:{...exploreState.view},scaleX:m.a,scaleY:m.d,active:false};exploreState.moved=false;
 };
 viewport.onpointermove=e=>{
  const d=exploreState.drag;if(!d||e.pointerId!==d.id)return;
  const dx=e.clientX-d.x,dy=e.clientY-d.y;
  if(!d.active&&Math.hypot(dx,dy)<4)return;
  if(!d.active){d.active=true;viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging')}
  exploreState.moved=true;hideDistrictTip();exploreState.view={...d.view,x:d.view.x-dx/d.scaleX,y:d.view.y-dy/d.scaleY};queueExploreView(true);
 };
 const finishDrag=e=>{if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);exploreState.drag=null;viewport.classList.remove('dragging')};
 viewport.onpointerup=finishDrag;viewport.onpointercancel=finishDrag;viewport.onlostpointercapture=()=>{exploreState.drag=null;viewport.classList.remove('dragging')};
 viewport.onclick=e=>{if(exploreState.moved){exploreState.moved=false;return}const target=e.target.closest('.district,.max-marker'),clicked=target?.dataset.code||target?.dataset.winner;if(clicked)selectExploreDistrict(clicked)};
 viewport.ondblclick=e=>{e.preventDefault();zoomExplorer(2,exploreWorldPoint(e))};
 viewport.onkeydown=e=>{
  const marker=e.target.closest('.max-marker');if(marker&&(e.key==='Enter'||e.key===' ')){e.preventDefault();selectExploreDistrict(marker.dataset.winner);return}
  if(e.key==='+'||e.key==='='){e.preventDefault();zoomExplorer(1.6)}
  else if(e.key==='-'){e.preventDefault();zoomExplorer(1/1.6)}
  else if(e.key==='Home'){e.preventDefault();resetExplorer()}
  else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const v=exploreState.view;v.x+=v.w*.15*(e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0);v.y+=v.h*.15*(e.key==='ArrowUp'?-1:e.key==='ArrowDown'?1:0);hideDistrictTip();queueExploreView()}
 };
 if(code)focusExplorerDistrict(code);viewport.focus({preventScroll:true});
}
document.addEventListener('click',e=>{
 const row=e.target.closest('.top-table tbody tr[data-code]');if(!row)return;
 e.preventDefault();openExplorer('national',row.dataset.code);
});
addEventListener('resize',()=>{
 if(!exploreState.svg||!$('figure-dialog').open)return;
 const zoom=exploreState.home.w/exploreState.view.w,cx=exploreState.view.x+exploreState.view.w/2,cy=exploreState.view.y+exploreState.view.h/2,b=geo[exploreState.scope].viewBox.split(' ').map(Number);
 exploreState.home=fitExploreBox({x:b[0],y:b[1],w:b[2],h:b[3]});const w=exploreState.home.w/zoom,h=exploreState.home.h/zoom;exploreState.view={x:cx-w/2,y:cy-h/2,w,h};queueExploreView();
});

function cover(){const t=ui[lang],s=data.slides.find(s=>s.id==='ETH_01-relative');return `<article class="cover"><p class="eyebrow">${t.identity} · Perú</p><h1>${t.cover}</h1><p class="cover-year">${t.census}</p><p class="cover-author">${t.author}</p><p class="cover-subtitle">${t.coversub}</p><div class="cover-actions"><a class="download-link" href="downloads/atlas_etnico_datos.xlsx" download>${t.download} ↓</a><a href="#maxima-absolute" data-go="maxima-absolute">${lang==='es'?'Explorar el atlas →':'Explore the atlas →'}</a></div><p class="cover-subtitle muted" style="font-size:22px">${t.covernote}</p><div id="cover-map" class="cover-map"></div></article>`}
function resize(){const scale=Math.min(innerWidth/1920,innerHeight/1080);$('stage').style.transform=`scale(${scale})`;$('stage').style.left=`${(innerWidth-1920*scale)/2}px`;$('stage').style.top=`${(innerHeight-1080*scale)/2}px`}
function render(){hideDistrictTip();if($('figure-dialog').open)$('figure-dialog').close();const s=data.slides[current],t=ui[lang];document.documentElement.lang=lang;document.title=`${current+1} / ${data.slides.length} · ${s.title[lang]} · Favio Leiva`;$('counter').textContent=`${current+1} / ${data.slides.length}`;$('language').textContent=lang==='es'?'EN':'ES';$('language').setAttribute('aria-label',lang==='es'?'Switch to English':'Cambiar a español');$('previous').disabled=current===0;$('next').disabled=current===data.slides.length-1;
 for(const [id,k] of Object.entries({contents:'contents',zoom:'zoom',details:'details',tocTitle:'contents',closeToc:'close',closeFigure:'close',closeDetail:'close',original:'original',native:'native'}))$(id).textContent=t[k];$('search').placeholder=t.search;$('search').setAttribute('aria-label',t.search);$('empty').textContent=t.empty;
 $('zoom').hidden=!['map','diversity','presence','cover','maxima'].includes(s.kind);$('details').hidden=!s.table;
 $('footnote').textContent=t.source+((s.mode==='relative'||s.kind==='diversity'||s.kind==='presence'||s.kind==='cover'||s.kind==='maxima')?' '+t.pending:'');
 $('slide-content').innerHTML=s.kind==='presence'?presenceSlide(s):s.kind==='maxima'?maximaSlide(s):['map','diversity'].includes(s.kind)?mapSlide(s):s.kind==='ranking'?rankingSlide(s):s.kind==='cover'?cover():`<article class="text-slide">${s.content[lang]}</article>`;
 if(['map','diversity','presence','maxima'].includes(s.kind)){mountMap('national-map','national',s);mountMap('inset-map','inset',s);$('national-map').onclick=e=>enlarge('national',e.target.closest('.district')?.dataset.code);$('inset-map').onclick=e=>enlarge('inset',e.target.closest('.district')?.dataset.code);$('inset-map').tabIndex=0;$('inset-map').setAttribute('role','button');$('inset-map').setAttribute('aria-label',t.zoom+' '+t.inset);$('inset-map').onkeydown=e=>{if(e.key==='Enter')enlarge('inset')};$('national-map').onkeydown=e=>{if(e.key==='Enter')enlarge()};if(s.kind==='maxima')bindMaxima()}else if(s.kind==='cover')mountMap('cover-map','national',data.slides.find(s=>s.id==='ETH_01-relative'));
 if($('toc').open)filter();resize();}
function go(i,hash=true){current=Math.max(0,Math.min(data.slides.length-1,i));selectedWinner=null;render();if(hash)history.replaceState(null,'','#'+data.slides[current].id)}
function goId(id){const i=data.slides.findIndex(s=>s.id===id);if(i>=0)go(i)}
function fromHash(){const i=data.slides.findIndex(s=>s.id===location.hash.slice(1));go(i<0?0:i,false)}
function filter(){const q=norm($('search').value),matches=data.slides.map((s,i)=>({s,i})).filter(({s})=>norm(s.title.es+' '+s.title.en+' '+s.id+' '+(s.source_label||'')).includes(q));$('toc-list').innerHTML=matches.map(({s,i})=>`<button data-go="${s.id}"><span class="tocnum">${i+1}</span><span>${esc(s.title[lang])}</span></button>`).join('');$('empty').hidden=matches.length>0}
function contents(){$('search').value='';filter();$('toc').showModal();$('search').focus()}
function enlarge(scope='national',code=null){openExplorer(scope,code)}
function details(){const s=data.slides[current],t=ui[lang];if(!s.table)return;$('detail-title').textContent=s.title[lang];$('detail-body').innerHTML=s.kind==='maxima'?maximaDetails(s):s.kind==='ranking'?`<table><thead><tr><th>#</th><th>${t.category}</th><th>${t.persons}</th><th>${t.positive}</th><th>${lang==='es'?'Mayor n\u00famero':'Highest count'}</th><th>${lang==='es'?'Mayor porcentaje':'Highest share'}</th></tr></thead><tbody>${s.table.map(r=>`<tr><td>${r.identity_rank}</td><td>${esc(r['label_'+lang])}</td><td>${num(r.count)}</td><td>${num(r.positive_districts)}</td>${leaderCell(r,'absolute')}${leaderCell(r,'relative')}</tr>`).join('')}</tbody></table>`:`<p class="muted">${s.kind==='presence'?presenceWords().definition+' '+presenceWords().tie:t.tie}</p>${topTable(s)}`;if(s.kind==='ranking')$('detail-body').insertAdjacentHTML('beforeend',`<p class="ranking-download"><a href="downloads/atlas_etnico_datos.xlsx" download>${lang==='es'?'Descargar Excel y diccionario':'Download Excel and dictionary'}</a></p>`);$('detail').showModal()}
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch(e){$('fullscreen').title=lang==='es'?'Usa pantalla completa del navegador.':'Use browser full screen.'}}
$('language').onclick=()=>{lang=lang==='es'?'en':'es';render()};$('previous').onclick=()=>go(current-1);$('next').onclick=()=>go(current+1);$('contents').onclick=contents;$('search').oninput=filter;$('zoom').onclick=enlarge;$('details').onclick=details;$('fullscreen').onclick=fullscreen;
document.addEventListener('click',e=>{const a=e.target.closest('[data-go]');if(a){e.preventDefault();if($('toc').open)$('toc').close();goId(a.dataset.go)}});
for(const [b,d] of [['closeToc','toc'],['closeFigure','figure-dialog'],['closeDetail','detail']])$(b).onclick=()=>$(d).close();$('native').onclick=resetExplorer;
document.addEventListener('keydown',e=>{if(e.target.closest?.('.maxima-scroll')||document.querySelector('dialog[open]')||e.ctrlKey||e.altKey||e.metaKey||/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName))return;const actions={ArrowRight:()=>go(current+1),ArrowDown:()=>go(current+1),PageDown:()=>go(current+1),' ':()=>go(current+1),ArrowLeft:()=>go(current-1),ArrowUp:()=>go(current-1),PageUp:()=>go(current-1),Home:()=>go(0),End:()=>go(data.slides.length-1),t:contents,T:contents,f:fullscreen,F:fullscreen};if(actions[e.key]){e.preventDefault();actions[e.key]()}});
addEventListener('resize',resize);addEventListener('hashchange',fromHash);fromHash();window.atlas={goTo:go,setLanguage:l=>{if(['es','en'].includes(l)){lang=l;render()}},get state(){return{index:current,id:data.slides[current].id,language:lang,slides:data.slides.length}},ready:async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame)}};
})();
