$(function(){


    // 选择装修
    $('.content .house_style li').click(function(){
        $(this).toggleClass('active').siblings().removeClass('active');
      	if($(this).hasClass('publicS')){
          $('.type_choose').text(langData['renovation'][15][79]);//选择家装类型
    		$('.self_ul').hide();
    		$('.pub_ul').show();
    	}else{
          	$('.type_choose').text(langData['renovation'][5][11]);//选择户型
    		$('.self_ul').show();
    		$('.pub_ul').hide();
    	}
    });
    // 选择户型
    $('.content .house_type li').click(function(){
        $(this).toggleClass('active').siblings().removeClass('active')
    });
    // 风格
    $('.comp_content .reno_style li').click(function(){
		$(this).toggleClass('active').siblings().removeClass('active')
    });
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
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').hide();
                        return false;
                   }
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
        var par = $('.formCommon')
        var arcode = par.find('.areacode_span')
        arcode.find("label").text(txt);
        par.find(".areaCodeinp").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }

    //表单验证
     $('.reno_submit').click(function(){
        var f = $(this);
        var place_name = $('#place_name').val();
        var your_name = $('#your_name').val();
        var place_phone = $('#place_phone').val();
        var txt = f.text();
        if(f.hasClass("disabled")) return false;
        var par = f.closest('.formCommon');
        var areaCodev = $.trim(par.find('.areaCodeinp').val());
        var addrid = par.find('.gz-addr-seladdr').attr('data-id');
       var address= par.find('.city').text();
        // if(!($('.house_style li').hasClass('active'))){
        //     showMsg(langData['renovation'][4][32]);  //请选择装修类型

        // }else if(!($('.house_type li').hasClass('active'))){
        //     showMsg(langData['renovation'][4][33]);  //请选择户型

        // }else if(!($('.reno_style li').hasClass('active'))){
        //     showMsg(langData['renovation'][15][78]);  //请选择装修风格

        // }else 
		if(!addrid){
            showMsg(langData['renovation'][2][36]);  //请选择所在区域
            
        }
		// else if(!place_name){
  //            showMsg(langData['renovation'][1][25]);  //请输入小区名称
           
  //       }else if(!your_name){
  //            showMsg(langData['renovation'][1][27]);  //请输入您的称呼
           
  //       }
		else if(!place_phone){
             showMsg(langData['renovation'][1][29]);  //请输入联系方式
           
        }else{
            f.addClass("disabled").text(langData['renovation'][14][61]);//智能选择中...
          var stype = $('.house_style li.active').find('p').text();//家装 公装
          var style = $('.reno_style li.active').attr('data-id');//风格
          var type = $('.house_type li.active').attr('data-id');//户型 公装类型
          var ssType = $('.house_style li.active').attr('data-type');////家装 公装
            var data = [];
            data.push("community="+place_name);
            data.push("address="+address);
            data.push("addrid="+addrid);
            data.push("people="+your_name);
            data.push("areaCode="+areaCodev);
            data.push("contact="+place_phone);                  
            data.push("stype="+stype);
            data.push("style="+style);
            if(ssType ==1){
                data.push("jiastyle="+type);
            }else{
                data.push("comstyle="+type);
            }
			var param = data.join("&");
			location.href = channelDomain+"/smart_result.html?"+param
            

        }

     })




})