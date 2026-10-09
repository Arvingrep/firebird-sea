$(function(){
	$(".area_type ul li:nth-child(4n)").css("margin-right","0");
	$(".choose ul li:nth-child(5n)").css("margin-right","0");


    $('.area_type li').click(function(){
    	$(this).addClass('active').siblings().removeClass('active');
    	if($(this).hasClass('publicS')){
    		$('.self_ul').hide();
    		$('.pub_ul').show();
    	}else{
    		$('.self_ul').show();
    		$('.pub_ul').hide();
    	}
    })

    $('.house_type li').click(function(){
    	$(this).addClass('active').siblings().removeClass('active');
    })
    $('.choose li').click(function(){
    	$(this).addClass('active').siblings().removeClass('active');
    })
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
	    var par = $(this).closest('form');
	    var areaWrap =par.find('.areaCode_wrap');
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
	    var par = t.closest('form');
	    var areaIcode = par.find(".areaCode");
	    areaIcode.find('i').html('+' + code);
	    par.find('.areaCodeinp').val(code);
	  });

	  $('body').bind('click', function(){
	    $('.areaCode_wrap').fadeOut(300);
	  });

    //进行的下一步
    $('.conduct').click(function(){
    	if(!$('.area_type li').hasClass('active')){
    		alert(langData['renovation'][4][32]);//请选择装修类型
    		return false;
    	}
    	if(!$('.house_type li').hasClass('active')){
    		alert(langData['renovation'][4][33]);//请选择户型
    		return false;
    	}
    	$('.impor').addClass('active').siblings().removeClass('active');
    	$('.attent_con').addClass('smart_show').siblings().removeClass('smart_show');
    })

    //注重的下一步
    $('.attent').click(function(){
    	if(!$('.choose li').hasClass('active')){
    		alert(langData['renovation'][4][34]);//请选择装修事项
    		return false;
    	}
    	$('.place').addClass('active').siblings().removeClass('active');
    	$('.place_con').addClass('smart_show').siblings().removeClass('smart_show');
    })

    //注重的上一步
    $('.attent2').click(function(){
    	$('.coming').addClass('active').siblings().removeClass('active');
    	$('.coming_con').addClass('smart_show').siblings().removeClass('smart_show');
    })

    //提交的上一步
    $('.submit2').click(function(){
    	$('.impor').addClass('active').siblings().removeClass('active');
    	$('.attent_con').addClass('smart_show').siblings().removeClass('smart_show');
    })

    //提交
    $('.vill_submit').click(function(){
    	var f = $(this);
		var str = '',r = true;
		var txt = f.text();
		if(f.hasClass("disabled")) return false;
		var par = f.closest('.formCommon').find('form');
		var areaCodev = par.find('.areaCodeinp').val();

		var type 	= $(".house_type li.active").attr("data-id");
		var style 	= $(".choose li.active").attr("data-id");

		var stype 	= $(".area_type li.active").find('p').text();
		var ssType 	= $(".area_type li.active").attr('data-type')
		var style   = $(".attent_con  li.active").attr("data-id");

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
          // if(addr2.val() == 0 || addr2.val() == "") {
          //     if (r) {
          //         errmsg(addr2, langData['renovation'][14][48]);//请选择街道
          //     }
          //     r = false;
          // }
        }
		// 名字
		var name = $('#name');
		var namev = $.trim(name.val());
		// if(namev == '') {
		// 	if (r) {
		// 		name.focus();
		// 		errmsg(name, langData['renovation'][14][45]);//请填写您的称呼
		// 	}
		// 	r = false;
		// }
		// 手机号
		var phone = $('#phone')
		var phonev = $.trim(phone.val());
		if(phonev == '') {
			if (r) {
				phone.focus();
				errmsg(phone, langData['renovation'][12][0]);// 请输入手机号码
			}
			r = false;
		}
		// 小区名字
		var vill_name = $('#vill_name');
		var vill_namev = $.trim(vill_name.val());
		// if(vill_namev == '') {
		// 	if (r) {
		// 		vill_name.focus();
		// 		errmsg(vill_name, langData['renovation'][1][5]);//请填写您的小区
		// 	}
		// 	r = false;
		// }


		if(!r) {
			return false;
		}
		f.addClass("disabled").text(langData['renovation'][14][61]);//智能选择中...

		//var select_l = $("#addr1 .selected").text();
		var select_l = $("#addr1").find("option:selected").text();
		var select_r = $("#addr2").find("option:selected").text();
      	if(!$('#addr1').hasClass('noSon')){
			var address  = select_l+"  "+select_r;
        }else{
          	var address  = select_l;
        }
		var data = [];
		data.push("community="+vill_namev);
		data.push("address="+address);
		data.push("people="+namev);
		data.push("areaCode="+areaCodev);
		data.push("contact="+phonev);
		data.push("stype="+stype);
		data.push("style="+style);
        // if(!$('#addr1').hasClass('noSon')){
        //   data.push("addrid="+addr2.val());
        // }else{
        //   data.push("addrid="+addr1.val());
        // }

		if(addr2.val()){
			data.push("addrid="+addr2.val());
		}else{
			data.push("addrid="+addr1.val());
		}



		if(ssType ==1){
			data.push("jiastyle="+type);
		}else{
			data.push("comstyle="+type);
		}
		var param = data.join("&");
		location.href = channelDomain+"/smart_result.html?"+param;

    })

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
