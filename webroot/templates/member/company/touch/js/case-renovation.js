$(function() {
    var objId = $('.list'), isload = false;

  //删除
  objId.delegate(".del", "click", function(){
    var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
    if(id){
      if(confirm(langData['siteConfig'][27][97])) {
        t.siblings("a").hide();
        t.addClass("load");

        $.ajax({
          url: masterDomain+"/include/ajax.php?service=renovation&action=delTeam&id="+id,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data && data.state == 100){
              t.siblings("a").show();
              setTimeout(function(){getList(1);}, 1000);
            }else{
              $.dialog.alert(data.info);
              t.siblings("a").show();
              t.removeClass("load");
            }
          },
          error: function(){
            $.dialog.alert(langData['siteConfig'][6][203]);//网络错误，请稍候重试！
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


  // 初始加载
  getList(1);
  function getList(is){
    if(is){
        atpage = 1;
        objId.html('');
    }
    isload = true;
    objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');//加载中，请稍候

    $.ajax({
      url: masterDomain+"/include/ajax.php?service=renovation&action=diary&u=1&orderby=1&page="+atpage+"&pageSize="+pageSize,
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(data && data.state != 200){
          if(data.state == 101){
            objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
          }else{
            $('.loading').remove();
            var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

            //拼接列表
            if(list.length > 0){

              var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
              var param = t + "id=";
              var urlString = editUrl + param;

              for(var i = 0; i < list.length; i++){
                var item   = [],
                    id     = list[i].id,
                    title   = list[i].title,
                    litpic  = list[i].litpic,
                    click   = list[i].click,
                    pubdate = huoniao.transTimes(list[i].pubdate, 1);
                    url     = list[i].url;

                html.push('<div class="item fn-clear" data-id="'+id+'">');
                html.push('<div class="item-img"><a href="'+url+'"><img src="'+litpic+'" /></a></div>');
                html.push('<div class="item-txt">');
                html.push('<a href="'+url+'">');
                html.push('<p class="name">'+title+'</em></p>');
                html.push('<p class="post">'+langData['siteConfig'][19][394]+'：'+click+langData['siteConfig'][13][26]+'</p>');
                html.push('<p class="post">'+langData['siteConfig'][11][8]+'：'+pubdate+'</p>');

                var arcrank = "";
                if(list[i].arcrank == 0){
                  html.push('<p class="gray">'+langData['siteConfig'][9][21]+'</p>');
                }else if(list[i].arcrank == 2){
                  html.push('<p class="red">'+langData['siteConfig'][9][35]+'</p>');
                }
                html.push('</a>');
                html.push('<p class="operate">');
                html.push('<a href="'+urlString+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');//编辑 -- 删除
                html.push('</p>');
                html.push('</div>');
                html.push('</div>');

              }

              $('.loading').remove();
              objId.append(html.join(""));
              isload = false;

            }else{
              if(atpage == 1){
                objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
              }else{
                objId.append("<p class='loading'>"+langData['siteConfig'][45][87]+"</p>");//已加载全部信息！               
              }
            }

            totalCount = pageInfo.totalCount;

            switch(state){
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


            $("#audit").html(pageInfo.audit);
            $("#gray").html(pageInfo.gray);
            $("#refuse").html(pageInfo.refuse);
          }
        }else{
          objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
        }
      }
    });
  }


})
