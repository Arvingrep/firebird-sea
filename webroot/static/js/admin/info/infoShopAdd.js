//实例化编辑器
var ue = UE.getEditor('body');

$(function(){

    huoniao.parentHideTip();

    var thisURL   = window.location.pathname;
    tmpUPage  = thisURL.split( "/" );
    thisUPage = tmpUPage[ tmpUPage.length-1 ];
    thisPath  = thisURL.split(thisUPage)[0];

    var init = {

        //菜单递归分类
        selectTypeList: function(type){
            var typeList = [], title = "选择分类";
            typeList.push('<ul class="dropdown-menu">');
            typeList.push('<li><a href="javascript:;" data-id="0">'+title+'</a></li>');

            var l = typeListArr;

            for(var i = 0; i < l.length; i++){
                (function(){
                    var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
                    if(jArray.length > 0){
                        cl = ' class="dropdown-submenu"';
                    }
                    typeList.push('<li'+cl+'><a href="javascript:;" data-id="'+jsonArray["id"]+'">'+jsonArray["typename"]+'</a>');
                    if(jArray.length > 0){
                        typeList.push('<ul class="dropdown-menu">');
                    }
                    for(var k = 0; k < jArray.length; k++){
                        if(jArray[k]['lower'] != null){
                            arguments.callee(jArray[k]);
                        }else{
                            typeList.push('<li><a href="javascript:;" data-id="'+jArray[k]["id"]+'">'+jArray[k]["typename"]+'</a></li>');
                        }
                    }
                    if(jArray.length > 0){
                        typeList.push('</ul></li>');
                    }else{
                        typeList.push('</li>');
                    }
                })(l[i]);
            }

            typeList.push('</ul>');
            return typeList.join("");
        }

    }

    //填充分类
    $("#typeBtn").append(init.selectTypeList("type"));


    
    //二级菜单点击事件
    $("#typeBtn a").bind("click", function(){
        var id = $(this).attr("data-id"), title = $(this).text();
        $("#stype").val(id);
        $("#typeBtn button").html(title+'<span class="caret"></span>');

        if(id != 0){
            $("#stype").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
        }else{
            $("#stype").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
        }
    });

    //二级菜单点击事件
    gzSelAddrList.delegate("a", "click", function(){
        if($(this).parent().index()==1){
            $("#addrid").val($(this).data('id'));
            getCircle();
        }
    });

    getCircle();

    //获取商圈
    function getCircle(){
        var addrid = $("#addrid").val();
        huoniao.operaJson("infoShopAdd.php?action=getCircle", "addrid="+addrid, function(data){
            if(data && data.length > 0){
                var list = [];
                for(var i = 0; i < data.length; i++){
                    var checked = $.inArray(data[i].id, circle) > -1 ? " checked" : "";
                    list.push('<label><input type="checkbox" name="circle[]" value="'+data[i].id+'"'+checked+' />'+data[i].name+'</label>');
                }
                $("#circleList").html(list.join("&nbsp;&nbsp;&nbsp;&nbsp;"));
            }else{
                $("#circleList").html('<span class="help-inline" style="padding: 5px 0 0;">请先选择区域</span>');
            }
        });
    }

    //选择附近地铁站
    $(".chooseData").bind("click", function(){
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        if($("#addrid").val() == 0 || $("#addrid").val() == ""){
            $.dialog.alert("请先选择所在地区");
            return false;
        }
        var type = $(this).prev("input").attr("id"), input = $(this).prev("input"), valArr = input.val().split(",");
        huoniao.showTip("loading", "数据读取中，请稍候...");
        huoniao.operaJson("../siteConfig/siteSubway.php?dopost=getSubway", "addrids="+addrids.join(","), function(data){
            huoniao.hideTip();
            if(data && data.state == 100){

                var data = data.info;

                var content = [], selected = [];
                content.push('<div class="selectedTags">已选：</div>');
                content.push('<ul class="nav nav-tabs" style="margin-bottom:5px;">');
                for(var i = 0; i < data.length; i++){
                    content.push('<li'+ (i == 0 ? ' class="active"' : "") +'><a href="#tab'+i+'">'+data[i].title+'</a></li>');
                }
                content.push('</ul><div class="tagsList">');
                for(var i = 0; i < data.length; i++){
                    content.push('<div class="tag-list'+(i == 0 ? "" : " hide")+'" id="tab'+i+'">')
                    for(var l = 0; l < data[i].lower.length; l++){
                        var id = data[i].lower[l].id, name = data[i].lower[l].title;
                        if($.inArray(id, valArr) > -1){
                            selected.push('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
                        }
                        content.push('<span'+($.inArray(id, valArr) > -1 ? " class='checked'" : "")+' data-id="'+id+'">'+name+'<a href="javascript:;">+</a></span>');
                    }
                    content.push('</div>');
                }
                content.push('</div>');

                $.dialog({
                    id: "subwayInfo",
                    fixed: false,
                    title: "选择附近地铁站",
                    content: '<div class="selectTags">'+content.join("")+'</div>',
                    width: 1000,
                    okVal: "确定",
                    ok: function(){

                        //确定选择结果
                        var html = parent.$(".selectedTags").html().replace("已选：", ""), ids = [];
                        parent.$(".selectedTags").find("span").each(function(){
                            var id = $(this).attr("data-id");
                            if(id){
                                ids.push(id);
                            }
                        });
                        input.val(ids.join(","));
                        input.prev(".selectedTags").html(html);

                    },
                    cancelVal: "关闭",
                    cancel: true
                });

                var selectedObj = parent.$(".selectedTags");
                //填充已选
                selectedObj.append(selected.join(""));

                //TAB切换
                parent.$('.nav-tabs a').click(function (e) {
                    e.preventDefault();
                    var obj = $(this).attr("href").replace("#", "");
                    if(!$(this).parent().hasClass("active")){
                        $(this).parent().siblings("li").removeClass("active");
                        $(this).parent().addClass("active");

                        $(this).parent().parent().next(".tagsList").find("div").hide();
                        parent.$("#"+obj).show();
                    }
                });

                //选择标签
                parent.$(".tag-list span").click(function(){
                    if(!$(this).hasClass("checked")){
                        var length = selectedObj.find("span").length;
                        if(type == "tags" && length >= tagsLength){
                            alert("交友标签最多可选择 "+tagsLength+" 个，可在模块设置中配置！");
                            return false;
                        }
                        if(type == "grasp" && length >= graspLength){
                            alert("会的技能最多可选择 "+graspLength+" 个，可在模块设置中配置！");
                            return false;
                        }
                        if(type == "learn" && length >= learnLength){
                            alert("想学技能最多可选择 "+learnLength+" 个，可在模块设置中配置！");
                            return false;
                        }

                        var id = $(this).attr("data-id"), name = $(this).text().replace("+", "");
                        $(this).addClass("checked");
                        selectedObj.append('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
                    }
                });

                //取消已选
                selectedObj.delegate("a", "click", function(){
                    var pp = $(this).parent(), id = pp.attr("data-id");

                    parent.$(".tagsList").find("span").each(function(index, element) {
                        if($(this).attr("data-id") == id){
                            $(this).removeClass("checked");
                        }
                    });

                    pp.remove();
                });

            }
        });
    });

    $(".selectedTags").delegate("span a", "click", function(){
        var pp = $(this).parent(), id = pp.attr("data-id"), input = pp.parent().next("input");
        pp.remove();

        var val = input.val().split(",");
        val.splice($.inArray(id,val),1);
        input.val(val.join(","));
    });

    //标注地图
    $("#mark").bind("click", function(){
        $.dialog({
            id: "markDitu",
            title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
            content: 'url:'+adminPath+'../api/map/mark.php?mod=business&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&address="+$("#address").val(),
            width: 800,
            height: 500,
            max: true,
            ok: function(){
                var doc = $(window.parent.frames["markDitu"].document),
                    lng = doc.find("#lng").val(),
                    lat = doc.find("#lat").val(),
                    address = doc.find("#addr").val();
                $("#lnglat").val(lng+","+lat);
                $("#lng").val(lng);
                $("#lat").val(lat);
                if($("#address").val() == ""){
                    $("#address").val(address);
                }
                huoniao.regex($("#address"));
            },
            cancel: true
        });
    });

    //营业时间
    $("#openStart, #openEnd").datetimepicker({format: 'hh:ii', startView: 1, minView: 0, autoclose: true, language: 'ch'});

    //表单验证
    $("#editform").delegate("input,textarea", "focus", function(){
        var tip = $(this).siblings(".input-tips");
        if(tip.html() != undefined){
            tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
        }
    });

    $("#editform").delegate("input,textarea", "blur", function(){
        var obj = $(this);
        huoniao.regex(obj);
    });

    $("#editform").delegate("select", "change", function(){
        if($(this).parent().siblings(".input-tips").html() != undefined){
            if($(this).val() == 0){
                $(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
            }else{
                $(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
            }
        }
    });

    //模糊匹配会员
    $("#company").bind("input", function(){
        $("#uid").val("0");
        var t = $(this), val = t.val(), id = $("#id").val();
        if(val != ""){
            t.addClass("input-loading");
            huoniao.operaJson("infoShopAdd.php?action=checkUser", "key="+val+"&id="+id, function(data){
                t.removeClass("input-loading");
                if(!data) {
                    $("#companyList").html("").hide();
                    return false;
                }
                var list = [];
                for(var i = 0; i < data.length; i++){
                    list.push('<li data-id="'+data[i].id+'" data-company="'+data[i].company+'">'+data[i].company+'</li>');
                }
                if(list.length > 0){
                    var pos = t.position();
                    $("#companyList")
                        .css({"left": pos.left, "top": pos.top + 36, "width": t.width() + 12})
                        .html('<ul>'+list.join("")+'</ul>')
                        .show();
                }else{
                    $("#companyList").html("").hide();
                }
            });

        }else{
            $("#companyList").html("").hide();
        }
    });

    $("#companyList").delegate("li", "click", function(){
        var name = $(this).text(), id = $(this).attr("data-id");
        $("#company").val(name);
        $("#uid").val(id);
        $("#companyList").html("").hide();
        checkGw($("#company"), name, $("#id").val());
        return false;
    });

    $(document).click(function (e) {
        var s = e.target;
        if (!jQuery.contains($("#companyList").get(0), s)) {
            if (jQuery.inArray(s.id, "user") < 0) {
                $("#companyList").hide();
            }
        }
    });

    $("#company").bind("blur", function(){
        var t = $(this), val = t.val(), id = $("#id").val();
        if(val != ""){
            checkGw(t, val, id);
        }else{
            t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>&nbsp;');
        }
    });

    function checkGw(t, val, id){
        var flag = false;
        t.addClass("input-loading");
        huoniao.operaJson("infoShopAdd.php?action=checkUser", "key="+val+"&id="+id, function(data){
            t.removeClass("input-loading");
            if(data == 200){
                t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>此会员已授权管理其它商家，一个会员不可以管理多个商家！');
            }else{
                if(data) {
                    for(var i = 0; i < data.length; i++){
                        if(data[i].company == val){
                            flag = true;
                            $("#uid").val(data[i].id);
                        }
                    }
                }
                if(flag){
                    t.siblings(".input-tips").removeClass().addClass("input-tips input-ok").html('<s></s>如果填写了，则此会员可以管理商家信息');
                }else{
                    t.siblings(".input-tips").removeClass().addClass("input-tips input-error").html('<s></s>请从列表中选择会员');
                }
            }
        });
    }

    //搜索回车提交
    $("#editform input").keyup(function (e) {
        var code;
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#btnSubmit").click();
        }
    });

    //表单提交
    $("#btnSubmit").bind("click", function(event){
        event.preventDefault();
        $('#addrid').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
        var t       = $(this),
            id        = $("#id").val(),
            company   = $("#company"),
            uid       = $("#uid").val(),
            stype     = $("#stype").val(),
            addrid    = $("#addrid").val(),
            address   = $("#address"),
            tel       = $("#tel"),
            openStart = $("#openStart").val(),
            openEnd   = $("#openEnd").val(),
            weight    = $("#weight");

        if(company.val() == "" || uid == 0){
            huoniao.goInput(company);
            return false;
        }

        if(stype == "" || stype == 0){
            huoniao.goTop();
            $("#stype").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
            return false;
        }else{
            $("#stype").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
        }

        if(addrid == "" || addrid == 0){
            huoniao.goTop();
            $("#addrid").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
            return false;
        }else{
            $("#addrid").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
        }

        if(!huoniao.regex(address)){
            huoniao.goTop();
            return false;
        }

        if(tel.val() != ""){
            if(!huoniao.regex(tel)){
                huoniao.goTop();
                return false;
            }
        }

        if(openStart == "" || openEnd == ""){
            $.dialog.alert("请选择营业时间");
            return false;
        }

        if(!huoniao.regex(weight)){
            return false;
        }

        ue.sync();

        t.attr("disabled", true);

        //异步提交
        huoniao.operaJson("infoShopAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
            if(data.state == 100){
                if($("#dopost").val() == "save"){

                    huoniao.parentTip("success", "添加成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
                    huoniao.goTop();
                    window.location.reload();

                }else{

                    huoniao.parentTip("success", "修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
                    t.attr("disabled", false);

                }
            }else{
                $.dialog.alert(data.info);
                t.attr("disabled", false);
            };
        });
    });

    //视频预览
    $("#videoPreview").delegate("a", "click", function(event){
        event.preventDefault();
        var href = $(this).attr("href"),
            id   = $(this).attr("data-id");

        window.open(href+id, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
    });

    //删除文件
    $(".spic .reupload").bind("click", function(){
        var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
        delFile(input.val(), false, function(){
            input.val("");
            t.prev(".sholder").html('');
            parent.hide();
            iframe.attr("src", src).show();
        });
    });

});
//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
    $("#"+obj).val(file);
    $("#"+obj).siblings(".spic").find(".sholder").html('<a href="/include/videoPreview.php?f=" data-id="'+file+'">预览视频</a>');
    $("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
    $("#"+obj).siblings(".spic").show();
    $("#"+obj).siblings("iframe").hide();
}
//删除已上传的文件
function delFile(b, d, c) {
    var g = {
        mod: "info",
        type: "delVideo",
        picpath: b,
        randoms: Math.random()
    };
    $.ajax({
        type: "POST",
        cache: false,
        async: d,
        url: "/include/upload.inc.php",
        dataType: "json",
        data: $.param(g),
        success: function(a) {
            try {
                c(a)
            } catch(b) {}
        }
    })
}
