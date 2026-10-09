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

	getEditor("note");


	//选择区域
	$("#selAddr .sel-group:eq(0) a").bind("click", function(){
		if($(this).attr("data-id") != $("#addrid").val()){
			var id = $(this).attr("data-id");
			$(this).closest(".sel-group").nextAll(".sel-group").remove();
			getChildAddr(id);
		}
	});

	if($("#addrid").val() != ""){
		var cid = 0;
		$("#selAddr .sel-menu li").each(function(){
			if($(this).text() == $("#addrname0").val()){
				cid = $(this).find("a").attr('data-id');
			}
		});
		if(cid != 0){
			getChildAddr(cid, $("#addrname1").val());
		}
	}

	//获取子级区域
	function getChildAddr(id, selected){
		if(!id) return;
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=marry&action=addr&type="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = data.info, html = [];

					html.push('<div class="sel-group">');
					html.push('<button type="button" class="sel">'+(selected ? selected : langData['siteConfig'][7][2])+'<span class="caret"></span></button>');
					html.push('<ul class="sel-menu">');
					for(var i = 0; i < list.length; i++){
						html.push('<li><a href="javascript:;" data-id="'+list[i].id+'">'+list[i].typename+'</a></li>');
					}
					html.push('</ul>');
					html.push('</div>');

					$("#addrid").before(html.join(""));
					if(!selected){
						$("#addrid").val(0);
							$("#addrid").closest("dd").find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][68]);
					}

				}
			}
		});
	}


	//地图标注
	var init = {
		popshow: function() {
			var src = "/api/map/mark.php?mod=marry",
					address = $("#address").val(),
					lnglat = $("#lnglat").val();
			if(address != ""){
				src = src + "&address="+address;
			}
			if(lnglat != ""){
				src = src + "&lnglat="+lnglat;
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

	$("#mark").bind("click", function(){
		init.popshow();
	});

	$("#okPop").bind("click", function(){
		var doc = $(window.parent.frames["markDitu"].document),
				lng = doc.find("#lng").val(),
				lat = doc.find("#lat").val(),
				address = doc.find("#addr").val();
		$("#lnglat").val(lng+","+lat);
		if($("#address").val() == ""){
			$("#address").val(address).blur();
		}
		init.pophide();
	});




	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();
		$('#addrid').val($('#selAddr .addrBtn').attr('data-id'));
        var addrids = $('#selAddr .addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
		var t           = $(this),
				company      = $("#company"),
				addrid      = $("#addrid"),
				address     = $("#address"),
				logo      = $("#logo"),
				pics      = $("#pics"),
				people      = $("#people"),
				contact     = $("#contact");
		var classfiy = $('.checkbox input:checkbox[checked]').val();

		var imgli = $("#listSection2 li");
		//店铺环境
        var picArr = [];
        imgli.each(function(){
            var src = $(this).find('img').attr('data-val');
            picArr.push(src);
        });
        $("#pics").val(picArr.join(','));
        //视频
        var video = "";
        if($("#listSection3 li").length){
            video = $("#listSection3 li").eq(0).children("video").attr("data-val");
        }
        $("#video").val(video);

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//公司名称
		if($.trim(company.val()) == "" || company.val() == 0){
			company.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['shop'][4][42]);
			offsetTop = offsetTop == 0 ? company.position().top : offsetTop;
		}

		//联系人
		if($.trim(people.val()) == "" || people.val() == 0){
			people.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['shop'][4][46]);
			offsetTop = offsetTop == 0 ? people.position().top : offsetTop;
		}

		//联系方式
		if($.trim(contact.val()) == "" || contact.val() == 0){
			contact.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][433]);
			offsetTop = offsetTop == 0 ? contact.position().top : offsetTop;
		}

		//区域
		if($.trim(addrid.val()) == "" || addrid.val() == 0){
			addrid.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][68]);
			offsetTop = offsetTop == 0 ? $("#selAddr").position().top : offsetTop;
		}

		//地址
		if($.trim(address.val()) == "" || address.val() == 0){
			address.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][69]);
			offsetTop = offsetTop == 0 ? address.position().top : offsetTop;
		}

		//经营类别
		if(classfiy == "" || classfiy == undefined){
			var tit = $('.checkbox').attr('data-title');
			$('.checkbox').siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+tit);
			offsetTop = offsetTop == 0 ? $('.checkbox').position().top : offsetTop;
		}

		//logo
		if($.trim(logo.val()) == ""){
			$.dialog.alert(langData['marry'][8][14]);//请上传店铺LOGO！
			offsetTop = offsetTop == 0 ? $("#filePicker1").position().top : offsetTop;
		}

		//店铺环境
		if($.trim(pics.val()) == ""){
			$.dialog.alert(langData['marry'][8][15]);//请上传店铺环境！
			offsetTop = offsetTop == 0 ? $("#filePicker2").position().top : offsetTop;
		}
		

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}
		var moud = [];
		$("input[name='bind_module[]']:checked").each(function (){
			var ttid = $(this).val();
			moud.push(ttid)
		})
		$('#cartoryM').val(moud.join(','));

		ue.sync();		

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
