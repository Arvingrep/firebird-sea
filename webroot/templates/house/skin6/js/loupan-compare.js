$(function () {
    let timeoutTimer = '';
    // 页面初始加载出来
    if (pageId) {
        recommendHide(pageId);
        getTarget(pageId);
    }
    // 楼层导航
    $('.f-item').click(function () {
        let element = $(this);
        let typeName = element.attr('data-type'); //定位元素的id
        let topHeight = $('.fixedwrap').innerHeight();//吸顶导航高度
        element.addClass('active').siblings().removeClass('active'); //样式修改
        $('html, body').animate({ //页面滚动
            scrollTop: $(`#${typeName}`).offset().top - topHeight
        }, 500);
    });
    // 搜索功能
    let ajaxb = false;
    let searchResult = [];
    let compareItem = {}; //搜索选中结果保存
    $('.ic-search .search input').on({
        'blur': function () {
            setTimeout(res => {
                $('.ic-search .search .list').hide();
            }, 200);
        },
        'input propertychange': async function () {
            if (ajaxb) { //防止请求堆积
                return false
            }
            ajaxb = true;
            let eleList = $('.ic-search .search .list');
            let data = {
                service: 'house',
                action: 'loupanList',
                page: 1,
                pageSize: 10,
                keywords: $(this).val()
            };
            let result = await ajax(data, { dataType: 'json' });
            if (result.state == 100) {
                let str = ``;
                searchResult = result.info.list; //暂时保存
                for (let i = 0; i < result.info.list.length; i++) {
                    let item = result.info.list[i];
                    str += `<div class="item" data-index=${i}>${item.title}</div>`;
                }
                eleList.html(str);
                eleList.show();
            } else { //搜索失败
                eleList.html('<div class="none">暂无相关结果</div>')
            }
            ajaxb = false;
        },
        'focus': function () { //如果已经搜索过就显示
            if ($('.ic-search .search .list .item')[0]) {
                $('.ic-search .search .list').show();
            }
        },
    });
    $('.ic-search .search .list').delegate('.item', 'click', function () {
        let index = $(this).attr('data-index');
        compareItem = searchResult[index];
        $('.ic-search .search input').val(compareItem.title);
        $('.ic-search .search .list').hide();
    });
    // 对比功能
    let compareArr = []; //正在展示的数据
    $('.irl-item .btn').click(function () { //推荐对比
        let id = $(this).attr('data-id');
        let target = compareArr.filter(item => item != 'blank');
        if (checkSame(id)) { //检验是否已经添加
            return false
        } else if (target.length < 4) { //未满
            $(this).closest('.irl-item').hide();
            getTarget(id);
        } else {
            popWarn('最多同时对比4个楼盘');
        }
        return false
    });
    $('.ic-search .search .btn').click(function () { //搜索对比
        let target = compareArr.filter(item => item != 'blank');
        if (JSON.stringify(compareItem) == '{}') {
            console.log($('.ic-search .search input').val())
            popWarn($('.ic-search .search input').val() ? '请选中楼盘' : '请输入关键字');
        } else if (checkSame(compareItem.id)) { //检验是否已经添加
            return false
        } else if (target.length < 4) { //未满
            recommendHide(compareItem.id);
            addCompare(compareItem);
        } else {
            popWarn('最多同时对比4个楼盘');
        }
    });
    $('.ic-name .item').delegate('.name img', 'click', function () { //删除对比元素
        for (let i = 0; i < $('.irl-item').length; i++) { //让隐藏的元素显示
            let element = $('.irl-item').eq(i);
            if (element.attr('data-id') == $(this).attr('data-id')) {
                element.show();
                break;
            }
        }
        let index = $(this).closest('.item').index();
        $('table tr').each(function () { //变量行
            let skip = $(this).attr('data-skip'); //无用行判断
            if (!skip) {
                let targetEle = $(this).find('td').eq(index); //这里+1是为了跳过首个单元格，首个单元格的内容是标题（固定）
                targetEle.html('')
            }
        });
        compareArr.splice(index - 1, 1, 'blank'); //记录数据清掉，标记为blank（因为是无序删除，所以这里需要一个空的标记）
        return false
    })
    async function getTarget(id) { //获取详情数据
        let data = {
            service: 'house',
            action: 'loupanList',
            id: id
        };
        let result = await ajax(data, { dataType: 'json' });
        if (result.state == 100) {
            addCompare(result.info.list[0]);
            if(compareArr.length==1){
                $('.ir-title').text(`温馨提示：为您推荐与 ${compareArr[0].title} 对比次数最多的楼盘`);
            }
        } else {
            popWarn(result.info);
        }
    }
    function addCompare(item) { //增加对比元素
        let blankIndex = compareArr.indexOf('blank'); //是否有被删除的元素（之前渲染了，后面删除了）
        if (blankIndex == -1) { //没有删除过，直接push
            compareArr.push(item);
        } else { //有删除过，修改首个blank
            compareArr[blankIndex] = item;
        }
        // 渲染
        $('table tr').each(function () { //变量行
            let skip = $(this).attr('data-skip'); //无用行判断
            if (!skip) {
                let elementName = $(this).attr('class');
                for (let i = 0; i < compareArr.length; i++) {
                    let item = compareArr[i];
                    if (item == 'blank') { //空状态直接跳过此次循环
                        continue;
                    }
                    let targetEle = $(this).find('td').eq(i + 1); //这里+1是为了跳过首个单元格，首个单元格的内容是标题（固定）
                    if (elementName == 'ic-name') { //楼盘名称特殊处理
                        targetEle.html(`<a href="${item.url}" target="_blank">
                            <img src="${item.litpic}" class="picture" onerror="this.src='/static/images/404.jpg'">
                            <div class="name">
                                <span>${item.title}</span>
                                <img src="${templets_skin}images/closeCircle.png?v=${cfg_staticVersion}" data-id="${item.id}">
                            </div>
                        </a>`);
                    } else if (elementName == 'ic-price') { //楼盘均价特殊处理
                        let str = '';
                        if (item.price > 0) {
                            if (item.ptype == 1) {
                                str = `/${symbolArea}`
                            } else {
                                str = `万${symbolShort}/套`
                            }
                            targetEle.html(`<span class="text">均价</span>
                        <span class="price">${item.price}${symbolShort}</span>
                        <span class="cell">${str}</span>`);
                        } else {
                            targetEle.html(`<span class="text"><span class="price">待定</span></span>`)
                        }
                    } else { //其他直接改文本即可
                        let str = '';
                        if (elementName.includes('developers')) { //开发商
                            str = item.investor;
                        } else if (elementName.includes('types')) { //建筑类别
                            str = item.protype;
                        } else if (elementName.includes('areas')) { //建筑面积
                            str = `${Number(item.buildarea)}平方米`;
                        } else if (elementName.includes('equitys')) { //产权
                            str = item.buildage;
                        } else if (elementName.includes('decorations')) { //装修状况
                            str = item.zhuangxiu;
                        } else if (elementName.includes('accommodates')) { //容积率
                            str = Number(item.rongji);
                        } else if (elementName.includes('greens')) { //绿化率
                            str = Number(item.green);
                        } else if (elementName.includes('plans')) { //规划户数
                            str = item.planhouse;
                        } else if (elementName.includes('cars')) { //车位数
                            str = item.parknum;
                        } else if (elementName.includes('companys')) { //物业公司
                            str = item.property;
                        } else if (elementName.includes('moneys')) { //物业费
                            str = item.proprice;
                        } else if (elementName.includes('houseTypes')) { //户型
                            if (item.hx_data.length > 0) {
                                let hxArr = [item.hx_data[0]];
                                for (let a = 1; a < item.hx_data.length; a++) {
                                    let hxLength=hxArr.length;
                                    x:for (let b = 0; b < hxLength; b++) {
                                        if (hxArr[b].room == item.hx_data[a].room) { //找到对应户型area合并
                                            hxArr[b].area = `${hxArr[b].area}${symbolArea}，${item.hx_data[a].area}`;
                                            break x; //直接结束x循环
                                        } else if (hxArr.length - 1 == b) { //未找到对应户型
                                            hxArr.push(item.hx_data[a]);
                                        }
                                    }
                                }
                                for (let j = 0; j < hxArr.length; j++) {
                                    let items = hxArr[j];
                                    str += `<div>${items.room}居${items.area}${symbolArea}</div>`;
                                }
                            }
                        } else if (elementName.includes('sellStarts')) { //开盘时间
                            if (item.deliverdate) {
                                let date = new Date(item.deliverdate * 1000);
                                let year = date.getFullYear();
                                let month = date.getMonth() + 1;
                                let day = date.getDate();
                                str = `预计${year}年${month}月${day}日`;
                            } else {
                                str = '待定';
                            }
                        } else if (elementName.includes('sellEnds')) { //交房时间
                            if (item.opendate) {
                                let date = new Date(item.opendate * 1000);
                                let year = date.getFullYear();
                                let month = date.getMonth() + 1;
                                let day = date.getDate();
                                str = `预计${year}年${month}月${day}日`;
                            } else {
                                str = '待定';
                            }
                        } else if (elementName.includes('sellStates')) { //销售状态
                            let saleState = item.salestate;
                            str = saleState == 0 ? '新盘待售' : saleState == 1 ? '在售' : saleState == 2 ? '尾盘' : '售罄';
                        } else if (elementName.includes('positions')) { //楼盘位置
                            str = item.address;
                        }
                        targetEle.html(str);
                    }
                }
            }
        });
    }
    function popWarn(info) { //弹窗提示
        $('.warnPop').text(info);
        $('.warnPop').css({ 'display': 'flex' });
        clearTimeout(timeoutTimer);
        timeoutTimer = setTimeout(res => {
            $('.warnPop').hide();
        }, 2000);
    }
    function checkSame(id) { //检验重复添加对比
        for (let i = 0; i < compareArr.length; i++) {
            let item = compareArr[i];
            if (item != 'blank' && item.id == id) {
                popWarn('该楼盘已在对比列中');
                return true
            }
        }
        return false
    }
    function recommendHide(id) { //推荐选中项隐藏
        for (let i = 0; i < $('.irl-item').length; i++) { //当前页已选中的推荐对比项隐藏
            let element = $('.irl-item').eq(i);
            if (element.attr('data-id') == id) { //能够找到
                element.hide();
                break;
            }
        }
    }
})