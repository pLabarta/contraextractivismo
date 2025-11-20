import {
    METAL_INFO,
    generateMetalStats,
    calculateTotalWeight,
    calculatePreciousMetalsValue
} from '../data/metalsData.js';

export function populateMetalInfoTable() {
    const tbody = document.querySelector('#metalInfoTable tbody');
    tbody.innerHTML = '';

    METAL_INFO.forEach(metal => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="metal-name">${metal.name}</td>
            <td>${metal.uses}</td>
            <td>${metal.location}</td>
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

        row.innerHTML = `
            <td class="metal-name">${metal}</td>
            <td>${data.value.toFixed(3)} ${data.unit}</td>
            <td><span class="metal-type ${typeClass}">${typeLabel}</span></td>
        `;
        tbody.appendChild(row);
    });

    // Update summary stats
    const totalWeight = calculateTotalWeight(stats);
    const preciousValue = calculatePreciousMetalsValue(stats);

    document.getElementById('totalWeight').textContent = totalWeight.toFixed(2);
    document.getElementById('preciousValue').textContent = preciousValue.toFixed(2);
}

export function showTables() {
    const container = document.getElementById('tablesContainer');
    const showBtn = document.getElementById('showResultsBtn');

    container.style.display = 'grid';
    showBtn.style.display = 'none';

    populateMetalInfoTable();
    populateMetalStatsTable();
}

export function hideTables() {
    const container = document.getElementById('tablesContainer');
    const showBtn = document.getElementById('showResultsBtn');

    container.style.display = 'none';
    showBtn.style.display = 'block';
}
