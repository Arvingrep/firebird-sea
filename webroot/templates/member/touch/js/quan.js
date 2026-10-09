$(function(){
	//默认排序
	$('.px').click(function(){
		if(!$(this).hasClass('active')){
			$(this).addClass('active');
			$('.maskPx').show();
			$('.pxCon').animate({'height':'3.4rem'},200);
		}else{
			$(this).removeClass('active');
			$('.maskPx').hide();
			$('.pxCon').animate({'height':'0'},200)
		}
	})

	$('.pxCon li').click(function(){
		$(this).addClass('curr').siblings('li').removeClass('curr');
		var tid = $(this).find('a').attr('data-id');
		var txt = $(this).find('a').text();
		$('.px a').attr('data-id',tid);
		$('.px a').text(txt);
		$('.px').removeClass('active');
		$('.maskPx').hide();
		$('.pxCon').animate({'height':'0'},200)
		getList(1);
	})

	//分类选择
	$('.navT li').click(function(){
		if(!$(this).hasClass('curr')){
			$(this).addClass('curr').siblings('li').removeClass('curr');
			$('.px').removeClass('active');
			$('.maskPx').hide();
			$('.pxCon').animate({'height':'0'},200)
			getList(1);
		}
	})
	//点击遮罩
	$('.maskPx').click(function(){
		$('.px').removeClass('active');
		$('.maskPx').hide();
		$('.pxCon').animate({'height':'0'},200)
	})
	//更多券码
    $('.list').delegate('.moreQuan','click',function(){
    	var par= $(this).closest('li');
    	var slideCon = par.find('.hideCon');
    	if(!$(this).hasClass('click')){
			$(this).addClass('click');
			slideCon.css('height','auto');
			$(this).find('em').text(langData['siteConfig'][22][8]);//收起
    	}else{
    		$(this).removeClass('click');
			slideCon.css('height','.4rem');
			$(this).find('em').text(langData['siteConfig'][54][101]);//更多券码
    	}
    	return false;
    })
    //团购券
	$('.list').delegate(".erwei", "click", function(){
		var t = $(this), url = t.data('code');
		if(url != '' && url != undefined){
			url = tuanQR + url ;
			$('.tymodal img').attr('src', url);
			$('.disk').show();
			$('.tymodal').removeClass('fn-hide');
		}
		return false;
	});


	$('.tymodal .close,.disk').click(function(){
			$('.tymodal').addClass('fn-hide');
			$('.disk').hide();
	})
	var page = 1,pageSize=10,isload = false;
	$(window).scroll(function(){
		var allh = $('body').height();
	    var w = $(window).height();
	    var scroll = allh - w;
	    if ($(window).scrollTop() >= scroll && !isload) {
	    	page++;
	    	getList();

	    }
   });
	getList(1);
	function getList(tr){
        isload = true;
        if(tr){
            page=1;
           $(".list ul").html('')

        }
        $('.loading').remove();
        $(".list").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        var typeid = $('.navT .curr a').attr('data-id');
        var orderby = $('.px a').attr('data-id');
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("quantype="+typeid);
        data.push("orderby="+orderby);

        $.ajax({
            url: "/include/ajax.php?service=member&action=couponsQuan&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){

                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length > 0){
                   	  $(".list .loading").remove();
                      for (var i = 0; i < list.length; i++) {
                          html.push('<li>');
                          html.push('<a href="'+list[i].url+'">' );
                          if(list[i].is_exp ==1){

							  html.push('<em class="useTime"></em>');//即将过期
						  }
                          html.push('<div class="linBg1"></div>');
                          html.push('<div class="topCon">')

                          html.push('<div class="title">');
                          html.push('<h2>'+list[i].quantitle+'</h2>');
                          var waimai =  orange = '';
                          if(list[i].moduletype == 'tuan'){
							  waimai = 'waimai';
							  orange = 'orange';
						  }
                          html.push('<span class="typeName '+waimai+'">'+list[i].quantype+'</span>');  // 美食餐饮 类名waimai
                          html.push('</div>');
                          //即将到期：1张可用<em>|</em>2020-06-06 23:59到期
                          // 酒店时：2间房 <em>|</em> 2020-06-06入住
                          //门票：2张可用 <em>|</em>  2020-06-06 使用
						  if(list[i].moduletype == 'tuan'){

							  html.push('<div class="quanNum">'+list[i].cardnumcount+'张可用<em>|</em>'+list[i].expireddatetime+'到期</div>');
						  }else{
						  	if(list[i].type == 1 || list[i].type == 2){
								html.push('<div class="quanNum">'+list[i].cardnumcount+'张可用<em>|</em>'+list[i].expireddatetime+'使用</div>');
							}else{
								html.push('<div class="quanNum">'+list[i].cardnumcount+'张可用<em>|</em>'+list[i].expireddatetime+'入住</div>');
							}
						  }
                          html.push('</div>');
                          html.push('</a>');
                          html.push('<div class="qLine"></div>');
                          html.push('<div class="quanMa">');
                          html.push('<div class="hideCon">');
                          html.push('<s class="erwei" data-code="'+sjDomain+'/verify-'+list[i].moduletype+'.html?cardnum='+list[i].cardnum.join(',')+'"></s>');
                          var hasUse = yspan = '';

						  for (var a = 0; a < list[i].cardnum.length; a++) {
								if(list[i].usedatearr[a]!=0){
									hasUse = ' class="hasUse"';
									yspan = '<span>'+langData['siteConfig'][19][706]+'</span>';
								}
								var cardnum = list[i].cardnum[a].replace(/(.{4})/g, "$1 ")
							  html.push('<p '+hasUse+'>'+cardnum+yspan+'</p>');
						  }
                          //优惠券已使用的情况
                          html.push('</div>');
						  if(list[i].cardnumcount >1){

							  html.push('<div class="moreQuan"><em>'+langData['siteConfig'][54][101]+'</em><i></i></div>');//更多券码
						  }
                          html.push('</div>');
                          html.push('<div class="line '+orange+'"></div>');//美食餐饮 类名orange
                          html.push('</li>');
                      }

                      $(".list ul").append(html.join(""));
                      isload = false;
                      if(page >= pageinfo.totalPage){
                          isload = true;
                          $(".list").append('<div class="loading">'+langData['siteConfig'][20][429]+'</div>');//已加载全部数据
                      }
					}else{
                        isload = false;
                        $(".list .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }

                }else{
					isload = false;
                    $(".list .loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                //网络错误，加载失败
                $(".list .loading").html(langData['siteConfig'][20][227]); // 网络错误，加载失败
            }
        });

    }








})
