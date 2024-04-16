const moment = require('moment');
module.exports = { //used
    getDateTimeFormatAttacher: () => {
        return moment(new Date()).format('YYYYMMDDHHmmssSS');
    }, getDateTimeFormat: () => {
        return moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    }, getFullDateFormat: (date = new Date()) => {
        return moment(date).format('YYYY-MM-DD');
    }, getDateAttacher: (date = new Date()) => {
        return moment(date).format('YYYYMMDD');
    }, getTomorrowDate: (date = new Date()) => {
        date.setDate(date.getDate() + 1);
        return moment(date).format('YYYY-MM-DD');
    }, getAllDaysOfMonth: (date) => {
        const month = date.getUTCMonth();
        date.setDate(1);
        let days = [];
        while (date.getUTCMonth() == month) {
            days.push(moment(new Date(date.getFullYear(), month, date.getUTCDate())).format('YYYY-MM-DD'));
            date.setDate(date.getUTCDate() + 1);
        }
        return days;
    }, getDatesBetweenTwoDates: (dateMin, dateMax) => {
        if (dateMin < dateMax) {
            let dates = [dateMin];
            let isOK = false;
            while (!isOK) {
                const lastPushedDate = dates[dates.length - 1];
                if (lastPushedDate < dateMax) {
                    const date = new Date(lastPushedDate);
                    dates.push(moment(date.setDate(date.getUTCDate() + 1)).format('YYYY-MM-DD'))
                } else isOK = true
            }
            return dates;
        } else return [];
    }, isValidDate: (dateStr) => {
        const date = new Date(dateStr);
        if (Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date)) {             // Check if the input string matches the parsed date.
            const parsedDateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            return dateStr === parsedDateStr;
        }
        return false;
    }
};

