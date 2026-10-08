$(function(){

	var minPutMoney_ = minPutMoney;
	var pageType = type;

	if(type != 'bank'){
		if(!realname){
			$.dialog.alert(langData['siteConfig'][30][57]);//请先完成实名认证，再进行提现到支付宝、微信的操作
		}else{
			if(!wxpay && !alipay){
				$.dialog.alert(langData['siteConfig'][30][58]);//抱歉，暂时不支持提现到支付宝微信，请联系网站管理员或选择提现到银行卡
			}else{
				if(!alipay){
					$('#t2').trigger('click');
				}
			}
			if(!wxpay){
				$('#t2').attr('disabled', true);
			}
			if(!alipay){
				$('#t1').attr('disabled', true);
			}
		}
		checkMinAmount();
	}

	var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
	var re = new RegExp(regu);

	//选择支付方式
	$("input[name=type]").bind("click", function(){
		var t = $(this), val = t.val();
		checkMinAmount(val);
		if($('#amount').val() != ''){
			$('#amount').blur();
		}
	});
	function checkMinAmount(type){
		if(type == undefined){
			var type = $("input[name=type]:checked").val();
		}
		var m = type == "alipay" ? min_alipay : min_wxpay;
		if(minPutMoney_ < m){
			minPutMoney = m;
		}else{
			minPutMoney = minPutMoney_;
		}
		$('#min').text(minPutMoney);
	}



	//隐藏表单提示信息
	$(".inp").bind("input click focus", function(){
		$(this).removeClass("error").siblings(".tip-inline").removeClass().addClass("tip-inline").hide();
	});


	//文本框错误提示
	function inpErr(obj, txt){
		var obj = $("#"+obj), tip = obj.siblings(".tip-inline");
		tip.removeClass().addClass("tip-inline error").show();
		if(txt){
			tip.html('<s></s>'+txt);
		}
		obj.addClass("error");
	}


	//表单验证
	$(".inp").bind("blur", function(){
		var t = $(this), val = t.val(), id = t.attr("id"), tip = t.siblings(".tip-inline"), tiptxt = tip.html(), tj = false;

		//金额验证
		if(id == "amount"){
			tj = !re.test(val) || val > maxPutMoney || val == "" || val < minPutMoney ? false : true;
		}else{
			tj = val == "" ? false : true;
		}

		if(tj){
			t.removeClass("error");
			tip.removeClass().addClass("tip-inline ok").show();
		}else{
			tip.removeClass().addClass("tip-inline error").show();
			t.addClass("error");

			if(id == "amount"){
				if(val < minPutMoney){
						inpErr("amount", langData['siteConfig'][38][35]+minPutMoney);//最低提现
				}else if(val > maxPutMoney){
						inpErr("amount", langData['siteConfig'][19][720]+maxPutMoney);//您最多可提现
				}else{
					inpErr("amount", langData['siteConfig'][20][63]);//金额必须为整数或小数，小数点后不超过2位。
				}
			}
		}

	});


	//历史记录浮动层
	function historyPopup(data, type){
		var obj = $("#showHistoryExtend .history-main");
		if(data){

			var list = [];
			for(var i = 0; i < data.length; i++){

				var body = data[i].bank+'(...'+data[i].cardnum.substr(data[i].cardnum.length-4)+')';
				if(type == "alipay"){
					body = data[i].cardnum;
				}
				list.push('<li><a href="javascript:;" data-id="'+data[i].id+'" data-bank="'+data[i].bank+'" data-cardnum="'+data[i].cardnum+'" data-cardname="'+data[i].cardname+'"><strong>'+data[i].cardname+'</strong>&nbsp;&nbsp;'+body+'<em title="'+langData['siteConfig'][23][125]+'">&times;</em></a></li>');
				//删除此条记录
			}
			obj.html('<ul>'+list.join("")+'</ul>');

		}else{
			obj.html('<div class="empty">'+langData['siteConfig'][23][126]+'</div>');//您还没有提现记录。
		}
	}


	//获取历史记录
	function showHistory(obj, type){
		var pos = obj.offset(), left = pos.left, top = pos.top + 33, pop = "showHistoryExtend";
		$("#"+pop).size() > 0 ? $("#"+pop).remove() : null;
		$('<div class="history-list fn-hide" id="'+pop+'"><div class="history-main"><div class="load">'+langData['siteConfig'][20][184]+'...</div></div></div>').appendTo("body");//加载中，请稍候
		$("#"+pop).css({"left": left, "top": top}).show();

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=member&action=withdraw_card&type="+type,
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					historyPopup(data.info, type);
				}else{
					$("#"+pop).find(".history-main").html('<div class="empty">'+langData['siteConfig'][23][126]+'</div>');//您还没有提现记录。
				}
			}
		});
	}


	//银行卡历史记录
	$(".historyBank").bind("click", function(){
		var t = $(this);
		showHistory(t, "");
		return false;
	});


	//删除记录
	$("body").delegate("#showHistoryExtend a em", "click", function(){
		var t = $(this).parent(), li = t.parent(), ul = li.parent(), id = t.data("id");
		li.slideUp(300, function(){
			li.remove();

			if(ul.find("li").length == 0){
				obj = $("#showHistoryExtend .history-main").html('<div class="empty">'+langData['siteConfig'][23][126]+'</div>');//您还没有提现记录。
			}
		});
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=member&action=withdraw_card_del",
			type: "POST",
			data: "id="+id,
			dataType: "jsonp"
		});
		return false;
	});

	//选择历史记录
	$("body").delegate("#showHistoryExtend a", "click", function(){
		var t = $(this), bank = t.data("bank"), cardnum = t.data("cardnum"), cardname = t.data("cardname");
		if(bank != "alipay"){
			$("#bank").val(bank);
			$("#cardnum").val(cardnum);
			$("#cardname").val(cardname);
		}else{
			$("#alipaynum").val(cardnum);
			$("#alipayname").val(cardname);
		}

		$("#bank").removeClass("error").siblings(".tip-inline").removeClass("error").addClass("ok");
		$("#cardnum").removeClass("error").siblings(".tip-inline").removeClass("error").addClass("ok");
		$("#cardname").removeClass("error").siblings(".tip-inline").removeClass("error").addClass("ok");
		$("#alipaynum").removeClass("error").siblings(".tip-inline").removeClass("error").addClass("ok");
		$("#alipayname").removeClass("error").siblings(".tip-inline").removeClass("error").addClass("ok");
	});

	$(document).click(function (e) {
		$("#showHistoryExtend").hide();
	});


	//提交申请
	$("#tj").bind("click", function(event){
		var t = $(this), data = [];

		var type = $("input[name=type]:checked").val(),
				amount = $("#amount").val();


		if(!re.test(amount)){
			inpErr("amount", langData['siteConfig'][20][63]);//金额必须为整数或小数，小数点后不超过2位。
			return false;
		}

		if(amount < minPutMoney){
			inpErr("amount", langData['siteConfig'][38][35]+minPutMoney);//最低提现
			return false;
		}

		if(amount > maxPutMoney){
			inpErr("amount", langData['siteConfig'][19][720]+maxPutMoney);//您最多可提现
			return false;
		}

		if(!$("#agree").is(":checked")){
			alert(langData['siteConfig'][23][105]);//您必须同意并接受《充值服务协议》
			return false;
		}

		if(pageType == 'bank'){
			var bank = $('#bank').val(),
					cardnum = $('#cardnum').val(),
					cardname = $('#cardname').val();
			if(bank == ''){
				inpErr("bank", langData['siteConfig'][38][36]);//请填写开户行
				return false;
			}
			if(cardnum == ''){
				inpErr("cardnum", langData['siteConfig'][38][37]); //银行卡号
				return false;
			}
			if(cardname == ''){
				inpErr("cardname", langData['siteConfig'][38][38]);//开户人姓名
				return false;
			}
		}

		t.attr("disabled", true).val(langData['siteConfig'][6][35]+"...");//提交中

		var data = [];
		var url = '';
		if(pageType == 'bank'){
	    data.push("bank="+bank);
			data.push("cardnum="+cardnum);
			data.push("cardname="+cardname);
	    data.push('amount='+amount);
			url = masterDomain + '/include/ajax.php?service=dating&action=withdraw'
		}else{
	    data.push('module='+module);
	    data.push('utype='+utype);
	    data.push('amount='+amount);
	    data.push('type='+type);
	    url = masterDomain + '/include/ajax.php?service=member&action=putForward&'+data.join('&');
		}
    $.ajax({
      url: url,
      data: data.join('&'),
      type: 'post',
      dataType: 'jsonp',
      success: function(data){

        if(data && data.state == 100){
        	var info = pageType == 'bank' ? langData['siteConfig'][30][59] : langData['siteConfig'][30][60];//提现申请已提交，我们会尽快处理，请耐心等待' -----'提交成功，资金到账可能有延迟，请耐心等待

        	$.dialog({
        		title: langData['siteConfig'][22][72],//提示信息
        		icon: "success.png",
        		content: info,
        		ok: function(){
	            location.reload();
        		},
        		cancel: function(){
	            location.reload();
        		}
        	})
        }else{
          $.dialog.alert(data.info);
          t.attr("disabled", false).val(langData['siteConfig'][19][716]);//申请提现
        }
      },
      error: function(){
      	$.dialog.alert(langData['siteConfig'][6][203]);//网络错误，请重试
      }
    })
	});

});
