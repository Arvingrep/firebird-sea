
$(function(){
    var sortBy = function(prop){
      return function (obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];
        if(!isNaN(Number(val1)) && !isNaN(Number(val2))) {
          val1 = Number(val1);
          val2 = Number(val2);
        }
        if(val1 < val2) {
          return -1;
        }else if(val1 > val2) {
          return 1;
        }else{
          return 0;
        }
      }
    }

    var gzAddress         = $(".gz-address"),  //选择地址页
        gzAddrListObj     = $(".gz-addr-list"),  //地址列表
        gzAddNewObj       = $("#gzAddNewObj"),   //新增地址页
        gzSelAddr         = $("#gzSelAddr"),     //选择地区页
        gzSelMask         = $(".gz-sel-addr-mask"),  //选择地区遮罩层
        gzAddrSeladdr     = $(".gz-addr-seladdr"),  //选择所在地区按钮
        gzSelAddrCloseBtn = $("#gzSelAddrCloseBtn"),  //关闭选择所在地区按钮
        gzSelAddrList     = $(".gz-sel-addr-list"),  //区域列表
        gzSelAddrNav      = $(".gz-sel-addr-nav"),  //区域TAB
        gzSelAddrSzm      = "gz-sel-addr-szm",  //城市首字母筛选
        gzSelAddrActive   = "gz-sel-addr-active",  //选择所在地区后页面下沉样式名
        gzSelAddrHide     = "gz-sel-addr-hide",  //选择所在地区浮动层隐藏样式名
        showErrTimer      = null,
        gzAddrEditId      = 0,   //修改地址ID
        gzScrollTop       = 0,
        gzAddrSeladdrActive = null,
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



            //获取区域
            ,getAddrArea: function(id){

                //如果是一级区域
                if(!id){
                    gzSelAddrNav.html('<li class="gz-curr"><span>'+langData['siteConfig'][7][2]+'</span></li>');
                    gzSelAddrList.html('');
                }

                var areaobj = "gzAddrArea"+id;
                if($("#"+areaobj).length == 0){
                    gzSelAddrList.append('<ul class="gzAddrArea_" id="'+areaobj+'"><li class="loading">'+langData['siteConfig'][20][184]+'...</li></ul>');
                }

                gzSelAddrList.find("ul").hide();
                $("#"+areaobj).show();
                var action = gzAddrSeladdrActive.attr("data-action");
                action = action ? action : "addr";
                $.ajax({
                    url: masterDomain + "/include/ajax.php?service=siteConfig&action="+action,
                    data: "type="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100){
                            var list = data.info, areaList = [], hotList = [], cityArr = [], hotCityHtml = [], html1 = []
                            if(gzAddrSeladdrActive.attr("data-just") == 1 && $("#"+areaobj).index() > 0){
                                areaList.push('<li data-id="'+id+'" class="n" data-just="1">暂不选择</li>');
                            }
                            for (var i = 0, area, lower; i < list.length; i++) {

                                var pinyin = list[i].pinyin.substr(0,1);
                                if(cityArr[pinyin] == undefined){
                                    cityArr[pinyin] = [];
                                }
                                cityArr[pinyin].push(list[i]);

                                area = list[i];
                                lower = area.lower == undefined ? 0 : area.lower;
                                areaList.push('<li data-id="'+area.id+'" data-lower="'+lower+'"'+(!lower ? 'class="n"' : '')+'>'+area.typename+'</li>');
                            }

                            //如果是一级区域，并且区域总数量大于20个时，将采用首字母筛选样式
                            if(list.length > 20 && !id){
                              var szmArr = [], areaList = [];
                              for(var key in cityArr){
                                var szm = key;
                                // 右侧字母数组
                                szmArr.push(key);
                              }
                              szmArr.sort();

                              for (var i = 0; i < szmArr.length; i++) {
                                html1.push('<li><a href="javascript:;" data-id="'+szmArr[i]+'">'+szmArr[i]+'</a></li>');

                                cityArr[szmArr[i]].sort(sortBy('id'));

                                // 左侧城市填充
                                areaList.push('<li class="table-tit table-tit-'+szmArr[i]+'" id="'+szmArr[i]+'">'+szmArr[i]+'</li>');
                                for (var j = 0; j < cityArr[szmArr[i]].length; j++) {

                                  cla = "";
                                  if(!lower){
                                      cla += " n";
                                  }
                                  if(id == cityArr[szmArr[i]][j].id){
                                      cla += " gz-curr";
                                  }

                                  lower = cityArr[szmArr[i]][j].lower == undefined ? 0 : cityArr[szmArr[i]][j].lower;
                                  areaList.push('<li data-id="'+cityArr[szmArr[i]][j].id+'" data-lower="'+lower+'"'+(cla != "" ? 'class="'+cla+'"' : '')+'>'+cityArr[szmArr[i]][j].typename+'</li>');

                                  if(cityArr[szmArr[i]][j].hot == 1){
                                    hotList.push('<li data-id="'+cityArr[szmArr[i]][j].id+'" data-lower="'+lower+'">'+cityArr[szmArr[i]][j].typename+'</li>');
                                  }
                                }
                              }

                              if(hotList.length > 0){
                                hotList.unshift('<li class="table-tit table-tit-hot" id="hot">热门</li>');
                                html1.unshift('<li><a href="javascript:;" data-id="hot">热门</a></li>');

                                areaList.unshift(hotList.join(''));
                              }

                              //拼音导航
                              $('.' + gzSelAddrSzm + ', .letter').remove();
                              gzSelAddr.append('<div class="'+gzSelAddrSzm+'"><ul>'+html1.join('')+'</ul></div>');

                              $('body').append('<div class="letter"></div>');

                              var szmHeight = $('.' + gzSelAddrSzm).height();
                              szmHeight = szmHeight > 380 ? 380 : szmHeight;

                              $('.' + gzSelAddrSzm).css('margin-top', '-' + szmHeight/2 + 'px');

                              $("#"+areaobj).addClass('gzaddr-szm-ul');

                            }else{
                              $('.' + gzSelAddrSzm).hide();
                            }

                            $("#"+areaobj).html(areaList.join(""));
                        }else{
                            if(gzAddrSeladdrActive.attr("data-just") == 1 && $("#"+areaobj).index() > 0){
                                $("#"+areaobj).html('<li data-id="'+id+'" class="n" data-just="1">暂不选择</li>');
                            }else{
                                $("#"+areaobj).html('<li class="loading">'+data.info+'</li>');
                            }
                        }
                    },
                    error: function(){
                        $("#"+areaobj).html('<li class="loading">'+langData['siteConfig'][20][183]+'</li>');
                    }
                });


            }

            //初始区域
            ,gzAddrReset: function(i, ids, addrArr, index){


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

                var areaobj = "gzAddrArea"+gid;
                if($("#"+areaobj).length == 0){
                    gzSelAddrList.append('<ul class="fn-hide gzAddrArea_'+id+'" id="'+areaobj+'"><li class="loading">'+langData['siteConfig'][20][184]+'...</li></ul>');
                }
                var action = gzAddrSeladdrActive.attr("data-action");
                action = action ? action : "addr";
                $.ajax({
                    url: masterDomain + "/include/ajax.php?service=siteConfig&action="+action,
                    data: "type="+gid,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100){
                            var list = data.info, areaList = [], hotList = [], cityArr = [], hotCityHtml = [], html1 = [];
                            if(gzAddrSeladdrActive.attr("data-just") == 1 && $("#"+areaobj).index() > 0){
                                cla
                                areaList.push('<li data-id="'+gid+'" class="n" data-just="1">暂不选择</li>');
                            }
                            if(gzAddrSeladdrActive.attr("data-any") == 1 && $("#"+areaobj).index() == 0){
                                areaList.push('<li data-id="'+id+'" class="n" data-just="1">不限</li>');
                            }
                            for (var i = 0, area, cla, lower; i < list.length; i++) {
                                area = list[i];
                                lower = area.lower == undefined ? 0 : area.lower;

                                var pinyin = list[i].pinyin.substr(0,1);
                                if(cityArr[pinyin] == undefined){
                                  cityArr[pinyin] = [];
                                }
                                cityArr[pinyin].push(list[i]);

                                cla = "";
                                if(!lower){
                                    cla += " n";
                                }
                                if(id == area.id){
                                    cla += " gz-curr";
                                }
                                areaList.push('<li data-id="'+area.id+'" data-lower="'+lower+'"'+(cla != "" ? 'class="'+cla+'"' : '')+'>'+area.typename+'</li>');
                            }

                            //如果是一级区域，并且区域总数量大于20个时，将采用首字母筛选样式
                            if(list.length > 20 && index == 0){
                              var szmArr = [], areaList = [];
                              for(var key in cityArr){
                                var szm = key;
                                // 右侧字母数组
                                szmArr.push(key);
                              }
                              szmArr.sort();

                              for (var i = 0; i < szmArr.length; i++) {
                                html1.push('<li><a href="javascript:;" data-id="'+szmArr[i]+'">'+szmArr[i]+'</a></li>');

                                cityArr[szmArr[i]].sort(sortBy('id'));

                                // 左侧城市填充
                                areaList.push('<li class="table-tit table-tit-'+szmArr[i]+'" id="'+szmArr[i]+'">'+szmArr[i]+'</li>');
                                for (var j = 0; j < cityArr[szmArr[i]].length; j++) {

                                  cla = "";
                                  if(!lower){
                                      cla += " n";
                                  }
                                  if(id == cityArr[szmArr[i]][j].id){
                                      cla += " gz-curr";
                                  }

                                  lower = cityArr[szmArr[i]][j].lower == undefined ? 0 : cityArr[szmArr[i]][j].lower;
                                  areaList.push('<li data-id="'+cityArr[szmArr[i]][j].id+'" data-lower="'+lower+'"'+(cla != "" ? 'class="'+cla+'"' : '')+'>'+cityArr[szmArr[i]][j].typename+'</li>');

                                  if(cityArr[szmArr[i]][j].hot == 1){
                                    hotList.push('<li data-id="'+cityArr[szmArr[i]][j].id+'" data-lower="'+lower+'">'+cityArr[szmArr[i]][j].typename+'</li>');
                                  }
                                }
                              }

                              if(hotList.length > 0){
                                hotList.unshift('<li class="table-tit table-tit-hot" id="hot">热门</li>');
                                html1.unshift('<li><a href="javascript:;" data-id="hot">热门</a></li>');

                                areaList.unshift(hotList.join(''));
                              }

                              //拼音导航
                              $('.' + gzSelAddrSzm + ', .letter').remove();
                              gzSelAddr.append('<div class="'+gzSelAddrSzm+'"><ul>'+html1.join('')+'</ul></div>');

                              $('body').append('<div class="letter"></div>');

                              var szmHeight = $('.' + gzSelAddrSzm).height();
                              szmHeight = szmHeight > 380 ? 380 : szmHeight;

                              $('.' + gzSelAddrSzm).css('margin-top', '-' + szmHeight/2 + 'px');

                              $("#"+areaobj).addClass('gzaddr-szm-ul');

                            }else{
                              $('.' + gzSelAddrSzm).hide();
                            }

                            var aa = '';
                            if(gzAddrSeladdrActive.attr("data-any") == 1 && $("#"+areaobj).index() == 0){
                                aa = '<li data-id="0" class="n" data-just="1">不限</li>';
                            }
                            aa += areaList.join("");
                            $("#"+areaobj).html(aa);
                        }else{
                            if(gzAddrSeladdrActive.attr("data-just") == 1 && $("#"+areaobj).index() > 0){
                                $("#"+areaobj).html('<li data-id="'+gid+'" class="n" data-just="1">暂不选择</li>');
                            }else{
                                $("#"+areaobj).html('<li class="loading">'+data.info+'</li>');
                            }
                        }
                    },
                    error: function(){
                        $("#"+areaobj).html('<li class="loading">'+langData['siteConfig'][20][183]+'</li>');
                    }
                });

            }

            //隐藏选择地区浮动层&遮罩层
            ,hideNewAddrMask: function(){
      	        $('.save').show();
                setTimeout(function(){
                    gzAddress.removeClass('open');
                    gzAddNewObj.removeClass(gzSelAddrActive);
                    gzSelMask.fadeOut(500, function(){
                        $(window).scrollTop(gzScrollTop);
                    });
                    gzSelAddr.addClass(gzSelAddrHide);
                    $("body").removeClass("showAddr");
                }, 0)
            }

        }


    //选择收货地址
    gzAddrInit.showChooseAddr();



    //选择所在地区
    gzAddrSeladdr.bind("click", function(){
        toggleDragRefresh('off');
        gzAddrSeladdrActive = $(this);
        if(gzAddrSeladdrActive.hasClass("disabled")) return;
        gzScrollTop = $(window).scrollTop();
        gzAddNewObj.addClass(gzSelAddrActive);
        $("body").addClass("showAddr");
        gzSelMask.fadeIn();
        gzSelAddr.removeClass(gzSelAddrHide);
      	$('.save').hide();

        var t = $(this), ids = t.attr("data-ids"), id = t.attr("data-id"), addrname = t.find("dd p").text();



        //第一次点击
        if(ids == undefined && id == undefined){
            gzAddrInit.getAddrArea(0);

        //已有默认数据
        }else{
            //初始化区域
            ids = ids.split(" ");
            addrArr = addrname.split(" ");
            for (var i = 0; i < ids.length; i++) {
                gzAddrInit.gzAddrReset(i, ids, addrArr, i);
            }
            // $("#gzAddrArea"+id).show();
            // $(".gzAddrArea_"+id).show();
            gzSelAddrList.children("ul:last-child").show();

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
        var t = $(this), id = parseInt(t.attr("data-id")), addr = t.text(), lower = t.attr("data-lower"), par = t.closest("ul"), index = par.index(), just = t.attr("data-just");
        $('.' + gzSelAddrSzm).hide();
        if(id && addr){

            t.addClass("gz-curr").siblings("li").removeClass("gz-curr");

            // 暂不选择
            if(just == "1"){
                gzSelAddrNav.find("li:eq("+index+")").remove();

                var addrname = [], ids = [];

                //把子级清掉
                gzSelAddrNav.find("li:eq("+index+")").nextAll("li").remove();
                gzSelAddrList.find("ul:eq("+index+")").nextAll("ul").remove();


                gzSelAddrNav.find("li").each(function(){
                    addrname.push($(this).text());
                    ids.push($(this).attr("data-id"));
                });

                gzAddrSeladdrActive.removeClass("gz-no-sel").attr("data-ids", ids.join(" ")).attr("data-id", id).find("dd p").html(addrname.join(" "));
                gzAddrInit.hideNewAddrMask();

                gzAddrSeladdrActive.find('input').val(id);

            }else{

                gzSelAddrNav.find("li:eq("+index+")").attr("data-id", id).html("<span>"+addr+"</span>");

                //如果有下级
                if(lower != "0"){
                    //把子级清掉
                    gzSelAddrNav.find("li:eq("+index+")").nextAll("li").remove();
                    gzSelAddrList.find("ul:eq("+index+")").nextAll("ul").remove();

                    //新增一组
                    gzSelAddrNav.find("li:eq("+index+")").removeClass("gz-curr");
                    gzSelAddrNav.append('<li class="gz-curr"><span>'+langData['siteConfig'][7][2]+'</span></li>');

                    //获取新的子级区域
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

                    gzAddrSeladdrActive.removeClass("gz-no-sel").attr("data-ids", ids.join(" ")).attr("data-id", id).find("dd p").html(addrname.join(" "));
                    gzAddrInit.hideNewAddrMask();

                    gzAddrSeladdrActive.find('input').val(id);

                }
            }

        }else{
            gzAddrSeladdrActive.removeClass("gz-no-sel").attr("data-ids", '').attr("data-id", 0).find("dd p").html('不限');
            gzAddrInit.hideNewAddrMask();

            gzAddrSeladdrActive.find('input').val(0);
        }
    });

    //区域切换
    gzSelAddrNav.delegate("li", "touchend", function(){
        var t = $(this), index = t.index();
        t.addClass("gz-curr").siblings("li").removeClass("gz-curr");
        gzSelAddrList.find("ul").hide();
        gzSelAddrList.find("ul:eq("+index+")").show();
        if(index == 0){
          $('.' + gzSelAddrSzm).show();
        }else{
          $('.' + gzSelAddrSzm).hide();
        }
        gzSelAddrList.scrollTop(gzSelAddrList.find('ul:eq('+index+')').find('.gz-curr').position().top);
    });


    gzSelAddr.delegate("." + gzSelAddrSzm, "touchstart", function (e) {
        var navBar = $("." + gzSelAddrSzm);
        $(this).addClass("active");
        $('.letter').html($(e.target).html()).show();
        var width = navBar.find("li").width();
        var height = navBar.find("li").height();
        var touch = e.touches[0];
        var pos = {"x": touch.pageX, "y": touch.pageY};
        var x = pos.x, y = pos.y;
        $(this).find("li").each(function (i, item) {
            var offset = $(item).offset();
            var left = offset.left, top = offset.top;
            if (x > left && x < (left + width) && y > top && y < (top + height)) {
                var id = $(item).find('a').attr('data-id');
                var cityHeight = $('#'+id).position().top;
                gzSelAddrList.scrollTop(cityHeight);
                $('.letter').html($(item).html()).show();
            }
        });
    });

    gzSelAddr.delegate("." + gzSelAddrSzm, "touchmove", function (e) {
        var navBar = $("." + gzSelAddrSzm);
        e.preventDefault();
        var width = navBar.find("li").width();
        var height = navBar.find("li").height();
        var touch = e.touches[0];
        var pos = {"x": touch.pageX, "y": touch.pageY};
        var x = pos.x, y = pos.y;
        $(this).find("li").each(function (i, item) {
            var offset = $(item).offset();
            var left = offset.left, top = offset.top;
            if (x > left && x < (left + width) && y > top && y < (top + height)) {
                var id = $(item).find('a').attr('data-id');
                var cityHeight = $('#'+id).position().top;
                gzSelAddrList.scrollTop(cityHeight);
                $('.letter').html($(item).html()).show();
            }
        });
    });


    gzSelAddr.delegate("." + gzSelAddrSzm, "touchend", function () {
        $(this).removeClass("active");
        $(".letter").hide();
    })





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
