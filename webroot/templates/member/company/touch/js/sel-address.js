document.write('<div class="gz-address"><div class="gz-addr-wrap"id="gzAddrList"><div class="gz-addr-header"><a class="gz-addr-header-back"href="javascript:;"></a><h2>'+langData['siteConfig'][6][131]+'</h2>' + //选择收货地址
    '<a class="gz-addr-header-btn fn-hide"href="javascript:;">'+langData['siteConfig'][6][8]+'</a></div>' + //删除
    '<section class="gz-addr-list"><div class="empty">'+langData['siteConfig'][38][2]+'...</div></section>' + //加载中
    '<button class="gz-addr-addnewbtn"id="gzAddNewAddrBtn">'+langData['siteConfig'][6][132]+'</button></div>' + //新增地址
    '<div class="gz-addr-wrap fn-hide"id="gzAddNewObj"><div class="gz-addr-header"><a class="gz-addr-header-back"href="javascript:;"></a><h2>'+langData['siteConfig'][6][132]+'</h2></div>' + //新增地址
    '<div class="gz-addr-addnew"><dl><dt><label for="people">'+langData['siteConfig'][45][55]+'</label></dt><dd>' + //联系姓名
    '<input type="text"name="people"id="people"placeholder="'+langData['siteConfig'][45][56]+'"/></dd></dl>' + //您的姓名
    '<dl><dt><label for="mobile">'+langData['siteConfig'][3][6]+'</label></dt><dd>' + //手机号码
    '<input type="tel"name="mobile"id="mobile"placeholder="'+langData['siteConfig'][45][57]+'"maxlength="11"/></dd></dl>' + //您的手机号码
    '<dl class="gz-addr-seladdr gz-no-sel"><dt>'+langData['siteConfig'][19][34]+'</dt>' + //所在地区
    '<dd>'+langData['siteConfig'][45][58]+'</dd></dl>' + //选择您的所在地区
    '<dl><dt><label for="address">'+langData['siteConfig'][19][35]+'</label></dt><dd>' + //详细地址
    '<input type="text"name="address"id="address"placeholder="'+langData['siteConfig'][45][59]+'"/></dd></dl></div>' + //请输入详细的地址信息
    '<button class="gz-addr-safenewbtn"id="gzSafeNewAddrBtn">'+langData['siteConfig'][6][27]+'</button></div>' + //保存
    '<div class="gz-sel-addr gz-sel-addr-hide"id="gzSelAddr"><div class="gz-sel-addr-header">' + 
    '<h3>'+langData['siteConfig'][40][1]+'</h3>' + //选择地区
    '<button class="gz-sel-addr-close"id="gzSelAddrCloseBtn"></button></div><ul class="gz-sel-addr-nav"></ul><div class="gz-sel-addr-list"></div></div><div class="gz-sel-addr-mask"></div></div>');
$(function(){
    var gzAddress         = $(".gz-address"),  //选择地址页
        gzAddrList        = $("#gzAddrList"),    //选择收货地址页
        gzAddrHeaderBtn   = $(".gz-addr-header-btn"),  //删除按钮
        gzAddrListObj     = $(".gz-addr-list"),  //地址列表
        gzAddNewAddrBtn   = $("#gzAddNewAddrBtn"),  //新增地址按钮
        gzAddNewObj       = $("#gzAddNewObj"),   //新增地址页
        gzSelAddr         = $("#gzSelAddr"),     //选择地区页
        gzSelMask         = $(".gz-sel-addr-mask"),  //选择地区遮罩层
        gzAddrSeladdr     = $(".gz-addr-seladdr"),  //选择所在地区按钮
        gzSelAddrCloseBtn = $("#gzSelAddrCloseBtn"),  //关闭选择所在地区按钮
        gzSafeNewAddrBtn  = $("#gzSafeNewAddrBtn"),  //保存新增地址
        gzSelAddrList     = $(".gz-sel-addr-list"),  //区域列表
        gzSelAddrNav      = $(".gz-sel-addr-nav"),  //区域TAB
        gzAddrActive      = "gz-addr-active",  //地址选中样式
        gzSelAddrActive   = "gz-sel-addr-active",  //选择所在地区后页面下沉样式名
        gzSelAddrHide     = "gz-sel-addr-hide",  //选择所在地区浮动层隐藏样式名
        gzBackClass       = ".gz-addr-header-back",  //后退按钮样式名
        showErrTimer      = null,
        gzAddrEditId      = 0,   //修改地址ID
        gzAddrInit = {

            //错误提示
            showErr: function(txt){
                showErrTimer && clearTimeout(showErrTimer);
        		$(".gzAddrErr").remove();
        		$("body").append('<div class="gzAddrErr"><p>'+txt+'</p></div>');
        		$(".gzAddrErr p").css({"margin-left": -$(".gzAddrErr p").width()/2, "left": "50%"});
        		$(".gzAddrErr").css({"visibility": "visible"});
        		showErrTimer = setTimeout(function(){
        			$(".gzAddrErr").fadeOut(300, function(){
        				$(this).remove();
        			});
        		}, 1500);
            }

            //显示选择地址页
            ,showChooseAddr: function(){
                $("html").addClass("fixed");
                gzAddress.show();
                if(gzAddrList.find("article").length == 0){
                    gzAddrInit.getAddrList();
                }
            }

            //获取地址列表
            ,getAddrList: function(){

                gzAddrListObj.html('<div class="empty">'+langData['siteConfig'][38][8]+'</div>');//加载中...

                $.ajax({
                    url: masterDomain + '/include/ajax.php?service=member&action=address',
                    dataType: "jsonp",
                    success: function (data) {
                        if(data){

                            var list = data.info.list, addrList = [];
                            if(data.state == 100 && list.length > 0){

                                for (var i = 0, addr, contact; i < list.length; i++) {
                                    addr = list[i];
                                    contact = addr.mobile != "" ? addr.mobile : addr.tel;
                                    addrList.push('<article class="fn-clear" data-id="'+addr.id+'" data-people="'+addr.person+'" data-contact="'+contact+'" data-addrid="'+addr.addrid+'" data-addrids="'+addr.addrids+'" data-addrname="'+addr.addrname+'" data-address="'+addr.address+'">');
                                    addrList.push('<div class="gz-linfo">');
                                    addrList.push('<s></s>');
                                    addrList.push('<h5>'+addr.person+'<sup>'+contact+'</sup></h5>');
                                    addrList.push('<p>'+addr.addrname+' '+addr.address+'</p>');
                                    addrList.push('</div>');
                                    addrList.push('<div class="gz-rbtn gz-rbtn-edit"></div>');
                                    addrList.push('</article>');
                                }
                                gzAddrListObj.html(addrList.join(""));
                                gzAddrHeaderBtn.fadeIn(300);

                            }else{
                                if(list && list.length == 0){
                                    gzAddrListObj.html('<div class="empty">'+langData['siteConfig'][20][226]+'</div>');//您尚未添加收货地址
                                }else{
                                    gzAddrListObj.html('<div class="empty">'+data.info+'</div>');
                                }
                            }

                        }else{
                            gzAddrListObj.html('<div class="empty">'+langData['siteConfig'][20][228]+'</div>');//获取失败！
                        }
                    },
                    error: function(){
                        gzAddrListObj.html('<div class="empty">'+langData['siteConfig'][20][227]+'</div>');//网络错误，加载失败！
                    }
                });

            }

            //删除地址
            ,delAddr: function(id, obj){
                $.ajax({
                    url: masterDomain + "/include/ajax.php?service=member&action=addressDel",
                    data: "id="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100){
                            obj.hide(300, function(){
                                obj.remove();
                                if(gzAddrListObj.find("article").length == 0){
                                    gzAddrListObj.html('<div class="empty">您尚未添加收货地址</div>');
                                }
                            });
                        }else{
                            alert(data.info);
                        }
                    },
                    error: function(){
                        alert(langData['siteConfig'][6][203]);//网络错误，请重试！
                    }
                });
            }

            //获取区域
            ,getAddrArea: function(id){

                //如果是一级区域
                if(!id){
                    gzSelAddrNav.html('<li class="gz-curr"><span>'+langData['siteConfig'][7][2]+'</span></li>');//请选择
                    gzSelAddrList.html('');
                }

                var areaobj = "gzAddrArea"+id;
                if($("#"+areaobj).length == 0){
                    gzSelAddrList.append('<ul id="'+areaobj+'"><li class="loading">'+langData['siteConfig'][38][8]+'</li></ul>');//加载中...
                }

                gzSelAddrList.find("ul").hide();
                $("#"+areaobj).show();

                $.ajax({
                    url: masterDomain + "/include/ajax.php?service=siteConfig&action=addr",
                    data: "type="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100){
                            var list = data.info, areaList = [];
                            for (var i = 0, area, lower; i < list.length; i++) {
                                area = list[i];
                                lower = area.lower == undefined ? 0 : area.lower;
                                areaList.push('<li data-id="'+area.id+'" data-lower="'+lower+'"'+(!lower ? 'class="n"' : '')+'>'+area.typename+'</li>');
                            }
                            $("#"+areaobj).html(areaList.join(""));
                        }else{
                            $("#"+areaobj).html('<li class="loading">'+data.info+'</li>');
                        }
                    },
                    error: function(){
                        $("#"+areaobj).html('<li class="loading">'+langData['siteConfig'][6][203]+'</li>');//网络错误，请重试！
                    }
                });


            }

            //初始区域
            ,gzAddrReset: function(i, ids, addrArr){

                var gid = i == 0 ? 0 : ids[i-1];
                var id = ids[i];
                var addrname = addrArr[i];

                //全国区域
                if(i == 0){
                    gzSelAddrNav.html('');
                    gzSelAddrList.html('');
                }

                var cla = i == addrArr.length - 1 ? ' class="gz-curr"' : '';
                gzSelAddrNav.append('<li data-id="'+id+'"'+cla+'><span>'+addrname+'</span></li>');

                var areaobj = "gzAddrArea"+id;
                if($("#"+areaobj).length == 0){
                    gzSelAddrList.append('<ul class="fn-hide" id="'+areaobj+'"><li class="loading">'+langData['siteConfig'][38][8]+'</li></ul>');//加载中...
                }

                $.ajax({
                    url: masterDomain + "/include/ajax.php?service=siteConfig&action=addr",
                    data: "type="+gid,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100){
                            var list = data.info, areaList = [];
                            for (var i = 0, area, cla, lower; i < list.length; i++) {
                                area = list[i];
                                lower = area.lower == undefined ? 0 : area.lower;
                                cla = "";
                                if(!lower){
                                    cla += " n";
                                }
                                if(id == area.id){
                                    cla += " gz-curr";
                                }
                                areaList.push('<li data-id="'+area.id+'" data-lower="'+lower+'"'+(cla != "" ? 'class="'+cla+'"' : '')+'>'+area.typename+'</li>');
                            }
                            $("#"+areaobj).html(areaList.join(""));
                        }else{
                            $("#"+areaobj).html('<li class="loading">'+data.info+'</li>');
                        }
                    },
                    error: function(){
                        $("#"+areaobj).html('<li class="loading">'+langData['siteConfig'][6][203]+'</li>');//网络错误，请重试！
                    }
                });

            }

            //隐藏选择地区浮动层&遮罩层
            ,hideNewAddrMask: function(){
                gzAddNewObj.removeClass(gzSelAddrActive);
                gzSelMask.fadeOut();
                gzSelAddr.addClass(gzSelAddrHide);
            }

        }


    //选择收货地址
    $(".chooseAddress").bind("click", function(){
        gzAddrInit.showChooseAddr();
    });

    //选择收货地址页后退
    gzAddrList.find(gzBackClass).bind("click", function(){
        gzAddress.hide();
        $("html").removeClass("fixed");
    });

    //选择地址
    gzAddrListObj.delegate("article .gz-linfo", "click", function(){
        var t = $(this), par = t.parent(), id = par.attr("data-id"), people = par.attr("data-people"), contact = par.attr("data-contact"), addrid = par.attr("data-addrid"), addrids = par.attr("data-addrids"), addrname = par.attr("data-addrname"), address = par.attr("data-address");
        par.addClass(gzAddrActive).siblings("article").removeClass(gzAddrActive);

        var data = {
            "id": id,
            "people": people,
            "contact": contact,
            "addrid": addrid,
            "addrids": addrids,
            "addrname": addrname,
            "address": address
        }
        //业务层需要配合
        chooseAddressOk(data);

        gzAddrList.find(gzBackClass).click();
    });

    //编辑
    gzAddrListObj.delegate(".gz-rbtn-edit", "click", function(){
        var t = $(this), par = t.closest("article"), id = par.attr("data-id"), people = par.attr("data-people"), contact = par.attr("data-contact"), addrid = par.attr("data-addrid"), addrids = par.attr("data-addrids"), addrname = par.attr("data-addrname"), address = par.attr("data-address");
        if(id){
            gzAddrEditId = id;
            $("#people").val(people);
            $("#mobile").val(contact);
            gzAddrSeladdr.removeClass("gz-no-sel").attr("data-id", addrid).attr("data-ids", addrids).find("dd").html(addrname);
            $("#address").val(address);

            gzAddrList.addClass("fn-hide");
            gzAddNewObj.removeClass("fn-hide");
        }
    });

    //删除按钮
    gzAddrHeaderBtn.bind("touchend", function(){
        var t = $(this);

        if(t.hasClass("isWrite")){
            gzAddrListObj.find(".gz-rbtn").removeClass("gz-rbtn-del").addClass("gz-rbtn-edit");
            t.removeClass("isWrite").html(langData['siteConfig'][6][8]);//删除
        }else{
            gzAddrListObj.find(".gz-rbtn").removeClass("gz-rbtn-edit").addClass("gz-rbtn-del");
            t.addClass("isWrite").html(langData['siteConfig'][6][12]);//取消
        }
    });

    //删除
    gzAddrListObj.delegate(".gz-rbtn-del", "touchend", function(){
        var t = $(this), par = t.closest("article"), id = par.attr("data-id");
        if(id && confirm(langData['siteConfig'][45][60])){//确定要删除吗？
            gzAddrInit.delAddr(id, par);
        }
    });

    //新增地址
    gzAddNewAddrBtn.bind("click", function(){

        //重置表单
        $("#people").val("");
        $("#mobile").val("");
        gzAddrSeladdr.removeClass("gz-no-sel").addClass("gz-no-sel").removeAttr("data-id").removeAttr("data-ids").find("dd").html(langData['siteConfig'][45][58]);//选择您的所在地区
        $("#address").val("");
        gzAddrEditId = 0;

        gzAddrList.addClass("fn-hide");
        gzAddNewObj.removeClass("fn-hide");
    });

    //新增地址返回
    gzAddNewObj.find(gzBackClass).bind("click", function(){
        gzAddNewObj.addClass("fn-hide");
        gzAddrList.removeClass("fn-hide");
    });

    //选择所在地区
    gzAddrSeladdr.bind("click", function(){
        gzAddNewObj.addClass(gzSelAddrActive);
        gzSelMask.fadeIn();
        gzSelAddr.removeClass(gzSelAddrHide);

        var t = $(this), ids = t.attr("data-ids"), id = t.attr("data-id"), addrname = t.find("dd").text();

        //第一次点击
        if((ids == undefined && id == undefined) || (ids == '' && (id == '' || id == 0))){
            gzAddrInit.getAddrArea(0);

        //已有默认数据
        }else{

            //初始化区域
            ids = ids.split(" ");
            addrArr = addrname.split(" ");
            for (var i = 0; i < ids.length; i++) {
                gzAddrInit.gzAddrReset(i, ids, addrArr);
            }
            $("#gzAddrArea"+id).show();

        }

    });

    //关闭选择所在地区浮动层
    gzSelAddrCloseBtn.bind("touchend", function(){
        gzAddrInit.hideNewAddrMask();
    })

    //点击遮罩背景层关闭层
    gzSelMask.bind("touchend", function(){
        gzAddrInit.hideNewAddrMask();
    });

    //选择区域
    gzSelAddrList.delegate("li", "click", function(){
        var t = $(this), id = t.attr("data-id"), addr = t.text(), lower = t.attr("data-lower"), par = t.closest("ul"), index = par.index();
        if(id && addr){

            t.addClass("gz-curr").siblings("li").removeClass("gz-curr");
            gzSelAddrNav.find("li:eq("+index+")").attr("data-id", id).html("<span>"+addr+"</span>");

            //如果有下级
            if(lower != "0"){

                //把子级清掉
                gzSelAddrNav.find("li:eq("+index+")").nextAll("li").remove();
                gzSelAddrList.find("ul:eq("+index+")").nextAll("ul").remove();

                //新增一组
                gzSelAddrNav.find("li:eq("+index+")").removeClass("gz-curr");
                gzSelAddrNav.append('<li class="gz-curr"><span>'+langData['siteConfig'][7][2]+'</span></li>');//请选择

                //获取新的子级区域
                gzAddrInit.getAddrArea(id);

            //没有下级
            }else{

                var addrname = [], ids = [];
                gzSelAddrNav.find("li").each(function(){
                    addrname.push($(this).text());
                    ids.push($(this).attr("data-id"));
                });

                gzAddrSeladdr.removeClass("gz-no-sel").attr("data-ids", ids.join(" ")).attr("data-id", id).find("dd").html(addrname.join(" "));
                gzAddrInit.hideNewAddrMask();

            }

        }
    });

    //区域切换
    gzSelAddrNav.delegate("li", "touchend", function(){
        var t = $(this), index = t.index();
        t.addClass("gz-curr").siblings("li").removeClass("gz-curr");
        gzSelAddrList.find("ul").hide();
        gzSelAddrList.find("ul:eq("+index+")").show();
    });

    //保存新增地址
    gzSafeNewAddrBtn.bind("click", function(){

        var t = $(this),
            people = $.trim($("#people").val()),
            mobile = $.trim($("#mobile").val()),
            addrid = gzAddrSeladdr.attr("data-id"),
            address = $.trim($("#address").val());

        if(people == ""){
            gzAddrInit.showErr(langData['siteConfig'][45][61]); //请填写您的姓名！
            return false;
        }

        if(mobile == ""){
            gzAddrInit.showErr(langData['siteConfig'][45][62]); //请填写您的手机号码！
            return false;
        }

        var exp = new RegExp("^(13|14|15|17|18)[0-9]{9}$", "img");
        if(!exp.test(mobile)){
            // gzAddrInit.showErr(langData['siteConfig'][45][63]); //请填写正确的手机号码！
            // return false;
        }

        if(addrid == "" || addrid == undefined){
            gzAddrInit.showErr(langData['siteConfig'][45][64]); //请选择您的所在地区！
            return false;
        }

        if(address == ""){
            gzAddrInit.showErr(langData['siteConfig'][45][65]); //请填写详细地址信息！
            return false;
        }

        var data = [];
        data.push('id='+gzAddrEditId);
        data.push('addrid='+addrid);
        data.push('address='+address);
        data.push('person='+people);
        data.push('mobile='+mobile);
        t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");//提交中

        var addrName = [];
        $("#addrid").parent().find("select").each(function(){
            addrName.push($(this).find("option:selected").text());
        });

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=member&action=addressAdd",
            data: data.join("&"),
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    gzAddNewObj.find(gzBackClass).click();
                    gzAddrInit.getAddrList();
                }else{
                    gzAddrInit.showErr(data.info);
                }
                t.removeAttr("disabled").html(langData['siteConfig'][3][27]);//保存
            },
            error: function(){
                t.removeAttr("disabled").html(langData['siteConfig'][3][27]);//保存
                gzAddrInit.showErr(langData['siteConfig'][20][253]);//网络错误，保存失败！
            }
        });

    });




});



// 扩展zepto
$.fn.prevAll = function(selector){
    var prevEls = [];
    var el = this[0];
    if(!el) return $([]);
    while (el.previousElementSibling) {
        var prev = el.previousElementSibling;
        if (selector) {
            if($(prev).is(selector)) prevEls.push(prev);
        }
        else prevEls.push(prev);
        el = prev;
    }
    return $(prevEls);
};

$.fn.nextAll = function (selector) {
    var nextEls = [];
    var el = this[0];
    if (!el) return $([]);
    while (el.nextElementSibling) {
        var next = el.nextElementSibling;
        if (selector) {
            if($(next).is(selector)) nextEls.push(next);
        }
        else nextEls.push(next);
        el = next;
    }
    return $(nextEls);
};
