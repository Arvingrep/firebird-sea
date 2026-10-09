$(function(){

	getEditor("note");

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
			url: masterDomain+"/include/ajax.php?service=waimai&action=addr&type="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info, html = [];

					html.push('<div class="sel-group">');
					html.push('<button class="sel">'+(selected ? selected : langData['siteConfig'][7][2])+'<span class="caret"></span></button>');
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
			var src = "/api/map/mark.php?mod=waimai",
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



	//选择配送区域
	$(".chooseRange").bind("click", function(){
		var lnglat = $("#lnglat").val();
		if($.trim(lnglat) == ""){
			$.dialog.alert(langData['siteConfig'][27][89]);
			return false;
		}else{
			$.dialog({
				id: "rangeDitu",
				title: langData['siteConfig'][26][158],
				content: 'url:/api/map/shape.php?mod=waimai&lnglat='+lnglat+"&range="+encodeURIComponent($("#range").val()),
				width: 800,
				height: 500,
				max: true,
				ok: function(){
					var doc = $(window.parent.frames["rangeDitu"].document),
						overlays = doc.find("#overlays").val();
					$("#range").val(overlays);

					$("#shapeMap").attr("src", "/api/map/shape.php?type=1&mod=waimai&lnglat="+lnglat+"&range="+encodeURIComponent(overlays)).show();
				},
				cancel: true
			});
		}
	});



	//时间
	var selectDate = function(el, func){
		WdatePicker({
			el: el,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			qsEnabled: false,
			dateFmt: 'HH:mm'
		});
	}
	$("#start1").focus(function(){
		selectDate("start1");
	});
	$("#end1").focus(function(){
		selectDate("end1");
	});
	$("#start2").focus(function(){
		selectDate("start2");
	});
	$("#end2").focus(function(){
		selectDate("end2");
	});


	//开启满减
	var temp = '<div class="input-append input-prepend fn-clear"><span class="add-bef">'+langData['siteConfig'][21][14]+'</span><input type="text" class="inp j1" name="m1[]" size="5" maxlength="5"><span class="add-aft">'+langData['siteConfig'][2][93]+'</span><input type="text" class="inp j2" name="m2[]" size="5" maxlength="5"><span class="add-aft"><a href="javascript:;" class="del">'+langData['siteConfig'][26][45]+'</a></span></div>';
	$("#online").bind("click", function(){
		if($(this).is(":checked")){

			//如果为空，新建一个
			if($("#onlineObj").find(".input-append").length == 0){
				$(temp).insertBefore($("#addNewOnlinePrice"));
			}

			$("#onlineObj").show();
		}else{
			$("#onlineObj").hide();
		}
	});

	//满减
	$("#onlineObj").delegate(".del", "click", function(){
		$(this).closest(".input-append").remove();
	});

	//新增满减
	$("#addNewOnlinePrice").bind("click", function(){
		$(temp).insertBefore($(this));
	});

	//开启发票
	$("#supfapiao").bind("click", function(){
		if($(this).is(":checked")){
			$("#fapiaoObj").show();
		}else{
			$("#fapiaoObj").hide();
		}
	});

	//发票备注
	$(".sel-fapiao span").bind("click", function(){
		var txt = $(this).text();
		$("#fapiaonote").val($("#fapiaonote").val() + ($("#fapiaonote").val() == "" ? "" : " ") + txt);
	});


	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();
		$('#addrid').val($('#selAddr .addrBtn').attr('data-id'));
		var t = $(this),
			title   = $("#title"),
			addrid  = $("#addrid"),
			address = $("#address"),
			lnglat  = $("#lnglat"),
			tel     = $("#contact"),
			imgVal	= $('');

		$('.thumblist img')

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//标题
		if($.trim(title.val()) == "" || title.val() == 0){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][27][31]);
			offsetTop = offsetTop == 0 ? title.position().top : offsetTop;
		}

		//验证类别
		if($("#typeObj input:checked").length == 0){
			var dl = $("#typeObj").parent();
			dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][27][32]);
			offsetTop = offsetTop == 0 ? dl.position().top : offsetTop;
		}

		//区域
		if($.trim(addrid.val()) == "" || addrid.val() == 0){
			addrid.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][68]);
			offsetTop = offsetTop == 0 ? $("#selAddr").position().top : offsetTop;
		}

		//地址
		if($.trim(address.val()) == "" || address.val() == 0){
			address.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][69]);
			offsetTop = offsetTop == 0 ? address.position().top : offsetTop;
		}

		//电话
		if($.trim(tel.val()) == "" || tel.val() == 0){
			tel.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][433]);
			offsetTop = offsetTop == 0 ? tel.position().top : offsetTop;
		}

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		ue.sync();

		var form = $("#fabuForm"), action = form.attr("action");
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: form.serialize(),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: data.info,
						ok: function(){}
					});
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

	var yingyezhizhao = $("#yingyezhizhao").data("url");
	if(yingyezhizhao != ""){
		$("#yingyezhizhao").siblings("iframe").hide();
		var media = '<img src="'+yingyezhizhao+'" />';
		$("#yingyezhizhao").siblings(".spic").find(".sholder").html(media);
		$("#yingyezhizhao").siblings(".spic").find(".reupload").attr("style", "display:inline-block;");
		$("#yingyezhizhao").siblings(".spic").show();
	}
	var weishengxuke = $("#weishengxuke").data("url");
	if(weishengxuke != ""){
		$("#weishengxuke").siblings("iframe").hide();
		var media = '<img src="'+weishengxuke+'" />';
		$("#weishengxuke").siblings(".spic").find(".sholder").html(media);
		$("#weishengxuke").siblings(".spic").find(".reupload").attr("style", "display:inline-block;");
		$("#weishengxuke").siblings(".spic").show();
	}


	//重新上传时删除已上传的文件
	function delFile(b, d, c) {
		var g = {
			mod: modelType,
			type: "delCard",
			picpath: b,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			cache: false,
			async: d,
			url: "/include/upload.inc.php",
			dataType: "json",
			data: $.param(g),
			success: function(a) {
				try {
					c(a)
				} catch(b) {}
			}
		})
	}


    //删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

});


//上传成功接收
function uploadSuccess(obj, file, filetype, url){
	$("#"+obj).val(file);
	var media = '<img src="'+url+'" />';
	$("#"+obj).siblings(".spic").find(".sholder").html(media);
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}
