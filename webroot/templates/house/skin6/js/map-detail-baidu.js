$(function(){


    $.template=function(){var rsplit=function(e,t){for(var n,r=t.exec(e),i=new Array;null!=r;)n=r.index,t.lastIndex,0!=n&&(e.substring(0,n),i.push(e.substring(0,n)),e=e.slice(n)),i.push(r[0]),e=e.slice(r[0].length),r=t.exec(e);return""==!e&&i.push(e),i},chop=function(e){return e.substr(0,e.length-1)},extend=function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])},EJS=function(e){if(e="string"==typeof e?{view:e}:e,this.set_options(e),e.precompiled)return this.template={},this.template.process=e.precompiled,void EJS.update(this.name,this);if(e.element){if("string"==typeof e.element){var t=e.element;if(e.element=document.getElementById(e.element),null==e.element)throw t+"does not exist!"}e.element.value?this.text=e.element.value:this.text=e.element.innerHTML,this.name=e.element.id,this.type="["}else if(e.url){e.url=EJS.endExt(e.url,this.extMatch),this.name=this.name?this.name:e.url;var n=e.url,r=EJS.get(this.name,this.cache);if(r)return r;if(r==EJS.INVALID_PATH)return null;try{this.text=EJS.request(n+(this.cache?"":"?"+Math.random()))}catch(e){}if(null==this.text)throw{type:"EJS",message:"There is no template at "+n}}var r=new EJS.Compiler(this.text,this.type);r.compile(e,this.name),EJS.update(this.name,this),this.template=r};return EJS.prototype={render:function(e,t){e=e||{},this._extra_helpers=t;var n=new EJS.Helpers(e,t||{});return this.template.process.call(e,e,n)},update:function(element,options){if("string"==typeof element&&(element=document.getElementById(element)),null==options)return _template=this,function(e){EJS.prototype.update.call(_template,element,e)};"string"==typeof options?(params={},params.url=options,_template=this,params.onComplete=function(request){var object=eval(request.responseText);EJS.prototype.update.call(_template,element,object)},EJS.ajax_request(params)):element.innerHTML=this.render(options)},out:function(){return this.template.out},set_options:function(e){this.type=e.type||EJS.type,this.cache=null!=e.cache?e.cache:EJS.cache,this.text=e.text||null,this.name=e.name||null,this.ext=e.ext||EJS.ext,this.extMatch=new RegExp(this.ext.replace(/\./,"."))}},EJS.endExt=function(e,t){return e?(t.lastIndex=0,e+(t.test(e)?"":this.ext)):null},EJS.Scanner=function(e,t,n){extend(this,{left_delimiter:t+"%",right_delimiter:"%"+n,double_left:t+"%%",double_right:"%%"+n,left_equal:t+"%=",left_comment:t+"%#"}),this.SplitRegexp="["==t?/(\[%%)|(%%\])|(\[%=)|(\[%#)|(\[%)|(%\]\n)|(%\])|(\n)/:new RegExp("("+this.double_left+")|(%%"+this.double_right+")|("+this.left_equal+")|("+this.left_comment+")|("+this.left_delimiter+")|("+this.right_delimiter+"\n)|("+this.right_delimiter+")|(\n)"),this.source=e,this.stag=null,this.lines=0},EJS.Scanner.to_text=function(e){return null==e||void 0===e?"":e instanceof Date?e.toDateString():e.toString?e.toString():""},EJS.Scanner.prototype={scan:function(e){if(scanline=this.scanline,regex=this.SplitRegexp,""==!this.source)for(var t=rsplit(this.source,/\n/),n=0;n<t.length;n++){var r=t[n];this.scanline(r,regex,e)}},scanline:function(e,t,n){this.lines++;for(var r=rsplit(e,t),i=0;i<r.length;i++){var o=r[i];if(null!=o)try{n(o,this)}catch(e){throw{type:"EJS.Scanner",line:this.lines}}}}},EJS.Buffer=function(e,t){this.line=new Array,this.script="",this.pre_cmd=e,this.post_cmd=t;for(var n=0;n<this.pre_cmd.length;n++)this.push(e[n])},EJS.Buffer.prototype={push:function(e){this.line.push(e)},cr:function(){this.script=this.script+this.line.join("; "),this.line=new Array,this.script=this.script+"\n"},close:function(){if(this.line.length>0){for(var e=0;e<this.post_cmd.length;e++)this.push(pre_cmd[e]);this.script=this.script+this.line.join("; "),line=null}}},EJS.Compiler=function(e,t){this.pre_cmd=["var ___ViewO = [];"],this.post_cmd=new Array,this.source=" ",null!=e&&("string"==typeof e?(e=e.replace(/\r\n/g,"\n"),e=e.replace(/\r/g,"\n"),this.source=e):e.innerHTML&&(this.source=e.innerHTML),"string"!=typeof this.source&&(this.source="")),t=t||"<";var n=">";switch(t){case"[":n="]";break;case"<":break;default:throw t+" is not a supported deliminator"}this.scanner=new EJS.Scanner(this.source,t,n),this.out=""},EJS.Compiler.prototype={compile:function(options,name){options=options||{},this.out="";var put_cmd="___ViewO.push(",insert_cmd=put_cmd,buff=new EJS.Buffer(this.pre_cmd,this.post_cmd),content="",clean=function(e){return e=e.replace(/\\/g,"\\\\"),e=e.replace(/\n/g,"\\n"),e=e.replace(/"/g,'\\"')};this.scanner.scan(function(e,t){if(null==t.stag)switch(e){case"\n":content+="\n",buff.push(put_cmd+'"'+clean(content)+'");'),buff.cr(),content="";break;case t.left_delimiter:case t.left_equal:case t.left_comment:t.stag=e,content.length>0&&buff.push(put_cmd+'"'+clean(content)+'")'),content="";break;case t.double_left:content+=t.left_delimiter;break;default:content+=e}else switch(e){case t.right_delimiter:switch(t.stag){case t.left_delimiter:"\n"==content[content.length-1]?(content=chop(content),buff.push(content),buff.cr()):buff.push(content);break;case t.left_equal:buff.push(insert_cmd+"(EJS.Scanner.to_text("+content+")))")}t.stag=null,content="";break;case t.double_right:content+=t.right_delimiter;break;default:content+=e}}),content.length>0&&buff.push(put_cmd+'"'+clean(content)+'")'),buff.close(),this.out=buff.script+";";var to_be_evaled="/*"+name+"*/this.process = function(_CONTEXT,_VIEW) { try { with(_VIEW) { with (_CONTEXT) {"+this.out+" return ___ViewO.join('');}}}catch(e){e.lineNumber=null;throw e;}};";try{eval(to_be_evaled)}catch(e){if("undefined"==typeof JSLINT)throw e;JSLINT(this.out);for(var i=0;i<JSLINT.errors.length;i++){var error=JSLINT.errors[i];if("Unnecessary semicolon."!=error.reason){error.line++;var e=new Error;throw e.lineNumber=error.line,e.message=error.reason,options.view&&(e.fileName=options.view),e}}}}},EJS.config=function(e){EJS.cache=null!=e.cache?e.cache:EJS.cache,EJS.type=null!=e.type?e.type:EJS.type,EJS.ext=null!=e.ext?e.ext:EJS.ext;var t=EJS.templates_directory||{};EJS.templates_directory=t,EJS.get=function(e,n){return 0==n?null:t[e]?t[e]:null},EJS.update=function(e,n){null!=e&&(t[e]=n)},EJS.INVALID_PATH=-1},EJS.config({cache:!0,type:"<",ext:".ejs"}),EJS.Helpers=function(e,t){this._data=e,this._extras=t,extend(this,t)},EJS.Helpers.prototype={view:function(e,t,n){return n||(n=this._extras),t||(t=this._data),new EJS(e).render(t,n)},to_text:function(e,t){return null==e||void 0===e?t||"":e instanceof Date?e.toDateString():e.toString?e.toString().replace(/\n/g,"<br />").replace(/''/g,"'"):""}},EJS.newRequest=function(){for(var e=[function(){return new ActiveXObject("Msxml2.XMLHTTP")},function(){return new XMLHttpRequest},function(){return new ActiveXObject("Microsoft.XMLHTTP")}],t=0;t<e.length;t++)try{var n=e[t]();if(null!=n)return n}catch(e){continue}},EJS.request=function(e){var t=new EJS.newRequest;t.open("GET",e,!1);try{t.send(null)}catch(e){return null}return 404==t.status||2==t.status||0==t.status&&""==t.responseText?null:t.responseText},EJS.ajax_request=function(e){e.method=e.method?e.method:"GET";var t=new EJS.newRequest;t.onreadystatechange=function(){4==t.readyState&&(t.status,e.onComplete(t))},t.open(e.method,e.url),t.send(null)},function(e){return new EJS({text:e,type:"<"})}}();


    var t, n, a = {}, i = $(".aroundType li"), o = $("#mapListContainer"), r = i.first().data("key"), s = i.first().data("index"), l = i.first().data("length"), c = "", d = "", u = "", f = "", g = !1, h = [];
    markerTpl = $.template("<i class='item <%=itemIcon%>' data-label='<%=itemIndex%>' title='<%=title%>'></i>"),
        searchItemTpl = $.template("<div  class='itemContent'> <span class='icon-<%=keyword%>'></span><span class='itemText itemTitle'><%=title%></span><span class='icon-distance'></span><span class='itemText itemdistance'><%=distance%></span></div><div class='itemInfo'><%=address%></div>"),
        resblockOverlayTpl = $.template("<div class='name'><%=name%><i class='arrow'></i></div>"),
        listTpl = $.template($("#mapListTpl").html()),
        load = function(e) {
            var t = document.createElement("script");
            t.src = "https://api.map.baidu.com/api?v=2.0&ak=" + e + "&callback=mapInitialize",
                document.body.appendChild(t)
        }
        ,
        mapInit = function() {
            t = new BMap.Map("map",{
                enableMapClick: !1
            }),
                n = new BMap.Point(longitude,latitude),
            !0 && t.addControl(new BMap.NavigationControl({
                type: BMAP_NAVIGATION_CONTROL_LARGE,
                offset: new BMap.Size(19,78)
            })),
                t.centerAndZoom(n, 15),
                setResblockOverlays(),
                i.first().trigger("click"),
                tongji()
        }
        ,
        renderTagBox = function() {
            var e = r.split(",")
                , t = s.split(",")
                , n = l.split(",")
                , a = "";
            $.each(e, function(e, i) {
                a += '<div class="tagStyle LOGCLICK" data-bl="' + t[e] + '" data-log_evtid="10242" data-index="' + t[e] + '" data-length="' + n[e] + '">' + i + "</div>"
            }),
                $(".itemTagBox").html(a),
                liClick()
        }
        ,
        liClick = function() {
            i.on("click", function() {
                $(this).hasClass("selectTag") || (r = $(this).data("key"),
                    s = $(this).data("index"),
                    l = $(this).data("length"),
                    $(this).parent().find(".selectTag").removeClass("selectTag"),
                    $(this).addClass("selectTag"),
                    renderTagBox(),
                    $(".tagStyle").first().trigger("click"))
            }),
                $(".tagStyle").on("click", function() {
                    d = $(this).text(),
                        c = $(this).data("index"),
                        u = $(this).data("length"),
                        t.clearOverlays(),
                        setResblockOverlays(),
                        t.reset(),
                        $("#mapListContainer").html(""),
                        $(".loading").show(),
                    $(this).hasClass("select") || ($(this).parent().find(".select").removeClass("select"),
                        $(this).addClass("select"),
                        a[c] ? render() : searchDeal(d),
                        o.scrollTop(0))
                }),
                o.delegate("li", "mouseover", function() {
                    var e = $(this)
                        , t = e.data("index");
                    e.hasClass("itemBlue"),
                        cancelBlue("hover"),
                        setBlue(t, "hover")
                }),
                o.delegate("li", "mouseout", function() {
                    cancelBlue("hover")
                }),
                o.delegate("li", "click", function() {
                    var e = $(this).data("index")
                        , n = $(this).data("address").split(",")
                        , i = new BMap.Point(n[0],n[1])
                        , o = t.getBounds()
                        , r = $(this).index()
                        , s = a[c][r];
                    f = e,
                        cancelBlue("click"),
                        renderMarkerDetail(e, s),
                        setBlue(e, "click"),
                    1 != o.containsPoint(i) && (t.setViewport([i]),
                        t.setZoom(16))
                })
        }
        ,
        searchDeal = function(e) {
            var i = e;
            bdLocalSearch = new BMap.LocalSearch(t),
                bdLocalSearch.searchNearby(i, n, 2e3),
                bdLocalSearch.setSearchCompleteCallback(function(e) {
                    var t = [];
                    if (bdLocalSearch.getStatus() == BMAP_STATUS_SUCCESS)
                        for (var n = 0; n < e.getCurrentNumPois(); n++)
                            t.push(e.getPoi(n));
                    a[c] = t.filter(function(e) {
                        return "null" != e.address
                    }),
                        calcDistance()
                })
        }
        ,
        calcDistance = function() {
            var e = a[c]
                , t = new BMap.MercatorProjection
                , i = t.lngLatToPoint(n);
            $.each(e, function(e, n) {
                var a = t.lngLatToPoint(n.point)
                    , o = Math.round(Math.sqrt(Math.pow(i.x - a.x, 2) + Math.pow(i.y - a.y, 2)));
                n.distance = o + "米"
            }),
                sortList(),
                rangeDeal()
        }
        ,
        sortList = function() {
            $.each(a, function(e, t) {
                t.sort(function(e, t) {
                    return parseFloat(e.distance) - parseFloat(t.distance)
                })
            })
        }
        ,
        rangeDeal = function() {
            var e = a[c]
                , t = e.filter(function(e) {
                return parseFloat(e.distance) < 2e3 && "null" != e.address
            })
                , n = u >= t.length ? t.length : u - t.length;
            t.splice(n),
                a[c] = t,
                render()
        }
        ,
        tongji = function() {
            var e = 0;
            $(window).bind("scroll", function() {
                var t = $("body").scrollTop();
                t > 5265 && 0 == e && t < 5855 ? e = 1 : (t > 5855 || t < 5265) && (e = 0)
            }),
                t.addEventListener("zoomend", function() {
                    this.getZoom()
                }),
                t.addEventListener("click", function(e) {
                    g || $(".showMarkerDetail").remove(),
                        g = !1
                })
        }
        ,
        setResblockOverlays = function() {
            var a = resblockOverlayTpl.render({
                name: resblockName
            })
                , i = new BMap.Label(a,{
                position: n,
                offset: new BMap.Size(-30,-60)
            });
            i.setStyle({
                border: 0,
                backgroundColor: "transparent"
            }),
                t.addOverlay(i)
        }
        ,
        render = function() {
            var e = a[c]
                , n = "";
            if (t.clearOverlays(),
                setResblockOverlays(),
            e.length > 0) {
                var i = "";
                $.each(e, function(e, t) {
                    var n = searchItemTpl.render({
                        keyword: c,
                        title: t.title,
                        distance: t.distance,
                        address: t.address
                    });
                    i += "<li data-index=" + c + e + " data-address=" + t.point.lng + "," + t.point.lat + " title=" + t.title + "><div class='contentBox'>" + n + "</div></li>",
                        addItemOverlays("icon-" + c, c + e, t),
                        h.push(t.point)
                }),
                    n += "<ul class='itemBox'>" + i + "</ul>"
            }
            n = "" != n ? n : "<div class='nullSupport'>很抱歉，该配套下无相关内容，请查看其它配套</div>",
                $("#mapListContainer").html(n),
                $(".aroundList .name").eq(0).css("border-top", "none"),
                $(".loading").hide()
        }
        ,
        addItemOverlays = function(e, n, a) {
            var i = markerTpl.render({
                itemIcon: e,
                itemIndex: n,
                title: a.title
            })
                , o = new BMap.Label(i,{
                position: a.point,
                offset: new BMap.Size(-17,-40)
            });
            o.setStyle({
                border: 0,
                backgroundColor: "transparent"
            }),
                t.addOverlay(o),
                $(".BMapLabel").eq(0).css("z-index", 2),
                labelClick(o, n, a)
        }
        ,
        renderMarkerDetail = function(e, n) {
            var a = searchItemTpl.render({
                keyword: c,
                title: n.title,
                distance: n.distance,
                address: n.address
            })
                , i = $(".aroundMap").offset().top
                , o = $(".blueLabel").offset().top
                , r = '<div class="makerDetailStyle" data-detail="' + e + '">' + a + '<span class="detailArrow"></span></div>';
            $(".labelUp").append(r);
            var s = $(".makerDetailStyle").height()
                , l = i + s + 80
                , d = -parseInt(s) - parseInt($(".blueLabel").height()) - 20;
            l > o && t.panBy(0, l - o),
                $(".makerDetailStyle").css("top", d)
        }
        ,
        labelClick = function(e, t, n) {
            e.addEventListener("click", function(e) {
                var a = e || window.event;
                f = t,
                    cancelBlue("click"),
                    renderMarkerDetail(t, n),
                    setBlue(t, "click"),
                    scrollTop(t),
                    g = !0,
                    a.stopPropagation ? a.stopPropagation() : a.cancelBubble = !0
            }),
                e.addEventListener("mouseover", function(e) {
                    cancelBlue("hover"),
                        setBlue(t, "hover")
                }),
                e.addEventListener("mouseout", function(e) {
                    cancelBlue("hover")
                })
        }
        ,
        scrollTop = function(e) {
            for (var t = 0, n = o.find("li"), a = 0; a < n.length; a++) {
                if (n.eq(a).data("index") == e)
                    return o.scrollTop(t),
                        !1;
                t += n.eq(a).height() + 20
            }
        }
        ,
        cancelBlue = function(e) {
            "click" == e ? ($(".contentBox").removeClass("contentActive"),
                $(".itemText").removeClass("itemActive"),
                $(".itemInfo").removeClass("itemActive"),
                $(".makerDetailStyle").remove()) : o.find("li").css("backgroundColor", "#fff"),
                $(".BMapLabel").removeClass("labelUp"),
                $(".BMapLabel .item").removeClass("blueLabel"),
            f && setBlue(f, "click")
        }
        ,
        setBlue = function(e, t) {
            var n = $('[data-index="' + e + '"]')
                , a = $('[data-label="' + e + '"]')
                , i = $('[data-detail="' + e + '"]');
            "click" == t ? (n.find(".contentBox").addClass("contentActive"),
                n.find(".itemText").addClass("itemActive"),
                n.find(".itemInfo").addClass("itemActive"),
                i.removeClass("hideMarkerDetail").addClass("showMarkerDetail")) : n.css("backgroundColor", "#f6f6f6"),
                a.parent().addClass("labelUp"),
                a.addClass("blueLabel")
        }
        ,
        load(site_map_key),
        window.mapInitialize = mapInit,
        renderTagBox()
});
