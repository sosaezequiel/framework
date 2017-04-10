var AppContext = (function () {
    
    return {
        MAE_APP_NAME: null,
        WEB_URL_NAME: null,
        SECURITY_TOKEN_ID: null,
        CURRENT_USER_NAME: null,
        CURRENT_SYS_DATE: null,
        CURRENT_SYS_DATE_FORMAT: null,
        PUBLIC_SYS_DATE_FORMAT: null,
        ServicesURL: null,
        QueryServices: null,
        CommandServices: null,
        Combos: null,
        Permisos: null,
        ThumbnailPantallas: null,
        ClickedButton: null,
        ABM: null,
        Menu: null,
        UsarCombosCaheados: false,
        initialize: function () {
            var me = this;
            defaultPageSize = 20;
            WebURL = window.URL_BASE;

            $.ajax({
                type: "POST",
                url: 'Main/GetAppContext',
                contentType: "application/json",
                dataType: "json"
            }).done(function (data) {
                
                me.MAE_APP_NAME = data.MaeAppName;
                me.WEB_URL_NAME = data.WebUrlName;
                me.SECURITY_TOKEN_ID = data.SecurityTokenId
                me.CURRENT_USER_NAME = data.UserName;
                me.CURRENT_SYS_DATE = data.FechaDelSistema;
                me.CURRENT_SYS_DATE_FORMAT = data.FormatoFechaCorta;
                me.PUBLIC_SYS_DATE_FORMAT = data.FormatoPublicoFechaCorta;
                me.ServicesURL = data.ServicesUrlName; //se asigna toda laconf pq se puede especificar un servidor distinto 
                me.QueryServices = me.ServicesURL + "Query/QueryService.svc/executeQuery";
                me.CommandServices = me.ServicesURL + "Command/CommandService.svc/ExecuteCommand";

                /*
                    // si lo necesitan en un futuro, recordar traer estos datos del server
                    me.EstadoSistema = _.fromPairs(_.map(data.EstadoSistema, function (x) { return [x.Key, x.Value] }));
                    me.UserSession = data.UserSession;

                */
                me.getCombosDataSources();
                me.Permisos = data.Permisos;
                me.ThumbnailPantallas = {};
                me.get_ThumbsPantalla();

                ParseNullDate = kendo.parseDate;
                kendo.parseDate = function (value, formats, culture) {
                    var r = ParseNullDate(value, formats, culture);
                    return r || '';
                }

                $('#spnFechaSistema').html('<i class="fa fa-clock-o"></i> {0}'.format(data.FechaDelSistema));

                me.baseProperties = _.keys(window);

            }).fail(function (err) {
                Query.failure(err);
            });

            $(document).on('click', function (ev) { $('.tooltip').tooltip('hide'); });

            var nc = $('#main').niceScroll({ cursorcolor: "#00b3c5", cursorwidth: 8, autohidemode: false, horizrailenabled: false, cursorborderradius: "1px", railoffset: true, railpadding: { top: 0, right: -15, left: 0, bottom: 0 } });

            $(window).resize(function () {
                $('#main').height($(window).height());
            })

        },
        get_showLoading: function () {
            return showLoading;
        },
        get_WebURL: function () {
            return WebURL;
        },
        get_CRUDServices: function () {
            return CRUDServices;
        },
        getCombosDataSources: function () {
            var me = this;
            Query.execCombosUI(me.QueryServices, 'QRY_SCRN_COMBOS_FILTERS_BUNDLE', {}, {}, function (dataset) {
                var keys = _.remove(dataset[0]);
                delete dataset['0'];
                var arr = _.values(dataset);
                var obj = {};
                _.zipWith(keys, arr, function (k, a) {
                    obj[k.NombreCampo] = a;
                });
                me.Combos = obj;
            });
        },
        get_ThumbsPantalla: function () {
            var me = this;
            var r = null;
            var col = null;
            AppContext.ThumbnailPantallas = (localStorage[AppContext.CURRENT_USER_NAME]) ? JSON.parse(localStorage[AppContext.CURRENT_USER_NAME]) : {};
            var keys = _.keys(AppContext.ThumbnailPantallas);
            var k = 0;
            for (var i = keys.length - 1; i >= 0 ; i--) {
                if (k >= 4) {
                    delete AppContext.ThumbnailPantallas[keys[i]]
                    localStorage[AppContext.CURRENT_USER_NAME] = JSON.stringify(AppContext.ThumbnailPantallas);
                }
                else {
                    var v = AppContext.ThumbnailPantallas[keys[i]];
                    if (k % 2 == 0)
                        r = $(".dashboard .row");
                    var col = $("<div class='col-md-6'>");
                    var thumb = $("<div class='thumbnail mg2R pad2x pad2y'>");
                    var img = $("<img id='" + keys[i] + "' src='" + v + "' class='pointer' data-ref='" + keys[i] + "' >");
                    var btnRem = $('<a href="#" data-key="' + keys[i] + '" class="thumb-delete cl-dark pointer" title="Desanclar pantalla" role="button"><i class="fa fa-trash"></i></a>');

                    img.on('click', function (ev) {
                        var menuItem = $(this).attr('data-ref');
                        $("#menuClearTop").find("a[data-page-name={0}]".format(menuItem)).trigger('click');
                    });

                    btnRem.on('click', function (ev) {
                        var key = $(this).attr('data-key');
                        delete AppContext.ThumbnailPantallas[key];
                        localStorage[AppContext.CURRENT_USER_NAME] = JSON.stringify(AppContext.ThumbnailPantallas);
                        $("img#{0}".format(key)).parent().remove();
                    });

                    thumb.append(img);
                    thumb.append(btnRem);
                    col.append(thumb);
                    r.append(col);

                    k++;

                    $("a[title]").tooltip({
                        container: "body", placement: "left", delay: 200
                    });
                }
            }
        },
        get_defaultPageSize: function () {
            return defaultPageSize;
        },
        onKendoError: function (e) {
            AreaMensajes.popupMensajeWarn("Error al recuparar datos", e.Message, "");
        }
    }
}());

/*

XMLHttpRequest.prototype.realSend = XMLHttpRequest.prototype.send;
//here "this" points to the XMLHttpRequest Object.
var xmlRequestSend = function (vData) {
    this.setRequestHeader("SessionId", "");
    this.realSend(vData);
};
XMLHttpRequest.prototype.send = xmlRequestSend;

*/