'use strict';

/* ─────────────────────────────────────────────
   DATABASE  (localStorage)
───────────────────────────────────────────── */
const DB = {
    get(key, def) {
        try { const v = localStorage.getItem('koren_' + key); return v ? JSON.parse(v) : def; }
        catch { return def; }
    },
    set(key, val) { localStorage.setItem('koren_' + key, JSON.stringify(val)); },
    uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
    hash(s) {
        let h = 0;
        for (let i = 0; i < s.length; i++) { h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; }
        return h.toString(16);
    }
};

/* ─────────────────────────────────────────────
   CUSTOM DIALOGS
───────────────────────────────────────────── */
function showConfirm({ icon = '⚠️', title = 'Вы уверены?', sub = '', okLabel = 'ОК', okClass = 'btn-red', onOk }) {
    const overlay = document.getElementById('overlay-confirm');
    document.getElementById('dlg-icon').textContent = icon;
    document.getElementById('dlg-title').textContent = title;
    document.getElementById('dlg-sub').textContent = sub;
    const okBtn = document.getElementById('dlg-ok');
    okBtn.textContent = okLabel;
    okBtn.className = 'btn ' + okClass;
    overlay.classList.add('open');
    const close = () => overlay.classList.remove('open');
    const onOkClick = () => { close(); onOk?.(); };
    document.getElementById('dlg-cancel').onclick = close;
    okBtn.onclick = onOkClick;
    overlay.onclick = e => { if (e.target === overlay) close(); };
}

function showPrompt({ onOk }) {
    const overlay = document.getElementById('overlay-prompt');
    const input = document.getElementById('prompt-input');
    input.value = '';
    overlay.classList.add('open');
    setTimeout(() => input.focus(), 80);
    const close = () => overlay.classList.remove('open');
    const submit = () => { const v = input.value.trim(); if (v) { close(); onOk?.(v); } else input.focus(); };
    document.getElementById('prompt-cancel').onclick = close;
    document.getElementById('prompt-ok').onclick = submit;
    input.onkeydown = e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') close(); };
    overlay.onclick = e => { if (e.target === overlay) close(); };
}


/* ─────────────────────────────────────────────
   База данных
───────────────────────────────────────────── */
let PARTS = {
    cpu: [
        // Intel LGA1700 — High
        { id: 'cpu1',  name: 'Intel Core i9-14900K',   brand: 'Intel', socket: 'LGA1700', tdp: 125, price: 185000, tier: 'high', cores: 24, freq: '3.2 ГГц' },
        { id: 'cpu2',  name: 'Intel Core i9-13900K',   brand: 'Intel', socket: 'LGA1700', tdp: 125, price: 165000, tier: 'high', cores: 24, freq: '3.0 ГГц' },
        { id: 'cpu3',  name: 'Intel Core i7-14700K',   brand: 'Intel', socket: 'LGA1700', tdp: 125, price: 135000, tier: 'high', cores: 20, freq: '3.4 ГГц' },
        { id: 'cpu4',  name: 'Intel Core i7-13700K',   brand: 'Intel', socket: 'LGA1700', tdp: 125, price: 115000, tier: 'high', cores: 16, freq: '3.4 ГГц' },
        // Intel LGA1700 — Mid
        { id: 'cpu5',  name: 'Intel Core i5-14600K',   brand: 'Intel', socket: 'LGA1700', tdp: 125, price: 90000,  tier: 'mid',  cores: 14, freq: '3.5 ГГц' },
        { id: 'cpu6',  name: 'Intel Core i5-13600K',   brand: 'Intel', socket: 'LGA1700', tdp: 125, price: 79000,  tier: 'mid',  cores: 14, freq: '3.5 ГГц' },
        { id: 'cpu7',  name: 'Intel Core i5-14400F',   brand: 'Intel', socket: 'LGA1700', tdp: 65,  price: 62000,  tier: 'mid',  cores: 10, freq: '2.5 ГГц' },
        { id: 'cpu8',  name: 'Intel Core i5-13400F',   brand: 'Intel', socket: 'LGA1700', tdp: 65,  price: 55000,  tier: 'mid',  cores: 10, freq: '2.5 ГГц' },
        { id: 'cpu9',  name: 'Intel Core i5-12400F',   brand: 'Intel', socket: 'LGA1700', tdp: 65,  price: 42000,  tier: 'mid',  cores: 6,  freq: '2.5 ГГц' },
        // Intel LGA1700 — Low
        { id: 'cpu10', name: 'Intel Core i3-14100',    brand: 'Intel', socket: 'LGA1700', tdp: 60,  price: 34000,  tier: 'low',  cores: 4,  freq: '3.5 ГГц' },
        { id: 'cpu11', name: 'Intel Core i3-13100',    brand: 'Intel', socket: 'LGA1700', tdp: 60,  price: 30000,  tier: 'low',  cores: 4,  freq: '3.4 ГГц' },
        { id: 'cpu12', name: 'Intel Core i3-12100F',   brand: 'Intel', socket: 'LGA1700', tdp: 58,  price: 24000,  tier: 'low',  cores: 4,  freq: '3.3 ГГц' },
        { id: 'cpu13', name: 'Intel Pentium G7400',    brand: 'Intel', socket: 'LGA1700', tdp: 46,  price: 15000,  tier: 'low',  cores: 2,  freq: '3.7 ГГц' },
        // AMD AM5 — High
        { id: 'cpu14', name: 'AMD Ryzen 9 7950X',      brand: 'AMD',   socket: 'AM5',     tdp: 170, price: 200000, tier: 'high', cores: 16, freq: '4.5 ГГц' },
        { id: 'cpu15', name: 'AMD Ryzen 9 7900X',      brand: 'AMD',   socket: 'AM5',     tdp: 170, price: 145000, tier: 'high', cores: 12, freq: '4.7 ГГц' },
        { id: 'cpu16', name: 'AMD Ryzen 9 7900',       brand: 'AMD',   socket: 'AM5',     tdp: 65,  price: 120000, tier: 'high', cores: 12, freq: '3.7 ГГц' },
        { id: 'cpu17', name: 'AMD Ryzen 7 7800X3D',    brand: 'AMD',   socket: 'AM5',     tdp: 120, price: 130000, tier: 'high', cores: 8,  freq: '4.5 ГГц' },
        // AMD AM5 — Mid
        { id: 'cpu18', name: 'AMD Ryzen 7 7700X',      brand: 'AMD',   socket: 'AM5',     tdp: 105, price: 100000, tier: 'mid',  cores: 8,  freq: '4.5 ГГц' },
        { id: 'cpu19', name: 'AMD Ryzen 7 7700',       brand: 'AMD',   socket: 'AM5',     tdp: 65,  price: 88000,  tier: 'mid',  cores: 8,  freq: '3.8 ГГц' },
        { id: 'cpu20', name: 'AMD Ryzen 5 7600X',      brand: 'AMD',   socket: 'AM5',     tdp: 105, price: 72000,  tier: 'mid',  cores: 6,  freq: '4.7 ГГц' },
        { id: 'cpu21', name: 'AMD Ryzen 5 7600',       brand: 'AMD',   socket: 'AM5',     tdp: 65,  price: 60000,  tier: 'mid',  cores: 6,  freq: '3.8 ГГц' },
        // AMD AM4 — Mid
        { id: 'cpu22', name: 'AMD Ryzen 7 5800X',      brand: 'AMD',   socket: 'AM4',     tdp: 105, price: 72000,  tier: 'mid',  cores: 8,  freq: '3.8 ГГц' },
        { id: 'cpu23', name: 'AMD Ryzen 7 5700X',      brand: 'AMD',   socket: 'AM4',     tdp: 65,  price: 58000,  tier: 'mid',  cores: 8,  freq: '3.4 ГГц' },
        { id: 'cpu24', name: 'AMD Ryzen 5 5600X',      brand: 'AMD',   socket: 'AM4',     tdp: 65,  price: 50000,  tier: 'mid',  cores: 6,  freq: '3.7 ГГц' },
        { id: 'cpu25', name: 'AMD Ryzen 5 5600',       brand: 'AMD',   socket: 'AM4',     tdp: 65,  price: 42000,  tier: 'mid',  cores: 6,  freq: '3.5 ГГц' },
        // AMD AM4 — Low
        { id: 'cpu26', name: 'AMD Ryzen 5 5500',       brand: 'AMD',   socket: 'AM4',     tdp: 65,  price: 30000,  tier: 'low',  cores: 6,  freq: '3.6 ГГц' },
        { id: 'cpu27', name: 'AMD Ryzen 5 4600G',      brand: 'AMD',   socket: 'AM4',     tdp: 65,  price: 26000,  tier: 'low',  cores: 6,  freq: '3.7 ГГц' },
        { id: 'cpu28', name: 'AMD Ryzen 3 4100',       brand: 'AMD',   socket: 'AM4',     tdp: 65,  price: 18000,  tier: 'low',  cores: 4,  freq: '3.8 ГГц' },
        { id: 'cpu29', name: 'AMD Athlon 3000G',       brand: 'AMD',   socket: 'AM4',     tdp: 35,  price: 12000,  tier: 'low',  cores: 2,  freq: '3.5 ГГц' },
    ],
    motherboard: [
        // LGA1700 DDR5 — High
        { id: 'mb1',  name: 'ASUS ROG Maximus Z790 Hero',  brand: 'ASUS',     socket: 'LGA1700', memType: 'DDR5', formFactor: 'ATX',  price: 175000 },
        { id: 'mb2',  name: 'MSI MEG Z790 ACE',            brand: 'MSI',      socket: 'LGA1700', memType: 'DDR5', formFactor: 'ATX',  price: 145000 },
        { id: 'mb3',  name: 'Gigabyte Z790 AORUS Master',  brand: 'Gigabyte', socket: 'LGA1700', memType: 'DDR5', formFactor: 'ATX',  price: 120000 },
        // LGA1700 DDR5 — Mid
        { id: 'mb4',  name: 'MSI MAG Z790 Tomahawk',       brand: 'MSI',      socket: 'LGA1700', memType: 'DDR5', formFactor: 'ATX',  price: 90000  },
        { id: 'mb5',  name: 'ASUS TUF Gaming Z790-Plus',   brand: 'ASUS',     socket: 'LGA1700', memType: 'DDR5', formFactor: 'ATX',  price: 80000  },
        { id: 'mb6',  name: 'Gigabyte B760 AORUS Elite',   brand: 'Gigabyte', socket: 'LGA1700', memType: 'DDR5', formFactor: 'ATX',  price: 60000  },
        { id: 'mb7',  name: 'MSI PRO B760M-A DDR5',        brand: 'MSI',      socket: 'LGA1700', memType: 'DDR5', formFactor: 'mATX', price: 42000  },
        // LGA1700 DDR4 — Mid/Low
        { id: 'mb8',  name: 'ASRock B760M Pro RS DDR4',    brand: 'ASRock',   socket: 'LGA1700', memType: 'DDR4', formFactor: 'mATX', price: 38000  },
        { id: 'mb9',  name: 'Gigabyte B760M DS3H DDR4',    brand: 'Gigabyte', socket: 'LGA1700', memType: 'DDR4', formFactor: 'mATX', price: 32000  },
        { id: 'mb10', name: 'MSI PRO H610M-G DDR4',        brand: 'MSI',      socket: 'LGA1700', memType: 'DDR4', formFactor: 'mATX', price: 24000  },
        { id: 'mb11', name: 'Gigabyte H610M S2H DDR4',     brand: 'Gigabyte', socket: 'LGA1700', memType: 'DDR4', formFactor: 'mATX', price: 18000  },
        // AM5 DDR5 — High
        { id: 'mb12', name: 'ASUS ROG Crosshair X670E',    brand: 'ASUS',     socket: 'AM5',     memType: 'DDR5', formFactor: 'ATX',  price: 185000 },
        { id: 'mb13', name: 'MSI MEG X670E ACE',           brand: 'MSI',      socket: 'AM5',     memType: 'DDR5', formFactor: 'ATX',  price: 165000 },
        // AM5 DDR5 — Mid
        { id: 'mb14', name: 'Gigabyte B650 AORUS Elite',   brand: 'Gigabyte', socket: 'AM5',     memType: 'DDR5', formFactor: 'ATX',  price: 75000  },
        { id: 'mb15', name: 'MSI MAG B650 Tomahawk',       brand: 'MSI',      socket: 'AM5',     memType: 'DDR5', formFactor: 'ATX',  price: 68000  },
        { id: 'mb16', name: 'ASUS TUF Gaming B650-Plus',   brand: 'ASUS',     socket: 'AM5',     memType: 'DDR5', formFactor: 'ATX',  price: 58000  },
        { id: 'mb17', name: 'ASRock B650M Pro RS',         brand: 'ASRock',   socket: 'AM5',     memType: 'DDR5', formFactor: 'mATX', price: 44000  },
        { id: 'mb18', name: 'Gigabyte A620M DS3H',         brand: 'Gigabyte', socket: 'AM5',     memType: 'DDR5', formFactor: 'mATX', price: 30000  },
        // AM4 DDR4 — Mid
        { id: 'mb19', name: 'ASUS ROG Strix X570-E',       brand: 'ASUS',     socket: 'AM4',     memType: 'DDR4', formFactor: 'ATX',  price: 65000  },
        { id: 'mb20', name: 'MSI MAG X570S Tomahawk',      brand: 'MSI',      socket: 'AM4',     memType: 'DDR4', formFactor: 'ATX',  price: 55000  },
        { id: 'mb21', name: 'Gigabyte B550 AORUS Pro',     brand: 'Gigabyte', socket: 'AM4',     memType: 'DDR4', formFactor: 'ATX',  price: 45000  },
        { id: 'mb22', name: 'ASUS TUF Gaming B550-Plus',   brand: 'ASUS',     socket: 'AM4',     memType: 'DDR4', formFactor: 'ATX',  price: 38000  },
        // AM4 DDR4 — Low
        { id: 'mb23', name: 'MSI B450 Tomahawk MAX',       brand: 'MSI',      socket: 'AM4',     memType: 'DDR4', formFactor: 'ATX',  price: 30000  },
        { id: 'mb24', name: 'ASUS Prime B550M-A',          brand: 'ASUS',     socket: 'AM4',     memType: 'DDR4', formFactor: 'mATX', price: 26000  },
        { id: 'mb25', name: 'Gigabyte B450M DS3H',         brand: 'Gigabyte', socket: 'AM4',     memType: 'DDR4', formFactor: 'mATX', price: 18000  },
        { id: 'mb26', name: 'ASRock A520M-HVS',            brand: 'ASRock',   socket: 'AM4',     memType: 'DDR4', formFactor: 'mATX', price: 12000  },
    ],
    ram: [
        // DDR5 — High
        { id: 'ram1',  name: 'Corsair Dominator Platinum DDR5 64GB', brand: 'Corsair',  type: 'DDR5', capacity: 64, speed: 5600, price: 90000 },
        { id: 'ram2',  name: 'G.Skill Trident Z5 RGB DDR5 32GB',     brand: 'G.Skill',  type: 'DDR5', capacity: 32, speed: 6000, price: 55000 },
        { id: 'ram3',  name: 'Kingston Fury Renegade DDR5 32GB',      brand: 'Kingston', type: 'DDR5', capacity: 32, speed: 6000, price: 50000 },
        // DDR5 — Mid
        { id: 'ram4',  name: 'Crucial Pro DDR5 32GB',                 brand: 'Crucial',  type: 'DDR5', capacity: 32, speed: 5600, price: 38000 },
        { id: 'ram5',  name: 'Kingston Fury Beast DDR5 16GB',         brand: 'Kingston', type: 'DDR5', capacity: 16, speed: 5200, price: 28000 },
        { id: 'ram6',  name: 'Corsair Vengeance DDR5 16GB',           brand: 'Corsair',  type: 'DDR5', capacity: 16, speed: 4800, price: 23000 },
        // DDR5 — Low
        { id: 'ram7',  name: 'TeamGroup Elite DDR5 16GB',             brand: 'TeamGroup',type: 'DDR5', capacity: 16, speed: 4800, price: 17000 },
        { id: 'ram8',  name: 'Crucial DDR5 8GB',                      brand: 'Crucial',  type: 'DDR5', capacity: 8,  speed: 4800, price: 10000 },
        // DDR4 — High
        { id: 'ram9',  name: 'G.Skill Trident Z RGB DDR4 32GB',       brand: 'G.Skill',  type: 'DDR4', capacity: 32, speed: 3600, price: 35000 },
        { id: 'ram10', name: 'Corsair Vengeance RGB DDR4 32GB',        brand: 'Corsair',  type: 'DDR4', capacity: 32, speed: 3600, price: 30000 },
        { id: 'ram11', name: 'Kingston Fury Beast DDR4 32GB',          brand: 'Kingston', type: 'DDR4', capacity: 32, speed: 3200, price: 25000 },
        // DDR4 — Mid
        { id: 'ram12', name: 'G.Skill Ripjaws V DDR4 16GB',            brand: 'G.Skill',  type: 'DDR4', capacity: 16, speed: 3600, price: 19000 },
        { id: 'ram13', name: 'Corsair Vengeance DDR4 16GB',            brand: 'Corsair',  type: 'DDR4', capacity: 16, speed: 3200, price: 16000 },
        { id: 'ram14', name: 'Kingston Fury Beast DDR4 16GB',          brand: 'Kingston', type: 'DDR4', capacity: 16, speed: 3200, price: 14000 },
        // DDR4 — Low
        { id: 'ram15', name: 'Crucial Ballistix DDR4 8GB',             brand: 'Crucial',  type: 'DDR4', capacity: 8,  speed: 3200, price: 9000  },
        { id: 'ram16', name: 'Kingston ValueRAM DDR4 8GB',             brand: 'Kingston', type: 'DDR4', capacity: 8,  speed: 2666, price: 7000  },
        { id: 'ram17', name: 'Hynix Original DDR4 4GB',                brand: 'Hynix',    type: 'DDR4', capacity: 4,  speed: 2400, price: 4500  },
    ],
    gpu: [
        // NVIDIA — Ultra High
        { id: 'gpu1',  name: 'NVIDIA RTX 4090 24GB',        brand: 'NVIDIA', vram: 24, tdp: 450, price: 540000, tier: 'high' },
        { id: 'gpu2',  name: 'NVIDIA RTX 4080 Super 16GB',  brand: 'NVIDIA', vram: 16, tdp: 320, price: 330000, tier: 'high' },
        { id: 'gpu3',  name: 'NVIDIA RTX 4080 16GB',        brand: 'NVIDIA', vram: 16, tdp: 320, price: 290000, tier: 'high' },
        // NVIDIA — High
        { id: 'gpu4',  name: 'NVIDIA RTX 4070 Ti Super',    brand: 'NVIDIA', vram: 16, tdp: 285, price: 250000, tier: 'high' },
        { id: 'gpu5',  name: 'NVIDIA RTX 4070 Ti',          brand: 'NVIDIA', vram: 12, tdp: 285, price: 220000, tier: 'high' },
        { id: 'gpu6',  name: 'NVIDIA RTX 4070 Super',       brand: 'NVIDIA', vram: 12, tdp: 220, price: 185000, tier: 'high' },
        { id: 'gpu7',  name: 'NVIDIA RTX 3080 10GB',        brand: 'NVIDIA', vram: 10, tdp: 320, price: 155000, tier: 'high' },
        // NVIDIA — Mid
        { id: 'gpu8',  name: 'NVIDIA RTX 4070',             brand: 'NVIDIA', vram: 12, tdp: 200, price: 145000, tier: 'mid' },
        { id: 'gpu9',  name: 'NVIDIA RTX 4060 Ti 16GB',     brand: 'NVIDIA', vram: 16, tdp: 165, price: 135000, tier: 'mid' },
        { id: 'gpu10', name: 'NVIDIA RTX 4060 Ti 8GB',      brand: 'NVIDIA', vram: 8,  tdp: 165, price: 115000, tier: 'mid' },
        { id: 'gpu11', name: 'NVIDIA RTX 3070',             brand: 'NVIDIA', vram: 8,  tdp: 220, price: 105000, tier: 'mid' },
        { id: 'gpu12', name: 'NVIDIA RTX 4060',             brand: 'NVIDIA', vram: 8,  tdp: 115, price: 98000,  tier: 'mid' },
        { id: 'gpu13', name: 'NVIDIA RTX 3060 12GB',        brand: 'NVIDIA', vram: 12, tdp: 170, price: 78000,  tier: 'mid' },
        // NVIDIA — Low/Budget
        { id: 'gpu14', name: 'NVIDIA RTX 3060 Ti',          brand: 'NVIDIA', vram: 8,  tdp: 200, price: 90000,  tier: 'mid' },
        { id: 'gpu15', name: 'NVIDIA RTX 4050 Laptop',      brand: 'NVIDIA', vram: 6,  tdp: 115, price: 68000,  tier: 'mid' },
        { id: 'gpu16', name: 'NVIDIA GTX 1660 Super',       brand: 'NVIDIA', vram: 6,  tdp: 125, price: 48000,  tier: 'low' },
        { id: 'gpu17', name: 'NVIDIA GTX 1650',             brand: 'NVIDIA', vram: 4,  tdp: 75,  price: 32000,  tier: 'low' },
        // AMD — High
        { id: 'gpu18', name: 'AMD RX 7900 XTX 24GB',        brand: 'AMD',    vram: 24, tdp: 355, price: 310000, tier: 'high' },
        { id: 'gpu19', name: 'AMD RX 7900 XT 20GB',         brand: 'AMD',    vram: 20, tdp: 315, price: 265000, tier: 'high' },
        { id: 'gpu20', name: 'AMD RX 7800 XT 16GB',         brand: 'AMD',    vram: 16, tdp: 263, price: 155000, tier: 'mid' },
        // AMD — Mid
        { id: 'gpu21', name: 'AMD RX 7700 XT 12GB',         brand: 'AMD',    vram: 12, tdp: 245, price: 115000, tier: 'mid' },
        { id: 'gpu22', name: 'AMD RX 6800 XT 16GB',         brand: 'AMD',    vram: 16, tdp: 300, price: 110000, tier: 'mid' },
        { id: 'gpu23', name: 'AMD RX 7600 8GB',             brand: 'AMD',    vram: 8,  tdp: 165, price: 80000,  tier: 'mid' },
        { id: 'gpu24', name: 'AMD RX 6700 XT 12GB',         brand: 'AMD',    vram: 12, tdp: 230, price: 75000,  tier: 'mid' },
        // AMD — Low
        { id: 'gpu25', name: 'AMD RX 6600 8GB',             brand: 'AMD',    vram: 8,  tdp: 132, price: 58000,  tier: 'low' },
        { id: 'gpu26', name: 'AMD RX 6500 XT 4GB',          brand: 'AMD',    vram: 4,  tdp: 107, price: 36000,  tier: 'low' },
        { id: 'gpu27', name: 'AMD RX 6400 4GB',             brand: 'AMD',    vram: 4,  tdp: 53,  price: 25000,  tier: 'low' },
        // Intel Arc
        { id: 'gpu28', name: 'Intel Arc A770 16GB',         brand: 'Intel',  vram: 16, tdp: 225, price: 72000,  tier: 'mid' },
        { id: 'gpu29', name: 'Intel Arc A750 8GB',          brand: 'Intel',  vram: 8,  tdp: 225, price: 55000,  tier: 'mid' },
        { id: 'gpu30', name: 'Intel Arc A580 8GB',          brand: 'Intel',  vram: 8,  tdp: 185, price: 42000,  tier: 'low' },
    ],
    storage: [
        // NVMe Gen5 / Gen4 — High
        { id: 'ssd1',  name: 'Samsung 990 Pro 2TB NVMe',       brand: 'Samsung',  type: 'NVMe', capacity: '2 ТБ',   read: 7450, price: 58000 },
        { id: 'ssd2',  name: 'Samsung 990 Pro 1TB NVMe',       brand: 'Samsung',  type: 'NVMe', capacity: '1 ТБ',   read: 7450, price: 34000 },
        { id: 'ssd3',  name: 'WD Black SN850X 2TB NVMe',       brand: 'WD',       type: 'NVMe', capacity: '2 ТБ',   read: 7300, price: 52000 },
        { id: 'ssd4',  name: 'WD Black SN850X 1TB NVMe',       brand: 'WD',       type: 'NVMe', capacity: '1 ТБ',   read: 7300, price: 30000 },
        { id: 'ssd5',  name: 'Seagate FireCuda 530 2TB NVMe',  brand: 'Seagate',  type: 'NVMe', capacity: '2 ТБ',   read: 7300, price: 50000 },
        { id: 'ssd6',  name: 'Seagate FireCuda 530 1TB NVMe',  brand: 'Seagate',  type: 'NVMe', capacity: '1 ТБ',   read: 7300, price: 28000 },
        // NVMe Gen3 — Mid
        { id: 'ssd7',  name: 'Kingston NV3 2TB NVMe',          brand: 'Kingston', type: 'NVMe', capacity: '2 ТБ',   read: 6000, price: 28000 },
        { id: 'ssd8',  name: 'Kingston NV3 1TB NVMe',          brand: 'Kingston', type: 'NVMe', capacity: '1 ТБ',   read: 6000, price: 16000 },
        { id: 'ssd9',  name: 'Crucial P3 Plus 1TB NVMe',       brand: 'Crucial',  type: 'NVMe', capacity: '1 ТБ',   read: 5000, price: 14000 },
        { id: 'ssd10', name: 'Kingston NV2 500GB NVMe',        brand: 'Kingston', type: 'NVMe', capacity: '500 ГБ', read: 3500, price: 9500  },
        { id: 'ssd11', name: 'Crucial P3 500GB NVMe',          brand: 'Crucial',  type: 'NVMe', capacity: '500 ГБ', read: 3500, price: 8500  },
        // SATA SSD
        { id: 'ssd12', name: 'Samsung 870 EVO 2TB SATA',       brand: 'Samsung',  type: 'SATA', capacity: '2 ТБ',   read: 560,  price: 42000 },
        { id: 'ssd13', name: 'Samsung 870 EVO 1TB SATA',       brand: 'Samsung',  type: 'SATA', capacity: '1 ТБ',   read: 560,  price: 24000 },
        { id: 'ssd14', name: 'Crucial MX500 1TB SATA',         brand: 'Crucial',  type: 'SATA', capacity: '1 ТБ',   read: 560,  price: 18000 },
        { id: 'ssd15', name: 'Kingston A400 480GB SATA',       brand: 'Kingston', type: 'SATA', capacity: '480 ГБ', read: 500,  price: 9000  },
        // HDD
        { id: 'hdd1',  name: 'Seagate Barracuda 4TB HDD',      brand: 'Seagate',  type: 'HDD',  capacity: '4 ТБ',   read: 210,  price: 22000 },
        { id: 'hdd2',  name: 'Seagate Barracuda 2TB HDD',      brand: 'Seagate',  type: 'HDD',  capacity: '2 ТБ',   read: 210,  price: 14000 },
        { id: 'hdd3',  name: 'WD Blue 4TB HDD',                brand: 'WD',       type: 'HDD',  capacity: '4 ТБ',   read: 180,  price: 24000 },
        { id: 'hdd4',  name: 'WD Blue 1TB HDD',                brand: 'WD',       type: 'HDD',  capacity: '1 ТБ',   read: 180,  price: 9000  },
        { id: 'hdd5',  name: 'Toshiba P300 2TB HDD',           brand: 'Toshiba',  type: 'HDD',  capacity: '2 ТБ',   read: 210,  price: 11000 },
    ],
    psu: [
        // 1000W+
        { id: 'psu1',  name: 'Seasonic Prime TX-1000',        brand: 'Seasonic',     wattage: 1000, eff: '80+ Titanium', price: 74000 },
        { id: 'psu2',  name: 'Corsair RM1000x',               brand: 'Corsair',      wattage: 1000, eff: '80+ Gold',     price: 56000 },
        { id: 'psu3',  name: 'be quiet! Straight Power 1000W',brand: 'be quiet!',    wattage: 1000, eff: '80+ Platinum',  price: 62000 },
        // 850W
        { id: 'psu4',  name: 'be quiet! Dark Power 850W',     brand: 'be quiet!',    wattage: 850,  eff: '80+ Titanium', price: 65000 },
        { id: 'psu5',  name: 'Seasonic Focus GX-850',         brand: 'Seasonic',     wattage: 850,  eff: '80+ Gold',     price: 48000 },
        { id: 'psu6',  name: 'Corsair RM850x',                brand: 'Corsair',      wattage: 850,  eff: '80+ Gold',     price: 45000 },
        { id: 'psu7',  name: 'EVGA SuperNOVA 850 G6',         brand: 'EVGA',         wattage: 850,  eff: '80+ Gold',     price: 42000 },
        // 750W
        { id: 'psu8',  name: 'Seasonic Focus GX-750',         brand: 'Seasonic',     wattage: 750,  eff: '80+ Gold',     price: 38000 },
        { id: 'psu9',  name: 'Corsair RM750x',                brand: 'Corsair',      wattage: 750,  eff: '80+ Gold',     price: 36000 },
        { id: 'psu10', name: 'EVGA SuperNOVA 750 G6',         brand: 'EVGA',         wattage: 750,  eff: '80+ Gold',     price: 34000 },
        { id: 'psu11', name: 'be quiet! Pure Power 12 750W',  brand: 'be quiet!',    wattage: 750,  eff: '80+ Gold',     price: 30000 },
        // 650W
        { id: 'psu12', name: 'Corsair CX750M',                brand: 'Corsair',      wattage: 650,  eff: '80+ Bronze',   price: 24000 },
        { id: 'psu13', name: 'DeepCool PQ650M',               brand: 'DeepCool',     wattage: 650,  eff: '80+ Gold',     price: 22000 },
        { id: 'psu14', name: 'Chieftec Polaris 650W',         brand: 'Chieftec',     wattage: 650,  eff: '80+ Gold',     price: 18000 },
        // 550W
        { id: 'psu15', name: 'Cooler Master MWE 550W',        brand: 'Cooler Master',wattage: 550,  eff: '80+ Bronze',   price: 14500 },
        { id: 'psu16', name: 'be quiet! System Power 550W',   brand: 'be quiet!',    wattage: 550,  eff: '80+ Bronze',   price: 13000 },
        { id: 'psu17', name: 'Chieftec Smart 550W',           brand: 'Chieftec',     wattage: 550,  eff: '80+ Bronze',   price: 11000 },
        // 450W — бюджет
        { id: 'psu18', name: 'Cooler Master Elite 450W',      brand: 'Cooler Master',wattage: 450,  eff: '80+ Bronze',   price: 9000  },
        { id: 'psu19', name: 'AeroCool VX Plus 400W',         brand: 'AeroCool',     wattage: 400,  eff: '80+',           price: 6500  },
        { id: 'psu20', name: 'Thermaltake Litepower 350W',    brand: 'Thermaltake',  wattage: 350,  eff: '80+',           price: 5000  },
    ],
    cooler: [
        // AIO 360mm
        { id: 'cool1',  name: 'ARCTIC Liquid Freezer II 360',  brand: 'ARCTIC',      type: 'AIO', tdpSupport: 300, sockets: ['LGA1700','AM5','AM4'], price: 35000 },
        { id: 'cool2',  name: 'Corsair iCUE H150i Elite',      brand: 'Corsair',     type: 'AIO', tdpSupport: 280, sockets: ['LGA1700','AM5','AM4'], price: 50000 },
        { id: 'cool3',  name: 'NZXT Kraken Z73 360mm',         brand: 'NZXT',        type: 'AIO', tdpSupport: 280, sockets: ['LGA1700','AM5','AM4'], price: 48000 },
        // AIO 240mm
        { id: 'cool4',  name: 'ARCTIC Liquid Freezer II 240',  brand: 'ARCTIC',      type: 'AIO', tdpSupport: 250, sockets: ['LGA1700','AM5','AM4'], price: 23000 },
        { id: 'cool5',  name: 'Corsair iCUE H100i RGB',        brand: 'Corsair',     type: 'AIO', tdpSupport: 250, sockets: ['LGA1700','AM5','AM4'], price: 32000 },
        { id: 'cool6',  name: 'DeepCool LT520',                brand: 'DeepCool',    type: 'AIO', tdpSupport: 250, sockets: ['LGA1700','AM5','AM4'], price: 19000 },
        { id: 'cool7',  name: 'NZXT Kraken X63 280mm',         brand: 'NZXT',        type: 'AIO', tdpSupport: 250, sockets: ['LGA1700','AM5','AM4'], price: 37000 },
        // Air — High-end
        { id: 'cool8',  name: 'Noctua NH-D15',                 brand: 'Noctua',      type: 'Air', tdpSupport: 250, sockets: ['LGA1700','AM5','AM4'], price: 31000 },
        { id: 'cool9',  name: 'be quiet! Dark Rock Pro 4',     brand: 'be quiet!',   type: 'Air', tdpSupport: 250, sockets: ['LGA1700','AM5','AM4'], price: 27000 },
        { id: 'cool10', name: 'Deepcool AK620',                brand: 'DeepCool',    type: 'Air', tdpSupport: 260, sockets: ['LGA1700','AM5','AM4'], price: 18000 },
        { id: 'cool11', name: 'Thermalright Peerless Assassin',brand: 'Thermalright', type: 'Air', tdpSupport: 260, sockets: ['LGA1700','AM5','AM4'], price: 14000 },
        // Air — Mid
        { id: 'cool12', name: 'Noctua NH-U12S Redux',          brand: 'Noctua',      type: 'Air', tdpSupport: 180, sockets: ['LGA1700','AM5','AM4'], price: 16000 },
        { id: 'cool13', name: 'DeepCool AG400',                brand: 'DeepCool',    type: 'Air', tdpSupport: 220, sockets: ['LGA1700','AM5','AM4'], price: 10000 },
        { id: 'cool14', name: 'ID-Cooling SE-224-XT',          brand: 'ID-Cooling',  type: 'Air', tdpSupport: 180, sockets: ['LGA1700','AM5','AM4'], price: 8000  },
        { id: 'cool15', name: 'Zalman CNPS10X Performa',       brand: 'Zalman',      type: 'Air', tdpSupport: 180, sockets: ['LGA1700','AM5','AM4'], price: 7500  },
        // Air — Budget
        { id: 'cool16', name: 'DeepCool Gammaxx 400',          brand: 'DeepCool',    type: 'Air', tdpSupport: 130, sockets: ['LGA1700','AM5','AM4'], price: 5500  },
        { id: 'cool17', name: 'Cooler Master Hyper 212',       brand: 'Cooler Master',type: 'Air', tdpSupport: 150, sockets: ['LGA1700','AM5','AM4'], price: 6500  },
        { id: 'cool18', name: 'Thermalright True Spirit 90',   brand: 'Thermalright', type: 'Air', tdpSupport: 120, sockets: ['LGA1700','AM5','AM4'], price: 4000  },
    ],
    case: [
        // Full/ATX — Premium
        { id: 'case1',  name: 'Lian Li PC-O11 Dynamic EVO',    brand: 'Lian Li',     formFactors: ['ATX','mATX'], maxGpuLen: 420, price: 50000 },
        { id: 'case2',  name: 'Fractal Design Torrent',         brand: 'Fractal',     formFactors: ['ATX','mATX'], maxGpuLen: 461, price: 45000 },
        { id: 'case3',  name: 'Corsair 5000D Airflow',          brand: 'Corsair',     formFactors: ['ATX','mATX'], maxGpuLen: 420, price: 42000 },
        // ATX — Mid
        { id: 'case4',  name: 'NZXT H7 Flow',                   brand: 'NZXT',        formFactors: ['ATX','mATX'], maxGpuLen: 400, price: 36000 },
        { id: 'case5',  name: 'be quiet! Pure Base 500DX',      brand: 'be quiet!',   formFactors: ['ATX','mATX'], maxGpuLen: 369, price: 30000 },
        { id: 'case6',  name: 'Fractal Design Meshify 2',       brand: 'Fractal',     formFactors: ['ATX','mATX'], maxGpuLen: 460, price: 35000 },
        { id: 'case7',  name: 'Deepcool CH510',                 brand: 'DeepCool',    formFactors: ['ATX','mATX'], maxGpuLen: 380, price: 20000 },
        { id: 'case8',  name: 'Antec P10 Flux',                 brand: 'Antec',       formFactors: ['ATX','mATX'], maxGpuLen: 370, price: 24000 },
        // mATX — Mid
        { id: 'case9',  name: 'Cooler Master MasterBox TD500',  brand: 'Cooler Master',formFactors: ['ATX','mATX'], maxGpuLen: 410, price: 22000 },
        { id: 'case10', name: 'DeepCool Matrexx 55',            brand: 'DeepCool',    formFactors: ['ATX','mATX'], maxGpuLen: 380, price: 15000 },
        // mATX/ITX — Budget
        { id: 'case11', name: 'CM MasterBox Q300L',             brand: 'Cooler Master',formFactors: ['mATX'],       maxGpuLen: 360, price: 12000 },
        { id: 'case12', name: 'AeroCool Aero One Mini',         brand: 'AeroCool',    formFactors: ['mATX'],       maxGpuLen: 350, price: 9000  },
        { id: 'case13', name: 'Zalman S3',                      brand: 'Zalman',      formFactors: ['ATX','mATX'], maxGpuLen: 340, price: 7500  },
        { id: 'case14', name: 'Thermaltake Versa H15',          brand: 'Thermaltake', formFactors: ['mATX'],       maxGpuLen: 320, price: 6000  },
    ]
};

/* ─────────────────────────────────────────────
   LOAD PARTS FROM ADMIN (localStorage override)
───────────────────────────────────────────── */
(function () {
    try {
        const stored = localStorage.getItem('koren_parts_db');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Merge: keep only categories that exist in DEFAULT, use stored data
            Object.keys(PARTS).forEach(key => {
                if (parsed[key] && Array.isArray(parsed[key])) {
                    PARTS[key] = parsed[key];
                }
            });
        }
    } catch (e) {
        console.warn('Не удалось загрузить данные из админ-панели:', e);
    }
})();

const SLOT_META = [
    { key: 'cpu', label: 'Процессор', icon: '🔲', cls: 'ic-cpu', required: true },
    { key: 'motherboard', label: 'Материнская плата', icon: '🟦', cls: 'ic-mb', required: true },
    { key: 'ram', label: 'Оперативная память', icon: '📊', cls: 'ic-ram', required: true },
    { key: 'gpu', label: 'Видеокарта', icon: '🎮', cls: 'ic-gpu', required: false },
    { key: 'storage', label: 'Накопитель', icon: '💾', cls: 'ic-storage', required: true },
    { key: 'psu', label: 'Блок питания', icon: '⚡', cls: 'ic-psu', required: true },
    { key: 'cooler', label: 'Охлаждение', icon: '❄️', cls: 'ic-cooler', required: false },
    { key: 'case', label: 'Корпус', icon: '🖥️', cls: 'ic-case', required: false },
];

/* ─────────────────────────────────────────────
   STATE
───────────────────────────────────────────── */
const state = {
    user: null,
    selection: { cpu: null, motherboard: null, ram: null, gpu: null, storage: null, psu: null, cooler: null, case: null },
    openSlot: null,
    budgetResult: null,
};

/* ─────────────────────────────────────────────
   COMPATIBILITY ENGINE
───────────────────────────────────────────── */
const COMPAT = {
    check(sel) {
        const issues = [];
        const { cpu, motherboard, ram, gpu, psu, cooler } = sel;

        // Материнка - ЦПУ
        if (cpu && motherboard && cpu.socket !== motherboard.socket)
            issues.push(`Сокет CPU (${cpu.socket}) не совместим с материнской платой (${motherboard.socket})`);

        // Материнка - оперативка
        if (motherboard && ram && ram.type !== motherboard.memType)
            issues.push(`Тип памяти ${ram.type} не поддерживается материнской платой (требуется ${motherboard.memType})`);
        // Мало Вт
        if (psu) {
            const needed = this.calcTdp(sel);
            const recommended = Math.ceil(needed * 1.25);
            if (psu.wattage < needed)
                issues.push(`БП ${psu.wattage}Вт не хватает — системе требуется ~${needed}Вт`);
            else if (psu.wattage < recommended)
                issues.push(`Рекомендуется БП от ${recommended}Вт (запас 25%)`);
        }

        // Кулер - Сокет
        if (cooler && cpu && !cooler.sockets.includes(cpu.socket))
            issues.push(`Кулер не поддерживает сокет ${cpu.socket}`);

        // Поддержка более высокого TDP кулера
        if (cooler && cpu && cpu.tdp > cooler.tdpSupport)
            issues.push(`TDP кулера (${cooler.tdpSupport}Вт) меньше TDP процессора (${cpu.tdp}Вт)`);

        return issues;
    },

    calcTdp(sel) {
        let t = 75;
        if (sel.cpu) t += sel.cpu.tdp;
        if (sel.gpu) t += sel.gpu.tdp;
        return t;
    },

    isCompatibleWith(partKey, part, sel) {
        const test = { ...sel, [partKey]: part };
        const issues = this.check(test);

        const myIssues = issues.filter(i => {
            const lc = i.toLowerCase();
            if (partKey === 'cpu') return lc.includes('сокет') || lc.includes('tdp кулера') || lc.includes('процессора');
            if (partKey === 'motherboard') return lc.includes('сокет') || lc.includes('тип памяти');
            if (partKey === 'ram') return lc.includes('тип памяти');
            if (partKey === 'psu') return lc.includes('бп') || lc.includes('рекомендуется');
            if (partKey === 'cooler') return lc.includes('кулер');
            return false;
        });
        return myIssues.length === 0;
    }
};

const BUDGET = {
    build(totalBudget, priority) {
        const weights = {
            gaming:      { cpu: 0.17, motherboard: 0.10, ram: 0.07, gpu: 0.38, storage: 0.07, psu: 0.08, cooler: 0.07, case: 0.06 },
            workstation: { cpu: 0.26, motherboard: 0.12, ram: 0.15, gpu: 0.18, storage: 0.12, psu: 0.08, cooler: 0.05, case: 0.04 },
            balanced:    { cpu: 0.20, motherboard: 0.11, ram: 0.09, gpu: 0.28, storage: 0.09, psu: 0.09, cooler: 0.08, case: 0.06 },
            budget:      { cpu: 0.19, motherboard: 0.11, ram: 0.09, gpu: 0.30, storage: 0.10, psu: 0.10, cooler: 0.07, case: 0.04 },
        };
        const w = weights[priority] || weights.balanced;


        const strictPick = (key, hardLimit) => {
            const sorted = PARTS[key].slice().sort((a, b) => b.price - a.price);
            return sorted.find(p => p.price <= hardLimit) || PARTS[key].slice().sort((a, b) => a.price - b.price)[0];
        };

        const result = {};
        let remaining = totalBudget;

        // ЦПУ
        result.cpu = strictPick('cpu', Math.floor(totalBudget * w.cpu));
        remaining -= result.cpu.price;

        //Материнская плата (должна соответствовать разъему процессора)
        const mbAlloc = Math.floor(totalBudget * w.motherboard);
        const mbLimit = Math.min(mbAlloc, remaining - 1); // never exceed remaining
        const compatMbs = PARTS.motherboard
            .filter(mb => mb.socket === result.cpu.socket)
            .sort((a, b) => b.price - a.price);
        result.motherboard = compatMbs.find(mb => mb.price <= mbLimit)
            || compatMbs[compatMbs.length - 1]; // cheapest compatible
        remaining -= result.motherboard.price;

        // Оперативная память (должна соответствовать типу памяти в МБ)
        const ramLimit = Math.min(Math.floor(totalBudget * w.ram), remaining - 1);
        const compatRams = PARTS.ram
            .filter(r => r.type === result.motherboard.memType)
            .sort((a, b) => b.price - a.price);
        result.ram = compatRams.find(r => r.price <= ramLimit)
            || compatRams[compatRams.length - 1];
        remaining -= result.ram.price;

        // SSD
        const storLimit = Math.min(Math.floor(totalBudget * w.storage), remaining - 1);
        result.storage = strictPick('storage', storLimit);
        remaining -= result.storage.price;

        // Корпус
        const caseLimit = Math.min(Math.floor(totalBudget * w.case), remaining - 1);
        result.case = strictPick('case', caseLimit);
        remaining -= result.case.price;

        // Кулер (должен подходить к процессорному разъему и иметь соответствующее значение TDP)
        const coolerLimit = Math.min(Math.floor(totalBudget * w.cooler), remaining - 1);
        const compatCoolers = PARTS.cooler
            .filter(c => c.sockets.includes(result.cpu.socket) && c.tdpSupport >= result.cpu.tdp)
            .sort((a, b) => b.price - a.price);
        result.cooler = compatCoolers.find(c => c.price <= coolerLimit)
            || compatCoolers[compatCoolers.length - 1]
            || PARTS.cooler.filter(c => c.sockets.includes(result.cpu.socket)).sort((a,b) => a.price - b.price)[0];
        remaining -= result.cooler.price;

        // Блок питания (должен выдерживать системное тепловыделение + 30% запаса мощности)
        const tdpWithoutGpu = 75 + result.cpu.tdp;
        const minPsuWatts = Math.ceil(tdpWithoutGpu * 1.3);
        const gpuAlloc = Math.floor(totalBudget * w.gpu);
        const psuAlloc = Math.floor(totalBudget * w.psu);

        const gpuBudget = Math.min(gpuAlloc, remaining - psuAlloc - 1);
        result.gpu = null;
        if (gpuBudget > 0) {
            const affordableGpu = PARTS.gpu.filter(g => g.price <= gpuBudget).sort((a, b) => b.price - a.price);
            if (affordableGpu.length) result.gpu = affordableGpu[0];
        }
        const sysTdp = COMPAT.calcTdp(result);
        const psuNeeded = Math.ceil(sysTdp * 1.3);
        const psuLimit = Math.min(psuAlloc, remaining - (result.gpu ? result.gpu.price : 0) - 1);
        const adequatePsus = PARTS.psu
            .filter(p => p.wattage >= psuNeeded)
            .sort((a, b) => a.price - b.price);
        result.psu = adequatePsus.find(p => p.price <= psuLimit)
            || adequatePsus[0]
            || PARTS.psu.sort((a, b) => a.price - b.price)[0];
        remaining -= result.psu.price;
        if (result.gpu) remaining -= result.gpu.price;
        const TRIM_ORDER = [
            { key: 'case',    filter: () => PARTS.case.sort((a, b) => a.price - b.price) },
            { key: 'cooler',  filter: () => PARTS.cooler.filter(c => c.sockets.includes(result.cpu.socket) && c.tdpSupport >= result.cpu.tdp).sort((a, b) => a.price - b.price) },
            { key: 'storage', filter: () => PARTS.storage.sort((a, b) => a.price - b.price) },
            { key: 'ram',     filter: () => PARTS.ram.filter(r => r.type === result.motherboard.memType).sort((a, b) => a.price - b.price) },
            { key: 'gpu',     filter: () => result.gpu ? PARTS.gpu.filter(g => g.price < result.gpu.price).sort((a, b) => b.price - a.price) : [] },
        ];

        let total = () => Object.values(result).reduce((s, p) => s + (p ? p.price : 0), 0);

        for (const { key, filter } of TRIM_ORDER) {
            if (total() <= totalBudget) break;
            const current = result[key];
            if (!current) continue;
            const excess = total() - totalBudget;
            const cheaper = filter().find(p => p.id !== current.id && current.price - p.price >= excess);
            const anyCheaper = filter().find(p => p.id !== current.id && p.price < current.price);
            const replacement = cheaper || anyCheaper;
            if (replacement) result[key] = replacement;
            if (key === 'gpu') {
                const newTdp = COMPAT.calcTdp(result);
                const newNeeded = Math.ceil(newTdp * 1.3);
                if (result.psu && result.psu.wattage < newNeeded) {
                    const fix = PARTS.psu.filter(p => p.wattage >= newNeeded).sort((a, b) => a.price - b.price)[0];
                    if (fix) result.psu = fix;
                }
            }
        }

        if (total() > totalBudget && result.gpu) {
            result.gpu = null;
        }

        const spent = Object.values(result).reduce((s, p) => s + (p ? p.price : 0), 0);
        return { parts: result, spent };
    }
};

/* ─────────────────────────────────────────────
   Вход/Регистрация
───────────────────────────────────────────── */
const Auth = {
    register(username, email, password) {
        const users = DB.get('users', []);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Некорректный формат Email (например: user@mail.com)');
    }
        if (users.find(u => u.email === email)) throw new Error('Email уже зарегистрирован');
        if (users.find(u => u.username === username)) throw new Error('Имя пользователя занято');
        if (password.length < 6) throw new Error('Пароль минимум 6 символов');
        const user = {
            id: DB.uid(), username, email,
            password: DB.hash(password),
            avatar: username.slice(0, 2).toUpperCase(),
            createdAt: new Date().toISOString()
        };
        users.push(user);
        DB.set('users', users);
        return this._safe(user);
    },
    login(email, password) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(email)) {
        throw new Error('Некорректный формат Email (например: user@mail.com)');
    }
        const users = DB.get('users', []);
        const user = users.find(u => u.email === email && u.password === DB.hash(password));
        if (!user) throw new Error('Неверный email или пароль');
        return this._safe(user);
    },
    _safe(u) { const { password: _, ...s } = u; return s; },
    getSession() { return DB.get('session', null); },
    setSession(user) { DB.set('session', user); },
    clearSession() { DB.set('session', null); }
};

/* ─────────────────────────────────────────────
   Отзывы
───────────────────────────────────────────── */
const Reviews = {
    getAll() {
        const existing = DB.get('reviews', null);
        if (existing !== null) return existing;
        return seedReviews();
    },
    add(review) {
        const reviews = this.getAll();
        reviews.unshift({ id: DB.uid(), date: new Date().toISOString(), likes: 0, likedBy: [], ...review });
        DB.set('reviews', reviews);
    },
    like(id, userId) {
        const reviews = this.getAll();
        const r = reviews.find(r => r.id === id);
        if (!r) return;
        r.likedBy = r.likedBy || [];
        if (r.likedBy.includes(userId)) { r.likedBy = r.likedBy.filter(u => u !== userId); r.likes--; }
        else { r.likedBy.push(userId); r.likes++; }
        DB.set('reviews', reviews);
        return r;
    },
    del(id, userId) {
        const reviews = this.getAll();
        const r = reviews.find(r => r.id === id);
        if (!r || r.userId !== userId) return false;
        DB.set('reviews', reviews.filter(r => r.id !== id));
        return true;
    }
};

function seedReviews() {
    const seed = [
        {
            id: 's1', userId: 'demo', username: 'Алексей К.', avatar: 'АК', rating: 5,
            text: 'Отличный конфигуратор! Собрал игровой ПК за вечер. Проверка совместимости реально работает — не дала поставить DDR5 к плате с DDR4.',
            configName: 'Игровой зверь', date: '2025-03-15T10:30:00Z', likes: 12, likedBy: []
        },
        {
            id: 's2', userId: 'demo2', username: 'Мария П.', avatar: 'МП', rating: 4,
            text: 'Удобный интерфейс, большая база комплектующих. Функция автосборки по бюджету очень выручает!',
            configName: 'Рабочая станция', date: '2025-03-20T14:15:00Z', likes: 7, likedBy: []
        },
        {
            id: 's3', userId: 'demo3', username: 'Дмитрий В.', avatar: 'ДВ', rating: 5,
            text: 'Пользуюсь уже год, сохранил 5 конфигураций. Показываю клиентам когда собираю ПК на заказ. Цены в тенге — это удобно.',
            configName: 'Стриминг-машина', date: '2025-04-01T09:00:00Z', likes: 24, likedBy: []
        },
    ];
    DB.set('reviews', seed);
    return seed;
}

/* ─────────────────────────────────────────────
   Сохранение конфигураций.
───────────────────────────────────────────── */
const Configs = {
    getAll(userId) { return DB.get('configs', []).filter(c => c.userId === userId); },
    save(userId, name, selection) {
        const configs = DB.get('configs', []);
        const total = Object.values(selection).reduce((s, p) => s + (p ? p.price : 0), 0);
        const conf = { id: DB.uid(), userId, name, selection, totalPrice: total, createdAt: new Date().toISOString() };
        configs.push(conf);
        DB.set('configs', configs);
        return conf;
    },
    del(id) { DB.set('configs', DB.get('configs', []).filter(c => c.id !== id)); }
};
function toast(msg, type = 'inf') {
    const wrap = document.getElementById('toasts');
    const icons = { ok: '✓', err: '✕', inf: 'i' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${icons[type] || '•'}</span><span>${msg}</span>`;
    wrap.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3000);
}

/* ─────────────────────────────────────────────
   Формат отзыва
───────────────────────────────────────────── */
const fmt = n => n ? n.toLocaleString('ru-KZ') + ' ₸' : '—';
function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }
function relDate(iso) {
    const d = new Date(iso), now = new Date(), diff = now - d;
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' мин назад';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' ч назад';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ─────────────────────────────────────────────
   Навигация
───────────────────────────────────────────── */
function goTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('page-' + pageId)?.classList.add('active');
    document.querySelector(`.nav-tab[data-page="${pageId}"]`)?.classList.add('active');
    localStorage.setItem('koren_activePage', pageId);
    if (pageId === 'reviews') renderReviews();
    if (pageId === 'config') renderSaved();
    if (pageId === 'profile') renderProfile();
}

function openAuth(tab = 'login') {
    document.getElementById('overlay-auth').classList.add('open');
    switchAuthTab(tab);
        if (state.activePage === 'profile' && !state.user) {
        goTo('home');
    }
}
function closeAuth() {
    // Закрываем модалку
    document.getElementById('overlay-auth').classList.remove('open');
    document.getElementById('auth-err').textContent = '';
    
    // Если мы на странице профиля без логина — уходим на главную
    if (state.activePage === 'profile' && !state.user) {
        goTo('home');
    } else {
        // ОЧЕНЬ ВАЖНО: принудительно показываем текущую активную страницу,
        // чтобы она не оставалась скрытой (display: none)
        goTo(state.activePage || 'home');
    }
}
function switchAuthTab(tab) {
    document.querySelectorAll('.mtab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
    document.getElementById('form-reg').classList.toggle('hidden', tab !== 'reg');
    document.getElementById('auth-err').textContent = '';
}

function renderNav() {
    const u = state.user;
    document.getElementById('nav-auth-btns').classList.toggle('hidden', !!u);
    document.getElementById('nav-user-info').classList.toggle('hidden', !u);
    const profileTab = document.getElementById('nav-profile-tab');
    if (profileTab) profileTab.style.display = u ? '' : 'none';
    if (u) {
        document.getElementById('nav-ava').textContent = u.avatar;
        document.getElementById('nav-uname').textContent = u.username;
    }
}

/* ─────────────────────────────────────────────
   Генерация конфигурации
───────────────────────────────────────────── */
function renderSlots() {
    const container = document.getElementById('slots-container');
    container.innerHTML = '';

    SLOT_META.forEach(meta => {
        const part = state.selection[meta.key];
        const slot = document.createElement('div');
        slot.className = 'slot' + (part ? ' filled' : '') + (state.openSlot === meta.key ? ' open' : '');
        slot.dataset.key = meta.key;

        const price = part ? fmt(part.price) : '';
        slot.innerHTML = `
      <div class="slot-hd" onclick="toggleSlot('${meta.key}')">
        <div class="slot-ico ${meta.cls}">${meta.icon}</div>
        <div class="slot-info">
          <div class="slot-lbl">${meta.label}${meta.required ? ' *' : ''}</div>
          <div class="slot-val ${part ? '' : 'empty'}">${part ? part.name : 'Не выбрано'}</div>
        </div>
        ${part ? `<div class="slot-p">${price}</div>` : ''}
        <div class="slot-chev">▼</div>
      </div>
      <div class="slot-body">
        <input class="psearch" type="text" placeholder="Поиск..." oninput="filterPicker('${meta.key}', this.value)">
        <div class="pitems" id="picker-${meta.key}"></div>
        ${part ? `<button class="clear-btn" onclick="clearSlot('${meta.key}')">✕ Убрать выбор</button>` : ''}
      </div>`;
        container.appendChild(slot);
        if (state.openSlot === meta.key) renderPickerItems(meta.key, '');
    });
}

function toggleSlot(key) {
    state.openSlot = state.openSlot === key ? null : key;
    renderSlots();
    if (state.openSlot) {
        setTimeout(() => {
            const el = document.querySelector(`.slot[data-key="${key}"] .psearch`);
            el?.focus();
        }, 50);
    }
}

function filterPicker(key, q) { renderPickerItems(key, q); }

function renderPickerItems(key, q) {
    const container = document.getElementById('picker-' + key);
    if (!container) return;
    const parts = PARTS[key];
    const sel = state.selection[key];
    const query = q.toLowerCase().trim();

    const filtered = query
        ? parts.filter(p => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query))
        : parts;
    if (!filtered.length) {
        container.innerHTML = '<div class="p-empty">Ничего не найдено</div>';
        return;
    }

    container.innerHTML = filtered.map(p => {
        const compat = COMPAT.isCompatibleWith(key, p, state.selection);
        const isAuto = state.budgetResult && state.budgetResult.parts[key]?.id === p.id;
        let cls = '';
        if (sel?.id === p.id) cls = 'sel';
        else if (!compat) cls = 'incompat';
        else if (isAuto) cls = 'auto-pick';

        const sub = getPartSub(key, p);
        const compatTag = !compat ? '<span class="tag tag-bad">Несовм.</span>'
            : isAuto ? '<span class="tag tag-auto">✦ Авто</span>'
                : '';
        return `<div class="pitem ${cls}" onclick="selectPart('${key}','${p.id}')">
      <div class="pi-info">
        <div class="pi-name">${p.name}</div>
        <div class="pi-sub">${sub}</div>
      </div>
      ${compatTag}
      <div class="pi-price">${fmt(p.price)}</div>
    </div>`;
    }).join('');
}

function getPartSub(key, p) {
    if (key === 'cpu') return `${p.socket} · ${p.cores} ядер · ${p.freq} · TDP ${p.tdp}Вт`;
    if (key === 'motherboard') return `${p.socket} · ${p.memType} · ${p.formFactor}`;
    if (key === 'ram') return `${p.type} · ${p.capacity}ГБ · ${p.speed}МГц`;
    if (key === 'gpu') return `${p.vram}ГБ VRAM · TDP ${p.tdp}Вт`;
    if (key === 'storage') return `${p.type} · ${p.capacity} · ${p.read} МБ/с`;
    if (key === 'psu') return `${p.wattage}Вт · ${p.eff}`;
    if (key === 'cooler') return `${p.type} · до ${p.tdpSupport}Вт`;
    if (key === 'case') return `${p.formFactors.join('/')} · ГПУ до ${p.maxGpuLen}мм`;
    return '';
}

function selectPart(key, id) {
    const part = PARTS[key].find(p => p.id === id);
    if (!part) return;
    const compat = COMPAT.isCompatibleWith(key, part, state.selection);
    if (!compat) {
        toast('⚠ Компонент несовместим с текущей сборкой', 'err');
    }
    state.selection[key] = part;
    state.openSlot = null;
    renderSlots();
    renderSummary();
    toast(`${part.name} добавлен`, 'ok');
}

function clearSlot(key) {
    state.selection[key] = null;
    renderSlots();
    renderSummary();
}

/* ─────────────────────────────────────────────
   Боковая панель
───────────────────────────────────────────── */
function renderSummary() {
    const sel = state.selection;
    const total = Object.values(sel).reduce((s, p) => s + (p ? p.price : 0), 0);
    const issues = COMPAT.check(sel);
    const hasParts = Object.values(sel).some(Boolean);


    const pill = document.getElementById('compat-pill');
    if (!hasParts) {
        pill.className = 'compat-pill cp-none'; pill.textContent = 'Пусто';
    } else if (issues.length === 0) {
        pill.className = 'compat-pill cp-ok'; pill.textContent = '✓ Совместимо';
    } else {
        pill.className = 'compat-pill cp-err'; pill.textContent = `✕ ${issues.length} проблем`;
    }


    const issueBox = document.getElementById('issues-box');
    const okBox = document.getElementById('ok-box');
    if (issues.length > 0) {
        issueBox.classList.remove('hidden');
        okBox.classList.add('hidden');
        issueBox.querySelector('.issues-list').innerHTML = issues.map(i => `<div class="issue-item">${i}</div>`).join('');
    } else if (hasParts) {
        issueBox.classList.add('hidden');
        okBox.classList.remove('hidden');
    } else {
        issueBox.classList.add('hidden');
        okBox.classList.add('hidden');
    }
    const rows = document.getElementById('sum-rows');
    rows.innerHTML = SLOT_META.map(m => {
        const p = sel[m.key];
        return `<div class="sum-row"><span class="sum-k">${m.label}</span><span class="sum-v">${p ? p.name.split(' ').slice(0, 3).join(' ') : '—'}</span></div>`;
    }).join('');

    document.getElementById('sum-total').textContent = hasParts ? fmt(total) : '0 ₸';
    const tdp = COMPAT.calcTdp(sel);
    const psu = sel.psu;
    const pct = psu ? Math.min(100, Math.round(tdp / psu.wattage * 100)) : 0;
    const fill = document.getElementById('pwr-fill');
    const lbl = document.getElementById('pwr-lbl');
    fill.style.width = pct + '%';
    fill.className = 'pwr-fill ' + (pct > 90 ? 'pwr-over' : pct > 75 ? 'pwr-warn' : 'pwr-ok');
    lbl.textContent = psu ? `${tdp}Вт / ${psu.wattage}Вт (${pct}%)` : `~${tdp}Вт потребление`;
}

/* ─────────────────────────────────────────────
   Автогенерация
───────────────────────────────────────────── */
function runBudgetBuild() {
    const val = parseInt(document.getElementById('budget-input').value.replace(/\D/g, ''), 10);
    const priority = document.getElementById('budget-priority').value;
    if (!val || val < 100000) { toast('Введите бюджет от 100 000 ₸', 'err'); return; }
    const btn = document.getElementById('budget-btn');
    btn.disabled = true;
    btn.textContent = 'Подбираю...';
    setTimeout(() => {
        const { parts, spent } = BUDGET.build(val, priority);
        state.budgetResult = { parts, spent };
        state.selection = { ...parts };
        state.openSlot = null;
        renderSlots();
        renderSummary();
        const pct = Math.round(spent / val * 100);
        const bar = document.getElementById('bp-result');
        bar.classList.add('show');
        document.getElementById('bp-fill').style.width = pct + '%';
        document.getElementById('bp-result-txt').innerHTML =
            `Подобрано: <strong>${fmt(spent)}</strong> из ${fmt(val)} (${pct}% бюджета)`;
        document.querySelectorAll('.slot').forEach(s => s.classList.remove('hl-auto'));
        Object.keys(parts).forEach(k => {
            if (parts[k]) document.querySelector(`.slot[data-key="${k}"]`)?.classList.add('hl-auto');
        });
        btn.disabled = false;
        btn.textContent = '✦ Собрать';
        toast('Конфигурация подобрана!', 'ok');
    }, 400);
}
function setBudgetPreset(val) {
    document.getElementById('budget-input').value = val.toLocaleString('ru-RU');
}

/* ─────────────────────────────────────────────
   Сохранение конфигурации
───────────────────────────────────────────── */
function saveConfig() {
    if (!state.user) { openAuth('login'); return; }
    const hasParts = Object.values(state.selection).some(Boolean);
    if (!hasParts) { toast('Сначала добавьте комплектующие', 'err'); return; }

    showPrompt({
        onOk: (name) => {
            if (!name?.trim()) return;
            Configs.save(state.user.id, name.trim(), state.selection);
            renderSaved();
            toast('Конфигурация сохранена!', 'ok');
        }
    });
}

function buildConfigText() {
    const sel = state.selection;
    const hasParts = Object.values(sel).some(Boolean);
    if (!hasParts) return null;
    const total = Object.values(sel).reduce((s, p) => s + (p ? p.price : 0), 0);
    const issues = COMPAT.check(sel);
    const lines = [];
    lines.push('==========================================');
    lines.push('  Конфигурация ПК — PC.CFG');
    lines.push('==========================================');
    SLOT_META.forEach(m => {
        const p = sel[m.key];
        if (!p) return;
        const sub = getPartSub(m.key, p);
        lines.push('\n' + m.icon + '  ' + m.label);
        lines.push('   ' + p.name);
        lines.push('   ' + sub);
        lines.push('   Цена: ' + fmt(p.price));
    });
    lines.push('\n------------------------------------------');
    lines.push('  Итого: ' + fmt(total));
    if (issues.length > 0) {
        lines.push('\n⚠ Проблемы совместимости:');
        issues.forEach(i => lines.push('  • ' + i));
    } else {
        lines.push('✓ Все компоненты совместимы');
    }
    lines.push('==========================================');
    return lines.join('\n');
}

function copyConfig() {
    const hasParts = Object.values(state.selection).some(Boolean);
    if (!hasParts) { toast('Сначала добавьте комплектующие', 'err'); return; }
    const text = buildConfigText();
    navigator.clipboard.writeText(text).then(() => {
        toast('Конфигурация скопирована в буфер обмена!', 'ok');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast('Конфигурация скопирована!', 'ok');
    });
}

function printConfig() {
    const hasParts = Object.values(state.selection).some(Boolean);
    if (!hasParts) { toast('Сначала добавьте комплектующие', 'err'); return; }
    const sel = state.selection;
    const total = Object.values(sel).reduce((s, p) => s + (p ? p.price : 0), 0);
    const issues = COMPAT.check(sel);
    const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    const rows = SLOT_META.filter(m => sel[m.key]).map(m => {
        const p = sel[m.key];
        const sub = getPartSub(m.key, p);
        return '<tr><td class="pt-cat">' + m.icon + ' ' + m.label + '</td><td class="pt-name">' + p.name + '<br><span class="pt-sub">' + sub + '</span></td><td class="pt-price">' + fmt(p.price) + '</td></tr>';
    }).join('');
    const issuesHtml = issues.length > 0
        ? '<div class="pt-warn"><b>\u26a0 Проблемы совместимости:</b><ul>' + issues.map(i => '<li>' + i + '</li>').join('') + '</ul></div>'
        : '<div class="pt-ok">\u2713 Все компоненты совместимы</div>';
    const win = window.open('', '_blank');
    win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Конфигурация ПК — PC.CFG</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:"Segoe UI",Arial,sans-serif;background:#fff;color:#111;padding:32px;max-width:780px;margin:0 auto}.pt-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;border-bottom:2px solid #111;padding-bottom:16px}.pt-logo{font-size:22px;font-weight:900;letter-spacing:-1px}.pt-logo span{color:#7c3aed}.pt-date{font-size:12px;color:#666;margin-top:4px}table{width:100%;border-collapse:collapse;margin-bottom:20px}th{text-align:left;padding:8px 12px;background:#f3f4f6;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#666}td{padding:10px 12px;border-bottom:1px solid #e5e7eb;vertical-align:top}.pt-cat{font-size:13px;color:#555;white-space:nowrap;width:160px}.pt-name{font-size:14px;font-weight:500}.pt-sub{font-size:12px;color:#888;font-weight:400}.pt-price{font-size:14px;font-weight:600;text-align:right;white-space:nowrap;color:#7c3aed}.pt-total{font-size:18px;font-weight:700;text-align:right;padding:12px;border-top:2px solid #111}.pt-ok{color:#16a34a;font-size:13px;margin-bottom:16px;padding:8px 12px;background:#f0fdf4;border-radius:6px}.pt-warn{color:#b45309;font-size:13px;margin-bottom:16px;padding:8px 12px;background:#fffbeb;border-radius:6px}.pt-warn ul{margin-top:6px;padding-left:18px}.pt-footer{margin-top:24px;text-align:center;font-size:11px;color:#aaa;border-top:1px solid #e5e7eb;padding-top:12px}.no-print{display:inline-block}@media print{.no-print{display:none}}</style></head><body><div class="pt-header"><div><div class="pt-logo">PC<span>.CFG</span></div><div class="pt-date">Сформировано: ' + date + '</div></div><button class="no-print" onclick="window.print()" style="padding:8px 20px;background:#7c3aed;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;font-weight:600">\uD83D\uDDA8\uFE0F Печать</button></div><table><thead><tr><th>Компонент</th><th>Модель</th><th style="text-align:right">Цена</th></tr></thead><tbody>' + rows + '</tbody></table><div class="pt-total">Итого: ' + fmt(total) + '</div>' + issuesHtml + '<div class="pt-footer">PC.CFG — Конфигуратор ПК для казахстанского рынка</div></body></html>');
    win.document.close();
}

function renderSaved() {
    const wrap = document.getElementById('saved-wrap');
    if (!state.user) {
        wrap.innerHTML = `<div class="login-prompt">
      <p>Войдите в аккаунт, чтобы сохранять конфигурации</p>
      <button class="btn btn-accent btn-sm" onclick="openAuth('login')">Войти</button>
    </div>`;
        return;
    }
    const configs = Configs.getAll(state.user.id);
    if (!configs.length) {
        wrap.innerHTML = `<div class="login-prompt"><p>Сохранённых конфигураций нет</p></div>`;
        return;
    }
    wrap.innerHTML = `<div class="saved-section">
    <h3>Мои конфигурации (${configs.length})</h3>
    <div class="saved-list">
      ${configs.map(c => `
        <div class="saved-card">
          <div class="saved-info">
            <div class="saved-name">${c.name}</div>
            <div class="saved-meta">${relDate(c.createdAt)}</div>
          </div>
          <div class="saved-price">${fmt(c.totalPrice)}</div>
          <div class="saved-actions">
            <button class="btn btn-ghost btn-sm" onclick="loadConfig('${c.id}')">Загрузить</button>
            <button class="btn btn-red btn-sm" onclick="deleteConfig('${c.id}')">✕</button>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}
function loadConfig(id) {
    const configs = DB.get('configs', []);
    const c = configs.find(c => c.id === id);
    if (!c) return;
    state.selection = c.selection;
    state.openSlot = null;
    renderSlots();
    renderSummary();
    toast('Конфигурация загружена', 'ok');
}
function deleteConfig(id) {
    Configs.del(id);
    renderSaved();
    toast('Удалено', 'ok');
}
function resetConfig() {
    state.selection = { cpu: null, motherboard: null, ram: null, gpu: null, storage: null, psu: null, cooler: null, case: null };
    state.budgetResult = null;
    state.openSlot = null;
    document.getElementById('bp-result').classList.remove('show');
    document.getElementById('budget-input').value = '';
    renderSlots();
    renderSummary();
    toast('Сборка сброшена', 'inf');
}
let reviewRating = 0;

function renderReviews() {
    const reviews = Reviews.getAll();
    renderReviewStats(reviews);
    renderReviewCards(reviews);
    renderReviewForm();
}

function renderReviewStats(reviews) {
    if (!reviews.length) return;
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    document.getElementById('stats-num').textContent = avg.toFixed(1);
    document.getElementById('stats-stars').textContent = stars(Math.round(avg));
    document.getElementById('stats-count').textContent = reviews.length + ' отзывов';

    for (let s = 5; s >= 1; s--) {
        const cnt = reviews.filter(r => r.rating === s).length;
        const pct = Math.round(cnt / reviews.length * 100);
        document.getElementById(`bar-${s}`).style.width = pct + '%';
        document.getElementById(`bar-cnt-${s}`).textContent = cnt;
    }
}
function renderReviewCards(reviews) {
    const grid = document.getElementById('reviews-grid');
    if (!reviews.length) {
        grid.innerHTML = '<div class="reviews-empty">Отзывов пока нет. Будьте первым!</div>';
        return;
    }
    grid.innerHTML = reviews.map(r => {
        const isOwn = state.user?.id === r.userId;
        const isLiked = state.user && (r.likedBy || []).includes(state.user.id);
        return `<div class="review-card" id="rc-${r.id}">
      <div class="rc-head">
        <div class="rc-ava">${r.avatar}</div>
        <div class="rc-meta">
          <div class="rc-name">${r.username}</div>
          <div class="rc-date">${relDate(r.date)}</div>
        </div>
        <div class="rc-stars">${'★'.repeat(r.rating)}<span style="opacity:.25">${'★'.repeat(5 - r.rating)}</span></div>
      </div>
      <div class="rc-body">${r.text}</div>
      ${r.configName ? `<div class="rc-cfg">🖥 ${r.configName}</div>` : ''}
      <div class="rc-foot">
        <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="likeReview('${r.id}')">
          ♥ <span>${r.likes || 0}</span>
        </button>
        ${isOwn ? `<button class="del-review-btn" onclick="delReview('${r.id}')">Удалить</button>` : ''}
      </div>
    </div>`;
    }).join('');
}
function renderReviewForm() {
    const formWrap = document.getElementById('review-form-wrap');
    const loginMsg = document.getElementById('review-login-msg');
    if (state.user) {
        formWrap.classList.remove('hidden');
        loginMsg.classList.add('hidden');
    } else {
        formWrap.classList.add('hidden');
        loginMsg.classList.remove('hidden');
    }
}
function setReviewRating(n) {
    reviewRating = n;
    document.querySelectorAll('.star-btn').forEach((b, i) => b.classList.toggle('active', i < n));
}
function submitReview() {
    if (!state.user) { openAuth('login'); return; }
    const text = document.getElementById('review-text').value.trim();
    const configName = document.getElementById('review-config').value.trim();
    if (!text) { toast('Напишите отзыв', 'err'); return; }
    if (!reviewRating) { toast('Поставьте оценку', 'err'); return; }
    Reviews.add({
        userId: state.user.id,
        username: state.user.username,
        avatar: state.user.avatar,
        rating: reviewRating,
        text, configName
    });
    document.getElementById('review-text').value = '';
    document.getElementById('review-config').value = '';
    setReviewRating(0);
    renderReviews();
    toast('Отзыв опубликован!', 'ok');
}
function likeReview(id) {
    if (!state.user) { openAuth('login'); return; }
    const r = Reviews.like(id, state.user.id);
    if (!r) return;
    const card = document.getElementById('rc-' + id);
    const isLiked = (r.likedBy || []).includes(state.user.id);
    card.querySelector('.like-btn').className = `like-btn ${isLiked ? 'liked' : ''}`;
    card.querySelector('.like-btn span').textContent = r.likes;
}
function delReview(id) {
    if (!state.user) return;
    showConfirm({
        icon: '🗑️',
        title: 'Удалить отзыв?',
        sub: 'Это действие нельзя отменить',
        okLabel: 'Удалить',
        okClass: 'btn-red',
        onOk: () => {
            if (Reviews.del(id, state.user.id)) {
                document.getElementById('rc-' + id)?.remove();
                toast('Отзыв удалён', 'ok');
                renderReviewStats(Reviews.getAll());
            }
        }
    });
}
function renderProfile() {
    if (!state.user) { goTo('home'); return; }
    const u = state.user;

    document.getElementById('profile-ava-lg').textContent = u.avatar;
    document.getElementById('profile-username').textContent = u.username;
    document.getElementById('profile-email').textContent = u.email;
    const since = new Date(u.createdAt);
    document.getElementById('profile-since').textContent =
        'Участник с ' + since.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

    const configs = Configs.getAll(u.id);
    const reviews = DB.get('reviews', []).filter(r => r.userId === u.id);

    document.getElementById('pstat-configs').textContent = configs.length;
    document.getElementById('pstat-reviews').textContent = reviews.length;

    const list = document.getElementById('profile-configs-list');
    if (!configs.length) {
        list.innerHTML = `<div class="login-prompt"><p>Нет сохранённых сборок. Перейдите в конфигуратор и сохраните первую!</p>
            <button class="btn btn-accent btn-sm" onclick="goTo('config')">Перейти к конфигуратору</button></div>`;
        return;
    }

    list.innerHTML = `<div class="profile-configs">
        ${configs.map(c => {
            const parts = Object.values(c.selection).filter(Boolean);
            const partNames = parts.slice(0, 3).map(p => p.name.split(' ').slice(0, 2).join(' ')).join(', ');
            return `<div class="profile-cfg-card">
                <div class="pcfg-top">
                    <div class="pcfg-name">${c.name}</div>
                    <div class="pcfg-price">${fmt(c.totalPrice)}</div>
                </div>
                <div class="pcfg-parts">${partNames}${parts.length > 3 ? ` и ещё ${parts.length - 3}...` : ''}</div>
                <div class="pcfg-date">${relDate(c.createdAt)}</div>
                <div class="pcfg-actions">
                    <button class="btn btn-ghost btn-sm" onclick="loadConfigFromProfile('${c.id}')">Загрузить в конфигуратор</button>
                    <button class="btn btn-red btn-sm" onclick="deleteConfigFromProfile('${c.id}')">✕ Удалить</button>
                </div>
            </div>`;
        }).join('')}
    </div>`;
}

function loadConfigFromProfile(id) {
    const configs = DB.get('configs', []);
    const c = configs.find(c => c.id === id);
    if (!c) return;
    state.selection = c.selection;
    state.openSlot = null;
    goTo('config');
    renderSlots();
    renderSummary();
    toast('Конфигурация загружена', 'ok');
}

function deleteConfigFromProfile(id) {
    Configs.del(id);
    renderProfile();
    toast('Удалено', 'ok');
}
document.addEventListener('DOMContentLoaded', () => {
    state.user = Auth.getSession();
    renderNav();
    document.querySelectorAll('.nav-tab').forEach(t => {
        t.addEventListener('click', () => goTo(t.dataset.page));
    });
    document.getElementById('nav-logo').addEventListener('click', () => goTo('home'));
    document.getElementById('btn-nav-login').addEventListener('click', () => openAuth('login'));
    document.getElementById('btn-nav-reg').addEventListener('click', () => openAuth('reg'));
    document.getElementById('btn-logout').addEventListener('click', () => {
        Auth.clearSession(); state.user = null; renderNav(); renderSaved();
        if (document.getElementById('page-reviews').classList.contains('active')) renderReviews();
        if (document.getElementById('page-profile').classList.contains('active')) goTo('home');
        toast('Вы вышли из аккаунта', 'inf');
    });
    document.getElementById('modal-close').addEventListener('click', closeAuth);
    document.getElementById('overlay-auth').addEventListener('click', e => { if (e.target.id === 'overlay-auth') closeAuth(); });
    document.querySelectorAll('.mtab').forEach(t => t.addEventListener('click', () => switchAuthTab(t.dataset.tab)));
    document.getElementById('btn-login').addEventListener('click', () => {
        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-pass').value;
        try {
            const user = Auth.login(email, pass);
            state.user = user;
            Auth.setSession(user);
            renderNav(); renderSaved(); closeAuth();
            if (document.getElementById('page-reviews').classList.contains('active')) renderReviews();
            toast(`Добро пожаловать, ${user.username}!`, 'ok');
        } catch (e) { document.getElementById('auth-err').textContent = e.message; }
    });
    document.getElementById('btn-register').addEventListener('click', () => {
        const u = document.getElementById('reg-username').value.trim();
        const e = document.getElementById('reg-email').value.trim();
        const p = document.getElementById('reg-pass').value;
        try {
            const user = Auth.register(u, e, p);
            state.user = user;
            Auth.setSession(user);
            renderNav(); renderSaved(); closeAuth();
            toast(`Аккаунт создан! Привет, ${user.username}!`, 'ok');
        } catch (err) { document.getElementById('auth-err').textContent = err.message; }
    });
    ['login-email', 'login-pass'].forEach(id => {
        document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('btn-login').click(); });
    });
    ['reg-username', 'reg-email', 'reg-pass'].forEach(id => {
        document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('btn-register').click(); });
    });
    document.querySelectorAll('.bp-preset').forEach(b => {
        b.addEventListener('click', () => setBudgetPreset(parseInt(b.dataset.val)));
    });
    document.getElementById('budget-input').addEventListener('input', function () {
        const raw = this.value.replace(/\D/g, '');
        if (raw) this.value = parseInt(raw).toLocaleString('ru-RU');
        else this.value = '';
    });
    document.getElementById('budget-btn').addEventListener('click', runBudgetBuild);
    document.getElementById('btn-save-config').addEventListener('click', saveConfig);
    document.getElementById('btn-reset-config').addEventListener('click', resetConfig);
    document.getElementById('btn-copy-config').addEventListener('click', copyConfig);
    document.getElementById('btn-print-config').addEventListener('click', printConfig);
    document.querySelectorAll('.star-btn').forEach((b, i) => {
        b.addEventListener('click', () => setReviewRating(i + 1));
        b.addEventListener('mouseenter', () => {
            document.querySelectorAll('.star-btn').forEach((s, j) => s.style.opacity = j <= i ? '1' : '.3');
        });
        b.parentElement.addEventListener('mouseleave', () => {
            document.querySelectorAll('.star-btn').forEach((s, j) => s.style.opacity = j < reviewRating ? '1' : '.3');
        });
    });
    document.getElementById('btn-submit-review').addEventListener('click', submitReview);
    document.getElementById('btn-go-config').addEventListener('click', () => goTo('config'));
    document.getElementById('btn-go-config2').addEventListener('click', () => goTo('config'));
    document.getElementById('btn-go-reviews').addEventListener('click', () => goTo('reviews'));
    const burgerBtn  = document.getElementById('burger-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    function closeMobileMenu() {
        burgerBtn.classList.remove('open');
        mobileMenu.classList.remove('open');
    }

    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });
    document.querySelectorAll('[data-mobile]').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            if (page) { goTo(page); closeMobileMenu(); }
        });
    });
    document.getElementById('mob-btn-login').addEventListener('click', () => { openAuth('login'); closeMobileMenu(); });
    document.getElementById('mob-btn-reg').addEventListener('click', () => { openAuth('reg'); closeMobileMenu(); });
    document.getElementById('mob-btn-logout').addEventListener('click', () => { logout(); closeMobileMenu(); });
    document.addEventListener('click', e => {
        if (mobileMenu.classList.contains('open') &&
            !mobileMenu.contains(e.target) &&
            !burgerBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });
    const origUpdateNav = typeof updateNavUser === 'function' ? updateNavUser : null;
    function syncMobileNav() {
        const u = state.user;
        const mobAuthBtns = document.getElementById('mob-auth-btns');
        const mobUserInfo = document.getElementById('mob-user-info');
        const mobProfileTab = document.getElementById('mob-profile-tab');
        const mobAva = document.getElementById('mob-ava');
        const mobUname = document.getElementById('mob-uname');
        if (u) {
            mobAuthBtns && mobAuthBtns.classList.add('hidden');
            mobUserInfo && mobUserInfo.classList.remove('hidden');
            if (mobAva) mobAva.textContent = (u.username || u.email || '?').slice(0, 2).toUpperCase();
            if (mobUname) mobUname.textContent = u.username || u.email;
            if (mobProfileTab) mobProfileTab.style.display = '';
        } else {
            mobAuthBtns && mobAuthBtns.classList.remove('hidden');
            mobUserInfo && mobUserInfo.classList.add('hidden');
            if (mobProfileTab) mobProfileTab.style.display = 'none';
        }
    }
    const _origGoTo = goTo;
    const navUserInfo = document.getElementById('nav-user-info');
    if (navUserInfo) {
        new MutationObserver(syncMobileNav).observe(navUserInfo, { attributes: true, childList: true, subtree: true });
    }
    syncMobileNav();
    const savedPage = localStorage.getItem('koren_activePage') || 'home';
    const startPage = (savedPage === 'profile' && !state.user) ? 'home' : savedPage;
    goTo(startPage);
    renderSlots();
    renderSummary();
});