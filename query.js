var Query = {
    // UI
    execGridUI: function (url, queryName, filters, options, success) {
        var me = this;

        var popupProgreso = AreaMensajes.popupMensajeAccionEnProgreso(5 * 10000);
        //var options = { requireIdentityFilter: true };
        _.extend(options, this._defaultOptions);

        this._exec(url, queryName, 'Grid', filters, options, function (data, jqXHR) {

            popupProgreso.cancelar();

            //if (data.length == 0) AreaMensajes.toastInfo('NO HAY REGISTROS CON EL FILTRO SELECCIONADO');
            success(data, jqXHR);
        }, this._TEcallback, this._FEcallback, this._serverfailure);
    },

    execCombosUI: function (url, queryName, options, filters, success) {
        var me = this;

        _.extend(options, this._defaultOptions);

        this._exec(url, queryName, 'Combos', filters, options, function (data) {
            success(data);
        }, this._TEcallback, this._FEcallback, this._serverfailure);
    },

    execAutoCompleteUI: function (url, queryName, filters, options, success) {
        var me = this;
        _.extend(options, this._defaultOptions);
        this._exec(url, queryName, 'Combos', filters, options, function (data) {
            success(data);
        }, this._TEcallback, this._FEcallback, this._serverfailure);
    },

    execReadFullRecordUI: function (url, queryName, _nombreCampoIdentidad, r_id, options, success) {
        var me = this;
        _.extend(options, this._defaultOptions);
        var param = (param = {}, param[_nombreCampoIdentidad] = r_id, param);

        this._exec(url, queryName, 'FullRecord', param, options, function (data) {
            success(data);
        }, this._TEcallback, this._FEcallback, this._serverfailure);
    },

    execDataUI: function (url, queryName, filters, success) {
        var me = this;
        var options = { requireIdentityFilter: true };

        //Object.assign(options, this._defaultOptions) NO FUNCA EN IE
        _.extend(options, this._defaultOptions);

        Query._exec(url, queryName, 'Data', filters, options, function (data) {
            success(data);
        });
    },

    execSimpleQuery: function (queryname, filtros, requiereIdentity, cb) {
        var options = { returnColumnNames: true };
        if (requiereIdentity)
            options.requireIdentityFilter = true;

        Query.execGridUI(AppContext.QueryServices, queryname, filtros, options, function (data, jqXHR) {

            if (cb != null && typeof (cb) == 'function') {
                var result = JSON.parseWithDate(jqXHR.responseText);
                var resultWithColumns = [];

                for (var i = 0; i < result.Data.length; i++) {
                    resultWithColumns.push(_.zipObject(result.ColumnNames, result.Data[i]));
                }
                result.Data = resultWithColumns;
                cb(result);
            }

        }, null, null, null);
    },

    execQueryGridHelper: function (queryname, filtros, requiereIdentity, cb) {
        var options = { returnColumnNames: true };
        if (requiereIdentity)
            options.requireIdentityFilter = true;

        Query.execGridUI(AppContext.QueryServices, queryname, filtros, options, function (data, jqXHR) {

            if (cb != null && typeof (cb) == 'function') {
                var result = JSON.parseWithDate(jqXHR.responseText);
                var resultWithColumns = [];

                for (var i = 0; i < result.Data.length; i++) {
                    resultWithColumns.push(_.zipObject(result.ColumnNames, result.Data[i]));
                }
                result.Data = resultWithColumns;
                cb(result, data);
            }

        }, null, null, null);
    },

    // Private
    _defaultOptions: {
        includeServerMetrics: true,
        includeClientMetrics: true
    },
    _TEcallback: function (status, issue_no) {
        AreaMensajes.popupMensajeErrorTecnico('Error Tecnico', 'Codigo de Error: {0}, Numero de identificacion de incidente: {1}'.format(status, issue_no));
    },
    _FEcallback: function (status) {
        AreaMensajes.popupMensajeErrorFuncional('Error de Datos', 'Codigo de Error: {0}'.format(status));
    },
    _serverfailure: function (errorThrown) {
        AreaMensajes.popupMensajeErrorTecnico('Error en Servidor', 'La aplicacion no puede conectarse al servidor o el servidor no puede responder a la peticion. Intente mas tarde.');
    },
    _convertToWCFDictionary: function (o) {
        var r = [];

        if (!o) return r;

        for (var e in o) {
            r.push({
                Key: e,
                Value: o[e]
            });
        }
        return r;
    },

    _exec: function (url, queryName, type, filters, options, success, teCallback, feCallback, failure) {
        Pace.restart();
        var me = this;

        var clientStartTime;

        options = options ? options : me._defaultOptions;
        filters = filters ? filters : {};

        if (options.includeClientMetrics) {
            clientStartTime = performance.now();
        }

        Log.debug('dispatching query {0} to run!', queryName);

        var query = {
            Name: EncryptData(queryName),
            Filters: me._convertToWCFDictionary(filters),
            Type: type.capitalizeFirstLetter(),
            Options: me._convertToWCFDictionary(options),
            SecurityTokenId: AppContext.SECURITY_TOKEN_ID
        }

        this._autoTrimStrings(query);

        $.ajax({
            url: url,
            type: 'POST', //TODO  cambiar a POST
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({ Query: query }),
            success: function (data, textStatus, jqXHR) {
                var r = {};
                r.data = data.Data; // (*) 
                r.metaData = data.MetaData; // (*) 
                r.status = data.Status; // (*) 

                if (options.includeClientMetrics) {
                    var clientEndTime = performance.now();
                    r.metaData = r.metaData || {};
                    r.metaData.clientMetrics = clientEndTime - clientStartTime;

                    Log.debug('query round-trip was: {0}ms', r.metaData.clientMetrics);
                }

                if (options.includeServerMetrics) {
                    Log.debug('query server runtime was: {0}ms', r.metaData.serverMetrics);
                }

                var typeOfStatus = r.status.substr(0, 2);

                switch (typeOfStatus) {
                    case "TE":
                        var issue_no = r.data;
                        Log.error('{2} - query {0} ABENDED with issue identifier: {1}', queryName, issue_no, r.status);
                        teCallback(r.status, issue_no);
                        break;
                    case "FE":
                        Log.debug('{1} - cannot run query {0} because of security privilegdes not granted!', queryName, r.status);
                        feCallback(r.status);
                        break;
                    case "EX":
                        Log.debug('{1} - query {0} run OK!', queryName, r.status);
                        if (options.ejecutaRowCustomQuery == true || options.filtersAdapter == true || options.gridAdapter == true)
                            success(data.Data, jqXHR)
                        else
                            success(me._parseResult(type, data), jqXHR);
                        break;
                    case "SE": //Session expirada
                        Log.debug('{1} - cannot run query {0} because your session has expired!', queryName, r.status);
                        window.location.href = WebURL + "main";
                        break;
                    default:
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                Log.error('* * * query {0} ABENDED because of technical issue of remote server or network connectivity: {1}', queryName, errorThrown);
                Log.debug('query round-trip was: {0}ms', performance.now() - clientStartTime);
                me.failure(errorThrown);
                // error tecnico en cliente o server, registrar numero de incidente para seguimiento
            }
        });
    },

    _parseResult: function (type, data) {
        var me = this;
        switch (type) {
            case 'Grid':
                return me._parseGridResult(data);
                break;
            case 'Combos':
                return me._parseCombosResult(data);
                break;
            case 'Data':
                return me._parseDataResult(data);
                break;
            case 'FullRecord':
                return me._parseFullRecordResult(data);
                break;
            default:
                Log.error('parsing QUERY result ({0}) INTERNAL ERROR'.format(type));
                throw 'INTERNAL ERROR';
        }
    },
    _parseGridResult: function (data) {
        var rGrid = jQuery.extend({}, data);
        delete rGrid.MetaData;
        delete rGrid.Status;
        rGrid.data = rGrid.Data;
        delete rGrid.Data;
        return rGrid;
    },
    _parseDataResult: function (data) {
        return data.Data;
    },
    _parseCombosResult: function (dataset) {
        var me = this;
        var r = {};

        for (var i = 0; i < dataset.Data.length; i++) {
            r[i] = me._convertToKeyPair(dataset.Data[i]);
        }

        return r;
    },
    _parseFullRecordResult: function (dataset) {
        var me = this;
        var r = {};

        for (var i = 0; i < dataset.Data.length; i++) {
            r[i] = me._convertToKeyPair(dataset.Data[i]);
        }

        return r;
    },
    _convertToKeyPair: function (dataset) {
        var columns = dataset.Columns;

        var r = [];
        for (var i = 0; i < dataset.Data.length; i++) {
            var e = {};
            for (var j = 0; j < columns.length; j++) {
                e[columns[j]] = dataset.Data[i][j];
            }
            r.push(e);
        }
        return r;
    },
    _autoTrimStrings: function (dto) {
        for (var p in dto) {
            if (typeof dto[p] === 'string') {
                dto[p] = dto[p].trim();
            }
        }
    },
    failure: function (err) {
        AreaMensajes.popupMensajeErrorTecnico('Error en Servidor', err.message);
    },

};
