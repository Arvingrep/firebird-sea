 /**
  * 会员中心招聘企业职位列表
  * by guozi at: 20150627
  */


var objId = $("#list");
$(function(){


  //导航
  $('.header-r .screen').click(function(){
    var nav = $('.nav'), t = $('.nav').css('display') == "none";
    if (t) {nav.show();}else{nav.hide();}
  })


  //项目
  $(".tab .type").bind("click", function(){
    var t = $(this), id = t.attr("data-id"), index = t.index();
    if(!t.hasClass("curr") && !t.hasClass("sel")){
      state = id;
      atpage = 1;
      $('.count li').eq(index).show().siblings("li").hide();
      t.addClass("curr").siblings("li").removeClass("curr");
      $('#list').html('');
      getList(1);
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

  // 删除
  objId.delegate(".del", "click", function(){
    var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
    if(id){
      if(confirm(langData['siteConfig'][20][211])){
        t.siblings("a").hide();
        t.addClass("load");

        $.ajax({
          url: masterDomain+"/include/ajax.php?service=job&action=delPost&id="+id,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data && data.state == 100){

              //删除成功后移除信息层并异步获取最新列表
              objId.html('');
              getList(1)

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
      }
    }
  });

    //刷新
    objId.delegate('.refresh', 'click', function(){
        var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
        refreshTopFunc.init('refresh', 'job', 'post', id, t, title);
    });


    //置顶
    objId.delegate('.topping', 'click', function(){
        var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
        refreshTopFunc.init('topping', 'job', 'post', id, t, title);
    });

 });

function getList(is){

 isload = true;


  if(is != 1){
  //  $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
  }

  objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

  $.ajax({
    url: masterDomain+"/include/ajax.php?service=job&action=post&com=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
            var param = t + "do=edit&id=";
            var urlString = editUrl + param;

            for(var i = 0; i < list.length; i++){
              var item        = [];

              var isbid       = parseInt(list[i].isbid),
                  bid_type    = list[i].bid_type,
                  bid_price   = list[i].bid_price,
                  bid_end     = huoniao.transTimes(list[i].bid_end, 1),
                  bid_plan    = list[i].bid_plan,
                  refreshSmart = list[i].refreshSmart;

              //智能刷新
              if(refreshSmart){
                refreshCount = list[i].refreshCount;
                refreshTimes = list[i].refreshTimes;
                refreshPrice = list[i].refreshPrice;
                refreshBegan = huoniao.transTimes(list[i].refreshBegan, 1);
                refreshNext = huoniao.transTimes(list[i].refreshNext, 1);
                refreshSurplus = list[i].refreshSurplus;
              }

              // url = waitpay == "1" || list[i].arcrank != "1" ? 'javascript:;' : url;

              html.push('<div class="item" data-id="'+list[i].id+'" data-title="'+list[i].title+'">');
              html.push('<div class="info-item fn-clear">');
              html.push('<dl><a href="'+list[i].url+'">');
              html.push('<dt>'+langData['siteConfig'][19][408]+'：'+list[i].title+'</dt>');
              html.push('<dd class="item-area"><em>'+langData['siteConfig'][19][628]+'：'+list[i].delivery+'</em></dd>');
              html.push('<dd class="item-area"><em>'+langData['siteConfig'][11][8]+'：'+huoniao.transTimes(list[i].pubdate, 1)+'</em></dd>');
              html.push('<dd class="item-area"><em>'+langData['siteConfig'][19][629]+'：'+huoniao.transTimes(list[i].valid, 2)+'</em></dd>');

              var states = "";
              switch (list[i].state) {
                case "0":
                  states = langData['siteConfig'][19][556];
                  break;
                case "1":
                  states = langData['siteConfig'][19][392];
                  break;
                case "2":
                  states = langData['siteConfig'][23][101];
                  break;
                case "3":
                  states = langData['siteConfig'][9][29];
                  break;
              }
              html.push('<dd class="item-area"><em>'+langData['siteConfig'][19][307]+'：'+states+'</em></dd>');

              html.push('</a></dl>');
              html.push('</div>');
              html.push('<div class="o fn-clear">');


              if(!refreshSmart && !isbid){
                html.push('<a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');
              }
              html.push('<a href="'+editUrl.replace("%id%", list[i].id)+'" class="edit">'+langData['siteConfig'][6][4]+'</a>');

                if(list[i].state == "1"){
                    if(!refreshSmart){
                        html.push('<a href="javascript:;" class="refresh">'+langData['siteConfig'][16][70]+'</a>');//刷新
                    }
                    if(!isbid){
                        html.push('<a href="javascript:;" class="topping">'+langData['siteConfig'][19][762]+'</a>');//置顶
                    }
                }

              // if(list[i].state == "1"){
              //   if(!isbid){
              //     html.push('<a href="javascript:;" class="topping">置顶</a>');
              //   }
              //   if(!refreshSmart){
              //     html.push('<a href="javascript:;" class="refresh">刷新</a>');
              //   }
              // }

              html.push('</div>');

                if(refreshSmart || isbid == 1){
                    html.push('<div class="sd">');
                    if(refreshSmart){
                         html.push('<p><span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][45][2]+langData['siteConfig'][45][1].replace('1','<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>')+'，'+langData['siteConfig'][45][0].replace('1','<span class="SurplusRefreshCount">'+refreshSurplus+'</span>')+'</font></p>');//后刷新--已刷新1次--剩余1次

                    }
                    if(isbid && bid_type == 'normal'){
                        html.push('<p>'+langData['siteConfig'][31][130]+'，<span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+' </span></p>');//已开通置顶--结束
                    }
                    if(isbid && bid_type == 'plan'){

                        //记录置顶详情
                        topPlanData['post'] = Array.isArray(topPlanData['post']) ? topPlanData['post'] : [];
                        topPlanData['post'][list[i].id] = bid_plan;

                        html.push('<p class="topPlanDetail" data-module="post" data-id="'+list[i].id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');//查看详情--已开通计划置顶
                    }
                    html.push('</div>');
                }

              html.push('</div>');

            }

            objId.append(html.join(""));
            countDownRefreshSmart();

            $('.loading').remove();
            isload = false;

          }else{
            $('.loading').remove();
            objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
          }

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
          }


          $("#total").html(pageInfo.totalCount);
          $("#audit").html(pageInfo.audit);
          $("#gray").html(pageInfo.gray);
          $("#refuse").html(pageInfo.refuse);
        //  showPageInfo();
        }
      }else{
        objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
        $('.count span').text(0);
      }
    }
  });
 }
