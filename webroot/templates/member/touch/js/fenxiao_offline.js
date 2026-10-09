

new Vue({
    el:'#page',
    data:{
      list:[],
      servepage:1,
      isload:false,
      totalCount:0,
      currItem:'',
      currItemChild:''
    },

    computed:{
        timeStr(){
            return function(timeString){
                var str = huoniao.transTimes(timeString,2)
                str = str.replace(/-/g,'/');
                return str
            }
        },

        numTrans(){
            return function(num){
                num = Number(num);
                if(num/10000 >= 1){
                    num = (num/10000).toFixed(2)+'w'
                }

                return num;
            }
        }
    },
    mounted(){
        var tt = this;

        // 初次加载数据
        tt.getList();

        //显示下拉框
    $('.nav .filter').bind('click',function () {
        $(this).toggleClass('active');
        $('.choose-box').toggleClass('show');
        $('.mask ').toggleClass('mask-hide');
    });
    $('.choose-box li').bind('click',function () {
        $(this).addClass('curr').siblings('.choose-box li').removeClass('curr');
        $('.nav .filter em').html($(this).html());
        $('.nav .filter').toggleClass('active');
        $('.choose-box').toggleClass('show');
        $('.mask ').toggleClass('mask-hide');
        tt.servepage = 1;
        tt.isload = false;
        tt.list = [];
        tt.getList();
    });

    //收起下来框
    $('.choose-box').click(function () {
        $('.choose-box').removeClass('show');
        $('.mask ').addClass('mask-hide');
    });

    //搜索
    $('.searchDiv div').click(function(){
        $(this).css('padding-left','.2rem');
        $('#serKey').focus();
    })
    $('.searchDiv form').submit(function(){
        tt.servepage = 1;
        tt.isload = false;
        tt.list = [];
        tt.getList();
        return false;
    })

        //滚动底部加载
        $(window).scroll(function() {
            var sh = $('.list-box .loading').height();
            var allh = $('body').height();
            var w = $(window).height();

            var s_scroll = allh - sh - w;

            //服务列表
            if ($(window).scrollTop() > s_scroll && !tt.isload) {
                tt.getList();
            };

    });

    },
    methods:{
        // 获取数据
        getList(){
            var tt = this;
            if(tt.isload) return false;
            tt.isload = true;
            $('.loading').show().children('span').text(langData['siteConfig'][20][409]);
            var keyword = $('#serKey').val();
            var orderby = $('.choose-sort .curr').data('id');
            var url ="/include/ajax.php?service=member&action=myRecUser&keywords="+keyword+"&orderby="+orderby+"&page="+ tt.servepage +"&pageSize=10";
            $.ajax({
                url: url,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    var datalist = data.info.list;
                    if(data.state == 100){
                        totalpage = data.info.pageInfo.totalPage;
                        tt.totalCount = data.info.pageInfo.totalCount
                        if(tt.servepage == 1){
                            tt.list = data.info.list
                        }else{
                            tt.list =  tt.list.concat(data.info.list);
                        }
                        tt.servepage++;
                        tt.isload = false;
                        console.log(tt.list)
                        if(tt.servepage > data.info.pageInfo.totalPage){
                            tt.isload = true;
                            $('.loading span').text(langData['siteConfig'][20][429]);//已加载全部数据
                        }
    
                    }else {
                        tt.isload = false;
                        $('.loading span').text('暂无数据');//已加载全部数据
                    }
                },
                error: function(){
                    tt.isload = false;
                    $('.loading span').text(langData['siteConfig'][20][458]);//网络错误，获取失败！
                }
            })
        },

        // 查看详情
        showDetail(item){
          var tt = this;
          tt.currItem = item;
          $(".mask_detail").show();
          $(".popDetailBox").css("transform",'translateY(0)');
          $("html").addClass('noscroll')
        },

        // 隐藏
        hidePop(){
          var tt = this;
          tt.hideSlide()
          $(".mask_detail").hide();
          $(".popDetailBox").css("transform",'translateY(100%)');
          $("html").removeClass('noscroll') 
          
         
        },

        // 查看子详情
        showChildDetail(item){
          var tt = this;
          tt.currItemChild = item;
          if(item.child && item.child.length){
              $(".childDetail_mask").show();
              $(".childDetail_pop").css("transform",'translateX(0)');
          }
        },

        hideSlide(){
          $(".childDetail_mask").hide();
          $(".childDetail_pop").css("transform",'translateX(100%)');
        }
    }
})