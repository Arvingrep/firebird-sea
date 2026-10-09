var userAgent = navigator.userAgent.toLowerCase();

$(function(){
	var str = window.location.hash;
	var type = str.slice(1);
    if(type.indexOf('&')){
        let _type = type.split('&');
        type = _type[0];
    }
	var gettype = '';
	if(type.indexOf('?')>-1){
		type = type.split('?')[0];
		gettype = (window.location.hash.split('?')[1]).split('=')[1]
	}
	console.log(gettype)
	if(type=="commt"){
//		加载评论数据
		commt_list(type,gettype);
		$('.header span').text(langData['siteConfig'][6][114]);//评论
        document.title = langData['siteConfig'][6][114];
	}else{
		//加载点赞数据
		commt_list(type,gettype);
		$('.header span').text(langData['siteConfig'][46][57]);//赞
        document.title = langData['siteConfig'][46][57];
	}
	$.ajax({
	       url: '/include/ajax.php?service=member&action=updateRead&type='+type,
	       type: "GET",
	       dataType: "json",
	       success: function (data) {
		     console.log(langData['siteConfig'][47][0]);//更新完成
	       },
	       error: function(){
	         console.log(langData['siteConfig'][37][80]);  //请求出错请刷新重试
	       }
	});
	var u = navigator.userAgent, app = navigator.appVersion; 
	var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);   //ios终端 
	

	

set_focus($('.textarea'));
	
	$('.btn_group a').click(function(){
		if(!$(this).hasClass('keyboard_btn')){
			$(this).addClass('keyboard_btn');
			$('.im-bq_chose').show();
		}else{
			$(this).removeClass('keyboard_btn');
			$('.im-bq_chose').hide();
		}
		
	});
	$('body').delegate('.textarea','input',function(){
		var t = $(this);
		var str = t.html().toString();
		if(t.html() =='<br>'||t.html()==''){
			$('.addf_btn').removeClass('btn_full');
		}else{
			$('.addf_btn').addClass('btn_full');
		}
	});
	
	
	//点击表情，输入
	var memerySelection
	$('body').delegate('.im-emoji-list li','click',function(e){
		memerySelection = window.getSelection();
		
		var t = $(this),emojsrc = t.find('img').attr('src');
		$('.addf_btn').addClass('btn_full');
		if (/iphone|ipad|ipod/.test(userAgent)) {
	      $('.textarea').append('<img src="'+emojsrc+'" class="emotion-img" />');
	     
	      return false;
	      
	   }else {
//	   	$('.textarea').append('<img src="'+emojsrc+'" class="emotion-img" />');
	      pasteHtmlAtCaret('<img src="'+emojsrc+'" class="emotion-img" />');
	      
	    }
	   
	    document.activeElement.blur();
        return false;
	});
	 //根据光标位置插入指定内容
	function pasteHtmlAtCaret(html) {
      var sel, range;
      if (window.getSelection) {
          sel = memerySelection;
          if (sel.getRangeAt && sel.rangeCount) {
              range = sel.getRangeAt(0);
              range.deleteContents();
              var el = document.createElement("div");
              el.innerHTML = html;
              var frag = document.createDocumentFragment(), node, lastNode;
              while ( (node = el.firstChild) ) {
                  lastNode = frag.appendChild(node);
              }
              range.insertNode(frag);
              if (lastNode) {
                  range = range.cloneRange();
                  range.setStartAfter(lastNode);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
              }
          }
      } else if (document.selection && document.selection.type != "Control") {
          document.selection.createRange().pasteHTML(html);
      }
  }

  //光标定位到最后
	function set_focus(el){
		el=el[0];
		el.focus();
		if($.browser.msie){
			var rng;
			el.focus();
			rng = document.selection.createRange();
			rng.moveStart('character', -el.innerText.length);
			var text = rng.text;
			for (var i = 0; i < el.innerText.length; i++) {
				if (el.innerText.substring(0, i + 1) == text.substring(text.length - i - 1, text.length)) {
					result = i + 1;
				}
			}
      return false;
		}else{
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}
	
	//点击发送
	$('.addf_btn').click(function(){
		if($(this).hasClass('btn_full')){
			var id=$(this).attr('data-id');
			if($('.textarea').html()!=''){
				var content = $('.textarea').html();
				$.ajax({
			        url: '/include/ajax.php?service=member&action=replyComment&id='+id+'&content='+content,
			        type: 'post',
			        dataType: 'json',
			        success: function(data){
			            if(data.state == 100){
			            	showMsg('<img class="gou" src="'+templets_skin+'images/gou.png">'+langData['siteConfig'][44][91]);//已发送
			            	setTimeout(function(){
								$('.reply_page').animate({'bottom':'-100%'},150);
							},1000);
			            }else{
			                alert(data.info);
			            }
			        },
			        error: function(){
			            alert(langData['siteConfig'][46][63]);//网络错误，初始化失败！
			        }
			    });
			}
			
			
		}
	});
	
	$(window).scroll(function(){
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w;
		if ($(window).scrollTop() >= scroll && ! comm_load) {
		   commt_list(type);  
		};
	});
	
	//回复
	$('body').delegate('.reply_btn','click',function(){
		var nickreply = $(this).parent('.f_info').find('.right_info h2').text();
		$('.reply_page').animate({'bottom':0},150);
		$('.textarea').attr('placeholder',langData['siteConfig'][6][29]+nickreply+'：');//回复
		var box_top = $(window).scrollTop();
		$('body').css({'position':'fixed','top':-box_top});
		$('.reply_page .addf_btn').attr('data-id',$(this).attr('data-id'));
		$('body').delegate('.reply_page .back_btn','click',function(){
			$('.reply_page').animate({'bottom':'-100%'},150);
			$('.textarea').html();
			$('body').css('position','static')
			$(window).scrollTop(box_top);
			$('.reply_page .addf_btn').attr('data-id','');
		});
		
	})
	
});
