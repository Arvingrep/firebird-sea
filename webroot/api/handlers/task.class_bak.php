<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 任务悬赏模块API接口
 *
 * @version        $Id: task.class.php 2022-08-20 下午13:18:21 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2050, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class task {
	private $param;  //参数
    public $taskModuleAuth = '';

	/**
     * 构造函数
	 *
     * @param string $action 动作名
     */
    public function __construct($param = array()){
		$this->param = $param;

        //验证系统文件
        if(!file_exists(HUONIAOINC.'/kernel.inc.php')){
            $this->taskModuleAuth = '未加载火鸟门户系统核心文件！';
        }
        
        global $cfg_officialDomain;
        if($cfg_officialDomain != 'https://www.kumanyun.com'){
            $this->taskModuleAuth = '火鸟门户系统核心文件异常！';
        }

        //模块状态，未启用时，所有接口均输出停用内容！
        $_config = $this->config();
        if($_config['channelSwitch'] == 1){
            $this->taskModuleAuth = $_config['closeCause'];
        }

        //验证是否有当前模块使用权限
        if(!$this->checkAuth('task')){
            $this->taskModuleAuth = '您已被禁止使用该模块所有功能！';
        }
	}

    //验证用户权限
    public function checkAuth($auth){
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        if($userid > -1){
            //查询黑名单表
            $time = GetMkTime(time());
            $sql = $dsql->SetQuery("SELECT `auth` FROM `#@__task_member_black` WHERE `uid` = $userid AND (`expired` = 0 OR `expired` > $time)");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $_auth = $ret[0]['auth'];
                $authArr = explode(',', $_auth);
                if(in_array($auth, $authArr)){
                    return false;
                }
            }
        }
        return true;
    }

	/**
     * 基本参数
     * @return array
     */
	public function config(){

		require(HUONIAOINC."/config/task.inc.php");

		global $cfg_hotline;              //系统默认咨询热线
		global $cfg_weblogo;              //系统默认logo地址
		global $cfg_softSize;             //系统附件上传限制大小
		global $cfg_softType;             //系统附件上传类型限制
		global $cfg_thumbSize;            //系统缩略图上传限制大小
		global $cfg_thumbType;            //系统缩略图上传类型限制
		global $cfg_atlasSize;            //系统图集上传限制大小
		global $cfg_atlasType;            //系统图集上传类型限制

		//获取当前城市名
		global $siteCityInfo;
		if(is_array($siteCityInfo)){
			$cityName = $siteCityInfo['name'];
		}

		//如果上传设置为系统默认，则以下参数使用系统默认
		if($customUpload == 0){
			$custom_softSize = $cfg_softSize;
			$custom_softType  = $cfg_softType;
			$custom_thumbSize = $cfg_thumbSize;
			$custom_thumbType = $cfg_thumbType;
			$custom_atlasSize = $cfg_atlasSize;
			$custom_atlasType = $cfg_atlasType;
		}

		$hotline = $hotline_config == 0 ? $cfg_hotline : $customHotline;

		$params = !empty($this->param) && !is_array($this->param) ? explode(',',$this->param) : "";

		$customChannelDomain = getDomainFullUrl('task', $customSubDomain);

        //分站自定义配置
        $ser = 'task';
        global $siteCityAdvancedConfig;
        if($siteCityAdvancedConfig && $siteCityAdvancedConfig[$ser]){
            if($siteCityAdvancedConfig[$ser]['title']){
                $customSeoTitle = $siteCityAdvancedConfig[$ser]['title'];
            }
            if($siteCityAdvancedConfig[$ser]['keywords']){
                $customSeoKeyword = $siteCityAdvancedConfig[$ser]['keywords'];
            }
            if($siteCityAdvancedConfig[$ser]['description']){
                $customSeoDescription = $siteCityAdvancedConfig[$ser]['description'];
            }
            if($siteCityAdvancedConfig[$ser]['logo']){
                $customLogoUrl = $siteCityAdvancedConfig[$ser]['logo'];
            }
            if($siteCityAdvancedConfig[$ser]['hotline']){
                $hotline = $siteCityAdvancedConfig[$ser]['hotline'];
            }
        }

		$customSeoDescription = trim($customSeoDescription);

		$return = array();
		if(!empty($params) > 0){

			foreach($params as $key => $param){
				if($param == "channelName"){
					$return['channelName'] = str_replace('$city', $cityName, $customChannelName);
				}elseif($param == "logoUrl"){

					//自定义LOGO
					if($customLogo == 1){
						$customLogoPath = getAttachemntFile($customLogoUrl);
					}else{
						$customLogoPath = getAttachemntFile($cfg_weblogo);
					}

					$return['logoUrl'] = $customLogoPath;
				}elseif($param == "subDomain"){
					$return['subDomain'] = $customSubDomain;
				}elseif($param == "channelDomain"){
					$return['channelDomain'] = $customChannelDomain;
				}elseif($param == "channelSwitch"){
					$return['channelSwitch'] = $customChannelSwitch;
				}elseif($param == "closeCause"){
					$return['closeCause'] = $customCloseCause;
				}elseif($param == "title"){
					$return['title'] = str_replace('$city', $cityName, $customSeoTitle);
				}elseif($param == "keywords"){
					$return['keywords'] = str_replace('$city', $cityName, $customSeoKeyword);
				}elseif($param == "description"){
					$return['description'] = str_replace('$city', $cityName, $customSeoDescription);
				}elseif($param == "hotline"){
					$return['hotline'] = $hotline;
				}elseif($param == "submission"){
					$return['submission'] = $submission;
				}elseif($param == "atlasMax"){
					$return['atlasMax'] = $customAtlasMax;
				}elseif($param == "template"){
					$return['template'] = $customTemplate;
				}elseif($param == "touchTemplate"){
					$return['touchTemplate'] = $customTouchTemplate;
				}elseif($param == "softSize"){
					$return['softSize'] = $custom_softSize;
				}elseif($param == "softType"){
					$return['softType'] = $custom_softType;
				}elseif($param == "thumbSize"){
					$return['thumbSize'] = $custom_thumbSize;
				}elseif($param == "thumbType"){
					$return['thumbType'] = $custom_thumbType;
				}elseif($param == "atlasSize"){
					$return['atlasSize'] = $custom_atlasSize;
				}elseif($param == "atlasType"){
					$return['atlasType'] = $custom_atlasType;
				}
			}

		}else{

			//自定义LOGO
			if($customLogo == 1){
				$customLogoPath = getAttachemntFile($customLogoUrl);
			}else{
				$customLogoPath = getAttachemntFile($cfg_weblogo);
			}

			$return['channelName']   = str_replace('$city', $cityName, $customChannelName);
			$return['logoUrl']       = $customLogoPath;
			$return['subDomain']     = $customSubDomain;
			$return['channelDomain'] = $customChannelDomain;
			$return['channelSwitch'] = $customChannelSwitch;
			$return['closeCause']    = $customCloseCause;
			$return['title']         = str_replace('$city', $cityName, $customSeoTitle);
			$return['keywords']      = str_replace('$city', $cityName, $customSeoKeyword);
			$return['description']   = str_replace('$city', $cityName, $customSeoDescription);
			$return['hotline']       = $hotline;
			$return['template']      = $customTemplate;
			$return['touchTemplate'] = $customTouchTemplate;
			$return['softSize']      = $custom_softSize;
			$return['softType']      = $custom_softType;
			$return['thumbSize']     = $custom_thumbSize;
			$return['thumbType']     = $custom_thumbType;
			$return['atlasSize']     = $custom_atlasSize;
			$return['atlasType']     = $custom_atlasType;

            //分享默认图
            $return['sharePic'] = getFilePath($customSharePic);

            //发布审核
			$return['fabuCheck'] = (int)$customfabuCheck;  //0需要审核  1不需要审核

            //发布任务步骤选项
            $return['fabuParam'] = explode(',', $customfabuParam);

            //发布数量限制
			$return['fabuCount'] = (int)$customfabuCount;

            //发布任务平台抽佣
			$return['fabuFee'] = (int)$customfabuFee;

            //刷新任务费用
			$return['refreshPrice'] = (float)$customrefreshPrice;

            //置顶任务费用
			$return['bidPrice'] = (float)$custombidPrice;

            //分销
            $return['fenXiao'] = (int)$customfenXiao;  //0禁用  1启用

            //分销佣金比例
			$return['fenxiaoFee'] = (int)$customfenxiaoFee;

            //主题背景颜色
            $return['themeBackgroundColor'] = $customthemeBackgroundColor ? $customthemeBackgroundColor : '#ffdf1a';

            //主题文字颜色
            $return['themeFontColor'] = $customthemeFontColor ? $customthemeFontColor : '#333333';

            //教程链接
            $return['helpLink1'] = $customhelpLink1;  //接单规则链接
            $return['helpLink2'] = $customhelpLink2;  //发布任务规则链接
            $return['helpLink3'] = $customhelpLink3;  //发布教程链接
            $return['helpLink4'] = $customhelpLink4;  //发布任务协议
            $return['helpLink5'] = $customhelpLink5;  //会员服务协议
            $return['helpLink6'] = $customhelpLink6;  //屏蔽规则
            $return['helpLink7'] = $customhelpLink7;  //举报规则

            //客服配置
            $return['kefuLink'] = $customkefuLink;  //客服链接
            $return['kefuId'] = $customkefuId;  //企业微信ID

            //反馈问题原因
            $feedback = trim($customfeedback);
            $return['feedback'] = explode("\r\n", $feedback);

            //商家拒审原因
            $refusalReasonList = array();
            $refusalReason = trim($customrefusalReason);
            $refusalReasonArr = explode("\r\n", $refusalReason);
            if($refusalReasonArr){
                foreach($refusalReasonArr as $key => $val){
                    $val = trim($val);
                    $_val = explode('#', $val);
                    if($val != '' && $_val[0] != ''){
                        array_push($refusalReasonList, array(
                            'title' => $_val[0],
                            'note' => $_val[1] ? $_val[1] : ''
                        ));
                    }
                }
            }
            $return['refusalReason'] = $refusalReasonList;
		}

		return $return;

	}


	/**
     * 任务类型
     * @return array
     */
	public function type(){
		global $dsql;
		$type = $page = $pageSize = 0;

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
			}
		}
		$results = $dsql->getTypeList($type, "task_type", 0, $page, $pageSize);
		if($results){
			return $results;
		}
	}


	/**
     * 自定义菜单
     * @return array
     */
	public function menu(){
		global $dsql;
		$type = $page = $pageSize = 0;

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
			}
		}
		$results = $dsql->getTypeList($type, "task_menu", 0, $page, $pageSize);
		if($results){
			return $results;
		}
	}


	/**
     * 商家中心链接
     * @return array
     */
	public function businessLink(){
		global $dsql;
		$type = $page = $pageSize = 0;

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
			}
		}
		$results = $dsql->getTypeList($type, "task_business_link", 1, $page, $pageSize);
		if($results){
			return $results;
		}
	}


	/**
     * 会员等级
     * @return array
     */
	public function memberLevel(){
		global $dsql;
		$type = $page = $pageSize = 0;

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
			}
		}
		$results = $dsql->getTypeList($type, "task_member_level", 0, $page, $pageSize);
		if($results){

            // require(HUONIAOINC."/config/task.inc.php");

            // $normal = array(
            //     'id' => 0,
            //     'parentid' => 0,
            //     'typename' => '免费用户',
            //     'title' => '免费用户',
            //     'iconturl' => '',
            //     'icon' => '',
            //     'price' => 0,
            //     'mprice' => 0,
            //     'duration_month' => 0,
            //     'duration_note' => '',
            //     'refresh_coupon' => 0,
            //     'refresh_discount' => 100,
            //     'bid_coupon' => 0,
            //     'bid_discount' => 100,
            //     'fabu_count' => (int)$customfabuCount,
            //     'fabu_fee' => (int)$customfabuFee,
            //     'task_fee' => 0,
            //     'bgcolor' => '',
            //     'fontcolor' => '',
            //     'equity' => array()
            // );

            // array_unshift($results, $normal);

			return $results;
		}
	}


	/**
     * 会员信息
     * @return array
     */
	public function memberInfo(){
		global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();

        $id = $this->param;
		$id = is_numeric($id['id']) ? $id['id'] : $userid;  //获取指定用户的，如果没有指定，则使用当前登录用户的
        $from = $this->param['from'];  //来源，默认个人，store商家
		if($id == -1) return array("state" => 200, "info" => '登录超时，请重新登录！');
		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		if($id < 1) return array("state" => 200, "info" => '格式错误！');

        //获取系统会员基本信息
		$userinfo = $userLogin->getMemberInfo($id);

        $data = array();

        //提取需要的会员基本信息
        $data['uid'] = (int)$id;
        $data['photo'] = $userinfo['photo'];
        $data['nickname'] = $userinfo['nickname'];
        $data['certifyState'] = (int)$userinfo['certifyState'];

        //不是本人，不输出余额信息
        if($id == $userid){
            $data['money'] = (float)$userinfo['money'];
        }

        $data['promotion'] = (float)$userinfo['promotion'];

        require(HUONIAOINC."/config/task.inc.php");
        $fabuCount = (float)$customfabuCount;  //普通会员可以发布进行中的任务数量上限

        //任务悬赏模块的会员信息
        $level = array();
        $_time = (int)GetMkTime(time());  //当前时间
        $sql = $dsql->SetQuery("SELECT `level`, `open_time`, `end_time`, `refresh_coupon`, `bid_coupon` FROM `#@__task_member` WHERE `uid` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_data = $ret[0];

            //未过期
            if($_data['end_time'] > $_time){

                $name = "";
                $sql   = $dsql->SetQuery("SELECT `typename`, `icon`, `bgcolor`, `fontcolor`, `fabu_count` FROM `#@__task_member_level` WHERE `id` = " . $_data['level']);
                $ret   = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $name = $ret[0]['typename'];
                    $level['id'] = (int)$_data['level'];
                    $level['icon'] = getFilePath($ret[0]['icon']);
                    $level['bgcolor'] = $ret[0]['bgcolor'];
                    $level['fontcolor'] = $ret[0]['fontcolor'];

                    $fabuCount = (int)$ret[0]['fabu_count'];  //VIP会员可以发布进行中的任务数量上限
                }
                $level['name'] = $name;

                //本人查看数据
                if($id == $userid){
                    $level['open_time'] = (int)$_data['open_time'];
                    $level['end_time'] = (int)$_data['end_time'];
                }

            }

            //本人查看数据
            if($id == $userid){
                $data['refresh_coupon'] = (int)$_data['refresh_coupon'];
                $data['bid_coupon'] = (int)$_data['bid_coupon'];
            }

        }else{

            //本人查看数据
            if($id == $userid){
                $data['refresh_coupon'] = (int)$_data['refresh_coupon'];
                $data['bid_coupon'] = (int)$_data['bid_coupon'];
            }
            
        }
        $data['level'] = $level;

        //本人查看数据
        if($id == $userid){

            //统计提现信息（今日到账、审核中的）
            $receipt = 0;
            $stime = GetMkTime(date('Y-m-d'));
            $etime = GetMkTime(date('Y-m-d') . " 23:59:59");
            $sql = $dsql->SetQuery("SELECT SUM(`price`) price FROM `#@__task_order` WHERE `uid` = '$userid' AND `state` = 2 AND `sh_time` >= $stime AND `sh_time` <= $etime");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $receipt = $ret[0]['price'];
            }

            $review = 0;
            $sql = $dsql->SetQuery("SELECT SUM(`price`) price FROM `#@__task_order` WHERE `uid` = '$userid' AND `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $review = $ret[0]['price'];
            }

            $withdraw = array("receipt" => (float)(sprintf("%.2f", $receipt)), "review" => (float)(sprintf("%.2f", $review)));
            $data['withdraw'] = $withdraw;

            //待办事项，待审核订单、审核失败订单、举报待我处理
            $todo = array();

            //商家中心的举报待办只需要调取被举报人和发布人都是当前登录用户
            $time = GetMkTime(time());
            if($from == 'store'){
                $sql = $dsql->SetQuery("SELECT (SELECT count(`id`) FROM `#@__task_order` WHERE `sid` = '$id' AND `state` = 1) as `review`, (SELECT count(`id`) FROM `#@__task_order` WHERE `sid` = '$id' AND `state` = 3) as `fail`, (SELECT count(o.`id`) FROM `#@__task_order` o LEFT JOIN `#@__task_list` l ON l.`id` = o.`tid` WHERE o.`sid` = '$id' AND o.`state` = 0 AND l.`sh_time` <= 60 AND ((l.`js_began_time` < $time AND l.`js_end_time` > $time) OR l.`js_sh_time_bak` <= 60)) as `fast`, (SELECT count(`id`) FROM `#@__task_report` WHERE `mid` = '$id' AND `state` = 0 AND `sid` = '$id') as `report`");
            }
            //个人中心的举报待办只需要调取被举报人是当前登录用户，并且发布人不是当前登录用户，个人中心不处理商家举报订单
            else{
                $sql = $dsql->SetQuery("SELECT (SELECT count(`id`) FROM `#@__task_order` WHERE `sid` = '$id' AND `state` = 1) as `review`, (SELECT count(`id`) FROM `#@__task_order` WHERE `sid` = '$id' AND `state` = 3) as `fail`, (SELECT count(o.`id`) FROM `#@__task_order` o LEFT JOIN `#@__task_list` l ON l.`id` = o.`tid` WHERE o.`sid` = '$id' AND o.`state` = 0 AND l.`sh_time` <= 60 AND ((l.`js_began_time` < $time AND l.`js_end_time` > $time) OR l.`js_sh_time_bak` <= 60)) as `fast`, (SELECT count(`id`) FROM `#@__task_report` WHERE `mid` = '$id' AND `state` = 0 AND `sid` != '$id') as `report`");
            }
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $todo = array(
                    'review' => (int)$ret[0]['review'],
                    'fail' => (int)$ret[0]['fail'],
                    'fast' => (int)$ret[0]['fast'],
                    'report' => (int)$ret[0]['report']
                );
            }
            $data['todo'] = $todo;

            //任务状态统计，未上线、进行中、已暂停/冻结、已结束
            $task = array();
            $sql = $dsql->SetQuery("SELECT (SELECT count(`id`) FROM `#@__task_list` WHERE `uid` = '$id' AND (`state` = 0 OR `state` = 2)) as `state0`, (SELECT count(`id`) FROM `#@__task_list` WHERE `uid` = '$id' AND `state` = 1 AND `finish` = 0) as `state1`, (SELECT count(`id`) FROM `#@__task_list` WHERE `uid` = '$id' AND (`state` = 3 OR `state` = 4)) as `state2`, (SELECT count(`id`) FROM `#@__task_list` WHERE `uid` = '$id' AND `state` = 1 AND `finish` = 1) as `state3`");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $task = array(
                    'state0' => (int)$ret[0]['state0'],
                    'state1' => (int)$ret[0]['state1'],
                    'state2' => (int)$ret[0]['state2'],
                    'state3' => (int)$ret[0]['state3']
                );
            }
            $data['task'] = $task;

            $alreadyFabu = 0;
            if($task){
                $alreadyFabu = $task['state0'] + $task['state1'] + $task['state2'];
            }

            //剩余发布数量
            $data['surplusReleaseCount'] = (int)($fabuCount - $alreadyFabu);

            //个人订单统计，待提交、审核中、已通过、未通过、举报中心订单
            $order = array();

            //商家中心的举报订单只需要调取举报人和被举报人以及发布人都是当前登录用户
            if($from == 'store'){
                $sql = $dsql->SetQuery("SELECT (SELECT count(`id`) FROM `#@__task_order` WHERE `uid` = '$id' AND `state` = 0) as `state0`, (SELECT count(`id`) FROM `#@__task_order` WHERE `uid` = '$id' AND `state` = 1) as `state1`, (SELECT count(`id`) FROM `#@__task_order` WHERE `uid` = '$id' AND `state` = 2) as `state2`, (SELECT count(`id`) FROM `#@__task_order` WHERE `uid` = '$id' AND `state` = 3) as `state3`, (SELECT count(`id`) FROM `#@__task_report` WHERE (`uid` = '$id' OR `mid` = '$id') AND (`state` = 0 OR `state` = 1) AND `sid` = '$id') as `state4`");
            }
            //个人中心的举报订单需要调取举报和人被举报人是当前登录用户，并且发布人不是当前登录用户，个人中心不处理商家举报订单
            else{
                $sql = $dsql->SetQuery("SELECT (SELECT count(`id`) FROM `#@__task_order` WHERE `uid` = '$id' AND `state` = 0) as `state0`, (SELECT count(`id`) FROM `#@__task_order` WHERE `uid` = '$id' AND `state` = 1) as `state1`, (SELECT count(`id`) FROM `#@__task_order` WHERE `uid` = '$id' AND `state` = 2) as `state2`, (SELECT count(`id`) FROM `#@__task_order` WHERE `uid` = '$id' AND `state` = 3) as `state3`, (SELECT count(`id`) FROM `#@__task_report` WHERE (`uid` = '$id' OR `mid` = '$id') AND (`state` = 0 OR `state` = 1) AND `sid` = '$id') as `state4`");
            }
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $order = array(
                    'state0' => (int)$ret[0]['state0'],
                    'state1' => (int)$ret[0]['state1'],
                    'state2' => (int)$ret[0]['state2'],
                    'state3' => (int)$ret[0]['state3'],
                    'state4' => (int)$ret[0]['state4']
                );
            }
            $data['order'] = $order;
        
        }

        //商家订单统计，审核通过的订单量、发放的赏金共计
        $statistics = array();
        $sql = $dsql->SetQuery("SELECT (SELECT count(`id`) FROM `#@__task_order` WHERE `sid` = '$id' AND `state` = 2) as `orderCount`, (SELECT sum(`price`) FROM `#@__task_order` WHERE `sid` = '$id' AND `state` = 2) as `orderAmount`");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $statistics = array(
                'count' => (int)$ret[0]['orderCount'],
                'amount' => (float)$ret[0]['orderAmount']
            );
        }
        $data['statistics'] = $statistics;

        return $data;
            
	}


    /**
     * 任务列表
     */
    public function list(){
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $u        = (int)$this->param['u'];  //获取自己的数据
                $state    = $this->param['state'];  //任务状态  0未上线  1进行中  2已暂停/冻结  3已结束
                $uid      = (int)$this->param['uid'];  //获取指定用户的任务
                $typeid   = (int)$this->param['typeid'];  //类型
                $shtime   = trim($this->param['shtime']);  //审核时间，单位分钟，如：0,15  15,30  30,60  0,60  24,0
                $price    = trim($this->param['price']);  //任务价格，单位元，如：0,0.3  0.3,2  2,4  8,0
                $first    = (int)$this->param['first'];  //首发新单
                $fast     = (int)$this->param['fast'];  //极速审核
                $bid      = (int)$this->param['bid'];  //推荐置顶
                $searchtype = (int)$this->param['searchtype'];  //搜索类型：0项目名称  1任务标题  2任务编号
                $keyword  = trim($this->param['keyword']);  //搜索关键字
                $stime    = trim($this->param['stime']);  //检索开始时间 2022-12-01
                $etime    = trim($this->param['etime']);  //检索结束时间 2022-12-15
                $orderby  = (int)$this->param['orderby'];  //排序：1最近发布  2佣金最高
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        $userid = $userLogin->getMemberID();
        $time = GetMkTime(time());

        //默认条件
        if(!$u){
            $where .= " AND l.`state` = 1 AND l.`haspay` = 1 AND l.`finish` = 0";

            //排除屏蔽内容
            if($userid > 0){

                //查询用户设置的屏蔽项目和商家
                $shield_project = $shield_uid = $shield_tid = array();
                $sql = $dsql->SetQuery("SELECT `uid`, `type`, `ctype`, `content` FROM `#@__task_member_shield` WHERE `uid` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    foreach($ret as $key => $val){

                        //不接商家的任务
                        if($val['type'] == 0){
                            if($val['ctype'] == 2){
                                array_push($shield_uid, (int)$val['content']);
                            }
                        }
                        //不接指定项目的任务
                        elseif($val['type'] == 1){
                            array_push($shield_project, "((l.`typeid` != " . $val['ctype'] . " AND l.`project` != '".$val['content']."') OR (l.`typeid` != " . $val['ctype'] . " AND l.`project` = '".$val['content']."'))");
                        }
                        //不接指定的任务
                        elseif($val['type'] == 2){
                            array_push($shield_tid, (int)$val['content']);
                        }

                    }
                }

                //查询商家屏蔽不让用户接他的任务
                $sql = $dsql->SetQuery("SELECT `uid`, `type`, `ctype`, `content` FROM `#@__task_member_shield` WHERE `type` = 0 AND `ctype` = 1 AND `content` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    foreach($ret as $key => $val){
                        array_push($shield_uid, (int)$val['uid']);
                    }
                }

                if($shield_uid){
                    $where .= " AND l.`uid` NOT IN (".join(",", $shield_uid).")";
                }
                if($shield_project){
                    $where .= " AND (".join(" AND ", $shield_project).")";
                }
                if($shield_tid){
                    $where .= " AND l.`id` NOT IN (".join(",", $shield_tid).")";
                }

            }


        //获取自己的数据
        }else{
            if ($userid == -1) return array("state" => 200, "info" => '请先登录！');

            $where .= " AND l.`uid` = $userid";  //指定当前登录会员

            if($this->param['state'] != ''){
                //未上线
                if($state == 0){
                    $where .= " AND (l.`state` = 0 OR l.`state` = 2)";

                //进行中
                }elseif($state == 1){
                    $where .= " AND l.`state` = 1 AND l.`finish` = 0";

                //已暂停/冻结
                }elseif($state == 2){
                    $where .= " AND (l.`state` = 3 OR l.`state` = 4) AND l.`finish` = 0";

                //3已结束
                }elseif($state == 3){
                    $where .= " AND l.`finish` = 1";
                }
            }
        }

        //指定用户
        if ($uid) {
            $where .= " AND l.`uid` = '$uid'";
        }

        //指定类型
        if ($typeid) {
            $where .= " AND l.`typeid` = '$typeid'";
        }

        //审核时间
        if($shtime){
            $shtimeArr = explode(',', $shtime);
            $_stime = (int)$shtimeArr[0];
            $_etime = (int)$shtimeArr[1];
            
            if($_stime && $_etime){
                $where .= " AND l.`sh_time` >= $_stime AND l.`sh_time` <= $_etime";
            }elseif($_stime){
                $where .= " AND l.`sh_time` >= $_stime";
            }elseif($_etime){
                $where .= " AND l.`sh_time` <= $_etime";
            }
        }

        //任务价格
        if($price){
            $priceArr = explode(',', $price);
            $sprice = (float)$priceArr[0];
            $eprice = (float)$priceArr[1];
            
            if($sprice && $eprice){
                $where .= " AND l.`price` >= $sprice AND l.`price` <= $eprice";
            }elseif($sprice){
                $where .= " AND l.`price` >= $sprice";
            }elseif($eprice){
                $where .= " AND l.`price` <= $eprice";
            }
        }

        //首发新单
        if ($first) {
            $where .= " AND l.`isfirst` = 1";
        }

        //极速审核
        if ($fast) {
            $where .= " AND l.`sh_time` <= 60 AND ((l.`js_began_time` < $time AND l.`js_end_time` > $time) OR l.`js_sh_time_bak` <= 60)";  //60分钟以内的
        }

        //推荐置顶
        if ($bid) {
            $where .= " AND l.`isbid` = 1";
        }

        //关键字搜索
        if (!empty($keyword)) {
            if($searchtype == 0){
                $where .= " AND l.`project` LIKE '%$keyword%'";
            }elseif($searchtype == 1){
                $where .= " AND l.`title` LIKE '%$keyword%'";
            }elseif($searchtype == 2){
                $keyword = (int)$keyword;
                $where .= " AND l.`id` = $keyword";
            }
        }

        //检索时间
        if($stime){
            $_stime = GetMkTime($stime);
            $where .= " AND l.`refresh_time` >= $_stime";
        }
        if($etime){
            $_etime = GetMkTime($etime);
            $where .= " AND l.`refresh_time` <= $_etime";
        }

        //默认排序，VIP会员、发布时间、自增ID
        // $_orderby = " ORDER BY CASE WHEN `vip` > 0 THEN 1 ELSE 0 END DESC, l.`refresh_time` DESC, l.`id` DESC";
        $_orderby = " ORDER BY l.`refresh_time` DESC, l.`id` DESC";

        //发布时间
        if($orderby == 1){
            $_orderby = " ORDER BY l.`refresh_time` DESC, l.`id` DESC";

        //佣金
        }elseif($orderby == 2){
            $_orderby = " ORDER BY l.`price` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__task_list` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE m.`id` IS NOT NULL" . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        require(HUONIAOINC."/config/task.inc.php");
        $refreshPrice = (float)$customrefreshPrice;  //刷新一次的费用
        $bidPrice = (float)$custombidPrice;  //推荐置顶一个小时的费用

        $sql     = $dsql->SetQuery("SELECT l.`id`, l.`uid`, m.`nickname`, m.`photo`, l.`project`, l.`typeid`, t.`typename`, t.`icon`, l.`title`, l.`tj_time`, l.`sh_time`, l.`number`, l.`price`, l.`mprice`, l.`fabu_fee`, l.`quota`, l.`note`, l.`pubdate`, l.`state`, l.`review`, l.`haspay`, l.`finish`, l.`audit_time`, l.`refresh_time`, l.`isbid`, l.`bid_began_time`, l.`bid_end_time`, l.`isfirst`, l.`refresh_start`, l.`refresh_count`, l.`refresh_total_count`, l.`refresh_interval`, l.`js_began_time`, l.`js_end_time`, l.`js_sh_time_bak`, (SELECT `id` FROM `#@__task_member` WHERE `uid` = l.`uid` AND `end_time` > $time) as `vip` FROM `#@__task_list` l LEFT JOIN `#@__task_type` t ON t.`id` = l.`typeid` LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE m.`id` IS NOT NULL" . $where . $_orderby);
        $atpage  = $pageSize * ($page - 1);
        $where   = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($sql . $where, "results");
        $list    = array();
        if (count($results) > 0) {

            //会员等级信息
            $memberLevelArr = array();
            $this->param = array('page' => 1, 'pageSize' => 100);
            $memberLevel = $this->memberLevel();
            if($memberLevel && is_array($memberLevel)){
                foreach($memberLevel as $key => $val){
                    array_push($memberLevelArr, array(
                        'id' => $val['id'],
                        'title' => $val['title'],
                        'task_fee' => $val['task_fee'],
                        'bgcolor' => $val['bgcolor'],
                        'fontcolor' => $val['fontcolor']
                    ));
                }
            }
            $memberLevelArr = array_reverse($memberLevelArr);

            foreach ($results as $key => $value) {
                $list[$key]["id"]        = (int)$value["id"];
                $list[$key]["uid"]       = (int)$value["uid"];
                $list[$key]["nickname"]  = $value["nickname"];
                $list[$key]["photo"]     = getFilePath($value["photo"]);
                $list[$key]["project"]   = $value["project"];
                $list[$key]["typeid"]    = (int)$value["typeid"];
                $list[$key]["typename"]  = $value["typename"];
                $list[$key]["typeicon"]  = getFilePath($value["icon"]);
                $list[$key]["title"]     = $value["title"];
                $list[$key]["tj_time"]   = (int)$value["tj_time"];


                //判断极速审核是否开始
                if($value['sh_time'] <= 60 && $value['js_sh_time_bak'] > 0){
                    if($value['js_began_time'] < $time && $value['js_end_time'] > $time){
                        $list[$key]["sh_time"]   = (int)$value["sh_time"];
                    }else{

                        //如果已经结束，但是计划任务还没有更新
                        if($value['js_end_time'] < $time&& $value['js_sh_time_bak'] > 0){
                            $list[$key]["sh_time"]   = (int)$value["js_sh_time_bak"];
                        }else{
                            $list[$key]["sh_time"]   = (int)$value["js_sh_time_bak"];
                            $list[$key]["js_sh_time"] = (int)$value["sh_time"];
                        }
                    }

                    $list[$key]["js_began_time"] = (int)$value["js_began_time"];
                    $list[$key]["js_end_time"] = (int)$value["js_end_time"];
                }else{
                    $list[$key]["sh_time"]   = (int)$value["sh_time"];
                }


                $list[$key]["number"]    = (int)$value["number"];

                //外显金额扣除平台佣金
                $_price = floatval($value['price']);
                $list[$key]["price"]     = $_price;
                // $list[$key]["price"]     = floatval(sprintf('%.2f', $value["price"]*(1-$value['fabu_fee']/100)));  //发布任务时已扣除，这里不需要再扣

                //计算不同等级会员的价格
                $memberLevelPrice = array();
                $task_price_same = true;
                $task_price = 0;  //判断价格是否相同，如果相同就不按价格倒序了
                foreach($memberLevelArr as $k => $v){
                    $v['task_price'] = $v['task_fee'] > 0 ? floatval(sprintf('%.2f', ($_price + $_price * $v['task_fee'] / 100))) : $_price;
                    array_push($memberLevelPrice, $v);

                    if($k == 0){
                        $task_price = $v['task_price'];
                    }
                    if($k > 0 && $task_price != $v['task_price']){
                        $task_price_same = false;
                    }
                }
                //按价格降序
                if($memberLevelPrice && !$task_price_same){
                    $memberLevelPrice = array_sortby($memberLevelPrice, 'task_price', SORT_DESC);
                }
                $list[$key]["memberLevelPrice"] = $memberLevelPrice;

                $list[$key]["quota"]     = (int)$value["quota"];
                $list[$key]["note"]      = $value["note"];
                $list[$key]["pubdate"]   = (int)$value["pubdate"];

                //格式化时间以刷新时间为准
                $floortime = date("Y-m-d", $value['refresh_time']);
                $timestamp = GetMkTime(time());  // 时间戳
                if(date('Ymd', $timestamp) == date('Ymd', $value['refresh_time'])) {
                    $floortime = '今天 ' . date("H:i", $value['refresh_time']);
                }elseif(date('Ymd', strtotime("-1 day", $timestamp)) == date('Ymd', $value['refresh_time'])){
                    $floortime = '昨天 ' . date("H:i", $value['refresh_time']);
                }

                $_finish = (int)$value["finish"];
                $list[$key]["floortime"] = $floortime;
                $list[$key]["finish"]         = $_finish;
                $list[$key]["refresh_time"]   = (int)$value["refresh_time"];
                $list[$key]["isbid"]          = (int)$value["isbid"];
                $list[$key]["bid_began_time"] = (int)$value["bid_began_time"];
                $list[$key]["bid_end_time"]   = (int)$value["bid_end_time"];
                $list[$key]["isfirst"]        = (int)$value["isfirst"];

                //会员中心需要用到的数据
                if($u){
                    $_state = (int)$value["state"];
                    $list[$key]["state"] = $_finish ? 1 : $_state;
                    $list[$key]["review"] = $value["review"];
                    $list[$key]["haspay"] = (int)$value["haspay"];
                    $list[$key]["audit_time"] = (int)$value["audit_time"];

                    $list[$key]["mprice"] = floatval($value['mprice']);

                    //自动刷新信息
                    $list[$key]["refresh_start"] = (int)$value['refresh_start'];
                    $list[$key]["refresh_count"] = (int)$value['refresh_count'];
                    $list[$key]["refresh_total_count"] = (int)$value['refresh_total_count'];
                    $list[$key]["refresh_interval"] = (int)$value['refresh_interval'];
                }

                //会员等级信息
                $level = array();
                $refreshBidSetting = array();
                if($value['vip']){
                    $sql = $dsql->SetQuery("SELECT l.`id`, l.`typename`, l.`icon`, l.`bgcolor`, l.`fontcolor`, l.`refresh_discount`, l.`bid_discount`, m.`refresh_coupon`, m.`bid_coupon` FROM `#@__task_member_level` l LEFT JOIN `#@__task_member` m ON m.`level` = l.`id` WHERE m.`uid` = " . $value['uid']);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $data = $ret[0];
                        $level = array(
                            'id' => $data['id'],
                            'name' => $data['typename'],
                            'icon' => getFilePath($data['icon']),
                            'bgcolor' => $data['bgcolor'],
                            'fontcolor' => $data['fontcolor']
                        );

                        //账户资产，刷新置顶费用
                        if($u && $userid == $value['uid']){
                            // $level['refresh_discount'] = $data['refresh_discount'];
                            // $level['bid_discount'] = $data['bid_discount'];
                            $refreshBidSetting['refresh_coupon'] = $data['refresh_coupon'];
                            $refreshBidSetting['bid_coupon'] = $data['bid_coupon'];
                            $refreshBidSetting['refresh_price'] = (float)(sprintf('%.2f', $refreshPrice * $data['refresh_discount'] / 100));
                            $refreshBidSetting['bid_price'] = (float)(sprintf('%.2f', $bidPrice * $data['bid_discount'] / 100));
                        }
                    }
                }
                //普通会员
                else{
                    //刷新置顶费用
                    $refreshBidSetting['refresh_coupon'] = 0;
                    $refreshBidSetting['bid_coupon'] = 0;
                    $refreshBidSetting['refresh_price'] = $refreshPrice;
                    $refreshBidSetting['bid_price'] = $bidPrice;
                }
                $list[$key]['level'] = $level;
                $list[$key]['refresh_bid_setting'] = $refreshBidSetting;



                //任务详情链接
                $param = array(
                    "service"  => "task",
                    "template" => "detail",
                    "id"       => $value['id']
                );
                $url = getUrlPath($param);

                $list[$key]['url'] = $url;

                //任务领取、完成情况统计
                $statistics = array();
                $sql = $dsql->SetQuery("SELECT (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND `state` != 4 AND `finish` = 0) as `used`, (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND `state` = 2 AND `finish` = 0) as `valid`, (SELECT AVG(`tj_time` - `lq_time`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND (`state` = 1 OR `state` = 2)) as `avg_time`, (SELECT AVG(`sh_time` - `tj_time`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND `state` = 2) as `avg_audit`");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $data = $ret[0];
                    $statistics = array(
                        'used' => (int)$data['used'],  //占用名额
                        'valid' => (int)$data['valid'],  //有效名额
                        'avg_time' => (int)($data['avg_time']/60),  //提交平均用时
                        'avg_audit' => (int)($data['avg_audit']/60)  //审核平均用时
                    );

                    //会员中心需要用到的数据
                    if($u){
                        $ongoing = $fail = $review = 0;
                        $sql = $dsql->SetQuery("SELECT (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND (`state` = 0 OR `state` = 1 OR `state` = 3) AND `finish` = 0) as `ongoing`, (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND `state` = 3 AND `finish` = 0) as `fail`, (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND `state` = 1 AND `finish` = 0) as `review`");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if($ret){
                            $ongoing = $ret[0]['ongoing'];
                            $fail = $ret[0]['fail'];
                            $review = $ret[0]['review'];
                        }

                        $statistics['ongoing'] = (int)$ongoing;
                        $statistics['fail'] = (int)$fail;
                        $statistics['review'] = (int)$review;
                    }
                }
                $list[$key]['statistics'] = $statistics;

            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


	/**
     * 任务详细
     * @return array
     */
	public function detail(){
		global $dsql;
		global $userLogin;
		$detail = array();
		$param = $this->param;
        $oid = 0;
        if(is_array($param)){
            $id = (int)$param['id'];
            $oid = (int)$param['oid'];
        }else{
            $id = (int)$param;
        }
		if(!is_numeric($id) || !is_numeric($oid)) return array("state" => 200, "info" => '格式错误！');

        $userid = $userLogin->getMemberID();

		//判断是否管理员已经登录
		//功能点：管理员和信息的发布者可以查看所有状态的信息
		$where = "";
		if($userLogin->getUserID() == -1){

			$where = " AND (l.`state` = 1 OR l.`state` = 3) AND l.`haspay` = 1";

			//如果没有登录再验证会员是否已经登录
			if($userid == -1){
				$where = " AND (l.`state` = 1 OR l.`state` = 3) AND l.`haspay` = 1";
			}else{
				$where = " AND (((l.`state` = 1 OR l.`state` = 3) AND l.`haspay` = 1) OR l.`uid` = ".$userid.")";
			}

		}

        $time = GetMkTime(time());
        
		$archives = $dsql->SetQuery("SELECT l.`id`, l.`uid`, m.`nickname`, m.`photo`, m.`certifyState`, m.`promotion`, l.`project`, l.`typeid`, t.`typename`, t.`icon`, l.`title`, l.`tj_time`, l.`sh_time`, l.`number`, l.`price`, l.`mprice`, l.`fabu_fee`, l.`quota`, l.`note`, l.`video`, l.`steps`, l.`pubdate`, l.`state`, l.`review`, l.`haspay`, l.`finish`, l.`audit_time`, l.`refresh_time`, l.`isbid`, l.`bid_began_time`, l.`bid_end_time`, l.`isfirst`, l.`js_began_time`, l.`js_end_time`, l.`js_sh_time_bak`, l.`platform_tips`, l.`refresh_start`, l.`refresh_count`, l.`refresh_total_count`, l.`refresh_interval` FROM `#@__task_list` l LEFT JOIN `#@__task_type` t ON t.`id` = l.`typeid` LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE m.`id` IS NOT NULL AND l.`id` = ".$id.$where);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
            $value = $results[0];

            $detail["id"]        = (int)$value["id"];
            $detail["uid"]       = (int)$value["uid"];
            $detail["nickname"]  = $value["nickname"];
            $detail["photo"]     = getFilePath($value["photo"]);
            $detail["certifyState"] = (int)$value["certifyState"];
            $detail["promotion"] = (float)$value["promotion"];
            $detail["project"]   = $value["project"];
            $detail["typeid"]    = (int)$value["typeid"];
            $detail["typename"]  = $value["typename"];
            $detail["typeicon"]  = getFilePath($value["icon"]);
            $detail["title"]     = $value["title"];
            $detail["tj_time"]   = (int)$value["tj_time"];

            //判断极速审核是否开始
            if($value['sh_time'] <= 60 && $value['js_sh_time_bak'] > 0){
                if($value['js_began_time'] < $time && $value['js_end_time'] > $time){
                    $detail["sh_time"]   = (int)$value["sh_time"];
                }else{
                    $detail["sh_time"]   = (int)$value["js_sh_time_bak"];
                }
                $detail["js_sh_time"] = (int)$value["sh_time"];
            }else{
                $detail["sh_time"]   = (int)$value["sh_time"];
            }
            $detail["number"]    = (int)$value["number"];

            $detail["quota"]     = (int)$value["quota"];
            $detail["note"]      = $value["note"];
            $detail["video"]     = getFilePath($value["video"]);
            $detail["steps"]     = $value["steps"] ? json_decode($value["steps"], true) : array();
            $detail["pubdate"]   = (int)$value["pubdate"];
            $detail["finish"]         = (int)$value["finish"];
            $detail["refresh_time"]   = (int)$value["refresh_time"];
            $detail["isbid"]          = (int)$value["isbid"];
            $detail["bid_began_time"] = (int)$value["bid_began_time"];
            $detail["bid_end_time"]   = (int)$value["bid_end_time"];
            $detail["isfirst"]        = (int)$value["isfirst"];
            $detail["js_began_time"]  = (int)$value["js_began_time"];
            $detail["js_end_time"]    = (int)$value["js_end_time"];
            $detail["platform_tips"]  = $value["platform_tips"];

            //外显金额扣除平台佣金
            $_price = floatval($value["price"]);
            $detail["price"] = $_price;
            // $detail["price"]     = floatval(sprintf('%.2f', $value["price"]*(1-$value['fabu_fee']/100)));

            //会员等级信息
            $memberLevelArr = array();
            $this->param = array('page' => 1, 'pgaeSize' => 100);
            $memberLevel = $this->memberLevel();
            if($memberLevel && is_array($memberLevel)){
                foreach($memberLevel as $key => $val){
                    array_push($memberLevelArr, array(
                        'id' => $val['id'],
                        'title' => $val['title'],
                        'task_fee' => $val['task_fee'],
                        'bgcolor' => $val['bgcolor'],
                        'fontcolor' => $val['fontcolor']
                    ));
                }
            }
            $memberLevelArr = array_reverse($memberLevelArr);

            //计算不同等级会员的价格
            $memberLevelPrice = array();
            $task_price_same = true;
            $task_price = 0;  //判断价格是否相同，如果相同就不按价格倒序了
            foreach($memberLevelArr as $k => $v){
                $v['task_price'] = $v['task_fee'] > 0 ? floatval(sprintf('%.2f', ($_price + $_price * $v['task_fee'] / 100))) : $_price;
                array_push($memberLevelPrice, $v);

                if($k == 0){
                    $task_price = $v['task_price'];
                }
                if($k > 0 && $task_price != $v['task_price']){
                    $task_price_same = false;
                }
            }
            //按价格降序
            if($memberLevelPrice && !$task_price_same){
                $memberLevelPrice = array_sortby($memberLevelPrice, 'task_price', SORT_DESC);
            }
            $detail["memberLevelPrice"] = $memberLevelPrice;

            //会员中心需要用到的数据
            if($value['uid'] == $userid){
                $detail["state"] = (int)$value["state"];
                $detail["review"] = $value["review"];
                $detail["haspay"] = (int)$value["haspay"];
                $detail["audit_time"] = (int)$value["audit_time"];

                //任务原单价
                $detail["mprice"] = floatval($value["mprice"]);

                //自动刷新信息
                $detail["refresh_start"] = (int)$value['refresh_start'];
                $detail["refresh_count"] = (int)$value['refresh_count'];
                $detail["refresh_total_count"] = (int)$value['refresh_total_count'];
                $detail["refresh_interval"] = (int)$value['refresh_interval'];
            }

            //会员等级信息

            require(HUONIAOINC."/config/task.inc.php");
            $refreshPrice = (float)$customrefreshPrice;  //刷新一次的费用
            $bidPrice = (float)$custombidPrice;  //推荐置顶一个小时的费用
            
            $level = array();
            $refreshBidSetting = array();
            $time = GetMkTime(time());
            $sql = $dsql->SetQuery("SELECT l.`id`, l.`typename`, l.`icon`, l.`bgcolor`, l.`fontcolor`, l.`refresh_discount`, l.`bid_discount`, m.`refresh_coupon`, m.`bid_coupon` FROM `#@__task_member_level` l LEFT JOIN `#@__task_member` m ON m.`level` = l.`id` WHERE m.`end_time` > $time AND m.`uid` = " . $value['uid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $data = $ret[0];
                $level = array(
                    'id' => $data['id'],
                    'name' => $data['typename'],
                    'icon' => getFilePath($data['icon']),
                    'bgcolor' => $data['bgcolor'],
                    'fontcolor' => $data['fontcolor']
                );

                //账户资产，刷新置顶费用
                if($value['uid'] == $userid){

                    // $level['refresh_discount'] = $data['refresh_discount'];
                    // $level['bid_discount'] = $data['bid_discount'];
                    $refreshBidSetting['refresh_coupon'] = $data['refresh_coupon'];
                    $refreshBidSetting['bid_coupon'] = $data['bid_coupon'];
                    $refreshBidSetting['refresh_price'] = (float)(sprintf('%.2f', $refreshPrice * $data['refresh_discount'] / 100));
                    $refreshBidSetting['bid_price'] = (float)(sprintf('%.2f', $bidPrice * $data['bid_discount'] / 100));
                }
            }
            //普通会员
            else{
                //刷新置顶费用
                $refreshBidSetting['refresh_coupon'] = 0;
                $refreshBidSetting['bid_coupon'] = 0;
                $refreshBidSetting['refresh_price'] = $refreshPrice;
                $refreshBidSetting['bid_price'] = $bidPrice;
            }
            $detail['level'] = $level;
            $detail['refresh_bid_setting'] = $refreshBidSetting;

            //任务详情链接
            $param = array(
                "service"  => "task",
                "template" => "detail",
                "id"       => $id
            );
            $url = getUrlPath($param);

            $detail['url'] = $url;

            //任务领取、完成情况统计
            $statistics = array();
            $sql = $dsql->SetQuery("SELECT (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$id." AND `state` != 4 AND `finish` = 0) as `used`, (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$id." AND `state` = 2 AND `finish` = 0) as `valid`, (SELECT AVG(`tj_time` - `lq_time`) FROM `#@__task_order` WHERE `tid` = ".$id." AND (`state` = 1 OR `state` = 2)) as `avg_time`, (SELECT AVG(`sh_time` - `tj_time`) FROM `#@__task_order` WHERE `tid` = ".$id." AND `state` = 2) as `avg_audit`");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $data = $ret[0];
                $statistics = array(
                    'used' => (int)$data['used'],
                    'valid' => (int)$data['valid'],
                    'avg_time' => (int)($data['avg_time']/60),
                    'avg_audit' => (int)($data['avg_audit']/60)
                );
            }

            //会员中心需要用到的数据
            if($value['uid'] == $userid){
                $ongoing = $fail = $review = 0;
                $sql = $dsql->SetQuery("SELECT (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND (`state` = 0 OR `state` = 1 OR `state` = 3) AND `finish` = 0) as `ongoing`, (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND `state` = 3 AND `finish` = 0) as `fail`, (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND `state` = 1 AND `finish` = 0) as `review`");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $ongoing = $ret[0]['ongoing'];
                    $fail = $ret[0]['fail'];
                    $review = $ret[0]['review'];
                }

                $statistics['ongoing'] = (int)$ongoing;
                $statistics['fail'] = (int)$fail;
                $statistics['review'] = (int)$review;
            }

            $detail['statistics'] = $statistics;

            //查询当前登录用户对该任务的领取和提交数据
            $order_data = array();
            if($userid > 0){

                //订单详情页，指定订单ID，此处兼容用户和商家
                if($oid){
                    $sql = $dsql->SetQuery("SELECT `id`, `uid`, `ordernum`, `price`, `task_fee`, `lq_time`, `tj_expire`, `tj_time`, `sh_expire`, `sh_time`, `sh_explain`, `xg_expire`, `qx_time`, `state`, `tj_data`, `tj_log` FROM `#@__task_order` WHERE (`uid` = $userid OR `sid` = $userid) AND `tid` = $id AND `id` = $oid");

                //任务详情页，获取最后一次提交的数据
                }else{
                    $sql = $dsql->SetQuery("SELECT `id`, `uid`, `ordernum`, `price`, `task_fee`, `lq_time`, `tj_expire`, `tj_time`, `sh_expire`, `sh_time`, `sh_explain`, `xg_expire`, `qx_time`, `state`, `tj_data`, `tj_log` FROM `#@__task_order` WHERE `uid` = $userid AND `tid` = $id ORDER BY `id` DESC");
                }
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $data = $ret[0];
                    $time = GetMkTime(time());

                    //查询订单是否处于维权中，审核中的举报才需要查询
                    $report = array();
                    //订单状态为未通过
                    // if($data['state'] == 3){
                        $sql = $dsql->SetQuery("SELECT `uid`, `mid`, `sid`, `expired`, `state`, `note`, `winner`, `admin_time` FROM `#@__task_report` WHERE `oid` = ".$data['id']." ORDER BY `id` DESC LIMIT 1");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if($ret){


                            $_winner = 0; //是否胜诉
                            $winner = (int)$ret[0]['winner'];  //胜诉方  1用户 2发布人

                            $note = $ret[0]["note"];//平台判定结果说明

                            //胜诉人&胜诉结果说明
                            //根据登录人判断身份，只有已完结的才需要判断
                            if($ret[0]['state'] == 2 || $ret[0]['state'] == 3){
                                if(
                                    //登录人是举报人，也是发布人
                                    ($userid == $ret[0]['uid'] && $userid == $ret[0]['sid'] && $winner == 2)
                                    ||
                                    //登录人是被举报人，也是发布人
                                    ($userid == $ret[0]['mid'] && $userid == $ret[0]['sid'] && $winner == 2)
                                ){
                                    $_winner = 1;
                                }
                                elseif(
                                    //登录人是举报人，不是发布人
                                    ($userid == $ret[0]['uid'] && $userid != $ret[0]['sid'] && $winner == 1)
                                    ||
                                    //登录人是被举报人，不是发布人
                                    ($userid == $ret[0]['mid'] && $userid != $ret[0]['sid'] && $winner == 1)
                                ){
                                    $_winner = 1;
                                }

                                //如果平台操作时间为0，说明是其中一方自动放弃的，结果说明获取提交日志
                                if($ret[0]['admin_time'] == 0){
                                    
                                    $tj_log = json_decode($data['tj_log'], true);
                                    $tj_log = is_array($tj_log) ? $tj_log[count($tj_log)-1] : array();
                                    
                                    //提交记录正常情况
                                    if($tj_log){
                                        $title = $tj_log['title'];
                                        $ret[0]['admin_time'] = $tj_log['time'];  //操作时间为提交日志的记录时间

                                        //如果是发布人
                                        if($userid == $ret[0]['sid']){

                                            //胜诉
                                            if($_winner){

                                                if($title == '超过辩诉时间，系统自动取消订单。'){
                                                    $note = '对方未在规定时间内上传证据，视自动放弃申诉';
                                                }elseif($title == '取消订单'){
                                                    $note = '用户主动放弃申诉';
                                                }elseif($title == '平台判定商家/发布人胜诉'){
                                                    $note = '平台判定您胜诉';
                                                }
                                                
                                            }
                                            //败诉
                                            else{

                                                if($title == '超过辩诉时间，系统自动审核通过订单。'){
                                                    $note = '您未在规定时间内上传证据，视自动放弃申诉';
                                                }elseif($title == '重新审核通过'){
                                                    $note = '您已重新审核通过';
                                                }elseif($title == '平台判定用户胜诉'){
                                                    $note = $title;
                                                }

                                            }
                                            

                                        }
                                        //如果是用户
                                        else{

                                            //胜诉
                                            if($_winner){

                                                if($title == '超过辩诉时间，系统自动审核通过订单。'){
                                                    $note = '对方未在规定时间内上传证据，视自动放弃申诉';
                                                }elseif($title == '重新审核通过'){
                                                    $note = '商户重新审核通过';
                                                }elseif($title == '平台判定用户胜诉'){
                                                    $note = '平台判定您胜诉';
                                                }
                                                
                                            }
                                            //败诉
                                            else{
                                                
                                                if($title == '超过辩诉时间，系统自动取消订单。'){
                                                    $note = '您未在规定时间内上传证据，视自动放弃申诉';
                                                }elseif($title == '取消订单'){
                                                    $note = '您主动放弃申诉';
                                                }elseif($title == '平台判定商家/发布人胜诉'){
                                                    $note = '平台判定商家/发布人胜诉';
                                                }

                                            }

                                        }

                                    }
                                    //没有获取到提交记录
                                    else{
                                        $note = '';
                                    }

                                }
                            }


                            $report = array(
                                'uid' => (int)$ret[0]['uid'],  //举报人
                                'mid' => (int)$ret[0]['mid'],  //被举报
                                'expired' => (int)$ret[0]['expired'],  //辩诉过期时间
                                'expired_second' => (int)($ret[0]['expired'] - $time),  //辩诉过期剩余秒数
                                'state' => (int)$ret[0]['state'],  //0待对方辩诉 1等待平台审核 2已通过 3已结束
                                'note' => $note,  //结果说明
                                'winner' => (int)$_winner,  //是否胜诉  0未胜诉 1胜诉
                                'admin_time' => (int)$ret[0]['admin_time']  //平台判定时间
                            );
                        }
                    // }

                    $order_user_nickname = '未知';
                    $order_user = $userLogin->getMemberInfo($data['uid']);
                    if($order_user){
                        $order_user_nickname = $order_user['nickname'];
                    }
                    
                    $order_data = array(
                        'uid' => (int)$data['uid'],
                        'nickname' => $order_user_nickname,
                        'orderid' => (int)$data['id'],
                        'ordernum' => $data['ordernum'],
                        'price' => floatval((float)$data['price']),
                        'task_fee'  => (int)$data['task_fee'],
                        'lq_time'  => (int)$data['lq_time'],
                        'tj_expire'  => (int)$data['tj_expire'],
                        'tj_expire_second' => (int)($data['tj_expire'] - $time),
                        'tj_time'  => (int)$data['tj_time'],
                        'sh_expire'  => (int)$data['sh_expire'],
                        'sh_expire_second' => (int)($data['sh_expire'] - $time),
                        'sh_time'  => (int)$data['sh_time'],
                        'sh_explain'  => $data['sh_explain'],
                        'xg_expire'  => (int)$data['xg_expire'],
                        'xg_expire_second' => (int)($data['xg_expire'] - $time),
                        'qx_time'  => (int)$data['qx_time'],
                        'state'  => (int)$data['state'],
                        'tj_data'  => $data['tj_data'] ? json_decode($data['tj_data'], true) : array(),
                        'tj_log'  => $data['tj_log'] ? json_decode($data['tj_log'], true) : array(),
                        'report' => $report
                    );

                    //领取后主动取消
                    if($data['state'] == 4 && $data["qx_time"] > 0 && $data["sh_explain"] == ''){
                        $order_data["sh_explain"] = '主动取消';
                    }
                }
            }
            $detail['order_data'] = $order_data;

            //查询屏蔽相关信息
            $shield = array('store' => 0, 'project' => 0, 'task' => 0);  //默认没有屏蔽

            if($userid > 0){
                $sql = $dsql->SetQuery("SELECT `id`, `type` FROM `#@__task_member_shield` WHERE `uid` = $userid AND ( (`type` = 0 AND `ctype` = 2 AND `content` = '".$value["uid"]."') OR (`type` = 1 AND `ctype` = '".$value["typeid"]."' AND `content` = '".$value["project"]."') OR (`type` = 2 AND `content` = '$id'))");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    foreach($ret as $key => $val){
                        if($val['type'] == 0){
                            $shield['store'] = (int)$val['id'];
                        }
                        elseif($val['type'] == 1){
                            $shield['project'] = (int)$val['id'];
                        }
                        elseif($val['type'] == 2){
                            $shield['task'] = (int)$val['id'];
                        }
                    }
                }
            }
            $detail['shield'] = $shield;

		}

        //更新浏览记录
        if($userid > 0 && $_GET['action'] != 'footprintsGet'){
            $uphistoryarr = array(
                'module'    => 'task',
                'uid'       => $userid,
                'aid'       => $id,
                'fuid'      => 0,
                'module2'   => '',
            );
            /*更新浏览足迹表   */
            updateHistoryClick($uphistoryarr);
        }
		return $detail;
	}


	/**
    * 发布任务
    * @return array
    */
	public function fabu(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $project     = trim(filterSensitiveWords(addslashes($param['project'])));  //项目名称
        $typeid      = (int)$param['typeid'];  //类型ID
        $title       = trim(filterSensitiveWords(addslashes($param['title'])));  //任务标题
        $tj_time     = (int)$param['tj_time'];  //提交限时，单位分钟
        $sh_time     = (int)$param['sh_time'];  //审核限时，单位分钟
        $number      = (int)$param['number'];  //领取次数，0:每人1次，1:每天1次，2:每人3次
        $price       = (float)$param['price'];  //任务单价
        $quota       = (int)$param['quota'];  //任务名额
        $note        = filterSensitiveWords($param['note'], false);  //领取条件/限制
        $video       = $param['video'];  //视频讲解
        $steps       = $param['steps'];  //任务步骤

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证是否有当前模块使用权限
        if(!$this->checkAuth('fabu')){
            return array("state" => 200, "info" => '您已被禁止发布任务！');
        }

        if(empty($project)) return array("state" => 200, "info" => '请填写项目名称');
        if(empty($typeid)) return array("state" => 200, "info" => '请选择任务类型');
        if(empty($title)) return array("state" => 200, "info" => '请填写任务标题');
        if(empty($tj_time)) return array("state" => 200, "info" => '请选择提交限制时间');
        if(empty($sh_time)) return array("state" => 200, "info" => '请选择审核限制时间');
        if(empty($price)) return array("state" => 200, "info" => '请填写任务单价');
        if(empty($quota)) return array("state" => 200, "info" => '请填写任务名额');
        if(empty($steps)) return array("state" => 200, "info" => '请设置任务步骤');
        
        //验证步骤格式
        $stepsArr = json_decode($steps, true);
        if(!is_array($stepsArr)) return array("state" => 200, "info" => '任务步骤格式有误');

        //获取任务类型
        $typename = '';
        $type_price = $type_count = 0;
        $sql = $dsql->SetQuery("SELECT `typename`, `price`, `count` FROM `#@__task_type` WHERE `id` = " . $typeid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $typename = $ret[0]['typename'];
            $type_price = $ret[0]['price'];
            $type_count = $ret[0]['count'];
        }else{
            return array("state" => 200, "info" => '选择的任务类型不存在');
        }

        if($price < $type_price) return array("state" => 200, "info" => '任务单价小于该类型的最小价格：' . $type_price . '元起');
        if($quota < $type_count) return array("state" => 200, "info" => '任务名额小于该类型的最少数量：' . $type_count . '个起');

        //获取会员信息及发布上限
        include HUONIAOINC."/config/task.inc.php";
        $fabuCount     = (int)$customfabuCount;  //普通会员发布任务数量限制
        $fabuFee     = (int)$customfabuFee;  //普通会员发布任务平台抽取佣金比例

        $levelName = '普通会员';
        $time = GetMkTime(time());   
        $sql = $dsql->SetQuery("SELECT l.`typename`, l.`fabu_count`, l.`fabu_fee` FROM `#@__task_member` tm LEFT JOIN `#@__task_member_level` l ON l.`id` = tm.`level` LEFT JOIN `#@__member` m ON m.`id` = tm.`uid` WHERE tm.`end_time` > $time AND tm.`uid` = " . $uid . " AND m.`id` IS NOT NULL");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $levelName = $ret[0]['typename'];
            $fabuCount = (int)$ret[0]['fabu_count'];
            $fabuFee = (int)$ret[0]['fabu_fee'];
        }

        //查询用户已经发布的任务数量
        $alreadyFabu = 0;
        $sql = $dsql->SetQuery("SELECT count(`id`) alreadyFabu FROM `#@__task_list` WHERE `finish` = 0 AND `uid` = " . $uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $alreadyFabu = (int)$ret[0]['alreadyFabu'];
        }
        if($fabuCount <= $alreadyFabu) return array("state" => 200, "info" => '已达到【' . $levelName . '】发布任务数量上限：' . $fabuCount . '个，如需继续发布，请升级会员等级！');

        //首发新单
        $isfirst = 0;
        if($alreadyFabu == 0){
            $isfirst = 1;
        }

        //任务总金额
        $amount = sprintf('%.2f', $price * $quota);
        
        //对数据长度清理
        $project = cn_substrR($project, 20);
        $title   = cn_substrR($title, 30);
        $note    = cn_substrR($note, 200);
     
        $ordernum = create_ordernum();

        //扣除平台佣金价格
        $_price = floatval(sprintf("%.2f", $price * (1 - $fabuFee/100)));

        $sql = $dsql->SetQuery("INSERT INTO `#@__task_list` (`uid`, `project`, `typeid`, `title`, `tj_time`, `sh_time`, `number`, `price`, `mprice`, `fabu_fee`, `quota`, `note`, `video`, `steps`, `pubdate`, `ordernum`, `amount`, `isfirst`, `refresh_time`) VALUES ('$uid', '$project', '$typeid', '$title', '$tj_time', '$sh_time', '$number', '$_price', '$price', '$fabuFee', '$quota', '$note', '$video', '$steps', '$time', '$ordernum', '$amount', '$isfirst', '$time')");
        $aid = $dsql->dsqlOper($sql, "lastid");

        if(is_numeric($aid)){

            //记录用户行为日志
            memberLog($uid, 'task', '', $aid, 'insert', '发布任务('.$aid.'=>'.$title.')', '', $sql);

            //订单信息，用于区分其他支付业务
            $param = array(
                'type' => 'task',
                'id' => $aid
            );

            //创建订单
            $order = createPayForm("task", $ordernum, $amount, $paytype, "发布任务", $param, 1);
            $order['timeout'] = GetMkTime(time()) + 3600;
            return $order;

        }else{
            return array("state" => 101, "info" => '系统错误，发布失败！');
        }

    }


	/**
    * 修改任务（未支付的情况下才可以使用此接口）
    * @return array
    */
	public function edit(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id          = (int)$param['id'];  //要修改的任务ID
        $project     = trim(filterSensitiveWords(addslashes($param['project'])));  //项目名称
        $typeid      = (int)$param['typeid'];  //类型ID
        $title       = trim(filterSensitiveWords(addslashes($param['title'])));  //任务标题
        $tj_time     = (int)$param['tj_time'];  //提交限时，单位分钟
        $sh_time     = (int)$param['sh_time'];  //审核限时，单位分钟
        $number      = (int)$param['number'];  //领取次数，0:每人1次，1:每天1次，2:每人3次
        $price       = (float)$param['price'];  //任务单价
        $quota       = (int)$param['quota'];  //任务名额
        $note        = filterSensitiveWords($param['note'], false);  //领取条件/限制
        $video       = $param['video'];  //视频讲解
        $steps       = $param['steps'];  //任务步骤

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证是否有当前模块使用权限
        if(!$this->checkAuth('fabu')){
            return array("state" => 200, "info" => '您已被禁止发布任务！');
        }

        if(empty($id)) return array("state" => 200, "info" => '要修改的任务ID未提供');
        if(empty($project)) return array("state" => 200, "info" => '请填写项目名称');
        if(empty($typeid)) return array("state" => 200, "info" => '请选择任务类型');
        if(empty($title)) return array("state" => 200, "info" => '请填写任务标题');
        if(empty($tj_time)) return array("state" => 200, "info" => '请选择提交限制时间');
        if(empty($sh_time)) return array("state" => 200, "info" => '请选择审核限制时间');
        if(empty($price)) return array("state" => 200, "info" => '请填写任务单价');
        if(empty($quota)) return array("state" => 200, "info" => '请填写任务名额');
        if(empty($steps)) return array("state" => 200, "info" => '请设置任务步骤');
        
        //验证步骤格式
        $stepsArr = json_decode($steps, true);
        if(!is_array($stepsArr)) return array("state" => 200, "info" => '任务步骤格式有误');

        //查询任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            if($uid != $_ret['uid']){
                return array("state" => 200, "info" => '非您本人的任务，不可进行修改');
            }
            if($_ret['state'] != 0 && $_ret['haspay'] != 0){
                return array("state" => 200, "info" => '当前任务状态不支持修改');
            }

        }else{
            return array("state" => 200, "info" => '要修改的任务不存在或已经删除');
        }

        //获取任务类型
        $typename = '';
        $type_price = $type_count = 0;
        $sql = $dsql->SetQuery("SELECT `typename`, `price`, `count` FROM `#@__task_type` WHERE `id` = " . $typeid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $typename = $ret[0]['typename'];
            $type_price = $ret[0]['price'];
            $type_count = $ret[0]['count'];
        }else{
            return array("state" => 200, "info" => '选择的任务类型不存在');
        }

        if($price < $type_price) return array("state" => 200, "info" => '任务单价小于该类型的最小价格：' . $type_price . '元起');
        if($quota < $type_count) return array("state" => 200, "info" => '任务名额小于该类型的最少数量：' . $type_count . '个起');

        //获取会员信息及发布上限
        include HUONIAOINC."/config/task.inc.php";
        $fabuCount     = (int)$customfabuCount;  //普通会员发布任务数量限制
        $fabuFee     = (int)$customfabuFee;  //普通会员发布任务平台抽取佣金比例

        $levelName = '普通会员';
        $time = GetMkTime(time());   
        $sql = $dsql->SetQuery("SELECT l.`typename`, l.`fabu_count`, l.`fabu_fee` FROM `#@__task_member` tm LEFT JOIN `#@__task_member_level` l ON l.`id` = tm.`level` LEFT JOIN `#@__member` m ON m.`id` = tm.`uid` WHERE tm.`end_time` > $time AND tm.`uid` = " . $uid . " AND m.`id` IS NOT NULL");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $levelName = $ret[0]['typename'];
            $fabuCount = (int)$ret[0]['fabu_count'];
            $fabuFee = (int)$ret[0]['fabu_fee'];
        }

        //查询用户已经发布的任务数量
        $alreadyFabu = 0;
        $sql = $dsql->SetQuery("SELECT count(`id`) alreadyFabu FROM `#@__task_list` WHERE `finish` = 0 AND `uid` = " . $uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $alreadyFabu = (int)$ret[0]['alreadyFabu'];
        }
        if($fabuCount < $alreadyFabu) return array("state" => 200, "info" => '已达到【' . $levelName . '】发布任务数量上限：' . $fabuCount . '个，如需继续发布，请升级会员等级！');

        //任务总金额
        $amount = sprintf('%.2f', $price * $quota);
        
        //对数据长度清理
        $project = cn_substrR($project, 20);
        $title   = cn_substrR($title, 30);
        $note    = cn_substrR($note, 200);

        $ordernum = create_ordernum();

        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `project` = '$project', `typeid` = '$typeid', `title` = '$title', `tj_time` = '$tj_time', `sh_time` = '$sh_time', `number` = '$number', `price` = '$price', `fabu_fee` = '$fabuFee', `quota` = '$quota', `note` = '$note', `video` = '$video', `steps` = '$steps', `ordernum` = '$ordernum', `amount` = '$amount' WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret == 'ok'){

            //记录用户行为日志
            memberLog($uid, 'task', '', $id, 'update', '修改任务('.$id.'=>'.$title.')', '', $sql);

            //订单信息，用于区分其他支付业务
            $param = array(
                'type' => 'task',
                'id' => $id
            );

            //创建订单
            $order = createPayForm("task", $ordernum, $amount, $paytype, "发布任务", $param, 1);
            $order['timeout'] = GetMkTime(time()) + 3600;
            return $order;

        }else{
            return array("state" => 101, "info" => '系统错误，发布失败！');
        }

    }


	/**
    * 修改任务配置
    * 只可以修改提交限时和审核限时
    * 并且状态必须为：已审核、已暂停、已冻结、已结束的，以及没有订单在进行中的任务
    * @return array
    */
	public function editConfig(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id          = (int)$param['id'];  //要修改的任务ID
        $tj_time     = (int)$param['tj_time'];  //提交限时，单位分钟
        $sh_time     = (int)$param['sh_time'];  //审核限时，单位分钟

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证是否有当前模块使用权限
        if(!$this->checkAuth('fabu')){
            return array("state" => 200, "info" => '您已被禁止发布任务！');
        }

        if(empty($tj_time)) return array("state" => 200, "info" => '请选择提交限制时间');
        if(empty($sh_time)) return array("state" => 200, "info" => '请选择审核限制时间');

        //查询任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            $_title = $_ret['title'];

            if($uid != $_ret['uid']){
                return array("state" => 200, "info" => '非您本人的任务，不可进行修改');
            }
            if($_ret['state'] == 0 || $_ret['state'] == 4 || $_ret['finish'] == 1){
                return array("state" => 200, "info" => '当前任务状态不支持修改');
            }

            //查询该任务是否有正在进行中的订单
            $ongoing = 0;
            $sql = $dsql->SetQuery("SELECT COUNT(`id`) ongoing FROM `#@__task_order` WHERE `tid` = ".$id." AND (`state` = 0 OR `state` = 1 OR `state` = 3)");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $ongoing = $ret[0]['ongoing'];
            }
            if($ongoing > 0){
                return array("state" => 200, "info" => '有在进行中的订单不可以修改任务');
            }

        }else{
            return array("state" => 200, "info" => '要修改的任务不存在或已经删除');
        }

        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `tj_time` = '$tj_time', `sh_time` = '$sh_time' WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret == 'ok'){

            //记录用户行为日志
            memberLog($uid, 'task', '', $id, 'update', '修改任务配置('.$id.'=>'.$_title.'=>'.$tj_time.'=>'.$sh_time.')', '', $sql);

            return "修改成功";

        }else{
            return array("state" => 101, "info" => '系统错误，操作失败！');
        }

    }


	/**
    * 修改任务步骤
    * 只可以修改领取条件/限制、视频讲解、任务步骤
    * 并且状态必须为：已审核、已暂停、已冻结、已结束的，以及没有订单在进行中的任务
    * @return array
    */
	public function editSteps(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id          = (int)$param['id'];  //要修改的任务ID
        $note        = filterSensitiveWords($param['note'], false);  //领取条件/限制
        $video       = $param['video'];  //视频讲解
        $steps       = $param['steps'];  //任务步骤

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证是否有当前模块使用权限
        if(!$this->checkAuth('fabu')){
            return array("state" => 200, "info" => '您已被禁止发布任务！');
        }

        if(empty($steps)) return array("state" => 200, "info" => '请设置任务步骤');
        
        //验证步骤格式
        $stepsArr = json_decode($steps, true);
        if(!is_array($stepsArr)) return array("state" => 200, "info" => '任务步骤格式有误');

        //查询任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            $_title = $_ret['title'];
            $_audit_time = $_ret['audit_time'];
            $_state = $_ret['state'];
            $_steps = $_ret['steps'];

            if($uid != $_ret['uid']){
                return array("state" => 200, "info" => '非您本人的任务，不可进行修改');
            }
            if($_ret['state'] == 0 || $_ret['state'] == 4){
                return array("state" => 200, "info" => '当前任务状态不支持修改');
            }

            //查询该任务是否有正在进行中的订单
            $ongoing = 0;
            $sql = $dsql->SetQuery("SELECT COUNT(`id`) ongoing FROM `#@__task_order` WHERE `tid` = ".$id." AND (`state` = 0 OR `state` = 1 OR `state` = 3)");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $ongoing = $ret[0]['ongoing'];
            }
            if($ongoing > 0){
                return array("state" => 200, "info" => '有在进行中的订单不可以修改任务');
            }

        }else{
            return array("state" => 200, "info" => '要修改的任务不存在或已经删除');
        }

        //获取发布审核开关
        include HUONIAOINC."/config/task.inc.php";
        $fabuCheck = (int)$customfabuCheck;

        //如果修改任务需要后台审核，则重置任务的审核时间为0，不需要后台审核，继续使用上次审核的时间
        if(!$fabuCheck){
            $_audit_time = 0;
        }
        
        //对数据长度清理
        $note = cn_substrR($note, 200);

        //如果是修改被拒绝的任务
        if($_state == 2){
            $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `note` = '$note', `video` = '$video', `steps` = '$steps', `steps_last_edit` = '$_steps', `state` = '$fabuCheck', `audit_time` = '$_audit_time' WHERE `id` = " . $id);
        }
        //进行中的任务修改步骤
        else{
            $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `note` = '$note', `video` = '$video', `steps` = '$steps', `steps_last_edit` = '$_steps', `state` = '$fabuCheck', `review` = '进行中的任务修改了任务步骤', `audit_time` = '$_audit_time' WHERE `id` = " . $id);
        }
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret == 'ok'){

            //记录用户行为日志
            memberLog($uid, 'task', '', $id, 'update', '修改任务步骤('.$id.'=>'.$_title.')', '', $sql);

            return "修改成功";

        }else{
            return array("state" => 101, "info" => '系统错误，操作失败！');
        }

    }


	/**
    * 极速审核
    * 任务状态必须为：已审核进行中的任务，以及没有订单在进行中的任务
    * @return array
    */
	public function fastAudit(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id    = (int)$param['id'];  //要修改的任务ID
        $began = $param['began'];  //开始时间，格式：00:00
        $end   = $param['end'];  //结束时间，格式：00:00
        $time  = (int)$param['time'];  //审核限时，单位：分钟

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        if(empty($began) || empty($end)){
            return array("state" => 200, "info" => '请选择开始和结束时间！');
        }

        if(empty($time)){
            return array("state" => 200, "info" => '请选择极速审核时间！');
        }
        
        //开始和结束时间格式化
        $js_began_time = GetMkTime(date("Y-m-d", time()) . ' ' . $began);
        $js_end_time = GetMkTime(date("Y-m-d", time()) . ' ' . $end);

        //查询任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            $_title = $_ret['title'];
            $_sh_time = $_ret['sh_time'];
            
            if($js_began_time == $_ret['js_began_time'] && $js_end_time == $_ret['js_end_time'] && $_sh_time == $time){
                return array("state" => 200, "info" => '极速审核配置未发生变化，无须修改！');
            }

            //如果已经设置过极速审核，备份的时间用：js_sh_time_bak
            if($_ret['js_began_time'] > 0 && $_ret['js_end_time'] > 0 && $_ret['js_sh_time_bak'] > 0){
                $_sh_time = $_ret['js_sh_time_bak'];
            }

            $_js_log = $_ret['js_log'] ? json_decode($_ret['js_log'], true) : array();

            if($uid != $_ret['uid']){
                return array("state" => 200, "info" => '非您本人的任务，不可进行修改');
            }
            if($_ret['state'] != 1){
                return array("state" => 200, "info" => '当前任务状态不支持修改');
            }

            //查询该任务是否有正在进行中的订单
            $ongoing = 0;
            $sql = $dsql->SetQuery("SELECT COUNT(`id`) ongoing FROM `#@__task_order` WHERE `tid` = ".$id." AND (`state` = 0 OR `state` = 1 OR `state` = 3)");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $ongoing = $ret[0]['ongoing'];
            }
            if($ongoing > 0){
                return array("state" => 200, "info" => '有在进行中的订单不可以修改任务');
            }

        }else{
            return array("state" => 200, "info" => '要修改的任务不存在或已经删除');
        }

        //记录极速审核设置历史日志
        $js_log = array(
            'began' => $js_began_time,
            'end' => $js_end_time,
            'sh_time' => $time,
            'time' => GetMkTime(time())
        );

        array_push($_js_log, $js_log);
        $_js_log = addslashes(json_encode($_js_log));
        
        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `js_began_time` = '$js_began_time', `js_end_time` = '$js_end_time', `sh_time` = '$time', `js_sh_time_bak` = '$_sh_time', `js_log` = '$_js_log' WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret == 'ok'){

            //记录用户行为日志
            memberLog($uid, 'task', '', $id, 'update', '修改任务为极速审核('.$id.'=>'.$_title.')', '', $sql);

            return "修改成功";

        }else{
            return array("state" => 101, "info" => '系统错误，操作失败！');
        }

    }


	/**
    * 取消极速审核
    * @return array
    */
	public function cancelFastAudit(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //要修改的任务ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //查询任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            $_title = $_ret['title'];

            if($uid != $_ret['uid']){
                return array("state" => 200, "info" => '非您本人的任务，不可进行修改');
            }

        }else{
            return array("state" => 200, "info" => '要修改的任务不存在或已经删除');
        }

        //可能没有设置过极速审核，或者在操作时已经结束了，此时不更新sh_time
        if($_ret['js_sh_time_bak'] <= 0){
            $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `bid_began_time` = 0, `js_end_time` = 0, `js_sh_time_bak` = 0 WHERE `id` = " . $id);
        }else{
            $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `sh_time` = `js_sh_time_bak`, `bid_began_time` = 0, `js_end_time` = 0, `js_sh_time_bak` = 0 WHERE `id` = " . $id);
        }
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret == 'ok'){

            //记录用户行为日志
            memberLog($uid, 'task', '', $id, 'update', '取消极速审核任务('.$id.'=>'.$_title.')', '', $sql);

            return "操作成功";

        }else{
            return array("state" => 101, "info" => '系统错误，操作失败！');
        }

    }


	/**
    * 暂停任务
    * 任务状态必须为：已审核进行中的任务
    * @return array
    */
	public function pause(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //要修改的任务ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //查询任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            $_title = $_ret['title'];

            if($uid != $_ret['uid']){
                return array("state" => 200, "info" => '非您本人的任务，不可进行修改');
            }
            if($_ret['state'] != 1){
                return array("state" => 200, "info" => '当前任务状态不支持暂停');
            }

        }else{
            return array("state" => 200, "info" => '要修改的任务不存在或已经删除');
        }
        
        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `state` = 3 WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret == 'ok'){

            //记录用户行为日志
            memberLog($uid, 'task', '', $id, 'update', '暂停任务('.$id.'=>'.$_title.')', '', $sql);

            return "修改成功";

        }else{
            return array("state" => 101, "info" => '系统错误，操作失败！');
        }

    }


	/**
    * 开始任务
    * 任务状态必须为：已暂停的任务
    * @return array
    */
	public function start(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //要修改的任务ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //查询任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            $_title = $_ret['title'];

            if($uid != $_ret['uid']){
                return array("state" => 200, "info" => '非您本人的任务，不可进行修改');
            }
            if($_ret['state'] != 3){
                return array("state" => 200, "info" => '当前任务已经开始');
            }

        }else{
            return array("state" => 200, "info" => '要修改的任务不存在或已经删除');
        }
        
        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `state` = 1 WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret == 'ok'){

            //记录用户行为日志
            memberLog($uid, 'task', '', $id, 'update', '开始任务('.$id.'=>'.$_title.')', '', $sql);

            return "修改成功";

        }else{
            return array("state" => 101, "info" => '系统错误，操作失败！');
        }

    }


	/**
    * 刷新任务
    * 任务状态必须为：已审核进行中的任务
    * @return array
    */
	public function refresh(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //要刷新的任务ID
        $type = (int)$param['type'];  //刷新类型 0单次刷新  1自动刷新
        $start = $param['start'];  //自动刷新开始时间
        $count = (int)$param['count'];  //自动刷新次数
        $interval = (int)$param['interval'];  //自动刷新间隔时间，单位分钟，最短间隔1分钟
        $interval = $interval == 0 ? 1 : $interval; 

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //查询任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            $_title = $_ret['title'];

            if($uid != $_ret['uid']){
                return array("state" => 200, "info" => '非您本人的任务，不可进行刷新');
            }
            if($_ret['state'] != 1){
                return array("state" => 200, "info" => '当前任务状态不可以刷新');
            }
            if($_ret['refresh_count'] > 0){
                return array("state" => 200, "info" => '当前任务已设置自动刷新，请等待结束后再操作！');
            }

        }else{
            return array("state" => 200, "info" => '要刷新的任务不存在或已经删除');
        }
        
        $refresh_coupon = 0;  //剩余刷新道具
        $refresh_discount = 0;  //会员刷新任务优惠折扣

        //查询会员账户剩余刷新次数
        $time = GetMkTime(time());   
        $sql = $dsql->SetQuery("SELECT m.`refresh_coupon`, l.`refresh_discount` FROM `#@__task_member` m LEFT JOIN `#@__task_member_level` l ON l.`id` = m.`level` WHERE m.`uid` = " . $uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $refresh_coupon = (int)$ret[0]['refresh_coupon'];
            $refresh_discount = (int)$ret[0]['refresh_discount'];
        }
        
        //还有剩余，直接刷新
        if($refresh_coupon >= 1){

            //自动刷新判断余额
            if($type == 1 && $count > $refresh_coupon){
                return array("state" => 101, "info" => '刷新道具不足');
            }
            
            $date = GetMkTime(time());

            //单次刷新
            if($type == 0){
                $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `refresh_time` = '$date' WHERE `id` = " . $id);
            
            //自动刷新
            }else{
                $start = GetMkTime($start);
                $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `refresh_time` = '$date', `refresh_start` = '$start', `refresh_count` = '$count', `refresh_total_count` = '$count', `refresh_interval` = '$interval' WHERE `id` = " . $id);
            }
            $ret = $dsql->dsqlOper($sql, "update");

            if($ret == 'ok'){

                if($type == 0){
                    $refresh_coupon--;
                }else{
                    $refresh_coupon -= $count;
                }

                //记录用户行为日志
                memberLog($uid, 'task', '', $id, 'update', '使用道具刷新任务['.($type == 0 ? '单次' : '自动刷新'.$count.'次，每隔'.$interval.'分钟').']('.$id.'=>'.$_title.')', '', $sql);

                //更新剩余刷新次数
                $sql = $dsql->SetQuery("UPDATE `#@__task_member` SET `refresh_coupon` = '$refresh_coupon' WHERE `uid` = " . $uid);
                $ret = $dsql->dsqlOper($sql, "update");

                return "刷新成功，剩余【".$refresh_coupon."】个刷新道具！";

            }else{
                return array("state" => 101, "info" => '系统错误，刷新失败！');
            }

        //没有剩余，需要支付
        }else{

            //后边增加了刷新道具功能，所以这里不需要单次刷新付费功能了，直接返回固定字符串
            return array("state" => 101, "info" => '刷新道具不足');

            // //引入模块配置
            // include HUONIAOINC."/config/task.inc.php";

            // //刷新单价
            // $refreshPrice = (float)$customrefreshPrice;

            // //如果免费，直接刷新
            // if($refreshPrice <= 0){
            //     $date = GetMkTime(time());
            //     $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `refresh_time` = '$date' WHERE `id` = " . $id);
            //     $ret = $dsql->dsqlOper($sql, "update");

            //     if($ret == 'ok'){

            //         //记录用户行为日志
            //         memberLog($uid, 'task', '', $id, 'update', '免费刷新任务('.$id.'=>'.$_title.')', '', $sql);

            //         return "刷新成功！";

            //     }else{
            //         return array("state" => 101, "info" => '系统错误，刷新失败！');
            //     }

            // //付费刷新，创建订单
            // }else{

            //     //折扣
            //     if($refresh_discount){
            //         $refreshPrice = $refreshPrice * $refresh_discount / 100;
            //     }

            //     $ordernum = create_ordernum();

            //     //订单信息，用于区分其他支付业务
            //     $param = array(
            //         'type' => 'refresh',
            //         'id' => $id
            //     );

            //     //创建订单
            //     $order = createPayForm("task", $ordernum, $refreshPrice, '', "刷新任务", $param, 1);
            //     $order['timeout'] = GetMkTime(time()) + 3600;
            //     return $order;

            // }

        }

    }


	/**
    * 推荐任务
    * 任务状态必须为：已审核进行中的任务
    * @return array
    */
	public function recommend(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //要修改的任务ID
        $hour = (int)$param['hour'];  //要推荐的时长，单位：小时

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //查询任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            $_title = $_ret['title'];

            if($uid != $_ret['uid']){
                return array("state" => 200, "info" => '非您本人的任务，不可进行修改');
            }
            if($_ret['state'] != 1){
                return array("state" => 200, "info" => '当前任务状态不可以上推荐');
            }

        }else{
            return array("state" => 200, "info" => '要修改的任务不存在或已经删除');
        }
        
        $bid_coupon = 0;  //剩余推荐时长
        $bid_discount = 0;  //会员推荐任务优惠折扣

        //查询会员账户剩余推荐时长
        $time = GetMkTime(time());   
        $sql = $dsql->SetQuery("SELECT m.`bid_coupon`, l.`bid_discount`, m.`end_time` FROM `#@__task_member` m LEFT JOIN `#@__task_member_level` l ON l.`id` = m.`level` WHERE m.`uid` = " . $uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $bid_coupon = (int)$ret[0]['bid_coupon'];
            $bid_discount = $ret[0]['end_time'] >= $time ? (int)$ret[0]['bid_discount'] : 0;  //如果会员已经过期，不再享受折扣
        }

        //还有剩余，并且剩余时间足够要推荐的时长
        if($bid_coupon >= $hour){

            $date = GetMkTime(time());
            $end = $date + $hour * 60 * 60;  //结束时间
            $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `isbid` = '1', `bid_began_time` = '$date', `bid_end_time` = '$end' WHERE `id` = " . $id);
            $ret = $dsql->dsqlOper($sql, "update");

            if($ret == 'ok'){

                $bid_coupon -= $hour;

                //记录用户行为日志
                memberLog($uid, 'task', '', $id, 'update', '使用剩余推荐时长推荐任务('.$id.'=>'.$_title.'=>'.$hour.'小时)', '', $sql);

                //更新剩余推荐时长
                $sql = $dsql->SetQuery("UPDATE `#@__task_member` SET `bid_coupon` = '$bid_coupon' WHERE `uid` = " . $uid);
                $ret = $dsql->dsqlOper($sql, "update");

                return "推荐成功，剩余【".$bid_coupon."】个小时推荐时长！";

            }else{
                return array("state" => 101, "info" => '系统错误，推荐失败！');
            }

        //没有剩余，需要支付
        }else{

            //引入模块配置
            include HUONIAOINC."/config/task.inc.php";

            //刷新单价
            $bidPrice = (float)$custombidPrice * $hour;

            //如果免费，直接刷新
            if($bidPrice <= 0){
                $date = GetMkTime(time());
                $end = $date + $hour * 60 * 60;  //结束时间
                $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `isbid` = '1', `bid_began_time` = '$date', `bid_end_time` = '$end' WHERE `id` = " . $id);
                $ret = $dsql->dsqlOper($sql, "update");

                if($ret == 'ok'){

                    //记录用户行为日志
                    memberLog($uid, 'task', '', $id, 'update', '免费推荐任务('.$id.'=>'.$_title.'=>'.$hour.'小时)', '', $sql);

                    return "推荐成功！";

                }else{
                    return array("state" => 101, "info" => '系统错误，刷新失败！');
                }

            //付费刷新，创建订单
            }else{

                //折扣
                if($bid_discount){
                    $bidPrice = $bidPrice * $bid_discount / 100;
                }

                $ordernum = create_ordernum();

                //订单信息，用于区分其他支付业务
                $param = array(
                    'type' => 'bid',
                    'id' => $id,
                    'hour' => $hour
                );

                //创建订单
                $order = createPayForm("task", $ordernum, $bidPrice, '', "推荐任务", $param, 1);
                $order['timeout'] = GetMkTime(time()) + 3600;
                return $order;

            }

        }

    }


	/**
    * 加量加价
    * 任务状态必须为：已审核进行中、已暂停、已结束的任务，以及没有订单在进行中的任务
    * @return array
    */
	public function addPlus(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //要修改的任务ID
        $type = (int)$param['type'];  //操作类型 0加数量，1加单价
        $value = $type ? (float)$param['value'] : (int)$param['value'];  //要加的值

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //查询任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            $_price = $_ret['mprice'];
            $_quota = $_ret['quota'];

            if($uid != $_ret['uid']){
                return array("state" => 200, "info" => '非您本人的任务，不可进行修改');
            }
            if($_ret['state'] != 1 && $_ret['state'] != 3){
                return array("state" => 200, "info" => '当前任务状态不可以操作');
            }

            //查询该任务是否有正在进行中的订单
            $ongoing = 0;
            $sql = $dsql->SetQuery("SELECT COUNT(`id`) ongoing FROM `#@__task_order` WHERE `tid` = ".$id." AND (`state` = 0 OR `state` = 1 OR `state` = 3)");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $ongoing = $ret[0]['ongoing'];
            }
            if($ongoing > 0){
                return array("state" => 200, "info" => '有在进行中的订单不可以操作');
            }

        }else{
            return array("state" => 200, "info" => '要修改的任务不存在或已经删除');
        }
        
        $_type = '';

        //计算实际支付的价格
        //加数量
        if($type == 0){
            $_type = '任务加量';
            $amount = $value * $_price;  //加的数量 * 单价

        //加单价
        }else{
            $_type = '任务加价';

            //剩余名额
            $used = 0;
            $sql = $dsql->SetQuery("SELECT COUNT(`id`) used FROM `#@__task_order` WHERE `tid` = ".$id." AND `state` != 4 AND `finish` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $used = $ret[0]['used'];
            }

            $_quota -= $used;

            $amount = $_quota * $value;  //剩余名额 * 要加的单价
        }

        $ordernum = create_ordernum();

        //订单信息，用于区分其他支付业务
        $param = array(
            'type' => 'addplus' . $type,
            'id' => $id,
            'value' => $value
        );

        //创建订单
        $order = createPayForm("task", $ordernum, $amount, '', $_type, $param, 1);
        $order['timeout'] = GetMkTime(time()) + 3600;
        return $order;


    }


	/**
    * 立即支付
    * 用于发布后没有直接支付，到任务列表中又重新发起的支付
    * @return array
    */
	public function paynow(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //任务ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //获取任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_uid = $ret[0]['uid'];
            $_haspay = (int)$ret[0]['haspay'];
            $_amount = $ret[0]['amount'];

            if($uid != $_uid){
                return array("state" => 200, "info" => '非您本人的任务，不可发起支付');
            }

            if($_haspay){
                return array("state" => 200, "info" => '任务已经支付过，无须重新支付');
            }

        }else{
            return array("state" => 200, "info" => '任务不存在或已经删除');
        }

        $ordernum = create_ordernum();

        //更新订单号
        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `ordernum` = '$ordernum' WHERE `id` = " . $id);
        $dsql->dsqlOper($sql, "update");

        //订单信息，用于区分其他支付业务
        $param = array(
            'type' => 'task',
            'id' => $id
        );

        //创建订单
        $order = createPayForm("task", $ordernum, $_amount, '', "发布任务", $param, 1);
        $order['timeout'] = GetMkTime(time()) + 3600;
        return $order;

    }


	/**
    * 删除任务
    * 只有未支付和已支付(审核中、审核拒绝)的任务才可以删除
    * @return array
    */
	public function del(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //任务ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //获取任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_uid = $ret[0]['uid'];
            $_title = $ret[0]['title'];
            $_state = (int)$ret[0]['state'];
            $_haspay = (int)$ret[0]['haspay'];
            $_amount = $ret[0]['amount'];

            if($uid != $_uid){
                return array("state" => 200, "info" => '非您本人的任务，不可删除');
            }

            if($_state != 0 && $_state != 2){
                return array("state" => 200, "info" => '任务当前状态不可以删除');
            }

        }else{
            return array("state" => 200, "info" => '任务不存在或已经删除');
        }

        //已经支付过的，先退款
        if($_haspay){

            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + $_amount WHERE `id` = ".$_uid);
            $dsql->dsqlOper($archives, "update");

            $userinfo  = $userLogin->getMemberInfo($_uid);
            $usermoney = $userinfo['money'];
            $info = '取消任务退款';
            $date = time();

            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`, `montype`, `ordertype`, `ctype`, `balance`) VALUES ('$_uid', 1, '$_amount', '$info', '$date', '1', 'task', 'tuikuan', '$usermoney')");
            $dsql->dsqlOper($archives, "update");

            //自定义配置
            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "record"
            );

            $config = array(
                "username" => $userinfo['nickname'],
                "amount" => '+'.$_amount,
                "money" => $usermoney,
                "date" => date("Y-m-d H:i:s", $date),
                "info" => $info,
                "fields" => array(
                    'keyword1' => '变动类型',
                    'keyword2' => '变动金额',
                    'keyword3' => '变动时间',
                    'keyword4' => '帐户余额'
                )
            );

            updateMemberNotice($_uid, "会员-帐户资金变动提醒", $param, $config);
            
        }

        //删除任务
        $sql = $dsql->SetQuery("DELETE FROM `#@__task_list` WHERE `id` = " . $id);
        $dsql->dsqlOper($sql, "update");

        //记录用户行为日志
        memberLog($uid, 'task', '', $id, 'delete', '删除任务('.$id.'=>'.$_title.')', '', $sql);

        return array("state" => 200, "info" => '操作成功');

    }


	/**
    * 结束任务
    * 进行中的任务可以结束掉，未使用的名额费用退回的账户余额
    * @return array
    */
	public function finish(){
        global $dsql;
        global $userLogin;

        //引入模块配置
        include HUONIAOINC."/config/task.inc.php";

        $param = $this->param;

        $id = (int)$param['id'];  //任务ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //当前时间
        $date = GetMkTime(time());

        //获取任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_uid = $ret[0]['uid'];
            $_title = $ret[0]['title'];
            $_state = (int)$ret[0]['state'];
            $_haspay = (int)$ret[0]['haspay'];
            $_price = (float)$ret[0]['price']; //任务单价，扣除过佣金
            $_mprice = (float)$ret[0]['mprice']; //任务原价
            $_fabu_fee = (int)$ret[0]['fabu_fee']; //平台抽佣比例
            $_quota = (int)$ret[0]['quota']; //名额
            $_finish = (int)$ret[0]['finish'];

            if($uid != $_uid){
                return array("state" => 200, "info" => '非您本人的任务，不可结束');
            }

            if($_state != 1 && $_state != 3){
                return array("state" => 200, "info" => '任务当前状态不可以结束');
            }

            if($_finish){
                return array("state" => 200, "info" => '任务已经结束');
            }

        }else{
            return array("state" => 200, "info" => '任务不存在或已经删除');
        }

        //查询已经提交待审核的订单
        $okcount = 0;
        $sql = $dsql->SetQuery("SELECT COUNT(`id`) totalCount FROM `#@__task_order` WHERE `tid` = $id AND `finish` = 0 AND `state` = 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $okcount = $ret[0]['totalCount'];
        }
        if($okcount){
            return array("state" => 200, "info" => '该任务有未审核的订单，请审核后再结束任务。');
        }

        //查询已经完成的订单
        $okcount = 0;
        $sql = $dsql->SetQuery("SELECT COUNT(`id`) totalCount FROM `#@__task_order` WHERE `tid` = $id AND `finish` = 0 AND `state` = 2");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $okcount = $ret[0]['totalCount'];
        }

        $_amount = ($_quota - $okcount) * $_mprice; //剩余名额*任务原价

        //已经支付过的，先退款
        if($_haspay){

            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + $_amount WHERE `id` = ".$_uid);
            $dsql->dsqlOper($archives, "update");

            $userinfo  = $userLogin->getMemberInfo($_uid);
            $usermoney = $userinfo['money'];
            $info = '结束任务退款';

            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`, `montype`, `ordertype`, `ctype`, `balance`) VALUES ('$_uid', 1, '$_amount', '$info', '$date', '1', 'task', 'tuikuan', '$usermoney')");
            $dsql->dsqlOper($archives, "update");

            //自定义配置
            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "record"
            );

            $config = array(
                "username" => $userinfo['nickname'],
                "amount" => '+'.$_amount,
                "money" => $usermoney,
                "date" => date("Y-m-d H:i:s", $date),
                "info" => $info,
                "fields" => array(
                    'keyword1' => '变动类型',
                    'keyword2' => '变动金额',
                    'keyword3' => '变动时间',
                    'keyword4' => '帐户余额'
                )
            );

            updateMemberNotice($_uid, "会员-帐户资金变动提醒", $param, $config);
            
        }

        //更新任务关联订单的状态，这里不做更新，改到加量上架时更新
        // $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `finish` = 1 WHERE `tid` = $id");
        // $dsql->dsqlOper($sql, "update");

        //更新已经领取了任务还未提交的订单状态为已取消
        $sql = $dsql->SetQuery("SELECT `tj_log`, `uid` FROM `#@__task_order` WHERE `tid` = $id AND `state` = 0");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach($ret as $key => $val){
                
                $_tj_log = json_decode($val['tj_log'], true);

                //提交日志
                $userinfo = $userLogin->getMemberInfo($val['uid']);
                $tj_log = array(
                    'type' => 'text',
                    'uid' => $val['uid'],
                    'nickname' => $userinfo['nickname'],
                    'photo' => $userinfo['photo'],
                    'time' => $date,
                    'title' => '商家提前结束任务',
                    'value' => ''
                );

                array_push($_tj_log, $tj_log);
                $_tj_log = addslashes(json_encode($_tj_log));

                $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `state` = 4, `qx_time` = '$date', `tj_log` = '$_tj_log', `sh_explain` = '商家提前结束任务' WHERE `state` = 0 AND `tid` = " . $id);
                $dsql->dsqlOper($sql, "update");
            }
        }

        //记录用户行为日志
        memberLog($uid, 'task', '', $id, 'update', '结束任务('.$id.'=>'.$_title.'，有退款：'.$_amount.'元)', '', $sql);



        //查询已完成订单的佣金总额
        $amount = 0;
        $sql = $dsql->SetQuery("SELECT `price`, `fabu_fee`, `mprice` FROM `#@__task_order` WHERE `state` = 2 AND `finish` = 0 AND `tid` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach($ret as $key => $val){
                // if($val['fabu_fee']){
                //     $amount += floatval(sprintf("%.2f", ($val['price'] / (1-$val['fabu_fee']) - $val['price'])));  //查询每一单的佣金和平台抽佣比例，计算平台应得佣金
                // }

                if($val['mprice'] > 0 && $val['price'] > 0){
                    $amount += floatval(sprintf("%.2f", $val['mprice'] - $val['price']));  //mprice是领取任务时记录的任务结算原价，price是扣除过平台佣金和会员增加的佣金
                }
            }
        }

        //更新任务状态
        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `finish` = 1 WHERE `id` = " . $id);
        $dsql->dsqlOper($sql, "update");

        //平台抽佣&分销
        // $amount = floatval(sprintf('%.2f', $_price * $_fabu_fee * $okcount)); //平台应得佣金，单价*佣金比例*已完成数量

        //扣除佣金  
        $fenXiao = (int)$customfenXiao;
        $fenxiaoFee = (int)$customfenxiaoFee;
        $_amount = $amount;  //平台得到的金额

        //平台分销开关
        global $cfg_fenxiaoState;
        global $cfg_fenxiaoDeposit;

        //分销金额
        $_fenxiaoAmount = 0;
        if($cfg_fenxiaoState && $fenXiao && $amount > 0.01){
            $_fenxiaoAmount = $amount * $fenxiaoFee / 100;

            $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;

            //分佣 开关
            $fenxiaoTotalPrice = $_fenxiaoAmount;
            global $transaction_id;
            $transaction_id = $param['transaction_id'];  //第三方平台支付订单号
            $paramarr['ordernum'] = $ordernum;
            $paramarr['title'] = $_title;
            $paramarr['amount'] = $_fenxiaoAmount;
            $paramarr['type'] = '任务完成佣金，任务名称：'. $_title;
            if($fenXiao == 1 && $uid != -1){
                (new member())->returnFxMoney("task", $uid, $ordernum, $paramarr, 1);

                $title1 = '任务完成佣金，任务名称：' . $_title;
                //查询一共分销了多少佣金
                //如果系统没有开启资金沉淀才需要查询实际分销了多少
                if(!$cfg_fenxiaoDeposit){
                    $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$title1' AND `module`= 'task'");
                    $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                    $fenxiaoTotalPrice = $fenxiaomonyeres[0]['allfenxiao'];
                }
            }

            $_amount -= sprintf("%.2f", $fenxiaoTotalPrice);  //平台得到的减去分销出去的
        }

        //记录平台收入
        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$uid', '1', '$_amount', '$_title', '$date','0','0','task',$_amount,'1','fabuxinxi')");
        $dsql->dsqlOper($archives, "update");

        //通知平台管理员
        $userinfo  = $userLogin->getMemberInfo($uid);
        $allincom = getAllincome();  //获取平台今日收益
        $infoname = getModuleTitle(array('name' => 'task'));  //获取模块名

        //微信通知
        $params = array(
            'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
            'cityid' => 0,
            'notify' => '管理员消息通知',
            'fields' =>array(
                'contentrn'  => $infoname."模块完成任务\r\n发布用户：".$userinfo['nickname']."\r\n任务名称：".$title."\r\n\r\n平台获得佣金:".$_amount,
                'date' => date("Y-m-d H:i:s", time()),
                'status' => "今日总收入：$allincom"
            )
        );

        //后台微信通知
        updateAdminNotice("task", "detail", $params);

        return array("state" => 200, "info" => '操作成功');

    }


    /**
     * 支付验证
     */
    public function checkPayAmount(){
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();
        $param  = $this->param;

        $ordernum   = $param['ordernum'];    //订单号
        $useBalance = $param['useBalance'];  //是否使用余额
        // $balance    = $param['balance'];     //使用的余额
        $paypwd     = $param['paypwd'];      //支付密码

        if (empty($ordernum)) return array("state" => 200, "info" => "提交失败，订单号不能为空！");
        if ($useBalance && empty($paypwd)) return array("state" => 200, "info" => "请输入支付密码！");

        $totalPrice  = 0;

        //查询订单信息
        $archives = $dsql->SetQuery("SELECT `amount` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 0");
        $results  = $dsql->dsqlOper($archives, "results");
        if(!$results){
            return array("state" => 200, "info" => "订单不存在或已经支付过");
        }
        $res = $results[0];

        $orderprice = $res['amount'];
        $totalPrice += $orderprice;

		//未登录状态，不验证余额
		if($userid == -1) return $totalPrice;

        //查询会员信息
        $userinfo  = $userLogin->getMemberInfo();
        $usermoney = $userinfo['money'];

        $tit = array();
        $useTotal = 0;

        //判断是否使用余额，并且验证余额和支付密码
        if ($useBalance == 1 && !empty($totalPrice) && !empty($paypwd)) {

            //验证支付密码
            $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res      = $results[0];
            $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
            if ($res['paypwd'] != $hash) return array("state" => 200, "info" => "支付密码输入错误，请重试！");

            //验证余额
            if ($usermoney < $totalPrice) return array("state" => 200, "info" => "您的余额不足，支付失败！");

            $useTotal += $totalPrice;

            $tit[] = "余额";
        }
        if ($useTotal > $totalPrice) return array("state" => 200, "info" => "您使用的" . join("和", $tit) . "超出订单总费用，请重新输入要使用的" . join("和", $tit));

        //返回需要支付的费用
        return sprintf("%.2f", $totalPrice - $useTotal);

    }

    /**
     * 支付
     * @return [type] [description]
     */
    public function pay(){
        global $dsql;
        global $userLogin;

        $param          = $this->param;
        $paytype        = $param['paytype'];
        $ordernum       = $param['ordernum'];
        $useBalance     = $param['useBalance'];
        $balance        = $param['balance'];
        $paypwd         = $this->param['paypwd'];      //支付密码
        $payTotalAmount = $this->checkPayAmount();
        $userid         = $userLogin->getMemberID();

        if ($ordernum && $paytype) {
            $sql = $dsql->SetQuery("SELECT `amount` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 0");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $amount = $res[0]['amount'];

                if(is_array($payTotalAmount)){
                    return $payTotalAmount;
                }

                if ($payTotalAmount > 0) {
                    //跳转至第三方支付页面
                    $order = createPayForm("task", $ordernum, $amount, $paytype, "发布任务");
                    $order['timeout'] = GetMkTime(time()) + 3600;
                    return $order;

                } else {

                    $paytype = 'money';
                    $date    = GetMkTime(time());
                    $paysql  = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
                    $payre   = $dsql->dsqlOper($paysql, "results");
                    if (!empty($payre)) {
                        $archives = $dsql->SetQuery("UPDATE  `#@__pay_log` SET `ordertype` = 'task', `uid` = $userid, `amount` = '$amount', `paytype` = '$paytype', `state` = 1, `pubdate` = $date  WHERE `ordernum` = '$ordernum' AND `ordertype` = 'task'");
                        $dsql->dsqlOper($archives, "update");

                    } else {
                        $body = serialize($param);
                        $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('task', '$ordernum', '$userid', '$body', '$amount', '$paytype', 1, $date)");
                        $dsql->dsqlOper($archives, "results");
                    }

                    //支付成功
                    $this->param = array(
                        "paytype"  => $paytype,
                        "ordernum" => $ordernum
                    );
                    $this->paySuccess();

                    $param    = array(
                        "service"  => "task",
                        "template" => "index",
                    );
                    $url = getUrlPath($param);
                    return $url;
                    
                }
            }else{
                return array("state" => 200, "info" => "订单不存在或已经支付过");
            }
        }
        die;

    }


	/**
	 * 支付成功
	 * 此处进行支付成功后的操作，例如发送短信等服务
	 *
	 */
	public function paySuccess(){
        global $dsql;
        global $userLogin;    
        
        //引入模块配置
        include HUONIAOINC."/config/task.inc.php";

		$param = $this->param;
		if(!empty($param)){

			$paytype  = $param['paytype'];
			$ordernum = $param['ordernum'];
			$date     = GetMkTime(time());

            //查询支付日志
            $pay_uid = 0;
            $payamount = 0;
            $body = array();
            $sql = $dsql->SetQuery("SELECT `uid`, `body`, `amount` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $pay_uid = (int)$ret[0]['uid'];
                $body = $ret[0]['body'] ? unserialize($ret[0]['body']) : array();
                $payamount = (float)$ret[0]['amount'];
            }

            if(!$body || !is_array($body)) return;

            $_type = $body['type'];  //订单类型，task:发布任务
            $_id   = $body['id'];    //对应数据ID

            //发布任务付费
            if($_type == 'task'){
                //查询任务信息
                $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `haspay` = 0 AND `id` = '$_id'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){

                    $rid    = $ret[0]['id'];
                    $uid    = $ret[0]['uid'];
                    $title  = $ret[0]['title'];
                    $amount = $ret[0]['amount'];
                    $_title = "发布任务：".$title;

                    //不需要审核的话更新为已审核
                    $upd = '';
                    $fabuCheck = (int)$customfabuCheck;
                    if($fabuCheck){
                        $upd = ", `state` = 1, `refresh_time` = '$date'";
                    }
                    
                    //更新任务为已支付和已审核
                    $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `haspay` = 1, `pay_type` = '$paytype', `pay_time` = '$date' ".$upd." WHERE `id` = " . $rid);
                    $dsql->dsqlOper($sql, "update");

                    //查询支付记录
                    $sql = $dsql->SetQuery("SELECT `id`,`amount`,`paytype` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $pid = '';
                    $truepayprice = 0;
                    if($ret){
                        $pid 		  = $ret[0]['id'];
                        $truepayprice = $ret[0]['amount'];
                        $paytype      = $ret[0]['paytype'];
                    }

                    $userbalance = 0;
                    if($paytype == 'money'){
                        $userbalance = $truepayprice;
                    }else{
                        /*混合支付*/
                        $userbalance = $amount - $truepayprice;
                    }

                    if (!empty($userbalance) && $userbalance > 0) {
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$userbalance' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");

                        //查询会员信息
                        $userinfo  = $userLogin->getMemberInfo($uid);
                        $usermoney = $userinfo['money'];
                            
                        $urlParam = array();
                        
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$amount', '$_title', '$date','task','fabuxinxi','$pid','$urlParam','$title','$ordernum','$usermoney')");
                        $dsql->dsqlOper($archives, "update");

                        //记录用户行为日志
                        memberLog($uid, 'task', '', $rid, 'insert', '发布任务('.$title.' => '.$amount.'元)', '', $archives);
                    }

                    // //扣除佣金  
                    // $fenXiao = (int)$customfenXiao;
                    // $fenxiaoFee = (int)$customfenxiaoFee;
                    // $_amount = $amount;  //平台得到的金额

                    // //平台分销开关
                    // global $cfg_fenxiaoState;
                    // global $cfg_fenxiaoDeposit;

                    // //分销金额
                    // $_fenxiaoAmount = 0;
                    // if($cfg_fenxiaoState && $fenXiao && $amount > 0.01){
                    //     $_fenxiaoAmount = $amount * $fenxiaoFee / 100;

                    //     $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;

                    //     //分佣 开关
                    //     $fenxiaoTotalPrice = $_fenxiaoAmount;
                    //     global $transaction_id;
                    //     $transaction_id = $param['transaction_id'];  //第三方平台支付订单号
                    //     $paramarr['ordernum'] = $ordernum;
                    //     $paramarr['title'] = $_title;
                    //     $paramarr['amount'] = $_fenxiaoAmount;
                    //     $paramarr['type'] = '发布信息，订单号：'. $ordernum;
                    //     if($fenXiao == 1 && $uid != -1){
                    //         (new member())->returnFxMoney("task", $uid, $ordernum, $paramarr, 1);

                    //         $title1 = '发布信息，订单号：' . $ordernum;
                    //         //查询一共分销了多少佣金
                    //         //如果系统没有开启资金沉淀才需要查询实际分销了多少
                    //         if(!$cfg_fenxiaoDeposit){
                    //             $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$title1' AND `module`= 'task'");
                    //             $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                    //             $fenxiaoTotalPrice = $fenxiaomonyeres[0]['allfenxiao'];
                    //         }
                    //     }

                    //     $_amount -= sprintf("%.2f", $fenxiaoTotalPrice);  //平台得到的减去分销出去的
                    // }

                    // //记录平台收入
                    // $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$uid', '1', '$_amount', '$_title', '$date','0','0','task',$_amount,'1','fabuxinxi')");
                    // $dsql->dsqlOper($archives, "update");

                    // //通知平台管理员
                    // $userinfo  = $userLogin->getMemberInfo($uid);
                    // $allincom = getAllincome();  //获取平台今日收益
                    // $infoname = getModuleTitle(array('name' => 'task'));  //获取模块名

                    // //微信通知
                    // $params = array(
                    //     'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                    //     'cityid' => 0,
                    //     'notify' => '管理员消息通知',
                    //     'fields' =>array(
                    //         'contentrn'  => $infoname."模块发布任务\r\n用户：".$userinfo['nickname']."\r\n信息：".$title."\r\n\r\n平台获得佣金:".$_amount,
                    //         'date' => date("Y-m-d H:i:s", time()),
                    //         'status' => "今日总收入：$allincom"
                    //     )
                    // );

                    // //后台微信通知
                    // updateAdminNotice("task", "detail", $params);

                }

            //付费刷新任务
            }elseif($_type == 'refresh'){

                //查询任务信息
                $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = '$_id'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){

                    $rid    = $ret[0]['id'];
                    $uid    = $ret[0]['uid'];
                    $title  = $ret[0]['title'];
                    $_title = "刷新任务：".$title;
                    
                    //更新任务为已支付和已审核
                    $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `refresh_time` = '$date' WHERE `id` = " . $rid);
                    $dsql->dsqlOper($sql, "update");

                    //查询支付记录
                    $sql = $dsql->SetQuery("SELECT `id`,`amount`,`paytype` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $pid = '';
                    $truepayprice = 0;
                    if($ret){
                        $pid 		  = $ret[0]['id'];
                        $truepayprice = $ret[0]['amount'];
                        $paytype      = $ret[0]['paytype'];
                    }

                    $userbalance = 0;
                    if($paytype == 'money'){
                        $userbalance = $truepayprice;
                    }else{
                        /*混合支付*/
                        $userbalance = $payamount - $truepayprice;
                    }

                    if (!empty($userbalance) && $userbalance > 0) {
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$userbalance' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");

                        //查询会员信息
                        $userinfo  = $userLogin->getMemberInfo($uid);
                        $usermoney = $userinfo['money'];
                            
                        $urlParam = array();
                        
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$truepayprice', '$_title', '$date','task','fabuxinxi','$pid','$urlParam','$title','$ordernum','$usermoney')");
                        $dsql->dsqlOper($archives, "update");
                    }

                    //记录用户行为日志
                    memberLog($uid, 'task', '', $rid, 'update', '刷新任务('.$rid.' => '.$title.' => '.$truepayprice.'元)', '', $archives);

                    //扣除佣金  
                    $fenXiao = (int)$customfenXiao;
                    $fenxiaoFee = (int)$customfenxiaoFee;
                    $_amount = $payamount;  //平台得到的金额

                    //平台分销开关
                    global $cfg_fenxiaoState;
                    global $cfg_fenxiaoDeposit;

                    //分销金额
                    $_fenxiaoAmount = 0;
                    if($cfg_fenxiaoState && $fenXiao && $payamount > 0.01){
                        $_fenxiaoAmount = $payamount * $fenxiaoFee / 100;

                        $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;

                        //分佣 开关
                        $fenxiaoTotalPrice = $_fenxiaoAmount;
                        global $transaction_id;
                        $transaction_id = $param['transaction_id'];  //第三方平台支付订单号
                        $paramarr['ordernum'] = $ordernum;
                        $paramarr['title'] = $_title;
                        $paramarr['amount'] = $_fenxiaoAmount;
                        $paramarr['type'] = '刷新任务，订单号：'. $ordernum;
                        if($fenXiao == 1 && $uid != -1){
                            (new member())->returnFxMoney("task", $uid, $ordernum, $paramarr, 1);

                            $title1 = '刷新任务，订单号：' . $ordernum;
                            //查询一共分销了多少佣金
                            //如果系统没有开启资金沉淀才需要查询实际分销了多少
                            if(!$cfg_fenxiaoDeposit){
                                $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$title1' AND `module`= 'task'");
                                $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                                $fenxiaoTotalPrice = $fenxiaomonyeres[0]['allfenxiao'];
                            }
                        }

                        $_amount -= sprintf("%.2f", $fenxiaoTotalPrice);  //平台得到的减去分销出去的
                    }

                    //记录平台收入
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$uid', '1', '$_amount', '$_title', '$date','0','0','task',$_amount,'1','fabuxinxi')");
                    $dsql->dsqlOper($archives, "update");

                    //通知平台管理员
                    $userinfo  = $userLogin->getMemberInfo($uid);
                    $allincom = getAllincome();  //获取平台今日收益
                    $infoname = getModuleTitle(array('name' => 'task'));  //获取模块名

                    //微信通知
                    $params = array(
                        'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                        'cityid' => 0,
                        'notify' => '管理员消息通知',
                        'fields' =>array(
                            'contentrn'  => $infoname."模块刷新任务\r\n用户：".$userinfo['nickname']."\r\n信息：".$title."\r\n\r\n平台获得佣金:".$_amount,
                            'date' => date("Y-m-d H:i:s", time()),
                            'status' => "今日总收入：$allincom"
                        )
                    );

                    //后台微信通知
                    updateAdminNotice("task", "detail", $params);

                }

            //付费推荐任务
            }elseif($_type == 'bid'){

                $_hour = $body['hour'];    //推荐时长

                //查询任务信息
                $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = '$_id'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){

                    $rid    = $ret[0]['id'];
                    $uid    = $ret[0]['uid'];
                    $title  = $ret[0]['title'];
                    $_title = "推荐任务：".$title;
                    
                    //更新任务为已推荐
                    $end = $date + $_hour * 60 * 60;  //结束时间
                    $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `isbid` = 1, `bid_began_time` = '$date', `bid_end_time` = '$end' WHERE `id` = " . $rid);
                    $dsql->dsqlOper($sql, "update");

                    //查询支付记录
                    $sql = $dsql->SetQuery("SELECT `id`,`amount`,`paytype` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $pid = '';
                    $truepayprice = 0;
                    if($ret){
                        $pid 		  = $ret[0]['id'];
                        $truepayprice = $ret[0]['amount'];
                        $paytype      = $ret[0]['paytype'];
                    }

                    $userbalance = 0;
                    if($paytype == 'money'){
                        $userbalance = $truepayprice;
                    }else{
                        /*混合支付*/
                        $userbalance = $payamount - $truepayprice;
                    }

                    if (!empty($userbalance) && $userbalance > 0) {
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$userbalance' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");

                        //查询会员信息
                        $userinfo  = $userLogin->getMemberInfo($uid);
                        $usermoney = $userinfo['money'];
                            
                        $urlParam = array();
                        
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$truepayprice', '$_title', '$date','task','fabuxinxi','$pid','$urlParam','$title','$ordernum','$usermoney')");
                        $dsql->dsqlOper($archives, "update");
                    }

                    //记录用户行为日志
                    memberLog($uid, 'task', '', $rid, 'update', '推荐任务('.$rid.' => '.$title.' =>  '.$_hour.'小时 => '.$truepayprice.'元)', '', $archives);

                    //扣除佣金  
                    $fenXiao = (int)$customfenXiao;
                    $fenxiaoFee = (int)$customfenxiaoFee;
                    $_amount = $payamount;  //平台得到的金额

                    //平台分销开关
                    global $cfg_fenxiaoState;
                    global $cfg_fenxiaoDeposit;

                    //分销金额
                    $_fenxiaoAmount = 0;
                    if($cfg_fenxiaoState && $fenXiao && $payamount > 0.01){
                        $_fenxiaoAmount = $payamount * $fenxiaoFee / 100;

                        $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;

                        //分佣 开关
                        $fenxiaoTotalPrice = $_fenxiaoAmount;
                        global $transaction_id;
                        $transaction_id = $param['transaction_id'];  //第三方平台支付订单号
                        $paramarr['ordernum'] = $ordernum;
                        $paramarr['title'] = $_title;
                        $paramarr['amount'] = $_fenxiaoAmount;
                        $paramarr['type'] = '推荐任务，订单号：'. $ordernum;
                        if($fenXiao == 1 && $uid != -1){
                            (new member())->returnFxMoney("task", $uid, $ordernum, $paramarr, 1);

                            $title1 = '推荐任务，订单号：' . $ordernum;
                            //查询一共分销了多少佣金
                            //如果系统没有开启资金沉淀才需要查询实际分销了多少
                            if(!$cfg_fenxiaoDeposit){
                                $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$title1' AND `module`= 'task'");
                                $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                                $fenxiaoTotalPrice = $fenxiaomonyeres[0]['allfenxiao'];
                            }
                        }

                        $_amount -= sprintf("%.2f", $fenxiaoTotalPrice);  //平台得到的减去分销出去的
                    }

                    //记录平台收入
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$uid', '1', '$_amount', '$_title', '$date','0','0','task',$_amount,'1','fabuxinxi')");
                    $dsql->dsqlOper($archives, "update");

                    //通知平台管理员
                    $userinfo  = $userLogin->getMemberInfo($uid);
                    $allincom = getAllincome();  //获取平台今日收益
                    $infoname = getModuleTitle(array('name' => 'task'));  //获取模块名

                    //微信通知
                    $params = array(
                        'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                        'cityid' => 0,
                        'notify' => '管理员消息通知',
                        'fields' =>array(
                            'contentrn'  => $infoname."模块推荐任务\r\n用户：".$userinfo['nickname']."\r\n信息：".$title."\r\n\r\n平台获得佣金:".$_amount,
                            'date' => date("Y-m-d H:i:s", time()),
                            'status' => "今日总收入：$allincom"
                        )
                    );

                    //后台微信通知
                    updateAdminNotice("task", "detail", $params);

                }

            //任务加量
            }elseif($_type == 'addplus0'){

                $_value = $body['value'];    //要加的数量

                //查询任务信息
                $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = '$_id'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){

                    $rid    = $ret[0]['id'];
                    $uid    = $ret[0]['uid'];
                    $title  = $ret[0]['title'];
                    $quota  = $ret[0]['quota'];
                    $_title = "任务加量：".$title;

                    //已经结束的任务，申请加量后需要重置之前的名额
                    if($ret[0]['finish'] == 1){
                        $quota = 0;
                    }

                    $quota += $_value;  //新的名额

                    //更新之前的任务状态为已完成
                    $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `finish` = 1 WHERE `tid` = $rid");
                    $dsql->dsqlOper($sql, "update");
                    
                    //更新任务名额
                    $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `quota` = '$quota', `finish` = 0 WHERE `id` = " . $rid);
                    $dsql->dsqlOper($sql, "update");

                    //查询支付记录
                    $sql = $dsql->SetQuery("SELECT `id`,`amount`,`paytype` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $pid = '';
                    $truepayprice = 0;
                    if($ret){
                        $pid 		  = $ret[0]['id'];
                        $truepayprice = $ret[0]['amount'];
                        $paytype      = $ret[0]['paytype'];
                    }

                    $userbalance = 0;
                    if($paytype == 'money'){
                        $userbalance = $truepayprice;
                    }else{
                        /*混合支付*/
                        $userbalance = $payamount - $truepayprice;
                    }

                    if (!empty($userbalance) && $userbalance > 0) {
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$userbalance' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");

                        //查询会员信息
                        $userinfo  = $userLogin->getMemberInfo($uid);
                        $usermoney = $userinfo['money'];
                            
                        $urlParam = array();
                        
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$truepayprice', '$_title', '$date','task','fabuxinxi','$pid','$urlParam','$title','$ordernum','$usermoney')");
                        $dsql->dsqlOper($archives, "update");
                    }

                    //记录用户行为日志
                    memberLog($uid, 'task', '', $rid, 'update', '任务加量('.$rid.' => '.$title.' =>  '.$_value.'个 => '.$truepayprice.'元)', '', $archives);

                    // //扣除佣金  
                    // $fenXiao = (int)$customfenXiao;
                    // $fenxiaoFee = (int)$customfenxiaoFee;
                    // $_amount = $payamount;  //平台得到的金额

                    // //平台分销开关
                    // global $cfg_fenxiaoState;
                    // global $cfg_fenxiaoDeposit;

                    // //分销金额
                    // $_fenxiaoAmount = 0;
                    // if($cfg_fenxiaoState && $fenXiao && $payamount > 0.01){
                    //     $_fenxiaoAmount = $payamount * $fenxiaoFee / 100;

                    //     $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;

                    //     //分佣 开关
                    //     $fenxiaoTotalPrice = $_fenxiaoAmount;
                    //     global $transaction_id;
                    //     $transaction_id = $param['transaction_id'];  //第三方平台支付订单号
                    //     $paramarr['ordernum'] = $ordernum;
                    //     $paramarr['title'] = $_title;
                    //     $paramarr['amount'] = $_fenxiaoAmount;
                    //     $paramarr['type'] = '任务加量，订单号：'. $ordernum;
                    //     if($fenXiao == 1 && $uid != -1){
                    //         (new member())->returnFxMoney("task", $uid, $ordernum, $paramarr, 1);

                    //         $title1 = '任务加量，订单号：' . $ordernum;
                    //         //查询一共分销了多少佣金
                    //         //如果系统没有开启资金沉淀才需要查询实际分销了多少
                    //         if(!$cfg_fenxiaoDeposit){
                    //             $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$title1' AND `module`= 'task'");
                    //             $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                    //             $fenxiaoTotalPrice = $fenxiaomonyeres[0]['allfenxiao'];
                    //         }
                    //     }

                    //     $_amount -= sprintf("%.2f", $fenxiaoTotalPrice);  //平台得到的减去分销出去的
                    // }

                    // //记录平台收入
                    // $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$uid', '1', '$_amount', '$_title', '$date','0','0','task',$_amount,'1','fabuxinxi')");
                    // $dsql->dsqlOper($archives, "update");

                    // //通知平台管理员
                    // $userinfo  = $userLogin->getMemberInfo($uid);
                    // $allincom = getAllincome();  //获取平台今日收益
                    // $infoname = getModuleTitle(array('name' => 'task'));  //获取模块名

                    // //微信通知
                    // $params = array(
                    //     'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                    //     'cityid' => 0,
                    //     'notify' => '管理员消息通知',
                    //     'fields' =>array(
                    //         'contentrn'  => $infoname."模块任务加量\r\n用户：".$userinfo['nickname']."\r\n信息：".$title."\r\n\r\n平台获得佣金:".$_amount,
                    //         'date' => date("Y-m-d H:i:s", time()),
                    //         'status' => "今日总收入：$allincom"
                    //     )
                    // );

                    // //后台微信通知
                    // updateAdminNotice("task", "detail", $params);

                }

            //任务加价
            }elseif($_type == 'addplus1'){

                $_value = $body['value'];    //要加的单价

                //查询任务信息
                $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = '$_id'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){

                    $rid    = $ret[0]['id'];
                    $uid    = $ret[0]['uid'];
                    $title  = $ret[0]['title'];
                    $mprice = $ret[0]['mprice'];  //原单价，未扣除平台佣金
                    $fabu_fee = $ret[0]['fabu_fee'];  //平台抽取佣金比例
                    $_title = "任务加量：".$title;

                    $mprice = sprintf("%.2f", $mprice + $_value);  //新的单价

                    //扣除平台佣金价格
                    $price = floatval(sprintf("%.2f", $mprice * (1 - $fabu_fee/100)));

                    //更新任务单价
                    $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `price` = '$price', `mprice` = '$mprice' WHERE `id` = " . $rid);
                    $dsql->dsqlOper($sql, "update");

                    //查询支付记录
                    $sql = $dsql->SetQuery("SELECT `id`,`amount`,`paytype` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $pid = '';
                    $truepayprice = 0;
                    if($ret){
                        $pid 		  = $ret[0]['id'];
                        $truepayprice = $ret[0]['amount'];
                        $paytype      = $ret[0]['paytype'];
                    }

                    $userbalance = 0;
                    if($paytype == 'money'){
                        $userbalance = $truepayprice;
                    }else{
                        /*混合支付*/
                        $userbalance = $payamount - $truepayprice;
                    }

                    if (!empty($userbalance) && $userbalance > 0) {
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$userbalance' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");

                        //查询会员信息
                        $userinfo  = $userLogin->getMemberInfo($uid);
                        $usermoney = $userinfo['money'];
                            
                        $urlParam = array();
                        
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$truepayprice', '$_title', '$date','task','fabuxinxi','$pid','$urlParam','$title','$ordernum','$usermoney')");
                        $dsql->dsqlOper($archives, "update");
                    }

                    //记录用户行为日志
                    memberLog($uid, 'task', '', $rid, 'update', '任务加价('.$rid.' => '.$title.' =>  '.$_value.'元 => '.$truepayprice.'元)', '', $archives);

                    // //扣除佣金  
                    // $fenXiao = (int)$customfenXiao;
                    // $fenxiaoFee = (int)$customfenxiaoFee;
                    // $_amount = $payamount;  //平台得到的金额

                    // //平台分销开关
                    // global $cfg_fenxiaoState;
                    // global $cfg_fenxiaoDeposit;

                    // //分销金额
                    // $_fenxiaoAmount = 0;
                    // if($cfg_fenxiaoState && $fenXiao && $payamount > 0.01){
                    //     $_fenxiaoAmount = $payamount * $fenxiaoFee / 100;

                    //     $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;

                    //     //分佣 开关
                    //     $fenxiaoTotalPrice = $_fenxiaoAmount;
                    //     global $transaction_id;
                    //     $transaction_id = $param['transaction_id'];  //第三方平台支付订单号
                    //     $paramarr['ordernum'] = $ordernum;
                    //     $paramarr['title'] = $_title;
                    //     $paramarr['amount'] = $_fenxiaoAmount;
                    //     $paramarr['type'] = '任务加价，订单号：'. $ordernum;
                    //     if($fenXiao == 1 && $uid != -1){
                    //         (new member())->returnFxMoney("task", $uid, $ordernum, $paramarr, 1);

                    //         $title1 = '任务加价，订单号：' . $ordernum;
                    //         //查询一共分销了多少佣金
                    //         //如果系统没有开启资金沉淀才需要查询实际分销了多少
                    //         if(!$cfg_fenxiaoDeposit){
                    //             $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$title1' AND `module`= 'task'");
                    //             $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                    //             $fenxiaoTotalPrice = $fenxiaomonyeres[0]['allfenxiao'];
                    //         }
                    //     }

                    //     $_amount -= sprintf("%.2f", $fenxiaoTotalPrice);  //平台得到的减去分销出去的
                    // }

                    // //记录平台收入
                    // $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$uid', '1', '$_amount', '$_title', '$date','0','0','task',$_amount,'1','fabuxinxi')");
                    // $dsql->dsqlOper($archives, "update");

                    // //通知平台管理员
                    // $userinfo  = $userLogin->getMemberInfo($uid);
                    // $allincom = getAllincome();  //获取平台今日收益
                    // $infoname = getModuleTitle(array('name' => 'task'));  //获取模块名

                    // //微信通知
                    // $params = array(
                    //     'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                    //     'cityid' => 0,
                    //     'notify' => '管理员消息通知',
                    //     'fields' =>array(
                    //         'contentrn'  => $infoname."模块任务加价\r\n用户：".$userinfo['nickname']."\r\n信息：".$title."\r\n\r\n平台获得佣金:".$_amount,
                    //         'date' => date("Y-m-d H:i:s", time()),
                    //         'status' => "今日总收入：$allincom"
                    //     )
                    // );

                    // //后台微信通知
                    // updateAdminNotice("task", "detail", $params);

                }

            //开通会员
            }elseif($_type == 'openVip'){

                //根据等级ID获取等级配置信息
                $sql = $dsql->SetQuery("SELECT `typename`, `price`, `duration_month`, `duration_note`, `refresh_coupon`, `bid_coupon` FROM `#@__task_member_level` WHERE `id` = $_id");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $_typename = $ret[0]['typename'];  //等级名称
                    $_price = (float)$ret[0]['price'];  //价格
                    $_duration_month = (int)$ret[0]['duration_month'];  //开通时长，单位：月
                    $_duration_note = $ret[0]['duration_note'];  //时长描述
                    $_refresh_coupon = (int)$ret[0]['refresh_coupon'];  //赠送刷新次数
                    $_bid_coupon = (int)$ret[0]['bid_coupon'];  //赠送推荐时长，单位：小时
                }else{
                    return array("state" => 200, "info" => '要开通的等级不存在');
                }

                //获取会员当前状态
                $opentype = '开通';
                $level = $refresh_coupon = $bid_coupon = 0;
                $time = GetMkTime(time());
                $end_time = strtotime("+".$_duration_month." months", $time);
                $sql = $dsql->SetQuery("SELECT * FROM `#@__task_member` WHERE `end_time` > $time AND `uid` = " . $pay_uid);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $_level = (int)$ret[0]['level'];  //当前等级
                    $_end_time = (int)$ret[0]['end_time'];  //当前过期时间
                    $refresh_coupon = (int)$ret[0]['refresh_coupon'];  //当前剩余刷新次数
                    $bid_coupon = (int)$ret[0]['bid_coupon'];  //当前剩余推荐时长

                    //续费
                    if($_level == $_id){

                        $opentype = '续费';
                        $end_time = strtotime("+".$_duration_month." months", $_end_time);  //新的过期时间：当前结束时间+新开通的时长

                    }
                    //开通其他等级
                    else{

                        $end_time = strtotime("+".$_duration_month." months", $time);  //新的过期时间

                    }
                }
                
                $_title = $opentype . $_typename . '('.$_duration_note.')';
                $price = $_price;  //新的单价
                $refresh_coupon += $_refresh_coupon;  //新的剩余赠送刷新次数
                $bid_coupon += $_bid_coupon;  //新的剩余赠送推荐时长
                
                //更新会员表
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__task_member` WHERE `uid` = $pay_uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $sql = $dsql->SetQuery("UPDATE `#@__task_member` SET `level` = '$_id', `open_time` = '$time', `end_time` = '$end_time', `refresh_coupon` = '$refresh_coupon', `bid_coupon` = '$bid_coupon' WHERE `uid` = " . $pay_uid);
                }else{
                    $sql = $dsql->SetQuery("INSERT INTO `#@__task_member` (`uid`, `level`, `open_time`, `end_time`, `refresh_coupon`, `bid_coupon`) VALUES ('$pay_uid', '$_id', '$time', '$end_time', '$refresh_coupon', '$bid_coupon')");
                }
                $dsql->dsqlOper($sql, "update");

                //查询支付记录
                $sql = $dsql->SetQuery("SELECT `id`,`amount`,`paytype` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                $pid = '';
                $truepayprice = 0;
                if($ret){
                    $pid 		  = $ret[0]['id'];
                    $truepayprice = $ret[0]['amount'];
                    $paytype      = $ret[0]['paytype'];
                }

                $userbalance = 0;
                if($paytype == 'money'){
                    $userbalance = $truepayprice;
                }else{
                    /*混合支付*/
                    $userbalance = $payamount - $truepayprice;
                }

                if (!empty($userbalance) && $userbalance > 0) {
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$userbalance' WHERE `id` = '$pay_uid'");
                    $dsql->dsqlOper($archives, "update");

                    //查询会员信息
                    $userinfo  = $userLogin->getMemberInfo($pay_uid);
                    $usermoney = $userinfo['money'];
                        
                    $urlParam = array();
                    
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$pay_uid', '0', '$truepayprice', '$_title', '$date','task','huiyuanshengji','$pid','$urlParam','$title','$ordernum','$usermoney')");
                    $dsql->dsqlOper($archives, "update");
                }

                //记录用户行为日志
                memberLog($pay_uid, 'task', '', $pay_uid, 'update', $_title.'('.$truepayprice.'元)', '', $archives);

                //扣除佣金  
                $fenXiao = (int)$customfenXiao;
                $fenxiaoFee = (int)$customfenxiaoFee;
                $_amount = $payamount;  //平台得到的金额

                //平台分销开关
                global $cfg_fenxiaoState;
                global $cfg_fenxiaoDeposit;

                //分销金额
                $_fenxiaoAmount = 0;
                if($cfg_fenxiaoState && $fenXiao && $payamount > 0.01){
                    $_fenxiaoAmount = $payamount * $fenxiaoFee / 100;

                    $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;

                    //分佣 开关
                    $fenxiaoTotalPrice = $_fenxiaoAmount;
                    global $transaction_id;
                    $transaction_id = $param['transaction_id'];  //第三方平台支付订单号
                    $paramarr['ordernum'] = $ordernum;
                    $paramarr['title'] = $_title;
                    $paramarr['amount'] = $_fenxiaoAmount;
                    $paramarr['type'] = '开通会员，订单号：'. $ordernum;
                    if($fenXiao == 1 && $pay_uid != -1){
                        (new member())->returnFxMoney("task", $pay_uid, $ordernum, $paramarr, 1);

                        $title1 = '开通会员，订单号：' . $ordernum;
                        //查询一共分销了多少佣金
                        //如果系统没有开启资金沉淀才需要查询实际分销了多少
                        if(!$cfg_fenxiaoDeposit){
                            $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$title1' AND `module`= 'task'");
                            $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                            $fenxiaoTotalPrice = $fenxiaomonyeres[0]['allfenxiao'];
                        }
                    }

                    $_amount -= sprintf("%.2f", $fenxiaoTotalPrice);  //平台得到的减去分销出去的
                }

                //记录平台收入
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$pay_uid', '1', '$_amount', '$_title', '$date','0','0','task',$_amount,'1','huiyuanshengji')");
                $dsql->dsqlOper($archives, "update");

                //通知平台管理员
                $userinfo  = $userLogin->getMemberInfo($pay_uid);
                $allincom = getAllincome();  //获取平台今日收益
                $infoname = getModuleTitle(array('name' => 'task'));  //获取模块名

                //微信通知
                $params = array(
                    'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => 0,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $infoname."模块开通会员\r\n用户：".$userinfo['nickname']."\r\n信息：".$_title."\r\n\r\n平台获得佣金:".$_amount,
                        'date' => date("Y-m-d H:i:s", time()),
                        'status' => "今日总收入：$allincom"
                    )
                );

                //后台微信通知
                updateAdminNotice("task", "detail", $params);


            //购买刷新道具
            }elseif($_type == 'refreshPackage'){

                //根据道具ID获取道具信息
                $sql = $dsql->SetQuery("SELECT * FROM `#@__task_refresh_package` WHERE `id` = $_id");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $_count = $ret[0]['typename'];  //道具次数
                }else{
                    return array("state" => 200, "info" => '要开通的等级不存在');
                }
                
                $_title = $title = '购买刷新道具('.$_count.'次)';
                
                //更新会员表
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__task_member` WHERE `uid` = $pay_uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $sql = $dsql->SetQuery("UPDATE `#@__task_member` SET `refresh_coupon` = `refresh_coupon` + '$_count' WHERE `uid` = " . $pay_uid);
                }else{
                    $sql = $dsql->SetQuery("INSERT INTO `#@__task_member` (`uid`, `level`, `open_time`, `end_time`, `refresh_coupon`, `bid_coupon`) VALUES ('$pay_uid', '0', '0', '0', '$_count', '0')");
                }
                $dsql->dsqlOper($sql, "update");

                //查询支付记录
                $sql = $dsql->SetQuery("SELECT `id`,`amount`,`paytype` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                $pid = '';
                $truepayprice = 0;
                if($ret){
                    $pid 		  = $ret[0]['id'];
                    $truepayprice = $ret[0]['amount'];
                    $paytype      = $ret[0]['paytype'];
                }

                $userbalance = 0;
                if($paytype == 'money'){
                    $userbalance = $truepayprice;
                }else{
                    /*混合支付*/
                    $userbalance = $payamount - $truepayprice;
                }

                if (!empty($userbalance) && $userbalance > 0) {
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$userbalance' WHERE `id` = '$pay_uid'");
                    $dsql->dsqlOper($archives, "update");

                    //查询会员信息
                    $userinfo  = $userLogin->getMemberInfo($pay_uid);
                    $usermoney = $userinfo['money'];
                        
                    $urlParam = array();
                    
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$pay_uid', '0', '$truepayprice', '$_title', '$date','task','xiaofei','$pid','$urlParam','$title','$ordernum','$usermoney')");
                    $dsql->dsqlOper($archives, "update");
                }

                //记录用户行为日志
                memberLog($pay_uid, 'task', '', $pay_uid, 'update', $_title.'('.$truepayprice.'元)', '', $archives);

                //扣除佣金  
                $fenXiao = (int)$customfenXiao;
                $fenxiaoFee = (int)$customfenxiaoFee;
                $_amount = $payamount;  //平台得到的金额

                //平台分销开关
                global $cfg_fenxiaoState;
                global $cfg_fenxiaoDeposit;

                //分销金额
                $_fenxiaoAmount = 0;
                if($cfg_fenxiaoState && $fenXiao && $payamount > 0.01){
                    $_fenxiaoAmount = $payamount * $fenxiaoFee / 100;

                    $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;

                    //分佣 开关
                    $fenxiaoTotalPrice = $_fenxiaoAmount;
                    global $transaction_id;
                    $transaction_id = $param['transaction_id'];  //第三方平台支付订单号
                    $paramarr['ordernum'] = $ordernum;
                    $paramarr['title'] = $_title;
                    $paramarr['amount'] = $_fenxiaoAmount;
                    $paramarr['type'] = '购买刷新道具，订单号：'. $ordernum;
                    if($fenXiao == 1 && $pay_uid != -1){
                        (new member())->returnFxMoney("task", $pay_uid, $ordernum, $paramarr, 1);

                        $title1 = '购买刷新道具，订单号：' . $ordernum;
                        //查询一共分销了多少佣金
                        //如果系统没有开启资金沉淀才需要查询实际分销了多少
                        if(!$cfg_fenxiaoDeposit){
                            $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$title1' AND `module`= 'task'");
                            $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                            $fenxiaoTotalPrice = $fenxiaomonyeres[0]['allfenxiao'];
                        }
                    }

                    $_amount -= sprintf("%.2f", $fenxiaoTotalPrice);  //平台得到的减去分销出去的
                }

                //记录平台收入
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$pay_uid', '1', '$_amount', '$_title', '$date','0','0','task',$_amount,'1','xiaofei')");
                $dsql->dsqlOper($archives, "update");

                //通知平台管理员
                $userinfo  = $userLogin->getMemberInfo($pay_uid);
                $allincom = getAllincome();  //获取平台今日收益
                $infoname = getModuleTitle(array('name' => 'task'));  //获取模块名

                //微信通知
                $params = array(
                    'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => 0,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $infoname."模块\r\n用户：".$userinfo['nickname']."\r\n信息：".$_title."\r\n\r\n平台获得佣金:".$_amount,
                        'date' => date("Y-m-d H:i:s", time()),
                        'status' => "今日总收入：$allincom"
                    )
                );

                //后台微信通知
                updateAdminNotice("task", "detail", $params);

            }

		}
	}


	/**
    * 领取任务
    * @return array
    */
	public function receive(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //要领取的任务ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证是否有当前模块使用权限
        if(!$this->checkAuth('receive')){
            return array("state" => 200, "info" => '您已被禁止领取任务！');
        }

        //查询任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `state` = 1 AND `haspay` = 1 AND `finish` = 0 AND `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            $_uid = $_ret['uid'];  //发布人ID
            $_title = $_ret['title'];  //任务标题
            $_number = $_ret['number'];  //领取次数（0每人1次，1每天1次，每人3次）
            $_quota = $_ret['quota'];  //名额
            $_price = $_ret['price'];  //任务单价，扣除过平台佣金
            $_mprice = $_ret['mprice'];  //任务单价原价
            $_fabu_fee = $_ret['fabu_fee'];  //平台抽取佣金比例
            $_tj_time = $_ret['tj_time'];  //提交限时，单位：分钟
            $_sh_time = $_ret['sh_time'];  //审核限时，单位：分钟

            //发布人不能领取自己的任务
            if($uid == $_uid){
                return array("state" => 200, "info" => '不能领取自己发布的任务');
            }

            //查询商家是否屏蔽不让用户接他的任务
            $sql = $dsql->SetQuery("SELECT `uid`, `type`, `ctype`, `content` FROM `#@__task_member_shield` WHERE `uid` = '$_uid' AND `type` = 0 AND `ctype` = 1 AND `content` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                return array("state" => 200, "info" => '该商家已禁止您接他的任务！');
            }
            
            //查询占用名额，确定库存
            $sql = $dsql->SetQuery("SELECT COUNT(`id`) used FROM `#@__task_order` WHERE `tid` = '$id' AND `state` != 4");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                $used = (int)$ret[0]['used'];
                if($used >= $_quota){
                    return array("state" => 200, "info" => '该任务已被领完');
                }

            }else{
                return array("state" => 200, "info" => '占用名额数据查询失败');
            }

            //查询任务是否被领取过

            //查询是否有领取过该任务，并且是在进行中
            $sql = $dsql->SetQuery("SELECT count(`id`) lqcount FROM `#@__task_order` WHERE `tid` = '$id' AND `uid` = '$uid' AND `state` != 2 AND `state` != 4");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $lqcount = $ret[0]['lqcount'];
                if($lqcount > 0){
                    return array("state" => 200, "info" => '有在进行中的任务，不可重复领取');
                }
            }else{
                return array("state" => 200, "info" => '任务完成情况数据查询失败');
            }

            //先查询领取的总次数
            $sql = $dsql->SetQuery("SELECT count(`id`) lqcount FROM `#@__task_order` WHERE `tid` = '$id' AND `uid` = '$uid' AND `state` != 4");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $lqcount = $ret[0]['lqcount'];

                //每人1次
                if($_number == 0 && $lqcount > 0){
                    return array("state" => 200, "info" => '您已完成过该任务，每人只可完成一次，看看其他任务吧');
                }

                //每天1次
                if($_number == 1){

                    //查询今天有没有领取过
                    $tdate = GetMkTime(date('Y-m-d'));
                    $edate = $tdate + 86400;
                    $sql = $dsql->SetQuery("SELECT count(`id`) lqcount FROM `#@__task_order` WHERE `tid` = '$id' AND `uid` = '$uid' AND `state` != 4 AND `lq_time` >= $tdate AND `lq_time` <= $edate");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $today_lqcount = $ret[0]['lqcount'];
                        if($today_lqcount > 0){
                            return array("state" => 200, "info" => '您今天已经完成该任务啦，明天再来吧');
                        }
                    }else{
                        return array("state" => 200, "info" => '当天领取次数数据查询失败');
                    }

                }

                //每人3次
                if($_number == 2 && $lqcount >= 3){
                    return array("state" => 200, "info" => '您达到该任务完成次数上限，看看其他任务吧');
                }

            }else{
                return array("state" => 200, "info" => '领取次数数据查询失败');
            }

        }else{
            return array("state" => 200, "info" => '要领取的任务不存在');
        }
        
        //更新任务订单表
        $ordernum = create_ordernum();
        $lq_time = GetMkTime(time());
        $tj_expire = $lq_time + $_tj_time * 60;

        $userinfo = $userLogin->getMemberInfo();
        $tj_log = array(array(
            'type' => 'text',
            'uid' => $uid,
            'nickname' => $userinfo['nickname'],
            'photo' => $userinfo['photo'],
            'time' => GetMkTime(time()),
            'title' => '领取成功'
        ));
        $tj_log = addslashes(json_encode($tj_log));

        //结算佣金需要扣除平台抽取的佣金
        // $price = floatval(sprintf("%.2f", $_price * (1-$_fabu_fee)));

        //结算佣金还需要增加会员做任务佣金增加比例
        $task_fee = 0;
        $task_fee_amount = 0;
        $time = GetMkTime(time());
        $sql = $dsql->SetQuery("SELECT l.`task_fee` FROM `#@__task_member` tm LEFT JOIN `#@__task_member_level` l ON l.`id` = tm.`level` LEFT JOIN `#@__member` m ON m.`id` = tm.`uid` WHERE tm.`end_time` > $time AND tm.`uid` = " . $uid . " AND m.`id` IS NOT NULL");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $task_fee = (int)$ret[0]['task_fee'];
        }
        if($task_fee > 0){
            $task_fee_amount = floatval(sprintf("%.2f", $_price * $task_fee / 100));
            $_price += $task_fee_amount;
        }

        //风险处理，结算金额如果大于原价
        //暂时不做限制，以后台配置为准
        // if($_price > $_mprice){
        //     return array("state" => 200, "info" => '任务佣金错误，请联系平台处理！');
        // }

        $sql = $dsql->SetQuery("INSERT INTO `#@__task_order` (`uid`, `tid`, `sid`, `ordernum`, `price`, `mprice`, `fabu_fee`, `task_fee`, `task_fee_amount`, `lq_time`, `tj_expire`, `state`, `tj_log`) VALUES ('$uid', '$id', '$_uid', '$ordernum', '$_price', '$_mprice', '$_fabu_fee', '$task_fee', '$task_fee_amount', '$lq_time', '$tj_expire', '0', '$tj_log')");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){

            //记录用户行为日志
            memberLog($uid, 'task', '', $id, 'insert', '领取任务('.$id.'=>'.$_title.'=>'.$ordernum.')', '', $sql);

            return "领取成功";

        }else{
            return array("state" => 101, "info" => '系统错误，操作失败！');
        }

    }


	/**
    * 取消订单
    * @return array
    */
	public function cancelOrder($master = 0){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //订单ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1 && !$master){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //获取订单信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_order` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_uid = $ret[0]['uid'];
            $_ordernum = $ret[0]['ordernum'];
            $_state = (int)$ret[0]['state'];
            $_tj_log = json_decode($ret[0]['tj_log'], true);

            if(!$master){
                if($uid != $_uid){
                    return array("state" => 200, "info" => '非您本人的订单，不可操作');
                }
            }else{
                $uid = $_uid;
            }

            if($_state == 1 || $_state == 2 || $_state == 4){
                return array("state" => 200, "info" => '订单当前状态不可以取消');
            }

        }else{
            return array("state" => 200, "info" => '订单不存在或已经删除');
        }

        $title = '取消订单';
        if($master == 1){
            $title = '超过辩诉时间，系统自动取消订单。';
        }elseif($master == 2){
            $title = '平台判定商家/发布人胜诉';
        }

        //提交日志
        $userinfo = $userLogin->getMemberInfo($uid);
        $tj_log = array(
            'type' => 'text',
            'uid' => $uid,
            'nickname' => $userinfo['nickname'],
            'photo' => $userinfo['photo'],
            'time' => GetMkTime(time()),
            'title' => $title,
            'value' => ''
        );

        array_push($_tj_log, $tj_log);
        $_tj_log = addslashes(json_encode($_tj_log));

        //更新订单状态
        $time = GetMkTime(time());

        //如果是系统操作或者计划任务操作，需要更新审核时间和审核说明
        if($master){
            $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `state` = 4, `qx_time` = '$time', `tj_log` = '$_tj_log', `sh_time` = '$time', `sh_explain` = '$title' WHERE `id` = " . $id);
        }else{
            $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `state` = 4, `qx_time` = '$time', `tj_log` = '$_tj_log', `sh_explain` = '主动取消订单' WHERE `id` = " . $id);
        }
        $dsql->dsqlOper($sql, "update");

        //记录用户行为日志
        memberLog($uid, 'task', '', $id, 'update', $title.'('.$id.'=>'.$_ordernum.')', '', $sql);

        //更新举报维权订单，只要是用户主动取消，说明是发布人胜诉
        $sql = $dsql->SetQuery("UPDATE `#@__task_report` SET `state` = 3, `winner` = 2 WHERE `oid` = $id");
        $dsql->dsqlOper($sql, "update");

        return array("state" => 200, "info" => '操作成功');

    }


	/**
    * 删除订单
    * @return array
    */
	public function delOrder(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //订单ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //获取订单信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_order` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_uid = $ret[0]['uid'];
            $_ordernum = $ret[0]['ordernum'];
            $_state = (int)$ret[0]['state'];

            if($uid != $_uid){
                return array("state" => 200, "info" => '非您本人的订单，不可操作');
            }

            if($_state != 4){
                return array("state" => 200, "info" => '订单当前状态不可以删除');
            }

        }else{
            return array("state" => 200, "info" => '订单不存在或已经删除');
        }

        //删除订单
        $sql = $dsql->SetQuery("DELETE FROM `#@__task_order` WHERE `id` = " . $id);
        $dsql->dsqlOper($sql, "update");

        //记录用户行为日志
        memberLog($uid, 'task', '', $id, 'delete', '删除订单('.$id.'=>'.$_ordernum.')', '', $sql);

        return array("state" => 200, "info" => '操作成功');

    }


	/**
    * 订单列表
    * @return array
    */
	public function orderList(){
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $state    = $this->param['state'];  //订单状态  0待提交  1审核中  2已通过  3未通过(包含已失效)
                $from     = (int)$this->param['from'];  //订单来源  0用户身份  1商家身份(发布者)
                $tid      = (int)$this->param['tid'];  //任务ID（只有from为1时有效）
                $keyword  = trim($this->param['keyword']);  //搜索关键字
                $fast     = (int)$this->param['fast'];  //极速审核订单
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        if($state != ''){
            $state = (int)$state;
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //订单来源
        //用户身份
        if (!$from) {
            $where .= " AND o.`uid` = '$uid'";
        }else{
            $where .= " AND o.`sid` = '$uid'";

            //指定任务
            if($tid){
                $where .= " AND o.`tid` = '$tid'";
            }
        }

        //关键字搜索
        if (!empty($keyword)) {
            $where .= " AND (l.`project` LIKE '%$keyword%' OR l.`title` LIKE '%$keyword%' OR o.`ordernum` LIKE '%$keyword%')";
        }

        //极速审核订单
        if($fast){
            $where .= " AND l.`sh_time` <= 60";
        }

        //默认排序
        $_orderby = " ORDER BY o.`id` DESC";

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT o.`id` FROM `#@__task_order` o LEFT JOIN `#@__task_list` l ON l.`id` = o.`tid` LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE m.`id` IS NOT NULL AND l.`id` IS NOT NULL" . $where);

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        //待提交
        $state0 = $dsql->dsqlOper($archives . " AND o.`state` = 0", "totalCount");
        //审核中
        $state1 = $dsql->dsqlOper($archives . " AND o.`state` = 1", "totalCount");
        //已通过
        $state2 = $dsql->dsqlOper($archives . " AND o.`state` = 2", "totalCount");
        //未通过(包含已失效)
        $state3 = $dsql->dsqlOper($archives . " AND (o.`state` = 3 OR o.`state` = 4)", "totalCount");

        if($this->param['state'] != ''){
            if($state == 3){
                $where .= " AND (o.`state` = 3 OR o.`state` = 4)";
                $totalCount = $state3;
            }else{
                $where .= " AND o.`state` = $state";
                if($state == 0){
                    $totalCount = $state0;
                }elseif($state == 1){
                    $totalCount = $state1;
                }elseif($state == 2){
                    $totalCount = $state2;
                }
            }
        }

        $totalPage = ceil($totalCount / $pageSize);
        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount,
            "state0"     => $state0,
            "state1"     => $state1,
            "state2"     => $state2,
            "state3"     => $state3
        );

        $time = GetMkTime(time());
        $sql     = $dsql->SetQuery("SELECT o.`id`, o.`uid`, o.`tid`, o.`ordernum`, o.`price`, o.`lq_time`, o.`tj_expire`, o.`tj_time`, o.`sh_expire`, o.`sh_time`, o.`sh_explain`, o.`sh_explain_img`, o.`xg_expire`, o.`qx_time`, o.`state`, l.`title`, l.`project`, l.`sh_time` sh_time_l, t.`typename`, m.`nickname`, m.`photo` FROM `#@__task_order` o LEFT JOIN `#@__task_list` l ON l.`id` = o.`tid` LEFT JOIN `#@__task_type` t ON t.`id` = l.`typeid` LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE m.`id` IS NOT NULL AND l.`id` IS NOT NULL" . $where . $_orderby);
        $atpage  = $pageSize * ($page - 1);
        $where   = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($sql . $where, "results");
        $list    = array();
        if (count($results) > 0) {
            foreach ($results as $key => $value) {
                $list[$key]["id"]        = (int)$value["id"];
                $list[$key]["tid"]       = (int)$value["tid"];
                $list[$key]["ordernum"]  = $value["ordernum"];
                $list[$key]["price"]     = (float)$value["price"];
                $list[$key]["lq_time"]   = (int)$value["lq_time"];
                $list[$key]["tj_expire"] = (int)$value["tj_expire"];
                $list[$key]["tj_expire_second"] = (int)($value["tj_expire"] - $time);
                $list[$key]["tj_time"]   = (int)$value["tj_time"];
                $list[$key]["sh_expire"] = (int)$value["sh_expire"];
                $list[$key]["sh_expire_second"] = (int)($value["sh_expire"] - $time);
                $list[$key]["sh_time"]   = (int)$value["sh_time"];
                $list[$key]["sh_explain"] = $value["sh_explain"];
                $list[$key]["sh_explain_img"] = $value["sh_explain_img"];
                $list[$key]["xg_expire"] = (int)$value["xg_expire"];
                $list[$key]["xg_expire_second"] = (int)($value["xg_expire"] - $time);
                $list[$key]["qx_time"]   = (int)$value["qx_time"];
                $list[$key]["state"]     = (int)$value["state"];

                //领取后主动取消
                if($value['state'] == 4 && $value["qx_time"] > 0 && $value["sh_explain"] == ''){
                    $list[$key]["sh_explain"] = '主动取消';
                }

                //查询订单是否处于维权中，审核未通过的订单才需要查询
                $report = 0;
                if($value['state'] == 3 || $value['state'] == 4){
                    $sql = $dsql->SetQuery("SELECT `state` FROM `#@__task_report` WHERE `oid` = ".$value['id']." ORDER BY `id` DESC LIMIT 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        //0待对方辩诉 1等待平台审核 3已结束(用户放弃)
                        if($ret[0]['state'] == 0 || $ret[0]['state'] == 1 || $ret[0]['state'] == 3){
                            $report = 1;
                        }
                    }
                }
                $list[$key]["report"]    = $report;

                $list[$key]["title"]     = $value["title"];
                $list[$key]["project"]   = $value["project"];
                $list[$key]["typename"]  = $value["typename"];
                $list[$key]["nickname"]  = $value["nickname"];
                $list[$key]["photo"]     = getFilePath($value["photo"]);

                //商家身份查看订单列表，需要输出领取任务的用户信息
                if($from == 1){
                    $uinfo = $userLogin->getMemberInfo($value['uid']);
                    if(is_array($uinfo)){
                        $list[$key]["lq_user"] = array(
                            'nickname' => $uinfo['nickname'],
                            'photo' => getFilePath($uinfo['photo'])
                        );
                    }else{
                        $list[$key]["lq_user"] = array(
                            'nickname' => '未知',
                            'photo' => getFilePath('/static/images/noPhoto_100.jpg')
                        );
                    }
                }
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);

    }


	/**
    * 提交订单
    * @return array
    */
	public function submitOrder(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //订单ID
        $data = json_decode($param['data'], true);  //提交内容

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证是否有当前模块使用权限
        if(!$this->checkAuth('receive')){
            return array("state" => 200, "info" => '您已被禁止提交任务！');
        }

        $time = GetMkTime(time());

        //获取订单信息
        $sql = $dsql->SetQuery("SELECT o.*, l.`steps`, l.`title`, l.`sh_time` sh_time_l, l.`js_began_time`, l.`js_end_time`, l.`js_sh_time_bak`, l.`state` lstate, l.`finish` lfinish FROM `#@__task_order` o LEFT JOIN `#@__task_list` l ON l.`id` = o.`tid` WHERE l.`id` IS NOT NULL AND o.`id` = '$id'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_id = (int)$ret[0]['id'];
            $_ordernum = $ret[0]['ordernum'];
            $_state = (int)$ret[0]['state'];
            $_uid = $ret[0]['uid'];
            $_sid = $ret[0]['sid'];
            $_tid = $ret[0]['tid'];
            $_steps = $ret[0]['steps'];
            $_tj_log = json_decode($ret[0]['tj_log'], true);
            $_lstate = $ret[0]['lstate'];  //任务状态
            $_lfinish = $ret[0]['lfinish'];  //任务完成状态

            $_sh_time = (int)$ret[0]['sh_time_l'];

            //判断极速审核是否开始
            if($_sh_time <= 60 && $ret[0]['js_sh_time_bak'] > 0){
                if($ret[0]['js_began_time'] < $time && $ret[0]['js_end_time'] > $time){

                }else{
                    $_sh_time = $ret[0]['js_sh_time_bak'];
                }
            }

            $_title = $ret[0]['title'];

            if($_uid != $uid){
                return array("state" => 200, "info" => '不是您的订单，请勿提交');
            }

            if($_state == 2 || $_state == 4){
                return array("state" => 200, "info" => '订单当前状态不可以提交');
            }

            if($_lstate != 1 || $_lfinish){
                return array("state" => 200, "info" => '当前任务状态异常，请联系商家处理。');
            }

        }else{
            return array("state" => 200, "info" => '订单不存在或已经删除');
        }

        $tj_data = array();  //提交的内容

        //提交日志
        $userinfo = $userLogin->getMemberInfo();
        $tj_log = array(
            'type' => 'text',
            'uid' => $uid,
            'nickname' => $userinfo['nickname'],
            'photo' => $userinfo['photo'],
            'time' => GetMkTime(time()),
            'title' => '提交订单',
            'value' => ''
        );

        //提取任务步骤需要提交的内容
        $stepsArr = json_decode($_steps, true);
        if($stepsArr && is_array($stepsArr)){

            //提取需要收集的数据信息
            $needArr = array();
            foreach($stepsArr as $key => $val){
                if($val['type'] == 'save-image' || $val['type'] == 'save-text' || $val['type'] == 'save-video'){
                    $val['step'] = $key+1;
                    array_push($needArr, $val);
                }
            }

            //验证提交的内容并进行组合
            if($needArr){
                foreach($needArr as $key => $val){
                    $_tj = $data[$key];
                    if(!empty($_tj)){
                        $val['value'] = $_tj['value'];
                        array_push($tj_data, $val);

                        if($val['type'] == 'save-image' || $val['type'] == 'save-video'){
                            $tj_log['type'] = 'image';
                            $tj_log['value'] = ($tj_log['value'] ? $tj_log['value'] . '||' : '') . $_tj['value'];
                        }else{
                            $tj_log['title'] = $tj_log['title'] . ' | ' . $_tj['value'];
                        }
                    }else{
                        return array("state" => 200, "info" => '请完成步骤'.$val['step'].'中要求提交的内容');
                    }
                }
            }

        }

        if(!$tj_data){
            return array("state" => 200, "info" => '没有要提交的内容');
        }

        $tj_data = addslashes(json_encode($tj_data));
        array_push($_tj_log, $tj_log);
        $_tj_log = addslashes(json_encode($_tj_log));
        $tj_time = GetMkTime(time());
        $sh_expire = $tj_time + $_sh_time * 60;

        //更新订单
        $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `tj_data` = '$tj_data', `tj_log` = '$_tj_log', `tj_time` = '$tj_time', `sh_expire` = '$sh_expire', `state` = 1 WHERE `id` = " . $_id);
        $dsql->dsqlOper($sql, "update");

        //记录用户行为日志
        memberLog($uid, 'task', '', $_id, 'update', '提交订单('.$_ordernum.')', '', $sql);

        //通知商家
        global $cfg_miniProgramAppid;
        $param = 'wxMiniprogram://'.$cfg_miniProgramAppid.'?//pages/packages/task/orderDetail/orderDetail?merchant=1&tid='.$_tid.'&orderid=' . $id;

        $config = array(
            "first" => "有任务提交了订单",
            "content" => "任务标题：" . $_title . "<br/>订单编号：" . $_ordernum,
            "date" => date("Y-m-d H:i:s", $tj_time),
            "status" => "等待审核",
            "color" => "",
            "remark" => "请在" . date("Y-m-d H:i:s", $sh_expire) . "前完成审核，逾期将自动通过！",
            "fields" => array(
                'keyword1' => '任务信息',
                'keyword2' => '提交时间',
                'keyword3' => '当前状态'
            )
        );

        updateMemberNotice($_sid, "会员-任务提醒", $param, $config);

        return array("state" => 200, "info" => '提交成功');

    }


	/**
    * 修改提交内容
    * @return array
    */
	public function modifyOrder(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //订单ID
        $data = json_decode($param['data'], true);  //提交内容

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证是否有当前模块使用权限
        if(!$this->checkAuth('receive')){
            return array("state" => 200, "info" => '您已被禁止提交任务！');
        }

        $pubdate = GetMkTime(time());  //当前时间

        //获取订单信息
        $sql = $dsql->SetQuery("SELECT o.*, l.`steps`, l.`title`, l.`sh_time` sh_time_l, l.`state` lstate, l.`finish` lfinish FROM `#@__task_order` o LEFT JOIN `#@__task_list` l ON l.`id` = o.`tid` WHERE l.`id` IS NOT NULL AND o.`id` = '$id'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_id = (int)$ret[0]['id'];
            $_ordernum = $ret[0]['ordernum'];
            $_state = (int)$ret[0]['state'];
            $_uid = (int)$ret[0]['uid'];
            $_sid = (int)$ret[0]['sid'];
            $_tid = (int)$ret[0]['tid'];
            $_steps = $ret[0]['steps'];
            $_tj_log = json_decode($ret[0]['tj_log'], true);
            $_sh_time = (int)$ret[0]['sh_time_l'];
            $_title = $ret[0]['title'];
            $_xg_expire = (int)$ret[0]['xg_expire'];
            $_lstate = $ret[0]['lstate'];  //任务状态
            $_lfinish = $ret[0]['lfinish'];  //任务完成状态

            if($_uid != $uid){
                return array("state" => 200, "info" => '不是您的订单，请勿提交');
            }

            if($_state == 2 || $_state == 4){
                return array("state" => 200, "info" => '订单当前状态不可以提交');
            }

            if($_xg_expire < $pubdate && $_xg_expire > 0){
                return array("state" => 200, "info" => '修改时间超时');
            }

            if($_lstate != 1 || $_lfinish){
                return array("state" => 200, "info" => '当前任务状态异常，请联系商家处理。');
            }

        }else{
            return array("state" => 200, "info" => '订单不存在或已经删除');
        }

        //查询订单是否存在举报状态
        $sql = $dsql->SetQuery("SELECT `state` FROM `#@__task_report` WHERE `oid` = $id ORDER BY `id` DESC LIMIT 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            return array("state" => 200, "info" => '订单存在举报维权申请，不可以重新提交！');
        }

        $tj_data = array();  //提交的内容

        //提交日志
        $userinfo = $userLogin->getMemberInfo();
        $tj_log = array(
            'type' => 'text',
            'uid' => $uid,
            'nickname' => $userinfo['nickname'],
            'photo' => $userinfo['photo'],
            'time' => GetMkTime(time()),
            'title' => '重新提交',
            'value' => ''
        );

        //提取任务步骤需要提交的内容
        $stepsArr = json_decode($_steps, true);
        if($stepsArr && is_array($stepsArr)){

            //提取需要收集的数据信息
            $needArr = array();
            foreach($stepsArr as $key => $val){
                if($val['type'] == 'save-image' || $val['type'] == 'save-text' || $val['type'] == 'save-video'){
                    $val['step'] = $key+1;
                    array_push($needArr, $val);
                }
            }

            //验证提交的内容并进行组合
            if($needArr){
                foreach($needArr as $key => $val){
                    $_tj = $data[$key];
                    if(!empty($_tj)){
                        $val['value'] = $_tj['value'];
                        array_push($tj_data, $val);

                        if($val['type'] == 'save-image' || $val['type'] == 'save-video'){
                            $tj_log['type'] = 'image';
                            $tj_log['value'] = ($tj_log['value'] ? $tj_log['value'] . '||' : '') . $_tj['value'];
                        }else{
                            $tj_log['title'] = $tj_log['title'] . ' | ' . $_tj['value'];
                        }
                    }else{
                        return array("state" => 200, "info" => '请完成步骤'.$val['step'].'中要求提交的内容');
                    }
                }
            }

        }

        if(!$tj_data){
            return array("state" => 200, "info" => '没有要提交的内容');
        }

        $tj_data = addslashes(json_encode($tj_data));
        array_push($_tj_log, $tj_log);
        $_tj_log = addslashes(json_encode($_tj_log));
        $tj_time = GetMkTime(time());
        $sh_expire = $tj_time + $_sh_time * 60;

        //更新订单
        $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `tj_data` = '$tj_data', `tj_log` = '$_tj_log', `tj_time` = '$tj_time', `sh_expire` = '$sh_expire', `state` = 1 WHERE `id` = " . $_id);
        $dsql->dsqlOper($sql, "update");

        //记录用户行为日志
        memberLog($uid, 'task', '', $_id, 'update', '重新提交订单('.$_ordernum.')', '', $sql);

        //通知商家
        global $cfg_miniProgramAppid;
        $param = 'wxMiniprogram://'.$cfg_miniProgramAppid.'?//pages/packages/task/orderDetail/orderDetail?merchant=1&tid='.$_tid.'&orderid=' . $id;

        $config = array(
            "first" => "有任务修改了订单",
            "content" => "任务标题：" . $_title . "<br/>订单编号：" . $_ordernum,
            "date" => date("Y-m-d H:i:s", $tj_time),
            "status" => "等待审核",
            "color" => "",
            "remark" => "请在" . date("Y-m-d H:i:s", $sh_expire) . "前完成审核，逾期将自动通过！",
            "fields" => array(
                'keyword1' => '任务信息',
                'keyword2' => '提交时间',
                'keyword3' => '当前状态'
            )
        );

        updateMemberNotice($_sid, "会员-任务提醒", $param, $config);

        return array("state" => 200, "info" => '提交成功');

    }


	/**
    * 订单提交内容
    * @return array
    */
	public function orderData(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //订单ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //获取订单信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_order` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_uid = $ret[0]['uid'];
            $_sid = $ret[0]['sid'];
            $_tj_data = $ret[0]['tj_data'];

            if($uid != $_uid && $uid != $_sid){
                return array("state" => 200, "info" => '非您本人的订单，不可操作');
            }

        }else{
            return array("state" => 200, "info" => '订单不存在或已经删除');
        }

        return $_tj_data ? json_decode($_tj_data, true) : array();

    }


	/**
    * 订单提交日志
    * @return array
    */
	public function orderLog(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //订单ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //获取订单信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_order` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_uid = $ret[0]['uid'];
            $_sid = $ret[0]['sid'];
            $_tj_log = $ret[0]['tj_log'];

            if($uid != $_uid && $uid != $_sid){
                return array("state" => 200, "info" => '非您本人的订单，不可操作');
            }

        }else{
            return array("state" => 200, "info" => '订单不存在或已经删除');
        }

        return $_tj_log ? json_decode($_tj_log, true) : array();

    }


	/**
    * 商家审核拒绝订单
    * @return array
    */
	public function refuseOrder(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //订单ID
        $type = trim($param['type']);  //原因
        $note = trim($param['note']);  //具体原因
        $images = trim($param['images']);  //图片

        if(empty($type)){
            return array("state" => 200, "info" => '请选择不通过原因');
        }

        if(empty($note)){
            return array("state" => 200, "info" => '请填写补充具体原因');
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //获取订单信息
        $sql = $dsql->SetQuery("SELECT o.*, l.`tj_time`, l.`title`, t.`cxtj_xianshi` FROM `#@__task_order` o LEFT JOIN `#@__task_list` l ON l.`id` = o.`tid` LEFT JOIN `#@__task_type` t ON t.`id` = l.`typeid` WHERE o.`id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_sid = $ret[0]['sid'];
            $_uid = $ret[0]['uid'];
            $_tid = $ret[0]['tid'];
            $_ordernum = $ret[0]['ordernum'];
            $_state = (int)$ret[0]['state'];
            $_tj_time = (int)$ret[0]['tj_time'];
            $_tj_log = json_decode($ret[0]['tj_log'], true);
            $_title = $ret[0]['title'];
            $_cxtj_xianshi = $ret[0]['cxtj_xianshi'];

            if($uid != $_sid){
                return array("state" => 200, "info" => '非您本人的订单，不可操作');
            }

            if($_state != 1){
                return array("state" => 200, "info" => '订单当前状态不可以操作');
            }

        }else{
            return array("state" => 200, "info" => '订单不存在或已经删除');
        }

        //更新订单状态
        $time = GetMkTime(time());
        $sh_explain = $type . "；" . $note;

        //拒绝后用户重新提交限时，需要查询任务类型中设置的时间，单位是小时
        $xg_expire = $time + $_cxtj_xianshi * 60 * 60;

        //提交日志
        $userinfo = $userLogin->getMemberInfo();
        $tj_log = array(
            'type' => $images ? 'image' : 'text',
            'uid' => $uid,
            'nickname' => $userinfo['nickname'],
            'photo' => $userinfo['photo'],
            'time' => $time,
            'title' => '审核拒绝' . '；商家回复：' . $sh_explain,
            'value' => $images
        );

        array_push($_tj_log, $tj_log);
        $_tj_log = addslashes(json_encode($_tj_log));

        $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `state` = 3, `sh_time` = '$time', `sh_explain` = '$sh_explain', `sh_explain_img` = '$images', `xg_expire` = '$xg_expire', `tj_log` = '$_tj_log' WHERE `id` = " . $id);
        $dsql->dsqlOper($sql, "update");

        //记录用户行为日志
        memberLog($uid, 'task', '', $id, 'update', '订单审核不通过('.$_ordernum.' => '.$sh_explain.')', '', $sql);

        //通知用户
        global $cfg_miniProgramAppid;
        $param = 'wxMiniprogram://'.$cfg_miniProgramAppid.'?//pages/packages/task/orderDetail/orderDetail?tid='.$_tid.'&orderid=' . $id;

        $config = array(
            "first" => "任务审核结果",
            "content" => "任务标题：" . $_title . "<br/>订单编号：" . $_ordernum . "<br/>商家回复：" . $sh_explain,
            "date" => date("Y-m-d H:i:s", $time),
            "status" => "审核拒绝",
            "color" => "#ff0000",
            "remark" => "请在" . date("Y-m-d H:i:s", $xg_expire) . "前重新修改并提交，逾期将自动取消订单！",
            "fields" => array(
                'keyword1' => '任务信息',
                'keyword2' => '审核时间',
                'keyword3' => '当前状态'
            )
        );

        updateMemberNotice($_uid, "会员-任务提醒", $param, $config);

        return array("state" => 200, "info" => '提交成功');

    }


	/**
    * 商家审核通过订单
    * @return array
    */
	public function passOrder($master = 0){
        global $dsql;
        global $userLogin;

        //引入模块配置
        include HUONIAOINC."/config/task.inc.php";

        $param = $this->param;

        $id = (int)$param['id'];  //订单ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1 && !$master){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //获取订单信息
        $sql = $dsql->SetQuery("SELECT o.*, l.`tj_time`, l.`quota`,l.`fabu_fee`,l.`title` FROM `#@__task_order` o LEFT JOIN `#@__task_list` l ON l.`id` = o.`tid` WHERE o.`id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_tid = $ret[0]['tid'];
            $_sid = $ret[0]['sid'];
            $_uid = $ret[0]['uid'];
            $_price = $ret[0]['price'];  //用户应得佣金，已在领取任务时就扣除过了平台佣金
            $_fabu_fee = (int)$ret[0]['fabu_fee'];
            $_ordernum = $ret[0]['ordernum'];
            $_state = (int)$ret[0]['state'];
            $_tj_time = (int)$ret[0]['tj_time'];
            $_tj_log = json_decode($ret[0]['tj_log'], true);
            $_quota = (int)$ret[0]['quota'];
            $_title = $ret[0]['title'];

            if(!$master){
                if($uid != $_sid){
                    return array("state" => 200, "info" => '非您本人的订单，不可操作');
                }
            }else{
                $uid = $_sid;
            }

            if($_state != 1 && $_state != 3){
                return array("state" => 200, "info" => '订单当前状态不可以操作');
            }

        }else{
            return array("state" => 200, "info" => '订单不存在或已经删除');
        }

        //更新订单状态
        $time = GetMkTime(time());
        $sh_explain = $_state == 3 ? '重新审核通过' : '审核通过';

        if($master == 1){
            $sh_explain = '超过辩诉时间，系统自动审核通过订单。';
        }elseif($master == 2){
            $sh_explain = '平台判定用户胜诉';
        }

        //提交日志
        $userinfo = $userLogin->getMemberInfo($uid);
        $tj_log = array(
            'type' => 'text',
            'uid' => $uid,
            'nickname' => $userinfo['nickname'],
            'photo' => $userinfo['photo'],
            'time' => $time,
            'title' => $sh_explain,
            'value' => ''
        );

        array_push($_tj_log, $tj_log);
        $_tj_log = addslashes(json_encode($_tj_log));

        $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `state` = 2, `sh_time` = '$time', `sh_explain` = '$sh_explain', `sh_explain_img` = '', `tj_log` = '$_tj_log' WHERE `id` = " . $id);
        $dsql->dsqlOper($sql, "update");

        //记录用户行为日志
        memberLog($uid, 'task', '', $id, 'update', $sh_explain . '('.$_ordernum.' => '.$_price.'元)', '', $sql);

        //更新任务领取人账户余额和日志
        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + $_price WHERE `id` = ".$_uid);
        $dsql->dsqlOper($archives, "update");

        $userinfo  = $userLogin->getMemberInfo($_uid);
        $usermoney = $userinfo['money'];
        $info = '完成任务:' . $_ordernum;

        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`, `montype`, `ordertype`, `ctype`, `balance`) VALUES ('$_uid', 1, '$_price', '$info', '$time', '1', 'task', 'yongjin', '$usermoney')");
        $dsql->dsqlOper($archives, "update");

        //判断是否结束，任务名额和通过审核的订单
        $totalCount = 0;
        $sql = $dsql->SetQuery("SELECT COUNT(`id`) totalCount FROM `#@__task_order` WHERE `state` = 2 AND `tid` = $_tid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $totalCount = (int)$ret[0]['totalCount'];
        }
        if($totalCount == $_quota){
            $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `finish` = 1 WHERE `id` = $_tid");
            $dsql->dsqlOper($sql, "update");

            //更新任务关联订单的状态
            $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `finish` = 1 WHERE `tid` = $_tid");
            $dsql->dsqlOper($sql, "update");

            //查询已完成订单的佣金总额
            $amount = 0;
            $sql = $dsql->SetQuery("SELECT `price`, `fabu_fee`, `mprice` FROM `#@__task_order` WHERE `state` = 2 AND `tid` = $_tid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                foreach($ret as $key => $val){
                    // if($val['fabu_fee']){
                    //     $amount += floatval(sprintf("%.2f", ($val['price'] / (1-$val['fabu_fee']) - $val['price'])));  //查询每一单的佣金和平台抽佣比例，计算平台应得佣金
                    // }

                    if($val['mprice'] > 0 && $val['price'] > 0){
                        $amount += floatval(sprintf("%.2f", $val['mprice'] - $val['price']));  //mprice是领取任务时记录的任务结算原价，price是扣除过平台佣金和会员增加的佣金
                    }
                }
            }
            
            //平台抽佣&分销
            // $amount = floatval(sprintf('%.2f', $_price * $_fabu_fee * $_quota)); //平台应得佣金，单价*佣金比例*名额

            //扣除佣金  
            $fenXiao = (int)$customfenXiao;
            $fenxiaoFee = (int)$customfenxiaoFee;
            $_amount = $amount;  //平台得到的金额

            //平台分销开关
            global $cfg_fenxiaoState;
            global $cfg_fenxiaoDeposit;

            //分销金额
            $_fenxiaoAmount = 0;
            if($cfg_fenxiaoState && $fenXiao && $amount > 0.01){
                $_fenxiaoAmount = $amount * $fenxiaoFee / 100;

                $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;

                //分佣 开关
                $fenxiaoTotalPrice = $_fenxiaoAmount;
                global $transaction_id;
                $transaction_id = $param['transaction_id'];  //第三方平台支付订单号
                $ordernum = create_ordernum();
                $paramarr['ordernum'] = $_ordernum;
                $paramarr['title'] = $_title;
                $paramarr['amount'] = $_fenxiaoAmount;
                $paramarr['type'] = '做任务佣金，订单号：'. $_ordernum;
                if($fenXiao == 1 && $uid != -1){
                    (new member())->returnFxMoney("task", $uid, $_ordernum, $paramarr, 1);

                    $title1 = '做任务佣金，订单号：' . $_ordernum;
                    //查询一共分销了多少佣金
                    //如果系统没有开启资金沉淀才需要查询实际分销了多少
                    if(!$cfg_fenxiaoDeposit){
                        $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$title1' AND `module`= 'task'");
                        $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                        $fenxiaoTotalPrice = $fenxiaomonyeres[0]['allfenxiao'];
                    }
                }

                $_amount -= sprintf("%.2f", $fenxiaoTotalPrice);  //平台得到的减去分销出去的
            }

            //记录平台收入
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$uid', '1', '$_amount', '$_title', '$date','0','0','task',$_amount,'1','fabuxinxi')");
            $dsql->dsqlOper($archives, "update");

            //通知平台管理员
            $userinfo  = $userLogin->getMemberInfo($uid);
            $allincom = getAllincome();  //获取平台今日收益
            $infoname = getModuleTitle(array('name' => 'task'));  //获取模块名

            //微信通知
            $params = array(
                'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => 0,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $infoname."模块完成任务\r\n发布用户：".$userinfo['nickname']."\r\n任务名称：".$_title."\r\n\r\n平台获得佣金:".$_amount,
                    'date' => date("Y-m-d H:i:s", time()),
                    'status' => "今日总收入：$allincom"
                )
            );

            //后台微信通知
            updateAdminNotice("task", "detail", $params);
        }

        //自定义配置
        $param = array(
            "service"  => "member",
            "type"     => "user",
            "template" => "record"
        );

        $config = array(
            "username" => $userinfo['nickname'],
            "amount" => '+'.$_price,
            "money" => $usermoney,
            "date" => date("Y-m-d H:i:s", $time),
            "info" => $info,
            "fields" => array(
                'keyword1' => '变动类型',
                'keyword2' => '变动金额',
                'keyword3' => '变动时间',
                'keyword4' => '帐户余额'
            )
        );

        updateMemberNotice($_uid, "会员-帐户资金变动提醒", $param, $config);

        //更新举报维权订单，只要是商家主动审核通过，说明是领取用户胜诉
        $sql = $dsql->SetQuery("UPDATE `#@__task_report` SET `state` = 3, `winner` = 1 WHERE `oid` = $id");
        $dsql->dsqlOper($sql, "update");

        return array("state" => 200, "info" => '操作成功');

    }


	/**
    * 开通会员
    * @return array
    */
	public function openVip(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //等级ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //根据等级ID获取等级配置信息
        $sql = $dsql->SetQuery("SELECT `price`, `duration_month`, `refresh_coupon`, `bid_coupon` FROM `#@__task_member_level` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_price = (float)$ret[0]['price'];  //价格
        }else{
            return array("state" => 200, "info" => '要开通的等级不存在');
        }

        $ordernum = create_ordernum();

        //订单信息，用于区分其他支付业务
        $param = array(
            'type' => 'openVip',
            'id' => $id
        );

        //创建订单
        $order = createPayForm("task", $ordernum, $_price, '', "开通会员", $param, 1);
        $order['timeout'] = GetMkTime(time()) + 3600;
        return $order;

    }


	/**
    * 开通会员
    * @return array
    */
	public function openVip1(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //等级ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //根据等级ID获取等级配置信息
        $sql = $dsql->SetQuery("SELECT `price`, `duration_month`, `refresh_coupon`, `bid_coupon` FROM `#@__task_member_level` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_price = (float)$ret[0]['price'];  //价格
            $_duration_month = (int)$ret[0]['duration_month'];  //开通时长，单位：月
            $_duration_note = $ret[0]['duration_note'];  //时长描述
            $_refresh_coupon = (int)$ret[0]['refresh_coupon'];  //赠送刷新次数
            $_bid_coupon = (int)$ret[0]['bid_coupon'];  //赠送推荐时长，单位：小时
        }else{
            return array("state" => 200, "info" => '要开通的等级不存在');
        }

        //获取会员当前状态
        $level = $end_time = $refresh_coupon = $bid_coupon = 0;
        $time = GetMkTime(time());
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_member` WHERE `end_time` > $time AND `uid` = " . $uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_level = (int)$ret[0]['level'];  //当前等级
            $_end_time = (int)$ret[0]['end_time'];  //当前过期时间
            $refresh_coupon = (int)$ret[0]['refresh_coupon'];  //当前剩余刷新次数
            $bid_coupon = (int)$ret[0]['bid_coupon'];  //当前剩余推荐时长

            //续费
            if($_level == $id){

                $end_time = strtotime("+".$_duration_month." months", $_end_time);  //当前结束时间+新开通的时长

            }
            //开通其他等级
            else{

                $end_time = strtotime("+".$_duration_month." months", $time);

            }

        }

        $ordernum = create_ordernum();

        //订单信息，用于区分其他支付业务
        $param = array(
            'type' => 'openVip',
            'id' => $id,
            'end_time' => $end_time,  //结束时间
            'duration_month' => $_duration_month,  //开通时长
            'duration_note' => $_duration_note,  //开通时长描述
            'refresh_coupon' => $_refresh_coupon + $refresh_coupon,  //新的
            'bid_coupon' => $_bid_coupon + $bid_coupon
        );

        //创建订单
        $order = createPayForm("task", $ordernum, $_price, '', "开通会员", $param, 1);
        $order['timeout'] = GetMkTime(time()) + 3600;
        return $order;

    }


    /**
    * 更新已过期的推荐任务
    * @return array
    */
	public function updateExpireBidTask(){
        global $dsql;
        $time = GetMkTime(time());  //当前时间
        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `isbid` = 0 WHERE `bid_end_time` > 0 AND `bid_end_time` < $time");
        $dsql->dsqlOper($sql, "update");
    }


    /**
    * 更新已过期的极速审核任务
    * @return array
    */
	public function updateExpireJsTask(){
        global $dsql;
        $time = GetMkTime(time());  //当前时间
        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `sh_time` = `js_sh_time_bak`, `bid_began_time` = 0, `js_end_time` = 0, `js_sh_time_bak` = 0 WHERE `js_end_time` > 0 AND `js_end_time` < $time");
        $dsql->dsqlOper($sql, "update");
    }


    /**
    * 更新没有及时操作的任务订单
    * @return array
    */
	public function updateExpireOrder(){
        global $dsql;
        global $userLogin;
        $time = GetMkTime(time());  //当前时间

        //引入模块配置
        include HUONIAOINC."/config/task.inc.php";

        //用户提交过期的订单
        $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `state` = 4, `sh_time` = '$time', `sh_explain` = '超时未提交', `qx_time` = '$time' WHERE `state` = 0 AND `tj_expire` > 0 AND `tj_expire` < $time");
        $dsql->dsqlOper($sql, "update");

        //用户未通过审核的订单超时未修改的订单
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__task_order` WHERE `state` = 3 AND `xg_expire` > 0 AND `xg_expire` < $time");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach($ret as $key => $val){
                $oid = $val['id'];

                //确认订单是否处于举报维权中
                //不在举报维权中的才自动结束订单
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__task_report` WHERE `oid` = $oid");
                $ret = $dsql->dsqlOper($sql, "results");
                if(!$ret){
                    $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `state` = 4, `sh_time` = '$time', `sh_explain` = '超时未修改', `qx_time` = '$time' WHERE `id` = $oid");
                    $dsql->dsqlOper($sql, "update");
                }
            }
        }
        

        //商家审核过期的订单
        $sql = $dsql->SetQuery("SELECT o.*, l.`tj_time`, l.`quota`, l.`title` FROM `#@__task_order` o LEFT JOIN `#@__task_list` l ON l.`id` = o.`tid` WHERE o.`state` = 1 AND o.`sh_expire` > 0 AND o.`sh_expire` < $time ORDER BY `id` ASC");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach($ret as $key => $val){
                $_id = $val['id'];
                $_uid = $val['uid'];
                $_sid = $val['sid'];
                $_tid = $val['tid'];
                $_price = $val['price'];
                $_ordernum = $val['ordernum'];
                $_tj_log = json_decode($val['tj_log'], true);
                $_quota = (int)$val['quota'];
                $_title = $val['title'];

                $time = GetMkTime(time());
                $sh_explain = '超时自动审核通过';

                //确认订单是否处于举报维权中
                //不在举报维权中的才自动结束订单
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__task_report` WHERE `oid` = $_id");
                $ret = $dsql->dsqlOper($sql, "results");
                if(!$ret){

                    //更新任务领取人账户余额和日志
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + $_price WHERE `id` = ".$_uid);
                    $dsql->dsqlOper($archives, "update");

                    $userinfo = $userLogin->getMemberInfo($_uid);

                    //提交日志
                    $_sj_userinfo = $userLogin->getMemberInfo($_sid);
                    $tj_log = array(
                        'type' => 'text',
                        'uid' => $_sid,
                        'nickname' => $_sj_userinfo['nickname'],
                        'photo' => $_sj_userinfo['photo'],
                        'time' => $time,
                        'title' => $sh_explain,
                        'value' => ''
                    );

                    array_push($_tj_log, $tj_log);
                    $_tj_log = addslashes(json_encode($_tj_log));

                    //更新订单状态
                    $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `state` = 2, `sh_time` = '$time', `sh_explain` = '$sh_explain', `sh_explain_img` = '', `tj_log` = '$_tj_log' WHERE `id` = " . $_id);
                    $dsql->dsqlOper($sql, "update");

                    //更新账户记录
                    $usermoney = $userinfo['money'];
                    $info = '完成任务:' . $_ordernum;

                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`, `montype`, `ordertype`, `ctype`, `balance`) VALUES ('$_uid', 1, '$_price', '$info', '$time', '1', 'task', 'yongjin', '$usermoney')");
                    $dsql->dsqlOper($archives, "update");


                    //判断是否结束，任务名额和通过审核的订单
                    $totalCount = 0;
                    $sql = $dsql->SetQuery("SELECT COUNT(`id`) totalCount FROM `#@__task_order` WHERE `state` = 2 AND `tid` = $_tid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $totalCount = (int)$ret[0]['totalCount'];
                    }
                    if($totalCount == $_quota){
                        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `finish` = 1 WHERE `id` = $_tid");
                        $dsql->dsqlOper($sql, "update");

                        //更新任务关联订单的状态
                        $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `finish` = 1 WHERE `tid` = $_tid");
                        $dsql->dsqlOper($sql, "update");

                        //查询已完成订单的佣金总额
                        $amount = 0;
                        $sql = $dsql->SetQuery("SELECT `price`, `fabu_fee`, `mprice` FROM `#@__task_order` WHERE `state` = 2 AND `tid` = $_tid");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if($ret){
                            foreach($ret as $key => $val){
                                // if($val['fabu_fee']){
                                //     $amount += floatval(sprintf("%.2f", ($val['price'] / (1-$val['fabu_fee']) - $val['price'])));  //查询每一单的佣金和平台抽佣比例，计算平台应得佣金
                                // }

                                if($val['mprice'] > 0 && $val['price'] > 0){
                                    $amount += floatval(sprintf("%.2f", $val['mprice'] - $val['price']));  //mprice是领取任务时记录的任务结算原价，price是扣除过平台佣金和会员增加的佣金
                                }
                            }
                        }
                        
                        //平台抽佣&分销
                        // $amount = floatval(sprintf('%.2f', $_price * $_fabu_fee * $_quota)); //平台应得佣金，单价*佣金比例*名额

                        //扣除佣金  
                        $fenXiao = (int)$customfenXiao;
                        $fenxiaoFee = (int)$customfenxiaoFee;
                        $_amount = $amount;  //平台得到的金额

                        //平台分销开关
                        global $cfg_fenxiaoState;
                        global $cfg_fenxiaoDeposit;

                        //分销金额
                        $_fenxiaoAmount = 0;
                        if($cfg_fenxiaoState && $fenXiao && $amount > 0.01){
                            $_fenxiaoAmount = $amount * $fenxiaoFee / 100;

                            $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;

                            //分佣 开关
                            $fenxiaoTotalPrice = $_fenxiaoAmount;
                            global $transaction_id;
                            $transaction_id = $param['transaction_id'];  //第三方平台支付订单号
                            $ordernum = create_ordernum();
                            $paramarr['ordernum'] = $_ordernum;
                            $paramarr['title'] = $_title;
                            $paramarr['amount'] = $_fenxiaoAmount;
                            $paramarr['type'] = '做任务佣金，订单号：'. $_ordernum;
                            if($fenXiao == 1 && $_sid != -1){
                                (new member())->returnFxMoney("task", $_sid, $_ordernum, $paramarr, 1);

                                $title1 = '做任务佣金，订单号：' . $_ordernum;
                                //查询一共分销了多少佣金
                                //如果系统没有开启资金沉淀才需要查询实际分销了多少
                                if(!$cfg_fenxiaoDeposit){
                                    $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$title1' AND `module`= 'task'");
                                    $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                                    $fenxiaoTotalPrice = $fenxiaomonyeres[0]['allfenxiao'];
                                }
                            }

                            $_amount -= sprintf("%.2f", $fenxiaoTotalPrice);  //平台得到的减去分销出去的
                        }

                        //记录平台收入
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$_sid', '1', '$_amount', '$_title', '$date','0','0','task',$_amount,'1','fabuxinxi')");
                        $dsql->dsqlOper($archives, "update");

                        //通知平台管理员
                        $userinfo  = $userLogin->getMemberInfo($_sid);
                        $allincom = getAllincome();  //获取平台今日收益
                        $infoname = getModuleTitle(array('name' => 'task'));  //获取模块名

                        //微信通知
                        $params = array(
                            'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                            'cityid' => 0,
                            'notify' => '管理员消息通知',
                            'fields' =>array(
                                'contentrn'  => $infoname."模块完成任务\r\n发布用户：".$userinfo['nickname']."\r\n任务名称：".$_title."\r\n\r\n平台获得佣金:".$_amount,
                                'date' => date("Y-m-d H:i:s", time()),
                                'status' => "今日总收入：$allincom"
                            )
                        );

                        //后台微信通知
                        updateAdminNotice("task", "detail", $params);
                    }
                    

                    //自定义配置
                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "record"
                    );

                    $config = array(
                        "username" => $userinfo['nickname'],
                        "amount" => '+'.$_price,
                        "money" => $usermoney,
                        "date" => date("Y-m-d H:i:s", $time),
                        "info" => $info,
                        "fields" => array(
                            'keyword1' => '变动类型',
                            'keyword2' => '变动金额',
                            'keyword3' => '变动时间',
                            'keyword4' => '帐户余额'
                        )
                    );

                    updateMemberNotice($_uid, "会员-帐户资金变动提醒", $param, $config);

                }
            }

        }

    }


    /**
     * 黑名单列表
     */
    public function blackList(){
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        //默认排序，VIP会员、发布时间、自增ID
        $_orderby = " ORDER BY l.`id` DESC";

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__task_member_black` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE m.`id` IS NOT NULL" . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $sql     = $dsql->SetQuery("SELECT l.`uid`, m.`nickname`, l.`type`, l.`auth`, l.`expired` FROM `#@__task_member_black` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE m.`id` IS NOT NULL" . $where . $_orderby);
        $atpage  = $pageSize * ($page - 1);
        $where   = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($sql . $where, "results");
        $list    = array();
        if (count($results) > 0) {
            foreach ($results as $key => $value) {
                $list[$key]["uid"]       = (int)$value["uid"];
                $list[$key]["nickname"]  = $value["nickname"];
                $list[$key]["type"]      = $value["type"];
                $list[$key]["auth"]      = $this->authContent($value["auth"]);
                $list[$key]["expired"]   = $value["expired"] ? date("Y-m-d H:i", $value["expired"]) : '永不恢复';
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    //删除到期的黑名单记录
    public function autoRecoveryBlackList(){
        global $dsql;

        $time = GetMkTime(time());
        $sql = $dsql->SetQuery("DELETE FROM `#@__task_member_black` WHERE `expired` != 0 AND `expired` < $time");
        $dsql->dsqlOper($sql, "update");

    }


    // 处理内容
    function authContent($auth = ''){
    
        $ret = array();
    
        if($auth){
            $authArr = explode(',', $auth);
            foreach($authArr as $key => $val){
                if($val == 'receive'){
                    array_push($ret, '禁止领取任务');
                }elseif($val == 'fabu'){
                    array_push($ret, '禁止发布任务');
                }elseif($val == 'task'){
                    array_push($ret, '禁止使用任务模块');
                }elseif($val == 'login'){
                    array_push($ret, '禁止登录');
                }
            }
        }
        return join('、', $ret);
    
    }


    /**
     * 屏蔽列表
     */
    public function shieldList(){
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type     = (int)$this->param['type'];  //屏蔽类型：0屏蔽人 1屏蔽项目 2屏蔽任务

                //二级条件
                //type=0时，屏蔽人，ctype为1表示：不让他接我的任务，ctype为2表示：不接他的任务
                //type=1或2时，屏蔽项目/屏蔽任务，ctype为任务类型ID
                $ctype    = (int)$this->param['ctype'];

                //搜索关键字
                $keyword  = trim($this->param['keyword']);
                $keyword  = $type == 2 ? (int)$keyword : $keyword;  //屏蔽任务时搜索的是任务ID

                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $where = " AND s.`uid` = " . $uid;

        //屏蔽类型
        $type = (int)$type;
        $where .= " AND s.`type` = " . $type;

        //二级条件
        if($ctype){
            $where .= " AND s.`ctype` = " . $ctype;
        }

        //关键字
        if($keyword){
            //匹配昵称
            if($type == 0){
                $where .= " AND m.`nickname` = '$keyword'";
            //匹配项目名
            }elseif($type == 1){
                $where .= " AND s.`content` = '$keyword'";
            //匹配任务ID
            }elseif($type == 2){
                $where .= " AND l.`id` = $keyword";
            }
        }

        //默认排序，VIP会员、发布时间、自增ID
        $_orderby = " ORDER BY s.`id` DESC";

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //屏蔽人
        if($type == 0){
            $archives = $dsql->SetQuery("SELECT s.`id` FROM `#@__task_member_shield` s LEFT JOIN `#@__member` m ON m.`id` = s.`content` WHERE m.`id` IS NOT NULL" . $where);
        }
        //屏蔽项目
        elseif($type == 1){
            $archives = $dsql->SetQuery("SELECT s.`id` FROM `#@__task_member_shield` s WHERE 1 = 1" . $where);
        }
        //屏蔽任务
        elseif($type == 2){
            $archives = $dsql->SetQuery("SELECT s.`id` FROM `#@__task_member_shield` s LEFT JOIN `#@__task_list` l ON l.`id` = s.`content` WHERE 1 = 1" . $where);
        }

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );
        
        //屏蔽人
        if($type == 0){
            $sql = $dsql->SetQuery("SELECT s.`id`, s.`type`, s.`ctype`, s.`content`, s.`pubdate`, m.`photo`, m.`nickname` FROM `#@__task_member_shield` s LEFT JOIN `#@__member` m ON m.`id` = s.`content` WHERE m.`id` IS NOT NULL" . $where . $_orderby);
        }
        //屏蔽项目
        elseif($type == 1){
            $sql = $dsql->SetQuery("SELECT s.`id`, s.`type`, s.`ctype`, s.`content`, s.`pubdate` FROM `#@__task_member_shield` s WHERE 1 = 1" . $where . $_orderby);
        }
        //屏蔽任务
        elseif($type == 2){
            $sql = $dsql->SetQuery("SELECT s.`id`, s.`type`, s.`ctype`, s.`content`, s.`pubdate`, l.`title`, l.`typeid`, l.`project` FROM `#@__task_member_shield` s LEFT JOIN `#@__task_list` l ON l.`id` = s.`content` WHERE 1 = 1" . $where . $_orderby);
        }
        $atpage  = $pageSize * ($page - 1);
        $where   = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($sql . $where, "results");
        $list    = array();
        if (count($results) > 0) {
            foreach ($results as $key => $value) {
                $list[$key]["id"] = (int)$value["id"];  //屏蔽ID
                $list[$key]["type"]  = (int)$value["type"];  //屏蔽类型：0屏蔽人 1屏蔽项目 2屏蔽任务
                $list[$key]["ctype"]  = (int)$value["ctype"];  //二级条件，主要用于屏蔽人类型，ctype为1表示：不让他接我的任务，ctype为2表示：不接他的任务
                $list[$key]["pubdate"]   = date("Y-m-d", $value["pubdate"]);  //屏蔽时间


                //屏蔽人时，输出头像、昵称
                if($value['type'] == 0){
                    $list[$key]['photo'] = getFilePath($value['photo']);
                    $list[$key]['nickname'] = $value['nickname'];
                }
                //屏蔽项目时，输出任务类型和项目名
                elseif($value['type'] == 1){
                    $typename = '';
                    $typeid = $value['ctype'];  //ctype为项目类型ID
                    $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__task_type` WHERE `id` = $typeid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $typename = $ret[0]['typename'];
                    }
                    $list[$key]['typename'] = $typename;
                    $list[$key]['project'] = $value['content'];
                }
                //屏蔽任务时，输出任务标题、任务类型、项目名、任务ID
                elseif($value['type'] == 2){
                    $typename = '';
                    $typeid = $value['ctype'];  //ctype为项目类型ID
                    $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__task_type` WHERE `id` = $typeid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $typename = $ret[0]['typename'];
                    }
                    $list[$key]['typename'] = $typename;
                    $list[$key]['title'] = $value['title'];
                    $list[$key]['project'] = $value['project'];
                    $list[$key]['tid'] = (int)$value['content'];
                }

            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


	/**
    * 添加屏蔽信息
    * @return array
    */
	public function addShield(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $type = (int)$param['type'];  //屏蔽类型：0屏蔽人 1屏蔽项目 2屏蔽任务

        //二级条件
        //type=0时，屏蔽人，ctype为1表示：不让他接我的任务，ctype为2表示：不接他的任务
        //type=1或2时，屏蔽项目/屏蔽任务，ctype为任务类型ID
        $ctype = (int)$param['ctype'];

        $content = $param['content'];  //屏蔽内容：屏蔽人时传用户ID；屏蔽项目时传项目名；屏蔽任务时传任务ID；
        $content = $type != 1 ? (int)$content : $content; //不是屏蔽项目时，需要转成int型

        if(!$ctype){
            return array("state" => 200, "info" => '二级条件不得为空');
        }
        if(!$content){
            return array("state" => 200, "info" => '屏蔽内容不得为空');
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //不可以屏蔽自己
        if($type == 0 && $uid == $content){
            return array("state" => 200, "info" => '不可以屏蔽自己！');
        }


        //查询是否已经屏蔽过
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__task_member_shield` WHERE `uid` = '$uid' AND `type` = '$type' AND `ctype` = '$ctype' AND `content` = '$content'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            return array("state" => 100, "info" => '已经屏蔽过，无须重复提交');
        }

        $pubdate = GetMkTime(time());
        $sql = $dsql->SetQuery("INSERT INTO `#@__task_member_shield` (`uid`, `type`, `ctype`, `content`, `pubdate`) VALUES ('$uid', '$type', '$ctype', '$content', '$pubdate')");
        $ret = $dsql->dsqlOper($sql, "lastid");

        if(is_numeric($ret)){

            //记录用户行为日志
            memberLog($uid, 'task', '', 0, 'insert', '添加屏蔽信息('.$ret.'=>'.$type.'=>'.$ctype.'=>'.$content.')', '', $sql);

            return "添加成功";

        }else{
            return array("state" => 101, "info" => '系统错误，操作失败！');
        }

    }


	/**
    * 删除屏蔽信息
    * @return array
    */
	public function delShield(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //屏蔽ID

        if(!$id){
            return array("state" => 200, "info" => '屏蔽ID不得为空');
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }
        
        $sql = $dsql->SetQuery("DELETE FROM `#@__task_member_shield` WHERE `id` = $id AND `uid` = $uid");
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret == 'ok'){

            //记录用户行为日志
            memberLog($uid, 'task', '', $id, 'delete', '删除屏蔽信息('.$id.')', '', $sql);

            return "删除成功";

        }else{
            return array("state" => 101, "info" => '系统错误，操作失败！');
        }

    }


	/**
    * 反馈问题
    * @return array
    */
	public function feedback(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //任务ID
        $type = trim($param['type']);  //问题原因
        $content = trim($param['content']);  //问题描述
        $pics = $param['pics'];  //问题图片

        if(!$id){
            return array("state" => 200, "info" => '任务ID不得为空');
        }

        if($type == ''){
            return array("state" => 200, "info" => '请选择问题原因');
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //查询任务信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_list` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            $_uid = $_ret['uid'];

        }else{
            return array("state" => 200, "info" => '任务不存在或已经删除');
        }

        //查询是否已经屏蔽过
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__task_feedback` WHERE `uid` = '$uid' AND `tid` = '$id'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            return array("state" => 100, "info" => '该任务已经反馈过，无须重复提交');
        }

        $pubdate = GetMkTime(time());
        $sql = $dsql->SetQuery("INSERT INTO `#@__task_feedback` (`uid`, `tid`, `sid`, `type`, `content`, `pics`, `pubdate`, `state`) VALUES ('$uid', '$id', '$_uid', '$type', '$content', '$pics', '$pubdate', 0)");
        $ret = $dsql->dsqlOper($sql, "lastid");

        if(is_numeric($ret)){

            //记录用户行为日志
            memberLog($uid, 'task', '', $id, 'insert', '反馈任务悬赏问题('.$ret.'=>'.$type.'=>'.$content.')', '', $sql);

            return "反馈成功";

        }else{
            return array("state" => 101, "info" => '系统错误，操作失败！');
        }

    }


	/**
     * 刷新道具
     * @return array
     */
	public function refreshPackage(){
		global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();

        $refresh_discount = 100; //默认无折扣

        //查询会员折扣
        if($uid > 0){
            $time = GetMkTime(time());
            $sql = $dsql->SetQuery("SELECT l.`refresh_discount` FROM `#@__task_member_level` l LEFT JOIN `#@__task_member` m ON m.`level` = l.`id` WHERE m.`end_time` > $time AND m.`uid` = " . $uid);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $data = $ret[0];
                $refresh_discount = $data['refresh_discount'] ? $data['refresh_discount'] : 100;
            }
        }

        $list = array();
		$sql = $dsql->SetQuery("SELECT `id`, `typename`, `price` FROM `#@__task_refresh_package` ORDER BY `weight` ASC, `id` ASC");
        $ret = $dsql->dsqlOper($sql, "results");
		if($ret){
            
            foreach($ret as $key => $val){
                $count = (int)$val['typename'];
                $price = floatval(sprintf("%.2f", $val['price'] * $refresh_discount / 100));
                $unitprice = floatval(sprintf("%.2f", $price / $count));
                array_push($list, array(
                    'id' => (int)$val['id'],
                    'count' => $count,
                    'mprice' => floatval($val['price']),
                    'price' => $price,
                    'unitprice' => $unitprice
                ));
            }
            return $list;

		}else{
            return array("state" => 101, "info" => '道具获取失败！');
        }
	}


	/**
    * 购买刷新道具
    * @return array
    */
	public function buyRefreshPackage(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //要购买的道具ID

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //查询道具信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_refresh_package` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $count = (int)$ret[0]['typename'];
            $price = floatval($ret[0]['price']);

            $refresh_discount = 100; //默认无折扣

            //查询会员折扣
            $time = GetMkTime(time());
            $sql = $dsql->SetQuery("SELECT l.`refresh_discount` FROM `#@__task_member_level` l LEFT JOIN `#@__task_member` m ON m.`level` = l.`id` WHERE m.`end_time` > $time AND m.`uid` = " . $uid);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $data = $ret[0];
                $refresh_discount = $data['refresh_discount'] ? $data['refresh_discount'] : 100;
            }

            $price = floatval(sprintf("%.2f", $price * $refresh_discount / 100));  //计算优惠价

            $ordernum = create_ordernum();

            //订单信息，用于区分其他支付业务
            $param = array(
                'type' => 'refreshPackage',
                'id' => $id
            );

            //创建订单
            $order = createPayForm("task", $ordernum, $price, '', "购买刷新道具", $param, 1);
            $order['timeout'] = GetMkTime(time()) + 3600;
            return $order;

        }else{
            return array("state" => 200, "info" => '要购买的刷新道具不存在或已经删除');
        }


    }


    //自动刷新任务
    public function autoRefreshTask(){
        global $dsql;

        //查询所有需要自动刷新的任务
        $time = GetMkTime(time());
        $sql = $dsql->SetQuery("SELECT `id`, `uid`, `refresh_time`, `refresh_count`, `refresh_interval` FROM `#@__task_list` WHERE `refresh_count` > 0 AND `refresh_start` <= $time");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach($ret as $key => $val){
                $id = $val['id'];
                $uid = $val['uid'];
                $refresh_time = $val['refresh_time'];
                $refresh_count = $val['refresh_count'];
                $refresh_interval = $val['refresh_interval'] * 60;

                $time = GetMkTime(time());
                
                //如果已经到了刷新时间，则更新任务刷新时间和剩余刷新次数
                if($time - $refresh_time >= $refresh_interval){
                    $refresh_count--;
                    if($refresh_count >= 0){
                        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `refresh_time` = '$time', `refresh_count` = '$refresh_count' WHERE `id` = " . $id);
                        $dsql->dsqlOper($sql, "update");

                        //记录用户行为日志
                        memberLog($uid, 'task', '', $id, 'update', '自动刷新任务('.$id.'，剩余次数：'.$refresh_count.')', '', $sql);
                    }
                }
            }
        }
    }


	/**
    * 举报维权
    * @return array
    */
	public function sendReport(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        require(HUONIAOINC."/config/task.inc.php");
        $reportTimeLimit = (int)$customreportTimeLimit;  //举报辩诉时间限制

        $id = (int)$param['id'];  //订单ID
        $content = trim($param['content']);  //举报理由
        $pics = $param['pics'];  //证据图片
        $video = $param['video'];  //证据视频

        if(!$id){
            return array("state" => 200, "info" => '订单ID不得为空');
        }

        if($content == ''){
            return array("state" => 200, "info" => '请填写举报理由');
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //查询订单信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_order` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            $_uid = $_ret['uid'];
            $_tid = $_ret['tid'];
            $_sid = $_ret['sid'];
            $_state = $_ret['state'];
            $_ordernum = $_ret['ordernum'];
            $_tj_log = json_decode($_ret['tj_log'], true);

            //用户可以举报发布人，发布人也可以举报用户
            if($_uid != $uid && $_sid != $uid){
                return array("state" => 200, "info" => '非本人订单，不可以举报！');
            }

            if($_state != 3){
                return array("state" => 200, "info" => '订单当前状态不可以举报');
            }

        }else{
            return array("state" => 200, "info" => '订单不存在或已经删除');
        }

        //确认被举报人是谁
        $mid = $_sid;  //被举报人默认是发布人
        $from = 'store';
        
        //如果登录人是发布人，说明是发布人举报用户，则被举报人则是用户
        if($uid == $_sid){
            $mid = $_uid;
            $from = '';
        }

        //查询是否已经举报过，同一个订单，发布人和用户只能举报一次
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__task_report` WHERE (`uid` = '$uid' OR `mid` = '$uid') AND `oid` = '$id'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            return array("state" => 100, "info" => '该订单已经举报过，无须重复提交');
        }


        //提交日志
        $userinfo = $userLogin->getMemberInfo();
        $tj_log = array(
            'type' => 'text',
            'uid' => $uid,
            'nickname' => $userinfo['nickname'],
            'photo' => $userinfo['photo'],
            'time' => GetMkTime(time()),
            'title' => '发起举报，举报理由：' . $content,
            'value' => $pics . ($video ? ($pics ? '||' : '') . $video : '')
        );

        array_push($_tj_log, $tj_log);
        $_tj_log = addslashes(json_encode($_tj_log));

        //更新订单状态
        $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `tj_log` = '$_tj_log' WHERE `id` = " . $id);
        $dsql->dsqlOper($sql, "update");


        //插入举报记录
        $pubdate = GetMkTime(time());
        $expired = $pubdate + $reportTimeLimit * 60 * 60;  //辩诉限时
        $sql = $dsql->SetQuery("INSERT INTO `#@__task_report` (`uid`, `mid`, `oid`, `ordernum`, `tid`, `sid`, `reason`, `pics`, `video`, `pubdate`, `state`, `expired`) VALUES ('$uid', '$mid', '$id', '$_ordernum', '$_tid', '$_sid', '$content', '$pics', '$video', '$pubdate', 0, '$expired')");
        $ret = $dsql->dsqlOper($sql, "lastid");

        if(is_numeric($ret)){

            //记录用户行为日志
            memberLog($uid, 'task', '', $id, 'insert', '举报任务悬赏订单('.$ret.'=>'.$_ordernum.'=>'.$content.')', '', $sql);
            
            //通知对方
            global $cfg_miniProgramAppid;
            $param = 'wxMiniprogram://'.$cfg_miniProgramAppid.'?//pages/packages/task/complainCenter/complainCenter';

            $config = array(
                "first" => "有任务订单对您提交了举报",
                "content" => "订单编号：" . $_ordernum,
                "date" => date("Y-m-d H:i:s", $pubdate),
                "status" => "等待辩诉",
                "color" => "",
                "remark" => "请在" . date("Y-m-d H:i:s", $expired) . "前完成辩诉，逾期将自动判定对方胜诉！",
                "fields" => array(
                    'keyword1' => '任务信息',
                    'keyword2' => '提交时间',
                    'keyword3' => '当前状态'
                )
            );

            updateMemberNotice($_sid, "会员-任务提醒", $param, $config);

            return "举报成功";

        }else{
            return array("state" => 101, "info" => '系统错误，操作失败！');
        }

    }


	/**
    * 举报辩诉
    * @return array
    */
	public function pleaReport(){
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = (int)$param['id'];  //订单ID
        $content = trim($param['content']);  //辩诉理由
        $pics = $param['pics'];  //辩诉证据图片
        $video = $param['video'];  //辩诉证据视频

        if(!$id){
            return array("state" => 200, "info" => '订单ID不得为空');
        }

        if($content == ''){
            return array("state" => 200, "info" => '请填写举报理由');
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //查询订单信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_order` WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_ret = $ret[0];
            $_uid = $_ret['uid'];  //订单领取人
            $_tid = $_ret['tid'];  //任务ID
            $_sid = $_ret['sid'];  //发布人ID
            $_ordernum = $_ret['ordernum'];  //订单编号
            $_tj_log = json_decode($_ret['tj_log'], true);

            //用户可以举报发布人，发布人也可以举报用户
            if($_uid != $uid && $_sid != $uid){
                return array("state" => 200, "info" => '非本人订单，不可以操作！');
            }

        }else{
            return array("state" => 200, "info" => '订单不存在或已经删除');
        }

        $pubdate = GetMkTime(time());  //当前时间

        //查询举报信息
        $sql = $dsql->SetQuery("SELECT * FROM `#@__task_report` WHERE `oid` = $id ORDER BY `id` DESC LIMIT 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $_r_ret = $ret[0];
            $_r_id = $_r_ret['id'];  //举报信息ID
            $_r_uid = $_r_ret['uid'];  //举报人
            $_r_mid = $_r_ret['mid'];  //被举报人
            $_r_expired = $_r_ret['expired'];  //辩诉到期时间
            $_r_state = $_r_ret['state'];  //举报信息状态  0待对方辩诉 1等待平台审核 2已通过 3已结束

            //只有被举报人才可以辩诉
            if($uid != $_r_mid){
                return array("state" => 200, "info" => '只有被举报人才可以辩诉！');
            }

            //只有状态为0时可以辩诉
            if($_r_state != 0){
                return array("state" => 200, "info" => '当前状态不可以辩诉！');
            }
            
            //辩诉时限内才可以提交
            if($_r_expired < $pubdate){
                return array("state" => 200, "info" => '超过辩诉时间！');
            }

        }else{
            return array("state" => 200, "info" => '举报信息不存在或已经删除');
        }

        $from = 'store';
        if($_r_mid == $_uid){
            $from = '';
        }


        //提交日志
        $userinfo = $userLogin->getMemberInfo();
        $tj_log = array(
            'type' => 'text',
            'uid' => $uid,
            'nickname' => $userinfo['nickname'],
            'photo' => $userinfo['photo'],
            'time' => GetMkTime(time()),
            'title' => '发起辩诉，辩诉理由：' . $content,
            'value' => $pics . ($video ? ($pics ? '||' : '') . $video : '')
        );

        array_push($_tj_log, $tj_log);
        $_tj_log = addslashes(json_encode($_tj_log));

        //更新订单状态
        $sql = $dsql->SetQuery("UPDATE `#@__task_order` SET `tj_log` = '$_tj_log' WHERE `id` = " . $id);
        $dsql->dsqlOper($sql, "update");


        //更新举报记录
        $sql = $dsql->SetQuery("UPDATE `#@__task_report` SET `bs_reason` = '$content', `bs_pics` = '$pics', `bs_video` = '$video', `bs_pubdate` = '$pubdate', `state` = 1 WHERE `id` = $_r_id");
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret == 'ok'){

            //记录用户行为日志
            memberLog($uid, 'task', '', $_r_id, 'update', '辩诉任务悬赏订单('.$_r_id.'=>'.$_ordernum.'=>'.$content.')', '', $sql);

            //通知对方
            global $cfg_miniProgramAppid;
            $param = 'wxMiniprogram://'.$cfg_miniProgramAppid.'?//pages/packages/task/orderDetail/orderDetail?merchant='.($from == 'store' ? 1 : 0).'&tid='.$_tid.'&orderid=' . $id;

            $config = array(
                "first" => "有任务订单对方进行了辩诉",
                "content" => "订单编号：" . $_ordernum,
                "date" => date("Y-m-d H:i:s", $pubdate),
                "status" => "等待平台审核",
                "color" => "",
                "remark" => "请耐心等待平台工作人员审核！",
                "fields" => array(
                    'keyword1' => '任务信息',
                    'keyword2' => '提交时间',
                    'keyword3' => '当前状态'
                )
            );

            updateMemberNotice($_r_uid, "会员-任务提醒", $param, $config);

            return "辩诉成功，请耐心等待平台工作人员审核！";

        }else{
            return array("state" => 101, "info" => '系统错误，操作失败！');
        }

    }


    //举报投诉列表
    public function reportList(){
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $state = $from = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $from = $this->param['from'];  //来源 默认个人，store商家
                $state = $this->param['state'];  //状态  0进行中  1已完结
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //如果是商家中心，只获取任务发布人是商家的数据
        if($from == 'store'){
            $where .= " AND r.`sid` = $uid";
        }
        //如果是用户举报中心，获取的数据中发布人不能是当前登录用户
        else{
            $where .= " AND r.`sid` != $uid";
        }

        //我举报的和举报我的
        $where .= " AND (r.`uid` = $uid OR r.`mid` = $uid)";

        //进行中的
        if(!$state){
            $where .= " AND (r.`state` = 0 OR r.`state` = 1)";
        }
        //已完成的
        else{
            $where .= " AND (r.`state` = 2 OR r.`state` = 3)";
        }

        //默认排序，VIP会员、发布时间、自增ID
        $_orderby = " ORDER BY r.`id` DESC";

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        
        $archives = $dsql->SetQuery("SELECT r.`id` FROM `#@__task_report` r LEFT JOIN `#@__task_order` o ON o.`id` = r.`oid` LEFT JOIN `#@__task_list` l ON l.`id` = r.`tid` WHERE 1 = 1" . $where);

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );
        
        $sql = $dsql->SetQuery("SELECT r.`id`, r.`uid`, r.`mid`, r.`oid`, r.`ordernum`, r.`tid`, r.`sid`, r.`expired`, r.`state`, r.`winner`, r.`note`, r.`admin_time`, o.`price`, o.`tj_log`, l.`title`, l.`project`, t.`typename` FROM `#@__task_report` r LEFT JOIN `#@__task_order` o ON o.`id` = r.`oid` LEFT JOIN `#@__task_list` l ON l.`id` = r.`tid` LEFT JOIN `#@__task_type` t ON t.`id` = l.`typeid` WHERE 1 = 1" . $where . $_orderby);
        $atpage  = $pageSize * ($page - 1);
        $where   = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($sql . $where, "results");
        $list    = array();
        if (count($results) > 0) {
            $time = GetMkTime(time());
            foreach ($results as $key => $value) {
                $list[$key]["id"] = (int)$value["id"];  //举报ID
                $list[$key]["uid"] = (int)$value["uid"];  //举报人ID
                $list[$key]["mid"] = (int)$value["mid"];  //被举报人ID
                $list[$key]["tid"] = (int)$value["tid"];  //任务ID
                $list[$key]["oid"] = (int)$value["oid"];  //订单ID
                $list[$key]["ordernum"] = $value["ordernum"];  //订单编号
                $list[$key]["expired"] = (int)$value["expired"];  //辩诉过期时间
                $list[$key]["expired_second"] = (int)($value["expired"] - $time);  //辩诉剩余时间（单位：秒）
                $list[$key]["state"] = (int)$value["state"];  //举报状态  0待对方辩诉 1等待平台审核 2已通过 3已结束
                $list[$key]["price"] = floatval((float)$value["price"]);  //订单金额
                $list[$key]["title"] = $value["title"];  //任务标题
                $list[$key]["project"] = $value["project"];  //任务项目名称
                $list[$key]["typename"] = $value["typename"];  //任务类型
                $list[$key]["admin_time"] = (int)$value["admin_time"];  //平台判定时间
                $list[$key]["sid"] = (int)$value["sid"];  //商家/发布人ID

                $_winner = 0; //是否胜诉
                $winner = (int)$value['winner'];  //胜诉方  1用户 2发布人

                $note = $value["note"];//平台判定结果说明

                //根据登录人判断身份，只有已完结的才需要判断
                if($value['state'] == 2 || $value['state'] == 3){
                    if(
                        //登录人是举报人，也是发布人
                        ($uid == $value['uid'] && $uid == $value['sid'] && $winner == 2)
                        ||
                        //登录人是被举报人，也是发布人
                        ($uid == $value['mid'] && $uid == $value['sid'] && $winner == 2)
                    ){
                        $_winner = 1;
                    }
                    elseif(
                        //登录人是举报人，不是发布人
                        ($uid == $value['uid'] && $uid != $value['sid'] && $winner == 1)
                        ||
                        //登录人是被举报人，不是发布人
                        ($uid == $value['mid'] && $uid != $value['sid'] && $winner == 1)
                    ){
                        $_winner = 1;
                    }

                    //如果平台操作时间为0，说明是其中一方自动放弃的，结果说明获取提交日志
                    if($value['admin_time'] == 0){
                        
                        $tj_log = json_decode($value['tj_log'], true);
                        $tj_log = is_array($tj_log) ? $tj_log[count($tj_log)-1] : array();
                        
                        //提交记录正常情况
                        if($tj_log){
                            $title = $tj_log['title'];

                            //如果是发布人
                            if($uid == $value['sid']){

                                //胜诉
                                if($_winner){

                                    if($title == '超过辩诉时间，系统自动取消订单。'){
                                        $note = '对方未在规定时间内上传证据，视自动放弃申诉';
                                    }elseif($title == '取消订单'){
                                        $note = '用户主动放弃申诉';
                                    }elseif($title == '平台判定商家/发布人胜诉'){
                                        $note = '平台判定您胜诉';
                                    }
                                    
                                }
                                //败诉
                                else{

                                    if($title == '超过辩诉时间，系统自动审核通过订单。'){
                                        $note = '您未在规定时间内上传证据，视自动放弃申诉';
                                    }elseif($title == '重新审核通过'){
                                        $note = '您已重新审核通过';
                                    }elseif($title == '平台判定用户胜诉'){
                                        $note = $title;
                                    }

                                }
                                

                            }
                            //如果是用户
                            else{

                                //胜诉
                                if($_winner){

                                    if($title == '超过辩诉时间，系统自动审核通过订单。'){
                                        $note = '对方未在规定时间内上传证据，视自动放弃申诉';
                                    }elseif($title == '重新审核通过'){
                                        $note = '商户重新审核通过';
                                    }elseif($title == '平台判定用户胜诉'){
                                        $note = '平台判定您胜诉';
                                    }
                                    
                                }
                                //败诉
                                else{
                                    
                                    if($title == '超过辩诉时间，系统自动取消订单。'){
                                        $note = '您未在规定时间内上传证据，视自动放弃申诉';
                                    }elseif($title == '取消订单'){
                                        $note = '您主动放弃申诉';
                                    }elseif($title == '平台判定商家/发布人胜诉'){
                                        $note = '平台判定商家/发布人胜诉';
                                    }

                                }

                            }

                        }
                        //没有获取到提交记录
                        else{
                            $note = '';
                        }

                    }
                }

                $list[$key]['winner'] = $_winner;  //0未胜诉  1胜诉
                $list[$key]["note"] = $note;  //结果说明

            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    //辩诉时间过期后自动判定举报胜诉方
    public function autoJudgeReportWinner(){
        global $dsql;
        $time = GetMkTime(time());

        //查询所有已经过了辩诉时间的举报信息
        $sql = $dsql->SetQuery("SELECT `id`, `uid`, `mid`, `oid`, `sid` FROM `#@__task_report` WHERE `expired` < $time AND `state` = 0 ORDER BY `id` ASC");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach($ret as $key => $val){
                $id  = $val['id'];   //举报信息ID
                $uid = $val['uid'];  //举报人
                $mid = $val['mid'];  //被举报人
                $oid = $val['oid'];  //订单ID
                $sid = $val['sid'];  //发布人ID
                

                //如果举报人是发布人，说明是商家举报用户，用户没有在规定时间内辩诉，判商家胜诉，订单自动取消
                if($uid == $sid){
                    $winner = 2;

                    $this->param = array(
                        'id' => $oid
                    );
                    $this->cancelOrder(1);
                }
                //否则是用户举报商家，商家没有在规则时间内辩诉，判用户胜诉，订单自动审核通过
                else{
                    $winner = 1;

                    $this->param = array(
                        'id' => $oid
                    );
                    $this->passOrder(1);
                }

                $sql = $dsql->SetQuery("UPDATE `#@__task_report` SET `state` = 3, `winner` = '$winner' WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "update");

            }
        }

    }







    

}