var isload = 0, totalpage=0, page = 1;
var history_search = 'index_history_search';

$(function(){


	//下拉加载
	$(window).scroll(function(){

		var srollPos = $(window).scrollTop(); //滚动条距顶部距离(页面超出窗口的高度)
		totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
		if(($(document).height()-50) <= totalheight && !isload) {
			page++;
			getlist();
		}
	});
	getlist();
	//获取数据的方法
	function getlist(){
		isload =1;
		$('.ulbox').append('<div class="loading"><img src="'+templatePath+'/images/loading.png"/></div>');
		$.ajax({
        url: "/include/ajax.php?service=live&action=alive&orderby=click&uid="+uid+"&pageSize=5&page="+page,
        type: "GET",
        dataType: "json", //指定服务器返回的数据类型
        success: function (data) {
         if(data.state == 100){
         	var datalist = data.info.list;
         	var totalpage = data.info.pageInfo.totalPage;
         	$('.tabbox li.active').attr('data-total',totalpage );
         	var list = [];
         	for(var i=0 ; i<datalist.length; i++){
         		var state = datalist[i].state
         		var className = '', ftime='' ,care='',txt="";
         		if(state==1){
         			className = 'living';
         			txt = langData['siteConfig'][10][24];//直播

         		}else if(state==2){
         			className = 'live_after';
         			txt = langData['siteConfig'][31][137];//精彩回放
         		}else{
         			className = 'live_before';
         			txt = langData['business'][5][124];//预告
         		}
         		var pic = datalist[i].litpic != "" && datalist[i].litpic != undefined ? huoniao.changeFileSize(datalist[i].litpic, "small") : "/static/images/404.jpg";
         		list.push('<li class="video_box libox">');
         		list.push('	<div class="video_img">');
         		list.push('		<a href="'+datalist[i].url+'">');
         		list.push('		<div class="video_top">');
         		list.push('			<span class="video_state '+className+'">'+txt+'</span><span class="look_num">52人</span>');
         		list.push('		</div>');
         		list.push(`		<img src="${pic}" onerror="this.src='/static/images/404.jpg'"/>`);
         		list.push('		</a>');
         		list.push('	</div>');
         		list.push('	<div class="info_box">');
         		list.push('		<div class="anchor_img">');
         		list.push('			<a href="'+masterDomain+'/user/'+datalist[i].user+'#live">');
         		list.push('				<img src='+(datalist[i].photo?datalist[i].photo:"/static/images/noPhoto_40.jpg")+' />');
         		list.push('			</a>');
         		list.push('		</div>');
         		list.push('		<div class="video_info">');
         		list.push('			<p>#'+(datalist[i].typename?datalist[i].typename:langData['siteConfig'][19][201])+'</p>');//其他
         		list.push('			<h3><a href="'+datalist[i].url+'">'+datalist[i].title+'</a></h3>  ');
         		list.push('		</div>');
         		list.push('	</div>');
         		list.push('</li>');

         	}
         	$('.ulbox .loading').remove();
         	$('.ulbox').append(list.join(''));
         	isload = 0;
         	if(page>=totalpage){
         		isload = 1;
         		$('.ulbox').append('<div class="loading"><span>'+langData['siteConfig'][47][6]+'</span></div>');//已经全部加载
         	}

         }else{
         	$('.ulbox .loading').remove();
         	$('.ulbox').append('<div class="loading"><span>'+langData['business'][5][125]+'</span></div>');//暂无数据
         }
        },
        error:function(err){
        	console.log('fail');
        }
     });
	}


})
