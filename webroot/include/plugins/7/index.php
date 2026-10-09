<?php
require_once('../../common.inc.php');
require_once 'common.php';
$templates    = "index.html";


/*同步汽车品牌*/
$plugins_car_brandtypesql = $dsql->SetQuery("SELECT * FROM `#@__site_plugins_car_brandtype` WHERE 1=1");

$plugins_car_brandsql = $dsql->SetQuery("SELECT * FROM `#@__site_plugins_car_brand` WHERE 1=1");

$param = array();

if($action =='brandtype'){

    $oldDir = "./log";
    $newDir = HUONIAOROOT.'/uploads/car/log/';
    if(!file_exists($newDir)){
        copyDir($oldDir,$newDir);
    }
    $where = " AND `setupstate` = 0 AND `parentid` = 0 ";
    $plugins_car_brandtyperes = $dsql->dsqlOper($plugins_car_brandtypesql.$where,"results");    /*一级*/
    $brandtypesql   = $dsql->SetQuery("SELECT `id` FROM `#@__car_brandtype` WHERE 1=1");
    $brandsql       = $dsql->SetQuery("SELECT `id` FROM `#@__car_brand` WHERE 1=1");
    foreach ($plugins_car_brandtyperes as $k => $v) {

        $where0 = " AND `typename` = '".$v['typename']."' AND `parentid` = 0";
        $brandtype0res = $dsql->dsqlOper($brandtypesql.$where0,"results");
        if(!is_array($brandtype0res)){
        file_put_contents("error.txt", $brandtypesql.$where0.PHP_EOL,FILE_APPEND);

                continue;
        }

        $param['parentid']  =  0;
        $param['weight']    =  $v['weight'];
        $param['pubdate']   =  $v['pubdate'];
        $param['icon']      =  $v['icon'];
        $param['py']        =  $v['py'];
        $param['hot']       =  $v['hot'];
        $param['pinyin']    =  $v['pinyin'];
        $param['setupstate']=  $v['setupstate'];
        $param['sitepid']   = $sitepid =  $v['id'];
        if($brandtype0res){
            file_put_contents('error.txt', $brandtypesql.$where0."||".json_encode($brandtype0res).PHP_EOL,FILE_APPEND);
            $parentid  =  $brandtype0res[0]['id'];

            // rkOperation($do="1",$param);


        }else{

            $param['typename']    = $v['typename'];
            $parentid             = rkOperation($do="2",$param);

        }

        /*********************************** 二级 start *******************************************************/
        $brandtype1where             = " AND `parentid` = ".$v['id']." AND `setupstate` = 0";  /*二级*/
        $plugins_car_brandtype1res   = $dsql->dsqlOper($plugins_car_brandtypesql.$brandtype1where,"results");
        if(!is_array($plugins_car_brandtype1res)){
            file_put_contents("error.txt", $brandtypesql.$where0.PHP_EOL,FILE_APPEND);
                continue;
        }
        foreach ($plugins_car_brandtype1res as $a => $b) {
            $where1 = " AND `typename` = '".$b['typename']."' AND `parentid` = ".$parentid;
            $brandtype1res = $dsql->dsqlOper($brandtypesql.$where1,"results");
            $param1['parentid']  =  $parentid; 
            $param1['weight']    =  $b['weight'];
            $param1['pubdate']   =  $b['pubdate'];
            $param1['icon']      =  $b['icon'];
            $param1['py']        =  $b['py'];
            $param1['pinyin']    =  $b['pinyin'];
            $param1['hot']       =  $b['hot'];
            $param1['setupstate']=  $b['setupstate'];
            $param['sitepid']    = $sitepid1 =  $b['id'];
            if($brandtype1res){
                file_put_contents('error.txt', $brandtypesql.$where1."|||".json_encode($brandtype1res).PHP_EOL,FILE_APPEND);
                $parentid1 =  $brandtype1res[0]['id'];

                // rkOperation($do="1",$param1);


            }else{
                $param1['typename']    = $b['typename'];

                $parentid1             = rkOperation($do="2",$param1);

            }


            /*********************************** 三级级 start *****************************************************/
            $brandtype2where             = " AND `parentid` = ".$b['id']." AND `setupstate` = 0";  /*二级*/
            $plugins_car_brandtype2res   = $dsql->dsqlOper($plugins_car_brandtypesql.$brandtype2where,"results");
            if(!is_array($plugins_car_brandtype2res)){
                file_put_contents("error.txt", $plugins_car_brandtype2res.$brandtype2where.PHP_EOL,FILE_APPEND);
                continue;
            }
            foreach ($plugins_car_brandtype2res as $n => $m) {
                    $where2 = " AND `typename` = '".$m['typename']."' AND `parentid` = ".$parentid1;
                    $brandtype2res = $dsql->dsqlOper($brandtypesql.$where2,"results");

                    $param2['parentid']  =  $parentid1; 
                    $param2['weight']    =  $m['weight'];
                    $param2['pubdate']   =  $m['pubdate'];
                    $param2['icon']      =  $m['icon'];
                    $param2['py']        =  $m['py'];
                    $param2['pinyin']    =  $m['pinyin'];
                    $param2['hot']       =  $m['hot'];
                    $param2['setupstate']=  $m['setupstate'];
                    $param2['sitepid']   = $sitepid2 =  $m['id'];
                    if($brandtype2res){
                        file_put_contents('error.txt', $brandtypesql.$where2."||||".json_encode($brandtype2res).PHP_EOL,FILE_APPEND);
                        $parentid2 =  $brandtype2res[0]['id'];

                        // rkOperation($do="1",$param2);



                    }else{
                        
                        $param2['typename']    = $m['typename'];
                        $parentid2             = rkOperation($do="2",$param2);

                    }

                /*********************************** 车款 start *****************************************************/
                $brandwhrer = " AND `brand` = ".$m['id']." AND setupstate = 0";
                $brandres   = $dsql->dsqlOper($plugins_car_brandsql.$brandwhrer,"results");
                if(!is_array($brandres)){
                    file_put_contents("error.txt", $plugins_car_brandsql.$brandwhrer.PHP_EOL,FILE_APPEND);
                    continue;
                }
                foreach ($brandres as $o => $p) {
                    // $where3 = " AND `id` = '".$p['id']."'";
                    // $brand3res = $dsql->dsqlOper($brandsql.$where3,"results");
                    // if($brand3res){
                    //     $brandrksql = $dsql->SetQuery("UPDATE `#@__car_brand`  SET 
                    //         `title`                     = '".$p['title']."',
                    //         `logo`                      = '".$p['logo']."',
                    //         `weight`                    = '".$p['weight']."',
                    //         `logo`                      = '".$p['logo']."',
                    //         `rec`                       = '".$p['rec']."',
                    //         `pubdate`                   = '".$p['pubdate']."',
                    //         `brand`                     = '".$parentid2."',
                    //         `carsystem`                 = '".$p['carsystem']."',
                    //         `emissions`                 = '".$p['emissions']."',
                    //         `gearbox`                   = '".$p['gearbox']."',
                    //         `standard`                  = '".$p['standard']."',
                    //         `company`                   = '".$p['company']."',
                    //         `level`                     = '".$p['level']."',
                    //         `certificatebrandmodel`     = '".$p['certificatebrandmodel']."',
                    //         `transmissioncase`          = '".$p['transmissioncase']."',
                    //         `engine`                    = '".$p['engine']."',
                    //         `bodystructure`             = '".$p['bodystructure']."',
                    //         `lengthwidthheight`         = '".$p['lengthwidthheight']."',
                    //         `wheelbase`                 = '".$p['wheelbase']."',
                    //         `cargovolume`               = '".$p['cargovolume']."',
                    //         `quality`                   = '".$p['quality']."',
                    //         `intakeform`                = '".$p['intakeform']."',
                    //         `maximumhorsepower`         = '".$p['maximumhorsepower']."',
                    //         `cylinder`                  = '".$p['cylinder']."',
                    //         `fueltype`                  = '".$p['fueltype']."',
                    //         `fuelgrade`                 = '".$p['fuelgrade']."',
                    //         `fuelsupplymode`            = '".$p['fuelsupplymode']."',
                    //         `drivingmode`               = '".$p['drivingmode']."',
                    //         `assistancetype`            = '".$p['assistancetype']."',
                    //         `frontsuspensiontype`       = '".$p['frontsuspensiontype']."',
                    //         `rearsuspensiontype`        = '".$p['rearsuspensiontype']."',
                    //         `rearbraketype`             = '".$p['rearbraketype']."',
                    //         `fronttirespecification`    = '".$p['fronttirespecification']."',
                    //         `reartirespecification`     = '".$p['reartirespecification']."',
                    //         `parkingbraketype`          = '".$p['parkingbraketype']."',
                    //         `internalsetting`           = '".$p['internalsetting']."',
                    //         `securitysetting`           = '".$p['securitysetting']."',
                    //         `externalsetting`           = '".$p['externalsetting']."',
                    //         `state`                     = '".$p['state']."',
                    //         `prodate`                   = '".$p['prodate']."',
                    //         `totalprice`                = '".$p['totalprice']."'
                    //         WHERE `id`  = '".$brand3res[0]['id']."'");

                    //     $results = $dsql->dsqlOper($brandrksql,"update");

                    //     file_put_contents('error.txt', $brandsql.$where3."||||||".$brandrksql.PHP_EOL,FILE_APPEND);
                    //     $brandstatesql    = $dsql->SetQuery("UPDATE `#@__site_plugins_car_brand`  SET `setupstate` = 1  WHERE `id`  = '".$p['id']."'");
                    //     $dsql->dsqlOper($brandstatesql,"update");
                    //     if($results != "ok"){
                    //         file_put_contents("error.txt", $brandstatesql.PHP_EOL,FILE_APPEND);
                    //         continue;
                    //     }else{
                    //         $brandtypesql1    = $dsql->SetQuery("UPDATE `#@__site_plugins_car_brandtype`  SET `setupstate` = 1  WHERE `id`  = '".$p['id']."'");
                    //         $dsql->dsqlOper($brandtypesql1,"update");
                    //     }

                    // }else{
                    $brandrksql   = $dsql->SetQuery("INSERT INTO `#@__car_brand` (
                           `title`                  ,
                            `weight`                ,
                            `logo`                  ,
                            `rec`                   ,
                            `pubdate`               ,
                            `brand`                 ,
                            `carsystem`             ,
                            `emissions`             ,
                            `gearbox`               ,
                            `standard`              ,
                            `company`               ,
                            `level`                 ,
                            `certificatebrandmodel` ,
                            `transmissioncase`      ,
                            `engine`                ,
                            `bodystructure`         ,
                            `lengthwidthheight`     ,
                            `wheelbase`             ,
                            `cargovolume`           ,
                            `quality`               ,
                            `intakeform`            ,
                            `maximumhorsepower`     ,
                            `cylinder`              ,
                            `maximumtorque`         ,
                            `fueltype`              ,
                            `fuelgrade`             ,
                            `fuelsupplymode`        ,
                            `drivingmode`           ,
                            `assistancetype`        ,
                            `frontsuspensiontype`   ,
                            `rearsuspensiontype`    ,
                            `frontbraketype`        ,
                            `rearbraketype`         ,
                            `fronttirespecification`,
                            `reartirespecification` ,
                            `parkingbraketype`      ,
                            `internalsetting`       ,
                            `securitysetting`       ,
                            `externalsetting`       ,
                            `state`                 ,
                            `prodate`               ,
                            `totalprice` )VALUES(
                            '".$p['title']."',
                            '".$p['weight']."',
                            '".$p['logo']."',
                            '".$p['rec']."',
                            '".$p['pubdate']."',
                            '".$parentid2."',
                            '".$p['carsystem']."',
                            '".$p['emissions']."',
                            '".$p['gearbox']."',
                            '".$p['standard']."',
                            '".$p['company']."',
                            '".$p['level']."',
                            '".$p['certificatebrandmodel']."',
                            '".$p['transmissioncase']."',
                            '".$p['engine']."',
                            '".$p['bodystructure']."',
                            '".$p['lengthwidthheight']."',
                            '".$p['wheelbase']."',
                            '".$p['cargovolume']."',
                            '".$p['quality']."',
                            '".$p['intakeform']."',
                            '".$p['maximumhorsepower']."',
                            '".$p['cylinder']."',
                            '".$p['maximumtorque']."',
                            '".$p['fueltype']."',
                            '".$p['fuelgrade']."',
                            '".$p['fuelsupplymode']."',
                            '".$p['drivingmode']."',
                            '".$p['assistancetype']."',
                            '".$p['frontsuspensiontype']."',
                            '".$p['rearsuspensiontype']."',
                            '".$p['frontbraketype']."',
                            '".$p['rearbraketype']."',
                            '".$p['fronttirespecification']."',
                            '".$p['reartirespecification']."',
                            '".$p['parkingbraketype']."',
                            '".$p['internalsetting']."',
                            '".$p['securitysetting']."',
                            '".$p['externalsetting']."',
                            '".$p['state']."',
                            '".$p['prodate']."',
                            '".$p['totalprice']."'
                        )");
                        $results = $dsql->dsqlOper($brandrksql,"update");
                        if($results =='ok'){

                        $brandstatesql1    = $dsql->SetQuery("UPDATE `#@__site_plugins_car_brand`  SET `setupstate` = 1  WHERE `id`  = '".$p['id']."'");
                        $dsql->dsqlOper($brandstatesql1,"update");

                        }else{
                            file_put_contents("error.txt", $$brandstatesql1.PHP_EOL,FILE_APPEND);
                        }
                       
                    // }
                }

                updatestate($sitepid2);

                /*********************************** 车款 end ******************************************************/


            }

            /*********************************** 三级 end ******************************************************/

            updatestate($sitepid1);
        }

        /*********************************** 二级 end *********************************************************/

    // $sum = getUrlSum(); //总共
    // $isGet = getUrlSum2(); //已采集
    // $per = sprintf("%.4f",($isGet / $sum));
    // $per = $per * 100;
    // $per = ceil($per) . '%';
    // if(!$per){
    //     $per = '100%';
    // }

    // returnJson(['code' => 200 , 'msg' => 'success!', 'data' => $per]);
    updatestate($sitepid);
    }
    $sum = getUrlSum(); //总共
    $isGet = getUrlSum2(); //已采集
    $per = sprintf("%.4f",($isGet / $sum));
    $per = $per * 100;
    $per = ceil($per) . '%';
    if(!$per){
        $per = '100%';
        returnJson(['code' => 201 , 'msg' => 'success!', 'data' => $per]);
    }

    returnJson(['code' => 200 , 'msg' => 'success!', 'data' => $per]);

}

if($action =='getspeed'){

    $sum = getUrlSum(); //总共
    $isGet = getUrlSum2(); //已采集
    $per = sprintf("%.4f",($isGet / $sum));
    $per = $per * 100;
    $per = ceil($per) . '%';
    if(!$per){
        $per = '100%';
        returnJson(['code' => 201 , 'msg' => 'success!', 'data' => $per]);
    }

    returnJson(['code' => 200 , 'msg' => 'success!', 'data' => $per]);
}

    function rkOperation($do = "",$param = array()){
        global $dsql;
        // $field = "";
        // if($type != 1){

        //     $field = "`parentid` = ".$param['parentid'].",";
        // }
        if($do == 1){
            $updatebrandrktysql    = $dsql->SetQuery("UPDATE `#@__car_brandtype`  SET 
                `parentid`  = '".$param['parentid']."',
                `weight`    = '".$param['weight']."',
                `pubdate`   = '".$param['pubdate']."',
                `icon`      = '".$param['icon']."',
                `pinyin`    = '".$param['pinyin']."',
                `py`        = '".$param['py']."',
                `hot`       = '".$param['hot']."'
                WHERE `id`  = '".$param['id']."'");
            $results = $dsql->dsqlOper($updatebrandrktysql,"update");
            if($results!="ok"){
                
                file_put_contents("error.txt", $updatebrandrktysql.PHP_EOL,FILE_APPEND);

                return false;
            }

        }else{
            $updatebrandrktysql    = $dsql->SetQuery("INSERT INTO `#@__car_brandtype` (
                `parentid`,
                `typename`,
                `weight`,
                `pubdate`,
                `icon`,
                `pinyin`,
                `py`,
                `hot`)VALUES(
                '".$param['parentid']."',
                '".$param['typename']."',
                '".$param['weight']."',
                '".$param['pubdate']."',
                '".$param['icon']."',
                '".$param['pinyin']."',
                '".$param['py']."',
                '".$param['hot']."'
            )");
            $parentid = $dsql->dsqlOper($updatebrandrktysql,"lastid");
            if(!is_numeric($parentid)){
                file_put_contents("error.txt", $updatebrandrktysql.PHP_EOL,FILE_APPEND);
            }
            // $brandtypesql    = $dsql->SetQuery("UPDATE `#@__site_plugins_car_brandtype`  SET `setupstate` = 1  WHERE `id`  = '".$param['sitepid']."'");
            // $dsql->dsqlOper($brandtypesql,"update");

            return $parentid;
        }
    }

    function getUrlSum(){
        global $dsql;
        $sql = "select * from `#@__site_plugins_car_brand`";
        $sqls = $dsql->SetQuery($sql);
        $res = $dsql->dsqlOper($sqls, "totalCount");

        $sql1 = "select * from `#@__site_plugins_car_brandtype`";
        $sqls1 = $dsql->SetQuery($sql1);
        $res1 = $dsql->dsqlOper($sqls1, "totalCount");
        return $res+$res1;
    }
    function getUrlSum2(){
        global $dsql;
        $sql = "select * from `#@__site_plugins_car_brand` where setupstate = 1";
        $sqls = $dsql->SetQuery($sql);
        $res = $dsql->dsqlOper($sqls, "totalCount");

        $sql1 = "select * from `#@__site_plugins_car_brandtype` where setupstate = 1";
        $sqls1 = $dsql->SetQuery($sql1);
        $res1 = $dsql->dsqlOper($sqls1, "totalCount");
        return $res+$res1;
    }

    function updatestate($id)
    {
        global $dsql;

        $brandtypesql    = $dsql->SetQuery("UPDATE `#@__site_plugins_car_brandtype`  SET `setupstate` = 1  WHERE `id`  = '".$id."'");
        $results         = $dsql->dsqlOper($brandtypesql,"update");

       
    }


/*车款sql*/
$car_brandsql = $dsql->SetQuery("SELECT setupstate,count(`id`) countall FROM `#@__site_plugins_car_brand`  GROUP BY `setupstate` ");
$car_brandres = $dsql->dsqlOper($car_brandsql,"results");
if ($car_brandres) {
    $countbrand         =  array_combine(array_column($car_brandres, 'setupstate'), array_column($car_brandres, 'countall'));
}
$state0coutnall     =  $countbrand[0]!='' ? $countbrand[0] : 0;
$state1coutnall     =  $countbrand[1]!='' ? $countbrand[1] : 0;

/*品牌*/
$car_brandtypesql = $dsql->SetQuery("SELECT setupstate,count(`id`) countall FROM `#@__site_plugins_car_brandtype`  GROUP BY `setupstate` ");
$car_brandtyperes = $dsql->dsqlOper($car_brandtypesql,"results");
if($car_brandtyperes){

    $countbrandtype   =  array_combine(array_column($car_brandtyperes, 'setupstate'), array_column($car_brandtyperes, 'countall'));
}
$state0coutnallty =  $countbrandtype[0]!='' ? $countbrandtype[0] : 0;
$state1coutnallty =  $countbrandtype[1]!='' ? $countbrandtype[1] : 0;

/*车款*/
$huoniaoTag->assign('state1coutnall', $state1coutnall);
$huoniaoTag->assign('state0coutnall', $state0coutnall);

/*品牌*/

$huoniaoTag->assign('state1coutnallty', $state1coutnallty);
$huoniaoTag->assign('state0coutnallty', $state0coutnallty);

$huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
$tpl                      = dirname(__FILE__) . "/tpl";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$huoniaoTag->display($templates);
