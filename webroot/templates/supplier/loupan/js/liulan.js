var page = new Vue({
  el:'#page',
  data:{
    navList:navList,
		currid:12,
		hoverid:'',
		loading:false,
    list:['1'],
  },
  mounted(){
    this.getList()
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

    // 修改状态
		changeState:function(state,id,index,type){
			var tt = this;
			if(tt.loading) return false;
      optype = type ? type : 'update' ;
      statuse_op = optype == 'update' ? ('&status='+state) : '';
      if(optype == 'del'){
        $.dialog.confirm(langData['siteConfig'][20][543], function(){
          tt.loading = true;
          axios({
            method: 'post',
            url: '/include/ajax.php?service=house&action=updateHistory&id='+id+'&type='+optype+statuse_op,
          })
          .then((response)=>{
            var data = response.data;
            tt.loading = false;
            if(data.state == 100){
              if(optype=='update'){
                tt.list[index].status = state;
              }else{
                atpage = 1;
                tt.getList()
              }
              alert(data.info);
              // $(".btngroup").css('display','none');
            }else{
              alert(data.info)
            }
          });
        })
      }else{
        tt.loading = true;
        axios({
          method: 'post',
          url: '/include/ajax.php?service=house&action=updateHistory&id='+id+'&type='+optype+statuse_op,
        })
        .then((response)=>{
          var data = response.data;
          tt.loading = false;
          if(data.state == 100){
            if(optype=='update'){
              tt.list[index].status = state;
            }else{
              atpage = 1;
              tt.getList()
            }
            alert(data.info);
            // $(".btngroup").css('display','none');
          }else{
            alert(data.info)
          }
        });
      }
		},
    // 获取列表
		getList:function(currid,dotype){
			var tt = this;
			// atpage  页码  pageSize 单页加载数据条数      totalCount  数据总数  需在加载之后复制
			tt.showPageInfo(currid)
			if(tt.loading == true) return false;
			tt.loading = true;
			var url = '';
			url = '/include/ajax.php?service=house&action=getRecord&type=1&&page='+atpage+'&pageSize='+pageSize;
      tt.lsit = [];
			axios({
				method: 'post',
				url: url,
			  })
			  .then((response)=>{
					tt.loading = false;
					var data = response.data;
					if(data.state == 100){

						tt.list = data.info.list
						// totalCount = data.info.pageInfo.totalCount;
						totalCount = data.info.pageInfo.totalCount;
						if(atpage == 1){
							tt.showPageInfo(currid);
						}

					}else{
						tt.list = [];
						totalCount = 0;
					}
			  });
		},
    // 分页
		showPageInfo:function(currid){
			var tt = this;
			var info = $(".pagination");
			var nowPageNum = atpage;
			var allPageNum = Math.ceil(totalCount/pageSize);
			var pageArr = [];
			info.html("").hide();
			var pages = document.createElement("div");
			pages.className = "pagination-pages";
			info.append(pages);
			//拼接所有分页
			if (allPageNum > 1) {

				//上一页
				if (nowPageNum > 1) {
					var prev = document.createElement("a");
					prev.className = "prev";
					prev.innerHTML = langData['siteConfig'][6][33];//上一页
					prev.onclick = function () {
						atpage = nowPageNum - 1;
						tt.getList(currid);
					}
					info.find(".pagination-pages").append(prev);
				}

				//分页列表
				if (allPageNum - 2 < 1) {
					for (var i = 1; i <= allPageNum; i++) {
						if (nowPageNum == i) {
							var page = document.createElement("span");
							page.className = "curr";
							page.innerHTML = i;
						} else {
							var page = document.createElement("a");
							page.innerHTML = i;
							page.onclick = function () {
								atpage = Number($(this).text());
								tt.getList(currid);
							}
						}
						info.find(".pagination-pages").append(page);
					}
				} else {
					for (var i = 1; i <= 2; i++) {
						if (nowPageNum == i) {
							var page = document.createElement("span");
							page.className = "curr";
							page.innerHTML = i;
						}
						else {
							var page = document.createElement("a");
							page.innerHTML = i;
							page.onclick = function () {
								atpage = Number($(this).text());
								tt.getList(currid);
							}
						}
						info.find(".pagination-pages").append(page);
					}
					var addNum = nowPageNum - 4;
					if (addNum > 0) {
						var em = document.createElement("span");
						em.className = "interim";
						em.innerHTML = "...";
						info.find(".pagination-pages").append(em);
					}
					for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
						if (i > allPageNum) {
							break;
						}
						else {
							if (i <= 2) {
								continue;
							}
							else {
								if (nowPageNum == i) {
									var page = document.createElement("span");
									page.className = "curr";
									page.innerHTML = i;
								}
								else {
									var page = document.createElement("a");
									page.innerHTML = i;
									page.onclick = function () {
										atpage = Number($(this).text());
										tt.getList(currid);
									}
								}
								info.find(".pagination-pages").append(page);
							}
						}
					}
					var addNum = nowPageNum + 2;
					if (addNum < allPageNum - 1) {
						var em = document.createElement("span");
						em.className = "interim";
						em.innerHTML = "...";
						info.find(".pagination-pages").append(em);
					}
					for (var i = allPageNum - 1; i <= allPageNum; i++) {
						if (i <= nowPageNum + 1) {
							continue;
						}
						else {
							var page = document.createElement("a");
							page.innerHTML = i;
							page.onclick = function () {
								atpage = Number($(this).text());
								tt.getList(currid);
							}
							info.find(".pagination-pages").append(page);
						}
					}
				}

				//下一页
				if (nowPageNum < allPageNum) {
					var next = document.createElement("a");
					next.className = "next";
					next.innerHTML = langData['siteConfig'][6][34];//下一页
					next.onclick = function () {
						atpage = nowPageNum + 1;
						tt.getList(currid);
					}
					info.find(".pagination-pages").append(next);
				}

				info.show();

			}else{
				info.hide();
			}
		},
  }
})
