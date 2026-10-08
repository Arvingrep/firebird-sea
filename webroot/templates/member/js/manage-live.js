/**
 * Created by Administrator on 2018/5/8.
 */
var objId = $(".live_main .live_ul");
var keywords = '';
$(function(){
    //结束直播
    $('.btn-end').click(function(){
        //在页面上弹出对话框
        var con=confirm(langData['siteConfig'][31][133]); //是否确定关闭直播？
        if(con==true) {
            update(2);
            window.location.reload();
        } else {
        }

    });
    function update(state){
        $.ajax({
            url: "/include/ajax.php?service=live&action=updateState&state="+state+"&id="+id,
            type: 'post',
            dataType: 'json',
            async : false,   //注意：此处是同步，不是异步
            data:"id="+id,
            success: function (data) {
                if(data && data.state == 100){
                    data.info=langData['siteConfig'][32][12];   //结束直播
                    // alert(data.info);
                }else{
                    alert(data.info)
                }
            }

        });
    }

    $('.btn-edit').click(function(){
        event.preventDefault();
        var id = $(this).attr('data-id');
        window.location.href = editUrl+'?id='+id;
    });
    showPageInfo();
    getList(1);

    //用户删除直播
    $(".live_main").delegate(".del_btn","click", function(){
		var par = $(this).closest('.live_info').closest('li');
		var id = par.attr('data-id');
        if(confirm(langData['siteConfig'][31][134]) ){     //是否确认删除？
            $.ajax({
              url: "/include/ajax.php?service=live&action=delUserLive",
              data: "id="+id,
              type: "GET",
              dataType: "json",
              success: function (msg) {
                if(msg.state == 100){
                    //删除成功后移除信息层并异步获取最新列表
                       par.slideUp(300, function(){
                           par.remove();
                           setTimeout(function(){getList(1);}, 200);
                       });

                }else{
                    $.dialog.alert(msg.info);
                }
              },
              error: function(){
                console.log(langData['siteConfig'][31][134]);//网络错误，操作失败！
              }
            });
        }
    });
    //下载地址
    $(".button-live").delegate(".btn-start","click", function(){
        if(pulltype == 0){
            $(".down_modal").css('display','block');
        }else{
            if(confirm(langData['siteConfig'][44][11])){//是否开始直播
                update(1);
                window.location.reload();
            }
        }
    });
    $(".m-close").click(function(){
        $(".down_modal").css('display','none');
    });


	// 20200603修改
	$('.live_main').on("click",".more_btn",function(e){
		var t = $(this);
		$(".more_box").hide();
		t.find(".more_box").show();
		$(document).one("click",function(){
			$(".more_box").hide();
		})
		return false;
	});

	// 跳转动态页面
	$('.live_ul').on("click",".dt_btn",function(e){
		var t = $(this),li = t.parents('li');
		var id = li.attr("data-id");
		var url = mcenter+"/live_imgtext.html?id="+id;
		window.location.href=url;
		return false;
	})

	$('.live_main').on("mouseover",".more_btn",function(){
		var t = $(this);
		$(".more_box").hide();
		t.find(".more_box").show();
	});
	$('.live_main').on("mouseleave",".more_btn",function(){
		$(".more_box").hide();
	});


	$(".live_main").delegate(".share_btn","click",function(e){
		var t = $(this) , p = t.parents(".more_btn"),li = p.closest('li'),a = p.closest('a');
		var w = $(window).width();
		var id = li.attr('data-id');
		var url = masterDomain+"/live/detail-"+id;
		var title = a.find("h3").text();
		var pic = a.find('.live_pic img').attr("src");
		var qqUrl = "http://connect.qq.com/widget/shareqq/index.html?url="+url+"&desc="+title+"&title="+title+"&summary="+title+"&pics="+pic;
		var qZoneUrl = "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url="+url+"&desc="+title+"&pics="+pic;
		var sinaUrl = "http://service.weibo.com/share/share.php?url="+url+"&title="+title+"&pic="+pic;
		var wxUrl = masterDomain+"/include/qrcode.php?data="+url
		$(".shareBox").css({
			"left":p.offset().left - $(".shareBox").width() +60,
			"top":p.offset().top + 40,
			"display":"block"
		});
		$(".shareBox .qq a").attr("href",qqUrl);
		$(".shareBox .sina a").attr("href",sinaUrl);
		$(".shareBox .qZone a").attr("href",qZoneUrl);
		$(".shareBox .ways_share .left_code img").attr("src",wxUrl);
		$(".more_box").hide();
		$(document).one("click",function(){
			$(".shareBox").hide()
		})
		e.stopPropagation();
		e.preventDefault();
	});

	// 筛选
	$(".live_state ").click(function(e){
		if($('.state_ul').is(':hidden')){
			$(".state_ul").slideDown();
			$(document).one("click",function(){
				$(".state_ul").slideUp();
			})
		}else{
			$(".state_ul").slideUp();
		}
		e.stopPropagation();
	});
	$(".live_orderby ").click(function(e){
		if($('.orderby_ul').is(':hidden')){
			$(".orderby_ul").slideDown();
			$(document).one("click",function(){
				$(".orderby_ul").slideUp();
			})
		}else{
			$(".orderby_ul").slideUp();
		}

		e.stopPropagation();
	});

	$(".state_ul li,.orderby_ul li").click(function(){
		var t = $(this);
		var ul = t.closest('ul');
		var txt = t.text();
		var val = t.attr('data-value');
		if(ul.hasClass("state_ul")){
			$("#state").val(txt).attr('data-val',val)
		}else{
			$("#orderby").val(txt).attr('data-val',val)
		}
		var state = $("#state").attr('data-val');
		var orderby = $("#orderby").attr('data-val');
		getList('',state,orderby)
		ul.slideUp();
	});

	// 搜索

	$(".search_btn").click(function(){
		keywords = keywords = $.trim($("#search").val());
		var state = $("#state").attr('data-val');
		var orderby = $("#orderby").attr('data-val');
		getList(1,state,orderby);
	})

});
function getList(is,state,orderby){

	var state = $("#state").attr('data-val'),
		orderby = $("#orderby").attr('data-val');

  $('#list').html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>').show();  //加载中，请稍后

    $(".pagination").hide();
    var id=$('#hiddenid').val();

    $.ajax({
        url: "/include/ajax.php?service=live&action=alive&type=2&page="+atpage+"&u=1&uid="+id+"&pageSize="+pageSize+"&orderby="+(orderby==undefined?"":orderby)+"&state="+(state==undefined?"":state)+"&title="+keywords,
        type: "GET",
        dataType: "json",
        success: function (data) {
          $('#list').hide();
            if(data && data.state != 200){
                if(data.state == 101){
					objId.html('')
                    $('#list').html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>").show();  ////暂无相关信息！
                }else{

                    var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
                    //拼接列表
                    if(list.length > 0){
                        var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
                        var param = t + "do=edit&id=";
                        var urlString = editUrl + param;
                        for(var i = 0; i < list.length; i++){
                            var item        = [],
                                id          = list[i].id,
                                title       = list[i].title,
                                url         = list[i].url,
                                litpic      = list[i].litpic,
                                photo       = list[i].photo,
                                click       = list[i].click,
                                state       = list[i].state,
                                up          = list[i].up,
                                newurl      = list[i].newurl,
                                ftime       = list[i].ftime;
								ftimes       = list[i].ftimes;
                            html.push('<li class="item" data-id="'+id+'">');
                            if(list[i].waitpay == '0'){
                                html.push('<a href="'+newurl+'" class="fn-clear">');
                            }else{
                                html.push('<a href="javascript:;" class="fn-clear">');
                            }
                            var stateText = state==0 ? langData['siteConfig'][31][136] : (state==1 ? '' : langData['siteConfig'][31][137]);   //未直播---直播中---精彩回放
							var stateClass = state==0 ? 'tolive' : (state==1 ? 'living' : 'lived');

							// 是否开播
							var arcrank = '',arcrankTxt = '';
							var clickNum = click>=10000 ? (click/10000).toFixed(2) + "w" : click; //万
							arcrank = list[i].arcrank==0?'<span class="lspan">'+langData['siteConfig'][19][556]+'</span>':'<span class="live_read lspan"><i></i>'+clickNum+'</span>';
							arcrankTxt = (list[i].arcrank!=0 && state==0)?'<span class="kb_btn"><i></i>'+langData['live'][0][11]+'</span>':"";  //开播
							html.push('<div class="live_time" data-time="'+ftime+'">'+huoniao.transTimes(ftimes,2)+' <br/><span>'+huoniao.transTimes(ftimes,1).split(' ')[1]+'</span></div>');
							html.push('<div class="live_detail fn-clear"><div class="live_pic"><img loading="lazy" src="'+litpic+'"><span class="l_state '+stateClass+'">'+stateText+'</span></div>');
							html.push('<div class="live_info">');
							html.push('<h3>'+title+'</h3>');
							html.push('<div class="btm_box">');
							html.push(arcrank);
							/* 动态  统计 */
							html.push('<div class="op_box">'+arcrankTxt);

							//<span class="tj_btn"><i></i>'+langData['live'][0][35]+'</span>   //统计

                            if(list[i].waitpay == '0'){

							    html.push('<span class="dt_btn"><i></i>'+langData['live'][0][34]+'</span>');
    							html.push('<span class="more_btn"><i></i>');

    							/* 分享  删除 */
    							var fx = list[i].arcrank==0?"disclick":""
    							html.push('<div class="more_box"><s class="arr"></s><ul><li class="share_btn '+fx+'">'+langData['live'][0][14]+'</li><li class="del_btn">'+langData['live'][0][36]+'</li></ul></div>');
    							html.push('</span>')

                            }else{
                                html.push('<span class="stick delayPay" style="color:#ff6600;"><s></s>立即支付</span>');
                            }

							html.push('</div></div></div></div>');
							html.push('</a>');
							html.push('</li>');
                            // html.push('<div class="an_left"><img src="'+litpic+'"><div class="playback state'+state+'">'+stateText+'</div></div>');
                            // var arcrank = '';
                            // switch(list[i].arcrank){
                            //     case '0':
                            //         arcrank = '<span class="arcrank_'+list[i].arcrank+'">'+langData['siteConfig'][19][556]+'</span>';//待审核
                            //         break;
                            //     case '1':
                            //         arcrank = '<span class="arcrank_'+list[i].arcrank+'">'+langData['siteConfig'][19][392]+'</span>'; //已审核
                            //         break;
                            //     case '2':
                            //         arcrank = '<span class="arcrank_'+list[i].arcrank+'">'+langData['siteConfig'][23][101]+'</span>'; //审核失败
                            //         break;
                            // }
                            // html.push('<div class="an_right"><h5>'+arcrank+title+'</h5>');
                            // html.push('<p class="an_time"><span><i></i>'+ftime+'</span></p></a>');
                            // html.push('<p class="an_style">');
                            // html.push('<span class="ll_style"><i></i>'+click+' </span>');
                            // var upNum = up>=10000 ? (up/10000).toFixed(2) + langData['siteConfig'][13][27] : up; //万
                            // html.push('<span class="sec_style"><i></i>'+upNum+' </span>');

                            // if(list[i].waitpay == '0'){
                            //     html.push('<span class="imgtext"><a href="'+imgtextUrl+id+'">'+langData['siteConfig'][38][58]+'</a></span>');//图文
                            //     // html.push('<span class="comment"><a href="'+imgtextUrl.replace('imgtext', 'comment')+id+'">评论</a></span>');
                            // }else{
                            //     html.push('<span class="delayPay"><a href="javascript:;" class="stick" style="color:#ff6600;"><s></s>'+langData['siteConfig'][23][113]+'</a></span>');//立即支付
                            // }
                            // html.push('<span data-id="'+id+'" class="live_del"><i></i> '+langData['siteConfig'][6][8]+' </span>');  //删除
							//html.push('</p></div>')
                            // html.push('</li>');
                        }
                        objId.html(html.join(""));

                    }else{
                        objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
                    }
                    totalCount = pageInfo.totalCount;
					$('.live_head h3 em').html(totalCount);
                    showPageInfo();
                }
            }else{
                objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
            }
        }
    });
}
