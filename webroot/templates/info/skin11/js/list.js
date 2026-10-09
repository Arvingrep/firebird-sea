$(function(){
    $(".shai_tip .left_tip span").text(listtotalCount?listtotalCount:0);
    //自定义价格
    $("#price_sure").click(function () {
        var t = $(this), url = t.data('url');
        var pri_1 = parseInt($(".inp_price .p1").val());
        var pri_2 = parseInt($(".inp_price .p2").val());

        location.href = url.replace('min', pri_1).replace('max', pri_2);
    })

    //自字义字段
    $('#itemOptions a').bind('click', function(){
        $(this).addClass('curr').siblings('a').removeClass('curr');
        //获取字段
		var item = [];
		$("#itemOptions dl").each(function(index){
			var t = $(this), id = t.attr("data-id"), value = t.find(".curr").attr("data-id");
			if(value != 0){
                item.push({
					"id": id,
					"value": value
				});
			}
		});

        location.href = listUrl.replace('%item%', JSON.stringify(item));
    });

    //删除已选自定义字段
    $('.itemDel').bind('click', function(){
        var t = $(this), itemid = t.data('id');
        $('#itemOptions dl').each(function(){
            var dl = $(this), dlid = dl.data('id');
            if(itemid == dlid){
                dl.find('a:eq(0)').click();
            }
        });
    });


    $('.otherList').each(function(){
      if($(this).height() > 74){
        $(this).addClass('overheight')
      }
    });

    $('.showMore').click(function(){
      $(this).closest('.otherList').removeClass('overheight')
    })





   

    //点击list中的i
    var userid = typeof cookiePre == "undefined" ? null : $.cookie(cookiePre+"login_user");
	$('.new_content .list_ul li .online_contact').click(function(){
		if(userid==null||userid==undefined){
    		huoniao.login();
    		return false;
    	}
		var url = $(this).parents('li').find('a').attr('href');
		var chatid = $(this).attr('data-id');
		var mod = 'info';
		var title = $(this).parents('li').find('.info_tit').text();
		var imgUrl = $(this).parents('li').find('.info_img img').attr('src');
		// var price = $(this).parents('li').find('.new_price').text();
		var type = $(this).attr('data-type')
		imconfig = {
			'mod':'info',
			'chatid':chatid,
			'title': title,
			// "price": price,
			"imgUrl": imgUrl,
			"link": url,
		}
		sendLink(type);
    setTimeout(function(){
      $(".im-textarea").focus();
    },4000)
	});

	 // 查看电话
    // $('.telPhone').click(function(event) {
    //   /* Act on the event */
    //   var t = $(this),tel = t.attr('data-tel');
    //   if(cfg_privateNumber_state!='1'){
    //     var userid = $.cookie(cookiePre+"login_user");
    //     if(userid == null || userid == ""){
    //         huoniao.login();
    //         return false;
    //     }
    //     t.find('span').text(tel)
    //   }else{
    //     var detailInfo = {};
    //     var li = t.closest('.info_li');
    //     detailInfo.url = li.find('.info_detail').attr('href');
    //     detailInfo.phone_id = li.attr('data-id')
    //     detailInfo.phone_temp = 'detail';
    //     detailInfo.phone_module = 'info';
    //     if(!if_login || !phoneCheck){  //未登录
    //       private_phone.loginPopShow(); //显示短信登录/跳转登录
    //     }else{
    //       private_phone.callPopShow(detailInfo); //显示电话弹窗
    //     }
    //   }
    //   event.preventDefault()
    // });
})
