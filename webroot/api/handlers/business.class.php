<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 商家模块API接口
 *
 * @version        $Id: business.class.php 2017-3-23 上午12:01:21 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class business {
	private $param;  //参数

	/**
     * 构造函数
	 *
     * @param string $action 动作名
     */
    public function __construct($param = array()){
		$this->param = $param;
	}

	/**
     * 新闻基本参数
     * @return array
     */
	public function config(){

		require(HUONIAOINC."/config/business.inc.php");

		global $langData;
		global $cfg_fileUrl;              //系统附件默认地址
		global $cfg_uploadDir;            //系统附件默认上传目录
		// global $customFtp;                //是否自定义FTP
		// global $custom_ftpState;          //FTP是否开启
		// global $custom_ftpUrl;            //远程附件地址
		// global $custom_ftpDir;            //FTP上传目录
		// global $custom_uploadDir;         //默认上传目录
		global $cfg_basehost;             //系统主域名

		// global $customChannelName;        //模块名称
		// global $customLogo;               //logo使用方式
		global $cfg_weblogo;              //系统默认logo地址
		// global $customLogoUrl;            //logo地址
		// global $customSubDomain;          //访问方式
		// global $customChannelSwitch;      //模块状态
		// global $customCloseCause;         //模块禁用说明
		// global $customSeoTitle;           //seo标题
		// global $customSeoKeyword;         //seo关键字
		// global $customSeoDescription;     //seo描述
		global $cfg_hotline;           //咨询热线配置
		// global $customHotline;            //咨询热线
		// global $submission;               //投稿邮箱
		// global $customAtlasMax;           //图集数量限制
		// global $customTemplate;           //模板风格
		//
		// global $customUpload;             //上传配置是否自定义
		global $cfg_softSize;             //系统附件上传限制大小
		global $cfg_softType;             //系统附件上传类型限制
		global $cfg_thumbSize;            //系统缩略图上传限制大小
		global $cfg_thumbType;            //系统缩略图上传类型限制
		global $cfg_atlasSize;            //系统图集上传限制大小
		global $cfg_atlasType;            //系统图集上传类型限制

		// global $custom_softSize;          //附件上传限制大小
		// global $custom_softType;          //附件上传类型限制
		// global $custom_thumbSize;         //缩略图上传限制大小
		// global $custom_thumbType;         //缩略图上传类型限制
		// global $custom_atlasSize;         //图集上传限制大小
		// global $custom_atlasType;         //图集上传类型限制

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

		$params = !empty($this->param) && !is_array($this->param) ? explode(',',$this->param) : "";

		// $domainInfo = getDomain('article', 'config');
		// $customChannelDomain = $domainInfo['domain'];
		// if($customSubDomain == 0){
		// 	$customChannelDomain = "http://".$customChannelDomain;
		// }elseif($customSubDomain == 1){
		// 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
		// }elseif($customSubDomain == 2){
		// 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
		// }

		// include HUONIAOINC.'/siteModuleDomain.inc.php';
		$customChannelDomain = getDomainFullUrl('business', $customSubDomain);

        //分站自定义配置
        $ser = 'business';
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
				}elseif($param == "agreement"){
					// $return['agreement'] = str_replace('$city', $cityName, $customAgreement);
				}elseif($param == "businessTag"){
					$businessTag_ = array();
					if($customBusinessTag){
						$arr = explode("\n", $customBusinessTag);
						foreach ($arr as $k => $v) {
							$arr_ = explode('|', $v);
							foreach ($arr_ as $s => $r) {
								if(trim($r)){
									$businessTag_[] = trim($r);
								}
							}
						}
					}
					$return['businessTag'] = $businessTag_;
				}elseif($param == "cost"){
					$return['cost'] = unserialize($customCost);
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
				}elseif($param == "listRule"){
					$return['listRule'] = $custom_listRule;
				}elseif($param == "detailRule"){
					$return['detailRule'] = $custom_detailRule;
				}elseif($param == "trialAutoAudit"){
					$return['trialAutoAudit'] = (int)$custom_trialAutoAudit;
				}elseif($param == "enterpriseAutoAudit"){
					$return['enterpriseAutoAudit'] = (int)$custom_enterpriseAutoAudit;
				}
			}

		}else{

			//自定义LOGO
			if($customLogo == 1){
				$customLogoPath = getAttachemntFile($customLogoUrl);
			}else{
				$customLogoPath = getAttachemntFile($cfg_weblogo);
			}

			$return['channelName']         = str_replace('$city', $cityName, $customChannelName);
			$return['logoUrl']             = $customLogoPath;
			$return['subDomain']           = $customSubDomain;
			$return['channelDomain']       = $customChannelDomain;
			$return['channelSwitch']       = $customChannelSwitch;
			$return['closeCause']          = $customCloseCause;
			$return['title']               = str_replace('$city', $cityName, $customSeoTitle);
			$return['keywords']            = str_replace('$city', $cityName, $customSeoKeyword);
			$return['description']         = str_replace('$city', $cityName, $customSeoDescription);
			$return['template']            = $customTemplate;
			$return['touchTemplate']       = $customTouchTemplate;
			$return['softSize']            = $custom_softSize;
			$return['softType']            = $custom_softType;
			$return['thumbSize']           = $custom_thumbSize;
			$return['thumbType']           = $custom_thumbType;
			$return['atlasSize']           = $custom_atlasSize;
			$return['atlasType']           = $custom_atlasType;

			$return['joinState'] = (int)$customJoinState;  //商家入驻功能   0开启  1关闭
            $return['joinCheck'] = (int)$customJoinCheck;  //商家新入驻  0需要审核  1不需要审核
            $return['editJoinCheck'] = (int)$customEditJoinCheck;  //修改商家入驻信息  0需要审核  1不需要审核
            $return['moduleJoinCheck'] = (int)$customModuleJoinCheck;  //模块店铺入驻  0需要审核  1不需要审核
            $return['editModuleJoinCheck'] = (int)$customEditModuleJoinCheck;  //修改模块店铺信息  0需要审核  1不需要审核
            $return['joinTimesUnit'] = (int)$customJoinTimesUnit;  //入驻时长单位  0按月  1按年
            $return['joinCheckMaterial'] = $customJoinCheckMaterial ? explode(',', $customJoinCheckMaterial) : array();  //入驻认证材料  business营业执照  id身份证

			$businessTag_ = array();
			if($customBusinessTag){
				$arr = explode("\n", $customBusinessTag);
				foreach ($arr as $k => $v) {
					$arr_ = explode('|', $v);
					foreach ($arr_ as $s => $r) {
						if(trim($r)){
							$businessTag_[] = trim($r);
						}
					}
				}
			}
			$return['businessTag'] = $businessTag_;

			//商家入驻配置
			$isWxMiniprogram = isWxMiniprogram();
			$isBaiDuMiniprogram = isBaiDuMiniprogram();
			$isQqMiniprogram = isQqMiniprogram();
			$isByteMiniprogram = isByteMiniprogram();

			//获取模块信息
			global $cfg_secureAccess;
			global $cfg_basehost;
			global $cfg_staticVersion;
			global $dsql;
			$moduleListArr = array();
			$sql = $dsql->SetQuery("SELECT `icon`, `name` FROM `#@__site_module` WHERE `parentid` != 0 AND `state` = 0 AND `type` = 0");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				foreach ($ret as $key => $value) {
					$moduleListArr[$value['name']] = (empty($value['icon']) ? $cfg_secureAccess.$cfg_basehost.'/static/images/admin/nav/' . $value['name'] . '.png?v='.$cfg_staticVersion : getAttachemntFile($value['icon']));
				}
			}

			//商家特权
            $businessPrivilegeArr = array();
			$businessPrivilege = $businessPrivilege ? unserialize($businessPrivilege) : array();
            if($businessPrivilege){
                foreach($businessPrivilege as $key => $val){
                    $businessPrivilegeArr[$key] = array(
                        'title' => trim($val['title']),
                        'label' => trim($val['label']),
                        'note' => trim($val['note']),
                        'price' => (float)$val['price'],
                        'mprice' => (float)$val['mprice'],
                        'state' => (int)$val['state']  //状态  0启用  1停用
                    );
                }
            }
			$return['privilege'] = $businessPrivilegeArr;

			//商家特权
			$storeArr = array();
			$businessStore = $businessStore ? unserialize($businessStore) : array();
			if($businessStore){
				foreach ($businessStore as $key => $value) {

					$sql = $dsql->SetQuery("SELECT `wx`, `bd`, `qm`, `dy`, `app`, `pc`, `h5`, `android`, `ios`, `harmony` FROM `#@__site_module` WHERE `name` = '$key'");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret && is_array($ret)){

						$_ret = $ret[0];

						//模块开关
						if(
							(!isMobile() && $_ret['pc']) ||
				  		    (
				  			  isMobile() && (
								(!$isWxMiniprogram && !$isBaiDuMiniprogram && !$isQqMiniprogram && !$isByteMiniprogram && $_ret['h5'] && !isApp()) ||
								($isWxMiniprogram && $_ret['wx'] && !isApp()) ||
								($isBaiDuMiniprogram && $_ret['bd'] && !isApp()) ||
								($isQqMiniprogram && $_ret['qm'] && !isApp()) ||
								($isByteMiniprogram && $_ret['dy'] && !isApp()) ||
								(isApp() && ($_ret['android'] || $_ret['ios'] || $_ret['harmony']))
							  )
				  		    )
						){
							$storeArr[$key] = $value;
							$storeArr[$key]['icon'] = $moduleListArr[$key];
						}
					}
				}
			}
			$return['store'] = $storeArr;


            //开通时长
            $defaultRule = array(
                array('times' => 1, 'discount' => 9.8, 'point' => 10),
                array('times' => 3, 'discount' => 9.5, 'point' => 30),
                array('times' => 6, 'discount' => 9, 'point' => 60),
                array('times' => 12, 'discount' => 8, 'point' => 100),
            );
			$businessJoinRule = $businessJoinRule ? unserialize($businessJoinRule) : $defaultRule;
			$return['joinTimes'] = $businessJoinRule;

			//套餐管理
            // global $installModuleArr;
			// $businessPackage = $businessPackage ? unserialize($businessPackage) : array();
            // $packageArr = array();
			// if($businessPackage){

			// 	foreach ($businessPackage as $key => $value) {
			// 		$value['icon'] = $value['icon'] ? getAttachemntFile($value['icon']) : '';
			// 		$list = $value['list'];

			// 		$listArr = array();
			// 		$listContent = array();
			// 		$listCount = 0;
			// 		$listPrice = 0;
			// 		if($list){

			// 			$listArr['privilege'] = array();
			// 			$listArr['store'] = array();

			// 			$listContent = explode(',', $list);
			// 			$listCount = count($listContent);
			// 			foreach ($listContent as $k => $v) {

			// 				//商家权限
			// 				if($businessPrivilege[$v]){
			// 					$listArr['privilege'][] = array(
			// 						'name' => $v,
			// 						'title' => $businessPrivilege[$v]['title'],
			// 						'price' => $businessPrivilege[$v]['price'],
			// 						'note'  => $businessPrivilege[$v]['note']
			// 					);

			// 					$listPrice += $businessPrivilege[$v]['price'];
			// 				}

			// 				//模块权限
            //                 $ret = array();
            //                 if(in_array($v, $installModuleArr)){
            //                     $sql = $dsql->SetQuery("SELECT `wx`, `bd`, `qm`, `dy`, `app`, `pc`, `h5` FROM `#@__site_module` WHERE `name` = '$v'");
            //                     $ret = $dsql->dsqlOper($sql, "results");
            //                 }
			// 				if($ret && is_array($ret)){

			// 					$_ret = $ret[0];

			// 					//模块开关
			// 					if(
			// 						(!isMobile() && $_ret['pc']) ||
			// 			  		    (
			// 			  			  isMobile() && (
			// 							(!$isWxMiniprogram && !$isBaiDuMiniprogram && !$isQqMiniprogram && !$isByteMiniprogram && $_ret['h5'] && !isApp()) ||
			// 				  		    ($isWxMiniprogram && $_ret['wx'] && !isApp()) ||
			// 				  		    ($isBaiDuMiniprogram && $_ret['bd'] && !isApp()) ||
			// 				  		    ($isQqMiniprogram && $_ret['qm'] && !isApp()) ||
			// 				  		    ($isByteMiniprogram && $_ret['dy'] && !isApp()) ||
			// 				  		    (isApp() && $_ret['app'] == 0)
			// 						  )
			// 		  		  	    )
			// 					){
			// 						if($businessStore[$v]){
			// 							$listArr['store'][] = array(
			// 								'name' => $v,
			// 								'title' => $businessStore[$v]['title'],
			// 								'price' => $businessStore[$v]['price'],
			// 								'note'  => $businessStore[$v]['note'],
			// 								'icon'  => $moduleListArr[$v]
			// 							);

			// 							$listPrice += $businessStore[$v]['price'];
			// 						}
			// 					}
			// 				}
			// 			}

			// 		}
			// 		$value['listCount'] = (int)$listCount;  //套餐内容数量
			// 		$value['listContent'] = $listContent;  //套餐内容模块
			// 		$value['listArr'] = $listArr;  //套餐具体内容
			// 		$value['listPrice'] = (float)$listPrice;  //总价值
			// 		array_push($packageArr, $value);
			// 	}
			// }
			// $return['package'] = $packageArr;


			//活动管理
			//开通时长
			// $businessJoinTimes = $businessJoinTimes ? unserialize($businessJoinTimes) : array();
			// $joinTimesArr = array();
			// if($businessJoinTimes){
			// 	foreach ($businessJoinTimes as $key => $value) {
			// 		array_push($joinTimesArr, array(
			// 			'month' => $value,
			// 			'title' => $value > 11 ? ($value/12) . $langData['siteConfig'][13][14] : $value . $langData['siteConfig'][13][31]
			// 		));
			// 	}
			// }
			// $return['joinTimes'] = $joinTimesArr;

			//满减
			// $businessJoinSale = $businessJoinSale ? unserialize($businessJoinSale) : array();
			// $return['joinSale'] = $businessJoinSale;

			//送积分
			// $businessJoinPoint = $businessJoinPoint ? unserialize($businessJoinPoint) : array();
			// $return['joinPoint'] = $businessJoinPoint;


		}

		return $return;

	}


	/**
     * 商家分类
     * @return array
     */
	public function type(){
		global $dsql;
		$type = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$type     = (int)$this->param['type'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
				$son      = $this->param['son'] == 0 ? false : true;
			}
		}
		$results = $dsql->getTypeList($type, "business_type", $son, $page, $pageSize);
		if($results){
			return $results;
		}
	}


	/**
     * 商家区域
     * @return array
     */
	public function addr(){
		global $dsql;
		$type = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$type     = (int)$this->param['type'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
				$son      = $this->param['son'] == 0 ? false : true;
			}
		}

		global $template;
		if($template && $template != 'page' && empty($type)){
			//数据共享
			require(HUONIAOINC."/config/business.inc.php");
			$dataShare = (int)$customDataShare;

			if(!$dataShare){
				$type = getCityId();
			}
		}

		//一级
		if(empty($type)){
            //可操作的城市，多个以,分隔
            $userLogin = new userLogin($dbo);
            $adminCityIds = $userLogin->getAdminCityIds();
            $adminCityIds = empty($adminCityIds) ? 0 : $adminCityIds;

			$cityArr = array();
			$sql = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE c.`cid` in ($adminCityIds) AND c.`state` = 1 ORDER BY c.`id`");
			$result = $dsql->dsqlOper($sql, "results");
			if($result){
				foreach ($result as $key => $value) {

                    $lowerCount = array();
                    $sql   = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_area` WHERE `parentid` = " . $value['cid'] . " ORDER BY `weight`");
                    $ret   = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $lowerCount = $ret[0]['totalCount'];
                    }

					array_push($cityArr, array(
						"id" => $value['cid'],
						"typename" => $value['typename'],
						"pinyin" => $value['pinyin'],
                        "hot" => $value['hot'],
						"lower" => $lowerCount
					));
				}
			}
			return $cityArr;

		}else{
			$results = $dsql->getTypeList($type, "site_area", $son, $page, $pageSize, '', '', true);
			if($results){
				return $results;
			}
		}
	}


	/**
     * 商家列表
     * @return array
     */
	public function blist(){
		global $dsql;
		global $userLogin;
		global $langData;
        global $cfg_privatenumberState;  //隐私保护通话开关
        global $cfg_privatenumberModule;  //隐私保护通话模块开关
        global $cfg_payPhoneState;  //付费查看电话开关
        global $cfg_payPhoneModule;  //付费查看电话模块开关
        global $cfg_payPhoneVipFree;  //VIP会员免费查看

		$pageinfo = $list = array();
		$store = $addrid = $typeid = $title = $orderby = $page = $pageSize = $where = $where1 = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$store    = $this->param['store'];
				$addrid   = (int)$this->param['addrid'];
				$typeid   = (int)$this->param['typeid'];
				$title    = $this->param['title'];
				$keywords = $this->param['keywords'];
				$max_longitude = $this->param['max_longitude'];
				$min_longitude = $this->param['min_longitude'];
				$max_latitude  = $this->param['max_latitude'];
				$min_latitude  = $this->param['min_latitude'];
                $lng      = (float)$this->param['lng'];
                $lat      = (float)$this->param['lat'];
				$collect  = (int)$this->param['collect'];  //是否显示收藏信息
				$orderby  = $this->param['orderby'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
                $maidan   = $this->param['maidan'];
                $id = $this->param['id'];  //指定信息id，多个用,分隔


				$title = $title ? $title : $keywords;
			}
		}

        //数据共享
		require(HUONIAOINC."/config/business.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
    		// 自动审核的情况下名称可能为空
    		$cityid = getCityId($this->param['cityid']);
    		//遍历区域
            if($cityid){
                $where .= " AND l.`cityid` = ".$cityid;
            }
        }

        //指定信息id
        if($id){
            $_id = array();
            $_idArr = explode(',', $id);
            foreach($_idArr as $v){
                $v = (int)$v;
                if($v){
                    array_push($_id, $v);
                }
            }
            $id = join(',', $_id);
            $where .= " AND l.`id` IN ($id)";
        }

        //区分企业版和体验版
        // if($store){
        //     $where .= " AND `type` = " . $store;
        // }

        $now = time();

        $where .= " AND l.`cityid` != 0 AND l.`pstate` = 1 AND l.`title` != ''";

		//遍历区域
		if(!empty($addrid)){
			$addrList = $dsql->getTypeList($addrid, "site_area");
			if($addrList){
				global $arr_data;
				$arr_data = array();
				$lower = arr_foreach($addrList);
				$lower = $addrid.",".join(',',$lower);
			}else{
				$lower = $addrid;
			}
			$where .= " AND l.`addrid` in ($lower)";
		}

		//遍历分类
		if(!empty($typeid)){
			if($dsql->getTypeList($typeid, "business_type")){
				global $arr_data;
				$arr_data = array();
				$lower = arr_foreach($dsql->getTypeList($typeid, "business_type"));
				$lower = $typeid.",".join(',',$lower);
			}else{
				$lower = $typeid;
			}
			$where .= " AND l.`typeid` in ($lower)";
		}

		//模糊查询关键字
		if(!empty($title)){
			$title = explode(" ", $title);
			$w = array();
			foreach ($title as $k => $v) {
				if(!empty($v)){
					$w[] = "l.`title` like '%".$v."%'";
				}
			}
            if($w){
			    $where .= " AND (".join(" OR ", $w).")";
            }
		}

		//地图可视区域内
		if(!empty($max_longitude) && !empty($min_longitude) && !empty($max_latitude) && !empty($min_latitude)){
            $max_longitude = (float)$max_longitude;
            $min_longitude = (float)$min_longitude;
            $max_latitude = (float)$max_latitude;
            $min_latitude = (float)$min_latitude;
			$where .= " AND l.`lng` <= ".$max_longitude." AND l.`lng` >= ".$min_longitude." AND l.`lat` <= ".$max_latitude." AND l.`lat` >= ".$min_latitude."";
		}

        //查询距离
        if(((!empty($lng))&&(!empty($lat))) || $orderby == 3){
            $select="ROUND(
		        6378.138 * 2 * ASIN(
		            SQRT(POW(SIN(($lat * PI() / 180 - l.`lat` * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS(l.`lat` * PI() / 180) * POW(SIN(($lng * PI() / 180 - l.`lng` * PI() / 180) / 2), 2))
		        ) * 1000
		    ) AS distance,";
            $select="(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(".$lat."-l.`lat`)/360),2)+COS(3.1415926535898*".$lat."/180)* COS(l.`lat` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(".$lng."-l.`lng`)/360),2))))*1000 AS distance,";

        }else{
            $select="";
        }

		$order = " ORDER BY l.isbid DESC, l.`id` DESC";


		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		//人气
		if($orderby == "1"){
			$order = " ORDER BY popularity DESC, l.isbid DESC, l.`id` DESC";

		//好评
		}elseif($orderby == "2"){
			$order = " ORDER BY praise DESC, l.isbid DESC, l.`id` DESC";

        //距离
        }elseif($orderby == "3"){
            $order = " ORDER BY distance ASC, l.isbid DESC, l.`id` DESC";
        }elseif($orderby == "4"){
        	$order = " ORDER BY pubdate DESC, l.isbid DESC, l.`id` DESC";
        }
		//优惠（传递1表示获取商家买单优惠信息）
        $where_maidan = $select_maidan = "";
        if($maidan == 1){
            $select_maidan = " l.`maidan_youhui_open`,l.`maidan_youhui_value`, ";
            $where_maidan  = " AND l.`maidan_youhui_open`=1 AND l.`maidan_youhui_value`!=0";
            $where .= $where_maidan;
        }


		$archives = $dsql->SetQuery("SELECT l.`id`,$select_maidan l.`uid`, l.`isbid`, l.`title`, l.`logo`, l.`typeid`, l.`addrid`, l.`address`, l.`lng`, l.`lat`, l.`wechatname`, l.`wechatcode`, l.`wechatqr`, l.`tel`, l.`qq`,l.`landmark`, l.`email`, l.`pics`, l.`license`, l.`opentime`, l.`openweek`, l.`opentimes`, l.`amount`, l.`parking`, l.`authattr`, l.`pubdate`, l.`type`, l.`qj_file`, l.`video`, l.`banner`,".$select." (SELECT COUNT(`id`)  FROM `#@__public_comment_all` c WHERE c.`aid` = l.`id` AND c.`type` = 'business' AND `ischeck` = 1) AS popularity, (SELECT avg(`sco1`) FROM `#@__public_comment_all` c WHERE c.`aid` = l.`id` AND c.`type` = 'business' AND `ischeck` = 1 AND `pid` = 0) AS praise FROM `#@__business_list` l WHERE l.`state` = 1 AND (l.`expired` = 0 || l.`expired` > ".$now.")".$where);
		$archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__business_list` l WHERE l.`state` = 1 AND (l.`expired` = 0 || l.`expired` > ".$now.")".$where);

		//总条数
		$totalResults = $dsql->dsqlOper($archives_count, "results", "NUM");
		$totalCount = (int)$totalResults[0][0];

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);   //暂无数据！

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");

		if($results){

            $loginUserID = $userLogin->getMemberID();
            $loginUserInfo = $userLogin->getMemberInfo();

			$i = 0;
			foreach($results as $key => $val){

				$list[$i]['id']    = $val['id'];
				if($maidan==1){
				    $list[$i]['maidan_youhui_open'] = $val['maidan_youhui_open'];
				    $list[$i]['maidan_youhui_value'] = $val['maidan_youhui_value'];
                }
				$list[$i]['title'] = $val['title'];
				$list[$i]['type'] = $val['type'];
				$list[$i]['isbid'] = $val['isbid'];
				$list[$i]['logo']  = !empty($val['logo']) ? getFilePath($val['logo']) : "";

				global $data;
				$data = "";
				$typeArr = getParentArr("business_type", $val['typeid']);
				$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
				$list[$i]['typeid']      = $val['typeid'];
				$list[$i]['typename']    = $typeArr;

				global $data;
				$data = "";
				$addrArr = getParentArr("site_area", $val['addrid']);
				$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
				$list[$i]['addrid']      = $val['typeid'];
				$list[$i]['addrname']    = $addrArr;

				$list[$i]['address']    = $val['address'];
				$list[$i]['lng']        = $val['lng'];
				$list[$i]['lat']        = $val['lat'];
				$list[$i]['landmark']        = $val['landmark'];
//				$list[$i]['distance']   = $val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22];  //距离   //千米  //米
                $list[$i]['distance']   = $val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . "km" : (int)$val['distance'].  "m" ;  //距离   //千米  //米
				$list[$i]['wechatname'] = $val['wechatname'];
				$list[$i]['wechatcode'] = $val['wechatcode'];
				$list[$i]['wechatqr']   = !empty($val['wechatqr']) ? getFilePath($val['wechatqr']) : "";

				$tel = $val['tel'] ? explode(',', $val['tel']) : array();
				$qq = $val['qq'] ? explode(',', $val['qq']) : array();
				$email = $val['email'] ? explode(',', $val['email']) : array();

                //判断是否已经付过查看电话号码的费用
                $payPhoneState = $loginUserID == -1 ? 0 : 1;
                if($cfg_payPhoneState && in_array('business', $cfg_payPhoneModule) && $loginUserID != $val['userid']){

                    //判断是否开启了会员免费
                    if($cfg_payPhoneVipFree && $loginUserInfo['level']){
                        $payPhoneState = 1;
                    }
                    else{
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_pay_phone` WHERE `module` = 'business' AND `temp` = 'detail' AND `uid` = '$loginUserID' AND `aid` = " . $val['id']);
                        $ret = $dsql->dsqlOper($sql, "results");
                        if(!$ret){
                            $payPhoneState = 0;
                        }
                    }
                }

                $list[$i]['payPhoneState'] = $payPhoneState; //当前信息是否支付过
                $list[$i]['tel']     = $tel ? (!$payPhoneState && $cfg_payPhoneState && in_array('business', $cfg_payPhoneModule) ? '请先付费' : ($cfg_privatenumberState && in_array('business', $cfg_privatenumberModule) ? '请使用隐私号' : ($tel ? $tel[0] : ''))) : '';

				// $list[$i]['tel']        = $tel ? $tel[0] : "";
				$list[$i]['qq']         = $qq ? $qq[0] : "";
				$list[$i]['email']      = $email ? $email[0] : "";
				$list[$i]['telArr']     = $tel ? (!$payPhoneState && $cfg_payPhoneState && in_array('business', $cfg_payPhoneModule) ? array('请先付费') : ($cfg_privatenumberState && in_array('business', $cfg_privatenumberModule) ? array('请使用隐私号') : $tel)) : array();
				$list[$i]['qqArr']      = $qq;
				$list[$i]['emailArr']   = $email;
				$list[$i]['face_qj']    = $val['qj_file'] ? 1 : 0;
				$list[$i]['face_video'] = $val['video'] ? 1 : 0;

				$picArr = array();
				$pics = $val['pics'];
				if($pics){
					$pics = explode(",", $pics);
					foreach ($pics as $k => $v) {
						array_push($picArr, getFilePath($v));
					}
				}
				$list[$i]['pics']    = $picArr;
				$list[$i]['license'] = !empty($val['license']) ? getFilePath($val['license']) : "";
				// $list[$i]['opentime'] = $val['opentime'];
				// $list[$i]['openweek'] = $val['openweek'];
				// $list[$i]['opentimes'] = $val['opentimes'];

				$openweek = explode(',', $val['openweek']);
				$openweek_str = opentimeFormat($val['openweek']);
				$opentimes = explode(',', $val['opentimes']);

	            $list[$i]["openweek"]         = $openweek;
	            $list[$i]["openweek_str"]     = $openweek_str;
	            $list[$i]["opentimes"]        = $opentimes;
	            $list[$i]["opentimes_str"]    = join(' ', $opentimes);

				$list[$i]["opentime"] = $openweek_str . ' ' . join(' ', $opentimes);


				$list[$i]['amount']   = $val['amount'];
				$list[$i]['parking']  = $val['parking'];
				$list[$i]['pubdate']  = $val['pubdate'];
				$list[$i]['comment']  = $val['popularity'];

				//收藏此商家的会员信息
				if($collect){

					//收藏数量
					$collectCount = 0;
					$sql = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__member_collect` WHERE `module` = 'business' AND `aid` = " . $val['id']);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$collectCount = $ret[0]['totalCount'];
					}
					$list[$i]['collectCount']  = $collectCount;

					//最新的五名会员信息
					$collectUser = array();
					$sql = $dsql->SetQuery("SELECT `userid` FROM `#@__member_collect` WHERE `module` = 'business' AND `aid` = " . $val['id'] . " ORDER BY `id` DESC");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						foreach ($ret as $k => $v) {
							$sql = $dsql->SetQuery("SELECT `username`, `nickname`, `photo` FROM `#@__member` WHERE `id` = " . $v['userid']);
							$ret = $dsql->dsqlOper($sql, "results");
							if($ret){
								array_push($collectUser, array(
									'id' => $v['userid'],
									'name' => $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'],
									'photo' => getFilePath($ret[0]['photo'])
								));
							}
						}
					}
					$list[$i]['collectUser']  = $collectUser;
				}

				//认证
				$auth = array();
				if($val['authattr']){
					$authattr = explode(",", $val['authattr']);
					foreach ($authattr as $k => $v) {
						$sql = $dsql->SetQuery("SELECT `jc`, `typename` FROM `#@__business_authattr` WHERE `id` = $v");
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							array_push($auth, array("jc" => $ret[0]['jc'], "typename" => $ret[0]['typename']));
						}
					}
				}
				$list[$i]["auth"] = $auth;

				//全景数量
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_panor` WHERE `uid` = " . $val['id']);
				$panorCount = $dsql->dsqlOper($sql, 'totalCount');
				$list[$i]["panor"] = $panorCount;

				//视频数量
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_video` WHERE `uid` = " . $val['id']);
				$videoCount = $dsql->dsqlOper($sql, 'totalCount');
				$list[$i]["video"] = $videoCount;

				//会员信息
				$uinfo = $userLogin->getMemberInfo($val['uid'], 1);
				if(is_array($uinfo)){
					$list[$i]['member'] = array(
						"userid"       => $uinfo['userid'],
						"company"      => $uinfo['company'],
						"photo"        => $uinfo['photo'],
						"online"       => $uinfo['online'],
						"emailCheck"   => $uinfo['emailCheck'],
						"phoneCheck"   => $uinfo['phoneCheck'],
						"licenseState" => $uinfo['licenseState'],
						"certifyState" => $uinfo['certifyState'],
						"promotion"    => $uinfo['promotion'],
					);
				}

                $bannerArr = array();
                $qualityArr = array();

                $banner    = $val['banner'];
                if (!empty($banner)) {
                    $banner = explode(",", $banner);
                    foreach ($banner as $key => $value) {
                        array_push($bannerArr, array("pic" => getFilePath($value), "picSource" => $value));
                    }
                    //如果没有维护banner，调相册前5张
                }else{
                    $sql = $dsql->SetQuery("SELECT `litpic` FROM `#@__business_albums` WHERE `uid` = ".$val['id']." ORDER BY `id` DESC LIMIT 0, 5");
                    $ret  = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        foreach ($ret as $key => $v){
                            array_push($bannerArr, array("pic" => getFilePath($v['litpic']), "picSource" => $v['litpic']));
                        }
                    }
                }

                $quality    = $val['quality'];
                if (!empty($quality)) {
                    $quality = explode(",", $quality);
                    foreach ($quality as $key => $value) {
                        array_push($qualityArr, array("pic" => getFilePath($value), "picSource" => $value));
                    }
                    //如果没有维护banner，调相册前5张
                }
                $list[$i]['quality'] = $qualityArr;

                $list[$i]['banner'] = $bannerArr;



                //综合评分
				$sql = $dsql->SetQuery("SELECT avg(`rating`) r, count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `aid` = ".$val['id']." AND `pid` = 0 AND `type` = 'business'");
				$res = $dsql->dsqlOper($sql, "results");
				$rating = $res[0]['r'];		//总评分
				$list[$i]['rating']  = number_format($rating, 1);

				$list[$i]['comment'] = $res[0]['c'];

				// 默认URL
				$param = array(
					"service"     => "business",
					"template"    => "detail",
					"id"          => $val['id']
				);
				$list[$i]['url'] = getUrlPath($param);

				$url = "";
				if(strpos($val['bind_module'], "waimai") !== false){
					$sql = $dsql->SetQuery("SELECT m.`shopid` FROM `#@__waimai_shop_manager` m LEFT JOIN `#@__waimai_shop` s ON s.`id` = m.`shopid` WHERE s.`del` = 0 AND m.`userid` = ".$val['uid']);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$list[$i]['waimai'] = 1;
						$param = array(
							"service" => "waimai",
							"template" => "shop",
							"id" => $ret[0]['shopid']
						);
						$url = getUrlPath($param);
					}
				}
				$list[$i]['waimaiUrl'] = $url;


				//点评
				$sql                    = $dsql->SetQuery("SELECT avg(`sco1`) r, count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'business' AND `aid` = " . $val['id'] . " AND `pid` = 0");
				$res                    = $dsql->dsqlOper($sql, "results");
				$comment                = $res[0]['c'];    //点评数量
				$sco1                   = $res[0]['r'];    //总评分
				$list[$i]['comment'] = $comment;
				$list[$i]['sco1']    = number_format($sco1, 1);

                //如果是DIY页面请求的，需要把rating的数据用sco1代替
                if($_POST['platform_name']){
                    $list[$i]['rating'] = $list[$i]['sco1'];
                }

				$sql                    = $dsql->SetQuery("SELECT count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'business' AND `aid` = " . $val['id'] . " AND `sco1` = 1 AND `pid` = 0");
				$res                    = $dsql->dsqlOper($sql, "results");
				$list[$i]['sco1_1'] = (int)$res[0]['c'];
				$sql                    = $dsql->SetQuery("SELECT count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'business' AND `aid` = " . $val['id'] . " AND `sco1` = 2 AND `pid` = 0");
				$res                    = $dsql->dsqlOper($sql, "results");
				$list[$i]['sco1_2'] = (int)$res[0]['c'];
				$sql                    = $dsql->SetQuery("SELECT count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'business' AND `aid` = " . $val['id'] . " AND `sco1` = 3 AND `pid` = 0");
				$res                    = $dsql->dsqlOper($sql, "results");
				$list[$i]['sco1_3'] = (int)$res[0]['c'];
				$sql                    = $dsql->SetQuery("SELECT count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'business' AND `aid` = " . $val['id'] . " AND `sco1` = 4 AND `pid` = 0");
				$res                    = $dsql->dsqlOper($sql, "results");
				$list[$i]['sco1_4'] = (int)$res[0]['c'];
				$sql                    = $dsql->SetQuery("SELECT count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'business' AND `aid` = " . $val['id'] . " AND `sco1` = 5 AND `pid` = 0");
				$res                    = $dsql->dsqlOper($sql, "results");
				$list[$i]['sco1_5'] = (int)$res[0]['c'];

				$i ++;
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
     * 商家详细
     * @return array
     */
	public function storeDetail(){
		global $dsql;
		global $userLogin;
		global $langData;
        global $cfg_privatenumberState;  //隐私保护通话开关
        global $cfg_privatenumberModule;  //隐私保护通话模块开关
        global $cfg_payPhoneState;  //付费查看电话开关
        global $cfg_payPhoneModule;  //付费查看电话模块开关
        global $cfg_payPhoneVipFree; //会员免费查看

		$storeDetail = array();
		$id = $this->param;
		$id = is_numeric($id) ? $id : (is_array($id) ? $id['id'] : '');
		$uid = $userLogin->getMemberID();

		$userinfo = $userLogin->getMemberInfo();

        $uid = $userinfo['is_staff'] ==1 ? $userinfo['companyuid'] : $uid;
		if(!is_numeric($id) && $uid == -1){
			return array("state" => 200, "info" => '格式错误！');
		}
		$where = " AND `state` = 1";
		if(!is_numeric($id)){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = ".$uid);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$id = $results[0]['id'];
				$where = "";
			}else{
				return array("state" => 200, "info" => $langData['siteConfig'][21][119]);  //该会员暂未开通商铺！
			}
		}

		// $where .= " AND `expired` > ".GetMkTime(time());

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_list` WHERE `id` = ".$id.$where);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results) {

            $storeDetail["id"]    = $results[0]['id'];
            $storeDetail["uid"]   = $results[0]['uid'];
            $storeDetail["title"] = $results[0]['title'];
            $storeDetail["type"]  = $results[0]['type'];
            $storeDetail["click"]  = $results[0]['click'];

            $storeDetail["logoSource"] = $results[0]["logo"];
			$storeDetail["logo"]       = getFilePath($results[0]["logo"]);

			$storeDetail["mappicSource"] = $results[0]["mappic"];
            $storeDetail["mappic"]       = getFilePath($results[0]["mappic"]);

            $_uid = $results[0]['uid'];
			$memberInfo = getMemberDetail($_uid);
			$memberInfo = $memberInfo && is_array($memberInfo) ? $memberInfo : array();
			$memberPackage = $userLogin->getMemberPackage($_uid);
			$memberPackage = $memberPackage && is_array($memberPackage) ? $memberPackage : array();
			$memberModule = $userLogin->getMemberModule($_uid);
			$memberModule = $memberModule && is_array($memberModule) ? $memberModule : array();

			$arr = array_merge($memberInfo, $memberPackage, $memberModule);
            $storeDetail['member'] = $arr;

            $storeDetail["typeid"] = $results[0]['typeid'];
            global $data;
            $data    = "";
            $bustype = getParentArr("business_type", $results[0]['typeid']);
            if ($bustype) {
                $bustype                 = array_reverse(parent_foreach($bustype, "typename"));
                $storeDetail['typename'] = join(" > ", $bustype);
                $storeDetail['typenameArr'] = $bustype;
            } else {
                $storeDetail['typename'] = "";
                $storeDetail['typenameArr'] = array();
            }

            $storeDetail["addrid"] = $results[0]['addrid'];

            $addrids = $results[0]['addrid'] ? getPublicParentInfo(array('tab' => 'site_area', 'id' => $results[0]['addrid'], 'split' => ',')) : '';
            $storeDetail["addrids"] = explode(',', $addrids);
            
            $storeDetail["cityid"] = $results[0]['cityid'];
            $addrName = getParentArr("site_area", $results[0]['addrid']);
            global $data;
            $data = "";
            $addrArr = array_reverse(parent_foreach($addrName, "typename"));
            $addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
            $storeDetail['addrname'] = $addrArr;
            $storeDetail['addrnameList'] = join(" > ", $addrArr);

            $storeDetail["address"]    = $results[0]['address'];
            $storeDetail["lng"]        = $results[0]['lng'];
            $storeDetail["lat"]        = $results[0]['lat'];
            $storeDetail["lnglat"]     = $results[0]['lng'] . "," . $results[0]['lat'];
            $storeDetail["wechatname"] = $results[0]['wechatname'];
            $storeDetail["wechatcode"] = $results[0]['wechatcode'];

            $storeDetail["wechatqrSource"] = $results[0]['wechatqr'];
            $storeDetail["wechatqr"]       = getFilePath($results[0]["wechatqr"]);

            $tel = $results[0]['tel'] ? explode(",", $results[0]['tel']) : array();
            $qq = $results[0]['qq'] ? explode(",", $results[0]['qq']) : array();
            $email = $results[0]['email'] ? explode(",", $results[0]['email']) : array();

            //判断是否已经付过查看电话号码的费用
            $loginUserID = $uid;
            $loginUserInfo = $userinfo;
            $payPhoneState = $loginUserID == -1 ? 0 : 1;
            if($cfg_payPhoneState && in_array('business', $cfg_payPhoneModule) && $loginUserID != $results[0]['uid']){

                //判断是否开启了会员免费
                if($cfg_payPhoneVipFree && $loginUserInfo['level']){
                    $payPhoneState = 1;
                }
                else{
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_pay_phone` WHERE `module` = 'business' AND `temp` = 'detail' AND `uid` = '$loginUserID' AND `aid` = " . $results[0]['id']);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(!$ret){
                        $payPhoneState = 0;
                    }
                }
            }

            $storeDetail['payPhoneState'] = $payPhoneState; //当前信息是否支付过

			$_tel = $tel ? (!$payPhoneState && $cfg_payPhoneState && in_array('business', $cfg_payPhoneModule) ? '请先付费' : ($cfg_privatenumberState && in_array('business', $cfg_privatenumberModule) ? '请使用隐私号' : ($tel ? $tel[0] : ''))) : '';

            $storeDetail["tel"] = $loginUserID == $results[0]['uid'] ? $tel : $_tel;

			$storeDetail["qq"]       = $qq ? $qq[0] : "";
			$storeDetail["email"]    = $email ? $email[0] : "";
			$storeDetail["telArr"]   = $tel ? (!$payPhoneState && $cfg_payPhoneState && in_array('business', $cfg_payPhoneModule) ? array('请先付费') : ($cfg_privatenumberState && in_array('business', $cfg_privatenumberModule) ? array('请使用隐私号') : $tel)) : array();
			$storeDetail["qqArr"]    = $qq;
			$storeDetail["emailArr"] = $email;

			$storeDetail["videoSource"]     = $results[0]['video'];
			$storeDetail["video"]           = getFilePath($results[0]["video"]);
			$storeDetail["video_picSource"] = $results[0]["video_pic"];
			$storeDetail["video_pic"]       = $results[0]["video_pic"] ? getFilePath($results[0]["video_pic"]) : "";

            // 全景
			$storeDetail["qj_type"]   = $results[0]['qj_type'];
			$storeDetail["qj_file"]   = $results[0]['qj_file'];

			$storeDetail["tag"]       = $results[0]['tag'];

			$tagArr = array();
			$tagArr_ = $results[0]['tag'] ? explode('|', $results[0]['tag']) : array();
			if($tagArr_){
				foreach ($tagArr_ as $k => $v) {
					$tagArr[$k] = array(
						"py" => GetPinyin($v),
						"val" => $v
					);
				}
			}
			$storeDetail["tagArr"] = $tagArr;

			$storeDetail["tag_shop"]    = $results[0]['tag_shop'];
			$storeDetail["tag_shopArr"] = $results[0]['tag_shop'] ? explode('|', $results[0]['tag_shop']) : array();

            $bannerArr = array();
            $banner    = $results[0]['banner'];
            if (!empty($banner)) {
                $banner = explode(",", $banner);
                foreach ($banner as $key => $value) {
                    array_push($bannerArr, array("pic" => getFilePath($value), "picSource" => $value));
                }
            //如果没有维护banner，调相册前5张
            }else{
                $archives = $dsql->SetQuery("SELECT `litpic` FROM `#@__business_albums` WHERE `uid` = $id ORDER BY `id` DESC LIMIT 0, 5");
                $res  = $dsql->dsqlOper($archives, "results");
                if($res){
                    foreach ($res as $key => $val){
                        array_push($bannerArr, array("pic" => getFilePath($val['litpic']), "picSource" => $val['litpic']));
                    }
                }
            }
            $qualityArr = array();
            $quality    = $results[0]['quality'];
            if (!empty($quality)) {
                $quality = explode(",", $quality);
                foreach ($quality as $key => $value) {
                    array_push($qualityArr, array("pic" => getFilePath($value), "picSource" => $value));
                }
            }
            $storeDetail['quality'] = $qualityArr;
            $storeDetail['banner'] = $bannerArr;

			//相册数量
			$albums = 0;
			$archives = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__business_albums` WHERE `uid` = $id");
			$res  = $dsql->dsqlOper($archives, "results");
			if($res){
				$albums = $res[0]['totalCount'];
			}
			$storeDetail['albums'] = $albums;

            $picsArr = array();
            $pics    = $results[0]['pics'];
            if (!empty($pics)) {
                $pics = explode(",", $pics);
                foreach ($pics as $key => $value) {
                    array_push($picsArr, array("pic" => getFilePath($value), "picSource" => $value));
                }
            }
            $storeDetail['pics'] = $picsArr;

            $storeDetail["jingyingSource"] = $results[0]["jingying"];
            $storeDetail["jingying"]       = getFilePath($results[0]["jingying"]);

            $picsArr = array();
            $pics    = $results[0]['certify'];
            if (!empty($pics)) {
                $pics = explode(",", $pics);
                foreach ($pics as $key => $value) {
                    array_push($picsArr, array("pic" => getFilePath($value), "picSource" => $value));
                }
            }
            $storeDetail['certify'] = $picsArr;

            // $storeDetail["opentime"]         = str_replace(";", "-", $results[0]['opentime']);


			$openweek = explode(',', $results[0]['openweek']);
			$openweek_str = opentimeFormat($results[0]['openweek']);
			$opentimes = explode(',', $results[0]['opentimes']);
            $storeDetail["openweek"]         = $openweek;
            $storeDetail["openweek_str"]     = $openweek_str;
            $storeDetail["opentimes"]        = $opentimes;
            $storeDetail["opentimes_str"]    = join(' ', $opentimes);

			$storeDetail["opentime"] = ($openweek_str || $opentimes) ? ($openweek_str . ' ' . join(' ', $opentimes)) : '';

            $storeDetail["amount"]           = $results[0]['amount'];
            $storeDetail["parking"]          = $results[0]['parking'];
            $storeDetail["state"]            = $results[0]['state'];
            $storeDetail["pstate"]           = (int)$results[0]['pstate'];  //商家特权状态  1正常  0所有特权都已过期

            //店铺绑定的会员查看该接口时，输出联系人和拒审原因
            if($uid == $results[0]['uid']){
                $storeDetail["people"] = $results[0]['people'];
                $storeDetail["refuse"] = $results[0]['refuse'];
            }

            $storeDetail["pubdate"]          = $results[0]['pubdate'];
            $storeDetail["name"]             = $results[0]['name'];
            $storeDetail["areaCode"]         = $results[0]['areaCode'];
            $storeDetail["phone"]            = $results[0]['phone'];
            $storeDetail["email"]            = $results[0]['email'];
            $storeDetail["cardnum"]          = $results[0]['cardnum'];
            $storeDetail["company"]          = $results[0]['company'];
            $storeDetail["licensenum"]       = $results[0]['licensenum'];
            $storeDetail["licenseSource"]    = $results[0]['license'];
            $storeDetail["license"]          = getFilePath($results[0]['license']);
            $storeDetail["accountsSource"]   = $results[0]['accounts'];
            $storeDetail["accounts"]         = getFilePath($results[0]['accounts']);
            $storeDetail["cardfrontSource"]  = $results[0]['cardfront'];
            $storeDetail["cardfront"]        = getFilePath($results[0]['cardfront']);
            $storeDetail["cardbehindSource"] = $results[0]['cardbehind'];
            $storeDetail["cardbehind"]       = getFilePath($results[0]['cardbehind']);
            $storeDetail["body"]             = $results[0]['body'];
            $storeDetail["bodyStr"]          = cn_substrR(trim(preg_replace("/(\s|\&nbsp\;|　|\xc2\xa0)/", "", strip_tags($results[0]['body']))), 200);

			// 默认URL
			$param = array(
				"service"     => "business",
				"template"    => "detail",
				"id"          => $id
			);
			$storeDetail['url'] = getUrlPath($param);

            // $weekDay = "";
			//
			// if($results[0]['weeks']){
			// 	$spr = strstr($results[0]['weeks'], ';') ? ';' : ',';
			// 	$value_ = explode($spr, $results[0]['weeks']);
			// 	$weeks = array("周一","周二","周三","周四","周五","周六","周日");
			// 	if(count($value_) == 1){
			// 		$weekDay = $value_[0];
			// 	}else{
			// 		// $value_t = array();
			// 		// foreach ($value_ as $k => $v) {
			// 		// 	if($k == 0){
			// 		// 		$value_t[0] = $weeks[$v-1];
			// 		// 	}
			// 		// 	if($k > 0 && $k + 1 == count($value_)){
			// 		// 		$value_t[1] = $weeks[$v-1];
			// 		// 	}
			// 		// 	if($k > 0 && $v - $value_[$k-1] > 1){
			// 		// 		$value_t[0] = $weeks[$v-1];
			// 		// 		$value_t[1] = $weeks[$value_[0]-1];
			// 		// 		break;
			// 		// 	}
			// 		// }
			// 		$weekDay = $value_[0] ."至" . $value_[1];
			// 	}
			// }
            // $storeDetail["weeks"]   = $results[0]['weeks'];
			// $storeDetail["weekDay"] = $weekDay;


            //认证
            $auth = array();
            if ($results[0]['authattr']) {
				$authattr = explode(",", $results[0]['authattr']);
                foreach ($authattr as $k => $v) {
                    $sql = $dsql->SetQuery("SELECT `jc`, `typename` FROM `#@__business_authattr` WHERE `id` = $v");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        array_push($auth, array("jc" => $ret[0]['jc'], "typename" => $ret[0]['typename']));
                    }
                }
            }
            $storeDetail["auth"] = $auth;

            //点评
			$sql                    = $dsql->SetQuery("SELECT avg(`sco1`) r, count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'business' AND `aid` = " . $id . " AND `pid` = 0");
			$res                    = $dsql->dsqlOper($sql, "results");
			$comment                = $res[0]['c'];    //点评数量
			$sco1                   = $res[0]['r'];    //总评分
			$storeDetail['comment'] = $comment;
			$storeDetail['sco1']    = number_format($sco1, 1);

			$storeDetail['intro'] = $results[0]['body'];

			// $sql                    = $dsql->SetQuery("SELECT count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'business' AND `aid` = " . $id . " AND `sco1` = 1 AND `pid` = 0");
			// $res                    = $dsql->dsqlOper($sql, "results");
			// $storeDetail['sco1_1'] = $res[0]['c'];
			// $sql                    = $dsql->SetQuery("SELECT count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'business' AND `aid` = " . $id . " AND `sco1` = 2 AND `pid` = 0");
			// $res                    = $dsql->dsqlOper($sql, "results");
			// $storeDetail['sco1_2'] = $res[0]['c'];
			// $sql                    = $dsql->SetQuery("SELECT count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'business' AND `aid` = " . $id . " AND `sco1` = 3 AND `pid` = 0");
			// $res                    = $dsql->dsqlOper($sql, "results");
			// $storeDetail['sco1_3'] = $res[0]['c'];
			// $sql                    = $dsql->SetQuery("SELECT count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'business' AND `aid` = " . $id . " AND `sco1` = 4 AND `pid` = 0");
			// $res                    = $dsql->dsqlOper($sql, "results");
			// $storeDetail['sco1_4'] = $res[0]['c'];
			// $sql                    = $dsql->SetQuery("SELECT count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'business' AND `aid` = " . $id . " AND `sco1` = 5 AND `pid` = 0");
			// $res                    = $dsql->dsqlOper($sql, "results");
			// $storeDetail['sco1_5'] = $res[0]['c'];

			// 带图
			$sql                    = $dsql->SetQuery("SELECT count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'business' AND `aid` = " . $id . " AND `pics` != '' AND `pid` = 0");
			$res                    = $dsql->dsqlOper($sql, "results");
			$storeDetail['comment_pic'] = $res[0]['c'];

            // 自定义导航
            $custom_nav = array();
			if($results[0]['custom_nav']){
				$value_ = explode("|", $results[0]['custom_nav']);
				foreach ($value_ as $k => $v) {
					$d = explode(',', $v);
					$custom_nav[$k] = array(
						'icon' => $d[0] ? getFilePath($d[0]) : "",
						'iconSource' => $d[0],
						'title' => $d[1],
						'url' => $d[2],
					);
				}
			}
			$storeDetail['custom_nav'] = $custom_nav;


            //查询商家已开通的店铺
			$bind_module = $results[0]['bind_module'];
        	$bind_module = empty($bind_module) ? array() : explode(",", $bind_module);

			$storeArr = $storeInfo = array();

			// 商家获取各个店铺的链接
			// $store = checkShowModule($bind_module, 'show', '', 'getUrl', $results[0]['uid']);
			//
           	// $storeDetail['store'] = $store;

           	foreach ($bind_module as $k => $v) {
           		if(!isset($store[$v])){
           			unset($bind_module[$k]);
           		}
           	}
           	$storeDetail["bind_module"] = $bind_module;

           	//查询商家餐饮服务设置
			$storeDetail["diancan_state"]   = $results[0]['diancan_state'];
			$storeDetail["dingzuo_state"]   = $results[0]['dingzuo_state'];
			$storeDetail["paidui_state"]    = $results[0]['paidui_state'];
			$storeDetail["maidan_state"]    = $results[0]['maidan_state'];
			$storeDetail["maidan_youhui_open"]  = $results[0]['maidan_youhui_open'];
			$storeDetail["maidan_not_youhui_open"] = $results[0]['maidan_not_youhui_open'];
			$storeDetail["maidan_youhui_value"] = $results[0]['maidan_youhui_value'];
			$storeDetail["maidan_youhui_limit"] = $results[0]['maidan_youhui_limit'];
			$storeDetail["maidan_fenxiaoFee"]   = $results[0]['maidan_fenxiaoFee'];
			$storeDetail["maidan_XfenxiaoFee"]  = $results[0]['maidan_XfenxiaoFee'];

			$storeDetail["touch_skin"] = $results[0]['touch_skin'];

            // 输出到期时间
            if($uid == $results[0]['uid']){
            	$storeDetail['expired'] = $results[0]['expired'];

            	$now = GetMkTime(time());

            	if($results[0]['expired']){
        			$c = $results[0]['expired'] - $now;
            		if($c > 0){
	            		$days = floor(($c/86400)) + 1;
				        if($days < 30){
				        	$storeDetail['expiredFlor'] = $days."天";
				        }
				    }else{
				    	$storeDetail['expiredFlor'] = "已过期";
				    }
            	}
			}

            //验证是否已经收藏
			$params = array(
				"module" => "business",
				"temp"   => "detail",
				"type"   => "add",
				"id"     => $id,
				"check"  => 1
			);
			$collect = checkIsCollect($params);
			$storeDetail['collect'] = $collect == "has" ? 1 : 0;

			//是否有企业建站
			// $sql = $dsql->SetQuery("SELECT `id` FROM `#@__website` where `userid` = " . $results[0]['uid']);
			// $res = $dsql->dsqlOper($sql, "results");
			// if(!empty($res[0]['id'])){
			// 	$param = array(
			// 		"service"      => "website",
			// 		"template"     => "site".$res[0]['id']
			// 	);
			// 	$url = getUrlPath($param);
			// 	$storeDetail["websiteUrl"] = $url;
			// }

			//商家小程序码
			if($memberPackage['package'] && $memberPackage['package']['moduleList'] && in_array('xiaochengxu', $memberPackage['package']['moduleList'])){
				$param = array(
					"service"     => "business",
					"template"    => "detail",
					"id"          => $id
				);
				$burl = getUrlPath($param);

				$sql = $dsql->SetQuery("SELECT `id`, `fid` FROM `#@__site_wxmini_scene` WHERE `url` = '$burl'");
				$ret = $dsql->dsqlOper($sql, "results");
				if(!empty($ret[0]['id'])){
					$storeDetail["businessQr"] = $ret[0]['fid'];
				}else{
					$storeDetail["businessQr"] = createWxMiniProgramScene($burl, HUONIAOROOT, true);
				}
			}

			//短视频推广信息
			$short_video_promote = trim($results[0]['short_video_promote']);

			//如果为空，取分站的，如果分站为空，取平台设置的
			if($short_video_promote == ''){
				global $siteCityAdvancedConfig;
				if($siteCityAdvancedConfig['business']['short_video_promote']){
					$short_video_promote = $siteCityAdvancedConfig['business']['short_video_promote'];
				}else{
					require(HUONIAOINC . "/config/business.inc.php");
					$short_video_promote = $customShort_video_promote;
				}
			}
			$storeDetail["short_video_promote"] = addslashes($short_video_promote);

            //print_r($storeDetail);die;
            return $storeDetail;
        }
	}


	/**
     * 商家介绍列表
     * @return array
     */
	public function introList(){
		global $dsql;
		global $userLogin;
		$pageinfo = $list = array();
		$uid = $page = $pageSize = $where = $where1 = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$uid      = $this->param['uid'];
				$orderby  = $this->param['orderby'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if(!$uid){
			return array("state" => 200, "info" => '格式错误！');
		}

		$archives = $dsql->SetQuery("SELECT a.`id`, a.`title`, a.`body`, a.`click`, a.`pubdate`, b.`id` bid FROM `#@__business_about` a LEFT JOIN `#@__business_list` b ON b.`id` = a.`uid` WHERE a.`uid` = $uid ORDER BY a.`weight` DESC, a.`id` ASC");
		$results = $dsql->dsqlOper($archives, "results");

		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']      = $val['id'];
				$list[$key]['title']   = $val['title'];
				$list[$key]['body']    = $val['body'];
				$list[$key]['click']   = $val['click'];
				$list[$key]['pubdate'] = $val['pubdate'];

				$param = array(
					"service"  => "business",
					"template" => "intro",
					"bid"      => $val['bid'],
					"id"       => $val['id']
				);
				$list[$key]['url'] = getUrlPath($param);
			}
		}

		return $list;
	}


	/**
     * 商家介绍详细
     * @return array
     */
	public function introDetail(){
		global $dsql;
		global $userLogin;
		$introDetail = array();
		$id = $this->param;

		if(!is_numeric($id)){
			return array("state" => 200, "info" => '格式错误！');
		}

		$archives = $dsql->SetQuery("SELECT a.*, b.`id` bid FROM `#@__business_about` a LEFT JOIN `#@__business_list` b ON b.`id` = a.`uid` WHERE a.`id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$introDetail["id"]      = $results[0]['id'];
			$introDetail["title"]   = $results[0]['title'];
			$introDetail["body"]    = $results[0]['body'];
			$introDetail["click"]   = $results[0]['click'];
			$introDetail["pubdate"] = $results[0]['pubdate'];
			$introDetail["bid"]     = $results[0]['bid'];
		}
		return $introDetail;
	}


	/**
     * 商家动态分类
     * @return array
     */
	public function news_type(){
		global $dsql;
		global $userLogin;
		$pageinfo = $list = array();
		$uid = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$uid = $this->param['uid'];
			}
		}

		if(!$uid){
			return array("state" => 200, "info" => '格式错误！');
		}

		$archives = $dsql->SetQuery("SELECT t.`id`, t.`typename`, b.`id` bid FROM `#@__business_news_type` t LEFT JOIN `#@__business_list` b ON b.`id` = t.`uid` WHERE t.`uid` = $uid ORDER BY t.`weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");

		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']      = $val['id'];
				$list[$key]['typename']   = $val['typename'];
				$param = array(
					"service"  => "business",
					"template" => "news",
					"bid"      => $val['bid'],
					"id"       => $val['id']
				);
				$list[$key]['url'] = getUrlPath($param);
			}
		}

		return $list;
	}


	/**
     * 商家动态
     * @return array
     */
	 public function news_list(){
 		global $dsql;
 		global $userLogin;
		global $langData;
 		$pageinfo = $list = array();
 		$uid = $typeid = $page = $pageSize = $where = $where1 = "";

 		if(!empty($this->param)){
 			if(!is_array($this->param)){
 				return array("state" => 200, "info" => '格式错误！');
 			}else{
 				$uid      = $this->param['uid'];
 				$typeid   = $this->param['typeid'];
 				$page     = $this->param['page'];
 				$pageSize = $this->param['pageSize'];
 			}
 		}

		//会员ID
		if(empty($uid)){
			return array("state" => 200, "info" => '格式错误！');
		}

		$where .= " AND n.`uid` = $uid";

		//分类
		if(!empty($typeid)){
			$where .= " AND n.`typeid` = $typeid";
		}

 		$pageSize = empty($pageSize) ? 10 : $pageSize;
 		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT n.`id`, n.`typeid`, n.`title`,n.`body`, n.`click`, n.`pubdate`, l.`id` bid FROM `#@__business_news` n LEFT JOIN `#@__business_list` l ON l.`id` = n.`uid` WHERE 1 = 1".$where);

 		//总条数
 		$totalCount = $dsql->dsqlOper($archives, "totalCount");

 		//总分页数
 		$totalPage = ceil($totalCount/$pageSize);

 		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

 		$pageinfo = array(
 			"page" => $page,
 			"pageSize" => $pageSize,
 			"totalPage" => $totalPage,
 			"totalCount" => $totalCount
 		);

		$order = " ORDER BY n.`id` DESC";

 		$atpage = $pageSize*($page-1);
 		$where = " LIMIT $atpage, $pageSize";
 		$results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");

 		if($results){
 			foreach($results as $key => $val){
 				$list[$key]['id']    = $val['id'];
 				$list[$key]['title'] = $val['title'];

 				$list[$key]['typeid']   = $val['typeid'];
 				$list[$key]['body']     = cn_substrR(strip_tags($val['body']), 100);
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_news_type` WHERE `id` = ".$val['typeid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
	 				$list[$key]['typename'] = $ret[0]['typename'];
				}else{
					$list[$key]['typename'] = "";
				}

				$param = array(
 					"service"  => "business",
 					"template" => "news",
					"bid"      => $val['bid'],
 					"id"       => $val['id']
 				);
 				$list[$key]['typeurl'] = getUrlPath($param);

 				$list[$key]['click']   = $val['click'];
 				$list[$key]['pubdate'] = $val['pubdate'];
 				$list[$key]['bid']     = $val['bid'];

 				$param = array(
 					"service"     => "business",
 					"template"    => "newsd",
 					"bid"         => $val['bid'],
 					"id"          => $val['id']
 				);
 				$list[$key]['url'] = getUrlPath($param);
 			}
 		}

 		return array("pageInfo" => $pageinfo, "list" => $list);
 	}


	/**
     * 商家动态详细
     * @return array
     */
	public function news_detail(){
		global $dsql;
		global $userLogin;
		$newsDetail = array();
		$id = $this->param;

		if(!is_numeric($id)){
			return array("state" => 200, "info" => '格式错误！');
		}

		$archives = $dsql->SetQuery("SELECT n.*, b.`id` bid FROM `#@__business_news` n LEFT JOIN `#@__business_list` b ON b.`id` = n.`uid` WHERE n.`id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$newsDetail["id"]      = $results[0]['id'];
			$newsDetail["typeid"]  = $results[0]['typeid'];
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_news_type` WHERE `id` = ".$results[0]['typeid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$newsDetail['typename'] = $ret[0]['typename'];
			}else{
				$newsDetail['typename'] = "";
			}
			$newsDetail["title"]   = $results[0]['title'];
			$newsDetail["body"]    = $results[0]['body'];
			$newsDetail["click"]   = $results[0]['click'];
			$newsDetail["pubdate"] = $results[0]['pubdate'];
			$newsDetail["bid"]     = $results[0]['bid'];
		}
		return $newsDetail;
	}


	/**
     * 商家相册分类
     * @return array
     */
	public function albums_type(){
		global $dsql;
		global $userLogin;
		$pageinfo = $list = array();
		$uid = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$uid = $this->param['uid'];
			}
		}

		if(!$uid){
			return array("state" => 200, "info" => '格式错误！');
		}

		$archives = $dsql->SetQuery("SELECT t.`id`, t.`typename`, b.`id` bid FROM `#@__business_albums_type` t LEFT JOIN `#@__business_list` b ON b.`id` = t.`uid` WHERE t.`uid` = $uid ORDER BY t.`weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");

		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']      = $val['id'];
				$list[$key]['typename']   = $val['typename'];
				$param = array(
					"service"  => "business",
					"template" => "albums",
					"bid"      => $val['bid'],
					"id"       => $val['id']
				);
				$list[$key]['url'] = getUrlPath($param);

				//照片数量
				$count = 0;
				$sql = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__business_albums` WHERE `uid` = $uid AND `typeid` = ".$val['id']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$count = $ret[0]['totalCount'];
				}
				$list[$key]['count'] = $count;

				//查询相册的封面
				$litpic = "";
				$sql = $dsql->SetQuery("SELECT `litpic` FROM `#@__business_albums` WHERE `uid` = $uid AND `typeid` = ".$val['id']." AND `face` = 1 ORDER BY `id` ASC");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$litpic = getFilePath($ret[0]['litpic']);
				}else{
					$sql = $dsql->SetQuery("SELECT `litpic` FROM `#@__business_albums` WHERE `uid` = $uid AND `typeid` = ".$val['id']." ORDER BY `id` ASC");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$litpic = getFilePath($ret[0]['litpic']);
					}
				}

				$list[$key]['litpic'] = $litpic;
			}
		}

		return $list;
	}


	/**
     * 商家相册
     * @return array
     */
	 public function albums_list(){
 		global $dsql;
 		global $userLogin;
		global $langData;
 		$pageinfo = $list = array();
 		$uid = $typeid = $page = $pageSize = $where = $where1 = "";

 		if(!empty($this->param)){
 			if(!is_array($this->param)){
 				return array("state" => 200, "info" => '格式错误！');
 			}else{
 				$uid      = $this->param['uid'];
 				$u        = (int)$this->param['u'];
 				$typeid   = $this->param['typeid'];
 				$page     = $this->param['page'];
 				$pageSize = $this->param['pageSize'];
 			}
 		}

 		if($u){
 			$userid = $userLogin->getMemberID();
 			if($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

 			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $userid");
 			$ret = $dsql->dsqlOper($sql, "results");
 			if($ret){
 				$uid = $ret[0]['id'];
 			}else{
 				return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
 			}
 		}
		//会员ID
		if(empty($uid)){
			return array("state" => 200, "info" => '格式错误！');
		}

		$where .= " AND a.`uid` = $uid";

		//分类
		if(!empty($typeid)){
			$where .= " AND a.`typeid` = $typeid";
		}

 		$pageSize = empty($pageSize) ? 10 : $pageSize;
 		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT a.`id`, a.`typeid`, a.`litpic`, a.`pubdate`, a.`face`, l.`id` bid FROM `#@__business_albums` a LEFT JOIN `#@__business_list` l ON l.`id` = a.`uid` WHERE 1 = 1".$where);

 		//总条数
 		$totalCount = $dsql->dsqlOper($archives, "totalCount");

 		//总分页数
 		$totalPage = ceil($totalCount/$pageSize);

 		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

 		$pageinfo = array(
 			"page" => $page,
 			"pageSize" => $pageSize,
 			"totalPage" => $totalPage,
 			"totalCount" => $totalCount
 		);

		$order = " ORDER BY a.`id` DESC";

 		$atpage = $pageSize*($page-1);
 		$where = " LIMIT $atpage, $pageSize";
 		$results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");

 		if($results){
 			$checkFace = array();
 			foreach($results as $key => $val){
 				$list[$key]['id']    = $val['id'];

 				$face = $val['face'];
 				// 不是封面时判断当前分类是否设置了封面
 				if($face == 0 && $u){
 					if(isset($checkFace[$val['typeid']])){
 						$face = $checkFace[$val['typeid']];
 					}else{
	 					$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_albums` WHERE `typeid` = '".$val['typeid']."' AND `face` != 0");
	 					$ret = $dsql->dsqlOper($sql, "results");
	 					// 存在封面
	 					if($ret){
	 						$r = 0;
						// 没有设置封面
	 					}else{
	 						$face = 1;
	 						$r = 1;
	 					}
	 					$checkFace[$val['typeid']] = $r;
	 				}
 				}
 				if(!$u) $face = 1;
 				$list[$key]['face']  = $face;

 				$list[$key]['typeid']   = $val['typeid'];
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_albums_type` WHERE `id` = ".$val['typeid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
	 				$list[$key]['typename'] = $ret[0]['typename'];
				}else{
					$list[$key]['typename'] = "";
				}

				$param = array(
 					"service"  => "business",
 					"template" => "albums",
					"bid"      => $val['bid'],
 					"id"       => $val['id']
 				);
 				$list[$key]['typeurl'] = getUrlPath($param);

 				$list[$key]['litpicSource'] = $val['litpic'];
 				$list[$key]['litpic']  = !empty($val['litpic']) ? getFilePath($val['litpic']) : "";
 				$list[$key]['pubdate'] = $val['pubdate'];
 				$list[$key]['bid']     = $val['bid'];

 				$param = array(
 					"service"     => "business",
 					"template"    => "albumsd",
 					"bid"         => $val['bid'],
 					"id"          => $val['id']
 				);
 				$list[$key]['url'] = getUrlPath($param);
 			}
 		}

 		return array("pageInfo" => $pageinfo, "list" => $list);
 	}


	/**
     * 商家相册详细
     * @return array
     */
	public function albums_detail(){
		global $dsql;
		global $userLogin;
		$newsDetail = array();
		$id = $this->param;

		if(!is_numeric($id)){
			return array("state" => 200, "info" => '格式错误！');
		}

		$archives = $dsql->SetQuery("SELECT a.*, b.`id` bid FROM `#@__business_albums` a LEFT JOIN `#@__business_list` b ON b.`id` = a.`uid` WHERE a.`id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$newsDetail["id"]      = $results[0]['id'];
			$newsDetail["typeid"]  = $results[0]['typeid'];
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_albums_type` WHERE `id` = ".$results[0]['typeid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$newsDetail['typename'] = $ret[0]['typename'];
			}else{
				$newsDetail['typename'] = "";
			}
			$newsDetail["litpic"]  = !empty($results[0]['litpic']) ? getFilePath($results[0]['litpic']) : "";
			$newsDetail["pubdate"] = $results[0]['pubdate'];
			$newsDetail["bid"]     = $results[0]['bid'];
		}
		return $newsDetail;
	}


	/**
     * 商家视频
     * @return array
     */
	 public function video_list(){
 		global $dsql;
 		global $userLogin;
		global $langData;
 		$pageinfo = $list = array();
 		$uid = $page = $pageSize = $where = $where1 = "";

 		if(!empty($this->param)){
 			if(!is_array($this->param)){
 				return array("state" => 200, "info" => '格式错误！');
 			}else{
 				$uid      = $this->param['uid'];
 				$page     = $this->param['page'];
 				$pageSize = $this->param['pageSize'];
 			}
 		}

		//会员ID
		if(empty($uid)){
			return array("state" => 200, "info" => '格式错误！');
		}

		$where .= " AND v.`uid` = $uid";

 		$pageSize = empty($pageSize) ? 10 : $pageSize;
 		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT v.`id`, v.`title`, v.`video`, v.`litpic`, v.`pubdate`, l.`id` bid FROM `#@__business_video` v LEFT JOIN `#@__business_list` l ON l.`id` = v.`uid` WHERE 1 = 1".$where);

 		//总条数
 		$totalCount = $dsql->dsqlOper($archives, "totalCount");

 		//总分页数
 		$totalPage = ceil($totalCount/$pageSize);

 		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

 		$pageinfo = array(
 			"page" => $page,
 			"pageSize" => $pageSize,
 			"totalPage" => $totalPage,
 			"totalCount" => $totalCount
 		);

		$order = " ORDER BY v.`id` DESC";

 		$atpage = $pageSize*($page-1);
 		$where = " LIMIT $atpage, $pageSize";
 		$results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");

 		if($results){
 			foreach($results as $key => $val){
 				$list[$key]['id']      = $val['id'];
				$list[$key]['title']   = $val['title'];
 				$list[$key]['litpic']  = !empty($val['litpic']) ? getFilePath($val['litpic']) : "";
 				$list[$key]['pubdate'] = $val['pubdate'];
				$list[$key]['bid']     = $val['bid'];
				$list[$key]['video']   = $val['video'];

 				$param = array(
 					"service"     => "business",
 					"template"    => "videod",
 					"bid"         => $val['bid'],
 					"id"          => $val['id']
 				);
 				$list[$key]['url'] = getUrlPath($param);
 			}
 		}

 		return array("pageInfo" => $pageinfo, "list" => $list);
 	}


	/**
     * 商家视频详细
     * @return array
     */
	public function video_detail(){
		global $dsql;
		global $userLogin;
		$videoDetail = array();
		$id = $this->param;

		if(!is_numeric($id)){
			return array("state" => 200, "info" => '格式错误！');
		}

		$archives = $dsql->SetQuery("SELECT v.*, b.`id` bid FROM `#@__business_video` v LEFT JOIN `#@__business_list` b ON b.`id` = v.`uid` WHERE v.`id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$videoDetail["id"]      = $results[0]['id'];
			$videoDetail["title"]   = $results[0]['title'];
			$videoDetail["litpic"]  = !empty($results[0]['litpic']) ? getFilePath($results[0]['litpic']) : "";

			$video = getRealVideoUrl($results[0]['video']);

			$videoDetail["mp4"]   = strstr($video, 'mp4') ? 1 : 0;
			$videoDetail["videoSource"] = $video;
			$videoDetail["video"]   = $results[0]['video'];
			$videoDetail["pubdate"] = $results[0]['pubdate'];
			$videoDetail["bid"]     = $results[0]['bid'];
		}
		return $videoDetail;
	}


	/**
     * 商家全景
     * @return array
     */
	 public function panor_list(){
 		global $dsql;
 		global $userLogin;
		global $langData;
 		$pageinfo = $list = array();
 		$uid = $page = $pageSize = $where = $where1 = "";

 		if(!empty($this->param)){
 			if(!is_array($this->param)){
 				return array("state" => 200, "info" => '格式错误！');
 			}else{
 				$uid      = $this->param['uid'];
 				$page     = $this->param['page'];
 				$pageSize = $this->param['pageSize'];
 			}
 		}

		//会员ID
		if(empty($uid)){
			return array("state" => 200, "info" => '格式错误！');
		}

		$where .= " AND v.`uid` = $uid";

 		$pageSize = empty($pageSize) ? 10 : $pageSize;
 		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT v.`id`, v.`title`, v.`panor`, v.`litpic`, v.`pubdate`, l.`id` bid FROM `#@__business_panor` v LEFT JOIN `#@__business_list` l ON l.`id` = v.`uid` WHERE 1 = 1".$where);

 		//总条数
 		$totalCount = $dsql->dsqlOper($archives, "totalCount");

 		//总分页数
 		$totalPage = ceil($totalCount/$pageSize);

 		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

 		$pageinfo = array(
 			"page" => $page,
 			"pageSize" => $pageSize,
 			"totalPage" => $totalPage,
 			"totalCount" => $totalCount
 		);

		$order = " ORDER BY v.`id` DESC";

 		$atpage = $pageSize*($page-1);
 		$where = " LIMIT $atpage, $pageSize";
 		$results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");

 		if($results){
 			foreach($results as $key => $val){
 				$list[$key]['id']      = $val['id'];
				$list[$key]['title']   = $val['title'];
 				$list[$key]['litpic']  = !empty($val['litpic']) ? getFilePath($val['litpic']) : "";
 				$list[$key]['pubdate'] = $val['pubdate'];
				$list[$key]['bid']     = $val['bid'];
				$list[$key]['panor']   = $val['panor'];

 				$param = array(
 					"service"     => "business",
 					"template"    => "panord",
 					"id"          => $val['id'],
					"param"       => "bid=" . $val['bid']
 				);
 				$list[$key]['url'] = getUrlPath($param);
 			}
 		}

 		return array("pageInfo" => $pageinfo, "list" => $list);
 	}


	/**
     * 商家全景详细
     * @return array
     */
	public function panor_detail(){
		global $dsql;
		global $userLogin;
		$panorDetail = array();
		$id = $this->param;

		if(!is_numeric($id)){
			return array("state" => 200, "info" => '格式错误！');
		}

		$archives = $dsql->SetQuery("SELECT v.*, b.`id` bid FROM `#@__business_panor` v LEFT JOIN `#@__business_list` b ON b.`id` = v.`uid` WHERE v.`id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$panorDetail["id"]      = $results[0]['id'];
			$panorDetail["title"]   = $results[0]['title'];
			$panorDetail["litpic"]  = !empty($results[0]['litpic']) ? $results[0]['litpic'] : "";
			$panorDetail["panor"]   = $results[0]['panor'];
			$panorDetail["pubdate"] = $results[0]['pubdate'];
			$panorDetail["bid"]     = $results[0]['bid'];
		}
		return $panorDetail;
	}


	/**
		* 配置商铺
		* @return array
		*/
	public function storeConfig(){
	  	global $dsql;
		global $userLogin;
		global $langData;

		$userid = $userLogin->getMemberID();
		if($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$sql = $dsql->SetQuery("SELECT `id`, `state`, `type` FROM `#@__business_list` WHERE `uid` = $userid AND `state` != 4");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$busiDetail = $ret[0];
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][157]);  //您还没有入驻商家
		}

		$param      = $this->param;
		$title      = filterSensitiveWords($param['title']);
		$tel        = $param['tel'];
		$qq         = $param['qq'];
		$email      = $param['email'];
		$company    = filterSensitiveWords($param['company']);
		$addrid     = $param['addrid'];
		$cityid     = $param['cityid'];
		$address    = filterSensitiveWords($param['address']);
		$logo       = $param['logo'];
		$wechatname = filterSensitiveWords($param['wechatname']);
		$wechatcode = filterSensitiveWords($param['wechatcode']);
		$wechatqr   = $param['wechatqr'];

		// if(empty($tel)) return array("state" => 200, "info" => $langData['siteConfig'][20][433]);  //请输入电话！
		// if(empty($email)) return array("state" => 200, "info" => $langData['siteConfig'][21][36]);  //请输入邮箱地址！
		if(empty($company)) return array("state" => 200, "info" => $langData['siteConfig'][20][274]);  //请填写公司名称
		if(empty($addrid)) return array("state" => 200, "info" => $langData['siteConfig'][20][134]);  //请选择区域！
		if(empty($address)) return array("state" => 200, "info" => $langData['siteConfig'][21][69]);  //请输入详细地址！
		if(empty($logo)) return array("state" => 200, "info" => $langData['siteConfig'][21][129]);  //请上传LOGO

		if(!is_array($tel)){
			$tel = array($tel);
		}
		$tel = array_filter($tel, function($v){
			return !empty($v);
		});
		if(!is_array($qq)){
			$qq = array($qq);
		}
		$qq = array_filter($qq, function($v){
			return !empty($v);
		});
		// if(empty($tel)) return array("state" => 200, "info" => $langData['siteConfig'][20][433]);  //请输入电话！
		if(!is_array($email)){
			$email = array($email);
		}
		$email = array_filter($email, function($v){
			preg_match('/\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+/', $v, $matchEmail);
			return $matchEmail;
		});
		// if(empty($email)) return array("state" => 200, "info" => $langData['siteConfig'][20][497]);  //请输入正确的邮箱地址！

		$tel = join(",", $tel);
		$qq = join(",", $qq);
		$email = join(",", $email);

		$nowState = $busiDetail['state'];

        //入驻审核开关
		include HUONIAOINC."/config/business.inc.php";
		$editJoinCheck = (int)$customEditJoinCheck;

        //如果当前状态是待审核的，即使后台设置了修改商家资料不需要审核，这里也需要强制为待审核
        //解决商家新入驻时需要审核，然后商家修改资料后直接审核通过的问题
        if(!$nowState){
            $editJoinCheck = 0;
        }

		$sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `title` = '$title', `company` = '$company', `tel` = '$tel', `qq` = '$qq', `email` = '$email', `cityid` = '$cityid', `addrid` = '$addrid', `address` = '$address', `logo` = '$logo', `wechatname` = '$wechatname', `wechatcode` = '$wechatcode', `wechatqr` = '$wechatqr', `state` = $editJoinCheck WHERE `uid` = $userid");
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == "ok"){
			$param = array(
				"service" => "member",
				"type" => "user",
			);
			if($nowState == "3"){
				$param['template'] = "enter-review";
			}
			if($nowState == "1"){
				$param['type'] = "";
			}

            $urlParam = array(
                'service' => 'business',
                'template' => 'detail',
                'id' => $busiDetail['id']
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'business', '', $busiDetail['id'], 'update', '更新商家资料', $url, $sql);

			return getUrlPath($param);
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][132]);  //配置失败，请查检您输入的信息是否符合要求！
		}

	}


	/**
     * 动态分类
     * @return array
     */
	public function newstype(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid  = $userLogin->getMemberID();

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__business_news_type` WHERE `uid` = $business ORDER BY `weight` ASC");
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			return $results;
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][134]);  //暂无相关分类！
		}

	}




	/**
		* 更新动态分类
		* @return array
		*/
	public function updateNewsType(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid = $userLogin->getMemberID();
		$data = $_POST['data'];

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		if(empty($data)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][135]);  //请添加分类！
		}

		$data = str_replace("\\", '', $data);
		$json = json_decode($data);
		$json = objtoarr($json);

		foreach ($json as $key => $value) {
			$id     = $value['id'];
			$weight = $value['weight'];
			$val    = $value['val'];

			//更新
			if(is_numeric($id)){
				$sql = $dsql->SetQuery("UPDATE `#@__business_news_type` SET `typename` = '$val', `weight` = '$weight' WHERE `uid` = $business AND `id` = $id");
				$ret = $dsql->dsqlOper($sql, "update");
            
                //记录用户行为日志
                memberLog($userid, 'business', 'newsType', $id, 'update', '更新商家动态分类('.$val.')', '', $sql);

			//新增
			}else{
				$sql = $dsql->SetQuery("INSERT INTO `#@__business_news_type` (`uid`, `typename`, `weight`) VALUES ('$business', '$val', '$weight')");
				$ret = $dsql->dsqlOper($sql, "lastid");
            
                //记录用户行为日志
                memberLog($userid, 'business', 'newsType', $ret, 'insert', '新增商家动态分类('.$val.')', '', $sql);
			}
		}

		return $langData['siteConfig'][6][39];  //保存成功


	}




	/**
		* 删除动态分类
		* @return array
		*/
	public function delNewsType(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid = $userLogin->getMemberID();
		$id  = $this->param['id'];

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		if(empty($id)){
			return array("state" => 200, "info" => $langData['siteConfig'][20][300]);  //删除失败！
		}

		$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__business_news_type` WHERE `id` = $id AND `uid` = ".$business);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
            $typename = $ret[0]['typename'];

			$sql = $dsql->SetQuery("DELETE FROM `#@__business_news` WHERE `typeid` = ".$id);
			$dsql->dsqlOper($sql, "update");

			$sql = $dsql->SetQuery("DELETE FROM `#@__business_news_type` WHERE `id` = ".$id);
			$dsql->dsqlOper($sql, "update");
            
            //记录用户行为日志
            memberLog($userid, 'business', 'newsType', $id, 'delete', '删除商家动态分类('.$typename.')', '', $sql);

			return $langData['siteConfig'][21][136];  //删除成功！
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][137]);  //分类验证失败！
		}

	}


	/**
     * 动态信息
     * @return array
     */
	public function news(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid   = $userLogin->getMemberID();
		$pageinfo = $list = array();
		$typeid = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$typeid   = (int)$this->param['typeid'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}

		$business = $userResult[0]['id'];

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$where = " WHERE `uid` = $business";

		//类型
		if($typeid != ""){
			$where .= " AND `typeid` = $typeid";
		}

		$orderby = " ORDER BY `id` DESC";
		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_news`".$where.$orderby);

		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$results = $dsql->dsqlOper($archives.$where, "results");
		$list = array();
		if($results){

			foreach($results as $key => $val){

				$list[$key]['id'] = $val['id'];
				$list[$key]['typeid'] = $val['typeid'];

				$typeName = "";
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_news_type` WHERE `id` = ".$val['typeid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$typeName = $ret[0]['typename'];
				}
				$list[$key]['typename'] = $typeName;

				$list[$key]['title'] = $val['title'];
				$list[$key]['click']  = $val['click'];
				$list[$key]['pubdate'] = $val['pubdate'];
				$list[$key]['body'] = cn_substrR(strip_tags($val['body']), 100);

				$param = array(
					"service"  => "business",
					"template" => "newsd",
                    "business" => $business,
					"id"       => $val['id']
				);
				$list[$key]['url']     = getUrlPath($param);

			}
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][138]);   //暂无相关数据！
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
     * 新闻详细信息
     * @return array
     */
	public function newsDetail(){
		global $dsql;
		$id = $this->param;

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_news` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

			//信息分类
			$typename = "";
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_news_type` WHERE `id` = ".$results[0]['typeid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$typename = $ret[0]['typename'];
			}
			$results[0]['typename'] = $typename;

			return $results[0];
		}else{
			return array("state" => 200, "info" => '分类不存在！');
		}
	}


	/**
		* 新增动态信息
		* @return array
		*/
	public function addnews(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid  = $userLogin->getMemberID();
		$param   = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$typeid      = (int)($param['typeid']);
		$body        = filterSensitiveWords($param['body'], false);
		$pubdate     = GetMkTime(time());

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		if(empty($title)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][139]);  //请输入信息标题
		}

		if(empty($typeid)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][140]);  //请选择信息分类
		}

		if(empty($body)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][141]);  //请输入信息内容
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__business_news` (`uid`, `typeid`, `title`, `body`, `click`, `pubdate`) VALUES ('$business', '$typeid', '$title', '$body', '0', '$pubdate')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($aid)){

            $urlParam = array(
                "service"  => "business",
                "template" => "newsd",
                "business" => $business,
                "id"       => $aid
            );
            $url = getUrlPath($urlParam);
            
            //记录用户行为日志
            memberLog($userid, 'business', 'news', $aid, 'insert', '新增商家动态('.$aid.'=>'.$title.')', $url, $archives);

			return $aid;
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][142]);  //发布到数据时发生错误，请检查字段内容！
		}

	}



	/**
		* 修改动态信息
		* @return array
		*/
	public function editnews(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid  = $userLogin->getMemberID();
		$param   = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$id          = (int)($param['id']);
		$typeid      = (int)($param['typeid']);
		$body        = filterSensitiveWords($param['body']);

		if(empty($id)){
			return array("state" => 200, "info" => '请选择要修改的信息！');
		}

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		if(empty($title)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][139]);  //请输入信息标题
		}

		if(empty($typeid)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][140]);  //请选择信息分类
		}

		if(empty($body)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][141]);  //请输入信息内容
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__business_news` SET `title` = '$title', `typeid` = '$typeid', `body` = '$body' WHERE `uid` = $business AND `id` = ".$id);
		$ret = $dsql->dsqlOper($archives, "update");

		if($ret == "ok"){

            $urlParam = array(
                "service"  => "business",
                "template" => "newsd",
                "business" => $business,
                "id"       => $id
            );
            $url = getUrlPath($urlParam);
            
            //记录用户行为日志
            memberLog($userid, 'business', 'news', $id, 'update', '更新商家动态('.$id.'=>'.$title.')', $url, $archives);

			return $langData['siteConfig'][20][229];  //修改成功！
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][142]);  //发布到数据时发生错误，请检查字段内容！
		}

	}


	/**
		* 删除动态信息
		* @return array
		*/
	public function delnews(){
		global $dsql;
		global $userLogin;
		global $langData;

		$id = $this->param['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//获取用户ID
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_news` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results = $results[0];
			if($results['uid'] == $business){
				$archives = $dsql->SetQuery("DELETE FROM `#@__business_news` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");
            
                //记录用户行为日志
                memberLog($userid, 'business', 'news', $id, 'delete', '删除商家动态('.$id.')', '', $archives);

				return $langData['siteConfig'][21][136];  //删除成功！

			}else{
				return array("state" => 101, "info" => $langData['siteConfig'][21][143]);  //权限不足，请确认帐户信息后再进行操作！
			}
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][144]);  //信息不存在，或已经删除！
		}

	}


	/**
     * 介绍信息
     * @return array
     */
	public function about(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid   = $userLogin->getMemberID();
		$pageinfo = $list = array();
		$typeid = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}

		$business = $userResult[0]['id'];

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$where = " WHERE `uid` = $business";

		$orderby = " ORDER BY `weight` DESC, `id` DESC";
		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_about`".$where.$orderby);

		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$results = $dsql->dsqlOper($archives.$where, "results");
		$list = array();
		if($results){

			foreach($results as $key => $val){

				$list[$key]['id'] = $val['id'];
				$list[$key]['title'] = $val['title'];
				$list[$key]['click']  = $val['click'];
				$list[$key]['pubdate'] = $val['pubdate'];
				$list[$key]['body'] = cn_substrR(strip_tags($val['body']), 100);

				$param = array(
					"service"  => "business",
					"template" => "intro",
					"business" => $business,
					"id"       => $val['id']
				);
				$list[$key]['url']     = getUrlPath($param);

			}
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][138]);  //暂无相关数据！
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
     * 介绍详细信息
     * @return array
     */
	public function aboutDetail(){
		global $dsql;
		$id = $this->param;

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_about` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			return $results[0];
		}else{
			return array("state" => 200, "info" => '信息不存在！');
		}
	}


	/**
		* 新增介绍信息
		* @return array
		*/
	public function addabout(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid  = $userLogin->getMemberID();
		$param   = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$body        = filterSensitiveWords($param['body']);
		$weight      = (int)$param['weight'];
		$pubdate     = GetMkTime(time());

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		if(empty($title)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][139]);  //请输入信息标题
		}

		if(empty($body)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][141]);  //请输入信息内容
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__business_about` (`uid`, `title`, `body`, `weight`, `click`, `pubdate`) VALUES ('$business', '$title', '$body', '$weight', '0', '$pubdate')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($aid)){

            $urlParam = array(
                'service' => 'business',
                'template' => 'intro',
                'id' => $business
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'business', 'intro', $aid, 'insert', '新增商家介绍('.$title.')', $url, $archives);

			return $aid;
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][142]);  //发布到数据时发生错误，请检查字段内容！
		}

	}



	/**
		* 修改介绍信息
		* @return array
		*/
	public function editabout(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid  = $userLogin->getMemberID();
		$param   = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$id          = (int)($param['id']);
		$body        = filterSensitiveWords($param['body']);
		$weight      = (int)($param['weight']);

		if(empty($id)){
			return array("state" => 200, "info" => '请选择要修改的信息！');
		}

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		if(empty($title)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][139]);  //请输入信息标题
		}

		if(empty($body)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][141]);  //请输入信息内容
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__business_about` SET `title` = '$title', `body` = '$body', `weight` = '$weight' WHERE `uid` = $business AND `id` = ".$id);
		$ret = $dsql->dsqlOper($archives, "update");

		if($ret == "ok"){

            $urlParam = array(
                'service' => 'business',
                'template' => 'intro',
                'id' => $business
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'business', 'intro', $id, 'update', '修改商家介绍('.$title.')', $url, $archives);

			return $langData['siteConfig'][20][229];  //修改成功！
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][142]);  //发布到数据时发生错误，请检查字段内容！
		}

	}


	/**
		* 删除介绍信息
		* @return array
		*/
	public function delabout(){
		global $dsql;
		global $userLogin;
		global $langData;

		$id = $this->param['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//获取用户ID
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_about` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results = $results[0];
			if($results['uid'] == $business){
				$archives = $dsql->SetQuery("DELETE FROM `#@__business_about` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");
            
                //记录用户行为日志
                memberLog($userid, 'business', 'intro', $id, 'delete', '删除商家介绍('.$results['title'].')', '', $archives);

				return '删除成功！';

			}else{
				return array("state" => 101, "info" => $langData['siteConfig'][21][143]);  //权限不足，请确认帐户信息后再进行操作！
			}
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][144]);  //信息不存在，或已经删除！
		}

	}


	/**
     * 相册分类
     * @return array
     */
	public function albumstype(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid  = $userLogin->getMemberID();

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT `id`, `typename`, `weight` FROM `#@__business_albums_type` WHERE `uid` = $business ORDER BY `weight` ASC");
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			return $results;
		}else{
			return array("state" => 200, "info" => '暂无相关分类！');
		}

	}




	/**
		* 更新相册分类
		* @return array
		*/
	public function updateAlbumsType(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid = $userLogin->getMemberID();
		$data = $_POST['data'];

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		if(empty($data)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][135]);  //请添加分类！
		}

		$data = str_replace("\\", '', $data);
		$json = json_decode($data);
		$json = objtoarr($json);


		foreach ($json as $key => $value) {
			$id     = $value['id'];
			$weight = $value['weight'];
			$val    = $value['val'];

			//更新
			if($id && is_numeric($id)){
				$sql = $dsql->SetQuery("UPDATE `#@__business_albums_type` SET `typename` = '$val', `weight` = '$weight' WHERE `uid` = $business AND `id` = $id");
				$ret = $dsql->dsqlOper($sql, "update");

                $urlParam = array(
                    'service' => 'business',
                    'template' => 'albums',
                    'business' => $business,
                    'id' => $id
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'business', 'albumsType', $id, 'update', '更新商家相册分类('.$val.')', $url, $sql);

			//新增
			}else{
				$sql = $dsql->SetQuery("INSERT INTO `#@__business_albums_type` (`uid`, `typename`, `weight`) VALUES ('$business', '$val', '$weight')");
				$ret = $dsql->dsqlOper($sql, "lastid");

                $urlParam = array(
                    'service' => 'business',
                    'template' => 'albums',
                    'business' => $business,
                    'id' => $ret
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'business', 'albumsType', $ret, 'insert', '新增商家相册分类('.$val.')', $url, $sql);
			}
		}

		return $this->albumstype();

		return $langData['siteConfig'][6][39];  //保存成功


	}




	/**
		* 删除相册分类
		* @return array
		*/
	public function delAlbumsType(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid = $userLogin->getMemberID();
		$id  = $this->param['id'];

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		if(empty($id)){
			return array("state" => 200, "info" => $langData['siteConfig'][20][300]);  //删除失败！
		}

		$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__business_albums_type` WHERE `id` = $id AND `uid` = ".$business);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$sql = $dsql->SetQuery("DELETE FROM `#@__business_albums` WHERE `typeid` = ".$id);
			$dsql->dsqlOper($sql, "update");

			$sql = $dsql->SetQuery("DELETE FROM `#@__business_albums_type` WHERE `id` = ".$id);
			$dsql->dsqlOper($sql, "update");
            
            //记录用户行为日志
            memberLog($userid, 'business', 'albumsType', $id, 'delete', '删除商家相册分类('.$ret[0]['typename'].')', '', $sql);

			return $langData['siteConfig'][21][136];  //删除成功
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][137]);  //分类验证失败！
		}

	}


	/**
     * 相册信息
     * @return array
     */
	public function albums(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid   = $userLogin->getMemberID();
		$pageinfo = $list = array();
		$typeid = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$typeid   = (int)$this->param['typeid'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}

		$business = $userResult[0]['id'];

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$where = " WHERE `uid` = $business";

		//类型
		if($typeid != ""){
			$where .= " AND `typeid` = $typeid";
		}

		$orderby = " ORDER BY `id` DESC";
		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_albums`".$where.$orderby);

		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$results = $dsql->dsqlOper($archives.$where, "results");
		$list = array();
		if($results){

			foreach($results as $key => $val){

				$list[$key]['id'] = $val['id'];
				$list[$key]['typeid'] = $val['typeid'];

				$typeName = "";
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_albums_type` WHERE `id` = ".$val['typeid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$typeName = $ret[0]['typename'];
				}
				$list[$key]['typename'] = $typeName;

				$list[$key]['litpic'] = getFilePath($val['litpic']);
				$list[$key]['click']  = $val['click'];
				$list[$key]['pubdate'] = $val['pubdate'];

				$param = array(
					"service"  => "business",
					"template" => "albums",
 					"bid"      => $business
				);
				$list[$key]['url']     = getUrlPath($param);

			}
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
     * 相册详细信息
     * @return array
     */
	public function albumsDetail(){
		global $dsql;
		$id = $this->param;

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_news` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

			//信息分类
			$typename = "";
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_albums_type` WHERE `id` = ".$results[0]['typeid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$typename = $ret[0]['typename'];
			}
			$results[0]['typename'] = $typename;

			$results[0]['litpicSource'] = $results[0]['litpic'];
			$results[0]['litpic'] = getFilePath($results[0]['litpic']);

			return $results[0];
		}else{
			return array("state" => 200, "info" => '信息不存在！');
		}
	}


	/**
		* 新增相册信息
		* @return array
		*/
	public function addalbums(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid  = $userLogin->getMemberID();
		$param   = $this->param;

		$pics    = addslashes($param['pics']);
		$typeid  = (int)($param['typeid']);
		$pubdate = GetMkTime(time());

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}

		$business = $userResult[0]['id'];

		if(empty($typeid)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][140]);  //请选择信息分类
		}

		if(empty($pics)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][145]);  //请上传图片
		}

		$picsArr = explode(",", $pics);
        $truePath = array();
        $ids = array();
		foreach ($picsArr as $key => $value) {
			$info = explode("|", $value);
			$litpic = $info[0];
			$face = (int)$info[1];
			$id = (int)$info[2];
			if($id){
				$archives = $dsql->SetQuery("UPDATE `#@__business_albums` SET `face` = '$face' WHERE `id` = $id");
				$ret = $dsql->dsqlOper($archives, "update");
			}else{
                $archives = $dsql->SetQuery("INSERT INTO `#@__business_albums` (`uid`, `typeid`, `litpic`, `pubdate`, `face`) VALUES ('$business', '$typeid', '$litpic', '$pubdate', '$face')");
				$ret = $dsql->dsqlOper($archives, "lastid");
                
                array_push($truePath, getFilePath($litpic));
                array_push($ids, $ret);
			}
		}

        $urlParam = array(
            'service' => 'business',
            'template' => 'albums',
            'business' => $business,
            'id' => $typeid
        );
        $url = getUrlPath($urlParam);

        $note = array();
        foreach($truePath as $key => $val){
            array_push($note, $ids[$key] . ':' . $val);
        }
            
        //记录用户行为日志
        memberLog($userid, 'business', 'albums', 0, 'insert', '新增商家相册('.join('、', $note).')', $url, '');
        
		return $ret;  //上传成功！

	}


	/**
		* 删除相册信息
		* @return array
		*/
	public function delalbums(){
		global $dsql;
		global $userLogin;
		global $langData;

		$id = $this->param['id'];

		if(!$id) return array("state" => 200, "info" => '格式错误！');

		//获取用户ID
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_albums` WHERE `id` IN ($id)");
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

			foreach ($results as $key => $value) {
				$results = $value;
				if($results['uid'] == $business){

					//删除图集
					delPicFile($results['litpic'], "delAtlas", "business");

				}else{
					return array("state" => 101, "info" => $langData['siteConfig'][21][143]);  //权限不足，请确认帐户信息后再进行操作！
				}
			}

			$archives = $dsql->SetQuery("DELETE FROM `#@__business_albums` WHERE `id` IN ($id)");
			$dsql->dsqlOper($archives, "update");
            
            //记录用户行为日志
            memberLog($userid, 'business', 'albums', 0, 'delete', '删除商家相册('.join(',', $id).')', '', $archives);

			return $langData['siteConfig'][21][136];  //删除成功！

		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][144]);  //信息不存在，或已经删除！
		}

	}


	/**
     * 商家视频
     * @return array
     */
	public function video(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid   = $userLogin->getMemberID();
		$pageinfo = $list = array();
		$typeid = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}

		$business = $userResult[0]['id'];

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$where = " WHERE `uid` = $business";

		$orderby = " ORDER BY `id` DESC";
		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_video`".$where.$orderby);

		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$results = $dsql->dsqlOper($archives.$where, "results");
		$list = array();
		if($results){

			foreach($results as $key => $val){

				$list[$key]['id'] = $val['id'];
				$list[$key]['title'] = $val['title'];
				$list[$key]['litpic'] = getFilePath($val['litpic']);
				$list[$key]['click']  = $val['click'];
				$list[$key]['pubdate'] = $val['pubdate'];

				$param = array(
					"service"  => "business",
					"template" => "video",
                    "business" => $business
				);
				$list[$key]['url']     = getUrlPath($param);

			}
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
     * 视频详细信息
     * @return array
     */
	public function videoDetail(){
		global $dsql;
		$id = $this->param;

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_video` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

			$results[0]['litpicSource'] = $results[0]['litpic'];
			$results[0]['litpic'] = getFilePath($results[0]['litpic']);

			return $results[0];
		}else{
			return array("state" => 200, "info" => '信息不存在！');
		}
	}


	/**
		* 新增视频信息
		* @return array
		*/
	public function addvideo(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid  = $userLogin->getMemberID();
		$param   = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$litpic      = filterSensitiveWords($param['litpic']);
		$video       = $_REQUEST['video'];
		$pubdate     = GetMkTime(time());

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		if(empty($title)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][139]);  //请输入信息标题
		}

		if(empty($litpic)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][145]);  //请上传图片
		}

		if(strstr($video, "<iframe")){
			preg_match_all('/<iframe.*?(?: |\t|\r|\n)?src=[\'"]?(.+?)[\'"]?(?:(?: |\t|\r|\n)+.*?)?>(.*?)<\/iframe.*?>/sim', $video, $iframe);
			$video = $iframe[1][0];
		}

		if(empty($video)){
			return array("state" => 200, "info" => $langData['siteConfig'][20][121]);  //请输入视频地址
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__business_video` (`uid`, `title`, `litpic`, `video`, `click`, `pubdate`) VALUES ('$business', '$title', '$litpic', '$video', '0', '$pubdate')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($aid)){

            $urlParam = array(
                'service' => 'business',
                'template' => 'video',
                'business' => $business
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'business', 'video', $aid, 'insert', '新增商家视频('.$title.')', $url, $archives);

			return $aid;
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][142]);  //发布到数据时发生错误，请检查字段内容！
		}

	}



	/**
		* 修改视频信息
		* @return array
		*/
	public function editvideo(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid  = $userLogin->getMemberID();
		$param   = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$id          = (int)($param['id']);
		$litpic      = filterSensitiveWords($param['litpic']);
		$video       = $_REQUEST['video'];
		$weight      = (int)($param['weight']);

		if(empty($id)){
			return array("state" => 200, "info" => '请选择要修改的信息！');
		}

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		if(empty($title)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][139]);  //请输入信息标题
		}

		if(empty($litpic)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][145]);  //请上传图片
		}

		if(strstr($video, "<iframe")){
			preg_match_all('/<iframe.*?(?: |\t|\r|\n)?src=[\'"]?(.+?)[\'"]?(?:(?: |\t|\r|\n)+.*?)?>(.*?)<\/iframe.*?>/sim', $video, $iframe);
			$video = $iframe[1][0];
		}

		if(empty($video)){
			return array("state" => 200, "info" => $langData['siteConfig'][20][121]);  //请输入视频地址
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__business_video` SET `title` = '$title', `litpic` = '$litpic', `video` = '$video' WHERE `uid` = $business AND `id` = ".$id);
		$ret = $dsql->dsqlOper($archives, "update");

		if($ret == "ok"){

            $urlParam = array(
                'service' => 'business',
                'template' => 'video',
                'business' => $business
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'business', 'video', $id, 'update', '修改商家视频('.$title.')', $url, $archives);

			return $langData['siteConfig'][20][229];  //修改成功！
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][142]);  //发布到数据时发生错误，请检查字段内容！
		}

	}


	/**
		* 删除视频信息
		* @return array
		*/
	public function delvideo(){
		global $dsql;
		global $userLogin;
		global $langData;

		$id = $this->param['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//获取用户ID
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_video` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results = $results[0];
			if($results['uid'] == $business){
				$archives = $dsql->SetQuery("DELETE FROM `#@__business_video` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");
            
                //记录用户行为日志
                memberLog($userid, 'business', 'video', $id, 'delete', '删除商家视频('.$results['title'].')', '', $archives);

				return $langData['siteConfig'][21][136];  //删除成功！

			}else{
				return array("state" => 101, "info" => $langData['siteConfig'][21][143]);  //权限不足，请确认帐户信息后再进行操作！
			}
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][144]); //信息不存在，或已经删除！
		}

	}


	/**
     * 商家全景
     * @return array
     */
	public function panor(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid   = $userLogin->getMemberID();
		$pageinfo = $list = array();
		$typeid = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}

		$business = $userResult[0]['id'];

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$where = " WHERE `uid` = $business";

		$orderby = " ORDER BY `id` DESC";
		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_panor`".$where.$orderby);

		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$results = $dsql->dsqlOper($archives.$where, "results");
		$list = array();
		if($results){

			foreach($results as $key => $val){

				$list[$key]['id'] = $val['id'];
				$list[$key]['title'] = $val['title'];
				$list[$key]['litpic'] = getFilePath($val['litpic']);
				$list[$key]['click']  = $val['click'];
				$list[$key]['pubdate'] = $val['pubdate'];

				$param = array(
					"service"  => "business",
					"template" => "panor",
					"id"       => $business
				);
				$list[$key]['url']     = getUrlPath($param);

			}
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
     * 全景详细信息
     * @return array
     */
	public function panorDetail(){
		global $dsql;
		$id = $this->param;

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_panor` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

			$results[0]['litpicSource'] = $results[0]['litpic'];
			$results[0]['litpic'] = getFilePath($results[0]['litpic']);

			return $results[0];
		}else{
			return array("state" => 200, "info" => '信息不存在！');
		}
	}


	/**
		* 新增全景信息
		* @return array
		*/
	public function addpanor(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid  = $userLogin->getMemberID();
		$param   = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$litpic      = filterSensitiveWords($param['litpic']);
		$panor        = filterSensitiveWords($param['panor']);
		$pubdate     = GetMkTime(time());

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		if(empty($title)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][139]);  //请输入信息标题
		}

		if(empty($litpic)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][145]);  //请上传图片
		}

		if(empty($panor)){
			return array("state" => 200, "info" => $langData['siteConfig'][20][122]);  //请输入全景地址
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__business_panor` (`uid`, `title`, `litpic`, `panor`, `click`, `pubdate`) VALUES ('$business', '$title', '$litpic', '$panor', '0', '$pubdate')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($aid)){

            $urlParam = array(
                'service' => 'business',
                'template' => 'panor',
                'business' => $business
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'business', 'panor', $aid, 'insert', '新增商家全景('.$title.')', $url, $archives);

			return $aid;
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][142]);  //发布到数据时发生错误，请检查字段内容！
		}

	}



	/**
		* 修改全景信息
		* @return array
		*/
	public function editpanor(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid  = $userLogin->getMemberID();
		$param   = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$id          = (int)($param['id']);
		$litpic      = filterSensitiveWords($param['litpic']);
		$panor       = filterSensitiveWords($param['panor']);
		$weight      = (int)($param['weight']);

		if(empty($id)){
			return array("state" => 200, "info" => '请选择要修改的信息！');
		}

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		if(empty($title)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][139]);  //请输入信息标题
		}

		if(empty($litpic)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][145]);  //请上传图片
		}

		if(empty($panor)){
			return array("state" => 200, "info" => $langData['siteConfig'][20][122]);  //请输入全景地址
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__business_panor` SET `title` = '$title', `litpic` = '$litpic', `panor` = '$panor' WHERE `uid` = $business AND `id` = ".$id);
		$ret = $dsql->dsqlOper($archives, "update");

		if($ret == "ok"){

            $urlParam = array(
                'service' => 'business',
                'template' => 'video',
                'business' => $business
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'business', 'panor', $id, 'update', '修改商家全景('.$title.')', $url, $archives);

			return $langData['siteConfig'][20][229];  //修改成功！
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][142]);  //发布到数据时发生错误，请检查字段内容！
		}

	}


	/**
		* 删除全景信息
		* @return array
		*/
	public function delpanor(){
		global $dsql;
		global $userLogin;
		global $langData;

		$id = $this->param['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//获取用户ID
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}
		$business = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_panor` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results = $results[0];
			if($results['uid'] == $business){
				$archives = $dsql->SetQuery("DELETE FROM `#@__business_panor` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");

                //记录用户行为日志
                memberLog($userid, 'business', 'panor', $id, 'delete', '删除商家全景('.$results['title'].')', '', $archives);

				return $langData['siteConfig'][21][136];  //删除成功！

			}else{
				return array("state" => 101, "info" => $langData['siteConfig'][21][143]);  //权限不足，请确认帐户信息后再进行操作！
			}
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][144]);  //信息不存在，或已经删除！
		}

	}


	/**
     * 点评列表
     * @return array
     */
	public function comment(){
		global $dsql;
		global $userLogin;
		global $langData;
		$page = $pageSize = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		$userid   = $userLogin->getMemberID();
		$pageinfo = $list = array();

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}

		$business = $userResult[0]['id'];

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$where = " WHERE `bid` = $business AND `isCheck` = 1";
		$orderby = " ORDER BY `id` DESC";
		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_comment`".$where.$orderby);

		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$results = $dsql->dsqlOper($archives.$where, "results");
		$list = array();
		if($results){

			foreach($results as $key => $val){
				$list[$key]['id'] = $val['id'];
				$list[$key]['userid'] = $val['userid'];
				if($val['userid']){
					$userinfo = $userLogin->getMemberInfo($val['userid'], 1);
					$list[$key]['username'] = $userinfo['username'];
				}else{
					$list[$key]['username'] = $langData['siteConfig'][21][120];  //游客
				}
				$list[$key]['rating'] = $val['rating'];
				$list[$key]['content'] = $val['content'];
				$list[$key]['ip']  = $val['ip'];
				$list[$key]['ipaddr'] = $val['ipaddr'];
				$list[$key]['dtime'] = $val['dtime'];
				$list[$key]['reply'] = $val['reply'];
				$list[$key]['rtime'] = $val['rtime'];
			}
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
		* 删除点评信息
		* @return array
		*/
	public function delComment(){
		global $dsql;
		global $userLogin;
		global $langData;

		$id = $this->param['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//获取用户ID
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}

		$business = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_comment` WHERE `id` = $id AND `isCheck` = 1");
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results = $results[0];
			if($results['bid'] == $business){
				$archives = $dsql->SetQuery("DELETE FROM `#@__business_comment` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");
				return $langData['siteConfig'][21][136];  //删除成功！
			}else{
				return array("state" => 101, "info" => $langData['siteConfig'][21][143]);  //权限不足，请确认帐户信息后再进行操作！
			}
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][144]);  //信息不存在，或已经删除！
		}

	}


	/**
		* 回复点评信息
		* @return array
		*/
	public function replyComment(){
		global $dsql;
		global $userLogin;
		global $langData;

		$id = $this->param['id'];
		$reply = $this->param['reply'];
		$rtime = GetMkTime(time());

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//获取用户ID
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}

		$business = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_comment` WHERE `id` = $id AND `isCheck` = 1");
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results = $results[0];
			if($results['bid'] == $business){

				if(!empty($reply)){
					$archives = $dsql->SetQuery("UPDATE `#@__business_comment` SET `reply` = '$reply', `rtime` = '$rtime' WHERE `id` = ".$id);
				}else{
					$archives = $dsql->SetQuery("UPDATE `#@__business_comment` SET `reply` = '' WHERE `id` = ".$id);
				}
				$dsql->dsqlOper($archives, "update");
				return $langData['siteConfig'][21][147];  //回复成功！
			}else{
				return array("state" => 101, "info" => $langData['siteConfig'][21][143]);  //权限不足，请确认帐户信息后再进行操作！
			}
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][21][144]);  //信息不存在，或已经删除！
		}

	}


	/**
		* 商家点餐-商品分类
		* @return array
		*/
	public function diancanGetFoodType(){
		global $dsql;
		global $userLogin;
		global $langData;

		$param = $this->param;

		$u      = $param['u'];
		$shopid = $param['shopid'];

		$uid = 0;
		if($u){
			$uid = $userLogin->getMemberID();
			if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}else{
			if(empty($shopid)) return array("state" => 200, "info" => $langData['siteConfig'][21][148]);  //未指定商家店铺
			$sql = $dsql->SetQuery("SELECT `uid` FROM `#@__business_list` WHERE `id` = $shopid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$uid = $ret[0]['uid'];
			}
		}

		$sql = $dsql->SetQuery("SELECT * FROM `#@__business_diancan_type` WHERE `uid` = $uid ORDER BY `sort` ASC");
		$ret = $dsql->dsqlOper($sql, "results");
		$list = array();
		foreach ($ret as $key => $value) {
			$list[$key] = $value;
		}

		return $list;

	}

	/**
		* 商家点餐-保存商品分类
		* @return array
		*/
	public function diancanSaveFoodType(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = ".$uid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['siteConfig'][21][133]);  //请先申请商家店铺！
		}

		$data = str_replace("\\", '', $_POST['data']);
		if($data == "") die;
		$json = json_decode($data);

		$json = objtoarr($json);
		foreach($json as $key => $val){
			if($val['id'] != ""){
				$archives = $dsql->SetQuery("SELECT * FROM `#@__business_diancan_type` WHERE `uid` = $uid AND `id` = ".$val['id']);
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					$where = array();
					if($results[0]['sort'] != $val['sort']){
						$where[] = '`sort` = '.$val['sort'];
					}
					if($results[0]['title'] != $val['val']){
						$where[] = '`title` = "'.$val['val'].'"';
					}
					if(!empty($where)){
						$archives = $dsql->SetQuery("UPDATE `#@__business_diancan_type` SET ".join(",", $where)." WHERE `id` = ".$val['id']);
						$dsql->dsqlOper($archives, "update");
					}
				}
			}else{
				if(!empty($val['val'])){
					$archives = $dsql->SetQuery("INSERT INTO `#@__business_diancan_type` (`uid`, `title`, `sort`) VALUES ('$uid', '".$val['val']."', ".$val['sort'].")");
					$dsql->dsqlOper($archives, "update");
				}
			}
		}

		// $sql = $dsql->SetQuery("SELECT * FROM `#@__business_diancan_type` WHERE `uid` = $uid ORDER BY `sort` ASC");
		// $ret = $dsql->dsqlOper($sql, "results");
		// $list = array();
		// foreach ($ret as $key => $value) {
		// 	$list[$key] = $value;
		// }

		// return $list;

		return "ok";

	}

	/**
	 * 商家点餐-删除商品分类
	 * @return [type] [description]
	 */
	public function diancanDelFoodType(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$param = $this->param;
		$id = is_array($param) ? $param['id'] : $param;

		if($id){
			$archives = $dsql->SetQuery("DELETE FROM `#@__business_diancan_type` WHERE `id` = '$id' AND `uid` = $uid");
			$results = $dsql->dsqlOper($archives, "update");
			if($results == "ok"){
				return $langData['siteConfig'][20][244];  //操作成功
			}else{
				return array("state" => 200, "info" => $langData['siteConfig'][20][295]);  //操作失败！
			}
		}
	}

	/**
		* 商家点餐-保存商品
		* @return array
		*/
	public function diancanSaveFood(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$dbname = "business_diancan_list";

	    //获取表单数据
		$param     = $this->param;

		extract($param);

		$id        = (int)$id;
		$sort      = (int)$sort;
		$typeid    = (int)$typeid;
		$status    = (int)$status;
		$is_nature = (int)$is_nature;
		$price     = (float)$price;
        $descript  = filterSensitiveWords($note);

	    //商品属性
	    $natureArr = array();
	    if($nature){
	        foreach ($nature as $key => $value) {
	            if($value['value']){
	                $arr = array();
	                foreach ($value['value'] as $k => $v) {
	                    array_push($arr, array(
	                        "value" => $v,
	                        "price" => $value['price'][$k],
	                        "is_open" => $value['is_open'][$k]
	                    ));
	                }
	                array_push($natureArr, array(
	                    "name" => $value['name'],
	                    "maxchoose" => $value['maxchoose'],
	                    "data" => $arr
	                ));
	            }
	        }
	    }
	    $nature = serialize($natureArr);

	    //商品名称
	    if(trim($title) == ""){
			return array("state" => 200, "info" => $langData['siteConfig'][21][149]);  //请输入商品名称
		}

	    //商品价格
	    if(trim($price) == ""){
	    	return array("state" => 200, "info" => $langData['siteConfig'][21][150]);  //请输入商品价格
		}

		if(empty($typeid)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][151]); //请选择商品分类
		}

	    if($id){

	        //验证商品是否存在
	        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `id` = $id");
	        $ret = $dsql->dsqlOper($sql, "totalCount");
	        if($ret <= 0){
	        	return array("state" => 200, "info" => $langData['siteConfig'][21][152]);  //商品不存在或已经删除！
	        }

	    }


	    //修改
	    if($id){

	        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `sort` = '$sort', `title` = '$title', `price` = '$price', `typeid` = '$typeid', `tag` = '$label', `status` = '$status', `descript` = '$descript', `is_nature` = '$is_nature', `nature` = '$nature', `pics` = '$pics'WHERE `id` = $id ");
	        $ret = $dsql->dsqlOper($sql, "update");
	        if($ret == "ok"){
            
                //记录用户行为日志
                memberLog($userid, 'business', 'diancan', $id, 'update', '修改商家点餐商品('.$id.'=>'.$title.')', '', $sql);

	            return $langData['siteConfig'][6][39];  //保存成功
			}else{
				return array("state" => 200, "info" => $langData['siteConfig'][21][153]);  //数据更新失败，请检查填写的信息是否合法！
			}


	    //新增
	    }else{

	        //保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__$dbname` (`uid`, `sort`, `title`, `price`, `typeid`, `tag`, `status`, `descript`, `is_nature`, `nature`, `pics` ) VALUES ('$uid', '$sort', '$title', '$price', '$typeid', '$label', '$status', '$descript', '$is_nature', '$nature', '$pics')");
			$aid = $dsql->dsqlOper($archives, "lastid");

			if($aid){
            
                //记录用户行为日志
                memberLog($userid, 'business', 'diancan', $aid, 'insert', '新增商家点餐商品('.$aid.'=>'.$title.')', '', $archives);

				return $langData['siteConfig'][6][39];  //保存成功
			}else{
				return array("state" => 200, "info" => $langData['siteConfig'][21][154]);  //数据插入失败，请检查填写的信息是否合法！
			}

	    }

	}

	/**
		* 商家点餐-商品列表
		* @return array
		*/
	public function diancanFoodList(){
		global $dsql;
		global $userLogin;
		global $langData;

		$where = "";

		$param = $this->param;

		$shopid   = (int)$param['shopid'];
		$title    = $param['title'];
		$typename = $param['typename'];
		$typeid   = (int)$param['typeid'];
		$page     = (int)$param['page'];
		$pageSize = (int)$param['pageSize'];
		$u      = (int)$param['u'];

		$page     = empty($page) ? 1 : $page;
		$pageSize = empty($pageSize) ? 20 : $pageSize;

		$uid = 0;
		$list = array();

		// 会员中心
		if($u){
			$uid = $userLogin->getMemberID();
			if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		}else{
			if(empty($shopid)) return array("state" => 200, "info" => $langData['siteConfig'][21][155]);  //未指定店铺

			$sql = $dsql->SetQuery("SELECT `uid` FROM `#@__business_list` WHERE `id` = $shopid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$uid = $ret[0]['uid'];
			}

			$where .= " AND `status` = 1";
		}

		if($title){
			$where .= " AND `title` LIKE '%".$title."%'";
		}

		if($typename && empty($typeid)){
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_diancan_type` WHERE `title` LIKE '%".$typename."%'");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				global $data;
				$data = "";
				$typeIdArr = arr_foreach($ret);
				$where .= " AND `typeid` IN (".join(",", $typeIdArr).")";
			}else{
				$where .= " AND 1 = 2";
			}
		}

		if($typeid){
			$where .= " AND `typeid` = $typeid";
		}


		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_diancan_list` WHERE `uid` = $uid".$where);
		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_diancan_list` WHERE `uid` = $uid".$where);
		$atpage = ($page-1) * $pageSize;
		$results  = $dsql->dsqlOper($archives." ORDER BY `sort` DESC, `id` DESC LIMIT $atpage, $pageSize", "results");

		if($results){
			foreach ($results as $key => $val) {

				$list[$key]['id']     = $val['id'];
				$list[$key]['title']  = $val['title'];
				$list[$key]['price']  = $val['price'];
				$list[$key]['typeid'] = $val['typeid'];
				$list[$key]['sort']   = $val['sort'];
				$list[$key]['status'] = $val['status'];

				$typename = "";
				$sql = $dsql->SetQuery("SELECT `title` FROM `#@__business_diancan_type` WHERE `id` = ".$val['typeid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$typename = $ret[0]['title'];
				}
				$list[$key]['typename'] = $typename;

				$list[$key]['descript']  = $val['descript'];
				$list[$key]['is_nature']  = $val['is_nature'];
				$list[$key]['nature']  = unserialize($val['nature']);
				$list[$key]['nature_json']  = json_encode(unserialize($val['nature']));

				$picArr = array();
				if($val['pics']){
					$pics = explode(",", $val['pics']);
					foreach($pics as $k => $v){
						array_push($picArr, getFilePath($v));
					}
				}
				$list[$key]['pics'] = $picArr;
			}

		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
		* 商家点餐-删除商品
		* @return array
		*/
	public function diancanDelFood(){
		global $dsql;
		global $userLogin;
		global $langData;

		$param = $this->param;

		$id = $param['id'];

		if(empty($id)) return array("state" => 200, "info" => "未指定商品");

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$archives = $dsql->SetQuery("DELETE FROM `#@__business_diancan_list` WHERE `uid` = $uid AND `id` IN (".$id.")");
		$results  = $dsql->dsqlOper($archives, "update");
		if($results == "ok"){
        
            //记录用户行为日志
            memberLog($uid, 'business', 'diancan', 0, 'delete', '删除商家点餐商品('.join(',', $id).')', '', $archives);

			return $langData['siteConfig'][20][444];  //删除成功！
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][20][300]);  //删除失败
		}


	}

	/**
		* 商家服务-配置
		* @return array
		*/
	public function serviceConfig(){
		global $dsql;
		global $userLogin;
		global $langData;

		$param = $this->param;
		$shopid = (int)$param['shopid'];
		$type = $param['type'];

		$detail = array();

		$where = "";

		if(empty($shopid)){
			$uid = $userLogin->getMemberID();
			if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

			$where = "`uid` = $uid";
			$where = " AND `uid` = $uid";
		}else{
			$where = "`id` = $shopid";
			$where = " AND `id` = $shopid";
		}

		if(empty($type)) return array("state" => 200, "info" => $langData['siteConfig'][21][156]);  //未指定类别

		$fieldAll = array(
			'diancan' => array('diancan_state', 'diancan_tableware_open', 'diancan_tableware_price'),
			'dingzuo' => array('dingzuo_state', 'dingzuo_advance_state', 'dingzuo_advance_type', 'dingzuo_advance_value', 'dingzuo_min_people', 'dingzuo_baofang_open', 'dingzuo_baofang_min'),
			'paidui' => array('paidui_state', 'paidui_juli_limit', 'paidui_oncetime', 'paidui_overdue'),
			'maidan' => array('maidan_state', 'maidan_youhui_open', 'maidan_not_youhui_open', 'maidan_youhui_value', 'maidan_youhui_limit', 'maidan_fenxiaoFee', 'maidan_XfenxiaoFee')
		);

		$fields = $fieldAll[$type];

		// $archives = $dsql->SetQuery("SELECT `id`, `uid`, ".join(",", $fields)." FROM `#@__business_list` WHERE ".$where);
		$archives = $dsql->SetQuery("SELECT `id`, `uid`, `title`, `logo`, `addrid`, `address`, `lng`, `lat`, `tel`, `opentime`, `openweek`, `opentimes`, `amount`, `short_video_promote`, ".join(",", $fields)." FROM `#@__business_list` WHERE `state` = 1".$where);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$result = $results[0];
			foreach ($result as $key => $value) {
				if($key == "logo" && !empty($value)){
					$value = getFilePath($value);
				}elseif($key == "addrid"){
					$addrName = getParentArr("site_area", $value);
					global $data;
					$data = "";
					$addrArr = array_reverse(parent_foreach($addrName, "typename"));
					$addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
					$detail['addrname'] = $addrArr;

				}elseif($key == "lng" || $key == "lat"){
					$value = empty($value) ? 0 : $value;
				}elseif($key == "short_video_promote"){
					//短视频推广信息
					$short_video_promote = trim($value);

					//如果为空，取分站的，如果分站为空，取平台设置的
					if($short_video_promote == ''){
						global $siteCityAdvancedConfig;
						if($siteCityAdvancedConfig['business']['short_video_promote']){
							$short_video_promote = $siteCityAdvancedConfig['business']['short_video_promote'];
						}else{
							require(HUONIAOINC . "/config/business.inc.php");
							$short_video_promote = $customShort_video_promote;
						}
					}
					$value = addslashes($short_video_promote);
				}elseif($key == "maidan_fenxiaoFee" || $key == "maidan_XfenxiaoFee"){
                    $value = floatval($value);
                }

				$detail[$key] = $value;
			}

			$openweek = explode(',', $detail['openweek']);
			$openweek_str = opentimeFormat($detail['openweek']);
			$opentimes = explode(',', $detail['opentimes']);

            $detail["openweek"]         = $openweek;
            $detail["openweek_str"]     = $openweek_str;
            $detail["opentimes"]        = $opentimes;
            $detail["opentimes_str"]    = join(' ', $opentimes);

			$detail["opentime"] = $openweek_str . ' ' . join(' ', $opentimes);

		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][157]);  //您还没有入驻商家
			return array("state" => 200, "info" => $langData['siteConfig'][21][158]);  //您还没有入驻商家或未审核
		}

		include HUONIAOROOT . '/include/config/business.inc.php';
		$detail['maidanTemp'] = $customMaidanTemp ? getFilePath($customMaidanTemp) : '/static/images/default_maidan_temp.png';

		return $detail;

	}

	/**
		* 商家服务-开关
		* @return array
		*/
	public function serviceUpdateState(){
		global $dsql;
		global $userLogin;
		global $langData;

		$param = $this->param;
		$type  = $param['type'];
		$get   = (int)$param['get'];

		$where = "";

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		if(empty($type)) return array("state" => 200, "info" => $langData['siteConfig'][21][156]);  //未指定类别

		$field = $type."_state";

		if($get){
			$state = 0;
			$archives = $dsql->SetQuery("SELECT `".$field."` FROM `#@__business_list` WHERE `state` = 1 AND `uid` = $uid");
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$state = $results[0][$field];
			}

			return $state;
			return array("status" => $state);
		}

		$archives = $dsql->SetQuery("UPDATE `#@__business_list` SET `".$field."` = !`".$field."` WHERE `state` = 1 AND `uid` = $uid");
		$results  = $dsql->dsqlOper($archives, "update");
		if($results == "ok"){
        
            //记录用户行为日志
            memberLog($uid, 'business', 'service', 0, 'update', '修改商家服务状态('.$field.')', '', $archives);

			return $langData['siteConfig'][20][244];  //操作成功
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][20][295]);  //操作失败！
		}

	}


	/**
		* 商家服务-获取桌位配置
		* @return array
		*/
	public function serviceGetTable(){
		global $dsql;
		global $langData;

		$param = $this->param;
		$store = (int)$param['store'];

		if(empty($store)) return array("state" => 200, "info" => $langData['siteConfig'][21][155]);  //未指定店铺

		// 查询所有桌位
		$tableList = array();
		$people = array();
		$sql = $dsql->SetQuery("SELECT * FROM `#@__business_dingzuo_table` WHERE `parentid` = 0 AND `type` = $store ORDER BY `weight` ASC");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			foreach ($ret as $key => $value) {
				$aid = $value['id'];

				$tableList[$key]['id']       = $aid;
				$tableList[$key]['typename'] = $value['typename'];
				$tableList[$key]['code']     = $value['code'];
				$tableList[$key]['min']      = $value['min'];
				$tableList[$key]['max']      = $value['max'];

				$people[] = $value['min'];
				$people[] = $value['max'];

				$lower = array();
				$sql = $dsql->SetQuery("SELECT * FROM `#@__business_dingzuo_table` WHERE `parentid` = $aid ORDER BY `weight` ASC");
				$res = $dsql->dsqlOper($sql, "results");
				if($res){
					foreach ($res as $k => $val) {
						$lower[$k]['id']       = $val['id'];
						$lower[$k]['typename'] = $val['typename'];
					}
				}
				$tableList[$key]['lower'] = $lower;
			}

			sort($people);

			return array("min" => $people[0], "max" => $people[count($people)-1], "list" => $tableList);

		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][155]);  //暂无数据！
		}



	}

	/**
		* 商家点餐-修改配置
		* @return array
		*/
	public function diancanSaveConfig(){
		global $dsql;
		global $userLogin;
		global $langData;

		$param = $this->param;

		$diancan_state = (int)$param['diancan_state'];
		$diancan_tableware_open = (int)$param['diancan_tableware_open'];
		$diancan_tableware_price = $param['diancan_tableware_price'];

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `diancan_state` = '$diancan_state', `diancan_tableware_open` = '$diancan_tableware_open', `diancan_tableware_price` = '$diancan_tableware_price' WHERE `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == "ok"){
        
            //记录用户行为日志
            memberLog($uid, 'business', 'diancan', 0, 'update', '修改商家点餐配置', '', $sql);

			return $langData['siteConfig'][20][229];  //修改成功
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][159]);  //修改失败，请重试
		}

	}


	/**
	  * 商家点餐-提交订单
	  */
	public function diancanDeal(){
		global $dsql;
		global $userLogin;
		global $langData;
		$uid = $userLogin->getMemberID();

		if($uid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}
		$userLogin->keepUser();

		$u             = (int)$this->param['u'];
		$id            = (int)$this->param['id'];
		$shop          = (int)$this->param['shop'];
		$order_content = json_decode($this->param['order_content'], true);
		$table         = $this->param['table'];
		$note          = $this->param['note'];
		$people        = (int)$this->param['people'];

		$to = $uid;


		if($u){
			if(empty($id)) return array("state" => 200, "info" => $langData['siteConfig'][21][160]);  //未指定订单！
			// 验证店铺
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $uid");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!$ret){
				return array("state" => 200, "info" => $langData['siteConfig'][21][161]);  //权限验证错误
			}else{
				$shop = $ret[0]['id'];
			}

			// 验证订单
			$sql = $dsql->SetQuery("SELECT `uid`, `state`, `pubdate` FROM `#@__business_diancan_order` WHERE `id` = $id AND `sid` = $shop");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!$ret){
				return array("state" => 200, "info" => $langData['siteConfig'][21][162]);  //订单不存在！
			}
			$to = $ret[0]['uid'];
			$orderdate = $ret[0]['pubdate'];

			$priceinfo_    = json_decode($this->param['priceinfo'], true);

		}else{
			if(empty($shop)) return array("state" => 200, "info" => $langData['siteConfig'][21][163]);  //店铺ID错误！
		}

		if(empty($table)) return array("state" => 200, "info" => $langData['siteConfig'][21][164]);  //请输入桌号
		if(empty($people)) return array("state" => 200, "info" => $langData['siteConfig'][21][165]);  //请输入顾客人数


		//店铺详细信息
		$this->param = array("shopid" => $shop, "type" => "diancan");
		$shopDetail = $this->serviceConfig();
		if(!$u){
			if(!$shopDetail['diancan_state']){
				return array("state" => 200, "info" => $langData['siteConfig'][21][166]); //该店铺关闭了点餐功能，您暂时无法线上点餐。
			}
		}

		if(empty($order_content)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][167]);  //购物车内容为空，下单失败！
		}

		// 验证桌号;
		$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__business_dingzuo_table` WHERE `type` = $shop AND `typename` = '$table' AND `parentid` != 0");
		$ret = $dsql->dsqlOper($sql, "results");
		if(!$ret){
			return array("state" => 200, "info" => $langData['siteConfig'][21][168]);  //桌号不存在，请重新填写
		}else{
			$table = $ret[0]['typename'];
		}

		//验证商品
		$totalPrice = 0;
		$dabaoPrice = 0;
		$fids = array();
		$food = array();
		$foodTitle = array();
		foreach ($order_content as $key => $value) {

			$fid     = $value['id'];     //商品ID
			$fcount  = $value['count'];  //商品数量
			$fntitle = $value['ntitle']; //商品属性
			$fnprice = $value['nprice']; //商品属性

			array_push($fids, $fid);

			$sql = $dsql->SetQuery("SELECT * FROM `#@__business_diancan_list` WHERE `id` = $fid AND `uid` = ".$shopDetail['uid']." AND `status` = 1");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				$data = $ret[0];

				$price = $data['price'];

				$totalPrice += $price * $fcount;

				$food[$key]['id']     = $fid;
				$food[$key]['type']  = $value['type'];
				$food[$key]['title']  = $data['title'];
				$food[$key]['ntitle'] = $fntitle;
				$food[$key]['nprice'] = $fnprice;
				$food[$key]['count']  = $fcount;
				$fprice = $data['price'];

				$foodTitle[]  = $data['title'];

				//商品属性
				if($data['is_nature']){
					$nature = unserialize($data['nature']);
					if($nature){
						$names = array();
						$prices = array();
						// print_r($nature);die;
						foreach ($nature as $k => $v) {
							$names[$k] = array();
							$prices[$k] = array();
							foreach ($v['data'] as $k_ => $v_) {
								array_push($names[$k], $v_['value']);
								array_push($prices[$k], $v_['price']);
							}
						}

						$namesArr = descartes($names);
						$pricesArr = descartes($prices);

						$names = array();
						$prices = array();

						if(count($namesArr) > 1){
							foreach ($namesArr as $k => $v) {
								array_push($names, join("/", $v));
							}
						}else{
							$names = $namesArr[0];
						}

						if(count($pricesArr) > 1){
							foreach ($pricesArr as $k => $v) {
								array_push($prices, array_sum($v));
							}
						}else{
							$prices = $pricesArr[0];
						}

						if($fntitle){
							$empty = false;
							// 多选的情况
							if(!in_array($fntitle, $names)){
								$fntitleArr = explode("/", $fntitle);
								$fntitle_ = array();
								foreach ($fntitleArr as $k => $v) {
									$_fntitle = array();
									if(strstr($v, '#')){
										$dealv_ = explode("#", $v);	// 下单多选属性
										$count = count($dealv_);
										$find = 0;
										foreach ($nature as $nk => $nv) {
											$maxchoose = $nv['maxchoose'];
											// 已选数量小于等于最多可选数量
											if($maxchoose >= $count){
												foreach ($nv['data'] as $k_ => $v_) {
													if(in_array($v_['value'], $dealv_)){
														if($v_['is_open']){
															$empty = true;
															break;
														}else{
															$find++;
														}
													}
												}
											}else{
												$empty = true;
											}
										}
										if($find < $count){
											$empty = true;
										}
										$_v = substr($v, 0, strpos($v, "#"));
									}else{
										$_v = $v;
									}
									array_push($fntitle_, $_v);
								}

								if($empty){
									return array("state" => 200, "info" => $value['title']."的".$fntitle."不存在，下单失败！");
								}else{
									//获取属性价格
									$fnprice = $prices[array_search(join("/", $fntitle_), $names)];

									$fprice += $fnprice;
									$totalPrice += $fnprice * $fcount;

								}

							// 单选的情况
							}else{
								//获取属性价格
								$fnprice = $prices[array_search($fntitle, $names)];

								$fprice += $fnprice;
								$totalPrice += $fnprice * $fcount;
							}
						}else{

							//获取属性价格
							$fnprice = $prices[array_search($fntitle, $names)];

							$fprice += $fnprice;
							$totalPrice += $fnprice * $fcount;
						}
					}
				}

				$food[$key]['price'] = $fprice;

			}else{
				return array("state" => 200, "info" => $value['title'].$langData['siteConfig'][21][169]);  //已经下架，下单失败！
			}

		}

		if(count($foodTitle) > 1){
			$title = $foodTitle[0].$langData['siteConfig'][21][170];  //等
		}else{
			$title = $foodTitle[0];
		}

		// 费用详情
		$priceinfo = array();

		// 商家修改
		if($u){
			if($priceinfo_){
				foreach ($priceinfo_ as $key => $value) {
					$amount = sprintf("%.2f", $value['amount']);

					$type = '';
					switch($value['type']){
						case 'canju' :
							$type = $langData['siteConfig'][21][171];  //餐具费
							break;
					}
					$totalPrice += $amount;
					array_push($priceinfo, array(
						"type" => $value['type'],
						"body" => $type,
						"amount" => $amount
					));
				}
			}

			$date = GetMkTime(time());
			$fids = join(",", $fids);
			$food = serialize($food);
			$priceinfo = serialize($priceinfo);

			$confirmdate = '';
			if($state == 0){
				$state = 3;
				$confirmdate = ", `confirmdate` = ".GetMkTime(time());
			}

			$sql = $dsql->SetQuery("UPDATE `#@__business_diancan_order` SET `tablenum` = '$table', `people` = '$people', `fids` = '$fids', `food` = '$food', `priceinfo` = '$priceinfo', `amount` = $totalPrice, `note` = '$note', `state` = $state ".$confirmdate." WHERE `id` = $id");
			$res = $dsql->dsqlOper($sql, "update");

			if($state == 3 && $res == "ok"){

				$param = array(
					"service"  => "member",
					"type" => "user",
					"template" => "order-business",
					"param"   => "type=diancan"
				);
				// 通知用户
				$currency = echoCurrency(array("type" => "symbol"));
				updateMemberNotice($to, "会员-点餐成功", $param, array(
					"type" => $langData['siteConfig'][21][172],  //点餐成功通知
					"store" => $shopDetail['title'],
					"title" => $title,
					'amount' => $totalPrice,
					"date" => date("Y-m-d H:i:s", $orderdate ? $orderdate : time()),
					"body" => str_replace('1', $title, $langData['siteConfig'][21][173])."，".$langData['siteConfig'][19][306]."：".$currency.$totalPrice."，".$langData['siteConfig'][19][309]."：".date("Y-m-d H:i:s", $date),
					'fields' => array(
						'keyword1' => '商品名称',
						'keyword2' => '消费金额',
						'keyword3' => '购买时间',
					)
				),'','',0,0);  //您点的$title已经确认   金额   下单时间

				// 打印订单
				// printBusinesDiancan($id);
			}
			// 打印订单
				printBusinesDiancan($id);

			return $res;

		}else{
			if($shopDetail['diancan_tableware_open'] && $shopDetail['diancan_tableware_price']){
				$totalPrice += $people * $shopDetail['diancan_tableware_price'];
				array_push($priceinfo, array(
					"type" => "canju",
					"body" => $langData['siteConfig'][21][171],  //餐具费
					"amount" => sprintf("%.2f", $people * $shopDetail['diancan_tableware_price'])
				));
			}
		}


		//生成订单号
		$newOrdernum = create_ordernum();
		$pubdate = GetMkTime(time());
		$fids = join(",", $fids);

		$food = serialize($food);
		$preset = serialize($preset);
		$priceinfo = serialize($priceinfo);

		$id = 0;

		//查询是否下过单，防止重复下单
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_diancan_order` WHERE `uid` = $uid AND `sid` = $shop AND `state` = 0 AND `fids` = '$fids' AND `food` = '$food' AND `amount` = $totalPrice");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$id = $ret[0]['id'];
			$aid = $id;

			$sql = $dsql->SetQuery("UPDATE `#@__business_diancan_order` SET `ordernum` = '$newOrdernum', `note` = '$note', `pubdate` = '$pubdate', `tablenum` = '$table', `people` = '$people' WHERE `id` = $id");

			$res = $dsql->dsqlOper($sql, "update");
			if($res != "ok"){
				return array("state" => 200, "info" => $langData['siteConfig'][21][174]);  //下单失败！
			}

		}else{
			$sql = $dsql->SetQuery("INSERT INTO
				`#@__business_diancan_order`
				(`uid`, `sid`, `ordernum`, `state`, `fids`, `food`, `people`, `tablenum`, `amount`, `priceinfo`, `note`, `pubdate`)
				VALUES
				('$uid', '$shop', '$newOrdernum', '0', '$fids', '$food', '$people', '$table', '$totalPrice', '$priceinfo', '$note', '$pubdate')
			");
			$aid = $dsql->dsqlOper($sql, "lastid");

			$id = $aid;

			if(!is_numeric($aid)){
				return array("state" => 200, "info" => $langData['siteConfig'][21][174]);  //下单失败！
			}


		}
		// 通知商家
		$param = array(
			"service"  => "member",
			"template" => "business-diancan-order"
		);
		updateMemberNotice($shopDetail['uid'], "会员-点餐成功", $param, array(
			"type" => $langData['siteConfig'][21][175],  //您有新的点餐订单
			"store" => $shopDetail['title'],
			"title" => $title,
			'amount' => $totalPrice,
			"date" => date("Y-m-d H:i:s", $orderdate ? $orderdate : time()),
			"body" => $langData['siteConfig'][21][175],  //您有新的点餐订单
			'fields' => array(
				'keyword1' => '商品名称',
				'keyword2' => '消费金额',
				'keyword3' => '购买时间',
			)
		),'','',0,0);


		//通知用户1
		$param = array(
			"service"  => "member",
			"type" => "user",
			"template" => "order-business",
			"param"   => "type=diancan"
		);
		// 通知用户
		$currency = echoCurrency(array("type" => "symbol"));
		updateMemberNotice($to, "会员-点餐成功", $param, array(
			"type" => $langData['siteConfig'][21][172],  //点餐成功通知
			"store" => $shopDetail['title'],
			"title" => $title,
			'amount' => $totalPrice,
			"date" => date("Y-m-d H:i:s", $orderdate ? $orderdate : time()),
			"body" => str_replace('1', $title, $langData['siteConfig'][21][173])."，".$langData['siteConfig'][19][306]."：".$currency.$totalPrice."，".$langData['siteConfig'][19][309]."：".date("Y-m-d H:i:s", $orderdate ? $orderdate : time()),
			'fields' => array(
				'keyword1' => '商品名称',
				'keyword2' => '消费金额',
				'keyword3' => '购买时间',
			)
		),'','',0,0);

		// 打印订单
		printBusinesDiancan($id);

		return $newOrdernum;

	}


	/**
	  * 商家点餐-商家修改订单
	  */
	public function diancanEditDeal(){
		global $langData;
		$this->param['u'] = 1;
		$res = $this->diancanDeal();

		if($res == "ok"){
			return $langData['siteConfig'][20][229];  //修改成功
		}else{
			return array("state" => 200, "info" => ($res['info'] ? $res['info'] : $langData['siteConfig'][21][85]));  //提交失败！
		}

	}


	/**
	  * 商家点餐-订单列表
	  */
	public function diancanOrder(){
		global $dsql;
		global $userLogin;
		global $langData;
		$userid = $userLogin->getMemberID();
		$state = $where = '';

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$state    = $this->param['state'];
				$u        = (int)$this->param['u'];
				$sid      = (int)$this->param['sid'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if($u){
			// 验证店铺
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $userid");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!$ret){
				return array("state" => 200, "info" => $langData['siteConfig'][21][161]);  //权限验证错误
			}else{
				$sid = $ret[0]['id'];
			}

			$where .= " AND `sid` = $sid";

		}else{
			$where .= " AND `uid` = $userid";
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		// 待确认
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_diancan_order` WHERE 1 = 1".$where);
		$totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");

		// 已确认
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_diancan_order` WHERE 1 = 1".$where);
		$totalAudit = $dsql->dsqlOper($archives." AND `state` = 3", "totalCount");

		// 总数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		if($state != ''){
			$where .= " AND `state` = $state";

			if($state == 0){
				$totalPage = ceil($totalGray/$pageSize);
			}elseif($state == 3){
				$totalPage = ceil($totalAudit/$pageSize);
			}

		}else{
			$totalPage = ceil($totalCount/$pageSize);
		}

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount,
			"totalGray" => $totalGray,
			"totalAudit" => $totalAudit
		);

		$list = array();
		$atpage = ($page - 1) * $pageSize;
		$where .= " ORDER BY `id` DESC LIMIT $atpage, $pageSize";
		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_diancan_order` WHERE 1 = 1".$where);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach ($results as $key => $value) {
				$list[$key]['id']        = $value['id'];
				$list[$key]['ordernum']  = $value['ordernum'];
				$list[$key]['state']     = $value['state'];
				$list[$key]['food']      = unserialize($value['food']);
				$list[$key]['pubdate']   = $value['pubdate'];
				$list[$key]['table']     = $value['tablenum'];
				$list[$key]['people']    = $value['people'];
				$list[$key]['amount']    = $value['amount'];
				$list[$key]['note']      = $value['note'];
				$list[$key]['priceinfo'] = unserialize($value['priceinfo']);

				if($u){
					$user = '';
					$sql = $dsql->SetQuery("SELECT `nickname`, `username`, `photo` FROM `#@__member` WHERE `id` = ".$value['uid']);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$user = array(
							'name' => empty($ret[0]['nickname']) ? $ret[0]['username'] : $ret[0]['nickname'],
							'photo' => empty($ret[0]['photo']) ? '' : getFilePath($ret[0]['photo'])
						);
					}
					$list[$key]['user'] = $user;

				// 商家信息
				}else{
					$sql = $dsql->SetQuery("SELECT `title`, `logo` FROM `#@__business_list` WHERE `id` = ".$value['sid']);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$param = array(
							"service" => "business",
							"templates" => "detail",
							"id" => $value['sid']
						);
						$url = getUrlPath($param);
						$list[$key]['store'] = array(
							"id" => $value['sid'],
							"title" => $ret[0]['title'],
							"logo" => $ret[0]['logo'] ? getFilePath($ret[0]['logo']) : "",
							"url" => $url
						);
					}
				}
			}

			return array("pageInfo" => $pageinfo, "list" => $list);
		}else{

			return array("pageInfo" => $pageinfo, "list" => $list);
		}




	}

	/**
	  * 商家点餐-订单详情
	  */
	public function diancanOrderDetail(){
		global $dsql;
		global $langData;
		$orderDetail = $cardnum = array();
		$id = $this->param;

		global $userLogin;
		$userid = $userLogin->getMemberID();

		if($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_diancan_order` WHERE `id` = $id");
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$result                   = $results[0];
			$orderDetail["id"]        = $result["id"];
			$orderDetail["sid"]       = $result["sid"];
			$orderDetail["ordernum"]  = $result["ordernum"];
			$orderDetail["pubdate"]   = $result["pubdate"];
			$orderDetail['table']     = $result['tablenum'];
			$orderDetail['people']    = $result['people'];
			$orderDetail['state']     = $result['state'];
			$orderDetail['food']      = unserialize($result['food']);
			$orderDetail['food_json']   = json_encode(unserialize($result['food']));
			$orderDetail['pubdate']   = $result['pubdate'];
			$orderDetail['amount']    = $result['amount'];
			$orderDetail['note']      = $result['note'];
			$orderDetail['priceinfo'] = unserialize($result['priceinfo']);
		}
		return $orderDetail;
	}


	/**
		* 商家订座-修改配置
		* @return array
		*/
	public function dingzuoSaveConfig(){
		global $dsql;
		global $userLogin;
		global $langData;

		$param = $this->param;

		$dingzuo_state = (int)$param['dingzuo_state'];
		$dingzuo_advance_state = (int)$param['dingzuo_advance_state'];
		$dingzuo_advance_type = (int)$param['dingzuo_advance_type'];
		$dingzuo_advance_value = (int)$param['dingzuo_advance_value'];
		$dingzuo_baofang_open = (int)$param['dingzuo_baofang_open'];
		$dingzuo_baofang_min = (int)$param['dingzuo_baofang_min'];
		$dingzuo_min_people = (int)$param['dingzuo_min_people'];

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `dingzuo_state` = '$dingzuo_state', `dingzuo_advance_state` = '$dingzuo_advance_state', `dingzuo_advance_type` = '$dingzuo_advance_type', `dingzuo_advance_value` = '$dingzuo_advance_value', `dingzuo_baofang_open` = '$dingzuo_baofang_open', `dingzuo_baofang_min` = '$dingzuo_baofang_min', `dingzuo_min_people` = '$dingzuo_min_people' WHERE `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == "ok"){
        
            //记录用户行为日志
            memberLog($uid, 'business', 'dingzuo', 0, 'update', '修改商家订座配置', '', $sql);

			return $langData['siteConfig'][20][229];  //修改成功！
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][159]);  //修改失败，请重试
		}

	}


	/**
     * 商家订座-时间段配置
     * @return array
     */
	public function dingzuoCategory(){
		global $dsql;
		$u = $store = $type = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$store    = (int)$this->param['store'];
				$tab      = $this->param['tab'];
				$type     = (int)$this->param['type'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
				$son      = $this->param['son'] == 0 ? false : true;
			}
		}

		if(empty($tab)) return array("state" => 200, "info" => '格式错误！');

		if(empty($store)){
			global $userLogin;
			$userid = $userLogin->getMemberID();
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = ".$userid);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$store = $ret[0]['id'];
			}else{
				return array("state" => 200, "info" => '格式错误！');
			}
		}

		$list = array();

		if($tab == "time"){
			$list = $dsql->getTypeList($type, "business_dingzuo_".$tab, $son, $page, $pageSize, " AND `type` = $store");
		}else{
			$archives = $dsql->SetQuery("SELECT * FROM `#@__business_dingzuo_table` WHERE `type` = $store AND `parentid` = $type");
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				foreach ($results as $key => $value) {
					$list[$key] = $value;

					$sql = $dsql->SetQuery("SELECT * FROM `#@__business_dingzuo_table` WHERE `type` = $store AND `parentid` = ".$value['id']);
					$ret  = $dsql->dsqlOper($sql, "results");
					if($ret){
						$list[$key]['lower'] = $ret;
					}else{
						$list[$key]['lower'] = "";
					}
				}
			}

		}
		if($list){
			return $list;
		}
	}


	/**
		* 更新商铺商品分类
		* @return array
		*/
	public function dingzuoUpdateCategory(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid   = $userLogin->getMemberID();
		$id       = $this->param['id'];
		$tab      = $this->param['tab'];
		$field    = $this->param['field'];
		$typename = $this->param['typename'];


		if(empty($field)) $field = 'typename';

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		if(!is_numeric($id)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][159]);  //修改失败，请重试
		}

		if(empty($tab)){
			return array("state" => 200, "info" => '参数错误！');
		}

		if(empty($typename)){
			return array("state" => 200, "info" => $field == 'typename' ? $langData['siteConfig'][21][176] : $langData['siteConfig'][21][177]);  //请输入分类名称！  请输入内容
		}

		$typename = cn_substrR($typename,30);

		$typename = trim($typename);

		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = ".$userid);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$storeid = $ret[0]['id'];

			//验证权限
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_dingzuo_".$tab."` WHERE `type` = $storeid AND `id` = ".$id);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				if($ret[0]['typename'] == $typename){
					return array("state" => 101, "info" => $langData['siteConfig'][21][178]);  //没有变化
				}else{
					$sql = $dsql->SetQuery("UPDATE `#@__business_dingzuo_".$tab."` SET `".$field."` = '$typename' WHERE `id` = ".$id);
					if($dsql->dsqlOper($sql, "update") == "ok"){
						return $langData['siteConfig'][20][229];  //修改成功！
					}else{
						return array("state" => 200, "info" => $langData['siteConfig'][21][179]);  //更新失败，请重试！
					}
				}

			}else{
				return array("state" => 200, "info" => $langData['siteConfig'][21][180]);  //账号验证错误，更新失败！
			}

		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][181]);  //您还没有入驻商家！
		}

	}

	/**
		* 更新商家订座分类(时间段和桌位)
		* @return array
		*/
	public function dingzuoOperaCategory(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid = $userLogin->getMemberID();
		$data   = $_POST['data'];
		$type   = $_POST['type'];

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		if(empty($data)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][135]);  //请添加分类！
		}

		if(empty($type)){
			return array("state" => 200, "info" => '参数错误！');
		}

		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = ".$userid);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$storeid = $ret[0]['id'];

			$data = str_replace("\\", '', $data);
			$json = json_decode($data);

			$json = objtoarr($json);
			$json = $this->proTypeAjax($json, 0, "business_dingzuo_".$type, $storeid);
			return $json;

		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][181]);  //您还没有入驻商家！
		}


	}

	//更新分类
	public function proTypeAjax($json, $pid = 0, $tab, $tid){
		global $dsql;
		for($i = 0; $i < count($json); $i++){
			$id = $json[$i]["id"];
			$name = $json[$i]["name"];

			$name = trim($name);

			//如果ID为空则向数据库插入下级分类
			if($id == "" || $id == 0){
				$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`type`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('$tid', '$pid', '$name', '$i', '".GetMkTime(time())."')");
				$id = $dsql->dsqlOper($archives, "lastid");
			}
			//其它为数据库已存在的分类需要验证分类名是否有改动，如果有改动则UPDATE
			else{
				$archives = $dsql->SetQuery("SELECT `typename`, `weight`, `parentid` FROM `#@__".$tab."` WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "results");
				if(!empty($results)){
					//验证分类名
					if($results[0]["typename"] != $name){
						$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `typename` = '$name' WHERE `id` = ".$id);
						$results = $dsql->dsqlOper($archives, "update");
					}

					//验证排序
					if($results[0]["weight"] != $i){
						$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `weight` = '$i' WHERE `id` = ".$id);
						$results = $dsql->dsqlOper($archives, "update");
					}
				}
			}
			if(is_array($json[$i]["lower"])){
				$this->proTypeAjax($json[$i]["lower"], $id, $tab, $tid);
			}
		}
		return '保存成功！';

	}

	/**
		* 删除商家订座-分类
		* @return array
		*/
	public function dingzuoDelCategory(){
		global $dsql;
		global $userLogin;
        global $langData;

		$userid = $userLogin->getMemberID();
		$id     = $this->param['id'];
		$tab    = $this->param['tab'];

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		if(empty($id)){
			return array("state" => 200, "info" => '删除失败，请重试！');
		}

		if(empty($tab)){
			return array("state" => 200, "info" => '参数错误！');
		}

		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = ".$userid);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$storeid = $ret[0]['id'];

			$ids = explode(",", $id);
			foreach ($ids as $key => $value) {

				//验证权限
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_dingzuo_".$tab."` WHERE `type` = $storeid AND `id` = ".$value);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){

					$sql = $dsql->SetQuery("DELETE FROM `#@__business_dingzuo_".$tab."` WHERE `id` = ".$value." OR `parentid` = ".$value);
					if(!$dsql->dsqlOper($sql, "update") == "ok"){
						return array("state" => 200, "info" => $langData['siteConfig'][20][300]);  //删除失败，请重试！
					}

				}else{
					return array("state" => 200, "info" => $langData['siteConfig'][21][182]);  //账号验证错误，删除失败！
				}

			}
			return "删除成功！";

		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][181]);  //您还没有入驻商家！
		}

	}


	/**
		* 商家订座-用户下单
		* @return array
		*/
	public function dingzuoDeal(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$param        = $this->param;
		$store        = (int)$param['store'];
		$time         = $param['time'];
		$baofang      = (int)$param['baofang'];
		$baofang_only = (int)$param['baofang_only'];
		$people       = (int)$param['people'];
		$table        = (int)$param['table'];
		$name         = $param['name'];
		$sex          = (int)$param['sex'];
		$contact      = $param['contact'];
		$note         = $param['note'];

		if(empty($store)) return array("state" => 200, "info" => "参数错误");
		if(empty($time)) return array("state" => 200, "info" => $langData['siteConfig'][21][183]);  //请选择时间
		if(empty($people)) return array("state" => 200, "info" => $langData['siteConfig'][21][184]);  //请选择人数
		if(empty($contact)) return array("state" => 200, "info" => $langData['siteConfig'][21][185]);  //请填写手机号

		$time = GetMkTime($time);	//  预定时间
		$pubdate = GetMkTime(time());
		$this->param = array("shopid" => $store, "type" => "dingzuo");
		$cfg = $this->serviceConfig();

		if($cfg && !isset($cfg['state'])){

			if($cfg['dingzuo_state'] == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][186]);  //提交失败，商家关闭了订座功能

			// if($cfg['uid'] == $uid) return array("state" => 200, "info" => "您确定要预定自家店铺吗？");

			if($people < $cfg['dingzuo_min_people']){
				if($people < $cfg['dingzuo_min_people']) return array("state" => 200, "info" => str_replace('1', $cfg['dingzuo_baofang_min'], $langData['siteConfig'][21][187]));  //抱歉，本店最少1人起订
			}

			// 包房
			if($baofang){
				if($people < $cfg['dingzuo_baofang_min']) return array("state" => 200, "info" => str_replace('1', $cfg['dingzuo_baofang_min'], $langData['siteConfig'][21][188]));  //抱歉，包房最少1人
				$table = 0;
			}

			// 提前预定
			if($cfg['dingzuo_advance_state'] == 1 && $cfg['dingzuo_advance_value']){
				$dingzuo_advance_value = $cfg['dingzuo_advance_value'] * ($cfg['dingzuo_advance_type'] == 0 ? 3600 : 86400);
				$info = str_replace('1', $cfg['dingzuo_advance_value'].($cfg['dingzuo_advance_type'] == 0 ? $langData['siteConfig'][13][44] : $langData['siteConfig'][13][6]), $langData['siteConfig'][21][189]);  //抱歉，商家要求必须提前1预定    小时    天
				if($time - $pubdate < $dingzuo_advance_value) return array("state" => 200, "info" => $info);
			}

		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][190]);  //提交失败，商家不存在或状态异常
		}

		// 如果有桌位号，查询商家桌位配置
		if($table){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__business_dingzuo_table` WHERE `type` = $store AND `id` = $table");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				$tableArea = $ret[0]['parentid'];
				// 区域
				$sql = $dsql->SetQuery("SELECT * FROM `#@__business_dingzuo_table` WHERE `type` = $store AND `id` = ".$tableArea);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$min = $ret[0]['min'];
					$max = $ret[0]['max'];

					if($people < $min) return array("state" => 200, "info" => str_replace('1', $min, $langData['siteConfig'][21][191]));  //该桌位最少预定人数为1人
					if($people > $max) return array("state" => 200, "info" => str_replace('1', $max, $langData['siteConfig'][21][192]));  //该桌位最大预定人数为1人

					// 验证桌位是否可以预定
					$day = date("Y-m-d", $time);
					$date = (int)date("H", $time);
					$date .= ":".date("i", $time);
					$start = $end = 0;

					// 查询指定时间点所属时间段
					$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__business_dingzuo_time` WHERE `type` = $store AND `typename` = '$date'");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$timearea = $ret[0]['parentid'];
					}else{
						return array("state" => 200, "info" => $langData['siteConfig'][21][193]);  //预定时间不正确
					}

					$day_start = strtotime($day." 00:00");
					$day_end = strtotime($day." 23:59");
					$checkSql = $dsql->SetQuery("SELECT `id` FROM `#@__business_dingzuo_order` WHERE `sid` = $store AND `tableid` = $table AND `timearea` = $timearea AND (`time` > $day_start AND `time` < $day_end) AND `state` != 2");
					$checkRet = $dsql->dsqlOper($checkSql, "results");
					if($checkRet){
						return array("state" => 200, "info" => $langData['siteConfig'][21][194]);  //抱歉，该桌位已被预定
					}

				}else{
					return array("state" => 200, "info" => $langData['siteConfig'][21][195]);  //桌位号不存在
				}
			}else{
				return array("state" => 200, "info" => $langData['siteConfig'][21][195]);  //桌位号不存在
			}
		}

		$ordernum = create_ordernum();

		// 包房或者未指定桌位需要商家确认
		$state = ($baofang || empty($baofang) && empty($table)) ? 0 : 1;
		$state = 0;  //强制需要确认
		$archives = $dsql->SetQuery("INSERT INTO `#@__business_dingzuo_order` (`uid`, `ordernum`, `sid`, `timearea`, `time`, `people`, `tableid`, `baofang`, `baofang_only`, `name`, `sex`, `contact`, `note`, `pubdate`, `state`) VALUES ('$uid', '$ordernum', '$store', '$timearea', '$time', '$people', '$table', '$baofang', '$baofang_only', '$name', '$sex', '$contact', '$note', '$pubdate', '$state')");
		$lastid   = $dsql->dsqlOper($archives, "lastid");
		if(is_numeric($lastid)){

			if($state){
				// 通知用户
				$to = $uid;
				$param = array(
					"service"  => "member",
					"type" => "user",
					"template" => "order-business",
					"param"   => "type=dingzuo"
				);
				updateMemberNotice($to, "会员-订座成功", $param, array(
					"type" => $langData['siteConfig'][21][196],  //订座成功通知
					"contact" => $contact,
					'store' => $cfg['title'],
					"date" => date("Y-m-d H:i", $time),
					'people' => $people,
					'note' => $note,
					// 'body' => str_replace('1', $store, str_replace('2', $contact, str_replace('3', $date, $langData['siteConfig'][21][197]))),
					'fields' => array(
		                'keyword1' => '预留手机',
		                'keyword2' => '订座门店',
		                'keyword3' => '到店时间',
		                'keyword4' => '人数',
		                'keyword5' => '备注'
		            )
				),'','',0,1);
			}

			// 通知商家
			$to = $cfg['uid'];
			$param = array(
				"service"  => "member",
				"template" => "business-dingzuo-order"
			);
			updateMemberNotice($to, "会员-订座成功", $param, array(
				"type" => $langData['siteConfig'][21][198],  //您有新的订座订单
				"contact" => $contact,
				'store' => $cfg['title'],
				"date" => date("Y-m-d H:i", $time),
				'people' => $people,
				'note' => $note,
				// 'body' => $langData['siteConfig'][21][198],  //您有新的订座订单
				'fields' => array(
	                'keyword1' => '预留手机',
	                'keyword2' => '订座门店',
	                'keyword3' => '到店时间',
	                'keyword4' => '人数',
	                'keyword5' => '备注'
	            )
			),'','',0,1);

			return $ordernum;
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][20][180]);  //提交失败，请重试！
		}

	}

	/**
		* 商家订座-更改订单状态，确认或取消
		* @return array
		*/
	public function dingzuoUpdateState(){
		global $dsql;
		global $userLogin;
		global $langData;

		$where = "";

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$param = $this->param;
		$id    = (int)$param['id'];
		$u     = (int)$param['u'];
		$state = (int)$param['state'];

		if(empty($id) || empty($state)) return array("state" => 200, "info" => "参数错误！");


		if($u){
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $uid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$store = $ret[0]['id'];
			}else{
				return array("state" => 200, "info" => $langData['siteConfig'][21][161]);  //权限验证错误
			}

			$where = " AND `sid` = $store";
		}else{
			$where = " AND `uid` = $uid";
		}

		$sql = $dsql->SetQuery("SELECT `sid`, `uid`, `state`, `time`, `note`, `contact`, `people` FROM `#@__business_dingzuo_order` WHERE `id` = $id".$where);
		$ret = $dsql->dsqlOper($sql, "results");
		if(!$ret){
			return array("state" => 200, "info" => $langData['siteConfig'][21][162]);  //订单不存在！
		}
		$sid     =  $ret[0]['sid'];
		$to      =  $ret[0]['uid'];
		$state_  =  $ret[0]['state'];
		$time    =  $ret[0]['time'];
		$contact =  $ret[0]['contact'];
		$people  =  $ret[0]['people'];
		$note    =  $ret[0]['note'];

		$date = GetMkTime(time());

		if($state_ == $state) return array("state" => 200, "info" => $langData['siteConfig'][21][199]);  //操作失败，请检查订单状态
		if($state_ == 2) return array("state" => 200, "info" => $langData['siteConfig'][21][200]);  //当前订单状态无法修改
		if($date >= $time && $state != 2) return array("state" => 200, "info" => $langData['siteConfig'][21][201]);  //此订单已过期

		if($state == 2){
			$cancel_bec = $param['cancel_bec'];
			$cancel_date = GetMkTime(time());

			$more = ", `cancel_bec` = '$cancel_bec', `cancel_date` = '$cancel_date', `cancel_adm` = 1";
		}
		$sql = $dsql->SetQuery("UPDATE `#@__business_dingzuo_order` SET `state` = $state ".$more." WHERE `id` = $id");
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == "ok"){

			if($u && $state == 1){

				$sql = $dsql->SetQuery("SELECT `title` FROM `#@__business_list` WHERE `id` = $sid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$store = $ret[0]['title'];
				}

				$param = array(
					"service"  => "member",
					"type" => "user",
					"template" => "order-business",
					"param"   => "type=dingzuo"
				);

				// 通知用户
				updateMemberNotice($to, "会员-订座成功", $param, array("contact" => $contact, 'store' => $store, "date" => date("Y-m-d H:i", $time), 'people' => $people, 'note' => $note, 'fields' => array(
					'keyword1' => '预留手机',
					'keyword2' => '订座门店',
					'keyword3' => '到店时间',
					'keyword4' => '人数',
					'keyword5' => '备注'
				)),'','',0,1);

			}


			return $langData['siteConfig'][20][244];  //操作成功
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][72]);  //操作失败，请重试！
		}


	}


	/**
		* 商家订座-获取商家指定日期的桌位信息
		* @return array
		*/
	public function dingzuoGetTable(){
		global $dsql;
		global $userLogin;
		global $langData;

		$param  = $this->param;
		$store  = (int)$param['store'];
		$people = (int)$param['people'];
		$date   = $param['date'];


		$now = GetMkTime(time());

		$hours = '';
		if($date){
			$day = explode(" ", $date)[0];
			$hours = explode(" ", $date)[1];
		}else{
			$day = date("Y-m-d", $now);
		}
		$day_start = strtotime($day." 00:00");
		$day_end = strtotime($day." 23:59");

		$setStageId = 0;
		if($hours){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__business_dingzuo_time` WHERE `typename` = '$hours'");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$setStageId = $ret[0]['id'];
			}else{
				return array("state" => 200, "info" => $langData['siteConfig'][21][202]);  //时间错误
			}
		}

		if(empty($store)) return array("state" => 200, "info" => $langData['siteConfig'][21][155]);  //未指定店铺


		$this->param = array("shopid" => $store, "type" => "dingzuo");
		$cfg = $this->serviceConfig();

		$stage        = array();	//时间段信息
		$time         = array();	//可预定时间点
		$table        = array();	//已预定桌位
		$have         = array();	//剩余桌位
		$canDealStage = array();	//可预定时间段

		if($cfg && !isset($cfg['state'])){

			if($cfg['dingzuo_state'] == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][203]);  //查询失败，商家关闭了订座功能

			// 提前预定的时间 s
			$dingzuo_advance_value = 0;
			if($cfg['dingzuo_advance_state'] == 1 && $cfg['dingzuo_advance_value']){
				$dingzuo_advance_value = $cfg['dingzuo_advance_value'] * ($cfg['dingzuo_advance_type'] == 0 ? 3600 : 86400);
			}



			// 查询所有桌位
			$tableList = array();
			$tableCount = 0;
			$sql = $dsql->SetQuery("SELECT * FROM `#@__business_dingzuo_table` WHERE `parentid` = 0 AND `type` = ".$cfg['id']." ORDER BY `weight` ASC");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				foreach ($ret as $key => $value) {
					$aid = $value['id'];

					$tableList[$key]['id']       = $aid;
					$tableList[$key]['typename'] = $value['typename'];
					$tableList[$key]['code']     = $value['code'];
					$tableList[$key]['min']      = $value['min'];
					$tableList[$key]['max']      = $value['max'];

					$lower = array();
					$sql = $dsql->SetQuery("SELECT * FROM `#@__business_dingzuo_table` WHERE `parentid` = $aid ORDER BY `weight` ASC");
					$res = $dsql->dsqlOper($sql, "results");
					if($res){
						foreach ($res as $k => $val) {
							$lower[$k]['id']       = $val['id'];
							$lower[$k]['typename'] = $val['typename'];

							$tableCount++;
						}
					}
					$tableList[$key]['lower'] = $lower;
				}
			}

			// 时间段
			$sql      = $dsql->SetQuery("SELECT * FROM `#@__business_dingzuo_time` WHERE `type` = $store AND `parentid` = 0 ORDER BY `weight` ASC");
			$stageCfg = $dsql->dsqlOper($sql, "results");
			if($stageCfg){
				foreach ($stageCfg as $key => $value) {

					$stageid = $value['id']; 	// 时间段id

					$start = "00:00";
					$end = "23:59";

					// 此时间段已预定的桌位
					$hasReserve = array();
					$checkSql = $dsql->SetQuery("SELECT `id`, `tableid`, `time` FROM `#@__business_dingzuo_order` WHERE `sid` = $store AND `timearea` = $stageid AND `time` >= $day_start AND `time` <= $day_end AND `tableid` != 0 AND `state` != 2");
					$checkRet = $dsql->dsqlOper($checkSql, "results");
					if($checkRet){
						foreach ($checkRet as $m => $v) {
							array_push($hasReserve, array(
								"tableid" => $v['tableid'],
								"time" => date("H:i", $v['time']),
								"stageid" => $stageid,	// 时间段
							));
						}
					}

					// 时间段类所有时间点
					$time = array();
					$sql       = $dsql->SetQuery("SELECT * FROM `#@__business_dingzuo_time` WHERE `parentid` = $stageid ORDER BY `weight` ASC");
					$hoursCfg = $dsql->dsqlOper($sql, "results");
					if($hoursCfg){
						foreach ($hoursCfg as $k => $val) {

							$time_house = $val['typename'];

							$time_ = strtotime($day." ".$time_house);

							// 当前时间早于最迟预定时间
							$last = $time_ - $dingzuo_advance_val;

							// 现在可预定的时间点
							if($now < $last){

								// 记录可预定的时间段
								if(!in_array($stageid, $canDealStage)){
									array_push($canDealStage, $stageid);
								}
								array_push($time, array(
									"parentid" => $stageid,
									"time" => trim($time_house),
									"date" => $day." ".trim($val['typename'])
								));

							}

							if($k == 0) $start = $time_house;
							if($k == count($hoursCfg) - 1) $end = $time_house;
						}
					}

					array_push($stage, array(
						"id" => $value["id"],
						"typename" => $value["typename"],
						"start" => $start,
						"end" => $end,
						"time" => $time,
						"hasReserve" => $hasReserve
					));
				}
			}

		}

		return array("stage" => $stage, "tableList" => $tableList, "tableCount" => $tableCount);

	}

	/**
	  * 商家订座-订单列表
	  */
	public function dingzuoOrder(){
		global $dsql;
		global $userLogin;
		global $langData;
		$userid = $userLogin->getMemberID();
		$state = $where = '';

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$state    = $this->param['state'];
				$u        = (int)$this->param['u'];
				$sid      = (int)$this->param['sid'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if($u){
			// 验证店铺
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $userid");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!$ret){
				return array("state" => 200, "info" => $langData['siteConfig'][21][161]);  //权限验证错误
			}else{
				$sid = $ret[0]['id'];
			}

			$where .= " AND `sid` = $sid";

		}else{
			$where .= " AND `uid` = $userid";
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		// 待确认
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_dingzuo_order` WHERE 1 = 1".$where);
		$totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");

		// 已确认
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_dingzuo_order` WHERE 1 = 1".$where);
		$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");

		// 已取消
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_dingzuo_order` WHERE 1 = 1".$where);
		$totalCancel = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

		// 总数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		if($state != ''){
			$where .= " AND `state` = $state";

			if($state == 0){
				$totalPage = ceil($totalGray/$pageSize);
			}elseif($state == 3){
				$totalPage = ceil($totalAudit/$pageSize);
			}

		}else{
			$totalPage = ceil($totalCount/$pageSize);
		}

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount,
			"totalGray" => $totalGray,
			"totalAudit" => $totalAudit,
			"totalCancel" => $totalCancel
		);

		$list = array();
		$atpage = ($page - 1) * $pageSize;
		$where .= " ORDER BY `state` ASC, `id` DESC LIMIT $atpage, $pageSize";
		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_dingzuo_order` WHERE 1 = 1".$where);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach ($results as $key => $value) {
				$list[$key]['id']          = $value['id'];
				$list[$key]['ordernum']    = $value['ordernum'];
				$list[$key]['state']       = $value['state'];
				$list[$key]['baofang']     = $value['baofang'];
				$list[$key]['baofang_only']     = $value['baofang_only'];
				$list[$key]['people']      = $value['people'];
				$list[$key]['note']        = $value['note'];
				$list[$key]['contact']     = $value['contact'];
				$list[$key]['cancel_bec']  = $value['cancel_bec'];
				$list[$key]['cancel_date'] = $value['cancel_date'] ? date("Y-m-d H:i:s", $value['cancel_date']) : "";
				$list[$key]['cancel_adm']  = $value['cancel_adm'];
				$list[$key]['pubdate']     = $value['pubdate'];
				$list[$key]['time']        = $value['time'];
				$list[$key]['name']        = $value['name'];
				$list[$key]['sex']         = $value['sex'];


				// 查询桌位信息
				$table = "";
				if($value['tableid']){
					$sql = $dsql->SetQuery("SELECT t1.`typename`, t2.`typename` AS ptypename FROM `#@__business_dingzuo_table` t1 LEFT JOIN `#@__business_dingzuo_table` t2 ON t2.`id` = t1.`parentid` WHERE t1.`id` = ".$value['tableid']);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$table = $ret[0]['ptypename']." ".$ret[0]['typename'];
					}
				}

				$list[$key]['table'] = $table;

				if($u){

					/*$user = '';
					$sql = $dsql->SetQuery("SELECT `nickname`, `username`, `photo` FROM `#@__member` WHERE `id` = ".$value['uid']);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$user = array(
							'name' => empty($ret[0]['nickname']) ? $ret[0]['username'] : $ret[0]['nickname'],
							'photo' => empty($ret[0]['photo']) ? '' : getFilePath($ret[0]['photo'])
						);
					}
					$list[$key]['user'] = $user;*/

				// 商家信息
				}else{
					$sql = $dsql->SetQuery("SELECT `title`, `logo` FROM `#@__business_list` WHERE `id` = ".$value['sid']);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$param = array(
							"service" => "business",
							"templates" => "detail",
							"id" => $value['sid']
						);
						$url = getUrlPath($param);
						$list[$key]['store'] = array(
							"id" => $value['sid'],
							"title" => $ret[0]['title'],
							"logo" => $ret[0]['logo'] ? getFilePath($ret[0]['logo']) : "",
							"url" => $url
						);
					}
				}

			}

			return array("pageInfo" => $pageinfo, "list" => $list);
		}else{

			return array("pageInfo" => $pageinfo, "list" => $list);
		}

	}

	/**
		* 商家排队-修改配置
		* @return array
		*/
	public function paiduiSaveConfig(){
		global $dsql;
		global $userLogin;
		global $langData;

		$param = $this->param;

		$paidui_state = (int)$param['paidui_state'];
		$paidui_juli_limit = (int)$param['paidui_juli_limit'];
		$paidui_oncetime = (int)$param['paidui_oncetime'];
		$paidui_overdue = $param['paidui_overdue'];

		$paidui_overdue = empty($paidui_overdue) ? $langData['siteConfig'][21][204] : $paidui_overdue;  //过号作废，请重新取号
		$paidui_oncetime = empty($paidui_oncetime) ? 60 : $paidui_oncetime;

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `paidui_state` = '$paidui_state', `paidui_juli_limit` = '$paidui_juli_limit', `paidui_oncetime` = '$paidui_oncetime', `paidui_overdue` = '$paidui_overdue' WHERE `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == "ok"){
        
            //记录用户行为日志
            memberLog($uid, 'business', 'paidui', 0, 'update', '修改商家排队配置', '', $sql);

			return $langData['siteConfig'][20][229];  //修改成功
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][159]);  //修改失败，请重试
		}

	}

	/**
		* 商家排队-查询当前排队情况
		* @return array
		*/
	public function paiduiCat(){
		global $dsql;
		global $userLogin;
		global $langData;

		$param   = $this->param;
		$store   = (int)$param['store'];
		if(empty($store)) return array("state" => 200, "info" => "参数错误");

		$list = array();

		// 桌位类型
		$sql    = $dsql->SetQuery("SELECT * FROM `#@__business_dingzuo_table` WHERE `type` = $store AND `parentid` = 0 ORDER BY `weight` ASC");
		$tabRet = $dsql->dsqlOper($sql, "results");
		if($tabRet){
			foreach ($tabRet as $key => $value) {
				$sql   = $dsql->SetQuery("SELECT `id` FROM `#@__business_paidui_order` WHERE `sid` = $store AND `type` = ".$value['id']." AND `state` = 0");
				$count = $dsql->dsqlOper($sql, "totalCount");

				$list[$key] = array(
					"id" => $value["id"],
					"typename" => $value["typename"],
					"code" => $value["code"],
					"min" => $value["min"],
					"max" => $value["max"],
					"count" => $count,
				);
			}
			return $list;
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][205]);  //店铺暂未配置
		}


	}

	/**
		* 商家排队-用户下单
		* @return array
		*/
	public function paiduiDeal(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$param   = $this->param;
		$store   = (int)$param['store'];
		$people  = (int)$param['people'];

		if(empty($store)) return array("state" => 200, "info" => "参数错误");
		if(empty($people)) return array("state" => 200, "info" => $langData['siteConfig'][21][184]);  //请选择人数

		$time = GetMkTime($time);
		$pubdate = GetMkTime(time());

		$this->param = array("shopid" => $store, "type" => "paidui");
		$cfg = $this->serviceConfig();

		if($cfg && !isset($cfg['state'])){

			if($cfg['paidui_state'] == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][206]);  //提交失败，商家关闭了排队功能

			$archives = $dsql->SetQuery("SELECT * FROM `#@__business_dingzuo_table` WHERE `type` = $store AND `parentid` = 0 ORDER BY `max` ASC");
			$tableCfg = $dsql->dsqlOper($archives, "results");

			$type = 0;
			$typename = "";
			if($tableCfg){
				$typecount = count($tableCfg);
				foreach ($tableCfg as $key => $value) {
					if($people <= $value['max'] && $people >= $value['min']){
						$type = $value['id'];
						$typename = $value['code'];
						break;
					}
				}
				// 没有合适类型的桌位
				if(!$type){
					if($people < $tableCfg[0]['min']){
						$type = $tableCfg[0]['id'];
						$typename = $tableCfg[0]['code'];
					}elseif($people > $tableCfg[$typecount-1]['max']){
						$type = $tableCfg[$typecount-1]['id'];
						$typename = $tableCfg[$typecount-1]['code'];
					}
				}
                //当天
                $todayk = strtotime(date('Y-m-d'));
                //当天结束
                $todaye = strtotime(date('Y-m-d 23:59:59'));
				// 查找该类型桌位当天排队总数
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_paidui_order` WHERE `sid` = $store AND `type` = $type AND `pubdate` > $todayk AND `pubdate` < $todaye");
				$count = $dsql->dsqlOper($sql, "totalCount");

				$ordernum = create_ordernum();
				$table = $typename.($count+1);

				$sql = $dsql->SetQuery("INSERT INTO `#@__business_paidui_order` (`uid`, `sid`, `ordernum`, `type`, `tablenum`, `people`, `pubdate`, `state`) VALUES ('$uid', '$store', '$ordernum', '$type', '$table', '$people', '$pubdate', '0')");
				$aid = $dsql->dsqlOper($sql, "lastid");
				if(is_numeric($aid)){
					$to = $uid;
					$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_paidui_order` WHERE `sid` = $store AND `state` = 0 AND `type` = $type AND `id` < $aid");
					$before = $dsql->dsqlOper($sql, "totalCount");
					// 通知用户
					$param = array(
						"service"  => "member",
						"type" => "user",
						"template" => "order-business",
						"param"   => "type=paidui"
					);
					updateMemberNotice($to, "会员-排队成功", $param, array(
						'type' => $langData['siteConfig'][21][207],  //排队成功通知
						'store' => $cfg['title'],
						"table" => $table,
						'before' => $before,
						'time' => $cfg['paidui_oncetime'] * $before . $langData['siteConfig'][13][45],  //分钟
						'overdue' => $cfg['paidui_overdue'],
						'body' => str_replace('1', $store, str_replace('2', $table, str_replace('3', $before, $langData['siteConfig'][21][208]))),  //您在1取号成功，桌位号：2，在您之前还有3人。
						'fields' => array(
							'keyword1' => '商家名称',
							'keyword2' => '排队号码',
							'keyword3' => '前方排队数',
							'keyword4' => '预计等待时长',
						)
					),'','',0,1);

					// 通知商家
					$param = array(
						"service"  => "member",
						"template" => "business-paidui-order"
					);
					updateMemberNotice($cfg['uid'], "会员-排队成功", $param, array(
						'type' => $langData['siteConfig'][21][209],  //您有新的排队订单
						'store' => $cfg['title'],
						"table" => $table,
						'before' => $before,
						'time' => $cfg['paidui_oncetime'] * $before . $langData['siteConfig'][13][45],  //分钟
						'overdue' => $cfg['paidui_overdue'],
						'body' => $langData['siteConfig'][21][209],  //您有新的排队订单
						'fields' => array(
							'keyword1' => '商家名称',
							'keyword2' => '排队号码',
							'keyword3' => '前方排队数',
							'keyword4' => '预计等待时长',
						)
					),'','',0,1);

					return $ordernum;
				}else{
					return array("state" => 200, "info" => $langData['siteConfig'][20][180]);  //提交失败，请重试！
				}

			}else{
				if(empty($store)) return array("state" => 200, "info" => $langData['siteConfig'][20][180]);  //提交失败，请重试！
			}

		}
	}

	/**
	  * 商家排队-订单列表
	  */
	public function paiduiOrder(){
		global $dsql;
		global $userLogin;
		global $langData;
		$userid = $userLogin->getMemberID();
		$state = $where = '';

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$state    = $this->param['state'];
				$u        = (int)$this->param['u'];
				$sid      = (int)$this->param['sid'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if($u){
			// 验证店铺
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $userid");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!$ret){
				return array("state" => 200, "info" => $langData['siteConfig'][21][161]);  //权限验证错误
			}else{
				$sid = $ret[0]['id'];
			}

			$where .= " AND `sid` = $sid";

		}else{
			$where .= " AND `uid` = $userid";
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		// 排队中
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_paidui_order` WHERE 1 = 1".$where);
		$totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");

		// 已结束
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_paidui_order` WHERE 1 = 1".$where);
		$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");

		// 已取消
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_paidui_order` WHERE 1 = 1".$where);
		$totalCancel = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

		// 总数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");
		if($state != ''){
			$where .= " AND `state` = $state";

			if($state == 0){
				$totalPage = ceil($totalGray/$pageSize);
			}elseif($state == 1){
				$totalPage = ceil($totalAudit/$pageSize);
			}elseif($state == 2){
				$totalPage = ceil($totalCancel/$pageSize);
			}

		}else{
			$totalPage = ceil($totalCount/$pageSize);
		}

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount,
			"totalGray" => $totalGray,
			"totalAudit" => $totalAudit,
			"totalCancel" => $totalCancel
		);

		$list = array();
		$atpage = ($page - 1) * $pageSize;
		$where .= " ORDER BY `state` ASC, `id` DESC LIMIT $atpage, $pageSize";
		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_paidui_order` WHERE 1 = 1".$where);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach ($results as $key => $value) {
				$list[$key]['id']          = $value['id'];
				$list[$key]['ordernum']    = $value['ordernum'];
				$list[$key]['table']       = $value['tablenum'];
				$list[$key]['state']       = $value['state'];
				$list[$key]['people']      = $value['people'];
				$list[$key]['cancel_bec']  = $value['cancel_bec'];
				$list[$key]['cancel_date'] = $value['cancel_date'] ? date("Y-m-d H:i:s", $value['cancel_date']) : "";
				$list[$key]['pubdate']     = $value['pubdate'];

				if($u){

					$user = '';
					$sql = $dsql->SetQuery("SELECT `nickname`, `username`, `photo` FROM `#@__member` WHERE `id` = ".$value['uid']);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$user = array(
							'name' => empty($ret[0]['nickname']) ? $ret[0]['username'] : $ret[0]['nickname'],
							'photo' => empty($ret[0]['photo']) ? '' : getFilePath($ret[0]['photo'])
						);
					}
					$list[$key]['user'] = $user;

				// 商家信息,排队进展
				}else{
					$sql = $dsql->SetQuery("SELECT `title`, `logo` FROM `#@__business_list` WHERE `id` = ".$value['sid']);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$param = array(
							"service" => "business",
							"templates" => "detail",
							"id" => $value['sid']
						);
						$url = getUrlPath($param);
						$list[$key]['store'] = array(
							"id" => $value['sid'],
							"title" => $ret[0]['title'],
							"logo" => $ret[0]['logo'] ? getFilePath($ret[0]['logo']) : "",
							"url" => $url
						);
					}

					$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_paidui_order` WHERE `sid` = ".$value['sid']." AND `state` = 0 AND `type` = ".$value['type']." AND `id` < ".$value['id']);
					$before = $dsql->dsqlOper($sql, "totalCount");

					$list[$key]['before'] = $before;

				}

			}

			return array("pageInfo" => $pageinfo, "list" => $list);
		}else{

			return array("pageInfo" => $pageinfo, "list" => $list);
		}

	}

	/**
		* 商家排队-更改订单状态，确认或取消
		* @return array
		*/
	public function paiduiUpdateState(){
		global $dsql;
		global $userLogin;
		global $langData;

		$where = "";

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$param = $this->param;
		$u     = (int)$param['u'];
		$id    = (int)$param['id'];
		$state = (int)$param['state'];

		if(empty($id) || empty($state)) return array("state" => 200, "info" => "参数错误！");

		if($u){
			$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__business_list` WHERE `uid` = $uid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$store     = $ret[0]['id'];
				$storename =  $ret[0]['title'];
				$oncetime  =  $ret[0]['paidui_oncetime'];
				$overdue   =  $ret[0]['paidui_overdue'];
			}else{
				return array("state" => 200, "info" => $langData['siteConfig'][21][161]);  //权限验证错误
			}

			$where = " AND `sid` = $store";
		}else{
			$where = " AND `uid` = $uid";
		}

		$sql = $dsql->SetQuery("SELECT * FROM `#@__business_paidui_order` WHERE `id` = $id".$where);
		$ret = $dsql->dsqlOper($sql, "results");
		if(!$ret){
			return array("state" => 200, "info" => $langData['siteConfig'][21][162]);  //订单不存在！
		}
		$state_ =  $ret[0]['state'];
		$to     =  $ret[0]['uid'];
		$table  =  $ret[0]['tablenum'];
		$sid    =  $ret[0]['sid'];


		if($state_ == $state) array("state" => 200, "info" => $langData['siteConfig'][21][199]);  //操作失败，请检查订单状态
		if($state_ == 2) array("state" => 200, "info" => $langData['siteConfig'][21][200]);  //当前订单状态无法修改

		if($state == 2){
			$cancel_bec = empty($param['cancel_bec']) ? $langData['siteConfig'][16][155] : $param['cancel_bec'];  //用户取消
			$cancel_date = GetMkTime(time());

			$more = ", `cancel_bec` = '$cancel_bec', `cancel_date` = '$cancel_date', `cancel_adm` = 1";
		}
		$sql = $dsql->SetQuery("UPDATE `#@__business_paidui_order` SET `state` = $state ".$more." WHERE `id` = $id");
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == "ok"){

			if($state == 2){
				// 通知用户
				$param = array(
					"service"  => "member",
					"type" => "user",
					"template" => "order-business",
					"param"   => "type=paidui"
				);

				$config = array(
					'store' => $storename,
					'cancel_bec' => $cancel_bec,
					'fields' => array(
						'keyword1' => '商家名称',
						'keyword2' => '取消原因'
					)
				);

				updateMemberNotice($to, "会员-排队取消", $param, $config,'','',0,1);
			}
			// 通知用户排队进站
			$this->paiduiNoticeMenber($sid);
			return $langData['siteConfig'][20][244];  //操作成功
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][72]);  //操作失败，请重试！
		}


	}


	/**
		* 商家排队-获取当前登陆用户在指定商家的排队情况
		* @return array
		*/
	public function paiduiGetMyorder(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$param = $this->param;
		$store   = (int)$param['store'];

		if(empty($store)) return array("state" => 200, "info" => "参数错误！");


		$archives = $dsql->SetQuery("SELECT `id`, `type`, `tablenum` FROM `#@__business_paidui_order` WHERE `uid` = $uid AND `sid` = $store AND `state` = 0 ORDER BY `id` ASC");
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$list = array();

			foreach ($results as $key => $value) {
				$list[$key]['id'] = $value['id'];
				$list[$key]['table'] = $value['tablenum'];

				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_paidui_order` WHERE `sid` = $store AND `state` = 0 AND `type` = ".$value['type']." AND `id` < ".$value['id']);
				$before = $dsql->dsqlOper($sql, "totalCount");

				$list[$key]['before'] = $before;
			}
			return $list;
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据
		}
	}


	/**
		* 商家排队-通知用户排队进展
		* @return array
		*/
	public function paiduiNoticeMenber($sid){
		global $dsql;
		global $langData;

		$sid = (int)$sid;

		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_paidui_order` WHERE `state` = 0 AND `sid` = $sid ORDER BY `id` ASC");
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach ($results as $key => $value) {
				$id       = $value['id'];
				$sid      = $value['sid'];
				$uid      = $value['uid'];
				$type     = $value['type'];
				$table    = $value['tablenum'];
				$ordernum = $value['ordernum'];

				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_paidui_order` WHERE `sid` = $sid AND `state` = 0 AND `type` = $type AND `id` < $id");
				$before = $dsql->dsqlOper($sql, "totalCount");

				// 通知用户
				$param = array(
					"service"  => "business",
					"template" => "paidui-results",
					"ordernum"   => $ordernum
				);

				$sql = $dsql->SetQuery("SELECT `title`, `paidui_oncetime` FROM `#@__business_list` WHERE `id` = $sid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$store = $ret[0]['title'];
					$oncetime = $ret[0]['paidui_oncetime'];
				}

				if($before == 0){
					$date = $langData['siteConfig'][21][210];  //即将就餐，请及时前往商家
				}else{
					$date = date("H:i", (time() + $oncetime * $before));
				}

				$config = array(
					'store' => $store,
					'table' => $table,
					'before' => $before,
					'date' => $date,
					'fields' => array(
						'keyword1' => '商家名称',
						'keyword2' => '排队号码',
						'keyword3' => '前方排队数',
						'keyword4' => '预计开始时间'
					)
				);

				updateMemberNotice($uid, "会员-排队叫号通知", $param, $config,'','',0,1);

			}
		}


	}


	/**
		* 商家买单-修改配置
		* @return array
		*/
	public function maidanSaveConfig(){
		global $dsql;
		global $userLogin;
		global $langData;

		$param = $this->param;

		$maidan_state = (int)$param['maidan_state'];
		$maidan_youhui_open = (int)$param['maidan_youhui_open'];
		$maidan_not_youhui_open = (int)$param['maidan_not_youhui_open'];
		$maidan_youhui_value = (int)$param['maidan_youhui_value'];
		$maidan_youhui_limit = $param['maidan_youhui_limit'];
		$maidan_fenxiaoFee = (int)$param['maidan_fenxiaoFee'];
		$maidan_XfenxiaoFee = (int)$param['maidan_XfenxiaoFee'];

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `maidan_state` = '$maidan_state', `maidan_youhui_open` = '$maidan_youhui_open', `maidan_youhui_value` = '$maidan_youhui_value', `maidan_youhui_limit` = '$maidan_youhui_limit', `maidan_not_youhui_open` = '$maidan_not_youhui_open', `maidan_fenxiaoFee` = '$maidan_fenxiaoFee',`maidan_XfenxiaoFee` = '$maidan_XfenxiaoFee' WHERE `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == "ok"){
        
            //记录用户行为日志
            memberLog($uid, 'business', 'maidan', 0, 'update', '修改商家买单配置', '', $sql);

			return $langData['siteConfig'][20][229];  //修改成功
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][159]);  //修改失败，请重试
		}

	}


	/**
		* 用户买单-下单
		* @return array
		*/
	public function maidanDeal(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();

		$param = $this->param;

		$store = $param['store'];
		$amount = (float)$param['amount'];
		$amount_alone = (float)$param['amount_alone'];

		$date = GetMkTime(time());

		if(empty($store)) return array("state" => 200, "info" => "参数错误");
		if(empty($amount)) return array("state" => 200, "info" => $langData['siteConfig'][21][211]);  //请输入金额

		$this->param = array("shopid" => $store, "type" => "maidan");
		$cfg = $this->serviceConfig();

		$totalPrice = 0;

		if($cfg && !isset($cfg['state'])){

			if($cfg['maidan_state']){

                if($cfg['uid'] == $uid){
                    return array("state" => 200, "info" => "不能在自己的店铺买单");
                }

				// 开启了优惠
				if($cfg['maidan_youhui_open'] && $cfg['maidan_youhui_value']){
//					$totalPrice = ($amount) * (100 - $cfg['maidan_youhui_value']) / 100 + $amount_alone;
					$totalPrice = ($amount-$amount_alone) * (100 - $cfg['maidan_youhui_value']) /100 + $amount_alone;
				}else{
					$totalPrice = $amount + $amount_alone;
				}
                $totalPrice = sprintf("%.2f", $totalPrice);
				$pubdate = GetMkTime(time());
				$ordernum = create_ordernum();

				// 删除7天前未支付的记录
                $expiredTime = $date - 604800;
				$sql = $dsql->SetQuery("DELETE FROM `#@__business_maidan_order` WHERE `state` = 0 AND `pubdate` < $expiredTime");
				$dsql->dsqlOper($sql, "results");


				$sql = $dsql->SetQuery("INSERT INTO `#@__business_maidan_order` (`uid`, `ordernum`, `sid`, `pubdate`, `amount`, `amount_alone`, `youhui_value`, `payamount`, `paytype`, `state`) VALUES ('$uid', '$ordernum', '$store', '$pubdate', '$amount', '$amount_alone', '".$cfg['maidan_youhui_value']."', '$totalPrice', '$paytype', '0')");
				$oid = $dsql->dsqlOper($sql, "lastid");
				if(is_numeric($oid)){
                    $order = createPayForm("business",$ordernum, $totalPrice, '', $langData['siteConfig'][21][215],array(),1);  //商家买单
                    $timeout = GetMkTime(time()) + 1800;
                    $order['timeout'] = $timeout;

                    return  $order;
//					return $ordernum;
				}else{
					return array("state" => 200, "info" => $langData['siteConfig'][21][212]);  //订单提交失败
				}
			}else{
                return array("state" => 200, "info" => "该商家未开启买单功能");  //订单提交失败
            }

		}else{
            return array("state" => 200, "info" => "商家状态异常，买单失败！");  //订单提交失败
        }

	}


	/**
	 * 支付前验证帐户积分和余额
	 */
	public function checkPayAmount(){
		global $dsql;
		global $userLogin;
		global $cfg_pointName;
		global $cfg_pointRatio;
		global $langData;

		$userid   = $userLogin->getMemberID();
		$param    = $this->param;

		$ordernum   = $param['ordernum'];    //订单号
		$useBalance = $param['useBalance'];  //是否使用余额
		$balance    = $param['balance'];     //使用的余额
		$paypwd     = $param['paypwd'];      //支付密码
		$usePinput  = $param['usePinput'];   //是否使用积分
		$point      = $param['point'];       //使用的积分



		//验证订单
		$sql = $dsql->SetQuery("SELECT * FROM `#@__business_maidan_order` WHERE `ordernum` = '$ordernum' AND `state` = 0");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$totalPrice = $ret[0]['payamount'];
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][85]);  //提交失败！
		}

		// // 没有使用余额
		// if(empty($useBalance)){
		// 	return $totalPrice;
		// }

		// if($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		if(empty($ordernum)) return array("state" => 200, "info" => $langData['siteConfig'][21][85]);  //提交失败！

		//查询会员信息
		$userinfo  = $userLogin->getMemberInfo();
		$usermoney = $userinfo['money'];
		$userpoint = $userinfo['point'];
		$tit      = array();
		$useTotal = 0;

		//判断是否使用积分，并且验证剩余积分
		if($usePinput == 1 && !empty($point)){
			if($userpoint < $point) return array("state" => 200, "info" => $langData['travel'][13][17].$cfg_pointName.$langData['travel'][13][18]);//您的可用".$cfg_pointName."不足，支付失败！
			$useTotal += $point / $cfg_pointRatio;
			$tit[] = $cfg_pointName;
		}


		//判断是否使用余额，并且验证余额和支付密码
		if($useBalance == 1 && !empty($balance) && !empty($paypwd)){

			//验证支付密码
			$archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
			$results  = $dsql->dsqlOper($archives, "results");
			$res = $results[0];
			$hash = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
			if($res['paypwd'] != $hash) return array("state" => 200, "info" => $langData['siteConfig'][21][89]);  //支付密码输入错误，请重试！

			//验证余额
			if($usermoney < $balance) return array("state" => 200, "info" => $langData['siteConfig'][21][213]);  //您的余额不足，支付失败！

			$useTotal += $balance;
			$tit[] = "余额";
		}

		if($useTotal > $totalPrice) return array("state" => 200, "info" => $langData['siteConfig'][21][214]);  //您使用的余额超出订单总费用，请重新输入！

		//返回需要支付的费用
		return sprintf("%.2f", $totalPrice - $useTotal);

	}



	/**
		* 用户买单-下单&支付
		* @return array
		*/
	public function pay_(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();

		$param = $this->param;

		$store = $param['store'];
		$amount = (float)$param['amount'];
		$amount_alone = (float)$param['amount_alone'];
		$paytype = $param['paytype'];

		$date = GetMkTime(time());

		if(empty($store)) return array("state" => 200, "info" => "参数错误");
		if(empty($amount)) return array("state" => 200, "info" => $langData['siteConfig'][21][211]);  //请输入金额
		if(empty($paytype)) return array("state" => 200, "info" => $langData['siteConfig'][21][75]);  //请选择支付方式

		$this->param = array("shopid" => $store, "type" => "maidan");
		$cfg = $this->serviceConfig();

		$totalPrice = 0;

		if($cfg && !isset($cfg['state'])){

			if($cfg['maidan_state']){

				// 开启了优惠
				if($cfg['maidan_youhui_open'] && $cfg['maidan_youhui_value']){
					$totalPrice = ($amount - $amount_alone) * (100 - $cfg['maidan_youhui_value']) / 100 + $amount_alone;
				}else{
					$totalPrice = $amount + $amount_alone;
				}

				// 创建订单

				if($ordernum){
					//跳转至第三方支付页面
					createPayForm("business", $ordernum, $totalPrice, $paytype, $langData['siteConfig'][21][215]);  //商家买单
				}
				$pubdate = GetMkTime(time());
				$ordernum = create_ordernum();

				// 删除7天前未支付的记录
                $expiredTime = $date - 604800;
				$sql = $dsql->SetQuery("DELETE FROM `#@__business_maidan_order` WHERE `state` = 0 AND `pubdate` < $expiredTime");
				$dsql->dsqlOper($sql, "results");

				$sql = $dsql->SetQuery("INSERT INTO `#@__business_maidan_order` (`uid`, `ordernum`, `sid`, `pubdate`, `amount`, `amount_alone`, `youhui_value`, `payamount`, `paytype`, `state`) VALUES ('$uid', '$ordernum', '$store', '$pubdate', '$amount', '$amount_alone', '".$cfg['maidan_youhui_value']."', '$totalPrice', '$paytype', '0')");
				$oid = $dsql->dsqlOper($sql, "lastid");
				if(is_numeric($oid)){

					//跳转至第三方支付页面
					createPayForm("business", $ordernum, $totalPrice, $paytype, $langData['siteConfig'][21][215]);  //商家买单

				}else{
					$param = array(
						"service" => "business",
						"template" => "maidan",
						"id" => $store
					);
					$url = getUrlPath($param);
					die('<meta charset="UTF-8"><script type="text/javascript">alert("'.$langData['siteConfig'][21][216].'");top.location="'.$url.'";</script>');  //抱歉，支付失败，请重试！
				}

			}

		}

	}


	/**
		* 用户买单-支付
		* @return array
		*/
	public function pay(){
		global $dsql;
		global $userLogin;
		global $langData;
		global $cfg_pointRatio;
		$userid   = $userLogin->getMemberID();

		$param = $this->param;

		$ordernum   = $param['ordernum'];	 //订单号
		$paytype    = $param['paytype'];	 //支付方式
		$useBalance = $param['useBalance'];  //是否使用余额
		$balance    = $param['balance'];     //使用的余额
		$paypwd     = $param['paypwd'];      //支付密码

		$usePinput  = $param['usePinput'];
		$point      = $param['point'];
        $orderfinal = (int)$param['orderfinal'];   /*个人中心订单预下单 0,发起支付1 */
		$date = GetMkTime(time());

		if(empty($ordernum)) return array("state" => 200, "info" => "参数错误");
		if(empty($paytype)) return array("state" => 200, "info" => $langData['siteConfig'][21][75]);  //请选择支付方式

		$sql = $dsql->SetQuery("SELECT * FROM `#@__business_maidan_order` WHERE `ordernum` = '$ordernum' AND `state` = 0");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$order = $ret[0];
		}

		//验证需要支付的费用
		$payTotalAmount = $this->checkPayAmount();

		$param = array(
			"service"  => "business",
			"template" => "maidan",
			"id"       => $order['sid']
		);
		$url = getUrlPath($param);

		if(is_array($payTotalAmount)){
			header("location:".$url);
			die;
		}

		// $pubdate = GetMkTime(time());
		// $fields = array("`paydate` = $pubdate");
		// 如果使用了余额，更新订单使用余额信息
		// if($useBalance == 1 && !empty($balance) && !empty($paypwd)){
		// 	array_push($fields, "`balance` = $balance");
		// 	array_push($paytypeArr, "money");
		// }
		// if($payTotalAmount > 0){
		// 	array_push($paytypeArr, $paytype);
		// }
		// array_push($fields, "`paytype` = '".join(",", $paytypeArr)."'");

		// $sql = $dsql->SetQuery("UPDATE `#@__business_maidan_order` SET ".join(", ", $fields)." WHERE `ordernum` = '$ordernum'");
		// $ret = $dsql->dsqlOper($sql, "update");

		//如果有使用积分或余额则更新订单内容的价格策略
		if(($usePinput && !empty($point)) || ($useBalance && !empty($balance))){

			$pointMoney = $usePinput ? $point / $cfg_pointRatio : 0;	// swa190326
			$balanceMoney = $balance;

			$oprice = $order['payamount'];  //单个订单总价 = 数量 * 单价

				$usePointMoney = 0;
				$useBalanceMoney = 0;


				//先判断积分是否足够支付总价
				//如果足够支付：
				//1.把还需要支付的总价重置为0
				//2.积分总额减去用掉的
				//3.记录已经使用的积分
				if($oprice < $pointMoney){

					$pointMoney -= $oprice;
					$usePointMoney = $oprice;
					$oprice = 0;


				//积分不够支付再判断余额是否足够
				//如果积分不足以支付总价：
				//1.总价减去积分抵扣掉的部部分
				//2.积分总额设置为0
				//3.记录已经使用的积分
				}else{

					$oprice -= $pointMoney;
					$usePointMoney = $pointMoney;
					$pointMoney = 0;

					//验证余额是否足够支付剩余部分的总价
					//如果足够支付：
					//1.把还需要支付的总价重置为0
					//2.余额减去用掉的部分
					//3.记录已经使用的余额
					if($oprice < $balanceMoney){

						$balanceMoney -= $oprice;
						$useBalanceMoney = $oprice;
						$oprice = 0;

					//余额不够支付的情况
					//1.总价减去余额付过的部分
					//2.余额设置为0
					//3.记录已经使用的余额
					}else{

						$oprice -= $balanceMoney;
						$useBalanceMoney = $balanceMoney;
						$balanceMoney = 0;

					}

				}

				$pointMoney_ = $usePointMoney * $cfg_pointRatio;
				$payamount = $usePointMoney + $useBalanceMoney;
				$archives = $dsql->SetQuery("UPDATE `#@__business_maidan_order` SET `point` = '$pointMoney_', `balance` = '$useBalanceMoney',`paydate` = '$date'  WHERE `ordernum` = '$ordernum'");
				$dsql->dsqlOper($archives, "update");

		//如果没有使用积分或余额，重置积分&余额等价格信息
		}else{

			// $oprice = $order['amount'];  //单个订单总价 = 数量 * 单价

			$archives = $dsql->SetQuery("UPDATE `#@__business_maidan_order` SET `point` = '0', `balance` = '0', `payamount` = '$payTotalAmount', `paytype` = '$paytype' WHERE `ordernum` = '$ordernum'");
			$dsql->dsqlOper($archives, "update");
		}

		//如果需要支付的金额小于等于0，表示会员使用积分或余额已经付清了，不需要另外去支付
		if($payTotalAmount <= 0){
				//查询订单信息
				$date = GetMkTime(time());
				$paytype = array();
				$archives = $dsql->SetQuery("SELECT `uid`, `point`, `balance` FROM `#@__business_maidan_order` WHERE `ordernum` = '$ordernum'");
				$results  = $dsql->dsqlOper($archives, "results");
				$res = $results[0];
				$userid  = $res['uid'];   //购买用户ID
				$upoint   = $res['point'];    //使用的积分
				$ubalance = $res['balance'];  //使用的余额

				//扣除会员积分
				if(!empty($upoint) && $upoint > 0){
					// $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$userid'");
					// $dsql->dsqlOper($archives, "update");
					//
					// //保存操作日志
					// $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$userid', '0', '$upoint', '支付团购订单：$value', '$date')");
					// $dsql->dsqlOper($archives, "update");

					$paytype[] = "point";
				}

				//扣除会员余额
				if(!empty($ubalance) && $ubalance > 0){
					// $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$ubalance' WHERE `id` = '$userid'");
					// $dsql->dsqlOper($archives, "update");
					//
					// //保存操作日志
					// $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$userid', '0', '$ubalance', '支付团购订单：$value', '$date')");
					// $dsql->dsqlOper($archives, "update");

					$paytype[] = "money";
				}

            $paysql   = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
            $payre    = $dsql->dsqlOper($paysql,"results");
            if (!empty($payre)) {
                if($userid > 0){
                    //增加支付日志
                    $archives = $dsql->SetQuery("UPDATE  `#@__pay_log`  SET `ordertype` = 'business',`ordernum` ='$ordernum',`uid` = '$userid',`body` = '$ordernum',`amount` ='0',`paytype` ='".join(",", $paytype)."'
                         ,`state` = 1 WHERE `ordernum` = '$ordernum' AND `ordertype` = 'business' ");
                }
            }else{
                if($userid > 0){
                    $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('business', '$ordernum', '$userid', '$ordernum', 0, '$paytype', 1, $date)");
                    $dsql->dsqlOper($archives, "results");
                }

            }
			$dsql->dsqlOper($archives, "update");

			$this->param = array(
				"paytype" => join(",", $paytype),
				"ordernum" => $ordernum
			);

			$this->paySuccess();

			$param = array(
				"service"  => "business",
				"template" => "payreturn",
                "param" => "ordernum=" . $ordernum
			);
			$url = getUrlPath($param);

			//支付成功后跳转页面
			global $cfg_payReturnType;
			global $cfg_payReturnUrlPc;
			global $cfg_payReturnUrlTouch;

			if($cfg_payReturnType){

				//移动端自定义跳转链接
				if(isMobile() && $cfg_payReturnUrlTouch){
					$url = $cfg_payReturnUrlTouch;
				}

				//电脑端自定义跳转链接
				if(!isMobile() && $cfg_payReturnUrlPc){
					$url = $cfg_payReturnUrlPc;
				}
			}
            return  $url;
//			header("location:".$url);
//			die;
		}else{
			//跳转至第三方支付页面
			return createPayForm("business", $ordernum, $payTotalAmount, $paytype, $langData['siteConfig'][21][215]);  //商家买单
		}
	}

	/**
		* 支付成功
		* @return array
		*/
	public function paySuccess(){
		global $dsql;
		global $userLogin;
		global $langData;

		$param = $this->param;

		if(!empty($param)){

			$ordernum = $param['ordernum'];
			$paytype  = $param['paytype'];

			$where = $paytype == "money" ? " AND o.`ordernum` = '$ordernum'" : " AND l.`ordernum` = '$ordernum'";
			$date = GetMkTime(time());

			$archives = $dsql->SetQuery("SELECT o.`balance`, o.`amount`, o.`payamount`, o.`point`,l.`uid`,b.`id` sid, b.`cityid`, b.`title` store, b.`maidanFee`, b.`bonusMaidanFee`, b.`maidan_fenxiaoFee`,b.`maidan_XfenxiaoFee`, l.`transaction_id`,l.`id` pid,b.`uid` sjuid, b.`speakerDeviceSn` FROM `#@__business_maidan_order` o LEFT JOIN `#@__pay_log` l ON l.`body` = o.`ordernum` LEFT JOIN `#@__business_list` b ON b.`id` = o.`sid` WHERE o.`ordernum` = '$ordernum' AND o.`state` = 0");
			$results = $dsql->dsqlOper($archives, "results");
			if($results){

				$cityid  = $results[0]['cityid'];       // 店铺所在分站
				$store   = $results[0]['store'];	    // 店铺名称
				$amount_ = $results[0]['amount'];	    // 总金额
				$amount  = $results[0]['payamount'];	// 应付金额
				$balance = $results[0]['balance'];		// 使用的余额
				$uid     = $results[0]['uid'];          //消费人ID
				$sjuid   = $results[0]['sjuid'];        //商家的用户ID
				$sid     = $results[0]['sid'];        //商家ID
				$upoint  = $results[0]['point'];
				$pid     = $results[0]['pid'];
				$speakerDeviceSn     = $results[0]['speakerDeviceSn'];
				$transaction_id  = $results[0]['transaction_id'];
				$maidanFee = (float)$results[0]['maidanFee'];
				$bonusMaidanFee = (float)$results[0]['bonusMaidanFee'];
				$maidan_fenxiaoFee   = (float)$results[0]['maidan_fenxiaoFee'];
				$maidan_XfenxiaoFee  = (float)$results[0]['maidan_XfenxiaoFee'];


                //查询当前用户是否在此商家买过单
                $hasHistory = 0;
                if($uid > 0){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_maidan_order` WHERE `uid` = $uid AND `sid` = $sid AND `state` = 1");
                    $ret = $dsql->dsqlOper($sql, "totalCount");
                    if($ret > 0){
                        $hasHistory = 1;
                    }
                }

				$sql = $dsql->SetQuery("UPDATE `#@__business_maidan_order` SET `paydate` = '$date', `state` = 1 ,`paytype` = '$paytype' WHERE `ordernum` = '$ordernum'");
				$ret = $dsql->dsqlOper($sql, "update");
				
				//订单状态没有更新成功，不往下执行，防止出现重复结算问题
				if($ret != 'ok') return false;

				// 登陆用户
				if($uid != -1){
                
                    //记录用户行为日志
                    memberLog($uid, 'business', 'maidan', 0, 'update', '商家买单('.$ordernum.' => '.$amount_.'元)', '', $sql);

					// 扣除余额
					if($balance > 0){
						$sql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$balance' WHERE `id` = $uid");
						$dsql->dsqlOper($sql, "results");

                        $param = array(
                            "service"  => "member",
                            "type"  => "user",
                            "template" => "order-business",
                            "param"   => "type=maidan"
                        );
                        $urlParam = serialize($param);
                        $user  = $userLogin->getMemberInfo($uid, 1);
                        $usermoney = $user['money'];
//                        $money = sprintf('%.2f',($usermoney-$balance));
						//保存操作日志
                        $title = "买单消费";
						$info = $langData['siteConfig'][21][215]."：".$ordernum; //商家买单
						$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`pid`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$balance', '$info', '$date','business','maidan','$urlParam','$pid','$title','$ordernum','$usermoney')");
						$dsql->dsqlOper($archives, "lastid");
					}

					//扣除会员积分
					if(!empty($upoint) && $upoint > 0){
						$sql = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$uid'");
						$dsql->dsqlOper($sql, "results");
                        $user  = $userLogin->getMemberInfo($uid, 1);
                        $userpoint = $user['point'];
//                        $pointuser  = (int)($usermoney-$upoint);
						//保存操作日志
						$info = $langData['siteConfig'][21][215]."：".$ordernum; //商家买单
						$archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '0', '$upoint', '$info', '$date','xiaofei','$userpoint')");
						$dsql->dsqlOper($archives, "lastid");
					}

					// 通知用户
					$param = array(
						"service"  => "member",
						"type"  => "user",
						"template" => "order-business",
						"param"   => "type=maidan"
					);
					$currency = echoCurrency(array("type" => "symbol"));
					updateMemberNotice($uid, "会员-买单成功通知", $param, array(
						'type' => $langData['siteConfig'][21][217],  //买单成功通知
						'store' => $store,
						'ordernum' => $ordernum,
						'amount' => $amount_,
						'payamount' => $amount,
						"date" => date("H:i:s", $date),
						'body' => str_replace('1', $store, $langData['siteConfig'][21][218]).$currency.$balance,
						"fields" => array(
	        				'keyword1' => '商家名称',
	        				'keyword2' => '订单编号',
	        				'keyword3' => '订单金额',
	        				'keyword4' => '支付金额',
	        				'keyword5' => '订单时间'
	        			)
					));   //您在1买单成功，支付金额：
				}





				//扣除佣金
				global $cfg_businessMaidanFee;
				global $cfg_businessBonusMaidanFee;
				global $cfg_fzbusinessMaidanFee;

                //如果用的消费金支付，使用独立的抽成比例
                if($paytype == 'huoniao_bonus'){
                    $cfg_businessMaidanFee = !empty((float)$cfg_businessBonusMaidanFee)? (float)$cfg_businessBonusMaidanFee :(float)$cfg_businessMaidanFee;
                    $maidanFee = !empty((float)$bonusMaidanFee)? (float)$bonusMaidanFee :(float)$maidanFee;
                }

				$cfg_businessMaidanFee   = !empty((float)$maidanFee)? (float)$maidanFee :(float)$cfg_businessMaidanFee;
				$cfg_fzbusinessMaidanFee = (float)$cfg_fzbusinessMaidanFee;
				$fee = $amount * $cfg_businessMaidanFee / 100;
                $fee = floor($fee * 100) / 100; // 保留2位小数，不进行四舍五入，服务商分账时，不会四舍五入
				$fee = $fee < 0.01 ? 0 : $fee;  //平台得到的

				$amount_ = sprintf('%.2f', $amount - $fee);  //扣除平台应得后的剩余

				//获取transaction_id
				$transaction_id = $paytype = '';
				$sql = $dsql->SetQuery("SELECT `transaction_id`, `ordernum`,`id`,`amount`,`paytype` FROM `#@__pay_log` WHERE FIND_IN_SET('$ordernum',`body`) AND `state` = 1");
				$ret            = $dsql->dsqlOper($sql, "results");
				$pid            = '';
				$truepayprice   = 0;
				if ($ret) {
					$transaction_id = $ret[0]['transaction_id'];
					$paytype        = $ret[0]['paytype'];
					$pid            = $ret[0]['id'];
					$truepayprice   = $ret[0]['amount'];
				}

				//分销信息
                $fenxiaoTotalPrice = 0;  //实际分销金额
                $is_new_guess = 0;  // 是否新客
                $fenxiaoFee = 0;  //分销费用
				global $cfg_fenxiaoState;
				global $cfg_fenxiaoSource;
                global $cfg_fenxiaoDeposit;
				global $cfg_fenxiaoAmount;
				include HUONIAOINC . "/config/business.inc.php";
				$fenXiao = (int)$custommaidanFenXiao;

                // 分销只针对登录用户
				if($fenXiao && $uid > 0){

					//分销金额，默认比例
					//商家承担
					if ($cfg_fenxiaoSource) {
						$_fx_fee = $amount_ * $cfg_fenxiaoAmount / 100;
						$_fenxiaoAmount = $_fx_fee < 0.01 ? 0 : $_fx_fee;

					//平台承担
					}else{
						$_fx_fee = $fee * $cfg_fenxiaoAmount / 100;
						$_fenxiaoAmount = $_fx_fee < 0.01 ? 0 : $_fx_fee;
					}

					/*查找用户的推荐人是不是属于当前下单用户的推荐人*/
					$from_uidsql  = $dsql->SetQuery("SELECT `from_uid` FROM `#@__member` WHERE `id` = '$uid'");
					$from_uidres  = $dsql->dsqlOper($from_uidsql,"results");

                    //查询商家的推荐人是否为下单人，防止出现两个会员之前循环推荐
                    $sj_uidsql = $dsql->SetQuery("SELECT `from_uid` FROM `#@__member` WHERE `id` = " . $sjuid);
                    $sj_uidres = $dsql->dsqlOper($sj_uidsql, "results");

					$fenxiaoFee = $maidan_fenxiaoFee;

                    //如果下单人没有推荐人，则绑定下单为的推荐人为商家，并且不对此单进行分销，因为商家自己推荐的，不需要再出分销佣金
					if(empty($from_uidres[0]['from_uid']) && $sj_uidres[0]['from_uid'] != $uid){
						$sql = $dsql->SetQuery("UPDATE `#@__member` SET `from_uid` = '$sjuid' WHERE `id` = $uid");
						$dsql->dsqlOper($sql, "results");

                        $fenxiaoFee = 0;
                        $cfg_fenxiaoState = 0;
					}else{

                        //查询下单人是否在此商家下过单，如果没有下过，则是新客                        
                        if(!$hasHistory){
                            $is_new_guess = 1;
                            $fenxiaoFee = $maidan_XfenxiaoFee;
                        }

                    }

					//商家自定义分销比例
					if($fenxiaoFee > 0 && $uid != -1){
						//商家承担
						if ($cfg_fenxiaoSource) {
							$_fx_fee = $amount_ * $fenxiaoFee / 100;
							$_fenxiaoAmount = $_fx_fee < 0.01 ? 0 : $_fx_fee;

						//平台承担
						}else{
							$_fx_fee = $fee * $fenxiaoFee / 100;
							$_fenxiaoAmount = $_fx_fee < 0.01 ? 0 : $_fx_fee;
						}
					}

					//分佣 开关
					$fenxiaoTotalPrice = $_fenxiaoAmount;
					$fenxiaoparamarr['amount'] = $_fenxiaoAmount;
                    $precipitateMoney = 0;  //计算沉淀金额
					if ($cfg_fenxiaoState == 1) {
						(new member())->returnFxMoney("businessmaidan", $uid, $ordernum, $fenxiaoparamarr);
						$_title = '商家买单：'. $ordernum;
						//查询一共分销了多少佣金
                        $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_title' AND `module`= 'businessmaidan'");
                        $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                        //如果系统没有开启资金沉淀才需要查询实际分销了多少
                        if(!$cfg_fenxiaoDeposit){
                            $fenxiaoTotalPrice     = $fenxiaomonyeres[0]['allfenxiao'];
                        }else{
                            //沉淀的钱 = 应该分销的钱 - 实际分销的钱
                            $precipitateMoney = $_fenxiaoAmount - $fenxiaomonyeres[0]['allfenxiao'];
                        }
						
						//商家承担
						if ($cfg_fenxiaoSource) {
                            //记录沉淀资金
                            if($precipitateMoney > 0){
                                (new member())->recodePrecipitationMoney($sjuid,$ordernum,'商家买单：'.$ordernum,$precipitateMoney,$cityid,"business");
                            }
							$amount_ = $amount_ -  $fenxiaoTotalPrice;  //没有分佣完的钱在加给商家
						//平台承担
						} else {
							$fee  = $fee - $fenxiaoTotalPrice;  //没有分佣完的钱在加给平台
						}
					}

				}


				$amount_    = $amount_ < 0.01 ? 0 : $amount_;
				$fzFee = cityCommission($cityid,'businessMaidan');  //获取分站佣金比例
				//分站提成
				$fztotalAmount_ = $fee * (float)$fzFee / 100;

				$fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;

				$fee -= $fztotalAmount_;  //平台收入减去分站收入

				$fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
				$dsql->dsqlOper($fzarchives, "update");
				$paramBusi = array(
					"service"  => "member",
					"template" => "business-maidan-order"
				);
				$urlParam  = serialize($paramBusi);
				
				$user  = $userLogin->getMemberInfo($sjuid, 1);
				$usermoney = $user['money'];
				$money =  sprintf('%.2f',($usermoney + $amount_));
				$title = '商家买单';
				$info = $title . '：' . $ordernum;
				$now   = GetMkTime(time());

				//保存操作日志商家
				$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$sjuid', '1', '$amount_', '$info', '$now','business','shangpinxiaoshou','$pid','$urlParam','$title','$ordernum','$money')");
				$dsql->dsqlOper($archives, "update");

				//将费用转至商家帐户
				$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount_' WHERE `id` = '$sjuid'");
				$dsql->dsqlOper($archives, "update");
				
				//保存操作日志平台
				$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`ordernum`) VALUES ('$sjuid', '1', '$amount', '$info', '$now','$cityid','$fztotalAmount_','business',$fee,'1','shangpinxiaoshou','$ordernum')");
				$lastid = $dsql->dsqlOper($archives, "lastid");
				substationAmount($lastid,$cityid);

				// 记录账单详细
                $where_yj_recode = "";
                if($cfg_fenxiaoSource){ //商家分佣时，计算推广佣金，是否为新客，佣金百分比
                    $where_yj_recode = ",`tg_yj`=$fenxiaoTotalPrice,`xinke`=$is_new_guess, `yj_per`=$fenxiaoFee";
                }

                $sql_yj = $dsql->SetQuery("UPDATE `#@__business_maidan_order` SET `daozhang` = '$amount_',`pt_yj_per`= $cfg_businessMaidanFee $where_yj_recode WHERE `ordernum` = '$ordernum'");
                $dsql->dsqlOper($sql_yj, "update");


                //返积分
                global $cfg_returnPointState;
                global $cfg_returnPoint_maidan;
                if($cfg_returnPointState && $cfg_returnPoint_maidan){
                    $point = (int)($amount * $cfg_returnPoint_maidan / 100);
                    if($point > 0){
                        $now = time();
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + $point WHERE `id` = $uid");
                        $res = $dsql->dsqlOper($archives, "update");
                        if($res == "ok"){
                            $title = '商家买单';
                            $user  = $userLogin->getMemberInfo($uid, 1);
                            $userpoint = $user['point'];

                            //保存操作日志
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`, `balance`) VALUES ('$uid', '1', '$point', '$title', '$now','zengsong', '$userpoint')");
                            $dsql->dsqlOper($archives, "update");
                        }
                    }

                }


                //工行E商通银行分账
				rfbpShareAllocation(array(
					"uid" => $sjuid,
					"ordertitle" => $langData['siteConfig'][21][215],
					"ordernum" => $ordernum,
					"orderdata" => "",
					"totalAmount" => $amount,
					"amount" => $amount_,
					"channelPayOrderNo" => $transaction_id,
					"paytype" => $paytype
				));

				// 通知商家
				$param = array(
					"service"  => "member",
					"template" => "business-maidan-order"
				);
				updateMemberNotice($sjuid, "会员-买单成功通知", $param, array(
					'type' => $langData['siteConfig'][21][219],  //您有新的买单信息
					'store' => $store,
					'ordernum' => $ordernum,
					'amount' => $amount_,
					'payamount' => $amount,
					"date" => date("H:i:s", $date),
					'body' => $langData['siteConfig'][21][219],  //您有新的买单信息
					"fields" => array(
						'keyword1' => '商家名称',
						'keyword2' => '订单编号',
						'keyword3' => '订单金额',
						'keyword4' => '支付金额',
						'keyword5' => '订单时间'
					)
				));

				//云喇叭播报
				if($speakerDeviceSn){
					shoukuanSpeaker($speakerDeviceSn, $amount);
				}

			}
		}

	}
    

    /**
     * 商家买单-订单汇总
     */
    public function maidanOrderSummary(){
        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();
        // 1.接收参数
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);//'格式错误！'
            }else{
                $u = $this->param['u'];
                $keyword = $this->param['keyword'];
            }
        }
        // 2.条件处理
        $where = " AND `state` = 1";  // 订单状态
        if($u){
            // 通过商家Id，以及订单号查询订单

            // 验证店铺
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret){
                return array("state" => 200, "info" => $langData['siteConfig'][21][161]);  //权限验证错误
            }else{
                $sid = $ret[0]['id'];
            }

            $where .= " AND `sid` = $sid";
        }else{
            // 当前用户查看自己的订单
            $where .= " AND `uid` = $userid";
        }

        
		// 搜索订单号或金额
        if($keyword != ""){
            if(is_numeric($keyword)){
                $where .= " AND (`amount`= $keyword OR `daozhang`= $keyword OR `payamount`= $keyword OR `ordernum` = '$keyword')";
            }else{
                $where .= " AND `ordernum` = '$keyword'";
            }
        }

        // 3.查询数据并处理（统计每个月的收款条数，以及收款金额）
        $list = array();

        $sql = $dsql->SetQuery("SELECT `daozhang`,`paydate` FROM `#@__business_maidan_order` WHERE 1=1".$where);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach ($ret as $key => $value) {
                $date = date('Y-m', $value['paydate']);
                if(!$list[$date]){  // 添加不存在的date，已存在则无处理
                    $list[$date] = array();
                }
                // 处理金额
                $daozhang = $value['daozhang'] ? $value['daozhang'] : 0;
                $all_daozhang = $list[$date]['daozhang']? $list[$date]['daozhang'] : 0;
                $list[$date]['daozhang'] = sprintf("%.2f", ($all_daozhang + $daozhang));
                // 处理条数
                $all_count  = $list[$date]['count']? $list[$date]['count'] : 0;
                $list[$date]['count'] = ++$all_count;
            }
        }
        return $list;
    }
    /**
     * 买单详情页面
     */
    public function maidanOrderDetail(){
        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }
        // 1.至少传递订单号
        $id = $this->param;
        if(!is_numeric($id)){
            $id = $this->param['id'];
        }
        if(empty($id)){
            return array("state" => 200, "info" => '缺少订单参数：id');
        }
        // 2.不同用户查询
        $u = $this->param['u'];
        $where = "";
        if($u){
            // 通过商家Id，以及订单id查询订单

            // 验证店铺
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret){
                return array("state" => 200, "info" => $langData['siteConfig'][21][161]);  //权限验证错误
            }else{
                $sid = $ret[0]['id'];
            }

            $where .= " AND `sid` = $sid";
        }else{
            // 当前用户查看自己的订单
            $where .= " AND `uid` = $userid";
        }
        // 3.查询数据并返回

        $sql = $dsql->SetQuery("SELECT * FROM `#@__business_maidan_order` WHERE `id`=$id".$where);
        $ret = $dsql->dsqlOper($sql, "results");
        $detail = array();
        if($ret){
            $detail['id']           = $ret[0]['id'];
            $detail['uid']          = $ret[0]['uid'];
            $detail['sid']          = $ret[0]['sid'];
            $detail['ordernum']     = $ret[0]['ordernum'];
            $detail['pubdate']      = $ret[0]['pubdate'];
            $detail['paydate']      = $ret[0]['paydate'];
            $detail['paytype']      = getPaymentName($ret[0]['paytype']); // 支付方式
            $detail['amount']       = $ret[0]['amount'];
            $detail['state']        = $ret[0]['state'];
            $detail['amount_alone'] = $ret[0]['amount_alone'];
            $detail['youhui_value'] = $ret[0]['youhui_value'];
            $detail['payamount']    = $ret[0]['payamount'];
            $detail['point']    	= $ret[0]['point'];
            $detail['balance']    	= $ret[0]['balance'];
            $detail['xinke']        = (int)$ret[0]['xinke'];  // 新客
            $detail['daozhang']     = $ret[0]['daozhang']? $ret[0]['daozhang'] : 0;  //到账金额
            $detail['yj_per']       = (int)$ret[0]['yj_per'];    //佣金百分比
            $detail['pt_yj_per']    = (int)$ret[0]['pt_yj_per'];  // 平台佣金百分比
            $detail['tg_yj']        = $ret[0]['tg_yj']? $ret[0]['tg_yj'] : 0;      // 推广佣金

            $detail['youhui_amount'] = sprintf("%.2f", ($detail['amount'] - $detail['payamount']));
        }
        return $detail;

    }

	/**
	  * 商家买单-订单列表
	  */
	public function maidanOrder(){
		global $dsql;
		global $userLogin;
		global $langData;
		$userid = $userLogin->getMemberID();

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
		}

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$state    = $this->param['state'];
				$u        = (int)$this->param['u'];
				$sid      = (int)$this->param['sid'];
				$today    = (int)$this->param['today'];
				$starttime= $this->param['starttime'];
				$endtime  = $this->param['endtime'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
				$keyword      = trim($this->param['keyword']);
			}
		}

        if($starttime && strstr($starttime, "-")){
            $starttime = GetMkTime($starttime);
        }

        if($endtime && strstr($endtime, "-")){
            $endtime = GetMkTime($endtime) + 86400;
        }

		$where = " AND `state` = 1";

		if($u){
			// 验证店铺
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $userid");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!$ret){
				return array("state" => 200, "info" => $langData['siteConfig'][21][161]);  //权限验证错误
			}else{
				$sid = $ret[0]['id'];
			}

			$where .= " AND `sid` = $sid";

		}else{
			$where .= " AND `uid` = $userid";
		}

		if($state != ''){
			$where .= " AND `state` = $state";
		}
        //当天
        $todayk = strtotime(date('Y-m-d'));
        //当天结束
        $todaye = strtotime(date('Y-m-d 23:59:59'));
		//今日订单
		if($today){
			$where .= " AND `paydate` > $todayk AND `paydate` < $todaye";
		}

		// 时间筛选
        if($starttime){
            $where .= " AND `paydate` >= $starttime";
        }

        if($endtime){
            $where .= " AND `paydate` < $endtime";
        }

		// 搜索订单号或金额
        if($keyword!=""){
            if(is_numeric($keyword)){
                $where .= " AND (`amount`=$keyword OR `daozhang`=$keyword OR `payamount`=$keyword OR `ordernum` =  '$keyword')";
            }else{
                $where .= " AND `ordernum` =  '$keyword'";
            }
        }

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_maidan_order` WHERE 1 = 1".$where);

		$totalAmountSql = $dsql->SetQuery("SELECT sum(`daozhang`) totalAmount FROM `#@__business_maidan_order` WHERE 1 = 1".$where);
        $totalAmountRet = $dsql->dsqlOper($totalAmountSql." AND `state` = 1", "results");
        $totalAmount = (float)$totalAmountRet[0]['totalAmount'];

		// 已支付
		$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");

		// 未支付
		$totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");

		// 总数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		// 总页数
		$totalPage = ceil($totalCount/$pageSize);

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount,
			"totalAudit" => $totalAudit,
			"totalGray" => $totalGray,
			"totalAmount" => $totalAmount,
		);
		$list = array();
		$atpage = ($page - 1) * $pageSize;
		$where .= " ORDER BY `id` DESC LIMIT $atpage, $pageSize";
		$archives = $dsql->SetQuery("SELECT * FROM `#@__business_maidan_order` WHERE 1 = 1".$where);
		$results = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			foreach ($results as $key => $value) {
				$list[$key]['id']           = $value['id'];
				$list[$key]['uid']          = $value['uid'];
				$list[$key]['sid']          = $value['sid'];
				$list[$key]['ordernum']     = $value['ordernum'];
				$list[$key]['pubdate']      = $value['pubdate'];
				$list[$key]['paydate']      = $value['paydate'];
				$list[$key]['date']         = date('Y-m-d H:i:s', $value['paydate']);
				$list[$key]['paytype']      = getPaymentName($value['paytype']);
				// 跳转bill的ID
                if($value['paytype']=="money"){
                    $archives2 = $dsql->SetQuery("SELECT `id` FROM `#@__member_money` l WHERE `ordernum`='".$value['ordernum']."' AND `showtype`!=1");
                    $results2 = $dsql->dsqlOper($archives2, "results");
                    $list[$key]['billid'] = "mon".$results2[0]['id'];
                }
                elseif($value['paytype']=="huoniao_bonus"){
                    $archives2 = $dsql->SetQuery("SELECT `id` FROM `#@__member_bonus` l WHERE `ordernum`='".$value['ordernum']."'");
                    $results2 = $dsql->dsqlOper($archives2, "results");
                    $list[$key]['billid'] = "bon".$results2[0]['id'];
                }
                else{
                    $archives2 = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` l WHERE `ordernum`='".$value['ordernum']."'");
                    $results2 = $dsql->dsqlOper($archives2, "results");
                    $list[$key]['billid'] = "log".$results2[0]['id'];
                }
				$list[$key]['amount']       = $value['amount'];
				$list[$key]['state']        = $value['state'];
				$list[$key]['amount_alone'] = $value['amount_alone'];
				$list[$key]['youhui_value'] = $value['youhui_value'];
				$list[$key]['payamount']    = $value['payamount'];
				$list[$key]['point']    	= $value['point'];
				$list[$key]['balance']    	= $value['balance'];
				$list[$key]['xinke']        = (int)$value['xinke'];  // 新客
				$list[$key]['daozhang']     = $value['daozhang']? $value['daozhang'] : 0;  //到账金额
                $list[$key]['yj_per']       = (int)$value['yj_per'];    //佣金百分比
                $list[$key]['pt_yj_per']    = (int)$value['pt_yj_per'];  // 平台佣金百分比
                $list[$key]['tg_yj']        = $value['tg_yj']? $value['tg_yj'] : 0;      // 推广佣金


				if($u){

					// $user = '';
					// if($value['uid'] == -1){
					// 	$user = '未登陆用户';
					// }else{
					// 	$sql = $dsql->SetQuery("SELECT `nickname`, `username`, `photo` FROM `#@__member` WHERE `id` = ".$value['uid']);
					// 	$ret = $dsql->dsqlOper($sql, "results");
					// 	if($ret){
					// 		$user = array(
					// 			'name' => empty($ret[0]['nickname']) ? $ret[0]['username'] : $ret[0]['nickname'],
					// 			'photo' => empty($ret[0]['photo']) ? '' : getFilePath($ret[0]['photo'])
					// 		);
					// 	}
					// }
					// $list[$key]['user'] = $user;

				// 商家信息
				}else{
					$sql = $dsql->SetQuery("SELECT `title`, `logo` FROM `#@__business_list` WHERE `id` = ".$value['sid']);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$param = array(
							"service" => "business",
							"templates" => "detail",
							"id" => $value['sid']
						);
						$url = getUrlPath($param);
						$list[$key]['store'] = array(
							"id" => $value['sid'],
							"title" => $ret[0]['title'],
							"logo" => $ret[0]['logo'] ? getFilePath($ret[0]['logo']) : "",
							"url" => $url
						);
					}
				}
			}
            // 商家时间段收入统计
			if($u && $page==1){
			    $static_where = " AND `state` = 1 AND `sid` = $sid"; // 这里的条件是固定的
                // 今日
                $t_start=strtotime(date("Y-m-d"));  // 今日开始时间
                $t_end=$t_start+60*60*24;   // 今天结束时间
                $archives = $dsql->SetQuery("SELECT count(`id`) totalCount,sum(`daozhang`) totalMoney FROM `#@__business_maidan_order` WHERE `paydate`>$t_start AND `paydate`<$t_end".$static_where);
                $results = $dsql->dsqlOper($archives, "results");
                if($results){
                    $count = $results[0]['totalCount'];
                    $money = $results[0]['totalMoney'];
                    $pageinfo['curday']['count'] = (int)$count;
                    $pageinfo['curday']['money'] = $money==null?0:$money;
                }
                // 昨日
                $t_end=$t_start;    // 昨天结束时间为今天开始时间
                $t_start= $t_end-60*60*24;  // 昨天开始时间
                $archives = $dsql->SetQuery("SELECT count(`id`) totalCount,sum(`daozhang`) totalMoney FROM `#@__business_maidan_order` WHERE `paydate`>$t_start AND `paydate`<$t_end".$static_where);
                $results = $dsql->dsqlOper($archives, "results");
                if($results){
                    $count = $results[0]['totalCount'];
                    $money = $results[0]['totalMoney'];
                    $pageinfo['preday']['count'] = (int)$count;
                    $pageinfo['preday']['money'] = $money==null?0:$money;
                }

                // 本月
                $t_start = strtotime(date("Y-m-1"));   // 本月开始时间
                $t_end   = time();  // 到现在为止
                $archives = $dsql->SetQuery("SELECT count(`id`) totalCount,sum(`daozhang`) totalMoney FROM `#@__business_maidan_order` WHERE `paydate`>$t_start AND `paydate`<$t_end".$static_where);
                $results = $dsql->dsqlOper($archives, "results");
                if($results){
                    $count = $results[0]['totalCount'];
                    $money = $results[0]['totalMoney'];
                    $pageinfo['curMon']['count'] = (int)$count;
                    $pageinfo['curMon']['money'] = $money==null?0:$money;
                }

                // 上月
                $t_end = $t_start;   // 上月结束时间，为本月开始时间
                $t_start =strtotime(date('Y-m-1',strtotime('last month')));  // 上月开始时间
                $archives = $dsql->SetQuery("SELECT count(`id`) totalCount,sum(`daozhang`) totalMoney FROM `#@__business_maidan_order` WHERE `paydate`>$t_start AND `paydate`<$t_end".$static_where);
                $results = $dsql->dsqlOper($archives, "results");
                if($results){
                    $count = $results[0]['totalCount'];
                    $money = $results[0]['totalMoney'];
                    $pageinfo['preMon']['count'] = (int)$count;
                    $pageinfo['preMon']['money'] = $money==null?0:$money;
                }
                // 查询全部收入条数，以及全部到账金额
                $archives = $dsql->SetQuery("SELECT count(`id`) totalCount,sum(`daozhang`) totalMoney FROM `#@__business_maidan_order` WHERE 1 = 1".$static_where);
                $results = $dsql->dsqlOper($archives, "results");
                if($results){
                    $count = $results[0]['totalCount'];
                    $money = $results[0]['totalMoney'];
                    $pageinfo['total']['count'] = (int)$count;
                    $pageinfo['total']['money'] = $money==null?0:$money;
                }
            }

			return array("pageInfo" => $pageinfo, "list" => $list);
		}else{

			return array("pageInfo" => $pageinfo, "list" => $list);
		}

	}

	/**
		* 商家餐饮服务-用户取消订单
		* @return array
		*/
	public function serviceCancelOrder(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$param = $this->param;
		$id    = (int)$param['id'];
		$type  = $param['type'];
		$cancel_bec  = $param['cancel_bec'];

		if(empty($id) || empty($type)) return array("state" => 200, "info" => "参数错误！");

		$sql = $dsql->SetQuery("SELECT `state`, `sid` FROM `#@__business_".$type."_order` WHERE `uid` = $uid AND `id` = $id");
		$ret = $dsql->dsqlOper($sql, "results");
		if(!$ret){
			return array("state" => 200, "info" => $langData['siteConfig'][21][161]);  //订单不存在！
		}

		$sid = $ret[0]['sid'];
		$state_ = $ret[0]['state'];
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][21][220]);  //更新失败，请检查订单状态

		// 订座和排队可取消
		if($type == "dingzuo" || $type == "paidui"){
			$state = 2;
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][20][295]);  //操作失败
		}

		$state = 2;

		$date = GetMkTime(time());

		$sql = $dsql->SetQuery("UPDATE `#@__business_".$type."_order` SET `state` = $state, `cancel_bec` = '$cancel_bec', `cancel_date` = '$date', `cancel_adm` = 0 WHERE `id` = $id");
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == "ok"){
			if($type == "paidui"){
				// 通知用户排队进展
				$this->paiduiNoticeMenber($sid);
			}
			return $langData['siteConfig'][20][244];  //操作成功
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][20][295]);  //操作失败！
		}

	}


	public function serviceOrderDel(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$param = $this->param;
		$id    = (int)$param['id'];
		$type  = $param['type'];

		if(empty($id) || empty($type)) return array("state" => 200, "info" => "参数错误！");

		$sql = $dsql->SetQuery("SELECT `state` FROM `#@__business_".$type."_order` WHERE `id` = $id AND `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if(!$ret) return array("state" => 200, "info" => $langData['siteConfig'][21][161]);  //订单不存在！

		$state = $ret[0]['state'];

		$del = false;	// 是否删除订单
		if($type == "dingzuo"){
			if($state != 1){
				$del = true;
			}
		}

		if($del){
			$sql = $dsql->SetQuery("DELETE FROM `#@__business_".$type."_order` WHERE `id` = $id");
			$dsql->dsqlOper($sql, "results");
			$ret = "ok";
		}else{
			$sql = $dsql->SetQuery("UPDATE `#@__business_".$type."_order` SET `del` = 1 WHERE `id` = $id");
			$ret = $dsql->dsqlOper($sql, "results");
		}
		if($ret == "ok"){
			return $langData['siteConfig'][20][244];  //操作成功
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][20][295]);  //操作失败！
		}
	}

    
    /**
     * 商家入驻，提交资料
    */
    public function businessJoin(){
        global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

        //身份识别状态
        global $cfg_cardState;
        global $cfg_enterpriseBusinessDataState;
        $cardState = (int)$cfg_cardState;  //身份证识别  0关闭  1开启
        $enterpriseBusinessDataState = (int)$cfg_enterpriseBusinessDataState;  //企业身份证识别  0关闭  1开启


		//入驻审核开关
		include HUONIAOINC."/config/business.inc.php";
		$joinState = (int)$customJoinState;  //商家入驻功能   0开启  1关闭
		$joinCheck = (int)$customJoinCheck;  //商家新入驻  0需要审核  1不需要审核
        $joinRepeat = (int)$customJoinRepeat;  //企业重复入驻  0不限制   1限制
        $joinCheckMaterial = $customJoinCheckMaterial ? explode(',', $customJoinCheckMaterial) : array();  //入驻认证材料  business营业执照  id身份证

        if($joinState) return array("state" => 200, "info" => "入驻功能未启用！");

        //一个账号只能入驻一个店铺
        $businessID = 0;
		$sql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__business_list` WHERE `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret) {
            if($ret[0]['state'] == 0) return array("state" => 200, "info" => "您的资料正在审核中，无须重复提交！");
            if($ret[0]['state'] == 1) return array("state" => 200, "info" => "您的账号已经入驻，无须重复提交！");
            $businessID = (int)$ret[0]['id'];
        }

        //资料审核
        $param = $this->param;
        $title = cn_substrR(trim(filterSensitiveWords($param['title'])), 90);  //店铺名称
        $people = cn_substrR(trim(filterSensitiveWords($param['people'])), 40);  //联系人
        $tel = cn_substrR(trim(filterSensitiveWords($param['tel'])), 20);  //联系电话
        // $cityid = (int)$param['cityid'];  //城市ID
        $addrid = (int)$param['addrid'];  //区域ID
        $address = cn_substrR(trim(filterSensitiveWords($param['address'])), 90);  //详细地址
        $license = $param['license'];  //营业执照
        $idcard_front = $param['idcard_front'];  //身份证正面
        $idcard_back = $param['idcard_back'];  //身份证背面

        //分站ID根据区域ID自动获取
        $cityid = getCityidByAddrid($addrid);

        if(!$title) return array("state" => 200, "info" => "请填写店铺名称");
        if(!$people) return array("state" => 200, "info" => "请填写联系人");
        if(!$tel) return array("state" => 200, "info" => "请填写联系电话");
        if(!$cityid) return array("state" => 200, "info" => "分站ID传递失败");
        if(!$addrid) return array("state" => 200, "info" => "请选择所在地区");
        if(!$address) return array("state" => 200, "info" => "请填写详细地址");

        //如果开通了两种方式
        if(in_array('business', $joinCheckMaterial) && in_array('id', $joinCheckMaterial)){
            if(!$license && !$idcard_front && !$idcard_back) return array("state" => 200, "info" => "请上传营业执照或者身份认证");
        }
        //如果只开通了营业执照
        elseif(in_array('business', $joinCheckMaterial)){
            if(!$license) return array("state" => 200, "info" => "请上传营业执照");
        }
        elseif(in_array('id', $joinCheckMaterial)){
            if(!$idcard_front && !$idcard_back) return array("state" => 200, "info" => "请上传身份认证");
        }

        //验证营业执照是否有效
        $companyName = $companyAddress = '';
        if($enterpriseBusinessDataState && in_array('business', $joinCheckMaterial) && $license){

            //QR识别证照上的内容
            $cardRes = getLicenseCardInfo(remoteImageCompressParam(getFilePath($license, true, false)));

            if ($cardRes['error_code'] == 0 && $cardRes['result']['name']) {
                $companyName = $cardRes['result']['name'];  //识别到的公司名称
                $companyAddress = $cardRes['result']['address'];  //识别到的公司地址

            }else{
                return array("state" => 200, "info" => "营业执照识别错误，请重新上传清晰有效的营业执照。错误代码：" . $cardRes['error_code'] . '=>' . $cardRes['reason']);
            }
        }

        //验证身份证是否有效
        $cardName = $cardNum = $nation = '';
        $birthday = 0;
        $sex = 1;  //性别，默认为男
        if($cardState && in_array('id', $joinCheckMaterial) && $idcard_front && $idcard_back){

            //QR识别身份证正面上的内容
            $cardRes = getIdentCardPositive(remoteImageCompressParam(getFilePath($idcard_front, true, false)));
            if ($cardRes['error_code'] == 0 && $cardRes['result']['idcardno']) {
                $cardName = $cardRes['result']['name'];  //姓名
                $cardNum = $cardRes['result']['idcardno'];  //身份证号码
                $nation = $cardRes['result']['nationality'];  //民族

                $birthAndGender = getBirthAndGenderFromIdCard($cardNum);  //根据身份证号码获取出生日期和性别
                if($birthAndGender){
                    $birthday = GetMkTime($birthAndGender['birthday']);
                    $sex = (int)$birthAndGender['gender'];
                }
                
            }else{
                return array("state" => 200, "info" => '身份证人像面识别错误，请重新上传清晰有效的身份证照片。错误代码：' . $cardRes['error_code'] . '=>' . $cardRes['reason']);
            }

            //判断身份证号码是否认证过
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `idcard` = '$cardNum' AND `certifyState` = 1 AND `id` != $uid");
            $ret = (int)$dsql->dsqlOper($sql, "totalCount");
            if($ret > 0){
                return array("state" => 200, "info" => '该身份证已经绑定其他账号!');
            }

            //QR识别身份证背面上的内容
            $cardRes = getIdentCardContrary(remoteImageCompressParam(getFilePath($idcard_back, true, false)));
            if ($cardRes['error_code'] == 0 && $cardRes['result']['image_status'] == 'normal') {
                $start_date        = $cardRes['result']['start_date'];
                $end_date          = $cardRes['result']['end_date'];
                if ($end_date  && ($end_date < $datetime)){
                    return array("state" => 200, "info" => '身份证件已过期，请上传最新的身份证照片!');
                }
                
            }else{
                return array("state" => 200, "info" => '身份证国徽面识别错误，请重新上传清晰有效的身份证照片。错误代码：' . $cardRes['error_code'] . '=>' . $cardRes['reason']);
            }

            //根据识别到的身份证号码和姓名，验证真伪，防止身份证是P的
            $isIdCheck = getIdCheck($cardNum, $cardName);
            if ($isIdCheck['error_code'] == 0) {
                if (!$isIdCheck['result']['isok']) {     //true 通过匹配   false  不匹配
                    return array("state" => 200, "info" => '身份信息不匹配，请核实上传的身份证姓名和身份证号码是否正确!');
                }
            }
            
        }

        //如果限制一个企业是否入驻多个店铺
        if($joinRepeat && $companyName){

            //根据公司名称查询用户表是否存在并认证
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `company` = '$companyName' AND `licenseState` = 1");
            $ret = (int)$dsql->dsqlOper($sql, "totalCount");
            if($ret > 0){
                return array("state" => 200, "info" => '该营业执照已经入驻过，如需找回，请联系平台客服!');
            }

        }

        //验证通过，添加数据到商家表
        $now = GetMkTime(time());

        //更新
        if($businessID){
            $sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `cityid` = '$cityid', `title` = '$title', `addrid` = '$addrid', `address` = '$address', `people` = '$people', `tel` = '$tel', `state` = '$joinCheck' WHERE `id` = " . $businessID);
            $dsql->dsqlOper($sql, "update");
            $aid = $businessID;
        }
        //新增
        else{
            $sql = $dsql->SetQuery("INSERT INTO `#@__business_list` (`cityid`, `uid`, `title`, `addrid`, `address`, `people`, `tel`, `pubdate`, `state`) VALUES ('$cityid', '$uid', '$title', '$addrid', '$address', '$people', '$tel', '$now', '$joinCheck')");
            $aid = $dsql->dsqlOper($sql, "lastid");
        }

        if(is_numeric($aid)){

            $upt = array();

            //企业认证
            if(in_array('business', $joinCheckMaterial) && $license){
                array_push($upt, "`company` = '$companyName'");
                array_push($upt, "`address` = '$companyAddress'");
                array_push($upt, "`license` = '$license'");
                array_push($upt, "`licenseState` = '3'");  //强制使用等待认证
            }

            //实名认证
            if(in_array('id', $joinCheckMaterial) && $idcard_front && $idcard_back){
                array_push($upt, "`realname` = '$cardName'");
                array_push($upt, "`idcard` = '$cardNum'");
                array_push($upt, "`idcardFront` = '$idcard_front'");
                array_push($upt, "`idcardBack` = '$idcard_back'");
                array_push($upt, "`nation` = '$nation'");
                array_push($upt, "`birthday` = '$birthday'");
                array_push($upt, "`sex` = '$sex'");
                array_push($upt, "`certifyState` = '3'");  //强制使用等待认证
            }

            if($upt){
                $upt = join(',', $upt);
                $_sql = $dsql->SetQuery("UPDATE `#@__member` SET $upt WHERE `id` = " . $uid);
                $dsql->dsqlOper($_sql, "update");
            }

            //记录用户行为日志
            memberLog($uid, 'business', 'detail', $aid, 'insert', '入驻商家', '', $sql);

            return '提交成功!';

        }
        //添加失败
        else{
            return array("state" => 200, "info" => '系统错误，入驻失败!');
        }

    }


	/**
	 * 更新商家资料
	 */
	public function updateStoreConfig(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

        $nowState = 0;
		$sql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__business_list` WHERE `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$business = $ret[0]['id'];
            $nowState = $ret[0]['state'];
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][157]);  //您还没有入驻商家
		}

		//入驻审核开关
		include HUONIAOINC."/config/business.inc.php";
		$editJoinCheck = (int)$customEditJoinCheck;

        //如果当前状态是待审核的，即使后台设置了修改商家资料不需要审核，这里也需要强制为待审核
        //解决商家新入驻时需要审核，然后商家修改资料后直接审核通过的问题
        if(!$nowState){
            $editJoinCheck = 0;
        }

		$param    = $this->param;
		$logo     = $param['logo'];
		$title    = filterSensitiveWords($param['title']);
		$typeid   = $param['typeid'];
		$areaCode = $param['areaCode'];
		$phone      = $param['phone'];
		$lng      = $param['lng'];
		$lat      = $param['lat'];
		$tel      = filterSensitiveWords($param['tel']);
		$cityid   = $param['cityid'];
		$addrid   = $param['addrid'];
		$address  = filterSensitiveWords($param['address']);
		$landmark = filterSensitiveWords($param['landmark']);
		$body     = filterSensitiveWords($param['body']);
		$weeks    = $param['weeks'];
		$opentime = $param['opentime'];
		$openweek = isset($param['openweek']) && is_array($param['openweek']) ? join(',', $param['openweek']) : $param['openweek'];
		$opentimes = $param['opentimes'];
		$wechatqr = $param['wechatqr'];
		$wechatcode = filterSensitiveWords($param['wechatcode']);
		$qq       = $param['qq'];
		$short_video_promote = $param['short_video_promote'];
		$mappic   = $param['mappic'];
		$quality  =$param['quality'];

		$fields = "";
		$fields = "`state` = '$editJoinCheck',";

		if($wechatcode){
			$fields .= "`wechatcode` = '$wechatcode',";
		}
		if($qq){
			$fields .= "`qq` = '$qq',";
		}
		if($mappic){
			$fields .= "`mappic` = '$mappic',";
		}
		if($logo){
			$fields .= "`logo` = '$logo',";
		}
		if($title){
			$fields .= "`title` = '$title',";
		}
		if($typeid){
			$fields .= "`typeid` = '$typeid',";
		}
		if($areaCode){
			$fields .= "`areaCode` = '$areaCode',";
		}
		if($phone){
			$fields .= "`phone` = '$phone',";
		}
		if($tel){
			$fields .= "`tel` = '$tel',";
		}
		if($weeks){
            $weeks = str_replace(';', '至', $weeks);
			$fields .= "`weeks` = '$weeks',";
		}
		if($opentime){
			$fields .= "`opentime` = '$opentime',";
		}
		if($openweek){
			$fields .= "`openweek` = '$openweek',";
		}
		if($opentimes){
			$fields .= "`opentimes` = '$opentimes',";
		}
		if($wechatqr){
			$fields .= "`wechatqr` = '$wechatqr',";
		}
		if(isset($param['banner'])){
			$fields .= "`banner` = '".$param['banner']."',";
		}

        if(isset($param['quality'])){
            $fields .= "`quality` = '".$param['quality']."',";
        }
		if(isset($param['video'])){
			$fields .= "`video` = '".$param['video']."',";
		}
		if(isset($param['video_pic'])){
			$fields .= "`video_pic` = '".$param['video_pic']."',";
		}
		if(isset($param['qj_file']) || $param['qj_pics'] || $param['qj_url']){
		    $qj_type = (int)$param['qj_type'];
		    $qj_file = $param['qj_file'];
		    if(!isMobile()) {
                $qj_file = $param['qj_pics'];
                if ($qj_type == 1) {
                    $qj_file = $param['qj_url'];
                }
            }
			$fields .= "`qj_type` = '$qj_type',`qj_file` = '$qj_file',";
		}
		if(isset($param['custom_nav'])){
			$fields .= "`custom_nav` = '".$param['custom_nav']."',";
		}
		if(isset($param['tag'])){
		    $tag = $param['tag'];
		    $tag = is_array($tag) ? join("|", $tag) : $tag;
			$fields .= "`tag` = '$tag',";
		}else{
			if(!isMobile()){
				$fields .= "`tag` = '',";
			}
		}
		if(isset($param['tag_shop'])){
			$fields .= "`tag_shop` = '".$param['tag_shop']."',";
		}
		if(isset($param['circle'])){
			$fields .= "`circle` = '".$param['circle']."',";
		}
		if(isset($param['short_video_promote'])){
			$fields .= "`short_video_promote` = '$short_video_promote',";
		}


		// --------位置
		if($lng && $lat){
			$fields .= "`lng` = '$lng', `lat` = '$lat',";
		}
		if($addrid){
			$fields .= "`addrid` = '$addrid',";
		}
		if($cityid){
			$fields .= "`cityid` = '$cityid',";
		}
		if($address){
			$fields .= "`address` = '$address',";
		}
		if($landmark){
			$fields .= "`landmark` = '$landmark',";
		}

		// --------介绍
		if($body){
			$fields .= "`body` = '$body',";
		}

		if($fields == ""){
			return array("state" => 200, "info" => $langData['siteConfig'][20][295]);  //操作失败！
		}

		$fields = substr($fields, 0, strlen($fields) - 1);

		$sql = $dsql->SetQuery("UPDATE `#@__business_list` SET $fields WHERE `id` = ".$business);
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == "ok"){

            memberLog($uid, 'business', '', 0, 'update', '更新商家资料', '', $sql);
			
            return $langData['siteConfig'][20][244];  //操作成功
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][20][295]);  //操作失败！
		}
	}

	/**
	 * 更新商家自定义菜单
	 */
	public function updateStoreCustomMenu(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$business = $ret[0]['id'];
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][157]);  //您还没有入驻商家
		}

		$param    = $this->param;
		$id       = (int)$param['id'];
		$jump     = (int)$param['jump'];
		$weight   = (int)$param['weight'];
		$del      = (int)$param['del'];
		$title    = $param['title'];
		$jump_url = $param['jump_url'];
		$body     = $param['body'];

		if(!$del){
			if(empty($title)){
				return array("state" => 200, "info" => "请输入标题");
			}
			if($jump){
				if(empty($jump_url)){
					return array("state" => 200, "info" => "请输入跳转链接");
				}
			}elseif(empty($body)){
				return array("state" => 200, "info" => "请输入正文");
			}
		}

		if($id){
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_menu` WHERE `uid` = $uid AND `id` = $id");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!$ret){
				return array("state" => 200, "info" => "参数错误");
			}
			if($del){
				$sql = $dsql->SetQuery("DELETE FROM `#@__business_menu` WHERE `id` = $id");

                memberLog($uid, 'business', 'menu', 0, 'delete', '删除商家自定义菜单('.$id.')', '', $sql);
			}else{
				$sql = $dsql->SetQuery("UPDATE `#@__business_menu` SET `title` = '$title', `jump` = '$jump', `jump_url` = '$jump_url', `body` = '$body' WHERE `id` = $id");

                memberLog($uid, 'business', 'menu', 0, 'update', '更新商家自定义菜单('.$id.' => '.$title.')', '', $sql);
			}
		}else{
			$sql = $dsql->SetQuery("INSERT INTO `#@__business_menu` (`uid`, `title`, `jump`, `jump_url`, `body`, `weight`) VALUES ('$uid', '$title', '$jump', '$jump_url', '$body', '$weight')");
		}
		$ret = $dsql->dsqlOper($sql, $id ? "update" : "lastid");
		if(($id && $ret == "ok") || (!$id && is_numeric($ret))){

            if(!$id){
                memberLog($uid, 'business', 'menu', 0, 'insert', '新增商家自定义菜单('.$ret.' => '.$title.')', '', $sql);
            }

			$sql = $dsql->SetQuery("SELECT * FROM `#@__business_menu` WHERE `uid` = $uid ORDER BY `weight`, `id`");
			$ret = $dsql->dsqlOper($sql, "results");

			if($ret){
				return $ret;
			}else{
				return $langData['siteConfig'][20][244];  //操作成功
			}
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][20][295]);  //操作失败！
		}

	}


	/**
	 * 获取商家自定义菜单
	 */
	public function getStoreCustomMenu(){
		global $dsql;
		$param = $this->param;
		$id = (int)$param['id'];
		$uid = (int)$param['uid'];

		if(empty($id) && empty($uid)) return array("state" => 200, "info" => "参数错误！");

		if(empty($uid)){
			$sql = $dsql->SetQuery("SELECT `uid` FROM `#@__business_list` WHERE `id` = $id");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$uid = $ret[0]['uid'];
			}else{
				return array("state" => 200, "info" => "商家不存在！");
			}
		}

        // 自定义菜单
        $menu = array();
        $sql = $dsql->SetQuery("SELECT * FROM `#@__business_menu` WHERE `uid` = $uid ORDER BY `weight`, `id`");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			foreach ($res as $k => $v) {
				$menu[$k]['id'] = $v['id'];
				$menu[$k]['title'] = $v['title'];
				$menu[$k]['jump'] = $v['jump'];

				if($v['jump']){
					$menu[$k]['url'] = $v['jump_url'];
				}else{
					$menu[$k]['body'] = $v['body'];
				}
			}
		}

		return $menu;
	}

	/**
	 * 更新商家模块开关
	 */
	public function updateBusinessModuleSwitch(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();
		if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

		$sql = $dsql->SetQuery("SELECT `id`, `cityid`, `addrid`, `title`, `type`, `expired`, `bind_module` FROM `#@__business_list` WHERE `uid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$business = $ret[0];
			if($ret[0]['type'] == 1){
				// return array("state" => 200, "info" => '抱歉，此功能仅限企业版商家使用');
			}
			$now = time();
			if($ret['expired'] > $now){
				return array("state" => 200, "info" => '您的商家入驻状态已过期');
			}
			$bind_module = $ret[0]['bind_module'];
			$bind_module = $bind_module ? explode(",", $bind_module) : array();
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][21][157]);  //您还没有入驻商家
		}

		$param = $this->param;
		$name  = $param['module'];
		$state = (int)$param['state'];

		$tab = "";
		$userid_f = "";
		$no_store = array('dingzuo', 'paidui', 'diancan', 'maidan', 'tandian');

		if(!in_array($name, $no_store)){
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_module` WHERE `name` = '$name' AND `state` = 0");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!$ret){
				return array("state" => 200, "info" => '参数错误！');
			}
			if($name == "shop"){
				$tab = "shop_store";
			}
			switch($name){
				case "shop" :
					$tab = "shop_store";
					$userid_f = "userid";
					break;
				case "info" :
					$tab = "infoshop";
					$userid_f = "uid";
					break;
				case "tuan" :
					$tab = "tuan_store";
					$userid_f = "uid";
					break;
				case "job" :
					$tab = "job_company";
					$userid_f = "uid";
					break;
				case "dating" :
					$tab = "dating_member";
					$userid_f = "userid";
					break;
				case "house" :
					$tab = "house_zjcom";
					$userid_f = "userid";
					break;
				case "waimai" :
					$tab = "waimai_shop";
					$userid_f = "userid";
					break;
			}
		// 切换开关
		}else{
			$sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `{$name}_state` = $state WHERE `id` = ".$business['id']);
			$dsql->dsqlOper($sql, "update");
		}

		$k = array_search($name, $bind_module);

		if($k === false){
			if($state){
				array_push($bind_module, $name);
			}
		}else{
			if(!$state){
				unset($bind_module[$k]);
			}
		}

		// 模块店铺开关
		if($tab){
			$where = "";
			if($name == "dating"){
				$where .= " AND `type` = 2";
			}
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `".$userid_f."` = $uid".$where);
			$res = $dsql->dsqlOper($sql, "update");
			if($res){
				$fields = " `store_switch` = $state";

				$sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET ".$fields." WHERE `".$userid_f."` = $uid".$where);
				$ret = $dsql->dsqlOper($sql, "update");
			}
		}

		$new_bind_module = join(",", $bind_module);

		$sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `bind_module` = '$new_bind_module' WHERE `id` = ".$business['id']);
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == "ok"){

            memberLog($uid, 'business', '', 0, 'update', '更新商家模块开关', '', $sql);

			return $langData['siteConfig'][20][244];  //操作成功
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][20][295]);  //操作失败！
		}

	}

	/**
	 * 发送商家信息到手机上
	 * 1、获取当前商家ID
	 * 2、获取用户的手机号码
	 */
	public function sendBusiness(){
		global $dsql;
		global $userLogin;
        global $cfg_baseDomain;

		$param   = $this->param;
		$id      = $param['id'];
		$areaCode   = $param['areaCode'];
		$phone   = $param['phone'];
		$uid = $userLogin->getMemberID();

		if(empty($id)){
			return array("state" => 200, "info" => '没有该信息');
		}

		if(empty($phone)){
			return array("state" => 200, "info" => '请填写手机号码');
		}

		//手机号码增加区号，国内版不显示
		$phone = ($areaCode == '86' ? '' : $areaCode) . $phone;

		$sql = $dsql->SetQuery("SELECT `id`, `uid`, `title`, `address`, `tel`, `phone` FROM `#@__business_list` WHERE `id` = '$id'");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			$userid = $res[0]['uid'];
			$business = $res[0]['title'];
			$address = $res[0]['address'];
			$tel = $res[0]['tel'] ? $res[0]['tel'] : $res[0]['phone'];
			//消息通知
			$param = array(
				"service"  => "business",
				"template" => "detail",
				"id"       => $id
			);
			$url = getUrlPath($param);
            $url = str_replace($cfg_baseDomain, '', $url);  //短信中不可以带域名，这里直接替换掉。

			//查询帐户信息
			if($uid != -1){
				$sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = ".$uid);
				$ret = $dsql->dsqlOper($sql, "results");
				$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
			}else{
				$username = '先生/女士';
			}

			// if($uid != -1){
			// 	updateMemberNotice($uid, "商家-发送商家联系方式", $param, array("username" => $username, "business" => $business, "address" => $address, "tel" => $tel, "url" => $url), $phone,'',0,1);
			// }else{
				sendsms($phone, 1, "", "", false, false, "商家-发送商家联系方式", array("username" => $username, "business" => $business, "address" => $address, "tel" => $tel, "url" => $url));
			// }
			return 'ok';
		}else{
			return array("state" => 200, "info" => '没有该信息');
		}
	}

	/**
     * 商家公告
     * @return array
     */
	public function notice(){
		global $dsql;
		$pageinfo = $list = array();
		$page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		//数据共享
		require(HUONIAOINC."/config/business.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
			$cityid = getCityId($this->param['cityid']);
			if($cityid){
				$where .= " AND `cityid` = ".$cityid;
			}
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `color`, `redirecturl`, `litpic`, `pubdate`, `body` FROM `#@__business_noticelist` WHERE `arcrank` = 0 $where ORDER BY `weight` DESC, `id` DESC");
		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";

		$results = $dsql->dsqlOper($archives.$where, "results");
		$list = array();

		$param = array(
			"service"     => "business",
			"template"    => "noticesdetail",
			"id"          => "%id%"
		);
		$urlParam = getUrlPath($param);

		foreach ($results as $key => $val) {
			$list[$key]['title'] = $val['title'];
			$list[$key]['pubdate'] = $val['pubdate'];
			$list[$key]['color'] = $val['color'];
			$list[$key]['body'] = cn_substrR(html2text($val['body']), 150);
			$list[$key]['redirecturl'] = $val['redirecturl'];
			$list[$key]['litpic']      = getFilePath($val['litpic']);
			$list[$key]['url'] = str_replace("%id%", $val['id'], $urlParam);
		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
     * 公告内容
     * @return array
     */
	public function noticeDetail(){
		global $dsql;
		$noticeDetail = array();

		if(empty($this->param)){
			return array("state" => 200, "info" => '公告ID不得为空！');
		}

		if(!is_numeric($this->param)) return array("state" => 200, "info" => '格式错误！');

		$archives = $dsql->SetQuery("SELECT `title`, `color`, `redirecturl`, `litpic`, `body`, `pubdate` FROM `#@__business_noticelist` WHERE `arcrank` = 0 AND `id` = ".$this->param);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$noticeDetail["title"]       = $results[0]['title'];
			$noticeDetail["color"]       = $results[0]['color'];
			$noticeDetail["redirecturl"] = $results[0]['redirecturl'];
			$noticeDetail["litpic"]      = getFilePath($results[0]['litpic']);
			$noticeDetail["body"]        = $results[0]['body'];
			$noticeDetail["pubdate"]     = $results[0]['pubdate'];
		}
		return $noticeDetail;
	}

    /**
     * Notes: 员工列表
     * Ueser: Administrator
     * DateTime: 2021/6/7 14:14
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|array[]
     */
	public function staffList(){
	    global $userLogin;
	    global $dsql;

        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '格式错误！');
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");

        if(empty($ret) && is_array($ret)){
            return array("state" => 200, "info" => '未找到管理的商家！');
        }

        $sid = $ret[0]['id'];
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT s.`id`, s.`uid`,s.`auth`,s.`state`,s.`staffname`,s.`jobname`,s.`auth`,m.`nickname`,m.`username`,m.`photo`,m.`phone` FROM `#@__staff` s LEFT JOIN `#@__member` m ON s.`uid` = m.`id` WHERE `sid` = '$sid'");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives.$where, "results");

        $list = array();
        if ($results){
            foreach ($results as $index => $result) {
                $storearr  = array();
               $authority = array();
                $list[$index]['id']       = $result['id'];
                $list[$index]['uid']      = $result['uid'];
                $list[$index]['auth']     = $result['auth'];

                if($result['auth'] !=''){
                    $autharr = unserialize($result['auth']);

                    if (!empty($autharr)) {

                        if (array_key_exists('shop', $autharr)) {

                            $shopsql = $dsql->SetQuery("SELECT `title` FROM `#@__shop_store` WHERE `userid` = '" . $uid . "'");

                            $shopres = $dsql->dsqlOper($shopsql, "results");
                            array_push($storearr, (!empty($shopres) && is_array($shopres) ? $shopres[0]['title'] : ''));

                            array_push($authority, '商城');
                        }

                        if (array_key_exists('huodong', $autharr)) {
//
//                        $shopsql = $dsql->SetQuery("SELECT `title` FROM `#@__shop_store` WHERE `userid` = '".$result['uid']."'");
//
//                        $shopres = $dsql->dsqlOper($shopsql,"results");
//
//                        array_push($storearr,(!empty($shopres) && is_array($shopres) ? $shopres[0]['title'] : ''));

                            array_push($authority, '活动');
                        }

                        if (array_key_exists('tuan', $autharr)) {
//
//                        $shopsql = $dsql->SetQuery("SELECT `title` FROM `#@__shop_store` WHERE `userid` = '".$result['uid']."'");
//
//                        $shopres = $dsql->dsqlOper($shopsql,"results");
//
//                        array_push($storearr,(!empty($shopres) && is_array($shopres) ? $shopres[0]['title'] : ''));

                            array_push($authority, '团购');
                        }

                        if (array_key_exists('travel', $autharr)) {

                            $shopsql = $dsql->SetQuery("SELECT `title` FROM `#@__travel_store` WHERE `userid` = '" . $uid . "'");

                            $shopres = $dsql->dsqlOper($shopsql, "results");

                            array_push($storearr, (!empty($shopres) && is_array($shopres) ? $shopres[0]['title'] : ''));

                            array_push($authority, '旅游');
                        }
                    }

                }
                $list[$index]['authority'] = !empty($authority) ? join(' ',$authority) : '';
                $list[$index]['storearr']  = $storearr;
                $list[$index]['nickname']  = $result['nickname'];
                $list[$index]['username']  = $result['username'];
                $list[$index]['phone']     = $result['phone'];
                $list[$index]['state']     = $result['state'];
                $list[$index]['jobname']   = $result['jobname'];
                $list[$index]['staffname'] = $result['staffname'];
                $list[$index]['photo']     = getFilePath($result['photo']);
            }

        }

        return array("pageInfo" => $pageinfo, "list" => $list);

    }


    /**
     * Notes: 更新员工权限
     * Ueser: Administrator
     * DateTime: 2021/6/16 11:29
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|string
     */
    public function staffUpdateAuth(){
	    global $dsql;
	    global $userLogin;

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $id          = $this->param['id'];
                $username    = $this->param['username'];
                $postname    = $this->param['postname'];
                $staff_phone = $this->param['staff_phone'];
                $auth        = $this->param['auth'];
                $updatetype  = $this->param['updatetype'];

                if($updatetype == 'mobile'){

                    $auth = json_decode($auth,true)[0];
                }
                $dotype      = $this->param['dotype'];
            }
        }

        if(empty($staff_phone) && $dotype == 'update') return array("state" => 200, "info" => '请填写联系方式！');

        $uid = $userLogin->getMemberID();
        if($uid == -1 || empty($id)) return array("state" => 200, "info" => '格式错误！');

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");

        if(empty($ret) && is_array($ret))  return array("state" => 200, "info" => '未找到管理的商家！');

        $staffsql = $dsql->SetQuery("SELECT `uid`, `staffname` FROM `#@__staff` WHERE `id` = '$id'");

        $staffres = $dsql->dsqlOper($staffsql,"results");

        if(empty($staffres) && is_array($staffres)) return array("state" => 200, "info" => '未找到该员工！');

        $staffuid = $staffres[0]['uid'];
        $staffname = $staffres[0]['staffname'];

        if($dotype == 'update') {

            $auth      = serialize($auth);
            $updatesql = $dsql->SetQuery("UPDATE `#@__staff` SET `auth` = '$auth',`staffname` = '$username',`jobname` = '$postname',`state` = 1 WHERE `id` = '$id'");

            memberLog($uid, 'business', 'staff', $id, 'update', '更新商家员工账号('.$id.' => '.$staffname.' => '.$username.')', '', $updatesql);

            if(!empty($staff_phone)){

                $membersql = $dsql->SetQuery("UPDATE `#@__member` SET `phone` = '$staff_phone' WHERE `id` = '$staffuid'");

                $dsql->dsqlOper($membersql,"update");
            }elseif(!empty($postname)){

                $membersql = $dsql->SetQuery("UPDATE `#@__member` SET `nickname` = '$postname' WHERE `id` = '$staffuid'");

                $dsql->dsqlOper($membersql,"update");
            }
        }else{

            $updatesql = $dsql->SetQuery("DELETE FROM `#@__staff` WHERE `id` = '$id'");

            memberLog($uid, 'business', 'staff', $id, 'delete', '删除商家员工账号('.$id.' => '.$staffname.')', '', $updatesql);
        }
        $updateres = $dsql->dsqlOper($updatesql,"update");

        if($updateres == 'ok'){
            return  '操作成功！';
        }else{
            return array("state" => 200, "info" => '操作失败！');
        }



    }

    public function staffDetail(){
        global $dsql;
        $id = $this->param;
        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');
        $archives = $dsql->SetQuery("SELECT s.*,m.`nickname`,m.`username`,m.`photo`,m.`phone` FROM `#@__staff` s LEFT JOIN `#@__member` m ON s.`uid` = m.`id` WHERE s.`id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $autharr =  $results[0]['auth'] !='' ? unserialize($results[0]['auth']) : array() ;

            $results[0]['photopath']  = $results[0]['photo'] !='' ? getFilePath($results[0]['photo']) :'';

            $businesssql = $dsql->SetQuery("SELECT `title`,`uid` FROM `#@__business_list` WHERE `id` = '".$results[0]['sid']."'");

            $businessres = $dsql->dsqlOper($businesssql,"results");

            if(empty($businessres) && is_array($businessres)) return array("state" => 200, "info" => '格式错误！');

            $results[0]['companyname'] = $businessres[0]['title'];

            $shopauth = $tuanauth = $huodongauth = $travelauth = array();

            if(!empty($autharr)) {
                if (array_key_exists('shop', $autharr)) {

                    $shopstoresql = $dsql->SetQuery("SELECT `id`,`title` FROM `#@__shop_store`  WHERE `userid` = '" . $businessres[0]['uid'] . "'");

                    $shopstoreres = $dsql->dsqlOper($shopstoresql, "results");

                    if (!empty($shopstoreres) && is_array($shopstoreres)) {

                        $shopauth['sotrename'] = $shopstoreres[0]['title'];
                        $shopauth['sotreid']   = $shopstoreres[0]['id'];

                        $ordercountsql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_order` WHERE `store`  ='" . $shopstoreres[0]['id'] . "' AND `orderstate` = 1 AND `protype` = 0  AND 1 = (CASE WHEN  `pinid` != 0 THEN CASE WHEN `pinstate` THEN 1 ELSE 0 END ELSE 1=1 END	)");

                        $ordercount = $dsql->dsqlOper($ordercountsql, "totalCount");

                        $shopauth['ordercount'] = (int)$ordercount;
                    }

                }

                if (array_key_exists('huodong', $autharr)) {

                    $huodongauth['sotrename'] = $businessres[0]['title'];

                    $ordercountsql = $dsql->SetQuery("SELECT o.`id` FROM `#@__huodong_list` l LEFT JOIN `#@__huodong_order` o  ON o.`hid` = l.`id` WHERE l.`uid`  ='" . $businessres[0]['uid'] . "'");

                    $ordercount = $dsql->dsqlOper($ordercountsql, "totalCount");

                    $huodongauth['ordercount'] = (int)$ordercount;
                }

                if (array_key_exists('tuan', $autharr)) {

                    $tuanauth['sotrename'] = $businessres[0]['title'];

                    $tuanstoresql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store`  WHERE `uid` = '" . $businessres[0]['uid'] . "'");

                    $tuanstoreres = $dsql->dsqlOper($tuanstoresql, "results");
                    if (!empty($tuanstoreres) && is_array($tuanstoreres)) {

                        $ordercountsql = $dsql->SetQuery("SELECT o.`id` FROM `#@__tuan_store` s LEFT JOIN `#@__tuanlist` l ON s.`id` = l.`sid` LEFT JOIN `#@__tuan_order` o  ON o.`proid` = l.`id` WHERE s.`uid`  ='" . $businessres[0]['uid'] . "' AND o.`orderstate` = 1 AND l.`tuantype` = 2");

                        $ordercount = $dsql->dsqlOper($ordercountsql, "totalCount");

                        $tuanauth['ordercount'] = (int)$ordercount;

                        $tuanauth['sotreid'] = $tuanstoreres[0]['id'];
                    }

                }

                if (array_key_exists('travel', $autharr)) {

                    $shopstoresql = $dsql->SetQuery("SELECT `id`,`title` FROM `#@__travel_store`  WHERE `userid` = '" . $businessres[0]['uid'] . "'");

                    $shopstoreres = $dsql->dsqlOper($shopstoresql, "results");

                    if (!empty($shopstoreres) && is_array($shopstoreres)) {

                        $travelauth['sotrename'] = $shopstoreres[0]['title'];
                        $travelauth['sotreid']   = $shopstoreres[0]['id'];

                        $ordercountsql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_order` WHERE `store`  ='" . $shopstoreres[0]['id'] . "' ");
                        $ordercount = $dsql->dsqlOper($ordercountsql, "totalCount");

                        $travelauth['ordercount'] = (int)$ordercount;
                    }

                }
            }else{

                $autharr['shop']    = array();
                $autharr['tuan']    = array();
                $autharr['huodong'] = array();
                $autharr['travel']  = array();
            }

            $results[0]['auth']       = $autharr;
            $results[0]['business_auth'] = $autharr;
            $authallarr  = array();

            $authallarr['shopauth']    = $shopauth;
            $authallarr['tuanauth']    = $tuanauth;
            $authallarr['huodongauth'] = $huodongauth;
            $authallarr['travelauth']  = $travelauth;

            $results[0]['authallarr'] = $authallarr;

//            echo "<pre>";
//            var_dump($results[0]);die;
            return $results[0];
        }else{
            return array("state" => 200, "info" => '员工不存在！');
        }
    }


	/********************* ^ 探店s ^ *****************************/

	/**
	 * 探店分类
	 */
	public function discoveryType(){
		global $dsql;
		$type = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$type     = (int)$this->param['type'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
				$son      = $this->param['son'] == 0 ? false : true;
			}
		}
		$results = $dsql->getTypeList($type, "business_discoverytype", $son, $page, $pageSize);
		if($results){
			return $results;
		}
	}

	/**
	 * 发布,编辑探店文章
	 */
	public function putDiscovery(){
		global $dsql;
		global $userLogin;

		$param  = $this->param;
		$cityid =  $param['cityid'];
		$title  = filterSensitiveWords(addslashes($param['title']));
		$typeid = (int)$param['typeid'];
		$litpic = $param['litpic'];
		$writer = $param['writer'];
		$id     = (int)$param['id'];
		$sid    = $param['sid'];
		$body   = filterSensitiveWords($param['body']);

		$userid = $userLogin->getMemberID();
		if($userid < 0) return array("state" => 200, "info" => "登陆超时，请重新登陆");

		if($id){
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_discoverylist` WHERE `uid` = $userid AND `id` = $id");
			$res = $dsql->dsqlOper($sql, "results");
			if(!$res) return array("state" => 200, "info" => "文章不存在或权限不足");
		}

		if(empty($cityid)) return array("state" => 200, "info" => "请选择城市");
		if(empty($title)) return array("state" => 200, "info" => "请填写标题");
		if(empty($litpic)) return array("state" => 200, "info" => "请上传缩略图");
		if(empty($body)) return array("state" => 200, "info" => "请填写正文");
		if(empty($writer)) return array("state" => 200, "info" => "请输入作者");

		$state = 0;

		if(empty($id)){
			$pubdate = time();
			$sql = $dsql->SetQuery("INSERT INTO `#@__business_discoverylist` (`cityid`, `typeid`, `sid`, `uid`, `title`, `litpic`, `body`, `state`, `pubdate`, `writer`) VALUES ('$cityid', '$typeid', '$sid', '$userid', '$title', '$litpic', '$body', $state, '$pubdate', '$writer')");
			$aid = $dsql->dsqlOper($sql, "lastid");
			if(is_numeric($aid)){
				return "发布成功，请等待审核";
			}else{
				return array("state" => 200, "info" => "发布失败，请重试");
			}
		}else{
			$sql = $dsql->SetQuery("UPDATE `#@__business_discoverylist` SET `cityid` = $cityid, `sid` = '$sid', `title` = '$title', `litpic` = '$litpic', `body` = '$body', `state` = $state, `writer` = '$writer' WHERE `id` = $id");
			$res = $dsql->dsqlOper($sql, "update");
			if($res == "ok"){
				return "修改成功，请等待审核";
			}else{
				return array("state" => 200, "info" => "修改失败，请重试");
			}
		}

	}

	/**
	 * 探店列表
	 */
	public function discoveryList(){
		global $dsql;
		global $userLogin;
		global $langData;
		$pageinfo = $pageInfo = $list = array();
		$store = $addrid = $typeid = $title = $orderby = $page = $pageSize = $where = $where1 = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$u        = $this->param['u'];
				$id       = (int)$this->param['id'];
				$typeid   = $this->param['typeid'];
				$title    = $this->param['title'];
				$keywords = $this->param['keywords'];
				$orderby  = $this->param['orderby'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];

				$title = $title ? $title : $keywords;
			}
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$loginUid = $userLogin->getMemberID();
		$ip = GetIP();

        if($u != 1){

			//数据共享
			require(HUONIAOINC."/config/business.inc.php");
			$dataShare = (int)$customDataShare;

			if(!$dataShare){
				$cityid = getCityId($this->param['cityid']);
				if($cityid){
					$where .= " AND `cityid` in (".$cityid.")";
				}
			}

			$where .= " AND `state` = 1";

		}else{
			$where .= " AND `uid` = $loginUid";

			if($state != ""){
				$where1 = " AND `state` = ".$state;
			}
		}

		if(empty($id)){

			if($typeid){
				$where .= " AND `typeid` = $typeid";
			}

			if($title){
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `title` LIKE '%$title%'");
				$res = $dsql->dsqlOper($sql, "results");
				if($res){
					global $arr_data;
					$arr_data = "";
					$ids = arr_foreach($res);
					$where .= " AND `sid` IN (".join(",", $ids).")";
				}else{
					$where .= " AND 1 = 2";
				}
			}

			$orderby = " ORDER BY `weight` DESC, `id` DESC";

	        $now = time();

	        $sql = $dsql->SetQuery("SELECT COUNT(`id`) c FROM `#@__business_discoverylist` WHERE 1 = 1".$where);
	        $res = $dsql->dsqlOper($sql, "results");

	        $totalCount = $res[0]['c'];

	        //总分页数
			$totalPage = ceil($totalCount/$pageSize);

			if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

			$pageinfo = array(
				"page" => $page,
				"pageSize" => $pageSize,
				"totalPage" => $totalPage,
				"totalCount" => $totalCount
			);

			$archives = $dsql->SetQuery("SELECT * FROM `#@__business_discoverylist` WHERE 1 = 1".$where);

			$atpage = $pageSize*($page-1);
			$where = $pageSize != -1 ? " LIMIT $atpage, $pageSize" : "";

		}else{
			$where .= " AND `id` = $id";
			$archives = $dsql->SetQuery("SELECT * FROM `#@__business_discoverylist` WHERE 1 = 1");
		}

		$results = $dsql->dsqlOper($archives.$orderby.$where, "results");

		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']          = $val['id'];
				$list[$key]['title']       = $val['title'];
				$list[$key]['click']       = $val['click'];
				$list[$key]['description'] = cn_substrR(strip_tags($val['body']), 100);
				$list[$key]['litpic']      = $val['litpic'] ? getFilePath($val['litpic']) : "";

				$mtype = 0;
				$photo = "";
				$username = "网友";

				$sql = $dsql->SetQuery("SELECT `id`, `mtype`, `nickname`, `company`, `photo` FROM `#@__member` WHERE `id` = ".$val['uid']);
				$res = $dsql->dsqlOper($sql, "results");
				if($res){
					$mtype = $res[0]['mtype'];
					$photo = $res[0]['photo'] ? getFilePath($res[0]['photo']) : "";
					switch($res[0]['mtype']){
						case 1:
							$username = $res[0]['nickname'];
							break;
						case 2:
							$username = $res[0]['company'] ? $res[0]['company'] : $res[0]['nickname'];
						default :
							$username = $res[0]['nickname'] ? $res[0]['nickname'] : "管理员";
					}
				}
				$list[$key]['mtype']  = $mtype;
				$list[$key]['writer'] = $val['writer'] ? $val['writer'] : $username;
				$list[$key]['photo']  = $photo;

				$list[$key]['typeid']  = $val['typeid'];
				$typename = "";
				if($val['typeid']){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__business_discoverytype` WHERE `id` = ".$val['typeid']);
					$res = $dsql->dsqlOper($sql, "results");
					if($res){
						$typename = $res[0]['typename'];
					}
				}
				$list[$key]['typename'] = $typename;

				//验证是否已经点赞
				$zanparams = array(
					"module" => "business",
					"temp"   => "discovery_detail",
					"id"     => $val['id'],
					"check"  => 1
				);
				$zan = checkIsZan($zanparams);
				$list[$key]['zan'] = $zan == "has" ? 1 : 0;

				$list[$key]['zannum'] = (int)$val['zan'];

				if($id){
					$list[$key]['body'] = $val['body'];
				}
			}
		}

		return array("pageInfo" => $pageInfo, "list" => $list);

	}


	/**
	 * 探店详情
	 */
	public function discoveryDetail(){
		global $dsql;
		global $userLogin;

		$param = $this->param;
		$id = (int)$param['id'];

		if($id){
			$detail = $this->discoveryList();

			if($detail && $detail['list']){
				return $detail['list'][0];
			}
		}
	}


	/**
     * 评论列表
     * @return array
     */
	public function common(){
		global $dsql;
		global $userLogin;
		$pageinfo = $list = array();
		$newsid = $orderby = $page = $pageSize = $where = "";

		if(!is_array($this->param)){
			return array("state" => 200, "info" => '格式错误！');
		}else{
			$newsid    = $this->param['newsid'];
			$orderby   = $this->param['orderby'];
			$page     = $this->param['page'];
			$pageSize = $this->param['pageSize'];
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$oby = " ORDER BY `id` DESC";
		if($orderby == "hot"){
			$oby = " ORDER BY `good` DESC, `id` DESC";
		}

		$archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__business_discoverycommon` WHERE `aid` = ".$newsid." AND `ischeck` = 1 AND `floor` = 0".$oby);
		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";

		$results = $dsql->dsqlOper($archives.$where, "results");
		if($results){
            $uid = $userLogin->getMemberID();
			foreach($results as $key => $val){
				$list[$key]['id']      = $val['id'];
				$list[$key]['userinfo'] = $userLogin->getMemberInfo($val['userid'], 1);
				$list[$key]['content'] = $val['content'];
				$list[$key]['dtime']   = $val['dtime'];
				$list[$key]['ftime']   = floor((GetMkTime(time()) - $val['dtime']/86400)%30) > 30 ? date("Y-m-d", $val['dtime']) : FloorTime(GetMkTime(time()) - $val['dtime']);
				$list[$key]['ip']      = $val['ip'];
				$list[$key]['ipaddr']  = $val['ipaddr'];
				$list[$key]['good']    = $val['good'];
				$list[$key]['bad']     = $val['bad'];

				$userArr = explode(",", $val['duser']);
				$list[$key]['already'] = in_array($uid, $userArr) ? 1 : 0;

				$list[$key]['lower']   = $this->getCommonList($val['id']);
			}
		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
	 * 遍历评论子级
	 * @param $fid int 评论ID
	 * @return array
	 */
	function getCommonList($fid){
		if(empty($fid)) return false;
		global $dsql;
		global $userLogin;

		$archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__business_discoverycommon` WHERE `floor` = ".$fid." AND `ischeck` = 1 ORDER BY `id` DESC");
		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		if($totalCount > 0){
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
                $uid = $userLogin->getMemberID();
				foreach($results as $key => $val){
					$list[$key]['id']      = $val['id'];
					$list[$key]['userinfo'] = $userLogin->getMemberInfo($val['userid'], 1);
					$list[$key]['content'] = $val['content'];
					$list[$key]['dtime']   = $val['dtime'];
					$list[$key]['ftime']   = floor((GetMkTime(time()) - $val['dtime']/86400)%30) > 30 ? $val['dtime'] : FloorTime(GetMkTime(time()) - $val['dtime']);
					$list[$key]['ip']      = $val['ip'];
					$list[$key]['ipaddr']  = $val['ipaddr'];
					$list[$key]['good']    = $val['good'];
					$list[$key]['bad']     = $val['bad'];

					$userArr = explode(",", $val['duser']);
					$list[$key]['already'] = in_array($uid, $userArr) ? 1 : 0;

					$list[$key]['lower']   = $this->getCommonList($val['id']);
				}
				return $list;
			}
		}
	}


	/**
	 * 顶评论
	 * @param $id int 评论ID
	 * @param string
	 **/
	public function dingCommon(){
		global $dsql;
		global $userLogin;

		$id = $this->param['id'];
		if(empty($id)) return "请传递评论ID！";
		$memberID = $userLogin->getMemberID();
		if($memberID == -1 || empty($memberID)) return "请先登录！";

		$archives = $dsql->SetQuery("SELECT `duser` FROM `#@__business_discoverycommon` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){

			$duser = $results[0]['duser'];

			//如果此会员已经顶过则return
			$userArr = explode(",", $duser);
			if(in_array($memberID, $userArr)) return "已顶过！";

			//附加会员ID
			if(empty($duser)){
				$nuser = $memberID;
			}else{
				$nuser = $duser . "," . $memberID;
			}

			$archives = $dsql->SetQuery("UPDATE `#@__business_discoverycommon` SET `good` = `good` + 1 WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");

			$archives = $dsql->SetQuery("UPDATE `#@__business_discoverycommon` SET `duser` = '$nuser' WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
			return $results;

		}else{
			return "评论不存在或已删除！";
		}
	}


	/**
     * 发表评论
     * @return array
     */
	public function sendCommon(){
		global $dsql;
		global $userLogin;
		$param = $this->param;

		$aid     = $param['aid'];
		$id      = $param['id'];
		$content = addslashes($param['content']);

		if(empty($aid) || empty($content)){
			return array("state" => 200, "info" => '必填项不得为空！');
		}

		$content = filterSensitiveWords(cn_substrR($content,250));

		include HUONIAOINC."/config/article.inc.php";
		$ischeck = (int)$customCommentCheck;

		$archives = $dsql->SetQuery("INSERT INTO `#@__business_discoverycommon` (`aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`) VALUES ('$aid', '$id', '".$userLogin->getMemberID()."', '$content', ".GetMkTime(time()).", '".GetIP()."', '".getIpAddr(GetIP())."', 0, 0, '$ischeck', '')");
		$lid  = $dsql->dsqlOper($archives, "lastid");
		if($lid){
			$archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__business_discoverycommon` WHERE `id` = ".$lid);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$list['id']      = $results[0]['id'];
				$list['userinfo'] = $userLogin->getMemberInfo($results[0]['userid'], 1);
				$list['content'] = $results[0]['content'];
				$list['dtime']   = $results[0]['dtime'];
				$list['ftime']   = GetMkTime(time()) - $results[0]['dtime'] > 30 ? $results[0]['dtime'] : FloorTime(GetMkTime(time()) - $results[0]['dtime']);
				$list['ip']      = $results[0]['ip'];
				$list['ipaddr']  = $results[0]['ipaddr'];
				$list['good']    = $results[0]['good'];
				$list['bad']     = $results[0]['bad'];
				return $list;
			}
		}else{
			return array("state" => 200, "info" => '评论失败！');
		}

	}

	public function detailHtml(){
		global $dsql;
		global $cfg_staticPath;
		global $cfg_staticVersion;

		$param = $this->param;

		$id = (int)$this->param['id'];
		if(empty($id)) return '<p>商家信息错误</p>';

		$this->param = $id;
		$detail = $this->storeDetail();

		$isMobile = isMobile();
		$iframe = $param['iframe'];

		$content = "";
		$tpl = HUONIAOROOT."/templates/siteConfig/";
		$tpl .= $isMobile ? "business_panel_touch.html" : "business_panel.html";
		if(is_file($tpl)){
			$content = file_get_contents($tpl);
		}

		if(!$detail || (isset($detail['state']) && $detail['state'] != 1)){
			if($content == "") return '<p>店铺不存在或状态异常</p>';
			$replaceAll = array(
				'state',
				'cfg_staticPath',
				'cfg_staticVersion',
				'iframe',
			);
			$state = 0;
			foreach ($replaceAll as $value) {
				$content = str_replace("__{$value}__", ${$value}, $content);
			}
			return $content;
		}
		if($content == "") return '';

		// print_r($detail);die;
		$state = 1;
		$title = $detail['title'];
		$logo = $detail['logo'];
		$qq = $detail['qq'] ? $detail['qq'] : '暂无';
		$wechatcode = $detail['wechatcode'] ? $detail['wechatcode'] : '暂无';
		$address = $detail['address'];
		$weekDay = $detail['weekDay'];
		$opentime = $detail['opentime'];
		$openweek = $detail['openweek'];
		$opentimes = $detail['opentimes'];

		$param = array(
			"service" => "business",
			"template" => "detail",
			"id" => $detail['id']
		);
		$url = getUrlPath($param);


		$rz = "";
		if($detail['member']['phoneCheck']){
			$rz .= '<img src="/static/images/rz_phoneCheck.png" alt="">';
		}
		if($detail['member']['promotion']){
			$tit = '保障金：'.echoCurrency(array("type" => "symbol")).$detail['member']['promotion'].echoCurrency(array("type" => "short"));
			$rz .= '<img src="/static/images/rz_promotion.png" alt="" title="'.$tit.'">';
		}
		if($detail['member']['licenseState']){
			$rz .= '<img src="/static/images/rz_licenseState.png" alt="">';
		}



		$replaceAll = array(
			'state',
			'cfg_staticPath',
			'cfg_staticVersion',
			'url',
			'logo',
			'title',
			'rz',
			'qq',
			'wechatcode',
			'address',
			'weekDay',
			'opentime',
			'openweek',
			'opentimes',
			'iframe',
		);

		foreach ($replaceAll as $value) {
			$content = str_replace("__{$value}__", ${$value}, $content);
		}
		return $content;
	}


	/********************* v 探店e v *****************************/

    /**
     * 订单主要数据
     */
    public  function  orderList(){
        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }
        $info = $userLogin->getMemberInfo();
        $busiId = $info['busiId'];
        //今天支付订单,支付金额,支付人数
        $start = GetMkTime(date('Y-m-d'));
        $end = $start+86400;
        //团购订单
        $archives = $dsql->SetQuery("SELECT " .
            "count(o.`id`) tuan, SUM(o.`orderprice`)tuanprice  " .
            "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
            "WHERE s.`uid` = $userid AND `orderdate` >= $start AND `orderdate` < $end ");
        $dayorder = $dsql->dsqlOper($archives,"results");


        //昨天支付订单,支付金额
        $today   = GetMkTime(date("Y-m-d"));
        $prevDay = GetMkTime(date("Y-m-d", strtotime("-1 day")));
        $archive= $dsql->SetQuery("SELECT " .
            "count(o.`id`) tuan, SUM(o.`orderprice`)tuanprice  " .
            "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
            "WHERE s.`uid` = $userid  AND `orderdate` >= $prevDay AND `orderdate` < $today");
        $prevorder = $dsql->dsqlOper($archive,"results");

        //上周订单
        $tomorrow = $today - 604800;
        $toend = $tomorrow+86400;
        $lastch= $dsql->SetQuery("SELECT " .
            "count(o.`id`) tuan, SUM(o.`orderprice`)tuanprice  " .
            "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
            "WHERE s.`uid` = $userid  AND `orderdate` >= $tomorrow AND `orderdate` < $toend");
        $lastorder = $dsql->dsqlOper($lastch,"results");

        //今天以及以后的数据
        $day = GetMkTime(date('Y-m-d'));
        $daych= $dsql->SetQuery("SELECT " .
            "count(o.`id`) count,SUM(o.`orderprice`) price " .
            "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
            "WHERE s.`uid` = $userid   AND `orderdate` >= $day ");

        $orderday = $dsql->dsqlOper($daych,"results");

        //团购今日支付人数
        $people = $dsql->SetQuery("SELECT " .
            " * " .
            "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
            "WHERE s.`uid` = $userid  AND `orderdate` >= $start AND `orderdate` < $end  AND `orderstate` !='0' GROUP BY o.`userid` ");
        $daypeople = $dsql->dsqlOper($people,"totalCount");

        //团购昨日支付人数
        $lastpeople = $dsql->SetQuery("SELECT " .
            " * " .
            "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
            "WHERE s.`uid` = $userid   AND `orderdate` >= $prevDay AND `orderdate` < $today  AND `orderstate` !='0'  GROUP BY o.`userid` ");
        $prevpeople = $dsql->dsqlOper($lastpeople,"totalCount");

        //团购支付人数今日以及以后
        $daypeo = $dsql->SetQuery("SELECT " .
            " * " .
            "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
            "WHERE s.`uid` = $userid   AND `orderdate` >= $day  AND `orderstate` !='0'  GROUP BY o.`userid` ");
        $peopleday = $dsql->dsqlOper($daypeo,"totalCount");
        //团购上周支付人数
        $lastpeo = $dsql->SetQuery("SELECT " .
            " * " .
            "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
            "WHERE s.`uid` = $userid   AND `orderdate` >= $tomorrow AND `orderdate` < $toend  AND `orderstate` !='0'  GROUP BY o.`userid` ");
        $peolast = $dsql->dsqlOper($lastpeo,"totalCount");


        //外卖订单
        //今天支付订单,支付金额,
        $waimai = $dsql->SetQuery("SELECT count(o.`id`) waimai,SUM(o.`amount`) waimaiprice FROM `#@__waimai_shop_manager` s
                LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                WHERE  s.`userid` = $userid  AND o.`pubdate` >= $start AND o.`pubdate` < $end ");
        $daywaimai = $dsql->dsqlOper($waimai,"results");

        //昨天支付订单,支付金额
        $towaimai = $dsql->SetQuery("SELECT count(o.`id`) prevwaimai,SUM(o.`amount`) prevwaimaiprice FROM `#@__waimai_shop_manager` s
                LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                WHERE  s.`userid` = $userid  AND o.`pubdate` >= $prevDay AND o.`pubdate` < $today ");
        $prewaimai = $dsql->dsqlOper($towaimai,"results");


        //上周订单
        $lastwaimai = $dsql->SetQuery("SELECT count(o.`id`) count ,SUM(o.`amount`) price FROM `#@__waimai_shop_manager` s
                LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                WHERE  s.`userid` = $userid  AND o.`pubdate` >= $tomorrow AND o.`pubdate` < $toend ");
        $waimailast = $dsql->dsqlOper($lastwaimai,"results");

        //今天以及以后的数据
        $daywm = $dsql->SetQuery("SELECT count(o.`id`) count , SUM(o.`amount`) price FROM `#@__waimai_shop_manager` s
                LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                WHERE  s.`userid` = $userid  AND o.`pubdate` >= $day ");
        $waimaiday = $dsql->dsqlOper($daywm,"results");

        //今天支付人数
        $waimaipeople = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_manager` s
                LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                WHERE  s.`userid` = $userid  AND o.`pubdate` >= $start AND o.`pubdate` < $end AND o.`state` !='0' GROUP BY o.`uid`");
        $daywaimaipeople = $dsql->dsqlOper($waimaipeople,"totalCount");

        //昨天支付人数
        $lastwaimaipeople = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_manager` s
                LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                WHERE  s.`userid` = $userid  AND o.`pubdate` >= $prevDay AND o.`pubdate` < $today AND o.`state` !='0' GROUP BY o.`uid`");
        $lastwaimaipeople = $dsql->dsqlOper($lastwaimaipeople,"totalCount");

        //今天以及之后支付人数
        $daywmpeople = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_manager` s
                LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                WHERE  s.`userid` = $userid  AND o.`pubdate` >= $day AND o.`state` !='0' GROUP BY o.`uid`");
        $wmdaypeople = $dsql->dsqlOper($daywmpeople,"totalCount");

        //外卖上周支付人数
        $lastwmpeople = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_manager` s
                LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                WHERE  m.`id` = $userid  AND o.`pubdate` >= $tomorrow  AND o.`pubdate` < $toend AND o.`state` !='0' GROUP BY o.`uid`");
        $wmlastpeople = $dsql->dsqlOper($lastwmpeople,"totalCount");

        //商城订单
        //今天支付订单,支付金额
        $shop = $dsql->SetQuery("SELECT count(o.`id`) shop,SUM(o.`amount`) shopprice FROM `#@__shop_store` s
               LEFT JOIN `#@__member` m ON s.`userid` = m.`id`
               LEFT JOIN `huoniao_shop_order` o ON s.`id` = o.`store`
               LEFT JOIN `#@__shop_order_product` t ON o.`id` = t.`orderid`
               LEFT JOIN `#@__shop_product` p ON t.`proid` = p.`id`
                WHERE  s.`userid` = $userid  AND o.`orderdate` >= $start AND o.`orderdate` < $end ");
        $dayshop = $dsql->dsqlOper($shop,"results");


        //昨天支付订单,支付金额
        $toshop = $dsql->SetQuery("SELECT count(o.`id`) prevshop,SUM(o.`amount`) prevshopprice FROM `#@__shop_store` s
               LEFT JOIN `#@__member` m ON s.`userid` = m.`id`
               LEFT JOIN `huoniao_shop_order` o ON s.`id` = o.`store`
               LEFT JOIN `#@__shop_order_product` t ON o.`id` = t.`orderid`
               LEFT JOIN `#@__shop_product` p ON t.`proid` = p.`id`
                WHERE  s.`userid` = $userid  AND o.`orderdate` >= $prevDay AND o.`orderdate` < $today ");
        $preshop = $dsql->dsqlOper($toshop,"results");


        //上周订单
        $lastshop = $dsql->SetQuery("SELECT o.`id` FROM `#@__shop_store` s
               LEFT JOIN `#@__member` m ON s.`userid` = m.`id`
               LEFT JOIN `huoniao_shop_order` o ON s.`id` = o.`store`
               LEFT JOIN `#@__shop_order_product` t ON o.`id` = t.`orderid`
               LEFT JOIN `#@__shop_product` p ON t.`proid` = p.`id`
                WHERE  s.`userid` = $userid  AND o.`orderdate` >= $tomorrow AND o.`orderdate` < $toend");
        $shoplast = $dsql->dsqlOper($lastshop,"results");

        //今天以及以后以后的数据
        $daysp = $dsql->SetQuery("SELECT o.`id` FROM `#@__shop_store` s
               LEFT JOIN `#@__member` m ON s.`userid` = m.`id`
               LEFT JOIN `huoniao_shop_order` o ON s.`id` = o.`store`
               LEFT JOIN `#@__shop_order_product` t ON o.`id` = t.`orderid`
               LEFT JOIN `#@__shop_product` p ON t.`proid` = p.`id`
                WHERE  s.`userid` = $userid  AND o.`orderdate` >= $day ");
        $shopday = $dsql->dsqlOper($daysp,"results");

        //今日支付人数
        $dayshoppeople = $dsql->SetQuery("SELECT * FROM `#@__shop_store` s
               LEFT JOIN `#@__member` m ON s.`userid` = m.`id`
               LEFT JOIN `huoniao_shop_order` o ON s.`id` = o.`store`
               LEFT JOIN `#@__shop_order_product` t ON o.`id` = t.`orderid`
               LEFT JOIN `#@__shop_product` p ON t.`proid` = p.`id`
                WHERE  s.`userid` = $userid  AND o.`orderdate` >= $start AND o.`orderdate` < $end AND o.`orderstate` !='0' GROUP BY o.`userid`");
        $daydayshoppeople = $dsql->dsqlOper($dayshoppeople,"totalCount");

        //昨日支付人数
        $lastsppeople = $dsql->SetQuery("SELECT * FROM `#@__shop_store` s
               LEFT JOIN `#@__member` m ON s.`userid` = m.`id`
               LEFT JOIN `huoniao_shop_order` o ON s.`id` = o.`store`
               LEFT JOIN `#@__shop_order_product` t ON o.`id` = t.`orderid`
               LEFT JOIN `#@__shop_product` p ON t.`proid` = p.`id`
                WHERE  s.`userid` = $userid  AND o.`orderdate` >= $prevDay AND o.`orderdate` < $today AND o.`orderstate` !='0' GROUP BY o.`userid`");
        $splastpeople = $dsql->dsqlOper($lastsppeople,"totalCount");

        //今天以及以后支付人数
        $daysppeople = $dsql->SetQuery("SELECT *  FROM `#@__shop_store` s
               LEFT JOIN `#@__member` m ON s.`userid` = m.`id`
               LEFT JOIN `huoniao_shop_order` o ON s.`id` = o.`store`
               LEFT JOIN `#@__shop_order_product` t ON o.`id` = t.`orderid`
               LEFT JOIN `#@__shop_product` p ON t.`proid` = p.`id`
                WHERE  s.`userid` = $userid  AND o.`orderdate` >= $prevDay AND o.`orderdate` < $today AND o.`orderstate` !='0' GROUP BY o.`userid`");
        $spdaypeople = $dsql->dsqlOper($daysppeople,"totalCount");

        //上周支付人数
        $weeksppeople = $dsql->SetQuery("SELECT *  FROM `#@__shop_store` s
               LEFT JOIN `#@__member` m ON s.`userid` = m.`id`
               LEFT JOIN `huoniao_shop_order` o ON s.`id` = o.`store`
               LEFT JOIN `#@__shop_order_product` t ON o.`id` = t.`orderid`
               LEFT JOIN `#@__shop_product` p ON t.`proid` = p.`id`
                WHERE  s.`userid` = $userid  AND o.`orderdate` >= $tomorrow AND o.`orderdate` < $toend AND o.`orderstate` !='0' GROUP BY o.`userid`");
        $spweekpeople = $dsql->dsqlOper($weeksppeople,"totalCount");

        //商城今日浏览量
        $hissp = $dsql->SetQuery("SELECT h.`id` FROM `#@__shop_historyclick` h
                LEFT JOIN `#@__shop_product` p ON p.`id` = h.`aid`
                LEFT JOIN `#@__shop_store` o  ON o.`id` = p.`store`
                WHERE  o.`userid` = $userid AND h.`date` >= $start AND h.`date` < $end ");
        $shophis = $dsql->dsqlOper($hissp,"totalCount");

        //商城昨日浏览量
        $tohissp = $dsql->SetQuery("SELECT h.`id` FROM `#@__shop_historyclick` h
                LEFT JOIN `#@__shop_product` p ON p.`id` = h.`aid`
                LEFT JOIN `#@__shop_store` o  ON o.`id` = p.`store`
                WHERE  o.`userid` = $userid AND h.`date` >= $prevDay AND h.`date` < $today ");
        $preshophis = $dsql->dsqlOper($tohissp,"totalCount");

        //商城今日以及以后浏览量
        $dayhisshop = $dsql->SetQuery("SELECT h.`id` FROM `#@__shop_historyclick` h
                LEFT JOIN `#@__shop_product` p ON p.`id` = h.`aid`
                LEFT JOIN `#@__shop_store` o  ON o.`id` = p.`store`
                WHERE  o.`userid` = $userid AND h.`date` >=$day ");
        $hisshopday = $dsql->dsqlOper($dayhisshop,"totalCount");

        //商城上周浏览量
        $lasthisshop = $dsql->SetQuery("SELECT h.`id` FROM `#@__shop_historyclick` h
                LEFT JOIN `#@__shop_product` p ON p.`id` = h.`aid`
                LEFT JOIN `#@__shop_store` o  ON o.`id` = p.`store`
                WHERE  o.`userid` = $userid  AND h.`date` >=$tomorrow AND h.`date` < $toend ");
        $hisshoplast= $dsql->dsqlOper($lasthisshop,"totalCount");

        //团购今日浏览量
        $histuan = $dsql->SetQuery("SELECT h.`id` FROM `#@__tuan_historyclick` h
                LEFT JOIN `#@__tuanlist` p ON p.`id` = h.`aid`
                LEFT JOIN `#@__tuan_store` o  ON o.`id` = p.`sid`
                WHERE  o.`uid` = $userid  AND h.`date` >= $start AND h.`date` < $end ");
        $tuanhis = $dsql->dsqlOper($histuan,"totalCount");

        //团购昨日浏览量
        $tohistuan = $dsql->SetQuery("SELECT h.`id` FROM `#@__tuan_historyclick` h
                LEFT JOIN `#@__tuanlist` p ON p.`id` = h.`aid`
                LEFT JOIN `#@__tuan_store` o  ON o.`id` = p.`sid`
                WHERE  o.`uid` = $userid  AND h.`date` >= $prevDay AND h.`date` < $today ");
        $pretuanhis = $dsql->dsqlOper($tohistuan,"totalCount");
        //团购今日以及以后的浏览量
        $dayhistuan = $dsql->SetQuery("SELECT h.`id` FROM `#@__tuan_historyclick` h
                LEFT JOIN `#@__tuanlist` p ON p.`id` = h.`aid`
                LEFT JOIN `#@__tuan_store` o  ON o.`id` = p.`sid`
                WHERE  o.`uid` = $userid  AND h.`date` >= $day ");
        $histuanday = $dsql->dsqlOper($dayhistuan,"totalCount");

        //团购上周的浏览量
        $dayhistuan = $dsql->SetQuery("SELECT h.`id` FROM `#@__tuan_historyclick` h
                LEFT JOIN `#@__tuanlist` p ON p.`id` = h.`aid`
                LEFT JOIN `#@__tuan_store` o  ON o.`id` = p.`sid`
                WHERE  o.`uid` = $userid  AND h.`date` >= $tomorrow AND h.`date` < $toend ");
        $histuanlast = $dsql->dsqlOper($dayhistuan,"totalCount");

        //商家今日浏览量
        $bus= $dsql->SetQuery("SELECT `id` FROM `#@__business_historyclick`
                WHERE  `fuid` = $userid  AND `date` >= $start AND  `date` < $end ");
        $bushis = $dsql->dsqlOper($bus,"totalCount");

        //商家昨日浏览量
        $tobus = $dsql->SetQuery("SELECT `id` FROM `#@__business_historyclick`
                WHERE  `fuid` = $userid  AND `date` >= $prevDay AND  `date` < $today ");
        $prebus= $dsql->dsqlOper($tobus,"totalCount");
        //商家今日以及以后浏览量
        $daybus = $dsql->SetQuery("SELECT `id` FROM `#@__business_historyclick`
                WHERE  `fuid` = $userid  AND `date` >= $day");
        $busday = $dsql->dsqlOper($daybus,"totalCount");

        //商家上周浏览量
        $lastbus = $dsql->SetQuery("SELECT `id` FROM `#@__business_historyclick` h
                WHERE  `fuid` = $userid  AND `date` >= $tomorrow AND  `date` < $today ");
        $buslast = $dsql->dsqlOper($lastbus,"totalCount");

        //团购今日收藏
        $collecttuan= $dsql->SetQuery("SELECT c.`id` FROM `#@__member_collect` c  LEFT JOIN `#@__tuan_store` s ON  c.`aid` = s.`id`
                WHERE  s.`uid` = $userid  AND `module` = 'tuan'  AND c.`pubdate` >= $start AND  c.`pubdate` < $end ");
        $tuancollect = $dsql->dsqlOper($collecttuan,"totalCount");

        //团购昨日收藏
        $precollecttuan= $dsql->SetQuery("SELECT c.`id` FROM `#@__member_collect` c  LEFT JOIN `#@__tuan_store` s ON  c.`aid` = s.`id`
                WHERE  s.`uid` = $userid  AND `module` = 'tuan'  AND `pubdate` >= $prevDay AND  `pubdate` < $today ");
        $collecttuanpre = $dsql->dsqlOper($precollecttuan,"totalCount");
        //团购今天以及以后收藏
        $daycollecttuan= $dsql->SetQuery("SELECT c.`id` FROM `#@__member_collect` c  LEFT JOIN `#@__tuan_store` s ON  c.`aid` = s.`id`
                WHERE  s.`uid` = $userid  AND c.`module` = 'tuan'  AND c.`pubdate` >= $day");
        $collecttuanday = $dsql->dsqlOper($daycollecttuan,"totalCount");
        //团购上周收藏
        $lastcollecttuan= $dsql->SetQuery("SELECT c.`id` FROM `#@__member_collect` c  LEFT JOIN `#@__tuan_store` s ON  c.`aid` = s.`id`
                WHERE  s.`uid` = $userid  AND `module` = 'tuan'  AND c.`pubdate` >= $tomorrow AND  c.`pubdate` < $today  ");
        $collecttuanlast = $dsql->dsqlOper($lastcollecttuan,"totalCount");


        //外卖今日收藏
        $collectwaimai= $dsql->SetQuery("SELECT c.`id` FROM `#@__member_collect` c  LEFT JOIN `#@__waimai_shop` s ON  c.`aid` = s.`id`
                LEFT JOIN `#@__waimai_shop_manager` m ON  s.`id` = m.`shopid`
                WHERE  m.`userid` = $userid  AND `module` = 'waimai'  AND c.`pubdate` >= $start AND  c.`pubdate` < $end ");
        $waimaicollect = $dsql->dsqlOper($collectwaimai,"totalCount");

        //外卖昨日收藏
        $precollectwaimai =  $dsql->SetQuery("SELECT c.`id` FROM `#@__member_collect` c  LEFT JOIN `#@__waimai_shop` s ON  c.`aid` = s.`id`
                LEFT JOIN `#@__waimai_shop_manager` m ON  s.`id` = m.`shopid`
                WHERE  m.`userid` = $userid  AND `module` = 'waimai'  AND c.`pubdate` >= $prevDay AND  c.`pubdate` < $today ");
        $collectwaimaipre = $dsql->dsqlOper($precollectwaimai,"totalCount");
        //外卖今天以及以后收藏
        $daycollectwaimai= $dsql->SetQuery("SELECT c.`id` FROM `#@__member_collect` c  LEFT JOIN `#@__waimai_shop` s ON  c.`aid` = s.`id`
                LEFT JOIN `#@__waimai_shop_manager` m ON  s.`id` = m.`shopid`
                WHERE  m.`userid` = $userid  AND `module` = 'waimai'  AND c.`pubdate` >= $day");
        $collectwaimaiday = $dsql->dsqlOper($daycollectwaimai,"totalCount");
        //外卖上周收藏
        $lastcollectwaimai= $dsql->SetQuery("SELECT c.`id` FROM `#@__member_collect` c  LEFT JOIN `#@__waimai_shop` s ON  c.`aid` = s.`id`
                LEFT JOIN `#@__waimai_shop_manager` m ON  s.`id` = m.`shopid`
                WHERE  m.`userid` = $userid  AND `module` = 'waimai'   AND c.`pubdate` >= $tomorrow AND  c.`pubdate` < $today  ");
        $collectwaimailast = $dsql->dsqlOper($lastcollectwaimai,"totalCount");

        //商城今日收藏
        $collectshop= $dsql->SetQuery("SELECT c.`id` FROM `#@__member_collect` c  LEFT JOIN `#@__shop_store` s ON  c.`aid` = s.`id`
                WHERE  s.`userid` = $userid   AND `module` = 'shop'  AND c.`pubdate` >= $start AND  c.`pubdate` < $end ");
        $shopcollect = $dsql->dsqlOper($collectshop,"totalCount");

        //商城昨日收藏
        $precollectwaimai =  $dsql->SetQuery("SELECT c.`id` FROM `#@__member_collect` c  LEFT JOIN `#@__shop_store` s ON  c.`aid` = s.`id`
                WHERE  s.`userid` = $userid   AND `module` = 'shop' AND c.`pubdate` >= $prevDay AND  c.`pubdate` < $today ");
        $collectshoppre = $dsql->dsqlOper($precollectwaimai,"totalCount");
        //商城今天以及以后收藏
        $daycollectshop = $dsql->SetQuery("SELECT c.`id` FROM `#@__member_collect` c  LEFT JOIN `#@__shop_store` s ON  c.`aid` = s.`id`
                WHERE  s.`userid` = $userid   AND `module` = 'shop' AND c.`pubdate` >= $day");
        $collectshopday = $dsql->dsqlOper($daycollectshop,"totalCount");
        //商城上周收藏
        $lastcollectshop= $dsql->SetQuery("SELECT c.`id` FROM `#@__member_collect` c  LEFT JOIN `#@__shop_store` s ON  c.`aid` = s.`id`
                WHERE  s.`userid` = $userid   AND `module` = 'shop' AND c.`pubdate` >= $tomorrow AND  c.`pubdate` < $today  ");
        $collectshoplast = $dsql->dsqlOper($lastcollectshop,"totalCount");


        $dayProportion = $orderday[0]['count']+$waimaiday[0]['count']+$shopday[0]['count'];
        $lastdayProportion = $lastorder[0]['count']+$waimailast[0]['count']+$shoplast[0]['count'];   //订单
        if ($lastdayProportion == 0 ){
            $orderList = $dayProportion * 100;
        }else{
            $orderList =  (($dayProportion - $lastdayProportion)/$lastdayProportion)*100;
        }
        //支付余额
        $dayprice =$orderday[0]['price']+$waimaiday[0]['price']+$shopday[0]['price'];
        $lastprice = $lastorder[0]['price']+$waimailast[0]['price']+$shoplast[0]['price'];
        if ($dayprice && $lastprice){
            $price = (($dayprice - $lastprice)/$lastprice)*100;
        }else{
            $price = 0;
        }
        //浏览量比例
        $his = $hisshopday+$histuanday+$busday;         //今日
        $weekhis = $hisshoplast+$histuanlast+$buslast;         //上周
        if ($weekhis == 0){
            $history = $his * 100;
        }else{
            $history =  (($his - $weekhis)/$weekhis)*100;
        }
        //关注比例
        $collec = $collecttuanday+$collectwaimaiday+$collectshopday;                    //今日
        $weekollect = $collecttuanlast+$collectwaimailast+$collectshoplast;               //上周
        if ($weekollect == 0){
            $clloct = $collec * 100;
        }else{
            $clloct =(($collec - $weekollect)/$weekollect)*100;
        }
        //支付人数比例
        $people = $peopleday+$wmdaypeople+$spdaypeople;                                   //今日及以后支付人数
        $ltpeople = $peolast+$wmlastpeople+$spweekpeople;                                   //上周支付人数

        if($ltpeople == 0){
                $paypeople = $people * 100;
        }else{
            $paypeople =(($people - $ltpeople)/$ltpeople)*100;
        }
        $yesprice = $prevorder[0]['prevtuanprice']+$prewaimai[0]['prevwaimaiprice']+$preshop[0]['prevshopprice'];    //昨日收益
        $array = array([
        'ordercount'          => $dayorder[0]['tuan']+$daywaimai[0]['waimai']+$dayshop[0]['shop'],                         //今日 订单
        'yesterdayorderCount' => $prevorder[0]['prevtuan']+$prewaimai[0]['prevwaimai']+$preshop[0]['prevshop'],            //昨日  订单
        'proportionorder'     => round($orderList,2),                                                                 //同比上周  订单
        'orderpricecount'     => $dayorder[0]['tuanprice']+$daywaimai[0]['waimaiprice']+$dayshop[0]['shopprice'],          //今日 支付余额
        'yesorderpriceCount'  => sprintf("%.2f", $yesprice),                                                       //昨日  支付余额
        'proportionpriceorder'=> sprintf("%.2f", $price),                                                        //同比上周  支付余额
        'history'             => $shophis+$tuanhis+$bushis,                                                                 //今日访客
        'yesterdayhistory'    => $preshophis+$pretuanhis+$prebus,                                                            //昨日访客
        'proportionhistory'   => round($history,2),                                                                     //同比上周  访客
        'collect'             => $tuancollect+$waimaicollect+$shopcollect,                                                 //今日关注
        'yesterdaycollect'    => $collecttuanpre+$collectwaimaipre+$collectshoppre,                                        //昨日关注
        'proportioncollect'   => round($clloct,2),                                                                       //同比上周   关注
        'people'              => $daypeople+$daywaimaipeople+$daydayshoppeople,                                            //今日支付人数
        'yesterdaypeople'     => $prevpeople+$lastwaimaipeople+$splastpeople,                                             //昨日支付人数
        'paypeople'           => round($paypeople,2),                                                                 //同比上周
        ]);

        return $array;


    }


    //支付订单
        public function paymentOrder()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $lately  = $this->param['date'];
            }
        }
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }
        $info = $userLogin->getMemberInfo();
        $busiId = $info['busiId'];
        $dataArr =  array();

            //本月
        if ($lately == 'month'){
            $now = time();
//            $end = strtotime('+1 month');
            $yue_star = mktime(0, 0, 0, date('m', $now), 1, date('Y', $now));//当前月开始时间
//            $yue_end = mktime(0, 0, 0, date('m', $end), 1, date('Y', $end)) - 1;//当前月结束时间
            $yue_end = time();
            $lastMonthDate = date('Y-m-d',$yue_star);
            $nowDate = date('Y-m-d',$yue_end);
        }
        if ($lately == 'lately30'){
                $nowDate = date("Y-m-d");
            $lastMonthDate = date("Y-m-d", strtotime("-30 day"));
        }
        if ($lately == 'lately7'){
            $nowDate = date("Y-m-d");
            $lastMonthDate = date("Y-m-d", strtotime("-7 day"));
        }
            $begintime = strtotime($lastMonthDate);
            $endtime = strtotime($nowDate);
            for($start = $endtime; $start >= $begintime; $start -= 24 * 3600) {

                $time1 = $start;
                $time2 = $start + 86400;

                //团购下单人数
                $archives = $dsql->SetQuery("SELECT " .
                    " SUM(o.`orderprice`)tuanprice,o.`userid`   " .
                    "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
                    "WHERE s.`uid` = $userid  AND `orderdate` >= $time1 AND `orderdate` < $time2 GROUP BY o.`userid`");

                $dayorder = $dsql->dsqlOper($archives,"results");
                $column_price = array_column($dayorder, 'tuanprice');
                $column_buynum = array_column($dayorder, 'userid');

                $tuanprice = array_sum($column_price);                     //价格
                $tuanbuynum= count($column_buynum);                     //下单人数


                //外卖下单人数
                $waimai = $dsql->SetQuery("SELECT SUM(o.`amount`) waimaiprice,o.`uid` FROM `#@__waimai_shop_manager` s
                    LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                    LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                    LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                    LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                    WHERE  s.`userid` = $userid  AND o.`pubdate` >= $time1 AND o.`pubdate` < $time2  GROUP BY o.`uid`");
                $daywaimai = $dsql->dsqlOper($waimai,"results");
                $column_waimaiuser = array_column($daywaimai, 'uid');
                $column_waimaiprice = array_column($daywaimai, 'waimaiprice');
                $waimaiprice = array_sum($column_waimaiprice);                     //价格
                $waimaibuynum= count($column_waimaiuser);                       //外卖下单人数

                //商城下单人数
                $shop = $dsql->SetQuery("SELECT count(o.`userid`) userid,SUM(o.`amount`) shopprice FROM `#@__shop_store` s
               LEFT JOIN `#@__member` m ON s.`userid` = m.`id`
    	       LEFT JOIN `huoniao_shop_order` o ON s.`id` = o.`store`
               LEFT JOIN `#@__shop_order_product` t ON o.`id` = t.`orderid`
               LEFT JOIN `#@__shop_product` p ON t.`proid` = p.`id`
                WHERE  s.`userid` = $userid  AND o.`orderdate` >= $time1 AND o.`orderdate` < $time2 ");


                $dayshop = $dsql->dsqlOper($shop,"results");
                $column_shopuser = array_column($dayshop, 'userid');
                $column_shopprice = array_column($dayshop, 'shopprice');

                 $shopprice = array_sum($column_shopprice);                     //价格
                 $shopbuynum = $dayshop[0]['userid'];                         //商城下单人数

                $orderUser  = $tuanbuynum+$waimaibuynum+$shopbuynum;              //总下单数


                //团购支付人数
                $tuan = $dsql->SetQuery("SELECT " .
                    "o.`userid`, SUM(o.`orderprice`)tuanprice  " .
                    "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
                    "WHERE s.`uid` = $userid  AND `orderdate` >= $time1 AND `orderdate` < $time2  AND o.`orderstate` != '0' GROUP BY o.`userid` ");
                $paytuan = $dsql->dsqlOper($tuan,"results");
                $column_payprice = array_column($paytuan, 'tuanprice');
                $column_paynum = array_column($paytuan, 'userid');
                $tuanpayprice = array_sum($column_payprice);                     //支付价格
                $tuanpaynum= count($column_paynum);                             //支付人数

                //外卖支付人数
                $wm = $dsql->SetQuery("SELECT o.`uid`,SUM(o.`amount`) waimaiprice FROM `#@__waimai_shop_manager` s
                    LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                    LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                    LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                    LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                    WHERE  s.`userid` = $userid  AND o.`pubdate` >= $time1 AND o.`pubdate` < $time2 AND o.`state` !='0' GROUP BY o.`uid` ");
                $paywaimai = $dsql->dsqlOper($wm,"results");
                $column_wmpayprice = array_column($paywaimai, 'waimaiprice');
                $column_wmpaynum = array_column($paywaimai, 'uid');
                $wmpayprice = array_sum($column_wmpayprice);                     //支付价格
                $wmpaynum= count($column_wmpaynum);                             //支付人数

                //商城支付人数
                $sp = $dsql->SetQuery("SELECT count(o.`userid`) userid,SUM(o.`amount`) shopprice FROM `#@__shop_store` s
               LEFT JOIN `#@__member` m ON s.`userid` = m.`id`
               LEFT JOIN `huoniao_shop_order` o ON s.`id` = o.`store`
               LEFT JOIN `#@__shop_order_product` t ON o.`id` = t.`orderid`
               LEFT JOIN `#@__shop_product` p ON t.`proid` = p.`id`
                    WHERE  s.`userid` = $userid  AND o.`orderdate` >= $time1 AND o.`orderdate` < $time2 AND o.`orderdate` !='0' GROUP BY o.`userid`");
                $payshop = $dsql->dsqlOper($sp,"results");
                $column_sppayprice = array_column($payshop, 'shopprice');
                $column_sppaynum = array_column($payshop, 'userid');
                $sppayprice = array_sum($column_sppayprice);                     //支付价格
                $sppaynum = $payshop[0]['userid'];                            //商城支付人数
                $payOrderUser  = $tuanpaynum+$wmpaynum+$sppaynum;                    //总支付数
                $payOrderPrice = sprintf("%.2f",$tuanpayprice+$wmpayprice+$sppayprice);                //总支付金额
                array_push($dataArr, array(
                    "date"      => date("m-d", $start),                                                     //时间
                    "total"      => $orderUser,                                                                     //订单数
                    "pay_price"  => sprintf("%.2f", $payOrderPrice),                                        //支付金额
                    "user"       => $payOrderUser,                                                                  //支付人数
                ));
                $data= array_reverse($dataArr);


            }
            return   $data;



    }


    //成交客户
    public  function dealCustomer(){
            global $dsql;
            global $userLogin;
            global $langData;
        $userid = $userLogin->getMemberID();

        if(!empty($this->param)){
                if(!is_array($this->param)){
                    return array("state" => 200, "info" => '格式错误！');
                }else{
                    $lately  = $this->param['date'];
                }
            }
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        $info = $userLogin->getMemberInfo();
        $busiId = $info['busiId'];
            $dataArr =  array();

            if ($lately == 'month'){
                //本月
                $nowDate = date("Y-m-d");
                $lastMonthDate=date('Y-m-01', strtotime(date("Y-m-d")));
            }
            if ($lately == 'lately30'){
                $nowDate = date("Y-m-d");
                //30天
                $lastMonthDate = date("Y-m-d", strtotime("-30 day"));

            }
            if ($lately == 'lately7'){
                //7天
                $nowDate = date("Y-m-d");
                $lastMonthDate = date("Y-m-d", strtotime("-7 day"));
            }
            if ($lately == 'year'){
                //本年
                $lastMonthDate = date("Y",time())."-1"."-1"; //本年开始
                $nowDate = date("Y",time())."-12"."-31"; //本年结束
            }

            $begintime = strtotime($lastMonthDate);
            $endtime = strtotime($nowDate)+86400;
            //商家浏览量
            $bus= $dsql->SetQuery("SELECT `id` FROM `#@__business_historyclick`
                    WHERE  `fuid` = $userid AND `date` >= $begintime AND  `date` < $endtime ");
            $bushis = $dsql->dsqlOper($bus,"totalCount");

            //团购浏览量
            $histuan = $dsql->SetQuery("SELECT h.`id` FROM `#@__tuan_historyclick` h
                    LEFT JOIN `#@__tuanlist` p ON p.`id` = h.`aid`
                    LEFT JOIN `#@__tuan_store` o  ON o.`id` = p.`sid`
                    WHERE  o.`uid` = $userid AND h.`date` >= $begintime AND h.`date` < $endtime ");
            $tuanhis = $dsql->dsqlOper($histuan,"totalCount");

            //商城浏览量
            $hissp = $dsql->SetQuery("SELECT h.`id` FROM `#@__shop_historyclick` h
                    LEFT JOIN `#@__shop_product` p ON p.`id` = h.`aid`
                    LEFT JOIN `#@__shop_store` o  ON o.`id` = p.`store`
                    WHERE  o.`userid` = $userid AND h.`date` >= $begintime AND h.`date` < $endtime ");
            $shophis = $dsql->dsqlOper($hissp,"totalCount");
            $histroy = $bushis+$tuanhis+$shophis;                   //访客统计

            //团购下单人数
            $archives = $dsql->SetQuery("SELECT " .
                " SUM(o.`orderprice`)tuanprice,o.`userid`   " .
                "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
                "WHERE s.`uid` = $userid  AND `orderdate` >= $begintime AND `orderdate` < $endtime GROUP BY o.`userid`");
            $dayorder = $dsql->dsqlOper($archives,"results");
            $column_price = array_column($dayorder, 'tuanprice');
            $column_buynum = array_column($dayorder, 'userid');

            $tuanprice = array_sum($column_price);                     //价格
            $tuanbuynum= count($column_buynum);                     //下单人数


            //外卖下单人数
            $waimai = $dsql->SetQuery("SELECT SUM(o.`amount`) waimaiprice,o.`uid` FROM `#@__waimai_shop_manager` s
                    LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                    LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                    LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                    LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                    WHERE  s.`userid` = $userid  AND o.`pubdate` >= $begintime AND o.`pubdate` < $endtime  GROUP BY o.`uid`");
            $daywaimai = $dsql->dsqlOper($waimai,"results");
            $column_waimaiuser = array_column($daywaimai, 'uid');
            $column_waimaiprice = array_column($daywaimai, 'waimaiprice');
            $waimaiprice = array_sum($column_waimaiprice);                     //价格
            $waimaibuynum= count($column_waimaiuser);                       //外卖下单人数

        //商城下单人数
            $shop = $dsql->SetQuery("SELECT o.`userid`,SUM(o.`amount`) shopprice FROM `#@__shop_store` s
               LEFT JOIN `#@__member` m ON s.`userid` = m.`id`
               LEFT JOIN `huoniao_shop_order` o ON s.`id` = o.`store`
               LEFT JOIN `#@__shop_order_product` t ON o.`id` = t.`orderid`
               LEFT JOIN `#@__shop_product` p ON t.`proid` = p.`id`
                    WHERE  m.`id` = $userid  AND o.`orderdate` >= $begintime AND o.`orderdate` < $endtime  GROUP BY o.`userid`");
            $dayshop = $dsql->dsqlOper($shop,"results");
            $column_shopuser = array_column($dayshop, 'userid');
            $column_shopprice = array_column($dayshop, 'shopprice');

            $shopprice = array_sum($column_shopprice);                     //价格
            $shopbuynum= count($column_shopuser);                       //外卖下单人数
            $orderUser  = $tuanbuynum+$waimaibuynum+$shopbuynum;              //总下单数
            $orderPrice = sprintf("%.2f",$tuanprice+$waimaiprice+$shopprice);                //总下单金额

            //团购支付人数
            $tuan = $dsql->SetQuery("SELECT " .
                "o.`userid`, SUM(o.`orderprice`)tuanprice  " .
                "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
                "WHERE s.`uid` = $userid AND `orderdate` >= $begintime AND `orderdate` < $endtime  AND o.`orderstate` != '0' GROUP BY o.`userid` ");
            $paytuan = $dsql->dsqlOper($tuan,"results");
            $column_payprice = array_column($paytuan, 'tuanprice');
            $column_paynum = array_column($paytuan, 'userid');
            $tuanpayprice = !empty(array_sum($column_payprice)) ? array_sum($column_payprice) : '0.00';                     //支付价格
            $tuanpaynum= count($column_paynum);                             //支付人数
            //外卖支付人数
            $wm = $dsql->SetQuery("SELECT o.`uid`,SUM(o.`amount`) waimaiprice FROM `#@__waimai_shop_manager` s
                    LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                    LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                    LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                    LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                    WHERE  s.`userid` = $userid  AND o.`pubdate` >= $begintime AND o.`pubdate` < $endtime AND o.`state` !='0' GROUP BY o.`uid` ");

            $paywaimai = $dsql->dsqlOper($wm,"results");
            $column_wmpayprice = array_column($paywaimai, 'waimaiprice');
            $column_wmpaynum = array_column($paywaimai, 'uid');
            $wmpayprice = array_sum($column_wmpayprice);                     //支付价格
            $wmpaynum= count($column_wmpaynum);                             //支付人数

            //商城支付人数
            $sp = $dsql->SetQuery("SELECT o.`userid`,SUM(o.`amount`) shopprice FROM `#@__shop_store` s
               LEFT JOIN `#@__member` m ON s.`userid` = m.`id`
               LEFT JOIN `huoniao_shop_order` o ON s.`id` = o.`store`
               LEFT JOIN `#@__shop_order_product` t ON o.`id` = t.`orderid`
               LEFT JOIN `#@__shop_product` p ON t.`proid` = p.`id`
                    WHERE  m.`id` = $userid  AND o.`orderdate` >= $begintime AND o.`orderdate` < $endtime AND o.`orderdate` !='0' GROUP BY o.`userid`");
            $payshop = $dsql->dsqlOper($sp,"results");
            $column_sppayprice = array_column($payshop, 'shopprice');
            $column_sppaynum = array_column($payshop, 'userid');
            $sppayprice = array_sum($column_sppayprice);                     //支付价格
            $sppaynum= count($column_sppaynum);                             //支付人数
            $payOrderUser  = $tuanpaynum+$wmpaynum+$sppaynum;                   //总支付数
            $payOrderPrice = sprintf("%.2f",$tuanpayprice+$wmpayprice+$sppayprice);                //总支付金额
            if ($payOrderUser == 0){
                $userRate = '0.00';
            }else{
                $userRate = sprintf("%.2f",$payOrderPrice / $payOrderUser);                         //客单价
            }
            if ($orderUser == 0) {
                $payOrderRate = '0.00';
            }else{
                $payOrderRate = sprintf("%.2f",$payOrderUser/$orderUser) ;                    //下单_支付转化率
            }
            if ($histroy == 0){
                $orderRate = '0.00';
            }else{
                $orderRate = sprintf("%.2f",$orderUser/$histroy);                              //访客_下单转化率
            }

            $array  = ([
                'histroy'       => $histroy,                                        //访客数
                'orderUser'     => $orderUser,                                  //下单数
                'orderPrice'    => $orderPrice,                                //下单总金额
                'payOrderPrice' => $payOrderPrice,                            //支付总金额
                'payOrderUser'  => $payOrderUser,                             //支付总人数
                'userRate'      => $userRate,                                    //客单价
                'payOrderRate' => $payOrderRate,                            //下单_支付转化率
                'orderRate'     => $orderRate,                               //访客_下单转化率
            ]);

            return  $array;

    }
    //商品支付排行
    public  function  payRanking(){
        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $lately  = $this->param['date'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        $info = $userLogin->getMemberInfo();
        $busiId = $info['busiId'];
        if ($lately == 'month'){
            //本月
            $now = time();
//            $end = strtotime('+1 month');
            $yue_star = mktime(0, 0, 0, date('m', $now), 1, date('Y', $now));//当前月开始时间
//            $yue_end = mktime(0, 0, 0, date('m', $end), 1, date('Y', $end)) - 1;//当前月结束时间
            $yue_end = time();
            $lastMonthDate = date('Y-m-d',$yue_star);
            $nowDate = date('Y-m-d',$yue_end);
        }
        if ($lately == 'lately30'){
            $nowDate = date("Y-m-d");
            //30天
            $lastMonthDate = date("Y-m-d", strtotime("-30 day"));

        }
        if ($lately == 'lately7'){
            //7天
             $nowDate = date("Y-m-d");
            $lastMonthDate = date("Y-m-d", strtotime("-7 day"));
        }
        if ($lately == 'year'){
            //本年
            $lastMonthDate = date("Y",time())."-1"."-1"; //本年开始
            $nowDate = date("Y",time())."-12"."-31"; //本年结束
        }

        $begintime = strtotime($lastMonthDate);
        $endtime = strtotime($nowDate)+86400;
        //团购订单
        $tuanOrder = $dsql->SetQuery(" SELECT " .
            "count(o.`proid`) sales,l.`title`,l.`litpic`,l.`id` " .
            "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
            "WHERE s.`uid` = $userid   AND o.`orderdate` >= $begintime AND o.`orderdate` < $endtime  AND o.`orderstate` != '0' GROUP BY l.`id` ");
        $Ordertuan = $dsql->dsqlOper($tuanOrder, "results");
        foreach ($Ordertuan as $key=>$value){
            $Ordertuan[$key]['pic'] = $value['litpic'] ? getFilePath($value['litpic']) : '';
            $param = array(
                "service"  => "tuan",
                "template" => "detail",
                "id"       => $value['id']
            );
            $url   = getUrlPath($param);
            $Ordertuan[$key]['url'] = $url;
        }
        //外卖订单
        $waimai = $dsql->SetQuery("SELECT l.`pics`,count(o.`fids`) sales,l.`title`,p.`id`  FROM `#@__waimai_shop_manager` s
                    LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                    LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                    LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                    LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                    WHERE  s.`userid` = $userid  AND o.`pubdate` >= $begintime AND o.`pubdate` < $endtime  AND o.`state` !='0'   GROUP BY l.`id`  ");
        $waimaiorder = $dsql->dsqlOper($waimai, "results");
       foreach ($waimaiorder as $key=>$value){
           $waimaiorder[$key]['pic'] = $value['pics'] ? getFilePath($value['pics']) : '';
           $param = array(
               "service"  => "waimai",
               "template" => "shop",
               "id"       => $value['id']
           );
           $url   = getUrlPath($param);
           $waimaiorder[$key]['url'] = $url;
       }
        //商城订单
        $shop = $dsql->SetQuery("SELECT p.`id`,p.`title`,p.`litpic`,count(o.`userid`) sales FROM `#@__shop_store` s
                LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                LEFT JOIN `#@__shop_product` p ON s.`id` = p.`store`
                LEFT JOIN `#@__shop_order_product` t ON p.`id` = t.`proid`
                LEFT JOIN `#@__shop_order` o ON t.`orderid` = o.`id`
                WHERE  m.`id` = $userid  AND o.`orderdate` >= $begintime AND o.`orderdate` < $endtime AND o.`orderdate` !='0' GROUP BY p.`id` ");
        $shoporder = $dsql->dsqlOper($shop, "results");
        foreach ($shoporder as $key=>$value){
            $shoporder[$key]['pic'] = $value['litpic'] ? getFilePath($value['litpic']) : '';
            $param = array(
                "service"  => "shop",
                "template" => "detail",
                "id"       => $value['id']
            );
            $url   = getUrlPath($param);
            $shoporder[$key]['url'] = $url;
        }

        $arr =array_merge($Ordertuan, $waimaiorder, $shoporder);
        $cmf_arr = array_column($arr, 'sales');
        array_multisort($cmf_arr, SORT_DESC, $arr);
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ?1 : $page;
        $totalCount = count($arr);
        $totalPage = ceil($totalCount/$pageSize);
        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );
        return array('pageInfo'=>$pageinfo,'list'=>$arr);

        }


        //商品访客排行
    public  function  hisRanking(){

        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $lately   = $this->param['date'];
                $pageSize = $this->param['pageSize'];
                $page     = $this->param['page'];

            }
        }
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }
        $info = $userLogin->getMemberInfo();
        $busiId = $info['busiId'];

        if ($lately == 'month'){
            //本月
            $now = time();
//            $end = strtotime('+1 month');
            $yue_star = mktime(0, 0, 0, date('m', $now), 1, date('Y', $now));//当前月开始时间
//            $yue_end = mktime(0, 0, 0, date('m', $end), 1, date('Y', $end)) - 1;//当前月结束时间
            $yue_end = time();
            $lastMonthDate = date('Y-m-d',$yue_star);
            $nowDate = date('Y-m-d',$yue_end);

        }
        if ($lately == 'lately30'){
            $nowDate = date("Y-m-d");
            //30天
            $lastMonthDate = date("Y-m-d", strtotime("-30 day"));

        }
        if ($lately == 'lately7'){
            //7天
            $nowDate = date("Y-m-d");
            $lastMonthDate = date("Y-m-d", strtotime("-7 day"));
        }
        if ($lately == 'year'){
            //本年
            $lastMonthDate = date("Y",time())."-1"."-1"; //本年开始
            $nowDate = date("Y",time())."-12"."-31"; //本年结束
        }

        $begintime = strtotime($lastMonthDate);
        $endtime = strtotime($nowDate)+86400;

//        //商家浏览量
//        $bus= $dsql->SetQuery("SELECT `id` FROM `#@__business_historyclick`
//                    WHERE  `fuid` = 29 AND `date` >= $begintime AND  `date` < $endtime ");
//        $bushis = $dsql->dsqlOper($bus,"totalCount");


        //团购商品访客
        $tuan = $dsql->SetQuery(" SELECT " .
            "count(h.`uid`) sales,t.`title`,t.`litpic`,t.`id` " .
            "FROM  `#@__tuan_store` s  LEFT JOIN `#@__member` m ON  s.`uid` = m.`id`  LEFT JOIN `#@__tuanlist` t ON s.`id` = t.`sid` LEFT JOIN `#@__tuan_historyclick` h ON t.`id` = h.`aid`" .
            "WHERE  s.`uid` = $userid  AND h.`date` >= $begintime AND h.`date` < $endtime  GROUP BY t.`id` ORDER BY sales DESC ");
        $histuan= $dsql->dsqlOper($tuan,"results");
        foreach ($histuan as $key=>$value){
            $histuan[$key]['pic'] = $value['litpic'] ? getFilePath($value['litpic']) : '';
            $param = array(
                "service"  => "tuan",
                "template" => "detail",
                "id"       => $value['id']
            );
            $url   = getUrlPath($param);
            $histuan[$key]['url'] = $url;
        }
        //商城商品访客
        $sp = $dsql->SetQuery("SELECT  count(h.`uid`) sales,p.`title`,p.`litpic`,p.`id` FROM `#@__shop_store` s
                    LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                    LEFT JOIN `#@__shop_product` p  ON s.`id` = p.`store`
                    LEFT JOIN `#@__shop_historyclick` h  ON p.`id` = h.`aid`
                    WHERE  s.`userid` = $userid  AND h.`date` >= $begintime AND h.`date` < $endtime  GROUP BY p.`id` ORDER BY sales DESC ");

        $hisshop = $dsql->dsqlOper($sp,"results");
        foreach ($hisshop as $key=>$value){
            $hisshop[$key]['pic'] = $value['litpic'] ? getFilePath($value['litpic']) : '';
            $param = array(
                "service"  => "shop",
                "template" => "detail",
                "id"       => $value['id']
            );
            $url   = getUrlPath($param);
            $hisshop[$key]['url'] = $url;
        }

        $arr  = array_merge($histuan, $hisshop);
        $cmf_arr = array_column($arr, 'sales');
        array_multisort($cmf_arr, SORT_DESC, $arr);
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ?1 : $page;
        $totalCount = count($arr);
        $totalPage = ceil($totalCount/$pageSize);
        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        return array('pageInfo'=>$pageinfo,"list"=>$arr);

    }

    //商品加购排行

    public  function  shopIncrease(){
        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $lately   = $this->param['date'];
                $pageSize = $this->param['pageSize'];
                $page     = $this->param['page'];

            }
        }
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }
        $info = $userLogin->getMemberInfo();
        $busiId = $info['busiId'];

        if ($lately == 'month'){
            //本月
            $now = time();
//            $end = strtotime('+1 month');
            $yue_star = mktime(0, 0, 0, date('m', $now), 1, date('Y', $now));//当前月开始时间
//            $yue_end = mktime(0, 0, 0, date('m', $end), 1, date('Y', $end)) - 1;//当前月结束时间
            $yue_end = time();
            $lastMonthDate = date('Y-m-d',$yue_star);
            $nowDate = date('Y-m-d',$yue_end);

        }
        if ($lately == 'lately30'){
            $nowDate = date("Y-m-d");
            //30天
            $lastMonthDate = date("Y-m-d", strtotime("-30 day"));

        }
        if ($lately == 'lately7'){
            //7天
            $nowDate = date("Y-m-d");
            $lastMonthDate = date("Y-m-d", strtotime("-7 day"));
        }
        if ($lately == 'year'){
            //本年
            $lastMonthDate = date("Y",time())."-1"."-1"; //本年开始
            $nowDate = date("Y",time())."-12"."-31"; //本年结束
        }

        $begintime = strtotime($lastMonthDate);
        $endtime = strtotime($nowDate)+86400;

        //团购订单
        $tuanOrder = $dsql->SetQuery(" SELECT " .
            "count(o.`proid`) sales,l.`title`,l.`litpic`,l.`id`  " .
            "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
            "WHERE s.`uid` = $userid  AND o.`orderdate` >= $begintime AND o.`orderdate` < $endtime  AND o.`orderstate` != '0' GROUP BY l.`id` ");
        $Ordertuan = $dsql->dsqlOper($tuanOrder, "results");
        foreach ($Ordertuan as $key=>$value){
            $Ordertuan[$key]['pic'] = $value['litpic'] ? getFilePath($value['litpic']) : '';
            $param = array(
                "service"  => "tuan",
                "template" => "detail",
                "id"       => $value['id']
            );
            $url   = getUrlPath($param);
            $Ordertuan[$key]['url'] = $url;

            if ($value['sales'] <=1){
                unset($Ordertuan[$key]);
            }

        }
        //外卖订单
        $waimai = $dsql->SetQuery("SELECT  l.`pics`,l.`title`,count(o.`fids`) sales,o.`uid`,p.`id` FROM `#@__waimai_shop_manager` s
                    LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                    LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                    LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                    LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                    WHERE  s.`userid` = $userid  AND o.`pubdate` >= $begintime AND o.`pubdate` < $endtime  AND o.`state` !='0'   GROUP BY l.`id`  ");

        $waimaiorder = $dsql->dsqlOper($waimai, "results");

        foreach ($waimaiorder as $key=>$value){
         $waimaiorder[$key]['pic'] = $value['pics'] ? getFilePath($value['pics']) : '';
            $param = array(
                "service"  => "waimai",
                "template" => "shop",
                "id"       => $value['id']
            );
            $url   = getUrlPath($param);
            $waimaiorder[$key]['url'] = $url;

         if ($value['sales'] <=1){
             unset($waimaiorder[$key]);
         }
        }

        //商城订单
        $shop = $dsql->SetQuery("SELECT p.`title`,p.`litpic`,count(t.`proid`) sales,p.`id`  FROM `#@__shop_store` s
                LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                LEFT JOIN `#@__shop_product` p ON s.`id` = p.`store`
                LEFT JOIN `#@__shop_order_product` t ON p.`id` = t.`proid`
                LEFT JOIN `#@__shop_order` o ON t.`orderid` = o.`id`
                WHERE  s.`userid` = $userid  AND o.`orderdate` >= $begintime AND o.`orderdate` < $endtime AND o.`orderdate` !='0' GROUP BY p.`id` ");


        $shoporder = $dsql->dsqlOper($shop, "results");
        foreach ($shoporder as $key=>$value){
            $shoporder[$key]['pic'] = $value['litpic'] ? getFilePath($value['litpic']) : '';
            $param = array(
                "service"  => "shop",
                "template" => "detail",
                "id"       => $value['id']
            );
            $url   = getUrlPath($param);
            $shoporder[$key]['url'] = $url;
            if ($value['sales'] <=1){
                unset($shoporder[$key]);
            }
        }

        $arr =array_merge($Ordertuan, $waimaiorder, $shoporder);
        $cmf_arr = array_column($arr, 'sales');
        array_multisort($cmf_arr, SORT_DESC, $arr);
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ?1 : $page;
        $totalCount = count($arr);
        $totalPage = ceil($totalCount/$pageSize);
        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        return array("pageInfo"=>$pageinfo,"list"=>$arr);


    }

    //成交客户占比
    public  function   customer(){
        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $lately  = $this->param['date'];
            }
        }
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }
        $info = $userLogin->getMemberInfo();
        $busiId = $info['busiId'];

        if ($lately == 'month'){
            //本月
            $now = time();
//            $end = strtotime('+1 month');
            $yue_star = mktime(0, 0, 0, date('m', $now), 1, date('Y', $now));//当前月开始时间
//            $yue_end = mktime(0, 0, 0, date('m', $end), 1, date('Y', $end)) - 1;//当前月结束时间
            $yue_end = time();
            $lastMonthDate = date('Y-m-d',$yue_star);
            $nowDate = date('Y-m-d',$yue_end);

        }
        if ($lately == 'lately30'){
            $nowDate = date("Y-m-d");
            //30天
            $lastMonthDate = date("Y-m-d", strtotime("-30 day"));

        }
        if ($lately == 'lately7'){
            //7天
            $nowDate = date("Y-m-d");
            $lastMonthDate = date("Y-m-d", strtotime("-7 day"));
        }
        if ($lately == 'year'){
            //本年
            $lastMonthDate = date("Y",time())."-1"."-1"; //本年开始
            $nowDate = date("Y",time())."-12"."-31"; //本年结束
        }

        $begintime = strtotime($lastMonthDate);
        $endtime = strtotime($nowDate)+86400;


        //外卖订单
        $waimai = $dsql->SetQuery("SELECT o.`uid`,SUM(o.`amount`) price  FROM `#@__waimai_shop_manager` s
                    LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                    LEFT JOIN `#@__waimai_shop` p  ON p.`id` = s.`shopid`
                    LEFT JOIN `#@__waimai_order` o  ON o.`sid` = p.`id`
                    LEFT JOIN `#@__waimai_list` l  ON o.`fids` = l.`id`
                    WHERE  s.`userid` = $userid  AND o.`pubdate` >= $begintime AND o.`pubdate` < $endtime  AND o.`state` !='0'   GROUP BY o.`uid`  ");
        $waimaiorder = $dsql->dsqlOper($waimai, "results");
        $arrNew = [];
        $arrold = [];
        if ($waimaiorder){
            foreach ($waimaiorder as $key=>$value) {
                $member = $dsql->SetQuery("SELECT  `id`  FROM `#@__member`
                WHERE  `id` = " . $value['uid'] . "   AND  `regtime` >= $begintime AND `regtime` < $endtime ");
                $kehu = $dsql->dsqlOper($member, "results");
                if ($kehu) {
                    //新顾客
                    $arrNew[] = $value;
                } else {
                    //老顾客
                    $arrold[] = $value;
                }
            }
        }
        $column_oldprice = array_column($arrold, 'price');
        $column_newprice = array_column($arrNew, 'price');
        $newSum          = array_sum($column_newprice);                     //新顾客价格
        $newCount        = count($arrNew);                                 //新顾客人数
        $oldSum          = array_sum($column_oldprice);                     //老顾客价格
        $oldCount        = count($arrold);                                 //老顾客人数


        //商城订单
        $shop = $dsql->SetQuery("SELECT o.`userid`,SUM(o.`amount`) price  FROM `#@__shop_store` s
                LEFT JOIN `#@__member` m ON m.`id` = s.`userid`
                LEFT JOIN `#@__shop_product` p ON s.`id` = p.`store`
                LEFT JOIN `#@__shop_order_product` t ON p.`id` = t.`proid`
                LEFT JOIN `#@__shop_order` o ON t.`orderid` = o.`id`
                WHERE  s.`userid` = $userid  AND o.`orderdate` >= $begintime AND o.`orderdate` < $endtime AND o.`orderdate` !='0' GROUP BY o.`userid` ");
        $shoporder = $dsql->dsqlOper($shop, "results");
        $shopArrNew = [];
        $shopArrold = [];
        if ($shoporder){
            foreach ($shoporder as $key=>$value) {
                $shopmember = $dsql->SetQuery("SELECT  `id`  FROM `#@__member`
                WHERE  `id` = " . $value['userid'] . "   AND  `regtime` >= $begintime AND `regtime` < $endtime ");
                $shopkehu = $dsql->dsqlOper($shopmember, "results");
                if ($shopkehu) {
                    //新顾客
                    $shopArrNew[] = $value;
                } else {
                    //老顾客
                    $shopArrold[] = $value;
                }
            }
        }

        $column_shopoldprice = array_column($shopArrold, 'price');
        $column_shopnewprice = array_column($shopArrNew, 'price');
        $shopnewSum          = array_sum($column_shopnewprice);                         //商城新顾客价格
        $shopnewCount        = count($shopArrNew);                                     //商城新顾客人数
        $shopoldSum          = array_sum($column_shopoldprice);                         //商城老顾客价格
        $shopoldCount        = count($shopArrold);                                     //商城老顾客人数


        //团购订单
        $tuanOrder = $dsql->SetQuery(" SELECT " .
            "count(o.`orderprice`) price,o.`userid` " .
            "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id`" .
            "WHERE s.`uid` = $userid  AND o.`orderdate` >= $begintime AND o.`orderdate` < $endtime  AND o.`orderstate` != '0' GROUP BY o.`userid` ");
        $Ordertuan = $dsql->dsqlOper($tuanOrder, "results");
        $tuanArrNew = [];
        $tuanArrold = [];
        if ($Ordertuan){
            foreach ($Ordertuan as $key=>$value) {
                $tuanmember = $dsql->SetQuery("SELECT  `id`  FROM `#@__member`
                WHERE  `id` = $value[userid]  AND `regtime` >= $begintime AND `regtime` < $endtime ");
                $tuankehu = $dsql->dsqlOper($tuanmember, "results");
                if ($tuankehu) {
                    //新顾客
                    $tuanArrNew[] = $value;
                } else {
                    //老顾客
                    $tuanArrold[] = $value;
                }
            }
        }
        $column_tuanoldprice = array_column($tuanArrold, 'price');
        $column_tuannewprice = array_column($tuanArrNew, 'price');
        $tuannewSum          = array_sum($column_tuannewprice);                         //商城新顾客价格
        $tuannewCount        = count($tuanArrNew);                                     //商城新顾客人数
        $tuanoldSum          = array_sum($column_tuanoldprice);                         //商城老顾客价格
        $tuanoldCount        = count($tuanArrold);                                     //商城老顾客人数


        $newTotalPrice  = $newSum+$shopnewSum+$tuannewSum;                       //新顾客价格
        $newUser        = $newCount+$shopnewCount+$tuannewCount;                //新顾客人数
        $oldTotalPrice  = $oldSum+$shopoldSum+$tuanoldSum;                        //老顾客价格
        $oldUser        = $oldCount+$shopoldCount+$tuanoldCount;                //老顾客人数
        $totalPrice     = $newTotalPrice+$oldTotalPrice;                          //新老顾客价格
        $userid         = $newUser+$oldUser;                                       //新老顾客人数




        $array = array([
            'oldUser'       => $oldUser,                                            //老顾客人数
            'newUser'       => $newUser,                                            //新顾客人数
            'newTotalPrice' => sprintf("%.2f",$newTotalPrice),              //新顾客金额
            'oldTotalPrice' => sprintf("%.2f",$oldTotalPrice),              //老顾客金额
            'totalPrice'    => sprintf("%.2f",$totalPrice),                 //新老顾客价格
            'user'          => $userid,                                             //新老顾客人数
        ]);

           return  $array;

    }

}
