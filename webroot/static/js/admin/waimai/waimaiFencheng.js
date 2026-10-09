$(function(){

    // $(".chosen-select").chosen();

    // //下拉选择控件
    // $(".chosen-select").chosen().change(function() {
    //     $('#searchf').submit();
    // })
	//填充分站列表
	huoniao.choseCity($(".choseCity"),$("#cityid"),$("#searchf"));  //城市分站选择初始化

    //修改分成
    $(".edit").bind("click", function(){
        var href = $(this).attr("href"), shopname = $(this).attr("data-shopname"), _id = $(this).attr('data-id');

		try {
			event.preventDefault();
			parent.addPage("waimaiFenchengEdit" + _id, "waimai", "修改分成-"+shopname, "waimai/"+href);
		} catch(e) {}
    });


	//修改默认
	$("#addNew").bind("click", function(){
		var href = $(this).attr("href"), shopname = $(this).attr("data-shopname");
		try {
			event.preventDefault();
			parent.addPage("waimaiFenchengConfig", "waimai", "修改分成", "waimai/"+href);
		} catch(e) {}
	});

	//店铺链接
	$('.shopname').bind('click', function(){
		var t = $(this), shopname = t.text(), id = t.data('id'), href = t.attr('href');
		try {
			event.preventDefault();
			parent.addPage("waimaiShopEdit" + id, "waimai", "修改店铺-"+shopname, "waimai/"+href);
		} catch(e) {}
	});


});
