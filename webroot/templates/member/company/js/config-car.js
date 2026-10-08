$(function(){

	getEditor("note");

	$(".chosen-select").chosen();

	$('.switch').click(function(){
		var t = $(this);
		if(t.hasClass('open')){
			t.removeClass('open').next('.switch_text').text('关闭')
			// $('.closeinfo').html('<p>关闭后会员中心首页将同时隐藏模块内容，如果需要开启，请到管理中心开启模块</p>');
			$('.store_switch').val(0);
		}else{
			t.addClass('open').next('.switch_text').text('开启');
			$('.store_switch').val(1);
			// $('.closeinfo').html('');
		}
	})

	//地图标注
    var init = {
        popshow: function() {
            var src = "/api/map/mark.php?mod=tuan",
                address = $("#address").val(),
                lng = $("#lng").val(),
                lat = $("#lat").val();
            if(address != ""){
                src = src + "&address="+address;
            }
            if(lng != "" && lat != ""){
                src = src + "&lnglat="+lng+','+lat;
            }
            $("#markPopMap").after($('<div id="shadowlayer" style="display:block"></div>'));
            $("#markDitu").attr("src", src);
            $("#markPopMap").show();
        },
        pophide: function() {
            $("#shadowlayer").remove();
            $("#markDitu").attr("src", "");
            $("#markPopMap").hide();
        }
	};
	
	$(".map-pop .pop-close, #cloPop").bind("click", function(){
        init.pophide();
    });

    $("#mark").bind("click", function(){alert(22);
        init.popshow();
	});
	
	//时间
	var selectDate = function(el, func){
		WdatePicker({
			el: el,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			qsEnabled: false,
			dateFmt: 'HH:mm',
			onpicked: function(dp){
				$("#openStart").parent().siblings(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
			}
		});
	}
	$("#openStart").focus(function(){
		selectDate("openStart");
	});
	$("#openEnd").focus(function(){
		selectDate("openEnd");
	});
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
                        $('.w-form dd input#tel').css({'padding-left':'10px','width':'245px'});
                        return false;
                   }
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

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t       = $(this),
				title   = $("#title"),
				litpic  = $("#litpic"),
				license = $("#license"),
				tel     = $("#tel"),
				cityid  = 0,
				addrid  = 0,
				address = $("#address");

		if(t.hasClass("disabled")) return;

		var addrbtn = $('.addrBtn'), ids = addrbtn.attr('data-ids');
		if(ids == undefined || ids == ''){
			offsetTop = offsetTop == 0 ? addrbtn.offset().top : offsetTop;
			$('#cityid').val(0);
			$('#addrid').val(0);
		}else{
			cityid = ids.split(' ')[0];
			addrid = addrbtn.attr('data-id');
			$('#cityid').val(cityid);
			$('#addrid').val(addrid);
		}

		//获取图片的
        var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));


		var offsetTop = 0;

        //验证城市
        if(cityid == "" || cityid == 0){
            var dl = $("#cityid").closest("dl");
            dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+$("#cityid").attr("data-title"));
            offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
        }

		//公司名称
		if($.trim(title.val()) == "" || title.val() == 0){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['shop'][4][42]);
			offsetTop = offsetTop == 0 ? title.position().top : offsetTop;
		}

		//logo
		if($.trim(litpic.val()) == "" && offsetTop == 0){
			$.dialog.alert(langData['siteConfig'][27][88]);
			offsetTop = offsetTop == 0 ? $("#listSection1").position().top : offsetTop;
		}

		//联系方式
		if($.trim(tel.val()) == "" || tel.val() == 0){
			tel.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][433]);
			offsetTop = offsetTop == 0 ? tel.position().top : offsetTop;
		}

		//地址
		if($.trim(address.val()) == "" || address.val() == 0){
			address.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][27][58]);
			offsetTop = offsetTop == 0 ? address.position().top : offsetTop;
		}

		//营业执照
		if($.trim(license.val()) == "" && offsetTop == 0){
			$.dialog.alert(langData['siteConfig'][33][1]);
			offsetTop = offsetTop == 0 ? $("#listSection2").position().top : offsetTop;
		}



		ue.sync();

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action");
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: form.serialize(),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: data.info,
						ok: function(){}
					});
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][63]);
				$("#verifycode").click();
			}
		});


	});
});
