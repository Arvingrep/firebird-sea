<?php
/**
 * 添加信息
 *
 * @version        $Id: articleAdd.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Article
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/article";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "articleAdd.html";

if($action == ""){
	$action = "article";
}

$dotitle = $action == "article" ? "新闻" : "图片";

$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

if($dopost == "edit"){
	checkPurview("edit".$action);
}else{
	checkPurview("articleAdd");
}
$pagetitle     = "发布信息";

//获取当前管理员
$adminid = $userLogin->getUserID();

if($submit == "提交"){
	$flags = isset($flags) ?  join(",", $flags) : '';         //自定义属性
    if($flags){
        $flags_ = explode(',', $flags);
        $flag_h = in_array('h', $flags_) ? 1 : 0;
        $flag_r = in_array('r', $flags_) ? 1 : 0;
        $flag_b = in_array('b', $flags_) ? 1 : 0;
        $flag_t = in_array('t', $flags_) ? 1 : 0;
        $flag_p = '';
        $flag_sql_field = ', `flag_h`, `flag_r`, `flag_b`, `flag_t`, `flag_p`';
        $flag_sql_val = ",'$flag_h', '$flag_r', '$flag_b', '$flag_t', '$flag_p'";
    }else{
			$flag_sql_field = ', `flag_h`, `flag_r`, `flag_b`, `flag_t`, `flag_p`';
			$flag_sql_val = ", 0, 0, 0, 0, 0";
		}
    $pubdate = GetMkTime($pubdate);       //发布时间

	//对字符进行处理
	$title       = cn_substrR($title,60);
	$subtitle    = cn_substrR($subtitle,36);
	$source      = cn_substrR($source,30);
	$sourceurl   = cn_substrR($sourceurl,150);
	$writer      = cn_substrR($writer,20);
	$keywords    = cn_substrR($keywords,50);
	$description = cn_substrR($description,150);
	$color       = cn_substrR($color,6);
	$reward_switch = (int)$reward_switch;
    $prop        = (int)$article_prop;

	//获取最后一个分类的ID
	//$typeid = $typeid[count($typeid)-1];

	if(!isset($dellink)) $dellink = 0;

	//对信息内容进行处理
	$body = AnalyseHtmlBodyLinkLitpic($body, $litpic);
	// $keywords = mb_strlen($keywords) > 10 ? mb_substr($keywords, 0, 10) : $keywords;

	//自动分页
	if($sptype=='auto'){
		//$body = SpLongBody($body,$spsize*1024,"_huoniao_page_break_tag_");
	}

	if(!empty($litpic)){
        $flag_p = 1;
        $flags = $flags ? $flags.',p' : 'p';
        $flag_sql_val = ", '$flag_h', '$flag_r', '$flag_b', '$flag_t', '$flag_p'";
    }

    $mold = (int)$mold;
    $videotype = (int)$videotype;

    if($mold == 1){
        if(empty($litpic)){
        	echo '{"state": 200, "info": "请上传缩略图"}';
			exit();
        }
    	if(empty($imglist)){
    		echo '{"state": 200, "info": "请上传图集"}';
			exit();
    	}
    }
    if($mold == 2){
		if(!$videotype){

			if(empty($video)){
				echo '{"state": 200, "info": "请上传视频"}';
				exit();
			}

			$videourl = $video;
		}

		if(empty($videourl)){
			echo '{"state": 200, "info": "请填写视频地址"}';
			exit();
		}
		if(stripos($videourl,'<iframe') !== false){
			$videourl = stripslashes($videourl);
            $r = preg_match("/\bsrc=(.*?)[\s|>]/i", $videourl, $res);
            if($r){
                $videourl = trim($res[1], "'");
                $videourl = trim($videourl, '"');
            }else{
                return array("state" => 200, "info" => '视频地址获取失败');
            }
        }
        $videourl = stripslashes($videourl);
	}
	if($mold == 3){
		$videourl = $video;
		if(!$id){
	    	// echo '{"state": 200, "info": "短视频类型仅支持在APP端上传并发布"}';
			// exit();
		}elseif(empty($videourl)){
			echo '{"state": 200, "info": "未上传短视频"}';
			exit();
		}
    }

    $media_arctype = (int)$media_arctype;
    $typeset = (int)$typeset;
    $zhuanti = (int)$zhuanti;
    $zhuantitype = (int)$zhuantitype;
    $zhuantiId = $zhuantitype ? $zhuantitype : $zhuanti;
    $mediaId = (int)$media;

    // 验证媒体号
    $media_state = 0;
    if($admin){
        $obj = new article();
	    $check = $obj->selfmedia_verify($admin, "", "check", $vdata);
	    if($check == "ok"){
	    	$mediaId = $vdata['id'];
	    	$media_state = $vdata['state'] == 1 ? 1 : 0;
	    }else{
	    	$mediaId = 0;
	    	$media_state = 1;
	    }
	}

}
if(empty($click)) $click = mt_rand(50, 200);

//页面标签赋值
$huoniaoTag->assign('dopost', $dopost);

//自定义属性-多选
$huoniaoTag->assign('flag',array('h','r','b','t'));
$huoniaoTag->assign('flagList',array('头条[h]','推荐[r]','加粗[b]','跳转[t]'));

$huoniaoTag->assign('pubdate', GetDateTimeMk(time()));

//评论开关-单选
$huoniaoTag->assign('postopt', array('0', '1'));
$huoniaoTag->assign('postnames',array('开启','关闭'));
$huoniaoTag->assign('notpost', 0);  //评论开关默认开启

//阅读权限-下拉菜单
$huoniaoTag->assign('arcrankList', array(0 => '等待审核', 1 => '审核通过', 2 => '审核拒绝'));
$huoniaoTag->assign('arcrank', 1);  //阅读权限默认审核通过

//打赏开关-单选
$huoniaoTag->assign('rewardopt', array('0', '1'));
$huoniaoTag->assign('rewardnames',array('开启','关闭'));
$huoniaoTag->assign('reward_switch', 0);  //打赏开关默认开启

if($dopost == "edit"){

	$pagetitle = "修改信息";

	if($submit == "提交"){
		if($token == "") die('token传递失败！');
		if($id == "") die('要修改的信息ID传递失败！');

		// 需要审核
		$auditConfig = getAuditConfig();
		$need_audit = checkAdminArcrank("article", true);
		$audit_log = $audit_state = "";
		if($need_audit){

			$sql = $dsql->SetQuery("SELECT `admin`, `audit_edit`, `audit_log`, `arcrank` FROM `#@__articlelist_all` WHERE `id` = $id");
			$ret = $dsql->dsqlOper($sql, "results");
			$admin      = $ret[0]['admin'];
			$audit_edit = $ret[0]['audit_edit'];
			$arcrank    = $ret[0]['arcrank'];
			$audit_log  = $ret[0]['audit_log'];
			if($audit_log){
				$audit_log = unserialize($audit_log);
			}

			// 修改权限
			$admin_edit = true;
			if($adminid == $admin){
				if($need_audit != 2){
					$author_edit = checkAdminEditAuth("article", $id);
					if(!$author_edit){
						$admin_edit = false;
					}
				}
			}else{
				if(!$audit_log){
					$levelID = getAdminOrganId($adminid);
					if($levelID){
						$adminDetail = getAdminOrganDetail($adminid);
	                	if($adminDetail){
	                		$typename = $adminDetail['typename'];
							$audit_log[] = array(
								"id" => $levelID,
								"admin" => $adminid,
								"state" => 0,
								"note" => '',
								"pubdate" => '',
								"do" => 1,
								"doinfo" => '',
								"log" => array()
							);
						}
					}
				}
				if($audit_log){
					if(getAdminOrganId($adminid, current($audit_log)['id'])){
						// echo "e ";
						if($auditConfig['auth'] != 1 && $auditConfig['auth'] != 3){
							// echo "f ";
							$admin_edit = false;

						// 判断级别
						}else{
							if(isset(current($audit_log)['special']) && current($audit_log)['special'] == 1 && $audit_log['admin'] != $adminid){
								// echo 'f1 ';
								$admin_edit = false;
							}

							$levelID1 = getAdminOrganId($adminid);
							$levelID2 = getAdminOrganId($admin);
							if($levelID1 > $levelID2 && $levelID2){
								// echo "f2";
								$admin_edit = false;
							}
						}
					}else{
						// echo "g ";
						$admin_edit = false;
					}
					// if($auditConfig['auth'] != 1 && $auditConfig['auth'] != 3){
					// 	$admin_edit = false;
					// }
				}else{
					$admin_edit = false;
				}
			}

			// 验证修改权限
			if(!$admin_edit){
				echo '{"state": 200, "info": "权限不足"}';
				exit();
			}

			if($audit_edit){
				$audit_edit = unserialize($audit_edit);
			}else{
				$audit_edit = array();
			}
			$audit_edit[] = array(
				"admin" => $adminid,
				"pubdate" => $pubdate
			);
			if(count($audit_edit) > 100){
				array_shift($audit_edit);
			}
			$audit_edit = serialize($audit_edit);
		}else{
			$audit_edit = '';
		}

		//表单二次验证
        if(empty($cityid)){
            echo '{"state": 200, "info": "请选择城市"}';
            exit();
        }

        $adminCityIdsArr = explode(',', $adminCityIds);
        if(!in_array($cityid, $adminCityIdsArr)){
            echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
            exit();
        }

		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		if($typeid == ''){
			echo '{"state": 200, "info": "请选择信息分类"}';
			exit();
		}

		//会员消息通知
		memberNotice($id, $arcrank);
        $sub = new SubTable('articlelist', '#@__articlelist');
        $break_table = $sub->getSubTableById($id);

        $admin = (int)$_POST['admin'];

        $sql = $dsql->SetQuery("SELECT `zhuanti` FROM `".$break_table."` WHERE `id` = $id");
        $res = $dsql->dsqlOper($sql, "results");
        $old = $res ? $res[0] : array();


		//保存到主表
		// videoface
		$flag_h = (int)$flag_h;
		$flag_r = (int)$flag_r;
		$flag_b = (int)$flag_b;
		$flag_p = (int)$flag_p;
		$flag_t = (int)$flag_t;

        $hour   = (int)$hour;
        $minute = (int)$minute;
        $second = (int)$second;
        $videotime = '';
        if($minute || $second || $hour){
            $_vtime = (int)($hour * 3600 + $minute * 60 + $second);
            $videotime = ', `videotime` = ' . $_vtime;
        }

		$archives = $dsql->SetQuery("UPDATE `".$break_table."` SET `cityid` = '$cityid', `title` = '$title', `subtitle` = '$subtitle', `flag` = '$flags', `flag_h` = '$flag_h', `flag_r` = '$flag_r', `flag_b` = '$flag_b', `flag_p` = '$flag_p', `flag_t` = '$flag_t',`redirecturl` = '$redirecturl', `weight` = '$weight', `litpic` = '$litpic', `source` = '$source', `sourceurl` = '$sourceurl', `writer` = '$writer', `typeid` = '$typeid', `keywords` = '$keywords', `description` = '$description', `mbody` = '$mbody', `notpost` = '$notpost', `click` = '$click', `color` = '$color', `arcrank` = '$arcrank', `pubdate` = '$pubdate', `audit_edit` = '$audit_edit', `reward_switch` = '$reward_switch', `mold` = $mold, `videotype` = $videotype, `videourl` = '$videourl', `admin` = $admin, `media_arctype` = $media_arctype, `typeset` = $typeset, `zhuanti` = $zhuantiId, `media` = $mediaId, `media_state` = $media_state, `prop` = '$prop' ".$videotime." WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "主表保存失败！"}';
			exit();
		}

		//先删除文档所属图集
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."pic` WHERE `aid` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		//保存图集表
		if($imglist != ""){
			$picList = explode(",",$imglist);
			foreach($picList as $k => $v){
				$picInfo = explode("|", $v);
				$pics = $dsql->SetQuery("INSERT INTO `#@__".$action."pic` (`aid`, `picPath`, `picInfo`) VALUES ('$id', '$picInfo[0]', '$picInfo[1]')");
				$dsql->dsqlOper($pics, "update");
			}
		}

		//保存内容表
		$archives = $dsql->SetQuery("SELECT `body` FROM `#@__".$action."` WHERE `aid` = ".$id);
        $results = $dsql->dsqlOper($archives, "results");
      	if(!empty($results)){
        	$art = $dsql->SetQuery("UPDATE `#@__".$action."` SET `body` = '$body' WHERE `aid` = ".$id);
			$results = $dsql->dsqlOper($art, "update");
        }else{
        	$art = $dsql->SetQuery("INSERT INTO `#@__".$action."` (`aid`, `body`) VALUES ('$id', '$body')");
			$dsql->dsqlOper($art, "update");
        }

		// 检查缓存
        checkCache("article_list", $id);
        clearCache("article_detail", $id);

		adminLog("修改".$dotitle."信息", $title);

		$param = array(
			"service"     => $action,
			"template"    => "detail",
			"id"          => $id,
			"flag"        => $flags
		);
		$url = getUrlPath($param);

		checkCache("article_list", $id);
		clearCache("article_detail", $id);

		// 专题相关
		$sql = $dsql->SetQuery("SELECT `id`, `typeid` FROM `#@__article_zhuantilist` WHERE `aid` = $id");
		$check = $dsql->dsqlOper($sql, "results");
		if($zhuantiId){
			if($check){
				if($old['zhuanti'] != $zhuantiId){
					$sql = $dsql->SetQuery("UPDATE `#@__article_zhuantilist` SET `typeid` = $zhuantiId WHERE `aid` = $id");
					$dsql->dsqlOper($sql, "results");
				}
			}else{
				$sql = $dsql->SetQuery("INSERT INTO `#@__article_zhuantilist`(`aid`, `typeid`) VALUES ($id, $zhuantiId)");
				$dsql->dsqlOper($sql, "lastid");
			}
		}else{
			if($check){
				$sql = $dsql->SetQuery("DELETE FROM `#@__article_zhuantilist` WHERE `aid` = $id");
				$dsql->dsqlOper($sql, "results");
			}
		}
        dataAsync("article",$id,"list");  // 修改资讯
		echo '{"state": 100, "url": "'.$url.'"}';die;
		exit();

	}else{
		if(!empty($id)){
            //获取分表信息
            //查找文章id所在的表
            $sub = new SubTable('articlelist', '#@__articlelist');
            $break_table_name = $sub->getSubTableById($id);

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `" . $break_table_name . "` WHERE `id` = ".$id." ORDER BY `id` DESC");
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$title       = $results[0]['title'];
				$subtitle    = $results[0]['subtitle'];
				$typeid      = $results[0]['typeid'];

				$flagArr = [];
				if($results[0]['flag_h']){
                    $flagArr[] = 'h';
                }
                if($results[0]['flag_b']){
                    $flagArr[] = 'b';
                }
                if($results[0]['flag_r']){
                    $flagArr[] = 'r';
                }
                if($results[0]['flag_t']){
                    $flagArr[] = 't';
                }
                if($results[0]['flag_p']){
                    $flagArr[] = 'p';
                }
                $flags = join(",", $flagArr);
                $flagitem    = $flagArr;

				$redirecturl   = $results[0]['redirecturl'];
				$weight        = $results[0]['weight'];
				$litpic        = $results[0]['litpic'];
				$source        = $results[0]['source'];
				$sourceurl     = $results[0]['sourceurl'];
				$prop          = $results[0]['prop'];
				$writer        = $results[0]['writer'];
				$keywords      = $results[0]['keywords'];
				$description   = $results[0]['description'];
				$mbody         = $results[0]['mbody'];
				$notpost       = $results[0]['notpost'];
				$click         = $results[0]['click'];
				$color         = $results[0]['color'];
				$arcrank       = $results[0]['arcrank'];
				$admin         = $results[0]['admin'];
				$pubdate       = date('Y-m-d H:i:s', $results[0]['pubdate']);
				$cityid        = $results[0]['cityid'];
				$audit_edit    = $results[0]['audit_edit'];
				$reward_switch = (int)$results[0]['reward_switch'];
				$mold          = (int)$results[0]['mold'];
				// $videoface     = $results[0]['videoface'];
				$videotype     = (int)$results[0]['videotype'];
				$videourl      = $results[0]['videourl'];
				$videotime     = $results[0]['videotime'];
				$zhuanti       = $results[0]['zhuanti'];

                if($videotime){
                    $hour   = (int)($videotime / 3600 );
                    $minute = (int)($videotime / 60 %60);
                    $second = (int)($videotime % 60);
                }

				$admin = $results[0]['admin'];
				$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` m LEFT JOIN `#@__article_selfmedia` s ON s.`userid` = m.`id` WHERE m.`id` = ".$results[0]['admin']);
				$res = $dsql->dsqlOper($sql, "results");
				if($res){
					$username = $res[0]['username'];
				}

				global $data;
				$data = "";
				$typename = getParentArr($action."type", $results[0]['typeid']);
				$typename = join(" > ", array_reverse(parent_foreach($typename, "typename")));

				$audit_state = $results[0]['audit_state'];
				$audit_log   = $results[0]['audit_log'];

				// 遍历审核级别
				if($audit_log){
					$audit_log   = unserialize($audit_log);
					// print_r($audit_log);
					if($audit_log){

						$audit_history = array();
						// print_r($audit_log);
						// 前台会员或后台独立编辑投稿，有分类管理员审核，任何一个人审核操作后其他人无法操作
						if(isset(current($audit_log)['or']) && current($audit_log)['or']){
			                $has_succadmin = 0;

			                // 检查是否已被处理
			                foreach ($audit_log as $k => $v) {
			                	if($v['state'] != 0){
			                		$has_succadmin = $v['id'];
			                	}
			                }
			                // echo $has_succadmin."==";
							foreach ($audit_log as $k => $v) {

								$orgtypename = "";
								$adminDetail = getAdminOrganDetail($v['admin']);
			                	if($adminDetail){
			                		$orgtypename = $adminDetail['typename'];
			                		$audit_log[$k]['typename'] = $orgtypename;
			                	}else{
			                		$audit_log[$k]['typename'] = '';
			                	}

								$nickname = '';
								if($v['admin']){
									$sql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = ".$v['admin']);
									$ret = $dsql->dsqlOper($sql, "results");
									if($ret){
										$nickname = $ret[0]['nickname'];
									}else{
										unset($audit_log[$k]);
										continue;
									}
								}

								$do = 0;
								$doinfo = "";

								if($adminid == $v['admin']){
									// 已被处理
									if($has_succadmin){
										if($adminid == $has_succadmin){
											$do = 1;
										}else{
											$doinfo = '该信息已被其他审核人员处理';
										}
									}else{
										$do = 1;
									}
								}

								$audit_log[$k]['do'] = $do;
								$audit_log[$k]['doinfo'] = $doinfo;
								$audit_log[$k]['ok'] = $has_succadmin ? 1 : 0;

								$audit_log[$k]['nickname'] = $nickname;

								$log = $v['log'];
								if($log){
									foreach ($log as $log_k => $log_v) {
										if(!$orgtypename){
											$adminDetail = getAdminOrganDetail($v['admin']);
						                	if($adminDetail){
						                		$orgtypename = $adminDetail['typename'];
						                	}
										}
										$log_v['typename'] = $orgtypename;
										$log_v['nickname'] = $nickname;
										array_push($audit_history, $log_v);
									}
								}
							}

							// print_r($audit_log);die;

						}else{
							$levelID = getAdminOrganId($adminid);

							// 验证是否可修改审核状态，高级别审核人员是否已有操作
							$no = 0;
							if($levelID){
								$audit_reverse = array_reverse($audit_log);
								foreach ($audit_reverse as $k => $v) {
									if($v['state'] && $v['id'] < $levelID){
										$no = 1;
										break;
									}
								}
							}
							// 向下级别的审核状态
							$before_state = true;
							foreach ($audit_log as $k => $v) {

								$orgtypename = "";
								$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__site_organizat` WHERE `id` = ".$v['id']);
								$ret = $dsql->dsqlOper($sql, "results");
								if($ret){
									$orgtypename = $ret[0]['typename'];
									$audit_log[$k]['typename'] = $orgtypename;
								}else{
									unset($audit_log[$k]);
									continue;
								}

								$do = 0;
								$doinfo = "";

								if($levelID){
									if($k > $levelID && $v['state'] != 1){
										$before_state = false;
										// $doinfo = '等待上一级审核人员处理';
									}
									// 所在级别
									if($k == $levelID){
										if($before_state){
											// 已被平级审核人员处理
											if(empty($audit_log[$k]['admin']) || $audit_log[$k]['admin'] == $adminid){
												$do = !$no;
												if(!$do) $doinfo = '您当前无法修改该信息审核状态';
											}else{
												$doinfo = '该信息已被其他审核人员处理';
											}
										}else{
											$doinfo = '等待上一级审核人员处理';
										}
									}
								}
								$audit_log[$k]['do'] = $do;
								$audit_log[$k]['doinfo'] = $doinfo;


								$nickname = '';
								if($v['admin']){
									$sql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = ".$v['admin']);
									$ret = $dsql->dsqlOper($sql, "results");
									if($ret){
										$nickname = $ret[0]['nickname'];
									}
								}
								$audit_log[$k]['nickname'] = $nickname;

								$log = $v['log'];
								if($log){
									foreach ($log as $log_k => $log_v) {
										$log_v['nickname'] = $nickname;
										$log_v['typename'] = $orgtypename;
										array_push($audit_history, $log_v);
									}
								}
							}

						}

						if($audit_history){
							usort($audit_history, function($a, $b) {
					            return ($a['pubdate'] > $b['pubdate']) ? 1 : 0;
					        });
					        foreach ($audit_history as $key => $value) {
					        	if(!$value['nickname']){
									$sql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = ".$log_v['admin']);
									$ret = $dsql->dsqlOper($sql, "results");
									if($ret){
										$nickname = $ret[0]['nickname'];
									}
									$audit_history[$key]['nickname'] = $nickname;
								}
					        }
						}

					// 非组织架构类管理员或前台会员发布到未设置管理员的分类
					}else{
						$levelID = getAdminOrganId($adminid);
						if($levelID){
							$adminDetail = getAdminOrganDetail($adminid);
		                	if($adminDetail){
		                		$typename = $adminDetail['typename'];
								$audit_log[] = array(
									"id" => $levelID,
									"admin" => $adminid,
									"special" => 1,
									"state" => 0,
									"note" => '',
									"pubdate" => '',
									"do" => 1,
									"doinfo" => '',
									"log" => array()
								);
                                $audit_state = is_array($audit_state) ?: array();
								$audit_state[] = $v.":0";
							}
						}
					}
				}

				if($audit_edit){
					$audit_edit = unserialize($audit_edit);
					foreach ($audit_edit as $k => $v) {
						$sql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = ".$v['admin']);
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							$nickname = $ret[0]['nickname'];
						}else{
							$nickname = "未知";
						}
						$audit_edit[$k]['nickname'] = $nickname;
					}
				}


				$media_arctype = $results[0]['media_arctype'];
				$typeset = $results[0]['typeset'];
				$media   = $results[0]['media'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

			//图表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."pic` WHERE `aid` = ".$id." ORDER BY `id` ASC");
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){
				$imglist = array();
				foreach($results as $key => $value){
					$imglist[$key]["path"] = $value["picPath"];
					$imglist[$key]["info"] = $value["picInfo"];
				}
				$imglist = json_encode($imglist);
			}else{
				$imglist = "''";
			}

			//内容表信息
			$archives = $dsql->SetQuery("SELECT `body` FROM `#@__".$action."` WHERE `aid` = ".$id." ORDER BY `id` DESC");
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){
				$body = $results[0]["body"];
			}else{
				$body = "''";
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}
}elseif($dopost == "" || $dopost == "save"){
	$dopost = "save";

	//表单提交
	if($submit == "提交"){
		if($token == "") die('token传递失败！');

        //表单二次验证
        if(empty($cityid)){
            echo '{"state": 200, "info": "请选择城市"}';
            exit();
        }

        $adminCityIdsArr = explode(',', $adminCityIds);
        if(!in_array($cityid, $adminCityIdsArr)){
            echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
            exit();
        }

		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		if($typeid == ''){
			echo '{"state": 200, "info": "请选择信息分类"}';
			exit();
		}

		// 审核流程
		$need_audit = checkAdminArcrank("article", true);
		$audit_log = $audit_state = "";
		if($need_audit){
			$arcrank = $need_audit == 2 ? $arcrank : 0;
			$audit_log = $audit_state = array();

			// 判断是否在组织架构中
			$levelID = getAdminOrganId($adminid);

			if($levelID){
				// 获取当前管理员审核流程组织架构
				$organizat = getAdminOrganizatList($levelID);

				if($organizat){
					$auditConfig = getAuditConfig();
					$audit_state[] = $auditConfig['type'] ? "GRADED" : "PARENT";
					foreach ($organizat as $key => $value) {
						$audit_log[$value['id']] = array(
							"id" => $value['id'],
							"typename" => $value['typename'],
							"admin" => $need_audit == 2 ? $adminid : 0,
							"state" => $need_audit == 2 ? 1 : 0,
							"note" => '',
							"pubdate" => '',
							"log" => array()
						);

						$audit_state[] = $value['id'].":0";

						// 主管审批只保存一级
						if($auditConfig['type'] == 0) break;
					}
				}

			// 独立编辑
			}else{
				// 获取分类管理员
				$sql = $dsql->SetQuery("SELECT `admin` FROM `#@__articletype` WHERE `id` = $typeid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					if($ret[0]['admin']){
						$audit_state[] = "OR";
						$adminids = explode(",", $ret[0]['admin']);
						foreach ($adminids as $k => $v) {
							$audit_log[$v] = array(
								"id" => $v,
								"admin" => $v,
								"or" => 1,
								"state" => 0,
								"note" => '',
								"pubdate" => '',
								"log" => array()
							);
							$audit_state[] = $v.":0";
						}
					}
				}
			}
			// print_r($audit_log);
			// echo $audit_state;
			$audit_log = serialize($audit_log);
			$audit_state = join("|", $audit_state);

			$audit_fields = ", `audit_state`, `audit_log`, `audit_edit`";
			$audit_values = ", '$audit_state', '$audit_log', ''";
		}else{
			$audit_fields = ", `audit_log`, `audit_edit`";
			$audit_values = ", '', ''";
		}

		//保存到文章列表
        $adminid = (int)$_POST['admin'] ? (int)$_POST['admin'] : $adminid;

        $hour   = (int)$hour;
        $minute = (int)$minute;
        $second = (int)$second;
        $videotime_f = '';
        $videotime_v = '';
        if($minute || $second || $hour){
            $videotime_f = ', `videotime`';
            $videotime = (int)($hour * 3600 + $minute * 60 + $second);
            $videotime_v = ', ' . $videotime;
        }

		$archives = $dsql->SetQuery("INSERT INTO `#@__articlelist_all`
		(`cityid`, `title`, `subtitle`, `flag`, `redirecturl`, `weight`, `litpic`, `source`, `sourceurl`, `writer`, `typeid`,
		 `keywords`, `description`, `mbody`, `notpost`, `click`, `color`, `arcrank`, `pubdate`, `admin`, `reward_switch`
		 ". $flag_sql_field . $audit_fields."
			, `mold`, `videotype`, `videourl`, `media_state`, `media_arctype`, `typeset`, `zhuanti`, `media`, `prop` ".$videotime_f."
		 )
		 VALUES
		 ('$cityid', '$title', '$subtitle', '$flags', '$redirecturl', '$weight', '$litpic', '$source', '$sourceurl', '$writer', '$typeid',
		 '$keywords', '$description', '$mbody', '$notpost', '$click', '$color', '$arcrank', '$pubdate', '$adminid', '$reward_switch'
		 ". $flag_sql_val . $audit_values."
			, $mold, $videotype, '$videourl', 1, $media_arctype, $typeset, $zhuantiId, $mediaId, $prop ".$videotime_v."
		 )");

		$aid = $dsql->dsqlOper($archives, "lastid",null,"articlelist");
		if(!is_numeric($aid)){
			echo '{"state": 200, "info": "提交失败"}';
			exit();
		}


		//保存图集表
		if($imglist != ""){
			$picList = explode(",",$imglist);
			foreach($picList as $k => $v){
				$picInfo = explode("|", $v);
				$pics = $dsql->SetQuery("INSERT INTO `#@__".$action."pic` (`aid`, `picPath`, `picInfo`) VALUES ('$aid', '$picInfo[0]', '$picInfo[1]')");
				$dsql->dsqlOper($pics, "update");
			}
		}

		//保存内容表
		$art = $dsql->SetQuery("INSERT INTO `#@__".$action."` (`aid`, `body`) VALUES ('$aid', '$body')");
		$dsql->dsqlOper($art, "update");

		// 专题相关
		if($zhuantiId){
			$sql = $dsql->SetQuery("INSERT INTO `#@__article_zhuantilist`(`aid`, `typeid`) VALUES ($aid, $zhuantiId)");
			$dsql->dsqlOper($sql, "lastid");
		}

		updateCache("article_list", 300);

		adminLog("添加".$dotitle."信息", $title);

		$param = array(
			"service"     => "article",
			"template"    => "detail",
			"id"          => $aid,
			"flag"        => $flags
		);
		$url = getUrlPath($param);

		if($arcrank == 1){
			// 这里会影响发布信息的速度，注释掉后需要手动清除缓存
			// updateCache("article_list", 300);
		}
        dataAsync("article",$aid,"list");  // 新增资讯
		echo '{"state": 100, "url": "'.$url.'"}';die;

	}

}elseif($dopost == "getTree"){
	$options = $dsql->getOptionList($pid, $action);
	echo json_encode($options);die;
}elseif($dopost == "getMediaArcType"){
	$arr = array();
	$uid = (int)$_POST['uid'];
	$aid = (int)$_POST['aid'];
	if($aid){
		$arr = $dsql->getTypeList(0, "article_selfmedia_arctype", true, 1, 100, " AND `aid`=".$aid);
	}elseif($uid){
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__article_selfmedia` WHERE `userid` = $id");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			$arr = $dsql->getTypeList(0, "article_selfmedia_arctype", true, 1, 100, " AND `aid`=".$res[0]['id']);
		}
	}
	echo json_encode($arr);
	die;
// 验证自媒体账号
}elseif($dopost == "checkMedia"){
	$res = array();
	if($name){
		$sql = $dsql->SetQuery("SELECT `id`, `ac_name` FROM `#@__article_selfmedia` WHERE `ac_name` LIKE '%$name%'");
		$res = $dsql->dsqlOper($sql, "results");
	}
	if($callback){
		echo $callback."(".json_encode($res, JSON_UNESCAPED_UNICODE ).")";
	}else{
		echo json_encode($res, JSON_UNESCAPED_UNICODE );
	}
	die;
//模糊匹配会员
}elseif($dopost == "checkUser"){
	$res = array();
	$name = $_POST['name'];
	$aid = $_POST['aid'];
	if(!empty($name)){

	    $where .= " AND (m.`mtype` = 1 || m.`mtype` = 2)";
	    $userSql = $dsql->SetQuery("SELECT m.`id`, m.`username`, m.`company`, m.`nickname`, s.`ac_name`, s.`id` sid FROM `#@__member` m "
	    	."LEFT JOIN `#@__article_selfmedia` s ON s.`userid` = m.`id` "
	    	."WHERE (m.`username` like '%$name%' OR m.`company` like '%$name%' OR m.`nickname` like '%$name%' OR s.`ac_name` LIKE '%$name%')"
	    	.$where." LIMIT 0, 10");
	    // echo $userSql;die;
	    $res = $dsql->dsqlOper($userSql, "results");
	    if($res && $aid){
	    	foreach ($res as $key => $value) {
	    		if($value['sid'] != $aid){
	    			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__article_selfmedia_manager` WHERE `aid` = $aid AND `userid` = ".$value['id']);
	    			$check = $dsql->dsqlOper($sql, "results");
	    			if(!$check) unset($res[$key]);
	    		}
	    	}
	    }
  	}
	if($callback){
		echo $callback."(".json_encode($res, JSON_UNESCAPED_UNICODE ).")";
	}else{
		echo json_encode($res, JSON_UNESCAPED_UNICODE );
	}
	die;

// 获取指定媒体号的管理员
}elseif($dopost == "getUser"){
	$aid = (int)$aid;
	$sql = $dsql->SetQuery("SELECT m.`id`, m.`username` FROM `#@__member` m LEFT JOIN `#@__article_selfmedia_manager` s ON s.`userid` = m.`id` WHERE s.`aid` = $aid");
	$res = $dsql->dsqlOper($sql, "results");

	$sql = $dsql->SetQuery("SELECT m.`id`, m.`username` FROM `#@__member` m LEFT JOIN `#@__article_selfmedia` s ON s.`userid` = m.`id` WHERE s.`id` = $aid");
	$ret = $dsql->dsqlOper($sql, "results");

	echo json_encode(array_merge($ret, $res), JSON_UNESCAPED_UNICODE );
	die;
}

//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'ui/select2/select2.js',
		'admin/article/articleAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC."/config/".$action.".inc.php");

	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}

	$huoniaoTag->assign('customDelLink', $customDelLink);
	$huoniaoTag->assign('customAutoLitpic', $customAutoLitpic);

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('title', htmlentities($title, ENT_QUOTES, "utf-8"));
	$huoniaoTag->assign('subtitle', htmlentities($subtitle, ENT_QUOTES, "utf-8"));
	$huoniaoTag->assign('typeid', empty($typeid) ? "0" : $typeid);
	$huoniaoTag->assign('typename', empty($typename) ? "选择分类" : $typename);
	$huoniaoTag->assign('flagitem', $flagitem);
	$huoniaoTag->assign('flags', empty($flags) ? "" : $flags);
	$huoniaoTag->assign('redirecturl', htmlentities($redirecturl, ENT_QUOTES, "utf-8"));
	$huoniaoTag->assign('weight', $weight == "" ? "1" : $weight);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('source', htmlentities($source, ENT_QUOTES, "utf-8"));
	$huoniaoTag->assign('sourceurl', htmlentities($sourceurl, ENT_QUOTES, "utf-8"));
	$huoniaoTag->assign('prop', (int)$prop);
	$huoniaoTag->assign('writer', htmlentities($writer, ENT_QUOTES, "utf-8"));
	$huoniaoTag->assign('keywords', htmlentities($keywords, ENT_QUOTES, "utf-8"));
	$huoniaoTag->assign('description', htmlentities($description, ENT_QUOTES, "utf-8"));
	$huoniaoTag->assign('body', $body);
	$huoniaoTag->assign('mbody', $mbody);
	$huoniaoTag->assign('imglist', empty($imglist) ? "''" : $imglist);
	$huoniaoTag->assign('notpost', empty($notpost) ? 0 : $notpost);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('color', $color);
	$huoniaoTag->assign('arcrank', $arcrank == "" ? 1 : $arcrank);
	$huoniaoTag->assign('reward_switch', $reward_switch == "" ? 0 : $reward_switch);
	$huoniaoTag->assign('pubdate', empty($pubdate) ? date("Y-m-d H:i:s",time()) : $pubdate);
	$huoniaoTag->assign('admin', $admin);
	$huoniaoTag->assign('username', $username);

	// 审核流程配置
	$auditConfig = getAuditConfig();
	$huoniaoTag->assign('auditConfig', $auditConfig);
	// 是否需要审核 一级审核人员显示审核选项
	$need_audit = checkAdminArcrank("article", true);
	$huoniaoTag->assign('need_audit', $need_audit);
	// 修改权限
	$admin_edit = true;
	if($need_audit && $id){
		// echo "a ";
		if($adminid == $admin){
			// echo "b ";
			if($need_audit != 2){
				$author_edit = checkAdminEditAuth("article", $id);
				if(!$author_edit){
					// echo "c ";
					$admin_edit = false;
				}
			}
		}else{
			// echo "d ";
			if($audit_log){
				if(getAdminOrganId($adminid, current($audit_log)['id'])){
					// echo "e ";
					if($auditConfig['auth'] != 1 && $auditConfig['auth'] != 3){
						// echo "f ";
						$admin_edit = false;

					// 判断级别
					}else{
						if(isset(current($audit_log)['special']) && current($audit_log)['special'] == 1 && $audit_log['admin'] != $adminid){
							// echo 'f1 ';
							$admin_edit = false;
						}
						$levelID1 = getAdminOrganId($adminid);
						$levelID2 = getAdminOrganId($admin);
						if($levelID1 > $levelID2 && $levelID2){
							// echo " f2";
							$admin_edit = false;
						}
					}
				}else{
					// echo "g ";
					$admin_edit = false;
				}
			}else{
				$admin_edit = false;
			}
		}
	}

	$huoniaoTag->assign('admin_edit', $admin_edit);
	$huoniaoTag->assign('audit_state', $audit_state);
	$huoniaoTag->assign('audit_log', $audit_log);
	$huoniaoTag->assign('audit_history', $audit_history);
	$huoniaoTag->assign('levelID', (int)$levelID);
	// print_r($audit_log);
	// 修改记录
	$huoniaoTag->assign('audit_edit', $audit_edit);


    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

    $mold = (int)$mold;
  	include_once HUONIAOROOT."/api/handlers/article.class.php";
	$article = new article();
	$typeList = $article->get_article_mold(); // 新闻类型
	// unset($typeList[3]);

	//新闻类型-单选
	$huoniaoTag->assign('mold_val', array_column($typeList, "id"));
	$huoniaoTag->assign('mold_name', array_column($typeList, "typename"));
	$huoniaoTag->assign('mold', $mold);

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type", true, 1, 100, " AND `mold`=".$mold), JSON_UNESCAPED_UNICODE));

	//视频类型
	$huoniaoTag->assign('videotypeArr', array('0', '1'));
	$huoniaoTag->assign('videotypeNames',array('本地','外站调用'));
	$huoniaoTag->assign('videotype', (int)$videotype);
	// $huoniaoTag->assign('videoface', $videoface);
	$huoniaoTag->assign('videourl', $videourl);
    $huoniaoTag->assign('hour', $hour);
    $huoniaoTag->assign('minute', $minute);
    $huoniaoTag->assign('second', $second);

	$media_arctypename = "请先选择自媒体";
  	$typeMediaListArr = array();
	if($id){
		if($media_arctype){
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__article_selfmedia_arctype` WHERE `id` = $media_arctype");
			$res = $dsql->dsqlOper($sql, "results");
			if($res){
				$media_arctypename = $res[0]['typename'];
			}
		}else{
			$media_arctypename = "请选择自定义分类";
		}
		if($media){
			$typeMediaListArr = $dsql->getTypeList(0, "article_selfmedia_arctype", true, 1, 1000, " AND `aid` = ".$media);
		}
	}
	$huoniaoTag->assign('media_arctype', $media_arctype);
	$huoniaoTag->assign('media_arctypename', $media_arctypename);
  	$huoniaoTag->assign('typeMediaListArr', json_encode($typeMediaListArr, JSON_UNESCAPED_UNICODE));

  	$db = "article_zhuanti";
  	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `parentid` = 0 ORDER BY `weight` DESC, `id`");
  	$zhuantList = $dsql->dsqlOper($archives, "results");
	$huoniaoTag->assign('zhuantList', $zhuantList);

	if($zhuanti){
		$s = array_search($zhuanti, array_column($zhuantList, "id"));
		if($s === false){
			$sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__".$db."` WHERE `id` = $zhuanti");
  			$par = $dsql->dsqlOper($sql, "results");
  			if($par){
  				$zhuanti_par = $par[0]['parentid'];
  			}
		}else{
			$zhuanti_par = $zhuanti;
			$zhuanti = 0;
		}
	}
	if($zhuanti_par){
	  	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `parentid` = $zhuanti_par ORDER BY `weight` DESC, `id`");
	  	$zhuantList2 = $dsql->dsqlOper($archives, "results");
		$huoniaoTag->assign('zhuantList2', $zhuantList2);
	}
	$huoniaoTag->assign('zhuanti', $zhuanti);
	$huoniaoTag->assign('zhuanti_par', $zhuanti_par);


	//排版方式（头条类型）-单选 小图大图
	$huoniaoTag->assign('typeset_val', array("0", "1"));
	$huoniaoTag->assign('typeset_name', array("小图", "大图"));
	$huoniaoTag->assign('typeset', (int)$typeset);

	$mediaName = "";
	if($media){
		$sql = $dsql->SetQuery("SELECT `id`, `ac_name` FROM `#@__article_selfmedia` WHERE `id` = $media");
		$res = $dsql->dsqlOper($sql, "results");
		$mediaName = $res ? $res[0]['ac_name'] : "";
	}
	$huoniaoTag->assign('media', $media);
	$huoniaoTag->assign('mediaName', $mediaName);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/article";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}



//会员消息通知
function memberNotice($id, $arcrank){
	global $dsql;
	global $userLogin;
	global $handler;
	global $action;
	$handler = true;

	//查询信息之前的状态
	$sql = $dsql->SetQuery("SELECT `title`, `arcrank`, `admin`, `pubdate` FROM `#@__".$action."list` WHERE `id` = $id");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){

		$title    = $ret[0]['title'];
		$arcrank_ = $ret[0]['arcrank'];
		$admin    = $ret[0]['admin'];
		$pubdate  = $ret[0]['pubdate'];

		//会员消息通知
		if($arcrank != $arcrank_){

			$state = "";
			$status = "";

			//等待审核
			if($arcrank == 0){
				$state = 0;
				$status = "进入等待审核状态。";

			//已审核
			}elseif($arcrank == 1){
				$state = 1;
				$status = "已经通过审核。";

			//审核失败
			}elseif($arcrank == 2){
				$state = 2;
				$status = "审核失败。";
			}

			$param = array(
				"service"  => "member",
				"type"     => "user",
				"template" => "manage",
				"action"   => "article"
			);

			//会员信息
			if($admin){
				$uinfo = $userLogin->getMemberInfo($admin);
				if(is_array($uinfo) && $uinfo['userType'] == 2){
					$param = array(
						"service"  => "member",
						"template" => "manage",
						"action"   => "article"
					);
				}
			}

			$param['param'] = "state=".$state;

			//获取会员名
			$username = "";
			$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $admin");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$username = $ret[0]['username'];
			}

			//自定义配置
			$config = array(
				"username" => $username,
				"title" => $title,
				"status" => $status,
				"date" => date("Y-m-d H:i:s", $pubdate),
				"fields" => array(
					'keyword1' => '信息标题',
					'keyword2' => '发布时间',
					'keyword3' => '进展状态'
				)
			);

			updateMemberNotice($admin, "会员-发布信息审核通知", $param, $config);

		}

	}
}
