<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 自助建站API接口
 *
 * @version        $Id: website.class.php 2014-7-2 上午11:31:10 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class website {
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

		require(HUONIAOINC."/config/website.inc.php");

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

		// $domainInfo = getDomain('website', 'config');
		// $customChannelDomain = $domainInfo['domain'];
		// if($customSubDomain == 0){
		// 	$customChannelDomain = "http://".$customChannelDomain;
		// }elseif($customSubDomain == 1){
		// 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
		// }elseif($customSubDomain == 2){
		// 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
		// }

		// include HUONIAOINC.'/siteModuleDomain.inc.php';
		$customChannelDomain = getDomainFullUrl('website', $customSubDomain);

        //分站自定义配置
        $ser = 'website';
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
	public function temptype(){
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
		$results = $dsql->getTypeList($type, "website_temptype", $son, $page, $pageSize);
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

			//搜索记录
			siteSearchLog("website", $title);

			$where .= " AND `title` like '%".$title."%'";
		}

		$orderby = " ORDER BY `weight` DESC, `id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `type`, `title`, `litpic` FROM `#@__website_temp`".$where.$orderby);

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
			foreach($results as $key => $val){
				$list[$key]['id'] = $val['id'];

				$list[$key]['typeid'] = $val['type'];

				$typename = "";
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__website_temptype` WHERE `id` = ".$val['type']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$typename = $ret[0]['typename'];
				}
				$list[$key]['typename'] = $typename;

				$list[$key]['title'] = $val['title'];
				$list[$key]["litpic"] = getFilePath($val["litpic"]);

				//企业建站信息
				$sql = $dsql->SetQuery("SELECT `id`, `name`, `alias` FROM `#@__website_temp_pages` WHERE `tempid` = ".$val['id']);
				$res = $dsql->dsqlOper($sql, "results");
				$pages = array();
				if($res){
					foreach($res as $k=>$row){
						$pages[$k]["id"] = $row["id"];
						$pages[$k]["name"] = $row["name"];

						$param = array(
							"service"  => "website",
							"template" => "preview".$val['id'],
							"alias"    => $row['alias']
						);
						$pages[$k]['url'] = getUrlPath($param);
					}
				}
				$list[$key]['catname'] = $pages;

				$param = array(
					"service"     => "website",
					"template"    => "preview".$val['id']
				);
				$list[$key]['url'] = getUrlPath($param);
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
     * 自助建站列表
     * @return array
     */
	public function wlist(){
		global $dsql;
		$pageinfo = $list = array();
		$title = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$title       = $this->param['title'];
				$addrid	     = $this->param['addrid'];
				$page        = $this->param['page'];
				$pageSize    = $this->param['pageSize'];
			}
		}

		$where = " WHERE w.`state` = 1";

		$cityid = getCityId($this->param['cityid']);
		if($cityid){
			$where .= " AND m.`cityid` = " . $cityid;
		}

		if(!empty($title)){
			$where .= " AND w.`title` like '%".$title."%'";
		}

		$orderby = " ORDER BY w.`weight` DESC, w.`id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT w.`id`, w.`title`, w.`domaintype`, w.`note`, w.`userid` FROM `#@__website` w LEFT JOIN `#@__member` m ON m.`id` = w.`userid`".$where.$orderby);

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
			$RenrenCrypt = new RenrenCrypt();
			foreach($results as $key => $val){
//				$results[$key]["litpic"] = getFilePath($val["litpic"]);

				$this->param = "";
				$channelDomain = $this->config();
				$domainInfo = getDomain('website', 'website', $val['id']);

				$param = array(
					"service"      => "website",
					"template"     => "site".$val['id']
				);
				$url = getUrlPath($param);
				$results[$key]["url"] = $url;

				$sql = $dsql->SetQuery("SELECT `logo` FROM `#@__business_list` WHERE `uid` = ".$val['userid']);
				$res = $dsql->dsqlOper($sql, "results");
				$results[$key]['logo']  = !empty($res[0]['logo']) ? getFilePath($res[0]['logo']) : "";

				//建站信息
				$projectid = $val['id'];
				$sql = $dsql->SetQuery("SELECT `id`, `name`, `alias` FROM `#@__website_design` WHERE `projectid` = '$projectid' order by sort ");
				$res = $dsql->dsqlOper($sql, "results");
				$pages = array();
				if($res){
					foreach($res as $k=>$row){
						$pages[$k]["id"] = $row["id"];
						$pages[$k]["name"] = $row["name"];

						$param = array(
							"service"  => "website",
							"template" => "site".$val['id'],
							"alias"    => $row['alias']
						);
						$pages[$k]['url'] = getUrlPath($param);
					}
				}
				$results[$key]['catname'] = $pages;

				/**
				 * 默认 || 模块配置为子目录并且信息配置为绑定子域名则访问方式转为默认
				 * （因为子域名是随模块配置变化，如果模块配置为子目录地址为乱掉。）
				 * 如：模块配置：http://menhu168.com/website
				 * 如果信息绑定子域名则会变成：http://demo.menhu168.com/website
				 * 这样会导致系统读取信息错误
				 */
				if($results[$key]["domaintype"] == 0 || ($channelDomain['subDomain'] == 2 && $results[$key]["domaintype"] == 2)){

					$projectid = base64_encode($RenrenCrypt->php_encrypt($val["id"]));
					$results[$key]["domain"] = $channelDomain['channelDomain']."/".$projectid."/index.html";

				//绑定主域名
				}elseif($results[$key]["domaintype"] == 1){

					$results[$key]["domain"] = $domainInfo['domain'];
					$results[$key]["domainexp"] = date("Y-m-d H:i:s", $domainInfo['expires']);
					$results[$key]["domaintip"] = $domainInfo['note'];

				//绑定子域名
				}elseif($results[$key]["domaintype"] == 2){

					$results[$key]["domain"] = str_replace("http://", "http://".$domainInfo['domain'].".", $channelDomain['channelDomain']);
					$results[$key]["domain"] = str_replace("https://", "https://".$domainInfo['domain'].".", $channelDomain['channelDomain']);
					$results[$key]["domainexp"] = date("Y-m-d H:i:s", $domainInfo['expires']);
					$results[$key]["domaintip"] = $domainInfo['note'];

				}
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $results);
	}


	/**
     * 站点详细信息
     * @return array
     */
	public function storeDetail(){
		global $dsql;
		global $userLogin;
		global $cfg_secureAccess;
		$listingDetail = array();
		$id = $this->param;
		$uid = $userLogin->getMemberID();

		if(!is_numeric($id) && $uid == -1){
			return array("state" => 200, "info" => '格式错误！');
		}

		$where = " AND `state` = 1";
		if(!is_numeric($id)){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `userid` = ".$uid);
			$results  = $dsql->dsqlOper($archives, "results");
			if($results){
				$id = $results[0]['id'];
				$where = "";
			}else{
				return array("state" => 200, "info" => '该会员暂未开通站点！');
			}
		}

		$archives = $dsql->SetQuery("SELECT * FROM `#@__website` WHERE `id` = ".$id.$where);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results[0]['typeid'] = $results[0]['typeid'];

			$this->param = "";
			$channelDomain = $this->config();
			$domainInfo = getDomain('website', 'website', $id);

			/**
			 * 默认 || 模块配置为子目录并且信息配置为绑定子域名则访问方式转为默认
			 * （因为子域名是随模块配置变化，如果模块配置为子目录地址为乱掉。）
			 * 如：模块配置：http://menhu168.com/home
			 * 如果信息绑定子域名则会变成：http://demo.menhu168.com/home
			 * 这样会导致系统读取信息错误
			 */
			if($results[0]["domaintype"] == 0 || ($channelDomain['subDomain'] == 2 && $results[0]["domaintype"] == 2) || ($results[0]['domaintype'] == 1 AND empty($domainInfo['domain']))){

				$param = array(
					"service"     => "website",
					"template"    => "site".$id
				);
				$urlParam = getUrlPath($param);
				$results[0]["domain"] = $urlParam;

			//绑定主域名
			}elseif($results[0]["domaintype"] == 1){

				$results[0]["domain"] = $cfg_secureAccess . $domainInfo['domain'];
				$results[0]["domainexp"] = date("Y-m-d H:i:s", $domainInfo['expires']);
				$results[0]["domaintip"] = $domainInfo['note'];

			//绑定子域名
			}elseif($results[0]["domaintype"] == 2){

				$results[0]["domain"] = str_replace("http://", "http://".$domainInfo['domain'].".", $channelDomain['channelDomain']);
				$results[0]["domain"] = str_replace("https://", "https://".$domainInfo['domain'].".", $channelDomain['channelDomain']);
				$results[0]["domainexp"] = date("Y-m-d H:i:s", $domainInfo['expires']);
				$results[0]["domaintip"] = $domainInfo['note'];

			}

			// 移动端关于我们
			$sql = $dsql->SetQuery("SELECT `body` FROM `#@__website_touch` WHERE `website` = $id AND `alias` = 'about'");
			$ret = $dsql->dsqlOper($sql, "results");

			$results[0]['touch_about'] = $ret ? $ret[0]['body'] : "";

			// 视频
			$video = array();
			$sql = $dsql->SetQuery("SELECT `litpic`, `body` FROM `#@__website_touch_info` WHERE `website` = $id AND `type` = 'video'");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$video = array(
					"pic" => $ret[0]['litpic'] ? getFilePath($ret[0]['litpic']) : "",
					"picSource" => $ret[0]['litpic'],
					"file" => $ret[0]['body'] ? getFilePath($ret[0]['body']) : "",
					"fileSource" => $ret[0]['body']
				);
			}
			$results[0]['video'] = $video;

			// 全景
			$qj = array();
			$qj_type = 0;
			$sql = $dsql->SetQuery("SELECT `date`, `body` FROM `#@__website_touch_info` WHERE `website` = $id AND `type` = 'qj'");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$qj_file = $ret[0]['body'];
				if($qj_file){
					$qj_type = $ret[0]['date'] ? 1 : 0;
					if($qj_type == 0){
						$file = explode(",", $qj_file);
						foreach ($file as $key => $value) {
							$qj[$key]['path'] = getFilePath($value);
							$qj[$key]['source'] = $value;
						}
					}
				}
			}
			$results[0]['qj_type'] = $qj_type;
			$results[0]['qj'] = $qj;
			$results[0]['qj_file'] = $qj_file;

			// banner
			$banner = array();
			$sql = $dsql->SetQuery("SELECT `body` FROM `#@__website_touch_info` WHERE `website` = $id AND `type` = 'banner'");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$banner_file = $ret[0]['body'];
				if($banner_file){
					$body = explode(',', $banner_file);
					foreach ($body as $k => $v) {
						$banner[$k]['path'] = getFilePath($v);
						$banner[$k]['source'] = $v;
					}
				}
			}
			$results[0]['banner'] = $banner;
			$results[0]['banner_file'] = $banner_file;

			return $results[0];
		}
	}


	/**
		* 配置站点
		* @return array
		*/
	public function storeConfig(){
		global $dsql;
		global $userLogin;
		global $siteCityInfo;
		$userid      = $userLogin->getMemberID();
		$param       = $this->param;
		$title       = filterSensitiveWords(addslashes($param['title']));
		$note        = stripslashes(filterSensitiveWords(addslashes($param['note'])));
		$head        = stripslashes(filterSensitiveWords(addslashes($param['head'])));
		$footer      = stripslashes(filterSensitiveWords(addslashes($param['footer'])));
		$pubdate     = GetMkTime(time());
		$touch_skin  = $param['touch_skin'];
		$touch_about = $param['touch_about'];
		$banner      = $param['banner'];
		$video       = $param['video'];
		$video_pic   = $param['video_pic'];
		$qj_type     = $param['qj_type'];
		$qj_pics     = $param['qj_pics'];
		$qj_url      = $param['qj_url'];

		$touch_skin = empty($touch_skin) ? "skin1" : $touch_skin;

		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		//验证会员类型
		$userDetail = $userLogin->getMemberInfo();
		if($userDetail['userType'] != 2){
			return array("state" => 200, "info" => '账号验证错误，操作失败！');
		}

		if(!verifyModuleAuth(array("module" => "website"))){
			return array("state" => 200, "info" => '商家权限验证失败！');
		}

		if(empty($title)){
			return array("state" => 200, "info" => '请输入站点名称');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");

		//入驻审核开关
		include HUONIAOINC."/config/business.inc.php";
		$moduleJoinCheck = (int)$customModuleJoinCheck;
		$editModuleJoinCheck = (int)$customEditModuleJoinCheck;

		//新站点
		if(!$userResult){

			include HUONIAOINC."/config/website.inc.php";
			$state = (int)$customSiteCheck;

			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__website` (`title`, `userid`, `note`, `head`, `footer`, `state`, `pubdate`, `weight`, `touch_temp`) VALUES ('$title', '$userid', '$note', '$head', '$footer', '$state', '$pubdate', 1, '$touch_skin')");
			$aid = $dsql->dsqlOper($archives, "lastid");

			if(is_numeric($aid)){

				//首页
				$archives = $dsql->SetQuery("INSERT INTO `#@__website_design` (`projectid`, `name`, `alias`, `title`, `sort`, `pubdate`) VALUES ('$aid', '首页', 'index', '首页', '1', '".GetMkTime(time())."')");
				$dsql->dsqlOper($archives, "update");

				//新闻列表
				$archives = $dsql->SetQuery("INSERT INTO `#@__website_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '新闻列表', 'news', '', '30', '新闻', '$pubdate')");
				$dsql->dsqlOper($archives, "update");

				//新闻阅读
				$archives = $dsql->SetQuery("INSERT INTO `#@__website_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '新闻详细', 'newsd', '', '31', '新闻', '$pubdate')");
				$dsql->dsqlOper($archives, "update");

				//产品列表
				$archives = $dsql->SetQuery("INSERT INTO `#@__website_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '产品列表页', 'product', '', '34', '产品', '$pubdate')");
				$dsql->dsqlOper($archives, "update");
				//
				//产品阅读
				$archives = $dsql->SetQuery("INSERT INTO `#@__website_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '产品阅读页', 'productd', '', '35', '产品', '$pubdate')");
				$dsql->dsqlOper($archives, "update");

				//视频列表
				$archives = $dsql->SetQuery("INSERT INTO `#@__website_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '视频列表页', 'video', '', '38', '视频', '$pubdate')");
				$dsql->dsqlOper($archives, "update");

				//视频阅读
				$archives = $dsql->SetQuery("INSERT INTO `#@__website_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '视频阅读页', 'videod', '', '39', '视频', '$pubdate')");
				$dsql->dsqlOper($archives, "update");

				// 移动端页面
	            $singel = array(
	               0 => array(
	                 'name' => '公司介绍',
	                 'py' => 'about',
	                 'body' => $touch_about
	               ),
	            );
	            foreach ($singel as $k => $v) {
	            	$alias = $v['py'];
	            	$title = $v['name'];
	            	$body = isset($v['body']) ? $v['body'] : '';
	            	$archives = $dsql->SetQuery("INSERT INTO `#@__website_touch` (`website`, `alias`, `icon`, `title`, `body`, `sys`) VALUES ('$aid', '$alias', '', '$title', '$body', '1')");
	            	$dsql->dsqlOper($archives, "update");
	            }

	            $pubdate = GetMkTime(time());

	            $type = 'banner';
	            $litpic = '';
	            $date = 0;
	            $body = $banner;
	            $sql = $dsql->SetQuery("INSERT INTO `#@__website_touch_info` (`website`, `type`, `title`, `litpic`, `date`, `body`, `weight`, `click`, `pubdate`) VALUES ('$aid', '$type', '', '$litpic', '$date', '$body', '0', '0', '$pubdate')");
	            $dsql->dsqlOper($sql, "lastid");

	            $type = 'video';
	            $litpic = $video_pic;
	            $date = 0;
	            $body = $video;
	            $sql = $dsql->SetQuery("INSERT INTO `#@__website_touch_info` (`website`, `type`, `title`, `litpic`, `date`, `body`, `weight`, `click`, `pubdate`) VALUES ('$aid', '$type', '$title', '$litpic', '$date', '$body', '0', '0', '$pubdate')");
	            $dsql->dsqlOper($sql, "lastid");

	            $type = 'qj';
	            $litpic = '';
	            $date = $qj_type;
	            $body = $qj_type == 1 ? $qj_url : $qj_pics;
	            $sql = $dsql->SetQuery("INSERT INTO `#@__website_touch_info` (`website`, `type`, `title`, `litpic`, `date`, `body`, `weight`, `click`, `pubdate`) VALUES ('$aid', '$type', '$title', '$litpic', '$date', '$body', '0', '0', '$pubdate')");
	            $dsql->dsqlOper($sql, "lastid");

				//后台消息通知
				if($state == 0){
					  //微信通知
		                $cityName = $siteCityInfo['name'];
		                $cityid  = $siteCityInfo['cityid'];
		                $param = array(
		                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
		                    'cityid' => $cityid,
		                    'notify' => '管理员消息通知',
		                    'fields' =>array(
		                        'contentrn'  => $cityName.'分站——website模块——用户:'.$userDetail['username'].'站点配置成功',
		                        'date' => date("Y-m-d H:i:s", time()),
		                    )
		                );
                	updateAdminNotice("website", "website",$param);
					return "配置成功，您的站点正在审核中，请耐心等待！";
				}else{
					return "配置成功，下一步，设计您的站点！";
				}

			}else{
				return array("state" => 200, "info" => '配置失败，请查检您输入的信息是否符合要求！');
			}

		//更新站点信息
		}else{

			$website = $userResult[0]['id'];

			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__website` SET `title` = '$title', `note` = '$note', `head` = '$head', `footer` = '$footer', `touch_temp` = '$touch_skin', `state` = '$editModuleJoinCheck' WHERE `userid` = ".$userid);
			$results = $dsql->dsqlOper($archives, "update");

			if($results == "ok"){

				// 公司简介
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__website_touch` WHERE `website` = ".$website." AND `alias` = 'about'");
				$res = $dsql->dsqlOper($sql, "results");
				if(!$res){
					$sql = $dsql->SetQuery("INSERT INTO `#@__website_touch` (`website`, `alias`, `icon`, `title`, `body`, `sys`) VALUES ('$website', 'about', '', '公司介绍', '$touch_about', '1')");
					$dsql->dsqlOper($sql, "lastid");
				}else{
					$sql = $dsql->SetQuery("UPDATE `#@__website_touch` SET `body` = '$touch_about' WHERE `website` = ".$website." AND `alias` = 'about'");
					$dsql->dsqlOper($sql, "update");
				}
				// banner
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__website_touch_info` WHERE `website` = ".$website." AND `type` = 'banner'");
				$res = $dsql->dsqlOper($sql, "results");
				if(!$res){
					$type = 'banner';
		            $litpic = '';
		            $date = 0;
		            $body = $banner;
		            $sql = $dsql->SetQuery("INSERT INTO `#@__website_touch_info` (`website`, `type`, `title`, `litpic`, `date`, `body`, `weight`, `click`, `pubdate`) VALUES ('$website', '$type', '$title', '$litpic', '$date', '$body', '0', '0', '$pubdate')");
					$dsql->dsqlOper($sql, "lastid");
				}else{
					$sql = $dsql->SetQuery("UPDATE `#@__website_touch_info` SET `body` = '$banner' WHERE `website` = ".$website." AND `type` = 'banner'");
					$dsql->dsqlOper($sql, "update");
				}
				// video
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__website_touch_info` WHERE `website` = ".$website." AND `type` = 'video'");
				$res = $dsql->dsqlOper($sql, "results");
				if(!$res){
					$type = 'video';
		            $litpic = $video_pic;
		            $date = 0;
		            $body = $video;
		            $sql = $dsql->SetQuery("INSERT INTO `#@__website_touch_info` (`website`, `type`, `title`, `litpic`, `date`, `body`, `weight`, `click`, `pubdate`) VALUES ('$website', '$type', '$title', '$litpic', '$date', '$body', '0', '0', '$pubdate')");
		            $dsql->dsqlOper($sql, "lastid");
				}else{
					$sql = $dsql->SetQuery("UPDATE `#@__website_touch_info` SET `litpic` = '$video_pic', `body` = '$video' WHERE `website` = ".$website." AND `type` = 'video'");
					$dsql->dsqlOper($sql, "update");
				}
				// qj
				$qj_file = $qj_type == 0 ? $qj_pics : $qj_url;
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__website_touch_info` WHERE `website` = ".$website." AND `type` = 'qj'");
				$res = $dsql->dsqlOper($sql, "results");
				if(!$res){
					$type = 'qj';
		            $litpic = '';
		            $date = $qj_type;
		            $body = $qj_type == 1 ? $qj_url : $qj_pics;
		            $sql = $dsql->SetQuery("INSERT INTO `#@__website_touch_info` (`website`, `type`, `title`, `litpic`, `date`, `body`, `weight`, `click`, `pubdate`) VALUES ('$website', '$type', '$title', '$litpic', '$date', '$body', '0', '0', '$pubdate')");
		            $dsql->dsqlOper($sql, "lastid");
				}else{
					$sql = $dsql->SetQuery("UPDATE `#@__website_touch_info` SET `date` = '$qj_type', `body` = '$qj_file' WHERE `website` = ".$website." AND `type` = 'qj'");
					$dsql->dsqlOper($sql, "update");
				}


				return "保存成功！";
			}else{
				return array("state" => 200, "info" => '配置失败，请查检您输入的信息是否符合要求！');
			}

		}

	}


	/**
     * 信息分类
     * @return array
     */
	public function sitetype(){
		global $dsql;
		global $userLogin;

		$userid  = $userLogin->getMemberID();

		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$act = $this->param['act'];
		if($act != 'article' && $act != 'product'){
			return array("state" => 200, "info" => '参数错误，获取失败！');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}

		$site = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__website_".$act."type` WHERE `website` = ".$site." ORDER BY `weight` ASC");
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			return $results;
		}else{
			return array("state" => 200, "info" => '暂无相关分类！');
		}

	}




	/**
		* 更新信息分类
		* @return array
		*/
	public function updateSiteType(){
		global $dsql;
		global $userLogin;

		$userid = $userLogin->getMemberID();
		$act = $this->param['act'];
		$data = $_POST['data'];

		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		if($act != 'article' && $act != 'product'){
			return array("state" => 200, "info" => '参数错误，获取失败！');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}

		$site = $userResult[0]['id'];

		if(empty($data)){
			return array("state" => 200, "info" => '请添加分类！');
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
				$sql = $dsql->SetQuery("UPDATE `#@__website_".$act."type` SET `name` = '$val', `weight` = '$weight' WHERE `website` = $site AND `id` = $id");
				$ret = $dsql->dsqlOper($sql, "update");

			//新增
			}else{
				$sql = $dsql->SetQuery("INSERT INTO `#@__website_".$act."type` (`website`, `name`, `weight`) VALUES ('$site', '$val', '$weight')");
				$ret = $dsql->dsqlOper($sql, "update");
			}
		}

		return "保存成功";


	}




	/**
		* 删除信息分类
		* @return array
		*/
	public function delSiteType(){
		global $dsql;
		global $userLogin;

		$userid = $userLogin->getMemberID();
		$act = $this->param['act'];
		$id  = $this->param['id'];

		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		if($act != 'article' && $act != 'product'){
			return array("state" => 200, "info" => '参数错误，获取失败！');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}

		$site = $userResult[0]['id'];

		if(empty($id)){
			return array("state" => 200, "info" => '删除失败，请重试！');
		}

		$sql = $dsql->SetQuery("SELECT t.`id` FROM `#@__website_".$act."type` t LEFT JOIN `#@__website` s ON s.`id` = t.`website` WHERE t.`id` = $id AND s.`userid` = ".$userid);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$sql = $dsql->SetQuery("DELETE FROM `#@__website_".$act."` WHERE `typeid` = ".$id);
			$dsql->dsqlOper($sql, "update");

			$sql = $dsql->SetQuery("DELETE FROM `#@__website_".$act."type` WHERE `id` = ".$id);
			$dsql->dsqlOper($sql, "update");
			return "删除成功！";
		}else{
			return array("state" => 200, "info" => '分类验证失败！');
		}

	}


	/**
     * 新闻信息
     * @return array
     */
	public function news(){
		global $dsql;
		global $userLogin;

		$userid   = $userLogin->getMemberID();
		$pageinfo = $list = array();
		$typeid = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$id       = (int)$this->param['id'];
				$typeid   = (int)$this->param['typeid'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}

		$site = $userResult[0]['id'];

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$where = " WHERE `website` = $site";

		//类型
		if($typeid != ""){
			$where .= " AND `typeid` = $typeid";
		}

		$orderby = " ORDER BY `id` DESC";
		$archives = $dsql->SetQuery("SELECT * FROM `#@__website_article`".$where.$orderby);

		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

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
				$sql = $dsql->SetQuery("SELECT `name` FROM `#@__website_articletype` WHERE `id` = ".$val['typeid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$typeName = $ret[0]['name'];
				}
				$list[$key]['typeName'] = $typeName;

				$list[$key]['title'] = $val['title'];
				$list[$key]['litpic'] = getFilePath($val['litpic']);
				$list[$key]['click']  = $val['click'];
				$list[$key]['pubdate'] = $val['pubdate'];

				$param = array(
					"service"  => "website",
					"template" => "site".$site,
					"param"     => "/newsd.html?sid=".$val['id']
				);
				$url = str_replace("?/newsd.html", "/newsd.html", getUrlPath($param));
				$list[$key]['url']     = $url;

			}
		}else{
			return array("state" => 200, "info" => '暂无相关数据！');
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

		$archives = $dsql->SetQuery("SELECT * FROM `#@__website_article` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

			$results[0]['litpicSource'] = $results[0]['litpic'];
			$results[0]['litpic'] = getFilePath($results[0]['litpic']);

			//信息分类
			$typename = "";
			$sql = $dsql->SetQuery("SELECT `name` FROM `#@__website_articletype` WHERE `id` = ".$results[0]['typeid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$typename = $ret[0]['name'];
			}
			$results[0]['typename'] = $typename;

			return $results[0];
		}else{
			return array("state" => 200, "info" => '信息不存在！');
		}
	}


	/**
		* 新增新闻信息
		* @return array
		*/
	public function addnews(){
		global $dsql;
		global $userLogin;

		$userid  = $userLogin->getMemberID();
		$param   = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$typeid      = (int)($param['typeid']);
		$litpic      = $param['litpic'];
		$keywords    = filterSensitiveWords(addslashes($param['keywords']));
		$description = filterSensitiveWords(addslashes($param['description']));
		$body        = filterSensitiveWords($param['body']);
		$pubdate     = GetMkTime(time());

		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}

		if(!verifyModuleAuth(array("module" => "website"))){
			return array("state" => 200, "info" => '商家权限验证失败！');
		}

		$site = $userResult[0]['id'];

		if(empty($title)){
			return array("state" => 200, "info" => '请输入信息标题');
		}

		if(empty($typeid)){
			return array("state" => 200, "info" => '请选择信息分类');
		}

		if(empty($body)){
			return array("state" => 200, "info" => "请输入信息内容");
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__website_article` (`website`, `title`, `typeid`, `litpic`, `keywords`, `description`, `body`, `click`, `pubdate`) VALUES ('$site', '$title', '$typeid', '$litpic', '$keywords', '$description', '$body', 0, '$pubdate')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($aid)){
			return $aid;
		}else{
			return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
		}

	}



	/**
		* 修改新闻信息
		* @return array
		*/
	public function editnews(){
		global $dsql;
		global $userLogin;

		$userid  = $userLogin->getMemberID();
		$param   = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$id          = (int)($param['id']);
		$typeid      = (int)($param['typeid']);
		$litpic      = $param['litpic'];
		$keywords    = filterSensitiveWords(addslashes($param['keywords']));
		$description = filterSensitiveWords(addslashes($param['description']));
		$body        = filterSensitiveWords($param['body']);

		if(empty($id)){
			return array("state" => 200, "info" => '请选择要修改的信息！');
		}

		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}

		if(!verifyModuleAuth(array("module" => "website"))){
			return array("state" => 200, "info" => '商家权限验证失败！');
		}

		$site = $userResult[0]['id'];

		if(empty($title)){
			return array("state" => 200, "info" => '请输入信息标题');
		}

		if(empty($typeid)){
			return array("state" => 200, "info" => '请选择信息分类');
		}

		if(empty($body)){
			return array("state" => 200, "info" => "请输入信息内容");
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__website_article` SET `title` = '$title', `typeid` = '$typeid', `litpic` = '$litpic', `keywords` = '$keywords', `description` = '$description', `body` = '$body' WHERE `website` = $site AND `id` = ".$id);
		$ret = $dsql->dsqlOper($archives, "update");

		if($ret == "ok"){
			return "修改成功！";
		}else{
			return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
		}

	}


	/**
		* 删除新闻信息
		* @return array
		*/
	public function delnews(){
		global $dsql;
		global $userLogin;

		$id = $this->param['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//获取用户ID
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}

		$site = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT * FROM `#@__website_article` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results = $results[0];
			if($results['website'] == $site){

					//删除图集
					delPicFile($results['litpic'], "delThumb", "website");

					$archives = $dsql->SetQuery("DELETE FROM `#@__website_article` WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");
					return '删除成功！';

			}else{
				return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
			}
		}else{
			return array("state" => 101, "info" => '信息不存在，或已经删除！');
		}

	}


	/**
     * 留言列表
     * @return array
     */
	public function guest(){
		global $dsql;
		global $userLogin;
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
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}

		if(!verifyModuleAuth(array("module" => "website"))){
			return array("state" => 200, "info" => '商家权限验证失败！');
		}

		$site = $userResult[0]['id'];

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$where = " WHERE `website` = $site";
		$orderby = " ORDER BY `id` DESC";
		$archives = $dsql->SetQuery("SELECT * FROM `#@__website_guest`".$where);

		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		//未回复的
		$totalAudit = $dsql->dsqlOper($archives . " AND `state` = 0", "totalCount");

		if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount,
			"totalAudit" => $totalAudit
		);

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$results = $dsql->dsqlOper($archives.$orderby.$where, "results");
		$list = array();
		if($results){

			foreach($results as $key => $val){
				$list[$key]['id'] = $val['id'];
				$list[$key]['people'] = $val['people'];
				$list[$key]['contact'] = $val['contact'];
				$list[$key]['ip']  = $val['ip'];
				$list[$key]['ipaddr'] = $val['ipaddr'];
				$list[$key]['note'] = $val['note'];
				$list[$key]['reply'] = $val['reply'];
				$list[$key]['pubdate'] = $val['pubdate'];
			}
		}else{
			return array("state" => 200, "info" => '暂无相关数据！');
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
		* 删除留言信息
		* @return array
		*/
	public function delGuest(){
		global $dsql;
		global $userLogin;

		$id = $this->param['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//获取用户ID
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}

		$site = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT * FROM `#@__website_guest` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results = $results[0];
			if($results['website'] == $site){
				$archives = $dsql->SetQuery("DELETE FROM `#@__website_guest` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");
				return '删除成功！';
			}else{
				return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
			}
		}else{
			return array("state" => 101, "info" => '信息不存在，或已经删除！');
		}

	}


	/**
		* 回复留言信息
		* @return array
		*/
	public function replyGuest(){
		global $dsql;
		global $userLogin;

		$id = $this->param['id'];
		$reply = $this->param['reply'];

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//获取用户ID
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}

		$site = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT * FROM `#@__website_guest` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results = $results[0];
			if($results['website'] == $site){

				if(!empty($reply)){
					$archives = $dsql->SetQuery("UPDATE `#@__website_guest` SET `reply` = '$reply', `state` = 1 WHERE `id` = ".$id);
				}else{
					$archives = $dsql->SetQuery("UPDATE `#@__website_guest` SET `reply` = '', `state` = 0 WHERE `id` = ".$id);
				}
				$dsql->dsqlOper($archives, "update");
				return '回复成功！';
			}else{
				return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
			}
		}else{
			return array("state" => 101, "info" => '信息不存在，或已经删除！');
		}

	}


	/**
	 * 管理移动端相关内容
	 */
	public function manageTouchInfo(){
		global $dsql;
		global $userLogin;

		//获取用户ID
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}else{
			$website = $userResult[0]['id'];
		}

		$param  = $this->param;
		$type   = $param['type'];
		$dopost = $param['dopost'];
		$id     = (int)$param['id'];
		$title  = $param['title'];
		$litpic = $param['litpic'];
		$body   = $param['body'];
		$date   = (int)$param['date'];

		if(empty($dopost)) return array("state" => 200, "info" => '参数错误');

		if($dopost == "add" || $dopost == "edit"){
			if(empty($title)) return array("state" => 200, "info" => '请填写标题');
			if($type == "honor"){
				if(empty($litpic)) return array("state" => 200, "info" => '请上传图片');
			}
			if($type == "event"){
				if(empty($date)) return array("state" => 200, "info" => '请选择时间');
				$date = GetMkTime($date);
			}
		}

		if($id){

			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__website_touch_info` WHERE `id` = $id AND `website` = $website");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!$ret){
				return array("state" => 200, "info" => '信息不存在或权限不足');
			}

			if($dopost == "edit"){
				$sql = $dsql->SetQuery("UPDATE `#@__website_touch_info` SET `title` = '$title', `litpic` = '$litpic', `date` = '$date', `body` = '$body' WHERE `id` = $id");
				$ret = $dsql->dsqlOper($sql, "update");
				if($ret == "ok"){
					return "操作成功";
				}else{
					return array("state" => 200, "info" => '操作失败，请重试！');
				}

			}elseif($dopost == "del"){
				$sql = $dsql->SetQuery("DELETE FROM `#@__website_touch_info` WHERE `id` = $id");
				$ret = $dsql->dsqlOper($sql, "update");
				if($ret == "ok"){
					return "操作成功";
				}else{
					return array("state" => 200, "info" => '操作失败，请重试！');
				}
			}

		}else{
			$pubdate = GetMkTime(time());
			$sql = $dsql->SetQuery("INSERT INTO `#@__website_touch_info` (`website`, `type`, `title`, `litpic`, `date`, `body`, `weight`, `pubdate`) VALUES ('$website', '$type', '$title', '$litpic', '$date', '$body', '0', '$pubdate')");
			$ret = $dsql->dsqlOper($sql, "lastid");
			if(is_numeric($ret)){
				return "操作成功";
			}else{
				return array("state" => 200, "info" => '操作失败，请重试！');
			}
		}


	}

	/**
	 * 上传企业荣誉
	 */
	public function addhonor(){
		global $dsql;

		$param  = $this->param;

		$title = $param['title'];
		$pics  = $param['pics'];

		if(empty($title)) return array("state" => 200, "info" => '请填写标题');
		if(empty($pics)) return array("state" => 200, "info" => '请上传图片');

		$picsArr = explode(',', $pics);

		$this->param['type'] = 'honor';
		$this->param['dopost'] = 'add';
		$this->param['body'] = '';

		$count = count($picsArr);
		$err = array();

		$picsArr = array_reverse($picsArr);

		foreach ($picsArr as $key => $value) {
			$this->param['litpic'] = $value;
			$r = $this->manageTouchInfo();
			if(is_array($r)){
				array_push($err);
			}
		}

		if($err){
			$info = $count = count($err) ? "保存失败": "部分图片保存失败";
			return array("state" => 200, "info" => $info);
		}else{
			return "操作成功";
		}

	}

	/**
	 * 编辑招聘
	 */
	public function editjob(){
		return $this->dopostJob();
	}

	/**
	 * 新增招聘
	 */
	public function addjob(){
		return $this->dopostJob();
	}

	/**
	 * 编辑、新增招聘
	 */
	public function dopostJob(){
		$param = $this->param;

		unset($param['title']);
		unset($param['body']);
		unset($param['service']);
		unset($param['action']);
		unset($param['id']);

		$body = array();
		foreach ($param as $key => $value) {
			$body['d_'.$key] = $value;
		}
		$body = serialize($body);

		$this->param['type'] = 'job';
		$this->param['dopost'] = 'edit';
		$this->param['body'] = $body;

		return $this->manageTouchInfo();
	}




	/**
	 * 移动端相关信息列表
	 */
	public function getTouchInfo(){
		global $dsql;
		global $userLogin;
		global $langData;

		$param  = $this->param;
		$type   = $param['type'];
		$id     = (int)$param['id'];
		$page     = (int)$this->param['page'];
		$pageSize = (int)$this->param['pageSize'];

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		if(empty($type) || empty($id)) return array("state" => 200, "info" => '参数错误');

		$where = " AND `website` = $id AND `type` = '$type'";

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `date`, `pubdate` FROM `#@__website_touch_info` WHERE 1 = 1".$where);
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		//总条数
		$totalResults = $dsql->dsqlOper($totalCount, "results", "NUM");

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);   //暂无数据！

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		$order = " ORDER BY `weight` DESC, `id` DESC";
		if($type == "event"){
			$order = " ORDER BY `weight` DESC, `id` ASC";
		}

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$results = $dsql->dsqlOper($archives.$order.$where, "results");

		$list = array();
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']      = $val['id'];
				$list[$key]['title']   = $val['title'];
				$list[$key]['litpic']  = !empty($val['litpic']) ? getFilePath($val['litpic']) : "";
				$list[$key]['date']    = $val['date'];
				$list[$key]['pubdate'] = $val['pubdate'];
				$list[$key]['click']   = $val['click'];
			}
		}
		return array("pageInfo" => $pageinfo, "list" => $list);

	}

	/**
	 * 移动端相关信息详情
	 */
	public function getTouchInfoDetail(){
		global $dsql;
		global $userLogin;

		$param  = $this->param;
		$id     = (int)$param['id'];
		$u      = (int)$param['u'];

		if(empty($id)) return array("state" => 200, "info" => '参数错误');

		$where = "";

		if($u){
			$userid = $userLogin->getMemberID();
			if($userid == -1) return "";
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `userid` = $userid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$website = $ret[0]['id'];
			}else{
				$website = -1;
			}
			$where .= " AND `website` = ".$website;
		}

		$archives = $dsql->SetQuery("SELECT * FROM `#@__website_touch_info` WHERE `id` = $id".$where);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$body = $results[0]['body'];

			if($body){
				$body_arr = unserialize($body);
				if($body_arr !== false){
					$results[0]['body'] = array();
					foreach ($body_arr as $key => $value) {
						$results[0]['body'][$key] = $value;
					}
				}
			}
			// print_r($results[0]);
			return $results[0];
		}
	}

	/**
	 * 管理移动端导航
	 */
	public function manageTouchNav(){
		global $dsql;
		global $userLogin;

		//获取用户ID
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}else{
			$website = $userResult[0]['id'];
		}

		$param       = $this->param;
		$dopost      = $param['dopost'];
		$id          = (int)$param['id'];
		// $weight      = (int)$param['weight'];
		$title       = $param['title'];
		$icon        = $param['icon'];
		$jump        = $param['jump'];
		$jump_url    = $param['jump_url'];
		$keywords    = $param['keywords'];
		$description = $param['description'];
		$body        = filterSensitiveWords($param['body']);

		if(empty($dopost)) return array("state" => 200, "info" => '参数错误');

		if($dopost == "add" || $dopost == "edit"){
			if(empty($title)) return array("state" => 200, "info" => '请填写标题');
			if($jump){
				if(empty($jump_url)) return array("state" => 200, "info" => '请填写跳转链接');
			}
		}

		$alias = GetPinyin($title);

		if($id){

			$sql = $dsql->SetQuery("SELECT `id`, `alias`, `sys` FROM `#@__website_touch` WHERE `id` = $id AND `website` = $website");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!$ret){
				return array("state" => 200, "info" => '信息不存在或权限不足');
			}else{
				$old = $ret[0];
			}

			if($dopost == "edit"){

				$fields = "";
				if($old['sys'] == 0){
					$fields = ", `alias` = '$alias', `title` = '$title', `icon` = '$icon', `jump` = '$jump', `jump_url` = '$jump_url'";
				}
				$sql = $dsql->SetQuery("UPDATE `#@__website_touch` SET `keywords` = '$keywords', `description` = '$description', `body` = '$body' ".$fields." WHERE `id` = $id");
				$ret = $dsql->dsqlOper($sql, "update");
				if($ret == "ok"){
					return "操作成功";
				}else{
					return array("state" => 200, "info" => '操作失败，请重试！');
				}

			}elseif($dopost == "del"){
				if($old['sys'] == 1){
					return array("state" => 200, "info" => '当前栏目无法删除！');
				}
				$sql = $dsql->SetQuery("DELETE FROM `#@__website_touch` WHERE `id` = $id");
				$ret = $dsql->dsqlOper($sql, "update");
				if($ret == "ok"){
					return "操作成功";
				}else{
					return array("state" => 200, "info" => '操作失败，请重试！');
				}
			}

		}else{
			$pubdate = GetMkTime(time());

			$sql = $dsql->SetQuery("INSERT INTO `#@__website_touch` (`website`, `alias`, `title`, `keywords`, `description`, `icon`, `jump`, `jump_url`, `body`, `sys`) VALUES ('$website', '$alias', '$title', '$keywords', '$description', '$icon', '$jump', '$jump_url', '$body', '0')");
			$ret = $dsql->dsqlOper($sql, "lastid");
			if(is_numeric($ret)){
				return "操作成功";
			}else{
				echo $sql;die;
				return array("state" => 200, "info" => '操作失败，请重试！');
			}
		}

	}

	/**
	 * 批量管理移动端导航
	 */
	public function manageTouchNavBatch(){
		global $dsql;
		$param       = $this->param;
		$custom_nav  = $param['custom_nav'];

		if(empty($custom_nav)) return array("state" => 200, "info" => '参数错误');

		$custom_navArr = explode('|', $custom_nav);

		$r = "操作成功";

		foreach ($custom_navArr as $key => $value) {
			$d     = explode(',', $value);
			$id    = (int)$d[0];
			$icon  = $d[1];
			$title = $d[2];
			$url   = $d[3];
			$del   = (int)$d[4];

			$param = array();

			if($del){
				if(empty($id)) continue;
				$dopost = "del";
			}else{
				$dopost = $id ? "edit" : "add";
			}

			$param['dopost'] = $dopost;
			$param['id'] = $id;
			$param['icon'] = $icon;
			$param['title'] = $title;
			$param['jump'] = 1;
			$param['jump_url'] = $url;

			$this->param = $param;

			$r = $this->manageTouchNav();

			if(is_array($r)){
				break;
			}
		}
		return $r;
	}

	/**
	 * 产品分类
	 */
	public function productType(){
		global $dsql;

		$page = $pageSize = "";
		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$id       = (int)$this->param['id'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if(empty($id)) return array("state" => 200, "info" => "参数错误，获取失败！");

		$page     = $page == "" ? 1 : $page;
		$pagesize = $pagesize == "" ? 1000 : $pageSize;

		$atpage = $pagesize*($page-1);
		$where = " LIMIT $atpage, $pagesize";

		$typeListArr = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__website_producttype` WHERE `website` = $id ORDER BY `weight` ASC, `id` ASC".$where);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key => $val){
				$typeListArr[$key]['catid'] = $val['id'];
				$typeListArr[$key]['sortid'] = $val['weight'];
				$typeListArr[$key]['catname'] = $val['name'];

				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__website_product` WHERE `website` = $id AND `typeid` = ".$val['id']);
				$results = $dsql->dsqlOper($archives, "totalCount");
				$typeListArr[$key]['count'] = $results;
			}
		}

		return $typeListArr;

	}

	/**
	 * 产品列表
	 */
	public function productList(){
		global $dsql;
		global $userLogin;
		$where = $page = $pageSize = "";
		$userid = $userLogin->getMemberID();

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$id       = (int)$this->param['id'];
				$u        = (int)$this->param['u'];
				$typeid   = (int)$this->param['type'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if($u){
			if($userid == -1){
				return array("state" => 200, "info" => '登录超时，请重新登录！');
			}
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				return array("state" => 200, "info" => '请先申请站点配置！');
			}
			$id = $userResult[0]['id'];
		}

		$page     = $page == "" ? 1 : $page;
		$pageSize = $pageSize == "" ? 1000 : $pageSize;

		if(empty($id)) return array("state" => 200, "info" => "参数错误，获取失败！");

		if(!empty($typeid)){
			$where .= " AND `typeid` = $typeid";
		}

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `litpic`, `description`, `pubdate` FROM `#@__website_product` WHERE `website` = $id".$where);
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

		// 总页数
		$totalPage = ceil($totalCount/$pageSize);

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount,
		);

		$atpage = $pageSize*($page-1);
		$where .= " ORDER BY `id` DESC LIMIT $atpage, $pageSize";

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `litpic`, `description`, `click`, `pubdate` FROM `#@__website_product` WHERE `website` = $id".$where);
		$results = $dsql->dsqlOper($archives, "results");
		$list = array();
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id'] = $val['id'];
				$list[$key]['title'] = $val['title'];
				$list[$key]['catid'] = $val['typeid'];
				$list[$key]['click'] = $val['click'];
				$list[$key]['pubdate'] = $val['pubdate'];
				$list[$key]['image'] = getFilePath($val['litpic']);
				$list[$key]['summary'] = $val['description'];

				$archives = $dsql->SetQuery("SELECT `name` FROM `#@__website_producttype` WHERE `id` = ".$val['typeid']);
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					$list[$key]['catname'] = $results[0]['name'];
				}else{
					$list[$key]['catname'] = "";
				}

				$list[$key]['addtime'] = !empty($timeformat) ? date($timeformat, $val['pubdate']) : date("Y-m-d H:i:s", $val['pubdate']);

				$param = array(
					"service"      => "website",
					"template"     => "site".$id
				);
				$url = getUrlPath($param);

				$list[$key]['url'] = $url."/productd.html?sid=".$val['id'];
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);

	}

	/**
     * 产品详细信息
     * @return array
     */
	public function productDetail(){
		global $dsql;
		$id = $this->param;

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		$archives = $dsql->SetQuery("SELECT * FROM `#@__website_product` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

			$results[0]['litpicSource'] = $results[0]['litpic'];
			$results[0]['litpic'] = getFilePath($results[0]['litpic']);

			//信息分类
			$typename = "";
			$sql = $dsql->SetQuery("SELECT `name` FROM `#@__website_producttype` WHERE `id` = ".$results[0]['typeid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$typename = $ret[0]['name'];
			}
			$results[0]['typename'] = $typename;

			return $results[0];
		}else{
			return array("state" => 200, "info" => '产品不存在！');
		}
	}

	/**
		* 新增产品
		* @return array
		*/
	public function addproduct(){
		global $dsql;
		global $userLogin;

		$userid  = $userLogin->getMemberID();
		$param   = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$typeid      = (int)($param['typeid']);
		$litpic      = $param['litpic'];
		$keywords    = filterSensitiveWords(addslashes($param['keywords']));
		$description = filterSensitiveWords(addslashes($param['description']));
		$body        = filterSensitiveWords($param['body']);
		$pubdate     = GetMkTime(time());

		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}

		if(!verifyModuleAuth(array("module" => "website"))){
			return array("state" => 200, "info" => '商家权限验证失败！');
		}

		$site = $userResult[0]['id'];

		if(empty($title)){
			return array("state" => 200, "info" => '请输入信息标题');
		}

		if(empty($typeid)){
			return array("state" => 200, "info" => '请选择信息分类');
		}

		if(empty($body)){
			// return array("state" => 200, "info" => "请输入信息内容");
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__website_product` (`website`, `title`, `typeid`, `litpic`, `keywords`, `description`, `body`, `click`, `pubdate`) VALUES ('$site', '$title', '$typeid', '$litpic', '$keywords', '$description', '$body', 0, '$pubdate')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($aid)){
			return $aid;
		}else{
			return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
		}

	}



	/**
		* 修改产品
		* @return array
		*/
	public function editproduct(){
		global $dsql;
		global $userLogin;

		$userid  = $userLogin->getMemberID();
		$param   = $this->param;

		$title       = filterSensitiveWords(addslashes($param['title']));
		$id          = (int)($param['id']);
		$typeid      = (int)($param['typeid']);
		$litpic      = $param['litpic'];
		$keywords    = filterSensitiveWords(addslashes($param['keywords']));
		$description = filterSensitiveWords(addslashes($param['description']));
		$body        = filterSensitiveWords($param['body']);

		if(empty($id)){
			return array("state" => 200, "info" => '请选择要修改的信息！');
		}

		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}

		if(!verifyModuleAuth(array("module" => "website"))){
			return array("state" => 200, "info" => '商家权限验证失败！');
		}

		$site = $userResult[0]['id'];

		if(empty($title)){
			return array("state" => 200, "info" => '请输入信息标题');
		}

		if(empty($typeid)){
			return array("state" => 200, "info" => '请选择信息分类');
		}

		if(empty($body)){
			// return array("state" => 200, "info" => "请输入信息内容");
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__website_product` SET `title` = '$title', `typeid` = '$typeid', `litpic` = '$litpic', `keywords` = '$keywords', `description` = '$description', `body` = '$body' WHERE `website` = $site AND `id` = ".$id);
		$ret = $dsql->dsqlOper($archives, "update");

		if($ret == "ok"){
			return "修改成功！";
		}else{
			return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
		}

	}


	/**
		* 删除产品
		* @return array
		*/
	public function delproduct(){
		global $dsql;
		global $userLogin;

		$id = $this->param['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//获取用户ID
		$userid = $userLogin->getMemberID();
		if($userid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `state` = 1 AND `userid` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			return array("state" => 200, "info" => '请先申请站点配置！');
		}

		$site = $userResult[0]['id'];

		$archives = $dsql->SetQuery("SELECT * FROM `#@__website_product` WHERE `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results = $results[0];
			if($results['website'] == $site){

					//删除图集
					delPicFile($results['litpic'], "delThumb", "website");

					$archives = $dsql->SetQuery("DELETE FROM `#@__website_product` WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");
					return '删除成功！';

			}else{
				return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
			}
		}else{
			return array("state" => 101, "info" => '信息不存在，或已经删除！');
		}

	}

	/**
	 * 职位列表、荣誉列表
	 */
	public function infoList(){
		global $dsql;
		global $userLogin;
		$where = $page = $pageSize = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$id       = (int)$this->param['id'];
				$u        = (int)$this->param['u'];
				$type     = $this->param['type'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		$page     = $page == "" ? 1 : $page;
		$pageSize = $pageSize == "" ? 1000 : $pageSize;

		if($u){
			$userid = $userLogin->getMemberID();
			if($userid != -1){
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `userid` = $userid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$id = $ret[0]['id'];
				}else{
					return array("state" => 200, "info" => '请先申请站点配置！');
				}
			}
		}

		if(empty($id) || empty($type)) return array("state" => 200, "info" => "参数错误，获取失败！");

		$where .= " AND `type` = '$type'";

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `date`, `click`, `pubdate` FROM `#@__website_touch_info` WHERE `website` = $id".$where);
		$totalCount = $dsql->dsqlOper($archives, "totalCount");

		if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

		// 总页数
		$totalPage = ceil($totalCount/$pageSize);

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount,
		);

		$atpage = $pageSize*($page-1);
		$where .= " ORDER BY `id` DESC LIMIT $atpage, $pageSize";

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `date`, `click`, `pubdate` FROM `#@__website_touch_info` WHERE `website` = $id".$where);
		$results = $dsql->dsqlOper($archives, "results");
		$list = array();
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id'] = $val['id'];
				$list[$key]['title'] = $val['title'];
				$list[$key]['litpic'] = getFilePath($val['litpic']);
				$list[$key]['date'] = $val['date'];
				$list[$key]['pubdate'] = $val['pubdate'];

				$param = array(
					"service"      => "website",
					"template"     => "site".$id
				);
				$url = getUrlPath($param);

				$list[$key]['url'] = $url."/".$type."d.html?sid=".$val['id'];
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);

	}

	/**
	 * 删除移动端信息
	 */
	public function delInfo(){
		global $dsql;
		global $userLogin;
		$userid = $userLogin->getMemberID();
		if($userid == -1) return array("state" => 200, "info" => "登陆超时，请重新登陆");

		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `userid` = $userid");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$website = $ret[0]['id'];
		}else{
			return array("state" => 200, "info" => "您还没有创建站点");
		}

		$param = $this->param;

		$id = (int)$param['id'];
		if(empty($id)) return array("state" => 200, "info" => "参数错误");

		$sql = $dsql->SetQuery("SELECT `litpic`, `body` FROM `#@__website_touch_info` WHERE `id` = $id AND `website` = $website");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$detail = $ret[0];
		}else{
			return array("state" => 200, "info" => "信息不存在或权限不足");
		}

		$sql = $dsql->SetQuery("DELETE FROM `#@__website_touch_info` WHERE `id` = $id");
		$ret = $dsql->dsqlOper($sql, "update");
		$ret = "ok";
		if($ret == "ok"){
			if($detail['litpic']){
				delPicFile($detail['litpic'], "delThumb", "website");
				delPicFile($detail['litpic'], "delAtlas", "website");
			}
			return "操作成功";
		}else{
			return array("state" => 200, "info" => "操作失败，请重试！");
		}


	}
}
