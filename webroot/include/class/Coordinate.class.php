<?php
 
/**
 * @name Coordinate
 * @desc 坐标转换
 */
class Coordinate
{
    const x_PI = 52.35987755982988;
    const PI = 3.1415926535897932384626;
    const a = 6378245.0;
    const ee = 0.00669342162296594323;
 
    /**
     * 百度坐标系(BD-09) 转 火星坐标系(GCJ-02)
     * @param 
     * @return 
     **/
    public static function bd09ToGcj02($bd_lon, $bd_lat)
    {
        $x = $bd_lon - 0.0065;
        $y = $bd_lat - 0.006;
        $z = sqrt($x * $x + $y * $y) - 0.00002 * sin($y * self::x_PI);
        $theta = atan2($y, $x) - 0.000003 * cos($x * self::x_PI);
        $g_lon = $z * cos($theta);
        $g_lat = $z * sin($theta);
        return array('lon' => $g_lon, 'lat' => $g_lat);
    }
 
    /**
     * 火星坐标系(GCJ-02) 转 百度坐标系(BD-09)
     * 即谷歌、高德 转 百度
     * @param 
     * @return 
     **/
    public static function gcj02Tobd09($g_lon, $g_lat)
    {
        $z = sqrt($g_lon * $g_lon + $g_lat * $g_lat) + 0.00002 * sin($g_lat * self::x_PI);
        $theta = atan2($g_lat, $g_lon) + 0.000003 * cos($g_lon * self::x_PI);
        $bd_lon = $z * cos($theta) + 0.0065;
        $bd_lat = $z * sin($theta) + 0.006;
        return array('lon' => $bd_lon, 'lat' => $bd_lat);
    }
 
    /**
     * WGS84 转 GCj02
     * @param 
     * @return 
     **/
    public static function wgs84ToGcj02($w_lon, $w_lat)
    {
        $dlat = self::transFormLat($w_lon - 105.0, $w_lat - 35.0);
        $dlon = self::transFormLon($w_lon - 105.0, $w_lat - 35.0);
        $radlat = $w_lat / 180.0 * self::PI;
        $magic = sin($radlat);
        $magic = 1 - self::ee * $magic * $magic;
        $sqrtmagic = sqrt($magic);
        $dlat = ($dlat * 180.0) / ((self::a * (1 - self::ee)) / ($magic * $sqrtmagic) * self::PI);
        $dlon = ($dlon * 180.0) / (self::a / $sqrtmagic * cos($radlat) * self::PI);
        $g_lat = $w_lat + $dlat;
        $g_lon = $w_lon + $dlon;
        return array('lon' => $g_lon, 'lat' => $g_lat);
    }
 
    /**
     * GCJ02 转换为 WGS84
     * @param 
     * @return 
     **/
    public static function gcj02ToWgs84($g_lon, $g_lat)
    {
        $dlat = self::transFormLat($g_lon - 105.0, $g_lat - 35.0);
        $dlon = self::transFormLon($g_lon - 105.0, $g_lat - 35.0);
        $radlat = $g_lat / 180.0 * self::PI;
        $magic = sin($radlat);
        $magic = 1 - self::ee * $magic * $magic;
        $sqrtmagic = sqrt($magic);
        $dlat = ($dlat * 180.0) / ((self::a * (1 - self::ee)) / ($magic * $sqrtmagic) * self::PI);
        $dlon = ($dlon * 180.0) / (self::a / $sqrtmagic * cos($radlat) * self::PI);
        $w_lat = $g_lat + $dlat;
        $w_lon = $g_lon + $dlon;
        return array('lon' => $w_lon, 'lat' => $w_lat);
    }
 
    /**
     * BD09 转换为 WGS84
     * @param 
     * @return 
     **/
    public static function bd09ToWgs84($bd_lon, $bd_lat)
    {
        $gcj02 = self::bd09ToGcj02($bd_lon, $bd_lat);
        $g_lon = $gcj02['lon'];
        $g_lat = $gcj02['lat'];
        $wgs84 = self::gcj02ToWgs84($g_lon, $g_lat);
        return $wgs84;
    }
 
    /**
     * WGS84 转换为 BD09
     * @param 
     * @return 
     **/
    public static function wgs84ToBd09($w_lon,$w_lat){
        $gcj02 = self::wgs84ToGcj02($w_lon,$w_lat);
        $g_lon = $gcj02['lon'];
        $g_lat = $gcj02['lat'];
        $bd09 = self::gcj02Tobd09($g_lon,$g_lat);
        return $bd09;
    } 
 
    /**
     * 转换纬度
     * @param 
     * @return 
     **/
    protected static function transFormLat($lon, $lat)
    {
        $ret = -100.0 + 2.0 * $lon + 3.0 * $lat + 0.2 * $lat * $lat + 0.1 * $lon * $lat + 0.2 * sqrt(abs($lon));
        $ret += (20.0 * sin(6.0 * $lon * self::PI) + 20.0 * sin(2.0 * $lon * self::PI)) * 2.0 / 3.0;
        $ret += (20.0 * sin($lat * self::PI) + 40.0 * sin($lat / 3.0 * self::PI)) * 2.0 / 3.0;
        $ret += (160.0 * sin($lat / 12.0 * self::PI) + 320 * sin($lat * self::PI / 30.0)) * 2.0 / 3.0;
        return $ret;
    }
 
    /**
     * 转换经度
     * @param 
     * @return 
     **/
    protected static function transFormLon($lon, $lat)
    {
        $ret = 300.0 + $lon + 2.0 * $lat + 0.1 * $lon * $lon + 0.1 * $lon * $lat + 0.1 * sqrt(abs($lon));
        $ret += (20.0 * sin(6.0 * $lon * self::PI) + 20.0 * sin(2.0 * $lon * self::PI)) * 2.0 / 3.0;
        $ret += (20.0 * sin($lon * self::PI) + 40.0 * sin($lon / 3.0 * self::PI)) * 2.0 / 3.0;
        $ret += (150.0 * sin($lon / 12.0 * self::PI) + 300.0 * sin($lon / 30.0 * self::PI)) * 2.0 / 3.0;
        return $ret;
    }
}