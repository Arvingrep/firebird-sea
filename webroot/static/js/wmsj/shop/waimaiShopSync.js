$(function(){

	//下拉选择控件
	$(".chosen-select").chosen();

	// 切换同步方式
	$('input[name="SetShop[syn_type]"]').change(function() {
		var type = this.value;

		if (type == 1) {
			var arr = new Array();
			$('select[name="SetShop_ids[]"] option').each(function() {
				arr.push(this.value)
			}) 

			$('select[name="SetShop_ids[]"]').val(arr);
			$('#sel_shop').hide();
			$('.shop_type').hide();

		} else if (type == 3) {
			$('.shop_type').show();
			$('#sel_shop').hide();

		} else {
			$('select[name="SetShop_ids[]"]').val('');
			$('#sel_shop').show();
			$('.shop_type').hide();

		}

		$(".chosen-select").trigger("liszt:updated");

	});

	// 提交
	$("#syncForm").submit(function(e){
		e.preventDefault();
		var form = $(this),
				t = $("#syncForm"),
				courier_id = $("#courier_id").val(),
				sync_type = $("input[name='SetShop[syn_type]']").filter(":checked").val();

		if(courier_id == 0){
			$.dialog.alert(langData['waimai'][6][161]);
			return;
		}

		if(form.find("input[type=checkbox]:checked").length == 0){
			$.dialog.alert(langData['waimai'][6][162]);
			return;
		}


		// 如果是指定店铺
		if(sync_type == 2){
			var shopids = $("#form-field-select-4").val();
			if(shopids == null || shopids == 0 || shopids == ""){
				$.dialog.alert(langData['waimai'][6][163]);
				return false;
			}

			if(shopids.in_array(courier_id)){
				$.dialog.alert(langData['waimai'][6][164]);
				return false;
			}

			/*if(shopids.length == 1 && shopids[0] == courier_id){
				$.dialog.alert("需要同步到的店铺不能和源店铺相同");
				return false;
			}*/

		}

		if(sync_type == 3){
			var shop_type = $("#shop_type").val();
			console.log(shop_type)
			if(shop_type == null || shop_type == 0 || shop_type == ""){
				$.dialog.alert(langData['waimai'][6][165]);
				return false;
			}


		}

		

		$.dialog.confirm(langData['waimai'][6][166], function(){
			t.attr("disabled", true);
			huoniao.showTip("loading", langData['waimai'][6][167]);
			$.ajax({
				url: '?action=syncShop',
				type: 'post',
				data: form.serialize(),
				dataType: 'json',
				success: function(data){
					t.attr("disabled", false);
					if(data && data.state == 100){
						huoniao.showTip("success", data.info, "auto");
					}else{
						huoniao.showTip("error", data.info, "auto");
						$.dialog.alert(data.info);
					}
				},
				error: function(){
					huoniao.showTip("error", langData['siteConfig'][20][183], "auto");
					$.dialog.alert(langData['siteConfig'][20][183]);
				}
			})
		})

	})

})
