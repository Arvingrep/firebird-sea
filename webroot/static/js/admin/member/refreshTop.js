$(function(){

	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$(".item:eq("+index+")").fadeIn();
		}
	});


	//增加一行
	$(".addPrice").bind("click", function(){
		$(this).closest('table').find("tbody:eq(0)")
			.append($("#" + $(this).data("type")).html().replace(/__/g, $('.config-nav .active').data('type') + '_'));
	});

	//招聘刷新增加一行
	$(".jobAddPrice").bind("click",function (){
		$(this).closest('table').find("tbody:eq(0)")
			.append(`<tr>
    <td>
        <div class="input-append"><input class="span1 times" name="job_refresh[times][]" value="" type="number"><span class="add-on">次</span></div>
    </td>
    <td>
        <div class="input-append"><input class="span1 day" name="job_refresh[day][]" value="" type="number"><span class="add-on">天</span></div>
    </td>
    <td>
        <div class="input-append"><input class="input-small price" step="0.01" name="job_refresh[price][]" value="" type="number"><span class="add-on">元</span></div>
    </td>
    <td class="discount">无</td>
    <td class="unit">0元</td>
    <td class="offer"><input class="offerHidden" type="hidden" name="job_refresh[offer][]">0元</td>
    <td><label>是<input type="radio" value="1"/></label> <label>否<input value="0" type="radio" checked/></label></td>
    <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>
</tr>`);
	});

	//招聘置顶添加一行
	$(".jobTopAddprice").bind("click",function (){
		$(this).closest('table').find("tbody:eq(0)")
		.append(`<tr>
                <td>
                  <div class="input-append">
                    <input class="span1 day" name="job_topNormal[day][]" value="{#$top.day#}" type="number">
                    <span class="add-on">天</span>
                  </div>
                </td>
                <td>
                  <div class="input-append">
                    <input class="input-small price" step="0.01" name="job_topNormal[price][]" value="{#$top.price#}" type="number">
                    <span class="add-on">元</span>
                  </div>
                </td>
                <td class="discount">无</td>
                <td class="offer">0元</td>
                <td><label>是<input type="radio" value="1" /></label> <label>否<input value="0" type="radio" checked/></label></td></td>
                <td><a href="javascript:;" class="del" title="删除"><i class="icon-trash"></i></a></td>
              </tr>`);
	})


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
	$('#editform .item').each(function(){
		computeRefreshSmart($(this), $(this).find('.refreshNormalPrice').attr('id'));
	});

	$('.refreshSmartTable').delegate('input', 'input', function(){
		var par = $(this).closest('.item');
		computeRefreshSmart(par, par.find('.refreshNormalPrice').attr('id'));
	});

	//普通刷新价格变化
	$('#info_refreshNormalPrice').bind('input', function(){
		computeRefreshSmart($(this).closest('.item'), 'info_refreshNormalPrice');
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
	$('#editform .item').each(function(){
		computeTopNormal($(this));
	});

	$('.topNormalTable').delegate('input', 'input', function(){
		computeTopNormal($(this).closest('.item'));
	});

	//计算投递置顶折扣、优惠
	function computeDeliveryNormal(par){
		var unitPrice = 0;
		par.find('.deliveryTable tbody:eq(0)').find('tr').each(function(index){
			var t = $(this), day = parseInt(t.find('.count').val()), price = parseFloat(t.find('.price').val());
			// console.log(day);
			// console.log(price);
			if(day && price){

				//取第一条单价
				if(index == 0){
					var unit = (price / day).toFixed(2);
					unitPrice = (price/day).toFixed(2);
					t.find('.unit').html(unit + '元');
				}else{
					var discount = ((price / (unitPrice * day)) * 10).toFixed(1);
					var unit = (price / day).toFixed(2);
					var offer = ((unitPrice * day) - price).toFixed(2);
					t.find('.discount').html(discount < 10 && discount > 0 ? discount + '折' : '无');
					t.find('.unit').html(unit + '元');
					t.find('.offer').html("<input type='hidden' name='job_delivery[offer][]' value='"+offer+"'/>"+offer + '元');
				}

			}
		});
	}

	$('#editform .item').each(function(){
		computeDeliveryNormal($(this));
	});

	$('.deliveryTable').delegate('input', 'input', function(){
		computeDeliveryNormal($(this).closest('.item'));
	});


	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();

		//异步提交
		var post = $("#editform").find("input, select, textarea").serialize();
		huoniao.operaJson("refreshTop.php", post + "&token="+$("#token").val(), function(data){
			var state = "success";
			if(data.state != 100){
				state = "error";
			}
			huoniao.showTip(state, data.info, "auto");
		});
	});

});
