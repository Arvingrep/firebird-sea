
$(function(){
    var gzAddress         = $(".gz-address"),  //选择地址页
        gzAddrListObj     = $(".gz-type-list"),  //地址列表
        gzAddNewObj       = $("#gzAddNewObj"),   //新增地址页
        gzSelAddr         = $("#gzSelType"),     //选择地区页
        gzSelMask         = $(".gz-sel-type-mask"),  //选择地区遮罩层
        gzAddrSeladdr     = $(".gz-addr-type"),  //选择所在地区按钮
        gzSelAddrCloseBtn = $("#gzSelAddrCloseBtn"),  //关闭选择所在地区按钮
        gzSelAddrList     = $(".gz-sel-type-list"),  //分类列表
        gzSelAddrNav      = $(".gz-sel-type-nav"),  //分类TAB
        gzSelAddrActive   = "gz-sel-type-active",  //选择所在地区后页面下沉样式名
        gzSelAddrHide     = "gz-sel-type-hide",  //选择所在地区浮动层隐藏样式名
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

            }



            //获取类型
            ,getAddrArea: function(id){

                //如果是一级分类
                if(!id){
                    gzSelAddrNav.html('<li class="gz-curr"><span>'+langData['siteConfig'][7][2]+'</span></li>');
                    gzSelAddrList.html('');
                }

                var areaobj = "gzAddrType"+id;
                if($("#"+areaobj).length == 0){
                    gzSelAddrList.append('<ul id="'+areaobj+'"><li class="loading">'+langData['siteConfig'][20][184]+'...</li></ul>');
                }

                gzSelAddrList.find("ul").hide();
                $("#"+areaobj).show();

                $.ajax({
                    url: masterDomain + "/include/ajax.php?service=job&action=type",
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
                        $("#"+areaobj).html('<li class="loading">'+langData['siteConfig'][20][183]+'</li>');
                    }
                });


            }

            //初始分类
            ,gzAddrReset: function(i, ids, addrArr){

                var gid = i == 0 ? 0 : ids[i-1];
                var id = ids[i];
                var addrname = addrArr[i];

                //全国分类
                if(i == 0){
                    gzSelAddrNav.html('');
                    gzSelAddrList.html('');
                }

                var cla = i == addrArr.length - 1 ? ' class="gz-curr"' : '';
                gzSelAddrNav.append('<li data-id="'+id+'"'+cla+'><span>'+addrname+'</span></li>');

                var areaobj = "gzAddrType"+id;
                if($("#"+areaobj).length == 0){
                    gzSelAddrList.append('<ul class="fn-hide" id="'+areaobj+'"><li class="loading">'+langData['siteConfig'][20][184]+'...</li></ul>');
                }

                $.ajax({
                    url: masterDomain + "/include/ajax.php?service=job&action=type",
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
                        $("#"+areaobj).html('<li class="loading">'+langData['siteConfig'][20][183]+'</li>');
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


    //选择所在地区
    gzAddrSeladdr.bind("click", function(){
        gzAddNewObj.addClass(gzSelAddrActive);
        gzSelMask.fadeIn();
        gzSelAddr.removeClass(gzSelAddrHide);

        var t = $(this), ids = t.attr("data-ids"), id = t.attr("data-id"), addrname = t.attr("data-name");

        //第一次点击
        if((ids == undefined && id == undefined) || (ids == '' && (id == '' || id == 0))){
            gzAddrInit.getAddrArea(0);

        //已有默认数据
        }else{

            //初始化分类
            ids = ids.split(" ");
            addrArr = addrname.split(" ");
            for (var i = 0; i < ids.length; i++) {
                gzAddrInit.gzAddrReset(i, ids, addrArr);
            }
            $("#gzAddrType"+id).show();

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

    //选择分类
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
                gzSelAddrNav.append('<li class="gz-curr"><span>'+langData['siteConfig'][7][2]+'</span></li>');

                //获取新的子级分类
                gzAddrInit.getAddrArea(id);

            //没有下级
            }else{

                var addrname = [], ids = [];

                //把子级清掉
                gzSelAddrNav.find("li:eq("+index+")").nextAll("li").remove();
                gzSelAddrList.find("ul:eq("+index+")").nextAll("ul").remove();


                gzSelAddrNav.find("li").each(function(){
                  addrname.push($(this).text());
                  ids.push($(this).attr("data-id"));
                });

                gzAddrSeladdr.removeClass("gz-no-sel").attr("data-ids", ids.join(" ")).attr("data-name", addrname.join(" ")).attr("data-id", id).find("dd p").html(addrname[addrname.length-1]);
                $('#type').val(id);
                gzAddrInit.hideNewAddrMask();

            }

        }
    });

    //分类切换
    gzSelAddrNav.delegate("li", "touchend", function(){
        var t = $(this), index = t.index();
        t.addClass("gz-curr").siblings("li").removeClass("gz-curr");
        gzSelAddrList.find("ul").hide();
        gzSelAddrList.find("ul:eq("+index+")").show();
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
