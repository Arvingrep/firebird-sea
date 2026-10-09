<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 报刊模块API接口
 *
 * @version        $Id: paper.class.php 2014-4-3 下午23:44:15 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class paper {
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
     * 报刊基本参数
     * @return array
     */
	public function config(){

		require(HUONIAOINC."/config/paper.inc.php");

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

		// $domainInfo = getDomain('paper', 'config');
		// $customChannelDomain = $domainInfo['domain'];
		// if($customSubDomain == 0){
		// 	$customChannelDomain = "http://".$customChannelDomain;
		// }elseif($customSubDomain == 1){
		// 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
		// }elseif($customSubDomain == 2){
		// 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
		// }

		// include HUONIAOINC.'/siteModuleDomain.inc.php';
		$customChannelDomain = getDomainFullUrl('paper', $customSubDomain);

        //分站自定义配置
        $ser = 'paper';
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
				}elseif($param == "atlasSize"){
					$return['atlasSize'] = $custom_atlasSize;
				}elseif($param == "atlasType"){
					$return['atlasType'] = $custom_atlasType;
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
			$return['atlasSize']     = $custom_atlasSize;
			$return['atlasType']     = $custom_atlasType;
		}

		return $return;

	}


	/**
     * 报刊公司
     * @return array
     */
	public function store(){
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

		$where = " WHERE `state` = 1";

		//数据共享
		require(HUONIAOINC."/config/paper.inc.php");
		$dataShare = (int)$customDataShare;

		if(!$dataShare){
			$cityid = getCityId($this->param['cityid']);
			if($cityid){
				$where .= " AND `cityid` = ".$cityid;
			}
		}

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic` FROM `#@__paper_company` $where ORDER BY `weight` DESC, `id` DESC");

		//总条数
		// $totalCount = $dsql->dsqlOper($archives, "totalCount");
		$arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__paper_company` $where");
		$totalCount = getCache("paper_company_total", $arc, 86400, array("name" => "total", "savekey" => 1));
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

		// $results = $dsql->dsqlOper($archives.$where, "results");
		$results = getCache("paper_company_list", $archives.$where, 86400);

		$list = array();
		if($results){
			foreach($results as $key => $val){
				$list[$key]['id'] = $val['id'];
				$list[$key]['title'] = $val['title'];
				$list[$key]['pinyin'] = getPinyin($val['title']);
				$list[$key]['litpic'] = getFilePath($val["litpic"]);

				$param = array(
					"service"     => "paper",
					"template"    => "list",
					"id"          => $val['id']
				);
				$list[$key]['url'] = getUrlPath($param);

				//查询最新一期报刊信息
				$sql = $dsql->SetQuery("SELECT `id`, `date`, `title`, `litpic` FROM `#@__paper_forum` WHERE `company` = ".$val['id']." AND `state` = 1 ORDER BY `date` DESC, `weight` DESC, `id` ASC LIMIT 1");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){

					$param = array(
						"service"     => "paper",
						"template"    => "forum",
						"id"          => $ret[0]['id']
					);

					$list[$key]['forum'] = array(
						"date"   => date("Y-m-d", $ret[0]['date']),
						"title"  => $ret[0]['title'],
						"litpic" => getFilePath($ret[0]['litpic']),
						"url"    => getUrlPath($param)
					);
				}
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
     * 报刊版面
     * @return array
     */
	public function forumList(){
		global $dsql;
		$pageinfo = $list = array();
		$company = $date = $page = $pageSize = $where = "";

		if(!empty($this->param)){
			if(!is_array($this->param)){
				return array("state" => 200, "info" => '格式错误！');
			}else{
				$company   = $this->param['company'];
				$date      = $this->param['date'];
				$page      = $this->param['page'];
				$list      = $this->param['list'];
				$keywords  = $this->param['keywords'];
				$pageSize  = $this->param['pageSize'];
			}
		}

		if(empty($company)) return array("state" => 200, "info" => '报刊公司不得为空！');
		//if(empty($date)) return array("state" => 200, "info" => '日期不得为空！');

		$where = " WHERE `state` = 1 AND `company` = $company";

		if(!empty($date)){
			$where .= " AND `date` = ". GetMkTime($date);
		}

		if($keywords){
			$where .= " AND `title` LIKE '%$keywords%'";
		}

		$orderby = " ORDER BY `weight` DESC, `id` DESC";

		$pageSize = empty($pageSize) ? 10 : $pageSize;
		$page     = empty($page) ? 1 : $page;

		if($list){
			$archives = $dsql->SetQuery("SELECT `id`, `date`, `title`, `type`, `litpic` FROM `#@__paper_forum`".$where.$orderby);
		}else{
			$archives = $dsql->SetQuery("SELECT `id`, `date`, `title`, `type`, `litpic` FROM `#@__paper_forum`".$where." GROUP BY `date`".$orderby);
		}
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
				$list[$key]['date'] = date("Y-m-d", $val['date']);
				$list[$key]['title'] = $val['title'];
				$list[$key]['type'] = $val['type'];
				$list[$key]['litpic'] = getFilePath($val['litpic']);

				$param = array(
					"service"     => "paper",
					"template"    => "forum",
					"id"          => $val['id']
				);
				$list[$key]['url'] = getUrlPath($param);
			}
		}

		return array("pageInfo" => $pageinfo, "list" => $list);
	}


	/**
     * 版面内容列表
     * @return array
     */
	public function contentList(){
		global $dsql;
		$id = $this->param['id'];
		$pic_width = $this->param['pic_width'];
		$pic_height = $this->param['pic_height'];
		$des_count = (int)$this->param['des_count'];
		$des_count = $des_count ? $des_count : 120;

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		$archives = $dsql->SetQuery("SELECT `id`, `forum`, `title`, `coor`, `body`, `litpic`, `pubdate` FROM `#@__paper_content` WHERE `state` = 1 AND `forum` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		$list = array();
		if($results){
			foreach ($results as $key => $value) {
				$list[$key]['id'] = $value['id'];
				$list[$key]['title'] = $value['title'];
				$list[$key]['pubdate'] = $value['pubdate'];
				$list[$key]['litpic'] = $value['litpic'] ? getFilePath($value['litpic']) : "";
				$list[$key]['description'] = cn_substrR(strip_tags($value['body']), $des_count);
				$coor = explode(",", $value['coor']);

				$pwidth = 600;
				$pheight = 900;
				$sql = $dsql->SetQuery("SELECT `litpic` FROM `#@__paper_forum` WHERE `id` = ".$value['forum']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					//获取图片在数据库中的信息
					$RenrenCrypt = new RenrenCrypt();
					$fid = $RenrenCrypt->php_decrypt(base64_decode($ret[0]['litpic']));

					if(is_numeric($fid)){
						$archives = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `id` = '$fid'");
						$results = $dsql->dsqlOper($archives, "results");
						if($results){
							$pwidth = $results[0]['width'];
							$pheight = $results[0]['height'];
						}
					}else{
						$rpic = str_replace('/uploads', '', $ret[0]["litpic"]);
						$sql = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `path` = '$rpic'");
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							$pwidth = $ret[0]['width'];
							$pheight = $ret[0]['height'];
						}
					}
				}

				$list[$key]['size'] = array('width' => $pwidth, 'height' => $pheight);
				$list[$key]['position'] = $coor;

				$list[$key]['coor'] = array(
					"left" => ($pic_width  / $pwidth) * $coor[0],
					"top" => ($pic_height / $pheight) * $coor[1],
					"right" => ($pic_width  / $pwidth) * ($coor[0] + $coor[2]),
					"bottom" => ($pic_height / $pheight) * ($coor[1] + $coor[3]),
					"width" => ($pic_width  / $pwidth) * $coor[2],
					"height" => ($pic_height / $pheight) * $coor[3]
				);

				$param = array(
					"service"     => "paper",
					"template"    => "content",
					"id"          => $value['id']
				);
				$list[$key]['url'] = getUrlPath($param);
			}
		}
		return $list;
	}


	/**
     * 版面内容
     * @return array
     */
	public function forumDetail(){
		global $dsql;
		$id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

		$archives = $dsql->SetQuery("SELECT * FROM `#@__paper_content` WHERE `state` = 1 AND `id` = ".$id);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){
			return $results[0];
		}
	}

	/**
	 * 版面内容列表-不筛选版面
	 */
	public function alist(){
		global $dsql;
		$date     = $this->param['date'];
		$keywords = $this->param['keywords'];
		$page     = $this->param['page'];
		$pageSize = $this->param['pageSize'];
		$des_count = (int)$this->param['des_count'];
		$des_count = $des_count ? $des_count : 120;

        $page = empty($page) ? 1 : $page;
        $pageSize = empty($pageSize) ? 10 : $pageSize;

        $where = " AND c.`state` = 1 AND f.`state` = 1";

        if($keywords){
        	$where .= " AND a.`title` LIKE '%$keywords%'";
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
        $bannian   = strtotime("-6 month");   //半年

        if(!empty($date)){
			if($date == "today"){
				$where .= " AND f.`date` > $todayk AND f.`date` < $todaye";
			}elseif($date == "week"){
				$where .= " AND f.`date` > $time1 AND f.`date` < $time2";
			}elseif($date == "month"){
				$where .= " AND f.`date` > $time3 AND f.`date` < $time4";
			}elseif($date == "halfyear"){
				$where .= " AND f.`date` <  $todayk AND f.`date` > $bannian";
			}else{
				$where .= " AND `date` = ". GetMkTime($date);
			}
		}
		$arc = $dsql->SetQuery("SELECT COUNT(a.`id`) total FROM `#@__paper_content` a LEFT JOIN `#@__paper_forum` f ON f.`id` = a.`forum` LEFT JOIN `#@__paper_company` c ON c.`id` = f.`company` WHERE a.`state` = 1".$where);
		$totalCount = $dsql->dsqlOper($arc, "results")[0]['total'];
		//总分页数
		$totalPage = ceil($totalCount / $pageSize);

		if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

		$pageinfo = array(
		    "page" => $page,
		    "pageSize" => $pageSize,
		    "totalPage" => $totalPage,
		    "totalCount" => $totalCount
		);

        $order = " ORDER BY `id` DESC";
        $atpage = $pageSize*($page-1);
        $where = $where.$order." LIMIT $atpage, $pageSize";

		$archives = $dsql->SetQuery("SELECT a.`id`, a.`forum`, a.`title`, a.`coor`, a.`body`, a.`litpic`, a.`pubdate`, c.`title` company FROM `#@__paper_content` a LEFT JOIN `#@__paper_forum` f ON f.`id` = a.`forum` LEFT JOIN `#@__paper_company` c ON c.`id` = f.`company` WHERE a.`state` = 1".$where);
		$results  = $dsql->dsqlOper($archives, "results");
		$list = array();
		if($results){
			foreach ($results as $key => $value) {
				$list[$key]['id'] = $value['id'];
				$list[$key]['title'] = $value['title'];
				$list[$key]['company'] = $value['company'];
				$list[$key]['pubdate'] = $value['pubdate'];
				$list[$key]['litpic'] = $value['litpic'] ? getFilePath($value['litpic']) : "";
				$list[$key]['description'] = cn_substrR(strip_tags($value['body']), $des_count);

				$param = array(
					"service"     => "paper",
					"template"    => isMobile() ? "content" : "content_detail",
					"id"          => $value['id']
				);
				$list[$key]['url'] = getUrlPath($param);
			}
		}
		return array("pageInfo" => $pageinfo, "list" => $list);
	}

	/**
	 * 文章详情
	 */
	public function detail()
	{
		global $dsql;
		$id = is_array($this->param) ? (int)$this->param['id'] : (int)$this->param;
		if($id){
			$where = " AND a.`state` = 1 AND c.`state` = 1 AND f.`state` = 1";
			$archives = $dsql->SetQuery("SELECT a.*, c.`title` company, c.`id` companyid FROM `#@__paper_content` a LEFT JOIN `#@__paper_forum` f ON f.`id` = a.`forum` LEFT JOIN `#@__paper_company` c ON c.`id` = f.`company` WHERE a.`id` = $id".$where);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$companyUrl = getUrlPath(array("service" => "paper", "template" => "list", "id" => $results[0]['companyid']));
				$results[0]['companyUrl'] = $companyUrl;
				return $results[0];
			}
		}
	}

}
