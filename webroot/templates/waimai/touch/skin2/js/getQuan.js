$(function(){
  var page = 1, isload = false;
  
  //火热抢券
	if($(".hot_qiang dd").length == 0){
      	$(".hot_qiang").hide()
    }	
  
  // 初次加载
  getQuanList()

// 滚动加载
$(window).scroll(function(){
  var bh = $('body').height();
  var wh = $(window).height() + 50;
  var sch = $(window).scrollTop();
  if(sch >= bh - wh && !isload){
    getQuanList();
  }
})


  function getQuanList(){
    if(isload) return false;
    isload = true;
    $(".loading").html('加载中~')
    $.ajax({
			url: '/include/ajax.php?service=waimai&action=receiveQuanList&getype=3&pageSize=10&page='+page,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data.state == 100){
          var list = data.info.list;
          var totalCount = data.info.pageInfo.totalCount;
          var quanlist = []
          for(var i = 0; i < list.length; i++){
            quanlist.push('<dd><a href="'+list[i].storeurl+'" class="shop_info">');
    				quanlist.push('<div class="shop_logo"><img src="'+list[i].shop_banner+'" onerror="this.src=\'/static/images/shop.png\'"></div>');
    				quanlist.push('<div class="shop_detail">');
    				quanlist.push('<h4>'+list[i].shopname+'</h4>');
    				quanlist.push('<p class="shop_yy"><span>月售'+list[i].salescount+'</span><span>配送费'+echoCurrency('symbol')+list[i].delivery_fee+'</span><span>'+list[i].delivery_time+'分钟</span></p>');
                    var promotions  = '';
    				for (var a = 0; a < list[i].promotions.length; a++){
                      if(list[i].promotions[a][1] > 0){
                         promotions+= "<span>"+list[i].promotions[a][0]+"减"+list[i].promotions[a][1]+"</span>";
                      }
                    }
    				quanlist.push('<p class="shop_yh">优惠叠加 '+promotions+'</p>');
    				quanlist.push('</div></a>');
    				quanlist.push('<div class="quan_show">');
    				quanlist.push('<div class="quan">');
    				quanlist.push('<div class="left"> <span class="q_num">￥<b>'+list[i].money+'</b></span>满'+list[i].basic_price+'可用 </div>');
    				if(list[i].is_lingqu ==0){

                        quanlist.push('<div class="right"><a href="javascript:;" class="getQuan qiangquan" data-id="'+list[i].id+'">立即领</a></div>');
                    }else{
                        quanlist.push('<div class="right"><a href="javascript:;" class="getQuan " data-id="'+list[i].id+'">已领取</a></div>');
                    }
    				quanlist.push('</div> </div> </dd>');
          }

          if(page == 1){
            $('.more_quan dd').remove();
          }
          $('.more_quan').append(quanlist.join(''));
          page++;
          isload = false;
          $(".loading").html('下拉加载更多~');
          if(page > totalCount){
            isload = true;
            $(".loading").html('没有更多了~');
          }
        }else{
          isload = true;
          $(".loading").html(data.info);
        }
			},
			error: function(){
        isload = false;
        $(".loading").html('网络错误，请稍后重试!');
      }
		});



  }
  $(".more_quan").delegate('.qiangquan','click', function () {
      var qid = $(this).attr('data-id');
      var userid = $.cookie(cookiePre+"login_user");
      if(userid == null || userid == ""){
          location.href = masterDomain + "/login.html";
          return false;
      }
      $.ajax({
          url: "/include/ajax.php?service=waimai&action=getWaimaiQuan&qid="+qid,
          type:'POST',
          dataType: "json",
          success:function (data) {
              if(data.state ==100){

                  showErrAlert(data.info)
                  $(".quan_mask,.quan_pop").hide();
              }else{
                  showErrAlert(data.info)
                  $(".quan_mask,.quan_pop").hide();
              }
          },
          error:function () {

          }
      });
  });
  $('.qiangquan').click(function () {
      var qid = $(this).attr('data-id');
       var userid = $.cookie(cookiePre+"login_user");
      if(userid == null || userid == ""){
          location.href = masterDomain + "/login.html";
          return false;
      }
      $.ajax({
          url: "/include/ajax.php?service=waimai&action=getWaimaiQuan&qid="+qid,
          type:'POST',
          dataType: "json",
          success:function (data) {
              if(data.state ==100){

                  showErrAlert(data.info)
                  $(".quan_mask,.quan_pop").hide();
              }else{
                  showErrAlert(data.info)
                  $(".quan_mask,.quan_pop").hide();
              }
          },
          error:function () {

          }
      });
  })



















})
