var Grilla = {
    init: function (options, onRowSelected, sender, refrescar, onDataBinding, onDataBound) {
        var me = this;
        // options = estadoGrilla, selGrilla, textoEntidadRegisto, textoSinRegistros, usa paginacion, height, etc

        var _estadoGrilla = options.estadoGrilla || [];
        var _nombreGrilla = options.selGrilla || 'GRILLA';
        var _nombreEntidadPlural = options.nombreEntidadPlural || '';
        var _textoSinRegistros = options.textoSinRegistros || '';
        var _pagination = options.pagination; // { refresh: false, pageSizes: true } : options.pagination;
        var _groupable = options.gridGroupable || false;
        var _sortable = (options.gridSortable) ? options.gridSortable : false;
        var _groupableField = options.gridGroupableField || null;
        var _height = options.height || 400;
        var _hasDetail = options.hasDetail || false;
        var onDetalleRowSelected = options.onDetalleRowSelected || null;
        var detailPageable = (options.detailPageable) ?options.detailPageable : false;

        me._fnDatailRefresh = options.fnDatailRefresh || null;
        me._detailColumns = options.detailColumns || [];
        
        var t = $('#{0}'.format(_nombreGrilla)).kendoGrid({
            dataSource: me.getDataSource(options, refrescar, _groupableField),
            columnMenu: {
                columns: true,
                sortable: false,
                messages: {
                    columns: "Columnas"
                }
            },
            detailInit: (_hasDetail) ? function (e) { me.detailInit(e, me, sender,detailPageable, options.detailColumns, onDetalleRowSelected, options.fnDatailRefresh); } : null,
            excel: { fileName: "{0}_{1}_{2}".format(sender._nombreEntidadPlural || _nombreGrilla, new Date().getTime(), ".xls") },
            pdf: { fileName: "{0}_{1}_{2}".format(sender._nombreEntidadPlural, new Date().getTime(), ".pdf") },
            autoBind: false,
            navigatable: true,
            groupable: _groupable,
            pageable: _pagination,
            height: _height,
            selectable: (options.permiteSeleccionMultiple) ? "multiple" : "row",
            scrollable: options.scrollable || true,
            resizable: true,
            reorderable: true,
            sortable: (_sortable) ? _sortable : true,
            filterable: options.filterable || false,
            columns: _estadoGrilla,
            columnReorder: function (e) {
                console.log(e.column.field, e.newIndex, e.oldIndex);
                _estadoGrilla = this.getOptions().columns;
                sender._gridHasChanged = true;
                me._createSaveSettingsButton(e.sender.element, sender);
            },
            columnHide: function (e) {
                console.log(e.column.field);
                sender._gridHasChanged = true;
                me._createSaveSettingsButton(e.sender.element, sender);
            },
            columnShow: function (e) {
                console.log(e.column.field);
                sender._gridHasChanged = true;
                me._createSaveSettingsButton(e.sender.element, sender);
            },
            columnResize: function (e) {
                sender._gridHasChanged = true;
                me._createSaveSettingsButton(e.sender.element, sender);
            },
            change: function (g, r) {
                if (onRowSelected != null && typeof (onRowSelected) == 'function')
                    onRowSelected(this, sender); //this es la grilla
            },
            dataBinding: function (e) {
                if (onDataBinding != null && typeof (onDataBinding) == 'function') {
                    onDataBinding(e, sender);
                }

                $(e.sender.table).find('tr').on('dblclick', function () {
                    if (onRowSelected != null && typeof (onRowSelected) == 'function') {
                        onRowSelected(e.sender, sender);
                        sender._onGrillaDoubleClick(e.sender);
                    }
                });
            },
            dataBound: function (e) {
                $(e.sender.table).attr('id', 'gridMaster');
                var tr = $(e.sender.table).find('tr');
                tr.removeClass('k-alt');

                tr.on('dblclick', function () {
                    if (onRowSelected != null && typeof (onRowSelected) == 'function') {
                        onRowSelected(e.sender, sender);
                        if (sender._onGrillaDoubleClick != null && typeof (sender._onGrillaDoubleClick) == 'function')
                            sender._onGrillaDoubleClick(e.sender);
                    }
                });

                tr.on("click", "td", function (ev) { //$(e.sender.tbody).find('tr')
                    var row = $(this).closest("tr");
                    var rowIdx = $("tr", e.sender.tbody).index(row);
                    var colIdx = $("td", row).index(this);
                    $(e.sender.tbody).find('td').removeClass("k-state-focused");
                    $(this).addClass("k-state-focused");
                    if (sender._seleccion) {
                        sender._seleccion._cellContent = $(this).text();
                        sender._seleccion._selectedRowIndex = rowIdx;
                        sender._seleccion._selectedColIndex = colIdx;
                    }
                });

                $(e.sender.thead).find('tr th a.k-link').each(function (a) {
                    $(this).attr('title', $(this).text());
                });

                if (onDataBound != null && typeof (onDataBound) == 'function') {
                    onDataBound(e, sender);
                }

                /*setTimeout(resizeCols, 500);

                function resizeCols() {
                    var g = sender._getGrid(options.selGrilla);
                    _.each(g.columns, function (c) {
                        g.autoFitColumn(c)
                    })
                }*/
            },
            group: function (e) {
                if (e.groups.length) {
                    if (sender._gridHasChanged) {
                        me._createSaveSettingsButton(e.sender.element, sender);
                    }
                }
            },
            detailExpand: function (e) {
                e.sender.select(e.masterRow)
                //this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
            },
        });

        $('#{0}'.format(_nombreGrilla)).data("kendoGrid").dataSource.read();

        $(".k-grid .command[title]").tooltip({ container: "body", placement: "top", delay: 200 });

        return t;

    },

    getDataSource: function (options, refrescar, group, columns) {
        if (group) {
            return {
                serverPaging: true,
                pageSize: AppContext.get_defaultPageSize(),
                transport: {
                    read: function (options) {
                        refrescar(options.data, options.success, options)
                    }
                },
                filterable: options.filterable || false,
                schema: { data: "Data", total: "recordsTotal" },
                group: group,
                aggregate: options.agregateFields || null,
                error: AppContext.onKendoError,
            };
        } else {
            return {
                serverPaging: true,
                pageSize: AppContext.get_defaultPageSize(),
                transport: {
                    read: function (options) {
                        refrescar(options.data, options.success, options)
                    }
                },
                filterable: options.filterable || false,
                schema: { data: "Data", total: "recordsTotal" },
                aggregate: options.agregateFields || null,
                error: AppContext.onKendoError,
            };
        }
    },

    from: function (selGrilla) {
        return $("#{0}".format(selGrilla)).data("kendoGrid");;
    },
    selectFirstRow: function (selGrilla) {
        $("#{0}".format(selGrilla)).data("kendoGrid").refresh();

        if (this._cantidadRegistros(selGrilla) > 0) {
            var rows = $('#{0} tbody tr'.format(selGrilla))[0].click();
        }

    },
    _fnDatailRefresh: null,
    detailInit: function (e, me, sender, detailPageable, detailColumns, onRowSelected, callback) {
        $("<div id='gridDetalle'/>").appendTo(e.detailCell).kendoGrid({
            dataSource: {
                type: "odata",
                transport: {
                    read: function (options) {
                        callback(e, sender, options.data, options.success, options)
                    }
                },
                serverPaging: true,
                pageSize: AppContext.get_defaultPageSize(),
                schema: { data: "Data", total: "recordsTotal" },
            },
            scrollable: true,
            sortable: true,
            pageable: detailPageable,
            autoBind: true,
            resizable: true,
            selectable: true,
            columns: detailColumns,
            change: function (g, r) {
                if (onRowSelected != null && typeof (onRowSelected) == 'function')
                    onRowSelected(this, sender);
                sender._getGrid().select(e.masterRow)
            },
            dataBound: function (e) {

                var tr = $(e.sender.table).find('tr');
                tr.removeClass('k-alt');

                tr.on('dblclick', function () {
                    if (onRowSelected != null && typeof (onRowSelected) == 'function') {
                        onRowSelected(e.sender, sender);
                        if (sender._onGrillaDetalleDoubleClick != null && typeof (sender._onGrillaDetalleDoubleClick) == 'function')
                            sender._onGrillaDetalleDoubleClick(e.sender);
                    }
                });

                tr.on("click", "td", function (ev) {
                    var row = $(this).closest("tr");
                    var rowIdx = $("tr", e.sender.tbody).index(row);
                    var colIdx = $("td", row).index(this);
                    $(e.sender.tbody).find('td').removeClass("k-state-focused");
                    $(this).addClass("k-state-focused");
                    if (sender._seleccionDetalle) {
                        sender._seleccionDetalle._cellContent = $(this).text();
                        sender._seleccionDetalle._selectedRowIndex = rowIdx;
                        sender._seleccionDetalle._selectedColIndex = colIdx;
                    }
                });

                $(e.sender.thead).find('tr th a.k-link').each(function (a) {
                    $(this).attr('title', $(this).text());
                });

                if (sender.detailGridOptions.onDataBound != null && typeof (sender.detailGridOptions.onDataBound) == 'function') {
                    sender.detailGridOptions.onDataBound(e, sender);
                }

            },
        });
    },

    _preProcessData: function (data) {

    },
    _refrescarTiempoTranscurrido: function (me, selGrilla) {
        defer(function () {
            var dt = moment(me._ultimoGridRefresh).fromNow();
            $('#refrescoDato_tabla_uno').html('&nbsp;<span class="fa fa-clock-o">&nbsp;</span>' + dt);
        });
    },
    _cantidadRegistros: function (selGrilla) {
        var grid = $("#{0}".format(selGrilla)).data("kendoGrid");
        var count = grid.dataSource._view.length;
        return grid ? count : 0;
    },
    _createSaveSettingsButton: function (grid, sender) {
        var btn = $('<a title="Guardar Escritorio" id="btnSaveGridSettings" class="pull-right boton-barra-herramienta pointer mg1R"><i class="fa fa-save"></i></a>');
        var g = $(grid).find(".k-grouping-header");
        g.find("a#btnSaveGridSettings").remove();
        g.append(btn);
        btn.on('click', function () {
            sender._grabarEstadoPantalla(false);
            $(this).clearQueue();
            $(this).off();
            $(this).remove();
            AreaMensajes.toastSuccess('Se guardo exitosamente el escritorio.');
        });
        /*
        (function blink() {
            var b = $(".k-grouping-header #btnSaveGridSettings");
            if (b.length > 0) {
                btn.fadeIn(500, function () {
                    btn.fadeOut(500, blink);
                });
            }
        })
        ()*/
    },
    _createMenuSettings: function (grid, sender) {
        var btn = $('<a id="menuGridSettings" class="pull-right boton-barra-herramienta pointer mg1R" style="position:absolute; right:5px; height:28px;"><i class="fa fa-long-arrow-down"></i></a>');
        var g = $(grid).find(".k-grid-header");
        g.find("a#menuGridSettings").remove();
        g.append(btn);
        btn.on('click', function () {
            sender._grabarEstadoPantalla(false);
            $(this).clearQueue();
            $(this).off();
            $(this).remove();
        });

        (function blink() {
            var b = $(".k-grouping-header #btnSaveGridSettings");
            if (b.length > 0) {
                btn.fadeIn(700, function () {
                    btn.fadeOut(700, blink);
                });
            }
        })()
    },
    _ultimoGridRefresh: null /* DT_RENDER */,
    _detailColumns: [],
}


var TreeList = {
    init: function (options, onRowSelected, sender, refrescar, onDataBinding, onDataBound) {
        var me = this;

        var _estadoTree = options.estadoTree || [];
        var _nombreTree = options.selTree || 'TREE';
        var _nombreEntidadPlural = options.nombreEntidadPlural || '';
        var _textoSinRegistros = options.textoSinRegistros || '';
        var _groupable = options.gridGroupable || false;
        var _sortable = (options.gridSortable) ? options.gridSortable : false;
        var _height = options.height || 400;
        var _hasDetail = options.hasDetail || false;
        var onDetalleRowSelected = options.onDetalleRowSelected || null;

        var t = $('#{0}'.format(_nombreTree)).kendoTreeList({
            dataSource: me.getDataSource(options, refrescar),
            columnMenu: {
                columns: true,
                sortable: false,
                messages: {
                    columns: "Columnas"
                }
            },
            excel: { fileName: "{0}_{1}_{2}".format(sender._nombreEntidadPlural, new Date().getTime(), ".xls") },
            autoBind: false,
            navigatable: true,
            height: _height,
            selectable: (options.permiteSeleccionMultiple) ? "multiple" : "row",
            scrollable: true,
            resizable: true,
            sortable: (_sortable) ? _sortable : true,
            filterable: options.filterable || false,
            columns: _estadoTree,
            change: function (g, r) {
                if (onRowSelected != null && typeof (onRowSelected) == 'function')
                    onRowSelected(this, sender); //this es la Tree
            },
            dataBinding: function (e) {
                if (onDataBinding != null && typeof (onDataBinding) == 'function') {
                    onDataBinding(e, sender);
                }

                $(e.sender.table).find('tr').on('dblclick', function () {
                    if (onRowSelected != null && typeof (onRowSelected) == 'function') {
                        onRowSelected(e.sender, sender);
                        sender._onTreeDoubleClick(e.sender);
                    }
                });
            },
            dataBound: function (e) {
                $(e.sender.table).attr('id', 'gridMaster');
                var tr = $(e.sender.table).find('tr');
                tr.removeClass('k-alt');

                tr.on('dblclick', function () {
                    if (onRowSelected != null && typeof (onRowSelected) == 'function') {
                        onRowSelected(e.sender, sender);
                        if (sender._onTreeDoubleClick != null && typeof (sender._onTreeDoubleClick) == 'function')
                            sender._onTreeDoubleClick(e.sender);
                    }
                });

                tr.on("click", "td", function (ev) {
                    var row = $(this).closest("tr");
                    var rowIdx = $("tr", e.sender.tbody).index(row);
                    var colIdx = $("td", row).index(this);
                    $(e.sender.tbody).find('td').removeClass("k-state-focused");
                    $(this).addClass("k-state-focused");
                    if (sender._seleccion) {
                        sender._seleccion._cellContent = $(this).text();
                        sender._seleccion._selectedRowIndex = rowIdx;
                        sender._seleccion._selectedColIndex = colIdx;
                    }
                });

                $(e.sender.thead).find('tr th a.k-link').each(function (a) {
                    $(this).attr('title', $(this).text());
                });

                if (onDataBound != null && typeof (onDataBound) == 'function') {
                    onDataBound(e, sender);
                }

            },
        });

        $('#{0}'.format(_nombreTree)).data("kendoTreeList").dataSource.read();

        return t;

    },

    getDataSource: function (options, refrescar, group, columns) {

        return {
            serverPaging: true,
            pageSize: AppContext.get_defaultPageSize(),
            transport: {
                read: function (options) {
                    refrescar(options.data, options.success, options)
                }
            },
            filterable: options.filterable || false,
            schema: { data: "Data", total: "recordsTotal" },
            aggregate: options.agregateFields || null,
            error: AppContext.onKendoError,
        };
    },

    from: function (selTree) {
        return $("#{0}".format(selTree)).data("kendoTreeList");;
    },
    selectFirstRow: function (selTree) {
        $("#{0}".format(selTree)).data("kendoTreeList").refresh();

        if (this._cantidadRegistros(selTree) > 0) {
            var rows = $('#{0} tbody tr'.format(selTree))[0].click();
        }

    },

    _refrescarTiempoTranscurrido: function (me, selTree) {
        defer(function () {
            var dt = moment(me._ultimoGridRefresh).fromNow();
            $('#refrescoDato_tabla_uno').html('&nbsp;<span class="fa fa-clock-o">&nbsp;</span>' + dt);
        });
    },
    _cantidadRegistros: function (selTree) {
        var grid = $("#{0}".format(selTree)).data("kendoTreeList");
        var count = grid.dataSource._view.length;
        return grid ? count : 0;
    },

}