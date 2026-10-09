$(function(){

    // banner轮播图
    new Swiper('.banner .swiper-container', {pagination: '.pagination',slideClass:'slideshow-item',paginationClickable: true, loop: true,autoplay:2000, autoplayDisableOnInteraction : false});


    // 判断设备类型，ios全屏
	var device = navigator.userAgent;
  if(device.indexOf('huoniao') > -1){
    // $('.areaChose').bind('click', function(e){
    //   setupWebViewJavascriptBridge(function(bridge) {
    //     bridge.callHandler('goToCity', {'module': 'vote'}, function(){});
    //   });
    //   return false;
    // });
  }
  //回到顶部
    var h2_height = $(".searchbox").offset().top;
    $(window).scroll(function(){
        var this_scrollTop = $(this).scrollTop();
        if(this_scrollTop>h2_height ){
            $(".gotop").show();
        }else{
            $(".gotop").hide();
        }
    });

//点击搜索
    $('.searchbox .btnsearch').bind('click', function () {
        if($('.txtsearch').val()){
        	$("#myform").submit();
            //location.href="search.html?="+$('.txtsearch').val();
        }
    })


	var objId = $('#listCon'), atpage = 1, totalPage = 1; pageSize = 6, isload = false, load = $('.load');

	getList();

	function getList(){
		isload = true;
		  $.ajax({
          url: "/include/ajax.php?service=vote&action=vlist&page="+atpage+'&pageSize='+pageSize,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
              if(data){
                  if(data.state == 100){
                      var list = data.info.list, html = [];
                      var pageInfo = data.info.pageInfo;
                      var imgurl='';
                      if(list.length > 0){
                          for(var i = 0; i < list.length; i++){
                              var obj = list[i], item = [],

                              state = obj.state;
  							  var stateTxt;
  							  if (state == 1) {
  							  	stateTxt = '投票中';
  							  }else {
  							    stateTxt = '已结束';
  							  }
  							  var pic = obj.litpic == false || obj.litpic == '' ? '/static/images/blank.gif' : obj.litpic;

                              item.push('<div class="item">');
                              item.push('  <a href="'+obj.url+'">');
                              if(obj.litpic){
                              	item.push('    <div class="eg-box"><img src="'+pic+'" alt="'+obj.title+'"></div>');
                              }else{
                              	item.push('<div class="eg-box"></div>');
                              }
                              item.push('    <p>'+obj.title+'</p>');
                              item.push('    <div class="see"><i class="b"></i><span>'+obj.join+'</span><i class="s"></i><span>'+obj.click+'</span></div>');
                              item.push('  </a>');
                              item.push('</div>');

                              html.push(item.join(""));
                          }

                          objId.append(html.join(""));
                          if(pageInfo.totalPage == 1){
                            load.html('已加载全部信息！');
                          }else{
  								isload = false;
                          }
                      }else{
                        if(!pageInfo.totalCount){
                          load.html('暂无相关信息！');
                        }else{
                          load.html('已加载全部信息！');
                        }
                      }
                  }else{
                      load.html('暂无相关信息！');
                  }
              }
          },
          error: function(){
            load.html('网络错误，请重试！');
            isload = false;
          }
      })
	}


	// 上拉加载
	$(window).scroll(function() {
		var allh = $('.vote-list').height();
		var w = $(window).height();
		var scroll = allh  - w;
		if ($(window).scrollTop() > scroll && !isload) {
				atpage++;
				getList();
		};
	});




});
