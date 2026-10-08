//主要是各页面的公用的一些事件
//房源标题填充
    $('input.space').change(function(){
    	autoTitle();
    });
    $('#price').change(function(){
    	autoTitle()
    });

 	// 错误提示
	function showMsg(str){
	  var o = $(".error");
	  o.html('<p>'+str+'</p>').show();
	  setTimeout(function(){o.hide()},1000);
	}

 function autoTitle(){
	var housename = $('#house_chosed').val();
	var space = $('#cf_space').val();
	var price =  $('#price').val();
	var room = $('.tip').text();
	var title =housename+' ';

    if($('.room-category .on').text()==langData['siteConfig'][44][70]){
        space = $('#tudi_space').val();
    }

    if(space == '' || space == undefined){
        space = $('#space').val();
    }

	if(space !='' && space != undefined && space != 0){
		title +=' '+ space+echoCurrency('areasymbol');
	}



	if(price !=''){
		if(price == 0){
			title +=' '+ langData['siteConfig'][51][16];  //价格面议
		}else{
			title +=' '+ price+$('#price').next('span').text();
		}
	}
//		console.log(space)
	$('#house_title').val(title);
  }
$(function(){

	//APP端取消下拉刷新
	toggleDragRefresh('off');

	//房源所在小区选择触发
	$('.posi_house').bind('click',function(){
		$(this).parents('.page').hide();
		$('.gz-address').css('z-index','50').show().find('#house_name').focus();
		$(window).scrollTop(0);
	});
	//选择地址的返回按钮
	$('.gz-address .go_back').click(function(){
		$(this).parents('.gz-address ').hide();
		$('.page.input_info').show();
	});
	//补充更多信息
	$('body').bind('click','.more_btn',function(){
		$(this).hide();
		$('.more_info ').show();
	});
	//全景图片、url切换
	$('.qjimg_box .active').bind('click',function(){
		$('#qj_type').val($(this).find('a').data('id'));
		$(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
		if($(this).find('a').data('id')==1){
			$('.url_box').show();
			$('#qjshow_box').hide();
		}else{
			$('.url_box').hide();
			$('#qjshow_box').show();
		}
	});

	//联系方式
	$('.user_sex .active').bind('click',function(){
		$(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
		$('#usersex').val($(this).find('a').data('id'));
	});
	$('.wx_phone .active').bind('click',function(){
		$(this).toggleClass('chose_btn');
		if($(this).hasClass('chose_btn')){
			$(this).find('#wx_tel').val('1')
		}else{
			$(this).find('#wx_tel').val('0')
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
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').hide();
                        $('.w-form .inp#tel').css({'width':'100%'});
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
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })



})
