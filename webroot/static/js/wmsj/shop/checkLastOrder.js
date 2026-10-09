$(function(){



	var tobj = $(".navi > .nav > li").eq(3);



	$('body').append('<style>.navi > .nav > li.hover > a {color:#fff;background:#2e3344;}</style>')



	var audio = new Audio();

	audio.src = '/static/audio/notice_waimai.mp3';

	var time = null;

	function getList(){

		$.ajax({

	        url: '/wmsj/index.php?action=checkLastOrder',

	        type: "post",

	        dataType: "json",

	        success: function(res){

	            if(res.state == 100 && res.count > 0){

	                audio.play();

	                clearTimeout(time)

	                time = setInterval(function(){

	                	tobj.toggleClass("hover");

	                },500)

	            }else{

	            	clearTimeout(time);

	            	tobj.removeClass("hover");

	            }

	            setTimeout(function(){

	            	getList();

	            },5000);

	        },

	        error: function(){

	        	getList();

	        }

	    })

	}



	getList();



})
