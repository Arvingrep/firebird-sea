//本地存储
var utils = {
    canStorage: function () {
        if (!!window.localStorage) {
            return true;
        }
        return false;
    },
    setStorage: function (a, c) {
        try {
            if (utils.canStorage()) {
                localStorage.removeItem(a);
                localStorage.setItem(a, c);
            }
        } catch (b) {
            if (b.name == "QUOTA_EXCEEDED_ERR") {
                alert("您开启了秘密浏览或无痕浏览模式，请关闭");
            }
        }
    },
    getStorage: function (b) {
        if (utils.canStorage()) {
            var a = localStorage.getItem(b);
            return a ? JSON.parse(localStorage.getItem(b)) : null;
        }
    },
    removeStorage: function (a) {
        if (utils.canStorage()) {
            localStorage.removeItem(a);
        }
    },
    cleanStorage: function () {
        if (utils.canStorage()) {
            localStorage.clear();
        }
    }
};

//页面导航右键菜单
var initRightNavMenu = function () {
    $(".nav-index li").rightMenu({
        func: function () {
            var t = $(this);
            //内页的菜单右键时才需要切换
            if($('body').hasClass('inside-page')){
                !t.hasClass("curr") ? t.click() : "";
            }else{
                !t.hasClass("curr") ? t.addClass('curr').siblings('li').removeClass('curr') : "";
            }
            rightNavMenu(t);
        }
    });
};

//遍历所有功能菜单
var permission_list = [];
$.each(permission_data, function(key, val){
    if(val['id'] == 'module'){
        //遍历所有模块
        $.each(val['data'], function(key, val){
            permission_list[val['id']] = val['data'];
        });
    }else{
        permission_list[val['id']] = val['data'] ? val['data'] : '';
    }
});


//预览图集
var file_images_list = [];

//最近使用的菜单链接集合
var common_function_urls = [];

//收藏的菜单链接集合
var collection_function_urls = [];

$(function () {

    //常用功能&我的收藏
    var ccfObj = $('.common-collection-function');
    ccfObj.find('.collection-function-list h3 em').bind('click', function(){
        ccfObj.toggleClass('setting');
        return false;
    });

    //切换全部导航菜单
    ccfObj.find('.ccf-nav').delegate('li', 'click', function(){
        var t = $(this), index = t.index(), nid = t.attr('data-id'), ntype = t.attr('data-type');

        if(t.hasClass('curr') && nid == 'func-module' && ntype != ''){
            ccfObj.find('.ccf-module-nav').toggle();
            return;
        }

        ccfObj.find('.ccf-module-nav').hide();

        t.addClass('curr').siblings('li').removeClass('curr');

        if(nid == 'func-module' && (ntype == '' || ntype == undefined)){
            ccfObj.find('.ccf-module-nav').show();
        }else{
            nid = nid == 'func-module' ? ntype : nid;
            ccfObj.find('.ccf-wrap .ccf-item').removeClass('curr');
            ccfObj.find('#' + nid).addClass('curr');
        }
        return false;
    });

    //切换全部导航中的模块导航
    ccfObj.find('.ccf-module-nav').delegate('li', 'click', function(){
        var t = $(this), nid = t.attr('data-id'), txt = t.text();
        ccfObj.find('.ccf-nav li[data-id=func-module]').html('模块 · ' + txt).attr('data-type', nid);
        ccfObj.find('.ccf-wrap .ccf-item').removeClass('curr');
        ccfObj.find('#' + nid).addClass('curr');
        ccfObj.find('.ccf-module-nav').hide();
        return false;
    });

    //取消设置
    ccfObj.find('.ccf-manage h3').bind('click', function(){
        ccfObj.toggleClass('setting');
    });

    //拼接我收藏的菜单
    if(collection_function){
        createCollectionFunction(collection_function);
    }

    function createCollectionFunction(data){
        var liArr = [];
        if(data.length > 0){
            $.each(data, function(key, val){
                liArr.push('<li><a class="add-page curr" data-id="'+val['id']+'" data-name="'+val['title']+'" href="'+val['url']+'" title="'+val['title']+'">'+val['title']+'</a></li>');
                collection_function_urls.push(val.url);
            });

            $('.collection-function-list ul').html(liArr.join(''));
        }else{
            $('.collection-function-list ul').html('<li>暂无菜单</li>');
        }
    }

    //拼接最近使用的菜单
    if(common_function){
        createCommonFunction(common_function);
    }

    //拼接全部导航菜单
    $.each(permission_data, function(key, val){
        ccfObj.find('.ccf-nav ul').append('<li data-id="func-'+val['id']+'">'+val['name']+'</li>');

        var ccfitem = [];

        //模块
        if(val['id'] == 'module'){

            $.each(val['data'], function(k, v){

                ccfObj.find('.ccf-module-nav ul').append('<li data-id="func-'+v['id']+'">'+v['name']+'</li>');

                ccfitem.push('<div class="ccf-item" id="func-'+v['id']+'">');

                $.each(v['data'], function(_k, _v){

                    ccfitem.push('<dl>');
                    ccfitem.push('<dt>'+_v['name']+'</dt>');

                    $.each(_v['data'], function(__k, __v){
                        ccfitem.push('<dd><a href="javascript:;" data-id="'+v['id']+'" data-name="'+__v['name']+'" data-title="'+v['name']+'" data-url="'+__v['url']+'" '+(in_array(__v['url'], collection_function_urls) ? " class='curr'" : '')+'>'+__v['name']+'</a></dd>');
                    });

                    ccfitem.push('</dl>');

                });

                ccfitem.push('</div>');

            });
            

        }else{

            ccfitem.push('<div class="ccf-item" id="func-'+val['id']+'">');

            if(val['data']){
                $.each(val['data'], function(k, v){
                    ccfitem.push('<dl>');
                    ccfitem.push('<dt>'+v['name']+'</dt>');

                    $.each(v['data'], function(_k, _v){
                        ccfitem.push('<dd><a href="javascript:;" data-id="'+val['id']+'" data-name="'+_v['name']+'" data-title="'+val['name']+'" data-url="'+_v['url']+'" '+(in_array(_v['url'], collection_function_urls) ? " class='curr'" : '')+'>'+_v['name']+'</a></dd>');
                    });

                    ccfitem.push('</dl>');
                });
            }else{
                ccfitem.push('<dl>');
                ccfitem.push('<dd><a href="javascript:;" data-id="'+val['id']+'" data-name="'+val['name']+'" data-url="'+val['url']+'" '+(in_array(val['url'], collection_function_urls) ? " class='curr'" : '')+'>'+val['name']+'</a></dd>');
                ccfitem.push('</dl>');

            }
            ccfitem.push('</div>');
        }

        ccfObj.find('.ccf-wrap').append(ccfitem.join(''));
    });
    ccfObj.find('.ccf-nav li:eq(0)').addClass('curr');
    ccfObj.find('.ccf-wrap .ccf-item:eq(0)').addClass('curr');

    //添加我的收藏
    $('.common-collection-function').delegate('a', 'click', function(e){
        var t = $(this), _id = t.attr('data-id'), _name = t.attr('data-name'), _url = t.attr('data-url') ? t.attr('data-url') : t.attr('href');

        if(t.closest('.common-collection-function').hasClass('setting')){
            e.preventDefault();
            
            //已经添加的，点击删除
            if(t.hasClass('curr')){

                t.removeClass('curr');

                //从数据中删除
                collection_function = collection_function.filter((x) => x.url !== _url);
                collection_function_urls = collection_function_urls.filter((x) => x !== _url);
                createCollectionFunction(collection_function);

            }else{

                if(collection_function.length >= 16){
                    $.dialog.tips('最多只能收藏16个', 3, 'error.png');
                    return false;
                }

                //没有添加过的才需要添加
                if(!in_array(_url, collection_function_urls)){
                    //全部导航菜单中点击后才需要添加选中样式
                    if(t.closest('dl').parent().hasClass('ccf-item')){
                        t.addClass('curr');
                    }
                    
                    collection_function.push({
                        'id': _id,
                        'title': _name,
                        'url': _url
                    });
                    collection_function_urls.push(_url);
                    createCollectionFunction(collection_function);
                }

            }

            //更新全部导航菜单中的选中样式
            $('.common-collection-function .ccf-manage').find('a').each(function(){
                var _t = $(this), _url = _t.attr('data-url');
                if(in_array(_url, collection_function_urls)){
                    _t.addClass('curr');
                }else{
                    _t.removeClass('curr');
                }
            });

            //接口更新
            $.ajax({
                type: "POST",
                url: "?dopost=updateCollectionFunction",
                dataType: "json",
                data: "data=" + encodeURIComponent(JSON.stringify(collection_function)),
                success: function () {}
            })

            return false;

        }
        //点击浮动层中的链接，隐藏浮动层
        else{
            $('.common-collection-function').addClass('hide');
            setTimeout(function(){
                $('.common-collection-function').removeClass('hide');
            }, 100);
        }
    });


    //搜索功能
    var typing = false;
    $('.search-input input').click(function(){
        $('.search-input').addClass('curr');
        $('.header-nav').addClass('transparent');

        if($(this).val() != ''){
            searchFunctionAndHelps();
        }

        $("<div>")
            .attr("id", "bodyBg")
            .css({ "position": "absolute", "left": "0", "top": "0", "width": "100%", "height": "100%", "background": "#fff", "opacity": "0", "z-index": "1" })
            .appendTo("body");
            
        return false;
    });
    $('.search-clean').bind('click', function(){
        $('.search-input').removeClass('has-value');
        $('.search-input input').val('');
        $('.search-input input').focus();
        $('.search-popup').hide();
        return false;
    });
    // $('.search-input input').blur(function(){
    //     $('.search-input').removeClass('curr');
    //     $('.header-nav').removeClass('transparent');
    // });
    $('.search-input input').bind('input', function(){
        var t = $(this), val = $.trim(t.val());
        if(val != ''){
            $('.search-input').addClass('has-value');
        }else{
            $('.search-input').removeClass('has-value');
        }
        if(!typing){
            searchFunctionAndHelps();
        }
    });
    $('.search-input input').on('compositionstart',function(){
        typing = true;
    });
    $('.search-input input').on('compositionend',function(){
        typing = false;
        searchFunctionAndHelps();
    });

    //功能切换
    $('.search-popup .search-nav').delegate('li', 'click', function(){
        var t = $(this), index = t.index();
        if(!t.hasClass('curr')){
            t.addClass('curr').siblings('li').removeClass('curr');
            $('.search-wrap .search-item').hide();
            $('.search-wrap .search-item:eq('+index+')').show();
            searchFunctionAndHelps();  //重新搜索
        }
    });

    $('.search-popup').bind('click', function(e){
        if(!$(e.target).hasClass('add-page') && !$(e.target).closest('a').hasClass('add-page') && !$(e.target).closest('a').hasClass('help-link') && !$(e.target).hasClass('search-help-more')){
            $('.search-input').addClass('curr');
            return false;
        }
    });

    //搜索
    var searchRequest = null;
    function searchFunctionAndHelps(){
        var searchKeyword = $.trim($('.search-input input').val());
        if(searchKeyword != ''){
            $('.search-popup').show();

            var searchType = $('.search-nav .curr').index();
            var searchItem = $('.search-wrap .search-item:eq('+searchType+')');

            searchItem.html('<p class="search-loading">搜索中...</p>');

            //中止上一次搜索请求
            if(searchRequest != null){
                searchRequest.abort();
            }

            //搜索功能
            if(searchType == 0){

                searchRequest = $.ajax({
                    type: "POST",
                    url: "funSearch.php",
                    dataType: "json",
                    data: "type=json&keyword=" + encodeURIComponent(searchKeyword),
                    success: function (data) {
                        if(!data.state){
                            var names = data.name, infos = data.info, searchHtml = [];
                            if(names.length > 0){
                                searchHtml.push('<h3>相关功能('+names.length+')</h3>');
                                searchHtml.push('<ul class="search-function-list">');
                                $.each(names, function(key, val){
                                    searchHtml.push('<li><a class="add-page" data-id="'+val['menuId']+'" data-name="'+val['name']+'" href="'+val['url']+'">'+val['name'].replace(searchKeyword, '<span>'+searchKeyword+'</span>')+'</a></li>');
                                });
                                searchHtml.push('</ul>');
                            }
                            if(infos.length > 0){
                                searchHtml.push('<h3>您可能在找</h3>');
                                searchHtml.push('<div class="search-probably-list">');
                                $.each(infos, function(key, val){
                                    searchHtml.push('<a class="add-page" data-id="'+val['menuId']+'" data-name="'+val['name']+'" href="'+val['url']+'"><dl><dt>'+val['name'].replace(searchKeyword, '<span>'+searchKeyword+'</span>')+'></dt><dd>'+val['info'].replace(searchKeyword, '<span>'+searchKeyword+'</span>')+'</dd></dl></a>');
                                });
                                searchHtml.push('</div>');
                            }
                            searchItem.html(searchHtml.join(''));

                        }else{
                            searchItem.html('<p class="search-loading">'+data.info+'</p>');
                        }
                    }
                })


            }
            //搜索帮助
            else{

                searchRequest = $.ajax({
                    type: "POST",
                    url: "https://help.kumanyun.com/json.php",
                    dataType: "jsonp",
                    data: "action=search&keywords=" + encodeURIComponent(searchKeyword),
                    success: function (data) {
                        if(data.state == 100){
                            var infos = data.info, searchHtml = [];
                            if(infos.length > 0){
                                searchHtml.push('<h3>相关帮助('+infos.length+')</h3>');

                                //这里显示前10条
                                infos = infos.slice(0, 10);

                                searchHtml.push('<div class="search-help-list">');
                                $.each(infos, function(key, val){
                                    searchHtml.push('<a class="help-link" href="https://help.kumanyun.com/help-'+val['type']+'-'+val['id']+'.html" target="_blank"><dl><dt>'+val['title'].replace(searchKeyword, '<span>'+searchKeyword+'</span>')+'></dt><dd>'+val['content'].replace(searchKeyword, '<span>'+searchKeyword+'</span>')+'</dd></dl></a>');
                                });

                                if(data.info.length > 10){
                                    searchHtml.push('<a href="https://help.kumanyun.com/search.html?keywords='+searchKeyword+'" target="_blank" class="search-help-more">查看更多</a>');
                                }
                                searchHtml.push('</div>');
                            }
                            searchItem.html(searchHtml.join(''));

                        }else{
                            searchItem.html('<p class="search-loading">'+data.info+'</p>');
                        }
                    }
                })

            }

        }else{
            $('.search-popup').hide();
        }

    }


    //拼接常用模块和剩余模块
    var common_module_list = [];
    if(common_module){
        for(var i = 0; i < common_module.length; i++){

            //如果有该模块权限
            if(permission_list[common_module[i]]){

                //查询该模块信息
                $.each(permission_data[2]['data'], function(key, val){
                    if(val['id'] == common_module[i]){
                        common_module_list.push({
                            'name': val['name'],
                            'icon': val['icon'],
                            'id': val['id'],
                            'title': val['data'][0]['data'][0]['name'],
                            'url': val['data'][0]['data'][0]['url']
                        });
                    }
                });

            }

        }
    }

    //如果有常用模块
    if(common_module_list.length > 0){
        createCommonModule(common_module_list);
    }

    //拼接常用模块结构
    function createCommonModule(data, sidebar = true){
        //显示到侧边导航
        var sidebarCommonModule = [];
        //显示到浮动模块层中
        var popupCommonModule = [];
        for(var i = 0; i < data.length; i++){
            sidebarCommonModule.push('<dd><a class="add-page" id="'+data[i]['id']+'" data-name="'+data[i]['title']+'" href="'+data[i]['url']+'"><span>'+data[i]['name']+'</span></a></dd>');
            popupCommonModule.push('<li class="add-page" id="'+data[i]['id']+'" data-name="'+data[i]['title']+'" href="'+data[i]['url']+'"><div class="img"><img src="'+data[i]['icon']+'" /></div><span>'+data[i]['name']+'</span></li>');
        }

        if(sidebar){
            $('.nav-common-module').remove();
            if(sidebarCommonModule.length > 0){
                $('#module').addClass('has-common-module').before('<li class="nav-common-module"><dl><dt>常用模块</dt>'+sidebarCommonModule.join('')+'</dl></li>');
            }else{
                $('#module').removeClass('has-common-module')
            }
        }

        if(popupCommonModule.length > 0){
            $('.module-popup .empty-module').hide();
            $('.module-popup .common-module .module-list ul').html(popupCommonModule.join(''));
            $('.module-popup .common-module .module-list').show();
        }else{
            $('.module-popup .empty-module').show();
            $('.module-popup .common-module .module-list ul').html('');
            $('.module-popup .common-module .module-list').hide();
        }
    }

    //正常模块
    var defaultModule = [];
    if(typeof permission_data[2] != 'undefined'){
        $.each(permission_data[2]['data'], function(key, val){
            if(!in_array(val['id'], common_module)){
                defaultModule.push({
                    'name': val['name'],
                    'icon': val['icon'],
                    'id': val['id'],
                    'title': val['data'][0]['data'][0]['name'],
                    'url': val['data'][0]['data'][0]['url']
                });
            }
        });
    }

    if(defaultModule){
        createDefaultModule(defaultModule);
    }

    //拼接默认模块结构
    function createDefaultModule(data){
        var defaultModuleLi = [];
        for(var i = 0; i < data.length; i++){
            defaultModuleLi.push('<li class="add-page" id="'+data[i]['id']+'" data-name="'+data[i]['title']+'" href="'+data[i]['url']+'"><div class="img"><img src="'+data[i]['icon']+'" /></div><span>'+data[i]['name']+'</span></li>');
        }
        $('.module-popup .default-module .module-list ul').html(defaultModuleLi.join(''));
    }



    //显示系统模块
    var modulePopup = $('.module-popup');
    modulePopup.on('mouseover', function(){
        modulePopup.show();
    });
    modulePopup.on('mousemove', function(){
        modulePopup.show();
    });
    modulePopup.on('mouseout', function(){
        if(!modulePopup.hasClass('setting')){
            modulePopup.hide();
        }
    });
    modulePopup.delegate('.add-page', 'click', function(e){

        //如果处于编辑状态
        if(modulePopup.hasClass('setting')){
            e.preventDefault();
            return false;
        }else{
            modulePopup.hide();
        }

    });
    $('#module').hover(function(){
        var t = $(this), offset = t.offset(), top = offset.top;
        var showtop = top - modulePopup.height() / 2 - 50;

        //判断是否超出可视区域
        if(showtop + modulePopup.height() > $(window).height()){
            showtop = $(window).height() - modulePopup.height();
        }

        //最小值为10
        showtop = showtop < 10 ? 10 : showtop;

        modulePopup.css('top', showtop).show();
    }, function(){
        if(!modulePopup.hasClass('setting')){
            modulePopup.hide();
        }
    });

    //设置常用模块
    var common_module_list_temp = [];  //临时数据
    var defaultModule_temp = [];  //临时数据

    modulePopup.delegate('.setting-btn, .empty-module', 'click', function(){

        common_module_list_temp = JSON.parse(JSON.stringify(common_module_list));  //临时数据
        defaultModule_temp = JSON.parse(JSON.stringify(defaultModule));  //临时数据

        modulePopup.addClass('setting');
        modulePopup.find('.default-title').hide();
        modulePopup.find('.setting-title').css('display', 'flex');

        //常用模块拖拽排序
        $(".module-popup .common-module .module-list ul").dragsort({ dragSelector: "li", placeHolderTemplate: '<li class="placeHolder"></li>', dragEnd: function(){
            common_module_list_temp = [];
            modulePopup.find('.common-module .module-list li').each(function(){
                var t = $(this), _id = t.attr('id'), _title = t.attr('data-name'), _url = t.attr('href'), _name = t.find('span').text(), _icon = t.find('img').attr('src');
                common_module_list_temp.push({
                    'name': _name,
                    'icon': _icon,
                    'id': _id,
                    'title': _title,
                    'url': _url
                });
            })
        }});
    });

    //删除常用模块
    modulePopup.delegate('.common-module .module-list li', 'click', function(){
        if(modulePopup.hasClass('setting')){
            var t = $(this), _id = t.attr('id'), _title = t.attr('data-name'), _url = t.attr('href'), _name = t.find('span').text();
            common_module_list_temp = common_module_list_temp.filter((x) => x.id !== _id);
            createCommonModule(common_module_list_temp, false);
            updateDefaultModule();
        }
    });

    //添加常用模块
    modulePopup.delegate('.default-module .module-list li', 'click', function(){
        if(modulePopup.hasClass('setting')){
            var t = $(this), _id = t.attr('id'), _title = t.attr('data-name'), _url = t.attr('href'), _name = t.find('span').text(), _icon = t.find('img').attr('src');
            common_module_list_temp.push({
                'name': _name,
                'icon': _icon,
                'id': _id,
                'title': _title,
                'url': _url
            });
            createCommonModule(common_module_list_temp, false);
            updateDefaultModule();
        }
    });

    //设置常用模块后，更新普通模块
    function updateDefaultModule(){
        
        //获取临时设置的常用模块
        var tempCommonModule = [];
        if(common_module_list_temp){
            $.each(common_module_list_temp, function(key, val){
                tempCommonModule.push(val.id);
            });
        }

        var tempDefaultModule = [];
        $.each(permission_data[2]['data'], function(key, val){
            if(!in_array(val['id'], tempCommonModule)){
                tempDefaultModule.push({
                    'name': val['name'],
                    'icon': val['icon'],
                    'id': val['id'],
                    'title': val['data'][0]['data'][0]['name'],
                    'url': val['data'][0]['data'][0]['url']
                });
            }
        });
    
        if(tempDefaultModule){
            createDefaultModule(tempDefaultModule);
        }
    }


    //取消设置常用模块
    modulePopup.delegate('.cancel-btn', 'click', function(){
        modulePopup.removeClass('setting');
        modulePopup.find('.default-title').css('display', 'flex');
        modulePopup.find('.setting-title').hide();

        //取消常用模块拖拽排序
        $(".module-popup .common-module .module-list ul").dragsort("destroy");

        //恢复默认s
        createCommonModule(common_module_list);
        createDefaultModule(defaultModule);
    });


    //保存设置常用模块
    modulePopup.delegate('.save-btn', 'click', function(){
        modulePopup.removeClass('setting');
        modulePopup.find('.default-title').css('display', 'flex');
        modulePopup.find('.setting-title').hide();

        //取消常用模块拖拽排序
        $(".module-popup .common-module .module-list ul").dragsort("destroy");

        //使用新的数据
        common_module_list = common_module_list_temp;

        //提取id
        var _module = [];
        $.each(common_module_list, function(key, val){
            _module.push(val.id);
        })
        
        //接口更新
        $.ajax({
            type: "POST",
            url: "?dopost=updateCommonModule",
            dataType: "json",
            data: "module=" + _module.join(','),
            success: function () {}
        })

        //更新页面结构
        createCommonModule(common_module_list);
        updateDefaultModule();
    });


    //回到首页
    $('#homepage').bind('click', function(e){
        e.preventDefault();
        var t = $(this);

        //选中首页
        t.parent().addClass('curr').siblings('li').removeClass('curr');

        //取消侧边导航选中样式
        $('.aside-nav .curr').removeClass('curr');

        //取消body的样式
        $('body').removeClass('inside-page');

        //取消内容的样式
        $('section').removeClass('has-sub-nav');

        //隐藏二级菜单
        $('.sub-nav').hide();

        window.dispatchEvent(new Event('resize'));
    });

    //内容菜单导航鼠标滑动左右滚动
    var outDiv = document.getElementById('navul');  
    outDiv.onwheel = function(event){  
        //禁止事件默认行为（此处禁止鼠标滚轮行为关联到"屏幕滚动条上下移动"行为）  
        event.preventDefault();  
        //设置鼠标滚轮滚动时屏幕滚动条的移动步长  
        var step = 50;  
        var mleft = parseInt($(this).css('margin-left').replace('px', ''));

        var ulwidth = 0;
        for (var i = 0; i < $('#navul').find('li').length; i++) {
            ulwidth = ulwidth + $(".nav-list li:eq(" + i + ")").outerWidth(true);
        };

        var navlistwidth = $('.nav-index').width();

        if(ulwidth < navlistwidth) return;

        if(event.deltaY > 0){
            //向上滚动鼠标滚轮，屏幕滚动条右移
            var _mleft = mleft - step;
            _mleft = _mleft > 0 ? 0 : _mleft;

            if(navlistwidth - ulwidth - 66 > mleft){
                return;
            }

            $(this).css('margin-left', _mleft);
        } else {
            //向下滚动鼠标滚轮，屏幕滚动条左移
            var _mleft = mleft + step;
            _mleft = _mleft > 0 ? 0 : _mleft;
            $(this).css('margin-left', _mleft);
        }  
    }


    //打开页面
    $('body').delegate('.add-page', 'click', function(e){
        e.preventDefault();
        var t = $(this), _id = t.attr('data-id') ? t.attr('data-id') : t.attr('id'), _name = t.attr('data-name'), _url = t.attr('data-url') ? t.attr('data-url') : t.attr('href');

        var pageUrlData = _url.split("/"),
        pageID = pageUrlData[1].replace(/\./g, "").replace(/\=/g, "").replace(/\?/g, "").replace(/\&/g, "").replace('notice1', '');
        
        addPage(pageID, _id ? _id : pageUrlData[0], _name, _url);
    });


    //初始化页面导航菜单右键
    initRightNavMenu();


    //页面导航拖动排序
    $(".nav-list ul").dragsort({ dragSelector: "li", placeHolderTemplate: '<li class="placeHolder"><label>&nbsp;</label></li>', delayTime: 200 });


    //双击关闭菜单
    $(".nav-list").delegate("li", "dblclick", function (e) {
        $(this).find("s").click();
    });

    //内容菜单返回
    $('.nav-back').bind('click', function(){
        //查询本地存储中最后打开的页面
        var navPageData = utils.getStorage('nav-pages');
        if(navPageData){
            $.each(navPageData, function(key, val){
                if(val['curr']){
                    addPage(val['id'], val['type'], val['title'], val['url']);
                    return false;
                }
            });
        }
    });
    
    //内容菜单助手
    $('.nav-tools').bind('click', function(){
        rightNavMenu($(this));
        return false;
    });

    //内容菜单切换
    $(".nav-list").delegate("li", "click", function (e) {
        
        var t = $(this), id = t.attr("id").replace("nav-", ""), type = t.attr("data-type"), title = t.attr("title"), index = t.index();

        //关闭按钮
        if (e.target.nodeName.toLowerCase() == "s") {
            $("#body-" + id).remove();
            $(".nav-list li:eq(" + index + ")").remove();

            //标签数量小于3个，隐藏右边小工具按钮
            if($('.nav-list li').length < 3){
                $('.nav-tools').hide();
            }

            //如果都关闭完了
            if($('.nav-list li').length == 0){
                $('.nav-index').hide();
                $('section').removeClass('has-nav-index');
                utils.cleanStorage('nav-pages');
                $('#homepage').click();
            }else{
                //打开上一个标签，只有在内页时才需要打开上一个标签
                if (t.hasClass("curr") && $('body').hasClass('inside-page')) {
                    $(".nav-list li:eq(" + (index - 1) + ")").click();
                }
            }
            parentHideTip();


        //刷新
        }else if(e.target.nodeName.toLowerCase() == "em"){

            if(t.hasClass('refreshing')) return false;
            reloadPage("body-" + id);
            t.addClass('refreshing');

            setTimeout(function(){
                t.removeClass('refreshing');
            }, 2000);

            //切换
        } else {

            //关闭菜单
            closeMenu();

            if (t.hasClass("curr") && $('body').hasClass('inside-page')) return false;

            $(".nav-list li").removeClass("curr");
            t.addClass("curr");

            $("#iframe iframe").hide();
            if($("#body-" + id).attr('src') == undefined){
                $("#body-" + id).attr('src', $("#body-" + id).attr('data-src'));
            }
            $("#body-" + id).show();
            
            //重新调用添加页面方法，主要用于显示二级菜单
            if($("#body-" + id).size() > 0){
                addPage(id, type, title, $("#body-" + id).attr('src'));
            }

        }

        //计算点击的li左边的li宽度和
        var w = 0, index = t.index();
        for (var i = 0; i < index; i++) {
            w = w + $(".nav-list li:eq(" + i + ")").outerWidth(true);
        };

        var ul = $('.nav-list ul'),
            li_offset = t.offset(),
            li_width = t.outerWidth(true),
            navwidth = Number($(".nav-list").width());

        //计算所有li的宽度和
        var ulwidth = 0;
        for (var i = 0; i < ul.find('li').length; i++) {
            ulwidth = ulwidth + $(".nav-list li:eq(" + i + ")").outerWidth(true);
        };
        
        if(ulwidth > navwidth){
            if (li_offset.left + li_width - 115 > navwidth) {//如果将要移动的元素在不可见的右边，则需要移动
                var distance = w + li_width - navwidth;//计算当前父元素的右边距离，算出右移多少像素
                if (distance < 0) {
                    distance = 0;
                }
                ul.animate({ "margin-left": -distance }, 200, 'swing');
            } else if (li_offset.left < $(".nav-list").offset().left) {//如果将要移动的元素在不可见的左边，则需要移动
                var distance = ul.offset().left - li_offset.left;//计算当前父元素的左边距离，算出左移多少像素
                if (distance > 0) {
                    distance = 0;
                }
                ul.animate({ "margin-left": distance }, 200, 'swing');
            }
        }else{
            ul.animate({ "margin-left": 0 }, 200, 'swing');
        }
    });

    //恢复关闭浏览器前打开的标签
    var navPageData = utils.getStorage('nav-pages');
    if(navPageData){
        $.each(navPageData, function(key, val){
            addPage(val['id'], val['type'], val['title'], val['url'], false);
        });
        $('section').addClass('has-nav-index');
        $('.nav-index').show();
    }

    
    //退出登录提示
    $(".user-logout").bind("click", function (event) {
        var href = $(this).attr("data-href");
        event.preventDefault();
        $.dialog.confirm('确定要退出吗？', function () {

            var channelDomainClean = window.location.host;
            var channelDomain_1 = channelDomainClean.split('.');
            var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0] + ".", "");

            channelDomain_ = channelDomainClean.split("/")[0];
            channelDomain_1_ = channelDomain_1_.split("/")[0];

            $.cookie(cookiePre + 'admin_auth', null, { domain: channelDomainClean, path: '/' });
            $.cookie(cookiePre + 'admin_auth', null, { domain: channelDomain_1_, path: '/' });

            location.href = href;
        });
    });


    //统计数据
    if($('.basic-statistics').size() > 0){
        realtimedata();
        setInterval(realtimedata,10000);  //10秒更新一次
    }
	function realtimedata(){
        //只有停留在首页时才需要更新
        if(!$('body').hasClass('inside-page')){
            $.ajax({
                url: 'index.php?dopost=realtimedata',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        var info = data.info;

                        //收益
                        $('#totalIncome').html(info.totalIncome);
                        $('#todayIncome').html(info.todayIncome);
                        $('#yesterdayIncome').html(info.yesterdayIncome);

                        //会员
                        $('#totalMember').html(info.totalMember);
                        $('#todayMember').html(info.todayMember);
                        $('#onlineMember').html(info.onlineMember);

                        //商家
                        $('#totalBusiness').html(info.totalBusiness);
                        $('#todayBusiness').html(info.todayBusiness);
                        $('#yesterdayBusiness').html(info.yesterdayBusiness);
                        $('#promotion').html(info.promotion);

                        //分销商
                        $('#totalFenxiao').html(info.totalFenxiao);
                        $('#todayFenxiao').html(info.todayFenxiao);
                        $('#yesterdayFenxiao').html(info.yesterdayFenxiao);
                    }
                }
            });
        }
	}


    //平台收益图表
    if($('#platform-chart').size() > 0){
        var platformChartDom = document.getElementById('platform-chart');
        var platformChart = echarts.init(platformChartDom);
        var platformChartOption;

        var symbol = "&yen;";
        var currency = $.cookie('HN_currency');
        if(currency){
            currency = JSON.parse(decodeURIComponent(atob(currency)));
            symbol = currency.symbol;
        }

        platformChartOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                extraCssText: 'box-shadow: 0px 8px 25px 0px rgba(41,95,204,0.1); border: 1px solid #EAEFF6; border-radius: 6px; line-height: 14px;',
                formatter: symbol + " {c0}"
            },
            grid: {
                top: '10%',
                left: '9%',
                right: '5%',
                bottom: '10%'
            },
            xAxis: {
                type: 'category',
                boundaryGap: true,  //两边留白
                data: [],
                axisLine: {
                    show: false
                },
                axisTick: {
                show: false
                },
                offset: 5
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: true,
                    lineStyle: {
                    color: "#EAEFF6"
                    }
                }
            },
            series: [
                {
                    data: [],
                    type: 'line',
                    smooth: true,
                    symbol: 'circle',
                    symbolSize: 10,
                    lineStyle: {
                        width: 3,
                        color: '#26D49B'
                    },
                    itemStyle: {
                        color: '#26D49B',
                        borderWidth: 3,
                        borderColor: '#fff',
                        borderType: 'solid'
                    },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: 'rgba(4,199,55,.08)' // 0% 处的颜色
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(255,255,255,.03)' // 100% 处的颜色
                                }
                            ],
                            global: false // 缺省为 false
                        }
                    }
                }
            ]
        };


        //平台收益数据
        function getPlatformRevenueData(data, func){

            $.ajax({
                url: 'index.php?dopost=getPlatformRevenueData&'+data,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        func(data.info);
                    }else{
                        $.dialog.tips(data.info, 3, 'error.png');
                    }
                },
                error: function(){
                    $.dialog.tips('网络错误，请稍候重试！', 3, 'error.png');
                }
            });

        }

        //平台收益（周）
        function getPlatformRevenueWeek(chartObj){

            var func = function(data){
                platformChartOption.grid = {
                    top: '10%',
                    left: '8%',
                    right: '5%',
                    bottom: '10%'
                };
                platformChartOption.xAxis.data = data.xAxis;
                platformChartOption.series[0].data = data.series;
                platformChartOption && chartObj.setOption(platformChartOption);

                $('#platformIncome').html(data.totalAmount);
            }

            getPlatformRevenueData('type=week', func);

        }

        //平台收益（月、年、自定义时间）
        var showLoading = null;
        var platformCharts;
        function getPlatformRevenue(type){
            
            showLoading = $.dialog.tips('查询中...', 600, 'loading.gif');
            showLoading.show();

            var func = function(data){

                showLoading.hide();

                $('.platform-income-popup').show();
                
                platformChartOption.grid = {
                    top: '10%',
                    left: '4%',
                    right: '1%',
                    bottom: '10%'
                };
                var platformChartDoms = document.getElementById('platform-charts');
                platformCharts = echarts.init(platformChartDoms);
                platformChartOption.xAxis.data = data.xAxis;
                platformChartOption.series[0].data = data.series;
                platformChartOption && platformCharts.setOption(platformChartOption);

                $('.platform-income-popup .platform-con-statistics h5 strong').html(data.totalAmount);
                $('.platform-income-popup .platform-note').html(data.startDate + ' - ' + data.endDate + '&nbsp;&nbsp;平台收益趋势');
            }

            getPlatformRevenueData(type, func);

        }

        //初始加载
        getPlatformRevenueWeek(platformChart);
    }

    //切换月、年、自定义时间

    //关闭平台收益浮动层
    $('.platform-income-popup .platform-close').bind('click', function(){
        $('.platform-income-popup').hide();
    })

    //默认切换月
    $('#platform-time-chose span').bind('click', function(){
        var t = $(this);
        if(t.hasClass('month')){
            $('.platform-income-popup .time-chose span').removeClass('curr');
            $('.platform-income-popup .time-chose .month').addClass('curr');
            getPlatformRevenue('type=month');
        }
    })

    //浮动层时间切换
    $('.platform-income-popup .time-chose span').bind('click', function(){
        var t = $(this);
        if(t.hasClass('month')){
            t.addClass('curr').siblings('span').removeClass('curr');
            getPlatformRevenue('type=month');
        }else if(t.hasClass('year')){
            t.addClass('curr').siblings('span').removeClass('curr');
            getPlatformRevenue('type=year');
        }
    });

    //下载图表
    $('.platform-income-popup .platform-btn-download').bind('click', function(){
        var chartsImgUrl = platformCharts.getDataURL({
            pixelRatio: 2,
            backgroundColor: '#fff'
        });

        var a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = chartsImgUrl;
        a.download = '平台收益';
        a.click();
        window.URL.revokeObjectURL(chartsImgUrl);
    });


    //选择自定义日期范围
    var optionSet2 = {
        "autoApply": true,
        "opens": 'left',
        "linkedCalendars": false
    };
    $('#reportrange2').daterangepicker(optionSet2, function(start, end) {
        $('.platform-income-popup .time-chose span').removeClass('curr');
        $('.platform-income-popup .time-chose .self-define').addClass('curr');
        getPlatformRevenue('start=' + start.format('YYYY-MM-DD') + '&end=' + end.format('YYYY-MM-DD'));
    });

    var optionSet3 = {
        "autoApply": true,
        "opens": 'right',
        "linkedCalendars": false
    };
    $('#reportrange3').daterangepicker(optionSet3, function(start, end) {
        $('.platform-income-popup .time-chose span').removeClass('curr');
        $('.platform-income-popup .time-chose .self-define').addClass('curr');
        getPlatformRevenue('start=' + start.format('YYYY-MM-DD') + '&end=' + end.format('YYYY-MM-DD'));
    });



    //收支数据分析
    if($('#receipt-chart').size() > 0){
        var receiptChartDom = document.getElementById('receipt-chart');
        var receiptChart = echarts.init(receiptChartDom);
        var receiptChartOption;

        receiptChartOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                extraCssText: 'box-shadow: 0px 8px 25px 0px rgba(41,95,204,0.1); border: 1px solid #EAEFF6; border-radius: 6px;',
                formatter: function (params, ticket, callback) {
                    var html = '<div class="echarts-tooltip">';
                    html += '<div class="echarts-ruzhang">入账：<strong>'+params[0].value.toFixed(2)+'</strong></div>';

                    if(params.length > 2){

                        html += '<div class="echarts-split"></div>';

                        var totalAmount = 0;
                        $.each(params, function(key, val){
                            if(key > 0){
                                totalAmount += val.value;
                            }
                        })
                        html += '<div class="echarts-chuzhang">出账：'+totalAmount.toFixed(2)+'</div>';
                        html += '<div class="echarts-mingxi">';
                        html += '<label><em style="background-color:#5E94FF;"></em>用户提现<strong>'+params[1].value.toFixed(2)+'</strong></label>';

                        if(siteCityCount > 1){
                            html += '<label><em style="background-color:#8063FF;"></em>城市分佣<strong>'+params[2].value.toFixed(2)+'</strong></label>';
                        }
                        if(fenxiaoState == 1){
                            if(siteCityCount > 1){
                                html += '<label><em style="background-color:#FF71F0;"></em>分销分佣<strong>'+params[3].value.toFixed(2)+'</strong></label>';
                            }else{
                                html += '<label><em style="background-color:#8063FF;"></em>分销分佣<strong>'+params[2].value.toFixed(2)+'</strong></label>';
                            }
                        }
                        html += '</div>';
                    }else{
                        html += '<div class="echarts-chuzhang">提现：<font color="#5E94FF">'+params[1].value.toFixed(2)+'</font></div>';
                    }
                    
                    html += '</div>';

                    return html;
                }
            },
            grid: {
                top: '10%',
                left: '9%',
                right: '0%',
                bottom: '11%'
            },
            xAxis: {
                type: 'category',
                boundaryGap: true,  //两边留白
                data: [],
                axisLine: {
                    show: false
                },
                axisTick: {
                show: false
                },
                offset: 5
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: true,
                    lineStyle: {
                    color: "#EAEFF6"
                    }
                }
            },
            color: ['#26D49B', '#5E94FF', '#8063FF', '#FF71F0'],
            series: []
        };

        function getExpensesReceiptsData(type, func){
            $.ajax({
                url: 'index.php?dopost=getExpensesReceipts&type='+type,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        func(data.info);
                    }else{
                        $.dialog.tips(data.info, 3, 'error.png');
                    }
                },
                error: function(){
                    $.dialog.tips('网络错误，请稍候重试！', 3, 'error.png');
                }
            });
        }

        var showExpensesReceiptsLoading = null;
        function getExpensesReceipts(){
            var type = $('.receipt-left .time-chose .curr').attr('data-type');

            var func = function(data){

                if(showExpensesReceiptsLoading != null){
                    showExpensesReceiptsLoading.hide();
                }
                
                receiptChartOption.xAxis.data = data.xAxis;
                receiptChartOption.series = data.series;
                receiptChartOption && receiptChart.setOption(receiptChartOption);
            }

            getExpensesReceiptsData(type, func);
        }

        //收支数据分析时间切换
        $('.receipt-left .time-chose span').bind('click', function(){
            var t = $(this);
            t.addClass('curr').siblings('span').removeClass('curr');

            showExpensesReceiptsLoading = $.dialog.tips('查询中...', 600, 'loading.gif');
            showExpensesReceiptsLoading.show();
            getExpensesReceipts();
        });

        //默认加载近1周的收支数据分析数据
        setTimeout(getExpensesReceipts, 500);
    }


    //用户充值与提现
    if($('#withdraw-chart').size() > 0){
        var withdrawChartDom = document.getElementById('withdraw-chart');
        var withdrawChart = echarts.init(withdrawChartDom);
        var withdrawChartOption;

        withdrawChartOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                extraCssText: 'box-shadow: 0px 8px 25px 0px rgba(41,95,204,0.1); border: 1px solid #EAEFF6; border-radius: 6px;',
                formatter: function (params, ticket, callback) {
                    var html = '<div class="echarts-tooltip">';
                    html += '<div class="echarts-chuzhang">充值：</div>';
                    html += '<div class="echarts-mingxi">';
                    html += '<label><em style="background-color:#26D49B;"></em>余额<strong>'+params[0].value.toFixed(2)+'</strong></label>';
                    html += '<label><em style="background-color:#26D49B;"></em>'+pointName+'<strong>'+params[1].value.toFixed(2)+'</strong></label>';
                    html += '<label><em style="background-color:#26D49B;"></em>'+bonusName+'<strong>'+params[2].value.toFixed(2)+'</strong></label>';
                    html += '</div>';
                    html += '<div class="echarts-split"></div><div class="echarts-ruzhang">提现：<strong>'+params[3].value.toFixed(2)+'</strong></div>';
                    html += '</div>';

                    return html;
                }
            },
            grid: {
                top: '10%',
                left: '9%',
                right: '0%',
                bottom: '11%'
            },
            xAxis: {
                type: 'category',
                boundaryGap: true,  //两边留白
                data: [],
                axisLine: {
                    show: false
                },
                axisTick: {
                show: false
                },
                offset: 5
            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: true,
                    lineStyle: {
                    color: "#EAEFF6"
                    }
                }
            },
            color: ['#26D49B', '#26D49B', '#26D49B', '#5E94FF'],
            series: []
        };

        function getRechargeWithdrawData(type, func){
            $.ajax({
                url: 'index.php?dopost=getRechargeWithdraw&type='+type,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        func(data.info);
                    }else{
                        $.dialog.tips(data.info, 3, 'error.png');
                    }
                },
                error: function(){
                    $.dialog.tips('网络错误，请稍候重试！', 3, 'error.png');
                }
            });
        }

        var showRechargeWithdrawLoading = null;
        function getRechargeWithdraw(){
            var type = $('.receipt-right .time-chose .curr').attr('data-type');

            var func = function(data){

                if(showRechargeWithdrawLoading != null){
                    showRechargeWithdrawLoading.hide();
                }
                
                withdrawChartOption.xAxis.data = data.xAxis;
                withdrawChartOption.series = data.series;
                withdrawChartOption && withdrawChart.setOption(withdrawChartOption);
            }

            getRechargeWithdrawData(type, func);
        }

        //用户充值与提现时间切换
        $('.receipt-right .time-chose span').bind('click', function(){
            var t = $(this);
            t.addClass('curr').siblings('span').removeClass('curr');

            showRechargeWithdrawLoading = $.dialog.tips('查询中...', 600, 'loading.gif');
            showRechargeWithdrawLoading.show();
            getRechargeWithdraw();
        });

        //默认加载近1周的用户充值与提现数据
        setTimeout(getRechargeWithdraw, 1000);
    }

    //图表自适应
    window.addEventListener('resize', function () {

        //内容左右宽度自动计算
        var baseStatisticsItemWidth = $('.basic-statistics-item').outerWidth();
        $('.left-side').css('width', baseStatisticsItemWidth * 3 + 40);
        $('.right-side').css('width', baseStatisticsItemWidth);

        platformChart && platformChart.resize();
        receiptChart && receiptChart.resize();
        withdrawChart && withdrawChart.resize();
    });

    // 设置待办事项宽度和高度
    var baseStatisticsItemWidth = $('.basic-statistics-item').outerWidth();
    $('.left-side').css('width', baseStatisticsItemWidth * 3 + 40);
    $('.right-side').css('width', baseStatisticsItemWidth);

    $('.notice-wrap').css('height', $('.left-side-container').height() - 65);


    //出入账明细切换
    var showEntryLoading = null;
    $('#today-type-chose span').bind('click', function(){
        var t = $(this), index = t.index();
        var type = $('#today-time-chose .curr').attr('data-type');

        if(t.hasClass('curr')) return;

        t.addClass('curr').siblings('span').removeClass('curr');
        $('.entry-obj-0, .entry-obj-1').hide();
        $('.entry-obj-' + index).show();

        showEntryLoading = $.dialog.tips('查询中...', 600, 'loading.gif');
        showEntryLoading.show();

        var typeName = '';
        if(type == 'today'){
            typeName = '今日';
        }else if(type == 'month'){
            typeName = '本月';
        }else if(type == 'year'){
            typeName = '今年';
        }
        
        //入账
        if(index == 0){
            $('.platform-right .data-title h3').html(typeName + '统计');
            $('.entry-obj-0 .entry-amount dt').html(typeName + '入账金额');
            $('.entry-obj-0 .entry-cell-item:eq(0) dt').html(typeName + '用户充值');
            $('.entry-obj-0 .entry-cell-item:eq(1) dt').html(typeName + '平台佣金');

            getEntryData();
        }
        //出账
        else{
            $('.platform-right .data-title h3').html('出账明细');
            $('.entry-obj-1 .entry-amount dt').html(typeName + '出账金额');
            $('.entry-obj-1 .entry-cell-item:eq(0) dt').html(typeName + '用户提现');

            getOutgoingData();

        }

    });

    //出入账时间切换
    $('#today-time-chose span').bind('click', function(){
        var t = $(this), index = t.index(), type = t.attr('data-type');

        if(t.hasClass('curr')) return;

        t.addClass('curr').siblings('span').removeClass('curr');
        
        var typeIndex = $('#today-type-chose span.curr').index();

        showEntryLoading = $.dialog.tips('查询中...', 600, 'loading.gif');
        showEntryLoading.show();

        var typeName = '';
        if(type == 'today'){
            typeName = '今日';
        }else if(type == 'month'){
            typeName = '本月';
        }else if(type == 'year'){
            typeName = '今年';
        }

        //入账
        if(typeIndex == 0){

            $('.platform-right .data-title h3').html(typeName + '统计');
            $('.entry-obj-0 .entry-amount dt').html(typeName + '入账金额');
            $('.entry-obj-0 .entry-cell-item:eq(0) dt').html(typeName + '用户充值');
            $('.entry-obj-0 .entry-cell-item:eq(1) dt').html(typeName + '平台佣金');

            getEntryData();
        }
        //出账
        else{

            $('.platform-right .data-title h3').html('出账明细');
            $('.entry-obj-1 .entry-amount dt').html(typeName + '出账金额');
            $('.entry-obj-1 .entry-cell-item:eq(0) dt').html(typeName + '用户提现');

            getOutgoingData();
            
        }

    });

    //获取入账数据
    function getEntryData(){
        var type = $('#today-time-chose .curr').attr('data-type');

        $.ajax({
            url: 'index.php?dopost=platformEntry&type='+type,
            type: "GET",
            dataType: "json",
            success: function (data) {

                if(showEntryLoading != null){
                    showEntryLoading.hide();
                }

                if(data.state == 100){
                    var info = data.info;

                    $('#platformEntry').html(info.totalAmount);
                    $('#platformRecharge').html(info.recharge);
                    $('#platformCommission').html(info.platformCommission);
                    $('#platformJoinCommission').html(info.joinCommission);

                    var paymentProportion1 = [];
                    var paymentProportion2 = [];
                    $.each(info.paymentProportion, function(key, val){
                        paymentProportion1.push('<span><em></em>'+val['name']+val['proportion']+'%</span>');
                        paymentProportion2.push('<span style="width: '+val['proportion']+'%;"></span>');
                    })
                    $('.entry-obj-0 .entry-scale dt').html(paymentProportion1.join(''));
                    $('.entry-obj-0 .entry-scale dd').html(paymentProportion2.join(''));
                }
            },
            error: function(){
                $.dialog.tips('网络错误，请稍候重试！', 3, 'error.png');
            }
        });

    }

    
    //获取出账数据
    function getOutgoingData(){
        var type = $('#today-time-chose .curr').attr('data-type');

        $.ajax({
            url: 'index.php?dopost=platformOutgoing&type='+type,
            type: "GET",
            dataType: "json",
            success: function (data) {

                if(showEntryLoading != null){
                    showEntryLoading.hide();
                }

                if(data.state == 100){
                    var info = data.info;

                    $('#platformOutgoing').html(info.totalAmount);
                    $('#platformEntry1').html(info.totalEntryAmount);
                    $('#platformWithdraw').html(info.withdraw);

                    if($('#platformSubstation').size() > 0){
                        $('#platformSubstation').html(info.substation);
                    }
                    if($('#platformFenxiao').size() > 0){
                        $('#platformFenxiao').html(info.fenxiao);
                    }

                    var proportion = [];
                    proportion.push('<span style="width: '+info.proportion.entry+'%;"></span>');
                    proportion.push('<span style="width: '+info.proportion.outgoing+'%;"></span>');
                    $('#platformOutgoingProportion').html(info.proportion.outgoing + '%');
                    $('.entry-obj-1 .entry-scale dd').html(proportion.join(''));
                }
            },
            error: function(){
                $.dialog.tips('网络错误，请稍候重试！', 3, 'error.png');
            }
        });

    }

    //首次默认加载入账数据
    if($('.platform-right').size() > 0){
        getEntryData();
    }


    
    //创始人身份才有更新权限
    if(huoniaoFounder){

        // 版本号
        var checkUpdateRequery = null;
        function checkUpdate(click = false){
            if(checkUpdateRequery != null){
                checkUpdateRequery.abort();
            }
            checkUpdateRequery = $.ajax({
                url: 'index.php',
                data: 'dopost=checkUpdate',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if (data && data.state == 100) {
                        if (huoniaoOfficial) {
                            var d = data.info.split('，');
                            $('.new-version h2 strong').html(d[0].split('：')[1]);
                            $('.new-version').show();
                            $('.current-version').addClass('has-new');
                        }
                    }else{
                        if(huoniaoOfficial && click){
                            $.dialog.tips('已经是最新版本！', 3, 'success.png');
                            $('.new-version').hide();
                            $('.current-version').removeClass('has-new');
                        }
                    }
                }
            });
        }

        //自动检查最新版本
        setTimeout(checkUpdate, 3000);

        //隐藏新版本提醒
        $('.new-version .close-update').click(function () {
            var t = $(this);
            var p = t.parents('.new-version');
            p.hide();
        });

        //检查新版本
        $('.current-version').click(function () {
            checkUpdate(true);
        });

    }


    //开启/关闭提示音
    var adminNoticeSound = parseInt($.cookie("adminNoticeSound"));
    $('.notice-voice, .notify-popup .sound').bind('click', function(){
        var t = $(this);
        if(t.hasClass('off')){
            $('.notice-voice, .notify-popup .sound').removeClass('off').attr("title", "关闭声音");
			$.cookie("adminNoticeSound", 1, {expires: -1});
        }else{
            $('.notice-voice, .notify-popup .sound').addClass('off').attr("title", "开启声音");
			$.cookie("adminNoticeSound", 1, {expires: 365});
        }
    });
    if(adminNoticeSound == 1){
		$('.notice-voice, .notify-popup .sound').addClass("off").attr("title", "开启声音");
	}
    $('.notify-popup .con, .notice-wrap').delegate('a', 'click', function(){
        var url = $(this).attr("href"), name = $(this).attr('data-name');
        var _url = url + (url.indexOf('?') > -1 ? '&' : '?') + "notice=1";
        if(name == '配送员'){
            _url = _url + "&peisongstatus=1";
        }
        if (name == '外卖出餐超时') {
            _url = _url + "&state=3";
        } else if(name == '外卖配送超时') {
            _url = _url + "&state=5";
        }
        else if(name == "商城配送审核"){
            _url = url + "?sCerti=3";
        }
        if(name == '会员注销'){
            _url = _url + "&off=1";
        }
        if(name == '昵称审核'){
            _url = _url + "&nicknameAudit=1";
        }
        if(name == '头像审核'){
            _url = _url + "&photoAudit=1";
        }
        if(name == '更新敏感信息'){
            _url = _url + "&mingan=1";
        }
        if(name == '个人认证'){
            _url = _url + "&personalAuth=1";
        }
        if(name == '公司认证'){
            _url = _url + "&companyAuth=1";
        }
        $(this).attr("href", _url);

        $('.notify-popup').addClass('hide');
        setTimeout(function(){
            $('.notify-popup').removeClass('hide');
        }, 100);
    })


    //待办事项筛选
    $('.notice-filter').bind('click', function(){
        $('.notice-filter-pop').toggle();
        return false;
    });

    var adminNoticeHideZero = parseInt($.cookie("adminNoticeHideZero"));
    var adminNoticeSortby = $.cookie("adminNoticeSortby");
    if(!adminNoticeHideZero){
		$('#hideZero').addClass("curr");
	}else{
		$('#hideZero').removeClass("curr");
    }
    if(adminNoticeSortby == 'type'){
        $('.notice-filter-sortby').removeClass('curr');
        $('.notice-filter-sortby:eq(0)').addClass('curr');
    }
    $('.notice-filter-pop label').bind('click', function(){
        var t = $(this);
        //排序必选一个
        if(t.hasClass('notice-filter-sortby')){
            $('.notice-filter-sortby').removeClass('curr');
            t.addClass('curr');
            $.cookie("adminNoticeSortby", $('.notice-filter-sortby.curr').attr('data-type'), {expires: 365});
        }else{
            $(this).toggleClass('curr');
            $.cookie("adminNoticeHideZero", $('#hideZero').hasClass('curr') ? 0 : 1, {expires: 365});
        }
        getAdminNotice();
    });



    //获取mysqlsize
    $("#getMysqlSize").bind("click", function(){
        var t = $(this);
        t.html("正在获取，请稍候...");
        huoniao.operaJson("index.php", "dopost=getMysqlSize", function(data){
            t.html(data.state == 100 ? data.mysqlSize : "获取失败！");
        })
    });


    var clipboardShare = new ClipboardJS('.copy-btn');
    clipboardShare.on('success', function() {
        $.dialog.tips('已复制', 2,'success.png');
    });

    clipboardShare.on('error', function() {
        $.dialog.tips('复制失败', 3,'error.png');
    });



    //消息通知
    var timer, audio, step = 0, _title = document.title;

    //消息通知音频
    if (window.HTMLAudioElement) {
        audio = new Audio();
        audio.src = "/static/audio/notice01.mp3";
        audio.pause();
    }


    //异步获取通知
    getAdminNotice();

    //每隔10秒再请求一次
    setInterval(function () {
        getAdminNotice();
        opearModuleData.init();
    }, 10000);


    //待办事项分组名
    function getNoticeGroupName(val){
        var ret = '';
        if(val == '1business'){
            ret = '<strong>商家入驻</strong>审核';
        }else if(val == '4comment'){
            ret = '<strong>用户评论</strong>审核';
        }else if(val == '3fabu'){
            ret = '<strong>发布信息</strong>审核';
        }else if(val == '2order'){
            ret = '<strong>平台订单</strong>处理';
        }
        return ret;
    }

    var noticeTotalCount = lastTotalCount = 0;
    function getAdminNotice() {
        $.ajax({
            url: "?dopost=getAdminNotice&show0=" + ($('#hideZero').hasClass('curr') || $('#hideZero').size() <= 0 ? 0 : 1),
            type: "GET",
            dataType: "jsonp",
            success: function (d) {

                //如果有新消息
                var data = d.data;
                var moduleList = [];

                var sortBy = $('.notice-filter-sortby.curr').attr('data-type');  //module模块  type类型

                if (data.length > 0) {

                    //拼接消息通知列表
                    var list = [];
                    noticeTotalCount = 0;
                    for (var i = 0; i < data.length; i++) {

                        if(!list[data[i].group]){
                            list[data[i].group] = [];
                        }

                        list[data[i].group].push(data[i]);

                        noticeTotalCount += Number(data[i].count);

                        if(data[i].count > 0){
                            moduleList.push(data[i].id);
                        }
                    }

                    var noticeHtml = [];
                    if(list['0member'] != undefined && list['0member'].length > 0){
                        noticeHtml.push('<dl class="system"><dd><div class="notice-container"><div class="notice-list">');
                        $.each(list['0member'], function(key, val){
                            noticeHtml.push('<a class="add-page" data-id="'+val['module']+'" title="'+val['name']+'" data-name="'+val['name']+'" href="'+val['url']+'"><strong'+(val['danger'] ? 'class="danger"' : '')+'>'+val['count']+'</strong><span>'+val['name']+'</span></a>');
                        })
                        noticeHtml.push('</div></div></dd></dl>');
                    }

                    //按类型
                    if(sortBy == 'type'){
                        
                        var _list = [];
                        for(var i in list){
                            if(i != 'in_array'){
                                _list.push({
                                    'type': i,
                                    'data': list[i]
                                })
                            }
                        }
                        _list = _list.sort(function(a, b){
                            return a.type.localeCompare(b.type);
                        })

                        for (var i in _list) {
                            if(_list[i].type != '0member' && i != 'in_array'){
                                noticeHtml.push('<dl>');
                                noticeHtml.push('<dt>'+getNoticeGroupName(_list[i].type)+'</dt>');
                                noticeHtml.push('<dd><div class="notice-container"><div class="notice-list">');

                                $.each(_list[i].data, function(k, v){
                                    noticeHtml.push('<a class="add-page" title="'+v['name']+'" data-name="'+v['name']+'" href="'+v['url']+'"><strong'+(v['danger'] ? ' class="danger"' : '')+'>'+v['count']+'</strong><span>'+v['name']+'</span></a>');
                                })
                                                            
                                noticeHtml.push('</div></div></dd></dl>');
                            }
                        }
                    }else{

                        var _noticeHtml = [];

                        for (var i in list) {
                            if(i != '0member'){
                                $.each(list[i], function(k, v){
                                    _noticeHtml.push('<a class="add-page" title="'+v['name']+'" data-name="'+v['name']+'" href="'+v['url']+'"><strong'+(v['danger'] ? ' class="danger"' : '')+'>'+v['count']+'</strong><span>'+v['name']+'</span></a>');
                                })
                            }
                        }

                        if(_noticeHtml.length > 0){
                            noticeHtml.push('<dl>');
                            noticeHtml.push('<dd><div class="notice-container"><div class="notice-list">');
                            noticeHtml.push(_noticeHtml.join(''));
                            noticeHtml.push('</div></div></dd></dl>');
                        }

                    }


                    $(".notice-wrap, .notify-popup .con").html(noticeHtml.join(""));

                    $('.right-side h3 small').html(noticeTotalCount);
                    $('.header-bar .todo i').html(noticeTotalCount);
                    $('.header-bar .todo').show();                    

                } else {
                    
                    $('.right-side h3 small').html('');
                    $('.notice-wrap, .notify-popup .con').html('<div class="notice-empty">全都处理完咯，暂无其他待办事项</div>');
                    $('.header-bar .todo i').html('0');
                    $('.header-bar .todo').show();
                    
                }

                // 需要重复播放提示音的订单模块
                var audio_type = '';
                if (moduleList.length) {
                    if (in_array('orderWarning', moduleList)) {
                        audio_type = 'warning';
                    } else if (in_array('Orderpstimeout', moduleList)) {
                        audio_type = 'waimai_delivery_timeout';
                    } else if (in_array('Ordercctimeout', moduleList)) {
                        audio_type = 'readymeal_timeout';
                    } else if (in_array('waimaiOrderphp', moduleList)) {
                        audio_type = 'waimai';
                    } else if (in_array('paotuiOrderphp', moduleList)) {
                        audio_type = 'paotui';
                    } else if (in_array('shopOrder', moduleList)) {
                        audio_type = 'shop';
                    } else if (in_array('taskReport', moduleList)) {
                        audio_type = 'task_report';
                    }
                }

                //消息提醒
                if (d.hasnew || audio_type != '' || (lastTotalCount > 0 && lastTotalCount < noticeTotalCount)) {

                    audio.src = audio_type != '' ? "/static/audio/notice_" + audio_type + ".mp3" : "/static/audio/notice01.mp3";
                    //标题闪动
                    //标题闪动
                    clearInterval(timer);
                    timer = setInterval(function () {
                        step++;
                        if (step == 3) { step = 1 };
                        if (step == 1) { document.title = '【　　　】-' + _title };
                        if (step == 2) {
                            document.title = '【新消息】-' + _title;
                        };
                    }, 500);

                    //播放音频
                    adminNoticeSound = $.cookie("adminNoticeSound")
                    if (!adminNoticeSound) {
                        audio.play();
                    }

                    $.get("index.php?dopost=clearAdminNotice");
                } else {

                    document.title = _title;
                    clearInterval(timer);

                    //播放音频
                    adminNoticeSound = $.cookie("adminNoticeSound")
                    if (!adminNoticeSound) {
                        audio.pause();
                    }

                }

                lastTotalCount = noticeTotalCount;

            }
        });
    }


    //点击页面空白区域隐藏右键菜单
    $(document).click(function (e) {

		$("#menuNav, .notice-filter-pop").bind("click", function(){
			return false;
		});

        $('.common-collection-function').bind('click', function(e){
            if(!$(e.target).hasClass('add-page')){
                return false;
            }
        });

        //待办事项筛选复位
        $('.notice-filter-pop').hide();

        //设置我的收藏复位
        $('.common-collection-function').removeClass('setting');

        //搜索框复位
        $('.header-nav').removeClass('transparent');
        $('.search-input').removeClass('curr');
        $('.search-popup').hide();

		//关闭菜单
		closeMenu();
	});


    //上次访问页面
    if (gotopage != "") {

        //遍历所有功能菜单
        for(var i in permission_list){
            $.each(permission_list[i], function(key, val){
                $.each(val.data, function(k, v){
                    if(v.url == gotopage){
                        var pageUrlData = v.url.split("/"),
                        pageID = pageUrlData[1].replace(/\./g, "").replace(/\=/g, "").replace(/\?/g, "").replace(/\&/g, "").replace('notice1', '');
                        
                        addPage(pageID, pageUrlData[0], v.name, v.url);
                        return false;
                    }
                })
            })
        };

        $(".h-nav a").each(function () {
            if (gotopage.indexOf($(this).attr("href")) > -1) {
                $(this).click();
                return false;
            }
        });
    }

    // 定时检查数据
    var now = new Date().getTime();
    var opearModuleData = {
        list: [],
        index: 0,
        speed: 0,
        changeIndex: function () {
            this.index = this.index + 2 > this.list.length ? 0 : this.index + 1;
        },
        init: function () {
            var that_ = this;
            if (!that_.list.length) return;
            setTimeout(function () {
                var index = that_.index;
                that_.changeIndex();

                if (that_.list[index].stop == true) {
                    if (that_.index != index) {
                        that_.init();
                    }
                    return;
                }
                var name = that_.list[index]['name'];
                that_[name](index);
            }, 1000)
        },
        articleUpdateVideotime_face: function (index) {
            var that_ = this;
            var page = that_.list[index].page;
            $.ajax({
                url: 'article/articleJson.php',
                type: 'post',
                data: 'action=checkVideotime_face',
                dataType: 'json',
                success: function (data) {
                    if (data && data.length) {
                        that_.list[index].stop = true;

                        $box = $('#articleUpdateVideotime_face');
                        if (!$box.length) {
                            $box = $('<div id="articleUpdateVideotime_face" style="visibility: hidden;"></div>');
                            $('body').append($box);
                        }
                        for (var i = 0; i < data.length; i++) {
                            (function (data, i, obj, idx) {

                                var captureImage = function (videos, scale, aid) {
                                    var scale = scale ? scale : 1;
                                    var canvas = document.createElement("canvas");
                                    canvas.width = videos.videoWidth * scale;
                                    canvas.height = videos.videoHeight * scale;
                                    canvas.getContext('2d').drawImage(videos, 0, 0, canvas.width, canvas.height);
                                    $box.append(canvas);

                                    setTimeout(function () {
                                        var img = document.createElement("img");
                                        var src = canvas.toDataURL("image/png");
                                        img.src = src;
                                        $box.append(img);

                                        var s = new Date().getTime();
                                        $.ajax({
                                            url: '/include/upload.inc.php?mod=article',
                                            type: 'post',
                                            data: {
                                                'type': 'thumb',
                                                'base64': 'base64',
                                                'thumbLargeWidth': canvas.width,
                                                'thumbLargeHeight': canvas.height,
                                                'Filedata': src.split(',')[1],
                                            },
                                            dataType: 'json',
                                            success: function (data) {
                                                if (data && data.state == 'SUCCESS') {
                                                    var e = new Date().getTime();
                                                    that_.speed = Math.round(data.fileSize / (e - s));
                                                    $.post('article/articleJson.php?action=updateVideotime_face', 'type=face&id=' + aid + '&litpic=' + data.url);

                                                    $box.html('');
                                                    obj.list[idx].stop = false;
                                                }
                                            },
                                            error: function () {
                                                console.log('error')

                                                $box.html('');
                                                obj.list[idx].stop = false;
                                            }
                                        })
                                    }, 500);

                                }

                                var d = data[i], url = d.videotype == "0" ? (window.location.origin + '/include/attachment.php?f=' + d.videourl) : d.videourl;
                                var video = document.createElement('video');
                                video.src = url;
                                video.setAttribute('crossorigin', 'anonymous'); // 注意设置图片跨域应该在图片加载之前
                                $box.append(video);

                                video.addEventListener("loadeddata", function (_event) {

                                    if (d.videotime == 0) {
                                        $.post('article/articleJson.php?action=updateVideotime_face', 'type=time&id=' + d.id + '&videotime=' + parseInt(video.duration));
                                    }
                                    if (d.litpic == '') {
                                        setTimeout(function () {
                                            captureImage(video, 1, d.id);
                                            if (i + 1 == data.length) {
                                                // $box.html('');
                                                // obj.list[idx].stop = false;
                                            }
                                        }, 3000);
                                    }

                                });

                                video.addEventListener("error", function (_event) {
                                    console.log('%c新闻信息视频不存在，或者远程附件服务器没有设置允许跨域，无法自动生成视频缩略图。\n若您没有此需求，请忽略此消息。谢谢您的合作。', 'color:#ccc;font-size:12px');
                                })

                            })(data, i, that_, index)
                        }
                    }
                },
                error: function () {
                }
            })
        },
        articleUeditorVideo_face: function (index) {
            var that_ = this;
            var page = that_.list[index].page;
            $.ajax({
                url: 'article/articleJson.php',
                type: 'post',
                data: 'action=checkUeditorVideo_face',
                dataType: 'json',
                success: function (data) {
                    if (data && data.length) {
                        that_.list[index].stop = true;

                        $box = $('#articleUpdateUeditorVideotime_face');
                        if (!$box.length) {
                            $box = $('<div id="articleUpdateUeditorVideotime_face" style="visibility: hidden;"></div>');
                            $('body').append($box);
                        }
                        for (var i = 0; i < data.length; i++) {
                            (function (data, i, obj, idx) {

                                var captureImage = function (videos, scale, path, aid) {
                                    var scale = scale ? scale : 1;
                                    var canvas = document.createElement("canvas");
                                    canvas.width = videos.videoWidth * scale;
                                    canvas.height = videos.videoHeight * scale;
                                    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                                    $box.append(canvas);

                                    var img = document.createElement("img");
                                    var src = canvas.toDataURL("image/png");
                                    img.src = src;
                                    $box.append(img);

                                    var s = new Date().getTime();
                                    $.ajax({
                                        url: '/include/upload.inc.php?mod=article',
                                        type: 'post',
                                        data: {
                                            'type': 'adv',
                                            'base64': 'base64|' + path,
                                            'thumbLargeWidth': canvas.width,
                                            'thumbLargeHeight': canvas.height,
                                            'Filedata': src.split(',')[1],
                                        },
                                        dataType: 'json',
                                        success: function (data) {
                                            if (data && data.state == 'SUCCESS') {
                                                var e = new Date().getTime();
                                                that_.speed = Math.round(data.fileSize / (e - s));
                                                $.post('article/articleJson.php?action=updateVideotime_face', 'type=face&id=' + aid + '&litpic=' + data.url);
                                            }
                                        },
                                        error: function () {
                                            console.log('error')
                                        }
                                    })
                                }

                                var d = data[i], url = d.src, path = d.path.replace('.mp4', '.png');
                                var video = document.createElement('video');
                                video.src = url;
                                video.setAttribute('crossorigin', 'anonymous'); // 注意设置图片跨域应该在图片加载之前
                                $box.append(video);

                                video.addEventListener("loadeddata", function (_event) {

                                    setTimeout(function () {
                                        captureImage(video, 1, path, d.id);
                                        if (i + 1 == data.length) {
                                            $box.html('');
                                            obj.list[idx].stop = false;
                                        }
                                    }, 3000);

                                });

                                video.addEventListener("error", function (_event) {
                                    console.log('%c新闻信息视频不存在，或者远程附件服务器没有设置允许跨域，无法自动生成视频缩略图。\n若您没有此需求，请忽略此消息。谢谢您的合作。', 'color:#ccc;font-size:12px');
                                })

                            })(data, i, that_, index)
                        }
                    }
                },
                error: function () {
                }
            })
        },
        circlecleUpdateVideotime_face: function (index) {
            var that_ = this;
            var page = that_.list[index].page;
            $.ajax({
                url: 'circle/circleJson.php',
                type: 'post',
                data: 'action=checkVideotime_face',
                dataType: 'json',
                success: function (data) {
                    if (data && data.length) {
                        that_.list[index].stop = true;

                        $circlebox = $('#circleUpdateVideotime_face');
                        if (!$circlebox.length) {
                            $circlebox = $('<div id="circleUpdateVideotime_face" style="visibility: hidden;"></div>');
                            $('body').append($circlebox);
                        }

                        for (var i = 0; i < data.length; i++) {

                            (function (data, i, obj, idx) {
                                var captureImage = function (videos, scale, cid) {
                                    var scale = scale ? scale : 1;
                                    var canvas = document.createElement("canvas");
                                    canvas.width = videos.videoWidth * scale;
                                    canvas.height = videos.videoHeight * scale;
                                    canvas.getContext('2d').drawImage(videos, 0, 0, canvas.width, canvas.height);
                                    $circlebox.append(canvas);

                                    setTimeout(function () {
                                        var img = document.createElement("img");
                                        var src = canvas.toDataURL("image/png");
                                        img.src = src;
                                        $circlebox.append(img);
                                        var s = new Date().getTime();
                                        $.ajax({
                                            url: '/include/upload.inc.php?mod=circle',
                                            type: 'post',
                                            data: {
                                                'type': 'thumb',
                                                'base64': 'base64',
                                                'thumbLargeWidth': canvas.width,
                                                'thumbLargeHeight': canvas.height,
                                                'Filedata': src.split(',')[1],
                                            },
                                            dataType: 'json',
                                            success: function (data) {
                                                // console.log(data);
                                                if (data && data.state == 'SUCCESS') {
                                                    var e = new Date().getTime();
                                                    that_.speed = Math.round(data.fileSize / (e - s));
                                                    $.post('circle/circleJson.php?action=updateVideotime_face', 'type=face&id=' + cid + '&litpic=' + data.url);
                                                }

                                                $circlebox.html('');
                                                obj.list[idx].stop = false;
                                            },
                                            error: function () {
                                                console.log('error')

                                                $circlebox.html('');
                                                obj.list[idx].stop = false;
                                            }
                                        })
                                    }, 500);

                                }

                                var d = data[i], url = d.videoadr;
                                var videocircle = document.createElement('video');
                                videocircle.src = url;
                                videocircle.setAttribute('crossorigin', 'anonymous'); // 注意设置图片跨域应该在图片加载之前
                                // videocircle.setAttribute('autoplay', 'autoplay'); // 注意设置图片跨域应该在图片加载之前
                                videocircle.setAttribute('videotime', d.videotime);
                                videocircle.setAttribute('thumbnail', d.thumbnail);
                                videocircle.setAttribute('cid', d.id);
                                videocircle.setAttribute('cid', d.id);
                                $circlebox.append(videocircle);

                                videocircle.addEventListener("loadeddata", function (_event) {

                                    var _this_ = this;
                                    if (!_this_.getAttribute('videotime')) {
                                        $.post('circle/circleJson.php?action=updateVideotime_face', 'type=time&id=' + _this_.getAttribute('cid') + '&videotime=' + parseInt(_this_.getAttribute('duration')));
                                    }
                                    if (_this_.getAttribute('thumbnail') == '') {
                                        setTimeout(function () {
                                            captureImage(_this_, 1, _this_.getAttribute('cid'));
                                            if (i + 1 == data.length) {
                                                // $circlebox.html('');
                                                // obj.list[idx].stop = false;
                                            }
                                        }, 3000);
                                    }

                                });

                                videocircle.addEventListener("error", function (_event) {
                                    console.log('%动态信息视频不存在，或者远程附件服务器没有设置允许跨域，无法自动生成视频缩略图。\n若您没有此需求，请忽略此消息。谢谢您的合作。', 'color:#ccc;font-size:12px');
                                })

                            })(data, i, that_, index)
                        }
                    }
                },
                error: function () {
                }
            })
        },
        circleUeditorVideo_face: function (index) {
            var that_ = this;
            var page = that_.list[index].page;
            $.ajax({
                url: 'circle/circleJson.php',
                type: 'post',
                data: 'action=checkUeditorVideo_face',
                dataType: 'json',
                success: function (data) {
                    if (data && data.length) {
                        that_.list[index].stop = true;

                        $circlebox = $('#circleUpdateUeditorVideotime_face.hide');
                        if (!$circlebox.length) {
                            $circlebox = $('<div id="circleUpdateUeditorVideotime_face" class="hide"></div>');
                            $('body').append($circlebox);
                        }
                        for (var i = 0; i < data.length; i++) {
                            (function (data, i, obj, idx) {

                                var captureImage = function (videos, scale, path, cid) {
                                    var scale = scale ? scale : 1;
                                    var canvas = document.createElement("canvas");
                                    canvas.width = videos.videoWidth * scale;
                                    canvas.height = videos.videoHeight * scale;
                                    canvas.getContext('2d').drawImage(videos, 0, 0, canvas.width, canvas.height);
                                    $circlebox.append(canvas);

                                    var img = document.createElement("img");
                                    var src = canvas.toDataURL("image/png");
                                    img.src = src;
                                    $circlebox.append(img);

                                    var s = new Date().getTime();
                                    $.ajax({
                                        url: '/include/upload.inc.php?mod=circle',
                                        type: 'post',
                                        data: {
                                            'type': 'adv',
                                            'base64': 'base64|' + path,
                                            'thumbLargeWidth': canvas.width,
                                            'thumbLargeHeight': canvas.height,
                                            'Filedata': src.split(',')[1],
                                        },
                                        dataType: 'json',
                                        success: function (data) {
                                            if (data && data.state == 'SUCCESS') {
                                                var e = new Date().getTime();
                                                that_.speed = Math.round(data.fileSize / (e - s));
                                                $.post('circle/circleJson.php?action=updateVideotime_face', 'type=face&id=' + cid + '&litpic=' + data.url);
                                            }
                                        },
                                        error: function () {
                                            console.log('error')
                                        }
                                    })
                                }

                                var d = data[i], url = d.src, path = d.path.replace('.mp4', '.png');
                                var videocircle = document.createElement('video');
                                videocircle.src = url;
                                videocircle.setAttribute('crossorigin', 'anonymous'); // 注意设置图片跨域应该在图片加载之前
                                $circlebox.append(videocircle);

                                videocircle.addEventListener("loadeddata", function (_event) {

                                    setTimeout(function () {
                                        captureImage(videocircle, 1, d.id);
                                        if (i + 1 == data.length) {
                                            $circlebox.html('');
                                            obj.list[idx].stop = false;
                                        }
                                    }, 3000);
                                });

                                videocircle.addEventListener("error", function (_event) {
                                    console.log('%c动态信息视频不存在，或者远程附件服务器没有设置允许跨域，无法自动生成视频缩略图。\n若您没有此需求，请忽略此消息。谢谢您的合作。', 'color:#ccc;font-size:12px');
                                })

                            })(data, i, that_, index)
                        }
                    }
                },
                error: function () {
                }
            })
        },
    }
    function checkModule() {
        if (permission_list.article != undefined) {
            opearModuleData.list.push({ 'name': 'articleUpdateVideotime_face' }); // 新闻模块 获取已发布(本地上传)视频的时长及封面
            opearModuleData.list.push({ 'name': 'articleUeditorVideo_face' }); // 新闻模块 获取已发布(本地上传)视频的时长及封面
        }
        if (permission_list.circle != undefined) {
            opearModuleData.list.push({ 'name': 'circlecleUpdateVideotime_face' }); // 圈子模块 获取已发布(本地上传)视频的时长及封面
            opearModuleData.list.push({ 'name': 'circleUeditorVideo_face' }); // 圈子模块 获取已发布(本地上传)视频的时长及封面
        }
    }
    checkModule();

    //显示页面水印
    if (adminWaterMark == 0) {
        createWaterMark({ content: adminName });
    }

});


//页面导航右键菜单
function rightNavMenu(t) {
    var menu = $("#menuNav");
    if (menu.is(":visible")) {
        menu.hide();
    } else {
        var top = $("header").height() + $(".nav-index").height() - 10 + ($('body').hasClass('inside-page') ? 25 : 0), offset = t.offset(), left = offset.left;

        if (t.hasClass("nav-tools")) {
            left = left - 105;
        }

        //刷新当前页面
        var liRefresh = '';

        var parentLi = [], navLiLength = $(".nav-list li").length, navLiCur = $(".nav-list li.curr").index();
        if (navLiLength == 0) return;

        var liElse = '';

        if (navLiLength > 1 && navLiCur > -1) {

            if($('body').hasClass('inside-page')){
                liRefresh = '<li class="refreshpage"><a href="javascript:;">刷新当前页面</a></li><li role="presentation" class="divider"></li>';
            }
            liElse = '<li class="closeelse"><a href="javascript:;">关闭其它标签</a></li>';

            if (navLiCur != 0) {
                parentLi.push('<li class="closeleft"><a href="javascript:;">关闭左侧标签</a></li>');
            }
            if (navLiCur < navLiLength - 1) {
                parentLi.push('<li class="closeright"><a href="javascript:;">关闭右侧标签</a></li>');
            }
        }

        menu.html(liRefresh + '<li class="closeall"><a href="javascript:;">关闭全部</a></li>' + liElse + parentLi.join(""));

        var mscrollHeight = document.documentElement.clientHeight - top - menu.height() - 25;

        if ($(".nav-list ul").html() != "") {
            menu.append('<li role="presentation" class="divider"></li>');
            menu.append('<div class="menu-scroll"></div>');
            menu.find(".menu-scroll").append($(".nav-list ul").html()
                .replace(/id="(.*?)"/g, "")
                .replace(/<label>/g, "<a href='javascript:;'>")
                .replace(/label/g, "a"));
            menu.find(".menu-scroll").css({ "max-height": mscrollHeight });
        }

        $("<div>")
            .attr("id", "bodyBg")
            .css({ "position": "absolute", "left": "0", "top": "0", "width": "100%", "height": "100%", "background": "#fff", "opacity": "0", "z-index": "1" })
            .appendTo("body");

        menu.find(".menu-scroll").css({ "max-height": (mscrollHeight) });

        menu.css({ "top": top, "left": (left < 0 ? 10 : left) }).show();

        menu.find("li").bind("click", function (e) {
            var c = $(this).attr("class"), index = $(this).index();

            //关闭所有标签
            if (c == "closeall") {
                $(".nav-list ul, .menu-scroll").html("");
                $("#iframe iframe").each(function () {
                    if ($(this).attr("id") != "body-index") {
                        $(this).remove();
                    }
                });
                parentHideTip();

                closeMenu();
                $('.nav-index').hide();
                $('section').removeClass('has-nav-index');

                utils.cleanStorage('nav-pages');

                $('#homepage').click();
                return false;
            };

            //关闭当前选中之外的其它标签
            if (c == "closeelse") {
                var curId = $(".nav-list li.curr").attr("id");
                curId = curId ? curId.replace("nav-", "") : curId;
                $(".nav-list li").each(function () {
                    if (!$(this).hasClass("curr")) {
                        $(this).remove();
                    }
                });

                $("#iframe iframe").each(function () {
                    var attrId = $(this).attr("id").replace("body-", "");
                    if (attrId != curId && attrId != "index") {
                        $(this).remove();
                    }
                });

                closeMenu();
                $('.nav-back, .nav-tools').hide();
                $('#navul').css('margin-left', 0);

                updateLocalStoragePages();

                return false;
            }

            //关闭当前选中的左侧标签
            if (c == "closeleft") {
                var curId = $(".nav-list li.curr").attr("id");
                curId = curId ? curId.replace("nav-", "") : curId;
                var cIndex = $(".nav-list li.curr").index();
                var navArr = [];
                $(".nav-list li").each(function () {
                    var curIndex = $(".nav-list li.curr").index();
                    var i = $(this).index();
                    if (!$(this).hasClass("curr") && i < curIndex) {
                        $(this).remove();
                        if($(this).attr("id")){
                            navArr.push($(this).attr("id").replace("nav-", ""));
                        }
                    }
                });

                $("#iframe iframe").each(function () {
                    var attrId = $(this).attr("id").replace("body-", "");
                    if ($.inArray(attrId, navArr) > -1 && attrId != "index" && attrId != curId) {
                        $(this).remove();
                    }
                });

                closeMenu();
                updateLocalStoragePages();

                return false;
            }

            //关闭当前选中的右侧标签
            if (c == "closeright") {
                var curId = $(".nav-list li.curr").attr("id");
                curId = curId ? curId.replace("nav-", "") : curId;
                var cIndex = $(".nav-list li.curr").index();
                var navArr = [];
                $(".nav-list li").each(function () {
                    var curIndex = $(".nav-list li.curr").index();
                    var i = $(this).index();
                    if (!$(this).hasClass("curr") && i > curIndex) {
                        $(this).remove();
                        if($(this).attr("id")){
                            navArr.push($(this).attr("id").replace("nav-", ""));
                        }
                    }
                });

                $("#iframe iframe").each(function () {
                    var attrId = $(this).attr("id").replace("body-", "");
                    if ($.inArray(attrId, navArr) > -1 && attrId != "index" && attrId != curId) {
                        $(this).remove();
                    }
                });

                closeMenu();
                updateLocalStoragePages();

                return false;
            }

            //刷新当前页面
            if(c == 'refreshpage'){

                reloadPage("body-" + $(".nav-list li.curr").attr("id").replace("nav-", ""));
                $(".nav-list li.curr").addClass('refreshing');

                setTimeout(function(){
                    $(".nav-list li.curr").removeClass('refreshing');
                }, 2000);

                closeMenu();
                return false;

            }

            if (e.target.nodeName.toLowerCase() == "s") {
                $(".nav-list li:eq(" + index + ")").find("s").click();
                $(this).remove();
            } else {
                $(".nav-list li:eq(" + index + ")").click();
            }
        });

        return false;
    }
}


//隐藏全局提示层
function parentHideTip() {
    var notice = parent.$(".w-notice");
    if (notice.length > 0) {
        notice.stop().animate({ top: "-50px", opacity: 0 }, 300, function () {
            notice.remove();
        });
    }
}

//关闭菜单
function closeMenu() {
    $("#menuNav, #bodyBg").hide();
    $("#bodyBg").remove();
}

/*
 * 新增标签
 * id     标签ID
 * type   标签类型/目录名
 * title  标签标题
 * url    标签地址
 * open   是否需要真实打开，值为false时表示只添加标签和iframe，不进行打开操作，用于页面打开恢复历史记录功能
 */
function addPage(id, type, title, href, open = true) {

    if(open){

        if(href.indexOf('siteFabuPages') > -1){
            window.open(href);
            return false;
        }

        //头部导航、侧边导航选中样式
        $('.header-nav .curr, .aside-nav .curr').removeClass('curr');
        $('#' + type).parent().addClass('curr').siblings('li').removeClass('curr');

        //滚动到可视区域
        setTimeout(function(){
            $('#' + type)[0].scrollIntoViewIfNeeded({behavior: "instant", block: "center", inline: "nearest"})
        }, 100);

        var _href = href;
        _href = _href.replace(/\?sCerti\=\d/g, '');
        _href = _href.replace(/\?notice\=\d\&(.*?)\=\d/g, '');
        _href = _href.replace(/\?notice\=\d/g, '');

        //显示二级菜单
        if(permission_list && permission_list[type]){
            var subnav_data = permission_list[type];

            var subnav_html = '';

            $.each(subnav_data, function(key, val){
                subnav_html += '<h3>'+val['name']+'</h3>';
                subnav_html += '<ul>';
                $.each(val['data'], function(key, val){
                    var cla = '',fontWeight = '';
                    if(val['url'] == _href){
                        cla = ' class="curr"';
                    }
                    if(val['url'].indexOf('shopOverview') > -1 ||val['url'].indexOf('jobOverview.php') > -1 ||val['url'].indexOf('jobCompany.php') > -1 ||val['url'].indexOf('jobResume.php') > -1){
                        // fontWeight = 'style="font-weight:bold;"'
                    }
                    subnav_html += '<li'+ cla +' ' + fontWeight +'><a class="add-page" data-id="'+type+'" data-name="'+val['name']+'" href="'+val['url']+'">'+val['name']+'</a></li>';
                });
                subnav_html += '</ul>';
            });

            $('.sub-nav-main').html(subnav_html);

            //滚动到可视区域
            setTimeout(function(){
                if($('.sub-nav-main .curr').length){
                    $('.sub-nav-main .curr')[0].scrollIntoViewIfNeeded({behavior: "instant", block: "center", inline: "nearest"})
                }
            }, 100);

            //如果是第一个菜单，则二级菜单不需要左上角的圆角
            if($('.aside-nav li:eq(0)').hasClass('curr')){
                $('.sub-nav').addClass('no-left-top-radius');
            }else{
                $('.sub-nav').removeClass('no-left-top-radius');
            }

            $('.sub-nav').show();

            //有二级菜单的样式
            $('section').addClass('has-sub-nav');

        }
        //隐藏二级菜单
        else{
            $('.sub-nav-main').html('');
            $('.sub-nav').hide();
            $('section').removeClass('has-sub-nav');
        }

        //增加内页样式
        $('body').addClass('inside-page');
        $('section').addClass('has-nav-index');
        $('.nav-index').show();
    }

    //标题长度限制
    title = title.replace(/\s/g, "");
    var strTitle = title;
    if (title.length > 6) {
        strTitle = title.substr(0, 6) + "..";
    }

    //增加标签
    if ($("#nav-" + id).html() == undefined) {
        //标签导航处增加栏目信息
        var cur = $(".nav-list li.curr").index();
        $(".nav-list li").removeClass("curr");
        if (cur > -1) {
            $(".nav-list li:eq(" + cur + ")").after("<li id='nav-" + id + "' data-type='" + type + "' title=" + title + "><em title=\"刷新当前页面\"></em><label>" + strTitle + "</label><s title=\"点击关闭标签\">&times;</s></li>");
        } else {
            $(".nav-list ul").append("<li id='nav-" + id + "' data-type='" + type + "' title=" + title + "><em title=\"刷新当前页面\"></em><label>" + strTitle + "</label><s title=\"点击关闭标签\">&times;</s></li>");
        }
        if(open){
            if (cur > -1) {
                $(".nav-list li:eq(" + cur + ")").next("li").click();
            } else {
                $(".nav-list ul li:last").click();
            }
        }
    } else {
        if(open){
            $(".nav-list li").removeClass("cur");
            $("#nav-" + id).click();
        }
    }

    if($(".nav-list li").length > 2){
		$(".nav-tools").show();
	}else{
		$(".nav-tools").hide();
	}

    if ($("#body-" + id).html() == undefined) {
        //内容区增加栏目iframe
        $("#iframe iframe").hide();
        if(open){
            $("#iframe").append('<iframe id="body-' + id + '" name="body-' + id + '" frameborder="0" src="' + href + '"></iframe>');
        }else{
            $("#iframe").append('<iframe id="body-' + id + '" name="body-' + id + '" frameborder="0" data-src="' + href + '" style="display: none;"></iframe>');
        }
    } else {
        if(open){
            $("#iframe iframe").hide();
            if($("#body-" + id).attr('src') == undefined){
                $("#body-" + id).attr('src', $("#body-" + id).attr('data-src'));
            }
            $("#body-" + id).show();
        }
    }
    initRightNavMenu();

    //更新本地保存的已经打开的标签
    if(open){
        updateLocalStoragePages();

        //添加到最近使用的菜单
        if(!in_array(href, common_function_urls)){
            common_function_urls.push(href);

            common_function.push({
                'id': type,
                'title': title,
                'url': href
            });
            // common_function = common_function.reverse();
        }
        //如果已经添加到最近使用，则将这个链接排到第后
        else{
            common_function = common_function.filter((x) => x.url !== href);
            common_function.push({
                'id': type,
                'title': title,
                'url': href
            });
            // common_function = common_function.reverse();
        }

        //截取最后8个链接
        common_function_urls = common_function_urls.slice(-8);
        common_function = common_function.slice(-8);

        //更新页面结构
        createCommonFunction(common_function);

        //接口更新
        $.ajax({
            type: "POST",
            url: "?dopost=updateCommonFunction",
            dataType: "json",
            data: "data=" + encodeURIComponent(JSON.stringify(common_function.reverse())),
            success: function () {}
        })
    }
}


//拼接最近使用的菜单
function createCommonFunction(data){
    var liArr = [];
    common_function_urls = [];
    if(data.length > 0){
        data = data.reverse();  //反转，最后使用的显示在前面
        $.each(data, function(key, val){
            liArr.push('<li><a class="add-page" data-id="'+val['id']+'" data-name="'+val['title']+'" href="'+val['url']+'" title="'+val['title']+'">'+val['title']+'</a></li>');
            common_function_urls.push(val.url);
        });

        $('.common-function-list ul').html(liArr.join(''));
    }else{
        $('.common-function-list ul').html('<li>暂无菜单</li>');
    }
}


//更新本地保存的已经打开的标签
//用于页面关闭后，如果没有关闭标签，下次打开后台，将自动恢复标签页
function updateLocalStoragePages(){

    var navdata = [];
    $('.nav-list').find('li').each(function(){
        var t = $(this), _id = t.attr('id').replace('nav-', ''), _type = t.attr('data-type'), _title = t.attr('title'), _curr = t.hasClass('curr') ? 1 : 0, _url = $('#body-' + _id).attr('src') ? $('#body-' + _id).attr('src') : $('#body-' + _id).attr('data-src');
        navdata.push({
            'id': _id,
            'type': _type,
            'title': _title,
            'curr': _curr,
            'url': _url
        });
    });

    utils.setStorage('nav-pages', JSON.stringify(navdata));

}


//重新刷新页面，使用location.reload()有可能导致重新提交
function reloadPage(win) {
    //var location = win.location;
    //location.href = location.pathname + location.search;
    if (typeof win == "object") {
        win = win[0].id;
    }
    document.getElementById(win).contentWindow.location.reload(true);
    // var location = win.attr("src");
    // if(location){
    // 	win.attr("src", win.attr("src"));
    // }
}

//监听F5，只刷新当前页面
function resetEscAndF5(e) {
    e = e ? e : window.event;
    actualCode = e.keyCode ? e.keyCode : e.charCode;
    var id = $(".nav-list .curr").attr("id");

    //首页刷新
    if(id == undefined || !$('body').hasClass('inside-page')){

    }
    //iframe刷新
    else{
        id = id ? id.replace("nav-", "") : id, iframe = "body-" + id;
        //if(actualCode == 116 && iframe[0].contentWindow) {
        //	reloadPage(iframe[0].contentWindow);
        if (actualCode == 116 && iframe) {

            $(".nav-list .curr").addClass('refreshing');
            setTimeout(function(){
                $(".nav-list .curr").removeClass('refreshing');
            }, 2000);

            reloadPage(iframe);
            if (document.all) {
                e.keyCode = 0;
                e.returnValue = false;
            } else {
                e.cancelBubble = true;
                e.preventDefault();
            }
        }
    }
}

function _attachEvent(obj, evt, func, eventobj) {
    eventobj = !eventobj ? obj : eventobj;
    if (obj.addEventListener) {
        obj.addEventListener(evt, func, false);
    } else if (eventobj.attachEvent) {
        obj.attachEvent('on' + evt, func);
    }
}

_attachEvent(document.documentElement, 'keydown', resetEscAndF5);


//上传成功接收
function uploadSuccess(obj, file, filetype) {
    $("#" + obj).val(file);
    $("#" + obj).siblings(".spic").find(".sholder").html('<img src="' + cfg_attachment + file + '" />');
    $("#" + obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
    $("#" + obj).siblings(".spic").show();
    $("#" + obj).siblings("iframe").hide();
}

//删除文件
function reupload(action, t) {
    var t = $(t), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
    var g = {
        mod: action,
        type: "delbrandLogo",
        picpath: input.val(),
        randoms: Math.random()
    };
    $.ajax({
        type: "POST",
        cache: false,
        async: false,
        url: "/include/upload.inc.php",
        dataType: "json",
        data: $.param(g),
        success: function () {
            try {
                input.val("");
                t.prev(".sholder").html('');
                parent.hide();
                iframe.attr("src", src).show();
            } catch (b) { }
        }
    })
};

//判断字符串是否在数组中
function in_array(str, arr) {
    for (var i in arr) {
        if (arr[i] == str) {
            return true;
        }
    }
    return false;
}

//是否移动端
function isMobile() {
    if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
        return true;
    }
}

//当前时间
function getYMD() {
    var myDate = new Date();
    var myYear = myDate.getFullYear(); //获取完整的年份(4位,1970-????)
    var myMonth = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
    var myToday = myDate.getDate(); //获取当前日(1-31)
    myMonth = myMonth > 9 ? myMonth : '0' + myMonth;
    myToday = myToday > 9 ? myToday : '0' + myToday;
    var nowDate = myYear + '-' + myMonth + '-' + myToday;
    return nowDate;
}

//页面水印
var n, i;
function createWaterMark(t) {
    var r, a = t || {},
    s = a.show,
    u = void 0 === s ? 1 : s,
    c = a.container,
    l = void 0 === c ? document.body: c,
    d = a.width,
    f = void 0 === d ? "800px": d,
    p = a.height,
    h = void 0 === p ? "600px": p,
    v = a.textAlign,
    m = void 0 === v ? "center": v,
    b = a.textBaseline,
    y = void 0 === b ? "middle": b,
    g = a.font,
    O = void 0 === g ? "32px PingFang SC,Microsoft YaHei UI,Microsoft YaHei,Roboto,Noto Sans SC,Segoe UI,Helvetica Neue,Helvetica,Arial,sans-serif": g,
    j = a.fillStyle,
    _ = void 0 === j ? "#ddd": j,
    P = a.alpha,
    w = void 0 === P ? .25 : P,
    k = a.content,
    x = a.rotate,
    D = void 0 === x ? "-25": x,
    S = window.MutationObserver || window.WebKitMutationObserver,
    C = document.getElementById("wm"),
    M = document.getElementById("wm-style"),
    E = C || document.createElement("div"),
    N = document.createElement("canvas"),
    T = N.getContext("2d");
    if ((n || n && !u) && (n.disconnect(), n = null), null !== (r = i) && void 0 !== r && r.cancel && (i.cancel(), i = null), k) {
        N.setAttribute("width", f),
        N.setAttribute("height", h),
        T.textAlign = m,
        T.textBaseline = y,
        T.font = O,
        T.globalAlpha = w,
        T.fillStyle = _,
        T.rotate(Math.PI / 180 * D),
        T.fillText(k, 0, parseFloat(h) / 2);

        var timeTxt = N.getContext("2d");
        timeTxt.textAlign = m,
        timeTxt.textBaseline = y,
        timeTxt.font = "26px PingFang SC,Microsoft YaHei UI,Microsoft YaHei,Roboto,Noto Sans SC,Segoe UI,Helvetica Neue,Helvetica,Arial,sans-serif",
        timeTxt.globalAlpha = w,
        timeTxt.fillStyle = _,
        timeTxt.fillText(getYMD(), 0, parseFloat(h) / 2 + 40);

        var I = N.toDataURL();
        E.id = "wm";
        var F = "#wm {display: ".concat(u ? "block": "none", ";position: absolute;z-index: 9999999;top: 0;left: 0;width: 100%;height: 100%;pointer-events: none;background-size: 400px 300px;background-repeat: repeat;background-position: 200px 400px, 0px -40px;background-image: url('").concat(I, "'), url('").concat(I, "')}"),
        W = M || document.createElement("style");
        W.id = "wm-style",
        W.innerHTML = F,
        document.getElementsByTagName("head").item(0).appendChild(W),
        C || (l.style.position = "relative", l.appendChild(E)),
        S && u && (i = (function() {
            var r = document.getElementById("wm"),
            n = document.getElementById("wm-style"); (r && n && n.innerHTML !== F || !r || !n) && createWaterMark(t)
        }), (n = new S(i)).observe(l, {
            attributes: !0,
            childList: !0
        }))
    }
};

//图片预览功能
function open_images_preview(data) {
    var that = this,
        mask = $('<div class="preview_images_mask" tabindex="-1">' +
            '<div class="preview_head">' +
            '<span class="preview_title">' + data.filename + '</span>' +
            '<span class="preview_small hide" title="缩小显示"><span class="glyphicon glyphicon-resize-small" aria-hidden="true"></span></span>' +
            '<span class="preview_full" title="最大化显示"><span class="glyphicon glyphicon-resize-full" aria-hidden="true"></span></span>' +
            '<span class="preview_close" title="关闭图片预览视图"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></span>' +
            '</div>' +
            '<div class="preview_body"><img id="preview_images" src="' + data.path + '" data-index="' + data.images_id + '"></div>' +
            '<div class="preview_toolbar">' +
            '<a href="javascript:;" title="左旋转"><span class="glyphicon glyphicon-repeat reverse-repeat" aria-hidden="true"></span></a>' +
            '<a href="javascript:;" title="右旋转"><span class="glyphicon glyphicon-repeat" aria-hidden="true"></span></a>' +
            '<a href="javascript:;" title="放大视图"><span class="glyphicon glyphicon-zoom-in" aria-hidden="true"></span></a>' +
            '<a href="javascript:;" title="缩小视图"><span class="glyphicon glyphicon-zoom-out" aria-hidden="true"></span></a>' +
            '<a href="javascript:;" title="重置视图"><span class="glyphicon glyphicon-refresh" aria-hidden="true"></span></a>' +
            '<a href="javascript:;" title="图片列表"><span class="glyphicon glyphicon-list" aria-hidden="true"></span></a>' +
            '</div>' +
            '<div class="preview_cut_view">' +
            '<a href="javascript:;" title="上一张"><span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span></a>' +
            '<a href="javascript:;" title="下一张"><span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span></a>' +
            '</div>' +
            '</div>'),
        images_config = { natural_width: 0, natural_height: 0, init_width: 0, init_height: 0, preview_width: 0, preview_height: 0, current_width: 0, current_height: 0, current_left: 0, current_top: 0, rotate: 0, scale: 1, images_mouse: false };
    if ($('.preview_images_mask').length > 0) {
        $('#preview_images').attr('src', data.path);
        return false;
    }
    $('body').css('overflow', 'hidden').append(mask);
    $('body').append('<div class="preview_images_maskbg"></div>');
    parent.$('.preview_images_mask').focus();
    images_config.preview_width = mask[0].clientWidth;
    images_config.preview_height = mask[0].clientHeight;
    // 图片预览
    $('.preview_body img').load(function () {
        var img = $(this)[0];
        if (!$(this).attr('data-index')) $(this).attr('data-index', data.images_id);
        images_config.natural_width = img.naturalWidth;
        images_config.natural_height = img.naturalHeight;
        auto_images_size(false);
    });
    //图片头部拖动
    $('.preview_images_mask .preview_head').on('mousedown', function (e) {
        e = e || window.event; //兼容ie浏览器
        var drag = $(this).parent();
        $('body').addClass('select'); //webkit内核和火狐禁止文字被选中
        $(this).onselectstart = $(this).ondrag = function () { //ie浏览器禁止文字选中
            return false;
        }
        if ($(e.target).hasClass('preview_close')) { //点关闭按钮不能拖拽模态框
            return;
        }
        var diffX = e.clientX - drag.offset().left;
        var diffY = e.clientY - drag.offset().top;
        $(document).on('mousemove', function (e) {
            e = e || window.event; //兼容ie浏览器
            var left = e.clientX - diffX;
            var top = e.clientY - diffY;
            if (left < 0) {
                left = 0;
            } else if (left > window.innerWidth - drag.width()) {
                left = window.innerWidth - drag.width();
            }
            if (top < 0) {
                top = 0;
            } else if (top > window.innerHeight - drag.height()) {
                top = window.innerHeight - drag.height();
            }
            drag.css({
                left: left,
                top: top,
                margin: 0
            });
        }).on('mouseup', function () {
            $(this).unbind('mousemove mouseup');
        });
    });
    //图片拖动
    $('.preview_images_mask #preview_images').on('mousedown', function (e) {
        e = e || window.event;
        $(this).onselectstart = $(this).ondrag = function () {
            return false;
        }
        var images = $(this);
        var preview = $('.preview_images_mask').offset();
        var diffX = e.clientX - preview.left;
        var diffY = e.clientY - preview.top;
        $('.preview_images_mask').on('mousemove', function (e) {
            e = e || window.event
            var offsetX = e.clientX - preview.left - diffX,
                offsetY = e.clientY - preview.top - diffY,
                rotate = Math.abs(images_config.rotate / 90),
                preview_width = (rotate % 2 == 0 ? images_config.preview_width : images_config.preview_height),
                preview_height = (rotate % 2 == 0 ? images_config.preview_height : images_config.preview_width),
                left, top;
            if (images_config.current_width > preview_width) {
                var max_left = preview_width - images_config.current_width;
                left = images_config.current_left + offsetX;
                if (left > 0) {
                    left = 0
                } else if (left < max_left) {
                    left = max_left
                }
                images_config.current_left = left;
            }
            if (images_config.current_height > preview_height) {
                var max_top = preview_height - images_config.current_height;
                top = images_config.current_top + offsetY;
                if (top > 0) {
                    top = 0
                } else if (top < max_top) {
                    top = max_top
                }
                images_config.current_top = top;
            }
            if (images_config.current_height > preview_height && images_config.current_top <= 0) {
                if ((images_config.current_height - preview_height) <= images_config.current_top) {
                    images_config.current_top -= offsetY
                }
            }
            images.css({ 'left': images_config.current_left, 'top': images_config.current_top });
        }).on('mouseup', function () {
            $(this).unbind('mousemove mouseup');
        }).on('dragstart', function () {
            e.preventDefault();
        });
    }).on('dragstart', function () {
        return false;
    });

    var keydownFunc = function (e) {
        e = e ? e : window.event;
        actualCode = e.keyCode ? e.keyCode : e.charCode;

        //ESC
        if (actualCode == 27) {
            $('.preview_close').click();
        }

        //加号，放大图片
        if (actualCode == 107) {
            $('.preview_toolbar a:eq(2)').click();
        }
        //减号，缩小图片
        if (actualCode == 109) {
            $('.preview_toolbar a:eq(3)').click();
        }

        //左，上一张
        if (actualCode == 37) {
            $('.preview_cut_view a:eq(0)').click();
        }
        //右，下一张
        if (actualCode == 39) {
            $('.preview_cut_view a:eq(1)').click();
        }
    };

    //关闭预览图片
    $('.preview_close').click(function (e) {
        $('.preview_images_mask, .preview_images_maskbg').remove();

        document.documentElement.removeEventListener('keydown', keydownFunc, false);
    });
    //图片工具条预览
    $('.preview_toolbar a').click(function () {
        var index = $(this).index(),
            images = $('#preview_images');
        switch (index) {
            case 0: //左旋转,一次旋转90度
            case 1: //右旋转,一次旋转90度
                images_config.rotate = index ? (images_config.rotate + 90) : (images_config.rotate - 90);
                auto_images_size();
                break;
            case 2:
            case 3:
                if (images_config.scale == 3 && index == 2 || images_config.scale == 0.2 && index == 3) {
                    console.log((images_config.scale >= 1 ? '图像放大，已达到最大尺寸。' : '图像缩小，已达到最小尺寸。'));
                    return false;
                }
                images_config.scale = (index == 2 ? Math.round((images_config.scale + 0.4) * 10) : Math.round((images_config.scale - 0.4) * 10)) / 10;
                auto_images_size();
                break;
            case 4:
                var scale_offset = images_config.rotate % 360;
                if (scale_offset >= 180) {
                    images_config.rotate += (360 - scale_offset);
                } else {
                    images_config.rotate -= scale_offset;
                }
                images_config.scale = 1;
                auto_images_size();
                break;
        }
    });
    // 最大最小化图片
    $('.preview_full,.preview_small').click(function () {
        if ($(this).hasClass('preview_full')) {
            $(this).addClass('hide').prev().removeClass('hide');
            images_config.preview_width = window.innerWidth;
            images_config.preview_height = window.innerHeight;
            mask.css({ width: window.innerWidth, height: window.innerHeight, top: 0, left: 0, margin: 0 }).data('type', 'full');
            auto_images_size();
        } else {
            $(this).addClass('hide').next().removeClass('hide');
            $('.preview_images_mask').removeAttr('style');
            images_config.preview_width = 950;
            images_config.preview_height = 750;
            auto_images_size();
        }
    });
    // 上一张，下一张
    $('.preview_cut_view a').click(function () {
        var images_src = '',
            preview_images = $('#preview_images'),
            images_id = parseInt(preview_images.attr('data-index'));
        if (!$(this).index()) {
            images_id = images_id === 0 ? (file_images_list.length - 1) : images_id - 1;
            images_src = file_images_list[images_id];
        } else {
            images_id = (images_id == (file_images_list.length - 1)) ? 0 : (images_id + 1);
            images_src = file_images_list[images_id];
        }
        preview_images.attr('data-index', images_id).attr('src', images_src);
        $('.preview_title').html(get_path_filename(images_src));
    });
    // 自动图片大小
    function auto_images_size(transition) {
        var rotate = Math.abs(images_config.rotate / 90),
            preview_width = (rotate % 2 == 0 ? images_config.preview_width : images_config.preview_height),
            preview_height = (rotate % 2 == 0 ? images_config.preview_height : images_config.preview_width),
            preview_images = $('#preview_images'),
            css_config = {};
        images_config.init_width = images_config.natural_width;
        images_config.init_height = images_config.natural_height;
        if (images_config.init_width > preview_width) {
            images_config.init_width = preview_width;
            images_config.init_height = parseFloat(((preview_width / images_config.natural_width) * images_config.natural_height).toFixed(2));
        }
        if (images_config.init_height > preview_height) {
            images_config.init_width = parseFloat(((preview_height / images_config.natural_height) * images_config.natural_width).toFixed(2));
            images_config.init_height = preview_height;
        }
        images_config.current_width = parseFloat(images_config.init_width * images_config.scale);
        images_config.current_height = parseFloat(images_config.init_height * images_config.scale);
        images_config.current_left = parseFloat(((images_config.preview_width - images_config.current_width) / 2).toFixed(2));
        images_config.current_top = parseFloat(((images_config.preview_height - images_config.current_height) / 2).toFixed(2));
        css_config = {
            'width': images_config.current_width,
            'height': images_config.current_height,
            'top': images_config.current_top,
            'left': images_config.current_left,
            'display': 'inline',
            'transform': 'rotate(' + images_config.rotate + 'deg)',
            'opacity': 1,
            'transition': 'all 100ms',
        }
        if (transition === false) delete css_config.transition;
        preview_images.css(css_config);
    }

    //键盘控制
    _attachEvent(document.documentElement, 'keydown', keydownFunc);
}

function get_path_filename(path) {
    var paths = path.split('/');
    return paths[paths.length - 1];
}

// 引导点击
function btnGuide(id,tip){
    let btn = $('#' +id);
    let offset_left = btn.offset().left;
    let offset_top = btn.offset().left;
    let width = btn.width();
    console.log(offset_left,width,100)
    $('body').append('<div class="guidPop"><div class="btn_show" style="left:'+(offset_left + (width / 2) - 50 + 5)+'px;"><span>'+btn.text()+'</span><div class="popover_guid"> <p>您可以在商店购买所需要的插件，或探索更多功能</p> <a href="javascipr:;" class="close_over" onClick="removeGuide()">好的</a> </div> </div> </div>')
}

function removeGuide(){
    $(".guidPop").remove()
}

function getPreviewInfo(){}

var t = "\u5b98\u65b9\u7f51\u7ad9\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006b\u0075\u006d\u0061\u006e\u0079\u0075\u006e\u002e\u0063\u006f\u006d\n\u6f14\u793a\u7f51\u7ad9\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0069\u0068\u0075\u006f\u006e\u0069\u0061\u006f\u002e\u0063\u006e\u002f\u0073\u007a\n\u4f7f\u7528\u534f\u8bae\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006b\u0075\u006d\u0061\u006e\u0079\u0075\u006e\u002e\u0063\u006f\u006d\u002f\u0074\u0065\u0072\u006d\u0073\u002e\u0068\u0074\u006d\u006c\n\u8ba1\u7b97\u673a\u8f6f\u4ef6\u4fdd\u62a4\u6761\u4f8b\uff1a\u0068\u0074\u0074\u0070\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u0067\u006f\u0076\u002e\u0063\u006e\u002f\u0067\u006f\u006e\u0067\u0062\u0061\u006f\u002f\u0063\u006f\u006e\u0074\u0065\u006e\u0074\u002f\u0032\u0030\u0031\u0033\u002f\u0063\u006f\u006e\u0074\u0065\u006e\u0074\u005f\u0032\u0033\u0033\u0039\u0034\u0037\u0031\u002e\u0068\u0074\u006d\n\u4e2d\u534e\u4eba\u6c11\u5171\u548c\u56fd\u8457\u4f5c\u6743\u6cd5\uff1a\u0068\u0074\u0074\u0070\u0073\u003a\u002f\u002f\u0077\u0077\u0077\u002e\u006e\u0063\u0061\u0063\u002e\u0067\u006f\u0076\u002e\u0063\u006e\u002f\u0063\u0068\u0069\u006e\u0061\u0063\u006f\u0070\u0079\u0072\u0069\u0067\u0068\u0074\u002f\u0063\u006f\u006e\u0074\u0065\u006e\u0074\u0073\u002f\u0031\u0032\u0032\u0033\u0030\u002f\u0033\u0035\u0033\u0037\u0039\u0035\u002e\u0073\u0068\u0074\u006d\u006c";
console.log("\n%c  \u706b\u9e1f\u95e8\u6237\u7cfb\u7edf  %c  \u0043\u006f\u0070\u0079\u0072\u0069\u0067\u0068\u0074\u0020\u00a9\u0020\u0032\u0030\u0031\u0033\u002d%s \u82cf\u5dde\u9177\u66fc\u8f6f\u4ef6\u6280\u672f\u6709\u9650\u516c\u53f8  \n", "color: #fff; background: #f83824; padding:10px 0 8px; font-family: PingFang SC, Microsoft Yahei, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 15px;", "color: #fff; background: #000; padding:8px 0 8px; font-family: PingFang SC, Microsoft Yahei, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 13px;", (new Date).getFullYear());
console.log("%c" + t, "color:#333; font-size:12px; font-family: PingFang SC, Microsoft Yahei, Helvetica, Arial, sans-serif; line-height: 1.8em;");