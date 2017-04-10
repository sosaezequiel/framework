var Command = {
    // UI
    execUI: function (url, commandName, args, options, success) {
        var me = this;
        _.extend(options, this._defaultOptions);

        me.popupProgreso = AreaMensajes.popupMensajeAccionEnProgreso(3 * 10000);

        this._exec(url, commandName, args, options, function (data) {
            if (!success) Log.debug('sin rutina success en Command.execUI');

            me.popupProgreso.cancelar();

            if (success) success(data);
        }, this._TEcallback, this._FEcallback, this._serverfailure);
    },
    // Private
    _defaultOptions: {
        includeServerMetrics: true,
        includeClientMetrics: true
    },
    _TEcallback: function (status, issue_no, sender) {
        sender.popupProgreso.cancelar();
        AreaMensajes.popupMensajeErrorTecnico('Error Tecnico', 'Codigo de Error: {0}, Numero de identificacion de incidente: {1}'.format(status, issue_no));
    },
    _FEcallback: function (status, sender) {
        sender.popupProgreso.cancelar();
        AreaMensajes.popupMensajeErrorFuncional('Error de Validacion', 'Codigo de Error: {0}'.format(status));
    },
    _serverfailure: function (errorThrown, sender) {
        sender.popupProgreso.cancelar();
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
    _convertFromWCFDictionary: function (wcfDictionaryArray) {
        var r = {};

        if (!wcfDictionaryArray) return r;

        for (var i = 0; i < wcfDictionaryArray.length; i++) {
            r[wcfDictionaryArray[i].Key] = wcfDictionaryArray[i].Value;
        }

        return r;
    },
    _exec: function (url, commandName, args, options, success, teCallback, feCallback, failure) {
        var me = this;

        var clientStartTime;

        options = options ? options : me._defaultOptions;

        if (options.includeClientMetrics) {
            clientStartTime = performance.now();
        }

        Log.debug('dispatching command {0} to run!', commandName);


        var command = {};

        var namespaceIndex = commandName.indexOf('.');

        _module = commandName.substr(0, namespaceIndex);
        if (_module.trim().length <= 0) _module = 'Core';
        _command = commandName.substr(namespaceIndex + 1, commandName.length);

        command.__type = '{0}:#MAE.PM.{1}'.format(_command, _module);

        command.Options = me._convertToWCFDictionary(options);

        //Object.assign(command, args); // Primero tiene que viajar __type
        _.assign(command, args); // Primero tiene que viajar __type

        command.SecurityTokenId = AppContext.SECURITY_TOKEN_ID;

        this._autoTrimStrings(command);

        $.ajax({
            url: url, //'service/Command/CommandService.svc/executeCommand',
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(command),
            success: function (data, textStatus, jqXHR) {
                var r = {};

                // (*) when using C# WCF 4.0 <webHttp automaticFormatSelectionEnabled="true"   /> data.d.Data is not needed.

                r.data = data.Data; // (*) 
                r.metaData = me._convertFromWCFDictionary(data.MetaData); // (*) 
                r.status = data.Status; // (*) 

                if (options.includeClientMetrics) {
                    var clientEndTime = performance.now();
                    r.metaData.clientMetrics = clientEndTime - clientStartTime;

                    Log.debug('command round-trip was: {0}ms', r.metaData.clientMetrics);
                }

                if (options.includeServerMetrics) {
                    Log.debug('command server runtime was: {0}ms', r.metaData.serverMetrics);
                }

                var typeOfStatus = r.status.substr(0, 2);

                switch (typeOfStatus) {
                    case "TE":
                        var issue_no = r.data;
                        Log.error('{2} - command {0} ABENDED with issue identifier: {1}', commandName, issue_no, r.status);
                        teCallback(r.status, issue_no, me);
                        break;
                    case "FE":
                        Log.debug('{1} - cannot run command {0} because of security privilegdes not granted!', commandName, r.status);
                        feCallback(r.data, me);
                        break;
                    case "EX":
                        Log.debug('{1} - command {0} dispatched/ran OK!', commandName, r.status);
                        success(r.data);
                        break;
                    default:
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                _hideLoading(AppContext.ClickedButton);
                $('button[disabled]').removeAttr('disabled');
                Log.error('* * * command {0} ABENDED because of technical issue of remote server or network connectivity: {1}', commandName, errorThrown);
                Log.debug('command round-trip was: {0}ms', performance.now() - clientStartTime);
                failure(errorThrown, me);
                // error tecnico en cliente o server, registrar numero de incidente para seguimiento
            }
        });
    },

    createCommandContract: function (commandName) {
        var command = {};
        var clientStartTime;
        var options = this._defaultOptions;
        var namespaceIndex = commandName.indexOf('.');

        _module = commandName.substr(0, namespaceIndex);
        if (_module.trim().length <= 0) _module = 'Core';
        _command = commandName.substr(namespaceIndex + 1, commandName.length);

        command.cmdType = '{0}:#MAE.PM.{1}'.format(_command, _module);
        command.SecurityTokenId = AppContext.SECURITY_TOKEN_ID;

        this._autoTrimStrings(command);
        return command;
    },

    _autoTrimStrings: function (dto) {
        for (var p in dto) {
            if (typeof dto[p] === 'string') {
                dto[p] = dto[p].trim();
            }
        }
    },
    _resolveCallerBtn: function (args) {
        var $btn = null;
        if (!args.callee.caller) return null;
        if (args.callee.caller.arguments.length > 0 && args.callee.caller.arguments[0].handleObj.type == 'click')
            return $(args.callee.caller.arguments[0].currentTarget);
        else return this._resolveCallerBtn(args.callee.caller.arguments);

    }
};