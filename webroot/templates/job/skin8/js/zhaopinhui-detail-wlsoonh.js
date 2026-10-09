$(function(){
    // 分页内容修改
    $('.pagination li:eq(0) span, .pagination li:eq(0) a').html('<');
    $('.pagination li:last-child span, .pagination li:last-child a').html('>');
    if($('.chc-right .addr').text().length-2>35){
        let str='<em>'+$('.chc-right .addr').text().slice(0,35)
        str+=`...</em><span class="extend">查看</span>`
        $('.chc-right .addr').html(str)
    };
    // 主办单位查看
    $('.chc-right .addr').click(function(){
        $('.browsing-more-background').show();
        $('.browsing-more.detail').show();
    });
    // 关闭主办单位查看
    $('.bm-close').click(function(){
        $('.browsing-more').css({'animation':'bottomFadeOut .3s'});      
        setTimeout(() => {
            $('.browsing-more-background').hide();
            $('.browsing-more').hide();
            $('.browsing-more').css({'animation':'topFadeIn .3s'});  
        }, 280);
    })
    // 打开报名窗口
    let company;
    $('.chc-join,.bottom-signup .company,.jcc-top .title .rukou').click(function(){
        if(!userid){ //未登录
            location.href = `${masterDomain}/login.html`
        }else if(!cid){ //无公司信息
            $('.cregister').show();
        }else{ //获取公司信息
            let data = {
                service: 'job',
                action: 'companyDetail'
            };
            ajax(data).then(res => {
                if (res.state == 100) {
                    company = res.info;
                    if(!company.people&&!company.contact){
                        $('.popwarn').show();
                        return
                    };
                    $('.jfb-plate .content .concat .name').text(' ' + company.people);
                    $('.jfb-plate .content .concat .phone').text(company.contact);
                    $('.jfb-plate .content .jobs span').eq(2).text(`(当前 ${company.post_count} 个)`)
                    $(".joinfairs").show();
                }
            });
        }
    });
    // 关闭报名窗口
    $('.jfb-plate .header img').click(function(){
        $('.jfb-plate').css({'animation':'bottomFadeOut .3s'});      
        setTimeout(() => {
            $('.joinfairs').hide();
            $('.jfb-plate').css({'animation':'topFadeIn .3s'});  
        }, 280);
    });
    $('.pw-con img,.popwarn .confirm').click(function(){ //关闭弹窗
        $('.pw-con').css({'animation':'bottomFadeOut .3s'});      
        setTimeout(() => {
            $('.popwarn').hide();
            $('.pw-con').css({'animation':'topFadeIn .3s'});  
        }, 280);
     });
    // 提交报名
    $('.jfb-plate .content .submit').click(function(){
        if(company.post_count==0){ //没有发布任何职位
            $('.b-failed').show();
            return
        }else if(company.post_count<limit){ //小于招聘会限制，去发布
            $('.b-failed').show();
            let title=`至少上架${limit}条招聘职位信息才可报名`;
            let text=`请先添加招聘职位`;
            $('.bf-con .title').text(title);
            $('.bf-con .text').text(text);
            return
        }else if(company.post_count<limit){ //去管理
            $('.b-failed').show();
            let title=`至少上架${limit}条招聘职位信息才可报名`;
            let text=`请先添加招聘职位`;
            $('.bf-con .title').text(title);
            $('.bf-con .text').text(text);
            $('.bf-con .btn .pub').hide();
            $('.bf-con .btn .manage').show();
            return
        };
        let id=$(this).attr('data-id');
        let data= {
            service: 'job',
            action: 'joinFairs',
            fid:id
        };
        ajax(data).then(res=>{
            if(res.state==100){
                $('.b-success').show(); 
            }else{
                alert(res.info);
            }
        });
    });
    // 关闭报名失败的弹窗
    $('.bf-con .btn .callback,.bf-con .close').click(function(){
        $('.bf-con').css({'animation':'bottomFadeOut .3s'});      
        setTimeout(() => {
            $('.b-failed').hide();
            $('.bf-con').css({'animation':'topFadeIn .3s'});  
        }, 280);
    });
    // 关闭报名成功之后的弹窗
    $('.bs-con .close,.bs-con .btn').click(function(){
        location.reload();
    });
    // 企业注册弹窗关闭
    $('.cgc-close,.cgc-btn').click(function(){
        $('.cg-con').css({'animation':'bottomFadeOut .3s'});      
        setTimeout(() => {
            $('.cregister').hide();
            $('.cg-con').css({'animation':'topFadeIn .3s'});  
        }, 280);
    });
    // 列表数据跳转
    $('.cd-header li').click(function(){ //tab切换滚动
        $(this).addClass('active').siblings().removeClass();
        let index=$(this).index();
        if(index==0){ //回到顶部
            $('html, body').animate({scrollTop: 0}, 200);
        }else{ //滚动到底部
            $('html, body').animate({
                scrollTop: $('.jcc-top .title').offset().top-89
            }, 200);
        }
    });
    $('.jcc-top li').delegate('.job-name','click',function(){ //职位详情跳转情况2
        event.preventDefault();
        let id=$(this).attr('data-id');
        location.href=`${channelDomain}/job-${id}.html`;
    });
    $(window).scroll(function(){
        if($(document).scrollTop()>$('.jcc-top .title').offset().top-89){
            $('.cd-header').css({'border-radius':'0px'});
        }else{
            $('.cd-header').css({'border-radius':'8px 8px 0px 0px'});
        }
    });
    // 列表中职位跳转
    $('.jcc-top li a').delegate('.job-number','click',function(){
        event.preventDefault();
        let href=$(this).closest('a').attr('href');
        open(`${href}&scroll=1`)
    })
    if(location.search.indexOf('scroll=1')!=-1){
        scrollTo(0,$('.jc-company').offset().top - $('.cd-header').height()) 
    }
});
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
};