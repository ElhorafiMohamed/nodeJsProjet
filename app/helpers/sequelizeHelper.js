const {WsResponse} = require('./wsResponseHelper');
const {HttpStatus} = require('./httpStatusHelper.enum');

module.exports = {

    findAll: (entity, conditions) => {
        return entity
            .findAll(conditions)
            .then((data) => {
                return new WsResponse(HttpStatus.OK, '', data);
            }).catch((err) => {
                throw new WsResponse(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err);
            });
    },

    findOne: (entity, conditions, transaction) => {
        return entity
            .findOne({where: conditions}, transaction)
            .then((data) => {
                return new WsResponse(HttpStatus.OK, '', data);
            }).catch((err) => {
                throw new WsResponse(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err);
            });
    },

    create: (entity, obj, transaction) => {
        return entity
            .create(obj, {transaction: transaction})
            .then((data) => {
                return new WsResponse(HttpStatus.OK, '', data);
            }).catch((err) => {
                throw new WsResponse(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err);
            });
    },

    upsert: (entity, obj) => {
        return entity
            .upsert(obj)
            .then((data) => {
                return new WsResponse(HttpStatus.OK, '', data);
            }).catch((err) => {
                throw new WsResponse(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err);
            });
    },

    update: (entity, oldValue, newValue, transaction) => {
        return entity
            .update(newValue, {where: oldValue, transaction: transaction})
            .then((data) => {
                return new WsResponse(HttpStatus.OK, '', data);
            }).catch((err) => {
                throw new WsResponse(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err);
            });
    },

    delete: (entity, condition) => {
        return entity
            .destroy({where: {condition}})
            .then((data) => {
                return new WsResponse(HttpStatus.OK, '', data);
            }).catch((err) => {
                throw new WsResponse(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err);
            });
    },

    executeQuery: (db, query, queryType, transaction) => {
        return db.query(query, {type: queryType, transaction})
            .then(data => {
                return new WsResponse(HttpStatus.OK, '', data);
            }).catch((err) => {
                throw new WsResponse(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err);
            });
    },


    creatIfNotExists: (entity, condition, obj) => {
        return entity
            .findOrCreate({where: condition, defaults: obj})
            .then((data) => {
                return new WsResponse(HttpStatus.OK, '', data);
            }).catch((err) => {
                throw new WsResponse(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err);
            });
    },

    createManagedTransaction: async (queries, db, myTransaction) => {

        return db.transaction(async transaction => {
            try {
                myTransaction = transaction;
                return await queries;
            } catch (err) {
                transaction.rollback();
                throw new WsResponse(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err);
            }
        })
    },

    insertIfNotExistQuery: (table, conditions, columns, values, output, db, transaction) => {
        const query = ` IF NOT EXISTS (
                          SELECT * FROM ${table} WHERE ${conditions} )
                        BEGIN
                          INSERT INTO ${table} (${columns}) 
                               OUTPUT ${output}
                               VALUES ${values}
                        END `;
        return db.query(query, {type: db.QueryTypes.INSERT, transaction})
            .then(data => {
                return new WsResponse(HttpStatus.OK, '', data);
            }).catch((err) => {
                throw new WsResponse(HttpStatus.INTERNAL_SERVER_ERROR, err.message, err);
            });
    },

};
