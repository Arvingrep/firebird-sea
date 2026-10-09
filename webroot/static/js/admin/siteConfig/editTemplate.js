$(function(){

  //页面、样式、脚本切换
  $(".left-nav li").bind("click", function(){
    var t = $(this), type = t.data("type"), index = t.index();
    if(!t.hasClass("current")){
      filetype = type;
      t.addClass("current").siblings("li").removeClass("current");
      $(".file-tree ul").hide();
      $(".file-tree ul:eq("+index+")").show();
    }
  });

  var editor = null, isload = false, editfile = "", defaultData = "";

  //选择文件
  $(".file-tree li").bind("click", function(){
    var t = $(this), par = t.closest(".file-tree");
    if(!t.hasClass("current") && !isload){
      par.find("li").removeClass("current");
      t.addClass("current");

      isload = true;
      huoniao.showTip("loading", "获取中...");
      editfile = t.data("title");

      //异步获取文件内容
      $.ajax({
  			url: "?",
  			data: "do=getFileContent&action="+action+"&template="+template+"&touch="+touch+"&filetype="+filetype+"&editfile="+editfile,
  			type: "POST",
  			dataType: "json",
  			success: function (data) {
          isload = false;

          if(data && data.state == 100){

            defaultData = data.info;
            huoniao.showTip("success", "获取成功！", "auto");
            $(".code-edit .nofile").hide();
            $(".code-edit .code-btns, .CodeMirror-wrap").show();

            $('#code').empty();
            document.getElementById("code").value = defaultData;

            //编辑器选项
            if(editor == null){
              editor = CodeMirror.fromTextArea(document.getElementById("code"), {
                mode: "text/"+(filetype == "js" ? "javascript" : filetype),
                theme: "ihuoniao",
                styleActiveLine: true,  //选中行变色
                lineNumbers: true,      //行号
                lineWrapping: true,     //自动换行
                autoCloseBrackets: true,      //自动闭合括号
                matchTags: {bothTags: true},  //选中结束标记
                autoCloseTags: true,          //自动结束标记
                foldGutter: true,    //折叠
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true},
                extraKeys: {
                  //Ctrl+J快捷键快速定位结束标记
                  "Ctrl-J": "toMatchingTag",
                  //Ctrl+Q快捷键折叠
                  "Ctrl-Q": function(cm){
                    cm.foldCode(cm.getCursor());
                  },
                  //F11全屏编辑
                  "F11": function(cm) {
                    cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                  },
                  //ESC退出全屏
                  "Esc": function(cm) {
                    if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                  },
                  //搜索
                  "Ctrl-F": "findPersistent",
                  //跳至指定行
                  "Ctrl-G": "jumpToLine"
                }
              });

            //已经加载过，刷新代码编辑内容及文档类型
            }else{

              editor.setOption("mode", "text/"+(filetype == "js" ? "javascript" : filetype));
              editor.getDoc().setValue(defaultData);
              editor.refresh();

            }

          }else{

            $(".code-edit .nofile").show();
            $(".code-edit .code-btns, .CodeMirror-wrap").hide();
            huoniao.showTip("error", data.info, "auto");

          }

  			},
  			error: function(){
          isload = false;
          $(".code-edit .nofile").show();
          $(".code-edit .code-btns, .CodeMirror-wrap").hide();

  				$.post("../login.php", "action=checkLogin", function(data){
  					if(data == "0"){
  						huoniao.showTip("error", "登录超时，请重新登录！");
  						setTimeout(function(){
  							location.reload();
  						}, 500);
  					}else{
  						huoniao.showTip("error", "网络错误，请重试！");
  					}
  				});

  			}
  		});

    }
  });

  //保存修改
  $(".code-btns .submit").bind("click", function(){

    var t = $(this);
    if(t.hasClass("loading")) return false;

    $.dialog.confirm("确定要修改吗？", function(){
      huoniao.showTip("loading", "提交中...");
      t.addClass("loading").html("提交中...");
      var content = encodeURIComponent(editor.getValue());
      $.ajax({
  			url: "?",
  			data: "do=save&edit_action="+action+"&edit_template="+template+"&edit_touch="+touch+"&edit_filetype="+filetype+"&edit_editfile="+editfile+"&edit_content="+content,
  			type: "POST",
  			dataType: "json",
  			success: function (data) {

          t.removeClass("loading").html("保存修改");
          if(data && data.state == 100){
            huoniao.showTip("success", "修改成功！", "auto");
          }else{
            huoniao.showTip("error", data.info, "auto");
          }

        },
        error: function(){
          huoniao.showTip("error", "网络错误，提交失败！", "auto");
          t.removeClass("loading").html("保存修改");
        }
      });
    });

  });

});
