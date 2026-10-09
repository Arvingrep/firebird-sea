//实例化编辑器
var ue = UE.getEditor('protocol');
$(function () {

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

    $('input[name="picSwitch"]').bind('click', function(){
        var val = $(this).val();
        if(val == 1){
            $('#picObj').show();
        }else{
            $('#picObj').hide();
        }
    });

    $('input[name="validConfig"]').bind('click', function(){
        var val = $(this).val();
        if(val == 1){
            $('#validObj').show();
        }else{
            $('#validObj').hide();
        }
    });

    $('input[name="refreshConfig"]').bind('click', function(){
        var val = $(this).val();
        if(val == 1){
            $('#refreshObj').show();
        }else{
            $('#refreshObj').hide();
        }
    });

    $('input[name="topConfig"]').bind('click', function(){
        var val = $(this).val();
        if(val == 1){
            $('#topObj').show();
        }else{
            $('#topObj').hide();
        }
    });


    //增加一行
	$(".addPrice1").bind("click", function(){
		var html='              <tr>\n' +
			'                <td>\n' +
			'                  <div class="input-append validA">\n' +
			'                    <input class="input-small day" id="validRuleday" name="validRule[day][]" value="" type="number">\n' +
			'                    <input class="dayText" name="validRule[daytext][]" value="2" type="hidden">\n' +
			'                    <button type="button" class="btn dropdown-toggle " data-toggle="dropdown" data-id="2">月<span class="caret"></span></button>\n' +
			'                    <ul class="dropdown-menu">\n' +
			'                      <li><a href="javascript:;" data-id="1">年</a></li>\n' +
			'                      <li><a href="javascript:;" data-id="2">月</a></li>\n' +
			'                      <li><a href="javascript:;" data-id="3">天</a></li>\n' +
			'                    </ul>\n' +
			'                  </div>\n' +
			'                </td>\n' +
			'                <td>\n' +
			'                  <div class="input-append">\n' +
			'                    <input class="input-small price" step="0.01" name="validRule[price][]" value="" type="number">\n' +
			'                    <span class="add-on">元</span>\n' +
			'                  </div>\n' +
			'                </td>\n' +
			'                <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>\n' +
			'              </tr>'
		$(this).closest('table').find("tbody:eq(0)").append(html);
	});
    
    $("body").delegate('.validA .dropdown-menu li','click',function (){
        var t = $(this);
        var par = t.closest('.validA');
        var id = t.find('a').attr('data-id'),text = t.text();
        par.find('.btn.dropdown-toggle').html(text + '<span class="caret"></span>')
        par.find('.dayText').val(id)
    })

	//删除
	$("#validObj").delegate(".del", "click", function(){
		var t = $(this);
		$.dialog.confirm("确定要删除吗？", function(){
			t.closest("tr").remove();
		});
	});


	//增加一行
	$(".addPrice").bind("click", function(){
		$(this).closest('table').find("tbody:eq(0)")
			.append($("#" + $(this).data("type")).html());
	});

	//删除
	$("table").delegate(".del", "click", function(){
		var t = $(this);
		$.dialog.confirm("确定要删除吗？", function(){
			t.closest("tr").remove();
		});
	});

	//计算智能刷新折扣、单价、优惠
	function computeRefreshSmart(par, obj){
		var refreshNormalPrice = parseFloat($('#' + obj).val());
		if(!refreshNormalPrice) return;
		par.find('.refreshSmartTable tbody:eq(0)').find('tr').each(function(){
			var t = $(this), times = parseFloat(t.find('.times').val()), price = parseFloat(t.find('.price').val());
			if(times && price){
				var discount = ((price / (refreshNormalPrice * times)) * 10).toFixed(1);
				var unit = (price / times).toFixed(2);
				var offer = ((refreshNormalPrice * times) - price).toFixed(2);
				t.find('.discount').html(discount < 10 && discount > 0 ? discount + '折' : '无');
				t.find('.unit').html(unit + '元');
				t.find('.offer').html(offer + '元');
			}
		});
	}
    
    computeRefreshSmart($('#editform'), $('#editform').find('.refreshNormalPrice').attr('id'));
	

	$('.refreshSmartTable').delegate('input', 'input', function(){
		var par = $(this).closest('.editform');
		computeRefreshSmart(par, par.find('.refreshNormalPrice').attr('id'));
	});

	//普通刷新价格变化
	$('#info_refreshNormalPrice').bind('input', function(){
		computeRefreshSmart($(this).closest('.editform'), 'info_refreshNormalPrice');
	});


	//计算普通置顶折扣、优惠
	function computeTopNormal(par){
		var unitPrice = 0;
		par.find('.topNormalTable tbody:eq(0)').find('tr').each(function(index){
			var t = $(this), day = parseInt(t.find('.day').val()), price = parseFloat(t.find('.price').val());
			if(day && price){
				//取第一条单价
				if(index == 0){
					unitPrice = (price/day).toFixed(2);
				}else{
					var discount = ((price / (unitPrice * day)) * 10).toFixed(1);
					var offer = ((unitPrice * day) - price).toFixed(2);
					t.find('.discount').html(discount < 10 && discount > 0 ? discount + '折' : '无');
					t.find('.offer').html(offer + '元');
				}

			}
		});
	}
    computeTopNormal($('#editform'));

	$('.topNormalTable').delegate('input', 'input', function(){
		computeTopNormal($(this).closest('.editform'));
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
        var t = $(this);

		ue.sync();

        t.attr("disabled", true).html("提交中...");
        $.ajax({
            type: "POST",
            url: "?",
            data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
            dataType: "json",
            success: function(data){
                if(data.state == 100){
                    $.dialog({
                        title: '提醒',
                        icon: 'success.png',
                        content: '保存成功！',
                        ok: function(){
                            // window.scroll(0, 0);
                            location.reload();
                        }
                    });
                    t.attr("disabled", false).html("确认提交");
                }else{
                    $.dialog.alert(data.info);
                    t.attr("disabled", false);
                };
            },
            error: function(msg){
                $.dialog.alert("网络错误，请刷新页面重试！");
                t.attr("disabled", false);
            }
        });
	});

    //恢复默认配置
    $('#reset').bind('click', function(){
        $.dialog.confirm('确认要恢复默认配置吗？', function(){
            $.ajax({
                type: "POST",
                url: "?",
                data: "dopost=reset&tid=" + tid,
                dataType: "json",
                success: function(data){
                    if(data.state == 100){
                        $.dialog({
                            title: '提醒',
                            icon: 'success.png',
                            content: '恢复成功！',
                            ok: function(){
                                // window.scroll(0, 0);
                                location.reload();
                            }
                        });
                        
                    }else{
                        $.dialog.alert(data.info);
                    };
                },
                error: function(msg){
                    $.dialog.alert("网络错误，请刷新页面重试！");
                }
            });
        });
    })


});