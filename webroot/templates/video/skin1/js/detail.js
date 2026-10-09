$(function(){


	//滚动条插件
	$(".attitude").mCustomScrollbar({theme:"minimal-dark"});
	$(".attitude").mCustomScrollbar("scrollTo","#nowplay");

  	$('.three_road a').click(function(){
  		// 必须是div文本框
		var t = $(this), textarea = $('.right_corner .replycon'), hfTextObj = textarea;
		hfTextObj.focus();

		pasteHtmlAtCaret('<img src="'+t.attr("data-src")+'" />');
	})

	//导航内容切换
    $('.tabBox li').click(function(){
    	console.log(333)
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.listContainer .same_list').eq(i).addClass('show').siblings().removeClass('show');
    });
	$('.tabBox li:eq(0)').click();

    // 点击关注
	$('.guanzhu').off('click').click(function (e) {
	    var t = $(this);
	    if(t.hasClass('isfollow')){
		    t.removeClass('isfollow');
	        t.find('.follwa').html('<a href="'+userUrl+'" target="_blank">已关注</a>');
	        $(this).find('.appo_sec').show();
	        fadeOut();
			sureGuan(followId);
		    return false;
	    }

	});

	function sureGuan(sid){
		$.post("/include/ajax.php?service=video&action=follow&type=1&temp=video&userid=" + sid);
	}

	function fadeOut(){
        setTimeout(function () {
            $('.appo_sec').fadeOut();
        },1500);
    }


	//去支付
	var isclick = false;
    $('.money').click(function(){
		if(isclick) return false;
		isclick = true;
        $.ajax({
            url: '/include/ajax.php?service=video&action=videodeal&aid='+aid+'&amount='+price,
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data.state == '100'){
                    window.location.href=data.info;
                    return false;
                }
            },
            error:function(){
            }
        });
        // $('.disk').hide();
        // $('.moneyAlert').animate({'bottom':'-100%'},200);
        // $('.paySuc').show();
        // setTimeout(function(){$('.paySuc').fadeOut()},1500);
    })

 //  //回复框
	// function replyFunc(parent, name){
	// 	var comment = $(".comment"), mlinfo = comment.closest(".ml-list-info");
	// 	if(Number(mlinfo.attr("data-reply")) == 0){
	// 		mlinfo.find(".reply-shou").click();
	// 	}
	// 	comment.remove();
	// 	parent.find(".comment").remove();
	// 	parent.append($("#replyTemp").html());
	// 	parent.find(".comment").show();

	// 	var textarea = parent.find(".textarea");

	// 	if(name){
	// 		textarea.html('<label contenteditable="false">回复  ' + name + '</label>&nbsp;');
	// 	}

	// 	set_focus(textarea);
	// 	hfTextObj = textarea;
	// 	textarea.bind("paste", function(e){
	// 		clearHtml(e);
	// 	})
	// 	textarea.bind("keydown", function(e){
	// 		clearShortKey(e);
	// 	})
	// }

  // 根据光标位置插入指定内容
	function pasteHtmlAtCaret(html) {
      var sel, range;
      if (window.getSelection) {
          sel = memerySelection;
          if (sel.getRangeAt && sel.rangeCount) {
              range = sel.getRangeAt(0);
              range.deleteContents();
              var el = document.createElement("div");
              el.innerHTML = html;
              var frag = document.createDocumentFragment(), node, lastNode;
              while ( (node = el.firstChild) ) {
                  lastNode = frag.appendChild(node);
              }
              range.insertNode(frag);
              if (lastNode) {
                  range = range.cloneRange();
                  range.setStartAfter(lastNode);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
              }
          }
      } else if (document.selection && document.selection.type != "Control") {
          document.selection.createRange().pasteHTML(html);
      }
  }

	//光标定位到最后
	function set_focus(el){
		el=el[0];
		el.focus();
		if($.browser.msie){
			var rng;
			el.focus();
			rng = document.selection.createRange();
			rng.moveStart('character', -el.innerText.length);
			var text = rng.text;
			for (var i = 0; i < el.innerText.length; i++) {
				if (el.innerText.substring(0, i + 1) == text.substring(text.length - i - 1, text.length)) {
					result = i + 1;
				}
			}
		}else{
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}
	// 回复框选择表情
	var memerySelection;
	$('.cancle_btn').click(function(){
		var t = $(this), box = $('.link_road');
		memerySelection = window.getSelection();
		if (box.css('display') == 'none') {
			$('.link_road').show();
	  		$('.cancle_btn').addClass('new_sticker');
			return false;
		}else {
			$('.link_road').hide();
	  		$('.cancle_btn').removeClass('new_sticker');
		}
	})
  	$('.link_road2 a').click(function(){
  		// 必须是div文本框
		var t = $(this), textarea = $('.t_area .replycon'), hfTextObj = textarea;
		hfTextObj.focus();

		pasteHtmlAtCaret('<img src="'+t.attr("data-src")+'" />');
	})

 //  //回复框
	// function replyFunc(parent, name){
	// 	var comment = $(".comment"), mlinfo = comment.closest(".ml-list-info");
	// 	if(Number(mlinfo.attr("data-reply")) == 0){
	// 		mlinfo.find(".reply-shou").click();
	// 	}
	// 	comment.remove();
	// 	parent.find(".comment").remove();
	// 	parent.append($("#replyTemp").html());
	// 	parent.find(".comment").show();

	// 	var textarea = parent.find(".textarea");

	// 	if(name){
	// 		textarea.html('<label contenteditable="false">回复  ' + name + '</label>&nbsp;');
	// 	}

	// 	set_focus(textarea);
	// 	hfTextObj = textarea;
	// 	textarea.bind("paste", function(e){
	// 		clearHtml(e);
	// 	})
	// 	textarea.bind("keydown", function(e){
	// 		clearShortKey(e);
	// 	})
	// }

  // 根据光标位置插入指定内容
	function pasteHtmlAtCaret(html) {
      var sel, range;
      if (window.getSelection) {
          sel = memerySelection;
          if (sel.getRangeAt && sel.rangeCount) {
              range = sel.getRangeAt(0);
              range.deleteContents();
              var el = document.createElement("div");
              el.innerHTML = html;
              var frag = document.createDocumentFragment(), node, lastNode;
              while ( (node = el.firstChild) ) {
                  lastNode = frag.appendChild(node);
              }
              range.insertNode(frag);
              if (lastNode) {
                  range = range.cloneRange();
                  range.setStartAfter(lastNode);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
              }
          }
      } else if (document.selection && document.selection.type != "Control") {
          document.selection.createRange().pasteHTML(html);
      }
	}

	//光标定位到最后
	function set_focus(el){
		el=el[0];
		el.focus();
		if($.browser.msie){
			var rng;
			el.focus();
			rng = document.selection.createRange();
			rng.moveStart('character', -el.innerText.length);
			var text = rng.text;
			for (var i = 0; i < el.innerText.length; i++) {
				if (el.innerText.substring(0, i + 1) == text.substring(text.length - i - 1, text.length)) {
					result = i + 1;
				}
			}
		}else{
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}

	//评论登录
	$(".comment").delegate(".login", "click", function(){
		if ($.browser.msie && ($.browser.version == "6.0") && !$.support.style) {
			$("html, body").scrollTop(0);
		}
		huoniao.login();
	});

	// 评论操作
	var commentObj = $("#commentList");
	var isLoad = 0;


	//评论筛选【时间、热度】
	$(".c-orderby a").bind("click", function(){
		if(!$(this).hasClass("active")){
			$(".c-orderby a").removeClass("active");
			$(this).addClass("active");

			commentObj
				.attr("data-page", 1)
				.html('<div class="loading"></div>');
			$("#loadMore").removeClass().hide();

			loadComment();
		}
	});

	//加载评论
	function loadComment(){
		if(aid && aid != undefined){
			var page = commentObj.attr("data-page");
			var orderby = $(".c-orderby .active").attr('data-id');
			//异步获取用户信息
			$.ajax({
				url: "/include/ajax.php?service=member&action=getComment&type=video-detail&son=1&aid="+aid+"&page="+page+"&orderby="+orderby+"&pageSize=20",
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

						var pageInfo = data.info.pageInfo;
						if(Number(pageInfo.page) < Number(pageInfo.totalPage)){
							$("#loadMore").removeClass().show();
						}else{
							$("#loadMore").removeClass().hide();
						}

					}else{
						if(commentObj.find("li").length <= 0){
							commentObj.html("<div class='empty'>暂无相关评论</div>");
							$("#loadMore").removeClass().hide();
						}
					}
				},
				error: function(){
					if(commentObj.find("li").length <= 0){
						commentObj.html("<div class='empty'>暂无相关评论</div>");
						$("#loadMore").removeClass().hide();
					}
				}
			});
		}else{
			commentObj.html("Error!");
		}
	}

	//拼接评论列表
	function getCommentList(list){
		var html = [];
		for(var i = 0; i < list.length; i++){
			html.push('<li class="fn-clear" data-id="'+list[i]['id']+'">');

			var photo = list[i].user['photo'] == "" ? staticPath+'images/noPhoto_40.jpg' : huoniao.changeFileSize(list[i].user['photo'], "small");

			html.push('  <img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_40.jpg\';" data-uid="'+list[i].user['userid']+'" src="'+photo+'" alt="'+list[i].user['nickname']+'">');
			html.push('  <div class="c-body">');
			html.push('    <div class="c-header">');
			html.push('      <a href="javascript:;" data-id="'+list[i].user['userid']+'">'+list[i].user['nickname']+'</a>');
			html.push('      <span>'+list[i]['ftime']+(list[i].iphome ? ' · ' + list[i].iphome : '')+'</span>');
			html.push('    </div>');
			html.push('    <p>'+list[i]['content']+'</p>');
			html.push('    <div class="c-footer">');

			var praise = "praise";
			if(list[i]['zan_has'] == 1){
				praise = "praise active";
			}
			html.push('      <a href="javascript:;" class="'+praise+'">(<em>'+list[i]['zan']+'</em>)</a>');

			html.push('      <a href="javascript:;" class="reply">回复(<em>'+(list[i]['lower']!=undefined && list[i]['lower'].count ? list[i]['lower'].count : 0)+'</em>)</a>');
			html.push('    </div>');
			html.push('  </div>');
			if(list[i]['lower']!=undefined && list[i]['lower'].count > 0 && list[i]['lower'].list!=null){
				html.push('  <ul class="children">');
				html.push(getCommentList(list[i]['lower']['list']));
				html.push('  </ul>');
			}
			html.push('</li>');
		}
		return html.join("");
	}

	//加载更多评论
	$("#loadMore").bind("click", function(){
		$(this).addClass("loading");
		loadComment();
	});

	//顶
	commentObj.delegate(".praise", "click", function(){
		var t = $(this), id = t.closest("li").attr("data-id");
		if(t.hasClass("active")) return false;
		if(id != "" && id != undefined){
			$.ajax({
				url: "/include/ajax.php?service=member&action=dingComment&type=add&id="+id,
				type: "GET",
				dataType: "json",
				success: function (data) {
					var ncount = Number(t.text().replace("(", "").replace(")", ""));
					t
						.addClass("active")
						.html('(<em>'+(ncount+1)+'</em>)');

					//加1效果
					var $i = $("<b>").text("+1");
					var x = t.offset().left, y = t.offset().top;
					$i.css({top: y - 10, left: x + 17, position: "absolute", color: "#E94F06"});
					$("body").append($i);
					$i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
						$i.remove();
					});

				}
			});
		}
	});

	//评论回复
	commentObj.delegate(".reply", "click", function(){
		var carea = commentObj.find(".c-area");
		if(carea.html() != "" && carea.html() != undefined){
			carea.stop().slideUp("fast");
			commentObj.find(".reply").removeClass("active");
		}
		var areaObj = $(this).closest(".c-body"),
			replaytemp = $("#replaytemp").html();
		if(areaObj.find(".c-area").html() == "" || areaObj.find(".c-area").html() == undefined){
			areaObj.append(replaytemp);
			clearContenteditableFormat(areaObj.find(".c-area .textarea"));
		}
		areaObj.find(".c-area").stop().slideToggle("fast");

	});

	//提交评论回复
	$(".comment").delegate(".subtn", "click", function(){
		var t = $(this), id = t.closest("li").attr("data-id");
		if(t.hasClass("login") || t.hasClass("loading")) return false;

		var contentObj = t.parent().prev(".textarea"),
			content = contentObj.html();

		if(content == ""){
			return false;
		}
		if(huoniao.getStrLength(content) > 200){
			alert("超过200个字了！");
		}

		if(id == undefined){
            var url = '/include/ajax.php?service=member&action=sendComment&check=1&type=video-detail&aid=' + aid;
        }else{
            var url = '/include/ajax.php?service=member&action=replyComment&check=1&id=' + id;
        }
		id = id == undefined ? 0 : id;

		t.addClass("loading");

		$.ajax({
			url: url,
			data: "content="+content,
			type: "POST",
			dataType: "json",
			success: function (data) {

				t.removeClass("loading");
				contentObj.html("");
				if(data && data.state == 100){

					var info = data.info;
					var list = [];
					var photo = info.userinfo['photo'] == "" ? staticPath+'images/noPhoto_40.jpg' : huoniao.changeFileSize(info.userinfo['photo'], "small");
					list.push('<li class="fn-clear colorAnimate" data-id="'+info['id']+'">');
					list.push('  <img data-uid="'+info.userinfo['userid']+'" src="'+photo+'" alt="'+info.userinfo['nickname']+'">');
					list.push('  <div class="c-body">');
					list.push('    <div class="c-header">');
					list.push('      <a href="javascript:;" data-id="'+info.userinfo['userid']+'">'+info.userinfo['nickname']+'</a>');
					list.push('      <span>'+info['ftime']+(info.iphome ? ' · ' + info.iphome : '')+'</span>');
					list.push('    </div>');
					list.push('    <p>'+info['content']+'</p>');
					list.push('    <div class="c-footer">');
					list.push('      <a href="javascript:;" class="praise">(<em>'+info['zan']+'</em>)</a>');
					list.push('      <a href="javascript:;" class="reply">回复(<em>'+(info['lower'] ? info['lower'].list.length : 0)+'</em>)</a>');
					list.push('    </div>');
					list.push('  </div>');
					list.push('</li>');

					//一级评论
					if(contentObj.attr("data-type") == "parent"){
						if(commentObj.find("li").length <= 0){
							commentObj.html("");
							$("#loadMore").removeClass().hide();
						}

						commentObj.prepend(list.join(""));

					//子级
					}else{

						t.closest(".c-area").hide();

						var children = t.closest("li").find(".children");
						//判断子级是否存在
						if(children.html() == "" || children.html() == undefined){
							t.closest("li").append('<ul class="children"></ul>');
						}

						t.closest("li").find("ul.children").prepend(list.join(""));


					}

				}

			}
		});

	});

	// 回复区
	$('.appear_area .no_3').click(function(){
		pink_cor = $(this).parent().find('.pink_cor')
		if (pink_cor.css('display') == 'none'){
			$('.pink_cor').hide();
			$(this).parent().find('.pink_cor').show();
		}else{
			$(this).parent().find('.pink_cor').hide();
		}
	})

	loadComment();
})
