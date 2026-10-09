new Vue({
	el:'#page',
	data:{
		status:status*1, //店铺状态
		wmOrder:wmOrder,  //外卖点单
		ordervalid:ordervalid, //外卖下单
		selftake:selftake,  //到店自取
		preOrder:preOrder, //预订
		instorestatus:instorestatus, //店内点餐
		LOADING:false,
		weektxt:[{'id':'1','txt':langData['siteConfig'][14][4]},{'id':'2','txt':langData['siteConfig'][14][5]},{'id':'3','txt':langData['siteConfig'][14][6]},{'id':'4','txt':langData['siteConfig'][14][7]},{'id':'5','txt':langData['siteConfig'][14][8]},{'id':'6','txt':langData['siteConfig'][14][9]},{'id':'7','txt':langData['siteConfig'][14][10]},],
		weeks:weeks.split(','),
	},
	mounted() {
		var tt = this;
		mobiscroll.settings = {
		    theme: 'ios',
		    themeVariant: 'light',
			height:40,
			lang:'zh',
			headerText:true,
			calendarText:langData['waimai'][10][71],  //时间区间选择
		};
		// 时间段
		mobiscroll.range('#stime', {
		    controls: ['time'],
		    endInput: '#etime',
			autoCorrect:false,
			hourText:langData['waimai'][11][218],  //'点'
			minuteText:langData['waimai'][6][125],  //分
			secondText:'秒',  //秒
			dateFormat:'hh:mm:ss',
			autoCorrect:false,
			onSet: function (event, inst) {
				var enddate = inst._endDate;
				enddateFormat = tt.formatTime(enddate);
				console.log(enddate)
				var tlen = $(".chose_inp").size();
				if(tlen==3){
					showErr((langData['waimai'][11][220]).replace('1','3'))
					return false;
				}
				$(".time_list").prepend('<span class="chose_inp">'+event.valueText+'-'+enddateFormat+'<em class="del_time"></em><input type="hidden" name="start_time'+(tlen+1)+'"  value="'+event.valueText+'" /><input type="hidden" name="end_time'+(tlen+1)+'"  value="'+enddateFormat+'" /></span>')
				
			}
		});
		
		// 删除选择的时间
		$("body").delegate('.del_time','click',function(){
			var t =$(this);
			t.closest('.chose_inp').remove();
		});
	},
	methods:{
		
		timeChose:function(){
			$("#stime").click();
		},
		// 时间格式化
		formatTime:function(date,type){
			var yy = date.getFullYear();
			var mm = date.getMonth()+1;
			var dd = date.getDate();
			var hh = date.getHours();
			var min = date.getMinutes();
			yy = yy>9?yy:('0'+ yy);
			mm = mm>9?mm:('0'+ mm);
			dd = dd>9?dd:('0'+ dd);
			hh = hh>9?hh:('0'+ hh);
			min = min>9?min:('0'+ min);
			var data ;
			if(type==1){
				data = yy+'-'+mm+'-'+dd
			}else{
				data = hh+':'+min
			}
			return data;
		},
	
		/* 选择星期 */
		arrIn:function(data){
			var arr = this.weeks
			 return this.weeks.indexOf(data)
		},
		shopTypeShow:function(){
			$(".mask_scroll").show();
			$(".scroll_box").css('bottom',0)
		},
		// 确定选择的
		sureChose:function(){
			$(".scroll_box li").removeClass('chose_now');
			$(".scroll_box li.chosed").addClass('chose_before');
			this.cancelChose();
			var str = []
			$(".scroll_box li.chosed").each(function(){
				str.push($(this).text())
			})
			$("#weeks_show").val(str.join(' '))
		},
		select:function(){
			var el = event.currentTarget;
			$(el).toggleClass('chosed');
			if($(el).hasClass('chosed')){
				$(el).addClass('chose_now')
			}else{
				$(el).removeClass('chose_now')
			}
			
		},
		// 取消选择
		cancelChose:function(){
			$(".mask_scroll").hide();
			$(".scroll_box").css('bottom','-6.6rem');
			$(".scroll_box li.chose_now").removeClass('chose_now chosed')
		},
		dataSubmit:function(){
			var form = $("#submitForm"), btn = $('.save_btn');
			var dotype = btn.attr('data-type');
			 $(".scroll_box .chosed").each(function(){
			    var id = $(this).attr('data-id');
			     form.append('<input type="hidden" class="weeks"  name="weeks[]" value="'+id+'">');
			})
			btn.attr('disabled');
			this.LOADING = true;
			axios({
				method: 'post',
				url: '?id='+shopid,
				data:form.serialize()+'&dotype='+dotype,
			}).then((response)=>{
				var data = response.data;
				this.LOADING = false;
				btn.removeAttr('disabled');
				showErr(data.info);
				if(data.state==100){
					location.href="store-detail.php?id="+shopid+'&currentPageOpen=1';
				}
				
			})
		}
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