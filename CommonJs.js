var CommonJs = (function() {
    /************************* VARIABLES Y FUNCIONES PRIVADAS ********************************************/

    return {
        initialize: function() {
            defaultPageSize = 20;
            WebURL = window.URL_BASE;
            ServicesURL = AppContext.ServicesURL;
            //ServicesURL = "http://fmosca/pm_server/";// window.URL_BASE.replace("WebSiteClear_v_500", "WebServices_v_500");
            QueryServices = ServicesURL + "Query/QueryService.svc/executeQuery";
            CommandServices = ServicesURL + "Command/CommandService.svc/ExecuteCommand";
            RestServices = ServicesURL + "BusinessRest/";
            this.getCombosDataSources();
            window.ThumbnailPantallas = {};
            this.get_ThumbsPantalla();
            ParseNullDate = kendo.parseDate;
            kendo.parseDate = function (value, formats, culture) {
                var r = ParseNullDate(value, formats, culture);
                return r || '';
            }
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
            Query.execCombosUI(QueryServices, 'QRY_SCRN_COMBOS_FILTERS_BUNDLE', {}, function (dataset) {
                var keys = _.remove(dataset[0]);
                delete dataset['0'];
                var arr = _.values(dataset);
                var obj = {};
                _.zipWith(keys, arr, function (k, a) {
                    obj[k.NombreCampo] = a;
                });
                window['COMBOS_{0}'.format(MAE_APP_NAME)] = obj;
            });
        },
        get_ThumbsPantalla: function () {
            var me = this;
            var r = null;
            var col = null;
            window.ThumbnailPantallas = (localStorage[CURRENT_USER_NAME]) ? JSON.parse(localStorage[CURRENT_USER_NAME]) : {};
            var keys = _.keys(window.ThumbnailPantallas);
            var k = 0;
            for (var i = keys.length - 1; i >= 0 ; i--) {
                if (k >= 4) {
                    delete window.ThumbnailPantallas[keys[i]]
                    localStorage[CURRENT_USER_NAME] = JSON.stringify(window.ThumbnailPantallas);
                }
                else {
                    var v = window.ThumbnailPantallas[keys[i]];
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
                        delete window.ThumbnailPantallas[key];
                        localStorage[CURRENT_USER_NAME] = JSON.stringify(window.ThumbnailPantallas);
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