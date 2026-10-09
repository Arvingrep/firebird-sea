$(function(){ 
	 //获取报名人数
  $.ajax({
      url: "/include/ajax.php?service=house&action=bookingList&type=1&pageSize=1",
      dataType: "jsonp",
      success: function (data) {
          if(data.state == 100){
              $(".nin:eq(1)").html(data.info.pageInfo.totalCount);
          }
      }
  });
  
  
  $('.housetype').delegate('label','click',function(){
  	  if($(this).hasClass('chosed')){
  	  	$(this).removeClass('chosed')
  	  }else{
  	  	$(this).addClass('chosed')
  	  }
  })
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
        console.log(txt)
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code, #popupReg-captcha-mobile').hide();
        $('.mask-code').removeClass('show');
    })

// 错误提示
	function showMsg(str){
	  var o = $(".errorMsg");
	  o.html(str).show();
	  setTimeout(function(){o.hide()},1500);
	}
		
	$('.subbtn').bind('click',function(){
		var loupan =$('#loupan').val(),
			price = $('#price').val(),
			name = $('#name').val(),
			phone = $('#phone').val(),
			areaCode = $('#areaCode').val(),
			huxi = [];
			$('.form-baomin').find("input[type='checkbox']:checked").each(function(){
	            huxi.push($(this).val());
	        });
	     
			if(loupan==''){
				showMsg('请输入楼盘名');
				return false;
			}else if(price==''){
				showMsg('请输入价格');
				return false;
			}else if(name==''){
				showMsg('请输入名称');
				return false;
			}else if(phone==''){
				showMsg('请输入手机号');
				return false;
			}else if(!(/^1[34578]\d{9}$/.test(phone))){
				showMsg('你输入的手机格式错误');
				return false;
			};
			 var data = [];
	        data.push("type=1");
	        data.push("loupan="+loupan);
	        data.push("amount="+price);
	        data.push("huxi="+huxi);
	        data.push("name="+name);
	        data.push("mobile="+phone);
	        data.push("areaCode="+areaCode);
	        console.log(data)
	       $.ajax({
            url: "/include/ajax.php?service=house&action=booking&"+data.join("&"),
            type: "POST",
            dataType: "jsonp",
            success: function (data) {
                if(data.state == 100){
                    showMsg('提交成功，我们会尽快与您取得联系');
                    //setTimeout(function(){o.hide()},1500);
                }else{
                    showMsg(data.info);
                }
            },
            error: function(){
                showMsg('网络错误，提交失败！');
                
            }
        });
        return false;
	});
	
	
})
