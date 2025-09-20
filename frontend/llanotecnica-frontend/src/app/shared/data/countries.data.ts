export interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  flags: {
    svg: string;
    png: string;
  };
  region?: string;
}

export const FALLBACK_COUNTRIES: Country[] = [
  {
    name: { common: "Afghanistan", official: "Islamic Republic of Afghanistan" },
    cca2: "AF",
    flags: { svg: "https://flagcdn.com/af.svg", png: "https://flagcdn.com/w320/af.png" },
    region: "Asia"
  },
  {
    name: { common: "Argentina", official: "Argentine Republic" },
    cca2: "AR",
    flags: { svg: "https://flagcdn.com/ar.svg", png: "https://flagcdn.com/w320/ar.png" },
    region: "South America"
  },
  {
    name: { common: "Australia", official: "Commonwealth of Australia" },
    cca2: "AU",
    flags: { svg: "https://flagcdn.com/au.svg", png: "https://flagcdn.com/w320/au.png" },
    region: "Oceania"
  },
  {
    name: { common: "Austria", official: "Republic of Austria" },
    cca2: "AT",
    flags: { svg: "https://flagcdn.com/at.svg", png: "https://flagcdn.com/w320/at.png" },
    region: "Europe"
  },
  {
    name: { common: "Belgium", official: "Kingdom of Belgium" },
    cca2: "BE",
    flags: { svg: "https://flagcdn.com/be.svg", png: "https://flagcdn.com/w320/be.png" },
    region: "Europe"
  },
  {
    name: { common: "Bolivia", official: "Plurinational State of Bolivia" },
    cca2: "BO",
    flags: { svg: "https://flagcdn.com/bo.svg", png: "https://flagcdn.com/w320/bo.png" },
    region: "South America"
  },
  {
    name: { common: "Brazil", official: "Federative Republic of Brazil" },
    cca2: "BR",
    flags: { svg: "https://flagcdn.com/br.svg", png: "https://flagcdn.com/w320/br.png" },
    region: "South America"
  },
  {
    name: { common: "Canada", official: "Canada" },
    cca2: "CA",
    flags: { svg: "https://flagcdn.com/ca.svg", png: "https://flagcdn.com/w320/ca.png" },
    region: "North America"
  },
  {
    name: { common: "Chile", official: "Republic of Chile" },
    cca2: "CL",
    flags: { svg: "https://flagcdn.com/cl.svg", png: "https://flagcdn.com/w320/cl.png" },
    region: "South America"
  },
  {
    name: { common: "China", official: "People's Republic of China" },
    cca2: "CN",
    flags: { svg: "https://flagcdn.com/cn.svg", png: "https://flagcdn.com/w320/cn.png" },
    region: "Asia"
  },
  {
    name: { common: "Colombia", official: "Republic of Colombia" },
    cca2: "CO",
    flags: { svg: "https://flagcdn.com/co.svg", png: "https://flagcdn.com/w320/co.png" },
    region: "South America"
  },
  {
    name: { common: "Costa Rica", official: "Republic of Costa Rica" },
    cca2: "CR",
    flags: { svg: "https://flagcdn.com/cr.svg", png: "https://flagcdn.com/w320/cr.png" },
    region: "North America"
  },
  {
    name: { common: "Cuba", official: "Republic of Cuba" },
    cca2: "CU",
    flags: { svg: "https://flagcdn.com/cu.svg", png: "https://flagcdn.com/w320/cu.png" },
    region: "North America"
  },
  {
    name: { common: "Denmark", official: "Kingdom of Denmark" },
    cca2: "DK",
    flags: { svg: "https://flagcdn.com/dk.svg", png: "https://flagcdn.com/w320/dk.png" },
    region: "Europe"
  },
  {
    name: { common: "Dominican Republic", official: "Dominican Republic" },
    cca2: "DO",
    flags: { svg: "https://flagcdn.com/do.svg", png: "https://flagcdn.com/w320/do.png" },
    region: "North America"
  },
  {
    name: { common: "Ecuador", official: "Republic of Ecuador" },
    cca2: "EC",
    flags: { svg: "https://flagcdn.com/ec.svg", png: "https://flagcdn.com/w320/ec.png" },
    region: "South America"
  },
  {
    name: { common: "El Salvador", official: "Republic of El Salvador" },
    cca2: "SV",
    flags: { svg: "https://flagcdn.com/sv.svg", png: "https://flagcdn.com/w320/sv.png" },
    region: "North America"
  },
  {
    name: { common: "France", official: "French Republic" },
    cca2: "FR",
    flags: { svg: "https://flagcdn.com/fr.svg", png: "https://flagcdn.com/w320/fr.png" },
    region: "Europe"
  },
  {
    name: { common: "Germany", official: "Federal Republic of Germany" },
    cca2: "DE",
    flags: { svg: "https://flagcdn.com/de.svg", png: "https://flagcdn.com/w320/de.png" },
    region: "Europe"
  },
  {
    name: { common: "Guatemala", official: "Republic of Guatemala" },
    cca2: "GT",
    flags: { svg: "https://flagcdn.com/gt.svg", png: "https://flagcdn.com/w320/gt.png" },
    region: "North America"
  },
  {
    name: { common: "Honduras", official: "Republic of Honduras" },
    cca2: "HN",
    flags: { svg: "https://flagcdn.com/hn.svg", png: "https://flagcdn.com/w320/hn.png" },
    region: "North America"
  },
  {
    name: { common: "India", official: "Republic of India" },
    cca2: "IN",
    flags: { svg: "https://flagcdn.com/in.svg", png: "https://flagcdn.com/w320/in.png" },
    region: "Asia"
  },
  {
    name: { common: "Italy", official: "Italian Republic" },
    cca2: "IT",
    flags: { svg: "https://flagcdn.com/it.svg", png: "https://flagcdn.com/w320/it.png" },
    region: "Europe"
  },
  {
    name: { common: "Jamaica", official: "Jamaica" },
    cca2: "JM",
    flags: { svg: "https://flagcdn.com/jm.svg", png: "https://flagcdn.com/w320/jm.png" },
    region: "North America"
  },
  {
    name: { common: "Japan", official: "Japan" },
    cca2: "JP",
    flags: { svg: "https://flagcdn.com/jp.svg", png: "https://flagcdn.com/w320/jp.png" },
    region: "Asia"
  },
  {
    name: { common: "Mexico", official: "United Mexican States" },
    cca2: "MX",
    flags: { svg: "https://flagcdn.com/mx.svg", png: "https://flagcdn.com/w320/mx.png" },
    region: "North America"
  },
  {
    name: { common: "Netherlands", official: "Kingdom of the Netherlands" },
    cca2: "NL",
    flags: { svg: "https://flagcdn.com/nl.svg", png: "https://flagcdn.com/w320/nl.png" },
    region: "Europe"
  },
  {
    name: { common: "Nicaragua", official: "Republic of Nicaragua" },
    cca2: "NI",
    flags: { svg: "https://flagcdn.com/ni.svg", png: "https://flagcdn.com/w320/ni.png" },
    region: "North America"
  },
  {
    name: { common: "Norway", official: "Kingdom of Norway" },
    cca2: "NO",
    flags: { svg: "https://flagcdn.com/no.svg", png: "https://flagcdn.com/w320/no.png" },
    region: "Europe"
  },
  {
    name: { common: "Panama", official: "Republic of Panama" },
    cca2: "PA",
    flags: { svg: "https://flagcdn.com/pa.svg", png: "https://flagcdn.com/w320/pa.png" },
    region: "North America"
  },
  {
    name: { common: "Paraguay", official: "Republic of Paraguay" },
    cca2: "PY",
    flags: { svg: "https://flagcdn.com/py.svg", png: "https://flagcdn.com/w320/py.png" },
    region: "South America"
  },
  {
    name: { common: "Peru", official: "Republic of Peru" },
    cca2: "PE",
    flags: { svg: "https://flagcdn.com/pe.svg", png: "https://flagcdn.com/w320/pe.png" },
    region: "South America"
  },
  {
    name: { common: "Poland", official: "Republic of Poland" },
    cca2: "PL",
    flags: { svg: "https://flagcdn.com/pl.svg", png: "https://flagcdn.com/w320/pl.png" },
    region: "Europe"
  },
  {
    name: { common: "Portugal", official: "Portuguese Republic" },
    cca2: "PT",
    flags: { svg: "https://flagcdn.com/pt.svg", png: "https://flagcdn.com/w320/pt.png" },
    region: "Europe"
  },
  {
    name: { common: "Russia", official: "Russian Federation" },
    cca2: "RU",
    flags: { svg: "https://flagcdn.com/ru.svg", png: "https://flagcdn.com/w320/ru.png" },
    region: "Europe"
  },
  {
    name: { common: "South Korea", official: "Republic of Korea" },
    cca2: "KR",
    flags: { svg: "https://flagcdn.com/kr.svg", png: "https://flagcdn.com/w320/kr.png" },
    region: "Asia"
  },
  {
    name: { common: "Spain", official: "Kingdom of Spain" },
    cca2: "ES",
    flags: { svg: "https://flagcdn.com/es.svg", png: "https://flagcdn.com/w320/es.png" },
    region: "Europe"
  },
  {
    name: { common: "Sweden", official: "Kingdom of Sweden" },
    cca2: "SE",
    flags: { svg: "https://flagcdn.com/se.svg", png: "https://flagcdn.com/w320/se.png" },
    region: "Europe"
  },
  {
    name: { common: "Switzerland", official: "Swiss Confederation" },
    cca2: "CH",
    flags: { svg: "https://flagcdn.com/ch.svg", png: "https://flagcdn.com/w320/ch.png" },
    region: "Europe"
  },
  {
    name: { common: "United Kingdom", official: "United Kingdom of Great Britain and Northern Ireland" },
    cca2: "GB",
    flags: { svg: "https://flagcdn.com/gb.svg", png: "https://flagcdn.com/w320/gb.png" },
    region: "Europe"
  },
  {
    name: { common: "United States", official: "United States of America" },
    cca2: "US",
    flags: { svg: "https://flagcdn.com/us.svg", png: "https://flagcdn.com/w320/us.png" },
    region: "North America"
  },
  {
    name: { common: "Uruguay", official: "Oriental Republic of Uruguay" },
    cca2: "UY",
    flags: { svg: "https://flagcdn.com/uy.svg", png: "https://flagcdn.com/w320/uy.png" },
    region: "South America"
  },
  {
    name: { common: "Venezuela", official: "Bolivarian Republic of Venezuela" },
    cca2: "VE",
    flags: { svg: "https://flagcdn.com/ve.svg", png: "https://flagcdn.com/w320/ve.png" },
    region: "South America"
  }
];
