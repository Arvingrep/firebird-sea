<?php
/**
*   解析 视频信息 类
*
*   支持 优酷, 腾讯，爱奇艺
**/


class videoInfo{

    // 超时时间
    var $timeout = 5;

    /**
    *   解析视频
    *   返回值 数组 or false
    **/
    function parse( $url ) {

        //如果用的iframe，直接取iframe的src
        if(strstr($url, "<iframe")){
          preg_match('/<iframe[^>]*\s+src=[\'"]([^\'"]*)[\'"][^>]*>/is', $url, $matched);
          return $matched[1];
        }

        $arr = parse_url( $url );
        if ( empty( $arr['host'] ) ) {
            return false;
        }
        $host = strtolower( preg_replace( '/.*(?:$|\.)(\w+(?:\.(?:com|net|org|co|info)){0,1}\.[a-z]+)$/iU', '$1', $arr['host'] ) );
        if ( $host == 'youku.com' ) {
            return $this->youku( $url );
        }

        if ( $host == 'qq.com' ) {
            return $this->qq( $url );
        }

        if ( $host == 'iqiyi.com' ) {
            return $this->iqiyi( $url );
        }

        return false;
    }



    /**
    *   优酷的
    *   返回值 false array
    **/
    function youku( $url ) {
        if ( !$url ) {
            return false;
        }

        if ( !preg_match( '/^[0-9a-z_-]+$/i', $url ) ) {
            if ( !preg_match( '/^(http|https)\:\/\/v\.youku\.com\/v_show\/id_([0-9a-z_-]+)/i', $url, $match ) && !preg_match( '/^(http|https)\:\/\/player\.youku\.com\/player\.php[0-9a-z\/_-]*\/sid\/([0-9a-z_-]+)/i', $url, $match ) ) {
                return false;
            }
            return 'http://player.youku.com/embed/' . $match[count($match) - 1];
        }

        return false;
    }

    /**
    *   腾讯的
    *   返回值 false array
    **/
    function qq( $url ) {
        if ( !$url ) {
            return false;
        }

        if ( !preg_match( '/^[0-9a-z_-]+$/i', $url ) ) {
            if ( !preg_match( '/^(http|https)\:\/\/v\.qq\.com\/x\/cover\/([0-9a-z_-]+)\/([0-9a-z_-]+)/i', $url, $match ) && !preg_match( '/^(http|https)\:\/\/v\.qq\.com\/x\/cover\/([0-9a-z_-]+)/i', $url, $match ) ) {
                return false;
            }
            return 'https://v.qq.com/iframe/player.html?vid=' . $match[count($match) - 1] . '&tiny=0&auto=0';
        }

        return false;
    }

    /**
    *   爱奇艺的
    *   返回值 false array
    **/
    function iqiyi( $url ) {
        if ( !$url ) {
            return false;
        }

        return false;
    }

}
