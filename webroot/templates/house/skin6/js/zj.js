$(function(){
    $(".totalCount b").html(totalCount);
	// 判断浏览器是否是ie8、ie9
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.estatecon .esbox:last-child').css('margin-right','0');
    }

	var addr;
	var orderby;
    // $('.filter').delegate('a', 'click', function(event) {
	// 	var t = $(this), i = t.index(),val = t.text(),cla = t.parent().attr("class"),id = t.attr("data-id"),par = t.closest('dl');
	// 	if(par.hasClass('fi-state')){return false;}
	//
	// 	if(cla == "pos-item fn-clear"){
	// 		if(i == 0){
	// 			$(".pos-item a").removeClass('curr');
	// 			t.addClass('curr');
	// 			$(".business").remove();
	// 			$(".addrid").remove();
	// 			$('.area').hide();
	// 		}
	// 		if(i != 0 && !t.hasClass('curr')){
	// 			$(".pos-item a").removeClass('curr');
	// 			t.addClass('curr');
	// 			$('.area').show();
	// 			if(id != ''){
	// 				$('.fi-state').show();
	// 				$(".addrid").remove();
	// 				$(".business").remove();
	// 				$('.fi-state dd').prepend('<a class="addrid" href="javascript:;" data-id="'+id+'">'+val+'<i class="idel"></i></a>');
	// 			}else{
	// 				$('.fi-state').hide();
	// 			}
	// 		}
	// 		addr = $(this).data("id");
	// 		getArea(addr);
	// 	}else{
	// 		if(i == 0){
	// 			$(".pos-sub-item a").removeClass('curr');
	// 			$(".business").remove();
	// 			var itemt = $(".pos-item .curr").text();
	// 			var itemid = $(".pos-item .curr").attr("data-id");
	// 			if($(".addrid").length==0){
	// 				$('.fi-state dd').prepend('<a class="addrid" href="javascript:;" data-id="'+itemid+'">'+itemt+'<i class="idel"></i></a>');
	// 			}
	// 			addr = t.data("id");
	// 			t.addClass('curr');
	// 		}
	// 		if(i != 0 && !t.hasClass('curr')){
	// 			t.addClass('curr').siblings('a').removeClass('curr');
	// 			$('.fi-state').show();
	// 			if(id != ''){
	// 				$('.fi-state').show();
	// 				$(".addrid").remove();
	// 				$(".business").remove();
	// 				addr = t.data("id");
	// 				$('.fi-state dd').prepend('<a class="business" href="javascript:;" data-id="'+id+'">'+val+'<i class="idel"></i></a>');
	// 			}else{
	// 				$('.fi-state').hide();
	// 			}
	// 		}
	// 	}
	// 	atpage = 1;
	//
	// 	delState(id);
	// });

	//获取子地区
	function getArea(addrid){
		addrid = addrid=='' || addrid=="undefinde" ? 0 : addrid;
		$.ajax({
            url: "/include/ajax.php?service=house&action=addr",
            type: "POST",
            data: {
            	"type": addrid
            },
            dataType: "jsonp",
			success: function(data){
				if(data.state == 100){
					var list = data.info, html = [];
					html.push('<a data-type="business" data-id="'+addrid+'" href="javascript:;" class="curr">不限</a>');
					for(var i = 0; i < list.length; i++){
						html.push('<a data-type="business" data-id="'+list[i].id+'" href="javascript:;">'+list[i].typename+'</a>');
					}
					$(".pos-sub-item").html(html.join(""));
				}
			}
		});
	}


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
		$('#keywords').val('');
		keywords = '';
		atpage = 1;

	});


})