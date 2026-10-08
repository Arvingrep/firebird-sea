<?php

// 只能手动新窗口执行
if(defined('HUONIAOINC')){
    return;
}
//系统核心配置文件
require_once(dirname(__FILE__).'/../common.inc.php');
$user = $userLogin->getUserID();

?>
<html>
<head>
<title>商城SKU转换</title>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8">
</head>
<body>
<h1 style="padding:50px 0;text-align:center;">商城SKU转换</h1>

<?php
set_time_limit(0);

if($user > 0){
    if($_GET['confirm']==1){
        $method = $_GET['method'] ?? "filed";
        //转换filed
        if($method=="filed"){
            //取出所有商品
            $page = $_GET['page'] ?? 1;
            $pageSize = $_GET['pageSize'] ?? 10;
            $sql = $dsql::SetQuery("select `id`,`speFiled`,`speCustom`,`specification` from `#@__shop_product` where `speFiled`!='' and `speFiled`!='a:0:{}'");
            $pageObj = $dsql->getPage($page,$pageSize,$sql);
            foreach ($pageObj['list'] as $item){
                $_POST['id'] = $item['id'];
                $sql = $dsql::SetQuery("select * from `#@__shop_good_spe` where `gid`={$_POST['id']} and `del`=0 and `type`='system'");
                $speFiled_a = $dsql->getArrList($sql);
                //铺平speFiled_a
                $speFiled_a_p = array();
                foreach ($speFiled_a as $kkkk=> $iii){
                    $speFiled_a_p[] = array("parent_id"=>$iii['parent_id'],"name"=>$iii['name']);
                }
                $speFiled = $item['speFiled'];
                $speFiled_n = unserialize($speFiled) ?: array(); //新speids
                foreach ($speFiled_n as $k => $temp_i){
                    $temp_kk = array();
                    foreach ($temp_i as $kk=> $temp_ii){
                        $temp_ii = substr($temp_ii,strlen("custom_"));
                        $temp_ii = explode("_",$temp_ii);
                        array_shift($temp_ii);
                        $temp_ii = join("_",$temp_ii);
                        $temp_kk[$kk] = $temp_ii;
                    }
                    $speFiled_n[$k] = $temp_kk;
                }
                //铺平speFiled_n
                $speFiled_n_p = array();
                foreach ($speFiled_n as $kkkk => $iii){
                    foreach ($iii as $jjj){
                        $speFiled_n_p[] = array("parent_id"=>$kkkk,"name"=>$jjj);
                    }
                }
                //找出所有已删除的
                $delSpes = array();
                $addSpes = array();
                $delRes = array();
                //遍历旧的，如果不在新的里，就说明已经删除
                foreach ($speFiled_a_p as $spe_i){
                    if(!in_array($spe_i,$speFiled_n_p)){
                        $sql = $dsql::SetQuery("update `#@__shop_good_spe` set `del`=1 where `gid`={$_POST['id']} and `name`='{$spe_i['name']}' and `parent_id`={$spe_i['parent_id']} and `type`='system' and `del`=0");
                        $delRes[$spe_i['parent_id']."_".$spe_i['name']] = $dsql->update($sql);
                    }
                }
                $sql = $dsql::SetQuery("select `userid` from `#@__shop_store` s,`#@__shop_product` p where s.`id`=p.`store`");
                $suid = $dsql->getOne($sql);
                //遍历新的，如果不在旧的里，旧说明是新增
                foreach ($speFiled_n_p as $spe_i){
                    if(!in_array($spe_i,$speFiled_a_p)){
                        $sql = $dsql::SetQuery("insert into `#@__shop_good_spe`(`gid`,`suid`,`type`,`name`,`parent_id`) values({$_POST['id']},$suid,'system','{$spe_i['name']}',{$spe_i['parent_id']})");
                        $addSpes[] = $dsql->dsqlOper($sql,"lastid");
                    }
                }
            }
            //分页
            if($page < $pageObj['pageInfo']['totalPage']){
                $nextPage = $page+1;
                echo "<script>function redirect(){location='?confirm=1&page=$nextPage&method=$method'}</script>";
                echo "<script>","setTimeout(redirect, 1000)",'</script>';
                die("field转换，当前第 $page 页，每页{$pageSize}条，共{$pageObj['pageInfo']['totalPage']}页");
            }else{
                echo "<script>function redirect(){location='?confirm=1&page=1&method=custom'}</script>";
                echo "<script>","setTimeout(redirect, 1000)",'</script>';
                die("filed全部转换完毕");
            }
        }
        //转换custom
        elseif($method=="custom"){
            //取出所有商品
            $page = $_GET['page'] ?? 1;
            $pageSize = $_GET['pageSize'] ?? 10;
            $sql = $dsql::SetQuery("select `id`,`speFiled`,`speCustom`,`specification` from `#@__shop_product` where `speCustom`!='' and `speCustom`!='a:0:{}'");
            $pageObj = $dsql->getPage($page,$pageSize,$sql);
            foreach ($pageObj['list'] as $item){
                $_POST['id'] = $item['id'];
                $sql = $dsql::SetQuery("select `userid` from `#@__shop_store` s,`#@__shop_product` p where s.`id`=p.`store` and p.`id`=".$_POST['id']);
                $suid = $dsql->getOne($sql);
                $speCustom = $item['speCustom'];
                $cus_speCustom_n = unserialize($speCustom) ?: array();
                //取键名，这些都是key
                $cus_speCustom_n_p = array_keys($cus_speCustom_n); //新keys
                $sql = $dsql::SetQuery("select * from `#@__shop_good_spe` where `gid`={$_POST['id']} and `del`=0 and `type`='custom' and `parent_id`=0");
                $cus_speCusKeys_a = $dsql->getArrList($sql);
                $cus_speCusKeys_a_p = array_column($cus_speCusKeys_a,"name");
                $cus_speCusKeys_a_id = array_column($cus_speCusKeys_a,"id");
                $delCusSpes = array();
                $addCusSpes = array();
                //遍历旧的，如果不在新的里，就说明已经删除
                foreach ($cus_speCusKeys_a_p as $key => $iii){
                    if(!in_array($iii,$cus_speCustom_n_p)){
                        $sql = $dsql::SetQuery("update `#@__shop_good_spe` set `del`=1 where `gid`={$_POST['id']} and `name`='{$iii}' and `parent_id`=0 and `type`='custom' and `del`=0");
                        $delCusSpes[$iii] = $dsql->update($sql);
                        //尝试把子级全部删除
                        $sql = $dsql::SetQuery("update `#@__shop_good_spe` set `del`=1 where `gid`={$_POST['id']} and `parent_id`={$cus_speCusKeys_a_id[$key]} and `type`='custom' and `del`=0");
                        $delCusSpes[$cus_speCusKeys_a_id[$key]] = $dsql->update($sql);
                    }
                }
                //遍历新的，如果不在旧的里，旧说明是新增
                foreach ($cus_speCustom_n_p as $key => $iii){
                    if(!in_array($iii,$cus_speCusKeys_a_p)){
                        $sql = $dsql::SetQuery("insert into `#@__shop_good_spe`(`gid`,`suid`,`type`,`name`,`parent_id`) values({$_POST['id']},$suid,'custom','{$iii}',0)");
                        $addKey_i = $dsql->dsqlOper($sql,"lastid");
                        //肯定有子级增加，增加子级
                        $sons = $cus_speCustom_n[$iii];
                        $sons_id = array();
                        foreach ($sons as $son){
                            $sql = $dsql::SetQuery("insert into `#@__shop_good_spe`(`gid`,`suid`,`type`,`name`,`parent_id`) values({$_POST['id']},$suid,'custom','{$son}',$addKey_i)");
                            $sons_id[] = $dsql->dsqlOper($sql,"lastid");
                        }
                        $addCusSpes[$addKey_i] = $sons_id;
                    }
                    //否则说明不是新增，再继续校验子级是否修改
                    else{
                        //取出原子级
                        $newSons = $cus_speCustom_n[$iii];
                        //取出新子级
                        $sql = $dsql::SetQuery("select * from `#@__shop_good_spe` where `gid`={$_POST['id']} and `del`=0 and `type`='custom' and `parent_id`={$cus_speCusKeys_a_id[$key]}");
                        $oldSonsArr = $dsql->getArrList($sql);
                        $oldSons = array_column($oldSonsArr,"name");
                        $oldSons_id = array_column($oldSonsArr,"id");
                        //遍历旧的，如果不在新的里，就说明已经删除
                        foreach ($oldSons as $key2 => $jjj){
                            if(!in_array($jjj,$newSons)){
                                $sql = $dsql::SetQuery("update `#@__shop_good_spe` set `del`=1 where `gid`={$_POST['id']} and `id`={$oldSons_id[$key2]} and `type`='custom' and `del`=0");
                                $delCusSpes[$iii] = $dsql->update($sql);
                            }
                        }
                        //遍历新的，如果不在旧的里，旧说明是新增
                        foreach ($newSons as $key2=>$jjj){
                            if(!in_array($jjj,$oldSons)){
                                $sql = $dsql::SetQuery("insert into `#@__shop_good_spe`(`gid`,`suid`,`type`,`name`,`parent_id`) values({$_POST['id']},$suid,'custom','{$jjj}',{$cus_speCusKeys_a_id[$key]})");
                                $addCusSpes[$cus_speCusKeys_a_id[$key]] = $dsql->dsqlOper($sql,"lastid");
                            }
                        }
                    }
                }
            }
            //分页
            if($page < $pageObj['pageInfo']['totalPage']){
                $nextPage = $page+1;
                echo "<script>function redirect(){location='?confirm=1&page=$nextPage&method=$method'}</script>";
                echo "<script>","setTimeout(redirect, 1000)",'</script>';
                die("custom转换，当前第 $page 页，每页{$pageSize}条，共{$pageObj['pageInfo']['totalPage']}页");
            }else{
                echo "<script>function redirect(){location='?confirm=1&page=1&method=sku'}</script>";
                echo "<script>","setTimeout(redirect, 1000)",'</script>';
                die("custom全部转换完毕");
            }
        }
        //转换sku
        elseif($method=="sku"){

            $page = $_GET['page'] ?? 1;
            $pageSize = $_GET['pageSize'] ?? 10;
            $sql = $dsql::SetQuery("select `id`,`speFiled`,`speCustom`,`specification`,`promotype` from `#@__shop_product` where `specification`!=''");
            $pageObj = $dsql->getPage($page,$pageSize,$sql);

            foreach ($pageObj['list'] as $item){
                $jsonSpeOld = array();
                $sysspe = array();
                $_POST['id'] = $item['id'];
                $sql = $dsql::SetQuery("select `userid` from `#@__shop_store` s,`#@__shop_product` p where s.`id`=p.`store` and p.`id`=".$_POST['id']);
                $suid = $dsql->getOne($sql);
                //3、处理sku : $_POST['speNew']存储的是自定义键名和值
                //新的sku
                $specifival = $item['specification'];
                $newSpecifival_a = explode("|",$specifival) ?: array();
                $newSpeArr = array();
                $promotype = $item['promotype'];  //模板类型{1.团购、2.电商}
                foreach ($newSpecifival_a as $item_i){

                    $spes_i = explode(",",$item_i);
                    $spes_ii = explode("-",$spes_i[0]);
                    $mpstock = explode("#",$spes_i[1]);
                    $speids = array();
                    foreach ($spes_ii as $spes_jjj){
                        if(substr($spes_jjj,0,strlen("custom_"))=="custom_"){
                            $spes_jjj = substr($spes_jjj,strlen("custom_"));  //截取后一半
                            $cus_spe_ii = explode("_",$spes_jjj);
                            $spe_parent_id = $cus_spe_ii[0];  //id
                            $spe_parent_name = substr($spes_jjj,strlen("".$spe_parent_id)+1); //name
                            $sql = $dsql::SetQuery("select `id` from `#@__shop_good_spe` where `gid`={$_POST['id']} and `parent_id`=$spe_parent_id and `name`='$spe_parent_name' and `type`='system' and `del`=0");
                            $speids[] = "c". ($dsql->getOne($sql) ?: "");
                        }else{
                            //全自定义、配合speNew获取
                            $find_spe = false;
                            $speNew = unserialize($item['speCustom']) ?? array();
                            $speNew = $speNew ?: array();
                            foreach ($speNew as $speNewKeys_i =>$speNewVals_i){
                                //顶级
                                if(in_array($spes_jjj,$speNewVals_i)){
                                    $find_spe = true;
                                    $sql = $dsql::SetQuery("select `id` from `#@__shop_good_spe` where `gid`={$_POST['id']} and `parent_id`!=0 and `name`='$spes_jjj' and `type`='custom' and `del`=0");
                                    $speids[] = "c". ($dsql->getOne($sql) ?: "");
                                }
                            }
                            //否则是普通字段【它就是system的type表id】
                            if(!$find_spe){
                                $speids[] = $spes_jjj;
                                $sysspe[] = $spes_jjj;
                            }
                        }
                    }
                    //保存数据，判断一下，不会存在相同的spe，因为spe就是sku的组合，也是唯一的
                    $spe_i_str = join(",",$speids);
                    if(!array_key_exists($spe_i_str,$newSpeArr)){
                        $newSpeArr[$spe_i_str] = $mpstock;
                        //保存为json
                        $jsonSpeOld[] = array(
                            'speids'=>$spes_ii,
                            'mprice'=>$mpstock[0],
                            'price'=>$mpstock[1],
                            'stock'=>$mpstock[2],
                        );
                    }
                }
                //新增
                $addSkus = array();
                foreach ($newSpeArr as $key => $ii_i){
                    $sql = $dsql::SetQuery("insert into `#@__shop_good_sku`(`gid`,`suid`,`speids`,`mprice`,`price`,`stock`) values({$_POST['id']},$suid,'$key','{$ii_i[0]}','{$ii_i[1]}',{$ii_i[2]})");
                    $addSkus[] = $dsql->dsqlOper($sql,"lastid");
                }
                //尝试更新sysspe字段【直接查系统表，自动获取父级id】
                $sysspeParent = array();
                foreach ($sysspe as $sysspe_i){
                    $parentid = $dsql->getOne($dsql::SetQuery("select `parentid` from `#@__shop_type` where `id`=$sysspe_i")) ?: "";
                    $sysspe_item = $sysspeParent[$parentid] ?: array();
                    if(!in_array($sysspe_i,$sysspe_item)){
                        $sysspe_item[] = $sysspe_i;
                    }
                    $sysspeParent[$parentid] = $sysspe_item;
                }
                if(!empty($sysspeParent)){
                    $sysspeParent = json_encode($sysspeParent,256);
                    $sql = $dsql::SetQuery("update `#@__shop_product` set `sysspe`='$sysspe' where `id`={$_POST['id']}");
                    $dsql->update($sql);
                }
            }
            //分页
            if($page < $pageObj['pageInfo']['totalPage']){
                $nextPage = $page+1;
                echo "<script>function redirect(){location='?confirm=1&page=$nextPage&method=$method'}</script>";
                echo "<script>","setTimeout(redirect, 1000)",'</script>';
                die("sku转换，当前第 $page 页，每页{$pageSize}条，共{$pageObj['pageInfo']['totalPage']}页");
            }else{
                echo "<script>function redirect(){location='?confirm=1&page=1&method=huodong'}</script>";
                echo "<script>","setTimeout(redirect, 1000)",'</script>';
                die("sku全部转换完毕");
            }
        }
        //转换活动规格【如拼团】
        elseif($method=="huodong"){
            $page = $_GET['page'] ?? 1;
            $pageSize = $_GET['pageSize'] ?? 10;
            $sql = $dsql::SetQuery("select p.`id`,h.`id` 'hid',h.`pinspecification`,p.`promotype`,p.`speCustom` from `#@__shop_huodongsign` h,`#@__shop_product` p where h.`proid`=p.`id` and h.`pinspecification`!=''");
            $pageObj = $dsql->getPage($page,$pageSize,$sql);
            foreach ($pageObj['list'] as $item){
                $jsonSpeOld = array();
                //取得原数据
                $pinspecification = explode("|",$item['pinspecification']) ?: array();
                foreach ($pinspecification as $item_i){
                    $spes_i = explode(",",$item_i);
                    $spes_ii = explode("-",$spes_i[0]);
                    $mpstock = explode("#",$spes_i[1]);
                    //找出speids
                    $speids = array();
                    $promotype = $item['promotype'];
                    $gid = $item['id'];
                    $_POST['id'] = $gid;
                    foreach ($spes_ii as $spes_jjj){
                        if(substr($spes_jjj,0,strlen("custom_"))=="custom_"){
                            $spes_jjj = substr($spes_jjj,strlen("custom_"));  //截取后一半
                            $cus_spe_ii = explode("_",$spes_jjj);
                            $spe_parent_id = $cus_spe_ii[0];  //id
                            $spe_parent_name = substr($spes_jjj,strlen("".$spe_parent_id)+1); //name
                            $sql = $dsql::SetQuery("select `id` from `#@__shop_good_spe` where `gid`={$_POST['id']} and `parent_id`=$spe_parent_id and `name`='$spe_parent_name' and `type`='system' and `del`=0");
                            $speids[] = "c". ($dsql->getOne($sql) ?: "");
                        }else{
                            //全自定义、配合speNew获取
                            $find_spe = false;
                            $speNew = unserialize($item['speCustom']) ?? array();
                            $speNew = $speNew ?: array();
                            foreach ($speNew as $speNewKeys_i =>$speNewVals_i){
                                //笛卡尔积是子级，不能取顶级
                                if(in_array($spes_jjj,$speNewVals_i)){
                                    $find_spe = true;
                                    $sql = $dsql::SetQuery("select `id` from `#@__shop_good_spe` where `gid`={$gid} and `parent_id`=0 and `name`='{$speNewKeys_i}' and `type`='custom' and `del`=0");
                                    $spe_parent_ = (int)$dsql->getOne($sql); //父级id是唯一的，不可能重名，但不同父级id下的子级可能重名，所以必须先找parent
                                    $sql = $dsql::SetQuery("select `id` from `#@__shop_good_spe` where `gid`={$_POST['id']} and `parent_id`=$spe_parent_ and `name`='$spes_jjj' and `type`='custom' and `del`=0");
                                    $speids[] = "c". ($dsql->getOne($sql) ?: "");
                                    break;
                                }
                            }
                            //否则是普通字段【它就是system的type表id】
                            if(!$find_spe){
                                $speids[] = $spes_jjj;
                            }
                        }
                    }
                    //找出sku
                    $spe_i_str = join(",",$speids);
                    $sql = $dsql::SetQuery("select `id` from `#@__shop_good_sku` where `gid`=$gid and `speids`='$spe_i_str'");
                    $sku = $dsql->getOne($sql) ?: 0;
                    //获取sku详情
                    require_once(HUONIAOROOT."/api/handlers/shop.class.php");
                    $shop = new shop();
                    $skuDetail = $shop->getSkuDetail($sku);
                    if(is_array($skuDetail) && !empty($skuDetail)){
                        $speDetail = $skuDetail['speDetail'];
                        $speids = array_column($speDetail,"id");
                        $speNames = array_column($speDetail,"name");
                        //添加到json中
                        $jsonSpeOld[] = array(
                            'id'=>$sku,
                            "spe"=>join(",",$speids),
                            "name"=>$speNames,
                            'mprice'=>$mpstock[0],
                            'price'=>$mpstock[1],
                            'stock'=>$mpstock[2],
                        );
                    }
                }
                //更新原spe字段
                if(!empty($jsonSpeOld)){
                    $jsonSpeOldStr = json_encode($jsonSpeOld,256);
                    $sql = $dsql::SetQuery("update `#@__shop_huodongsign` set `pinspecification`='$jsonSpeOldStr' where `id`={$item['hid']}");
                    $dsql->update($sql);
                }
            }
            //分页
            if($page < $pageObj['pageInfo']['totalPage']){
                $nextPage = $page+1;
                echo "<script>function redirect(){location='?confirm=1&page=$nextPage&method=$method'}</script>";
                echo "<script>","setTimeout(redirect, 1000)",'</script>';
                die("huodong转换，当前第 $page 页，每页{$pageSize}条，共{$pageObj['pageInfo']['totalPage']}页");
            }else{
//                die("huodong全部转换完毕，<a href='?confirm=1'>重新开始</a>");
                echo "<script>function redirect(){location='?confirm=1&method=end'}</script>";
                echo "<script>","setTimeout(redirect, 1000)",'</script>';
            }
        }
        else{
            die("sku相关全部转换完毕，请关闭脚本并且不要重复执行");
        }
    }else{
        echo '<center style="padding-top:30px;color:red;">请先备份好数据库，以免转换失败无法恢复！并且当前脚本仅执行一次而不要重复执行！<br><br><a href="?confirm=1">开始</a></center>';
    }
}else{
  echo '<script>location.href = "/";</script>';
}
?>
</body>
</html>
