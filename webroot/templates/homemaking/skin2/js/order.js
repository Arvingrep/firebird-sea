$(function(){


	//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: langData['siteConfig'][6][92]+"<small>（"+langData['siteConfig'][23][102]+"）</small>",   //标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）
			content: 'url:'+masterDomain + '/api/map/mark.php?mod=homemaking&lnglat='+$("#lnglat").val()+"&city="+map_city+"&addr="+$("#address").val(),
			width: 800,
			height: 500,
			max: true,
			ok: function(){
				var doc = $(window.parent.frames["markDitu"].document),
					lng = doc.find("#lng").val(),
					lat = doc.find("#lat").val(),
					addr = doc.find("#addr").val();
				$("#lnglat").val(lng+","+lat);
				if($("#address").val() == ""){
					$("#address").val(addr);
				}
			},
			cancel: true
		});
	});


	var addrid = 0, addArr = [];
	setTimeout(function(){
		$("#usePcount, #useBcount, #paypwd").val("");
	}, 500);

	//设置默认地址
	$(".part1Con").delegate(".setAddress", "click", function(){
		var $address=$(this);
		$address.text(langData['shop'][5][14]).parents("dl").siblings("dl").find("a.setAddress").text(langData['shop'][5][15]);
		$address.parents("dl").addClass("on").siblings("dl").removeClass("on");
		$("#addressid").val($address.closest("dl").attr("data-id"));
	});

	$(".part1Con").delegate("dt", "click", function(){
		var $dt=$(this);
		$dt.parents("dl").addClass("on").siblings("dl").removeClass("on");
		$("#addressid").val($dt.closest("dl").attr("data-id"));
	});

	$("#addressid").val($(".part1Con .on").data("id"));

	//添加地址
	$(".part1Con .add").on("click",function(){
		$(".popCon .tip .left").html(langData['siteConfig'][6][96]);
		$("#bg,.popup").show();
	});

	//修改地址
	$(".part1Con").delegate(".revise", "click", function(){
		var t = $(this), dl = t.closest("dl");
		addrid = dl.attr("data-id");
		$(".popCon .tip .left").html(langData['shop'][5][76]);
		$("#bg,.popup").show();

		//填充数据
		$("#person").val(dl.attr("data-name"));
		$("#mobile").val(dl.attr("data-mobile"));
		$("#tel").val(dl.attr("data-tel"));
		$("#address").val(dl.attr("data-address"));
		$("#lnglat").val(dl.attr("data-lng") + ',' + dl.attr("data-lat"));
		var codeNew = dl.attr("data-code");
		if(codeNew != ''){
			$("#areaCode").val(codeNew);
			$('.areaCode i').text("+"+codeNew);
		}else{
			$("#areaCode").val('86');
			$('.areaCode i').text("+86");
		}

		addArr = dl.attr("data-addr").split(" ");
		$("#addrlist select:eq(0) option").each(function(){
			if($(this).text() == addArr[0]){
				$(this).attr("selected", true);
			}
		});
		$("#addrlist select:eq(0)").change();

	});

	//关闭弹出层
	$(".popup .tip i").on("click",function(){
		$("#bg,.popup").hide();

		//清空表单数据
		$(".popCon input").val("");
		var codeOld = $('.areaCode_wrap li:first-child').data('code');//区号恢复默认值
		$(".areaCode i").text("+"+codeOld);
		$('#areaCode').val(codeOld);
		$(".popCon .error").removeClass("error");
		$("#addrlist select:eq(0)").nextAll("select").remove();
		$("#addrlist select:eq(0) option:eq(0)").attr("selected", true);
		$("#mobile").next(".input-tips").show().html('<s></s>'+langData['siteConfig'][20][581]);
	});


	//新地址表单验证
	var inputVerify = {
		addrid: function(){
			if($("#addrlist select:last").val() == 0){
				$("#addrlist").parents("li").addClass("error");
				return false;
			}
			return true;
		}
		,address: function(){
			var t = $("#address"), val = t.val(), par = t.closest("li");
			if(val.length < 5 || val.length > 60 || /^\d+$/.test(val)){
				par.addClass("error");
				return false;
			}
			return true;
		}
		,person: function(){
			var t = $("#person"), val = t.val(), par = t.closest("li");
			if(val.length < 2 || val.length > 15){
				par.addClass("error");
				return false;
			}
			return true;
		}
		,mobile: function(){
			var t = $("#mobile"), val = t.val(), par = t.closest("li");
			if(val == ""){
				par.addClass("error");
				par.find(".input-tips").html("<s></s>"+langData['siteConfig'][20][581]).show();
				return false;
			}else{
				par.find(".input-tips").hide();

			}
			return true;
		}
		,tel: function(){
			var t = $("#tel"), val = t.val(), par = t.closest("li");
			if($("#mobile").val() == "" && val == ""){
				par.addClass("error");
				return false;
			}
			return true;
		}

	}


	//区域
	$("#addrlist").delegate("select", "change", function(){
		var sel = $(this), id = sel.val(), index = sel.index();
		if(id == 0){
			sel.closest("li").addClass("error");
			sel.nextAll("select").remove();
		} else if(id != 0 && id != ""){
			$.ajax({
				type: "GET",
				url: masterDomain+"/include/ajax.php",
				data: "service=siteConfig&action=addr&son=0&type="+id,
				dataType: "jsonp",
				success: function(data){
					var i = 0, opt = [];
					if(data instanceof Object && data.state == 100){
						for(var k = 0; k < data.info.length; k++){
							var selected = addArr.length > 0 && addArr[index+1] == data.info[k]['typename'] ? " selected" : "";
							opt.push('<option value="'+data.info[k]['id']+'"'+selected+'>'+data.info[k]['typename']+'</option>');
						}
						sel.nextAll("select").remove();
						$("#addrlist").append('<select name="addrid[]"><option value="0">'+langData['siteConfig'][23][118]+'</option>'+opt.join("")+'</select>');
						sel.closest("li").addClass("error");

						if(addArr.length > 0){
							$("#addrlist select:last").change();
						}
					}else{
						sel.closest("li").removeClass("error");
					}
				},
				error: function(msg){
					alert(msg.status+":"+msg.statusText);
				}
			});
		}
	});

	$(".popCon input").bind("click", function(){
		$(this).closest("li").removeClass("error");
		if($(this).attr("id") == "mobile"){
			$("#tel").closest("li").removeClass("error");
		}
		if($(this).attr("id") == "tel"){
			$("#mobile").closest("li").removeClass("error");
			$("#mobile").closest("li").find(".input-tips").hide();
		}
	});

	$(".popCon input").bind("blur", function(){
		var id = $(this).attr("id");

		if((id == "address" && inputVerify.address()) ||
			 (id == "person" && inputVerify.person()) ||
			 (id == "mobile" && inputVerify.mobile()) ){

			$(this).closest("li").removeClass("error");
		}

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
	    $('#areaCode').val(code)
	  });

	  $('body').bind('click', function(){
	    $('.areaCode_wrap').fadeOut(300);
	  });


	//提交新增/修改
	$("#submit").bind("click", function(){


		var t = $(this);
		if(t.hasClass("disabled")) return false;

		//验证表单
		if( inputVerify.person() &&inputVerify.mobile() && inputVerify.addrid() && inputVerify.address()){
			var data = [];
			data.push('id='+addrid);
			data.push('addrid='+$("#addrlist select:last").val());
			data.push('address='+$("#address").val());
			data.push('person='+$("#person").val());
			data.push('mobile='+$("#mobile").val());
			data.push('areaCode='+$("#areaCode").val());
			data.push('tel='+$("#tel").val());
			data.push('lnglat='+$("#lnglat").val());
			data.push('module=homemaking');

			t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

			$.ajax({
				url: masterDomain+"/include/ajax.php?service=member&action=addressAdd",
				data: data.join("&"),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){

						//操作成功后关闭浮动层
						$(".popup .tip i").click();

						$(".part1Con dl").remove();
						$(".part1Con").prepend('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');

						//异步加载所有地址
						$.ajax({
							url: masterDomain+"/include/ajax.php?service=member&action=address",
							type: "POST",
							dataType: "jsonp",
							success: function (data) {
								if(data && data.state == 100){

									$(".part1Con .loading").remove();
									var list = [], addList = data.info.list;

									for(var i = 0; i < addList.length; i++){

										on = (i == 0 && addrid == 0) || (addrid == addList[i].id) ? 1 : 0;
										list.push('<dl'+(on ? " class='on'" : "")+' data-id="'+addList[i].id+'" data-name="'+addList[i].person+'" data-mobile="'+addList[i].mobile+'" data-tel="'+addList[i].tel+'" data-addr="'+addList[i].addrname+'" data-address="'+addList[i].address+'" data-lng="'+addList[i].lng+'" data-lat="'+addList[i].lat+'" data-code="'+addList[i].areaCode+'">');
										list.push('<dt><i></i>');

										contact = addList[i].mobile != "" && addList[i].tel != "" ? addList[i].mobile : (addList[i].mobile == "" && addList[i].tel != "" ? addList[i].tel : addList[i].mobile);
										var areaCode =addList[i].areaCode;
										var code = '';
										if(areaCode != '' && areaCode !='86'){
											code = '+'+areaCode;
										}

										list.push('<div class="name"><p>'+addList[i].person+'</p>  <p class="addr_tel">'+code+' '+contact+'</p></div>');
										list.push('<p class="address"><span>'+addList[i].addrname.replace(/\s+/g, '</span><span>')+'</span></p>');
										list.push('<p class="detail">'+addList[i].address+'</p>');
										list.push('</dt>');
										list.push('<dd><a class="revise" href="javascript:;">'+langData['siteConfig'][6][6]+'</a></dd>');//编辑
										list.push('</dl>');
									}

									$(".part1Con").prepend(list.join(""));
									addrid = 0;
									addArr = [];

									t.removeClass("disabled").html(langData['shop'][5][32]);
									$("#addressid").val($(".part1Con .on").data("id"));


								}else{
									alert(langData['shop'][2][20]);
									t.removeClass("disabled").html(langData['shop'][5][32]);
								}
							},
							error: function(){
								alert(langData['shop'][2][20]);
								t.removeClass("disabled").html(langData['shop'][5][32]);
							}
						});


					}else{
						alert(data.info);
						t.removeClass("disabled").html(langData['shop'][5][32]);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
					t.removeClass("disabled").html(langData['shop'][5][32]);
				}
			});

		}

	});


	//删除地址
	$(".part1Con").delegate(".delete", "click", function(){
		var $delete=$(this),$one=$(".part1Con");
		if(confirm(langData['shop'][5][77])){

			$.ajax({
				url: "/include/ajax.php?service=member&action=addressDel",
				data: "id="+$delete.closest("dl").attr("data-id"),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){

						if($delete.parents("dl").hasClass("on")){
							if($delete.parents("dl").index()==0){
								$one.find("dl:eq(1)").addClass("on").siblings("dl").removeClass("on");
								$one.find("dl:eq(1) a.setAddress").text(langData['shop'][5][14]);
								$one.find("dl:eq(1)").siblings("dl").find("a.setAddress").text(langData['shop'][5][15]);
							}else{
								$one.find("dl:first").addClass("on").siblings("dl").removeClass("on");
								$one.find("dl:first a.setAddress").text(langData['shop'][5][14]);
								$one.find("dl:first").siblings("dl").find("a.setAddress").text(langData['shop'][5][15]);
							}
						}
						$delete.parents("dl").remove();
						$("#addressid").val($(".part1Con .on").data("id"));

					}else{
						alert(data.info);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
				}
			});

		}
		$(".part1Con dl.on a.setAddress").css("color","#333");

	})



});
