var page=1,isload=0,totalpage=0;
$(function(){
	getanchor();
	
	//取消关注
	$('.listbox').delegate('button.carebtn','click',function(){
		var t = $(this);
		var userid = $.cookie(cookiePre+"login_user");
		 if(userid == null || userid == ""){
			 location.href = masterDomain + '/login.html';
			 return false;
		}
		if(t.hasClass("disabled")) return false;
		if(t.hasClass('cared')){
			$('.carebox,.mask0').addClass('show');
			$('.carebox.show li').click(function(){
				if(!$(this).hasClass('nocare')){
					$('.carebox,.mask0').removeClass('show');
					return false;
				}else{
					$('.carebox,.mask0').removeClass('show');
					t.removeClass('cared');
					t.text('关注')
					$.post("/include/ajax.php?service=member&action=followMember&id="+t.attr("data-id"), function(){});
				}
			});
			
		}else{
			t.addClass('cared');
			t.text('已关注')
			$.post("/include/ajax.php?service=member&action=followMember&id="+t.attr("data-id"), function(){});
		}
    	return false;
	})

	 //下拉加载
	$(window).scroll(function(){
		var typeid = $('.right_box .on_li').attr('data-id');
		var srollPos = $(window).scrollTop(); //滚动条距顶部距离(页面超出窗口的高度)
		totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
		if(($(document).height()-50) <= totalheight && !isload) {
			page++;
			getanchor();
		}
		
	});
   //获取主播数据
   function getanchor(){
   	    isload =1;
   	    $('.listbox ul').append('<div class="loading"><img src="'+templatePath+'images/loading.png"/></div>');
   		$.ajax({
	        url: "/include/ajax.php?service=live&action=anchorList&page="+page+"&pageSize=20",
	        type: "GET",
	        dataType: "json", //指定服务器返回的数据类型
	        success: function (data) {
	         if(data.state == 100){
	         	var datalist = data.info.list;
	         	var totalpage = data.info.pageInfo.totalPage;
	         	var list = [];
	         	for(var i=0 ; i<datalist.length; i++){
	         		var cname = '' ,txt = '';
			        //地址 处理
			        if(datalist[i].addrname){
			        	var len = datalist[i].addrname.length;
			        	if(len>=3){
			        		addr = datalist[i].addrname[1]+' '+datalist[i].addrname[2]+' '+datalist[i].addrname[3]
			        	}else if(len=2){
			        		addr = datalist[i].addrname[1]+' '+datalist[i].addrname[2]
			        	}else{
			        		addr = datalist[i].addrname[1]
			        	}
			        }else{
			        	addr="未填写"
			        }
	         		if(datalist[i].isMfollow=='1'){
	         			cname = 'cared'
	         			txt='已关注'
	         		}else if(datalist[i].isMfollow=='2'){
	         			cname ='disabled';
	         		}else{
	         			txt = '关注'
	         		}
	         		
	         		list.push('<li class="libox">');
						list.push('<a href="'+masterDomain+'/u/user-'+datalist[i].uid+'#live" class="fn-clear">');
							list.push('<div class="left_head"><img src="'+(datalist[i].photo?datalist[i].photo:"static/images/noPhoto_40.png")+'"/><i class="icon">'+(datalist[i].level['icon']?"<img src="+datalist[i].level['icon']+" />":"")+'</i></div>');
							list.push('<button class="carebtn '+cname+'" data-id="'+datalist[i].uid+'">'+txt+'</button>');
							list.push('<div class="anchor_info">');
								list.push('<h3>'+datalist[i].nickname+'</h3>');
								list.push('<p>'+addr+'</p>');
							list.push('</div>');
						list.push('</a>');
					list.push('</li>');
	         	}
	
	         	$('.listbox .loading').remove();
	         	$('.listbox ul').append(list.join(''));
	         	isload = 0;
	         	if(page >= totalpage){
	         		isload = 1;
	         		$('.listbox ul').append('<div class="loading"><span>已经全部加载</span></div>');
	         	}
	         	
	         }else{
	         	$('.listbox .loading').remove();
	         	$('.listbox ul').append('<div class="loading"><span>暂无数据</span></div>');
	         }
	        },
	        error:function(err){
	        	console.log('fail');
	        }
	     });	
   }
});
