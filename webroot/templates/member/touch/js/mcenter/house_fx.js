var atpage = 1; pageSize = 10,isload = false;
var page = new Vue({
  el:"#page",
  data:{
    newsList:['1','2','3'],
    dataList:[],
    loading:false,
    loadText:'下拉加载更多~',
    pageinfo:[],

  },
  mounted(){
    var tt = this;
    if($(".swiper-container").size()>0){
      var swiper = new Swiper('.swiper-container', {
        direction: 'vertical',
        loop:true,
        autoplay:true,//等同于以下设置
      });
    }

    if(typeof(url) != 'undefined'){
      tt.getList();
      // 下拉加载更多
      $(window).scroll(function(){
        var scrtop = $(window).scrollTop();
        var bh = $(document).height() - 50;
        var sh = $(window).height();
        if(scrtop + sh >= bh && !isload){
          tt.getList();
        }
      });
    }



    $(".popbox li").click(function(event) {
      /* Act on the event */
      var t = $(this);
      t.addClass('chose').siblings('li').removeClass('chose');
      atpage = 1,isload = false;
      tt.getList();
      tt.hidePop();
    });

    $("input[readonly]").click(function(){
      var t = $(this);
      showErrAlert('可在经纪人基本资料中修改');
    })

  },
  methods:{
    getList:function(){
      var tt = this;
      if(isload) return false;
      var keywords = $("#searchinp").val();
      isload = true;
      tt.loading = true;
      tt.loadText = '加载中~';
      let param = new URLSearchParams();
			if($(".shaiPop").size()>0 || $(".orderbyPop").size()>0){
        param.append('state', $(".shaiPop li.chose").attr('data-state'));
        param.append('orderby', $(".orderbyPop li.chose").attr('data-order'));
      }
      axios({
       method: 'post',
       url: url+'&page='+atpage+'&pageSize=10&keywords='+keywords,
       data:param,
     })
     .then((response)=>{
       var data = response.data;
       if(data.state == 100){
         if(atpage == 1){
           tt.dataList = data.info.list
         }else{
           tt.dataList = [...tt.dataList ,...data.info.list];
         }
         atpage++;
         tt.loadText = '下拉加载更多';
         isload = false;
         tt.pageinfo  = data.info.pageInfo;
         if(atpage > data.info.pageInfo.totalPage){
           isload = true;
            tt.loadText = '没有更多了';
         }
       }else{
         tt.loadText = data.info;
       }
     })
    },
    search:function(){
      var tt = this;
      atpage = 1,isload = false;
      tt.dataList = [];
      tt.getList()
    },

    // 安搜索键
    submit:function(type){
      var keyCode = event.keyCode;
      var tt = this;
      if(keyCode == 13){
        tt.search()
        return false;
      }
    },

    // 显示弹窗
    showPop:function(type){
      $(".pop_mask").show();
      $("."+type+"Pop").show();
    },
    // 隐藏
    hidePop:function(){
      $(".pop_mask").hide();
      $(".popbox").hide();
    },

    // 提交表单
    formSubmit:function(){
      var tt = this;
      var stop = false;
      var form = $("#form");
      $(".required").each(function(){
        var t = $(this);
        var inp = t.find('input');
        inp.each(function(){
          var el = $(this);
          if(el.val() == ''){
            showErrAlert(el.attr('placeholder'));
            stop = true;
            return false;
          }
          if(el.attr('name') == 'tel' || el.attr('name') == 'customertel'){
            var reg = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/
            if(!el.val().match(reg)){
              showErrAlert('请输入正确的手机号');
              stop = true;
              return false;
            }
          }
        });
        if(stop) return false;
      })
      axios({
        method: 'post',
        url: '/include/ajax.php?service=house&action=loupanFenxiaobb',
        data:form.serialize(),
      })
      .then((response)=>{
        var data = response.data;
        if(data.state == 100){
          alert(data.info)
          location.href = baobeiList;
        }else{
          alert(data.info)
        }
      })
      if(stop) return false;

      console.log($('#form').serializeArray())
    },

    // 复制
    copyActiveCode: function(e, text){
        const clipboard = new ClipboardJS(e.target, { text: () => text })
        clipboard.on('success', e => {
            showErrAlert('复制成功！');
            clipboard.off('error')
            clipboard.off('success')
            clipboard.destroy()
        })
        clipboard.on('error', e => {
            clipboard.off('error')
            clipboard.off('success')
            clipboard.destroy()
        })
        clipboard.onClick(e)
    }
  },



})
