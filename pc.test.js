/* global test, expect*/
const { checkSocket, checkRam } = require('./script');

test('Unit: Совпадение сокетов', () => {
    expect(checkSocket('AM4', 'AM4')).toBe(true);
});

test('Unit: Разные сокеты', () => {
    expect(checkSocket('LGA1700', 'AM4')).toBe(false);
});

test('Unit: Тип памяти DDR4', () => {
    expect(checkRam('DDR4', 'DDR4')).toBe(true);
});

test('Integration: Ошибка при верном сокете, но разной памяти', () => {
    const sOk = checkSocket('LGA1700', 'LGA1700');
    const rOk = checkRam('DDR4', 'DDR5');
    expect(sOk && rOk).toBe(false);
});