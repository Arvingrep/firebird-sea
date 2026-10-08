$(function(){
	getEditor("body");

	//地图标注
	var init = {
		popshow: function() {
			var src = "/api/map/mark.php?mod=tuan",
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


	//时间
	var selectDate = function(el, func){
		WdatePicker({
			el: el,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			qsEnabled: false,
			dateFmt: 'yyyy-MM-dd',
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
	$("#registration").focus(function(){
		selectDate("registration");
	});

	//删除套餐列
	$(".taocon").delegate(".del", "click", function(){
		var t = $(this);

		if(t.closest("tbody").find("tr").length <= 1){
			// t.closest(".tab").remove();
		}else{
			t.closest("tr").remove();
		}
	});

	//新增套餐列
	$(".taocon").delegate(".add", "click", function(){
		var t = $(this);
		if(t.closest('.taocon').attr('data-id')==1){
			t.closest("tr").after('<tr><td><input type="text" class="tit"></td><td><input type="text" class="pric1"></td><td><input type="text" class="pric2"></td><td><input type="text" class="pric3"></td><td><input type="text" class="pric4"></td><td><input type="text" class="pric5"></td><td><span class="btn move move1" title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="btn del" title="'+langData['siteConfig'][6][8]+'"><i></i></span><span title="'+langData['siteConfig'][6][18]+'" class="btn add"><i></i></span></td></tr>');
		}else{
			t.closest("tr").after('<tr><td><input type="text" class="tit"></td><td><input type="text" class="desc"></td><td><input type="text" class="pric"></td><td><span class="btn move" title="'+langData['siteConfig'][6][19]+'"><i></i></span><span class="btn del" title="'+langData['siteConfig'][6][8]+'"><i></i></span><span title="'+langData['siteConfig'][6][18]+'" class="btn add"><i></i></span></td></tr>');
		}
	});

	//删除套餐内容
	$(".taocon").delegate(".remove", "click", function(){
		$(this).closest(".tab").remove();
	});

	$(".many .tab .items tbody").dragsort({ dragSelector: ".move", placeHolderTemplate: '<tr class="holder"><td colspan="5"></td></tr>' });

	$("input[name='catid[]']").bind("click", function(){
		$("input[name='catid[]']").each(function(){
			if($(this).val() == 1 || $(this).val() == 2 || $(this).val() == 3){
				if($(this).is(":checked")){
					if($(this).val() == 1){
						$(".catid1").show();
					}else if($(this).val() == 2){
						$(".catid2").show();
					}else if($(this).val() == 3){
						$(".catid3").show();
					}
				}else{
					if($(this).val() == 1){
						$(".catid1").hide();
					}else if($(this).val() == 2){
						$(".catid2").hide();
					}else if($(this).val() == 3){
						$(".catid3").hide();
					}
				}
			}
		});
	});

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();
        $('#addrid').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
		var t           = $(this),
				addrid      = $("#addrid"),
				address     = $("#address"),
				phone       = $("#phone"),
				openStart   = $("#openStart"),
				openEnd     = $("#openEnd");
				//note        = $("#note");

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

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

		//电话
		if($.trim(phone.val()) == "" || phone.val() == 0){
			phone.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][433]);
			offsetTop = offsetTop == 0 ? phone.position().top : offsetTop;
		}

		//图集
		var imgli = $("#listSection2 li");
		if(imgli.length <= 0 && offsetTop <= 0){
			$.dialog.alert(langData['siteConfig'][20][436]);
			offsetTop = $(".list-holder").position().top;
		}

		ue.sync();

		if(!ue.hasContents() && offsetTop == 0){
			$.dialog.alert(langData['shop'][4][48]);
			offsetTop = offsetTop == 0 ? $("#body").position().top : offsetTop;
		}

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action");
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		var param = '';

    	$(".longrzfee").find("table").each(function(i){
    		var longrzfee = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			longrzfee.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(longrzfee!=''){
				param = "&longexpenses="+longrzfee.join("|||");
			}
		});

		$(".longmouthfee").find("table").each(function(i){
    		var longmouthfee = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			longmouthfee.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(longmouthfee!=''){
				param += "&longbedfee="+longmouthfee.join("|||");
			}
		});

		$(".longother").find("table").each(function(i){
    		var longother = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			longother.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(longother!=''){
				param += "&longotherfees="+longother.join("|||");
			}
		});

		$(".shortrzfee").find("table").each(function(i){
    		var shortrzfee = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			shortrzfee.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(shortrzfee!=''){
				param += "&shortexpenses="+shortrzfee.join("|||");
			}
		});

		$(".shortmouthfee").find("table").each(function(i){
    		var shortmouthfee = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			shortmouthfee.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(shortmouthfee!=''){
				param += "&shortbedfee="+shortmouthfee.join("|||");
			}
		});

		$(".shortother").find("table").each(function(i){
    		var shortother = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			shortother.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(shortother!=''){
				param += "&shortotherfees="+shortother.join("|||");
			}
		});

		$(".homecyfw").find("table").each(function(i){
    		var homecyfw = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			homecyfw.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(homecyfw!=''){
				param += "&homecyfw="+homecyfw.join("|||");
			}
		});

		$(".homezlhl").find("table").each(function(i){
    		var homezlhl = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			homezlhl.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(homezlhl!=''){
				param += "&homezlhl="+homezlhl.join("|||");
			}
		});

		$(".homejzfw").find("table").each(function(i){
    		var homejzfw = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			homejzfw.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(homejzfw!=''){
				param += "&homejzfw="+homejzfw.join("|||");
			}
		});

		$(".homejsga").find("table").each(function(i){
    		var homejsga = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			homejsga.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(homejsga!=''){
				param += "&homejsga="+homejsga.join("|||");
			}
		});

		$(".homejthd").find("table").each(function(i){
    		var homejthd = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			homejthd.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(homejthd!=''){
				param += "&homejthd="+homejthd.join("|||");
			}
		});

		$(".hometlfw").find("table").each(function(i){
    		var hometlfw = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			hometlfw.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(hometlfw!=''){
				param += "&hometlfw="+hometlfw.join("|||");
			}
		});

		$(".residentialoother").find("table").each(function(i){
    		var residentialoother = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric1 = t.find(".pric1").val(), pric2 = t.find(".pric2").val(), pric3 = t.find(".pric3").val(), pric4 = t.find(".pric4").val(), pric5 = t.find(".pric5").val();
    			if(tit != undefined && pric1 != undefined && pric2 != undefined && pric3 != undefined && pric4 != undefined && pric5 != undefined){
	    			residentialoother.push(tit+"$$$"+pric1+"$$$"+pric2+"$$$"+pric3+"$$$"+pric4+"$$$"+pric5);
	    		}
			});
			if(residentialoother!=''){
				param += "&residentialotherfees="+residentialoother.join("|||");
			}
		});

		$(".residentialmouthfee").find("table").each(function(i){
    		var residentialmouthfee = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			residentialmouthfee.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(residentialmouthfee!=''){
				param += "&residentialbedfee="+residentialmouthfee.join("|||");
			}
		});

		$(".residentialcard").find("table").each(function(i){
    		var residentialcard = [], mtit = $(this).find(".mtit input").val();
    		$(this).find(".items tr").each(function(){
    			var t = $(this), tit = t.find(".tit").val(), pric = t.find(".pric").val(), desc = t.find(".desc").val();
    			if(tit != undefined && pric != undefined && desc != undefined){
	    			residentialcard.push(tit+"$$$"+desc+"$$$"+pric);
	    		}
			});
			if(residentialcard!=''){
				param += "&residentialcard="+residentialcard.join("|||");
			}
		});

		$.ajax({
			url: action,
			data: form.serialize() + param,
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
