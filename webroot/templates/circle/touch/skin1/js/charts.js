$(function(){
  	var URL = location.href;
	var URLArrary = URL.split('?');
	var action = URLArrary[1] ? URLArrary[1] : "";
	console.log(action.split('=')[1])
	
	
	
	$('.tab_ul li').click(function(){
		$(this).addClass('on_tab').siblings('li').removeClass('on_tab');
		var index = $(this).index();
		var type = $(this).attr('data-type');
		$('.tab_con').eq(index).addClass('show').siblings('.tab_con').removeClass('show');
		if($(this).attr('data-type')=='topic'){
			getqlist($('.tab_con.show'),'topic')
		}else if($(this).attr('data-type')=='huoyue'){
			getqlist($('.tab_con.show'),'huoyue')
		}else{
			getqlist($('.tab_con.show'),'dianzan')
		}
	});
	
	if(action!=''){
		var name = action.split('=')[1];
		$('.tab_ul li[data-type="'+name+'"]').click();
	}else{
		getqlist($('.tab_con.show'),'');
	}
	
	// 获取话题排行数据
	function getqlist(selector,type) {
		url = "/include/ajax.php?service=circle&action=ranking&mold=0";
		data = {
			'page': '1',
			'pageSize': 10,
			'flag': 'h',
			'type':type
		}
		$.ajax({
			url: url,
			type: "GET",
			data: data,
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [],list2=[];
					$('.topic_ph').find('dd').remove();
					for (var i = 0; i < data.info.list.length; i++) {
						var d = data.info.list[i];
                      var alink = '';
                            if(type=='topic'){
                               alink = d.url
                            }else if(type=='huoyue'){
                               alink = userDomain + d.userid   
                             }else{
                               alink =  userDomain + d.uid  
                            }
						if(type=='topic'){
							list.push('<dd class="table_tr"><div class="t_num">');
							if(i<3){
								list.push('<img src="'+templets_skin+'images/p'+(i+1)+'.png">');
							}else{
								list.push('<em>'+(i+1)+'</em>');
							}
							
							list.push('</div><div class="t_name"><a class="link" href="'+alink+'">'+d.title+'</a></div><div class="t_count">'+d.topic+'</div></a></dd>');
						}else{
							if(d.photo){
								var photo = d.photo;
							}else{
								var photo = "/static/images/noPhoto_60.jpg";
							}
                            
							if(i==0){
								list2.push('<li class="first_li " ><a class="link_box" href="'+alink+'"><div class="head_img"><img src="'+photo+'"><p class="label"><img src="'+templets_skin+'images/num_'+(i+1)+'.png"></p></div><h3>'+d.nickname+'</h3><p class="zan_count">'+d.countnum+'</p></a></li>')
							}else if(i<3){
								list2.push('<li class="three_li "><a class="link_box" href="'+alink+'"><div class="head_img"><img src="'+photo+'"><p class="label"><img src="'+templets_skin+'images/num_'+(i+1)+'.png"></p></div><h3>'+d.nickname+'</h3><p class="zan_count">'+d.countnum+'</p></a></li>')
							}else{
								list.push('<dd class="table_tr"><div class="t_num"><em>'+(i+1)+'</em></div><div class="t_name"><a class="link" href="'+alink+'">'+d.nickname+'</a></div><div class="t_count">'+d.countnum+'</div></dd>');
							}
						}
					}
					selector.find('.three_ul').html(list2.join(''));
					selector.find('dl>dd.table_tr').remove();
					selector.find('dl').append(list.join(''));
				} else {
					// $('.hot_topic').hide();
				}
			},
			error: function(err) {
				console.log('fail');
	
			}
		});
	};
})