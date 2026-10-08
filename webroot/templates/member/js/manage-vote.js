/**
 * 会员中心投票列表
 */
var objId = $("#list");
$(function(){

  $(".main-tab li[data-id='"+state+"']").addClass("curr");

  $(".main-tab li").bind("click", function(){
    var t = $(this), id = t.attr("data-id");
    if(!t.hasClass("curr") && !t.hasClass("add")){
      state = id;
      atpage = 1;
      t.addClass("curr").siblings("li").removeClass("curr");
      getList();
    }
  });

  getList(1);

  //删除
  objId.delegate(".del", "click", function(){
    var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
    if(t.hasClass("load")) return;
    if(id){
      $.dialog.confirm(langData['siteConfig'][20][543], function(){   //你确定要删除这条信息吗？
        t.siblings("a").hide();
        t.addClass("load");

        $.ajax({
          url: masterDomain+"/include/ajax.php?service=vote&action=del&id="+id,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data && data.state == 100){

              //删除成功后移除信息层并异步获取最新列表
              par.slideUp(300, function(){
                par.remove();
                setTimeout(function(){getList(1);}, 200);
              });

            }else{
              $.dialog.alert(data.info);
              t.siblings("a").show();
              t.removeClass("load");
            }
          },
          error: function(){
            $.dialog.alert(langData['siteConfig'][20][183]);   //网络错误，请稍候重试！
            t.siblings("a").show();
            t.removeClass("load");
          }
        });
      });
    }
  });

  //结束
  objId.delegate(".stop", "click", function(){
    var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
    if(t.hasClass("load")) return;
    if(id){
      $.dialog.confirm(langData['siteConfig'][44][12], function(){//确定要结束投票吗？
        t.siblings("a").hide();
        t.addClass("load");

        $.ajax({
          url: masterDomain+"/include/ajax.php?service=vote&action=stop&id="+id,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data && data.state == 100){
              setTimeout(function(){getList(1);}, 200);
            }else{
              $.dialog.alert(data.info);
              t.siblings("a").show();
              t.removeClass("load");
            }
          },
          error: function(){
            $.dialog.alert(langData['siteConfig'][20][183]); //网络错误，请稍候重试！
            t.siblings("a").show();
            t.removeClass("load");
          }
        });
      });
    }
  });

});

function getList(is){

  if(is != 1){
    $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
  }

  objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
  $(".pagination").hide();

  $.ajax({
    url: masterDomain+"/include/ajax.php?service=vote&action=vlist&u=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
    type: "GET",
    dataType: "jsonp",
    success: function (data) {
      if(data && data.state != 200){
        if(data.state == 101){
          objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
        }else{
          var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

          //拼接列表
          if(list.length > 0){

            var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
            var param = t + "do=edit&id=";
            var statisUrlString = statisticsUrl + param;
            var urlString = editUrl + param;

            for(var i = 0; i < list.length; i++){
              var item        = [],
                  id          = list[i].id,
                  title       = list[i].title,
                  url         = list[i].url,
                  click       = list[i].click,
                  vstate      = list[i].state,
                  arcrank     = list[i].arcrank,
                  join        = list[i].join,
                  waitpay     = list[i].waitpay,
                  pubdate     = huoniao.transTimes(list[i].pubdate, 1);

              url = waitpay == "1" || list[i].arcrank != "1" ? 'javascript:;' : url;

              var stateTxt = '', styleState = vstate;
              if(waitpay == 1){
                stateTxt = langData['siteConfig'][31][138];   //待支付
                styleState = 2;
              }else if(arcrank == 0){
                stateTxt = langData['siteConfig'][19][556];   //待审核
                styleState = 2;
              }else if(arcrank == 2){
                stateTxt = langData['siteConfig'][9][35];  //审核拒绝
                vstate = 3;
              }else if(vstate == 0){
                stateTxt = langData['siteConfig'][15][21];   //未开始
              }else if(vstate == 1){
                stateTxt = langData['siteConfig'][31][139]+'...';   //投票进行中...
              }else if(vstate == 2){  
                stateTxt = langData['siteConfig'][19][507];    //已结束
              }

              html.push('<div class="item fn-clear" data-id="'+id+'" data-join="'+join+'">');
              html.push('  <div class="i">');
              html.push('    <h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a><span class="state state'+styleState+'">'+stateTxt+'</span></h5>');
              html.push('    <p>'+langData['siteConfig'][11][8]+'：'+pubdate+'</p>');   //发布时间
              html.push('    <div class="btns o">');
              if(waitpay == "1"){
                html.push('      <a href="javascript:;" class="stick delayPay" style="color:#f60;width:auto;"><s></s>'+langData['siteConfig'][23][113]+'</a>');//为求职者提供最新最全的招聘信息
                html.push('      <a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>');  //删除
                html.push('      <a href="'+urlString+id+'" class="edit" target="_blank">'+langData['siteConfig'][6][6]+'</a>');  //编辑
              }else{
                html.push('      <span><font>'+join+'</font>'+langData['siteConfig'][31][140]+'</span>');   //人已参与
                if(vstate == 1){
                  html.push('    <a href="javascript:;" class="stop">'+langData['siteConfig'][6][163]+'</a>');  //结束
                }
                html.push('      <a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>'); //删除
                if(join == 0 && vstate != 2){
                  html.push('    <a href="'+urlString+id+'" class="edit" target="_blank">'+langData['siteConfig'][6][6]+'</a>');  //编辑
                }
                html.push('      <a href="'+statisUrlString+id+'" class="statistics" target="_blank">'+langData['siteConfig'][17][36]+'</a>');  //查看统计
              }
              html.push('    </div>');
              html.push('  </div>');
              html.push('</div>');
            }

            objId.html(html.join(""));

          }else{
            objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
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
              totalCount = pageInfo.expire;
              break;
          }
          $("#total").html(pageInfo.totalCount);
          // $("#gray").html(pageInfo.gray);
          $("#audit").html(pageInfo.audit);
          $("#expire").html(pageInfo.expire);
          showPageInfo();
        }
      }else{
        objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
      }
    }
  });
}
