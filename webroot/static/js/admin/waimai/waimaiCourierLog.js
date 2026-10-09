$(function(){
	huoniao.choseCity($(".choseCity"),$("#cityid"),$("#frmselect"));  //城市分站选择初始化
	//下拉选择控件
	$(".chosen-select").chosen().change(function() {
		$("#frmselect").submit();
	})

    //查看位置
    $(".location").bind("click", function(){
        var t = $(this), name = t.data("name"), id = t.data("id"), lng = t.data("lng"), lat = t.data("lat");

        $.dialog({
            id: "markDitu",
            title: "配送员（"+name+"）的位置",
            content: 'url:/api/map/mark.php?mod=waimai&lnglat='+lat+","+lng+"&city=&onlyshow=1",
            width: 1000,
            height: 600,
            max: true,
            ok: function(){

            },
            cancel: true
        });
    });


})