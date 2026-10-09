$(function(){

  // 删除
  $('.cart-list').delegate('.del', 'click', function(){
    if (confirm("确定要删除吗？")) {
      $(this).closest('.shop-list').remove();
    }
  })

  // 提交订单
  $('.submit').click(function(){
  	var userid = $.cookie(cookiePre+'login_user');
  	if(userid == undefined || userid == null || userid == ''){
      location.href = '/login.html';
      return;
    }
    if(userPoint < totalPoint){
    	alert('您的积分不足，提交失败');
		window.location.href = pointurl;
    	return;
    }
    var t = $(this);
    if(t.hasClass('disabled')) return;
    var form = $('#dealForm'), data = form.serialize(), url = form.attr('action');
    $.ajax({
    	url: url,
    	type: 'post',
    	data: data,
    	dataType: 'json',
    	success: function(data){
    		if(data && data.state == 100){
				sinfo = data.info;
				service   = 'awardlegou';
				$('#ordernum').val(sinfo.ordernum);
				$('#action').val('pay');


				$("#amout").text(sinfo.order_amount);
				$('.payMask').show();
				$('.payPop').css('transform', 'translateY(0)');

				if (totalBalance * 1 < sinfo.order_amount * 1) {

					$("#moneyinfo").text('余额不足，');
					$("#moneyinfo").closest('.check-item').addClass('disabled_pay')
					$('#balance').hide();
				}
				if (monBonus * 1 < sinfo.order_amount * 1) {

					$("#bonusinfo").text('余额不足，');
					$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
				}else{
					$("#bonusinfo").text('');
					$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
				}
				ordernum = sinfo.ordernum;
				order_amount = sinfo.order_amount;

				payCutDown('', sinfo.timeout, sinfo);
    		}else{
    			alert(data.info);
				if(data.info == '积分不足'){
					window.location = pointurl;
				}else if(data.info == '本次乐购活动参与人数已满，您可以自己发起乐购！'){
					window.location = prourl;
				}
	    		t.removeClass('disabled');
	    	}
    	},
    	error: function(){
    		alert('网络错误，请重试！');
    		t.removeClass('disabled');
    	}
    })
  })

  //选择收货地址
  $(".address .t").bind("click", function(){
    $("#p1, .btmCartWrap").hide();
    $("#p2").show();
  });

  //选择收货地址后退
  $("#p2 .goback1").bind("click", function(){
    $("#p2").hide();
    $("#p1, .btmCartWrap").show();
  });

  //确定收货地址
  $(".addresslist").delegate("a", "click", function(){
    var t = $(this), id = t.attr("data-id"), name = t.attr("data-name"), tel = t.attr("data-tel"), addr = t.attr("data-addr");
    $("#address").val(id);
    $(".address-info").html('<span class="name">'+name+'</span><span class="tel">'+tel+'</span><span class="address-txt">'+addr+'</span>').removeClass('empty');
    $("#p2 .goback1").click();
  });

  //添加收货地址
  $(".addAddress").bind("click", function(){
    $("#p2").hide();
    $("#p3").show();
  });

  //新增收货地址后退
  $("#p3 .goback1").bind("click", function(){
    $("#p3").hide();
    $("#p2").show();
  });


  var addrid = 0, addArr = [];

	//区域
	$("#addrlist").delegate("select", "change", function(){
		var sel = $(this), id = sel.val(), index = sel.index(), selLen = sel.siblings().length+1;
		if(id == 0){
			sel.closest("li").addClass("error");
			$("#addrlist select").slice(index+1,selLen).remove();
		} else if(id != 0 && id != ""){
			$.ajax({
				type: "GET",
				url: masterDomain+"/include/ajax.php",
				data: "service=siteConfig&action=addr&son=0&type="+id,
				dataType: "jsonp",
				success: function(data){
					var i = 0, opt = [];
					if(data instanceof Object && data.state == 100){
						for(var key in data.info){
							var selected = addArr.length > 0 && addArr[index+1] == data.info[key]['typename'] ? " selected" : "";
							opt.push('<option value="'+data.info[key]['id']+'"'+selected+'>'+data.info[key]['typename']+'</option>');
						}
						$("#addrlist select").slice(index+1,selLen).remove();
						$("#addrlist").append('\n<select name="addrid[]"><option value="0">请选择区域</option>'+opt.join("")+'</select>');
						sel.closest("li").addClass("error");

						if(addArr.length > 0){
							$("#addrlist select:last").change();
						}
					}else{
						sel.closest("li").removeClass("error");
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
		person: function(){
			var t = $("#person"), val = t.val(), par = t.closest("li");
			if(val.length < 2 || val.length > 15){
				alert('请填写收货人')
				return false;
			}
			return true;
		}
		,mobile: function(){
			var t = $("#mobile"), val = t.val(), par = t.closest("li");
			var exp = new RegExp("^(13|14|15|17|18)[0-9]{9}$", "img");
			if(val == ""){
				alert('请填写手机号');
				return false;
			}else{
				if(!/^(13|14|15|17|18)[0-9]{9}$/.test(val) && val != ""){
					// alert('请填写正确的手机号码')
					// return false;
				}
			}
			return true;
		}
		,addrid: function(){
			if($("#addrlist select:last").val() == 0){
				$("#addrlist").parents("li").addClass("error");
				alert('请选择完整的省市区')
				return false;
			}
			return true;
		}
		,address: function(){
			var t = $("#addr"), val = t.val(), par = t.closest("li");
			if(val.length < 5 || val.length > 60 || /^\d+$/.test(val)){
				alert('请正确填写详细地址');
				return false;
			}
			return true;
		}
	}
	//国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        $(".areacode_span em").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

	//提交新增/修改
	$("#submit").on("click", function(){

		var t = $(this);

		if(t.hasClass("disabled")) return false;

		//验证表单
		if(inputVerify.person() && inputVerify.mobile() && inputVerify.addrid() && inputVerify.address() ){

			var data = [];
			data.push('id='+0);
			data.push('addrid='+$("#addrlist select:last").val());
			data.push('address='+$("#addr").val());
			data.push('person='+$("#person").val());
			data.push('mobile='+$("#mobile").val());
			data.push('areaCode='+$("#areaCode").val());
			data.push('module=awardlegou');

			t.addClass("disabled").html("提交中...");

      $.ajax({
				url: masterDomain+"/include/ajax.php?service=member&action=addressAdd",
				data: data.join("&"),
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){

						//返回到地址列表
            $("#p3 .goback1").click();

						//异步加载所有地址
						$.ajax({
							url: masterDomain+"/include/ajax.php?service=member&action=address",
							type: "POST",
							dataType: "jsonp",
							success: function (data) {
								if(data && data.state == 100){

                  $(".null").remove();
									var list = [], addList = data.info.list;

									for(var i = 0; i < addList.length; i++){
                    contact = addList[i].mobile != "" && addList[i].tel != "" ? addList[i].mobile : (addList[i].mobile == "" && addList[i].tel != "" ? addList[i].tel : addList[i].mobile);
                    list.push('<div class="item">');
										list.push('<a src="javascript:;" data-id="'+addList[i].id+'" data-name="'+addList[i].person+'" data-tel="'+contact+'" data-tel="'+addList[i].tel+'" data-addr="'+addList[i].addrname+'&nbsp;&nbsp;'+addList[i].address+'">');
                    list.push('<p><span>'+addList[i].person+'</span><span>电话：'+contact+'</span></p>');
                    list.push('<p>'+addList[i].addrname+'&nbsp;&nbsp;'+addList[i].address+'</p>');
                    list.push('<div class="btn_address"><span>选择该收货地址</span></div>');
                    list.push('</a>');
										list.push('</div>');
									}

									$(".addresslist").html(list.join(""));

								}else{
									alert("加载失败，请刷新页面重试！");
								}
							},
							error: function(){
								alert("加载失败，请刷新页面重试！");
							}
						});

            t.removeClass("disabled").html("保存");
            $(".addaddress input").val("");
            $("#addrid option:eq(0)").attr("selected", "selected");
            $("#addrid").siblings("select").remove();

					}else{
						alert(data.info);
						t.removeClass("disabled").html("保存");
					}
				},
				error: function(){
					alert("网络错误，请重试！");
					t.removeClass("disabled").html("保存");
				}
			});

		}

	});


})
