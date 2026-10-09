$(function(){
	
	//链接
	$(".fun-search a").bind("click", function(event){
        var href = $(this).attr("href");
		try{
			event.preventDefault();
			parent.$(".h-nav a").each(function(index, element) {
                if($(this).attr("href") == href){
					parent.$(this).click();
					return false;
				}
            });
		}catch(e){}
    });
	
});