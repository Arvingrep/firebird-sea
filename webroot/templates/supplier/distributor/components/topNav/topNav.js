/* 顶部导航 */
const { defineComponent, ref, reactive, watch } = Vue;
export default defineComponent({
    name: 'top-nav', //组件名
    template:
        `<div class="TopNav">
        <!-- 左侧logo/系统名 -->
        <div class="T-info">
            <!-- logo图标 -->
            <img src="${logoUrl}" class="Ti-logo"/>
            <!-- 分割线 -->
            <div class="Ti-line"></div>
            <!-- 系统名字 -->
            <div class="Ti-name">{{companyInfo.type==1?'新房分销':'房产经纪'}}</div>
            <!-- 身份切换 -->
                <div class="Ti-identity">
                    <span class="Tii-text">当前角色：</span>
                    <el-popover placement="top-start" :show-arrow="false" :disabled="!reUserInfo.leaderName" trigger="click" width="300" popper-class="Tii-pop" transition="el-zoom-in-top" :ref="res=>{changeConfig.ref=res}">
                        <template #reference>
                            <div class="Tii-input">
                                <div>{{changeConfig.list[changeConfig.conActive].title}}</div>
                                <img src="${templets_skin}images/down.png?v=${staticVersion}" />
                            </div>
                        </template>
                        <template #default>
                            <div class="title">角色切换</div>
                            <div :class="['item',{'active':changeConfig.active==index}]" @click="changeConfig.active=index" v-for="(item,index) in changeConfig.list" :key="item.id">
                                <span class="name">{{item.title}}</span>
                                <span class="text" v-if="companyInfo.shorterName || companyInfo.name">-{{companyInfo.shorterName || companyInfo.name}}</span>
                                <span class="text" v-if="userInfo.groupName">-{{userInfo.groupName}}</span>
                            </div>
                            <div class="btn" @click="chageIdentityFn" v-loading="reloading">确定</div>
                        </template>
                    </el-popover>
                </div>
        </div>
        <!-- 右侧导航/用户信息 -->
        <div class="T-other">
            <!-- 导航 -->
            <div class="To-nav">
                <div class="Ton-item" @click="linkTo('${channelDomain}')">
                    <img src="${templets_skin}images/house.png?v=${staticVersion}"/>
                    <span>房产首页</span>
                </div>
                <div class="Ton-item" @click="linkTo('${channelDomain}store-detail-'+ companyInfo.id +'.html')" v-if="house_identity!=1">
                    <img src="${templets_skin}images/shop.png?v=${staticVersion}"/>
                    <span>公司主页</span>
                </div>
                <div class="Ton-item" @click="linkTo('${channelDomain}broker-detail-'+ userInfo.id +'.html')" v-else>
                    <img src="${templets_skin}images/shop.png?v=${staticVersion}"/>
                    <span>我的主页</span>
                </div>
                <div class="Ton-item" @click="linkTo('clientManage.html?type=1')">
                    <img src="${templets_skin}images/bell.png?v=${staticVersion}"/>
                    <span>看房预约</span>
                </div>
            </div>
            <!-- 用户信息 -->
            <div class="To-user">
                <img :src='userInfo.photoUrl||errorPhoto' @error="$event.target.src='${errorPhoto}'" class="Tou-photo"/>
                <span class="Tou-name">{{userInfo.name||'登录'}}</span>
                <img src='/static/images/supplier/arr.png' class="Tou-icon"/>
                <div class="Tou-operate">
                    <div class="Touo-item" @click="linkTo('${member_busiDomain}/profile.html')">
                        <img src="${templets_skin}images/setting.png?v=${staticVersion}" />
                        <span>账号设置</span>
                    </div>
                    <div class="Touo-item" @click="linkTo('${member_busiDomain}/security.html')">
                        <img src="${templets_skin}images/shield.png?v=${staticVersion}" />
                        <span>安全中心</span>
                    </div>
                    <div class="Touo-item" @click="linkTo('${member_busiDomain}/connect.html')">
                        <img src="${templets_skin}images/link.png?v=${staticVersion}" />
                        <span>社交账号绑定</span>
                    </div>
                    <div class="Touo-item" @click="linkTo('${member_busiDomain}/loginrecord.html')">
                        <img src="${templets_skin}images/retime.png?v=${staticVersion}" />
                        <span>账号登录记录</span>
                    </div>
                    <div class="Touo-line"></div>
                    <div class="Touo-item" @click="linkTo('${masterDomain}/logout.html',false)">
                        <img src="${templets_skin}images/exit.png?v=${staticVersion}" />
                        <span>退出登录</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`, //模板
    props: { //传值
        companyInfo: {
            type: [Object],
            default: {}
        },
        userInfo: {
            type: [Object],
            default: {}
        },
        activeIndex: {
            type: [Number, String],
            default: 0
        }
    },
    setup(props) { //methods
        let changeConfig = reactive({
            ref: null, //popover实例
            active: 0, //当前激活项
            conActive: 0, //确认当前激活项
            list: [
                {
                    id: 1,
                    title: '',
                },
                {
                    id: 2,
                    title: '经纪人',
                }
            ]
        });
        let house_identity = ref(localStorage.getItem('house_identity'));
        let reUserInfo = ref({}); //重新赋值，与传过来的区分开
        watch(() => props.userInfo, (newVal, oldVal) => {
            if (!reUserInfo.id) { //初始化赋值
                reUserInfo.value = JSON.parse(JSON.stringify(newVal));
                let index = newVal.leaderName ? 0 : 1;
                changeConfig.active = index;
                changeConfig.conActive = index;
                changeConfig.list[0].title = newVal.leaderName || '';
                if (house_identity.value) {
                    changeConfig.active = house_identity.value;
                    changeConfig.conActive = house_identity.value;
                    if (house_identity.value == 1) { //经纪人
                        newVal.leaderName = '';
                    }
                }
            }
        });
        let reCompanyInfo = ref({});
        watch(() => props.companyInfo, (newVal, oldVal) => {
            if (!reCompanyInfo.id) { //初始化赋值
                reCompanyInfo.value = JSON.parse(JSON.stringify(newVal));
                if (house_identity.value == 1) { //经纪人
                    props.companyInfo.uid = -1;
                }
            }
        });
        let linkTo = (res,newDoor=true) => {
            if(newDoor){
                open(res);
            }else{
                location.href = res;
            }
        }
        let chageIdentityFn = res => {
            reloading.value = true;
            localStorage.setItem('house_identity', changeConfig.active);
            location.reload();
        }
        let reloading = ref(false); //页面刷新的loading加载
        return {
            errorPhoto,
            changeConfig,
            house_identity,
            reUserInfo,
            reCompanyInfo,
            linkTo,
            chageIdentityFn,
            reloading
        };
    },
});