var isload = 0, totalpage=0, page = 1;
var history_search = 'marry_history_search';

$(function(){
	if($('.show.ulbox').size()>0){
		getlist(1,page,'');
	}



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
	}
	
	//搜索提交
	$('#keywords').keydown(function(e){
		if(e.keyCode==13){
			var keywords = $('#keywords').val();
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
			utils.setStorage(history_search, JSON.stringify(history));
		}
	})


	//取消
	$('.cancel_btn').click(function(){
		$('#keywords').val('')
	});
	//删除搜索历史
	$('.search_result').delegate('li>i','click',function(){
		var t =$(this); txt = t.parents('li').find('a').text();
		var history = utils.getStorage(history_search);
		history.splice(history.indexOf(txt),1)
		utils.setStorage(history_search, JSON.stringify(history));
		$(this).parents('li').remove();
		return false;
	});


	//历史搜索记录点击
	$('.search_result').delegate('li','click',function(t){
		if(t.target != $(this).find('i')[0]){
			$('#keywords').val($(this).text());
			$('.form_search').submit();
		}
	})
	

	})

