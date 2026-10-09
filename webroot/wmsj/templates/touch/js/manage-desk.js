// 数据处理

var desk_list  = [];
if(zhuhao && zhuhao.length>0){
	zhuhao.forEach(function(val){
		if(val[0]){
			desk_list.push({'name':val[0],'change':1})	
		}
	})
}

new Vue({
	el:"#page",
	data:{
		LOADING:false,
		deskList:desk_list,
		erCode:false,
		erCodeImg:'',
		chose_desk:'',
		pressflag:true,
		timeOutEvent:null
	},
	
	methods:{
		add_desk:function(){
			var tt = this;
			var flag = 0;
			if($('.desk_li').length>0){
				$('.desk_li').each(function(){
					if($(this).find('input').val()==''){
						showErr(langData['waimai'][11][118]);   //请输入桌号
						flag = 1;
					}
				})
			}
			if(!flag){
				tt.deskList.push({'name':'','change':0})
			}
			
		},
		del_desk:function(){
			var el = event.currentTarget;
			var li = $(el).closest('li');
			li.remove();
			var type = $(el).attr('data-type')
			this.submitData(type);
		},
		submitData:function(type){
			var submitBox = $("#submitBox")
			var dataList = submitBox.serialize();
			if(!type){
				var el = event.currentTarget;
				type = $(el).attr('data-type')
			}
			var go = true;
			if(type == 'add'){
				$('.desk_li').each(function(){
					if($(this).find('input').val()==''){
						showErr(langData['waimai'][11][118]);   //请输入桌号
						go = false;
					}
				})
			}
			if(!go) return false;
			
			if(this.LOADING) return false;
			this.LOADING = true;
			var tt = this;
			axios({
				method: 'post',
				url: 'manage-store.php',
				data:dataList+'&dotype=desk&sid='+sid
			})
			.then((response)=>{
				var data = response.data;
				this.LOADING = false;
				if(data.state==100){
					if(type=='del'){
						showErr(langData['waimai'][11][225]);  //删除成功
					}else{
						showErr(data.info);
					}
					// setTimeout(function(){
					// 	location.reload();
					// },1000)
				}else{
					showErr(data.info)
				}
			});
		},
		ercode_show:function(){
			this.erCode = !this.erCode;
			var el = event.currentTarget;
			var desk_name = $(el).closest('li').find('input').val();
			var imgUrl = $(el).attr('data-path');
			this.erCodeImg = imgUrl;
			this.chose_desk =   desk_name ;
			return false;
		},

		// 开始触发
		start(){
			const that = this;
			if(that.pressflag){
				clearTimeout(that.timeOutEvent);
				that.timeOutEvent = setTimeout(() => {
					console.log('长按保存图片')
					that.saveImg()
				}, 800);
			}
		},

		move(){
			const thta = this;
			that.pressflag = false
		},

		// 结束触发
		end(){
			const that = this;
			clearTimeout(timeOutEvent)
			that.pressflag = true
		},

		// 保存图片
		saveImg(){
			const that = this
			setupWebViewJavascriptBridge(function (bridge) {
				bridge.callHandler(
					'saveImage',
					{ 'value': that.erCodeImg },
					function (responseData) {
						if (responseData == "success") {
							setTimeout(function () {
								that.pressflag = true
							}, 200)
						}
					}
				);
			});
		},
	},
});


var showErrTimer;
function showErr(data) {
	showErrTimer && clearTimeout(showErrTimer);
	$(".popErr").remove();
	$("body").append('<div class="popErr"><p>' + data + '</p></div>');
	$(".popErr p").css({
		"margin-left": -$(".popErr p").width() / 2,
		"left": "50%"
	});
	$(".popErr").css({
		"visibility": "visible"
	});
	showErrTimer = setTimeout(function() {
		$(".popErr").fadeOut(300, function() {
			$(this).remove();
		});
	}, 1500);
 }