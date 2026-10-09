$(function () {
    $("#zhubonum").html(num);
    $("#zhulivenum").html(num);

    $('.select_bar .cateList li').click(function () {
        $(this).addClass('curr').siblings().removeClass('curr');
        var i = $(this).index();
        $('.filter .container').eq(i).addClass('show').siblings().removeClass('show');
    });
    $('.select_bar .sele_r .sort span').click(function () {
        $(this).addClass('curr').siblings().removeClass('curr');
    });
    $('.select_x a').click(function () {
        $(this).addClass('curr').siblings().removeClass('curr');
        if(type!=1 && type!=2){
            getLiveList();
        }
    });

    $('.conBox .conList li').hover(function () {
        $(this).find('.code_bg').show();
    },function () {
        $(this).find('.code_bg').hide();
    });

    //点击关注
    function follow(id){
		$.post("/include/ajax.php?service=member&action=followMember&id="+id, function(){
		});
	}
    // $('.zhuBo_Box ul li .info .btn_box .btn').click(function () {
    $(".zhuBo_Box ul").delegate("li .info .btn_box .btn","click",function(){
        var t = $(this), id=t.attr('data-id');
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        if(!t.hasClass("curr")){
            t.addClass("curr");
            t.find('span').html('已关注');
            $(this).parent().find('.appo_sec').show();
            fadeOut(); 
			follow(id);
        }else {
			 $(this).parent().find('.appo_cancel').show();
			
        }
       
    });
	
	$("body").delegate('.appo_cancel .btns .sure','click',function(){
		
		
		var id = $(this).parents('li').find('.btn_box .btn').attr('data-id');
		follow(id);
		$(this).parents('li').find('.btn').removeClass('curr')
		$(this).parents('li').find('.btn span').html('关注');
		$('.appo_cancel').fadeOut();
	});
	
    function fadeOut(){
        setTimeout(function () {
            $('.appo_sec').fadeOut();
        },1500);
    }

    if(type!=1 && type!=2){
        getAnchorList();
        getLiveList();
    }

    function getAnchorList(){
        var searchkey = $('.searchkey').val();
        var data = [];
        if(searchkey!=''){
            data.push('title='+searchkey);
        }
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=live&action=alive&orderby=3&page=1&pageSize=6",
            data:data.join("&"),
		    type: "GET",
		    dataType: "jsonp",
		    success: function (data) {
                if(data.state == 100){
                    var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
                    for(var i = 0; i < list.length; i++){
                        html.push('<li>');
                        
                        var online = list[i].online ? '<i></i>' : '';
                        html.push('<a target="_blank" href="'+masterDomain+'/user/'+list[i].user+'/fabu.html?qmodule=live">');
                        html.push('<div class="img_box"><div class="img"><img src="'+huoniao.changeFileSize(list[i].photo, "small")+'" alt=""></div> '+online+'</div>');
                        html.push('</a>');
                        html.push('<div class="info">');
                        var certifyState = list[i].certifyState ? '<i></i>' : '';
                        html.push('<p class="name"><em>'+list[i].nickname+'</em> '+certifyState+'</p>');
                        html.push('<p class="num">'+list[i].totalFans+'人关注</p>');
                        if(list[i].isMfollow!=2){
                            html.push('<div class="btn_box">');
                            if(list[i].isMfollow==1){
                                html.push('<div data-id="'+list[i].user+'" class="btn curr"><i></i><span>已关注</span></div>');
                            }else{
                                html.push('<div data-id="'+list[i].user+'" class="btn"><i></i><span>关注</span></div>');
                            }
                            html.push('<div class="appo_sec"><p><i></i>关注成功！</p></div> <div class="appo_cancel"><p><i></i>确定不再关注吗</p><div class="btns"><span class="sure" id="gz_sure">确定</span> <span class="cancel" id="gz_cancel">取消</span></div></div>');
                            html.push('</div>');
                        }
                        html.push('</div>');
                        
                        html.push('</li>');
                    }
                    $(".zhuBo_Box ul").html(html.join(""));
                    $("#anchornum").html(pageInfo.totalCount);
					if(pageInfo.totalCount<=6){
						$(".zb_head .more.fn-right").hide();
					}
                }else{
                    $("#anchornum").html(0);
                    $(".zhuBo_Box ul").html('<p class="loading">'+data.info+'</p>');
                }
            },
			error: function(){
                $(".zhuBo_Box ul").html('<p class="loading">'+langData['siteConfig'][20][183]+'</p>');
            }
        });
    }

    function getLiveList(){
        var searchkey = $('.searchkey').val();
        var data = [];
        var state = $(".livestate .curr").attr('data-id');;
        if(state!=''){
            data.push('state='+state);
        }
        if(searchkey!=''){
            data.push('title='+searchkey);
        }
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=live&action=alive&orderby=1&type=3&page=1&pageSize=8",
            data:data.join("&"),
		    type: "GET",
		    dataType: "jsonp",
		    success: function (data) {
                if(data.state == 100){
                    var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
                    for(var i = 0; i < list.length; i++){
                        html.push('<li>');
                        html.push('<a target="_blank" href="'+list[i].url+'">');
                        html.push('<div class="img_box">');
                        html.push('<img src="'+huoniao.changeFileSize(list[i].litpic, "small")+'" alt="">');
                        if(list[i].state==1){
                            html.push('<i class="live"></i>');
                        }else if(list[i].state==2){
                            html.push('<i class="hui">精彩回放</i>');
                        }else{
							html.push('<i class="yu">预告</i>');
						}
                        //<div class="daojishi"><span class="h">00</span>:<span class="m">48</span>:<span class="s">22</span></div><i class="yu"></i>
						html.push(' <div class="item-mask"></div><i class="btn-link__hover_i"></i>')
                        // html.push('<div class="code_bg"><div class="code"><img src="'+QRcode+list[i].url+'" alt=""></div></div>');
                        html.push('</div>');
                        html.push('<div class="info">');
                        html.push('<p class="tit sliceFont3" data-num="18">'+list[i].title+'</p>');
                        html.push('<div class="user fn-clear"><div class="u_logo"><img src="'+huoniao.changeFileSize(list[i].photo, "small")+'" alt=""></div><span class="name">'+list[i].nickname+'</span> <span class="num fn-right"><i></i>'+list[i].click+'</span></div>');

                        html.push('</div>');
                        html.push('</a>');
                        html.push('</li>');
                    }
                    $(".conBox ul").html(html.join(""));
                    $("#livenum").html(pageInfo.totalCount);

                    $('.conBox .conList li').hover(function () {
                        $(this).find('.code_bg').show();
                    },function () {
                        $(this).find('.code_bg').hide();
                    });

                }else{
                    $("#livenum").html(0);
                    $(".conBox ul").html('<p class="loading">'+data.info+'</p>');
                }
            },
			error: function(){
                $(".conBox ul").html('<p class="loading">'+langData['siteConfig'][20][183]+'</p>');
            }
        });
    }


});