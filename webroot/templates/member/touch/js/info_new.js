
toggleDragRefresh('off');


// 获取url参数
	function getParam(paramName) {
		paramValue = "", isFound = !1;
		if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
			arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
			while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
		}
		return paramValue == "" && (paramValue = null), paramValue
	}




var infoPage = new Vue({
  el:"#page",
  data:{
    typeList:[],
    isClick:false,
    toUrl:'',
    toList:false,
  },
  mounted(){
    var tt = this;
    if(getParam('category') == '1'){
      tt.toUrl = '';
      tt.toList = true;
    }else{
      tt.toUrl = fabuUrl+'?typeid=';
    }
    // 加载分类
    tt.getType();

    // 滚动样式
    var offTop =  $('.rightCon').offset().top ;
    $('.rightCon').scroll(function(){
      $(".rightCon dl").each(function(i){
          var t = $(this) ,id = t.data('id');
          if(offTop >= t.offset().top && $(".rightCon dl").eq(i+1).offset().top> offTop && !tt.isClick){
            $(".first_ul li[data-id='"+id+"']").addClass('nowShow').siblings('li').removeClass('nowShow')
          }

      })
    })
  },
  methods:{
    getType(){
      var tt = this;
      axios({
          method: 'post',
          url: '/include/ajax.php?service=info&action=type&son=1',
        })
        .then((response) => {
          var data = response.data;
          if(data.state == 100){
            console.log(data)
            tt.typeList = data.info;
          }
        })

    },

    scrollTo(){
      var tt = this;
      var el = event.currentTarget;
      if(!$(el).hasClass('nowShow')){
        $(el).addClass('nowShow').siblings('li').removeClass('nowShow');
        var id = $(el).attr('data-id');
        var scrTop = $('.rightCon').scrollTop();
        var offTop = $('.rightCon dl[data-id="'+id+'"]').offset().top
        tt.isClick = true;
        $('.rightCon').scrollTop(scrTop + offTop-$('.rightCon').offset().top);
        console.log(scrTop,offTop,$('.rightCon').offset().top)
        setTimeout(function(){
          tt.isClick = false;
        },500)
      }
    },


  }
})
