var data_exporter = require('json2csv').Parser;

module.exports = { //used
    createCsv: (data,header,title,response) => {
        var mysql_data = JSON.parse(JSON.stringify(data));
        var json_data = new data_exporter({header});
        var csv_data = json_data.parse(mysql_data);
        response.setHeader("Content-Type", "text/csv");
        response.setHeader("Content-Disposition", "attachment; filename="+title+".csv");
        response.status(200).end(csv_data);
        return response;
    }
};

