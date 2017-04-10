var Auditoria = function () {
    return {
        // Ctor
        crear: function (senderABM, opcionesInicializa) {

            var _opt = opcionesInicializa || {};

            var me = this;

            me._nombrePantalla = _opt.nombrePantalla;

            me._nombreCampoIdentidad = _opt.nombreCampoIdentidad;

            me._nombreEntidadSingular = _opt.nombreEntidadSingular;

            me._nombreEntidadPlural = _opt.nombrePantalla;

            me._nombreGrilla = _opt.nombreElementoTabla;

            me._requiereIdentidad = _opt.requiereIdentidad;

            me._commandButtons = _opt.commandButtons;

            me._modalId = null,

            me._filtros = ["categoria", "tipo", "idPermiso", "idusuario", "IdEntidad", "codigo", "fecha_ini", "fecha_fin"]// "HoraIni", "HoraFin"]; //array con id de controles del filtro

            me._senderABM = senderABM;

            Formulario.initFormularioTipoABM(senderABM, 'popup-auditoria', '<span class="fa fa-eye">&nbsp;</span>Pantalla de {0}'.format(me._nombreEntidadSingular.capitalizeFirstLetter()));

            return me;
        },

        exportaFullExcel: function () {
            var me = this;
            dt = this._getGrid();
            var opt = dt.getOptions();
            var page = opt.dataSource.page;
            var pageSize = opt.dataSource.pageSize;
            opt.excel.allPages = true;
            dt.setOptions(opt);
            dt.saveAsExcel();
            dt.dataSource.fetch();
        },

        exportaExcel: function () {
            var me = this;
            dt = this._getGrid();
            var opt = dt.getOptions();
            opt.dataSource.page = me._filtros.page;
            opt.dataSource.pageSize = me._filtros.pageSize;
            opt.excel.allPages = false;
            dt.setOptions(opt);
            dt.saveAsExcel();
            dt.dataSource.fetch();
        },

        _prepareAuditoria: function (continueShowingForm) {
            var me = this;
            me._initGrilla(me._nombreGrilla, me._columnDef, me._requiereIdentidad);
            
            var btnBuscar = $("#popup-auditoria #popup-filtro-auditoria #boton_aceptar_filtro_auditoria");
            btnBuscar.off('click');
            btnBuscar.on('click', function () {
                me._triggerRefreshGrilla();
            });
            me._prepareFiltros(me._senderABM, continueShowingForm);
        },

        // Private
        _initGrilla: function (selTabla, columnDef) {
            var me = this;

            Grilla.init({
                estadoGrilla: columnDef,
                selGrilla: me._nombreGrilla,
                nombreEntidadPlural: me._nombreEntidadSingular,
                textoSinRegistros: 'NO HAY {0}'.format(me._nombreEntidadSingular.toUpperCase()),
                permiteSeleccionMultiple: me._permiteSeleccionMultiple,
                hasDetail: false,
                fnDatailRefresh: me._refreshGrillaDetalle,
                detailColumns: me._columnsDetail,
                pagination: {
                    refresh: false, pageSizes: true
                }
            }, me._onGrillaSelected, me,
                function (queryData, callback, settings) {
                    me._refreshGrilla(queryData, callback, settings);
                }, me._onGrillaDataBinding, me._onGrillaDataBound);
        },

        _prepareFiltros: function (abm, continueShowingForm) {
            abm._initDateFields('popup-auditoria');
            this._loadFilters(abm, 'popup-auditoria', continueShowingForm);
        },

        _loadFilters: function (abm, elementId, continueShowingForm) {
            var me = this;
            var formIncourse = false;
            if ($("#{0} [{1}]".format(elementId, 'data-is-combo')).length > 0) {
                var queryName = 'AuditoriaFiltros';
                var options = {};
                options.filtersAdapter = true;
                formIncourse = true;

                Query.execCombosUI(AppContext.QueryServices, queryName, options, null, function (dataset) {
                    abm._setupFiltersFields(elementId, dataset);
                    if (continueShowingForm) {
                        continueShowingForm();
                    }
                });
            }
            if ($("#{0} [{1}]".format(elementId, 'data-is-autocomplete')).length > 0) {
                abm.setupAutocomplete(elementId);
                if (continueShowingForm && !formIncourse) {
                    continueShowingForm();
                    formIncourse = true;
                }
            }
            else
                if (!formIncourse) continueShowingForm();
        },

        _getGrid: function () {
            g = $("#{0}".format(this._nombreGrilla)).data("kendoGrid");
            return g;
        },
        _getRowDataGrid: function () {
            g = $("#{0}".format(this._nombreGrilla)).data("kendoGrid");
            var sel = g.select();
            var data = g.dataItem(sel[sel.length - 1]);
            return data;
        },
        _triggerRefreshGrilla: function () {
            dt = this._getGrid();
            dt.dataSource.fetch();
            return true;
        },
        _refreshGrilla: function (queryData, callback, settings) {
            var me = this;
            var _d = me._senderABM._seleccion.selectedItems()[0];
            var filtros = {};
            
            if (me._modalId) {
                filtros = me._senderABM._makeDTOCustomCommand(me._modalId, me._filtros, true);
            }
            else {
                $("#popup-auditoria #popup-filtro-auditoria #IdEntidad").val(_d);
                filtros.IdEntidad = _d;
            }
            
            filtros.Entidad = me._nombreEntidadSingular;
            
            filtros.pageNumber = (filtros.forcePageNumber) ? 1 : queryData.page || 1; //queryData.start;
            filtros.pageSize = (queryData.pageSize == 0) ? 1000 : queryData.take; //queryData.draw;
            

            filtros.forcePageNumber;
            me._requiereIdentidad = false;
            Query.execGridUI(AppContext.QueryServices, 'QRY_SCRN_AUDITORIA_GRID_MAIN_ALL',
                filtros,
                { requireIdentityFilter: me._requiereIdentidad, returnColumnNames: true },
                function (data, jqXHR) {
                    if (callback != null && typeof (callback) == 'function') {
                        var result = JSON.parseWithDate(jqXHR.responseText);
                        var resultWithColumns = [];
                        for (var i = 0; i < result.Data.length; i++) {
                            resultWithColumns.push(_.zipObject(result.ColumnNames, result.Data[i]));
                        }
                        result.Data = resultWithColumns;
                        callback(result, data, settings);
                    }

                    defer(function () {
                        Grilla.selectFirstRow(me._nombreGrilla);
                    });
                });
        },
        _refreshGrillaDetalle: function (e, me, queryData, callback, settings) {
            var filtros = {};
            filtros.pageNumber = e.sender.dataSource._page || 1;
            filtros.pageSize = e.sender.dataSource._pageSize;
            filtros.IdLogAuditoria = e.data.IdLogAuditoria;
            //filtros.forcePageNumber;

            Query.execGridUI(AppContext.QueryServices, 'QRY_SCRN_AUDITORIA_DETALLE_GRID_MAIN_ALL',
                filtros,
                { requireIdentityFilter: false, returnColumnNames: true },
                function (data, jqXHR) {
                    if (callback != null && typeof (callback) == 'function') {
                        var result = JSON.parseWithDate(jqXHR.responseText);
                        var resultWithColumns = [];
                        for (var i = 0; i < result.Data.length; i++) {
                            resultWithColumns.push(_.zipObject(result.ColumnNames, result.Data[i]));
                        }
                        result.Data = resultWithColumns;
                        callback(result, data, settings);
                    }
                });

        },
        _setupActionBarButtons: function () {
            var me = this;

            $('#{0} #boton_exporta_excel'.format('popup-auditoria')).click(function (e) {
                var popupTemplate = $('#popup-accion-exportar').clone();
                popupTemplate.find('.modal-title').html('<span class="fa fa-file-excel-o">&nbsp;</span> Exportar datos a Excel')
                popupTemplate.modal({ backdrop: 'static', keyboard: true })
                var commitBtnCurrPage = popupTemplate.find('#btnCurrentPage.button');
                var commitBtnAllPage = popupTemplate.find('#btnAllPages.button');
                commitBtnCurrPage.click(function () {
                    me.exportaExcel();
                    $(this).removeAttr('disabled');
                    popupTemplate.modal('hide');
                });
                commitBtnAllPage.click(function () {
                    me.exportaFullExcel();
                    $(this).removeAttr('disabled');
                    popupTemplate.modal('hide');
                });

            });

            $('#{0} #boton_exporta_pdf'.format('popup-auditoria')).click(function (e) {
                var popupTemplate = $('#popup-accion-exportar').clone();
                popupTemplate.find('.modal-title').html('<span class="fa fa-file-pdf-o">&nbsp;</span> Exportar datos a PDF')
                popupTemplate.modal({ backdrop: 'static', keyboard: true })
                var commitBtnCurrPage = popupTemplate.find('#btnCurrentPage.button');
                var commitBtnAllPage = popupTemplate.find('#btnAllPages.button');
                commitBtnCurrPage.click(function () {
                    me.exportaPdf();
                    $(this).removeAttr('disabled');
                    popupTemplate.modal('hide');
                });
                commitBtnAllPage.click(function () {
                    me.exportaFullPdf();
                    $(this).removeAttr('disabled');
                    popupTemplate.modal('hide');
                });
            });


            $("a[title]").tooltip({ container: "body", placement: "left", delay: 200 });
        },
        _setupMainBar: function () {
            var me = this;
            var mb = $("#mainbar.primitiva").clone();
            mb.removeClass('primitiva');
            _(me._commandButtons).forEach(function (cmd) {
                var btn = mb.find("[data-cmd={0}]".format(cmd));
                if (btn) btn.removeClass('hidden');
            });
            $("#{0}".format("popup-auditoria")).find("#main-bar").html(mb.show());
        },

        _initContextMenu: function () {
            var me = this;
            context.init({
                fadeSpeed: 100,
                above: 'auto',
                preventDoubleContext: true,
                compress: false
            });
            context.setPreventShow(function () {
                var avoidShowingContextMenu = me._seleccion.hasNoneSelection();
                if (avoidShowingContextMenu) {
                    AreaMensajes.toastInfo(LT.T('LBL_MENU_CONTEXTUAL_NO_SE_MUESTRA_POR_FALTA_DE_SELECCION'));
                }
                return avoidShowingContextMenu;
            });
            context.attach('#tabla_uno', me._buildContextMenuItems());
        },

        _buildContextMenuItems: function () {
            var esAccionExtra = false;
            var r = [];
            var actionBarButtons = $('#mainbar a.context-menu-item');

            for (var i = 0; i < actionBarButtons.length; i++) {
                var sel = $(actionBarButtons[i]);

                if (sel.parent('.extra_herramientas').length > 0 && !esAccionExtra) {
                    r.push({ divider: true });
                    esAccionExtra = true;
                }

                var _fn = function (i) {
                    var target = findEventHandlers('click', actionBarButtons[i])[0].events[0].handler;
                    var handler = function (e) {
                        e.preventDefault();
                        target();
                    }

                    r.push({
                        text: sel.attr('title'),
                        action: handler,
                        htmlClass: 'fa fa fa-ellipsis-v',
                        htmlStyle: 'color: black',
                    });
                };

                _fn(i);
            }
            return r;
        },
        _onGrillaDataBinding: undefined,
        _onGrillaDataBound: undefined,
        _onOpenAuditoria: function (elementId, sender) {
            var pop = $(this);
            sender._modalId = pop.attr('modal_open_id');
            sender._setupMainBar();
            sender._setupActionBarButtons();
        },
        _onCloseAuditoria: function (elementId, sender) {
            sender._modalId = null;
        },
        _onOpenDetalle: undefined,

        // State
        _nombreEntidadSingular: '',
        _nombreEntidadPlural: '',
        _nombrePantalla: 'PANTALLA SIN NOMBRE',
        _nombreGrilla: 'GRIDAUDITORIA',
        _columnDef: [
            { field: "Fecha", title: "Fecha/Hora", filterable: false, width: 140, template: "#= kendo.toString(kendo.parseDate(Fecha, 'yyyy-MM-ddTHH:mm:ss'), 'dd/MM/yyyy HH:mm:ss') #" },
            { field: "Codigo", title: "Código", filterable: false, width: 80 },
            { field: "Tipo", title: "Tipo", filterable: false, width: 80 },
            { field: "Categoria", title: "Categoría", filterable: false, width: 96 },
            { field: "Aplicacion", title: "Aplicación", filterable: false, width: 97 },
            { field: "Usuario", title: "Usuario", filterable: false, width: 86 },
            { field: "IP", title: "IP", filterable: false, width: 105 },
            { field: "IdEntidad", title: "IdEntidad", filterable: false, width: 104 },
            { field: "Permiso", title: "Permiso", filterable: false, width: 92 },
            { field: "Descripcion", title: "Descripción", filterable: false, width: 2000 }
        ],
        _columnsDetail: [],
        _requiereIdentidad: false,
        _nombreCampoIdentidad: 'r_id',
        _commandButtons: ['E', 'X'],
        _modalId: null,
        _filtros: {},
        _seleccion: {
            _selectedItems: [],
            _selectedCCItems: [],
            push: function (r_id, cc) { this._selectedItems.push(r_id); this._selectedCCItems.push(cc); },
            remove: function (r_id) { var i = this._selectedItems.indexOf(r_id); if (i >= 0) this._selectedItems.splice(i, 1); },
            clear: function () { this._selectedItems = []; this._selectedCCItems = []; },
            selectedItems: function () { return this._selectedItems; },
            selectedCCItems: function () { return this._selectedCCItems; },
            hasOneSelectionOnly: function () { return this._selectedItems.length == 1; },
            hasNoneSelection: function () { return this._selectedItems.length == 0; }
        }
    }
};

Log.debug('Modulo web Auditoria cargado OK');