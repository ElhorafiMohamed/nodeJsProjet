const delivery = require("../services/delivery.service");
const genereCsv = require("../helpers/genereCsv");
const genereExcel = require("../helpers/genereExcel");

module.exports = app => {
    var router = require("express").Router();

    router.get('/delivery', function (req, res) {
        delivery.findAllDelivery()
            .then((response) => {
                res.status(response.statusCode).json(response);
            })
            .catch((error) => {
                res.status(error.statusCode).json(error);
            });
    });

    router.post('/dowload', async function (req, res) {
        const deliveries = await delivery.findAllDelivery(req.body);
        console.log(deliveries.data)
        var file_header = ['date', 'item', 'id_cust', 'deliveries', 'jour_start', 'jour_end'];
        await genereCsv.createCsv(deliveries.data, file_header,req.body.reportTitle, res)
    });

    router.get('/excel', async function (req, res) {
        req.body.date = '2024'
        req.body.heure = 0
        req.body.title  ='rapport'
        const ReportReconciliation = await delivery.ReportReconciliation(req.body);
        await genereExcel.createExcel(res,ReportReconciliation.data,req.body)
    });

    app.use("/api", router);
};
