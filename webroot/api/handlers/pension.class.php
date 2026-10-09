<?php

if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 养老模块API接口
 *
 * @version        $Id: pension.class.php 2019-5-20 下午17:10:21 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class pension {
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
     * 养老信息基本参数
     * @return array
     */
	public function config(){

		require(HUONIAOINC."/config/pension.inc.php");

		global $cfg_fileUrl;              //系统附件默认地址
		global $cfg_uploadDir;            //系统附件默认上传目录
		// global $customFtp;                //是否自定义FTP
		// global $custom_ftpState;          //FTP是否开启
		// global $custom_ftpUrl;            //远程附件地址
		// global $custom_ftpDir;            //FTP上传目录
		// global $custom_uploadDir;         //默认上传目录
		global $cfg_basehost;             //系统主域名
		global $cfg_hotline;              //系统默认咨询热线

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
		global $hotline_config;           //咨询热线配置
		// global $customHotline;            //咨询热线
		// global $customTemplate;           //模板风格
		// global $custom_map;               //自定义地图
		// global $custom_hotel_atlasMax;    //酒店场地图集数量限制
		// global $custom_sy_atlasMax;       //摄影公司图集数量限制
		// global $custom_hq_atlasMax;       //婚庆公司图集数量限制
		// global $custom_sy_zp_atlasMax;    //摄影作品图集数量限制
		// global $custom_sy_al_atlasMax;    //摄影案例图集数量限制
		// global $custom_hq_zp_atlasMax;    //婚庆作品图集数量限制

		global $cfg_map;                  //系统默认地图

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

		if(empty($custom_map)) $custom_map = $cfg_map;

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

		// $domainInfo = getDomain('pension', 'config');
		// $customChannelDomain = $domainInfo['domain'];
		// if($customSubDomain == 0){
		// 	$customChannelDomain = "http://".$customChannelDomain;
		// }elseif($customSubDomain == 1){
		// 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
		// }elseif($customSubDomain == 2){
		// 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
		// }

		// include HUONIAOINC.'/siteModuleDomain.inc.php';
		$customChannelDomain = getDomainFullUrl('pension', $customSubDomain);

		//分站自定义配置
        $ser = 'pension';
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
						$customLogo = getAttachemntFile($customLogoUrl);
					}else{
						$customLogo = getAttachemntFile($cfg_weblogo);
					}

					$return['logoUrl'] = $customLogo;
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
				}elseif($param == "hotel_atlasMax"){
					$return['hotel_atlasMax'] = $custom_hotel_atlasMax;
				}elseif($param == "sy_atlasMax"){
					$return['sy_atlasMax'] = $custom_sy_atlasMax;
				}elseif($param == "hq_atlasMax"){
					$return['hq_atlasMax'] = $custom_hq_atlasMax;
				}elseif($param == "sy_zp_atlasMax"){
					$return['sy_zp_atlasMax'] = $custom_sy_zp_atlasMax;
				}elseif($param == "sy_al_atlasMax"){
					$return['sy_al_atlasMax'] = $custom_sy_al_atlasMax;
				}elseif($param == "hq_zp_atlasMax"){
					$return['hq_zp_atlasMax'] = $custom_hq_zp_atlasMax;
				}elseif($param == "template"){
					$return['template'] = $customTemplate;
				}elseif($param == "touchTemplate"){
					$return['touchTemplate'] = $customTouchTemplate;
				}elseif($param == "map"){
					$return['map'] = $custom_map;
				}elseif($param == "softSize"){
					$return['softSize'] = $custom_softSize;
				}elseif($param == "softType"){
					$return['softType'] = $custom_softType;
				}elseif($param == "thumbSize"){
					$return['thumbSize'] = $custom_thumbSize;
				}elseif($param == "thumbType"){
					$return['thumbType'] = $custom_thumbType;
				}
			}

		}else{

			//自定义LOGO
			if($customLogo == 1){
				$customLogo = getAttachemntFile($customLogoUrl);
			}else{
				$customLogo = getAttachemntFile($cfg_weblogo);
			}

			$return['channelName']   = str_replace('$city', $cityName, $customChannelName);
			$return['logoUrl']       = $customLogo;
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
			$return['map']           = $custom_map;
			$return['softSize']      = $custom_softSize;
			$return['softType']      = $custom_softType;
			$return['thumbSize']     = $custom_thumbSize;
			$return['thumbType']     = $custom_thumbType;
			$return['storeatlasMax'] = $custom_store_atlasMax;


		}

		return $return;

	}

	/**
     * 养老固定字段
     * @return array
     */
	public function pensionitem(){
		global $dsql;
		global $langData;
		$type = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['marry'][8][0]);//格式错误
			}else{
				$type     = (int)$this->param['type'];
				$value    = (int)$this->param['value'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
				$son      = $this->param['son'] == 0 ? false : true;
			}
		}
		$results = $dsql->getTypeList($type, "pension_item", $son, $page, $pageSize);
		$list = array();
		if($results){
			if($value){
				foreach ($results as $key => $value) {
					$list[$key]['id']    = $value['id'];
					$list[$key]['value'] = $value['typename'];
				}
				return $list;
			}else{
				return $results;
			}
		}
	}

	/**
     * 信息地区
     * @return array
     */
    public function addr(){
        global $dsql;
        global $langData;
        $type = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => $langData['travel'][12][23]);
            } else {
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }

        global $template;
        if ($template && $template != 'page' && empty($type)) {
			//数据共享
			require(HUONIAOINC."/config/pension.inc.php");
			$dataShare = (int)$customDataShare;

			if(!$dataShare){
	            $type = getCityId();
			}
        }

        //一级
        if (empty($type)) {
            //可操作的城市，多个以,分隔
            $userLogin    = new userLogin($dbo);
            $adminCityIds = $userLogin->getAdminCityIds();
            $adminCityIds = empty($adminCityIds) ? 0 : $adminCityIds;

            $cityArr = array();
            $sql     = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE c.`cid` in ($adminCityIds) ORDER BY c.`id`");
            $result  = $dsql->dsqlOper($sql, "results");
            if ($result) {
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

        } else {
            $results = $dsql->getTypeList($type, "site_area", $son, $page, $pageSize, '', '', true);
            if ($results) {
                return $results;
            }
        }
	}

	/**
	 * 商家列表
	 */
	public function storeList(){
		global $dsql;
		global $langData;
		$pageinfo = $list = array();
		$page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['travel'][12][13]);//格式错误
			}else{
				$search   = $this->param['search'];
				$addrid   = $this->param['addrid'];
				$orderby  = $this->param['orderby'];
				$rec      = (int)$this->param['rec'];
				$visitday = (int)$this->param['visitday'];
				$award    = (int)$this->param['award'];
				$catid    = (int)$this->param['catid'];
				$typeid   = (int)$this->param['typeid'];
				$roomtype = $this->param['roomtype'];
				$bednums  = $this->param['bednums'];
				$price    = $this->param['price'];
				$servicecontent = $this->param['servicecontent'];
				$tag      = (int)$this->param['tag'];
				$targetcare   = (int)$this->param['targetcare'];
				$max_longitude = $this->param['max_longitude'];
				$min_longitude = $this->param['min_longitude'];
				$max_latitude  = $this->param['max_latitude'];
				$min_latitude  = $this->param['min_latitude'];
				$lng      = $this->param['lng'];
				$lat      = $this->param['lat'];
				$u        = $this->param['u'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		$where = " AND `state` = 1";

		//数据共享
		require(HUONIAOINC."/config/pension.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
			$cityid = getCityId($this->param['cityid']);
			//遍历区域
	        if($cityid){
	            $where .= " AND `cityid` = '$cityid'";
			}
		}

		if($rec){
            $where .= " AND `rec` = '1'";
		}

		if($visitday){
            $where .= " AND `visitday` = '1'";
		}

		if($award){
            $where .= " AND `award` = '1'";
		}

		if($catid){
			$where .= " AND FIND_IN_SET('".$catid."', `catid`)";
		}

		if($typeid){
			$where .= " AND FIND_IN_SET('".$typeid."', `typeid`)";
		}

		if($targetcare){
			$where .= " AND FIND_IN_SET('".$targetcare."', `targetcare`)";
		}

		if($roomtype){
			$where .= " AND FIND_IN_SET('".$roomtype."', `roomtype`)";
		}

		if($servicecontent){
			$where .= " AND FIND_IN_SET('".$servicecontent."', `servicecontent`)";
		}

		if($tag){
			$where .= " AND FIND_IN_SET('".$tag."', `tag`)";
		}

		if($bednums != ""){
			$bednums = explode(",", $bednums);
			if(empty($bednums[0])){
				$where .= " AND `bednums` < " . $bednums[1];
			}elseif(empty($bednums[1])){
				$where .= " AND `bednums` > " . $bednums[0];
			}else{
				$where .= " AND `bednums` BETWEEN " . $bednums[0] . " AND " . $bednums[1];
			}
		}

		if($price != ""){
			$price = explode(",", $price);
			if(empty($price[0])){
				$where .= " AND `price` < " . $price[1];
			}elseif(empty($price[1])){
				$where .= " AND `price` > " . $price[0];
			}else{
				$where .= " AND `price` BETWEEN " . $price[0] . " AND " . $price[1];
			}
		}

		if(!empty($addrid)){
			if($dsql->getTypeList($addrid, "site_area")){
				global $arr_data;
				$arr_data = array();
				$lower = arr_foreach($dsql->getTypeList($addrid, "site_area"));
				$lower = $addrid.",".join(',',$lower);
			}else{
				$lower = $addrid;
			}
			$where .= " AND `addrid` in ($lower)";
		}

		if(!empty($search)){

			siteSearchLog("pension", $search);

			$sidArr = array();
	        $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__pension_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$search%' OR `store`.address like '%$search%'");
	        $results = $dsql->dsqlOper($userSql, "results");
	        foreach ($results as $key => $value) {
	            $sidArr[$key] = $value['id'];
	        }

	        if(!empty($sidArr)){
	            $where .= " AND (`title` like '%$search%' OR `address` like '%$search%' OR `userid` in (".join(",",$sidArr)."))";
	        }else{
	            $where .= " AND (`title` like '%$search%' OR `address` like '%$search%')";
	        }
		}

		//地图可视区域内
		if(!empty($max_longitude) && !empty($min_longitude) && !empty($max_latitude) && !empty($min_latitude)){
			$where .= " AND `lng` <= '".$max_longitude."' AND `lng` >= '".$min_longitude."' AND `lat` <= '".$max_latitude."' AND `lat` >= '".$min_latitude."'";
		}

		//查询距离
		if((!empty($lng))&&(!empty($lat))){
            $select="(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(".$lat."-`lat`)/360),2)+COS(3.1415926535898*".$lat."/180)* COS(`lat` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(".$lng."-`lng`)/360),2))))*1000 AS distance,";
        }else{
            $select="";
        }

		//排序
        switch ($orderby){
            case 1:
				$orderby_ = " ORDER BY `price`*12 DESC, `weight` DESC, `id` DESC";
                break;
            case 2:
				$orderby_ = " ORDER BY `price`*12 ASC, `weight` DESC, `id` DESC";
				break;
			case 3:
                $orderby_ = " ORDER BY `price` DESC, `weight` DESC, `id` DESC";
				break;
			case 4:
                $orderby_ = " ORDER BY `price` ASC, `weight` DESC, `id` DESC";
				break;
			case 5:
				$orderby_ = " ORDER BY `sco1` DESC, `weight` DESC, `id` DESC";
				break;
			case 6:
				$orderby_ = " ORDER BY `sco1` ASC, `weight` DESC, `id` DESC";
				break;
			//距离排序
			case 7:
				if((!empty($lng))&&(!empty($lat))){
					$orderby_ = " ORDER BY distance ASC";
				}
				break;
            default:
                $orderby_ = " ORDER BY `click` DESC, `pubdate` DESC, `weight` DESC, `id` DESC";
                break;
        }

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__pension_store` WHERE 1 = 1".$where);//print_R($arc);exit;
		//总条数
		$totalCount = getCache("pension_store_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$archives = $dsql->SetQuery("SELECT `title`, `pubdate`, `pics`, `price`, `tag`, `lat`, `lng`, `id`,`userid`, `address`, `tel`, `addrid`, ".$select." `flag`, `visitday`, `award`, `visitdaydesc`, `awarddesc`, `catid`, `rzprice`, `typeid`, `targetcare`, `explains`, `desc`, (SELECT avg(`sco1`)  FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'pension-store' AND `aid` = l.`id` AND `pid` = 0) AS sco1 FROM `#@__pension_store` l WHERE 1 = 1".$where);
		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$sql = $dsql->SetQuery($archives.$orderby_.$where);//print_R($sql);exit;
		$results = getCache("pension_store_list", $sql, 300, array("disabled" => $u));
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']        = $val['id'];
				$list[$key]['title']     = $val['title'];
				$list[$key]['address']   = $val['address'];
				$list[$key]['price']     = $val['price'];
				$list[$key]['yearprice'] = $val['price']*12;
				$list[$key]['tel']       = $val['tel'];
				$list[$key]['lng']       = $val['lng'];
				$list[$key]['lat']       = $val['lat'];
				$list[$key]['pubdate']   = $val['pubdate'];
				$list[$key]['pubdate1']   = $val['pubdate'] ? date("Y年m月d日", $val['pubdate']) : '';
				$list[$key]['flag']      = $val['flag'];
				$list[$key]['visitday']  = $val['visitday'];
				$list[$key]['award']     = $val['award'];
				$list[$key]['rzprice']     = $val['rzprice'];
				$list[$key]['visitdaydesc']     = $val['visitdaydesc'];
				$list[$key]['awarddesc']     = $val['awarddesc'];
				$list[$key]['explains']     = $val['explains'];
				$list[$key]['tag']       = $val['tag'];
				$list[$key]['distance']  = $val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22];  //距离   //千米  //米
				if(strpos($list[$key]['distance'],'千米')){
					$list[$key]['distance'] = str_replace("千米",'km',$list[$key]['distance']);
				}elseif(strpos($list[$key]['distance'],'米')){
					$list[$key]['distance'] = str_replace("米",'m',$list[$key]['distance']);
				}

				$sql                    = $dsql->SetQuery("SELECT avg(`sco1`) r, count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'pension-store' AND `aid` = " .$val['id'] . " AND `pid` = 0");
				$res                    = $dsql->dsqlOper($sql, "results");
				$comment                = $res[0]['c'];    //点评数量
				$sco1                   = $res[0]['r'];    //总评分
				$list[$key]['common']  = $comment;
				$list[$key]['sco1']    = number_format($sco1, 1);

				$list[$key]['desc']       = Html2Text(cn_substrR($val['desc'], 100));

				$catidArr  = array();
				$catidArr_ = $val['catid'] ? explode(',', $val['catid']) : array();
				if($catidArr_){
					foreach($catidArr_ as $k => $row){
						$catidname = $this->gettypename("catid_type", $row);
						$catidArr[$k] = array(
							"id" => $row,
							"val" => $catidname
						);
					}
				}
				$list[$key]["catidArr"]  = $catidArr;
				$list[$key]["catidArr_"] = $catidArr_;

				$tagArr  = array();
				if(!empty($val['tag'])){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__pension_item` WHERE `id` in ($val[tag]) ");
					$res = $dsql->dsqlOper($sql, "results");
					if(!empty($res)){
						foreach($res as $k => $v){
							$tagArr[] = $v['typename'];
						}
					}
				}
				$list[$key]["tagArr"]  = $tagArr;

				$typeidArr  = array();
				if(!empty($val['typeid'])){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__pension_item` WHERE `id` in ($val[typeid]) ");
					$res = $dsql->dsqlOper($sql, "results");
					if(!empty($res)){
						foreach($res as $k => $v){
							$typeidArr[] = $v['typename'];
						}
					}
				}
				$list[$key]["typeidArr"]  = $typeidArr;

				$targetcareArr  = array();
				if(!empty($val['targetcare'])){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__pension_item` WHERE `id` in ($val[targetcare]) ");
					$res = $dsql->dsqlOper($sql, "results");
					if(!empty($res)){
						foreach($res as $k => $v){
							$targetcareArr[] = $v['typename'];
						}
					}
				}
				$list[$key]["targetcareArr"]  = $targetcareArr;

				$pics = $val['pics'];
				if(!empty($pics)){
					$pics = explode(",", $pics);
				}
				$list[$key]['litpic'] = !empty($pics) ? getFilePath($pics[0]) : '';

				if(!empty($val['addrid'])){
					$addrName = getParentArr("site_area", $val['addrid']);
					global $data;
					$data = "";
					$addrArr = array_reverse(parent_foreach($addrName, "typename"));
					$addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
					$list[$key]['addrname']  = $addrArr;
				}else{
					$list[$key]['addrname'] = "";
				}

				$param = array(
					"service" => "pension",
					"template" => "store-detail",
					"id" => $val['id']
				);
				$url = getUrlPath($param);
				$list[$key]['url'] = $url;
			}
		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
	 * 区域机构统计
	 * @return array
	*/
	public function storeDistrict(){
		global $dsql;
		$price    = $this->param['price'];
		$keywords = $this->param['keywords'];
		$cityid   = (int)$this->param['cityid'];
		$addrid   = $this->param['addrid'];
		$catid    = $this->param['catid'];

		$where = '';

		if(empty($cityid)){
			$cityid = getCityId();
		}

		$data = array();

		//数据共享
		require(HUONIAOINC."/config/pension.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
			$cityid = getCityId($this->param['cityid']);
			if($cityid){
				// $where .= " AND `cityid` = ".$cityid;
			}
		}

		if($catid){
			$where .= " AND FIND_IN_SET('".$catid."', `catid`)";
		}

		if(!empty($addrid)){
			if($dsql->getTypeList($addrid, "site_area")){
				global $arr_data;
				$arr_data = array();
				$lower = arr_foreach($dsql->getTypeList($addrid, "site_area"));
				$lower = $addrid.",".join(',',$lower);
			}else{
				$lower = $addrid;
			}
			$where .= " AND `addrid` in ($lower)";
		}

		//价格区间
		if($price != ""){
			$price = explode(",", $price);
			if(empty($price[0])){
				$where .= " AND `price` < " . $price[1] * 1000;
			}elseif(empty($price[1])){
				$where .= " AND `price` > " . $price[0] * 1000;
			}else{
				$where .= " AND `price` BETWEEN " . $price[0] * 1000 . " AND " . $price[1] * 1000;
			}
		}

		//关键字
		if(!empty($keywords)){
			$where .= " AND (`title` like '%".$keywords."%' OR `address` like '%".$keywords."%')";
		}

		//所有一级区域
		$sql = $dsql->SetQuery("SELECT `id`, `typename`, `longitude`, `latitude` FROM `#@__site_area` WHERE `parentid` = $cityid ORDER BY `weight`");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$kk = 0;
			foreach ($ret as $key => $value) {

				$ids = array($value['id']);
				$addrSql = $dsql->SetQuery("SELECT `id` FROM `#@__site_area` WHERE `parentid` = ".$value['id']." ORDER BY `weight`");
				$addrRet = $dsql->dsqlOper($addrSql, "results");
				foreach ($addrRet as $k => $v) {
					array_push($ids, $v['id']);
				}

				$count = $price = 0;

				if($ids){
					$loupanSql = $dsql->SetQuery("SELECT COUNT(`id`) count, AVG(`price`) price FROM `#@__pension_store` WHERE `addrid` in (".join(",", $ids).")".$where);
					$loupanRet = $dsql->dsqlOper($loupanSql, "results");
					if($loupanRet){
						$count = $loupanRet[0]['count'];
						$price = sprintf("%.2f", $loupanRet[0]['price']);
					}
				}

				if($count > 0){
					$data[$kk]['id']        = $value['id'];
					$data[$kk]['addrname']  = $value['typename'];
					$data[$kk]['longitude'] = $value['longitude'];
					$data[$kk]['latitude']  = $value['latitude'];
					$data[$kk]['count']     = $count;
					$data[$kk]['price']     = $price;
					$kk++;
				}

			}
		}

		if($data){
			return $data;
		}else{
			return array("state" => 200, "info" => '暂无相关数据！');
		}

	}

	/**
     * 商家详细
     * @return array
     */
	public function storeDetail(){
		global $dsql;
		global $langData;
		global $userLogin;
		$storeDetail = array();
		$id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];
        $gettype     = is_numeric($this->param) ? 0 : $this->param['gettype'];
		$uid = $userLogin->getMemberID();

		if(!is_numeric($id) && $uid == -1){
			return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误
		}

        $where = '';
        if((int)$gettype == 0){

            $where = " AND `state` = 1";
        }
		if(!is_numeric($id)){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__pension_store` WHERE `userid` = ".$uid);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$id = $results[0]['id'];
				$where = "";
			}else{
				return array("state" => 200, "info" => $langData['travel'][12][24]);//该会员暂未开通公司
			}
		}

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `cityid`, `addrid`, `address`, `price`, `tag`, `visitday`, `visitdaydesc`, `typeid`,  `targetcare`, `roomtype`, `lng`, `lat`, `tel`, `pics`, `desc`, `catid`, `buildings`, `registration`, `landarea`, `builtuparea`, `rooms`, `peoplenums`, `ownedinstitutions`, `cooperativeinstitutions`, `diseases`, `careservices`, `lifeservice`, `foodsituation`, `othernotes`, `institutionadesc`, `longinstitutionadesc`, `shortinstitutionadesc`, `homecaredesc`, `homecareagedesc`, `residentialdesc`, `residentialagedesc`, `click`, `pubdate`, `weight`, `state`, `flag`, `award`, `awarddesc`, `explains`, `station`, `trans`, `roomarea`, `bednums`, `servicecontent`, `longexpenses`, `longbedfee`, `longotherfees`, `shortexpenses`, `shortbedfee`, `shortotherfees`, `homecyfw`, `homezlhl`, `homejzfw`, `homejsga`, `homejthd`, `hometlfw`, `residentialcard`, `residentialbedfee`, `residentialotherfees`, `rzprice`,`is_vipguanggao`, `refuse`  FROM `#@__pension_store` WHERE `id` = ".$id.$where);
		$results  = getCache("pension_store_detail", $archives, 0, $id);
		if($results){
			$storeDetail["id"]         = $results[0]['id'];
			$storeDetail['cityid']     = $results[0]['cityid'];
			$storeDetail['flag']       = $results[0]['flag'];
			$storeDetail["title"]      = $results[0]['title'];
			$storeDetail["userid"]     = $results[0]['userid'];
			$storeDetail["address"]    = $results[0]['address'];
			$storeDetail["lng"]        = $results[0]['lng'];
			$storeDetail["lat"]        = $results[0]['lat'];
			$storeDetail["rzprice"]    = $results[0]['rzprice'];
			if(!empty($results[0]['lng']) && !empty($results[0]['lat'])){
				$storeDetail["lnglat"] = $results[0]['lng'] . ',' . $results[0]['lat'];
			}
			$storeDetail["tel"]        = $results[0]['tel'];
			$storeDetail["click"]      = $results[0]['click'];
			$storeDetail["state"]      = $results[0]['state'];
			$storeDetail["refuse"]     = $results[0]['refuse'];
			$storeDetail["price"]      = $results[0]['price'];
			$storeDetail["station"]    = $results[0]['station'];
			$storeDetail["trans"]      = $results[0]['trans'];
			$storeDetail["explains"]   = $results[0]['explains'];
			$storeDetail["desc"]       = $results[0]['desc'];
			$storeDetail["visitday"]   = $results[0]['visitday'];
			$storeDetail["award"]      = $results[0]['award'];
			$storeDetail["visitdaydesc"]= $results[0]['visitdaydesc'];
			$storeDetail["awarddesc"]  = $results[0]['awarddesc'];
			$storeDetail["institutionadesc"]  = $results[0]['institutionadesc'];
			$storeDetail["longinstitutionadesc"]  = $results[0]['longinstitutionadesc'];
			$storeDetail["shortinstitutionadesc"]  = $results[0]['shortinstitutionadesc'];
			$storeDetail["homecaredesc"]  = $results[0]['homecaredesc'];
			$storeDetail["homecareagedesc"]  = $results[0]['homecareagedesc'];
			$storeDetail["residentialdesc"]  = $results[0]['residentialdesc'];
			$storeDetail["residentialagedesc"]  = $results[0]['residentialagedesc'];
			$storeDetail['registration1'] = $results[0]['registration'] ? date("Y年m月d日", $results[0]['registration']) : '';
			$storeDetail["registration"]  = $results[0]['registration'] ? date("Y-m-d", $results[0]['registration']) : '';
			$storeDetail["buildings"]     = $results[0]['buildings'];
			$storeDetail["landarea"]      = $results[0]['landarea'];
			$storeDetail["builtuparea"]   = $results[0]['builtuparea'];
			$storeDetail["roomarea"]      = $results[0]['roomarea'];
			$storeDetail["rooms"]         = $results[0]['rooms'];
			$storeDetail["bednums"]       = $results[0]['bednums'];
			$storeDetail["peoplenums"]    = $results[0]['peoplenums'];
			$storeDetail["ownedinstitutions"]  = $results[0]['ownedinstitutions'];
			$storeDetail["cooperativeinstitutions"]  = $results[0]['cooperativeinstitutions'];
			$storeDetail["diseases"]      = $results[0]['diseases'];
			$storeDetail["careservices"]  = $results[0]['careservices'];
			$storeDetail["lifeservice"]   = $results[0]['lifeservice'];
			$storeDetail["foodsituation"] = $results[0]['foodsituation'];
			$storeDetail["othernotes"]    = $results[0]['othernotes'];
			$storeDetail["is_vipguanggao"]    = $results[0]['is_vipguanggao'];
			$storeDetail['pubdate1']      = $results[0]['pubdate'] ? date("Y年m月d日", $results[0]['pubdate']) : '';

			$param = array(
				"service" => "pension",
				"template" => "store-detail",
				"id" => $id
			);
			$url = getUrlPath($param);
			$storeDetail['url'] = $url;

			//点评
			$sql                    = $dsql->SetQuery("SELECT avg(`sco1`) r, count(`id`) c FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'pension-store' AND `aid` = " . $id . " AND `pid` = 0");
			$res                    = $dsql->dsqlOper($sql, "results");
			$comment                = $res[0]['c'];    //点评数量
			$sco1                   = $res[0]['r'];    //总评分
			$storeDetail['common']  = $comment;
			$storeDetail['sco1']    = number_format($sco1, 1);

			$tagArr  = array();
			if(!empty($results[0]['tag'])){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__pension_item` WHERE `id` in (".$results[0]['tag'].") ");
				$res = $dsql->dsqlOper($sql, "results");
				if(!empty($res)){
					foreach($res as $k => $v){
						$tagArr[] = $v['typename'];
					}
				}
			}
			$storeDetail["tagArr"]  = $tagArr;

			$typeidArr  = array();
			if(!empty($results[0]['typeid'])){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__pension_item` WHERE `id` in (".$results[0]['typeid'].") ");
				$res = $dsql->dsqlOper($sql, "results");
				if(!empty($res)){
					foreach($res as $k => $v){
						$typeidArr[] = $v['typename'];
					}
				}
			}
			$storeDetail["typeidArr"]  = $typeidArr;

			$targetcareArr  = array();
			if(!empty($results[0]['targetcare'])){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__pension_item` WHERE `id` in (".$results[0]['targetcare'].") ");
				$res = $dsql->dsqlOper($sql, "results");
				if(!empty($res)){
					foreach($res as $k => $v){
						$targetcareArr[] = $v['typename'];
					}
				}
			}
			$storeDetail["targetcareArr"]  = $targetcareArr;

			$servicecontentArr  = array();
			if(!empty($results[0]['servicecontent'])){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__pension_item` WHERE `id` in (".$results[0]['servicecontent'].") ");
				$res = $dsql->dsqlOper($sql, "results");
				if(!empty($res)){
					foreach($res as $k => $v){
						$servicecontentArr[] = $v['typename'];
					}
				}
			}
			$storeDetail["servicecontentArr"]  = $servicecontentArr;

			$roomtypeArr  = array();
			if(!empty($results[0]['servicecontent'])){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__pension_item` WHERE `id` in (".$results[0]['roomtype'].") ");
				$res = $dsql->dsqlOper($sql, "results");
				if(!empty($res)){
					foreach($res as $k => $v){
						$roomtypeArr[] = $v['typename'];
					}
				}
			}
			$storeDetail["roomtypeArr"]  = $roomtypeArr;

			$storeDetail["typeid"]        = $results[0]['typeid'] ? explode(",", $results[0]['typeid']) : '';
			$storeDetail["servicecontent"]        = $results[0]['servicecontent'] ? explode(",", $results[0]['servicecontent']) : '';
			$storeDetail["targetcare"]        = $results[0]['targetcare'] ? explode(",", $results[0]['targetcare']) : '';
			$storeDetail["roomtype"]        = $results[0]['roomtype'] ? explode(",", $results[0]['roomtype']) : '';
			$storeDetail["typeid"]        = $results[0]['typeid'] ? explode(",", $results[0]['typeid']) : '';
			$storeDetail["tag"]        = $results[0]['tag'] ? explode(",", $results[0]['tag']) : '';
			$storeDetail["catid"]        = $results[0]['catid'] ? explode(",", $results[0]['catid']) : '';

			$longexpensesArr = array();
			if(!empty($results[0]['longexpenses'])){
				$longexpenseses = explode("|||", $results[0]['longexpenses']);
				foreach ($longexpenseses as $k => $v) {
					$tr = explode("$$$", $v);
					$longexpensesArr[$k][0] = $tr[0];
					$longexpensesArr[$k][1] = $tr[1];
					$longexpensesArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["longexpensesArr"]    = $longexpensesArr;

			$longbedfeeArr = array();
			if(!empty($results[0]['longbedfee'])){
				$longbedfees = explode("|||", $results[0]['longbedfee']);
				foreach ($longbedfees as $k => $v) {
					$tr = explode("$$$", $v);
					$longbedfeeArr[$k][0] = $tr[0];
					$longbedfeeArr[$k][1] = $tr[1];
					$longbedfeeArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["longbedfeeArr"]    = $longbedfeeArr;

			$longotherfeesArr = array();
			if(!empty($results[0]['longotherfees'])){
				$longotherfees = explode("|||", $results[0]['longotherfees']);
				foreach ($longotherfees as $k => $v) {
					$tr = explode("$$$", $v);
					$longotherfeesArr[$k][0] = $tr[0];
					$longotherfeesArr[$k][1] = $tr[1];
					$longotherfeesArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["longotherfeesArr"]    = $longotherfeesArr;

			$shortexpensesArr = array();
			if(!empty($results[0]['shortexpenses'])){
				$shortexpenses = explode("|||", $results[0]['shortexpenses']);
				foreach ($shortexpenses as $k => $v) {
					$tr = explode("$$$", $v);
					$shortexpensesArr[$k][0] = $tr[0];
					$shortexpensesArr[$k][1] = $tr[1];
					$shortexpensesArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["shortexpensesArr"]    = $shortexpensesArr;

			$shortbedfeeArr = array();
			if(!empty($results[0]['shortbedfee'])){
				$shortbedfee = explode("|||", $results[0]['shortbedfee']);
				foreach ($shortbedfee as $k => $v) {
					$tr = explode("$$$", $v);
					$shortbedfeeArr[$k][0] = $tr[0];
					$shortbedfeeArr[$k][1] = $tr[1];
					$shortbedfeeArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["shortbedfeeArr"]    = $shortbedfeeArr;

			$shortotherfeesArr = array();
			if(!empty($results[0]['shortotherfees'])){
				$shortotherfees = explode("|||", $results[0]['shortotherfees']);
				foreach ($shortotherfees as $k => $v) {
					$tr = explode("$$$", $v);
					$shortotherfeesArr[$k][0] = $tr[0];
					$shortotherfeesArr[$k][1] = $tr[1];
					$shortotherfeesArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["shortotherfeesArr"]    = $shortotherfeesArr;

			$homecyfwArr = array();
			if(!empty($results[0]['homecyfw'])){
				$homecyfw = explode("|||", $results[0]['homecyfw']);
				foreach ($homecyfw as $k => $v) {
					$tr = explode("$$$", $v);
					$homecyfwArr[$k][0] = $tr[0];
					$homecyfwArr[$k][1] = $tr[1];
					$homecyfwArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["homecyfwArr"]    = $homecyfwArr;

			$homezlhlArr = array();
			if(!empty($results[0]['homezlhl'])){
				$homezlhl = explode("|||", $results[0]['homezlhl']);
				foreach ($homezlhl as $k => $v) {
					$tr = explode("$$$", $v);
					$homezlhlArr[$k][0] = $tr[0];
					$homezlhlArr[$k][1] = $tr[1];
					$homezlhlArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["homezlhlArr"]    = $homezlhlArr;

			$homejzfwArr = array();
			if(!empty($results[0]['homejzfw'])){
				$homejzfw = explode("|||", $results[0]['homejzfw']);
				foreach ($homejzfw as $k => $v) {
					$tr = explode("$$$", $v);
					$homejzfwArr[$k][0] = $tr[0];
					$homejzfwArr[$k][1] = $tr[1];
					$homejzfwArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["homejzfwArr"]    = $homejzfwArr;

			$homejsgaArr = array();
			if(!empty($results[0]['homejsga'])){
				$homejsga = explode("|||", $results[0]['homejsga']);
				foreach ($homejsga as $k => $v) {
					$tr = explode("$$$", $v);
					$homejsgaArr[$k][0] = $tr[0];
					$homejsgaArr[$k][1] = $tr[1];
					$homejsgaArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["homejsgaArr"]    = $homejsgaArr;

			$homejthdArr = array();
			if(!empty($results[0]['homejthd'])){
				$homejthd = explode("|||", $results[0]['homejthd']);
				foreach ($homejthd as $k => $v) {
					$tr = explode("$$$", $v);
					$homejthdArr[$k][0] = $tr[0];
					$homejthdArr[$k][1] = $tr[1];
					$homejthdArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["homejthdArr"]    = $homejthdArr;

			$hometlfwArr = array();
			if(!empty($results[0]['hometlfw'])){
				$hometlfw = explode("|||", $results[0]['hometlfw']);
				foreach ($hometlfw as $k => $v) {
					$tr = explode("$$$", $v);
					$hometlfwArr[$k][0] = $tr[0];
					$hometlfwArr[$k][1] = $tr[1];
					$hometlfwArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["hometlfwArr"]    = $hometlfwArr;

			$residentialbedfeeArr = array();
			if(!empty($results[0]['residentialbedfee'])){
				$residentialbedfee = explode("|||", $results[0]['residentialbedfee']);
				foreach ($residentialbedfee as $k => $v) {
					$tr = explode("$$$", $v);
					$residentialbedfeeArr[$k][0] = $tr[0];
					$residentialbedfeeArr[$k][1] = $tr[1];
					$residentialbedfeeArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["residentialbedfeeArr"]    = $residentialbedfeeArr;

			$residentialcardArr = array();
			if(!empty($results[0]['residentialcard'])){
				$residentialcard = explode("|||", $results[0]['residentialcard']);
				foreach ($residentialcard as $k => $v) {
					$tr = explode("$$$", $v);
					$residentialcardArr[$k][0] = $tr[0];
					$residentialcardArr[$k][1] = $tr[1];
					$residentialcardArr[$k][2] = $tr[2];
				}
			}
			$storeDetail["residentialcardArr"]    = $residentialcardArr;

			$residentialotherfeesArr = array();
			if(!empty($results[0]['residentialotherfees'])){
				$residentialotherfees = explode("|||", $results[0]['residentialotherfees']);
				foreach ($residentialotherfees as $k => $v) {
					$tr = explode("$$$", $v);
					$residentialotherfeesArr[$k][0] = $tr[0];
					$residentialotherfeesArr[$k][1] = $tr[1];
					$residentialotherfeesArr[$k][2] = $tr[2];
					$residentialotherfeesArr[$k][3] = $tr[3];
					$residentialotherfeesArr[$k][4] = $tr[4];
					$residentialotherfeesArr[$k][5] = $tr[5];
				}
			}
			$storeDetail["residentialotherfeesArr"]    = $residentialotherfeesArr;

			//会员信息
			$uid = $results[0]['userid'];
			$storeDetail['member']     = getMemberDetail($uid);

			$storeDetail["addrid"]  = $addrid = $results[0]['addrid'];
            $archives = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = '$addrid'");
            $ret = $dsql->dsqlOper($archives, "results");
            if($ret){
				$storeDetail["circleAddrid"] = $ret[0]['parentid'];
            }
			$addrName = getParentArr("site_area", $results[0]['addrid']);
			global $data;
			$data = "";
			$addrArr = array_reverse(parent_foreach($addrName, "typename"));
			$addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
			$storeDetail['addrname']  = $addrArr;

			global $data;
			$data = "";
			$addrArr = array_reverse(parent_foreach($addrName, "id"));
			$storeDetail['city'] = count($addrArr) > 2 ? $addrArr[1] : $addrArr[0];
			$storeDetail["address"]    = $results[0]['address'];

			//验证是否已经收藏
			$collect = '';
			if($uid != -1){
				$params = array(
					"module" => "pension",
					"temp"   => "store-detail",
					"type"   => "add",
					"id"     => $results[0]['id'],
					"check"  => 1
				);
				$collect = checkIsCollect($params);
			}
			$storeDetail['collect'] = $collect == "has" ? 1 : 0;

			//图集
			$imglist = array();
			$pics = $results[0]['pics'];
			if(!empty($pics)){
				$pics = explode(",", $pics);
				foreach ($pics as $key => $value) {
					$imglist[$key]['path'] = getFilePath($value);
					$imglist[$key]['pathSource'] = $value;
				}
			}
			$storeDetail['pics'] = $imglist;
		}//print_R($storeDetail);exit;
		return $storeDetail;
	}

	/**
	* 配置商铺
	* @return array
	*/
	public function storeConfig(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid      = $userLogin->getMemberID();
		$param       = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$addrid      = (int)$param['addrid'];
		$cityid      = (int)$param['cityid'];
		$address     = $param['address'];
		$tel         = $param['tel'];
		$pics        = $param['pics'];
		$price       = (float)$param['price'];
		$station     = filterSensitiveWords(addslashes($param['station']));
		$trans       = filterSensitiveWords(addslashes($param['trans']));
		$typeid      = !empty($param['typeid']) ? join(",", $param['typeid']) : '';
		$servicecontent= !empty($param['servicecontent']) ? join(",", $param['servicecontent']) : '';
		$targetcare  = !empty($param['targetcare']) ? join(",", $param['targetcare']) : '';
		$roomtype    = !empty($param['roomtype']) ? join(",", $param['roomtype']) : '';
		$tag         = !empty($param['tag']) ? join(",", $param['tag']) : '';
		$catid       = !empty($param['catid']) ? join(",", $param['catid']) : '';
		$explains    = filterSensitiveWords(addslashes($param['explains']));
		$desc        = $param['desc'];
		$visitday    = !empty($param['visitday']) ? $param['visitday'] : 0;
		$flag        = !empty($param['flag']) ? $param['flag'] : 0;
		$award       = !empty($param['award']) ? $param['award'] : 0;
		$visitdaydesc= filterSensitiveWords(addslashes($param['visitdaydesc']));
		$awarddesc   = filterSensitiveWords(addslashes($param['awarddesc']));
		$institutionadesc    = filterSensitiveWords(addslashes($param['institutionadesc']));
		$longinstitutionadesc= filterSensitiveWords(addslashes($param['longinstitutionadesc']));
		$shortinstitutionadesc= filterSensitiveWords(addslashes($param['shortinstitutionadesc']));
		$homecaredesc    = filterSensitiveWords(addslashes($param['homecaredesc']));
		$homecareagedesc = filterSensitiveWords(addslashes($param['homecareagedesc']));
		$residentialdesc = filterSensitiveWords(addslashes($param['residentialdesc']));
		$residentialagedesc    = filterSensitiveWords(addslashes($param['residentialagedesc']));
		$longexpenses     = $param['longexpenses'];
		$longbedfee       = $param['longbedfee'];
		$longotherfees    = $param['longotherfees'];
		$shortexpenses    = $param['shortexpenses'];
		$shortbedfee      = $param['shortbedfee'];
		$shortotherfees   = $param['shortotherfees'];
		$homecyfw         = $param['homecyfw'];
		$homezlhl         = $param['homezlhl'];
		$homejzfw         = $param['homejzfw'];
		$homejsga         = $param['homejsga'];
		$homejthd         = $param['homejthd'];
		$hometlfw         = $param['hometlfw'];
		$residentialcard  = $param['residentialcard'];
		$residentialbedfee= $param['residentialbedfee'];
		$residentialotherfees= $param['residentialotherfees'];
		$registration     = GetMkTime($param['registration']);
		$buildings        = (int)$param['buildings'];
		$landarea         = $param['landarea'];
		$builtuparea      = $param['builtuparea'];
		$roomarea         = $param['roomarea'];
		$rooms            = (int)$param['rooms'];
		$bednums          = (int)$param['bednums'];
		$peoplenums       = (int)$param['peoplenums'];
		$ownedinstitutions    = filterSensitiveWords(addslashes($param['ownedinstitutions']));
		$cooperativeinstitutions    = filterSensitiveWords(addslashes($param['cooperativeinstitutions']));
		$diseases         = filterSensitiveWords(addslashes($param['diseases']));
		$careservices     = filterSensitiveWords(addslashes($param['careservices']));
		$lifeservice      = filterSensitiveWords(addslashes($param['lifeservice']));
		$foodsituation    = filterSensitiveWords(addslashes($param['foodsituation']));
		$othernotes       = filterSensitiveWords(addslashes($param['othernotes']));
		$lnglat           = $param['lnglat'];
		$rzprice          = $param['rzprice'];
		if(!empty($lnglat)){
			$lnglatArr = explode(',', $lnglat);
			$lng = $lnglatArr[0];
			$lat = $lnglatArr[1];
		}
		$pubdate = GetMkTime(time());

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录
		}

		//验证会员类型
		$userDetail = $userLogin->getMemberInfo();
		if($userDetail['userType'] != 2){
			return array("state" => 200, "info" => $langData['travel'][12][22]);//账号验证错误，操作失败
		}

		//权限验证
		if(!verifyModuleAuth(array("module" => "pension"))){
			return array("state" => 200, "info" => $langData['travel'][12][14]);//商家权限验证失败
		}

		if(empty($title)){
			return array("state" => 200, "info" => $langData['education'][5][40]);//请填写公司名称
		}

		if(empty($cityid)){
			return array("state" => 200, "info" => $langData['travel'][12][16]);//请选择所在地区
		}

		if(empty($tel)){
			return array("state" => 200, "info" => $langData['education'][5][45]);//请填写联系方式
		}

		if(empty($catid)){
			return array("state" => 200, "info" => '请选择类型');//请选择类型
		}

		if(empty($pics)){
			return array("state" => 200, "info" => $langData['travel'][12][18]);//请上传图集
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__pension_store` WHERE `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");

		//入驻审核开关
		include HUONIAOINC."/config/business.inc.php";
		$moduleJoinCheck = (int)$customModuleJoinCheck;
		$editModuleJoinCheck = (int)$customEditModuleJoinCheck;

		//新商铺
		if(!$userResult){
			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__pension_store` (`rzprice`, `title`, `userid`, `cityid`, `addrid`, `address`, `price`, `tag`, `visitday`, `visitdaydesc`, `typeid`,  `targetcare`, `roomtype`, `lng`, `lat`, `tel`, `pics`, `desc`, `catid`, `buildings`, `registration`, `landarea`, `builtuparea`, `rooms`, `peoplenums`, `ownedinstitutions`, `cooperativeinstitutions`, `diseases`, `careservices`, `lifeservice`, `foodsituation`, `othernotes`, `institutionadesc`, `longinstitutionadesc`, `shortinstitutionadesc`, `homecaredesc`, `homecareagedesc`, `residentialdesc`, `residentialagedesc`, `pubdate`, `state`, `flag`, `award`, `awarddesc`, `explains`, `station`, `trans`, `roomarea`, `bednums`, `servicecontent`, `longexpenses`, `longbedfee`, `longotherfees`, `shortexpenses`, `shortbedfee`, `shortotherfees`, `homecyfw`, `homezlhl`, `homejzfw`, `homejsga`, `homejthd`, `hometlfw`, `residentialcard`, `residentialbedfee`, `residentialotherfees`) VALUES ('$rzprice', '$title', '$userid', '$cityid', '$addrid', '$address', '$price', '$tag', '$visitday', '$visitdaydesc', '$typeid',  '$targetcare', '$roomtype', '$lng', '$lat', '$tel', '$pics', '$desc', '$catid', '$buildings', '$registration', '$landarea', '$builtuparea', '$rooms', '$peoplenums', '$ownedinstitutions', '$cooperativeinstitutions', '$diseases', '$careservices', '$lifeservice', '$foodsituation', '$othernotes', '$institutionadesc', '$longinstitutionadesc', '$shortinstitutionadesc', '$homecaredesc', '$homecareagedesc', '$residentialdesc', '$residentialagedesc', '$pubdate', '$moduleJoinCheck', '$flag', '$award', '$awarddesc', '$explains', '$station', '$trans', '$roomarea', '$bednums', '$servicecontent', '$longexpenses', '$longbedfee', '$longotherfees', '$shortexpenses', '$shortbedfee', '$shortotherfees', '$homecyfw', '$homezlhl', '$homejzfw', '$homejsga', '$homejthd', '$hometlfw', '$residentialcard', '$residentialbedfee', '$residentialotherfees')");
			$aid = $dsql->dsqlOper($archives, "lastid");
			if(is_numeric($aid)){

                $urlParam = array(
                    'service' => 'pension',
                    'template' => 'store-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
        
                //记录用户行为日志
                memberLog($userid, 'pension', 'store', $aid, 'insert', '开通店铺('.$title.')', $url, $archives);

				//后台消息通知
				updateAdminNotice("pension", "store");
				updateCache("pension_store_list", 300);
				clearCache("pension_store_total", 'key');
                dataAsync("pension",$aid,"store");  // 养老机构、新增


                return $langData['travel'][12][19];//配置成功，您的商铺正在审核中，请耐心等待！
			}else{
				return array("state" => 200, "info" => $langData['travel'][12][20]);//配置失败，请查检您输入的信息是否符合要求！
			}
		}else{
			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__pension_store` SET `rzprice` = '$rzprice', `title` = '$title', `userid` = '$userid', `cityid` = '$cityid', `addrid` = '$addrid', `address` = '$address', `price` = '$price', `tag` = '$tag', `visitday` = '$visitday', `visitdaydesc` = '$visitdaydesc', `typeid` = '$typeid',  `targetcare` = '$targetcare', `roomtype` = '$roomtype', `lng` = '$lng', `lat` = '$lat', `tel` = '$tel', `pics` = '$pics', `desc` = '$desc', `catid` = '$catid', `buildings` = '$buildings', `registration` = '$registration', `landarea` = '$landarea', `builtuparea` = '$builtuparea', `rooms` = '$rooms', `peoplenums` = '$peoplenums', `ownedinstitutions` = '$ownedinstitutions', `cooperativeinstitutions` = '$cooperativeinstitutions', `diseases` = '$diseases', `careservices` = '$careservices', `lifeservice` = '$lifeservice', `foodsituation` = '$foodsituation', `othernotes` = '$othernotes', `institutionadesc` = '$institutionadesc', `longinstitutionadesc` = '$longinstitutionadesc', `shortinstitutionadesc` = '$shortinstitutionadesc', `homecaredesc` = '$homecaredesc', `homecareagedesc` = '$homecareagedesc', `residentialdesc` = '$residentialdesc', `residentialagedesc` = '$residentialagedesc', `state` = '$editModuleJoinCheck', `flag` = '$flag', `award` = '$award', `awarddesc` = '$awarddesc', `explains` = '$explains', `station` = '$station', `trans` = '$trans', `roomarea` = '$roomarea', `bednums` = '$bednums', `servicecontent` = '$servicecontent', `longexpenses` = '$longexpenses', `longbedfee` = '$longbedfee', `longotherfees` = '$longotherfees', `shortexpenses` = '$shortexpenses', `shortbedfee` = '$shortbedfee', `shortotherfees` = '$shortotherfees', `homecyfw` = '$homecyfw', `homezlhl` = '$homezlhl', `homejzfw` = '$homejzfw', `homejsga` = '$homejsga', `homejthd` = '$homejthd', `hometlfw` = '$hometlfw', `residentialcard` = '$residentialcard', `residentialbedfee` = '$residentialbedfee', `residentialotherfees` = '$residentialotherfees' WHERE `userid` = ".$userid);
			$results = $dsql->dsqlOper($archives, "update");

			if($results == "ok"){

                $urlParam = array(
                    'service' => 'pension',
                    'template' => 'store-detail',
                    'id' => $userResult[0]['id']
                );
                $url = getUrlPath($urlParam);
        
                //记录用户行为日志
                memberLog($userid, 'pension', 'store', $userResult[0]['id'], 'update', '修改店铺('.$title.')', $url, $archives);

				// 检查缓存
				$id = $userResult[0]['id'];
				checkCache("pension_store_list", $id);
				clearCache("pension_store_total", 'key');
				clearCache("pension_store_detail", $id);
                dataAsync("pension",$id,"store");  // 养老机构、更新

				return $langData['travel'][12][21];//保存成功！
			}else{
				return array("state" => 200, "info" => $langData['travel'][12][20]);//配置失败，请查检您输入的信息是否符合要求！
			}
		}

	}

	/**
	 * 操作相册
	 * oper=add: 增加
	 * oper=del: 删除
	 * oper=update: 更新
	 * @return array
	 */
	public function operAlbums(){
		global $dsql;
		global $userLogin;
		global $langData;

		require(HUONIAOINC."/config/education.inc.php");
		$state = (int)$customeducationteacherCheck;

		$userid      = $userLogin->getMemberID();
		$userinfo    = $userLogin->getMemberInfo();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		$param           =  $this->param;
		$id              =  $param['id'];
		$oper            =  $param['oper'];

		$title           =  filterSensitiveWords(addslashes($param['title']));
		$litpic     	 =  $param['litpic'];
		$pubdate         =  GetMkTime(time());



		$userinfo = $userLogin->getMemberInfo();
		if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "pension"))){
			return array("state" => 200, "info" => $langData['travel'][12][27]);//商家权限验证失败！
		}

		$userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__pension_store` WHERE `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => $langData['education'][7][6]);//您还未开通教育公司！
		}

		if($userResult[0]['state'] == 0){
			return array("state" => 200, "info" => $langData['travel'][12][29]);//您的公司信息还在审核中，请通过审核后再发布！
		}

		if($userResult[0]['state'] == 2){
			return array("state" => 200, "info" => $langData['travel'][12][30]);//您的公司信息审核失败，请通过审核后再发布！
		}

		if($oper == 'add' || $oper == 'update'){
			if(empty($title))  return array("state" => 200, "info" => '请输入相册标题');//请输入相册标题
			if(empty($litpic))   return array("state" => 200, "info" => $langData['travel'][12][33]);//请上传图片
		}elseif($oper == 'del'){
			if(!is_numeric($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
		}

		$company = $userResult[0]['id'];

		if($oper == 'add'){
			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__pension_album` (`store`, `title`, `pubdate`, `litpic`) VALUES ('$company', '$title', '$pubdate', '$litpic')");
			$aid = $dsql->dsqlOper($archives, "lastid");
			if(is_numeric($aid)){
				if($state){
					updateCache("pension_album_list", 300);
				}

				clearCache("pension_album_total", 'key');

				//后台消息通知
				updateAdminNotice("pension", "album");
                dataAsync("pension",$aid,"album");  // 养老机构新增相册

				return $aid;
			}else{
				return array("state" => 101, "info" => $langData['travel']['12']['34']);//发布到数据时发生错误，请检查字段内容！
			}
		}elseif($oper == 'update'){
			$archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__pension_album` l LEFT JOIN `#@__pension_store` s ON s.`id` = l.`store` WHERE l.`id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__pension_album` SET `store` = '$company', `title` = '$title', `litpic` = '$litpic' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					return array("state" => 200, "info" => $langData['travel']['12']['34']); //保存到数据时发生错误，请检查字段内容！
				}
				updateAdminNotice("pension", "album");

				// 清除缓存
				clearCache("pension_album_detail", $id);
				checkCache("pension_album_list", $id);
				clearCache("pension_album_total", 'key');

                dataAsync("pension",$id,"album");  // 养老机构修改相册

				return $langData['travel'][12][35];//修改成功！
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}elseif($oper == 'del'){
			$archives = $dsql->SetQuery("SELECT l.`id`, l.`litpic`, s.`userid` FROM `#@__pension_album` l LEFT JOIN `#@__pension_store` s ON s.`id` = l.`store` WHERE l.`id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$results = $results[0];
				if($results['userid'] == $userid){
					//删除图集
					delPicFile($results['litpic'], "delThumb", "pension");
					// 清除缓存
					clearCache("pension_album_detail", $id);
					checkCache("pension_album_list", $id);
					clearCache("pension_album_total", 'key');

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__pension_album` WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");
                    dataAsync("pension",$id,"album");  // 养老机构删除相册
					return array("state" => 100, "info" => $langData['travel'][12][36]);//删除成功！
				}else{
					return array("state" => 101, "info" => $langData['travel'][12][37]);//权限不足，请确认帐户信息后再进行操作！
				}
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}

	}

	/**
	 * 相册列表
	 * @return array
	 */
	public function albumsList(){
		global $dsql;
		global $langData;
		global $userLogin;
		$pageinfo = $list = array();
		$page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
			}else{
				$store    = $this->param['store'];
				$u        = $this->param['u'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		$uid      = $userLogin->getMemberID();
		$userinfo = $userLogin->getMemberInfo();

		if($store){
			$where .= " AND `store` = '$store' ";
		}

		if($u==1){
			if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "pension"))){
				return array("state" => 200, "info" => $langData['travel'][12][14]);//商家权限验证失败
			}

			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__pension_store` WHERE `userid` = $uid");
			$storeRes = $dsql->dsqlOper($sql, "results");
			if($storeRes){
				$where .= " AND `store` = ".$storeRes[0]['id'];
			}else{
				$where .= " AND 1 = 2";
			}
		}

		$orderby_ = " ORDER BY `weight` DESC, `id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `pubdate`, `weight`  FROM `#@__pension_album` WHERE 1 = 1".$where);
		//总条数
		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__pension_album` WHERE 1 = 1".$where);
		//总条数
		$totalCount = getCache("pension_album_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$sql = $dsql->SetQuery($archives.$orderby_.$where);
		$results = getCache("pension_album_list", $sql, 300, array("disabled" => $u));
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']        = $val['id'];
				$list[$key]['title']     = $val['title'];
				$list[$key]['pubdate']   = $val['pubdate'];
				$list[$key]['litpic'] = $val['litpic'] ? getFilePath($val['litpic']) : '';

				$param = array(
					"service" => "pension",
					"template" => "album-detail",
					"id" => $val['id']
				);
				$url = getUrlPath($param);

				$list[$key]['url'] = $url;

				$lower = [];
				$param['id']    = $val['store'];
				$this->param    = $param;
				$store          = $this->storeDetail();
				if(!empty($store)){
					$lower = $store;
				}
				//$list[$key]['store'] = $lower;
			}

		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
     * 相册详细
     * @return array
     */
	public function albumsDetail(){
		global $dsql;
		global $langData;
		global $userLogin;
		$storeDetail = array();
		$id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];
		$uid = $userLogin->getMemberID();

		if(!is_numeric($id)){
			return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误
		}

		//$where = " AND `state` = 1";

		$archives = $dsql->SetQuery("SELECT `id`, `store`, `title`, `weight`, `pubdate`, `litpic` FROM `#@__pension_album` WHERE `id` = ".$id.$where);
		$results  = getCache("pension_album_detail", $archives, 0, $id);
		if($results){
			$storeDetail["id"]          = $results[0]['id'];
			$storeDetail["store"]        = $results[0]['store'];
			$storeDetail['title']      = $results[0]['title'];
			$storeDetail['weight']     = $results[0]['weight'];
			$storeDetail["pubdate"]     = $results[0]['pubdate'];
			$storeDetail["litpicSource"]       = $results[0]['litpic'];
			$storeDetail['litpic'] = $results[0]['litpic'] ? getFilePath($results[0]['litpic']) : '';
		}
		return $storeDetail;
	}

	/**
	 * 配置老人
	 * @return array
	 */
	public function elderlyConfig(){
		global $dsql;
		global $userLogin;
		global $langData;
        global $siteCityInfo;

		$userid      = $userLogin->getMemberID();
        $userinfo    = $userLogin->getMemberInfo();
		$param       = $this->param;

		require(HUONIAOINC."/config/pension.inc.php");
		$state = (int)$custompensionoldCheck;

		$elderlyname       = filterSensitiveWords(addslashes($param['elderlyname']));
		$sex               = (int)$param['sex'];
		$age               = (int)$param['age'];
		$photo             = $param['photo'];
		$accommodation     = (int)$param['accommodation'];
		$addrid            = (int)$param['addrid'];
		$cityid            = (int)$param['cityid'];
		$address           = $param['address'];
		$rzminprice        = (float)$param['rzminprice'];
		$rzmaxprice        = (float)$param['rzmaxprice'];
		$monthminprice     = (float)$param['monthminprice'];
		$monthmaxprice     = (float)$param['monthmaxprice'];
        $areaCode          = (int)$param['areaCode'];
        $areaCode          = $areaCode ? $areaCode : 86;
		$tel               = $param['tel'];
		$wx                = $param['wx'];
		$email             = $param['email'];
		$people            = $param['people'];
		$relationship      = $param['relationship'];
		$targetcare        = (int)$param['targetcare'];
		$catid             = (int)$param['catid'];
		$level             = filterSensitiveWords(addslashes($param['level']));
		$personalsituation = filterSensitiveWords(addslashes($param['personalsituation']));
		$situation         = filterSensitiveWords(addslashes($param['situation']));
		$desc              = filterSensitiveWords(addslashes($param['desc']));
		$lnglat            = $param['lnglat'];
		$switch            = (int)$param['switch'];
		if(!empty($lnglat)){
			$lnglatArr = explode(',', $lnglat);
			$lng = $lnglatArr[0];
			$lat = $lnglatArr[1];
		}
		$pubdate = GetMkTime(time());

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录
		}

		if(empty($elderlyname)){
			return array("state" => 200, "info" => '请填写老人姓名');//请填写老人姓名
		}

		if(empty($cityid)){
			return array("state" => 200, "info" => $langData['travel'][12][16]);//请选择所在地区
		}

		if(empty($people)){
			return array("state" => 200, "info" => '请填写联系人');//请填写联系人
		}

		if(empty($tel)){
			return array("state" => 200, "info" => $langData['education'][5][45]);//请填写联系方式
		}

		if(empty($photo)){
			return array("state" => 200, "info" => '请上传头像');//请上传头像
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__pension_elderly` WHERE `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		//新商铺
		if(!$userResult){
			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__pension_elderly` (`switch`, `wx`, `email`, `elderlyname`, `userid`, `photo`, `sex`, `age`, `cityid`, `addrid`, `address`, `lng`, `lat`, `areaCode`, `tel`, `catid`, `relationship`, `situation`, `personalsituation`, `level`, `accommodation`, `rzmaxprice`, `rzminprice`, `monthmaxprice`, `monthminprice`, `desc`, `people`, `targetcare`, `pubdate`, `state`) VALUES ('$switch', '$wx', '$email', '$elderlyname', '$userid', '$photo', '$sex', '$age', '$cityid', '$addrid', '$address', '$lng', '$lat', '$areaCode', '$tel', '$catid', '$relationship', '$situation', '$personalsituation', '$level', '$accommodation', '$rzmaxprice', '$rzminprice', '$monthmaxprice', '$monthminprice', '$desc', '$people', '$targetcare', '$pubdate', '$state')");
			$aid = $dsql->dsqlOper($archives, "lastid");
			if(is_numeric($aid)){

                $urlParam = array(
                    'service' => 'pension',
                    'template' => 'elderly-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
        
                //记录用户行为日志
                memberLog($userid, 'pension', 'elderly', $aid, 'insert', '添加老人('.$elderlyname.')', $url, $archives);

                autoShowUserModule($userid,'person');  // 养老机构配置老人
				//微信通知
	            $cityName = $siteCityInfo['name'];
	        	$cityid  = $siteCityInfo['cityid'];
		        $param = array(
		        	'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
		        	'cityid' => $cityid,
		            'notify' => '管理员消息通知',
		            'fields' =>array(
			            'contentrn'  => $cityName.'分站——养老模块——用户:'.$userinfo['username'].' 发布了老人信息: '.$elderlyname,
			            'date' => date("Y-m-d H:i:s", time()),
			        )
		        );

				//后台消息通知
				updateAdminNotice("pension", "elderly", $param);
				updateCache("pension_elderly_list", 300);
				clearCache("pension_elderly_total", 'key');

				return $langData['travel'][12][19];//配置成功，您的商铺正在审核中，请耐心等待！
			}else{
				return array("state" => 200, "info" => $langData['travel'][12][20]);//配置失败，请查检您输入的信息是否符合要求！
			}
		}else{
			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__pension_elderly` SET `switch` = '$switch', `wx` = '$wx', `email` = '$email', `elderlyname` = '$elderlyname', `userid` = '$userid', `photo` = '$photo', `sex` = '$sex', `age` = '$age', `cityid` = '$cityid', `addrid` = '$addrid', `address` = '$address', `lng` = '$lng', `lat` = '$lat', `areaCode` = '$areaCode', `tel` = '$tel', `catid` = '$catid', `relationship` = '$relationship', `situation` = '$situation', `personalsituation` = '$personalsituation', `level` = '$level', `accommodation` = '$accommodation', `rzmaxprice` = '$rzmaxprice', `rzminprice` = '$rzminprice', `monthmaxprice` = '$monthmaxprice', `monthminprice` = '$monthminprice', `desc` = '$desc', `people` = '$people', `targetcare` = '$targetcare', `state` = '$state' WHERE `userid` = ".$userid);
			$results = $dsql->dsqlOper($archives, "update");

			if($results == "ok"){

                $urlParam = array(
                    'service' => 'pension',
                    'template' => 'elderly-detail',
                    'id' => $userResult[0]['id']
                );
                $url = getUrlPath($urlParam);
        
                //记录用户行为日志
                memberLog($userid, 'pension', 'elderly', $userResult[0]['id'], 'update', '修改老人('.$elderlyname.')', $url, $archives);

				// 检查缓存
				$id = $userResult[0]['id'];
				checkCache("pension_elderly_list", $id);
				clearCache("pension_elderly_total", 'key');
				clearCache("pension_elderly_detail", $id);

				return $langData['travel'][12][21];//保存成功！
			}else{
				return array("state" => 200, "info" => $langData['travel'][12][20]);//配置失败，请查检您输入的信息是否符合要求！
			}
		}

	}

	/**
	 * 老人列表
	 * @return array
	 */
	public function elderlyList(){
		global $dsql;
		global $langData;
		global $userLogin;
		$pageinfo = $list = array();
		$page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
			}else{
				$search   = $this->param['search'];
				$state    = $this->param['state'];
				$u        = $this->param['u'];
				$noid	  = $this->param['noid'];
				$catid	  = $this->param['catid'];
				$addrid   = $this->param['addrid'];
				$orderby  = $this->param['orderby'];
				$rzmaxprice    = $this->param['rzmaxprice'];
				$targetcare    = $this->param['targetcare'];
				$monthmaxprice    = convertArrToStrWithComma(trim($this->param['monthmaxprice']), 1);
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		$uid      = $userLogin->getMemberID();
		$userinfo = $userLogin->getMemberInfo();

		if($noid){
			$where .= " AND `id` not in ($noid)";
		}

		//遍历分类
        if (!empty($catid)) {
            $where .= " AND `catid` = '$catid'";
        }

		if($u!=1){

			//数据共享
			require(HUONIAOINC."/config/pension.inc.php");
			$dataShare = (int)$customDataShare;

			if(!$dataShare){
				$cityid = getCityId($this->param['cityid']);
				$where .= " AND `switch` = 1 AND `state` = 1 AND `cityid` = '$cityid' ";
			}else{
				$where .= " AND `switch` = 1 AND `state` = 1 ";
			}


		}else{
			$where .= " AND `userid` = ".$uid;

			if($state!=''){
				$where .= " AND `state` = ".$state;
			}
		}

		if($targetcare){
			$where .= " AND FIND_IN_SET('".$targetcare."', `targetcare`)";
		}

		if(!empty($addrid)){
			if($dsql->getTypeList($addrid, "site_area")){
				global $arr_data;
				$arr_data = array();
				$lower = arr_foreach($dsql->getTypeList($addrid, "site_area"));
				$lower = $addrid.",".join(',',$lower);
			}else{
				$lower = $addrid;
			}
			$where .= " AND `addrid` in ($lower)";
		}

		//价格区间
		if($rzmaxprice != ""){
			$rzmaxprice = explode(",", $rzmaxprice);
			if(empty($rzmaxprice[0])){
				$where .= " AND `rzmaxprice` < " . $rzmaxprice[1];
			}elseif(empty($rzmaxprice[1])){
				$where .= " AND `rzmaxprice` > " . $rzmaxprice[0];
			}else{
				$where .= " AND `rzmaxprice` BETWEEN " . $rzmaxprice[0] . " AND " . $rzmaxprice[1];
			}
		}

		if($monthmaxprice != ""){
			$monthmaxprice = explode(",", $monthmaxprice);
			if(empty($monthmaxprice[0])){
				$where .= " AND `monthmaxprice` < " . $monthmaxprice[1];
			}elseif(empty($monthmaxprice[1])){
				$where .= " AND `monthmaxprice` > " . $monthmaxprice[0];
			}else{
				$where .= " AND `monthmaxprice` BETWEEN " . $monthmaxprice[0] . " AND " . $monthmaxprice[1];
			}
		}


		if(!empty($search)){
			siteSearchLog("pension", $search);
			$where .= " AND `elderlyname` like '%$search%'";
		}

		//排序
        switch ($orderby){
            case 1:
                $orderby_ = " ORDER BY `rzmaxprice` DESC, `weight` DESC, `id` DESC";
                break;
            case 2:
                $orderby_ = " ORDER BY `rzmaxprice` ASC, `weight` DESC, `id` DESC";
				break;
			case 3:
                $orderby_ = " ORDER BY `monthmaxprice` DESC, `weight` DESC, `id` DESC";
				break;
			case 4:
                $orderby_ = " ORDER BY `monthmaxprice` ASC, `weight` DESC, `id` DESC";
				break;
            default:
                $orderby_ = " ORDER BY `click` DESC, `pubdate` DESC, `weight` DESC, `id` DESC";
                break;
        }

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `elderlyname`, `switch`, `userid`, `photo`, `sex`, `age`, `cityid`, `addrid`, `address`, `lng`, `lat`, `areaCode`, `tel`, `catid`, `people`, `click`, `pubdate`, `state`, `targetcare`, `rzmaxprice`, `rzminprice`, `monthmaxprice`, `monthminprice` FROM `#@__pension_elderly` l WHERE 1 = 1".$where);
		//总条数
		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__pension_elderly` l WHERE 1 = 1".$where);
		//总条数
		$totalCount = getCache("pension_elderly_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		//会员列表需要统计信息状态
		if($u == 1 && $uid > -1){
			//待审核
			$totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
			//已审核
			$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");
			//拒绝审核
			$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

			$pageinfo['gray'] = $totalGray;
			$pageinfo['audit'] = $totalAudit;
			$pageinfo['refuse'] = $totalRefuse;
		}

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$sql = $dsql->SetQuery($archives.$orderby_.$where);
		$results = getCache("pension_elderly_list", $sql, 300, array("disabled" => $u));
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']          = $val['id'];
				$list[$key]['elderlyname'] = aesDecrypt($val['elderlyname']);
				$list[$key]['userid']      = $val['userid'];
				$list[$key]['sex']  	   = $val['sex'];
				$list[$key]['age']  	   = $val['age'];
				$list[$key]['cityid']      = $val['cityid'];
				$list[$key]['addrid']      = $val['addrid'];
				$list[$key]['address']     = aesDecrypt($val['address']);
				$list[$key]['lng']         = $val['lng'];
				$list[$key]['lat']         = $val['lat'];
				$list[$key]['areaCode']    = $val['areaCode'];
				$list[$key]['tel']         = aesDecrypt($val['tel']);
				$list[$key]['catid']       = $val['catid'];
				$list[$key]['click']       = $val['click'];
				$list[$key]['pubdate']     = $val['pubdate'];
				$list[$key]['state']       = $val['state'];
				$list[$key]['switch']      = $val['switch'];
				$list[$key]['rzmaxprice']       = $val['rzmaxprice'];
				$list[$key]['rzminprice']       = $val['rzminprice'];
				$list[$key]['monthmaxprice']       = $val['monthmaxprice'];
				$list[$key]['monthminprice']       = $val['monthminprice'];

				$targetcarename  = array();
				if(!empty($val['targetcare'])){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__pension_item` WHERE `id` in ($val[targetcare]) ");
					$res = $dsql->dsqlOper($sql, "results");
					if(!empty($res)){
						$targetcarename = $res[0]['typename'];
					}
				}
				$list[$key]["targetcarename"]  = $targetcarename;

				if($uid>1){
					$sql = $dsql->SetQuery("SELECT `id`, `invite` FROM `#@__pension_store` WHERE `userid` = '$uid'");
					$res = $dsql->dsqlOper($sql, "results");
					$list[$key]["storepower"]  = $res[0]['invite']==1 ? 1 : 0;
				}else{
					$list[$key]["storepower"]  = 0;
				}

				$list[$key]["catname"]     = $val['catid'] ? $this->gettypename("catid_type", $val['catid']) : '';

				if(!empty($val['addrid'])){
					$addrName = getParentArr("site_area", $val['addrid']);
					global $data;
					$data = "";
					$addrArr = array_reverse(parent_foreach($addrName, "typename"));
					$addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
					$list[$key]['addrname']  = $addrArr;
				}else{
					$list[$key]['addrname'] = "";
				}

				$list[$key]['photo'] = $val['photo'] ? getFilePath($val['photo']) : '';

				$param = array(
					"service" => "pension",
					"template" => "elderly-detail",
					"id" => $val['id']
				);
				$url = getUrlPath($param);

				$list[$key]['url'] = $url;

			}

		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
     * 老人详细
     * @return array
     */
	public function elderlyDetail(){
		global $dsql;
		global $langData;
		global $userLogin;
		$storeDetail = array();
		$id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];
		$uid = $userLogin->getMemberID();

		if(!is_numeric($id) && $uid == -1){
			return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误
		}

		//$where = " AND `state` = 1";
		if(!is_numeric($id)){
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__pension_elderly` WHERE `userid` = ".$uid);
			$res = $dsql->dsqlOper($sql, "results");
			$id  = $res[0]['id'];
		}
		if($id){
			$archives = $dsql->SetQuery("SELECT `id`, `switch`, `elderlyname`, `userid`, `photo`, `sex`, `age`, `cityid`, `addrid`, `address`, `lng`, `lat`, `areaCode`, `tel`, `catid`, `relationship`, `situation`, `personalsituation`, `level`, `accommodation`, `rzmaxprice`, `rzminprice`, `monthmaxprice`, `monthminprice`, `desc`, `people`, `targetcare`, `click`, `pubdate`, `state`, `wx`, `email` FROM `#@__pension_elderly` WHERE `id` = ".$id.$where);
			$results  = getCache("pension_elderly_detail", $archives, 0, $id);
			if(!empty($results)){
				$storeDetail["id"]                = $results[0]['id'];
				$storeDetail["elderlyname"]       = aesDecrypt($results[0]['elderlyname']);
				$storeDetail["switch"]            = $results[0]['switch'];
				$storeDetail['userid']            = $results[0]['userid'];
				$storeDetail["click"]             = $results[0]['click'];
				$storeDetail["pubdate"]           = $results[0]['pubdate'];
				$storeDetail["state"]             = $results[0]['state'];
				$storeDetail['addrid']            = $results[0]['addrid'];
				$storeDetail['sex']               = $results[0]['sex'];
				$storeDetail['areaCode']          = $results[0]['areaCode'];
				$storeDetail['tel']               = aesDecrypt($results[0]['tel']);
				$storeDetail['catid']             = $results[0]['catid'];
				$storeDetail['targetcare']        = $results[0]['targetcare'];
				$storeDetail["people"]            = $results[0]['people'];
				$storeDetail["desc"]              = $results[0]['desc'];
				$storeDetail["monthminprice"]     = $results[0]['monthminprice'];
				$storeDetail['monthmaxprice']     = $results[0]['monthmaxprice'];
				$storeDetail['rzminprice']        = $results[0]['rzminprice'];
				$storeDetail['rzmaxprice']        = $results[0]['rzmaxprice'];
				$storeDetail['accommodation']     = $results[0]['accommodation'];
				$storeDetail['level']             = $results[0]['level'];
				$storeDetail['personalsituation'] = $results[0]['personalsituation'];
				$storeDetail['situation']         = $results[0]['situation'];
				$storeDetail['relationship']      = $results[0]['relationship'];
				$storeDetail['lat']  			  = $results[0]['lat'];
				$storeDetail['lng']  			  = $results[0]['lng'];
				$storeDetail['sex']               = $results[0]['sex'];
				$storeDetail['age']               = $results[0]['age'];
				$storeDetail['address']           = aesDecrypt($results[0]['address']);
				$storeDetail['wx']                = $results[0]['wx'];
				$storeDetail['email']             = aesDecrypt($results[0]['email']);
				$storeDetail["photo"]             = $results[0]['photo'];
				$storeDetail['photoSource']       = $results[0]['photo'] ? getFilePath($results[0]['photo']) : '';

				$targetcarename  = '';
				if(!empty($results[0]['targetcare'])){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__pension_item` WHERE `id` = " .$results[0]['targetcare']);
					$res = $dsql->dsqlOper($sql, "results");
					if(!empty($res)){
						$targetcarename = $res[0]['typename'];
					}
				}
				$storeDetail["targetcarename"]  = $targetcarename;

				if($uid>1){
					$sql = $dsql->SetQuery("SELECT `id`, `invite` FROM `#@__pension_store` WHERE `userid` = '$uid'");
					$res = $dsql->dsqlOper($sql, "results");
					$storeDetail["storepower"]  = $res[0]['invite']==1 ? 1 : 0;
				}else{
					$storeDetail["storepower"]  = 0;
				}

				$storeDetail["catname"]     = $results[0]['catid'] ? $this->gettypename("catid_type", $results[0]['catid']) : '';
				$storeDetail["accommodationname"]     = $results[0]['accommodation'] ? $this->gettypename("accommodation_type", $results[0]['accommodation']) : '';

				if(!empty($results[0]['lng']) && !empty($results[0]['lat'])){
					$storeDetail["lnglat"] = $results[0]['lng'] . ',' . $results[0]['lat'];
				}

				if(!empty($results[0]['addrid'])){
					$addrName = getParentArr("site_area", $results[0]['addrid']);
					global $data;
					$data = "";
					$addrArr = array_reverse(parent_foreach($addrName, "typename"));
					$addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
					$storeDetail['addrname']  = $addrArr;
				}else{
					$storeDetail['addrname'] = "";
				}

				//验证是否已经收藏
				$params = array(
					"module" => "pension",
					"temp"   => "elderly-detail",
					"type"   => "add",
					"id"     => $results[0]['id'],
					"check"  => 1
				);
				$collect = checkIsCollect($params);
				$storeDetail['collect'] = $collect == "has" ? 1 : 0;

			}
		}
		return $storeDetail;
	}

	/**
	 * 养老机构预约
	 * oper=add: 增加
	 * oper=del: 删除
	 * oper=update: 更新
	 * @return array
	 */
	public function booking(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid      = $userLogin->getMemberID();

		$param       =  $this->param;
		$id          =  $param['id'];
		$oper        =  $param['oper'];
		$store       =  (int)$param['store'];
		$people      =  filterSensitiveWords(addslashes($param['people']));
		$areaCode     	 =  $param['areaCode'];
		$tel     	 =  $param['tel'];
		$pubdate     =  GetMkTime(time());

		//手机号码增加区号，国内版不显示
		$tel = ($areaCode == '86' ? '' : $areaCode) . $tel;

		if($oper == 'add'){
			if(empty($store))  return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
			if(empty($people))  return array("state" => 200, "info" => $langData['education'][6][32]);//请输入姓名
			if(empty($tel)) return array("state" => 200, "info" => $langData['education'][6][24]);//请输入手机号
		}elseif($oper == 'del' || $oper == 'update'){
			if(!is_numeric($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
		}

		if($oper == 'add'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__pension_yuyue` WHERE `store` = '$store' AND `tel` = " . $tel);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				return array("state" => 200, "info" => '您已预约此机构！');//您已预约此机构！
			}

			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__pension_yuyue` (`store`, `people`, `tel`,  `state`, `userid`, `pubdate`) VALUES ('$store', '$people', '$tel', '0', '$userid', '$pubdate')");
			$aid = $dsql->dsqlOper($archives, "lastid");
			if(is_numeric($aid)){
				updateCache("pension_yuyue_list", 300);
				clearCache("pension_yuyue_total", 'key');
				//后台消息通知
				updateAdminNotice("pension", "yuyue");
				return $langData['education'][7][35];//请等候联系！
			}else{
				return array("state" => 101, "info" => $langData['travel']['12']['34']);//发布到数据时发生错误，请检查字段内容！
			}
		}elseif($oper == 'update'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__pension_yuyue` WHERE `id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__pension_yuyue` SET `state` = '1' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					return array("state" => 200, "info" => $langData['travel']['12']['34']); //保存到数据时发生错误，请检查字段内容！
				}
				updateAdminNotice("pension", "yuyue");

				// 清除缓存
				clearCache("pension_yuyue_detail", $id);
				checkCache("pension_yuyue_list", $id);
				clearCache("pension_yuyue_total", 'key');

				return $langData['travel'][12][35];//修改成功！
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}elseif($oper == 'del'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__pension_yuyue` WHERE `id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$results = $results[0];
				// 清除缓存
				clearCache("pension_yuyue_detail", $id);
				checkCache("pension_yuyue_list", $id);
				clearCache("pension_yuyue_total", 'key');

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__pension_yuyue` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");

				return array("state" => 100, "info" => $langData['travel'][12][36]);//删除成功！
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}
	}

	/**
	 * 机构预约列表
	 * @return array
	 */
	public function bookingList(){
		global $dsql;
		global $langData;
		global $userLogin;
		$pageinfo = $list = array();
		$page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
			}else{
				$state    = $this->param['state'];
				$u        = $this->param['u'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		$uid      = $userLogin->getMemberID();

		if($u==1){
			$sql      = $dsql->SetQuery("SELECT `id` FROM `#@__pension_store` WHERE `userid` = $uid");
			$storeRes = $dsql->dsqlOper($sql, "results");
			if(empty($storeRes[0]['id'])){
				return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！
			}else{
				$where = ' AND `store` = ' . $storeRes[0]['id'];
			}
		}elseif($u==2){
			$where = ' AND `userid` = ' . $uid;
		}

		$orderby_ = " ORDER BY `pubdate` DESC, `state` DESC, `id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `people`, `store`, `pubdate`, `state`, `userid`, `tel` FROM `#@__pension_yuyue` l WHERE 1 = 1".$where);
		//总条数
		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__pension_yuyue` l WHERE 1 = 1".$where);
		//总条数
		$totalCount = getCache("pension_yuyue_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		//会员列表需要统计信息状态
		if($u == 1 && $uid > -1){
			//待审核
			$totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
			//已审核
			$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");
			//拒绝审核
			$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

			$pageinfo['gray'] = $totalGray;
			$pageinfo['audit'] = $totalAudit;
			$pageinfo['refuse'] = $totalRefuse;
		}

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$sql = $dsql->SetQuery($archives.$orderby_.$where);
		$results = getCache("pension_yuyue_list", $sql, 300, array("disabled" => $u));
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']        = $val['id'];
				$list[$key]['store']     = $val['store'];
				$list[$key]['people']    = $val['people'];
				$list[$key]['pubdate']   = $val['pubdate'];
				$list[$key]['state']     = $val['state'];
				$list[$key]['userid']    = $val['userid'];
				$list[$key]['tel']       = $val['tel'];

				if($val['store']){
					$sql = $dsql->SetQuery("SELECT `id`, `title`, `tel` FROM `#@__pension_store` WHERE `id` = " . $val['store']);
					$res = $dsql->dsqlOper($sql, "results");
					$list[$key]['title']      = $res[0]['title'];
					$list[$key]['storetel']   = $res[0]['tel'];
					$list[$key]['storeaid']   = $res[0]['id'];
				}
			}

		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
	 * 养老机构入驻
	 * oper=add: 增加
	 * oper=del: 删除
	 * oper=update: 更新
	 * @return array
	 */
	public function award(){
		global $dsql;
		global $userLogin;
		global $langData;
		global $cfg_pointPension;

		$userid      = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		$param       =  $this->param;
		$id          =  $param['id'];
		$oper        =  $param['oper'];
		$store       =  (int)$param['store'];
		$catid       =  (int)$param['catid'];
		$pubdate     =  GetMkTime(time());

        $name = '';
		$sql = $dsql->SetQuery("SELECT `id`, `elderlyname` FROM `#@__pension_elderly` WHERE `userid` = '$userid'");
		$res = $dsql->dsqlOper($sql, "results");
		if(empty($res))  return array("state" => 200, "info" => "请先入驻老人信息！");//请先入驻老人信息！
		$elderly = $res[0]['id'];
        $name = $res[0]['elderlyname'];
		$elderlyname = '养老积分获取：' . $res[0]['elderlyname'];

		if($oper == 'add'){
			if(empty($store))  return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
		}elseif($oper == 'del' || $oper == 'update'){
			if(!is_numeric($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
		}

		if($oper == 'add'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__pension_settledin` WHERE `store` = '$store' AND `elderly` = " . $elderly);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				return array("state" => 200, "info" => '您已入驻此机构！');//您已入驻此机构！
			}

			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__pension_settledin` (`catid`, `store`, `elderly`, `state`, `userid`, `pubdate`) VALUES ('$catid', '$store', '$elderly', '0', '$userid', '$pubdate')");
			$aid = $dsql->dsqlOper($archives, "lastid");
			if(is_numeric($aid)){
        
                //记录用户行为日志
                memberLog($userid, 'pension', 'settledin', $aid, 'insert', '入驻申请('.$name.')', '', $archives);


				$now = time();
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + $cfg_pointPension WHERE `id` = $userid");
                $res = $dsql->dsqlOper($archives, "update");
                if($res == "ok"){
                    $user  = $userLogin->getMemberInfo($userid);
                    $userpoint = $user['point'];
//                    $pointuser  = (int)($userpoint+$cfg_pointPension);
                    //保存操作日志
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$cfg_pointPension', '$elderlyname', '$now','zengsong','$userpoint')");
                    $dsql->dsqlOper($archives, "update");
                }

				updateCache("pension_settledin_list", 300);
				clearCache("pension_settledin_total", 'key');
				//后台消息通知
				updateAdminNotice("pension", "settledin");
				return $langData['education'][7][35];//请等候联系！
			}else{
				return array("state" => 101, "info" => $langData['travel']['12']['34']);//发布到数据时发生错误，请检查字段内容！
			}
		}elseif($oper == 'update'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__pension_settledin` WHERE `id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__pension_settledin` SET `state` = '1' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					return array("state" => 200, "info" => $langData['travel']['12']['34']); //保存到数据时发生错误，请检查字段内容！
				}
				updateAdminNotice("pension", "settledin");

				// 清除缓存
				clearCache("pension_settledin_detail", $id);
				checkCache("pension_settledin_list", $id);
				clearCache("pension_settledin_total", 'key');

				return $langData['travel'][12][35];//修改成功！
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}elseif($oper == 'del'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__pension_settledin` WHERE `id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$results = $results[0];
				// 清除缓存
				clearCache("pension_settledin_detail", $id);
				checkCache("pension_settledin_list", $id);
				clearCache("pension_settledin_total", 'key');

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__pension_settledin` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");

				return array("state" => 100, "info" => $langData['travel'][12][36]);//删除成功！
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}
	}

	/**
	 * 机构入驻列表
	 * @return array
	 */
	public function awardList(){
		global $dsql;
		global $langData;
		global $userLogin;
		$pageinfo = $list = array();
		$page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
			}else{
				$state    = $this->param['state'];
				$u        = $this->param['u'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		$uid      = $userLogin->getMemberID();

		if($u==1){
			$userinfo = $userLogin->getMemberInfo();
			if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "pension"))){
				return array("state" => 200, "info" => $langData['travel'][12][27]);//商家权限验证失败！
			}

			if($userinfo['userType'] == 2){
				$sql      = $dsql->SetQuery("SELECT `id` FROM `#@__pension_store` WHERE `userid` = $uid");
				$storeRes = $dsql->dsqlOper($sql, "results");
				if(empty($storeRes[0]['id'])){
					return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！
				}else{
					$where = ' AND `store` = ' . $storeRes[0]['id'];
				}
			}
		}elseif($u==2){
			$where = ' AND `userid` = ' . $uid;
		}

		$orderby_ = " ORDER BY `pubdate` DESC, `state` DESC, `id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `store`, `elderly`, `catid`, `pubdate`, `state`, `userid` FROM `#@__pension_settledin` l WHERE 1 = 1".$where);
		//总条数
		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__pension_settledin` l WHERE 1 = 1".$where);
		//总条数
		$totalCount = getCache("pension_settledin_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		//会员列表需要统计信息状态
		if($u == 1 && $uid > -1){
			//待审核
			$totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
			//已审核
			$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");
			//拒绝审核
			$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

			$pageinfo['gray'] = $totalGray;
			$pageinfo['audit'] = $totalAudit;
			$pageinfo['refuse'] = $totalRefuse;
		}

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$sql = $dsql->SetQuery($archives.$orderby_.$where);
		$results = getCache("pension_settledin_list", $sql, 300, array("disabled" => $u));
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']        = $val['id'];
				$list[$key]['store']     = $val['store'];
				$list[$key]['elderly']   = $val['elderly'];
				if(!empty($val['elderly'])){
					$sql = $dsql->SetQuery("SELECT `id`, `elderlyname`, `people`, `tel` FROM `#@__pension_elderly` WHERE `id` = " . $val['elderly']);
					$res = $dsql->dsqlOper($sql, "results");
					$list[$key]['elderlyname']   = $res[0]['elderlyname'];
					$list[$key]['people']   = $res[0]['people'];
					$list[$key]['tel']   = $res[0]['tel'];
					$list[$key]['elderlyid']   = $res[0]['id'];
				}
				if(!empty($val['store'])){
					$sql = $dsql->SetQuery("SELECT `id`, `title`, `tel` FROM `#@__pension_store` WHERE `id` = " . $val['store']);
					$res = $dsql->dsqlOper($sql, "results");
					$list[$key]['title'] = $res[0]['title'];
					$list[$key]['storetel']   = $res[0]['tel'];
					$list[$key]['storeaid']   = $res[0]['id'];
				}
				$list[$key]["catname"]   = $val['catid'] ? $this->gettypename("catid_type", $val['catid']) : '';
				$list[$key]['pubdate']   = $val['pubdate'];
				$list[$key]['state']     = $val['state'];
				$list[$key]['userid']    = $val['userid'];
			}

		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
	 * 养老机构邀请
	 * oper=add: 增加
	 * oper=del: 删除
	 * oper=update: 更新
	 * @return array
	 */
	public function invitation(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid      = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		$param       =  $this->param;
		$id          =  $param['id'];
		$oper        =  $param['oper'];
		$elderly     =  (int)$param['elderly'];
		$people      =  $param['people'];
		$tel         =  $param['tel'];
		$pubdate     =  GetMkTime(time());

		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__pension_store` WHERE `userid` = '$userid'");
		$res = $dsql->dsqlOper($sql, "results");
		if(empty($res))  return array("state" => 200, "info" => "很抱歉，您暂时还没有此权限");//请先入驻养老机构！
		$store = $res[0]['id'];

		if($oper == 'add'){
			if(empty($elderly))  return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
			if(empty($people))  return array("state" => 200, "info" => $langData['education'][6][32]);//请输入姓名
			if(empty($tel)) return array("state" => 200, "info" => $langData['education'][6][24]);//请输入手机号
		}elseif($oper == 'del' || $oper == 'update'){
			if(!is_numeric($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
		}

		if($oper == 'add'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__pension_invitation` WHERE `store` = '$store' AND `elderly` = " . $elderly);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				return array("state" => 200, "info" => '您已邀请此老人！');//您已邀请此老人！
			}

			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__pension_invitation` (`tel`, `people`, `store`, `elderly`, `state`, `userid`, `pubdate`) VALUES ('$tel', '$people', '$store', '$elderly', '0', '$userid', '$pubdate')");
			$aid = $dsql->dsqlOper($archives, "lastid");
			if(is_numeric($aid)){
				updateCache("pension_invitation_list", 300);
				clearCache("pension_invitation_total", 'key');
				//后台消息通知
				updateAdminNotice("pension", "invitation");
				return $langData['education'][7][35];//请等候联系！
			}else{
				return array("state" => 101, "info" => $langData['travel']['12']['34']);//发布到数据时发生错误，请检查字段内容！
			}
		}elseif($oper == 'update'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__pension_invitation` WHERE `id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__pension_invitation` SET `state` = '1' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					return array("state" => 200, "info" => $langData['travel']['12']['34']); //保存到数据时发生错误，请检查字段内容！
				}
				updateAdminNotice("pension", "invitation");

				// 清除缓存
				clearCache("pension_invitation_detail", $id);
				checkCache("pension_invitation_list", $id);
				clearCache("pension_invitation_total", 'key');

				return $langData['travel'][12][35];//修改成功！
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}elseif($oper == 'del'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__pension_invitation` WHERE `id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$results = $results[0];
				// 清除缓存
				clearCache("pension_invitation_detail", $id);
				checkCache("pension_invitation_list", $id);
				clearCache("pension_invitation_total", 'key');

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__pension_invitation` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");

				return array("state" => 100, "info" => $langData['travel'][12][36]);//删除成功！
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}
	}

	/**
	 * 机构入驻邀请列表
	 * @return array
	 */
	public function invitationList(){
		global $dsql;
		global $langData;
		global $userLogin;
		$pageinfo = $list = array();
		$page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
			}else{
				$state    = $this->param['state'];
				$u        = $this->param['u'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		$uid      = $userLogin->getMemberID();

		if($u==1){
			$userinfo = $userLogin->getMemberInfo();
			if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "pension"))){
				return array("state" => 200, "info" => $langData['travel'][12][27]);//商家权限验证失败！
			}

			if($userinfo['userType'] == 2){
				$sql      = $dsql->SetQuery("SELECT `id` FROM `#@__pension_store` WHERE `userid` = $uid");
				$storeRes = $dsql->dsqlOper($sql, "results");
				if(empty($storeRes[0]['id'])){
					return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！
				}else{
					$where = ' AND `store` = ' . $storeRes[0]['id'];
				}
			}
		}elseif($u=2){
			$sql      = $dsql->SetQuery("SELECT `id` FROM `#@__pension_elderly` WHERE `userid` = $uid");
			$storeRes = $dsql->dsqlOper($sql, "results");
			if(empty($storeRes[0]['id'])){
				return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！
			}else{
				$where = ' AND `elderly` = ' . $storeRes[0]['id'];
			}
		}
		$orderby_ = " ORDER BY `pubdate` DESC, `state` DESC, `id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `store`, `elderly`,  `people`,  `tel`, `pubdate`, `state`, `userid` FROM `#@__pension_invitation` l WHERE 1 = 1".$where);
		//总条数
		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__pension_invitation` l WHERE 1 = 1".$where);
		//总条数
		$totalCount = getCache("pension_invitation_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		//会员列表需要统计信息状态
		if($u == 1 && $uid > -1){
			//待审核
			$totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
			//已审核
			$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");
			//拒绝审核
			$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

			$pageinfo['gray'] = $totalGray;
			$pageinfo['audit'] = $totalAudit;
			$pageinfo['refuse'] = $totalRefuse;
		}

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$sql = $dsql->SetQuery($archives.$orderby_.$where);
		$results = getCache("pension_invitation_list", $sql, 300, array("disabled" => $u));
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']        = $val['id'];
				$list[$key]['store']     = $val['store'];
				$list[$key]['elderly']   = $val['elderly'];
				$list[$key]['people']    = $val['people'];
				$list[$key]['tel']       = $val['tel'];

				if(!empty($val['elderly'])){
					$sql = $dsql->SetQuery("SELECT `id`, `elderlyname`, `people`, `tel` FROM `#@__pension_elderly` WHERE `id` = " . $val['elderly']);
					$res = $dsql->dsqlOper($sql, "results");
					$list[$key]['elderlyname']   = $res[0]['elderlyname'];
					$list[$key]['elderlypeople']   = $res[0]['people'];
					$list[$key]['elderlyid']   = $res[0]['id'];
				}
				if(!empty($val['store'])){
					$sql = $dsql->SetQuery("SELECT `id`, `title`, `tel` FROM `#@__pension_store` WHERE `id` = " . $val['store']);
					$res = $dsql->dsqlOper($sql, "results");
					$list[$key]['title'] = $res[0]['title'];
					$list[$key]['storetel']   = $res[0]['tel'];
					$list[$key]['storeaid']   = $res[0]['id'];
				}
				$list[$key]['pubdate']   = $val['pubdate'];
				$list[$key]['state']     = $val['state'];
				$list[$key]['userid']    = $val['userid'];
			}

		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
	 * 费用方式
	 */
	public function catid_type(){
		global $langData;
		$value    = $this->param['value'];
		$typeList = array();
		if($value){
			$typeList[] = array('id' => 1, 'value' => '机构养老', 'lower' => array());
			$typeList[] = array('id' => 2, 'value' => '居家养老', 'lower' => array());
			$typeList[] = array('id' => 3, 'value' => '旅居养老', 'lower' => array());
		}else{
			$typeList[] = array('id' => 1, 'typename' => '机构养老', 'lower' => array());
			$typeList[] = array('id' => 2, 'typename' => '居家养老', 'lower' => array());
			$typeList[] = array('id' => 3, 'typename' => '旅居养老', 'lower' => array());
		}

        return $typeList;
	}

	/**
	 * 入住形式
	 */
	public function accommodation_type(){
		global $langData;
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '长住', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '短住', 'lower' => array());
        return $typeList;
	}

	public function gettypename($fun, $id){
        $list = $this->$fun();
        return $list[array_search($id, array_column($list, "id"))]['typename'];
    }


}
