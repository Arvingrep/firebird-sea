new Vue({
  el:"#page",
  data:{
    loading:false,
    editid:0,  //点击的id
    page:1, //当前页码
    isload:false,
    loadTxt:'加载中',
    list:[],
    dlList:[],
    today:new Date().toDateString(),
    noData:false,
  },
  mounted(){
    var tt = this;
    tt.getList();

    window.onscroll = function(){
			//变量scrollTop是滚动条滚动时，距离顶部的距离
			var scrollTop = document.documentElement.scrollTop||document.body.scrollTop;
			//变量windowHeight是可视区的高度
			var windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
			//变量scrollHeight是滚动条的总高度
			var scrollHeight = document.documentElement.scrollHeight||document.body.scrollHeight;
			//滚动条到底部的条件
			if(((scrollTop + windowHeight + 80) >= scrollHeight) ){
				tt.getList();
			 }
		}
  },
  methods:{
    // 弹窗显示
    showPop(id,ind,i){
      var tt = this;
      tt.editid = id;
      tt.editInd = ind;
      tt.dlInd = i;
      $(".mask").show();
      $(".popBox").css('transform','translateY(0)');
    },
    // 隐藏弹窗
    hidePop(){
      $(".mask").hide();
      $(".popBox").css('transform','translateY(100%)');
    },

    // 隐藏删除弹窗
    hideAlertPop(){
      $(".delMask,.delAlert").removeClass('show');
    },

// 显示删除弹窗
  showAlert(id,ind,i){
    var tt = this;
    tt.editid = id;
    tt.editInd = ind;
    tt.dlInd = i;
    $(".delMask,.delAlert").addClass('show');
  },
    // 修改状态
    change_state(type,status){
      var tt = this;
      if(tt.loading) return false;
      tt.loading = true;
      statuse_op = type == 'update' ? "&status=" + status : "";

      axios({
				method: 'post',
				url: '/include/ajax.php?service=house&action=updateHistory&id='+tt.editid+'&type='+type+statuse_op,
				})
				.then((response)=>{
						var data = response.data;
						tt.loading = false;
						if(data.state == 100){
              if(type=='update'){
                tt.dlList[tt.dlInd].array[tt.editInd].status = status;
              }else{
                  tt.dlList[tt.dlInd].array.splice(tt.editInd,1);
                  if(tt.dlList[tt.dlInd].array.length == 0){
                    tt.dlList.splice(tt.dlInd,1)
                  }
              }
							showErrAlert(data.info);
              if(type == 'del'){
                tt.hideAlertPop();
              }else{
                tt.hidePop();
              }
							// $(".btngroup").css('display','none');
						}else{
							showErrAlert(data.info)
						}
				});

    },
    // 加载数据
    getList(){
      var tt = this;
      if(tt.isload) return false;
      tt.loading = true;
      tt.isload = true;
      tt.loadTxt = '加载中~';
      tt.today = huoniao.transTimes(parseInt(new Date().valueOf()/1000),2); //今天
      axios({
				method: 'post',
				url: '/include/ajax.php?service=house&action=getRecord&type=3&pageSize=10&page='+tt.page,
			})
			.then((response)=>{
        tt.loading = false;
        var data = response.data;
        if(data.state == 100){
          tt.dlList = [];
          var dlist = data.info.list;
          tt.list = [...tt.list,...dlist];
          var dtList = [];
          var dateTime = '';
          for(var i = 0; i<tt.list.length; i++){
            var timeNow = tt.list[i].date.split(' ')[0];
            if(i == 0){
              dtList.push(tt.list[i]);
              dateTime = timeNow;
            }else{
              var timeBefore = tt.list[i-1].date.split(' ')[0];
              if(timeBefore === timeNow){
                dtList.push(tt.list[i]);
              }else{
                if(tt.today == timeBefore){
                  timeBefore = '今天';
                }
                tt.dlList.push({
                  date:timeBefore,
                  array:dtList
                })
                dtList = [];
                dateTime = timeNow;
                dtList.push(tt.list[i]);
              }

            }
          };
          if(tt.today == dateTime){
            dateTime = '今天';
          }
          tt.dlList.push({
            date:dateTime,
            array:dtList
          });

          tt.loadTxt = '下拉加载更多'
          tt.isload = false;
          tt.page++;
          if(tt.page > data.info.pageInfo.totalPage){
            tt.isload = true;
            tt.loadTxt = '没有更多了';
          }
        }else{
          tt.isload = false;
          tt.loadTxt = data.info;
          tt.noData = true;
        }

			});
    }
  }
})
