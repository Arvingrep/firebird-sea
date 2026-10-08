<?php

/**
 * elasticsearch封装类
 */

require(HUONIAOROOT . '/include/vendor/autoload.php');

use Elastic\Elasticsearch\Client;
use Elastic\Elasticsearch\ClientBuilder;
use Elastic\Elasticsearch\Response\Elasticsearch;
use Http\Promise\Promise;

class es
{
    public $config = array();
    public $api;
    public $index_name = "huoniao";
    public $index_type = "_mappings";
    private $try = 0;
    private $openDebug = true;  // 是否允许debug
    private $init_time = 0;  // 记录初始化时间


    public function __construct($config=array())
    {
        try {
            if(!empty($config)){ // 构造方法传递参数
                $esConfig = $config;
            }else{
                global $esConfig;
                if(!$esConfig['open']){
                    return false;
                }
            }
            $this->config = ['hosts' => ["https://{$esConfig['host']}:{$esConfig['port']}"],'user'=>"{$esConfig['username']}",'pass'=>"{$esConfig['password']}",'ca_path'=>$esConfig['ca_path']];// 初始化
            if(!empty($esConfig['index'])){
                $this->index_name = $esConfig['index'];
            }
        } catch (\Exception $e) {
            if (HUONIAOBUG) {
                echo $e->getMessage();
            }
        }
    }

    // 创建api
    private function initApi(){
        try {
            if(!$this->try){
                //构建客户端对象
                // $this->api = ClientBuilder::create()->setHosts($this->config['hosts'])->setBasicAuthentication($this->config['user'],$this->config['pass'])->setCABundle($this->config['ca_path'])->build();
                $init_start = $this->msTime();
                $this->api = ClientBuilder::create()->setHosts($this->config['hosts'])->setBasicAuthentication($this->config['user'],$this->config['pass'])->setHttpClientOptions(array('connect_timeout'=>1.5))->build();
                $this->init_time = $this->msTime()-$init_start;  // 记录初始化时间
                //更新try
                $this->try = 1;
            }
        } catch (\Exception $e) {
            if (HUONIAOBUG) {
                echo $e->getMessage();
            }
        }
    }

    /**
     * 是否已经初始化
     */
    public function isOk($param=array())
    {
        $check = $param['check']; //  是否为检测连接
        $this->initApi();
        if(!$this->api){
            return false;
        }
        try{
            $version = $this->getVersion();
            return true;
        }catch (\Exception $e){
            // 正常使用时，检测es是否挂掉，如果挂掉自动关闭
            if(!$check){
                $this->serverError($e);
            }
            return false;
        }
    }

    //es错误统一检测
    public function serverError($e,$param=array()){
        $msg = $e->getMessage();
        $return = $param['return'];  // 返回什么格式
        if(strstr($msg,"No alive nodes. All the")){
            global $esConfig;
            global $esConfig_path;
            $esConfig['open'] = 0;
            $text='<?php return '.var_export($esConfig,true).';';
            file_put_contents($esConfig_path,$text);
            if($return=="array"){
                return array("state"=>200,"info"=>"抱歉，系统繁忙，搜索服务暂不可用。");
            }
        }
        return false;
    }

    // 封装param
    public function initParams(): array
    {
        $params['index'] = $this->index_name;
        return $params;
    }

    /**
     * 获取连接信息
     */
    public function getInfo()
    {
        $this->initApi();
        return $this->api->info();
    }

    /**
     * 获取版本信息
     */
    public function getVersion()
    {
        $this->initApi();
        $info = $this->api->info();
        return $info['version'];
    }

    /*************  start Index ******************/
    /**
     * 索引是否存在
     */
    public function indexExist(){
        $this->initApi();
        try {
            $params = $this->initParams();

            $res = $this->api->indices()->exists($params);
            if($res->getStatusCode()==404){
                return false;
            }
        } catch (\Exception $e) {
            if (HUONIAOBUG) {
                echo $e->getMessage();
            }
            return false;
        }
        return true;
    }

    /**
     * 创建 index
     * @return bool
     */
    public function createIndex(): bool
    {
        $this->initApi();
        try {
            $params = $this->initParams();

            $settings = [
                'settings' => [ // 分片和副本数
                    'number_of_shards' => 1, // 分片
                    'number_of_replicas' => 1 // 副本
                ],
                'mappings' => [ // 映射
                    '_source' => [
                        'enabled' => true // 开启即可，否则某些功能不可用
                    ],
                    'properties' => [ // 指定字段的类型或字段属性
                        'aid'=>[ // 资源ID， 如 136
                            'type'=>'long'
                        ],
                        'service'=>[  // 模块名， 如 house
                            'type'=>'keyword'
                        ],
                        'second'=>[  // 子模块名， 如 zu
                            'type'=>'keyword'
                        ],
                        'ss'=>[  // 模块名_子模块名，例如 house_zu ，如果没有子模块，则单模块，例如 article，这个字段在查询中有时方便使用
                            'type'=>'keyword'
                        ],
                        'url'=>[  // 资源URL， 如 http://zfh.215000.com/sz/house/zu-detail-4.html
                            'type'=>"keyword"
                        ],
                        'title' => [ // 标题，主要检索信息，如文章标题 ：  "特斯拉，性价比！ 平安四团蓝湾拎包入住 青年公寓"
                            'type' => 'text', // 数据类型
                            'analyzer' => 'ik_max_word', // 生成倒叙索引分词，尽量细分
                            'search_analyzer' => 'ik_smart'  // 查询分词，尽量精准
                        ],
                        'time' =>[  // 资源时间（一般是发布时间），如 1620452371
                            'type' => 'date',
                            'format' => 'epoch_millis'
                        ],
                        'picture'=>[  // 图片地址URL：如 http://ihuoniao-uploads.oss-cn-hangzhou.aliyuncs.com/house/thumb/large/2017/12/28/15144530226622.jpg?x-oss-process=image/resize,m_fill,w_4096,h_4096
                            'type'=>'keyword'
                        ],
                        'addrName'=>[  // ee 地址列表， 如 ["河北","唐山"]
                            'type'=>'keyword'
                        ],
                        'addrid'=>[
                            'type'=>'integer' // ee  区域 id， 或 区域ID列表
                        ],
                        'price'=>[
                            'type'=>'double'  // ee 价格，整数或小数
                        ],
                        'tag'=>[  // ee 标签列表，如 "初中课程", "高中课程"
                            'type'=>'keyword'
                        ],
                        'userid'=>[  // ee 用户id
                            'type'=>'long',
                        ],
                        'user_name'=>[  // ee 用户名
                            'type'=>'keyword',
                        ],
                        'user_pic'=>[  // ee 用户头像
                            'type'=>'keyword'
                        ],
                        'location'=>[  // 坐标，会自动生成两个属性(lat,lon)，数值例如：[-40, 70]
                            'type'=>'geo_point',
                        ],
                        'star'=>[ // 评分
                            'type'=>'float'
                        ],
                        'tables_join'=>[  // 维护父子文档字段
                            'type'=>'join',
                            'relations'=>[
                                "store"=>"product",  //  商家、商品   ---- 如果是一父多子，后者改为数组即可，如 "store"=>["product","comment"]
                            ]
                        ],
                        'video_pic'=>[
                            'type'=>'keyword'
                        ],
                        'cityid'=>[  // 城市id
                            'type'=>'keyword'
                        ],
                        'comment'=>[
                            'type'=>'keyword'
                        ]
                    ]
                ]
            ];

            $params['body'] = $settings;

            $this->api->indices()->create($params);

        } catch (\Exception $e) {
            if (HUONIAOBUG) {
                echo $e->getMessage();
            }
            return false;
        }
        return true;
    }


    /**
     * 删除index
     */
    public function delIndex(): bool
    {
        $this->initApi();
        try {
            $params = $this->initParams();

            $this->api->indices()->delete($params);

        } catch (\Exception $e) {
            if (HUONIAOBUG) {
                echo $e->getMessage();
            }
            return false;
        }
        return true;
    }

    /**************  end Index ****************/

    /**
     * 判断文档是否存在
     */
    public function exist($id){
        $this->initApi();
        $params = $this->initParams();
        $params['id'] = $id;
        try {
            $params = $this->initParams();
            $params['id'] = $id;

            $res = $this->api->exists($params);
            if($res->getStatusCode()==404){
                return false;
            }
        } catch (\Exception $e) {
            if (HUONIAOBUG) {
                echo $e->getMessage();
            }
            return false;
        }
        return true;
    }


    /*--------------  start 删除文档  ---------------------------*/

    /**
     * 根据唯一id删除
     * @param $id
     * @return bool
     */
    public function delete($id): bool
    {
        $this->initApi();
        try {
            $params = $this->initParams();
            $params['id'] = $id;

            $this->api->delete($params);
        } catch (\Exception $e) {

            if (HUONIAOBUG) {
                echo $e->getMessage();
            }
            return false;
        }
        return true;
    }

    /** 通过ID批量删除，参数为 Ids 数组
     * @param array $ids
     * @return Elasticsearch|false|Promise
     */
    public function delIds(array $ids)
    {
        $this->initApi();
        try {
            if (empty($ids)) return false;

            $params = $this->initParams();
            $body = [];
            foreach ($ids as $k => $v) {
                $body[] = [
                    'delete' => [   #创建
                        '_index' => $params['index'],
                        '_id' => $v
                    ]
                ];
            }

            $params['body'] = $body;

            $res = $this->api->bulk($params);

        } catch (\Exception $e) {
            if (HUONIAOBUG) {
                echo $e->getMessage();
            }
            return false;
        }
        return $res;
    }

    /** 删除查询到的数据
     * @param array $args
     * @return Elasticsearch|false|Promise
     */
    public function deleteByQuery(array $args)
    {
        $this->initApi();
        try {

            $param = $this->initParams();

            $param['body'] = $args;

            $this->api->deleteByQuery($param);

        } catch (\Exception $e) {
            if (HUONIAOBUG) {
                echo $e->getMessage();
            }
            return false;
        }
        return true;
    }

    /**
     * 删除指定条件
     * 指定模块、或子模块、或全部删除
     */
    public function delByCondition(array $params = array()){
        // 取出参数
        $md = $params['md'];
        $all = $params['all'];
        $second = $params['second'];
        if($all=="" && $md==""){
            return false;
        }
        // 清空全部
        if($all!=""){
            if($this->indexExist()){
                $bool1 = $this->delIndex();
            }
            return $this->createIndex();
        }
        $mustArr = array();
        // 指定模块
        if($md!=""){
            array_push($mustArr, array(
                "match" => [
                    "service" => $md
                ]
            ));
            // 指定子模块
            if ($second) {
                array_push($mustArr, array(
                    "match" => [
                        "second" => $second
                    ]
                ));
            }
        }

        $args = [
            'query' => [
                'bool' => [
                    'must' => $mustArr
                ]
            ],
            'conflicts'=>'proceed'
        ];
        return $this->deleteByQuery($args);
    }

    /***********   删除文档  end *************************/


    /*****************   start  插入、更新文档   **********************/

    /**
     * 向索引中插入、更新一条数据
     * @param array $data
     * @param string $id
     * @return bool
     */
    public function update(array $data = [], string $id = ""): bool
    {
        $this->initApi();
        try {
            $params = $this->initParams();
            !empty($id) && $params['id'] = $id;
            $params['body'] = $data;
            $params['routing'] = 1;

            $res = $this->api->index($params);
        } catch (\Exception $e) {
            if (HUONIAOBUG) {
                echo $e->getMessage();
            }
            return false;
        }
        return true;
    }


    /**
     * 批量插入、更新数据
     * @param array $args
     */
    public function indexAll(array $args)
    {
        $this->initApi();
        try {
            if (empty($args)) return false;

            $params = $this->initParams();
            $body = [];
            foreach ($args as $k => $v) {
                // 在这里的设计逻辑中，必须存在 _id
                if (empty($v['_id'])) {
                    return "缺少ID";
                }
                // 插入 index 和 id
                $body[] = [
                    'index' => [
                        '_index' => $params['index'],
                        '_id' => $v['_id']
                    ]
                ];
                unset($v['_id']); // 这里务必删除$v['id']，否则无法正常
                // 插入数据
                $body[] = $v;
            }

            $params['body'] = $body;
            $params['routing'] = 1;

            $res = $this->api->bulk($params);
            // $res['items']

        } catch (\Exception $e) {
            if (HUONIAOBUG) {
                echo $e->getMessage();
            }
            return false;
        }
        return true;
    }

    /*****************   插入、更新文档  end  **********************/
    /*****************  start 获取文档  ********************/

    /**
     * 根据唯一id查询数据
     * @param $id
     * @return array
     */
    public function getById($id): array
    {
        $this->initApi();
        try {
            $params = $this->initParams();
            $params['id'] = $id;

            $res = $this->api->get($params);
            $res = $res->asArray();
            if (!empty($res)) {
                $res = ['id' => $res['_id']] + $res['_source'];
            }

        } catch (\Exception $e) {
            if (HUONIAOBUG) {
                echo $e->getMessage();
            }
            $res = [];  // 数据不存在
        }
        return $res;
    }

    // 首页查询
    public function search_index(array $params = array()): array
    {
        $cityid = $params['cityid'];
        $key = $params['keyword'];
        $lat = $params['lat'];
        $lng = $params['lng'];
        // 返回对象
        $pageInfo = array('totalCount'=>0,'init'=>0,'took'=>0,'deal_with'=>0);
        $list = array();
        // 相关商家
        $search_item = $this->search(array('page'=>1,'pageSize'=>2,'lat'=>$lat,'lng'=>$lng,'parent'=>1,'keyword'=>$key,'cityid'=>$cityid,'module'=>'waimai_store,tuan_store,shop_store,travel_store,renovation_store,education_store,homemaking_store,car_store,pension_store,travel_hotel,marry_hstore,marry_nhstore,house_zjCom,dating_store'));
        $si_info = & $search_item['pageInfo'];
        $si_list = & $search_item['list'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        $list['business'] = $si_list;
        // 相关优惠
        $search_item = $this->search(array('page'=>1,'debug'=>1,'pageSize'=>2,'lat'=>$lat,'lng'=>$lng,'parent'=>1,'keyword'=>$key,'cityid'=>$cityid,'justChild'=>1,'module'=>'shop_store,travel_store,travel_hotel,homemaking_store,education_store'));
        $si_info = & $search_item['pageInfo'];
        $si_list = & $search_item['list'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        $list['youhui'] = $si_list;
        // 商城
        $search_item = $this->search(array('page'=>1,'pageSize'=>3,'lat'=>$lat,'lng'=>$lng,'keyword'=>$key,'cityid'=>$cityid,'module'=>'shop_product'));
        $si_info = & $search_item['pageInfo'];
        $si_list = & $search_item['list'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        $list['shop'] = $si_list;
        // 相关资讯（自媒体）
        $search_item = $this->search(array('page'=>1,'pageSize'=>1,'lat'=>$lat,'lng'=>$lng,'keyword'=>$key,'cityid'=>$cityid,'module'=>'article_selfmedia'));
        $si_info = & $search_item['pageInfo'];
        $si_list = & $search_item['list'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        $list['article'] = $si_list;
        // 相关资讯（新闻列表）
        $search_item = $this->search(array('page'=>1,'pageSize'=>3,'lat'=>$lat,'lng'=>$lng,'keyword'=>$key,'cityid'=>$cityid,'module'=>'article_list,paper'));
        $si_info = & $search_item['pageInfo'];
        $si_list = & $search_item['list'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        $list['article'] = array_merge($list['article'],$si_list);
        // 相关招聘（商家）
        $search_item = $this->search(array('page'=>1,'pageSize'=>2,'lat'=>$lat,'lng'=>$lng,'keyword'=>$key,'cityid'=>$cityid,'module'=>'job_company'));
        $si_info = & $search_item['pageInfo'];
        $si_list = & $search_item['list'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        $list['job'] = $si_list;
        // 相关招聘（职位）
        $search_item = $this->search(array('page'=>1,'pageSize'=>2,'lat'=>$lat,'lng'=>$lng,'keyword'=>$key,'cityid'=>$cityid,'module'=>'job_post'));
        $si_info = & $search_item['pageInfo'];
        $si_list = & $search_item['list'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        $list['job'] = array_merge($list['job'],$si_list);
        // 相关用户
        $search_item = $this->search(array('page'=>1,'pageSize'=>2,'lat'=>$lat,'lng'=>$lng,'keyword'=>$key,'cityid'=>$cityid,'module'=>'member,article_selfmedia,house_zjUser,dating_hn'));
        $si_info = & $search_item['pageInfo'];
        $si_list = & $search_item['list'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        $list['member'] = $si_list;
        // 相关活动
        $search_item = $this->search(array('page'=>1,'pageSize'=>2,'lat'=>$lat,'lng'=>$lng,'keyword'=>$key,'cityid'=>$cityid,'module'=>'huodong'));
        $si_info = & $search_item['pageInfo'];
        $si_list = & $search_item['list'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        $list['huodong'] = $si_list;
        // 小区
        $search_item = $this->search(array('page'=>1,'pageSize'=>3,'lat'=>$lat,'lng'=>$lng,'keyword'=>$key,'cityid'=>$cityid,'module'=>'house_community'));
        $si_info = & $search_item['pageInfo'];
        $si_list = & $search_item['list'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        $list['house_community'] = $si_list;
        // 楼盘
        $search_item = $this->search(array('page'=>1,'pageSize'=>3,'lat'=>$lat,'lng'=>$lng,'keyword'=>$key,'cityid'=>$cityid,'module'=>'house_loupan'));
        $si_info = & $search_item['pageInfo'];
        $si_list = & $search_item['list'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        $list['house_loupan'] = $si_list;
        // 房产频道
        $search_item = $this->search(array('page'=>1,'pageSize'=>3,'lat'=>$lat,'lng'=>$lng,'keyword'=>$key,'cityid'=>$cityid,'module'=>'house_sale,house_zu,house_xzl,house_sp,house_cf,house_cw'));
        $si_info = & $search_item['pageInfo'];
        $si_list = & $search_item['list'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        $list['house'] = $si_list;
        // 汽车频道
        $search_item = $this->search(array('page'=>1,'pageSize'=>2,'lat'=>$lat,'lng'=>$lng,'keyword'=>$key,'cityid'=>$cityid,'module'=>'car_list'));
        $si_info = & $search_item['pageInfo'];
        $si_list = & $search_item['list'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        $list['car'] = $si_list;
        // 相关内容_全部（只统计数量）
        $search_item = $this->search(array('page'=>1,'pageSize'=>1,'lat'=>$lat,'lng'=>$lng,'keyword'=>$key,'cityid'=>$cityid,'parent'=>1,'module'=>'video,live,info,circle,tieba,travel_strategy,travel_video,renovation_case'));
        $si_info = & $search_item['pageInfo'];
        $pageInfo['totalCount'] += $si_info['totalCount'];
        $pageInfo['took'] += $si_info['took'];
        $pageInfo['deal_with'] += $si_info['deal_with'];
        // 构造最终对象并返回
        $pageInfo['init'] += $this->init_time;
        $pageObj['pageInfo'] = $pageInfo;
        $pageObj['list'] = $list;
        return $pageObj;
    }

    //优惠查询
    public function search_youhui(array $params=array()): array
    {
        $cityid = $params['cityid'];
        $key = $params['keyword'];
        $page = $params['page'];
        $pageSize = $params['pageSize'];
        $search_item = $this->search(array('page'=>$page,'pageSize'=>$pageSize,'keyword'=>$key,'cityid'=>$cityid,'module'=>'shop_product,homemaking_list,education_list,travel_ticket,travel_hotel,travel_daytravel,travel_grouptravel'));

        //数据处理
        $list = & $search_item['list'];
        foreach ($list as & $item){
            $item['columns'] = $item['columns'] ?: array();
            $item['columns']['tag'] = $item['columns']['tag'] ?: "";
            $item['columns']['sales'] = $item['columns']['sales'] ?: 0;
            $item['columns']['price'] = $item['columns']['price'] ?: 0;
            $item['columns']['mprice'] = $item['columns']['mprice'] ?: 0;
            $item['columns']['typename'] = $item['columns']['typename'] ?: "";
            if($item['ss']=="shop_product"){
                if($item['columns']['pintuanhtype']==1){
                    $item['columns']['typename']="拼团";
                }
                elseif($item['columns']['moduletype']==0){
                    $item['columns']['typename']="团购";
                }
            }
            elseif($item['ss']=="homemaking_list"){
                $item['columns']['sales'] = $item['columns']['sale'] ?: 0;
                $item['columns']['tag'] = $item['columns']['flag'] ?: "";
            }
            elseif($item['ss']=="travel_ticket"){
                $item['columns']['tag'] = $item['columns']['typename'] ? str_replace("|"," ",$item['columns']['typename']) : "";
                $item['columns']['typename'] = $item['columns']['flag'] ? $item['columns']['flag']."A级景点" :"景点门票";
            }
            elseif($item['ss']=="travel_hotel"){
                $item['columns']['tag'] = $item['columns']['typename'] ?: "";
                $item['columns']['typename'] = "星级酒店";
            }
            elseif($item['ss']=="travel_daytravel"){
                $item['columns']['tag'] = $item['columns']['typename'] ? str_replace("|"," ",$item['columns']['typename']) : "";
                $item['columns']['typename'] = "一日游";
            }
            elseif($item['ss']=="travel_grouptravel"){
                $item['columns']['tag'] = $item['columns']['typename'] ? str_replace("|"," ",$item['columns']['typename']) : "";
                $item['columns']['typename'] = "跟团游";
            }
        }
        return $search_item;
    }

    /**
     * 全站搜索
     */
    public function search(array $params = array()): array
    {
        $this->initApi();
        $before_start = $this->msTime();  // 开始处理时间
        // 取出参数
        $key = trim($params['keyword']);   // 查找关键字
        $stime = (int)$params['stime'];  // 限定开始时间
        $etime = (int)$params['etime'];  // 限定结束时间
        $md = $params['module'];    // 指定模块
        $md = str_replace(" ","",$md); // 去除空格
        $md = explode(",",$md);
        $md = array_unique($md);  // 取唯一值
        $md = array_filter($md);  // 过滤空
        $parent = $params['parent'];  // 是否使用父子关系结构
        $justParent = $params['justParent'];  // 父子结构，只匹配父文档
        $justChild = $params['justChild'];  // 父子结构，只匹配子文档
        $cityid = (int)$params['cityid'];  // 取得cityid
        $addrid = (int)$params['addrid'];  // 是否筛选区域ID
        global $userLogin;
        $userid = $userLogin->getMemberID();

        //分站数据共享
        include HUONIAOINC . '/config/' . $md . '.inc.php';
        global $customDataShare;
        $dataShare = (int)$customDataShare;
        if($dataShare == 0){
            if(!$cityid){
                $cityid = (int)getCityId();  // 尝试自动获取cityid
            }
            if(!$cityid){
                return array("state"=>200,"info"=>"城市ID必传。");
            }
        }else{
            $cityid = 0;
        }

        if($parent){
            $parentArr = $this->getInstallModule(array('parent'=>1,'description'=>false)); // 取得所有应该排除的子模块
            // 取得父模块ss
            $parents = array_column($parentArr,"parent");
            $parents = array_column($parents,"ss");
            $parents_unq = array_values(array_unique($parents));
            // 取得子模块ss
            $sons = array_column($parentArr,"son");
            $sons = array_column($sons,"ss");
            $sons_unq = array_values(array_unique($sons));
        }
        $pic = (int)$params['pic']; // 只要带图片的
        if($pic){
            $md = $this->getInstallModule(array('pic'=>1,'description'=>false));  // 指定带图时，固定模块，也就是传递的模块参数失效。
        }
        $video = (int)$params['video']; // 只要带视频的
        if($video){
            $md = $this->getInstallModule(array('video'=>1,'description'=>false));  // 指定带视频时，固定模块，也就是传递的模块参数失效。
        }
        $searchMds = count($md);  // 计算查询的模块数量
        $page = (int)$params['page'] ?: 1;  // 当前页数
        $pageSize = (int)$params['pageSize'] ?: 10;  // 每页条数
        $ordertype = (int)($params['ordertype']  ?? 1);  // 0或1.按匹配度倒序，2.按时间倒序，3.按距离升序
        $lat = $params['lat'];
        if($ordertype==3 && empty($lat)){
            return array("state"=>200,"info"=>"缺少参数：lat");
        }
        $lng = $params['lng'];
        if($ordertype==3 && empty($lng)){
            return array("state"=>200,"info"=>"缺少参数：lng");
        }
        $count = (int)$params['tongji'] ?: 0;  // 是否需要统计
        $start = ($page - 1) * $pageSize;
        if($start>=10000){
            return array("info"=>"起始值不得超过1w","state"=>200);
        }
        $mustNotArr = array();
        if($parent){
            array_push($mustNotArr, array(
                "bool" => [
                    "must" => array(
                        "terms"=>["ss"=>$sons_unq]
                    )
                ]
            ));
        }
        $filterArr = array();
        // 指定模块（统计时无效）
        if ($md && !$count) {
            $shouMds = array();
            foreach ($md as $item){
                $item_second = explode("_",$item);
                //没有指定子模块
                if(count($item_second)==1){
                    array_push($shouMds, array(
                        "match" => [
                            "service" => $item
                        ]
                    ));
                }
                //指定子模块
                else{
                    array_push($shouMds, array(
                        "bool" => [
                            "must" => array(
                                array(
                                    "match"=>["service"=>$item_second[0]]
                                ),
                                array(
                                    "match"=>['second'=>$item_second[1]]
                                )
                            )
                        ]
                    ));
                }
            }
            array_push($filterArr, array(
                'bool'=>array(
                    "should"=>$shouMds
                )
            ));
        }
        // 城市筛选
        if($cityid){
            array_push($filterArr,array(
               'bool'=>[
                   'must'=>[
                       'terms'=>['cityid'=>array($cityid,0)]
                   ]
               ]
            ));
        }
        // 区域ID
        if($addrid){
            array_push($filterArr,array(
                'bool'=>[
                    'must'=>[
                        'terms'=>['addrid'=>array($addrid,0)]
                    ]
                ]
            ));
        }
        // 指定开始时间
        if ($stime) {
            array_push($filterArr, array(
                "range" => [
                    "time" => [
                        "gte" => $stime
                    ]
                ]
            ));
        }
        // 指定结束时间
        if ($etime) {
            array_push($filterArr, array(
                "range" => [
                    "time" => [
                        "lte" => $etime
                    ]
                ]
            ));
        }
        $mustArr = array();
        // 只要带图片的，字段过滤
        if($pic){
            array_push($mustArr, array(
                "exists" => [
                    "field" => "picture"
                ]
            ));
        }
        // 只要带视频的，字段过滤
        if($video){
            array_push($mustArr, array(
                "exists" => [
                    "field" => "video_pic"
                ]
            ));
        }
        $shouArr = array();
        // 指定关键字
        if ($key) {
            // 非父子关系时，只是简单的 match 文档即可
            if(!$parent){
                array_push($mustArr, array(
                    'match' => [
                        'title' => $key
                    ]
                ));
            }
            // 父子关系文档，要么 match 父文档，要么 match 子文档，具体语法：：模块=父模块 && （(父模块匹配 && 子模块无条件匹配) || 子模块匹配）
            else{
                $msArr = array();
                // 不等于父模块时，匹配 key （并非只匹配子模块）
                if(!$justChild){
                    array_push($msArr,array(
                        'bool'=>array(
                            'must'=>array(
                                'bool'=>array(
                                    'must_not'=>array(
                                        "terms"=>["ss"=>$parents_unq]
                                    )
                                ),
                                'bool'=>array(
                                    'must'=>array(
                                        'match'=>array(
                                            'title'=>$key
                                        )
                                    )
                                )
                            )
                        )
                    ));
                }
                // 是父模块时，分两种情况（一、父模块匹配key则无条件匹配子。 二、子模块匹配key）
                $parent_children = array();
                // 并非只查询父文档，则把子文档匹配
                if(!$justParent){
                    array_push($parent_children,array(  // 子文档匹配
                        'bool'=>array(
                            'must'=>array(
                                'has_child'=>array(
                                    'type'=>"product",
                                    'query'=>[
                                        'bool'=>[
                                            'must'=>[
                                                'match'=>[
                                                    'title'=>$key
                                                ]
                                            ]
                                        ]
                                    ],
                                    'inner_hits'=>[
                                        'size'=>'3',
                                    ]
                                ),
                            )
                        )
                    ));
                }
                // 并非只查询子文档，则把父文档匹配
                if(!$justChild){
                    array_push($parent_children,array(
                        'bool'=>array(
                            'must'=>array(
                                array(
                                    'match'=>array(
                                        'title'=>$key
                                    )
                                ),
                                array(
                                    "has_child"=>array(
                                        'type' => "product",
                                        'query'=>[
                                            'match_all'=>(object)[]  // 注意这是个坑，这里必须使用 object，而不能是数组
                                        ],
                                        'inner_hits'=>[
                                            'size'=>'5',
                                            'name'=>'product2'
                                        ]
                                    )
                                )
                            )
                        ),
                    ));
                }
                // 父子查询条件
                array_push($msArr, array(
                    'bool'=>array(
                        "must"=>array(
                            array(
                                "terms"=>["ss"=>$parents_unq]
                            ),
                            array(
                                'bool'=>array(
                                    'should'=>$parent_children
                                )
                            )
                        )
                    )
                ));
                array_push($mustArr,array(
                    'bool'=>array(
                        'should' => $msArr
                    )
                ));
            }
        }
        // 没有指定关键字，但是指定了父子关系，要搜素子文档（即使不存在子文档，也要返回父文档，此时应该用 should ，也就是条件 has_child 可以不成立）
        elseif($parent){
            // 不等于父模块时，不需要其他条件
            array_push($shouArr,array(
                'bool'=>array(
                    'must_not'=>array(
                        "terms"=>["ss"=>$parents_unq]
                    )
                )
            ));
            // 等于父模块时，要无条件查询子模块
            array_push($shouArr, array(
                'bool'=>array(
                    "must"=>array(
                        array(
                            "terms"=>["ss"=>$parents_unq]
                        ),
                        array(
                            "has_child"=>array(
                                'type' => "product",
                                'query'=>[
                                    'match_all'=>(object)[]  // 注意这是个坑，这里必须使用 object，而不能是数组
                                ],
                                'inner_hits'=>[
                                    'size'=>'3'
                                ]
                            )
                        )
                    )
                )
            ));
        }
        $sortArr = [  // 默认排序
            [
                "_score" => [
                    "order" => "desc"
                ]
            ],
            [
                "time" => [
                    "order" => "desc"
                ]
            ]
        ];
        if($ordertype==2){
            $sortArr = [  // 时间倒序
                [
                    "time" => [
                        "order" => "desc"
                    ]
                ],
                [
                    "_score" => [
                        "order" => "desc"
                    ]
                ]
            ];
        }
        //按地理位置升序
        elseif($ordertype==3){
            $sortArr = [
                [
                    "_geo_distance"=>[
                        "location"=>[
                            "lat"=>"$lat",
                            "lon"=>"$lng",
                        ],
                        "order"=>"asc",
                        "unit"=>"km"
                    ]
                ],
                [
                    "time" => [
                        "order" => "desc"
                    ]
                ],
                [
                    "_score" => [
                        "order" => "desc"
                    ]
                ]
            ];
        }
        $args = [
            "profile" => false,  // 如果需要分析过程，则使用true
//            "track_total_hits"=> true,  // 是否返回真实的总数，默认返回模糊数，例如 14532, 会返回 10000， 返回的 relation 如果为eq则说明是精准匹配，gte为大于等于
            "from" => $start,
            "size" => $pageSize,
            'query' => [
                'bool' => [
                    'must_not' => $mustNotArr,
                    'filter' => $filterArr,
                    'must' => $mustArr,
                    'should' => $shouArr
                ]
            ],
            "sort" => $sortArr
        ];
        // 如果统计，则指定数据量为：1w 条
        if($count && $searchMds<=1){
            unset($args['from']);
            $args['size'] = 10000;
        }
        $param = $this->initParams();
        if (!empty($args)) {
            $param['body'] = $args;
        }
        $debug = (int)$params['debug']; // 调试dsl，可直接在kiBanNa查询
        if($this->openDebug && $debug){
            $debugStr = "POST {$param['index']}/_search".PHP_EOL;//生成调试头
            $debugStr .= preg_replace_callback ('/^ +/m', function ($m) {
                return str_repeat (' ', strlen ($m[0]) / 2);
            }, json_encode ($args, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE)); //生成调试查询语句，指定2个空格缩进
            file_put_contents(HUONIAOROOT."/log/0000_es_debug.txt",$debugStr); //输出到txt文本
        }
        $before_end = $this->msTime();  // 前置处理结束
        try{
            $res = $this->api->search($param);
        }catch (Exception $e){
            return $this->serverError($e,array('return'=>'array'));
        }
        $after_start = $this->msTime();  // 后置处理开始
        // 关键字查询统计
        if($key){
            if($searchMds>1){
                siteSearchLog('siteConfig',$key);
            }else{
                $md_item = explode("_",$md[0]);
                $justModule = $md_item[0];
                siteSearchLog($justModule,$key);
            }
        }
        // 取得list
        $list = $res['hits']['hits'];
        $newList = array();
        // 如果统计，取得所有安装模块（仅限单模块时）
        if($searchMds<=1 && $count){
            $mds = $this->getInstallModule(array('sub'=>false,'number'=>false));
            $md = $md[0];
            $md_second = explode("_",$md);
            $md = $md_second[0];
            $second = $md_second[1];
        }
        foreach ($list as $k => $v) {

            $item = array();
            // 1.返回es_id
            $item['id'] = $v['_id'];
            // 2.返回模块
            $item['module'] = $v['_source']['service'];
//            $item['moduleName'] = getModuleTitle(array('name' => $v['_source']['service']));
            // 3.返回子模块，如果存在
            if($v['_source']['second']){  // 子模块
                $item['second'] = $v['_source']['second'];
            }
            $item['ss'] =  $v['_source']['ss'];
            // 4.返回图片，如果存在
            $item['pic_num'] = $v['_source']['pic_num'];
            $item['picture'] = $v['_source']['picture'] ?: "";  // 图片不存在返回空字符串
            // 5.返回标题
            $item['title'] = $v['_source']['title'];
            // 6.返回时间
            $item['time'] = (int)$v['_source']['time'];
            // 7.返回资源url
            if($v['_source']['url']){
                $item['url'] = $v['_source']['url'];
            }
            // 8.返回模块特有字段（如果存在）
            $common = $this->asyncCommon($v['_source']['service'],$v['_source']['second']);
            $columns = $common['columns'];  // 显示字段
            foreach ($columns as $val){
                $item['columns'][$val] = $v['_source'][$val];
                if($val=="user_name" || $val=="user_pic"){
                    $item['columns'][$val] = $item['columns'][$val] ?: "";
                }
            }
            //9.计算距离（如果存在）
            $loc = $v['_source']['location'];
            if($loc && $lat && $lng){
                if($loc=="0, 0"){
                    $loc=-1;
                }else{
                    $loc = explode(",",$loc);
                    $loc=oldgetDistance($loc[1],$loc[0],$lng,$lat); // 单位为m
                }
                $item['columns']['location'] = $loc;
            }
            // 10.视频封面（如果存在）
            if(!is_null($v['_source']['video_pic'])){
                $item['picture'] = $v['_source']['video_pic'];
                $item['hasVideo'] = true;
            }
            else{
                $item['hasVideo'] = false;
            }
            //用户模块，是否已关注
            if($v['_source']['ss']=="member" || $v['_source']['ss']=="member" || $v['_source']['ss']=="member" || $v['_source']['ss']=="member"){
                if($userid>0){
                    global $dsql;
                    $sql = $dsql->SetQuery("select count(`id`) from `#@__member_follow` f where f.`fid`={$v['_source']['uid']} and tid=$userid");
                    $is_follow = (int)$dsql->getOne($sql);
                }
                $item['columns']['is_follow'] = $is_follow ?: 0;
            }
            //活动，是否已报名
            if($v['_source']['ss']=="huodong"){
                if($userid>0){
                    global $dsql;
                    $sql = $dsql->SetQuery("select count(`id`) from `#@__huodong_reg` f where f.`hid`={$v['_source']['aid']} and uid=$userid and state=1");
                    $is_baoming = (int)$dsql->getOne($sql);
                }
                $item['columns']['is_baoming'] = $is_baoming ?: 0;
            }
            // 是否存在子文档
            $newChild = $children = array();
            $childrenTotal = 0;
            if($v['inner_hits']){
                if($v['inner_hits']['product']['hits']['total']['value']>0){
                    $children = $v['inner_hits']['product']['hits']['hits'];
                    $childrenTotal = $v['inner_hits']['product']['hits']['total']['value'];
                }
                elseif($v['inner_hits']['product2']['hits']['total']['value']>0){
                    $children = $v['inner_hits']['product2']['hits']['hits'];
                    $childrenTotal = $v['inner_hits']['product2']['hits']['total']['value'];
                }
                //格式化子元素
                if($children){
                    $newChild = array();
                    foreach ($children as $child){
                        $newChild_item = array();
                        $newChild_item['id'] = $child['_id'];
                        $newChild_item['module'] = $child['_source']['service'];
                        if($child['_source']['second']){
                            $newChild_item['second'] = $child['_source']['second'];
                        }
                        $newChild_item['ss'] =  $child['_source']['ss'];
                        $newChild_item['pic_num'] = $child['_source']['pic_num'];
                        $newChild_item['picture'] = $child['_source']['picture'] ?: "";
                        $newChild_item['title'] = $child['_source']['title'];
                        $newChild_item['time'] = (int)$child['_source']['time'];
                        if($child['_source']['url']){
                            $newChild_item['url'] = $child['_source']['url'];
                        }
                        $common2 = $this->asyncCommon($child['_source']['service'],$child['_source']['second']);
                        $columns2 = $common2['columns'];  // 显示字段
                        foreach ($columns2 as $val2){
                            $newChild_item['columns'][$val2] = $child['_source'][$val2];
                            if($val2=="user_name" || $val2=="user_pic"){
                                $child['columns'][$val2] = $child['columns'][$val2] ?: "";
                            }
                        }
                        if(!is_null($child['_source']['video_pic'])){
                            $newChild_item['picture'] = $child['_source']['video_pic'];
                            $newChild_item['hasVideo'] = true;
                        }
                        else{
                            $newChild_item['hasVideo'] = false;
                        }
                        $newChild[] = $newChild_item;
                    }
                }
            }
            $item['children']['total'] = $childrenTotal;
            $item['children']['list'] = $newChild;
            // end.1.如果不需要统计
            if(!$count || $searchMds>1){
                $newList[] = $item;
            }
            // end.2.如果需要统计，则进行一些额外操作（仅限单模块）
            else{
                $mds[$v['_source']['service']]['count'] = (int)$mds[$v['_source']['service']]['count'] +1;
                if($md){ // 如果指定了模块
                    if($second){  // 如果指定了子模块，只返回符合子模块的数据
                        if($md==$v['_source']['service'] && $second==$v['_source']['second']){
                            // 提取子模块数据
                            $newList[] = $item;
                        }
                    }else{
                        if($md==$v['_source']['service']){
                            //提取模块数据
                            $newList[] = $item;
                        }
                    }
                }else{ // 提取全部数据
                    $newList[] = $item;
                }
            }
        }
        // 构建pageInfo
        if(!$count || $searchMds>1){
            $totalCount = $res['hits']['total']['value'];
            if($totalCount>10000){  // 如果大于1w条，结果页强制返回1w
                $totalCount = 10000;
            }
        }else{
            $totalCount = count($newList);  // 统计时，这里的total分页为实际数量
        }
        $totalPage = ceil($totalCount / $pageSize);
        $pageInfo['page'] = $page;
        $pageInfo['pageSize'] = $pageSize;
        $pageInfo['totalCount'] = $totalCount;
        $pageInfo['totalPage'] = $totalPage;
        $pageInfo['init'] = $this->init_time;  //初始化处理的时间（初始化连接时长意味着每次连接es都需要这么多时间）
        $pageInfo['took'] = $res['took'];  // 本次ES查询毫秒值
        $pageInfo['deal_with'] = $before_end-$before_start + $this->msTime()-$after_start;  // php 处理时间
        // 构建pageObj
        $pageObj['pageInfo'] = $pageInfo;
        // 如果统计，进行统计处理，修改 pageObj，以及 newList
        if($count && $searchMds<=1){
            // 1.取得所有存在数据的模块，返回统计结果
            $showMds['total'] = $res['hits']['total']['value'];
            foreach ($mds as $k=>$v){
                if($v['count']>0){
                    $showMds[$k] = $v['count'];
                }
            }
            $pageObj['tongji'] = $showMds;
            // 2.数据截取
            $newList = array_slice($newList,$start,$pageSize);
        }
        $pageObj['list'] = $newList;
        return $pageObj;
    }

    //取得当前毫秒
    public function msTime() {

        list($msec, $sec) = explode(' ', microtime());

        return (float)sprintf('%.0f', (floatval($msec) + floatval($sec)) * 1000);
    }

    /***********  获取文档  end  ****************/

    /**
     * 返回所有已经注册的模块，规范处理，其中 sql 为 listSql，也就是先获取基础列表，如果是获取指定 id 的sql，则自动拼接 ids 参数（英文 ? 为id占位符），该 id 为 aid
     * 要获取模块名，可使用函数如： getModuleTitle(['name'=>'article'])
     * 一级分类： module, sql template
     * 二级分类： module, second, 其中 second 有包含上面的一级分类（比一级模块可能多一些参数，比如 description 为二级描述）
     *
     * 图片处理：'is_pic'=>true，指定为图片,'pic_multi'=>true，进一步标识为多图，另外 pic_split 进一步指定如何分割多图
     *
     * 模块特有字段：columns，多个值用 , 分开。
     *
     * 临时字段：这些字段在listSql中使用，而最终不需要存储，添加在 clear 字段中，多个值使用 , 分开
     *
     * 模块函数处理：传递 function => true，默认调用 module_ 拼接 es_name，例如 module_house_loupan ， 或 module_article
     *
     * 模块父子关系，有父子关系的模块，都在一个顶级模块中，也就是通常二级不同，使用 parent 标识父类的二级(如果有多个用,分割，并在listSql中指定真正的 parent )，在listSql中指定 parent_id ， 在父级的 listSql 中指定 'store' as 'tables_join'
     *
     */
    public function getRegisterModule(): array
    {
        return array(
            'info' => [
                'module' => 'info',
                'sql'=>"select l.`longitude` 'lng',l.`latitude` 'lat',l.`address`,m.`nickname` 'user_name',m.`photo` 'user_pic',l.`title`,l.`cityid`,l.`pubdate` 'time',l.`id` 'aid',t.`typename` 'tag',(select p.`picPath` from `#@__infopic` p where p.`aid`=l.`id` limit 1) 'picture' from `#@__infolist` l LEFT JOIN `#@__infotype` t ON l.`typeid`=t.`id`  LEFT JOIN `#@__member` m ON l.`userid`=m.`id`  where l.`arcrank`=1 and l.`del` = 0 and l.`waitpay` = 0 AND (l.`valid` > unix_timestamp(current_timestamp) AND l.`valid` <> 0)",
                'ids'=>'and l.`id` in(?)',
                'template' => 'detail',
                'second'=>false,
                'columns'=>'tag,user_name,user_pic,address',
                'function'=>true
            ],
            'sfcar' => [
                'module' => 'sfcar',
                'sql' => "select `title`,`cityid`,`pubdate` 'time',`id` 'aid',`startaddr`,`endaddr`,`missiontype`,`missiontime`,`carseat` from `#@__sfcar_list` where `state`=1",
                'template'=>'detail',
                "ids"=>'and `id` in(?)',
                'second'=>false,
                'columns'=>"startaddr,endaddr,missiontype,missiontime,carseat"
            ],
            'article'=>[
                'module'=>'article',
                'second'=>[
                    'list'=>[
                        'second'=>'list',
                        'description'=>'新闻',
                        'sql' => "select `title`,`writer` 'author',`cityid`,`pubdate` 'time',`id` 'aid',`litpic` 'picture',`litpic` 'video_pic',`typeid`,`click`,`videourl` from `#@__articlelist_all` where `arcrank`=1 and `del`=0 and `waitpay`=0 and `media_state`=1",
                        "ids"=>"and `id` in(?)",
                        'template'=>'detail',
                        'columns'=>'typeid,typename,click,author',
                        'function'=>true
                    ],
                    'selfmedia'=>[
                        'second'=>'selfmedia',
                        'description'=>'自媒体',
                        'sql'=>"SELECT `userid` 'uid',`cityid`,`id` 'aid',`ac_name` 'title',`pubdate` 'time',`ac_photo` 'picture',`ac_profile` 'description' FROM `#@__article_selfmedia` WHERE `state` = 1",
                        "ids"=>"and `id` in(?)",
                        'template'=>'mddetail',
                        'columns'=>'description,uid',
                    ]
                ],
            ],
            'circle'=>[
                'module'=>'circle',
                'sql' => "SELECT m.`nickname` 'user_name',m.`photo` 'user_pic',c.`addrname` 'address',c.`id` 'aid',c.`lat`,c.`lng`,c.`content` 'title',c.`addtime` 'time',c.`picadr` 'picture',c.`videoadr` 'videourl',c.`thumbnail` 'video_pic' FROM `#@__circle_dynamic_all` c LEFT JOIN `#@__member` m ON c.`userid`=m.`id` WHERE c.`state` = 1",
                "ids"=>"and c.`id` in(?)",
                'template'=>'blog_detail',
                'columns'=>'address,user_name,user_pic',
                'function'=>true,
                'second'=>false
            ],
            'house'=>[
                'module'=>'house',
                'second'=>[
                    'loupan'=>[
                        'second'=>'loupan',
                        'description'=>'楼盘',
                        'sql' => "select `salestate`,`buildtype`,`title`,`cityid`,`pubdate` 'time',`id` 'aid', `litpic` 'picture',`price`,`ptype`,`addrid` from `#@__house_loupan` where `state`=1",
                        'ids' => 'and `id` in(?)',
                        'template' => 'loupan-detail',
                        'columns' => 'price,ptype,addrid,addrName,hx_room,hx_area,buildtype,salestate,price_unit',
                        'function' => true
                    ],
                    'sale'=>[
                        'second'=>'sale',
                        'description'=>'二手房',
                        'sql'=>"select `addrid`,`title`,`cityid`,`pubdate` 'time',`id` 'aid',`litpic` 'picture',`price`,`communityid`,`community`,`usertype`,`userid`,`unitprice`,`area`,`direction`,`room`,`hall` from `#@__house_sale` where `state`=1",
                        'ids'=>'and `id` in(?)',
                        'template' => 'sale-detail',
                        'columns' => 'addrid,addrName,communityid,community,price,unitprice,area,direction,room,hall,price_unit',
                        'clear'=>'usertype,userid',
                        'function'=>true,
                        'parent'=>'zjCom'
                    ],
                    'zu'=>[
                        'second'=>'zu',
                        'description'=>'租房',
                        'sql'=>"select `title`,`cityid`,`pubdate` 'time',`id` 'aid',`litpic` 'picture',`addrid`,`usertype`,`userid`,`communityid`,`price`,`area` from `#@__house_zu` where `state`=1",
                        "ids"=>"and `id` in(?)",
                        'template'=>'zu-detail',
                        'columns'=>'addrid,addrName,price,area,price_unit',
                        'clear'=>'usertype,userid',
                        'function'=>true,
                        'parent'=>'zjCom'
                    ],
                    'xzl'=>[
                        'second'=>'xzl',
                        'description'=>'写字楼',
                        'sql'=>"select `type`,`title`,`cityid`,`pubdate` 'time',`id` 'aid',`litpic` 'picture',`addrid`,`usertype`,`userid`,`address`,`price`,`area` from `#@__house_xzl` where `state`=1",
                        'ids'=>"and `id` in(?)",
                        'template'=>'xzl-detail',
                        'columns'=>'addrid,addrName,address,price,area,type,price_unit',
                        'clear'=>'usertype,userid',
                        'function'=>true,
                        'parent'=>'zjCom'
                    ],
                    'sp'=>[
                        'second'=>'sp',
                        'description'=>'商铺',
                        'sql'=>"select `type`,`title`,`cityid`,`pubdate` 'time',`id` 'aid',`litpic` 'picture',`addrid`,`address`,`usertype`,`userid`,`price`,`area` from `#@__house_sp` where `state`=1",
                        "ids"=>"and `id` in(?)",
                        'template'=>'sp-detail',
                        'columns'=>'addrid,addrName,address,price,area,type,price_unit',
                        'clear'=>'usertype,userid',
                        'function'=>true,
                        'parent'=>'zjCom'
                    ],
                    'cf'=>[
                        'second'=>'cf',
                        'description'=>'厂房',
                        'sql'=>"select `type`,`title`,`cityid`,`pubdate` 'time',`id` 'aid',`litpic` 'picture',`addrid`,`address`,`usertype`,`userid`,`price`,`area`,(select typename from `#@__houseitem` where `id`=l.`protype`)'protype' from `#@__house_cf` l where `state`=1",
                        'ids'=>'and `id` in(?)',
                        'template'=>'cf-detail',
                        'columns'=>'addrid,addrName,address,price,area,type,protype,price_unit',
                        'clear'=>'usertype,userid',
                        'function'=>true,
                        'parent'=>'zjCom'
                    ],
                    'cw'=>[
                        'second'=>'cw',
                        'description'=>"车位",
                        'sql'=>"select `type`,`addrid`,`title`,`cityid`,`pubdate` 'time',`id` 'aid',`litpic` 'picture',`protype`,`area`,`usertype`,`userid`,`price` from `#@__house_cw` where `state`=1",
                        'ids'=>'and `id` in(?)',
                        'template'=>"cw-detail",
                        'columns'=>'addrid,addrName,protype,area,price,type,price_unit',
                        'clear'=>'usertype,userid',
                        'function'=>true,
                        'parent'=>'zjCom'
                    ],
                    'zjUser'=>[
                        'second'=>'zjUser',
                        'description'=>'经纪人',
                        'sql'=>"SELECT z.`userid` 'uid',z.`id` 'aid',z.`cityid`, m.`nickname` 'title', z.`pubdate` 'time',z.`litpic` 'picture',z.`suc` FROM `#@__house_zjuser` z LEFT JOIN `#@__member` m ON m.`id`=z.`userid` where z.state=1",
                        'ids'=>'and z.`id` in(?)',
                        'columns'=>'suc,sale,uid',
                        'template'=>'broker-detail',
                        'function'=>true
                    ],
                    'zjCom'=>[
                        'second'=>'zjCom',
                        'description'=>'中介公司',
                        'sql'=>"SELECT `addr` 'addrid','store' as 'tables_join',`cityid`,`id` 'aid', `title`, `pubdate` 'time',`litpic` FROM `#@__house_zjcom` WHERE `state` = 1",
                        'ids'=>'and `id` in(?)',
                        'template'=>"store-detail",
                        'columns'=>'addrid,addrName,houses',
                        'function'=>true
                    ],
                    'community'=>[
                        'second'=>'community',
                        'description'=>'小区',
                        'sql'=>"SELECT c.`id` 'aid', 0 as 'time', c.`cityid`, c.`title`, c.`addrid`, c.`addr`, c.`litpic` 'picture', c.`price`, c.`opendate`, c.`protype`, c.`video` 'videourl',c.`litpic` 'video_pic' FROM `#@__house_community` c LEFT JOIN `#@__site_city` t ON t.`cid` = c.`cityid` WHERE c.`state` = 1 AND t.`state` = 1",
                        'ids'=>"and c.`id` in(?)",
                        'template'=>'community-detail',
                        'columns'=>'addrid,addrName,onsale,onzu,opendate,price,protype',
                        'function'=>true
                    ]
                ]
            ],
            'job'=>[
                'module'=>'job',
                'second'=>[
                    'company'=>[
                        'second'=>'company',
                        'description'=>'企业',
                        'sql' => "select s.`address`,s.`addrid`,s.`cityid`,s.`title`,s.`pubdate` 'time',s.`id` 'aid',s.`logo` 'picture',i.`typename`,(select count(*) from `#@__job_post` l where l.company=s.`id` and l.`state`=1)'jobs' from `#@__job_company` s LEFT JOIN `#@__job_industry` i ON s.`industry`=i.`id` where s.`state`=1",
                        'ids' => 'and s.`id` in(?)',
                        'columns'=>'typename,jobs,addrid,addrName,address',
                        'template' => 'company',
                        'function'=>true
                    ],
                    'post'=>[
                        'second'=>'post',
                        'description'=>'职位',
                        'sql'=>"SELECT l.`cityid`, l.`title`, l.`pubdate` 'time', l.`id` 'aid', l.`min_salary`, l.`max_salary`,l.`salary_type`, l.`mianyi`, ja.`addrid` 'addrid', l.`experience`, j.`typename` 'educational', p.`title` 'company' FROM `#@__job_post` l LEFT JOIN `#@__job_address` ja ON l.`job_addr`=ja.`id` LEFT JOIN `#@__jobitem` j ON l.`educational` = j.`id` LEFT JOIN `#@__job_company` p ON l.`company` = p.`id` WHERE l.`state` = 1 AND l.`valid` > unix_timestamp( CURRENT_TIMESTAMP)",
                        'ids'=>'and l.`id` in(?)',
                        'template' => 'job',
                        'columns'=>'salary,addrName,experience,educational,company',
                        'function'=>true
                    ]
                ]
            ],
            'waimai'=>[
                'module'=>'waimai',
                "second"=>[
                    'store'=>[
                        'second'=>'store',
                        'description'=>"商家",
                        "template"=>"shop",
                        'sql'=>"select '美食外卖' as 'typename',s.`cityid`,'store' as 'tables_join',s.`shopname` 'title',s.`salesdate` 'time',s.`id` 'aid',s.`shop_banner` 'picture',s.`delivery_fee_type`,s.`delivery_time`,s.`basicprice`,(select avg( c.`star` ) from `#@__waimai_common` c where c.`sid`=s.`id`)'star',(select count(o.`id`) from `#@__waimai_order_all` o where o.`state`=1 and o.`sid`=s.`id`) 'sale',s.`coordX` 'lat',s.`coordY` 'lng' from `#@__waimai_shop` s where s.`status`=1 and s.`del`=0",
                        'ids'=>'and s.`id` in(?)',
                        'columns'=>'addrid,star,sale,basicprice,delivery_fee_type,delivery_time,typename',
                        'function'=>true
                    ],
                    'product'=>[
                        'second'=>'product',
                        'description'=>"商品",
                        "template"=>"",  // 没有 template
                        'sql'=>"select l.`typeid`,l.`id` 'foodid',s.`cityid`,l.`sid` 'parent_id',l.`title`,l.`id` 'aid',l.`pics` 'picture',l.`pubdate` 'time',l.`price` from `#@__waimai_list` l LEFT JOIN `#@__waimai_shop` s ON l.`sid`=s.`id` where 1=1 and l.`status`=1",
                        'ids'=>'and l.`id` in(?)',
                        'columns'=>'price,typeid,foodid',
                        'parent'=>'store',
                    ]
                ],
            ],
            'shop'=>[
                'module'=>'shop',
                'second'=>[
                    'store'=>[
                        'second'=>'store',
                        'description'=>'商家',
                        'sql' => "select s.`express`,s.`merchant_deliver`,s.`distribution`,s.`shoptype`,s.`cityid`,s.`addrid`,'store' as 'tables_join', s.`title`,s.`pubdate` 'time',s.`lat`,s.`lng`,s.`id` 'aid',s.`logo` 'picture',t.`typename`,(select count( c.`id` ) from `#@__member_collect` c where c.`action` = 'store-detail' and c.module = 'shop' and s.`id` = c.`aid` ) 'collectnum' from `#@__shop_store` s LEFT JOIN `#@__shop_type` t ON t.`id` =s.`industry` where s.`state`=1",
                        'ids'=>'and s.`id` in(?)',
                        'template' => 'store-detail',
                        'columns'=>'typename,collectnum,addrid,addrName,shoptype,star,type',
                        'clear'=>'merchant_deliver,distribution,express',
                        'function'=>true
                    ],
                    'product'=>[
                        'second'=>'product',
                        'description'=>'商品',
                        'sql'=>"select l.`subtitle` 'tag',l.`sales`,l.`pintuanhtype`,l.`promotype` 'moduletype',s.`cityid`,l.`store` 'parent_id',l.`title`,l.`pubdate` 'time',l.`id` 'aid',l.`litpic` 'picture',l.`mprice`,l.`price`,(select count(c.`id`) from `#@__member_collect` c where c.module='shop' and c.`action`='detail' and c.`aid`=l.`id`) 'collectnum' from `#@__shop_product` l LEFT JOIN `#@__shop_store` s ON l.`store`=s.`id` where l.`state`=1 AND s.`state`= 1",
                        'ids'=>'and l.`id` in(?)',
                        'template' => 'detail',
                        'columns'=>'mprice,price,collectnum,moduletype,pintuanhtype,sales,tag',
                        'parent'=>'store'
                    ]
                ]
            ],
            'renovation'=>[
                'module'=>'renovation',
                'second'=>[
                    'store'=>[
                        'second'=>'store',
                        'description'=>'公司',
                        'sql' => "select `lnglat`,`cityid`,`addrid`,'store' as 'tables_join',`company` 'title',`pubdate` 'time',`id` 'aid',`logo` 'picture' from `#@__renovation_store` where `state`=1",
                        'ids' => 'and `id` in(?)',
                        'template' => 'company-detail',
                        'function'=>true,
                        'columns'=>'addrid,addrName',
                        'clear'=>'lnglat'
                    ],
                    'case'=>[
                        'second'=>'case',
                        'description'=>'案例',
                        'sql'=>"select d.`fid` 'parent_id',d.`title`,d.`pubdate` 'time',d.`id` 'aid',d.`litpic` 'picture',d.`area`,t.`typename` 'style',d.`price`,b.`typename` 'btype',d.`ftype`,d.`fid` from `#@__renovation_diary` d LEFT JOIN `#@__renovation_type` t ON d.`btype`=t.`id` LEFT JOIN `#@__renovation_type` b ON d.`style`=b.`id` where `state`=1",
                        'ids'=>'and d.`id` in(?)',
                        'template' => 'case',
                        'columns' => 'area,style,price,btype,user_name,user_pic',
                        'function' => true,
                        'parent'=>'store,foreman,designer',   // 不知道是哪一个，需要在function中识别
                    ],
                    'albums'=>[
                        'second'=>"albums",
                        'description'=>"效果图",
                        'sql'=>"select s.`cityid`,l.`company` 'parent_id',l.`title`,l.`pubdate` 'time',l.`id` 'aid',l.`litpic` 'picture' from `#@__renovation_case` l LEFT JOIN `#@__renovation_store` s ON l.`company`=s.`id` where l.`state`=1",
                        'ids'=>'and l.`id` in(?)',
                        "template"=>"albums",
                        'parent'=>'store'
                    ],
                    'designer'=>[
                        'second'=>"designer",
                        "description"=>"设计师",
                        "sql"=>"select 'store' as 'tables_join',`name` 'title',`pubdate` 'time',`id` 'aid',`photo` 'picture',`type`,`userid`,`company` from `#@__renovation_team` where `state`=1",
                        'ids'=>'and `id` in(?)',
                        "template"=>"designer",
                        'function'=>true
                    ],
                    'foreman'=>[
                        'second'=>'foreman',
                        'description'=>'工长',
                        'sql'=>"select 'store' as 'tables_join',`name` 'title',`pubdate` 'time',`id` 'aid',`photo` 'picture',`type`,`userid`,`company` from `#@__renovation_foreman` where `state`=1",
                        'ids'=>'and `id` in(?)',
                        'clear'=>'type,userid,company',
                        'template'=>'foreman-detail',
                        'function'=>true
                    ]
                ]
            ],
            'tuan'=>[
                'module'=>'tuan',
                'second'=>[
                    'store'=>[
                        'second'=>'store',
                        'description'=>'商家',
                        'sql'=>"select s.`addrid`,s.`lnglat`,s.`cityid`,'store' as 'tables_join',l.`title`,s.`jointime` 'time',s.`id` 'aid',s.`pics` 'picture',s.`address` from `#@__tuan_store` s  LEFT JOIN `#@__business_list` l on s.`uid`=l.`uid` where s.`state` = 1 ",
                        'ids'=>'and s.`id` in(?)',
                        'template'=>'store',
                        'pic_multi' => true,
                        'columns'=>'addrid,addrName,address',
                        'clear'=>'lnglat',
                        'function'=>true
                    ],
                    'product'=>[
                        'second'=>'product',
                        'description'=>'商品',
                        'sql'=>"SELECT s.`addrid`,s.`cityid`,l.`sid` 'parent_id',l.`title`,l.`pubdate` 'time',l.`id` 'aid',l.`litpic` 'picture',l.`price`,l.`market`,(select b.`title` from `#@__tuan_store` s LEFT JOIN `#@__business_list` b ON s.`uid`=b.`uid` where l.`sid`=s.`id`)'store_title' FROM `#@__tuanlist` l LEFT JOIN `#@__tuan_store` s ON l.`sid`=s.`id` WHERE l.`arcrank` = 1",
                        'ids'=>'and l.`id` in(?)',
                        'template'=>'detail',
                        'columns'=>'price,market,store_title,addrid,addrName',
                        'parent'=>'store',
                        'function'=>true
                    ]
                ]
            ],
            'live'=>[
                'module'=>'live',
                'sql'=>"SELECT l.`location` 'address',m.`nickname` 'user_name',m.`photo` 'user_pic',l.`title`,l.`lat`,l.`lng`,l.`pubdate` 'time',l.`id` 'aid',l.`litpic` 'picture' FROM `#@__livelist` l LEFT JOIN `#@__member` m ON l.`user`=m.`id` WHERE l.`arcrank` = 1 AND l.`waitpay` = 0",
                'ids'=>'and l.`id` in(?)',
                "template"=>"detail",
                'columns'=>'user_name,user_pic,address',
                "second"=>false,
                'function'=>true
            ],
            'tieba'=>[
                'module'=>'tieba',
                'sql'=>"SELECT l.`cityid`,l.`title`,l.`pubdate` 'time',l.`id` 'aid',t.`typename`,`content` FROM `#@__tieba_list` l LEFT JOIN `#@__tieba_type` t ON t.`id`=l.`typeid` WHERE l.`waitpay` = 0 AND l.`del` = 0 AND l.`state` = 1 ",
                'ids'=>'and l.`id` in(?)',
                'template'=>'detail',
                'second'=>false,
                'columns' => 'typename,user_name,user_pic',
                'clear'=>'content',
                'function'=>true
            ],
            'video'=>[
                'module'=>'video',
                'sql'=>"SELECT m.`nickname` 'user_name',m.`photo` 'user_pic',l.`cityid`,l.`title`,l.`pubdate` 'time',l.`id` 'aid',l.`litpic` 'picture',l.`litpic` 'video_pic',l.`videourl` FROM `#@__videolist` l LEFT JOIN `#@__member` m ON l.`admin`=m.`id` WHERE l.`del` = 0 AND l.`arcrank` = 1 ",
                'ids'=>'and l.`id` in(?)',
                "template"=>"detail",
                'columns'=>'user_name,user_pic',
                'second'=>false,
                'function'=>true
            ],
            'travel'=>[
                'module'=>'travel',
                'second'=>[
                    'store'=>[
                        'second'=>'store',
                        'description'=>'旅行社',
                        'sql'=>"SELECT '旅行社' as 'typename',`cityid`,`addrid`,'store' as 'tables_join',`title`,`pubdate` 'time',`id` 'aid',`pics` 'picture',`address`,`lng`,`lat` FROM `#@__travel_store` where `state` = 1 ",
                        'ids'=>'and `id` in(?)',
                        'template'=>'store',
                        'pic_multi'=>true,
                        'columns'=>'address,addrid,addrName,typename',
                        'function'=>true
                    ],
                    'hotel'=>[
                        'second'=>'hotel',
                        'description'=>'酒店',
                        'sql'=>"SELECT l.`tag` 'typename',l.`cityid`,l.`lng`,l.`lat`,l.`addrid`,'store' as 'tables_join',l.`title`,l.`pubdate` 'time',l.`id` 'aid',l.`pics` 'picture',(select min(price) from `#@__travel_hotelroom` where hotelid=l.`id`)'price',(select sum(sale) from `#@__travel_hotelroom` where hotelid=l.`id`)'sales' FROM `#@__travel_hotel` l WHERE l.`state` = 1",
                        'ids'=>'and `id` in(?)',
                        'template'=>'hotel-detail',
                        'pic_multi'=>true,
                        'function'=>true,
                        'columns'=>'addrid,addrName,typename,price,sales'
                    ],
                    'hotelroom'=>[
                        'second'=>'hotelroom',
                        'description'=>'酒店房间',
                        'sql'=>"SELECT r.`sale` 'sales',r.`price`,h.`cityid`,r.`hotelid` 'parent_id',r.`title`,r.`pubdate` 'time',r.`id` 'aid',r.`pics` 'picture' FROM `#@__travel_hotelroom` r LEFT JOIN `#@__travel_hotel` h ON r.`hotelid`=h.`id` WHERE 1=1",
                        'ids'=>'and r.`id` in(?)',
                        'columns'=>'price,sales',
                        'parent'=>'hotel'
                    ],
                    'ticket'=>[
                        'second'=>'ticket',
                        'description'=>'门票',
                        'sql'=>"SELECT `tag` 'typename',`flag`,`cityid`,`company` 'parent_id',`title`,`pubdate` 'time',`id` 'aid',`pics` 'picture',(SELECT min(`price`) FROM `#@__travel_ticketinfo` WHERE `typeid` = '0' and `ticketid` = l.`id`)'price' FROM `#@__travel_ticket` l WHERE `state` = 1",
                        'ids'=>'and `id` in (?)',
                        'template'=>'ticket-detail',
                        'columns'=>'tag,typename,price,flag',
                        'pic_multi'=>true,
                        'parent'=>'store'
                    ],
                    'daytravel'=>[
                        'second'=>"daytravel",
                        'description'=>"一日游",
                        'sql'=>"SELECT l.`tag` 'typename',l.`cityid`,l.`company` 'parent_id',l.`title`,l.`pubdate` 'time',l.`id` 'aid',l.`pics` 'picture',(SELECT avg(c.`price`) FROM `#@__travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '1' ) AS 'price' FROM `#@__travel_agency` l WHERE l.`state` = 1 AND l.`typeid` = '0'",
                        'ids'=>'and l.`id` in(?)',
                        "template"=>"agency-detail",
                        'pic_multi'=>true,
                        'columns' => 'price,typename,sales',
                        'parent'=>'store',
                        'function'=>true
                    ],
                    'grouptravel'=>[
                        'second'=>"grouptravel",
                        'description'=>"跟团游",
                        'sql'=>"SELECT l.`tag` 'typename',l.`cityid`,l.`company` 'parent_id',l.`title`,l.`pubdate` 'time',l.`id` 'aid',l.`pics` 'picture',(SELECT avg(c.`price`) FROM `#@__travel_ticketinfo` c WHERE c.`ticketid` = l.`id` AND c.`typeid` = '1' ) AS 'price' FROM `#@__travel_agency` l WHERE l.`state` = 1 AND l.`typeid` = '1'",
                        'ids'=>'and l.`id` in(?)',
                        "template"=>"agency-detail",
                        'pic_multi'=>true,
                        'columns' => 'price,typename,sales',
                        'parent'=>'store',
                        'function'=>true
                    ],
                    'rentcar'=>[
                        'second'=>'rentcar',
                        'description'=>'租车',
                        'sql'=>"SELECT `cityid`,`title`,`pubdate` 'time',`id` 'aid',`pics` 'picture',`price` FROM `#@__travel_rentcar` WHERE `state` = 1",
                        'ids'=>'and `id` in(?)',
                        'template'=>"rentcar-detail",
                        'pic_multi'=>true,
                        'columns' => 'price'
                    ],
                    'video'=>[
                        'second'=>'video',
                        'description'=>'视频',
                        'sql'=>"SELECT `title`,`pubdate` 'time',`id` 'aid', `litpic` 'picture',`litpic` 'video_pic',`video` 'videourl',`userid`,`usertype`,(select `photo` from `#@__member` m where l.`userid`=m.`id`)'user_pic' FROM `#@__travel_video` l WHERE `state` = 1",
                        'ids'=>'and `id` in(?)',
                        'template'=>"video-detail",
                        'columns'=>'userid,user_name,user_pic',
                        'clear'=>'usertype',
                        'function'=>true
                    ],
                    'visa'=>[
                        'second'=>'visa',
                        'description'=>"签证",
                        'sql'=>"SELECT s.`cityid`,l.`company` 'parent_id',l.`title`,l.`pubdate` 'time',l.`id` 'aid', l.`pics` 'picture',l.`price` FROM `#@__travel_visa` l LEFT JOIN `#@__travel_store` s ON l.`company`=s.`id` WHERE l.`state` = 1",
                        'ids'=>'and l.`id` in(?)',
                        'template'=>"visa",
                        'pic_multi'=>true,
                        'columns'=>'price',
                        'parent'=>"store"
                    ],
                    'strategy'=>[
                        'second'=>'strategy',
                        'description'=>"攻略",
                        'sql'=>"SELECT `title`,`pubdate` 'time',`id` 'aid',`pics` 'picture',`userid`,`usertype`,(select `photo` from `#@__member` m where l.`userid`=m.`id`)'user_pic' FROM `#@__travel_strategy` l WHERE `state` = 1",
                        'ids'=>'and `id` in(?)',
                        "template"=>"strategy-detail",
                        'pic_multi'=>true,
                        'columns'=>'userid,user_name,user_pic',
                        'clear'=>'usertype',
                        'function'=>true
                    ]
                ]
            ],
            'education'=>[
                'module'=>'education',
                'second'=>[
                    'store'=>[
                        'second'=>'store',
                        'description'=>"机构",
                        'sql'=>"SELECT `cityid`,`lat`,`lng`,`addrid`,'store' as 'tables_join',`title`,`pubdate` 'time',`id` 'aid',`pics` 'picture',`tag`,'教育机构' as 'typename' FROM `#@__education_store` WHERE `state` = 1",
                        'ids'=>'and `id` in(?)',
                        'template'=>"store-detail",
                        'pic_multi'=>true,
                        'columns' => 'tag,addrid,addrName,courses',
                        'function'=>true
                    ],
                    'list'=>[
                        'second'=>'list',
                        'description'=>"课程",
                        'sql'=>"SELECT t.`typename`,cus.`usertype`,cus.`userid`,cus.`title`,cus.`pubdate` 'time',cus.`id` 'aid',cus.`pics` 'picture',(select min(cls.`price`) from `#@__education_class` cls where cus.`id`=cls.`coursesid`)'price' FROM `#@__education_courses` cus LEFT JOIN `#@__education_type` t ON cus.`typeid`=t.`id`  WHERE cus.`state` = 1",
                        'ids'=>'and cus.`id` in(?)',
                        'template'=>"detail",
                        'pic_multi'=>true,
                        'columns'=>'price,typename',
                        'clear'=>'usertype,userid',
                        'parent'=>'store',  // 如果 usertype =1，则说明为公司的课程，否则是个人课程，所以需要在function中判断
                        'function'=>true
                    ]
                ]
            ],
            'homemaking'=>[
                'module'=>"homemaking",
                'second'=>[
                    'store'=>[
                        'second'=>'store',
                        'description'=>'商家',
                        'sql'=>"SELECT '家政服务' as 'typename',t.`typename` 'tag',`cityid`,`lat`,`lng`,'store' as 'tables_join',s.`title`,s.`pubdate` 'time',s.`id` 'aid',s.`pics` 'picture',s.`addrid`,s.`address`,(select min(`price`) FROM `#@__homemaking_list` WHERE `company` = s.`id` AND `state` = 1) 'price',(select sum(sale) from `#@__homemaking_list` where company=s.`id`)'sales' FROM `#@__homemaking_store` s LEFT JOIN `#@__homemaking_type` t ON s.`typeid`=t.`id` WHERE `state` = 1",
                        'ids'=>'and s.`id` in(?)',
                        'template'=>"store-detail",
                        'pic_multi'=>true,
                        'columns'=>'addrid,addrName,address,price,tag,typename,sales',
                        'function'=>true
                    ],
                    'list'=>[
                        'second'=>'list',
                        'description'=>"项目",
                        'sql'=>"SELECT `company`,`sale`,`flag` 'typename',`cityid`,`company` 'parent_id',`title`,`pubdate` 'time',`id` 'aid',`pics` 'picture',`price`,`addrid` FROM `#@__homemaking_list` WHERE `state` = 1",
                        'ids'=>'and `id` in(?)',
                        'template'=>"detail",
                        'pic_multi'=>true,
                        'columns'=>'price,addrid,addrName,typename,sale,flag',
                        'clear'=>'company',
                        'function'=>true,
                        'parent'=>'store'
                    ]
                ]
            ],
            'car'=>[
                'module'=>'car',
                'second'=>[
                    'store'=>[
                        'second'=>'store',
                        'description'=>'线下门店',
                        'sql'=>"SELECT '汽车经销' as 'typename',s.`cityid`,s.`lng`,s.`lat`,'store' as 'tables_join',`title`,`pubdate` 'time',`id` 'aid',`pics` 'picture',`address`,`addrid`,`suc` 'sale',(SELECT count(l.`id`) totalCount FROM `#@__car_list` l LEFT JOIN `#@__car_adviser` a ON a.`id` = l.`userid` WHERE l.`state` = 1 AND l.`usertype` = 1 AND a.`store` = s.`id`)'onsale' FROM `#@__car_store` s WHERE `state` = 1",
                        'ids'=>'and `id` in(?)',
                        'template'=>"store-detail",
                        'pic_multi'=>true,
                        'columns' => 'address,addrid,addrName,sale,onsale,typename',
                        'function'=>true
                    ],
                    'list'=>[
                        'second'=>'list',
                        'description'=>"车源",
                        'sql'=>"SELECT `cityid`,`tax`,`staging`,`downpayment`,`userid`,`title`,`pubdate` 'time',`id` 'aid',`litpic` 'picture',`addrid`,`price`,`mileage`,`cardtime` FROM `#@__car_list` WHERE `state` = 1 and `waitpay`=0",
                        'ids'=>'and `id` in(?)',
                        'template'=>"detail",
                        'columns' => 'price,mileage,cardtime,addrName,addrid,tax,shoufu',
                        'function' => true,
                        'clear'=>'userid,staging,downpayment',
                        'parent'=>'store'
                    ]
                ]
            ],
            'marry'=>[
                'module'=>"marry",
                'second'=>[
                    'nhstore'=>[
                        'second'=>'nhstore',
                        'description'=>'店铺', // 非酒店
                        'sql'=>"SELECT '宴会酒店' as 'typename',`bind_module`,`cityid`,`addrid`,`lng`,`lat`,'store' as 'tables_join',`title`,`pubdate` 'time',`id` 'aid',`pics` 'picture',`taoxi`,`anli` FROM `#@__marry_store` WHERE `state` = 1 and `bind_module`!=8",
                        'ids'=>'and `id` in(?)',
                        'template'=>"store-detail",
                        'pic_multi'=>true,
                        'columns'=>'taoxi,anli,addrid,addrName,typename,comment,tag',
                        'clear'=>'bind_module',
                        'function'=>true
                    ],
                    'hstore'=>[
                        'second'=>'hstore',
                        'description'=>'酒店', // 酒店
                        'sql'=>"SELECT `cityid`,`addrid`,`lng`,`lat`,'store' as 'tables_join',`title`,`pubdate` 'time',`id` 'aid',`pics` 'picture',`taoxi`,`anli` FROM `#@__marry_store` WHERE `state` = 1 and FIND_IN_SET('8', `bind_module`)",
                        'ids'=>'and `id` in(?)',
                        'template'=>"hotel_detail",
                        'pic_multi'=>true,
                        'function'=>true,
                        'columns'=>'taoxi,anli,addrid,addrName,comment,yanhuit,minTable,maxTable,countyanhuit,minPrice,maxPrice'
                    ],
                    'hotelfield'=>[
                        'second'=>"hotelfield",
                        'description'=>"婚宴场地",
                        "sql"=>"SELECT s.`cityid`,s.`id` 'parent_id',l.`title`,l.`pubdate` 'time',l.`id` 'aid',l.`pics` 'picture',s.`address`,(select MIN(price) from `#@__marry_hotelmenu` where company=s.`id`)'price' FROM `#@__marry_hotelfield` l LEFT JOIN `#@__marry_store` s ON l.`company`=s.`id` WHERE l.`state` = 1",
                        'ids'=>'and l.`id` in(?)',
                        "template"=>"hotelfield-detail",
                        'pic_multi'=>true,
                        'columns'=>'address,price',
                        'parent'=>'hstore'
                    ],
                    'host'=>[
                        'second'=>"host",
                        'description'=>"主持人",
                        "sql"=>"select s.`cityid`,l.`company` 'parent_id',l.`id` 'aid',l.`hostname` 'title',l.`pubdate` 'time',l.`photo` 'picture',l.`price` from `#@__marry_host` l LEFT JOIN `#@__marry_store` s ON l.`company`=s.`id` where l.`state`=1",
                        'ids'=>'and `l.id` in(?)',
                        'columns'=>'price',
                        'parent'=>'nhstore'
                    ],
                    'weddingcar'=>[
                        'second'=>'weddingcar',
                        'description'=>'婚车',
                        'sql'=>"select s.`cityid`,l.`company` 'parent_id',l.`id` 'aid',l.`title`,l.`pubdate` 'time',l.`pics` 'picture',l.`price` from `#@__marry_weddingcar` l LEFT JOIN `#@__marry_store` s ON l.`company`=s.`id` where l.`state`=1",
                        'ids'=>'and l.`id` in(?)',
                        'columns'=>'price',
                        'pic_multi'=>true,
                        'parent'=>'nhstore'
                    ],
                    'weddingphoto'=>[
                        'second'=>'weddingphoto',
                        'description'=>"婚纱摄像",
                        'sql'=>"select s.`cityid`,l.`company` 'parent_id',l.`id` 'aid',l.`title`,l.`pubdate` 'time',l.`pics` 'picture',l.`price` from `#@__marry_planmeal` l LEFT JOIN `#@__marry_store` s ON l.`company`=s.`id` where l.`state`=1 AND l.`type` = '1'",
                        'ids'=>'and l.`id` in(?)',
                        'pic_multi'=>true,
                        'parent'=>'nhstore'
                    ],
                    'weddingggraphy'=>[
                        'second'=>'weddingggraphy',
                        'description'=>'摄影跟拍',
                        'sql'=>"select s.`cityid`,l.`company` 'parent_id',l.`id` 'aid',l.`title`,l.`pubdate` 'time',l.`pics` 'picture',l.`price` from `#@__marry_planmeal` l LEFT JOIN `#@__marry_store` s ON l.`company`=s.`id` where l.`state`=1 AND l.`type` = '2'",
                        'ids'=>'and l.`id` in(?)',
                        'pic_multi'=>true,
                        'parent'=>'nhstore'
                    ],
                    'weddinggjewelry'=>[
                        'second'=>'weddinggjewelry',
                        'description'=>'珠宝首饰',
                        'sql'=>"select s.`cityid`,l.`company` 'parent_id',l.`id` 'aid',l.`title`,l.`pubdate` 'time',l.`pics` 'picture',l.`price` from `#@__marry_planmeal` l LEFT JOIN `#@__marry_store` s ON l.`company`=s.`id` where l.`state`=1 AND l.`type` = '3'",
                        'ids'=>'and l.`id` in(?)',
                        'pic_multi'=>true,
                        'parent'=>'nhstore'
                    ],
                    'weddingplan'=>[
                        'second'=>'weddingplan',
                        'description'=>'婚礼策划',
                        'sql'=>"select s.`cityid`,l.`company` 'parent_id',l.`id` 'aid',l.`title`,l.`pubdate` 'time',l.`pics` 'picture',l.`price` from `#@__marry_planmeal` l LEFT JOIN `#@__marry_store` s ON l.`company`=s.`id` where l.`state`=1 AND l.`type` = '9'",
                        'ids'=>'and l.`id` in(?)',
                        'pic_multi'=>true,
                        'parent'=>'nhstore'
                    ],
                    'weddingpo'=>[
                        'second'=>'weddingpo',
                        'description'=>'摄像跟拍',
                        'sql'=>"select s.`cityid`,l.`company` 'parent_id',l.`id` 'aid',l.`title`,l.`pubdate` 'time',l.`pics` 'picture',l.`price` from `#@__marry_planmeal` l LEFT JOIN `#@__marry_store` s ON l.`company`=s.`id` where l.`state`=1 AND l.`type` = '4'",
                        'ids'=>'and l.`id` in(?)',
                        'pic_multi'=>true,
                        'parent'=>'nhstore'
                    ],
                    'weddingmakeup'=>[
                        'second'=>'weddingmakeup',
                        'description'=>'新娘跟妆',
                        'sql'=>"select s.`cityid`,l.`company` 'parent_id',l.`id` 'aid',l.`title`,l.`pubdate` 'time',l.`pics` 'picture',l.`price` from `#@__marry_planmeal` l LEFT JOIN `#@__marry_store` s ON l.`company`=s.`id` where l.`state`=1 AND l.`type` = '5'",
                        'ids'=>'and l.`id` in(?)',
                        'pic_multi'=>true,
                        'parent'=>'nhstore'
                    ],
                    'weddingdress'=>[
                        'second'=>'weddingdress',
                        'description'=>'婚纱礼服',
                        'sql'=>"select s.`cityid`,l.`company` 'parent_id',l.`id` 'aid',l.`title`,l.`pubdate` 'time',l.`pics` 'picture',l.`price` from `#@__marry_planmeal` l LEFT JOIN `#@__marry_store` s ON l.`company`=s.`id` where l.`state`=1 AND l.`type` = '6'",
                        'ids'=>'and l.`id` in(?)',
                        'pic_multi'=>true,
                        'parent'=>'nhstore'
                    ]
                ]
            ],
            'dating'=>[
                'module'=>'dating',
                'second'=>[
                    'store'=>[
                        'second'=>'store',
                        'description'=>'门店',
                        'sql'=>"SELECT left(`profile`, 100) 'profile','婚恋中介' as 'typename',`id` 'aid',`addrid`,`lat`,`lng`,`cityid`,`jointime` 'time', `nickname` 'title', `photo` 'picture', `company` FROM `#@__dating_member` WHERE 1 = 1  AND `type` = 2",
                        'ids'=>'and `id` in(?)',
                        'template'=>'store_detail',
                        'columns'=>'addrid,addrName,typename,memberCount,profile',
                        'function'=>true
                    ],
                    'hn'=>[
                        'second'=>'hn',
                        'description'=>'红娘',
                        'sql'=>"SELECT `userid` 'uid',`id` 'aid', `cityid`,`jointime` 'time', `nickname` 'title', `photo` 'picture',`case` FROM `#@__dating_member` WHERE `type` = 1 and `state`=1",
                        'ids'=>'and `id` in(?)',
                        'template'=>'hn_detail',
                        'columns'=>'case,memberCount,uid',
                        'function'=>true
                    ]
                ]
            ],
            'pension'=>[
                'module'=>'pension',
                'second'=>[
                    'store'=>[
                        'second'=>'store',
                        'description'=>"机构",
                        'sql'=>"SELECT '养老机构' as 'typename',`visitday`,`catid`,`award`,`awarddesc`,`cityid`,`lat`,`lng`,`addrid`,'store' as 'tables_join',`title`,`pubdate` 'time',`id` 'aid',`pics` 'picture',`address`,`price` FROM `#@__pension_store` WHERE `state` = 1",
                        'ids'=>'and `id` in(?)',
                        'template'=>"store-detail",
                        'pic_multi'=>true,
                        'columns' => 'address,price,addrid,addrName,award,awarddesc,type,visitday,typename',
                        'clear'=>'catid',
                        'function'=>true
                    ],
                    'album'=>[
                        'second'=>'album',
                        'description'=>"相册",
                        'sql'=>"SELECT s.`cityid`,l.`store` 'parent_id',l.`title`,l.`pubdate` 'time',l.`id` 'aid',l.`litpic` 'picture' FROM `#@__pension_album` l LEFT JOIN `#@__pension_store` s ON l.`store`=s.`id` where 1=1",
                        'ids'=>'and `l.id` in(?)',
                        'parent'=>'store'
                    ]
                ]
            ],
            'paper'=>[
                'module'=>'paper',
                'sql'=>"SELECT s.`title` 'author',l.`title`,l.`pubdate` 'time',l.`id` 'aid',l.`litpic` 'picture' FROM `#@__paper_content` l LEFT JOIN `#@__paper_forum` f ON l.`forum`=f.`id` LEFT JOIN `#@__paper_company` s ON f.`company`=s.`id`  WHERE l.`state` = 1",
                'ids'=>'and `id` in(?)',
                "template"=>"content",
                'columns'=>'author',
                'second'=>false
            ],
            'vote'=>[
                'module'=>'vote',
                'sql'=>"SELECT `cityid`,`title`,`pubdate` 'time',`id` 'aid',`litpic` 'picture' FROM `#@__vote_list` WHERE `arcrank` = 1 ",
                'ids'=>'and `id` in(?)',
                "template"=>"detail",
                'second'=>false
            ],
            'integral'=>[
                'module'=>'integral',
                'sql'=>"select `cityid`,`title`,`pubdate` 'time',`id` 'aid',`litpic` 'picture' FROM `#@__integral_product` WHERE `state` = 1 ",
                'ids'=>'and `id` in(?)',
                'template'=>'detail',
                'second'=>false
            ],
            'quanjing'=>[
                'module'=>'quanjing',
                'sql'=>"SELECT `cityid`,`title`,`pubdate` 'time',`id` 'aid',`litpic` 'picture' FROM `#@__quanjinglist` WHERE `del` = 0 AND `arcrank` = 1 ",
                'ids'=>'and `id` in(?)',
                'template'=>'detail',
                'second'=>false
            ],
            'huodong'=>[
                'module'=>'huodong',
                'sql'=>"SELECT `began`,`end`,`cityid`,`title`,`pubdate` 'time',`id` 'aid',`litpic` 'picture',`address`,`baomingend`,(SELECT min(f.`price`) FROM `#@__huodong_fee` f WHERE `hid` = l.`id`)'price',(select count(*) from `#@__huodong_reg` where `hid`=l.`id`)'baoming',(select `typename` from `#@__huodong_type` where l.`typeid`=`id`)'typename' FROM `#@__huodong_list` l WHERE `state` = 1 AND `waitpay` = 0",
                'ids'=>'AND `id` in(?)',
                'template'=>'detail',
                'second'=>false,
                'columns' => "address,baomingend,price,began,end,baoming,typename"
            ],
            'image'=>[
                'module'=>'image',
                'sql'=>"SELECT `cityid`,`title`,`pubdate` 'time',`id` 'aid',`litpic` 'picture' FROM `#@__imagelist` WHERE `del` = 0 AND `arcrank` = 1",
                'ids'=>'AND `id` in(?)',
                'template'=>'detail',
                'second'=>false
            ],
            'member'=>[
                'module'=>'member',
                'description'=>'会员',
                'sql'=>"select m.`cityid`,m.`id` 'aid',m.`id` 'uid', m.`nickname` 'title', m.`regtime` 'time',`photo` 'picture',(select count(`id`) from `#@__member_follow` f where f.`fid`=m.`id`)'fans' from `#@__member` m  where m.`state`=1 and m.`mtype` in(1,2)",
                'ids'=>'and `id` in(?)',
                'template'=>'user',
                'columns'=>'fans,fabuCount,uid',
                'second'=>false,
                'function'=>true
            ]
        );
    }

    /**
     * 从已注册的 es 模块中，取出已安装的模块
     */
    public function getInstallModule($params=array()): array
    {
        // start. 参数
        $sub = $params['sub'] ?? true;  // 子模块？
        $number = $params['number'] ?? true; // 数字格式？
        $pic = $params['pic']; // 带图片的模块过滤？
        $picArr = array('video','live','info','travel_strategy','travel_video','tieba','renovation_case','circle');  // 符合条件的图片模块（在这里限定）
        $video = $params['video']; //过滤视频的模块？
        $videoArr = array('video','article_list','travel_video','circle','tieba');  // 符合条件的视频模块（在这里限定）
        $description = $params['description'] ?? true;  // 是否需要描述，描述会查询sql，浪费性能，但默认需要，当确实不需要时可传递false
        $parent = $params['parent'];  // 过滤父子关系，因为父文档中包含了子文档，将返回所有存在父子关系模块，以便用于过滤
        global $installModuleArr;  // 取得系统已注册模块名称
        $modules = $this->getRegisterModule();
        // end.  参数
        $mds = array();
        foreach ($modules as $k=>$v){
            //安装模块过滤（member模块不需要安装）
            if(!in_array($k, $installModuleArr) && $k!="member") {
                continue;
            }
            if($description){
                $v['description'] = $v['description'] ?: getModuleTitle(['name'=>$v['module']]);
            }else{
                $v['description'] = $v['module'];  // 不查询sql，直接使用 name
            }
            if(!$v['second']){  // 顶级模块
                //图片模块过滤规则，只返回所有已安装的、且符合条件的模块名
                if($pic){
                    if(in_array($k,$picArr)){
                        $mds[] = $k;
                    }
                    continue;
                }
                //视频模块过滤规则
                if($video){
                    if(in_array($k,$videoArr)){
                        $mds[] = $k;
                    }
                    continue;
                }
                //子文档过滤（顶级模块一般没有子文档）
                if($parent){
                    continue;
                }
                $item = array();
                $item['module'] = $v['module'];
                $item['description'] = $v['description'];
                $item['time'] = 'async_'.$v['module'];
                if($number){
                    $mds[] = $item;
                }else{
                    $mds[$k] = $item;
                }
            }elseif($sub){  // 二级模块
                // 遍历所有的二级
                $seconds = & $v['second'];
                foreach ($seconds as $key=>$val){
                    $shotKey = $v['module'].'_'.$val['second']; // 模块名和子模块名
                    //图片模块过滤规则，只返回所有已安装的、且符合条件的子模块名
                    if($pic){
                        if(in_array($shotKey,$picArr)){
                            $mds[] = $shotKey;
                        }
                        continue;
                    }
                    if($video){
                        if(in_array($shotKey,$videoArr)){
                            $mds[] = $shotKey;
                        }
                        continue;
                    }
                    //子文档过滤
                    if($parent){
                        if($val['parent']){
                            $parents = explode(",",$val['parent']);
                            foreach ($parents as $ite){
                                $ii = array();
                                $ii['son'] = array('module'=>$v['module'],'second'=>$val['second'],
                                    'ss'=>buildEsId(array('service'=>$v['module'],'second'=>$val['second'],'_name'=>1))
                                );  // 子模块
                                $ii['parent'] = array('module'=>$v['module'],'second'=>$ite,
                                    'ss'=>buildEsId(array('service'=>$v['module'],'second'=>$ite,'_name'=>1))
                                );  // 父模块
                                $mds[] = $ii;
                            }
                        }
                        continue;
                    }
                    $item = array();
                    $item['module'] = $v['module'];
                    $item['second'] = $val['second'];
                    $item['description'] = $v['description'].'_'.$val['description'];
                    $item['time'] = 'async_'.$shotKey;
                    if($number){
                        $mds[] = $item;
                    }else{
                        $mds[$key] = $item;
                    }
                }
            }
        }
        return $mds;
    }

    /**
     * sql同步到es的映射处理，解析sql、tpl等
     */
    public function asyncCommon($module,$second,$id=array()){
        $op = true;  // 解析是否成功

        $registModules = $this->getRegisterModule();
        if(empty($registModules[$module])){  // 模块未注册
            $op = false;
        }else{
            // 没有子模块的情况下
            if(!$second){
                $sql = $registModules[$module]['sql'];
                $tpl = $registModules[$module]['template'];
                $pic_multi = $registModules[$module]['pic_multi'];
                $pic_split = $registModules[$module]['pic_split'];
                $columns = $registModules[$module]['columns'];
                $func = $registModules[$module]['function'];
                $ids = $registModules[$module]['ids'];
                $clear = $registModules[$module]['clear'];
            }else{  // 存在子模块

                // 校验子模块是否存在
                if(empty($registModules[$module]['second'][$second])){  // 子模块不存在
                    $op = false;
                }else{
                    $sql = $registModules[$module]['second'][$second]['sql'];
                    $tpl = $registModules[$module]['second'][$second]['template'];
                    $pic_multi = $registModules[$module]['second'][$second]['pic_multi'];
                    $pic_split = $registModules[$module]['second'][$second]['pic_split'];
                    $columns = $registModules[$module]['second'][$second]['columns'];
                    $func = $registModules[$module]['second'][$second]['function'];
                    $ids = $registModules[$module]['second'][$second]['ids'];
                    $clear = $registModules[$module]['second'][$second]['clear'];
                    $parent = $registModules[$module]['second'][$second]['parent'];
                }
            }
        }
        if(!empty($id)){  // 指定了 id ，进行额外处理
            // 拼接sql
            if(empty($ids)){
                die(json_encode(['state'=>200,'info'=>"es模块注册缺少ids参数"]));
            }
            if(count($id)>1){
                $id = array_slice($id, 0, 1000);  // 最多调取的条数，如果超过这个数字，后续的无效
                $ids_str = join(",",$id);
            }else{
               $ids_str = $id[0];
            }
            $sql .= ' '.str_replace("?","$ids_str",$ids);
        }
        if($op){  // 正常解析模块，执行一些公用处理
            $pic_multi = (bool)$pic_multi;
            $pic_split = $pic_split ?? ",";
            $columns = $columns ?? "";  // 显示字段
            if($columns){
                $columns = explode(",", $columns);
            }else{
                $columns = array();
            }
            $func = (bool)$func;
            $clear = $clear ?? "";  // 标识临时字段，清除
            if($clear){
                $clear = explode(",", $clear);
            }else{
                $clear = array();
            }
        }
        return array(
            'success'=>$op,'sql'=>$sql,'tpl'=>$tpl,'pic_multi'=>$pic_multi,'pic_split'=>$pic_split,'columns'=>$columns,
            'func'=>$func,'module'=>$module,'second'=>$second,'clear'=>$clear,'parent'=>$parent
        );
    }

    /**
     * 从sql同步一条数据，到es中（增加、更新）
     * 改：先把$id变为字符串，然后分割 id，提取多条（限制1000，如果超出这个值，不报错但不执行，请执行模块同步方法）
     */
    public function asyncIds($module,$id,$second=""){
        global $dsql;

        // 从 common 中解析
        $common = $this->asyncCommon($module,$second,$id);
        if(!$common['success']){
            return false;
        }
        $sql = $common['sql'];
        // 查询数据
        $sql = $dsql->SetQuery($sql);
        $list = $dsql->getArrList($sql);
        if(empty($list)){
            return false;  // 没有需要同步的数据
        }
        // 处理list数据
        $list = $this->formatIndex($list,$common);
        // 批量导入
        return $this->indexAll($list);

    }

    /**
     * 批量处理数据，从sql原始取得的数据，转为 es 数据格式，以便导入es
     */
    private function formatIndex(& $list,$params){
        extract($params);  // 需要的多个参数，直接从数据中提取（从asyncCommon中取得）
        // 循环处理每条数据
        foreach ($list as  $k=> $v){
            // 0.如果需要函数处理，首先处理
            if($func){
                $func_name = 'module_'.buildEsId(['service'=>$module,'second'=>$second,'_name'=>1]);
                if(method_exists($this,$func_name)){
                    $v = $this->$func_name($v);
                }else{
                    die("es模块缺少数据处理方法：".$func_name);
                }
            }
            // 1. es_id
            $list[$k]['_id'] = buildEsId(['service'=>$module,'id'=>$v['aid'],'second'=>$second]);
            // 2.模块信息（aid，title 自动生成）
            $list[$k]['service'] = $module;
            $list[$k]['second'] = $second;
            $list[$k]['ss'] = buildEsId(['service'=>$module,'second'=>$second,'_name'=>1]);
            // 3.生成资源URL
            if(!empty($tpl)){
                $urlParam = [
                    'service' => $module,
                    'template' => $tpl,
                    'id' => $v['aid'],
                ];
                $list[$k]['url'] = getUrlPath($urlParam);
                if($module=="member" && $tpl=="user"){
                    $list[$k]['url'] = str_replace("/b","",$list[$k]['url']);
                }
            }
            // 4.图片处理
            //如果有图
            if($v['picture']){
                // 图集，取第一张图片
                if($pic_multi){
                    $pics = explode($pic_split, $v['picture']);
                    $pic = getFilePath($pics[0]);
                    $pic_mum = count($pics);
                }
                // 单图
                else{
                    $pic = getFilePath($v['picture']);
                    $pic_mum = 1;
                }
                // 如果图片损坏，标记为"1"
                $pic = $pic ?: "1";
            }
            //如果没有图片
            else{
                $pic = null;
                $pic_mum = 0;
            }
            $list[$k]['picture'] = $pic;
            $list[$k]['pic_num'] = $pic_mum;
            // 5.模块特有字段
            foreach ($columns as $val){
                $list[$k][$val] = $v[$val];
            }
            // 6.处理经纬度，必须使用 lat（纬度） 和 lng（经度）
            if(isset($v['lat']) && isset($v['lng'])){
                $lat = $v['lat'] ?: "0";
                $lng = $v['lng'] ?: "0";
                unset($list[$k]['lat']);
                unset($list[$k]['lng']);
                $list[$k]['location'] = "$lat, $lng";
            }
            // 7.父子文档关系
            if(!empty($v['parent_id']) && !empty($parent)){ //自动生成父id
                if($v['parent']){
                    $parent = $v['parent'];
                }
                $parent = $v['parent'] ?: $parent;  // 如果list里存在parent，则取list，否则取默认parent
                $list[$k]['tables_join'] = array(
                    'name' => 'product',  // 目前只有 store -> product，故写死，另外父模块和子模块一致（目前是），故父模块只有二级不同
                    'parent' => buildEsId(array('service'=>$module,'second'=>$parent,'id'=>$v['parent_id']))
                );
                unset($list[$k]['parent_id']);
                if($v['parent']){
                    unset($list[$k]['parent']);
                }
            }
            // 8.视频处理
            $video_pic = $v['video_pic'] ?: null;
            if($v['videourl'] && $video_pic){
                $list[$k]['video_pic'] = getFilePath($v['video_pic']) ?: "1";
            }else{
                $list[$k]['video_pic'] = null;
            }
            unset($v['videourl']);
            // 9.城市处理(如果没有cityid，则默认为0）
            $list[$k]['cityid'] = $v['cityid'] ?: 0;

            // end.清空临时字段
            foreach ($clear as $val){
                unset($list[$k][$val]);
            }
        }
        return $list;
    }

    /**
     * 从sql同步模块到es（新增、更新）
     */
    public function asyncModule($module,$page,$second=""){
        $page = $page ?? 1;
        if(empty($module)){
            return false;
        }
        $pageSize = 1000; // 固定值
        global $dsql;
        // 解析
        $common = $this->asyncCommon($module,$second);
        if(!$common['success']){
            return false;
        }
        $sql = $common['sql'];

        // 查询数据
        $sql = $dsql->SetQuery($sql);
        $res = $dsql->getPage($page,$pageSize,$sql);

        $list = & $res['list'];

        if(!empty($list)){
            // 处理list数据
            $list = $this->formatIndex($list,$common);

            // 批量导入
            $update = $this->indexAll($list);
        }else{
            $update = 1; // 直接返回成功
        }

        // 获取结果并返回
        if($update){
            $pageInfo = & $res['pageInfo'];
            $pageInfo['size'] = count($list);

            return $pageInfo;  // 返回本次同步条数，返回总条数、总页数
        }else{
            return false;
        }
    }


    /**
     * 处理 car_store
     */
    public function module_car_store($v){

        return $this->gereral_addrid($v);

    }
    /**
     * 处理 car_list
     */
    public function module_car_list($v){
        $v = $this->gereral_addrid($v);
        global $dsql;
        // 查找经销商
        $sql = $dsql->SetQuery("select s.`store` from  `#@__car_adviser` s where s.`userid`={$v['userid']}");
        $res = $dsql->dsqlOper($sql,"results");
        if($res && is_array($res) && $res[0]['store']>0){
            $v['parent_id'] = $res[0]['store'];
        }
        // 计算首付
        if($v['staging']){
            $v['shoufu'] = sprintf("%.2f",((float)$v['price'])*(float)$v['downpayment']);
        }
        return $v;
    }
    /**
     * 处理 article_list
     */
    public function module_article_list($v){
        global $data;
        $data = "";
        $typeArr = getParentArr("articletype", $v['typeid']);
        $typeArr = array_reverse(parent_foreach($typeArr, "typename"));
        $v['typename']    = $typeArr;
        return $v;
    }
    /**
     * 处理 house_loupan
     */
    public function module_house_loupan($v){
        $v = $this->gereral_addrid($v);
        global $dsql;
        //户型数量
        $hx_room = array();
        $hx_area = array();
        $sql     = $dsql->SetQuery("SELECT `id`, `room`, `area` FROM `#@__house_apartment` WHERE `action` = 'loupan' AND `loupan` = " . $v['aid']);
        $res     = $dsql->dsqlOper($sql, "results");
        if ($res) {
            foreach ($res as $k => $value) {
                if (!in_array($value['room'], $hx_room)) {
                    $hx_room[] = $value['room'];
                }
                if ($value['area'] > 0) {
                    $hx_area[] = $value['area'];
                }
            }
            sort($hx_room);
            sort($hx_area);
        }
        $v['hx_room'] = $hx_room;
        $hx_area_ = array();
        if ($hx_area) {
            $hx_area_[0] = $hx_area[0];
            $count       = count($hx_area);
            if ($count > 1 && $hx_area[$count - 1] != $hx_area[0]) {
                $hx_area_[1] = $hx_area[$count - 1];
            }
        }
        $v['hx_area'] = $hx_area_;
        //价格单位
        if($v['ptype']==1){
            $v['price_unit'] = "元/㎡";
        }
        elseif($v['ptype']==2){
            $v['price_unit'] = "万元/套";
        }
        return $v;
    }
    /**
     * 二手房
     */
    public function module_house_sale($v){
        global $dsql;
        $houseitem                 = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v['direction']);
        $v['direction']                 = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v['direction']));
        if($v['usertype']==1){
            $sql = $dsql->SetQuery("select `zjcom` from `#@__house_zjuser` where `id`={$v['userid']}");
            $ret = $dsql->dsqlOper($sql,"results");
            if($ret && is_array($ret)){
                $v['parent_id'] = $ret[0]['zjcom'];
            }
        }
        // 指定了小区id，同时获取小区ID的addrid（用于搜索）
        if($v['communityid']){
            $communitySql = $dsql->SetQuery("SELECT `addrid`,`addr` FROM `#@__house_community` WHERE `id` = {$v['communityid']}");
            $communityResult = $dsql->getArr($communitySql);
            if($communityResult){
                $addrid = $communityResult['addrid'] ?: array(0);
                $v['addrid'] = $addrid;
            }
        }
        // 普通区域
        else{
            $v = $this->gereral_addrid($v);
        }
        //价格单位
        $v['price_unit'] = "万元";
        return $v;
    }

    /**
     * 处理house_zu
     */
    public function module_house_zu($v){
        global $dsql;
        // 指定了小区
        if($v['communityid']!=0){
            $communitySql = $dsql->SetQuery("SELECT `addrid`,`addr` FROM `#@__house_community` WHERE `id` = {$v['aid']}");
            $communityResult = $dsql->getTypeName($communitySql);
            if($communityResult){
                $addrid = $communityResult[0]['addrid'] ?: array(0);
                $v['addrid'] = $addrid;
            }
        }
        // 普通区域
        else{
            $v = $this->gereral_addrid($v);
        }
        if($v['usertype']==1){
            $sql = $dsql->SetQuery("select `zjcom` from `#@__house_zjuser` where `id`={$v['userid']}");
            $ret = $dsql->dsqlOper($sql,"results");
            if($ret && is_array($ret)){
                $v['parent_id'] = $ret[0]['zjcom'];
            }
        }
        $v['price_unit'] = "元/月";
        return $v;
    }

    /**
     * 处理 house_xzl
     */
    public function module_house_xzl($v){
        // 地区名
        $v = $this->gereral_addrid($v);
        global $dsql;
        if($v['usertype']==1){
            $sql = $dsql->SetQuery("select `zjcom` from `#@__house_zjuser` where `id`={$v['userid']}");
            $ret = $dsql->dsqlOper($sql,"results");
            if($ret && is_array($ret)){
                $v['parent_id'] = $ret[0]['zjcom'];
            }
        }
        $v['price_unit'] = $v['type'] ==0 ? "元/平方·月" : "万元";
        return $v;
    }
    /**
     * 处理 house_sp
     */
    public function module_house_sp($v){
        // 地区名
        $v = $this->gereral_addrid($v);
        global $dsql;
        if($v['usertype']==1){
            $sql = $dsql->SetQuery("select `zjcom` from `#@__house_zjuser` where `id`={$v['userid']}");
            $ret = $dsql->dsqlOper($sql,"results");
            if($ret && is_array($ret)){
                $v['parent_id'] = $ret[0]['zjcom'];
            }
        }
        if($v['type']==0){
            $v['price_unit'] = "元/月";
        }
        elseif($v['type']==1){
            $v['price_unit'] = "万元";
        }
        elseif($v['type']==2){
            $v['price_unit'] = "元/月";
        }
        return $v;
    }
    /**
     * 处理 house_cf
     */
    public function module_house_cf($v){
        // 地区名
        $v = $this->gereral_addrid($v);
        global $dsql;
        if($v['usertype']==1){
            $sql = $dsql->SetQuery("select `zjcom` from `#@__house_zjuser` where `id`={$v['userid']}");
            $ret = $dsql->dsqlOper($sql,"results");
            if($ret && is_array($ret)){
                $v['parent_id'] = $ret[0]['zjcom'];
            }
        }
        if($v['type']==0 || $v['type']==1){
            $v['price_unit'] = "元/月";
        }
        elseif($v['type']==2){
            $v['price_unit'] = "万元";
        }
        return $v;
    }

    /**
     * 处理 house_cw
     * @param $v
     * @return mixed
     */
    public function module_house_cw($v){
        global $dsql;
        if($v['usertype']==1){
            $sql = $dsql->SetQuery("select `zjcom` from `#@__house_zjuser` where `id`={$v['userid']}");
            $ret = $dsql->dsqlOper($sql,"results");
            if($ret && is_array($ret)){
                $v['parent_id'] = $ret[0]['zjcom'];
            }
        }
        if($v['type']==0 || $v['type']==2){
            $v['price_unit'] = "元/月";
        }
        elseif($v['type']==1){
            $v['price_unit'] = "万元";
        }
        return $this->gereral_addrid($v);
    }
    /**
     * 招聘企业
     */
    public function module_job_company($v){
        return $this->gereral_addrid($v);
    }
    /**
     * 处理job_post
     */
    public function module_job_post($v){
        global $dsql;
        $min_salary = $v['min_salary'];
        $max_salary = $v['max_salary'];
        if($v['salary_type']==1){
            //两者大于千，且百位均为0
            if($min_salary>=1000 && $max_salary>=1000 && $min_salary/100%10===0 && $max_salary/100%10===0){
                //如果最小最大不超万，显示千
                if($min_salary<=10000 && $max_salary<=10000){
                    $show_salary = floor($min_salary/1000)."千-".floor($max_salary/1000)."千";
                }
                //最小为千，最大为万，显示千-万
                elseif($min_salary<10000 && $max_salary>=10000){
                    $smax_salary = sprintf("%.1f",$max_salary/1000);
                    if($smax_salary%10==0){
                        $smax_salary = (int)($smax_salary/10);
                    }else{
                        $smax_salary = $smax_salary/10;
                    }
                    $show_salary = floor($min_salary/1000)."千-".$smax_salary."万";
                }
                //两者均过万，显示万-万
                else{
                    $smin_salary = sprintf("%.2f",$min_salary/1000);
                    $smax_salary = sprintf("%.2f",$max_salary/1000);
                    if($smin_salary%10==0){
                        $smin_salary = (int)($smin_salary/10);
                    }else{
                        $smin_salary = $smin_salary/10;
                    }
                    if($smax_salary%10==0){
                        $smax_salary = (int)($smax_salary/10);
                    }else{
                        $smax_salary = $smax_salary/10;
                    }
                    $show_salary = $smin_salary."-".$smax_salary."万";
                }
            }
            //百位有数字，直接显示
            else{
                $show_salary = $min_salary."-".$max_salary;
            }
        }else{
            $show_salary = $min_salary."-".$max_salary."/小时";
        }

        //面议
        if($v['mianyi']){
            $show_salary = '面议';
        }
        $v['salary'] = $show_salary;
        //工作经验要求
        $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__jobitem` WHERE `id` = " . $v["experience"]);
        $v['experience'] = $dsql->getOne($archives) ?: "";
        //解析字符串
        //小于等于
        if(preg_match("/^<=([0-9]+)/",$v['experience'],$matches)){
            $v['experience'] = $matches[1]."年以下";
        }
        //大于等于
        elseif(preg_match("/^>=([0-9]+)/",$v['experience'],$matches)){
            $v['experience'] = $matches[1]."年以上";
        }
        //区间
        elseif(preg_match("/^([0-9]+)[-]([0-9]+)/",$v['experience'],$matches)){
            $v['experience'] = $matches[1]."-".$matches[2]."年";
        }
        return $this->gereral_addrid($v);
    }

    /**
     * 处理 renovation_case
     */
    public function module_renovation_case($v){
        global $dsql;
        $ftype = $v['ftype'];
        if($ftype ==0){  // 公司
            $sql = $dsql->SetQuery("select `cityid`,'store' as 'parent', `company` 'user_name',`logo` 'user_pic' from `#@__renovation_store` where `id`={$v['fid']}");
        }elseif($ftype==1){  // 设计师
            $sql = $dsql->SetQuery("select 'foreman' as 'parent', `name` 'user_name',`photo` 'user_pic',`userid` from `#@__renovation_foreman` where `id`={$v['fid']}");

        }else{ // 团队
            $sql = $dsql->SetQuery("select 'designer' as 'parent', `name` 'user_name',`photo` 'user_pic',`userid` from `#@__renovation_team` where `id`={$v['fid']}");
        }
        $ret = $dsql->getArr($sql);
        if($ret && is_array($ret)){
            $v['user_name'] = $ret['user_name'];
            $pic = $ret['user_pic'];
            $cityid = (int)$ret['cityid'];  // 城市ID
            if($pic){
                $v['user_pic'] = getFilePath($pic);
            }
            if($ret['parent']){
                $v['parent'] = $ret['parent'];
            }
            if($ftype!=0){
                $sql2 = $dsql->SetQuery("select `cityid` from `#@__member` where id={$ret['userid']}");
                $v['cityid'] = (int)$dsql->getOne($sql2);
            }
            $v['cityid'] = $cityid;
        }
        return $v;
    }

    /**
     * 处理 travel_video
     */
    public function module_travel_video($v){
        global $dsql;
        if($v['user_pic']){
            $v['user_pic'] = getFilePath($v['user_pic']);
        }
        //视频为商家
        if($v['usertype']==1){
            $sql = $dsql->SetQuery("select `cityid` from `#@__travel_store` where id={$v['userid']}");
        }
        //个人视频
        else{
            $sql = $dsql->SetQuery("select `cityid` from `#@__member` where id={$v['userid']}");
        }
        $v['cityid'] = (int)$dsql->getOne($sql);
        return $v;
    }
    /**
     * 处理 travel_strategy
     */
    public function module_travel_strategy($v){
        global $dsql;
        if($v['user_pic']){
            $v['user_pic'] = getFilePath($v['user_pic']);
        }
        //商家
        if($v['usertype']==1){
            $sql = $dsql->SetQuery("select `cityid` from `#@__travel_store` where id={$v['userid']}");
        }
        //个人
        else{
            $sql = $dsql->SetQuery("select `cityid` from `#@__member` where id={$v['userid']}");
        }
        $v['cityid'] = (int)$dsql->getOne($sql);
        return $v;
    }


    /**
     * 处理 education_store
     */
    public function module_education_store($v){
        $v = $this->gereral_addrid($v);
        global $dsql;
        $tagArr = array();
        if(!empty($v['tag'])){
            $tag = explode(",", $v['tag']);
            foreach ($tag as $k => $value) {
                $value = (int)$value;
                $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_type` WHERE `id` = " . $value);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    array_push($tagArr, $ret[0]['typename']);
                }
            }
        }
        $v['tag'] = $tagArr;
        //统计机构的课程数
        $sql = $dsql->SetQuery("SELECT count(*) FROM `#@__education_courses` WHERE usertype=1 and userid={$v['aid']} and `state`=1");
        $v['courses'] = $dsql->getOne($sql);
        return $v;
    }

    /**
     * 处理 homemaking_store
     */
    public function module_homemaking_store($v){
        $v['sales'] = $v['sales'] ?: 0;
        return $this->gereral_addrid($v);
    }

    /**
     * 处理 homemaking_list
     */
    public function module_homemaking_list($v){
        global $dsql;
        //查找商店的认证属性、作为商品属性
        $sql = $dsql->SetQuery("select a.typename from `#@__homemaking_authattr` a where FIND_IN_SET (a.id,(select s.flag from `#@__homemaking_store` s where s.id = {$v['company']}))");
        $flag = $dsql->getArr($sql);
        $v['flag'] = join(" ",$flag);
        return $this->gereral_addrid($v);
    }

    /**
     * 处理 tieba
     */
    public function module_tieba($v2){
        $content = $v2['content'];
        if(strpos($content,'video')){
            $v2['videourl'] = 1;
        }
        global $cfg_attachment;
        global $cfg_basehost;

        $attachment = str_replace("http://".$cfg_basehost, "", $cfg_attachment);
        $attachment = str_replace("https://".$cfg_basehost, "", $attachment);

        $attachment = str_replace("/", "\/", $attachment);
        $attachment = str_replace(".", "\.", $attachment);
        $attachment = str_replace("?", "\?", $attachment);
        $attachment = str_replace("=", "\=", $attachment);

        preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $v2['content'], $picList);
        $picList = array_unique($picList[1]);


        preg_match_all("/<[img|IMG].*?src=[\'|\"](.*?(?:[\.gif|\.jpg|\.png|\.jpeg|\.GIF|\.JPG|\.PNG|\.JPEG]))[\?|\'|\"].*?[\/]?>/i", $v['content'], $picList_);
        $picList_ = array_unique($picList_[1]);

        if($picList_){
            foreach ($picList_ as $k => $v) {
                if(!strstr($v, 'attachment') && !strstr($v, 'emot')){
                    array_push($picList, (strstr($v, 'http') || strstr($v, '/tieba/') ? '' : (strstr($v, '/static/images/ui/') ? '' : (strstr($v, '/uploads/') ? '' : '/tieba/'))) . $v);
                }
            }
        }
        //内容图片  如果后台开启隐藏附件路径功能，这里就不获取不到图片了
        if(!empty($picList)){
            foreach($picList as $v_){
                $filePath = getRealFilePath($v_);
                $fileType = explode(".", $filePath);
                $fileType = strtolower($fileType[count($fileType) - 1]);
                $fileType = explode('?', $fileType);
                $fileType = $fileType[0];
                $ftype = array("jpg", "jpge", "gif", "jpeg", "png", "bmp");
                if(in_array($fileType, $ftype) && !strstr($filePath, 'video')){
                    $imgGroup[] = $filePath;
                    $v2['picture'] = $filePath;
                    $v2['video_pic'] = $filePath;
                    break;
                }elseif($fileType == 'mp4' || $fileType == 'mov'){
                    $video = $filePath;
                }
            }
        }
        $v2['user_pic'] = getFilePath($v2['user_pic']) ?: "1";
        return $v2;
    }

    /**
     * 处理教育课程
     */
    public function module_education_list($v){
        global $dsql;
        // 公司来源
        if($v['usertype']==1){
            $v['parent'] = 'store';
            $v['parent_id'] = $v['userid'];
            $sql = $dsql->SetQuery("select `cityid` from `#@__education_store` where `id`={$v['userid']}");
        }
        // 个人来源
        else{
            $sql = $dsql->SetQuery("select `cityid` from `#@__member` where `id`={$v['userid']}");
        }
        $v['cityid'] = (int)$dsql->getOne($sql);
        return $v;
    }
    public function module_member($v){
        $id = $v['aid'];
        global $handler;
        $handler = true;
        $detailHandels  = new handlers('member', "fabuCount");
        $detailConfig   = $detailHandels->getHandle(array("uid" => $id));
        $detailConfig   = $detailConfig['state'] == 100 ? $detailConfig['info'] : array();

        $usercountall   = $detailConfig ? array_column($detailConfig, 'countall','modulename') : array();
        $allcount       = $detailConfig ? array_sum($usercountall) : 0;

        $v['fabuCount'] = $allcount;
        return $v;
    }
    public function module_house_zjUser($v){
        global $dsql;
        $num = 0;  // 在售数量
        //二手房
        $archives                = $dsql->SetQuery("SELECT `id` FROM `#@__house_sale` WHERE `state` = 1 AND `usertype` = 1 AND `userid` = " . $v['aid']);
        $sale                    = (int)$dsql->dsqlOper($archives, "totalCount");
        $num                     += $sale;
        //租房
        $archives              = $dsql->SetQuery("SELECT `id` FROM `#@__house_zu` WHERE `state` = 1 AND `usertype` = 1 AND `userid` = " . $v['aid']);
        $zu                    = (int)$dsql->dsqlOper($archives, "totalCount");
        $num                   += $zu;
        //写字楼
        $archives               = $dsql->SetQuery("SELECT `id` FROM `#@__house_xzl` WHERE `state` = 1 AND `usertype` = 1 AND `userid` = " . $v['aid']);
        $xzl                    = (int)$dsql->dsqlOper($archives, "totalCount");
        $num                    += $xzl;
        //商铺
        $archives              = $dsql->SetQuery("SELECT `id` FROM `#@__house_sp` WHERE `state` = 1 AND `usertype` = 1 AND `userid` = " . $v['aid']);
        $sp                    = (int)$dsql->dsqlOper($archives, "totalCount");
        $num                   += $sp;
        //厂房
        $archives              = $dsql->SetQuery("SELECT `id` FROM `#@__house_cf` WHERE `state` = 1 AND `usertype` = 1 AND `userid` = " . $v['aid']);
        $cf                    = (int)$dsql->dsqlOper($archives, "totalCount");
        $num                   += $cf;
        //车位
        $archives              = $dsql->SetQuery("SELECT `id` FROM `#@__house_cw` WHERE `state` = 1 AND `usertype` = 1 AND `userid` = " . $v['aid']);
        $cw                    = (int)$dsql->dsqlOper($archives, "totalCount");
        $num                   += $cw;
        $v['sale'] = $num;
        return $v;
    }

    public function module_dating_hn($v){
        global $dsql;
        $sql = "SELECT COUNT(d.`id`) total FROM `#@__dating_member` d LEFT JOIN `#@__member` m ON m.`id` = d.`userid` WHERE m.`id` = d.`userid` AND d.`type` = 0 AND d.`state` = 1 AND d.`dateswitch` = 1 AND d.`company` = {$v['aid']} AND d.`photo` != ''";
        $v['memberCount'] = $dsql->getOne($sql);
        return $v;
    }

    public function module_renovation_foreman($v){
        global $dsql;
        if($v['type']==1){
            $sql = $dsql->SetQuery("select `cityid` from `#@__renovation_store` where `id`={$v['company']}");
        }
        else{
            $sql = $dsql->SetQuery("select `cityid` from `#@__member` where `id`={$v['userid']}");
        }
        $v['cityid'] = (int)$dsql->getOne($sql);
        return $v;
    }

    public function module_renovation_designer($v){
        global $dsql;
        if($v['type']==1){
            $sql = $dsql->SetQuery("select `cityid` from `#@__renovation_store` where `id`={$v['company']}");
        }
        else{
            $sql = $dsql->SetQuery("select `cityid` from `#@__member` where `id`={$v['userid']}");
        }
        $v['cityid'] = (int)$dsql->getOne($sql);
        return $v;
    }


    public function module_tuan_store($v){
        $v = $this->gereral_addrid($v);
        $loc = $v['lnglat'];
        $loc = explode(",",$loc);
        if(count($loc)>1){
            $v['lng'] = $loc[0];
            $v['lat'] = $loc[1];
        }
        return $v;
    }


    //根据 addrid， 取得 addrid 列表以及 addrName列表
    private function gereral_addrid($v){
        $addrName = getParentArr("site_area", $v['addrid']);
        global $data;
        $data                 = "";
        $addrNames             = array_reverse(parent_foreach($addrName, "typename"));
        $v['addrName'] = $addrNames;
        // 区域id
        $data = "";
        $addrid = array_reverse(parent_foreach($addrName, "id"));
        if(empty($addrid)){
            $addrid = array(0);
        }
        $v['addrid'] = $addrid;
        return $v;
    }

    public function module_travel_store($v){
        return $this->gereral_addrid($v);
    }

    public function module_house_zjCom($v){
        global $dsql;
        //统计二手房和租房数量
        $arcZu = $dsql->SetQuery("SELECT count(z.`id`) AS countZu FROM `#@__house_zu` z WHERE `state`=1 and  `userid` in(SELECT z.`id` FROM `#@__house_zjuser` z WHERE z.`zjcom` = {$v['aid']})");
        $retZu = $dsql->dsqlOper($arcZu, "results");
        $houses = 0;
        if ($retZu) {
            $houses += $retZu[0]['countZu'];
        }
        $arcSale = $dsql->SetQuery("SELECT count(s.`id`) AS countSale FROM `#@__house_sale` s WHERE `state`=1 and `userid` in(SELECT z.`id` FROM `#@__house_zjuser` z WHERE z.`zjcom` = {$v['aid']})");
        $retSale = $dsql->dsqlOper($arcSale, "results");
        if ($retSale) {
            $houses += $retSale[0]['countSale'];
        }
        $v['houses'] = $houses;
        $v['lat'] = 0;
        $v['lng'] = 0;
        return $this->gereral_addrid($v);
    }

    public function module_renovation_store($v){
        $loc = $v['lnglat'];
        $loc = explode(",",$loc);
        if(count($loc)>1){
            $v['lng'] = $loc[0];
            $v['lat'] = $loc[1];
        }
        return $this->gereral_addrid($v);
    }

    public function module_travel_hotel($v){

        return $this->gereral_addrid($v);
    }

    public function module_marry_hstore($v){
        global $dsql;
        //第一个宴会厅名称、宴会厅数量、最小桌数-最大桌数
        $sql = $dsql->SetQuery("select `title`,min(maxtable) 'min',max(maxtable) 'max',count(*) 'count' from `#@__marry_hotelfield` where `id`={$v['aid']} and `state`=1");
        $arr = $dsql->getArr($sql);
        $v['yanhuit'] = $arr['title'] ?: "";
        $v['minTable'] = $arr['min'] ?: 0;
        $v['maxTable'] = $arr['max'] ?: 0;
        $v['countyanhuit'] = $arr['count'] ?: 0;
        //菜单，最低价格~最高价格
        $sql = $dsql->SetQuery("select min(price) 'min',max(price) 'max' from `#@__marry_hotelmenu` where `id`={$v['aid']} and `state`=1");
        $arr = $dsql->getArr($sql);
        $v['minPrice'] = $arr['min'] ?: 0;
        $v['maxPrice'] = $arr['max'] ?: 0;
        //评论数
        $sql = $dsql->SetQuery("SELECT count(*) FROM `#@__public_comment` WHERE `ischeck` = 1 AND `type` = 'marry-store' AND `aid` = {$v['aid']} AND `pid` = 0");
        $v['comment'] = $dsql->getOne($sql);
        return $this->gereral_addrid($v);
    }

    public function module_shop_store($v){
        global $dsql;
        //同城配送 OR 全国快递 OR 到店消费（默认）
        if($v['merchant_deliver'] || $v['distribution']){
            $v['type'] = 1;
        }
        else{
            $v['type'] = $v['express'] ? 2 : 0;
        }
        //评分
        $sql    = $dsql->SetQuery("SELECT count(c.`id`) FROM `#@__public_comment` c LEFT JOIN `#@__shop_order` o ON o.`id` = c.`oid` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND c.`type` = 'shop-order' AND o.`store` = {$v['aid']} AND c.`pid` = 0");
        $rcount = (int)$dsql->getOne($sql);
        $sql     = $dsql->SetQuery("SELECT count(c.`id`) hpcount FROM `#@__public_comment` c LEFT JOIN `#@__shop_order` o ON o.`id` = c.`oid` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND c.`rating` = 1 AND c.`type` = 'shop-order' AND o.`store` = {$v['aid']} AND c.`pid` = 0");
        $res    = $dsql->dsqlOper($sql, "results");
        $hpcount = $res[0]['hpcount'];
        $rating               = $hpcount > 0 ? ($hpcount / $rcount * 100) : 0;
        $rating = ($rating > 0 ? sprintf("%.2f", $rating) : 0) . "%";
        $v['star'] = number_format(0.05 * $rating,2);
        return $this->gereral_addrid($v);
    }

    public function module_dating_store($v){
        global $dsql;
        //统计门店会员数量（先找出门店所有红娘，再统计每个红娘的所有会员）
        $sql = $dsql->SetQuery("SELECT COUNT(d.`id`) total FROM `#@__dating_member` d LEFT JOIN `#@__member` m ON m.`id` = d.`userid` WHERE m.`id` = d.`userid` AND d.`type` = 0 AND d.`state` = 1 AND d.`dateswitch` = 1 AND d.`photo` != '' AND d.`company` in (select `id` from #@__dating_member where `type` = 1 and `state`=1 and `company`={$v['aid']})");
        $v['memberCount'] = $dsql->getOne($sql);
        return $this->gereral_addrid($v);
    }

    /**
     * 养老机构
     */
    public function module_pension_store($v){
        if($v['catid']){
            include_once(HUONIAOROOT."/api/handlers/pension.class.php");
            $pension = new Pension();
            $typelist = $pension->catid_type();
            $typelist = array_column($typelist,"typename","id");
            $catids = explode(",",$v['catid']);
            foreach ($catids as $k=>$val){
                $typenames[] = $typelist[$val];
            }
            $v['type'] = join("、",$typenames);
        }
        return $this->gereral_addrid($v);
    }

    public function module_marry_nhstore($v){
        global $dsql;
        //展示案例最多的名称
        $bind_module = explode(",",$v['bind_module']);
        $max = 0;
        $v['tag'] = "婚纱摄影";  // 默认值
        foreach ($bind_module as $item){
            if($item==1){
                $sql = $dsql->SetQuery("select count(*) from `#@__marry_planmeal` l where l.`company`={$v['aid']} and  l.`state`=1 AND l.`type` = '1'");
                $count = $dsql->getOne($sql);
                if($count>$max){
                    $max = $count;
                    $v['tag'] = "婚纱摄影";
                }
            }
            elseif($item==2){
                $sql = $dsql->SetQuery("select count(*) from `#@__marry_planmeal` l where l.`company`={$v['aid']} and  l.`state`=1 AND l.`type` = '2'");
                $count = $dsql->getOne($sql);
                if($count>$max){
                    $max = $count;
                    $v['tag'] = "摄影跟拍";
                }
            }
            elseif($item==3){
                $sql = $dsql->SetQuery("select count(*) from `#@__marry_planmeal` l where l.`company`={$v['aid']} and  l.`state`=1 AND l.`type` = '3'");
                $count = $dsql->getOne($sql);
                if($count>$max){
                    $max = $count;
                    $v['tag'] = "珠宝首饰";
                }
            }
            elseif($item==4){
                $sql = $dsql->SetQuery("select count(*) from `#@__marry_planmeal` l where l.`company`={$v['aid']} and  l.`state`=1 AND l.`type` = '4'");
                $count = $dsql->getOne($sql);
                if($count>$max){
                    $max = $count;
                    $v['tag'] = "摄像跟拍";
                }
            }
            elseif($item==5){
                $sql = $dsql->SetQuery("select count(*) from `#@__marry_planmeal` l where l.`company`={$v['aid']} and  l.`state`=1 AND l.`type` = '5'");
                $count = $dsql->getOne($sql);
                if($count>$max){
                    $max = $count;
                    $v['tag'] = "新娘跟妆";
                }
            }
            elseif($item==6){
                $sql = $dsql->SetQuery("select count(*) from `#@__marry_planmeal` l where l.`company`={$v['aid']} and  l.`state`=1 AND l.`type` = '6'");
                $count = $dsql->getOne($sql);
                if($count>$max){
                    $max = $count;
                    $v['tag'] = "婚纱礼服";
                }
            }
            elseif($item==7){
                $sql = $dsql->SetQuery("select count(*) from `#@__marry_host` l where l.`state`=1 and l.`company`={$v['aid']}");
                $count = $dsql->getOne($sql);
                if($count>$max){
                    $max = $count;
                    $v['tag'] = "婚礼主持";
                }
            }
            elseif($item==9){
                $sql = $dsql->SetQuery("select count(*) from `#@__marry_planmeal` l where l.`company`={$v['aid']} and  l.`state`=1 AND l.`type` = '9'");
                $count = $dsql->getOne($sql);
                if($count>$max){
                    $max = $count;
                    $v['tag'] = "婚礼策划";
                }
            }
            elseif($item==10){
                $sql = $dsql->SetQuery("select count(*) from `#@__marry_weddingcar` l where l.`state`=1 and l.`company`={$v['aid']}");
                $count = $dsql->getOne($sql);
                if($count>$max){
                    $max = $count;
                    $v['tag'] = "租婚车";
                }
            }
        }

        //评论数
        $sql = $dsql->SetQuery("SELECT count(*) FROM `#@__public_comment` WHERE `ischeck` = 1 AND `type` = 'marry-store' AND `aid` = {$v['aid']} AND `pid` = 0");
        $v['comment'] = $dsql->getOne($sql);
        return $this->gereral_addrid($v);
    }

    public function module_waimai_store($v){
        return $this->gereral_addrid($v);
    }

    public function module_tuan_product($v){
        return $this->gereral_addrid($v);
    }

    public function module_info($v){
        //去掉html标签
        $v['title'] = strip_tags($v['title']);
        $v['title'] = str_replace(array("\r\n", "\r", "\n","&nbsp;", "&zwnj;"), "", $v['title']);
        //用户头像
        $v['user_pic'] = getFilePath($v['user_pic']) ?: "1";
        return $v;
    }

    public function module_house_community($v){
        global $dsql;
        //二手房数量
        $sql                     = $dsql->SetQuery("SELECT `id` FROM `#@__house_sale` WHERE `state` = 1 AND `communityid` = " . $v['aid']);
        $saleCount               = $dsql->dsqlOper($sql, "totalCount");
        $v['onsale'] = $saleCount ?: 0;

        //出租房数量
        $sql                   = $dsql->SetQuery("SELECT `id` FROM `#@__house_zu` WHERE `state` = 1 AND `communityid` = " . $v['aid']);
        $zuCount               = $dsql->dsqlOper($sql, "totalCount");
        $v['onzu'] = $zuCount ?: 0;

        //物业类型
        $sql  = $dsql->SetQuery("select `typename` from `#@__houseitem` where id in({$v['protype']})");
        $res = $dsql->getArr($sql);
        if(is_array($res)){
            $res = array_values($res);
            $v['protype'] = $res;
        }
        else{
            $v['protype'] = array();
        }


        return $this->gereral_addrid($v);
    }

    public function module_video($v){
        $v['user_pic'] = getFilePath($v['user_pic']) ?: "1";
        return $v;
    }

    public function module_live($v){
        $v['user_pic'] = getFilePath($v['user_pic']) ?: "1";
        return $v;
    }

    public function module_circle($v){
        $v['user_pic'] = getFilePath($v['user_pic']) ?: "1";
        return $v;
    }

    public function module_travel_daytravel($v){
        global $dsql;
        $sql = $dsql->SetQuery("select sum(t.sale) from `#@__travel_agency` a  LEFT JOIN  `#@__travel_ticketinfo` t ON a.`id`=t.`ticketid` where a.`typeid`=0 and t.`typeid`=1 and a.`id`={$v['aid']}");
        $v['sales'] = (int)$dsql->getOne($sql);
        return $v;
    }

    public function module_travel_grouptravel($v){
        global $dsql;
        $sql = $dsql->SetQuery("select sum(t.sale) from `#@__travel_agency` a  LEFT JOIN  `#@__travel_ticketinfo` t ON a.`id`=t.`ticketid` where a.`typeid`=1 and t.`typeid`=1 and a.`id`={$v['aid']}");
        $v['sales'] = (int)$dsql->getOne($sql);
        return $v;
    }
}
