new Vue({
	el:'#page',
	data:{
		weekShow:weekshow*1,
		LOADING:false,
		del_sure:0,
	},
	mounted:function(){
		/* 默认选择 */
		var weekArr = week.split(',');
		if(weekArr.length==7){
			$('.weekList span').addClass('chosed')
		}else{
			weekArr.forEach(function(val){
				$('.weekList span[data-day="'+val+'"]').addClass('chosed')
			})
		}
		
		mobiscroll.settings = {
		    theme: 'ios',
		    themeVariant: 'light',
			height:40,
			lang:'zh',
			autoCorrect:false,
			hourText:langData['waimai'][11][218],  //'点'
			minuteText:langData['waimai'][6][125],  //分
			headerText:true,
			calendarText:langData['waimai'][10][71],  //时间区间选择
		};
		
		mobiscroll.range('#stime', {
		    controls: ['time'],
		    endInput: '#etime',
			onSet: function (event, inst) {
				
			}
		});
	},
	methods:{
		chose_day:function(){
			var el = event.currentTarget;
			var type = $(el).attr('data-day');
			if(type=='all'){
				$(el).toggleClass("chosed");
				if($(el).hasClass("chosed")){
					$('.weekList span').addClass('chosed')
				}else{
					$('.weekList span').removeClass('chosed')
				}
				
			}else{
				$(el).toggleClass("chosed");
				$('.weekList span[data-day="all"]').removeClass("chosed")
			}
			
		},
		save_type:function(){
			this.LOADING = true;
			var el = event.currentTarget;
			$(el).addClass('disabled')
			var form = $("#submitForm"); 
			var data = form.serialize();
			var weekid = []
			$(".weekList span").each(function(){
				var t = $(this);
				if(t.hasClass('chosed')){
					weekid.push('week[]='+t.attr('data-day'));
				}
			})
			
			axios({
				method: 'post',
				url:'waimaiFoodTypeAdd.php',
				data:data+'&'+weekid.join('&'),
			}).then((response)=>{
				var data = response.data
				if(data.state==100){
					showErr(data.info);
					setTimeout(function(){
						location.href = '/wmsj/shop/goods-type.php?sid='+sid+'&currentPageOpen=1';
					},1510)
				}else{
					showErr(data.info);
				}
				this.LOADING = false;
				$(el).removeClass('disabled');
				
			})
		},
		del_type:function(){
			
			this.LOADING = true;
			var el = event.currentTarget;
			$(el).addClass('disabled');
			// {action: "delete", id: activeFid}
			let param = new URLSearchParams();
				param.append('action', 'delete');
				param.append('id', id);
			axios({
				method: 'post',
				url:'waimaiFoodType.php',
				data:param,
			}).then((response)=>{
				var data = response.data
				if(data.state==100){
					showErr(data.info);
					setTimeout(function(){
						location.href = '/wmsj/shop/goods-type.php?sid='+sid;
					},1510)
				}else{
					showErr(data.info);
				}
				this.LOADING = false;
				$(el).removeClass('disabled');
				
			})
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