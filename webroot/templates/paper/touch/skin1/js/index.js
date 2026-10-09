$(function () {
	
//   var device = navigator.userAgent;
//   if(device.indexOf('huoniao') > -1){
//     $('.areaChose a').bind('click', function(e){
//       e.preventDefault();
//       setupWebViewJavascriptBridge(function(bridge) {
//         bridge.callHandler('goToCity', {'module': 'paper'}, function(){});
//       });
//     });
//   }
    var sortBy = function(prop){
        return function (obj1, obj2) {
          var val1 = obj1[prop];
          var val2 = obj2[prop];
          if(!isNaN(Number(val1)) && !isNaN(Number(val2))) {
            val1 = Number(val1);
            val2 = Number(val2);
          }
          if(val1 < val2) {
            return -1;
          }else if(val1 > val2) {
            return 1;
          }else{
            return 0;
          }
        }
    }
    $('.choose-tab li').bind('click',function () {
        $(this).toggleClass('active').siblings('.choose-tab li').removeClass('active');

        if($('.choose-tab li.li_paper').hasClass('active')){
            $('.screenBox .chose-box').addClass('show');
            $('.mark').addClass('show');
        }else {
            $('.screenBox .chose-box').removeClass('show');
            $('.mark').removeClass('show');
        }
    });

    $('.mark').click(function () {
        $('.screenBox .chose-box').removeClass('show');
        $('.mark').removeClass('show');
    });

    //选择报纸
    $('.chose-box .aside-main').delegate('li', 'click', function () {
        $('.choose-tab li.li_paper').removeClass('active').attr('data-id', $(this).attr('data-id'));
        $('.choose-tab li.li_paper span').html($(this).text());
        $('.screenBox .chose-box').removeClass('show');
        $('.mark').removeClass('show');
        var company = $(this).attr('data-id'), date = $('#choosedate').val();
        if(choosedate){
            var href = companyUrl.replace('#id', company).replace('#date', date);
            location.href = href;
        }
        
    });

 // 选择日期
    $('#choosedate').mdater({
        maxDate: new Date(),
    });
    
    $('body').delegate('.md_datearea li.current','click',function () {
        $('.choose-tab li.li_date ').removeClass('active');
    });

    $('.search a').click(function(){
    })
    $('#choosedate').on('input propertychange', function(){
        var company = $('.choose-tab li.li_paper').attr('data-id'), date = $('#choosedate').val();
        if(!company){
            alert('请选择报纸');
            return;
        }
        var href = companyUrl.replace('#id', company).replace('#date', date);
        location.href = href;
    })

    // 侧边栏点击字幕条状
    var navBar = $(".navbar");
    navBar.on("touchstart", function (e) {
        $(this).addClass("active");
        $('.letter').html($(e.target).html()).show();


        var width = navBar.find("li").width();
        var height = navBar.find("li").height();
        var touch = e.touches[0];
        var pos = {"x": touch.pageX, "y": touch.pageY};
        var x = pos.x, y = pos.y;
        $(this).find("li").each(function (i, item) {
            var offset = $(item).offset();
            var left = offset.left, top = offset.top;
            if (x > left && x < (left + width) && y > top && y < (top + height)) {
                var id = $(item).find('a').attr('data-id');
                var cityHeight = $('#'+id).offset().top + $('.aside .aside-main').scrollTop();
                if(cityHeight>45){
                    $('.aside .aside-main').scrollTop(cityHeight-90);
                    $('.letter').html($(item).html()).show();
                }

            }
        });
    });

    navBar.on("touchmove", function (e) {
        e.preventDefault();
        var width = navBar.find("li").width();
        var height = navBar.find("li").height();
        var touch = e.touches[0];
        var pos = {"x": touch.pageX, "y": touch.pageY};
        var x = pos.x, y = pos.y;
        $(this).find("li").each(function (i, item) {
            var offset = $(item).offset();
            var left = offset.left, top = offset.top;
            if (x > left && x < (left + width) && y > top && y < (top + height)) {
                var id = $(item).find('a').attr('data-id');
                var cityHeight = $('#'+id).offset().top + $('.aside .aside-main').scrollTop();
                if(cityHeight>45) {
                    $('.aside .aside-main').scrollTop(cityHeight - 90);
                    $('.letter').html($(item).html()).show();
                }
            }
        });
    });


    navBar.on("touchend", function () {
        $(this).removeClass("active");
        $(".letter").hide();
    })

    // 列表下拉加载
    var servepage = 1;
    var totalpage = 0;
    var isload = false;

    getList();
    function  getList(tr){
        if(tr){
            servepage = 1;
            $(".box1, .box2").html('');
        }
        var param = [];

        var url ="/include/ajax.php?service=paper&action=store&page="+ servepage +"&pageSize=10&callback=jsonp2";
        $.ajax({
            url: url,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                var html=[]

                var datalist = data.info.list;
                if(data.state == 100){
                    totalpage = data.info.pageInfo.totalPage;
                    var n = 0;
                    for(var i=0;i<datalist.length;i++){
                        if(datalist[i].forum){
                            if(n%2 == 0){
                                list = `
                                  <li class="item"><a href="`+datalist[i].forum.url+`">
                                    <div class="img-box"><img src="`+datalist[i].forum.litpic+`" alt=""></div>
                                    <div class="info">
                                        <p class="name">`+datalist[i].title+`</p>
                                        <p class="time">`+datalist[i].forum.date+`</p>
                                    </div>
                                </a></li>
                            `;

                                $(".box1").append(list);
                            }else {
                                list = `
                                  <li class="item"><a href="`+datalist[i].forum.url+`">
                                    <div class="img-box"><img src="`+datalist[i].forum.litpic+`" alt=""></div>
                                    <div class="info">
                                        <p class="name">`+datalist[i].title+`</p>
                                        <p class="time">`+datalist[i].forum.date+`</p>
                                    </div>
                                </a></li>
                            `;
                                $(".box2").append(list);
                            }
                            n++;
                        }
                    }
                     isload = false;
                    //最后一页
                    if(servepage >= data.info.pageInfo.totalPage){
                        isload = true;
                        $('.loading span').html('已全部加载');
                    }

                    if($('.aside-main').html() != '') return;
                    // 下拉筛选，首字母填充
                    var list = data.info.list, storeArr = new Array(), html = [], html1 = [], hotCityHtml = [];
                    for (var i = 0; i < list.length; i++) {
                      var pinyin = list[i].pinyin.substr(0,1);

                      if(storeArr[pinyin] == undefined){
                        storeArr[pinyin] = [];
                      }

                      storeArr[pinyin].push(list[i]);

                    }

                    var szmArr = [];
                    for(var key in storeArr){
                      var szm = key;
                      // 右侧字母数组
                      szmArr.push(key);

                    }
                    // 右侧字母填充
                    szmArr.sort();
                    var html = [], html1 = [];
                    for (var i = 0; i < szmArr.length; i++) {
                        html1.push('<li class="jump-li"><a href="javascript:;" data-id="jump-li-'+szmArr[i]+'">'+szmArr[i]+'</a></li>');

                        html.push('<h3 id="jump-li-'+szmArr[i]+'"></h3>');
                        html.push('<ul class="list-line list-line-logo">');
                        for (var j = 0; j < storeArr[szmArr[i]].length; j++) {
                          html.push('<li data-id="'+storeArr[szmArr[i]][j]['id']+'"><span class="bread_text">'+storeArr[szmArr[i]][j].title+'</span></li>');
                        }
                        html.push('</ul>');
                    }
                    $('.aside-main').html(html.join(""));
                    $('.jump-ul').html(html1.join(""));

                }else {
                    $('.loading span').html(''+data.info+'');
                }
            },
            error: function(){
                $('.loading span').html('请求出错请刷新重试');//请求出错请刷新重试
            }
        })
    }

    //滚动底部加载
    $(window).scroll(function() {
        var sh = $('.loading').height();
        var allh = $('body').height();
        var w = $(window).height();

        var s_scroll = allh - sh - w;

        //服务列表
        if ($(window).scrollTop() > s_scroll && !isload) {
            servepage++;

            isload = true;
            if(servepage <= totalpage){
                getList();
            }

        };

    });



});