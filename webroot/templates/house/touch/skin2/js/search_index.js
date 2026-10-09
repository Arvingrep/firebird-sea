
var history_search = 'school_history_search';

$(function(){
	//搜索页面	
	//加载历史记录
	var shlist = [];
	var history = utils.getStorage(history_search);

	if(history){
		history.reverse();
		for(var i = 0; i < history.length; i++){
			shlist.push('<li><a href="javascript:;">'+history[i]+'</a><i class=""></i></li>');
		}
		$('.search_result ul').html(shlist.join(''));
		$('.search_result').show();	

	}
	//搜索提交
	$('#keywords').keydown(function(e){
		if(e.keyCode==13){
			var keywords = $('#keywords').val();
			var type = $('.chose_type').attr('data-type');
			if(!keywords){
				return false;
			}
			//记录搜索历史
			var history = utils.getStorage(history_search);
			history = history ? history : [];
			if(history && history.length >= 10 && $.inArray(keywords, history) < 0){
				history = history.slice(1);
			}

			// 判断是否已经搜过
			if($.inArray(keywords, history) > -1){
				for (var i = 0; i < history.length; i++) {
					if (history[i] === keywords) {
						history.splice(i, 1);
						break;
					}
				}
			}
			history.push(keywords);
			var hlist = [];
			for(var i = 0; i < history.length; i++){
				hlist.push('<li><a href="javascript:;">'+history[i]+'</a><i class=""></i></li>');
			}
			$('.search_result ul').html(hlist.join(''));
			$('.search_result').show();
			utils.setStorage(history_search, JSON.stringify(history));
		}
	})


	//删除搜索历史
	$('.search_result').delegate('li>i','click',function(){
		var t =$(this); txt = t.parents('li').find('a').text();
		var history = utils.getStorage(history_search);
		history.splice(history.indexOf(txt),1)
		utils.setStorage(history_search, JSON.stringify(history));
		$(this).parents('li').remove();
		console.log(history)
		return false;
	});



	//搜索切换 
	$('.chose_type').click(function(){
		$('.chose_box').toggle();
		$(this).toggleClass('curr');
		
	});
	$('.chose_box li').click(function(){
		var txt = $(this).text();
		var type = $(this).attr("data-type");
		$('.chose_type').text(txt).attr('data-type',type);
		$('#searchtype').val(type)
		$('.chose_box').hide();
		$('.chose_type').removeClass('curr');
	})

	//历史搜索记录点击
	$('.search_result').delegate('li','click',function(t){
		if(t.target != $(this).find('i')[0]){
			$('#keywords').val($(this).text());
			$('.form_search').submit();
		}
	})


})




