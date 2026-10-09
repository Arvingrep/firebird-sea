/* <div class="aiBtn disflex a-c ">
 <div class="ai_btn_con disflex a-c j-c"><span>试试Ai帮我写</span></div>
</div> */
var ai2ContentVue = new Vue({
    el: '#ai2Content',
    data:{
        showAiCon:false, //是否显示弹窗
        showAiPop:false, //是否显示ai输入框
        aiResultPop:false, //是否显示ai返回结果
        isload:false, //是否正在生成内容
        module:'', //生成内容的模块
        aiContent:[], //生成的内容数组  => 用于返回上一版和下一版
        ai_ind:0, //当前ai返回结果的下标
        infoOptions:{

        },
        oInput:'', //原页面输入的内容
        textarea:'',  //问题输入框内容
        formData:{
            keyword:'',
            token:ai_token,
            module:'',
        },  //生成内容的基础数据
        changeList:['精简','丰富','专业','有趣'],
        changeInd:[], //新增快捷修改的下标
        aiConfig:{},
        filter_addInputArr:[] , //最多只显示6条数据 只显示单选或者多选
        vueDom:'',
        isObserve:false, //是否开启监听
        reSearchKey:"", //补充说明
        isFocus:false, //是否获取焦点
    
        // 测试流式
        textQueue: [],
        isTyping: false,
        isWaiting: false,
        isStreaming: false,  // 新增流式传输状态
        displayText: '',
        responseText: '',
        typeSound: null,
        currentResponse: '',
        config: {
            minDelay: 10,    // 最小延迟时间（毫秒）
            maxDelay: 70,    // 最大延迟时间（毫秒）
            threshold: 10,   // 队列长度阈值，超过此值开始加速
            speedupFactor: 10  // 加速倍数
        },
        pageKey:{}, //页面中填写的内容
        callback:function(){ // 回调函数 传值给父页面
        },

        getkey: function() { // 获取页面输入内容
        },
    },
    computed:{
		checkInput(){
			return function(inp){
					var that = this;
					var obj = {};
					if(opAct == ''){ //不是编辑状态
						if(inp.default && inp.default.length >= 1 && inp.default[0] != ''){
							var valArr = [];
							if(inp.options){
								inp.options.forEach(function(val){
									if(inp.default.indexOf(val) > -1){
										valArr.push(val);
									}
								})
								obj = {
									id:inp.id,
									type:inp.title,
									value:valArr.join(','),
									valueArr:valArr
								}
							}else{
								obj = {
									id:inp.id,
									type:inp.title,
									value:inp.default[0],
									valueArr:inp.default
								}
							}
							
						}

					}
					if(typeof(that.dCustomArr) == 'string'){

						that.dCustomArr = JSON.parse(that.dCustomArr)
						
					}
					that.dCustomArr.forEach(function(val,ind){
						for(var item in val){
							if(val[item] && typeof(val[item]) == 'object' && val[item].length && val[item].indexOf('') > -1){
								val[item] = [];
								that.dCustomArr[ind] = val;
							}
						}
						if(inp.id == val.id ){
							obj = val;
						}
					});

					// if(inp.id == 127){
					// 	console.log(obj)
					// }
					
				return obj
			}
		},
	},
    mounted(){},
    methods:{
        /**
         * 
         * @param {*} dom ai按钮展示的位置
         * @param {*} mod ai生成内容的模块
         * @param {*} txtDom 已经填写的内容dom
         * @param {*} vueDom 使用了vue 可以调其中的数据和方法
         * @param {Function} callback 回调 可以让父页面拿到ai生成的内容
         * @param {Function} getkey 拿到页面填写的内容
         * 
         */
        initAi2Con(dom,mod,vueDom,callback,getkey){
            const that = this;
            that.initShowOption(mod,vueDom)
            that.callback = callback;
            that.getkey = getkey;
            if(that.aiConfig.hasOwnProperty('openPlugin')){
                that.handleConfig(dom,that.aiConfig)
            }else{
                $.ajax({
                    url: `/include/plugins/26/ajax.php?action=getConfig`,
                    type: "POST",
                    data:{
                        token:ai_token,
                        module:mod
                    },
                    dataType: "json",
                    success: function (data) {
                        if(data.state == 100){
                            that.aiConfig = data.info;
                            that.handleConfig(dom,data.info)
                        }
                    },
                    error: function (res) { }
                });
            }
        },

        // 根据config处理数据 data => config
        handleConfig(dom,data){
            const that = this;
            if(data.openPlugin && Number(data.openPlugin) == 1){
                that.showAiCon = true; //需要显示弹窗
                dom[0].innerHTML = '<div class="aiBtn disflex a-c"> <div class="ai_btn_con disflex a-c j-c"><span>试试Ai帮我写</span></div> </div>'
                $('.aiBtn').click(function(){
                    that.pageKey = that.getkey();
                    console.log(that.pageKey)
                    if(!that.pageKey) return false;
                    that.reSearchKey = ''; //清空关键字
                    if(that.pageKey.note || (that.pageKey.options && that.pageKey.options.length)){
                        that.getKeyword(); //根据所填内容 直接生成
                    }else{
                        that.showAiPop = true;
                    }
                })
            }
        },

        // 获取关键字
        getKeyword(){
            const that = this;
            let textArr = []
            let obj =  that.getkey();
            that.pageKey = obj
            
            if(that.textarea){
                that.pageKey.note = that.pageKey.note + that.textarea
            }
            
            that.formData.keyword = that.pageKey['keyword'] + (that.pageKey.note ? ',' : '') + (that.pageKey.note || '');
            if(that.textarea){
                that.formData.keyword = that.pageKey['keyword'] + ',' + that.textarea ;
            }
            that.formData.keyword =  that.formData.keyword + (that.pageKey.lastKey ? ',' : '') + (that.pageKey.lastKey || '');
            that.onSubmit('submit')
        },

        // 初始化分类信息选项数据
        initShowOption(mod,vueDom){
            const that = this;
            that.module = mod;
            that.vueDom = vueDom;
            that.formData.module = mod;
            if(mod != 'info') return false;
            that.dCustomArr = vueDom['dCustomArr'] || []
            that.addInputArr = vueDom['addInputArr'] || [];
            let n = 0;
            for(var i = 0; i < that.addInputArr.length; i++){
                let option = that.addInputArr[i];
                if(n < 6 && (option.formtype == 'radio' || option.formtype == 'checkbox')){
                    that.filter_addInputArr.push(option)
                }
            }

            that.$nextTick(() => {
                setTimeout(() => {
                    $(".aiTipPop  .inpAll").on('click','.click',function(){
                        var t = $(this),dd = t.closest('dd'), type= t.closest('dd').attr('data-type'),Inpname = t.closest('dd').attr('data-name'),id = dd.attr('data-id'),title=dd.attr('data-title');
                        if(type == 'radio'){
                            if($(this).closest('.inpbox').attr('data-required')==0&&t.attr('class').includes('on_chose')){
                                t.toggleClass('on_chose')
                            }else{
                                t.addClass('on_chose').siblings('.inp').removeClass('on_chose')
                            }
                        }else{
                            t.toggleClass('on_chose')
                        }
                        var fArr = []
                
                        if(Inpname == 'feature'){
                
                        }else{
                            dd.find('.inp').each(function (){
                                if($(this).hasClass('on_chose')){
                                    fArr.push($(this).text())
                                }
                            });
                            var valhas = false;
                            for(var i=0; i < that.dCustomArr.length; i++){
                                    var cst = that.dCustomArr[i]
                                    if(cst.id == id){
                                        valhas = true;
                                        that.dCustomArr[i].value = fArr.join(',');
                                        that.dCustomArr[i].valueArr = fArr;
                                        break;
                                    }
                                }
                                if(!valhas){
                                    that.dCustomArr.push({
                                        id:id,
                                        type:title,
                                        value:fArr.join(','),
                                        valueArr:fArr,
                                    })
                                }
                        }
                
                    })
                }, 1000)
                
            })
        },

        onSubmit(e){
            const that = this;
            if(e.code == 'Enter'){
                e.preventDefault()
                // that.formData.keyword = that.textarea
                // that.toGetResult()
                that.getKeyword()
            }else if(e == 'submit'){
                that.toGetResult()
            }
        },

        async toGetResult(){
            const that = this;
            // return false
            that.showAiPop = false;
            that.aiResultPop = true; 
            if(that.isload) return false;
            that.isload = true;
            let formData = {
                typename:that.pageKey.typename, //分类
                options:that.pageKey.options, //选项
                note:that.pageKey.note, //输入或者生成的内容
                ps:that.reSearchKey, //补充说明
            }
            if(that.aiConfig && that.aiConfig.outputMethod == 0){
                that.streamSolve(formData)
            }else{
                

                $.ajax({
                    url: `/include/plugins/26/ajax.php?action=getAnswer`,
                    type: "POST",
                    data:{
                        token:ai_token,
                        module:that.module,
                        keyword:JSON.stringify(formData),
                    },
                    dataType: "json",
                    success: function (data) {
                        that.isload = false;
                        if(data.state == 100){
                            that.txtSolve(data.info,formData)
                        }else{
                            showErrAlert(data.info || '请求错误，请稍后再试')
                            that.showAiCon = false;
                            $(".aiBtnBox").remove()
                        }
                    },
                    error: function (res) { 
                        that.isload = false;
                        console.log(res)
                    }
                });
            }
        },  

        // 文本文字处理
        txtSolve(info,formData){
            const that = this;
            that.aiContent.push({
                keyword:JSON.stringify(formData),
                content:info
            })
            that.ai_ind = that.aiContent.length - 1
        },

        // 流式处理 form =>传输过来的请求数据 与keyword相关
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
                that.$nextTick(() => {
                    that.isObserve = true
                    that.setupScrollToBottom('typeCon');
                })
            }
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            while (true) {
                that.currentResponse = ''; //先清空，避免内容重复
                const { value, done } = await reader.read()
                if (done) {
                    that.isStreaming = false  // 流式传输结束
                    if(!that.isTyping && !that.isStreaming){
                        that.isload = false;
                        that.aiContent.push({
                            keyword:JSON.stringify(form),
                            content:that.displayText
                        })
                        that.ai_ind = that.aiContent.length - 1; //最后一个
                    }
                    break
                }

                const chunk = decoder.decode(value)
                that.currentResponse += chunk
                if(chunk && chunk.indexOf('data:') == -1 && typeof(JSON.parse(chunk)) == 'object'){
                    let data = JSON.parse(chunk)
                    if(data.state != 100){
                        showErrAlert(data.info || '请求错误，请稍后再试')
                        that.isload = false;
                        that.showAiCon = false
                        $(".aiBtnBox").remove()
                        return false;
                    }

                }
                // // 处理所有新的数据行
                // const lines = that.currentResponse.split('\n')
                // // 保留最后一个可能不完整的行
                // for (const line of lines) {
                //     that.currentResponse = lines.pop() || ''
                //     if (line.trim() === '') continue
                //     if (line.startsWith('data: ')) {
                //         const data = line.substring(6)
                //         if (data === '[DONE]') continue;

                //         try {
                //             const json = JSON.parse(data)
                //             if (json.choices?.[0]?.delta?.content) {
                //                 const content = json.choices[0].delta.content
                //                 that.textQueue.push(content)
                //                 if (!that.isTyping) {
                //                     await that.processQueue()
                //                 }
                //             }
                //         } catch (e) {
                //             console.log('Error parsing JSON:', e)
                //         }
                //     }
                // }

                let lines = that.currentResponse.split('data:');
                for (const line of lines) {
                    if (line.trim() === '' || line == '[DONE]') continue
                    let data = line.trim()
                    if (data === '[DONE]') continue;
                    if(!that.isJSON(data)) continue;
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

        isJSON(str) {
            try {
                var result = JSON.parse(str);
                return true;
            } catch (e) {
                return false;
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


        // 补充说明
        addKey(item){
            const that = this;
            let keyword = `内容要${item}`;
            that.reSearchKey = that.reSearchKey ? (that.reSearchKey + ',' + keyword) : keyword;
        },

        //重新搜索
        reSearchByAi(){
            const that = this;
            if(!that.reSearchKey){
                showErrAlert('请输入补充说明')
            }else{
                that.onSubmit('submit')
            }
        },

        // 切换其他 上一个  / 下一个 type => 'prev' / 'next'
        changeCon(type){
            const that = this;
            if(that.aiContent.length == 0){
                showErrAlert('还没生成内容哦');
                return false;
            }
            if(type == 'prev'){
                if(that.ai_ind == 0){
                    showErrAlert('没有更多内容了哦');
                    return false;
                }
                that.ai_ind--;
            }else{
                if(that.ai_ind == that.aiContent.length - 1){
                    showErrAlert('没有更多内容了哦');
                    return false;
                }
               that.ai_ind++;
            }
        },

        // 换一个， (分类信息的如果内容较少则需要补充  只有第二次点击的时候)
        reGetByKey(){
            const that = this;
            if(that.module == 'info'){
                let ketObj = that.getkey();
                if(!ketObj.options && !ketObj.options.length < 2 && that.aiContent.length < 2){
                    that.showAiPop = true
                }else{
                    that.toGetResult();
                }
            }else{
                that.pageKey.note = that.aiContent[that.ai_ind].content
                that.toGetResult();
            }
        },

        // 使用当前ai生成的内容
        useContent(){
            const that = this;
            let content = this.aiContent[this.ai_ind].content;
            that.callback(content); //回调 传值

            // 隐藏弹窗
            that.aiResultPop = false;
            that.showAiPop = false;

        },

        // 数据请求中 请勿点击
        showClickTip(){
            showErrAlert('请等Ai生成结束后再试')
        },

    },

    watch:{
        aiResultPop:function(){
            if(this.aiResultPop || this.showAiPop){
                $('html').css('overflow','hidden')
            }else{
                $('html').css('overflow','visible')
            }
        },
        showAiPop:function(){
            if(this.aiResultPop || this.showAiPop){
                $('html').css('overflow','hidden')
            }else{
                $('html').css('overflow','visible')
            }
        },
        showAiCon:function(val){
            if(!val){
                $('html').css('overflow','visible')
            }
        },
    }
})