$(function(){
    //APP端取消下拉刷新
    toggleDragRefresh('off');

    // 顶部导航栏tab切换
    $(".nav_tab ul li").click(function(){
        var x = $(this), index = x.index();
        x.addClass('navBC').siblings().removeClass('navBC');
        $('.navList .navBox').eq(index).show().siblings().hide();
    });

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
        gzAddrHeaderBtn   = $(".gz-addr-header-btn"),  //删除按钮
        gzAddrListObj     = $(".gz-addr-list"),  //地址列表
        gzAddNewObj       = $(".mask_box"),   //新增地址页
        gzSelAddr         = $("#gzSelAddr"),     //选择地区页
        gzSelMask         = $(".gz-sel-addr-mask"),  //选择地区遮罩层
        gzAddrSeladdr     = $(".addr"),  //选择所在地区按钮
        gzSelAddrCloseBtn = $("#gzSelAddrCloseBtn"),  //关闭选择所在地区按钮
        gzSelAddrList     = $(".gz-sel-addr-list"),  //区域列表
        gzSelAddrNav      = $(".gz-sel-addr-nav"),  //区域TAB
        gzSelAddrSzm      = "gz-sel-addr-szm",  //城市首字母筛选
        gzSelAddrActive   = "gz-sel-addr-active",  //选择所在地区后页面下沉样式名
        gzSelAddrHide     = "gz-sel-addr-hide",  //选择所在地区浮动层隐藏样式名
        showErrTimer      = null,
        gzAddrEditId      = 0,   //修改地址ID
        businessbtn       = $(".BusinessInput"),   //选择商圈按钮
        businessbtnHide   = "QuanBox_hide",  //选择商圈隐藏样式名
        businessBox       = $(".QuanBox"),  //选择商圈层
        busBoxCloseBtn    = $(".QuanTitle_close"),  //关闭选择所在地区按钮
        busBoxSureBtn     = $(".Quan_SureBtn"),  //确定所在地区按钮
        Subwaybtn       = $(".SubweyIupt"),   //选择地铁按钮
        SubwayBox       = $(".SubwayBox "),  //选择地铁层
        SubwaybtnHide   = "Subway_hide",  //选择地铁隐藏样式名
        SubwayCloseBtn    = $(".Subway_close"),  //关闭选择地铁按钮
        SubwaySureBtn     = $(".Subway_SureBtn"),  //确定所在地区按钮
        lng               = "",
        lat               = "",

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
                url: masterDomain + "/include/ajax.php?service=pension&action=addr&store=1",
                data: "type="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                  if(data && data.state == 100){
                      var list = data.info, areaList = [], hotList = [], cityArr = [], hotCityHtml = [], html1 = [];
                      for (var i = 0, area, lower; i < list.length; i++) {
                          area = list[i];
                          lower = area.lower == undefined ? 0 : area.lower;

                          var pinyin = list[i].pinyin.substr(0,1);
                          if(cityArr[pinyin] == undefined){
                            cityArr[pinyin] = [];
                          }
                          cityArr[pinyin].push(list[i]);

                          areaList.push('<li data-id="'+area.id+'" data-lower="1"'+(!lower ? 'class="n"' : '')+'>'+area.typename+'</li>');
                      }

                      //如果是一级区域，并且区域总数量大于20个时，将采用首字母筛选样式
                      if(list.length > 20){
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
                          hotList.unshift('<li class="table-tit table-tit-hot" id="hot">'+langData['siteConfig'][37][79]+'</li>');//热门
                          html1.unshift('<li><a href="javascript:;" data-id="hot">'+langData['siteConfig'][37][79]+'</a></li>');//热门

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
                    $("#"+areaobj).html('<li class="loading">'+data.info+'</li>');
                  }
                },
                error: function(){
                  $("#"+areaobj).html('<li class="loading">'+langData['siteConfig'][20][184]+'</li>');
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

              var areaobj = "gzAddrArea"+id;
              if($("#"+areaobj).length == 0){
                  gzSelAddrList.append('<ul class="fn-hide" id="'+areaobj+'"><li class="loading">'+langData['siteConfig'][20][184]+'...</li></ul>');
              }

              $.ajax({
                  url: masterDomain + "/include/ajax.php?service=pension&action=addr",
                  data: "type="+gid,
                  type: "GET",
                  dataType: "jsonp",
                  success: function (data) {
                      if(data && data.state == 100){
                          var list = data.info, areaList = [], hotList = [], cityArr = [], hotCityHtml = [], html1 = [];
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
                              hotList.unshift('<li class="table-tit table-tit-hot" id="hot">'+langData['siteConfig'][37][79]+'</li>');//热门
                              html1.unshift('<li><a href="javascript:;" data-id="hot">'+langData['siteConfig'][37][79]+'</a></li>');//热门

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
                          $("#"+areaobj).html('<li class="loading">'+data.info+'</li>');
                      }
                  },
                  error: function(){
                      $("#"+areaobj).html('<li class="loading">'+langData['siteConfig'][20][183]+'</li>');
                  }
              });

            }


            ,getSecondAddrArea: function(id){

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
                      url: masterDomain + "/include/ajax.php?service=siteConfig&action=area&type="+id,
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
                              $("#"+areaobj).html('<li class="loading">'+langData['siteConfig'][20][184]+'</li>');
                      }
              });

            }

            //隐藏选择地区浮动层&遮罩层
            ,hideNewAddrMask: function(){
              gzAddNewObj.removeClass(gzSelAddrActive);
              gzSelMask.fadeOut();
              gzSelAddr.addClass(gzSelAddrHide);
            }

            // 获取商圈信息
            ,QuanList :function(){
                var id = $('.addr').attr("data-id");
                if(!id) return;
                $.ajax({
        			url: masterDomain+"/include/ajax.php?service=pension&action=circle&type="+id,
        			type: "GET",
        			dataType: "jsonp",
        			success: function (data) {
        				if(data && data.state == 100){
        					var list = data.info, html = [];
        					for(var i = 0; i < list.length; i++){
                            	html.push('<li><label><em>'+list[i].name+'</em><div class="checkbox"><input type="checkbox" name="circle[]" data-name="'+list[i].name+'" value="'+list[i].id+'"><i class="checkBtn"></i></div></label></li>');
        					}
        					$(".QuanList ul").html(html.join(""));
        					$(".Business").show();

        				}else{
        					$(".QuanList ul").html("");
        					$(".Business").hide();
        				}
        			}
        		});
            }

            // 获取地铁信息
            ,SubwayList :function(id){
                // var id = $(this).attr("data-id");
                // if(!id) return;
                $.ajax({
                    url: masterDomain+"/include/ajax.php?service=siteConfig&action=subway&addrids="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        $(".SubwayNav").html("");
                        $(".SubChoice_box").html("");
                        if(data && data.state == 100){
                            var list = data.info, html = [];
                            for(var i = 0; i < list.length; i++){
                                $(".SubwayNav").append('<em>'+list[i].title+'</em>');
                                getSubwayStation(list[i].id, i);
                            }
                            $(".subwey").show();
                            $(".SubwayNav em").eq(0).addClass('subBC');
                        }else{
                            $(".subwey").hide();
                        }
                    }
                });
            }

    }
    // if ($("#lnglat").val() != "") {
    //     var lnglat = $("#lnglat").val().split(",");
    //     lng = lnglat[0];
    //     lat = lnglat[1];
    // }
    //获取地铁站点
    function getSubwayStation(cid, index){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=subwayStation&type="+cid,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var list = data.info, html = [],subway = [];
                    $('.SubChoice_box').append('<div class="SubChoice'+cid+' sub fn-clear"></div>')
                    for(var i = 0; i < list.length; i++){
                        html.push('<label><input type="checkbox" name="subway[]" data-name="'+list[i].title+'" value="'+list[i].id+'"><i class="SubCheckbtn"></i>'+list[i].title+'</label>');
                    }
                    $(".SubChoice"+cid+"").html(html.join(""));
                    $(".SubChoice_box .sub").eq(0).show().siblings().hide();
                }
            }
        });
    }


    //选择地址
    gzAddrListObj.delegate("article .gz-linfo", "click", function(){
            var t = $(this), par = t.parent(), id = par.attr("data-id"), people = par.attr("data-people"), contact = par.attr("data-contact"), addrid = par.attr("data-addrid"), addrids = par.attr("data-addrids"), addrname = par.attr("data-addrname"), address = par.attr("data-address");
            var data = {
                    "id": id,
                    "people": people,
                    "contact": contact,
                    "addrid": addrid,
                    "addrids": addrids,
                    "addrname": addrname,
                    "address": address
            }
    });

    //选择所在地区
    gzAddrSeladdr.bind("click", function(){
            gzAddNewObj.addClass(gzSelAddrActive);
            gzSelMask.fadeIn();
            gzSelAddr.removeClass(gzSelAddrHide);

            var t = $(this), ids = t.attr("data-ids"), id = t.attr("data-id"), addrname = t.text();

            //第一次点击
            if((ids == undefined && id == undefined) || (ids == '' && (id == '' || id == 0))){
                    gzAddrInit.getAddrArea(0);

            //已有默认数据
            }else{

                    //初始化区域
                    ids = ids.split(" ");
                    addrArr = addrname.split(" ");
                    for (var i = 0; i < ids.length; i++) {
                            gzAddrInit.gzAddrReset(i, ids, addrArr, i);
                    }
                    $("#gzAddrArea"+id).show();

            }

    });

    //关闭选择所在地区浮动层
    gzSelAddrCloseBtn.bind("touchend", function(){
            gzAddrInit.hideNewAddrMask();
    })
    //关闭选商圈浮动层
    busBoxCloseBtn.bind("touchend", function(){
            gzAddNewObj.removeClass(gzSelAddrActive);
            gzSelMask.fadeOut();
            businessBox.addClass(businessbtnHide);
    })
    //关闭选地铁浮动层
    SubwayCloseBtn.bind("touchend", function(){
            gzAddNewObj.removeClass(gzSelAddrActive);
            gzSelMask.fadeOut();
            SubwayBox.addClass(SubwaybtnHide);
    })
    //点击遮罩背景层关闭层
    gzSelMask.bind("touchend", function(){
            gzAddrInit.hideNewAddrMask();
            gzAddNewObj.removeClass(gzSelAddrActive);
            gzSelMask.fadeOut();
            businessBox.addClass(businessbtnHide);
            SubwayBox.addClass(SubwaybtnHide);
    });

    //选择区域
    gzSelAddrList.delegate("li", "click", function(){
            var t = $(this), id = t.attr("data-id"), addr = t.text(), lower = t.attr("data-lower"), par = t.closest("ul"), index = par.index();
            $('.' + gzSelAddrSzm).hide();
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
                            gzAddrInit.getSecondAddrArea(id);

                            // 加载地铁列表
                            // addrids = addrids.replace(/ /g, ',');
                            // gzAddrInit.SubwayList(addrids);
                            $('.subwey .SubweyIupt').text(langData['siteConfig'][7][2]);

                            $("#addrname0").val(addr);

                    //没有下级
                    }else{

                            var addrname = [], ids = [];
                            gzSelAddrNav.find("li").each(function(){
                                    addrname.push($(this).text());
                                    ids.push($(this).attr("data-id"));
                            });

                            gzAddrSeladdr.removeClass("gz-no-sel").attr("data-ids", ids.join(" ")).attr("data-id", id).html(addrname.join(" "));
                            $("#addrid").val(id);
                            $("#addrname1").val(addr);
                            gzAddrInit.hideNewAddrMask();
                            // 加载商圈列表
                            gzAddrInit.QuanList();
                            $('.Business .BusinessInput').text(langData['siteConfig'][7][2]);


                    }
                    // 加载地铁列表
                    var addrids = gzAddrSeladdr.attr("data-ids");
                    if(addrids != undefined && addrids != ''){
                        addrids = addrids.replace(/ /g, ',');
                        gzAddrInit.SubwayList(addrids);
                    }

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


    //选择商圈
    businessbtn.bind("click", function(){
            gzAddNewObj.addClass(gzSelAddrActive);
            gzSelMask.fadeIn();
            businessBox.removeClass(businessbtnHide);
    });

    //确认商圈
    busBoxSureBtn.bind("click",function(){
        var quanTxT = $(".QuanList").find("input:checked").attr('data-name');
        if (quanTxT != undefined) {
            $('.Business .BusinessInput').text(langData['siteConfig'][19][881]);
        }else{
            $('.Business .BusinessInput').text(langData['siteConfig'][7][2]);
        }
        gzAddNewObj.removeClass(gzSelAddrActive);
        gzSelMask.fadeOut();
        businessBox.addClass(businessbtnHide);
    })


    //展开地铁层
    Subwaybtn.bind("click", function(){
      gzAddNewObj.addClass(gzSelAddrActive);
      gzSelMask.fadeIn();
      SubwayBox.removeClass(SubwaybtnHide);
    });

    //切换地铁线路
    SubwayBox.delegate(".SubwayNav em", "click", function(){
            var t = $(this), index = t.index();
            t.addClass("subBC").siblings().removeClass("subBC");
            $('.SubChoice_box .sub').eq(index).show().siblings().hide();
    });

    //确认地铁
    SubwaySureBtn.bind("click",function(){
        var quanTxT = $(".SubChoice_box").find("input:checked").attr('data-name');
        if (quanTxT != undefined) {
            $('.subwey .SubweyIupt').text(langData['siteConfig'][19][881]);
        }else{
            $('.subwey .SubweyIupt').text(langData['siteConfig'][7][2]);
        }
        gzAddNewObj.removeClass(gzSelAddrActive);
        gzSelMask.fadeOut();
        SubwayBox.addClass(SubwaybtnHide);
    })


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

    var lng = "", lat = "";

	$("#map .lead p").bind("click", function() {
        $(".pageitem").hide();
    });


    if ($("#lnglat").val() != "") {
        var lnglat = $("#lnglat").val().split(",");
        lng = lnglat[0];
        lat = lnglat[1];
    }else{
      //第一次进入自动获取当前位置
        HN_Location.init(function(data){
            if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
            //   alert(langData['siteConfig'][27][137])   /* 定位失败，请重新刷新页面！ */ 
              lng = siteCityInfo_lng;
              lat = siteCityInfo_lat;

            }else{      
              lng = data.lng;
              lat = data.lat;

            }
          }, device.indexOf('huoniao') > -1 ? false : true);
    }
    $(".LoTitle").bind("click", function(){
        $(".pageitem").hide();
        $('#map').show();

        //百度
        if(site_map == 'baidu') {
            var myGeo = new BMap.Geocoder();

            if(lng != '' && lat != ''){  
                //定位地图
                map = new BMap.Map("mapdiv");
                var mPoint = new BMap.Point(lng, lat);
                map.centerAndZoom(mPoint, 16);
                getLocation(mPoint);

                map.addEventListener("dragend", function (e) {
                    getLocation(e.point);
                });
            }

            //关键字搜索
            var autocomplete = new BMap.Autocomplete({input: "searchAddr"});
            autocomplete.addEventListener("onconfirm", function (e) {
                var _value = e.item.value;
                myValue = _value.province + _value.city + _value.district + _value.street + _value.business;

                var options = {
                    onSearchComplete: function (results) {
                        // 判断状态是否正确
                        if (local.getStatus() == BMAP_STATUS_SUCCESS) {
                            var s = [];
                            for (var i = 0; i < results.getCurrentNumPois(); i++) {
                                if (i == 0) {
                                    lng = results.getPoi(i).point.lng;
                                    lat = results.getPoi(i).point.lat;
                                    $("#local strong").html(_value.business);
                                    $("#lnglat").val(lng + ',' + lat);
                                    $(".pageitem").hide();
                                }
                            }
                        } else {
                            alert(langData['siteConfig'][20][431]);
                        }
                    }
                };
                var local = new BMap.LocalSearch(map, options);
                local.search(myValue);

            });

            //周边检索
            function getLocation(point){
                myGeo.getLocation(point, function mCallback(rs) {
                    var allPois = rs.surroundingPois;
                    if (allPois == null || allPois == "") {
                        return;
                    }
                    var list = [];
                    for (var i = 0; i < allPois.length; i++) {
                        list.push('<li data-lng="' + allPois[i].point.lng + '" data-lat="' + allPois[i].point.lat + '"><h5>' + allPois[i].title + '</h5><p>' + allPois[i].address + '</p></li>');
                    }

                    if (list.length > 0) {
                        $(".mapresults ul").html(list.join(""));
                        $(".mapresults").show();
                    }

                }, {
                    poiRadius: 1000,  //半径一公里
                    numPois: 50
                });
            }


            //高德
        }else if(site_map == 'amap'){

            var map = new AMap.Map('mapdiv');

            if(lng != '' && lat != ''){
                map.setZoomAndCenter(14, [lng, lat]);
            }

            AMap.service('AMap.PlaceSearch',function(){//回调函数
                var placeSearch= new AMap.PlaceSearch();

                var s = function(){
                    if(lng != '' && lat != ''){
                        placeSearch.searchNearBy("", [lng, lat], 500, function(status, result) {
                            callback(result, status);
                        });
                    }else{
                        setTimeout(s,1000)
                    }
                }

                AMap.event.addListener(map ,"complete", function(status, result){
                    lnglat = map.getCenter();
                    lng = lnglat['lng'];
                    lat = lnglat['lat'];
                    console.log(lnglat);
                    s();
                });

                AMap.event.addListener(map ,"dragend", function(status, result){
                    lnglat = map.getCenter();
                    lng = lnglat['lng'];
                    lat = lnglat['lat'];
                    console.log(lnglat);
                    s();
                });

            })

            function callback(results, status) {
                if (status === 'complete' && results.info === 'OK') {
                    var list = [];
                    var allPois = results.poiList.pois;
                    for(var i = 0; i < allPois.length; i++){
                        list.push('<li data-lng="'+allPois[i].location.lng+'" data-lat="'+allPois[i].location.lat+'"><h5>'+allPois[i].name+'</h5><p>'+allPois[i].address+'</p></li>');
                    }
                    if(list.length > 0){
                        $(".mapresults ul").html(list.join(""));
                        $(".mapresults").show();
                    }
                }else{
                    $(".mapresults ul").html('');
                }
            }

            map.plugin('AMap.Autocomplete', function () {
                console.log('Autocomplete loading...')
                autocomplete = new AMap.Autocomplete({
                    input: "searchAddr"
                });
                // 选中地址
                AMap.event.addListener(autocomplete, 'select', function(result){
                    lng = result.poi.location.lng;
                    lat = result.poi.location.lat;
                    var r = result.poi.name ? result.poi.name : (result.poi.address ? result.poi.address : result.poi.district);

                    $("#local strong").html(r);
                    $("#lnglat").val(lng + ',' + lat);
                    $(".pageitem").hide();
                });
            });
      
        //天地图
        }else if(site_map == 'tmap'){
    
            var myGeo = new T.Geocoder();
    
            if(lng&&lat && $('#mapdiv').html() == ''){
                //定位地图
                map = new T.Map("mapdiv");
                var mPoint = new T.LngLat(lng, lat);
                map.centerAndZoom(mPoint, 16);
                getLocation(mPoint);
    
                map.addEventListener("dragend", function (e) {
                    getLocation(e.target.getCenter());
                });
            }
    
            var options = {
                pageCapacity: 10,
                onSearchComplete: function(result){
                    var list = [];
                    if(result.getPois().length > 0){
                        for(var i = 0; i < result.getPois().length; i++){
                            var lonlat = result.getPois()[i].lonlat.split(' ');
                            list.push('<li data-lng="'+lonlat[0]+'" data-lat="'+lonlat[1]+'"><h5>'+result.getPois()[i].name+'</h5><p>'+result.getPois()[i].address+'</p></li>');
                        }
                    }
                    if(list.length > 0){
                        $(".mapresults ul").html(list.join(""));
                        $(".mapresults").show();
                    }else{
                        $(".mapresults ul").html('');
                    }
                }
            };
            var local = new T.LocalSearch(map, options);
            cityInfo = JSON.parse(cfg_cityInfo);
    
            $("#searchAddr").bind('input', function(){
                local.search(cityInfo.name + $.trim($(this).val()), 1);
            })
    
            //周边检索
            function getLocation(point){
                myGeo.getLocation(point, function mCallback(rs) {
                    
                    var list = [];
                    list.push('<li data-lng="' + rs.location.lon + '" data-lat="' + rs.location.lat + '"><h5>' + rs.addressComponent.poi + '</h5><p>' + rs.addressComponent.address + '</p></li>');
    
                    if (list.length > 0) {
                        $(".mapresults ul").html(list.join(""));
                        $(".mapresults").show();
                    }
    
                });
            }

        //谷歌    
        }else if(site_map == 'google'){
          if ($("#lnglat").val() != "") {
              var lnglat = $("#lnglat").val().split(",");
              lng = lnglat[0];
              lat = lnglat[1];
          }         
          businessgooleMap(lng,lat);//公共touchScale中
        }

    });


	//点击检索结果
	$(".mapresults").delegate("li", "click", function(){
		var t = $(this), title = t.find("h5").text() ,title1 = t.find("p").text();
		lng = t.attr("data-lng");
		lat = t.attr("data-lat");
		$("#address").val(""+title1+""+title+"" );
        $("#lnglat").val(""+lng+","+lat+"" )
        $('.pageitem').hide();
    });
    
    var currYear = (new Date()).getFullYear();
    var opt={};
    opt.date = {preset : 'date'};
    opt.datetime = {preset : 'datetime'};
    opt.time = {preset : 'time'};
    opt.default = {
      theme: 'android-holo light', //皮肤样式
      display: 'bottom', //显示方式
      mode: 'scroller', //日期选择模式
      dateFormat: 'yyyy-mm-dd',
      lang: 'zh',
      showNow: false,
      nowText: langData['siteConfig'][13][24],
      stepMinute: 1,
      minDate: new Date(),
      // defaultValue: [ new Date(2013, 6, 12), new Date(2013, 6, 18, 23, 59) ],
      startYear: currYear-10, //开始年份
    };
    var optDateTime = $.extend(opt['datetime'], opt['default']);
    var optTime = $.extend(opt['time'], opt['default']);
    $("#registration").mobiscroll(opt).datetime(opt);

    // 新增套餐内容
    $(".PackageList").delegate(".PackageBox_ADD","click",function(){
        var x = $(this), box = x.closest('.PackageBox_List').find('.PackageBox_LL'), id = x.data('id');
        if(id==1){
            box.append('<div class="PackageBox_de"><div class="PackageBox_littledel"></div><div class="PL_Name fn-clear"><em>'+langData['siteConfig'][19][84]+'</em><input type="text"class="tit"value=""></div><div class="PL_number"><em>'+langData['siteConfig'][42][38]+'</em><input class="desc"type="text"value=""><em>'+langData['siteConfig'][23][122]+'</em><input class="pric"type="text"value=""></div></div>');//类型--说明--费用
        }else if(id==2){
            box.append('<div class="PackageBox_de"><div class="PackageBox_littledel"></div><div class="PL_Name fn-clear"><em>'+langData['siteConfig'][42][52]+'</em><input type="text"class="tit"value=""></div><div class="PL_number"><em>'+langData['siteConfig'][19][428]+'</em><input class="desc"type="text"value=""><em>'+langData['siteConfig'][16][74]+'</em><input class="pric"type="text"value=""></div></div>');//服务类型--价格--备注
        }else if(id==3){
            box.append('<div class="PackageBox_de"><div class="PackageBox_littledel"></div><div class="PL_Name fn-clear"><em>'+langData['siteConfig'][23][122]+'</em><input type="text"class="tit"value=""></div><div class="PL_number"><em>'+langData['siteConfig'][42][67]+'</em><input class="price1"type="text"value=""><em>'+langData['siteConfig'][42][68]+'</em><input class="price2"type="text"value=""></div><div class="PL_number"><em>'+langData['siteConfig'][42][69]+'</em><input class="price3"type="text"value=""><em>'+langData['siteConfig'][42][70]+'</em><input class="price4"type="text"value=""></div><div class="PL_number"><em>'+langData['siteConfig'][42][71]+'</em><input class="price5"type="text"value=""></div></div>');//费用--完全自理--轻度失能--中度失能--重度失能--失智长者
        }
        
    });

    $(".PackageList").delegate(".PackageBox_littledel","click",function(){
        var x = $(this),
            box = x.closest('.PackageBox_de');
        if (confirm(langData['siteConfig'][20][211])==true){
            box.remove();
        }
    });

    $("input[name='catid[]']").bind("click", function(){
		$("input[name='catid[]']").each(function(){
			if($(this).val() == 1 || $(this).val() == 2 || $(this).val() == 3){
				if($(this).is(":checked")){
					if($(this).val() == 1){
						$(".catid1").show();
					}else if($(this).val() == 2){
						$(".catid2").show();
					}else if($(this).val() == 3){
						$(".catid3").show();
					}
				}else{
					if($(this).val() == 1){
						$(".catid1").hide();
					}else if($(this).val() == 2){
						$(".catid2").hide();
					}else if($(this).val() == 3){
						$(".catid3").hide();
					}
				}
			}
		});
	});

    // 提交
    $(".tjBtn").bind("click", function(event){

		event.preventDefault();
        $('#addrid').val($('.addr').attr('data-id'));
        var addrids = $('.addr').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
        var t           = $(this);

        if($("#title").val()==""){
            alert(langData['siteConfig'][45][96])//请输入标题！
            return
        }
        
        if($("#addrid").val()==""){
            alert(langData['siteConfig'][21][68])//请选择所在区域！
            return
        }
        
        //图集
        var imgList = ""
        $("#fileList1 li").each(function(){
            var x = $(this),
                u = x.index(),
                url = x.find('img').attr("data-val");
            if (u == 1) {
                $("#litpic").val(url)
            }
            if (url != undefined && u != 0) {
                imgList = imgList +','+ url;
            }
        })

        $("#imglist").val(imgList.substr(1));

        if($("#imglist").val()==""){
            alert(langData['siteConfig'][45][97])//请上传图片！
            return
        }

        var form = $("#fabuForm"), action = form.attr("action");
        t.addClass("disabled").find('a').html(langData['siteConfig'][6][35]+"...");
        
        var param = '';

    	$(".PackageList").find(".longexpenses").each(function(i){
            var longrzfee = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			longrzfee.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(longrzfee!=''){
				param = "&longexpenses="+longrzfee.join("|||");
			}
        });

        $(".PackageList").find(".longmouthfee").each(function(i){
            var longmouthfee = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			longmouthfee.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(longmouthfee!=''){
				param += "&longbedfee="+longmouthfee.join("|||");
			}
        });

        $(".PackageList").find(".longother").each(function(i){
            var longother = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			longother.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(longother!=''){
				param += "&longotherfees="+longother.join("|||");
			}
        });

        $(".PackageList").find(".shortrzfee").each(function(i){
            var shortrzfee = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			shortrzfee.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(shortrzfee!=''){
				param += "&shortexpenses="+shortrzfee.join("|||");
			}
        });

        $(".PackageList").find(".shortmouthfee").each(function(i){
            var shortmouthfee = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			shortmouthfee.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(shortmouthfee!=''){
				param += "&shortbedfee="+shortmouthfee.join("|||");
			}
        });

        $(".PackageList").find(".shortother").each(function(i){
            var shortother = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			shortother.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(shortother!=''){
				param += "&shortotherfees="+shortother.join("|||");
			}
        });

        $(".PackageList").find(".homecyfw").each(function(i){
            var homecyfw = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			homecyfw.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(homecyfw!=''){
				param += "&homecyfw="+homecyfw.join("|||");
			}
        });

        $(".PackageList").find(".homezlhl").each(function(i){
            var homezlhl = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			homezlhl.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(homezlhl!=''){
				param += "&homezlhl="+homezlhl.join("|||");
			}
        });

        $(".PackageList").find(".homejzfw").each(function(i){
            var homejzfw = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			homejzfw.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(homejzfw!=''){
				param += "&homejzfw="+homejzfw.join("|||");
			}
        });

        $(".PackageList").find(".homejsga").each(function(i){
            var homejsga = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			homejsga.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(homejsga!=''){
				param += "&homejsga="+homejsga.join("|||");
			}
        });

        $(".PackageList").find(".homejthd").each(function(i){
            var homejthd = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			homejthd.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(homejthd!=''){
				param += "&homejthd="+homejthd.join("|||");
			}
        });

        $(".PackageList").find(".hometlfw").each(function(i){
            var hometlfw = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			hometlfw.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(hometlfw!=''){
				param += "&hometlfw="+hometlfw.join("|||");
			}
        });

        $(".PackageList").find(".residentialcard").each(function(i){
            var residentialcard = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			residentialcard.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(residentialcard!=''){
				param += "&residentialcard="+residentialcard.join("|||");
			}
        });

        $(".PackageList").find(".residentialbedfee").each(function(i){
            var residentialbedfee = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != '' && pric != '' && desc!= '' && tit != undefined && pric != undefined && desc!= undefined){
	    			residentialbedfee.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
            });
            if(residentialbedfee!=''){
				param += "&residentialbedfee="+residentialbedfee.join("|||");
			}
        });

        $(".PackageList").find(".residentialoother").each(function(i){
            var residentialoother = [];
            $(this).find(".PackageBox_LL .PackageBox_de").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric1 = t.find(".pric1").val(), pric2 = t.find(".pric2").val(), pric3 = t.find(".pric3").val(), pric4 = t.find(".pric4").val(), pric5 = t.find(".pric5").val();
    			if(tit != '' && pric1 != '' && pric2!= '' && pric3 != '' && pric4!= '' && pric5 != '' && tit != undefined && pric1 != undefined && pric2!= undefined && pric3!= undefined && pric4!= undefined && pric5!= undefined){
	    			residentialoother.push(tit+"$$$"+pric1+"$$$"+pric2+"$$$"+pric3+"$$$"+pric4+"$$$"+pric5);
	    		}
            });
            if(residentialoother!=''){
				param += "&residentialotherfees="+residentialoother.join("|||");
			}
        });

        $.ajax({
			url: action,
			data: form.serialize() + param,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
                    alert(data.info);
					t.removeClass("disabled").find('a').html(langData['siteConfig'][6][63]);
				}else{
					alert(data.info);
					t.removeClass("disabled").find('a').html(langData['siteConfig'][6][63]);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").find('a').html(langData['siteConfig'][6][63]);
			}
		});


    });

})
