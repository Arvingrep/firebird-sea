var objId = $("#list"), isload = false;
$(function(){
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

  objId.delegate(".del", "click", function(){
    var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
    if(id){
      if(confirm(langData['siteConfig'][20][543])){
        t.siblings("a").hide();
        t.addClass("load");

        $.ajax({
          url: masterDomain+"/include/ajax.php?service=pension&action=invitation&oper=del&id="+id,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data && data.state == 100){

              //删除成功后移除信息层并异步获取最新列表
              par.remove();
              setTimeout(function(){getList(1);}, 200);

            }else{
              $.dialog.alert(data.info);
              t.siblings("a").show();
              t.removeClass("load");
            }
          },
          error: function(){
            $.dialog.alert(langData['siteConfig'][20][183]);
            t.siblings("a").show();
            t.removeClass("load");
          }
        });
      };
    }
  });


});

function getList(is){

  if(is){
    objId.html('');
  }

  objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

  isload = true;

  $.ajax({
    url: masterDomain+"/include/ajax.php?service=pension&action=invitationList&u=2&page="+atpage+"&pageSize="+pageSize,
    type: "GET",
    dataType: "jsonp",
    success: function (data) {
      $('.loading').remove();
      if(data && data.state != 200){
        if(data.state == 101){
          objId.append("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
        }else{
          var list = data.info.list, pageInfo = data.info.pageInfo, totalPage = 0, html = [];
          if(state == ''){
            totalPage = pageInfo.totalPage;
          }else if(state == '1'){
            totalPage = Math.ceil(pageInfo.state1 / pageSize);
          }else{
            totalPage = Math.ceil(pageInfo.state0 / pageSize);
          }
          //拼接列表
          if(list.length > 0){
            for(var i = 0; i < list.length; i++){
              var item     = [],
                  id       = list[i].id,
                  storeaid = list[i].storeaid,
                  store    = list[i].store,
                  title    = list[i].title,
                  storetel = list[i].storetel,
                  istate   = list[i].state,
                  people   = list[i].people,
                  pubdate  = list[i].pubdate;

              var url = detialUrl.replace('#id', store);

              var hDetail = '';
              try{
                if(storeaid == store){
                  hDetail = '<a href="'+url+'" class="title">'+title+'</a>';
                }
              }catch(err){
                hDetail = '<p class="title" title="'+langData['siteConfig'][45][35]+'">'+title+'（'+langData['siteConfig'][45][35]+'）</p>';//该机构已删除或状态异常，暂时无法查看
              }
              var bj_btn = '', date_btn = '', cls = '';

              html.push('<div class="item state'+istate+'" data-id="'+id+'">');
              html.push(hDetail);
              // html.push('  <p class="user fn-clear">'+date_btn+'<span class="name"><em>'+storetel+'</em></span></p>');
              html.push('  <p class="user fn-clear"><span class="name">'+people+'&nbsp;&nbsp; <em>'+storetel+'</em></span>'+date_btn+'</p>');
              html.push('  <div class="o fn-clear">');
              html.push('   <span class="time">'+huoniao.transTimes(pubdate,1)+'</span>');
              html.push(bj_btn);
              html.push('   <a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');//删除
              html.push('  </div>');
              html.push('</div>');
              
            }
            objId.append(html.join(""));
            if(atpage < totalPage){
              isload = false;
            }else{
              objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
            }
          }else{
            objId.append("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
          }

          totalCount = pageInfo.totalCount;


        }
      }else{
        objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
      }
    }
  });
}
