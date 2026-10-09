$(function(){
    // 举报
    $(".jt-right .report,.dlp-warn a").bind("click", function () {
        $.dialog({
            fixed: true,
            title: "信息举报",
            content: 'url:' + masterDomain + '/complain-job-pgqz-' + id + '.html',
            width: 460,
            height: 300
        });
    });
    //你可能感兴趣隐藏
    if (!$('.i-item li')[0]) {
        $('.interest').hide();
    }
    // 最近浏览
    if(!$('.dlr-history .item')[0]){
        $('.dlr-history').hide();
    }
})