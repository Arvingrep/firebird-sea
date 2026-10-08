//jQuery Cookie
jQuery.cookie=function(name,value,options){if(typeof value!='undefined'){options=options||{};if(value===null){value='';options.expires=-1}var expires='';if(options.expires&&(typeof options.expires=='number'||options.expires.toUTCString)){var date;if(typeof options.expires=='number'){date=new Date();date.setTime(date.getTime()+(options.expires*24*60*60*1000))}else{date=options.expires}expires='; expires='+date.toUTCString()}var path=options.path?'; path='+options.path:'';var domain=options.domain?'; domain='+options.domain:'';var secure=options.secure?'; secure':'';document.cookie=[name,'=',encodeURIComponent(value),expires,path,domain,secure].join('')}else{var cookieValue=null;if(document.cookie&&document.cookie!=''){var cookies=document.cookie.split(';');for(var i=0;i<cookies.length;i++){var cookie=jQuery.trim(cookies[i]);if(cookie.substring(0,name.length+1)==(name+'=')){cookieValue=decodeURIComponent(cookie.substring(name.length+1));break}}}return cookieValue}};

$(function(){
  resize(), $(window).resize(function(){resize();}), setTimeout(function(){$(".wrap").show();$("#uname").focus();}, 100);
  function resize(){var wh = $(window).height(); $(".wrap").css({"margin-top": (wh-600)/2 - 30});}
  $("html input").placeholder();

  var myalert = {
  	time: 0,
  	msg: function(str,fun){
  		$('.alert_wrap').remove();
  		clearTimeout(this.time);
  		$('body').append('<div class="alert_wrap" style="position:fixed;top:50%;left:50%;margin-left:-35px;padding:3px 10px;background-color:#f00;border-radius:3px;color:#ff0;font-size:14px;max-width:90%;z-index:100;"><p style="white-space:nowrap;">' + str + '</p></div>');
  		this.time = setTimeout(function(){
  			$('.alert_wrap').fadeOut(100, function(){
  				if(fun && typeof fun === 'function') {
  					fun();
  				}
  			});
  		},3000)
  	}
  }

  //登录表单聚焦
  $(".login dl").click(function(){
    $(this).find("input").focus();
  });
  $(".login input").focus(function(){
    $(this).closest("dl").addClass("focus");
  });
  $(".login input").blur(function(){
    $(this).closest("dl").removeClass("focus");
  });

  //删除用户名
  $(".uname dd s").click(function(){
    $("#uname, #upawd").val('');
  });

  //显示密码
  $('#upawd').togglePassword({
    el: '#togglePassword',
    at: 'show',
    sh: '显示密码',
    hd: '隐藏密码'
  });

  //提交登录
  $(".login").submit(function(e){
    e.preventDefault();

    if(https){
        alert("请使用http协议访问安装程序！\r\n关闭宝塔、CDN或者其他强制跳转到https的功能！\r\n\r\n关闭后如果还会自动跳转到https地址，可以尝试清除浏览器缓存，或者换个浏览器安装！");
        return false;
    }

	if(userIni){
        alert("请删除网站根目录的.user.ini文件，或者在宝塔面板中修改站点，网站目录中，不勾选 【防跨站攻击(open_basedir)】！");
		return false;
    }

    var btn = $("#login"), uname = $.trim($("#uname").val()), upawd = $.trim($("#upawd").val());
    if(btn.attr("disabled")) return false;
    if(uname == ""){
      errmsg($(".uname"), "请输入用户名/手机/邮箱");
      $("#uname").focus();
      return false;
    }
    if(upawd == ""){
      errmsg($(".upawd"), "请输入登录密码");
      $("#upawd").focus();
      return false;
    }

    btn.attr("disabled", true).val("验证中...");
    $.ajax({
      type: "POST",
      url: "?step=1",
      data: {"uname": uname, "upawd": upawd},
      dataType: "json",
      success: function(data){
        btn.attr("disabled", false).val("用户登录验证");
        if(data && data.state == 100){
          step(2);
        }else{
          errmsg($(".uname"), data.info);
        }
      },
      error: function(msg){
        btn.attr("disabled", false).val("用户登录验证");
        myalert.msg("网络错误，验证失败！");
      }
    });

  });


  //同意协议
  $(".container").delegate(".step.s2 .go-btn", "click", function(){
    step(3);
  });


  //确认服务器环境
  $(".container").delegate(".step.s3 .go-btn", "click", function(){
    step(4);
  });


  //重新获取模块
  $(".container").delegate("#reloadModule", "click", function(){
    $(".step.s4 .modules").html('<li class="load">获取中...</li>');
    step(4, "reload");
  });

  //全选
  $(".container").delegate("#selectAll", "click", function(){
    if($(this).text() == "全选"){
      $(".step.s4 .modules li").addClass("curr");
      $(this).html("反选");
    }else{
      $(".step.s4 .modules li").removeClass("curr");
      $(this).html("全选");
    }
  });


  //选择要安装的模块
  $(".container").delegate(".modules li", "click", function(){
    $(this).toggleClass("curr");
  });


  //确认网站配置
  var adminuser_ = adminpwd_ = "";
  $(".container").delegate(".step.s4 .go-btn", "click", function(){
    var t = $(this);
    if(t.hasClass("disabled")) return false;
    var data = [];

    //验证要安装的模块
    var modules = [], moduleNames = [];
    $(".modules li").each(function(){
      if(!$(this).hasClass("load") && $(this).hasClass("curr") && $(this).attr("data-val") != undefined){
        modules.push($(this).attr("data-val"));
        moduleNames.push($(this).text());
      }
    });
    if(modules.length <= 0){
      errmsg($(".modules"), "请选择要安装的模块！");
      return false;
    }
    data.push("module="+modules.join(","));
    data.push("moduleNames="+moduleNames.join(","));

    //验证数据库配置
    var dbhost = $("#dbhost"), dbname = $("#dbname"), dbuser = $("#dbuser"), dbpwd = $("#dbpwd"), dbprefix = $("#dbprefix");
    if($.trim(dbhost.val()) == ""){
      errmsg(dbhost, "请输入主机地址！");
      dbhost.focus();
      return false;
    }
    if($.trim(dbname.val()) == ""){
      errmsg(dbname, "请输入数据库名称！");
      dbname.focus();
      return false;
    }
    if($.trim(dbuser.val()) == ""){
      errmsg(dbuser, "请输入数据库用户！");
      dbuser.focus();
      return false;
    }
    if($.trim(dbpwd.val()) == ""){
      errmsg(dbpwd, "请输入数据库密码！");
      dbpwd.focus();
      return false;
    }
    if($.trim(dbprefix.val()) == ""){
      errmsg(dbprefix, "请输入数据表前缀！");
      dbprefix.focus();
      return false;
    }

    data.push("dbhost="+dbhost.val());
    data.push("dbname="+dbname.val());
    data.push("dbuser="+dbuser.val());
    data.push("dbpwd="+dbpwd.val());
    data.push("dbprefix="+dbprefix.val());

    //验证管理员信息
    var adminuser = $("#adminuser"), adminpwd = $("#adminpwd");
    if($.trim(adminuser.val()) == ""){
      errmsg(adminuser, "请输入管理帐户！");
      adminuser.focus();
      return false;
    }
    if($.trim(adminpwd.val()) == ""){
      errmsg(adminpwd, "请输入管理密码！");
      adminpwd.focus();
      return false;
    }

    data.push("adminuser="+adminuser.val());
    data.push("adminpwd="+adminpwd.val());

    adminuser_ = adminuser.val();
    adminpwd_  = adminpwd.val();

    $(this).addClass("disabled").html("load..");

    $.ajax({
      type: "POST",
      url: "?step=2",
      data: data.join("&"),
      dataType: "json",
      success: function(data){
        if(data && data.state == 100){
          step(5);

        }else{
          t.removeClass("disabled").html("继续");
          myalert.msg(data.info);
        }
      },
      error: function(msg){
        t.removeClass("disabled").html("继续");
        myalert.msg("网络错误，请稍候重试！");
      }
    });
  });

  var isConfig = false;

  //执行指定步骤
  function step(step, next){
    $("#errmsg").remove();

    if(next != 'reload'){
      $(".sidebar").removeClass().addClass("sidebar step"+step);
      $(".container .s"+(step-1)).addClass("scale");
      if(window.applicationCache){
        $(".container .s"+(step-1)).fadeOut(500, function(){
          $(".container .s"+(step-1)).remove();
        });
      }else{
        $(".container .s"+(step-1)).remove();
      }
      $(".container").append($("#step"+step).html());
      $(".container .s"+step).fadeIn(100, function(){
        $(".container .s"+step).addClass("unscale");
      });
    }

    //协议
    if(step == 2){
      $(".protocol .content").mCustomScrollbar({theme:"minimal-dark", scrollInertia:300});
    }

    //加载已购买的模块
    if(step == 4){
      $.ajax({
        type: "POST",
        url: "?step=2",
        dataType: "json",
        success: function(data){
          if(data && data.state == 100){
            var info = data.info, list = [];
            for(var i = 0; i < info.length; i++){
              list.push('<li data-val="'+info[i].name+'"><s></s>'+info[i].title+'</li>');
            }
            $(".modules").html(list.join(""));
          }else{
            $(".modules .load").html("<font color='#ff0000'>"+data.info+"</font>&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:;' id='reloadModule'>重新获取</a>");
          }
        },
        error: function(msg){
          $(".modules .load").html("<font color='#ff0000'>网络错误，请稍候重试！</font>&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:;' id='reloadModule'>重新获取</a>");
        }
      });
    }

    //远程下载、安装
    if(step == 5){
      $(".step.s5 .process").mCustomScrollbar({theme:"minimal-dark", scrollInertia:300});
      downAndinstall();
    }

    //安装成功，执行删除安装包操作
    if(step == 6){

      //填充用户名、密码
      $("#adminuser").html(adminuser_);
      $("#adminpwd").html(adminpwd_);

      $.ajax({
        type: "GET",
        url: "?step=7",
        dataType: "json",
        success: function(data){
          if(data && data.state == 200){
            myalert.msg(data.info);
          }
        }
      });
    }

  }

  //远程下载、安装
  var progress = 0;

  //重试
  $(".container").delegate(".retry", "click", function(){
    var t = $(this);
    t.closest("dl").removeClass("err").find("dd").html('<i></i>正在重试<s></s>');
    t.remove();
    downAndinstall();
  });

  function downAndinstall(){

    //判断是否已经配置默认文件
    if(!isConfig){

      $(".step.s5 .mCSB_container").append('<dl class="fn-clear"><dt></dt><dd><i></i>正在配置数据库相关信息<s></s></dd></dl>');
      $(".step.s5 .process").mCustomScrollbar('scrollTo','bottom');

      $.ajax({
        type: "POST",
        url: "?step=3",
        dataType: "json",
        success: function(data){
          if(data && data.state == 100){

            var lastdl = $(".step.s5 .mCSB_container dl:last");

            //如果是重试的，先把重试的进度删除，然后再把最后一条进度状态更新了成功！
            if(lastdl.find("dd").text().indexOf("重试") > -1){
              lastdl.remove();
              $(".step.s5 .mCSB_container dl:last").removeClass("err").addClass("success");
            }else{
              lastdl.addClass("success");
            }
            $(".step.s5 .mCSB_container").append('<dl class="fn-clear"><dt></dt><dd><i></i>'+data.info+'<s></s></dd></dl>');
            $(".step.s5 .process").mCustomScrollbar('scrollTo','bottom');

            isConfig = true;
            downAndinstall();
          }else{
            var lastdl = $(".step.s5 .mCSB_container dl:last");

            //如果已经是重试的，直接删除重试进度
            if(lastdl.find("dd").text().indexOf("重试") > -1){
              lastdl.remove();
            }else{
              lastdl.addClass("err");
            }
            $(".step.s5 .mCSB_container").append('<dl class="fn-clear err"><dt></dt><dd><i></i>'+data.info+'<a href="javascript:;" class="retry">重试</a></dd></dl>');
            $(".step.s5 .process").mCustomScrollbar('scrollTo','bottom');
          }
        },
        error: function(msg){
          var lastdl = $(".step.s5 .mCSB_container dl:last");

          //如果已经是重试的，直接删除重试进度
          if(lastdl.find("dd").text().indexOf("重试") > -1){
            lastdl.remove();
          }else{
            lastdl.addClass("err");
          }
          $(".step.s5 .mCSB_container").append('<dl class="fn-clear err"><dt></dt><dd><i></i>网络错误，安装失败！<s></s><a href="javascript:;" class="retry">重试</a>&nbsp;&nbsp;&nbsp;&nbsp;<a style="font-size: 14px;" href="https://help.kumanyun.com/help-11-626.html" target="_blank">查看解决方法>></a></dd></dl>');
          $(".step.s5 .process").mCustomScrollbar('scrollTo','bottom');
        }
      });

    //正常安装
    }else{
      $.ajax({
        type: "POST",
        url: "?step=4&progress="+progress,
        dataType: "json",
        success: function(data){
          if(data && data.state == 100){

            var lastdl = $(".step.s5 .mCSB_container dl:last");

            //如果是重试的，先把重试的进度删除，然后再把最后一条进度状态更新了成功！
            if(lastdl.find("dd").text().indexOf("重试") > -1){
              lastdl.remove();
              $(".step.s5 .mCSB_container dl:last").removeClass("err").addClass("success");
            }else{
              lastdl.addClass("success");
            }

            $(".step.s5 .mCSB_container").append('<dl class="fn-clear"><dt></dt><dd><i></i>'+data.info+'<s></s></dd></dl>');
            $(".step.s5 .process").mCustomScrollbar('scrollTo','bottom');
            if(data.ok){
              //全部安装完成
              setTimeout(function(){
                step(6);
              }, 500);
            }else{
              progress = data.process;
              downAndinstall();
            }
          }else{
            var lastdl = $(".step.s5 .mCSB_container dl:last");

            //如果已经是重试的，直接删除重试进度
            if(lastdl.find("dd").text().indexOf("重试") > -1){
              lastdl.remove();
            }else{
              lastdl.addClass("err");
            }
            $(".step.s5 .mCSB_container").append('<dl class="fn-clear err"><dt></dt><dd><i></i>'+data.info+'<s></s><a href="javascript:;" class="retry">重试</a>&nbsp;<a href="https://help.kumanyun.com/help-11-626.html" target="_blank">查看解决方法>></a></dd></dl>');
            $(".step.s5 .process").mCustomScrollbar('scrollTo','bottom');
          }
        },
        error: function(msg){
          var lastdl = $(".step.s5 .mCSB_container dl:last");

          //如果已经是重试的，直接删除重试进度
          if(lastdl.find("dd").text().indexOf("重试") > -1){
            lastdl.remove();
          }else{
            lastdl.addClass("err");
          }
          $(".step.s5 .mCSB_container").append('<dl class="fn-clear err"><dt></dt><dd><i></i>网络错误，安装失败！<s></s><a href="javascript:;" class="retry">重试</a>&nbsp;<a href="https://help.kumanyun.com/help-11-626.html" target="_blank">查看解决方法>></a></dd></dl>');
          $(".step.s5 .process").mCustomScrollbar('scrollTo','bottom');
        }
      });
    }
  }


  if(window.applicationCache){
    particlesJS('particles-js',{particles:{number:{value:20,density:{enable:!0,value_area:1E3}},color:{value:"#e1e1e1"},shape:{type:"circle",stroke:{width:0,color:"#000000"},polygon:{nb_sides:5},image:{src:"img/github.svg",width:100,height:100}},opacity:{value:.1,random:!1,anim:{enable:!1,speed:1,opacity_min:.1,sync:!1}},size:{value:15,random:!0,anim:{enable:!1,speed:180,size_min:.1,sync:!1}},line_linked:{enable:!0,distance:650,color:"#cfcfcf",opacity:.26,width:1},move:{enable:!0,speed:2,direction:"none",random:!0,straight:!1,out_mode:"out",bounce:!1,attract:{enable:!1,rotateX:600,rotateY:1200}}},interactivity:{detect_on:"canvas",events:{onhover:{enable:!1,mode:"repulse"},onclick:{enable:!1,mode:"push"},resize:!0},modes:{grab:{distance:400,line_linked:{opacity:1}},bubble:{distance:400,size:40,duration:2,opacity:8,speed:3},repulse:{distance:200,duration:.4},push:{particles_nb:4},remove:{particles_nb:2}}},retina_detect:!0});
  }


  var errmsgtime;
  function errmsg(div, str){
  	$('#errmsg').remove();
  	clearTimeout(errmsgtime);
  	var top = div.offset().top - 33;
  	var left = div.offset().left;

  	var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;padding:0 10px;line-height:30px;text-align:center;color:#ff0;font-size:14px;display:none;z-index:99999;background:#f00;">' + str + '</div>';
  	$('body').append(msgbox);
  	$('#errmsg').fadeIn(300);
  	errmsgtime = setTimeout(function(){
  		$('#errmsg').fadeOut(300, function(){
  			$('#errmsg').remove()
  		});
  	},3000);
  };

});
