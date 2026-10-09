$(function(){

	//数字滚动
	var sum = totalCount1;
	$(function() {
		setInterval(function(){
			show_num1(sum)
		},1000);
	});

	function show_num1(n) {
		sum=sum+1;
		var it = $(".t_num1 i");
		var len = String(n).length;
		for(var i = 0; i < len; i++) {
			if(it.length <= i) {
				$(".t_num1").append("<i></i>");
			}
			var num = String(n).charAt(i);
			//根据数字图片的高度设置相应的值
			var y = -parseInt(num) * 35;
			var obj = $(".t_num1 i").eq(i);
			obj.animate({
				backgroundPosition: '(0 ' + String(y) + 'px)'
			}, 'slow', 'swing', function() {});
		}
		$("#cur_num").val(n);
	}

	$(".img_list li:nth-child(4n)").css("margin-right","0");
	//国际手机号获取
	getNationalPhone();
	function getNationalPhone(){
	    $.ajax({
	            url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
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
  $('.areaCode').bind('click', function(){
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

    var areaIcode = $(".areaCode");
    areaIcode.find('i').html('+' + code);
    $('#areaCode').val(code);
  });

  $('body').bind('click', function(){
    $('.areaCode_wrap').fadeOut(300);
  });
	//获取装修报价
	$(".reno_submit").bind("click", function(){
		var f = $(this);
		var str = '',r = true;
		var areaCodev = $.trim($('#areaCode').val());
		if(f.hasClass("disabled")) return false;
		// 区域
		var addr1 = $('#addr1');
		if(addr1.val() == 0 || addr1.val() == "") {
			if (r) {
				errmsg(addr1, langData['renovation'][14][47]);//请选择区域
			}
			r = false;
		}
		// 街道
		var addr2 = $('#addr2');
      	if(!$('#addr1').hasClass('noSon')){  
          if(addr2.val() == 0 || addr2.val() == "") {
              if (r) {
                  errmsg(addr2, langData['renovation'][14][48]);//请选择街道
              }
              r = false;
          }
        }
		// 户型
		var house_type = $('#house_type');
		if(house_type.val() == 0 || house_type.val() == "") {
			if (r) {
				errmsg(house_type, langData['renovation'][4][33]);//请选择户型
			}
			r = false;
		}

		// 请输入面积
		var house_area = $('#house_area');
		var house_areav = $.trim(house_area.val());
		if(house_areav == '') {
			if (r) {
				house_area.focus();
				errmsg(house_area, langData['renovation'][9][28]);//请输入面积
			}
			r = false;
		}

		// 称呼
		var name = $('#price_name');
		var namev = $.trim(name.val());
		if(namev == '') {
			if (r) {
				name.focus();
				errmsg(name, langData['renovation'][14][45]);//请填写您的称呼
			}
			r = false;
		}
		// 手机号
		var phone = $('#price_phone')
		var phonev = $.trim(phone.val());
		if(phonev == '') {
			if (r) {
				phone.focus();
				errmsg(phone, langData['renovation'][12][0]);// 请输入手机号码
			}
			r = false;
		} else {
			var telReg = !!phonev.match(/^(13|14|15|17|18)[0-9]{9}$/);
			if(!telReg){
		    if (r) {
		    	phone.focus();
		    	errmsg(phone,langData['renovation'][14][46]);//请输入正确手机号码
		    }
		    r = false;
			}
		}
		
		

		if(!r) {
			return false;
		}		
		
		f.addClass("disabled").text(langData['renovation'][14][59]);//申请中...
		var data = [];	
      	if(!$('#addr1').hasClass('noSon')){  
			data.push("addrid="+addr2.val());
        }else{
          	data.push("addrid="+addr1.val());
        }
		data.push("units="+house_type.val());
		data.push("are="+house_area.val());
		data.push("people="+namev);
		data.push("contact="+phonev);
		data.push("type=3"); //没有预约对象
		data.push("resetype=1");
		data.push("areaCode="+areaCodev);
		$.ajax({
			url: "/include/ajax.php?service=renovation&action=sendRese",
			data: data.join("&"),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				f.removeClass("disabled").text(langData['renovation'][13][42]);//立即获取装修报价
				if(data && data.state == 100){
					$('.price_mask').show();
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert("网络错误，请重试！");
				f.removeClass("disabled").text(langData['renovation'][13][42]);//立即获取装修报价
			}
		});

	});

    //数量错误提示
	var errmsgtime;
	function errmsg(div,str){
		$('#errmsg').remove();
		clearTimeout(errmsgtime);
		var top = div.offset().top - 33;
		var left = div.offset().left;

		var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;line-height:30px;text-align:center;color:#f76120;font-size:14px;display:none;z-index:99999;background:#fff;padding:0 5px">' + str + '</div>';
		$('body').append(msgbox);
		$('#errmsg').fadeIn(300);
		errmsgtime = setTimeout(function(){
			$('#errmsg').fadeOut(300, function(){
				$('#errmsg').remove()
			});
		},2000);
	};



})
