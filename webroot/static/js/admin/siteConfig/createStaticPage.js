$(function(){
	
    //手动生成指定分站首页
    $('.createSiteIndex').click(function(){

        $.dialog({
            fixed: true,
            title: "手动生成指定分站首页",
            content: $("#siteIndexObj").html(),
            width: 400,
            ok: function(){
                var cityid = self.parent.$("#cityid").val();
                if(cityid != ""){
                    location.href = '?action=index&cityid=' + cityid;
                }else{
                    alert("请选择要生成的分站");
                    return false;
                }
            },
            cancel: true
        });

    })
	
    //手动生成指定模块首页
    $('.createModuleIndex').click(function(){

        $.dialog({
            fixed: true,
            title: "手动生成指定模块首页",
            content: $("#moduleIndexObj").html(),
            width: 400,
            ok: function(){
                var moduleid = self.parent.$("#moduleid").val();
                if(moduleid != ""){
                    location.href = '?action=moduleIndex&moduleid=' + moduleid;
                }else{
                    alert("请选择要生成的模块");
                    return false;
                }
            },
            cancel: true
        });

    })
    
    
});