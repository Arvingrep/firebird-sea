// $(function(){
// 	var orderUrl = masterDomain + '/wmsj/order/waimaiOrderDetail.php?id=';
// 	var audio = new Audio();
// 	audio.src = '/static/audio/notice02.mp3';
// 	var time = null;
//
// 	var modal = '<div class="neworderwrap" style="display:block;"> <div class="mask"></div> <div class="whyform"> <p>您有<span>$count</span>笔新订单</p> <p class="btn"><a href="$url" class="sure">{#$langData['siteConfig'][6][175]#}</a><a href="javascript:;" class="cancel">取消</a></p> </div> </div>';
//
// 	var style = '<style>'
// 			+ '.neworderwrap{/* display: none; */}'
// 			+ '.neworderwrap.show{display: block;}'
// 			+ '.neworderwrap .mask{background: #000; opacity: .4; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 12;}'
// 			+ '.whyform{width: 6.5rem; background: #fff; position: fixed; z-index: 13; top: 2rem; left: .5rem; text-align: center; font-size: .32rem; box-shadow: 0px 0px 12px 2px #6f6a6a;}'
// 			+ '.whyform p{padding: .3rem .2rem;}'
// 			+ '.whyform .textarea{display: block; margin: 0 auto; width: 5.5rem; height: 2rem; border-radius: .1rem; border: .02rem solid #4baf4f; padding: .1rem .2rem;}'
// 			+ '.whyform .textarea.error{border-color: #ff4758;}'
// 			+ '.whyform .btn{display: -webkit-box; padding: 0; margin-top: .4rem;}'
// 			+ '.whyform .btn a{display: block; color: #4baf4f; -webkit-box-flex: 1; padding: .2rem 0;}'
// 			+ '</style>';
// 	$('head').append(style);
//
// 	function getList(){
// 		$.ajax({
// 	        url: '/wmsj/index.php?action=checkLastOrder',
// 	        type: "post",
// 	        dataType: "json",
// 	        success: function(res){
// 	        	clearTimeout(time)
// 	            if(res.state == 100 && res.count > 0){
// 	                audio.play();
//
// 	                var mask = modal.replace('$count', res.count).replace('$url', orderUrl+res.aid);
// 	                $('.neworderwrap').remove();
// 	                $('body').append(mask);
//
// 	                var t = 1;
// 	                time = setInterval(function(){
// 	                	if(t%2 == 0){
// 	                		$(".foot1 a").html('<i></i>');
// 	                	}else{
// 		                	$(".foot1 a").html('<i></i>新订单');
// 		                }
// 		                t++;
// 	                },500)
// 	            }else{
// 	            	$(".foot1 a").html('<i></i>订单');
// 	            }
// 	            setTimeout(function(){
// 	            	getList();
// 	            },5000);
// 	        },
// 	        error: function(){
// 	        	getList();
// 	        }
// 	    })
// 	}
//
// 	setTimeout(function(){
// 		getList();
// 	}, document.title == '订单详情' ? 5000 : 0)
//
// 	$("body").delegate('.neworderwrap .cancel, .mask', 'click', function(){
// 		$('.neworderwrap').remove();
// 	})
//
// })
