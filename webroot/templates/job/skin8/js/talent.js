$(function(){
    if(cid){
        $('.warnpop').show();
        $('.p-href').show();
        setTimeout(() => {
            location.href=`${masterDomain}/supplier/job/personList.html`;
        }, 2000);
        return
    };
    // 分页跳转
    $('.dll-page').find('input').keyup(function(){
        if(event.keyCode==13){
            $('.dll-page').find('.btn').click()[0]
        }
    });
    if(!pageInfo){ //如果总页数不为空
        $('.t-right').hide();
    };
    if($('.inner li').eq(-2).text()==$('.tr-page span').text()){
        $('.tr-next').addClass('none')
    };
    // 回车搜索
    $('.s-right img').click(function(){
        $('.s-right').submit()
    });
    // 筛选
    $('.d-filter ul').delegate('li','click',function(){
        let className=$(this).parents()[1].className;
        if(className=='dfs-left'){
            className=$(this).parents()[2].className;
        }
        switch(className){
            case 'df-area':{ //学历
                let id=$(this).attr('data-id');
                replaceFn(['education'],[id]);
                break;
            };
            case 'df-welfare':{ //经验
                let id=$(this).attr('data-id');
                replaceFn(['work_jy'],[id]);
                break;
            };
            case 'df-age':{ //年龄
                let min=$(this).attr('data-min');
                let max=$(this).attr('data-max');
                replaceFn(['min_age','max_age'],[min,max])
                break;
            };
            case 'df-salary':{ //薪资
                let min=$(this).attr('data-min');
                let max=$(this).attr('data-max');
                replaceFn(['min_salary','max_salary'],[min,max])
                break;
            };
            case 'df-time':{ //到岗时间
                let id=$(this).attr('data-id');
                replaceFn(['startWork'],[id]);
                break;
            };
            default:break;
        }
    });
    // 年龄自定义筛选
    $('.df-age .btn').click(function(){
        let min=$('.df-age .minSalary').val();
        let max=$('.df-age .maxSalary').val();
        replaceFn(['min_age','max_age'],[min,max]);
    });
    // 薪资自定义筛选
    $('.df-salary .btn').click(function(){
        let min=$('.df-salary .minSalary').val();
        let max=$('.df-salary .maxSalary').val();
        replaceFn(['min_salary','max_salary'],[min,max]);
    });
    $('.dfs-right .inputs input').keyup(function(){
        if(event.keyCode==13){
            if($(this).parents('.df-age')[0]){
                $('.df-age .btn').click()[0]
            }else{
                $('.df-salary .btn').click()[0]
            }
        }
    });
    $('.minSalary,.maxSalary').on({
        'focus':function(){
            $(this).closest('.inputs').css({'border-color':'#409EFF'});
        },
        'blur':function(){
            $(this).closest('.inputs').css('border-color','');
        }
    });
    // 排序
    $('.tl-tab div').click(function(){
        let order=$(this).attr('data-order');
        replaceFn(['order'],[order])
    });
    //选择职位
    $('.df-job div,.tl-filter div,.rr-exp .text div,.dll-page ul li,.dll-page .btn,.tr-next').click(function(){
        event.preventDefault();
        event.stopPropagation();
        if(!userid){ //未登录
            location.href=`${masterDomain}/login.html`;
        }else if(!cid){ //不是企业弹出弹窗
            $('.warnpop').show();
            $('.p-con').show();
        }else{ //已注册企业，跳走
            $('.warnpop').show();
            $('.p-href').show();
            setTimeout(() => {
                location.href=`${masterDomain}/supplier/job/personList.html`;
            }, 2000);
        }
    });
    // 关闭弹窗提示
    $('.p-con img').click(function(){
        $('.p-con').css({'animation':'bottomFadeOut .3s'});      
        setTimeout(() => {
            $('.warnpop').hide();
            $('.p-con').hide();
            $('.p-con').css({'animation':'topFadeIn .3s'});  
        }, 280);
    });
})
// href的data参数替换并跳转(支持多个参数替换跳转)
// datas是要替换的参数名,val是要替换的值（均为数组且参数要与值对应）
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