$(function(){

	$(".error-tips .close").bind("click", function(){
		$(".error-tips").hide();
	});

	//数量增加、减少
	$(".counter button").bind("click", function(){
		var t = $(this), type = t.attr("class"), inp = t.siblings("input"), val = Number(inp.val());

		//减少
		if(type == "minus"){
			inp.val(val-1);
			checkCount(t.closest("tr"));

		//增加
		}else if(type == "add"){
			inp.val(val+1);
			checkCount(t.closest("tr"));

		}
	});

	$(".counter input").bind("blur", function(){
		checkCount($(this).closest("tr"));
	});


	//验证数量
	function checkCount(t){
		var count = t.find(".counter input"), val = Number(count.val()), tips = $(".error-tips"), freight = 0,
				maxCount = t.data("max"), price = t.data("price"), type = t.data("type");

		//最小
		if(val < 1){
			count.val(1);
			val = 1;
			tips.find("p span").html("您最少需要购买 1 件");
			tips.show();

		//最大
		}else if(val > maxCount && maxCount != 0){
			count.val(maxCount);
			val = maxCount;
			tips.find("p span").html("每人最多只能购买 "+maxCount+" 单");
			tips.show();

		}else{
			tips.hide();

			if(type == 2){
				var freeshi = t.data("freeshi");
				if(val <= freeshi){
					freight = t.data("freight");

					t.find(".total .del").html("含运费 "+freight);
				}else{
					t.find(".total .del").html("免运费");
				}

			}

		}

		t.find(".total strong").html((price * val + freight).toFixed(2));

		checkTotal();

	}

	//计算总额
	function checkTotal(){
		var price = 0;
		$(".section tbody tr").each(function(){
			var t = $(this);

			var count = t.find(".counter input").val(), pri = t.data("price"), freight = 0, type = t.data("type");

			if(type == 2){
				var freeshi = t.data("freeshi");
				if(count <= freeshi){
					freight = t.data("freight");
				}
			}

			price += count * pri + freight;

		});
		$("#totalPrice").html(echoCurrency('symbol')+price.toFixed(2));
	}

	//全选
	$("#selectAll").bind("click", function(){
		if($(this).attr("checked") == true || $(this).attr("checked") == "checked"){
			$(".section tbody input[type=checkbox]").attr("checked", true);
		}else{
			$(".section tbody input[type=checkbox]").attr("checked", false);
		}
		checkTotal();
	});

	//单选
	$(".section tbody input[type=checkbox]").bind("click", function(){
		if($(this).attr("checked") == true || $(this).attr("checked") == "checked"){
			var total = $(".section tbody input[type=checkbox]").length, checked = $(".section tbody input[type=checkbox]:checked").length;
			if(total == checked){
				$("#selectAll").attr("checked", true);
			}
		}else{
			$("#selectAll").attr("checked", false);
		}
		checkTotal();
	});

	//删除购物车内容
	$(".section .delete").bind("click", function(){
		if(!confirm("确定删除该商品吗？")) return false;

		var t = $(this), tr = t.closest("tr"), id = tr.data("id"), orderid = tr.data("orderid");

		$.ajax({
			type: "GET",
			url: "/include/ajax.php",
			data: "service=tuan&action=delOrder&id="+orderid,
			dataType: "json"
		});

		tr.fadeOut(500, function(){
			tr.remove();
			checkTotal();

			var dizhi = 0;
			$(".section tbody tr").each(function(){
				var t = $(this);
				if(t.data("type") == 2){
					dizhi = 1;
				}
			});

			if(!dizhi) $(".delivery").remove();

			//如果删完了
			if($(".section tbody tr").length <=0){
				$(".section tbody").html('<tr><td colspan="6" class="empty">订单不存在或已删除</td></tr>');
				$(".total-fee, .delivery, .submit").remove();
				$(".section").after('<div class="empty-split"></div>');
			}
		});


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
						$("#addrlist").append('<select name="addrid[]"><option value="0">请选择区域</option>'+opt.join("")+'</select>');
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
				// par.find(".input-tips").html("<s></s>请输入正确的手机号码").show();
				// return false;
			}else{
				par.find(".input-tips").html("<s></s>手机号码和固定电话最少填写一项").hide();
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


	//提交订单
	$("#submit").bind("click", function(){

		//验证登录
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}

		//验证表单
		if($("#delivery").length > 0 && $("#delivery li.selected").index() == $("#delivery li").length-1 && (!inputVerify.addrid() || !inputVerify.address() || !inputVerify.person() || !inputVerify.mobile() || !inputVerify.tel())){
			$('html, body').animate({scrollTop: $(".address-field").offset().top}, 300);
			return false;
		}

		//提交
		var t = $(this), data = [], action = t.closest("form").attr("action");
		$(".section tbody tr").each(function(){
			var t = $(this), id = t.data("id"), type = t.data("type"), count = t.find(".counter input").val(), orderid = t.data("orderid");
			data.push('pros[]='+id+","+count+","+orderid);
		});

		//邮寄信息
		if($("#delivery").length > 0){
			var addrid = $("input[name='addressid']:checked").val();
			data.push("addrid="+addrid);

			if(addrid == 0){
				data.push("addressid="+$("#addrlist select:last").val());
				data.push($(".address-field input").serialize());
			}

			data.push("deliveryType="+$("input[name=deliveryType]:checked").val());
			data.push("comment="+encodeURIComponent($("input[name=comment]").val()));
		}

		t.attr("disabled", true).html("提交中...");

		$.ajax({
			url: action,
			data: data.join("&"),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					//成功后跳转支付页面
					location.href = data.info;

				}else{
					alert(data.info);
					t.attr("disabled", false).html("提交订单");
				}
			},
			error: function(){
				alert("网络错误，请重试！");
				t.attr("disabled", false).html("提交订单");
			}
		});


	});


});
