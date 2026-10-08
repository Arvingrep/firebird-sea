
window.advInd = 0; //当前广告索引
window.hasDraw = 0; //是否开始渲染 或者当前广告数已选染完
window.advList = []; //广告数据列表  最多10条， 默认3条 
window.app_id = 0;   //app_id
window.placement_id = 0;  //广告位id
window.check_adv = null

// 1. 申明全局命名空间TencentGDT对象
window.TencentGDT = window.TencentGDT || [];

var iswxmini_adv = window.__wxjs_environment == 'miniprogram';

var huoniao_adv = {
	
    // 获取广告配置
    advConfig(module,title){
       
		if(iswxmini_adv) {
			return false
		} //在小程序中不展示
        $.ajax({
            url: "/include/ajax.php?service=siteConfig&model="+ module +"&action=adv&title=" + title,
            type: "GET",
            dataType: "json", //指定服务器返回的数据类型
            crossDomain: true,
            success: function (data) { 
                if(data.state == 100){
                    let dataStr = huoniao_adv.isJSON(data.info.body) ? data.info.body : '';
                    if(dataStr && dataStr.indexOf('TencentGDT') > -1) {  //需要设置流媒体
                        let data_json = JSON.parse(dataStr)
                        // 获取h5端端app_id和placement_id,
                        window.app_id = data_json['TencentGDT']['h5'].app_id;
                        window.placement_id = data_json['TencentGDT']['h5'].placement_id; //广告位id

                        // 2. 广告初始化：填写参数值。 具体字段含义详见:《H5SDK 开发者文档》：https://developers.adnet.qq.com/doc/web/js_develop
                        window.TencentGDT.push({
                            app_id: app_id, // {String} - APPID - 必填
                            placement_id: placement_id, // {String} - 广告位ID - 必填
                            type: 'native', // {String} - 原生广告类型 - 必填
                            count: 10, // {Number} - 拉取广告的数量，默认是3，最高支持10 - 选填，超过 10 条会被限流
                            onComplete: function (res) {
                                if (res && res.constructor === Array) {
                                    hasDraw = 0;
                                    advList = res; //广告列表赋值给全局变量


                                } else {
                                    // 加载广告API，如广告回调无广告，可使用loadAd再次拉取广告
                                    // 注意：拉取广告频率每分钟不要超过20次，否则会被广告接口过滤，影响广告位填充率
                                    setTimeout(function () {
                                        window.TencentGDT.NATIVE.loadAd(placement_id)
                                    }, 3000)
                                }
                            }
                        });


                         // 3. H5 SDK接入全局只需运行一次，切必须放在第2步之后
                         (function () {
                            var doc = document,
                                h = doc.getElementsByTagName('head')[0],
                                s = doc.createElement('script');
                            s.async = true;
                            s.src = '//qzs.gdtimg.com/union/res/union_sdk/page/h5_sdk/i.js';
                            h && h.insertBefore(s, h.firstChild);
                        })();
                    }
                }
            },
            error: function(data){},
        })
    },

    // 渲染页面
    drawAdv: function (listbox,className,tagName) {  //loadPage => 当前加载的页码   listbox => 列表数据的 dom
    	
    	if(iswxmini_adv) {
			return false
		} //在小程序中不展示
    	
        var loadPage = advInd + 1;  //从第一页开始
        loadPage = loadPage ? loadPage : 1;
        // $(".swiper-slide-active .ulbox").last().append('<li class="libox '+(list && list.length == 0 ? 'fn-hide' : '')+'" id="huoniao_info_flow'+ loadPage +'" ></li>');
        
        // 添加广告位
        if(listbox){  //兼容vue代码 ，不需要新增
            tagName = tagName ? tagName : 'div'
            let para = document.createElement(tagName);
            para.setAttribute('id', 'huoniao_info_flow' + loadPage);
            para.setAttribute('class', className + ' emptyNone')
            listbox.appendChild(para);
        }
        
        advInd ++; 


        let advPage = parseInt(loadPage / 10); //3是单次加载广告的条数
        let currInd = (loadPage - 1) % 10; 
        if (advList && advList.length) {
            huoniao_adv.putInnAdv(loadPage,currInd)
        }else{
            if(check_adv) { //清空计时器
                clearInterval(check_adv)
            }
            check_adv = setInterval(function(){
                if(advList && advList.length){
                    clearInterval(check_adv); //清空计时器
                    huoniao_adv.putInnAdv(loadPage,currInd)
                }
            },1000)
        }
    },

    putInnAdv(loadPage){
    	if(iswxmini_adv) return false; //在小程序中不展示
        let advPage = parseInt(loadPage / 10); //3是单次加载广告的条数
        let currInd = (loadPage - 1) % 10; 
        if (hasDraw) { //=>表示之前的广告已渲染  从当前页开始渲染
            window.TencentGDT.NATIVE.renderAd(advList[currInd], 'huoniao_info_flow' + loadPage)  //渲染广告
            // 曝光上报
            window.TencentGDT.NATIVE.doExpose({
                container: 'huoniao_info_flow' + loadPage,
                advertisement_id: advList[currInd].advertisement_id,
                placement_id: advList[currInd].placement_id,
                traceid: advList[currInd].tid,
            });

            // 点击上报
            let adv = document.getElementById('huoniao_info_flow' + loadPage).getElementsByTagName('iframe');  //获取当前广告的iframe  
            let down_x = 0, //鼠标按下的x周坐标
                down_y = 0,//鼠标按下的y周坐标
                up_x = 0,//鼠标松开的x周坐标
                up_y = 0;//鼠标松开的y周坐标

            // 监听鼠标按下事件
            adv[0].contentDocument.onmousedown = function () {

                down_x = event.offsetX
                down_y = event.offsetY;
            }

            // 监听鼠标松开事件
            adv[0].contentDocument.onmouseup = function () {
                if($(event.target).hasClass('del')) {
                    $(adv[0]).closest('.emptyNone').remove()
                    return false;
                }
                up_x = event.offsetX;
                up_y = event.offsetY;
                let s_data = {
                    "down_x": down_x,
                    "down_y": down_y,
                    "up_x": up_x,
                    "up_y": up_y
                }
                // 点击上报
                window.TencentGDT.NATIVE.doClick({
                    s: encodeURIComponent(JSON.stringify(s_data)),
                    container: 'huoniao_info_flow' + (advPage * 3 + i + 1),
                    advertisement_id: advList[i].advertisement_id,
                    placement_id: advList[i].placement_id,
                    traceid: advList[i].tid,
                });
            }

        } else { //表示广告数据刚加载完 需要从 第一个广告数据开始渲染
            hasDraw = 1;
            for (let i = 0; i <= currInd; i++) {
                window.TencentGDT.NATIVE.renderAd(advList[i], 'huoniao_info_flow' + (advPage * 3 + i + 1))
                // 曝光上报
                window.TencentGDT.NATIVE.doExpose({
                    container: 'huoniao_info_flow' + (advPage * 3 + i + 1),
                    advertisement_id: advList[i].advertisement_id,
                    placement_id: advList[i].placement_id,
                    traceid: advList[i].tid,
                });

                let adv = document.getElementById('huoniao_info_flow' + (advPage * 3 + i + 1)).getElementsByTagName(
                    'iframe');
                let down_x = 0,
                    down_y = 0,
                    up_x = 0,
                    up_y = 0;
                adv[0].contentDocument.onmousedown = function () {
                    down_x = event.offsetX
                    down_y = event.offsetY;
                }

                adv[0].contentDocument.onmouseup = function () {
                    up_x = event.offsetX;
                    up_y = event.offsetY;
                    if($(event.target).hasClass('del')) {
                        $(adv[0]).closest('.emptyNone').remove()
                        return false;
                    }
                    let s_data = {
                        "down_x": down_x,
                        "down_y": down_y,
                        "up_x": up_x,
                        "up_y": up_y
                    }
                    // 点击上报
                    window.TencentGDT.NATIVE.doClick({
                        s: encodeURIComponent(JSON.stringify(s_data)),
                        container: 'huoniao_info_flow' + (advPage * 3 + i + 1),
                        advertisement_id: advList[i].advertisement_id,
                        placement_id: advList[i].placement_id,
                        traceid: advList[i].tid,
                    });
                }


            }
        }
        if (currInd >= 9) { //表示当前的广告数据已经渲染完 需要重新加载
            advList = [];
            window.TencentGDT.NATIVE.loadAd(placement_id); //重新加载广告
        }
    },
    // 判断是否是字符串
    isJSON:function(str) {
        if (typeof str == 'string') {
            try {
                var obj=JSON.parse(str);
                if(typeof obj == 'object' && obj ){
                    return true;
                }else{
                    return false;
                }
            } catch(e) {
                console.log('error：'+str+'!!!'+e);
                return false;
            }
        }
        console.log('It is not a string!')
    }
}
