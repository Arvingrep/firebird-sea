/**
 * 会员中心邀请记录管理
 */

var objId = $(".list"), lei = 0, isload = false;
$(function(){

  //导航
  $('.header-r .screen').click(function(){
    var nav = $('.nav'), t = $('.nav').css('display') == "none";
    if (t) {nav.show();}else{nav.hide();}
  })


  getList(1);

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

  //标记
  objId.delegate(".select ", "change", function(){

    var id = $(this).closest(".item").attr("data-id");
        var state = $(this).val();

    $.ajax({
      url: masterDomain + "/include/ajax.php?service=job&action=deliveryUpdate&id="+id+"&state="+state,
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(data.state == 100){
          objId.html('');
          getList();
        }else{
          alert(data.info);
        }
      },
      error: function(){
        alert(langData['siteConfig'][20][183]);
      }
    });
  });


});

function getList(is){
  if(isload) return;
  isload = true;

  if(is != 1){
    // $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
  }

  objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

  $.ajax({
    url: masterDomain+"/include/ajax.php?service=job&action=invitationList&type=company&page="+atpage+"&pageSize="+pageSize,
    type: "GET",
    dataType: "jsonp",
    success: function (data) {
      if(data && data.state != 200){
        if(data.state == 101){
          objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
        }else{
          var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
          var totalCount = 0;
          switch(parseInt(lei)){
            case "":
              totalCount = pageInfo.totalCount;
              break;
            case 0:
              totalCount = pageInfo.state0;
              break;
            case 1:
              totalCount = pageInfo.state1;
              break;
            case 2:
              totalCount = pageInfo.state2;
              break;
          }

          //拼接列表
          if(list.length > 0){
            for(var i = 0; i < list.length; i++){
              var item  = [],
                id    = list[i].id,
                post  = list[i].post,
                state = list[i].state,
                detail = list[i].resume,
                date  = list[i].date;

                html.push('<div class="item" data-id="3">');
                html.push('  <div class="checkbox fn-clear">');
                // html.push('    <em href="javascript:;" class="inp"></em>');
                html.push('    <p class="post">'+langData['siteConfig'][26][164]+'：'+post.title+'</p>');
                html.push('    <p class="time">'+langData['siteConfig'][23][110]+'：'+list[i].date+'</p>');
                // html.push('    <em href="javascript:;" class="del">删除</em>');
                html.push('  </div>');
                if(detail != null){
                  html.push('  <a href="'+detail['url']+'" class="fn-clear">');
                  html.push('    <div class="img-box fn-left">');
                  html.push('      <img src="'+(detail['photo'] ? detail['photo'] : staticPath +'images/default_user.jpg')+'" alt="">');
                  html.push('    </div>');
                  html.push('    <div class="img-txt fn-left">');
                  html.push('      <h3>'+detail['name']+'</h3>');
                  html.push('      <p class="grey">'+detail['home']+'</p>');
                  html.push('      <p class="grey area"><span>'+detail['college']+'</span><span>'+detail['educationalname']+'</span></p>');
                  html.push('    </div>');
                  html.push('  </a>');
                }else{
                  html.push('<dl>');
                  html.push('<dt><a href="javascript:;" class="overtime">'+langData['siteConfig'][20][282]+'</a></dt>');
                  html.push('</dl>');
                }
                html.push('</div>');
              }
              $('.loading').remove();
              objId.append(html.join(""));

              isload = false;

          }else{
            $('.loading').remove();
            objId.append("<p class='loading'>"+(totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185])+"</p>");
          }

          $("#state0").html(pageInfo.state0);
          $("#state1").html(pageInfo.state1);
          $("#state2").html(pageInfo.state2);
        }
      }else{
        objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
        isload = false;
      }
    }
  });
}
