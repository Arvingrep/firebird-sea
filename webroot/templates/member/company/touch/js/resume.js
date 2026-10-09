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


  //类型切换
  $(".tab .type").bind("click", function(){
    var t = $(this), id = t.attr("data-id"), index = t.index();
    if(!t.hasClass("curr")){
      isload = false;
      lei = id;
      atpage = 1;
      $('.count li').eq(index).show().siblings("li").hide();
      t.addClass("curr").siblings("li").removeClass("curr");
      objId.html('');
      getList(1);
    }
  });

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
    url: masterDomain+"/include/ajax.php?service=job&action=deliveryList&type=company&state="+lei+"&page="+atpage+"&pageSize="+pageSize,
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

              html.push('<div class="item'+(detail ? '' : ' invalid')+'" data-id="'+id+'">');
              html.push('<div class="txtbox">');
              html.push('<p class="name"><a href="'+post['url']+'">'+langData['siteConfig'][26][178]+'：'+post['title']+'</a></p>');
              html.push('<p class="date">'+langData['siteConfig'][19][409]+'：'+date+'</p>');
              if(detail != null){
                html.push('<a href="'+detail['url']+'" class="user">');
                html.push('<img src="'+(detail['photo'] ? detail['photo'] : staticPath +'images/default_user.jpg')+'" />');
                html.push('<p>'+langData['siteConfig'][19][4]+'：'+detail['name']+'</p>');
                html.push('<p>'+langData['siteConfig'][19][7]+'：'+(detail['sex'] == 0 ? langData['siteConfig'][13][4] : langData['siteConfig'][13][5])+'</p>');
                html.push('<p style="margin-bottom:.1rem;">'+langData['siteConfig'][19][12]+'：'+detail['age']+'</p>');
                html.push('<p>'+langData['siteConfig'][19][769]+'：'+detail['home']+'</p>');
                html.push('<p>'+langData['siteConfig'][26][179]+'：'+detail['workyear']+langData['siteConfig'][13][14]+'</p>');
                html.push('<p>'+langData['siteConfig'][19][165]+'：'+detail['educationalname']+'</p>');
                html.push('<p>'+langData['siteConfig'][19][144]+'：'+detail['college']+'</p>');
                html.push('</a>');
              }else{
                html.push('<p class="company">'+langData['siteConfig'][21][67]+langData['siteConfig'][19][508]+'</p>');
                html.push('<p class="date">'+date+'</p>');
              }      
              html.push('</div>');
              html.push('<div class="btnbox">');

              var states = "";
              switch (state) {
                case "0":
                  states = langData['siteConfig'][9][31];
                  break;
                case "1":
                  states = langData['siteConfig'][9][32];
                  break;
                case "2":
                  states = langData['siteConfig'][9][33];
                  break;
              }
              html.push('<div class="state">'+states+'</div>');
              html.push('<span class="link">'+langData['siteConfig'][6][138]);
              html.push('<select class="select">');
              html.push('<option value="">'+langData['siteConfig'][7][2]+'</option>');
              html.push('<option value="0"'+(state == 0 ? ' selected' : '')+'>'+langData['siteConfig'][9][31]+'</option>');
              html.push('<option value="1"'+(state == 1 ? ' selected' : '')+'>'+langData['siteConfig'][9][32]+'</option>');
              html.push('<option value="2"'+(state == 2 ? ' selected' : '')+'>'+langData['siteConfig'][9][33]+'</option>');
              html.push('</select>');
              html.push('</span>');
              html.push('</div>');
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
