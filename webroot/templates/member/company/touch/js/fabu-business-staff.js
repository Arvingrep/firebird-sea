var pageVue = new Vue({
	el : "#page",
  data:{
    staffInfo:staffInfo,
		realname:staffInfo.realname,
		edit:staffInfo.access?0:1,
		loading:false,
  },
  mounted(){
		var tt = this;
		$(".accBox li").click(function(){
			var t = $(this), ul = t.closest('ul'), module = ul.attr('data-module');
			t.toggleClass('on_chose');
			tt.edit = 1;
			var arr = [];
			ul.find('li.on_chose').each(function(){
				arr.push($(this).attr('data-id'));
			});
			tt.staffInfo.accArr[module] = arr.join(',');

		})
  },
  methods:{
		// 提交数据
		submitData:function(){
			var tt = this;
			if(tt.loading) return false;
			tt.loading = true;

			var auth = [];
			var shop 	= $('input[name="shop"]').val();
			var shoparr = [],huodongarr = [],tuanarr = [],travelarr = [];
			if(shop && shop!=''){
				shoparr = [];
				shoparr = shop.split(',');
			}
			var huodong = $('input[name="huodong"]').val();

			if(huodong && huodong!=''){
				huodongarr = [];
				huodongarr = huodong.split(',');

			}
			var tuan 	= $('input[name="tuan"]').val();

			if(tuan && tuan!=''){
				tuanarr = [];
				tuanarr = tuan.split(',');

			}
			var travel 	= $('input[name="travel"]').val();

			if(travel && travel!=''){
				travelarr = [];
				travelarr = travel.split(',');

			}


			auth.push({
				'travel':travelarr,
				'tuan':tuanarr,
				'huodong':huodongarr,
				'shop':shoparr,
			});


			if($('input[name="postname"]').val() == ''){
				showErrAlert('请输入职位名称')
				tt.loading = false;
				return false;
			}
			axios({
				method: 'post',
				url: '/include/ajax.php?service=business&action=staffUpdateAuth&dotype=update&updatetype=mobile&id='+staffid+'&auth='+JSON.stringify(auth),
				data:$("#form").serialize()
			})
			.then((response)=>{
				var data = response.data;
				tt.loading = false;
				showErrAlert(data.info);
				location.href = businessstaffurl;
			})
		},

		// 删除员工
		delStaff:function(){
			var tt = this;
			if(tt.loading) return false;
			tt.loading = true;

			axios({
				method: 'post',
				url: '/include/ajax.php?service=business&action=staffUpdateAuth&dotype=delete&id='+staffid,
			})
			.then((response)=>{
				var data = response.data;
				showErrAlert(data.info);
				setTimeout(function(){
					location.href = businessstaffurl;
				},1500)
				tt.loading = true;
			})
		}
  }
})
