var page = 1 , isload = 0;
$(function(){
	// getTlist()
	
	// 关注
	$('body').delegate('.care_btn','click',function(){
		var t = $(this),p = t.parents('.dd_box');
		var id = t.attr('data-id');
		var userid = $.cookie(cookiePre+"login_user");
		
		
		if(userid == null || userid == ""){
		 window.location.href = masterDomain+'/login.html';
		  return false;
		}
		
	    if ($(this).hasClass('cared')) {
	        $(this).removeClass('cared').html(langData['circle'][0][1]);  /* 关注*/
	    } else {
	        $(this).addClass('cared').html(langData['circle'][0][50]);  /* 已关注*/
	    }
	  
	    $.post("/include/ajax.php?service=member&action=followMember&id=" + id);
	   
	   
	});

	
	function getTlist(){
		isload = 1;
		$('body').append('<div class="loading_tip"><img src="' + templets_skin + 'images/loading.png" ></div>');
		$.ajax({
			url: '/include/ajax.php?service=circle&action=detail&id='+topicid+'&page='+page+'&pageSize=10',
			type: "GET",
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [];
					if(page==1){
						$('.t_join').find('dd').remove();
					}
					for (var i = 0; i < data.info.list.length; i++) {
						var d = data.info.list[i];
						var cls = '';
						if(d.isfollow==1){
							cls = 'cared';
						}else if(d.isfollow==2){
							cls = 'fn-hide';
						}
						
						list.push('<dd class="dd_box" data-id="'+d.id+'"><a href="'+d.url+'"><div class="l_num">');
						if(i<3){
							list.push('<img src="'+templets_skin+'images/p'+(i+1)+'.png" οnerrοr="javascript:this.src=\'/static/images/noPhoto_40.jpg\' ;" /></div>');
						}else{
							list.push((i+1)+'</div>')
						}
						
						
					    list.push('<div class="l_head"><img src="'+(d.photo?d.photo:"/static/images/noPhoto_60.jpg")+' " οnerrοr="javascript:this.src=\'/static/images/noPhoto_40.jpg\';" />');
						list.push('<div class="v_icon"><img src="'+templets_skin+'images/v_2.png" /></div>');
					    list.push('</div><div class="r_info">');
						list.push('<h3>'+d.name+'</h3><p>'+langData['circle'][2][44].replace('1','100').replace('2',200)+'</p>');   /* 收到1556赞 · 656回复 */
						list.push('<span class="care_btn '+cls+'">'+(d.isfollow==1?langData['circle'][0][50]:langData['circle'][0][49])+'</span></div></a></dd>');  /* */
					}
					$('.t_join dl').append(list.join(''));
					$('.loading_tip').remove();
					if(data.info.list.length<10){
						$('body').append('<div class="loading_tip">'+langData['circle'][0][54]+'</div>');
					}
					// setTimeout(function(){
					// 	isload = 0;
					// 	page++;
					// 	if(page>data.info.pageInfo.totalPage ){
					// 		isload = 1;
					// 		$('body').append('<div class="loading_tip">没有更多了~</div>');  /* 没有更多了*/
					// 	}
					// },500)
					
				} else {
					$('body').append('<div class="loading_tip">'+langData['circle'][0][64]+'</div>');  /*数据加载失败 */
				}
			},
			error: function(err) {
				console.log('fail');
		
			}
		});
	}
});