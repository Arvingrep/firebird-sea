$(function () {
	var showCheckPop = hn_getCookie('showCheckPop')
	var showExpiredPop = hn_getCookie('showExpired')


	// 到期提醒---倒计时
	if( memberExpired == '1'){
		$(".daoqi_mask,.daoqiPop").show();
		
	}


	if(memberExpiredDay  != '' && !showExpiredPop){
		$(".daoqi_mask,.daoqiPop").show();
	}

	

	
	$(".btn_close").click(function(){
		$(".daoqi_mask,.daoqiPop").hide();
		if(!memberExpired){
			$.cookie('showExpired', '1', { expires: 1 });  
		}
	});



	if(memberExpired != '1'){

		if(storeState != '0'){
			if(storeState != '1'){
				$(".pubMask,.pubAlert").addClass('show')
			} else{
				if((!showCheckPop || showCheckPop == null) && editModuleJoinCheck == '0'){
					$(".pubMask,.pubAlert").addClass('show')
				}
			}
		}

		if(storeState != '1'){
			$.cookie('showCheckPop', '');
		}
	}

	// 隐藏弹窗
	$(".closePubAlert,.cancelDel ").click(function(){
		if(storeState == '1'){
			$.cookie('showCheckPop', 1 , { 
		         expires:30 //设置时间，如果此处留空，则浏览器关闭此cookie就失效。
		       });
		}
		 $(".pubMask,.pubAlert").removeClass('show')
	})


	$(".pubAlert").click(function(){
		if(storeState == '1'){
			$.cookie('showCheckPop', 1, { 
	         expires:30 //设置时间，如果此处留空，则浏览器关闭此cookie就失效。
	       });
		}
	})

	// 店铺未审核之前 按钮点击显示弹窗
	$(".storeindex,.yingxiao .orderType a,.spmanage a,.checkAfter a").click(function(e){
		var href = $(this).attr('href');

		if(memberExpired != '1'){
			if(storeState != '1' && href != configHref){

				 $(".pubMask,.pubAlert").addClass('show')
				return false;
			}	
		}else{
			$(".daoqi_mask,.daoqiPop").show();
			return false;
		}

	});

	$(".feature a").click(function(){
		if(memberExpired == '1'){
			$(".daoqi_mask,.daoqiPop").show();
			return false;
		}
	})




})