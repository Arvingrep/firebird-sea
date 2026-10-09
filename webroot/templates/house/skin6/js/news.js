$(function(){

	$("img").scrollLoading();

	// 焦点图
    $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});

	//分类切换显示
	// $(".category dt").bind("click", function(){
	// 	var par = $(this).closest("dl");
	// 	par.hasClass("on") ? (par.find("dd").hide(), par.removeClass("on")) : (par.find("dd").show(), par.addClass("on"));
	// });

    // 查看更多
    $(".btnMore").bind('click', function () {

        var type = [];
        $(".ltit").each(function () {
            type.push($(this).attr("data-id"));
        })
        $.ajax({
            url: masterDomain + '/include/ajax.php?service=house&action=getNewsType&type=' + type,
            dataType: 'html',
            type: 'GET',
            success: function (data) {
                if (data!=1) {
                    $(".wrap").find(".btnMore").before(data);
                }else{
                    //console.log(data);
                }
            }
        })
    });

});