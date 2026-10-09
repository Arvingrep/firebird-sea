var objId = $("#list");

var huoniao_ = {
  //转换PHP时间戳
  transTimes: function(timestamp, n){
    
    const dateFormatter = huoniao.dateFormatter(timestamp);
    const year = dateFormatter.year;
    const month = dateFormatter.month;
    const day = dateFormatter.day;
    const hour = dateFormatter.hour;
    const minute = dateFormatter.minute;
    const second = dateFormatter.second;
    
    if(n == 1){
      return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
    }else if(n == 2){
      return (year+'-'+month+'-'+day);
    }else if(n == 3){
      return (month+'-'+day);
    }else{
      return 0;
    }
  }
  /**
     * 获取附件不同尺寸
     * 此功能只适用于远程附件（非FTP模式）
     * @param string url 文件地址
     * @param string width 兼容老版本(small/middle)
     * @param int width 宽度
     * @param int height 高度
     * @return string *
     */ 
   ,changeFileSize: function(url, width, height){
    if(url == "" || url == undefined) return "";

    //小图尺寸
    if(width == 'small'){
        width = 200;
        height = 200;
    }

    //中图尺寸
    if(width == 'middle'){
        width = 500;
        height = 500;
    }

    //默认尺寸
    width = typeof width === 'number' ? width : 800;
    height = typeof height === 'number' ? height : 800;

    //阿里云、华为云
    url = url.replace('w_4096', 'w_' + width);
    url = url.replace('h_4096', 'h_' + height);

    //七牛云
    url = url.replace('w/4096', 'w/' + width);
    url = url.replace('h/4096', 'h/' + height);

    //腾讯云
    url = url.replace('4096x4096', width+"x"+height);

    return url;

    // 以下功能弃用
    if(to == "") return url;
    var from = (from == "" || from == undefined) ? "large" : from;
    var newUrl = "";
    // if(hideFileUrl == 1){
    //   newUrl =  url + "&type=" + to;
    // }else{
      newUrl = url.replace(from, to);
    // }

    return newUrl;
  }
}

$(function () {
  var isload = false;
  //选择状态
  $(".tab-box a").bind("click", function(){
    var t = $(this), id = t.attr("data-state"), index = t.index();
    if(!t.hasClass("active")){
      t.addClass("active").siblings().removeClass("active");
      objId.html('');
      state  = id;
      // atpage = 1;
      getList(1);
    }
  });

  //刷新
  objId.delegate('.refresh', 'click', function(){
      var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
      if(!t.hasClass('disabled')){
          refreshTopFunc.init('refresh', 'education', 'detail', id, t, title);
      }
  });

  //置顶
  objId.delegate('.topping', 'click', function(){
    var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
    refreshTopFunc.init('topping', 'education', 'detail', id, t, title);
  });

  // 删除
  objId.delegate(".del", "click", function(){
      var t = $(this), par = t.closest(".house-box"), id = par.attr("data-id");
      if(id){
      if(confirm(langData['car'][6][64])){
          t.siblings("a").hide();
          t.addClass("load");

          $.ajax({
          url: masterDomain+"/include/ajax.php?service=education&action=del&id="+id,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
              if(data && data.state == 100){
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
              alert(langData['car'][6][65]);
              t.siblings("a").show();
              t.removeClass("load");
          }
          });
      }
      }
  });

  // 下拉加载
	$(window).scroll(function() {
		var h = $('.item').height();
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w - h;
		if ($(window).scrollTop() > scroll && !isload) {
			atpage++;
			getList();
		};
  });

    getList(1);

  function getList(tr){
      isload = true;
      if(tr){
        atpage = 1;
      }
      objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
      $.ajax({
          url: masterDomain+"/include/ajax.php?service=education&action=coursesList&u=1&orderby=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
              if(data && data.state != 200){
                  if(data.state == 101){
                      objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                      $('.count span').text(0);
                  }else{
                      var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

                      //拼接列表
                      if(list.length > 0){

                          var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
                          var param = t + "id=";
                          var urlString = editUrl + param;

                          for(var i = 0; i < list.length; i++){
                              var item    = [],
                              id          = list[i].id,
                              title       = list[i].title,
                              sale        = list[i].sale,
                              url         = list[i].url,
                              litpic      = list[i].litpic,
                              click       = list[i].click,
                              isbid       = parseInt(list[i].isbid),
                              bid_type    = list[i].bid_type,
                              bid_price   = list[i].bid_price,
                              bid_end     = huoniao.transTimes(list[i].bid_end, 1),
                              bid_plan    = list[i].bid_plan,
                              waitpay     = list[i].waitpay,
                              price       = list[i].price,
                              pubdate     = list[i].pubdate,
                              refreshSmart= list[i].refreshSmart,
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

                              html.push('<div class="house-box item" data-id="'+id+'" data-title="'+title+'">');
                              if(waitpay == "0"){
                                html.push('<div class="title fn-clear">');
                                  var apa = [];
                                  html.push('<span style="color:#919191;font-size: .24rem;">'+langData['car'][5][38]+'：'+huoniao_.transTimes(pubdate, 1)+'</span>');
                                  var arcrank = "";
                                  if(list[i].state == "0"){
                                      html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][19][556]+'</span>');
                                  }else if(list[i].state == "1"){
                                      if(!isbid){
                                          html.push('<a href="javascript:;" class="topping fn-right">'+langData['car'][6][51]+'<s></s></a>');
                                      }
                                      if(refreshSmart || isbid == 1){
                                          if(isbid && bid_type == 'normal'){
                                              html.push('<a href="javascript:;" class="topcommon fn-right">'+langData['car'][6][52]+'</a>');
                                          }
                                          if(isbid && bid_type == 'plan'){
                                              topPlanData['education'] = Array.isArray(topPlanData['education']) ? topPlanData['education'] : [];
                                              topPlanData['education'][id] = bid_plan;
                                              html.push('<a href="javascript:;" class="topPlanDetail topcommon fn-right" data-module="education" data-id="'+id+'" title="'+langData['car'][6][53]+'">'+langData['car'][6][54]+'<s></s></a>');
                                          }
                                      }
                                  }else if(list[i].state == "2"){
                                      html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][9][35]+'</span>');
                                  }
                                  html.push('</div>');
                              }
                              html.push('<div class="house-item fn-clear">');
                              if(litpic != "" && litpic != undefined){
                                html.push('<div class="house-img fn-left"><a href="'+url+'"><img src="'+huoniao.changeFileSize(litpic, "small")+'" /></a></div>');
                              }else{
                                html.push('<div class="icontxt"></div>');
                              }
                              html.push('<dl>');
                              html.push('<a href="'+url+'">');
                              html.push('<dt>'+title+'</dt>');
                              html.push('<dd class="manage_order">');
                              html.push('<em class="or_num">'+langData['education'][7][15]+'<span>'+sale+'</span></em>');
                              html.push('<em class="see_num">'+langData['education'][7][16]+'<span>'+click+'</span></em>');
                              html.push('<em class="class_price"><span>'+price+'</span><span>'+echoCurrency('short')+langData['education'][7][17]+'</span></em>');
                              html.push('</dd>');
                              html.push('</a>');
                              html.push('</dl>');
                              html.push('</div>');

                              if(refreshSmart || isbid == 1){
                                html.push('<div class="sd">');
                                if(refreshSmart){
                                    html.push('<p><span style="color:#f9412e">'+langData['car'][6][56]+'</span> — <span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['car'][6][58]+'<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>'+langData['car'][6][59]+'<span class="SurplusRefreshCount">'+refreshSurplus+'</span>'+langData['car'][6][60]+'</font></p>');
                                }
                                if(isbid && bid_type == 'normal'){
                                    html.push('<p><span style="color:#f9412e">'+langData['car'][6][57]+'</span> — <span class="topEndTime">'+bid_end+' '+langData['car'][6][60]+'</span></p>');
                                }
                                if(isbid && bid_type == 'plan'){
                                    //记录置顶详情
                                    topPlanData['education'] = Array.isArray(topPlanData['education']) ? topPlanData['education'] : [];
                                    topPlanData['education'][id] = bid_plan;
                                    var plan_end = bid_plan[bid_plan.length-1]['date'];

                                    html.push('<p><span style="color:#f9412e">'+langData['car'][6][62]+'</span> — <span class="topEndTime">'+plan_end+' '+langData['car'][6][60]+'</span></p>');
                                }
                                html.push('</div>');
                            }

                            html.push('<div class="o fn-clear">');
                            if(waitpay == "1"){
                                html.push('<a href="javascript:;" class="delayPay">'+langData['siteConfig'][19][327]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                            }else{
                                if(list[i].state == "1"){
                                    if(!refreshSmart){
                                        html.push('<a href="javascript:;" class="refresh">'+langData['car'][5][40]+'</a>');
                                    }else{
                                        html.push('<a href="javascript:;" class="refresh disabled">'+langData['car'][6][63]+'</a>');
                                    }
                                }
                                html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a>');
                                if(!refreshSmart && !isbid){
                                    html.push('<a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
                                }
                            }
                            html.push('</div>');

                            html.push('</div>');

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
                              totalCount = pageInfo.refuse;
                              break;
                          case "4":
                              totalCount = pageInfo.expire;
                              break;
                      }

                      if(pageInfo.audit>0){
                          $("#audit").show().html(pageInfo.audit);
                      }else{
                          $("#audit").hide();
                      }
                      if(pageInfo.gray>0){
                          $("#gray").show().html(pageInfo.gray);
                      }else{
                          $("#gray").hide();
                      }
                      if(pageInfo.refuse>0){
                          $("#refuse").show().html(pageInfo.refuse);
                      }else{
                          $("#refuse").hide();
                      }
                  }
              }else{
                  objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
                  $('.count span').text(0);
              }
          }
      });
  }

});
