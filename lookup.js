var CustomLookUp = {
    initLookUp: function (el, sender) {
        var me = this;
        var lookup = {};
        lookup.abm = sender;
        lookup.element = el;
        lookup.id = el.attr('id');
        lookup.popupName = '';
        lookup.title = el.attr('data-title');
        lookup.isGeneric = el.attr('data-is-generic') || true;
        lookup.isNoRequired = el.attr('data-valor-no-requerido');
        lookup.params = eval(el.attr('data-params') || null);
        lookup.modelName = el.attr('data-query');
        lookup.gridAdapter = el.attr('data-grid-adapter');
        lookup.forAction = el.attr('data-for-action');
        lookup.onChange = window[el.attr('data-on-change')] || null;
        lookup.dependentOf = (el.attr('data-filters').length > 1) ? el.attr('data-filters').trim().split(',') : '';
        lookup.isDisabled = el.attr('data-is-disabled') || lookup.dependentOf.length > 0;
        lookup.service = el.attr('data-serviceClass').split('.');
        lookup.columnDef = window[el.attr('data-column-def')];

        if (lookup.isNoRequired != 'true')
            el.removeAttr('data-valor-no-requerido');

        this.initFilterControls(lookup, lookup.modelName);

        lookup.filtros = this.makeDTOFiltro(lookup);

        lookup.identityField = el.attr('data-value-item');
        lookup.displayField = el.attr('data-display-item');
        lookup.btnTrigger = el.parent().find("#btnPopup-{0}".format(lookup.modelName));
        if (lookup.isDisabled == true || lookup.isDisabled == 'true') {
            el.attr('disabled', true);
            lookup.btnTrigger.attr('disabled', true);
        }

        if (Formulario._formularios[sender._nombrePantalla]['popup-lookup-{0}-{1}-{2}'.format(lookup.modelName, lookup.forAction, lookup.id)])
            _.remove(Formulario._formularios[sender._nombrePantalla]['popup-lookup-{0}-{1}-{2}'.format(lookup.modelName, lookup.forAction, lookup.id)]);
        Formulario.initFormulario('popup-lookup-{0}-{1}-{2}'.format(lookup.modelName, lookup.forAction, lookup.id), 'Buscar {0}'.format(lookup.title), false, sender)


        lookup.onOpenLookup = function () {
            me.loadFilterFields(lookup);
            me.loadCombosDataSource(lookup);
            me.loadGrid(lookup);
        }

        lookup.onCloseLookup = function () {

        }

        lookup.onAccept = function (lkpName) {
            dt = $("div[modal_open_id={0}] div[id*=gridLookup]".format(lkpName)).data("kendoGrid");
            var sel = dt.select();
            if (sel.length == 0) {
                AreaMensajes.toastInfo('Debe seleccionar un registro');
                return true;
            }
            else {
                var data = dt.dataItem(sel[sel.length - 1]);
                var r_id = data[lookup.identityField];
                lookup.element.attr('data-codigo-id', r_id);
                lookup.element.val(data[lookup.displayField]);
                lookup.element.data('DataRow', data);
                var pop = $("div[modal_open_id={0}]".format(lkpName));
                pop.modal('hide');
                lookup.element.trigger('data-change', lookup.element);
            }


        };

        lookup.setDisable = function () {
            lookup.element.IsEnabled(false);
            lookup.btnTrigger.IsEnabled(false);
        };

        lookup.setEnable = function () {
            lookup.element.IsEnabled(true);
            lookup.btnTrigger.IsEnabled(true);
        };

        lookup.element.data('CustomLookUp', lookup);

        return lookup;
    },

    initEvents: function (lkp) {
        var me = this;
        lkp.btnTrigger.on('click', function (e) {
            var pop = Formulario.popupFormulario('popup-lookup-{0}-{1}-{2}'.format(lkp.modelName, lkp.forAction, lkp.id), lkp.onAccept, lkp.abm, {
                onOpen: lkp.onOpenLookup, onClose: lkp.onCloseLookup, modalWidth: 'modal-lg'
            }, null);
            lkp.popupName = pop.attr('modal_open_id');
        });

        if (lkp.dependentOf.length > 0) {
            for (var i = 0; i < lkp.dependentOf.length; i++) {
                if (eval(lkp.dependentOf[i])) {
                    var dep = lkp.dependentOf[i].trim();
                    var f = lkp.element.closest('.modal-dialog').find('#{0}'.format(dep));
                    f.on('change', function (ev) {
                        proxyDependentChangeTrigger(lkp);
                    });
                    if (f.attr('data-is-autocomplete') || f.attr('data-is-combo')) {
                        f.on('data-change', function (ev) {
                            proxyDependentChangeTrigger(lkp);
                        })
                    }
                }
            }
        }

        function proxyDependentChangeTrigger(lk) {
            //setTimeout(function () {
            lk.element.IsEnabled(dependentHasValues(lk));
            lk.element.val(null);
            lk.element.attr('data-codigo-id', '');
            lk.btnTrigger.IsEnabled(dependentHasValues(lk));
            //}, 0);
        }

        function dependentHasValues(lk) {

            var noValuePresent = false;
            for (var i = 0; i < lk.dependentOf.length; i++) {
                if (eval(lk.dependentOf[i])) {
                    var dep = lkp.dependentOf[i].trim();
                    var f = lk.element.closest('.modal-dialog').find('#{0}'.format(dep));
                    if (f.val().length == 0) {
                        noValuePresent = true;
                        return false;
                    }
                }
            }
            return !noValuePresent;
        }

        $(document).on('data-change', lkp.element, function (ev, ctx) {
            ev.stopPropagation();
            if (lkp.onChange && typeof (lkp.onChange) === 'function' && $(ctx).attr('id') == lkp.element.attr('id'))
                lkp.onChange.apply(lkp.abm, [lkp.element, lkp.element.attr('data-codigo-id'), lkp.element.val()]);

            return;
        });

    },

    loadGrid: function (lkp) {
        var me = this;
        var kg = Grilla.init(
            {
                estadoGrilla: lkp.columnDef,
                selGrilla: "gridLookup-{0}-{1}-{2}".format(lkp.modelName, lkp.forAction, lkp.id),
                nombreEntidadPlural: lkp.modelName,
                textoSinRegistros: 'NO HAY DATOS PARA MOSTRAR',
                pagination: true,
                height: 300
            },
            null,
            this,
            function (queryData, callback, settings) {
                me.getDataGrid(lkp, queryData, callback, settings);
            },
            null,
            function (e, sender) {
                return me.onGrillaDataBound(e, sender, lkp);
            }
        );
    },

    getDataGrid: function (lkp, queryData, cb, settings) {
        var filtros = this.makeDTOFiltro(lkp);

        filtros.pageNumber = queryData.page;
        filtros.pageSize = queryData.pageSize;
        if (lkp.dependentOf) {
            for (var i = 0; i < lkp.dependentOf.length; i++) {
                if (eval(lkp.dependentOf[i])) {
                    var dep = lkp.dependentOf[i].trim();
                    var f = lkp.element.closest('.modal-dialog').find('#{0}'.format(dep));
                    if (f.length == 0) // no estoy en un modal dialog... debo estar en popup-filtros
                        f = lkp.element.closest('.popup-filtros').find('#{0}'.format(dep));

                    //cuando tengo varios dependientes del mismo origen. ejm: IdMoneda EF y IdMoneda VN
                    //El id de los dependientes los establesco diferentes, y agrego el attributo data-name que servira de key
                    var keyDependent = '';
                    if (f.attr('data-name'))
                        keyDependent = f.attr('data-name')
                    else
                        keyDependent = dep;

                    if (f.attr('data-is-combo')) {
                        var fname = f.attr('data-key-item');
                        filtros[keyDependent] = f.attr('data-codigo-id') || null;
                    }
                    else if (f.attr('data-is-autocomplete')) {
                        var fname = f.attr('data-value-item');
                        filtros[keyDependent] = f.attr('data-codigo-id') || null;
                    }
                    else filtros[keyDependent] = f.val() || null;
                }
            }
        }
        var options = {};
        if (lkp.service[1])
            options = { 'extendToKnownType': lkp.service[1], 'returnColumnNames': true };
        else
            options = { 'returnColumnNames': true };

        var query = 'QRY_SCRN_{0}_FILTERS_BUNDLE'.format(lkp.modelName);
        if (lkp.gridAdapter) {
            query = lkp.modelName;
            options.gridAdapter = true;
        }

        if (lkp.gridAdapter) {
            query = lkp.modelName;
            options.gridAdapter = true;
        }

        Query.execGridUI(AppContext.QueryServices,
            query,
            filtros,
            options,
            function (data, jqXHR) {
                if (cb != null && typeof (cb) == 'function') {
                    var result = JSON.parseWithDate(jqXHR.responseText);
                    if (!options.hasOwnProperty('gridAdapter')) {
                        var resultWithColumns = [];
                        for (var i = 0; i < result.Data.length; i++) {
                            resultWithColumns.push(_.zipObject(result.ColumnNames, result.Data[i]));
                        }
                    } else
                        resultWithColumns = data;

                    result.Data = resultWithColumns;
                    cb(result, data, settings);

                }

            }, null, null, null)
    },

    onGrillaDataBound: function (e, sender, lkp) {
        $(e.sender.table).find('tr').on('dblclick', function () {
            lkp.onAccept(lkp.popupName);
            var pop = $('#popups-formularios').find('[modal_open_id={0}]'.format(lkp.popupName));
            pop.modal('hide');
        });
    },

    initFilterControls: function (lkp, js) {
        if (JSON.parse(lkp.isGeneric) == false) {
            $.loadScript(WebURL + 'Scripts/app/lookups/' + js + '.js', function (d) {
                var cl = window[js];
                cl.init(lkp.params);
                lkp.filterControls = cl.filtros;
            });
        }
    },

    loadFilterFields: function (lkp) {
        var me = this;
        var filterControls = (JSON.parse(lkp.isGeneric) == true) ? lkp.columnDef : lkp.filterControls;

        var filterCont = $("#popup-lookup-{0}-{1}-{2}".format(lkp.modelName, lkp.forAction, lkp.id)).find("#lookup-filters-{0}".format(lkp.modelName));
        filterCont.html('');
        if (filterControls) {
            for (var i = 0; i < filterControls.length; i++) {
                var clsHidden = (filterControls[i].hidden || lkp.dependentOf.indexOf(filterControls[i].field) >= 0) ? 'none' : 'block';
                var groupHidden = (filterControls[i].hidden || lkp.dependentOf.indexOf(filterControls[i].field) >= 0) ? 'hidden' : '';
                var inputValue = filterControls[i].value || '';
                if (filterControls[i].filterable) {
                    var group = $('<div id="" class="form-group mg1R relative ' + groupHidden + ' ">');
                    me.createFilterElement(group, lkp, filterControls[i], inputValue, clsHidden);
                    filterCont.append(group);
                }
            }
            var btnSearch = $('<button class="button short btn-default fill-secondary brd-secondary mg1T" type="button"><i class="fa fa-search cl-white"></i> Buscar</button>');
            btnSearch.on('click', function () {
                dt = $("#gridLookup-{0}-{1}-{2}".format(lkp.modelName, lkp.forAction, lkp.id)).data("kendoGrid");
                dt.dataSource.fetch();
            });
            filterCont.append($('<div class="form-group mg1T"><label>').append(btnSearch));
        }
    },

    createFilterElement: function (group, lkp, fControl, value, cls) {
        if (fControl.type == 'text' || lkp.isGeneric == true || fControl.type == undefined) {
            group.append('<label for="' + fControl.field + '" style="display: ' + cls + ';">' + fControl.title + '</label>');
            group.append('<input id="' + lkp.id + "_" + fControl.field + '" type="text" value="' + value + '" class="form-control input-sm" style="width: auto; display: ' + cls + '" />');
        }
        if (fControl.type == 'combo') {
            group.append('<label for="' + fControl.field + '" style="display: ' + cls + ';">' + fControl.title + '</label>');
            //var cmb = $('<input id="' + lkp.id + "_" + fControl.field + '" data-is-combo=true data-provide="typeahead" autocomplete="off" type="text" value="' + value + '" class="form-control input-sm" style="width: auto; display: ' + cls + '" />');
            var strCmb = '<input id="{0}_{1}" data-model="{2}" data-is-combo=true data-provide="typeahead" autocomplete="off" type="text" value="{3}" data-codigo-id="{3}" class="form-control input-sm" style="width: auto; display:{4}" />';
            var cmb = strCmb.format(lkp.id, fControl.field, fControl.model, value, cls);
            group.append(cmb);
            group.append('<span class="fa fa-angle-down form-control-down-arrow" aria-hidden="true" style="display: ' + cls + '"></span>');
        }
        if (fControl.type == 'lookup') {
            var lkpCloned = $('div#{0}'.format('reutilizableLookup')).clone();
            var innerLkp = lkpCloned.html().trim();
            var id = lkp.id + "_" + fControl.field;
            innerLkp = innerLkp.format(id, id, fControl.title, fControl.model, fControl.keyItem, fControl.displayItem, fControl.dependentOf, fControl.keyItem, fControl.displayItem, fControl.columnDef, lkp.isGeneric, fControl.serviceClass);

            group.append($(innerLkp));
        }
    },

    loadCombosDataSource: function (lkp) {
        var me = this;
        _.forEach(lkp.filterControls, function (fControl) {
            if (fControl.type == 'combo') {
                var selector = fControl.model; //lkp.id + "_" + fControl.field;
                lkp.abm.setupCombo("popup-lookup-{0}-{1}-{2}".format(lkp.modelName, lkp.forAction, lkp.id), selector, AppContext.Combos[fControl.model], fControl.displayItem, fControl.keyItem, '--Seleccione--');
            }
            if (fControl.type == 'lookup') {
                var selector = lkp.id + "_" + fControl.field;
                lkp.abm.setupAutocomplete("popup-lookup-{0}-{1}-{2}".format(lkp.modelName, lkp.forAction, lkp.id), fControl.dependentOf);
            }
        });
    },

    makeDTOFiltro: function (lookup) {
        var columnDef = (JSON.parse(lookup.isGeneric) == true) ? lookup.columnDef : lookup.filterControls;
        var modelName = lookup.modelName;
        var forAction = lookup.forAction;
        var r = {};
        if (columnDef) {
            columnDef.map(function (e, i, a) {
                if (e.type == 'combo' || e.type == 'lookup')
                    r[e.field] = $('#popup-lookup-{0}-{1}-{2} #{3}'.format(modelName, forAction, lookup.id, lookup.id + "_" + e.field)).attr('data-codigo-id') || null;
                else
                    r[e.field] = $('#popup-lookup-{0}-{1}-{2} #{3}'.format(modelName, forAction, lookup.id, lookup.id + "_" + e.field)).val() || null;
            });
        }
        return r
    },

    fillInitializedValue: function (lkp) {
        var filtros = {};
        filtros[lkp.element.attr('data-value-item')] = lkp.element.attr('data-codigo-id');
        filtros.pageNumber = 1;
        filtros.pageSize = 1;
        if (lkp.dependentOf) {
            for (var i = 0; i < lkp.dependentOf.length; i++) {
                if (eval(lkp.dependentOf[i])) {
                    var dep = lkp.dependentOf[i].trim();
                    var f = lkp.element.closest('.modal-dialog').find('#{0}'.format(dep));
                    filtros[dep] = f.attr('data-codigo-id') || f.val();

                    f.on('change', function (ev) {
                        lkp.element.IsEnabled(true);
                        lkp.btnTrigger.IsEnabled(true);
                    })
                }
            }
        }
        var options = {};
        if (lkp.service[1])
            options = { 'extendToKnownType': lkp.service[1], 'returnColumnNames': true };
        else
            options = { 'returnColumnNames': true };

        var query = 'QRY_SCRN_{0}_FILTERS_BUNDLE'.format(lkp.modelName);
        if (lkp.gridAdapter) {
            query = lkp.modelName;
            options.gridAdapter = true;
        }

        Query.execGridUI(AppContext.QueryServices,
            query,
            filtros,
            options,
            function (data, jqXHR) {
                var result = JSON.parseWithDate(jqXHR.responseText);
                var resultWithColumns = [];
                if (!lkp.gridAdapter) {
                    for (var i = 0; i < result.Data.length; i++) {
                        resultWithColumns.push(_.zipObject(result.ColumnNames, result.Data[i]));
                    }
                    result.Data = resultWithColumns;
                }
                if (result.Data.length > 0)
                    lkp.element.val(result.Data[0][lkp.element.attr('data-display-item')]);

            }, null, null, null)
    },

    Disable: function (sel) {
        sel.attr('disabled', true);
        sel.parent().find('button').attr('disabled', true);
    },
    Enable: function (sel) {
        sel.removeAttr('disabled');
        sel.parent().find('button').removeAttr('disabled');
    }
}
