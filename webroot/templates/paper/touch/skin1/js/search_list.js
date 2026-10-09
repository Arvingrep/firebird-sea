$(function () {
    $('.search-time ul li').click(function () {
        var t = $(this);
        t.toggleClass('active').siblings().removeClass('active');
        if(t.hasClass('active')){
            $('#seach_date').val(t.attr('date-time'));
        }else{
            $('#seach_date').val('');
        }
    });

    $('.textIn-box').submit(function(e){
        e.preventDefault();
        getList(1);
    })
    //点击搜索按钮
    $('.search-btn').click(function(){
        $('.textIn-box').submit();
    });
    $('.search-history').hide();


    //控制标题的字数
    $('.sliceFont').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        $(this).attr('title',$(this).text());
        if(len > num){
            $(this).html(text.substring(0,num) + '...');
        }
    });




    // 列表下拉加载
    var servepage = 1;
    var totalpage = 0;
    var isload = false;

    getList();
    function  getList(tr){
        if(tr){
            servepage = 1;
            $(".list").html('');
        }
        $('.loading span').text('加载中...');
        date = $('#seach_date').val();
        keywords = $.trim($('#keyword').val());
        var url ="/include/ajax.php?service=paper&action=alist&des_count=66&date="+date+"&keywords="+keywords+"&page="+ servepage +"&pageSize=10";
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                console.log(data);
                $('.loading span').text(' ');
                var html=[]
                var datalist = data.info.list;
                if(data.state == 100){
                    totalpage = data.info.pageInfo.totalPage;
                    for(var i=0;i<datalist.length;i++){
                        var d = datalist[i];
                        list = `
                               <li><a href="${d.url}">
                                <h3>${d.title}</h3>
                                <div class="con-box fn-clear">
                                `
                                if(d.litpic){
                                    list += `<div class="img-box fn-right"><img src="${d.litpic}" alt=""></div>`;
                                }
                                    
                        list += `<div class="info">
                                        <p class="con sliceFont" data-num="72">${d.description}</p>
                                    </div>
                                </div>
                            </a></li>
                        `;

                        $(".list").append(list);

                        isload = false;
                    }

                }else {
                    $('.loading span').text('已全部加载');
                }
            },
            error: function(){
                $('.loading span').text(''+langData['welfare'][0][23]+'');//请求出错请刷新重试
            }
        })
    }

    //滚动底部加载
    $(window).scroll(function() {
        var sh = $('.container .loading').height();
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