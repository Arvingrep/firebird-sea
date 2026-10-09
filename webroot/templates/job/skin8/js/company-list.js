$(function(){
    let url=location.search;
    let params = new URLSearchParams(url.slice(1));
    // 输入框输入样式
    $('.topSearch input').bind('input propertychange', function () {
        if ($(this).val()) {
            $('.topSearch').css({
                'border-color': '#4089ff'
            });
        }else{
            $('.topSearch').css({
                'border-color': '#E6E6E6'
            }); 
        }
    });
    $('.topSearch img').click(function(){
        $('.topSearch').submit();
    });
    // 分页内容修改
    $('.pagination li:eq(0) span, .pagination li:eq(0) a').html('<');
    $('.pagination li:last-child span, .pagination li:last-child a').html('>');
    // 分页跳转
    $('.dll-page').find('.btn').click(function(){
        let value=$('.dll-page').find('input').val();
        replaceFn(['page'],[value]);
    });
    $('.dll-page').find('input').keyup(function(){
        if(event.keyCode==13){
            $('.dll-page').find('.btn').click()[0]
        }
    });
    $('.dll-page ul').delegate('li a','click',function(){
        event.preventDefault();
        let index=$(this).attr('href').indexOf('=');
        let page=$(this).attr('href').slice(index+1)
        replaceFn(['page'],[page]);
    })
    // 地区筛选
    $('.c-area ul').delegate('li','click',function(){
        let id=$(this).attr('data-id');
        replaceFn(['addrid'],[id?id:'']);
    });
    // 关注按钮
    $('.dll-right .btn').click(function(){
        event.preventDefault();
        let data={
            service:'member',
            action:'collect',
            module:'job',
            temp:'company',
            id:$(this).attr('data-id'),
        };
        if (userid) { //已登录
            if ($(this).attr('class').indexOf('has') == -1) { //关注
                data.type = 'add';
                ajax(data).then(res => {
                    $(this).addClass('has');
                    $(this).find('span').text('已关注');
                });
            } else { //取关
                data.type = 'del';
                ajax(data).then(res => {
                    $(this).removeClass('has');
                    $(this).find('span').text('关注')
                });
            };
        } else { //未登录
            location.href=`${masterDomain}/login.html`
        }
    });
    // 公司性质筛选
    data = {
        service: 'job',
        action: 'getItem',
        name: 'nature'
    };
    ajax(data).then(res => {
        let id=params.get('gnature');
        let str = `<div>不限性质</div>`;
        for (let i = 0; i < res.info.nature.length; i++) {
            str += `
                    <div data-id=${res.info.nature[i].id} ${id==res.info.nature[i].id?'class="active"':''}>${res.info.nature[i].typename}</div>
                `
            if(id==res.info.nature[i].id){
                $('.cm-filter .exp').find('span').text(res.info.nature[i].typename);
            };
        }
        $('.cm-filter').find('.exp .fItem').html(str);
        // 清除筛选条件的文本
        let num=0;
        if($('.c-area ul .active').index()!=0){
            num++;
        };
        num+=$('.cm-filter .active').length;
        $('.c-more .clear em').text(`(${num})`);
    });
    // 公司规模筛选
    data = {
        service: 'job',
        action: 'getItem',
        name: 'scale'
    };
    ajax(data).then(res => {
        let id=params.get('scale');
        let str = `<div>不限规模</div>`;
        for (let i = 0; i < res.info.scale.length; i++) {
            str += `
                    <div data-id=${res.info.scale[i].id} ${id==res.info.scale[i].id?'class="active"':''}>${res.info.scale[i].typename}</div>
                `
            if(id==res.info.scale[i].id){
                $('.cm-filter .time').find('span').text(res.info.scale[i].typename);
            }
        }
        $('.cm-filter').find('.time .fItem').html(str);
        // 清除筛选条件的文本
        let num=0;
        if($('.c-area ul .active').index()!=0){
            num++;
        };
        num+=$('.cm-filter .active').length;
        $('.c-more .clear em').text(`(${num})`);
    });
    // 更多筛选
    $('.cm-filter .fItem').delegate('div','click',function(){
        let id=$(this).attr('data-id');
        let className=$(this).parents('.item').attr('class');
        if(className.indexOf('edu')!=-1){ //行业筛选
            replaceFn(['industry'],[id]);
        }else if(className.indexOf('exp')!=-1){ //公司性质
            replaceFn(['gnature'],[id]);
        }else{ //公司规模
            replaceFn(['scale'],[id]);
        }
    })
    // 排序
    $('.dl-tab div').click(function(){
        let sort=$(this).attr('data-famous');
        replaceFn(['famous','page'],[sort,1]);
    })
    // 名企热招隐藏
    if(!$('.dr-hot .item')[0]){
        $('.dr-hot').hide();
    };
    // 公司介绍牌的职位点击跳转
    $('.botPart .items').delegate('.item','click',function(){
        let id=$(this).attr('data-id');
        open(`${channelDomain}/job.html?id=${id}`)
    });
})
// href的data参数替换并跳转
// datas是要替换的参数名,val是要替换的值
function replaceFn(datas, value) {

    // 获取当前页面的完整 URL（包括查询字符串）
    const url = new URL(window.location);
        
    // 创建 URLSearchParams 对象并将其初始化为当前 URL 的查询字符串部分
    const params = new URLSearchParams(url.search);
    
    // 删除page参数
    const paramToRemove = 'page';
    
    // 判断该参数是否存在于查询字符串中
    if (params.has(paramToRemove)) {
        // 移除指定的参数
        params.delete(paramToRemove);
    }
    
    // 更新 URL 的查询字符串部分
    url.search = params;

    let arr = url.href.split('?');
    let href = arr[0];
    if (location.search) {
        let data = arr[1].split('&');
        a: for (let i = 0; i < datas.length; i++) {
            for (let j = 0; j < data.length; j++) {
                if (data[j].indexOf(`${datas[i]}=`) != -1) {
                    if (value[i]) {
                        data[j] = `${datas[i]}=${value[i]}`;
                    } else {
                        data[j] = '';
                    }
                    value.splice(i, 1);
                    datas.splice(i, 1);
                    --i; //删除一个元素指标减一
                    continue a;
                }
            }
            if (value[i]) {
                data.push(`${datas[i]}=${value[i]}`);
            }
        }
        location.href = `${href}?${data.filter(item => item).join('&')}`;
    } else {
        let str = ''
        for (let i = 0; i < datas.length; i++) {
            if (value[i]) {
                str += `&${datas[i]}=${value[i]}`
            }
        }
        location.href = `${href}?${str.slice(1)}`;
    }
}
function ajax(data){
    return new Promise(resolve=>{
        $.ajax({
            url: '/include/ajax.php?',
            data: data,
            dataType: 'jsonp',
            timeout: 5000,
            success:(res)=>{
                resolve(res);
            }
        })
    })
}