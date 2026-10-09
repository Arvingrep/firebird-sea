$(function(){

  //删除
	$(".list").delegate(".del", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.data("id");
		var type = par.attr('data-type')
		if(id){
			$.dialog.confirm(langData['siteConfig'][27][111], function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service="+module+"&logistype="+type+"&action=delLogistic&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							location.reload();

						}else{
							$.dialog.alert('此模板有商品正在使用，不可删除');
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});

});
