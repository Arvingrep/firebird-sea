$(function(){
	$('.member-list .mem-state .sign').click(function(){
	    $(this).hide();
	    $(this).next('a').show();
	})

	$('#selectTypeMenu').hover(function(){
		$(this).show();
		$(this).closest('selectType').addClass('hover');
	}, function(){
	  	$(this).hide();
	  	$(this).closest('selectType').removeClass('hover');
	});

	$("#selectTypeText").hover(function () {
	  	$(this).next("span").slideDown(200);
	  	$(this).closest('selectType').addClass('hover');
	},function(){
	  	$(this).next("span").hide();
	  	$(this).closest('selectType').removeClass('hover');
	});
	
	$("#selectTypeMenu>a").click(function () {
	  	$("#selectTypeText").text($(this).text());
	  	$("#selectTypeText").attr("value", $(this).attr("rel"));
	  	$(this).parent().hide();
	  	$('selectType').removeClass('hover');
	});
})