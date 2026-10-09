$(function(){

  // 回复评论展开
	$('body').delegate('.reply', "click", function(){
		var x = $(this), replyBox = x.closest('.reply-box').find('.reply-txt');
		if (replyBox.css("display") == "block") {
			replyBox.hide();
		}else{
			replyBox.show();
		}
		replyBox.find(".textarea").focus();
	})

  //发表回复
	$('body').delegate('.reply', "click", function(){
		var t = $(this), txt = t.text();
		if(t.hasClass("disabled")) return false;

		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain + '/login.html';
			return false;
		}

		var content = t.closest('.txt_reply').find('.re_input').val();
		if($.trim(content) == ""){
			alert(langData['siteConfig'][20][385]);   //请填写留言内容
			return false;
		}

		var rid = t.closest('.item').attr("data-id");

		t.addClass("disabled").html(langData['siteConfig'][6][35]);  //提交中

		$.ajax({
			url: "/include/ajax.php?service=member&action=sendMessage&uid="+uid,
			type: "POST",
			data: {content: content, rid: rid},
			async: false,
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
                    page = 1;
                    getMessage();
                    t.removeClass("disabled").html(txt);
                    $('.re_input').val('');
                    // $('.layer_num').text(200);
                    // $('.layer').hide();
				}else{
					t.removeClass("disabled").html(txt);
					alert(data.info);
				}
			},
			error: function(){
				t.removeClass("disabled").html(txt);
				alert(langData['siteConfig'][20][386]);  //网络错误，留言失败！
			}
		});

	});

  // 评论弹出层
  $('.fabuBtn').click(function(){
    $('.layer').show();
  })

  // 隐藏弹出层
  $('.layer .header-l').click(function(){
    $('.layer').hide();
  })

	function commonChange(t){
		var val = t.val(), maxLength = 200;
		var charLength = val.replace(/<[^>]*>|\s/g, "").replace(/&\w{2,4};/g, "a").length;
		var alllength = charLength;
		var surp = maxLength - charLength;
		surp = surp <= 0 ? 0 : surp;

		$('.layer_num').text(surp);

		if(alllength > maxLength){
			t.val(val.substring(0,maxLength));
			return false;
		}
	}

	$('.layer_txt .textarea').bind('input propertychange', function(){
		commonChange($(this));
	})

	$("#msg_in").focus(function(){
		$(".mask_re").fadeIn();
	});
	$("#msg_in").blur(function(){
		$(".mask_re").fadeOut();
	})

	// 删除留言
	$("body").delegate(".del_msg",'click',function(){
		var t = $(this),p = t.parents('.item');
		var cid = t.parents(".item").attr('data-id');  //获取该评论id
		$('.mask_pop').fadeIn();
		$('.pop_box').animate({"bottom":0},200);
		$("html").addClass('noscroll');
		$(".pop_box .sure_btn").click(function(){
			// 执行删除操作
			p.remove();
			$('.mask_pop').fadeOut();
			$('.pop_box').animate({"bottom":'-4.2rem'},200);
			$("html").removeClass('noscroll');

			$.ajax({
				url: "/include/ajax.php?service=member&action=delUserMessage&id="+cid,
				type: "POST",
				dataType: "json",
				success: function (data) {}
			});

		})
	});

	// 取消
	 $(".pop_box .cancel_btn,.mask_pop").click(function(){
		  $('.mask_pop').fadeOut();
		  $('.pop_box').animate({"bottom":'-4.2rem'},200);
		  $("html").removeClass('noscroll');
	  });


  $('.fabu').click(function(){
    var t = $(this), txt = t.text();
		if(t.hasClass("disabled")) return false;

		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain + '/login.html';
			return false;
		}

		var content = $('#msg_in').val();
		if($.trim(content) == ""){
			alert(langData['siteConfig'][20][385]);
			return false;
		}

		var rid = 0;

		t.addClass("disabled").html(langData['siteConfig'][6][35]);

		$.ajax({
			url: "/include/ajax.php?service=member&action=sendMessage&uid="+uid,
			type: "POST",
			data: {content: content, rid: rid},
			async: false,
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
				    page = 1;
                    getMessage();
                    t.removeClass("disabled").html(txt);
                    $('#msg_in').val('');
                    // $('.layer_num').text(200);
                    // $('.layer').hide();
				}else{
					t.removeClass("disabled").html(txt);
					alert(data.info);
				}
			},
			error: function(){
				t.removeClass("disabled").html(txt);
				alert(langData['siteConfig'][20][386]);   //网络错误，留言失败！
			}
		});

  })


    // 下拉加载
    var isload = false;
    $(window).scroll(function() {
        var h = $('.item').height();
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - h;
        if ($(window).scrollTop() > scroll && !isload) {
            getMessage();
        };
    });


  var loadmore = $(".load_more");
	getMessage();

	//加载留言
	function getMessage(){
        isload = true;
		$.ajax({
			url: "/include/ajax.php?service=member&action=messageList&uid="+uid+"&page="+page+"&pageSize=5",
			type: "GET",
			async: false,
			dataType: "jsonp",
			success: function (data) {
				// loadmore.removeClass("disabled").html(langData['siteConfig'][6][148]);
				$(".list").append(' <div class="load_more"><img src="{#$templets_skin#}/images/index_4.8/loading.png" alt=""></div>')
				if(data && data.state == 100){
					var list = data.info.list, pageInfo = data.info.pageInfo;
					totalPage = pageInfo.totalPage;

					//拼接留言列表
					var html = [];
					for(var i = 0; i < list.length; i++){
						html.push('<div class="item" data-id="'+list[i].id+'"><div class="msg_box">');
						html.push('<div class="cmt_info"><div class="hphoto"><a href="'+masterDomain+'/user/'+list[i].uid+'"><img src="'+list[i].photo+'" onerror="this.src=\'/static/images/noPhoto_60.jpg\'" alt=""></a></div>');
						html.push('<div class="uname"><h4>'+list[i].nickname+'</h4><p>'+list[i].date+'</p></div>');
						console.log(uid==nid)
						if(uid==nid){
							html.push('<a href="javascript:;" class="del_msg"></a>')
						}
						html.push('</div>')
						html.push('<div class="msg_con">'+list[i].content+'</div>')
						html.push(' <div class="txt_reply fn-clear"><button class="reply" id="'+list[i].id+'">'+langData['siteConfig'][6][29]+'</button><div class="left_input"><input class="re_input" type="text" name="" id="" value="" placeholder="'+placeholderText+'"/></div></div>');  //回复   说点什么
						if(list[i].reply){
							html.push(' <div class="reply_list">');
							html.push('<span class="reply_count"></span>');
							html.push('<ul>');
							html.push('<li class="re_li">');
							html.push(' <div class="left_hphoto"><img src="'+list[i].reply.photo+'" onerror="this.src=\'/static/images/noPhoto_60.jpg\'" alt=""></div>');
							html.push(' <div class="right_rebox">');
							html.push('<h4>'+list[i].reply.nickname+'</h4>');
							html.push('<p class="re_con">'+list[i].reply.content+'</p>');
							html.push(' <p class="re_time">'+list[i].reply.date+'</p>');
							html.push(' </div>');
							html.push('</li></ul></div>');
						}

						html.push(' </div></div>');
					}

					if(page == 1) {
                        $(".list").html(html.join(""));
                    }else{
                        $(".list").append(html.join(""));
                    }
					$(".load_more").remove();

					//如果已经到最后一页了，移除更多按钮
					if(page == pageInfo.totalPage){
						loadmore.remove();
					}else{
                        isload = false;
						page++;
					}

				}else{
					loadmore.remove();
					if(page == 1){
							$(".list").html('<div class="empty">'+langData['siteConfig'][20][387]+'</div>');   //暂无留言
					}
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][388]);  //网络错误，请求失败！
				loadmore.removeClass("disabled").html(langData['siteConfig'][6][148]);  //查看更多留言
			}
		});
	}

})
