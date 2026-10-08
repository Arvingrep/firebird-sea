UE.registerUI('mpweixin',function(editor,uiName){
	var dialog = new UE.ui.Dialog({
        iframeUrl: editor.options.UEDITOR_HOME_URL+'dialogs/mpweixin/index.html?v=3',
        cssRules:"width:450px;height:200px;",
        editor:editor,
        name:uiName+'_dialog',
        title:"公众号文章一键导入"
    });
    var btn = new UE.ui.Button({
        name:uiName,
        className:'edui-for-mpweixin',
		//需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules :'background: url("/static/images/mp_weixin_icon.png") no-repeat center center!important;',
        title:'公众号文章一键导入',
        onclick:function () {
            dialog.render();
            dialog.open();
        }
    });

    //因为你是添加button,所以需要返回这个button
    return btn;
}/*index 指定添加到工具栏上的那个位置，默认时追加到最后,editorId 指定这个UI是那个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮*/);
