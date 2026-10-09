$(function () {
    //是否是好友
    $("#isfriend").delegate("a", "click", function () {
        let id = $(this).attr("data-id");
        let title = $(this).text();
        let parentId = $(this).closest('div').attr('id');
        $(`#${parentId}`).attr("data-id", id);
        $(`#${parentId} button`).html(`${title}<span class="caret"></span>`);
        getList();
    });
    //用户筛选
    $('#userFilter').delegate("a","click",function(){
        let id = $(this).attr("data-id");
        let title = $(this).text();
        let parentId = $(this).closest('div').attr('id');
        $(`#${parentId}`).attr("data-id", id);
        $(`#${parentId} button`).html(`${title}<span class="caret"></span>`);
        let filterType=$('#userFilter').attr('data-id');
        if(filterType==1){ //混合筛选
            $('#userid1').attr('placeholder', '用户ID');
            $('#userid2').hide();
            $('#userid2').val('');
        }else{ //接收者/发起者筛选
            $('#userid1').attr('placeholder', '发起者ID');
            $('#userid2').show();
        }
    })
    //排序
    $('.sort').click(function(){
        $(this).siblings('.sort').find('a').removeClass('curr')
        $(this).find('a').addClass('curr');
        getList();
    })
    //立即搜索
    $("#searchBtn").bind("click", function () {
        getList();
    });
    //分页切换
	$("#pageBtn, #paginationBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();

		if(obj.attr("id") == "paginationBtn"){
            var totalPage = $("#list").attr("data-totalpage");
			obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
            $("#list").attr("data-atpage", id);
		}else{
            obj.find("button").html(title+'<span class="caret"></span>');
			$("#list").attr("data-atpage", 1);
            $('#pageBtn').attr('data-id', id);
		}
		getList();
	});
    //查看详情
    $("#list").on({
        'click':function(res){
            let detailElement=$('#chatDetailBody');
            if(!detailElement.children().length){ //未加载弹窗就加载弹窗
                huoniao.showTip("loading", "加载中，请稍候...");
                $("#chatDetailBody").load(`../templates/member/memberImChatDetail.html?v=${+new Date()}`,res=>{
                    huoniao.hideTip();
                    let fid = $(this).attr('data-fid');
                    let tid = $(this).attr('data-tid');
                    window.setAppData('pageId',{fid:fid, tid:tid});
                });
            }else{
                window.setAppData('chatPop',true);
                let fid = $(this).attr('data-fid');
                let tid = $(this).attr('data-tid');
                let prePageId=window.getAppData('pageId');
                if(fid!=prePageId.fid||tid!=prePageId.tid){ //只要不是跟上次打开的详情一样，就重置页码
                    window.setAppData('currPage',1);
                }
                window.setAppData('pageId',{fid:fid, tid:tid});
            }
        }
    },'.checkDetail');
    //聊天/添加好友时间范围选择
    $("#chatStart, #chatEnd, #addStart, #addEnd").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});
    //初始化列表
    getList();
});
//获取列表
function getList() {
    huoniao.showTip("loading", "正在操作，请稍候...");
    $("#list table, #pageInfo").hide();
    $("#selectBtn a:eq(1)").click();
    $("#loading").html("加载中，请稍候...").show();
    //分页配置
    var pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
        page = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";
    //参数配置
    var data = [`istemp=-1`];
    data.push(`sort=${$('.sort .curr').attr('data-id')}`); // 排序
    data.push(`isfriend=${$('#isfriend').attr('data-id')}`); // 是否是好友
    data.push(`userid1=${$('#userid1').val() || ''}`); // 发起者ID
    data.push(`userid2=${$('#userid2').val() || ''}`); // 接收者ID
    data.push(`chatStart=${$('#chatStart').val() || ''}`); // 聊天开始时间
    data.push(`chatEnd=${$('#chatEnd').val() || ''}`); // 聊天结束时间
    data.push(`addStart=${$('#addStart').val() || ''}`); // 添加好友开始时间
    data.push(`addEnd=${$('#addEnd').val() || ''}`); // 添加好友结束时间
    data.push(`page=${page}`); // 页码
    data.push(`pagestep=${pagestep}`); // 一页大小
    // 获取数据
    huoniao.operaJson("memberImChat.php?dopost=getRecentlyList", data.join("&"), function (val) {
        var obj = $("#list");
        let listStr = '';
        if (val.state == "100") {
            obj.attr("data-totalpage", val.pageInfo.totalPage);
            huoniao.showTip("success", "获取成功！", "auto");
            huoniao.hideTip();
            let list = val.list;
            for (let i = 0; i < list.length; i++) {
                let item = list[i];
                listStr += `
                <tr data-id="${item.id}">
                    <td class="row3"></td>
                    <td class="row20 left userinfo" data-id="${item.fid}">
                        <img onerror="javascript:this.src=\'/static/images/default_user.jpg\';" src="${item.fphoto}" class="litpic" style="width:60px; height:60px;" />
                        <span>
                            ${item.fname}<br />
                            <small>UID：${item.fid}</small>
                        </span>
                    </td>
                    <td class="row20 left userinfo" data-id="${item.tid}">
                        <img onerror="javascript:this.src=\'/static/images/default_user.jpg\';" src="${item.tphoto}" class="litpic" style="width:60px; height:60px;" />
                        <span>
                            ${item.tname}<br />
                            <small>UID：${item.tid}</small>
                        </span>
                    </td>
                    <td class="row10 left">
                        ${item.state == 1 ? '<span class="audit">是</span>' : '<span class="refuse">否</span>'}
                    </td>
                    <td class="row15 left">${item.dateStr || '-'}</td>
                    <td class="row15 left">${item.updatetimeStr || '-'}</td>
                    <td class="row17 left">
                        <span class="checkDetail" data-fid="${item.fid}" data-tid="${item.tid}">查看详情</span>
                    </td>
                </tr>`;
            }
            obj.find("tbody").html(listStr);
            $("#loading").hide();
            $("#list table").show();
            huoniao.showPageInfo();
        } else {
            obj.find("tbody").html("");
            huoniao.showTip("warning", val.info, "auto");
            $("#loading").html(val.info).show();
        }
    });
};