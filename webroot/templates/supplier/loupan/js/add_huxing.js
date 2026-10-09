var page = new Vue({
	el:'#page',
	data:{
		navList:navList,
		currid:5,
		hoverid:'',
		buildtypelist:buildtypenames,  //建筑类型
		buildtype:buildtype,
		peitaoList:peitaoList.length>0?peitaoList:[{"name":"","con":""}], //配套信息
	    room:0,  //室
	    hall:0,   //厅
	    guard:0,   //卫
		loading:false, //加载中
		delNow:0,
	},
  methods:{
    // 显示切换账户
		show_change:function(){
			$(".change_account").show()
		},

		// 隐藏切换账户
		hide_change:function(){
			$(".change_account").hide()
		},
		changeDel(d){
			alert(333)
			var tt = this;
			tt.delNow = d
		},
	    // 提交数据
	    submit:function(){

			var tt = this;
			var stop = false;
			var form = $('#form');
				$(".formbox .required").each(function(){
					var t = $(this)
					if(t.find('input').size() == 1 && t.find('input').val()== ''){
						alert(t.find('input').attr('placeholder'));
						stop = true;
						return false;
					}
					if(t.find('input').size() > 1 && t.find('input.imglist-hidden').val()== ''){
						alert(t.find('input.imglist-hidden').attr('placeholder'));
						stop = true;
						return false;
					}

					// if(t.find('textarea').val() == ''){
					// 	alert(t.find('textarea').attr('placeholder'));
					// 	stop = true;
					// 	return false;
					// }

				});

				var dopost = 'add';
				if(id!=''){
					dopost = 'edit';
				}

				axios({
					method: 'post',
					data:form.serialize(),
					url: masterDomain + '/include/ajax.php?service=house&action=apartmentAdd&dopost='+dopost+'&loupanid='+loupanid+'&aid='+id,
				})
				.then((response)=>{
					var data = response.data;
					if(data.state ==100){
						alert(data.info);
					}else{
						alert(data.info);
					}
				});

				if(stop) return false;
    	},

    	// 删除户型
    	delhuxing:function(){
    		var tt = this;
    		tt.delNow = 0;
    		axios({
				method: 'post',
				url: '/include/ajax.php?service=house&action=loupanDel&dopost=delAlbum&deltype=4&loupanid='+loupanid+'&delid='+id,
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					alert(data.info)
					window.location.href= masterDomain+"/supplier/loupan/huxing.html"
				}else{
					alert(data.info)
				}
			});
    	},
  },
  watch:{
  	delNow:function(){
  		if(this.delNow){
  			$(".Popbox.confirm_del,.pop_mask").css('display','block');
  		}else{
  			$(".Popbox.confirm_del,.pop_mask").css('display','none');
  		}
  	}
  }
})
