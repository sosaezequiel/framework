var Formulario = {
    filterLoaded: false,
    initFormulario: function (elementId, title, isFilter, sender) {
        var me = this,
            pantalla = sender._nombrePantalla,
            formSel = null,
            popupTemplate = (isFilter) ? $('#popup-template-filtro').clone() : $('#popup-template').clone();

        me._formularios[pantalla] = me._formularios[pantalla] || {};

        formSel = $('.{0} #{1}'.format(pantalla, elementId));

        if (formSel.length == 0)
            formSel = $('#{0}'.format(elementId));

        popupTemplate.attr('id', elementId);
        popupTemplate.find('.to-be-removed').replaceWith(formSel.html());

        if (['popup-eliminar', 'popup-confirmar', 'popup-informa'].indexOf(elementId) < 0)
            formSel.remove();

        me._formularios[pantalla][elementId] = { html: popupTemplate.wrapAll('<div>').parent().html(), title: title };

        if (isFilter) {
            $(".{0} .filter-container".format(pantalla)).html(me._formularios[pantalla][elementId].html).show();
            $(".{0} .filter-container #{1}".format(pantalla, elementId)).show();
            var label = $(".{0} .filter-container label[for={1}]".format(pantalla, sender._camposFiltros()[0]));
            var ctlPrimaryField = $(".{0} .filter-container #{1}".format(pantalla, sender._camposFiltros()[0]));
            var inputPrimaryFilter = $(".{0} .filter-container #{1}".format(pantalla, elementId)).find('#input_filtro_primario');
            var isNotImput = (ctlPrimaryField.attr('data-is-combo') || ctlPrimaryField.attr('data-is-autocomplete'));
            if (!isNotImput) {
                inputPrimaryFilter.attr('placeholder', 'Buscar por ' + label.text());
            }
            else
                inputPrimaryFilter.attr('disabled', true);

            me.filterLoaded = false;

            $(".{0} .filter-container".format(pantalla)).find("[title]").tooltip({
                container: "body", placement: "left", delay: 100
            });

            if (sender._extraParams && sender._extraParams['options.hideFilter'])
                $(".{0} .filter-container".format(pantalla)).addClass('hidden');

            _.each(sender._camposFiltros(), function (c) {
                var sel = $('.{0} .filter-container #{1}'.format(sender._nombrePantalla, c));
                sel.attr('data-valor-no-requerido', true);
            });
        }
    },

    initFormularioTipoABM: function (sender, elementId, title, isRedirect, params, cb) {
        var me = this,

            pantalla = (elementId != 'popup-auditoria') ? sender._nombrePantalla : 'Auditoria',
            formSel = null,
            popupTemplate = $('#popup-template-extra-abm').clone();

        me._formularios[pantalla] = me._formularios[pantalla] || {};

        if (isRedirect) {
            var action = $('#menu ul a[data-page-name={0}]'.format(elementId));
            $.post(action.attr('href'), params, function (h) {
                popupTemplate.attr('id', elementId);
                popupTemplate.find('.to-be-removed').replaceWith(h);
                me._formularios[pantalla][elementId] = { html: popupTemplate.wrapAll('<div>').parent().html(), title: title };

                if (typeof (cb) == 'function')
                    cb.apply(me, [sender]);
            });

        }
        else if (!me._formularios[pantalla][elementId]) {
            popupTemplate.attr('id', elementId);
            formSel = $('#{0}'.format(elementId));
            popupTemplate.find('.to-be-removed').replaceWith(formSel.html());
            formSel.remove();



            me._formularios[pantalla][elementId] = { html: popupTemplate.wrapAll('<div>').parent().html(), title: title };

        }
    },

    popupFormulario: function (elementId, commited, sender, options, prepare) {
        var me = this,

            pantalla = pantalla = (elementId != 'popup-auditoria') ? sender._nombrePantalla : 'Auditoria',
            modal_open_id = elementId + new Date().getTime();

        options = options ? options : {};




        var tmp = me._formularios[pantalla][elementId].html;
        $('#popups-formularios').append(tmp);

        var sel = $('#popups-formularios').find('#{0}'.format(elementId));

        sel.attr('modal_open_id', modal_open_id);

        if (options.actionText) {
            sel.find('.action-text').html(options.actionText);
        }
        if (options.extraText) {
            sel.find('.extraTextData').html('<span style="overflow-wrap: break-word;line-height: normal;">{0}</span>'.format(options.extraText));
        }

        if (options.modalWidth) {
            sel.find('.modal-dialog').addClass(options.modalWidth);
        }

        if (options.btnAceptarText) {
            sel.find('.modal-footer #btnAceptar.button').html(options.btnAceptarText);
        }

        if (options.btnCancelarText) {
            sel.find('.modal-footer #btnCancelar.button').html(options.btnCancelarText);
        }

        if (!prepare) prepare = function (cb) { cb(arguments); };

        prepare.apply(sender, [function () {

            me.formatNumberToMask(sel);

            sel.modal({ backdrop: 'static', keyboard: true }).drags({ handle: ".modal-header" })

            var nice = sel.niceScroll({ cursorcolor: "#00b3c5", cursorwidth: 8, autohidemode: false, cursorborderradius: "1px" });

            sel.on('shown.bs.modal', function () {
                if (options.actionTitle) {
                    var title = sel.find('.modal-title').html();
                    sel.find('.modal-title').html(options.actionTitle);
                }
                if (options.onOpen != null && typeof (options.onOpen) == 'function') {
                    options.onOpen.apply($(this), [elementId, sender, options.params]);
                }
                defer(function () {
                    sel.find('input:first:not([data-provide="typeahead"]):not([data-is-date])').focus();
                    sel.find('input:text:last:not([data-provide="typeahead"])').keyup(function (e) {
                        if (e.keyCode == 13) {
                            sel.find('.modal-footer #btnAceptar.button').trigger('click');
                        }
                    });
                });
            });

            sel.on('hide.bs.modal', function () {
                var isLkp = $('#popups-formularios').find('[modal_open_id=' + modal_open_id + '][id^="popup-lookup-"]');
                if (isLkp.length == 0)
                    $(document).off('data-change');

                $('#popups-formularios').find('[modal_open_id=' + modal_open_id + ']').remove();
                $('.tooltip.fade.left.in').remove();

                if (options.onClose != null && typeof (options.onClose) == 'function') {
                    options.onClose.apply($(this), [elementId, sender]);
                }
            });


            sel.find('.modal-title').html(me._formularios[pantalla][elementId].title);

            var commitBtn = sel.find('.modal-footer #btnAceptar.button');
            var cancelBtn = sel.find('.modal-footer #btnCancelar.button');

            if (options.estiloBoton) commitBtn.addClass(options.estiloBoton);

            if (options.htmlBoton) commitBtn.html(options.htmlBoton);

            commitBtn.click(function () {
                //$(this).attr('disabled', true);
                if (commited && !commited.apply(sender, [modal_open_id, sel])) {
                    AppContext.ClickedButton = $(this);
                }


            });

            cancelBtn.click(function () {
                if (AppContext.ClickedButton)
                    AppContext.ClickedButton.removeAttr('disabled');
            });

            if (options.canceledfn) {
                cancelBtn.click(function (e) {
                    e.preventDefault();
                    $(this).attr('disabled', true);
                    if (options.canceledfn && !options.canceledfn.apply(sender, [modal_open_id, sel])) {
                        $(this).removeAttr('disabled');
                    }
                });
            }

            if (!commited)
                sel.find('.modal-footer').remove();

            if (!options.persistirValores) me._clearFieldsOnExit(sel);

        }, options.params]);

        sel.find('#btn_unique_print_view').on('click', function (ev) {
            var or = (sel.find('.modal-dialog').hasClass('modal-lg-xx') || sel.find('.modal-dialog').hasClass('modal-lg')) ? 'l' : 'p'
            var ow = sel.find('.modal-content').width();
            var oh = sel.find('.modal-content').height();
            var s = (or == 'p') ? [oh * 1.3, ow * 1.3] : [ow * 1.3, oh * 1.3];

            var pdf = new jsPDF(or, 'pt', s);
            pdf.addFont("courier", "courier Regular", "normal");
            pdf.setFont("courier", "normal");
            pdf.setFontSize(11);

            var canvas = pdf.canvas;
            canvas.height = oh * 1.3;
            canvas.width = ow * 1.3;

            var divPtr = $.clone(sel.find('.modal-content').get(0));
            $("body").prepend($(divPtr));
            $(divPtr).find('.modal-footer').remove();
            $(divPtr).css({ position: 'fixed', 'z-index': 99999999, top: '15px', left: '15px', width: ow - 15 });
            $(divPtr).find('i').removeClass();
            $(divPtr).find('span').removeClass('fa fa-angle-down');
            $(divPtr).find('.modal-header span').removeClass();

            html2pdf(divPtr, pdf, function (pdf) {
                pdf.save(modal_open_id + '.pdf');
                $(divPtr).remove();
            });
        })

        return sel;
    },

    popupFormularioExtraABM: function (abm, elementId, commited, sender, options, prepare) {
        var me = this,
            pantalla = abm._nombrePantalla,
            modal_open_id = elementId + new Date().getTime();

        options = options ? options : {};

        $('#popups-formularios').append(me._formularios[pantalla][elementId].html);

        var sel = $('#{0}'.format(elementId)).attr('modal_open_id', modal_open_id);

        if (options.modalWidth) {
            sel.find('.modal-dialog').addClass(options.modalWidth);
        }

        if (!prepare) prepare = function (cb) { cb(arguments); };

        prepare.apply(sender, [function () {

            sel.modal({ backdrop: 'static', keyboard: true }).drags({ handle: ".panel-heading" })
            $('.modal-body .row.{0}'.format(elementId)).removeClass('row');
            $('.modal-body .row.leyenda'.format(elementId)).removeClass('row');

            sel.on('shown.bs.modal', function () {

                if (options.onOpen != null && typeof (options.onOpen) == 'function') {
                    options.onOpen.apply($(this), [elementId, sender]);
                }
                defer(function () {
                    sel.find('input:first:not([data-provide="typeahead"]):not([data-is-date])').focus();
                });
            });

            sel.on('hide.bs.modal', function () {
                $('#popups-formularios').find('[modal_open_id=' + modal_open_id + ']').remove();
            });

            sel.find('.modal-title').html(me._formularios[pantalla][elementId].title);

            var commitBtn = sel.find('.modal-footer #btnAceptar.button');

            if (options.estiloBoton) commitBtn.addClass(options.estiloBoton);

            if (options.htmlBoton) commitBtn.html(options.htmlBoton);

            commitBtn.click(function () {
                $(this).attr('disabled', true);
                if (commited && !commited.apply(sender, [modal_open_id])) {
                    sel.modal('hide');
                    $(this).off();
                }
                $(this).removeAttr('disabled');

            });

            if (!options.persistirValores) me._clearFieldsOnExit(sel);
        }, modal_open_id]);

        return sel;
    },

    initFiltro: function (elementId, commited, sender, options, prepare) {
        var me = this;
        options = options ? options : {};
        var sel = $('.{0} #{1}'.format(sender._nombrePantalla, elementId));


        var dest = sel.find(".popup-filtros");
        dest.attr('modal_open_id', 'popup-filtros');


        if (!me.filterLoaded) {

            if (!prepare) prepare = function (cb) { cb(arguments); };
            prepare.apply(sender, [
                function () {

                    defer(function () {
                        sel.find('input:first:not([data-provide="typeahead"]):not([data-is-date])').focus();
                        sel.find('.typeahead.dropdown-menu').hide();
                    });

                    if (!options.persistirValores) me._clearFieldsOnExit(sel);

                    me.filterLoaded = true;
                }
            ]);

            var commitBtn = $('.{0} #{1} .row:last .button#boton_aceptar_filtro'.format(sender._nombrePantalla, elementId));
            if (options.estiloBoton) commitBtn.addClass(options.estiloBoton);
            if (options.htmlBoton) commitBtn.html(options.htmlBoton);

            commitBtn.click(function () {


                $(this).attr('disabled', true);
                if (commited && !commited.apply(sender)) {
                    $(dest).hide();
                    me.createSelectedFiltersPreview(elementId, sender, commited);
                }
                $(this).removeAttr('disabled');


            });

            $('#boton_limpiar_filtro, #boton_limpiar_filtro_primario').click(function (e) {
                for (var f = 0; f < sender._camposFiltros().length; f++) {
                    var sel = $('#{0}'.format(sender._camposFiltros()[f]));
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
                if (commited && !commited.apply(sender)) {
                    $(dest).hide();
                }

                var cnt = $('.{0} #{1} .selectedFiltersPreview'.format(sender._nombrePantalla, elementId));
                cnt.html('');
            });

        }

        defer(function () {
            sel.find('input:first:not([data-provide="typeahead"]):not([data-is-date])').focus();

        });
    },
    popupFiltro: function (elementId, sender) {
        var me = this;
        var sel = $('.{0} #{1}'.format(sender._nombrePantalla, elementId));

        //Este es el toggle del filtro en la grilla
        var dest = sel.find(".popup-filtros");
        $(dest).toggle();
        var myL = $(".{0} #{1}".format(sender._nombrePantalla, "input_filtro_primario")).width();
        $(dest).css("width", myL + 13);
    },
    makeDTOFiltro: function (modal_open_id, arrayNombresCampos) {
        var me = this;
        var r = {};

        arrayNombresCampos.map(function (e, i, a) {
            r[e] = $('div[id={0}] #{1}'.format(modal_open_id, e)).val();
        });
        return r
    },
    makeDTO: function (modal_open_id, arrayNombresCampos) {
        var me = this;
        var r = {};

        arrayNombresCampos.map(function (e, i, a) {
            var _el = $('div[modal_open_id={0}] #{1}'.format(modal_open_id, e));
            r[e] = _el.val(); //$('div[modal_open_id={0}] #{1}'.format(modal_open_id, e)).val();
        });
        return r
    },
    setupENTEREverywhere: function () {
        var me = this;

        $('input:first').focus();

        $('input').bind("keyup", function (e) {
            var n = $("input:text").length;
            if (e.which == 13) {

                if ($(this).attr('data-is-combo') && $(this).val().trim().length <= 0) return;
                if ($(this).attr('data-is-autocomplete')) return;

                if ($(this).attr('id') != 'search') {
                    var regexStr = $(this).attr('data-regex');
                    if (regexStr)
                        if (!(new RegExp(regexStr).test($(this).val()))) {
                            me._mostrarCampoConError($(this));
                            e.preventDefault();
                            return false;
                        }
                }

                e.preventDefault();
                var nextIndex = $('input').index(this) + 1;
                if (nextIndex < n + 1) {

                    if ($($('input')[nextIndex]).attr('readonly')) {
                        $('input')[nextIndex + 1].focus();
                    }
                    else {
                        $('input')[nextIndex].focus();
                    }
                }
                else {
                    $('input')[nextIndex].blur();
                }
            }
        });
    },

    mostrarCampoConError: function (selector) {
        var ejemplo = $(selector).attr('data-validacion');

        if (ejemplo) { ejemplo = 'Ejemplo: ' + ejemplo } else ejemplo = '';

        var fieldErrorPopover = $(selector).popover({
            html: true,
            container: selector.parent(),
            title: 'Valor Incorrecto',
            content: '<span style="color:red" class="fa fa-exclamation-triangle">&nbsp</span>Esta campo no esta cargado correctamente. <b class="fw6">{0}</b>'.format(ejemplo),
            delay: { "show": 500, "hide": 100 },
            placement: 'bottom',
            trigger: 'manual'
        });

        fieldErrorPopover.popover('show');
        $(selector).focus();
        setTimeout(function () {
            fieldErrorPopover.popover('hide');
        }, 2000);
        console.log('Campo requerido: ' + $(selector).attr('Id'));
    },

    _clearFieldsOnExit: function (selector) {
        selector.on('hidden.bs.modal', function (e) {
            $(this)
              .find("input,textarea,select")
                 .val('')
                 .end()
              .find("input[type=checkbox], input[type=radio]")
                 .prop("checked", "")
                 .end();
        })
    },
    _capitalizeElements: function (sel) {

        sel.find('input[id], select[id]').each(function (e) {
            $(this).attr('id', $(this).attr('id').toUpperCase());
        });
        sel.find('[data-is-combo]').each(function (e) {
            $(this).attr('data-key-item', $(this).attr('data-key-item').toUpperCase());
            $(this).attr('data-display-item', $(this).attr('data-display-item').toUpperCase());
        });
        sel.find('[data-is-autocomplete]').each(function (e) {
            $(this).attr('data-display-item', $(this).attr('data-display-item').toUpperCase());
            $(this).attr('data-value-item', $(this).attr('data-value-item').toUpperCase());
            $(this).attr('data-id-item', $(this).attr('data-id-item').toUpperCase());
            $(this).attr('data-name-item', $(this).attr('data-name-item').toUpperCase());
            $(this).attr('data-filters', $(this).attr('data-filters').toUpperCase());
        });
    },

    createSelectedFiltersPreview: function (elementId, sender, commited) {

        var cnt = $('.{0} #{1} .selectedFiltersPreview'.format(sender._nombrePantalla, elementId));
        if (!cnt) cnt = $('#{0} #{1} .selectedFiltersPreview'.format(sender._nombrePantalla, elementId));
        cnt.html('');
        for (var f = 0; f < sender._camposFiltros().length; f++) {
            var sel = $('#{0}'.format(sender._camposFiltros()[f]));
            var label = $(".filter-container label[for='" + sel.attr("id") + "']");
            var isCombo = sel.attr('data-is-combo');
            var isChk = sel.attr('type') == 'checkbox';
            var isAutoComplete = sel.attr('data-is-autocomplete');
            var isHidden = sel.attr('type') == 'hidden';
            var value = null;
            var title = '';
            if (isCombo || isAutoComplete) {
                value = sel.attr('data-codigo-id');
                title = sel.val();
            }
            else if (isChk) {
                value = sel.get(0).checked;
                title = value.toString();
            }
            else {
                value = sel.val();
                title = sel.val();
            }

            if (!isHidden && (value == true || value > 0 || (value && value.length > 0))) {
                var xClose = $("<i class='filter-preview pointer'> x</i>")
                var badge = $("<span class='badge fill-secondary fw5 mg0R' title='{2}' data-linked-to='{1}'>{0}</span>".format(label.text(), sel.attr('id'), title));

                badge.append(xClose);
                xClose.on('click', function () {
                    var linkedTo = $(this).parent().attr('data-linked-to');
                    var ctlRel = $('#{0} #{1}'.format(elementId, linkedTo));
                    ctlRel.val(null);
                    if (ctlRel.attr('data-is-combo') || ctlRel.attr('data-is-autocomplete'))
                        ctlRel.attr('data-codigo-id', null);
                    else if (ctlRel.attr('data-is-date'))
                        ctlRel.data("DateTimePicker").date(null);
                    else if (ctlRel.attr('type') == 'checkbox')
                        ctlRel.removeAttr('checked');

                    if (linkedTo == sender._camposFiltros()[0])
                        $('#input_filtro_primario').val('');

                    $(this).parent().remove();
                    if (typeof (commited) == 'function')
                        commited.apply(sender);
                });
                cnt.append(badge);
            }

        }

    },

    formatNumberToMask: function (popup) {
        var n = popup.find('input[type=number]');
        n.each(function (e) {
            $(this).maskNumber();
        });
    },

    closePopUp: function (id) {
        var m = $('[modal_open_id={0}]'.format(id));
        if (m.length == 0)
            m = $('#{0}'.format(id))

        m.modal('hide');
    },
    _formularios: {}
}