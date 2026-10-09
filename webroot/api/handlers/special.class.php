<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 专题模块API接口
 *
 * @version        $Id: special.class.php 2014-7-2 上午09:10:21 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class special {
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
     * 专题基本参数
     * @return array
     */
	public function config(){

		require(HUONIAOINC."/config/special.inc.php");

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
		// global $hotline_config;           //咨询热线配置
		// global $customHotline;            //咨询热线
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

		// $domainInfo = getDomain('special', 'config');
		// $customChannelDomain = $domainInfo['domain'];
		// if($customSubDomain == 0){
		// 	$customChannelDomain = "http://".$customChannelDomain;
		// }elseif($customSubDomain == 1){
		// 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
		// }elseif($customSubDomain == 2){
		// 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
		// }

		// include HUONIAOINC.'/siteModuleDomain.inc.php';
		$customChannelDomain = getDomainFullUrl('special', $customSubDomain);

        //分站自定义配置
        $ser = 'special';
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
			$return['softSize']      = $custom_softSize;
			$return['softType']      = $custom_softType;
			$return['thumbSize']     = $custom_thumbSize;
			$return['thumbType']     = $custom_thumbType;
		}

		return $return;

	}


	/**
     * 模板分类
     * @return array
     */
	public function tempType(){
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
		$results = $dsql->getTypeList($type, "special_temptype", $son, $page, $pageSize);
		if($results){
			return $results;
		}
	}


	/**
     * 模板列表
     * @return array
     */
	public function tempList(){
		global $dsql;
		$pageinfo = $list = array();
		$type = $title = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$type        = $this->param['type'];
				$title       = $this->param['title'];
				$page        = $this->param['page'];
				$pageSize    = $this->param['pageSize'];
			}
		}

		$where = " WHERE 1 = 1";
		if(!empty($type)){
			$where .= " AND `type` = ".$type;
		}

		if(!empty($title)){
			$where .= " AND `title` like '%".$title."%'";
		}

		$orderby = " ORDER BY `weight` DESC, `id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic` FROM `#@__special_temp`".$where.$orderby);

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
			foreach($results as $key => $val){
				$results[$key]["litpic"] = getFilePath($val["litpic"]);
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $results);
	}


	/**
     * 专题分类
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
		$results = $dsql->getTypeList($type, "special_type", $son, $page, $pageSize);
		if($results){
			return $results;
		}
	}


	/**
     * 专题列表
     * @return array
     */
	public function slist(){
		global $dsql;
		$pageinfo = $list = array();
		$typeid = $title = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$typeid      = $this->param['typeid'];
				$title       = $this->param['title'];
				$page        = $this->param['page'];
				$pageSize    = $this->param['pageSize'];
			}
		}

		$where = " WHERE `state` = 1";

		$cityid = getCityId($this->param['cityid']);
		if($cityid){
			$where .= " AND `cityid` = ".$cityid;
		}

		//遍历分类
		if(!empty($typeid)){
			if($dsql->getTypeList($typeid, "special_type")){
				global $arr_data;
				$arr_data = '';
				$lower = arr_foreach($dsql->getTypeList($typeid, "special_type"));
				$lower = $typeid.",".join(',',$lower);
			}else{
				$lower = $typeid;
			}
			$where .= " AND `typeid` in ($lower)";
		}

		if(!empty($title)){
			$where .= " AND `title` like '%".$title."%'";
		}

		$orderby = " ORDER BY `weight` DESC, `id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `domaintype`, `litpic`, `note`, `pubdate` FROM `#@__special`".$where.$orderby);

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
		if($results){
			$RenrenCrypt = new RenrenCrypt();
			foreach($results as $key => $val){
				$list[$key]["id"]     = $val['id'];
				$list[$key]["title"]  = $val['title'];
				$list[$key]["note"]   = $val['note'];
				$list[$key]["pubdate"] = $val['pubdate'];
				$list[$key]["litpic"] = getFilePath($val["litpic"]);

				$this->param = "";
				$channelDomain = $this->config();
				$domainInfo = getDomain('special', 'special', $val['id']);

				/**
				 * 默认 || 模块配置为子目录并且信息配置为绑定子域名则访问方式转为默认
				 * （因为子域名是随模块配置变化，如果模块配置为子目录地址为乱掉。）
				 * 如：模块配置：http://menhu168.com/special
				 * 如果信息绑定子域名则会变成：http://demo.menhu168.com/special
				 * 这样会导致系统读取信息错误
				 */
				if($val["domaintype"] == 0 || ($channelDomain['subDomain'] == 2 && $val["domaintype"] == 2)){

					$projectid = base64_encode($RenrenCrypt->php_encrypt($val["id"]));
					$list[$key]["domain"] = $channelDomain['channelDomain']."/detail-".$val['id'].".html";

				//绑定主域名
				}elseif($val["domaintype"] == 1){

					$list[$key]["domain"] = $domainInfo['domain'];
					$list[$key]["domainexp"] = date("Y-m-d H:i:s", $domainInfo['expires']);
					$list[$key]["domaintip"] = $domainInfo['note'];

				//绑定子域名
				}elseif($val["domaintype"] == 2){

					$list[$key]["domain"] = str_replace("http://", "http://".$domainInfo['domain'].".", $channelDomain['channelDomain']);
					$list[$key]["domain"] = str_replace("https://", "https://".$domainInfo['domain'].".", $channelDomain['channelDomain']);
					$list[$key]["domainexp"] = date("Y-m-d H:i:s", $domainInfo['expires']);
					$list[$key]["domaintip"] = $domainInfo['note'];

				}
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


}
