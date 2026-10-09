$(function(){
	

/*===================评价相关js======================*/ 
	// 评论列表筛选
	$('.commentBox .right_item span').click(function(){
		$(this).addClass('click').siblings('span').removeClass('click');
		//数据请求
		
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
		var anony = $("#anonymous").val();
		var imglist = [];
		$('.imgList .pubitem').each(function(){
			var t = $(this);
			src = t.find('img').attr('data-val');
			imglist.push(src);
			
		});
		var data = {
			'content' :con,
			'pics' :imglist.join(','),
			'isanony':anony
		}
		$.ajax({
		    url: "/include/ajax.php?service=house&action=sendCommon&aid="+newsid ,
		    type: "GET",
		    dataType: "json",
			data:data,
		    success: function (data) {
		        if(data && data.state == 100){
					$(".comm_list .allComment").attr('data-page',1);
					loadComment(1);
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
		
	var commentWrap = $(".comm_list .comm_ul");
	var commentObj = $(".comm_list .allComment");
	var commentBox = $(".comm_list");

	var  pageSize=10;
	if(needComment != 1){//套餐详细时需要
		pageSize=3;
	}
	loadComment();

	
	 //加载评论
	    function loadComment(tr){
	        if(id && id != undefined){
	            var page = commentObj.attr("data-page");
	            var orderby = $(".right_item .click").attr('data-id');
				if(tr){
                  $('.allComment').html(' ');
                }
				var url = '/include/ajax.php?service=house&action=common&aid=' + newsid + "&page=" + page + "&pageSize=" + pageSize;
	            //异步获取用户信息
	            $.ajax({
	                url: url,
	                type: "GET",
	                dataType: "json",
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
	                        var totalNum = pageInfo.totalCount;
	                    	$('.det_tab .totalNum').text(totalNum);
	                    	$('.comTotal').html("( "+totalNum+" )")
							 
	                        if(Number(pageInfo.page) < Number(pageInfo.totalPage)){
	                            $(".more_commt").addClass('show');
	                        }else{
	                            $(".more_commt").removeClass('show');
	                        }
	                        commentBox.find('h2 em').html('('+pageInfo.totalCount+')');
							
							//切换效果
							commentWrap.find(".carousel").each(function(){
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
        if (list.length >0){
	        for(var i = 0; i < list.length; i++){
	            html.push('<li class="comm_li comm_first fn-clear " data-id="'+list[i].id+'">');

	            var photo = list[i].photo == "" ? staticPath+'images/noPhoto_100.jpg' : huoniao.changeFileSize(list[i].photo, "large");

	            html.push('  <div class="left_head"><img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';" src="'+photo+'" alt="'+list[i].username+'"></div>');
				html.push('<div class="right_con"><div class="com_info">');
				html.push('<h4>'+list[i].username+'</h4></div>');
				html.push('	<div class="comm_con">');
				html.push('		<p>'+list[i].content+'</p>');
				html.push('		<div class="comm_img fn-clear">');
				//图集
				if(list[i].picsarr){
					var pics = list[i].picsarr;
					if(pics.length > 0){
						var thumbArr = [], albumArr = [];
						for(var p = 0; p < pics.length; p++){
							thumbArr.push('<li class="imgbox"><a href="javascript:;"><img src="'+huoniao.changeFileSize(pics[p].picspath, "large")+'" /></a></li>');
							albumArr.push('<div class="aitem"><i></i><img src="'+pics[p].picspath+'" /></div>');
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
				html.push('			<span class="com_time">'+list[i].dtime+(list[i].iphome ? ' · ' + list[i].iphome : '')+'</span>');
				html.push('		</div>');
              	html.push(' </div>')
				if(list[i].reply){
					
					html.push('<div class="reply_box"><s></s><ul class="reply_ul">');
					html.push('<li class="comm_li fn-clear"> ');
                  	html.push('  <div class="left_head"><img src="/static/images/noPhoto_100.jpg"></div>');
					html.push('<div class="right_con"><div class="com_info">');
					html.push('<h4>小编</h4>');
					html.push('	<div class="comm_con">');
                  	html.push('<p>回复<em>'+list[i].username+'</em>'+list[i].reply+'</p>');
                  	html.push(' <div class="com_detail fn-clear"><span class="com_time">'+list[i].replydate+(list[i].iphome ? ' · ' + list[i].iphome : '')+'</span></div>')
                  	html.push('</div>');
                  	html.push('</div>');
                  	html.push('</li>');
					html.push('</ul>');
				}
				
	            html.push('</li></div>');
	        }
        }else{
        	html.push('<li class="noComm"><img src="'+templets_skin+'images/noComment.png" /><p>还没有评论，快来发表第一条评论吧！</p></li>');
        }
        
        return html.join("");
    }
	
	
	
	// 输入框监听
	$(".commentBox ").on("input properchange","#replycon",function(){
		var con = $("#replycon").val();
		if(con!=''){
			$("#rp_btn").addClass('onbtn');
		}else{
			$("#rp_btn").removeClass('onbtn');
		}
	});
	
	
	// 查看更多评论
	$(".more_commt").click(function(){
		if(needComment == 1){//商家详情
			$('.store_nav li.pl').click();
		}else{//套餐详情
			loadComment();
			
		}
	 	
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
        var nowPageNum = $(".allComment").attr('data-page')?($(".allComment").attr('data-page')-1):1;
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
					$(".allComment").attr('data-page',(nowPageNum - 1))
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
							
						   $(".allComment").attr('data-page',Number($(this).text()));
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
							
							$(".allComment").attr('data-page',Number($(this).text()))
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
                                    $(".allComment").attr('data-page',Number($(this).text()))
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
                            $(".allComment").attr('data-page',Number($(this).text()))
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
                    $(".allComment").attr('data-page',(nowPageNum + 2))
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