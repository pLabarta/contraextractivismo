import {
    METAL_INFO,
    generateMetalStats,
    calculateTotalWeight,
    calculatePreciousMetalsValue,
    calculateTotalValue,
    calculateMetalValue,
    MARKET_PRICES,
    METAL_RANGES
} from '../data/metalsData.js';

export function populateMetalInfoTable() {
    const tbody = document.querySelector('#metalInfoTable tbody');
    tbody.innerHTML = '';

    METAL_INFO.forEach(metal => {
        const row = document.createElement('tr');

        // Extract metal base name (e.g., "Oro" from "Oro (Au)")
        const metalBaseName = metal.name.split(' ')[0];
        const range = METAL_RANGES[metalBaseName];

        // Format range display
        let rangeDisplay = 'N/A';
        if (range) {
            if (range.min === 0) {
                rangeDisplay = `0 - ${range.max} ${range.unit}`;
            } else {
                rangeDisplay = `${range.min} - ${range.max} ${range.unit}`;
            }
        }

        row.innerHTML = `
            <td class="metal-name">${metal.name}</td>
            <td>${metal.uses}</td>
            <td>${metal.location}</td>
            <td>${rangeDisplay}</td>
        `;
        tbody.appendChild(row);
    });
}

export function populateMetalStatsTable() {
    const tbody = document.querySelector('#metalStatsTable tbody');
    tbody.innerHTML = '';

    const stats = generateMetalStats();

    // Sort metals by value (precious first, then critical, then base)
    const sortedMetals = Object.entries(stats).sort((a, b) => {
        if (a[1].isPrecious && !b[1].isPrecious) return -1;
        if (!a[1].isPrecious && b[1].isPrecious) return 1;
        if (a[1].isCritical && !b[1].isCritical) return -1;
        if (!a[1].isCritical && b[1].isCritical) return 1;
        return b[1].value - a[1].value;
    });

    sortedMetals.forEach(([metal, data]) => {
        const row = document.createElement('tr');

        let typeClass = 'base';
        let typeLabel = 'Base';
        if (data.isPrecious) {
            typeClass = 'precious';
            typeLabel = 'Precioso';
        } else if (data.isCritical) {
            typeClass = 'critical';
            typeLabel = 'Crítico';
        }

        const totalValue = calculateMetalValue(metal, data.value);

        row.innerHTML = `
            <td class="metal-name">${metal}</td>
            <td>${data.value.toFixed(3)} ${data.unit}</td>
            <td class="value-column">$${totalValue.toFixed(2)}</td>
            <td><span class="metal-type ${typeClass}">${typeLabel}</span></td>
        `;
        tbody.appendChild(row);
    });

    // Update summary stats
    const totalWeight = calculateTotalWeight(stats);
    const totalValue = calculateTotalValue(stats);
    const preciousValue = calculatePreciousMetalsValue(stats);
    const honorarios = 660.00;
    const grandTotal = totalValue + honorarios;

    document.getElementById('totalWeight').textContent = totalWeight.toFixed(2);
    document.getElementById('totalValue').textContent = totalValue.toFixed(2);
    document.getElementById('preciousValue').textContent = preciousValue.toFixed(2);
    document.getElementById('honorariosValue').textContent = honorarios.toFixed(2);
    document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);
}

export function showTables() {
    const container = document.getElementById('tablesContainer');
    const showBtn = document.getElementById('showResultsBtn');
    const fpsBtn = document.getElementById('enterFPSBtn');

    container.style.display = 'grid';
    showBtn.style.display = 'none';
    fpsBtn.disabled = true;

    populateMetalInfoTable();
    populateMetalStatsTable();
}

export function hideTables() {
    const container = document.getElementById('tablesContainer');
    const showBtn = document.getElementById('showResultsBtn');
    const fpsBtn = document.getElementById('enterFPSBtn');

    container.style.display = 'none';
    showBtn.style.display = 'block';
    fpsBtn.disabled = false;
}
