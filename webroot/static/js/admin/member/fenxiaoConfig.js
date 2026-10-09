var ue = UE.getEditor('fenxiaoJoinNote');
var ue_ = UE.getEditor('fenxiaoNote');

$(function(){

    $('.statusTips').tooltip();

	//分销模式切换
	$('input[name=fenxiaoType]').bind('click', function(){
		var t = $(this), val = parseInt(t.val());
		if(val == 1){
			$('.type0').hide();
			$('.type1').show();
			$('.addLevel').parent().attr('colspan', 6);
		}else{
			$('.type0').show();
			$('.type1').hide();
			$('.addLevel').parent().attr('colspan', 3);
		}
	});

	//增加一行
	$(".addLevel").bind("click", function(){
		var type = parseInt($('input[name=fenxiaoType]:checked').val());
		if(type == 0){
			var count = $('#levelList tr').length;
			var level = ['一','二','三','四','五','六','七','八','九','十'];
			var fxsName = $('#fenxiaoName').val() || '分销商';
			var name = count < 10 ? level[count]+'级'+fxsName : (count+1)+'级';
			var html = $("#trTemp").html().replace('#name', name);
			$(this).closest('table').find("tbody:eq(0)").append(html);

			$('.type0').show();
			$('.type1').hide();
		}else{
			var html = $("#trTemp").html().replace('#name', '');
			$(this).closest('table').find("tbody:eq(0)").append(html);

			$('.type0').hide();
			$('.type1').show();
		}
	});

	//删除
	$("table").delegate(".del", "click", function(){
		var t = $(this);
		$.dialog.confirm("确定要删除吗？", function(){
			t.closest("tr").remove();
			// var fxsName = $('#fenxiaoName').val() || '分销商';
			// $('#levelList tr').each(function(i){
			// 	var level = ['一','二','三','四','五','六','七','八','九','十'];
			// 	var name = i < 10 ? level[i]+'级'+fxsName : '';
			// 	$(this).find('.name').val(name);
			// })
		});
	});
	//分销佣金模式切换
	$('input[name=fenxiaoHjType]').bind('click', function(){
		var val = $(this).val();
		$(".hjType").hide();
		$('.hjType:eq('+val+')').show();
	})

    //计算公式举例
    $('.jsjl').bind('click', function(){

        $.dialog({
			fixed: true,
			title: '计算公式',
			content: $("#juli").html(),
			width: 900,
			init: function(){
                
                //平台切换
                parent.$('.nav-tabs a').click(function (e) {
                    e.preventDefault();
                    var obj = $(this).attr("data-id");
                    if(!$(this).parent().hasClass("active")){
                        parent.$(".nav-tabs li").removeClass("active");
                        $(this).parent().addClass("active");

                        parent.$(".nav-tabs").parent().find(">div").hide();
                        parent.$("#"+obj).show();
                    }
                });

			},
			ok: function(){

			}
		});

    });

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();

		var totalFee = 0, err = false;
		$('#levelList tr').each(function(i){
			var t = $(this), r = t.find('.fee'), fee = r.val();
			if(fee == '' || fee == 0){
				r.addClass('error');
				err = true;
			}
			totalFee += parseFloat(fee);
		})
		if(err){
			return false;
		}

		ue.sync();
		ue_.sync();

		//异步提交
		var post = $("#editform").find("input, select, textarea").serialize();

		huoniao.showTip('loading', '正在操作，请稍后···');
		huoniao.operaJson("fenxiaoConfig.php", post + "&token="+$("#token").val(), function(data){
			var state = "success";
			if(data.state != 100){
				state = "error";
			}else{
				setTimeout(function(){
					location.reload();
				}, 1000)
			}
			huoniao.showTip(state, data.info, "auto");
		});
	});

});
