$(function(){

	// 修改配送信息
	$(".editAddr").bind("click", function(){
		$(".delivery").stop().slideToggle("fast");
		$('html, body').animate({scrollTop: $(".delivery").offset().top}, 300);
	});

	$(".btns .cancel").bind("click", function(){
		$(".editAddr").click();
	});

	//使用其它地址
	$(".radlist li").bind("click", function(){
		var t = $(this);
		t.addClass("selected").siblings("li").removeClass("selected");

		if(t.closest(".radlist").attr("id") == "delivery"){
			t.index() == $("#delivery li").length - 1 ? $(".address-field").show() : $(".address-field").hide();
		}
	});

	//区域
	$("#addrlist").delegate("select", "change", function(){
		var sel = $(this), id = sel.val(), index = sel.index();
		if(id == 0){
			sel.parent().parent().addClass("error");
			sel.nextAll("select").remove();
		} else if(id != 0 && id != ""){
			$.ajax({
				type: "GET",
				url: "/include/ajax.php",
				data: "service=siteConfig&action=addr&son=0&type="+id,
				dataType: "json",
				success: function(data){
					var i = 0, opt = [];
					if(data instanceof Object && data.state == 100){
						for(var key in data.info){
							opt.push('<option value="'+data.info[key]['id']+'">'+data.info[key]['typename']+'</option>');
						}
						sel.nextAll("select").remove();
						$("#addrlist").append('<select name="addrid[]"><option value="0">'+langData['siteConfig'][23][118]+'</option>'+opt.join("")+'</select>');   //请选择区域
						sel.parent().parent().addClass("error");
					}else{
						sel.parent().parent().removeClass("error");
					}
				},
				error: function(msg){
					alert(msg.status+":"+msg.statusText);
				}
			});
		}
	});

	//新地址表单验证
	var inputVerify = {
		addrid: function(){
			if($("#addrlist select:last").val() == 0){
				$("#addrlist").parent().addClass("error");
				return false;
			}
			return true;
		}
		,address: function(){
			var t = $("#address"), val = t.val(), par = t.parent();
			if(val.length < 5 || val.length > 60 || /^\d+$/.test(val)){
				par.addClass("error");
				return false;
			}
			return true;
		}
		,person: function(){
			var t = $("#person"), val = t.val(), par = t.parent();
			if(val.length < 2 || val.length > 15){
				par.addClass("error");
				return false;
			}
			return true;
		}
		,mobile: function(){
			var t = $("#mobile"), val = t.val(), par = t.parent();
			var exp = new RegExp("^(13|14|15|17|18)[0-9]{9}$", "img");
			if(!exp.test(val) && $("#tel").val() == ""){
				// par.addClass("error");
				// par.find(".input-tips").html("<s></s>"+langData['siteConfig'][20][232]).show();  //请输入正确的手机号码
				// return false;
			}else{
				par.find(".input-tips").html("<s></s>"+langData['siteConfig'][20][581]).hide();  //手机号码和固定电话最少填写一项
			}
			return true;
		}
		,tel: function(){
			var t = $("#tel"), val = t.val(), par = t.parent();
			if($("#mobile").val() == "" && val == ""){
				par.addClass("error");
				return false;
			}
			return true;
		}
	}
	$(".address-field input").bind("click", function(){
		$(this).parent().removeClass("error");
		if($(this).attr("id") == "mobile"){
			$("#tel").parent().removeClass("error");
		}
		if($(this).attr("id") == "tel"){
			$("#mobile").parent().removeClass("error");
			$("#mobile").parent().find(".input-tips").hide();
		}
	});

	$(".address-field input").bind("blur", function(){
		var id = $(this).attr("id");

		if((id == "address" && inputVerify.address()) ||
			 (id == "person" && inputVerify.person()) ||
			 (id == "mobile" && inputVerify.mobile()) ||
			 (id == "tel" && inputVerify.tel()) ){

			$(this).parent().removeClass("error");
		}

	});



	//提交修改
	$("#addrBtn").bind("click", function(){

		//验证表单
		if($("#delivery li.selected").index() == $("#delivery li").length-1 && (!inputVerify.addrid() || !inputVerify.address() || !inputVerify.person() || !inputVerify.mobile() || !inputVerify.tel())){
			$('html, body').animate({scrollTop: $(".address-field").offset().top}, 300);
			return false;
		}

		//提交
		var t = $(this), data = [], action = $(".delivery").data("action");

		data.push("id="+oid);

		var addrid = $("input[name='addressid']:checked").val();
		addrid = addrid == undefined ? 0 : addrid;
		data.push("addrid="+addrid);
		if(addrid == 0){
			data.push("addressid="+$("#addrlist select:last").val());
			data.push($(".address-field input").serialize());
		}
		data.push("deliveryType="+$("input[name=deliveryType]:checked").val());
		data.push("comment="+encodeURIComponent($("input[name=comment]").val()));

		t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");  //提交中

		$.ajax({
			url: action,
			data: data.join("&"),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					alert(langData['siteConfig'][20][229]);   //修改成功！
					location.reload();

				}else{
					alert(data.info);
					t.attr("disabled", false).html(langData['siteConfig'][6][41]);  //确认修改
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
				t.attr("disabled", false).html(langData['siteConfig'][6][41]);  //确认修改
			}
		});


	});


});
