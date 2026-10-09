$(function(){

	$(".total-info b").html(totalCount);
	$(".section-sidebar .sidebar-list").click(function() {
        $(".sidebar-list .sec-ul-list").removeClass("showandhide"),
        $(this).children(".sec-ul-list").addClass("showandhide"),
        $(".sidebar-list .Arrow").removeClass("Arrow-direction"),
        $(this).find(".Arrow").addClass("Arrow-direction"),
        $(".sidebar-list .side-span").removeClass("side-span-a-cg-color"),
        $(this).children(".tab-link").children("a").addClass("side-span-a-cg-color"),
        $(".sidebar-list .tab-link").removeClass("sidebar-cg-border"),
        $(this).children(".tab-link").addClass("sidebar-cg-border")
    });
    $(".contentlist li").mouseover(function() {
        $(this).addClass("content-cg-bgcolor")
    });
    $(".contentlist li").mouseleave(function() {
        $(this).removeClass("content-cg-bgcolor")
    });

    $('.sec-ul-list').delegate('li', 'click', function(event) {
    	var t = $(this);
    	if(!t.hasClass('curr')){
    		t.addClass('curr').siblings('li').removeClass('curr');
    	}
    });

    $(".total-info span b").html(total);
    
})