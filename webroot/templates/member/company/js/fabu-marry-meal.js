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
                        $('.w-form dd input#contact').css({'padding-left':'10px','width':'215px'});
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
    //图文详情
    getEditor("notepics");

	//表单提示
	$(".filterWrap").delegate("select", "change", function(){
		var t = $(this), dl = t.closest("dl"), tip = t.data("title"), hline = dl.find(".tip-inline");
		
		if(dl.attr("data-required") == 1){
			if($.trim(t.val()) == ""){
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tip);
			}else{
				hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
				
			}
		}
	});
	$('.tChoose').off('click').click(function(){
		if($(this).hasClass('hasClick')){
			$(this).removeClass('hasClick');
			$('.seList').hide();
		}else{
			$(this).addClass('hasClick');
			$('.seList').show();
		}
	})
	$('.seList p').click(function(){
		var tet = $(this).text(),tid = $(this).attr('data-value');
		var that = $(this);
		if(!that.hasClass('selected')){
			$('.delMask').addClass('show');
			$('.delAlert').show();
			//关闭删除
			$('.cancelDel,.delMask').one("click",function(){//取消更改婚嫁分类
				$('.delMask').removeClass('show');
				$('.delAlert').hide();
				$('.seList').hide();
				$('.tChoose').removeClass('hasClick');

			})

			$('.sureDel').one("click",function(){//确定更改婚嫁分类
				$('.delMask').removeClass('show');
				$('.delAlert').hide();
				that.addClass('selected').siblings().removeClass('selected');
				$('#typename').val(tet);
				$('#typeid').val(tid);
				
				//筛选
		        $('.filterWrap .info').hide();
		        $('.filterWrap .filter-'+tid).show();

		        //基本参数
		        $('.cominfo').hide();
		        $('.parm-'+tid).show();

		        $('.seList').hide();
				$('.tChoose').removeClass('hasClick');

				ue.setContent('');//切换类型时 清空编辑器的内容
			})

		}else{
			$('.seList').hide();
			$('.tChoose').removeClass('hasClick');
		}

		

	})

	$("#selTeam").delegate("select", "change", function(){
		var t = $(this), dl = t.closest("dl"), tip = t.data("title"), hline = dl.find(".tip-inline");
		var tId = t.val();	
		if($.trim(t.val()) == ""){
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tip);
		}else{
			hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
			$.dialog.alert('更改分类后资料将重新填写');//请至少上传一张图片
			//筛选
            $('.filterWrap .info').hide();
            $('.filterWrap .filter-'+tId).show();

            //基本参数
            $('.cominfo').hide();
            $('.parm-'+tId).show();
		}
		
	});



	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t        = $(this),				
			comname    = $("#comname"),		
			price    = $("#price"),																		
			contact    = $("#contact"),									
			typeid    = $("#typeid");										
		var type = $('#typeid').val();			
		//其他验证项 filter
        var  hstyle =  $('#hstyle'),//主持人-风格
             cartype =  $('#cartype'),//婚车-类型
             planstyle =  $('#planstyle'),//婚礼策划-风格
             plantype =  $('#plantype'),//婚礼策划-类别
             plancolor =  $('#plancolor'),//婚礼策划-颜色
             gownstyle =  $('#gownstyle'),//婚纱摄影 - 风格
             gownscene =  $('#gownscene'),//婚纱摄影 - 场景
             phototype =  $('#phototype'),//摄影跟拍-类型
             photostyle =  $('#photostyle'),//摄影跟拍- 风格
             material =  $('#material'),//珠宝首饰-材质
             jewelrytype =  $('#jewelrytype'),//珠宝首饰-类型
             videotype =  $('#videotype'),//摄像跟拍-类型
             videostyle =  $('#videostyle'),//摄像跟拍-风格
             mkstyle =  $('#mkstyle'),//新娘跟妆-风格
             drstyle =  $('#drstyle');//婚纱礼服-款式

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		if($.trim(typeid.val()) == ""){
			var hline = typeid.closest('dd').find(".tip-inline"), tips = typeid.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? typeid.position().top : offsetTop;
		}else{
			var hline = typeid.closest('dd').find(".tip-inline");
			hline.removeClass().addClass("tip-inline success").html("<s></s>");
		}

		if($.trim(comname.val()) == ""){
			var hline = comname.next(".tip-inline"), tips = comname.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? comname.position().top : offsetTop;
		}

		if($.trim(price.val()) == ""){
			var hline = price.closest('dd').find(".tip-inline"), tips = price.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? price.position().top : offsetTop;
		}

		//主持人
		if(type == 6){
			if($.trim(hstyle.val()) == ""){
				var hline = hstyle.next(".tip-inline"), tips = hstyle.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? hstyle.position().top : offsetTop;
			}else{
				var hline = hstyle.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}
		}

		//婚车
		if(type == 3){
			if($.trim(cartype.val()) == ""){
				var hline = cartype.next(".tip-inline"), tips = cartype.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? cartype.position().top : offsetTop;
			}else{
				var hline = cartype.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}
		}

		//婚礼策划
		if(type == 2){
			if($.trim(planstyle.val()) == ""){//风格
				var hline = planstyle.next(".tip-inline"), tips = planstyle.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? planstyle.position().top : offsetTop;
			}else{
				var hline = planstyle.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}

			if($.trim(plantype.val()) == ""){//类别
				var hline = plantype.next(".tip-inline"), tips = plantype.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? plantype.position().top : offsetTop;
			}else{
				var hline = plantype.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}

			if($.trim(plancolor.val()) == ""){//颜色
				var hline = plancolor.next(".tip-inline"), tips = plancolor.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? plancolor.position().top : offsetTop;
			}else{
				var hline = plancolor.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}
		}

		//婚纱摄影
		if(type == 4){
			if($.trim(gownstyle.val()) == ""){//风格
				var hline = gownstyle.next(".tip-inline"), tips = gownstyle.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? gownstyle.position().top : offsetTop;
			}else{
				var hline = gownstyle.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}

			if($.trim(gownscene.val()) == ""){//场景
				var hline = gownscene.next(".tip-inline"), tips = gownscene.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? gownscene.position().top : offsetTop;
			}else{
				var hline = gownscene.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}
		}

		//摄影跟拍
		if(type == 5){
			if($.trim(phototype.val()) == ""){//类型
				var hline = phototype.next(".tip-inline"), tips = phototype.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? phototype.position().top : offsetTop;
			}else{
				var hline = phototype.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}

			if($.trim(photostyle.val()) == ""){//风格
				var hline = photostyle.next(".tip-inline"), tips = photostyle.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? photostyle.position().top : offsetTop;
			}else{
				var hline = photostyle.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}			
		}

		//珠宝首饰
		if(type == 7){
			if($.trim(material.val()) == ""){//材质
				var hline = material.next(".tip-inline"), tips = material.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? material.position().top : offsetTop;
			}else{
				var hline = material.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}

			if($.trim(jewelrytype.val()) == ""){//类型
				var hline = jewelrytype.next(".tip-inline"), tips = jewelrytype.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? jewelrytype.position().top : offsetTop;
			}else{
				var hline = jewelrytype.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}			
		}
		//摄像跟拍
		if(type == 8){
			if($.trim(videotype.val()) == ""){//类型
				var hline = videotype.next(".tip-inline"), tips = videotype.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? videotype.position().top : offsetTop;
			}else{
				var hline = videotype.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}

			if($.trim(videostyle.val()) == ""){//风格
				var hline = videostyle.next(".tip-inline"), tips = videostyle.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? videostyle.position().top : offsetTop;
			}else{
				var hline = videostyle.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}			
		}

		//新娘跟妆
		if(type == 9){
			if($.trim(mkstyle.val()) == ""){//风格
				var hline = mkstyle.next(".tip-inline"), tips = mkstyle.data("title");
				hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
				offsetTop = offsetTop == 0 ? mkstyle.position().top : offsetTop;
			}else{
				var hline = mkstyle.next(".tip-inline");
				hline.removeClass().addClass("tip-inline success").html("<s></s>");
			}		
		}

		//婚纱礼服
	

		//联系方式
		if($.trim(contact.val()) == "" || contact.val() == 0){
			contact.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][433]);
			offsetTop = offsetTop == 0 ? contact.position().top : offsetTop;
		}
	
		

		if($('#listSection1 .pubitem').length == 0){
			$.dialog.alert(langData['marry'][4][8]);//请至少上传一张图片
			offsetTop = $("#selTeam").position().top;
		}
		//案例图集
        var pics = [];
        $("#listSection1").find('.pubitem').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#pics").val(pics.join(','));

        ue.sync();

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}


		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize();
		var tzUrl = mealUrl.replace('%typeid%',type);
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		if (stypeid == 7){
			action = '/include/ajax.php?service=marry&action=operHost&oper='+editFlag;
		}else if (stypeid == 10){
			action = '/include/ajax.php?service=marry&action=operRental&oper='+editFlag;
		}else {
			action;
		}
		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					var tip = langData['siteConfig'][20][341];
					if(id != undefined && id != "" && id != 0){
						tip = langData['siteConfig'][20][229];
					}

					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: tip,
						ok: function(){
							location.href = tzUrl;
						}
					});

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['shop'][1][7]);
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['shop'][1][7]);
				$("#verifycode").click();
			}
		});

	});

});
