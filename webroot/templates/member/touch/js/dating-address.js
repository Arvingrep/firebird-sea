$(function(){
    var gzSelMask         = $(".gz-sel-addr-mask"),  //选择地区遮罩层
        gzSelAddr         = $("#gzSelAddr"),     //选择地区页
        gzAddNewObj       = $("#main"),   //主要部分
        gzSelAddrCloseBtn = $("#gzSelAddrCloseBtn"),  //关闭选择所在地区按钮
        gzSelAddrList     = $(".gz-sel-addr-list"),  //区域列表
        gzSelAddrNav      = $(".gz-sel-addr-nav"),  //区域TAB
        // gzAddrActive      = "gz-addr-active",  //地址选中样式
        gzSelAddrActive   = "gz-sel-addr-active",  //选择所在地区后页面下沉样式名
        gzSelAddrHide     = "gz-sel-addr-hide",  //选择所在地区浮动层隐藏样式名
        gzBackClass       = ".gz-addr-header-back",  //后退按钮样式名
        showErrTimer      = null,
        gzAddrEditId      = 0,   //修改地址ID
        ChoiceId = 0,
        gzAddrSeladdr = $(".CB_btn"),
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

            //获取区域
            ,getAddrArea: function(id){

                //如果是一级区域
                if(!id){
                    gzSelAddrNav.html('<li class="gz-curr"><span>'+langData['siteConfig'][7][2]+'</span></li>');
                    gzSelAddrList.html('');
                }

                var areaobj = "gzAddrArea"+id;
                if($("#"+areaobj).length == 0){
                    gzSelAddrList.append('<ul id="'+areaobj+'"><li class="loading">'+langData['siteConfig'][20][184]+'...</li></ul>');
                }

                gzSelAddrList.find("ul").hide();
                $("#"+areaobj).show();

                $.ajax({
                    url: masterDomain + "/include/ajax.php?service=dating&action=addr",
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
                    gzSelAddrList.append('<ul class="fn-hide" id="'+areaobj+'"><li class="loading">'+langData['siteConfig'][7][2]+'...</li></ul>');
                }

                $.ajax({
                    url: masterDomain + "/include/ajax.php?service=dating&action=addr",
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
                $('html').removeClass('bgblack');
                gzSelMask.fadeOut();
                gzSelAddr.addClass(gzSelAddrHide);
            },


            setAddrids: function(o){
              $.ajax({
                  url: masterDomain + "/include/ajax.php?service=dating&action=addr",
                  type: "GET",
                  dataType: "jsonp",
                  success: function (data) {
                      if(data && data.state == 100){
                          var list = data.info, areaList = [];
                          for (var i = 0, area, lower; i < list.length; i++) {
                              area = list[i];
                              if (o) {
                                var selarea = $("#citybtn").val();
                                if(selarea != ''){
                                    if(area.typename == selarea.split(' ')[0]){
                                        $("#citybtn").attr('data-ids',area.id+' '+$("#citybtn").attr('data-id'));
                                    }
                                }
                              }else{
                                var selarea = $("#citybtn_1").val();
                                if(selarea != ''){
                                    if(area.typename == selarea.split(' ')[0]){
                                        $("#citybtn_1").attr('data-ids',area.id+' '+$("#citybtn_1").attr('data-id'));
                                    }
                                }
                              }
                          }
                      }
                  }
              });
            }

        }

      $("#citybtn_1").click(function(){
           ChoiceId = 1;
      })
      $("#citybtn").click(function(){
           ChoiceId = 0;
      })


    //选择收货地址
    gzAddrInit.setAddrids(1);
    gzAddrInit.setAddrids();

    //选择所在地区
    gzAddrSeladdr.bind("click", function(){
        $('html').addClass('bgblack');
        gzAddNewObj.addClass(gzSelAddrActive);
        gzSelMask.fadeIn();
        gzSelAddr.removeClass(gzSelAddrHide);

        var t = $(this), ids = t.attr("data-ids"), id = t.attr("data-id"), addrname = t.val();

        //第一次点击
        if(ids == undefined){
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
                gzSelAddrNav.append('<li class="gz-curr"><span>'+langData['siteConfig'][7][2]+'</span></li>');

                //获取新的子级区域
                gzAddrInit.getAddrArea(id);

            //没有下级
            }else{

                var addrname = [], ids = [];
                gzSelAddrNav.find("li").each(function(){
                    addrname.push($(this).text());
                    ids.push($(this).attr("data-id"));
                });
                if (ChoiceId == 0) {
                  $("#citybtn").removeClass("gz-no-sel").attr("data-ids", ids.join(" ")).attr("data-id", id).find("dd").html(addrname.join(" "));
                  $("#citybtn").val(addrname.join(" "));
                  $('#addr').val(id);
                }else{
                  $("#citybtn_1").removeClass("gz-no-sel").attr("data-ids", ids.join(" ")).attr("data-id", id).find("dd").html(addrname.join(" "));
                  $("#citybtn_1").val(addrname.join(" "));
                  $('#addrid').val(id);
                }
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


});
