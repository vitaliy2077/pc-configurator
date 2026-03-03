// data.js
const database = {
    cpus: [
        { id: 'i5-12400', name: 'Intel i5-12400', socket: 'LGA1700' },
        { id: 'ryzen-5600', name: 'AMD Ryzen 5 5600', socket: 'AM4' }
    ],
    motherboards: [
        { id: 'b660', name: 'ASUS B660', socket: 'LGA1700', ramType: 'DDR4' },
        { id: 'b550', name: 'MSI B550', socket: 'AM4', ramType: 'DDR4' }
    ],
    rams: [
        { id: 'king-d4', name: 'Kingston Fury DDR4', type: 'DDR4' },
        { id: 'cors-d5', name: 'Corsair Vengeance DDR5', type: 'DDR5' }
    ]
};

// Экспортируем, чтобы script.js мог это увидеть
if (typeof module !== 'undefined') {
    module.exports = database;
}