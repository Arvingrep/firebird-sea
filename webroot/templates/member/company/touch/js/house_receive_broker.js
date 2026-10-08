/**
 * 会员中心——经纪人收到的看房预约
 * by guozi at: 20150627
 */

var objId = $("#list"), isload = false;
$(function(){

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

  // 通过
  objId.delegate(".suc", "click", function(){
    var t = $(this).closest('.item');
    var title = $('.model_del .model_title'), val = title.data("agree");
    title.text(val);
    $('.model_del').show().data({'type':'agree','tab': t});
    $('.desk').fadeIn();
  });
  // 拒绝
  objId.delegate(".fail", "click", function(){
    var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title, newstate;
    if(id){
      $('.model_fail textarea').val('');
      $('.model_fail .choose label:eq(0)').addClass('active').siblings().removeClass('active');
      $('.model_fail .info').removeClass('show').text('');
      $('.model_fail').show().data('id', id);
      $('.desk').fadeIn();
    }
  });
  //删除
  objId.delegate(".del", "click", function(){
    var t = $(this).closest('.item');
    var title = $('.model_del .model_title'), val = title.data("del");
    title.text(val);
    $('.model_del').show().data({'type':'del','tab': t});
    $('.desk').fadeIn();
  });
  // 关闭弹框
  $('.model .close, .model .cancel, .desk').click(function(){
    $('.model, .desk').hide();
  })
  // 切换拒绝原因
  $('.model_fail .choose label').click(function(){
    var t = $(this);
    t.addClass('active').siblings().removeClass('active');
  })

  // 确定通过或删除
  $('.model_del .ok').click(function(){
    var par = $('.model_del').data('tab'), type = $('.model_del').data('type'), id = par.attr('data-id');
    var newstate = type == "agree" ? 1 : 0;
    $.ajax({
      url: masterDomain+"/include/ajax.php?service=house&action=operZjUser&type="+type+"&id="+id+"&comid="+comid+"&state="+newstate,
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(data && data.state == 100){

          $('.model_del .close').click();
          //删除成功后移除信息层并异步获取最新列表
          par.remove();
          setTimeout(function(){getList(1);}, 200);
        }else{
          alert(data.info);
        }
      },
      error: function(){
        alert(langData['siteConfig'][20][183]);
      }
    });
  })
  // 确定拒绝
  $('.model_fail .ok').click(function(){
    var fail_type = $('.model_fail .choose label.active').data("id");
    var fail_info = $('.model_fail textarea').val();
    var info = $('.model_fail .info');
    info.removeClass('show').text('');
    var id = $('.model_fail').data('id');
    $.ajax({
      url: masterDomain+"/include/ajax.php?service=house&action=updateBrokerState&state=2&id="+id+"&fail_type="+fail_type+'&fail_info='+fail_info,
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(data && data.state == 100){
          $('.model_fail .close').click();
          getList(1);
        }else{
          alert(data.info);
        }
      },
      error: function(){
        alert(langData['siteConfig'][20][183]);
      }
    });
  })

});

function getList(is){

  if(is){
    objId.html('');
  }

  objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

  isload = true;

  $.ajax({
    url: masterDomain+"/include/ajax.php?service=house&action=zjUserList&iszjcom=1&comid="+comid+"&u=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
    type: "GET",
    dataType: "jsonp",
    success: function (data) {
      $('.loading').remove();
      if(data && data.state != 200){
        if(data.state == 101){
          $("#total").html(0);
          $("#state1").html(0);
          $("#state0").html(0);
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
                  aid      = list[i].aid,
                  title    = list[i].title,
                  nickname = list[i].nickname,
                  phone    = list[i].phone,
                  photo    = list[i].photo,
                  qq       = list[i].qq,
                  qqQr     = list[i].qqQr,
                  wx       = list[i].wx,
                  wxQr     = list[i].wxQr,
                  istate   = list[i].state,
                  license  = list[i].license,
                  detail   = list[i].detail,
                  pubdate  = huoniao.transTimes(list[i].pubdate, 1);


              if(istate == "0"){
                bj_btn = '<a href="javascript:;" class="bj">'+langData['siteConfig'][6][138]+'</a>';//标记
                date_btn = '<span class="date">'+langData['siteConfig'][32][2]+'</span>';//未处理
              }else{
                date_btn = '<span class="date">'+langData['siteConfig'][9][64]+'</span>';//已处理
              }
              html.push('<div class="item" data-id="'+id+'">');
              html.push('  <p class="name">'+nickname+'<span class="time">'+pubdate+'</span></p>');
              html.push('  <p class="tel">'+phone+'</p>');
              html.push('  <div class="o fn-clear">');
              if(istate == "0"){
                html.push('   <a href="javascript:;" class="bj del">'+langData['siteConfig'][6][8]+'</a><a href="javascript:;" class="bj suc">'+langData['siteConfig'][9][2]+'</a><a href="javascript:;" class="bj fail">'+langData['siteConfig'][9][3]+'</a>');//删除--通过--拒绝 -- 
              }else if(istate == "1"){
                html.push('   <a href="javascript:;" class="bj del">'+langData['siteConfig'][6][8]+'</a><span class="bj state1">'+langData['siteConfig'][45][70]+'</span>');//删除--已通过
              }else if(istate == "2"){
                html.push('   <a href="javascript:;" class="bj del">'+langData['siteConfig'][6][8]+'</a><span class="bj state2">'+langData['siteConfig'][45][69]+'</span>');//删除--已拒绝
              }
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

          $("#total").html(pageInfo.totalCount);
          $("#state1").html(pageInfo.state1 + pageInfo.state2);
          $("#state0").html(pageInfo.state0);

        }
      }else{
        $("#total").html(0);
        objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
      }
    }
  });
}
