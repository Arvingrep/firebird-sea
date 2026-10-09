var device = navigator.userAgent;
new Vue({
	el:"#page",
	data:{
		cancel_order:false,
		hui_show:false,
		address:userAddress,
		peisong:peisong,
		datainfo:{},
		receivingdate:'',
	},
	mounted(){
		// if (device.indexOf('huoniao_Android') <= -1 && device.indexOf('huoniao_iOS') <= -1){
		// 	$(".map_icon").remove();
		// 	$(".customer_left .address").removeClass('fn-hide');
		// }else{
		// 	$(".customer_left .juli").removeClass('fn-hide')
		// }
		this.datainfo.lnglat = lng+','+lat;  //顾客位置
		this.datainfo.qslnglat = peisonglat+','+peisonglng;  //骑手位置
		this.datainfo.slnglat = slng+','+slat;  //骑手位置
		this.datainfo.address = userAddress; //地址
		this.datainfo.juliuser = juliuser; //距离
		this.datainfo.tel = tel; //电话
		this.datainfo.username = user;  //顾客姓名
		this.datainfo.merchant_deliver = merchant_deliver; //商家配送			 
		// location.href = 'waimaiOrderMap.php?datainfo='+JSON.stringify(datainfo);
		if(receivingdate){
			this.receivingdate = this.transTimes(receivingdate,5);
		}
	},
	methods:{
		opOrder:function(){
			var tt = this;
			var el = event.currentTarget;
			var type = $(el).attr('data-type')
			let param = new URLSearchParams();
			var id = orderid;
			if(type=="jiedan"){
				param.append('action', 'confirm');
			}else if(type=="cancel"){
				var note = $("#note").val();
				if(note==''){
					showErr('请输入失败原因');
					return false;
				}
				id = $(el).attr('data-id')
				param.append('action', 'failed');
				param.append('note', note);
			}else if(type=='songda'){
				param.append('action', 'ok');
			}else if(type == "mealtime"){
				param.append('action', 'mealtime');
			}
			param.append('id', id);


			axios({
				method: 'post',
				url: 'waimaiOrder.php',
				data: param,
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					showErr(data.info);//操作成功
					if(type=='cancel'){
						this.cancel_order = 0;
					}
					// location.reload();
					var url = window.location.href;
					location.href = url+'&currentPageOpen=1'
				}else{
					showErr(data.info)
				}
			})

		},
		printOrder:function(){
			var id = orderid;
			let param = new URLSearchParams();
			param.append('id', id);
			param.append('action', 'print');
			var comfirm = confirm(langData['waimai'][6][141]);
			if(comfirm){
				axios({
					method: 'post',
					url: 'waimaiOrder.php',
					data: param,
				})
				.then((response)=>{
					var data = response.data;
					if(data.state=100){
						showErr(data.info)
					}else{
						showErr(langData['waimai'][6][142])
					}
				})
			}else{
				showErr('已取消')
			}

		    return false;
		},
		//跳转导航
		daohang:function(lng,lat,person,address){
		  if (device.indexOf('huoniao_Android') > -1 || device.indexOf('huoniao_iOS') > -1) {
			setupWebViewJavascriptBridge(function(bridge) {
				 bridge.callHandler("skipAppDaohang", {
					"lat": lat,
					"lng": lng,
					"addrTitle": person,
					"addrDetail": address
				}, function(responseData) {});
			})
		  }
		  
		},
		transTimes: function(timestamp, n){

			const dateFormatter = huoniao.dateFormatter(timestamp);
			const year = dateFormatter.year;
			const month = dateFormatter.month;
			const day = dateFormatter.day;
			const hour = dateFormatter.hour;
			const minute = dateFormatter.minute;
			const second = dateFormatter.second;
	
			if(n == 1){
				return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
			}else if(n == 2){
				return (year+'-'+month+'-'+day);
			}else if(n == 3){
				let curr_year = new Date().getFullYear();
				if(curr_year == year){
					return (month+'-'+day+' '+hour+':'+minute);
				}else{
					return (year+'-'+month+'-'+day+' '+hour+':'+minute);
				}
			}else if(n == 4){
				return dateFormatter;
			}else if(n == 5){
				return year+'年'+month+'月'+day + '日' + ' ' +hour+'点'+minute + '分' ;
			}else{
				return 0;
			}
		},
		tomap:function(){
		 //  if (device.indexOf('huoniao_Android') > -1 || device.indexOf('huoniao_iOS') > -1) {
			// setupWebViewJavascriptBridge(function(bridge) {
			// 	 bridge.callHandler("skipAppMap", {
			// 		"lat": lat,
			// 		"lng": lng,
			// 		"addrTitle": person,
			// 	}, function(responseData) {});
			// })
		 //  }
		  location.href = 'waimaiOrderMap.php?datainfo='+JSON.stringify(this.datainfo);
		},
	}
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
