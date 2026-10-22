FROM php:7.4-fpm-alpine

# 安装编译依赖与运行库
RUN apk add --no-cache \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    bash \
    autoconf \
    g++ \
    make

# 安装 PHP 核心扩展
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd mysqli pdo_mysql bcmath zip opcache

# 安装 Redis 扩展
# 注：php:7.4 自带的 PEAR 客户端与新 PECL REST 不兼容（channel 正常但报 "No releases available"），
# 改为直接下载 tgz 安装；curl 依赖已在上方 apk 安装。
RUN curl -fsSL https://pecl.php.net/get/redis-5.3.7.tgz -o /tmp/redis.tgz \
    && pecl install /tmp/redis.tgz \
    && docker-php-ext-enable redis \
    && rm -f /tmp/redis.tgz

# 安装火鸟加密内核 Loader（x86-64，需 --platform linux/amd64）
# license 路径与生产不同：生产源码烤进 /var/www/html/，本地 dev 是挂载 webroot 到 /var/www/html/webroot
COPY webroot/huoniao.so /usr/local/lib/php/extensions/no-debug-non-zts-20190902/huoniao.so
RUN { \
        echo 'extension=huoniao.so'; \
        echo 'swoole_loader.license_files=/var/www/html/webroot/huoniao'; \
    } > /usr/local/etc/php/conf.d/docker-php-ext-swoole_loader.ini

# 设置工作目录
WORKDIR /var/www/html

EXPOSE 9000
CMD ["php-fpm"]
