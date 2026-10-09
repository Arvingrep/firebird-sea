$(function () {

  //回到顶部
    var h2_height = $(".sordnav").offset().top;
    $(window).scroll(function(){
        var this_scrollTop = $(this).scrollTop();
        if(this_scrollTop>h2_height ){
            $(".gotop").show();
        }else{
            $(".gotop").hide();
        }
    });

    //搜索页导航

    $('.sordnav li').click(function () {
        $(this).addClass('active');
        $(this).siblings('li').removeClass('active');
        if($(this).index()!=3){
			getList(1);
        }
    });

    $('.sort').click(function () {
        if($('.drop-down').is(':hidden')){
            $('.drop-down').show();
        }else{
            $('.drop-down').hide();
        }
    });

    //鼠标点击下拉列表项

    $('.drop-down li a').click(function(){
    	var t = $(this);
    	$('.sort').attr("data-id",t.attr('data-id'));
        $('.sort span').text($(this).text());
        getList(1);
        $('.drop-down').hide();
    });


    //点击搜索
    $('.searchbox .btnsearch').bind('click', function () {
        //if($('.txtsearch').val()){
        	$("#myform").submit();
            //location.href="search.html?="+$('.txtsearch').val();
        //}
    })


     var objId = $('#listCon'), atpage = 1, totalPage = 1; pageSize = 6, isload = false, load = $('.load');

    getList();

    function getList(tr){

	   	if(tr){
			atpage = 1;
			objId.html("");
		}

	  var data = [];

	  var state = $('.sort').attr('data-id');
	  if(state != undefined && state != ''){
		data.push("state="+state);
	  }

	  var orderby = $('.navitem:not(.sort).active').attr('data-id');
	  if(orderby != undefined && orderby != ''){
		data.push("orderby="+orderby);
	  }

	  var keywords = $('.txtsearch').val();
	  if(keywords != undefined && keywords != ''){
		data.push("keywords="+keywords);
	  }

      isload = true;
      $.ajax({
      url: "/include/ajax.php?service=vote&action=vlist&page="+atpage+'&pageSize='+pageSize,
      type: "GET",
      data:data.join("&"),
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

                          item.push('<div class="item">');
                          item.push('  <a href="'+obj.url+'">');
                          if(obj.litpic){
                            item.push('    <div class="eg-box"><img src="'+obj.litpic+'" alt="'+obj.title+'"></div>');
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
