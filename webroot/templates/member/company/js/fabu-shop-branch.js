$(function(){

	//getEditor("body");

	//选择分类
	$("#selIndustry").delegate("a", "click", function(){
		if($(this).text() != langData['siteConfig'][7][2] && $(this).attr("data-id") != $("#industry").val()){
			var id = $(this).attr("data-id");
			$(this).closest(".sel-group").nextAll(".sel-group").remove();
		}
	});

	//选择区域
	$("#selAddr .sel-group:eq(0) a").bind("click", function(){
		if($(this).attr("data-id") != $("#addrid").val()){
			var id = $(this).attr("data-id");
			$(this).closest(".sel-group").nextAll(".sel-group").remove();
			getChildAddr(id);
		}
	});

	if($("#addrid").val() != ""){
		var cid = 0;
		$("#selAddr .sel-menu li").each(function(){
			if($(this).text() == $("#addrname0").val()){
				cid = $(this).find("a").attr('data-id');
			}
		});
		if(cid != 0){
			getChildAddr(cid, $("#addrname1").val());
		}
	}

	//获取子级区域
	function getChildAddr(id, selected){
		if(!id) return;
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=shop&action=addr&type="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info, html = [];

					html.push('<div class="sel-group">');
					html.push('<button type="button" class="sel">'+(selected ? selected : langData['siteConfig'][7][2])+'<span class="caret"></span></button>');
					html.push('<ul class="sel-menu">');
					for(var i = 0; i < list.length; i++){
						html.push('<li><a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a></li>');
					}
					html.push('</ul>');
					html.push('</div>');

					$("#addrid").before(html.join(""));
					if(!selected){
						$("#addrid").val(0);
						$("#addrid").closest("dd").find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][68]);
					}

				}
			}
		});
	}

	//地图标注
	var init = {
		popshow: function() {
			var src = "/api/map/mark.php?mod=shop",
					address = $("#address").val(),
					lnglat = $("#lnglat").val();
			if(address != ""){
				src = src + "&address="+address;
			}
			if(lnglat != ""){
				src = src + "&lnglat="+lnglat;
			}
			$("#markPopMap").after($('<div id="shadowlayer" style="display:block"></div>'));
			$("#markDitu").attr("src", src);
			$("#markPopMap").show();
		},
		pophide: function() {
			$("#shadowlayer").remove();
			$("#markDitu").attr("src", "");
			$("#markPopMap").hide();
		}
	};

	$(".map-pop .pop-close, #cloPop").bind("click", function(){
		init.pophide();
	});

	$("#mark").bind("click", function(){
		init.popshow();
	});

	$("#okPop").bind("click", function(){
		var doc = $(window.parent.frames["markDitu"].document),
				lng = doc.find("#lng").val(),
				lat = doc.find("#lat").val(),
				address = doc.find("#addr").val();
		$("#lnglat").val(lng+","+lat);
		if($("#address").val() == ""){
			$("#address").val(address).blur();
		}
		init.pophide();
	});

	// 2021-12-23 新增会员账号
	//判断此会员是否已经是分店
  	$('#account').blur(function(){
	    var tval = $(this).val();
	    if(tval !=''){
	      	$.ajax({
		        url: '/include/ajax.php?service=shop&action=storeBranchConfig&account='+tval,
		        type: "POST",
		        dataType: "json",
		        success: function (data) {
		          if(data && data.state == 100){//已存在
		            $('#account').siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>该会员已是分店，请重新填写");
		            $('.phbox').addClass('disabled');
		          }else{
		            $('.phbox').removeClass('disabled');
		          }
		        },
		        error: function(){
		        }
		    });
	    }
  	})


	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();
		$('#addrid').val($('#selAddr .addrBtn').attr('data-id'));
        var addrids = $('#selAddr .addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
		var t           = $(this),
				industry    = $("#industry"),
				addrid      = $("#addrid"),
				company     = $("#company"),
				title       = $("#title"),
				referred    = $("#referred"),
				address     = $("#address"),
				litpic      = $("#litpic"),
				people      = $("#people"),
				contact     = $("#contact"),
				account     = $("#account"),
				tel         = $("#telphone");

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//行业
		if($.trim(industry.val()) == "" || industry.val() == 0){
			industry.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['shop'][4][41]);
			offsetTop = offsetTop == 0 ? $("#selIndustry").position().top : offsetTop;
		}

		//区域
		if($.trim(addrid.val()) == "" || addrid.val() == 0){
			addrid.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][68]);
			offsetTop = offsetTop == 0 ? $("#selAddr").position().top : offsetTop;
		}

		//店铺名称
		if($.trim(title.val()) == "" || title.val() == 0){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][21][128]);
			offsetTop = offsetTop == 0 ? title.position().top : offsetTop;
		}

		//地址
		if($.trim(address.val()) == "" || address.val() == 0){
			address.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][69]);
			offsetTop = offsetTop == 0 ? address.position().top : offsetTop;
		}

		//logo
		if($.trim(litpic.val()) == "" && offsetTop == 0){
			$.dialog.alert(langData['shop'][4][45]);
			offsetTop = offsetTop == 0 ? $("#license").position().top : offsetTop;
		}
		//会员账号
		if($.trim(account.val()) == "" || account.val() == 0){
			account.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请输入会员账号");
			offsetTop = offsetTop == 0 ? account.position().top : offsetTop;
		}
		if($('.phbox').hasClass('disabled')){
	      	account.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>该会员已是分店，请重新填写");
			offsetTop = offsetTop == 0 ? account.position().top : offsetTop;
	    }

		//联系人
		if($.trim(people.val()) == "" || people.val() == 0){
			people.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['shop'][4][46]);
			offsetTop = offsetTop == 0 ? people.position().top : offsetTop;
		}

		//客服电话
		if($.trim(tel.val()) == "" || tel.val() == 0){
			tel.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['shop'][4][47]);
			offsetTop = offsetTop == 0 ? tel.position().top : offsetTop;
		}

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: form.serialize(),
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

					/* $.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: data.info,
						ok: function(){}
					}); */
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][63]);
				$("#verifycode").click();
			}
		});


	});
});
