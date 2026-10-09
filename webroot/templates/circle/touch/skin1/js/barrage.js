$(function(){

// 伪弹幕
	var timer = null;
	var current = []; //存储当前输入框的内容
	var newarr = []; //存储每个弹幕距左边框的距离
	var flag = 0; //标志量
	var num = new Array(); //数组，用来存储划分每个块的序号
	
	
	
	for(var i=0;i<2;i++){
		num.splice(i,0,i);//将整个显示框划分成多个块，并对每个块进行标号
		// console.log(num)
	}
	
	// window.onload = function(){//加载页面发生的事件
	$('.imgcom img').click(function(){
		setTimeout(function(){
			$('.dm_box').show();
		},100)
		clearInterval(timer);//清除定时器
		var len = words.length;
		for(var i = 0;i<2;i++){
			setTimeout(function(){
				var word=words[random(0,words.length-1)];//随机产生一个弹幕的内容
				create(word);//创建一个弹幕
				i = 0;
			},100*random(2,50))//给弹幕随机加一个延迟
		}
		timer = setInterval(move,30);//开启定时器
	});
	
	// 关闭弹幕列表
	$('.pswp__button.pswp__button--close').click(function(){
		clearInterval(timer);//清除定时器
		$('#barrage ul').html('');
		$('.dm_box').hide();
	});
	
	// 隐藏弹幕
	$('.pswp__item').on('tap',function(){
		
		if($('.pswp__ui').hasClass('pswp__ui--hidden')){
			$('.dm_box').fadeIn();
		}else{
			$('.dm_box').fadeOut();
		}
	})
	
	function create(w){//创建一个弹幕
			var list = [];
			list.push('<li class="dm_path">')
			list.push('<div class="ds_li">');
			list.push('<div class="ds_info">');
			list.push('<div class="l_img"><img src="'+w.photo+'"></div>');
			list.push('<h5>'+w.nickname+'</h5></div>');
			list.push('<span class="ds_detail">'+langData['circle'][3][24]+'<em>'+echoCurrency('symbol')+w.amount+'</em></span></div></li>');   //打赏了
			var t= random(0,2);
			$("#barrage").find('ul').append(list.join(''));
			/* var node=document.createElement("div");//创建一个div元素，用来存储弹幕的信息 */
			//console.log(words.length)
			/* node.innerHTML=w; */
			//console.log($("#barrage").offsetHeight)
			/* var t= random(0,num.length-1); */
			//console.log(num)
			/* node.style.top=num[t]*20+"px";//从划分的块中随机选中一块。*/
			// Delete(num[t]);//删除已被选中的块 
			//console.log(t)
			//console.log(node.style.top);
			/* node.style.left="800px";
			node.style.color="#"+randomColor();//随机颜色
			$("#barrage").appendChild(node);//插入子节点 */
			flag++;//创建了一个新弹幕时，更新为0
		
			//console.log(node.offsetLeft)
	}
	
	function move(){
		var arr=$("#barrage").find('li.dm_path');
		  for(var i=0;i<arr.length;i++){
			  newarr.push(arr[i].offsetLeft);//将每个弹幕距左边边框的距离分别存储在newarr数组中
			  arr[i].style.left=newarr[i]+"px";//更新距离
			  newarr[i] = newarr[i] - 2;//每次减少2px
			  // console.log(newarr[i])
			   if(newarr[i]<-200){
					// console.log(arr[i])
			  		newarr[i]=$(window).width();
			  		//console.log(parseInt(arr[i].style.top))
			  		//console.log(arr[i].style.top/20)
			  		arr[i].innerHTML=divHtml(words[random(0,words.length-1)]);
			  		num.splice(num.length,0,parseInt(arr[i].style.left));
			  		var t= random(0,num.length);
			  		// arr[i].style.top=num[t]*20+"px";
			  		// Delete(num[t]);
			  		//console.log(num)
			  		//console.log(node.style.top);
			  		arr[i].style.left = $(window).width()+"px";
			  	
			  
			}
		  }
	}
	function divHtml(w){
		var list = [];
		// list.push('<li class="dm_path">')
		list.push('<div class="ds_li">');
		list.push('<div class="ds_info">');
		list.push('<div class="l_img"><img src="'+w.photo+'"></div>');
		list.push('<h5>'+w.nickname+'</h5></div>');
		list.push('<span class="ds_detail">'+langData['circle'][3][24]+'<em>'+echoCurrency('symbol')+w.amount+'</em></span></div>');
		return list.join('')
	}
	function Delete(m){//从预选块中删除已被选择的块
		for(var i = 0;i < 2;i++){
			if(num[i] == m){
				console.log(m)
				num.splice(i,1);
			}
		}
	}
	 
	function random(m,n){//随机在m、n之间的整数
		return Math.round(Math.random()*(n - m)) + m;
	}
	
})