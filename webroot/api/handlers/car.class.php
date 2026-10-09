<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 汽车模块API接口
 *
 * @version        $Id: car.class.php 2019-03-20 上午09:31:13 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class car {
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
     * 自助建站基本参数
     * @return array
     */
	public function config(){

		require(HUONIAOINC."/config/car.inc.php");

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
		// global $custom_map;               //自定义地图
		// global $customTemplate;           //模板风格

		global $cfg_map;                  //系统默认地图
		// global $customTemplate;           //模板风格

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

		// $domainInfo = getDomain('car', 'config');
		// $customChannelDomain = $domainInfo['domain'];
		// if($customSubDomain == 0){
		// 	$customChannelDomain = "http://".$customChannelDomain;
		// }elseif($customSubDomain == 1){
		// 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
		// }elseif($customSubDomain == 2){
		// 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
		// }

		// include HUONIAOINC.'/siteModuleDomain.inc.php';
		$customChannelDomain = getDomainFullUrl('car', $customSubDomain);

		//分站自定义配置
        $ser = 'car';
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
				}elseif($param == "template"){
					$return['template'] = $customTemplate;
				}elseif($param == "touchTemplate"){
					$return['touchTemplate'] = $customTouchTemplate;
				}elseif($param == "map"){
					$return['map'] = $custom_map;
				}elseif($param == "template"){
					$return['template'] = $customTemplate;
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
			$return['template']      = $customTemplate;
			$return['softSize']      = $custom_softSize;
			$return['softType']      = $custom_softType;
			$return['thumbSize']     = $custom_thumbSize;
			$return['thumbType']     = $custom_thumbType;

			$return['storeatlasMax'] = $custom_store_atlasMax;
			$return['caratlasMax']   = $custom_car_atlasMax;

			$carTag_ = array();
			if($customCarTag){
				$arr = explode("\n", $customCarTag);
				foreach ($arr as $k => $v) {
					$arr_ = explode('|', $v);
					foreach ($arr_ as $s => $r) {
						if(trim($r)){
							$carTag_[] = trim($r);
						}
					}
				}
			}
			$return['carTag']        = $carTag_;
		}

		return $return;

	}

	/**
     * 品牌分类
     * @return array
     */
	public function type(){
		global $dsql;
		global $langData;
		$type = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
			}else{
				$hot      = (int)$this->param['hot'];
				$type     = (int)$this->param['type'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
				$son      = $this->param['son'] == 0 ? false : true;
			}
		}
		if($hot){
			$cond = " AND `hot` = '$hot'";
		}
		$results = $dsql->getTypeList($type, "car_brandtype", $son, $page, $pageSize, $cond);
		if($results){
			return $results;
		}
	}

	/**
     * 级别分类
     * @return array
     */
	public function levelType(){
		global $dsql;
		global $langData;
		$type = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);
			}else{
				$type     = (int)$this->param['type'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
				$son      = $this->param['son'] == 0 ? false : true;
			}
		}
		$results = $dsql->getTypeList($type, "car_level", $son, $page, $pageSize);
		if($results){
			return $results;
		}
	}

	/**
	 * 品牌分类
	 */
	public function typeList(){
		global $dsql;
		global $langData;
		$pageinfo = $list = array();
		$store = $addrid = $typeid = $title = $orderby = $page = $pageSize = $where = $where1 = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
			}else{
				$son      = $this->param['son'] ? $this->param['son'] : false;
				$capital      = $this->param['capital'];
				$type     = (int)$this->param['type'];
				$chidren  = $this->param['chidren'];
				$orderby  = $this->param['orderby'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];

				$title = $title ? $title : $keywords;
			}
		}
		if($son && empty($type)){
			$where .= " AND `parentid` = 0";
		}elseif(!empty($type)){
			$where .= " AND `parentid` = '$type'";
		}

		$order = " ORDER BY `weight` DESC, `pubdate` DESC, `id` DESC";
		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;
		//首字母
		if($orderby == "1"){
			$order = " ORDER BY `py` DESC, `hot` DESC";
		//热门
		}elseif($orderby == "2"){
			$order = " ORDER BY `hot` DESC";
        }elseif($orderby == "3"){
			$order = " ORDER BY `py` ASC, `hot` DESC";
        }
		$archives = $dsql->SetQuery("SELECT  `id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `pinyin`, `py`, `hot` FROM `#@__car_brandtype` WHERE 1=1 ".$where);
		$archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__car_brandtype` WHERE 1=1 ".$where);

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
			if ($capital) {
				foreach($results as $key => $val){

				$list[$key]['firstword']   = $val['py'] ? strtoupper(substr($val['py'], 0, 1)) : '';
				}
				foreach($list as $k=>$f) {
				  foreach($list as $p=>$t) if($k != $p && $f == $t) unset($list[$k]);
				}
				// var_dump($list);die;
				return array("pageInfo" => $pageinfo, "list" => $list);
			}
			foreach($results as $key => $val){
				$list[$key]['id']    = $val['id'];
				$list[$key]['parentid']    = $val['parentid'];
				$list[$key]['typename']    = $val['typename'];
				$list[$key]['weight']      = $val['weight'];
				$list[$key]['pubdate']     = $val['pubdate'];
				$list[$key]['pinyin']      = $val['pinyin'];
				$list[$key]['py']          = $val['py'];
				$list[$key]['firstword']   = $val['py'] ? strtoupper(substr($val['py'], 0, 1)) : '';
				$list[$key]['hot']         = $val['hot'];
				$list[$key]['icon']        = empty($val['icon']) ? '' : getFilePath($val['icon']);

				if($chidren){
					$lower = [];
					$param['type']    = $val['id'];
					$param['orderby'] = 3;
					$param['page']    = 1;
					$param['pageSize'] = 9999;
					$this->param = $param;
					$child = $this->typeList();

					if(!isset($child['state']) || $child['state'] != 200){
						$lower = $child['list'];
					}

					$list[$key]['lower'] = $lower;
				}

			}

		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
	 * 固定字段
	 */
	public function caritemList(){
		global $dsql;
		global $langData;
		$pageinfo = $list = array();
		$store = $addrid = $typeid = $title = $orderby = $page = $pageSize = $where = $where1 = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
			}else{
				$son      = $this->param['son'] ? $this->param['son'] : false;
				$type     = (int)$this->param['type'];
				$chidren  = $this->param['chidren'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];

				$title = $title ? $title : $keywords;
			}
		}

		if($son && empty($type)){
			$where .= " AND `parentid` = 0";
		}elseif(!empty($type)){
			$where .= " AND `parentid` = '$type'";
		}

		$order = " ORDER BY `weight` DESC, `pubdate` DESC, `id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT  `id`, `parentid`, `typename`, `weight`, `pubdate` FROM `#@__caritem` WHERE 1=1 ".$where);
		$archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__caritem` WHERE 1=1 ".$where);

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
			foreach($results as $key => $val){
				$list[$key]['id']    = $val['id'];
				$list[$key]['parentid']    = $val['parentid'];
				$list[$key]['typename']    = $val['typename'];
				$list[$key]['weight']      = $val['weight'];
				$list[$key]['pubdate']     = $val['pubdate'];

				if($chidren){
					$lower = [];
					$param['type']    = $val['id'];
					$param['orderby'] = 3;
					$param['page']    = 1;
					$param['pageSize'] = 9999;
					$this->param = $param;
					$child = $this->typeList();

					if(!isset($child['state']) || $child['state'] != 200){
						$lower = $child['list'];
					}

					$list[$key]['lower'] = $lower;
				}

			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
	 * 安全配置、外部配置、内部配置
	 */
	public function carConfigure(){
		global $dsql;
		global $langData;

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
			}else{
				$type     = (int)$this->param['type'];
			}
		}

		$type = $type ? $type : 1;

		require(HUONIAOINC."/config/car.inc.php");

		$list = array();
		if($type == 1){//安全设置
			if($customsecuritysettingTag){
				$securitysettingTagArr = explode('|', $customsecuritysettingTag);
				foreach ($securitysettingTagArr as $key => $row) {
					$childAecurity = explode('-', $row);
					$list[$key]['id']       = $childAecurity[0];
					$list[$key]['typename'] = $childAecurity[1];
				}
			}
		}elseif($type == 2){//外部配置
			if($customexternalsettingTag){
				$externalsettingTagArr = explode('|', $customexternalsettingTag);
				foreach ($externalsettingTagArr as $key => $row) {
					$childExternal = explode('-', $row);
					$list[$key]['id']       = $childExternal[0];
					$list[$key]['typename'] = $childExternal[1];
				}
			}
		}elseif($type == 3){//内部配置
			if($custominternalsettingTag){
				$internalsettingTagArr = explode('|', $custominternalsettingTag);
				foreach ($internalsettingTagArr as $key => $row) {
					$childInternal = explode('-', $row);
					$list[$key]['id']       = $childInternal[0];
					$list[$key]['typename'] = $childInternal[1];
				}
			}
		}

		return $list;
	}

	/**
	 * 品牌车系
	 */
	public function carmodel(){
		global $dsql;
		global $langData;
		$pageinfo = $list = array();

		$carsystem = $brand = $title = $page = $pageSize = $orderby = $where = $where1 = "";

        if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
			}else{
				$carsystem  = $this->param['carsystem'];
				$brand      = $this->param['brand'];
				$title      = $this->param['title'];
				$orderby    = $this->param['orderby'];
				$page       = $this->param['page'];
				$pageSize   = $this->param['pageSize'];
			}
		}

		if(!empty($carsystem)){
            $where .= " AND `carsystem` = '$carsystem'";
		}

		if(!empty($brand)){
			if($dsql->getTypeList($brand, "car_brandtype")){
				$lower = arr_foreach($dsql->getTypeList($brand, "car_brandtype"));
				$lower = $brand.",".join(',',$lower);
			}else{
				$lower = $brand;
			}
			$where .= " AND `brand` in ($lower)";
		}

		//模糊查询关键字
		if(!empty($title)){
			//搜索记录
			if(!empty($_POST['keywords']) || !empty($_GET['keywords']) || !empty($_POST['title']) || !empty($_GET['title'])){
				siteSearchLog("car", $title);
			}
			$title = explode(" ", $title);
			$w = array();
			foreach ($title as $k => $v) {
				if(!empty($v)){
					$w[] = "`title` like '%".$v."%'";
				}
			}
			$where .= " AND (".join(" OR ", $w).")";
		}

		//发布时间
		if($orderby == "1"){
			$order = " ORDER BY pubdate DESC";
		//排序
		}elseif($orderby == "2"){
			$order = " ORDER BY weight DESC, rec DESC, pubdate DESC";
        //推荐
        }elseif($orderby == "3"){
            $order = " ORDER BY `prodate` DESC, rec DESC, weight DESC, pubdate DESC";
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `prodate`, `logo`, `weight`, `rec`, `brand`, `carsystem`, `emissions`, `gearbox`, `standard`, `company`, `level` FROM `#@__car_brand`  WHERE 1=1 ".$where);
		$archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__car_brand`  WHERE 1=1 ".$where);

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
		$results = $dsql->dsqlOper($archives.$order.$where, "results");

		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']       = $val['id'];
				$list[$key]['title']    = $val['title'];
				$list[$key]['logosource']     = !empty($val['logo']) ? $val['logo'] : "";
				$list[$key]['logo']     = !empty($val['logo']) ? getFilePath($val['logo']) : "";
				$list[$key]['weight']       = $val['weight'];
				$list[$key]['rec']       = $val['rec'];
				$list[$key]['emissions']       = $val['emissions'];
				$list[$key]['company']       = $val['company'];
				$list[$key]['prodate']       = $val['prodate'];

				$brandname = '';
				if(!empty($val['brand'])){
					$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__car_brandtype` WHERE `id` = ". $val['brand']);
					$rets = $dsql->dsqlOper($sql, "results");
					if($rets){
						$brandname = $rets[0]['typename'];
					}
				}
				$list[$key]['brandname']  = $brandname;

				$carsystemname = '';
				if(!empty($val['carsystem'])){
					$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__car_brandtype` WHERE `id` = ". $val['carsystem']);
					$rets = $dsql->dsqlOper($sql, "results");
					if($rets){
						$carsystemname = $rets[0]['typename'];
					}
				}
				$list[$key]['carsystemname']  = $carsystemname;

				global $data;
				$data = "";
				$typeArr = getParentArr("car_level", $val['level']);
				$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
				$list[$key]['level']       = $val['level'];
				$list[$key]['levelname']   = $typeArr;

				switch ($val['standard'])
				{
					case 1:
						$standard = '国II';
					break;
					case 2:
						$standard = '国III';
					break;
					case 3:
						$standard = '国IV';
					break;
					case 4:
						$standard = '国V';
					break;
				}
				$list[$key]['standardname']  = $standard;

				switch ($val['gearbox'])
				{
					case 1:
						$gearbox = '手动';
					break;
					case 2:
						$gearbox = '自动';
					break;
					case 3:
						$gearbox = '手自一体';
					break;
					case 4:
						$gearbox = '无极';
					break;
					case 5:
						$gearbox = '双离合';
					break;
				}
				$list[$key]['gearboxname']  = $gearbox;

			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);

	}

	/**
	 * 品牌车系详情
	 */
	public function carmodelDetail(){
		global $dsql;
		global $langData;
		$id = $this->param;
		$modelDetail = array();
		$id = is_numeric($id) ? $id : $id['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => $langData['car'][7][0]);//'格式错误！'

		//$where = " AND `state` = 0";

		$archives = $dsql->SetQuery("SELECT * FROM `#@__car_brand`  WHERE `id` = ".$id.$where);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			//变速箱
			if($results[0]['gearbox']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__caritem` WHERE `id` = " . $results[0]['gearbox']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['gearboxname'] = $res[0]['typename'] ?  $res[0]['typename'] : '';
			}
			//排放标准
			if($results[0]['gearbox']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__caritem` WHERE `id` = " . $results[0]['standard']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['standardname'] = $res[0]['typename'] ? $res[0]['typename'] : '';
			}
			//排放量
			$modelDetail['emissions'] = $results[0]['emissions'] ? $results[0]['emissions'] : 1.0;
			//证件品牌型号
			$modelDetail['certificatebrandmodel'] = $results[0]['certificatebrandmodel'] ? $results[0]['certificatebrandmodel'] : '';
			//厂商
			$modelDetail['company'] = $results[0]['company'] ? $results[0]['company'] : '';
			//级别
			if($results[0]['level']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__car_level` WHERE `id` = ".$results[0]['level']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['levelname'] = $res[0]['typename'] ? $res[0]['typename'] : '';
			}
			//发动机
			$modelDetail['engine'] = $results[0]['engine'] ? $results[0]['engine'] : '';
			//变速箱
			$modelDetail['transmissioncase'] = $results[0]['transmissioncase'] ? $results[0]['transmissioncase'] : '';
			//车身结构
			$modelDetail['bodystructure'] = $results[0]['bodystructure'] ? $results[0]['bodystructure'] : '';
			//长*宽*高(mm)
			$modelDetail['lengthwidthheight'] = $results[0]['lengthwidthheight'] ? $results[0]['lengthwidthheight'] : '';
			//轴距(mm)
			$modelDetail['wheelbase'] = $results[0]['wheelbase'] ? $results[0]['wheelbase'] : 0;
			//行李箱容积(L)
			$modelDetail['cargovolume'] = $results[0]['cargovolume'] ? $results[0]['cargovolume'] : '';
			//整备质量(kg)
			$modelDetail['quality'] = $results[0]['quality'] ? $results[0]['quality'] : '';
			//进气形式
			if($results[0]['intakeform']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__caritem` WHERE `id` = " . $results[0]['intakeform']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['intakeformname'] = $res[0]['typename'] ? $res[0]['typename'] : '';
			}
			//气缸
			$modelDetail['cylinder'] = $results[0]['cylinder'] ? $results[0]['cylinder'] : '';
			//最大马力(Ps)
			$modelDetail['maximumhorsepower'] = $results[0]['maximumhorsepower'] ? $results[0]['maximumhorsepower'] : 0;
			//最大扭矩(N*m)
			$modelDetail['maximumtorque'] = $results[0]['maximumtorque'] ? $results[0]['maximumtorque'] : 0;
			//燃料类型
			if($results[0]['fueltype']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__caritem` WHERE `id` = " . $results[0]['fueltype']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['fueltypename'] = $res[0]['typename'] ? $res[0]['typename'] : '';
			}
			//燃油标号
			if($results[0]['fuelgrade']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__caritem` WHERE `id` = " . $results[0]['fuelgrade']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['fuelgradename'] = $res[0]['typename'] ? $res[0]['typename'] : '';
			}
			//供油方式
			if($results[0]['fuelsupplymode']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__caritem` WHERE `id` = " . $results[0]['fuelsupplymode']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['fuelsupplymodename'] = $res[0]['typename'] ? $res[0]['typename'] : '';
			}
			//驱动方式
			if($results[0]['drivingmode']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__caritem` WHERE `id` = " . $results[0]['drivingmode']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['drivingmodename'] = $res[0]['typename'] ? $res[0]['typename'] : '';
			}
			//助力类型
			if($results[0]['assistancetype']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__caritem` WHERE `id` = " . $results[0]['assistancetype']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['assistancetypename'] = $res[0]['typename'] ? $res[0]['typename'] : '';
			}
			//前悬挂类型
			if($results[0]['frontsuspensiontype']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__caritem` WHERE `id` = " . $results[0]['frontsuspensiontype']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['frontsuspensiontypename'] = $res[0]['typename'] ? $res[0]['typename'] : '';
			}
			//后悬挂类型
			if($results[0]['rearsuspensiontype']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__caritem` WHERE `id` = " . $results[0]['rearsuspensiontype']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['rearsuspensiontypename'] = $res[0]['typename'] ? $res[0]['typename'] : '';
			}
			//前制动器类型
			if($results[0]['frontbraketype']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__caritem` WHERE `id` = " . $results[0]['frontbraketype']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['frontbraketypename'] = $res[0]['typename'] ? $res[0]['typename'] : '';
			}
			//后制动类型
			if($results[0]['rearbraketype']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__caritem` WHERE `id` = " . $results[0]['rearbraketype']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['rearbraketypename'] = $res[0]['typename'] ? $res[0]['typename'] : '';
			}
			//驻车制动类型
			if($results[0]['parkingbraketype']){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__caritem` WHERE `id` = " . $results[0]['parkingbraketype']);
				$res = $dsql->dsqlOper($sql, "results");
				$modelDetail['parkingbraketypename'] = $res[0]['typename'] ? $res[0]['typename'] : '';
			}
			//前轮胎规格
			$modelDetail['fronttirespecification'] = $results[0]['fronttirespecification'] ? $results[0]['fronttirespecification'] : '';
			//后轮胎规格
			$modelDetail['reartirespecification'] = $results[0]['reartirespecification'] ? $results[0]['reartirespecification'] : '';
			//安全配置
			$modelDetail['securitysetting'] = $results[0]['securitysetting'] ? $results[0]['securitysetting'] : '';
			//外部配置
			$modelDetail['externalsetting'] = $results[0]['externalsetting'] ? $results[0]['externalsetting'] : '';
			//内部配置
			$modelDetail['internalsetting'] = $results[0]['internalsetting'] ? $results[0]['internalsetting'] : '';
			return $modelDetail;
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][20][282]);//信息不存在或已删除
		}
	}

	/**
     * 城市分类
     * @return array
     */
    public function city(){
        $userLogin = new userLogin($dbo);
        $adminCityArr = $userLogin->getAdminCity();
        $results = empty($adminCityArr) ? array() : $adminCityArr;
        if($results){
            return $results;
        }
	}

	/**
     * 首付比列
     */
    public function getDownPayment(){
        $typeList = array(
			'0.2', '0.3', '0.5', '0.6', '0.8'
        );
        return $typeList;
    }

	/**
     * 汽车地区
     * @return array
     */
	public function addr(){
		global $dsql;
		global $langData;
		$type = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);
			}else{
				$type     = (int)$this->param['type'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
				$son      = $this->param['son'] == 0 ? false : true;
				$child    = $this->param['child'];
			}
		}

		global $template;
		if($template && $template != 'page' && empty($type)){
			//数据共享
			require(HUONIAOINC."/config/car.inc.php");
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
                if(!empty($child)){

                    //隐藏分站重复区域
                    global $cfg_sameAddr_state;
                    $siteCityArr = array();
                    if(!$cfg_sameAddr_state){
                        $siteConfigService = new siteConfig();
                        $siteCity = $siteConfigService->siteCity();

                        foreach ($siteCity as $key => $val){
                            array_push($siteCityArr, $val['cityid']);
                        }
                    }

                    foreach ($result as $key => $value) {

                        $alist = array();
                        $sql = $dsql->SetQuery("SELECT * FROM `#@__site_area` WHERE `parentid` = " . $value['cid'] . " ORDER BY `weight`");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if($ret) {
                            foreach ($ret as $k_ => $v_){
                                //隐藏分站重复区域
                                if ($siteCityArr) {
                                    if(!in_array($v_['id'], $siteCityArr)) {
                                        array_push($alist, $v_);
                                    }
                                }else{
                                    array_push($alist, $v_);
                                }
                            }

                        }

                        array_push($cityArr, array(
                            "id" => $value['cid'],
                            "typename" => $value['typename'],
                            "pinyin" => $value['pinyin'],
                            "hot" => $value['hot'],
                            "lower" => $alist
                        ));

                    }
                }else{
                    foreach ($result as $key => $value) {
                        array_push($cityArr, array(
                            "id" => $value['cid'],
                            "typename" => $value['typename'],
                            "pinyin" => $value['pinyin'],
                            "hot" => $value['hot'],
                            "lower" => array()
                        ));
                    }
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
     * 车辆管理
     * @return array
     */
	public function car(){
		global $dsql;
		global $langData;
		global $userLogin;
		$pageinfo = $list = array();

		$brand = $addrid = $store = $keywords = $orderby = $u = $uid = $state = $page = $pageSize = $where = $where1 = "";

		$loginUid = $userLogin->getMemberID();
		// var_dump($this->param);
		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
			}else{
				$csid = $this->param['csid'];
				$flags     = $_REQUEST['flags']!='' ? $_REQUEST['flags'] : $this->param['flags'];;
				$usertype  = (int)$this->param['usertype'];
				$brand     = (int)$this->param['brand'];
				$addrid    = (int)$this->param['addrid'];
				$store     = (int)$this->param['store'];
				$keywords  = $this->param['keywords'];
				$price     = $this->param['price'];
				$orderby   = (int)$this->param['orderby'];
				$u         = (int)$this->param['u'];
				$uid       = (int)$this->param['uid'];
				$state     = $this->param['state'];
				$page      = (int)$this->param['page'];
				$pageSize  = (int)$this->param['pageSize'];
				$level	   = (int)$this->param['level'];
				$year      = (int)$this->param['year'];
				$gearbox   = $this->param['gearbox'];
				$mileage   = $this->param['mileage'];
				$emissions = $this->param['emissions'];
				$standard  = $this->param['standard'];
				$fueltype  = $this->param['fueltype'];
				$internal  = $this->param['internal'];
				$color     = $this->param['color'];
				$newlist   = (int)$this->param['newlist'];
			}
		}
		if (!empty($csid)) {
			$where .= " AND z.`id` = $csid";
		}
		if(!empty($level)){
			if($dsql->getTypeList($level, "car_level")){
				$lower = arr_foreach($dsql->getTypeList($level, "car_level"));
				$lower = $level.",".join(',',$lower);
			}else{
				$lower = $level;
			}
			$where .= " AND c.`level` in ($lower)";
		}

		if(!empty($color)){
			$color = explode(",", $color);
			$wcolor = array();
			foreach ($color as $k => $v) {
				if(!empty($v)){
					$wcolor[] = " s.`color` like '%".$v."%'";
				}
			}
			$where .= " AND (".join(" OR ", $wcolor).")";
		}

		if($year){
			$year = explode(",", $year);
			$yearArr = [];
			foreach ($year as $key=>$value) {
				$times = GetMkTime(date("Y-m-d", strtotime(-$value." year")));
				if($value==6){
					$yearArr[$key] = "  s.`cardtime` < ".$times;
				}else{

					$yearArr[$key] = "  s.`cardtime` > ".$times;
				}
			}
			$where .= " AND " . join(" OR ", $yearArr);
		}

		if(!empty($gearbox)){
			$where .= " AND c.`gearbox` in (".$gearbox.")";
		}

		if($mileage != ""){
			$mileage = explode(",", $mileage);
			$mileageArr = [];
			foreach ($mileage as $key=>$value) {
                $value = (int)$value;
				if($value==11){
					$mileageArr[$key] = "  s.`mileage` > 10";
				}else{
					$mileageArr[$key] = "  s.`mileage` < ".$value;
				}
			}
			$where .= " AND " . join(" OR ", $mileageArr);
		}

		if($emissions != ""){
			$emissions = explode(",", $emissions);
			if(empty($emissions[0])){
				$where .= " AND c.`emissions` < " . $emissions[1];
			}elseif(empty($price[1])){
				$where .= " AND c.`emissions` > " . $emissions[0];
			}else{
				$where .= " AND c.`emissions` BETWEEN " . $emissions[0] . " AND " . $emissions[1];
			}
		}

		if(!empty($standard)){
			$where .= " AND c.`standard` in (".$standard.")";
		}

		if(!empty($fueltype)){
			$where .= " AND c.`fueltype` in (".$fueltype.")";
		}

		$zj_state = "";
		if($u != 1){

			//数据共享
			require(HUONIAOINC."/config/car.inc.php");
			$dataShare = (int)$customDataShare;

			if(!$dataShare && !$store){
				$cityid = getCityId($this->param['cityid']);
				if($cityid){
					$where .= " AND s.`cityid` in (".$cityid.")";
				}
			}

			$where .= " AND s.`state` = 1 AND s.`waitpay` = 0";

			//取指定会员的信息
			if($uid){
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_adviser` WHERE `userid` = $uid");
				$ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $where .= " AND s.`usertype` = 1 AND s.`userid` = ".$ret[0]['id'];
                }else{
                    $where .= " AND s.`usertype` = 0 AND s.`userid` = ".$uid;
                }
			}
            $zj_state = " AND z.`state` = 1";
		}else{
			$uid = $loginUid;
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_adviser` WHERE `userid` = $uid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$where .= " AND s.`usertype` = 1 AND s.`userid` = ".$ret[0]['id'];
			}else{
				$where .= " AND s.`usertype` = 0 AND s.`userid` = ".$uid;
			}

			if($state != ""){
				$where1 = " AND s.`state` = ".$state;
			}
		}
		if($usertype!=""){
			if ($usertype==10) {
				$where .= " AND s.`usertype` = 0";
			}else{
			$where .= " AND s.`usertype` = '$usertype'";
			}
		}
		//价格区间
		if($price != "" && $price != 'pricePlaceholder'){
			$price = explode(",", $price);
			if(empty($price[0])){
				$where .= " AND s.`price` < " . $price[1];
			}elseif(empty($price[1])){
				$where .= " AND s.`price` > " . $price[0];
			}else{
				$where .= " AND s.`price` BETWEEN " . $price[0] . " AND " . $price[1];
			}
		}

		//品牌分类
		if(!empty($brand)){
			if($dsql->getTypeList($brand, "car_brandtype")){
				$lower = arr_foreach($dsql->getTypeList($brand, "car_brandtype"));
				$lower = $brand.",".join(',',$lower);
			}else{
				$lower = $brand;
			}
			$where .= " AND s.`brand` in ($lower)";
		}

		// 顾问
		if($store){
			// 查询公司下所有顾问
			$arcZj = $dsql->SetQuery("SELECT zj.`id` FROM `#@__car_store` store LEFT JOIN `#@__car_adviser` zj ON zj.`store` = store.`id` WHERE store.`id` = $store");
			$retZj = $dsql->dsqlOper($arcZj, "results");
			if($retZj){
				$zjUserList = array();
				foreach ($retZj as $k => $v) {
					if($v['id']){
						array_push($zjUserList, $v['id']);
					}
				}
				if($zjUserList){
					$where .= " AND s.`usertype` = 1 AND s.`userid` in(".join(',',$zjUserList).")";
				}else{
					$where .= " AND 1 = 2";
				}

			}else{
				$where .= " AND 1 = 2";
			}

			if ($newlist) {
				$BeginDate=date('Y-m-01', strtotime(date("Y-m-d")));//本月第一天
			    $overDate=date('Y-m-d', strtotime("$BeginDate +1 month -1 day"));//本月最后一天
			    $btime=strtotime($BeginDate);
			    $ovtime=strtotime($overDate);
			    $where .=" AND s.`pubdate` BETWEEN " .$btime. " AND " . $ovtime;
			}
		}

		//遍历地区
		if(!empty($addrid)){
			if($dsql->getTypeList($addrid, "site_area")){
				$addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
				$addridArr = join(',',$addridArr);
				$lower = $addrid.",".$addridArr;
			}else{
				$lower = $addrid;
			}
			$where .= " AND s.`addrid` in ($lower)";
		}

		//属性
		if($flags != ""){
			$flag = array();
			$flagArr = explode(",", $flags);
			foreach ($flagArr as $key => $value) {
				$flag[$key] = "FIND_IN_SET(".$value.", s.`flag`)";
			}
			$where .= " AND " . join(" AND ", $flag);
		}
		//安全配置
		if($internal != ""){
			$internals = array();
			$internalsArr = explode(",", $internal);
			foreach ($internalsArr as $key => $value) {
				$internals[$key] = "FIND_IN_SET(".$value.", c.`internalsetting`)";
			}
			$where .= " AND " . join(" AND ", $internals);
		}


		//模糊查询关键字
		if(!empty($keywords)){
			//搜索记录
			if(!empty($keywords)){
				siteSearchLog("car", $keywords);
			}
			$title = explode(" ", $keywords);
			$w = array();
			foreach ($title as $k => $v) {
				if(!empty($v)){
					$w[] = " s.`title` like '%".$v."%'";
				}
			}
			$where .= " AND (".join(" OR ", $w).")";
		}
		//取当前星期，当前时间
		$time = time();
		$week = date('w', time());
		$hour = (int)date('H');
		$ob = "s.`bid_week{$week}` = 'all'";
		if($hour > 8 && $hour < 20){
			$ob .= " or s.`bid_week{$week}` = 'day'";
		}
		$ob = "($ob)";
		if(!empty($orderby)){
			//发布时间
			if($orderby == 1){
				$orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`pubdate` DESC, s.`weight` DESC, s.`id` DESC";
			//价格升序
			}elseif($orderby == 2){
				$orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` ASC, s.`weight` DESC, s.`id` DESC";
			//价格降序
			}elseif($orderby == 3){
				$orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` DESC, s.`weight` DESC, s.`id` DESC";
			//点击
			}elseif($orderby == "click"){
				$orderby = " ORDER BY s.`click` DESC, s.`weight` DESC, s.`id` DESC";
			//最短里程
			}elseif($orderby == 4){
				$orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`mileage` ASC, s.`weight` DESC, s.`id` DESC";
			//最短车龄
			}elseif($orderby == 5){
				$orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`cardtime` DESC, s.`weight` DESC, s.`id` DESC";
			}
		}else{
			$orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`weight` DESC, s.`id` DESC";
		}
		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT " .
									"s.`id`, s.`cardtime`, s.`staging`, s.`downpayment`,s.`usertype`, s.`pics`, s.`usertype`, s.`title`, s.`addrid`, s.`flag`, s.`mileage`, s.`litpic`, s.`price`, s.`isbid`, s.`bid_type`, s.`bid_week0`, s.`bid_week1`, s.`bid_week2`, s.`bid_week3`, s.`bid_week4`, s.`bid_week5`, s.`bid_week6`, s.`bid_start`, s.`bid_end`, s.`bid_price`, s.`waitpay`, s.`refreshSmart`, s.`refreshCount`, s.`refreshTimes`, s.`refreshPrice`, s.`refreshBegan`, s.`refreshNext`, s.`refreshSurplus`, s.`state`, s.`carsystem`, s.`pubdate`, s.`click`  " .
									"FROM `#@__car_list` s LEFT JOIN `#@__car_adviser` z ON z.`id` = s.`userid` LEFT JOIN `#@__car_brand` c ON c.`id` = s.`model`" .
									" WHERE (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id`".$zj_state."))" . $where);
		//总条数
		$totalCount = (int)getCache("car_list_total", $archives, 300, array("savekey" => 1, "type" => "totalCount", "disabled" => $u));
        
		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);
		//会员列表需要统计信息状态
		if($u == 1 && $loginUid > -1){
			//待审核
			$totalGray = $dsql->dsqlOper($archives." AND s.`state` = 0", "totalCount");
			//已审核
			$totalAudit = $dsql->dsqlOper($archives." AND s.`state` = 1", "totalCount");
			//拒绝审核
			$totalRefuse = $dsql->dsqlOper($archives." AND s.`state` = 2", "totalCount");

			$pageinfo['gray'] = $totalGray;
			$pageinfo['audit'] = $totalAudit;
			$pageinfo['refuse'] = $totalRefuse;
		}

		$atpage = $pageSize*($page-1);
		$where = $pageSize != -1 ? " LIMIT $atpage, $pageSize" : "";
		$sql = $dsql->SetQuery($archives.$where1.$orderby.$where);
		// var_dump($sql);die;
		$results = getCache("car_list", $sql, 300, array("disabled" => $u));
		// var_dump($results);

		if($results){
			$now = GetMkTime(time());
			foreach($results as $key => $val){
				$list[$key]['id']     = $val['id'];
				$list[$key]['title']  = $val['title'];
				$list[$key]['price']     = $val['price'];
				$list[$key]['pubdate']  = $val['pubdate'];
				$list[$key]['click']  = $val['click'];
				$list[$key]['mileage']     = $val['mileage'];
				$list[$key]['flag']     = $val['flag'];
				$list[$key]['cardtime']     = $val['cardtime'];
				$list[$key]['usertype']     = $val['usertype'];
				$list[$key]['staging']     = $val['staging'];
				$list[$key]['cardtime1']     = date("Y-m-d", $val['cardtime']);


				if($val['staging']==1){
					$list[$key]['sf']    = round($val['price']*$val['downpayment'], 2);
				}

				if(!empty($val['litpic'])){
					$list[$key]['litpic']    = getFilePath($val['litpic']);
				}elseif(empty($val['litpic']) && !empty($val['pics'])){
					$picsArr = explode(',', $val['pics']);
					$list[$key]['litpic']    = getFilePath($picsArr[0]);
				}

				$list[$key]['addrid']    = $val['addrid'];
				global $data;
                $data                  = "";
                $addrArr               = getParentArr("site_area", $val['addrid']);
                $addrArr               = array_reverse(parent_foreach($addrArr, "typename"));
                $addrArr               = array_slice($addrArr, -2, 2);
                $list[$key]['address'] = join(" - ", $addrArr);

				global $data;
				$data = "";
				$typeArr = getParentArr("car_brandtype", $val['brand']);
				$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
				$list[$key]['brandname']    = join("-", $typeArr);

				$isbid = (int)$val['isbid'];
				//计划置顶需要验证当前时间点是否为置顶状态，如果不是，则输出为0
				if($val['bid_type'] == 'plan'){
					if($val['bid_week' . $week] == '' || ($val['bid_start'] > $now && !$u) || ($val['bid_week' . $week] == 'day' && ($hour < 8 || $hour > 20))){
						$isbid = 0;
					}
				}
				$list[$key]['isbid']    = $isbid;

				//会员中心显示信息状态
				if($u == 1 && $loginUid > -1){
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
					"service"     => "car",
					"template"    => "detail",
					"id"          => $val['id']
				);
				$list[$key]['url']        = getUrlPath($param);

				$collect = "";
            	if($loginUid != -1){
	                //验证是否已经收藏
					$params = array(
						"module" => "car",
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
     * 车辆详细信息
     * @return array
     */
	public function detail(){
		global $dsql;
		global $langData;
		$id = $this->param;
		$carDetail = array();
		$id = is_numeric($id) ? $id : $id['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误

		$where = " AND s.`waitpay` = 0";

		$archives = $dsql->SetQuery("SELECT s.`note`, s.`cityid`, s.`pics`, s.`flag`, s.`pubdate`, s.`click`, s.`note`, s.`areaCode`, s.`contact`, s.`username`, s.`userid`, s.`usertype`, s.`businessendtime`, s.`jqxendtime`, s.`njendtime`, s.`transfertimes`, s.`seeway`, s.`downpayment`, s.`staging`, s.`nature`, s.`mileage`, s.`cardtime`, s.`location`, s.`color`, s.`tax`, s.`model`,s.`ckprice`, s.`price`, s.`litpic`, s.`addrid`, s.`model`, s.`carsystem`, s.`brand`, s.`title`,s.`titlename`, s.`id`,s.`state`, z.`store` FROM `#@__car_list` s LEFT JOIN `#@__car_adviser` z ON z.`id` = s.`userid` WHERE s.`id` = ".$id.$where);
		// $results  = $dsql->dsqlOper($archives, "results");
		$results  = getCache("car_detail", $archives, 0, $id);
		if($results){
			$carDetail["id"]       			= $results[0]['id'];
			$carDetail["state"]       	    = $results[0]['state'];
			$carDetail["title"]    			= $results[0]['title'];
			$carDetail["titlename"]    	    = $results[0]['titlename'];
			$carDetail["brand"]    			= $results[0]['brand'];
			$carDetail["carsystem"]			= $results[0]['carsystem'];
			$carDetail["model"]    			= $results[0]['model'];
			$carDetail["addrid"]   			= $results[0]['addrid'];
			$carDetail["litpicSource"]   	= $results[0]['litpic'];
			$carDetail["litpic"]            = $results[0]['litpic'] ? getFilePath($results[0]['litpic']) : '';
			$carDetail["price"]   			= $results[0]['price'];
			$carDetail["ckprice"]   		= $results[0]['ckprice'];
			$carDetail["tax"]   			= $results[0]['tax'];
			$carDetail["colorname"]   		= $results[0]['color'];
			$carDetail["location"]   		= $results[0]['location'];
			$carDetail["cardtime"]   		= $results[0]['cardtime'];
			$carDetail["mileage"]   		= $results[0]['mileage'];
			$carDetail["nature"]   			= $results[0]['nature'];
			$carDetail["naturename"]   		= $results[0]['nature'] ? '营运' : '非营运';
			$carDetail["staging"]   		= $results[0]['staging'];
			$carDetail["stagingname"]   	= $results[0]['staging'] ? '可分期' : '不可分期';
			$carDetail["downpayment"]   	= $results[0]['downpayment'];
			$carDetail["seeway"]   		    = $results[0]['seeway'];
			$carDetail["transfertimes"]   	= $results[0]['transfertimes'];
			$carDetail["njendtime"]   	    = $results[0]['njendtime'];
			$carDetail["jqxendtime"]   	    = $results[0]['jqxendtime'];
			$carDetail["businessendtime"]   = $results[0]['businessendtime'];
			$carDetail['click']             = $results[0]['click'];
			$carDetail['pubdate']           = $results[0]['pubdate'];
			$carDetail['note']              = nl2br($results[0]['note']);
			$carDetail["flag"]       		= $results[0]['flag'];
			$carDetail["usertype"]       	= $results[0]['usertype'];
			$carDetail["cityid"]       	    = $results[0]['cityid'];
			$topicesql = $dsql->SetQuery("SELECT totalprice FROM `#@__car_brand` where id = ".$results[0]['model']);
			$resu = $dsql->dsqlOper($topicesql, "results");
			$carDetail["totalprice"]       	= $resu[0]['totalprice'];
			//平均公里
			$year = $results[0]['cardtime'] ? (date("Y") - date("Y", $results[0]['cardtime']) ? date("Y") - date("Y", $results[0]['cardtime']) : 1) : 1;
			//$year = $year==0 ? 1 : $year;
			$carDetail["avgmileage"] = $results[0]['mileage'] ? round($results[0]['mileage']/$year, 2) : 0;

			//上牌几年
			$cardtime = diffBetweenTwoDays(date("Y-m-d"), date('Y-m-d', $results[0]['cardtime']));
			$day = array('day' => $cardtime );
			$carDetail["cardtimeminus"] = FloorDay($day);

			$cityname = getSiteCityName($results[0]['location']);
			$carDetail['cityname'] = $cityname;

			//详细配置信息
			$param['id']  = $results[0]['model'];
            $this->param  = $param;
			$modelArr = $this->carmodelDetail();
			$carDetail['modelArr'] = $modelArr;

			//商家信息 title address 店铺在售信息；salenums；已售 soldnums； logo


			$userid = $results[0]['userid'];
			$carDetail["userid"]       	    = $results[0]['userid'];
			$uid = $nickname = $photo = $phone = $certify = $phoneCheck = $address = "";
			if($results[0]['usertype']==1){
				$archives = $dsql->SetQuery("SELECT m.`id` uid, m.`nickname`, m.`photo`, m.`phone`, m.`certifyState`, m.`sex`, zjcom.`tel`, zjcom.`suc`, zjcom.`lng`,zjcom.`lat`,zjcom.`title`, zjcom.`logo`, zjcom.`address`,  zjcom.`authattr`, zjcom.`id` zjcomid, zj.`name`, zj.`litpic` FROM `#@__member` m LEFT JOIN `#@__car_adviser` zj ON m.`id` = zj.`userid` LEFT JOIN `#@__car_store` zjcom ON zj.`store` = zjcom.`id` WHERE zjcom.`state` = 1 AND zj.`id` = ".$userid);
				//如果是独立顾问
                if($results[0]['store']==0){
                    $archives = $dsql->SetQuery("SELECT m.`id` uid, m.`nickname`, m.`photo`, m.`phone`, m.`certifyState`, m.`sex`, zj.`name`, zj.`litpic` FROM `#@__member` m LEFT JOIN `#@__car_adviser` zj ON m.`id` = zj.`userid` WHERE zj.`id` =".$userid);
                }
				$member = $dsql->dsqlOper($archives, "results");
				if($member){
					$photo     = $member[0]['logo'] ? getFilePath($member[0]['logo']) : $member[0]['photo'];
					$litpic     = $member[0]['litpic'] ? getFilePath($member[0]['litpic']) : $member[0]['litpic'];
                  	$telArr = explode(',', $member[0]['tel']);
					$phone     = $telArr[0] ? $telArr[0] : $member[0]['phone'];
					$address   = $member[0]['address'];
					$uid       = $member[0]['uid'];
					$title     = $member[0]['title'];
					$name      = $member[0]['name'];
					$lng     = $member[0]['lng'];
					$lat     = $member[0]['lat'];

					$authattr  = $member[0]['authattr'];
					$zjcomid   = $member[0]['zjcomid'];

					$authattrArr = array();
					if(!empty($member[0]['authattr'])){
						$authattr = explode(",", $member[0]['authattr']);
						foreach ($authattr as $v) {
							$sql = $dsql->SetQuery("SELECT `jc` FROM `#@__car_authattr` WHERE `id` = ".$v);
							$res = $dsql->dsqlOper($sql, "results");
							if($res){
								$authattrArr['jc'][] = $res[0]['jc'];
								$authattrArr['py'][] = GetPinyin($res[0]['jc']);
							}
						}
					}

                  	$sucnum = 0;
					$onsale = 0;
					$newsale = 0;

                    //在售
                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__car_list` WHERE `state` = 1 AND `userid` = " . $member[0]['zjcomid']);
                    $saletotalCount = $dsql->dsqlOper($archives, "totalCount");
                    $onsale = $saletotalCount;
                    //在售
                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__car_list` WHERE `state` = 1 AND FIND_IN_SET('2', `flag`) AND `userid` = " . $member[0]['zjcomid']);
                    $newtotalCount = $dsql->dsqlOper($archives, "totalCount");
                    $newsale = $newtotalCount;

					$salenums  = $onsale;
					$soldnums  = $member[0]['suc'];
					$newnums   = $newsale;

				}

				$url = getUrlPath(array("service" => "car", "template" => "store-detail", "id" => $zjcomid));

				$userArr['userid']    = $uid;
				$userArr['url']       = $url;
				$userArr['photo']     = $photo;
				$userArr['litpic']    = $litpic;
				$userArr['phone']     = $phone;
				$userArr['address']   = $address;
				$userArr['name']      = $name;
				$userArr['title']     = $title;
				$userArr['salenums']  = $salenums;
				$userArr['soldnums']  = $soldnums;
				$userArr['newnums']   = $newnums;
				$userArr['authattrArr']  = $authattrArr;
				$userArr['lng']  = $lng;
				$userArr['lat']  = $lat;
			}else{
				$archives = $dsql->SetQuery("SELECT `nickname`, `photo`, `certifyState`, `phoneCheck` FROM `#@__member`  WHERE  `id` = ".$userid);
				$member   = $dsql->dsqlOper($archives, "results");
				if($member){
					$nickname  = $results[0]['username'] ? $results[0]['username'] : $member[0]['nickname'];
					$photo     = getFilePath($member[0]['photo']);
					$phone     = $results[0]['contact'] ? $results[0]['contact'] : $member[0]['phone'];
					$certify   = $member[0]['certifyState'] == 1 ? 1 : 0;
					$phoneCheck   = $member[0]['phoneCheck'] == 1 ? 1 : 0;
				}
				$userArr['userid']    = $userid;
				$userArr['nickname']  = $nickname;
				$userArr['title']     = $nickname;
				$userArr['name']      = $nickname;
				$userArr['photo']     = $photo;
				$userArr['phone']     = $phone;
				$userArr['certify']   = $certify;
				$userArr['phoneCheck']= $phoneCheck;
			}
			$carDetail['user'] = $userArr;

			if (!empty($results[0]['pics'])) {
				$picsArr = explode(',', $results[0]['pics']);
                $imglist = array();
                foreach ($picsArr as $key => $value) {
                    $imglist[$key]["path"]       = getFilePath($value);
                    $imglist[$key]["pathSource"] = $value;
                }
            } else {
                $imglist = array();
            }
            $carDetail["imglist"] = $imglist;

			//会员信息
			$carDetail["username"]          = $results[0]['username'];
			$carDetail["areaCode"]           = $results[0]['areaCode'];
			$carDetail["contact"]           = $results[0]['contact'];

			global $data;
			$data = "";
			$typeArr = getParentArr("car_brandtype", $results[0]['brand']);
			$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
			$carDetail['typeName']    = join(" > ", $typeArr);

			$addrName = getParentArr("site_area", $results[0]['addrid']);
			global $data;
			$data = "";
			$addrName = array_reverse(parent_foreach($addrName, "typename"));
			$carDetail['addr']              = $addrName;

			global $data;
            $data                  = "";
            $addrArr               = getParentArr("site_area", $results[0]['addrid']);
            $addrArr               = array_reverse(parent_foreach($addrArr, "typename"));
            $carDetail['address']  = join(" > ", $addrArr);

			//验证是否已经收藏
			$params = array(
				"module" => "car",
				"temp"   => "detail",
				"type"   => "add",
				"id"     => $id,
				"check"  => 1
			);
			$collect = checkIsCollect($params);
			$carDetail['collect'] = $collect == "has" ? 1 : 0;

			return $carDetail;
		}else{
			return array("state" => 200, "info" => $langData['siteConfig'][20][282]);//信息不存在
		}
	}

	/**
     * 删除信息
     * @return array
     */
    public function del()
    {
		global $dsql;
		global $langData;
		global $userLogin;

		$id   = $this->param['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误

		$uid = $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录
		}

		//判断是否顾问
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_adviser` WHERE `userid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$uid = $ret[0]['id'];
		}

		$archives = $dsql->SetQuery("SELECT * FROM `#@__car_list` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			if($results[0]['userid'] == $uid){
				//删除缩略图
				delPicFile($results[0]['litpic'], "delThumb", "car");
				//图集
				delPicFile($results[0]['pics'], "delAtlas", "car");
				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__car_list` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");
        
                //记录用户行为日志
                memberLog($uid, 'car', '', $id, 'delete', '删除信息('.$results['title'].')', '', $archives);

				// 清除缓存
                clearCache("car_detail", $id);
				checkCache("car_list", $id);
				clearCache("car_list_total", 'key');
                dataAsync("car",$id,"list");  // 汽车门户-车源-删除
				return $langData['siteConfig'][20][444];//删除成功
			}else{
				return array("state" => 101, "info" => $langData['siteConfig'][21][143]);//权限不足，请确认帐户信息后再进行操作
			}
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][20][282]);//信息不存在或已删除
		}

    }

	/**
	 * 配置经销商
	 * @return array
	 */
	public function storeConfig(){
		global $dsql;
		global $langData;
		global $userLogin;
		global $siteCityInfo;
		$userid  = $userLogin->getMemberID();
		$param   = $this->param;
		$cityid  = (int)$param['cityid'];
		$addr    = (int)$param['addrid'];
		$title   = filterSensitiveWords(addslashes($param['title']));
		$litpic  = $param['litpic'];
		$areaCode = $param['areaCode'];
		$tel     = filterSensitiveWords(addslashes($param['tel']));
		$address = filterSensitiveWords(addslashes($param['address']));
		$email   = filterSensitiveWords(addslashes($param['email']));
		$note    = filterSensitiveWords(addslashes($param['note']));
		$pubdate = GetMkTime(time());

		$openStart  = $param['openStart'];
		$openEnd    = $param['openEnd'];
		$license    = $param['license'];
		$pics       = $param['pics'];
		$opentime   = $openStart . '-' . $openEnd;
		if(isset($param['tag'])){
		    $tag = $param['tag'];
		    $tag = is_array($tag) ? join("|", $tag) : $tag;
		}

		$field = '';

		if(!empty($license)){
			$field .= ", `license` = '$license'";
		}

		if(!empty($pics)){
			$field .= ", `pics` = '$pics'";
		}

		if(!empty($tag)){
			$field .= ", `tag` = '$tag'";
		}

		if(!empty($opentime)){
			$field .= ", `opentime` = '$opentime'";
		}

		if(!empty($cityid)){
			$field .= ", `cityid` = '$cityid'";
		}

		if(!empty($addr)){
			$field .= ", `addrid` = '$addr'";
		}

		if(!empty($address)){
			$field .= ", `address` = '$address'";
		}

		if(!empty($note)){
			$field .= ", `note` = '$note'";
		}

		if(empty($addr)) $addr = (int)$param['addr'];

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录
		}

		//验证会员类型
		$userDetail = $userLogin->getMemberInfo();
		if($userDetail['userType'] != 2){
			return array("state" => 200, "info" => $langData['car'][7][1]);//账号验证错误，请先入驻商家
		}

		if(!verifyModuleAuth(array("module" => "car"))){
			return array("state" => 200, "info" => $langData['car'][7][2]);//商家权限验证失败
		}

		if(empty($cityid)){
			return array("state" => 200, "info" => $langData['car'][7][3]);//请选择城市
		}

		if(empty($title)){
			return array("state" => 200, "info" => $langData['car'][7][4]);//请输入公司名称
		}

		if(empty($litpic)){
			//return array("state" => 200, "info" => $langData['car'][7][5]);//请上传公司LOGO
		}

		if(empty($tel)){
			return array("state" => 200, "info" => $langData['car'][7][6]);//请输入联系电话
		}

		if(empty($addr)){
			return array("state" => 200, "info" => $langData['car'][7][7]);//请选择区域
		}

		if(empty($address)){
			return array("state" => 200, "info" => $langData['car'][7][8]);//请输入联系地址
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__car_store` WHERE `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");

		//入驻审核开关
		include HUONIAOINC."/config/business.inc.php";
		$moduleJoinCheck = (int)$customModuleJoinCheck;
		$editModuleJoinCheck = (int)$customEditModuleJoinCheck;

		//新商铺
		if(!$userResult){

			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__car_store` (`cityid`, `addrid`, `title`, `logo`, `userid`, `address`, `areaCode`, `tel`, `state`, `pubdate`, `license`, `opentime`, `pics`, `tag`, `note`) VALUES ('$cityid', '$addr', '$title', '$litpic', '$userid', '$address', '$areaCode', '$tel', '$moduleJoinCheck', '$pubdate', '$license', '$opentime', '$pics', '$tag', '$note')");
			$aid = $dsql->dsqlOper($archives, "lastid");

			if(is_numeric($aid)){

                $urlParam = array(
                    'service' => 'car',
                    'template' => 'store-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
        
                //记录用户行为日志
                memberLog($userid, 'car', '', $aid, 'insert', '发布信息('.$title.')', $url, $archives);

                autoShowUserModule($userid,'car');  // 汽车门户，新增配置
				//更新当前会员下已经发布的卖车信息性质
				$sql = $dsql->SetQuery("UPDATE `#@__car_list` SET `usertype` = 1, `userid` = '$aid' WHERE `userid` = '$userid'");
				$dsql->dsqlOper($sql, "update");

				updateCache("car_store_list", 300);
				clearCache("car_store_total", 'key');

				//微信通知
	            $cityName = $siteCityInfo['name'];
	        	$cityid  = $siteCityInfo['cityid'];
		        $param = array(
		        	'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
		        	'cityid' => $cityid,
		            'notify' => '管理员消息通知',
		            'fields' =>array(
			            'contentrn'  => $cityName.'分站——car模块——新增商铺: '.$title.'等待审核',
			            'date' => date("Y-m-d H:i:s", time()),
			        )
		        );

				updateAdminNotice("car", "store",$param);
                dataAsync("car",$aid,"store");  // 汽车门户-商店-新增
				return $langData['car'][7][9];//配置成功，您的公司正在审核中，请耐心等待！
			}else{
				return array("state" => 200, "info" => $langData['car'][7][10]);//配置失败，请查检您输入的信息是否符合要求！
			}

		//更新商铺信息
		}else{

			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__car_store` SET  `title` = '$title', `logo` = '$litpic', `areaCode` = '$areaCode', `tel` = '$tel', `state` = '$editModuleJoinCheck' ".$field." WHERE `userid` = ".$userid);
			$results = $dsql->dsqlOper($archives, "update");

			if($results == "ok"){

                $oldid = $userResult[0]['id'];

                $urlParam = array(
                    'service' => 'car',
                    'template' => 'store-detail',
                    'id' => $oldid
                );
                $url = getUrlPath($urlParam);
        
                //记录用户行为日志
                memberLog($userid, 'car', '', $oldid, 'update', '更新信息('.$title.')', $url, $archives);

				$sql = $dsql->SetQuery("UPDATE `#@__car_list` SET `usertype` = 1, `userid` = '$oldid' WHERE `userid` = '$userid'");
				$dsql->dsqlOper($sql, "update");

				checkCache("car_store_list", $oldid);
				clearCache("car_store_detail", $oldid);
				clearCache("car_store_total", 'key');

				//微信通知
	            $cityName = $siteCityInfo['name'];
	        	$cityid  = $siteCityInfo['cityid'];
		        $param = array(
		        	'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
		        	'cityid' => $cityid,
		            'notify' => '管理员消息通知',
		            'fields' =>array(
			            'contentrn'  => $cityName.'分站——car模块——商铺: '.$title.'更新',
			            'date' => date("Y-m-d H:i:s", time()),
			        )
		        );

				updateAdminNotice("car", "store",$param);
                dataAsync("car",$id,"store");  // 汽车门户-商店-修改

                return $langData['siteConfig'][6][39];//保存成功
			}else{
				return array("state" => 200, "info" => $langData['car'][7][10]);//配置失败，请查检您输入的信息是否符合要求！
			}

		}

	}

	/**
     * 经销商列表
     * @return array
     */
	public function storeList(){
		global $dsql;
		global $langData;
		global $userLogin;
		$pageinfo = $list = array();

		$orderby = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
			}else{
				$addrid    = $this->param['addrid'];
				$business  = $this->param['business'];
				$flags     = $_REQUEST['flags'];
				$state     = $this->param['state'];
				$keywords  = $this->param['keywords'];
				$orderby   = $this->param['orderby'];
				$orderbymax  = $this->param['orderbymax'];
				$u         = $this->param['u'];
				$page      = $this->param['page'];
				$pageSize  = $this->param['pageSize'];
				$carstore  = $this->param['carstore'];
				$brand  = $this->param['brand'];

			}
		}
		$state    = $state == "" ? 1 : $state;
		if($flags != ""){
			$flag = array();
			$flagArr = explode(",", $flags);
			if ($flagArr[0]==1) {
				$where .= " AND u.`licenseState` = 1";
			}elseif ($flagArr[0]==2) {
				$where .= " AND u.`promotion` != 0";
			}elseif(count($flagArr)>=2)
				$where .= " AND u.`promotion` != 0 AND u.`licenseState` = 1 ";
		}

		// if ($flags) {
		// 	$flagArr = explode(",", $flags);
		// 	if (!empty($flagArr['0']==1)) {
		// 		$where .= " AND u.`licenseState` = 1";
		// 	}elseif (!empty($flagArr['0']==2)) {
		// 		$where .= " AND u.`promotion` != 0";
		// 	}else{
		// 		$where .= " AND u.`promotion` != 0 AND u.`licenseState` = 1s ";
		// 	}
		// }
		// 状态
		if($state != ""){
			$where .= " AND z.`state` = $state";
		}

		//数据共享
		require(HUONIAOINC."/config/car.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
			$cityid = getCityId($this->param['cityid']);

			if($cityid){
				$where .= " AND z.`cityid` = ".$cityid;
			}
		}

		//遍历地区
		if(!empty($addrid)){
			if (!empty($business)) {
					$addrid = $business;
				}
			if($dsql->getTypeList($addrid, "site_area")){
				$addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
				$addridArr = join(',',$addridArr);
				$lower = $addrid.",".$addridArr;
			}else{
				$lower = $addrid;
			}
			$where .= " AND z.`addrid` in ($lower)";
		}
		$time = time();
		$week = date('w', time());
		$hour = (int)date('H');
		$ob = "`bid_week{$week}` = 'all'";
		if($hour > 8 && $hour < 20){
			$ob .= " or `bid_week{$week}` = 'day'";
		}
		$ob = "($ob)";
		if ($carstore) {
            $wherecityid ='';
            if(!$dataShare){
                $wherecityid = "AND l.`cityid` IN (".$cityid.")";
            }
			$whrestore = $wherecityid." AND l.`state` = 1 AND l.`waitpay` = 0 AND l.`usertype`=1";
			$orderbyby = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`weight` DESC, l.`id` DESC";
		}
		// 关键字
		if(!empty($keywords)){

			//搜索记录
			if((!empty($_POST['keywords']) || !empty($_GET['keywords'])) && empty($_GET['callback'])){
				siteSearchLog("car", $keywords);
			}

			$where .= " AND (z.`title` like '%".$keywords."%')";
		}
		if(!empty($brand)){
			if($dsql->getTypeList($brand, "car_brandtype")){
				$lower = arr_foreach($dsql->getTypeList($brand, "car_brandtype"));
				$lower = $brand.",".join(',',$lower);
			}else{
				$lower = $brand;
			}
			$where .= " AND s.`brand` in ($lower)";
		}
		$groupy=" GROUP BY z.`id`";
		// var_dump($where);die;
		if(!empty($orderby)){
			//发布时间
			if($orderby == 1){
				$orderby = " ORDER BY z.`pubdate` DESC, z.`weight` DESC, z.`id` DESC";
			}elseif($orderby == 5){
				// $orderby = " ORDER BY z.`pubdate` ASC, z.`weight` DESC, z.`id` DESC";
			//房源数量
			}elseif($orderby == 3){
				//$orderby = " ORDER BY z.`counts` DESC, z.`weight` DESC, z.`id` DESC";
			}elseif($orderby == 4){
				//$orderby = " ORDER BY z.`counts` ASC, z.`weight` DESC, z.`id` DESC";
			}
		}else{
			$orderby = " ORDER BY z.`weight` DESC, z.`pubdate` DESC, z.`id` DESC";
		}
		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;
		$archives = $dsql->SetQuery("SELECT " .
									"z.`id`, z.`title`, z.`logo`, z.`pics`, z.`authattr`, z.`userid`, z.`suc`,z.`areaCode`,z.`tel`,z.`lng`,z.`lat`,u.`licenseState`,u.`promotion`,z.`addrid`, z.`address`, z.`click`, z.`flag`, z.`pubdate`, z.`cityid`" .
									"FROM `#@__car_store` z LEFT JOIN `#@__member` u ON z.`userid` = u.`id` LEFT JOIN `#@__car_list` s ON z.`id` = s.`userid`	" .
									"WHERE 1 = 1" . $where.$groupy);
		//总条数
		$totalCount = getCache("car_store_total", $archives, 300, array("savekey" => 1, "type" => "totalCount", "disabled" => $u));
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		$where = $pageSize != -1 ? " LIMIT $atpage, $pageSize" : "";
		$sql = $dsql->SetQuery($archives.$orderby.$where);
		$results = getCache("car_store_list", $sql, 300, array("disabled" => $u));
		if($results){
            // $cityid = getCityId($this->param['cityid']);
            // if($cityid){
            //     $where = " AND `cityid` = ".$cityid;
            // }
			foreach($results as $key => $val){
				$list[$key]['id']      = $val['id'];
				$list[$key]['title']   = $val['title'];
				$list[$key]['logo']  = !empty($val['logo']) ? getFilePath($val['logo']) : "";
				$list[$key]['userid']  = $val['userid'];
				$list[$key]['areaCode']     = $val['areaCode'];
				$list[$key]['tel']     = $val['tel'];
				$list[$key]['address'] = $val['address'];
				$list[$key]['lng'] = $val['lng'];
				$list[$key]['lat'] = $val['lat'];
				$list[$key]['licenseState'] = $val['licenseState'];
				$list[$key]['promotion'] = $val['promotion'];

				//已售
				$list[$key]['soldnums'] = $val['suc'];
				//在售
			    $archives = $dsql->SetQuery("SELECT count(l.`id`) totalCount FROM `#@__car_list` l LEFT JOIN `#@__car_adviser` a ON a.`id` = l.`userid` WHERE l.`state` = 1 AND l.`usertype` = 1 AND a.`store` = " . $val['id']);
			    $saletotalCount = $dsql->dsqlOper($archives, "results");
			    $list[$key]['salenums'] = $saletotalCount[0]['totalCount'];
			   //上新
			    $BeginDate=date('Y-m-01', strtotime(date("Y-m-d")));//本月第一天
			    $overDate=date('Y-m-d', strtotime("$BeginDate +1 month -1 day"));//本月最后一天
			    $btime=strtotime($BeginDate);
			    $ovtime=strtotime($overDate);
			    $newsql=$dsql->SetQuery("SELECT `id` as newest FROM `#@__car_list` WHERE `pubdate` between $btime and $ovtime AND `userid` = " . $val['id']);
			    $newestnum = $dsql->dsqlOper($newsql, "totalCount");
 				$list[$key]['newestnum'] = $newestnum;


 				if ($carstore) {
 					$carstoresql=$dsql->SetQuery("SELECT l.`id`,l.`litpic`, l.`title`, l.`price`, l.`flag`,l.`pics` FROM `#@__car_list` l LEFT JOIN `#@__car_adviser` a ON a.`id` = l.`userid` WHERE a.`store` = " . $val['id']." $whrestore $orderbyby LIMIT 3");
			   		$result = $dsql->dsqlOper($carstoresql, "results");
			   		foreach ($result as $k => $v) {
				   			if(!empty($v['litpic'])){
								$result[$k]['litpic']    = getFilePath($v['litpic']);
							}elseif(empty($v['litpic']) && !empty($v['pics'])){
								$picsArr = explode(',', $v['pics']);
								$result[$k]['litpic']    = getFilePath($picsArr[0]);
							}
				   		}

				   		$list[$key]['carstorenum']=$result;
 				}

 				//车辆加入数组成功
				$picsArr = array();
				$pics    = $val['pics'];
				if (!empty($pics)) {
					$pics = explode(",", $pics);
					foreach ($pics as $k => $value) {
						array_push($picsArr, getFilePath($value));
					}
				}
				$list[$key]['picsAll'] = $picsArr;

				$list[$key]['click']   = $val['click'];
				$list[$key]['flag']    = $val['flag'];
				$list[$key]['pubdate'] = $val['pubdate'];

				$addrName = getParentArr("site_area", $val['addrid']);
				global $data;
				$data = "";
				$addrName = array_reverse(parent_foreach($addrName, "typename"));
				$list[$key]['addrName']       = $addrName;

				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = ".$val['cityid']);
				$res = $dsql->dsqlOper($sql, "results");
				$list[$key]['city'] = $res ? $res[0]['typename'] : "";

                $param = array(
                    "service"     => "car",
                    "template"    => "store-detail",
                    "id"          => $val['id']
                );
				$list[$key]['url'] = getUrlPath($param);

				$authattrArr = array();
				if(!empty($val['authattr'])){
					$authattr = explode(",", $val['authattr']);
					foreach ($authattr as $v) {
						$sql = $dsql->SetQuery("SELECT `jc` FROM `#@__car_authattr` WHERE `id` = ".$v);
						$res = $dsql->dsqlOper($sql, "results");
						if($res){
							$authattrArr['jc'][] = $res[0]['jc'];
							$authattrArr['py'][] = GetPinyin($res[0]['jc']);
						}
					}
				}
				$list[$key]['authattrAll'] = $authattrArr;

			}
			if ($orderbymax == 2) {
				array_multisort(array_column($list, 'salenums'),SORT_DESC,$list);
			}
		}
		// var_dump($list);die;
		return array("pageInfo" => $pageinfo, "list" => $list);

	}

	/**
     * 经销商详细信息
     * @return array
     */
	public function storeDetail(){
		global $dsql;
		global $langData;
		global $userLogin;
		global $cfg_secureAccess;
		$listingDetail = array();
		$id = $this->param;
        $id = is_numeric($id) ? $id : (is_array($id) ? (int)$id['id'] : '');
        $gettype = is_numeric($this->param) ? 0 : (is_array($this->param) ? $this->param['gettype'] : 0);
		$uid = $userLogin->getMemberID();

		if(!is_numeric($id) && $uid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！
		}

        $where = '';
        if((int)$gettype == 0){

            $where = " AND `state` = 1";
        }
		if(!is_numeric($id)){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__car_store` WHERE `userid` = ".$uid);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$id = $results[0]['id'];
				$where = "";
			}else{
				return array("state" => 200, "info" => $langData['siteConfig'][21][119]);//该会员暂未开通商铺
			}
		}

		$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `suc`, `addrid`, `title`, `logo`, `userid`, `address`, `lng`, `lat`, `tel`, `license`, `pics`, `opentime`, `tag`, `authattr`, `note`, `weight`, `click`, `state`, `pubdate`, `flag`,`is_vipguanggao`, `refuse` FROM `#@__car_store` WHERE `id` = ".$id.$where);
		// $results  = $dsql->dsqlOper($archives, "results");
		// var_dump($archives);die;
		$results  = getCache("car_store_detail", $archives, 0, $id);
		if($results){

			//经纬度
			$results[0]["lng"]            = $results[0]["lng"];
			$results[0]["lat"]            = $results[0]["lat"];
			$results[0]["userid"]         = $results[0]["userid"];
			$results[0]["is_vipguanggao"] = $results[0]["is_vipguanggao"];
			$results[0]["litpicSource"] = $results[0]["logo"];
			$results[0]["litpic"] = getFilePath($results[0]["logo"]);
			//已售
			$results[0]['soldnums'] = $results[0]['suc'];
			//在售
		    $archives = $dsql->SetQuery("SELECT count(l.`id`) totalCount FROM `#@__car_list` l LEFT JOIN `#@__car_adviser` a ON a.`id` = l.`userid` WHERE l.`state` = 1 AND l.`usertype` = 1 AND a.`store` = " . $results[0]['id']);
		    $saletotalCount = $dsql->dsqlOper($archives, "results");
		    $results[0]['salenums'] = $saletotalCount ? $saletotalCount[0]['totalCount'] : 0;
		    //上新
		    $BeginDate=date('Y-m-01', strtotime(date("Y-m-d")));//本月第一天
			$overDate=date('Y-m-d', strtotime("$BeginDate +1 month -1 day"));//本月最后一天
			$btime=strtotime($BeginDate);
			$ovtime=strtotime($overDate);
			$newsql=$dsql->SetQuery("SELECT `id` as newest FROM `#@__car_list` WHERE `pubdate` between $btime and $ovtime AND `userid` = " . $results[0]['id']);
			$newestnum = $dsql->dsqlOper($newsql, "totalCount");
 			$results[0]['newestnum'] = $newestnum;

 			$zhengsql=$dsql->SetQuery("SELECT `licenseState`,`promotion` FROM `#@__member` WHERE `id` = " . $results[0]['id']);
			$zheng = $dsql->dsqlOper($zhengsql, "results");
			$results[0]['licenseState'] = $zheng[0]['licenseState'];
			$results[0]['promotion'] = $newestnum[0]['promotion'];
			$results[0]["licenseSource"] = $results[0]["license"];
			$results[0]["license"] = getFilePath($results[0]["license"]);

			$addrName = getParentArr("site_area", $results[0]['addrid']);
			global $data;
			$data = "";
			$addrName = array_reverse(parent_foreach($addrName, "typename"));
			$results[0]['addrName']  = $addrName;
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
			$results[0]["tagArr"] = $tagArr;

			$results[0]["tag"] = $results[0]['tag'];

			$authattrArr = array();
			if(!empty($results[0]['authattr'])){
				$authattr = explode(",", $results[0]['authattr']);
				foreach ($authattr as $v) {
					$sql = $dsql->SetQuery("SELECT `jc` FROM `#@__car_authattr` WHERE `id` = ".$v);
					$res = $dsql->dsqlOper($sql, "results");
					if($res){
						$authattrArr['jc'][] = $res[0]['jc'];
						$authattrArr['py'][] = GetPinyin($res[0]['jc']);
					}
				}
			}
			$results[0]['authattrAll'] = $authattrArr;

			$picsArr = array();
            $pics    = $results[0]['pics'];
            if (!empty($pics)) {
                $pics = explode(",", $pics);
                foreach ($pics as $key => $value) {
                    array_push($picsArr, array("pic" => getFilePath($value), "picSource" => $value));
                }
            }
			$results[0]['pics'] = $picsArr;

			$opentimeArr = explode("-", $results[0]["opentime"]);
			$results[0]['openStart'] = $opentimeArr[0];
			$results[0]['openEnd'] = $opentimeArr[1];

			$results[0]['opentime'] = $results[0]["opentime"];
			$openStartArr = explode(":", $opentimeArr[0]);
			$openEndArr   = explode(":", $opentimeArr[1]);
			$results[0]['opentimename'] = $openStartArr[0] . '时' . $openStartArr[1] . '分-' . $openEndArr[0] . '时' . $openEndArr[1] . '分';

			//验证是否已经收藏
			$params = array(
				"module" => "car",
				"temp"   => "store-detail",
				"type"   => "add",
				"id"     => $id,
				"check"  => 1
			);
			$collect = checkIsCollect($params);
			$results[0]['collect'] = $collect == "has" ? 1 : 0;

			$param = array(
				"service"     => "car",
				"template"    => "store-detail",
				"id"          => $id
			);
			$results[0]['url'] = getUrlPath($param);
			return $results[0];
		}
	}

	/**
     * 顾问列表
     * @return array
     */
	public function adviserList(){
		global $dsql;
		global $langData;
		global $userLogin;
		$pageinfo = $list = array();
		$comid = $userid = $u = $addrid = $state = $orderby = $page = $pageSize = $where = $where1 = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
			}else{
				$comid    = (int)$this->param['comid'];
				$userid   = (int)$this->param['userid'];
				$u        = (int)$this->param['u'];
				$addrid   = (int)$this->param['addrid'];
				$state    = $this->param['state'];
				$type     = (int)$this->param['type'];	// 获取类型
				$orderby  = (int)$this->param['orderby'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
				$keywords = $this->param['keywords'];
				$iszjcom  = (int)$this->param['iszjcom'];
			}
		}

		$loginuid = $userLogin->getMemberID();

		//数据共享
		require(HUONIAOINC."/config/car.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
			$cityid = getCityId($this->param['cityid']);
			if($cityid && empty($userid) && empty($u) && empty($comid)){
				$where .= " AND `cityid` = ".$cityid;
			}
		}

        if($keywords){
            $user_sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE (`username` LIKE '%$keywords%' || `nickname` LIKE '%$keywords%' || `phone` LIKE '%$keywords%')");
            $user_ret = $dsql->dsqlOper($user_sql, "results");
            if($user_ret){
            	global $arr_data;
            	$arr_data = array();
            	$ids = arr_foreach($user_ret);
                $where .= " AND `userid` IN (".join(",", $ids).")";
            }else{
                return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！
            }
        }
		if(!$u){
			$where .= " AND `state` = 1";
		}

		if(!empty($comid)){
			$userinfo = $userLogin->getMemberInfo();
			if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "car"))){
				//return array("state" => 200, "info" => $langData['car'][7][2]);//商家权限验证失败
			}

			$where .= " AND `store` = " . $comid;

			if($state != ""){
				if($state == "1,2"){
					$where1 = " AND (`state` = 1 || `state` = 2)";
				}else{
                    $state = (int)$state;
					$where1 = " AND `state` = ".$state;
				}
			}

			if($type != "getnormal"){
				//$where .= " AND `by_zjcom` != $comid";
			}
		}

		if($u && empty($comid) && empty($userid)){
			return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！
		}

		if(!empty($userid)){
			$where .= " AND `id` = " . $userid;
		}

		// 中介公司查看入驻申请
		if($iszjcom){
			if($loginuid == -1) $iszjcom = 0;
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_store` WHERE `userid` = $loginuid");
			$res = $dsql->dsqlOper($sql, "results");
			if(!$res) $iszjcom = 0;
		}

		//遍历地区
		if(!empty($addrid)){
			if($dsql->getTypeList($addrid, "site_area")){
				$addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
				$addridArr = join(',',$addridArr);
				$lower = $addrid.",".$addridArr;
			}else{
				$lower = $addrid;
			}
			$where .= " AND `addr` in ($lower)";
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		//查表
		$archives = $dsql->SetQuery("SELECT COUNT(`id`) count FROM `#@__car_adviser` WHERE 1 = 1" . $where);
		// $results = $dsql->dsqlOper($archives, "results");
		// $totalCount = $results[0]['count'];
		//总条数
		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__car_adviser` WHERE 1 = 1".$where);
		$totalCount = getCache("car_adviser_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

		$pageinfo = array(
			"page" => (int)$page,
			"pageSize" => (int)$pageSize,
			"totalPage" => (int)$totalPage,
			"totalCount" => (int)$totalCount
		);

		//顾问列表需要统计信息状态
		if(!empty($comid) && $loginuid > -1){

			//待审核
			$results = $dsql->dsqlOper($archives." AND `state` = 0", "results");
			$state0 = $results[0]['count'];
			//已审核
			$results = $dsql->dsqlOper($archives." AND `state` = 1", "results");
			$state1 = $results[0]['count'];
			//拒绝审核
			$results = $dsql->dsqlOper($archives." AND `state` = 2", "results");
			$state2 = $results[0]['count'];

			$pageinfo['state0'] = (int)$state0;
			$pageinfo['state1'] = (int)$state1;
			$pageinfo['state2'] = (int)$state2;
		}

		$atpage = $pageSize*($page-1);

		$archives = $dsql->SetQuery("SELECT * FROM `#@__car_adviser` WHERE 1 = 1" . $where);

		//如果是按照房源数量排序，则不进行分页
		if($orderby != "level"){
			$where = " LIMIT $atpage, $pageSize";
		}else{
			$where = "";
		}

		if($comid && empty($orderby)){
			$orderby = " ORDER BY `weight` DESC, `id` DESC";
		}else{
			//发布时间
			if($orderby == 1){
				$orderby = " ORDER BY `joindate` DESC, `weight` DESC, `id` DESC";
			}elseif($orderby == 2){
				$orderby = " ORDER BY `joindate` ASC, `weight` DESC, `id` ASC";
			//房源数量
			}elseif($orderby == 3){
				//$orderby = " ORDER BY `counts` DESC, `weight` DESC, `id` DESC";
			}elseif($orderby == 4){
				//$orderby = " ORDER BY `counts` ASC, `weight` DESC, `id` DESC";
			}else{
				$orderby = " ORDER BY `weight` DESC, `id` DESC";
			}

		}

		// $results = $dsql->dsqlOper($archives.$where1 . $orderby .$where, "results");
		$sql = $dsql->SetQuery($archives.$where1.$orderby.$where);
		$results = getCache("car_adviser_list", $sql, 300, array("disabled" => $u));
		if($results){

			foreach ($results as $key => $value) {
				$list[$key]['id']     = $value['id'];
				$list[$key]['userid'] = $value['userid'];
				$list[$key]['store']  = $value['store'];
				$list[$key]['state']   = $value['state'];
				$list[$key]['quality']  = $value['quality'] ? $value['quality'] : 0;



				$sucnum = 0;
				$onsale = 0;
				//已售
				$sucnum = $value['suc'];
				//在售
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__car_list` WHERE `state` = 1 AND `userid` = " . $value['userid']);
				$saletotalCount = $dsql->dsqlOper($archives, "totalCount");
				$onsale = $saletotalCount;
				$list[$key]['soldnums'] = $sucnum;
				$list[$key]['salenums'] = $onsale;

				$addrid = $value['addr'];
				$areaid = 0;

				//父级区域
				$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = ".$addrid);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$areaid = $ret[0]['parentid'];
				}

				$list[$key]["areaid"]     = $areaid;
				$list[$key]["addrid"]     = $addrid;
				$list[$key]["cityid"]     = $value['cityid'];

				// 名片
				$litpic = $value['litpic'];

				$sql = $dsql->SetQuery("SELECT `photo` FROM `#@__member` WHERE `id` = ".$value['userid']);
				$ret = $dsql->dsqlOper($sql, "results");

				if($value['litpic']) {
                    $list[$key]['litpicSource'] = $value['litpic'];
                    $list[$key]['litpic'] = getFilePath($value['litpic']);
                }elseif($ret && $ret[0]['photo']){
					$list[$key]['litpicSource'] = $ret[0]['photo'];
                    $list[$key]['litpic'] = changeFileSize(array('url' => getFilePath($ret[0]['photo']), 'type' => 'large'));
				}else{
                	$list[$key]['litpicSource'] = "";
                    $list[$key]['litpic'] = "";
                }

				$list[$key]['tel']   = $value['tel'];
				$list[$key]['name']   = $value['name'];
				$list[$key]['click']  = $value['click'];
				$list[$key]['pubdate'] = $value['pubdate'];
				$list[$key]['joindate'] = $value['joindate'];

				$archives = $dsql->SetQuery("SELECT `nickname`, `phone`, `photo`, `certifyState`, `idcardFront`, `idcardBack` FROM `#@__member` WHERE `id` = ".$value['userid']);
				$member = $dsql->dsqlOper($archives, "results");
				if($member){
					$list[$key]['nickname']    = $member[0]['nickname'];
					$list[$key]['phone']       = $member[0]['phone'];
					$list[$key]['photo']       = getFilePath($member[0]['photo']);
					$list[$key]['photoSource'] = $member[0]['photo'];
					$list[$key]['certify']     = $member[0]['certifyState'];

					// 如果是中介公司，输出身份证照片
					if($iszjcom){
						$list[$key]['idcardFront'] = getFilePath($member[0]['idcardFront']);
						$list[$key]['idcardBack'] = getFilePath($member[0]['idcardBack']);
					}
				}
				else{
					$list[$key]['nickname']    = "";
					$list[$key]['phone']       = "";
					$list[$key]['photo']       = "";
					$list[$key]['photoSource'] = "";
					$list[$key]['certify']     = 0;
				}

				$archives = $dsql->SetQuery("SELECT `title` FROM `#@__car_store` WHERE `id` = ".$value['store']);
				$zjComRet = $dsql->dsqlOper($archives, "results");
				if($zjComRet){
					$list[$key]['zjcomName'] = $zjComRet[0]['title'];
				}else{
					$list[$key]['zjcomName']  = "";
				}

				$addrName = getParentArr("site_area", $value['addr']);
				global $data;
				$data = "";
				$addrName = array_reverse(parent_foreach($addrName, "typename"));
				$list[$key]['address'] = $addrName;

				$param = array(
					"service"     => "car",
					"template"    => "broker-detail",
					"id"          => $value['id']
				);
				$list[$key]['url'] = getUrlPath($param);

			}

		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
	 * 经销商添加顾问
	 */
	public function addAdviser(){
		global $dsql;
		global $langData;
		global $userLogin;

		$userid  = $userLogin->getMemberID();

		$param = $this->param;
		$name  = $param['nickname'];
		$phone = $param['phone'];
		$photo = $param['photo'];
		$pswd  = $param['password'];
		$quality  = (int)$param['quality'];

		$pubdate = GetMkTime(time());

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录
		}

		//验证会员类型
		$userDetail = $userLogin->getMemberInfo();
		if($userDetail['userType'] != 2){
			return array("state" => 200, "info" => $langData['car'][7][11]);//账号验证错误，操作失败！
		}

		if(!verifyModuleAuth(array("module" => "car"))){
			return array("state" => 200, "info" => $langData['car'][7][2]);//商家权限验证失败！
		}

		$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `state`, `addrid` FROM `#@__car_store` WHERE `userid` = ".$userid);
		$results  = $dsql->dsqlOper($archives, "results");
		if(!$results) return array("state" => 200, "info" => $langData['car'][7][12]);//您还没有开通经销商
		if($results[0]['state'] != 1) return array("state" => 200, "info" => $langData['car'][7][13]);//您的经销商还没有通过审核

		$zjComDetail = $results[0];

		if(empty($name)) return array("state" => 200, "info" => $langData['car'][7][14]);//请填写姓名
		if(empty($phone)) return array("state" => 200, "info" => $langData['car'][7][15]);//请填写手机号
		// 验证手机号是否存在
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '$phone' || `phone` = '$phone'");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			return array("state" => 200, "info" => $langData['car'][7][16]);//该手机号已被注册，请重新填写
		}

		//if(empty($pswd)) return array("state" => 200, "info" => $langData['car'][7][17]);//请填写登陆密码
		//preg_match('/^.{5,}$/', $pswd, $matchPassword);
		//if(!$matchPassword) return array("state" => 200, "info" => $langData['car'][7][18]);//密码格式有误，最少5个字符
		$pswd = $pswd ? $pswd : '';

		// 创建会员
		$password = $userLogin->_getSaltedHash($pswd);
		$regtime  = $pubdate;
		$regip    = GetIP();
		$regipaddr = getIpAddr($regip);
        $regfrom = getCurrentTerminal();

		$sql = $dsql->SetQuery("INSERT INTO `#@__member`
			(`mtype`, `username`, `password`, `phone`, `nickname`, `photo`, `state`, `purviews`, `regtime`, `regip`, `regipaddr`, `regfrom`)
			VALUES
			(1, '$phone', '$password', '$phone', '$name', '$photo', 1, '', '$regtime', '$regip', '$regipaddr', '$regfrom')");
		$uid = $dsql->dsqlOper($sql, "lastid");
		if(is_numeric($uid)){

			// 创建顾问
			$zjcom  = $zjComDetail['id'];
			$cityid = $zjComDetail['cityid'];
			$addr   = $zjComDetail['addrid'];
			$litpic = $photo;

			$archives = $dsql->SetQuery("INSERT INTO `#@__car_adviser` (`cityid`, `userid`, `store`, `addr`, `litpic`, `state`, `quality`, `tel`, `name`, `pubdate`, `by_zjcom`, `joindate`, `weight`) VALUES ('$cityid', '$uid', '$zjcom', '$addr', '$litpic', '1', '$quality', '$phone', '$name', '$pubdate', '$zjcom', '$pubdate', '1')");
			$aid = $dsql->dsqlOper($archives, "lastid");
    
            //记录用户行为日志
            memberLog($uid, 'car', 'adviser', $aid, 'insert', '添加顾问('.$name.')', '', $archives);

			updateCache("car_adviser_list", 300);
			clearCache("car_adviser_total", 'key');

			return $langData['siteConfig'][22][107];//添加成功
		}else{
			return array("state" => 200, "info" => $langData['car'][7][19]);//添加失败，请重试！
		}

	}

	/**
	 * 经销商操作顾问
	 * type=del: 删除
	 * type=update: 更新
	 */
	public function operAdviser(){
		global $dsql;
		global $langData;
		global $userLogin;

		$userid  = $userLogin->getMemberID();

		$param = $this->param;
		$id    = (int)$param['id'];
		$type  = $param['type'];
		$quality = (int)$param['quality'];
		$photo = $param['photo'];

		$pubdate = GetMkTime(time());

		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		//验证会员类型
		$userDetail = $userLogin->getMemberInfo();
		if($userDetail['userType'] != 2){
			return array("state" => 200, "info" => $langData['siteConfig'][21][127]);//账号验证错误，操作失败
		}

		if(!verifyModuleAuth(array("module" => "car"))){
			return array("state" => 200, "info" => $langData['car'][7][2]);//商家权限验证失败！
		}

		$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `state` FROM `#@__car_store` WHERE `userid` = ".$userid);
		$results  = $dsql->dsqlOper($archives, "results");
		if(!$results) return array("state" => 200, "info" => $langData['car'][7][12]);//您还没有开通经销商
		if($results[0]['state'] != 1) return array("state" => 200, "info" => $langData['car'][7][13]);//您的经销商还没有通过审核

		$zjComDetail = $results[0];

		if(empty($type) || empty($id)) return array("state" => 200, "info" => $langData['car'][7][20]);//参数错误

		$sql = $dsql->SetQuery("SELECT `id`, `name`, `userid`, `by_zjcom`, `joindate` FROM `#@__car_adviser` WHERE `id` = $id AND `store` = ".$zjComDetail['id']);
		$ret = $dsql->dsqlOper($sql, "results");
		if(!$ret) return array("state" => 200, "info" => $langData['car'][7][21]);//顾问不存在或没有管理权限

		$uid = $ret[0]['userid'];
        $name = $ret[0]['name'];
		$joindate = $ret[0]['joindate'];


		if($type == "del"){

			$sql = $dsql->SetQuery("DELETE FROM `#@__car_adviser` WHERE `id` = $id");
			$res = $dsql->dsqlOper($sql, "update");
			if($res == "ok"){
        
                //记录用户行为日志
                memberLog($userid, 'car', 'adviser', $id, 'delete', '删除顾问('.$name.')', '', $sql);

				// 清除缓存
				clearCache("car_adviser_detail", $id);
				checkCache("car_adviser_list", $id);
				clearCache("car_adviser_total", 'key');

				// 经销商添加的顾问同时删除会员账号
				if($ret[0]['by_zjcom'] == $zjComDetail['id']){
					$sql = $dsql->SetQuery("DELETE FROM `#@__member` WHERE `id` = $uid");
					$dsql->dsqlOper($sql, "update");
				}else{
					$sql = $dsql->SetQuery("UPDATE `#@__car_list` SET `usertype` = 0, `userid` = '$uid' WHERE `userid` = '$id'");
					$dsql->dsqlOper($sql, "update");
				}

				return $langData['car'][7][22];//操作成功！
			}else{
				return array("state" => 200, "info" => $langData['car'][7][23]);//操作失败，请重试！
			}
		// 同意
		}elseif($type == "agree"){
			if($joindate == 0){
				$joindate_ = ", `joindate` = $pubdate";
			}
			$sql = $dsql->SetQuery("UPDATE `#@__car_adviser` SET `state` = 1 $joindate_ WHERE `id` = $id");
			$res = $dsql->dsqlOper($sql, "update");
			if($res == "ok"){
				// 清除缓存
				clearCache("car_adviser_detail", $id);
				clearCache("car_adviser_total", 'key');
				return $langData['car'][7][22];//操作成功！
			}else{
				return array("state" => 200, "info" => $langData['car'][7][23]);//操作失败，请重试！
			}

		}elseif($type == "update"){
			$field    = "";
			$name     = $param['nickname'];
			$phone    = $param['phone'];
			$joindate = $param['joindate'];

			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = $uid");
			$res = $dsql->dsqlOper($sql, "results");
			if(!$res) return array("state" => 200, "info" => $langData['car'][7][24]);//用户不存在！

			if(empty($name)) return array("state" => 200, "info" => $langData['car'][7][25]);//请填写姓名
			if(empty($phone)) return array("state" => 200, "info" => $langData['car'][7][15]);//请填写手机号

			$field .= ", `nickname` = '$name'";


			// 验证手机号是否存在
			$sql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE (`username` = '$phone' || `phone` = '$phone') AND `id` != $uid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				return array("state" => 200, "info" => $langData['car'][7][26]);//手机号已存在
			}
			if($ret[0]['username'] == $phone){
				$field .= ", `username` = '$phone', `phone` = '$phone'";
			}else{
				$field .= ", `phone` = '$phone'";
			}
			if($field){
				$sql = $dsql->SetQuery("UPDATE `#@__member` SET `id` = $uid $field WHERE `id` = $uid");
				$res = $dsql->dsqlOper($sql, "update");
				if($res != "ok") return array("state" => 200, "info" => $langData['car'][7][23]);//操作失败，请重试！
			}
			$field = '';
			$quality = $quality ? $quality : 0;
			if($photo){
				$field .= ", `litpic` = '$photo'";
			}

			$sql = $dsql->SetQuery("UPDATE `#@__car_adviser` SET `quality` = '$quality', `name` = '$name', `tel` = '$phone', `litpic` = '$photo' WHERE `id` = $id");
			$res = $dsql->dsqlOper($sql, "udpate");
    
            //记录用户行为日志
            memberLog($userid, 'car', 'adviser', $id, 'update', '更新顾问('.$name.')', '', $sql);

			if($joindate){
				$sql = $dsql->SetQuery("UPDATE `#@__car_adviser` SET `joindate` = $joindate, `quality` = '$quality' WHERE `id` = $id");
				$res = $dsql->dsqlOper($sql, "udpate");
			}

			// 清除缓存
			clearCache("car_adviser_detail", $id);
			clearCache("car_adviser_total", 'key');

			return $langData['car'][7][22];//操作成功

		}

	}

	/**
	 * 更新顾问审核状态
	 * @return array
	 */
	public function updateAdviserState(){
		global $dsql;
		global $langData;
		global $userLogin;

		$userid     = $userLogin->getMemberID();
		$param      = $this->param;
		$id         = (int)$param['id'];
		$state      = (int)$param['state'];
		$fail_type = $param['fail_type'];
		$fail_info = $param['fail_info'];

		if(empty($id)) return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
		if($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！

		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_store` WHERE `userid` = $userid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$cid = $ret[0]['id'];
			$sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__car_adviser` WHERE `id` = $id AND `store` = $cid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

                $name = $ret[0]['name'];
				$flag = "";
				$time = "";
				if($state == 1){
					$time = ", `pubdate` = ".GetMktime(time());
					$fail_type = 0;
					$fail_info = "";
				}

				$sql = $dsql->SetQuery("UPDATE `#@__car_adviser` SET `state` = $state".$time.", `fail_type` = '$fail_type', `fail_info` = '$fail_info' WHERE `id` = $id");
				$ret = $dsql->dsqlOper($sql, "update");
				if($ret == "ok"){
            
                    //记录用户行为日志
                    memberLog($userid, 'car', 'adviser', $id, 'update', '更新顾问('.$name.')', '', $sql);

					// 清除缓存
					clearCache("car_adviser_detail", $id);
					clearCache("car_adviser_total", 'key');

					return $langData['car'][7][27];//更新成功！
				}else{
					return array("state" => 200, "info" => $langData['car'][7][28]);//数据更新失败！
				}

			}else{
					return array("state" => 200, "info" => $langData['car'][7][29]);//权限验证失败！
			}

		}else{
				return array("state" => 200, "info" => $langData['car'][7][30]);//帐号类型验证失败！
		}
	}

	/**
	 * 开通顾问
	 * @return array
	 */
	public function configAdviser(){
		global $dsql;
		global $userLogin;
		global $langData;

		$userid      = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		$param       = $this->param;

		$alone       = (int)$param['alone'];

		$areaCode    = $param['areaCode'];
		$nickname    = $param['nickname'];
		$phone       = $param['phone'];
		$vdimgck     = $param['vdimgck'];
		$photo       = $param['photo'];	// 头像
		$litpic      = $param['litpic']; // 名片
		$qqQr        = $param['qqQr'];
		$wxQr        = $param['wxQr'];
		$qq          = $param['qq'];
		$wx          = $param['wx'];
		$idcardFront = $param['idcardFront'];
		$idcardBack  = $param['idcardBack'];
		$license     = $param['license'];	// 执业资格认证

		$zjcom = (int)$param['zjcom'];
		$post  = (int)$param['post'];
		$suc   = (int)$param['suc'];

		$addr      = (int)$param['addr'];
		$cityid    = (int)$param['cityid'];
		$community = $param['community'];

		$dopost    = $param['dopost'];

		$store   = filterSensitiveWords(addslashes($param['store']));
		$note    = filterSensitiveWords(addslashes($param['note']));

		$pubdate = GetMkTime(time());

		if($alone == 0){
			if($zjcom == 0){
				return array("state" => 200, "info" => $langData['car'][7][31]);//请选择所属公司！
				exit();
			}

			$comSql = $dsql->SetQuery("SELECT `id`, `cityid`, `userid` FROM `#@__car_store` WHERE `id` = ".$zjcom);
			$comResult = $dsql->dsqlOper($comSql, "results");
			if(!$comResult){
				return array("state" => 200, "info" => $langData['car'][7][32]);//经销商不存在，请在联想列表中选择，或者新增经销商！
				exit();
			}
			$comResult = $comResult[0];

			if(empty($cityid)) $cityid = $comResult['cityid'];
		}else{
			$zjcom = 0;
			$post = 0;
		}

		$sql = $dsql->SetQuery("SELECT `photo`, `phone`, `phoneCheck`, `idcardFront`, `idcardBack`, `certifyState` FROM `#@__member` WHERE `id` = $userid");
		$ret = $dsql->dsqlOper($sql, "results");
		$user = $ret[0];

		if(empty($phone)) return array("state" => 200, "info" => $langData['car'][7][15]);//请填写手机号


		// 用户表需要更新的字段
		$update_member = "";

		//if( empty($user['phone']) || $user['phoneCheck'] == 0 || $phone != $user['phone'] ){

			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE (`username` = '$phone' || `phone` = '$phone') AND `id` != $userid");
			$res = $dsql->dsqlOper($sql, "results");
			if($res){
				return array("state" => 200, "info" => $langData['car'][7][16]);//该手机号已被注册，请重新填写
			}

			if($dopost != 'edit'){
				if(empty($vdimgck)) return array("state" => 200, "info" => $langData['car'][7][33]);//请填写验证码

				$areaCode = empty($areaCode) ? "86" : $areaCode;
				$archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					$international = $results[0]['international'];
					if(!$international){
						$areaCode = "";
					}
				}else{
					return array("state" => 200, "info" => $langData['car'][7][34]);//短信平台未配置，提交失败！
				}

				$phone = $areaCode.$phone;

				//验证输入的验证码
				$archives = $dsql->SetQuery("SELECT `id`, `pubdate` FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `user` = '$phone' AND `code` = '$vdimgck'");
				$results  = $dsql->dsqlOper($archives, "results");
				if(!$results){
					return array("state" => 200, "info" => $langData['siteConfig'][20][99]);    //验证码输入错误，请重试！
				}else{

					//5分钟有效期
					$now = GetMkTime(time());
					if($now - $results[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！

					//验证通过删除发送的验证码
					$archives = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'auth' AND `user` = '$phone' AND `code` = '$vdimgck'");
					$dsql->dsqlOper($archives, "update");
				}
				$update_member .= "`phone` = '$phone',`phoneCheck` = 1, `phoneBindTime` = '$pubdate',";
			}

			$update_member .= "`phone` = '$phone',";


		//}
		// if(empty($idcardFront)) return array("state" => 200, "info" => '请上传身份证正面照片');
		// if(empty($idcardBack)) return array("state" => 200, "info" => '请上传身份证反面照片');

		if(($idcardFront && $idcardFront != $user['idcardFront']) || ($idcardBack && $idcardBack != $user['idcardBack'])){
			// 更新身份认证信息
			$update_member .= "`idcardFront` = '$idcardFront', `idcardBack` = '$idcardBack', `certifyState` = 0,";
		}

		if($photo && $user['photo'] != $photo){
			$update_member .= "`photo` = '$photo',";
		}

		// 更新用户表信息
		if($update_member != ""){
			$update_member = substr($update_member, 0, -1);
			$sql = $dsql->SetQuery("UPDATE `#@__member` SET $update_member WHERE `id` = $userid");
			$dsql->dsqlOper($sql, "update");
		}

		// if(empty($litpic)) return array("state" => 200, "info" => '请上传名片！');
		// if(empty($license)) return array("state" => 200, "info" => '请上传执业资格认证');

		$userSql = $dsql->SetQuery("SELECT `id`, `litpic`, `state`, `store`, `pubdate` FROM `#@__car_adviser` WHERE `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");

		//新中介
		if(!$userResult){

			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__car_adviser` (`cityid`, `userid`, `store`, `addr`, `litpic`, `state`, `pubdate`, `joindate`, `name`, `tel`, `weight`) VALUES ('$cityid', '$userid', '$zjcom', '$addr', '$litpic', '0', '$pubdate', '$pubdate', '$nickname', '$phone', 1)");
			$aid = $dsql->dsqlOper($archives, "lastid");

			if(is_numeric($aid)){
        
                //记录用户行为日志
                memberLog($userid, 'car', 'adviser', $aid, 'insert', '添加顾问('.$nickname.')', '', $archives);

				//更新当前会员下已经发布的卖车信息性质
				//$sql = $dsql->SetQuery("UPDATE `#@__car_list` SET `usertype` = 1, `userid` = '$aid' WHERE `userid` = '$userid'");
				//$dsql->dsqlOper($sql, "update");

				if($alone == 0){
					$param = array(
						"service" => "member",
						"template" => "car_receive_broker"
					);
					updateMemberNotice($comResult['userid'], '会员-经纪人入驻通知中介公司', $param);
				}

				// 清除缓存
				updateCache("car_adviser_list", 300);
				clearCache("car_adviser_total", 'key');

				return $alone == 0 ? $langData['car'][7][35] : $langData['car'][7][36];
			}else{
				return array("state" => 200, "info" => $langData['car'][7][37]);
			}

		//更新中介信息
		}else{

			$state_old = $userResult[0]['state'];
			$pubdate_old = $userResult[0]['pubdate'];

			$changeState_  = "";
			if($alone == 0){
				$changeState_ = ", `state` = 0, `pubdate` = $pubdate";
			}

			//$RenrenCrypt = new RenrenCrypt();
			//$opic = $RenrenCrypt->php_decrypt(base64_decode($userResult[0]['litpic']));
			//$npic = $RenrenCrypt->php_decrypt(base64_decode($litpic));

			//$flag = ", `flag` = 0, `litpic` = '$litpic'";
			if($photo){
				$flag = ", `litpic` = '$photo'";
			}

			//if($opic == $npic){
				//$flag = "";
			//}print_R($litpic);die;

			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__car_adviser` SET `addr` = '$addr', `name` = '$nickname', `tel` = '$phone', `cityid`= '$cityid'".$changeState_.$flag." WHERE `userid` = ".$userid);
			$results = $dsql->dsqlOper($archives, "update");

			if($results == "ok"){
        
                //记录用户行为日志
                memberLog($userid, 'car', 'adviser', $userResult[0]['id'], 'update', '更新顾问('.$nickname.')', '', $archives);

				// 清除缓存
				clearCache("car_adviser_detail", 'key');
				clearCache("car_adviser_total", 'key');

				return $alone == 0 ? $langData['car'][7][35] : $langData['car'][7][36];
			}else{
				return array("state" => 200, "info" => $langData['car'][7][37]);
			}

		}

	}

	/**
	 * 汽车发布
	 */
	public function put(){
		global $dsql;
		global $langData;
		global $userLogin;
		global $siteCityInfo;
		//用户信息
		$userinfo = $userLogin->getMemberInfo();
		require(HUONIAOINC."/config/car.inc.php");

		$_promotion = $userinfo['promotion'];
		//判断保障金是否足额
		if($customfabuShopPromotion > 0 && $_promotion < $customfabuShopPromotion){
			return array("state" => 200, "info" => '保障金余额必须大于'.$customfabuShopPromotion.'元才可以发布商品，请缴纳后发布！');
		}

		$param = $this->param;
		// echo "<pre>";
		// var_dump($param);die;
		$brand           =  $param['brand'];
		$carsystem       =  $param['carsystem'] ? $param['carsystem'] : 0;
		$model           =  $param['model'] ? $param['model'] : 0;
		$title           =  filterSensitiveWords(addslashes($param['title']));
		$titlename       =  filterSensitiveWords(addslashes($param['titlename']));
		$addr            =  $param['addr'];
		$cityid          =  getPublicParentInfo(array('tab' => 'site_area', 'id' => $param['addr'], 'action' => 'addr', 'returntype' => 1));
		$litpic          =  $param['litpic'];
		$price           =  $param['price'] ? $param['price'] : 0;
		$totalprice      =  $param['totalprice'] ? $param['totalprice'] : 0;
		$ckprice         =  $param['ckprice'] ? $param['ckprice'] : '';
		$colorname       =  $param['colorname'];
		$location        =  $param['location'];
		$cardtime        =  $param['cardtime'] ? GetMkTime($param['cardtime']) : 0;
		$mileage         =  $param['mileage'] ? $param['mileage'] : 0;
		$nature          =  $param['nature'] ? $param['nature'] : 0;
		$staging         =  $param['staging'] ? $param['staging'] : 0;
		$downpayment     =  $param['downpayment'];
		$seeway          =  $param['seeway'] ? $param['seeway'] : '';
		$transfertimes   =  $param['transfertimes'] ? $param['transfertimes'] : 0;
		$njendtime       =  $param['njendtime'] ? GetMkTime($param['njendtime']) : 0;
		$jqxendtime      =  $param['jqxendtime'] ? GetMkTime($param['jqxendtime']) : 0;
		$businessendtime =  $param['businessendtime'] ? GetMkTime($param['businessendtime']) : 0;
		$note            =  filterSensitiveWords($param['note']);
		$imglist         =  $param['imglist'];
		$person          =  $param['person'];
		$areaCode        =  $param['areaCode'];
		$tel             =  $param['tel'];
		$vercode         =  $param['testcode'];
		$tax             =  $param['tax'] ? $param['tax'] : 0;
		$pubdate         =  GetMkTime(time());

		$uid = $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		if(empty($brand)) return array("state" => 200, "info" => $langData['car'][7][38]);//请选择汽车品牌
		//if(empty($carsystem)) return array("state" => 200, "info" => $langData['car'][7][39]);//请选择品牌车系
		//if(empty($model)) return array("state" => 200, "info" => $langData['car'][7][40]);//请选择品牌型号
		if(empty($title)) return array("state" => 200, "info" => $langData['car'][7][44]);//请填写标题

		if(empty($person)) return array("state" => 200, "info" => $langData['car'][7][41]);//请输入联系人
		if(empty($tel)) return array("state" => 200, "info" => $langData['car'][7][15]);//请输入手机号码

		if(!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel){
			if(empty($vercode)) return array("state" => 200, "info" => $langData['car'][7][33]);//请填写验证码
			//国际版需要验证区域码
			$cphone_ = $tel;
			$archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$international = $results[0]['international'];
				if($international){
					$cphone_ = $areaCode.$tel;
				}
			}

			$ip = GetIP();
			$sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
			$res_code = $dsql->dsqlOper($sql_code, "results");
			if($res_code){
				$code = $res_code[0]['code'];
				$codeID = $res_code[0]['id'];

				if(strtolower($vercode) != $code){
					return array('state' =>200, 'info' => $langData['car'][7][42]);//验证码输入错误，请重试！
				}

				//5分钟有效期
				$now = GetMkTime(time());
				if($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
			}else{
				return array('state' =>200, 'info' => $langData['car'][7][42]);//验证码输入错误，请重试！
			}
		}

		//判断是否顾问
		$usertype = 0;
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_adviser` WHERE `userid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$usertype = 1;
			$uid = $ret[0]['id'];
		}

		//需要支付费用
		$amount = 0;

		//是否独立支付 普通会员或者付费会员超出限制
		$alonepay = 0;

		$alreadyFabu = 0; // 付费会员当天已免费发布数量

		//企业会员或已经升级为收费会员的状态才可以发布
		if($userinfo['userType'] == 1){

			$toMax = false;

			// 等级会员按等级特权处理
			// if($userinfo['level']){

				$memberLevelAuth = getMemberLevelAuth($userinfo['level']);
				$carCount = (int)$memberLevelAuth['car'];

				//统计用户当天已发布数量
				// $today = GetMkTime(date("Y-m-d", time()));
				// $tomorrow = GetMkTime(date("Y-m-d", strtotime("+1 day")));

				//本周
				$today = GetMkTime(date('Y-m-d',(time()-((date('w',time())==0?7:date('w',time()))-1)*24*3600)));
				$tomorrow = $today + 604800;

				$carFabuCount = 0;
				//汽车已发布数量
				$sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__car_list` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$carFabuCount = $ret[0]['total'];
				}

				$alreadyFabu = $carFabuCount;
				if($alreadyFabu >= $carCount){
					$toMax = true;
					// return array("state" => 200, "info" => '当天发布信息数量已达等级上限！');
				}else{
					 $customcarCheck = 1;
				}

			// }

			// 普通会员或者付费会员当天发布数量达上限
			if(($userinfo['level'] == 0 || $toMax)&& $usertype!=1 ){

				global $cfg_fabuAmount;
				global $cfg_fabuFreeCount;
				$fabuAmount = $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array();
				$fabuFreeCount = $cfg_fabuFreeCount ? unserialize($cfg_fabuFreeCount) : array();

                //超出免费次数
                if($fabuAmount && (($fabuFreeCount && $fabuFreeCount['car'] <= $alreadyFabu) || !$fabuFreeCount)){
                    $alonepay = 1;
                    $amount = $fabuAmount["car"];
                    $customcarCheck = 0;   //需要审核
                }

			}

		}

		$waitpay = $amount > 0 ? 1 : 0;

		if($userinfo['level']){
			$auth = array("level" => $userinfo['level'], "levelname" => $userinfo['levelName'], "alreadycount" => $alreadyFabu, "maxcount" => $carCount);
		}else{
			$auth = array("level" => 0, "levelname" => "普通会员", "maxcount" => 0);
		}

		//保存到表
		$archives = $dsql->SetQuery("INSERT INTO `#@__car_list` (`cityid`, `addrid`, `title`,`titlename`,`litpic`, `usertype`, `userid`, `username`, `areaCode`, `contact`, `note`, `state`, `price`, `brand`, `carsystem`, `model`, `pics`, `color`, `location`, `cardtime`, `mileage`, `nature`, `staging`, `downpayment`, `seeway`, `transfertimes`, `njendtime`, `jqxendtime`, `businessendtime`, `totalprice`, `ckprice`, `tax`, `waitpay`, `alonepay`, `pubdate`) VALUES ('$cityid', '$addr', '$title','$titlename','$litpic', '$usertype', '$uid', '$person', '$areaCode', '$tel', '$note', '$customcarCheck', '$price', '$brand', '$carsystem', '$model', '$imglist', '$colorname', '$location', '$cardtime', '$mileage', '$nature', '$staging', '$downpayment', '$seeway', '$transfertimes', '$njendtime', '$jqxendtime', '$businessendtime', '$totalprice', '$ckprice', '$tax', '$waitpay', '$alonepay', '$pubdate')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($aid)){

            $urlParam = array(
                'service' => 'car',
                'template' => 'detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);
    
            //记录用户行为日志
            memberLog($uid, 'car', '', $aid, 'insert', '发布信息('.$aid.'=>'.$title.')', $url, $archives);

			if($customcarCheck && !$toMax){
				updateCache("car_list", 300);
				clearCache("car_list_total", 'key');
                $countIntegral = countIntegral($uid);    //统计积分上限
                global $cfg_returnInteraction_car;    //汽车积分
                global $cfg_returnInteraction_commentDay;
                if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_car > 0) {
                    $infoname = getModuleTitle(array('name'=>'car'));
                    //汽车发布得积分
                    $date = GetMkTime(time());
                    global  $userLogin;
                    //增加积分
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_car' WHERE `id` = '$uid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($uid, 1);
                    $userpoint = $user['point'];
//                    $pointuser = (int)($userpoint+$cfg_returnInteraction_car);
                    //保存操作日志
                    $info = '发布'.$infoname;
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$uid', '1', '$cfg_returnInteraction_car', '$info','$date','zengsong','1','$userpoint')");
                    $dsql->dsqlOper($archives, "update");
                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "point"
                    );

                    //自定义配置
                    $config = array(
                        "username" => $userinfo['username'],
                        "amount" => $cfg_returnInteraction_car,
                        "point" => $userinfo['point'],
                        "date" => date("Y-m-d H:i:s", $date),
                        "info" => $info,
                        "fields" => array(
                            'keyword1' => '变动类型',
                            'keyword2' => '变动积分',
                            'keyword3' => '变动时间',
                            'keyword4' => '积分余额'
                        )
                    );
                }

                updateMemberNotice($uid, "会员-积分变动通知", $param, $config);

            }
			//微信通知
	        $cityName = $siteCityInfo['name'];
	       	$cityid  = $siteCityInfo['cityid'];
		    $param = array(
		        'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
		        'cityid' => $cityid,
		        'notify' => '管理员消息通知',
		        'fields' =>array(
			        'contentrn'  => $cityName.'分站——car模块——用户:'.$userinfo['username'].'发布了车辆：'.$title,
			        'date' => date("Y-m-d H:i:s", time()),
			        )
		        );

			updateAdminNotice("car", "car",$param);

			if(isset($codeID)){
				$sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
				$dsql->dsqlOper($sql, "update");
			}
			dataAsync("car",$aid,"list");  // 汽车门户-车源-发布
			return array("auth" => $auth, "aid" => $aid, "amount" => $amount);
		}else{
			return array("state" => 101, "info" => $langData['car'][7][43]);//发布到数据时发生错误，请检查字段内容！
		}

	}

	/**
	 * 修改汽车发布
	 */
	public function edit(){
		global $dsql;
		global $userLogin;
		global $langData;
		global $siteCityInfo;
		require(HUONIAOINC."/config/car.inc.php");
		$customcarCheck = (int)$customcarCheck;

		$param   = $this->param;
		$id      = $param['id'];

		if(empty($id)) return array("state" => 200, "info" => $langData['car'][7][45]);//数据传递失败！

		$userinfo = $userLogin->getMemberInfo();

		$uid = $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
		}

		//$usertype = $userinfo['userType'] == 1 ? 0 : 1;
		$usertype = 0;
		//判断是否顾问
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_adviser` WHERE `userid` = $uid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$uid = $ret[0]['id'];
			$usertype = 1;
		}

		$brand           =  $param['brand'];
		$carsystem       =  $param['carsystem'] ? $param['carsystem'] : 0;
		$model           =  $param['model'] ? $param['model'] : 0;
		$title           =  filterSensitiveWords(addslashes($param['title']));
		$titlename       =  filterSensitiveWords(addslashes($param['titlename']));
		$addr            =  $param['addr'];
		$cityid          =  getPublicParentInfo(array('tab' => 'site_area', 'id' => $param['addr'], 'action' => 'addr', 'returntype' => 1));
		$litpic          =  $param['litpic'];
		$price           =  $param['price'] ? $param['price'] : 0;
		$totalprice      =  $param['totalprice'] ? $param['totalprice'] : 0;
		$ckprice         =  $param['ckprice'] ? $param['ckprice'] : '';
		$colorname       =  $param['colorname'];
		$location        =  $param['location'];
		$cardtime        =  $param['cardtime'] ? GetMkTime($param['cardtime']) : 0;
		$mileage         =  $param['mileage'] ? $param['mileage'] : 0;
		$nature          =  $param['nature'] ? $param['nature'] : 0;
		$staging         =  $param['staging'] ? $param['staging'] : 0;
		$downpayment     =  $param['downpayment'];
		$seeway          =  $param['seeway'] ? $param['seeway'] : '';
		$transfertimes   =  $param['transfertimes'] ? $param['transfertimes'] : 0;
		$njendtime       =  $param['njendtime'] ? GetMkTime($param['njendtime']) : 0;
		$jqxendtime      =  $param['jqxendtime'] ? GetMkTime($param['jqxendtime']) : 0;
		$businessendtime =  $param['businessendtime'] ? GetMkTime($param['businessendtime']) : 0;
		$note            =  filterSensitiveWords($param['note']);
		$imglist         =  $param['imglist'];
		$person          =  $param['person'];
		$areaCode        =  $param['areaCode'];
		$tel             =  $param['tel'];
		$vercode         =  $param['testcode'];
		$tax             =  $param['tax'] ? $param['tax'] : 0;
		$pubdate         =  GetMkTime(time());


		$archives = $dsql->SetQuery("SELECT `id`,`contact` FROM `#@__car_list` WHERE `id` = ".$id." AND `userid` = ".$uid);
		$results  = $dsql->dsqlOper($archives, "results");
		if(!$results){
			return array("state" => 200, "info" => $langData['car'][7][46]);//权限不足，修改失败！
		}
		$detail = $results[0];

		if(empty($brand)) return array("state" => 200, "info" => $langData['car'][7][38]);//请选择汽车品牌
		//if(empty($carsystem)) return array("state" => 200, "info" => $langData['car'][7][39]);//请选择品牌车系
		//if(empty($model)) return array("state" => 200, "info" => $langData['car'][7][40]);//请选择品牌型号
		if(empty($title)) return array("state" => 200, "info" => $langData['car'][7][44]);//请填写标题

		if(empty($person)) return array("state" => 200, "info" => $langData['car'][7][41]);//请输入联系人
		if(empty($tel)) return array("state" => 200, "info" => $langData['car'][7][15]);//请输入手机号码

		if($detail['contact'] != $tel && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel) ){
			if(empty($vercode)) return array("state" => 200, "info" => $langData['car'][7][33]);//请输入验证码
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
					return array('state' =>200, 'info' => $langData['car'][7][42]);//验证码输入错误，请重试！
				}

				//5分钟有效期
				$now = GetMkTime(time());
				if($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
			}else{
				return array('state' =>200, 'info' => $langData['car'][7][42]);//验证码输入错误，请重试！
			}
		}

		$field = '';

		if(!empty($litpic)){
			$filed .= ", `litpic` = '$litpic'";
		}

		$nature = $nature ? $nature : 0;

		$archives = $dsql->SetQuery("UPDATE `#@__car_list` SET `tax` = '$tax', `pics` = '$imglist', `note` = '$note', `businessendtime` = '$businessendtime', `jqxendtime` = '$jqxendtime', `njendtime` = '$njendtime', `transfertimes` = '$transfertimes', `seeway` = '$seeway', `downpayment` = '$downpayment', `staging` = '$staging', `mileage` = '$mileage', `cardtime` = '$cardtime',  `location` = '$location', `color` = '$colorname', `ckprice` = '$ckprice', `carsystem` = '$carsystem', `brand` = '$brand', `title` = '$title',`titlename` = '$titlename',`price` = '$price', `totalprice` = '$totalprice', `model` = '$model', `nature` = '$nature', `addrid` = '$addr', `cityid` = '$cityid', `usertype` = '$usertype', `userid` = '$uid', `username` = '$person', `areaCode` = '$areaCode', `contact` = '$tel' ".$filed." WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");
		if($results == "ok"){

            $urlParam = array(
                'service' => 'car',
                'template' => 'detail',
                'id' => $id
            );
            $url = getUrlPath($urlParam);
    
            //记录用户行为日志
            memberLog($uid, 'car', '', $id, 'update', '更新信息('.$id.'=>'.$title.')', $url, $archives);

			// 清除缓存
			checkCache("car_list", $id);
			clearCache("car_detail", $id);
			clearCache("car_list_total", 'key');

			$cityName = $siteCityInfo['name'];
	       	$cityid  = $siteCityInfo['cityid'];
		    $param = array(
		        'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
		        'cityid' => $cityid,
		        'notify' => '管理员消息通知',
		        'fields' =>array(
			        'contentrn'  => $cityName.'分站——car模块——用户:'.$userinfo['username'].'更新了('.$title.')车辆信息',
			        'date' => date("Y-m-d H:i:s", time()),
			        )
		        );

			updateAdminNotice("car", "car",$param);
			if(isset($codeID)){
				$sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
				$dsql->dsqlOper($sql, "update");
			}
			dataAsync("car",$id,"list");  // 汽车门户-车源-更新
			return $langData['car'][7][47];//修改成功！
		}else{
			return array("state" => 101, "info" => $langData['car'][7][48]);//保存到数据时发生错误，请检查字段内容！
		}

	}

	/**
     * 资讯分类
     * @return array
     */
	public function newsType(){
		global $dsql;
		global $langData;
		$type = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
			}else{
				$type     = (int)$this->param['type'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
				$son      = $this->param['son'] == 0 ? false : true;
			}
		}
		$results = $dsql->getTypeList($type, "car_newstype", $son, $page, $pageSize);
		if($results){
			return $results;
		}
	}

	/**
     * 汽车资讯
     * @return array
     */
	public function news(){
		global $dsql;
		global $langData;
		$pageinfo = $list = array();
		$typeid = $litpic = $orderby = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
			}else{
				$typeid   = $this->param['typeid'];
                $title    = $this->param['title'];
                $noid     = $this->param['noid'];
				$litpic   = $this->param['litpic'];
				$orderby  = $this->param['orderby'];
				$u        = $this->param['u'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		//数据共享
		require(HUONIAOINC."/config/car.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
			$cityid = getCityId($this->param['cityid']);
			if($cityid){
				$where .= " AND `cityid` = ".$cityid;
			}
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		//遍历分类
		if(!empty($typeid)){
			if($dsql->getTypeList($typeid, "car_newstype")){
				$lower = arr_foreach($dsql->getTypeList($typeid, "car_newstype"));
				$lower = $typeid.",".join(',',$lower);
			}else{
				$lower = $typeid;
			}
			$where .= " AND `typeid` in ($lower)";
		}

		if(!empty($noid)){
			if(is_array($noid)){
				$noid = join(",", $noid);
			}else{
	            $noid = rtrim($noid, ",");
			}
            if($noid){
			    $where .= " AND `id` not in($noid)";
			}
        }

        if(!empty($title)){
            $where .=" and `title` like '%$title%'";
        }

		if($litpic == 1){
			$where .= " AND `litpic` <> ''";
		}

		$o = " ORDER BY `weight` DESC, `id` DESC";
		if($orderby == "click"){
			$o = " ORDER BY `click` DESC, `weight` DESC, `id` DESC";
		}

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `click`, `litpic`, `source`, `writer`, `body`, `description`, `pubdate` FROM `#@__car_news` WHERE `arcrank` = 0".$where.$o);
		//总条数
		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__car_news` WHERE 1 = 1".$where);
		$totalCount = getCache("car_news_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
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

		// $results = $dsql->dsqlOper($archives.$where, "results");
		$sql = $dsql->SetQuery($archives.$where);
		$results = getCache("car_news_list", $sql, 300, array("disabled" => $u));
		$list = array();
		foreach($results as $key => $val){
			$list[$key]['id']      = $val['id'];
			$list[$key]['title']   = $val['title'];
			$list[$key]['typeid']  = $val['typeid'];
			$list[$key]['source']  = $val['source'];
			$list[$key]['click']   = $val['click'];
			$list[$key]['writer']  = $val['writer'];
			$list[$key]['description'] = $val['description'];

			$list[$key]['pubdate'] = $val['pubdate'];

			$list[$key]['floortime'] = FloorTime(GetMkTime(time()) - $val['pubdate'], 2);

			$imgGroup = array();
			global $cfg_attachment;
			global $cfg_basehost;

			$attachment = str_replace("http://".$cfg_basehost, "", $cfg_attachment);
			$attachment = str_replace("https://".$cfg_basehost, "", $attachment);

			$attachment = str_replace("/", "\/", $attachment);
			$attachment = str_replace(".", "\.", $attachment);
			$attachment = str_replace("?", "\?", $attachment);
			$attachment = str_replace("=", "\=", $attachment);

			$content = $val['body'];
			preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $content, $picList);
			$picList = array_unique($picList[1]);

			if(empty($picList)){
				preg_match_all("/\/tieba\/(.*)[\"|'| ]/isU", $content, $picList);
				$picList = array_unique($picList[1]);

				$newPicList = array();
				if($picList){
					foreach ($picList as $k => $v) {
						array_push($newPicList, '/tieba/' . $v);
					}
				}
				$picList = $newPicList;
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
					if(in_array($fileType, $ftype)){
						$imgGroup[] = $filePath;
					}
				}
			}

			if(!empty($val['litpic'])){
				$list[$key]['litpic']  = getFilePath($val['litpic']);
			}elseif(!empty($imgGroup)){
				$list[$key]['litpic']  = getFilePath($imgGroup[0]);
			}
			$list[$key]['imgGroup'] = $imgGroup;
			$list[$key]['imgGroupNum'] = !empty($imgGroup) ? count($imgGroup) : 0;

			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__car_newstype` WHERE `id` = ".$val['typeid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
 				$list[$key]['typename'] = $ret[0]['typename'];
			}else{
				$list[$key]['typename'] = "";
			}



			$param = array(
				"service"     => "car",
				"template"    => "news-detail",
				"id"          => $val['id']
			);
			$list[$key]['url']     = getUrlPath($param);
		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
     * 汽车资讯信息详细
     * @return array
     */
	public function newsDetail(){
		global $dsql;
		global $langData;
		$newsDetail = array();

		$id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];
		if(!is_numeric($id)) return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误

		$archives = $dsql->SetQuery("SELECT * FROM `#@__car_news` WHERE `arcrank` = 0 AND `id` = ".$id);
		// $results  = $dsql->dsqlOper($archives, "results");
		$results  = getCache("car_news_detail", $archives, 0, $id);
		if($results){
			$newsDetail["id"]          = $results[0]['id'];
			$newsDetail["title"]       = $results[0]['title'];
			$newsDetail["typeid"]      = $results[0]['typeid'];
			$newsDetail["cityid"]      = $results[0]['cityid'];

			$typename = "";
			if(!empty($results[0]['typeid'])){
				global $data;
				$data = "";
				$typeArr = getParentArr("car_newstype", $results[0]['typeid']);
				$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
				$typename = join("", $typeArr);
			}
			$newsDetail["typename"]   = $typename;

			$newsDetail["litpic"]      = getFilePath($results[0]['litpic']);
			$newsDetail["click"]       = $results[0]['click'];
			$newsDetail["source"]      = $results[0]['source'];
			$newsDetail["writer"]      = $results[0]['writer'];
			$newsDetail["keyword"]     = $results[0]['keyword'];
			$newsDetail["description"] = $results[0]['description'];
			$newsDetail["body"]        = $results[0]['body'];
			$newsDetail["pubdate"]     = $results[0]['pubdate'];
			$newsDetail["pubdate1"]    = date("m月d日 H:i", $results[0]['pubdate']);

		}
		return $newsDetail;
	}

	/**
	 * 委托卖车
	 */
	public function putEnturst(){
		global $dsql;
		global $userLogin;
		global $langData;

		$uid = $userLogin->getMemberID();

		$param = $this->param;

		$brand      = (int)$param['brand'];
		$areaCode     	 =  $param['areaCode'];
		$phone      = $param['phone'];

		//手机号码增加区号，国内版不显示
		$phone = ($areaCode == '86' ? '' : $areaCode) . $phone;

		if(empty($brand)) return array("state" => 200, "info" => $langData['car'][7][20]);//参数错误
		if(empty($phone)) return array("state" => 200, "info" => $langData['car'][7][15]);//请输入手机号

		$pubdate = GetMktime(time());
		$sql = $dsql->SetQuery("INSERT INTO `#@__car_enturst` (`brand`, `userid`, `contact`, `pubdate`) VALUES ('$brand', '$uid', '$phone', '$pubdate')");
		$res = $dsql->dsqlOper($sql, "lastid");
		if(is_numeric($res)){
			return $langData['car'][7][49];//提交成功，我们会尽快联系您
		}else{
			return array("state" => 200, "info" => $langData['car'][7][37]);//提交失败，请稍候重试！
		}
	}

	/**
	 * 门店预约
	 */
	public function storeAppoint(){
		global $dsql;
		global $langData;
		global $userLogin;

		$uid = $userLogin->getMemberID();

		$param    = $this->param;
		$storeid  = (int)$param['storeid'];
		$tel      = (int)$param['tel'];

		if(empty($storeid)) return array("state" => 200, "info" => $langData['car'][7][20]);//参数错误
		if(empty($tel)) return array("state" => 200, "info" => $langData['car'][7][15]);//请输入手机号

		$pubdate = GetMktime(time());

		$sql = $dsql->SetQuery("SELECT `id`, `title`, `address`, `tel` FROM `#@__car_store` WHERE `id` = '$storeid'");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$business = $ret[0]['title'];
			$address  = $ret[0]['address'];
			$_tel      = $ret[0]['tel'];

			$sql = $dsql->SetQuery("INSERT INTO `#@__car_appoint` (`storeid`, `userid`, `tel`,  `state`, `pubdate`) VALUES ('$storeid', '$uid', '$tel', 0, '$pubdate')");
			$res = $dsql->dsqlOper($sql, "lastid");
			if(is_numeric($res)){
				//消息通知
				$param = array(
					"service"  => "car",
					"template" => "store-detail",
					"id"       => $id
				);
				$url = getUrlPath($param);

				//查询帐户信息
				if($uid != -1){
					$sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = ".$uid);
					$ret = $dsql->dsqlOper($sql, "results");
					$username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
				}else{
					$username = '先生/女士';
				}

				if($uid != -1){
					updateMemberNotice($uid, "商家-发送商家联系方式", $param, array("username" => $username, "business" => $business, "address" => $address, "tel" => $_tel, "url" => $url), $tel);
				}else{
					sendsms($tel, 1, "", "", false, false, "商家-发送商家联系方式", array("username" => $username, "business" => $business, "address" => $address, "tel" => $_tel, "url" => $url));
				}
				return $langData['car'][7][49];//提交成功，我们会尽快联系您
			}else{
				return array("state" => 200, "info" => $langData['car'][7][37]);//提交失败，请稍候重试！
			}
		}else{
			return array("state" => 200, "info" => $langData['car'][7][50]);//无该门店信息！
		}
	}

	public function putEnturstcout(){
		global $dsql;
		global $langData;
		global $userLogin;
		$sql = $dsql->SetQuery("SELECT count(`id`) as count_num FROM `#@__car_enturst`");
		$ret = $dsql->dsqlOper($sql, "results");
		return  array('list' =>$ret );
	}

	/**
	 * 增加顾问拨打电话流量
	 */
	public function updateAdviserClick(){
		global $dsql;
		global $langData;
		global $userLogin;

		$uid = $userLogin->getMemberID();

		$param    = $this->param;
		$id       = (int)$param['id'];

		if(empty($id)) return array("state" => 200, "info" => $langData['car'][7][20]);//参数错误

		$pubdate = GetMktime(time());

		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_adviser` WHERE `id` = '$id'");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$sql = $dsql->SetQuery("UPDATE `#@__car_adviser` SET `click` = `click` + 1 WHERE `id` = ".$id);
			$res = $dsql->dsqlOper($sql, "results");
			if($res){
				return 'ok';
			}else{
				return array("state" => 200, "info" => $langData['car'][7][37]);//提交失败，请稍候重试！
			}
		}else{
			return array("state" => 200, "info" => $langData['car'][7][51]);//无该顾问信息！
		}
	}

	/**
	 * 门店预约列表
	 */
	public function storeAppointList(){
		global $dsql;
		global $userLogin;
		global $langData;
		$pageinfo = $list = array();
		$store = $keywords = $orderby = $page = $pageSize = $where = $where1 = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误
			}else{
				$store    = $this->param['store'];
				$keywords = $this->param['keywords'];
				$orderby  = $this->param['orderby'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];

				$title = $title ? $title : $keywords;
			}
		}

		if($store){
			$where .= " AND `storeid` ='$store'";
		}

		$order = " ORDER BY pubdate DESC, `id` DESC";


		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `storeid`, `userid`, `tel`, `state`, `pubdate` FROM `#@__car_appoint` WHERE 1=1 ".$where);
		$archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__car_appoint` WHERE 1 = 1 ".$where);

		//总条数
		$totalResults = $dsql->dsqlOper($archives_count, "results", "NUM");
		$totalCount = (int)$totalResults[0][0];

		//未联系
		$totalResults = $dsql->dsqlOper($archives_count . " AND `state` = 0", "results", "NUM");
		$state0 = (int)$totalResults[0][0];

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);   //暂无数据！

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"state0" => $state0,
			"totalCount" => $totalCount
		);

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");

		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']     = $val['id'];
				$list[$key]['storeid']= $val['storeid'];
				$list[$key]['tel']    = $val['tel'];
				$list[$key]['state']  = $val['state'];
				$list[$key]['pubdate']= $val['pubdate'];
				$list[$key]['pubdate1']= date('m/d H:i', $val['pubdate']);

				//会员信息
				$nickname = $userPhoto = $userPhone = "";
                if($val['userid'] > 0){
					$archives = $dsql->SetQuery("SELECT `nickname`, `photo`, `phone` FROM `#@__member` WHERE `id` = ".$val['userid']);
					$member = $dsql->dsqlOper($archives, "results");
					if($member){
						$nickname  = $member[0]['nickname'];
						$userPhoto = getFilePath($member[0]['photo']);
						$userPhone = $member[0]['phone'];
					}else{
						$nickname  = "先生/女士";
						$userPhoto = "";
						$userPhone = "";
					}
                }
				$list[$key]['userid']    = $val['userid'];
				$list[$key]['nickname']  = $nickname;
				$list[$key]['userPhoto'] = $userPhoto;
			}
		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
	 * 预约拨打电话改变状态
	 */
	public function updateAppoint(){
		global $dsql;
		global $langData;
		global $userLogin;

		$uid = $userLogin->getMemberID();

		$param    = $this->param;
		$id       = (int)$param['id'];

		if(empty($id)) return array("state" => 200, "info" => $langData['car'][7][20]);   //参数错误！

		$pubdate = GetMktime(time());

		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_appoint` WHERE `id` = '$id'");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$sql = $dsql->SetQuery("UPDATE `#@__car_appoint` SET `state` = 1 WHERE `id` = ".$id);
			$res = $dsql->dsqlOper($sql, "results");
			if($res){
				return 'ok';
			}else{
				return array("state" => 200, "info" => $langData['car'][7][37]);//提交失败，请稍候重试！
			}
		}else{
			return array("state" => 200, "info" => $langData['car'][7][51]);//无该顾问信息！
		}
	}

	/**
	 * 排放标准
	 */
	public function standard_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '国II', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '国III', 'lower' => array());
		$typeList[] = array('id' => 3, 'typename' => '国IV', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '国V', 'lower' => array());
		$typeList[] = array('id' => 5, 'typename' => '欧II', 'lower' => array());
		$typeList[] = array('id' => 6, 'typename' => '欧III', 'lower' => array());
		$typeList[] = array('id' => 7, 'typename' => '欧IV', 'lower' => array());
		$typeList[] = array('id' => 8, 'typename' => '欧V', 'lower' => array());
		$typeList[] = array('id' => 8, 'typename' => '欧VI', 'lower' => array());
        return $typeList;
	}

	/**
	 * 变速箱
	 */
	public function gearbox_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '手动', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '自动', 'lower' => array());
		//$typeList[] = array('id' => 3, 'typename' => '手自一体', 'lower' => array());
		//$typeList[] = array('id' => 4, 'typename' => '无极', 'lower' => array());
		//$typeList[] = array('id' => 5, 'typename' => '双离合', 'lower' => array());
        return $typeList;
	}

	/**
	 * 进气形式
	 */
	public function intakeform_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '涡轮增压', 'lower' => array());
        $typeList[] = array('id' => 2, 'typename' => '机械增压', 'lower' => array());
        return $typeList;
	}

	/**
	 * 燃料类型
	 */
	public function fueltype_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '汽油', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '柴油', 'lower' => array());
		$typeList[] = array('id' => 3, 'typename' => '混合油', 'lower' => array());
		//$typeList[] = array('id' => 4, 'typename' => '液化石油气', 'lower' => array());
		$typeList[] = array('id' => 5, 'typename' => '天然气', 'lower' => array());
		//$typeList[] = array('id' => 6, 'typename' => '甲醇', 'lower' => array());
		//$typeList[] = array('id' => 7, 'typename' => '乙醇', 'lower' => array());
		$typeList[] = array('id' => 8, 'typename' => '太阳能', 'lower' => array());
		$typeList[] = array('id' => 9, 'typename' => '电', 'lower' => array());
		//$typeList[] = array('id' => 10, 'typename' => '生物燃料', 'lower' => array());
		//$typeList[] = array('id' => 11, 'typename' => '氢', 'lower' => array());
        return $typeList;
	}

	/**
	 * 燃油标号
	 */
	public function fuelgrade_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '92号', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '95号', 'lower' => array());
		$typeList[] = array('id' => 3, 'typename' => '97号', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '93号', 'lower' => array());
        return $typeList;
	}

	/**
	 * 供油方式
	 */
	public function fuelsupplymode_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '化油器', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '单点电喷', 'lower' => array());
		$typeList[] = array('id' => 3, 'typename' => '多点电喷', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '直喷', 'lower' => array());
        return $typeList;
	}

	/**
	 * 驱动方式
	 */
	public function drivingmode_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '前置后驱', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '前置前驱', 'lower' => array());
		$typeList[] = array('id' => 3, 'typename' => '后置后驱', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '中置后驱', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '四轮驱动', 'lower' => array());
        return $typeList;
	}

	/**
	 * 助力类型
	 */
	public function assistancetype_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '电动助力', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '电子液压助力', 'lower' => array());
		$typeList[] = array('id' => 3, 'typename' => '机械辅助', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '机械辅助助力', 'lower' => array());
        return $typeList;
	}

	/**
	 * 前悬挂类型
	 */
	public function frontsuspensiontype_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '麦弗逊悬架', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '双叉臂独立悬架', 'lower' => array());
		$typeList[] = array('id' => 3, 'typename' => '多连杆式独立悬架', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '双球节弹簧减震支柱悬架', 'lower' => array());
        return $typeList;
	}

	/**
	 * 后悬挂类型
	 */
	public function rearsuspensiontype_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '非独立悬挂系统', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '独立悬挂系统', 'lower' => array());
		$typeList[] = array('id' => 3, 'typename' => '横臂式悬挂系统', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '多连杆式悬挂系统', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '纵臂式悬挂系统', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '烛式悬挂系统', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '麦弗逊式悬挂系统', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '主动悬挂系统', 'lower' => array());
        return $typeList;
	}

	/**
	 * 前制动器类型
	 */
	public function frontbraketype_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '盘式', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '鼓式', 'lower' => array());
		$typeList[] = array('id' => 3, 'typename' => '通风盘', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '陶瓷通风盘式', 'lower' => array());
        return $typeList;
	}

	/**
	 * 后制动类型
	 */
	public function rearbraketype_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '盘式制动器', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '鼓式制动器', 'lower' => array());
        return $typeList;
	}

	/**
	 * 驻车制动类型
	 */
	public function parkingbraketype_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '机械脚刹', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '机械手刹', 'lower' => array());
		$typeList[] = array('id' => 3, 'typename' => '电子手刹', 'lower' => array());
        return $typeList;
	}

	/**
	 * 安全配置
	 */
	public function securitysetting_type(){
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '主驾驶安全气囊', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '副驾驶安全气囊', 'lower' => array());
		$typeList[] = array('id' => 3, 'typename' => '前排侧气囊', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '后排侧气囊', 'lower' => array());
		$typeList[] = array('id' => 5, 'typename' => '前排头部气囊', 'lower' => array());
		$typeList[] = array('id' => 6, 'typename' => '后排头部气囊', 'lower' => array());
		$typeList[] = array('id' => 7, 'typename' => '胎压检测', 'lower' => array());
		$typeList[] = array('id' => 8, 'typename' => '车内中控锁', 'lower' => array());
		$typeList[] = array('id' => 9, 'typename' => '儿童座椅接口', 'lower' => array());
		$typeList[] = array('id' => 10, 'typename' => '无钥匙启动', 'lower' => array());
		$typeList[] = array('id' => 11, 'typename' => '防抱死系统(ABS)', 'lower' => array());
		$typeList[] = array('id' => 12, 'typename' => '车身稳定控制(ESP)', 'lower' => array());
        return $typeList;
	}

	/**
	 * 外部配置
	 */
	public function externalsetting_type(){
		//电动天窗  全景天窗  电动吸合门  感应后备箱  感应雨刷  后雨刷  前电动车窗  后电动车窗  后视镜电动调节  后视镜加热
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '电动天窗', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '全景天窗', 'lower' => array());
		$typeList[] = array('id' => 3, 'typename' => '电动吸合门', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '感应后备箱', 'lower' => array());
		$typeList[] = array('id' => 5, 'typename' => '感应雨刷', 'lower' => array());
		$typeList[] = array('id' => 6, 'typename' => '后雨刷', 'lower' => array());
		$typeList[] = array('id' => 7, 'typename' => '前电动车窗', 'lower' => array());
		$typeList[] = array('id' => 8, 'typename' => '后电动车窗', 'lower' => array());
		$typeList[] = array('id' => 9, 'typename' => '后视镜电动调节', 'lower' => array());
		$typeList[] = array('id' => 10, 'typename' => '后视镜加热', 'lower' => array());
        return $typeList;
	}

	/**
	 * 内部配置
	 */
	public function internalsetting_type(){
		//多功能方向盘  定速巡航  空调  自动空调  GPS导航  倒车雷达  倒车影像系统  真皮座椅  前排座椅加热  后排座椅加热
		$typeList = array();
        $typeList[] = array('id' => 1, 'typename' => '多功能方向盘', 'lower' => array());
		$typeList[] = array('id' => 2, 'typename' => '定速巡航', 'lower' => array());
		$typeList[] = array('id' => 3, 'typename' => '空调', 'lower' => array());
		$typeList[] = array('id' => 4, 'typename' => '自动空调', 'lower' => array());
		$typeList[] = array('id' => 5, 'typename' => 'GPS导航', 'lower' => array());
		$typeList[] = array('id' => 6, 'typename' => '倒车雷达', 'lower' => array());
		$typeList[] = array('id' => 7, 'typename' => '倒车影像系统', 'lower' => array());
		$typeList[] = array('id' => 8, 'typename' => '真皮座椅', 'lower' => array());
		$typeList[] = array('id' => 9, 'typename' => '前排座椅加热', 'lower' => array());
		$typeList[] = array('id' => 10, 'typename' => '后排座椅加热', 'lower' => array());
        return $typeList;
	}

	public function gettypename($fun, $id){
        $list = $this->$fun();
        return $list[array_search($id, array_column($list, "id"))]['typename'];
    }

    /**
     * 汽车报废
     * @return array
     */
    public function scrap()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => $langData['siteConfig'][33][0]); //'格式错误！'
            } else {
                $title = $this->param['title'];
                $name = $this->param['name'];
                $phone = $this->param['phone'];
                $pics = $this->param['pics'];
            }
        }

        $title = htmlspecialchars(RemoveXSS(filterSensitiveWords(cn_substrR(addslashes($title), 200))));
        $name = htmlspecialchars(RemoveXSS(filterSensitiveWords(cn_substrR(addslashes($name), 50))));
        $phone = htmlspecialchars(RemoveXSS(filterSensitiveWords(cn_substrR(addslashes($phone), 50))));

        //获取用户ID
        $uid = $userLogin->getMemberID();
        $ip = GetIP();
        $time  = GetMkTime(time());

        //限制，一个IP每分钟最多提交一次
        $sql = $dsql->SetQuery("SELECT `pubdate` FROM `#@__car_scrap` WHERE `ip` = '$ip' ORDER BY `id` DESC LIMIT 0, 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            if (round(($time - $ret[0]['pubdate']) / 60) < 1) {
                return array("state" => 200, "info" => "提交的太快了，请1分钟后重试！");
            }
        }

        //新增记录
        $sql = $dsql->SetQuery("INSERT INTO `#@__car_scrap` (`uid`, `name`, `phone`, `title`, `pics`, `ip`, `pubdate`) VALUES ('$uid', '$name', '$phone', '$title', '$pics', '$ip', '$time')");
        $aid = $dsql->dsqlOper($sql, "lastid");
        if(is_numeric($aid)){
            return "提交成功";
        }else{
            return array("state" => 200, "info" => "系统错误，提交失败！");
        }

    }

}
