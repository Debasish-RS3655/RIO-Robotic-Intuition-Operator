const ExcelJS = require('exceljs');
var workbook = new ExcelJS.Workbook();
workbook.creator = "Debashish Buragohain";
workbook.lastModifiedBy = "Debashish Buragohain";
workbook.created = new Date(2021, 7, 30);
workbook.modified = new Date();
workbook.views = [
    {
        x: 0, y: 0, width: 10000, height: 20000,
        firstSheet: 0, activeTab: 1, visibility: 'visible'
    }
]
const sheet = workbook.addWorksheet('My Sheet');
var worksheet = workbook.getWorksheet('My Sheet');
worksheet.state = 'visible';
worksheet.columns = [
    { header: "yay", key : 'Deba the great', width: 10}
]

const row = worksheet.getRow(2);
row.values = [0, 1, 2]
workbook.xlsx.writeFile('newExcelFile.xlsx')