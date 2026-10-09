/**
 * 会员中心交友私信列表
 * by guozi at: 20160608
 */

var objId = $("#list"), focusuid = 0, oper = '', act = '';
$(function(){

	// 切换分类
	$('.header-c .mt').click(function(){

		if($('body').hasClass('showType')){
			$('body').removeClass('showType');
			$('.disk').data('from','').hide();
		}else{
			$('body').addClass('showType');
			$('.disk').data('from','showtype').show();
		}
	})

	$('.moreMenubox li').click(function(){
		var t = $(this), s = t.children('a').text();
		$('body').removeClass('showType');
		$('.header-c .mt').html(s+'<s></s>');
		if(!t.hasClass('active')){
			t.addClass('active').siblings().removeClass('active');
			getList(1);
		}
		$('.disk').data('from','').hide();
		$('body').removeClass('showType');
	})

	$('.mask').click(function(){
		$('body').removeClass('fixed');
		$('.orderbtn').removeClass('on');
		$('.orderbox').animate({"top":"-100%"},200);
		$('.mask').hide().animate({"opacity":"0"},200);
	})

	var win = $(window), winh = win.height(), itemh = 0, isload = false, isend = false;
	var pageInfo = {totalCount:-1,totalPage:0};
	getList(1);

	win.scroll(function(){
        var sct = win.scrollTop();
        var h = itemh == 0 ? objId.children('.item').height() : itemh;
        var allh = $('body').height();
        var scroll = allh - h - winh;
        if (sct > scroll && !isload && !isend) {
            atpage++;
            getList();
        };
    })

	//取消关注
	objId.delegate(".follow", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){

			if(t.text() == langData['siteConfig'][6][37]){
				$.ajax({
					url: masterDomain+"/include/ajax.php?service=dating&action=visitOper&type=2&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							t.html(langData['siteConfig'][6][77]);
						}else{
							alert(langData['siteConfig'][20][295]);
						}
					},
					error: function(){
						alert(langData['siteConfig'][20][183]);
					}
				});

			}else if(t.text() == langData['siteConfig'][6][77]){
				if(confirm(langData['siteConfig'][20][296])){
					$.ajax({
						url: masterDomain+"/include/ajax.php?service=dating&action=cancelFollow&id="+id,
						type: "GET",
						dataType: "jsonp",
						success: function (data) {
							if(data && data.state == 100){
								if(oper == "follow"){
									getList(1);
								}else{
									t.html(langData['siteConfig'][6][37]);
								}
							}else{
								alert(langData['siteConfig'][20][295]);
							}
						},
						error: function(){
							alert(langData['siteConfig'][20][183]);
							t.html(langData['siteConfig'][6][77]);
						}
					});
				}
			}
		}
	});

	//发私信
	objId.delegate(".edit", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), username = par.attr("data-name");
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = "/login.html";
			return false;
		}

		if(id){
	    	var box = $('.txt')
	        $('.txt,.disk').show();
	        focusuid = id;
		}

	});

	$('html').delegate('.sendmsgbtn','click',function(){
    	var btn = $(this), box = $('.shuru');
    	if($.trim(box.html()) == ''){
    		alert(langData['siteConfig'][20][297]);
    		box.focus();
    		return false;
    	}
    	$.ajax({
            url: masterDomain + "/include/ajax.php?service=dating&action=fabuReview&id="+focusuid+"&note="+box.html(),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
            	if(data.state == 100){
            		btn.html(langData['siteConfig'][20][298]);
            		setTimeout(function(){
            			$('.disk,.txt p').click();
            			btn.html(langData['siteConfig'][6][139]);
            			box.html('');
            		},300)
            	}else{
                	alert(data.info);
              	}
            },
            error: function(){
            	alert(langData['siteConfig'][20][173]);
            }
        });
    })

    $('.disk,.txt p').click(function(){
        $('.txt').hide();
        $('.disk').hide();
        if($('.disk').data('from') == 'showtype'){
	       $('body').removeClass('showType');
     	   $('.header-c').removeClass('open');
     	   $('.disk').data('from','');
     	}
    })


	function getList(is){

		isload = true;

		if(is){
			atpage = 1;
			isend = false;
            pageInfo.totalCount = -1;
            pageInfo.totalPage = 0;
			objId.html('');
		}

		var operFocus = $('.moreMenubox .active');
		oper = operFocus.data('oper') ? operFocus.data('oper') : 'visit';
		act = operFocus.data('do') ? operFocus.data('do') : 'in';
		// console.log(oper+'--'+act)
		objId.append('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=dating&action=visit&oper="+oper+"&act="+act+"&page="+atpage+"&pageSize="+pageSize,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state != 200){
					if(data.state == 100){
						var list = data.info.list, pgInfo = data.info.pageInfo, html = [];
						if(pageInfo.totalCount == -1){
	                        pageInfo.totalCount = pgInfo.totalCount;
                            pageInfo.totalPage = pgInfo.totalPage;
	                    }
						//拼接列表
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								var member  = list[i].member;
								html.push('<div class="item" data-id="'+member['id']+'" data-name="'+member['nickname']+'">');
								html.push('	<div class="info-item">')
								html.push('		<a href="'+member['url']+'" class="pic fn-left"><img src="'+member['photo']+'" onerror="javascript:this.src=\''+masterDomain+'/static/images/noPhoto_100.jpg\';" /></a>');
								html.push('		<div class="info">');
								html.push('			<p class="m"><a href="'+member['url']+'" target="_blank">'+member['nickname']+'</a></p>');
								html.push('			<p>'+member['addr'][0]+' <em>|</em> '+member['age']+langData['siteConfig'][13][29]+' <em>|</em> '+member['height']+'cm <em>|</em> '+member['education']+'</p>');
								html.push('			<p>'+list[i]['pubdate']+'</p>');
								html.push('		</div>');
								html.push('	</div>');
								html.push('	<div class="o fn-clear">');
								var follow = langData['siteConfig'][6][37];
								if(list[i].follow > 0){
									follow = langData['siteConfig'][6][77];
								}
								html.push('		<a href="javascript:;" class="edit">'+langData['siteConfig'][19][248]+'</a><a href="javascript:;" class="follow">'+follow+'</a>');
								html.push('	</div>');
								html.push('</div>');

							}
							objId.append(html.join(""));
						}
					}
				}
				checkResult();
			}
		});
	}
	function checkResult(){
		$('.loading').remove();
	    if(pageInfo.totalCount <= 0){
	    	objId.append('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');
	        isend = true;
	    }else{
	        if(pageInfo.totalPage == atpage){
	            isend = true;
	            objId.append('<div class="loading toend">'+langData['siteConfig'][20][185]+'</div>');
	        }else{
	            isload = false;
	        }
	    }
	}

});