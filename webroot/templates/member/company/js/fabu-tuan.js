$.fn.extend({textareaAutoHeight:function(a){this._options={minHeight:0,maxHeight:1e3},this.init=function(){for(var b in a)this._options[b]=a[b];0==this._options.minHeight&&(this._options.minHeight=parseFloat($(this).height()));for(var b in this._options)null==$(this).attr(b)&&$(this).attr(b,this._options[b]);$(this).keyup(this.resetHeight).change(this.resetHeight).focus(this.resetHeight)},this.resetHeight=function(){var a=parseFloat($(this).attr("minHeight")),b=parseFloat($(this).attr("maxHeight"));$.browser.msie||$(this).height(0);var c=parseFloat(this.scrollHeight);c=a>c?a:c>b?b:c,$(this).height(c).scrollTop(c),c>=b?$(this).css("overflow-y","scroll"):$(this).css("overflow-y","hidden")},this.init()}});

$(function(){

	var isClick = 0; //是否点击跳转至锚点，如果是则不监听滚动
	//左侧导航点击
	$("#left-nav a").bind("click", function(){
		isClick = 1; //关闭滚动监听
		var t = $(this), parent = t.parent(), index = parent.index(), theadTop = $("#fabuForm .thead:eq("+index+")").position().top + 30;
		$("#left-nav li").removeClass("current");
		if(index == 0){
			theadTop -= 20;
		}
		parent.addClass("current");
		$('.main').animate({
         	scrollTop: theadTop - parent.position().top
     	}, 300, function(){
     		isClick = 0; //开启滚动监听
     	});
	});

	//滚动监听
	$(".main").scroll(function(){
		if(isClick) return false;  //判断是否点击中转中...
		var scroH = $(this).scrollTop();
		var theadLength = $("#fabuForm .thead").length;
		$("#left-nav li").removeClass("current");

		$("#fabuForm .thead").each(function(index, element){
			var offsetTop = $(this).position().top;
			if(index != theadLength-1){
				var offsetNavTop = $("#left-nav li:eq("+(index+1)+")").position().top;
				var offsetNextTop = $("#fabuForm .thead:eq("+(index+1)+")").position().top;
				if(scroH >= offsetTop-offsetNavTop && scroH < offsetNextTop-offsetNavTop){
					$("#left-nav li:eq("+index+")").addClass("current");
					return false;
				}
			}else{
				$("#left-nav li:last").addClass("current");
				return false;
			}
		});
	});

	getEditor("body");

	//时间
	var selectDate = function(el, func){
		WdatePicker({
			el: el,
			doubleCalendar: true,
			dateFmt: 'yyyy-MM-dd HH:mm:ss',
			onpicked: function(dp){
				typeof func === 'function' ? func(dp) : "";
			}
		});
	}
	$("#startdate").focus(function(){
		selectDate("startdate", function(dp){
			var sdate = dp.cal.getNewDateStr();
			var snDate = huoniao.transToTimes(sdate);

			var edate = $("#enddate");
			if(edate.val() != ""){
				var enDate = huoniao.transToTimes(edate.val());
				if(enDate < snDate){
					edate.val("");
					$("#startdate").closest("dd").find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][27][95]);
				}else{
					$("#startdate").closest("dd").find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
				}
			}
		});
	});
	$("#enddate").focus(function(){
		selectDate("enddate", function(dp){
			var edate = dp.cal.getNewDateStr();
			var enDate = huoniao.transToTimes(edate);

			var sdate = $("#startdate");
			if(sdate.val() != ""){
				var snDate = huoniao.transToTimes(sdate.val());
				if(enDate < snDate){
					$("#enddate").closest("dd").find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][27][96]);
				}else{
					$("#startdate").closest("dd").find(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
				}
			}
		});
	});
	$("#expireddate").focus(function(){
		selectDate("expireddate");
	});
	$("#limit_start").focus(function (){
		selectDate("limit_start");
	})
	$("#limit_end").focus(function (){
		selectDate("limit_end");
	})

	//团购类型切换
	$(".tuantype span").bind("click", function(){
		var id = $(this).data("id");
		$(".tuantype-item").hide();
		$("#tuantype"+id).show();
	});


	//新增购买须知
	var noticeHtml = '<div class="notice-item fn-hide"><div class="label"><input type="text" placeholder="'+langData['siteConfig'][19][0]+'" /></div><div class="dd"><textarea placeholder="'+langData['siteConfig'][19][1]+'"></textarea></div><span class="btn move" title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="btn del" title="'+langData['siteConfig'][6][8]+'"><i></i></span><span class="btn add" title="'+langData['siteConfig'][6][18]+'"><i></i></span></div>';
	$(".addnotice").bind("click", function(){
		var newnotice = $(noticeHtml);
		newnotice.appendTo("#notice");
		newnotice.slideDown(300);
	});
	$("#notice").delegate(".add", "click", function(){
		var t = $(this).closest(".notice-item");
		var newnotice = $(noticeHtml);
		newnotice.insertAfter(t);
		newnotice.slideDown(300);
	});

	//删除购买须知
	$("#notice").delegate(".del", "click", function(){
		var t = $(this).closest(".notice-item"), val1 = t.find("input").val(), val2 = t.find("textarea").val();
		if(val1 == "" && val2 == ""){
			t.slideUp(300, function(){
				t.remove();
			});
		}else{
			$.dialog.confirm(langData['siteConfig'][27][97], function(){
				t.slideUp(300, function(){
					t.remove();
				});
			});
		}
	});

	$("#notice textarea").textareaAutoHeight({minHeight:52, maxHeight:100});
	$("#notice").dragsort({ dragSelector: ".move", placeHolderTemplate: '<div class="notice-item"></div>' });

	//套餐类型
	var packtypeVal = $("input[name=packtype]:checked").val(),
			taocon = $(".taocon").html(),
			m = 0,
			manyHtml = function(){
				return '<table class="tab tab'+m+'"><tr><td class="mtit"><input type="text" value="'+langData['siteConfig'][19][1]+'" /></td><td class="items"><table><thead><tr><th width="38%"align="left"><a href="javascript:;" class="btn remove" title="'+langData['siteConfig'][6][8]+'"><i></i></a>'+langData['siteConfig'][19][547]+'</th><th width="15%">'+langData['siteConfig'][19][315]+'</th><th width="15%">'+langData['siteConfig'][19][548]+'</th><th width="15%">'+langData['siteConfig'][19][549]+'</th><th width="17%"style="text-align:center;">'+langData['siteConfig'][6][11]+'</th></tr></thead><tbody><tr><td><input type="text"class="tit"/></td><td><input type="text"class="pric"/></td><td><input type="text"class="coun"/></td><td><input type="text"class="tot"/></td><td><span class="btn move"title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="btn del"title="'+langData['siteConfig'][6][8]+'"><i></i></span><span title="'+langData['siteConfig'][6][18]+'"class="btn add"><i></i></span></td></tr><tr><td><input type="text"class="tit"/></td><td><input type="text"class="pric"/></td><td><input type="text"class="coun"/></td><td><input type="text"class="tot"/></td><td><span class="btn move"title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="btn del"title="'+langData['siteConfig'][6][8]+'"><i></i></span><span title="'+langData['siteConfig'][6][18]+'"class="btn add"><i></i></span></td></tr><tr><td><input type="text"class="tit"/></td><td><input type="text"class="pric"/></td><td><input type="text"class="coun"/></td><td><input type="text"class="tot"/></td><td><span class="btn move"title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="btn del"title="'+langData['siteConfig'][6][8]+'"><i></i></span><span title="'+langData['siteConfig'][6][18]+'"class="btn add"><i></i></span></td></tr></tbody></table></td></tr></table>';
			};

	$(".packtype span").bind('click', function(){
		var val = $(this).data("id");

		if(packtypeVal == val){
			$(".taocon").html(taocon);

		}else	if(val == 1){
			var singelHtml = '<div class="singel"><table><thead><tr><th width="50%"align="left">'+langData['siteConfig'][19][1]+'</th><th width="15%">'+langData['siteConfig'][19][315]+'</th><th width="18%">'+langData['siteConfig'][19][548]+'</th><th width="17%">'+langData['siteConfig'][19][549]+'</th></tr></thead><tbody><tr><td><input type="text" class="s1" /></td><td><input type="text" class="s2" /></td><td><input type="text" class="s3" /></td><td><input type="text" class="s4" /></td></tr></tbody></table></div>';
			$(".taocon").html(singelHtml);
		}else if(val == 2){

			$(".taocon").html('<div class="many">'+manyHtml()+'<a href="javascript:;" class="newbtn addtaocan">'+langData['siteConfig'][19][550]+'</a></div>');//新增套餐内容
			$(".many .tab"+m+" .items tbody").dragsort({ dragSelector: ".move", placeHolderTemplate: '<tr class="holder"><td colspan="5"></td></tr>' });

		}
	});

	$(".many .tab .items tbody").dragsort({ dragSelector: ".move", placeHolderTemplate: '<tr class="holder"><td colspan="5"></td></tr>' });

	//删除套餐列
	$(".taocon").delegate(".del", "click", function(){
		var t = $(this);

		if(t.closest("tbody").find("tr").length <= 1){
			t.closest(".tab").remove();
		}else{
			t.closest("tr").remove();
		}
	});

	//新增套餐列
	$(".taocon").delegate(".add", "click", function(){
		var t = $(this);
		t.closest("tr").after('<tr><td><input type="text" class="tit"></td><td><input type="text" class="pric"></td><td><input type="text" class="coun"></td><td><input type="text" class="tot"></td><td><span class="btn move" title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="btn del" title="'+langData['siteConfig'][6][8]+'"><i></i></span><span title="'+langData['siteConfig'][6][18]+'" class="btn add"><i></i></span></td></tr>');
	});

	//删除套餐内容
	$(".taocon").delegate(".remove", "click", function(){
		$(this).closest(".tab").remove();
	});

	//新增套餐内容
	$(".taocon").delegate(".addtaocan", "click", function(){
		m++;
		$(this).before(manyHtml());
		$(".many .tab"+m+" .items tbody").dragsort({ dragSelector: ".move", placeHolderTemplate: '<tr class="holder"><td colspan="5"></td></tr>' });
	});


	//表单验证
	var regex = {

		regexp: function(t, reg, err){
			var val = $.trim(t.val()), dl = t.closest("dl"), name = t.attr("name"),
					tip = t.data("title"), etip = tip, hline = dl.find(".tip-inline"), check = true;

			if(val != ""){
				var exp = new RegExp("^" + reg + "$", "img");
				if(!exp.test(val)){
					etip = err;
					check = false;
				}
			}else{
				check = false;
			}

			if(dl.attr("data-required") == 1){
				if(val == "" || !check){
					hline.removeClass().addClass("tip-inline error").html("<s></s>"+etip);
				}else{
					hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
				}
				return check;
			}
		}

		//副标题
		,subtitle: function(){
			return this.regexp($("#subtitle"), ".{5,100}", langData['siteConfig'][20][437]);
		}

		//库存
		,maxnum: function(){
			return this.regexp($("#maxnum"), "[1-9]\\d*", langData['siteConfig'][27][98]);
		}

		//购买限制
		,limit: function(){
			return this.regexp($("#limit"), "[1-9]\\d*", langData['siteConfig'][27][98]);
		}

		//市场价
		,market: function(){
			return this.regexp($("#market"), "(?!0+(?:.0+)?$)(?:[1-9]\\d*|0)(?:.\\d{1,2})?", langData['siteConfig'][27][91]);
		}

		//团购价
		,price: function(){
			return this.regexp($("#price_"), "(?!0+(?:.0+)?$)(?:[1-9]\\d*|0)(?:.\\d{1,2})?", langData['siteConfig'][27][91]);
		}


	}

	$(".w-form").delegate("#subtitle", "blur", function(){
		regex.subtitle();
	});
	$(".w-form").delegate("#maxnum", "blur", function(){
		regex.maxnum();
	});
	$(".w-form").delegate("#limit", "blur", function(){
		regex.limit();
	});
	$(".w-form").delegate("#market", "blur", function(){
		regex.market();
	});
	$(".w-form").delegate("#price_", "blur", function(){
		regex.price();
	});

	$(".w-form").delegate("input[type='radio'], input[type='checkbox']", "click", function(){
		if($(this).attr("data-required") == "true"){
			var name = $(this).attr("name"), val = $("input[name='"+name+"']:checked").val();
			if(val == undefined){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	//选择过期类型函数
	function expire_type_change(start){
		var expire_type = $(this).data("val");
		if(start == 1){
			expire_type = $("#expire_type").val();
		}
		$(".expire_type_item").hide();
		$("#expire_type_"+expire_type).show();
	}
	//加载
	expire_type_change(1);
	//点击切换选择过期类型
	$("span[name='expire_type']").bind('click',expire_type_change);

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t           = $(this),
				title       = $("#title"),
				litpic      = $("#litpic").val(),
				startdate   = $("#startdate").val(),
				enddate     = $("#enddate").val(),
				tuantype    = $("#tuantype").val(),
				expireddate = $("#expireddate").val(),
				expire_type  = $("span[name='expire_type'].curr").data("val"),
				expire_limit = $("#expire_limit").val(),
				freight     = $("#freight").val(),
				freeshi     = $("#freeshi").val();

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;
		//验证标题
		var exp = new RegExp("^" + titleRegex + "$", "img");
		if(!exp.test(title.val())){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+titleErrTip);
			offsetTop = title.position().top;
		}

		if(!regex.subtitle() && offsetTop <= 0){
			offsetTop = $("#subtitle").position().top;
		}

		if(litpic == "" && offsetTop <= 0){
			$.dialog.alert(langData['siteConfig'][27][99]);
			offsetTop = $("#listSection1").position().top;
		}

		//图集
		var imgli = $("#listSection2 li");
		if(imgli.length <= 0 && offsetTop <= 0){
			$.dialog.alert(langData['siteConfig'][20][436]);
			offsetTop = $(".list-holder").position().top;
		}

		//时间
		if((startdate == "" || enddate == "") && offsetTop <= 0){
			offsetTop = $("#startdate").position().top;
			$("#startdate").closest("dd").find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][438]);
		}else if(offsetTop <= 0){
			var nsdate = huoniao.transToTimes(startdate);
			var nedate = huoniao.transToTimes(enddate);
			if(nedate < nsdate){
				offsetTop = $("#startdate").position().top;
				$("#startdate").closest("dd").find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][27][100]);
			}
		}

		if(!regex.maxnum() && offsetTop <= 0){
			offsetTop = $("#maxnum").position().top;
		}

		if(!regex.market() && offsetTop <= 0){
			offsetTop = $("#market").position().top;
		}

		if(!regex.price() && offsetTop <= 0){
			offsetTop = $("#price_").position().top;
		}
		if(tuantype == 0){
			//限定过期类型
			if(expire_type === 'limit') {
				if (!expire_limit) {
					expire_limit = 0;
				}
				if (isNaN(expire_limit) || expire_limit <= 0) {
					$.dialog.alert("过期天数必须为正整数！");
					offsetTop = $("#expire_limit").position().top;
				}
			}
		}
		if(tuantype == 2 && doact == ""){
			if(freight == "" && offsetTop <= 0){
				$.dialog.alert(langData['siteConfig'][27][101]);
				offsetTop = $("#freight").position().top;
			}

			if(freeshi == "" && offsetTop <= 0){
				$.dialog.alert(langData['siteConfig'][27][102]);
				offsetTop = $("#freeshi").position().top;
			}
		}

		//自定义字段验证
		if(offsetTop <= 0){
			$("#itemList").find("dl").each(function(){
				var t = $(this), type = t.data("type"), required = t.data("required"), tipTit = t.data("title"), tip = t.find(".tip-inline"), input = t.find("input").val();

				if(required == 1){
					//单选
					if(type == "radio" && offsetTop <= 0){
						if(input == ""){
							tip.removeClass().addClass("tip-inline error").html("<s></s>"+tipTit);
							offsetTop = t.position().top;
						}
					}

					//多选
					if(type == "checkbox" && offsetTop <= 0){
						if(t.find("input:checked").val() == "" || t.find("input:checked").val() == undefined){
							tip.removeClass().addClass("tip-inline error").html("<s></s>"+tipTit);
							offsetTop = t.position().top;
						}
					}

					//下拉菜单
					if(type == "select" && offsetTop <= 0){
						if(input == ""){
							tip.removeClass().addClass("tip-inline error").html("<s></s>"+tipTit);
							offsetTop = t.position().top;
						}
					}
				}

			});
		}

		var video = "";
	    if($("#fileList2 li").length){
	      video = $("#fileList2 li").eq(0).children("video").attr("data-val");
	    }
        $("#video").val(video);

    //购买须知
    var notice = [], noticeItem = $("#notice .notice-item");
    if(noticeItem.length > 0){
    	for(var i = 0; i < noticeItem.length; i++){
    		var obj = $("#notice .notice-item:eq("+i+")");
    		var tit = obj.find("input").val();
    		var con = obj.find("textarea").val();
    		notice.push(tit+"$$$"+con);
    	}
    }
    //套餐内容
    var packtype = $("#packtype").val(), packages = [];
    if(packtype == 1){
    	var obj = $(".singel"), s1 = obj.find(".s1").val(), s2 = obj.find(".s2").val(), s3 = obj.find(".s3").val(), s4 = obj.find(".s4").val();
    	packages.push(s1+"$$$"+s2+"$$$"+s3+"$$$"+s4);
    }else if(packtype == 2){
    	var obj = $(".many");
    	obj.find("table").each(function(i){
    		var manyItem = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), coun = t.find(".coun").val(), tot = t.find(".tot").val();
    			if(tit != undefined && pric != undefined && coun != undefined && tot != undefined){
	    			manyItem.push(tit+"$$$"+pric+"$$$"+coun+"$$$"+tot);
	    		}
    		});
    		if(mtit != undefined){
	    		packages.push(mtit+"@@@"+manyItem.join("~~~"));
	    	}
    	});
    }
    if(!packages && offsetTop <= 0){
    	$.dialog.alert(langData['siteConfig'][27][103]);
			offsetTop = $(".taocon").position().top;
    }

		ue.sync();

		if(!ue.hasContents() && offsetTop <= 0){
			$.dialog.alert(langData['siteConfig'][27][104]);
			offsetTop = $("#body").position().top;
		}
		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize() + "&notice="+notice.join("|||") + "&package="+packages.join("|||") + "&expire_type="+expire_type;

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					var tip = langData['siteConfig'][20][341];
					if(id != undefined && id != "" && id != 0){
						tip = langData['siteConfig'][20][229];
					}

					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: tip,
						ok: function(){
							location.href = url;
						}
					});

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][11][19]);
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][11][19]);
				$("#verifycode").click();
			}
		});


	});
});
