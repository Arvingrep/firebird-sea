$(function(){

    var page = 2, pageSize = 5;

    function getZjuser(type, no){
        var no = no == undefined ? 1 : no;
        if(type == 'again'){
            if(no >= 5){
                $('.quanbu').html('没有更多了').addClass('disabled');
                return;
            }else{
                no++;
                page++;
            }
        }
        $.ajax({
            url: masterDomain + '/include/ajax.php?service=house&action=communityZjUser&id='+pageData.id+'&page='+page+'&pageSize='+pageSize,
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                    var list = data.info;
                    var html = [];
                    for(var i = 0; i < list.length; i++){
                        var d = list[i];
                        html.push('<div class="information fn-clear">');
                        html.push('    <div class="im_img"><a href="'+d.url+'"><img src="'+d.photo+'"></a></div>');
                        html.push('    <div class="im_name"><p><span><a href="'+d.url+'">'+d.nickname+'</a></span>'+(d.certify ? '<i class="rz_01"></i>' : '')+(d.flag ? '<i class="rz_02"></i>' : '')+'</p><p>'+d.zjcom+'</p></div>');
                        html.push('    <div class="im_icon">');
                        html.push('        <span class="im_iphone" data-phone="'+d.phone+'"></span>');
                        html.push('    </div>');
                        html.push('</div>');
                    }
                    page++;
                    $('.quanbu').before(html.join(""));
                }else{
                    $('.quanbu').before("<p style='text-align:center; color:#ccc;'>没有更多了</p>");
                    $('.quanbu').hide();
                    // getZjuser('again', no);
                }
            },
            error: function(){

            }
        })
    }

    $('.quanbu').click(function(){
        if($(this).hasClass('disabled')) return;
        getZjuser();
    })





})