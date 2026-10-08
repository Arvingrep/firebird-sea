$(function () {
    var loadingh = $('#container .loading').height();

    // 滑动加载
    var servepage = 1;
    var totalpage = 0;
    var isload = false;

    //年检时间
    var currYear = (new Date()).getFullYear();
    var currMonth = (new Date()).getMonth() + 1;
    currMonth = currMonth < 10 ? '0'+currMonth : currMonth;
    var activeDate = currYear+'-'+currMonth;
    $('.yearly-time').scroller(
        $.extend({
            preset: 'date',
            dateFormat: 'yy-mm',
            endYear: currYear,
            maxDate: new Date(),
            onSelect: function (valueText, inst) {
                $("section .list-box").html('');
                isload = false;
                servepage = 1;
                totalpage = 0;
                $('.money span').text(0);
                activeDate = valueText;
                getList();
            }
        })
    );

    getList();
    function  getList(){
        var date = activeDate;
        $('.loading').show().children('span').text(langData['siteConfig'][20][409]);
        var url ="/include/ajax.php?service=member&action=fenxiaoLog&date="+date+"&page="+ servepage +"&pageSize=10";
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                var html=[];
                var datalist = data.info.list;
                if(data.state == 100){
                    $('.loading').hide();
                    totalpage = data.info.pageInfo.totalPage;
                    for(var i=0;i<datalist.length;i++){
                        list = `
                              <li><a class="fn-clear" href="${detailurl}${datalist[i].id}">
                                <div class="img-box fn-left"><img src="${templets}images/icon_03.png" alt=""></div>
                                <div class="info">
                                    <p class="name">${datalist[i].ordernum} <span class="fn-right">+${datalist[i].amount}</span></p>
                                    <p class="time">${dateTimes(datalist[i].pubdate)}</p>
                                </div>
                            </a></li>
                        `;
                        $("section .list-box").append(list);
                    }
                    isload = false;
                    $('.money span').text(data.info.pageInfo.totalAmount);
                    if(servepage >= totalpage){
                        $('.loading span').text(langData['siteConfig'][20][429]).parent().show();
                    }
                }else {
                    $('.loading span').text(langData['siteConfig'][20][429]);
                }
            },
            error: function(){
                $('.loading span').text(''+langData['welfare'][0][23]+'');//请求出错请刷新重试
            }
        })
    }

    //滚动底部加载
    $(window).scroll(function() {
        var sh = loadingh;
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


    function dateTimes(times) {
        var date = huoniao.transTimes(times, 1);
        var currTime = new Date(); //当前时间  
        var year   = currTime.getFullYear();
        var month  = (currTime.getMonth()+1<10)?('0'+(currTime.getMonth()+1)):(currTime.getMonth()+1);
        var day    = (currTime.getDate()<10)?('0'+currTime.getDate()):(currTime.getDate());
        if (date.split(' ')[0] == (year+'-'+month+'-'+day) ) {
            return langData['siteConfig'][13][24]+ ' ' + date.split(' ')[1];//今天
        }else{
            return date;
        }
    }



});