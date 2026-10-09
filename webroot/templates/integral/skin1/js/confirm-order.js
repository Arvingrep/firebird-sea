$(function(){
		//-------------购物车列表

	$("img").scrollLoading();

	var totalPrice = totalPoint = 0;

	// 计算总积分
	getInteg();
	function getInteg(){
		totalPrice = totalPoint = 0;
		if($('.cart-list ul.main li').length==0){
			var dom = '<li id="cart-null"><span>您的购物车还没有商品</span></li>'
			$('.cart-list').children('.main').html(dom)
			$('#cart-null').slideDown()
		}else{
			$('.cart-list ul.main li').each(function(){
				var $this = $(this);
				var num = parseInt($this.find('.buynum').val());
				var r_item = $this.find('.integral').children('span');

				var id = $this.attr('data-id'), price = $this.attr('data-price'), point = $this.attr('data-point'), freight = parseFloat($this.attr('data-freight'));

				totalPrice += price*num;
				totalPoint += point*num;
				var info = totalPrice + ''+echoCurrency('short')+' + ' + totalPoint + pointName;
				r_item.text(info);

				totalPrice += freight;
			})
		}

		var have = userPoint;
		var xc = have - totalPoint;
		var str = xc<=0?'账户不足'+pointName+'：':'兑换后剩余'+pointName+'：';
		if(xc < 0){
			xc = Math.abs(xc);
			$('.top-user-info-2 .l2').html('您的'+pointName+'不足 , 可以<a href="'+convertUrl+'" target="_blank" class="f-green"> 充值'+pointName+'</a>，当前'+pointName+'缺少<span class="f-red">'+xc+'</span>分')
		}else{
			$('.top-user-info-2 .l2').html('');
		}
		$('#iten_c_li').show();
		$('#integral_check').text(str);
		$('#differ_n').text(xc+pointName);



		str = totalPrice + ''+echoCurrency('short')+' + ' + totalPoint + pointName;
		$('.total_r').text(str);

	}

	//----数目增减
	$('.cart-list .btn-add').click(function(){
		var $this = $(this), index = $this.closest('li').index();
		var $dec = $this.siblings('.btn-dec');

		var price = parseInt($this.closest('li').attr('data-price')),
			point = parseInt($this.closest('li').attr('data-point')),
			inventory = parseInt($this.closest('li').attr('data-inventory'));


		var now = $this.siblings('.buynum').val();
		if(now>=inventory){
			errmsg(index,'max',inventory)
			return;
		}else{
			$this.siblings('.buynum').val(++now);
			if($dec.hasClass('cannot')){
				$dec.removeClass('cannot');
			}
			if(now>=inventory){$this.addClass('cannot');}
			getInteg();
		}
	})

	$('.cart-list .btn-dec').click(function(){
		var $this = $(this), index = $this.closest('li').index();
		var $dec = $this.siblings('.btn-dec');

		var price = parseInt($this.closest('li').attr('data-price')),
			point = parseInt($this.closest('li').attr('data-point')),
			inventory = parseInt($this.closest('li').attr('data-inventory'));

		var now = $this.siblings('.buynum').val();
		if(now<=1){
			errmsg(index,'min')
			return;
		}else{
			$this.siblings('.buynum').val(--now);
			if($add.hasClass('cannot')){
				$add.removeClass('cannot');
			}
			if(now<=1){$this.addClass('cannot');}
			getInteg();
		}
	})

	var $deloneobj;
	$('.cart-list .do2').click(function(){
		var $this = $(this)
		$this.parents('li').addClass('deling')
		if(confirm('确认要删除？')){
			$this.parents('li').remove()
			getInteg();
		}else{
			$this.parents('li').removeClass('deling')
		}
	})
	$('.cart-list .reset').click(function(){
		if($('#cart-null').length>0){
			$('#cart-null span').toggleClass('tx');
		}else{
			$('.cart-list ul.main li').addClass('deling')
			if(confirm('确认要清空购物车？')){
				$('.cart-list ul.main').html('')
				getInteg();
			}else{
				$('.cart-list ul.main li').removeClass('deling')
			}
		}
	})

	//选择配送时间
	$('.cart-list .d5 a').click(function(){
		$(this).addClass('active').siblings().removeClass('active')
	})



	//输入框
	$('.buynum').keyup(function(){
		var index = $(this).parents('li').index();
		var max = Number($(this).parents('li').attr('data-max'))
		var val = $(this).val().replace(/\D+/ig,'');
		if(val > max){
			val = max;
			errmsg(index,'max',max)
		}
		if(val < 1){
			val = 1;
			errmsg(index,'min')
		}
		$(this).val(val);
		setTimeout(function(){
			getInteg();
		},10)
	})

	var errmsgtime;
	function errmsg(eq,type,num){
		$('#errmsg').remove()
		clearTimeout(errmsgtime);
		var str = type=='max' ? '该商品库存仅剩' + num + '件' : '您最少选择1件';
		var obj = $('.cart-list ul.main li').eq(eq).find('.btn-box');
		obj.addClass('aaaa')
		var top = obj.offset().top - 36
		var left = obj.offset().left - 20

		var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;width:150px;height:36px;line-height:36px;text-align:center;color:#f76120;font-size:14px;display:none;">' + str + '</div>'
		$('body').append(msgbox);
		$('#errmsg').fadeIn();
		errmsgtime = setTimeout(function(){
			$('#errmsg').remove()
		},1500)
	}

	//收货地址
	$('.address-item').hover(function(){
		$(this).addClass('hover')
	},function(){
		$(this).removeClass('hover')
	})

	//国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                   }
                   $('.areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                        $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                    }

        })
    }
    //显示区号
    $('.areaCode').bind('click', function(e){
        e.stopPropagation();
        var areaWrap =$('.areaCode_wrap');
        if(areaWrap.is(':visible')){
            areaWrap.fadeOut(300)
        }else{
            areaWrap.fadeIn(300);
           return false; 
        }

        
    });

    //选择区号
    $('.areaCode_wrap').delegate('li', 'click', function(){
        var t = $(this), code = t.attr('data-code');
        $('.areaCode i').html('+' + code);
        $('#areaCode').val(code);
    });

    $('body').bind('click', function(){
        $('.areaCode_wrap').fadeOut(300);
    });
	//点击新增地址
	$('.address-item-new').click(function(){
		addArr = [];
		var id = $('.address-edit-box').attr('data-id');
		if(id != '0'){
			//如果上一次是修改操作，清空表单
			addFormReset()
		}
		$('.address-edit-box').attr('data-id',0).show();
		$('.mask').show();
		//重置区号
		var areaCodeOld = $('.areaCode_wrap li:first-child').data('code');
        $("#areaCode").val(areaCodeOld);
        $('.form-section .areaCode i').text('+'+areaCodeOld);
	})

	$('.input-text').focus(function(){
		$(this).parent('.form-section').addClass('form-section-focus form-section-active')
	})
	$('.input-text').blur(function(){
		var val = $(this).val().replace(/\s/g,'');
		var cl = val.length == 0 ? 'form-section-focus form-section-active' : 'form-section-focus'
		$(this).parent('.form-section').removeClass(cl)
	})

	//保存地址
	$('#J_save').click(function(){
		var t = $(this);
		if(t.hasClass('disabled')) return;
		t.addClass('disabled');
		var result = true;
		$('.form-section-error').removeClass('form-section-error');
		//验证input输入框
		$('.address-edit-box .input-text').each(function(i){
			var val = $(this).val().replace(/\s/g,'');
			$(this).val(val);
			if(i==0){
				var l = val.length;
				if(/^[\u4e00-\u9fa5]+$/.test(val)){
					l = l*2
				}
				if(val.length==0 || l < 4 || l > 20){
					$(this).parent('.form-section').addClass('form-section-error');
					t.removeClass('disabled');
					result = false;
					return false;
				}
			}
			if(i==1){
				if(val.length==0){
					$(this).parent('.form-section').addClass('form-section-error');
					t.removeClass('disabled');
					result = false;
					return false;
				}
			}
			if(i==2){
				if(val.length==0 || val.length < 5 || val.length > 32){
					$(this).parent('.form-section').addClass('form-section-error');
					t.removeClass('disabled');
					result = false;
					return false;
				}
			}
		})
		//验证省市区县
		if(result){
			$('.address-edit-box select').each(function(i){
				if($(this).val()==0){
					$(this).parents('.xm-select').addClass('form-section-error');
					t.removeClass('disabled');
					result = false;
					return false;
				}
			})
		}
		//提交
		if(result){
			var id = $('.address-edit-box').attr('data-id');						//操作类型

			var data = [];
			data.push('id='+id);
			data.push('addrid='+$("#J_county").val());
			data.push('address='+$("#user_adress").val());
			data.push('person='+$('#user_name').val());
			data.push('mobile='+$("#user_phone").val());
			data.push('areaCode='+$("#areaCode").val());
			data.push('module=integral');

			t.addClass("disabled").html("提交中...");

      		$.ajax({
				url: masterDomain+"/include/ajax.php?service=member&action=addressAdd",
				data: data.join("&"),
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						location.reload();
					}else{
						alert(data.info);
						t.removeClass('disabled').html("保存");
					}
				},
				error: function(){
					alert(data.info);
					t.removeClass('disabled').html("保存");
				}
			})
		}
	})


	$(document).on('mouseover','.J_addressItem',function(){
		$(this).addClass('hover')
	})
	$(document).on('mouseleave','.J_addressItem',function(){
		$(this).removeClass('hover')
	})

	//修改地址
	$(document).on('click','.J_addressItem .modify',function(){
		var $info = $(this).parents('.J_addressItem');
		var editId = $info.attr('data-id');


		var uname = $info.attr('data-name');
		var utel = $info.attr('data-tel');
		var address = $info.attr('data-address');
		var zipcode = $info.attr('data-zipcode');
		var usertag = $info.attr('data-tag');
		var areaCode = $info.attr('data-code');
		addArr = $info.attr('data-addr').split(" ");

		$('#user_name').val(uname);
		$('#user_phone').val(utel);
		$('#user_adress').val(address);
		if(areaCode !='' && areaCode!='86'){
			$("#areaCode").val(areaCode);
			$(".areaCode i").text('+'+areaCode);
		}else{
			$("#areaCode").val('86');
			$(".areaCode i").text('+86');
		}

		$('#J_province option').each(function(){
			if($(this).text() == addArr[0]){
				$(this).attr("selected", true);
			}
		});
		$('#J_province').change();

		$('.address-edit-box .form-section').addClass('form-section-active');
		$('.address-edit-box').attr({'data-id':editId}).show();
		$('.mask').show()
	})

	$('.address-edit-box select').change(function(){
		var t = $(this), id = t.val(), tid = t.attr('id'), index = 0, con = null;
		if(tid == 'J_province'){
			$('#J_city option').slice(1).remove();
			$('#J_county option').slice(1).remove();
			con = $('#J_city');
			index = 1;
		}else if(tid == 'J_city'){
			$('#J_county option').slice(1).remove();
			con = $('#J_county');
			index = 2;
		}else{
			return;
		}
		getAddr(con, id, index);
	})

	//支付方式功能区域
	$(".part3Con .bank-icon").on("click",function(){
		var $t=$(this);
		$t.addClass("active").siblings("a").removeClass("active");
		$t.parents(".payStyle").siblings(".payStyle").removeClass("active");
		$t.parents(".payStyle").siblings(".payStyle").find(".bank-icon").removeClass("active");
		$("#paytype").val($t.data("type"));
	});

	//取消
	$('#J_cancel').click(function(){
		$('.mask,.address-edit-box').hide()
	})

	//删除地址
	$(document).on('click','.J_addressItem .del',function(){
		var $delete=$(this),$one=$(".addresList");
		if(confirm('确认要删除该地址？')){
			$.ajax({
				url: "/include/ajax.php?service=member&action=addressDel",
				data: "id="+$delete.closest(".J_addressItem").attr("data-id"),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						if($delete.parents("dl").hasClass("selected")){
							if($delete.parents("dl").index()==0){
								$one.find(".J_addressItem:eq(1)").addClass("selected").siblings("dl").removeClass("selected");
								$one.find(".J_addressItem:eq(1) a.setAddress").text("当前地址");
								$one.find(".J_addressItem:eq(1)").siblings("dl").find("a.setAddress").text("使用此地址");
							}else{
								$one.find(".J_addressItem:first").addClass("selected").siblings("dl").removeClass("selected");
								$one.find(".J_addressItem:first a.setAddress").text("当前地址");
								$one.find(".J_addressItem:first").siblings("dl").find("a.setAddress").text("使用此地址");
							}
						}
						$delete.parents(".J_addressItem").remove();

					}else{
						alert(data.info);
					}
				},
				error: function(){
					alert("网络错误，请重试！");
				}
			});
		}
	})

	//设为默认地址
	$(document).on('click','.J_addressItem .setDefault',function(){
		if($(this).hasClass('setthis')){return;}
		$('.J_addressItem').removeClass('selected').find('.setDefault').text('使用此地址');
		$(this).parents('.J_addressItem').addClass('selected');
		$(this).text('当前地址');
	})

	//清空地址表单
	function addFormReset(){
		$('#user_name').val('')
		$('#user_phone').val('')
		$('#user_adress').val('')
		$('#user_zipcode').val('')
		$('#user_tag').val('')
		//重置区号
		var areaCodeOld = $('.areaCode_wrap li:first-child').data('code');
        $("#areaCode").val(areaCodeOld);
        $('.form-section .areaCode i').text('+'+areaCodeOld);

		$('#areaCode').val('86');
		$('.areaCode i').text('+86');
		$('.form-section-active').removeClass('form-section-active')

		$('#J_province').find('[value="0"]').attr('selected','selected')
		$('#J_city').find('[value="0"]').attr('selected','selected')
		$('#J_county').find('[value="0"]').attr('selected','selected')
	}


	// 提交订单
  	$('.submit').click(function(){
	  	var userid = $.cookie(cookiePre+'login_user');
	  	if(userid == undefined || userid == null || userid == ''){
	      location.href = '/login.html';
	      return;
	    }
	    if(userPoint < totalPoint){
	    	alert('您的'+pointName+'不足，提交失败');
	    	return;
	    }
	    var t = $(this);
	    if(t.hasClass('disabled')) return;
	    if($('.J_addressItem.selected').length){
	    	$('#address').val($('.J_addressItem.selected').attr('data-id'));
	    }else{
	    	alert('请选择或添加收货地址');
	    	return;
	    }
	    var count = $('.buynum').val();
	    if(count == '' || count < 1){
	    	alert('请填写商品数量');
	    	return;
	    }else if(count > maxCount){
	    	alert('商品数量超过库存');
	    	return;
	    }
	    var paypwd = $('.paypwd_inp').val();
	    if(paypwd == ''){
	    	alert('请输入支付密码');
	    	return;
	    }
	    $('.paypwd').val(paypwd);
	    $('#count').val(count);
	    var paytype = $('.terrace .active').attr('data-type');
	    var form = $('#dealForm'), data = form.serialize(), url = form.attr('action');
	    $.ajax({
	    	url: url,
	    	type: 'post',
	    	data: data,
	    	dataType: 'json',
	    	success: function(data){
	    		if(data && data.state == 100){
	    			$('#ordernum').val(data.info);
	    			$('#paytype').val(paytype);
	    			$('#paypwd').val(paypwd);
	    			$('#payForm').submit();
	    		}else{
	    			alert(data.info);
		    		t.removeClass('disabled');
		    	}
	    	},
	    	error: function(){
	    		alert('网络错误，请重试！');
	    		t.removeClass('disabled');
	    	}
	    })
	})
})

var addrid = 0, addArr = [];
function getAddr(con, id, index){
	$.ajax({
		type: "GET",
		url: "/include/ajax.php",
		data: "service=siteConfig&action=addr&son=0&type="+id,
		dataType: "json",
		success: function(data){
			var i = 0, opt = [];
			if(data instanceof Object && data.state == 100){
				for(var key in data.info){
					var selected = addArr.length > 0 && index && addArr[index] == data.info[key]['typename'] ? " selected" : "";
					opt.push('<option value="'+data.info[key]['id']+'"'+selected+'>'+data.info[key]['typename']+'</option>');
				}
				con.children("option").slice(1).remove();
				con.append(opt.join(""));

				if(addArr.length > 0 && (index+1) < addArr.length){
					$(".select_"+(index+1)).change();
				}
			}
		},
		error: function(msg){
			alert(msg.status+":"+msg.statusText);
		}
	});
}
