$(function(){

	//图册放大

  	$(function() {
		$('.img_ul').viewer({
			url: 'data-original',
		});
	});


	//工地详情页预约参观
    $('.lr_content').delegate('.visit','click',function(){
    	$('.order_mask2').show();
    	var par = $(this).closest('.lr_content')
    	//参观工地
    	var h1 = par.find('.build_title');
    	var home_tit=h1.find('a').text();  	
    	$('.free_p .home_tit').text(home_tit);
    	//房屋类型
    	var home=par.find('.styles').text();  	
    	$('.free_p .home').text(home);
    	//建筑面积
    	var home_area=par.find('.area_num').text();  	
    	$('.free_p .home_area').text(home_area);
    	$('#conid').val($(this).attr("data-id"))

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


    //提交预约参观
	$(".submit").bind("click", function(){
		var f = $(this);
		var str = '',r = true;

		if(f.hasClass("disabled")) return false;


		// 称呼
		var name = $('#name');
		var namev = $.trim(name.val());
		if(namev == '') {
			if (r) {
				name.focus();
				errmsg(name, langData['renovation'][14][45]);//请填写您的称呼
			}
			r = false;
		}
		// 手机号
		var phone = $('#phone')
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
		$('.order_mask2').hide();	
		$('.order_mask3').show();
		
	});



})
