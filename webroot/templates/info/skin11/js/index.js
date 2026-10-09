$(function(){
    //css 样式设置
    $('.recom_box:last-child').css('margin-right','0')
    $('.Info_Box ul li .libox:nth-child(odd)').css('border-right','solid 1px #f0f2f7')
    $('.Info_Box ul li .libox:nth-child(9)').css('padding-bottom','28px')
    $('.Info_Box ul li .libox:nth-child(10)').css('padding-bottom','28px')
    //弹出二级分类
    $(".nav-con .all_cate2").hover(function(){
        if($('.fixedpane').hasClass('fixed')){
            $('#navlist_wrap .NavList').addClass('navshow')
        }

    },function(){
        $('#navlist_wrap .NavList').removeClass('navshow')
    });

	// 焦点图
    $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd .slideobj",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>"});

	// 最新发布
	$(".ViewBox").slide({mainCell:".NewList",effect:"left",autoPlay:false,vis:4,prevCell:".prev",nextCell:".next",scroll:2,pnLoop:false});


    $(".slideBox2").slide({titCell:".hd ul", mainCell:".bd ul",effect:"leftLoop", autoPage:"<li></li>",autoPlay: true});




	function getParentName(data, index) {
    	// console.log(data)
    	// console.log(index)
    	var len = data.length;
		for(var i = 0; i < len; i++){
			if(data[i].id == index){
				return data[i].typename;
			}
		}
    }

    var  transTimes = function(timestamp, n){
        
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
        if(n == 1){
            return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
        }else if(n == 2){
            return (year+'-'+month+'-'+day);
        }else if(n == 3){
            return (month+'-'+day);
        }else if(n == 4){
            return (hour+':'+minute);
        }else{
            return 0;
        }
    }



//点击分享链接
//点击list中的i
    var userid = typeof cookiePre == "undefined" ? null : $.cookie(cookiePre+"login_user");
	$('.new_info i').click(function(){
		if(userid==null||userid==undefined){
    		huoniao.login();
    		return false;
    	}
		var url = $(this).parents('li').find('a').attr('href');
		var chatid = $(this).attr('data-id');
		var mod = 'info';
		var title = $(this).parents('li').find('.new_title').text();
		var imgUrl = $(this).parents('li').find('.left_b img').attr('src');
		var price = $(this).parents('li').find('.new_price').text();
        var type = $(this).attr('data-type')
        imconfig = {
            'mod':'info',
            'chatid':chatid,
            'title': title,
            "price": price,
            "imgUrl": imgUrl,
            "link": url,
        }
        sendLink(type);
	});

 getDatalist();

$('.middle_con .area_shai span').click(function(event) {
  /* Act on the event */
  var t = $(this);
  t.addClass('on_chose').siblings('span').removeClass('on_chose');
  getDatalist();
});


 function getDatalist(){
   var shaiText = "";
   var addrid = $(".area_shai span.on_chose").attr('data-addrid');
   var orderby = $(".orderby span.on_chose").attr('data-orderby');
   shaiText = orderby == 'fire'?"&fire=1&orderby=2":"";
   if(orderby){
     if(orderby && orderby != 'fire'){
       shaiText = "&orderby=1"
     }else{
       shaiText = "&orderby=10"
     }
   }else{
    //  shaiText = "&thumb=1";
   }
   var addridText = addrid?"&addrid="+addrid : "";
   $(".middle_con .infoList ul").html("<p class='loading'>加载中~</p>");
   $.ajax({
      url: '/include/ajax.php?service=info&action=ilist_v2&page=1&pageSize=20'+addridText+shaiText,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data.state == 100){
          console.log(data.info);
          var list = data.info.list
          var html = [];
          for(var i = 0; i < list.length; i++){
            var fire = list[i].isbid=='1'?'<span class="tag hot">顶</span>':'';
            var rec = list[i].rec=='1'?'<span class="tag ">荐</span>':'';
            var share = list[i].shareInfo == '1'?'<span class="hb_style">分享有奖</span>':'';
            var hb = list[i].readInfo == '1'?'<span class="hb_style">红包</span>':'';
            html.push('<li><a href="'+list[i].url+'" target="_blank">');
            if(list[i].litpic){

              html.push('<div class="info_img"><img src="'+list[i].litpic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'"></div>');
            }
  					html.push('<div class="info_detail">');
  					html.push('<h2><span class="title">'+share+hb+list[i].title+'</span> '+fire+rec+'</h2>');
  					html.push('<div class="tabBox">');
            if(list[i].label.length > 0){
              html.push('<div class="tabArr">');
               for(var l = 0; l<list[i].label.length; l++){
                 html.push('<span>'+list[i].label[l]["name"]+'</span>');
                 if(list[i].label.length>=3 && l>3) break;
               }
              html.push('</div>')
            }

  					html.push('<div class="fb_info">');
  					html.push('<div class="binfo">');
  					html.push('<div class="bicon"><img src="'+(list[i].member?list[i].member.photo:'')+'" onerror="this.src=\'/static/images/noPhoto_40.jpg\'" alt=""></div>');

  					html.push('<h4>'+(list[i].member?list[i].member.nickname:"佚名")+' </h4>');
  					html.push('</div>	<span class="fb_date">'+list[i].pubdate1+'</span> </div> </div>');
  					html.push('<p><span class="typename">#'+list[i].typename+'</span> <span class="addr">'+(list[i].dizhi?list[i].dizhi:"")+'</span></p>');
  					html.push('</div></a></li>');
          }
          $(".middle_con .infoList ul").html(html.join(''));
        }else{
          $(".middle_con .infoList ul").html("<p class='loading'>"+data.info+"</p>");
        }
      },
      error: function(){}
    });
 }


})
