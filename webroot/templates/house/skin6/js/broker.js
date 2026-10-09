$(function(){
    $("#totalCount").html(totalCount);
	// 判断浏览器是否是ie8
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.listbox .bottombox p:last-child').css('margin-right','0');
        $('.listbox .libox li:last-child').css('margin-right','0');
    }

    var addr;
    var orderby;



	//排序
	$(".m-t li").bind("click", function(){
		var t = $(this),i = t.index(),id = t.attr('data-id'),type = t.attr('data-type');

		if(!t.hasClass("curr")){
			t.addClass("curr").siblings("li").removeClass("curr");
			if(type=="time"){
				id = t.hasClass("up") ? 2 : 1;
				t.attr('data-id',id);
			}else if(type=="nums"){
				id = t.hasClass("up") ? 4 : 3;
				t.attr('data-id',id);
			}
		}else{
			if(t.hasClass("curr") && t.hasClass("ob")){
				t.hasClass("up") ? t.removeClass("up") : t.addClass("up");
				if(type=="time"){
					id = t.hasClass("up") ? 2 : 1;
					t.attr('data-id',id);
				}else if(type=="nums"){
					id = t.hasClass("up") ? 4 : 3;
					t.attr('data-id',id);
				}
			}
		}
		orderby = id;
		atpage = 1;


	});



	function delState(num){
		// 条件删除
		$('.fi-state').delegate('.idel', 'click', function(event) {
			var t = $(this), par = t.closest('a');
			if(par.attr('data-id')==num){
                var className = t.parent("a").attr("class");
                if(className=="addrid"){
                    $(".pos-item a").eq(0).addClass('curr').siblings('a').removeClass('curr');
                    $(".area").hide();
                    addr = 0;
                }else if(className=="business"){
                    $(".pos-sub-item a").eq(0).addClass('curr').siblings('a').removeClass('curr');
                    var itemt = $(".pos-item .curr").text();
                    var itemid = $(".pos-item .curr").attr("data-id");
                    if($(".addrid").length==0){
                        $('.fi-state dd').prepend('<a class="addrid" href="javascript:;" data-id="'+itemid+'">'+itemt+'<i class="idel"></i></a>');
                    }
                    addr = $(".pos-item .curr").attr("data-id");
                }
				par.remove();
				atpage = 1;
				getList();
			}
		});
	}



	// 清空条件
	$('.fi-state').delegate('.btn_clear', 'click', function(event) {
		$(this).closest('.fi-state').find('dd').html('');
        $(".pos-item a").eq(0).addClass('curr').siblings('a').removeClass('curr');
        $(".area").hide();
        $(".pos-sub-item a").eq(0).addClass('curr').siblings('a').removeClass('curr');
        $(".m-t li").eq(0).addClass("curr").siblings("li").removeClass("curr");
        $(".ob").eq(0).attr("data-id",1);
		$(".ob").eq(1).attr("data-id",3);
		$(".ob").removeClass("up");
        addr=0;
        orderby='';
        atpage = 1;

	});

})