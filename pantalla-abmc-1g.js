/**
* @class PantallaABMC1Grilla
* @desc Encapsula la logica para generar un ABM Tipo (Alta, Baja, Modificacion y Consulta).
* Se extiende via opciones para crear popups, grillas, ejecutar consultas/comandos, etc.
*/
var PantallaABMC1Grilla = function () {
    return {
        /** @callback ABM.init
        * @desc Funcion de inicializacion. Se ejecuta a modo de callback, después de creada la instancia de ABM.
        * <br>Todo popup adicional que se agregue al ABM debe inicializarce dentro de esta funcion.
        * <br>Es el punto de origen para inicializar popups y otros controles.
        * @param {PantallaABMC1Grilla} ABM - Referencia al objeto ABM
        * @example
        *   // se tiene el siguiente ABM (en AsignacionesPendientes.cshtml):
        *   var ambAsigPendientes = new PantallaABMC1Grilla().crear(
        *       {
        *       nombrePantalla: '@ViewBag.NombrePantalla',
        *           // otras opciones
        *       },
        *       function (abm) {
        *           initOtherForms(abm)
        *       },
        *       [ 
        *           // custom actions       
        *       ],
        *       {
        *           // custom events
        *       }
        *   );
        *
        *
        *   function() initOtherForms(abm) {
        *       Formulario.initFormulario('popup-nueva-asignacion', '<span class="fa fa-puzzle-piece">&nbsp;</span>Nueva Asignación', false, abm);
        *       Formulario.initFormulario('popup-modificar-cv', '<span class="fa fa-shield">&nbsp;</span>Modificar cuenta de valores', false, abm);
        *       Formulario.initFormulario('popup-modificar-ce', '<span class="fa fa-money">&nbsp;</span>Modificar cuenta de efectivo', false, abm);
        *       
        *       abm._initDateFields('popup-filtros', true, ['FechaConcertacion']);
        *       abm._filtros = me._makeDTOFiltros(me._camposFiltros());
        *   } 
        */

        /** @class extraAction
        * @type {Object}
        * @desc Define una accion custom dentro del ABM. 
        * <br> El resultado de una extraAction es un botón en la barra de herramientas del ABM y opcionalmente en el menu contextual de la grilla principal.
        * <br> Usado para llamar a un Comando o abrir un popup (formulario)
        * @property {function} prox - Funcion que se ejecuta en el evento click del boton resultante de la acción.
        * @property {string} id - Identificador que se asignará al botón creado.
        * @property {string} color - Color del ícono que se asignará al botón.
        * @property {string} icon - Clase (css) que define el ícono del botón.
        * @property {boolean} includeInContextMenu - Determina si se incluye o no la acción en el menu contextual de la grilla principal.
        * @property {string} title - Tooltip del botón.
        * 
        * @example 
        *   {
        *       proc: function (ev) {
        *           if (this._seleccion.hasNoneSelection()) {
        *               AreaMensajes.toastInfo("Debe seleccionar al menos una Asignacion");
        *           } else {
        *               var selected = this._getDataFromSelectedRows();
        *           if (_.some(selected, { 'CanDelete': false }))
        *               AreaMensajes.toastInfo("Una o varias Asignaciones seleccionadas no puede ser Eliminada");
        *           else
        *               Formulario.popupFormulario('popup-confirmar', eliminarAsignaciones, this, { width: "500px", height: "150px", actions: ["Close"], estiloBoton: 'btn-danger', htmlBoton: '<i class="fa fa-check">&nbsp;</i>Eliminar', extraText: '{0}: {1}'.format(this._camposFiltros()[0], this._getDataFieldFromSelectedRows(this._camposFiltros()[0])), actionText: 'Está seguro que quiere Eliminar los registros seleccionados?', actionTitle: 'Eliminar Asignaciones' });
        *           }
        *       },
        *       id: 'boton_eliminar',
        *       color: '',
        *       icon: 'fa fa-trash-o',
        *       includeInContextMenu: true,
        *       title: 'Eliminar'
        *    }
        */

        /** @memberof PantallaABMC1Grilla#
        * @desc Crea una instancia de {@link #pantallaabmc1grilla}.
        * @param {object} opciones - objeto json con opciones de inicializacion
        * @param {ABM.init} init - Funcion de inicializacion. Se ejecuta a modo de callback, después de creada la instancia de ABM.
        * @param {extraAction[]} extraActions - Array de objetos json que describen los comando extras del ABM.
        * @param {function[]} extraMethods - Array de funciones extras del ABM. Extienden los eventos de la grilla y los popups de Alta, Modificación y Vista (onOpenAlta, onOpenVista, onOpenActualiza, etc).
        * @returns {undefined}
        * @example
        * 
        *   var ambcMercados = new PantallaABMC1Grilla().crear(
        *        {
        *            nombrePantalla: '@ViewBag.NombrePantalla',
        *            permiso: '@ViewBag.Permiso',
        *            nombreEntidadSingular: 'Mercado',
        *            nombreEntidadPlural: 'Mercados',
        *            nombreEntidadCompleto: 'Mercados',
        *            nombreCampoIdentidad: 'IdMercado',
        *            nombreCampoControlConcurrencia: 'UltimaActualizacion',
        *            nombreElementoTabla: 'gridMercados',
        *            requiereIdentidad: false,
        *            ejecutaRowCustomQuery: true,
        *            permiteSeleccionMultiple: false,
        *            commandButtons: ['A', 'B', 'M', 'C', 'E', 'D', 'CF', 'Z'],
        *            camposAltaABM: ['Codigo', 'Descripcion', 'CodigoSiopel'],
        *            camposModificacionABM: ['Codigo', 'Descripcion', 'CodigoSiopel'],
        *            camposFiltroABM: ['Codigo', 'Descripcion', 'CodigoSiopel'],
        *            showCamposEliminar: ['Codigo', 'Descripcion', 'CodigoSiopel'],
        *            columDefinition: columnas_de_grillas,
        *            gridGroupable: true,
        *            auditoria: true 
        *        }, function(me) {
        *    
        *        }, 
        *        [ // array de extraAction ],
        *        { // override de eventos de grilla y popups ... }
        *   );
        */
        crear: function (opcionesInicializa, init, extraActions, extraMethods) {     //nombrePantalla, nombreEntidadSingular, nombreEntidadPlural, requiereIdentidad, camposAlta, camposActualiza, camposFiltro, //selTabla, nombreResultado, columnDef

            var _opt = opcionesInicializa || {};

            var me = this;

            $(window).on('resize', me._onABMResize);

            me._nombreCampoIdentidad = _opt.nombreCampoIdentidad;

            me._nombreCampoControlConcurrencia = _opt.nombreCampoControlConcurrencia;

            me._nombrePantalla = _opt.nombrePantalla;

            me._permiso = _opt.permiso;

            me._extraParams = _opt.extraParams;

            me._nombreGrilla = _opt.nombreElementoTabla;

            me._heightGrilla = 400;

            me._gridGroupable = _opt.gridGroupable;

            me._gridGroupableField = _opt.gridGroupableField;

            me._paginationGrid = (_opt.paginationGrid == undefined) ? me._paginationGrid : _opt.paginationGrid;

            me._requiereIdentidad = _opt.requiereIdentidad;

            me._extendToKnownType = _opt.extendToKnownType;

            me._extendToKnownTypeForFilter = _opt.extendToKnownTypeForFilter;

            me._filtersAdapter = _opt.filtersAdapter;

            me._gridAdapter = _opt.gridAdapter;

            me._ejecutaRowCustomQuery = _opt.ejecutaRowCustomQuery;

            me._permiteSeleccionMultiple = _opt.permiteSeleccionMultiple;

            me._commandButtons = _opt.commandButtons;

            me._setupMainBar();

            if (extraActions) me._setupExtraActions(extraActions);

            me._camposAlta = function () {
                return _opt.camposAltaABM || [];
            };

            me._camposActualiza = function () {
                return _opt.camposModificacionABM || [];
            };

            me._camposFiltros = function () {
                return _opt.camposFiltroABM || [];
            };

            me.showCamposEliminar = _opt.showCamposEliminar;

            me._filtros = me._makeDTOFiltros(me._camposFiltros());

            me._nombreEntidadSingular = _opt.nombreEntidadSingular;

            me._nombreEntidadPlural = _opt.nombreEntidadPlural;

            me._nombreEntidadCompleto = _opt.nombreEntidadCompleto;

            Formulario.initFormulario('popup-filtros', '<span class="fa fa-filter">&nbsp;</span>Filtrar {0}'.format(me._nombreEntidadPlural.capitalizeFirstLetter()), true, me);

            me.columnDef = _opt.columDefinition || null;

            if (_opt.detailGrid) {
                me.detailGridOptions = _opt.detailGrid
                if (_opt.detailGrid.commandButtons) me._setupExtraDetailActions(_opt.detailGrid.commandButtons);
            }

            AppContext.ABM = me;

            if (_opt.columDefinition)
                me._initGrilla(me._nombreGrilla, me.columnDef, me._requiereIdentidad); //saque nombreResultado :-(

            me._gridHasChanged = false;

            me._setupActionBarButtons();

            me._setupKeyshortcuts();

            Formulario.initFormulario('popup-alta', '<span class="fa fa-plus">&nbsp;</span>Alta de {0}'.format(me._nombreEntidadCompleto.capitalizeFirstLetter()), false, me);

            Formulario.initFormulario('popup-eliminar', '<span class="fa fa-trash">&nbsp;</span>Baja de {0}'.format(me._nombreEntidadCompleto.capitalizeFirstLetter()), false, me);

            Formulario.initFormulario('popup-actualiza', '<span class="fa fa-pencil">&nbsp;</span>Actualizar {0}'.format(me._nombreEntidadCompleto.capitalizeFirstLetter()), false, me);

            Formulario.initFormulario('popup-vista', '<span class="fa fa-eye">&nbsp;</span>Vista de {0}'.format(me._nombreEntidadCompleto.capitalizeFirstLetter()), false, me);

            if (_opt.auditoria) {
                me._auditoria = new Auditoria().crear(me, {
                    nombrePantalla: me._nombrePantalla,
                    nombreEntidadSingular: me._nombreEntidadSingular,
                    nombreCampoIdentidad: me.__nombreCampoIdentidad,
                    nombreElementoTabla: 'gridAuditoria',
                    requiereIdentidad: true,
                    commandButtons: ['E', 'X']
                });
            }

            /* extras de GRID */
            me.validarPreconditionQuery = extraMethods.validarPreconditionQuery;
            me._onGrillaDataBinding = extraMethods.onGrillaDataBinding;
            me._onGrillaDataBound = extraMethods.onGrillaDataBound;
            me._onGrillaRowSelected = extraMethods.onGrillaRowSelected;
            me._onGrillaDoubleClickOverrided = extraMethods.onGrillaDoubleClick;
            /* extras de MODAL */
            me._onOpenVista = extraMethods.onOpenVista;
            me._onOpenAlta = extraMethods.onOpenAlta;
            me._onOpenActualiza = extraMethods.onOpenActualiza;
            me._onOpenDelete = extraMethods.onOpenDelete;
            me._onCloseVista = extraMethods.onCloseVista;
            me._onCloseAlta = extraMethods.onCloseAlta;
            me._onCloseActualiza = extraMethods.onCloseActualiza;
            me._onCloseDelete = extraMethods.onCloseDelete;
            me._onOpenAuditoria = extraMethods.onOpenAuditoria;
            me._onCloseAuditoria = extraMethods.onCloseAuditoria;

            $('#search-grid').on('keyup', function (e) {
                if (false /* configuracion */ || e.which == 13) {
                    me._triggerRefreshGrillaHighLight();
                }
            });


            me._initContextMenu();
            me._initContextMenuForElement('gridDetalle',
                           false,
                           'gridMaster',
                           'detailBar',
                           me._buildContextMenuItemsForElement);

            me._filterLoaded = false;

            if (init) init(me);

            me._onABMResize();
        },

        _onABMResize: function () {
            resizeWindow(this, 'menuClearTop', 'menuClearFoot', 'filter-container', 'panel-footer');
        },

        // UI
        showAlta: function () {
            Formulario.popupFormulario('popup-alta', this._prepareToSendAlta, this, { onOpen: this._onOpenAlta }, this._prepareFiltrosAlta);
        },
        showActualiza: function () {
            Formulario.popupFormulario('popup-actualiza', this._prepareToSendActualiza, this, { onOpen: this._onOpenActualiza, onClose: this._onCloseActualiza }, this._prepareActualiza);
        },
        showFiltros: function () {
            var me = this;
            var fnPrepareFiltros = (me._filterLoaded) ? null : this._prepareFiltros;
            Formulario.initFiltro('popup-filtros', function () {
                me._filtros = me._makeDTOFiltros(me._camposFiltros());
                me._filtros.pageNumber = 1;
                me._filtros.forcePageNumber = true;
                me._triggerRefreshGrilla();
            }, this, { persistirValores: true }, fnPrepareFiltros);

            Formulario.popupFiltro('popup-filtros', me);
            me._filterLoaded = true;
        },
        showEliminar: function () {
            var me = this;
            var extraInfo = '';
            if (me.showCamposEliminar) {
                _.each(me.showCamposEliminar, function (c) {
                    extraInfo += '{0}: {1} {2}'.format(c, me._getRowDataGrid()[c], '<br>');
                })
            }
            else
                extraInfo = '{0}: {1}'.format(this._camposFiltros()[0], this._getRowDataGrid()[this._camposFiltros()[0]]);

            Formulario.popupFormulario('popup-eliminar', this._prepareToSendElimina, this, { width: "500px", height: "150px", actions: ["Close"], estiloBoton: 'btn-danger', htmlBoton: '<i class="fa fa-trash-o">&nbsp;</i>ELIMINAR', onOpen: this._onOpenDelete, extraText: extraInfo });
        },
        showVista: function () {
            if (this._commandButtons.indexOf('C') >= 0)
                Formulario.popupFormulario('popup-vista', this._processPostVista, this, { onOpen: this._onOpenVista }, this._prepareVista);
        },

        showAuditoria: function () {
            var sel = Formulario.popupFormulario('popup-auditoria', function () { return false }, this._auditoria, { onOpen: this._auditoria._onOpenAuditoria, onClose: this._auditoria._onCloseAuditoria }, this._auditoria._prepareAuditoria);
        },

        exportaFullExcel: function (which) {
            var me = this;
            var dt = (which) ? this._getGrid(which) : this._getGrid();
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
            var dt = this._getGrid();
            var opt = dt.getOptions();
            opt.dataSource.page = me._filtros.page;
            opt.dataSource.pageSize = me._filtros.pageSize;
            opt.excel.allPages = false;
            dt.setOptions(opt);
            dt.saveAsExcel();
            dt.dataSource.fetch();
        },

        // Commands
        _prepareToSendAlta: function (modal_open_id, popup) {
            var me = this;
            var campos = me._camposAlta();

            if (me._validarCampos(modal_open_id, campos)) {
                var dto = me._makeDTOAlta(modal_open_id, campos);
                var dtoMemoria = me._makeDTOMemoria(modal_open_id, campos);
                localStorage.setItem("{0}-{1}-{2}".format(AppContext.CURRENT_USER_NAME, popup.attr("id"), me._nombreEntidadSingular), JSON.stringify(dtoMemoria));
                return me._sendAlta(dto, popup);
            } else {
                //AreaMensajes.popupMensajeErrorFuncionalValidacionCampos('Alta de {0}'.format(me._nombreEntidadSingular.capitalizeFirstLetter()));
                return true;
            }
        },
        _prepareToSendActualiza: function (modal_open_id, popup) {
            var me = this;
            var campos = me._camposActualiza();

            var _camposValidar = [];

            if (me._validarCampos(modal_open_id, campos)) {
                return me._sendActualiza(me._makeDTOFormularioActualiza(modal_open_id, campos), popup);
            } else {
                return true;//AreaMensajes.popupMensajeErrorFuncionalValidacionCampos('Actualizacion de {0}'.format(me._nombreEntidadCompleto.capitalizeFirstLetter()));
            }
        },
        _prepareFiltros: function (continueShowingForm) {
            this._initDateFields('popup-filtros');
            this._loadFilters('popup-filtros', continueShowingForm);
        },
        _prepareFiltrosAlta: function (continueShowingForm) {
            this._initDateFields('popup-alta');
            this._loadFilters('popup-alta', continueShowingForm);
        },

        _prepareActualiza: function (continueShowingForm) {
            var me = this;
            this._initDateFields('popup-actualiza');
            this._loadFilters('popup-actualiza', next);

            function next() {

                var query = 'QRY_SCRN_{0}_ENTITY_FULL'.format(me._nombreEntidadPlural.toUpperCase());

                if (me._ejecutaRowCustomQuery == true)
                    query = 'QRY_CUSTOM_{0}'.format(me._nombreEntidadSingular);

                Query.execReadFullRecordUI(AppContext.QueryServices, query, me._nombreCampoIdentidad, me._seleccion.selectedItems()[0], { ejecutaRowCustomQuery: me._ejecutaRowCustomQuery }, function (data) {
                    var record = (me._ejecutaRowCustomQuery == true) ? data[0] : data[0][0];

                    // TODO: Mejor indexar por me.camposActualiza ???
                    for (var f in record) {
                        if (me._nombreCampoIdentidad === f) continue; //TODO nombre identidad viene de opciones "r_id" === f // TODO: para que esto si ya solicitaste por este criterio
                        var sel = $('#{0} #{1}'.format('popup-actualiza', f));
                        var isCombo = sel.attr('data-is-combo');
                        var isAutoComplete = sel.attr('data-is-autocomplete');
                        var isChk = sel.attr('type') == 'checkbox';
                        var isDate = sel.attr('data-is-date');
                        if (isCombo) {
                            var dataKey = sel.attr('data-key-item');
                            var dataField = sel.attr('data-field-item');
                            var dataDisplay = sel.attr('data-display-item');
                            var item = sel.data('typeahead').setItem(dataKey, dataDisplay, (dataField) ? record[dataField] : record[dataKey]);

                            sel.val(item[dataDisplay]);
                            sel.attr('data-codigo-id', item[dataKey])
                            sel.typeahead('val', item[dataDisplay]);

                        } else if (isAutoComplete) {
                            sel.val(record[sel.attr('data-name-item')]);
                            sel.attr('data-codigo-id', record[sel.attr('data-id-item')])
                            sel.data('CustomLookUp').setEnable();

                            if (record[sel.attr('data-id-item')] && record[sel.attr('data-id-item')].toString().length > 0) {
                                if (record[sel.attr('data-display-item')]) {
                                    sel.val(record[sel.attr('data-display-item')]);
                                    sel.attr('data-codigo-id', record[sel.attr('data-value-item')])
                                }
                                else
                                    me.fillInitializedLookup(sel);
                            }
                        } else if (isChk) {
                            $(sel).get(0).checked = record[f];
                        }
                        else if (isDate) {
                            var mdate = new moment(record[f]).format(AppContext.CURRENT_SYS_DATE_FORMAT);
                            sel.data("DateTimePicker").date(mdate);
                        }
                        else {
                            sel.val(record[f]);
                        }
                    }
                    continueShowingForm();

                });
            }
        },
        _prepareVista: function (continueShowingForm) {

            var me = this;
            this._initDateFields('popup-vista');
            this._loadFilters('popup-vista', next);

            function next() {

                var query = 'QRY_SCRN_{0}_ENTITY_FULL'.format(me._nombreEntidadPlural.toUpperCase());

                if (me._ejecutaRowCustomQuery == true) {
                    query = 'QRY_CUSTOM_{0}'.format(me._nombreEntidadSingular);
                }

                var options = { ejecutaRowCustomQuery: me._ejecutaRowCustomQuery };

                Query.execReadFullRecordUI(AppContext.QueryServices, query, me._nombreCampoIdentidad, me._seleccion.selectedItems()[0], options, function (data) {
                    var record = (me._ejecutaRowCustomQuery == true) ? data[0] : data[0][0];

                    // TODO: Mejor indexar por me.camposActualiza ???
                    me._fillElementsFromRecord(record, me, null, true);

                    continueShowingForm();
                });
            }
        },
        _fillElementsFromRecordMemoria: function (record, me, which, isforView, next) {
            var promiseAll = [];
            var popupid = 'popup-vista'
            if (which) {
                popupid = which;
            }
            for (var f in record) {
                var sel = $('#{0} #{1}'.format(popupid, f));
                var isCombo = sel.attr('data-is-combo');
                var isAutoComplete = sel.attr('data-is-autocomplete');
                var isDate = sel.attr('data-is-date');
                var isTime = sel.attr('data-is-time');
                var isChk = sel.attr('type') == 'checkbox';
                var isNumber = sel.attr('type') == 'number';
                if (me._nombreCampoIdentidad === f) continue; //TODO nombre identidad viene de opciones "r_id" === f // TODO: para que esto si ya solicitaste por este criterio
                if (isCombo) {
                    var dataKey = sel.attr('data-key-item');
                    var dataField = sel.attr('data-field-item');
                    var dataDisplay = sel.attr('data-display-item');
                    var item = sel.data('typeahead').setItem(dataKey, dataDisplay, (dataField) ? record[dataField] : record[dataKey]);

                    sel.val(item[dataDisplay]);
                    sel.attr('data-codigo-id', item[dataKey])
                    sel.typeahead('val', item[dataDisplay]);
                    sel.trigger('change');

                }
                else if (isAutoComplete) {
                    sel.val(record[sel.attr('data-name-item')]);
                    sel.attr('data-codigo-id', record[sel.attr('data-id-item')])
                    if (record[sel.attr('data-id-item')] && record[sel.attr('data-id-item')].toString().length > 0) {
                        if (record[sel.attr('data-display-item')]) {
                            sel.val(record[sel.attr('data-display-item')]);
                            sel.attr('data-codigo-id', record[sel.attr('data-value-item')])
                        }
                        else
                            promiseAll.push (me.fillInitializedLookupMemoria(sel));

                        sel.parent().find('button').attr('disabled', true);
                    }
                }
                else if (isChk) {
                   
                    $(sel).get(0).checked = record[f];
                    sel.trigger('change');
                }
                else if (isDate) {
                    var mdate = new moment(record[f]).format(AppContext.CURRENT_SYS_DATE_FORMAT);
                    sel.data("DateTimePicker").date(mdate);
                }
                else if (isTime) {
                    var mtime = new moment(record[f], "HH:mm");
                    sel.data("DateTimePicker").date(mtime);
                }
                else if (isNumber) {
                    sel.setVal(record[f]);
                }
                else {
                    sel.val(record[f]);
                }

                if (isforView)
                    sel.attr('disabled', true);
            }

            if (typeof (next) == 'function')
                next();

            return promiseAll;

        },
        _fillElementsFromRecord: function (record, me, which, isforView, next) {
            var popupid = 'popup-vista'
            if (which) {
                popupid = which;
            }
            for (var f in record) {
                var sel = $('#{0} #{1}'.format(popupid, f));
                var isCombo = sel.attr('data-is-combo');
                var isAutoComplete = sel.attr('data-is-autocomplete');
                var isDate = sel.attr('data-is-date');
                var isTime = sel.attr('data-is-time');
                var isChk = sel.attr('type') == 'checkbox';
                var isNumber = sel.attr('type') == 'number';
                if (me._nombreCampoIdentidad === f) continue; //TODO nombre identidad viene de opciones "r_id" === f // TODO: para que esto si ya solicitaste por este criterio
                if (isCombo) {
                    var dataKey = sel.attr('data-key-item');
                    var dataField = sel.attr('data-field-item');
                    var dataDisplay = sel.attr('data-display-item');
                    var item = sel.data('typeahead').setItem(dataKey, dataDisplay, (dataField) ? record[dataField] : record[dataKey]);
                   
                    sel.val(item[dataDisplay]);
                    sel.attr('data-codigo-id', item[dataKey])
                    sel.typeahead('val', item[dataDisplay]);

                }
                else if (isAutoComplete) {
                    sel.val(record[sel.attr('data-name-item')]);
                    sel.attr('data-codigo-id', record[sel.attr('data-id-item')])
                    if (record[sel.attr('data-id-item')] && record[sel.attr('data-id-item')].toString().length > 0) {
                        if (record[sel.attr('data-display-item')]) {
                            sel.val(record[sel.attr('data-display-item')]);
                            sel.attr('data-codigo-id', record[sel.attr('data-value-item')])
                        }
                        else
                            me.fillInitializedLookup(sel);

                        sel.parent().find('button').attr('disabled', true);
                    }
                }
                else if (isChk) {
                    $(sel).get(0).checked = record[f];
                }
                else if (isDate) {
                    var mdate = new moment(record[f]).format(AppContext.CURRENT_SYS_DATE_FORMAT);
                    sel.data("DateTimePicker").date(mdate);
                }
                else if (isTime) {
                    var mtime = new moment(record[f], "HH:mm");
                    sel.data("DateTimePicker").date(mtime);
                }
                else if (isNumber) {
                    sel.setVal(record[f]);
                }
                else {
                    sel.val(record[f]);
                }

                if (isforView)
                    sel.attr('disabled', true);
            }

            if (typeof (next) == 'function')
                next();
        },
        _prepareAuditoria: function (continueShowingForm) {
            var me = this;

            //TODO: Cambiar por las columnas de la auditoria

            continueShowingForm();

        },
        _prepareToSendElimina: function (modal_open_id, popup) {
            var dto = {
            };
            dto.Ids = this._seleccion.selectedItems();
            this._sendElimina(dto, popup);
        },

        _fillPopupFromCommandResult: function (popupId, record, readOnly) {

            for (var f in record) {
                var sel = $('#{0} #{1}'.format(popupId, f));
                var isCombo = sel.attr('data-is-combo');
                var isAutoComplete = sel.attr('data-is-autocomplete');
                var isDate = sel.attr('data-is-date');
                var isChk = sel.attr('type') == 'checkbox';
                if (me._nombreCampoIdentidad === f) continue; //TODO nombre identidad viene de opciones "r_id" === f // TODO: para que esto si ya solicitaste por este criterio
                if (isCombo) {
                    var dataKey = sel.attr('data-key-item');
                    var dataField = sel.attr('data-field-item');
                    var dataDisplay = sel.attr('data-display-item');

                    var item = sel.data('typeahead').setItem(dataKey, dataDisplay, (dataField) ? record[dataField] : record[dataKey]);

                    sel.val(item[dataDisplay]);
                    sel.attr('data-codigo-id', item[dataKey])
                    sel.typeahead('val', item[dataDisplay]);

                }
                else if (isAutoComplete) {
                    sel.val(record[sel.attr('data-name-item')]);
                    sel.attr('data-codigo-id', record[sel.attr('data-id-item')])
                    if (record[sel.attr('data-id-item')] && record[sel.attr('data-id-item')].toString().length > 0) {
                        if (record[sel.attr('data-display-item')]) {
                            sel.val(record[sel.attr('data-display-item')]);
                            sel.attr('data-codigo-id', record[sel.attr('data-value-item')])
                        }
                        else
                            me.fillInitializedLookup(sel);

                        sel.parent().find('button').attr('disabled', true);
                    }
                }
                else if (isChk) {
                    $(sel).get(0).checked = record[f];
                }
                else if (isDate) {
                    sel.data("DateTimePicker").date(record[f]);
                }
                else {
                    sel.val(record[f]);
                }
                if (readOnly)
                    sel.attr('disabled', true);
            }

        },
        _sendAlta: function (dto, popup) {
            var me = this;
            return Command.execUI(AppContext.CommandServices, 'Alta{0}Command'.format(me._nombreEntidadSingular.capitalizeFirstLetter()), dto, {
                TipoPermiso: 16
            }, function (data) {
                me._processPostAlta(data, dto, popup);
            });
        },
        _sendActualiza: function (dto, popup) {
            var me = this;
            Command.execUI(AppContext.CommandServices, 'Actualiza{0}Command'.format(me._nombreEntidadSingular.capitalizeFirstLetter()), dto, {
                TipoPermiso: 4
            }, function (data) {
                me._processPostActualiza(data, dto, popup);
            });
        },
        _sendElimina: function (dto, popup) {
            var me = this;
            Command.execUI(AppContext.CommandServices, 'Elimina{0}Command'.format(me._nombreEntidadSingular.capitalizeFirstLetter()), dto, { TipoPermiso: 8 }, function (data) {
                me._processPostElimina(data, dto, popup);
            });
        },

        // Private
        _makeDTOAlta: function (modal_open_id, campos) {
            var r = this._makeDTOFormulario(modal_open_id, campos);
            for (var f in r) {
                var selector = $('div[modal_open_id={0}] #{1}'.format(modal_open_id, f));
                var isNumber = (selector.attr('type') == 'number' && !selector.attr('step'));
                var isCurrency = (selector.attr('type') == 'number' && selector.attr('step'));
                var isChk = selector.attr('type') == 'checkbox';
                var isRadio = selector.attr('type') == 'radio';
                var isArray = selector.attr('data-is-array');
                var isCombo = selector.attr('data-is-combo');
                var isAutoComplete = selector.attr('data-is-autocomplete');
                var isDate = selector.attr('data-is-date');
                var isTime = selector.attr('data-is-time');
                var selectedComboId = (isCombo || isAutoComplete) ? selector.attr('data-codigo-id') : null;
                var selectedArrayValues = (isArray) ? selector.attr('data-array-values').split(',') : [];

                if (isCombo && selectedComboId || isAutoComplete && selectedComboId) {
                    r[f] = (selectedComboId == 0) ? null : this._parseValue(selectedComboId);
                }
                else if (isChk)
                    r[f] = $(selector).get(0).checked;
                else if (isRadio) {
                    r[f] = this._parseValue(e.find(':checked'));
                }
                else if (isDate) {
                    r[f] = $.toMomentJSON(selector.datetimepicker().data("DateTimePicker").date(), AppContext.CURRENT_SYS_DATE_FORMAT);
                }
                else if (isTime) {
                    r[f] = selector.datetimepicker().data("DateTimePicker").date().format("hh:mm:ss");
                }
                else if (isNumber) {
                    r[f] = parseInt(selector.val()) || null;
                }
                else if (isCurrency) {
                    r[f] = parseFloat(selector.val()) || null;
                }
                else
                    r[f] = (selector.val() == '') ? null : selector.val();
            }
            return r;
        },
        _makeDTOMemoria: function (modal_open_id, campos) {
            var r = this._makeDTOFormulario(modal_open_id, campos);
            for (var f in r) {
                var selector = $('div[modal_open_id={0}] #{1}'.format(modal_open_id, f));
                var isNumber = (selector.attr('type') == 'number' && !selector.attr('step'));
                var isCurrency = (selector.attr('type') == 'number' && selector.attr('step'));
                var isChk = selector.attr('type') == 'checkbox';
                var isRadio = selector.attr('type') == 'radio';
                var isArray = selector.attr('data-is-array');
                var isCombo = selector.attr('data-is-combo');
                var isAutoComplete = selector.attr('data-is-autocomplete');
                var isDate = selector.attr('data-is-date');
                var isTime = selector.attr('data-is-time');
                var selectedComboId = (isCombo || isAutoComplete) ? selector.attr('data-codigo-id') : null;
                var selectedArrayValues = (isArray) ? selector.attr('data-array-values').split(',') : [];
                var display = selector.attr('data-display-item');



                if (isCombo && selectedComboId || isAutoComplete && selectedComboId) {
                    r[f] = this._parseValue(selectedComboId);//(selectedComboId == 0) ? null : this._parseValue(selectedComboId);
                    //if (r[f] && display)
                    //    r[display] = selector.val();
                }
                else if (isChk)
                    r[f] = $(selector).get(0).checked;
                else if (isRadio) {
                    r[f] = this._parseValue(e.find(':checked'));
                }
                else if (isDate) {
                    r[f] = $.toMomentJSON(selector.datetimepicker().data("DateTimePicker").date(), AppContext.CURRENT_SYS_DATE_FORMAT);
                }
                else if (isTime) {
                    r[f] = selector.datetimepicker().data("DateTimePicker").date().format("hh:mm:ss");
                }
                else if (isNumber) {
                    r[f] = parseInt(selector.val()) || null;
                }
                else if (isCurrency) {
                    r[f] = parseFloat(selector.val()) || null;
                }
                else
                    r[f] = (selector.val() == '') ? null : selector.val();
            }
            return r;
        },
        _makeDTOFiltros: function (arrayNombresCampos) {
            var me = this;
            var r = Formulario.makeDTOFiltro('popup-filtros', arrayNombresCampos);
            for (var f in r) {
                var selector = $('.{0} #{1}'.format(me._nombrePantalla, f)) || $('#{0}'.format(f));
                var isNumber = (selector.attr('type') == 'number' && !selector.attr('step'));
                var isCurrency = (selector.attr('type') == 'number' && selector.attr('step'));
                var isChk = selector.attr('type') == 'checkbox';
                var isRadio = selector.attr('type') == 'radio';
                var isCombo = selector.attr('data-is-combo');
                var isLookup = selector.attr('data-is-autocomplete');
                var isDate = selector.attr('data-is-date');
                var isTime = selector.attr('data-is-time');
                var selectedComboId = selector.attr('data-codigo-id');
                if (isCombo && selectedComboId) {
                    r[f] = (selectedComboId == 0) ? null : this._parseValueX(selectedComboId);
                } else if (isLookup && selectedComboId) {
                    r[f] = (selectedComboId == 0) ? null : this._parseValueX(selectedComboId);
                }
                else if (isChk)
                    r[f] = $(selector).get(0).checked;
                else if (isRadio) {
                    r[f] = this._parseValue(e.find(':checked'));
                }
                else if (isDate) {
                    var date = selector.datetimepicker().data("DateTimePicker").date();
                    r[f] = (date) ? date.format('YYYY-MM-DDT00:mm:ss') : date; //kendo.toString( , AppContext.CURRENT_SYS_DATE_FORMAT, AppContext.CURRENT_SYS_DATE_FORMAT);
                }
                else if (isTime) {
                    var t = selector.datetimepicker().data("DateTimePicker").date();
                    r[f] = (t) ? t.format("hh:mm") : null;
                }
                else if (isNumber) {
                    r[f] = parseInt(selector.val()) || null;
                }
                else if (isCurrency) {
                    r[f] = parseFloat(selector.val()) || null;
                }
                else r[f] = (selector.val() == '' || selector.val() == undefined) ? null : selector.val();
            }

            if (this._extraParams) {
                for (var f in this._extraParams) {
                    if (f.indexOf('options.') >= 0) continue;
                    r[f] = this._extraParams[f];
                    var selector = $('#{0}'.format(f));
                    selector.IsEnabled(false);
                    selector.val(this._extraParams[f]);
                }
                Formulario.createSelectedFiltersPreview('popup-filtros', this, null);
            }
            return r;
        },
        _makeDTOFormulario: function (modal_open_id, arrayNombresCampos) {
            return Formulario.makeDTO(modal_open_id, arrayNombresCampos);
        },
        _makeDTOFormularioActualiza: function (modal_open_id, arrayNombresCampos) {
            var dto = Formulario.makeDTO(modal_open_id, arrayNombresCampos);
            for (var f in dto) {
                var selector = $('div[modal_open_id={0}] #{1}'.format(modal_open_id, f));
                var isNumber = (selector.attr('type') == 'number' && !selector.attr('step'));
                var isCurrency = (selector.attr('type') == 'number' && selector.attr('step'));
                var isChk = selector.attr('type') == 'checkbox';
                var isRadio = selector.attr('type') == 'radio';
                var isArray = selector.attr('data-is-array');
                var isCombo = selector.attr('data-is-combo');
                var isAutoComplete = selector.attr('data-is-autocomplete');
                var isDate = selector.attr('data-is-date');
                var isTime = selector.attr('data-is-time');
                var selectedComboId = (isCombo || isAutoComplete) ? selector.attr('data-codigo-id') : null;
                var selectedArrayValues = (isArray) ? selector.attr('data-array-values').split(',') : [];

                if (isCombo && selectedComboId || isAutoComplete && selectedComboId) {
                    dto[f] = (selectedComboId == 0) ? null : this._parseValue(selectedComboId);
                }
                else if (isChk)
                    dto[f] = $(selector).get(0).checked;
                else if (isRadio) {
                    dto[f] = this._parseValue(e.find(':checked'));
                }
                else if (isDate) {
                    dto[f] = $.toMomentJSON(selector.datetimepicker().data("DateTimePicker").date(), AppContext.CURRENT_SYS_DATE_FORMAT);
                }
                else if (isTime) {
                    dto[f] = (selector.val() == '') ? null : selector.val(); //selector.datetimepicker().data("DateTimePicker").date().format("hh:mm:ss");
                }
                else if (isNumber) {
                    dto[f] = parseInt(selector.val()) || null;
                }
                else if (isCurrency) {
                    dto[f] = parseFloat(selector.val()) || null;
                }
                else
                    dto[f] = (selector.val() == '') ? null : selector.val();
            }
            dto.r_id = this._seleccion.selectedItems()[0];
            dto[this._nombreCampoControlConcurrencia] = this._seleccion.selectedCCItems()[0];//this._getControlConcurrenciaValue();
            return dto;
        },

        /** @memberof PantallaABMC1Grilla#
        * @desc Crea un DTO especifico para un Comando.
        * @param {string} popupId - valor del atributo [modal_open_id] del popup a validar
        * @param {string[]} fields - Array de nombres de campos que forman el DTO
        * @returns {object} DTO con los campos del popup
        * @example
        * 
            abm._makeDTOCustomCommand('popup-nueva-asignacion', ['IdCustodioVN', 'IdCustodioEF', 'IdCuentaNominal', 'IdCuentaEfectivo']);

        */
        _makeDTOCustomCommand: function (modal_open_id, campos, forFilter) {
            var r = this._makeDTOFormulario(modal_open_id, campos);
            for (var f in r) {
                var selector = $('div[modal_open_id={0}] #{1}'.format(modal_open_id, f));
                var isNumber = (selector.attr('type') == 'number' && !selector.attr('step'));
                var isCurrency = (selector.attr('type') == 'number' && selector.attr('step'));
                var isChk = selector.attr('type') == 'checkbox';
                var isRadio = selector.attr('type') == 'radio';
                var isArray = selector.attr('data-is-array');
                var isCombo = selector.attr('data-is-combo');
                var isAutoComplete = selector.attr('data-is-autocomplete');
                var isDate = selector.attr('data-is-date');
                var isTime = selector.attr('data-is-time');
                var selectedComboId = (isCombo) ? selector.attr('data-codigo-id') : null;
                var selectedLookUpId = (isAutoComplete) ? selector.attr('data-codigo-id') : null;
                var selectedArrayValues = (isArray) ? selector.attr('data-array-values').split(',') : [];

                if (isCombo && selectedComboId) {
                    r[f] = (selectedComboId == 0) ? null : this._parseValue(selectedComboId);
                }
                else if (isAutoComplete && selectedLookUpId) {
                    r[f] = (selectedLookUpId == 0) ? null : this._parseValueX(selectedLookUpId);
                }
                else if (isChk)
                    r[f] = $(selector).get(0).checked;
                else if (isRadio) {
                    r[f] = this._parseValue(e.find(':checked'));
                }
                else if (isDate) {
                    if (forFilter == true)
                        r[f] = kendo.toString(selector.datetimepicker().data("DateTimePicker").date(), AppContext.CURRENT_SYS_DATE_FORMAT, AppContext.CURRENT_SYS_DATE_FORMAT);
                    else
                        r[f] = $.toMomentJSON(selector.datetimepicker().data("DateTimePicker").date(), AppContext.CURRENT_SYS_DATE_FORMAT);
                }
                else if (isTime) {
                    var t = selector.datetimepicker().data("DateTimePicker").date();
                    r[f] = (t) ? t.format("hh:mm") : null;
                }
                else if (isNumber) {
                    r[f] = parseInt(selector.val()) || null;
                }
                else if (isCurrency) {
                    r[f] = parseFloat(selector.val()) || null;
                }
                else
                    r[f] = (selector.val() == '') ? null : selector.val();
            }
            return r;
        },

        /** @memberof PantallaABMC1Grilla#
        * @desc Valida los campos del popup.
        * @param {string} popupId - valor del atributo [modal_open_id] del popup a validar
        * @param {string[]} fileds - Array de nombres de campos a validar
        * @returns {boolean} true: valida correctamente / false: error de validacion
        * @example
        * 
            abm._validarCampos('popup-rechaza-orden', ['IdTipoRechazo', 'MotivoRechazo']);

        */
        _validarCampos: function (popupId, fields) {
            var me = this;
            var r = {};
            for (var i = 0; i < fields.length; i++) {
                var f = fields[i];
                var e = $('div[modal_open_id={0}] #{1}'.format(popupId, f));
                if (e.length == 0)
                    e = $('div[modal_open_id={0}] [name={1}]'.format(popupId, f));
                if (e.length > 0) {
                    if (e.attr('type') === 'number') {
                        r[f] = this._parseValue(e.val().trim());
                        if (_.isNaN(r[f]))
                            r[f] = null;
                    }
                    else if (e.attr('data-codigo') === 'true') {
                        var id_codigo = e.attr('data-codigo-id');
                        r[f] = this._parseValue(id_codigo);
                    }
                    else if (e.attr('type') === 'radio') {
                        r[f] = this._parseValue(e.find(':checked'));
                    }
                    else {
                        var id_codigo = e.attr('data-codigo-id');

                        if (!id_codigo) {
                            r[f] = e.val().trim();
                        } else if (id_codigo != 'null') {
                            r[f] = this._parseValue(id_codigo);
                        }
                    }

                    var regexStr = e.attr('data-regex');
                    var noreq = typeof e.attr('data-valor-no-requerido') !== typeof undefined && e.attr('data-valor-no-requerido') !== false;
                    if (!noreq) {
                        if (regexStr) {
                            if (!(new RegExp(regexStr).test(r[f]))) {
                                // mostrarTabConError(e);
                                Formulario.mostrarCampoConError(e);
                                return false;
                            }
                        } else if (r[f] === null || r[f] === undefined || r[f] === null || (typeof r[f] === 'string' && r[f].trim() <= 0)) {
                            Formulario.mostrarCampoConError(e);
                            return false;
                        }
                    }
                }

            }
            return true;
        },
        _initGrilla: function (selTabla, columnDef) {
            var me = this;
            var fc = $('.filter-container');
            me._heightGrilla = $(window).height() - (((fc - length > 0) ? fc.offset().top + fc.height() : 100) + $('.panel-footer').height());
            me._setupGridStateSavingMechanism();
            var hasDetail = false;
            if (me.detailGridOptions && me.detailGridOptions.columDefinition) {
                hasDetail = true;
            }
            me._recuperarEstadoPantalla(columnDef, function (estadoPantalla) {
                Grilla.init({
                    estadoGrilla: estadoPantalla,
                    selGrilla: me._nombreGrilla,
                    nombreEntidadPlural: me._nombreEntidadPlural,
                    textoSinRegistros: 'NO HAY {0}'.format(me._nombreEntidadCompleto.toUpperCase()),
                    permiteSeleccionMultiple: me._permiteSeleccionMultiple,
                    gridGroupable: me._gridGroupable,
                    gridGroupableField: me._gridGroupableField,
                    pagination: me._paginationGrid,
                    height: me._heightGrilla,
                    hasDetail: hasDetail,
                    detailPageable: (me.detailGridOptions) ? me.detailGridOptions.detailPageable : null,
                    detailColumns: (me.detailGridOptions) ? me.detailGridOptions.columDefinition : null,
                    onDetalleRowSelected: me._onDetalleRowSelected,
                    fnDatailRefresh: me._refreshGrillaDetalle,
                },
                me._onGrillaSelected,
                me,
                function (queryData, callback, settings) {
                    me._refreshGrilla(queryData, callback, settings);
                }, me._onGrillaDataBinding, me._onGrillaDataBound)
            });
        },

        /** @memberof PantallaABMC1Grilla#
        * @desc Obtiene una referencia (jquery ) a una grilla existente.
        * @param {string=} which - id de la grilla cuya referencia se quiere recuperar. Si se omite se obtiene la grilla principal del ABM
        * @returns {Object} referencia (jquery) a la grilla
        * @example
        * 
            // - obtiene una referencia a la grilla principal del ABM
            abm._getGrid();

            // - obtiene una referencia a la grilla cuyo id es pasado en el parametro [which]
            abm._getGrid('gridMercados');

        */
        _getGrid: function (which) {
            g = $("#{0}".format(which || this._nombreGrilla)).data("kendoGrid");
            return g;
        },
        _getDetailGrid: function (which) {
            g = $("#{0}".format(which || this._nombreGrilla)).data("kendoGrid");
            var gd = g.select().next('.k-detail-row').find('.k-grid').data('kendoGrid');
            return gd;
        },

        /** @memberof PantallaABMC1Grilla#
        * @desc Obtiene un objeto que representa la fila seleccionada en la grilla.
        * @param {string=} which - id de la grilla cuya fila se desea recuperar. Si se omite se obtiene la fila seleccionada de la grilla principal del ABM
        * @returns {Object} datos de la fila seleccionada
        * @example
        * 
            // - obtiene los datos que representan la fila seleccionada en la grilla principal del ABM
            abm._getRowDataGrid();

            // - obtiene los datos que representan la fila seleccionada de la grilla cuyo id es pasado en el parametro [which]
            abm._getRowDataGrid('gridMercados');

        */
        _getRowDataGrid: function (which) {
            g = $("#{0}".format(which || this._nombreGrilla)).data("kendoGrid");
            var sel = g.select();
            var data = g.dataItem(sel[sel.length - 1]);
            return data;
        },

        _getRowDataGridDetail: function (which) {
            g = $("#{0}".format(which || this._nombreGrilla)).data("kendoGrid");
            var gd = g.select().next('.k-detail-row').find('.k-grid').data('kendoGrid');
            var sel = gd.select();
            var data = gd.dataItem(sel[sel.length - 1]);
            return data;
        },

        /** @memberof PantallaABMC1Grilla#
        * @desc Establece/modifica el valor de una celda en la grilla principal.
        * @param {string} colName - nombre de la columna a modificar.
        * @param {number|strign} value - nuevo valor de la columna.
        * @returns {undefined}
        * @example
        * 
            abm._setCellDataValue('MontoVN', 10,000,000.00);

        */
        _setCellDataValue: function (colName, value) {
            g = $("#{0}".format(this._nombreGrilla)).data("kendoGrid");
            var sel = g.select();
            var data = g.dataItem(sel[sel.length - 1]);
            data.set(colName, value);
        },

        /** @memberof PantallaABMC1Grilla#
        * @desc devuelve un array con los valores de las filas seleccionadas en la grilla principal, para la columna pasada por parámetro .
        * @param {string} colName - nombre de la columna cuyos datos se quieren recuperar.
        * @returns {array} - datos de las filas seleccionadas para la columna pasada por parametro
        * @example
        * 
            abm._getDataFieldFromSelectedRows('MontoVN');

        */
        _getDataFieldFromSelectedRows: function (colName) {
            g = $("#{0}".format(this._nombreGrilla)).data("kendoGrid");
            var sel = g.select();
            var data = _.map(sel, function (s) {
                return g.dataItem(s)[colName]
            });
            return data;
        },

        /** @memberof PantallaABMC1Grilla#
        * @desc devuelve un array de objetos formado por las columnas cuyos nombres se pasan por parámetro, con los datos de las filas seleccionadas en la grilla principal.
        * @param {string[]} colNames - nombres de las columnas cuyos datos se quieren recuperar.
        * @returns {object[]} - array de objetos con los datos de las filas seleccionadas formado por las columnas pasadas por parametro
        * @example
        * 
            abm._getDataMultiFieldFromSelectedRows(['NumeroMercado', 'IdOperaion', 'CuentaNominal', 'MontoVN']);

        */
        _getDataMultiFieldFromSelectedRows: function (colNames) {
            var selected = this._getDataFromSelectedRows();
            var ret = _.map(selected, function (o) { return _.pick(o, colNames) });
            return ret;
        },

        /** @memberof PantallaABMC1Grilla#
        * @desc devuelve un array de objetos formado por las columnas cuyos nombres se pasan por parámetro, con los datos de todas las filas de la grilla.
        * @param {string} which - nombre de la grilla. Si se omite se usa la grilla principal del ABM.
        * @param {string[]} colNames - nombres de las columnas cuyos datos se quieren recuperar.
        * @returns {object[]} - array de objetos con los datos de las filas seleccionadas formado por las columnas pasadas por parametro
        * @example
        * 
            abm._getDataMultiFieldFromGrid('gridAsignaciones', ['NumeroMercado', 'IdOperaion', 'CuentaNominal', 'MontoVN']);

        */
        _getDataMultiFieldFromGrid: function (which, colNames) {
            g = $("#{0}".format(which || this._nombreGrilla)).data("kendoGrid");
            var data = g.dataItems();
            var ret = _.map(data, function (o) { return _.pick(o, colNames) });
            return ret;
        },


        /** @memberof PantallaABMC1Grilla#
        * @desc Obtiene un array de objetos que representan las filas seleccionadas en la grilla.
        * @param {string=} which - id de la grilla cuyas filas se desean recuperar. Si se omite se obtienen lan filan seleccionadan de la grilla principal del ABM
        * @returns {Object} datos de la fila seleccionada
        * @example
        * 
            // - obtiene un array con los datos que representan las filas seleccionadas en la grilla principal del ABM
            abm._getDataFromSelectedRows();

            // - obtiene un array con los datos que representan las filas seleccionadas de la grilla cuyo id es pasado en el parametro [which]
            abm._getDataFromSelectedRows('gridMercados');

        */
        _getDataFromSelectedRows: function (which) {
            g = $("#{0}".format(which || this._nombreGrilla)).data("kendoGrid");
            var sel = g.select();
            var data = _.map(sel, function (s) {
                return g.dataItem(s)
            });
            return data;
        },
        _getDataFromSelectedRowsDetail: function (which) {
            g = $("#{0}".format(which || this._nombreGrilla)).data("kendoGrid");
            var gd = g.select().next('.k-detail-row').find('.k-grid').data('kendoGrid');
            var sel = gd.select();
            var data = _.map(sel, function (s) {
                return gd.dataItem(s)
            });
            return data;
        },
        _processPostAlta: function (data, entityDTO, popup) {
            this._triggerRefreshGrilla();
            var msg = '';
            var isOk = true;

            if (data.hasOwnProperty('Ok') && data.hasOwnProperty('Message')) {
                msg = data.Message;
                isOk = data.Ok == true;
            }
            else
                msg = (data.length == 0 || data.toString().toUpperCase() == 'OK') ? 'Exitosa' : data.toString();

            if (isOk == true) {
                popup.find('button').off();
                popup.modal('hide')
                AreaMensajes.popupMensajeOK('Alta de {0}'.format(this._nombreEntidadCompleto.capitalizeFirstLetter()), msg);
            }
            else
                AreaMensajes.popupMensajeWarn('Alta de {0}'.format(this._nombreEntidadCompleto.capitalizeFirstLetter()), msg);
        },
        _processPostActualiza: function (data, entityDTO, popup) {

            this._triggerRefreshGrilla();
            var msg = '';
            var isOk = true;

            if (data.hasOwnProperty('Ok') && data.hasOwnProperty('Message')) {
                msg = data.Message;
                isOk = data.Ok == true;
            }
            else
                msg = (data.length == 0 || data.toString().toUpperCase() == 'OK') ? 'Exitosa' : data.toString();

            if (isOk == true) {
                popup.find('button').off();
                popup.modal('hide')
                AreaMensajes.popupMensajeOK('Actualizacion de {0}'.format(this._nombreEntidadCompleto.capitalizeFirstLetter()), msg);
            }
            else
                AreaMensajes.popupMensajeWarn('Actualizacion de {0}'.format(this._nombreEntidadCompleto.capitalizeFirstLetter()), msg);

        },

        _processPostElimina: function (data, entityDTO, popup) {
            popup.find('button').off();
            popup.modal('hide')
            this._triggerRefreshGrilla();
            var msg = '';
            var isOk = true;

            if (data.hasOwnProperty('Ok') && data.hasOwnProperty('Message')) {
                msg = data.Message;
                isOk = data.Ok == true;
            }
            else
                msg = (data.length == 0 || data.toString().toUpperCase() == 'OK') ? 'Exitosa' : data.toString();

            if (isOk == true)
                AreaMensajes.popupMensajeOK('Baja de {0}'.format(this._nombreEntidadCompleto.capitalizeFirstLetter()), msg);
            else
                AreaMensajes.popupMensajeWarn('Baja de {0}'.format(this._nombreEntidadCompleto.capitalizeFirstLetter()), msg);
        },
        _processPostVista: function (modal_open_id, popup) {
            popup.find('button').off();
            popup.modal('hide')
        },
        _getControlConcurrenciaValue: function () {
            var data = this._getRowDataGrid();
            return data[this._nombreCampoControlConcurrencia];
        },
        _onGrillaDoubleClick: function (grilla, me) {
            if (this._onGrillaDoubleClickOverrided && typeof (this._onGrillaDoubleClickOverrided) == 'function') {
                this._onGrillaDoubleClickOverrided.apply(grilla, me);
            }
            else if (this._commandButtons.indexOf('C') >= 0) {
                var g = grilla;
                var data = g.dataItem(g.select()[0]);
                var r_id = data[data.length - 1];
                Formulario.popupFormulario('popup-vista', this._processPostVista, this, { onOpen: this._onOpenVista }, this._prepareVista);
            }
        },
        _onGrillaDoubleClickOverrided: null, // si pasamos una funcion en las opciones, la asignamos y le damos preferencia
        _onGrillaSelected: function (grilla, me) {
            var g = grilla;
            var sel = g.select();
            me._seleccion.clear();
            for (var i = 0; i <= sel.length - 1; i++) {
                var data = g.dataItem(sel[i]);
                var r_id = data[me._nombreCampoIdentidad];
                var cc = data[me._nombreCampoControlConcurrencia];
                me._seleccion.push(r_id, cc);
            }

            if (me._onGrillaRowSelected && typeof (me._onGrillaRowSelected) == 'function')
                me._onGrillaRowSelected.apply(me);
        },
        _onDetalleRowSelected: function (grilla, me) {
            var g = grilla;
            var sel = g.select();
            me._seleccionDetalle.clear();
            for (var i = 0; i <= sel.length - 1; i++) {
                var data = g.dataItem(sel[i]);
                var r_id = data[me._nombreCampoIdentidad];
                me._seleccionDetalle.push(r_id);
            }

            if (me._onGrillaRowSelected && typeof (me._onGrillaRowSelected) == 'function')
                me._onGrillaRowSelected.apply(me);
        },

        _onGrillaClearSelection: function (grilla) {
            this._seleccion.clear();
        },
        _triggerRefreshGrilla: function (which) {
            var me = this;
            var canQueryGrid = true;
            if (this.validarPreconditionQuery && typeof (this.validarPreconditionQuery) == 'function') {
                canQueryGrid = this.validarPreconditionQuery.apply(this);
            }
            if (canQueryGrid) {
                dt = this._getGrid(which);
                if (dt)
                    dt.dataSource.fetch();
            }
            return true;
        },
        _triggerRefreshGrillaHighLight: function () { //TODO: aun no se usa...
            var me = this;
            dt = this._getGrid();
            dt.draw(true);
            return true;
        },
        _refreshGrilla: function (queryData, callback, settings) {

            var me = this;
            var filtros = me._filtros;

            filtros.pageNumber = (filtros.forcePageNumber) ? 1 : queryData.page || 1; //queryData.start;
            filtros.pageSize = (queryData.pageSize == 0) ? 1000 : queryData.take; //queryData.draw;

            delete filtros['forcePageNumber'];

            var options = {
                requireIdentityFilter: me._requiereIdentidad, returnColumnNames: true
            };

            if (me._extendToKnownType)
                options.extendToKnownType = me._extendToKnownType;
            if (me._gridAdapter)
                options.gridAdapter = me._gridAdapter;

            var canQueryGrid = true;
            if (this.validarPreconditionQuery && typeof (this.validarPreconditionQuery) == 'function') {
                canQueryGrid = this.validarPreconditionQuery.apply(this);
            }
            if (canQueryGrid) {
                Query.execGridUI(AppContext.QueryServices, 'QRY_SCRN_{0}_GRID_MAIN_ALL'.format(me._nombreEntidadPlural.toUpperCase()),
                filtros,
                options,
                function (data, jqXHR) {
                    if (callback != null && typeof (callback) == 'function') {
                        var result = JSON.parseWithDate(jqXHR.responseText);
                        if (!options.hasOwnProperty('gridAdapter')) {
                            var resultWithColumns = [];
                            for (var i = 0; i < result.Data.length; i++) {
                                resultWithColumns.push(_.zipObject(result.ColumnNames, result.Data[i]));
                            }
                            result.Data = resultWithColumns;
                        }
                        callback(result, data, settings);

                    }

                    defer(function () {
                        Grilla.selectFirstRow(me._nombreGrilla);
                        Formulario.createSelectedFiltersPreview('popup-filtros', me, function () {
                            me._filtros = me._makeDTOFiltros(me._camposFiltros());
                            me._filtros.pageNumber = 1;
                            me._filtros.forcePageNumber = true;
                            me._triggerRefreshGrilla();
                        });
                        me._onABMResize();
                    });
                });
            } else {
                callback({ Data: [] }, [], settings);
            }
        },


        _refreshGrillaDetalle: function (e, me, queryData, callback, settings) {
            var filtros = (me.detailGridOptions.camposFiltroABM) ? me._makeDTOFiltros(me.detailGridOptions.camposFiltroABM) : {};
            filtros.pageNumber = (filtros.forcePageNumber) ? 1 : queryData.page || 1; //queryData.start;
            filtros.pageSize = (queryData.pageSize == 0) ? 1000 : queryData.take; //queryData.draw;
            filtros[me._nombreCampoIdentidad] = e.data[me._nombreCampoIdentidad];

            var options = {};
            options.requireIdentityFilter = false;
            options.returnColumnNames = true;
            if (me._extendToKnownType)
                options.extendToKnownType = me.detailGridOptions.extendToKnownType;

            Query.execGridUI(AppContext.QueryServices, 'QRY_SCRN_{0}_DETALLE_GRID_MAIN_ALL'.format(me._nombrePantalla.toUpperCase()),
                filtros,
                options,
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

        /** @memberof PantallaABMC1Grilla#
        * @desc Crea/Inicializa los controles de tipo DateTime dentro de un popup o filtro.<br><p><small> Los controles de tipo DateTime se crean a partir de un input con el atributo [data-is-date] o [data-is-time]</small></p>
        * @param {string} elementId - id del popup que contiene los controles a inicializar
        * @param {boolean} setCurrDate - Establece si se setea la Fecha de Sistema por defecto en los controles
        * @param {string[]} exclusion - Opcional - Array con los nombres de los controles que se excluyen del seteo de Fecha de Sistema
        * @example
        * 
            // - inicializa todos los controles de tipo fecha (attr data-is-date) y les setea la fecha del sistema
            abm._initDateFields('popup-filtros', true, []);

            // - inicializa todos los controles de tipo fecha (attr data-is-date) y les setea la fecha del sistema a excepción de FechaConcertacionDesde y FechaConcertacionHasta
            abm._initDateFields('popup-filtros', true, ['FechaConcertacionDesde', 'FechaConcertacionHasta']);

        */
        _initDateFields: function (elementId, setCurrDate, exclusion) {
            var me = this;
            var _format = AppContext.CURRENT_SYS_DATE_FORMAT;
            var source = $('#{0} input[data-is-date], #{0} input[data-is-time]'.format(elementId));
            source.each(function (index) {
                var s = $(this);
                if (s.attr('data-is-date'))
                    _format = AppContext.CURRENT_SYS_DATE_FORMAT;
                if (s.attr('data-is-time'))
                    _format = 'HH:mm';

                s.datetimepicker({
                    format: _format,
                    icons: {
                        time: "fa fa-clock-o",
                        date: "fa fa-calendar",
                        previous: 'fa fa-chevron-left',
                        next: 'fa fa-chevron-right',
                        up: "fa fa-chevron-up",
                        down: "fa fa-chevron-down",
                        clear: 'fa fa-trash',
                        toolbarPlacement: 'top',
                        collapse: false,
                        locale: 'es',
                        defaultDate: false,
                        useCurrent: false,
                    },
                    viewMode: 'days',
                    debug: false,
                    showClear: true,
                }).on('dp.hide', function (e) {
                    return false;
                });

                if (setCurrDate == true && exclusion.indexOf(s.attr('Id')) < 0) {
                    if (s.attr('data-is-date')) {
                        s.data("DateTimePicker").date(AppContext.CURRENT_SYS_DATE);
                        s.data("DateTimePicker").viewDate(AppContext.CURRENT_SYS_DATE);
                    }
                    if (s.attr('data-is-time')) {
                        s.data("DateTimePicker").date(moment(new Date()).format('HH:mm'));
                    }
                }
                else if (setCurrDate && _.isDate(new Date(setCurrDate)) == true && exclusion.indexOf(s.attr('Id')) < 0) {
                    if (s.attr('data-is-date')) {
                        var m = new moment(setCurrDate).format(AppContext.CURRENT_SYS_DATE_FORMAT);
                        s.data("DateTimePicker").date(m);
                        s.data("DateTimePicker").viewDate(m);
                    }
                    if (s.attr('data-is-time')) {
                        s.data("DateTimePicker").date(moment(new Date()).format('HH:mm'));
                    }
                };

                source.on('change', function (ev) {
                    if ($(this).val().length == 0)
                        $(this).datetimepicker().data("DateTimePicker").date(null);
                });
            });
        },

        _loadFilters: function (elementId, continueShowingForm) {
            var me = this;
            //var isABMRedirect = (me._extraParams != null && me._extraParams != undefined);
            var combosEnPantalla = $(".{0} #{1} [{2}], #{1} [{2}]".format(me._nombrePantalla, elementId, 'data-is-combo'));
            var combosConChache = $(".{0} #{1} [{2}][data-cache], #{1} [{2}][data-cache]".format(me._nombrePantalla, elementId, 'data-is-combo'));
            var formIncourse = false;
            if (combosEnPantalla.length == combosConChache.length) //no necesito ir al server
            {
                me.assignCombosDataSource(elementId);
                if (continueShowingForm) {
                    continueShowingForm();
                    formIncourse = true;
                }
            }
            else if ($(".{0} #{1} [{2}]".format(me._nombrePantalla, elementId, 'data-is-combo')).length > 0 || ($("#{0} [{1}]".format(elementId, 'data-is-combo')).length > 0)) {
                var queryName = 'QRY_SCRN_{0}_FILTERS_BUNDLE'.format(me._nombreEntidadPlural.toUpperCase());
                var options = {};
                if (me._extendToKnownTypeForFilter)
                    options.extendToKnownType = me._extendToKnownTypeForFilter;

                if (me._filtersAdapter) {
                    queryName = me._filtersAdapter;
                    options.filtersAdapter = true;
                }
                formIncourse = true;

                Query.execCombosUI(AppContext.QueryServices, queryName, options, null, function (dataset) {
                    me._setupFiltersFields(elementId, dataset);
                    if (continueShowingForm) {
                        continueShowingForm();
                    }
                });
            }
            if ($(".{0} #{1} [{2}]".format(me._nombrePantalla, elementId, 'data-is-autocomplete')).length > 0 || $("#{0} [{1}]".format(elementId, 'data-is-autocomplete')).length > 0) {
                me.setupAutocomplete(elementId);
                if (continueShowingForm && !formIncourse) {
                    continueShowingForm();
                    formIncourse = true;
                }
            }
            else
                if (!formIncourse) continueShowingForm();
        },

        _setupFiltersFields: function (elementId, dataset) {
            var me = this;
            me._filters = dataset;
            for (var i = 0; i < me._filters[0].length; i++) {
                var model = me._filters[0][i].NombreCampo;
                //if (AppContext.UsarCombosCaheados)
                //    AppContext.Combos[model] = AppContext.Combos[model] || me._filters[1 + i];
                //else
                AppContext.Combos[model] = me._filters[1 + i];

            }
            _.forIn(AppContext.Combos, function (value, key) {
                var selector = $("#{0} input[data-model={1}][data-is-combo]".format(elementId, key));
                if (selector.length > 0) {
                    selector.attr('data-is-combo', true);
                    me.setupCombo(elementId, key, value, 'NAME', 'ID', ' Buscar ' + selector.attr('placeholder'));
                }
            });

            //me.setupAutocomplete(elementId);
        },

        assignCombosDataSource: function (elementId) {
            var me = this;
            _.forIn(AppContext.Combos, function (value, key) {
                var selector = $("#{0} input[data-model={1}][data-is-combo]".format(elementId, key));
                if (selector.length > 0) {
                    selector.attr('data-is-combo', true);
                    me.setupCombo(elementId, key, value, 'NAME', 'ID', ' Buscar ' + selector.attr('placeholder'));
                }
            });
        },

        setupAutocomplete: function (elementId, dependsOn) {
            var me = this;
            var source = $('#{0} input[data-is-autocomplete]'.format(elementId));

            source.each(function (index) {
                var s = $(this);

                //lookup
                var lkp = CustomLookUp.initLookUp(s, me);
                CustomLookUp.initEvents(lkp);

                //autocomplete
                var nombreEntidad = s.attr('data-query');
                var displayItem = s.attr('data-display-item');
                var selectedItemSource = s.attr('data-value-item');
                var dependentOf = (s.attr('data-filters') != 'undefined' && s.attr('data-filters') != '') ? s.attr('data-filters').split(',') : [];
                var gridAdapter = s.attr('data-grid-adapter');

                var filtros = {};

                filtros.pageNumber = 1;
                filtros.pageSize = 100;

                var service = s.attr('data-serviceClass').split('.');

                var options = {
                };
                if (service[1])
                    options = {
                        'extendToKnownType': service[1], 'returnColumnNames': true
                    };
                else
                    options = {
                        'returnColumnNames': true
                    };

                if (dependentOf.length >= 1) {
                    for (var i = 0; i < dependentOf.length; i++) {
                        var f = $('#{0} #{1}'.format(elementId, dependentOf[i].trim()));
                        f.on('change', function () {
                            s.val('').attr('data-codigo-id', '');
                        })
                    }
                }
                s.typeahead({
                    minLength: 3,
                    source: function (query, process) {
                        filtros.query = query;
                        if (dependentOf.length >= 1) {
                            for (var i = 0; i < dependentOf.length; i++) {
                                var f = $('#{0} #{1}'.format(elementId, dependentOf[i].trim()));
                                if (f.attr('data-is-combo') || f.attr('data-is-autocomplete'))
                                    filtros[dependentOf[i]] = f.attr('data-codigo-id');
                                else filtros[dependentOf[i]] = f.val();
                            }
                        }

                        var queryName = 'QRY_SCRN_{0}_FILTERS_BUNDLE'.format(nombreEntidad);

                        if (gridAdapter) {
                            queryName = nombreEntidad;
                            options.gridAdapter = true;
                        }

                        return Query.execGridUI(AppContext.QueryServices,
                        queryName,
                        filtros,
                        options,
                        function (dataset) {
                            var resultWithColumns = [];
                            if (gridAdapter)
                                resultWithColumns = dataset;
                            else {
                                for (var i = 0; i < dataset.data.length; i++) {
                                    resultWithColumns.push(_.zipObject(dataset.ColumnNames, dataset.data[i]));
                                }
                            }
                            return process(resultWithColumns);
                        }
                            );
                    },
                    displayText: function (i) {
                        return i[displayItem];
                    },
                });

                if (selectedItemSource) {

                    s.on('change', function (e) {
                        var current = $(this).typeahead("getActive");

                        if (current) {
                            if (current[displayItem].toString().toUpperCase() === $(this).val().toUpperCase()) {
                                $(this).attr('data-codigo-id', current[selectedItemSource]);
                            } else {
                                $(this).val('');
                                $(this).attr('data-codigo-id', null);
                                e.preventDefault();
                            }
                        } else {
                            $(this).val('');
                            $(this).attr('data-codigo-id', null);
                            e.preventDefault();
                        }

                        var lkp = $(this).data('CustomLookUp');
                        if (current && lkp.onChange && typeof (lkp.onChange) == 'function') {
                            lkp.onChange.apply(lkp.abm, [lkp.element, current[selectedItemSource], current[displayItem]]);
                        }
                    });
                }
            });
        },

        setupCombo: function (elementId, selector, dataSource, displayItem, selectedItemSource, placeholder) {
            var me = this;
            var source = $('#{0} [data-model={1}]{2}'.format(elementId, selector, '[data-is-combo]'));
            if (source.length > 0) {
                source.each(function (index) {
                    var s = $(this);
                    s.typeahead('destroy');
                    var tah = s.data("typeahead");
                    if (tah) tah.destroy();

                    selectedItemSource = s.attr('data-key-item') || selectedItemSource;
                    displayItem = s.attr('data-display-item') || displayItem;

                    if ("" != s.attr('value')) {
                        s.attr('placeholder', '-- Seleccione --');
                    }
                    s.typeahead({
                        minLength: 0,
                        autoSelect: false,
                        showHintOnFocus: true,
                        source: dataSource,
                        displayText: function (i) {
                            return i[displayItem];
                        },
                        afterSelect: function (v) {

                        }
                    });

                    if ("" != s.attr('value')) {
                        var item = s.data('typeahead').setItem(selectedItemSource, displayItem, s.attr('value'));
                        s.val(item[displayItem]);
                        s.attr('data-codigo-id', item[selectedItemSource])
                        s.typeahead('val', item[displayItem]);
                    }

                    if (selectedItemSource) {

                        s.on('change', function (e) {
                            var current = $(this).typeahead("getActive");

                            if (current) {
                                var v = current[selectedItemSource];
                                if (current[displayItem].toUpperCase() === $(this).val().toUpperCase()) {
                                    $(this).attr('data-codigo-id', v);
                                    $("input[data-filters*={0}]".format(s.attr('id'))).val('').attr('data-codigo-id', '');
                                } else {
                                    $(this).val('');
                                    $(this).attr('data-codigo-id', null);
                                    $(this).typeahead('val', "");
                                    e.preventDefault();
                                }
                            } else {
                                $(this).val('');
                                $(this).attr('data-codigo-id', null);
                                $(this).typeahead('val', "");
                                e.preventDefault();
                            }

                            var fnChange = window[s.attr('onDataChange')];
                            if (typeof (fnChange) == 'function')
                                fnChange.apply(me, [current, s, elementId]);
                        });

                        s.on('click', function (e) {
                            $(this).typeahead('lookup', '');
                        })
                    }
                    //dependencias
                    var _source = s.attr('data-filters');
                    if (_source) {
                        _source = _source.split(',');
                        for (var i = 0; i < _source.length; i++) {
                            var _target = s.attr('Id');
                            var cbbSource = $('#{0} #{1}{2}'.format(elementId, _source[i], '[data-is-combo]'));
                            var cbbTarget = $('#{0} #{1}{2}'.format(elementId, _target, '[data-is-combo]'));

                            var dsource = cbbTarget.data("typeahead").source || AppContext.Combos[_target];
                            me.comboDependency(elementId, _source[i], _target, cbbSource.attr('data-key-item'), dsource, source.attr('data-display-item'), me.setDSToTargetCombo);
                        }
                    }
                    // fin dependencias

                    if (!source.next().is('span') && !source.next().hasClass('fa fa-angle-down')) {
                        source.parent().append('<span class="fa fa-angle-down form-control-feedback" aria-hidden="true"></span>');
                    }
                });

            }
        },

        comboDependency: function (elementId, source, target, sourceProperty, targetDataset, targetProperty, targetLoadCB) {
            var source = $('#{0} #{1}{2}'.format(elementId, source, '[data-is-combo]'));
            var target = $('#{0} #{1}{2}'.format(elementId, target, '[data-is-combo]'));

            target.attr('disabled', true);

            // If combo has value (ei. update screen) display its retrieved value
            if ("" != target.attr('value')) {
                target.attr('placeholder', '');
                target.val(target.attr('value'));
            }
            else {
                target.attr('placeholder', 'SELECCIONE');
            }

            source.on('change', function (e) {
                var current = $(this).typeahead("getActive");
                target.val('');
                target.attr('placeholder', 'SELECCIONE');
            });

            source.on('change', function (e) {
                var current = $(this).typeahead("getActive");

                if (current) {
                    $(this).attr('data-codigo-id', current[sourceProperty]);
                    target.attr('disabled', true);
                    target.attr('placeholder', 'CARGANDO...');
                    targetLoadCB(function (data) {
                        target.attr('placeholder', 'SELECCIONE');
                        target.attr('disabled', false);
                        //targetDataset = data;
                        target.typeahead('destroy');
                        target.typeahead({
                            showHintOnFocus: true,
                            source: data,
                            displayText: function (i) {
                                return i[targetProperty];
                            }
                        });
                    }, targetDataset, source, current[sourceProperty], target, elementId);
                } else {
                    $(this).val('');
                    $(this).attr('data-codigo-id', null);
                    e.preventDefault();
                }
            });
        },

        setDSToTargetCombo: function (cb, dataSource, source, sourceValue, target, popupId) { //dataSource, value, property
            var dependents = target.attr('data-filters').split(',');
            var srcId = source.attr('Id');
            var _data = [];
            var itemVal = {};
            for (var i = 0; i < dependents.length; i++) {
                var el = $('#{0} #{1}'.format(popupId, dependents[i]));
                var key = el.attr('data-key-item');
                var dname = el.attr('data-display-item');
                var value = el.attr('data-codigo-id');
                var item = {};

                if (srcId == el.attr('Id')) {
                    itemVal[key] = sourceValue;
                }
                else if (value) {
                    item = el.data('typeahead').setItem(key, dname, value);
                    itemVal[key] = item[key]
                }
                else itemVal[key] = null;
            }
            _data = _.filter(dataSource, itemVal);

            cb.apply(this, [_data]);

        },

        /** @memberof PantallaABMC1Grilla#
        * @desc Setea el valor pasado por parámetro al Combobox 'element'. Utilizado principalmente para setear valores de combos en popups personalizados.
        * @param {string} element - Id del elemento (html) que representa el combo cuyo valor se desea setear.
        * @param {string|number} value - Valor de combo que desea setear.
        * @returns {undefined} 
        * @example
        * 
            abm.fillInitializedCombo('TipoLiquidacion', 17);

        */
        fillInitializedCombo: function (element, value) {
            var dataKey = element.attr('data-key-item');
            var dataDisplay = element.attr('data-display-item');
            var item = element.data('typeahead').setItem(dataKey, dataDisplay, value);

            element.val(item[dataDisplay]);
            element.attr('data-codigo-id', item[dataKey])
            element.typeahead('val', item[dataDisplay]);
        },

        fillInitializedLookup: function (element, value) {
            var me = this;
            if (value) element.attr('data-codigo-id', value);

            var filtros = {};
            filtros[element.attr('data-value-item')] = value || element.attr('data-codigo-id');
            filtros.pageNumber = 1;
            filtros.pageSize = 1;
            var options = {
            };
            var service = element.attr('data-serviceClass').split('.');
            var modelName = element.attr('data-query');
            if (service[1]) {
                options = {
                    'extendToKnownType': service[1], 'returnColumnNames': true
                };
            }
            else {
                options = {
                    'returnColumnNames': true
                };
            }
            var queryName = 'QRY_SCRN_{0}_FILTERS_BUNDLE'.format(modelName);
            if (element.attr('data-grid-adapter') == 'true') {
                queryName = modelName;
                options.gridAdapter = true;
            }

            Query.execGridUI(AppContext.QueryServices,
            queryName,
            filtros,
            options,
            function (data, jqXHR) {

                var result = JSON.parseWithDate(jqXHR.responseText);
                if (!options.gridAdapter) {
                    var resultWithColumns = [];
                    for (var i = 0; i < result.Data.length; i++) {
                        resultWithColumns.push(_.zipObject(result.ColumnNames, result.Data[i]));
                    }
                    result.Data = resultWithColumns;
                }
                if (result.Data.length > 0) {
                    element.val(result.Data[0][element.attr('data-display-item')]);
                    element.data('DataRow', result.Data[0]);
                    var handle = window[element.attr('data-on-change')];
                    if (handle)
                        handle.apply(me, [element, element.attr('data-codigo-id'), element.val()]);
                        
                }



            }, null, null, null)
        },
        fillInitializedLookupMemoria: function (element, value) {
            var diferido = $.Deferred();

            var me = this;
            if (value) element.attr('data-codigo-id', value);

            var filtros = {};
            filtros[element.attr('data-value-item')] = value || element.attr('data-codigo-id');
            filtros.pageNumber = 1;
            filtros.pageSize = 1;
            var options = {
            };
            var service = element.attr('data-serviceClass').split('.');
            var modelName = element.attr('data-query');
            if (service[1]) {
                options = {
                    'extendToKnownType': service[1], 'returnColumnNames': true
                };
            }
            else {
                options = {
                    'returnColumnNames': true
                };
            }
            var queryName = 'QRY_SCRN_{0}_FILTERS_BUNDLE'.format(modelName);
            if (element.attr('data-grid-adapter') == 'true') {
                queryName = modelName;
                options.gridAdapter = true;
            }

            Query.execGridUI(AppContext.QueryServices,
            queryName,
            filtros,
            options,
            function (data, jqXHR) {

                var result = JSON.parseWithDate(jqXHR.responseText);
                if (!options.gridAdapter) {
                    var resultWithColumns = [];
                    for (var i = 0; i < result.Data.length; i++) {
                        resultWithColumns.push(_.zipObject(result.ColumnNames, result.Data[i]));
                    }
                    result.Data = resultWithColumns;
                }
                if (result.Data.length > 0) {
                    element.val(result.Data[0][element.attr('data-display-item')]);
                    element.data('DataRow', result.Data[0]);
                    var handle = window[element.attr('data-on-change')];
                    if (handle)
                        handle.apply(me, [element, element.attr('data-codigo-id'), element.val()]);

                }

                diferido.resolve();

            }, null, null, null)

            return diferido.promise();
        },
        _setupKeyshortcuts: function () {
            var me = this;

            $(window).keydown(function (e) {
                if ((e.ctrlKey || e.metaKey)) {
                    switch (e.keyCode) {
                        case 70:
                            me.showFiltros();
                            e.preventDefault();
                            break;
                        case 66:
                            me.showFiltros();
                            e.preventDefault();
                            break;
                            //case 65: TODO: FIXME: se confunde con CTRL A para seleccionar en INGLES (hacer por idioma de browser/usuario??)
                            //    me.showAlta();
                            //    e.preventDefault();
                            //    break;
                        case 80:
                            me.showImprimir();
                            e.preventDefault();
                            break;
                        case 68:
                            me.showEliminar();
                            e.preventDefault();
                            break;
                        case 69:
                            me.showImprimir();
                            e.preventDefault();
                            break;
                        case 72:
                            me.showHistorialCambios();
                            e.preventDefault();
                            break;
                        case 77:
                            me.showModificar();
                            e.preventDefault();
                            break;
                    }
                }
            });
        },
        _setupActionBarButtons: function () {
            var me = this;

            $('.{0} #boton_exporta_excel'.format(me._nombrePantalla)).click(function (e) {
                var popupTemplate = $('#popup-accion-exportar').clone();
                popupTemplate.find('.modal-title').html('<span class="fa fa-file-excel-o">&nbsp;</span> Exportar datos a Excel')
                popupTemplate.modal({
                    backdrop: 'static', keyboard: true
                })
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

            $('.{0} #boton_exporta_pdf'.format(me._nombrePantalla)).click(function (e) {
                var popupTemplate = $('#popup-accion-exportar').clone();
                popupTemplate.find('.modal-title').html('<span class="fa fa-file-pdf-o">&nbsp;</span> Exportar datos a PDF')
                popupTemplate.modal({
                    backdrop: 'static', keyboard: true
                })
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

            $('.{0} #boton_auditoria'.format(me._nombrePantalla)).click(function (e) {
                me.showAuditoria();
            });

            $('.{0} #boton_actualiza'.format(me._nombrePantalla)).click(function (e) {
                if (me._seleccion.hasNoneSelection() || !me._seleccion.hasOneSelectionOnly()) {
                    AreaMensajes.toastInfo("Solo se permite modificar un (1) registro.");
                }
                else {
                    me.showActualiza();
                }
            });


            $('.{0} #boton_alta'.format(me._nombrePantalla)).click(function (e) {
                me.showAlta();
            });

            $('.{0} #boton_mostrar_filtros'.format(me._nombrePantalla)).click(function (e) {
                me.showFiltros();
            });

            $('.{0} #boton_busqueda_primaria'.format(me._nombrePantalla)).on('click', function (e) {
                var primaryFilterVal = $('#input_filtro_primario').val();
                if (primaryFilterVal)
                    $('#{0}'.format(me._camposFiltros()[0])).val($('#input_filtro_primario').val());

                me._filtros = me._makeDTOFiltros(me._camposFiltros());
                me._filtros.pageNumber = 1;
                me._filtros.forcePageNumber = true;
                me._triggerRefreshGrilla();

                var sel = $('.{0} #{1}'.format(me._nombrePantalla, 'popup-filtros'));
                //TODO: Este es el toggle del filtro en la grilla
                var dest = sel.find(".popup-filtros");
                $(dest).css('display', 'none');

            });

            $('.{0} #boton_limpiar_filtro_primario'.format(me._nombrePantalla)).click(function (e) {
                for (var f = 0; f < me._camposFiltros().length; f++) {
                    var sel = $('#{0}'.format(me._camposFiltros()[f]));
                    var isCombo = sel.attr('data-is-combo');
                    var isAutoComplete = sel.attr('data-is-autocomplete');
                    var isDate = sel.attr('data-is-date');
                    if (isCombo || isAutoComplete) {
                        sel.attr('data-codigo-id', '');
                        sel.typeahead('val', '');
                    }
                    else if (isDate)
                        sel.data("DateTimePicker").date(null);

                    sel.val('');

                    $('#{0}'.format("input_filtro_primario")).val('');
                }

                $('.{0} #boton_busqueda_primaria'.format(me._nombrePantalla)).trigger('click');

                var cnt = $('#{0} .selectedFiltersPreview'.format(me._nombrePantalla));
                cnt.html('');
            });

            $('.{0} #input_filtro_primario'.format(me._nombrePantalla)).keypress(function (e) {
                if (e.keyCode == 13)
                    $('#boton_busqueda_primaria').click();
            });

            $('.{0} #input_filtro_primario'.format(me._nombrePantalla)).on('change', function (ev) {
                $('#{0}'.format(me._camposFiltros()[0])).val($(this).val());
            });

            $('#{0}'.format(me._camposFiltros()[0])).on('change', function (ev) {
                $('.{0} #input_filtro_primario'.format(me._nombrePantalla)).val($(this).val());
            });

            $('.{0} #boton_elimina'.format(me._nombrePantalla)).click(function (e) {
                if (me._seleccion.hasNoneSelection()) {
                    AreaMensajes.toastInfo('No hay ningún registro seleccionado.');
                }
                else {
                    me.showEliminar();
                }
            });

            $('.{0} #boton_vista'.format(me._nombrePantalla)).click(function (e) {
                if (me._seleccion.hasNoneSelection()) {
                    AreaMensajes.toastInfo('No hay ningún registro seleccionado.');
                }
                else {
                    me.showVista();
                }
            });

            $('.{0} #boton_copiar_fila'.format(me._nombrePantalla)).click(function (e) {
                if (me._seleccion._selectedItems.length > 1) {
                    AreaMensajes.toastWarning('Debe seleccionar una sola fila para copiar.');
                }
                else {
                    var data = me._getRowDataGrid();
                    $("#copyAreaFilaDeGrid").val(JSON.stringify(data));
                    document.querySelector("#copyAreaFilaDeGrid").select();
                    document.execCommand('copy');
                    AreaMensajes.toastInfo('Se copió una fila al portapapeles.');
                }
            });

            $('.{0} #boton_copiar_celda'.format(me._nombrePantalla)).click(function (e) {
                if (me._seleccion._selectedItems.length > 1) {
                    AreaMensajes.toastWarning('Debe seleccionar una sola fila para copiar.');
                }
                else {

                    $("#copyAreaFilaDeGrid").val(me._seleccion._cellContent);
                    document.querySelector("#copyAreaFilaDeGrid").select();
                    document.execCommand('copy');
                    AreaMensajes.toastInfo('Se copió la celda al portapapeles.');
                }
            });

            $('.{0} #boton_anclar'.format(me._nombrePantalla)).click(function (e) {
                var ei = $(this).find('i');
                if (ei.hasClass('ancled')) {
                    $(this).find('i').removeClass('ancled');
                    $(this).find('i').addClass('fa-rotate-90');
                    delete AppContext.ThumbnailPantallas[me._nombrePantalla];
                    localStorage[AppContext.CURRENT_USER_NAME] = JSON.stringify(AppContext.ThumbnailPantallas);
                } else {
                    $(this).find('i').addClass('ancled');
                    $(this).find('i').removeClass('fa-rotate-90');
                    me._grabarEstadoPantalla(true);
                }
            });

            $("a[title]").tooltip({
                container: "body", placement: "left", delay: 200
            });
        },

        _setupMainBar: function () {
            var me = this;
            var mb = $("#mainbar.primitiva").clone();
            mb.removeClass('primitiva');

            $(".{0}".format(me._nombrePantalla)).find("#main-bar").html(mb.show());
            var newMainBar = $(".{0}".format(me._nombrePantalla)).find("#main-bar");

            _(newMainBar.find("a[data-permission]")).forEach(function (btn) {
                var dcmd = $(btn).attr('data-cmd');
                var allPerm = $(btn).attr('data-permission');
                var hasPerm = (parseInt(me._permiso) & parseInt(allPerm));

                if (me._commandButtons.indexOf(dcmd) >= 0)
                    $(btn).removeClass('hidden');

                if (hasPerm == 0)
                    newMainBar.find(btn).remove();

                if (me._extraParams && me._extraParams.hasOwnProperty('options.showActions'))
                    if (me._extraParams['options.showActions'].split(',').indexOf(dcmd) < 0 && dcmd != 'X')
                        newMainBar.find(btn).remove();

                if (dcmd == 'Z') {
                    if (_.keys(AppContext.ThumbnailPantallas).indexOf(me._nombrePantalla) >= 0) {
                        $(btn).find('i').removeClass('fa-rotate-90');
                        $(btn).find('i').addClass('ancled');
                    }
                }
            });

            if (me._extraParams)
                newMainBar.find("a[id=boton_cerrar]").removeClass('hidden');
        },

        _setupExtraActions: function (extraIcons) {
            var me = this;
            $('.{0} #extra_botones'.format(me._nombrePantalla)).addClass('extra_herramientas');
            var extraBar = $('.{0} .extra_herramientas'.format(me._nombrePantalla));

            for (var i = 0; i < extraIcons.length; i++) {
                var ea = extraIcons[i];
                var btn = $('<a id="{0}" title="{1}" class="{2}"><i style="color: {3}" class="boton-barra-herramienta {4}">&nbsp;</i></a>'.format(ea.id, ea.title, ea.includeInContextMenu ? 'context-menu-item' : '', ea.color, ea.icon));
                btn.attr('data-cmd', 'CC');
                proxy = proxyAEL(btn);
                proxy('click', ea.proc, false);
                extraBar.append(btn);

                if (me._extraParams && me._extraParams.hasOwnProperty('options.showActions')) {
                    if (me._extraParams['options.showActions'].split(',').indexOf(ea.id) < 0)
                        btn.remove();
                }
            }

            function proxyAEL(element) {
                return function (eventName, handler) {
                    element.on(eventName, function () {
                        handler.apply(me)
                    });
                }
            }

        },
        _setupExtraDetailActions: function (extraIcons) {
            var me = this;
            $('#detailBar').html('');
            $('#detailBar').addClass('extra_herramientas');
            var extraBar = $('#detailBar.extra_herramientas');

            for (var i = 0; i < extraIcons.length; i++) {
                var ea = extraIcons[i];
                var btn = $('<a id="{0}" title="{1}" class="{2}"><i style="color: {3}" class="boton-barra-herramienta {4}">&nbsp;</i></a>'.format(ea.id, ea.title, ea.includeInContextMenu ? 'context-menu-item' : '', ea.color, ea.icon));
                btn.attr('data-cmd', 'CC');
                proxy = proxyAEL(btn);
                proxy('click', ea.proc, false);
                extraBar.append(btn);

                if (me._extraParams && me._extraParams.hasOwnProperty('options.showActions')) {
                    if (me._extraParams['options.showActions'].split(',').indexOf(ea.id) < 0)
                        btn.remove();
                }
            }

            function proxyAEL(element) {
                return function (eventName, handler) {
                    element.on(eventName, function () {
                        handler.apply(me)
                    });
                }
            }

        },
        _setupGridStateSavingMechanism: function () {
            var me = this;
            $(window).unload(function () {
                me._grabarEstadoPantalla();
            });
            $('#BodyContent').bind('contentBeforeChanged', function (ev) {
                me._grabarEstadoPantalla(false);
                $(this).off();
            });
        },
        _setupGridStateSavingMechanism: function () {
            var me = this;
            $(window).unload(function () {
                me._grabarEstadoPantalla();
            });
            $('#BodyContent').bind('contentBeforeChanged', function (ev) {
                me._grabarEstadoPantalla(false);
                $(this).off();
            });
        },

        _grabarEstadoPantalla: function (isThumb) {
            var me = this;
            var estadoPantalla = {
                filtros: null /* TODO: recuperar filtros de la pantalla */
            };

            var grid = me._getGrid();
            if ((grid && me._gridHasChanged == true)) {
                estadoPantalla[me._nombreGrilla] = kendo.stringify(grid.getOptions());
                var args = {
                    Codigo: this._nombrePantalla, Valor: JSON.stringify(estadoPantalla)
                };
                var options = {
                    TipoPermiso: 16
                };
                Command.execUI(AppContext.CommandServices, 'ActualizaEstadoPantallaCommand', args, options);
            }

            if (isThumb) {
                captureScreen(function (thumb) {
                    localStorage.setItem(AppContext.CURRENT_USER_NAME, thumb);
                });
            }

            function captureScreen(cb) {
                html2canvas($('.{0} div'.format(me._nombrePantalla)), {
                    onrendered: function (canvas) {
                        var extra_canvas = document.createElement("canvas");
                        var odd = 400 / 350;
                        extra_canvas.setAttribute('width', 400);
                        extra_canvas.setAttribute('height', 300);
                        var ctx = extra_canvas.getContext('2d');
                        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 600, 400);
                        var dataURL = extra_canvas.toDataURL();
                        AppContext.ThumbnailPantallas[me._nombrePantalla] = dataURL;
                        cb(JSON.stringify(AppContext.ThumbnailPantallas));
                    },
                    width: 600,
                    height: 400,
                    type: '',
                });
            }
        },

        _recuperarEstadoPantalla: function (columnDef, cb) {
            var me = this;
            Query.execDataUI(AppContext.QueryServices, 'QRY_UI_USER_SCREEN_STATE', {
                NombrePantalla: this._nombrePantalla
            }, function (data) {
                //si devuleve vacio del server, 
                //recuperamos las columnas x default definidas en la pagina que corresponde a @ViewBag.NombrePantalla
                if (Object.keys(data[0]).length === 0 && data[0].constructor === Object) {
                    cb(columnDef[me._nombrePantalla])
                } else {
                    if (Object.prototype.toString.call(data) === '[object Array]')
                        cb(JSON.parse(JSON.parse(data[0][me._nombrePantalla])[me._nombreGrilla]).columns)
                    else
                        cb(JSON.parse(data[0].json_data));
                }
            });
        },

        _initContextMenu: function (excludeItems) {
            var me = this;
            context.destroy('#{0} .k-grid-content:first'.format(me._nombreGrilla));
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

            context.attach('#{0} .k-grid-content:first'.format(me._nombreGrilla), me._buildContextMenuItems(excludeItems));
        },

        _buildContextMenuItems: function (excludeItems) {
            var esAccionExtra = false;
            var r = [];
            var actionBarButtons = $('.{0} #mainbar a.context-menu-item'.format(this._nombrePantalla));

            for (var i = 0; i < actionBarButtons.length; i++) {
                var sel = $(actionBarButtons[i]);
                if (!excludeItems || excludeItems.indexOf(sel.attr('id')) < 0) {
                    var dcmd = sel.attr('data-cmd');
                    var initGroup = sel.attr('data-init-group');
                    if (this._commandButtons.indexOf(dcmd) >= 0 || this._extraButtons.indexOf(dcmd) >= 0) {
                        if ((this._extraButtons.indexOf(dcmd) >= 0 || sel.parent('.extra_herramientas').length > 0) && (!esAccionExtra || initGroup)) {
                            r.push({
                                divider: true
                            });
                            esAccionExtra = true;
                        }

                        var _fn = function (i) {
                            var target = findEventHandlers('click', actionBarButtons[i])[0].events[0].handler;
                            var handler = function (e) {
                                e.preventDefault();
                                target();
                            }

                            r.push({
                                text: '&nbsp;{0}'.format(sel.attr('data-original-title')),
                                action: handler,
                                htmlClass: sel.find('i').attr('class'),
                                htmlStyle: 'color: black',
                            });
                        };


                        _fn(i);
                    }
                }
            }
            return r;
        },

        _initContextMenuForElement: function (el, avoidShowMe, pantalla, toolbarName, builtItems, excludeItems) {
            var me = this;
            context.destroy('#{0} #{1}'.format(pantalla, el));
            context.init({
                fadeSpeed: 100,
                above: 'auto',
                preventDoubleContext: true,
                compress: false
            });
            context.setPreventShow(function () {
                return avoidShowMe;
            });
            context.attach('#{0} #{1}'.format(pantalla, el), me._buildContextMenuItemsForElement(pantalla, toolbarName, excludeItems));
        },

        _buildContextMenuItemsForElement: function (pantalla, toolbarName, excludeItems) {
            var r = [];
            var actionBarButtons = $('#{0} #{1} a.context-menu-item, #{1} a.context-menu-item'.format(pantalla, toolbarName));

            for (var i = 0; i < actionBarButtons.length; i++) {
                var sel = $(actionBarButtons[i]);
                var initGroup = sel.attr('data-init-group');
                if (initGroup) {
                    r.push({
                        divider: true
                    });
                }

                var _fn = function (i) {
                    if (!excludeItems || excludeItems.indexOf(sel.attr('id')) < 0) {
                        var target = findEventHandlers('click', actionBarButtons[i])[0].events[0].handler;
                        var handler = function (e) {
                            e.preventDefault();
                            target();
                        }

                        r.push({
                            text: '&nbsp;{0}'.format(sel.attr('data-original-title')),
                            action: handler,
                            htmlClass: sel.find('i').attr('class'),
                            htmlStyle: 'color: black',
                        });
                    }
                };

                _fn(i);
            }

            return r;
        },
        _parseValue: function (v) {
            if (isNaN(v))
                return v;
            else
                return parseInt(v);
        },
        _parseValueX: function (v) {
            if (isNaN(v))
                return v;
            else if (_.isNumber(v))
                return parseInt(v);
            else return v;
        },
        _onGrillaDataBinding: undefined,
        _onGrillaDataBound: undefined,
        _onGrillaRowSelected: undefined,
        _onOpenVista: undefined,
        _onOpenAlta: undefined,
        _onOpenActualiza: undefined,
        _onOpenDelete: undefined,
        _onOpenAuditoria: undefined,
        _onCloseAuditoria: undefined,

        // State
        _extraParams: null,
        _filters: null,
        _nombreEntidadSingular: '',
        _nombreEntidadPlural: '',
        _nombreEntidadCompleto: '',
        _nombrePantalla: 'PANTALLA SIN NOMBRE',
        _nombreGrilla: 'GRID',
        columnDef: [],
        detailGridOptions: null,
        columnDetailDef: null,
        commandsDetailGrid: [],
        _gridGroupable: false,
        _gridGroupableField: null,
        _paginationGrid: {
            refresh: false, pageSizes: true
        },
        _gridHasChanged: false,
        _requiereIdentidad: false,
        _extendToKnownType: null,
        _extendToKnownTypeForFilter: null,
        _filtersAdapter: null,
        _gridAdapter: null,
        _ejecutaRowCustomQuery: false,
        _permiteSeleccionMultiple: false,
        _nombreCampoIdentidad: 'r_id',
        _nombreCampoControlConcurrencia: 'UltimaActualizacion',
        _commandButtons: ['A', 'B', 'M', 'C', 'E', 'P', 'Z', 'CF'],
        _extraButtons: ['CC', 'CF'],
        _filterLoaded: false,
        _seleccion: {
            _selectedRowIndex: 0,
            _selectedColIndex: 0,
            _cellContent: '',
            _selectedItems: [],
            _selectedCCItems: [],
            push: function (r_id, cc) {
                this._selectedItems.push(r_id); this._selectedCCItems.push(cc);
            },
            remove: function (r_id) {
                var i = this._selectedItems.indexOf(r_id); if (i >= 0) this._selectedItems.splice(i, 1);
            },
            clear: function () {
                this._selectedItems = []; this._selectedCCItems = [];
            },
            selectedItems: function () {
                return this._selectedItems;
            },
            selectedCCItems: function () {
                return this._selectedCCItems;
            },
            hasOneSelectionOnly: function () {
                return this._selectedItems.length == 1;
            },
            hasNoneSelection: function () {
                return this._selectedItems.length == 0;
            }
        },
        _seleccionDetalle: {
            _selectedRowIndex: 0,
            _selectedColIndex: 0,
            _cellContent: '',
            _selectedItems: [],
            push: function (r_id) {
                this._selectedItems.push(r_id);
            },
            remove: function (r_id) {
                var i = this._selectedItems.indexOf(r_id); if (i >= 0) this._selectedItems.splice(i, 1);
            },
            clear: function () {
                this._selectedItems = []; this._selectedCCItems = [];
            },
            selectedItems: function () {
                return this._selectedItems;
            },
            selectedCCItems: function () {
                return this._selectedCCItems;
            },
            hasOneSelectionOnly: function () {
                return this._selectedItems.length == 1;
            },
            hasNoneSelection: function () {
                return this._selectedItems.length == 0;
            }
        }
    }
};

Log.debug('Modulo web PantallaABMC1Grilla cargado OK');