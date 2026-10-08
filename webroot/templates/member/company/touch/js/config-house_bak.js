$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

  $('#cityid').scroller(
    $.extend({
          preset: 'select',
      })
  );

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

    location.hash = "";
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
                url: masterDomain + "/include/ajax.php?service=shop&action=addr&store=1",
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
                  url: masterDomain + "/include/ajax.php?service=shop&action=addr",
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
              url: masterDomain+"/include/ajax.php?service=shop&action=circle&type="+id,
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

  // 表单提交
  $(".tjBtn").bind("click", function(event){

    event.preventDefault();

    var t           = $(this),
        cityid      = $("#cityid"),
        title       = $("#title"),
        address     = $("#address"),
        tel         = $("#tel"),
        cityid      = $('#cityid');

    if(t.hasClass("disabled")) return;

    //区域
    if($.trim(cityid.val()) == "" || cityid.val() == 0){
      alert(langData['siteConfig'][20][585]);
      return
    }

    //公司名称
    if($.trim(title.val()) == ''){
        alert(langData['siteConfig'][19][174]);
        return
    }

    //联系电话
    if($.trim(tel.val()) == "" || tel.val() == 0){
            alert(langData['siteConfig'][20][412]);
            return
    }

    //地址
    if($.trim(address.val()) == "" || address.val() == 0){
        alert(langData['siteConfig'][20][69]);
        return
    }

    //logo
    var imgli = $("#fileList1 li");
    if(imgli.length <= 1){
      $('#litpic').val('');
    }else{
      $('#litpic').val(imgli.eq(1).find('img').attr('data-val'));
    }



    var form = $("#fabuForm"), action = form.attr("action");

    $.ajax({
      url: action,
      data: form.serialize(),
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){
                    alert(langData['siteConfig'][6][39])

        }else{
                    alert(data.info)
        }
      },
      error: function(){
        alert(langData['siteConfig'][20][183]);
      }
    });


  });

})





// function gettype(id,sname){
//   $.ajax({
//     url: "/include/ajax.php?service=shop&action=type&type="+id,
//     type: "GET",
//     dataType: "json",
//     success: function (data) {
//       if(data && data.state == 100){
//         var list = [], info = data.info;
//         list.push('<option value="0"><a href="javascript:;">请选择</a></option>');
//         for(var i = 0; i < info.length; i++){
//           var selected = '';
//           if(sname != undefined && $.trim(sname) == $.trim(info[i].typename)){
//             selected = ' selected="selected"';
//           }
//           list.push('<option value="'+info[i].id+'"'+selected+'><a href="javascript:;">'+info[i].typename+'</a></option>');
//         }
//         $(".area2").html(list.join("")).show();
//       }
//     }
//   });
// }


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
