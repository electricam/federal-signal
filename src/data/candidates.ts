export type Source = {
  label: string;
  url: string;
  kind: "government" | "company" | "filing" | "institution" | "reporting";
  supports: string;
  accessedOn: string;
};

export type ScoreBreakdown = {
  governmentValidation: number;
  microsoftRelevance: number;
  ventureStageFit: number;
  technicalDefensibility: number;
  founderMarketFit: number;
};

export type Candidate = {
  rank: number;
  name: string;
  website: string;
  aliases: string[];
  foundedYear: number;
  age: number;
  isAgeException: boolean;
  headquarters: string;
  sector: string;
  agencies: string[];
  stage: string;
  totalScore: number;
  scoreBreakdown: ScoreBreakdown;
  scoreNotes: Record<keyof ScoreBreakdown, string>;
  oneLineThesis: string;
  technology: string;
  whyNow: string;
  microsoftAdjacency: string;
  founderEvidence: string;
  commercialEvidence: string;
  primaryRisk: string;
  interviewTalkingPoint: string;
  awardSignal: {
    awardCount: number;
    phaseI: number;
    phaseII: number;
    totalDollars: number;
    latestYear: number;
    latestAgency: string;
    latestAwardTitle: string;
    confidence: "verified" | "lower-bound" | "estimated";
  };
  outsideFunding: {
    amount: number | null;
    display: string;
    label: "verified" | "reported" | "not-disclosed";
  };
  sources: Source[];
};

export type Alternate = {
  name: string;
  score: number | null;
  foundedYear: number;
  status: string;
  reason: string;
  changeSignal: string;
  sourceUrl: string;
};

const accessedOn = "2026-09-02";

export const candidates: Candidate[] = [
  {
    rank: 1,
    name: "AiRANACULUS",
    website: "https://airanaculus.com/",
    aliases: ["A10 Systems Inc."],
    foundedYear: 2019,
    age: 7,
    isAgeException: false,
    headquarters: "Lowell, Massachusetts",
    sector: "Networking & security",
    agencies: ["DOD", "NASA"],
    stage: "Private · Post-Phase II",
    totalScore: 92,
    scoreBreakdown: {
      governmentValidation: 24,
      microsoftRelevance: 24,
      ventureStageFit: 15,
      technicalDefensibility: 14,
      founderMarketFit: 15,
    },
    scoreNotes: {
      governmentValidation: "Six Phase II wins, $9.1M in SBIR funding, and NASA CCRPP selection show repeat conversion and follow-on pull.",
      microsoftRelevance: "AI-native orchestration across 5G/6G, edge, spectrum, and non-terrestrial networks maps directly to cloud and security priorities.",
      ventureStageFit: "Private with productized software and no disclosed institutional round; the missing financing history limits conviction.",
      technicalDefensibility: "Seven granted U.S. patents, 12 pending patents, and a first-place DIU spectrum-sharing result support defensibility.",
      founderMarketFit: "Founder Apurva Mody is an IEEE Fellow with 20+ years across wireless, radar, EW, and DoD programs.",
    },
    oneLineThesis: "A patent-rich control plane for networks that must keep working when spectrum, links, and conditions change.",
    technology: "CLAIRE and INSPiRE use sensing, AI, policy routing, and network slicing to optimize heterogeneous radio networks spanning 5G, Wi-Fi, SATCOM, and legacy systems.",
    whyNow: "NASA lists AiRANACULUS among five 2025 CCRPP awardees, while the company reports a 2026 commercialization contract and new Open RAN work. The signal is moving beyond feasibility toward mission infusion.",
    microsoftAdjacency: "A credible Azure story would combine cloud-scale network telemetry, digital twins, edge AI, and secure orchestration for private 5G and space-to-ground networks. No Microsoft relationship is implied.",
    founderEvidence: "Apurva Mody holds a Ph.D. in electrical engineering, is an IEEE Fellow, and documents more than two decades of R&D in spectrum sharing, communications, radar, and electronic warfare.",
    commercialEvidence: "The company markets self-driving network software, names commercial collaborators including Juniper, Radisys, and NVIDIA, and has translated NASA-funded IP into multiple named platforms.",
    primaryRisk: "The public record is government-heavy and private financing is undisclosed; diligence must separate repeat R&D success from scalable software revenue.",
    interviewTalkingPoint: "The sharpest signal is not award count alone—it is repeated Phase I-to-II conversion plus a post-Phase II commercialization mechanism around software that sits directly in the AI/edge/network stack.",
    awardSignal: {
      awardCount: 16,
      phaseI: 10,
      phaseII: 6,
      totalDollars: 9105161,
      latestYear: 2025,
      latestAgency: "NASA",
      latestAwardTitle: "Future Lunar Surface Comms (FULCRUM)",
      confidence: "verified",
    },
    outsideFunding: { amount: null, display: "Not disclosed", label: "not-disclosed" },
    sources: [
      { label: "SBIR company portfolio", url: "https://www.sbir.gov/portfolio/1621771", kind: "government", supports: "16 awards, phase mix, $9.1M total, and 2025 FULCRUM award", accessedOn },
      { label: "NASA CCRPP awardees", url: "https://www.nasa.gov/sbir_sttr/ccrpp/", kind: "government", supports: "Post-Phase II program mechanics and 2025 selection", accessedOn },
      { label: "Company technology and programs", url: "https://airanaculus.com/about-us/", kind: "company", supports: "Platforms, 2026 activity, patent counts, and collaborators", accessedOn },
      { label: "Founder biography", url: "https://airanaculus.com/wp-content/uploads/2024/11/20241110-Apurva-Mody-PhD-Bio-AiRANACULUS-v2.pdf", kind: "company", supports: "Founder credentials and domain experience", accessedOn },
      { label: "NASA TechPort: CLAIRE", url: "https://techport.nasa.gov/projects/113155", kind: "government", supports: "Technical scope, maturity progression, and NASA program ownership", accessedOn },
    ],
  },
  {
    rank: 2,
    name: "Albedo",
    website: "https://albedo.com/",
    aliases: ["Albedo Space Corp."],
    foundedYear: 2020,
    age: 6,
    isAgeException: false,
    headquarters: "Broomfield, Colorado",
    sector: "Space infrastructure",
    agencies: ["DOD"],
    stage: "Series A-1 · Flight-proven",
    totalScore: 90,
    scoreBreakdown: {
      governmentValidation: 22,
      microsoftRelevance: 24,
      ventureStageFit: 14,
      technicalDefensibility: 15,
      founderMarketFit: 15,
    },
    scoreNotes: {
      governmentValidation: "Two Phase II awards, a 2025 SBIR, a $12M STRATFI announcement, and an NRO Stage II contract show layered demand.",
      microsoftRelevance: "VLEO sensing can feed Azure geospatial, AI, security, digital-twin, and critical-infrastructure workloads.",
      ventureStageFit: "$97M reported funding and flight validation lower technical risk but make this a later and more competitive entry point.",
      technicalDefensibility: "The team proved sustained VLEO operations, atomic-oxygen resilience, and most of the stack needed for 10 cm imagery.",
      founderMarketFit: "The founders built classified remote-sensing systems and satellite architectures at Lockheed Martin before Albedo.",
    },
    oneLineThesis: "Flight-proven VLEO infrastructure can make aerial-quality sensing available from orbit—and turn pixels into cloud workloads.",
    technology: "Albedo designs and operates Very Low Earth Orbit buses, optics, autonomy, and co-collected visible/thermal sensing systems.",
    whyNow: "Clarity-1 validated sustainable VLEO operations, and the 2026 Vicinity mission expands the platform toward higher-power third-party payloads. Execution risk remains, but the company has crossed a meaningful flight-hardware threshold.",
    microsoftAdjacency: "High-resolution, low-latency sensing is an upstream data source for Azure geospatial analytics, AI models, digital twins, defense workloads, and critical-infrastructure monitoring. No Microsoft relationship is implied.",
    founderEvidence: "Topher Haddad and AyJay Lasater previously worked on remote-sensing payloads, optical architectures, and government satellite systems at Lockheed Martin; both have relevant engineering graduate training.",
    commercialEvidence: "NRO Stage II enables tasking and data evaluation, while the company is broadening from imagery into a VLEO bus platform for payload integration and mission operations.",
    primaryRisk: "The first satellite validated the bus but not every imagery objective; the capital intensity and $97M already raised narrow the venture-stage fit.",
    interviewTalkingPoint: "This is a clean example of government signal compounding with private capital: SBIR de-risked components, NRO validates demand, and the first mission converted a paper thesis into flight heritage.",
    awardSignal: {
      awardCount: 4,
      phaseI: 2,
      phaseII: 2,
      totalDollars: 2673624,
      latestYear: 2025,
      latestAgency: "DOD / OSD",
      latestAwardTitle: "Automated Physical Damage Detector",
      confidence: "verified",
    },
    outsideFunding: { amount: 97000000, display: "$97M reported", label: "reported" },
    sources: [
      { label: "SBIR company portfolio", url: "https://www.sbir.gov/portfolio/1891493", kind: "government", supports: "Four awards, phase mix, $2.67M total, and latest award", accessedOn },
      { label: "Clarity-1 mission review", url: "https://albedo.com/post/clarity-1-what-worked-and-where-we-go-next", kind: "company", supports: "Flight results, validated capabilities, and remaining imaging work", accessedOn },
      { label: "NRO Stage II announcement", url: "https://albedo.com/post/national-reconnaissance-office-nro-awards-albedo-stage-ii-contract-award", kind: "company", supports: "Government tasking and data-evaluation pathway", accessedOn },
      { label: "Vicinity mission announcement", url: "https://albedo.com/post/albedos-next-vleo-mission-vicinity", kind: "company", supports: "2026 platform expansion and second mission", accessedOn },
      { label: "Y Combinator company profile", url: "https://www.ycombinator.com/companies/albedo", kind: "institution", supports: "Founded year, private status, and founder backgrounds", accessedOn },
      { label: "Standard Investments financing release", url: "https://standardindustries.com/articles/investments/albedo-raises-35m-to-commercialize-very-low-earth-orbit-vleo", kind: "institution", supports: "$35M A-1 and $97M reported total funding", accessedOn },
    ],
  },
  {
    rank: 3,
    name: "Adena Power",
    website: "https://adenapower.com/",
    aliases: [],
    foundedYear: 2022,
    age: 4,
    isAgeException: false,
    headquarters: "Lewis Center, Ohio",
    sector: "Energy storage",
    agencies: ["DOD", "DOE"],
    stage: "Seed · Demonstration",
    totalScore: 88,
    scoreBreakdown: {
      governmentValidation: 21,
      microsoftRelevance: 23,
      ventureStageFit: 17,
      technicalDefensibility: 13,
      founderMarketFit: 14,
    },
    scoreNotes: {
      governmentValidation: "Three recent awards across DOE and the Army include a $1.9M Phase II field-demonstration program.",
      microsoftRelevance: "Safe, long-duration, domestically sourced storage is strategically relevant to grid-constrained data-center growth.",
      ventureStageFit: "A 2022 spinout with a reported $2M seed round remains early; independence is supported, though ownership warrants diligence.",
      technicalDefensibility: "Three patented materials, licensed lab IP, and ceramic-manufacturing know-how support a real materials moat.",
      founderMarketFit: "The co-founders bring 15+ years each in energy product scale-up and commercialization from Nexceris.",
    },
    oneLineThesis: "A young sodium-battery spinout pairing domestic materials and safer chemistry with an Army-backed path to field-scale systems.",
    technology: "Adena is commercializing sodium iron-chloride solid-state batteries with ceramic electrolytes for 8–12 hour stationary and deployable storage.",
    whyNow: "The Army moved the technology into a $1.9M Phase II demonstration, while data-center load growth makes non-lithium storage and domestic supply chains increasingly strategic.",
    microsoftAdjacency: "Long-duration storage could support data-center resilience, renewable firming, and grid-aware infrastructure planning. The adjacency is strategic and does not imply a Microsoft relationship.",
    founderEvidence: "Neil Kidner has deep product-development and manufacturing scale-up experience; Nathan Cooley has spent more than 15 years commercializing emerging energy technology.",
    commercialEvidence: "The company publishes containerized 0.54 MWh and 1.07 MWh system specifications, has pursued a Duke Energy pilot, and describes an engaged commercial and industrial pipeline.",
    primaryRisk: "The company remains in demonstration mode, public deployment evidence is dated, and the spinout’s current ownership and financing structure need confirmation.",
    interviewTalkingPoint: "Adena shows why award progression matters: the signal is not ‘a battery got a grant,’ but that two agencies funded distinct grid and austere-power use cases before the Army committed Phase II demonstration capital.",
    awardSignal: {
      awardCount: 3,
      phaseI: 2,
      phaseII: 1,
      totalDollars: 2356500,
      latestYear: 2025,
      latestAgency: "DOD / Army",
      latestAwardTitle: "Sodium Solid-State Battery Demonstration",
      confidence: "verified",
    },
    outsideFunding: { amount: 2000000, display: "$2M seed reported", label: "reported" },
    sources: [
      { label: "SBIR company portfolio", url: "https://www.sbir.gov/portfolio/2471359", kind: "government", supports: "Three awards, $2.36M total, phase progression, and performance claims", accessedOn },
      { label: "Company overview", url: "https://adenapower.com/about/", kind: "company", supports: "Product positioning, commercialization stage, and market focus", accessedOn },
      { label: "Company team", url: "https://adenapower.com/our-team/", kind: "company", supports: "Founder roles and operating experience", accessedOn },
      { label: "BRITE founder profile", url: "https://brite.org/powering-progress-adena-powers-journey-to-address-the-100-twh-grid-opportunity/", kind: "institution", supports: "Independent-spinoff intent and founder-market history", accessedOn },
      { label: "Product data sheet", url: "https://adenapower.com/wp-content/uploads/2024/01/Adena-Product-Datasheet.pdf", kind: "company", supports: "System size, discharge duration, efficiency, and cycle-life targets", accessedOn },
      { label: "Dealroom company profile", url: "https://app.dealroom.co/companies/adena_power", kind: "reporting", supports: "2022 launch and reported $2M seed financing", accessedOn },
    ],
  },
  {
    rank: 4,
    name: "Solideon",
    website: "https://solideon.com/",
    aliases: ["Additive Space Technologies"],
    foundedYear: 2021,
    age: 5,
    isAgeException: false,
    headquarters: "Berkeley, California",
    sector: "Advanced manufacturing",
    agencies: ["DOD"],
    stage: "Pre-seed / Seed",
    totalScore: 87,
    scoreBreakdown: {
      governmentValidation: 19,
      microsoftRelevance: 22,
      ventureStageFit: 18,
      technicalDefensibility: 14,
      founderMarketFit: 14,
    },
    scoreNotes: {
      governmentValidation: "A 2024 Phase I converted into a $1.25M 2025 Phase II tied to Air Force sustainment and deployable production.",
      microsoftRelevance: "AI-directed robotics and software-defined microfactories connect to industrial cloud, digital twins, and defense supply chains.",
      ventureStageFit: "A young Techstars company with $6.5M reported funding leaves room for early-stage participation.",
      technicalDefensibility: "The Aperture system integrates multi-robot coordination, wire-arc printing, milling, assembly, and inspection.",
      founderMarketFit: "Oluseun Taiwo led additive-manufacturing work at Rocket Lab, Argonne, Virgin Orbit, and 3D Systems before founding the company.",
    },
    oneLineThesis: "Software-defined, deployable factories could compress aerospace hardware cycles from months to weeks at the point of need.",
    technology: "Aperture combines collaborative robotics, wire-arc additive manufacturing, CNC milling, assembly, inspection, and generative design in reconfigurable cells.",
    whyNow: "The 2025 Phase II is explicitly aimed at a portable manufacturing cell for Air Force sustainment, while an AUKUS-aligned maritime MOU broadens the commercial pathway.",
    microsoftAdjacency: "The strategic angle is a cloud-connected industrial stack: AI-assisted design, digital twins, factory telemetry, edge control, and secure deployment. No Microsoft relationship is implied.",
    founderEvidence: "Oluseun Taiwo’s operating record spans 3D-printed rocket engines, national-lab work, and aerospace additive manufacturing; CTO Joel Ifill adds product and patented aerial-delivery experience.",
    commercialEvidence: "Solideon reports a strategic maritime MOU, customer work and LOIs in its materials, and a Phase II program aimed at field-deployable production rather than a stand-alone research result.",
    primaryRisk: "Customer and LOI claims are largely company-reported, and scaling an integrated hardware cell from demonstrations to repeatable gross margin is difficult.",
    interviewTalkingPoint: "Solideon turns the SBIR into a wedge: the Air Force is paying to prove a deployable cell, but the venture thesis is the software layer that can orchestrate many tools and factories.",
    awardSignal: {
      awardCount: 2,
      phaseI: 1,
      phaseII: 1,
      totalDollars: 1359770,
      latestYear: 2025,
      latestAgency: "DOD / Air Force",
      latestAwardTitle: "Single Pallet Additive Manufacturing Cell",
      confidence: "verified",
    },
    outsideFunding: { amount: 6500000, display: "$6.5M reported", label: "reported" },
    sources: [
      { label: "SBIR company portfolio", url: "https://www.sbir.gov/portfolio/2141775", kind: "government", supports: "Two awards, 100% conversion, $1.36M total, and award scope", accessedOn },
      { label: "Company team", url: "https://solideon.com/about/", kind: "company", supports: "Founder and CTO experience plus product vision", accessedOn },
      { label: "AUKUS-aligned MOU", url: "https://solideon.com/solideon-acua-ocean-2025/", kind: "company", supports: "2025 maritime commercialization activity and 2021 founding claim", accessedOn },
      { label: "TechCrunch company profile", url: "https://techcrunch.com/2024/10/28/solideon-wants-to-decentralize-rocket-manufacturing-through-3d-printing/", kind: "reporting", supports: "$6.5M reported funding, Techstars, and founder history", accessedOn },
      { label: "Company one-pager", url: "https://solideon.com/wp-content/uploads/2024/08/Solideon_1-Pager-824.pdf", kind: "company", supports: "Platform architecture, commercial claims, and financing context", accessedOn },
    ],
  },
  {
    rank: 5,
    name: "AirMettle",
    website: "https://www.airmettle.com/",
    aliases: [],
    foundedYear: 2018,
    age: 8,
    isAgeException: true,
    headquarters: "Houston, Texas",
    sector: "Data infrastructure",
    agencies: ["DOE", "DOC", "NSF"],
    stage: "Seed · Early deployments",
    totalScore: 84,
    scoreBreakdown: {
      governmentValidation: 19,
      microsoftRelevance: 24,
      ventureStageFit: 15,
      technicalDefensibility: 13,
      founderMarketFit: 13,
    },
    scoreNotes: {
      governmentValidation: "Seven awards and two Phase II conversions total $2.88M across data-intensive scientific workloads.",
      microsoftRelevance: "In-storage analytics directly attacks cloud networking, compute, memory, and data-movement costs.",
      ventureStageFit: "Reported seed funding and early trials leave room, but public commercial traction is still limited.",
      technicalDefensibility: "Patented distributed processing inside an S3-compatible storage layer is technically differentiated.",
      founderMarketFit: "The founders previously built Violin Memory’s core concept, Betfair’s high-throughput platform, and large distributed systems.",
    },
    oneLineThesis: "Move computation to petabyte-scale data instead of moving data to computation—a direct cloud-cost and performance wedge.",
    technology: "AirMettle embeds massively parallel analytics into software-defined object storage so semi-structured datasets can be filtered, aggregated, and transformed in place.",
    whyNow: "DOE’s 2025 Phase II targets commercial trials for image-rich scientific data, while the newest Phase I expands the same architecture to genomics—evidence of a reusable platform rather than a single bespoke workload.",
    microsoftAdjacency: "The fit is unusually direct: Azure object storage, HPC, AI inference, and Fabric-style analytics all face data-movement bottlenecks. No Microsoft relationship is implied.",
    founderEvidence: "Donpaul Stephens created the original Violin Memory concept; Matt Youill helped build Betfair’s high-throughput transaction platform; Chia-lin Wu has decades of distributed-systems experience.",
    commercialEvidence: "The company reports initial deployments and early-access trials, an S3-compatible product, and compatibility with open-source analytics tools on standard infrastructure.",
    primaryRisk: "The storage market is crowded, the website’s traction evidence is thin, and the team must prove that its performance advantage creates durable enterprise adoption.",
    interviewTalkingPoint: "This is the deliberate age exception: it is eight years old, but repeat awards across unrelated scientific datasets suggest a horizontal data primitive with unusually strong Microsoft adjacency.",
    awardSignal: {
      awardCount: 7,
      phaseI: 5,
      phaseII: 2,
      totalDollars: 2875500,
      latestYear: 2025,
      latestAgency: "DOE",
      latestAwardTitle: "Scalable, Accelerated Genomic Sequence Analysis",
      confidence: "verified",
    },
    outsideFunding: { amount: 3000000, display: ">$3M seed reported", label: "reported" },
    sources: [
      { label: "SBIR company portfolio", url: "https://www.sbir.gov/portfolio/1957613", kind: "government", supports: "Seven awards, phase mix, $2.88M total, and 2025 programs", accessedOn },
      { label: "Company platform and team", url: "https://www.airmettle.com/", kind: "company", supports: "Technology, integrations, patents, and founder operating history", accessedOn },
      { label: "StorageNewsletter profile", url: "https://www.storagenewsletter.com/2024/03/21/profile-of-start-up-airmettle/", kind: "reporting", supports: "2018 founding, >$3M seed funding, deployments, and customer evidence", accessedOn },
      { label: "AirMettle user guide", url: "https://airmettle.com/assets/documents/airmettle-user-guide-1.1.0.pdf", kind: "company", supports: "Addressable product documentation and platform capabilities", accessedOn },
    ],
  },
];

export const alternates: Alternate[] = [
  {
    name: "Advanced Aircraft Company",
    score: 80,
    foundedYear: 2016,
    status: "Age exception · alternate",
    reason: "Five awards and three Phase II conversions are compelling, but the company is at the 10-year ceiling and disclosed commercial scale remains modest.",
    changeSignal: "A current financing, repeat commercial fleet order, or verified revenue base would justify the age override.",
    sourceUrl: "https://www.sbir.gov/portfolio/1972589",
  },
  {
    name: "Accelerate Wind",
    score: 76,
    foundedYear: 2016,
    status: "Age exception · alternate",
    reason: "Strong founder fit and five awards are offset by the 10-year age exception and a still-developing commercial-installation record.",
    changeSignal: "Paid multi-site deployments or completion of a current institutional financing would materially improve the case.",
    sourceUrl: "https://www.sbir.gov/portfolio/1646569",
  },
  {
    name: "9 Corner Solutions",
    score: 58,
    foundedYear: 2022,
    status: "Gate fail · services-heavy",
    reason: "The single verified $149,972 Phase I award is relevant to hardware security, but public materials emphasize consulting and custom R&D over an independently scalable product.",
    changeSignal: "A named product, repeatable licensing model, or Phase II transition would reopen the case.",
    sourceUrl: "https://www.inknowvation.com/sbir/companies/9-corner-solutions-llc",
  },
];

export const screenOuts = [
  {
    name: "Agile Space Industries",
    reason: "Excluded on age: the company’s own timeline traces its operating predecessor to 2009, despite a 2019 incorporation and excellent recent awards.",
    url: "https://agilespaceindustries.com/about",
  },
  {
    name: "Aeluma",
    reason: "Excluded because it is publicly traded on Nasdaq under ALMU; used only as a methodology control.",
    url: "https://www.aeluma.com/investors/company-information/faq",
  },
];

export const scoreLabels: Record<keyof ScoreBreakdown, { label: string; max: number }> = {
  governmentValidation: { label: "Government validation", max: 25 },
  microsoftRelevance: { label: "Microsoft relevance", max: 25 },
  ventureStageFit: { label: "Venture-stage fit", max: 20 },
  technicalDefensibility: { label: "Technical defensibility", max: 15 },
  founderMarketFit: { label: "Founder-market fit", max: 15 },
};
