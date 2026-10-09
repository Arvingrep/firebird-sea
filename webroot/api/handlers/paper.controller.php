<?php

/**
 * huoniaoTag模板标签函数插件-报刊模块
 *
 * @param $params array 参数集
 * @return array
 */
function paper($params, $content = "", &$smarty = array(), &$repeat = array()){
	extract ($params);
	$service = "paper";
	if(empty($action)) return '';
	global $huoniaoTag;
	global $dsql;

	//获取指定报刊公司
	if($action == "list"){

        $id = (int)$id;

		//404
		if(empty($id)){
			header("location:".$cfg_basehost."/404.html");
		}		

		$huoniaoTag->assign("date", GetMkTime($date));
		$huoniaoTag->assign("keywords", $keywords);

		$sql = $dsql->SetQuery("SELECT `title`, `litpic`, `cityid` FROM `#@__paper_company` WHERE `id` = $id AND `state` = 1");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret && is_array($ret)){
			$data = $ret[0];

			detailCheckCity("paper", $id, $data['cityid'], "list");

			$huoniaoTag->assign("id", $id);
			$huoniaoTag->assign("title", $data['title']);
			$huoniaoTag->assign("litpic", getFilePath($data['litpic']));

		}else{
			header("location:".$cfg_basehost."/404.html");
		}
		return;

	//报刊详细
	}elseif($action == "forum"){

		//404
		if(empty($id)){
			header("location:".$cfg_basehost."/404.html");
		}

		$huoniaoTag->assign("id", $id);

		$weekarray=array("日","一","二","三","四","五","六");
		$huoniaoTag->assign("week", $weekarray[date("w")]);

		$sql = $dsql->SetQuery("SELECT c.`id` cid, c.`title` company, c.`cityid`, f.`title`, f.`date`, f.`litpic`, f.`seotitle`, f.`keywords`, f.`description`, f.`pdf` FROM `#@__paper_forum` f LEFT JOIN `#@__paper_company` c ON c.`id` = f.`company` WHERE f.`id` = $id AND f.`state` = 1");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$data = $ret[0];

			detailCheckCity("paper", $id, $data['cityid'], "forum");

			$huoniaoTag->assign("cid", $data['cid']);
			$huoniaoTag->assign("company", $data['company']);
			$huoniaoTag->assign("title", $data['title']);
			$huoniaoTag->assign("date", $data['date']);
			$huoniaoTag->assign("litpic", getFilePath($data['litpic']));
			$huoniaoTag->assign("seotitle", $data['seotitle']);
			$huoniaoTag->assign("keywords", $data['keywords']);
			$huoniaoTag->assign("description", $data['description']);
			$huoniaoTag->assign("pdf", $data['pdf'] ? getFilePath($data['pdf']) : "");


			$pic_width = $pic_height = 0;
			if($data['litpic']){
				if(strstr($data['litpic'], ".")){
					$where = "`path` = '".$data['litpic']."'";
				}else{
					$RenrenCrypt = new RenrenCrypt();
					$picid = $RenrenCrypt->php_decrypt(base64_decode($data['litpic']));
					$where = "`id` = ".$picid;
				}
				$sql = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE ".$where);
				$res = $dsql->dsqlOper($sql, "results");
				if($res){
					$pic_width = $res[0]['width'];
					$pic_height = $res[0]['height'];
				}
			}
			$huoniaoTag->assign("pic_width", $pic_width);
			$huoniaoTag->assign("pic_height", $pic_height);


			//上一期
			$prevForum = "";
			$sql = $dsql->SetQuery("select `id` from `#@__paper_forum` where `company` = ".$data['cid']." AND `date` > ".$data['date']." ORDER BY `weight` DESC, `id` ASC LIMIT 1");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$param = array(
					"service"     => "paper",
					"template"    => "forum",
					"id"          => $ret[0]['id']
				);
				$prevForum = getUrlPath($param);
			}
			$huoniaoTag->assign("prevForum", $prevForum);


			//下一期
			$nextForum = "";
			$sql = $dsql->SetQuery("select `id`, `date` from `#@__paper_forum` where `company` = ".$data['cid']." AND `date` < ".$data['date']." ORDER BY `id` DESC LIMIT 1");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__paper_forum` WHERE `date` = ".$ret[0]['date']." ORDER BY `id` ASC");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$param = array(
						"service"     => "paper",
						"template"    => "forum",
						"id"          => $ret[0]['id']
					);
					$nextForum = getUrlPath($param);
				}
			}
			$huoniaoTag->assign("nextForum", $nextForum);


			//上一版
			$prevPaper = "";
			$sql = $dsql->SetQuery("select `id` from `#@__paper_forum` where `company` = ".$data['cid']." AND `date` = ".$data['date']." AND `id` < $id ORDER BY `weight` DESC, `id` DESC LIMIT 1");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$param = array(
					"service"     => "paper",
					"template"    => "forum",
					"id"          => $ret[0]['id']
				);
				$prevPaper = getUrlPath($param);
			}
			$huoniaoTag->assign("prevPaper", $prevPaper);

			//下一版
			$nextPaper = "";
			$sql = $dsql->SetQuery("select `id` from `#@__paper_forum` where `company` = ".$data['cid']." AND `date` = ".$data['date']." AND `id` > $id ORDER BY `weight` DESC, `id` ASC LIMIT 1");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$param = array(
					"service"     => "paper",
					"template"    => "forum",
					"id"          => $ret[0]['id']
				);
				$nextPaper = getUrlPath($param);
			}
			$huoniaoTag->assign("nextPaper", $nextPaper);

			// 版面总数及当前版面序号
			$sql = $dsql->SetQuery("select count(`id`) total from `#@__paper_forum` where `company` = ".$data['cid']." AND `date` = ".$data['date']);
			$ret = $dsql->dsqlOper($sql, "results");
			$total = $ret[0]['total'];


			$sql = $dsql->SetQuery("select count(`id`) total from `#@__paper_forum` where `company` = ".$data['cid']." AND `date` = ".$data['date']." AND `id` < $id ORDER BY `weight` DESC, `id` DESC LIMIT 1");
			$ret = $dsql->dsqlOper($sql, "results");
			$index = $ret[0]['total'];

			$huoniaoTag->assign("total", $total);
			$huoniaoTag->assign("index", $index + 1);

		}else{
			header("location:".$cfg_basehost."/404.html");
		}
		return;


	//获取指定ID的详细信息
	}elseif($action == "content"){
		$detailHandels = new handlers($service, "forumDetail");
		$detailConfig  = $detailHandels->getHandle($id);

		if(is_array($detailConfig) && $detailConfig['state'] == 100){
			$detailConfig  = $detailConfig['info'];
			if(is_array($detailConfig)){

				$weekarray=array("日","一","二","三","四","五","六");
				$huoniaoTag->assign("week", $weekarray[date("w")]);

				//输出详细信息
				foreach ($detailConfig as $key => $value) {
					$huoniaoTag->assign('detail_'.$key, $value);
				}


				$pid = $detailConfig['forum'];
				$huoniaoTag->assign("pid", $pid);

				$weekarray=array("日","一","二","三","四","五","六");
				$huoniaoTag->assign("week", $weekarray[date("w")]);

				$sql = $dsql->SetQuery("SELECT c.`id` cid, c.`title` company, f.`title`, f.`date`, f.`litpic`, f.`seotitle`, f.`keywords`, f.`description`, f.`pdf` FROM `#@__paper_forum` f LEFT JOIN `#@__paper_company` c ON c.`id` = f.`company` WHERE f.`id` = $pid AND f.`state` = 1");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){

					$data = $ret[0];
					$huoniaoTag->assign("id", $id);
					$huoniaoTag->assign("cid", $data['cid']);
					$huoniaoTag->assign("company", $data['company']);
					$huoniaoTag->assign("title", $data['title']);
					$huoniaoTag->assign("date", $data['date']);
					$huoniaoTag->assign("litpic", getFilePath($data['litpic']));
					$huoniaoTag->assign("seotitle", $data['seotitle']);
					$huoniaoTag->assign("keywords", $data['keywords']);
					$huoniaoTag->assign("description", $data['description']);
					$huoniaoTag->assign("pdf", $data['pdf'] ? getFilePath($data['pdf']) : "");

					//上一期
					$prevForum = "";
					$sql = $dsql->SetQuery("select `id` from `#@__paper_forum` where `company` = ".$data['cid']." AND `date` > ".$data['date']." ORDER BY `weight` DESC, `id` ASC LIMIT 1");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$param = array(
							"service"     => "paper",
							"template"    => "forum",
							"id"          => $ret[0]['id']
						);
						$prevForum = getUrlPath($param);
					}
					$huoniaoTag->assign("prevForum", $prevForum);


					//下一期
					$nextForum = "";
					$sql = $dsql->SetQuery("select `id`, `date` from `#@__paper_forum` where `company` = ".$data['cid']." AND `date` < ".$data['date']." ORDER BY `id` DESC LIMIT 1");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){

						$sql = $dsql->SetQuery("SELECT `id` FROM `#@__paper_forum` WHERE `date` = ".$ret[0]['date']." ORDER BY `id` ASC");
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							$param = array(
								"service"     => "paper",
								"template"    => "forum",
								"id"          => $ret[0]['id']
							);
							$nextForum = getUrlPath($param);
						}
					}
					$huoniaoTag->assign("nextForum", $nextForum);


					//上一版
					$prevPaper = "";
					$sql = $dsql->SetQuery("select `id` from `#@__paper_forum` where `company` = ".$data['cid']." AND `date` = ".$data['date']." AND `id` < $pid ORDER BY `weight` DESC, `id` DESC LIMIT 1");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$param = array(
							"service"     => "paper",
							"template"    => "forum",
							"id"          => $ret[0]['id']
						);
						$prevPaper = getUrlPath($param);
					}
					$huoniaoTag->assign("prevPaper", $prevPaper);

					//下一版
					$nextPaper = "";
					$sql = $dsql->SetQuery("select `id` from `#@__paper_forum` where `company` = ".$data['cid']." AND `date` = ".$data['date']." AND `id` > $pid ORDER BY `weight` DESC, `id` ASC LIMIT 1");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$param = array(
							"service"     => "paper",
							"template"    => "forum",
							"id"          => $ret[0]['id']
						);
						$nextPaper = getUrlPath($param);
					}
					$huoniaoTag->assign("nextPaper", $nextPaper);




					//上一篇
					$prevContent = "";
					$sql = $dsql->SetQuery("select `id` from `#@__paper_content` where `forum` = $pid AND `id` < $id ORDER BY `weight` DESC, `id` DESC LIMIT 1");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$param = array(
							"service"     => "paper",
							"template"    => "content",
							"id"          => $ret[0]['id']
						);
						$prevContent = getUrlPath($param);
					}
					$huoniaoTag->assign("prevContent", $prevContent);

					//下一篇
					$nextContent = "";
					$sql = $dsql->SetQuery("select `id` from `#@__paper_content` where `forum` = $pid AND `id` > $id ORDER BY `weight` DESC, `id` ASC LIMIT 1");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$param = array(
							"service"     => "paper",
							"template"    => "content",
							"id"          => $ret[0]['id']
						);
						$nextContent = getUrlPath($param);
					}
					$huoniaoTag->assign("nextContent", $nextContent);

				}else{
					header("location:".$cfg_basehost."/404.html");
				}



			}
		}else{
			header("location:".$cfg_basehost."/404.html");
		}
		return;

	// 搜索页
	}elseif($action == "search_list"){
		if($date && $date != 'today' && $date != 'week' && $date != 'month' && $date != 'halfyear'){
			$date = GetMkTime($date);
		}
		$huoniaoTag->assign("date", $date);
		$huoniaoTag->assign("keywords", $keywords);
	
	//文章详情
	}elseif($action == "content_detail"){
		$detailHandels = new handlers($service, "detail");
        $detailConfig  = $detailHandels->getHandle($id);
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){
            	$huoniaoTag->assign('detail', $detailConfig);
            }
        }
	}

	global $template;
	if(empty($smarty)) return;

	if(!isset($return))
		$return = 'row'; //返回的变量数组名

	//注册一个block的索引，照顾smarty的版本
  if(method_exists($smarty, 'get_template_vars')){
      $_bindex = $smarty->get_template_vars('_bindex');
  }else{
      $_bindex = $smarty->getVariable('_bindex')->value;
  }

  if(!$_bindex){
      $_bindex = array();
  }

  if($return){
      if(!isset($_bindex[$return])){
          $_bindex[$return] = 1;
      }else{
          $_bindex[$return] ++;
      }
  }

  $smarty->assign('_bindex', $_bindex);

	//对象$smarty上注册一个数组以供block使用
	if(!isset($smarty->block_data)){
		$smarty->block_data = array();
	}

	//得一个本区块的专属数据存储空间
	$dataindex = md5(__FUNCTION__.md5(serialize($params)));
	$dataindex = substr($dataindex, 0, 16);

	//使用$smarty->block_data[$dataindex]来存储
	if(!$smarty->block_data[$dataindex]){
		//取得指定动作名
		$moduleHandels = new handlers($service, $action);

		$param = $params;

		//获取分类
		if($action == "type" || $action == "addr"){
			$param['son'] = $son ? $son : 0;

		//信息列表
		}elseif($action == "alist"){
			//如果是列表页面，则获取地址栏传过来的typeid
			if($template == "list" && !$typeid){
				global $typeid;
			}
			!empty($typeid) ? $param['typeid'] = $typeid : "";

		}

		$moduleReturn  = $moduleHandels->getHandle($param);

		//只返回数据统计信息
		if($pageData == 1){
			if(!is_array($moduleReturn) || $moduleReturn['state'] != 100){
				$pageInfo_ = array("totalCount" => 0, "gray" => 0, "audit" => 0, "refuse" => 0);
			}else{
				$moduleReturn  = $moduleReturn['info'];  //返回数据
				$pageInfo_ = $moduleReturn['pageInfo'];
			}
			$smarty->block_data[$dataindex] = array($pageInfo_);

		//正常返回
		}else{

            if (!is_array($moduleReturn) || $moduleReturn['state'] != 100) {
                $pageInfo_ = array("totalCount" => 0);
            } else {
                $moduleReturn = $moduleReturn['info'];  //返回数据
                $pageInfo_    = $moduleReturn['pageInfo'];
            }
			if($pageInfo_){
				//如果有分页数据则提取list键
				$moduleReturn  = $moduleReturn['list'];
				//把pageInfo定义为global变量
				global $pageInfo;
				$pageInfo = $pageInfo_;
				$smarty->assign('pageInfo', $pageInfo);
			}

			$smarty->block_data[$dataindex] = $moduleReturn;  //存储数据

		}
	}

	//果没有数据，直接返回null,不必再执行了
	if(!$smarty->block_data[$dataindex]) {
		$repeat = false;
		return '';
	}

	if($action=="type"){
		//print_r($smarty->block_data[$dataindex]);die;
	}

	//一条数据出栈，并把它指派给$return，重复执行开关置位1
	if(list($key, $item) = each($smarty->block_data[$dataindex])){
		if($action == "type"){
			//print_r($item);die;
		}
		$smarty->assign($return, $item);
		$repeat = true;
	}

	//如果已经到达最后，重置数组指针，重复执行开关置位0
	if(!$item) {
		reset($smarty->block_data[$dataindex]);
		$repeat = false;
	}

	//打印内容
	print $content;
}
