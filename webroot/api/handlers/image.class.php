<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 图片模块API接口
 *
 * @version        $Id: image.class.php 2017-1-18 上午11:17:20 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class image {
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

		require(HUONIAOINC."/config/image.inc.php");

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

		$hotline = $hotline_config == 0 ? $cfg_hotline : $customHotline;

		$params = !empty($this->param) && !is_array($this->param) ? explode(',',$this->param) : "";

		// $domainInfo = getDomain('image', 'config');
		// $customChannelDomain = $domainInfo['domain'];
		// if($customSubDomain == 0){
		// 	$customChannelDomain = "http://".$customChannelDomain;
		// }elseif($customSubDomain == 1){
		// 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
		// }elseif($customSubDomain == 2){
		// 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
		// }

		// include HUONIAOINC.'/siteModuleDomain.inc.php';
		$customChannelDomain = getDomainFullUrl('image', $customSubDomain);

        //分站自定义配置
        $ser = 'image';
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
			$return['atlasMax']      = $customAtlasMax;
			$return['template']      = $customTemplate;
			$return['touchTemplate'] = $customTouchTemplate;
			$return['softSize']      = $custom_softSize;
			$return['softType']      = $custom_softType;
			$return['thumbSize']     = $custom_thumbSize;
			$return['thumbType']     = $custom_thumbType;
			$return['atlasSize']     = $custom_atlasSize;
			$return['atlasType']     = $custom_atlasType;
			$return['listRule']      = $custom_listRule;
			$return['detailRule']    = $custom_detailRule;
		}

		return $return;

	}


	/**
     * 图片分类
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
		$results = $dsql->getTypeList($type, "imagetype", $son, $page, $pageSize);
		if($results){
			return $results;
		}
	}


	/**
     * 图片分类详细信息
     * @return array
     */
	public function typeDetail(){
		global $dsql;
		$typeDetail = array();
		$typeid = $this->param;

        if(!is_numeric($typeid)){
            return;
        }
        
		$archives = $dsql->SetQuery("SELECT `id`, `typename`, `seotitle`, `keywords`, `description` FROM `#@__imagetype` WHERE `id` = ".$typeid);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results && is_array($results)){
			$param = array(
				"service"     => "image",
				"template"    => "list",
				"typeid"      => $typeid
			);
			$results[0]["url"] = getUrlPath($param);
			return $results;
		}
	}


	/**
     * 图片列表
     * @return array
     */
	public function alist(){
		global $dsql;
		global $userLogin;
		$pageinfo = $list = array();
		$typeid = $title = $flag = $thumb = $orderby = $u = $state = $group_img = $page = $pageSize = $where = $where1 = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$typeid   = (int)$this->param['typeid'];
				$title    = $this->param['title'];
				$flag     = $this->param['flag'];
				$thumb    = $this->param['thumb'];
				$orderby  = $this->param['orderby'];
				$u        = $this->param['u'];
				$state    = $this->param['state'];
				$group_img = $this->param['group_img'];
				$page     = (int)$this->param['page'];
				$pageSize = (int)$this->param['pageSize'];
			}
		}

		//数据共享
		require(HUONIAOINC."/config/image.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
			$cityid = getCityId($this->param['cityid']);
			if($cityid){
				$where .= " AND `cityid` = ".$cityid;
			}
		}

		//是否输出当前登录会员的信息
		if($u != 1){
			$where .= " AND l.`arcrank` = 1";
		}else{
			$uid = $userLogin->getMemberID();
			$where .= " AND l.`admin` = ".$uid;

			if($state != ""){
				$where1 = " AND l.`arcrank` = ".$state;
			}
		}

		//遍历分类
		if(!empty($typeid)){
			if($dsql->getTypeList($typeid, "imagetype")){
				global $arr_data;
				$arr_data = array();
				$lower = arr_foreach($dsql->getTypeList($typeid, "imagetype"));
				$lower = $typeid.",".join(',',$lower);
			}else{
				$lower = $typeid;
			}
			$where .= " AND `typeid` in ($lower)";
		}

		//模糊查询关键字
		if(!empty($title)){

			//搜索记录
			siteSearchLog("image", $title);

			$title = explode(" ", $title);
			$w = array();
			foreach ($title as $k => $v) {
				if(!empty($v)){
					$w[] = "`title` like '%".$v."%' OR `keywords` like '%".$v."%'";
				}
			}
			$where .= " AND (".join(" OR ", $w).")";
		}

		//匹配自定义属性
		if(!empty($flag)){
			$flag = explode(",", $flag);
			$w = array();
			foreach ($flag as $k => $v) {
				$w[] = "`flag` like '%".$v."%'";
			}
			$where .= " AND (".join(" AND ", $w).")";
		}

		//缩略图
		if($thumb === "0"){
			$where .= " AND `litpic` = ''";
		}elseif($thumb === "1"){
			$where .= " AND `litpic` != ''";
		}

        //当天
        $todayk = strtotime(date('Y-m-d'));

        //当天结束
        $todaye = strtotime(date('Y-m-d 23:59:59'));

        //昨天时间戳
        $time1 = strtotime(date('Y-m-d 00:00:00',time()-3600*24));
        $time2 = strtotime(date('Y-m-d 23:59:59',time()-3600*24));

        //本周时间戳
        $time3 = mktime(0,0,0,date('m'),date('d')-date('N')+1,date('y'));
        $time4 = mktime(23,59,59,date('m'),date('d')-date('N')+7,date('Y'));

        $BeginDate = date('Y-m-01', strtotime(date("Y-m-d")));//本月第一天
        $overDate  = date('Y-m-d', strtotime("$BeginDate +1 month"));//本月最后一天
        $btime     = strtotime($BeginDate);
        $ovtime    = strtotime($overDate);


		$order = " ORDER BY `weight` DESC, `id` DESC";
		//发布时间
		if($orderby == "1"){
			$order = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
		//浏览量
		}elseif($orderby == "2"){
			$order = " ORDER BY `click` DESC, `weight` DESC, `id` DESC";
		//今日浏览量
		}elseif($orderby == "2.1"){
			$order = " AND `pubdate` > $todayk AND `pubdate` < $todaye ORDER BY `click` DESC, `weight` DESC, `id` DESC";
		//昨日浏览量
		}elseif($orderby == "2.2"){
			$order = " AND `pubdate` > $time1 AND `pubdate` < $time2  ORDER BY `click` DESC, `weight` DESC, `id` DESC";
		//本周浏览量
		}elseif($orderby == "2.3"){
			$order = " AND `pubdate` > $time3 AND `pubdate` < $time4 ORDER BY `click` DESC, `weight` DESC, `id` DESC";
		//本月浏览量
		}elseif($orderby == "2.4"){
			$order = " AND `pubdate` > $btime AND `pubdate` < $ovtime ORDER BY `click` DESC, `weight` DESC, `id` DESC";
		//随机
		}elseif($orderby == "3"){
			$order = " ORDER BY rand()";
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `subtitle`, `typeid`, `flag`, `keywords`, `description`, `source`, `redirecturl`, `litpic`, `color`, `click`, l.`arcrank`, `pubdate` FROM `#@__imagelist` l WHERE `del` = 0".$where);
		$archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__imagelist` l WHERE `del` = 0".$where);

		//总条数
		$totalResults = $dsql->dsqlOper($archives_count, "results", "NUM");
		$totalCount = (int)$totalResults[0][0];

		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount
		);

		//会员列表需要统计信息状态
		if($u == 1 && $userLogin->getMemberID() > -1){
			//待审核
			$totalGray = $dsql->dsqlOper($archives." AND `arcrank` = 0", "totalCount");
			//已审核
			$totalAudit = $dsql->dsqlOper($archives." AND `arcrank` = 1", "totalCount");
			//拒绝审核
			$totalRefuse = $dsql->dsqlOper($archives." AND `arcrank` = 2", "totalCount");

			$pageinfo['gray'] = $totalGray;
			$pageinfo['audit'] = $totalAudit;
			$pageinfo['refuse'] = $totalRefuse;
		}

		$atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";
		$results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");

		if($results && is_array($results)){
			global $cfg_clihost;
			foreach($results as $key => $val){
				$flag = explode(",", $val['flag']);
				$list[$key]['id']          = $val['id'];
				$list[$key]['title']       = in_array("b", $flag) ? '<strong>'.$val['title'].'</strong>' : $val['title'];
				$list[$key]['subtitle']    = $val['subtitle'];
				$list[$key]['typeid']      = $val['typeid'];

				global $data;
				$data = "";
				$typeArr = getParentArr("imagetype", $val['typeid']);
				$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
				$list[$key]['typeName']    = $typeArr;

				$list[$key]['flag']        = $val['flag'];
				$list[$key]['keywords']    = $val['keywords'];
				$list[$key]['description'] = $val['description'];
				$list[$key]['source']      = $val['source'];
				$list[$key]['redirecturl'] = $val['redirecturl'];
				$list[$key]['litpic']      = !empty($val['litpic']) ? getFilePath($val['litpic']) : "";
				$list[$key]['color']       = $val['color'];
				$list[$key]['click']       = $val['click'];

				//如果是图片是真实路径
				if(strstr($val['litpic'], ".jpg") || strstr($val['litpic'], ".jpeg") || strstr($val['litpic'], ".gif") || strstr($val['litpic'], ".png") || strstr($val['litpic'], ".bmp")){
					$rpic = str_replace('/uploads', '', $val["litpic"]);
					$sql = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `path` = '$rpic'");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$list[$key]['pic_width'] = $ret[0]['width'];
						$list[$key]['pic_height'] = $ret[0]['height'];
					}else{
						$list[$key]['pic_width'] = 0;
						$list[$key]['pic_height'] = 0;
					}
				}else{
					//获取图片在数据库中的信息
					$RenrenCrypt = new RenrenCrypt();
					$fid = $RenrenCrypt->php_decrypt(base64_decode($val['litpic']));

					if(!is_numeric($fid)){
						$rpic = str_replace('/uploads', '', $val["litpic"]);
						$sql = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `path` = '$rpic'");
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							$list[$key]['pic_width'] = $ret[0]['width'];
							$list[$key]['pic_height'] = $ret[0]['height'];
						}else{
							$list[$key]['pic_width'] = 0;
							$list[$key]['pic_height'] = 0;
						}
					}else{
						$archives = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `id` = '$fid'");
						$results = $dsql->dsqlOper($archives, "results");
						if($results){
							$list[$key]['pic_width'] = $results[0]['width'];
							$list[$key]['pic_height'] = $results[0]['height'];
						}else{
							$list[$key]['pic_width'] = 0;
							$list[$key]['pic_height'] = 0;
						}
					}
				}

				//会员中心显示信息状态
				if($u == 1 && $userLogin->getMemberID() > -1){
					$list[$key]['arcrank'] = $val['arcrank'];
				}

				$list[$key]['pubdate']     = $val['pubdate'];

				$param = array(
					"service"     => "image",
					"template"    => "detail",
					"id"          => $val['id'],
					"flag"        => $val['flag'],
					"redirecturl" => $val['redirecturl']
				);
				$list[$key]['url'] = getUrlPath($param);

				//统计图片数量
				$sql = $dsql->SetQuery("SELECT count(`id`) count FROM `#@__imagepic` WHERE `aid` = ".$val['id']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$list[$key]['count'] = $ret[0]['count'];
				}else{
					$list[$key]['count'] = 0;
				}

				//图表信息
				if($group_img){
					$archives = $dsql->SetQuery("SELECT * FROM `#@__imagepic` WHERE `aid` = ".$val['id']." ORDER BY `id` ASC LIMIT 0, 6");
					$results = $dsql->dsqlOper($archives, "results");
					if(!empty($results)){
						$imglist = array();
						foreach($results as $k => $value){
							$imglist[$k]["path"] = getFilePath($value["picPath"]);
							$imglist[$k]["info"] = $value["picInfo"];
						}
						$list[$key]['group_img'] = $imglist;
					}
				}
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
     * 图片信息详细
     * @return array
     */
	public function detail(){
		global $dsql;
		global $userLogin;
		$articleDetail = array();
		$id = $this->param;

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//判断是否管理员已经登录
		//功能点：管理员和信息的发布者可以查看所有状态的信息
		$where = "";
		if($userLogin->getUserID() == -1){

			$where = " AND `arcrank` = 1 AND `del` = 0";

			//如果没有登录再验证会员是否已经登录
			if($userLogin->getMemberID() == -1){
				$where = " AND `arcrank` = 1 AND `del` = 0";
			}else{
				$where = " AND (`arcrank` = 1 AND `del` = 0 OR `admin` = ".$userLogin->getMemberID().")";
			}

		}

		$archives = $dsql->SetQuery("SELECT * FROM `#@__imagelist` WHERE `id` = ".$id.$where);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			global $cfg_clihost;
			$articleDetail["id"]          = $results[0]['id'];
			$articleDetail["cityid"]      = $results[0]['cityid'];
			$articleDetail["title"]       = $results[0]['title'];
			$articleDetail["subtitle"]    = $results[0]['subtitle'];
			$articleDetail["flag"]        = $results[0]['flag'];
			$articleDetail["redirecturl"] = $results[0]['redirecturl'];
			$articleDetail["litpic"]      = !empty($results[0]['litpic']) ? getFilePath($results[0]['litpic']) : "";
			$articleDetail["litpicSource"] = !empty($results[0]['litpic']) ? $results[0]['litpic'] : "";
			$articleDetail["source"]      = $results[0]['source'];
			$articleDetail["sourceurl"]   = $results[0]['sourceurl'];
			$articleDetail["writer"]      = $results[0]['writer'];
			$articleDetail["typeid"]      = $results[0]['typeid'];

			global $data;
			$data = "";
			$typeArr = getParentArr("imagetype", $results[0]['typeid']);
			$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
			$articleDetail['typeName']    = $typeArr;

			$param = array(
				"service"  => "image",
				"template" => "list",
				"typeid"   => $results[0]['typeid']
			);
			$articleDetail['typeUrl'] = getUrlPath($param);

			$articleDetail["keywords"]    = str_replace(",", " ", $results[0]['keywords']);
			$articleDetail["keywordsList"] = explode(" ", str_replace(",", " ", $results[0]['keywords']));
			$articleDetail["description"] = $results[0]['description'];
			$articleDetail["click"]       = $results[0]['click'];
			$articleDetail["color"]       = $results[0]['color'];
			$articleDetail["arcrank"]     = $results[0]['arcrank'];
			$articleDetail["pubdate"]     = $results[0]['pubdate'];

			//图表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__imagepic` WHERE `aid` = ".$id." ORDER BY `id` ASC");
			$results2 = $dsql->dsqlOper($archives, "results");

			if(!empty($results2)){
				$imglist = array();
				foreach($results2 as $key => $value){
					$imglist[$key]["pathSource"] = $value["picPath"];
					$imglist[$key]["path"] = getFilePath($value["picPath"]);
					$imglist[$key]["info"] = $value["picInfo"];

					//获取图片在数据库中的信息
					$RenrenCrypt = new RenrenCrypt();
					$fid = $RenrenCrypt->php_decrypt(base64_decode($value['picPath']));

					if(!is_numeric($fid)){
						$archives = $dsql->SetQuery("SELECT `width`, `height`, `filesize` FROM `#@__attachment` WHERE `path` = '".$value['picPath']."'");
						$results = $dsql->dsqlOper($archives, "results");
					}else{
                        $archives = $dsql->SetQuery("SELECT `width`, `height`, `filesize` FROM `#@__attachment` WHERE `id` = '$fid'");
						$results = $dsql->dsqlOper($archives, "results");
                    }
						
                    if($results){
                        $imglist[$key]['pic_width'] = $results[0]['width'];
                        $imglist[$key]['pic_height'] = $results[0]['height'];
                        $imglist[$key]['pic_size'] = sizeformat($results[0]['filesize']);
                    }else{
                        $imglist[$key]['pic_width'] = 0;
                        $imglist[$key]['pic_height'] = 0;
                        $imglist[$key]['pic_size'] = 0;
                    }
				}
			}else{
				$imglist = array();
			}

			$param = array(
				"service"     => "image",
				"template"    => "detail",
				"id"          => $id
			);
			$articleDetail['url'] = getUrlPath($param);

			$articleDetail["imglist"]     = $imglist;

		}
		return $articleDetail;
	}


	/**
	 * 获取下一条信息内容
     * @return array
	 */
	public function nextData(){
		global $dsql;
		global $userLogin;
		$articleDetail = array();
		$id = $this->param['id'];
		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		$sql = $dsql->SetQuery("select `id` from `#@__imagelist` where `id` = (select max(`id`) from `#@__imagelist` where `id` < $id)");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$this->param = $ret[0]['id'];
			$data = $this->detail();
			return $data;
		}

	}

}
