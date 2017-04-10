var ClearMenu = window.ClearMenu || function (_parent, _id) {
    var objMenu = null;
    /* menu Options */
    var toggle = $("<span class='fa-stack fa-lg'><i class='fa fa-circle-thin fa-stack-2x'></i><i class='fa fa-angle-double-left fa-stack-1x'></i></span>");
    var mOptions = {
        id: _id || "menuClear",
        className: "sidebar sidebar-menu-collapsed",
        customClass: "fill-primary",
        width: "160",
        parent: _parent,
        items: { top: [], foot: [] },
        adjacenteElement: "main",
        title: "",
        withBreadCrumb: false,
        toggleAction: $("<a id='toggle-menu-action' title='Mostrar/Ocultar'>").addClass("sidebar-toggle collapsed collapsed-element").append(toggle)
    }

    /* item Options */
    var iOptions = {
        id: "menuItem",
        title: "",
        url: "#",
        liClass: "",
        aClass: "",
        spnClass: "",
        iconClass: "fa fa-home",
        addOnTop: true
    };

    /* subitem Options */
    var sOptions = {};
    return {
        breadCrumbs: [],

        create: function (_options) {
            var self = this;
            var opt = $.extend(mOptions, _options);

            this.items = opt.items.top;

            if (!opt.parent) console.log("Parent inexistente. Debes proporcionar un id de elemento existente");

            self.objMenu = $("<nav>").attr("id", opt.id).addClass(opt.className + " " + opt.customClass).prepend(opt.toggleAction);
            var title = $("<div class='apptitle'><img src='App_Themes/PMGeneral/Images/PatronHome.png' alt=" + opt.title + "/>");
            self.objMenu.prepend(title);

            var ulTop = $("<ul>").attr("id", opt.id + "Top");
            var ulFoot = $("<ul>").attr("id", opt.id + "Foot");
            self.objMenu.append(ulTop);
            self.objMenu.append(ulFoot);
            _.map(opt.items.top, function (v) {
                var subItems = [];
                if (v.hasOwnProperty('items'))
                    subItems = v.items;

                self.addParentItem({
                    id: v.id,
                    title: v.title,
                    url: v.url,
                    iconClass: v.icon,
                    addOnTop: true,
                    subItems: subItems,
                    withBreadCrumb: opt.withBreadCrumb
                });
            });

            _.map(opt.items.foot, function (v) {
                var subItems = [];
                if (v.hasOwnProperty('items'))
                    subItems = v.items;

                self.addBottomItem({
                    id: v.id,
                    title: v.title,
                    url: v.url,
                    iconClass: v.icon,
                    addOnTop: false,
                    subItems: subItems
                });
            });

            $("#" + opt.parent).prepend(this.objMenu);
            self.render(opt);

            $(window).on('resize', function () {
                return resizeWindow(null, 'menuClearTop', 'menuClearFoot', null, null);
            });
            return this;
        },

        addParentItem: function (_options) {
            var self = this;
            var opt = $.extend(iOptions, _options);
            var li = $("<li>").addClass(opt.liClass);
            var id = opt.id + Math.random().toString(36).substring(7);

            var a = $("<a>");
            if (opt.url == 'Main') {
                a.attr('href', opt.url);
                a.addClass("expandable accordion-toggle " + opt.aClass);
            } else {
                a.attr('href', '#' + id)
                a.addClass("expandable accordion-toggle " + opt.aClass);
                a.attr({ "title": opt.title, "data-toggle": "collapse", "data-parent": "#" + self.objMenu.attr("id") + "Top" });

                a.on("click", function () {
                    $("div.list-group-submenu").removeClass("in").addClass("collapse");
                    if (opt.withBreadCrumb) {
                        self.breadCrumbs = [];
                        self.breadCrumbs.push($(this).text());
                        $(".breadcrumb-items").html("/" + self.breadCrumbs.join("/"));
                    }
                });
            }
            var i = $("<i>").addClass("collapsed-element " + opt.iconClass);
            var sIcon = $("<span>").addClass("collapsed-element " + opt.spnClass);
            sIcon.append(i);
            var sText = $("<span>").addClass("expanded-element" + opt.spnClass).html(opt.title);
            a.prepend(sIcon);
            a.append(sText);
            li.append(a);

            if (opt.hasOwnProperty("subItems"))
                self.addItem(li, id, opt.subItems, opt.withBreadCrumb);

            if (opt.addOnTop)
                self.objMenu.find("ul#" + self.objMenu.attr("id") + "Top").append(li).addClass(opt.liClass);
            else
                self.objMenu.find("ul#" + self.objMenu.attr("id") + "Foot").addClass("foot-links fill-primary brd-top brd-secondary").append(li).addClass(opt.liClass);

        },
        addBottomItem: function (_options) {
            var self = this;
            var opt = $.extend(iOptions, _options);
            var li = $("<li>").addClass(opt.liClass);
            var id = opt.id + Math.random().toString(36).substring(7);
            var a = $("<a>").addClass("expandable" + opt.aClass).attr({ "title": opt.title });
            a.attr("href", URL_BASE + opt.url);

            var i = $("<i>").addClass("collapsed-element " + opt.iconClass);
            var sIcon = $("<span>").addClass("collapsed-element " + opt.spnClass);
            sIcon.append(i);
            var sText = $("<span>").addClass("expanded-element" + opt.spnClass).html(opt.title);
            a.prepend(sIcon);
            a.append(sText);
            li.append(a);

            a.on("click", function (ev) {
                window.location = URL_BASE + opt.url;
            });

            if (opt.hasOwnProperty("subItems"))
                self.addItem(li, id, opt.subItems, opt.withBreadCrumb);

            self.objMenu.find("ul#" + self.objMenu.attr("id") + "Foot").addClass("foot-links fill-primary brd-top brd-secondary").append(li).addClass(opt.liClass);

        },
        addItem: function (el, idParent, subItems, withBradCrumb) {
            var self = this;
            var cnt = $("<div>").addClass("collapse list-group-submenu list-group-submenu-hover").attr({ "id": idParent, "data-parent": "#" + self.objMenu.attr("id") + "Top" });
            
            _.map(subItems, function (v) {
                var innerDiv = $("<div>");
                var a = $("<a>");
                var isSwitch = v.value == "SWITCH";
                if (v.isSilverlight)
                    if (isSwitch) {
                        var username = _.find(v.parameters, function (o) { return o.Name == 'userName'; });
                        a.attr("href", URL_BASE + "Account/Switch?userName=" + username.Value);
                    } else
                        a.attr("href", URL_BASE + "Pages/MainPageWithoutMenu.aspx?control=" + v.value);
                else {
                    var urlSite = (v.hasOwnProperty("site")) ? (v.urlremote != null && v.urlremote.indexOf("ttp") > 0 ? v.urlremote + v.site + "/" : URL_BASE.replace(WEB_URL_NAME, v.site)) : URL_BASE;
                    a.attr("href", urlSite + "Pantalla/Render?nombrePantalla=" + v.url + "&permiso=" + v.permissionPermitted);
                }

                a.addClass("expandable clearfix list-group-item" + v.aClass).attr({ "name": v.name, "title": v.title, "data-parent": "#" + self.objMenu.attr("id") + "Top" });
                a.attr('data-permission', v.permissionPermitted);
                a.attr('data-page-name', v.url);

                var i = $("<i>").addClass("collapsed-element fa fa-angle-right");
                var sIcon = $("<span>").addClass("collapsed-element");
                sIcon.append(i);
                var sText = $("<span>").addClass("expanded-element ").html(v.title);
                a.prepend(sIcon);
                a.append(sText);
                innerDiv.append(a);
                cnt.append(innerDiv);

                if (v.hasOwnProperty("items") && v.items.length > 0) {
                    var id = Math.random().toString(36).substring(7);
                    a.attr("href", "#" + id);
                    a.addClass("expandable accordion-toggle ");
                    cnt.removeClass('list-group-submenu-hover');
                    a.attr({ "title": v.title, "data-toggle": "collapse", "data-parent": "#" + self.objMenu.attr("id") + "Top" });
                    self.addItem(innerDiv, id, v.items, withBradCrumb);
                }
                else {
                    a.on("click", function (ev) {
                        ev.preventDefault();
                        self.ejecutarAccion($(this).attr("href"), withBradCrumb, v, ev, isSwitch);
                    });
                }

            });

            el.append(cnt);
        },

        render: function (opt) {

            function expandMyMenu() {
                $(".sidebar-toggle").removeClass("collapsed").addClass("expanded");
                $("." + opt.adjacenteElement).removeClass("main-collapsed").addClass("main-expanded");
                $("#toggle-menu-action span i:last()").removeClass("fa-angle-double-right").addClass("fa-angle-double-left")
                return $("#" + opt.id).removeClass("sidebar-menu-collapsed").addClass("sidebar-menu-expanded");
            };

            function collapseMyMenu() {
                $(".sidebar-toggle").removeClass("expanded").addClass("collapsed");
                $("." + opt.adjacenteElement).removeClass("main-expanded").addClass("main-collapsed");
                $("#toggle-menu-action span i:last()").removeClass("fa-angle-double-left").addClass("fa-angle-double-right")
                return $("#" + opt.id).removeClass("sidebar-menu-expanded").addClass("sidebar-menu-collapsed");
            };

            function showMenuTexts() {
                return $("#" + opt.id + " ul a span.expanded-element, .apptitle").show();
            };

            function hideMenuTexts() {
                return $("#" + opt.id + " ul a span.expanded-element, .apptitle").hide();
            };

            showMenuTexts();
            expandMyMenu();

            $("nav#" + opt.id + " a[title]").tooltip({ container: "body", placement: "right", delay: 200 });
            $("ul#" + opt.id + "Top").css("height", "auto"); //TODO: Calcular alto...
            var nice = $("ul#" + opt.id + "Top").niceScroll({ cursorcolor: "#013b52", cursorwidth: 8, autohidemode: false, cursorborderradius: "1px" });
            
            return $("#toggle-menu-action").click(function (e) {
                if ($("#" + opt.id).hasClass("sidebar-menu-collapsed")) {
                    expandMyMenu();
                    showMenuTexts();
                    $(this).css({
                        color: "#fff"
                    });
                } else if ($("#" + opt.id).hasClass("sidebar-menu-expanded")) {
                    collapseMyMenu();
                    hideMenuTexts();
                    $(this).css({
                        color: "#FFF"
                    });
                }
                $(".k-grid").data("kendoGrid").resize(); //TODO: cada vez que se redimensiona programaticamente el layout, hay que hacer resize de las grillas
            });

            $('#menuClearTop').height($("#menuClearFoot").offset().top - $(".apptitle").height());

        },

        ejecutarAccion: function (url, withBradCrumb, v, ev, isSwitch) {
            var self = this;
            var htmlHeight = $("html").height();
            var bcHeader = $(".breadcrumb").parent().height();
            var iframeHeight = htmlHeight - bcHeader;

            var _baseProps = _.keys(window);
            _.each(_baseProps, function (k) {
                var exist = AppContext.baseProperties.indexOf(k);
                if (exist < 0)
                    delete window[k];
            });

            // dispara el save de pantalla
            $('#BodyContent').trigger('contentBeforeChanged');

            if (withBradCrumb) {
                if (self.breadCrumbs.length > 0)
                    self.breadCrumbs.pop();

                var bc = $('<a>').attr('href', url).text($(ev.currentTarget).find('span.expanded-element').text());

                bc.on('click', function (ev) {
                    ev.preventDefault();
                    self.ejecutarAccion($(this).attr("href"), false, ev);
                });

                self.breadCrumbs.push(bc);
                $(".breadcrumb-items").html('');
                $.each(self.breadCrumbs, function (e) {
                    $(".breadcrumb-items").append("/").append(self.breadCrumbs[e]);
                })

            }

            if (isSwitch || v.url == 'Main')
                window.location.href = url;
            else if (v.isSilverlight) {
                var arguments = self.getSilverlightMenuParameters(v.parameters);
                var iframe = $("<iframe>");

                iframe.attr('src', url + "&menuData=" + arguments).css({ 'visibility': 'visible', 'width': '100%', 'height': iframeHeight + 'px' }).attr('height', iframeHeight);

                iframe.parent().css('height', iframeHeight + 'px');

                $("#BodyContent").html('').css('height', iframeHeight + 'px');
                $("#BodyContent").hide().append(iframe).slideToggle();
                $($('#BodyContent iframe').contents()).find("#regionContent_pnlContent").height(iframeHeight - 20);
            } else {
                $.post(url, 'sessionId=' + AppContext.SECURITY_TOKEN_ID, function (r) {
                    $("#BodyContent").hide().html(r).fadeIn();
                });
            }
        },

        loadContent: function (url) {
            $.post(url,'sessionId='+AppContext.SECURITY_TOKEN_ID, function (r) {
                $("#BodyContent").hide().html(r).fadeIn();
            });
        },

        getSilverlightMenuParameters: function (p) {

            var str = "";
            for (var i = 0; i < p.length; i++) {
                var prm = p[i];
                str += "prm_";
                str += prm.Name;
                str += ":";
                str += prm.Value;
                str += ";";
            }

            return str;
        },
        items: []

    }

};