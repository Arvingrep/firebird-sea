$(function () {
    let timeoutTimer = '';
    // 页面初始加载出来
    if (pageId) {
        let pageIdArr = pageId.split(',');
        for (let i = 0; i < pageIdArr.length; i++) {
            let item = pageIdArr[i];
            getTarget(item);
        }
    }
    // 对比功能
    let compareArr = []; //正在展示的数据
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
            action: 'zuList',
            id: id
        };
        let result = await ajax(data, { dataType: 'json' });
        if (result.state == 100) {
            addCompare(result.info.list[0]);
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
                        targetEle.html(`
                        <a href="${item.url}" target="_blank">
                            <img src="${item.litpic}" onerror="this.src='/static/images/404.jpg'" class="picture">
                            <div class="name">
                                <span>${item.title}</span>
                                <img src="${templets_skin}images/closeCircle.png?v=${cfg_staticVersion}" data-id="${item.id}">
                            </div>
                        </a>`);
                    }else { //其他直接改文本即可
                        let str = '';
                        if (elementName.includes('houseTypes')) { //户型
                            str = item.room;
                        } else if (elementName.includes('areas')) { //面积
                            str = `${Number(item.area)}${symbolArea}`;
                        } else if (elementName.includes('rent')) { //租金
                            str = `${item.price>0?`${item.price}${symbolShort}/月`:'面议'}`;
                        } else if (elementName.includes('paytypes')) { //付款方式
                            str = item.paytype;
                        } else if (elementName.includes('leases')) { //租赁方式
                            str = item.rentype;
                        } else if (elementName.includes('decorations')) { //装修
                            str = item.zhuangxiu;
                        } else if (elementName.includes('directions')) { //朝向
                            str = item.direction;
                        } else if (elementName.includes('floors')) { //楼层
                            str = `${item.bno}（共${item.floor}）`;
                        } else if (elementName.includes('matchs')) { //房源配套
                            str = item.config.join(' ');
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
})