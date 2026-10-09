var siteConfig = {};
var detailData = {};
let loadCount = {
    config:0,
    detail:0,
    qrcode:0
}

$(function(){
    // 获取系统相关配置  => logo
    getSiteConfig();

    // 获取招聘会详情
    getzphDetail();










    // 获取招聘会详情
    function getzphDetail(){
        $(".zph_hbBox").addClass('fn-hide')
        $(".mask_load").removeClass('fn-hide')
        $(".mask_load .load_text").text('加载中...')
        loadCount['detail'] = 0
        $.ajax({
            url: `/include/ajax.php?service=zhaopin&action=fairDetail&id=${id}`,
            type: "POST",
            dataType: "json",
            success: function (data) {
                loadCount['detail'] = 1
                if(data.state == 100){
                    detailData = data.info;
                    console.log(detailData)
                    renderHtml()
                    // 获取二维码配置
                    getQrcodeConfig();
                }else{
                    detailData = testData['info'];
                    renderHtml()
                    // 获取二维码配置
                    getQrcodeConfig();
                }
            }
        })

    }

    // 获取系统相关配置  => logo
    function getSiteConfig(){
        loadCount['config'] = 0
        $.ajax({
            url: `/include/ajax.php?service=siteConfig&action=config`,
            data: {},
            type: "POST",
            dataType: "json",
            success: function (data) {
                loadCount['config'] = 1
                if(data.state == 100){
                    $(".siteBox .img").attr('src',data.info.webLogo).attr('alt',data.info.shortName);
                    $(".site-info").text(`-${data.info.shortName}-`)
                }
            },
            error: function () { 
                loadCount['config'] = 1
            }
        });
    }

    // 获取二维码配置
    function getQrcodeConfig(){
        loadCount['qrcode'] = 0
        let paramObj = {
            title:detailData.title,
            link:detailData.url,
            from:$.cookie('userid'),
            description:'',
            imgUrl:'',
        }
        let qrCodeUrl = '';
        $.ajax({
            url: `/include/ajax.php?service=siteConfig&action=getWeixinQrPost&module=zhaopin&type=detail`,
            data: paramObj,
            type: "POST",
            dataType: "json",
            success: function (data) {
                loadCount['qrcode'] = 1;
                let url = '';
                if(data.state == 100){
                    qrCodeUrl = data.info
                }else{
                    qrCodeUrl = `/include/qrcode.php?data=${detailData.url}`
                }

                $(".imgBox img").attr('src',qrCodeUrl)
            },
            error: function () { }
        });
    }


    // 对招聘会数据进行处理
    function renderHtml(){
        $(".inner_title").text(detailData.title)
        if(detailData.mobilePoster){
            $(".zph_hbBox").css({'background-image':`url(${detailData.mobilePoster})`})
        }
        $(".inner_time").text(detailData.startTime + ' ' + detailData.endTime)
        $(".inner_phone").text(detailData.tel)
        $(".inner_address").text(detailData.addr)
        if(loadCount['detail']){
            $(".zph_hbBox").removeClass('fn-hide')
            $(".mask_load").addClass('opacity')
            $(".mask_load .load_text").text('海报生成中...')

            setTimeout(() => {
                html2canvas($(".zph_hbBox")[0], { useCORS: true, scale: 2,taintTest:true }).then(function (n) {
                    var toUrl = n.toDataURL();
                    $("#img").attr("src", toUrl);
                    $(".zph_hbBox").hide();
                    $(".zph_hbBox").addClass('fn-hide')
                    $(".mask_load").addClass('fn-hide').removeClass('opacity')
                    // $('body').animate({ 'opacity': 1 }, 500);
                    $('.top_tipBox').hide()
                }).catch((res)=>{
                    $(".mask_load").addClass('fn-hide').removeClass('opacity')
                    console.log('海报生成失败')
                });
            }, 1500);
        }
    }
})