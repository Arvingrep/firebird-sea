$(function(){
	var formAction = $("#editform").attr("action"),
		init = {
		//提示信息
		showTip: function(type, message){
			var obj = $("#infoTip");
			obj.html('<span class="msg '+type+'">'+message+'</span>').show();

			setTimeout(function(){
				obj.fadeOut();
			}, 5000);
		}
	};

	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$("input[name=configType]").val(type);
			$(".item:eq("+index+")").fadeIn();
		}
	});

	//表单验证
	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this);
		huoniao.regex(obj);
	});

    //入驻时间的单位切换
    $('input[name=joinTimesUnit]').bind('click', function(){
        changeJoinTimesUnit();
    });

    changeJoinTimesUnit();

    function changeJoinTimesUnit(){
        var unit = $('input[name=joinTimesUnit]:checked').val();
        if(unit == 1){
            $('.joinTimesUnit, .joinTimesUnit1').text('年');
        }else{
            $('.joinTimesUnit').text('月');
            $('.joinTimesUnit1').text('个月');
        }
    }

    //停用、启用商家特权
    $('.priceWrap .state').bind('click', function(){
        var t = $(this), _state = parseInt(t.attr('data-state'));
        if(_state == 0){
            t.attr('data-state', 1).text('点击启用').css('color', '#ff0000');
            t.siblings('input').val(1);
        }else{
            t.attr('data-state', 0).text('点击停用').css('color', '#2672ec');
            t.siblings('input').val(0);
        }
    });



	//上传单张图片
  	function mysub(id){
	    var t = $("#"+id), p = t.parent(), img = t.parent().children(".img"), uploadHolder = t.siblings('.upfile');

	    var data = [];
	    data['mod'] = 'business';
	    data['filetype'] = 'image';
	    data['type'] = 'card';

	    $.ajaxFileUpload({
	      url: "/include/upload.inc.php",
	      fileElementId: id,
	      dataType: "json",
	      data: data,
	      success: function(m, l) {
	        if (m.state == "SUCCESS") {
	        	if(img.length > 0){
	        		img.attr('src', m.turl);

	        		delAtlasPic(p.find(".icon").val());
	        	}else{
	        		p.prepend('<img src="'+m.turl+'" alt="" class="img" style="height:40px;">');
	        	}
	        	p.find(".icon").val(m.url);

	        	uploadHolder.removeClass('disabled').text('上传图标');

	        } else {
	          uploadError(m.state, id, uploadHolder);
	        }
	      },
	      error: function() {
	        uploadError("网络错误，请重试！", id, uploadHolder);
	      }
    	});

  	}

	function uploadError(info, id, uploadHolder){
		$.dialog.alert(info);
		uploadHolder.removeClass('disabled').text('上传图标');
	}

	//删除已上传图片
	var delAtlasPic = function(picpath){
		var g = {
			mod: "business",
			type: "delCard",
			picpath: picpath,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			url: "/include/upload.inc.php",
			data: $.param(g)
		})
	};

	$("#package").delegate(".upfile", "click", function(){
		var t = $(this), inp = t.siblings("input");
		if(t.hasClass("disabled")) return;
		inp.click();
	})

	$("#package").delegate(".Filedata", "change", function(){
		if ($(this).val() == '') return;
		$(this).siblings('.upfile').addClass('disabled').text('正在上传···');

		console.log($(this).val())
	    mysub($(this).attr("id"));
	})

	//管理套餐内容
	$("#package").delegate(".manage", "click", function(){
		var t = $(this), title = t.closest('tr').find('td:eq(0) input').val(), list = t.next('input').val().split(',');

		var already = 0;

		var packageHtml = [];
		packageHtml.push('<div class="businessPackage">');
		packageHtml.push('<dl>');
		packageHtml.push('<dt>商家特权：</dt>');
		packageHtml.push('<dd>');

		for (var privilege in businessPrivilege){
			packageHtml.push('<label><input data-price="'+businessPrivilege[privilege]['price']+'" type="checkbox" value="'+privilege+'" '+($.inArray(privilege, list) > -1 ? 'checked' : '')+' /> '+businessPrivilege[privilege]['title']+'</label>');

			if($.inArray(privilege, list) > -1){
				already += parseFloat(businessPrivilege[privilege]['price']);
			}
		}

		packageHtml.push('</dd>');
		packageHtml.push('</dl>');

		packageHtml.push('<dl>');
		packageHtml.push('<dt>行业特权：</dt>');
		packageHtml.push('<dd>');

		for (var store in businessStore){
			packageHtml.push('<label><input data-price="'+businessStore[store]['price']+'" type="checkbox" value="'+store+'" '+($.inArray(store, list) > -1 ? 'checked' : '')+' /> '+businessStore[store]['title']+'</label>');

			if($.inArray(store, list) > -1){
				already += parseFloat(businessStore[store]['price']);
			}
		}

		packageHtml.push('</dd>');
		packageHtml.push('</dl>');

		packageHtml.push('</div>');

		$.dialog({
			fixed: true,
			title: title + "套餐内容<span id='businessPackageAmount'>"+(already > 0 ? "总价值：" + parseFloat(already).toFixed(2) + echoCurrency("short") : "")+"</span>",
			content: packageHtml.join(''),
			width: 650,
			ok: function(){

				var list = [];
				parent.$('.businessPackage').find('input').each(function(){
					if($(this).is(":checked")){
						list.push($(this).val());
					}
				});
				if(!list){
					alert('请选择套餐内容！');
					return false;
				}
				t.next('input').val(list.join(','));

			},
			cancel: true
		});

		parent.$('.businessPackage label').bind('click', function(){
			var label = $(this), all = label.closest('.businessPackage').find('input');
			var price = 0;
			all.each(function(){
				if($(this).is(":checked")){
					price += parseFloat($(this).attr('data-price'));
				}
			});
			parent.$('#businessPackageAmount').html('总价值：' + parseFloat(price).toFixed(2) + echoCurrency('short'));
		});


	});


	// //新增套餐
	// $('.addPackage').bind('click', function(){
	// 	var html = [];

	// 	var len = $("#packageBody tr").length;

	// 	html.push('<tr>');
	// 	html.push('<td><input class="input-small" type="text" name="package[title][]" value=""></td>');
	// 	html.push('<td>');
	// 	html.push('<a href="javascript:;" class="upfile" title="上传图标">上传图标</a>');
	// 	html.push('<input type="file" name="Filedata" class="imglist-hidden Filedata" style="display: none;" id="Filedata_'+len+'">');
	// 	html.push('<input type="hidden" name="package[icon][]" class="icon" value="">');
	// 	html.push('</td>');
	// 	html.push('<td><input class="input-small" type="text" name="package[label][]" value=""></td>');
	// 	html.push('<td><div class="input-append"><input class="input-small price" step="0.01" type="number" name="package[price][]" value=""><span class="add-on">'+echoCurrency('short')+'/月</span></div></td>');
	// 	html.push('<td><div class="input-append"><input class="input-small price" step="0.01" type="number" name="package[mprice][]" value=""><span class="add-on">'+echoCurrency('short')+'/月</span></div></td>');
	// 	html.push('<td><a href="javascript:;" class="manage" title="管理套餐内容">管理套餐内容</a><input type="hidden" name="package[list][]" value="" /></td>');
	// 	html.push('<td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>');
	// 	html.push('</tr>');

	// 	$('#packageBody').append(html.join(""));
	// });

	//删除套餐
	$('#packageBody, #businessTimes, #businessSale, #businessPoint, #businessRule').delegate('.del', 'click', function(){
		var t = $(this), tr = t.closest('tr');
		$.dialog.confirm((t.closest('tbody').attr('id') == 'packageBody' ? '已开通此套餐的商家将会自动失效！<br />' : '') + '确认要删除吗？', function(){
			tr.remove();
		});
	});


	// //新增开通时长
	// $('.addTimes').bind('click', function(){
	// 	var html = [];

	// 	html.push('<tr>');
	// 	html.push('<td><div class="input-append"><input class="input-small" step="1" type="number" name="times[]" value=""><span class="add-on">个月</span></div></td>');
	// 	html.push('<td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>');
	// 	html.push('</tr>');

	// 	$('#businessTimes').append(html.join(""));
	// });


	// //新增满减
	// $('.addSale').bind('click', function(){
	// 	var html = [];

	// 	html.push('<tr>');
	// 	html.push('<td><div class="input-prepend input-append"><span class="add-on">满</span><input class="input-small" step="1" type="number" name="price[]" value=""><span class="add-on">减</span><input class="input-small" step="1" type="number" name="amount[]" value=""><span class="add-on">'+echoCurrency('short')+'</span></div></td>');
	// 	html.push('<td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>');
	// 	html.push('</tr>');

	// 	$('#businessSale').append(html.join(""));
	// });


	// //新增送积分
	// $('.addPoint').bind('click', function(){
	// 	var html = [];

	// 	html.push('<tr>');
	// 	html.push('<td><div class="input-prepend input-append"><span class="add-on">满</span><input class="input-small" step="1" type="number" name="month[]" value=""><span class="add-on">个月送</span><input class="input-small" step="1" type="number" name="point[]" value=""><span class="add-on">积分</span></div></td>');
	// 	html.push('<td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>');
	// 	html.push('</tr>');

	// 	$('#businessPoint').append(html.join(""));
	// });


	//新增时长
	$('.addTimes').bind('click', function(){
		var html = [];

        var _unit = '个月';
        var unit = $('input[name=joinTimesUnit]:checked').val();
        if(unit == 1){
            _unit = '年';
        }

		html.push(`<tr>
            <td>
            <div class="input-prepend input-append">
                <span class="add-on">开通</span><input class="input-mini" step="1" type="text" name="times[]" value=""><span class="add-on"><span class="joinTimesUnit1">${_unit}</span></span>
                <span class="add-on" style="margin-left: 10px;">打</span><input class="input-mini" step="1" type="text" name="discount[]" value=""><span class="add-on">折</span>
                <span class="add-on" style="margin-left: 10px;">送</span><input class="input-mini" step="1" type="text" name="point[]" value=""><span class="add-on">${cfg_pointName}</span>
            </div>
            </td>
            <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>
        </tr>`);

		$('#businessRule').append(html.join(""));
	});


	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var index = $(".config-nav .active").index(),
			type = $("input[name=configType]").val();

		if(type == "config"){

		}else if(type == "upload"){

		}else if(type == "ftp"){

		}else if(type == "mark"){

		}

		//异步提交
		post = $("#editform .item:eq("+index+")").find("input, select, textarea").serialize();
		if($("input[name=ftpStateType]:checked").val() == 0){
			$("#ftpConfig input").attr("disabled", true);
		}
		huoniao.operaJson(formAction+"?type="+type, post + "&token="+$("#token").val(), function(data){
			var state = "success";
			if(data.state != 100){
				state = "error";
			}

			if(data.state == 2001){
				$.dialog.alert(data.info);
			}else{
				huoniao.showTip(state, data.info, "auto");
			}

			// if(data.state == 100){
			// 	if(type == 'config'){
			// 		setTimeout(function(){
			// 			location.reload();
			// 		}, 2000);
			// 	}
			// }
		});

	});

	//初始化
	$("input[name=subdomain]:checked").click();
});
