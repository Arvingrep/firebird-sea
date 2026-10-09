<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 商城模块API接口
 *
 * @version        $Id: integral.class.php 2017-11-23 下午02:08:10 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class integral {
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
     * 商城基本参数
     * @return array
     */
	public function config(){

		require(HUONIAOINC."/config/integral.inc.php");

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
		// global $customAtlasMax;           //图集数量限制
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

		// $domainInfo = getDomain('shop', 'config');
		// $customChannelDomain = $domainInfo['domain'];
		// if($customSubDomain == 0){
		// 	$customChannelDomain = "http://".$customChannelDomain;
		// }elseif($customSubDomain == 1){
		// 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
		// }elseif($customSubDomain == 2){
		// 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
		// }

		// include HUONIAOINC.'/siteModuleDomain.inc.php';
		$customChannelDomain = getDomainFullUrl('integral', $customSubDomain);

        //分站自定义配置
        $ser = 'integral';
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
				}elseif($param == "peisong"){
					$return['peisong'] = $custom_Peisong;
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
			$return['atlasMax']      = $customAtlasMax;
			$return['template']      = $customTemplate;
			$return['touchTemplate'] = $customTouchTemplate;
			$return['softSize']      = $custom_softSize;
			$return['softType']      = $custom_softType;
			$return['thumbSize']     = $custom_thumbSize;
			$return['thumbType']     = $custom_thumbType;
			$return['atlasSize']     = $custom_atlasSize;
			$return['atlasType']     = $custom_atlasType;
			$return['peisong']       = $customPeisong;
		}

		return $return;

	}

	/**
     * 商城分类
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

		$results = $dsql->getTypeList($type, "integral_type", $son, $page, $pageSize);
		if($results){
			return $results;
		}
	}

	/**
     * 积分商城分类
     * @return array
     */
	public function getTypeList(){
		global $dsql;
		$tid = (int)$this->param['tid'];

		$list = array();
		if($tid == 0){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__integral_type` WHERE `parentid` = 0 ORDER BY `weight`");
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				foreach($results as $key => $val){
					$list[$key] = array();
					$list[$key]["typeid"] = $val['id'];
					$list[$key]["typename"] = $val['typename'];

					$list_1 = array();
					$archives_1 = $dsql->SetQuery("SELECT * FROM `#@__integral_type` WHERE `parentid` = ".$val['id']." ORDER BY `weight`");
					$results_1 = $dsql->dsqlOper($archives_1, "results");
					if($results_1){
						foreach($results_1 as $key_1 => $val_1){
							$list_1[$key_1]["id"] = $val_1['id'];
							$list_1[$key_1]["typename"] = $val_1['typename'];

							$list_1[$key_1]["type"] = 0;
							$archives_2 = $dsql->SetQuery("SELECT * FROM `#@__integral_type` WHERE `parentid` = ".$val_1['id']." ORDER BY `weight`");
							$results_2 = $dsql->dsqlOper($archives_2, "results");
							if($results_2){
								$list_1[$key_1]["type"] = 1;
							}
						}
					}
					if(!empty($list_1)){
						$list[$key]["subnav"] = $list_1;
					}
				}
			}
		}else{
			$list = array();
			$archives = $dsql->SetQuery("SELECT * FROM `#@__integral_type` WHERE `parentid` = ".$tid." ORDER BY `weight`");
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				foreach($results as $key => $val){
					$list[$key]["id"] = $val['id'];
					$list[$key]["typename"] = $val['typename'];

					$list[$key]["type"] = 0;
					$archives_1 = $dsql->SetQuery("SELECT * FROM `#@__integral_type` WHERE `parentid` = ".$val['id']." ORDER BY `weight`");
					$results_1 = $dsql->dsqlOper($archives_1, "results");
					if($results_1){
						$list[$key]["type"] = 1;
					}
				}
			}
		}
		if(!empty($list)){
			return $list;
		}else{
			echo '{"state": 200, "info": "获取失败！"}';
		}
		die;


	}


	/**
     * 商品列表
     * @return array
     */
	public function slist(){
		global $dsql;
		global $userLogin;
		$pageinfo = $list = array();
		$typeid = $title = $price = $flag = $orderby = $ranking = $keywords = $state = $page = $pageSize = $where = $where1 = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$typeid         = $this->param['typeid'];
				$title          = $this->param['title'];
				$price          = $this->param['price'];
				$point          = $this->param['point'];
				$paytype        = $this->param['paytype'];
				$flag           = $this->param['flag'];
				$orderby        = $this->param['orderby'];
				$ranking        = $this->param['ranking'];
				$keywords       = $this->param['keywords'];
				$state          = $this->param['state'];
				$page           = $this->param['page'];
				$pageSize       = $this->param['pageSize'];
			}
		}

		//数据共享
		require(HUONIAOINC."/config/integral.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
			$cityid = getCityId($this->param['cityid']);
			if($cityid){
				$where .= " AND `cityid` = ".$cityid;
			}
		}

		//遍历分类
		if(!empty($typeid)){
			$ids = array();
			if(strpos($typeid, ",")){
				$ids = explode(",", $typeid);
			}else{
				$ids[] = $typeid;
			}

			$allLower = "";
			foreach ($ids as $key => $value) {
				if($dsql->getTypeList($value, "integral_type")){
					global $arr_data;
					$arr_data = array();
					$lower = arr_foreach($dsql->getTypeList($value, "integral_type"));
					$allLower .= $value.",".join(',',$lower).",";
				}else{
					$allLower .= $value.",";
				}
			}
			$allLower = substr($allLower, 0, strlen($allLower) - 1);
			$where .= " AND `typeid` in ($allLower)";
		}


		if(!empty($title)){
			$where .= " AND `title` like '%".$title."%'";
		}

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

		//积分区间
		if(!empty($point)){
			$point = explode(",", $point);
			if(empty($point[0])){
				$where .= " AND `point` < " . $point[1];
			}elseif(empty($point[1])){
				$where .= " AND `point` > " . $point[0];
			}else{
				$where .= " AND `point` BETWEEN " . $point[0] . " AND " . $point[1];
			}
		}

		//支付方式
		if(!empty($paytype)){
			if($paytype == "1"){
				$where .= " AND `price` = 0";
			}elseif($paytype == "2"){
				$where .= " AND `price` != 0";
			}
		}

		// echo $where;die;

		//属性
		if($flag || $flag == "0"){
			$flagArr = explode(",", $flag);
			if($flagArr){
				$flag = array();
				foreach ($flagArr as $key => $value) {
					$flag[$key] = "FIND_IN_SET(".$value.", `flag`)";
				}
				$where .= " AND " . join(" AND ", $flag);
			}
		}

		if(!empty($keywords)){
			$where .= " AND `title` LIKE '%$keywords%'";
		}


		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		//排序
		switch ($orderby){
			//默认
			case 0:
				$orderby = " ORDER BY `weight` DESC, `id` DESC";
				break;
			//销量降序
			case 1:
				$orderby = " ORDER BY `sales` DESC, `weight` DESC, `id` DESC";
				break;
			//销量升序
			case 2:
				$orderby = " ORDER BY `sales` ASC, `weight` DESC, `id` DESC";
				break;
			//价格升序
			case 3:
				$orderby = " ORDER BY `price` ASC, `weight` DESC, `id` DESC";
				break;
			//价格降序
			case 4:
				$orderby = " ORDER BY `price` DESC, `weight` DESC, `id` DESC";
				break;
			//时间降序
			case 5:
				$orderby = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
				break;
			//积分升序
			case 6:
				$orderby = " ORDER BY `point` ASC, `weight` DESC, `id` DESC";
				break;
			//积分降序
			case 7:
				$orderby = " ORDER BY `point` DESC, `weight` DESC, `id` DESC";
				break;
			default:
				$orderby = " ORDER BY `weight` DESC, `id` ASC";
				break;
		}


		$archives = $dsql->SetQuery("SELECT " .
									"`id`, `typeid`, `title`, `description`, `mprice`, `price`, `point`, `sales`, `inventory`, `litpic`, `pics`, `flag`, `delivery`, `freight`, `state`, `pubdate`" .
									"FROM `#@__integral_product`" .
									"WHERE " .
									"`state` = 1".$where);
		// echo $archives;die;
        //本周时间戳
        $time3 = mktime(0,0,0,date('m'),date('d')-date('N')+1,date('y'));
        $time4 = mktime(23,59,59,date('m'),date('d')-date('N')+7,date('Y'));

        $BeginDate = date('Y-m-01', strtotime(date("Y-m-d")));//本月第一天
        $overDate  = date('Y-m-d', strtotime("$BeginDate +1 month"));//本月最后一天
        $btime     = strtotime($BeginDate);
        $ovtime    = strtotime($overDate);

		if($orderby == 1 && !empty($ranking)){
			$where1 = "";
			$orderby = " ORDER BY o.`timesales` DESC";
			// 新品排行
			if($ranking == 1){
				$orderby = " ORDER BY o.`timesales` DESC, p.`id` DESC";
			}
			// 周排行
			if($ranking == 2){
				$where1 = " AND o.`orderdate` > $time3 AND o.`orderdate` < $time4";
			}
			// 月排行
			if($ranking == 3){
				$where1 = " AND  o.`orderdate` > $btime AND o.`orderdate` < $ovtime ";
			}

			$archives = $dsql->SetQuery("SELECT p.`id`, p.`typeid`, p.`title`, p.`description`, p.`mprice`, p.`price`, p.`point`, p.`sales`, p.`inventory`, p.`litpic`, p.`pics`, p.`flag`, p.`delivery`, p.`freight`, p.`state`, p.`pubdate`, o.`sales` timesales FROM `#@__integral_product` p LEFT JOIN `#@__integral_order` o ON o.`proid` = p.`id`" .
									"WHERE " .
									"p.`state` = 1 AND o.`orderstate` = 3".$where);
		}


		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);


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

		$results = $dsql->dsqlOper($archives.$where1.$orderby.$where, "results");
		// echo $archives.$where1.$orderby.$where;die;


		$param = array(
			"service"     => "integral",
			"template"    => "detail",
			"id"          => "%id%"
		);
		$urlParam = getUrlPath($param);


		if($results){
			foreach($results as $key => $val){
				$list[$key]['id']          = $val['id'];
				$list[$key]['title']       = $val['title'];
				$list[$key]['description'] = $val['description'];
				$list[$key]['typeid']      = $val['typeid'];
				$list[$key]['mprice']      = $val['mprice'];
				$list[$key]['price']       = $val['price'];
				$list[$key]['point']       = $val['point'];
				$list[$key]['sales']       = $val['sales'];
				$list[$key]['inventory']   = $val['inventory'];
				$list[$key]['delivery']    = $val['delivery'];
				$list[$key]['freight']     = $val['freight'];
				$list[$key]['litpic']      = getFilePath($val['litpic']);

				$rec   = 0;
				$tejia = 0;
				$hot   = 0;
				$flag = explode(",", $val['flag']);
				if(in_array(0, $flag)){
					$rec = 1;
				}
				if(in_array(1, $flag)){
					$tejia = 1;
				}
				if(in_array(2, $flag)){
					$hot = 1;
				}

				$list[$key]['rec']    = $rec;
				$list[$key]['tejia']  = $tejia;
				$list[$key]['hot']    = $hot;

				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__integral_common` WHERE `pid` = ".$val['id']);
				$comment = $dsql->dsqlOper($sql, "totalCount");
				$list[$key]['comment']  = $comment;


				$pics = $val['pics'];
				$imglist = array();
				if($pics){
					$pics = explode(',', $pics);
					foreach ($pics as $k => $v) {
						array_push($imglist, array(
							'path' => getFilePath($v),
							'pic' => $v
						));
					}
				}

				$list[$key]['imglist'] = $imglist;

				$list[$key]['url'] = str_replace("%id%", $val['id'], $urlParam);

			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);

	}


	/**
     * 商品详细信息
     * @return array
     */
	public function detail($id = 0){
		global $dsql;
		global $oper;
		$listingDetail = array();
		$id = empty($id) ? (is_array($this->param) ? $this->param['id'] : $this->param) : $id;

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		$where = " AND `state` = 1";
		if($oper == "user"){
			$where = "";
		}

		$archives = $dsql->SetQuery("SELECT * FROM `#@__integral_product` WHERE 1 = 1 AND `id` = ".$id.$where);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$results[0]["video"]= $results[0]['video'] ? getFilePath($results[0]['video']) : '';
			//分类名
			global $data;
			$data = "";
			$proType = getParentArr("integral_type", $results[0]["typeid"]);
			$proName = array_reverse(parent_foreach($proType, "typename"));
			$results[0]["typename"] = $proName;
			$data = "";
			$proIds = array_reverse(parent_foreach($proType, "id"));
			$results[0]["typeids"] = $proIds;

			$results[0]["litpicSource"] = $results[0]["litpic"];
			$results[0]["litpic"] = getFilePath($results[0]["litpic"]);

			//验证是否已经收藏
			$params = array(
				"module" => "integral",
				"temp"   => "detail",
				"type"   => "add",
				"id"     => $id,
				"check"  => 1
			);
			$collect = checkIsCollect($params);
			$results[0]['collect'] = $collect == "has" ? 1 : 0;

			//图集
			$imgList = array();
			$pics = $results[0]["pics"];
			if(!empty($pics)){
				$pics = explode(",", $pics);
				foreach($pics as $key => $val){
					$imgList[$key]['pathSource'] = $val;
					$imgList[$key]['path'] = getFilePath($val);
				}
			}
			$results[0]["pics"] = $imgList;


			$rec   = 0;
			$tejia = 0;
			$hot   = 0;
			$flag = explode(",", $results[0]['flag']);
			if(in_array(0, $flag)){
				$rec = 1;
			}
			if(in_array(1, $flag)){
				$tejia = 1;
			}
			if(in_array(2, $flag)){
				$hot = 1;
			}

			$results[0]['rec']    = $rec;
			$results[0]['tejia']  = $tejia;
			$results[0]['hot']    = $hot;

			//评价
			$sql = $dsql->SetQuery("SELECT `rating` FROM `#@__integral_common` c WHERE c.`ischeck` = 1 AND c.`pid` = ".$id);
			$res = $dsql->dsqlOper($sql, "results");
			$rat = $rat1 = 0;
			foreach($res as $k => $v){
				if($v['rating'] == 1){
					$rat1++;
				}
				$rat++;
			}
			//好评率
			$rating = 0;
			if($rat1 && $rat){
				$rating = number_format($rat1/$rat, 1);
			}
			$totalCommon  = $dsql->dsqlOper($sql, "totalCount");  //评价总人数

			$sql = $dsql->SetQuery("SELECT avg(c.`score1`) s1, avg(c.`score2`) s2, avg(c.`score3`) s3 FROM `#@__integral_common` c WHERE c.`ischeck` = 1 AND c.`pid` = ".$id);
			$res = $dsql->dsqlOper($sql, "results");
			$score1 = $res[0]['s1'];  //分项1
			$score2 = $res[0]['s2'];  //分项2
			$score3 = $res[0]['s3'];  //分项3


			$results[0]['totalCommon'] = $totalCommon;
			$results[0]['rating'] = number_format($rating, 1);
			$results[0]['score1'] = number_format($score1, 1);
			$results[0]['score2'] = number_format($score2, 1);
			$results[0]['score3'] = number_format($score3, 1);

			$param = array(
				"service"     => "integral",
				"template"    => "detail",
				"id"          => $id
			);
			$results[0]['url'] = getUrlPath($param);

			return $results[0];
		}else{
			return "";
		}

	}


	/**
	 * 下单
	 */
	public function deal(){
		global $dsql;
		global $userLogin;
		global $cfg_pointRatio;

		$param = $this->param;

		$id      = (int)$param['id'];			// 商品表id
		$count   = (int)$param['count'];		// 商品数量
		$address = (int)$param['address'];		// 商品数量
		$paypwd  = $param['paypwd'];			// pc端下单时验证支付密码

		$userid = $userLogin->getMemberID();

		if($userid == -1){
			return array("state" => 200, "info" => "登陆超时，请重新登陆");
		}

		//验证支付密码
		if(!empty($paypwd)){
			$archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
			$results  = $dsql->dsqlOper($archives, "results");
			$res = $results[0];
			$hash = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
			if($res['paypwd'] != $hash){
				return array("state" => 200, "info" => "支付密码输入错误，请重试！");
			}
		}

		if(empty($id) || empty($count)){
			return array("state" => 200, "info" => '购物车内容为空，下单失败！');
		}

		if(empty($address)){
			return array("state" => 200, "info" => '请填写收货地址！');
		}

		// 验证地址
		$archives = $dsql->SetQuery("SELECT * FROM `#@__member_address` WHERE `uid` = $userid AND `id` = $address");
		$userAddr = $dsql->dsqlOper($archives, "results");
		if(!$userAddr) return array("state" => 200, "info" => '会员地址库信息不存在或已删除');
		global $data;
		$data = "";
		$addrArr = getParentArr("site_area", $userAddr[0]['addrid']);
		$addrArr = array_reverse(parent_foreach($addrArr, "typename"));
		$addr    = join(" ", $addrArr);
		$address = $addr . $userAddr[0]['address'];
		$person = $userAddr[0]['person'];
		$mobile = $userAddr[0]['mobile'];
		$tel    = $userAddr[0]['tel'];
		$contact = !empty($mobile) ? $mobile . (!empty($tel) ? " / ".$tel : "") : $tel;


		$totalPrice = 0;	// 需要支付的总金额
		$totalPoint = 0;	// 需要支付的总积分

		$this->param = $id;
		$detail = $this->detail();
		if(!$detail){
			if($check){
				return array("state" => 200, "info" => $title."不存在或已下架，请移除此商品");
			}else{
				die($title."不存在或已下架，请移除此商品");
			}
		}

		$title     = $detail['title'];
		$price     = $detail['price'];
		$point     = $detail['point'];
		$delivery  = $detail['delivery'];
		$freight   = $detail['freight'];
		$inventory = $detail['inventory'];


		if($count > $inventory){
			return array("state" => 200, "info" => $title."库存不足，仅剩".$inventory."件");
		}

		// 现金部分
		$totalPrice = $price * $count;
		// 运费
		$totalPrice += $amount + $freight;
		$totalPoint += $point * $count;

		$priceinfo = array();
		$priceinfo = serialize($priceinfo);

		// 指定骑手
		$courier = 0;

		// 判断是否重复下单
		$sql = $dsql->SetQuery("SELECT `id`, `ordernum` FROM `#@__integral_order` WHERE `userid` = $userid AND `proid` = $id AND `orderstate` = 0");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$oid = $ret[0]['id'];
			$sql = $dsql->SetQuery("DELETE FROM `#@__integral_order` WHERE `id` = " . $oid);
			$dsql->dsqlOper($sql, "update");
		}

		// 生成订单号
		$ordernum = create_ordernum();
		$date = GetMkTime(time());

		$archives = $dsql->SetQuery("INSERT INTO `#@__integral_order` (`ordernum`, `userid`, `proid`, `price`, `point`, `count`, `orderstate`, `orderdate`, `paytype`, `people`, `address`, `contact`, `note`, `freight`, `priceinfo`, `courier`) VALUES ('$ordernum', '$userid', '$id', '$price', '$point', '$count', 0, '$date', '', '$person', '$address', '$contact', '$note', '$freight', '$priceinfo', '$courier')");
		$orderid  = $dsql->dsqlOper($archives, "lastid");
		if(is_numeric($orderid)){
			return $ordernum;
		}else{
			return array("state" => 200, "info" => "下单失败");
		}


	}

	/**
	 * 支付
	 */
	public function pay(){
		global $dsql;
		global $userLogin;
		global $cfg_pointRatio;

		$userid = $userLogin->getMemberID();
		if($userid == -1) return array("state" => 200, "info" => "登陆超时，请重新登陆");

		$param = array(
			"service" => "integral",
			"index" => "index"
		);
		$url = getUrlPath($param);

		$param = $this->param;

		$ordernum   = $param['ordernum'];
		$paytype    = $param['paytype'];
		$paypwd     = $param['paypwd'];

		if(empty($ordernum)){
			header("location:$url");
			die;
		}

		if(empty($paytype)) return array("state" => 200, "info" => "请选择支付方式");
		if(empty($paypwd)) return array("state" => 200, "info" => "请填写支付密码");

		$archives = $dsql->SetQuery("SELECT * FROM `#@__integral_order` WHERE `userid` = '$userid' AND `ordernum` = '$ordernum' AND `orderstate` = 0");
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			$order  = $results[0];
			$proid  = $order['proid'];
			$price  = $order['price'];
			$point  = $order['point'];
			$count  = $order['count'];


			$errUrl = getUrlPath(array("service" => "member", "type" => "user", "template" => "order"));

			// 再次验证商品及库存
			$this->param = $proid;
			$detail = $this->detail();
			if($detail){
				$title = $detail['title'];

				if($detail['inventory'] < $count){
					echo '<script>alert("抱歉，此商品库存不足，仅剩'.$detail['inventory'].'件");location.href = "'.$errUrl.'";</script>';
					die;
				}

				// 计算金额
				$payAmount = $price * $count + $order['freight'];
				$payPoint  = $point * $count;

				// 使用积分
				if($payPoint){
					$userinfo = $userLogin->getMemberInfo();
					if($userinfo['point'] >= $payPoint){
						//验证支付密码
						$archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
						$results  = $dsql->dsqlOper($archives, "results");
						$res = $results[0];
						$hash = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
						if($res['paypwd'] != $hash){
							echo '<script>alert("支付密码输入错误，请重试！");history.go(-1);</script>';
							die;
						}
					}else{
						echo '<script>alert("您的积分不足，支付失败！");history.go(-1);</script>';
						die;
					}
				}

				// 更新支付信息
				$paytype_ = $payAmount > 0 ? $paytype : "point";
				$sql = $dsql->SetQuery("UPDATE `#@__integral_order` SET `paytype` = '$paytype_' WHERE `ordernum` = '$ordernum'");
				$dsql->dsqlOper($sql, "update");

				$title = "积分商城兑换商品";

				// 需要支付现金
				if($payAmount > 0){
				    $urlParam = array(
				        'service'    => 'integral',
                        'template'   => 'detail',
                        'id' => $proid
                    );
					createPayForm("integral", $ordernum, $payAmount, $paytype, $title,$urlParam);
				// 积分付清
				}else{
					$date = GetMkTime(time());
					$sql = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('integral', '$ordernum', '$userid', '$ordernum', 0, 'point', 1, $date)");
					$dsql->dsqlOper($sql, "results");

					//执行支付成功的操作
					$this->param = array(
						"paytype" => 'point',
						"ordernum" => $ordernum
					);
					$this->paySuccess();

					if($_SESSION['awardlegouUrl']!=''){
						header("location:".$_SESSION['awardlegouUrl']);
					}
					$param = array(
						"service" => "integral",
						"template" => "payreturn",
						"ordernum" => $ordernum
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

					header("location:".$url);
				}


			}else{
				echo '<script>alert("抱歉，此商品已删除或下架");location.href = "'.$errUrl.'";</script>';
				die;
			}
		}else{

			$param = array(
				"service" => "integral",
				"template" => "payreturn",
				"ordernum" => $ordernum
			);
			$url = getUrlPath($param);

			header("location:" . $url);
			die;
		}

	}

	/**
	 * 支付成功
	 */
	public function paySuccess(){

		// //初始化日志
		// require_once HUONIAOROOT."/api/payment/log.php";
		// $logHandler= new CLogFileHandler('integral_pay.log');
		// $log = Log::Init($logHandler, 15);
		global $userLogin;
		global $cfg_pointName;

		$param = $this->param;
		if(!empty($param)){
			global $dsql;
			global $cfg_basehost;

			$ordernum = $param['ordernum'];
			$date     = GetMkTime(time());

			//查询订单信息
			$archive = $dsql->SetQuery("SELECT `body`, `amount`,`id` FROM `#@__pay_log` WHERE `ordertype` = 'integral' AND `ordernum` = '$ordernum' AND `state` = 1");
			$results = $dsql->dsqlOper($archive, "results");

			if($results){

			    $pid = $results[0]['id'];
				$sql = $dsql->SetQuery("SELECT `id`, `price`, `point`, `proid`, `count`, `userid`, `freight` FROM `#@__integral_order` WHERE `ordernum` = '$ordernum' AND `orderstate` = 0");

				$res = $dsql->dsqlOper($sql, "results");
				if($res){
					$orderid  = $res[0]['id'];
					$userid  = $res[0]['userid'];
					$proid   = $res[0]['proid'];
					$price   = $res[0]['price'];
					$point   = $res[0]['point'];
					$count   = $res[0]['count'];
					$freight = $res[0]['freight'];

					$sql = $dsql->SetQuery("UPDATE `#@__integral_order` SET `orderstate` = 1, `paydate` = '$date' WHERE `ordernum` = '$ordernum'");
					$dsql->dsqlOper($sql, "update");

					$payPoint = $point * $count;
					$payAmount = $price * $count + $freight;

					$modulename = getModuleTitle(array('name' => 'integral'));
					$info    =  $modulename."消费：";
					$title   = $modulename."消费";
					$_info   = $modulename."返" . $cfg_pointName;

					// 扣除积分
					if($point){
					    global $userLogin;
						$sql = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - $payPoint WHERE `id` = $userid");
						$dsql->dsqlOper($sql, "update");
                        $user  = $userLogin->getMemberInfo($userid);
                        $userpoint = $user['point'];
//                        $pointuser = (int)($userpoint-$payPoint);
						// 保存操作日志
						$sql = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '0', '$payPoint', '$info.$ordernum', '$date','xiaofei','$userpoint')");
						$dsql->dsqlOper($sql, "update");
					}

					// 保存操作日志
                    $paytype = $param['paytype'];
					if($paytype=="money"){
                        if($payAmount > 0){
                            $user  = $userLogin->getMemberInfo($userid);
                            $usermoney = $user['money'];
                            $money  = sprintf('%.2f',($usermoney-$payAmount));
                            $sql = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0', '$payAmount', '$info.$ordernum', '$date','integral','xiaofei','$pid','$title','$ordernum','$money')");
                            $dsql->dsqlOper($sql, "update");
                        }
                    }

					// 更新库存,销量
					$sql = $dsql->SetQuery("UPDATE `#@__integral_product` SET `inventory` = `inventory` - $count, `sales` = `sales` + $count WHERE `id` = '$proid'");
					$dsql->dsqlOper($sql, "update");

					//查询商品信息
					$rebate = $repoint = 0;
					$sql = $dsql->SetQuery("SELECT `rebate`, `repoint` FROM `#@__integral_product` WHERE `id` = $proid");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$rebate = $ret[0]['rebate'];
						$repoint = $ret[0]['repoint'];
					}

					//返积分商品不需要分佣
					if(!$rebate){
	                    include HUONIAOINC."/config/integral.inc.php";
	                    $fenXiao = (int)$customfenXiao;
	                    //分佣 开关
	                    $paramarr['amount'] = $payAmount;
	                    if($fenXiao ==1){
	                        (new member())->returnFxMoney("integral", $userid , $ordernum,$paramarr);
	                    }

					//返积分的商品，更新订单状态，返积分
					}elseif($repoint > 0){
                        global  $userLogin;
						$sql = $dsql->SetQuery("UPDATE `#@__integral_order` SET `orderstate` = 3 WHERE `ordernum` = '$ordernum'");
						$dsql->dsqlOper($sql, "update");

						$sql = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + $repoint WHERE `id` = $userid");
						$dsql->dsqlOper($sql, "update");
                        $user  = $userLogin->getMemberInfo($userid);
                        $userpoint = $user['point'];
//                        $pointuser = (int)($userpoint+$repoint);
						// 保存操作日志
						$sql = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$repoint', '$_info.$ordernum', '$date','zengsong','$userpoint')");
						$dsql->dsqlOper($sql, "update");

					}

					//查询产品信息
					$sql = $dsql->SetQuery("SELECT p.`cityid`, a.`typename`, p.`title` FROM `#@__integral_product` p LEFT JOIN `#@__site_area` a ON a.`id` = p.`cityid` WHERE p.`id` = $proid");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){

						$cityid   = $ret[0]['cityid'];
						$cityName = $ret[0]['typename'];
						$title    = $ret[0]['title'];

						$uinfo = $userLogin->getMemberInfo($userid);
						$username = $uinfo['username'];

						$param = array(
				        	'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
				        	'cityid' => $cityid,
				            'notify' => '管理员消息通知',
				            'fields' =>array(
					            'contentrn'  => $cityName.'分站——'.$modulename.'模块——用户:'.$username.' 支付一笔订单，商品：'.$title,
					            'date' => date("Y-m-d H:i:s", time()),
					        )
				        );

						updateAdminNotice("integral", "detail", $param);
					}

					//支付成功，会员消息通知
					$paramUser = array(
						"service"  => "member",
						"type"     => "user",
						"template" => "orderdetail",
						"action"   => "integral",
						"id"       => $orderid
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
						"amount" => $payAmount,
						"title" => $modulename . "订单",
						"fields" => array(
							'keyword1' => '商品信息',
							'keyword2' => '付款时间',
							'keyword3' => '订单金额',
							'keyword4' => '订单状态'
						)
					);

					updateMemberNotice($userid, "会员-订单支付成功", $paramUser, $config,'','',0,1);

				}
			}

		}

	}

	/**
     * 商城订单列表
     * @return array
     */
	public function orderList(){
		global $dsql;
		$pageinfo = $list = array();
		$store = $state = $userid = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$state    = $this->param['state'];
				$userid   = $this->param['userid'];
				$ordernum = $this->param['ordernum'];
				$page     = $this->param['page'];
				$pageSize = $this->param['pageSize'];
			}
		}

		if(empty($userid)){
			global $userLogin;
			$userid = $userLogin->getMemberID();
		}
		if(empty($userid)) return array("state" => 200, "info" => '会员ID不得为空！');

		$where = ' `userid` = '.$userid;

		$archives = $dsql->SetQuery("SELECT " .
								"`id`, `ordernum`, `userid`, `proid`, `price`, `point`, `count`, `exp-company`, `exp-number`, `freight`, `orderstate`, `orderdate`, `paytype`, `exp-date`, `common`, `freight` " .
								"FROM `#@__integral_order` " .
								"WHERE".$where);


		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");
		//总分页数
		$totalPage = ceil($totalCount/$pageSize);

		//未付款
		$unpaid = $dsql->dsqlOper($archives." AND `orderstate` = 0", "totalCount");
		//未使用
		$ongoing = $dsql->dsqlOper($archives." AND `orderstate` = 1", "totalCount");
		//已使用
		$success = $dsql->dsqlOper($archives." AND `orderstate` = 3", "totalCount");
		//等待退款
		// $refunded = $dsql->dsqlOper($archives." AND `ret-state` = 1", "totalCount");
		//待评价
		$rates = $dsql->dsqlOper($archives." AND `orderstate` = 3 AND `common` = 0", "totalCount");
		//已发货/待收货
		$recei = $dsql->dsqlOper($archives." AND `orderstate` = 6 AND `exp-date` != 0", "totalCount");
		//退款成功
		$closed = $dsql->dsqlOper($archives." AND `orderstate` = 7", "totalCount");
		//关闭/失败
		$cancel = $dsql->dsqlOper($archives." AND `orderstate` = 10", "totalCount");

		if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

		$pageinfo = array(
			"page" => $page,
			"pageSize" => $pageSize,
			"totalPage" => $totalPage,
			"totalCount" => $totalCount,
			"unpaid"   => $unpaid,
			"ongoing"  => $ongoing,
			"success"  => $success,
			// "refunded" => $refunded,
			"rates"    => $rates,
			"recei"    => $recei,
			"closed"   => $closed,
			"cancel"   => $cancel
		);

		$where = "";
		if($state != "" && $state != 4 && $state != 5 && $state != 6){
			$where = " AND `orderstate` = " . $state;
		}

		//退款
		if($state == 4){
			$where = " AND `ret-state` = 1";
		}

		//待评价
		if($state == 5){
			$where = " AND `orderstate` = 3 AND `common` = 0";
		}

		//已发货
		if($state == 6){
			$where = " AND `orderstate` = 6 AND `exp-date` != 0";
		}

		$atpage = $pageSize*($page-1);
		$where .= " ORDER BY `id` DESC LIMIT $atpage, $pageSize";

		$results = $dsql->dsqlOper($archives.$where, "results");
		if($results){

			$param = array(
				"service"     => "integral",
				"template"    => "detail",
				"id"          => "%id%"
			);
			$urlParam = getUrlPath($param);

			$param = array(
				"service"     => "integral",
				"template"    => "pay",
				"param"       => "ordernum=%id%"
			);
			$payurlParam = getUrlPath($param);

			$param = array(
				"service"  => "integral",
				"template" => "detail",
				"id"       => "%id%",
			);
			$url = getUrlPath($param);

			$i = 0;
			foreach($results as $key => $val){
				$list[$key]['id']          = $val['id'];
				$list[$key]['proid']       = $val['proid'];
				$list[$key]['price']       = $val['price'];
				$list[$key]['point']       = $val['point'];
				$list[$key]['count']       = $val['count'];
				$list[$key]['freight']     = $val['freight'];
				$list[$key]['ordernum']    = $val['ordernum'];
				$list[$key]['orderstate']  = $val['orderstate'];
				$list[$key]['orderdate']   = $val['orderdate'];
				$list[$key]['expdate']   = $val['exp-date'];
				$list[$key]['expcompany']   = $val['exp-company'];
				$list[$key]['expnumber']   = $val['exp-number'];

				//支付方式
				$paySql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$val["paytype"]."'");
				$payResult = $dsql->dsqlOper($paySql, "results");
				if(!empty($payResult)){
					$list[$key]["paytype"]   = $payResult[0]["pay_name"];
				}else{
					global $cfg_pointName;
					$payname = "";
					if($val["paytype"] == "point,money"){
						$payname = $cfg_pointName."+余额";
					}elseif($val["paytype"] == "point"){
						$payname = $cfg_pointName;
					}elseif($val["paytype"] == "money"){
						$payname = "余额";
					}
					$list[$key]["paytype"]   = $payname;
				}

				$list[$key]['totalPayPrice']   = $val['price'] * $val['count'] + $val['freight'];


				$list[$key]['url'] = str_replace("%id%", $val['proid'], $url);

				$list[$key]['product']     = $this->detail($val['proid']);

				// 未付款的提供付款链接
				$payUrl = "";
				if($val['orderstate'] == 0){
					$param = array(
						"service"  => "integral",
						"template" => "confirm-order",
						"param"    => "id=".$val['proid']."&count=".$val['count'],
					);
					$url = getUrlPath($param);
					$payUrl = $url;
				}
				$list[$key]['payUrl'] = $payUrl;
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);

	}


	/**
     * 商城订单详细
     * @return array
     */
	public function orderDetail(){
		global $dsql;
		$orderDetail = $cardnum = array();
		$id = $this->param;

		global $userLogin;
		$userid = $userLogin->getMemberID();

		if($userid == -1) return array("state" => 200, "info" => '请先登录！');
		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		//主表信息
		$archives = $dsql->SetQuery("SELECT o.*, l.`amount` FROM `#@__integral_order` o LEFT JOIN `#@__pay_log` l ON l.`body` = o.`ordernum` WHERE o.`userid` = '$userid' AND o.`id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){
			$results = $results[0];

			$orderDetail["ordernum"]   = $results["ordernum"];
			$orderDetail["orderstate"] = $results["orderstate"];
			$orderDetail["orderdate"]  = $results["orderdate"];
			$orderDetail["price"]      = $results["price"];
			$orderDetail["point"]      = $results["point"];
			$orderDetail["count"]      = $results["count"];
			$orderDetail["freight"]    = $results["freight"];
			$orderDetail["common"]     = $results["common"];

			$priceinfo                 = unserialize(empty($results['priceinfo']) ? array() : $results["priceinfo"]);
			$orderDetail["priceinfo"]  = $priceinfo;

			$auth_hui = 0;
			if($priceinfo){
				foreach ($priceinfo as $key => $value) {
					$auth_hui += $value['amount'];
				}
			}

			//配送信息
			$orderDetail["username"]    = aesDecrypt($results["people"]);
			$orderDetail["useraddr"]    = aesDecrypt($results["address"]);
			$orderDetail["usercontact"] = aesDecrypt($results["contact"]);
			$orderDetail["note"]        = $results["note"];
			$orderDetail["freight"]     = $results["freight"];


			//未付款的提供付款链接
			if($results['orderstate'] == 0){
				$RenrenCrypt = new RenrenCrypt();
				$encodeid = base64_encode($RenrenCrypt->php_encrypt($results["ordernum"]));

				$param = array(
					"service"  => "integral",
					"template" => "confirm-order",
					"param"    => "id=".$results['proid']."&count=".$results['count'],
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
					$payname = $cfg_pointName."+余额";
				}elseif($results["paytype"] == "point"){
					$payname = $cfg_pointName;
				}elseif($results["paytype"] == "money"){
					$payname = "余额";
				}
				$orderDetail["paytype"]   = $payname;
			}

			$orderDetail["paydate"]   = $results["paydate"];

			//快递公司&单号
			$orderDetail["expCompany"] = $results["exp-company"];
			$orderDetail["expNumber"]  = $results["exp-number"];
			$orderDetail["expDate"]    = $results["exp-date"];

			$orderDetail["peisongid"] = $results["peisongid"];
			$orderDetail["peidate"]   = $results["peidate"];
			$orderDetail["songdate"]  = $results["songdate"];
			$orderDetail["okdate"]    = $results["okdate"];


			$peisongname = "";
			if($results['peisongid']){
				$sql = $dsql->SetQuery("SELECT `name` FROM `#@__waimai_courier` WHERE `id` = ".$results['peisongid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$peisongname = $ret[0]['name'];
				}
			}
			$orderDetail['peisongname'] = $peisongname;

			$orderDetail['now'] = GetMkTime(time());


			//商品列表
			$totalPoint = 0;
			$totalBalance = 0;
			$totalPayPrice = 0;

			$totalPoint = $results['point'] * $results['count'];
			$totalPayPrice = $results['price'] * $results['count'] + $results['freight'] - $auth_hui;

			$orderDetail['product'] = $this->detail($results['proid']);
			$orderDetail['totalPayPrice'] = sprintf("%.2f", $totalPayPrice);
			$orderDetail['totalPayPoint'] = $totalPoint;

		}

		return $orderDetail;
	}


	/**
	 * 买家确认收货
	 */
	public function receipt(){
		global $dsql;
		global $userLogin;
		global $integral_autoReceiptUserID;

		$id = $this->param['id'];

		if(empty($id)) return array("state" => 200, "info" => '操作失败，参数传递错误！');

		//获取用户ID、如果是系统自动执行收货功能，uid就为integral_autoReceipt.php中定义的全局变量
		$uid = $integral_autoReceiptUserID ? $integral_autoReceiptUserID : $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 200, "info" => '登录超时，请重新登录！');
		}

		//验证订单
		$archives = $dsql->SetQuery("SELECT o.`id` FROM `#@__integral_order` o WHERE o.`id` = '$id' AND o.`userid` = '$uid' AND o.`orderstate` = 6");
		$results  = $dsql->dsqlOper($archives, "results");

		if($results){

			$date = GetMkTime(time());

			//更新订单状态
			$sql = $dsql->SetQuery("UPDATE `#@__integral_order` SET `orderstate` = '3' WHERE `id` = ".$id);
			$up = $dsql->dsqlOper($sql, "update");

			return "操作成功！";

		}else{
			return array("state" => 200, "info" => '操作失败，请核实订单状态后再操作！');
		}
	}


	/**
		* 取消订单-直接删除
		* @return array
		*/
	public function cancelOrder(){
		global $dsql;
		global $userLogin;

		$id = $this->param['id'];

		$userid = $userLogin->getMemberID();

		if($userid == -1) return array("state" => 200, "info" => '登陆超时，请重新登陆');

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		$sql = $dsql->SetQuery("DELETE FROM `#@__integral_order` WHERE `id` = $id AND `userid` = $userid");
	  	$ret = $dsql->dsqlOper($sql, "update");
	  	if($ret == "ok"){
	  		return "操作成功";
	  	}else{
	  		return array("state" => 200, "info" => "操作失败");
	  	}

	}

}
