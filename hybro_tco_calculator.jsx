import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// ─── i18n ─────────────────────────────────────────────────────────────────────

const LANGS = {
  en: { flag: "🇬🇧", label: "EN" },
  de: { flag: "🇩🇪", label: "DE" },
  fr: { flag: "🇫🇷", label: "FR" },
  pl: { flag: "🇵🇱", label: "PL" },
  it: { flag: "🇮🇹", label: "IT" },
  es: { flag: "🇪🇸", label: "ES" },
  ro: { flag: "🇷🇴", label: "RO" },
  uk: { flag: "🇺🇦", label: "UA" },
};

const T = {
  uk: {
    badge: "HYBRO · Калькулятор TCO",
    headline1: "Реальна вартість опалення",
    headline2: "на 20 років",
    subheadline: "Порівняйте повну вартість HYBRO, газового котла та теплового насоса — з урахуванням монтажу, енергоспоживання та інфляції.",
    smartLabel: "Нічний / Smart-тариф HYBRO (-30%)",
    smartSub: "Перенесення навантаження на нічний тариф завдяки тепловій масі",
    smartActive: "Активовано",
    sectionParams: "Параметри об'єкта",
    areaLabel: "Площа приміщення",
    areaUnit: "м²",
    areaMin: "50 м²", areaMax: "250 м²",
    cityLabel: "Місто",
    epcLabel: "Клас енергоефективності (EPC)",
    epcUnit: "кВт·год/м²",
    projectLabel: "Тип проекту",
    renovation: "Реновація",
    newbuild: "Нове будівництво",
    panelsTitle: "Панелей HYBRO (375 Вт)",
    panelsSub: (city, epc, area) => `необхідно для покриття пікового навантаження · ${city} · EPC ${epc} · ${area} м²`,
    sectionCapex: "Початкові інвестиції (CapEx)",
    gasLabel: "Газовий котел", gasName: "Газ", gasSub: "заміна + димар + промивка",
    hpLabel: "Тепловий насос", hpName: "Тепловий насос", hpSub: "монтаж + радіатори",
    hybroLabel: "Інфрачервоні панелі", hybroName: "HYBRO",
    hybroSub: (n) => `${n} панелей + монтаж`,
    sectionOpex: "Річна вартість опалення (OpEx, Рік 1)",
    gasSysName: "Газовий котел",
    gasSysSub: (kwh, elec) => `${kwh} кВт·год газу + 250 кВт·год ел. + ТО`,
    hpSysName: "Тепловий насос",
    hpSysSub: (cop, kwh) => `COP ${cop} → ${kwh} кВт·год + ТО`,
    hybroSysName: "HYBRO IR",
    hybroSysSub: (kwh, tariff, smart) => `${kwh} кВт·год${smart ? ` @ ${tariff} €/кВт·год` : ""} · ТО: 0 €`,
    perYear: "/рік",
    sectionTco: "Сукупна вартість за 20 років (TCO)",
    yearLabel: "рік",
    tooltipYear: (n) => `Рік ${n}`,
    chartGas: "Газ", chartHp: "Тепловий насос", chartHybro: "HYBRO",
    conclusionTitle: "Висновок аналізу",
    conclusionText: (save, years) => <>Обравши <span style={{color:"#7EB8F7",fontWeight:700}}>HYBRO</span> замість теплового насоса, ви економите <b>{save}</b> на старті — ці кошти покривають <b>{years} роки</b> ваших рахунків за електроенергію.</>,
    pills: (smart) => ["IR ефективність: -15%","Smart-зонування: -15%","ТО: 0 €", ...(smart?["Нічний тариф: -30%"]:[])],
    advBtn: "Розширені налаштування",
    sectionAdv: "Тарифи та змінні",
    elecTariffLabel: "Тариф електроенергії (€/кВт·год)",
    gasTariffLabel: "Тариф газу (€/кВт·год)",
    copLabel: "COP теплового насоса (JAZ)",
    inflLabel: "Інфляція на енергоносії (%/рік)",
    footer: "HYBRO TCO Calculator · Дані є розрахунковими · hybro.eu",
  },
  en: {
    badge: "HYBRO · TCO Calculator",
    headline1: "The real cost of heating",
    headline2: "over 20 years",
    subheadline: "Compare the total cost of HYBRO, a gas boiler and a heat pump — including installation, energy consumption and inflation.",
    smartLabel: "Night / Smart tariff HYBRO (-30%)",
    smartSub: "Load shifting to night tariff via thermal mass",
    smartActive: "Active",
    sectionParams: "Property parameters",
    areaLabel: "Floor area",
    areaUnit: "m²",
    areaMin: "50 m²", areaMax: "250 m²",
    cityLabel: "City",
    epcLabel: "Energy Performance Class (EPC)",
    epcUnit: "kWh/m²",
    projectLabel: "Project type",
    renovation: "Renovation",
    newbuild: "New build",
    panelsTitle: "HYBRO panels (375 W)",
    panelsSub: (city, epc, area) => `required to cover peak load · ${city} · EPC ${epc} · ${area} m²`,
    sectionCapex: "Upfront investment (CapEx)",
    gasLabel: "Gas boiler", gasName: "Gas", gasSub: "replacement + flue + flush",
    hpLabel: "Heat pump", hpName: "Heat pump", hpSub: "installation + radiators",
    hybroLabel: "Infrared panels", hybroName: "HYBRO",
    hybroSub: (n) => `${n} panels + installation`,
    sectionOpex: "Annual heating cost (OpEx, Year 1)",
    gasSysName: "Gas boiler",
    gasSysSub: (kwh) => `${kwh} kWh gas + 250 kWh elec. + maintenance`,
    hpSysName: "Heat pump",
    hpSysSub: (cop, kwh) => `COP ${cop} → ${kwh} kWh + maintenance`,
    hybroSysName: "HYBRO IR",
    hybroSysSub: (kwh, tariff, smart) => `${kwh} kWh${smart ? ` @ ${tariff} €/kWh` : ""} · maintenance: 0 €`,
    perYear: "/yr",
    sectionTco: "Cumulative cost over 20 years (TCO)",
    yearLabel: "year",
    tooltipYear: (n) => `Year ${n}`,
    chartGas: "Gas", chartHp: "Heat pump", chartHybro: "HYBRO",
    conclusionTitle: "Analysis conclusion",
    conclusionText: (save, years) => <>By choosing <span style={{color:"#7EB8F7",fontWeight:700}}>HYBRO</span> over a heat pump, you save <b>{save}</b> upfront — enough to cover <b>{years} years</b> of electricity bills.</>,
    pills: (smart) => ["IR efficiency: -15%","Smart zoning: -15%","Maintenance: 0 €", ...(smart?["Night tariff: -30%"]:[])],
    advBtn: "Advanced settings",
    sectionAdv: "Tariffs & variables",
    elecTariffLabel: "Electricity tariff (€/kWh)",
    gasTariffLabel: "Gas tariff (€/kWh)",
    copLabel: "Heat pump COP (JAZ)",
    inflLabel: "Energy inflation (%/yr)",
    footer: "HYBRO TCO Calculator · Figures are estimates · hybro.eu",
  },
  fr: {
    badge: "HYBRO · Calculateur TCO",
    headline1: "Le vrai coût du chauffage",
    headline2: "sur 20 ans",
    subheadline: "Comparez le coût total de HYBRO, d'une chaudière à gaz et d'une pompe à chaleur — installation, consommation et inflation incluses.",
    smartLabel: "Tarif nuit / Smart HYBRO (-30%)",
    smartSub: "Report de charge sur le tarif de nuit grâce à la masse thermique",
    smartActive: "Activé",
    sectionParams: "Paramètres du bien",
    areaLabel: "Surface habitable",
    areaUnit: "m²",
    areaMin: "50 m²", areaMax: "250 m²",
    cityLabel: "Ville",
    epcLabel: "Classe de performance énergétique (DPE)",
    epcUnit: "kWh/m²",
    projectLabel: "Type de projet",
    renovation: "Rénovation",
    newbuild: "Construction neuve",
    panelsTitle: "Panneaux HYBRO (375 W)",
    panelsSub: (city, epc, area) => `nécessaires pour la puissance de pointe · ${city} · DPE ${epc} · ${area} m²`,
    sectionCapex: "Investissement initial (CapEx)",
    gasLabel: "Chaudière gaz", gasName: "Gaz", gasSub: "remplacement + conduit + purge",
    hpLabel: "Pompe à chaleur", hpName: "PAC", hpSub: "installation + radiateurs",
    hybroLabel: "Panneaux infrarouges", hybroName: "HYBRO",
    hybroSub: (n) => `${n} panneaux + installation`,
    sectionOpex: "Coût annuel de chauffage (OpEx, An 1)",
    gasSysName: "Chaudière gaz",
    gasSysSub: (kwh) => `${kwh} kWh gaz + 250 kWh élec. + entretien`,
    hpSysName: "Pompe à chaleur",
    hpSysSub: (cop, kwh) => `COP ${cop} → ${kwh} kWh + entretien`,
    hybroSysName: "HYBRO IR",
    hybroSysSub: (kwh, tariff, smart) => `${kwh} kWh${smart ? ` @ ${tariff} €/kWh` : ""} · entretien : 0 €`,
    perYear: "/an",
    sectionTco: "Coût cumulé sur 20 ans (TCO)",
    yearLabel: "an",
    tooltipYear: (n) => `Année ${n}`,
    chartGas: "Gaz", chartHp: "PAC", chartHybro: "HYBRO",
    conclusionTitle: "Conclusion de l'analyse",
    conclusionText: (save, years) => <>En choisissant <span style={{color:"#7EB8F7",fontWeight:700}}>HYBRO</span> plutôt qu'une pompe à chaleur, vous économisez <b>{save}</b> dès le départ — de quoi couvrir <b>{years} ans</b> de factures d'électricité.</>,
    pills: (smart) => ["Efficacité IR : -15%","Zonage intelligent : -15%","Entretien : 0 €", ...(smart?["Tarif nuit : -30%"]:[])],
    advBtn: "Paramètres avancés",
    sectionAdv: "Tarifs et variables",
    elecTariffLabel: "Tarif électricité (€/kWh)",
    gasTariffLabel: "Tarif gaz (€/kWh)",
    copLabel: "COP pompe à chaleur (JAZ)",
    inflLabel: "Inflation énergie (%/an)",
    footer: "HYBRO TCO Calculator · Données estimatives · hybro.eu",
  },
  de: {
    badge: "HYBRO · TCO-Rechner",
    headline1: "Die wahren Heizkosten",
    headline2: "über 20 Jahre",
    subheadline: "Vergleichen Sie die Gesamtkosten von HYBRO, Gasheizung und Wärmepumpe — inklusive Installation, Energieverbrauch und Inflation.",
    smartLabel: "Nacht- / Smart-Tarif HYBRO (-30%)",
    smartSub: "Lastverlagerung auf den Nachttarif durch thermische Masse",
    smartActive: "Aktiv",
    sectionParams: "Objektparameter",
    areaLabel: "Wohnfläche",
    areaUnit: "m²",
    areaMin: "50 m²", areaMax: "250 m²",
    cityLabel: "Stadt",
    epcLabel: "Energieeffizienzklasse (EPC)",
    epcUnit: "kWh/m²",
    projectLabel: "Projektart",
    renovation: "Sanierung",
    newbuild: "Neubau",
    panelsTitle: "HYBRO-Paneele (375 W)",
    panelsSub: (city, epc, area) => `erforderlich für Spitzenlast · ${city} · EPC ${epc} · ${area} m²`,
    sectionCapex: "Anfangsinvestition (CapEx)",
    gasLabel: "Gasheizung", gasName: "Gas", gasSub: "Austausch + Schornstein + Spülung",
    hpLabel: "Wärmepumpe", hpName: "Wärmepumpe", hpSub: "Installation + Heizkörper",
    hybroLabel: "Infrarot-Paneele", hybroName: "HYBRO",
    hybroSub: (n) => `${n} Paneele + Montage`,
    sectionOpex: "Jährliche Heizkosten (OpEx, Jahr 1)",
    gasSysName: "Gasheizung",
    gasSysSub: (kwh) => `${kwh} kWh Gas + 250 kWh Strom + Wartung`,
    hpSysName: "Wärmepumpe",
    hpSysSub: (cop, kwh) => `COP ${cop} → ${kwh} kWh + Wartung`,
    hybroSysName: "HYBRO IR",
    hybroSysSub: (kwh, tariff, smart) => `${kwh} kWh${smart ? ` @ ${tariff} €/kWh` : ""} · Wartung: 0 €`,
    perYear: "/Jahr",
    sectionTco: "Kumulative Kosten über 20 Jahre (TCO)",
    yearLabel: "Jahr",
    tooltipYear: (n) => `Jahr ${n}`,
    chartGas: "Gas", chartHp: "Wärmepumpe", chartHybro: "HYBRO",
    conclusionTitle: "Analyseergebnis",
    conclusionText: (save, years) => <>Mit <span style={{color:"#7EB8F7",fontWeight:700}}>HYBRO</span> statt Wärmepumpe sparen Sie <b>{save}</b> beim Kauf — genug für <b>{years} Jahre</b> Stromkosten.</>,
    pills: (smart) => ["IR-Effizienz: -15%","Smart-Zoning: -15%","Wartung: 0 €", ...(smart?["Nachttarif: -30%"]:[])],
    advBtn: "Erweiterte Einstellungen",
    sectionAdv: "Tarife & Variablen",
    elecTariffLabel: "Stromtarif (€/kWh)",
    gasTariffLabel: "Gastartif (€/kWh)",
    copLabel: "Wärmepumpe COP (JAZ)",
    inflLabel: "Energieinflation (%/Jahr)",
    footer: "HYBRO TCO-Rechner · Angaben sind Schätzwerte · hybro.eu",
  },
  pl: {
    badge: "HYBRO · Kalkulator TCO",
    headline1: "Rzeczywisty koszt ogrzewania",
    headline2: "przez 20 lat",
    subheadline: "Porównaj całkowity koszt HYBRO, kotła gazowego i pompy ciepła — z uwzględnieniem montażu, zużycia energii i inflacji.",
    smartLabel: "Taryfa nocna / Smart HYBRO (-30%)",
    smartSub: "Przesunięcie obciążenia na taryfę nocną dzięki masie termicznej",
    smartActive: "Aktywna",
    sectionParams: "Parametry obiektu",
    areaLabel: "Powierzchnia",
    areaUnit: "m²",
    areaMin: "50 m²", areaMax: "250 m²",
    cityLabel: "Miasto",
    epcLabel: "Klasa energetyczna (EPC)",
    epcUnit: "kWh/m²",
    projectLabel: "Typ projektu",
    renovation: "Renowacja",
    newbuild: "Nowy budynek",
    panelsTitle: "Panele HYBRO (375 W)",
    panelsSub: (city, epc, area) => `potrzebnych do pokrycia szczytowego zapotrzebowania · ${city} · EPC ${epc} · ${area} m²`,
    sectionCapex: "Inwestycja początkowa (CapEx)",
    gasLabel: "Kocioł gazowy", gasName: "Gaz", gasSub: "wymiana + komin + płukanie",
    hpLabel: "Pompa ciepła", hpName: "Pompa ciepła", hpSub: "montaż + grzejniki",
    hybroLabel: "Panele podczerwone", hybroName: "HYBRO",
    hybroSub: (n) => `${n} paneli + montaż`,
    sectionOpex: "Roczny koszt ogrzewania (OpEx, Rok 1)",
    gasSysName: "Kocioł gazowy",
    gasSysSub: (kwh) => `${kwh} kWh gazu + 250 kWh prądu + serwis`,
    hpSysName: "Pompa ciepła",
    hpSysSub: (cop, kwh) => `COP ${cop} → ${kwh} kWh + serwis`,
    hybroSysName: "HYBRO IR",
    hybroSysSub: (kwh, tariff, smart) => `${kwh} kWh${smart ? ` @ ${tariff} €/kWh` : ""} · serwis: 0 €`,
    perYear: "/rok",
    sectionTco: "Łączny koszt przez 20 lat (TCO)",
    yearLabel: "rok",
    tooltipYear: (n) => `Rok ${n}`,
    chartGas: "Gaz", chartHp: "Pompa ciepła", chartHybro: "HYBRO",
    conclusionTitle: "Wniosek analizy",
    conclusionText: (save, years) => <>Wybierając <span style={{color:"#7EB8F7",fontWeight:700}}>HYBRO</span> zamiast pompy ciepła, oszczędzasz <b>{save}</b> na starcie — to pokrywa <b>{years} lata</b> rachunków za prąd.</>,
    pills: (smart) => ["Efektywność IR: -15%","Smart zoning: -15%","Serwis: 0 €", ...(smart?["Taryfa nocna: -30%"]:[])],
    advBtn: "Ustawienia zaawansowane",
    sectionAdv: "Taryfy i zmienne",
    elecTariffLabel: "Taryfa prądu (€/kWh)",
    gasTariffLabel: "Taryfa gazu (€/kWh)",
    copLabel: "COP pompy ciepła (JAZ)",
    inflLabel: "Inflacja energii (%/rok)",
    footer: "HYBRO TCO Calculator · Dane są szacunkowe · hybro.eu",
  },
  ro: {
    badge: "HYBRO · Calculator TCO",
    headline1: "Costul real al încălzirii",
    headline2: "pe 20 de ani",
    subheadline: "Comparați costul total al HYBRO, al cazanului pe gaz și al pompei de căldură — inclusiv instalare, consum și inflație.",
    smartLabel: "Tarif nocturn / Smart HYBRO (-30%)",
    smartSub: "Transferul sarcinii pe tariful nocturn prin masa termică",
    smartActive: "Activ",
    sectionParams: "Parametrii obiectului",
    areaLabel: "Suprafața",
    areaUnit: "m²",
    areaMin: "50 m²", areaMax: "250 m²",
    cityLabel: "Oraș",
    epcLabel: "Clasa energetică (EPC)",
    epcUnit: "kWh/m²",
    projectLabel: "Tip proiect",
    renovation: "Renovare",
    newbuild: "Construcție nouă",
    panelsTitle: "Panouri HYBRO (375 W)",
    panelsSub: (city, epc, area) => `necesare pentru sarcina de vârf · ${city} · EPC ${epc} · ${area} m²`,
    sectionCapex: "Investiție inițială (CapEx)",
    gasLabel: "Cazan pe gaz", gasName: "Gaz", gasSub: "înlocuire + coș + spălare",
    hpLabel: "Pompă de căldură", hpName: "Pompă de căldură", hpSub: "instalare + radiatoare",
    hybroLabel: "Panouri infraroșu", hybroName: "HYBRO",
    hybroSub: (n) => `${n} panouri + instalare`,
    sectionOpex: "Cost anual încălzire (OpEx, Anul 1)",
    gasSysName: "Cazan pe gaz",
    gasSysSub: (kwh) => `${kwh} kWh gaz + 250 kWh el. + întreținere`,
    hpSysName: "Pompă de căldură",
    hpSysSub: (cop, kwh) => `COP ${cop} → ${kwh} kWh + întreținere`,
    hybroSysName: "HYBRO IR",
    hybroSysSub: (kwh, tariff, smart) => `${kwh} kWh${smart ? ` @ ${tariff} €/kWh` : ""} · întreținere: 0 €`,
    perYear: "/an",
    sectionTco: "Cost cumulat pe 20 de ani (TCO)",
    yearLabel: "an",
    tooltipYear: (n) => `Anul ${n}`,
    chartGas: "Gaz", chartHp: "Pompă de căldură", chartHybro: "HYBRO",
    conclusionTitle: "Concluzia analizei",
    conclusionText: (save, years) => <>Alegând <span style={{color:"#7EB8F7",fontWeight:700}}>HYBRO</span> în loc de pompă de căldură, economisiți <b>{save}</b> la achiziție — suficient pentru <b>{years} ani</b> de facturi la electricitate.</>,
    pills: (smart) => ["Eficiență IR: -15%","Zonare smart: -15%","Întreținere: 0 €", ...(smart?["Tarif nocturn: -30%"]:[])],
    advBtn: "Setări avansate",
    sectionAdv: "Tarife și variabile",
    elecTariffLabel: "Tarif electricitate (€/kWh)",
    gasTariffLabel: "Tarif gaz (€/kWh)",
    copLabel: "COP pompă de căldură (JAZ)",
    inflLabel: "Inflație energie (%/an)",
    footer: "HYBRO TCO Calculator · Datele sunt estimative · hybro.eu",
  },
  it: {
    badge: "HYBRO · Calcolatore TCO",
    headline1: "Il vero costo del riscaldamento",
    headline2: "in 20 anni",
    subheadline: "Confronta il costo totale di HYBRO, caldaia a gas e pompa di calore — installazione, consumi e inflazione inclusi.",
    smartLabel: "Tariffa notturna / Smart HYBRO (-30%)",
    smartSub: "Spostamento del carico alla tariffa notturna grazie alla massa termica",
    smartActive: "Attivo",
    sectionParams: "Parametri dell'immobile",
    areaLabel: "Superficie",
    areaUnit: "m²",
    areaMin: "50 m²", areaMax: "250 m²",
    cityLabel: "Città",
    epcLabel: "Classe energetica (APE)",
    epcUnit: "kWh/m²",
    projectLabel: "Tipo di progetto",
    renovation: "Ristrutturazione",
    newbuild: "Nuova costruzione",
    panelsTitle: "Pannelli HYBRO (375 W)",
    panelsSub: (city, epc, area) => `necessari per il carico di punta · ${city} · APE ${epc} · ${area} m²`,
    sectionCapex: "Investimento iniziale (CapEx)",
    gasLabel: "Caldaia a gas", gasName: "Gas", gasSub: "sostituzione + canna fumaria + lavaggio",
    hpLabel: "Pompa di calore", hpName: "Pompa di calore", hpSub: "installazione + radiatori",
    hybroLabel: "Pannelli a infrarossi", hybroName: "HYBRO",
    hybroSub: (n) => `${n} pannelli + installazione`,
    sectionOpex: "Costo annuale riscaldamento (OpEx, Anno 1)",
    gasSysName: "Caldaia a gas",
    gasSysSub: (kwh) => `${kwh} kWh gas + 250 kWh el. + manutenzione`,
    hpSysName: "Pompa di calore",
    hpSysSub: (cop, kwh) => `COP ${cop} → ${kwh} kWh + manutenzione`,
    hybroSysName: "HYBRO IR",
    hybroSysSub: (kwh, tariff, smart) => `${kwh} kWh${smart ? ` @ ${tariff} €/kWh` : ""} · manutenzione: 0 €`,
    perYear: "/anno",
    sectionTco: "Costo cumulato in 20 anni (TCO)",
    yearLabel: "anno",
    tooltipYear: (n) => `Anno ${n}`,
    chartGas: "Gas", chartHp: "Pompa di calore", chartHybro: "HYBRO",
    conclusionTitle: "Conclusione dell'analisi",
    conclusionText: (save, years) => <>Scegliendo <span style={{color:"#7EB8F7",fontWeight:700}}>HYBRO</span> rispetto alla pompa di calore, risparmi <b>{save}</b> subito — abbastanza per coprire <b>{years} anni</b> di bollette elettriche.</>,
    pills: (smart) => ["Efficienza IR: -15%","Smart zoning: -15%","Manutenzione: 0 €", ...(smart?["Tariffa notturna: -30%"]:[])],
    advBtn: "Impostazioni avanzate",
    sectionAdv: "Tariffe e variabili",
    elecTariffLabel: "Tariffa elettricità (€/kWh)",
    gasTariffLabel: "Tariffa gas (€/kWh)",
    copLabel: "COP pompa di calore (JAZ)",
    inflLabel: "Inflazione energia (%/anno)",
    footer: "HYBRO TCO Calculator · Dati indicativi · hybro.eu",
  },
  es: {
    badge: "HYBRO · Calculadora TCO",
    headline1: "El coste real de la calefacción",
    headline2: "en 20 años",
    subheadline: "Compare el coste total de HYBRO, caldera de gas y bomba de calor — instalación, consumo e inflación incluidos.",
    smartLabel: "Tarifa nocturna / Smart HYBRO (-30%)",
    smartSub: "Traslado de carga a la tarifa nocturna gracias a la masa térmica",
    smartActive: "Activo",
    sectionParams: "Parámetros del inmueble",
    areaLabel: "Superficie",
    areaUnit: "m²",
    areaMin: "50 m²", areaMax: "250 m²",
    cityLabel: "Ciudad",
    epcLabel: "Clase energética (EPC)",
    epcUnit: "kWh/m²",
    projectLabel: "Tipo de proyecto",
    renovation: "Renovación",
    newbuild: "Obra nueva",
    panelsTitle: "Paneles HYBRO (375 W)",
    panelsSub: (city, epc, area) => `necesarios para la carga punta · ${city} · EPC ${epc} · ${area} m²`,
    sectionCapex: "Inversión inicial (CapEx)",
    gasLabel: "Caldera de gas", gasName: "Gas", gasSub: "sustitución + chimenea + limpieza",
    hpLabel: "Bomba de calor", hpName: "Bomba de calor", hpSub: "instalación + radiadores",
    hybroLabel: "Paneles infrarrojos", hybroName: "HYBRO",
    hybroSub: (n) => `${n} paneles + instalación`,
    sectionOpex: "Coste anual calefacción (OpEx, Año 1)",
    gasSysName: "Caldera de gas",
    gasSysSub: (kwh) => `${kwh} kWh gas + 250 kWh elec. + mantenimiento`,
    hpSysName: "Bomba de calor",
    hpSysSub: (cop, kwh) => `COP ${cop} → ${kwh} kWh + mantenimiento`,
    hybroSysName: "HYBRO IR",
    hybroSysSub: (kwh, tariff, smart) => `${kwh} kWh${smart ? ` @ ${tariff} €/kWh` : ""} · mantenimiento: 0 €`,
    perYear: "/año",
    sectionTco: "Coste acumulado en 20 años (TCO)",
    yearLabel: "año",
    tooltipYear: (n) => `Año ${n}`,
    chartGas: "Gas", chartHp: "Bomba de calor", chartHybro: "HYBRO",
    conclusionTitle: "Conclusión del análisis",
    conclusionText: (save, years) => <>Al elegir <span style={{color:"#7EB8F7",fontWeight:700}}>HYBRO</span> frente a una bomba de calor, ahorra <b>{save}</b> desde el primer día — suficiente para cubrir <b>{years} años</b> de facturas de electricidad.</>,
    pills: (smart) => ["Eficiencia IR: -15%","Smart zoning: -15%","Mantenimiento: 0 €", ...(smart?["Tarifa nocturna: -30%"]:[])],
    advBtn: "Configuración avanzada",
    sectionAdv: "Tarifas y variables",
    elecTariffLabel: "Tarifa electricidad (€/kWh)",
    gasTariffLabel: "Tarifa gas (€/kWh)",
    copLabel: "COP bomba de calor (JAZ)",
    inflLabel: "Inflación energía (%/año)",
    footer: "HYBRO TCO Calculator · Datos orientativos · hybro.eu",
  },
};

// ─── CITY LABELS PER LANGUAGE ─────────────────────────────────────────────────

const CITY_LABELS = {
  uk: { berlin:"Берлін", warsaw:"Варшава", paris:"Париж", london:"Лондон", madrid:"Мадрид", amsterdam:"Амстердам", milan:"Мілан", vienna:"Відень", helsinki:"Гельсінкі", bucharest:"Бухарест" },
  en: { berlin:"Berlin", warsaw:"Warsaw", paris:"Paris", london:"London", madrid:"Madrid", amsterdam:"Amsterdam", milan:"Milan", vienna:"Vienna", helsinki:"Helsinki", bucharest:"Bucharest" },
  fr: { berlin:"Berlin", warsaw:"Varsovie", paris:"Paris", london:"Londres", madrid:"Madrid", amsterdam:"Amsterdam", milan:"Milan", vienna:"Vienne", helsinki:"Helsinki", bucharest:"Bucarest" },
  de: { berlin:"Berlin", warsaw:"Warschau", paris:"Paris", london:"London", madrid:"Madrid", amsterdam:"Amsterdam", milan:"Mailand", vienna:"Wien", helsinki:"Helsinki", bucharest:"Bukarest" },
  pl: { berlin:"Berlin", warsaw:"Warszawa", paris:"Paryż", london:"Londyn", madrid:"Madryt", amsterdam:"Amsterdam", milan:"Mediolan", vienna:"Wiedeń", helsinki:"Helsinki", bucharest:"Bukareszt" },
  ro: { berlin:"Berlin", warsaw:"Varșovia", paris:"Paris", london:"Londra", madrid:"Madrid", amsterdam:"Amsterdam", milan:"Milano", vienna:"Viena", helsinki:"Helsinki", bucharest:"București" },
  it: { berlin:"Berlino", warsaw:"Varsavia", paris:"Parigi", london:"Londra", madrid:"Madrid", amsterdam:"Amsterdam", milan:"Milano", vienna:"Vienna", helsinki:"Helsinki", bucharest:"Bucarest" },
  es: { berlin:"Berlín", warsaw:"Varsovia", paris:"París", london:"Londres", madrid:"Madrid", amsterdam:"Ámsterdam", milan:"Milán", vienna:"Viena", helsinki:"Helsinki", bucharest:"Bucarest" },
};

// ─── DATA ─────────────────────────────────────────────────────────────────────

const CITIES = {
  berlin:    { deltaT: 34, climateMult: 1.00, zone: 2 },
  warsaw:    { deltaT: 40, climateMult: 1.23, zone: 4 },
  paris:     { deltaT: 25, climateMult: 0.77, zone: 2 },
  london:    { deltaT: 23, climateMult: 0.77, zone: 1 },
  madrid:    { deltaT: 22, climateMult: 0.58, zone: 3 },
  amsterdam: { deltaT: 30, climateMult: 1.00, zone: 1 },
  milan:     { deltaT: 25, climateMult: 0.92, zone: 3 },
  vienna:    { deltaT: 33, climateMult: 1.12, zone: 2 },
  helsinki:  { deltaT: 46, climateMult: 1.73, zone: 1 },
  bucharest: { deltaT: 35, climateMult: 1.12, zone: 4 },
};

const ZONE_MULT = { 1: 1.15, 2: 1.00, 3: 0.85, 4: 0.65 };

const EPC = {
  A: { baseConsumption: 50,  peakW: 35  },
  B: { baseConsumption: 90,  peakW: 50  },
  C: { baseConsumption: 130, peakW: 70  },
  D: { baseConsumption: 170, peakW: 90  },
  E: { baseConsumption: 210, peakW: 110 },
};

const BASE_CAPEX = {
  renovation: { gas: 5000,  hp: 18000, hybro_labor: 800  },
  newbuild:   { gas: 13000, hp: 18000, hybro_labor: 1000 },
};

// ─── CALC ─────────────────────────────────────────────────────────────────────

function calculate(inputs) {
  const { area, cityKey, epcKey, scenario, elecTariff, gasTariff, cop, inflationRate, useSmartTariff } = inputs;
  const city = CITIES[cityKey];
  const epc  = EPC[epcKey];
  const M    = ZONE_MULT[city.zone];
  const base = BASE_CAPEX[scenario];

  const panelsNeeded    = Math.ceil(((epc.peakW * (city.deltaT / 34)) * area / 1000) / 0.375);
  const finalHybroCapex = panelsNeeded * 200 + base.hybro_labor * M;
  const finalGasCapex   = base.gas * M;
  const finalHpCapex    = base.hp * M;

  const baseAnnualDemand = area * epc.baseConsumption * city.climateMult;
  const gasKwh     = baseAnnualDemand / 0.92;
  const costGasY1  = gasKwh * gasTariff + 250 * elecTariff + 150;
  const hpKwh      = baseAnnualDemand / cop;
  const costHpY1   = hpKwh * elecTariff + 150;
  const hybroKwh   = baseAnnualDemand * 0.7225;
  const effTariff  = useSmartTariff ? elecTariff * 0.70 : elecTariff;
  const costHybroY1 = hybroKwh * effTariff;

  const tcoData = Array.from({ length: 21 }, (_, n) => {
    let g = finalGasCapex, h = finalHpCapex, b = finalHybroCapex;
    for (let y = 1; y <= n; y++) {
      const f = Math.pow(1 + inflationRate / 100, y);
      g += costGasY1 * f + (y === 12 ? 2000 : 0);
      h += costHpY1  * f;
      b += costHybroY1 * f;
    }
    return { year: n, gas: Math.round(g), hp: Math.round(h), hybro: Math.round(b) };
  });

  const saveCapexVsHp      = finalHpCapex - finalHybroCapex;
  const annualMid          = costHybroY1 * Math.pow(1 + inflationRate / 100, 10);
  const yearsOfElecCovered = annualMid > 0 ? (saveCapexVsHp / annualMid).toFixed(1) : "—";

  return { panelsNeeded, finalHybroCapex, finalGasCapex, finalHpCapex,
           costGasY1, costHpY1, costHybroY1, hybroKwh, gasKwh, hpKwh,
           tcoData, saveCapexVsHp, yearsOfElecCovered };
}

// ─── COLORS ───────────────────────────────────────────────────────────────────

const NAVY   = "#0D2B4E";
const NAVYLT = "#E8EFF7";
const NAVYMD = "#1A4A78";
const GAS    = "#C4622D";
const HP     = "#1A6FAD";
const BORDER = "#E2E8F0";
const BG     = "#F7F8FA";
const TEXT   = "#1A202C";
const MUTED  = "#64748B";
const LIGHT  = "#94A3B8";
const WHITE  = "#FFFFFF";

const eur = n => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const kWh = n => Math.round(n).toLocaleString("de-DE");

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function HybroTCO() {
  const [lang,           setLang]           = useState("en");
  const [area,           setArea]           = useState(120);
  const [cityKey,        setCityKey]        = useState("berlin");
  const [epcKey,         setEpcKey]         = useState("C");
  const [scenario,       setScenario]       = useState("renovation");
  const [elecTariff,     setElecTariff]     = useState(0.35);
  const [gasTariff,      setGasTariff]      = useState(0.12);
  const [cop,            setCop]            = useState(3.5);
  const [inflationRate,  setInflationRate]  = useState(3);
  const [useSmartTariff, setUseSmartTariff] = useState(true);
  const [advOpen,        setAdvOpen]        = useState(false);

  const t   = T[lang];
  const cl  = CITY_LABELS[lang];

  const r = useMemo(() => calculate({
    area, cityKey, epcKey, scenario, elecTariff,
    gasTariff, cop, inflationRate, useSmartTariff,
  }), [area, cityKey, epcKey, scenario, elecTariff, gasTariff, cop, inflationRate, useSmartTariff]);

  const pct = ((area - 50) / 200) * 100;

  // Rename chart keys dynamically
  const chartData = r.tcoData.map(d => ({
    year: d.year,
    [t.chartGas]:   d.gas,
    [t.chartHp]:    d.hp,
    [t.chartHybro]: d.hybro,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10,
                    padding:"10px 14px", boxShadow:"0 4px 16px rgba(0,0,0,0.08)", fontSize:13 }}>
        <div style={{ color:MUTED, marginBottom:6, fontSize:10, fontWeight:700,
                      letterSpacing:"0.12em", textTransform:"uppercase" }}>{t.tooltipYear(label)}</div>
        {payload.map(p => (
          <div key={p.name} style={{ color:p.color, marginBottom:2 }}>
            {p.name}: <strong>{eur(p.value)}</strong>
          </div>
        ))}
      </div>
    );
  };

  const card   = { background:WHITE, border:`1px solid ${BORDER}`, borderRadius:12, padding:24, marginBottom:16 };
  const secTtl = { fontSize:10, fontWeight:700, letterSpacing:".13em", textTransform:"uppercase", color:NAVY,
                   display:"flex", alignItems:"center", gap:10, marginBottom:18 };
  const secLine = { flex:1, height:1, background:NAVYLT };
  const lbl    = { fontSize:10, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:MUTED, marginBottom:6 };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${BG};}
        .hr{font-family:'DM Sans',system-ui,sans-serif;background:${BG};min-height:100vh;color:${TEXT};}
        .wrap{max-width:860px;margin:0 auto;padding:24px 16px 60px;}
        select,input[type=number]{
          width:100%;padding:9px 12px;font-size:14px;font-family:inherit;
          background:${WHITE};border:1px solid ${BORDER};border-radius:8px;
          color:${TEXT};outline:none;cursor:pointer;transition:border-color .15s;
        }
        select:hover,select:focus,input[type=number]:focus{border-color:${NAVYMD};}
        input[type=range]{
          -webkit-appearance:none;width:100%;height:4px;border-radius:4px;outline:none;cursor:pointer;margin-top:8px;
          background:linear-gradient(to right,${NAVY} var(--pct,50%),${BORDER} var(--pct,50%));
        }
        input[type=range]::-webkit-slider-thumb{
          -webkit-appearance:none;width:20px;height:20px;border-radius:50%;
          background:${WHITE};border:2px solid ${NAVY};
          box-shadow:0 1px 4px rgba(13,43,78,.25);cursor:pointer;
        }
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
        @media(max-width:580px){.g2,.g3{grid-template-columns:1fr;}}
      `}</style>

      <div className="hr">

        {/* HEADER */}
        <div style={{ background:NAVY, padding:"40px 24px 32px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute",top:-60,right:-60,width:280,height:280,
                        background:"rgba(255,255,255,.03)",borderRadius:"50%",pointerEvents:"none" }} />
          <div style={{ maxWidth:860, margin:"0 auto", position:"relative" }}>

            {/* Language switcher */}
            <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
              {Object.entries(LANGS).map(([code, { flag, label }]) => (
                <button key={code} onClick={() => setLang(code)} style={{
                  display:"flex", alignItems:"center", gap:5,
                  padding:"4px 10px", borderRadius:20, cursor:"pointer",
                  fontFamily:"inherit", fontSize:11, fontWeight:700,
                  border: lang===code ? "1px solid rgba(255,255,255,.5)" : "1px solid rgba(255,255,255,.15)",
                  background: lang===code ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.05)",
                  color: lang===code ? WHITE : "rgba(255,255,255,.5)",
                  transition:"all .15s",
                }}>
                  <span style={{ fontSize:14 }}>{flag}</span> {label}
                </button>
              ))}
            </div>

            <div style={{ display:"inline-block",background:"rgba(255,255,255,.08)",
                          border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.65)",
                          fontSize:10,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",
                          padding:"4px 12px",borderRadius:20,marginBottom:14 }}>
              {t.badge}
            </div>
            <h1 style={{ fontFamily:"'Outfit',sans-serif",fontSize:"clamp(24px,5vw,42px)",
                         fontWeight:800,color:WHITE,lineHeight:1.1,letterSpacing:"-.5px",marginBottom:10 }}>
              {t.headline1}<br /><span style={{ color:"#7EB8F7" }}>{t.headline2}</span>
            </h1>
            <p style={{ fontSize:14,color:"rgba(255,255,255,.5)",maxWidth:520,lineHeight:1.65 }}>
              {t.subheadline}
            </p>
          </div>
        </div>

        <div className="wrap">

          {/* SMART TOGGLE */}
          <div onClick={() => setUseSmartTariff(v => !v)} style={{
            display:"flex",alignItems:"center",gap:14,cursor:"pointer",marginBottom:16,
            background:useSmartTariff ? NAVYLT : WHITE,
            border:`1px solid ${useSmartTariff ? NAVYMD+"44" : BORDER}`,
            borderRadius:12,padding:"14px 18px",transition:"all .2s",
          }}>
            <div style={{ width:44,height:24,borderRadius:12,flexShrink:0,position:"relative",
                          background:useSmartTariff ? NAVY : BORDER,transition:"background .2s" }}>
              <div style={{ position:"absolute",width:18,height:18,borderRadius:"50%",background:WHITE,
                            top:3,left:useSmartTariff?23:3,transition:"left .2s",
                            boxShadow:"0 1px 3px rgba(0,0,0,.2)" }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14,fontWeight:700,color:TEXT }}>{t.smartLabel}</div>
              <div style={{ fontSize:11,color:MUTED,marginTop:2 }}>{t.smartSub}</div>
            </div>
            {useSmartTariff && (
              <div style={{ background:NAVY,color:WHITE,fontSize:11,fontWeight:700,
                            padding:"3px 12px",borderRadius:20,whiteSpace:"nowrap" }}>
                {t.smartActive}
              </div>
            )}
          </div>

          {/* PARAMETERS */}
          <div style={card}>
            <div style={secTtl}>{t.sectionParams}<div style={secLine} /></div>

            <div style={{ marginBottom:20 }}>
              <div style={lbl}>{t.areaLabel}</div>
              <div style={{ fontFamily:"'Outfit',sans-serif",fontSize:34,fontWeight:800,color:NAVY,
                            letterSpacing:"-1px",lineHeight:1,marginBottom:4 }}>
                {area} <span style={{ fontSize:16,fontWeight:600,color:MUTED }}>{t.areaUnit}</span>
              </div>
              <input type="range" min={50} max={250} step={1} value={area}
                style={{ "--pct":`${pct}%` }}
                onChange={e => setArea(Number(e.target.value))} />
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:LIGHT,marginTop:4 }}>
                <span>{t.areaMin}</span><span>{t.areaMax}</span>
              </div>
            </div>

            <div className="g2" style={{ marginBottom:16 }}>
              <div>
                <div style={lbl}>{t.cityLabel}</div>
                <select value={cityKey} onChange={e => setCityKey(e.target.value)}>
                  {Object.keys(CITIES).map(k => <option key={k} value={k}>{cl[k]}</option>)}
                </select>
              </div>
              <div>
                <div style={lbl}>{t.epcLabel}</div>
                <select value={epcKey} onChange={e => setEpcKey(e.target.value)}>
                  {Object.entries(EPC).map(([k, v]) => (
                    <option key={k} value={k}>{k === "A" ? "A / A+" : k} — {v.baseConsumption} {t.epcUnit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div style={lbl}>{t.projectLabel}</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",border:`1px solid ${BORDER}`,borderRadius:8,overflow:"hidden" }}>
                {[["renovation", t.renovation], ["newbuild", t.newbuild]].map(([val, lbl2]) => (
                  <button key={val} onClick={() => setScenario(val)} style={{
                    padding:"10px",fontSize:13,fontFamily:"inherit",border:"none",cursor:"pointer",transition:"all .15s",
                    fontWeight:scenario===val ? 700 : 400,
                    background:scenario===val ? NAVY : WHITE,
                    color:scenario===val ? WHITE : MUTED,
                  }}>{lbl2}</button>
                ))}
              </div>
            </div>
          </div>

          {/* PANEL COUNT */}
          <div style={{ display:"flex",alignItems:"center",gap:16,
                        background:NAVYLT,border:`1px solid ${NAVY}22`,
                        borderRadius:10,padding:"14px 18px",marginBottom:16 }}>
            <div style={{ fontFamily:"'Outfit',sans-serif",fontSize:38,fontWeight:800,color:NAVY,lineHeight:1,minWidth:56 }}>
              {r.panelsNeeded}
            </div>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:NAVY }}>{t.panelsTitle}</div>
              <div style={{ fontSize:11,color:MUTED,marginTop:2 }}>
                {t.panelsSub(cl[cityKey], epcKey, area)}
              </div>
            </div>
          </div>

          {/* CAPEX */}
          <div style={card}>
            <div style={secTtl}>{t.sectionCapex}<div style={secLine} /></div>
            <div className="g3">
              {[
                { label:t.gasLabel,   name:t.gasName,   val:r.finalGasCapex,   accent:GAS,  sub:t.gasSub },
                { label:t.hpLabel,    name:t.hpName,    val:r.finalHpCapex,    accent:HP,   sub:t.hpSub  },
                { label:t.hybroLabel, name:t.hybroName, val:r.finalHybroCapex, accent:NAVY, sub:t.hybroSub(r.panelsNeeded) },
              ].map(({ label, name, val, accent, sub }) => (
                <div key={name} style={{ background:WHITE, border:`1px solid ${BORDER}`,
                                         borderTop:`3px solid ${accent}`, borderRadius:10, padding:"18px 20px" }}>
                  <div style={{ fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:MUTED,marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:15,fontWeight:700,color:TEXT,marginBottom:8 }}>{name}</div>
                  <div style={{ fontFamily:"'Outfit',sans-serif",fontSize:30,fontWeight:800,color:accent,letterSpacing:"-1px",lineHeight:1 }}>{eur(val)}</div>
                  <div style={{ fontSize:11,color:LIGHT,marginTop:6 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* OPEX */}
          <div style={card}>
            <div style={secTtl}>{t.sectionOpex}<div style={secLine} /></div>
            {[
              { name:t.gasSysName,   sub:t.gasSysSub(kWh(r.gasKwh)),                                              val:r.costGasY1,   accent:GAS  },
              { name:t.hpSysName,    sub:t.hpSysSub(cop, kWh(r.hpKwh)),                                           val:r.costHpY1,    accent:HP   },
              { name:t.hybroSysName, sub:t.hybroSysSub(kWh(r.hybroKwh), (elecTariff*.7).toFixed(3), useSmartTariff), val:r.costHybroY1, accent:NAVY },
            ].map(({ name, sub, val, accent }) => (
              <div key={name} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",
                                       padding:"14px 16px",background:BG,borderRadius:10,
                                       borderLeft:`3px solid ${accent}`,marginBottom:8 }}>
                <div>
                  <div style={{ fontSize:14,fontWeight:700,color:TEXT }}>{name}</div>
                  <div style={{ fontSize:11,color:LIGHT,fontFamily:"'DM Mono',monospace",marginTop:2 }}>{sub}</div>
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace",fontSize:20,fontWeight:700,color:accent,whiteSpace:"nowrap",marginLeft:16 }}>
                  {eur(val)}<span style={{ fontSize:12,fontWeight:400,color:MUTED }}>{t.perYear}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CHART */}
          <div style={card}>
            <div style={secTtl}>{t.sectionTco}<div style={secLine} /></div>
            <div style={{ width:"100%",height:320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top:4,right:12,left:8,bottom:4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                  <XAxis dataKey="year" tick={{ fill:LIGHT,fontSize:11 }} stroke={BORDER}
                    label={{ value:t.yearLabel,position:"insideBottomRight",offset:-8,fill:LIGHT,fontSize:11 }} />
                  <YAxis tick={{ fill:LIGHT,fontSize:10 }} stroke={BORDER}
                    tickFormatter={v => `${(v/1000).toFixed(0)}k€`} width={48} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize:13,paddingTop:14,fontFamily:"inherit" }} />
                  <Line type="monotone" dataKey={t.chartGas}   stroke={GAS}  strokeWidth={2} dot={false} activeDot={{ r:4 }} />
                  <Line type="monotone" dataKey={t.chartHp}    stroke={HP}   strokeWidth={2} dot={false} activeDot={{ r:4 }} />
                  <Line type="monotone" dataKey={t.chartHybro} stroke={NAVY} strokeWidth={3} dot={false} activeDot={{ r:5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CONCLUSION */}
          <div style={{ background:NAVY,borderRadius:12,padding:"28px",marginBottom:16 }}>
            <div style={{ fontSize:10,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",
                          color:"rgba(255,255,255,.4)",marginBottom:14 }}>{t.conclusionTitle}</div>
            <div style={{ fontSize:16,lineHeight:1.8,color:"rgba(255,255,255,.82)" }}>
              {t.conclusionText(eur(r.saveCapexVsHp), r.yearsOfElecCovered)}
            </div>
            <div style={{ marginTop:18,display:"flex",flexWrap:"wrap",gap:8 }}>
              {t.pills(useSmartTariff).map(pill => (
                <span key={pill} style={{ background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",
                                          color:"rgba(255,255,255,.6)",fontSize:11,fontWeight:600,
                                          padding:"4px 12px",borderRadius:20 }}>{pill}</span>
              ))}
            </div>
          </div>

          {/* ADVANCED */}
          <button onClick={() => setAdvOpen(v => !v)} style={{
            display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",
            fontSize:10,fontWeight:700,letterSpacing:".13em",textTransform:"uppercase",
            color:MUTED,padding:"4px 0",marginBottom:12,fontFamily:"inherit",
          }}>
            <span style={{ display:"inline-block",transform:advOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s" }}>▶</span>
            {t.advBtn}
          </button>

          {advOpen && (
            <div style={card}>
              <div style={secTtl}>{t.sectionAdv}<div style={secLine} /></div>
              <div className="g2">
                {[
                  [t.elecTariffLabel, elecTariff, setElecTariff, 0.01, 0.05, 1.0],
                  [t.gasTariffLabel,  gasTariff,  setGasTariff,  0.01, 0.03, 0.5],
                  [t.copLabel,        cop,         setCop,         0.1,  2.5,  4.5],
                  [t.inflLabel,       inflationRate, setInflationRate, 0.5, 0, 10],
                ].map(([label, val, fn, step, min, max]) => (
                  <div key={label}>
                    <div style={{ fontSize:10,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",color:MUTED,marginBottom:6 }}>{label}</div>
                    <input type="number" value={val} step={step} min={min} max={max}
                      onChange={e => fn(Number(e.target.value))} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign:"center",fontSize:11,color:LIGHT,marginTop:32,fontFamily:"'DM Mono',monospace" }}>
            {t.footer}
          </div>
        </div>
      </div>
    </>
  );
}
