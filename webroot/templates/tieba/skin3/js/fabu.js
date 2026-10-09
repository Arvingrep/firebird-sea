$(function(){

	//发布选择分类
	$("#typechose").change(function(){
		var t = $(this), id = t.val();
		if(id){

			$.ajax({
				url: masterDomain+"/include/ajax.php?service=tieba&action=type&type="+id,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){

						var option = [], list = data.info;
						for(var i = 0; i < list.length; i++){
							option.push('<option value="'+list[i].id+'">'+list[i].typename+'</option>');
						}
						if(option){
							t.nextAll("select").remove();
							t.parent().append('<select class="typechose"><option value="">请选择分类</option>'+option.join("")+'</select>');
						}

					}
				}
			});

		}else{
			t.nextAll("select").remove();
		}
	});
})
