// 评论相关定义
var page = 1; pageSize=5,totalPage=1;
$(function(){
	// 判断是否发过
	if($(".circle_list .circle_box").size()==0){
		$(".circle_con.con_box").hide();
	}else if($(".circle_more li").size()==1){
		$(".box2.circle").hide();
	}
	
	// 表情添加
	$(".face_box").append(huoniao.appendEmoji())

	// 选择背景图
	$(".bg_list li.bg_li").click(function(){
		var t= $(this);
		var cls = "top"+t.attr('data-num');
		var chosecls = "top"+$(".bg_list li.bg_li.chose").attr('data-num');
		var usecls = "top"+ $(".bg_list li.bg_li.used").attr('data-num');
		$('.top_box').removeClass(usecls).removeClass(chosecls).addClass(cls)
		t.addClass('chose').siblings('li').removeClass('chose');
	
	});
	
	// 修改背景图
	$('.change_bg').click(function(){
		$('html').addClass('noscroll');
		$('.bg_box').animate({"bottom":0},150);
	});
	
	// 更换背景色时
	$(".bgul_box").scroll(function(){
		var sct = $(".bgul_box").scrollTop();
		var sch = $(".bgul_box").height();
		var ulh = $(".bgul_box>ul").height();
		if((sct + sch) >= ulh){
			$(".bg_black").hide();
		}else{
			$(".bg_black").show()
		}
	})
	
	$(".close_bg,.btn_cancel").click(function(){
		var usecls = "top"+ $(".bg_list li.bg_li.used").attr('data-num');
		var chosecls = "top"+$(".bg_list li.bg_li.chose").attr('data-num');
		$('.top_box').removeClass(chosecls).addClass(usecls);
		$('html').removeClass('noscroll');
		$('.bg_box').animate({"bottom":"-400px"},150);
	});
	
	$(".btn_sure").click(function(){
		$(".bg_list li.bg_li.chose").siblings('li').removeClass('used');
		$(".bg_list li.bg_li.chose").removeClass('chose').addClass('used');
		var id = $(".bg_list li.bg_li.used").attr('data-num');
		$.post("/include/ajax.php?service=member&action=updateCoverBg", {type:'pc',id: id}, function(){
				alert(langData['siteConfig'][6][39]);  //保存成功
				$('html').removeClass('noscroll');
				$('.bg_box').animate({"bottom":"-400px"},150);
			});
	});
	
	// 发布分类切换
	$(".fabu_type li").click(function(){
		var t = $(this),id = t.attr('data-id'),index = t.index() ;
		t.addClass('onclick').siblings('li').removeClass('onclick');
		$(".fabu_list ul").addClass("fn-hide")
		$(".fabu_list ul").eq(index).removeClass("fn-hide");
		if($(".fabu_list ul").eq(index).find("li.fabu_li").size()==0){
			getlist();
		}
		
	})
	

// 圈子内容点击
	var pageTime = {};
	$(".img_box,.link_out,.comt_list").click(function(){
		
		$(".poster").css("top",$(this).position().top);
		$(".circle_con .poster").show();
		pageTime["time1"] =  setTimeout(function(){
			$(".circle_con .poster").hide();
			
		},3000)
		$(".poster").hover(function(){
			//清除定时器
			for(var each in pageTime){
			    clearInterval(pageTime[each]);
			}
		},function(){
			$(".circle_con .poster").hide();
		})
	});
	$(".posi,.topic_link,.zanbox").click(function(){
		
		$(".poster").css("top",$('.link_out').position().top);
		$(".circle_con .poster").show();
		pageTime["time2"] =  setTimeout(function(){
			$(".circle_con .poster").hide();
			
		},3000)
		$(".poster").hover(function(){
			//清除定时器
			for(var each in pageTime){
			    clearInterval(pageTime[each]);
			}
		},function(){
			$(".circle_con .poster").hide();
		})
	});
	
	$(".box2.circle").click(function(){
		$(".poster").css({"bottom":"-150px","top":"auto"});
		$(".circle_con .poster").show();
		pageTime["time3"] =  setTimeout(function(){
			$(".circle_con .poster").hide();
			
		},3000)
		$(".poster").hover(function(){
			//清除定时器
			for(var each in pageTime){
			    clearInterval(pageTime[each]);
			}
		},function(){
			$(".circle_con .poster").hide();
		})
	})
	
	
	
	// 留言相关
	// 留言板评论展开
		$('body').delegate('.reply_btn i', "click", function(){
			var x = $(this),
				find = x.closest('.reply').find('.msg_box');
			if (find.css("display") == "block") {
				find.hide();
			}else{
				find.show();
			}
			var name = x.closest(".message_txt").find(".mes_first .name").text();
			find.find(".textarea").attr("placeholder", langData['siteConfig'][6][29]+"：" + name).focus();  //回复
		})
		var commonChange = function(t){
			var val = t.text(), maxLength = 200;
			var charLength = val.replace(/<[^>]*>|\s/g, "").replace(/&\w{2,4};/g, "a").length;
			var imglength = t.find('img').length;
			var alllength = charLength + imglength;
			var surp = maxLength - charLength - imglength;
			surp = surp <= 0 ? 0 : surp;
	
			t.closest('.write').find('em').text(surp);
	
			if(alllength > maxLength){
				t.text(val.substring(0,maxLength));
				return false;
			}
	    if(alllength > 0){
			
	      t.closest('.msg_box').find('.com_btn').css('background','#34bdf6')
	    }else{
	      t.closest('.msg_box').find('.com_btn').css('background','#d4d4d4')
	    }
		}
		$('body').delegate('.txt', "keyup", function(){
			memerySelection = window.getSelection();
			commonChange($(this));
		})
	// 表情盒子打开关闭
	var memerySelection;
		$('body').delegate('.editor', "click", function(){
			var x = $(this),
				find = x.closest('.comment_foot').find('.face_box');
			if (find.css("display") == "block") {
				find.hide();
				x.removeClass('ed_bc');
			}else{
		    memerySelection = window.getSelection();
				find.show();
				x.addClass('ed_bc');
				return false;
			}
		})
	
		// 选择表情
	$('body').delegate('.face_box ul li', "click", function(){
	  var t = $(this).find('img'), textarea = t.closest('.msg_box').find('.textarea'), hfTextObj = textarea;
	  var txt = $(this).attr('data-txt');
	  hfTextObj.focus();
	  pasteHtmlAtCaret('<img src="'+t.attr("src")+'" data-txt="'+txt+'" />');
			commonChange(textarea);
			$('.editor').removeClass('ed_bc');
			t.closest(".face_box").hide();
	});
	
	
	//根据光标位置插入指定内容
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
	
		//评论
		var page = 1, pageSize = 10, totalPage = 1;
		var loadmore = $("#leave_message .load_more");
	
		//表情
		var emot = [];
		for (var i = 1; i < 51; i++) {
			var fi = i < 10 ? "0" + i : i;
			emot.push('<li><a href="javascript:;"><img src="/static/images/ui/emot/baidu/i_f'+fi+'.png" /></a></li>');
		}
	
	// 回复框出现
	$(".msg_list").delegate('li .reply_btn','click',function(){
		var t = $(this);
		$(".msg_list .msg_box").hide();
		t.next('.msg_box').show();
	});
	
	// 点击按钮 滑动到留言区
	$('.message').click(function(){
		console.log($(".msg_con").offset().top);
		var sct = $(".msg_con").offset().top
		$("html,body").animate({"scrollTop":sct},1000);
		// $(window).scrollTop(sct)
	})
	
	//发表留言
		$('body').delegate('.com_btn', "click", function(){
			var t = $(this), txt = t.text();
			if(t.hasClass("disabled")) return false;
	
			var userid = $.cookie(cookiePre+"login_user");
			if(userid == null || userid == ""){
				location.href = masterDomain + '/login.html';
				return false;
			}
			var conbox = t.closest('.msg_box').find('.textarea');
			conbox.find('img').each(function(){
				var bqTxt = $(this).attr('data-txt');
				$(this).after(bqTxt);
				$(this).remove()
			});
			var content = t.closest('.msg_box').find('.textarea').html();
			
			
			if($.trim(content) == ""){
				alert(langData['siteConfig'][20][385]);  //请填写留言内容！
				return false;
			}
	
			var rid = 0;
			if(txt == langData['siteConfig'][6][29]){  //回复
				rid = t.closest('.msg_li').attr("data-id");
			}
	
			t.addClass("disabled").html(langData['siteConfig'][6][35]+"..");  //提交中
			
			
			// return false;
			$.ajax({
				url: "/include/ajax.php?service=member&action=sendMessage&uid="+uid,
				type: "POST",
				data: {content: content, rid: rid},
				async: false,
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						location.reload();
					}else{
						t.removeClass("disabled").html(txt);
						alert(data.info);
					}
				},
				error: function(){
					t.removeClass("disabled").html(txt);
					alert(langData['siteConfig'][20][386]);  //账户余额
				}
			});
	
		});

	if($("#leave_message").size() > 0){
			getMessage();
	
			//查看更多
			$(".loading_msg").bind("click", function(){
				var t = $(this);
				if(t.hasClass("disabled")) return false;
				if(page > totalPage){
					t.hide();
					return false;
				}
				t.addClass("disabled");
				t.html('<img src="/static/images/loadgray.gif" />');
				getMessage();
			});
		}

	// 加载评论
		function getMessage(){
			$.ajax({
				url: "/include/ajax.php?service=member&action=messageList&uid="+uid+"&page="+page+"&pageSize=5",
				type: "GET",
				async: false,
				dataType: "jsonp",
				success: function (data) {
					$(".loading_msg").removeClass("disabled").html('<a href="javascript:;">'+langData['siteConfig'][6][148]+'</a>');  //查看更多留言
					if(data && data.state == 100){
						var list = data.info.list, pageInfo = data.info.pageInfo;
	
						totalPage = pageInfo.totalPage;
	
						//拼接留言列表
						var html = [];
						for(var i = 0; i < list.length; i++){
						html.push('<li class="msg_li fn-clear" data-id="'+list[i].id+'">');
						html.push('<div class="head_img"><a href="'+masterDomain+'/user/'+list[i].uid+'"><img src="'+(list[i].photo?list[i].photo:"/static/images/noPhoto_60.jpg")+'" onerror="this.src=\'/static/images/noPhoto_60.jpg\'" alt="'+list[i].nickname+'"></a></div>');
						html.push('<div class="msg-con"><div class="first_msg">');
						html.push('<h3>'+list[i].nickname+'</h3><p>'+list[i].content+'</p><span class="pubdate">'+list[i].date+'</span></div>');
						if(list[i].reply){
							html.push('<div class="reply_list"><i></i><ul><li>');
							html.push('<h3>'+list[i].reply.nickname+'</h3>');
							html.push('<p>'+list[i].reply.content+'</p>');
							html.push('</li></ul></div>');
						}
						html.push('</div><div class="reply_box">');
						html.push('<a href="javascript:;" class="reply_btn"><img src="'+templets_skin+'images/user/reply_icon.png"></a>');
						html.push('<div class="msg_box"><div class="write"><div class="textarea txt" contenteditable="true"></div><em>200</em></div>');
						html.push('<div class="comment_foot fn-clear">');
						html.push('<div class="editor_btn"><input type="button" class="editor"></div>');
						html.push('<div class="com_btn first">'+langData['siteConfig'][6][29]+'</div>');  /* {#* 留言 *#} */
						html.push('<div class="face_box"><i></i>');
						html.push(huoniao.appendEmoji());
						html.push('</div></div></div></div></li>');
						}
						
						$('.msg_list>ul').append(html.join(""))
						//如果已经到最后一页了，移除更多按钮
						if(page == pageInfo.totalPage){
							$(".loading_msg").remove();
						}else{
							page++;
						}
	
					}else{
						
						if(page == 1){
							$("#leave_message .loading_msg").html('<div class="empty">'+langData['siteConfig'][20][387]+'</div>');  //暂无留言！
						}
					}
				},
				error: function(){
					alert(data.info);  
					$(".loading_msg").removeClass("disabled").html('<a href="javascript:;">'+langData['siteConfig'][6][148]+'</a>');  //查看更多留言
				}
			});
		}

		getlist();
		function getlist(){
		var module = "travelStrategy";
		var module = $(".fabu_type li.onclick").attr("data-module");
		var modulename = $(".fabu_type li.onclick").text();
		var page = 1, pageSize = 6;
		var cls = "",cls1 = "info";
		var text = '';
		var istop = '';
		var id = $(".fabu_type li.onclick").index();
	    var url='';
		if(module == "info"){
			cls ="gao1";
			cls1 = "price";
			url="/include/ajax.php?service=info&action=ilist_v2&orderby=1&uid="+uid+"&page="+page+"&pageSize="+pageSize;
			text = modulename ;
		}else if(module == "tieba"){
			url="/include/ajax.php?service=tieba&action=tlist&uid="+uid+"&page="+page+"&pageSize="+pageSize;
			text = modulename ;
		}else if(module == "live"){
			cls ="gao2";
			url="/include/ajax.php?service=live&action=alive&orderby=time&uid="+uid+"&page="+page+"&pageSize="+pageSize;
			text = modulename ;
		}else if(module == "huodong"){
			cls1 = "price";
			cls ="gao2";
			url="/include/ajax.php?service=huodong&action=hlist&uid="+uid+"&page="+page+"&pageSize="+pageSize;
			text = modulename 
		}else if(module == "vote"){
			cls ="gao2";
			url="/include/ajax.php?service=vote&action=vlist&uid="+uid+"&page="+page+"&pageSize="+pageSize;
			text = modulename
		}else if(module == "video"){
			cls ="gao2";
			url="/include/ajax.php?service=video&action=alist&uid="+uid+"&page="+page+"&pageSize="+pageSize;
			text = modulename
		}else if(module == "education"){
			url="/include/ajax.php?service=education&action=coursesList&uid="+uid+"&page="+page+"&pageSize="+pageSize;
			text = modulename 
			cls1 = "price";
		}else if(module == "marry"){
			url="/include/ajax.php?service=marry&action=storeList&uid="+uid+"&page="+page+"&pageSize="+pageSize;
			text = modulename
		}else if(module == "car"){
			url="/include/ajax.php?service=car&action=car&uid="+uid+"&page="+page+"&pageSize="+pageSize;
			text = modulename
			cls1 = "price";
		}else if(module == "yvideo"){
			cls ="gao2";
			url="/include/ajax.php?service=travel&action=videoList&uid="+uid+"&page="+page+"&pageSize="+pageSize;
			text = "旅游视频" 
		}else if(module == "lystrategy"){
			cls ="gao2";
			url="/include/ajax.php?service=travel&action=strategyList&uid="+uid+"&page="+page+"&pageSize="+pageSize;
			text = "旅游攻略" 
		}else if(module == "house"){
			url="/include/ajax.php?service=house&action=allhouseFabu&uid="+uid+"&page="+page+"&pageSize="+pageSize;
			// text = "房产" ;
			cls1 = "price";
		}else if(module == "travelStrategy"){
			url="/include/ajax.php?service=travel&action=strategyList&uid="+uid+"&page="+page+"&pageSize="+pageSize;
			text = "旅游攻略" ;
		}
		
		$.ajax({
			url: url,
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data.state == 100){
					var html = [], list = data.info.list;

                    var img404 = '/static/images/404.png';
                    if(module == 'info'){
                        img404 = '/static/images/default_info.png';
                    }

					for (var i = 0; i < list.length; i++) {
						var imgsrc = (module=="tieba")?list[i].imgGroup[0]:list[i].litpic;
						var thml = '';
						var time = 0;
						var price = 0;
						if(module == 'live'){
							time = list[i].ftime;
						}else{
							time = huoniao.transTimes(list[i].pubdate,2);
						}
						
						if(module == "huodong"){
							price = list[i].feetype=="1"?(echoCurrency('symbol')+"<em>"+ list[i].mprice+"</em>"+langData['siteConfig'][19][836]):langData['siteConfig'][19][427];  //免费
						}else if(module == "car"){
							price = '<em>'+ list[i].price*1+'</em>'+langData['siteConfig'][13][27]+langData['siteConfig'][19][836];  //万起
						}else if(module == "house"){
							
							switch (list[i].moduletype) {
								case 'zu':
									text = langData['siteConfig'][19][219];  //租房
									price = list[i].price > 0 ? (list[i].price+echoCurrency('short')+'/'+langData['siteConfig'][40][45]) : langData['siteConfig'][51][16];
									break;
								case 'sale':
									text = langData['siteConfig'][19][218];  //二手房
									price = list[i].price > 0 ? (list[i].price + langData['siteConfig'][13][27] + echoCurrency('short')) : langData['siteConfig'][51][16];
									break;
								case 'xzl':

									if(list[i].type == 0)
									{
										var price = list[i].price>0 ? parseInt(list[i].price * list[i].area).toFixed(0) + echoCurrency('short')+'/'+langData['siteConfig'][40][45] : langData['siteConfig'][46][70];  //面议
										
									}else{

										var price = list[i].price>0 ? list[i].price + '万' : langData['siteConfig'][46][70];  //面议
										
									}
									text = langData['siteConfig'][19][220];  //写字楼
									break;
								case 'sp':
									if(list[i].price != 0){
										var ptype = echoCurrency('short')+'/'+langData['siteConfig'][40][45];
										if(list[i].type == 1){
											ptype = langData['siteConfig'][13][27]; //"万";
										}
										price = list[i].price+ptype;
									}else{
										price = langData['siteConfig'][51][16];  //价格面议
									}
									text = langData['siteConfig'][19][221];  //商铺
									break;
								case 'cf':

									var price = '';
									if(list[i].price > 0) {
	                                    if (list[i].type == 0) {
	                                        price = list[i].price + ''+echoCurrency('short')+'/'+langData['siteConfig'][40][45];
	                                    } else if (list[i].type == 1) {
	                                        price = list[i].price + ''+echoCurrency('short')+'/'+langData['siteConfig'][40][45];
	                                    } else if (list[i].type == 2) {
	                                        price = list[i].price + langData['siteConfig'][13][27];
	                                    }
	                                }else{
									    price = langData['siteConfig'][51][16];
	                                }
									text = langData['siteConfig'][19][761];  //厂房
									break;
								case 'cw':
									if(list[i].price > 0) {
	                                    if (list[i].type == 0) {
	                                        price = list[i].price + ''+echoCurrency('short')+'/'+langData['siteConfig'][40][45];
	                                    } else if (list[i].type == 2) {
	                                        price = list[i].price + ''+echoCurrency('short')+'/'+langData['siteConfig'][40][45];
	                                    } else if (list[i].type == 1) {
	                                        price = list[i].price + langData['siteConfig'][13][27];  //万
	                                    }
	                                }else{
									    price = langData['siteConfig'][51][16];
	                                }
									text = langData['siteConfig'][31][7];  //车位
									break;
								default:
									text = '';
									break;
							}
						}else{
							if (list[i].price != 0) {
								price = echoCurrency('symbol')+'<em>'+ list[i].price+'</em>'+ langData['siteConfig'][19][836];  //起
							}else{
								price='';
							}

						}
						
						// 是否置顶
						if(list[i].istop){
							istop == '<i class="top"></i>';
						}
						
						
						if(cls1=="price"){
							thml = '<span>'+price+'</span>'
						}else{
							thml = '<span>'+ time +'</span><span class="read '+(list[i].click?"":"fn-hide")+'"><em></em>'+list[i].click+'</span>'
						}
						html.push('<li class="fabu_li">');
						html.push('<a href="'+list[i].url+'">');
						html.push('<div class="fabu_img '+cls+'"><img src="'+imgsrc+'" onerror="this.src=\''+img404+'\'">'+istop+'<em>'+text+'</em></div>');
						html.push('<div class="fabu_info">');
						html.push('<h2 class="fabu_title"> '+list[i].title+' </h2>');
						html.push('<p class="fn-clear '+cls1+'">'+thml+'</p>');
						html.push('</div></a></li>');
					}
					
					$(".fabu_list ul").eq(id).html(html.join(''))
					
				}else{
					 $(".fabu_list ul").eq(id).html('<div class="loading" style="width: 100%; text-align: center; font-size: 18px; color: #666; height: 100px; line-height: 100px">'+data.info+'</div>')
				}
			}
		});
		
		
	}
})