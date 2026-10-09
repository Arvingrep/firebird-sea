
/*使用说明：
    1.使用方法：
                方式1(一般用于文件列表下载按钮直接渲染，渲染即用，无需其他操作)：
                    (1)给下载文件的按钮元素添加一个class="downLoadFileBtn"，
                    (2)给按钮上添加data-fileUrl和data-fileName
                方式2(直接调用，可替代方式1，但是可能需要额外操作)：在页面中直接使用downLoadFileFn函数
    2.必要条件：(1)微信兼容必须要引入jsdk
               (2)必须引入移动端px转rem文件（100px=1rem）
               (3)必须引入jquery.js
               (4)app兼容必须有setupWebViewJavascriptBridge方法
*/
function downLoadFileFn(fileUrl, fileName) { //下载事件，可全局调用(fileUrl必传，APP环境下两个都必传)
    if (navigator.userAgent.toLowerCase().match(/micromessenger/)) { //微信环境下
        wx.miniProgram.getEnv(res => { //环境判断
            if (res.miniprogram) { //微信小程序 
                wx.miniProgram.navigateTo({
                    url: `/pages/downLoadFile/index?url=${encodeURIComponent(fileUrl)}`,
                })
            } else { //微信浏览器
                location.href = fileUrl; //地址
            }
        })
    } else if (navigator.userAgent.toLowerCase().match(/huoniao/)) { //APP环境
        if (navigator.userAgent.toLowerCase().match(/android/)) { //安卓
            setupWebViewJavascriptBridge(function (bridge) {
                bridge.callHandler('downloadFile', {
                    'fileName': fileName,
                    'url': fileUrl,
                }, function (res) { });
            })
        } else { //ios
            $('.filePop').show();
        }
    } else { //普通浏览器
        location.href = fileUrl; //地址
    }
}
$(function () {
    $('body').delegate('.downLoadFileBtn', 'click', function () {
        let fileName = $(this).attr('data-fileName');
        let fileUrl = $(this).attr('data-fileUrl');
        downLoadFileFn(fileUrl, fileName);
    });
    // 弹窗提示-css部分
    let modalCss = `.filePop{position: fixed;top: 0;left: 0;width: 100%;height: 100%;background: rgba(0,0,0,.5);z-index: 2;display:none;}
    .fp-modal{background: #fff;box-shadow: 0 .07rem .37rem 0 rgba(0, 0, 0, 0.13);border-radius: .3rem;min-width: 4.8rem;display: inline-block;pointer-events: auto;position: absolute;top: 30%;left: 50%;transform: translateX(-50%);}
    .fpm-title{padding: .55rem .4rem .48rem;border-bottom: 1px solid #f5f5f7;}
    .fpm-title .title{font-size: .32rem;font-weight: bold;text-align: center;}
    .fpm-title .text{font-size: .24rem;color: #333;text-align: center;margin-top: .05rem;}
    .fpm-btn{display: flex;}
    .fpm-btn div{box-sizing: border-box;height: .86rem;font-size: .3rem;font-weight: bold;display: flex;align-items: center;justify-content: center;flex-grow: 1;}
    .fpm-btn .cancel{border-right: 1px solid #f5f5f7;color: #666;}
    .fpm-btn .confirm{color: #FF6D01;}`;
    let modalStyle = $('<style></style>').appendTo('head');
    modalStyle.append(modalCss);
    // 弹窗提示-html部分
    let modalHtml = `<div class="filePop">
                <div class="fp-modal">
                    <div class="fpm-title">
                        <div class="title">文件下载温馨提示</div>
                        <div class="text">点击“确认”复制页面链接，用浏览器打开该链接进行下载</div>
                    </div>
                    <div class="fpm-btn">
                        <div class="cancel">取消</div>
                        <div class="confirm">确认</div>
                    </div>
                </div>
            </div>`;
    $('body').prepend(modalHtml);
    // 弹窗提示-event部分
    $('body').delegate('.fpm-btn .cancel', 'click', function () { //弹窗关闭
        $('.filePop').hide();
    });
    $('body').delegate('.fpm-btn .confirm', 'click', function () { //弹窗确定
        $('.filePop').hide();
        copyText(location.href);
    });
    function copyText(text) {
        let inputElement = document.createElement('input');
        inputElement.value = text; //复制
        document.body.appendChild(inputElement);
        inputElement.select();
        document.execCommand('Copy');
        alert('复制成功！');
        inputElement.remove(); //元素移除
    }
});