$(function(){
	
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
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areaCode').hide();
                        $('.w-form .inp#tel').css({'padding-left':'10px','width':'175px'});
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                   }
                   $('.areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.areaCode_wrap ul').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！
                  }
            },
            error: function(){
                        $('.areaCode_wrap ul').html('<div class="loading">'+langData['siteConfig'][20][227]+'</div>');//网络错误，加载失败！
                    }

        })
    }
    //显示区号
    $('.areaCode').bind('click', function(e){
      console.log('codeclick')
        e.stopPropagation();
        var areaWrap =$(this).closest("dd").find('.areaCode_wrap');
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
        var par = t.closest("dd");
        var areaIcode = par.find(".areaCode");
        areaIcode.find('i').html('+' + code);
        $('#areaCode').val(code);
    });

    $('body').bind('click', function(){
        $('.areaCode_wrap').fadeOut(300);
    });

    //发车方式
	$(".startType span").bind("click", function(){
		if($(this).hasClass('curr')){
			return false;
		}
		var id = $(this).attr('data-id');
		$(this).addClass('curr').siblings('span').removeClass('curr');
		$(this).siblings("input[type=hidden]").val(id);
		if(id==0){//单次发车
			$('.time-div').show();
			if(doEdit==0){
				$('#startTime').val('');
				$('#clockChose').val('').attr('placeholder',langData['sfcar'][2][9])//请选择时间（选填）
			}			
			$('.time-div .tip-inline').css({'position':'relative','left':'auto'}).removeClass('success')			
			$('.clock-div').hide();
			$('.clock-div .tip-inline').remove();
		}else{//天天发车
			$('.time-div').hide();
			if(doEdit==0){
				$('#clockChose').val('').attr('placeholder',langData['sfcar'][2][10])//请选择时间（必填）
			}
			
			$('.clock-div').show().append('<span class="tip-inline"></span>');
		}
	});

	//出发日期
	$("#startTime").click(function(){
		WdatePicker({
			el: 'startTime',
			doubleCalendar: true,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			minDate: '%y-%M-%d',
			onpicking: function(dp){
				$('.clock-div').css('display','block');
				$("#clockChose").val('');
				$('.time-div .tip-inline').css({'position':'absolute','left':'410px'})

			}
		});
	});
	//选择时间弹窗
	$('#clockChose').on('click', function () {
		var tflag = 1,t = $(this),nowflag = 0,_that = this;
		t.toggleClass('on');
		if (!(t.hasClass('on'))) {
			tflag = 0;
		}
		$('html').addClass('noscroll');
		var dateVal = $('#startTime').val();
		if (new Date(dateVal).toDateString() === new Date().toDateString()) {
		    nowflag = 0;//选中日期 是今天
		}else{
			nowflag = 1;
		}
		var topn = t.offset().top - $(document).scrollTop() + 40;
		var leftn = t.offset().left;
		//数字为正整数，0表示当天可取
		// topn 当前位置-top
		// leftn 当前位置-left
		pickuptime.init(0, topn, leftn, tflag, nowflag, _that, function (data) {
			t.removeClass('on');
			$('html').removeClass('noscroll');
			var finalTime = data.replace('时',':').replace('分','')
			$("#clockChose").val(finalTime).addClass('has-cho');
			if($("#startType").val() == 1){//天天发车
				$('.clock-div .tip-inline').removeClass().addClass("tip-inline success").html("<s></s>");
			}

		});
	});


	$("body").on("click","input[name='flag[]']",function(){
        if ($(".mark.show input[name='flag[]']:checked").length > 3){
            alert("标签最多选择三个");
            return false;
        }
    })

    //途经地点
	$('.route').delegate('.inp','input propertychange',function(){
		var inpVal = $(this).val();
	    var par = $(this).closest('.route-div');
	    if(inpVal !=""){
	    	par.find('.del-route').show();
	    	par.addClass('has');
	    }else{
			par.find('.del-route').hide();
			par.removeClass('has');
	    }	      	   
	});
	//添加途经地点
	var rflag=1;
	$(".add-route").bind("click", function(event){
		var inpArray = [];
		$('.route-div').each(function(){
			var that = $(this).find('.inp');
			var inp = that.val();	 
			if(inp == ''){
				that.focus();
				rflag=0
				return false;
			}else{
				rflag=1
			}			
			inpArray.push(inp);	    			
		})
		var nary=inpArray.sort(); 
		for(var i=0;i<inpArray.length;i++){  
		    if ((nary[i]==nary[i+1])&&nary[i]!=''){  
				flag=0;
				alert(langData['sfcar'][0][72]);	//途经地点不能重复	        
				return false;

			 }
		}
		var inpLen = $('.route .route-div.has').length;
		if(rflag){
			if(inpLen < 10){
				//添加途径地点
				$(this).before('<div class="route-div"><input type="text" placeholder="'+langData['sfcar'][0][42]+'" class="inp"><i class="del-route"></i></div>');
				return false
			}else{
				alert('最多添加10个')
			}
		}
		
	})

	//删除途经地点
	$('.route').delegate('.del-route','click',function(e){
		var par = $(this).closest('.route-div');
		par.remove();
		var rLen = $('.route .route-div').length
		var lastInp = $('.route .route-div:last-child').find('.inp').val();
		if(rLen == 0){
			//添加途径地点
			$('.add-route').before('<div class="route-div"><input type="text" placeholder="'+langData['sfcar'][0][42]+'" class="inp"><i class="del-route"></i></div>');
		}
		e.stopPropagation();
	})
	//身份切换
	$('.fabutype span').bind('click',function(){
		if(doEdit ==1){
			return false;
		}
		var t = $(this),id = t.attr("data-id");
		t.addClass('curr').siblings().removeClass('curr');
		t.siblings("input[type=hidden]").val(id);
		checkUse()
	})

	if(dotype){
		$(".fabutype span[data-type='owner']").click()
	}
	if(startType){
		$(".startType #daydaycar").click()
	}
	
	//用途
	$(".usetype span").bind("click", function(){
		$(this).addClass('curr').siblings('span').removeClass('curr');
		var t = $(this),id = t.attr("data-id");
		t.siblings("input[type=hidden]").val(id);
		checkUse();
	});

	var yongtu = yt;
    checkUse();
	function checkUse(){
		var useType = $('.usetype span.curr').attr('data-type');//车的用途
		var userType  = $('.fabutype span.curr').attr('data-type');//用车人的身份
		if(doEdit ==0){//编辑状态下 不清空 0为发布状态
			$(".mark input:checkbox").removeAttr("checked");
		}
		
		//用车 载人
		if(userType == 'user'){//乘客
			if(useType == 'people'){//找车载人
				yongtu = 1;
				$('.people-wrap').show();//乘坐人数
				$('.carType-div,.seat-wrap').hide();//车型 座位数
				$('.mark').removeClass('show');//标签
				$('.user-car').addClass('show');//标签
			}else{//找车载货
				yongtu = 2;
				$('.people-wrap,.carType-div,.seat-wrap').hide();
				$('.mark').removeClass('show');
				$('.user-goods').addClass('show');
			}
			$('#dancar').click();
			$('.route-wrap,.startType').hide();
			$('.note').find('textarea').attr('placeholder',langData['sfcar'][0][50]);//例如：携带几件行李，最早/最晚出发时间/可随时出发，或其他需要补充说明的情况
		}else{//车主
			if(useType == 'people'){//找人
				yongtu = 3;
				$('.seat-wrap').show();
				$('.carType-div,.people-wrap').hide();
				$('.mark').removeClass('show');
				$('.owner-car').addClass('show');
			}else{//找货
				yongtu =4;
				$('.people-wrap,.seat-wrap').hide();
				$('.carType-div').show();
				$('.mark').removeClass('show');
				$('.owner-goods').addClass('show');
			}
			$('.route-wrap,.startType').show();
			$('.note').find('textarea').attr('placeholder',langData['sfcar'][1][9]);//例如：最早/最晚出发时间/可随时出发，或其他需要补充说明的情况

		}
	}
	$('.carType input:radio').bind('click',function(){
      	console.log(5555)
		var dd = $(this).closest('dd');
		dd.find('.tip-inline').removeClass().addClass("tip-inline success").html("<s></s>");
	})
	//表单提示 针对出发地和目的地为输入时
	$(".w-form").delegate(".fakeInp", "focus", function(){
		var t = $(this), dl = t.closest("dl"), name = t.attr("name"), tip = t.data("title"), hline = t.siblings(".tip-inline");
		hline.removeClass().addClass("tip-inline focus").html("<s></s>"+tip);
	});
	$(".w-form").delegate(".fakeInp", "blur", function(){
		var t = $(this), dl = t.closest("dl"), name = t.attr("name"), tip = t.data("title"), hline = t.siblings(".tip-inline");
		var text = t.text();
		if(text=='' || text==' '){
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tip);
		}else{
			hline.removeClass().addClass("tip-inline success").html("<s></s>");
		}
		
	});

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();
		$(".mark:not(.show) input:checkbox").removeAttr("checked");
		if(st==1){//出发地 目的地 是选择的
			if($('.startPlace').attr('data-id') !=''){
				//出发地
				$('#startaddr').val($('.startPlace.addrBtn').html());
				$('#startaddrid').val($('.startPlace.addrBtn').attr('data-id'));
			}
			if($('.endPlace').attr('data-id') !=''){
				//目的地
	        	$('#endaddr').val($('.endPlace.addrBtn').html());
	        	$('#endaddrid').val($('.endPlace.addrBtn').attr('data-id'));
			}
	        
	        //详细地址 选填
        	$('#startAdress').val($('.startAdress').text())
        	$('#endAddress').val($('.endAddress').text())
		}else{//出发地 目的地 是填写的
			$('#startaddr').val($('.startInput').text())
        	$('#endaddr').val($('.endInput').text())
		}
		

        
        //途经地 选填
        var userType  = $('.fabutype span.curr').attr('data-type');//用车人的身份
        if(userType == 'user'){
        	$('#way').val('')
        }else{
        	var ways = [];
	        $(".route").find('.has').each(function(){
	            var routeWay = $(this).find('.inp').val();
	            ways.push(routeWay);
	        });
	        $("#way").val(ways.join(','));
        }

		var t       = $(this),
				startaddr  	= $("#startaddr").val().trim(),//出发地
				endaddr   	= $("#endaddr").val().trim(),//目的地
				startType   = $("#startType").val(),//发车类型
				startTime   = $("#startTime").val(),//出发日期
				clock    	= $("#clockChose").val(),//出发时间
				peopleNum   = $(".peopleNum").val(),//乘坐人数
				seatNum    	= $(".seatNum").val(),//座位数
				usetype    	= $("#usetype").val(),//用途
				carstyle  	= $(".carType input:radio:checked").val(),
				tel     	= $("#tel");

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;
		
		if(st==1){//出发地 目的地 是选择的
			//验证区域 出发地
			if(startaddr == "" || startaddr == 0){
				$("#selAddr1 .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+$("#selAddr1 .sel-group:eq(0)").attr("data-title"));
				offsetTop = offsetTop == 0 ? $("#selAddr1").offset().top : offsetTop;
			}
			//验证区域 目的地
			if(endaddr == "" || endaddr == 0){
				$("#selAddr2 .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+$("#selAddr2 .sel-group:eq(0)").attr("data-title"));
				offsetTop = offsetTop == 0 ? $("#selAddr2").offset().top : offsetTop;
			}
			//验证区域 目的地和出发地不能相同
			if((endaddr != "" || endaddr != 0) && (startaddr != "" || startaddr != 0) && (startaddr == endaddr)){
				//请选择不同的出发地和目的地
				$("#selAddr2 .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['sfcar'][0][2]);
				offsetTop = offsetTop == 0 ? $("#selAddr2").offset().top : offsetTop;
			}
		}else{////出发地 目的地 是填写的
			if(startaddr == ""){
				$(".sAddr .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+$(".startInput").attr("data-title"));
				offsetTop = offsetTop == 0 ? $(".sAddr").offset().top : offsetTop;
			}

			if(startaddr == ""){
				$(".eAddr .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+$(".endInput").attr("data-title"));
				offsetTop = offsetTop == 0 ? $(".eAddr").offset().top : offsetTop;
			}
			//验证区域 目的地和出发地不能相同
			if((endaddr != "" || endaddr != 0) && (startaddr == endaddr)){
				//请填写不同的出发地和目的地
				$(".eAddr .tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['sfcar'][2][38]);
				offsetTop = offsetTop == 0 ? $(".eAddr").offset().top : offsetTop;
			}

		}
	
		
		//单次发车 验证出发日期 
		if(startType == 0 && startTime == ''){
			var txt = $("#startTime").attr("data-title"), dd = $("#startTime").closest(".time-div");
			dd.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+txt);
			offsetTop = offsetTop == 0 ? $(".time-wrap").offset().top : offsetTop;
		}
		//天天发车 验证出发时间
		if(startType == 1 && clock == ''){
			var txt = $(".clock").attr("data-title"), dd = $(".clock").closest(".clock-div");
			dd.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+txt);
			offsetTop = offsetTop == 0 ? $(".time-wrap").offset().top : offsetTop;
		}

		//验证用途 用车 找乘用车
		if(yongtu == 1 && (peopleNum == '' || peopleNum == 0)){
			var txt = $(".peopleNum").attr("data-title"), dd = $(".peopleNum").closest("dd");
			dd.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+txt);
			offsetTop = offsetTop == 0 ? $(".people-wrap").offset().top : offsetTop;
		}
		//验证用途 车主 找乘客
		if(yongtu == 3 && (seatNum == '' || seatNum == 0)){
			var txt = $(".seatNum").attr("data-title"), dd = $(".seatNum").closest("dd");
			dd.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+txt);
			offsetTop = offsetTop == 0 ? $(".seat-wrap").offset().top : offsetTop;
		}
		//验证用途 车主 找货
		if(yongtu == 4 && (carstyle == '' || carstyle == undefined)){
			var dd = $(".carType").closest("dd");
			dd.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请选择车型");
			offsetTop = offsetTop == 0 ? $(".carType").offset().top : offsetTop;
		}


		//验证手机号码
		var exp = new RegExp("^" + telRegex + "$", "img");
		if(!exp.test(tel.val())){
			tel.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+telErrTip);
			offsetTop = offsetTop == 0 ? tel.offset().top : offsetTop;
		}

		console.log(offsetTop);
		if(offsetTop){
			$('html, body').animate({scrollTop: offsetTop - 5}, 300);
			return false;
		}


		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize();
		console.log(data);
		//return false;
		
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中

		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					if(data.info.arcrank =='1'){
						var urlNew = fabuSuccessUrl.replace("%id%", data.info.aid);
		            	url = urlNew;
		            }
					fabuPay.check(data, url, t);

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即发布
					$("#verifycode").click();//更新验证码
				}

			},
			error: function(){
				$.dialog.alert(langData['sfcar'][2][44]);//发布失败
				t.removeClass("disabled").html(langData['siteConfig'][11][19]);//立即发布
				$("#verifycode").click();//更新验证码
			}
		});


	});
	//视频预览
	$("#listSection3").delegate(".enlarge", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href");

		window.open(href, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

});
//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
	console.log(obj);
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<a href="/include/videoPreview.php?f=" data-id="'+file+'">预览视频</a>');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: contents");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}
//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "info",
		type: "delVideo",
		picpath: b,
		randoms: Math.random()
	};
	$.ajax({
		type: "POST",
		cache: false,
		async: d,
		url: "/include/upload.inc.php",
		dataType: "json",
		data: $.param(g),
		success: function(a) {
			try {
				c(a)
			} catch(b) {}
		}
	})
}
