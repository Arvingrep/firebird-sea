$(function(){
    var page = 1;
    var isload = false;
    var showAlertErrTimer  = null;
    // getList()
    // 获取列表
    
    // function getList(){
    //     if(isload) return false;
    //     isload = true;
    //     $.ajax({
	// 		url: '/include/ajax.php?service=job&action='+ (type ? "qzList" : "pgList") +'&page='+page+'&pageSize=20&u=1',
	// 		type: "GET",
	// 		async: false,
	// 		dataType: "jsonp",
	// 		success: function (data) {
	// 			if(data.state === 100){
    //                 var list = data.info.list;
    //                 var html = []
    //                 for(var i = 0; i < list.length; i++){
    //                     if(!type){
    //                         html.push('<li> <a href="'+ channelDomain + 'general-detailzg.html?id='+ list[i].id +'">')
    //                         html.push('<div class="left">')
    //                         html.push('<div class="title">{#$listdata.title#}</div>')
    //                         html.push('<div class="salary"><span>{#$listdata.min_salary#}-{#$listdata.max_salary#}</span>元/月</div>')
    //                         html.push('<div class="label">')
    //                         html.push('{#if $listdata.education_name#}<div class="active">{#$listdata.education_name#}</div>{#/if#}')
    //                         html.push('{#if $listdata.experience_name#}<div class="active">{#$listdata.experience_name#}经验</div>{#/if#}')
                            
    //                         if(list[i].welfare_name.length > 0)
    //                             for(var m = 0; m < list[i].welfare_name; m++){
    //                                 html.push('<div>{#$item#}</div>')
    //                             }
    //                         else{

    //                             html.push('<span>{#$listdata.description#}</span>')
    //                         }
                                
    //                         html.push('</div>')
    //                         html.push('</div>')
    //                         html.push('<div class="right">
    //                         html.push('<div class="details">
    //                         html.push('<div class="name">
    //                         html.push('<img src="{#$listdata.photo#}" onerror="this.src='/static/images/404.jpg'">
    //                         html.push(' <span>{#$listdata.nickname#}</span>
    //                         html.push('</div>
    //                         html.push('<div class="time">{#$listdata.pubdate|date_format:"%Y-%m-%d"#}<span> | </span>{#$listdata.addrName[count($listdata.addrName)-1]#}</div>
    //                         html.push('</div>
    //                         html.push('<div class="phone privatePhoneBtn {#if $listdata.payPhoneState==0#}payPhoneBtn{#/if#}" data-module="job" data-temp="zg" data-id="{#$listdata.id#}" data-url="{#$listdata.url#}">查看电话</div>
    //                         html.push('</div> </a> </li>')
    //                     }
    //                 }
    //             }
	// 		},
	// 		error: function(){
	// 			// alert("登录失败！");
	// 			return false;
	// 		}
	// 	});
    // }

    // 跳转页面
    $(".dll-page .btn").click(function(){
        var page = $('.dll-page input').val();
        let arr = location.href.split('?');
        let href = arr[0];
        if(location.search){
            let data = arr[1].split('&');
            for(var i = 0; i <data.length; i++){
                if(data[i].indexOf('page=') > -1){
                    data.splice(i,1);
                    break;
                }
            }
            data.push('page=' + page)
            window.location.href = href + '?' + data.join('&')
        }
    })

    $('.tcr-search .inputs input').on({
        'focus':function(){
            $('.tcr-search .inputs').css({
                'background-color':'#323999'
            })
        },
        'blur':function(){
            $('.tcr-search .inputs').css({
                'background-color':'transparent'
            })
        }
    })

    // 删除
    $(".btn_groups a.del_btn").click(function(e){
        var t = $(this)
        t.find('.delConfirm').show();

        $(document).one('click',function(){
            t.find('.delConfirm').hide();
            return false;
        })
        return false;    
    })

    // 确认删除

    $(".delConfirm .sure_btn").click(function(){
        var id = $(this).attr('data-id');
        confirmDelInfo(id)
    })

    function confirmDelInfo(id){
        var opttype = type === 0 ? 'delPg' : 'delQz';
        $.ajax({
            url: '/include/ajax.php?service=job&action='+ opttype +'&id=' + id, 
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data.state == 100){
                    showErrAlert('删除成功');
                    $('.delConfirm').hide();
                    return
                    setTimeout(() => {
                        location.reload()
                    }, 1500);
                }else{
                    showErrAlert(data.info);
                }
            },
        })
    }

     // 显示黑框提示
    function showErrAlert(data){
        showAlertErrTimer && clearTimeout(showAlertErrTimer);
        $(".popErrAlert").remove();
        $("body").append('<div class="popErrAlert"><p>' + data + '</p></div>');
    
        $(".popErrAlert").css({
            "visibility": "visible"
        });
        showAlertErrTimer = setTimeout(function () {
            $(".popErrAlert").fadeOut(300, function () {
                $(this).remove();
            });
        }, 1500);
    }

})