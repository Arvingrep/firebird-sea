


$(function(){
    if(!cityid){
        location.href=`${masterDomain}/changecity.html`;
    };
    if($(".advBg div").length == 0){
        $(".advBg").remove()
    }
    $(".postLike li").click(function(){
        var t = $(this);
        if(t.attr('data-set')){
            if(t.hasClass('intention')){ //意向
                // 需判断是否有默认简历
                if(intention_pop.reseumeDetail){
                    intention_pop.previewPop = true;
                }else{
                    //没有设置过默认简历
                    intention_pop.showPostPop = true;
                    intention_pop.callback = function(){
                        changeData()
                    }
                }
    
    
            }else{
                intention_pop.resumeShowPop = true;
    
            }
        }else{
            window.location.href = memberDomain + '/job-resume.html?appFullScreen'
        }



    })

    $('.levelUp li').click(function(){
        var t = $(this);
        var userid = $.cookie(cookiePre + "login_user");
        if (userid == null || userid == "") {
            window.location.href = masterDomain + '/login.html';
            return false;
        } 

        if(t.hasClass('smartRefresh')){ //只能刷新
            intention_pop.refreshPopShow = true;
            $('html').addClass('noscroll')
        }else if(t.hasClass('topResume')){
            intention_pop.toTopPopShow = true;
        }
    });

    $(".idCheckBox .close_btn").click(function(){
        $(this).closest('.idCheckBox').addClass('fn-hide')
    });

    // var nextFreshIntferval = null;
    // checkRunTime(freshNext); //下一次刷新时间
    // function checkRunTime(time){
    //     if(time > 0){
    //         time = Number(time);
    //         let curr = parseInt(new Date().valueOf()/1000);
    //         if(curr > time){
    //             clearInterval(nextFreshIntferval);
    //             $('.onfreshPop .refreshBox,.bgbox .refreshBox').remove(); //没有刷新
    //         }else{
    //             nextFreshIntferval = setInterval(function(){
    //                 const timeOff = time - parseInt(new Date().valueOf()/1000) ;
    //                 const hh = parseInt(timeOff / (60 * 60 ))
    //                 const mm = parseInt(timeOff % (60 * 60 ) / 60)
    //                 const ss = timeOff % (60 * 60 ) % 60;
    //                 $('.onfreshPop .refreshBox em,.bgbox .refreshBox em').text(hh + ':' + mm + ':' + ss)
    //                 if(timeOff <= 0){
    //                     clearInterval(nextFreshIntferval);
    //                 }
    //             },1000)
    //         }
    //     }
    // }

    $(".resume_preview").click(function(e){
        if(!resume_aid){
            showErrAlert('请先创建简历');
            let url = memberDomain +  '/job-resume.html?appFullScreen';
            var isBytemini = device.toLowerCase().includes("toutiaomicroapp");
            setTimeout(() => {
                if(window.wx_miniprogram_judge){
                    wx.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) })
                }else if(isBytemini){
                    tt.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) })
                }else if(window.baidu_miniprogram){
                    swan.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) })
                }else if(window.qq_miniprogram){
                    qq.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) })
                }else{

                    location.href = url;
                }
            }, 1500);
            return false
        }
    })
  



    $('.moduleBox a').click(function(e){
        let t = $(this);
        let url = '';
        if(t.closest('.moduleBox').hasClass('goLink')){
            url = jobResume + '?pageShow=2&appFullScreen'
        }else if(t.closest('.moduleBox').hasClass('goLink2')){
            url = jobResume + '?pageShow=1&appFullScreen'
        }
        if(url){
            // location.href = url
            var popOptions = {
                title: '温馨提示', //'确定删除信息？',  //提示文字
                isShow:true,
                btnCancelColor:'#999',
                confirmHtml: '<p style="color:#666; margin-top:10px;">您还没有完善简历，请完善后再操作~</p>' , 
            }
            confirmPop(popOptions,function(){
                var isBytemini = device.toLowerCase().includes("toutiaomicroapp");
                if(window.wx_miniprogram_judge){
                    wx.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) })
                }else if(isBytemini){
                    tt.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) })
                }else if(window.baidu_miniprogram){
                    swan.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) })
                }else if(window.qq_miniprogram){
                    qq.miniProgram.navigateTo({ url: '/pages/redirect/index?url=' + encodeURIComponent(url) })
                }else{
                    location.href = url;
                }
            });

            return false
        }
    })



    // 置顶时间
    const now = parseInt((new Date()).valueOf() / 1000)
    if(bid_end > 0 && bid_start > 0 && now <= bid_end){ //置顶了
        const curr = parseInt(new Date().valueOf() / 1000);
        if(curr < bid_start){ //置顶时间已过
            $(".totop_pop .refreshBox").remove()
        }else if(curr < bid_end){ //正在置顶中
            let day = Math.ceil((bid_end - curr)/86400)
            $(".totop_pop .refreshBox em").text(day + '天')
        }
    }else{ //没有置顶
        $(".totop_pop .refreshBox").remove()
    }

    function getEndDays(bid_end){
        const timeOff = bid_end - parseInt(new Date().valueOf()/1000);
        if(timeOff <= 0){ //没有置顶
            $(".totop_pop .refreshBox").remove()
        }else{
            const dd = parseInt(timeOff / (60 * 60 * 24));
            $(".totop_pop .refreshBox em").text( dd +'天')
        }
    }
    

    // 刷新简历
    $(".refresh_btn").click(function(){
        let now = parseInt(new Date().valueOf() / 1000)
            if(refreshSmart && freshNext && freshNext > now){
                intention_pop.refreshNow = true;
            }else{
                intention_pop.refreshResume()
            }
            
    })

})