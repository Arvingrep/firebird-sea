var page = new Vue({
  el:"#page",
  data:{
    navList:navList,  //左侧导航
    currid:currid, //左侧导航当前高亮
    hoverid:'',
    adviser:[],  //adviser是列表数据
    loading:false,

  },
  mounted(){
    var tt = this;
    tt.getList()
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
    getList:function(){
      var tt =this;
      tt.showPageInfo();
      if(tt.loading) return false;
      tt.loading = true;
      var url = '/include/ajax.php?service=house&action=loupanGuwenList&loupanid='+loupanid+"&page="+atpage+"&pageSize=15";
      axios({
        method: 'post',
        url: url,
      })
      .then((response)=>{
        tt.loading = false;
        var data = response.data;
        if(data.state ==100){
          tt.adviser = data.info.list;
          totalCount = data.info.pageInfo.totalCount;
          if(atpage == 1){
              tt.showPageInfo();
          }
        }
      })
    },
    showPop:function(id,index){
      $(".Popbox").attr('data-id',id)
                  .attr('data-index',index);
			$(".Popbox,.pop_mask").show();
    },
    close_pop(){
      $(".Popbox,.pop_mask").hide();
    },
    // 删除
    del_adviser:function(){
      var tt = this;
      if(tt.loading) return false;
      tt.loading = true;
      var id =   $(".Popbox").attr('data-id');
      var index =   $(".Popbox").attr('data-index');
      var url = '/include/ajax.php?service=house&action=loupanGuwenAdd&dopost=del&aid='+id+'&loupanid='+loupanid;
      axios({
        method: 'post',
        url: url,
      })
      .then((response)=>{
        tt.loading = false;
        var data = response.data;
        tt.adviser.splice(index,1);
        tt.close_pop();
        alert(data.info);
      })
    },
    // 分页
    showPageInfo:function() {
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
            tt.getList();
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
                tt.getList();
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
                tt.getList();
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
                    tt.getList();
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
                tt.getList();
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
            tt.getList();
          }
          info.find(".pagination-pages").append(next);
        }

        info.show();

      }else{
        info.hide();
      }
    },
  },
})
