new Vue({
	el:'#page',
	data:{
		LOADING:false,
		changeOrder:false,
		typeLists:typeList,
		cancel_change:1
	},
	methods:{
		// 更改顺序
		changeSort:function(){
			var el = event.currentTarget;
			var type = $(el).attr('data-type');
			var par = $(el).closest('.type_li');
			$(".r_btns span").addClass('disabled')
			if(type=='up'){
				par.addClass('slide-top');
			    par.prev().addClass('slide-bottom');
				setTimeout(function(){
					par.removeClass('slide-top');
					par.prev().removeClass('slide-bottom');
					par.prev().before(par);
					$(".r_btns span").removeClass('disabled')
				},500)
				
			}else{
				
				par.addClass('slide-bottom');
				par.next().addClass('slide-top');
				setTimeout(function(){
					par.removeClass('slide-bottom');
					par.next().removeClass('slide-top');
					par.next().after(par);
					$(".r_btns span").removeClass('disabled')
				},500)
			}
			
		},
		// 显示隐藏
		changeShow:function(e){
			var el = event.currentTarget;
			var tt =this;

			$(el).toggleClass('active');
			if($(el).hasClass('active')){
				$(el).attr('data-status',1)
			}else{
				$(el).attr('data-status',0)
			}
			var status = $(el).attr('data-status');
			var id	   = $(el).closest('li').attr('data-id');
			axios({
				method: 'post',
				url: '?action=updatestatus&sid='+sid+'&id='+id+'&status='+status,
			})
				.then((response)=>{
					var data = response.data;
					if(data.state==100){
						location.reload();
					}else{
						alert(data.info);
					}
					tt.LOADING = false;
				})
		},
		// 保存修改
		saveChange:function(){
			// this.typeLists = [];
			var tt =this;
			var pxArr = []
			$(".typeList li").each(function () {
				var t = $(this),ii = $(".typeList li").length-t.index(),id=t.attr('data-id');
				pxArr.push({'id':id,'sort':ii})
			});

			let param = new URLSearchParams();
			param.append('upsort', JSON.stringify(pxArr));
			axios({
				method: 'post',
				url: '?action=updatesort&sid='+sid,
				data:param,
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					location.reload();
				}else{
					alert(data.info);
				}
				tt.LOADING = false;
			})

		},
		/* 取消排序 */
		cancelSort:function(){
			this.cancel_change = 0;
		},
		toUrl:function(){
			var el = event.currentTarget;
			var url = $(el).attr('data-url');
			window.location = url;
		}
	}
})
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