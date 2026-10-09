// searchKey = {
//     typename:typename,
//     note:desc,
//     options:optionArr,
//     keyword:''
// }
var aiConJs = {
    module:'', //模块
    aiConfig:{}, //ai配置
    aiContent:[], //ai生成过的内容
    ai_ind:0, //当前显示的内容,
    searchKey:{}, //格式是上分searchKey 
    searchKey_fix:'',
    fixConInd:0,
    fixCon:'', //完善
    showAlertErrTimer:null,
    isload:false, //是否正在加载数据
    // 流式
    textQueue:[],
    isTyping:false,
    isStreaming:false,
    displayText:'',
    responseText:'',
    currentResponse:'',
    config: {
        minDelay: 10,    // 最小延迟时间（毫秒）
        maxDelay: 70,    // 最大延迟时间（毫秒）
        threshold: 10,   // 队列长度阈值，超过此值开始加速
        speedupFactor: 10  // 加速倍数
    },
    isWaiting:false,
    textCount:{
        info:200,
        job:500
    },
    getSearchKey:function(){}, // 需要配置  获取页面所填内容
    solveForm:function(){}, // 需要配置  主要是为了获取form表单的选项
    returnData:function(){}, // 需要配置  返回ai生成内容

    initAi:function(module,getSearchKey,returnData,solveForm){
        let that = this;
        that.module = module; // 当前ai模块
        that.getSearchKey = getSearchKey;
        that.solveForm = solveForm;
        that.returnData = returnData;
        let url =  `/include/plugins/26/ajax.php?action=getConfig`;
        $.ajax({
            url: url,
            type: "POST",
            data:{
                token:ai_token,
                module:module
            },
            dataType: "json",
            success: function (data) {
                if(data.state == 100){
                    that.aiConfig = data.info;
                    if(data.info.openPlugin == 1){ //是否开启ai
                        $('.aiBtnPlace').append('<div class="aiBtn disflex a-c"> <div class="ai_btn_con disflex a-c j-c"><span>试试Ai帮我写</span></div> </div>')
                        $('body').delegate('.aiBtn','click',function(){
                            that.searchKey = that.getSearchKey();
                            if(!that.searchKey) return false; // 没有返回正确数据 
                            that.createAiDom(that.searchKey)
                        })
                    }
                }
            },
            error: function (res) { }
        });
    },
    showErrAlert(data, type = '',tip = '') {
        this.showAlertErrTimer && clearTimeout(this.showAlertErrTimer);
        $(".popErrAlert").remove();
        var type = type ?  '<s class="' + type + '"></s>' : '';
        let tipDom  = tip ? '<p class="popErr_tip">'+ tip +'</p>' : '' ;
        let moreH = tip && data ? 'moreHigh' : ''
        $("body").append('<div class="popErrAlert"><div class="popErrCon '+ moreH +'"><div class="popErr_msg">' + type + data + '</div>'+ tipDom +'</div></div>');
    
        $(".popErrAlert").css({
            "visibility": "visible"
        });
        this.showAlertErrTimer = setTimeout(function () {
            $(".popErrAlert").fadeOut(300, function () {
                $(this).remove();
            });
        }, 1500);
    },
    /**
     * 
     * @param {*} keyObj 表示输入框 有内容 则可以直接生成 
     */
     createAiDom(keyObj){
        var that = this;
        let optionHtml = '',featureHtml = '';
        $('.aiFitConBox').remove()
        if(that.module == 'info' ){
            optionHtml = $(".customizeBox").html();
            featureHtml = $(".outerTabArrs").html()
        }
        let needKey = !keyObj.note && (!keyObj.options || keyObj.options.length == 0)
        let className = needKey ? '' : 'aiConIsload';
        let html = `
            <div class="aiFitConBox ${className}">
                <div class="ai_mask"></div> 
                <div class="aiFitCon_header">
                    <div class="ai_title disflex">
                        <h4>AI内容助手</h4>
                        <p>尝试提供一些描述，AI就能帮写啦</p>
                    </div>
                    <div class="ai_title disflex ai_isload">
                        <h4>AI生成中</h4>
                    </div>
                    <div class="ai_title disflex ai_result">
                        <h4>内容已生成</h4>
                    </div>
                    <div class="ai_btns">
                        <a href="javascript:;" class="ai_getResult"><span>生成内容</span></a>
                        <a href="javascript:;" class="ai_close"></a>
                    </div>
                    <div class="aiOption_btns">
                        <div class="ai_countbox">
                            <div class="ai_count">
                                <span>字数</span>
                                <input type="text" placeholder="${that.textCount[that.module]}" id="ai_count">
                            </div>
                        </div>
                        <a href="javascript:;" data-key="0" class="ai_randombtn btn_more on_chose"><div class="btn_inner"><s></s><span>随机</span></div></a>
                        <a href="javascript:;" data-key="1" class="btn_more" data-title="正式"><div class="btn_inner"><span>更正式</span></div></a>
                        <a href="javascript:;" data-key="2" class="btn_more" data-title="专业"><div class="btn_inner"><span>更专业</span></div></a>
                        <a href="javascript:;" data-key="3" class="btn_more" data-title="有趣"><div class="btn_inner"><span>更有趣</span></div></a>
                        <a href="javascript:;" class="ai_getResult change_aiResult"><span>重新生成</span></a>
                        <a href="javascript:;" class="ai_close"></a>
                    </div> 
                    <a href="javascirp:;" class="close_aiPop ${that.module == 'info' ? '' : 'show'}"></a>
                </div>
                <div class="aiFitCon_result">
                    <div class="aiTextShow" placeholder="内容生成中..." id="typeCon"></div>
                    <div class="aiResult_btns">
                        <a href="javascript:;" class="aiResult_use"><span>使用此内容</span></a>
                        <div class="aiResult_change">
                            <a href="javascript:;" class="aiResult_prev disabled"></a>
                            <em></em>
                            <a href="javascript:;" class="aiResult_next disabled"></a>
                        </div>
                    </div>
                </div>
                <div class="aiFitCon_options">
                    <p class="ai_tip">补充描述，Ai生成更准确：</p>  
                    <div class="customizeBox">
                        <dl class="fn-clear" style="margin-bottom:-10px;"><dt>特色标签</dt><dd class="tabArrs ">${featureHtml}</dd></dl>
                        ${optionHtml}
                    </div> 
                </div>
            </div>
        `
        if(that.module != 'info'){
            html = `<div class="aiFitConBox otherModuleCon ${className}">
                <div class="ai_mask"></div> 
                <div class="aiFitCon_header">
                    <div class="ai_title disflex">
                        <h4>AI内容助手</h4>
                        <p>尝试提供一些描述，AI就能帮写啦</p>
                    </div>
                    <div class="ai_title disflex ai_isload">
                        <h4>AI生成中</h4>
                    </div>
                    <div class="ai_title disflex ai_result">
                        <h4>内容已生成</h4>
                    </div>
                    <a href="javascript:;" class="close_aiPop ${that.module == 'info' ? '' : 'show'}"></a>
                </div>
                <div class="aiFitCon_result">
                    <div class="aiTextShow" placeholder="内容生成中..." id="typeCon"></div>
                    
                </div>
                <div class="aiFitCon_foot">
                    <div class="aiResult_btns">
                        <a href="javascript:;" class="aiResult_use"><span>使用此内容</span></a>
                        <div class="aiResult_change">
                            <a href="javascript:;" class="aiResult_prev disabled"></a>
                            <em></em>
                            <a href="javascript:;" class="aiResult_next disabled"></a>
                        </div>
                    </div>
                    <div class="aiOption_btns">
                        <div class="ai_countbox">
                            <div class="ai_count">
                                <span>字数</span>
                                <input type="text" placeholder="${that.textCount[that.module]}" id="ai_count">
                            </div>
                        </div>
                        <a href="javascript:;" data-key="0" class="ai_randombtn btn_more on_chose"><div class="btn_inner"><s></s><span>随机</span></div></a>
                        <a href="javascript:;" data-key="1" class="btn_more" data-title="正式"><div class="btn_inner"><span>更正式</span></div></a>
                        <a href="javascript:;" data-key="2" class="btn_more" data-title="专业"><div class="btn_inner"><span>更专业</span></div></a>
                        <a href="javascript:;" data-key="3" class="btn_more" data-title="有趣"><div class="btn_inner"><span>更有趣</span></div></a>
                        <a href="javascript:;" class="ai_getResult"><span>换一换</span></a>
                        <a href="javascript:;" class="ai_close"></a>
                    </div> 
                </div>
            </div>`
        }
        // 隐藏/显示ai相关按钮
        $('.aiBtn').hide()
        $('.aiFitContentBox').append(html)
        // if($('.aiFitContentBox .aiFitConBox').length == 0){
        //     $('.aiFitContentBox').append(html)
        // }else{
        //     $('.aiFitContentBox .aiFitConBox').show()
        // }


        // 处理相关数据
        if(that.module == 'info'){

            that.solveForm(1,function(d){
                let objDom = $('.aiFitConBox .customizeBox');
                for(let i = 0; i < d.length; i++){
                    let key = d[i].key;
                    let type = d[i].type;
                    if(type == 'text'){
                        objDom.find('dl[data-name="'+key+'"]').find('input[type="text"]').val(d[i].value)
                    }else if(type == 'radio'){
                        objDom.find('dl[data-name="'+key+'"]').find('input[type="radio"][value="'+ d[i].value[0] +'"]').trigger('click')
                    }else{
                        let checkArr = d[i].value;
                        objDom.find('dl[data-name="'+key+'"]').find('input[type="checkbox"]').each(function(){
                            let t = $(this)
                            if(checkArr.indexOf(t.val()) > -1){
                                t.attr('checked',true)
                            }else{
                                t.attr('checked',false)
                            }
                        })
                    }
    
                }
            }) 
        }
        

        if(!needKey){ //直接搜索
            // return false
            // that.searchKey_fix = that.searchKey.keyword + ' ' + that.searchKey.note
            that.toGetResult()
        }

        $('.aiFitConBox input,.aiFitConBox #ai_count,#feature').change(function(){
            $('.change_aiResult span').text('重新生成')
            return false;
        })
        $('#ai_count').change(function(){
            let val = $(this).val()
            if(val > that.textCount[that.module]){
                alert('最多设置' + that.textCount[that.module] + '字')
                $('#ai_count').val(that.textCount[that.module])
                return false;
            }
        })
        $(document).on("keydown", "#ai_count", function(event) { 
            if(event.keyCode == 13){
                let val = $(this).val()
                if(val > that.textCount[that.module]){
                    alert('最多设置' + that.textCount[that.module] + '字')
                    $('#ai_count').val(that.textCount[that.module])
                    return false;
                }
                that.searchKey = that.getSearchKey()
                that.toGetResult();
            }
            return event.key != "Enter";
        })

        $(".ai_mask").click(function(){
            that.showErrAlert('请等待Ai生成结束后再试')
        })


        $('.ai_getResult').click(function(){
            // 重新生成内容 换一换
            that.searchKey = that.getSearchKey()
            that.toGetResult();
        })

        $('.ai_close,.close_aiPop').click(function(){
            // 关闭
            if(that.module == 'info'){
                that.solveForm(2)
            }
            $('.aiFitContentBox .aiFitConBox').hide()
            $('.aiBtn').show();
        })
        $('.aiResult_use').click(function(){
            // 使用此内容
            that.returnData(that.aiContent[that.ai_ind])
        })

        // 完善信息
        $('.btn_more').click(function(){
            let t = $(this);
            if(!t.hasClass('ai_randombtn')){
                let key = $(this).attr('data-key');
                let title = $(this).attr('data-title');
                if(t.hasClass('on_chose')) return false;
                t.addClass('on_chose').siblings('.btn_more').removeClass('on_chose')
                that.searchKey = that.getSearchKey()
                // that.searchKey.keyword = that.aiContent[that.ai_ind].keyword + ',' + that.aiContent[that.ai_ind].content ;
                // that.searchKey_fix = that.searchKey.keyword + ',' + that.aiContent[that.ai_ind].content 
                that.searchKey.note = that.aiContent[that.ai_ind].content
                that.fixCon = '内容更' + title;
            }else{
                that.fixCon = '';
                that.searchKey = that.getSearchKey()
                // that.searchKey.keyword = that.aiContent[that.ai_ind].keyword 
                // that.searchKey_fix = that.aiContent[that.ai_ind].allKey 
            }
           
            that.toGetResult(); //重新获取
        })

        $('.aiResult_change a').click(function(){
            let t = $(this)
            if(t.hasClass('disabled')) return false;
            if(t.hasClass('aiResult_prev')){
                // 上一个
                if(that.ai_ind > 0){
                    that.ai_ind-- ;
                    $('.aiResult_next').removeClass('disabled')
                }
                if(that.ai_ind == 0){
                    t.addClass('disabled')
                }
            }else{
                // 下一个
                if(that.ai_ind < that.aiContent.length - 1){
                    that.ai_ind++;
                    $('.aiResult_prev').removeClass('disabled')
                }
                if(that.ai_ind == that.aiContent.length - 1){
                    t.addClass('disabled')
                }
            }
            let info = that.aiContent[that.ai_ind].content
            $('.aiTextShow').html(info.replace(/\n/g, '<br>'))
        })
     },

     async toGetResult(){
        const that = this;
        $(".aiFitConBox").removeClass("aiConIsload").addClass('aiFitConResultShow');
        $(".aiTextShow").html('')
        if(that.isload) return false;
        that.isload = true;
        $(".aiFitConBox").addClass("aiConIsload").removeClass('aiFitConResultShow');
        let formData = {
            ...that.searchKey,
            ps:that.fixCon,
            count:$('#ai_count').val() || that.textCount[that.module],
        }
        // console.log(formData)
        // return false
        if(that.aiConfig && that.aiConfig.outputMethod == 0){
            that.streamSolve(formData)
        }else{
            $.ajax({
                url: `/include/plugins/26/ajax.php?action=getAnswer`,
                type: "POST",
                data:{
                    token:ai_token,
                    module:that.module,
                    keyword:JSON.stringify(formData)
                },
                dataType: "json",
                success: function (data) {
                    if(data.state != 100){
                        that.showErrAlert(data.info)
                        $(".aiBtn,.aiFitConBox").remove()
                        return false;
                    }
                    that.isload = false;
                    $(".aiFitConBox").removeClass("aiConIsload").addClass('aiFitConResultShow');
                    // $('.change_aiResult span').text('换一换')
                    that.txtSolve(data.info,formData)
                },
                error: function (res) { 
                    that.isload = false;
                    $(".aiFitConBox").removeClass("aiConIsload").addClass('aiFitConResultShow');
                    
                }
            });
        }
    },

    // 文本类型
    txtSolve(info,formData){
        const that = this;
        that.aiContent.push({
            keyword:JSON.stringify(formData),
            content:info
        })
        that.ai_ind = that.aiContent.length - 1;
        if(that.aiContent.length > 1){ // 有超过一个的答案 则可以切换
            $('.aiResult_prev').removeClass('disabled');
        }
        $('.aiTextShow').html(info.replace(/\n/g, '<br>'))

    },

    // 流式
     // 流式处理
     async streamSolve(form){
        const that = this;
        that.textQueue = []
        that.isTyping = false
        that.isStreaming = false
        that.displayText = ''
        that.responseText = ''
        that.currentResponse = ''
        that.isWaiting = true
        let formData = new FormData();
        formData.append('token', ai_token);
        formData.append('module', that.module);
        formData.append('keyword', JSON.stringify(form));
        const response = await fetch('/include/plugins/26/ajax.php?action=getAnswer', {
            method: 'POST',
            body: formData,
        })
        this.isWaiting = false
        this.isStreaming = true  // 开始流式传输
        if(!that.isObserve && that.isStreaming){ //监听输入框 始终滚动到底部
            that.isObserve = true
            that.setupScrollToBottom('typeCon');
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        while (true) {
            that.currentResponse = '';
            const { value, done } = await reader.read()

            if (done) {
                // $('.change_aiResult span').text('换一换')
                that.isStreaming = false  // 流式传输结束
                if(!that.isTyping && !that.isStreaming){
                    that.isload = false;
                    that.aiContent.push({
                        keyword: JSON.stringify(form),
                        content:that.displayText
                    })
                    that.ai_ind = that.aiContent.length - 1; //最后一个
                    $(".aiFitConBox").removeClass('aiConIsload').addClass('aiFitConResultShow'); //显示结果
                }
                break
            }

            const chunk = decoder.decode(value)
            that.currentResponse += chunk;
            if(chunk && chunk.indexOf('data:') == -1 && typeof(JSON.parse(chunk)) == 'object'){
                let data = JSON.parse(chunk);
                if(data.state != 100){
                    $(".aiBtn,.aiFitConBox").remove()
                    that.showErrAlert(data.info)
                    return false;
                }
            }
            let lines = that.currentResponse.split('data:');
            for (const line of lines) {
                if (line.trim() === '' || line == '[DONE]') continue
                let data = line.trim()
                if (data === '[DONE]') continue;
                try {
                    const json = JSON.parse(data)
                    if (json.choices?.[0]?.delta?.content) {
                        const content = json.choices[0].delta.content
                        that.textQueue.push(content)

                        if (!that.isTyping) {
                            await that.processQueue()
                        }
                    }
                } catch (e) {
                    console.log('Error parsing JSON:', e)
                }
            }

        }
    },

    async processQueue() {
        if (this.textQueue.length === 0) {
            this.isTyping = false
            if (!this.isStreaming) {  // 只有在流式传输也结束时才隐藏光标
                this.isStreaming = false
            }
            return
        }

        this.isTyping = true
        while (this.textQueue.length > 0) {
            const text = this.textQueue.shift()
            await this.typeWriter(text)
        }
        this.isTyping = false
       
    },

    async typeWriter(text) {
        // 根据队列长度动态计算延迟时间
        const getDelay = () => {
            if (this.textQueue.length > this.config.threshold) {
                // 队列较长时，使用更短的延迟
                return this.config.minDelay + 
                       (Math.random() * this.config.maxDelay) / this.config.speedupFactor
            }
            return this.config.minDelay + Math.random() * this.config.maxDelay
        }

        // 优化：批量处理字符
        const batchSize = this.textQueue.length > this.config.threshold ? 3 : 1
        
        for (let i = 0; i < text.length; i += batchSize) {
            // 批量添加字符
            const batch = text.slice(i, i + batchSize)
            this.displayText += batch
            $('.aiTextShow').html(this.displayText.replace(/\n/g, '<br/>'))
            // 播放打字声音（仅在慢速模式下播放）
            if (this.typeSound && batchSize === 1) {
                this.typeSound.currentTime = 0
                try {
                    await this.typeSound.play()
                } catch (e) {}
            }

            // 使用动态延迟
            await new Promise(resolve => setTimeout(resolve, getDelay()))
            
        }
    },

    // 内容新增时 最新内容始终可见 
   setupScrollToBottom(elementId) {
        var targetNode = document.getElementById(elementId);
        var config = { childList: true, subtree: true }; // 配置选项: 子节点变化或子树变化时触发
        var callback = function(mutationsList, observer) {
            for(var mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    targetNode.scrollTop = targetNode.scrollHeight; // 滚动到最底部
                }
            }
        };
        if(targetNode){
            var observer = new MutationObserver(callback);
            observer.observe(targetNode, config);
        }
    },
}