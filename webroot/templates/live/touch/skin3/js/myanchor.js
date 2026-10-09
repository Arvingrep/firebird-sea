var page=1,isload=0,totalpage=0;
$(function(){
//我的关注
 var swiper = new Swiper('.hotanchor_list.swiper-container', {
      slidesPerView: 4,
      slidesPerGroup: 4,
      loop: false,
      pagination: {
        el: '.hotanchor_pagination',
        clickable: true,
      },
      
    });
    
    
    getlist();
    
    //下拉加载
	$(window).scroll(function(){
		var typeid = $('.right_box .on_li').attr('data-id');
		var srollPos = $(window).scrollTop(); //滚动条距顶部距离(页面超出窗口的高度)
		totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
		if(($(document).height()-50) <= totalheight && !isload) {
			page++;
			getlist();
		}
		
	});
    
    //查看主播个人中心
    $('.live_box').delegate('.head','click',function(){
    	var url = $(this).attr('data-url');
    	window.location.href = url;
    	return false;
    })
    
    
    
    function getlist(){
    	isload = 1;
    	$('.live_box .ulbox').append('<div class="loading"><img src="'+templatePath+'/images/loading.png"/></div>');
	   	$.ajax({
	        url: "/include/ajax.php?service=live&action=alive&page="+page+"&pageSize=10&myfollow=1",
	        type: "GET",
	        dataType: "json", //指定服务器返回的数据类型
	        success: function (data) {
	         if(data.state == 100){
	         	var datalist = data.info.list;
	         	var totalpage = data.info.pageInfo.totalPage;
	         	var list = [];
	         	for(var i=0 ; i<datalist.length; i++){
		         	var className = '', ftime='', care="",txt="";
		         	//直播状态类型
		         	if(datalist[i].state==1){
		         		className = 'living';
		         	}else if(datalist[i].state==2){
		         		className = 'lived';
		         	}else{
		         		className = 'wlive';
		         		ftime='<em>'+datalist[i].ftime+'</em>';
		         		txt="即将开播"
		         	}
		         	list.push('<li class="libox '+className+'">');
						list.push('<a href="'+datalist[i].url+'">');
							list.push('<div class="video_img">');
								list.push('<i class="live_icon">'+ftime+'</i>');
								list.push('<img src="'+datalist[i].litpic+'" />');
								list.push('<div class="look_num">'+datalist[i].click+'</div>');
							list.push('</div>');
							list.push('<div class="live_info">');
								list.push('<h3>'+datalist[i].title+'</h3>');
								list.push('<p><span>#'+(datalist[i].typename?datalist[i].typename:"其他")+'</span>  <em>  '+txt+'</em></p>');
							list.push('</div>');
							list.push('<div class="liver_info">');
								list.push('<div class="head" data-url="'+masterDomain+'/u/user-'+datalist[i].user+'#live"><img src="'+datalist[i].photo+'" /><div class="level_icon fn-hide"><img src=""/></div></div>');
								list.push('<p class="nickname">'+datalist[i].nickname+'</p>');
							list.push('</div>');
						list.push('</a>');
					list.push('</li>');
		         		
		         	}
	
	         	$('.live_box .ulbox .loading').remove();
	         	$('.live_box .ulbox').append(list.join(''));
	         	isload = 0;
	         	if(page>=totalpage){
	         		isload = 1;
	         		$('.live_box .ulbox').append('<div class="loading"><span>已经全部加载</span></div>');
	         	}
	         	
	         }else{
	         	$('.live_box .ulbox .loading').remove();
	         	$('.live_box .ulbox').append('<div class="loading"><span>暂无数据</span></div>');
	         }
	        },
	        error:function(err){
	        	console.log('fail');
	        }
	     });
    }
})
