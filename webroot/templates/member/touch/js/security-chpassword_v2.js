var pageVue = new Vue({
	el : "#chpsd_page",
	data:{
		phoneCheck:phoneCheck,
		emailCheck:emailCheck,
	},
	methods:{
		// 显示弹出层
		showPop:function(){
			$(".pop_mask, .pop_agree").show();
		},
		
		// 隐藏弹出层
		hidePop:function(){
			$(".pop_mask, .pop_agree").hide();
		},
		
		// 修改密码
		change_psd:function(){
			var el = event.currentTarget;
			var  t = this;
			var old = $("#old"), 
				newest = $("#new"), 
				confirm = $("#confirm");
				
			if(old.size()>0 && old.val()==''){
				showErrAlert(langData['siteConfig'][20][240]);  //请输入原密码
				old.focus();
				return false;
			}
			
			if(newest.val() == ""){
				showErrAlert(langData['siteConfig'][20][84]);   //请输入新密码
				newest.focus();
				return false;
			}
			
			if(confirm.val() == ""){
				showErrAlert(langData['siteConfig'][5][14]);  //请确认新密码
				confirm.focus();
				return false;
			}
			  
			if(newest.val() != confirm.val()){
				showErrAlert(langData['siteConfig'][20][242]);  //两次密码不一样
				confirm.focus();
				return false;
			}
			
			var param = "old="+old.val()+"&new="+newest.val()+"&confirm="+confirm.val();
			$(el).addClass('disabled')
			axios({
				method: 'post',
				url:  "/include/ajax.php?service=member&action=updateAccount&do=password", 
				data:param,
			})
			.then((response)=>{
				var data = response.data;
				showErrAlert(data.info);
				$(el).removeClass('disabled')
				if(data.state == 100){
					location.href = backUrl;
				}
			})
		},
	}
})