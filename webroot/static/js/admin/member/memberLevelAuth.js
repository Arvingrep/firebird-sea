$(function(){
	var quanHtml = '<div class="input-append">' + $('#quanList').html() + '<input class="span1" type="text" value="0"><span class="add-on">张</span></div>';
	// 新增券
	$('#addQuan').click(function(){
		var tr = $(this).parents('tr.quan');
		var td = tr.find('td')
		console.log(td)
		
		for(let i=0;i<td.length;i++){
			console.log(td[i])
			if(i>2){
				tr.find('td').eq(i).append(quanHtml);
			}
		}
		
	})


	//保存
	$("#save").bind("click", function(){
		var data = '[';
		var tj = true;
		$("table tbody:eq(0) tr").each(function(){
			var t = $(this);
			data += '[';
			var priceArr = [];
			t.find("td").each(function(index){
				// if($(this).find("input").val() == ''){
				// 	tj = false;
				// }

				var td = $(this), id = $(this).attr("data-id"), type = $(this).attr('data-type'), module = $(this).attr("data-module"), val = parseFloat($(this).find("input").val());
				if(id != undefined && type != 'count'){

					if(module == "delivery"){
						var de = [];
						var typeChecked = td.find('input[type=radio]:checked');
						if(typeChecked.length){
							type = 'amount';
							val = typeChecked.siblings().children('input').val();
							type = typeChecked.val();
							de.push('[{"type":"'+type+'", "val":'+val+'}]');
						}else{
							type = 'count';
						}
						val = de;
						console.log(val);
						val = val!='' ? val : 0;

					// 优惠券
					}else if(module == 'quan'){

						var cfg = [];
						td.children('.input-append').each(function(){
							var group = $(this),
								sel = group.find('select'),
								qid = sel.val(),
								num = sel.siblings('input').val();

							if(qid > 0 && num > 0){
								cfg.push('{"qid":'+qid+', "num":'+num+'}');
							}
						})
						val = '['+cfg.join(',')+']';
					}else{
						val = val ? parseFloat(val) : 0;
					}


					if(type == 'amount'){
						if(module != "delivery"){

						var count = parseInt($(this).next('td').find('input').val());

						}
						priceArr.push('{"id": '+id+', "module": "'+module+'", "count": "'+count+'", "amount": '+val+'}');
					}else{
						priceArr.push('{"id": '+id+', "module": "'+module+'", "amount": '+val+'}');
					}
				}
			});
			data += priceArr.join(",") + '],';
		});
		data = data.substr(0, data.length-1);
		data += ']';

		if(!tj){
			alert('表单不得为空！');
			return false;
		}

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

	});

});
