$(function(){
	

/*===================评价相关js======================*/ 
	// 评论列表筛选
	$('.comm_box .right_item span').click(function(){
		$(this).addClass('click').siblings('span').removeClass('click');
		//数据请求
		
	});
	
	// 评价商户
	$('.starShow s').click(function(){
		var t = $(this);
		var index = t.index();
		$('.starShow s').removeClass('star_up');
		t.addClass('star_up');
		t.prevAll('s').addClass('star_up');
		$('#score').val(index*1+1)
		 if(index==0){
			$('.starShow em').html('失望')
		}else if(index==1){
			$('.starShow em').html('不满意')
		}else if(index==2){
			$('.starShow em').html('满意')
		}else if(index==3){
			$('.starShow em').html('较满意')
		}else{
			$('.starShow em').html('非常满意')
		}
	});
	$('.close_commt').click(function(){
		$('.mask').hide();
		$('.commtPop').removeClass('show');
	});
	
	$('.comm_btn').click(function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
		  window.location.href = masterDomain+'/login.html';
		  return false;
		}
		$('.mask').show();
		$('.commtPop').addClass('show');
	})
	// 是否匿名
	$('.anony').click(function(){
		var t = $(this);
		
		if(t.find('i').hasClass('a_click')){
			$('#anonymous').val(0);
			t.find('i').removeClass('a_click');
		}else{
			$('#anonymous').val(1);
			t.find('i').addClass('a_click');
		}
	})
	
	$('.fabu_commt').click(function(){
		var con = $('#com_con').val();  //评论内容;
		var score = $('#score').val();  //评分
		var anony = $("#anonymous").val();
		
		if(!score){
			alert(langData["business"][6][17]);  //请选择评分;
		}
		var imglist = [];
		$('.imgList .pubitem').each(function(){
			var t = $(this);
			src = t.find('img').attr('data-val');
			imglist.push(src);
			
		});
		var data = {
			'content' :con,
			'sco1' :score,
			'pics' :imglist.join(','),
			'isanony':anony
		}
		$.ajax({
		    url: "/include/ajax.php?service=member&action=sendComment&type=business&check=1&aid="+id,
		    type: "GET",
		    dataType: "json",
			data:data,
		    success: function (data) {
		        if(data && data.state == 100){
					$(".comm_list .comm_ul").attr('data-page',1);
					loadComment();
					$(".close_commt").click();
				}
		            
		    },
		    error: function(){
		       
		    }
		});
	});
	//初始点击定位当前位置
		$("html").delegate(".carousel .thumb li", "click", function(){
			var t = $(this), carousel = t.closest(".carousel"), album = carousel.find(".album");
			if(album.is(":hidden")){
				t.addClass("on");
				$('html, body').animate({scrollTop: carousel.offset().top - 45}, 300);
				album.show();
			}
		});
	
		//收起图集
		$("html").delegate(".carousel .close", "click", function(){
			var t = $(this), carousel = t.closest(".carousel"), thumb = carousel.find(".thumb"), album = carousel.find(".album");
			album.hide();
			thumb.find(".on").removeClass("on");
		});
		
		
		// 评论点赞
		$('body').delegate('.com_num ','click',function(){
			 var userid = $.cookie(cookiePre+"login_user");
				if(userid == null || userid == ""){
				  window.location.href = masterDomain+'/login.html';
				  return false;
				}
			var t = $(this),num = t.text();
			cid = t.parents('.comm_li').attr('data-id');
			if(t.hasClass("uped")) return false;
			if(cid != "" && cid != undefined){
				$.ajax({
					url: "/include/ajax.php?service=member&action=dingComment&type=add&id="+cid,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data.state==100){
							var ncount = Number(t.text().replace("(", "").replace(")", ""));
							t.addClass("uped").html('<i></i>'+(num*1+1));
								
							//加1效果
							var $i = $("<b>").text("+1");
							var x = t.offset().left, y = t.offset().top;
							$i.css({top: y - 10, left: x + 17, position: "absolute", color: "#E94F06"});
							$("body").append($i);
							$i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
								$i.remove();
							});
						}else{
							alert(data.info)
						}
					}
				});
			}
		})

	var commentObj = $(".comm_list .comm_ul");
	var commentBox = $(".comm_list");
	
	var  pageSize=4;
	loadComment()
	 //加载评论
	    function loadComment(){
			
	        if(id && id != undefined){
	            var page = commentObj.attr("data-page");
				console.log("yema:"+page)
	            var orderby = $(".right_item .click").attr('data-id');
				if(page==1){
					commentObj.html('');
				}
	            //异步获取用户信息
	            $.ajax({
	                url: "/include/ajax.php?service=member&action=getComment&type=business&pageSize="+pageSize+"&son=1&aid="+id+"&page="+page+"&"+orderby,
	                type: "GET",
	                dataType: "jsonp",
	                success: function (data) {
	                    if(data && data.state == 100){
	                        if(commentObj.find("li").length > 0){
	                            commentObj.append(getCommentList(data.info.list));
	                        }else{
	                            commentObj.html(getCommentList(data.info.list));
	                        }
	                        page = commentObj.attr("data-page", (Number(page)+1));
							
							
							$('.reply_ul').each(function(){
								var ul = $(this);
								for(var li = 0; li<ul.children('.comm_li').length; li++){
									if(li<2){
										ul.children('.comm_li').eq(li).removeClass('fn-hide')
									}
								}
								
								var com_num = ul.children('.comm_li.fn-hide').length>0?(langData["business"][6][18].replace('1',(ul.children('.comm_li').length-2))):"";
								/*查看剩余1条回复*/
								ul.next('.more_btn').html(com_num)
							})
							
	                        var pageInfo = data.info.pageInfo;
							if(orderby==''){
								$('.comment_total').text(pageInfo.totalCount);
								$('#comment_good').text(pageInfo.sco4 + pageInfo.sco5);
								$('#comment_middle').text(pageInfo.sco2 + pageInfo.sco3);
								$('#comment_bad').text(pageInfo.sco1);
								$('#comment_pic').text(pageInfo.pic);
								fen =(pageInfo.sco4*4 + pageInfo.sco5*5 + pageInfo.sco2*2 + pageInfo.sco3*3 + pageInfo.sco1)/pageInfo.totalCount;
								$(".comm_box .left_com em").text(fen.toFixed(1));
								$(".comm_box .left_com span.star i").css({
									"width":(fen/5*100)+"%"
								})
							}
							 
	                        if(Number(pageInfo.page) < Number(pageInfo.totalPage)){
	                            $(".more_commt").addClass('show');
	                        }else{
	                            $(".more_commt").removeClass('show');
	                        }
	                        commentBox.find('h2 em').html('('+pageInfo.totalCount+')');
							
							//切换效果
							commentObj.find(".carousel").each(function(){
								var t = $(this), album = t.find(".album");
								//大图切换
								t.slide({
									titCell: ".plist li",
									mainCell: ".albumlist",
									trigger:"click",
									autoPlay: false,
									delayTime: 0,
									startFun: function(i, p) {
										if (i == 0) {
											t.find(".sprev").click()
										} else if (i % 8 == 0) {
											t.find(".snext").click()
										}
									}
								});
								//小图左滚动切换
								t.find(".thumb").slide({
									mainCell: "ul",
									delayTime: 300,
									vis: 10,
									scroll: 8,
									effect: "left",
									autoPage: true,
									prevCell: ".sprev",
									nextCell: ".snext",
									pnLoop: false
								});
							});
							$(".carousel .thumb li.on").removeClass("on");
							
						//	showPageInfo(pageInfo.totalCount) 
							
							// console.log(pageInfo.totalCount)
	                    }else{
	                        if(commentObj.find("li").length <= 0){
	                            commentObj.html("<div class='empty'>"+langData["business"][6][19]+"</div>");  //暂无相关评论
	                           $(".more_commt").removeClass('show');
	                        }
	                    }
	                },
	                error: function(){
	                    if(commentObj.find("li").length <= 0){
	                        commentObj.html("<div class='empty'>"+langData["business"][6][19]+"</div>"); //暂无相关评论
	                         $(".more_commt").removeClass('show');
	                    }
	                }
	            });
	        }else{
	            commentObj.html("Error!");
	        }
	    }
	
	// 筛选
	$('.com_head .right_item span').click(function(){
		var t = $(this);
		commentObj.attr("data-page",1);
		loadComment()
	})


//拼接评论列表
    function getCommentList(list,type){
        var html = [];
        for(var i = 0; i < list.length; i++){
            html.push('<li class="comm_li comm_first fn-clear " data-id="'+list[i]['id']+'">');

            var photo = list[i].user['photo'] == "" ? staticPath+'images/noPhoto_40.jpg' : huoniao.changeFileSize(list[i].user['photo'], "small");

            html.push('  <div class="left_head"><img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_40.jpg\';" data-uid="'+list[i].user['userid']+'" src="'+photo+'" alt="'+list[i].user['nickname']+'"></div>');
			html.push('<div class="right_con"><div class="com_info">');
			html.push('<h4>'+list[i].user.nickname+'</h4>');
			html.push('<p class="star"><i style="width:'+Math.round(list[i].sco1 * 100)/5+'%;"></i></p></div>');
			html.push('	<div class="comm_con">');
			html.push('		<p>'+list[i].content+'</p>');
			html.push('		<div class="comm_img fn-clear">');
			//图集
			if(list[i].pics){
				var pics = list[i].pics;
				if(pics.length > 0){
					var thumbArr = [], albumArr = [];
					for(var p = 0; p < pics.length; p++){
						thumbArr.push('<li class="imgbox"><a href="javascript:;"><img src="'+huoniao.changeFileSize(pics[p], "small")+'" onerror="this.src=`/static/images/404.jpg`" /></a></li>');
						albumArr.push('<div class="aitem"><i></i><img src="'+pics[p]+'" /></div>');
					}

					html.push('<div class="carousel">');
					html.push('<div class="thumb">');
					html.push('<div class="plist">');
					html.push('<ul>'+thumbArr.join("")+'<ul>');
					html.push('</div>');

					if(pics.length > 7){
						html.push('<a href="javascript:;" class="sprev"><i></i></a>');
						html.push('<a href="javascript:;" class="snext"><i></i></a>');
					}
					html.push('</div>');
					html.push('<div class="album">');
					html.push('<a href="javascript:;" hidefocus="true" class="prev"></a>');
					html.push('<a href="javascript:;" hidefocus="true" class="close"></a>');
					html.push('<a href="javascript:;" hidefocus="true" class="next"></a>');
					html.push('<div class="albumlist">'+albumArr.join("")+'</div>');
					html.push('</div>');
					html.push('</div>');
				}
			}
			html.push('		</div>');
			html.push('		<div class="com_detail fn-clear">');
			html.push('			<span class="com_time">'+list[i].ftime+'</span>');
			var up = list[i].zan_has?"uped":""
			html.push('<div class="right_commt"><span class="btn_reply" data-rid="'+list[i]['id']+'" data-replyer="'+list[i].user.nickname+'"><i></i>'+langData["business"][6][16]+'('+list[i].lower.count+')</span><span class="com_num '+up+'"><i></i>'+list[i].zan+'</span></div>');
			html.push('	</div>	</div>');
			if(list[i].lower && list[i].lower.count>0){
				
				html.push('<div class="reply_box"><s></s><ul class="reply_ul">');
				html.push(getreplyList(list[i].lower.list,list[i].user['nickname']))
				html.push('</ul>');
				html.push('<div class="more_btn">'+(list[i].lower.count>10?langData["business"][6][18].replace("1",list[i].lower.count):"没有更多了~")+'</div></div>')
			}
			
            html.push('</li></div>');
        }
        return html.join("");
    }
	
	
	// 获取回复
	function getreplyList(list,replyer){
		var html = [];
		for(var i = 0; i < list.length; i++){
		    html.push('<li class="comm_li fn-clear fn-hide" data-id="'+list[i]['id']+'">');
		
		    var photo = list[i].user['photo'] == "" ? staticPath+'images/noPhoto_40.jpg' : huoniao.changeFileSize(list[i].user['photo'], "small");
		
		    html.push('  <div class="left_head"><img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_40.jpg\';" data-uid="'+list[i].user['userid']+'" src="'+photo+'" alt="'+list[i].user['nickname']+'"></div>');
			html.push('<div class="right_con">');
			html.push('<h4>'+list[i].user.nickname+'</h4>');
			html.push('	<div class="comm_con">');
			html.push('		<p>'+langData["business"][6][16]+'<em>'+(replyer?replyer:list[i].member.nickname)+'</em>'+list[i].content+'</p>');
			html.push('		<div class="com_detail fn-clear">');
			html.push('			<span class="com_time">'+list[i].ftime+'</span>');
			var up = list[i].zan_has?"uped":""
			html.push('<div class="right_commt"><span class="btn_reply" data-rid="'+list[i]['id']+'" data-replyer="'+list[i].user.nickname+'"><i></i>'+langData["business"][6][16]+'('+(list[i].lower?list[i].lower.count:0)+')</span><span class="com_num '+up+'"><i></i>'+list[i].zan+'</span></div>');
			html.push('	</div></div>');
		    html.push('</li>');
			if(list[i].lower && list[i].lower.count>0){
				// console.log(list[i].lower.list)
				html.push(getreplyList(list[i].lower.list));
			}
		}
		return html.join("");
	}
	
	// 回复评论
	$('.comm_list').delegate('.btn_reply','click',function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
		  window.location.href = masterDomain+'/login.html';
		  return false;
		}
		$(".reply_in").remove();
		var t = $(this),p = t.closest('.comm_li');
		var reply = p.find('.reply_box');
		var rid = t.attr('data-rid');
		var replyer = t.attr('data-replyer');
		var rp = '<div class="reply_in"><div class="reply"><input data-rid="'+rid+'" id="replycon" type="text" placeholder="'+langData["business"][6][16]+' '+replyer+':"  /></div><div class="rpbtn_box"><a href="javascript:;" id="rp_btn">'+langData["business"][6][16]+'</a></div></div>';
		if(p.hasClass('comm_first')){
			if(reply.size()>0){
				reply.before(rp)
			}else{
				console.log('zenme')
				p.children('.right_con').append(rp)
			}
		}else{
			t.closest('.comm_li').children('.right_con').append(rp)
		}
		
	});
	
	// 输入框监听
	$(".comm_box ").on("input properchange","#replycon",function(){
		var con = $("#replycon").val();
		if(con!=''){
			$("#rp_btn").addClass('onbtn');
		}else{
			$("#rp_btn").removeClass('onbtn');
		}
	});
	
	// 点击回复按钮/include/ajax.php?service=member&action=replyComment&id=18691&content=hhhhh
	$("body").delegate('#rp_btn','click',function(){
		var con = $("#replycon").val();
		var rid = $("#replycon").attr('data-rid');
		$.ajax({
		    url: "/include/ajax.php?service=member&action=replyComment&id="+rid+"&content="+con,
		    type: "GET",
		    dataType: "jsonp",
		    success: function (data) {
				if(data &&data.state==100){
					commentObj.attr("data-page",'1');
					loadComment();
					$('.reply_in').remove();  //清空输入框
				}else{
					alert(data.info)
				}
			},
			error:function(data){},
		});
	});
	
	// 查看更多评论
	$(".more_commt").click(function(){
	 	loadComment()
	});
	
	// 查看更多回复
	$(".comm_list").delegate('.more_btn','click',function(){
		var t = $(this);
		var ul = t.prev('.reply_ul');
		ul.find('li').removeClass('fn-hide');
		t.text(langData['business'][6][20]);  //没有更多了
	})
	
	 //打印分页
	    function showPageInfo(totalCount) {
	        var info = $(".page_show");
	        var nowPageNum = $(".comm_ul").attr('data-page')?($(".comm_ul").attr('data-page')-1):1;
	        var totalCount = totalCount
	        var allPageNum = Math.ceil(totalCount / pageSize);
	        var pageArr = [];
			// console.log(totalCount)
	        info.html("").hide();
	
	
	        var pages = document.createElement("div");
	        pages.className = "pagination-pages inner";
	        info.append(pages);
	
	        //拼接所有分页
	        if (allPageNum > 1) {
	
	            //上一页
	            if (nowPageNum > 1) {
	                var prev = document.createElement("a");
	                prev.className = "prev";
	                prev.innerHTML = langData['business'][0][11];
	                prev.setAttribute('href','#');
	                prev.onclick = function () {
	                    subpage = nowPageNum - 1;
						$(".comm_ul").attr('data-page',(nowPageNum - 1))
	                    loadComment();
	                }
	            } else {
	                var prev = document.createElement("span");
	                prev.className = "prev page_disabled";
	                prev.innerHTML = langData['business'][0][11];
	            }
	            info.find(".pagination-pages").append(prev);
	
	            //分页列表
	            if (allPageNum - 2 < 1) {
	                for (var i = 1; i <= allPageNum; i++) {
	                    if (nowPageNum == i) {
	                        var page = document.createElement("span");
	                        page.className = "page_current";
	                        page.innerHTML = i;
	                    } else {
	                        var page = document.createElement("a");
	                        page.innerHTML = i;
	                        page.setAttribute('href','javascript:;');
	                        page.onclick = function () {
								
							   $(".comm_ul").attr('data-page',Number($(this).text()));
	                           loadComment()
	                        }
	                    }
	                    info.find(".pagination-pages").append(page);
	                }
	            } else {
	                for (var i = 1; i <= 2; i++) {
	                    if (nowPageNum == i) {
	                        var page = document.createElement("span");
	                        page.className = "page_current";
	                        page.innerHTML = i;
	                    } else {
	                        var page = document.createElement("a");
	                        page.innerHTML = i;
	                        page.setAttribute('href','javascript:;');
	                        page.onclick = function () {
	                            subpage = Number($(this).text());
								
								$(".comm_ul").attr('data-page',Number($(this).text()))
								loadComment()
	                        }
	                    }
	                    info.find(".pagination-pages").append(page);
	                }
	                var addNum = nowPageNum - 4;
	                if (addNum > 0) {
	                    var em = document.createElement("span");
	                    em.className = "interim";
	                    em.innerHTML = "...";
	                    info.find(".pagination-pages").append(em);
	                }
	                for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
	                    if (i > allPageNum) {
	                        break;
	                    } else {
	                        if (i <= 2) {
	                            continue;
	                        } else {
	                            if (nowPageNum == i) {
	                                var page = document.createElement("span");
	                                page.className = "page_current";
	                                page.innerHTML = i;
	                            } else {
	                                var page = document.createElement("a");
	                                page.innerHTML = i;
	                                page.setAttribute('href','javascript:;');
	                                page.onclick = function () {
	                                    $(".comm_ul").attr('data-page',Number($(this).text()))
	                                    loadComment()
	                                }
	                            }
	                            info.find(".pagination-pages").append(page);
	                        }
	                    }
	                }
	                var addNum = nowPageNum + 2;
	                if (addNum < allPageNum - 1) {
	                    var em = document.createElement("span");
	                    em.className = "interim";
	                    em.innerHTML = "...";
	                    info.find(".pagination-pages").append(em);
	                }
	                for (var i = allPageNum - 1; i <= allPageNum; i++) {
	                    if (i <= nowPageNum + 1) {
	                        continue;
	                    } else {
	                        var page = document.createElement("a");
	                        page.innerHTML = i;
	                        page.setAttribute('href','javascript:;');
	                        page.onclick = function () {
	                            $(".comm_ul").attr('data-page',Number($(this).text()))
	                            loadComment()
	                        }
	                        info.find(".pagination-pages").append(page);
	                    }
	                }
	            }
	
	            //下一页
	            if (nowPageNum < allPageNum) {
	                var next = document.createElement("a");
	                next.className = "next";
	                next.innerHTML = langData['business'][0][12];    //下一页
 	                next.setAttribute('href','javascript:;');
	                next.onclick = function () {
	                    subpage = nowPageNum + 1;
	                    $(".comm_ul").attr('data-page',(nowPageNum + 2))
	                    loadComment()
	                }
	            } else {
	                var next = document.createElement("span");
	                next.className = "next page_disabled";
	                next.innerHTML = langData['business'][0][12];    //下一页
 	            }
	            info.find(".pagination-pages").append(next);
	
	            info.show();
	
	        } else {
	            info.hide();
	        }
	    }
	
})