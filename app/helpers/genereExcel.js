const xl = require('excel4node');

const generateEmptyArray = (length) => {
    return Array.from({ length }, () => ({ days: 0, hours: 0 }));
};

function generateCell(ws, startColumn, endColumn, ligne, contents, style) {
    for (let i = startColumn; i <= endColumn; i++) {
        const cellContent = contents[i - startColumn] !== null && contents[i - startColumn] !== undefined ? contents[i - startColumn] : ' ';
        ws.cell(ligne, i, ligne, i, true).string(cellContent).style(style);
    }
};

function getFirstAndSecondNumberFromString(str) {
    const matches = str.match(/\d+/g);
    if (matches && matches.length >= 2) {
        const firstNumber = parseInt(matches[0]);
        const secondNumber = parseInt(matches[1]);
        return [firstNumber, secondNumber];
    }
    return [null, null];
}

function generateSumFormula(startRow, endRow, columnIndex) {
    let columnLetter = ''
    columnLetter = columnLetter + String.fromCharCode(65 + columnIndex - 1);
    return `SUM(${columnLetter}${startRow}:${columnLetter}${endRow})`;
}

function generateSumHeursDays(key, tanksSommes, pompsSommes) {
    let heurs = 0
    let days = 0
    if (key.startsWith('t')) {
        heurs = tanksSommes[key.substring(1) - 1]['hours'] % 24
        days = tanksSommes[key.substring(1) - 1]['days']+Math.floor(tanksSommes[key.substring(1) - 1]['hours'] / 24)
    }
    if (key.startsWith('p')) {
        heurs = pompsSommes[key.substring(1) - 1]['hours'] % 24
        days = pompsSommes[key.substring(1) - 1]['days'] + Math.floor(tanksSommes[key.substring(1) - 1]['hours'] / 24)
    }
    return `${days} days ${heurs} hours`;
}

module.exports = { //used
    createExcel: (response, data,json) => {
        const wb = new xl.Workbook();
        const ws = wb.addWorksheet('Sheet 1');

        const createStyle = (bgColor) => {
            return wb.createStyle({
                font: {
                    color: '#000000', // black color
                    size: 12,
                },
                alignment: {
                    horizontal: 'center', // center alignment
                },
                fill: {
                    type: 'pattern',
                    patternType: 'solid',
                    fgColor: bgColor, // background color
                },
                border: {
                    left: {
                        style: 'thin',
                        color: {argb: 'FF000000'}, // black color
                    },
                    right: {
                        style: 'thin',
                        color: {argb: 'FF000000'}, // black color
                    },
                    top: {
                        style: 'thin',
                        color: {argb: 'FF000000'}, // black color
                    },
                    bottom: {
                        style: 'thin',
                        color: {argb: 'FF000000'}, // black color
                    },
                },
            });
        };

        const Site_contents = [
            'Site ID', 'District'
        ];

        const months = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre',
            'Octobre', 'Novembre', 'Décembre'
        ];

        const DOWNTIME = [
            'PUMPS', 'TANKS', 'PUMPS', 'TANKS', 'PUMPS', 'TANKS', 'PUMPS', 'TANKS', 'PUMPS', 'TANKS', 'PUMPS', 'TANKS',
            'PUMPS', 'TANKS', 'PUMPS', 'TANKS', 'PUMPS', 'TANKS', 'PUMPS', 'TANKS', 'PUMPS', 'TANKS', 'PUMPS', 'TANKS'
        ];



        ws.cell(1, 3, 1, 14, true).string('SELL OUT').style(createStyle('#fff2cc'));
        ws.cell(1, 15, 1, 26, true).string('SALES IN - Deliveries').style(createStyle('#c6e0b4'));
        ws.cell(1, 27, 1, 50, true).string('DOWNTIME').style(createStyle('#f8cbad'));

        //LIGNE 1
        generateCell(ws, 1, Site_contents.length, 2, Site_contents, createStyle('#8497b0'));
        generateCell(ws, 1, Site_contents.length, 3, [], createStyle('#8497b0'));
        generateCell(ws, Site_contents.length + 1, Site_contents.length + months.length, 2, months, createStyle('#a0a252'));
        generateCell(ws, Site_contents.length + 1, Site_contents.length + months.length, 3, [], createStyle('#a0a252'));
        generateCell(ws, Site_contents.length + months.length + 1, Site_contents.length + months.length * 2, 2, months, createStyle('#548235'));
        generateCell(ws, Site_contents.length + months.length + 1, Site_contents.length + months.length * 2, 3, [], createStyle('#548235'));
        generateCell(ws, Site_contents.length + months.length * 2 + 1, Site_contents.length + months.length * 2 + DOWNTIME.length, 3, DOWNTIME, createStyle('#c66211'));

        ws.cell(2, 27, 2, 28, true).string('Janvier').style(createStyle('#c66211'));
        ws.cell(2, 29, 2, 30, true).string('Février').style(createStyle('#c66211'));
        ws.cell(2, 31, 2, 32, true).string('Mars').style(createStyle('#c66211'));
        ws.cell(2, 33, 2, 34, true).string('Avril').style(createStyle('#c66211'));
        ws.cell(2, 35, 2, 36, true).string('Mai').style(createStyle('#c66211'));
        ws.cell(2, 37, 2, 38, true).string('Juin').style(createStyle('#c66211'));
        ws.cell(2, 39, 2, 40, true).string('Juillet').style(createStyle('#c66211'));
        ws.cell(2, 41, 2, 42, true).string('Aout').style(createStyle('#c66211'));
        ws.cell(2, 43, 2, 44, true).string('Septembre').style(createStyle('#c66211'));
        ws.cell(2, 45, 2, 46, true).string('Octobre').style(createStyle('#c66211'));
        ws.cell(2, 47, 2, 48, true).string('Novembre').style(createStyle('#c66211'));
        ws.cell(2, 49, 2, 50, true).string('Décembre').style(createStyle('#c66211'));

        let tanksSommes = generateEmptyArray(12);
        let pompsSommes = generateEmptyArray(12);

        for (let i = 0; i <= data.length; i++) {
            const rowData = data[i];
            let j = 0;

            for (const key in rowData) {
                if (rowData.hasOwnProperty(key) && key != 'id' && key != 'device_id') {
                    j++;
                    let value = rowData[key];

                    //this is for generate the somme
                    if(i == data.length - 1){
                        if (key.startsWith('D') || key.startsWith('S')) {
                            ws.cell(data.length + 4, j, data.length + 4, j, true).formula(generateSumFormula(4, data.length + 3, j)).style(createStyle('#8497b0'));
                        }
                        else if (key.startsWith('t') || key.startsWith('p')) {
                            ws.cell(data.length + 4, j, data.length + 4, j, true).string(generateSumHeursDays(key, tanksSommes, pompsSommes)).style(createStyle('#8497b0'));
                        }
                    }

                    //this is for set the values in the cell
                    if (value) {
                        if (key === 'mahatati_code' || key === 'station_name' || key.startsWith('t') || key.startsWith('p')) {
                            const targetArray = key.startsWith('t') ? tanksSommes : (key.startsWith('p') ? pompsSommes : null);
                            if (targetArray) {
                                const x = getFirstAndSecondNumberFromString(value);
                                targetArray[key.substring(1) - 1]['days'] += x[0];
                                targetArray[key.substring(1) - 1]['hours'] += x[1];
                                value = `${x[0] +Math.floor(x[1] / 24)} days ${x[1] % 24} hours`
                            }
                            ws.cell(4 + i, j, 4 + i, j, true).string(value);
                        } else {
                            ws.cell(4 + i, j, 4 + i, j, true).formula('VALUE(' + value + ')');
                        }
                    }
                }
            }
        }
        ws.cell(data.length + 4, 1, data.length + 4, 2, true).string('Total').style(createStyle('#8497b0'));

        response.attachment(json.title+json.date+'.xlsx');
        wb.writeToBuffer().then((buffer) => {
            response.send(buffer);
        });
        return response;
    }
};



