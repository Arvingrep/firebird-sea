





























var lng = '', lat = '';
var page = new Vue({
  el:"#page",
  data:{
    searchpage:true,
    keywords:"", //关键字
    searchList:[],   //搜索数据
    loadingText:'下拉加载更多~',
    page:1,  //当前页
    loading:false,  //正在加载中
    load_on:false,  //锁
    type:'', //分类
    travelHistory:[],
    hotSearch:[]
  },
  mounted(){
    var tt = this;
    window.onscroll = function(){
			//变量scrollTop是滚动条滚动时，距离顶部的距离
			var scrollTop = document.documentElement.scrollTop||document.body.scrollTop;
			//变量windowHeight是可视区的高度
			var windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
			//变量scrollHeight是滚动条的总高度
			var scrollHeight = document.documentElement.scrollHeight||document.body.scrollHeight;
		    //滚动条到底部的条件

			if(((scrollTop+windowHeight+150)>=scrollHeight) && !tt.load_on){
        tt.getSearchList();
			 }
		};

    tt.gethotSearch(); //加载热门搜索

    //加载历史记录
  	var history = utils.getStorage('history_search_travel');
  	if(history){
  		tt.travelHistory = history.reverse();
  	}

    HN_Location.init(function(data){
  		if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {

  		}else{
  			lng = data.lng, lat = data.lat;

  		}
  	});


  },

  methods:{
    // 搜索
    getSearchList(){
      var tt = this;
      if(tt.loading || tt.load_on ) return false;
      tt.loading = true;
      tt.load_on = true;
      tt.loadingText = '加载中~';
      var history = utils.getStorage('history_search_travel');
        	history = history ? history : [];
        	if(history && history.length >= 10 && $.inArray(tt.keywords, history) < 0){
        		history = history.slice(1);
        	}
        	// 判断是否已经搜过
        	if($.inArray(tt.keywords, history) > -1){
        		for (var i = 0; i < history.length; i++) {
        			if (history[i] === tt.keywords) {
        				history.splice(i, 1);
        				break;
        			}
        		}
        	}
        	history.push(tt.keywords);
          tt.travelHistory = history;
          utils.setStorage('history_search_travel', JSON.stringify(history));


      $.ajax({
        url: '/include/ajax.php?service=travel&action=searchTravel&pageSize=10&lng='+lng+'&lat='+lat+'&page='+tt.page+'&searchtype='+tt.type+'&keywords='+tt.keywords,
        type: "POST",
        dataType: "json",
        success: function (data) {
          tt.loading = false;
          tt.load_on = false;
          if(data.state == 100){
            var list = data.info.list;
            if(tt.page == 1){
              tt.searchList = [...list];
            }else{
              tt.searchList = [...tt.searchList,...list]
            }
            tt.loadingText = '没有更多了~';
            // tt.loadingText = '下拉加载更多'
            tt.page++;
            if(tt.page > data.info.pageInfo.totalPage){
              tt.loadingText = '没有更多了~';
              tt.load_on = true;
            }
          }else{
            tt.searchList = [];
            tt.load_on = false;
            tt.loadingText = data.info;
          }
        },
        error: function(){
          tt.loading = false;
          tt.load_on = false;
          tt.loadingText = data.info;
        }
      });
    },
    // 点击搜索按钮
    searcning(e){
      var tt = this;
      if(e.keyCode == 13){
        tt.searchpage = false;
        tt.load_on = false;
        tt.page = 1;
        tt.getSearchList()
      }
    },
    // 热门搜索和历史搜索
    toSearch(key){
      var tt = this;
      tt.keywords = key;
      tt.searchpage = false;
      tt.load_on = false;
      tt.page = 1;
      tt.getSearchList();

    },

    // 清除历史记录
    del_history(){
      var tt = this;
      tt.travelHistory = [];
      utils.setStorage('history_search_travel', JSON.stringify(tt.travelHistory));
      showErrAlert('清除成功')
    },
    // 清除输入
    clearKeywords(){
      var tt = this;
      tt.keywords = '';
    },

    // 返回
    backPage(){
      var tt = this;
      tt.searchpage = true;
    },

    // 获取热门搜索
    gethotSearch(){
      var tt = this;
      $.ajax({
        url: '/include/ajax.php?service=siteConfig&action=hotkeywords&module=travel',
        type: "POST",
        dataType: "json",
        success: function (data) {
          if(data.state == 100){
            tt.hotSearch = data.info
          }
        },
        error: function(){}
      });
    },
  },
  watch:{
    searchpage:function(){
      var tt = this;
      if(!tt.searchpage){
        $(".searchList .tabType li").click(function(){
          var t = $(this);
          tt.type = t.attr('data-type');
          if(t.hasClass('on_tab')) return false;
          t.addClass('on_tab').siblings('li').removeClass('on_tab');
          tt.load_on = false;
          tt.page = 1;
          tt.getSearchList();
        });
      }
    }
  }
})
