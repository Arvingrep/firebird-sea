<?php

if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 教育模块API接口
 *
 * @version        $Id: education.class.php 2019-5-20 下午17:10:21 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class education {
	private $param;  //参数

	/**
     * 构造函数
	 *
     * @param string $action 动作名
     * @param string $action 动作名
     */
    public function __construct($param = array()){
		$this->param = $param;
	}

	/**
     * 教育信息基本参数
     * @return array
     */
	public function config(){

		require(HUONIAOINC."/config/education.inc.php");

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

		// $domainInfo = getDomain('education', 'config');
		// $customChannelDomain = $domainInfo['domain'];
		// if($customSubDomain == 0){
		// 	$customChannelDomain = "http://".$customChannelDomain;
		// }elseif($customSubDomain == 1){
		// 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
		// }elseif($customSubDomain == 2){
		// 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
		// }

		// include HUONIAOINC.'/siteModuleDomain.inc.php';
		$customChannelDomain = getDomainFullUrl('education', $customSubDomain);

		//分站自定义配置
        $ser = 'education';
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
			$return['storeatlasMax']          = $custom_store_atlasMax;
			$return['educationcoursesatlasMax']    = $custom_educationcourses_atlasMax;
			$return['educationcoursesCheck']   = $customeducationcoursesCheck;
			$return['educationteacherCheck']= $customeducationteacherCheck;
			$return['educationtutorCheck']   = $customeducationtutorCheck;


		}

		return $return;

	}

	/**
     * 教育固定字段
     * @return array
     */
	public function educationitem(){
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
		$results = $dsql->getTypeList($type, "education_item", $son, $page, $pageSize);
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
     * 教育分类
     * @return array
     */
	public function educationtype(){
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
		$results = $dsql->getTypeList($type, "education_type", $son, $page, $pageSize);
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
			require(HUONIAOINC."/config/education.inc.php");
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
            $sql     = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE c.`cid` in ($adminCityIds) AND c.`state` = 1 ORDER BY c.`id`");
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
		global $userLogin;
		$pageinfo = $list = array();
		$page = $pageSize = $where = "";

		$uid = $userLogin->getMemberID();

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['travel'][12][13]);//格式错误
			}else{
				$search   = $this->param['search'];
				$addrid   = (int)$this->param['addrid'];
				$typeid   = (int)$this->param['typeid'];
				$orderby  = (int)$this->param['orderby'];
				$max_longitude = $this->param['max_longitude'];
				$min_longitude = $this->param['min_longitude'];
				$max_latitude  = $this->param['max_latitude'];
				$min_latitude  = $this->param['min_latitude'];
				$lng      = $this->param['lng'];
				$lat      = $this->param['lat'];
				$u        = (int)$this->param['u'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
			}
		}
		$where = " AND `state` = 1";

		//数据共享
		require(HUONIAOINC."/config/education.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
			$cityid = getCityId($this->param['cityid']);
			//遍历区域
	        if($cityid){
	            $where .= " AND `cityid` = '$cityid'";
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


		if (!empty($typeid)) {
			$typeid = (int)$typeid;
			// $sql = $dsql->SetQuery("SELECT id,typename FROM `#@__education_type`where `id`=".$typeid);
			// $results=$dsql->dsqlOper($sql, "results");
			// $typename = $results[0]['typename'];
			// $typeid = $results[0]['id'];
            // if (!empty($results)) {
          	// 	$where .= " AND tag like '%$typeid%'";
            // }
			$where .= " AND FIND_IN_SET($typeid, `tag`)";

        }

		if(!empty($search)){

			siteSearchLog("education", $search);

			$sidArr = array();
	        $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__education_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `user`.title like '%$search%' OR `store`.address like '%$search%'");
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
			$where .= " AND `lng` <= '".$max_longitude."' AND `
			` >= '".$min_longitude."' AND `lat` <= '".$max_latitude."' AND `lat` >= '".$min_latitude."'";
		}

		//查询距离
		if((!empty($lng))&&(!empty($lat))){
            $select="(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(".$lat."-`lat`)/360),2)+COS(3.1415926535898*".$lat."/180)* COS(`lat` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(".$lng."-`lng`)/360),2))))*1000 AS distance,";
        }else{
            $select="";
        }

		//排序
        switch ($orderby){
            //浏览量
            case 1:
                $orderby_ = " ORDER BY `click` DESC, `weight` DESC ";
                break;
            //发布时间降序
            case 2:
                $orderby_ = " ORDER BY `pubdate` DESC, `weight` DESC `";
				break;
			//推荐排序
			case 3:
                $orderby_ = " ORDER BY `rec` DESC, `weight` DESC, `pubdate` DESC";
				break;
			//距离排序
			case 4:
				if((!empty($lng))&&(!empty($lat))){
					$orderby_ = " ORDER BY distance ASC";
				}
				break;
			//教师排序
			case 5:
				$orderby_ = " ORDER BY `teachernums` DESC, `rec` DESC, `weight` DESC, `pubdate` DESC ";
				break;
			//课程排序
			case 6:
				$orderby_ = " ORDER BY `coursesnums` DESC, `rec` DESC, `weight` DESC, `pubdate` DESC ";
				break;
			case 7:
				$orderby_ = " ORDER BY `id` DESC , `rec` DESC, `weight` DESC, `pubdate` DESC";
				break;
            default:
                $orderby_ = " ORDER BY `rec` DESC, `pubdate` DESC, `weight` DESC";
                break;
        }
        //typename 用于便利typename
        $sql = $dsql->SetQuery("SELECT `id`,`typename` From `#@__education_type`");
		$results = $dsql->dsqlOper($sql, "results");
		// $typearr=[];
		// foreach ($results as $k => $v) {
		// 	$typearr[$v['id']] = $v['typename'];
		// }

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;
		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__education_store` WHERE 1 = 1".$where);
		//总条数
		$totalCount = getCache("education_store_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！
        
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$archives = $dsql->SetQuery("SELECT `title`, `pubdate`, `pics`, `rec`, `tag`,`taglist`,`lat`, `lng`, `id`,`userid`, `address`, `tel`, `addrid`, ".$select." `flag`,(SELECT COUNT(`id`) FROM `#@__education_teacher` WHERE `company` = l.`id` AND `state` = 1 ) AS teachernums, (SELECT COUNT(`id`) FROM `#@__education_courses` WHERE `userid` = l.`id` AND `state` = 1 ) AS coursesnums FROM `#@__education_store` l WHERE 1 = 1".$where);
		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$sql = $dsql->SetQuery($archives.$orderby_.$where);
		$results = getCache("education_store_list", $sql, 300, array("disabled" => $u));
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']        = $val['id'];
				$list[$key]['title']     = $val['title'];
				$list[$key]['address']   = $val['address'];

				if($uid > -1){
					$list[$key]["tel"] = $val['tel'];
				}else{
					$list[$key]["tel"] = substr($val['tel'], 0, 3) . '****' . substr($val['tel'], -4);
				}

				$list[$key]['lng']       = $val['lng'];
				$list[$key]['lat']       = $val['lat'];
				$list[$key]['pubdate']   = $val['pubdate'];
				$list[$key]['rec']       = $val['rec'];
				$list[$key]['flag']      = $val['flag'];
				$list[$key]['distance']  = $val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22];  //距离   //千米  //米
				if(strpos($list[$key]['distance'],'千米')){
					$list[$key]['distance'] = str_replace("千米",'km',$list[$key]['distance']);
				}elseif(strpos($list[$key]['distance'],'米')){
					$list[$key]['distance'] = str_replace("米",'m',$list[$key]['distance']);
				}

				/* $archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_teacher` WHERE `state` = 1 AND `company` = " . $val['id']);
				$teachertotalCount = $dsql->dsqlOper($archives, "totalCount");
				$list[$key]['teachernums']       = $teachertotalCount; */
				$list[$key]['teachernums']       = $val['teachernums'];

				/* $archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_courses` WHERE `state` = 1 AND `userid` = " . $val['id']);
				$coursestotalCount = $dsql->dsqlOper($archives, "totalCount");
				$list[$key]['coursesnums']       = $coursestotalCount; */
				$list[$key]['coursesnums']       = $val['coursesnums'];

				$tagStr = array();
				$tagArr = array();
				if(!empty($val['tag'])){
					$tag = explode(",", $val['tag']);
					foreach ($tag as $k => $v) {
						$v = (int)$v;
						$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_type` WHERE `id` = " . $v);
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							array_push($tagStr, $ret[0]['typename']);
							array_push($tagArr, array(
								'jc' => $ret[0]['typename'],
								'py' => GetPinyin($ret[0]['typename'])
							));
						}
					}
				}
				$list[$key]['tag']    = join('、', $tagStr);
				$list[$key]['tagAll'] = $tagArr;

				$list[$key]['taglist'] = $val['taglist']!='' ? explode('|',$val['taglist']) : array() ;

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
					"service" => "education",
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
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = ".$uid);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$id = $results[0]['id'];
				$where = "";
			}else{
				return array("state" => 200, "info" => $langData['travel'][12][24]);//该会员暂未开通公司
			}
		}

		$sql = $dsql->SetQuery("SELECT `id`,`typename` From `#@__education_type`");
		$results = $dsql->dsqlOper($sql, "results");
		// $typearr=[];
		// foreach ($results as $k => $v) {
		// 	$typearr[$v['id']] = $v['typename'];
		// }

		$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `title`, `userid`, `lng`, `flag`, `lat`, `addrid`, `address`, `tel`, `rec`, `pics`, `click`, `pubdate`, `state`, `tag`,`taglist`,`body`,`is_vipguanggao`, `refuse`, (SELECT COUNT(`id`) FROM `#@__education_courses` WHERE `userid` = $id AND `state` = 1) coursesnums, (SELECT COUNT(`id`) FROM `#@__education_teacher` WHERE `company` = $id AND `state` = 1 ) teachernums FROM `#@__education_store` WHERE `id` = ".$id.$where);
		$results  = getCache("education_store_detail", $archives, 0, $id);
		if($results){
			$storeDetail["id"]         = $results[0]['id'];
			$storeDetail['cityid']     = $results[0]['cityid'];
			$storeDetail['flag']       = $results[0]['flag'];
			$storeDetail["title"]      = $results[0]['title'];
			$storeDetail["userid"]     = $results[0]['userid'];
			$storeDetail["address"]    = $results[0]['address'];
			$storeDetail["lng"]        = $results[0]['lng'];
			$storeDetail["lat"]        = $results[0]['lat'];
			$storeDetail["lnglat"]     = $results[0]['lng'].','.$results[0]['lat'];
			$storeDetail["is_vipguanggao"]        = $results[0]['is_vipguanggao'];

			if($uid > -1){
				$storeDetail["tel"] = $results[0]['tel'];
			}else{
				$storeDetail["tel"] = substr($results[0]['tel'], 0, 3) . '****' . substr($results[0]['tel'], -4);
			}
			$storeDetail["click"]      = $results[0]['click'];
			$storeDetail["state"]      = $results[0]['state'];
			$storeDetail["refuse"]     = $results[0]['refuse'];
			$storeDetail["coursesnums"] = $results[0]['coursesnums'];
			$storeDetail["teachernums"] = $results[0]['teachernums'];
			$storeDetail["body"]       = nl2br($results[0]['body']);

			$tagStr = array();
			$tagArr = array();
			if(!empty($results[0]['tag'])){
				$tag = explode(",", $results[0]['tag']);
				foreach ($tag as $k => $v) {
					$v = (int)$v;
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_type` WHERE `id` = " . $v);
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						array_push($tagStr, $ret[0]['typename']);
						array_push($tagArr, array(
							'jc' => $ret[0]['typename'],
							'py' => GetPinyin($ret[0]['typename'])
						));
					}
				}
			}
			$storeDetail['tag']    = join('、', $tagStr);
			$storeDetail['tagAll'] = $tagArr;
            $taglist               = $results[0]['taglist']!='' ? (strstr($results[0]['taglist'], '|') ? explode('|', $results[0]['taglist']) : explode(',', $results[0]['taglist'])) : array();
            $storeDetail['taglist']   = join('、', $taglist);;
            $storeDetail['taglistAll']= $taglist;;


			$storeDetail["rec"]    = $results[0]['rec'];
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

			//课程数

			//家教数

			//验证是否已经收藏
			$collect = '';
			if($uid != -1){
				$params = array(
					"module" => "education",
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
		global $siteCityInfo;
		$userid      = $userLogin->getMemberID();
		$param       = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$addrid      = (int)$param['addrid'];
		$cityid      = (int)$param['cityid'];
		$address     = $param['address'];
        $lnglat      = $param['lnglat'];
		$tel         = $param['tel'];
		$pics        = $param['pics'];
		$tag         = $param['tag'];
		$taglist     = $param['taglist'];
        $taglist     = str_replace(',', '|', $taglist);
		$body        = filterSensitiveWords($param['body']);
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
		if(!verifyModuleAuth(array("module" => "education"))){
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

		if(empty($pics)){
			return array("state" => 200, "info" => $langData['travel'][12][18]);//请上传图集
		}

        $lng = $lat = '';
        if($lnglat){
            $lnglatArr = explode(',', $lnglat);
            $lng = $lnglatArr[0];
            $lat = $lnglatArr[1];
        }

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		//新商铺
		if(!$userResult){
			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__education_store` (`cityid`, `title`, `userid`, `addrid`, `address`, `lng`, `lat`, `tel`, `tag`,`taglist`,`pics`, `pubdate`, `state`, `body`) VALUES ('$cityid', '$title', '$userid', '$addrid', '$address', '$lng', '$lat', '$tel', '$tag','$taglist','$pics', '$pubdate', '0', '$body')");
			$aid = $dsql->dsqlOper($archives, "lastid");
			if(is_numeric($aid)){

                $urlParam = array(
                    'service' => 'education',
                    'template' => 'store-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'education', 'store', $aid, 'insert', '申请店铺('.$title.')', $url, $archives);

				//更新当前会员下已经发布的信息性质
				$sql = $dsql->SetQuery("UPDATE `#@__education_tutor` SET `usertype` = 1, `userid` = '$aid' WHERE `userid` = '$userid'");
				$dsql->dsqlOper($sql, "update");

				$sql = $dsql->SetQuery("UPDATE `#@__education_courses` SET `usertype` = 1, `userid` = '$aid' WHERE `userid` = '$userid'");
				$dsql->dsqlOper($sql, "update");

				//微信通知
		        $cityName = $siteCityInfo['name'];
		      	$cityid  = $siteCityInfo['cityid'];
			    $param = array(
			    		'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
			        	'cityid' => $cityid,
			            'notify' => '管理员消息通知',
			            'fields' =>array(
				            'contentrn'  => $cityName.'分站——education模块——用户:'.$userDetail['username'].' 新增了机构: '.$title,
				            'date' => date("Y-m-d H:i:s", time()),
				        )
			        );
				//后台消息通知
				updateAdminNotice("education", "store",$param);
				updateCache("education_store_list", 300);
				clearCache("education_store_total", 'key');
                dataAsync("education",$aid,"store");  // 教育机构、添加店铺

				return $langData['travel'][12][19];//配置成功，您的商铺正在审核中，请耐心等待！
			}else{
				return array("state" => 200, "info" => $langData['travel'][12][20]);//配置失败，请查检您输入的信息是否符合要求！
			}
		}else{
			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__education_store` SET `cityid` = '$cityid', `title` = '$title', `userid` = '$userid', `addrid` = '$addrid', `address` = '$address', `lng` = '$lng', `lat` = '$lat', `tel` = '$tel', `taglist` = '$taglist', `pics` = '$pics', `state` = '0', `body` = '$body' WHERE `userid` = ".$userid);
			$results = $dsql->dsqlOper($archives, "update");

			if($results == "ok"){

                $urlParam = array(
                    'service' => 'education',
                    'template' => 'store-detail',
                    'id' => $userResult[0]['id']
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'education', 'store', $userResult[0]['id'], 'update', '配置店铺信息('.$title.')', $url, $archives);
                
				$oldid = $userResult[0]['id'];
				//更新当前会员下已经发布的信息性质
				$sql = $dsql->SetQuery("UPDATE `#@__education_tutor` SET `usertype` = 1, `userid` = '$oldid' WHERE `userid` = '$userid'");
				$dsql->dsqlOper($sql, "update");

				$sql = $dsql->SetQuery("UPDATE `#@__education_courses` SET `usertype` = 1, `userid` = '$oldid' WHERE `userid` = '$userid'");
				$dsql->dsqlOper($sql, "update");

				// 检查缓存
				$id = $userResult[0]['id'];
				checkCache("education_store_list", $id);
				clearCache("education_store_total", 'key');
				clearCache("education_store_detail", $id);
                dataAsync("education",$id,"store");  // 教育机构、修改店铺

				return $langData['travel'][12][21];//保存成功！
			}else{
				return array("state" => 200, "info" => $langData['travel'][12][20]);//配置失败，请查检您输入的信息是否符合要求！
			}
		}

	}

	/**
	 * 操作教师
	 * oper=add: 增加
	 * oper=del: 删除
	 * oper=update: 更新
	 * @return array
	 */
	public function operTeacher(){
		global $dsql;
		global $userLogin;
		global $langData;
		global $siteCityInfo;

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

		$name            =  filterSensitiveWords(addslashes($param['name']));
		$photo     	     =  $param['photo'];
		$education       =  (int)$param['education'];
		$sex             =  (int)$param['sex'];
		$university      =  $param['university'];
		$educationdesc   =  filterSensitiveWords(addslashes($param['educationdesc']));
		$teachingage     =  (int)$param['teachingage'];
		$educationidea   =  $param['educationidea'];
		$courses     	 =  $param['courses'];
		$idcardFront     =  $param['idcardFront'];
		$idcardBack      =  $param['idcardBack'];
		$degree     	 =  $param['degree'];
		$diploma     	 =  $param['diploma'];
		$pubdate         =  GetMkTime(time());

		$userinfo = $userLogin->getMemberInfo();
		if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "education"))){
			return array("state" => 200, "info" => $langData['travel'][12][27]);//商家权限验证失败！
		}

		$userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__education_store` WHERE `userid` = ".$userid);
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
			if(empty($name))  return array("state" => 200, "info" => $langData['education'][6][32]);//请输入姓名
			if(empty($education)) return array("state" => 200, "info" => $langData['education'][6][36]);//请选择学历
			if(empty($university)) return array("state" => 200, "info" => $langData['education'][6][35]);//请填写毕业院校
			if(empty($teachingage)) return array("state" => 200, "info" => $langData['education'][6][37]);//请选择教龄
			if(empty($courses)) return array("state" => 200, "info" => $langData['education'][6][38]);//请填写主要课程
			if(empty($photo))   return array("state" => 200, "info" => $langData['travel'][12][33]);//请上传图片图片
		}elseif($oper == 'del'){
			if(!is_numeric($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
		}

		$company = $userResult[0]['id'];

		if($oper == 'add'){
			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__education_teacher` (`sex`, `userid`, `company`, `name`, `photo`, `education`, `university`, `educationdesc`, `teachingage`, `educationidea`, `courses`, `idcardFront`, `idcardBack`, `degree`, `diploma`, `pubdate`, `state`) VALUES ('$sex', '$userid', '$company', '$name', '$photo', '$education', '$university', '$educationdesc', '$teachingage', '$educationidea', '$courses', '$idcardFront', '$idcardBack', '$degree', '$diploma', '$pubdate', '$state')");
			$aid = $dsql->dsqlOper($archives, "lastid");
			if(is_numeric($aid)){

                $urlParam = array(
                    'service' => 'education',
                    'template' => 'teacher-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'education', 'teacher', $aid, 'insert', '新增教师', $url, $archives);

				if($state){
					updateCache("education_teacher_list", 300);
				}

				clearCache("education_teacher_total", 'key');

				//微信通知
		        $cityName = $siteCityInfo['name'];
		      	$cityid  = $siteCityInfo['cityid'];
			    $param = array(
			    		'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
			        	'cityid' => $cityid,
			            'notify' => '管理员消息通知',
			            'fields' =>array(
				            'contentrn'  => $cityName.'分站——education模块——用户:'.$userinfo['username'].' 新增了一名教师: '.$name,
				            'date' => date("Y-m-d H:i:s", time()),
				        )
			        );
				//后台消息通知
				updateAdminNotice("education", "teacher",$param);

				return $aid;
			}else{
				return array("state" => 101, "info" => $langData['travel']['12']['34']);//发布到数据时发生错误，请检查字段内容！
			}
		}elseif($oper == 'update'){
			$archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__education_teacher` l LEFT JOIN `#@__education_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__education_teacher` SET `sex` = '$sex', `userid` = '$userid', `company` = '$company', `name` = '$name', `photo` = '$photo', `education` = '$education', `university` = '$university', `educationdesc` = '$educationdesc', `teachingage` = '$teachingage', `educationidea` = '$educationidea', `courses` = '$courses', `idcardFront` = '$idcardFront', `idcardBack` = '$idcardBack', `degree` = '$degree', `diploma` = '$diploma', `state` = '$state' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					return array("state" => 200, "info" => $langData['travel']['12']['34']); //保存到数据时发生错误，请检查字段内容！
				}

                $urlParam = array(
                    'service' => 'education',
                    'template' => 'teacher-detail',
                    'id' => $id
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'education', 'teacher', $id, 'insert', '更新教师', $url, $archives);

				$cityName = $siteCityInfo['name'];
		      	$cityid  = $siteCityInfo['cityid'];
				$param = array(
			    		'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
			        	'cityid' => $cityid,
			            'notify' => '管理员消息通知',
			            'fields' =>array(
				            'contentrn'  => $cityName.'分站——education模块——教师ID:'.$id.'更新了信息',
				            'date' => date("Y-m-d H:i:s", time()),
				        )
			        );
				updateAdminNotice("education", "teacher",$param);

				// 清除缓存
				clearCache("education_teacher_detail", $id);
				checkCache("education_teacher_list", $id);
				clearCache("education_teacher_total", 'key');


				return $langData['travel'][12][35];//修改成功！
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}elseif($oper == 'del'){
			$archives = $dsql->SetQuery("SELECT l.`id`, l.`photo`, l.`idcardFront`, l.`idcardBack`, l.`degree`, l.`diploma`, s.`userid` FROM `#@__education_teacher` l LEFT JOIN `#@__education_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$results = $results[0];
				if($results['userid'] == $userid){
					//删除图集
					delPicFile($results['pics'], "delThumb", "education");
					delPicFile($results['idcardFront'], "delThumb", "education");
					delPicFile($results['idcardBack'], "delThumb", "education");
					delPicFile($results['degree'], "delThumb", "education");
					delPicFile($results['diploma'], "delThumb", "education");
					// 清除缓存
					clearCache("education_teacher_detail", $id);
					checkCache("education_teacher_list", $id);
					clearCache("education_teacher_total", 'key');

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__education_teacher` WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");
                
                    //记录用户行为日志
                    memberLog($userid, 'education', 'teacher', $id, 'delete', '删除教师', '', $archives);

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
	 * 教育教师列表
	 * @return array
	 */
	public function teacherList(){
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
				$store    = $this->param['store'];
				$state    = $this->param['state'];
				$noid	  = $this->param['noid'];
				$u        = $this->param['u'];
				$orderby  = $this->param['orderby'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		$uid      = $userLogin->getMemberID();
		$userinfo = $userLogin->getMemberInfo();

		if($noid){
			$where .= " AND `id` not in ($noid) ";
		}

		if($u!=1){
			$where .= " AND `state` = 1 ";

			//数据共享
			require(HUONIAOINC."/config/education.inc.php");
			$dataShare = (int)$customDataShare;

			if(!$dataShare){
				$cityid = getCityId($this->param['cityid']);
				if($cityid){
					$archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `state` = 1 AND `cityid` = $cityid");
					$results = $dsql->dsqlOper($archives, "results");
					if(is_array($results)){
						foreach ($results as $key => $value) {
							$sidArr[$key] = $value['id'];
						}
						if(!empty($sidArr)){
							$where .= " AND `company` in (".join(",",$sidArr).")";
						}else{
							$where .= " AND 0 = 1";
						}
					}else{
						$where .= " AND 0 = 1";
					}
				}
			}
		}else{
			if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "education"))){
				return array("state" => 200, "info" => $langData['travel'][12][14]);//商家权限验证失败
			}

			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = $uid");
			$storeRes = $dsql->dsqlOper($sql, "results");
			if($storeRes){
				$where .= " AND `company` = ".$storeRes[0]['id'];
			}else{
				$where .= " AND 1 = 2";
			}

			if($state!=''){
				$where .= " AND `state` = ".$state;
			}
		}

		if($store){
			$where .= " AND `company` = '$store'";
		}

		if(!empty($search)){

			siteSearchLog("education", $search);

			$sidArr = array();
	        $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__education_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$search%' OR `store`.address like '%$search%'");
	        $results = $dsql->dsqlOper($userSql, "results");
	        foreach ($results as $key => $value) {
	            $sidArr[$key] = $value['id'];
	        }

	        if(!empty($sidArr)){
	            $where .= " AND (`name` like '%$search%' OR `company` in (".join(",",$sidArr)."))";
	        }else{
	            $where .= " AND `name` like '%$search%'";
	        }
		}

		//排序
        switch ($orderby){
            //浏览量
            case 1:
                $orderby_ = " ORDER BY `click` DESC, `weight` DESC, `id` DESC";
                break;
            //发布时间降序
            case 2:
                $orderby_ = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
				break;
            default:
                $orderby_ = " ORDER BY `weight` DESC, `id` DESC";
                break;
        }

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `sex`, `name`, `userid`, `company`, `education`, `university`, `teachingage`, `courses`, `certifyState`, `degreestate`, `diplomastate`, `click`, `pubdate`, `state`, `photo`  FROM `#@__education_teacher` WHERE 1 = 1".$where);
		//总条数
		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__education_teacher` WHERE 1 = 1".$where);
		//总条数
		$totalCount = getCache("education_teacher_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
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
		$results = getCache("education_teacher_list", $sql, 300, array("disabled" => $u));
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']        = $val['id'];
				$list[$key]['name']      = $val['name'];
				$list[$key]['userid']    = $val['userid'];
				$list[$key]['sex']       = $val['sex'];
				$list[$key]['company']   = $val['company'];
				$list[$key]['click']     = $val['click'];
				$list[$key]['pubdate']   = $val['pubdate'];
				$list[$key]['state']     = $val['state'];

				$list[$key]['certifyState']   = $val['certifyState'];
				$list[$key]['degreestate']    = $val['degreestate'];
				$list[$key]['diplomastate']   = $val['diplomastate'];

				$list[$key]['courses']   = $val['courses'];


				$coursesArr = array();
				if(!empty($val['courses'])){
					$coursesArr = explode(",", $val['courses']);
				}
				$list[$key]['coursesArr'] = $coursesArr;
				$list[$key]['photo'] = $val['photo'] ? getFilePath($val['photo']) : '';

				$param = array(
					"service" => "education",
					"template" => "teacher-detail",
					"id" => $val['id']
				);
				$url = getUrlPath($param);

				$list[$key]['url'] = $url;

				$lower = [];
				$param['id']    = $val['company'];
				$this->param    = $param;
				$store          = $this->storeDetail();
				if(!empty($store)){
					$lower = $store;
				}
				$list[$key]['store'] = $lower;
			}

		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
     * 教育教师详细
     * @return array
     */
	public function teacherDetail(){
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

		$archives = $dsql->SetQuery("SELECT `id`, `name`, `sex`, `userid`, `company`, `photo`, `education`, `university`, `educationdesc`, `teachingage`, `educationidea`, `courses`, `idcardFront`, `idcardBack`, `certifyState`, `degree`, `degreestate`, `diploma`, `diplomastate`, `click`, `pubdate`, `state` FROM `#@__education_teacher` WHERE `id` = ".$id.$where);
		$results  = getCache("education_teacher_detail", $archives, 0, $id);
		if($results){
			$storeDetail["id"]          = $results[0]['id'];
			$storeDetail["name"]        = $results[0]['name'];
			$storeDetail['userid']      = $results[0]['userid'];
			$storeDetail['company']     = $results[0]['company'];
			$storeDetail["click"]       = $results[0]['click'];
			$storeDetail["pubdate"]     = $results[0]['pubdate'];
			$storeDetail["sex"]     = $results[0]['sex'];
			$storeDetail["state"]       = $results[0]['state'];
			$storeDetail["certifyState"]= $results[0]['certifyState'];
			$storeDetail["degreestate"] = $results[0]['degreestate'];
			$storeDetail["diplomastate"]= $results[0]['diplomastate'];
			$storeDetail["photo"]       = $results[0]['photo'];
			$storeDetail["courses"]       = $results[0]['courses'];
			$storeDetail['photoSource'] = $results[0]['photo'] ? getFilePath($results[0]['photo']) : '';
			$storeDetail["idcardFront"] = $results[0]['idcardFront'];
			$storeDetail['idcardFrontSource'] = $results[0]['idcardFront'] ? getFilePath($results[0]['idcardFront']) : '';
			$storeDetail["idcardBack"]  = $results[0]['idcardBack'];
			$storeDetail['idcardBackSource'] = $results[0]['idcardBack'] ? getFilePath($results[0]['idcardBack']) : '';
			$storeDetail["degree"]       = $results[0]['degree'];
			$storeDetail['degreeSource'] = $results[0]['degree'] ? getFilePath($results[0]['degree']) : '';
			$storeDetail["diploma"]      = $results[0]['diploma'];
			$storeDetail['diplomaSource']= $results[0]['diploma'] ? getFilePath($results[0]['diploma']) : '';
			$storeDetail['education']    = $results[0]['education'];
			$storeDetail['university']   = $results[0]['university'];
			$storeDetail['educationdesc']= $results[0]['educationdesc'];
			$storeDetail['teachingage']  = $results[0]['teachingage'];
			$storeDetail['educationidea']= $results[0]['educationidea'];

			$educationname = '';
			if($results[0]['education']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = " . $results[0]['education']);
				$Res = $dsql->dsqlOper($sql, "results");
				$educationname = $Res[0]['typename'];
			}
			$storeDetail['educationname']= $educationname;

			$teachingagename = '';
			if($results[0]['education']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = " . $results[0]['teachingage']);
				$Res = $dsql->dsqlOper($sql, "results");
				$teachingagename = $Res[0]['typename'];
			}
			$storeDetail['teachingagename']= $teachingagename;


			$coursesArr = array();
			if(!empty($results[0]['courses'])){
				$coursesArr = explode(",", $results[0]['courses']);
			}
			$storeDetail['coursesAll'] = $coursesArr;

			$lower = [];
			$param['id']    = $results[0]['company'];
			$this->param    = $param;
			$store          = $this->storeDetail();
			if(!empty($store)){
				$lower = $store;
			}
			$storeDetail['store'] = $lower;

			$param = array(
				"service"  => "education",
				"template" => "store-detail",
				"id"       => $results[0]['company']
			);
			$storeDetail['companyurl'] = getUrlPath($param);

			//验证是否已经收藏
			$params = array(
				"module" => "education",
				"temp"   => "teacher-detail",
				"type"   => "add",
				"id"     => $results[0]['id'],
				"check"  => 1
			);
			$collect = checkIsCollect($params);
			$storeDetail['collect'] = $collect == "has" ? 1 : 0;

		}
		return $storeDetail;
	}

	/**
	 * 操作家教
	 * oper=add: 增加
	 * oper=del: 删除
	 * oper=update: 更新
	 * @return array
	 */
	public function operTutor(){
		global $dsql;
		global $userLogin;
		global $langData;
		global $siteCityInfo;

		require(HUONIAOINC."/config/education.inc.php");
		$state = (int)$customeducationtutorCheck;

		$userid      = $userLogin->getMemberID();
		$userinfo    = $userLogin->getMemberInfo();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		$param           =  $this->param;
		$oper            =  $param['oper'];
		$type            =  (int)$param['type'];
		$username        =  filterSensitiveWords(addslashes($param['username']));
		$addrid          =  (int)$param['addrid'];
		$cityid          =  (int)$param['cityid'];
		$sex             =  (int)$param['sex'];
		$catid           =  (int)$param['catid'];
		$photo     	     =  $param['photo'];
		$university      =  $param['university'];
		$education     	 =  $param['education'];
		$teachingage     =  $param['teachingage'];
		$subjects        =  $param['subjects'];
		$idcardFront     =  $param['idcardFront'];
		$idcardBack      =  $param['idcardBack'];
		$degree          =  $param['degree'];
		$diploma         =  $param['diploma'];
		$price           =  $param['price'];
		$typeid          =  $param['typeid'];
		$areacityid      =  $param['areacityid'];
		$areaaddrid      =  $param['areaaddrid'];
		$area            =  $param['area'];
		$teachingtime    =  $param['teachingtime'];
		$note            =  $param['note'];
		$vercode         =  $param['vercode'];
		$tel             =  $param['tel'];
		$pubdate         =  GetMkTime(time());

		if(!empty($teachingtime)){
			$teachingtime = serialize($teachingtime);
		}else{
			$teachingtime = '';
		}

		$userinfo = $userLogin->getMemberInfo();
		if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "education"))){
			return array("state" => 200, "info" => $langData['travel'][12][27]);//商家权限验证失败！
		}

		if($userinfo['userType'] == 2 && verifyModuleAuth(array("module" => "education"))){
			/* $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__travel_store` WHERE `userid` = ".$userid);
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				return array("state" => 200, "info" => $langData['travel'][12][28]);//您还未开通婚嫁公司！
			}

			if($userResult[0]['state'] == 0){
				return array("state" => 200, "info" => $langData['travel'][12][29]);//您的公司信息还在审核中，请通过审核后再发布！
			}

			if($userResult[0]['state'] == 2){
				return array("state" => 200, "info" => $langData['travel'][12][30]);//您的公司信息审核失败，请通过审核后再发布！
			} */
		}

		$usertype = 0;
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = '".$userid."'");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			$userid = $res[0]['id'];
			$usertype = 1;
		}



		if($type == 1){
			if(empty($username))  return array("state" => 200, "info" => $langData['education'][6][32]);//请输入姓名
			if(empty($photo)) return array("state" => 200, "info" => $langData['education'][6][34]);//请上传人员照片
			if(empty($addrid)) return array("state" => 200, "info" => $langData['homemaking'][5][19]);//请选择所在地
			if(empty($university)) return array("state" => 200, "info" => $langData['education'][6][35]);//请填写毕业院校
			if(empty($education))   return array("state" => 200, "info" => $langData['education'][6][36]);//请选择学历
			if(empty($teachingage))   return array("state" => 200, "info" => $langData['education'][6][37]);//请选择教龄
			if(empty($subjects))   return array("state" => 200, "info" => $langData['education'][6][19]);//请填写教学科目
		}else{
			if($price=='')   return array("state" => 200, "info" => $langData['education'][6][26]);//请填写价格
			if($typeid=='')  return array("state" => 200, "info" => $langData['education'][6][27]);//请选择授课方式
			if($typeid==1){
				if(empty($area))  return array("state" => 200, "info" => $langData['education'][6][29]);//请填写授课地址
			}else{
				if(empty($areaaddrid)) return array("state" => 200, "info" => $langData['homemaking'][5][19]);//请选择所在地
			}
			if(empty($tel))   return array("state" => 200, "info" => $langData['education'][6][24]);//请输入手机号
			if(!$userinfo['phone'] || !$userinfo['phoneCheck']){//{#else#}style="display: block;"
				if(empty($vercode)) return array("state" => 200, "info" => $langData['homemaking'][8][19]);//请填写验证码
				//国际版需要验证区域码
				$cphone_ = $tel;
				$archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					$international = $results[0]['international'];
					if($international){
						$cphone_ = $areaCode.$phone;
					}
				}

				$ip = GetIP();
				$sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
				$res_code = $dsql->dsqlOper($sql_code, "results");
				if($res_code){
					$code = $res_code[0]['code'];
					$codeID = $res_code[0]['id'];

					if(strtolower($vercode) != $code){
						return array('state' =>200, 'info' => $langData['homemaking'][8][20]);//验证码输入错误，请重试！
					}

					//5分钟有效期
					$now = GetMkTime(time());
					if($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
				}else{
					return array('state' =>200, 'info' => $langData['homemaking'][8][20]);//验证码输入错误，请重试！
				}
			}
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__education_tutor` WHERE `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");

		if(empty($userResult)){
			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__education_tutor` (`catid`, `username`, `usertype`, `userid`, `cityid`, `addrid`, `photo`, `education`, `university`, `teachingage`, `subjects`, `idcardFront`, `idcardBack`, `degree`, `diploma`, `pubdate`, `state`, `sex`) VALUES ('$catid', '$username', '$usertype', '$userid', '$cityid', '$addrid', '$photo', '$education', '$university', '$teachingage', '$subjects', '$idcardFront', '$idcardBack', '$degree', '$diploma', '$pubdate', '$state', '$sex')");
			$aid = $dsql->dsqlOper($archives, "lastid");
			if(is_numeric($aid)){

                $urlParam = array(
                    'service' => 'education',
                    'template' => 'tutor-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'education', 'tutor', $aid, 'insert', '新增家教', $url, $archives);

				$tutorTxt = $langData['education']['7']['7'];
				if($state){
					updateCache("education_tutor_list", 300);
					$tutorTxt = $langData['education']['7']['8'];
				}

				clearCache("education_tutor_total", 'key');

				//微信通知
		        $cityName = $siteCityInfo['name'];
		      	$cityid  = $siteCityInfo['cityid'];
			    $param = array(
			    		'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
			        	'cityid' => $cityid,
			            'notify' => '管理员消息通知',
			            'fields' =>array(
				            'contentrn'  => $cityName.'分站——education模块——用户:'.$userinfo['username'].' 新增了家教: '.$username,
				            'date' => date("Y-m-d H:i:s", time()),
				        )
			        );
				//后台消息通知
				updateAdminNotice("education", "tutor",$param);
				// return $aid;
				return $tutorTxt;
			}else{
				return array("state" => 101, "info" => $langData['travel']['12']['34']);//发布到数据时发生错误，请检查字段内容！
			}
		}else{
			$archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__education_tutor` l  WHERE l.`userid` = '$userid'");
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){

                $tutorid = $results[0]['id'];

				//保存到主表
				if($type == 1){
					$archives = $dsql->SetQuery("UPDATE `#@__education_tutor` SET `catid` = '$catid', `username` = '$username', `usertype` = '$usertype', `userid` = '$userid', `cityid` = '$cityid', `addrid` = '$addrid', `photo` = '$photo', `education` = '$education', `university` = '$university', `teachingage` = '$teachingage', `subjects` = '$subjects', `idcardFront` = '$idcardFront', `idcardBack` = '$idcardBack', `degree` = '$degree', `diploma` = '$diploma', `state` = '$state', `sex` = '$sex' WHERE `userid` = ".$userid);
				}else{
					$archives = $dsql->SetQuery("UPDATE `#@__education_tutor` SET `price` = '$price', `typeid` = '$typeid', `areacityid` = '$areacityid', `areaaddrid` = '$areaaddrid', `area` = '$area', `teachingtime` = '$teachingtime', `note` = '$note', `tel` = '$tel' WHERE `userid` = ".$userid);
				}

				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					return array("state" => 200, "info" => $langData['travel']['12']['34']); //保存到数据时发生错误，请检查字段内容！
				}

                $urlParam = array(
                    'service' => 'education',
                    'template' => 'tutor-detail',
                    'id' => $tutorid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'education', 'tutor', $tutorid, 'update', '更新家教', $url, $archives);

				//微信通知
		        $cityName = $siteCityInfo['name'];
		      	$cityid  = $siteCityInfo['cityid'];
			    $param = array(
			    		'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
			        	'cityid' => $cityid,
			            'notify' => '管理员消息通知',
			            'fields' =>array(
				            'contentrn'  => $cityName.'分站——education模块——用户:'.$userinfo['username'].' 更新了家教信息',
				            'date' => date("Y-m-d H:i:s", time()),
				        )
			        );
				//后台消息通知
				updateAdminNotice("education", "tutor",$param);

				// 清除缓存
				clearCache("education_tutor_detail", $tutorid);
				checkCache("education_tutor_list", $tutorid);
				clearCache("education_tutor_total", 'key');


				return $langData['travel'][12][35];//修改成功！
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}

	}

	/**
	 * 教育家教
	 * @return array
	 */
	public function tutorList(){
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
				$usertype = $this->param['usertype'];
				$state    = $this->param['state'];
				$u        = (int)$this->param['u'];
				$rec      = (int)$this->param['rec'];
				$noid	  = $this->param['noid'];
				$catid	  = (int)$this->param['catid'];
				$addrid   = (int)$this->param['addrid'];
				$typeid   = (int)$this->param['typeid'];
				$price   =  $this->param['price'];
				$orderby  = $this->param['orderby'];
				$price    = $this->param['price'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
			}
		}

		$uid      = $userLogin->getMemberID();
		$userinfo = $userLogin->getMemberInfo();

		if($rec){
			$where .= " AND `rec` = 1";
		}

		if($usertype!=''){
			$where .= " AND `usertype` = '$usertype'";
		}

		if($noid){
			$where .= " AND `id` not in ($noid)";
		}

		//遍历分类
        if (!empty($catid)) {
            if ($dsql->getTypeList($catid, "education_type")) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($dsql->getTypeList($catid, "education_type"));
                $lower    = $catid . "," . join(',', $lower);
            } else {
                $lower = $catid;
            }
            $where .= " AND `catid` in ($lower)";
        }

		if($u!=1){

			//数据共享
			require(HUONIAOINC."/config/education.inc.php");
			$dataShare = (int)$customDataShare;

			if(!$dataShare){
				$cityid = getCityId($this->param['cityid']);
				$where .= " AND `state` = 1 AND `cityid` = '$cityid' ";
			}else{
				$where .= " AND `state` = 1 ";
			}

			if($cityid && $usertype!=0){
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `state` = 1 AND `cityid` = $cityid");
				$results = $dsql->dsqlOper($archives, "results");
				if(is_array($results)){
					foreach ($results as $key => $value) {
						$sidArr[$key] = $value['id'];
					}
					if(!empty($sidArr)){
						if($usertype===0){
							$where .= " AND `usertype` = 0";
						}elseif($usertype==1){
							$where .= " AND (`usertype` = 1 AND `userid` in (".join(",",$sidArr)."))";
						}elseif($usertype===null){
							$where .= " AND (`usertype` = 0 OR (`usertype` = 1 AND `userid` in (".join(",",$sidArr).")))";
						}
					}else{
						if($usertype==1){
							$where .= " AND `usertype` = 1";
						}else{
							$where .= " AND `usertype` = 0";
						}
					}
				}else{
					if($usertype==1){
						$where .= " AND `usertype` = 1";
					}else{
						$where .= " AND `usertype` = 0";
					}
				}
			}
		}else{
			if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "education"))){
				return array("state" => 200, "info" => $langData['travel'][12][14]);//商家权限验证失败
			}

			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = $uid");
			$storeRes = $dsql->dsqlOper($sql, "results");
			if($storeRes){
				$where .= " AND `userid` = ".$storeRes[0]['id'];
			}else{
				$where .= " AND `userid` = ".$uid;
			}

			if($state!=''){
				$where .= " AND `state` = ".$state;
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


		if (!empty($typeid)) {
            if ($dsql->getTypeList($typeid, "education_type")) {
            	echo "string";die;
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($dsql->getTypeList($typeid, "education_type"));
                $lower    = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }

           $where .= " AND `catid` in ($lower)";

        }
        // $price = $_REQUEST['price'];
        $price = convertArrToStrWithComma($price);
		//价格区间
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

		if(!empty($search)){
			siteSearchLog("education", $search);
			$where .= " AND `username` like '%$search%'";
		}
		//排序
        switch ($orderby){
            //浏览量
            case 1:
                $orderby_ = " ORDER BY `click` DESC, `rec` DESC, `weight` DESC, `id` DESC";
                break;
            //发布时间降序
            case 2:
                $orderby_ = " ORDER BY `pubdate` DESC, `rec` DESC, `weight` DESC, `id` DESC";
				break;
			//推荐降序
			case 3:
                $orderby_ = " ORDER BY `rec` DESC, `pubdate` DESC, `weight` DESC, `id` DESC";
				break;
			//价格降序
			case 4:
				$orderby_ = " ORDER BY `price` DESC, `rec` DESC, `pubdate` DESC, `weight` DESC, `id` DESC";
				break;
			//价格升序
			case 5:
				$orderby_ = " ORDER BY `price` ASC, `rec` DESC, `pubdate` DESC, `weight` DESC, `id` DESC";
				break;
			//销量降序
			case 6:
				$orderby_ = " ORDER BY `sale` DESC, `rec` DESC, `pubdate` DESC, `weight` DESC, `id` DESC";
				break;
            default:
                $orderby_ = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
                break;
        }

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `username`, `usertype`, `userid`,`certifyState`,`degreestate`, `cityid`, `addrid`, `photo`, `education`, `university`, `teachingage`, `subjects`, `note`, `click`, `pubdate`, `state`, `rec`, `sex`, `tel`, `price`, `teachingtime`, (SELECT COUNT(`id`)  FROM `#@__education_yuyue` WHERE `tutorid` = l.`id` ) AS sale FROM `#@__education_tutor` l WHERE 1 = 1".$where);
		//总条数
		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__education_tutor` l WHERE 1 = 1".$where);
		//总条数
		$totalCount = getCache("education_tutor_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
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
		$results = getCache("education_tutor_list", $sql, 300, array("disabled" => $u));
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']        = $val['id'];
				$list[$key]['price']     = $val['price'];
				$list[$key]['userid']    = $val['userid'];
				$list[$key]['username']  = $val['username'];
				$list[$key]['usertype']  = $val['usertype'];
				$list[$key]['userid']    = $val['userid'];
				$list[$key]['click']     = $val['click'];
				$list[$key]['pubdate']   = $val['pubdate'];
				$list[$key]['state']     = $val['state'];
				$list[$key]['cityid']    = $val['cityid'];
				$list[$key]['sex']       = $val['sex'];
				$list[$key]['certifyState']       = $val['certifyState'];
				$list[$key]['degreestate']       = $val['degreestate'];
				if($uid > -1){
					$list[$key]["tel"] = $val['tel'];
				}else{
					$list[$key]["tel"] = substr($val['tel'], 0, 3) . '****' . substr($val['tel'], -4);
				}

				$list[$key]['rec']       = $val['rec'];
				$list[$key]['university']= $val['university'];
				$list[$key]['subjects']  = $val['subjects'];
				$list[$key]['note']  = $val['note'];

				$teachingtime = unserialize($val['teachingtime']);
				if(empty($teachingtime)){
					$list[$key]['fullclass']  = 2;
				}elseif(count($teachingtime, 1) == 28){//满课
					$list[$key]['fullclass']  = 1;
				}else{
					$list[$key]['fullclass']  = 0;//预约
				}

				$subjectsArr = array();
				if(!empty($val['subjects'])){
					$subjects = explode(",", $val['subjects']);
					foreach ($subjects as $k => $v) {
						$subjectsArr[$k] = $v;
					}
				}
				$list[$key]['subjectsArr'] = $subjectsArr;

				$educationname = '';
				if($results[0]['education']){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = " . $val['education']);
					$Res = $dsql->dsqlOper($sql, "results");
					$educationname = $Res[0]['typename'];
				}
				$list[$key]['educationname']= $educationname;

				$teachingagename = '';
				if($results[0]['teachingage']){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = " . $val['teachingage']);
					$Res = $dsql->dsqlOper($sql, "results");
					$teachingagename = $Res[0]['typename'];
				}
				$list[$key]['teachingagename']= $teachingagename;


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
					"service" => "education",
					"template" => "tutor-detail",
					"id" => $val['id']
				);
				$url = getUrlPath($param);

				$list[$key]['url'] = $url;

			}

		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
     * 教育家教详细
     * @return array
     */
	public function tutorDetail(){
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
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = ".$uid);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$userid=$results[0]['id'];
				$where = "";
			}else{
				$userid=$uid;
				$where = "";
			}
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_tutor` WHERE `userid` = ".$userid);
			$res = $dsql->dsqlOper($sql, "results");
			$id  = $res[0]['id'];
		}
		if($id){
			$archives = $dsql->SetQuery("SELECT `id`, `catid`, `username`, `usertype`, `userid`, `cityid`, `addrid`, `photo`, `education`, `university`, `teachingage`, `subjects`, `idcardFront`, `idcardBack`, `certifyState`, `degree`, `degreestate`, `diploma`, `diplomastate`, `price`, `typeid`, `areacityid`, `areaaddrid`, `area`, `teachingtime`, `note`, `tel`, `click`, `pubdate`, `state`, `rec`, `sex` FROM `#@__education_tutor` WHERE `id` = ".$id.$where);
			$results  = getCache("education_tutor_detail", $archives, 0, $id);
			if(!empty($results)){
				$storeDetail["id"]          = $results[0]['id'];
				$storeDetail["cityid"]      = $results[0]['cityid'];
				$storeDetail['userid']      = $results[0]['userid'];
				$storeDetail["click"]       = $results[0]['click'];
				$storeDetail["pubdate"]     = $results[0]['pubdate'];
				$storeDetail["state"]       = $results[0]['state'];
				$storeDetail['addrid']      = $results[0]['addrid'];
				$storeDetail['note']        = $results[0]['note'];
				$storeDetail["username"]    = $results[0]['username'];
				$storeDetail["usertype"]    = $results[0]['usertype'];
				$storeDetail["education"]   = $results[0]['education'];
				$storeDetail['university']  = $results[0]['university'];
				$storeDetail['teachingage'] = $results[0]['teachingage'];
				$storeDetail['subjects']    = $results[0]['subjects'];
				$storeDetail['certifyState']= $results[0]['certifyState'];
				$storeDetail['degreestate'] = $results[0]['degreestate'];
				$storeDetail['diplomastate']= $results[0]['diplomastate'];
				$storeDetail['price']       = $results[0]['price'];
				$storeDetail['typeid']      = $results[0]['typeid'];
				$storeDetail['areacityid']  = $results[0]['areacityid'];
				$storeDetail['areaaddrid']  = $results[0]['areaaddrid'];
				$storeDetail['area']        = $results[0]['area'];
				$storeDetail['teachingtime']= $results[0]['teachingtime'];

				if($uid > -1){
					$storeDetail["tel"] = $results[0]['tel'];
				}else{
					$storeDetail["tel"] = substr($results[0]['tel'], 0, 3) . '****' . substr($results[0]['tel'], -4);
				}

				$storeDetail['rec']         = $results[0]['rec'];
				$storeDetail['sex']         = $results[0]['sex'];
				$storeDetail['catid']       = $results[0]['catid'];

				$catname = '';
				if($results[0]['catid']){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_type` WHERE `id` = " . $results[0]['catid']);
					$Res = $dsql->dsqlOper($sql, "results");
					$catname = $Res[0]['typename'];
				}
				$storeDetail['catname']= $catname;

				$storeDetail['teachingtimeAll']         = !empty($results[0]['teachingtime']) ? unserialize($results[0]['teachingtime']) : '';
				$teachingtime  = unserialize($results[0]['teachingtime']) ;
				$storeDetail['yuyuenum']  = !empty($teachingtime) ? count($teachingtime, 1) - count($teachingtime) : 0;

				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_yuyue` WHERE `tutorid` = " . $results[0]['id']);
				$totalCount = $dsql->dsqlOper($archives, "totalCount");
				$storeDetail['sale'] = $totalCount;

				$educationname = '';
				if($results[0]['education']){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = " . $results[0]['education']);
					$Res = $dsql->dsqlOper($sql, "results");
					$educationname = $Res[0]['typename'];
				}
				$storeDetail['educationname']= $educationname;

				$teachingagename = '';
				if($results[0]['teachingage']){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = " . $results[0]['teachingage']);
					$Res = $dsql->dsqlOper($sql, "results");
					$teachingagename = $Res[0]['typename'];
				}
				$storeDetail['teachingagename']= $teachingagename;

				$storeDetail['typename'] = $results[0]['typeid']!='' ? $this->gettypename("typeid_type", $results[0]['typeid']) : '';

				$subjectsArr = array();
				if(!empty($results[0]['subjects'])){
					$subjectsArr = explode(",", $results[0]['subjects']);
				}
				$storeDetail['subjectsAll'] = $subjectsArr;

				$storeDetail["photo"]       = $results[0]['photo'];
				$storeDetail['photoSource'] = $results[0]['photo'] ? getFilePath($results[0]['photo']) : '';
				$storeDetail["idcardFront"] = $results[0]['idcardFront'];
				$storeDetail['idcardFrontSource'] = $results[0]['idcardFront'] ? getFilePath($results[0]['idcardFront']) : '';
				$storeDetail["idcardBack"]  = $results[0]['idcardBack'];
				$storeDetail['idcardBackSource'] = $results[0]['idcardBack'] ? getFilePath($results[0]['idcardBack']) : '';
				$storeDetail["degree"]       = $results[0]['degree'];
				$storeDetail['degreeSource'] = $results[0]['degree'] ? getFilePath($results[0]['degree']) : '';
				$storeDetail["diploma"]      = $results[0]['diploma'];
				$storeDetail['diplomaSource']= $results[0]['diploma'] ? getFilePath($results[0]['diploma']) : '';

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

				if(!empty($results[0]['areaaddrid'])){
					$areaName = getParentArr("site_area", $results[0]['areaaddrid']);
					global $data;
					$data = "";
					$areaArr = array_reverse(parent_foreach($areaName, "typename"));
					$areaArr = count($areaArr) > 2 ? array_splice($areaArr, 1) : $areaArr;
					$storeDetail['areaname']  = $areaArr;
				}else{
					$storeDetail['areaname'] = "";
				}

				//验证是否已经收藏
				$params = array(
					"module" => "education",
					"temp"   => "tutor-detail",
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
	 * 家教预约
	 * oper=add: 增加
	 * oper=del: 删除
	 * oper=update: 更新
	 * @return array
	 */
	public function booking(){
		global $dsql;
		global $userLogin;
		global $langData;
		global $siteCityInfo;
		$userid      = $userLogin->getMemberID();
		$userinfo    = $userLogin->getMemberInfo();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		$param           =  $this->param;
		$id              =  $param['id'];
		$oper            =  $param['oper'];

		$tutorid         =  (int)$param['tutorid'];
		$username        =  filterSensitiveWords(addslashes($param['username']));
		$areaCode     	 =  $param['areaCode'];
		$tel     	     =  $param['tel'];
		$pubdate         =  GetMkTime(time());

		//手机号码增加区号，国内版不显示
		$tel = ($areaCode == '86' ? '' : $areaCode) . $tel;

		if($oper == 'add'){
			if(empty($tutorid))  return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
			if(empty($username))  return array("state" => 200, "info" => $langData['education'][6][32]);//请输入姓名
			if(empty($tel)) return array("state" => 200, "info" => $langData['education'][6][24]);//请输入手机号
		}elseif($oper == 'del' || $oper == 'update'){
			if(!is_numeric($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
		}

		if($oper == 'add'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_yuyue` WHERE `tel` = ".$tel);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				return array("state" => 200, "info" => $langData['education'][7][34]);//您已预约此家教老师！
			}

			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__education_yuyue` (`tutorid`, `username`, `tel`,  `state`, `userid`, `pubdate`) VALUES ('$tutorid', '$username', '$tel', '0', '$userid', '$pubdate')");
			$aid = $dsql->dsqlOper($archives, "lastid");
			if(is_numeric($aid)){
				updateCache("education_yuyue_list", 300);
				clearCache("education_yuyue_total", 'key');
				//微信通知
		        $cityName = $siteCityInfo['name'];
		      	$cityid  = $siteCityInfo['cityid'];
			    $param = array(
			    		'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
			        	'cityid' => $cityid,
			            'notify' => '管理员消息通知',
			            'fields' =>array(
				            'contentrn'  => $cityName.'分站——education模块——用户:'.$userinfo['username'].' 预约了家教id: '.$tutorid,
				            'date' => date("Y-m-d H:i:s", time()),
				        )
			        );
				//后台消息通知
				updateAdminNotice("education", "yuyue",$param);
				return $langData['education'][7][35];//请等候联系！
			}else{
				return array("state" => 101, "info" => $langData['travel']['12']['34']);//发布到数据时发生错误，请检查字段内容！
			}
		}elseif($oper == 'update'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_yuyue` WHERE `id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__education_yuyue` SET `state` = '1' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					return array("state" => 200, "info" => $langData['travel']['12']['34']); //保存到数据时发生错误，请检查字段内容！
				}
				//微信通知
		        $cityName = $siteCityInfo['name'];
		      	$cityid  = $siteCityInfo['cityid'];
			    $param = array(
			    		'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
			        	'cityid' => $cityid,
			            'notify' => '管理员消息通知',
			            'fields' =>array(
				            'contentrn'  => $cityName.'分站——education模块——用户id:'.$userid.' 更新了预约家教',
				            'date' => date("Y-m-d H:i:s", time()),
				        )
			        );
				//后台消息通知
				updateAdminNotice("education", "yuyue",$param);

				// 清除缓存
				clearCache("education_yuyue_detail", $id);
				checkCache("education_yuyue_list", $id);
				clearCache("education_yuyue_total", 'key');

				return $langData['travel'][12][35];//修改成功！
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}elseif($oper == 'del'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_yuyue` WHERE `id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$results = $results[0];
				// 清除缓存
				clearCache("education_yuyue_detail", $id);
				checkCache("education_yuyue_list", $id);
				clearCache("education_yuyue_total", 'key');

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__education_yuyue` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");

				return array("state" => 100, "info" => $langData['travel'][12][36]);//删除成功！
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}
	}

	/**
	 * 家教预约列表
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
			$sql      = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = $uid");
			$storeRes = $dsql->dsqlOper($sql, "results");
			if(!empty($storeRes[0]['id'])){
				$uid = $storeRes[0]['id'];
			}

			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_tutor` WHERE `userid` = $uid");
			$res = $dsql->dsqlOper($sql, "results");
			if(!empty($res[0]['id'])){
				$where = " AND `tutorid` = " . $res[0]['id'];
			}

		}

		$orderby_ = " ORDER BY `pubdate` DESC, `state` DESC, `id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `username`, `tutorid`, `pubdate`, `state`, `userid`, `tel` FROM `#@__education_yuyue` l WHERE 1 = 1".$where);
		//总条数
		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__education_yuyue` l WHERE 1 = 1".$where);
		//总条数
		$totalCount = getCache("education_yuyue_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
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
		$results = getCache("education_yuyue_list", $sql, 300, array("disabled" => $u));
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']        = $val['id'];
				$list[$key]['tutorid']   = $val['tutorid'];
				$list[$key]['username']  = $val['username'];
				$list[$key]['pubdate']   = $val['pubdate'];
				$list[$key]['state']     = $val['state'];
				$list[$key]['userid']    = $val['userid'];
				$list[$key]['tel']       = $val['tel'];
			}

		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
	 * 课程发布
	 * @return array
	 */
	public function put(){
		global $dsql;
		global $userLogin;
        global $langData;
        global $siteCityInfo;
		require(HUONIAOINC."/config/education.inc.php");
		$state = (int)$customeducationcoursesCheck;

		$param   = $this->param;

		$title         = filterSensitiveWords(addslashes($param['title']));
		$pics          = $param['pics'];
		$typeid        = (int)$param['typeid'];
		$coursesdesc   = filterSensitiveWords(addslashes($param['coursesdesc']));
		$coursesrange  = filterSensitiveWords(addslashes($param['coursesrange']));
		$coursescontent= filterSensitiveWords(addslashes($param['coursescontent']));
		$coursesnotes  = filterSensitiveWords(addslashes($param['coursesnotes']));
		$courses       = $param['courses'];
        $classtype       = $param['classtype'];
        //用户信息
        $uid = $userLogin->getMemberID();
        $loginUid = $uid > 0 ? $uid : 0;
		$userinfo = $loginUid ? $userLogin->getMemberInfo() : array();

		if($uid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		$usertype = 0;
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = $uid ");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$usertype = 1;
			$uid = $ret[0]['id'];
		}else{
            return array("state" => 200, "info" => "您还没未开通教育店铺");
        }

		// 需要支付费用
        $amount = 0;
        // 是否独立支付 普通会员或者付费会员超出限制
        $alonepay = 0;
        $alreadyFabu = 0; // 付费会员当天已免费发布数量
        //权限验证
        if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "education"))) {
            return array("state" => 200, "info" => $langData['info'][1][60]);//'商家权限验证失败！'
        }

        //企业会员或已经升级为收费会员的状态才可以发布 --> 普通会员也可发布
        if ($userinfo['userType'] == 1) {
            $toMax = false;
            // if ($userinfo['level']) {
                $memberLevelAuth = getMemberLevelAuth($userinfo['level']);
                $educationCount       = (int)$memberLevelAuth['education'];
                //统计用户当天已发布数量 @
                // $today    = GetMkTime(date("Y-m-d", time()));
                // $tomorrow = GetMkTime(date("Y-m-d", strtotime("+1 day")));

				//本周
				$today = GetMkTime(date('Y-m-d',(time()-((date('w',time())==0?7:date('w',time()))-1)*24*3600)));
				$tomorrow = $today + 604800;

                $sql      = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__education_courses` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
                $ret      = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $alreadyFabu = $ret[0]['total'];
                    if ($alreadyFabu >= $educationCount) {
                        $toMax = true;
                        // return array("state" => 200, "info" => $langData['info'][1][82]);//'当天发布信息数量已达等级上限！'
                    } else {
                        $state = 1;
                    }
                }
            // }

            // 普通会员或者付费会员当天发布数量达上限
            if ($userinfo['level'] == 0 || $toMax) {

				global $cfg_fabuAmount;
				global $cfg_fabuFreeCount;
				$fabuAmount = $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array();
				$fabuFreeCount = $cfg_fabuFreeCount ? unserialize($cfg_fabuFreeCount) : array();

                //超出免费次数
                if($fabuAmount && (($fabuFreeCount && $fabuFreeCount['education'] <= $alreadyFabu) || !$fabuFreeCount)){
                    $alonepay = 1;
                    $amount = $fabuAmount["education"];
                    $state = 0;   //需要审核
                }

            }
		}

		if (empty($title)) return array("state" => 200, "info" => $langData['education'][6][14]);//请输入课程名
		if (empty($pics)) return array("state" => 200, "info" => $langData['education'][6][15]);//请上传课程照片
		if (empty($courses)) return array("state" => 200, "info" => $langData['education'][6][0]);//请输入班级

        //保存到主表
		$waitpay  = $amount > 0 ? 1 : 0;
		$pubdate = GetMkTime(time());

		$archives = $dsql->SetQuery("INSERT INTO `#@__education_courses` (`usertype`, `userid`, `typeid`, `title`, `pics`, `coursesdesc`, `coursesrange`, `coursescontent`, `coursesnotes`, `pubdate`, `state`, `waitpay`, `alonepay`, `weight`) VALUES ('$usertype', '$uid', '$typeid', '$title', '$pics', '$coursesdesc', '$coursesrange', '$coursescontent', '$coursesnotes', '$pubdate', '$state', '$waitpay', '$alonepay', 1)");
        $aid      = $dsql->dsqlOper($archives, "lastid");
        if (is_numeric($aid)) {

            $urlParam = array(
                'service' => 'education',
                'template' => 'detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);
                
            //记录用户行为日志
            memberLog($uid, 'education', '', $aid, 'insert', '发布课程('.$title.')', $url, $archives);

            autoShowUserModule($uid,'education');  // 教育培训新增课程
			if(!empty($courses)){
			    if ($classtype == 0 ){
                    foreach($courses as $val){
                            $val['openStart'] = GetMkTime($val['openStart']);
                            $val['openEnd']   = GetMkTime($val['openEnd']);
                            $teacherid = (int)$val['teacherid'];
                            $typeid = (int)$val['typeid'];
                            $sql = $dsql->SetQuery("INSERT INTO `#@__education_class` (`classname`, `openStart`, `openEnd`, `coursesid`, `address`, `price`, `teacherid`, `typeid`, `desc`, `classhour`, `pubdate`, `state`,`classtype`) VALUES ('$val[classname]', '$val[openStart]', '$val[openEnd]', '$aid', '$val[address]', '$val[price]', '$teacherid', '$typeid', '$val[desc]', '$val[classhour]', '$pubdate', '1','$classtype')");
                            $dsql->dsqlOper($sql, "update");
                    }
                }else{
                    unset($courses[0]);
                    $manyclass = serialize($courses);
                        $sql = $dsql->SetQuery("INSERT INTO `#@__education_class` ( `coursesid`,`manyclass`,`pubdate`, `state`,`classtype`) VALUES ('$aid','$manyclass','$pubdate', '1','$classtype')");
                        $dsql->dsqlOper($sql, "update");


                }

			}

			//微信通知
		        $cityName = $siteCityInfo['name'];
		      	$cityid  = $siteCityInfo['cityid'];
			    $param = array(
			    		'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
			        	'cityid' => $cityid,
			            'notify' => '管理员消息通知',
			            'fields' =>array(
				            'contentrn'  => $cityName.'分站——education模块——用户:'.$userinfo['username'].' 发布了课程'.$title,
				            'date' => date("Y-m-d H:i:s", time()),
				        )
			        );
				//后台消息通知
				updateAdminNotice("education", "courses",$param);

            if ($userinfo['level']) {
                $auth = array("level" => $userinfo['level'], "levelname" => $userinfo['levelName'], "alreadycount" => $alreadyFabu, "maxcount" => $educationCount);
            } else {
                $auth = array("level" => 0, "levelname" => $langData['info'][1][89], "maxcount" => 0);//普通会员
			}

			clearCache("education_courses_total", 'key');

            if($state){
                updateCache("education_courses_list", 300);
            }
            dataAsync("education",$aid,"list");  // 教育机构、课程、发布
            return array("auth" => $auth, "aid" => $aid, "amount" => $amount);
        } else {
            return array("state" => 101, "info" => $langData['info'][1][90]);//发布到数据时发生错误，请检查字段内容！
        }
	}

	/**
	 * 课程修改
	 * @return array
	 */
	public function edit(){
		global $dsql;
		global $userLogin;
        global $langData;
        global $siteCityInfo;

		require(HUONIAOINC."/config/education.inc.php");
		$state = (int)$customeducationcoursesCheck;

		$param   = $this->param;

		$title         = filterSensitiveWords(addslashes($param['title']));
		$pics          = $param['pics'];
		$id            = $param['id'];
		$typeid        = (int)$param['typeid'];
		$coursesdesc   = filterSensitiveWords(addslashes($param['coursesdesc']));
		$coursesrange  = filterSensitiveWords(addslashes($param['coursesrange']));
		$coursescontent= filterSensitiveWords(addslashes($param['coursescontent']));
		$coursesnotes  = filterSensitiveWords(addslashes($param['coursesnotes']));
		$courses       = $param['courses'];
        $classtype      = (int)$param['classtype'];
        $teacherid     = $param['teacherid '];
        $classid    = $param['classid'];
        //用户信息
        $uid = $userLogin->getMemberID();
        $loginUid = $uid > 0 ? $uid : 0;
		$userinfo = $loginUid ? $userLogin->getMemberInfo() : array();

		if($uid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		$usertype = 0;
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = $uid ");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$usertype = 1;
			$uid = $ret[0]['id'];
		}else{
            return array("state" => 200, "info" => "您还没未开通教育店铺");
		}
		$pubdate = GetMkTime(time());

		if(!is_numeric($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
		if (empty($title)) return array("state" => 200, "info" => $langData['education'][6][14]);//请输入课程名
		if (empty($pics)) return array("state" => 200, "info" => $langData['education'][6][15]);//请上传课程照片
		if (empty($courses)) return array("state" => 200, "info" => $langData['education'][6][0]);//请输入班级

        //保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__education_courses` SET  `usertype` = '$usertype', `typeid` = '$typeid', `title` = '$title', `pics` = '$pics', `coursesdesc` = '$coursesdesc', `coursesrange` = '$coursesrange', `coursescontent` = '$coursescontent', `coursesnotes` = '$coursesnotes', `state` = '$state' WHERE `userid` = '$uid' AND `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            return array("state" => 200, "info" => $langData['info'][1][93]);//保存到数据时发生错误，请检查字段内容！
		}

        $urlParam = array(
            'service' => 'education',
            'template' => 'detail',
            'id' => $id
        );
        $url = getUrlPath($urlParam);
            
        //记录用户行为日志
        memberLog($uid, 'education', '', $id, 'update', '修改课程('.$title.')', $url, $archives);

	        	if(!empty($courses)) {
                       if ($classtype == 0){

                            $ids = array();
                           foreach ($courses as $key => $val) {

							   $key = abs($key - count($courses));  //排序

                               if(!$val['classname']){
                                    continue;
                               }

                               $val['openStart'] = GetMkTime($val['openStart']);
                               $val['openEnd'] = GetMkTime($val['openEnd']);
                               $teacherid = (int)$val['teacherid'];
                               $typeid = (int)$val['typeid'];
                               if(!empty($val['id'])){
                                    array_push($ids, $val['id']);
									$sql = $dsql->SetQuery("UPDATE `#@__education_class` SET  `classname` = '$val[classname]', `openStart` = '$val[openStart]', `openEnd` = '$val[openEnd]', `coursesid` = '$id', `address` = '$val[address]', `price` = '$val[price]', `teacherid` = '$teacherid', `typeid` = '$typeid', `desc` = '$val[desc]', `classhour` = '$val[classhour]', `state` = '1',`classtype` = '$classtype',`pubdate`='$pubdate', `weight` = '$key' WHERE `id` = " . $val['id']);
									$dsql->dsqlOper($sql, "update");
									// $sql = $dsql->SetQuery("UPDATE `#@__education_class` SET `coursesid`='$id',`manyclass` ='',`pubdate`='$pubdate',`state`='1',`classtype` = '$classtype' WHERE `id` = '$classid' ");
									// $dsql->dsqlOper($sql, "update");
								}else{
                                    $sql = $dsql->SetQuery("INSERT INTO `#@__education_class` (`classname`, `openStart`, `openEnd`, `coursesid`, `address`, `price`, `teacherid`, `typeid`, `desc`, `classhour`, `pubdate`, `state`, `weight`) VALUES ('$val[classname]', '$val[openStart]', '$val[openEnd]', '$id', '$val[address]', '$val[price]', '$teacherid', '$typeid', '$val[desc]', '$val[classhour]', '$pubdate', '1', '$key')");
                                    $lastid = $dsql->dsqlOper($sql, "lastid");
                                    array_push($ids, $lastid);
                               }
                           }

                           //删除不要的课程
                           if($ids){
                            $_ids = join(',', $ids);
                            $sql = $dsql->SetQuery("DELETE FROM  `#@__education_class` WHERE `id` NOT IN (".$_ids.") AND `coursesid` = $id");
                            $dsql->dsqlOper($sql, "update"); 
                           }
                           
                       }else {
                           unset($courses[0]);
                           $manyclass = serialize($courses);
                            $tea = [];
                           foreach ($courses as $val) {
                               $tea[] = $val['teacherid'];
                           }
                           $teacher = implode(',',$tea);
                           $sql = $dsql->SetQuery("UPDATE `#@__education_class` SET `coursesid`='$id',`manyclass` ='$manyclass',`pubdate`='$pubdate',`state`='1',`classtype` = '$classtype',`teacherid` = '$teacher' WHERE `id` = '$classid' ");
                               $dsql->dsqlOper($sql, "update");
                           $updatesql = $dsql->SetQuery("UPDATE `#@__education_class` SET  `classname` = '', `openStart` = '', `openEnd` = '', `coursesid` = '$id', `address` = '', `price` = '', `teacherid` = '$teacher', `typeid` = '$typeid', `desc` = '', `classhour` = '', `state` = '1',`classtype` = '$classtype' WHERE `id` = $classid ");
                           $dsql->dsqlOper($updatesql, "update");



                       }
           }
		//微信通知
		    $cityName = $siteCityInfo['name'];
		    $cityid  = $siteCityInfo['cityid'];
			$param = array(
			    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
			    'cityid' => $cityid,
			    'notify' => '管理员消息通知',
			    'fields' =>array(
				'contentrn'  => $cityName.'分站——education模块——用户:'.$userinfo['username'].' 更新了课程id:'.$id,
				'date' => date("Y-m-d H:i:s", time()),
				)
			);
		//后台消息通知
		updateAdminNotice("education", "courses",$param);

		// 清除缓存
		clearCache("education_courses_detail", $id);
		checkCache("education_courses_list", $id);
		clearCache("education_courses_total", 'key');
        dataAsync("education",$id,"list");  // 教育、课程、修改

        return $langData['info'][1][94];//修改成功！
	}

	/**
     * 删除课程
     * @return array
     */
    public function del(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id = $this->param['id'];

        if (!is_numeric($id)) return array("state" => 200, "info" => $langData['info'][1][58]);

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = $uid ");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$usertype = 1;
			$uid = $ret[0]['id'];
		}

        $archives = $dsql->SetQuery("SELECT * FROM `#@__education_courses` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $results = $results[0];
            if ($results['userid'] == $uid) {
                //如果已经竞价，不可以删除
                if ($results['isbid'] == 1) {
                    return array("state" => 101, "info" => $langData['info'][1][95]);//竞价状态的信息不可以删除！
                }

				delPicFile($results['pics'], "delAtlas", "education");

				$archives = $dsql->SetQuery("DELETE FROM `#@__education_class` WHERE `coursesid` = " . $id);
                $dsql->dsqlOper($archives, "update");

                //删除表
                $archives = $dsql->SetQuery("DELETE FROM `#@__education_courses` WHERE `id` = " . $id);
				$dsql->dsqlOper($archives, "update");
                    
                //记录用户行为日志
                memberLog($uid, 'education', '', $id, 'delete', '删除课程('.$results['title'].')', '', $archives);



				// 清除缓存
				clearCache("education_courses_detail", $id);
				checkCache("education_courses_list", $id);
				clearCache("education_courses_total", 'key');
                dataAsync("education",$id,"list");  // 教育、课程、删除

                return array("state" => 100, "info" => $langData['info'][1][96]);//删除成功！
            } else {
                return array("state" => 101, "info" => $langData['info'][1][97]);//权限不足，请确认帐户信息后再进行操作！
            }
        } else {
            return array("state" => 101, "info" => $langData['info'][1][98]);//信息不存在，或已经删除！
        }

	}

	/**
     * 课程列表
     * @return array
     */
	public function coursesList(){
		global $dsql;
		global $langData;
		global $userLogin;
		$pageinfo = $list = array();
		$whereStore = $addrid = $business= $typeid= $ctypeid= $price= $store = $keywords = $orderby = $u = $uid = $state = $page = $pageSize = $where = $where1 = "";

		$loginUid = $userLogin->getMemberID();
		$userinfo = $userLogin->getMemberInfo();
		//$re = RemoveXSS($_REQUEST);
		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
			}else{
				$usertype  = $this->param['usertype'];
				$addrid    = (int)$this->param['addrid'];
				$business  = (int)$this->param['business'];
				$store     = (int)$this->param['store'];
				$typeid    = (int)$this->param['typeid'];
				$ctypeid   = (int)$this->param['ctypeid'];
				$teacherid = (int)$this->param['teacherid'];
				$keywords  = $this->param['keywords'];
				$price     = $this->param['price'];
				$orderby   = (int)$this->param['orderby'];
				$u         = (int)$this->param['u'];
				$uid       = (int)$this->param['uid'];
				$state     = $this->param['state'];
				$page      = (int)$this->param['page'];
				$pageSize  = (int)$this->param['pageSize'];
			}
		}
		if($usertype!=''){
            $usertype = (int)$usertype;
			$where .= " AND l.`usertype` = '$usertype'";

		}

		if($uid!=""){

			$loginUid = $uid;
		}

		if($u!=1){

			//数据共享
			require(HUONIAOINC."/config/education.inc.php");
			$dataShare = (int)$customDataShare;

			if(!$dataShare){
				$cityid = getCityId($this->param['cityid']);
			}

			$where .= " AND l.`state` = 1 AND l.`waitpay` = 0 ";
			if(!empty($addrid)){
				if (!empty($business)) {
					$addrid = $business;
				}
				if($dsql->getTypeList($addrid, "site_area")){
					global $arr_data;
					$arr_data = array();
					$lower = arr_foreach($dsql->getTypeList($addrid, "site_area"));
					$lower = $addrid.",".join(',',$lower);

				}else{
						$lower = $addrid;
				}

				$whereStore .= " AND `addrid` in ($lower)";
			}
			if($cityid){
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `state` = 1 AND `cityid` = $cityid $whereStore");
				$results = $dsql->dsqlOper($archives, "results");
				if(is_array($results)){
					foreach ($results as $key => $value) {
						$sidArr[$key] = $value['id'];
					}
					if(!empty($sidArr)){
						if($usertype===0){
							$where .= " AND l.`usertype` = 0";
						}elseif($usertype==1){
							$where .= " AND (l.`usertype` = 1 AND l.`userid` in (".join(",",$sidArr)."))";
						}elseif($usertype===null){
							$where .= " AND (l.`usertype` = 0 OR (l.`usertype` = 1 AND l.`userid` in (".join(",",$sidArr).")))";
						}
					}else{
						if($usertype==1){
							$where .= " AND l.`usertype` = 1";
						}else{
							$where .= " AND l.`usertype` = 0";
						}
					}
				}else{
					if($usertype==1){
						$where .= " AND l.`usertype` = 1";
					}else{
						$where .= " AND l.`usertype` = 0";
					}
				}
			}

			if($store){//详情页面
				$where = " AND l.`state` = 1 AND l.`waitpay` = 0 AND l.`userid` = '$store'";
			}

			if($teacherid){
				$teacherArr = array();
				$where1 = " AND FIND_IN_SET(".$teacherid.", c.`teacherid`) ";
				$sql = $dsql->SetQuery("SELECT c.`coursesid` FROM `#@__education_class` c WHERE 1 = 1 $where1 ");
				$res = $dsql->dsqlOper($sql, "results");
				if(is_array($res) && !empty($res)){
					foreach ($res as $key => $value) {
						$teacherArr[$key] = $value['coursesid'];
					}
					if(!empty($teacherArr)){
						$where = " AND l.`state` = 1 AND l.`waitpay` = 0 AND l.`id` in (".join(",",$teacherArr).")";
					}
				}else{
					return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！
				}
			}

		}else{

			if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "education"))){
				return array("state" => 200, "info" => $langData['travel'][12][14]);//商家权限验证失败
			}

			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = $loginUid");
			$storeRes = $dsql->dsqlOper($sql, "results");
			if($storeRes){
				$where .= " AND l.`usertype` = 1 AND l.`userid` = ".$storeRes[0]['id'];
			}else{
				$where .= " AND l.`usertype` = 0 AND l.`userid` = ".$loginUid;
			}

		}
		//遍历分类
        if (!empty($typeid)) {
            if ($dsql->getTypeList($typeid, "education_type")) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($dsql->getTypeList($typeid, "education_type"));
                $lower    = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }
            $where .= " AND l.`typeid` in ($lower)";
        }
        if (!empty($ctypeid)) {
        	$ctypeid = (int)$ctypeid;
            if ($dsql->getTypeList($ctypeid, "education_item")) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($dsql->getTypeList($ctypeid, "education_item"));
                $lower    = $ctypeid . "," . join(',', $lower);
            } else {
                $lower = $ctypeid;
            }
            $where .= " AND c.`typeid` in ($lower)";
        }
		//模糊查询关键字
		if(!empty($keywords)){
			//搜索记录
			if(!empty($keywords)){
				siteSearchLog("education", $keywords);
			}

			$sidArr = array();
	        $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__education_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$keywords%' OR `store`.address like '%$keywords%'");
	        $results = $dsql->dsqlOper($userSql, "results");
	        foreach ($results as $key => $value) {
	            $sidArr[$key] = $value['id'];
	        }

	        if(!empty($sidArr)){
	            $where .= " AND (`title` like '%$keywords%' OR `userid` in (".join(",",$sidArr)."))";
	        }else{
	            $where .= " AND (`title` like '%$keywords%' )";
			}
		}
		// var_dump($where);die;
		// $price = $_REQUEST['price'];
		//价格区间
		// if($price != ""){
		// 	// $price = explode(",", $price);
		// 	$price = explode(",",$price);
		// 	if(!empty($price[1])){
		// 		$where .= " AND `price` BETWEEN " . $price[0] . " AND " . $price[1];
		// 	}else{
		// 		$where .= " AND `price` < " . $price[0];
		// 	}
		// }


        $price = convertArrToStrWithComma($price);
		if($price){
			$price = explode(",", $price);
			if(empty($price[0])){
				$where .= " AND `price` < " . $price[1];
			}elseif(empty($price[1])){
				$where .= " AND `price` > " . $price[0];
			}else{
				$where .= " AND `price` BETWEEN " . $price[0] . " AND " . $price[1];
			}
		}

		// var_dump($where);die;
		//取当前星期，当前时间
		$time = time();
		$week = date('w', time());
		$hour = (int)date('H');
		$ob = "l.`bid_week{$week}` = 'all'";
		if($hour > 8 && $hour < 20){
			$ob .= " or l.`bid_week{$week}` = 'day'";
		}
		$ob = "($ob)";
		if(!empty($orderby)){
			//发布时间
			if($orderby == 1){
				$orderby = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`rec` DESC, l.`pubdate` DESC, l.`weight` DESC, l.`id` DESC";
				$orderby = " ORDER BY l.`rec` DESC, l.`pubdate` DESC, l.`weight` DESC, l.`id` DESC";
			//价格升序
			}elseif($orderby == 2){
				$orderby = " ORDER BY `price` ASC, l.`weight` DESC, l.`id` DESC";
				// $orderby = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, `price` ASC, l.`weight` DESC, l.`id` DESC";
			//价格降序
			}elseif($orderby == 3){
				$orderby = " ORDER BY `price` DESC, l.`weight` DESC, l.`id` DESC";
				// $orderby = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, `price` DESC, l.`weight` DESC, l.`id` DESC";
			//点击
			}elseif($orderby == "5"){
				$orderby = " ORDER BY l.`click` DESC, l.`weight` DESC, l.`id` DESC";
			//最短里程
			}elseif($orderby == 4){
				// $orderby = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, `sale` ASC, l.`weight` DESC, l.`id` DESC";
				$orderby = " ORDER BY `sale` DESC, l.`weight` DESC, l.`id` DESC";
			}
		}else{
			$orderby = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and `bid_start` <= $time and $ob then 1 else 2 end, l.`weight` DESC, l.`id` DESC";
		}
		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;
		$archives = $dsql->SetQuery("SELECT  distinct l.`id`,c.`id` as cid, l.`usertype`, l.`userid`, l.`typeid`, c.`typeid` as ctypeid,l.`title`, l.`pics`, l.`click`, l.`pubdate`, l.`state`, l.`rec`, l.`isbid`, l.`bid_type`,c.`price`, l.`bid_price`, l.`bid_start`, l.`bid_end`, l.`bid_week0`, l.`bid_week1`, l.`bid_week2`, l.`bid_week3`, l.`bid_week4`, l.`bid_week5`, l.`bid_week6`, l.`waitpay`, l.`alonepay`, l.`refreshSmart`, l.`refreshCount`, l.`refreshTimes`, l.`refreshPrice`, l.`refreshBegan`, l.`refreshNext`, l.`refreshSurplus`, l.`refreshFree`, c.`openStart`, c.`openEnd`,c.`manyclass`, (SELECT min(c.`price`) FROM `#@__education_class` c WHERE c.`state` = '1' AND c.`coursesid` = l.`id`) AS price, (SELECT sum(c.`sale`) FROM `#@__education_class` c WHERE c.`coursesid` = l.`id`) AS sale FROM `#@__education_courses` l left join `#@__education_class` c on l.`id` = c.`coursesid` WHERE 1=1" . $where);
		//print_R($archives);exit;
		//总条数
		$totalCount = getCache("education_courses_total", $archives.$where1." GROUP BY `id`", 300, array("savekey" => 1, "type" => "totalCount", "disabled" => $u));
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
		if($u == 1 && $userLogin->getMemberID() > -1){
			//待审核
			$totalGray = $dsql->dsqlOper($archives.$where1." AND l.`state` = 0 GROUP BY `id`", "totalCount");
			//已审核
			$totalAudit = $dsql->dsqlOper($archives.$where1." AND l.`state` = 1 GROUP BY `id`", "totalCount");
			//拒绝审核
			$totalRefuse = $dsql->dsqlOper($archives.$where1." AND l.`state` = 2 GROUP BY `id`", "totalCount");

			$pageinfo['gray'] = $totalGray;
			$pageinfo['audit'] = $totalAudit;
			$pageinfo['refresh'] = $totalRefuse;
		}
		$atpage = $pageSize*($page-1);
		$where = $pageSize != -1 ? " LIMIT $atpage, $pageSize" : "";

        $where2 = '';
        if($state != ''){
            $where2 = " AND l.`state` = ".$state;
        }

		$sql = $dsql->SetQuery($archives.$where1.$where2." GROUP BY l.`id`".$orderby.$where);
		// var_dump($sql);die;
		$results = getCache("education_courses_list", $sql, 300, array("disabled" => $u));
		// var_dump($results);die;
		if($results){
			$now = GetMkTime(time());
			foreach($results as $key => $val){

				$list[$key]['id']     = $val['id'];
				$list[$key]['title']  = $val['title'];
				$list[$key]['price']  = $val['price'] ? $val['price'] : 0;
				$list[$key]['pubdate']= $val['pubdate'];
				$list[$key]['click']  = $val['click'];
				$list[$key]['usertype']= $val['usertype'];
				$list[$key]['userid'] = $val['userid'];
				$list[$key]['rec']    = $val['rec'];
				$list[$key]['openStart'] = $val['openStart'];
				$list[$key]['openEnd'] = $val['openEnd'];
				$list[$key]['sale']   = $val['sale'] ? $val['sale'] : 0;
                $list[$key]['manyclass'] = $val['manyclass'];
				$classmany = unserialize($val['manyclass']);
                if ($classmany){
                    foreach($classmany as $ky => $vl){
                        $list[$key]['openStart']  =strtotime("$vl[openStart]");
                        $list[$key]['openEnd']  =strtotime("$vl[openEnd]");

                    }
                }
                $classname = '';
				$coursetype = '';
				$sql = $dsql->SetQuery("SELECT `typeid` FROM `#@__education_class` WHERE `id` = '".$val['cid']."' ORDER BY  `weight` DESC, `pubdate` DESC, `id` ASC limit 0,1");
				$res = $dsql->dsqlOper($sql, "results");
				if(!empty($res)){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = '".$res[0]['typeid']."'");
					$ret = $dsql->dsqlOper($sql, "results");
					$classname = $ret[0]['typename'];
				}else{
					$classname = '';
				}
				// var_dump($classname);
				$list[$key]['classname']   = $classname;

				$sql = $dsql->SetQuery("SELECT `typeid` FROM `#@__education_courses` WHERE `id` = '".$val['id']."' ORDER BY  `weight` DESC, `pubdate` DESC limit 0,1");
				$ress = $dsql->dsqlOper($sql, "results");
				if(!empty($ress)){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_type` WHERE `id` = '".$ress[0]['typeid']."'");
					$rett = $dsql->dsqlOper($sql, "results");
					$coursetype = $rett[0]['typename'];
				}
				$list[$key]['coursetype']   = $coursetype;
				$userArr = array();
				if($val['usertype']==1){
					$archives = $dsql->SetQuery("SELECT m.`nickname`, m.`photo`, m.`phone`, m.`certifyState`, m.`sex`, zjcom.`tel`, zjcom.`title`, zjcom.`pics`, zjcom.`address`,  zjcom.`id` zjcomid, zjcom.addrid  FROM `#@__member` m LEFT JOIN `#@__education_store` zjcom ON m.`id` = zjcom.`userid` WHERE zjcom.`state` = 1 AND zjcom.`id` = ".$val['userid']);
					$member = $dsql->dsqlOper($archives, "results");
					if($member){
						$picsc = $member[0]['pics'];
						if(!empty($picsc)){
							$picsc = explode(",", $picsc);
						}
						$photo = !empty($picsc) ? getFilePath($picsc[0]) : '';
						$telArr    = explode(',', $member[0]['tel']);
						$phone     = $telArr[0] ? $telArr[0] : $member[0]['phone'];
						$address   = $member[0]['address'];
						$title     = $member[0]['title'];
						$zjcomid   = $member[0]['zjcomid'];

						if(!empty($member[0]['addrid'])){
							$addrName = getParentArr("site_area", $member[0]['addrid']);
							global $data;
							$data = "";
							$addrArr = array_reverse(parent_foreach($addrName, "typename"));
							$addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
							$addrname  = $addrArr;
						}else{
							$addrname = "";
						}

					}

					$url = getUrlPath(array("service" => "education", "template" => "store-detail", "id" => $zjcomid));

					$userArr['url']       = $url;
					$userArr['photo']     = $photo;
					$userArr['phone']     = $phone;
					$userArr['address']   = $address;
					$userArr['addrname']  = $addrname;
					$userArr['title']     = $title;

					//店铺详情
					$this->param = $val['userid'];
					$list[$key]['store'] = $this->storeDetail();
				}else{
					$archives = $dsql->SetQuery("SELECT `nickname`, `photo`, `certifyState`, `phone`, `phoneCheck` FROM `#@__member`  WHERE  `id` = ".$val['userid']);
					$member   = $dsql->dsqlOper($archives, "results");
					if($member){
						$nickname  = $results[0]['username'] ? $results[0]['username'] : $member[0]['nickname'];
						$photo     = getFilePath($member[0]['photo']);
						$phone     = $member[0]['phone'];
						$certify   = $member[0]['certifyState'] == 1 ? 1 : 0;
						$phoneCheck= $member[0]['phoneCheck'] == 1 ? 1 : 0;
					}
					$userArr['nickname']  = $nickname;
					$userArr['photo']     = $photo;
					$userArr['phone']     = $phone;
					$userArr['certify']   = $certify;
					$userArr['phoneCheck']= $phoneCheck;
				}
				$list[$key]['user'] = $userArr;

				if(!empty($val['pics'])){
                    $picsArr = explode(',', $val['pics']);
                    $picsArr = explode('|', $picsArr[0]);
					$list[$key]['litpic']    = getFilePath($picsArr[0]);
				}

				$isbid = (int)$val['isbid'];
				//计划置顶需要验证当前时间点是否为置顶状态，如果不是，则输出为0
				if($val['bid_type'] == 'plan'){
					if($val['bid_week' . $week] == '' || ($val['bid_start'] > $now && !$u) || ($val['bid_week' . $week] == 'day' && ($hour < 8 || $hour > 20))){
						$isbid = 0;
					}
				}
				$list[$key]['isbid']    = $isbid;

				//会员中心显示信息状态
				if($u == 1 && $userLogin->getMemberID() > -1){
					$list[$key]['state'] = $val['state'];

					//显示置顶信息
					if($isbid){
						$list[$key]['bid_type']  = $val['bid_type'];
						$list[$key]['bid_price'] = $val['bid_price'];
						$list[$key]['bid_start'] = $val['bid_start'];
						$list[$key]['bid_end']   = $val['bid_end'];

						//计划置顶详细
						if($val['bid_type'] == 'plan'){
							$tp_beganDate = date('Y-m-d', $val['bid_start']);
							$tp_endDate = date('Y-m-d', $val['bid_end']);

							$diffDays = (int)(diffBetweenTwoDays($tp_beganDate, $tp_endDate) + 1);
							$tp_planArr = array();

							$weekArr = array('周日', '周一', '周二', '周三', '周四', '周五', '周六');

							//时间范围内每天的明细
							for ($i = 0; $i < $diffDays; $i++) {
								$began = GetMkTime($tp_beganDate);
								$day = AddDay($began, $i);
								$week = date("w", $day);

								if($val['bid_week' . $week]){
									array_push($tp_planArr, array(
										'date' => date('Y-m-d', $day),
										'week' => $weekArr[$week],
										'type' => $val['bid_week' . $week],
										'state' => $day < GetMkTime(date('Y-m-d', time())) ? 0 : 1
									));
								}
							}

							$list[$key]['bid_plan'] = $tp_planArr;
						}
					}

					//智能刷新
					$refreshSmartState = (int)$val['refreshSmart'];
					if($val['refreshSurplus'] <= 0){
						$refreshSmartState = 0;
					}
					$list[$key]['refreshSmart'] = $refreshSmartState;
					if($refreshSmartState){
						$list[$key]['refreshCount'] = $val['refreshCount'];
						$list[$key]['refreshTimes'] = $val['refreshTimes'];
						$list[$key]['refreshPrice'] = $val['refreshPrice'];
						$list[$key]['refreshBegan'] = $val['refreshBegan'];
						$list[$key]['refreshNext'] = $val['refreshNext'];
						$list[$key]['refreshSurplus'] = $val['refreshSurplus'];
					}

                    $list[$key]['waitpay'] = $val['waitpay'];
				}

				$param = array(
					"service"     => "education",
					"template"    => "detail",
					"id"          => $val['id']
				);
				$list[$key]['url']        = getUrlPath($param);

				$collect = "";
            	if($loginUid != -1){
	                //验证是否已经收藏
					$params = array(
						"module" => "education",
						"temp"   => "detail",
						"type"   => "add",
						"id"     => $val['id'],
						"check"  => 1
					);
					$collect = checkIsCollect($params);
				}
				$list[$key]['collect'] = $collect == "has" ? 1 : 0;
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
     * 课程详细
     * @return array
     */
	public function detail(){
		global $dsql;
		global $langData;
		$id = $this->param;
		$storeDetail = array();
		$id = is_numeric($id) ? $id : $id['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误

		$where = " AND `waitpay` = 0";

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `usertype`, `userid`, `typeid`, `pics`, `coursesdesc`, `coursesrange`, `coursescontent`, `coursesnotes`, `click`, `pubdate`, `state`, `rec`  FROM `#@__education_courses` WHERE `id` = ".$id.$where);
		$results  = getCache("education_courses_detail", $archives, 0, $id);
		if($results){
			$storeDetail["id"]       			= $results[0]['id'];
			$storeDetail["title"]    			= $results[0]['title'];
			$storeDetail["usertype"]    		= $results[0]['usertype'];
			$storeDetail["userid"]			    = $results[0]['userid'];
			$storeDetail["typeid"]    		    = $results[0]['typeid'];
			$storeDetail["coursesdesc"]   	    = nl2br($results[0]['coursesdesc']);
			$storeDetail["coursesrange"]   	    = nl2br($results[0]['coursesrange']);
			$storeDetail["coursescontent"]      = nl2br($results[0]['coursescontent']);
			$storeDetail["coursesnotes"]   	    = nl2br($results[0]['coursesnotes']);
			$storeDetail["click"]   		    = $results[0]['click'];
			$storeDetail["pubdate"]   		    = $results[0]['pubdate'];
			$storeDetail["state"]   			= $results[0]['state'];
			$storeDetail["rec"]   		        = $results[0]['rec'];




			$sql = $dsql->SetQuery("SELECT sum(`sale`) sale  FROM `#@__education_class` WHERE `coursesid` = '$id'");
			$res = $dsql->dsqlOper($sql, "results");
			$storeDetail["sale"] = $res[0]['sale'] ? $res[0]['sale'] : 0;

			$userArr = array();
			if($results[0]['usertype']==1){
				$archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`photo`, m.`phone`, m.`certifyState`, m.`sex`, zjcom.`tel`, zjcom.`title`, zjcom.`pics`, zjcom.`address`,  zjcom.`id` zjcomid, zjcom.addrid  FROM `#@__member` m LEFT JOIN `#@__education_store` zjcom ON m.`id` = zjcom.`userid` WHERE zjcom.`state` = 1 AND zjcom.`id` = ".$results[0]['userid']);
				$member = $dsql->dsqlOper($archives, "results");
				if($member){
					$picsc = $member[0]['pics'];
					if(!empty($picsc)){
						$picsc = explode(",", $picsc);
					}
					$photo = !empty($picsc) ? getFilePath($picsc[0]) : '';
					$telArr    = explode(',', $member[0]['tel']);
					$phone     = $telArr[0] ? $telArr[0] : $member[0]['phone'];
					$address   = $member[0]['address'];
					$title     = $member[0]['title'];
					$memberid  = $member[0]['id'];
					$zjcomid   = $member[0]['zjcomid'];

					if(!empty($member[0]['addrid'])){
						$addrName = getParentArr("site_area", $member[0]['addrid']);
						global $data;
						$data = "";
						$addrArr = array_reverse(parent_foreach($addrName, "typename"));
						$addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
						$addrname  = $addrArr;
					}else{
						$addrname = "";
					}

				}

				$url = getUrlPath(array("service" => "education", "template" => "store-detail", "id" => $zjcomid));

				$userArr['url']       = $url;
				$userArr['photo']     = $photo;
				$userArr['userid']    = $memberid;
				$userArr['phone']     = $phone;
				$userArr['address']   = $address;
				$userArr['addrname']  = $addrname;
				$userArr['title']     = $title;

				//店铺详情
				$this->param = $results[0]['userid'];
				$storeDetail['store'] = $this->storeDetail();

			}else{
				$archives = $dsql->SetQuery("SELECT `id`, `nickname`, `photo`, `certifyState`, `phone`, `phoneCheck` FROM `#@__member`  WHERE  `id` = ".$results[0]['userid']);
				$member   = $dsql->dsqlOper($archives, "results");
				if($member){
					$nickname  = $results[0]['username'] ? $results[0]['username'] : $member[0]['nickname'];
					$photo     = getFilePath($member[0]['photo']);
					$phone     = $member[0]['phone'];
					$memberid  = $member[0]['id'];
					$certify   = $member[0]['certifyState'] == 1 ? 1 : 0;
					$phoneCheck= $member[0]['phoneCheck'] == 1 ? 1 : 0;
				}
				$userArr['nickname']  = $nickname;
				$userArr['userid']    = $memberid;
				$userArr['photo']     = $photo;
				$userArr['phone']     = $phone;
				$userArr['certify']   = $certify;
				$userArr['phoneCheck']= $phoneCheck;

			}
			$storeDetail['user'] = $userArr;

			$typename = '';
			if($results[0]['typeid']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_type` WHERE `id` = " . $results[0]['typeid']);
				$Res = $dsql->dsqlOper($sql, "results");
				$typename = $Res[0]['typename'];
			}
			$storeDetail['typename']= $typename;

			$workArr = $teacherArr = [];
			$classArr = [];
			$sql = $dsql->SetQuery("SELECT `id`, `classname`, `openStart`, `openEnd`, `coursesid`, `address`, `price`, `teacherid`, `typeid`, `desc`, `classhour`,`classtype`,`manyclass` FROM `#@__education_class` WHERE `coursesid` = '$id' ORDER BY  `weight` DESC, `pubdate` DESC, `id` ASC");
			$res = $dsql->dsqlOper($sql, "results");
			if(!empty($res)){
				foreach($res as $key=> $val){
					$workArr[$key]['id']           = $val['id'];
					$workArr[$key]['classname']    = $val['classname'];
					$workArr[$key]['price']        = $val['price'];
					$workArr[$key]['coursesid']    = $val['coursesid'];
					$workArr[$key]['address']      = $val['address'];
					$workArr[$key]['teacherid']    = $val['teacherid'];
					$workArr[$key]['typeid']       = $val['typeid'];
					$workArr[$key]['desc']         = $val['desc'];
					$workArr[$key]['classhour']    = $val['classhour'];
                    $workArr[$key]['classtype']       = $val['classtype'];
                    $storeDetail["classid"]   		  = $val['id'];
                    $storeDetail["classtype"]   		  = $val['classtype'];

                    $teacharr = unserialize($val['manyclass']);
                    if ($teacharr){
                        $storeDetail["countclasstype"]  = count($teacharr);
                    }
                    if ($teacharr){
                        $peice = [];
                        foreach($teacharr  as $ky=> $v) {
                            $teacharr[$ky]['openStart'] = $v['openStart'] ? date("Y-m-d", $v['openStart']) : '';
                            $teacharr[$ky]['openEnd'] = $v['openEnd'] ? date("Y-m-d", $v['openEnd']) : '';
                            $typename = '';
                            if($v['typeid']){
                                $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = " . $v['typeid']);
                                $Res = $dsql->dsqlOper($sql, "results");
                                $typename = $Res[0]['typename'];
                            }
                            $teacharr[$ky]['typename']= $typename;
                            $teacharr[$ky]['id']= $val['id'];
                            $peice [] = $v['price'];



                            if($v['teacherid'] && !strstr($v['teacherid'], 'Array')) {
                                $sql = $dsql->SetQuery("SELECT `id`, `name`, `photo`, `sex`, `courses`, `degreestate`, `certifyState` FROM `#@__education_teacher` WHERE  `id` in ($v[teacherid]) ORDER BY  `weight` DESC, `pubdate` DESC, `id` DESC");
                                $ret = $dsql->dsqlOper($sql, "results");
                                foreach($ret as $k=>$vl) {
                                    $param = array(
                                        "service"     => "education",
                                        "template"    => "teacher-detail",
                                        "id"          => $vl['id']
                                    );
                                    $teacherArr[$k]['url']            = getUrlPath($param);
                                    $teacherArr[$k]['certifyState']   = $vl['certifyState'];
                                    $teacherArr[$k]['degreestate']    = $vl['degreestate'];
                                    $teacherArr[$k]['courses']        = $vl['courses'];
                                    $teacherArr[$k]['sex']            = $vl['sex'];
                                    $teacherArr[$k]['name']           = $vl['name'];
                                    $teacherArr[$k]['photo']          = getFilePath($vl['photo']);
                                    $teacharr[$ky]['teachername'] .= $vl['name'] . ',';
                                    $teacharr[$ky]['teachername'] = rtrim($teacharr[$ky]['teachername'], ',');
                                }
                            }
                        }
                        $price = min($peice);
                        $storeDetail["price"] = $price ? $price : 0;

                    }

                    $sql = $dsql->SetQuery("SELECT min(`price`) price  FROM `#@__education_class` WHERE `coursesid` = '$id'");
                    $res = $dsql->dsqlOper($sql, "results");
                    $storeDetail["price"] = $res[0]['price'] ? $res[0]['price'] : 0;
                    $workArr[$key]["openStart"]    = $val['openStart'] ? date("Y-m-d", $val['openStart']) : '';
                    $workArr[$key]["openEnd"]	   = $val['openEnd'] ? date("Y-m-d", $val['openEnd']) : '';
                    $classArr[$key]['manyclass']       = $teacharr;

                    $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = " . $val['typeid']);
					$Res = $dsql->dsqlOper($sql, "results");
					$workArr[$key]['typename']     = $Res[0]['typename'] ? $Res[0]['typename'] : '';

					$param = array(
						"service"     => "education",
						"template"    => "class-detail",
						"id"          => $val['id']
					);
					$workArr[$key]['url']            = getUrlPath($param);

                    if($val['teacherid'] && !strstr($val['teacherid'], 'Array') && $val['teacherid'] != ','){
                        $sql = $dsql->SetQuery("SELECT `id`, `name`, `photo`, `sex`, `courses`, `degreestate`, `certifyState` FROM `#@__education_teacher` WHERE  `id` in ($val[teacherid]) ORDER BY  `weight` DESC, `pubdate` DESC, `id` DESC");
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							foreach($ret as $k=>$val){
								$param = array(
									"service"     => "education",
									"template"    => "teacher-detail",
									"id"          => $val['id']
								);
								$teacherArr[$k]['url']            = getUrlPath($param);
								$teacherArr[$k]['certifyState']   = $val['certifyState'];
								$teacherArr[$k]['degreestate']    = $val['degreestate'];
								$teacherArr[$k]['courses']        = $val['courses'];
								$teacherArr[$k]['sex']            = $val['sex'];
								$teacherArr[$k]['name']           = $val['name'];
								$teacherArr[$k]['photo']          = getFilePath($val['photo']);

								$workArr[$key]['teachername']    .= $val['name'].',';

                            }
							$workArr[$key]['teacherArr']  = $teacherArr;
							$workArr[$key]['teachername'] = rtrim($workArr[$key]['teachername'], ',');

                        }
					}
                    $workArr[$key]['manyclass'] = $teacharr;

                }
			}


            $storeDetail["workArr"]         = $workArr;
            $storeDetail["classArr"]         = $classArr;
            if (!empty($results[0]['pics'])) {
				$picsArr = explode(',', $results[0]['pics']);
                $imglist = array();
                foreach ($picsArr as $key => $value) {
                    $_pics = explode('|', $value);
                    $imglist[$key]["path"]       = getFilePath($_pics[0]);
                    $imglist[$key]["pathSource"] = $_pics[0];
                    $imglist[$key]["info"] = $_pics[1];
                }
            } else {
                $imglist = array();
            }

            $storeDetail["pics"] = $imglist;

			//验证是否已经收藏
			$params = array(
				"module" => "education",
				"temp"   => "detail",
				"type"   => "add",
				"id"     => $id,
				"check"  => 1
			);
			$collect = checkIsCollect($params);
			$storeDetail['collect'] = $collect == "has" ? 1 : 0;

			return $storeDetail;
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][20][282]);//信息不存在
		}
	}

	/**
     * 班级列表
     * @return array
     */
	public function classList(){
		global $dsql;
		global $langData;
		global $userLogin;
		$pageinfo = $list = array();

		$store = $keywords = $orderby = $u = $uid = $state = $page = $pageSize = $where = $where1 = "";

		$loginUid = $userLogin->getMemberID();
		$userinfo = $userLogin->getMemberInfo();

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
			}else{
				$coursesid = $this->param['coursesid'];
				$u         = $this->param['u'];
				$orderby   = $this->param['orderby'];
				$page      = $this->param['page'];
				$pageSize  = $this->param['pageSize'];
			}
		}

		// $where .= " AND `state` = 1";

		if($coursesid){
			$where .= " AND `coursesid` = '$coursesid'";
		}

		if(!empty($orderby)){
			//发布时间
			if($orderby == 1){
				$orderby = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
			//价格升序
			}elseif($orderby == 2){
				$orderby = " ORDER BY `price` ASC, `weight` DESC, `id` DESC";
			//价格降序
			}elseif($orderby == 3){
				$orderby = " ORDER BY `price` DESC, `weight` DESC, `id` DESC";
			//点击
			}elseif($orderby == 4){
				$orderby = " ORDER BY `click` DESC, `weight` DESC, `id` DESC";
			}
		}else{
			$orderby = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `classname`, `openStart`, `openEnd`, `coursesid`, `address`, `price`, `teacherid`, `typeid`, `classhour`, `pubdate`, `click`,`manyclass`  FROM `#@__education_class`  WHERE 1=1" . $where);
        $coun = $dsql->dsqlOper($archives, "results");

        if($coun[0]['manyclass']){
            $class = unserialize($coun[0]['manyclass']);
            $countmany =count($class);
            $totalCount = $countmany;
        }else{
            //总条数
            $totalCount = getCache("education_class_total", $archives, 300, array("savekey" => 1, "type" => "totalCount", "disabled" => $u));
        }

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
		if($u == 1 && $userLogin->getMemberID() > -1){
			//待审核
			$totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
			//已审核
			$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");
			//拒绝审核
			$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

			$pageinfo['gray'] = $totalGray;
			$pageinfo['audit'] = $totalAudit;
			$pageinfo['refresh'] = $totalRefuse;
		}

		$atpage = $pageSize*($page-1);
		$where = $pageSize != -1 ? " LIMIT $atpage, $pageSize" : "";
		$sql = $dsql->SetQuery($archives.$where1.$orderby.$where);//print_R($sql);exit;
		$results = getCache("education_class_list", $sql, 300, array("disabled" => $u));
		if($results){
			$now = GetMkTime(time());
			foreach($results as $key => $val){
				$list[$key]['id']           = $val['id'];
				$list[$key]['classname']    = $val['classname'];
				$list[$key]['price']        = $val['price'];
				$list[$key]['pubdate']      = $val['pubdate'];
				$list[$key]['click']        = $val['click'];
				$list[$key]['openStart']    = $val['openStart'] ? date("Y-m-d", $val['openStart']): '';
				$list[$key]['openEnd']      = $val['openEnd'] ? date("Y-m-d", $val['openEnd']) : '';
				$list[$key]['coursesid']    = $val['coursesid'];
				$list[$key]['address']      = $val['address'];
				$list[$key]['classhour']    = $val['classhour'];
				$list[$key]['typeid']       = $val['typeid'];
				if ($val['manyclass']){
                    $manyclas = unserialize($val['manyclass']);
                    foreach($manyclas as $kk=>$r) {
                        $typename = '';
                        if($r['typeid']){
                            $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = " . $r['typeid']);
                            $Res = $dsql->dsqlOper($sql, "results");
                            $typename = $Res[0]['typename'];
                        }
                        $manyclas[$kk]['typename']= $typename;
                        $manyclas[$kk]['id']= $r['id'];

                        $tagArr = array();
                        if ($r['teacherid']) {
                            $sql = $dsql->SetQuery("SELECT `id`, `name`, `photo`, `sex` FROM `#@__education_teacher` WHERE  `id` in ($r[teacherid]) ORDER BY  `weight` DESC, `pubdate` DESC, `id` DESC");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if ($ret) {
                                foreach ($ret as $k => $row) {
                                    $tagArr[$k]['teachername'] = $row['name'];
                                    $tagArr[$k]['sex'] = $row['sex'];
                                    $tagArr[$k]['photo'] = getFilePath($row['photo']);
                                }
                            }
                        }
                        $manyclas[$kk]['teacherAll'] = $tagArr;
                        
                        $manyclas[$kk]['openStart'] = $r['openStart'] ? date("Y-m-d", $r['openStart']): '';
                        $manyclas[$kk]['openEnd'] = $r['openEnd'] ? date("Y-m-d", $r['openEnd']): '';
                        
                        $list[$key]['manyclass']       = $manyclas;

                    }
                }

				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = '".$val['typeid']."'");
				$ret = $dsql->dsqlOper($sql, "results");
				$list[$key]['typename']   = $ret[0]['typename'] ? $ret[0]['typename'] : '';

				$workArr = array();
				if($val['teacherid']){
					$sql = $dsql->SetQuery("SELECT `id`, `name`, `photo`, `sex` FROM `#@__education_teacher` WHERE  `id` in ($val[teacherid]) ORDER BY  `weight` DESC, `pubdate` DESC, `id` DESC");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						foreach($ret as $k=>$row){
							$workArr[$k]['teachername']    = $row['name'];
							$workArr[$k]['sex']            = $row['sex'];
							$workArr[$k]['photo']          = getFilePath($row['photo']);
						}
					}
				}

                $list[$key]['teacherAll']       = $workArr;

				//会员中心显示信息状态
				$param = array(
					"service"     => "education",
					"template"    => "class-detail",
					"id"          => $val['id']
				);
				$list[$key]['url']        = getUrlPath($param);

				$collect = "";
            	if($loginUid != -1){
	                //验证是否已经收藏
					$params = array(
						"module" => "education",
						"temp"   => "class-detail",
						"type"   => "add",
						"id"     => $val['id'],
						"check"  => 1
					);
					$collect = checkIsCollect($params);
				}
				$list[$key]['collect'] = $collect == "has" ? 1 : 0;
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
     * 班级详细
     * @return array
     */
	public function classDetail(){
		global $dsql;
		global $langData;
		$id = $this->param;
		$storeDetail = array();
		$id = is_numeric($id) ? $id : $id['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误

		//$where = " AND `state` = 0";

		$archives = $dsql->SetQuery("SELECT `id`, `classname`, `openStart`, `openEnd`, `coursesid`, `address`, `price`, `teacherid`, `typeid`, `desc`, `click`, `pubdate`, `state`, `classhour`  FROM `#@__education_class` WHERE `id` = ".$id.$where);
		$results  = getCache("education_class_detail", $archives, 0, $id);//print_R($archives);exit;
		if($results){
			$storeDetail["id"]       			= $results[0]['id'];

			$storeDetail["openStart"]    		= $results[0]['openStart'] ? date("Y-m-d", $results[0]['openStart']) : '';
			$storeDetail["openEnd"]			    = $results[0]['openEnd'] ? date("Y-m-d", $results[0]['openEnd']) : '';
			$storeDetail["coursesid"]    		= $results[0]['coursesid'];
			$storeDetail["address"]   	        = $results[0]['address'];
			$storeDetail["price"]   	        = $results[0]['price'];
			$storeDetail["teacherid"]           = $results[0]['teacherid'];
			$storeDetail["typeid"]   	        = $results[0]['typeid'];
			$storeDetail["click"]   		    = $results[0]['click'];
			$storeDetail["pubdate"]   		    = $results[0]['pubdate'];
			$storeDetail["state"]   			= $results[0]['state'];
			$storeDetail["desc"]   		        = $results[0]['desc'];
			$storeDetail["classhour"]   		= $results[0]['classhour'];

			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = '".$results[0]['typeid']."'");
			$ret = $dsql->dsqlOper($sql, "results");
			$storeDetail['typename']   = $ret[0]['typename'] ? $ret[0]['typename'] : '';

			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__education_courses` WHERE `id` = '".$results[0]['coursesid']."'");
			$ret = $dsql->dsqlOper($sql, "results");
			$storeDetail["classname"]  = $results[0]['classname'] ? $results[0]['classname'] : $ret[0]['title'];

			$workArr = array();
			if($results[0]['teacherid'] && !strstr($results[0]['teacherid'], 'Array')){
				$teacherid = $results[0]['teacherid'];
				$sql = $dsql->SetQuery("SELECT `id`, `name`, `photo`, `courses`, `certifyState`, `degreestate`, `sex` FROM `#@__education_teacher` WHERE  `id` in ($teacherid) ORDER BY  `weight` DESC, `pubdate` DESC, `id` DESC");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					foreach($ret as $k=>$val){
						$param = array(
							"service"     => "education",
							"template"    => "teacher-detail",
							"id"          => $val['id']
						);
						$workArr[$k]['url']            = getUrlPath($param);

						$workArr[$k]['teachername']    = $val['name'];
						$workArr[$k]['certifyState']   = $val['certifyState'];
						$workArr[$k]['degreestate']    = $val['degreestate'];
						$workArr[$k]['courses']        = $val['courses'];
						$workArr[$k]['sex']            = $val['sex'];
						$workArr[$k]['photo']          = getFilePath($val['photo']);
					}
				}
			}
			$storeDetail['teacherAll']       = $workArr;

			$lower = [];
			$param['id']    = $results[0]['coursesid'];
			$this->param    = $param;
			$courses        = $this->detail();
			if(!empty($courses)){
				$lower = $courses;
			}
			$storeDetail['coursesArr'] = $lower;

			//验证是否已经收藏
			$params = array(
				"module" => "education",
				"temp"   => "class-detail",
				"type"   => "add",
				"id"     => $id,
				"check"  => 1
			);
			$collect = checkIsCollect($params);
			$storeDetail['collect'] = $collect == "has" ? 1 : 0;

			return $storeDetail;
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][20][282]);//信息不存在
		}
	}

	/**
	 * 操作留言
	 * oper=add: 增加
	 * oper=del: 删除
	 * oper=update: 更新
	 * @return array
	 */
	public function operWord(){
		global $dsql;
		global $userLogin;
		global $langData;
		global $siteCityInfo;
		require(HUONIAOINC."/config/education.inc.php");
		$state = (int)$customeducationwordCheck;

		$userid      = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		$param           =  $this->param;
		$oper            =  $param['oper'];

		$title           =  filterSensitiveWords(addslashes($param['title']));
		$subjects        =  filterSensitiveWords(addslashes($param['subjects']));
		$addrid          =  (int)$param['addrid'];
		$cityid          =  (int)$param['cityid'];
		$sex             =  (int)$param['sex'];
		$subjectstime    =  $param['subjectstime'];
		$lecturesnums    =  $param['lecturesnums'];
		$price           =  $param['price'];
		$education     	 =  $param['education'];
		$note            =  $param['note'];
		$tel             =  $param['tel'];
		$pubdate         =  GetMkTime(time());

		if($oper == 'add' || $oper == 'update'){
			if(empty($title))  return array("state" => 200, "info" => $langData['education'][6][18]);//请填写留言标题
			if(empty($subjects)) return array("state" => 200, "info" => $langData['education'][6][19]);//请填写求教科目
			if(empty($addrid))   return array("state" => 200, "info" => $langData['education'][6][20]);//请填写所在区域
			if(empty($education)) return array("state" => 200, "info" => $langData['education'][6][21]);//请选择身份要求
			if(empty($price)) return array("state" => 200, "info" => $langData['education'][6][23]);//请填写预期费用
			if(empty($tel)) return array("state" => 200, "info" => $langData['education'][6][24]);//请输入手机号
		}elseif($oper == 'del'){
			if(!is_numeric($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
		}

		if($oper == 'add'){
			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__education_word` (`userid`, `title`, `cityid`, `addrid`, `subjects`, `education`, `sex`, `subjectstime`, `lecturesnums`, `price`, `note`, `tel`, `pubdate`, `state`) VALUES ('$userid', '$title', '$cityid', '$addrid', '$subjects', '$education', '$sex', '$subjectstime', '$lecturesnums', '$price', '$note', '$tel', '$pubdate', '$state')");
			$aid = $dsql->dsqlOper($archives, "lastid");
			if(is_numeric($aid)){
				if($state){
					updateCache("education_word_list", 300);
				}

				clearCache("education_word_total", 'key');

				//微信通知
			    $cityName = $siteCityInfo['name'];
			    $cityid  = $siteCityInfo['cityid'];
				$param = array(
				    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
				    'cityid' => $cityid,
				    'notify' => '管理员消息通知',
				    'fields' =>array(
					'contentrn'  => $cityName.'分站——education模块——用户:'.$userid.' 发表了一条留言'.$aid,
					'date' => date("Y-m-d H:i:s", time()),
					)
				);
				//后台消息通知
				updateAdminNotice("education", "word",$param);

				return array("check"=>$state, "aid" => $aid);
			}else{
				return array("state" => 101, "info" => $langData['travel']['12']['34']);//发布到数据时发生错误，请检查字段内容！
			}
		}elseif($oper == 'update'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_word` WHERE `id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__education_word` SET `userid` = '$userid', `title` = '$title', `cityid` = '$cityid', `addrid` = '$addrid', `subjects` = '$subjects', `education` = '$education', `sex` = '$sex', `subjectstime` = '$subjectstime', `lecturesnums` = '$lecturesnums', `price` = '$price', `note` = '$note', `tel` = '$tel', `state` = '$state' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					return array("state" => 200, "info" => $langData['travel']['12']['34']); //保存到数据时发生错误，请检查字段内容！
				}
				//微信通知
			    $cityName = $siteCityInfo['name'];
			    $cityid  = $siteCityInfo['cityid'];
				$param = array(
				    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
				    'cityid' => $cityid,
				    'notify' => '管理员消息通知',
				    'fields' =>array(
					'contentrn'  => $cityName.'分站——education模块——用户:'.$userid.' 更新了一条留言'.$aid,
					'date' => date("Y-m-d H:i:s", time()),
					)
				);
				//后台消息通知
				updateAdminNotice("education", "word",$param);

				// 清除缓存
				clearCache("education_word_detail", $id);
				checkCache("education_word_list", $id);
				clearCache("education_word_total", 'key');


				// return $langData['travel'][12][35];//修改成功！
				return array("check"=>$state, "info" => $langData['travel'][12][35]);
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}elseif($oper == 'del'){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__education_word` WHERE `id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				// 清除缓存
				clearCache("education_word_detail", $id);
				checkCache("education_word_list", $id);
				clearCache("education_word_total", 'key');

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__education_word` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");

				return array("state" => 100, "info" => $langData['travel'][12][36]);//删除成功！
			}else{
				return array("state" => 101, "info" => $langData['travel'][12][38]);//信息不存在，或已经删除！
			}
		}

	}

	/**
	 * 教育留言
	 * @return array
	 */
	public function wordList(){
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
				$addrid   = $this->param['addrid'];
				$business   = $this->param['business'];
				$orderby  = $this->param['orderby'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		$uid      = $userLogin->getMemberID();
		$userinfo = $userLogin->getMemberInfo();

		if($noid){
			$where .= " AND `id` not in ($noid)";
		}

		if($u!=1){
			//数据共享
			require(HUONIAOINC."/config/education.inc.php");
			$dataShare = (int)$customDataShare;

			if(!$dataShare){
				$cityid = getCityId($this->param['cityid']);
				$where .= " AND `state` = 1 AND `cityid` = '$cityid' ";
			}else{
				$where .= " AND `state` = 1 ";
			}
		}else{
			$where .= " AND `userid` = ".$uid;
			if($state!=''){
				$where .= " AND `state` = ".$state;
			}
		}

		if(!empty($addrid)){
				if (!empty($business)) {
					$addrid = $business;
				}
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

			siteSearchLog("education", $search);

			$where .= " AND `title` like '%$search%'";

		}

		//排序
        switch ($orderby){
            //浏览量
            case 1:
                $orderby_ = " ORDER BY `click` DESC, `weight` DESC, `id` DESC";
                break;
            //发布时间降序
            case 2:
                $orderby_ = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
				break;
			//价格降序
			case 3:
				$orderby_ = " ORDER BY `price` DESC, `pubdate` DESC, `weight` DESC, `id` DESC";
				break;
            default:
                $orderby_ = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
                break;
        }
		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `userid`, `title`, `cityid`, `addrid`, `subjects`, `education`, `sex`, `subjectstime`, `lecturesnums`, `price`, `click`, `pubdate`, `state`, `sex`, `tel`   FROM `#@__education_word` l WHERE 1 = 1".$where);
		//总条数
		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__education_word` l WHERE 1 = 1".$where);
		//总条数
		$totalCount = getCache("education_word_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
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
		$results = getCache("education_word_list", $sql, 300, array("disabled" => $u));
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']        = $val['id'];
				$list[$key]['price']     = $val['price'];
				$list[$key]['subjects']  = $val['subjects'];
				$list[$key]['subjectstime']  = $val['subjectstime'];
				$list[$key]['lecturesnums']  = $val['lecturesnums'];
				$list[$key]['userid']    = $val['userid'];
				$list[$key]['title']     = $val['title'];
				$list[$key]['userid']    = $val['userid'];
				$list[$key]['click']     = $val['click'];
				$list[$key]['pubdate']   = $val['pubdate'];
				$list[$key]['state']     = $val['state'];
				$list[$key]['cityid']    = $val['cityid'];
				$list[$key]['sex']       = $val['sex'];
				$list[$key]['tel']       = $val['tel'];

				if($uid > -1){
					$list[$key]["tel"] = $val['tel'];
				}else{
					$list[$key]["tel"] = substr($val['tel'], 0, 3) . '****' . substr($val['tel'], -4);
				}

				$userinfo = getMemberDetail($val['userid']);
				if($userinfo){
					$list[$key]['user'] = $userinfo;
				}

				$educationname = '';
				if($results[0]['education']){
					$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = " . $val['education']);
					$Res = $dsql->dsqlOper($sql, "results");
					$educationname = $Res[0]['typename'];
				}
				$list[$key]['educationname']= $educationname;

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
					"service" => "education",
					"template" => "word-detail",
					"id" => $val['id']
				);
				$url = getUrlPath($param);

				$list[$key]['url'] = $url;

			}

		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
     * 教育留言详细
     * @return array
     */
	public function wordDetail(){
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

		$archives = $dsql->SetQuery("SELECT `id`, `userid`, `title`, `cityid`, `addrid`, `subjects`, `education`, `sex`, `subjectstime`, `lecturesnums`, `price`, `note`, `tel`, `click`, `pubdate`, `state`  FROM `#@__education_word` WHERE `id` = ".$id.$where);
		$results  = getCache("education_word_detail", $archives, 0, $id);
		if($results){
			$storeDetail["id"]          = $results[0]['id'];
			$storeDetail["cityid"]      = $results[0]['cityid'];
			$storeDetail['userid']      = $results[0]['userid'];
			$storeDetail["click"]       = $results[0]['click'];
			$storeDetail["pubdate"]     = $results[0]['pubdate'];
			$storeDetail["state"]       = $results[0]['state'];
			$storeDetail['addrid']      = $results[0]['addrid'];
			$storeDetail['note']        = $results[0]['note'];
			$storeDetail["title"]       = $results[0]['title'];
			$storeDetail["education"]   = $results[0]['education'];
			$storeDetail['subjects']    = $results[0]['subjects'];
			$storeDetail['sex']         = $results[0]['sex'];

			if($uid > -1){
				$storeDetail["tel"] = $results[0]['tel'];
			}else{
				$storeDetail["tel"] = substr($results[0]['tel'], 0, 3) . '****' . substr($results[0]['tel'], -4);
			}

			$storeDetail["subjectstime"]= $results[0]['subjectstime'];
			$storeDetail['lecturesnums']= $results[0]['lecturesnums'];
			$storeDetail['price']       = $results[0]['price'];

			$storeDetail['sexname']         = $results[0]['sex'] == 1 ? $langData['education'][6][16] : ($results[0]['sex'] ==0 ? $langData['education'][6][17] : $langData['education'][3][17]);

			$educationname = '';
			if($results[0]['education']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_item` WHERE `id` = " . $results[0]['education']);
				$Res = $dsql->dsqlOper($sql, "results");
				$educationname = $Res[0]['typename'];
			}
			$storeDetail['educationname']= $educationname;

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
				"module" => "education",
				"temp"   => "word-detail",
				"type"   => "add",
				"id"     => $results[0]['id'],
				"check"  => 1
			);
			$collect = checkIsCollect($params);
			$storeDetail['collect'] = $collect == "has" ? 1 : 0;

			//会员信息
			$userinfo = getMemberDetail($results[0]['userid']);
			if($userinfo){
				$storeDetail['user'] = $userinfo;
			}

		}
		return $storeDetail;
	}

	/**
	 * 下单
	 * @return array
	 */
	public function deal(){
		global $dsql;
		global $userLogin;
		global $langData;
        global $cfg_pointRatio;
        global $cfg_pointName;

		$userid = $userLogin->getMemberID();

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		$param = $this->param;
		$proid     = (int)$param['proid'];
		$procount  = (int)$param['procount'];
		$people    = $param['people'];
		$contact   = $param['contact'];
		$pc        = $param['pc']!=''?$param['pc']:'0';
        $usePinput = (int)$param['usePinput'];          //是否使用积分


        //查询会员信息
        $userinfo  = $userLogin->getMemberInfo();
        $userpoint = $userinfo['point'];
        if(empty($proid))    return array("state" => 200, "info" => $langData['travel'][12][23]);  //格式错误
		if(empty($procount)) return array("state" => 200, "info" => $langData['travel'][13][12]);   //数量不能为空
		$this->param = $proid;
		$detail = $this->classDetail();
        $perice = $detail['price'] * $procount;

		if($detail['coursesArr']['user']['userid'] == $userid) return array("state" => 200, "info" => $langData['education'][7][42]); //企业会员不可以购买自己的课程信息！
		if(!is_array($detail)) return array("state" => 200, "info" => $langData['education'][7][43]);//信息不存在
        $pricepoint = 0;
        if($usePinput == 1){
            $point_price  = getJifen('education', $perice);  //钱
                $pricepoint = $point_price * $cfg_pointRatio;
            if ($pricepoint > $userpoint){
                $pricepoint = $userpoint;
                $point_price =   $pricepoint /  $cfg_pointRatio;
            }

            $price = sprintf("%.2f",$perice-$point_price);
        }else{
            $price = $perice;
        }


		$ordernum = create_ordernum();

		$pubdate   = GetMkTime(time());
		$nopaydate = $pubdate + 1800;

		$archives = $dsql->SetQuery("INSERT INTO `#@__education_order` (`ordernum`, `proid`, `userid`, `orderstate`, `orderdate`, `procount`, `people`, `contact`, `orderprice`, `payprice`, `tab`, `nopaydate`,`point`) VALUES ('$ordernum', '$proid', '$userid', '0', '$pubdate', '$procount', '$people', '$contact', '$price', '$price', 'education', '$nopaydate','$pricepoint')");


		$return = $dsql->dsqlOper($archives, "update");
		if($return == "ok"){
			$url[] = $ordernum;
		}else{
			return array("state" => 200, "info" => $langData['homemaking'][9][99]);//下单失败
		}

		$RenrenCrypt = new RenrenCrypt();
		$ids = base64_encode($RenrenCrypt->php_encrypt(join(",", $url)));
        if ($price == 0){
            $date = GetMkTime(time());
            $paytype = array();
            $ordernumArr = explode(",", $ordernum);
            //扣除会员账户积分和余额
            foreach ($ordernumArr as $key => $value) {

                //查询订单信息
                $archives = $dsql->SetQuery("SELECT `id`, `userid`, `point`, `balance` FROM `#@__education_order` WHERE `ordernum` = '$value'");
                $results  = $dsql->dsqlOper($archives, "results");
                $res = $results[0];
                $userid  = $res['userid'];   //购买用户ID
                $orderid  = $res['id'];   //订单ID
                $upoint   = $res['point'];    //使用的积分
                $ubalance = $res['balance'];  //使用的余额

                //扣除会员积分
                if(!empty($upoint) && $upoint > 0){
                    $paytype[] = "point";
                }

                //扣除会员余额
                if(!empty($ubalance) && $ubalance > 0){
                    $paytype[] = "money";
                }

            }

            //增加支付日志
            $paylognum = create_ordernum();
            $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`) VALUES ('education', '$paylognum', '$userid', '$ordernum', '0', '".join(",", $paytype)."', '1')");
            $dsql->dsqlOper($archives, "update");

            //执行支付成功的操作
            $this->param = array(
                "paytype" => join(",", $paytype),
                "ordernum" => $ordernum
            );
            $this->paySuccess();

            //跳转至支付成功页面
            $param = array(
                "service"     => "education",
                "template"    => "payreturn",
                "ordernum"    => $paylognum
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
            return $url;
       }else{
//            if($pc == '1'){
//                $template = "pay2";
//            }else{
//                $template = "pay";
//            }
//            $param = array(
//                "service"     => "education",
//                "template"    => $template,
//                "param"       => "ordernum=".$ids
//            );
//            return getUrlPath($param);
            $order = createPayForm("education",$ordernum, $price, '', $langData['education'][7][44],array(),1);
            $timeout = GetMkTime(time()) + 1800;
            $order['timeout'] = $timeout;

            return  $order;
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


		//订单状态验证
		$payCheck = $this->payCheck();
		if($payCheck != "ok") return array("state" => 200, "info" => $payCheck['info']);

		$ordernum   = $param['ordernum'];    //订单号
		$usePinput  = $param['usePinput'];   //是否使用积分
//		$point      = $param['point'];       //使用的积分
		$useBalance = $param['useBalance'];  //是否使用余额
		$balance    = $param['balance'];     //使用的余额
		$paypwd     = $param['paypwd'];      //支付密码

		if($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请登录后重试！
		if(empty($ordernum)) return array("state" => 200, "info" => $langData['travel'][13][15]);//提交失败，订单号不能为空！
		if(!empty($balance) && empty($paypwd)) return array("state" => 200, "info" => $langData['travel'][13][16]);//请输入支付密码！

		$totalPrice = 0;
		$ordernumArr = explode(",", $ordernum);
		foreach ($ordernumArr as $key => $value) {
			//查询订单信息
			$archives = $dsql->SetQuery("SELECT `procount`, `orderprice` FROM `#@__education_order` WHERE `ordernum` = '$value'");
			$results  = $dsql->dsqlOper($archives, "results");
			$res = $results[0];
			$procount   = $res['procount'];
			$orderprice = $res['orderprice'];

			$totalPrice += $orderprice * $procount;
		}

//        $point      = getJifen('education',$totalPrice);       //使用的积分

		//查询会员信息
		$userinfo  = $userLogin->getMemberInfo();
		$usermoney = $userinfo['money'];
		$userpoint = $userinfo['point'];

		$tit      = array();
		$useTotal = 0;

        if ($usePinput == 1 ) {
            $pointprice = getJifen('education',$totalPrice);   //抵扣的钱
            $point =  $pointprice * $cfg_pointRatio;
            if ($point > $userpoint){
                $point = $userpoint;
            }
            $pointMoney =  $point/ $cfg_pointRatio;
            $price =$pointMoney ;
            $useTotal +=$price;
//            $useTotal += $point / $cfg_pointRatio;
            $tit[]    = $cfg_pointName;
        }
		//判断是否使用余额，并且验证余额和支付密码
		if($useBalance == 1 && !empty($balance) && !empty($paypwd)){
			//验证支付密码
			$archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
			$results  = $dsql->dsqlOper($archives, "results");
			$res = $results[0];
			$hash = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
			if($res['paypwd'] != $hash) return array("state" => 200, "info" => $langData['travel'][13][19]);//支付密码输入错误，请重试！
			//验证余额
			if($usermoney < $balance) return array("state" => 200, "info" => $langData['travel'][13][20]);//您的余额不足，支付失败！
			$useTotal += $balance;
			$tit[] = $langData['travel'][13][21];//余额
		}

        if($useTotal > $totalPrice) return array("state" => 200, "info" => $langData['travel'][13][22].join($langData['travel'][13][23], $tit).$langData['travel'][13][24].join($langData['travel'][13][23], $tit));//"您使用的".join("和", $tit)."超出订单总费用，请重新输入要使用的".join("和", $tit)

		//返回需要支付的费用
		return sprintf("%.2f", $totalPrice - $useTotal);

	}

	/**
	 * 支付前验证订单内容
	 * @return array
	 */
	public function payCheck(){
		global $dsql;
		global $userLogin;
		global $langData;

		$param = $this->param;
		$ordernum = $param['ordernum'];

		if(empty($ordernum)) return array("state" => 200, "info" => $langData['travel'][13][25]);//订单号传递失败！

		$userid = $userLogin->getMemberID();
		$ordernumArr = explode(",", $ordernum);
		foreach ($ordernumArr as $key => $value) {

			//获取订单内容
			$archives = $dsql->SetQuery("SELECT `proid`, `procount`, `orderprice`, `orderstate` FROM `#@__education_order` WHERE `ordernum` = '$value' AND `userid` = $userid");
			$orderDetail  = $dsql->dsqlOper($archives, "results");
			if($orderDetail){
				$proid      = $orderDetail[0]['proid'];
				$procount   = $orderDetail[0]['procount'];
				$orderprice = $orderDetail[0]['orderprice'];
				$orderstate = $orderDetail[0]['orderstate'];

				//验证订单状态
				if($orderstate != 0){
					//订单中包含状态异常的订单，请确认后重试！ 订单状态异常，请确认后重试！
					$info = count($ordernumArr) > 1 ? $langData['travel'][13][26] : $langData['travel'][13][27];
					return array("state" => 200, "info" => $info);
				}


				$this->param = $proid;
				$proDetail = $this->classDetail();
				//验证是否为自己的店铺
				if($proDetail['coursesArr']['user']['userid'] == $userid){
					return array("state" => 200, "info" => $langData['travel'][13][28]);//企业会员不得购买自己公司的！
				}

				//获取商品详细信息
				if(empty($proDetail)){
					//订单中包含不存在或已下架的商品，请确认后重试！ 提交失败，您要购买的商品不存在或已下架！
					$info = count($ordernumArr) > 1 ? $langData['travel'][13][29] : $langData['travel'][13][30];
					return array("state" => 200, "info" => $info);
				}
			//订单不存在
			}else{
				//订单中包含不存在的订单，请确认后重试！ 订单不存在或已删除，请确认后重试！
				$info = count($ordernumArr) > 1 ? $langData['travel'][13][31] : $langData['travel'][13][32];
				return array("state" => 200, "info" => $info);
			}
		}
		return "ok";
	}

	/**
	 * 支付
	 * @return array
	 */
	public function pay(){
		global $dsql;
		global $cfg_basehost;
		global $cfg_pointRatio;
		global $langData;

		$param =  $this->param;

		//验证需要支付的费用
		$payTotalAmount = $this->checkPayAmount();

        //重置表单参数
		$this->param = $param;

		if($this->payCheck() != "ok" || is_array($payTotalAmount)){
			$param = array(
				"service"     => "member",
				"type"        => "user",
				"template"    => "order",
				"module"      => "education"
			);
			$url = getUrlPath($param);
			header("location:".$url);
			die;
		}

		$ordernum   = $param['ordernum'];
		$paytype    = $param['paytype'];
		$usePinput  = $param['usePinput'];
//		$point      = (float)$param['point'];
		$useBalance = $param['useBalance'];
		$balance    = (float)$param['balance'];
		$ordernumArr = explode(",", $ordernum);
        $orderfinal  = (int)$param['orderfinal']; /*个人中心订单预下单 0,发起支付1 */

        $totalPrice = 0;
        $ordernumArr = explode(",", $ordernum);
        foreach ($ordernumArr as $key => $value) {
            //查询订单信息
            $archives = $dsql->SetQuery("SELECT `procount`, `orderprice` FROM `#@__education_order` WHERE `ordernum` = '$value'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res = $results[0];
            $procount   = $res['procount'];
            $orderprice = $res['orderprice'];

            $totalPrice += $orderprice * $procount;
        }

//        $point      = getJifen('education',$totalPrice);       //使用的积分

        if( $orderfinal == 1 ) {
            $order = createPayForm("education", $ordernum, $payTotalAmount, $paytype, $langData['education'][7][44], array(), 1);
            $timeout = GetMkTime(time()) + 1800;
            $order['timeout'] = $timeout;

            return  $order;
        }
		//如果有使用积分或余额则更新订单内容的价格策略
		if(($usePinput && !empty($point)) || ($useBalance && !empty($balance))){

			$pointMoney = $usePinput ? $point / $cfg_pointRatio : 0;
			$balanceMoney = $balance;

			foreach ($ordernumArr as $key => $value) {

				//查询订单信息
				$archives = $dsql->SetQuery("SELECT `procount`, `orderprice` FROM `#@__education_order` WHERE `ordernum` = '$value'");
				$results  = $dsql->dsqlOper($archives, "results");
				$res = $results[0];
				$procount   = $res['procount'];   //数量
				$orderprice = $res['orderprice']; //单价
				$oprice = $procount * $orderprice;  //单个订单总价 = 数量 * 单价

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
				$archives = $dsql->SetQuery("UPDATE `#@__education_order` SET  `balance` = '$useBalanceMoney', `payprice` = '$oprice' WHERE `ordernum` = '$value'");
				$dsql->dsqlOper($archives, "update");
			}

		//如果没有使用积分或余额，重置积分&余额等价格信息
		}else{
			foreach ($ordernumArr as $key => $value) {
				//查询订单信息
				$archives = $dsql->SetQuery("SELECT `procount`, `orderprice` FROM `#@__education_order` WHERE `ordernum` = '$value'");
				$results  = $dsql->dsqlOper($archives, "results");
				$res = $results[0];
				$procount   = $res['procount'];   //数量
				$orderprice = $res['orderprice']; //单价
				$oprice = $procount * $orderprice;  //单个订单总价 = 数量 * 单价

				$archives = $dsql->SetQuery("UPDATE `#@__education_order` SET  `balance` = '0', `payprice` = '$oprice' WHERE `ordernum` = '$value'");
				$dsql->dsqlOper($archives, "update");
			}
		}

		//1.如果需要支付的金额小于等于0，表示会员使用积分或余额已经付清了，不需要另外去支付
		//2.这种情况直接更新订单状态，并跳转至支付成功页即可
		//3.对会员的积分和余额进行扣除操作

        if($payTotalAmount <= 0){

			$date = GetMkTime(time());
			$paytype = array();

			//扣除会员账户积分和余额
			foreach ($ordernumArr as $key => $value) {

				//查询订单信息
				$archives = $dsql->SetQuery("SELECT `id`, `userid`, `point`, `balance` FROM `#@__education_order` WHERE `ordernum` = '$value'");
				$results  = $dsql->dsqlOper($archives, "results");
				$res = $results[0];
				$userid  = $res['userid'];   //购买用户ID
				$orderid  = $res['id'];   //订单ID
				$upoint   = $res['point'];    //使用的积分
				$ubalance = $res['balance'];  //使用的余额

				//扣除会员积分
				if(!empty($upoint) && $upoint > 0){
					$paytype[] = "point";
				}

				//扣除会员余额
				if(!empty($ubalance) && $ubalance > 0){
					$paytype[] = "money";
				}

			}


			//增加支付日志
            //增加支付日志
            $paylognum = create_ordernum();
            $paysql   = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
            $payre    = $dsql->dsqlOper($paysql,"results");
            if (!empty($payre)) {
                if($userid > 0){
                    //增加支付日志
                    $archives = $dsql->SetQuery("UPDATE  `#@__pay_log`  SET `ordertype` = 'education',`ordernum` ='$ordernum',`uid` = '$userid',`body` = '$ordernum',`amount` ='0',`paytype` ='".join(",", $paytype)."'
                         ,`state` = 1 WHERE `ordernum` = '$ordernum' AND `ordertype` = 'education' ");
                }
            }else{
                if($userid > 0){
                    $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('education', '$ordernum', '$userid', '$ordernum', 0, '$paytype', 1, $date)");
                    $dsql->dsqlOper($archives, "results");
                }

            }
			$dsql->dsqlOper($archives, "update");

			//执行支付成功的操作
			$this->param = array(
				"paytype" => join(",", $paytype),
				"ordernum" => $ordernum
			);
			$this->paySuccess();

			//跳转至支付成功页面
			$param = array(
				"service"     => "education",
				"template"    => "payreturn",
				"ordernum"    => $ordernum
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
            return $url;

		}else {
            //跳转至第三方支付页面
           return createPayForm("education", $ordernum, $payTotalAmount, $paytype, $langData['education'][7][44]);  //教育订单
        }

	}

	//扫码code
	public function sweepcode(){
		global $dsql;
		global $userLogin;
		global $cfg_pointName;
		global $cfg_pointRatio;
		global $langData;
		$param =  $this->param;

		//验证需要支付的费用
		$payTotalAmount = $this->checkPayAmount();
		//重置表单参数
		$this->param = $param;

        $param_ = $param;
        $ordernum = $param['ordernum'];
        $paytype = $param['paytype'];
        $final      = (int)$param['final']; // 最终支付
		$paytype    = $param['paytype'];
		$usePinput  = $param['usePinput'];
//		$point      = (float)$param['point'];
		$useBalance = $param['useBalance'];
		$balance    = (float)$param['balance'];
		$ordernumArr = explode(",", $ordernum);

        if (!is_array($payTotalAmount)) {
        	$amount =  $payTotalAmount;
        }else{
        	return $payTotalAmount;
        }

        $totalPrice = 0;
        $ordernumArr = explode(",", $ordernum);
        foreach ($ordernumArr as $key => $value) {
            //查询订单信息
            $archives = $dsql->SetQuery("SELECT `procount`, `orderprice` FROM `#@__education_order` WHERE `ordernum` = '$value'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res = $results[0];
            $procount   = $res['procount'];
            $orderprice = $res['orderprice'];

            $totalPrice += $orderprice * $procount;
        }

        $point      = getJifen('education',$totalPrice);       //使用的积分

        //余额or积分混合支付
        if($final==1 &&($usePinput && !empty($point)) || ($useBalance && !empty($balance))){

			$pointMoney = $usePinput ? $point / $cfg_pointRatio : 0;
			$balanceMoney = $balance;

			foreach ($ordernumArr as $key => $value) {

				//查询订单信息
				$archives = $dsql->SetQuery("SELECT `procount`, `orderprice` FROM `#@__education_order` WHERE `ordernum` = '$value'");
				$results  = $dsql->dsqlOper($archives, "results");
				$res = $results[0];
				$procount   = $res['procount'];   //数量
				$orderprice = $res['orderprice']; //单价
				$oprice = $procount * $orderprice;  //单个订单总价 = 数量 * 单价

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
				$archives = $dsql->SetQuery("UPDATE `#@__education_order` SET `point` = '$pointMoney_', `balance` = '$useBalanceMoney', `payprice` = '$oprice' WHERE `ordernum` = '$value'");
				$dsql->dsqlOper($archives, "update");

				//扫码支付 更新微信或者支付宝实际支付金额
				$paylogsql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `amount` = '$oprice' WHERE `body` = '$value'");
				$dsql->dsqlOper($paylogsql, "update");
			}


		}
        $isMobile = isMobile();

        global $userLogin;
        global $langData;

        if($userLogin->getMemberID() == -1) die($langData['siteConfig'][20][262]);  //登录超时，请重新登录！

        if($amount <= 0){
            die($langData['siteConfig'][21][254]);   //订单支付金额必须为整数或小数，小数点后不超过2位。
        }
        if(empty($paytype)){
            die($langData['siteConfig'][21][75]);   //请选择支付方式！
        }

        $ordernum = $ordernum ? $ordernum : create_ordernum();

        if($isMobile && empty($final)){
            $param_['ordernum'] = $ordernum;
            $param_['ordertype'] = 'deposit';
            $param = array(
                "service" => "member",
                "type" => "user",
                "template" => "pay",
                "param" => http_build_query($param_)
            );
            header("location:".getUrlPath($param));
            die;
        }

        // var_dump($amount);die;
        return createPayForm("education", $ordernum, $amount, $paytype, $langData['siteConfig'][29][126], array("type" => "sweepcode"));   //订单支付

    }


	/**
	 * 支付成功
	 * 此处进行支付成功后的操作，例如发送短信等服务
	 *
	 */
	public function paySuccess(){
		$param = $this->param;
		if(!empty($param)){
			global $dsql;
			global $langData;
			global $userLogin;

			$paytype  = $param['paytype'];
			$paramArr = explode(",", $param['ordernum']);
			$date = GetMkTime(time());

			foreach ($paramArr as $key => $value) {

				$archives = $dsql->SetQuery("SELECT `id`, `userid`, `point`, `balance`, `payprice`, `paydate`, `proid`, `procount`, `people`, `contact`,`orderprice`, `orderstate` FROM `#@__education_order` WHERE `ordernum` = '$value'");
				$res  = $dsql->dsqlOper($archives, "results");
				if($res){
					$proid          = $res[0]['proid'];
					$orderid        = $res[0]['id'];
					$procount       = $res[0]['procount'];
					$upoint         = $res[0]['point'];
					$ubalance       = $res[0]['balance'];
					$payprice       = $res[0]['payprice'];
					$paydate        = $res[0]['paydate'];
					$userid         = $res[0]['userid'];//会员ID

					$this->param = $proid;
					$proDetail   = $this->classDetail();
					$uid         = $proDetail['coursesArr']['user']['userid'];//商家ID
					$title       = $proDetail['title'] ? $proDetail['title'] : $proDetail['coursesArr']['title'];

					//判断是否已经更新过状态，如果已经更新过则不进行下面的操作
					if($paydate == 0){
						//更新订单状态
						$archives = $dsql->SetQuery("UPDATE `#@__education_order` SET `orderstate` = 1, `paydate` = '$date', `paytype` = '$paytype' WHERE `ordernum` = '$value'");
						$dsql->dsqlOper($archives, "update");
                            
                        //记录用户行为日志
                        memberLog($userid, 'education', '', 0, 'update', '下单('.$value.'=>'.$payprice.'元)', '', $archives);

						//更新已购买数量
						$sql = $dsql->SetQuery("UPDATE `#@__education_class` SET `sale` = `sale` + $procount WHERE `id` = '$proid'");
						$dsql->dsqlOper($sql, "update");

						$totalPrice = $payprice;

						//扣除会员积分
						if(!empty($upoint) && $upoint > 0){
						    global  $userLogin;
							$archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$userid'");
							$dsql->dsqlOper($archives, "update");
                            $user  = $userLogin->getMemberInfo($userid);
                            $userpoint = $user['point'];
							//保存操作日志
							$info = $langData['education'][7][44] . $value;
							$archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '0', '$upoint', '$info', '$date','xiaofei','$userpoint')");//支付教育订单
							$dsql->dsqlOper($archives, "update");
						}

						//扣除会员余额
						if(!empty($ubalance) && $ubalance > 0){
							$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$ubalance' WHERE `id` = '$userid'");
							$dsql->dsqlOper($archives, "update");
							$totalPrice += $ubalance;
						}

						//增加冻结金额
						$archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` + '$totalPrice' WHERE `id` = '$userid'");
						$dsql->dsqlOper($archives, "update");

						//保存操作日志
                        $paramUser = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "action"   => "education",
                            "id"       => $orderid
                        );
						if($ubalance>0){
							$sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `body` = '$value' AND `state` = 1");
							$ret = $dsql->dsqlOper($sql, "results");
                            $pid = '';
							if($ret){
								$pid 			= $ret[0]['id'];
							}
                            $classnamesql = $dsql->SetQuery("SELECT `classname` FROM `#@__education_class` WHERE `id` = '$proid'");

							$classnameres = $dsql->dsqlOper($classnamesql,'results');
                            $user  = $userLogin->getMemberInfo($userid);
                            $usermoney = $user['money'];
//                            $money  = sprintf('%.2f',($usermoney-$totalPrice));
							$info_ = $langData['education'][7][44].'-购买课程'.$classnameres[0]['classname']."-".$value;
							$title = "教育消费-".$title;
							$urlParam = serialize($paramUser);
							$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0', '$totalPrice', '$info_', '$date','education','xiaofei','$pid','$urlParam','$title','$value','$usermoney')");//支付教育订单
							$dsql->dsqlOper($archives, "update");
						}

						//支付成功，会员消息通知

						$paramBusi = array(
							"service"  => "member",
							"type"     => "user",
							"template" => "education-order"
						);

						//获取会员名
						$username = "";
						$sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
						}

						//自定义配置
						$config = array(
							"username" => $username,
							"order" => $value,
							"amount" => $totalPrice,
							"title" => $title,
							"fields" => array(
								'keyword1' => '商品信息',
								'keyword2' => '付款时间',
								'keyword3' => '订单金额',
								'keyword4' => '订单状态'
							)
						);

						updateMemberNotice($userid, "会员-订单支付成功", $paramUser, $config,'','',0,1);

						//获取会员名
						$username = "";
						$sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
						}

						//自定义配置
						$config = array(
							"username" => $username,
							"title" => $title,
							"order" => $value,
							"amount" => $totalPrice,
							"fields" => array(
								'keyword1' => '订单编号',
								'keyword2' => '商品名称',
								'keyword3' => '订单金额',
								'keyword4' => '付款状态',
								'keyword5' => '付款时间'
							)
						);

						updateMemberNotice($uid, "会员-商家新订单通知", $paramBusi, $config,'','',0,1);
					}

				}

			}
		}
	}

	/**
     * 教育订单列表
     * @return array
     */
	public function orderList(){
		global $dsql;
		global $langData;
		$pageinfo = $list = array();
		$store = $state = $userid = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
			}else{
				$store    = $this->param['store'];
				$state    = $this->param['state'];
				$userid   = $this->param['userid'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
                $title    = trim($this->param['title']);
			}
		}

		if(empty($userid)){
			global $userLogin;
			$userid = $userLogin->getMemberID();
		}
		if(empty($userid)) return array("state" => 200, "info" => $langData['travel'][13][35]);//会员ID不得为空！

        //搜索订单
        if($title){
            if($store){
                $where .= " AND (o.`ordernum` LIKE '%$title%' OR o.`contact` LIKE '%$title%' OR s.`classname` LIKE '%$title%' OR s.`desc` LIKE '%$title%' OR c.`title` LIKE '%$title%' OR m.`nickname` LIKE '%$title%')";
            }else{
                $where .= " AND (o.`ordernum` LIKE '%$title%' OR s.`classname` LIKE '%$title%' OR s.`desc` LIKE '%$title%' OR c.`title` LIKE '%$title%')";
            }
        }

		//个人会员订单
		if(empty($store)){
			$where .= " AND o.`userid` = '$userid' ";
			$archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`proid`, o.`userid`, o.`procount`, o.`orderprice`, o.`orderstate`, o.`orderdate`, o.`paydate`, o.`ret-state`, o.`people`, o.`contact` FROM `#@__education_order` o LEFT JOIN `#@__education_class` s ON o.`proid` = s.`id` LEFT JOIN `#@__education_courses` c ON s.`coursesid` = c.`id` LEFT JOIN `#@__member` m ON m.`id` = o.`userid` WHERE 1 = 1" . $where);
		}
        //商家订单列表
        else{

			$where .= " AND o.`orderstate` != 0 ";
			$userinfo = $userLogin->getMemberInfo();
			if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "education"))){
				return array("state" => 200, "info" => $langData['travel'][12][27]);//商家权限验证失败！
			}
			if($userinfo['userType'] == 2){
				$sql = $dsql->SetQuery("SELECT c.`id` FROM `#@__education_store` s LEFT JOIN `#@__education_courses` c ON c.`userid` = s.`id` WHERE s.`userid` = '$userid'");
			}else{
				$sql = $dsql->SetQuery("SELECT c.`id` FROM `#@__education_courses` c WHERE c.`userid` = '$userid'");
			}
			$Res = $dsql->dsqlOper($sql, "results");
			$sidArr = array();
			if($Res && is_array($Res)){
				foreach ($Res as $key => $value) {
                    if($value['id']){
					    $sidArr[$key] = $value['id'];
                    }
				}
				if(!empty($sidArr)){
					$where .= " AND s.`coursesid` in (".join(",",$sidArr).")";
				}else{
                    $where .= " AND 1 = 2";
                }
			}else{
				$pageinfo = array(
					"page" => $page,
					"pageSize" => $pageSize,
					"totalPage" => 0,
					"totalCount" => 0
				);
				return array("pageInfo" => $pageinfo, "list" => array());
			}

			$archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`proid`, o.`userid`, o.`procount`, o.`orderprice`, o.`orderstate`, o.`orderdate`, o.`paydate`, o.`ret-state`, o.`people`, o.`contact` FROM `#@__education_order` o LEFT JOIN `#@__education_class` s ON o.`proid` = s.`id` LEFT JOIN `#@__education_courses` c ON s.`coursesid` = c.`id` LEFT JOIN `#@__member` m ON m.`id` = o.`userid` WHERE 1 = 1" . $where);
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);
		//未付款
		$state0 = $dsql->dsqlOper($archives." AND `orderstate` = 0", "totalCount");
		//已付款，待确认
		$state1 = $dsql->dsqlOper($archives." AND `orderstate` = 1", "totalCount");
		//待服务
		$state2 = $dsql->dsqlOper($archives." AND `orderstate` = 2", "totalCount");

		$state20 = $dsql->dsqlOper($archives." AND (`orderstate` = 2 or `orderstate` = 4)", "totalCount");
		//服务无效
		$state3 = $dsql->dsqlOper($archives." AND `orderstate` = 3", "totalCount");
		//已确认，待服务
		$state4 = $dsql->dsqlOper($archives." AND `orderstate` = 4", "totalCount");
		//已服务，待客户验收
		$state5 = $dsql->dsqlOper($archives." AND `orderstate` = 5", "totalCount");
		//服务完成
		$state6 = $dsql->dsqlOper($archives." AND `orderstate` = 6", "totalCount");
		//已取消
		$state7 = $dsql->dsqlOper($archives." AND `orderstate` = 7", "totalCount");
		//退款中
		$state8 = $dsql->dsqlOper($archives." AND `orderstate` = 8 and `ret-state` = 1 ", "totalCount");
		//已退款
		$state9 = $dsql->dsqlOper($archives." AND `orderstate` = 9", "totalCount");

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount,
			"state0"    => $state0,
			"state1"    => $state1,
			"state2"    => $state2,
			"state3"    => $state3,
			"state4"    => $state4,
			"state5"    => $state5,
			"state6"    => $state6,
			"state7"    => $state7,
			"state8"    => $state8,
			"state9"    => $state9,
			"state20"   => $state20
		);

		if($totalCount == 0) return array("pageInfo" => $pageinfo, "list" => array());

		$where = "";
		if($state != "" && $state != 20){
			$where = " AND `orderstate` = " . $state;
		}

		//退款
		if($state == 8){
			$where = " AND `ret-state` = 1";
		}

		if($state == 20){
			$where = " AND (`orderstate` = 2 or `orderstate` = 4)";
		}

		//待评价
		if($state == 5){
			//$where = " AND `orderstate` = 3 AND `common` = 0";
		}

		//已发货
		if($state == 6){
			//$where = " AND `orderstate` = 6 AND `exp-date` != 0";
		}

		$atpage = $pageSize*($page-1);
		$where .= " ORDER BY `id` DESC LIMIT $atpage, $pageSize";

		$results = $dsql->dsqlOper($archives.$where, "results");
		if($results){
			$isMobile = isMobile();
			if($isMobile){
				$template = "pay";
			}else{
				$template = "pay2";
			}

			$param = array(
					"service"     => "education",
					"template"    => $template,
					"param"       => "ordernum=%id%"
				);
			$payurlParam = getUrlPath($param);

			$param = array(
				"service"  => "member",
				"type"     => "user",
				"template" => "orderdetail",
				"module"   => "education",
				"id"       => "%id%",
				"param"    => "rates=1"
			);
			$commonUrlParam = getUrlPath($param);

			foreach($results as $key => $val){
				$list[$key]['id']          = $val['id'];
				$list[$key]['ordernum']    = $val['ordernum'];
				$list[$key]['proid']       = $val['proid'];
				$list[$key]['procount']    = $val['procount'];
				$list[$key]['people']      = $val['people'];
				$list[$key]['contact']     = $val['contact'];

				//计算订单价格
				$totalPrice = $val['orderprice'] * $val['procount'];
				$list[$key]['orderprice']  = $totalPrice;
				$list[$key]["orderstate"]  = $val['orderstate'];
				$list[$key]['orderdate']   = $val['orderdate'];
				$list[$key]['paydate']     = $val['paydate'];
				$list[$key]['retState']    = $val['ret-state'];

				//买家信息
				$uid = $val['userid'];
				$list[$key]['member']     = getMemberDetail($uid);

				$this->param = $val['proid'];
				$proDetail = $this->classDetail();
				$list[$key]['title']  = $proDetail['classname'];
				$list[$key]['store']  = $proDetail['coursesArr']['user'];

				if (isMobile()) {
					$param = array(
						"service"     => "education",
						"template"    => "class-detail",
						"id"          => $proDetail['id']
					);
				}else{
					$param = array(
						"service"     => "education",
						"template"    => "detail",
						"id"          => $proDetail['coursesid']
					);
				}

				$list[$key]['product']['title']  = $proDetail['title'] ? $proDetail['title'] : $proDetail['coursesArr']['title'];
				$list[$key]['product']['classtitle']= $proDetail['classname'];
				$list[$key]['product']['coursestitle']= $proDetail['coursesArr']['title'];
				$list[$key]['product']['litpic'] = $proDetail['coursesArr']['pics'][0]['path'];
				$list[$key]['product']['price']  = $proDetail['price'];
				$list[$key]['product']['url']    = getUrlPath($param);

				//未付款的提供付款链接
				if($val['orderstate'] == 0){
					$RenrenCrypt = new RenrenCrypt();
					$encodeid = base64_encode($RenrenCrypt->php_encrypt($val["ordernum"]));
					$list[$key]["payurl"] = str_replace("%id%", $encodeid, $payurlParam);
				}

			}
		}
		// var_dump($list);die;
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
	 * 删除订单
	 * @return array
	 */
	public function delOrder(){
		global $dsql;
		global $userLogin;
		global $langData;

		$id = $this->param['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！

		//获取用户ID
		$uid = $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		$archives = $dsql->SetQuery("SELECT * FROM `#@__education_order` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results = $results[0];
			if($results['userid'] == $uid){
				//未付款 已取消 交易完成 退款成功
				if($results['orderstate'] == 0 || $results['orderstate'] == 7 || $results['orderstate'] == 3 || $results['orderstate'] == 9){
					$archives = $dsql->SetQuery("DELETE FROM `#@__education_order` WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");
                        
                    //记录用户行为日志
                    memberLog($uid, 'education', '', 0, 'delete', '删除订单('.$results['ordernum'].')', '', $archives);

					return  $langData['travel'][13][39];//删除成功！
				}else{
					return array("state" => 101, "info" => $langData['travel'][13][40]);//订单为不可删除状态！
				}
			}else{
				return array("state" => 101, "info" => $langData['travel'][13][41]);//权限不足，请确认帐户信息后再进行操作！
			}
		}else{
			return array("state" => 101, "info" => $langData['travel'][13][42]);//订单不存在，或已经删除！
		}
	}

	/**
     * 教育订单详细
     * @return array
     */
	public function orderDetail(){
		global $dsql;
		global $langData;
		global $cfg_pointRatio;
		$orderDetail = $cardnum = $cardnumList = array();
		$id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];

		global $userLogin;
		$userid = $userLogin->getMemberID();

		if(!is_numeric($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！

		// $sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = '$userid'");
		// // var_dump($sql);die;
		// $Res = $dsql->dsqlOper($sql, "results");
		// if(!empty($Res[0]['id'])){
		// 	$userid = $Res[0]['id'];
		// }

		//主表信息
		$archives = $dsql->SetQuery("SELECT o.*, s.`id`as sid ,c.`id` as cid FROM `#@__education_order` o  LEFT JOIN `#@__education_class` s ON o.`proid` = s.`id` LEFT JOIN `#@__education_courses` c ON s.`coursesid` = c.`id` WHERE ( o.`userid` = '$userid' OR c.`userid` = '$userid') AND o.`id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		if(!empty($results)){

			$results = $results[0];

			$orderDetail["ordernum"]   = $results["ordernum"];
			$orderDetail["userid"]     = $results["userid"];
			$orderDetail["contact"]    = $results["contact"];
			$orderDetail["failnote"]   = $results["failnote"];
			$orderDetail["proid"]      = $results["proid"];
			$orderDetail["enddate"]    = FloorTime($results["nopaydate"], $n = 2);

			//会员信息
			$orderDetail['member']     = getMemberDetail($results['userid']);

			//商品信息
			$proid = $results['proid'];
			$this->param = $proid;
			$detail = $this->classDetail();
			$orderDetail['title']  = $detail['classname'] ? $detail['classname'] : $detail['coursesArr']['title'];
			$isMobile = isMobile();
			if ($isMobile) {

				$param = array(
				"service"     => "education",
				"template"    => "class-detail",
				"id"          => $detail['id']
				);

			}else{
				$param = array(
				"service"     => "education",
				"template"    => "detail",
				"id"          => $results['cid']
				);
			}

			$orderDetail['product']['id']       = $detail['id'];
			$orderDetail['product']['title']    = $detail['classname'] ? $detail['classname'] : $detail['coursesArr']['title'];
			$orderDetail['product']['litpic']   = $detail['coursesArr']['pics'][0]['path'];
			$orderDetail['product']['price']    = $detail['price'];
			$orderDetail['product']['phone']    = $detail['coursesArr']['user']['phone'];

			$url = getUrlPath($param);
			$orderDetail['product']['url'] = $url;

			$orderDetail["procount"]   = $results["procount"];

			//总价
			$totalAmount = 0;
			$orderprice = $results["orderprice"];
			$point      = $results["point"];
			$balance    = $results["balance"];
			$payprice   = $results["payprice"];
			$procount   = $results["procount"];
			$totalAmount += $orderprice * $procount;


			$orderDetail["orderprice"] = $orderprice;
			$orderDetail["totalmoney"] = $totalAmount;
			$orderDetail["pointprice"]  = $point  / $cfg_pointRatio;

			$orderDetail["balance"]    = $balance;
			$orderDetail["payprice"]   = $payprice;
			$orderDetail["orderstate"] = $results["orderstate"];
			$orderDetail["orderdate"]  = $results["orderdate"];

			$orderDetail["people"]  = aesDecrypt($results["people"]);
			$orderDetail["contact"]  = aesDecrypt($results["contact"]);
			$orderDetail["note"]  = $results["note"];

			//未付款的提供付款链接
			if($results['orderstate'] == 0){
				$RenrenCrypt = new RenrenCrypt();
				$encodeid = base64_encode($RenrenCrypt->php_encrypt($results["ordernum"]));

				$param = array(
					"service"     => "education",
					"template"    => "pay",
					"param"       => "ordernum=".$encodeid
				);
				$payurl = getUrlPath($param);

				$orderDetail["payurl"] = $payurl;
			}


			//支付方式
			$paySql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$results["paytype"]."'");
			$payResult = $dsql->dsqlOper($paySql, "results");
			if(!empty($payResult)){
				$orderDetail["paytype"]   = $payResult[0]["pay_name"];
			}else{
				global $cfg_pointName;
				$payname = "";
				if($results["paytype"] == "point,money"){
					$payname = $cfg_pointName."+".$langData['homemaking'][9][43];//余额
				}elseif($results["paytype"] == "point"){
					$payname = $cfg_pointName;
				}elseif($results["paytype"] == "money"){
					$payname = $langData['homemaking'][9][43];//余额
				}
				$orderDetail["paytype"]   = $payname;
			}

			$orderDetail["paydate"]   = $results["paydate"];

			//退款状态
			$orderDetail["retState"]    = $results["ret-state"];

			//退款原因
			$orderDetail["retType"]    = $results["ret-type"];
			$orderDetail["retNote"]    = $results["ret-note"];

			$imglist = array();
			$pics = $results['ret-pics'];
			if(!empty($pics)){
				$pics = explode(",", $pics);
				foreach ($pics as $key => $value) {
					$imglist[$key]['val'] = $value;
					$imglist[$key]['path'] = getFilePath($value);
				}
			}

			$orderDetail["retPics"]    = $imglist;
			$orderDetail["retDate"]    = $results["ret-date"];

			$picslist = array();
			$pics = $results['pics'];
			if(!empty($pics)){
				$picsArr = explode(",", $pics);
				foreach ($picsArr as $key => $value) {
					$picslist[$key]['val'] = $value;
					$picslist[$key]['path'] = getFilePath($value);
				}
			}
			$orderDetail["picslist"]    = $picslist;

			//退款确定时间
			$orderDetail["retOkdate"]    = $results["ret-ok-date"];

			$orderDetail['now'] = GetMkTime(time());


			//卖家信息
			// $this->param = (int)$results['sid'];
			// $orderDetail['store'] = $this->storeDetail();

		}

		return $orderDetail;
	}

	/**
	 * 操作订单状态
	 * oper=cancelrefund 会员取消退款 返回上一次订单状态
	 * oper=cancel 会员取消退款
	 * @return array
	 */
	public function operOrder(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid      = $userLogin->getMemberID();
		$userinfo    = $userLogin->getMemberInfo();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		$param           =  $this->param;
		$id              =  $param['id'];
		$oper            =  $param['oper'];
		$pubdate         =  GetMkTime(time());
		$date            =  GetMkTime(time());

		if(empty($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);//参数错误！

		if($oper == "cancelrefund"){//会员取消退款
			$archives = $dsql->SetQuery("SELECT `id`, `userid`, `ordernum`, `refundtorderstate` FROM `#@__education_order` WHERE `id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$results = $results[0];
				$orderstate = $results['refundtorderstate'];
                $ordernum = $results['ordernum'];

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__education_order` SET  `ret-date` = '0', `refundtorderstate` = '0', `orderstate` = '$orderstate', `ret-state` = 0 WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					return array("state" => 200, "info" => $langData['travel'][13][44]); //保存到数据时发生错误，请检查字段内容！
				}
                    
                //记录用户行为日志
                memberLog($userid, 'education', '', 0, 'update', '取消退款('.$ordernum.')', '', $archives);

				return $langData['travel'][13][45];//提交成功！
			}else{
				return array("state" => 101, "info" => $langData['travel'][13][46]);//订单不存在，或已经删除！
			}
		}elseif($oper == 'cancel'){//取消订单
			$archives = $dsql->SetQuery("SELECT `id`, `proid`, `procount`, `userid`, `ordernum`, `point`, `balance`, `payprice`, `refundtorderstate` FROM `#@__education_order` WHERE `id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$results  = $results[0];

				$point    = $results['point'];    //需要退回的积分
				$balance  = $results['balance'];  //需要退回的余额
				$payprice = $results['payprice']; //需要退回的支付金额
				$ordernum = $results['ordernum'];
				$procount = $results['procount'];
				$proid    = $results['proid'];

				$now1 = GetMkTime(date('Y-m-d', time()));


				/* if($walktime < $now1){
					return array("state" => 101, "info" => $langData['travel'][13][93]);//逾期不可取消！
				} */
				//更新已购买数量
				$sql = $dsql->SetQuery("UPDATE `#@__education_class` SET `sale` = `sale` - $procount WHERE `id` = '$proid'");
				$dsql->dsqlOper($sql, "update");


				//更新订单状态
				$sql = $dsql->SetQuery("UPDATE `#@__education_order` SET `orderstate` = 7 WHERE `id` = ".$id);
				$dsql->dsqlOper($sql, "update");
                    
                //记录用户行为日志
                memberLog($userid, 'education', '', 0, 'update', '取消订单('.$ordernum.')', '', $sql);

				//退回积分
				if(!empty($point)){
				    global  $userLogin;
					$archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$userid'");
					$dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($userid);
                    $userpoint = $user['point'];
					//保存操作日志
					$info = $langData['education'][7][45].$ordernum;
					$archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$point', '$info', '$date','tuihui','$userpoint')");
					$dsql->dsqlOper($archives, "update");
				}

				$pay_name = '';
				$pay_namearr = array();
            	$paramUser = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "action"   => "education",
                    "id"       => $id
                );
                $urlParam = serialize($paramUser);

				//退回余额
				$money = $balance + $payprice;

                if($pay_name){
                    array_push($pay_namearr,$pay_name);
                }

                if($money != ''){
                    array_push($pay_namearr,"余额");
                }

                if($point != ''){
                   array_push($pay_namearr,"积分");
                }

                if($pay_namearr){
                  $pay_name = join(',',$pay_namearr);
                }
                $tuikuan  = array(
                	'paytype' 				=> $pay_name,
                	'truemoneysy'			=> 0,
                	'money_amount'  		=> $money,
                	'point'					=> $point,
                	'refrunddate'			=> 0,
                	'refrundno'				=> 0
                );
                $tuikuanparam = serialize($tuikuan);
				if($money > 0){
					$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$money' WHERE `id` = '$userid'");
					$dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($userid);
                    $usermoney = $user['money'];
//                    $moneyy  = sprintf('%.2f',($usermoney+$money));
					//保存操作日志
					$info = $langData['education'][7][45].$ordernum;
					$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$userid', '1', '$money', '$info', '$date','education','tuikuan','$urlParam','$ordernum','$tuikuanparam','教育消费','$usermoney')");
					$dsql->dsqlOper($archives, "update");


					//减去会员的冻结金额
					$archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$money' WHERE `id` = '$userid'");
					$dsql->dsqlOper($archives, "update");

					//如果冻结金额小于0，重置冻结金额为0
					$archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$userid'");
					$ret = $dsql->dsqlOper($archives, "results");
					if($ret){
						if($ret[0]['freeze'] < 0){
							$archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$userid'");
							$dsql->dsqlOper($archives, "update");
						}
					}
				}

				return $langData['travel'][13][45];//提交成功！

			}else{
				return array("state" => 101, "info" => $langData['travel'][13][46]);//订单不存在，或已经删除！
			}
		}

	}

	/**
	 * 买家申请退款
	 */
	public function refund(){
		global $dsql;
		global $userLogin;
		global $langData;

		$id      = $this->param['id'];

		if(empty($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);//参数错误！
		//获取用户ID
		$uid = $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		//验证订单
		$archives = $dsql->SetQuery("SELECT o.`id`, o.`orderprice`, o.`ordernum`, o.`procount`, o.`orderstate`, o.`proid` FROM `#@__education_order` o LEFT JOIN `#@__education_class` s ON o.`proid` = s.`id` WHERE o.`id` = '$id' AND o.`userid` = '$uid' AND (o.`orderstate` = 1 OR o.`orderstate` = 5 OR o.`orderstate` = 2 OR o.`orderstate` = 4) AND o.`ret-state` = 0");
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

			//商品信息
			$this->param = $results[0]['proid'];
			$detail = $this->classDetail();

			$title      = $detail['classname'] ? $detail['classname'] : $detail['coursesArr']['title'];      //商品名称
			$procount   = $results[0]['procount'];   //购买数量
			$orderprice = $results[0]['orderprice']; //单价
			$ordernum   = $results[0]['ordernum'];   //订单号
			$sid        = $detail['coursesArr']['user']['userid'];        //卖家会员ID
			$orderstate = $results[0]['orderstate']; //订单状态
			$date       = GetMkTime(time());
			$retnote    = '';

			$orderIdArr = array();

			$paramBusi = array(
				"service"  => "member",
				"template" => "orderdetail",
				"action"   => "education",
				"id"       => $id
			);

			//获取会员名
			$username = "";
			$sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $sid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
			}
			updateMemberNotice($sid, "会员-订单退款通知", $paramBusi, array("username" => $username, "order" => $ordernum, 'amount' => $orderprice, 'info' => $retnote),'','',0,1);

			$sql = $dsql->SetQuery("UPDATE `#@__education_order` SET `refundtorderstate` = '$orderstate', `orderstate` = 8, `ret-state` = 1, `ret-date` = '$date' WHERE `id` = ".$id);
			$dsql->dsqlOper($sql, "update");
                
            //记录用户行为日志
            memberLog($uid, 'education', '', 0, 'update', '申请退款('.$ordernum.')', '', $sql);

			return $langData['travel'][13][70];//操作成功！

		}else{
			return array("state" => 200, "info" => $langData['homemaking'][9][70]);//操作失败，请核实订单状态后再操作！
		}
	}

	/**
	 * 商家退款
	 */
	public function refundPay(){
		global $dsql;
		global $userLogin;
		global $langData;

		$id = $this->param['id'];

		if(empty($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);//数据不完整，请检查！

		//获取用户ID
		$uid = $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}


		//验证订单
		$archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`point`, o.`proid`, o.`balance`, o.`payprice`, o.`orderprice`, o.`procount`, o.`userid` FROM `#@__education_order` o LEFT JOIN `#@__education_class` s ON o.`proid` = s.`id` WHERE o.`id` = '$id' AND s.`userid` = '$uid' AND o.`orderstate` = 8 AND o.`ret-state` = 1");
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

			//验证商家账户余额是否足以支付退款
			$uinfo = $userLogin->getMemberInfo();
			$umoney = $uinfo['money'];

			$date     = GetMkTime(time());
			$proid      = $results[0]['proid'];      //商品ID
			$ordernum   = $results[0]['ordernum'];   //需要退回的订单号
			$orderprice = $results[0]['orderprice']; //订单商品单价
			$procount   = $results[0]['procount'];   //订单商品数量
			$totalMoney = $orderprice * $procount;   //需要扣除商家的费用

			//商品名称
			$this->param = $results[0]['proid'];
			$detail = $this->classDetail();
			$title       = $detail['classname'] ? $detail['classname'] : $detail['coursesArr']['title'];      //商品名称

			//更新已购买数量
			$sql = $dsql->SetQuery("UPDATE `#@__education_class` SET `sale` = `sale` - $procount WHERE `id` = '$proid'");
			$dsql->dsqlOper($sql, "update");

			//更新订单状态
			$now = GetMkTime(time());
			$sql = $dsql->SetQuery("UPDATE `#@__education_order` SET `ret-state` = 0, `orderstate` = 9, `ret-ok-date` = '$now' WHERE `id` = ".$id);
			$dsql->dsqlOper($sql, "update");

            //记录用户行为日志
            memberLog($uid, 'education', '', 0, 'update', '商家确认退款('.$ordernum.')', '', $sql);

			//退回会员积分、余额
			$userid   = $results[0]['userid'];   //需要退回的会员ID
			$point    = $results[0]['point'];    //需要退回的积分
			$balance  = $results[0]['balance'];  //需要退回的余额
			$payprice = $results[0]['payprice']; //需要退回的支付金额

			//退回积分
			if(!empty($point) && $point>0){
			    global  $userLogin;
				$archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$userid'");
				$dsql->dsqlOper($archives, "update");
                $user  = $userLogin->getMemberInfo($userid);
                $userpoint = $user['point'];
				//保存操作日志
				$info = $langData['education'][7][45].$ordernum;
				$archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$point', '$info', '$date','tuihui','$userpoint')");
				$dsql->dsqlOper($archives, "update");
			}
			$pay_name = '';
			$pay_namearr = array();
        	$paramUser = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "education",
                "id"       => $id
            );
            $urlParam = serialize($paramUser);


			//退回余额
			$money = $balance + $payprice;
            if($pay_name){
                array_push($pay_namearr,$pay_name);
            }

            if($money != ''){
                array_push($pay_namearr,"余额");
            }

            if($point != ''){
               array_push($pay_namearr,"积分");
            }

            if($pay_namearr){
              $pay_name = join(',',$pay_namearr);
            }

            $tuikuan  = array(
            	'paytype' 				=> $pay_name,
            	'truemoneysy'			=> 0,
            	'money_amount'  		=> $money,
            	'point'					=> $point,
            	'refrunddate'			=> 0,
            	'refrundno'				=> 0
            );
            $tuikuanparam = serialize($tuikuan);
			if($money > 0){
				$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$money' WHERE `id` = '$userid'");
				$dsql->dsqlOper($archives, "update");
                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
//                $moneyy = sprintf('%.2f',($usermoney+$money));
				//保存操作日志
				$info = $langData['education'][7][45].$ordernum;
				$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$userid', '1', '$money', '$info', '$date','education','tuikuan','$urlParam','$ordernum','$tuikuanparam','教育消费','$usermoney')");
				$dsql->dsqlOper($archives, "update");


				//减去会员的冻结金额
				$archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$money' WHERE `id` = '$userid'");
				$dsql->dsqlOper($archives, "update");

				//如果冻结金额小于0，重置冻结金额为0
				$archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$userid'");
				$ret = $dsql->dsqlOper($archives, "results");
				if($ret){
					if($ret[0]['freeze'] < 0){
						$archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$userid'");
						$dsql->dsqlOper($archives, "update");
					}
				}
			}

			$paramBusi = array(
				"service"  => "member",
				"type"     => "user",
				"template" => "orderdetail",
				"action"   => "education",
				"id"       => $id
			);

			//获取会员名
			$username = "";
			$sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
			}
			updateMemberNotice($userid, "会员-订单退款成功", $paramBusi, array("username" => $username, "order" => $ordernum, 'amount' => $money),'','',0,1);

			return $langData['homemaking'][9][73];//退款成功！

		}else{
			return array("state" => 200, "info" => $langData['homemaking'][9][70]);//操作失败，请核实订单状态后再操作！
		}

	}

	/**
	 * 计划任务
	 */
	public function receipt(){
		global $dsql;
		global $userLogin;
		global $langData;
		global $siteCityInfo;
		$id = $this->param['id'];

		if(empty($id)) return array("state" => 200, "info" => $langData['travel'][12][23]);  //参数错误！

		//验证订单
		$archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`procount`, o.`orderprice`, o.`balance`, o.`payprice`, o.`userid`, o.`proid`, o.`paytype` FROM `#@__education_order` o  WHERE o.`id` = '$id' AND o.`orderstate` = 1");
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

			//更新订单状态
			$now = GetMkTime(time());
			$sql = $dsql->SetQuery("UPDATE `#@__education_order` SET `orderstate` = '3' WHERE `id` = ".$id);
			$dsql->dsqlOper($sql, "update");

			//将订单费用转到卖家帐户
			$date       = GetMkTime(time());
			$ordernum   = $results[0]['ordernum'];   //订单号
			$procount   = $results[0]['procount'];   //数量
			$orderprice = $results[0]['orderprice']; //单价
			$balance    = $results[0]['balance'];    //余额金额
			$payprice   = $results[0]['payprice'];   //支付金额
			$userid     = $results[0]['userid'];     //买家ID
			$proid      = $results[0]['proid'];
			$paytype    = $results[0]['paytype'];
			$orderid    = $results[0]['id'];

			//第三方支付平台支付订单ID
			$transaction_id = '';
			$sql = $dsql->SetQuery("SELECT `transaction_id`,`id`,`amount` FROM `#@__pay_log` WHERE `body` = '$ordernum'");
			$ret = $dsql->dsqlOper($sql, "results");
			$truepayprice = 0;
			$pid 		  = '';
			if($ret){
				$transaction_id = $ret[0]['transaction_id'];
				$pid 			= $ret[0]['id'];
				$truepayprice  	= $ret[0]['amount'];
			}


			$this->param = $proid;
			$detail      = $this->classDetail();
			$uid         = $detail['coursesArr']['user']['userid'];         //卖家ID
			$title       = $detail['classname'] ? $detail['classname'] : $detail['coursesArr']['title'];      //商品名称

			//如果有使用余额和第三方支付，将买家冻结的金额移除并增加日志
			$totalPayPrice = $balance + $payprice;
			if($totalPayPrice > 0){
				//减去消费会员的冻结金额
				$archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$totalPayPrice' WHERE `id` = '$userid'");
				$dsql->dsqlOper($archives, "update");

				//如果冻结金额小于0，重置冻结金额为0
				$archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$userid'");
				$ret = $dsql->dsqlOper($archives, "results");
				if($ret){
					if($ret[0]['freeze'] < 0){
						$archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$userid'");
						$dsql->dsqlOper($archives, "update");
					}
				}
				$info = $langData['education'][7][44] . $ordernum;
                //保存操作日志
                $paramUser = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "action"   => "education",
                    "id"       => $orderid
                );
                $urlParam = serialize($paramUser);
                $classnamesql = $dsql->SetQuery("SELECT `classname` FROM `#@__education_class` WHERE `id` = '$proid'");

                $classnameres = $dsql->dsqlOper($classnamesql,'results');
                $user  = $userLogin->getMemberInfo($userid);

                //paysuccess中已经记录了余额记录，这里不需要重复记录
                // $usermoney = $user['money'];
                // $info = $langData['education'][7][44].'-购买课程'.$classnameres[0]['classname']."-".$ordernum;
                // $title_ = "教育消费-".$title;
				// $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`pid`,`title`,`ordernum`) VALUES ('$userid', '0', '$totalPayPrice', '$info', '$date','education','xiaofei','$urlParam','$pid','$title_','$ordernum')");
				// $dsql->dsqlOper($archives, "update");
			}

			$addridsql  = $dsql->SetQuery("SELECT `addr` FROM `#@__member` WHERE `id` = ".$uid);

			$addridre   = $dsql->dsqlOper($addridsql,"results");


			$addrid     = is_array($addridre) ? $addridre[0]['addr'] : 0;

			//商家结算
			//扣除佣金
			global $cfg_educationFee;
			global $cfg_fzeducationFee;
			$cfg_educationFee = (float)$cfg_educationFee;
			$cfg_fzeducationFee = (float)$cfg_fzeducationFee;

			$fee = $totalPayPrice * $cfg_educationFee / 100;
            $fee = floor($fee * 100) / 100; // 保留2位小数，不进行四舍五入，服务商分账时，不会四舍五入
			$fee = $fee < 0.01 ? 0 : $fee;

			$totalPayPrice_ = sprintf('%.2f', $totalPayPrice - $fee);

			//分销信息
			global $cfg_fenxiaoState;
			global $cfg_fenxiaoSource;
			global $cfg_fenxiaoDeposit;
			global $cfg_fenxiaoAmount;
			include HUONIAOINC."/config/education.inc.php";
			$fenXiao = (int)$customfenXiao;

			//分销金额
			$_fenxiaoAmount = $totalPayPrice;
			if($cfg_fenxiaoState && $fenXiao){

				//商家承担
				if($cfg_fenxiaoSource){
                    $fx_shouldMoney = ($totalPayPrice * $cfg_fenxiaoAmount / 100);
					$totalPayPrice_ = $totalPayPrice_ - $fx_shouldMoney;

				//平台承担
				}else{
					$_fenxiaoAmount = $fee;
				}
			}

            $userinfo = $userLogin->getMemberInfo($uid);
            $cityid = $userinfo['cityid'];
            $cityName 	=  getSiteCityName($cityid);

			$_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;
            //分佣
            $paramarr['amount'] = $_fenxiaoAmount;
            if($fenXiao ==1) {
                $_fx_title = $ordernum;
                (new member())->returnFxMoney("education", $userid, $_fx_title, $paramarr);
                //查询一共分销了多少佣金
                $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_fx_title' AND `module`= 'education'");
                $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                if($cfg_fenxiaoSource){
                    $fx_less = $fx_shouldMoney  - $fenxiaomonyeres[0]['allfenxiao'];
                    //如果系统没有开启资金沉淀才需要查询实际分销了多少
                    if(!$cfg_fenxiaoDeposit){
                        $totalPayPrice_     += $fx_less; //没沉淀，还给商家
                    }else{
                        $precipitateMoney = $fx_less;
                        if($precipitateMoney > 0){
                            (new member())->recodePrecipitationMoney($uid,$ordernum,$_fx_title,$precipitateMoney,$cityid,"education");
                        }
                    }
                }
            }
			$totalPayPrice_ = $totalPayPrice_ < 0.01 ? 0 : $totalPayPrice_;



//            $cityidsql  = $dsql->SetQuery("SELECT `addr` FROM `#@__member` WHERE `id` =".$uid);
//            $cityres 	= $dsql->dsqlOper($cityidsql,"results");
//
//            $addr = $cityres[0]['addr'];

//            $cityid  	= getPublicParentInfo(array('tab' => 'site_area', 'id' => $addr, 'split' => '/', 'type' => 'typename', 'action' => 'addr','returntype' => '1'));
            //分站佣金
            $fzFee = cityCommission($cityid,'education');
            //分站
            $fztotalAmount_ =  $fee * $fzFee / 100 ;
            $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
            $fee-=$fztotalAmount_;//总站-=分站
			if($totalPayPrice_ > 0){
				$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$totalPayPrice_' WHERE `id` = '$uid'");
				$dsql->dsqlOper($archives, "update");

				//分站
				$fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
				$dsql->dsqlOper($fzarchives, "update");

				//保存操作日志
                $paramBusi = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "education-order"
                );
                $urlParam = serialize($paramBusi);
                $classnamesql = $dsql->SetQuery("SELECT `classname` FROM `#@__education_class` WHERE `id` = '$proid'");

                $classnameres = $dsql->dsqlOper($classnamesql,'results');
                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
//                $money       = sprintf('%.2f',($usermoney+$totalPayPrice_));
				$info  = $langData['education'][7][44].'-课程收入'.$classnameres[0]['classname']."-". $ordernum;
				$title = "教育订单收入";
				$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`ordertype`,`platform`,`ctype`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$totalPayPrice_', '$info', '$date','$cityid','education',$fee,'shangpinxiaoshou','$urlParam','$title','$ordernum','$usermoney')");
				$dsql->dsqlOper($archives, "update");

                $archives1 = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$uid', '1', '$totalPayPrice_', '$info', '$date','$cityid','$fztotalAmount_','education',$fee,'1','shangpinxiaoshou')");
//                $dsql->dsqlOper($archives1, "update");
                $lastid = $dsql->dsqlOper($archives1, "lastid");
                substationAmount($lastid,$cityid);

                if($truepayprice <=0){
					$truepayprice = $totalPayPrice_;
				}
				//工行E商通银行分账
				if($transaction_id){
					rfbpShareAllocation(array(
						"uid" => $uid,
						"ordertitle" => $langData['education'][7][44], //教育订单
						"ordernum" => $ordernum,
						"orderdata" => array('课程名称' => $title),
						"totalAmount" => $totalPayPrice,
						"amount" => $truepayprice,
						"channelPayOrderNo" => $transaction_id,
						"paytype" => $paytype
					));
				}
			}

		 	//微信通知
		    $param = array(
	    		'type' 	 => "1", //区分佣金 给分站还是平台发送 1分站 2平台
	        	'cityid' => $cityid,
	            'notify' => '管理员消息通知',
	            'fields' =>array(
		            'contentrn'  => $cityName.'分站——education模块——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_),
		            'date' => date("Y-m-d H:i:s", time()),
		        )
		    );

		    $params = array(
	    		'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
	        	'cityid' => $cityid,
	            'notify' => '管理员消息通知',
	            'fields' =>array(
		            'contentrn'  => $cityName.'分站——education模块——平台获得佣金 :'.$fee.' ——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_),
		            'date' => date("Y-m-d H:i:s", time()),
		        )
		    );
	        //后台微信通知
	        updateAdminNotice("education", "detail",$param);
	        updateAdminNotice("education", "detail",$params);



			//商家会员消息通知
			$paramBusi = array(
				"service"  => "member",
				"template" => "orderdetail",
				"action"   => "education",
				"id"       => $id
			);

			//获取会员名
			$username = "";
			$sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
			}

			//自定义配置
			$config = array(
				"username" => $username,
				"title" => $title,
				"amount" => $totalPayPrice,
				"fields" => array(
					'keyword1' => '商品信息',
					'keyword2' => '下单时间',
					'keyword3' => '订单金额',
					'keyword4' => '订单状态'
				)
			);

			updateMemberNotice($uid, "会员-商品成交通知", $paramBusi, $config,'','',0,1);



			//返积分
			(new member())->returnPoint("education", $userid, $totalPayPrice, $ordernum,$totalPayPrice_,$uid);

			return $langData['siteConfig'][20][244];  //操作成功

		}else{
			return array("state" => 200, "info" => $langData['shop'][4][23]);  //操作失败，请核实订单状态后再操作！
		}
	}

	/**
	 * 授课方式
	 */
	public function typeid_type(){
		global $langData;
		$typeList = array();
        $typeList[] = array('id' => 0, 'typename' => $langData['education'][7][0], 'lower' => array()); //老师上门
		$typeList[] = array('id' => 1, 'typename' => $langData['education'][7][1], 'lower' => array()); //老师提供场地
        return $typeList;
	}

	public function gettypename($fun, $id){
        $list = $this->$fun();
        return $list[array_search($id, array_column($list, "id"))]['typename'];
    }


}
