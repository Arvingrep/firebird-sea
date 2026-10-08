var action, objId = $('.homemaking-list'), lei = 0;

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
      var result = confirm(langData['siteConfig'][20][211]);
      if(result){
          $.ajax({
              url: masterDomain+"/include/ajax.php?service=homemaking&action=del&id="+id,
              type: "GET",
              dataType: "json",
              success: function (data) {
                  if(data && data.state == 100){

                      //删除成功后移除信息层并异步获取最新列表
                      par.slideUp(300, function(){
                          par.remove();
                          setTimeout(function(){getList(1);}, 200);
                      });
                      alert(langData['siteConfig'][20][444]);

                  }else{
                      alert(data.info);
                  }
              },
              error: function(){
                  alert(langData['siteConfig'][20][183]);
              }
          });

      }else{
      }
    }
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

  $.ajax({
    url: masterDomain+"/include/ajax.php?service=homemaking&action=hList&u=1&orderby=5&state="+state+"&page="+atpage+"&pageSize="+pageSize,
    type: "GET",
    dataType: "jsonp",
    success: function (data) {
      if(data && data.state != 200){
        if(data.state == 101){
          objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
        }else{
          var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
          
          //拼接列表
          if(list.length > 0){

            var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
            var param = t + "do=edit&id=";
            var urlString = editUrl + param;

            for(var i = 0; i < list.length; i++){
              var item        = [],
                  id          = list[i].id,
                  title       = list[i].title,
                  sale        = list[i].sale,
                  click       = list[i].click,
                  price       = list[i].price,
                  url         = list[i].url,
                  litpic      = list[i].litpic,
                  homemakingtype     = list[i].homemakingtype,
                  pubdate     = huoniao.transTimes(list[i].pubdate, 1);

                url = list[i].state != "1" ? 'javascript:;' : url;

                html.push('<div class="house-box item" data-id="'+id+'" data-title="'+title+'">');
                html.push('<div class="title">');
                var apa = [];
                html.push('<span style="color:#919191;font-size: .24rem;">'+langData['siteConfig'][11][8]+'：'+pubdate+'</span>');
                html.push('</div>');
                html.push('<div class="house-item fn-clear">');
                if(litpic != "" && litpic != undefined){
                  html.push('<div class="house-img fn-left">');
                  html.push('<a href="'+url+'">');
                  html.push('<img src="'+huoniao.changeFileSize(litpic, "small")+'" />');
                  html.push('</a>');
                  html.push('</div>');
                }
                html.push('<dl>');
                html.push('<a href="'+url+'">');
                html.push('<dt>'+title+'</dt>');
                html.push('<dd class="manage_order"><em class="or_num">'+langData['homemaking'][7][15]+'<span>'+sale+'</span></em><em class="see_num">'+langData['homemaking'][7][16]+'<span>'+click+'</span></em></dd>');  //订单量   浏览量
                var sp_area = '';
                if(homemakingtype == 0){
                  sp_area = langData['homemaking'][8][59];
                }else if(homemakingtype == 1){
                  sp_area = langData['homemaking'][8][60];
                }else if(homemakingtype == 2){
                  sp_area = langData['homemaking'][8][61];
                }
                html.push('<dd class="item-area"><em class="sp_room">'+echoCurrency('symbol')+'<span>'+price+'</span></em><em class="sp_area">'+sp_area+'</em></dd>');
                html.push('</a>');
                html.push('</dl>');
                html.push('</div>');
                html.push('<div class="o fn-clear">');                 
                html.push('<a href="'+urlString+id+'" class="edit">'+langData['homemaking'][7][17]+'</a>');    // 编辑         
                html.push('<a href="javascript:;" class="del">'+langData['homemaking'][3][20]+'</a>');        // 删除      
                html.push('</div>');
                html.push('</div>');

        
            }

            objId.append(html.join(""));
            $('.loading').remove();
            isload = false;
            if(atpage >= pageInfo.totalPage){
                isload = true;
                objId.append('<p class="loading">'+langData['homemaking'][8][65]+'</p>');
            }

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
