$(function(){

	//增加一行
	$("#add").bind("click", function(){
		$("table tbody:eq(0)").append($("#trTemp").html());
	});

	//删除
	$("table").delegate(".del", "click", function(){
		var t = $(this);
		$.dialog.confirm("确定要删除吗？", function(){
			t.closest("tr").remove();
		});
	});

	//保存
	$("#save").bind("click", function(){
		var data = '[';
		$("#priceTab tbody:eq(0) tr").each(function(){
			var t = $(this), id = t.attr("data-id"), price = parseFloat(t.find(".price").val()), mintime = t.find(".mintime").val();
			data += '{"id": '+id+', "price": '+price+', "mintime": '+mintime+'},';
		});
		data = data.substr(0, data.length-1);
		data += ']';

		huoniao.operaJson("?dopost=update", "data="+data, function(data){
			if(data.state == 100){
				huoniao.showTip("success", data.info, "auto");
				window.scroll(0, 0);
				setTimeout(function() {
					location.reload();
				}, 800);
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});

	})

	// 查看充值优惠
	$(".setDiscount").click(function(){
		var id = $(this).attr('data-id');
		$(".setDiscount").removeClass('curr');
		$(this).addClass('curr');
		$(".level_"+id).show().siblings().hide();
	})

	//充值优惠保存
	$(".discountSave").bind("click", function(){
		var id = $(this).attr('data-id'), contain = $(this).closest('.levelItem').find('.discountTab');
		var data = '[';
		contain.find("tbody:eq(0) tr").each(function(){
			var t = $(this), month = t.attr("data-month"), discount = t.find(".discount").val() == '' ? 0 : parseFloat(t.find(".discount").val());
			data += '{"month": '+month+', "discount": '+discount+'},';
		});
		data = data.substr(0, data.length-1);
		data += ']';

		huoniao.operaJson("?dopost=updateDiscount", "id="+id+"&data="+data, function(data){
			if(data.state == 100){
				huoniao.showTip("success", data.info, "auto");
				window.scroll(0, 0);
				setTimeout(function() {
					location.reload();
				}, 800);
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});

	});

});
