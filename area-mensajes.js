var AreaMensajes = {
    popupMensajeErrorTecnico: function (titulo, detalle) {
        var c = $('#popup-error-tecnico').clone();
        c.attr('id', '__auto{0}'.format(Math.random));
        $('body').append(c);
        c.find('.modal-dialog .modal-content .modal-header .modal-title').text(titulo);
        c.find('.modal-dialog .modal-content .modal-body .aqui').text(detalle);
        c.modal({ backdrop: true, focus: true, show: true });
        c.on('hidden.bs.modal', function () {
            c.remove();
        });
    },
    popupMensajeErrorFuncional: function (titulo, detalle) {
        var c = $('#popup-error-funcional').clone();
        c.attr('id', '__auto{0}'.format(Math.random));
        $('body').append(c);
        c.find('.modal-dialog .modal-content .modal-header .modal-title').text(titulo);
        c.find('.modal-dialog .modal-content .modal-body .aqui').html(detalle.replaceAll(/\|\|/gi, "<br>"));
        c.modal({ backdrop: true, focus: true, show: true });
        c.on('hidden.bs.modal', function () {
            c.remove();
        });
    },
    popupMensajeOK: function (titulo, detalle, cls, onClose) {
        var c = $('#popup-ok').clone();
        c.attr('id', '__auto{0}'.format(Math.random));
        $('body').append(c);
        c.find('.modal-dialog .modal-content .modal-header .modal-title').text(titulo);
        c.find('.modal-dialog .modal-content .modal-body .aqui').html(detalle.replaceAll(/\|\|/gi, "<br>"));
        if (cls) {
            c.find('.modal-dialog .modal-content .modal-body .aqui').parent().addClass(cls);
        }
        c.modal({ backdrop: true, focus: true, show: true });
        c.on('hidden.bs.modal', function () {
            c.remove();
            if (typeof (onClose) == 'function')
                onClose.apply();
        });
    },
    popupMensajeWarn: function (titulo, detalle, cls) {
        var c = $('#popup-warn').clone();
        c.attr('id', '__auto{0}'.format(Math.random));
        $('body').append(c);
        c.find('.modal-dialog .modal-content .modal-header .modal-title').text(titulo);
        c.find('.modal-dialog .modal-content .modal-body .aqui').html(detalle.replaceAll(/\|\|/gi, "<br>"));
        if (cls) {
            c.find('.modal-dialog .modal-content .modal-body .aqui').parent().addClass(cls);
        }
        c.modal({ backdrop: true, focus: true, show: true });
        c.on('hidden.bs.modal', function () {
            c.remove();
        });
    },
    popupMensajeAccionEnProgreso: function (delay) {
        var c = $('#popup-accion-en-progreso').clone();
        c.attr('id', '__auto{0}'.format(Math.random));
        $('body').append(c);
        c.on('hidden.bs.modal', function () {
            c.remove();
        });

        var delayTimeout = setTimeout(function (c) {
            c.modal({ backdrop: false, focus: true, show: true });
            //c.modal('toggle');
            var n = delay / 1000;
            setInterval(function (c) {
                c.find('.modal-dialog .modal-content .modal-body .temporizador').text(String(n++));
            }, 1000, c);
        }, delay, c);

        var r = function (c) {
            return {
                cancelar: function () {
                    window.clearTimeout(delayTimeout);
                    c.modal('hide');
                    c.remove();
                }
            }
        };

        return r(c);

    },
    popupMensajeInforma: function (titulo, detalle, cls) {
        var c = $('#popup-informa').clone();
        c.attr('id', '__auto{0}'.format(Math.random));
        $('body').append(c);
        c.find('.modal-dialog .modal-content .modal-header .modal-title').html(titulo);
        c.find('.modal-dialog .modal-content .modal-body .aqui').html(detalle.replaceAll(/\|\|/gi, "<br>"));
        if (cls) {
            c.find('.modal-dialog').addClass(cls);
        }
        c.modal({ backdrop: true, focus: true, show: true });
        c.on('hidden.bs.modal', function () {
            c.remove();
        });
        return c;
    },
    popupMensajeProgeso: function (detalle, cls, onClose) {
        var c = $('#popup-progreso').clone();
        c.attr('id', '__auto{0}'.format(Math.random));
        $('body').append(c);
        c.find('.modal-dialog .modal-content .modal-body .aqui').html(detalle.replaceAll(/\|\|/gi, "<br>"));
        if (cls) {
            c.find('.modal-dialog .modal-content .modal-body .aqui').parent().addClass(cls);
        }
        c.modal({ backdrop: true, focus: true, show: true });
        c.on('hidden.bs.modal', function () {
            c.remove();
            if (typeof (onClose) == 'function')
                onClose.apply();
        });
        return c;
    },
    popupMensajeErrorFuncionalValidacionCampos: function (completaTitulo) {
        this.popupMensajeErrorFuncional('Validación datos en {0}'.format(completaTitulo), 'Algunos campos no tienen el formato o el valor adecuado para la carga. Corrija y vuelva a <kbd>ACEPTAR</kbd>');
    },
    toastSuccess: function (msg) {
        toastr.success(msg, '', this._toastConfigSuccess);
    },
    toastInfo: function (msg) {
        toastr.info(msg, '', this._toastConfigInfo);
    },
    toastWarning: function (msg) {
        toastr.warning(msg, '', this._toastConfigInfo);
    },
    _toastConfigInfo: {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    },
    _toastConfigSuccess: {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    },

}

