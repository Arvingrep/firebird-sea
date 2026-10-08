
(async function () {
    const { createApp, ref, reactive, onMounted, nextTick } = Vue; //1.vue引入
    const { ElMessage, genFileId } = ElementPlus;
    const app = createApp({ //2.创建
        setup() {
            /** @description 其他信息
             *  @property {companyDetails} 详情信息
             *  @function [getCompanyDetails] 获取企业详情
             */
            let companyDetails = ref({});
            let getCompanyDetails = async () => {
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/getCompanyInfo'
                }
                let result = await request.post(data);
                if (result.data.state == 100) {
                    let info = result.data.info;
                    companyDetails.value = info;
                    //公司信息
                    companyInfoConfig.form.shorterName = info.shorterName; //公司名称
                    companyInfoConfig.form.area = info.area.split(',').map(Number); //区域
                    mapConfig.areaValue = info.area.split(',').map(Number);
                    companyInfoConfig.form.address = info.address; //详细地址
                    mapConfig.addressValue = info.address;
                    companyInfoConfig.form.phone = info.phone; //联系电话
                    companyInfoConfig.form.logo = info.logo; //公司logo
                    logoUploadConfig.file['turl'] = info.logoUrl;
                    companyInfoConfig.form.info = info.info; //公司介绍
                    //公司相册
                    for (let i = 0; i < info.albumUrl.length; i++) {
                        let item = info.albumUrl[i];
                        albumUploadConfig.file.push({
                            url: item.source,
                            turl: item.url
                        })
                    }
                    //我的账户
                    accountConfig.form.bank = info.bank; //银行
                    accountConfig.form.opening_bank = info.opening_bank; //开户行
                    accountConfig.form.card_number = info.card_number; //银行卡号
                    accountConfig.form.opening_name = info.opening_name; //开户人姓名
                    //企业全称
                    if (info.name) {
                        certificationConfig.form.name = info.name;
                        certificationConfig.form.licensePics = info.licensePics;
                        licenseUploadConfig.file['turl'] = info.licensePicsUrl[0].url;
                        certificationConfig.form.certification = info.certification;
                        recordUploadConfig.file['turl'] = info.certificationUrl[0].url;
                        certificationConfig.edit = false;
                    }
                } else {
                    ElMessage.error(result.data.info);
                }
            }
            /** @description 地区选择
             *  @property {areaConfig} 地区总配置
             *  @param {list} 地区列表
             *  @param {ajax} 是否正在获取地区列表
             *  @param {props} 地区懒加载配置
             *  @param {fn} 地区选择之后触发的事件
             *  @function [getAreaList] 获取地区列表
             */
            let areaConfig = reactive({
                list: [],
                ajax: false,
                props: {
                    label: 'title',
                    value: 'id',
                    children: 'lowerArr',
                    lazy: true,
                    lazyLoad: async (node, resolve) => {
                        let item = node.data;
                        if (item.lowerArr) { //1.没有获取子级或者子级获取失败
                            await getAreaList(item); //2.把引用类型的地址传过去
                            item.lowerArr.reverse().reverse(); //刷新一下存储地址，不然前端不会显示选中效果
                        }
                        resolve(item.lowerArr);
                    }
                }
            });
            let getAreaList = async (item) => {
                if (areaConfig.ajax) return;
                areaConfig.ajax = true;
                let data = {
                    service: 'siteConfig',
                    action: 'area',
                }
                if (item) data['type'] = item.id;
                let result = await request.post(data);
                areaConfig.ajax = false;
                if (result.data.state == 100) {
                    let infoArr = result.data.info;
                    for (let i = 0; i < infoArr.length; i++) {
                        let item = infoArr[i];
                        //1.如果有下级且在两级之内，则添加lowerArr，否则标记为“叶子节点”
                        item.lower ? (item['lowerArr'] = []) : (item['leaf'] = true);
                    }
                    if (item) { //2.如果是下级列表，则添加到lowerArr中
                        item.lowerArr = [...item.lowerArr, ...infoArr];
                    } else { //3.首次加载，直接赋值给list
                        areaConfig.list = [...areaConfig.list, ...infoArr];
                    }
                } else {
                    ElMessage.error(result.data.info);
                }
            }
            /** @description 图片上传
             *  @property {logoUploadConfig} 公司logo图片上传总配置
             *  @param {file} 上传文件结果
             *  @param {loading} 上传的loading状态
             *  @param {ref} 组件的实例
             *  @function [fn] 上传功能
             *  @function [coverFn] 覆盖前一个文件
             *  @property {ablumUploadConfig} 公司相册上传总配置
             *  @param {maxSize} 相册最大数
             *  @param {delete} 删除已上传图片
             *  @property {licenseUploadConfig} 营业执照
             *  @property {recordUploadConfig} 备案证明
             */
            let logoUploadConfig = reactive({
                file: {},
                loading: false,
                ref: {},
                fn: async (file, files) => {
                    logoUploadConfig.loading = true;
                    let result = await request.uploadFileFn({ Filedata: file.raw });
                    logoUploadConfig.loading = false;
                    if (result.data.state == "SUCCESS") {
                        logoUploadConfig.file = result.data;
                        companyInfoConfig.form.logo = result.data.url;
                        ElMessage.success("上传成功！"); //提示
                    } else {
                        ElMessage.error(result.data.state);
                    }
                },
                coverFn: files => {
                    logoUploadConfig.ref.clearFiles(); //清除之前已选择文件
                    const file = files[0];
                    file.uid = genFileId(); //获取当前选择的文件信息
                    logoUploadConfig.ref.handleStart(file); //执行logoUploadConfig中的fn
                }
            });
            let albumUploadConfig = reactive({
                maxSize: 20,
                file: [],
                ref: {},
                loading: false,
                fn: async (file, files) => {
                    albumUploadConfig.loading = true;
                    let result = await request.uploadFileFn({ Filedata: file.raw });
                    albumUploadConfig.loading = false;
                    if (result.data.state == "SUCCESS") {
                        albumUploadConfig.file.push(result.data);
                        ElMessage.success("上传成功！"); //提示
                    } else {
                        ElMessage.error(result.data.state);
                    }
                },
                coverFn: files => {
                    let maxSize = albumUploadConfig.maxSize; //最大上传数
                    let currNumber = albumUploadConfig.file.length; //当前已经上传数
                    let leftLength = maxSize - currNumber; //剩余位置
                    for (let i = 0; i < leftLength; i++) {
                        let file = files[i];
                        file.uid = genFileId(); //获取当前选择的文件信息
                        albumUploadConfig.ref.handleStart(file); //执行albumUploadConfig中的fn
                    }
                    ElMessage.error(`超出${albumUploadConfig.maxSize}张的部分无法上传！`);
                }
            });
            let licenseUploadConfig = reactive({
                file: {},
                loading: false,
                ref: {},
                fn: async (file, files) => {
                    licenseUploadConfig.loading = true;
                    let result = await request.uploadFileFn({ Filedata: file.raw });
                    licenseUploadConfig.loading = false;
                    if (result.data.state == "SUCCESS") {
                        licenseUploadConfig.file = result.data;
                        certificationConfig.form.licensePics = result.data.url;
                        ElMessage.success("上传成功！"); //提示
                    } else {
                        ElMessage.error(result.data.state);
                    }
                },
                coverFn: files => {
                    licenseUploadConfig.ref.clearFiles(); //清除之前已选择文件
                    const file = files[0];
                    file.uid = genFileId(); //获取当前选择的文件信息
                    licenseUploadConfig.ref.handleStart(file); //执行logoUploadConfig中的fn
                }
            })
            let recordUploadConfig = reactive({
                file: {},
                loading: false,
                ref: {},
                fn: async (file, files) => {
                    recordUploadConfig.loading = true;
                    let result = await request.uploadFileFn({ Filedata: file.raw });
                    recordUploadConfig.loading = false;
                    if (result.data.state == "SUCCESS") {
                        recordUploadConfig.file = result.data;
                        certificationConfig.form.certification = result.data.url;
                        ElMessage.success("上传成功！"); //提示
                    } else {
                        ElMessage.error(result.data.state);
                    }
                },
                coverFn: files => {
                    recordUploadConfig.ref.clearFiles(); //清除之前已选择文件
                    const file = files[0];
                    file.uid = genFileId(); //获取当前选择的文件信息
                    recordUploadConfig.ref.handleStart(file); //执行logoUploadConfig中的fn
                }
            })
            /** @description tab切换
             *  @property {tabConfig} 切换总配置
             *  @param {list} 渲染列表
             *  @param {active} 选中下标
             *  @function [tabCheck] 验证是否能切换
             *  @function [tabFn] 切换功能
             *  
             */
            let tabConfig = reactive({
                broker: [
                    {
                        id: 1,
                        title: '公司信息',
                    },
                    {
                        id: 2,
                        title: '公司相册',
                    },
                    {
                        id: 3,
                        title: '我的账户',
                    }
                ],
                distribute: [
                    {
                        id: 1,
                        title: '公司信息',
                    },
                    {
                        id: 3,
                        title: '我的账户',
                    }
                ],
                active: 0,
                tabCheck: res => {
                    if (tabConfig.active == res) return false;
                }
            })
            let tabFn = res => {
                tabConfig.active = res.index;
            }
            /** @description 公司信息表单
             *  @property {companyInfoConfig} 公司表单总配置
             *  @param {form} 表单内容
             *  @param {rules} 表单验证规则
             *  @param {ref} 表单ref
             *  @property {companyInfoRules} 公司信息表单验证自定义规则
             *  @function [phoneRules] 手机号验证规则
             *  @function [logoRules] logo 验证规则
             */
            let companyInfoRules = {
                phoneRules: (rule, value, callback) => {
                    if (!value) {
                        callback(new Error('请填写联系电话'))
                    } else if (!/^1[3456789]\d{9}$/.test(value)) {
                        callback(new Error('请填写正确的手机号'))
                    } else {
                        callback()
                    }
                },
            };
            let companyInfoConfig = reactive({
                form: {
                    shorterName: '', //公司名称
                    area: '', //公司地区
                    address: '', //详细地址
                    phone: '', //联系电话
                    logo: '', //公司logo
                    info: '', //公司介绍
                },
                rules: {
                    shorterName: [
                        { required: true, message: '请填写公司名称', trigger: 'blur' }
                    ],
                    area: [
                        { required: true, message: '请选择地区', trigger: 'blur' }
                    ],
                    phone: [
                        { required: true, message: '请填写联系电话', trigger: 'blur' },
                        { validator: companyInfoRules.phoneRules, trigger: 'blur' }
                    ],
                    logo: [
                        { required: true, message: '请上传logo' },
                    ]
                },
                ref: {},
            })
            /** @description 地图选址
             *  @property {mapConfig} 总参数
             *  @param {pop} 弹窗显隐
             *  @param {areaRef} 区域级联选择实例
             *  @param {areaValue} 区域级联选择值
             *  @param {areaOptions} 区域级联选择项
             *  @param {areaProps} 区域数据懒加载
             *  @param {addressValue} 详细地址
             *  @param {addressList} 搜索推荐列表
             *  @param {currentMap} 当前会话地图配置
             *  @param {lng/lat} 经纬度
             *  @function [baiduMap] 百度地图
             *  @function [drawMapFn] 画地图
             *  @function [setMark] 设置maker
             *  @function [listener] 添加点击和拖拽事件
             *  @function [baidu_geocode] 地址逆向解析
             *  @function [amap_geocode] 高德地图逆向解析
             *  @function [tmap_geocoder] 天地图逆向解析坐标
             *  @function [tmap_searchResult] 天地图搜索结果
             *  @function [google_geocoder] 谷歌地图逆向解析坐标
             */
            let mapConfig = reactive({
                pop: false,
                popFn: bool => {
                    mapConfig.pop = Boolean(bool);
                    nextTick(res => {
                        drawMapFn();
                        if (!mapConfig.autocomplete) {
                            initAutoCompelete();
                        }
                    })
                },
                areaRef: {},
                areaValue: '',
                areaOptions: [],
                areaProps: {
                    lazy: true,
                    value: 'id',
                    label: 'typename',
                    lazyLoad: async (node, resolve) => {
                        let data = {
                            service: 'siteConfig',
                            action: 'area',
                            type: node && node.data ? node.data.id : '',
                        }
                        let result = await request.post(data);
                        let info = result.data.info;
                        let array = info.map(function (item) {
                            return {
                                id: item.id,
                                typename: item.typename,
                                lower: item.lower,
                                leaf: !Boolean(item.lower),
                            }
                        })
                        resolve(array);
                    },
                },
                addressValue: '',
                addressList: [],
                currentMap: {
                    ref: {}, //地图实例
                    point: {}, //marker位置
                    maker: {}, //maker标记
                    icon: {},
                    geocoder: {},
                    lng: 0, //经度
                    lat: 0, //纬度
                    search: {}, //天地图搜索对象
                },
                autocomplete: '',
                moveMap: () => { //回到中心点
                    let config = mapConfig.currentMap;
                    let map = config.ref;
                    if (site_map == 'baidu') {
                        map.setCenter(config.point);
                    } else if (site_map == 'amap') {
                        let center = new AMap.LngLat(Number(config.lng), (config.lat))
                        map.setCenter(center)
                    } else if (site_map == 'tmap') {
                        let center = new T.LngLat(Number(config.lng), (config.lat))
                        map.centerAndZoom(center, 14)
                    } else if (site_map == 'google') {
                        map.setCenter(config.maker);
                    }
                },
                autoSet: res => { //自动定位
                    let config = mapConfig.currentMap;
                    if (mapConfig.addressValue) {
                        mapConfig.getSuggestion();
                    } else if (config.lng || config.lat) {
                        if (site_map == 'amap') {
                            let lnglat = new AMap.LngLat(config.lng, config.lat);
                            config.ref.setCenter(lnglat);
                            amap_geocode(lnglat);
                        } else if (site_map == 'google') {
                            google_geocoder(config.maker); //待测
                        } else if (site_map == 'tmap') {
                            let lnglat = new T.LngLat(config.lng, config.lat)
                            tmap_geocoder(lnglat);
                        }
                    }
                },
                getSuggestion() { //获取搜索结果列表
                    let keyword = mapConfig.addressValue;
                    let config = mapConfig.currentMap;
                    let map = config.ref;
                    let maker = config.maker;
                    if (site_map == 'baidu') {
                        let ls = new BMap.LocalSearch(map);
                        ls.setSearchCompleteCallback(function (rs) {
                            if (ls.getStatus() == BMAP_STATUS_SUCCESS) {
                                let poi = rs.getPoi(0);
                                if (poi) {
                                    config.lng = poi.point.lng;
                                    config.lat = poi.point.lat;
                                    setMark(poi.point, 0);
                                    config.geocoder.getLocation(poi.point, function (rs) {
                                        let addComp = rs.addressComponents;
                                        let surroundingPois = rs.surroundingPois;
                                        let addr = addComp.street + addComp.streetNumber;
                                        let tit = "";
                                        if (surroundingPois.length > 0) {
                                            if (addComp.street == "" || addComp.streetNumber == "") {
                                                addr = surroundingPois[0]['address'];
                                            }
                                            tit = surroundingPois[0]['title'];
                                            mapConfig.addressValue = 1; //不然页面不会更新
                                            mapConfig.addressValue = tit + addr;
                                        }
                                    }, {
                                        poiRadius: 1000,  //半径一公里
                                        numPois: 1
                                    });

                                }
                            }
                        });
                        ls.search(keyword);
                    } else if (site_map == 'amap') {
                        AMap.service(["AMap.PlaceSearch"], function () {
                            //构造地点查询类
                            let placeSearch = new AMap.PlaceSearch({ city: '' });
                            //关键字查询
                            placeSearch.search(keyword, function (status, result) {
                                if (status == 'complete' && result.info == 'OK') {
                                    let addrObj = result.poiList.pois[0];
                                    map.setCenter(addrObj.location);
                                    maker.setPosition(addrObj.location);
                                    config.lng = addrObj.location.lng;
                                    config.lat = addrObj.location.lat;
                                    amap_geocode(addrObj.location)
                                }
                            });
                        });
                    } else if (site_map == 'google') {
                        searchPlaces(keyword)
                    } else if (site_map == 'tmap') {
                        if (keyword && config.search) {
                            nextTick(() => {
                                config.search.search(keyword)
                            })
                        } else if (map) {
                            mapConfig.moveMap()
                        }
                    }
                },
                confirmFn: res => { //选择完毕
                    mapConfig.pop = false; //关闭弹窗
                    companyInfoConfig.form.address = mapConfig.addressValue;
                    companyInfoConfig.form.area = mapConfig.areaValue;
                    companyInfoConfig.form.lng = mapConfig.currentMap.lng;
                    companyInfoConfig.form.lat = mapConfig.currentMap.lat;
                }
            });
            let initAutoCompelete = () => {
                let config = mapConfig.currentMap;
                let map = config.ref;
                let maker = config.maker;
                if (site_map == 'baidu') {
                    mapConfig.autocomplete = new BMap.Autocomplete({
                        input: "address_detail",
                        // location: $("#city").val()
                    });
                    mapConfig.autocomplete.addEventListener('onconfirm', function (e) {
                        let value = e.item.value;
                        mapConfig.autocomplete.setInputValue(value.business);
                    })
                } else if (site_map == 'amap') { //待测试
                    //加载输入提示插件
                    map.plugin(['AMap.Autocomplete'], function () {
                        let autoOptions = {
                            input: 'address_detail',
                            // city: $("#city").val() //城市，默认全国
                        };
                        mapConfig.autocomplete = new AMap.Autocomplete(autoOptions);
                    });
                } else if (site_map == 'google') {
                    mapConfig.autocomplete = new google.maps.places.Autocomplete(document.getElementById("address_detail"));
                    mapConfig.autocomplete.addListener('place_changed', function () {
                        let res = mapConfig.autocomplete.getPlace();
                        if (res && res.geometry) {
                            map.setCenter(res.geometry.location)
                            maker.setMap(null);
                            google_drawMarker(res.geometry.location.lng(), res.geometry.location.lat())
                            config.lng = res.geometry.location.lng();
                            config.lat = res.geometry.location.lat();
                        }
                    })
                }
            }
            let baiduMap = res => {
                //初始化
                let config = mapConfig.currentMap;
                config.ref = new BMap.Map("map", { enableMapClick: false });
                let map = config.ref;
                config.point = new BMap.Point(config.lng, config.lat);
                let point = config.point;
                config.icon = new BMap.Icon("/static/images/supplier/mark_ditu.png?v=1", new BMap.Size(48, 48), { anchor: new BMap.Size(24, 48) });
                let icon = config.icon;
                config.maker = new BMap.Marker(point, { icon: icon });  //自定义标注
                let maker = config.maker;
                //进一步处理
                config.geocoder = new BMap.Geocoder();
                //如果经、纬度都为0则设置城市名为中心点
                if (!mapConfig.addressValue) {
                    //根据地址解析
                    let geolocation = new BMap.Geolocation();
                    geolocation.getCurrentPosition(function (r) {
                        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                            setMark(r.point, 0);
                            config.lng = r.point.lng;
                            config.lat = r.point.lat;
                            config.geocoder.getLocation(r.point, function (rs) {
                                let addComp = rs.addressComponents;
                                let surroundingPois = rs.surroundingPois;
                                let addr = addComp.street + addComp.streetNumber;
                                let tit = "";
                                if (surroundingPois.length > 0) {
                                    if (addComp.street == "" || addComp.streetNumber == "") {
                                        addr = surroundingPois[0]['address'];
                                    }
                                    tit = surroundingPois[0]['title'];
                                }
                                mapConfig.addressValue = tit + addr;
                            }, {
                                poiRadius: 1000,  //半径一公里
                                numPois: 1
                            });
                        }
                    }, { enableHighAccuracy: true });
                } else {
                    mapConfig.getSuggestion();
                }
                map.enableScrollWheelZoom();
                map.enableKeyboard();
                map.addControl(new BMap.NavigationControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT, type: BMAP_NAVIGATION_CONTROL_ZOOM }));
                map.centerAndZoom(point, 18); //绘制地图
                listener();
            }
            let amapMap = res => {
                let config = mapConfig.currentMap;
                config.ref = new AMap.Map("map", {
                    viewMode: '2D', //默认使用 2D 模式
                    zoom: 16, //地图级别
                    center: [config.lng, config.lat], //地图中心点
                });
                let map = config.ref;
                // 构造点标记
                config.maker = new AMap.Marker({
                    content: "<div class=\"self_icon amap_icon\"><img src=\"/static/images/supplier/mark_ditu.png?v=1\" /></div>",
                    position: [Number(config.lng), Number(config.lat)],
                    map: map,
                    draggable: true, //是否可拖拽
                });
                map.setFitView(config.maker);
                config.point = { lng: Number(config.lng), lat: Number(config.lat) }
                listener();
            }
            // 谷歌地图
            let gooleMap = async () => {
                let config = mapConfig.currentMap;
                let lng = config.lng;
                let lat = config.lat;
                const { Map } = await google.maps.importLibrary("maps");
                config.ref = new Map(document.getElementById("map"), {
                    center: { lat: lat, lng: lng },
                    zoom: 14,
                    disableDefaultUI: true
                });
                google_drawMarker(lng, lat);
                listener();
            }
            let google_drawMarker = (lng, lat) => {
                let config = mapConfig.currentMap;
                let image = {
                    url: '/static/images/supplier/mark_ditu.png?v=1',
                    size: new google.maps.Size(48, 48),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(24, 48),
                    scaledSize: new google.maps.Size(48, 48)
                };
                config.maker = new google.maps.Marker({
                    position: { lat: lat, lng: lng },
                    map: config.ref,
                    draggable: true,
                    icon: image,
                });
                config.maker.setMap(config.ref);
            }

            // 天地图输入关键字搜索
            let tmap_search = (result) => {
                const that = this;
                let config = mapConfig.currentMap;
                let type = result.getResultType();
                if(type != 10){
                    let addrObj = result.pois[0];
                    if(addrObj){
                        let lnglat = addrObj.lonlat.split(',')
                        let center = new T.LngLat(lnglat[0], lnglat[1])
                        let maker = config.maker;
                        maker.setLngLat(center);
                        config.ref.centerAndZoom(center,14)
                        config.lng = center.lng;
                        config.lat = center.lat;
                        tmap_geocoder(center)
                    }
                }else{
                    // 模糊搜搜
                }
            }

            // 天地图
            let tmapMap = () => {
                let config = mapConfig.currentMap;
                config.ref = new T.Map('map', { projection: 'EPSG:4326' });
                let map = config.ref;
                let lng = companyDetails.value.lng || config.lng;
                let lat = companyDetails.value.lat || config.lat;
                let center = new T.LngLat(lng, lat)
                map.centerAndZoom(center, 14);
                let icon = new T.Icon({
                    iconUrl: "/static/images/supplier/mark_ditu.png?v=1",
                    iconSize: new T.Point(48, 48),
                    iconAnchor: new T.Point(24, 48)
                });
                config.maker = new T.Marker(center, { icon: icon, draggable: true });
                let maker = config.maker;
                map.addOverLay(maker);
                config.point = { lng: Number(companyDetails.value.lng), lat: Number(companyDetails.value.lat) }
                map.enableDrag();
                listener();

                let searchConfig = {
                    pageCapacity: 10,	//每页显示的数量
                    onSearchComplete: tmap_search	//接收数据的回调函数
                };
                //创建搜索对象
                config.search = new T.LocalSearch(map, searchConfig);
            }
            let drawMapFn = res => {
                switch (site_map) {
                    case 'baidu': { baiduMap(); break; }
                    case 'amap': { amapMap(); break; }
                    case 'google': { gooleMap(); break; }
                    case 'tmap': { tmapMap(); break; }
                }
            }
            let setMark = (address, type) => {
                let config = mapConfig.currentMap;
                let map = config.ref;
                if (site_map == 'baidu') {
                    map.clearOverlays();
                    map.setCenter(address);
                    if (type == 0) {
                        config.point = new BMap.Point(address.lng, address.lat);
                        config.maker = new BMap.Marker(config.point, { icon: config.icon });  //自定义标注
                    }
                    map.addOverlay(config.maker);
                    config.maker.enableDragging();
                } else if (site_map == 'amap') {
                    if (config.maker) {
                        map.remove(config.maker);
                    }
                    map.setCenter(address);
                    // 构造点标记
                    config.maker = new AMap.Marker({
                        content: "<div class=\"self_icon amap_icon\"><img src=\"/static/images/supplier/mark_ditu.png?v=1\" /></div>",
                        position: [Number(address.lng), Number(address.lat)],
                        map: map,
                        draggable: true, //是否可拖拽
                    });
                    map.setFitView(config.maker);
                    config.point = { lng: Number(address.lng), lat: Number(address.lat) }
                    listener();
                } else if (site_map == 'tmap') {
                    if (marker) {
                        map.removeOverLay(marker);
                    }
                    let center = new T.LngLat(address.lng, address.lat)
                    map.centerAndZoom(center)
                    var icon = new T.Icon({
                        iconUrl: "/static/images/supplier/mark_ditu.png?v=1",
                        iconSize: new T.Point(48, 48),
                        iconAnchor: new T.Point(24, 48)
                    });
                    marker = new T.Marker(center, { icon: icon, draggable: true });
                    tt.currMarker = { lng: Number(address.lng), lat: Number(address.lat) }
                    tt.listener()
                }
            }
            let listener = () => {
                let config = mapConfig.currentMap;
                //点击
                if (!config.ref) return false;
                if (site_map == 'baidu') {
                    config.ref.addEventListener("click", function (e) {
                        config.maker.setPosition(e.point);
                        config.point = e.point;
                        config.lng = e.point.lng;
                        config.lat = e.point.lat;
                        baidu_geocode(e.point);
                    });
                    //拖动
                    config.maker.addEventListener("dragend", function (e) {
                        config.lng = e.point.lng;
                        config.lat = e.point.lat;
                        config.point = e.point;
                        config.maker.setPosition(e.point);
                        baidu_geocode(e.point);
                    });

                } else if (site_map == 'amap') {
                    // 监听点击
                    config.ref.on("click", function (e) {
                        config.maker.setPosition(e.lnglat);
                        config.point = e.lnglat;
                        config.lng = e.lnglat.lng;
                        config.lat = e.lnglat.lat;
                        amap_geocode(e.lnglat)

                    })

                    // 监听拖拽
                    config.maker.on("dragend", function (e) {
                        config.maker.setPosition(e.lnglat);
                        config.point = e.lnglat;
                        config.lng = e.lnglat.lng;
                        config.lat = e.lnglat.lat;
                        amap_geocode(e.lnglat);
                    })
                } else if (site_map == 'tmap') {
                    map.addEventListener("click", function (e) {
                        config.maker.setLngLat(e.lnglat);
                        // $("#lng").val(e.lnglat.lng);
                        // $("#lat").val(e.lnglat.lat);
                        config.lng = e.lnglat.lng;
                        config.lat = e.lnglat.lat;
                        tmap_geocoder(e.lnglat)
                    });

                    config.maker.addEventListener("dragend", function (e) {
                        let point = e.target.getLngLat();
                        // $("#lng").val(point.lng);
                        // $("#lat").val(point.lat);
                        config.lng = point.lng;
                        config.lat = point.lat;
                        config.maker.setLngLat(point);
                        tmap_geocoder(point)

                    });
                } else if (site_map == 'google') {
                    map.addListener("click", function (e) {
                        config.maker.setMap(null);
                        google_drawMarker(e.latLng.lng(), e.latLng.lat())
                        // $("#lng").val(e.latLng.lng());
                        // $("#lat").val(e.latLng.lat());
                        config.lng = e.latLng.lng();
                        config.lat = e.latLng.lat();
                        google_geocoder(e.latLng)
                    })
                    config.maker.addListener("dragend", function (e) {
                        let point = config.maker.position;
                        // $("#lng").val(point.lng);
                        // $("#lat").val(point.lat);
                        config.lng = point.lng;
                        config.lat = point.lat;
                        google_geocoder(point)
                    });
                }
            }
            let baidu_geocode = (lnglat) => {
                let config = mapConfig.currentMap;
                config.geocoder.getLocation(lnglat, function (rs) {
                    let addComp = rs.addressComponents;
                    let surroundingPois = rs.surroundingPois;
                    let addr = addComp.street + addComp.streetNumber;
                    let tit = "";
                    if (surroundingPois.length > 0) {
                        if (addComp.street == "" || addComp.streetNumber == "") {
                            addr = surroundingPois[0]['address'];
                        }
                        tit = surroundingPois[0]['title'];
                    }
                    mapConfig.addressValue = tit + addr;
                }, {
                    poiRadius: 1000,  //半径一公里
                    numPois: 1
                });
            }
            let amap_geocode = (lnglat) => {
                let config = mapConfig.currentMap;
                AMap.plugin(["AMap.Geocoder"], function () {
                    config.geocoder = new AMap.Geocoder({
                        radius: 1000, //以已知坐标为中心点，radius为半径，返回范围内兴趣点和道路信息
                        extensions: "all" //返回地址描述以及附近兴趣点和道路信息，默认“base”
                    });
                    //返回地理编码结果
                    config.geocoder.on("complete", function (res) {
                        if (res.info == 'OK') {
                            let rs = res.regeocode
                            let addComp = rs.addressComponent;
                            let surroundingPois = rs.pois;
                            let addr = addComp.street + addComp.streetNumber;
                            let tit = "";
                            if (surroundingPois.length > 0) {
                                if (addComp.street == "" || addComp.streetNumber == "") {
                                    addr = surroundingPois[0]['address'];
                                }
                                tit = surroundingPois[0]['name'];
                            }
                            mapConfig.addressValue = tit + addr;
                        }
                    });
                    //逆地理编码
                    config.geocoder.getAddress(lnglat);
                })
            }
            let tmap_geocoder = (lnglat) => {
                //创建对象
                let geocode = new T.Geocoder();
                geocode.getLocation(lnglat, tmap_searchResult);
            }
            let tmap_searchResult = (result) => {
                let config = mapConfig.currentMap;
                config.point = { lng: result.location.lon, lat: result.location.lat };
                if (result.getStatus() == 0) {
                    let rs = result;
                    let addComp = rs.addressComponent;
                    let addr = addComp.address;
                    mapConfig.addressValue = addr + addComp.poi;
                }
            }
            let google_geocoder = (latlng, noAddr = false) => {
                let config = mapConfig.currentMap;
                config.geocoder = new google.maps.Geocoder();
                config.geocoder.geocode({ "latLng": latlng }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {

                        let arr = results[0].address_components.filter(item => {
                            return !item.types.includes('postal_code') && !item.types.includes('country') && item.types.includes('political')
                        });
                        let addr_arr = results[0].address_components.filter(item => {
                            return !item.types.includes('postal_code') && !item.types.includes('political')
                        });
                        addr_arr.reverse()
                        let address = '';
                        for (let i = 0; i < addr_arr.length; i++) {
                            address = address + addr_arr[i].long_name
                        }
                        arr.reverse()
                        let parr = ['province', 'city', 'district', 'county']
                        let newObj = {}
                        for (let i = 0; i < arr.length; i++) {
                            if (parr[i]) {
                                newObj[parr[i]] = arr[i].long_name
                            }
                        }

                        newObj['address'] = address;
                        newObj['long_addr'] = results[0].formatted_address;
                        if (address && !noAddr) {
                            mapConfig.addressValue = address;
                        }
                        config.point = { lng: latlng.lng(), lat: latlng.lat() };
                    }
                })
            }
            /** @description 资质认证
             *  @property {certificationConfig} 资质认证总配置
             *  @param {name} 企业全称
             *  @param {licensePics} 营业执照
             *  @param {certification} 备案证明
             *  @param {edit} 是否是编辑状态
             */
            let certificationConfig = reactive({
                ref: {},
                form: {
                    name: '',
                    licensePics: '',
                    certification: '',
                },
                rules: {
                    name: [
                        { required: true, message: '请填写企业全称', trigger: 'blur' }
                    ],
                    licensePics: [
                        { required: true, message: '请上传营业执照' },
                    ],
                    certification: [
                        { required: true, message: '请上传备案证明' },
                    ]
                },
                edit: true,
            })
            /** @description 我的账号
             *  @property {bankNumberRule} 银行卡号验证
             *  @property {accountConfig} 我的账号总配置
             *  @param {form} 表单内容
             *  @param {ref} 表单ref
             *  @param {bankList} 银行列表
             *  @function [searchFn] 动态搜索银行名字
             */
            let bankNumberRule = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入银行卡号'));
                } else if (!/^[0-9]{16,19}$/.test(value)) {
                    callback(new Error('请输入正确银行卡号'));
                } else {
                    callback();
                }
            };
            let accountConfig = reactive({
                form: {
                    bank: '', //银行
                    opening_bank: '', //开户行
                    card_number: '', //银行卡号
                    opening_name: '', //开户人姓名
                },
                rules: {
                    bank: [
                        { required: true, message: '请选择银行', trigger: 'blur' },
                    ],
                    opening_bank: [
                        { required: true, message: '请填写开户行', trigger: 'blur' },
                    ],
                    card_number: [
                        { required: true, message: '请填写银行卡号', trigger: 'blur' },
                        { validator: bankNumberRule, trigger: 'blur' }
                    ],
                    opening_name: [
                        { required: true, message: '请填写开户人姓名', trigger: 'blur' },
                    ],
                },
                ref: {},
                bankList: [],
            });
            /** @description 企业相册
             *  @property {albumsConfig} 企业相册总配置
             *  @param {rules} 表单验证规则
             *  @param {form} 表单内容
             *  @param {ref} 表单ref
             */
            let albumsConfig = reactive({
                form: {
                    album: albumUploadConfig.file,
                },
                rules: {
                    album: [
                        { required: true, message: '请上传相册' },
                    ],
                },
                ref: {},
            });
            /** @description 表单提交
             *  @property {submitConfig} 提交总配置
             *  @param {loading} 提交状态
             *  @function [licenseFn] 资质认证提交
             */
            let submitConfig = reactive({
                loading: false,
            })
            let submitFn = async res => {
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/saveCompanyInfo',
                    ...companyInfoConfig.form,
                    ...accountConfig.form,
                    ...certificationConfig.form
                }
                data.area = companyInfoConfig.form.area.join(','); //把选择的地区id以‘,’链接，这样做的目的是会了后续的编辑能显示已保存的数据
                let validRes = false; //表单验证是否通过
                if (tabConfig.active == 0) {
                    let company = await companyInfoConfig.ref.validate((valid, fields) => { }); //公司信息
                    let license = true; //资质认证
                    if (certificationConfig.edit) {
                        license = await certificationConfig.ref.validate((valid, fields) => { });
                    }
                    validRes = company && license;
                } else if (tabConfig.active == 1) {
                    //相册处理
                    let arr = [];
                    for (let i = 0; i < albumUploadConfig.file.length; i++) {
                        let item = albumUploadConfig.file[i];
                        arr.push(item.url);
                    }
                    data['album'] = arr.join('$$');
                    validRes = await albumsConfig.ref.validate((valid, fields) => { });
                } else if (tabConfig.active == 2) {
                    validRes = await accountConfig.ref.validate((valid, fields) => { });
                }
                if (submitConfig.loading || !validRes) return;
                submitConfig.loading = true;
                if (certificationConfig.edit && companyDetails.status == 1) await licenseFn(); //审核通过的公司信息，走申请接口
                let result = await request.post(data);
                submitConfig.loading = false;
                if (result.data.state == 100) {
                    ElMessage.success(result.data.info);
                } else {
                    ElMessage.error(result.data.info);
                }
            }
            let licenseFn = async res => {
                let data = {
                    service: 'house',
                    action: 'route',
                    route: 'distributor/applyEditCompanyInfo',
                    ...certificationConfig.form,
                }
                let result = await request.post(data);
                if (result.data.state != 100) {
                    ElMessage.error(result.data.info);
                }
            }
            /** @desctiption 生命周期
             *  @function [onMounted] mounted
             */
            let userInfo = ref({});
            onMounted(async res => {
                utils.getUserInfo(userInfo);
                for (let key in bankConfig) {
                    let value = bankConfig[key];
                    accountConfig.bankList.push({
                        value: value,
                        label: value
                    })
                }
                await getAreaList();
                await getCompanyDetails();
            })
            return {
                userInfo,
                companyDetails,
                areaConfig,
                logoUploadConfig,
                albumUploadConfig,
                licenseUploadConfig,
                recordUploadConfig,
                tabConfig,
                tabFn,
                companyInfoConfig,
                mapConfig,
                certificationConfig,
                accountConfig,
                albumsConfig,
                submitConfig,
                submitFn
            }
        }
    });
    app.use(ElementPlus, { locale: ElementPlusLocaleZhCn }); //3.使用ElementPlus
    //4.引入组件
    let componentConfig = [
        {
            url: `../components/topNav/topNav.js?v=${staticVersion}`,
            name: 'top-nav',
        },
        {
            url: `../components/leftNav/leftNav.js?v=${staticVersion}`,
            name: 'left-nav',
        }
    ]
    for (let i = 0; i < componentConfig.length; i++) {
        let item = componentConfig[i];
        let result = await import(item.url); //因为静态版本号，所以需要动态引入，若不是动态引入则直接使用import xxx from 'xxx'
        app.component(item.name, result.default);
    }
    //5.最后挂载vue
    app.mount('#companyInfo');
})();