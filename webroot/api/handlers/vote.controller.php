<?php

/**
 * huoniaoTag模板标签函数插件-投票模块
 *
 * @param $params array 参数集
 * @return array
 */
function vote($params, $content = "", &$smarty = array(), &$repeat = array()){
    extract ($params);
    $service = "vote";
    if(empty($action)) return '';
    global $huoniaoTag;

    //获取指定ID的详细信息
    if($action == "detail"){
        $detailHandels = new handlers($service, $action);
        $detailConfig  = $detailHandels->getHandle($id);

        $orderby = empty($orderby) ? 0 : $orderby;
        $huoniaoTag->assign('orderby', $orderby);

        $page = empty($page) ? 1 : $orderby;
        $huoniaoTag->assign('page', $page);
        // print_r($detailConfig);
        // die;

        if(is_array($detailConfig) && $detailConfig['state'] == 100){
            $detailConfig  = $detailConfig['info'];
            if(is_array($detailConfig)){

                detailCheckCity("vote", $detailConfig['id'], $detailConfig['cityid']);

                //输出详细信息
                foreach ($detailConfig as $key => $value) {
                    $huoniaoTag->assign('detail_'.$key, $value);
                }

                //更新阅读次数
                global $dsql;
                $sql = $dsql->SetQuery("UPDATE `#@__".$service."_list` SET `click` = `click` + 1 WHERE `id` = ".$id);
                $dsql->dsqlOper($sql, "update");

            }
        }else{
            header("location:".$cfg_basehost."/404.html");
        }

        return;


    // 发布信息
    }elseif($action == "fabu"){
        //输出分类字段内容
        global $userLogin;
        $userid = $userLogin->getMemberID();

        if($userid != -1){
            //修改信息
            if($id){

                $detailHandels = new handlers($service, "detail");
                $detailConfig  = $detailHandels->getHandle($id);

                if(is_array($detailConfig) && $detailConfig['state'] == 100){
                    $detailConfig  = $detailConfig['info'];
                    if(is_array($detailConfig)){

                        if($userid != $detailConfig['admin']){
                            header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
                            die;
                        }
                        foreach ($detailConfig as $key => $value) {
                            $huoniaoTag->assign('detail_'.$key, $value);
                        }
                    }
                }else{
                    header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html');
                    die;
                }

            }
        }
    } elseif($action == "search"){
    	$data = $_GET['data'];
		if(!empty($data)){

			$data = explode("-", $data);
			$state  = $data[0];
			$page      = (int)$data[2];
		}
		$huoniaoTag->assign('state', $state);
		$huoniaoTag->assign('page', $page);
		$huoniaoTag->assign('orderby', $orderby);
		$huoniaoTag->assign('keywords', $keywords);
		return;
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

        $moduleReturn  = $moduleHandels->getHandle($param);
        // print_r($moduleReturn);

        //只返回数据统计信息
        if($pageData == 1){
            if(!is_array($moduleReturn) || $moduleReturn['state'] != 100){
                $pageInfo_ = array("totalCount" => 0, "gray" => 0, "audit" => 0, "refuse" => 0, "expire" => 0);
            }else{
                $moduleReturn  = $moduleReturn['info'];  //返回数据
                $pageInfo_ = $moduleReturn['pageInfo'];
            }
            $smarty->block_data[$dataindex] = array($pageInfo_);

        //正常返回
        }else{
            global $pageInfo;
            $pageInfo = array();
            if(!is_array($moduleReturn) || $moduleReturn['state'] != 100) return '';
            $moduleReturn  = $moduleReturn['info'];  //返回数据
            $pageInfo_ = $moduleReturn['pageInfo'];
            if($pageInfo_){
                //如果有分页数据则提取list键
                $moduleReturn  = $moduleReturn['list'];
                //把pageInfo定义为global变量
                $pageInfo = $pageInfo_;
            }
            $smarty->assign('pageInfo', $pageInfo);

            $smarty->block_data[$dataindex] = $moduleReturn;  //存储数据

        }
    }

    //果没有数据，直接返回null,不必再执行了
    if(!$smarty->block_data[$dataindex]) {
        $repeat = false;
        return '';
    }

    //一条数据出栈，并把它指派给$return，重复执行开关置位1
    if(list($key, $item) = each($smarty->block_data[$dataindex])){
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
