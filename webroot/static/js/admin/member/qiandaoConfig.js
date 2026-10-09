//实例化编辑器
var ue = UE.getEditor('body');

$(function(){

	//首次加载
	if(lianqian){
		for (var i = 0; i < lianqian.length; i++) {
			var day = lianqian[i]['day'], reward = lianqian[i]['reward'];
			var html = $("#lianqian").html().replace('day"', 'day" value="'+day+'"').replace('reward"', 'reward" value="'+reward+'"');
			$("#lianqianBtn").before(html);
		}
	}

	if(zongqian){
		for (var i = 0; i < zongqian.length; i++) {
			var day = zongqian[i]['day'], reward = zongqian[i]['reward'];
			var html = $("#zongqian").html().replace('day"', 'day" value="'+day+'"').replace('reward"', 'reward" value="'+reward+'"');
			$("#zongqianBtn").before(html);
		}
	}
	if(teshu){
		for (var i = 0; i < teshu.length; i++) {
			var date = teshu[i]['date'], title = teshu[i]['title'], color = teshu[i]['color'], reward = teshu[i]['reward'];
			var html = $("#teshu").html().replace('date"', 'date" value="'+huoniao.transTimes(date, 2)+'"').replace('title"', 'title" value="'+title+'"').replace('color-input"', 'color-input" value="'+color+'"').replace('background:#cccccc', 'background:'+color).replace('reward"', 'reward" value="'+reward+'"');
			$("#teshuBtn").before(html);

			$('#teshuBtn').closest("dd").find('.date').datetimepicker({
				format: 'yyyy-mm-dd',
				autoclose: true,
				language: 'ch',
				todayBtn: true,
				minView: 2
			});
		}
	}

	//新增奖励规则
	$('.addNew').bind("click", function(){
		var id = $(this).data('id');
		$(this).before($("#" + id).html());
		if(id == 'teshu'){
			//选择日期
			$(this).prev('.item').find('.date').datetimepicker({
				format: 'yyyy-mm-dd',
				autoclose: true,
				language: 'ch',
				todayBtn: true,
				minView: 2
			});
		}
	});

	//删除
	$('.editform').delegate('.remove', 'click', function(){
		$(this).closest('.item').remove();
	});

	//选择颜色
	$(".editform").delegate(".color_pick", "click", function(){
		var t = $(this);
		t.colorPicker({
			callback: function(color) {
				var color = color.length === 7 ? color : '';
				t.siblings(".color-input").val(color);
				$(this).find("em").css({"background": color});
			}
		});
	});

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();

		ue.sync();

		//异步提交
		var post = $("#editform").find("input, select, textarea").serialize();
		huoniao.operaJson("qiandaoConfig.php", post, function(data){
			var state = "success";
			if(data.state != 100){
				state = "error";
			}
			huoniao.showTip(state, data.info, "auto");
		});
	});

});
