/**
 * 会员中心——经纪人收到的看房预约
 * by guozi at: 20150627
 */

var objId = $("#list"), isload = false;
$(function(){

  // 项目
  // $(".tab .type").bind("click", function(){
  //   var t = $(this), id = t.attr("data-id"), index = t.index();
  //   if(!t.hasClass("curr") && !t.hasClass("sel")){
  //     state = id;
  //     atpage = 1;
  //     $('#list').html('');
  //     t.addClass('curr').siblings().removeClass('curr');
  //     getList(1);
  //   }
  // });

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
          url: masterDomain+"/include/ajax.php?service=house&action=operBookHouse&type=del&spec=out&state="+state+"&id="+id,
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
    url: masterDomain+"/include/ajax.php?service=house&action=bookHouseList&u=1&spec=out&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
                  aid      = list[i].aid,
                  title    = list[i].title,
                  date     = list[i].date,
                  username = list[i].username,
                  mobile   = list[i].mobile,
                  sex        = list[i].sex,
                  istate    = list[i].state,
                  type     = list[i].type,
                  note     = list[i].note,
                  detail   = list[i].detail,
                  pubdate  = list[i].pubdate;

              var url = detialUrl.replace('#type', type).replace('#id', aid);

              var hDetail = '';
              try{
                if(detail.id == aid){
                  hDetail = '<a href="'+url+'" class="title">'+title+'</a>';
                }
              }catch(err){
                hDetail = '<p class="title" title="'+langData['siteConfig'][31][122]+'">'+title+'（'+langData['siteConfig'][31][122]+'）</p>';//该房源已删除或状态异常，暂时无法查看
              }
              var bj_btn = '', date_btn = '', cls = '';
              // if(istate == "0"){
              //   bj_btn = '<a href="javascript:;" class="bj">'+langData['siteConfig'][6][138]+'</a>';//标记
              //   date_btn = '<span class="date">'+date+'</span>';
              // }else{
              //   date_btn = '<span class="date">'+langData['siteConfig'][32][7]+'</span>';//已看房
              // }

              date_btn = '<span class="date">'+date+'</span>';


              html.push('<div class="item state'+istate+'" data-id="'+id+'">');
              html.push('  <p class="user fn-clear"><span class="name">'+username+(sex == 1 ? langData['siteConfig'][19][693] : (sex == 2 ? langData['siteConfig'][19][694] : ''))+'&nbsp;&nbsp; <em>'+mobile+'</em></span>'+date_btn+'</p>');//先生 -- 女士
              html.push(hDetail);
              html.push('  <div class="o fn-clear">');
              html.push('   <span class="time">'+pubdate+'</span>');
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
