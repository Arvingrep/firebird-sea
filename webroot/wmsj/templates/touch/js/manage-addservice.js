var mob;
var VM = new Vue({
	el:'#page',
	data:{
		open_addservice:open_addservice,  //开启增值服务
		addservice:addservice?addservice:[],   //增值服务列表
		open_promotion:open_promotion*1,  //开启满减活动
		promotions:promotions?promotions:[],  //满减
		offline_limit:offline_limit*1,   //货到付款金额限制
		paytype:paytype*1,  //开启货到付款
		smsvalid:smsvalid*1, //短信订单通知
		emailvalid:emailvalid*1,  //邮箱通知
		weixinvalid:weixinvalid * 1, //微信通知
		appvalid:appvalid*1, //app订单提醒
		auto_printer:auto_printer*1, //打印机自动打印
		selfdefine:selfdefine,  //自定义
		merchant_deliver:merchant_deliver*1 ,//商家自配
		delivery_fee_mode:delivery_fee_mode ,//配送模式
		delivery_fee_type:(typeof(delivery_fee_type)!='undefined')?delivery_fee_type*1:0,  //配送费满减
		range_delivery_fee_value:(typeof(range_delivery_fee_value)!='undefined')?range_delivery_fee_value:0, //按距离
		preset:preset?preset:[],//预设选项
		LOADING:false,
	},
	filters:{
		ToArr(str){
			return srt.split(',')
		}
	},
	mounted() {
		var tt = this;
		if(typeof(mobiscroll) !='undefined'){
			mobiscroll.settings = {
				theme: 'ios',
				themeVariant: 'light',
				height:40,
				lang:'zh',
				
				headerText:true,
				calendarText:langData['waimai'][10][71],  //时间区间选择
			};
			mob = mobiscroll.range('#startTime', {
				controls: ['time'],
				endInput: '#stopTime',
				autoCorrect:false,
				hourText:langData['waimai'][11][218],  //'点'
				minuteText:langData['waimai'][6][125],  //分
				onSet: function (event, inst) {
				}
			});
			
		}
		$("#startTime,#stopTime").change(function(){
			var index = $('.select.onchose').attr('data-index');
			tt.addservice[index][2] = $('#stopTime').val();
			tt.addservice[index][1] = $('#startTime').val();
			tt.$forceUpdate();  //强制渲染
		})
		var dotype = $(".save_btn").attr('data-type');
		if(dotype == 'selfdefine'){
			var arr = [{'title':langData['waimai'][6][70],'id':'link'},{'title':langData['waimai'][6][71],'id':'content'}]  ; //外链  内容
			var instance = mobiscroll.select('#typename', {
					data:arr,
					dataText:'title',
					dataValue:'id',
					onSet: function (event, inst) {
						var index = $('.onselect').attr('data-index');
						$('.onselect').val(event.valueText)
						tt.selfdefine[index][0] = inst._tempWheelArray[0];
						// $('.onselect').siblings('input[name="selfdefine[type][]"]').val(inst._tempWheelArray[0])
					},
				})
		}
	},
	methods:{
		//新增增值服务
		new_service:function(){
			var tt = this;
			var add = true;
			this.addservice.forEach(function(val){
				if(val[0]=='' || val[3]==''){
					showErr(langData['waimai'][11][223]);  //请输入内容再添加
					add = false;
				}
			});
			if(add){
				tt.addservice.push(['','00:00','00:00',''])
			}	
		},
		// 移除增值服务
		removeArr:function(index,arr){
			arr.splice(index,1)
		},
		
		trggleFun:function(name){
			console.log('22')
			 $("#"+name).click();
			 var el = event.currentTarget;
			 $('.select').removeClass('onchose');
			 $(el).closest('.select').addClass('onchose');
			 
		},
		// 新增满减
		new_manjian:function(){
			var tt = this;
			var add = true;
			this.promotions.forEach(function(val){
				console.log(val)
				if(val[0]=='' && val[1]==''){
					showErr(langData['waimai'][11][223]);  //请输入内容再添加
					add = false;
				}
			});
			if(add){
				tt.promotions.push(['',''])
			}	
		},
		
		// 新增自定义
		new_selfdefine:function(){
			var tt = this;
			var add = true;
			this.selfdefine.forEach(function(val){
				if(val[2]=='' && val[1]==''){
					showErr(langData['waimai'][11][223]);  //请输入内容再添加
					add = false;
				}
			});
			if(add){
				tt.selfdefine.push(['link','',''])
			}	
		},
		// 选择自定义内容分类
		select_self:function(index){
			var el = event.currentTarget;
			$('#typename').click();
			$(".inpbox.selectinp").find('input').removeClass('onselect')
			$(el).addClass('onselect');
		},
		
		// 配送方案
		add_range:function(){
			var tt = this;
			var add = true;
			this.range_delivery_fee_value.forEach(function(val){
				if(val[0]=='' && val[1]=='' && val[3]=='' && val[4]==''){
					showErr(langData['waimai'][11][223]);  //请输入内容再添加
					add = false;
				}
			});
			if(add){
				tt.range_delivery_fee_value.push(['','','',''])
			}	
		},
		// 处理选项
		ToArr(str){
			return str.split(',')
		},
		// 删除选项数据
		changeArr:function(index,ii,str){
			var strArr = str.split(',');
			strArr.splice(ii,1);
			 this.preset[index][3] = strArr.join(',');
			 this.$forceUpdate();  //强制渲染
		},
		// 新增选项
		addxu:function(index){
			var arr = this.preset[index][3].split(',');
			if(arr.indexOf('')>-1){
				showErr(langData['waimai'][11][224]);  //'请输入选项值'
			}else{
				this.preset[index][3] = this.preset[index][3]+',';
				this.$forceUpdate();  //强制渲染
			}
		},
		
		// 链接值
		xuanxiang:function(index,ii){
			var str = '';
			var el  = event.currentTarget;
			var val = $(el).val();
			var arr  = this.preset[index][3].split(',');
			if(val!=''){
				arr[ii]= val;	
			}else{
				arr.splice(ii,1)
			}
			this.preset[index][3] = arr.join(',')
		
			
			
			this.$forceUpdate();  //强制渲染
			
		},
		// 新增大选项
		new_option:function(type){
			this.preset.push([type,'0','',''])
		},
		
		// 提交数据
		submitDate:function(){
			var el = event.currentTarget;
			var change = $(el).attr('data-change')
			var dotype = $(el).attr('data-type')
			if(this.LOADING) return false;
			this.LOADING = true;
			var tt = this;
			if(change){
				tt.merchant_deliver = !tt.merchant_deliver;
				$("#Config_is_merchant_deliver").val('0')
			}
			var submitBox = $("#submitBox");
			var dataList = submitBox.serialize();
			console.log(submitBox.serializeArray())
			
			axios({
				method: 'post',
				url: 'manage-store.php',
				data:dataList+'&dotype='+dotype+'&sid='+sid
			})
			.then((response)=>{
				var data = response.data;
				this.LOADING = false;
				if(data.state==100){
					showErr(data.info);
					setTimeout(function(){
						location.reload()
					},500)
				}else{
					showErr(data.info)
				}
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