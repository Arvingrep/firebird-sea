UE.registerUI('135editor',function(editor,uiName){
	var dialog = new UE.ui.Dialog({
        iframeUrl: editor.options.UEDITOR_HOME_URL+'dialogs/135editor/135EditorDialogPage.html?v=3',
        cssRules:"width:"+ parseInt(document.body.clientWidth*0.9) +"px;height:"+(window.innerHeight -50)+"px;",
        editor:editor,
        name:uiName+'_dialog',
        title:"135编辑器"
    });
    dialog.fullscreen = false;
    dialog.draggable = false;
    var btn = new UE.ui.Button({
        name:uiName,
        className:'edui-for-135editor',
		//需要添加的额外样式，指定icon图标，这里默认使用一个重复的icon
        cssRules :'background: url("/static/images/editor-135-icon.png") no-repeat center center /85% auto!important;',
        title:'135编辑器',
        onclick:function () {
            dialog.render();
            dialog.open();
        }
    });

    //因为你是添加button,所以需要返回这个button
    return btn;
}/*index 指定添加到工具栏上的那个位置，默认时追加到最后,editorId 指定这个UI是那个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮*/);
