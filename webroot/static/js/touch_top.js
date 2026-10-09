/** 
 * 移动端seo优化
*/
$(function(){
    installModArr_top = installModArr_top&&typeof installModArr_top =='string' ? JSON.parse(installModArr_top) : []
    if(noHeader == '0') {
        
        let touch_top_con = `
        <div class="navBox_4" id="navBox_4">
            <div class="boxall_nav">
                <div class="pub-fast_nav" id="fast_nav">
                    <h2>${langData['siteConfig'][37][87]}<i class="close_btn"></i></h2> 
                    <ul>
                        <li class="">
                            <a href="${masterDomain}">
                                <i><img src="${cfg_staticPath}images/blank.gif" data-src="${cfg_staticPath}images/top_fast1.png"/></i>
                                <p>${langData['siteConfig'][0][0]}</p>   
                            </a>
                        </li>
                        <li class="message_num">
                            <a href="${memberUserDomain}/message.html">
                                <i><img src="${cfg_staticPath}images/blank.gif" data-src="${cfg_staticPath}images/top_fast2.png"/></i>
                                <p>${langData['siteConfig'][19][239]}</p>    
                            </a>
                        </li>
                        <li class="memberUrl">
                            <a href="${memberUserDomain}${appBoolean ? '?appFullScreen' : ''}" data-url="${memberUserDomain}${appBoolean ? '?appFullScreen' : ''}">
                                <i><img src="${cfg_staticPath}images/blank.gif" data-src="${cfg_staticPath}images/top_fast3.png"/></i>
                                <p>${langData['siteConfig'][0][7]}</p>    
                            </a>
                        </li>
                        <li class="HN_PublicShare" style="display: block !important;">
                            <a href="javascript:;">
                                <i><img src="${cfg_staticPath}images/blank.gif" data-src="${cfg_staticPath}images/top_fast5.png"/></i>
                                <p>${langData['siteConfig'][6][166]}</p>   
                            </a>
                        </li>

                    </ul>
                </div>

                <div class="navlist_4" id="navlist_4">
			        <ul class="clearfix fn-clear"></ul>
                </div>
                <i class="w_bg"></i>
            </div>
            <div class="bg" id="shearBg"></div>
        </div>
        `

        $("body").prepend(touch_top_con)
        getAllsiteModule()


        let job_jubao_con = '';
        if(dopost == 'detail' || dopost == 'pgzg'){
            job_jubao_con = `<li><s></s>${langData['siteConfig'][24][21]}</li>     
            <li><s></s>${langData['siteConfig'][24][26]}</li>   
            <li><s></s>${langData['siteConfig'][24][27]}</li>  
            <li><s></s>${langData['siteConfig'][24][20]}</li>  
            <li><s></s>${langData['siteConfig'][24][28]}</li>   
            <li><s></s>${langData['siteConfig'][24][29]}</li>    
            <li><s></s>${langData['siteConfig'][24][30]}</li>   
            <li><s></s>${langData['siteConfig'][19][201]}</li>   `
        }else if(dopost == 'resume' || dopost == 'pgqz'){
            job_jubao_con = `<li><s></s>虚假简历</li>
            <li><s></s>空号/停机/无联系方式</li>
            <li><s></s>违法/诈骗简历</li>
            <li><s></s>广告简历</li>
            <li><s></s>人身攻击/污言秽语</li>
            <li><s></s>其他原因</li>`
        }
        let juBao_con = `<div class="JuMask"></div>
                            <div class="JuPop JubaoBox">
                                <div class="JuHead">
                                    <a href="javascript:;" class="JuClosePop JuClose"></a>
                                    <h2>举报内容</h2>
                                </div>
                                <div class="JuContent">
                                    <dl class="JuDl JuReason">
                                        <dt><b>*</b><span>选择举报理由</span><em class="tip-line">请选择举报理由</em></dt>
                                        <dd class="JuList">
                                            <ul class="fn-clear Jubao-article">
                                                <li>${langData['siteConfig'][24][3]}</li>      
                                                <li>${langData['siteConfig'][24][4]}</li>      
                                                <li>${langData['siteConfig'][24][5]}</li>      
                                                <li>${langData['siteConfig'][24][6]}</li>      
                                                <li>${langData['siteConfig'][24][7]}</li>      
                                                <li>${langData['siteConfig'][24][8]}</li>      
                                                <li>${langData['siteConfig'][19][201]}</li>     
                                            </ul>
                                            <ul class="fn-clear Jubao-info">
                                                <li>${langData['siteConfig'][24][9]}</li>     
                                                <li>${langData['siteConfig'][24][10]}</li>    
                                                <li>${langData['siteConfig'][24][11]}</li>  
                                                <li>${langData['siteConfig'][24][12]}</li>   
                                                <li>${langData['siteConfig'][24][13]}</li>   
                                                <li>${langData['siteConfig'][24][14]}</li>   
                                                <li>${langData['siteConfig'][19][201]}</li> 
                                            </ul>
                                            <ul class="fn-clear Jubao-house">
                                                <li>${langData['siteConfig'][24][15]}</li>     
                                                <li>${langData['siteConfig'][24][16]}</li>      
                                                <li>${langData['siteConfig'][24][17]}</li>     
                                                <li>${langData['siteConfig'][24][18]}</li>     
                                                <li>${langData['siteConfig'][24][19]}</li>     
                                                <li>${langData['siteConfig'][24][20]}</li>      
                                                <li>${langData['siteConfig'][24][21]}</li>     
                                                <li>${langData['siteConfig'][24][22]}</li>      
                                                <li>${langData['siteConfig'][24][23]}</li>     
                                                <li>${langData['siteConfig'][24][24]}</li>      
                                                <li>${langData['siteConfig'][24][25]}</li>     
                                                <li>${langData['siteConfig'][19][201]}</li>  
                                            </ul>
                                            <ul class="fn-clear Jubao-job">
                                                ${job_jubao_con}
                                            </ul>
                                            <ul class="fn-clear Jubao-dating">
                                                <li>${langData['siteConfig'][24][31]}</li>   
                                                <li>${langData['siteConfig'][24][32]}</li>   
                                                <li>${langData['siteConfig'][24][33]}</li>   
                                                <li>${langData['siteConfig'][24][34]}</li>  
                                                <li>${langData['siteConfig'][24][35]}</li>  
                                                <li>${langData['siteConfig'][19][201]}</li>  
                                            </ul>
                                            <ul class="fn-clear Jubao-tieba">
                                                <li>${langData['siteConfig'][24][36]}</li> 
                                                <li>${langData['siteConfig'][24][37]}</li> 
                                                <li>${langData['siteConfig'][24][38]}</li>  
                                                <li>${langData['siteConfig'][24][39]}</li>   
                                                <li>${langData['siteConfig'][24][40]}</li> 
                                                <li>${langData['siteConfig'][24][41]}</li> 
                                                <li>${langData['siteConfig'][24][42]}</li>  
                                                <li>${langData['siteConfig'][24][43]}</li>   
                                                <li>${langData['siteConfig'][24][44]}</li>  
                                                <li>${langData['siteConfig'][24][45]}</li>   
                                                <li>${langData['siteConfig'][24][46]}</li> 
                                                <li>${langData['siteConfig'][24][47]}</li>  
                                            </ul>
                                            <ul class="fn-clear Jubao-huodong">
                                                <li>${langData['siteConfig'][24][48]}</li>  
                                                <li>${langData['siteConfig'][24][49]}</li>  
                                                <li>${langData['siteConfig'][24][50]}</li>   
                                                <li>${langData['siteConfig'][19][201]}</li>  
                                            </ul>
                                            <ul class="fn-clear Jubao-video">
                                                <li>${langData['siteConfig'][24][51]}</li>   
                                                <li>${langData['siteConfig'][24][52]}</li>   
                                                <li>${langData['siteConfig'][24][53]}</li>  
                                                <li>${langData['siteConfig'][24][54]}</li>   
                                                <li>${langData['siteConfig'][24][55]}</li>  
                                                <li>${langData['siteConfig'][19][201]}</li>   
                                            </ul>
                                            <ul class="fn-clear Jubao-huangye">
                                                <li>${langData['siteConfig'][24][56]}</li>  
                                                <li>${langData['siteConfig'][24][57]}</li> 
                                                <li>${langData['siteConfig'][24][59]}</li> 
                                                <li>${langData['siteConfig'][24][59]}</li>  
                                                <li>${langData['siteConfig'][19][201]}</li>     
                                            </ul>
                                            <ul class="fn-clear Jubao-image">
                                                <li>${langData['siteConfig'][24][60]}</li> 
                                                <li>${langData['siteConfig'][24][61]}</li> 
                                                <li>${langData['siteConfig'][24][62]}</li>   
                                                <li>${langData['siteConfig'][24][63]}</li>    
                                                <li>${langData['siteConfig'][24][64]}</li> 
                                                <li>${langData['siteConfig'][19][201]}</li> 
                                            </ul>
                                            <ul class="fn-clear Jubao-live">
                                                <li>${langData['siteConfig'][24][31]}</li>    
                                                <li>${langData['siteConfig'][24][32]}</li>   
                                                <li>${langData['siteConfig'][24][33]}</li>    
                                                <li>${langData['siteConfig'][24][34]}</li>   
                                                <li>${langData['siteConfig'][24][35]}</li>   
                                                <li>${langData['siteConfig'][19][201]}</li>   
                                            </ul>
                                            <ul class="fn-clear Jubao-business">
                                                <li>${langData['siteConfig'][24][56]}</li>  
                                                <li>${langData['siteConfig'][24][57]}</li>  
                                                <li>${langData['siteConfig'][24][58]}</li>    
                                                <li>${langData['siteConfig'][24][59]}</li> 
                                                <li>${langData['siteConfig'][19][201]}</li> 
                                            </ul>
                                            <ul class="fn-clear Jubao-member">
                                                <li>${langData['siteConfig'][24][3]}</li>      
                                                <li>${langData['siteConfig'][24][4]}</li>      
                                                <li>${langData['siteConfig'][24][5]}</li>      
                                                <li>${langData['siteConfig'][24][6]}</li>      
                                                <li>${langData['siteConfig'][24][7]}</li>      
                                                <li>${langData['siteConfig'][24][8]}</li>      
                                                <li>${langData['siteConfig'][19][201]}</li>      
                                            </ul>
                                            <ul class="fn-clear Jubao-renovation">
                                                <li>${langData['siteConfig'][24][9]}</li>     
                                                <li>${langData['siteConfig'][24][10]}</li>      
                                                <li>${langData['siteConfig'][24][11]}</li>     
                                                <li>${langData['siteConfig'][24][12]}</li>      
                                                <li>${langData['siteConfig'][24][13]}</li>     
                                                <li>${langData['siteConfig'][24][14]}</li>      
                                                <li>${langData['siteConfig'][19][201]}</li>     
                                            </ul>
                                            <ul class="fn-clear Jubao-user">
                                                <li>${langData['siteConfig'][24][31]}</li>    
                                                <li>${langData['siteConfig'][24][32]}</li>    
                                                <li>${langData['siteConfig'][24][33]}</li>    
                                                <li>${langData['siteConfig'][24][34]}</li>    
                                                <li>${langData['siteConfig'][24][35]}</li>    
                                                <li>${langData['siteConfig'][19][201]}</li>     
                                            </ul>
                                            <ul class="fn-clear Jubao-sfcar">
                                                <li>${langData['siteConfig'][24][3]}</li>   
                                                <li>${langData['siteConfig'][24][4]}</li>  
                                                <li>${langData['siteConfig'][24][5]}</li>   
                                                <li>${langData['siteConfig'][24][6]}</li>   
                                                <li>${langData['siteConfig'][24][7]}</li>   
                                                <li>${langData['siteConfig'][24][8]}</li>  
                                                <li>${langData['siteConfig'][24][47]}</li>      
                                            </ul>
                                        </dd>
                                    </dl>
                                    <dl class="JuDl JuDescBox">
                                        <dt><span>举报描述</span></dt>
                                        <dd class="JuText">
                                            <textarea name="JuDesc" id="JuDesc" placeholder="请描述您的理由，以便工作人员更好的判断"></textarea>
                                            <div class="JuTextCount"><span>0</span>/100</div>
                                        </dd>
                                    </dl>
                                    <dl class="JuDl JuDescBox">
                                        <dt><b>*</b><span>联系方式</span><em class="tip-line">请输入联系方式</em></dt>
                                        <dd class="JuTel">
                                            <div class="JuTelBox">
                                                <span class="Ju_areaCode" data-code="86">+86</span>
                                                <input type="tel" name="Ju_tel" id="Ju_tel" maxlength="11" placeholder="输入您的手机号码">
                                            </div>
                                        </dd>
                                    </dl>
                                    <a href="javascript:;" class="JubaoBox-submit JuSubmit JuDisabled">提交</a>
                                </div>
                            </div>`;
    
    
        if(typeof(JubaoConfig) != 'undefined'){
            $('body').append(juBao_con)
        }


    }

    let phoneCodeCon = `
    <div class="phoneCodeMask" style="z-index:100003;"></div>
    <div class="phoneCodePop">
        <h2>选择地区   <a href="javascript:;" class="back">${langData['business'][1][5]}</a></h2> 
        <div class="Ju_areaList"><ul></ul></div>
    </div>`

    $('body').append(phoneCodeCon)

    $(".phoneCodePop .back").click(function(){
        $(".phoneCodeMask ").removeClass('show')
        $(".phoneCodePop").css('transform', 'translateY(100%)');
        setTimeout(function(){
            $(".phoneCodePop").hide()
        },300)
    })


    touch_top_getAreaCode()
    function touch_top_getAreaCode(){
        $.ajax({
            url: '/include/ajax.php?service=siteConfig&action=internationalPhoneSection',
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data.state == 100){
                    let list =data.info;
                    let html = []
                    for(let i = 0; i < list.length; i++){
                        let item = list[i]
                        html.push(`<li data-cn="${item.name}" data-code="${item.code}"><span>${item.name}<span><em class="fn-right">+${item.code}</em></li>`)
                    }
                    $(".Ju_areaList ul").html(html.join(''))
                }
            },
            error: function () { }
        });
    }
    function getAllsiteModule(){
        $.ajax({
            url: '/include/ajax.php?service=siteConfig&action=siteModule',
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data.state == 100){
                    let list =data.info;
                    let html = []
                    if(cfg_ios_shelf == '0' && installModArr_top.includes('shop')){
                        html.push(`<li><a data-name="${langData['siteConfig'][22][12]}" data-code='cart' href="${cartUrl}"><span class="imgbox"><img src="${cfg_staticPath}images/blank.gif" data-src="${cfg_staticPath}/images/admin/nav/shop_car.png?v=${cfg_staticVersion}" class=""></span><span class="txtbox">${langData['siteConfig'][22][12]}</span></a></li>`)
                    }
                    for(let i = 0; i < list.length; i++){
                        let item = list[i]
                        let target = item.target && item.target > 0 ? `target="_blank"` : '';
                        let color = item.color ? `color:${item.color};` : ''
                        let bold = item.bold > 0 ? `font-weight:700;` : ''
                        html.push(`<li data-wx="${item.wx}">
                                        <a data-name="${item.name}" :data-code="${!item.disabled ? item.code : ''}" href="${item.url}" ${target}>
                                            <span class="imgbox"><img src="${cfg_staticPath}images/blank.gif" data-src="${item.icon}"></span>
                                            <span class="txtbox" style="${color} ${bold}">${item.name}</span>
                                        </a>
                                    </li>`)
                    }
                    
                    html.push(`<li class="HN_Jubao"><a href="javascript:;"><span class="imgbox"><img src="${cfg_staticPath}images/blank.gif" data-src="${cfg_staticPath}images/admin/nav/jubao.png?v=${cfg_staticVersion}" class="nav_23"></span><span class="txtbox">${langData['siteConfig'][6][30]}</span></a></li>`)
                    $(".navlist_4 ul").html(html.join(''))
                    if (typeof JubaoConfig != "undefined" && JubaoConfig.module != 'shop' && JubaoConfig.module != 'waimai' && JubaoConfig.module != 'tuan' && JubaoConfig.module != 'travel') {
                        $('.HN_Jubao').show();
                    }else{
                        $('.HN_Jubao').hide();
                    }
                }
            },
            error: function () { }
        });
    }


    $('.JubaoBox .JuList li').click(function() {
		var txt = $(this).text();
		$(this).addClass('juChose').siblings('li').removeClass('juChose');
		if( $(".JuList li.juChose").length != 0 && $("#Ju_tel").val() != ''){
			$('.JuSubmit').removeClass('JuDisabled')
		}else{
			$('.JuSubmit').addClass('JuDisabled')
		}
		$(this).closest('dl').find('.tip-line').removeClass('red focus')
	});

	//计算输入的字数
	$('textarea#JuDesc').on('input propertychange', function() {
		var length = 100;
		var content_len = $("#JuDesc").val().length;
		var in_len = length - content_len;
		if (content_len >= 100) {
			$("#JuDesc").val($("#JuDesc").val().substring(0, 100));
		}
		$('.JuTextCount span').text($("#JuDesc").val().length);



	});

	$("textarea#JuDesc,#Ju_tel").focus(function(){
		var dl = $(this).closest('.JuDl');
		dl.siblings('dl').hide();
		if($(this).attr('id') != 'Ju_tel'){
			// $('.JuSubmit').hide()
		}
	})
	$("textarea#JuDesc,#Ju_tel").blur(function(){
		var dl = $(this).closest('.JuDl');
		dl.siblings('dl').show();
		$('.JuSubmit').show()
	});


	$('#Ju_tel').on('input propertychange', function() {
		$(this).closest('dl').find('.tip-line').removeClass('red focus')
		if($(this).val() != '' && $(".JuList li.juChose").length != 0){
			$('.JuSubmit').removeClass('JuDisabled')
		}else{
			$('.JuSubmit').addClass('JuDisabled')
		}

	})


    //选择区号
    $('.Ju_areaList').delegate('li','click',function() {
        var t = $(this);
        var code = t.attr('data-code');
        $(".Ju_areaCode").text('+'+code).attr('data-code',code);
        $(".phoneCodeMask").removeClass('show')
        $(".phoneCodePop").css('transform', 'translateY(100%)');
        setTimeout(function(){
            $(".phoneCodePop").hide()
        },300)
    })

    $('.Ju_areaCode').click(function() {
        $(".phoneCodeMask").addClass('show')
        $(".phoneCodePop").show()
        setTimeout(function(){
            $(".phoneCodePop").css('transform', 'translateY(0)');

        },100)
    })




    var miniprogram = false;
    if(window.__wxjs_environment == 'miniprogram'){
        miniprogram = true;
    }else{
        if(navigator.userAgent.toLowerCase().match(/micromessenger/)) {
            if(typeof(wx) != 'undefined'){
                wx.miniProgram.getEnv(function (res) {
                    miniprogram = res.miniprogram;
                });
            }
        }
    

        if(navigator.userAgent.toLowerCase().match(/huoniao_ios/) && $(".memberUrl").length > 0){
            var mUrl = $(".memberUrl a").attr('data-url');
            if(mUrl.indexOf('appIndex=1') <= -1){
                mUrl = mUrl.indexOf('?') > -1 ? (mUrl + '&appIndex=1') : (mUrl + '?appIndex=1')
                $(".memberUrl a").attr('href',mUrl)
            }
        }
    }
    if(miniprogram){
        $("#navlist_4 li[data-wx='0']").remove();
    }
    var cookie = $.cookie("HN_float_hide");

    $('#navBox_4 .close_btn,#shearBg').click(function(){
        closeShearBox()
    })
    $('#navlist_4').delegate('li','click',function(){
        setTimeout(function(){
            closeShearBox();
        }, 200);
    })
    function closeShearBox(){
        $('.fixFooter').show();
        $('.header').removeClass('open');
        $('#navBox_4').hide();
        $('#navBox_4 .bg').css({'height':'0','opacity':0});
    }





})

//获取消息数目
function getMessageNum_top(){
    var test_stime = new Date();
    console.log("getMessageNum_top start");
    $.ajax({
       url: '/include/ajax.php?service=member&action=message&type=tongji&im=1',
       type: "GET",
       dataType: "json",
       timeout: 3000,
       success: function (data) {

            var test_etime = new Date();
            // console.log("getMessageNum_top end " + (test_etime-test_stime));

           var html = [];
           if(data.state == 100){
                   var info = data.info.pageInfo;
                   var count = info.im + info.unread + info.upunread + info.commentunread ;
                   $('.message_num').find('em').remove();
                   if(count<=99 && count>0){
                       $('.message_num').find('a i').prepend('<em>'+count+'</em>');
                       $('.dropnav').html('<em></em>')
                   }else if(count>99){
                       $('.message_num').find('a i').prepend('<em>99+</em>');
                       $('.dropnav').html('<em></em>')
                   }

                //底部消息
                if($('.footer_4_3 .message_show').size() > 0){
                    var footer_4_3 = $('.footer_4_3 li.message_show');
                    if(footer_4_3.find('a').attr('href').indexOf('message') > 0){
                        footer_4_3.find('em').remove();
                           if(count<=99 && count>0){
                               footer_4_3.find('a i').prepend('<em>'+count+'</em>');
                               footer_4_3.attr('data-unread',info.unread);
                               footer_4_3.attr('data-im',info.im);
                               footer_4_3.attr('data-upunread',info.upunread);
                               footer_4_3.attr('data-commentunread',info.commentunread)
                           }else if(count>99){
                               footer_4_3.find('a i').prepend('<em>99+</em>')
                           }
                    }
                }

           }
       },
       error: function(){
         // $('.loading').html('<span>'+langData['siteConfig'][37][80]+'</span>');  //请求出错请刷新重试
       }
    });
}
var userid
if(cookiePre){
    userid = $.cookie(cookiePre+"login_user");
}
if(userid == null || userid == ""){
   console.log(langData['siteConfig'][37][81])//登录之后可以查看新消息
}else if(noCountMsg != 2){
    setTimeout(function(){
        getMessageNum_top();
        topMsgInterval = setInterval(getMessageNum_top,10000)
    },3000);
    pageShowCheck(5)
    $(document).on('visibilitychange', function (e) {
        if (e.target.visibilityState === "visible") {
            // 页面显示
            topMsgInterval = setInterval(getMessageNum_top,10000)
            pageShowCheck(5)
        } else if (e.target.visibilityState === "hidden") {
            // 页面隐藏
            clearInterval(topMsgInterval)
        }
    });
    function pageShowCheck(timeOut){ // timeOut => 单位是分钟 一段时间过后 修改定时器  interval请求时间间隔 单位是秒
        let next_timeOut = timeOut;
        switch(timeOut){
            case 5: 
                next_timeOut = 10,
                interval = 10;
                break;
            case 10: 
                next_timeOut = 20,
                interval = 20;
                break;
            case 20: 
                next_timeOut = 30,
                interval = 30;
                break;
            case 30: 
                next_timeOut = 60,
                interval = 60;
                break;
            case 60: 
                next_timeOut = 0,
                interval = 0;
                break;
        }
        setTimeout(() => {
            clearInterval(topMsgInterval)
            if(timeOut && interval && $('#fast_nav').size() == 0){
                topMsgInterval = setInterval(getMessageNum_top,interval * 1000)
            }
            if(next_timeOut){
                pageShowCheck(next_timeOut)
            }
        },timeOut * 60 * 1000);
    }
    
}

if($(".phoneCodePop").closest('.gz-address').length > 0){
    $("body").append($('.phoneCodeMask'))
    $("body").append($('.JuMask'))
    $("body").append($('.JubaoBox'))
    $("body").append($('.phoneCodePop'))
}




// 获取相关配置
function getModConfig(){
    $.ajax({
    url: '/include/ajax.php?service=siteConfig&action=siteDefaultIndex',
    type: "POST",
    dataType: "json",
    success: function (data) {

        if(data.state == 100){
            if(data.info.defaultindex == 'info'){
                $("body>.header .header-l").addClass('hideArr');
            }
        }
    },
    error: function(){}
    });
}