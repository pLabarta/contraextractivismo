// Metal information and usage
export const METAL_INFO = [
    {
        name: "Oro (Au)",
        uses: "Chapado de contactos en socket CPU, ranuras RAM, PCI, SATA y conectores",
        location: "Contactos eléctricos y conectores"
    },
    {
        name: "Plata (Ag)",
        uses: "Soldaduras (mezclas Sn-Ag-Cu), contactos y pastas conductoras",
        location: "Soldaduras y componentes SMD"
    },
    {
        name: "Paladio (Pd)",
        uses: "Contactos eléctricos y componentes SMD de alto valor",
        location: "Componentes especializados"
    },
    {
        name: "Tántalo (Ta)",
        uses: "Dieléctrico en condensadores de alta capacidad",
        location: "Condensadores tantalio"
    },
    {
        name: "Cobre (Cu)",
        uses: "Pistas internas, planos de alimentación, conectores y capas del PCB",
        location: "PCB multicapa y conectores"
    },
    {
        name: "Estaño (Sn)",
        uses: "Componente principal en soldaduras BGA/SMT",
        location: "Puntos de soldadura"
    },
    {
        name: "Plomo (Pb)",
        uses: "Soldaduras en placas antiguas (no RoHS)",
        location: "Soldaduras legacy"
    },
    {
        name: "Aluminio (Al)",
        uses: "Cuerpos de condensadores electrolíticos y disipadores térmicos",
        location: "Condensadores y disipadores"
    },
    {
        name: "Níquel (Ni)",
        uses: "Subcapa en chapados de conectores y blindajes electromagnéticos",
        location: "Recubrimientos y blindajes"
    },
    {
        name: "Litio (Li)",
        uses: "Batería de reloj CMOS (CR2032)",
        location: "Batería CMOS"
    },
    {
        name: "Silicio (Si)",
        uses: "Base de semiconductores: chipset, MOSFETs, chips de memoria",
        location: "Circuitos integrados"
    }
];

import { METAL_PRICES, UNIT_CONVERSIONS } from '../config.js';

// Convert price from any unit to per gram
function convertPriceToPerGram(priceData) {
    const { price, unit } = priceData;
    const gramsPerUnit = UNIT_CONVERSIONS[unit];

    if (!gramsPerUnit) {
        console.error(`Unknown unit: ${unit}`);
        return 0;
    }

    return price / gramsPerUnit;
}

// Create price lookup in USD per gram
const METAL_PRICES_PER_GRAM = {};
for (const [metal, priceData] of Object.entries(METAL_PRICES)) {
    METAL_PRICES_PER_GRAM[metal] = convertPriceToPerGram(priceData);
}

// Metal quantity ranges (in grams)
export const METAL_RANGES = {
    "Oro": { min: 0.02, max: 0.6, unit: "g", precious: true },
    "Plata": { min: 0.05, max: 0.6, unit: "g", precious: true },
    "Paladio": { min: 0.005, max: 0.05, unit: "g", precious: true },
    "Tántalo": { min: 0, max: 0.5, unit: "g", critical: true },
    "Cobre": { min: 20, max: 60, unit: "g", base: true },
    "Estaño": { min: 5, max: 30, unit: "g", base: true },
    "Plomo": { min: 0, max: 10, unit: "g", base: true },
    "Aluminio": { min: 10, max: 100, unit: "g", base: true },
    "Níquel": { min: 0.5, max: 5, unit: "g", base: true },
    "Litio": { min: 0, max: 0.2, unit: "g", critical: true }
};

// Generate random metal quantities
export function generateMetalStats() {
    const stats = {};

    for (const [metal, range] of Object.entries(METAL_RANGES)) {
        const value = range.min + Math.random() * (range.max - range.min);
        stats[metal] = {
            value: Math.round(value * 1000) / 1000, // Round to 3 decimals
            unit: range.unit,
            isPrecious: range.precious || false,
            isCritical: range.critical || false,
            isBase: range.base || false
        };
    }

    return stats;
}

// Calculate total weight
export function calculateTotalWeight(stats) {
    return Object.values(stats).reduce((sum, metal) => sum + metal.value, 0);
}

// Export market prices (converted to per gram) for use in UI
export const MARKET_PRICES = METAL_PRICES_PER_GRAM;

export function calculateMetalValue(metal, grams) {
    const pricePerGram = METAL_PRICES_PER_GRAM[metal] || 0;
    return Math.round(grams * pricePerGram * 100) / 100;
}

export function calculatePreciousMetalsValue(stats) {
    let total = 0;
    const preciousMetals = ["Oro", "Plata", "Paladio"];

    for (const metal of preciousMetals) {
        if (stats[metal]) {
            total += calculateMetalValue(metal, stats[metal].value);
        }
    }
    return Math.round(total * 100) / 100;
}

export function calculateTotalValue(stats) {
    let total = 0;
    for (const [metal, data] of Object.entries(stats)) {
        total += calculateMetalValue(metal, data.value);
    }
    return Math.round(total * 100) / 100;
}
