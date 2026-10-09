$.fn.extend({textareaAutoHeight:function(a){this._options={minHeight:0,maxHeight:1e3},this.init=function(){for(var b in a)this._options[b]=a[b];0==this._options.minHeight&&(this._options.minHeight=parseFloat($(this).height()));for(var b in this._options)null==$(this).attr(b)&&$(this).attr(b,this._options[b]);$(this).keyup(this.resetHeight).change(this.resetHeight).focus(this.resetHeight)},this.resetHeight=function(){var a=parseFloat($(this).attr("minHeight")),b=parseFloat($(this).attr("maxHeight"));$.browser.msie||$(this).height(0);var c=parseFloat(this.scrollHeight);c=a>c?a:c>b?b:c,$(this).height(c).scrollTop(c),c>=b?$(this).css("overflow-y","scroll"):$(this).css("overflow-y","hidden")},this.init()}});

$(function(){

	var isClick = 0; //是否点击跳转至锚点，如果是则不监听滚动
	

	//选择分类
	$("#seltypeid").delegate("a", "click", function(){
		if($(this).text() != langData['siteConfig'][7][2] && $(this).attr("data-id") != $("#typeid").val()){
			var id = $(this).attr("data-id");
			$(this).closest(".sel-group").nextAll(".sel-group").remove();
			getChildType(id);
		}
	});

	//获取子级分类
	function getChildType(id){
		if(!id) return;
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=homemaking&action=type&type="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info, html = [];

					html.push('<div class="sel-group">');
					html.push('<button type="button" class="sel">'+langData['siteConfig'][7][2]+'<span class="caret"></span></button>');
					html.push('<ul class="sel-menu">');
					for(var i = 0; i < list.length; i++){
						html.push('<li><a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a></li>');
					}
					html.push('</ul>');
					html.push('</div>');

					$("#typeid").before(html.join(""));
					$("#seltypeid").closest("dd").find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][27][28]);

				}
			}
		});
	}

	getEditor("note");

	//团购类型切换
	$(".homemakingtype span").bind("click", function(){
		var id = $(this).data("id");console.log(id);
		//$(".tuantype-item").hide();
		if(id==0){
			$("#priceH").hide();
		}else{
			$("#priceH").show();
		}
		
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


	//提交发布
	$("#submit").bind("click", function(event){
		$('#addrid').val($('#selAddr .addrBtn').attr('data-id'));
		var addrids = $('#selAddr .addrBtn').attr('data-ids').split(' ');
		$('#cityid').val(addrids[0]);
		event.preventDefault();

		var t           = $(this),
				title       = $("#title"),
				typeid      = $("#typeid"),
				enddate     = $("#enddate").val(),
				tuantype    = $("#tuantype").val(),
				expireddate = $("#expireddate").val(),
				freight     = $("#freight").val(),
				freeshi     = $("#freeshi").val();

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//验证标题
		
		if(typeid.val() == '' || typeid.val() == 0){
			$.dialog.alert(langData['homemaking'][0][14]);
			offsetTop = typeid.position().top;
		}

		//验证标题
		var exp = new RegExp("^" + titleRegex + "$", "img");
		if(!exp.test(title.val())){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+titleErrTip);
			offsetTop = title.position().top;
		}

		$(".homemakingtype span").each(function(){
			var id = $(this).data("id");
			if(id!=0){
				if($("#price_").val()=='' || $("#price_").val()==0){
					offsetTop = $("#price_").position().top;
				}

				if(!regex.price() && offsetTop <= 0){
					offsetTop = $("#price_").position().top;
				}
			}
		});

		//图集
		var imgli = $("#listSection2 li");
		if(imgli.length <= 0 && offsetTop <= 0){
			$.dialog.alert(langData['siteConfig'][20][436]);
			offsetTop = $(".list-holder").position().top;
		}

		ue.sync();

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize();

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
						content: tip + "，"+langData['siteConfig'][20][404],
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
