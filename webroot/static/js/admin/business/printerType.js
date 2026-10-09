$(function(){

    //说明
    $(".explain").bind("click", function(){
        var t = $(this), obj = t.parent().parent();
        $.dialog({
            fixed: true,
            title: '平台说明',
            content: obj.find("div:last").html(),
            width: 800,
            ok: true
        });
    });

    //卸载
    $(".modify").bind("click", function(event){
        var href  = $(this).attr("href"),
            id    = $(this).attr("data-id"),
            title = $(this).attr("data-title");

        try {
            event.preventDefault();
            parent.addPage("printerType"+id, "business", title, "business/"+href);
        } catch(e) {}
    });

    //卸载
    $(".uninstall").bind("click", function(event){
        event.preventDefault();
        var href = $(this).attr("href");
        $.dialog.confirm('您确定要卸载吗？', function(){
            huoniao.operaJson(href, "", function(data){
                if(data.state == 100){
                    huoniao.showTip("success", data.info, "auto");
                    setTimeout(function() {
                        location.reload();
                    }, 800);
                }else{
                    huoniao.showTip("error", data.info, "auto");
                }
            });
        });
    });
});

//保存
function saveOpera(type){
    var first = $("ul.root>li"), json = '[';
    for(var i = 0; i < first.length; i++){
        (function(){
            var html =arguments[0], count = 0, jArray = $(html).find(">ul>li"), id = $(html).find(".tr").attr("data-id");
            json = json + '{"id": "'+id+'"},';
        })(first[i]);
    }
    json = json.substr(0, json.length-1);
    json = json + ']';

    huoniao.operaJson("printerType.php?action=sort", "data="+json, function(data){
        if(data.state == 100){
            huoniao.showTip("success", data.info, "auto");
            if(type == ""){
                window.scroll(0, 0);
                setTimeout(function() {
                    location.reload();
                }, 800);
            }
        }else{
            huoniao.showTip("error", data.info, "auto");
        }
    });
}