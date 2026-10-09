!function() {
    'undefined' == typeof window.HUONIAO_PLUGINS_REPRINT_GLOBAL && (window.HUONIAO_PLUGINS_REPRINT_GLOBAL = {},
    function(obj, win, doc) {
      var widgets;
      var prefix = 'HUONIAO_PLUGINS_REPRINT-';   //类名前缀
      var widgetsId = 'HUONIAO_PLUGINS_REPRINT_WIDGETS';  //插件外层元素ID
      var jsFileId = 'huoniao_plugins_reprint_script';  //页面scriptID

      //创建页面元素
      obj.createEle = function(ele, par, id, attr){
        var item = doc.createElement(ele);
        item.id = id;
        if(typeof attr === 'object' && attr.length > 0){
          for (var i = 0; i < attr.length; i++) {
            item.setAttribute(attr[i][0], attr[i][1]);
          }
        }
        par.appendChild(item);
      },

      //初始化
      obj.init = function(){

        //创建页面UI
        if(!widgets) {

          obj.createEle('div', doc.body, widgetsId);
          widgets = doc.getElementById(widgetsId);

          //获取域名、插件ID
          var jsFile = doc.getElementById(jsFileId);
          var clihost = jsFile.getAttribute('data-clihost');  //系统域名
          var plugins = jsFile.getAttribute('data-plugins');  //插件ID

          var html = [];

          //样式
          html.push('<style>');
          html.push('#'+widgetsId+' {position: relative; z-index: 9999999999;}');
          html.push('.HUONIAO_PLUGINS_REPRINT-mask {position: fixed; z-index: 1; left: 0; top: 0; right: 0; bottom: 0; background-color: #000; opacity: .2; filter: alpha(opacity=20);}');
          html.push('.HUONIAO_PLUGINS_REPRINT-main {position: fixed; z-index: 2; width: 750px; height: 800px; left: 50%; top: 50%; margin: -400px 0 0 -375px; background: #fff; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 0 40px rgba(0, 0, 0, .4); font-family: microsoft yahei; overflow: hidden; -webkit-animation: bottomFadeIn .5s ease-out; -moz-animation: bottomFadeIn .5s ease-out; animation: bottomFadeIn .5s ease-out;}');
          html.push('.HUONIAO_PLUGINS_REPRINT-header {position: relative; height: 40px; background: #f5f5f5;}');
          html.push('.HUONIAO_PLUGINS_REPRINT-title {float: left; line-height: 40px; font-size: 16px; font-weight: 400; margin: 0 0 0 15px; padding: 0;}');
          html.push('.HUONIAO_PLUGINS_REPRINT-close {float: right; width: 40px; height: 40px; border: 0; outline: 0; text-align: center; font-size: 30px; background: none; margin: 0; padding: 0; line-height: 30px; color: #666; cursor: pointer;}');
          html.push('.HUONIAO_PLUGINS_REPRINT-body {position: absolute; left: 0; top: 40px; right: 0; bottom: 0;}');
          html.push('.HUONIAO_PLUGINS_REPRINT-iframe {width: 100%; height: 100%; border: 0;}');
          html.push('@-webkit-keyframes bottomFadeIn{0%{opacity:0;-webkit-transform:translateY(10px);}100%{opacity:1;-webkit-transform:translateY(0);}}@-moz-keyframes bottomFadeIn{0%{opacity:0;-moz-transform:translateY(10px);}100%{opacity:1;-moz-transform:translateY(0);}}@keyframes bottomFadeIn{0%{opacity:0;transform:translateY(10px);}100%{opacity:1;transform:translateY(0);}}');
          html.push('</style>');

          //页面
          html.push('<div class="'+prefix+'mask"></div>');
          html.push('<div class="'+prefix+'main">');
          html.push('<div class="'+prefix+'header">');
          html.push('<h3 class="'+prefix+'title">一键转载</h3>');
          html.push('<button class="'+prefix+'close" title="关闭">&times;</button>');
          html.push('</div>');
          html.push('<div class="'+prefix+'body">');
          html.push('<iframe class="'+prefix+'iframe" src="//' + clihost + '/include/plugins/' + plugins + '/form.php?url=' + encodeURIComponent(win.location.href) + '"></iframe>');
          html.push('</div>');
          html.push('</div>')

          widgets.innerHTML = html.join('');

          //关闭
          doc.addEventListener('click',function(event){
          	var target = event.target;
          	if(target.className == prefix + 'close'){
              obj.close();
          	}
          })

        }

        widgets.style.display = 'block';

      },

      //关闭
      obj.close = function(){
        widgets.style.display = 'none';
      }

      obj.init();
    }(HUONIAO_PLUGINS_REPRINT_GLOBAL, window, document))
}();
