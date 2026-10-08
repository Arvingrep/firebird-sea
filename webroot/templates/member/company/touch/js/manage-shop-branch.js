
var objId = $('.list'), isload = false;
$(function(){

	$(".tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id"), index = t.index();
		if(!t.hasClass("curr")){
			state = id;
			atpage = 1;
      t.addClass("curr").siblings("li").removeClass("curr");
      objId.html('');
			getList(1);
		}
	});

  //删除
  var M={};
  objId.delegate(".delete", "click", function(){

    var t = $(this), par = t.closest(".item"), id = par.attr("data-id"),orderCount = par.attr("data-ocount");

    var popOptions = {
      title:'确定删除该分店吗',
      confirmTip:'删除后该分店下的历史订单将由总店接管',
      btnColor:'#3377FF',
      btnSure:'确定删除',
      isShow:true,
      popClass:'shopbranch',
    }
    if(orderCount > 0){
      popOptions.popClass = 'shopbranch2';
      popOptions.title = '该分店有未完成订单，确定删除吗';
      popOptions.confirmTip = '删除分店后订单将由总店接管，可至订单详情页面重新分配。';
    }
    confirmPop(popOptions,function(){
      $.ajax({
        url: "/include/ajax.php?service=shop&action=storeBranchConfig&oper=del&id="+id,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
          if(data && data.state == 100){
            //删除成功后移除信息层并异步获取最新列表
            objId.html('');
            atpage = 1;
            getList(1);

          }else{
            showErrAlert(data.info);
          }
        },
        error: function(){
          showErrAlert(langData['siteConfig'][20][227]);
        }
      });
    })
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



})
  function getList(is){

    isload = true;
    objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');//加载中，请稍候


    $.ajax({
      url: "/include/ajax.php?service=shop&action=storeBranch&u=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
              var param2 = t + "branchid=";
              var urlString = editUrl + param;
              var urlString2 = orurl + param2;

              for(var i = 0; i < list.length; i++){
                var item      = [],
                    id        = list[i].id,
                    title     = list[i].title,
                    sta       = list[i].state,
                    url       = state == 1 ? list[i].url : "javascript:;",
                    people     = list[i].people,
                    tel   = list[i].tel,
                    address = list[i].address,
                    logo    = list[i].logo,
                    pubdate    = huoniao.transTimes(list[i].pubdate, 1).replace(/-/g,'.');

                  var arcrank = "";
                  if(list[i].state == 0){
                    arcrank = langData['siteConfig'][26][74];
                  }else if(list[i].state == 1){
                    arcrank = langData['siteConfig'][19][392];
                  }else if(list[i].state == 2){
                    arcrank = langData['siteConfig'][9][35];
                  }else if(list[i].state == 3){
                    arcrank = langData['siteConfig'][19][507];
                  }
                html.push('<div class="item fn-clear" data-id="'+id+'" data-ocount="0">');
                html.push('<div class="branchstate">');
                html.push('<em>最近更新：'+pubdate+'</em>');
                html.push('<span>'+arcrank+'</span>');
                html.push('</div>');
                html.push('<div class="branchInfo">');
                if(logo != ""){
                  html.push('<div class="item-img"><a href="javascript:;"><img src="'+logo+'"  onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"/></a></div>');
                }

                html.push('<div class="item-txt">');
                html.push('<a href="javascript:;" class="item-tit">'+title+'</a>');
                html.push('<p class="fendInfo">联系人：'+people+'</p>');
                var len = list[i].addr.length;
                html.push('<p class="fendAdr"><span>店铺地址：'+list[i].addr[len-2]+list[i].addr[len-1]+address+'</span>');//
                html.push('</p>');
                html.push('</div>');
                html.push('</div>');
                html.push('<p class="opWrap fn-clear">');

                html.push('<a href="javascript:;" class="delete"><i></i>'+langData['siteConfig'][6][8]+'</a>');//删除
                html.push('<a href="'+urlString+id+'" class="edit"><i></i>'+langData['siteConfig'][6][6]+'</a>');//编辑
                html.push('<a href="'+urlString2+id+'" class="dianor"><i></i>店铺订单</a>');//店铺订单

                html.push('</p>');
                html.push('</div>');

              }

              $('.loading').remove();
              objId.append(html.join(""));
              isload = false;

            }else{
              if(atpage == 1){
                objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
              }else{
                objId.append("<p class='loading'>已经到底了~</p>");//已加载全部信息！
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
  //关键词搜索

  function CheckformInfo() {
      if (event.keyCode == 13) {
          atpage = 1;
          $('.list').html('');
          getList(1);
      }
  }
