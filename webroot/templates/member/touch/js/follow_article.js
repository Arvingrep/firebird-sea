//点击切换
var page=1,isload=0

$(function(){
    
    getlist();
    //$('.list_left').delegate('li','click',function(){
    //	$(this).addClass('on').siblings('li').removeClass('on');
    //	$('.list_right ul').html('');
    //	page = 1;  //重新加载新的分类
    //	getlist();
    //});
    //$('.list_left li').eq(0).click();

    //滚动加载
    $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w;
    
        if ($(window).scrollTop() >= scroll && !isload) {
            console.log('加载下一页')
            page++;
            getlist();
        }
    });


    //关注
    $('.list_right').delegate('.carebtn','click',function(){
            var userid = $.cookie(cookiePre+"login_user");
            if(userid == null || userid == ""){
                window.location.href = masterDomain+'/login.html';
                return false;
            }

        if($(this).hasClass('caredbtn')){
            $(this).removeClass('caredbtn').html('关注');
        }else{
            $(this).addClass('caredbtn').html('已关注');
        }
        var mediaid = $(this).attr("data-id");
        $.post("/include/ajax.php?service=member&action=followMember&for=media&id="+mediaid);

        return false;

    });

})



function getlist(){
    isload = 1;
	$('.list_right').append('<div class="loading"><img src="'+templets_skin+'images/loading1.gif"></div>')
    var type = $(".list_left li.on").data("id");
	$.ajax({
        url: "/include/ajax.php?service=member&action=follow&type=follow&for=media&id="+uid+"&page="+page+"&pageSize=10",
        type: "GET",
        dataType: "json", //指定服务器返回的数据类型
        crossDomain:true,
        success: function (data) {
         if(data.state == 100 && data.info.list.length > 0){
         	var datalist = data.info.list,
         	totalpage = data.info.pageInfo.totalPage;
         	var html = [];
         	for(var i=0; i<datalist.length; i++){
                var d = datalist[i].meidia;
         		html.push('<li class="media_box"><a href="'+d.url+'">');
         		html.push('<div class="left_head"><img src="'+d.ac_photo+'"></div>')
                // 已关注
                if(d.isfollow == 1){
                    gz = '<span data-id="'+d.id+'" class="carebtn caredbtn">已关注</span>';
                }else if(d.isfollow == 0){
                    gz = '<span data-id="'+d.id+'" class="carebtn">关注</span>';
                }else{
                    gz = '<span data-id="'+d.id+'" class="carebtn disabled">关注</span>';
                }
	         	html.push(gz);
	         	html.push('<div class="right_info"><h2>'+d.ac_name+'</h2><p class="intr">'+d.ac_profile+'</p><p class="count"><span>文章数:<em>'+d.total_article+'</em></span><span>浏览量:<em>'+returnHumanClick(d.click)+'</em></span><span>粉丝:<em>'+returnHumanClick(d.total_fans)+'</em></span></p></div>');
	         	html.push('</a></li>');
         	}

         	$('.loading').remove();
         	$('.list_right ul').append(html.join(''));
            isload = 0;
         	if(page == totalpage){
                isload = 1;
                $('.list_right').append('<div class="loading"><span>已全部加载</span></div>');
             }

         }else{
            $('.loading').remove();
           console.log('hahaha')
            if(page > 1){
                $('.list_right').append('<div class="loading"><span>已全部加载</span></div>');
            }else{
                $('.list_right').append('<div class="loading"><span>暂无数据</span></div>');
            }
         }
        },
        error:function(err){
        	console.log('fail');
        }
     });
}
