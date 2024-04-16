const sequelizeHelper = require('../helpers/sequelizeHelper');
const {sequelize} = require('../models'); // Assuming your Sequelize instance is named 'sequelize'
const moment = require('moment');

let findAllDelivery = (obj, transaction) => {
    var number = 2;
    let query = `
            SELECT
    DL.start_date AS DATE,
    DL.GLOBAL_GRADE_ID AS ITEM,
    mahatati_code AS id_cust,
    ROUND(CAST(COALESCE(DL.TOTAL_VOLUME,0) AS NUMERIC),2) AS DELEVERIES,
    ROUND(CAST(COALESCE(TF.SUM_GAUGED,0) AS NUMERIC),2) AS JOUR_START,
    ROUND(CAST(COALESCE(TF2.SUM_GAUGED,0) AS NUMERIC),2) AS JOUR_END
FROM (
    SELECT mahatati_code,device_id,GLOBAL_GRADE_ID,
           TO_CHAR(start_date +INTERVAL '1 hours', 'YYYY-MM-DD')  as start_date,
           sum(total_volume)as TOTAL_VOLUME FROM DELIVERY_BY_DAY_VIEW
        WHERE
         TO_CHAR(start_date + INTERVAL '1 hours', 'YYYY-MM-DD') BETWEEN '${moment(obj.initialDate).format('YYYY-MM-DD')}'
         AND '${moment(obj.finishDate).format('YYYY-MM-DD')}'
        AND DEVICE_UUID IN (${stations})
    GROUP BY
    TO_CHAR(start_date +INTERVAL '1 hours', 'YYYY-MM-DD'),
    device_id,GLOBAL_GRADE_ID,mahatati_code
    ) AS DL
LEFT OUTER JOIN
    calculate_sum_gauged(TO_DATE(DL.start_date, 'YYYY-MM-DD') ) TF ON
         TF.STATION_ID = DL.DEVICE_ID AND TF.global_grade_id = DL.GLOBAL_GRADE_ID
LEFT OUTER JOIN
    calculate_sum_gauged(TO_DATE(DL.start_date, 'YYYY-MM-DD') + INTERVAL '1 DAY' ) TF2 ON
         TF2.STATION_ID = DL.DEVICE_ID AND TF2.global_grade_id = DL.GLOBAL_GRADE_ID
ORDER BY DL.start_date`
    return sequelizeHelper.executeQuery(sequelize, query, sequelize.QueryTypes.SELECT, transaction);
};

let ReportReconciliation = (obj, transaction) => {
//     select d.mahatati_code ,d.station_name, tran.*, del.*,P1,T1,P2,T2,P3,T3,P4,T4,P5,T5,P6,T6,P7,T7,P8,T8,P9,T9,P10,T10,P11,T11,P12,T12 from devices d
//     left outer join
//     (
//         SELECT
//     device_id,
//         MAX(CASE WHEN month_char = '${obj.date}-01' THEN total_volume END) AS "D1",
//         MAX(CASE WHEN month_char = '${obj.date}-02' THEN total_volume END) AS "D2",
//         MAX(CASE WHEN month_char = '${obj.date}-03' THEN total_volume END) AS "D3",
//         MAX(CASE WHEN month_char = '${obj.date}-04' THEN total_volume END) AS "D4",
//         MAX(CASE WHEN month_char = '${obj.date}-05' THEN total_volume END) AS "D5",
//         MAX(CASE WHEN month_char = '${obj.date}-06' THEN total_volume END) AS "D6",
//         MAX(CASE WHEN month_char = '${obj.date}-07' THEN total_volume END) AS "D7",
//         MAX(CASE WHEN month_char = '${obj.date}-08' THEN total_volume END) AS "D8",
//         MAX(CASE WHEN month_char = '${obj.date}-09' THEN total_volume END) AS "D9",
//         MAX(CASE WHEN month_char = '${obj.date}-10' THEN total_volume END) AS "D10",
//         MAX(CASE WHEN month_char = '${obj.date}-11' THEN total_volume END) AS "D11",
//         MAX(CASE WHEN month_char = '${obj.date}-12' THEN total_volume END) AS "D12"
//     FROM (
//         SELECT
//     device_id,
//         TO_CHAR(start_date, 'YYYY-MM') AS month_char,
//         ROUND(CAST(SUM(COALESCE(total_volume,0)) AS NUMERIC),2) AS total_volume
//     FROM
//     delivery_by_day_view
//     GROUP BY
//     TO_CHAR(start_date, 'YYYY-MM'),
//         device_id,
//         mahatati_code,device_station_name
// ) AS subquery
//     GROUP BY
//     device_id
// )as del on del.device_id = d.id
//     left outer join (
//         select dev.id,
//         a.total_volume AS "S1"
//         ,b.total_volume AS "S2",
//         c.total_volume AS "S3",
//         d.total_volume AS "S4",
//         e.total_volume AS "S5",
//         f.total_volume AS "S6",
//         g.total_volume AS "S7",
//         h.total_volume AS "S8",
//         i.total_volume AS "S9",
//         j.total_volume AS "S10",
//         k.total_volume AS "S11",
//         l.total_volume AS "S12"
//     from devices dev
//     left outer join get_transaction_sum('${obj.date}-01-01', '${obj.date}-02-01') as a on dev.id = a.device_id
//     left outer join get_transaction_sum('${obj.date}-02-01', '${obj.date}-03-01') as b on dev.id = b.device_id
//     left outer join get_transaction_sum('${obj.date}-03-01', '${obj.date}-04-01') as c on dev.id = c.device_id
//     left outer join get_transaction_sum('${obj.date}-04-01', '${obj.date}-05-01') as d on dev.id = d.device_id
//     left outer join get_transaction_sum('${obj.date}-05-01', '${obj.date}-06-01') as e on dev.id = e.device_id
//     left outer join get_transaction_sum('${obj.date}-06-01', '${obj.date}-07-01') as f on dev.id = f.device_id
//     left outer join get_transaction_sum('${obj.date}-07-01', '${obj.date}-08-01') as g on dev.id = g.device_id
//     left outer join get_transaction_sum('${obj.date}-08-01', '${obj.date}-09-01') as h on dev.id = h.device_id
//     left outer join get_transaction_sum('${obj.date}-09-01', '${obj.date}-09-10') as i on dev.id = i.device_id
//     left outer join get_transaction_sum('${obj.date}-10-01', '${obj.date}-11-01') as j on dev.id = j.device_id
//     left outer join get_transaction_sum('${obj.date}-11-01', '${obj.date}-12-01') as k on dev.id = k.device_id
//     left outer join get_transaction_sum('${obj.date}-12-01', '${parseInt(obj.date)+1}-01-01') as l on dev.id = l.device_id
// ) as tran on tran.id = d.id
//     left outer join (
//         SELECT
//     device_id,
//         MAX(CASE WHEN month_char = '${obj.date}-01' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T1,
//         MAX(CASE WHEN month_char = '${obj.date}-02' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T2,
//         MAX(CASE WHEN month_char = '${obj.date}-03' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours ' END) AS T3,
//         MAX(CASE WHEN month_char = '${obj.date}-04' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T4,
//         MAX(CASE WHEN month_char = '${obj.date}-05' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T5,
//         MAX(CASE WHEN month_char = '${obj.date}-06' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T6,
//         MAX(CASE WHEN month_char = '${obj.date}-07' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T7,
//         MAX(CASE WHEN month_char = '${obj.date}-08' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T8,
//         MAX(CASE WHEN month_char = '${obj.date}-09' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T9,
//         MAX(CASE WHEN month_char = '${obj.date}-10' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T10,
//         MAX(CASE WHEN month_char = '${obj.date}-11' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T11,
//         MAX(CASE WHEN month_char = '${obj.date}-12' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T12
//     FROM (
//         select TO_CHAR(date, 'YYYY-MM') as month_char ,device_id,
//         sum(EXTRACT(HOURS FROM (COALESCE(last_active_date,now()) - date))) +CAST(SUM(EXTRACT(MINUTES FROM (COALESCE(last_active_date, NOW()) - date)))/60 AS INT)AS hours_difference,
//         sum(EXTRACT(DAYS FROM (COALESCE(last_active_date,now()) - date))) AS days_difference
//     from notifications notif
//     where error like 'OFFLINE_TANK_ERROR'
//     group by TO_CHAR(date, 'YYYY-MM'),device_id
// ) AS sub_pumps
//     GROUP BY device_id
// ) as pumps on pumps.device_id = d.id
//     left outer join (
//         SELECT
//     device_id,
//         MAX(CASE WHEN month_char = '${obj.date}-01' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '   END) AS P1,
//         MAX(CASE WHEN month_char = '${obj.date}-02' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P2,
//         MAX(CASE WHEN month_char = '${obj.date}-03' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P3,
//         MAX(CASE WHEN month_char = '${obj.date}-04' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P4,
//         MAX(CASE WHEN month_char = '${obj.date}-05' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P5,
//         MAX(CASE WHEN month_char = '${obj.date}-06' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P6,
//         MAX(CASE WHEN month_char = '${obj.date}-07' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '   END) AS P7,
//         MAX(CASE WHEN month_char = '${obj.date}-08' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR)  || ' hours '  END) AS P8,
//         MAX(CASE WHEN month_char = '${obj.date}-09' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P9,
//         MAX(CASE WHEN month_char = '${obj.date}-10' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P10,
//         MAX(CASE WHEN month_char = '${obj.date}-11' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P11,
//         MAX(CASE WHEN month_char = '${obj.date}-12' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR)  || ' hours '  END) AS P12
//     FROM (
//         select TO_CHAR(date, 'YYYY-MM') as month_char ,device_id,
//         sum(EXTRACT(HOURS FROM (COALESCE(last_active_date,now()) - date))) +CAST(SUM(EXTRACT(MINUTES FROM (COALESCE(last_active_date, NOW()) - date)))/60 AS INT)AS hours_difference,
//         sum(EXTRACT(DAYS FROM (COALESCE(last_active_date,now()) - date))) AS days_difference
//     from notifications notif
//     where error like 'OFFLINE_PUMP_ERROR'
//     group by TO_CHAR(date, 'YYYY-MM'),device_id
// ) AS sub_tanks
//     GROUP BY device_id
// ) as tanks on tanks.device_id = d.id
    let query = `
  select d.mahatati_code ,d.station_name, tran.*, del.*,P1,T1,P2,T2,P3,T3,P4,T4,P5,T5,P6,T6,P7,T7,P8,T8,P9,T9,P10,T10,P11,T11,P12,T12 from devices d
left outer join
    (
        SELECT
               device_id,
    MAX(CASE WHEN month_char = '${obj.date}-01' THEN total_volume END) AS "D1",
    MAX(CASE WHEN month_char = '${obj.date}-02' THEN total_volume END) AS "D2",
    MAX(CASE WHEN month_char = '${obj.date}-03' THEN total_volume END) AS "D3",
    MAX(CASE WHEN month_char = '${obj.date}-04' THEN total_volume END) AS "D4",
    MAX(CASE WHEN month_char = '${obj.date}-05' THEN total_volume END) AS "D5",
    MAX(CASE WHEN month_char = '${obj.date}-06' THEN total_volume END) AS "D6",
    MAX(CASE WHEN month_char = '${obj.date}-07' THEN total_volume END) AS "D7",
    MAX(CASE WHEN month_char = '${obj.date}-08' THEN total_volume END) AS "D8",
    MAX(CASE WHEN month_char = '${obj.date}-09' THEN total_volume END) AS "D9",
    MAX(CASE WHEN month_char = '${obj.date}-10' THEN total_volume END) AS "D10",
    MAX(CASE WHEN month_char = '${obj.date}-11' THEN total_volume END) AS "D11",
    MAX(CASE WHEN month_char = '${obj.date}-12' THEN total_volume END) AS "D12"
FROM (
    SELECT
           device_id,
        TO_CHAR(start_date + INTERVAL '${obj.heure} hours', 'YYYY-MM') AS month_char,
        ROUND(CAST(SUM(COALESCE(total_volume,0)) AS NUMERIC),2) AS total_volume
    FROM
        delivery_by_day_view
    GROUP BY
        TO_CHAR(start_date + INTERVAL '${obj.heure} hours', 'YYYY-MM'),
        device_id
) AS subquery
GROUP BY
         device_id
        )as del on del.device_id = d.id
left outer join (
    SELECT
               device_id,
    MAX(CASE WHEN month_char = '${obj.date}-01' THEN total_volume END) AS "S1",
    MAX(CASE WHEN month_char = '${obj.date}-02' THEN total_volume END) AS "S2",
    MAX(CASE WHEN month_char = '${obj.date}-03' THEN total_volume END) AS "S3",
    MAX(CASE WHEN month_char = '${obj.date}-04' THEN total_volume END) AS "S4",
    MAX(CASE WHEN month_char = '${obj.date}-05' THEN total_volume END) AS "S5",
    MAX(CASE WHEN month_char = '${obj.date}-06' THEN total_volume END) AS "S6",
    MAX(CASE WHEN month_char = '${obj.date}-07' THEN total_volume END) AS "S7",
    MAX(CASE WHEN month_char = '${obj.date}-08' THEN total_volume END) AS "S8",
    MAX(CASE WHEN month_char = '${obj.date}-09' THEN total_volume END) AS "S9",
    MAX(CASE WHEN month_char = '${obj.date}-10' THEN total_volume END) AS "S10",
    MAX(CASE WHEN month_char = '${obj.date}-11' THEN total_volume END) AS "S11",
    MAX(CASE WHEN month_char = '${obj.date}-12' THEN total_volume END) AS "S12"
FROM (

    select sgv.device_id ,TO_CHAR(finish_date + INTERVAL '${obj.heure} hours', 'YYYY-MM') AS month_char,ROUND(CAST(SUM(COALESCE(volume,0)) AS NUMERIC),2) AS total_volume from transactions
    ts LEFT OUTER JOIN secteur_grades_views sgv ON ts.grade_id = sgv.grade_id
    group by  TO_CHAR(finish_date + INTERVAL '${obj.heure} hours', 'YYYY-MM'),
        device_id

) AS subquery
GROUP BY
         device_id
    ) as tran on tran.device_id = d.id
left outer join (
    SELECT
           device_id,
    MAX(CASE WHEN month_char = '${obj.date}-01' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T1,
    MAX(CASE WHEN month_char = '${obj.date}-02' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T2,
    MAX(CASE WHEN month_char = '${obj.date}-03' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours ' END) AS T3,
    MAX(CASE WHEN month_char = '${obj.date}-04' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T4,
    MAX(CASE WHEN month_char = '${obj.date}-05' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T5,
    MAX(CASE WHEN month_char = '${obj.date}-06' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T6,
    MAX(CASE WHEN month_char = '${obj.date}-07' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T7,
    MAX(CASE WHEN month_char = '${obj.date}-08' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T8,
    MAX(CASE WHEN month_char = '${obj.date}-09' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T9,
    MAX(CASE WHEN month_char = '${obj.date}-10' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T10,
    MAX(CASE WHEN month_char = '${obj.date}-11' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T11,
    MAX(CASE WHEN month_char = '${obj.date}-12' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS T12
FROM (
        select TO_CHAR(date + INTERVAL '${obj.heure} hours', 'YYYY-MM') as month_char ,device_id,
       sum(EXTRACT(HOURS FROM (COALESCE(last_active_date,now()) - date))) +CAST(SUM(EXTRACT(MINUTES FROM (COALESCE(last_active_date, NOW()) - date)))/60 AS INT)AS hours_difference,
       sum(EXTRACT(DAYS FROM (COALESCE(last_active_date,now()) - date))) AS days_difference
        from notifications notif
        where error like 'OFFLINE_TANK_ERROR'
        group by TO_CHAR(date + INTERVAL '${obj.heure} hours', 'YYYY-MM'),device_id
) AS sub_pumps
GROUP BY device_id
    ) as pumps on pumps.device_id = d.id
left outer join (
    SELECT
           device_id,
    MAX(CASE WHEN month_char = '${obj.date}-01' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '   END) AS P1,
    MAX(CASE WHEN month_char = '${obj.date}-02' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P2,
    MAX(CASE WHEN month_char = '${obj.date}-03' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P3,
    MAX(CASE WHEN month_char = '${obj.date}-04' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P4,
    MAX(CASE WHEN month_char = '${obj.date}-05' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P5,
    MAX(CASE WHEN month_char = '${obj.date}-06' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P6,
    MAX(CASE WHEN month_char = '${obj.date}-07' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '   END) AS P7,
    MAX(CASE WHEN month_char = '${obj.date}-08' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR)  || ' hours '  END) AS P8,
    MAX(CASE WHEN month_char = '${obj.date}-09' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P9,
    MAX(CASE WHEN month_char = '${obj.date}-10' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P10,
    MAX(CASE WHEN month_char = '${obj.date}-11' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR) || ' hours '  END) AS P11,
    MAX(CASE WHEN month_char = '${obj.date}-12' THEN CAST(days_difference AS VARCHAR) || ' days ' || CAST(hours_difference AS VARCHAR)  || ' hours '  END) AS P12
FROM (
        select TO_CHAR(date + INTERVAL '${obj.heure} hours', 'YYYY-MM') as month_char ,device_id,
       sum(EXTRACT(HOURS FROM (COALESCE(last_active_date,now()) - date))) +CAST(SUM(EXTRACT(MINUTES FROM (COALESCE(last_active_date, NOW()) - date)))/60 AS INT)AS hours_difference,
       sum(EXTRACT(DAYS FROM (COALESCE(last_active_date,now()) - date))) AS days_difference
        from notifications notif
        where error like 'OFFLINE_PUMP_ERROR'
        group by TO_CHAR(date + INTERVAL '${obj.heure} hours', 'YYYY-MM'),device_id
) AS sub_tanks
GROUP BY device_id
    ) as tanks on tanks.device_id = d.id;
  `;
    return sequelizeHelper.executeQuery(sequelize, query, sequelize.QueryTypes.SELECT, transaction);
};


module.exports = {
    findAllDelivery,
    ReportReconciliation
};


