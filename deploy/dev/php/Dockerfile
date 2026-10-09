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
RUN pecl install redis-5.3.7 \
    && docker-php-ext-enable redis

# 设置工作目录
WORKDIR /var/www/html

EXPOSE 9000
CMD ["php-fpm"]
