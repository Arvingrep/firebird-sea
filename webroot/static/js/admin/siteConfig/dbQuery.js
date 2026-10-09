$(function(){

	//提交验证
	$("#btnSubmit").bind("click", function(){

		var sqlquery = $("#sqlquery").val();
		if($.trim(sqlquery) == ""){
			$("#sqlquery").focus();
			return false;
		}

		sqlquery = encodeURIComponent(sqlquery);

		huoniao.operaJson("dbQuery.php?action=query", "sqlquery="+sqlquery+"&token="+$("#token").val(), function(data){
			$("#return").html(data.info);
		});
	});

});
