$(function () {
	
	// 领取券
	$('.toget').click(function(){
		var t = $(this);
		if(t.hasClass("click")) return false;

		var userid = $.cookie("HN_login_user");
	    if(userid == null || userid == ""){
	      window.location.href = masterDomain+'/login.html';
	      return false;
	    }
	    t.text('领取中').addClass('click')
	    $.ajax({
	      url: "/include/ajax.php?service=shop&action=getQuan&qid="+quanid,
	      type:'POST',
	      dataType: "json",
	      success:function (data) {
	        if(data.state ==100){
	          t.text('立即领取').removeClass("click")
	          showErrAlert(data.info);
	        }else{
	          showErrAlert(data.info)
	        }
	      },
	      error:function () {

	      }
	    });
	})



})