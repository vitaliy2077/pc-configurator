/* global database */

// Юнит-функции (их проверяют тесты)
const checkSocket = (cpuSocket, mbSocket) => cpuSocket === mbSocket;
const checkRam = (mbRam, ramType) => mbRam === ramType;

// Заполнение выпадающих списков из базы
function initApp() {
    if (typeof database === 'undefined') return;

    const fillSelect = (id, items, attrMap) => {
        const select = document.getElementById(id);
        if (!select) return;
        items.forEach(item => {
            const opt = new Option(item.name, item.id);
            Object.keys(attrMap).forEach(key => {
                opt.dataset[key] = item[attrMap[key]];
            });
            select.add(opt);
        });
    };

    fillSelect('cpu', database.cpus, { socket: 'socket' });
    fillSelect('motherboard', database.motherboards, { socket: 'socket', ram: 'ramType' });
    fillSelect('ram', database.rams, { ram: 'type' });
}

// Главная валидация
function validateConfig() {
    const cpu = document.getElementById('cpu').selectedOptions[0];
    const mb = document.getElementById('motherboard').selectedOptions[0];
    const ram = document.getElementById('ram').selectedOptions[0];
    const errorLog = document.getElementById('error-log');

    let errors = [];
    if (cpu.value && mb.value && !checkSocket(cpu.dataset.socket, mb.dataset.socket)) {
        errors.push("❌ Несовместимый сокет!");
    }
    if (mb.value && ram.value && !checkRam(mb.dataset.ram, ram.dataset.ram)) {
        errors.push("❌ Неподходящий тип RAM!");
    }

    errorLog.innerHTML = errors.join('<br>');
    errorLog.style.display = errors.length > 0 ? 'block' : 'none';
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        ['cpu', 'motherboard', 'ram'].forEach(id => {
            document.getElementById(id).addEventListener('change', validateConfig);
        });
    });
}

if (typeof module !== 'undefined') {
    module.exports = { checkSocket, checkRam };
}