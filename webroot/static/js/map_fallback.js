/**
 * 火鸟系统地图安全降级桩 (Map Safe Fallback Stub)
 * 当系统未配置商业地图 AK/Key 时，自动拦截第三方地图报错弹窗，并提供安全 Mock 对象，防止前端 JS 崩溃
 */
(function(window) {
    // 百度地图全局兼容桩
    window.BMAP_NORMAL_MAP = 1;
    window.BMAP_HYBRID_MAP = 2;
    window.BMAP_PERSPECTIVE_MAP = 3;
    window.BMAP_STATUS_SUCCESS = 0;
    
    function DummyMap() {
        return {
            centerAndZoom: function() { return this; },
            enableScrollWheelZoom: function() { return this; },
            disableScrollWheelZoom: function() { return this; },
            addControl: function() { return this; },
            removeControl: function() { return this; },
            addOverlay: function() { return this; },
            removeOverlay: function() { return this; },
            clearOverlays: function() { return this; },
            openInfoWindow: function() { return this; },
            closeInfoWindow: function() { return this; },
            setCenter: function() { return this; },
            setZoom: function() { return this; },
            getZoom: function() { return 15; },
            getCenter: function() { return { lng: 120.9842, lat: 14.5995 }; },
            addEventListener: function() {},
            removeEventListener: function() {}
        };
    }

    window.BMap = window.BMap || {
        Map: DummyMap,
        Point: function(lng, lat) { return { lng: parseFloat(lng) || 120.9842, lat: parseFloat(lat) || 14.5995 }; },
        Marker: function(pt) { return { setPosition: function() {}, addEventListener: function() {} }; },
        InfoWindow: function(content) { return { setContent: function() {} }; },
        MapTypeControl: function() {},
        NavigationControl: function() {},
        ScaleControl: function() {},
        OverviewMapControl: function() {},
        Size: function(w, h) { return { width: w, height: h }; },
        Icon: function(url, size) { return { url: url, size: size }; },
        Geolocation: function() {
            return {
                getCurrentPosition: function(callback) {
                    if (typeof callback === 'function') {
                        callback({ point: { lng: 120.9842, lat: 14.5995 }, status: 0 });
                    }
                }
            };
        },
        Geocoder: function() {
            return {
                getPoint: function(addr, callback) {
                    if (typeof callback === 'function') {
                        callback({ lng: 120.9842, lat: 14.5995 });
                    }
                },
                getLocation: function(pt, callback) {
                    if (typeof callback === 'function') {
                        callback({ address: 'Manila, Philippines', point: pt });
                    }
                }
            };
        }
    };

    // Google Maps 兼容桩
    window.google = window.google || {
        maps: {
            Map: DummyMap,
            LatLng: function(lat, lng) {
                return {
                    lat: function() { return parseFloat(lat) || 14.5995; },
                    lng: function() { return parseFloat(lng) || 120.9842; }
                };
            },
            Marker: function() { return { setMap: function() {}, setPosition: function() {} }; },
            InfoWindow: function() { return { open: function() {}, close: function() {} }; },
            places: {
                Autocomplete: function() { return { addListener: function() {} }; }
            }
        }
    };

    // 高德地图兼容桩
    window.AMap = window.AMap || {
        Map: DummyMap,
        LngLat: function(lng, lat) { return { getLng: function(){return lng;}, getLat: function(){return lat;} }; },
        Marker: function() { return { setMap: function() {} }; }
    };
})(window);
