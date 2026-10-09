<?php

/**
 * huoniaoTag模板标签函数插件-新闻模块
 *
 * @param $params array 参数集
 * @return array
 */
function article($params, $content = "", &$smarty = array(), &$repeat = array()){
    extract ($params);
    $service = "article";
    if(empty($action)) return '';
    global $huoniaoTag;
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $dsql;
    global $userLogin;

    $table_all = '#@__articlelist_all';

    if($action == "toutiao" || $action == "picnews" || $action == "video_shopping" || $action == "short_video"){
        $pageCurr = $action;
        if($action == "toutiao"){
            $mold = 0;
        }elseif($action == "picnews"){
            $mold = 1;
            $pageCurr = "picnews";
        }elseif($action == "video_shopping"){
            $mold = 2;
        }elseif($action == "short_video"){
            $mold = 3;
        }
        $huoniaoTag->assign('mold', $mold);
        $huoniaoTag->assign('pageCurr', $pageCurr);
    }

    if(empty($smarty)){//判断当前用户是否入驻自媒体
        $mediaid = $userLogin->getMemberID();
        if($mediaid > 0){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__article_selfmedia` WHERE `state` = 1 AND `userid` = '$mediaid'");
            $ret = $dsql->dsqlOper($sql, "results");
            if(!empty($ret[0]['id'])){
                $huoniaoTag->assign('ismedia', 1);
            }
        }

    }


    //获取指定分类详细信息
    if($action == "list"){

        if(empty($typeid)){
            global $dsql;

            //全拼类型
            if(!empty($pinyin)){

                $pinyin = str_replace("/", "", $pinyin);

                //获取分类信息
                $sql = $dsql->SetQuery("SELECT `id`, `mold` FROM `#@__articletype` WHERE `pinyin` = '$pinyin'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $typeid1 = $ret[0]['id'];
                    $mold = $ret[0]['mold'];
                }

                //首字母
            }elseif(!empty($py)){

                $py = str_replace("/", "", $py);

                //获取分类信息
                $sql = $dsql->SetQuery("SELECT `id`, `mold` FROM `#@__articletype` WHERE `py` = '$py'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $typeid1 = $ret[0]['id'];
                    $mold = $ret[0]['mold'];
                }

            }


        }else{
            //获取分类信息
            $sql = $dsql->SetQuery("SELECT `id`, `mold` FROM `#@__articletype` WHERE `id` = '$typeid'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $typeid1 = $ret[0]['id'];
                $mold = $ret[0]['mold'];
            }
        }


        global $typeid;
        $typeid = $typeid1;

        global $tpl;
        global $templates;

        $templates_ = "";
        if($mold == 1){
            $templates_ = "picnews";
        }elseif($mold == 2){
            $templates_ = "video_shopping";
        }elseif($mold == 3){
            $templates_ = "short_video";
        }else{
            $templates_ = "toutiao";
        }

        if(is_file(HUONIAOROOT.$tpl.$templates_.".html")){

            $templates = $templates_;
            $huoniaoTag->assign('mold', $mold);
            $huoniaoTag->assign('pageCurr', $templates);

            $templates .= ".html";
        }

        //404
        if(empty($typeid)){
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
        }

        $listHandels = new handlers($service, "typeDetail");
        $listConfig  = $listHandels->getHandle($typeid);

        if(is_array($listConfig) && $listConfig['state'] == 100){
            $listConfig  = $listConfig['info'];
            if(is_array($listConfig)){
                foreach ($listConfig[0] as $key => $value) {
                    $huoniaoTag->assign('list_'.$key, $value);
                }
            }
        }
        return;

        //搜索
    }elseif($action == "search" || $action == "searchpage"){

        //关键字为空跳回首页
        if(empty($keywords)){
            //header("location:index.html");
            //die;
        }

        $huoniaoTag->assign('keywords', $keywords);
        $huoniaoTag->assign('page', (int)$page);
        return;

        //获取指定ID的详细信息
    }elseif($action == "detail" || $action == "comment" || $action == "rewardlist"){
        $detailHandels = new handlers($service, "detail");
        $detailConfig  = $detailHandels->getHandle($id);
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){

				// 如果是会员中心修改页面，验证是否是发布人
				if($realServer == "member"){
					$uid = $userLogin->getMemberID();
					if($uid > 0 && $detailConfig['admin'] != $uid){
						header("location:".$cfg_secureAccess.$cfg_basehost."/404.html");
						die;
					}
				}

                if($_GET['from'] != 'app'){
                    detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);
                }

                //跳转
                if(strpos($detailConfig['flag'], 't') !== false && !empty($detailConfig['redirecturl'])){
                    header("location:".$detailConfig['redirecturl']);
                    die;
                }

                //获取分类信息
                $listHandels = new handlers($service, "typeDetail");
                $listConfig  = $listHandels->getHandle($detailConfig['typeid']);
                if(is_array($listConfig) && $listConfig['state'] == 100){
                    $listConfig  = $listConfig['info'];
                    if(is_array($listConfig)){
                        foreach ($listConfig[0] as $key => $value) {
                            $huoniaoTag->assign('list_'.$key, $value);
                        }
                    }
                }

                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }

                if(isset($realServer) && $realServer == "member") return;

                if($action != "comment" && $action != "rewardlist"){
                    global $templates;
                    global $tpl;
                    if($detailConfig['mold'] == 0){

                        global $p;
                        global $all;
                        $body = isMobile() ? ($detailConfig['mbody'] ? $detailConfig['mbody'] : $detailConfig['body']) : $detailConfig['body'];
                        $pagesss = '_huoniao_page_break_tag_';  //设定分页标签
                        $a = strpos($body, $pagesss);
                        if($a && !$all){
                            $con = explode($pagesss, $body);
                            if($p && $p > 0){
                                $huoniaoTag->assign('detail_body', $con[$p-1]);
                            }else{
                                $huoniaoTag->assign('detail_body', $con[0]);
                            }
                        }else{
                            $huoniaoTag->assign('detail_body', str_replace($pagesss, "", $body));
                        }
                        $huoniaoTag->assign('detail_page', bodyPageList(array("body" => $body, "page" => $p)));

                        $pageCurr = "toutiao";
                    }elseif($detailConfig['mold'] == 1){
                        $pageCurr = "picnews";
                        $templates = "picdetail.html";
                    }elseif($detailConfig['mold'] == 2){
                        $pageCurr = "video_shopping";
                        $templates = "videtail.html";
                    }elseif($detailConfig['mold'] == 3){
                        $pageCurr = "short_video";
                        $templates = "svdetail.html";
                    }
                }

                if(!is_file(HUONIAOROOT.$tpl.$templates)){
                    $templates = "detail.html";
                }

                //是否自定义路由了
                global $customRouterRule;
                if($customRouterRule){
                    $templates = 'index.html';
                }

                $huoniaoTag->assign('pageCurr', $pageCurr);
                
                // //更新阅读次数，已转移到article.class的detail接口中，考虑到APP端原生后，不再经过controller
                // global $dsql;
                // // $sub = new SubTable('article', '#@__articlelist');
                // // $break_table = $sub->getSubTableById($id);
                // $sql = $dsql->SetQuery("UPDATE `".$table_all."` SET `click` = `click` + 1 WHERE `id` = ".$id);
                // $dsql->dsqlOper($sql, "update");

                // // 更新自媒体浏览次数
                // $sql = $dsql->SetQuery("UPDATE `#@__article_selfmedia` SET `click` = `click` + 1 WHERE `userid` = ".$detailConfig['admin']);
                // $dsql->dsqlOper($sql, "update");
                // $uid = $userLogin->getMemberID();
                // if($uid >0 && $uid!=$detailConfig['admin']){
                //     $uphistoryarr = array(
                //         'module'  => 'article',
                //         'uid'     => $uid,
                //         'aid'     => $id,
                //         'fuid'    => $detailConfig['admin'],
                //         'module2' => 'detail',
                //     );
                //     /*更新浏览足迹表   */
                //     updateHistoryClick($uphistoryarr);
                // }



                // $breakup_table_res = $sub->getSubTable();
                // $union = " UNION ALL ";
                // $Order = ' ORDER BY `weight` DESC, `id` DESC LIMIT 1';

                //上一篇
                $prewhere = " WHERE `del` = 0 AND `arcrank` = 0 AND `id` < $id";
                $prevArticle = "";
                $prevArticleTitle = "";
                $sql = $dsql->SetQuery("select `id`, `title` from `".$table_all."` where `arcrank`=1 AND `del` = 0 AND `id` < $id ORDER BY `weight` DESC, `id` DESC LIMIT 1");
                $ret = $dsql->dsqlOper($sql, "results");
                // if(empty($ret)){
                //     foreach ($breakup_table_res as $item){
                //         $archives1 .= "SELECT `id`, `title`, `weight` FROM `".$item['table_name']."` l  " . $union;
                //     }
                //     $archives1  = substr($archives1, 0, -(strlen($union)));
                //     $ret = $dsql->dsqlOper($dsql->SetQuery($archives1.$prewhere.$Order), "results");
                // }
                if($ret){
                    $param = array(
                        "service"     => "article",
                        "template"    => "detail",
                        "id"          => $ret[0]['id']
                    );
                    $prevArticle = getUrlPath($param);
                    $prevArticleTitle = $ret[0]['title'];
                }
                $huoniaoTag->assign("prevArticle", $prevArticle);
                $huoniaoTag->assign("prevArticleTitle", $prevArticleTitle);

                //下一篇
                $nextwhere = " WHERE `del` = 0 AND `arcrank` = 0 AND `id` > $id";
                $nextArticle = "";
                $nextArticleTitle = "";
                $sql = $dsql->SetQuery("select `id`, `title` from `".$table_all."` where `arcrank`=1 AND `del` = 0 AND `id` > $id ORDER BY `weight` DESC, `id` ASC LIMIT 1");
                $ret = $dsql->dsqlOper($sql, "results");
                // if(empty($ret)){
                //     foreach ($breakup_table_res as $item){
                //         $archives2 .= "SELECT `id`, `title`, `weight` FROM `".$item['table_name']."` l  " . $union;
                //     }
                //     $archives2  = substr($archives2, 0, -(strlen($union)));
                //     $ret = $dsql->dsqlOper($dsql->SetQuery($archives2.$nextwhere.$Order), "results");
                // }
                if($ret){
                    $param = array(
                        "service"     => "article",
                        "template"    => "detail",
                        "id"          => $ret[0]['id']
                    );
                    $nextArticle = getUrlPath($param);
                    $nextArticleTitle = $ret[0]['title'];
                }
                $huoniaoTag->assign("nextArticle", $nextArticle);
                $huoniaoTag->assign("nextArticleTitle", $nextArticleTitle);
                $huoniaoTag->assign("from", $from); //来源，用于区分是否来自APP

            }
        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost."/404.html?v=1");
        }
        return;


        //打赏结果页面
    }elseif($action == "payreturn"){
        global $dsql;

        if(!empty($ordernum)){

            //根据支付订单号查询支付结果
            $archives = $dsql->SetQuery("SELECT r.`ordernum`, r.`aid`, r.`date`, r.`state`, l.`amount` FROM `#@__pay_log` l LEFT JOIN `#@__member_reward` r ON r.`ordernum` = l.`body` WHERE r.`module` = 'article' AND l.`ordernum` = '$ordernum'");
            $payDetail  = $dsql->dsqlOper($archives, "results");
            if($payDetail){

                $title = "";
                $sql = $dsql->SetQuery("SELECT `title` FROM `#@__articlelist_all` WHERE `id` = ".$payDetail[0]['aid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $title = $ret[0]['title'];
                }

                $param = array(
                    "service"     => "article",
                    "template"    => "detail",
                    "id"          => $payDetail[0]['aid']
                );
                $url = getUrlPath($param);

                $huoniaoTag->assign('state', $payDetail[0]['state']);
                $huoniaoTag->assign('ordernum', $payDetail[0]['ordernum']);
                $huoniaoTag->assign('title', $title);
                $huoniaoTag->assign('url', $url);
                $huoniaoTag->assign('date', $payDetail[0]['date']);
                $huoniaoTag->assign('amount', sprintf("%.2f", $payDetail[0]['amount']));

                //支付订单不存在
            }else{
                $huoniaoTag->assign('state', 0);
            }

        }else{
            header("location:".$cfg_secureAccess.$cfg_basehost);
            die;
        }

    }elseif($action == "pay"){
        $param = array("service" => "article");
        if(empty($ordernum)){
            header("location:".getUrlPath($param));
            die;
        }
        global $dsql;
        // 打赏
        $archives = $dsql->SetQuery("SELECT r.`ordernum`, r.`state`, r.`amount`, r.`uid` FROM `#@__member_reward` r WHERE r.`module` = 'article' AND r.`ordernum` = '$ordernum'");
        $detail  = $dsql->dsqlOper($archives, "results");
        if(!$detail){
            header("location:".getUrlPath($param)."?v=1");
            die;
        }
        $uid = $userLogin->getMemberID();
        if($uid > 0 && $uid != $detail[0]['uid']){
            header("location:".getUrlPath($param)."?v=2");
            die;
        }
        if($detail[0]['state'] == 1){
            $param = array("service" => "article", "template" => "payreturn", "ordernum" => $ordernum);
            header("location:".getUrlPath($param)."?v=3");
            die;
        }
        $huoniaoTag->assign('totalAmount', $detail[0]['amount']);
        $huoniaoTag->assign('ordernum', $detail[0]['ordernum']);

    }elseif($action == "media"){

        $huoniaoTag->assign('type', (int)$type);

    }elseif($action == "mddetail"){

        if(empty($id)){

        }

        $detailHandels = new handlers($service, "selfmediaDetail");
        $detailConfig  = $detailHandels->getHandle(array("aid" => $id));
        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){

                // global $service;
                // if($service != "member" && ($detailConfig['type'] == 3 || $detailConfig['type'] == 4) && isMobile()){
                //     global $tpl;
                //     global $templates;
                //     $templates = "zq_center.html";
                //     if(!is_file(HUONIAOROOT.$tpl.$templates)){
                //         $templates = "mddetail.html";
                //     }
                // }

                // detailCheckCity($service, $detailConfig['id'], $detailConfig['cityid'], $action);

                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }

                // 更新自媒体浏览次数
                // $sql = $dsql->SetQuery("UPDATE `#@__article_selfmedia` SET `click` = `click` + 1 WHERE `userid` = ".$detailConfig['admin']);
                // $dsql->dsqlOper($sql, "update");
            }
        }else{
            header("location:/404.html");
        }
        return;
    }elseif($action == "comdetail"){
        $id = (int)$id;

        $detailHandels = new handlers("member", "commentDetail");
        $detail  = $detailHandels->getHandle(array("id" => $id));
        if(is_array($detail) && $detail['state'] == 100){
            $detail  = $detail['info'];
            foreach ($detail as $key => $value) {
                $huoniaoTag->assign('detail_'.$key, $value);
            }
        }else{
            $param = array(
				"service" => "article",
			);
			header("location:".getUrlPath($param));
			die;
        }
    // 专题详情页
    }elseif($action == "zt_detail" || $action == "zt_detail_arc"){
        if(empty($id)){
            header("location:/404.html");
            die;
        }
        $detailHandels = new handlers($service, "zhuantiDetail");
        $detail  = $detailHandels->getHandle(array("id" => $id));
        if(is_array($detail) && $detail['state'] == 100){
            $detail  = $detail['info'];
            foreach ($detail as $key => $value) {
                $huoniaoTag->assign('detail_'.$key, $value);
            }
            // 更新浏览次数
            $sql = $dsql->SetQuery("UPDATE `#@__article_zhuanti` SET `click` = `click` + 1 WHERE `id` = ".$id);
            $dsql->dsqlOper($sql, "update");

            $huoniaoTag->assign('page', (int)$page ? (int)$page : 1);
            $huoniaoTag->assign('typeid', (int)$typeid);
        }else{
            $param = array(
                "service" => "article",
            );
            header("location:".getUrlPath($param));
            die;
        }
    // 搜索媒体号
    }elseif($action == "searchlist"){
        $type = (int)$type;
        $huoniaoTag->assign('type', $type);
        $huoniaoTag->assign('keywords', $keywords);
    // 专题列表
    }elseif($action == "zt_list"){
        $typeid = (int)$typeid;

        if($typeid){
            $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__article_zhuantipar` WHERE `id` = $typeid");
            $res = $dsql->dsqlOper($sql, "results");
            if($res){
                $huoniaoTag->assign('typename', $res[0]['typename']);
            }else{
                header("location:".getUrlPath(array("service" => "article", "template" => "zt_list")));
                die;
            }
        }
        $huoniaoTag->assign('page', (int)$page ? (int)$page : 1);
        $huoniaoTag->assign('typeid', $typeid);
        $huoniaoTag->assign('orderby', $orderby);
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
        if(!isset($param['isAjax'])){
            if(isset($smarty->tpl_vars['isAjax'])){
                $param['isAjax'] = (int)$smarty->tpl_vars['isAjax'];
            }
        }

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

            if(!is_array($moduleReturn) || $moduleReturn['state'] != 100) {
                $repeat = false;
                return '';
            }
            $moduleReturn  = $moduleReturn['info'];  //返回数据
            $pageInfo_ = $moduleReturn['pageInfo'];
            if($pageInfo_){
                //如果有分页数据则提取list键
                $moduleReturn  = $moduleReturn['list'];
                //把pageInfo定义为global变量
                global $pageInfo;
                $pageInfo = $pageInfo_;
                $smarty->assign('pageInfo', $pageInfo);
            }else{
                if(array_key_exists('list', $moduleReturn)){
                    $moduleReturn  = $moduleReturn['list'];
                }
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
