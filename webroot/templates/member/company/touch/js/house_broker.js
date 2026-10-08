/**
 * 会员中心——经纪人管理
 * by guozi at: 20150627
 */

var objId = $("#list"), isload = false;
$(function(){

  //原生APP后退回来刷新页面
  pageBack = function(data) {
    setupWebViewJavascriptBridge(function(bridge) {
      bridge.callHandler("pageRefresh", {}, function(responseData){});
    });
  }

  $('#searchForm').submit(function(e){
    e.preventDefault();
    getList(1);
  })

  // 项目
  $(".tab .type").bind("click", function(){
    var t = $(this), id = t.attr("data-id"), index = t.index();
    if(!t.hasClass("curr") && !t.hasClass("sel")){
      state = id;
      atpage = 1;
      $('#list').html('');
      t.addClass('curr').siblings().removeClass('curr');
      getList(1);
    }
  });

  // 下拉加载
  $('#list').scroll(function() {
    var h = $('.item').height();
    var allh = $('body').height();
    var w = $('#list').height();
    var scroll = allh - w - h;
    if ($('#list').scrollTop() > scroll && !isload) {
      atpage++;
      getList();
    };
  });

  getList(1);

  objId.delegate(".del", "click", function(){
    var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
    if(id){
      $('.model_del').show().data('t', $(this));
      $('.desk').fadeIn();
    }      
  });
  $('.model .close, .model .cancel, .desk').click(function(){
    $('.model, .desk').hide();
  })

  $('.model_del .ok').click(function(){
    var t = $('.model_del').data('t'), par = t.closest(".item"), id = par.attr('data-id');
    $.ajax({
      url: masterDomain+"/include/ajax.php?service=house&action=operZjUser&type=del&id="+id+"&comid="+comid,
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        t.removeClass("disabled");
        if(data && data.state == 100){
          $('.model_del .close').click();
          getList(1);
          par.remove();
        }else{
          $.dialog.alert(langData['siteConfig'][27][107]);
        }
      },
      error: function(){
        $.dialog.alert(langData['siteConfig'][27][108]);
      }
    });
  })


});

function getList(is){

  if(is){
    atpage = 1;
    objId.html('');
  }

  objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

  isload = true;
  var keywords = $('.keywords').val();

  $.ajax({
    url: masterDomain+"/include/ajax.php?service=house&action=zjUserList&type=getnormal&u=1&comid="+comid+"&state=1&keywords="+keywords+"&page="+atpage+"&pageSize="+pageSize,
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
                  id        = list[i].id,
                  nickname  = list[i].nickname,
                  phone     = list[i].phone,
                  store     = list[i].store,
                  url       = list[i].url,
                  photo     = list[i].photo,
                  click     = list[i].click,
                  saleCount = list[i].saleCount,
                  zuCount   = list[i].zuCount,
                  xzlCount  = list[i].xzlCount,
                  spCount   = list[i].spCount,
                  cfCount   = list[i].cfCount,
                  pubdate   = huoniao.transTimes(list[i].pubdate, 2);

              html.push('<div class="item" data-id="'+id+'">');
              html.push(' <div class="pic"><img src="'+(photo != '' ? huoniao.changeFileSize(photo, "middle") : '/static/images/default_user.jpg')+'" alt=""></div>');
              html.push(' <div class="info">');
              html.push('   <p class="name">'+nickname+'</p>');
              html.push('   <p class="tel">'+(phone ? phone : '&nbsp;')+'</p>');
              html.push('   <p class="time">'+langData['siteConfig'][45][75]+'：'+pubdate);//加入时间
              html.push('   <span class="o">');
              html.push('    <a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');//删除
              html.push('    <a href="'+editUrl+id+'" class="edit">'+langData['siteConfig'][6][6]+'</a>');//编辑
              html.push('   </span>');
              html.push(' </div>');
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

        }
      }else{
        $("#total").html(0);
        objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
      }
    }
  });
}
