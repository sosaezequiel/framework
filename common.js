
String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.camelize = function () {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
}

function async(fn) {
    return setTimeout(fn, 0);
}

function ensurePrecondition(o) {
    if (o == null || o === 'undefined') {
        //var msg = "not ensured precondition";
        //uxCommon.raiseInternalError(Messages.translate('MSG_NOT_ENSURED_PRECONDITION'));
    }
}

function defer(f) {
    setTimeout(f, 200);
}
function deferT(f, t) {
    setTimeout(f, t);
}

function forEach(o, itemDelegate, scope) {

    if (o == null || o === 'undefined') return;

    if (isArray(o)) {
        for (i = 0; i < o.length; i++) {
            itemDelegate(o[i], i, o, scope);
        }
    }
    else {

        for (var e in o) {
            itemDelegate(o[e], e, o, scope);
        }

    }
}

function _showLoading($btn) {

    if ($btn) {
        $btn.attr('disabled', true);
        var i = $btn.find('i').attr("class");
        if (i) {
            $btn.attr('old-class', i);
            $btn.find('i').removeClass(i);
            $btn.find('i').addClass('fa fa-refresh fa-spin fs12 fa-fw');
        } else {
            $btn.append(' <i class="fa fa-refresh fa-spin fs12 fa-fw">')
        }
    }
}

function _hideLoading($btn) {

    if ($btn) {
        if (!$btn.attr('disable-by-rule'))
            $btn.removeAttr('disabled');

        var i = $btn.attr("old-class");
        if (i) {
            $btn.find('i').removeClass('fa fa-refresh fa-spin fs12 fa-fw');
            $btn.find('i').addClass("fa " + i);
        } else {
            $btn.find('i').remove();
        }
    }
}

function ajax_download(url, data, cmdName) {
    var $iframe,
        iframe_doc,
        iframe_html;

    if (($iframe = $('#download_iframe')).length === 0) {
        $iframe = $("<iframe id='download_iframe'" +
                    " style='display: none' src='about:blank'></iframe>"
                   ).appendTo("body");
    }

    iframe_doc = $iframe[0].contentWindow || $iframe[0].contentDocument;
    if (iframe_doc.document) {
        iframe_doc = iframe_doc.document;
    }

    iframe_html = "<html><head></head><body><form method='POST' action='" +
                  url + "'>"

    var cmdContract = Command.createCommandContract(cmdName);
    _.extend(data, cmdContract);

    Object.keys(data).forEach(function (key) {
        iframe_html += "<input type='hidden' name='" + key + "' value='" + data[key] + "'>";
    });

    iframe_html += "</form></body></html>";

    iframe_doc.open();
    iframe_doc.write(iframe_html);
    $(iframe_doc).find('form').submit();
}

// backward compatibility
// or else: Array.isArray
// Ref: http://stackoverflow.com/questions/6844981/distinguish-between-array-and-hash-in-javascript-with-typeof
function isArray(a) {
    return Object.prototype.toString.apply(a) === '[object Array]';
}

function formatKeyValueArrayIntoHash(arrayOfKeyValuePairs) {
    var r = {};

    for (var i = 0; i < arrayOfKeyValuePairs.length; i++) {
        r[arrayOfKeyValuePairs[i].key] = arrayOfKeyValuePairs[i].value;
    }

    return r;
}

/*
 * String format
 */
String.prototype.format = function () {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};


String.prototype.replaceAll = function (re, replacement) {
    var target = this;
    return target.replace(new RegExp(re), replacement);
};

/*
 * String trim
 */
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

/*
 * String empty
 */
String.prototype.empty = function () {
    return this.length == 0;
};

/*
 * Starts with
 */
String.prototype.startsWith = function (data) {
    return this.substring(0, data.length) === data;
};

/*
 * Array first
 */
if (!Array.prototype.first) {
    Array.prototype.first = function () {
        return this[0] || this /* in case is not an Array */;
    }
}

/*
 * Array last
 */
if (!Array.prototype.last) {
    Array.prototype.last = function () {
        return this[this.length - 1];
    };
}

/*
 * Array empty
 */
if (!Array.prototype.empty) {
    Array.prototype.empty = function () {
        return this.length == 0;
    };
}

function ERROR_TECNICO() {
    window.location.href = 'ErrorTecnicoEnAplicacionNavegador.html';
}

$.fn.IsEnabled = function (e) {
    if (e == undefined)
        return !this.is(":disabled");
    else if (e == false) {
        this.attr("disabled", true);
        this.next('input[data-mask]').attr("disabled", true);
    }
    else {
        this.removeAttr("disabled");
        this.next('input[data-mask]').removeAttr("disabled");
    }
};


$.fn.IsReadOnly = function (e) {
    if (e == undefined)
        return this.attr("readonly") == 'readonly';
    else if (e == true || e == 'readonly')
        this.attr("readonly", "readonly");
    else
        this.removeAttr("readonly");
};

(function ($) {
    $.fn.drags = function (opt) {

        opt = $.extend({
            handle: "",
            cursor: "move"
        }, opt);

        var $selected = this;
        var $elements = (opt.handle === "") ? this : this.find(opt.handle);

        $elements.css('cursor', opt.cursor).on("mousedown", function (e) {
            var pos_y = $selected.offset().top - e.pageY,
              pos_x = $selected.offset().left - e.pageX,
               width = $selected.width();
            $(document).on("mousemove", function (e) {
                $selected.offset({
                    top: e.pageY + pos_y,
                    left: e.pageX + pos_x,
                }).css({ 'overflow': 'hidden', 'width': width });
            }).on("mouseup", function () {
                $(this).off("mousemove"); // Unbind events from document                
            });
            e.preventDefault(); // disable selection
        });

        return this;

    };
})(jQuery);

(function ($) {
    $.fn.setVal = function (v) {
        $(this).val(v);
        $(this).trigger("data:change");
    };
})(jQuery);

(function ($) {
    $.fn.maskNumber = function (opt) {

        opt = $.extend({
            milesSep: ",",
            decimalSep: "."
        }, opt);

        var $selected = this;
        var $maskElement = this.parent().find('input[data-mask]');
        if ($maskElement)
            $maskElement.remove();

        $maskElement = createMaskElement($selected);

        $selected.on("data:change", function (event) {
            event.preventDefault();
            $maskElement.val(numeral($(this).val()).format(opt.format));
        });

        $selected.change(function (e) {
            $selected.trigger("data:change");
            //$(this).off('change');
        });

        function createMaskElement(c) {
            var styles = "position: {0}; margin-left:{1}; margin-top:{2}; padding: {3}; line-height:{4}; height:{5}; float:left; border:0px !important; background:transparent; color; #2f4f4f !important; width: 100%".format('relative', '1px', '-' + c.css('height'), c.css('padding'), c.height() + 2 + 'px', c.css('height'));
            var $maskElement = $('<input type="text" data-mask style="{0}" value="{1}" class="form-control input-sm"/>'.format(styles, ''));

            c.css({ 'color': 'transparent' });
            c.parent().append($maskElement);
            c.on('focus', function () {
                $maskElement.focus();
            })

            var step = (c.attr('step')) ? c.attr('step').split('.') : null;
            if (step)
                opt.format = '0{0}0{1}'.format(opt.milesSep, opt.decimalSep) + step[1];
            else
                opt.format = '0{0}0'.format(opt.milesSep)

            if (c.val().length == 0)
                $maskElement.val('').change();
            else
                $maskElement.val(numeral(c.val()).format(opt.format)).change();

            $maskElement.IsEnabled(c.IsEnabled());
            $maskElement.IsReadOnly(c.IsReadOnly());

            $maskElement.on('keydown', function (e) {
                if ([8, 9, 13, 27, 37, 39, 46].indexOf(e.keyCode) >= 0)
                    return true;
                else {
                    if (c.attr('max') && parseInt(numeral($(this).val())._value).toString().length >= numeral(c.attr('max'))._value)
                        return false;
                }
            })
            $maskElement.on('keyup', function (e) {
                c.val(numeral($(this).val())._value);
            })

            $maskElement.on('change', function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).val(numeral(c.val()).format(opt.format));
                c.val(numeral($(this).val())._value);
                c.change();
                $(this).IsEnabled(c.IsEnabled());
            })

            $maskElement.focus(function () { $(this).select(); });

            return $maskElement;
        }

        return $maskElement;

    };
})(jQuery);


jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: false
    });
}

$(document).ajaxStart(function (xhr) {
    var btn = $(xhr.target.activeElement);
    if (btn.is(':button')) {
        AppContext.ClickedButton = btn;
        _showLoading(AppContext.ClickedButton);
    }
});

$(document).ajaxComplete(function (xhr) {
    _hideLoading(AppContext.ClickedButton);
});

$(document).ajaxError(function (xhr) {
    _hideLoading(AppContext.ClickedButton);
    AppContext.ClickedButton = null;
});

function resizeWindow(abm, menuTop, menuFoot, filterContainer, panelFoot) {
    var top = ($("#{0}".format(menuFoot)).offset()) ? $("#{0}".format(menuFoot)).offset().top : $(document).height();
    $('#{0}'.format(menuTop)).height(top - $(".apptitle").height() - 50);
    if (filterContainer && panelFoot && AppContext.ABM.columnDef) {
        var filterH = ($('.{0}:visible'.format(filterContainer)).length > 0) ? $('.{0}:visible'.format(filterContainer)).offset().top + $('.{0}:visible'.format(filterContainer)).height() : 100;
        AppContext.ABM._heightGrilla = top - ($('.{0}'.format(panelFoot)).height() + filterH);
        var grid = AppContext.ABM._getGrid();
        var next = (grid) ? grid.element.next() : null;
        if (next) AppContext.ABM._heightGrilla = AppContext.ABM._heightGrilla - next.height() * 1.25;
        if (grid) {
            grid.element.height(AppContext.ABM._heightGrilla);
            grid.resize();
        }
    }
}


function EncryptData(PlainText) {
    //var PlainText = document.getElementById('TextOriginal').value;
    //var encryptData = document.getElementById('TextEncryptedJS');

    try {
        //Creating the Vector Key
        var iv = CryptoJS.enc.Hex.parse(AppContext.SECURITY_TOKEN_ID.replaceAll(/-/gi, ""));
        //var iv = CryptoJS.enc.Utf8.parse(SECURITY_TOKEN_ID.replaceAll(/-/gi, "")); //Encoding the Password in from UTF8 to byte array
        var Pass = CryptoJS.enc.Utf8.parse(AppContext.SECURITY_TOKEN_ID);
        //Encoding the Salt in from UTF8 to byte array
        var Salt = CryptoJS.enc.Utf8.parse('mercadoabiertoelectronico');
        //Creating the key in PBKDF2 format to be used during the encryption
        var key128Bits1000Iterations = CryptoJS.PBKDF2(Pass.toString(CryptoJS.enc.Utf8), Salt, { keySize: 128 / 32, iterations: 1000 });

        //Encrypting the string contained in cipherParams using the PBKDF2 key
        var encrypted = CryptoJS.AES.encrypt(PlainText, key128Bits1000Iterations, { mode: CryptoJS.mode.CBC, iv: iv, padding: CryptoJS.pad.Pkcs7 });
        return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    }
    //Malformed UTF Data due to incorrect password
    catch (err) {
        return "";
    }
}


function RecordarCampos(arrayExcluidos, cbFinalizado)
{
    debugger;
    var me = this;
    var idPantalla = 'popup-alta';
    var dto = localStorage["{0}-{1}-{2}".format(AppContext.CURRENT_USER_NAME, idPantalla, me._nombreEntidadSingular)];
    arrayExcluidos = arrayExcluidos || [];

    if (dto) {
        var record = JSON.parse(dto);

        var which = idPantalla;
        var isforView = false;
        var next = null;

        var returnObj = {};
        _.forEach(record, function (value, key) {
            if (!$("#popup-alta #{0}".format(key)).parentsUntil('.row').is(':hidden') && !_.includes(arrayExcluidos, key))
                returnObj[key] = value;
        });

        var promiseAll = me._fillElementsFromRecordMemoria(returnObj, me, which, isforView, next);

        $.when.apply($, promiseAll).done(function () {
            setTimeout(function () {
                cbFinalizado("Carga finalizada con exito");
                Log.debug("RecordarCampos finalizo");
            }, 1000);

        });
    }
    else {
        cbFinalizado("No hay datos cargados para los campos");
        Log.debug("RecordarCampos finalizo");
    }
}

function TriggerEvent(popupId, evento, arrayControles)
{
    var me = this;
    arrayControles = arrayControles || [];

    _.forEach(arrayControles, function ( el ) {
        $("#{0} #{1}".format(popupId, el)).trigger(evento);
            
    });
    
}