$(function(){
function follow(id){
	$.post("/include/ajax.php?service=live&action=followMember&id="+id, function(){
	});
}
$(".head_care").delegate(".isfollow","click", function(){
		var t = $(this),id=t.attr('data-id');
		if (t.hasClass('btn_care1')) {
			t.removeClass('btn_care1').addClass('btn_care').text('关注');
			follow(id);
		}else{
			t.removeClass('btn_care').addClass('btn_care1').text('已关注');
			follow(id);
		}
	});
  var page=$('.container_nav .active').attr('data-page'),range = 100,isload=false,totalheight = 0;; //距下边界长度/单位px
  //主播列表切换
   $(".nav_tab .tab_title").click(function(){
       var index=$(this).index();
       type = $(this).attr('data-action');
       $(this).addClass("active").siblings().removeClass("active");
       $(".con_list").eq(index).addClass("an_show").siblings().removeClass("an_show");
       page=1;
       isload=false;
       getList();

       //type=$('.container_nav .active').attr('data-action');
       $('.live').html('');
       $('.fans').html('');
       $('.care').html('');
   });

  $(window).scroll(function(){
        var srollPos = $(window).scrollTop(); //滚动条距顶部距离(页面超出窗口的高度)
        totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
        if(($(document).height()-range) <= totalheight&& !isload) {
        	page++;
			getList();
        }
  });
  getList();
  // 异步获取列表
  function getList(){
    var active = $('.container_nav .active'), action = active.attr('data-action'), url,id=$('#hiddenid').val();
    //page = active.attr('data-page');
    if (action == "live") {
      url = masterDomain + "/include/ajax.php?service=live&action=alive&type=3&page=" + page + "&uid="+id+"&pageSize=10";
    }else if (action == "fans" || type=="fans") {
      url = masterDomain + "/include/ajax.php?service=live&action=follow&page=" + page  +"&uid="+id+ "&pageSize=10";
    }else if (action == "care" || type=="care") {
      url = masterDomain + "/include/ajax.php?service=live&action=follow&type=follow&page=" + page +"&uid="+id+ "&pageSize=10";
    }
	isload = true;
    $.ajax({
      url: url,
      type: "GET",
      dataType: "jsonp",
      success: function(data){
        if (data && data.state != 200) {
          if (data.state == 101) {
            $('.loading, .loadmore').remove();
            $('.container_list .con_list').append('<div class="loadmore">已加载全部数据</div>');
          }else {
            $('.container_list .con_list').append('<div class="loadmore">加载中...</div>')
            var list = data.info.list, liveHtml = [],careHtml = [], fansHtml = [] ;
            var totalPage = data.info.pageInfo.totalPage;active.attr('data-totalPage', totalPage);
            for (var i = 0; i < list.length; i++) {
              var lr = list[i];
              // 直播模块
              if (action == "live") {
                  liveHtml.push('<li class="anchor_box">');
                  liveHtml.push('<a href="' + lr.url + '">');
                  //var stateText = lr.state==1 ? '直播' : '回放';
                  var stateText = lr.state==0 ? '未直播' : (lr.state==1 ? '直播中' : '精彩回放');
                  liveHtml.push('<div class="an_left"><img src="' + lr.litpic + '" alt=""><div class="playback state'+lr.state+'">'+stateText+'</div></div>');
				  liveHtml.push('<div class="an_right"><h5>' + lr.title + '</h5><p><span><img src="'+templatePath+'images/anchor_time.png"alt="">'+lr.ftime+' </span></p>');
                  liveHtml.push('<p class="an_style"><span><img src="'+templatePath+'images/live_people.png" alt="">'+lr.click+' </span><span class="sec_style"><img src="'+templatePath+'images/anchor_like.png" alt="">'+lr.click+' </span></p>');
                  liveHtml.push('</a></li>');
              // 粉丝模块
              }else if (action == "fans" || type=="fans") {
                  fansHtml.push('<li class="box_info">');
                  fansHtml.push('<a href="'+lr.userurl+'">');
                  fansHtml.push('<div class="fans_img"><img src="'+lr.photo+'" alt=""></div>');
                  fansHtml.push('<p>'+lr.nickname+'</p>');
                  fansHtml.push('</a>');
                  fansHtml.push('</li>');
              // 关注模块
              }else if (action == "care"  || type=="care") {
                  careHtml.push('<li class="box_info">');
                  careHtml.push('<a href="'+lr.userurl+'">');
                  careHtml.push('<div class="fans_img"><img src="'+lr.photo+'" alt=""></div>');
                  careHtml.push('<p>'+lr.nickname+'</p>');
                  careHtml.push('</a>');
                  careHtml.push('</li>');
              }
            }

              $('.loading, .loadmore').remove();
              //$('.live').html(liveHtml.join(""));
              //$('.fans').html(fansHtml.join(""));
              //$('.care').html(careHtml.join(""));
              $('.live').append(liveHtml.join(""));
              $('.fans').append(fansHtml.join(""));
              $('.care').append(careHtml.join(""));

            if(data.info.pageInfo.totalPage == page){
              //$('.container_list .con_list').append('<div class="loadend">已加载全部数据</div>');
            }
            if(page >= data.info.pageInfo.totalPage){
				isload = true;
			}else{
				isload = false;
			}
          }
        }
      }
    })

  }

})

var	scrollDirect = function (fn) {
  var beforeScrollTop = document.body.scrollTop;
  fn = fn || function () {
  };
  window.addEventListener("scroll", function (event) {
      event = event || window.event;

      var afterScrollTop = document.body.scrollTop;
      delta = afterScrollTop - beforeScrollTop;
      beforeScrollTop = afterScrollTop;

      var scrollTop = $(this).scrollTop();
      var scrollHeight = $(document).height();
      var windowHeight = $(this).height();
      if (scrollTop + windowHeight > scrollHeight - 10) {
          return;
      }
      if (afterScrollTop < 10 || afterScrollTop > $(document.body).height - 10) {
          fn('up');
      } else {
          if (Math.abs(delta) < 10) {
              return false;
          }
          fn(delta > 0 ? "down" : "up");
      }
  }, false);
}
