var action, objId = $('.house-list'), lei = 0;

$(function(){

  // 选择房源类型
  $('#payform #type').val(type);
  $('.house-type .cell').click(function(){
    var t = $(this), type = t.attr('data-type'), index = t.index();
    if (!t.hasClass('active')) {
      atpage = 1;
      t.addClass("active").siblings(".cell").removeClass("active");
      state = $('.house-tab .tab-box').removeClass('show').eq(index).addClass('show').children('a').attr('data-state');
      objId.html('');
      getList(1);
    }
    $('#payform #type').val(type);
    t.addClass('active').siblings('.cell').removeClass('active');
  })

  //选择房源信息状态
  $(".tab-box a").bind("click", function(){
    var t = $(this), id = t.attr("data-state"), type = $('.house-type .active').attr('data-type');
    if(!t.hasClass("active") && !t.hasClass('more')){
      state = id;
      atpage = 1;
      t.addClass("active").siblings("a").removeClass("active");
      objId.html('');
      getList(1);
    }else {
      $('.typebox, .mask').show();
      $('.typebox ul').hide();
      $('.'+type).show();
    }
  });

  // 选择整租、合租、出售等
  $('.typebox li').click(function(){
    $(this).addClass('active').siblings('li').removeClass('active');
  })

  $('.typebox .confirm').click(function(){
    objId.html('');
    getList(1);
    var tt = $('.house-type .active').data('type');
    var tit = $('.typebox .' + tt).find('.active').text();
    $('.house-tab .show a:eq(0)').find('span').html(tit ? tit : langData['siteConfig'][9][0]);
    $('.typebox, .mask').hide();
  })
  $('.mask').click(function(){
    $('.typebox, .mask').hide();
  })
  var M={};
  // 删除
  objId.delegate(".del", "click", function(){
    var t = $(this), par = t.closest(".house-box"), id = par.attr("data-id");
    if(id){

        M.dialog = jqueryAlert({
              'title'   : '',
              'content' : langData['siteConfig'][44][98],//确定要删除吗?
              'modal'   : true,
              'buttons' :{
                  '是' : function(){
                      M.dialog.close();
                      $.ajax({
                          url: masterDomain+"/include/ajax.php?service=house&type="+type+"&action=del&id="+id,
                          type: "GET",
                          dataType: "jsonp",
                          success: function (data) {
                            if(data && data.state == 100){
                              console.log(data)
                              //删除成功后移除信息层并异步获取最新列表
                              objId.html('');
                              getList(1);

                            }else{
                              alert(data.info);
                              t.siblings("a").show();
                              t.removeClass("load");
                            }
                          },
                          error: function(){
                            alert(langData['siteConfig'][20][183]);
                            t.siblings("a").show();
                            t.removeClass("load");
                          }
                        });
                  },
                  '否' : function(){
                      M.dialog.close();
                  }
              }
        })
    }
  });



  //刷新
  objId.delegate('.refresh', 'click', function(){
    var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
    if(!t.hasClass('disabled')){
      refreshTopFunc.init('refresh', 'house', type, id, t, title);
    }
  });


  //置顶
  objId.delegate('.topping', 'click', function(){
    var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
    refreshTopFunc.init('topping', 'house', type, id, t, title);
  });



  // 发布
  $('#fabubtn').click(function(){
    var box = $('.fabuBox');
    if (!box.hasClass('open')) {
      $('body,html').bind('touchmove', function(e){e.preventDefault();})
      box.addClass('open');
      $('.bg_1').addClass('show');
    }else {
      $('body,html').unbind('touchmove')
      box.removeClass('open');
      $('.bg_1').removeClass('show');
    }
  })

  $('.fabuBox .cancel').click(function(){
    $('.fabuBox').addClass('close');
    setTimeout(function(){
      $('body,html').unbind('touchmove');
      $('.fabuBox').removeClass('open close');
      $('.bg_1').removeClass('show');
    }, 600)
  })




  // 下拉加载
  $(window).scroll(function() {
    var h = $('.house-box').height();
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - w - h;
    if ($(window).scrollTop() > scroll && !isload) {
      atpage++;
      getList();
    };
  });

  getList(1);


  var Stype = location.hash.replace('#', '');
  if(Stype == 'fabu') {
    $('#fabubtn').click();
  }

})


// 获取房屋列表
function getList(is){
  isload = true;
  if(is != 1){}
  objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

  if(type=="sale"){
    action = "saleList";
  }else if(type=="zu"){
    action = "zuList";
  }else if(type=="xzl"){
    action = "xzlList";
  }else if(type=="sp"){
    action = "spList";
  }else if(type=="cf"){
    action = "cfList";
  }else if(type=="cw"){
    action = "cwList";
  }

  $.ajax({
    url: masterDomain+"/include/ajax.php?service=house&action="+action+"&u=1&orderby=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
    type: "GET",
    dataType: "jsonp",
    success: function (data) {
      if(data && data.state != 200){
        if(data.state == 101){
          objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
        }else{
          var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
          let clsNm_hide = typeof(cfg_iosVirtualPaymentState) != 'undefined' && cfg_iosVirtualPaymentState == 1 ? 'iosVirtualPaymentHide' : ''; //是否禁用ios微信端的支付功能  如禁用 则隐藏  
          //拼接列表
          if(list.length > 0){

            var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
            var param = t + "do=edit&type="+type+"&id=";
            var urlString = editUrl + param;

            for(var i = 0; i < list.length; i++){
              var item        = [],
                  id          = list[i].id,
                  title       = list[i].title,
                  community   = list[i].community,
                  addr        = list[i].addr,
                  price       = list[i].price,
                  url         = list[i].url,
                  litpic      = list[i].litpic,
                  protype     = list[i].protype,
                  room        = list[i].room,
                  bno         = list[i].bno,
                  floor       = list[i].floor,
                  area        = list[i].area,
                  isbid       = parseInt(list[i].isbid),
                  bid_type    = list[i].bid_type,
                  bid_price   = list[i].bid_price,
                  bid_end     = huoniao.transTimes(list[i].bid_end, 1),
                  bid_plan    = list[i].bid_plan,
                  waitpay     = list[i].waitpay,
                  refreshSmart     = list[i].refreshSmart,
                  pubdate     = huoniao.transTimes(list[i].pubdate, 1);

              addr = addr[addr.length - 2] + ' ' + addr[addr.length - 1];

              url = waitpay == "1" || list[i].state != "1" ? 'javascript:;' : url;

              //智能刷新
              if(refreshSmart){
                refreshCount = list[i].refreshCount;
                refreshTimes = list[i].refreshTimes;
                refreshPrice = list[i].refreshPrice;
                refreshBegan = huoniao.transTimes(list[i].refreshBegan, 1);
                refreshNext = huoniao.transTimes(list[i].refreshNext, 1);
                refreshSurplus = list[i].refreshSurplus;
              }

              //求租
              if(type == "qzu" || type == "qgou"){

                var action = list[i].action;

                html.push('<div class="item qiu fn-clear" data-id="'+id+'">');
                html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
                html.push('<div class="i">');

                var state = "";
                if(list[i].state == "0"){
                  state = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';
                }else if(list[i].state == "2"){
                  state = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';
                }

                var protype = "";
                switch(action){
                  case "1":
                    protype = langData['siteConfig'][19][764];
                    break;
                  case "2":
                    protype = langData['siteConfig'][19][218];
                    break;
                  case "3":
                    protype = langData['siteConfig'][19][219];
                    break;
                  case "4":
                    protype = langData['siteConfig'][19][220];
                    break;
                  case "5":
                    protype = langData['siteConfig'][19][221];
                    break;
                  case "6":
                    protype = langData['siteConfig'][19][222];
                    break;
                }

                html.push('<p>'+langData['siteConfig'][19][84]+'：'+protype+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][8]+'：'+addr+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][11][8]+'：'+huoniao.transTimes(pubdate, 1)+state+'</p>');
                html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');
                html.push('</div>');
                html.push('</div>');

              //二手房
              }else if(type == "sale"){

                var unitprice   = list[i].unitprice;

                html.push('<div class="house-box item" data-id="'+id+'" data-title="'+title+'">');
                if(waitpay == "0"){
                  html.push('<div class="title">');
                  var apa = [];
                  html.push('<span style="color:#919191;font-size: .24rem;">'+langData['siteConfig'][11][8]+'：'+pubdate+'</span>');

                  if(list[i].state == "0"){
                     html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][19][556]+'</span>');
                  }else if(list[i].state == "1"){
                     if(!isbid){
                       
                        html.push('<a href="javascript:;" class="topping '+ clsNm_hide +'">'+langData['siteConfig'][44][99]+'<s></s></a>');//开通置顶
                      }
                      if(refreshSmart || isbid == 1){
                          if(isbid && bid_type == 'plan'){
                              html.push('<p class="topPlanDetail topcommon" data-module="house_sale" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');//查看详情 -- 已开通计划置顶
                          }
                          if(isbid && bid_type == 'normal'){
                              html.push('<p class="topcommon">'+langData['siteConfig'][44][100]+'</p>');//已开通普通置顶
                          }
                      }
                  }else if(list[i].state == "2"){
                      html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][9][35]+'</span>');
                  }
                  html.push('</div>');
                }
                html.push('<div class="house-item fn-clear">');
                if(litpic != "" && litpic != undefined){
                  html.push('<div class="house-img fn-left">');
                  html.push('<a href="'+url+'">');
                  html.push('<img onerror="this.src=\''+litpic+'\'" src="'+huoniao.changeFileSize(litpic, "small")+'" />');
                  html.push('</a>');
                  html.push('</div>');
                }
                html.push('<dl>');
                html.push('<a href="'+url+'">');
                html.push('<dt>'+title+'</dt>');
                html.push('<dd class="item-area"><em class="sp_room">'+room+'</em><em class="sp_area">'+area+echoCurrency('areasymbol')+'</em><span class="price fn-right">'+price+langData['siteConfig'][13][27]+echoCurrency('short')+'</span></dd>');
                html.push('</a>');
                html.push('</dl>');
                html.push('</div>');

                if(refreshSmart || isbid == 1){
                    html.push('<div class="sd">');
                    if(refreshSmart){
                      html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][28]+'</span> — <span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][45][2]+'，'+langData['siteConfig'][45][1].replace('1','<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>')+'，'+langData['siteConfig'][45][0].replace('1','<span class="SurplusRefreshCount">'+refreshSurplus+'</span>')+'</font></p>');//智能刷新 -- 后刷新--已刷新1次--剩余1次
                    }
                    if(isbid && bid_type == 'normal'){
                        html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][41][57]+'</span> — <span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+' </span></p>');//普通置顶 -- 结束
                    }
                    if(isbid && bid_type == 'plan'){

                        //记录置顶详情
                        topPlanData['house_sale'] = Array.isArray(topPlanData['house_sale']) ? topPlanData['house_sale'] : [];
                        topPlanData['house_sale'][id] = bid_plan;
                        var plan_end = bid_plan[bid_plan.length-1]['date'];

                        html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][39]+'</span> — <span class="topEndTime">'+plan_end+langData['siteConfig'][6][163]+'</span></p>');//计划置顶 -- 结束
                    }
                    html.push('</div>');
                }

                html.push('<div class="o fn-clear">');
                if(waitpay == "1"){
                  html.push('<a href="javascript:;" class="delayPay pay_btn">'+langData['siteConfig'][19][327]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                }else{
                  if(list[i]['state'] == 1){
                    if(!refreshSmart){
                      html.push('<a href="javascript:;" class="refresh '+ clsNm_hide +'">'+langData['siteConfig'][16][70]+'</a>');//刷新
                    }else{
                        html.push('<a href="javascript:;" class="refresh disabled">'+langData['siteConfig'][45][3]+'</a>');//已设置刷新
                    }
                  }
                  html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a>');
                  if(!refreshSmart && !isbid){
                    html.push('<a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                  }
                }
                html.push('</div>');




                // if(refreshSmart || isbid == 1){
                //  html.push('<div class="sd">');
                //  if(refreshSmart){
                //    html.push('<p><font color="#ff6600">已开通智能刷新，下次刷新时间：'+refreshNext+'，已刷新'+(refreshCount-refreshSurplus)+'次，剩余'+refreshSurplus+'次</font></p>');
                //  }
                //  if(isbid && bid_type == 'normal'){
                //    html.push('<p><font color="#ff6600">已开通置顶，结束时间：'+bid_end+'</font></p>');
                //  }
                //  if(isbid && bid_type == 'plan'){
                //    var topPlanArr = [];
                //    for (var p = 0; p < bid_plan.length; p++) {
                //      var state = !bid_plan[p].state ? 'disabled' : '';
                //      topPlanArr.push('<span class="'+state+'">' + bid_plan[p].date + ' ' + bid_plan[p].week + '（'+(bid_plan[p].type == 'all' ? '全天' : '早8点-晚8点')+'）</span>');
                //    }
                //    html.push('<p><font color="#ff6600">已开通计划置顶，明细：'+topPlanArr.join('、')+'</font></p>');
                //  }
                //  html.push('</div>');
                // }

                html.push('</div>');

              //出租房
              }else if(type == "zu"){

                var zhuangxiu = list[i].zhuangxiu,
                    rentype   = list[i].rentype;

                html.push('<div class="house-box item" data-id="'+id+'" data-title="'+title+'">');
                if(waitpay == "0"){
                  html.push('<div class="title">');
                  var apa = [];
                  html.push('<span style="color:#919191;font-size: .24rem;">'+langData['siteConfig'][11][8]+'：'+pubdate+'</span>');

                  if(list[i].state == "0"){
                     html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][19][556]+'</span>');
                  }else if(list[i].state == "1"){
                     if(!isbid){
                        html.push('<a href="javascript:;" class="topping '+ clsNm_hide +'">'+langData['siteConfig'][44][99]+'<s></s></a>');//开通置顶
                      }
                      if(refreshSmart || isbid == 1){
                          if(isbid && bid_type == 'plan'){
                              html.push('<p class="topPlanDetail topcommon" data-module="house_zu" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');//查看详情 -- 已开通计划置顶
                          }
                          if(isbid && bid_type == 'normal'){
                              html.push('<p class="topcommon">'+langData['siteConfig'][44][100]+'</p>');//已开通普通置顶
                          }
                      }
                  }else if(list[i].state == "2"){
                      html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][9][35]+'</span>');
                  }
                  html.push('</div>');
                }
                html.push('<div class="house-item fn-clear">');
                if(litpic != "" && litpic != undefined){
                  html.push('<div class="house-img fn-left">');
                  html.push('<a href="'+url+'">');
                  html.push('<img onerror="this.src=\''+litpic+'\'" src="'+huoniao.changeFileSize(litpic, "small")+'" />');
                  html.push('</a>');
                  html.push('</div>');
                }
                html.push('<dl>');
                html.push('<a href="'+url+'">');
                html.push('<dt>'+title+'</dt>');
                html.push('<dd class="item-area"><em class="sp_type">'+rentype+'</em><em class="sp_room">'+room+'</em><em>'+area+echoCurrency('areasymbol')+'</em><span class="price fn-right">'+price+echoCurrency('short')+'/月</span></dd>');
                html.push('</a>');
                html.push('</dl>');
                html.push('</div>');

                if(refreshSmart || isbid == 1){
                    html.push('<div class="sd">');
                    if(refreshSmart){
                      html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][28]+'</span> — <span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][45][2]+'，'+langData['siteConfig'][45][1].replace('1','<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>')+'，'+langData['siteConfig'][45][0].replace('1','<span class="SurplusRefreshCount">'+refreshSurplus+'</span>')+'</font></p>');//智能刷新 -- 后刷新--已刷新1次--剩余1次
                    }

                    if(isbid && bid_type == 'normal'){
                        html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][41][57]+'</span> — <span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+' </span></p>');//普通置顶 -- 结束

                    }
                    if(isbid && bid_type == 'plan'){

                        //记录置顶详情
                        topPlanData['house_zu'] = Array.isArray(topPlanData['house_zu']) ? topPlanData['house_zu'] : [];
                        topPlanData['house_zu'][id] = bid_plan;
                        var plan_end = bid_plan[bid_plan.length-1]['date'];

                        html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][39]+'</span> — <span class="topEndTime">'+plan_end+langData['siteConfig'][6][163]+'</span></p>');//计划置顶 -- 结束

                    }
                    html.push('</div>');
                }

                html.push('<div class="o fn-clear">');
                if(waitpay == "1"){
                  html.push('<a href="javascript:;" class="delayPay pay_btn">'+langData['siteConfig'][19][327]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                }else{
                  if(list[i]['state'] == 1){
                    if(!refreshSmart){
                      html.push('<a href="javascript:;" class="refresh  '+ clsNm_hide +'">'+langData['siteConfig'][16][70]+'</a>');//刷新
                    }else{
                      html.push('<a href="javascript:;" class="refresh disabled">'+langData['siteConfig'][45][3]+'</a>');//已设置刷新
                    }
                  }
                  html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a>');
                  if(!refreshSmart && !isbid){
                    html.push('<a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                  }
                }
                html.push('</div>');



                // if(refreshSmart || isbid == 1){
                //  html.push('<div class="sd">');
                //  if(refreshSmart){
                //    html.push('<p><font color="#ff6600">已开通智能刷新，下次刷新时间：'+refreshNext+'，已刷新'+(refreshCount-refreshSurplus)+'次，剩余'+refreshSurplus+'次</font></p>');
                //  }
                //  if(isbid && bid_type == 'normal'){
                //    html.push('<p><font color="#ff6600">已开通置顶，结束时间：'+bid_end+'</font></p>');
                //  }
                //  if(isbid && bid_type == 'plan'){
                //    var topPlanArr = [];
                //    for (var p = 0; p < bid_plan.length; p++) {
                //      var state = !bid_plan[p].state ? 'disabled' : '';
                //      topPlanArr.push('<span class="'+state+'">' + bid_plan[p].date + ' ' + bid_plan[p].week + '（'+(bid_plan[p].type == 'all' ? '全天' : '早8点-晚8点')+'）</span>');
                //    }
                //    html.push('<p><font color="#ff6600">已开通计划置顶，明细：'+topPlanArr.join('、')+'</font></p>');
                //  }
                //  html.push('</div>');
                // }

                html.push('</div>');


              //写字楼
              }else if(type == "xzl"){

                var loupan = list[i].loupan;

                html.push('<div class="house-box item" data-id="'+id+'" data-title="'+title+'">');
                if(waitpay == "0"){
                  html.push('<div class="title">');
                  var apa = [];
                  html.push('<span style="color:#919191;font-size: .24rem;">'+langData['siteConfig'][11][8]+'：'+pubdate+'</span>');

                  if(list[i].state == "0"){
                     html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][19][556]+'</span>');
                  }else if(list[i].state == "1"){
                     if(!isbid){
                        html.push('<a href="javascript:;" class="topping '+ clsNm_hide +'">'+langData['siteConfig'][44][99]+'<s></s></a>');//开通置顶
                      }
                      if(refreshSmart || isbid == 1){
                          if(isbid && bid_type == 'plan'){
                              html.push('<p class="topPlanDetail topcommon" data-module="house_xzl" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');//查看详情 -- 已开通计划置顶
                          }
                          if(isbid && bid_type == 'normal'){
                              html.push('<p class="topcommon">'+langData['siteConfig'][44][100]+'</p>');//已开通普通置顶
                          }
                      }
                  }else if(list[i].state == "2"){
                      html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][9][35]+'</span>');
                  }
                  html.push('</div>');
                }
                html.push('<div class="house-item fn-clear">');
                if(litpic != "" && litpic != undefined){
                  html.push('<div class="house-img fn-left">');
                  html.push('<a href="'+url+'">');
                  html.push('<img onerror="this.src=\''+litpic+'\'" src="'+huoniao.changeFileSize(litpic, "small")+'" />');
                  html.push('</a>');
                  html.push('</div>');
                }
                html.push('<dl>');
                html.push('<a href="'+url+'">');
                html.push('<dt>'+title+'</dt>');

                var _type = p = "";
                if(list[i].type==0){
                  _type = langData['siteConfig'][19][109];//出租
                  p = echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•'+langData['siteConfig'][40][45];//月
                }else{
                  _type = langData['siteConfig'][19][110];//出售
                  p = langData['siteConfig'][13][27]+echoCurrency('short')+'';
                }
                html.push('<dd class="item-area"><em class="sp_type">'+_type+'</em><em>'+area+echoCurrency('areasymbol')+'</em><span class="price fn-right">'+price+p+'</span></dd>');
                html.push('</a>');
                html.push('</dl>');
                html.push('</div>');

                if(refreshSmart || isbid == 1){
                    html.push('<div class="sd">');
                    if(refreshSmart){
                      html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][28]+'</span> — <span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][45][2]+'，'+langData['siteConfig'][45][1].replace('1','<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>')+'，'+langData['siteConfig'][45][0].replace('1','<span class="SurplusRefreshCount">'+refreshSurplus+'</span>')+'</font></p>');//智能刷新 -- 后刷新--已刷新1次--剩余1次
                    }
                    if(isbid && bid_type == 'normal'){
                        html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][41][57]+'</span> — <span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+' </span></p>');//普通置顶 -- 结束
                    }
                    if(isbid && bid_type == 'plan'){

                        //记录置顶详情
                        topPlanData['house_xzl'] = Array.isArray(topPlanData['house_xzl']) ? topPlanData['house_xzl'] : [];
                        topPlanData['house_xzl'][id] = bid_plan;
                        var plan_end = bid_plan[bid_plan.length-1]['date'];

                        html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][39]+'</span> — <span class="topEndTime">'+plan_end+langData['siteConfig'][6][163]+'</span></p>');//计划置顶 -- 结束
                    }
                    html.push('</div>');
                }

                html.push('<div class="o fn-clear">');
                if(waitpay == "1"){
                  html.push('<a href="javascript:;" class="delayPay pay_btn">'+langData['siteConfig'][19][327]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                }else{
                  if(list[i]['state'] == 1){
                    if(!refreshSmart){
                      html.push('<a href="javascript:;" class="refresh  '+ clsNm_hide +'">'+langData['siteConfig'][16][70]+'</a>');//刷新
                    }else{
                        html.push('<a href="javascript:;" class="refresh disabled">'+langData['siteConfig'][45][3]+'</a>');//已设置刷新
                    }
                  }
                  html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a>');
                  if(!refreshSmart && !isbid){
                    html.push('<a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                  }
                }
                html.push('</div>');

                // if(refreshSmart || isbid == 1){
                //  html.push('<div class="sd">');
                //  if(refreshSmart){
                //    html.push('<p><font color="#ff6600">已开通智能刷新，下次刷新时间：'+refreshNext+'，已刷新'+(refreshCount-refreshSurplus)+'次，剩余'+refreshSurplus+'次</font></p>');
                //  }
                //  if(isbid && bid_type == 'normal'){
                //    html.push('<p><font color="#ff6600">已开通置顶，结束时间：'+bid_end+'</font></p>');
                //  }
                //  if(isbid && bid_type == 'plan'){
                //    var topPlanArr = [];
                //    for (var p = 0; p < bid_plan.length; p++) {
                //      var state = !bid_plan[p].state ? 'disabled' : '';
                //      topPlanArr.push('<span class="'+state+'">' + bid_plan[p].date + ' ' + bid_plan[p].week + '（'+(bid_plan[p].type == 'all' ? '全天' : '早8点-晚8点')+'）</span>');
                //    }
                //    html.push('<p><font color="#ff6600">已开通计划置顶，明细：'+topPlanArr.join('、')+'</font></p>');
                //  }
                //  html.push('</div>');
                // }

                html.push('</div>');


              //商铺
              }else if(type == "sp"){

                var transfer = list[i].transfer,
                    address  = list[i].address;

                html.push('<div class="house-box item" data-id="'+id+'" data-title="'+title+'">');
                if(waitpay == "0"){
                  html.push('<div class="title">');
                  var apa = [];
                  html.push('<span style="color:#919191;font-size: .24rem;">'+langData['siteConfig'][11][8]+'：'+pubdate+'</span>');

                  if(list[i].state == "0"){
                     html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][19][556]+'</span>');
                  }else if(list[i].state == "1"){
                     if(!isbid){
                        html.push('<a href="javascript:;" class="topping '+ clsNm_hide +'">'+langData['siteConfig'][44][99]+'<s></s></a>');//开通置顶
                      }
                      if(refreshSmart || isbid == 1){
                          if(isbid && bid_type == 'plan'){
                              html.push('<p class="topPlanDetail topcommon" data-module="house_sp" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');//查看详情 -- 已开通计划置顶
                          }
                          if(isbid && bid_type == 'normal'){
                              html.push('<p class="topcommon">'+langData['siteConfig'][44][100]+'</p>');//已开通普通置顶
                          }
                      }
                  }else if(list[i].state == "2"){
                      html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][9][35]+'</span>');
                  }
                  html.push('</div>');
                }
                html.push('<div class="house-item fn-clear">');
                if(litpic != "" && litpic != undefined){
                  html.push('<div class="house-img fn-left">');
                  html.push('<a href="'+url+'">');
                  html.push('<img onerror="this.src=\''+litpic+'\'" src="'+huoniao.changeFileSize(litpic, "small")+'" />');
                  html.push('</a>');
                  html.push('</div>');
                }
                html.push('<dl>');
                html.push('<a href="'+url+'">');
                html.push('<dt>'+title+'</dt>');

                var _type = p = "";
                if(list[i].type==0){
                  _type = langData['siteConfig'][19][109];//出租
                  p = ''+echoCurrency('short')+'/'+langData['siteConfig'][13][18] ;
                }else if(list[i].type==1){
                  _type = langData['siteConfig'][19][110];//出售
                  p = langData['siteConfig'][13][27]+echoCurrency('short')+'';
                }else{
                  _type = langData['siteConfig'][19][111];//转让
                  p = ''+echoCurrency('short')+'/'+langData['siteConfig'][13][18] ;
                }
                html.push('<dd class="item-area"><em class="sp_type">'+_type+'</em><em>'+area+echoCurrency('areasymbol')+'</em><span class="price fn-right">'+price+p+'</span></dd>');
                if(list[i].type == 2){
                  html.push('<dd class="item-type-1"><em class="fn-right">'+langData['siteConfig'][19][120]+':'+transfer+langData['siteConfig'][13][27]+'</em></dd>');//万
                }

                html.push('</a>');
                html.push('</dl>');
                html.push('</div>');

                if(refreshSmart || isbid == 1){
                  html.push('<div class="sd">');
                  if(refreshSmart){
                      html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][28]+'</span> — <span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][45][2]+'，'+langData['siteConfig'][45][1].replace('1','<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>')+'，'+langData['siteConfig'][45][0].replace('1','<span class="SurplusRefreshCount">'+refreshSurplus+'</span>')+'</font></p>');//智能刷新 -- 后刷新--已刷新1次--剩余1次
                    }

                  if(isbid && bid_type == 'normal'){
                      html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][41][57]+'</span> — <span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+' </span></p>');//普通置顶 -- 结束
                  }
                  if(isbid && bid_type == 'plan'){

                      //记录置顶详情
                      topPlanData['house_sp'] = Array.isArray(topPlanData['house_sp']) ? topPlanData['house_sp'] : [];
                      topPlanData['house_sp'][id] = bid_plan;
                      var plan_end = bid_plan[bid_plan.length-1]['date'];

                      html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][39]+'</span> — <span class="topEndTime">'+plan_end+langData['siteConfig'][6][163]+'</span></p>');//计划置顶 -- 结束
                  }
                  html.push('</div>');
                }

                html.push('<div class="o fn-clear">');
                if(waitpay == "1"){
                  html.push('<a href="javascript:;" class="delayPay pay_btn">'+langData['siteConfig'][19][327]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                }else{
                  if(list[i]['state'] == 1){
                    if(!refreshSmart){
                      html.push('<a href="javascript:;" class="refresh  '+ clsNm_hide +'">'+langData['siteConfig'][16][70]+'</a>');//刷新
                    }else{
                        html.push('<a href="javascript:;" class="refresh disabled">'+langData['siteConfig'][45][3]+'</a>');//已设置刷新
                    }
                  }
                  html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a>');
                  if(!refreshSmart && !isbid){
                    html.push('<a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                  }
                }
                html.push('</div>');

                // if(refreshSmart || isbid == 1){
                //  html.push('<div class="sd">');
                //  if(refreshSmart){
                //    html.push('<p><font color="#ff6600">已开通智能刷新，下次刷新时间：'+refreshNext+'，已刷新'+(refreshCount-refreshSurplus)+'次，剩余'+refreshSurplus+'次</font></p>');
                //  }
                //  if(isbid && bid_type == 'normal'){
                //    html.push('<p><font color="#ff6600">已开通置顶，结束时间：'+bid_end+'</font></p>');
                //  }
                //  if(isbid && bid_type == 'plan'){
                //    var topPlanArr = [];
                //    for (var p = 0; p < bid_plan.length; p++) {
                //      var state = !bid_plan[p].state ? 'disabled' : '';
                //      topPlanArr.push('<span class="'+state+'">' + bid_plan[p].date + ' ' + bid_plan[p].week + '（'+(bid_plan[p].type == 'all' ? '全天' : '早8点-晚8点')+'）</span>');
                //    }
                //    html.push('<p><font color="#ff6600">已开通计划置顶，明细：'+topPlanArr.join('、')+'</font></p>');
                //  }
                //  html.push('</div>');
                // }

                html.push('</div>');


              //厂房、仓库
              }else if(type == "cf"){

                var transfer = list[i].transfer,
                    address  = list[i].address;

                html.push('<div class="house-box item" data-id="'+id+'" data-title="'+title+'">');
                if(waitpay == "0"){
                  html.push('<div class="title">');
                  var apa = [];
                  html.push('<span style="color:#919191;font-size: .24rem;">'+langData['siteConfig'][11][8]+'：'+pubdate+'</span>');

                  if(list[i].state == "0"){
                     html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][19][556]+'</span>');
                  }else if(list[i].state == "1"){
                     if(!isbid){
                        html.push('<a href="javascript:;" class="topping '+ clsNm_hide +'">'+langData['siteConfig'][44][99]+'<s></s></a>');//开通置顶
                      }
                      if(refreshSmart || isbid == 1){
                        if(isbid && bid_type == 'plan'){
                            html.push('<p class="topPlanDetail topcommon" data-module="house_cf" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');//查看详情 -- 已开通计划置顶
                        }
                        if(isbid && bid_type == 'normal'){
                            html.push('<p class="topcommon">'+langData['siteConfig'][44][100]+'</p>');//已开通普通置顶
                        }
                      }
                  }else if(list[i].state == "2"){
                      html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][9][35]+'</span>');
                  }
                  html.push('</div>');
                }
                html.push('<div class="house-item fn-clear">');
                if(litpic != "" && litpic != undefined){
                  html.push('<div class="house-img fn-left">');
                  html.push('<a href="'+url+'">');
                  html.push('<img onerror="this.src=\''+litpic+'\'" src="'+huoniao.changeFileSize(litpic, "small")+'" />');
                  html.push('</a>');
                  html.push('</div>');
                }
                html.push('<dl>');
                html.push('<a href="'+url+'">');
                html.push('<dt>'+title+'</dt>');
                var _type = p = "";
                if(list[i].type==0){
                  _type = langData['siteConfig'][19][109];//出租
                  p = ''+echoCurrency('short')+'/'+langData['siteConfig'][13][18] ;
                }else if(list[i].type==2){
                  _type = langData['siteConfig'][19][110];//出售
                  p = langData['siteConfig'][13][27]+echoCurrency('short')+'';
                }else{
                  _type = langData['siteConfig'][19][111];//转让
                  p = ''+echoCurrency('short')+'/'+langData['siteConfig'][13][18] ;
                }
                html.push('<dd class="item-area"><em class="sp_type">'+_type+'</em><em>'+area+echoCurrency('areasymbol')+'</em><span class="price fn-right">'+price+p+'</span></dd>');
                if(list[i].type == 1){
                  html.push('<dd class="item-type-1"><em class="fn-right">'+langData['siteConfig'][19][120]+':'+transfer+langData['siteConfig'][13][27]+'</em></dd>');//万
                }
                html.push('</a>');
                html.push('</dl>');
                html.push('</div>');

                if(refreshSmart || isbid == 1){
                  html.push('<div class="sd">');
                  if(refreshSmart){
                      html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][28]+'</span> — <span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][45][2]+'，'+langData['siteConfig'][45][1].replace('1','<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>')+'，'+langData['siteConfig'][45][0].replace('1','<span class="SurplusRefreshCount">'+refreshSurplus+'</span>')+'</font></p>');//智能刷新 -- 后刷新--已刷新1次--剩余1次
                    }
                  if(isbid && bid_type == 'normal'){
                      html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][41][57]+'</span> — <span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+' </span></p>');//普通置顶 -- 结束
                  }
                  if(isbid && bid_type == 'plan'){

                      //记录置顶详情
                      topPlanData['house_cf'] = Array.isArray(topPlanData['house_cf']) ? topPlanData['house_cf'] : [];
                      topPlanData['house_cf'][id] = bid_plan;
                      var plan_end = bid_plan[bid_plan.length-1]['date'];

                      html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][39]+'</span> — <span class="topEndTime">'+plan_end+langData['siteConfig'][6][163]+'</span></p>');//计划置顶 -- 结束
                  }
                  html.push('</div>');
                }

                html.push('<div class="o fn-clear">');
                if(waitpay == "1"){
                  html.push('<a href="javascript:;" class="delayPay pay_btn">'+langData['siteConfig'][19][327]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                }else{
                  if(list[i]['state'] == 1){
                    if(!refreshSmart){
                      html.push('<a href="javascript:;" class="refresh  '+ clsNm_hide +'">'+langData['siteConfig'][16][70]+'</a>');//刷新
                    }else{
                      html.push('<a href="javascript:;" class="refresh disabled">'+langData['siteConfig'][45][3]+'</a>');//已设置刷新
                    }
                  }
                  html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a>');
                  if(!refreshSmart && !isbid){
                    html.push('<a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                  }
                }
                html.push('</div>');

                // if(refreshSmart || isbid == 1){
                //  html.push('<div class="sd">');
                //  if(refreshSmart){
                //    html.push('<p><font color="#ff6600">已开通智能刷新，下次刷新时间：'+refreshNext+'，已刷新'+(refreshCount-refreshSurplus)+'次，剩余'+refreshSurplus+'次</font></p>');
                //  }
                //  if(isbid && bid_type == 'normal'){
                //    html.push('<p><font color="#ff6600">已开通置顶，结束时间：'+bid_end+'</font></p>');
                //  }
                //  if(isbid && bid_type == 'plan'){
                //    var topPlanArr = [];
                //    for (var p = 0; p < bid_plan.length; p++) {
                //      var state = !bid_plan[p].state ? 'disabled' : '';
                //      topPlanArr.push('<span class="'+state+'">' + bid_plan[p].date + ' ' + bid_plan[p].week + '（'+(bid_plan[p].type == 'all' ? '全天' : '早8点-晚8点')+'）</span>');
                //    }
                //    html.push('<p><font color="#ff6600">已开通计划置顶，明细：'+topPlanArr.join('、')+'</font></p>');
                //  }
                //  html.push('</div>');
                // }

                html.push('</div>');


              //车位
              }else if(type == "cw"){

                var transfer = list[i].transfer,
                    address  = list[i].address;

                html.push('<div class="house-box item" data-id="'+id+'" data-title="'+title+'">');
                if(waitpay == "0"){
                  html.push('<div class="title">');
                  var apa = [];
                  html.push('<span style="color:#919191;font-size: .24rem;">'+langData['siteConfig'][11][8]+'：'+pubdate+'</span>');

                  if(list[i].state == "0"){
                     html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][19][556]+'</span>');
                  }else if(list[i].state == "1"){
                     if(!isbid){
                        html.push('<a href="javascript:;" class="topping '+ clsNm_hide +'">'+langData['siteConfig'][44][99]+'<s></s></a>');//开通置顶
                      }
                      if(refreshSmart || isbid == 1){
                        if(isbid && bid_type == 'plan'){
                            html.push('<p class="topPlanDetail topcommon" data-module="house_cf" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');//查看详情 -- 已开通计划置顶
                        }
                        if(isbid && bid_type == 'normal'){
                            html.push('<p class="topcommon">'+langData['siteConfig'][44][100]+'</p>');//已开通普通置顶
                        }
                      }
                  }else if(list[i].state == "2"){
                      html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][9][35]+'</span>');
                  }
                  html.push('</div>');
                }
                html.push('<div class="house-item fn-clear">');
                if(litpic != "" && litpic != undefined){
                  html.push('<div class="house-img fn-left">');
                  html.push('<a href="'+url+'">');
                  html.push('<img onerror="this.src=\''+litpic+'\'" src="'+huoniao.changeFileSize(litpic, "small")+'" />');
                  html.push('</a>');
                  html.push('</div>');
                }
                html.push('<dl>');
                html.push('<a href="'+url+'">');
                html.push('<dt>'+title+'</dt>');

                var _type = p = "";
                if(list[i].type==0){
                  _type = langData['siteConfig'][19][109];//出租
                  p = ''+echoCurrency('short')+'/'+langData['siteConfig'][13][18] ;
                }else if(list[i].type==1){
                  _type = langData['siteConfig'][19][110];//出售
                  p = langData['siteConfig'][13][27]+echoCurrency('short')+'';
                }else{
                  _type = langData['siteConfig'][19][111];//转让
                  p = ''+echoCurrency('short')+'/'+langData['siteConfig'][13][18] ;
                }
                html.push('<dd class="item-area"><em class="sp_type">'+_type+'</em><em>'+area+echoCurrency('areasymbol')+'</em><span class="price fn-right">'+price+p+'</span></dd>');
                if(list[i].type == 2){
                  html.push('<dd class="item-type-1"><em class="fn-right">'+langData['siteConfig'][19][120]+':'+transfer+langData['siteConfig'][13][27]+'</em></dd>');//万
                }
                html.push('</a>');
                html.push('</dl>');
                html.push('</div>');

                if(refreshSmart || isbid == 1){
                  html.push('<div class="sd">');
                  if(refreshSmart){
                    html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][28]+'</span> — <span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][45][2]+'，'+langData['siteConfig'][45][1].replace('1','<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>')+'，'+langData['siteConfig'][45][0].replace('1','<span class="SurplusRefreshCount">'+refreshSurplus+'</span>')+'</font></p>');//智能刷新 -- 后刷新--已刷新1次--剩余1次
                  }
                  if(isbid && bid_type == 'normal'){
                      html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][41][57]+'</span> — <span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+' </span></p>');//普通置顶 -- 结束
                  }
                  if(isbid && bid_type == 'plan'){

                      //记录置顶详情
                      topPlanData['house_cf'] = Array.isArray(topPlanData['house_cf']) ? topPlanData['house_cf'] : [];
                      topPlanData['house_cf'][id] = bid_plan;
                      var plan_end = bid_plan[bid_plan.length-1]['date'];

                      html.push('<p><span style="color:#f9412e">'+langData['siteConfig'][32][39]+'</span> — <span class="topEndTime">'+plan_end+langData['siteConfig'][6][163]+'</span></p>');//计划置顶 -- 结束
                  }
                  html.push('</div>');
                }

                html.push('<dd class="o fn-clear">');
                if(waitpay == "1"){
                  html.push('<a href="javascript:;" class="delayPay pay_btn">'+langData['siteConfig'][19][327]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                }else{
                  if(list[i]['state'] == 1){
                    if(!refreshSmart){
                      html.push('<a href="javascript:;" class="refresh  '+ clsNm_hide +'">'+langData['siteConfig'][16][70]+'</a>');//刷新
                    }else{
                      html.push('<a href="javascript:;" class="refresh disabled">'+langData['siteConfig'][45][3]+'</a>');//已设置刷新
                    }
                  }
                  html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a>');
                  if(!refreshSmart && !isbid){
                    html.push('<a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                  }
                }
                html.push('</div>');

                // if(refreshSmart || isbid == 1){
                //  html.push('<div class="sd">');
                //  if(refreshSmart){
                //    html.push('<p><font color="#ff6600">已开通智能刷新，下次刷新时间：'+refreshNext+'，已刷新'+(refreshCount-refreshSurplus)+'次，剩余'+refreshSurplus+'次</font></p>');
                //  }
                //  if(isbid && bid_type == 'normal'){
                //    html.push('<p><font color="#ff6600">已开通置顶，结束时间：'+bid_end+'</font></p>');
                //  }
                //  if(isbid && bid_type == 'plan'){
                //    var topPlanArr = [];
                //    for (var p = 0; p < bid_plan.length; p++) {
                //      var state = !bid_plan[p].state ? 'disabled' : '';
                //      topPlanArr.push('<span class="'+state+'">' + bid_plan[p].date + ' ' + bid_plan[p].week + '（'+(bid_plan[p].type == 'all' ? '全天' : '早8点-晚8点')+'）</span>');
                //    }
                //    html.push('<p><font color="#ff6600">已开通计划置顶，明细：'+topPlanArr.join('、')+'</font></p>');
                //  }
                //  html.push('</div>');
                // }

                html.push('</div>');

              }

            }

            objId.append(html.join(""));
            $('.loading').remove();
            isload = false;

          }else{
            $('.loading').remove();
            objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
          }

                countDownRefreshSmart();

          switch(state){
            case "":
              totalCount = pageInfo.totalCount;
              break;
            case "0":
              totalCount = pageInfo.gray;
              break;
            case "1":
              totalCount = pageInfo.audit;
              break;
            case "2":
              totalCount = pageInfo.refresh;
              break;
          }


          // $("#total").html(pageInfo.totalCount);
          if(pageInfo.gray>0){
              $("#gray").show().html(pageInfo.gray);
          }else{
              $("#gray").hide();
          }
          if(pageInfo.audit>0){
              $("#audit").show().html(pageInfo.audit);
          }else{
              $("#audit").hide();
          }
          if(pageInfo.refresh>0){
              $("#refuse").show().html(pageInfo.refresh);
          }else{
              $("#refuse").hide();
          }
          // $("#expire").html(pageInfo.expire);
        }
      }else{
        $("#total").html(0);
        $("#audit").html(0);
        $("#gray").html(0);
        $("#refuse").html(0);
        $("#expire").html(0);
        objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
      }
    }
  });

}
